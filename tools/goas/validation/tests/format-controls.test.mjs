// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Regression tests for format-controls findings:
//   M-01  — fixture path traversal in MP format controls must be blocked.
//   m6    — status/signal names must align with run-profile signals.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { runFormatControls } from "../lib/format-controls.mjs";

const runProfile = JSON.parse(
  fs.readFileSync(new URL("../config/run-profile.json", import.meta.url), "utf8"),
);

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

const fakeEngine = {
  compileSchemaRef: () => (instance) => true,
};

describe("format-controls", () => {
  it("M-01: runFormatControls rejects MP fixture paths that escape the snapshot root", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-fc-"));
    try {
      const snapshotRoot = path.join(tmp, "snapshot");
      const mpDir = path.join(snapshotRoot, "fixtures", "mercado-pago");
      fs.mkdirSync(mpDir, { recursive: true });
      fs.writeFileSync(path.join(mpDir, "valid.json"), "{}");

      const outside = path.join(tmp, "outside.json");
      fs.writeFileSync(outside, "{}");

      const matrixPath = path.join(tmp, "matrix.json");
      fs.writeFileSync(matrixPath, JSON.stringify({ cases: [] }));

      const manifest = {
        mercado_pago: {
          schema_ref: "api/common.yaml#/components/schemas/MercadoPagoPaymentNotificationV1",
          base_dir: "fixtures/mercado-pago",
        },
        format_controls: {
          expect_keyword: "format",
          matrix_case_ids: [],
          mercado_pago_files: ["../../../outside.json"],
        },
      };

      assert.throws(
        () => runFormatControls({ engine: fakeEngine, snapshotRoot, matrixPath, manifest }),
        /PATH_ESCAPE/,
        "traversing out of the snapshot root must be rejected",
      );
    } finally {
      cleanup(tmp);
    }
  });

  it("m6: non-OK statuses belong to the run-profile signal vocabulary", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "goas-fc-sig-"));
    try {
      const signalSet = new Set(runProfile.signals);
      const matrixPath = path.join(tmp, "matrix.json");
      fs.writeFileSync(
        matrixPath,
        JSON.stringify({
          cases: [
            {
              id: "blocked-accepted",
              schema_ref: "api/common.yaml#/components/schemas/X",
              expected_valid: false,
              instance: {},
            },
          ],
        }),
      );

      const manifest = {
        mercado_pago: { schema_ref: "api/common.yaml#/components/schemas/Y", base_dir: "y" },
        format_controls: {
          expect_keyword: "format",
          matrix_case_ids: ["blocked-accepted"],
          mercado_pago_files: [],
        },
      };

      const result = runFormatControls({
        engine: fakeEngine,
        snapshotRoot: tmp,
        matrixPath,
        manifest,
      });

      assert.ok(result.results.length > 0, "expected at least one evaluated control");
      for (const r of result.results) {
        if (r.status === "OK") continue;
        assert.ok(
          signalSet.has(r.status),
          `status ${r.status} must be a declared signal (see run-profile.json)`,
        );
      }
    } finally {
      cleanup(tmp);
    }
  });
});
