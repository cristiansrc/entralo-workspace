// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Regression tests for schema-adapter findings:
//   L-01 — loadSourceDoc must enforce maxBytes on JSON inputs.
//   L-08 — materializeOpenApiComponent must not allow prototype pollution via $defs keys.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { loadSourceDoc, materializeOpenApiComponent } from "../lib/schema-adapter.mjs";

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

describe("schema-adapter", () => {
  it("L-01: loadSourceDoc rejects JSON files larger than maxBytes (10 MiB)", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-sa-"));
    try {
      const big = path.join(tmp, "big.json");
      // 10 MiB + 1 byte
      const payload = "x".repeat(10 * 1024 * 1024 + 1);
      fs.writeFileSync(big, JSON.stringify({ value: payload }));

      assert.throws(
        () => loadSourceDoc(big),
        /SIZE_EXCEEDED|maxBytes/,
        "oversized JSON must be rejected",
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("L-08: materializeOpenApiComponent does not pollute Object.prototype via $defs", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-sa-l08-"));
    try {
      const docPath = path.join(tmp, "evil.json");
      const doc = {
        components: {
          schemas: {
            Evil: {
              $defs: {
                __proto__: {
                  type: "object",
                  properties: {
                    polluted: { const: true },
                  },
                },
              },
              type: "object",
              properties: {
                ref: { $ref: "#/$defs/__proto__" },
              },
            },
          },
        },
      };
      fs.writeFileSync(docPath, JSON.stringify(doc));

      // eslint-disable-next-line no-proto
      delete Object.prototype.polluted;

      materializeOpenApiComponent({
        docPath,
        pointer: "/components/schemas/Evil",
        resolver: {
          resolveSchemaRef: () => {
            throw new Error("unexpected network ref");
          },
        },
      });

      assert.strictEqual(
        // eslint-disable-next-line no-proto
        Object.prototype.polluted,
        undefined,
        "prototype must not be polluted",
      );
    } finally {
      cleanup(tmp);
    }
  });
});
