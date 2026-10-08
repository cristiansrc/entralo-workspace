// red: test-architect (entralo-v1-executable-specs)
// owner: test-architect — executor must not edit this file.
//
// Regression tests mapped to preflight / generation findings:
//   m7 — validateProfile must validate global_property and java sections.
//   L-04/m4, m5 — uncovered in this suite because the preflight closures are not
//        exported; the missing dynamic-import / in-string '#' coverage is
//        reported separately.

import fs from "node:fs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { validateProfile } from "../lib/generation.mjs";

const validProfile = JSON.parse(
  fs.readFileSync(new URL("../config/generation-profile.json", import.meta.url), "utf8"),
);

describe("preflight-related contracts", () => {
  it("m7: validateProfile rejects global_property that includes supportingFiles", () => {
    const profile = JSON.parse(JSON.stringify(validProfile));
    profile.global_property.value = "apis,models,supportingFiles=false";
    const errors = validateProfile(profile);
    assert.ok(errors.length > 0, "supportingFiles in global_property must be rejected");
  });

  it("m7: validateProfile rejects java.major outside the approved value", () => {
    const profile = JSON.parse(JSON.stringify(validProfile));
    profile.java.major = 21;
    const errors = validateProfile(profile);
    assert.ok(errors.length > 0, "java.major must be validated against the approved target");
  });
});
