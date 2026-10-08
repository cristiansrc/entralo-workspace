// red: test-architect (entralo-v1-executable-specs pack #66)
// owner: test-architect — executor must not edit this file.
//
// TDD/contract tests for the Redocly bundle adapter.
// Authority: plan §6 (protocolo de corrida y evidencia), §16.2–§16.5,
//            run-profile.json, generation-profile.json.
// The bundler module does not exist yet, so each test fails explicitly on
// import failure instead of cancelling sibling tests.
//
// Scope:
//   (a) bundle the 7 roots using a local/offline Redocly CLI,
//       resolving common component refs, no network, output confined to runDir,
//       with hashes + pre-manifest;
//   (c) refuse/follow no .invalid hosts.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

/** Write a valid documentary common.yaml so tests isolate the error under evaluation. */
function writeValidCommon(snapshotRoot) {
  fs.writeFileSync(path.join(snapshotRoot, "api", "common.yaml"), `openapi: 3.1.0\n`);
}

async function loadBundler() {
  try {
    return await import("../lib/bundler.mjs");
  } catch (err) {
    assert.fail(`bundler module is missing: ${err.message}`);
  }
}

describe("bundler adapter (plan §6 / §16.2–§16.5)", () => {
  it("exports bundleRoots", async () => {
    const bundler = await loadBundler();
    assert.ok(bundler.bundleRoots, "expected bundleRoots exported");
    assert.equal(typeof bundler.bundleRoots, "function");
  });

  it("AC-T16-ROOT: bundleRoots produces exactly 7 root bundles", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-bundler-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    const roots = [
      "admin-bff",
      "buyer-bff",
      "catalog",
      "identity",
      "payments",
      "purchases",
      "ticketing",
    ];
    for (const root of roots) {
      fs.writeFileSync(path.join(snapshotRoot, "api", `${root}.yaml`), `openapi: 3.1.0\n`);
    }
    fs.writeFileSync(path.join(snapshotRoot, "api", "common.yaml"), `openapi: 3.1.0\n`);

    let calls = 0;
    const runCommand = async () => {
      calls += 1;
      return { exitCode: 0, durationMs: 1, timedOut: false, spawnError: null };
    };

    try {
      const result = await bundler.bundleRoots({
        redoclyPath: "/tools/goas/node_modules/.bin/redocly",
        snapshotRoot,
        runDir,
        roots,
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });

      assert.equal(result.bundles.length, 7, "expected 7 bundles");
      for (const root of roots) {
        const expectedPath = path.join(runDir, "bundles", `${root}.yaml`);
        const found = result.bundles.find((b) => b.root === root);
        assert.ok(found, `missing bundle for ${root}`);
        assert.equal(found.path, expectedPath);
      }
      assert.equal(calls, 7, "expected one Redocly invocation per root");
    } finally {
      cleanup(tmp);
    }
  });

  it("AC-T16-ROOT: common is documentary and manifested as a shared input", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-bundler-common-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), `openapi: 3.1.0\n`);
    fs.writeFileSync(path.join(snapshotRoot, "api", "common.yaml"), `openapi: 3.1.0\n`);

    const runCommand = async () => ({ exitCode: 0, durationMs: 1, timedOut: false, spawnError: null });

    try {
      const result = await bundler.bundleRoots({
        redoclyPath: "/tools/goas/node_modules/.bin/redocly",
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });

      const commonBundle = result.bundles.find((b) => b.root === "common");
      assert.equal(commonBundle, undefined, "common must not be a generated bundle");
      assert.ok(fs.existsSync(result.manifestPath), "pre-manifest must exist");
      const manifest = JSON.parse(fs.readFileSync(result.manifestPath, "utf8"));
      assert.ok(manifest.common, "manifest must record common as a shared input");
      assert.equal(manifest.common.documentary, true);
      assert.equal(manifest.common.bundled, false);
      assert.ok(path.isAbsolute(manifest.common.path), "common.path must be absolute");
    } finally {
      cleanup(tmp);
    }
  });

  it("AC-T06: writes a pre-manifest with bytes and SHA-256 per bundle", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-bundler-manifest-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), `openapi: 3.1.0\npaths: {}\n`);
    writeValidCommon(snapshotRoot);

    const runCommand = async () => ({ exitCode: 0, durationMs: 1, timedOut: false, spawnError: null });

    try {
      const result = await bundler.bundleRoots({
        redoclyPath: "/tools/goas/node_modules/.bin/redocly",
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });

      assert.ok(result.manifestPath, "expected manifestPath");
      assert.ok(
        result.manifestPath.startsWith(path.join(runDir, "manifests")),
        "manifest must be inside runDir",
      );
      assert.ok(fs.existsSync(result.manifestPath), "pre-manifest file must exist");
      const manifest = JSON.parse(fs.readFileSync(result.manifestPath, "utf8"));
      assert.equal(manifest.bundles.length, 1);
      assert.equal(typeof manifest.bundles[0].bytes, "number");
      assert.match(manifest.bundles[0].sha256, /^[0-9a-f]{64}$/);
    } finally {
      cleanup(tmp);
    }
  });

  it("AC-T06: records argv, exit, timestamps and duration for each Redocly call", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-bundler-evidence-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });
    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), `openapi: 3.1.0\n`);
    writeValidCommon(snapshotRoot);

    const runCommand = async () => ({
      exitCode: 0,
      durationMs: 42,
      timedOut: false,
      spawnError: null,
    });

    try {
      const result = await bundler.bundleRoots({
        redoclyPath: "/tools/goas/node_modules/.bin/redocly",
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });

      assert.ok(Array.isArray(result.commands), "expected commands array");
      assert.equal(result.commands.length, 1);
      const cmd = result.commands[0];
      assert.equal(cmd.phase, "bundle");
      assert.equal(cmd.root, "catalog");
      assert.equal(cmd.exit_code, 0);
      assert.equal(cmd.duration_ms, 42);
      assert.ok(cmd.started_at, "expected started_at timestamp");
      assert.ok(Array.isArray(cmd.argv), "expected argv array");
      assert.ok(cmd.argv.includes("bundle"), "argv must include Redocly bundle subcommand");
    } finally {
      cleanup(tmp);
    }
  });

  it("D-T03/AC-T03: output is confined to ${runDir}/bundles", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-bundler-confine-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });
    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), `openapi: 3.1.0\n`);
    writeValidCommon(snapshotRoot);

    const runCommand = async () => ({ exitCode: 0, durationMs: 1, timedOut: false, spawnError: null });

    try {
      await assert.rejects(
        bundler.bundleRoots({
          redoclyPath: "/tools/goas/node_modules/.bin/redocly",
          snapshotRoot,
          runDir: path.join(tmp, "..", "escape", "run"),
          roots: ["catalog"],
          commonPath: path.join(snapshotRoot, "api", "common.yaml"),
          runCommand,
        }),
        /PATH_ESCAPE|OUTPUT_NOT_CONTAINED/,
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("§5: resolves common component refs offline without network", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-bundler-refs-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    fs.writeFileSync(
      path.join(snapshotRoot, "api", "common.yaml"),
      `openapi: 3.1.0\ncomponents:\n  schemas:\n    Money:\n      type: object\n`,
    );
    fs.writeFileSync(
      path.join(snapshotRoot, "api", "catalog.yaml"),
      `openapi: 3.1.0\npaths:\n  /items:\n    get:\n      responses:\n        '200':\n          description: ok\n          content:\n            application/json:\n              schema:\n                $ref: './common.yaml#/components/schemas/Money'\n`,
    );

    const runCommand = async (options) => {
      const argv = options.args ?? options.argv ?? [];
      const hasNetworkFlag = argv.some((a) => /network|online|resolve/i.test(String(a)));
      assert.equal(hasNetworkFlag, false, "bundler must not pass online/network flags to Redocly");
      return { exitCode: 0, durationMs: 1, timedOut: false, spawnError: null };
    };

    try {
      const result = await bundler.bundleRoots({
        redoclyPath: "/tools/goas/node_modules/.bin/redocly",
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });

      assert.equal(result.unresolvedRefs.length, 0, "expected no unresolved refs");
    } finally {
      cleanup(tmp);
    }
  });

  it("§5: refuses to follow .invalid hosts as network refs", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-bundler-invalid-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    fs.writeFileSync(
      path.join(snapshotRoot, "api", "catalog.yaml"),
      `openapi: 3.1.0\npaths:\n  /items:\n    get:\n      responses:\n        '200':\n          description: ok\n          content:\n            application/json:\n              schema:\n                $ref: 'https://schemas.entralo.invalid/components/Money'\n`,
    );
    writeValidCommon(snapshotRoot);

    const runCommand = async () => ({ exitCode: 0, durationMs: 1, timedOut: false, spawnError: null });

    try {
      await assert.rejects(
        bundler.bundleRoots({
          redoclyPath: "/tools/goas/node_modules/.bin/redocly",
          snapshotRoot,
          runDir,
          roots: ["catalog"],
          commonPath: path.join(snapshotRoot, "api", "common.yaml"),
          runCommand,
        }),
        /REF_UNRESOLVED.*\.invalid is identifier-only|\.invalid.*forbidden|NETWORK_FORBIDDEN/,
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("§5: rejects unresolved absolute external refs that are not registered locally", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-bundler-external-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    fs.writeFileSync(
      path.join(snapshotRoot, "api", "catalog.yaml"),
      `openapi: 3.1.0\npaths:\n  /items:\n    get:\n      responses:\n        '200':\n          description: ok\n          content:\n            application/json:\n              schema:\n                $ref: 'https://example.com/schemas/Money.yaml'\n`,
    );
    writeValidCommon(snapshotRoot);

    const runCommand = async () => ({ exitCode: 0, durationMs: 1, timedOut: false, spawnError: null });

    try {
      await assert.rejects(
        bundler.bundleRoots({
          redoclyPath: "/tools/goas/node_modules/.bin/redocly",
          snapshotRoot,
          runDir,
          roots: ["catalog"],
          commonPath: path.join(snapshotRoot, "api", "common.yaml"),
          runCommand,
        }),
        /REF_UNRESOLVED|NETWORK_FORBIDDEN/,
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("AC-T16-ROOT: bundle argv targets ${run}/bundles/<root>.yaml exactly", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-bundler-argv-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });
    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), `openapi: 3.1.0\n`);
    writeValidCommon(snapshotRoot);

    let capturedArgv = null;
    const runCommand = async (options) => {
      capturedArgv = options.args ?? options.argv ?? [];
      return { exitCode: 0, durationMs: 1, timedOut: false, spawnError: null };
    };

    try {
      await bundler.bundleRoots({
        redoclyPath: "/tools/goas/node_modules/.bin/redocly",
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });

      assert.ok(capturedArgv, "argv was captured");
      const outputArg = capturedArgv[capturedArgv.indexOf("--output") + 1];
      assert.equal(outputArg, path.join(runDir, "bundles", "catalog.yaml"));
    } finally {
      cleanup(tmp);
    }
  });

  it("AC-T16-COMMON: bundleRoots requires commonPath as a shared input", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-bundler-common-missing-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });
    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), `openapi: 3.1.0\n`);
    fs.writeFileSync(path.join(snapshotRoot, "api", "common.yaml"), `openapi: 3.1.0\n`);

    const runCommand = async () => ({ exitCode: 0, durationMs: 1, timedOut: false, spawnError: null });

    try {
      await assert.rejects(
        bundler.bundleRoots({
          redoclyPath: "/tools/goas/node_modules/.bin/redocly",
          snapshotRoot,
          runDir,
          roots: ["catalog"],
          // commonPath intentionally omitted
          runCommand,
        }),
        /COMMON_PATH_REQUIRED|commonPath required|BUNDLER_INPUT_INVALID.*common/,
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("AC-T16-COMMON: missing common.yaml file is rejected", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-bundler-common-file-missing-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });
    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), `openapi: 3.1.0\n`);
    // common.yaml intentionally absent

    const runCommand = async () => ({ exitCode: 0, durationMs: 1, timedOut: false, spawnError: null });

    try {
      await assert.rejects(
        bundler.bundleRoots({
          redoclyPath: "/tools/goas/node_modules/.bin/redocly",
          snapshotRoot,
          runDir,
          roots: ["catalog"],
          commonPath: path.join(snapshotRoot, "api", "common.yaml"),
          runCommand,
        }),
        /COMMON_MISSING|common.*missing|REF_UNRESOLVED/,
      );
    } finally {
      cleanup(tmp);
    }
  });
});
