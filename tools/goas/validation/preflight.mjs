// G-OAS static/logic preflight — plan §16 / task requirements.
//
// Checks configs and adapters WITHOUT importing any installed package (that
// would execute package code). It uses ONLY Node builtins plus `node --check`
// for a syntax-only parse of each ESM adapter (which does not evaluate imports).
//
// It performs no network, no install, no scan, no Git and writes nothing.
// Exit 0 = all static checks passed; exit 1 = at least one failed.
//
// Run: node tools/goas/validation/preflight.mjs
//
// The check bodies are exported as a test seam (pack #51): importing this
// module for tests must NOT execute the CLI. The runner is guarded by
// `isMainModule()` below.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = path.join(HERE, "config");
const LIB_DIR = path.join(HERE, "lib");

const checks = [];
function check(name, fn) {
  try {
    const detail = fn();
    checks.push({ name, ok: true, detail: detail ?? null });
  } catch (error) {
    checks.push({ name, ok: false, error: String(error?.message ?? error) });
  }
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function readText(p) {
  return fs.readFileSync(p, "utf8");
}

/**
 * L-03 (preflight): reject duplicate object keys, matching the strict-json
 * policy. Builtin-only tokenizer — preflight must not import/execute package
 * code, so it cannot reuse lib/strict-json.mjs (jsonc-parser).
 */
export function parseJsonNoDuplicates(text, source) {
  let i = 0;
  const len = text.length;
  const fail = (message) => {
    throw new Error(`JSON_INVALID ${source}: ${message} at offset ${i}`);
  };
  const skipWs = () => {
    while (i < len && (text[i] === " " || text[i] === "\t" || text[i] === "\n" || text[i] === "\r")) {
      i += 1;
    }
  };
  const parseString = () => {
    if (text[i] !== '"') fail("expected string");
    i += 1;
    let value = "";
    while (i < len) {
      const ch = text[i];
      if (ch === "\\") {
        const esc = text[i + 1];
        if (esc === undefined) fail("bad escape");
        if (esc === "u") {
          const hex = text.slice(i + 2, i + 6);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) fail("bad unicode escape");
          value += String.fromCharCode(parseInt(hex, 16));
          i += 6;
          continue;
        }
        const map = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" };
        value += map[esc] ?? esc;
        i += 2;
        continue;
      }
      if (ch === '"') {
        i += 1;
        return value;
      }
      value += ch;
      i += 1;
    }
    return fail("unterminated string");
  };
  const parseObject = (path) => {
    i += 1; // {
    skipWs();
    const keys = new Set();
    if (text[i] === "}") {
      i += 1;
      return;
    }
    for (;;) {
      skipWs();
      const key = parseString();
      if (keys.has(key)) throw new Error(`DUPLICATE_KEYS ${source}: ${path.concat(key).join("/")}`);
      keys.add(key);
      skipWs();
      if (text[i] !== ":") fail("expected ':'");
      i += 1;
      parseValue(path.concat(key));
      skipWs();
      if (text[i] === ",") {
        i += 1;
        continue;
      }
      if (text[i] === "}") {
        i += 1;
        return;
      }
      fail("expected ',' or '}'");
    }
  };
  const parseArray = (path) => {
    i += 1; // [
    skipWs();
    if (text[i] === "]") {
      i += 1;
      return;
    }
    let index = 0;
    for (;;) {
      parseValue(path.concat(index));
      index += 1;
      skipWs();
      if (text[i] === ",") {
        i += 1;
        continue;
      }
      if (text[i] === "]") {
        i += 1;
        return;
      }
      fail("expected ',' or ']'");
    }
  };
  const parseValue = (path) => {
    skipWs();
    const ch = text[i];
    if (ch === "{") return parseObject(path);
    if (ch === "[") return parseArray(path);
    if (ch === '"') {
      parseString();
      return;
    }
    const match = /^(?:-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/.exec(text.slice(i));
    if (!match) fail("invalid value");
    i += match[0].length;
  };

  skipWs();
  parseValue([]);
  skipWs();
  if (i !== len) fail("trailing content");
  return JSON.parse(text);
}

function readJson(p) {
  return parseJsonNoDuplicates(readText(p), p);
}

// --- Redocly raw/disposed (logic regex; no yaml package) ---------------------
// m5: quote-aware comment stripping so a '#' inside a quoted scalar survives.
export function stripYamlComments(text) {
  return text
    .split("\n")
    .map((line) => {
      let inSingle = false;
      let inDouble = false;
      for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        if (inDouble) {
          if (ch === "\\") {
            i += 1;
            continue;
          }
          if (ch === '"') inDouble = false;
          continue;
        }
        if (inSingle) {
          if (ch === "'") {
            if (line[i + 1] === "'") {
              i += 1;
              continue;
            }
            inSingle = false;
          }
          continue;
        }
        if (ch === '"') {
          inDouble = true;
          continue;
        }
        if (ch === "'") {
          inSingle = true;
          continue;
        }
        if (ch === "#" && (i === 0 || /\s/.test(line[i - 1]))) {
          return line.slice(0, i).replace(/\s+$/, "");
        }
      }
      return line;
    })
    .join("\n");
}

// --- adapter sources: no network primitives, no writes to canonicals ---------
// m4/L-04 / SR-05: declare this as a best-effort TEXTUAL HEURISTIC (not a
// proof). It covers static and dynamic imports/calls of network modules,
// including node:dgram (UDP) and node:undici, AND the `child_process` escape
// hatch (spawning `curl`/`wget`/`nc`/`ssh`/`scp`). Residual: a binary invoked
// through an alias or a relative path not matching the CLI name list is not
// caught; the heuristic is documented, not a guarantee.
const NETWORK_MODULES = "(?:node:)?(?:http|https|http2|net|tls|dns|dgram|undici)";
const NETWORK_CLI = "curl|wget|nc|ncat|netcat|ssh|scp|sftp|telnet|ftp";
export const NETWORK_RE = new RegExp(
  `(?:from\\s+["']${NETWORK_MODULES}["'])` +
    `|(?:\\brequire\\(\\s*["']${NETWORK_MODULES}["']\\s*\\))` +
    `|(?:\\bimport\\(\\s*["']${NETWORK_MODULES}["']\\s*\\))` +
    `|(?:\\bfetch\\s*\\()` +
    `|(?:\\baxios\\b)` +
    `|(?:\\bgot\\s*\\()` +
    // SR-05: any child_process usage (import/require/destructure or namespace).
    `|(?:\\bchild_process\\b)` +
    // SR-05: spawn/exec family invoking a network CLI by name (the CLI token may
    // be followed by a quote or by arguments inside the same string, e.g. `"nc -l"`).
    `|(?:\\b(?:spawn|spawnSync|exec|execSync|execFile|execFileSync)\\s*\\(\\s*["'](?:${NETWORK_CLI})\\b)`,
  "i",
);

// m2: the write/canonical heuristics are exported as a test seam so the real
// behaviour is asserted once (no duplicated logic in the test).
export const WRITE_RE = /(writeFileSync|appendFileSync|createWriteStream|rmSync|unlinkSync|renameSync|copyFileSync)\s*\(/;
export const CANONICAL_PATH_RE =
  /docs[\\/]specs|increments[\\/]entralo-v1-executable-specs|canonical(?:Base|Root|Dir|Directory|Path|Target|File|Name)/i;

/** True only when this module is the process entrypoint (`node preflight.mjs`). */
function isMainModule() {
  const entry = process.argv[1];
  if (typeof entry !== "string" || entry.length === 0) return false;
  try {
    return import.meta.url === pathToFileURL(fs.realpathSync(entry)).href;
  } catch {
    return import.meta.url === pathToFileURL(entry).href;
  }
}

function runPreflight() {
  // --- config presence -------------------------------------------------------
  const requiredConfigs = [
    "redocly.raw.yaml",
    "redocly.disposed.yaml",
    ".redocly.lint-ignore.yaml",
    "run-profile.json",
    "generation-profile.json",
    "refs-registry.json",
    "fixtures.manifest.json",
  ];
  check("config files exist", () => {
    const missing = requiredConfigs.filter((f) => !fs.existsSync(path.join(CONFIG_DIR, f)));
    assert(missing.length === 0, `missing: ${missing.join(", ")}`);
    return { count: requiredConfigs.length };
  });

  // --- JSON configs parse (builtin JSON only) --------------------------------
  const jsonNames = ["run-profile.json", "generation-profile.json", "refs-registry.json", "fixtures.manifest.json"];
  check("JSON configs parse", () => {
    const parsed = {};
    for (const name of jsonNames) parsed[name] = readJson(path.join(CONFIG_DIR, name));
    return Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, typeof v]));
  });

  check("redocly raw/disposed baseline", () => {
    const raw = stripYamlComments(readText(path.join(CONFIG_DIR, "redocly.raw.yaml")));
    const disposed = stripYamlComments(readText(path.join(CONFIG_DIR, "redocly.disposed.yaml")));
    assert(/extends:\s*\n\s*-\s*recommended/.test(raw), "raw must extend recommended");
    assert(/extends:\s*\n\s*-\s*recommended/.test(disposed), "disposed must extend recommended");
    assert(!/\boff\b/.test(raw) && !/\boff\b/.test(disposed), "no rule may be turned off");
    assert(!/\*/.test(raw) && !/\*/.test(disposed), "no wildcard allowed");
    return { raw: "ok", disposed: "ok" };
  });

  // --- ignore file: exactly ten approved tuples ------------------------------
  const APPROVED = new Set([
    "api/admin-bff.yaml|info-license|#/info",
    "api/admin-bff.yaml|operation-2xx-response|#/paths/~1v1~1auth~1callback/get/responses",
    "api/buyer-bff.yaml|info-license|#/info",
    "api/buyer-bff.yaml|operation-2xx-response|#/paths/~1v1~1auth~1callback/get/responses",
    "api/catalog.yaml|info-license|#/info",
    "api/common.yaml|info-license|#/info",
    "api/identity.yaml|info-license|#/info",
    "api/payments.yaml|info-license|#/info",
    "api/purchases.yaml|info-license|#/info",
    "api/ticketing.yaml|info-license|#/info",
  ]);
  check(".redocly.lint-ignore.yaml exactly ten tuples", () => {
    const text = readText(path.join(CONFIG_DIR, ".redocly.lint-ignore.yaml"));
    const lines = text.split("\n");
    const tuples = [];
    let currentFile = null;
    let currentRule = null;
    for (const line of lines) {
      const fileMatch = /^(\S.*\.yaml):\s*$/.exec(line);
      if (fileMatch) {
        currentFile = fileMatch[1];
        currentRule = null;
        continue;
      }
      const ruleMatch = /^\s{2}([A-Za-z0-9-]+):\s*$/.exec(line);
      if (ruleMatch) {
        currentRule = ruleMatch[1];
        continue;
      }
      const pointerMatch = /^\s{4}-\s*"(#\/[^"]*)"\s*$/.exec(line);
      if (pointerMatch) {
        assert(currentFile && currentRule, `pointer without file/rule: ${line}`);
        tuples.push(`${currentFile}|${currentRule}|${pointerMatch[1]}`);
      }
    }
    assert(tuples.length === 10, `expected 10 tuples, found ${tuples.length}`);
    const unapproved = tuples.filter((t) => !APPROVED.has(t));
    assert(unapproved.length === 0, `unapproved tuples: ${unapproved.join(" ; ")}`);
    const missing = [...APPROVED].filter((t) => !tuples.includes(t));
    assert(missing.length === 0, `missing tuples: ${missing.join(" ; ")}`);
    return { tuples: tuples.length };
  });

  // --- run profile -----------------------------------------------------------
  check("run profile guard/timeouts/signals", () => {
    const rp = readJson(path.join(CONFIG_DIR, "run-profile.json"));
    assert(rp.evidence_root === "/tmp/opencode/entralo-v1-executable-specs", "evidence root");
    assert(rp.write_guard.refuse_if_destination_exists === true, "refuse existing destination");
    assert(rp.write_guard.inputs_read_only === true, "inputs read-only");
    assert(rp.retries.attempts_per_command === 1 && rp.retries.automatic_retries === false, "no retries");
    assert(rp.timeouts_ms.run_total === 900000, "run_total must be 900000");
    assert(rp.timeouts_ms.generator_validate_per_root === 120000, "validate 120s");
    assert(rp.timeouts_ms.generator_generate_per_root === 120000, "generate 120s");
    assert(rp.limits.max_bytes_per_document === 10485760, "10 MiB limit");
    assert(rp.limits.max_yaml_depth === 100, "100 levels");
    assert(rp.limits.max_alias_expansions === 256, "256 alias expansions");
    assert(Array.isArray(rp.no_egress.unshare_args) && rp.no_egress.unshare_args.includes("--net"), "unshare --net");
    return { signals: rp.signals.length };
  });

  // --- strict-yaml limits mirror run-profile (single source of truth) --------
  // The parser is a pure module and mirrors the declared operational limits;
  // this guard keeps parser and run-profile coherent (no silent drift).
  check("strict-yaml limits mirror run-profile", () => {
    const rp = readJson(path.join(CONFIG_DIR, "run-profile.json"));
    const text = readText(path.join(LIB_DIR, "strict-yaml.mjs"));
    const alias = text.match(/maxAliasCount:\s*(\d+)/);
    const depth = text.match(/maxDepth:\s*(\d+)/);
    const bytes = text.match(/maxBytes:\s*([0-9]+)\s*\*\s*1024\s*\*\s*1024/);
    assert(alias && Number(alias[1]) === rp.limits.max_alias_expansions, "maxAliasCount must mirror run-profile");
    assert(depth && Number(depth[1]) === rp.limits.max_yaml_depth, "maxDepth must mirror run-profile");
    assert(
      bytes && Number(bytes[1]) * 1024 * 1024 === rp.limits.max_bytes_per_document,
      "maxBytes must mirror run-profile",
    );
    return { alias: Number(alias[1]), depth: Number(depth[1]), bytes: Number(bytes[1]) * 1024 * 1024 };
  });

  // --- generation profile ----------------------------------------------------
  const EXPECTED_ROOTS = {
    "admin-bff": "adminbff",
    "buyer-bff": "buyerbff",
    catalog: "catalog",
    identity: "identity",
    payments: "payments",
    purchases: "purchases",
    ticketing: "ticketing",
  };
  check("generation profile exact", () => {
    const gp = readJson(path.join(CONFIG_DIR, "generation-profile.json"));
    assert(gp.generator.generatorName === "spring", "generatorName=spring");
    assert(gp.generator.library === "spring-boot", "library=spring-boot");
    assert(gp.additional_properties.ordered_pairs.length === 12, "12 additional properties");
    const optionKeys = gp.additional_properties.ordered_pairs.map(([k]) => k.toLowerCase());
    assert(!optionKeys.includes("supportingfiles"), "supportingFiles must not be an option");
    assert(!/supportingFiles/i.test(gp.additional_properties.serialized), "serialized options must not contain supportingFiles");
    assert(gp.global_property.value === "apis,models,apiDocs=false,modelDocs=false,apiTests=false,modelTests=false", "global property literal");
    assert(gp.global_property.flag === "--global-property", "--global-property flag");
    assert(gp.supporting_files.must_not_set === true, "supportingFiles must_not_set");
    assert(gp.roots.length === 7, "7 roots");
    assert(gp.common.gets_generate === false && gp.common.gets_namespace === false, "common excluded");
    for (const root of gp.roots) {
      assert(EXPECTED_ROOTS[root.slug] === root.segment, `segment mismatch for ${root.slug}`);
      assert(!root.segment.includes("-"), `segment has hyphen: ${root.segment}`);
      const suffixByField = { apiPackage: "api", modelPackage: "model", invokerPackage: "invoker" };
      for (const [field, suffix] of Object.entries(suffixByField)) {
        const re = new RegExp(`^com\\.entralo\\.goas\\.validation\\.${root.segment}\\.${suffix}$`);
        assert(re.test(root[field]), `namespace mismatch: ${root[field]}`);
      }
      assert(typeof root.input_bundle === "string" && root.input_bundle.includes("${run}/bundles/"), `bundle pattern ${root.slug}`);
      assert(typeof root.output_dir === "string" && root.output_dir.includes("${run}/generate/"), `output pattern ${root.slug}`);
    }
    assert(gp.output.root === "/tmp/opencode/entralo-v1-executable-specs/<run_id>", "output outside repo");
    assert(gp.java.major === 25, "Java 25 only");
    assert(gp.java.forbidden.some((x) => /26/.test(x)), "Java 26 forbidden");
    return { roots: gp.roots.length, options: 12 };
  });

  // --- JBR custody metadata (B-1 / security N1) ------------------------------
  // The verified official JBR 25.0.3 provenance/custody must be present and
  // well-formed; preflight validates the metadata, it does not download or
  // re-derive any hash.
  check("generation profile JBR custody metadata", () => {
    const gp = readJson(path.join(CONFIG_DIR, "generation-profile.json"));
    const java = gp.java ?? {};
    assert(
      /^[0-9a-f]{64}$/.test(java.sha256_custody ?? ""),
      "java.sha256_custody must be a lowercase SHA-256",
    );
    assert(
      typeof java.tarball_url === "string" &&
        /jbr-25\.0\.3-linux-x64-b508\.16\.tar\.gz$/.test(java.tarball_url),
      "java.tarball_url must point to the official JBR 25.0.3 b508.16 tarball",
    );
    assert(
      typeof java.tarball_checksum_url === "string" &&
        /jbr-25\.0\.3-linux-x64-b508\.16\.tar\.gz\.checksum$/.test(java.tarball_checksum_url),
      "java.tarball_checksum_url must point to the official checksum sidecar",
    );
    assert(/^[0-9a-f]{128}$/.test(java.tarball_sha512 ?? ""), "java.tarball_sha512 must be a lowercase SHA-512");
    assert(
      typeof java.implementor_version === "string" && /JBR-25\.0\.3.*508\.16/.test(java.implementor_version),
      "java.implementor_version must identify JBR 25.0.3 b508.16",
    );
    assert(
      typeof java.runtime_version === "string" && /25\.0\.3.*b508\.16/.test(java.runtime_version),
      "java.runtime_version must identify 25.0.3 b508.16",
    );
    assert(/^[0-9a-f]{40}$/.test(java.source_commit ?? ""), "java.source_commit must be a 40-hex commit");
    return { custody: "sha256", tarball: "sha512" };
  });

  // --- refs registry ---------------------------------------------------------
  check("offline refs registry", () => {
    const rr = readJson(path.join(CONFIG_DIR, "refs-registry.json"));
    assert(rr.network_policy === "never", "network_policy must be never");
    assert((rr.schemas ?? []).length === 5, "five event schemas");
    for (const entry of rr.schemas) {
      assert(entry.$id.includes(".invalid"), `expected .invalid $id: ${entry.$id}`);
      assert(entry.register_in_ajv === true, `register_in_ajv: ${entry.file}`);
      assert(entry.file.startsWith("events/"), `events path: ${entry.file}`);
    }
    return { schemas: rr.schemas.length };
  });

  // --- fixtures manifest -----------------------------------------------------
  check("fixtures manifest counts", () => {
    const fm = readJson(path.join(CONFIG_DIR, "fixtures.manifest.json"));
    assert(fm.matrix.expected_case_count === 27, "matrix 27");
    assert(fm.mercado_pago.files.length === 13, "MP 13");
    const valid = fm.mercado_pago.files.filter((f) => f.expected_valid).length;
    const invalid = fm.mercado_pago.files.filter((f) => !f.expected_valid).length;
    assert(valid === 4 && invalid === 9, `MP polarity 4/9, got ${valid}/${invalid}`);
    assert(fm.mercado_pago.expected_valid === 4 && fm.mercado_pago.expected_invalid === 9, "declared MP polarity");
    assert(fm.format_controls.matrix_case_ids.length === 5, "5 matrix format controls");
    assert(fm.format_controls.mercado_pago_files.length === 2, "2 MP format controls");
    return { matrix: 27, mp: 13 };
  });

  check("adapters contain no network primitives", () => {
    const files = fs.readdirSync(LIB_DIR).filter((f) => f.endsWith(".mjs"));
    // SR-05: `subprocess.mjs` is the single approved spawn wrapper. It imports
    // `node:child_process` only to execute allowlisted absolute binaries
    // (`/usr/bin/timeout`, `/usr/bin/unshare`, `/usr/bin/env`) and never a
    // network CLI; it is exempt from the import heuristic. The exported
    // NETWORK_RE still flags child_process/network CLIs elsewhere.
    const APPROVED_SPAWN_WRAPPERS = new Set(["subprocess.mjs"]);
    const offenders = [];
    for (const file of files) {
      if (APPROVED_SPAWN_WRAPPERS.has(file)) continue;
      const text = readText(path.join(LIB_DIR, file));
      if (NETWORK_RE.test(text)) offenders.push(file);
    }
    assert(offenders.length === 0, `network primitives in: ${offenders.join(", ")}`);
    return { scanned: files.length, exempted: APPROVED_SPAWN_WRAPPERS.size };
  });

  check("canonical sources are never opened for write", () => {
    const files = fs.readdirSync(LIB_DIR).filter((f) => f.endsWith(".mjs"));
    // m2: best-effort heuristic; also flag config-derived canonical path
    // identifiers (e.g. `config.canonicalBase`) in addition to literal paths.
    const offenders = [];
    for (const file of files) {
      const text = readText(path.join(LIB_DIR, file));
      if (WRITE_RE.test(text) && CANONICAL_PATH_RE.test(text)) offenders.push(file);
    }
    assert(offenders.length === 0, `possible canonical writes in: ${offenders.join(", ")}`);
    return { scanned: files.length };
  });

  // --- syntax-only check of every adapter (node --check; imports NOT executed)
  check("adapters pass node --check (syntax only)", () => {
    const files = [
      ...fs.readdirSync(LIB_DIR).filter((f) => f.endsWith(".mjs")).map((f) => path.join(LIB_DIR, f)),
      path.join(HERE, "preflight.mjs"),
    ];
    const failures = [];
    for (const file of files) {
      const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
      if (result.status !== 0) failures.push({ file, stderr: (result.stderr || "").split("\n")[0] });
    }
    assert(failures.length === 0, `syntax failures: ${JSON.stringify(failures)}`);
    return { checked: files.length };
  });

  // --- report ----------------------------------------------------------------
  const failed = checks.filter((c) => !c.ok);
  const report = {
    tool: "g-oas-static-preflight",
    mode: "static-logic-only",
    imported_packages: [],
    executed_tools: ["node --check (syntax only)"],
    checked_at_path: HERE,
    summary: { total: checks.length, passed: checks.length - failed.length, failed: failed.length },
    checks,
  };
  process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  process.exit(failed.length === 0 ? 0 : 1);
}

if (isMainModule()) {
  runPreflight();
}
