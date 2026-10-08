// G-OAS subprocess wrapper — plan §7 / §16.4/§16.5.
//
// Captures the REAL exit code and signal, one attempt only, no retries and no
// backoff. Per-command timeout kills the WHOLE process group with SIGKILL
// (A2/H-01), so no `unshare`/`env`/`java` descendant survives as an orphan.
// stdout/stderr are streamed to owner-only files (L-06) so a full pipe cannot
// hide the exit status; stream open errors are recorded, never thrown as an
// unhandled 'error' event (A1/M-03).
//
// The executable is checked against an approved allowlist (L-05) so a `java`
// resolved from PATH can never be used for the run.
//
// This module writes ONLY to caller-provided paths inside the external run dir.

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/** Executables approved for PRODUCTION G-OAS tooling (absolute paths only). */
export const PRODUCTION_ALLOWED_COMMANDS = Object.freeze(
  new Set(["/usr/bin/timeout", "/usr/bin/unshare", "/usr/bin/env"]),
);

/**
 * Executables approved for test/dev probes. The bare `echo`/`sh` entries (and
 * their absolute forms) resolve/search through PATH, so they are deliberately
 * excluded from the production allowlist and only accepted in `test` mode.
 */
export const TEST_ALLOWED_COMMANDS = Object.freeze(
  new Set([
    ...PRODUCTION_ALLOWED_COMMANDS,
    "echo",
    "/bin/echo",
    "/usr/bin/echo",
    "sh",
    "/bin/sh",
    "/usr/bin/sh",
  ]),
);

/**
 * Default execution mode (SR-04): fail-closed `production`. Callers that need
 * the permissive test allowlist MUST opt in EXPLICITLY with `{ mode: "test" }`;
 * a future production caller can no longer inherit `echo`/`sh`-through-PATH by
 * omitting the mode.
 */
export const DEFAULT_COMMAND_MODE = "production";

/** Forbidden java binaries/locations (generation-profile.json: no PATH java). */
export const FORBIDDEN_JAVA_PATHS = Object.freeze([
  "/usr/bin/java",
  "/usr/lib/jvm/default",
]);

/**
 * L-05/SR-03: throw unless `command` is allowlisted. In `production` mode a
 * `java` binary is accepted only as the EXACT `${jbrHome}/bin/java` path, i.e.
 * `jbrHome` must be corroborated by the caller; an arbitrary absolute java path
 * (e.g. `/tmp/evil/java`) is rejected fail-closed as `TOOLCHAIN_BLOCKED`.
 */
export function assertCommandAllowed(command, { mode = DEFAULT_COMMAND_MODE, jbrHome } = {}) {
  if (typeof command !== "string" || command.length === 0) {
    throw new Error("COMMAND_NOT_ALLOWED: empty command");
  }
  const allowed = mode === "production" ? PRODUCTION_ALLOWED_COMMANDS : TEST_ALLOWED_COMMANDS;
  if (allowed.has(command)) return;
  if (path.basename(command) === "java") {
    if (!path.isAbsolute(command)) {
      throw new Error(`COMMAND_NOT_ALLOWED: java must be an explicit absolute path: ${command}`);
    }
    const forbidden = FORBIDDEN_JAVA_PATHS.some(
      (p) => command === p || command.startsWith(`${p}${path.sep}`),
    );
    if (forbidden) {
      throw new Error(`COMMAND_NOT_ALLOWED: java from PATH/default is forbidden: ${command}`);
    }
    if (mode === "production") {
      if (typeof jbrHome !== "string" || jbrHome.length === 0) {
        throw new Error(
          `TOOLCHAIN_BLOCKED: java ${command} requires a corroborated jbrHome absolute path`,
        );
      }
      const expected = path.join(jbrHome, "bin", "java");
      if (command !== expected) {
        throw new Error(
          `TOOLCHAIN_BLOCKED: java ${command} is not the corroborated JBR binary ${expected}`,
        );
      }
    }
    return;
  }
  throw new Error(`COMMAND_NOT_ALLOWED: ${command}`);
}

function safeEnd(stream) {
  if (!stream) return;
  try {
    stream.end();
  } catch {
    /* the 'error' handler already recorded/open failed */
  }
}

function safeWrite(stream, chunk) {
  if (!stream) return;
  try {
    stream.write(chunk);
  } catch {
    /* stream error is captured by the 'error' handler */
  }
}

function openEvidenceStream(target, onError) {
  if (!target) return null;
  let stream;
  try {
    stream = fs.createWriteStream(target, { flags: "wx", mode: 0o600 });
  } catch (error) {
    onError(error);
    return null;
  }
  stream.on("error", onError);
  return stream;
}

function killProcessGroup(child) {
  if (!child || typeof child.pid !== "number") return;
  try {
    // `detached: true` makes the child a process-group leader.
    process.kill(-child.pid, "SIGKILL");
  } catch {
    try {
      child.kill("SIGKILL");
    } catch {
      /* already gone */
    }
  }
}

/**
 * @returns {Promise<{command:string,args:string[],exitCode:number|null,signal:string|null,
 *   timedOut:boolean,durationMs:number,stdoutBytes:number,stderrBytes:number,
 *   stdoutPath:string|null,stderrPath:string|null,spawnError:string|null}>}
 */
export function runCommand(options) {
  const {
    command,
    args = [],
    cwd,
    env,
    timeoutMs,
    stdoutPath = null,
    stderrPath = null,
    mode = DEFAULT_COMMAND_MODE,
  } = options;

  return new Promise((resolve) => {
    const startedAt = Date.now();
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let settled = false;
    let timedOut = false;
    let streamError = null;
    let timer = null;

    const finish = (exitCode, signal, spawnError) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      safeEnd(outStream);
      safeEnd(errStream);
      resolve({
        command,
        args,
        exitCode: exitCode ?? null,
        signal: signal ?? null,
        timedOut,
        durationMs: Date.now() - startedAt,
        stdoutBytes,
        stderrBytes,
        stdoutPath,
        stderrPath,
        spawnError: spawnError ?? streamError ?? null,
      });
    };

    // L-05: fail closed, but resolve (do not reject) so the caller records it.
    try {
      assertCommandAllowed(command, { mode });
    } catch (error) {
      resolve({
        command,
        args,
        exitCode: null,
        signal: null,
        timedOut: false,
        durationMs: Date.now() - startedAt,
        stdoutBytes: 0,
        stderrBytes: 0,
        stdoutPath,
        stderrPath,
        spawnError: String(error?.message ?? error),
      });
      return;
    }

    const onStreamError = (error) => {
      streamError = streamError ?? String(error?.message ?? error);
    };
    const outStream = openEvidenceStream(stdoutPath, onStreamError);
    const errStream = openEvidenceStream(stderrPath, onStreamError);

    let child;
    try {
      child = spawn(command, args, {
        cwd,
        env,
        stdio: ["ignore", "pipe", "pipe"],
        // New process group: the timeout can kill the whole tree (A2/H-01).
        detached: true,
      });
    } catch (error) {
      finish(null, null, String(error?.message ?? error));
      return;
    }

    child.stdout?.on("data", (chunk) => {
      stdoutBytes += chunk.length;
      safeWrite(outStream, chunk);
    });
    child.stderr?.on("data", (chunk) => {
      stderrBytes += chunk.length;
      safeWrite(errStream, chunk);
    });

    if (typeof timeoutMs === "number" && timeoutMs > 0) {
      timer = setTimeout(() => {
        timedOut = true;
        killProcessGroup(child);
      }, timeoutMs);
    }

    child.on("error", (error) => finish(null, null, String(error?.message ?? error)));
    child.on("close", (code, signal) => finish(code, signal, null));
  });
}
