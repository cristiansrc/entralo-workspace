// G-OAS format controls — plan §5.
//
// Asserts `format` semantics specifically: for the negative controls the
// rejection MUST come from the `format` keyword (keyword/schemaPath recorded),
// not from another rule. An invalid instance accepted by the engine, or
// rejected only by a non-format keyword, blocks format coverage.
//
// Instances come from the canonical matrix (5 controls) and the MP fixtures
// (2 controls). Nothing is invented here.
//
// Read-only. This module never writes to any path.

import path from "node:path";

import { loadSourceDoc, validateInstance } from "./schema-adapter.mjs";
import { assertUnderRoot } from "./offline-refs.mjs";

export function runFormatControls({ engine, snapshotRoot, matrixPath, manifest }) {
  const spec = manifest.format_controls;
  const expectedKeyword = spec.expect_keyword ?? "format";

  // SR-06/M-01: the matrix document must live under the approved snapshot root,
  // mirroring runMatrix (m3); otherwise a configured path could read a matrix
  // from outside the approved snapshot.
  assertUnderRoot(matrixPath, snapshotRoot, "matrixPath");

  const matrix = loadSourceDoc(matrixPath);
  const byId = new Map((matrix.cases ?? []).map((c) => [c.id, c]));
  const results = [];

  for (const id of spec.matrix_case_ids) {
    const testCase = byId.get(id);
    if (!testCase) {
      // F-06/m6: a missing case is a blocked control. Report a status that is
      // declared in run-profile.json `signals`; the precise cause is preserved
      // in `blocked_reason` without inventing a new signal name.
      results.push({
        id,
        source: "matrix",
        status: "FORMAT_ASSERTION_BLOCKED",
        blocked_reason: "MISSING_CASE",
        pass: false,
      });
      continue;
    }
    const compiled = engine.compileSchemaRef(testCase.schema_ref, matrixPath);
    const result = validateInstance(compiled, testCase.instance);
    results.push(
      evaluate({
        id,
        source: "matrix",
        schemaRef: testCase.schema_ref,
        expectedValid: testCase.expected_valid,
        result,
        expectedKeyword,
      }),
    );
  }

  const mp = manifest.mercado_pago;
  const basePseudo = path.join(snapshotRoot, "__mercado_pago__");
  const mpCompiled = engine.compileSchemaRef(mp.schema_ref, basePseudo);

  for (const file of spec.mercado_pago_files) {
    const fixturePath = path.join(snapshotRoot, mp.base_dir, file);
    // M-01: reject fixture paths that escape the snapshot root.
    assertUnderRoot(fixturePath, snapshotRoot, file);
    const instance = loadSourceDoc(fixturePath);
    const result = validateInstance(mpCompiled, instance);
    results.push(
      evaluate({
        id: file,
        source: "mercado_pago",
        schemaRef: mp.schema_ref,
        expectedValid: false,
        result,
        expectedKeyword,
      }),
    );
  }

  return {
    expected_keyword: expectedKeyword,
    pass_count: results.filter((r) => r.pass).length,
    blocked_count: results.filter((r) => !r.pass).length,
    results,
  };
}

function evaluate({ id, source, schemaRef, expectedValid, result, expectedKeyword }) {
  const observedValid = result.valid;
  const keywordMatched = result.errors.some((e) => e.keyword === expectedKeyword);
  // m6: report only statuses declared in run-profile.json `signals`; the finer
  // cause is kept in `blocked_reason` without inventing a new signal name.
  let status;
  let blockedReason = null;
  if (observedValid !== expectedValid) {
    if (observedValid) {
      status = "FORMAT_ASSERTION_BLOCKED";
      blockedReason = "ACCEPTED";
    } else {
      status = "CASE_POLARITY_MISMATCH";
      blockedReason = "REJECTED_EXPECTED_VALID";
    }
  } else if (!expectedValid && !keywordMatched) {
    status = "FORMAT_ASSERTION_BLOCKED";
    blockedReason = "WRONG_KEYWORD";
  } else {
    status = "OK";
  }
  return {
    id,
    source,
    schema_ref: schemaRef,
    expected_valid: expectedValid,
    observed_valid: observedValid,
    format_keyword_observed: keywordMatched,
    blocked_reason: blockedReason,
    pass: status === "OK",
    status,
    errors: result.errors,
  };
}
