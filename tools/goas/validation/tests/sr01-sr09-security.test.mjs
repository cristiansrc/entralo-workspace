// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Security review findings SR-01 .. SR-09 (pack #55).
// Every test below is expected to FAIL against the current implementation and
// turn green once executor applies the corresponding fix without editing tests.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";

import { parseStrictYaml } from "../lib/strict-yaml.mjs";
import { assertCommandAllowed, runCommand } from "../lib/subprocess.mjs";
import { NETWORK_RE } from "../preflight.mjs";
import { runFormatControls } from "../lib/format-controls.mjs";
import { validateProfile, buildCommands } from "../lib/generation.mjs";
import { runGoas, recordEvidence } from "../lib/orchestrator.mjs";
import { writeEvidenceFile } from "../lib/run-guard.mjs";
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

const jbrFixture = createJbrHome("sr01-sr09-jbr-runtime");
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

function buildYaml(depth) {
  let value = "leaf";
  for (let i = 0; i < depth; i += 1) {
    value = `- ${value}`;
  }
  return value;
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

describe("SR-01 .. SR-09 security review red tests", () => {
  it("SR-01: GNU timeout exit 124 with timedOut=false is classified as DEADLINE_EXCEEDED", async () => {
    const evidenceRoot = tmpDir("goas-sr01-");
    try {
      async function gnuTimeoutRunner({ args }) {
        if (args.includes("validate")) {
          return {
            exitCode: 124,
            signal: null,
            timedOut: false,
            spawnError: null,
            durationMs: 120000,
          };
        }
        return noopCommandRunner();
      }

      const summary = await runGoas({
        runId: "20261007T000010Z",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        deadlineMs: 900000,
        commandRunner: gnuTimeoutRunner,
      });

      const generateEntries = summary.not_started.filter((n) => n.phase === "generate");
      assert.ok(generateEntries.length > 0, "expected generate entries blocked by validate");
      for (const entry of generateEntries) {
        assert.equal(
          entry.reason,
          "DEADLINE_EXCEEDED",
          "GNU timeout exit 124 must be reported as DEADLINE_EXCEEDED",
        );
      }
      assert.equal(summary.signal, "RUN_INCOMPLETE", "deadline must set RUN_INCOMPLETE");

      const records = readJsonl(summary.run_dir);
      const found = records.some(
        (r) => r.phase === "generate" && r.reason === "DEADLINE_EXCEEDED" && r.signal === "RUN_INCOMPLETE",
      );
      assert.ok(found, "expected evidence log to record DEADLINE_EXCEEDED for generate");
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("SR-02: depth gate runs before recursive tag walk; deep YAML returns DEPTH_EXCEEDED without EXECUTABLE_TAG", () => {
    const depth = 120;
    // A hostile payload that is both deep and carries an executable tag. The
    // depth gate must fire first; the recursive tag walk must not be reached.
    let value = "!js/function leaf";
    for (let i = 0; i < depth; i += 1) {
      value = `- ${value}`;
    }
    const yaml = value;

    let result;
    try {
      result = parseStrictYaml(yaml, { source: "deep-yaml", maxDepth: 100 });
    } catch (error) {
      if (error instanceof RangeError) {
        assert.fail("RangeError must not escape; depth must be gated before recursion");
      }
      throw error;
    }

    assert.ok(!result.ok, "excessively deep YAML must be rejected");
    assert.ok(
      result.diagnostics.some((d) => d.code === "DEPTH_EXCEEDED"),
      "expected DEPTH_EXCEEDED diagnostic",
    );
    assert.ok(
      !result.diagnostics.some((d) => d.code === "EXECUTABLE_TAG"),
      "recursive tag walk must not run after depth is exceeded",
    );
  });

  it("SR-03: production allowlist rejects a java binary outside jbrHome", () => {
    assert.throws(
      () => assertCommandAllowed("/tmp/evil/java", { mode: "production" }),
      /COMMAND_NOT_ALLOWED|TOOLCHAIN_BLOCKED|PATH_ESCAPE/,
      "only the exact jbrHome/bin/java path must be accepted in production",
    );
  });

  it("SR-03: generator-toolchain.json records java version, bytes and SHA-256", async () => {
    const evidenceRoot = tmpDir("goas-sr03-");
    const jbrHome = tmpDir("goas-sr03-jbr-");
    try {
      const javaPath = path.join(jbrHome, "bin", "java");
      fs.mkdirSync(path.dirname(javaPath), { recursive: true });
      fs.writeFileSync(javaPath, "fake-jbr-java-runtime");

      const summary = await runGoas({
        runId: "20261007T000011Z",
        repoRoot,
        profile: profileWithJbrCustody,
        jarPath,
        javaPath,
        jbrHome,
        evidenceRoot,
        commandRunner: noopCommandRunner,
      });

      const toolchainPath = path.join(summary.run_dir, "manifests", "generator-toolchain.json");
      assert.ok(fs.existsSync(toolchainPath), "expected generator-toolchain.json");
      const toolchain = JSON.parse(fs.readFileSync(toolchainPath, "utf8"));

      assert.ok(toolchain.java.bytes, "java.bytes must be recorded");
      assert.ok(toolchain.java.sha256, "java.sha256 must be recorded");
      assert.ok(toolchain.java.version, "java.version must be recorded");
      assert.equal(typeof toolchain.java.version, "string");
    } finally {
      cleanup(evidenceRoot);
      cleanup(jbrHome);
    }
  });

  it("SR-04: runCommand defaults to fail-closed production mode", async () => {
    assert.throws(
      () => assertCommandAllowed("echo"),
      /COMMAND_NOT_ALLOWED/,
      "default mode must be production and reject bare echo",
    );

    const result = await runCommand({
      command: "echo",
      args: ["hello"],
      timeoutMs: 1000,
    });

    assert.match(
      result.spawnError,
      /COMMAND_NOT_ALLOWED/,
      "default mode must reject bare echo instead of resolving through PATH",
    );
    assert.notEqual(result.exitCode, 0, "bare echo must not succeed in default production mode");
  });

  it("SR-05: NETWORK_RE covers child_process and curl/wget/nc/ssh with URLs", () => {
    assert.ok(
      NETWORK_RE.test('import { spawn } from "node:child_process";'),
      "NETWORK_RE must flag child_process imports",
    );
    assert.ok(
      NETWORK_RE.test('spawn("curl", ["https://example.com"])'),
      "NETWORK_RE must flag spawn curl with a URL",
    );
    assert.ok(
      NETWORK_RE.test('child_process.spawn("wget", ["http://example.com"])'),
      "NETWORK_RE must flag wget with a URL",
    );
    assert.ok(NETWORK_RE.test('exec("nc -l 1234")'), "NETWORK_RE must flag nc");
    assert.ok(
      NETWORK_RE.test('spawn("ssh", ["user@host"])'),
      "NETWORK_RE must flag ssh",
    );
  });

  it("SR-06: runFormatControls rejects matrixPath outside snapshotRoot", () => {
    const tmp = tmpDir("goas-sr06-");
    try {
      const snapshotRoot = path.join(tmp, "snapshot");
      fs.mkdirSync(snapshotRoot, { recursive: true });

      const matrixPath = path.join(tmp, "outside-matrix.json");
      fs.writeFileSync(matrixPath, JSON.stringify({ cases: [] }));

      const manifest = {
        mercado_pago: {
          schema_ref: "api/common.yaml#/components/schemas/Y",
          base_dir: "y",
        },
        format_controls: {
          expect_keyword: "format",
          matrix_case_ids: [],
          mercado_pago_files: [],
        },
      };

      assert.throws(
        () => runFormatControls({ engine: fakeEngine, snapshotRoot, matrixPath, manifest }),
        /PATH_ESCAPE/,
        "matrixPath outside snapshotRoot must be rejected",
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("SR-07: validateProfile rejects slug with path metacharacters", () => {
    const malicious = JSON.parse(JSON.stringify(profileWithJbrCustody));
    malicious.roots[0].slug = "../escape";

    const errors = validateProfile(malicious);
    assert.ok(
      errors.length > 0 && errors.some((e) => /slug|segment|charset|escape/i.test(e)),
      "malicious slug must be rejected by validateProfile",
    );
  });

  it("SR-07: collectInputs does not hash files outside ${run}/bundles", async () => {
    const evidenceRoot = tmpDir("goas-sr07-inputs-");
    const runId = "20261007T000030Z";
    try {
      const malicious = JSON.parse(JSON.stringify(profileWithJbrCustody));
      // Escapes ${run} entirely into the evidenceRoot.
      malicious.roots[0].input_bundle = "${run}/../outside.yaml";

      // Place the file where the escaped path resolves (evidenceRoot/outside.yaml).
      fs.writeFileSync(path.join(evidenceRoot, "outside.yaml"), "secret-content");

      let thrown = null;
      let summary = null;
      try {
        summary = await runGoas({
          runId,
          repoRoot,
          profile: malicious,
          jarPath,
          javaPath: jbrFixture.javaPath,
          jbrHome: jbrFixture.jbrHome,
          evidenceRoot,
          commandRunner: noopCommandRunner,
        });
      } catch (error) {
        thrown = error;
      }

      const blocked = thrown || summary?.signal === "GENERATOR_BLOCKED";
      assert.ok(blocked, "escaped input_bundle must block the run");

      const prePath = path.join(evidenceRoot, runId, "manifests", "generator-inputs.pre.json");
      if (fs.existsSync(prePath)) {
        const pre = JSON.parse(fs.readFileSync(prePath, "utf8"));
        const bundle = pre.bundles.find((b) => b.root === malicious.roots[0].slug);
        assert.ok(
          !bundle || bundle.present === false || bundle.sha256 === undefined,
          "collectInputs must not hash a file outside ${run}/bundles",
        );
      }
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("SR-07: malicious slug cannot create log paths outside ${run}/logs", async () => {
    const evidenceRoot = tmpDir("goas-sr07-");
    try {
      const malicious = JSON.parse(JSON.stringify(profileWithJbrCustody));
      malicious.roots[0].slug = "../escape";

      let capturedPath = null;
      async function capturingRunner(options) {
        capturedPath = options.stdoutPath;
        return noopCommandRunner();
      }

      const summary = await runGoas({
        runId: "20261007T000012Z",
        repoRoot,
        profile: malicious,
        jarPath,
        javaPath: jbrFixture.javaPath,
        jbrHome: jbrFixture.jbrHome,
        evidenceRoot,
        commandRunner: capturingRunner,
      });

      assert.ok(capturedPath, "runner must receive a stdoutPath");
      const logsDir = path.join(summary.run_dir, "logs");
      const rel = path.relative(logsDir, capturedPath);
      assert.ok(
        rel && !rel.startsWith("..") && !path.isAbsolute(rel),
        `stdout path ${capturedPath} escapes ${logsDir}`,
      );
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("SR-08: missing JAR is recorded as GENERATOR_BLOCKED with evidence", async () => {
    const evidenceRoot = tmpDir("goas-sr08-jar-");
    try {
      const missingJar = path.join(evidenceRoot, "missing.jar");

      let summary;
      try {
        summary = await runGoas({
          runId: "20261007T000013Z",
          repoRoot,
          profile: profileWithJbrCustody,
          jarPath: missingJar,
          javaPath: jbrFixture.javaPath,
          jbrHome: jbrFixture.jbrHome,
          evidenceRoot,
          commandRunner: noopCommandRunner,
        });
      } catch (error) {
        assert.fail(`runGoas must not crash on a missing JAR: ${error}`);
      }

      assert.equal(summary.signal, "GENERATOR_BLOCKED", "missing JAR must block the generator");
      assert.ok(
        fs.existsSync(path.join(summary.run_dir, "generator-report.md")),
        "generator-report.md must be written even when the JAR is missing",
      );
      assert.ok(
        fs.existsSync(path.join(summary.run_dir, "logs", "generator-commands.jsonl")),
        "generator-commands.jsonl must be written even when the JAR is missing",
      );
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("SR-08: matrix/schema mismatch is recorded as RUN_INCOMPLETE with evidence", async () => {
    const evidenceRoot = tmpDir("goas-sr08-matrix-");
    const snapshotTmp = tmpDir("goas-sr08-snap-");
    try {
      const matrixPath = path.join(snapshotTmp, "matrix.json");
      fs.writeFileSync(
        matrixPath,
        JSON.stringify({
          cases: Array.from({ length: 26 }, (_, i) => ({
            id: `c${i}`,
            schema_ref: "api/common.yaml#/components/schemas/Y",
            expected_valid: true,
            instance: {},
          })),
        }),
      );

      const fixturesManifest = {
        matrix: { expected_case_count: 27 },
        mercado_pago: {
          schema_ref: "api/common.yaml#/components/schemas/Y",
          base_dir: "mp",
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

      let summary;
      try {
        summary = await runGoas({
          runId: "20261007T000014Z",
          repoRoot,
          profile: profileWithJbrCustody,
          jarPath,
          javaPath: jbrFixture.javaPath,
          jbrHome: jbrFixture.jbrHome,
          evidenceRoot,
          engine: fakeEngine,
          snapshotRoot: snapshotTmp,
          matrixPath,
          fixturesManifest,
          commandRunner: noopCommandRunner,
        });
      } catch (error) {
        assert.fail(`runGoas must not crash on matrix mismatch: ${error}`);
      }

      assert.equal(summary.signal, "RUN_INCOMPLETE", "matrix mismatch must set RUN_INCOMPLETE");
      assert.ok(
        fs.existsSync(path.join(summary.run_dir, "generator-report.md")),
        "generator-report.md must be written even on matrix mismatch",
      );
    } finally {
      cleanup(evidenceRoot);
      cleanup(snapshotTmp);
    }
  });

  it("SR-09: recordEvidence refuses to append to an existing JSONL file", () => {
    const evidenceRoot = tmpDir("goas-sr09-jsonl-");
    try {
      const runDir = path.join(evidenceRoot, "run");
      fs.mkdirSync(path.join(runDir, "logs"), { recursive: true });
      const logPath = path.join(runDir, "logs", "generator-commands.jsonl");
      fs.writeFileSync(logPath, "pre-existing-line\n", { mode: 0o600 });

      assert.throws(
        () =>
          recordEvidence(runDir, {
            phase: "toolchain",
            run_id: "20261007T000015Z",
            signal: "GENERATOR_BLOCKED",
          }),
        /DESTINATION_EXISTS/,
        "appending to an existing evidence log must be refused",
      );
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("SR-09: runGoas converts manifest write EEXIST into a controlled error with evidence", async () => {
    const evidenceRoot = tmpDir("goas-sr09-eexist-");
    try {
      const originalWrite = fs.writeFileSync;
      const eexist = new Error("EEXIST");
      eexist.code = "EEXIST";
      fs.writeFileSync = (target, ...args) => {
        if (String(target).includes("generator-toolchain.json")) {
          throw eexist;
        }
        return originalWrite.call(fs, target, ...args);
      };

      try {
        const summary = await runGoas({
          runId: "20261007T000016Z",
          repoRoot,
          profile: profileWithJbrCustody,
          jarPath,
          javaPath: jbrFixture.javaPath,
          jbrHome: jbrFixture.jbrHome,
          evidenceRoot,
          commandRunner: noopCommandRunner,
        });

        assert.equal(summary.signal, "GENERATOR_BLOCKED", "EEXIST must block the run");
        assert.ok(
          fs.existsSync(path.join(summary.run_dir, "generator-report.md")),
          "report must still be written after a controlled manifest write failure",
        );
        assert.ok(
          fs.existsSync(path.join(summary.run_dir, "logs", "generator-commands.jsonl")),
          "log must still be written after a controlled manifest write failure",
        );
      } finally {
        fs.writeFileSync = originalWrite;
      }
    } finally {
      cleanup(evidenceRoot);
    }
  });

  it("SR-09: custom evidenceRoot branch of writeEvidenceFile rejects symlink escape", () => {
    const tmp = tmpDir("goas-sr09-custom-");
    try {
      const evidenceRoot = path.join(tmp, "evidence");
      fs.mkdirSync(evidenceRoot, { recursive: true });
      const outside = path.join(tmp, "outside");
      fs.mkdirSync(outside, { recursive: true });
      const linkRoot = path.join(tmp, "linkRoot");
      fs.symlinkSync(outside, linkRoot);

      const target = path.join(linkRoot, "run", "file.txt");
      assert.throws(
        () => writeEvidenceFile(target, "x", { evidenceRoot }),
        /PATH_ESCAPE/,
        "custom evidenceRoot must reject writes through a symlinked ancestor",
      );
    } finally {
      cleanup(tmp);
    }
  });
});
