// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Regression tests for offline-refs findings:
//   L-02 — assertUnderRoot must follow realpath (reject symlink escapes).
//   L-03 — loadRefsRegistry must use strict JSON (reject duplicate keys / comments).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { assertUnderRoot, loadRefsRegistry, createOfflineResolver } from "../lib/offline-refs.mjs";

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

describe("offline-refs", () => {
  it("L-02: assertUnderRoot detects escape through a symlink", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-refs-"));
    try {
      const root = path.join(tmp, "root");
      fs.mkdirSync(root, { recursive: true });
      const outside = fs.mkdtempSync(path.join(os.tmpdir(), "goas-refs-out-"));
      const link = path.join(root, "escape");
      fs.symlinkSync(outside, link);

      const target = path.join(link, "file.json");
      fs.writeFileSync(target, "{}");

      assert.throws(() => assertUnderRoot(target, root, "symlink-escape"), /PATH_ESCAPE/);
      cleanup(outside);
    } finally {
      cleanup(tmp);
    }
  });

  it("L-03: loadRefsRegistry rejects JSON with duplicate keys", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-refs-json-"));
    try {
      const reg = path.join(tmp, "registry.json");
      // Duplicate top-level key inside the JSON object.
      fs.writeFileSync(
        reg,
        '{ "network_policy": "never", "network_policy": "always", "schemas": [] }',
      );

      assert.throws(
        () => loadRefsRegistry(reg),
        /DUPLICATE|duplicate/,
        "duplicate object keys must be rejected by strict parsing",
      );
    } finally {
      cleanup(tmp);
    }
  });
});
