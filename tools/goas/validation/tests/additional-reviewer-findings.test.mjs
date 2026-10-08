// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Additional reviewer findings from pack #55 (complementary F-04 branch,
// summary.signal precedence, walkFiles/os_signal coverage, exact F-06 reason,
// manifest forwarding to runMercadoPago, and the dangling-symlink L-07 note).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";

import { runGoas } from "../lib/orchestrator.mjs";
import { runFormatControls } from "../lib/format-controls.mjs";
import { runMatrixAndMercadoPago, runMercadoPago } from "../lib/matrix-mp-runner.mjs";
import {
  cleanup as cleanupJbr,
  createJbrHome,
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
const runProfile = JSON.parse(
  fs.readFileSync(new URL("../config/run-profile.json", import.meta.url), "utf8"),
);

const jbrFixture = createJbrHome("additional-findings-jbr-runtime");
const profileWithJbrCustody = withJbrCustody(validProfile, jbrFixture.sha256);

after(() => cleanupJbr(jbrFixture.jbrHome));

function tmpDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

function noopCommandRunner() {
  return {
    exitCode: 0,
    signal: null,
    timedOut: false,
    spawnError: null,
    durationMs: 1,
  };
}

const fakeEngine = {
  compileSchemaRef: () => (instance) => ({ valid: true, errors: [] }),
};

// Engine that returns boolean validators so the matrix/MP static checks can
// be satisfied (used by H-1 to avoid the vacuous STATIC_CHECKS_OMITTED path).
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

describe("Additional reviewer findings (pack #55)", () => {
  it("F-04 complement: validate nonzero exit without timeout is GENERATOR_BLOCKED + VALIDATE_NOT_OK", async () => {
    const evidenceRoot = tmpDir("goas-add-f04-");
    try {
      const { snapshotRoot, matrixPath, fixturesManifest } = createPassingSnapshot(evidenceRoot);

      async function badValidateRunner({ args }) {
        if (args.includes("validate")) {
          return {
            exitCode: 1,
            signal: null,
            timedOut: false,
            spawnError: null,
            durationMs: 1,
          };
        }
        return noopCommandRunner();
      }

      const summary = await runGoas({
        runId: "20261007T000020Z",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        engine: passingEngine,
        snapshotRoot,
        matrixPath,
        fixturesManifest,
        deadlineMs: 900000,
        commandRunner: badValidateRunner,
      });

      const generateEntries = summary.not_started.filter((n) => n.phase === "generate");
      assert.ok(generateEntries.length > 0, "expected generate entries blocked by validate");
      for (const entry of generateEntries) {
        assert.equal(entry.reason, "VALIDATE_NOT_OK", "nonzero validate must be VALIDATE_NOT_OK");
      }
      assert.equal(
        summary.signal,
        "GENERATOR_BLOCKED",
        "nonzero validate must set summary.signal to GENERATOR_BLOCKED",
      );
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("summary.signal precedence: STATIC_CHECKS_OMITTED is not overwritten by later timeout", async () => {
    const evidenceRoot = tmpDir("goas-add-signal-");
    try {
      async function timeoutRunner({ args }) {
        if (args.includes("validate")) {
          return {
            exitCode: 124,
            signal: null,
            timedOut: true,
            spawnError: null,
            durationMs: 1,
          };
        }
        return noopCommandRunner();
      }

      const summary = await runGoas({
        runId: "20261007T000021Z",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        commandRunner: timeoutRunner,
      });

      assert.equal(summary.reason, "STATIC_CHECKS_OMITTED", "omission reason must survive");
      assert.equal(
        summary.signal,
        "GENERATOR_BLOCKED",
        "STATIC_CHECKS_OMITTED must not be overwritten by RUN_INCOMPLETE",
      );
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("walkFiles inventories non-file/non-dir entries as type other", async () => {
    const evidenceRoot = tmpDir("goas-add-other-");
    try {
      async function fifoCreatingRunner({ args }) {
        const outIdx = args.indexOf("-o");
        if (outIdx !== -1) {
          const outputDir = args[outIdx + 1];
          fs.mkdirSync(outputDir, { recursive: true });
          const fifoPath = path.join(outputDir, "fifo");
          execSync(`mkfifo "${fifoPath}"`, { timeout: 2000 });
        }
        return noopCommandRunner();
      }

      const summary = await runGoas({
        runId: "20261007T000022Z",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        commandRunner: fifoCreatingRunner,
      });

      const outputsPath = path.join(summary.run_dir, "manifests", "generator-outputs.json");
      const outputs = JSON.parse(fs.readFileSync(outputsPath, "utf8"));
      const adminBff = outputs.roots.find((r) => r.root === "admin-bff");
      assert.ok(adminBff, "expected admin-bff output entry");

      const entry = adminBff.files.find((f) => f.relative === "fifo");
      assert.ok(entry, "expected fifo entry in generator-outputs.json");
      assert.equal(entry.type, "other", "fifo must be inventoried as type other");
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("os_signal is preserved in command records", async () => {
    const evidenceRoot = tmpDir("goas-add-ossig-");
    try {
      async function sigtermRunner() {
        return {
          exitCode: 1,
          signal: "SIGTERM",
          timedOut: false,
          spawnError: null,
          durationMs: 1,
        };
      }

      const summary = await runGoas({
        runId: "20261007T000023Z",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        commandRunner: sigtermRunner,
      });

      const validateRecords = summary.commands.filter((r) => r.phase === "validate");
      assert.ok(validateRecords.length > 0, "expected validate records");
      for (const rec of validateRecords) {
        assert.equal(rec.os_signal, "SIGTERM", "os_signal must be preserved");
      }
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("F-06 exact: missing format-control case has blocked_reason MISSING_CASE", () => {
    const tmp = tmpDir("goas-add-f06-");
    try {
      const matrixPath = path.join(tmp, "matrix.json");
      fs.writeFileSync(matrixPath, JSON.stringify({ cases: [] }));

      const manifest = {
        mercado_pago: {
          schema_ref: "api/common.yaml#/components/schemas/MercadoPagoPaymentNotificationV1",
          base_dir: "fixtures/mercado-pago",
        },
        format_controls: {
          expect_keyword: "format",
          matrix_case_ids: ["missing-case-id"],
          mercado_pago_files: [],
        },
      };

      const result = runFormatControls({
        engine: fakeEngine,
        snapshotRoot: tmp,
        matrixPath,
        manifest,
      });

      assert.ok(result.results.length > 0, "expected a result for the missing case");
      const missing = result.results[0];
      assert.equal(
        missing.status,
        "FORMAT_ASSERTION_BLOCKED",
        "missing case must be FORMAT_ASSERTION_BLOCKED",
      );
      assert.equal(missing.blocked_reason, "MISSING_CASE", "blocked_reason must be exactly MISSING_CASE");
    } finally {
      cleanup(tmp);
    }
  });

  it("F-07 manifest forwarding: runMercadoPago uses manifest expected_valid/invalid", () => {
    const tmp = tmpDir("goas-add-f07-mp-");
    try {
      const snapshotRoot = path.join(tmp, "snapshot");
      const mpDir = path.join(snapshotRoot, "fixtures", "mercado-pago");
      fs.mkdirSync(mpDir, { recursive: true });

      const files = Array.from({ length: 13 }, (_, i) => `f${i}.json`);
      for (const f of files) fs.writeFileSync(path.join(mpDir, f), "{}");

      const manifest = {
        mercado_pago: {
          schema_ref: "api/common.yaml#/components/schemas/MercadoPagoPaymentNotificationV1",
          base_dir: "fixtures/mercado-pago",
          expected_valid: 4,
          expected_invalid: 9,
          files: files.map((f) => ({ file: f, expected_valid: false })),
        },
      };

      const result = runMercadoPago({ engine: fakeEngine, snapshotRoot, manifest });

      assert.equal(result.observed_valid, 0, "all fixtures observed invalid");
      assert.equal(result.observed_invalid, 13, "all 13 fixtures observed invalid");
      assert.ok(
        result.polarity_mismatch || result.mismatch_count > 0,
        "manifest 4/9 expectation must be cross-checked and fail",
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("F-07 manifest forwarding: runMatrixAndMercadoPago forwards manifest to both runners", () => {
    const tmp = tmpDir("goas-add-f07-both-");
    try {
      const matrixPath = path.join(tmp, "matrix.json");
      fs.writeFileSync(matrixPath, JSON.stringify({ cases: [] }));

      const manifest = {
        matrix: { expected_case_count: 27 },
        mercado_pago: {
          schema_ref: "api/common.yaml#/components/schemas/MercadoPagoPaymentNotificationV1",
          base_dir: "fixtures/mercado-pago",
          expected_valid: 4,
          expected_invalid: 9,
          files: [],
        },
      };

      const result = runMatrixAndMercadoPago({
        engine: fakeEngine,
        snapshotRoot: tmp,
        matrixPath,
        manifest,
      });

      assert.equal(
        result.matrix.manifest_expected_case_count,
        27,
        "runMatrix must receive manifest expected_case_count",
      );
      assert.equal(
        result.mercado_pago.expected_valid,
        4,
        "runMercadoPago must receive manifest expected_valid",
      );
      assert.equal(
        result.mercado_pago.expected_invalid,
        9,
        "runMercadoPago must receive manifest expected_invalid",
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("L-07 dangling symlink: collectOutputs inventories it without following", async () => {
    const evidenceRoot = tmpDir("goas-add-dangle-");
    try {
      async function danglingSymlinkRunner({ args }) {
        const outIdx = args.indexOf("-o");
        if (outIdx !== -1) {
          const outputDir = args[outIdx + 1];
          fs.mkdirSync(outputDir, { recursive: true });
          fs.symlinkSync("missing-target", path.join(outputDir, "dangling"));
        }
        return noopCommandRunner();
      }

      const summary = await runGoas({
        runId: "20261007T000024Z",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        commandRunner: danglingSymlinkRunner,
      });

      const outputsPath = path.join(summary.run_dir, "manifests", "generator-outputs.json");
      const outputs = JSON.parse(fs.readFileSync(outputsPath, "utf8"));
      const adminBff = outputs.roots.find((r) => r.root === "admin-bff");
      assert.ok(adminBff, "expected admin-bff output entry");

      const entry = adminBff.files.find((f) => f.relative === "dangling");
      assert.ok(entry, "expected dangling symlink entry");
      assert.equal(entry.type, "symlink", "dangling symlink must still be type symlink");
      assert.equal(entry.target, "missing-target", "target must be the literal link value");
    } finally {
      cleanup(evidenceRoot);
    }
  });
});
