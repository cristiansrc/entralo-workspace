// G-OAS orchestrator + evidence writer — plan §16.4/§16.5 (M-04/M1).
//
// Applies the existing primitives (run-guard, subprocess, generation) to a
// single-writer, sequential run: `validate` first, `generate` only if that
// `validate` exited 0 and the global deadline still holds. It writes the
// external evidence required by the plan:
//   - ${run}/manifests/generator-inputs.pre.json  (SHA-256 per bundle)
//   - ${run}/manifests/generator-inputs.post.json (drift check)
//   - ${run}/manifests/generator-toolchain.json   (JAR custody + JBR + profile)
//   - ${run}/manifests/generator-outputs.json     (per-root output inventory)
//   - ${run}/logs/generator-commands.jsonl        (argv/cwd/timestamps/exit)
//   - ${run}/generator-report.md
//
// It never writes inside the repository/product and never executes the
// generator: it only builds and runs the approved argv when invoked.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { EVIDENCE_ROOT, assertRunId, createRunLayout, prepareRunDir, writeEvidenceFile } from "./run-guard.mjs";
import { runCommand, assertCommandAllowed } from "./subprocess.mjs";
import {
  PER_ROOT_TIMEOUT_MS,
  RUN_TOTAL_TIMEOUT_MS as GENERATION_RUN_TOTAL_TIMEOUT_MS,
  buildCommands,
  assertContained,
  perRootTimeoutMs,
  loadRunProfile,
} from "./generation.mjs";
import { runMatrix, runMercadoPago } from "./matrix-mp-runner.mjs";

export const RUN_TOTAL_TIMEOUT_MS = GENERATION_RUN_TOTAL_TIMEOUT_MS; // 900000
export const RUN_CWD_PATTERN = "${run}";
export const GLOBAL_TIMEOUT_MARGIN_MS = 15000;
export const COMMANDS_LOG_RELATIVE = "logs/generator-commands.jsonl";
export const EXPECTED_MATRIX_CASE_COUNT = 27;
export const EXPECTED_MP_VALID = 4;
export const EXPECTED_MP_INVALID = 9;

const PRIVATE_DIR_MODE = 0o700;
const PRIVATE_FILE_MODE = 0o600;

function ensureDir(target) {
  fs.mkdirSync(target, { recursive: true, mode: PRIVATE_DIR_MODE });
}

function nowIso() {
  return new Date().toISOString();
}

// SEC-61-2: hash by STREAMING the file in bounded chunks instead of loading it
// entirely into memory (`readFileSync`). The digest is identical; a large input
// bundle or output artifact can no longer exhaust the heap. A synchronous read
// failure (e.g. EACCES before the stream opens) and an async stream 'error' are
// both surfaced as a rejected promise.
function sha256File(target) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    let stream;
    try {
      stream = fs.createReadStream(target);
    } catch (error) {
      reject(error);
      return;
    }
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", (error) => reject(error));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function statBytes(target) {
  return fs.statSync(target).size;
}

// SR-09: every manifest/JSON write goes through the hardened writer API
// (`assertEvidenceContained` + exclusive `wx` + controlled DESTINATION_EXISTS)
// instead of a raw `writeFileSync` with flag "w".
function writeJson(target, value, evidenceRoot) {
  const contents = `${JSON.stringify(value, null, 2)}\n`;
  writeEvidenceFile(target, contents, { evidenceRoot });
}

function expandRunPath(pattern, runDir) {
  return path.resolve(String(pattern).replace(/\$\{run\}/g, runDir));
}

/**
 * Resolve the run directory for a run.
 *
 * - No `runDir` supplied: `runGoas` is the single owner and calls
 *   `prepareRunDir` exactly once (no-clobber, symlink/realpath containment).
 * - `runDir` supplied: the entrypoint already prepared it (entrypoint→bundler→
 *   runGoas collision fix). It is never reused blindly: it must be absolute,
 *   named after the run id, strictly contained under the evidence root, an
 *   existing non-symlink directory that does not already hold a completed run.
 */
function resolveRunDir(runId, { runDir, evidenceRoot }) {
  if (runDir === undefined || runDir === null) {
    return prepareRunDir(runId, { evidenceRoot });
  }
  if (typeof runDir !== "string" || !path.isAbsolute(runDir)) {
    throw new Error("ORCHESTRATOR_INPUT_INVALID: runDir must be an absolute path");
  }
  assertRunId(runId);
  const abs = path.resolve(runDir);
  if (path.basename(abs) !== runId) {
    throw new Error("ORCHESTRATOR_INPUT_INVALID: runDir basename must equal runId");
  }
  assertContained(abs, evidenceRoot, "runDir");
  let stat;
  try {
    stat = fs.lstatSync(abs);
  } catch (error) {
    throw new Error(`ORCHESTRATOR_INPUT_INVALID: runDir unavailable (${error?.code ?? "UNKNOWN"})`);
  }
  if (stat.isSymbolicLink()) throw new Error(`PATH_ESCAPE runDir: ${abs} is a symlink`);
  if (!stat.isDirectory()) {
    throw new Error("ORCHESTRATOR_INPUT_INVALID: runDir is not a directory");
  }
  if (fs.existsSync(path.join(abs, "manifests", "generator-inputs.post.json"))) {
    throw new Error("ORCHESTRATOR_INPUT_INVALID: runDir already holds a completed run");
  }
  return abs;
}

async function collectInputs(profile, runDir) {
  const bundlesRoot = path.join(runDir, "bundles");
  const bundles = [];
  for (const root of profile.roots) {
    const absPath = expandRunPath(root.input_bundle, runDir);
    // SR-07: never hash a bundle outside `${run}/bundles`; a `../` escape is
    // rejected BEFORE any size/SHA-256 is revealed in the evidence.
    assertContained(absPath, bundlesRoot, `input ${root.slug}`);
    if (!fs.existsSync(absPath)) {
      bundles.push({ root: root.slug, path: absPath, present: false });
      continue;
    }
    bundles.push({
      root: root.slug,
      path: absPath,
      present: true,
      bytes: statBytes(absPath),
      sha256: await sha256File(absPath),
    });
  }
  return { created_at: nowIso(), bundles };
}

function inputsDrift(pre, post) {
  const key = (manifest) =>
    manifest.bundles.map((b) => `${b.root}:${b.sha256 ?? "missing"}:${b.bytes ?? "missing"}`).join("\n");
  return key(pre) !== key(post);
}

// SEC-61-4: inventory iteratively with an explicit stack so an arbitrarily deep
// output tree cannot overflow the call stack (the previous recursive walk threw
// RangeError past Node's recursion limit). Hashing stays streamed per file.
async function walkFiles(root) {
  const out = [];
  const pending = [root];
  while (pending.length > 0) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(abs);
      } else if (entry.isSymbolicLink()) {
        // F-03: never silently omit a symlink. Inventory it with its type and
        // link target (lstat semantics) so the evidence records what was there.
        let target = null;
        try {
          target = fs.readlinkSync(abs);
        } catch {
          target = null;
        }
        out.push({
          relative: path.relative(root, abs),
          type: "symlink",
          target,
        });
      } else if (entry.isFile()) {
        out.push({
          relative: path.relative(root, abs),
          type: "file",
          bytes: statBytes(abs),
          sha256: await sha256File(abs),
        });
      } else {
        // F-03: any other entry kind (FIFO, socket, device) is inventoried too,
        // never dropped without a trace.
        out.push({
          relative: path.relative(root, abs),
          type: "other",
        });
      }
    }
  }
  return out;
}

async function collectOutputs(profile, runDir) {
  const roots = [];
  for (const root of profile.roots) {
    const dir = expandRunPath(root.output_dir, runDir);
    if (!fs.existsSync(dir)) {
      roots.push({ root: root.slug, present: false, files: [] });
      continue;
    }
    roots.push({ root: root.slug, present: true, files: await walkFiles(dir) });
  }
  return { created_at: nowIso(), roots };
}

/** M-04/M1: the matrix must contain exactly the manifest-declared 27 cases. */
export function assertMatrixIntegrity(matrixResult, manifest = {}) {
  const expected = manifest?.matrix?.expected_case_count;
  if (!Number.isInteger(expected)) {
    throw new Error("MATRIX_MANIFEST_INVALID: manifest.matrix.expected_case_count is required");
  }
  const observed = matrixResult?.expected_count ?? matrixResult?.results?.length ?? 0;
  if (observed !== expected) {
    throw new Error(`RUN_INCOMPLETE matrix count ${observed} != manifest ${expected}`);
  }
  if ((matrixResult?.mismatch_count ?? 0) > 0) {
    throw new Error(`RUN_INCOMPLETE matrix mismatches ${matrixResult.mismatch_count}`);
  }
  return { expected, observed };
}

/** M-04/M1: MP observed polarity must match the manifest's 4 valid / 9 invalid. */
export function assertMercadoPagoIntegrity(mpResult, manifest = {}) {
  const spec = manifest?.mercado_pago ?? {};
  const expectedValid = Number.isInteger(spec.expected_valid) ? spec.expected_valid : EXPECTED_MP_VALID;
  const expectedInvalid = Number.isInteger(spec.expected_invalid)
    ? spec.expected_invalid
    : EXPECTED_MP_INVALID;
  const observedValid = mpResult?.observed_valid ?? 0;
  const observedInvalid = mpResult?.observed_invalid ?? 0;
  if (observedValid !== expectedValid || observedInvalid !== expectedInvalid) {
    throw new Error(
      `RUN_INCOMPLETE mercado_pago polarity ${observedValid}/${observedInvalid} != ${expectedValid}/${expectedInvalid}`,
    );
  }
  if ((mpResult?.mismatch_count ?? 0) > 0) {
    throw new Error(`RUN_INCOMPLETE mercado_pago mismatches ${mpResult.mismatch_count}`);
  }
  return { expectedValid, expectedInvalid, observedValid, observedInvalid };
}

// SR-09: the JSONL append path is no-clobber on its FIRST write per run dir
// (`wx`), then append-only; an already-present file is never silently appended.
const initializedEvidenceLogs = new Set();

/** Append one evidence row to ${run}/logs/generator-commands.jsonl. */
export function recordEvidence(runDir, record) {
  const target = path.join(runDir, COMMANDS_LOG_RELATIVE);
  ensureDir(path.dirname(target));
  const line = `${JSON.stringify({ timestamp_utc: nowIso(), ...record })}\n`;
  const key = path.resolve(target);
  if (!initializedEvidenceLogs.has(key)) {
    try {
      fs.writeFileSync(target, line, { mode: PRIVATE_FILE_MODE, flag: "wx" });
    } catch (error) {
      if (error && error.code === "EEXIST") {
        throw new Error(`DESTINATION_EXISTS: ${target}`);
      }
      throw error;
    }
    initializedEvidenceLogs.add(key);
  } else {
    fs.appendFileSync(target, line, { mode: PRIVATE_FILE_MODE });
  }
  return line.length;
}

// Blocking signals must not be masked by a later, lower-severity signal
// (reviewer finding #2): `GENERATOR_BLOCKED` (precondition/toolchain block)
// outranks `RUN_INCOMPLETE`, which outranks the initial `RUN_RECORDED`.
const SIGNAL_RANK = Object.freeze({
  RUN_RECORDED: 0,
  RUN_INCOMPLETE: 1,
  SOURCE_CHANGED: 2,
  GENERATOR_BLOCKED: 3,
  TOOLCHAIN_BLOCKED: 3,
});

/**
 * @returns {boolean} whether the effective signal actually changed. A no-op
 * escalation must never overwrite an already stronger `reason`.
 */
function escalateSignal(summary, signal, { force = false } = {}) {
  const currentRank = SIGNAL_RANK[summary.signal] ?? 0;
  const nextRank = SIGNAL_RANK[signal] ?? 0;
  if (!force && nextRank < currentRank) return false;
  const changed = summary.signal !== signal;
  summary.signal = signal;
  return changed;
}

// SR-07: a slug is a label used to build evidence file names. Even though
// `validateProfile` now rejects a hostile slug, the orchestrator never lets an
// unsanitized slug reach `path.join`, so a log path can never escape ${run}/logs.
function safeSlug(slug, index) {
  const cleaned = String(slug ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return /^[a-z0-9-]{1,64}$/.test(cleaned) ? cleaned : `root-${index}`;
}

function withSafeSlugs(profile) {
  const clone = JSON.parse(JSON.stringify(profile));
  clone.roots = (clone.roots ?? []).map((root, index) => ({
    ...root,
    slug: safeSlug(root.slug, index),
  }));
  return clone;
}

function applyStaticChecks({ engine, snapshotRoot, matrixPath, fixturesManifest, layout, evidenceRoot }) {
  const matrixResult = runMatrix({ engine, snapshotRoot, matrixPath, manifest: fixturesManifest });
  const mpResult = runMercadoPago({ engine, snapshotRoot, manifest: fixturesManifest });
  const matrix = assertMatrixIntegrity(matrixResult, fixturesManifest);
  const mercadoPago = assertMercadoPagoIntegrity(mpResult, fixturesManifest);
  const summary = { matrix, mercado_pago: mercadoPago };
  writeJson(path.join(layout.manifests, "matrix-mp.json"), summary, evidenceRoot);
  return summary;
}

// SR-01: GNU `timeout` is the real per-root deadline. When it fires it exits
// 124 with `timedOut === false` (the JS timer, set to 135 s, never runs).
function isGnuTimeout(cmd, result) {
  return Boolean(result) && cmd?.argv?.[0] === "/usr/bin/timeout" && result.exitCode === 124;
}

// Pack #57 complement / reviewer N2: `/usr/bin/timeout` exiting 124 is only a
// run-level deadline when the full per-root budget was actually consumed
// (duration). A synthetic, short 124 stays subordinate and is reported as
// VALIDATE_NOT_OK. The budget is resolved from the run profile (security N6).
function isFullBudgetDeadline(cmd, result, perRootMs = PER_ROOT_TIMEOUT_MS) {
  if (!isGnuTimeout(cmd, result)) return false;
  return Number.isFinite(result.durationMs) && result.durationMs >= perRootMs;
}

// SR-08: classify an uncaught pre-command failure into a declared signal +
// reason so the run still produces a report and a JSONL row.
function classifyPreCommandError(error) {
  const message = String(error?.message ?? error);
  // R04: failures before the run dir exists are classified too, so the caller
  // receives a controlled {signal, reason} instead of a bare stack trace.
  if (/RUN_ID_INVALID/.test(message)) return { signal: "GENERATOR_BLOCKED", reason: "RUN_ID_INVALID" };
  if (/ORCHESTRATOR_INPUT_INVALID/.test(message)) {
    return { signal: "GENERATOR_BLOCKED", reason: "ORCHESTRATOR_INPUT_INVALID" };
  }
  if (/^RUN_INCOMPLETE/.test(message)) return { signal: "RUN_INCOMPLETE", reason: "RUN_INCOMPLETE" };
  // security N1: a missing JAR custody must fail closed, distinctly.
  if (/JAR_CUSTODY_MISSING/.test(message)) {
    return { signal: "GENERATOR_BLOCKED", reason: "JAR_CUSTODY_MISSING" };
  }
  // security N3: an absent JBR home is a toolchain block, distinct from a
  // present home with a missing binary.
  if (/JBR_HOME_MISSING/.test(message)) {
    return { signal: "TOOLCHAIN_BLOCKED", reason: "JBR_HOME_MISSING" };
  }
  // R03: JBR digest mismatch/no-digest are toolchain blocks, never an invented hash.
  if (/JBR_SHA256_MISMATCH/.test(message)) {
    return { signal: "TOOLCHAIN_BLOCKED", reason: "JBR_SHA256_MISMATCH" };
  }
  if (/JBR_DIGEST_UNAVAILABLE/.test(message)) {
    return { signal: "TOOLCHAIN_BLOCKED", reason: "JBR_DIGEST_UNAVAILABLE" };
  }
  // SEC-61-1: a present-but-unreadable JBR binary is a toolchain block, checked
  // BEFORE the generic EACCES branch so it is never downgraded to a generator
  // EACCES or mistaken for a missing-custody digest outcome.
  if (/JBR_READ_BLOCKED/.test(message)) {
    return { signal: "TOOLCHAIN_BLOCKED", reason: "JBR_READ_BLOCKED" };
  }
  if (error?.code === "EEXIST" || /^DESTINATION_EXISTS/.test(message)) {
    return { signal: "GENERATOR_BLOCKED", reason: "DESTINATION_EXISTS" };
  }
  // security N4: permission errors are surfaced with their own reason instead
  // of being swallowed into TOOLCHAIN_BLOCKED/ENOENT.
  if (error?.code === "EACCES" || /EACCES/.test(message)) {
    return { signal: "GENERATOR_BLOCKED", reason: "EACCES" };
  }
  if (error?.code === "ENOENT" || /ENOENT/.test(message)) {
    return { signal: "GENERATOR_BLOCKED", reason: "TOOLCHAIN_BLOCKED" };
  }
  if (/PATH_ESCAPE/.test(message)) return { signal: "GENERATOR_BLOCKED", reason: "PATH_ESCAPE" };
  if (/TOOLCHAIN_BLOCKED/.test(message)) {
    return { signal: "TOOLCHAIN_BLOCKED", reason: "TOOLCHAIN_BLOCKED" };
  }
  if (/MATRIX_MANIFEST_INVALID/.test(message)) {
    return { signal: "GENERATOR_BLOCKED", reason: "MATRIX_MANIFEST_INVALID" };
  }
  return { signal: "GENERATOR_BLOCKED", reason: "GENERATOR_BLOCKED" };
}

/**
 * Run the approved 14 commands sequentially under the 900 s global deadline.
 * @returns {Promise<object>} run summary (never a G-OAS PASS claim).
 */
export async function runGoas(options = {}) {
  const {
    runId,
    repoRoot,
    profile,
    jarPath,
    javaPath,
    jbrHome,
    engine,
    snapshotRoot,
    matrixPath,
    fixturesManifest,
    evidenceRoot = EVIDENCE_ROOT,
    deadlineMs = RUN_TOTAL_TIMEOUT_MS,
    runProfile,
    commandRunner = runCommand,
    runDir: providedRunDir,
    staticChecks,
    manifests,
  } = options;

  let startedAt;
  let deadlineAt;
  let runDir;
  let layout;
  try {
    if (!profile) throw new Error("ORCHESTRATOR_INPUT_INVALID: profile is required");
    if (!jarPath) throw new Error("ORCHESTRATOR_INPUT_INVALID: jarPath is required");
    if (!javaPath || !jbrHome) {
      throw new Error("ORCHESTRATOR_INPUT_INVALID: javaPath and jbrHome are required");
    }

    startedAt = Date.now();
    deadlineAt = startedAt + deadlineMs;
    runDir = resolveRunDir(runId, { runDir: providedRunDir, evidenceRoot });
    layout = createRunLayout(runDir);
  } catch (error) {
    // R04: a failure before the run dir exists has no evidence target, so it is
    // surfaced as a controlled, classified error — never a bare stack trace.
    const { signal, reason } = classifyPreCommandError(error);
    const controlled = new Error(`${signal}: ${reason} (${String(error?.message ?? error)})`);
    controlled.signal = signal;
    controlled.reason = reason;
    controlled.cause = error;
    throw controlled;
  }

  const summary = {
    run_id: runId,
    run_dir: runDir,
    started_at: nowIso(),
    cwd: RUN_CWD_PATTERN,
    deadline_ms: deadlineMs,
    signal: "RUN_RECORDED",
    reason: null,
    commands: [],
    not_started: [],
    source_changed: false,
    static_checks: null,
  };

  // L2: the phase where a thrown error actually originated, so the catch records
  // the true phase instead of hardcoding `toolchain`.
  let currentPhase = "toolchain";

  const finalizeReport = () => {
    const report = [
      `# G-OAS run ${runId}`,
      "",
      `- started_at: ${summary.started_at}`,
      `- run_dir: ${runDir}`,
      `- cwd: ${RUN_CWD_PATTERN}`,
      `- deadline_ms: ${deadlineMs}`,
      `- signal: ${summary.signal}`,
      `- reason: ${summary.reason ?? "none"}`,
      `- commands_run: ${summary.commands.length}`,
      `- not_started: ${summary.not_started.length}`,
      `- source_changed: ${summary.source_changed}`,
      "",
      "This report does not close G-OAS and does not claim runtime/compile compatibility.",
      "",
    ].join("\n");
    try {
      writeEvidenceFile(path.join(runDir, "generator-report.md"), report, { evidenceRoot });
    } catch (error) {
      // R05: a report write failure is surfaced in the summary — never silently
      // swallowed — while preserving the original error message. It escalates
      // the signal only when that does not downgrade an already stronger one.
      summary.report_write_error = String(error?.message ?? error);
      escalateSignal(summary, "RUN_INCOMPLETE");
      if (!summary.reason) summary.reason = "REPORT_WRITE_FAILED";
      // security N5: persist the report write failure as durable evidence, not
      // only in the returned summary. `generator-report.md.error` would itself
      // match the failing target pattern, so the durable sink is a JSONL log.
      try {
        const errorLogPath = path.join(runDir, "logs", "generator-report-error.jsonl");
        ensureDir(path.dirname(errorLogPath));
        fs.appendFileSync(
          errorLogPath,
          `${JSON.stringify({
            timestamp_utc: nowIso(),
            run_id: runId,
            signal: "RUN_INCOMPLETE",
            reason: "REPORT_WRITE_FAILED",
            error: summary.report_write_error,
          })}\n`,
          { mode: PRIVATE_FILE_MODE },
        );
      } catch {
        // The durable sink is best-effort; it must never mask the classified run.
      }
    }
    summary.finished_at = nowIso();
    summary.duration_ms = Date.now() - startedAt;
    return summary;
  };

  // security N6: link per-root budgets to the run profile when available.
  const effectiveRunProfile = runProfile ?? loadRunProfile();

  try {
    try {
      for (const dir of [
        layout.home,
        layout.tmp,
        layout.logs,
        layout.manifests,
        layout.bundles,
        layout.generate,
        layout.snapshot,
      ]) {
        ensureDir(dir);
      }
    } catch (error) {
      // reviewer N4a / security N4: an ensureDir failure after the run dir exists
      // must still yield a classified summary and a report, not a raw throw.
      const { signal, reason } = classifyPreCommandError(error);
      const escalated = escalateSignal(summary, signal);
      if (escalated) summary.reason = reason;
      try {
        recordEvidence(runDir, {
          phase: currentPhase,
          root: null,
          run_id: runId,
          signal,
          reason,
          error: String(error?.message ?? error),
        });
      } catch {
        // Never let an evidence-write failure mask the classified signal.
      }
      return finalizeReport();
    }

    // SR-03: before building any command, corroborate the JBR java binary is
    // exactly `${jbrHome}/bin/java`; an arbitrary `*/java` is refused.
    assertCommandAllowed(javaPath, { mode: "production", jbrHome });

    // security N3: an absent JBR home is a misconfiguration and must block the
    // run upfront, distinctly from a present home with a missing binary (R02).
    if (!fs.existsSync(jbrHome)) {
      throw new Error(`TOOLCHAIN_BLOCKED: JBR_HOME_MISSING for ${jbrHome}`);
    }

    // security N1: JAR custody is mandatory; a missing digest fails closed
    // instead of silently trusting the observed artifact.
    const expectedJarSha256 = profile?.generator?.jar_sha256_custody;
    if (typeof expectedJarSha256 !== "string" || expectedJarSha256.length === 0) {
      throw new Error("JAR_CUSTODY_MISSING: profile.generator.jar_sha256_custody is required");
    }
    const observedJarSha256 = await sha256File(jarPath);

    // SR-03: record bytes + SHA-256 + declared version of the java binary.
    const javaRecord = {
      path: javaPath,
      home: jbrHome,
      version: profile?.java?.version ?? null,
      bytes: null,
      sha256: null,
    };
    try {
      javaRecord.bytes = statBytes(javaPath);
      javaRecord.sha256 = await sha256File(javaPath);
    } catch (error) {
      // SEC-61-1 / HIGH-1: ONLY a genuinely absent binary (ENOENT) may be
      // treated as absence and recorded without a digest (the
      // JBR_DIGEST_UNAVAILABLE path fails closed later). Any other read failure
      // on a present binary (EACCES/EPERM/EIO/EMFILE/...) is a toolchain block
      // and must never be swallowed into a `sha256: null` that could bypass the
      // custody gate.
      if (error && error.code === "ENOENT") {
        // java binary absent: record the path/version without a digest.
      } else {
        throw new Error(
          `TOOLCHAIN_BLOCKED: JBR_READ_BLOCKED (${error?.code ?? "UNKNOWN"}) for ${javaPath}`,
        );
      }
    }

    const toolchain = {
      run_id: runId,
      created_at: nowIso(),
      jar: { path: jarPath, bytes: statBytes(jarPath), sha256: observedJarSha256 },
      java: javaRecord,
      profile: {
        generator: profile.generator,
        global_property: profile.global_property,
        additional_properties: profile.additional_properties,
        java: profile.java,
      },
      isolation: { mechanism: "unshare --user --map-root-user --net", cwd: RUN_CWD_PATTERN },
      deadline_ms: deadlineMs,
    };
    writeJson(path.join(layout.manifests, "generator-toolchain.json"), toolchain, evidenceRoot);

    // R02: when the JBR home actually exists, the corroborated java binary must
    // exist too; a missing binary is a toolchain block with evidence. A purely
    // declarative home (absent on disk) is left to the static-only stub path.
    if (fs.existsSync(jbrHome) && !fs.existsSync(javaPath)) {
      throw new Error(`TOOLCHAIN_BLOCKED: JBR java binary missing at ${javaPath}`);
    }

    // R03: compare the JBR digest against the approved digest in the profile.
    // A mismatch is rejected; with no approved digest the run is blocked without
    // inventing a hash (JBR_DIGEST_UNAVAILABLE), never silently trusted.
    const expectedJavaSha256 =
      typeof profile?.java?.sha256_custody === "string" && profile.java.sha256_custody.length > 0
        ? profile.java.sha256_custody
        : null;
    if (javaRecord.sha256) {
      if (!expectedJavaSha256) {
        throw new Error(`TOOLCHAIN_BLOCKED: JBR_DIGEST_UNAVAILABLE for ${javaPath}`);
      }
      if (javaRecord.sha256 !== expectedJavaSha256) {
        throw new Error(
          `JBR_SHA256_MISMATCH: expected ${expectedJavaSha256} observed ${javaRecord.sha256}`,
        );
      }
    }

    if (expectedJarSha256 && observedJarSha256 !== expectedJarSha256) {
      summary.signal = "GENERATOR_BLOCKED";
      summary.reason = "JAR_SHA256_MISMATCH";
      recordEvidence(runDir, {
        phase: "toolchain",
        root: null,
        run_id: runId,
        signal: "GENERATOR_BLOCKED",
        reason: "JAR_SHA256_MISMATCH",
        expected: expectedJarSha256,
        observed: observedJarSha256,
      });
      return finalizeReport();
    }

    currentPhase = "inputs";
    const inputsPre = await collectInputs(profile, runDir);
    const preManifestPath = path.join(layout.manifests, "generator-inputs.pre.json");
    const externalPre =
      typeof manifests?.pre === "string" && manifests.pre.length > 0
        ? path.resolve(manifests.pre)
        : null;
    if (externalPre && fs.existsSync(externalPre)) {
      // The single owner (entrypoint/bundler) already wrote the pre-manifest.
      // Preserve it no-clobber; the post-manifest is still written below, so the
      // pre/post drift control is retained.
    } else {
      writeJson(preManifestPath, inputsPre, evidenceRoot);
    }

    // L2 / reviewer N4c: a buildCommands failure is attributed to its own
    // `command_build` phase. It is built before the static checks so that the
    // first blocking record of a profile failure is the command-build one.
    // SR-07: sanitize slugs before they can reach any evidence file path. The
    // direct `validateProfile` call still rejects a hostile slug; the run itself
    // is confined fail-closed by sanitising, never by joining `..`.
    currentPhase = "command_build";
    const commands = buildCommands({
      profile: withSafeSlugs(profile),
      runDir,
      jarPath,
      javaPath,
      jbrHome,
      repoRoot,
      runProfile: effectiveRunProfile,
    });
    const validateExitByRoot = new Map();
    const validateResultByRoot = new Map();

    currentPhase = "static_checks";
    if (engine && snapshotRoot && matrixPath && fixturesManifest) {
      summary.static_checks = applyStaticChecks({
        engine,
        snapshotRoot,
        matrixPath,
        fixturesManifest,
        layout,
        evidenceRoot,
      });
    } else if (staticChecks === false) {
      // The caller (entrypoint §16.4 rehearsal) explicitly declares the
      // static-check phases out of scope. Record the omission as informational
      // WITHOUT escalating the signal; a direct call keeps the F-02 block.
      summary.static_checks = {
        omitted: true,
        in_scope: false,
        reason: "STATIC_CHECKS_NOT_IN_SCOPE",
      };
      recordEvidence(runDir, {
        phase: "static_checks",
        root: null,
        run_id: runId,
        signal: "STATIC_CHECKS_OMITTED",
        in_scope: false,
        reason: "STATIC_CHECKS_NOT_IN_SCOPE",
      });
    } else {
      // F-02: static checks are mandatory and must not be skipped silently. Record
      // an explicit blocking omission signal (declared in run-profile.json) with
      // its reason, both in the summary and in the evidence log.
      summary.signal = "GENERATOR_BLOCKED";
      summary.reason = "STATIC_CHECKS_OMITTED";
      recordEvidence(runDir, {
        phase: "static_checks",
        root: null,
        run_id: runId,
        signal: "GENERATOR_BLOCKED",
        reason: "STATIC_CHECKS_OMITTED",
      });
    }

    currentPhase = "commands";
    for (const cmd of commands) {
      currentPhase = cmd.phase;
      const remaining = deadlineAt - Date.now();
      if (remaining <= 0) {
        const notStarted = { root: cmd.root, phase: cmd.phase, reason: "DEADLINE_EXCEEDED" };
        summary.not_started.push(notStarted);
        recordEvidence(runDir, {
          phase: cmd.phase,
          root: cmd.root,
          run_id: runId,
          signal: "RUN_INCOMPLETE",
          started: false,
          reason: "DEADLINE_EXCEEDED",
        });
        // R01: the global deadline respects signal precedence; it must never
        // downgrade a stronger precondition block (e.g. STATIC_CHECKS_OMITTED).
        const escalated = escalateSignal(summary, "RUN_INCOMPLETE");
        if ((escalated || summary.signal === "RUN_INCOMPLETE") && !summary.reason) {
          summary.reason = "DEADLINE_EXCEEDED";
        }
        continue;
      }
      if (cmd.phase === "generate" && validateExitByRoot.get(cmd.root) !== 0) {
        // F-04/SR-01: distinguish a validate that hit its deadline/timeout from
        // a validate that merely failed. GNU timeout exits 124 with
        // `timedOut === false`, so exit 124 under /usr/bin/timeout is a deadline
        // ONLY when the full per-root budget elapsed (reviewer N2): a short
        // synthetic 124 stays subordinate and is VALIDATE_NOT_OK.
        const validateResult = validateResultByRoot.get(cmd.root);
        const validateBudgetMs = perRootTimeoutMs(effectiveRunProfile, "validate");
        const fullBudgetDeadline = isFullBudgetDeadline(cmd, validateResult, validateBudgetMs);
        const deadlineMissed = Boolean(validateResult && (validateResult.timedOut || fullBudgetDeadline));
        const reason = deadlineMissed ? "DEADLINE_EXCEEDED" : "VALIDATE_NOT_OK";
        const notStarted = { root: cmd.root, phase: cmd.phase, reason };
        summary.not_started.push(notStarted);
        recordEvidence(runDir, {
          phase: cmd.phase,
          root: cmd.root,
          run_id: runId,
          signal: deadlineMissed ? "RUN_INCOMPLETE" : "GENERATOR_BLOCKED",
          started: false,
          reason,
        });
        if (deadlineMissed) {
          // A run-level deadline may supersede a precondition block only when the
          // full per-root budget elapsed; a synthetic JS `timedOut` stays subordinate.
          const escalated = escalateSignal(summary, "RUN_INCOMPLETE", { force: fullBudgetDeadline });
          if ((escalated || summary.signal === "RUN_INCOMPLETE") && !summary.reason) {
            summary.reason = "DEADLINE_EXCEEDED";
          }
        } else {
          // H-1/F-04 complement: a validate that failed without timing out blocks
          // the whole run with GENERATOR_BLOCKED / VALIDATE_NOT_OK; the reason is
          // paired with the signal (reviewer N1).
          const escalated = escalateSignal(summary, "GENERATOR_BLOCKED");
          if (escalated) summary.reason = reason;
        }
        continue;
      }

      // Margin keeps the GNU `timeout 120s` in charge of its own process group
      // when the global deadline is not the binding constraint (A2/H-01). The
      // per-root budget is resolved from the run profile (security N6).
      const commandBudgetMs = perRootTimeoutMs(effectiveRunProfile, cmd.phase);
      const timeoutMs = Math.min(remaining, commandBudgetMs + GLOBAL_TIMEOUT_MARGIN_MS);
      const stdoutPath = path.join(layout.logs, `${cmd.root}.${cmd.phase}.stdout.log`);
      const stderrPath = path.join(layout.logs, `${cmd.root}.${cmd.phase}.stderr.log`);
      const result = await commandRunner({
        command: cmd.argv[0],
        args: cmd.argv.slice(1),
        cwd: runDir,
        timeoutMs,
        stdoutPath,
        stderrPath,
        mode: "production",
      });

      const record = {
        phase: cmd.phase,
        root: cmd.root,
        run_id: runId,
        argv: cmd.argv,
        cwd: runDir,
        started_at: nowIso(),
        duration_ms: result.durationMs,
        timeout_ms: timeoutMs,
        exit_code: result.exitCode,
        // F-05: emit the declared per-phase signal; the raw OS signal of the child
        // is preserved separately under `os_signal`.
        signal:
          cmd.phase === "validate"
            ? "GENERATOR_VALIDATE_RECORDED"
            : "GENERATOR_GENERATE_RECORDED",
        os_signal: result.signal,
        timed_out: result.timedOut,
        spawn_error: result.spawnError,
        stdout_path: stdoutPath,
        stderr_path: stderrPath,
      };
      summary.commands.push(record);
      recordEvidence(runDir, record);

      if (cmd.phase === "validate") {
        validateExitByRoot.set(cmd.root, result.exitCode);
        validateResultByRoot.set(cmd.root, result);
      }
      if (result.timedOut || result.spawnError) {
        // security N2: a loop escalation must also set summary.reason, not just
        // the signal. A wall-clock timeout is a DEADLINE_EXCEEDED; the reason is
        // only written when it does not overwrite an already stronger block.
        const escalated = escalateSignal(summary, "RUN_INCOMPLETE");
        if ((escalated || summary.signal === "RUN_INCOMPLETE") && !summary.reason) {
          summary.reason = result.timedOut ? "DEADLINE_EXCEEDED" : "RUN_INCOMPLETE";
        }
      }
    }

    currentPhase = "snapshot";
    const inputsPost = await collectInputs(profile, runDir);
    writeJson(path.join(layout.manifests, "generator-inputs.post.json"), inputsPost, evidenceRoot);
    summary.source_changed = inputsDrift(inputsPre, inputsPost);
    if (summary.source_changed) {
      escalateSignal(summary, "SOURCE_CHANGED");
      recordEvidence(runDir, {
        phase: "snapshot",
        root: null,
        run_id: runId,
        signal: "SOURCE_CHANGED",
        reason: "generator-inputs pre != post",
      });
    }

    const outputs = await collectOutputs(profile, runDir);
    writeJson(path.join(layout.manifests, "generator-outputs.json"), outputs, evidenceRoot);
  } catch (error) {
    // SR-08: any failure in the pre-command phases (toolchain, inputs, static
    // checks) or the command loop must still leave an auditable run dir: a
    // blocking signal, a JSONL row and the report — never a bare stack trace.
    // L1: escalation respects precedence, so a caught lower-severity error can
    // never downgrade an already stronger signal; the reason follows only when
    // the effective signal actually changed.
    const { signal, reason } = classifyPreCommandError(error);
    const escalated = escalateSignal(summary, signal);
    if (escalated) summary.reason = reason;
    try {
      recordEvidence(runDir, {
        phase: currentPhase,
        root: null,
        run_id: runId,
        signal,
        reason,
        error: String(error?.message ?? error),
      });
    } catch {
      // Never let an evidence-write failure mask the classified signal.
    }
    return finalizeReport();
  }

  return finalizeReport();
}
