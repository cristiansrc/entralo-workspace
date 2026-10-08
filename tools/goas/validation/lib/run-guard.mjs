// G-OAS run-path guard — plan §6 / §7 / §16.5.
//
// All tool outputs go ONLY to a unique external run directory:
//   /tmp/opencode/entralo-v1-executable-specs/<run_id>/
// The guard refuses a reused destination, asserts output realpaths stay under
// the approved evidence root, and treats every input snapshot path as
// read-only. It never writes to canonical sources.

import fs from "node:fs";
import path from "node:path";

export const EVIDENCE_ROOT = "/tmp/opencode/entralo-v1-executable-specs";
export const RUN_ID_RE = /^[0-9]{8}T[0-9]{6,9}Z(-[A-Za-z0-9]{1,64})?$/;

/** Inherited input subtrees that are legitimately read-only inside a run. */
export const INPUT_SUBDIRS = Object.freeze(["bundles", "snapshot"]);

/** Owner-only mode for evidence directories/files (L-06, umask 0022 must not leak). */
const PRIVATE_DIR_MODE = 0o700;
const PRIVATE_FILE_MODE = 0o600;

function nearestExisting(target) {
  let current = path.resolve(target);
  // Bounded walk to the filesystem root.
  for (let i = 0; i < 4096; i += 1) {
    if (fs.existsSync(current)) return current;
    const parent = path.dirname(current);
    if (parent === current) return current;
    current = parent;
  }
  return path.parse(path.resolve(target)).root;
}

/**
 * L-07: fail closed when any EXISTING component of `target` is a symlink. A
 * swapped ancestor symlink would otherwise make the lexical path diverge from
 * the realpath the guard later validates.
 */
function hasSymlinkComponent(target) {
  const abs = path.resolve(target);
  const parts = abs.split(path.sep).filter(Boolean);
  let current = path.parse(abs).root;
  for (const part of parts) {
    current = path.join(current, part);
    let stat;
    try {
      stat = fs.lstatSync(current);
    } catch {
      // Component does not exist yet: no further existing components to check.
      return false;
    }
    if (stat.isSymbolicLink()) return true;
  }
  return false;
}

function assertRealpathUnderRoot(target, root, label) {
  const realTarget = fs.realpathSync(nearestExisting(target));
  const realRoot = fs.realpathSync(nearestExisting(root));
  const rel = path.relative(realRoot, realTarget);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`PATH_ESCAPE ${label}: ${realTarget} is not under ${realRoot}`);
  }
}

/**
 * Containment for a not-yet-created evidence path. The lexical destination must
 * be strictly under the approved root, and no EXISTING component (of the root or
 * of the destination) may be a symlink, so the eventual realpath cannot diverge
 * from the lexical path. Unlike `assertRealpathUnderRoot` this does not require
 * the parent directories to pre-exist, which is the point of the writer.
 */
function assertEvidenceContained(target, evidenceRoot) {
  const abs = path.resolve(target);
  const absRoot = path.resolve(evidenceRoot);
  const rel = path.relative(absRoot, abs);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`PATH_ESCAPE evidence: ${abs} is not under ${absRoot}`);
  }
  if (hasSymlinkComponent(absRoot) || hasSymlinkComponent(abs)) {
    throw new Error(`PATH_ESCAPE evidence: ${abs} traverses a symlinked component`);
  }
}

export function assertRunId(runId) {
  if (typeof runId !== "string" || !RUN_ID_RE.test(runId)) {
    throw new Error(`RUN_ID_INVALID: ${runId}`);
  }
}

/**
 * Create the unique run directory. Refuses if it already exists.
 *
 * B1: the evidence root is created BEFORE the realpath containment check (a
 * missing root used to make both realpaths converge and raise a spurious
 * PATH_ESCAPE). L-07: a swapped parent symlink is rejected fail-closed.
 *
 * @returns {string} absolute runDir
 */
export function prepareRunDir(runId, { evidenceRoot = EVIDENCE_ROOT } = {}) {
  assertRunId(runId);
  if (path.basename(runId) !== runId) throw new Error(`RUN_ID_INVALID: ${runId}`);
  const runDir = path.join(evidenceRoot, runId);

  // L-07: reject an evidence root reachable only through a symlinked ancestor
  // BEFORE creating anything outside the intended tree.
  if (hasSymlinkComponent(evidenceRoot)) {
    throw new Error(`PATH_ESCAPE runDir: evidence root ${evidenceRoot} has a symlinked ancestor`);
  }

  // No-clobber: never write into a reused run id.
  if (fs.existsSync(runDir)) {
    throw new Error(`DESTINATION_EXISTS: ${runDir}`);
  }

  // Create the evidence root first (owner-only) so the realpath check below can
  // resolve an existing ancestor instead of failing on a missing root.
  fs.mkdirSync(evidenceRoot, { recursive: true, mode: PRIVATE_DIR_MODE });

  // L-07 contract: refuse a parent whose final component is a swapped symlink,
  // even when its realpath would still lexically contain the run id.
  if (fs.lstatSync(evidenceRoot).isSymbolicLink()) {
    throw new Error(`PATH_ESCAPE runDir: evidence root ${evidenceRoot} is a symlink`);
  }

  // M-03: an EEXIST race between the existsSync check and mkdirSync must become
  // a controlled DESTINATION_EXISTS, never an unhandled raw fs error.
  try {
    fs.mkdirSync(runDir, { recursive: false, mode: PRIVATE_DIR_MODE });
  } catch (error) {
    if (error && error.code === "EEXIST") {
      throw new Error(`DESTINATION_EXISTS: ${runDir}`);
    }
    throw error;
  }
  assertRealpathUnderRoot(runDir, evidenceRoot, "runDir");
  return runDir;
}

export function assertOutputPath(target, runDir) {
  assertRealpathUnderRoot(target, runDir, "output");
}

/**
 * B2/M-02: inputs are read-only only inside the approved input subtrees
 * (`${run}/bundles`, `${run}/snapshot`). Writable output areas such as
 * `${run}/generate` stay fail-closed with `INPUT_READ_ONLY`.
 *
 * @param {string} target absolute input path
 * @param {string} runDir absolute run root (was misused as `snapshotRoot`)
 */
export function assertReadOnlyInput(target, runDir) {
  assertRealpathUnderRoot(target, runDir, "input");
  const realRun = fs.realpathSync(nearestExisting(runDir));
  const realTarget = fs.realpathSync(nearestExisting(target));
  const rel = path.relative(realRun, realTarget);
  const firstSegment = rel.split(path.sep)[0];
  if (!INPUT_SUBDIRS.includes(firstSegment)) {
    throw new Error(
      `INPUT_READ_ONLY: input ${realTarget} is not under an approved read-only input area of ${realRun}`,
    );
  }
}

/**
 * Owner-only, fail-closed write of an evidence file (L-06).
 *
 * - Refuses a destination that lexically escapes the approved evidence root or
 *   that traverses an existing symlinked component (containment contract).
 * - Creates missing parent directories with an explicit owner-only mode.
 * - Creates the file with the exclusive `wx` flag so an existing evidence file
 *   is never silently clobbered (`run-profile.write_guard` no-clobber).
 * - Uses explicit modes only; it never mutates the process-wide umask.
 *
 * @returns {number} bytes written
 */
export function writeEvidenceFile(target, contents, { evidenceRoot = EVIDENCE_ROOT } = {}) {
  const abs = path.resolve(target);
  assertEvidenceContained(abs, evidenceRoot);
  fs.mkdirSync(path.dirname(abs), { recursive: true, mode: PRIVATE_DIR_MODE });
  try {
    fs.writeFileSync(abs, contents, { mode: PRIVATE_FILE_MODE, flag: "wx" });
  } catch (error) {
    if (error && error.code === "EEXIST") {
      throw new Error(`DESTINATION_EXISTS: ${abs}`);
    }
    throw error;
  }
  return Buffer.byteLength(contents, "utf8");
}

/** Proposed layout. Does not create anything by itself. */
export function createRunLayout(runDir) {
  return {
    runDir,
    home: path.join(runDir, "home"),
    tmp: path.join(runDir, "tmp"),
    logs: path.join(runDir, "logs"),
    manifests: path.join(runDir, "manifests"),
    bundles: path.join(runDir, "bundles"),
    generate: path.join(runDir, "generate"),
    snapshot: path.join(runDir, "snapshot"),
  };
}
