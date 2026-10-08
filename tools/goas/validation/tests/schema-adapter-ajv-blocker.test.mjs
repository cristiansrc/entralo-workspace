// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Ajv blocker tests (G-OAS static run 20261007T215413Z-static).
//
// The six matrix cases blocked by strictTypes on integration-envelope.v1.schema.json
// must compile and validate with correct polarity once the adapter enables
// strictTypes:'log' while keeping strict:true.
//
// Preserves strict invariants:
//   - strict:true
//   - strictSchema / strictNumbers / strictTuples / strictRequired : true
//   - Ajv2020
//   - validateFormats:true
//   - ajv-formats mode 'full'
//   - strictTypes warnings visible (not silenced)
//   - unknown keywords / unknown formats still fail
//   - no mutation of validated instances or shared options object

import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Ajv2020 from "ajv/dist/2020.js";

import {
  AJV_OPTIONS,
  createAjv,
  createSchemaEngine,
  validateInstance,
} from "../lib/schema-adapter.mjs";

const SNAPSHOT_ROOT = path.resolve(
  process.cwd(),
  "../../../docs/specs/increments/entralo-v1-executable-specs",
);
const REGISTRY_PATH = path.resolve(process.cwd(), "./config/refs-registry.json");
const FIXTURE_PATH = path.join(
  SNAPSHOT_ROOT,
  "fixtures/contratos/schema-cases.v1.json",
);

const allCases = JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")).cases;

function caseById(id) {
  const c = allCases.find((entry) => entry.id === id);
  if (!c) throw new Error(`fixture case ${id} not found in ${FIXTURE_PATH}`);
  return c;
}

function makeEngine() {
  return createSchemaEngine({
    snapshotRoot: SNAPSHOT_ROOT,
    registryPath: REGISTRY_PATH,
  });
}

describe("schema-adapter Ajv blocker", () => {
  it("uses Ajv2020", () => {
    const engine = makeEngine();
    assert.ok(
      engine.ajv instanceof Ajv2020,
      "engine must use Ajv2020 (draft 2020-12)",
    );
  });

  it("enforces strict:true and strictSchema/strictNumbers/strictTuples/strictRequired:true", () => {
    const engine = makeEngine();
    assert.strictEqual(engine.ajv.opts.strict, true);
    assert.strictEqual(engine.ajv.opts.strictSchema, true);
    assert.strictEqual(engine.ajv.opts.strictNumbers, true);
    assert.strictEqual(engine.ajv.opts.strictTuples, true);
    assert.strictEqual(engine.ajv.opts.strictRequired, true);
    assert.strictEqual(engine.options.strict, true);
  });

  it("validates formats", () => {
    const engine = makeEngine();
    assert.strictEqual(engine.ajv.opts.validateFormats, true);
    assert.strictEqual(engine.options.validateFormats, true);
  });

  it("uses ajv-formats in full mode", () => {
    const engine = makeEngine();
    assert.strictEqual(engine.options.formatsMode, "full");
  });

  it("configures strictTypes:'log'", () => {
    const engine = makeEngine();
    assert.strictEqual(
      engine.ajv.opts.strictTypes,
      "log",
      "strictTypes must be 'log' to compile integration-envelope while preserving strict mode",
    );
    assert.strictEqual(engine.options.strictTypes, "log");
  });

  it("surfaces strictTypes warnings instead of throwing", () => {
    const ajv = createAjv();
    const warnings = [];
    // Override the instance logger so warnings are captured, not lost.
    ajv.logger = {
      warn: (msg) => warnings.push(msg),
      log: () => {},
      error: () => {},
    };

    let threw = null;
    try {
      // A schema that uses required/properties inside an if/then without an
      // explicit type:object triggers strictTypes diagnostics.
      ajv.compile({
        allOf: [
          {
            if: { properties: { flag: { const: true } }, required: ["flag"] },
            then: { properties: { name: { type: "string" } } },
          },
        ],
      });
    } catch (err) {
      threw = err;
    }

    assert.strictEqual(
      threw,
      null,
      "compile must not throw when strictTypes is 'log'",
    );
    assert.ok(
      warnings.length > 0,
      "strictTypes warnings must be visible, not silenced",
    );
    assert.ok(
      warnings.some((w) => w.includes("strictTypes")),
      "warnings must mention strictTypes",
    );
  });

  it("does not silence Ajv warnings by default", () => {
    const ajv = createAjv();
    assert.ok(ajv.logger, "logger must be present so warnings are visible");
    assert.strictEqual(typeof ajv.logger.warn, "function");
  });

  it("rejects schemas with unknown keywords", () => {
    const ajv = createAjv();
    assert.throws(
      () => ajv.compile({ type: "object", unknownKeywordFoo: "bar" }),
      /unknown keyword/,
    );
  });

  it("rejects schemas with unknown formats", () => {
    const ajv = createAjv();
    assert.throws(
      () =>
        ajv.compile({
          type: "object",
          properties: {
            x: { type: "string", format: "unknown-format-xyz" },
          },
        }),
      /unknown format/,
    );
  });

  it("does not mutate validated instances", () => {
    const ajv = createAjv();
    const validate = ajv.compile({
      type: "object",
      additionalProperties: false,
      properties: { x: { type: "string" } },
    });
    const instance = { x: "ok", extra: 1 };
    const before = JSON.stringify(instance);

    const result = validateInstance(validate, instance);

    assert.strictEqual(result.valid, false);
    assert.strictEqual(
      JSON.stringify(instance),
      before,
      "validated instance must not be mutated",
    );
  });

  it("does not mutate the shared Ajv options object", () => {
    assert.ok(Object.isFrozen(AJV_OPTIONS), "AJV_OPTIONS must be frozen");
    const before = JSON.stringify(AJV_OPTIONS);
    createAjv();
    createAjv();
    assert.strictEqual(
      JSON.stringify(AJV_OPTIONS),
      before,
      "creating Ajv instances must not mutate shared options",
    );
  });

  it("compiles integration-envelope.v1.schema.json", () => {
    const engine = makeEngine();
    assert.doesNotThrow(() => {
      engine.compileSchemaRef(
        "../../events/integration-envelope.v1.schema.json",
        FIXTURE_PATH,
      );
    }, "integration-envelope must compile once strictTypes is 'log'");
  });

  it("refund R04 SYSTEM_R04 is valid", () => {
    const engine = makeEngine();
    const compiled = engine.compileSchemaRef(
      "../../events/integration-envelope.v1.schema.json",
      FIXTURE_PATH,
    );
    const { instance } = caseById("refund-r04-system-valid");
    const result = validateInstance(compiled, instance);
    assert.strictEqual(
      result.valid,
      true,
      `expected valid: ${JSON.stringify(result.errors)}`,
    );
  });

  it("refund R04 SUPPORT is invalid", () => {
    const engine = makeEngine();
    const compiled = engine.compileSchemaRef(
      "../../events/integration-envelope.v1.schema.json",
      FIXTURE_PATH,
    );
    const { instance } = caseById("refund-r04-support-invalid");
    const result = validateInstance(compiled, instance);
    assert.strictEqual(
      result.valid,
      false,
      "R04 with authority SUPPORT must be invalid",
    );
  });

  it("EventOperationReceipt COMPLETED id/version valid", () => {
    const engine = makeEngine();
    const { schema_ref, instance } = caseById("event-receipt-completed-valid");
    const compiled = engine.compileSchemaRef(schema_ref, FIXTURE_PATH);
    const result = validateInstance(compiled, instance);
    assert.strictEqual(
      result.valid,
      true,
      `expected valid: ${JSON.stringify(result.errors)}`,
    );
  });

  it("EventOperationReceipt COMPLETED null id/version invalid", () => {
    const engine = makeEngine();
    const { schema_ref, instance } = caseById("event-receipt-completed-null");
    const compiled = engine.compileSchemaRef(schema_ref, FIXTURE_PATH);
    const result = validateInstance(compiled, instance);
    assert.strictEqual(
      result.valid,
      false,
      "COMPLETED with null resource_id/event_version must be invalid",
    );
  });

  it("EventOperationReceipt PENDING both null valid", () => {
    const engine = makeEngine();
    const { schema_ref, instance } = caseById("event-receipt-pending-null");
    const compiled = engine.compileSchemaRef(schema_ref, FIXTURE_PATH);
    const result = validateInstance(compiled, instance);
    assert.strictEqual(
      result.valid,
      true,
      `expected valid: ${JSON.stringify(result.errors)}`,
    );
  });

  it("EventOperationReceipt PENDING missing id/version invalid", () => {
    const engine = makeEngine();
    const { schema_ref, instance } = caseById(
      "event-receipt-pending-missing",
    );
    const compiled = engine.compileSchemaRef(schema_ref, FIXTURE_PATH);
    const result = validateInstance(compiled, instance);
    assert.strictEqual(
      result.valid,
      false,
      "PENDING missing resource_id/event_version must be invalid",
    );
  });
});
