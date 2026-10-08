// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Contract/TDD tests for the M-04/M1 orchestrator and evidence writer.
// The orchestrator does not exist yet, so these tests fail by import.

import { describe, it, before } from "node:test";
import assert from "node:assert/strict";

describe("orchestrator + evidence writer (M-04/M1)", () => {
  let orchestrator;

  before(async () => {
    try {
      orchestrator = await import("../lib/orchestrator.mjs");
    } catch (err) {
      assert.fail(`orchestrator module is missing: ${err.message}`);
    }
  });

  it("exports runGoas", () => {
    assert.ok(orchestrator.runGoas, "expected runGoas exported");
  });

  it("exports recordEvidence", () => {
    assert.ok(orchestrator.recordEvidence, "expected recordEvidence exported");
  });

  it("enforces the 900000 ms global run deadline", () => {
    assert.equal(orchestrator.RUN_TOTAL_TIMEOUT_MS, 900000);
  });

  it("uses cwd=${run}", () => {
    assert.ok(orchestrator.RUN_CWD_PATTERN, "expected RUN_CWD_PATTERN exported");
    assert.match(orchestrator.RUN_CWD_PATTERN, /\$\{run\}/);
  });

  it("cross-checks matrix results against manifest.expected_case_count (27)", () => {
    assert.ok(
      orchestrator.assertMatrixIntegrity,
      "expected assertMatrixIntegrity exported",
    );
  });

  it("cross-checks MP results against manifest expected 4 valid / 9 invalid", () => {
    assert.ok(
      orchestrator.assertMercadoPagoIntegrity,
      "expected assertMercadoPagoIntegrity exported",
    );
  });
});
