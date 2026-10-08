// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Regression tests for strict-json gaps reported in pack #51:
//   L-09 depth — parseStrictJson has no recursion/depth limit and no
//         DEPTH_EXCEEDED diagnostic.
//   L-03 duplicate keys — dedicated coverage for the duplicate-key contract.

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { parseStrictJson } from "../lib/strict-json.mjs";

function buildNestedArray(depth) {
  let value = "leaf";
  for (let i = 0; i < depth; i += 1) {
    value = [value];
  }
  return JSON.stringify(value);
}

describe("strict-json", () => {
  it("L-03: rejects duplicate object keys", () => {
    const result = parseStrictJson('{"a": 1, "a": 2}', { source: "test" });
    assert.ok(!result.ok, "duplicate keys must make the parse fail");
    assert.ok(
      result.duplicateKeys.length > 0,
      "duplicate keys must be reported with their paths",
    );
  });

  it("L-09: rejects JSON nested deeper than the configured depth limit", () => {
    // run-profile.json declares max_yaml_depth = 100; JSON should have an
    // analogous guard so a hostile deeply-nested payload cannot exhaust the
    // stack during recursive traversal.
    const deep = buildNestedArray(150);
    const result = parseStrictJson(deep, { source: "test" });
    assert.ok(!result.ok, "excessive nesting must be rejected");
    assert.ok(
      result.parseErrors.some((e) => e.code === "DEPTH_EXCEEDED"),
      "expected a DEPTH_EXCEEDED parse error",
    );
  });
});
