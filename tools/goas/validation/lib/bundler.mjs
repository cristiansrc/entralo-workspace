// G-OAS Redocly bundle adapter — plan §6, §16.2–§16.5.
//
// Produces the seven root bundles from an EXTERNAL snapshot using the locally
// installed Redocly CLI, offline / no-egress:
//   - exactly one `redocly bundle` invocation per root,
//   - `common.yaml` is documentary: it supplies schemas by resolved refs and
//     never receives a bundle,
//   - every artifact is confined to `${runDir}/bundles/<root>.yaml`,
//   - a pre-manifest with path/bytes/SHA-256 per bundle is written under
//     `${runDir}/manifests`,
//   - absolute external refs are refused and never fetched; `.invalid` hosts are
//     identifier-only; unresolved local refs are blockers.
//
// This module writes ONLY under the caller-provided `runDir` and never touches
// any source document.

import crypto from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { assertContained, loadRunProfile } from "./generation.mjs";
import { createOfflineResolver } from "./offline-refs.mjs";
import { runCommand as defaultRunCommand } from "./subprocess.mjs";
import { parseStrictYaml } from "./strict-yaml.mjs";

const localRequire = createRequire(import.meta.url);

const DEFAULT_BUNDLE_TIMEOUT_MS = 120000;
const EMPTY_SHA256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const ROOT_SLUG_RE = /^[a-z0-9][a-z0-9-]{0,63}$/;
const URI_SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
const HTTP_METHODS = new Set(["get", "put", "post", "delete", "options", "head", "patch", "trace"]);

function nowIso() {
  return new Date().toISOString();
}

/** Stream a file into a SHA-256 digest (bounded memory). */
function sha256File(target) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(target);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

/** SHA-256 of a UTF-8 string (deterministic fail-safe digest). */
function sha256String(value) {
  return crypto.createHash("sha256").update(String(value), "utf8").digest("hex");
}

/**
 * `true` when an entry exists at `target` WITHOUT following a symlink, so a
 * dangling symlink is still detected and never clobbered.
 */
function pathEntryExists(target) {
  try {
    fs.lstatSync(target);
    return true;
  } catch (error) {
    if (error && error.code === "ENOENT") return false;
    throw error;
  }
}

/**
 * HIGH-1: resolve the LOCAL Redocly version and SHA-256 digest without network
 * or a subprocess. The declared `redoclyPath` is recorded verbatim; when that
 * artifact is present its realpath is hashed. Otherwise the installed
 * `@redocly/cli` package is resolved from the local (offline) node_modules so
 * the evidence still names a concrete local version/digest.
 */
async function resolveRedoclyMetadata(redoclyPath) {
  const metadata = { path: redoclyPath, version: null, digest: null, resolved_path: null };
  let artifact = null;

  try {
    if (fs.existsSync(redoclyPath) && fs.statSync(redoclyPath).isFile()) {
      artifact = fs.realpathSync(redoclyPath);
    }
  } catch {
    artifact = null;
  }

  if (!artifact) {
    try {
      const pkgPath = localRequire.resolve("@redocly/cli/package.json");
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      if (typeof pkg.version === "string" && pkg.version.length > 0) metadata.version = pkg.version;
      const binField =
        pkg.bin && typeof pkg.bin === "object"
          ? pkg.bin.redocly ?? Object.values(pkg.bin)[0]
          : null;
      if (typeof binField === "string") {
        const candidate = path.resolve(path.dirname(pkgPath), binField);
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          artifact = fs.realpathSync(candidate);
        }
      }
    } catch {
      /* fall back to a deterministic digest below */
    }
  }

  if (!metadata.version && artifact) {
    try {
      let dir = path.dirname(artifact);
      for (let i = 0; i < 16; i += 1) {
        const candidate = path.join(dir, "package.json");
        if (fs.existsSync(candidate)) {
          const pkg = JSON.parse(fs.readFileSync(candidate, "utf8"));
          if (typeof pkg.version === "string" && pkg.version.length > 0) {
            metadata.version = pkg.version;
            break;
          }
        }
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
      }
    } catch {
      /* keep the fallback version */
    }
  }

  if (artifact && fs.existsSync(artifact)) {
    metadata.resolved_path = artifact;
    metadata.digest = await sha256File(artifact);
  } else {
    // Fail-safe: a concrete, reproducible digests of the declared identifier.
    metadata.digest = sha256String(redoclyPath);
  }
  if (!metadata.version) metadata.version = "unknown";
  return metadata;
}

/** Last path segment of a `$ref` (e.g. `Money` for `...#/components/schemas/Money`). */
function refName(ref) {
  if (typeof ref !== "string") return null;
  const hash = ref.indexOf("#");
  const fragment = hash === -1 ? ref : ref.slice(hash + 1);
  const parts = fragment.split("/").filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : null;
}

/** `true` when a `$ref` targets the documentary `common.yaml` shared input. */
function isCommonRef(ref) {
  if (typeof ref !== "string") return false;
  const filePart = ref.split("#")[0];
  return path.posix.basename(filePart) === "common.yaml";
}

/**
 * HIGH-3: the OpenAPI component buckets whose `common` reachability is tracked.
 * `securitySchemes` and `x-*` extensions are documentary and out of scope.
 */
const COMMON_COMPONENT_BUCKETS = new Set(["schemas", "parameters", "responses", "headers"]);

/**
 * HIGH-3: resolve a `$ref` to its component `bucket`+`name` so `common`
 * reachability is keyed per bucket instead of by a global last segment. A
 * `schemas.Money` definition must never satisfy a missing `parameters.Money`.
 * Returns `null` for refs outside the tracked buckets.
 *
 * @returns {{bucket:string,name:string,key:string}|null}
 */
function refComponent(ref) {
  if (typeof ref !== "string") return null;
  const hash = ref.indexOf("#");
  const fragment = hash === -1 ? "" : ref.slice(hash + 1);
  const parts = fragment.split("/").filter(Boolean);
  const index = parts.indexOf("components");
  if (index === -1 || index + 2 >= parts.length) return null;
  const bucket = parts[index + 1];
  const name = parts[index + 2];
  if (!COMMON_COMPONENT_BUCKETS.has(bucket)) return null;
  return { bucket, name, key: `${bucket}/${name}` };
}

/**
 * HIGH-3: render a `bucket/name` reachability key. Schema reachability keeps
 * the historical bare-name form (a documented compatibility contract);
 * parameters/responses/headers always carry their bucket so a same-named schema
 * can never mask them.
 */
function commonEntry(key) {
  const separator = key.indexOf("/");
  if (separator === -1) return key;
  const bucket = key.slice(0, separator);
  const name = key.slice(separator + 1);
  return bucket === "schemas" ? name : `${bucket}/${name}`;
}

/** `true` for 4xx/5xx/default response keys (error responses). */
function isErrorStatus(code) {
  const value = String(code);
  if (/^[45]\d\d$/.test(value)) return true;
  if (/^[45]xx$/i.test(value)) return true;
  return /^default$/i.test(value);
}

/**
 * HIGH-2: extract the contract surface of an OpenAPI document so a source and
 * its bundle can be compared semantically: paths, methods, operationIds,
 * schemas (`$ref` targets), security requirements, error responses and
 * response headers.
 */
function extractContract(doc) {
  const report = {
    paths: [],
    methods: [],
    operationIds: [],
    schemas: [],
    security: [],
    errors: [],
    headers: [],
    commonRefs: [],
  };
  const push = (arr, value) => {
    if (value === undefined || value === null || value === "") return;
    if (!arr.includes(value)) arr.push(value);
  };

  const docPaths = doc && typeof doc.paths === "object" && doc.paths ? doc.paths : {};
  for (const routePath of Object.keys(docPaths)) {
    push(report.paths, routePath);
    const pathItem = docPaths[routePath];
    if (!pathItem || typeof pathItem !== "object") continue;
    for (const method of Object.keys(pathItem)) {
      if (!HTTP_METHODS.has(method)) continue;
      push(report.methods, method);
      const operation = pathItem[method];
      if (!operation || typeof operation !== "object") continue;
      if (typeof operation.operationId === "string") push(report.operationIds, operation.operationId);

      const security = Array.isArray(operation.security) ? operation.security : [];
      for (const requirement of security) {
        if (requirement && typeof requirement === "object") {
          for (const scheme of Object.keys(requirement)) push(report.security, scheme);
        }
      }

      const responses =
        operation.responses && typeof operation.responses === "object" ? operation.responses : {};
      for (const code of Object.keys(responses)) {
        if (isErrorStatus(code)) push(report.errors, code);
        const headers = responses[code]?.headers;
        if (headers && typeof headers === "object") {
          for (const header of Object.keys(headers)) push(report.headers, header);
        }
      }

      const refs = [];
      collectRefs(operation, refs);
      for (const ref of refs) {
        const name = refName(ref);
        if (name) push(report.schemas, name);
      }
    }
  }

  const topSecurity = Array.isArray(doc?.security) ? doc.security : [];
  for (const requirement of topSecurity) {
    if (requirement && typeof requirement === "object") {
      for (const scheme of Object.keys(requirement)) push(report.security, scheme);
    }
  }

  // HIGH-3: collect every `common.yaml` component ref in the whole document
  // (path-level parameters included), keyed by bucket+name so reachability is
  // never collapsed to a global last segment.
  const docRefs = [];
  collectRefs(doc, docRefs);
  for (const ref of docRefs) {
    if (!isCommonRef(ref)) continue;
    const component = refComponent(ref);
    if (component) push(report.commonRefs, component.key);
  }
  return report;
}

/**
 * Compare a source contract against its bundle. Any lost contract surface is a
 * drift; for scalar contract fields an added surface is also reported. Schema
 * refs are compared loss-only because a legitimate bundle inlines component
 * schemas.
 */
function compareContracts(source, bundle) {
  const drift = [];
  for (const field of ["paths", "methods", "operationIds", "security", "errors", "headers"]) {
    const missing = source[field].filter((value) => !bundle[field].includes(value));
    const added = bundle[field].filter((value) => !source[field].includes(value));
    if (missing.length > 0) drift.push({ field, kind: "missing", values: missing });
    if (added.length > 0) drift.push({ field, kind: "added", values: added });
  }
  const missingSchemas = source.schemas.filter((value) => !bundle.schemas.includes(value));
  if (missingSchemas.length > 0) drift.push({ field: "schemas", kind: "missing", values: missingSchemas });
  return drift;
}

/** Collect every `$ref` string reachable in a parsed YAML value. */
function collectRefs(node, out) {
  if (Array.isArray(node)) {
    for (const item of node) collectRefs(item, out);
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      if (key === "$ref" && typeof value === "string") out.push(value);
      else collectRefs(value, out);
    }
  }
}

/** Resolve the per-artifact bundle timeout from the run profile when present. */
function resolveBundleTimeout(timeoutMs, runProfile) {
  if (Number.isInteger(timeoutMs) && timeoutMs > 0) return timeoutMs;
  const configured = runProfile?.timeouts_ms?.bundle_per_artifact;
  if (Number.isInteger(configured) && configured > 0) return configured;
  return DEFAULT_BUNDLE_TIMEOUT_MS;
}

/**
 * Offline reference scan. Walks the root documents (and `common.yaml`, plus any
 * locally referenced file) and rejects absolute external refs. `.invalid` hosts
 * are identifier-only; any local ref whose target is missing is a blocker.
 *
 * @returns {Array<object>} unresolved local refs (empty when every ref resolved)
 */
function scanRefsOffline({ snapshotRoot, sourceDir, roots, commonPath }) {
  const root = path.resolve(snapshotRoot);
  const resolver = createOfflineResolver({
    snapshotRoot: root,
    registry: { networkPolicy: "never", byId: new Map(), byFile: new Map() },
  });
  const queue = [];
  for (const slug of roots) {
    if (slug === "common") continue;
    queue.push(path.join(sourceDir, `${slug}.yaml`));
  }
  // `common.yaml` is documentary: when a caller supplies the path but the file
  // is absent (and no root references it) it is not itself a blocker.
  if (typeof commonPath === "string" && commonPath.length > 0 && fs.existsSync(commonPath)) {
    queue.push(path.resolve(commonPath));
  }

  const seen = new Set();
  const unresolved = [];
  while (queue.length > 0) {
    const file = path.resolve(queue.shift());
    if (seen.has(file)) continue;
    seen.add(file);
    if (!fs.existsSync(file)) {
      unresolved.push({ from: file, target: file, reason: "FILE_MISSING" });
      continue;
    }

    const parsed = parseStrictYaml(fs.readFileSync(file, "utf8"), { source: file });
    if (!parsed.ok) throw new Error(`PARSE_REJECTED: ${file}`);

    const refs = [];
    collectRefs(parsed.value, refs);
    for (const ref of refs) {
      if (typeof ref !== "string" || ref.startsWith("#")) continue;
      const hashIndex = ref.indexOf("#");
      const filePart = hashIndex === -1 ? ref : ref.slice(0, hashIndex);
      // Absolute URI: offline-refs throws REF_UNRESOLVED/NETWORK_FORBIDDEN unless
      // the identifier is registered locally. Never a network request.
      const resolved = resolver.resolveSchemaRef(ref, file);
      if (URI_SCHEME_RE.test(filePart)) {
        queue.push(resolved.absPath);
        continue;
      }
      if (!fs.existsSync(resolved.absPath)) {
        unresolved.push({ from: file, ref, target: resolved.absPath, reason: "REF_UNRESOLVED" });
        continue;
      }
      queue.push(resolved.absPath);
    }
  }
  return unresolved;
}

/** Exclusive owner-only write: an existing evidence file is never clobbered. */
function writeNoClobber(target, contents) {
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  try {
    fs.writeFileSync(target, contents, { flag: "wx", mode: 0o600 });
  } catch (error) {
    if (error && error.code === "EEXIST") {
      throw new Error(`DESTINATION_EXISTS: ${target}`);
    }
    throw error;
  }
}

/**
 * Bundle the seven roots from an external snapshot, offline.
 *
 * @param {object} options
 * @param {string} options.redoclyPath absolute path to the local Redocly CLI
 * @param {string} options.snapshotRoot external snapshot root (holds `api/`)
 * @param {string} options.runDir external run directory (artifact root)
 * @param {string[]} options.roots HTTP root slugs to bundle
 * @param {string} options.commonPath documentary `common.yaml` path
 * @param {Function} [options.runCommand] production subprocess runner
 * @param {number} [options.timeoutMs] override for the per-artifact timeout
 * @param {object} [options.runProfile] parsed run profile
 * @returns {Promise<{bundles:Array<object>,manifestPath:string,commands:Array<object>,
 *   unresolvedRefs:Array<object>}>}
 */
export async function bundleRoots(options = {}) {
  const {
    redoclyPath,
    snapshotRoot,
    runDir,
    roots = [],
    commonPath,
    runCommand = defaultRunCommand,
    timeoutMs,
    runProfile,
    runId,
  } = options;

  if (typeof redoclyPath !== "string" || !path.isAbsolute(redoclyPath)) {
    throw new Error("BUNDLER_INPUT_INVALID: redoclyPath must be an absolute path");
  }
  if (typeof snapshotRoot !== "string" || snapshotRoot.length === 0) {
    throw new Error("BUNDLER_INPUT_INVALID: snapshotRoot is required");
  }
  if (typeof runDir !== "string" || !path.isAbsolute(runDir)) {
    throw new Error("BUNDLER_INPUT_INVALID: runDir must be an absolute path");
  }
  if (!Array.isArray(roots) || roots.length === 0) {
    throw new Error("BUNDLER_INPUT_INVALID: roots must be a non-empty array");
  }

  // AC-T16-COMMON: `common.yaml` is a REQUIRED shared input. It is never
  // bundled (no eighth root / no `generate`), but it must be supplied so its
  // component refs can be resolved offline and registered in the pre-manifest
  // as a documentary shared input. A missing path, and a missing/unsafe file,
  // are refused BEFORE anything is read or written (and before any Redocly
  // invocation).
  if (typeof commonPath !== "string" || commonPath.length === 0) {
    throw new Error(
      "COMMON_PATH_REQUIRED: commonPath is required as a shared (documentary) input",
    );
  }
  const commonAbs = path.resolve(commonPath);

  const snapshotAbs = path.resolve(snapshotRoot);
  const runAbs = path.resolve(runDir);
  const sourceDir = path.dirname(commonAbs);
  const bundlesDir = path.join(runAbs, "bundles");
  const manifestsDir = path.join(runAbs, "manifests");
  const logsDir = path.join(runAbs, "logs");

  // Confinement: artifacts must stay under the same external run root that holds
  // the snapshot. A `../` escape is refused before anything is written.
  assertContained(bundlesDir, path.dirname(snapshotAbs), "bundles");

  // Validate slugs and the documentary path BEFORE any document is read, so a
  // hostile `../` slug can never steer the scan outside the snapshot.
  for (const slug of roots) {
    if (slug === "common") continue;
    if (typeof slug !== "string" || !ROOT_SLUG_RE.test(slug)) {
      throw new Error(`BUNDLER_INPUT_INVALID: root slug ${JSON.stringify(slug)} is not allowed`);
    }
  }
  // AC-T16-COMMON: the documentary shared input must be a real, regular file
  // under the snapshot root. A `..` escape (or a symlinked ancestor) and a
  // symlinked / non-regular target are refused here, before the offline scan
  // and before any Redocly invocation, as controlled `COMMON_PATH_INVALID` /
  // `COMMON_MISSING` rejections.
  try {
    assertContained(commonAbs, snapshotAbs, "common");
  } catch {
    throw new Error(`COMMON_PATH_INVALID: common input is outside snapshotRoot: ${commonAbs}`);
  }
  let commonStat;
  try {
    // lstat, not stat: a symlink must be rejected rather than followed.
    commonStat = fs.lstatSync(commonAbs);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      throw new Error(`COMMON_MISSING: common input not found at ${commonAbs}`);
    }
    throw new Error(
      `COMMON_PATH_INVALID: common input unavailable (${error?.code ?? "UNKNOWN"}): ${commonAbs}`,
    );
  }
  if (commonStat.isSymbolicLink() || !commonStat.isFile()) {
    throw new Error(
      `COMMON_PATH_INVALID: common input must be a regular file (no symlink): ${commonAbs}`,
    );
  }

  const effectiveRunProfile = runProfile ?? loadRunProfile();
  const effectiveTimeout = resolveBundleTimeout(timeoutMs, effectiveRunProfile);

  const unresolvedRefs = scanRefsOffline({ snapshotRoot: snapshotAbs, sourceDir, roots, commonPath: commonAbs });
  if (unresolvedRefs.length > 0) {
    throw new Error(`REF_UNRESOLVED: ${JSON.stringify(unresolvedRefs)}`);
  }

  fs.mkdirSync(bundlesDir, { recursive: true, mode: 0o700 });
  fs.mkdirSync(manifestsDir, { recursive: true, mode: 0o700 });
  fs.mkdirSync(logsDir, { recursive: true, mode: 0o700 });

  // SR67-2: plan every root and refuse a pre-existing bundle output BEFORE any
  // Redocly invocation. `redocly bundle --output` would otherwise clobber it and
  // only later surface the collision at manifest write time.
  const plan = [];
  for (const slug of roots) {
    if (slug === "common") continue;
    if (typeof slug !== "string" || !ROOT_SLUG_RE.test(slug)) {
      throw new Error(`BUNDLER_INPUT_INVALID: root slug ${JSON.stringify(slug)} is not allowed`);
    }
    const sourcePath = path.join(sourceDir, `${slug}.yaml`);
    const outputPath = path.join(bundlesDir, `${slug}.yaml`);
    // The slug charset already blocks traversal; these are defence in depth.
    assertContained(sourcePath, snapshotAbs, `source ${slug}`);
    assertContained(outputPath, bundlesDir, `bundle ${slug}`);
    plan.push({ slug, sourcePath, outputPath });
  }
  for (const { outputPath } of plan) {
    if (pathEntryExists(outputPath)) {
      throw new Error(`DESTINATION_EXISTS: ${outputPath}`);
    }
  }

  // HIGH-1: capture the local Redocly identity once, before any invocation.
  const redoclyMeta = await resolveRedoclyMetadata(redoclyPath);

  const bundles = [];
  const commands = [];
  const blockers = [];
  const equivalenceRoots = {};
  const commonReachableAll = new Set();
  let driftDetected = false;

  for (const { slug, sourcePath, outputPath } of plan) {
    const argv = [
      "/usr/bin/timeout",
      "--signal=KILL",
      `${Math.ceil(effectiveTimeout / 1000)}s`,
      "/usr/bin/unshare",
      "--user",
      "--map-root-user",
      "--net",
      redoclyPath,
      "bundle",
      sourcePath,
      "--output",
      outputPath,
    ];
    const stdoutPath = path.join(logsDir, `${slug}.bundle.stdout.log`);
    const stderrPath = path.join(logsDir, `${slug}.bundle.stderr.log`);
    const startedAt = nowIso();

    const result = await runCommand({
      command: argv[0],
      args: argv.slice(1),
      cwd: runAbs,
      timeoutMs: effectiveTimeout,
      stdoutPath,
      stderrPath,
      mode: "production",
    });
    const finishedAt = nowIso();

    const failed = result.exitCode !== 0 || Boolean(result.timedOut) || result.spawnError != null;
    commands.push({
      phase: "bundle",
      root: slug,
      run_id: runId ?? null,
      argv,
      cwd: runAbs,
      started_at: startedAt,
      finished_at: finishedAt,
      duration_ms: result.durationMs,
      timeout_ms: effectiveTimeout,
      exit_code: result.exitCode ?? null,
      timed_out: Boolean(result.timedOut),
      spawn_error: result.spawnError ?? null,
      status: failed ? "BLOCKED" : "RECORDED",
      stdout_path: stdoutPath,
      stderr_path: stderrPath,
    });

    const present = fs.existsSync(outputPath);
    bundles.push({
      root: slug,
      path: outputPath,
      source: sourcePath,
      present,
      bytes: present ? fs.statSync(outputPath).size : 0,
      sha256: present ? await sha256File(outputPath) : EMPTY_SHA256,
    });

    // HIGH-1: a non-zero exit, a timeout or a missing bundle is persisted as a
    // blocker in the evidence artifact, not only kept in the in-memory array.
    if (failed || !present) {
      blockers.push({
        root: slug,
        phase: "bundle",
        reason: result.timedOut ? "TIMEOUT" : !present ? "BUNDLE_MISSING" : "EXIT_NONZERO",
        exit_code: result.exitCode ?? null,
        timed_out: Boolean(result.timedOut),
        spawn_error: result.spawnError ?? null,
      });
      continue;
    }

    // HIGH-2: semantic source→bundle equivalence (plan §6 step 4).
    try {
      const sourceParsed = parseStrictYaml(fs.readFileSync(sourcePath, "utf8"), { source: sourcePath });
      const bundleParsed = parseStrictYaml(fs.readFileSync(outputPath, "utf8"), { source: outputPath });
      if (!sourceParsed.ok || !bundleParsed.ok) {
        driftDetected = true;
        blockers.push({ root: slug, phase: "bundle", reason: "EQUIVALENCE_PARSE_REJECTED" });
        continue;
      }
      const sourceContract = extractContract(sourceParsed.value);
      const bundleContract = extractContract(bundleParsed.value);
      const drift = compareContracts(sourceContract, bundleContract);
      equivalenceRoots[slug] = { ...sourceContract, commonReachable: sourceContract.commonRefs.map(commonEntry) };
      for (const name of sourceContract.commonRefs) commonReachableAll.add(name);
      if (drift.length > 0) {
        driftDetected = true;
        blockers.push({ root: slug, phase: "bundle", reason: "EQUIVALENCE_DRIFT", drift });
      }
    } catch (error) {
      driftDetected = true;
      blockers.push({
        root: slug,
        phase: "bundle",
        reason: "EQUIVALENCE_UNREADABLE",
        error: String(error?.message ?? error),
      });
    }
  }

  // Plan §6 step 4 + HIGH-3: `common` reachability is keyed by component
  // bucket+name. A referenced component absent from its own bucket is a
  // blocker; a component nobody references is reported per bucket without
  // fabricating usage. A `schemas.Money` can never satisfy `parameters.Money`.
  let commonDefined = [];
  try {
    const commonParsed = parseStrictYaml(fs.readFileSync(commonAbs, "utf8"), { source: commonAbs });
    if (commonParsed.ok) {
      const components = commonParsed.value?.components;
      if (components && typeof components === "object") {
        for (const bucket of COMMON_COMPONENT_BUCKETS) {
          const bucketValue = components[bucket];
          if (bucketValue && typeof bucketValue === "object") {
            for (const name of Object.keys(bucketValue)) commonDefined.push(`${bucket}/${name}`);
          }
        }
      }
    }
  } catch {
    commonDefined = [];
  }
  const commonDefinedSet = new Set(commonDefined);
  const missingCommon = [...commonReachableAll].filter((key) => !commonDefinedSet.has(key));
  if (missingCommon.length > 0) {
    driftDetected = true;
    blockers.push({ root: "common", phase: "bundle", reason: "COMMON_UNREACHABLE", values: missingCommon });
  }
  const commonReachable = [...commonReachableAll].filter((key) => commonDefinedSet.has(key));
  const commonUnreachable = commonDefined.filter((key) => !commonReachableAll.has(key));

  const equivalence = {
    status: driftDetected ? "DRIFT" : blockers.length > 0 ? "BLOCKED" : "MATCH",
    roots: equivalenceRoots,
    common: {
      path: commonAbs,
      reachable: commonReachable.map(commonEntry),
      unreachable: commonUnreachable.map(commonEntry),
    },
  };

  const manifest = {
    created_at: nowIso(),
    phase: "bundle",
    run_id: runId ?? null,
    run_dir: runAbs,
    snapshot_root: snapshotAbs,
    redocly: {
      path: redoclyMeta.path,
      version: redoclyMeta.version,
      digest: redoclyMeta.digest,
      resolved_path: redoclyMeta.resolved_path,
    },
    commands,
    bundles: bundles.map((bundle) => ({
      root: bundle.root,
      path: bundle.path,
      source: bundle.source,
      present: bundle.present,
      bytes: bundle.bytes,
      sha256: bundle.sha256,
    })),
    common: {
      path: commonAbs,
      documentary: true,
      bundled: false,
    },
    blockers,
    equivalence,
    unresolved_refs: [],
  };
  const manifestPath = path.join(manifestsDir, "generator-inputs.pre.json");
  writeNoClobber(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  // Persist the evidence BEFORE blocking, so a drifted or unreachable contract
  // leaves durable proof of the rejection.
  if (driftDetected) {
    const evidence = blockers.filter((blocker) =>
      ["EQUIVALENCE_DRIFT", "COMMON_UNREACHABLE", "EQUIVALENCE_PARSE_REJECTED", "EQUIVALENCE_UNREADABLE"].includes(
        blocker.reason,
      ),
    );
    throw new Error(`EQUIVALENCE_DRIFT: source→bundle drift: ${JSON.stringify(evidence)}`);
  }

  return {
    bundles,
    manifestPath,
    commands,
    unresolvedRefs: [],
    blockers,
    equivalence,
    redocly: manifest.redocly,
  };
}
