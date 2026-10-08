// red: test-architect (pack #59)
// owner: test-architect — executor must not edit this file.
//
// Pack #59 red tests for reviewer findings N1-N4 and security-reviewer
// findings B-1 + N1-N6 (N7/N8 informational; no tests required).
// Every test below is expected to FAIL against the current implementation and
// turn green once executor applies the corresponding fix without editing tests.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";

import { runGoas } from "../lib/orchestrator.mjs";
import { buildCommands, PER_ROOT_TIMEOUT_MS } from "../lib/generation.mjs";
import {
  cleanup as cleanupJbr,
  createJbrHome,
  noopCommandRunner,
  sha256File,
  withJbrCustody,
  withoutJbrCustody,
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

const jbrFixture = createJbrHome("pack59-jbr-runtime");
const profileWithJbrCustody = withJbrCustody(validProfile, jbrFixture.sha256);

after(() => cleanupJbr(jbrFixture.jbrHome));

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

describe("Pack #59 findings — reviewer N1-N4", () => {
  it("reviewer N1: summary.reason is paired with signal when validate fails without timeout", async () => {
    const evidenceRoot = tmpDir("goas-n1-pair-");
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
        runId: "20261007T000400Z",
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

      assert.equal(summary.signal, "GENERATOR_BLOCKED", "failed validate must escalate signal");
      assert.equal(
        summary.reason,
        "VALIDATE_NOT_OK",
        "summary.reason must be paired with the GENERATOR_BLOCKED signal",
      );
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("reviewer N2: a short GNU timeout 124 is not classified as a full-budget deadline", async () => {
    const evidenceRoot = tmpDir("goas-n2-short-");
    try {
      async function shortGnu124Runner({ args }) {
        if (args.includes("validate")) {
          return {
            exitCode: 124,
            signal: null,
            timedOut: false,
            spawnError: null,
            durationMs: 1,
          };
        }
        return noopCommandRunner();
      }

      const summary = await runGoas({
        runId: "20261007T000401Z",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        deadlineMs: 900000,
        commandRunner: shortGnu124Runner,
      });

      const generateEntries = summary.not_started.filter((n) => n.phase === "generate");
      assert.ok(generateEntries.length > 0, "expected generate entries blocked by validate");
      for (const entry of generateEntries) {
        assert.equal(
          entry.reason,
          "VALIDATE_NOT_OK",
          "short GNU 124 must be reported as VALIDATE_NOT_OK, not DEADLINE_EXCEEDED",
        );
      }
      assert.equal(
        summary.signal,
        "GENERATOR_BLOCKED",
        "short GNU 124 must keep the run at GENERATOR_BLOCKED",
      );
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("reviewer N3: missing JBR digest custody is reported as JBR_DIGEST_UNAVAILABLE", async () => {
    const evidenceRoot = tmpDir("goas-n3-digest-");
    const { jbrHome, javaPath } = createJbrHome("fake-jbr-runtime-n3");
    try {
      const profile = JSON.parse(JSON.stringify(validProfile));
      delete profile.java.sha256_custody;

      const summary = await runGoas({
        runId: "20261007T000402Z",
        repoRoot,
        profile,
        jarPath,
        javaPath,
        jbrHome,
        evidenceRoot,
        commandRunner: noopCommandRunner,
      });

      assert.equal(summary.signal, "TOOLCHAIN_BLOCKED", "missing JBR custody must block toolchain");
      assert.equal(summary.reason, "JBR_DIGEST_UNAVAILABLE", "missing JBR custody reason must be JBR_DIGEST_UNAVAILABLE");

      const records = readJsonl(summary.run_dir);
      const found = records.find(
        (r) =>
          r.phase === "toolchain" &&
          r.signal === "TOOLCHAIN_BLOCKED" &&
          r.reason === "JBR_DIGEST_UNAVAILABLE",
      );
      assert.ok(found, "expected a toolchain evidence record for JBR_DIGEST_UNAVAILABLE");
    } finally {
      cleanup(evidenceRoot);
      cleanup(jbrHome);
    }
  });

  it("reviewer N4a: ensureDir failure after run dir creation is reported", async () => {
    const evidenceRoot = tmpDir("goas-n4-ensuredir-");
    try {
      const originalMkdir = fs.mkdirSync;
      fs.mkdirSync = (target, ...args) => {
        if (String(target).includes("manifests")) {
          const error = new Error("EACCES");
          error.code = "EACCES";
          throw error;
        }
        return originalMkdir.call(fs, target, ...args);
      };

      let summary;
      try {
        summary = await runGoas({
          runId: "20261007T000403Z",
          repoRoot,
          profile: profileWithJbrCustody,
          jarPath,
          javaPath: jbrFixture.javaPath,
          jbrHome: jbrFixture.jbrHome,
          evidenceRoot,
          commandRunner: noopCommandRunner,
        });
      } finally {
        fs.mkdirSync = originalMkdir;
      }

      assert.notEqual(summary.signal, "RUN_RECORDED", "ensureDir failure must escalate signal");
      assert.ok(
        summary.reason,
        "ensureDir failure must set a summary.reason instead of remaining null",
      );
      assert.ok(
        fs.existsSync(path.join(summary.run_dir, "generator-report.md")),
        "report must still be written after an ensureDir failure",
      );
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("reviewer N4b: missing required orchestrator input is classified as ORCHESTRATOR_INPUT_INVALID", async () => {
    let summary;
    let thrown;
    try {
      summary = await runGoas({
        runId: "20261007T000404Z",
        repoRoot,
        profile: null,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
      });
    } catch (error) {
      thrown = error;
    }

    const outcome = thrown || summary;
    assert.ok(outcome, "expected a controlled outcome");
    assert.equal(
      outcome.signal,
      "GENERATOR_BLOCKED",
      "missing input must be classified as GENERATOR_BLOCKED",
    );
    assert.equal(
      outcome.reason,
      "ORCHESTRATOR_INPUT_INVALID",
      "missing input reason must be ORCHESTRATOR_INPUT_INVALID",
    );
  });

  it("reviewer N4c: buildCommands failure is reported with a distinct command-build phase", async () => {
    const evidenceRoot = tmpDir("goas-n4-phase-");
    try {
      const profile = JSON.parse(JSON.stringify(profileWithJbrCustody));
      profile.generator.generatorName = "not-approved";

      const summary = await runGoas({
        runId: "20261007T000405Z",
        repoRoot,
        profile,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        commandRunner: noopCommandRunner,
      });

      assert.equal(summary.signal, "GENERATOR_BLOCKED", "buildCommands failure must block run");
      const records = readJsonl(summary.run_dir);
      const found = records.find((r) => r.signal === "GENERATOR_BLOCKED");
      assert.ok(found, "expected an evidence record for buildCommands failure");
      assert.equal(
        found.phase,
        "command_build",
        "buildCommands failure must be reported with a dedicated command-build phase",
      );
    } finally {
      cleanup(evidenceRoot);
    }
  });
});

describe("Pack #59 findings — security B-1 + N1-N6", () => {
  it("security B-1: missing official JBR custody blocks and does not invent a checksum", async () => {
    const evidenceRoot = tmpDir("goas-b1-custody-");
    const { jbrHome, javaPath } = createJbrHome("fake-jbr-runtime-b1");
    try {
      const profile = JSON.parse(JSON.stringify(validProfile));
      delete profile.java.sha256_custody;

      const summary = await runGoas({
        runId: "20261007T000406Z",
        repoRoot,
        profile,
        jarPath,
        javaPath,
        jbrHome,
        evidenceRoot,
        commandRunner: noopCommandRunner,
      });

      assert.equal(summary.signal, "TOOLCHAIN_BLOCKED", "missing JBR custody must block run");
      assert.equal(summary.reason, "JBR_DIGEST_UNAVAILABLE", "reason must be JBR_DIGEST_UNAVAILABLE");

      const toolchainPath = path.join(summary.run_dir, "manifests", "generator-toolchain.json");
      assert.ok(fs.existsSync(toolchainPath), "toolchain manifest must still be written");
      const toolchain = JSON.parse(fs.readFileSync(toolchainPath, "utf8"));
      assert.ok(
        toolchain.java.sha256,
        "observed JBR digest may be recorded as evidence but not as approval",
      );
      assert.equal(
        profile.java.sha256_custody,
        undefined,
        "profile must not be auto-filled with an invented checksum",
      );
    } finally {
      cleanup(evidenceRoot);
      cleanup(jbrHome);
    }
  });

  it("security N1: missing JAR custody fails closed", async () => {
    const evidenceRoot = tmpDir("goas-sn1-jar-");
    try {
      const { snapshotRoot, matrixPath, fixturesManifest } = createPassingSnapshot(evidenceRoot);
      const profile = JSON.parse(JSON.stringify(profileWithJbrCustody));
      delete profile.generator.jar_sha256_custody;

      const summary = await runGoas({
        runId: "20261007T000407Z",
        repoRoot,
        profile,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        engine: passingEngine,
        snapshotRoot,
        matrixPath,
        fixturesManifest,
        commandRunner: noopCommandRunner,
      });

      assert.equal(summary.signal, "GENERATOR_BLOCKED", "missing JAR custody must fail closed");
      assert.equal(summary.reason, "JAR_CUSTODY_MISSING", "missing JAR custody reason must be JAR_CUSTODY_MISSING");
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("security N2: command loop escalation sets summary.reason", async () => {
    const evidenceRoot = tmpDir("goas-sn2-reason-");
    try {
      const { snapshotRoot, matrixPath, fixturesManifest } = createPassingSnapshot(evidenceRoot);

      async function timeoutRunner({ args }) {
        if (args.includes("validate")) {
          return {
            exitCode: 0,
            signal: null,
            timedOut: true,
            spawnError: null,
            durationMs: 1,
          };
        }
        return noopCommandRunner();
      }

      const summary = await runGoas({
        runId: "20261007T000408Z",
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
        commandRunner: timeoutRunner,
      });

      assert.equal(summary.signal, "RUN_INCOMPLETE", "loop timeout must escalate signal");
      assert.ok(summary.reason, "loop escalation must set summary.reason");
      assert.equal(
        summary.reason,
        "DEADLINE_EXCEEDED",
        "loop escalation reason must be DEADLINE_EXCEEDED",
      );
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("security N3: absent JBR home blocks the run upfront", async () => {
    const evidenceRoot = tmpDir("goas-sn3-home-");
    try {
      const missingJbrHome = "/opt/this-jbr-home-does-not-exist";
      const matchingJavaPath = path.join(missingJbrHome, "bin", "java");

      const summary = await runGoas({
        runId: "20261007T000409Z",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath: matchingJavaPath,
        jbrHome: missingJbrHome,
        evidenceRoot,
        commandRunner: noopCommandRunner,
      });

      assert.equal(summary.signal, "TOOLCHAIN_BLOCKED", "absent JBR home must block upfront");
      assert.equal(summary.reason, "JBR_HOME_MISSING", "absent JBR home reason must be JBR_HOME_MISSING");
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("security N4: EACCES errors are distinguished from ENOENT", async () => {
    const evidenceRoot = tmpDir("goas-sn4-eacces-");
    try {
      const originalMkdir = fs.mkdirSync;
      fs.mkdirSync = (target, ...args) => {
        if (String(target).includes("logs")) {
          const error = new Error("EACCES");
          error.code = "EACCES";
          throw error;
        }
        return originalMkdir.call(fs, target, ...args);
      };

      let summary;
      try {
        summary = await runGoas({
          runId: "20261007T000410Z",
          repoRoot,
          profile: profileWithJbrCustody,
          jarPath,
          javaPath: jbrFixture.javaPath,
          jbrHome: jbrFixture.jbrHome,
          evidenceRoot,
          commandRunner: noopCommandRunner,
        });
      } finally {
        fs.mkdirSync = originalMkdir;
      }

      assert.equal(summary.signal, "GENERATOR_BLOCKED", "EACCES must block the run");
      assert.equal(
        summary.reason,
        "EACCES",
        "EACCES must be reported with its own reason, not swallowed into TOOLCHAIN_BLOCKED/ENOENT",
      );
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("security N5: report_write_error is persisted as durable evidence", async () => {
    const evidenceRoot = tmpDir("goas-sn5-report-");
    try {
      const originalWrite = fs.writeFileSync;
      fs.writeFileSync = (target, ...args) => {
        if (String(target).includes("generator-report.md")) {
          const error = new Error("report write refused");
          error.code = "EACCES";
          throw error;
        }
        return originalWrite.call(fs, target, ...args);
      };

      let summary;
      try {
        summary = await runGoas({
          runId: "20261007T000411Z",
          repoRoot,
          profile: profileWithJbrCustody,
          jarPath,
          javaPath: jbrFixture.javaPath,
          jbrHome: jbrFixture.jbrHome,
          evidenceRoot,
          commandRunner: noopCommandRunner,
        });
      } finally {
        fs.writeFileSync = originalWrite;
      }

      assert.ok(summary.report_write_error, "report write error must surface in summary");

      const durablePaths = [
        path.join(summary.run_dir, "generator-report.md.error"),
        path.join(summary.run_dir, "logs", "generator-report-error.jsonl"),
      ];
      const persisted = durablePaths.some((p) => {
        if (!fs.existsSync(p)) return false;
        const content = fs.readFileSync(p, "utf8");
        return content.includes("report write refused");
      });
      assert.ok(
        persisted,
        "report_write_error must be persisted to durable evidence, not kept only in memory",
      );
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("security N6: per-root timeout is linked to run-profile, not a hardcoded constant", () => {
    const customProfile = JSON.parse(JSON.stringify(runProfile));
    customProfile.timeouts_ms.generator_validate_per_root = 60000;
    customProfile.timeouts_ms.generator_generate_per_root = 60000;

    const commands = buildCommands({
      profile: profileWithJbrCustody,
      runDir: "/tmp/opencode/entralo-v1-executable-specs/20261007T000000Z",
      jarPath,
      javaPath: jbrFixture.javaPath,
      jbrHome: jbrFixture.jbrHome,
      repoRoot,
      runProfile: customProfile,
    });

    for (const cmd of commands) {
      assert.equal(
        cmd.timeout_ms,
        60000,
        "buildCommands must use the timeout from run-profile, not a hardcoded constant",
      );
    }

    assert.notEqual(
      PER_ROOT_TIMEOUT_MS,
      60000,
      "sanity: the hardcoded constant differs from the custom profile value",
    );
  });
});
