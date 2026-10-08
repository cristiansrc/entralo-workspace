// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Regression tests for reviewer findings F-01 .. F-07.
// Each test is expected to FAIL against the current implementation and turn
// green once executor applies the corresponding fix without editing tests.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";

import { buildCommands } from "../lib/generation.mjs";
import { runGoas } from "../lib/orchestrator.mjs";
import { runFormatControls } from "../lib/format-controls.mjs";
import { runMatrixAndMercadoPago } from "../lib/matrix-mp-runner.mjs";
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

const jbrFixture = createJbrHome("f01-f07-jbr-runtime");
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

function readJsonl(runDir) {
  const logPath = path.join(runDir, "logs", "generator-commands.jsonl");
  if (!fs.existsSync(logPath)) return [];
  return fs
    .readFileSync(logPath, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

const fakeEngine = {
  compileSchemaRef: () => (instance) => ({ valid: true, errors: [] }),
};

async function noopCommandRunner() {
  return {
    exitCode: 0,
    signal: null,
    timedOut: false,
    spawnError: null,
    durationMs: 1,
  };
}

describe("F-01 .. F-07 red regressions", () => {
  it("F-01: buildCommands rejects input/output paths escaping ${run}/bundles and ${run}/generate", () => {
    const runDir = "/tmp/opencode/entralo-v1-executable-specs/20261007T000000Z";

    const inputEscape = JSON.parse(JSON.stringify(validProfile));
    inputEscape.roots[0].input_bundle = "${run}/../outside.yaml";
    assert.throws(
      () =>
        buildCommands({
          profile: inputEscape,
          runDir,
          jarPath,
          javaPath: jbrFixture.javaPath,
          jbrHome: jbrFixture.jbrHome,
          repoRoot,
        }),
      /PATH_ESCAPE/,
      "input path escaping ${run}/bundles must be rejected",
    );

    const outputEscape = JSON.parse(JSON.stringify(validProfile));
    outputEscape.roots[0].output_dir = "${run}/generate/../outside";
    assert.throws(
      () =>
        buildCommands({
          profile: outputEscape,
          runDir,
          jarPath,
          javaPath: jbrFixture.javaPath,
          jbrHome: jbrFixture.jbrHome,
          repoRoot,
        }),
      /PATH_ESCAPE/,
      "output path escaping ${run}/generate must be rejected",
    );
  });

  it("F-02: runGoas emits an explicit blocking omission signal when static-check prerequisites are missing", async () => {
    const evidenceRoot = tmpDir("goas-f02-");
    try {
      const summary = await runGoas({
        runId: "20261007T000000Z",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        commandRunner: noopCommandRunner,
      });

      assert.equal(
        summary.signal,
        "GENERATOR_BLOCKED",
        "expected explicit blocking omission signal when static checks are skipped",
      );
      assert.equal(summary.reason, "STATIC_CHECKS_OMITTED", "expected omission reason");

      const logPath = path.join(summary.run_dir, "logs", "generator-commands.jsonl");
      assert.ok(fs.existsSync(logPath), "expected evidence log");
      const records = fs
        .readFileSync(logPath, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line));
      const found = records.some(
        (r) => r.signal === "GENERATOR_BLOCKED" && r.reason === "STATIC_CHECKS_OMITTED",
      );
      assert.ok(found, "expected a log record with GENERATOR_BLOCKED STATIC_CHECKS_OMITTED");
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("F-03: collectOutputs inventories symlinks with type and target instead of skipping them", async () => {
    const evidenceRoot = tmpDir("goas-f03-");
    try {
      async function outputCreatingRunner({ args }) {
        const outIdx = args.indexOf("-o");
        if (outIdx !== -1) {
          const outputDir = args[outIdx + 1];
          fs.mkdirSync(outputDir, { recursive: true });
          const regular = path.join(outputDir, "regular.txt");
          fs.writeFileSync(regular, "hello");
          fs.symlinkSync("regular.txt", path.join(outputDir, "link.txt"));
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
        runId: "20261007T000001Z",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        commandRunner: outputCreatingRunner,
      });

      const outputsPath = path.join(summary.run_dir, "manifests", "generator-outputs.json");
      const outputs = JSON.parse(fs.readFileSync(outputsPath, "utf8"));
      const adminBff = outputs.roots.find((r) => r.root === "admin-bff");
      assert.ok(adminBff, "expected admin-bff output entry");

      const symlink = adminBff.files.find((f) => f.relative === "link.txt");
      assert.ok(symlink, "expected symlink entry in generator-outputs.json");
      assert.equal(symlink.type, "symlink", "expected symlink type");
      assert.equal(symlink.target, "regular.txt", "expected symlink target");
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("F-04: generate blocked by a validate that hit the deadline is reported as DEADLINE_EXCEEDED, not VALIDATE_NOT_OK", async () => {
    const evidenceRoot = tmpDir("goas-f04-");
    try {
      async function deadlineValidateRunner({ args }) {
        if (args.includes("validate")) {
          return {
            exitCode: 124,
            signal: null,
            timedOut: true,
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
        runId: "20261007T000002Z",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        deadlineMs: 900000,
        commandRunner: deadlineValidateRunner,
      });

      const generateEntries = summary.not_started.filter((n) => n.phase === "generate");
      assert.ok(generateEntries.length > 0, "expected generate entries in not_started");
      for (const entry of generateEntries) {
        assert.notEqual(
          entry.reason,
          "VALIDATE_NOT_OK",
          "generate blocked by a deadline-hit validate must not be reported as VALIDATE_NOT_OK",
        );
        assert.equal(entry.reason, "DEADLINE_EXCEEDED");
      }
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("F-04 debt: GNU timeout exit 124 with timedOut=true is a run-level deadline with evidence", async () => {
    const evidenceRoot = tmpDir("goas-f04-debt-");
    try {
      async function gnuTimeoutRunner({ args }) {
        if (args.includes("validate")) {
          return {
            exitCode: 124,
            signal: null,
            timedOut: true,
            spawnError: null,
            durationMs: 120000,
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
        runId: "20261007T000002Z-debt",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        deadlineMs: 900000,
        commandRunner: gnuTimeoutRunner,
      });

      assert.equal(
        summary.signal,
        "RUN_INCOMPLETE",
        "GNU timeout 124 + timedOut=true must escalate summary.signal to RUN_INCOMPLETE",
      );

      const generateEntries = summary.not_started.filter((n) => n.phase === "generate");
      assert.ok(generateEntries.length > 0, "expected generate entries blocked by deadline");
      for (const entry of generateEntries) {
        assert.equal(entry.reason, "DEADLINE_EXCEEDED");
      }

      const records = readJsonl(summary.run_dir);
      const found = records.some(
        (r) => r.phase === "generate" && r.reason === "DEADLINE_EXCEEDED" && r.signal === "RUN_INCOMPLETE",
      );
      assert.ok(found, "expected evidence log to record DEADLINE_EXCEEDED for blocked generate");
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("F-05: validate/generate commands emit GENERATOR_VALIDATE_RECORDED / GENERATOR_GENERATE_RECORDED", async () => {
    const evidenceRoot = tmpDir("goas-f05-");
    try {
      const summary = await runGoas({
        runId: "20261007T000003Z",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        commandRunner: noopCommandRunner,
      });

      const validateRecords = summary.commands.filter((r) => r.phase === "validate");
      const generateRecords = summary.commands.filter((r) => r.phase === "generate");
      assert.ok(validateRecords.length > 0, "expected validate records");
      assert.ok(generateRecords.length > 0, "expected generate records");

      for (const rec of validateRecords) {
        assert.equal(rec.signal, "GENERATOR_VALIDATE_RECORDED");
      }
      for (const rec of generateRecords) {
        assert.equal(rec.signal, "GENERATOR_GENERATE_RECORDED");
      }
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("F-06: missing format-control case maps to a declared signal and preserves a reason", () => {
    const tmp = tmpDir("goas-f06-");
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
      const signalSet = new Set(runProfile.signals);
      assert.ok(
        signalSet.has(missing.status),
        `status ${missing.status} must be a declared signal (run-profile.json)`,
      );
      assert.ok(
        missing.blocked_reason,
        "expected blocked_reason to be preserved for the missing case",
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("F-07: runMatrixAndMercadoPago cannot omit manifest / cross-check expected 27", () => {
    const tmp = tmpDir("goas-f07-");
    try {
      const matrixPath = path.join(tmp, "matrix.json");
      fs.writeFileSync(matrixPath, JSON.stringify({ cases: [] }));

      const manifest = {
        matrix: {
          expected_case_count: 27,
        },
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
        "expected manifest expected_case_count to be carried through",
      );
      assert.equal(
        result.matrix.count_mismatch,
        true,
        "expected count mismatch for 0/27 cases",
      );
    } finally {
      cleanup(tmp);
    }
  });
});
