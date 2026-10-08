// G-OAS matrix (27) and Mercado Pago (13) runner — plan §5 / §6.
//
// Resolves each `schema_ref` FROM the matrix/fixture base directory, validates
// the `instance` and compares the boolean with `expected_valid`. It never
// validates the matrix document as an HTTP payload, and it preserves every
// individual case result even after a mismatch.
//
// Read-only. This module never writes to any path.

import path from "node:path";

import { loadSourceDoc, validateInstance } from "./schema-adapter.mjs";
import { assertUnderRoot } from "./offline-refs.mjs";

function compileCacheKey(ref, base) {
  return `${base}\u0000${ref}`;
}

function recordCase(id, schemaRef, expectedValid, result, extra = {}) {
  const observedValid = result.valid;
  return {
    id,
    schema_ref: schemaRef,
    expected_valid: expectedValid,
    observed_valid: observedValid,
    pass: observedValid === expectedValid,
    errors: result.errors,
    ...extra,
  };
}

function resolveFixturePath(snapshotRoot, baseDir, file, label) {
  const target = path.join(snapshotRoot, baseDir, file);
  // M-01: a `../../…` fixture entry must never read outside the snapshot.
  assertUnderRoot(target, snapshotRoot, label);
  return target;
}

export function runMatrix({ engine, snapshotRoot, matrixPath, manifest }) {
  // m3: the matrix document itself must live under the approved snapshot root;
  // otherwise a configured path could read a matrix from outside the snapshot.
  assertUnderRoot(matrixPath, snapshotRoot, "matrixPath");
  const matrix = loadSourceDoc(matrixPath);
  const base = path.dirname(matrixPath);
  const cache = new Map();
  const results = [];

  for (const testCase of matrix.cases ?? []) {
    const cacheKey = compileCacheKey(testCase.schema_ref, base);
    if (!cache.has(cacheKey)) {
      cache.set(cacheKey, engine.compileSchemaRef(testCase.schema_ref, matrixPath));
    }
    const compiled = cache.get(cacheKey);
    const result = validateInstance(compiled, testCase.instance);
    results.push(recordCase(testCase.id, testCase.schema_ref, testCase.expected_valid, result));
  }

  const observedCount = matrix.cases?.length ?? 0;
  const manifestExpected = manifest?.matrix?.expected_case_count;
  const countMismatch = Number.isInteger(manifestExpected)
    ? observedCount !== manifestExpected
    : false;

  return {
    source: matrixPath,
    expected_count: observedCount,
    manifest_expected_case_count: manifestExpected ?? null,
    count_mismatch: countMismatch,
    pass_count: results.filter((r) => r.pass).length,
    mismatch_count: results.filter((r) => !r.pass).length,
    results,
  };
}

export function runMercadoPago({ engine, snapshotRoot, manifest }) {
  const spec = manifest.mercado_pago;
  // The MP schema_ref is expressed relative to the snapshot root.
  const basePseudo = path.join(snapshotRoot, "__mercado_pago__");
  const compiled = engine.compileSchemaRef(spec.schema_ref, basePseudo);
  const results = [];

  for (const entry of spec.files) {
    const fixturePath = resolveFixturePath(snapshotRoot, spec.base_dir, entry.file, entry.file);
    const instance = loadSourceDoc(fixturePath);
    const result = validateInstance(compiled, instance);
    results.push(recordCase(entry.file, spec.schema_ref, entry.expected_valid, result));
  }

  const observedValid = results.filter((r) => r.observed_valid).length;
  const observedInvalid = results.filter((r) => !r.observed_valid).length;
  const polarityMismatch =
    (Number.isInteger(spec.expected_valid) && observedValid !== spec.expected_valid) ||
    (Number.isInteger(spec.expected_invalid) && observedInvalid !== spec.expected_invalid);

  return {
    schema_ref: spec.schema_ref,
    expected_count: spec.files.length,
    expected_valid: spec.expected_valid,
    expected_invalid: spec.expected_invalid,
    observed_valid: observedValid,
    observed_invalid: observedInvalid,
    polarity_mismatch: polarityMismatch,
    pass_count: results.filter((r) => r.pass).length,
    mismatch_count: results.filter((r) => !r.pass).length,
    results,
  };
}

export function runMatrixAndMercadoPago({ engine, snapshotRoot, matrixPath, manifest }) {
  return {
    // F-07: forward `manifest` so the matrix cross-check against
    // manifest.matrix.expected_case_count (27) is never silently omitted.
    matrix: runMatrix({ engine, snapshotRoot, matrixPath, manifest }),
    mercado_pago: runMercadoPago({ engine, snapshotRoot, manifest }),
  };
}
