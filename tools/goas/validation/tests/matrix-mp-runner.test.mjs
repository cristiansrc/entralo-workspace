// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Regression tests for matrix-mp-runner findings:
//   M-01  — fixture path traversal must be blocked.
//   M-04/M1 — cross-check matrix case count against manifest.expected_case_count (27).
//   M-04/M1 — cross-check MP observed_valid/invalid against manifest (4/9).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { runMatrix, runMercadoPago } from "../lib/matrix-mp-runner.mjs";

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

const fakeEngine = {
  compileSchemaRef: () => (instance) => true,
};

describe("matrix-mp-runner", () => {
  it("M-01: runMercadoPago rejects fixture paths that escape the snapshot root", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-mp-"));
    try {
      const snapshotRoot = path.join(tmp, "snapshot");
      const mpDir = path.join(snapshotRoot, "fixtures", "mercado-pago");
      fs.mkdirSync(mpDir, { recursive: true });
      fs.writeFileSync(path.join(mpDir, "valid.json"), "{}");

      // A file deliberately placed outside the snapshot root.
      const outside = path.join(tmp, "outside.json");
      fs.writeFileSync(outside, "{}");

      const manifest = {
        mercado_pago: {
          schema_ref: "api/common.yaml#/components/schemas/MercadoPagoPaymentNotificationV1",
          base_dir: "fixtures/mercado-pago",
          expected_valid: 1,
          expected_invalid: 0,
          files: [{ file: "../../../outside.json", expected_valid: false }],
        },
      };

      assert.throws(
        () => runMercadoPago({ engine: fakeEngine, snapshotRoot, manifest }),
        /PATH_ESCAPE/,
        "traversing out of the snapshot root must be rejected",
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("M-04/M1: runMatrix reports a count mismatch when observed count != manifest.expected_case_count (27)", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-matrix-"));
    try {
      const matrixPath = path.join(tmp, "matrix.json");
      fs.writeFileSync(matrixPath, JSON.stringify({ cases: [] }));

      const manifest = {
        matrix: {
          expected_case_count: 27,
        },
      };

      const result = runMatrix({ engine: fakeEngine, snapshotRoot: tmp, matrixPath, manifest });
      assert.equal(
        result.count_mismatch,
        true,
        "expected count_mismatch=true for 0/27 cases",
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("M-04/M1: runMercadoPago reports a mismatch when observed polarity != manifest 4/9", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-mp-polarity-"));
    try {
      const snapshotRoot = path.join(tmp, "snapshot");
      const mpDir = path.join(snapshotRoot, "fixtures", "mercado-pago");
      fs.mkdirSync(mpDir, { recursive: true });

      const files = Array.from({ length: 13 }, (_, i) => `f${i}.json`);
      for (const f of files) fs.writeFileSync(path.join(mpDir, f), "{}");

      const manifest = {
        mercado_pago: {
          schema_ref: "api/common.yaml#/components/schemas/MercadoPagoPaymentNotificationV1",
          base_dir: "fixtures/mercado-pago",
          expected_valid: 4,
          expected_invalid: 9,
          files: files.map((f) => ({ file: f, expected_valid: true })),
        },
      };

      const result = runMercadoPago({ engine: fakeEngine, snapshotRoot, manifest });
      assert.ok(
        result.polarity_mismatch || result.mismatch_count > 0,
        "expected polarity cross-check failure when all 13 are observed valid but manifest expects 4/9",
      );
    } finally {
      cleanup(tmp);
    }
  });
});
