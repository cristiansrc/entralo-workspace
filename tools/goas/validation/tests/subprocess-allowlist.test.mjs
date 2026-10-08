// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Regression tests for the production allowlist observation from pack #51:
//   Bare "echo" and "sh" must not be allowlisted in production mode because
//   they resolve through PATH. A matching binary in an attacker-controlled
//   directory must not be executed.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { assertCommandAllowed, runCommand } from "../lib/subprocess.mjs";

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

describe("subprocess production allowlist (pack #51)", () => {
  it("rejects bare 'echo' in production mode", () => {
    assert.throws(
      () => assertCommandAllowed("echo", { mode: "production" }),
      /COMMAND_NOT_ALLOWED/,
      "bare 'echo' must not be allowlisted in production",
    );
  });

  it("rejects bare 'sh' in production mode", () => {
    assert.throws(
      () => assertCommandAllowed("sh", { mode: "production" }),
      /COMMAND_NOT_ALLOWED/,
      "bare 'sh' must not be allowlisted in production",
    );
  });

  it("rejects a PATH-resolved fake 'echo' in production mode", async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-sub-prod-"));
    const marker = path.join(tmp, "marker");
    const fakeEcho = path.join(tmp, "echo");

    // A fake echo that, if executed, proves PATH resolution was trusted.
    fs.writeFileSync(
      fakeEcho,
      `#!/bin/sh\ntouch "$MARKER"\nexit 0\n`,
      { mode: 0o755 },
    );

    try {
      const result = await runCommand({
        command: "echo",
        args: ["marker"],
        timeoutMs: 2000,
        mode: "production",
        env: {
          ...process.env,
          PATH: `${tmp}${path.delimiter}${process.env.PATH}`,
          MARKER: marker,
        },
      });

      assert.match(
        result.spawnError,
        /COMMAND_NOT_ALLOWED/,
        `PATH-resolved echo must be rejected in production, got ${JSON.stringify(result)}`,
      );
      assert.ok(
        !fs.existsSync(marker),
        "fake echo from an untrusted PATH directory must not run",
      );
    } finally {
      cleanup(tmp);
    }
  });
});
