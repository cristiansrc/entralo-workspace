// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Residual security / reviewer findings from pack #61 (SEC-61-1 .. SEC-61-4).
// Every test below is expected to FAIL against the current implementation and
// turn green once executor applies the corresponding fix without editing tests.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { runGoas } from "../lib/orchestrator.mjs";
import {
  cleanup as cleanupJbr,
  createJbrHome,
  noopCommandRunner,
  sha256File,
  withJbrCustody,
} from "./helpers/jbr-fixture.mjs";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const jarPath = fileURLToPath(
  new URL(
    "../../vendor/tarballs/openapi-generator-cli-7.25.0.20261005T010240537579199Z-1687.jar",
    import.meta.url,
  ),
);
const validProfile = JSON.parse(
  fs.readFileSync(new URL("../config/generation-profile.json", import.meta.url), "utf8"),
);

function tmpDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

const passingEngine = {
  compileSchemaRef: () => (instance) => instance?.valid !== false,
};

function createPassingSnapshot(tmp) {
  const snapshotRoot = path.join(tmp, "snapshot");
  fs.mkdirSync(snapshotRoot, { recursive: true });
  const matrixPath = path.join(snapshotRoot, "matrix.json");
  const cases = Array.from({ length: 27 }, (_, i) => ({
    id: `c${i}`,
    schema_ref: "api/common.yaml#/components/schemas/Y",
    expected_valid: true,
    instance: { valid: true },
  }));
  fs.writeFileSync(matrixPath, JSON.stringify({ cases }));

  const mpDir = path.join(snapshotRoot, "fixtures", "mercado-pago");
  fs.mkdirSync(mpDir, { recursive: true });
  const mpFiles = [];
  for (let i = 0; i < 13; i += 1) {
    const name = `f${i}.json`;
    mpFiles.push({ file: name, expected_valid: i < 4 });
    fs.writeFileSync(path.join(mpDir, name), JSON.stringify({ valid: i < 4 }));
  }

  const fixturesManifest = {
    matrix: { expected_case_count: 27 },
    mercado_pago: {
      schema_ref: "api/common.yaml#/components/schemas/Y",
      base_dir: "fixtures/mercado-pago",
      expected_valid: 4,
      expected_invalid: 9,
      files: mpFiles,
    },
    format_controls: {
      expect_keyword: "format",
      matrix_case_ids: [],
      mercado_pago_files: [],
    },
  };
  return { snapshotRoot, matrixPath, fixturesManifest };
}

describe("SEC-61 residuals", () => {
  it("SEC-61-1: present but unreadable JBR java binary blocks with TOOLCHAIN_BLOCKED / EACCES", async () => {
    const evidenceRoot = tmpDir("goas-sec61-1-");
    const { jbrHome, javaPath } = createJbrHome("fake-jbr-runtime-sec61-1");
    const { snapshotRoot, matrixPath, fixturesManifest } = createPassingSnapshot(evidenceRoot);

    // Compute the matching custody *before* simulating the read failure.
    const observedSha256 = sha256File(javaPath);
    const profile = withJbrCustody(validProfile, observedSha256);

    const originalRead = fs.readFileSync;
    const originalCreateReadStream = fs.createReadStream;

    function isJava(p) {
      return path.resolve(p) === path.resolve(javaPath);
    }

    function throwEacces() {
      const error = new Error("EACCES: permission denied");
      error.code = "EACCES";
      throw error;
    }

    fs.readFileSync = (p, ...args) =>
      isJava(p) ? throwEacces() : originalRead.call(fs, p, ...args);
    fs.createReadStream = (p, ...args) =>
      isJava(p) ? throwEacces() : originalCreateReadStream.call(fs, p, ...args);

    try {

      const summary = await runGoas({
        runId: "20261007T000500Z",
        repoRoot,
        profile,
        jarPath,
        javaPath,
        jbrHome,
        evidenceRoot,
        engine: passingEngine,
        snapshotRoot,
        matrixPath,
        fixturesManifest,
        commandRunner: noopCommandRunner,
      });

      assert.equal(
        summary.signal,
        "TOOLCHAIN_BLOCKED",
        "an unreadable JBR binary must block the toolchain",
      );
      assert.match(
        summary.reason,
        /EACCES|READ_BLOCKED|ILEGIBLE/i,
        "the block reason must identify the EACCES/read failure, not a digest mismatch or missing custody",
      );
      assert.notEqual(
        summary.reason,
        "JBR_DIGEST_UNAVAILABLE",
        "an unreadable binary must not be reported as missing custody",
      );
      assert.notEqual(
        summary.reason,
        "JBR_SHA256_MISMATCH",
        "an unreadable binary must not be reported as a digest mismatch",
      );
      assert.equal(
        summary.commands.length,
        0,
        "the run must never continue to generator commands with an unreadable JBR binary",
      );
    } finally {
      fs.readFileSync = originalRead;
      fs.createReadStream = originalCreateReadStream;
      cleanup(evidenceRoot);
      cleanupJbr(jbrHome);
    }
  });

  it("SEC-61-1: present but unreadable JBR java binary (EIO) blocks with TOOLCHAIN_BLOCKED / JBR_READ_BLOCKED", async () => {
    const evidenceRoot = tmpDir("goas-sec61-1-eio-");
    const { jbrHome, javaPath } = createJbrHome("fake-jbr-runtime-sec61-1-eio");
    const { snapshotRoot, matrixPath, fixturesManifest } = createPassingSnapshot(evidenceRoot);

    // Compute the matching custody *before* simulating the read failure.
    const observedSha256 = sha256File(javaPath);
    const profile = withJbrCustody(validProfile, observedSha256);

    const originalRead = fs.readFileSync;
    const originalCreateReadStream = fs.createReadStream;

    function isJava(p) {
      return path.resolve(p) === path.resolve(javaPath);
    }

    function throwEio() {
      const error = new Error("EIO: i/o error");
      error.code = "EIO";
      throw error;
    }

    fs.readFileSync = (p, ...args) =>
      isJava(p) ? throwEio() : originalRead.call(fs, p, ...args);
    fs.createReadStream = (p, ...args) =>
      isJava(p) ? throwEio() : originalCreateReadStream.call(fs, p, ...args);

    try {
      const summary = await runGoas({
        runId: "20261007T000504Z",
        repoRoot,
        profile,
        jarPath,
        javaPath,
        jbrHome,
        evidenceRoot,
        engine: passingEngine,
        snapshotRoot,
        matrixPath,
        fixturesManifest,
        commandRunner: noopCommandRunner,
      });

      assert.equal(
        summary.signal,
        "TOOLCHAIN_BLOCKED",
        "an unreadable JBR binary (EIO) must block the toolchain",
      );
      assert.equal(
        summary.reason,
        "JBR_READ_BLOCKED",
        "the block reason must be JBR_READ_BLOCKED for any read failure, not only EACCES/EPERM",
      );
      assert.equal(
        summary.commands.length,
        0,
        "the run must never continue to generator commands with an unreadable JBR binary",
      );
    } finally {
      fs.readFileSync = originalRead;
      fs.createReadStream = originalCreateReadStream;
      cleanup(evidenceRoot);
      cleanupJbr(jbrHome);
    }
  });

  it("SEC-61-2: hashing a large input bundle must not load it entirely into memory", async () => {
    const evidenceRoot = tmpDir("goas-sec61-2-in-");
    const runId = "20261007T000501Z";
    const runDir = path.join(evidenceRoot, runId);
    const sentinelInput = path.join(runDir, "bundles", "admin-bff.yaml");
    const { snapshotRoot, matrixPath, fixturesManifest } = createPassingSnapshot(evidenceRoot);

    const originalMkdir = fs.mkdirSync;
    const originalStat = fs.statSync;
    const originalRead = fs.readFileSync;
    let readFileSyncCalled = false;

    function isSentinel(p) {
      return path.resolve(p) === path.resolve(sentinelInput);
    }

    // Create the sentinel bundle file as soon as the run dir is created,
    // without patching fs.existsSync (which would break realpath containment).
    fs.mkdirSync = (target, ...args) => {
      const result = originalMkdir.call(fs, target, ...args);
      if (path.resolve(target) === path.resolve(runDir)) {
        fs.mkdirSync(path.dirname(sentinelInput), { recursive: true });
        fs.writeFileSync(sentinelInput, "large bundle stub");
      }
      return result;
    };

    fs.statSync = (p, ...args) =>
      isSentinel(p)
        ? {
            size: 1024 * 1024 * 1024,
            isFile: () => true,
            isDirectory: () => false,
            isSymbolicLink: () => false,
          }
        : originalStat.call(fs, p, ...args);

    fs.readFileSync = (p, ...args) => {
      if (isSentinel(p)) {
        readFileSyncCalled = true;
        throw new Error("FATALLY_LARGE");
      }
      return originalRead.call(fs, p, ...args);
    };

    const { jbrHome, javaPath } = createJbrHome("fake-jbr-runtime-sec61-2-in");
    try {
      const profile = withJbrCustody(validProfile, sha256File(javaPath));

      await runGoas({
        runId,
        repoRoot,
        profile,
        jarPath,
        javaPath,
        jbrHome,
        evidenceRoot,
        engine: passingEngine,
        snapshotRoot,
        matrixPath,
        fixturesManifest,
        commandRunner: noopCommandRunner,
      });

      assert.equal(
        readFileSyncCalled,
        false,
        "large input bundle hashing must stream or reject; it must not call fs.readFileSync on the whole file",
      );
    } finally {
      fs.mkdirSync = originalMkdir;
      fs.statSync = originalStat;
      fs.readFileSync = originalRead;
      cleanup(evidenceRoot);
      cleanupJbr(jbrHome);
    }
  });

  it("SEC-61-2: hashing a large output file must not load it entirely into memory", async () => {
    const evidenceRoot = tmpDir("goas-sec61-2-out-");
    const runId = "20261007T000502Z";
    const runDir = path.join(evidenceRoot, runId);
    const generateRoot = path.join(runDir, "generate");
    const { snapshotRoot, matrixPath, fixturesManifest } = createPassingSnapshot(evidenceRoot);

    const originalStat = fs.statSync;
    const originalRead = fs.readFileSync;
    let readFileSyncCalled = false;

    function isHugeOut(p) {
      const resolved = path.resolve(p);
      return (
        resolved.startsWith(generateRoot + path.sep) &&
        path.basename(resolved) === "huge.out"
      );
    }

    fs.statSync = (p, ...args) =>
      isHugeOut(p)
        ? {
            size: 10 * 1024 * 1024,
            isFile: () => true,
            isDirectory: () => false,
            isSymbolicLink: () => false,
          }
        : originalStat.call(fs, p, ...args);

    fs.readFileSync = (p, ...args) => {
      if (isHugeOut(p)) {
        readFileSyncCalled = true;
        throw new Error("FATALLY_LARGE");
      }
      return originalRead.call(fs, p, ...args);
    };

    const { jbrHome, javaPath } = createJbrHome("fake-jbr-runtime-sec61-2-out");
    const profile = withJbrCustody(validProfile, sha256File(javaPath));

    try {
      async function hugeOutputRunner({ args }) {
        const outIdx = args.indexOf("-o");
        if (outIdx !== -1) {
          const outputDir = args[outIdx + 1];
          fs.mkdirSync(outputDir, { recursive: true });
          // Only create the sentinel for one root to keep the test fast.
          if (path.basename(outputDir) === "admin-bff") {
            const hugeOut = path.join(outputDir, "huge.out");
            const fd = fs.openSync(hugeOut, "w");
            try {
              fs.ftruncateSync(fd, 10 * 1024 * 1024);
            } finally {
              fs.closeSync(fd);
            }
          }
        }
        return noopCommandRunner();
      }

      await runGoas({
        runId,
        repoRoot,
        profile,
        jarPath,
        javaPath,
        jbrHome,
        evidenceRoot,
        engine: passingEngine,
        snapshotRoot,
        matrixPath,
        fixturesManifest,
        commandRunner: hugeOutputRunner,
      });

      assert.equal(
        readFileSyncCalled,
        false,
        "large output file hashing must stream or reject; it must not call fs.readFileSync on the whole file",
      );
    } finally {
      fs.statSync = originalStat;
      fs.readFileSync = originalRead;
      cleanup(evidenceRoot);
      cleanupJbr(jbrHome);
    }
  });

  it("SEC-61-4: walkFiles must be bounded/iterative and survive deep output trees", async () => {
    const evidenceRoot = tmpDir("goas-sec61-4-");
    const runId = "20261007T000503Z";
    const runDir = path.join(evidenceRoot, runId);
    const generateRoot = path.join(runDir, "generate");
    const { snapshotRoot, matrixPath, fixturesManifest } = createPassingSnapshot(evidenceRoot);

    const { jbrHome, javaPath } = createJbrHome("fake-jbr-runtime-sec61-4");
    const profile = withJbrCustody(validProfile, sha256File(javaPath));

    const originalReaddir = fs.readdirSync;
    let remaining = 11000; // safely above Node's default recursion limit.

    fs.readdirSync = (p, options) => {
      const resolved = path.resolve(p);
      if (resolved === generateRoot || resolved.startsWith(generateRoot + path.sep)) {
        if (remaining > 0) {
          remaining -= 1;
          return [
            {
              name: "next",
              isDirectory: () => true,
              isSymbolicLink: () => false,
              isFile: () => false,
            },
          ];
        }
        return [];
      }
      return originalReaddir.call(fs, p, options);
    };

    try {
      async function outputDirRunner({ args }) {
        const outIdx = args.indexOf("-o");
        if (outIdx !== -1) {
          fs.mkdirSync(args[outIdx + 1], { recursive: true });
        }
        return noopCommandRunner();
      }

      const summary = await runGoas({
        runId,
        repoRoot,
        profile,
        jarPath,
        javaPath,
        jbrHome,
        evidenceRoot,
        engine: passingEngine,
        snapshotRoot,
        matrixPath,
        fixturesManifest,
        commandRunner: outputDirRunner,
      });

      assert.ok(
        summary.signal === "RUN_RECORDED" || summary.signal === "RUN_INCOMPLETE",
        `deep output tree must not crash the runner; got signal=${summary.signal} reason=${summary.reason}`,
      );
      assert.ok(
        summary.run_dir,
        "runGoas must return a summary with a run_dir after deep output inventory",
      );
      const outputsPath = path.join(summary.run_dir, "manifests", "generator-outputs.json");
      assert.ok(
        fs.existsSync(outputsPath),
        "generator-outputs.json must be written after inventorying a deep tree",
      );
    } finally {
      fs.readdirSync = originalReaddir;
      cleanup(evidenceRoot);
      cleanupJbr(jbrHome);
    }
  });
});
