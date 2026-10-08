// G-OAS reproducible entrypoint — plan §6, §16.2–§16.5.
//
// Single-writer entry that:
//   1. assigns/validates a unique `run_id`,
//   2. validates the JBR/JAR/Redocly bindings from the environment,
//   3. prepares a private external evidence root,
//   4. produces the seven bundles (via the bundler) BEFORE invoking the runner,
//   5. delegates `validate` + `generate` to `runGoas` (the only component that
//      may spawn the generator),
//   6. leaves pre/post input manifests as evidence controls.
//
// It never spawns the generator itself and never writes inside the repository.

import fs from "node:fs";
import path from "node:path";

import { loadRunProfile } from "./generation.mjs";
import { EVIDENCE_ROOT, RUN_ID_RE, prepareRunDir } from "./run-guard.mjs";

const PRIVATE_DIR_MODE = 0o700;
const PRIVATE_FILE_MODE = 0o600;
const JAVA26_RE = /(?:^|[/_.-])(?:jbr-?|jdk-?|java-?)?26(?:[/_.-]|$)/i;

function nowIso() {
  return new Date().toISOString();
}

function loadGenerationProfile() {
  try {
    const target = new URL("../config/generation-profile.json", import.meta.url);
    return JSON.parse(fs.readFileSync(target, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Assign the run id. With no argument a UTC timestamp is generated and checked
 * against the approved pattern; an explicit value that fails the pattern is
 * refused (`RUN_ID_INVALID`) rather than reused.
 */
export function assignRunId(explicit) {
  if (explicit !== undefined && explicit !== null) {
    if (typeof explicit !== "string" || !RUN_ID_RE.test(explicit)) {
      throw new Error(`RUN_ID_INVALID: ${explicit}`);
    }
    return explicit;
  }
  const runId = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  if (!RUN_ID_RE.test(runId)) throw new Error(`RUN_ID_INVALID: ${runId}`);
  return runId;
}

function assertAbsolute(value, field) {
  if (typeof value !== "string" || value.length === 0 || !path.isAbsolute(value)) {
    throw new Error(`ENV_INVALID: ${field} must be an absolute path`);
  }
}

/**
 * Validate the runtime bindings. Only absolute paths are accepted; a Java from
 * PATH/default or the forbidden Java 26 runtime is refused.
 */
export function validateEnv(env = {}) {
  const { JBR25_JAVA, JBR25_HOME, redoclyPath, jarPath } = env;
  assertAbsolute(JBR25_JAVA, "JBR25_JAVA");
  assertAbsolute(JBR25_HOME, "JBR25_HOME");
  assertAbsolute(redoclyPath, "redoclyPath");
  assertAbsolute(jarPath, "jarPath");

  if (JBR25_JAVA === "/usr/bin/java") {
    throw new Error(`ENV_INVALID: Java from PATH is forbidden: ${JBR25_JAVA}`);
  }
  if (JBR25_JAVA === "/usr/lib/jvm/default" || JBR25_JAVA.startsWith("/usr/lib/jvm/default/")) {
    throw new Error(`ENV_INVALID: default Java is forbidden: ${JBR25_JAVA}`);
  }
  if (JAVA26_RE.test(JBR25_JAVA)) {
    throw new Error(`ENV_INVALID: Java 26 is forbidden: ${JBR25_JAVA}`);
  }
  return { JBR25_JAVA, JBR25_HOME, redoclyPath, jarPath };
}

/**
 * `true` when `child` is the same path as `parent` or is strictly inside it.
 */
function isSameOrInside(child, parent) {
  const rel = path.relative(path.resolve(parent), path.resolve(child));
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

/**
 * SR67-1: resolve the realpath of the nearest EXISTING ancestor and re-attach
 * the not-yet-created suffix, so containment is evaluated against the REAL
 * filesystem location even when the destination does not exist yet and even
 * across symlinked ancestors.
 */
function realpathPreservingMissing(target) {
  const abs = path.resolve(target);
  let probe = abs;
  const suffix = [];
  while (!fs.existsSync(probe)) {
    suffix.unshift(path.basename(probe));
    const parent = path.dirname(probe);
    if (parent === probe) break;
    probe = parent;
  }
  const base = fs.existsSync(probe) ? fs.realpathSync(probe) : probe;
  return suffix.length > 0 ? path.join(base, ...suffix) : base;
}

/**
 * Refuse an evidence root that overlaps the repository in ANY direction: equal
 * to it, inside it, or an ancestor that spans it. Evidence must live strictly
 * outside the repository tree.
 *
 * SR67-1: the comparison uses REALPATHS, not lexical paths. A symlinked
 * evidence root whose target lands inside the repository must be rejected
 * before any evidence file is written.
 */
function assertEvidenceOutsideRepo(evidenceRoot, repoRoot) {
  const evidence = realpathPreservingMissing(evidenceRoot);
  const repo = realpathPreservingMissing(repoRoot);
  if (isSameOrInside(repo, evidence) || isSameOrInside(evidence, repo)) {
    throw new Error(
      `EVIDENCE_INSIDE_REPO: evidence root ${evidence} overlaps the repository ${repo}`,
    );
  }
}

/**
 * Resolve the run dir for the single-writer entrypoint.
 *
 * Fresh run: `prepareRunDir` creates it once (no-clobber, symlink and realpath
 * containment checks). A pre-existing dir is never reused blindly: it is
 * accepted only when it is a real (non-symlink) directory strictly contained
 * under the approved external evidence root. Evidence files remain no-clobber,
 * so a resumed attempt can never overwrite prior evidence.
 */
function ensureRunDir(runId, evidenceRoot) {
  const runDir = path.join(evidenceRoot, runId);
  if (!fs.existsSync(runDir)) {
    return prepareRunDir(runId, { evidenceRoot });
  }
  let stat;
  try {
    stat = fs.lstatSync(runDir);
  } catch (error) {
    throw new Error(`ENTRYPOINT_INPUT_INVALID: run dir unavailable (${error?.code ?? "UNKNOWN"})`);
  }
  if (stat.isSymbolicLink()) throw new Error(`PATH_ESCAPE runDir: ${runDir} is a symlink`);
  if (!stat.isDirectory()) {
    throw new Error(`ENTRYPOINT_INPUT_INVALID: ${runDir} is not a directory`);
  }
  if (!isSameOrInside(runDir, evidenceRoot) || path.resolve(runDir) === path.resolve(evidenceRoot)) {
    throw new Error(`PATH_ESCAPE runDir: ${runDir} is not strictly under ${evidenceRoot}`);
  }
  // SR67-1: re-check containment against the REALPATH so a resumed run dir
  // reached through a symlinked ancestor can never be accepted.
  const realRunDir = fs.realpathSync(runDir);
  const realEvidenceRoot = realpathPreservingMissing(evidenceRoot);
  if (realRunDir === realEvidenceRoot || !isSameOrInside(realRunDir, realEvidenceRoot)) {
    throw new Error(`PATH_ESCAPE runDir: ${realRunDir} is not strictly under ${realEvidenceRoot}`);
  }
  return runDir;
}

/** Exclusive owner-only write: an existing evidence file is never clobbered. */
function writeNoClobber(target, contents) {
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: PRIVATE_DIR_MODE });
  try {
    fs.writeFileSync(target, contents, { flag: "wx", mode: PRIVATE_FILE_MODE });
    return true;
  } catch (error) {
    if (error && error.code === "EEXIST") return false;
    throw error;
  }
}

/**
 * Reproducible G-OAS entrypoint.
 *
 * @param {object} options
 * @param {string} options.runId explicit run id (validated) or generated
 * @param {string} options.repoRoot repository root (products evidence boundary)
 * @param {string} options.JBR25_JAVA absolute JBR 25 `.../bin/java`
 * @param {string} options.JBR25_HOME absolute JBR 25 home
 * @param {string} options.redoclyPath absolute local Redocly CLI
 * @param {string} options.jarPath absolute OpenAPI Generator CLI JAR
 * @param {string} [options.evidenceRoot] external evidence root override
 * @param {object} options.deps `{ bundleRoots, runGoas }` injection seam
 * @returns {Promise<object>} run summary (never a G-OAS PASS claim)
 */
export async function runEntrypoint(options = {}) {
  const {
    runId,
    repoRoot,
    JBR25_JAVA,
    JBR25_HOME,
    redoclyPath,
    jarPath,
    evidenceRoot,
    snapshotRoot,
    roots,
    commonPath,
    deps = {},
  } = options;

  const resolvedRunId = assignRunId(runId);
  validateEnv({ JBR25_JAVA, JBR25_HOME, redoclyPath, jarPath });

  const { bundleRoots, runGoas } = deps;
  if (typeof bundleRoots !== "function") {
    throw new Error("ENTRYPOINT_DEP_MISSING: deps.bundleRoots is required");
  }
  if (typeof runGoas !== "function") {
    throw new Error("ENTRYPOINT_DEP_MISSING: deps.runGoas is required");
  }

  const runProfile = loadRunProfile();
  const effectiveEvidenceRoot = path.resolve(
    evidenceRoot ?? runProfile?.evidence_root ?? EVIDENCE_ROOT,
  );
  const effectiveRepoRoot = path.resolve(repoRoot ?? process.cwd());
  assertEvidenceOutsideRepo(effectiveEvidenceRoot, effectiveRepoRoot);

  // AC-T16-COMMON: when a snapshot is supplied, the shared `common.yaml` input
  // must be named explicitly; it is never inferred silently.
  const providedSnapshot = typeof snapshotRoot === "string" && snapshotRoot.length > 0;
  const providedCommon = typeof commonPath === "string" && commonPath.length > 0;
  if (providedSnapshot && !providedCommon) {
    throw new Error(
      "ENTRYPOINT_INPUT_INVALID: commonPath is required as a shared input when snapshotRoot is provided",
    );
  }

  // Single-writer ownership: the entrypoint creates the run dir exactly once
  // (prepareRunDir / guarded resume). The runner then receives the prepared
  // runDir and must NOT create it again (that was the DESTINATION_EXISTS
  // collision between entrypoint, bundler and runGoas).
  const runDir = ensureRunDir(resolvedRunId, effectiveEvidenceRoot);

  const profile = loadGenerationProfile();
  const effectiveRoots =
    Array.isArray(roots) && roots.length > 0 ? roots : (profile?.roots ?? []).map((root) => root.slug);
  const effectiveSnapshotRoot = providedSnapshot ? snapshotRoot : path.join(runDir, "snapshot");
  const effectiveCommonPath = providedCommon
    ? commonPath
    : path.join(effectiveSnapshotRoot, "api", "common.yaml");

  // Ordering contract: bundles exist BEFORE the runner is invoked.
  const bundleResult = await bundleRoots({
    redoclyPath,
    snapshotRoot: effectiveSnapshotRoot,
    runDir,
    roots: effectiveRoots,
    commonPath: effectiveCommonPath,
    runId: resolvedRunId,
  });
  const bundles = Array.isArray(bundleResult?.bundles) ? bundleResult.bundles : [];

  const manifestsDir = path.join(runDir, "manifests");
  const prePath = path.join(manifestsDir, "generator-inputs.pre.json");
  const postPath = path.join(manifestsDir, "generator-inputs.post.json");
  writeNoClobber(
    prePath,
    `${JSON.stringify(
      {
        created_at: nowIso(),
        phase: "bundle",
        run_id: resolvedRunId,
        bundles,
        bundler_manifest: bundleResult?.manifestPath ?? null,
      },
      null,
      2,
    )}\n`,
  );

  // The runner is the ONLY component that may execute the generator.
  const runResult = await runGoas({
    runId: resolvedRunId,
    repoRoot: effectiveRepoRoot,
    runDir,
    evidenceRoot: effectiveEvidenceRoot,
    profile,
    jarPath,
    javaPath: JBR25_JAVA,
    jbrHome: JBR25_HOME,
    redoclyPath,
    bundles,
    manifests: { pre: prePath },
    // §16.4 entrypoint rehearsal is `validate` + `generate` only. The static
    // check phases (matrix / MP / compile) are separate G-OAS phases and are
    // explicitly out of scope for this invocation, so they are recorded as
    // not-in-scope instead of blocking. A direct `runGoas` call (which does not
    // pass `staticChecks`) keeps the mandatory F-02 blocking behavior.
    staticChecks: false,
  });

  writeNoClobber(
    postPath,
    `${JSON.stringify(
      {
        created_at: nowIso(),
        phase: "post",
        run_id: resolvedRunId,
        bundles,
        run: runResult ?? null,
      },
      null,
      2,
    )}\n`,
  );

  return {
    run_id: resolvedRunId,
    run_dir: runDir,
    bundles,
    manifests: { pre: prePath, post: postPath },
    run: runResult ?? null,
  };
}
