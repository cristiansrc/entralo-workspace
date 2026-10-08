// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Regression tests for preflight gaps reported in pack #51.
//
// These tests exercise the REAL behaviour shipped by preflight.mjs through a
// proposed test seam. Required public API (currently not exported):
//   - parseJsonNoDuplicates(text, source)
//   - stripYamlComments(text)
//   - NETWORK_RE
//   - WRITE_RE
//   - CANONICAL_PATH_RE
//
// The runner side-effects at the bottom of preflight.mjs MUST be guarded so
// importing the module for the test seam does not execute the script.
//
// Until preflight.mjs exports those names this suite fails at import time,
// which is the correct red signal: no implementation is duplicated here.

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  parseJsonNoDuplicates,
  stripYamlComments,
  NETWORK_RE,
  WRITE_RE,
  CANONICAL_PATH_RE,
} from "../preflight.mjs";

const dynamicWriter = `
import fs from "node:fs";
import path from "node:path";

export function persist(config) {
  const target = path.join(config.canonicalBase, config.fileName);
  fs.writeFileSync(target, config.payload);
}
`;

const dynamicNetworkImports = `
async function probe() {
  const dgram = await import("node:dgram");
  const https = await import("node:https");
  return { dgram, https };
}
`;

describe("preflight gaps (pack #51)", () => {
  it("m2: canonical-sources write heuristic flags dynamic canonical paths", () => {
    assert.ok(
      WRITE_RE.test(dynamicWriter),
      "WRITE_RE must detect a write operation in the source",
    );
    assert.ok(
      CANONICAL_PATH_RE.test(dynamicWriter),
      "CANONICAL_PATH_RE must detect a config-derived canonical path identifier",
    );
  });

  it("m4/L-04: NETWORK_RE detects dynamic import() of network modules", () => {
    assert.ok(
      NETWORK_RE.test(dynamicNetworkImports),
      "dynamic imports of node:dgram / node:https must be flagged as network primitives",
    );
  });

  it("m5: stripYamlComments preserves '#' inside double-quoted strings", () => {
    const line = 'description: "keep # inside the string"';
    const stripped = stripYamlComments(line);
    assert.ok(
      stripped.includes("keep # inside the string"),
      `quoted '#' must survive comment stripping, got: ${stripped}`,
    );
  });

  it("L-03: parseJsonNoDuplicates rejects duplicate object keys", () => {
    const duplicateKeyJson = '{ "network_policy": "never", "network_policy": "always" }';
    assert.throws(
      () => parseJsonNoDuplicates(duplicateKeyJson, "test.json"),
      /DUPLICATE_KEYS/,
      "duplicate JSON keys must be rejected, matching strict-json policy",
    );
  });

  it("L-03: parseJsonNoDuplicates accepts valid JSON and returns the parsed value", () => {
    const parsed = parseJsonNoDuplicates('{ "network_policy": "never" }', "test.json");
    assert.equal(parsed.network_policy, "never");
  });
});
