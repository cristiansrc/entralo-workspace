// red: test-architect (entralo-v1-executable-specs pack #68 + common-bucket reachability)
// owner: test-architect — executor must not edit this file.
//
// TDD/contract tests for SR67-1/2 + HIGH-1/2 + HIGH-3 (reviewer final report)
// common-bucket blockers.
// Authority: shared context SR67 dictamen dual 2026-10-07,
//            plan §6 (protocolo de corrida/evidencia).
//
// Scope:
//   (1) SR67-1: evidenceRoot with symlink ancestor / pre-existing runDir must
//       never escape into the repository; realpath containment required.
//   (2) SR67-2: pre-existing bundle output must be rejected BEFORE invoking
//       Redocly (no clobber).
//   (3) HIGH-1: bundler persists per-root argv/cwd/run_id/timestamps/exit/status
//       and Redocly version/digest; failures/timeouts are blockers in the
//       evidence artifact, not just an in-memory array.
//   (4) HIGH-2: source→bundle equivalence (paths/methods/operationIds/schemas/
//       security/errors/headers) and reachable common are verified; drift or
//       loss blocks and leaves evidence.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const REDOCLY_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "node_modules",
  ".bin",
  "redocly",
);

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

function writeValidCommon(snapshotRoot, extra = "") {
  fs.writeFileSync(
    path.join(snapshotRoot, "api", "common.yaml"),
    `openapi: 3.1.0\n${extra}`,
  );
}

async function loadBundler() {
  try {
    return await import("../lib/bundler.mjs");
  } catch (err) {
    assert.fail(`bundler module is missing: ${err.message}`);
  }
}

async function loadEntrypoint() {
  try {
    return await import("../lib/entrypoint.mjs");
  } catch (err) {
    assert.fail(`entrypoint module is missing: ${err.message}`);
  }
}

function envBindings(redoclyPath = REDOCLY_PATH) {
  return {
    JBR25_JAVA: "/opt/jbr/bin/java",
    JBR25_HOME: "/opt/jbr",
    redoclyPath,
    jarPath: "/tools/goas/vendor/tarballs/openapi-generator-cli.jar",
  };
}

function noopDeps() {
  return {
    bundleRoots: async () => ({
      bundles: [],
      manifestPath: "",
      commands: [],
      unresolvedRefs: [],
    }),
    runGoas: async () => ({ signal: "RUN_RECORDED" }),
  };
}

/** Write the simulated bundle text to the Redocly `--output` path from argv. */
function simulateBundleWrite(options, bundleText) {
  const argv = options.args ?? options.argv ?? [];
  const outputIndex = argv.indexOf("--output");
  if (outputIndex >= 0 && outputIndex + 1 < argv.length) {
    const outputPath = argv[outputIndex + 1];
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, bundleText);
  }
  return { exitCode: 0, durationMs: 1, timedOut: false, spawnError: null };
}

function normalizeCommonKeys(entries) {
  return entries.map((entry) => {
    if (entry && typeof entry === "object" && "bucket" in entry && "name" in entry) {
      return `${entry.bucket}/${entry.name}`;
    }
    if (typeof entry === "string" && entry.includes("/")) return entry;
    if (typeof entry === "string") return `schemas/${entry}`;
    return String(entry);
  });
}

describe("SR67-1: evidenceRoot realpath containment", () => {
  it("rejects evidenceRoot whose realpath lands inside the repository", async () => {
    const entrypoint = await loadEntrypoint();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-ev-root-"));
    const repoRoot = path.join(tmp, "repo");
    fs.mkdirSync(repoRoot, { recursive: true });

    // Real evidence directory is INSIDE the repo, but a symlink outside the
    // repo points to it. Lexically evidenceRoot is outside the repo, so the
    // current path.resolve check passes; realpath must reject it.
    const evidenceReal = path.join(repoRoot, "evidence-real");
    fs.mkdirSync(evidenceReal, { recursive: true });
    const evidenceRoot = path.join(tmp, "evidence-link");
    fs.symlinkSync(evidenceReal, evidenceRoot);

    try {
      await assert.rejects(
        entrypoint.runEntrypoint({
          runId: "20261007T120000Z-sr67x1",
          repoRoot,
          ...envBindings(),
          evidenceRoot,
          deps: noopDeps(),
        }),
        /EVIDENCE_INSIDE_REPO/,
        "symlinked evidenceRoot targeting repo interior must be rejected",
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("rejects pre-existing runDir under symlinked evidenceRoot before writing inside repo", async () => {
    const entrypoint = await loadEntrypoint();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-resume-"));
    const repoRoot = path.join(tmp, "repo");
    fs.mkdirSync(repoRoot, { recursive: true });

    const evidenceReal = path.join(repoRoot, "evidence-real");
    fs.mkdirSync(evidenceReal, { recursive: true });
    const evidenceRoot = path.join(tmp, "evidence-link");
    fs.symlinkSync(evidenceReal, evidenceRoot);

    const runId = "20261007T120001Z-resume";
    const runDir = path.join(evidenceRoot, runId);
    // Pre-create the run directory: its realpath is inside the repository.
    fs.mkdirSync(runDir, { recursive: true });

    try {
      await assert.rejects(
        entrypoint.runEntrypoint({
          runId,
          repoRoot,
          ...envBindings(),
          evidenceRoot,
          deps: noopDeps(),
        }),
        /EVIDENCE_INSIDE_REPO/,
        "pre-existing runDir whose realpath is inside the repo must be rejected",
      );
      // No evidence file must be written inside the repository tree.
      const repoFiles = [];
      function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(full);
          else repoFiles.push(full);
        }
      }
      walk(repoRoot);
      assert.equal(
        repoFiles.length,
        0,
        "no evidence files must be created inside the repository",
      );
    } finally {
      cleanup(tmp);
    }
  });
});

describe("SR67-2: no-clobber before Redocly", () => {
  it("rejects pre-existing bundle output before invoking runCommand", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-noclobber-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });
    fs.writeFileSync(
      path.join(snapshotRoot, "api", "catalog.yaml"),
      `openapi: 3.1.0\npaths: {}\n`,
    );
    writeValidCommon(snapshotRoot);

    // Pre-create the bundle output that Redocly would otherwise overwrite.
    const preExistingBundle = path.join(runDir, "bundles", "catalog.yaml");
    fs.mkdirSync(path.dirname(preExistingBundle), { recursive: true });
    fs.writeFileSync(preExistingBundle, "pre-existing bundle\n");

    let runCommandCalled = false;
    const runCommand = async () => {
      runCommandCalled = true;
      return { exitCode: 0, durationMs: 1, timedOut: false, spawnError: null };
    };

    try {
      await assert.rejects(
        bundler.bundleRoots({
          redoclyPath: REDOCLY_PATH,
          snapshotRoot,
          runDir,
          roots: ["catalog"],
          commonPath: path.join(snapshotRoot, "api", "common.yaml"),
          runCommand,
        }),
        /DESTINATION_EXISTS|BUNDLE_EXISTS|OUTPUT_EXISTS|CLOBBER/,
        "pre-existing bundle output must be rejected before Redocly",
      );
      assert.equal(
        runCommandCalled,
        false,
        "runCommand must not be invoked when output already exists",
      );
    } finally {
      cleanup(tmp);
    }
  });
});

describe("HIGH-1: durable bundler evidence", () => {
  it("persists per-root argv, cwd, timestamps, exit and status in the manifest", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-cmd-evidence-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });
    fs.writeFileSync(
      path.join(snapshotRoot, "api", "catalog.yaml"),
      `openapi: 3.1.0\npaths: {}\n`,
    );
    writeValidCommon(snapshotRoot);

    const runCommand = async () => ({
      exitCode: 0,
      durationMs: 42,
      timedOut: false,
      spawnError: null,
    });

    try {
      const result = await bundler.bundleRoots({
        redoclyPath: REDOCLY_PATH,
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });

      assert.ok(fs.existsSync(result.manifestPath), "manifest must exist");
      const manifest = JSON.parse(fs.readFileSync(result.manifestPath, "utf8"));
      assert.ok(
        Array.isArray(manifest.commands),
        "manifest must persist commands array",
      );
      assert.equal(manifest.commands.length, 1);
      const cmd = manifest.commands[0];
      assert.equal(cmd.phase, "bundle");
      assert.equal(cmd.root, "catalog");
      assert.ok(Array.isArray(cmd.argv), "argv must be persisted");
      assert.ok(cmd.argv.includes("bundle"), "argv must contain Redocly bundle");
      assert.ok(path.isAbsolute(cmd.cwd), "cwd must be absolute");
      assert.ok(cmd.started_at, "started_at timestamp must be persisted");
      assert.equal(cmd.exit_code, 0);
      assert.equal(cmd.timed_out, false);
      assert.equal(cmd.duration_ms, 42);
      assert.ok(
        path.isAbsolute(cmd.stdout_path),
        "stdout_path must be absolute",
      );
      assert.ok(
        path.isAbsolute(cmd.stderr_path),
        "stderr_path must be absolute",
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("persists Redocly path, version and digest in the manifest", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-redocly-meta-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });
    fs.writeFileSync(
      path.join(snapshotRoot, "api", "catalog.yaml"),
      `openapi: 3.1.0\npaths: {}\n`,
    );
    writeValidCommon(snapshotRoot);

    const runCommand = async () => ({
      exitCode: 0,
      durationMs: 1,
      timedOut: false,
      spawnError: null,
    });

    try {
      const result = await bundler.bundleRoots({
        redoclyPath: REDOCLY_PATH,
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });

      const manifest = JSON.parse(fs.readFileSync(result.manifestPath, "utf8"));
      assert.ok(manifest.redocly, "manifest must contain redocly metadata");
      assert.equal(
        manifest.redocly.path,
        REDOCLY_PATH,
        "redocly path must be persisted",
      );
      assert.equal(
        typeof manifest.redocly.version,
        "string",
        "redocly version must be a string",
      );
      assert.ok(
        manifest.redocly.version.length > 0,
        "redocly version must be non-empty",
      );
      assert.equal(
        typeof manifest.redocly.digest,
        "string",
        "redocly digest must be a string",
      );
      assert.match(
        manifest.redocly.digest,
        /^[0-9a-f]{64}$/,
        "redocly digest must be a SHA-256 hex string",
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("records a non-zero exit as a persisted blocker, not only an in-memory command", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-exit-blocker-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });
    fs.writeFileSync(
      path.join(snapshotRoot, "api", "catalog.yaml"),
      `openapi: 3.1.0\npaths: {}\n`,
    );
    writeValidCommon(snapshotRoot);

    const runCommand = async () => ({
      exitCode: 1,
      durationMs: 5,
      timedOut: false,
      spawnError: null,
    });

    try {
      const result = await bundler.bundleRoots({
        redoclyPath: REDOCLY_PATH,
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });

      const manifest = JSON.parse(fs.readFileSync(result.manifestPath, "utf8"));
      assert.ok(
        Array.isArray(manifest.blockers),
        "manifest must contain persisted blockers",
      );
      const blocker = manifest.blockers.find((b) => b.root === "catalog");
      assert.ok(blocker, "catalog blocker must be persisted");
      assert.equal(blocker.exit_code, 1);
      assert.equal(blocker.timed_out, false);
    } finally {
      cleanup(tmp);
    }
  });

  it("records a timeout as a persisted blocker, not only an in-memory command", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-timeout-blocker-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });
    fs.writeFileSync(
      path.join(snapshotRoot, "api", "catalog.yaml"),
      `openapi: 3.1.0\npaths: {}\n`,
    );
    writeValidCommon(snapshotRoot);

    const runCommand = async () => ({
      exitCode: null,
      durationMs: 120000,
      timedOut: true,
      spawnError: null,
    });

    try {
      const result = await bundler.bundleRoots({
        redoclyPath: REDOCLY_PATH,
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });

      const manifest = JSON.parse(fs.readFileSync(result.manifestPath, "utf8"));
      assert.ok(
        Array.isArray(manifest.blockers),
        "manifest must contain persisted blockers",
      );
      const blocker = manifest.blockers.find((b) => b.root === "catalog");
      assert.ok(blocker, "catalog timeout blocker must be persisted");
      assert.equal(blocker.timed_out, true);
    } finally {
      cleanup(tmp);
    }
  });
});

describe("HIGH-2: source→bundle equivalence", () => {
  function makeCatalogSource() {
    return `openapi: 3.1.0
info:
  title: Catalog
  version: 1.0.0
paths:
  /items:
    get:
      operationId: listItems
      responses:
        '200':
          description: ok
          headers:
            X-Request-Id:
              schema:
                type: string
          content:
            application/json:
              schema:
                $ref: './common.yaml#/components/schemas/Money'
        '500':
          description: error
          content:
            application/json:
              schema:
                $ref: './common.yaml#/components/schemas/Error'
      security:
        - bearerAuth: []
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
`;
  }

  function makeCommonSource() {
    return `openapi: 3.1.0
components:
  schemas:
    Money:
      type: object
      properties:
        amount:
          type: integer
    Error:
      type: object
      properties:
        code:
          type: string
    Unused:
      type: object
`;
  }

  function simulateBundle(options, bundleText) {
    const argv = options.args ?? options.argv ?? [];
    const outputIndex = argv.indexOf("--output");
    if (outputIndex >= 0 && outputIndex + 1 < argv.length) {
      const outputPath = argv[outputIndex + 1];
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, bundleText);
    }
    return { exitCode: 0, durationMs: 1, timedOut: false, spawnError: null };
  }

  it("records equivalence MATCH when bundle preserves source contract", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-equiv-match-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    const source = makeCatalogSource();
    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), source);
    fs.writeFileSync(path.join(snapshotRoot, "api", "common.yaml"), makeCommonSource());

    const runCommand = async (options) => simulateBundle(options, source);

    try {
      const result = await bundler.bundleRoots({
        redoclyPath: REDOCLY_PATH,
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });

      const manifest = JSON.parse(fs.readFileSync(result.manifestPath, "utf8"));
      assert.ok(
        manifest.equivalence,
        "manifest must contain source→bundle equivalence report",
      );
      assert.equal(manifest.equivalence.status, "MATCH");
      const report = manifest.equivalence.roots?.catalog;
      assert.ok(report, "catalog equivalence report must exist");
      assert.ok(report.paths.includes("/items"), "paths must be preserved");
      assert.ok(report.methods.includes("get"), "methods must be preserved");
      assert.deepEqual(
        report.operationIds,
        ["listItems"],
        "operationIds must be preserved",
      );
      assert.ok(
        report.security.includes("bearerAuth"),
        "security must be preserved",
      );
      assert.ok(
        report.headers.includes("X-Request-Id"),
        "headers must be preserved",
      );
      assert.ok(
        report.errors.includes("500"),
        "error responses must be preserved",
      );
      assert.ok(
        report.commonReachable.includes("Money"),
        "reachable common schemas must be recorded",
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("blocks and leaves evidence when bundle drops a path", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-equiv-path-drift-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    const source = makeCatalogSource();
    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), source);
    fs.writeFileSync(path.join(snapshotRoot, "api", "common.yaml"), makeCommonSource());

    // Simulate a malicious/drifted bundle that drops /items.
    const drifted = source.replace(/paths:[\s\S]*?components:/, "paths: {}\ncomponents:");
    const runCommand = async (options) => simulateBundle(options, drifted);

    const manifestPath = path.join(runDir, "manifests", "generator-inputs.pre.json");
    let threw = false;
    try {
      await bundler.bundleRoots({
        redoclyPath: REDOCLY_PATH,
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });
    } catch (error) {
      threw = true;
      assert.match(error.message, /EQUIVALENCE_DRIFT|BUNDLE_DRIFT/);
      assert.ok(
        fs.existsSync(manifestPath),
        "drift evidence manifest must be persisted",
      );
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      assert.equal(manifest.equivalence?.status, "DRIFT");
      const blocker = manifest.blockers?.find((b) => b.root === "catalog");
      assert.ok(blocker, "drift blocker must be persisted");
    }
    assert.equal(threw, true, "bundleRoots must block when a path is dropped");
    cleanup(tmp);
  });

  it("blocks and leaves evidence when bundle drops security requirements", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-equiv-sec-drift-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    const source = makeCatalogSource();
    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), source);
    fs.writeFileSync(path.join(snapshotRoot, "api", "common.yaml"), makeCommonSource());

    const drifted = source.replace(/security:\s*\n\s*- bearerAuth: \[\]\n/, "");
    const runCommand = async (options) => simulateBundle(options, drifted);

    const manifestPath = path.join(runDir, "manifests", "generator-inputs.pre.json");
    let threw = false;
    try {
      await bundler.bundleRoots({
        redoclyPath: REDOCLY_PATH,
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });
    } catch (error) {
      threw = true;
      assert.match(error.message, /EQUIVALENCE_DRIFT|BUNDLE_DRIFT/);
      assert.ok(fs.existsSync(manifestPath));
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      assert.equal(manifest.equivalence?.status, "DRIFT");
    }
    assert.equal(threw, true, "bundleRoots must block when security is lost");
    cleanup(tmp);
  });

  it("blocks and leaves evidence when bundle drops response headers", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-equiv-hdr-drift-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    const source = makeCatalogSource();
    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), source);
    fs.writeFileSync(path.join(snapshotRoot, "api", "common.yaml"), makeCommonSource());

    const drifted = source.replace(/headers:\s*\n\s*X-Request-Id:[\s\S]*?schema:\s*\n\s*type: string\n/, "");
    const runCommand = async (options) => simulateBundle(options, drifted);

    const manifestPath = path.join(runDir, "manifests", "generator-inputs.pre.json");
    let threw = false;
    try {
      await bundler.bundleRoots({
        redoclyPath: REDOCLY_PATH,
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });
    } catch (error) {
      threw = true;
      assert.match(error.message, /EQUIVALENCE_DRIFT|BUNDLE_DRIFT/);
      assert.ok(fs.existsSync(manifestPath));
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      assert.equal(manifest.equivalence?.status, "DRIFT");
    }
    assert.equal(threw, true, "bundleRoots must block when headers are lost");
    cleanup(tmp);
  });

  it("reports unreachable common components without fabricating usage", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-equiv-common-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    const source = makeCatalogSource();
    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), source);
    fs.writeFileSync(path.join(snapshotRoot, "api", "common.yaml"), makeCommonSource());

    const runCommand = async (options) => simulateBundle(options, source);

    try {
      const result = await bundler.bundleRoots({
        redoclyPath: REDOCLY_PATH,
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });

      const manifest = JSON.parse(fs.readFileSync(result.manifestPath, "utf8"));
      const commonReport = manifest.equivalence?.common;
      assert.ok(commonReport, "common equivalence report must exist");
      assert.ok(
        commonReport.unreachable.includes("Unused"),
        "Unused common schema must be reported as unreachable",
      );
    } finally {
      cleanup(tmp);
    }
  });
});

describe("HIGH-3: common reachability by component bucket", () => {
  function makeMultiBucketCommon() {
    return `openapi: 3.1.0
components:
  schemas:
    Money:
      type: object
    UsedSchema:
      type: object
    UnusedSchema:
      type: object
  parameters:
    TraceId:
      name: X-Trace-Id
      in: header
      schema:
        type: string
    UsedParam:
      name: X-Used
      in: header
      schema:
        type: string
    UnusedParam:
      name: X-Unused
      in: header
      schema:
        type: string
  responses:
    NotFound:
      description: Not found
    UsedResponse:
      description: Used
    UnusedResponse:
      description: Unused
  headers:
    X-Request-Id:
      schema:
        type: string
    UsedHeader:
      schema:
        type: string
    UnusedHeader:
      schema:
        type: string
`;
  }

  function makeRootUsingAllBuckets() {
    return `openapi: 3.1.0
info:
  title: Multi-bucket root
  version: 1.0.0
paths:
  /items:
    parameters:
      - $ref: './common.yaml#/components/parameters/TraceId'
    get:
      operationId: listItems
      parameters:
        - $ref: './common.yaml#/components/parameters/UsedParam'
      responses:
        '200':
          description: ok
          headers:
            X-Request-Id:
              $ref: './common.yaml#/components/headers/X-Request-Id'
          content:
            application/json:
              schema:
                $ref: './common.yaml#/components/schemas/Money'
        '404':
          $ref: './common.yaml#/components/responses/NotFound'
        '500':
          description: error
          content:
            application/json:
              schema:
                $ref: './common.yaml#/components/schemas/UsedSchema'
`;
  }

  function makeRootUsingMissingParameterWithSchemaName() {
    return `openapi: 3.1.0
info:
  title: Parameter-refers-to-schema-name
  version: 1.0.0
paths:
  /items:
    get:
      operationId: listItems
      parameters:
        - $ref: './common.yaml#/components/parameters/Money'
      responses:
        '200':
          description: ok
`;
  }

  it("passes MATCH when roots reference schemas, parameters, responses and headers in common", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-bucket-match-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    const source = makeRootUsingAllBuckets();
    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), source);
    fs.writeFileSync(path.join(snapshotRoot, "api", "common.yaml"), makeMultiBucketCommon());

    const runCommand = async (options) => simulateBundleWrite(options, source);

    try {
      const result = await bundler.bundleRoots({
        redoclyPath: REDOCLY_PATH,
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });

      const manifest = JSON.parse(fs.readFileSync(result.manifestPath, "utf8"));
      assert.equal(
        manifest.equivalence?.status,
        "MATCH",
        "canonical common refs across all buckets must produce MATCH",
      );
      const commonBlocker = manifest.blockers?.find((b) => b.root === "common");
      assert.equal(
        commonBlocker,
        undefined,
        "no COMMON_UNREACHABLE blocker must be raised for reachable components",
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("does not let a schema name mask a missing parameter", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-bucket-mask-param-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    const source = makeRootUsingMissingParameterWithSchemaName();
    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), source);
    // common.yaml defines schemas.Money but intentionally omits parameters.Money.
    fs.writeFileSync(
      path.join(snapshotRoot, "api", "common.yaml"),
      makeMultiBucketCommon(),
    );

    const runCommand = async (options) => simulateBundleWrite(options, source);

    let threw = false;
    try {
      await bundler.bundleRoots({
        redoclyPath: REDOCLY_PATH,
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });
    } catch (error) {
      threw = true;
      assert.match(error.message, /COMMON_UNREACHABLE|COMMON_COMPONENT_MISSING/);
    }

    const manifestPath = path.join(runDir, "manifests", "generator-inputs.pre.json");
    assert.ok(fs.existsSync(manifestPath), "drift evidence manifest must be persisted");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const blocker = manifest.blockers?.find(
      (b) => b.root === "common" && /COMMON_UNREACHABLE|COMMON_COMPONENT_MISSING/.test(b.reason),
    );
    assert.ok(blocker, "missing parameter component must be reported even when schema name collides");
    const keys = normalizeCommonKeys(blocker.values ?? manifest.equivalence?.common?.missing ?? []);
    assert.ok(
      keys.some((k) => k === "parameters/Money"),
      "blocker must carry the full bucket+name key for the missing parameter",
    );
    assert.equal(threw, true, "bundleRoots must block when a referenced parameter is absent");
    cleanup(tmp);
  });

  it("does not let a schema name mask a missing response", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-bucket-mask-response-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    const source = `openapi: 3.1.0
info:
  title: Response-refers-to-schema-name
  version: 1.0.0
paths:
  /items:
    get:
      operationId: listItems
      responses:
        '404':
          $ref: './common.yaml#/components/responses/Money'
`;
    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), source);
    fs.writeFileSync(
      path.join(snapshotRoot, "api", "common.yaml"),
      makeMultiBucketCommon(),
    );

    const runCommand = async (options) => simulateBundleWrite(options, source);

    let threw = false;
    try {
      await bundler.bundleRoots({
        redoclyPath: REDOCLY_PATH,
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });
    } catch (error) {
      threw = true;
      assert.match(error.message, /COMMON_UNREACHABLE|COMMON_COMPONENT_MISSING/);
    }

    const manifestPath = path.join(runDir, "manifests", "generator-inputs.pre.json");
    assert.ok(fs.existsSync(manifestPath));
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const blocker = manifest.blockers?.find(
      (b) => b.root === "common" && /COMMON_UNREACHABLE|COMMON_COMPONENT_MISSING/.test(b.reason),
    );
    assert.ok(blocker, "missing response component must be reported even when schema name collides");
    const keys = normalizeCommonKeys(blocker.values ?? manifest.equivalence?.common?.missing ?? []);
    assert.ok(
      keys.some((k) => k === "responses/Money"),
      "blocker must carry the full bucket+name key for the missing response",
    );
    assert.equal(threw, true, "bundleRoots must block when a referenced response is absent");
    cleanup(tmp);
  });

  it("does not let a schema name mask a missing header", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-bucket-mask-header-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    const source = `openapi: 3.1.0
info:
  title: Header-refers-to-schema-name
  version: 1.0.0
paths:
  /items:
    get:
      operationId: listItems
      responses:
        '200':
          description: ok
          headers:
            Money:
              $ref: './common.yaml#/components/headers/Money'
`;
    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), source);
    fs.writeFileSync(
      path.join(snapshotRoot, "api", "common.yaml"),
      makeMultiBucketCommon(),
    );

    const runCommand = async (options) => simulateBundleWrite(options, source);

    let threw = false;
    try {
      await bundler.bundleRoots({
        redoclyPath: REDOCLY_PATH,
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });
    } catch (error) {
      threw = true;
      assert.match(error.message, /COMMON_UNREACHABLE|COMMON_COMPONENT_MISSING/);
    }

    const manifestPath = path.join(runDir, "manifests", "generator-inputs.pre.json");
    assert.ok(fs.existsSync(manifestPath));
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const blocker = manifest.blockers?.find(
      (b) => b.root === "common" && /COMMON_UNREACHABLE|COMMON_COMPONENT_MISSING/.test(b.reason),
    );
    assert.ok(blocker, "missing header component must be reported even when schema name collides");
    const keys = normalizeCommonKeys(blocker.values ?? manifest.equivalence?.common?.missing ?? []);
    assert.ok(
      keys.some((k) => k === "headers/Money"),
      "blocker must carry the full bucket+name key for the missing header",
    );
    assert.equal(threw, true, "bundleRoots must block when a referenced header is absent");
    cleanup(tmp);
  });

  it("reports unreferenced parameters, responses and headers as unreachable without blocking", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-bucket-unreachable-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    const source = makeRootUsingAllBuckets();
    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), source);
    fs.writeFileSync(path.join(snapshotRoot, "api", "common.yaml"), makeMultiBucketCommon());

    const runCommand = async (options) => simulateBundleWrite(options, source);

    try {
      const result = await bundler.bundleRoots({
        redoclyPath: REDOCLY_PATH,
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });

      const manifest = JSON.parse(fs.readFileSync(result.manifestPath, "utf8"));
      assert.equal(
        manifest.equivalence?.status,
        "MATCH",
        "reachable components across buckets must not block",
      );
      const unreachable = normalizeCommonKeys(
        manifest.equivalence?.common?.unreachable ?? [],
      );
      assert.ok(
        unreachable.includes("schemas/UnusedSchema"),
        "unused schema must be reported as unreachable",
      );
      assert.ok(
        unreachable.includes("parameters/UnusedParam"),
        "unused parameter must be reported as unreachable",
      );
      assert.ok(
        unreachable.includes("responses/UnusedResponse"),
        "unused response must be reported as unreachable",
      );
      assert.ok(
        unreachable.includes("headers/UnusedHeader"),
        "unused header must be reported as unreachable",
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("records reachable and unreachable common with full bucket+name keys", async () => {
    const bundler = await loadBundler();
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sr67-bucket-keys-"));
    const runDir = path.join(tmp, "run");
    const snapshotRoot = path.join(tmp, "snapshot");
    fs.mkdirSync(path.join(snapshotRoot, "api"), { recursive: true });

    const source = makeRootUsingAllBuckets();
    fs.writeFileSync(path.join(snapshotRoot, "api", "catalog.yaml"), source);
    fs.writeFileSync(path.join(snapshotRoot, "api", "common.yaml"), makeMultiBucketCommon());

    const runCommand = async (options) => simulateBundleWrite(options, source);

    try {
      const result = await bundler.bundleRoots({
        redoclyPath: REDOCLY_PATH,
        snapshotRoot,
        runDir,
        roots: ["catalog"],
        commonPath: path.join(snapshotRoot, "api", "common.yaml"),
        runCommand,
      });

      const manifest = JSON.parse(fs.readFileSync(result.manifestPath, "utf8"));
      const reachable = normalizeCommonKeys(
        manifest.equivalence?.common?.reachable ?? [],
      );
      const unreachable = normalizeCommonKeys(
        manifest.equivalence?.common?.unreachable ?? [],
      );
      assert.ok(
        reachable.includes("schemas/Money"),
        "reachable schemas must be keyed by bucket+name",
      );
      assert.ok(
        reachable.includes("parameters/TraceId"),
        "reachable parameters must be keyed by bucket+name",
      );
      assert.ok(
        reachable.includes("responses/NotFound"),
        "reachable responses must be keyed by bucket+name",
      );
      assert.ok(
        reachable.includes("headers/X-Request-Id"),
        "reachable headers must be keyed by bucket+name",
      );
      assert.ok(
        unreachable.includes("schemas/UnusedSchema"),
        "unreachable schemas must be keyed by bucket+name",
      );
      assert.ok(
        unreachable.includes("parameters/UnusedParam"),
        "unreachable parameters must be keyed by bucket+name",
      );
      assert.ok(
        unreachable.includes("responses/UnusedResponse"),
        "unreachable responses must be keyed by bucket+name",
      );
      assert.ok(
        unreachable.includes("headers/UnusedHeader"),
        "unreachable headers must be keyed by bucket+name",
      );
    } finally {
      cleanup(tmp);
    }
  });
});
