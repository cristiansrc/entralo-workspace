// red: test-architect (entralo-v1-executable-specs pack #66)
// owner: test-architect — executor must not edit this file.
//
// TDD/contract tests for the G-OAS reproducible entrypoint.
// Authority: plan §6 (protocolo de corrida y evidencia), §16.2–§16.5,
//            run-profile.json, generation-profile.json.
// The entrypoint module does not exist yet, so each test fails explicitly on
// import failure instead of cancelling sibling tests.
//
// Scope:
//   (b) a reproducible entrypoint that assigns run_id, prepares/validates env,
//       passes bundles to runGoas, and keeps evidence controls.

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import * as bundler from "../lib/bundler.mjs";
import * as orchestrator from "../lib/orchestrator.mjs";

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

async function loadEntrypoint() {
  try {
    return await import("../lib/entrypoint.mjs");
  } catch (err) {
    assert.fail(`entrypoint module is missing: ${err.message}`);
  }
}

describe("G-OAS entrypoint (plan §6 / §16.2–§16.5)", () => {
  it("exports runEntrypoint", async () => {
    const entrypoint = await loadEntrypoint();
    assert.ok(entrypoint.runEntrypoint, "expected runEntrypoint exported");
    assert.equal(typeof entrypoint.runEntrypoint, "function");
  });

  it("exports assignRunId", async () => {
    const entrypoint = await loadEntrypoint();
    assert.ok(entrypoint.assignRunId, "expected assignRunId exported");
    assert.equal(typeof entrypoint.assignRunId, "function");
  });

  it("exports validateEnv", async () => {
    const entrypoint = await loadEntrypoint();
    assert.ok(entrypoint.validateEnv, "expected validateEnv exported");
    assert.equal(typeof entrypoint.validateEnv, "function");
  });

  it("assignRunId creates a run_id matching run-profile.json pattern", async () => {
    const entrypoint = await loadEntrypoint();
    const runId = entrypoint.assignRunId();
    assert.match(
      runId,
      /^[0-9]{8}T[0-9]{6,9}Z(-[A-Za-z0-9]{1,64})?$/,
      "run_id must match the approved pattern",
    );
  });

  it("assignRunId rejects an explicitly invalid run_id", async () => {
    const entrypoint = await loadEntrypoint();
    assert.throws(() => entrypoint.assignRunId("not-a-run-id"), /RUN_ID_INVALID/);
  });

  it("validateEnv requires absolute JBR25_JAVA", async () => {
    const entrypoint = await loadEntrypoint();
    assert.throws(
      () =>
        entrypoint.validateEnv({
          JBR25_JAVA: "java",
          JBR25_HOME: "/opt/jbr",
          redoclyPath: "/tools/goas/node_modules/.bin/redocly",
          jarPath: "/tools/goas/vendor/tarballs/openapi-generator-cli.jar",
        }),
      /JBR25_JAVA|absolute/,
    );
  });

  it("validateEnv requires absolute JBR25_HOME", async () => {
    const entrypoint = await loadEntrypoint();
    assert.throws(
      () =>
        entrypoint.validateEnv({
          JBR25_JAVA: "/opt/jbr/bin/java",
          JBR25_HOME: "jbr",
          redoclyPath: "/tools/goas/node_modules/.bin/redocly",
          jarPath: "/tools/goas/vendor/tarballs/openapi-generator-cli.jar",
        }),
      /JBR25_HOME|absolute/,
    );
  });

  it("validateEnv requires absolute redoclyPath", async () => {
    const entrypoint = await loadEntrypoint();
    assert.throws(
      () =>
        entrypoint.validateEnv({
          JBR25_JAVA: "/opt/jbr/bin/java",
          JBR25_HOME: "/opt/jbr",
          redoclyPath: "redocly",
          jarPath: "/tools/goas/vendor/tarballs/openapi-generator-cli.jar",
        }),
      /redoclyPath|absolute/,
    );
  });

  it("validateEnv rejects Java from PATH / default / Java 26", async () => {
    const entrypoint = await loadEntrypoint();
    for (const badJava of [
      "/usr/bin/java",
      "/usr/lib/jvm/default/bin/java",
      "/opt/jbr-26/bin/java",
    ]) {
      assert.throws(
        () =>
          entrypoint.validateEnv({
            JBR25_JAVA: badJava,
            JBR25_HOME: "/opt/jbr",
            redoclyPath: "/tools/goas/node_modules/.bin/redocly",
            jarPath: "/tools/goas/vendor/tarballs/openapi-generator-cli.jar",
          }),
        /Java 26|PATH|default|forbidden/,
        `expected rejection for ${badJava}`,
      );
    }
  });

  it("runEntrypoint bundles before invoking runGoas", async () => {
    const entrypoint = await loadEntrypoint();
    const tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), "goas-entrypoint-order-repo-"));
    const tmpEvidence = fs.mkdtempSync(path.join(os.tmpdir(), "goas-entrypoint-order-ev-"));
    const runId = "20261007T120000Z-order";

    let bundleCalled = false;
    let runGoasCalled = false;
    let bundlesPassed = null;

    const deps = {
      bundleRoots: async (opts) => {
        bundleCalled = true;
        return {
          bundles: [{ root: "catalog", path: path.join(opts.runDir, "bundles", "catalog.yaml") }],
          manifestPath: path.join(opts.runDir, "manifests", "generator-inputs.pre.json"),
          commands: [],
          unresolvedRefs: [],
        };
      },
      runGoas: async (opts) => {
        runGoasCalled = true;
        bundlesPassed = opts.bundles;
        return { run_id: runId, signal: "RUN_RECORDED" };
      },
    };

    try {
      await entrypoint.runEntrypoint({
        runId,
        repoRoot: tmpRepo,
        JBR25_JAVA: "/opt/jbr/bin/java",
        JBR25_HOME: "/opt/jbr",
        redoclyPath: "/tools/goas/node_modules/.bin/redocly",
        jarPath: "/tools/goas/vendor/tarballs/openapi-generator-cli.jar",
        evidenceRoot: tmpEvidence,
        deps,
      });

      assert.equal(bundleCalled, true, "bundler must be called");
      assert.equal(runGoasCalled, true, "runGoas must be called");
      assert.ok(Array.isArray(bundlesPassed), "runGoas must receive bundles");
      assert.equal(bundlesPassed.length, 1);
    } finally {
      cleanup(tmpRepo);
      cleanup(tmpEvidence);
    }
  });

  it("runEntrypoint writes pre and post manifests", async () => {
    const entrypoint = await loadEntrypoint();
    const tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), "goas-entrypoint-manifests-repo-"));
    const tmpEvidence = fs.mkdtempSync(path.join(os.tmpdir(), "goas-entrypoint-manifests-ev-"));
    const runId = "20261007T120001Z-manifests";

    const deps = {
      bundleRoots: async (opts) => ({
        bundles: [{ root: "catalog", path: path.join(opts.runDir, "bundles", "catalog.yaml"), bytes: 10, sha256: "0".repeat(64) }],
        manifestPath: path.join(opts.runDir, "manifests", "generator-inputs.pre.json"),
        commands: [],
        unresolvedRefs: [],
      }),
      runGoas: async () => ({ run_id: runId, signal: "RUN_RECORDED" }),
    };

    try {
      await entrypoint.runEntrypoint({
        runId,
        repoRoot: tmpRepo,
        JBR25_JAVA: "/opt/jbr/bin/java",
        JBR25_HOME: "/opt/jbr",
        redoclyPath: "/tools/goas/node_modules/.bin/redocly",
        jarPath: "/tools/goas/vendor/tarballs/openapi-generator-cli.jar",
        evidenceRoot: tmpEvidence,
        deps,
      });

      const pre = path.join(tmpEvidence, runId, "manifests", "generator-inputs.pre.json");
      const post = path.join(tmpEvidence, runId, "manifests", "generator-inputs.post.json");
      assert.ok(fs.existsSync(pre), "pre-manifest must exist");
      assert.ok(fs.existsSync(post), "post-manifest must exist");
    } finally {
      cleanup(tmpRepo);
      cleanup(tmpEvidence);
    }
  });

  it("runEntrypoint does not execute the generator (commandRunner is mocked)", async () => {
    const entrypoint = await loadEntrypoint();
    const tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), "goas-entrypoint-nogen-repo-"));
    const tmpEvidence = fs.mkdtempSync(path.join(os.tmpdir(), "goas-entrypoint-nogen-ev-"));
    const runId = "20261007T120002Z-nogen";

    let commandRunnerCalls = 0;
    const deps = {
      bundleRoots: async (opts) => ({
        bundles: [{ root: "catalog", path: path.join(opts.runDir, "bundles", "catalog.yaml") }],
        manifestPath: path.join(opts.runDir, "manifests", "generator-inputs.pre.json"),
        commands: [],
        unresolvedRefs: [],
      }),
      runGoas: async () => ({ run_id: runId, signal: "RUN_RECORDED" }),
      commandRunner: async () => {
        commandRunnerCalls += 1;
        return { exitCode: 0, durationMs: 1, timedOut: false, spawnError: null };
      },
    };

    try {
      await entrypoint.runEntrypoint({
        runId,
        repoRoot: tmpRepo,
        JBR25_JAVA: "/opt/jbr/bin/java",
        JBR25_HOME: "/opt/jbr",
        redoclyPath: "/tools/goas/node_modules/.bin/redocly",
        jarPath: "/tools/goas/vendor/tarballs/openapi-generator-cli.jar",
        evidenceRoot: tmpEvidence,
        deps,
      });

      assert.equal(commandRunnerCalls, 0, "entrypoint must not itself spawn the generator");
    } finally {
      cleanup(tmpRepo);
      cleanup(tmpEvidence);
    }
  });

  it("runEntrypoint refuses evidenceRoot equal to or inside the repository", async () => {
    const entrypoint = await loadEntrypoint();
    const tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), "goas-entrypoint-inside-repo-"));
    const runId = "20261007T120003Z-inside";

    const deps = {
      bundleRoots: async () => ({ bundles: [], manifestPath: "", commands: [], unresolvedRefs: [] }),
      runGoas: async () => ({ run_id: runId, signal: "RUN_RECORDED" }),
    };

    try {
      await assert.rejects(
        entrypoint.runEntrypoint({
          runId,
          repoRoot: tmpRepo,
          JBR25_JAVA: "/opt/jbr/bin/java",
          JBR25_HOME: "/opt/jbr",
          redoclyPath: "/tools/goas/node_modules/.bin/redocly",
          jarPath: "/tools/goas/vendor/tarballs/openapi-generator-cli.jar",
          evidenceRoot: tmpRepo,
          deps,
        }),
        /EVIDENCE_INSIDE_REPO|PATH_ESCAPE|evidence.*repository/,
        "evidenceRoot equal to repoRoot must be rejected",
      );

      await assert.rejects(
        entrypoint.runEntrypoint({
          runId: "20261007T120004Z-sub",
          repoRoot: tmpRepo,
          JBR25_JAVA: "/opt/jbr/bin/java",
          JBR25_HOME: "/opt/jbr",
          redoclyPath: "/tools/goas/node_modules/.bin/redocly",
          jarPath: "/tools/goas/vendor/tarballs/openapi-generator-cli.jar",
          evidenceRoot: path.join(tmpRepo, "evidence"),
          deps,
        }),
        /EVIDENCE_INSIDE_REPO|PATH_ESCAPE|evidence.*repository/,
        "evidenceRoot inside repoRoot must be rejected",
      );
    } finally {
      cleanup(tmpRepo);
    }
  });

  it("runEntrypoint uses the evidence_root from run-profile when not overridden", async () => {
    const entrypoint = await loadEntrypoint();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-entrypoint-root-"));
    const runId = "20261007T120004Z-root";

    let evidenceRootSeen = null;
    const deps = {
      bundleRoots: async (opts) => {
        evidenceRootSeen = opts.runDir ? path.dirname(opts.runDir) : null;
        return { bundles: [], manifestPath: "", commands: [], unresolvedRefs: [] };
      },
      runGoas: async (opts) => {
        evidenceRootSeen = path.dirname(opts.runDir);
        return { run_id: runId, signal: "RUN_RECORDED" };
      },
    };

    try {
      await entrypoint.runEntrypoint({
        runId,
        repoRoot: tmp,
        JBR25_JAVA: "/opt/jbr/bin/java",
        JBR25_HOME: "/opt/jbr",
        redoclyPath: "/tools/goas/node_modules/.bin/redocly",
        jarPath: "/tools/goas/vendor/tarballs/openapi-generator-cli.jar",
        deps,
      });

      assert.equal(evidenceRootSeen, "/tmp/opencode/entralo-v1-executable-specs");
    } finally {
      cleanup(tmp);
    }
  });

  it("runEntrypoint requires commonPath as a shared input", async () => {
    const entrypoint = await loadEntrypoint();
    const tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), "goas-entrypoint-common-missing-repo-"));
    const tmpEvidence = fs.mkdtempSync(path.join(os.tmpdir(), "goas-entrypoint-common-missing-ev-"));
    const runId = "20261007T120005Z-common";

    const deps = {
      bundleRoots: async () => ({ bundles: [], manifestPath: "", commands: [], unresolvedRefs: [] }),
      runGoas: async () => ({ run_id: runId, signal: "RUN_RECORDED" }),
    };

    try {
      await assert.rejects(
        entrypoint.runEntrypoint({
          runId,
          repoRoot: tmpRepo,
          JBR25_JAVA: "/opt/jbr/bin/java",
          JBR25_HOME: "/opt/jbr",
          redoclyPath: "/tools/goas/node_modules/.bin/redocly",
          jarPath: "/tools/goas/vendor/tarballs/openapi-generator-cli.jar",
          evidenceRoot: tmpEvidence,
          snapshotRoot: path.join(tmpRepo, "snapshot"),
          // commonPath intentionally omitted
          deps,
        }),
        /COMMON_PATH_REQUIRED|commonPath required|ENTRYPOINT_INPUT_INVALID.*common/,
      );
    } finally {
      cleanup(tmpRepo);
      cleanup(tmpEvidence);
    }
  });

  it("integration: entrypoint → bundler → runGoas real coexists without prepareRunDir collision", async () => {
    const entrypoint = await loadEntrypoint();
    const tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), "goas-int-repo-"));
    const tmpEvidence = fs.mkdtempSync(path.join(os.tmpdir(), "goas-int-ev-"));
    const runId = "20261007T120010Z-integration";

    const roots = [
      "admin-bff",
      "buyer-bff",
      "catalog",
      "identity",
      "payments",
      "purchases",
      "ticketing",
    ];

    const snapshotRoot = path.join(tmpEvidence, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });
    for (const root of roots) {
      fs.writeFileSync(path.join(snapshotRoot, "api", `${root}.yaml`), `openapi: 3.1.0\npaths: {}\n`);
    }
    fs.writeFileSync(
      path.join(snapshotRoot, "api", "common.yaml"),
      `openapi: 3.1.0\ncomponents:\n  schemas:\n    Money:\n      type: object\n`,
    );

    // fake toolchain with custody digests matching the profile override
    const jbrHome = path.join(tmpEvidence, "jbr");
    const javaPath = path.join(jbrHome, "bin", "java");
    const jarPath = path.join(tmpEvidence, "openapi-generator-cli.jar");
    fs.mkdirSync(path.dirname(javaPath), { recursive: true });
    const javaContent = "fake-jbr-25-java";
    const jarContent = "fake-generator-jar";
    fs.writeFileSync(javaPath, javaContent);
    fs.writeFileSync(jarPath, jarContent);
    const javaSha = sha256(javaContent);
    const jarSha = sha256(jarContent);

    const redoclyPath = path.join(tmpEvidence, "redocly");

    const mockRunner = async () => ({
      exitCode: 0,
      durationMs: 1,
      timedOut: false,
      spawnError: null,
    });

    const bundleRootsWrapper = async (opts) => bundler.bundleRoots({ ...opts, runCommand: mockRunner });

    const runGoasWrapper = async (opts) => {
      const modifiedProfile = structuredClone(opts.profile);
      modifiedProfile.generator.jar_sha256_custody = jarSha;
      modifiedProfile.java.sha256_custody = javaSha;
      return orchestrator.runGoas({ ...opts, profile: modifiedProfile, commandRunner: mockRunner });
    };

    try {
      const result = await entrypoint.runEntrypoint({
        runId,
        repoRoot: tmpRepo,
        JBR25_JAVA: javaPath,
        JBR25_HOME: jbrHome,
        redoclyPath,
        jarPath,
        evidenceRoot: tmpEvidence,
        snapshotRoot,
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        deps: {
          bundleRoots: bundleRootsWrapper,
          runGoas: runGoasWrapper,
        },
      });

      const runDir = path.join(tmpEvidence, runId);
      assert.ok(
        fs.existsSync(path.join(runDir, "manifests", "generator-inputs.pre.json")),
        "entrypoint pre-manifest must exist",
      );
      assert.ok(
        fs.existsSync(path.join(runDir, "manifests", "generator-inputs.post.json")),
        "entrypoint post-manifest must exist",
      );
      assert.ok(
        fs.existsSync(path.join(runDir, "manifests", "generator-toolchain.json")),
        "runGoas toolchain manifest must coexist",
      );
      assert.ok(fs.existsSync(path.join(runDir, "generator-report.md")), "runGoas report must coexist");
      assert.equal(result.run_id, runId);
      assert.equal(result.run.signal, "RUN_RECORDED");
    } finally {
      cleanup(tmpRepo);
      cleanup(tmpEvidence);
    }
  });
});
