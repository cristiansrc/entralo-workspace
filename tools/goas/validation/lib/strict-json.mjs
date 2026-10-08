// G-OAS strict JSON reader — plan §5 / api-lint-policy §Matriz documental.
//
// Rejects duplicate keys PER OBJECT *before* materialisation, and rejects
// comments, trailing commas, extra content and any parse error, using the
// already-installed `jsonc-parser`. `JSON.parse` alone does not satisfy this.
//
// Read-only. This module never writes to any path.

import { parseTree, getNodeValue, printParseErrorCode } from "jsonc-parser";

const STRICT_OPTIONS = Object.freeze({
  disallowComments: true,
  allowTrailingComma: false,
  allowEmptyContent: false,
});

/** L-09: mirror run-profile `max_yaml_depth` (100) for JSON as well. */
const DEFAULT_MAX_DEPTH = 100;

/**
 * L-09: iterative depth measurement so a hostile deeply-nested payload cannot
 * exhaust the stack through the recursive duplicate-key traversal.
 */
function measureDepth(root) {
  let deepest = 0;
  const stack = [{ node: root, depth: 0, kind: null }];
  while (stack.length > 0) {
    const { node, depth } = stack.pop();
    if (!node) continue;
    if (node.type === "object") {
      if (depth + 1 > deepest) deepest = depth + 1;
      for (const child of node.children ?? []) {
        if (child.type !== "property") continue;
        stack.push({ node: child.children?.[1], depth: depth + 1 });
      }
    } else if (node.type === "array") {
      if (depth + 1 > deepest) deepest = depth + 1;
      for (const child of node.children ?? []) {
        stack.push({ node: child, depth: depth + 1 });
      }
    }
  }
  return deepest;
}

/**
 * Collect duplicate object keys with their JSON path.
 * A repeated name in *different* objects is not a duplicate.
 */
function collectDuplicateKeys(node, path, out) {
  if (!node) return;
  if (node.type === "object") {
    const seen = new Set();
    for (const child of node.children ?? []) {
      if (child.type !== "property") continue;
      const nameNode = child.children?.[0];
      const valueNode = child.children?.[1];
      const name = nameNode?.value;
      if (name !== undefined) {
        if (seen.has(name)) {
          out.push({ path: [...path, name], name, offset: nameNode.offset });
        } else {
          seen.add(name);
        }
      }
      collectDuplicateKeys(valueNode, [...path, name], out);
    }
    return;
  }
  if (node.type === "array") {
    (node.children ?? []).forEach((child, index) =>
      collectDuplicateKeys(child, [...path, index], out),
    );
  }
}

/**
 * Parse JSON in strict mode.
 * @returns {{source:string, ok:boolean, value:any|undefined,
 *           parseErrors:Array<{code:string,offset:number,length:number}>,
 *           duplicateKeys:Array<{path:Array<string|number>,name:string,offset:number}>}}
 */
export function parseStrictJson(text, { source = "<json>", maxDepth = DEFAULT_MAX_DEPTH } = {}) {
  const errors = [];
  const tree = parseTree(text, errors, STRICT_OPTIONS);

  const parseErrors = errors.map((error) => ({
    code: printParseErrorCode(error.error),
    offset: error.offset,
    length: error.length,
  }));

  const duplicateKeys = [];
  let depth = 0;
  if (tree) {
    depth = measureDepth(tree);
    if (depth > maxDepth) {
      // L-09: fail closed BEFORE the recursive duplicate-key traversal.
      parseErrors.push({
        code: "DEPTH_EXCEEDED",
        offset: 0,
        length: 0,
        message: `depth ${depth} > maxDepth ${maxDepth}`,
      });
    } else {
      collectDuplicateKeys(tree, [], duplicateKeys);
    }
  }

  const ok = parseErrors.length === 0 && duplicateKeys.length === 0;
  let value;
  if (tree && ok) value = getNodeValue(tree);

  return { source, ok, value, parseErrors, duplicateKeys };
}
