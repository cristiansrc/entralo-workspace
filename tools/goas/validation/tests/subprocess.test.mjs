// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Regression tests for subprocess findings:
//   A1/M-03 — stream errors (EEXIST, ENOENT) must be handled, not crash the runner.
//   A2/H-01 — timeout must kill the whole process group, leaving no orphans.
//   L-05    — runCommand must reject commands outside an approved allowlist.
//   L-06    — evidence files produced by runCommand must not be world-readable.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { runCommand } from "../lib/subprocess.mjs";

const PROBE = new URL("./helpers/subprocess-probe.mjs", import.meta.url).pathname;
const NODE = process.execPath;

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

function runProbe(scenario) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-probe-"));
  const out = path.join(tmp, "out.json");
  const result = spawnSync(NODE, [PROBE, scenario, out], {
    encoding: "utf8",
    timeout: 10000,
  });
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(out, "utf8"));
  } catch {
    parsed = { ok: false, raw: result.stderr || result.stdout };
  }
  cleanup(tmp);
  return { exit: result.status, signal: result.signal, parsed };
}

describe("subprocess", () => {
  it("A1/M-03: EEXIST on stdout stream resolves instead of crashing", () => {
    const r = runProbe("eexist");
    assert.equal(
      r.exit,
      0,
      `probe should exit cleanly; got exit=${r.exit} signal=${r.signal} err=${r.parsed.raw || ""}`,
    );
    assert.ok(r.parsed.ok, `expected handled error result, got ${JSON.stringify(r.parsed)}`);
  });

  it("A1/M-03: ENOENT on stdout stream resolves instead of crashing", () => {
    const r = runProbe("enoent");
    assert.equal(
      r.exit,
      0,
      `probe should exit cleanly; got exit=${r.exit} signal=${r.signal} err=${r.parsed.raw || ""}`,
    );
    assert.ok(r.parsed.ok, `expected handled error result, got ${JSON.stringify(r.parsed)}`);
  });

  it("A2/H-01: timeout kills the whole process group without orphans", () => {
    const r = runProbe("orphan");
    assert.equal(
      r.exit,
      0,
      `probe should exit cleanly; got exit=${r.exit} signal=${r.signal} err=${r.parsed.raw || ""}`,
    );
    assert.ok(r.parsed.ok, `expected no orphan, got ${JSON.stringify(r.parsed)}`);
  });

  it("L-05: runCommand rejects commands outside the approved allowlist", async () => {
    // Explicit test mode: the permissive default must not pass unnoticed.
    const result = await runCommand({
      command: "/bin/cat",
      args: ["/etc/passwd"],
      timeoutMs: 2000,
      mode: "test",
    });
    assert.match(
      result.spawnError || String(result.exitCode),
      /COMMAND_NOT_ALLOWED/,
      `expected allowlist rejection, got ${JSON.stringify(result)}`,
    );
  });

  it("L-06: files created by runCommand are not world-readable", async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-sub-l06-"));
    const out = path.join(tmp, "out.log");
    try {
      // Explicit test mode: the permissive default must not pass unnoticed.
      const result = await runCommand({
        command: "echo",
        args: ["evidence"],
        stdoutPath: out,
        timeoutMs: 2000,
        mode: "test",
      });
      assert.equal(result.spawnError, null);
      const mode = fs.statSync(out).mode & 0o777;
      assert.equal(mode & 0o007, 0, `file must not be group/other accessible, got ${mode.toString(8)}`);
    } finally {
      cleanup(tmp);
    }
  });

  it("SEC-61-3: cmdline matcher must not kill an unrelated sleep process", async () => {
    // Spawn an unrelated sleep 600 that matches the kill-scope probe's pattern.
    const decoy = spawn("/bin/sleep", ["600"], { stdio: "ignore" });
    try {
      // Give the decoy time to appear in /proc before the probe scans it.
      await new Promise((resolve) => setTimeout(resolve, 200));
      const r = runProbe("kill-scope");
      assert.equal(
        r.exit,
        0,
        `probe should exit cleanly; got exit=${r.exit} signal=${r.signal} err=${r.parsed.raw || ""}`,
      );
      assert.ok(r.parsed.ok, `expected kill-scope probe to finish, got ${JSON.stringify(r.parsed)}`);
      assert.ok(
        r.parsed.own_killed,
        "kill-scope probe must terminate its own child (the fix must still kill the probe's own process)",
      );
      // Allow the test runner to reap the decoy if it was killed.
      await new Promise((resolve) => setTimeout(resolve, 150));
      assert.equal(
        decoy.exitCode,
        null,
        "decoy sleep process must not be killed by the probe's cmdline matcher",
      );
      // Double-check the process is still alive (kill(0) throws if gone).
      process.kill(decoy.pid, 0);
    } finally {
      try {
        decoy.kill("SIGKILL");
      } catch {}
    }
  });
});
