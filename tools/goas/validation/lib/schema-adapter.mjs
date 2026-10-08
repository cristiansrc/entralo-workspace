// G-OAS schema adapter — plan §5.
//
// One Ajv engine for Draft 2020-12 (`ajv/dist/2020.js`) with `ajv-formats` in
// FULL mode. NO coercion, NO defaults, NO additional-property removal, formats
// asserted (`validateFormats: true`). `strict` remains `true` and the four
// derived strictness switches (`strictSchema`, `strictNumbers`, `strictTuples`,
// `strictRequired`) are pinned explicitly to `true` so a future change to the
// top-level `strict` value cannot silently downgrade them.
//
// `strictTypes` is the single deliberate exception: it is set to `"log"` so
// contract schemas that omit an explicit `type: "object"` on `if`/`then`
// branches (e.g. `events/integration-envelope.v1.schema.json`) still compile
// under `strict: true`. Ajv only reports those diagnostics; it never throws.
// The warnings are captured on the instance (`ajv.goasWarnings`) and forwarded
// to the underlying logger — they are NEVER silenced. This changes neither the
// schemas nor the validation semantics of any instance.
//
// Two source shapes are supported:
//   1. Pure JSON Schema 2020-12 resources with `$id` (the five event schemas):
//      registered in the local Ajv instance by their ORIGINAL `$id`. Relative
//      `$ref`s resolve between registered resources. `.invalid` hosts are
//      identifiers only — never fetched.
//   2. OpenAPI 3.1 components (`common.yaml#/components/schemas/<Name>`):
//      extracted with their closure and relocated to `$defs`, rewriting only
//      the `$ref`s to those components. Assertions are copied unchanged.
//
// Read-only. This module never writes to any path.

import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { parseStrictJson } from "./strict-json.mjs";
import { parseStrictYaml } from "./strict-yaml.mjs";
import { loadRefsRegistry, createOfflineResolver } from "./offline-refs.mjs";

export const AJV_OPTIONS = Object.freeze({
  strict: true,
  strictSchema: true,
  strictNumbers: true,
  strictTuples: true,
  strictRequired: true,
  // strictTypes diagnostics are downgraded to warnings (never thrown) so the
  // canonical contracts compile while every other strictness switch stays on.
  strictTypes: "log",
  allErrors: true,
  verbose: true,
  coerceTypes: false,
  useDefaults: false,
  removeAdditional: false,
  validateFormats: true,
});

/** L-01: document byte ceiling (plan §5 / run-profile limits). */
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

/** L-08: keys that mutate the prototype chain when assigned naively. */
const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function safeSet(target, key, value) {
  if (DANGEROUS_KEYS.has(key)) {
    Object.defineProperty(target, key, {
      value,
      enumerable: true,
      writable: true,
      configurable: true,
    });
    return;
  }
  target[key] = value;
}

/**
 * Install a logger that records warnings for evidence while still forwarding
 * them to the underlying logger. Warnings are never swallowed: whoever inspects
 * `ajv.goasWarnings` (or the engine's `warnings`) sees exactly what Ajv emitted,
 * and the default console sink keeps receiving them too.
 */
function attachWarningCapture(ajv) {
  const base = ajv.logger ?? console;
  const warnings = [];
  const forward = (level, args) => {
    if (base && typeof base[level] === "function") base[level](...args);
  };
  ajv.logger = {
    log: (...args) => forward("log", args),
    warn: (...args) => {
      warnings.push(args.map((arg) => String(arg)).join(" "));
      forward("warn", args);
    },
    error: (...args) => forward("error", args),
  };
  ajv.goasWarnings = warnings;
  return warnings;
}

export function createAjv() {
  const ajv = new Ajv2020({ ...AJV_OPTIONS });
  attachWarningCapture(ajv);
  addFormats(ajv, { mode: "full" });
  return ajv;
}

export function loadSourceDoc(absPath, { maxBytes = MAX_DOCUMENT_BYTES } = {}) {
  const stat = fs.statSync(absPath);
  if (stat.size > maxBytes) {
    throw new Error(`SIZE_EXCEEDED ${absPath}: ${stat.size} bytes > maxBytes ${maxBytes}`);
  }
  const text = fs.readFileSync(absPath, "utf8");
  if (path.extname(absPath).toLowerCase() === ".json") {
    const result = parseStrictJson(text, { source: absPath });
    if (!result.ok) {
      throw new Error(
        `PARSE_REJECTED ${absPath}: ${JSON.stringify(result.parseErrors)} dup=${JSON.stringify(result.duplicateKeys)}`,
      );
    }
    return result.value;
  }
  const result = parseStrictYaml(text, { source: absPath });
  if (!result.ok) {
    throw new Error(`PARSE_REJECTED ${absPath}: ${JSON.stringify(result.diagnostics)}`);
  }
  return result.value;
}

export function pointerToPath(pointer) {
  if (pointer === "" || pointer === "/") return [];
  if (!pointer.startsWith("/")) throw new Error(`REF_POINTER_INVALID: ${pointer}`);
  return pointer
    .split("/")
    .slice(1)
    .map((token) => token.replace(/~1/g, "/").replace(/~0/g, "~"));
}

export function getPointer(doc, pointer) {
  let node = doc;
  for (const token of pointerToPath(pointer)) {
    if (node === null || typeof node !== "object") return undefined;
    if (Array.isArray(node)) {
      node = node[Number(token)];
    } else {
      // L-08: never traverse inherited accessors such as `__proto__`.
      if (!Object.prototype.hasOwnProperty.call(node, token)) return undefined;
      node = node[token];
    }
  }
  return node;
}

function nameFromPointer(pointer) {
  const match = /\/(?:components\/schemas|\$defs)\/([^/]+)$/.exec(pointer);
  return match ? match[1] : undefined;
}

/**
 * Extract an OpenAPI component and its same-document closure into a standalone
 * JSON Schema with components relocated to `$defs`.
 */
export function materializeOpenApiComponent({ docPath, pointer, resolver }) {
  const docCache = new Map();
  const loadDoc = (absPath) => {
    if (!docCache.has(absPath)) docCache.set(absPath, loadSourceDoc(absPath));
    return docCache.get(absPath);
  };

  const rootDoc = loadDoc(docPath);
  const extracted = getPointer(rootDoc, pointer);
  if (extracted === undefined) {
    throw new Error(`REF_UNRESOLVED ${docPath}#${pointer}`);
  }

  const defs = new Map();
  const keyByTarget = new Map();
  const inProgress = new Set();
  const usedKeys = new Set();
  const origin = [];

  function keyFor(absPath, ptr, hint) {
    const targetId = `${absPath}#${ptr}`;
    if (keyByTarget.has(targetId)) return keyByTarget.get(targetId);
    let base = hint || path.basename(absPath).replace(/\.[^.]+$/, "");
    base = base.replace(/[^A-Za-z0-9_$]/g, "_") || "def";
    let key = base;
    let index = 1;
    while (usedKeys.has(key)) key = `${base}_${index++}`;
    usedKeys.add(key);
    keyByTarget.set(targetId, key);
    return key;
  }

  function ensureDef(absPath, ptr, hint) {
    const key = keyFor(absPath, ptr, hint);
    if (inProgress.has(key) || defs.has(key)) return key;
    inProgress.add(key);
    const doc = loadDoc(absPath);
    const node = ptr === "" ? doc : getPointer(doc, ptr);
    if (node === undefined) throw new Error(`REF_UNRESOLVED ${absPath}#${ptr}`);
    origin.push({ key, from: `${absPath}#${ptr}` });
    defs.set(key, transform(node, absPath));
    inProgress.delete(key);
    return key;
  }

  function dangerousPointer(ptr) {
    try {
      return pointerToPath(ptr).some((segment) => DANGEROUS_KEYS.has(segment));
    } catch {
      return false;
    }
  }

  function transform(node, fromAbsPath) {
    if (Array.isArray(node)) return node.map((item) => transform(item, fromAbsPath));
    if (node && typeof node === "object") {
      if (typeof node.$ref === "string") {
        const ref = node.$ref;
        // m3: an external (relative/absolute) `$ref` must be resolved through
        // the offline resolver; document-local `#/...` refs stay local.
        if (!ref.startsWith("#")) {
          if (!resolver || typeof resolver.resolveSchemaRef !== "function") {
            throw new Error(`REF_UNRESOLVED external ref ${ref} in ${fromAbsPath} (no resolver)`);
          }
          const resolved = resolver.resolveSchemaRef(ref, fromAbsPath);
          const ptr = resolved.pointer ?? "";
          const externalKey = ensureDef(resolved.absPath, ptr, nameFromPointer(ptr));
          const out = {};
          for (const [k, v] of Object.entries(node)) {
            if (k === "$ref") {
              safeSet(out, k, `#/$defs/${externalKey}`);
              continue;
            }
            safeSet(out, k, transform(v, fromAbsPath));
          }
          return out;
        }
        if (!ref.startsWith("#/components/schemas/") && !ref.startsWith("#/$defs/")) {
          throw new Error(`REF_UNRESOLVED non-schema ref ${ref} in ${fromAbsPath}`);
        }
        const ptr = ref.slice(1);
        // L-08: never traverse/materialise prototype-polluting keys; keep the
        // reference intact so a hostile `$defs.__proto__` cannot corrupt schemas.
        if (dangerousPointer(ptr)) {
          const blocked = {};
          for (const [k, v] of Object.entries(node)) {
            safeSet(blocked, k, transform(v, fromAbsPath));
          }
          return blocked;
        }
        const key = ensureDef(fromAbsPath, ptr, nameFromPointer(ptr));
        const out = {};
        for (const [k, v] of Object.entries(node)) {
          if (k === "$ref") {
            safeSet(out, k, `#/$defs/${key}`);
            continue;
          }
          safeSet(out, k, transform(v, fromAbsPath));
        }
        return out;
      }
      const out = {};
      for (const [k, v] of Object.entries(node)) safeSet(out, k, transform(v, fromAbsPath));
      return out;
    }
    return node;
  }

  const body = transform(extracted, docPath);
  const schema = { ...body };
  if (schema.$schema === undefined) {
    schema.$schema = "https://json-schema.org/draft/2020-12/schema";
  }
  if (defs.size > 0) {
    schema.$defs = { ...(schema.$defs ?? {}) };
    for (const [key, value] of defs) safeSet(schema.$defs, key, value);
  }
  return { schema, origin, sourcePointer: pointer, sourceDoc: docPath };
}

/**
 * Build the shared engine (one Ajv, one offline resolver, event schemas registered).
 */
export function createSchemaEngine({ snapshotRoot, registryPath }) {
  const registry = loadRefsRegistry(registryPath);
  const resolver = createOfflineResolver({ snapshotRoot, registry });
  const ajv = createAjv();

  for (const entry of registry.data.schemas ?? []) {
    if (!entry.register_in_ajv) continue;
    const absPath = resolver.absOf(entry.file, entry.file);
    const schema = loadSourceDoc(absPath);
    ajv.addSchema(schema, entry.$id);
  }

  function compileTarget(target) {
    const { absPath, pointer } = target;
    const isJsonSchema = absPath.endsWith(".schema.json");
    if (isJsonSchema && pointer === "") {
      const doc = loadSourceDoc(absPath);
      if (doc && typeof doc.$id === "string" && ajv.getSchema(doc.$id)) {
        return ajv.getSchema(doc.$id);
      }
      return ajv.compile(doc);
    }
    if (pointer.startsWith("/components/")) {
      const materialized = materializeOpenApiComponent({ docPath: absPath, pointer, resolver });
      const compiled = ajv.compile(materialized.schema);
      compiled.goasOrigin = materialized.origin;
      return compiled;
    }
    const doc = loadSourceDoc(absPath);
    const node = pointer === "" ? doc : getPointer(doc, pointer);
    if (node === undefined) throw new Error(`REF_UNRESOLVED ${absPath}#${pointer}`);
    return ajv.compile(node);
  }

  /** Resolve a `schema_ref` (as written in a fixture/matrix) and compile it. */
  function compileSchemaRef(refString, fromAbsPath) {
    resolver.assertNoNetwork(refString);
    const target = resolver.resolveSchemaRef(refString, fromAbsPath);
    return compileTarget(target);
  }

  return {
    ajv,
    registry,
    resolver,
    compileSchemaRef,
    compileTarget,
    options: { ...AJV_OPTIONS, formatsMode: "full" },
    // Evidence sink: every strictTypes warning Ajv emitted during compilation,
    // in order. Read-only snapshot so callers cannot mutate the accumulator.
    get warnings() {
      return [...(ajv.goasWarnings ?? [])];
    },
  };
}

/** Normalise Ajv errors to a stable, payload-free shape. */
export function normalizeErrors(compiled) {
  return (compiled.errors ?? []).map((error) => ({
    keyword: error.keyword,
    instancePath: error.instancePath,
    schemaPath: error.schemaPath,
    params: error.params,
    message: error.message,
  }));
}

/** Validate an instance and return a stable result. */
export function validateInstance(compiled, instance) {
  const valid = compiled(instance) === true;
  return { valid, errors: valid ? [] : normalizeErrors(compiled) };
}
