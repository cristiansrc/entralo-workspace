// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Canonical parser regression: every canonical API YAML under
// docs/specs/increments/entralo-v1-executable-specs/api/*.yaml must be accepted
// by parseStrictYaml under the existing safety quotas (maxBytes 10 MiB,
// maxDepth 100, maxAliasCount 100). Reports bytes/depth/alias/error counts per
// path.

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument, visit } from "yaml";

import { parseStrictYaml } from "../lib/strict-yaml.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "docs/specs/increments/entralo-v1-executable-specs/api",
);

const FILES = [
  "admin-bff.yaml",
  "buyer-bff.yaml",
  "catalog.yaml",
  "common.yaml",
  "identity.yaml",
  "payments.yaml",
  "purchases.yaml",
  "ticketing.yaml",
];

function countAliasNodes(text) {
  const doc = parseDocument(text, { uniqueKeys: true, strict: true });
  let count = 0;
  visit(doc, {
    Alias: () => {
      count += 1;
    },
  });
  return count;
}

function buildAliasedYaml(aliasCount) {
  // Each alias references a mapping anchor so that the YAML parser counts
  // every reference as an alias expansion. 257 references guarantees the total
  // stays > 256 even after raising the default cap to 256.
  const lines = ["shared: &shared", "  key1: value1", "  key2: value2", "nodes:"];
  for (let i = 0; i < aliasCount; i += 1) {
    lines.push("  - *shared");
  }
  return lines.join("\n");
}

describe("canonical API YAML parser regression", () => {
  for (const name of FILES) {
    it(`accepts ${name} within existing safety quotas`, () => {
      const filePath = path.join(API_DIR, name);
      const text = fs.readFileSync(filePath, "utf8");
      const aliasNodes = countAliasNodes(text);
      const result = parseStrictYaml(text, { source: filePath });

      const errorCount = result.diagnostics.filter((d) => d.severity === "error").length;
      const warningCount = result.diagnostics.filter((d) => d.severity === "warning").length;
      console.log(
        `canonical-yaml: ${filePath} | bytes=${result.bytes} depth=${result.depth} alias_nodes=${aliasNodes} errors=${errorCount} warnings=${warningCount} ok=${result.ok}`,
      );

      assert.ok(
        result.ok,
        `expected ${name} to parse cleanly under default quotas, got diagnostics: ${JSON.stringify(result.diagnostics)}`,
      );
    });
  }
});

describe("ALIAS_LIMIT DoS guard regression", () => {
  it("rejects a synthetic YAML with >256 alias expansions under both current cap and raised cap 256", () => {
    const yaml = buildAliasedYaml(257);

    const underCurrentCap = parseStrictYaml(yaml, { source: "synthetic-alias-current" });
    const underRaisedCap = parseStrictYaml(yaml, {
      source: "synthetic-alias-256",
      maxAliasCount: 256,
    });

    assert.equal(
      underCurrentCap.ok,
      false,
      "expected synthetic YAML to be rejected under the current default alias cap",
    );
    assert.ok(
      underCurrentCap.diagnostics.some((d) => d.code === "ALIAS_LIMIT"),
      `expected ALIAS_LIMIT under current cap, got ${JSON.stringify(underCurrentCap.diagnostics)}`,
    );

    assert.equal(
      underRaisedCap.ok,
      false,
      "expected synthetic YAML to still be rejected when the alias cap is raised to 256",
    );
    assert.ok(
      underRaisedCap.diagnostics.some((d) => d.code === "ALIAS_LIMIT"),
      `expected ALIAS_LIMIT under cap 256, got ${JSON.stringify(underRaisedCap.diagnostics)}`,
    );
  });
});
