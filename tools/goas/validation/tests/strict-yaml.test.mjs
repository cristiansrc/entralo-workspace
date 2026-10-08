// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Regression test for strict-yaml finding L-09 / m1:
//   The executable-tag regex must anchor all language alternatives, so
//   `!js/function` and `!python/function` are both rejected, without relying
//   on accidental substring matches.

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { parseStrictYaml } from "../lib/strict-yaml.mjs";

describe("strict-yaml", () => {
  it("L-09: rejects !js/function (anchored tag)", () => {
    const result = parseStrictYaml("tag: !js/function foo", { source: "test" });
    assert.ok(!result.ok, "!js/function must be rejected as an executable tag");
    assert.ok(
      result.diagnostics.some((d) => d.code === "EXECUTABLE_TAG"),
      "expected EXECUTABLE_TAG diagnostic",
    );
  });

  it("L-09: rejects !python/function (anchored tag)", () => {
    const result = parseStrictYaml("tag: !python/function bar", { source: "test" });
    assert.ok(!result.ok, "!python/function must be rejected as an executable tag");
    assert.ok(
      result.diagnostics.some((d) => d.code === "EXECUTABLE_TAG"),
      "expected EXECUTABLE_TAG diagnostic",
    );
  });

  it("L-09: does not falsely reject benign tags containing 'python' as substring", () => {
    const result = parseStrictYaml("tag: !notpython/allowed value", { source: "test" });
    assert.ok(result.ok, `benign tag must parse, got ${JSON.stringify(result.diagnostics)}`);
  });

  it("L-09: rejects YAML nested deeper than the 100-level limit", () => {
    function buildYaml(depth) {
      let value = "leaf";
      for (let i = 0; i < depth; i += 1) {
        value = `- ${value}`;
      }
      return value;
    }
    const result = parseStrictYaml(buildYaml(101), { source: "test" });
    assert.ok(!result.ok, "excessive YAML nesting must be rejected");
    assert.ok(
      result.diagnostics.some((d) => d.code === "DEPTH_EXCEEDED"),
      "expected DEPTH_EXCEEDED diagnostic",
    );
  });
});
