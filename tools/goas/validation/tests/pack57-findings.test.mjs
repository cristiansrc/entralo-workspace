// red: test-architect (pack #57)
// owner: test-architect — executor must not edit this file.
//
// Pack #57 red tests.
// Every test below is expected to FAIL against the current implementation and
// turn green once executor applies the corresponding fix without editing tests.

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { after, describe, it } from "node:test";
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
const runProfile = JSON.parse(
  fs.readFileSync(new URL("../config/run-profile.json", import.meta.url), "utf8"),
);

const jbrFixture = createJbrHome("pack57-jbr-runtime");
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

function sha256String(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function readJsonl(runDir) {
  const logPath = path.join(runDir, "logs", "generator-commands.jsonl");
  if (!fs.existsSync(logPath)) return [];
  return fs
    .readFileSync(logPath, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

describe("Pack #57 findings", () => {
  it("H-1: validate exit 1 with static checks present escalates summary.signal to GENERATOR_BLOCKED", async () => {
    const evidenceRoot = tmpDir("goas-h1-");
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
        return {
          exitCode: 0,
          signal: null,
          timedOut: false,
          spawnError: null,
          durationMs: 1,
        };
      }

      const summary = await runGoas({
        runId: "20261007T000300Z",
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
        commandRunner: badValidateRunner,
      });

      assert.equal(
        summary.signal,
        "GENERATOR_BLOCKED",
        "nonzero validate must escalate summary.signal to GENERATOR_BLOCKED when static checks passed",
      );
      const generateEntries = summary.not_started.filter((n) => n.phase === "generate");
      assert.ok(generateEntries.length > 0, "expected generate entries blocked by validate");
      for (const entry of generateEntries) {
        assert.equal(
          entry.reason,
          "VALIDATE_NOT_OK",
          "generate blocked by failed validate must be VALIDATE_NOT_OK",
        );
      }
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("L1: catch cannot degrade an already higher signal", async () => {
    const evidenceRoot = tmpDir("goas-l1-");
    try {
      const summary = await runGoas({
        runId: "20261007T000301Z",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        commandRunner: () => {
          throw new Error("RUN_INCOMPLETE forced after static checks omitted");
        },
      });

      assert.equal(
        summary.signal,
        "GENERATOR_BLOCKED",
        "a RUN_INCOMPLETE exception must not downgrade a previously set GENERATOR_BLOCKED",
      );
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("L2: catch preserves the true phase where the error originated", async () => {
    const evidenceRoot = tmpDir("goas-l2-");
    try {
      const { snapshotRoot, matrixPath } = createPassingSnapshot(evidenceRoot);
      const fixturesManifest = {
        matrix: { expected_case_count: 27 },
        mercado_pago: {
          schema_ref: "api/common.yaml#/components/schemas/Y",
          base_dir: "fixtures/mercado-pago",
          expected_valid: 4,
          expected_invalid: 9,
          files: [],
        },
        format_controls: {
          expect_keyword: "format",
          matrix_case_ids: [],
          mercado_pago_files: [],
        },
      };
      // Drop one case so the mismatch originates in the static_checks phase.
      const matrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));
      matrix.cases.pop();
      fs.writeFileSync(matrixPath, JSON.stringify(matrix));

      const summary = await runGoas({
        runId: "20261007T000302Z",
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
        commandRunner: () => ({
          exitCode: 0,
          signal: null,
          timedOut: false,
          spawnError: null,
          durationMs: 1,
        }),
      });

      assert.equal(summary.signal, "RUN_INCOMPLETE", "matrix mismatch must set RUN_INCOMPLETE");
      const records = readJsonl(summary.run_dir);
      const found = records.find(
        (r) => r.signal === "RUN_INCOMPLETE" && r.reason === "RUN_INCOMPLETE",
      );
      assert.ok(found, "expected a RUN_INCOMPLETE evidence record");
      assert.equal(
        found.phase,
        "static_checks",
        "catch must record the phase where the static-check failure originated",
      );
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("R01: global deadline must not downgrade an already set GENERATOR_BLOCKED", async () => {
    const evidenceRoot = tmpDir("goas-r01-");
    try {
      const summary = await runGoas({
        runId: "20261007T000303Z",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        deadlineMs: 0,
        commandRunner: () => ({
          exitCode: 0,
          signal: null,
          timedOut: false,
          spawnError: null,
          durationMs: 1,
        }),
      });

      assert.equal(
        summary.signal,
        "GENERATOR_BLOCKED",
        "global deadline exceeded must not downgrade a GENERATOR_BLOCKED set by static-check omission",
      );
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("R02: missing JBR java binary produces TOOLCHAIN_BLOCKED with evidence", async () => {
    const evidenceRoot = tmpDir("goas-r02-");
    const jbrHome = tmpDir("goas-r02-jbr-");
    try {
      fs.mkdirSync(path.join(jbrHome, "bin"), { recursive: true });
      const javaPath = path.join(jbrHome, "bin", "java");

      const summary = await runGoas({
        runId: "20261007T000304Z",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath,
        jbrHome,
        evidenceRoot,
        commandRunner: () => ({
          exitCode: 0,
          signal: null,
          timedOut: false,
          spawnError: null,
          durationMs: 1,
        }),
      });

      assert.equal(summary.signal, "TOOLCHAIN_BLOCKED", "missing java binary must block the toolchain");
      assert.equal(summary.reason, "TOOLCHAIN_BLOCKED", "missing java binary must set TOOLCHAIN_BLOCKED reason");
      const records = readJsonl(summary.run_dir);
      const found = records.find((r) => r.phase === "toolchain" && r.signal === "TOOLCHAIN_BLOCKED");
      assert.ok(found, "expected a toolchain evidence record for missing java");
    } finally {
      cleanup(evidenceRoot);
      cleanup(jbrHome);
    }
  });

  it("R03: JBR digest mismatch is rejected with TOOLCHAIN_BLOCKED and evidence", async () => {
    const evidenceRoot = tmpDir("goas-r03-");
    const jbrHome = tmpDir("goas-r03-jbr-");
    try {
      fs.mkdirSync(path.join(jbrHome, "bin"), { recursive: true });
      const javaPath = path.join(jbrHome, "bin", "java");
      const javaContents = "fake-jbr-runtime-for-pack57";
      fs.writeFileSync(javaPath, javaContents);

      const profile = JSON.parse(JSON.stringify(validProfile));
      profile.java.sha256_custody = sha256String("definitely-not-the-jbr");

      const summary = await runGoas({
        runId: "20261007T000305Z",
        repoRoot,
        profile,
        jarPath,
        javaPath,
        jbrHome,
        evidenceRoot,
        commandRunner: () => ({
          exitCode: 0,
          signal: null,
          timedOut: false,
          spawnError: null,
          durationMs: 1,
        }),
      });

      assert.equal(summary.signal, "TOOLCHAIN_BLOCKED", "JBR SHA-256 mismatch must block the toolchain");
      assert.equal(summary.reason, "JBR_SHA256_MISMATCH", "JBR mismatch must set JBR_SHA256_MISMATCH reason");
      const records = readJsonl(summary.run_dir);
      const found = records.find(
        (r) =>
          r.phase === "toolchain" &&
          r.signal === "TOOLCHAIN_BLOCKED" &&
          r.reason === "JBR_SHA256_MISMATCH",
      );
      assert.ok(found, "expected a toolchain evidence record for JBR digest mismatch");
    } finally {
      cleanup(evidenceRoot);
      cleanup(jbrHome);
    }
  });

  it("R04: failures before run dir creation produce a controlled/classified outcome", async () => {
    let summary;
    let thrown;
    try {
      summary = await runGoas({
        runId: "invalid-run-id",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
      });
    } catch (error) {
      thrown = error;
    }

    if (thrown) {
      assert.ok(thrown.signal, "controlled error must expose a signal field");
      assert.ok(thrown.reason, "controlled error must expose a reason field");
    } else {
      assert.ok(summary.signal, "controlled summary must expose a signal");
      assert.ok(summary.reason, "controlled summary must expose a reason");
    }
  });

  it("R05: report write failure is surfaced in the summary signal/field", async () => {
    const evidenceRoot = tmpDir("goas-r05-");
    try {
      const { snapshotRoot, matrixPath, fixturesManifest } = createPassingSnapshot(evidenceRoot);
      const originalWrite = fs.writeFileSync;
      try {
        fs.writeFileSync = (target, ...args) => {
          if (String(target).includes("generator-report.md")) {
            const error = new Error("report write refused");
            error.code = "EACCES";
            throw error;
          }
          return originalWrite.call(fs, target, ...args);
        };

        const summary = await runGoas({
          runId: "20261007T000306Z",
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
          commandRunner: () => ({
            exitCode: 0,
            signal: null,
            timedOut: false,
            spawnError: null,
            durationMs: 1,
          }),
        });

        assert.notEqual(
          summary.signal,
          "RUN_RECORDED",
          "report write failure must escalate the run signal",
        );
        assert.ok(
          runProfile.signals.includes(summary.signal),
          `report write failure signal ${summary.signal} must be declared in run-profile.json`,
        );
        assert.ok(
          summary.report_write_error,
          "report write failure must be surfaced in summary.report_write_error",
        );
      } finally {
        fs.writeFileSync = originalWrite;
      }
    } finally {
      cleanup(evidenceRoot);
    }
  });
});
