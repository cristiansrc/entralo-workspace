// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Regression tests for dead parameters / contract resolution reported in m3.
//   matrix-mp-runner.mjs: runMatrix receives snapshotRoot but never validates
//   that matrixPath lives under it.
//   schema-adapter.mjs: materializeOpenApiComponent receives a resolver but
//   never uses it for relative/external $refs.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { runMatrix } from "../lib/matrix-mp-runner.mjs";
import { materializeOpenApiComponent } from "../lib/schema-adapter.mjs";

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

const fakeEngine = {
  compileSchemaRef: () => (instance) => true,
};

describe("dead parameters / contract resolution (m3)", () => {
  it("runMatrix validates matrixPath against snapshotRoot", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-m3-matrix-"));
    try {
      const snapshotRoot = path.join(tmp, "snapshot");
      fs.mkdirSync(snapshotRoot, { recursive: true });

      // Deliberately place the matrix file OUTSIDE the approved snapshot root.
      const matrixPath = path.join(tmp, "matrix.json");
      fs.writeFileSync(matrixPath, JSON.stringify({ cases: [] }));

      const manifest = {
        matrix: { expected_case_count: 0 },
      };

      assert.throws(
        () => runMatrix({ engine: fakeEngine, snapshotRoot, matrixPath, manifest }),
        /PATH_ESCAPE|snapshotRoot|outside/,
        "matrixPath outside snapshotRoot must be rejected",
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("materializeOpenApiComponent consults the resolver for external $refs", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-m3-resolver-"));
    try {
      const docPath = path.join(tmp, "api.json");
      const doc = {
        components: {
          schemas: {
            X: {
              $ref: "other.yaml#/components/schemas/Y",
            },
          },
        },
      };
      fs.writeFileSync(docPath, JSON.stringify(doc));

      let consulted = false;
      const resolver = {
        resolveSchemaRef: () => {
          consulted = true;
          throw new Error("resolver consulted");
        },
      };

      let err;
      try {
        materializeOpenApiComponent({
          docPath,
          pointer: "/components/schemas/X",
          resolver,
        });
      } catch (e) {
        err = e;
      }

      assert.ok(err, "expected materialisation to fail for an external ref");
      assert.match(
        err.message,
        /resolver consulted/,
        `the supplied resolver must be consulted, got: ${err.message}`,
      );
      assert.ok(consulted, "resolver.resolveSchemaRef was never called");
    } finally {
      cleanup(tmp);
    }
  });
});
