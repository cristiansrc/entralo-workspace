// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Regression tests for run-guard findings:
//   B1  — prepareRunDir with non-existent evidence root must create it, not throw PATH_ESCAPE.
//   B2/M-02 — assertReadOnlyInput must accept legitimate inputs under ${run}/bundles and ${run}/snapshot.
//   L-06 — evidence files/dirs in /tmp must not be world-readable.
//   L-07 — TOCTOU guard (covered only by contract note, runtime race is hard to reproduce deterministically).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  EVIDENCE_ROOT,
  prepareRunDir,
  assertReadOnlyInput,
  createRunLayout,
  writeEvidenceFile,
} from "../lib/run-guard.mjs";

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

describe("run-guard", () => {
  it("B1: prepareRunDir creates the evidence root when it does not exist", () => {
    const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), "goas-b1-"));
    const evidenceRoot = path.join(tmpBase, "missing", "root");
    const runId = "20261006T120000Z";
    let runDir;
    try {
      runDir = prepareRunDir(runId, { evidenceRoot });
      assert.equal(runDir, path.join(evidenceRoot, runId));
      assert.ok(fs.existsSync(runDir), "run directory was created");
      assert.ok(fs.existsSync(evidenceRoot), "evidence root was created");
    } finally {
      cleanup(tmpBase);
    }
  });

  it("B2/M-02: assertReadOnlyInput accepts inputs under ${run}/bundles and ${run}/snapshot", () => {
    const runId = "20261006T120001Z-b2";
    const runDir = path.join(EVIDENCE_ROOT, runId);
    cleanup(runDir);
    try {
      const bundlesDir = path.join(runDir, "bundles");
      const snapshotDir = path.join(runDir, "snapshot", "fixtures", "mp");
      fs.mkdirSync(bundlesDir, { recursive: true });
      fs.mkdirSync(snapshotDir, { recursive: true });

      const bundleFile = path.join(bundlesDir, "buyer-bff.yaml");
      const fixtureFile = path.join(snapshotDir, "payment-created.v1.json");
      fs.writeFileSync(bundleFile, "bundle");
      fs.writeFileSync(fixtureFile, "{}");

      // Must NOT throw INPUT_READ_ONLY for the approved input directories.
      assert.doesNotThrow(() => assertReadOnlyInput(bundleFile, runDir));
      assert.doesNotThrow(() => assertReadOnlyInput(fixtureFile, runDir));

      // Must STILL reject writable output directories (fail-closed).
      const outputFile = path.join(runDir, "generate", "out.txt");
      fs.mkdirSync(path.dirname(outputFile), { recursive: true });
      fs.writeFileSync(outputFile, "x");
      assert.throws(() => assertReadOnlyInput(outputFile, runDir), /INPUT_READ_ONLY/);
    } finally {
      cleanup(runDir);
    }
  });

  it("L-06: evidence directory and files created by writeEvidenceFile are not world-readable", () => {
    const runId = "20261006T120002Z-l06";
    const runDir = path.join(EVIDENCE_ROOT, runId);
    cleanup(runDir);
    try {
      prepareRunDir(runId);
      // Use the runner's own evidence-writing API (mode 0o700/0o600), not a
      // raw fs.writeFileSync whose permissions depend on the process umask.
      const nestedDir = path.join(runDir, "logs", "sub");
      const file = path.join(nestedDir, "secret.log");
      writeEvidenceFile(file, "evidence");

      const dirMode = fs.statSync(nestedDir).mode & 0o777;
      const fileMode = fs.statSync(file).mode & 0o777;
      assert.equal(
        dirMode & 0o007,
        0,
        `evidence directory must not be accessible by group/other, got ${dirMode.toString(8)}`,
      );
      assert.equal(
        fileMode & 0o007,
        0,
        `evidence file must not be readable by group/other, got ${fileMode.toString(8)}`,
      );
    } finally {
      cleanup(runDir);
    }
  });

  it("L-07: prepareRunDir is resilient to parent-directory swapping (contract)", () => {
    // Deterministic reproduction of a TOCTOU symlink swap is fragile across
    // kernels and requires privileged racing.  The contract we encode here is
    // that the guard must reject a run directory whose final realpath is not
    // under the evidence root.
    const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), "goas-l07-"));
    try {
      const evidenceRoot = path.join(tmpBase, "evidence");
      fs.mkdirSync(evidenceRoot, { recursive: true });
      // A path whose lexical form is under the root but whose realpath is not
      // must be rejected.
      const outside = fs.mkdtempSync(path.join(os.tmpdir(), "goas-l07-out-"));
      const symlinkRun = path.join(evidenceRoot, "symlink-run");
      fs.symlinkSync(outside, symlinkRun);
      assert.throws(
        () => prepareRunDir("20261006T120003Z-l07", { evidenceRoot: symlinkRun }),
        /PATH_ESCAPE/,
      );
      cleanup(outside);
    } finally {
      cleanup(tmpBase);
    }
  });

  it("M-03: prepareRunDir converts EEXIST race into a controlled DESTINATION_EXISTS", () => {
    const umaskBefore = process.umask();
    const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), "goas-m03-"));
    const evidenceRoot = path.join(tmpBase, "evidence");
    const runId = "20261006T120004Z-m03";
    const runDir = path.join(evidenceRoot, runId);

    fs.mkdirSync(evidenceRoot, { recursive: true });
    fs.mkdirSync(runDir, { recursive: true });

    // Simulate the window between the existsSync check and mkdirSync: the run
    // directory already exists but existsSync reports it does not.
    const originalExistsSync = fs.existsSync;
    fs.existsSync = (p) => (p === runDir ? false : originalExistsSync(p));

    try {
      assert.throws(
        () => prepareRunDir(runId, { evidenceRoot }),
        /DESTINATION_EXISTS/,
        "EEXIST from mkdirSync must be handled as DESTINATION_EXISTS",
      );
    } finally {
      fs.existsSync = originalExistsSync;
      process.umask(umaskBefore);
      cleanup(tmpBase);
    }
  });

  it("L-07: prepareRunDir rejects an evidence root inside a symlinked parent", () => {
    const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), "goas-l07-parent-"));
    try {
      const outside = fs.mkdtempSync(path.join(os.tmpdir(), "goas-l07-parent-out-"));
      const linkParent = path.join(tmpBase, "linkParent");
      fs.symlinkSync(outside, linkParent);
      const evidenceRoot = path.join(linkParent, "evidence");

      assert.throws(
        () => prepareRunDir("20261006T120005Z-l07p", { evidenceRoot }),
        /PATH_ESCAPE/,
        "an evidence root reachable only through a symlinked parent must be rejected",
      );
      cleanup(outside);
    } finally {
      cleanup(tmpBase);
    }
  });

  it("security: prepareRunDir does not mutate the global process umask", () => {
    const runId = "20261006T120006Z-umask";
    const original = process.umask();
    // Force a known umask so the test is independent of earlier test side effects.
    process.umask(0o022);
    let after;
    try {
      prepareRunDir(runId);
    } finally {
      after = process.umask();
      process.umask(original);
      cleanup(path.join(EVIDENCE_ROOT, runId));
    }
    assert.equal(
      after,
      0o022,
      `global umask changed from 0o022 to ${after.toString(8)}`,
    );
  });
});
