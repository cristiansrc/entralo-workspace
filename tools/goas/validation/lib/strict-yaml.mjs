// G-OAS strict YAML reader — plan §5.
//
// Parses YAML with the already-installed `yaml` package and rejects, BEFORE any
// lint/consume step:
//   - duplicate mapping keys (uniqueKeys),
//   - executable / unknown-dangerous tags,
//   - documents over the byte limit (10 MiB),
//   - nesting deeper than 100 levels,
//   - alias expansion over 256 (resource-exhaustion guard).
//
// Read-only. This module never writes to any path.

import { parseDocument, LineCounter, isMap, isSeq, isPair } from "yaml";

const DEFAULTS = Object.freeze({
  maxBytes: 10 * 1024 * 1024, // plan §5: 10 MiB/document
  maxDepth: 100, // plan §5: 100 levels
  // plan §5 operational limit, raised 100 -> 256: legitimate canonical sources
  // admin-bff (178), buyer-bff (160) and purchases (178) alias expansions
  // exceed the previous cap while remaining far below the synthetic DoS case
  // (257 refs). Single source of truth: config/run-profile.json
  // `limits.max_alias_expansions` (preflight asserts the declared value).
  maxAliasCount: 256,
});

// Tags that could execute code in some YAML stacks. The `yaml` package does not
// execute them, but G-OAS rejects them explicitly instead of relying on that.
// m1: every language alternative is anchored (`!`/`:`/`^`) so `!notpython/…`
// is not falsely rejected and `!js/…`/`!python/…` are caught.
const EXECUTABLE_TAG_RE = /(?:^|[!:])(?:js|python|ruby|perl|php|java|bash|sh)\//i;

function walk(node, visit) {
  if (!node) return;
  visit(node);
  if (isMap(node)) {
    for (const item of node.items) {
      walk(item.key, visit);
      walk(item.value, visit);
    }
  } else if (isSeq(node)) {
    for (const item of node.items) walk(item, visit);
  } else if (isPair(node)) {
    walk(node.key, visit);
    walk(node.value, visit);
  }
}

// SR-02/L-09: depth is measured ITERATIVELY (explicit stack) so a hostile,
// deeply-nested document cannot exhaust the call stack before the depth gate
// runs. This mirrors strict-json.mjs `measureDepth`.
function measureDepth(root) {
  let deepest = 0;
  const stack = [{ node: root, depth: 0 }];
  while (stack.length > 0) {
    const { node, depth } = stack.pop();
    if (!node) continue;
    if (isMap(node)) {
      const next = depth + 1;
      if (next > deepest) deepest = next;
      for (const item of node.items) {
        stack.push({ node: item.key, depth: next });
        stack.push({ node: item.value, depth: next });
      }
    } else if (isSeq(node)) {
      const next = depth + 1;
      if (next > deepest) deepest = next;
      for (const item of node.items) stack.push({ node: item, depth: next });
    } else if (isPair(node)) {
      stack.push({ node: node.key, depth });
      stack.push({ node: node.value, depth });
    }
  }
  return deepest;
}

/**
 * Parse YAML in strict mode.
 * @returns {{source:string, ok:boolean, bytes:number, depth:number,
 *           value:any|undefined, diagnostics:Array<object>}}
 */
export function parseStrictYaml(text, options = {}) {
  const source = options.source ?? "<yaml>";
  const maxBytes = options.maxBytes ?? DEFAULTS.maxBytes;
  const maxDepthLimit = options.maxDepth ?? DEFAULTS.maxDepth;
  const maxAliasCount = options.maxAliasCount ?? DEFAULTS.maxAliasCount;

  const diagnostics = [];
  const bytes = Buffer.byteLength(text, "utf8");

  if (bytes > maxBytes) {
    diagnostics.push({
      code: "SIZE_EXCEEDED",
      severity: "error",
      message: `${bytes} bytes > maxBytes ${maxBytes}`,
    });
    return { source, ok: false, bytes, depth: 0, value: undefined, diagnostics };
  }

  const lineCounter = new LineCounter();
  const doc = parseDocument(text, {
    uniqueKeys: true,
    strict: true,
    prettyErrors: true,
    lineCounter,
    // schema defaults to 'core' (YAML 1.2); merge keys are disabled by default for 1.2.
  });

  for (const error of doc.errors) {
    diagnostics.push({
      code: error.code ?? "YAML_ERROR",
      severity: "error",
      message: error.message,
      line: error.linePos?.[0]?.line,
      col: error.linePos?.[0]?.col,
    });
  }
  for (const warning of doc.warnings) {
    diagnostics.push({
      code: warning.code ?? "YAML_WARNING",
      severity: "warning",
      message: warning.message,
      line: warning.linePos?.[0]?.line,
    });
  }

  // SR-02/L-09: gate on depth BEFORE the recursive tag walk. A hostile payload
  // that is both deep and carries an executable tag must be rejected with a
  // controlled DEPTH_EXCEEDED, never a RangeError from the recursive walk.
  const depth = measureDepth(doc.contents);
  const depthExceeded = depth > maxDepthLimit;
  if (depthExceeded) {
    diagnostics.push({
      code: "DEPTH_EXCEEDED",
      severity: "error",
      message: `depth ${depth} > maxDepth ${maxDepthLimit}`,
    });
  }

  if (!depthExceeded) {
    const badTags = [];
    walk(doc.contents, (node) => {
      if (typeof node.tag === "string" && EXECUTABLE_TAG_RE.test(node.tag)) {
        badTags.push(node.tag);
      }
    });
    for (const tag of new Set(badTags)) {
      diagnostics.push({
        code: "EXECUTABLE_TAG",
        severity: "error",
        message: `tag not allowed: ${tag}`,
      });
    }
  }

  let value;
  if (!diagnostics.some((d) => d.severity === "error")) {
    try {
      value = doc.toJS({ maxAliasCount });
    } catch (error) {
      diagnostics.push({
        code: "ALIAS_LIMIT",
        severity: "error",
        message: String(error?.message ?? error),
      });
    }
  }

  const ok = !diagnostics.some((d) => d.severity === "error");
  return { source, ok, bytes, depth, value, diagnostics };
}
