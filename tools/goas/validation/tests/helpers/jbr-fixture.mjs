// red: test-architect (pack #60 shared JBR fixture helper)
// owner: test-architect — executor must not edit this file.
//
// Creates ephemeral JBR dummy fixtures under os.tmpdir() so tests never depend
// on /opt/jbr25, namespace, repo root or local environment. Intended for tests
// that need a corroborated jbrHome/bin/java path.

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function tmpDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

export function sha256File(target) {
  return crypto.createHash("sha256").update(fs.readFileSync(target)).digest("hex");
}

export function createJbrHome(contents = "fake-jbr-runtime") {
  const jbrHome = tmpDir("goas-jbr-");
  const javaPath = path.join(jbrHome, "bin", "java");
  fs.mkdirSync(path.dirname(javaPath), { recursive: true });
  fs.writeFileSync(javaPath, contents);
  return { jbrHome, javaPath, sha256: sha256File(javaPath) };
}

export function withJbrCustody(profile, javaSha256) {
  const clone = JSON.parse(JSON.stringify(profile));
  clone.java.sha256_custody = javaSha256;
  return clone;
}

export function withoutJbrCustody(profile) {
  const clone = JSON.parse(JSON.stringify(profile));
  delete clone.java.sha256_custody;
  return clone;
}

export async function noopCommandRunner() {
  return {
    exitCode: 0,
    signal: null,
    timedOut: false,
    spawnError: null,
    durationMs: 1,
  };
}
