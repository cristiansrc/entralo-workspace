// G-OAS offline reference registry — plan §5.
//
// Resolves JSON Schema / OpenAPI references against local snapshot files only.
// Absolute URIs (including `$id` values on `.invalid` hosts) are DOCUMENTARY
// identifiers: they are looked up in the local registry and NEVER fetched.
// An absolute reference that is not registered is an unresolved reference
// (blocker), not a network request.
//
// Read-only. This module never writes to any path.

import fs from "node:fs";
import path from "node:path";

import { parseStrictJson } from "./strict-json.mjs";

/** Nearest existing ancestor of `target` (bounded walk to the fs root). */
function nearestExisting(target) {
  let current = path.resolve(target);
  for (let i = 0; i < 4096; i += 1) {
    if (fs.existsSync(current)) return current;
    const parent = path.dirname(current);
    if (parent === current) return current;
    current = parent;
  }
  return path.parse(path.resolve(target)).root;
}

/**
 * Throw unless `abs` realpath-resolves inside `root` (L-02: a symlink inside
 * the snapshot that points outside must not pass).
 */
export function assertUnderRoot(abs, root, label = "path") {
  const realRoot = fs.realpathSync(nearestExisting(root));
  const realTarget = fs.realpathSync(nearestExisting(abs));
  const rel = path.relative(realRoot, realTarget);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`PATH_ESCAPE ${label}: ${abs} is outside ${root}`);
  }
}

const URI_SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

export function loadRefsRegistry(registryPath) {
  const text = fs.readFileSync(registryPath, "utf8");
  const parsed = parseStrictJson(text, { source: registryPath });
  if (!parsed.ok) {
    const detail =
      parsed.duplicateKeys.length > 0
        ? `DUPLICATE_KEYS ${JSON.stringify(parsed.duplicateKeys)}`
        : `PARSE_REJECTED ${JSON.stringify(parsed.parseErrors)}`;
    throw new Error(`${detail} in ${registryPath}`);
  }
  const data = parsed.value;
  const byId = new Map();
  const byFile = new Map();
  for (const entry of data.schemas ?? []) {
    byId.set(entry.$id, entry);
    byFile.set(entry.file, entry);
  }
  return { data, byId, byFile, networkPolicy: data.network_policy ?? "never" };
}

export function createOfflineResolver({ snapshotRoot, registry }) {
  const root = path.resolve(snapshotRoot);
  if ((registry.networkPolicy ?? "never") !== "never") {
    throw new Error("OFFLINE_REGISTRY_INVALID: network_policy must be 'never'");
  }

  function absOf(relativeFilePath, label) {
    const abs = path.resolve(root, relativeFilePath);
    assertUnderRoot(abs, root, label ?? relativeFilePath);
    return abs;
  }

  /**
   * Resolve a reference string as found in a document.
   * @returns {{absPath:string, pointer:string, entry:object|null, identifier:string|null}}
   */
  function resolveSchemaRef(ref, fromAbsPath) {
    if (typeof ref !== "string" || ref.length === 0) {
      throw new Error(`REF_UNRESOLVED: empty reference in ${fromAbsPath}`);
    }
    if (ref.startsWith("#")) {
      return { absPath: fromAbsPath, pointer: ref.slice(1), entry: null, identifier: null };
    }

    const hashIndex = ref.indexOf("#");
    const filePart = hashIndex === -1 ? ref : ref.slice(0, hashIndex);
    const pointer = hashIndex === -1 ? "" : ref.slice(hashIndex + 1);

    if (URI_SCHEME_RE.test(filePart)) {
      // Absolute URI: must be a registered local resource. Never network.
      const entry = registry.byId.get(filePart) ?? null;
      if (!entry) {
        const host = safeHost(filePart);
        const suffix = host.endsWith(".invalid") ? " (.invalid is identifier-only)" : "";
        throw new Error(`REF_UNRESOLVED or forbidden external ref ${ref}${suffix}`);
      }
      return { absPath: absOf(entry.file, ref), pointer, entry, identifier: filePart };
    }

    // Relative file reference resolved against the referencing document's base.
    const abs = path.resolve(path.dirname(fromAbsPath), filePart);
    assertUnderRoot(abs, root, ref);
    return { absPath: abs, pointer, entry: null, identifier: null };
  }

  function assertNoNetwork(ref) {
    if (typeof ref !== "string") return;
    const hashIndex = ref.indexOf("#");
    const filePart = hashIndex === -1 ? ref : ref.slice(0, hashIndex);
    if (URI_SCHEME_RE.test(filePart) && !registry.byId.has(filePart)) {
      throw new Error(`NETWORK_FORBIDDEN: unresolved absolute ref ${ref}`);
    }
  }

  return { root, resolveSchemaRef, assertNoNetwork, absOf };
}

function safeHost(uri) {
  try {
    return new URL(uri).hostname;
  } catch {
    return "";
  }
}
