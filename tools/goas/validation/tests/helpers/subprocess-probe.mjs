// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Subprocess probe — isolated in a child process so an uncaught stream error
// does not crash the test runner.

import { runCommand } from "../../lib/subprocess.mjs";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function killMatches(pattern) {
  for (const pid of fs.readdirSync("/proc").filter((x) => /^\d+$/.test(x))) {
    try {
      const cmdline = fs.readFileSync(`/proc/${pid}/cmdline`, "utf8").replace(/\0/g, " ").trim();
      if (cmdline.includes(pattern)) {
        try {
          process.kill(Number(pid), "SIGKILL");
        } catch {}
      }
    } catch {}
  }
}

// SEC-61-3: kill ONLY the child this probe owns (and its process group when
// detached), never an arbitrary process selected by a /proc cmdline pattern.
function killOwnChild(child) {
  if (!child || typeof child.pid !== "number") return;
  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    try {
      child.kill("SIGKILL");
    } catch {}
  }
}

const scenario = process.argv[2];
const outFile = process.argv[3];

async function main() {
  if (scenario === "eexist") {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-sub-"));
    const existing = path.join(tmp, "exists.log");
    fs.writeFileSync(existing, "x");
    const result = await runCommand({
      command: "echo",
      args: ["hello"],
      stdoutPath: existing,
      timeoutMs: 2000,
      mode: "test",
    });
    fs.writeFileSync(outFile, JSON.stringify({ ok: true, result }, null, 2));
    cleanup(tmp);
    return;
  }

  if (scenario === "enoent") {
    const missingParent = path.join(os.tmpdir(), "goas-sub-missing", "does", "not", "exist");
    const out = path.join(missingParent, "out.log");
    const result = await runCommand({
      command: "echo",
      args: ["hello"],
      stdoutPath: out,
      timeoutMs: 2000,
      mode: "test",
    });
    fs.writeFileSync(outFile, JSON.stringify({ ok: true, result }, null, 2));
    return;
  }

  if (scenario === "kill-scope") {
    // Spawn a child the probe owns; then use the same scenario the orphan
    // matcher exercises. A correct fix must only kill the probe's own
    // descendant, not any other process that happens to match the pattern.
    const child = spawn("/bin/sleep", ["600"], { detached: true, stdio: "ignore" });
    await sleep(200);
    const childExited = new Promise((resolve) => child.once("exit", () => resolve(true)));
    killOwnChild(child);
    const ownKilled = await Promise.race([childExited, sleep(500).then(() => false)]);
    fs.writeFileSync(
      outFile,
      JSON.stringify({ ok: true, own_killed: ownKilled }, null, 2),
    );
    return;
  }

  if (scenario === "orphan") {
    const resultPromise = runCommand({
      command: "/bin/sh",
      args: ["-c", "sleep 60 & exec sleep 60"],
      timeoutMs: 200,
      mode: "test",
    });
    const result = await Promise.race([resultPromise, sleep(3000).then(() => ({ hanged: true }))]);

    if (result.hanged) {
      killMatches("sleep 60");
      fs.writeFileSync(outFile, JSON.stringify({ ok: false, reason: "HANG" }, null, 2));
      return;
    }

    let orphan = false;
    for (const pid of fs.readdirSync("/proc").filter((x) => /^\d+$/.test(x))) {
      try {
        const cmdline = fs.readFileSync(`/proc/${pid}/cmdline`, "utf8").replace(/\0/g, " ").trim();
        if (cmdline === "sleep 60") {
          orphan = true;
          try {
            process.kill(Number(pid), "SIGKILL");
          } catch {}
        }
      } catch {}
    }

    fs.writeFileSync(
      outFile,
      JSON.stringify({ ok: !orphan, result, reason: orphan ? "ORPHAN" : undefined }, null, 2),
    );
    return;
  }

  throw new Error(`unknown scenario: ${scenario}`);
}

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

main().then(
  () => process.exit(0),
  (err) => {
    fs.writeFileSync(outFile, JSON.stringify({ ok: false, crashed: String(err) }, null, 2));
    process.exit(1);
  },
);
