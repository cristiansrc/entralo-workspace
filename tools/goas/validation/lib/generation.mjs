// G-OAS generation command builder — plan §16.2/§16.3/§16.4.
//
// Builds the FOURTEEN documented argv arrays (7 validate + 7 generate) exactly
// as specified: JBR 25 explicit by absolute path, `unshare --net` no-egress,
// `env -i` with HOME/tmp under the run dir, the twelve additional properties,
// the literal `--global-property`, and NO `supportingFiles` token.
//
// This module BUILDS commands; it does NOT execute them and does not write
// anything. `generate` runs only if the same root's `validate` exited 0.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PER_ROOT_TIMEOUT_MS = 120000;
export const RUN_TOTAL_TIMEOUT_MS = 900000;
export const PER_ROOT_TIMEOUT_ARG = "120s";

const CONFIG_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "config");

/**
 * security N6: load the run profile so per-root timeouts are linked to
 * `config/run-profile.json` instead of a hardcoded module constant. Returns
 * `null` when the config cannot be read; callers then fall back to
 * PER_ROOT_TIMEOUT_MS.
 */
export function loadRunProfile() {
  try {
    return JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, "run-profile.json"), "utf8"));
  } catch {
    return null;
  }
}

/**
 * security N6: resolve the per-root budget for a command phase from the run
 * profile (`timeouts_ms.generator_validate_per_root` /
 * `generator_generate_per_root`), falling back to PER_ROOT_TIMEOUT_MS.
 */
export function perRootTimeoutMs(runProfile, phase) {
  const key =
    phase === "generate" ? "generator_generate_per_root" : "generator_validate_per_root";
  const value = runProfile?.timeouts_ms?.[key];
  return Number.isInteger(value) && value > 0 ? value : PER_ROOT_TIMEOUT_MS;
}

export function optionsString(profile) {
  return profile.additional_properties.ordered_pairs
    .map(([key, value]) => `${key}=${value}`)
    .join(",");
}

export function buildEnvPrefix({ runDir, javaPath, jbrHome }) {
  return [
    "/usr/bin/timeout",
    "--signal=KILL",
    PER_ROOT_TIMEOUT_ARG,
    "/usr/bin/unshare",
    "--user",
    "--map-root-user",
    "--net",
    "/usr/bin/env",
    "-i",
    `HOME=${runDir}/home`,
    `TMPDIR=${runDir}/tmp`,
    `TMP=${runDir}/tmp`,
    `TEMP=${runDir}/tmp`,
    `XDG_CACHE_HOME=${runDir}/home/.cache`,
    `XDG_CONFIG_HOME=${runDir}/home/.config`,
    `XDG_DATA_HOME=${runDir}/home/.local/share`,
    `JAVA_HOME=${jbrHome}`,
    javaPath,
    `-Duser.home=${runDir}/home`,
    `-Djava.io.tmpdir=${runDir}/tmp`,
  ];
}

export function assertNoSupportingFiles(argv) {
  const offending = argv.find((token) => /supportingfiles/i.test(String(token)));
  if (offending) throw new Error(`SUPPORTING_FILES_FORBIDDEN: ${offending}`);
}

export function assertOutsideRepo(target, repoRoot) {
  const rel = path.relative(path.resolve(repoRoot), path.resolve(target));
  if (rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel))) {
    throw new Error(`OUTPUT_INSIDE_REPO: ${target}`);
  }
}

/**
 * F-01: resolve the realpath of the nearest EXISTING ancestor and re-attach the
 * not-yet-created suffix, so an escape is caught even when the destination does
 * not exist yet and even across symlinked ancestors.
 */
function realpathPreservingMissing(target) {
  const abs = path.resolve(target);
  let probe = abs;
  const suffix = [];
  while (!fs.existsSync(probe)) {
    suffix.unshift(path.basename(probe));
    const parent = path.dirname(probe);
    if (parent === probe) break;
    probe = parent;
  }
  const base = fs.existsSync(probe) ? fs.realpathSync(probe) : probe;
  return suffix.length > 0 ? path.join(base, ...suffix) : base;
}

/**
 * F-01: strict confinement. The resolved realpath of `target` must stay strictly
 * under `allowedRoot`; a `..` escape (or a symlinked ancestor) throws
 * `PATH_ESCAPE`. Used to hold inputs under `${run}/bundles` and outputs under
 * `${run}/generate`.
 */
export function assertContained(target, allowedRoot, label = "path") {
  const realTarget = realpathPreservingMissing(target);
  const realRoot = realpathPreservingMissing(allowedRoot);
  const rel = path.relative(realRoot, realTarget);
  if (rel === "" || rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`PATH_ESCAPE ${label}: ${realTarget} is not under ${realRoot}`);
  }
}

/** SR-07: approved slug/segment charset; blocks `../`, `/`, NUL, spaces, etc. */
const SLUG_RE = /^[a-z0-9-]{1,64}$/;

export function validateProfile(profile) {
  const errors = [];
  if (profile.generator.generatorName !== "spring") errors.push("generatorName must be spring");
  if (profile.generator.library !== "spring-boot") errors.push("library must be spring-boot");
  if (profile.additional_properties.ordered_pairs.length !== 12) {
    errors.push("additional_properties must have 12 pairs");
  }
  if (profile.supporting_files.must_not_set !== true) errors.push("supportingFiles must not be set");
  if (profile.roots.length !== 7) errors.push("exactly 7 roots are required");
  if (profile.common.gets_generate !== false) errors.push("common must not get generate");
  for (const root of profile.roots) {
    // SR-07: the slug flows into evidence file names; reject any charset that
    // could traverse (`../escape`) before it is ever joined into a path.
    if (!SLUG_RE.test(root.slug)) {
      errors.push(`slug charset invalid (expected ${SLUG_RE.source}): ${JSON.stringify(root.slug)}`);
    }
    if (!SLUG_RE.test(root.segment)) {
      errors.push(
        `segment charset invalid (expected ${SLUG_RE.source}): ${JSON.stringify(root.segment)}`,
      );
    }
    if (root.slug.includes("-") && !["admin-bff", "buyer-bff"].includes(root.slug)) {
      errors.push(`unexpected hyphen in slug ${root.slug}`);
    }
    if (root.segment.includes("-")) errors.push(`java segment must not contain hyphen: ${root.segment}`);
    const suffixByField = { apiPackage: "api", modelPackage: "model", invokerPackage: "invoker" };
    for (const [field, suffix] of Object.entries(suffixByField)) {
      if (!new RegExp(`^com\\.entralo\\.goas\\.validation\\.${root.segment}\\.${suffix}$`).test(root[field])) {
        errors.push(`${field} does not match approved namespace: ${root[field]}`);
      }
    }
  }
  // m7: the global selection and the Java target are part of the approved
  // profile and must be validated too.
  const globalProperty = profile.global_property?.value;
  if (typeof globalProperty !== "string" || globalProperty.length === 0) {
    errors.push("global_property.value must be a non-empty string");
  } else if (/supportingfiles/i.test(globalProperty)) {
    errors.push("global_property must not include supportingFiles");
  }
  if (profile.global_property?.flag !== "--global-property") {
    errors.push("global_property.flag must be --global-property");
  }
  if (profile.java?.major !== 25) {
    errors.push(`java.major must be the approved target 25, got ${profile.java?.major}`);
  }
  return errors;
}

/**
 * Build the 14 commands. Order per root: validate, then generate.
 * security N6: when `runProfile` is supplied (or loaded from config), each
 * command's `timeout_ms` is taken from the run profile instead of the
 * hardcoded PER_ROOT_TIMEOUT_MS.
 * @returns {Array<{root:string, phase:string, argv:string[], timeout_ms:number}>}
 */
export function buildCommands({ profile, runDir, jarPath, javaPath, jbrHome, repoRoot, runProfile }) {
  const errors = validateProfile(profile);
  if (errors.length > 0) throw new Error(`GENERATION_PROFILE_INVALID: ${errors.join("; ")}`);

  const effectiveRunProfile = runProfile ?? loadRunProfile();
  const prefix = buildEnvPrefix({ runDir, javaPath, jbrHome });
  const options = optionsString(profile);
  const global = profile.global_property.value;
  const commands = [];

  for (const root of profile.roots) {
    const inputBundle = root.input_bundle.replace("${run}", runDir);
    const outputDir = root.output_dir.replace("${run}", runDir);
    // F-01: inputs must stay under ${run}/bundles and outputs under
    // ${run}/generate; a `../` escape is rejected before anything is built.
    assertContained(inputBundle, path.join(runDir, "bundles"), `input ${root.slug}`);
    assertContained(outputDir, path.join(runDir, "generate"), `output ${root.slug}`);
    assertOutsideRepo(inputBundle, repoRoot);
    assertOutsideRepo(outputDir, repoRoot);

    const validateArgv = [...prefix, "-jar", jarPath, "validate", "-i", inputBundle];
    assertNoSupportingFiles(validateArgv);
    commands.push({
      root: root.slug,
      phase: "validate",
      argv: validateArgv,
      timeout_ms: perRootTimeoutMs(effectiveRunProfile, "validate"),
    });

    const generateArgv = [
      ...prefix,
      "-jar",
      jarPath,
      "generate",
      "-g",
      profile.generator.generatorName,
      "--library",
      profile.generator.library,
      "-i",
      inputBundle,
      "-o",
      outputDir,
      "--api-package",
      root.apiPackage,
      "--model-package",
      root.modelPackage,
      "--invoker-package",
      root.invokerPackage,
      "--additional-properties",
      options,
      "--global-property",
      global,
    ];
    assertNoSupportingFiles(generateArgv);
    commands.push({
      root: root.slug,
      phase: "generate",
      argv: generateArgv,
      timeout_ms: perRootTimeoutMs(effectiveRunProfile, "generate"),
    });
  }

  return commands;
}
