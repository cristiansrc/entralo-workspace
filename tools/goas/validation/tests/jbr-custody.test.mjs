// red: test-architect (jbr-custody)
// owner: test-architect — executor must not edit this file.
//
// Tests for official JBR 25.0.3 Linux x64 b508.16 custody in
// config/generation-profile.json, using shared evidence L1631-L1700:
//   - Extracted bin/java SHA-256: 4bb57cc896ef2c6833e63583e34aef4f605ec63b52617e3f4b25f447284a68ac
//   - Source artifact: jbr-25.0.3-linux-x64-b508.16.tar.gz
//   - Official tarball SHA-512: f936d2a4048485d3cb552c26f69b41f13eba0f75de1178c9ff6185547755c336d0ef5af9641f004e916d0d0414e34d1e9f9d12c08d262038cbca517dcad0dc96
//
// Negative paths continue to use synthetic profiles without custody for
// JBR_DIGEST_UNAVAILABLE; we never assert absence on the real profile.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { runGoas } from "../lib/orchestrator.mjs";
import {
  cleanup as cleanupJbr,
  createJbrHome,
  noopCommandRunner,
  sha256File,
} from "./helpers/jbr-fixture.mjs";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const jarPath = fileURLToPath(
  new URL(
    "../../vendor/tarballs/openapi-generator-cli-7.25.0.20261005T010240537579199Z-1687.jar",
    import.meta.url,
  ),
);
const validProfile = JSON.parse(
  fs.readFileSync(new URL("../config/generation-profile.json", import.meta.url), "utf8"),
);

const EXPECTED_JBR_SHA256 =
  "4bb57cc896ef2c6833e63583e34aef4f605ec63b52617e3f4b25f447284a68ac";
const EXPECTED_TARBALL_SHA512 =
  "f936d2a4048485d3cb552c26f69b41f13eba0f75de1178c9ff6185547755c336d0ef5af9641f004e916d0d0414e34d1e9f9d12c08d262038cbca517dcad0dc96";

function tmpDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

describe("JBR custody in generation-profile.json", () => {
  it("declares the official bin/java SHA-256 custody", () => {
    assert.equal(
      validProfile.java.sha256_custody,
      EXPECTED_JBR_SHA256,
      "generation-profile.json must declare the verified JBR bin/java SHA-256 custody",
    );
  });

  it("declares coherent JBR provenance fields", () => {
    const java = validProfile.java;

    assert.ok(java.tarball_url, "java.tarball_url must be present");
    assert.match(
      java.tarball_url,
      /jbr-25\.0\.3-linux-x64-b508\.16\.tar\.gz$/,
      "tarball_url must point to the official JBR 25.0.3 b508.16 tarball",
    );

    assert.ok(java.tarball_checksum_url, "java.tarball_checksum_url must be present");
    assert.match(
      java.tarball_checksum_url,
      /jbr-25\.0\.3-linux-x64-b508\.16\.tar\.gz\.checksum$/,
      "tarball_checksum_url must point to the official checksum sidecar",
    );

    assert.equal(
      java.tarball_sha512,
      EXPECTED_TARBALL_SHA512,
      "tarball_sha512 must match the official SHA-512 of the JBR tarball",
    );

    assert.ok(java.implementor_version, "java.implementor_version must be present");
    assert.match(
      java.implementor_version,
      /JBR-25\.0\.3.*508\.16/,
      "implementor_version must identify JBR 25.0.3 b508.16",
    );

    assert.ok(java.runtime_version, "java.runtime_version must be present");
    assert.match(
      java.runtime_version,
      /25\.0\.3.*b508\.16/,
      "runtime_version must identify JBR 25.0.3 b508.16",
    );
  });
});

describe("JBR custody acceptance path", () => {
  it("accepts a synthetic profile whose java.sha256_custody matches the observed binary", async () => {
    const evidenceRoot = tmpDir("goas-jbr-accept-");
    const { jbrHome, javaPath } = createJbrHome("verified-jbr-binary-content");
    try {
      const observedSha256 = sha256File(javaPath);
      const profile = JSON.parse(JSON.stringify(validProfile));
      profile.java.sha256_custody = observedSha256;

      const summary = await runGoas({
        runId: "20261007T000500Z",
        repoRoot,
        profile,
        jarPath,
        javaPath,
        jbrHome,
        evidenceRoot,
        commandRunner: noopCommandRunner,
      });

      assert.notEqual(
        summary.signal,
        "TOOLCHAIN_BLOCKED",
        "a matching JBR custody must not produce TOOLCHAIN_BLOCKED",
      );
      assert.notEqual(
        summary.reason,
        "JBR_DIGEST_UNAVAILABLE",
        "a matching JBR custody must not produce JBR_DIGEST_UNAVAILABLE",
      );
      assert.notEqual(
        summary.reason,
        "JBR_SHA256_MISMATCH",
        "a matching JBR custody must not produce JBR_SHA256_MISMATCH",
      );
    } finally {
      cleanup(evidenceRoot);
      cleanup(jbrHome);
    }
  });

  it("still reports JBR_DIGEST_UNAVAILABLE for a synthetic profile without custody", async () => {
    const evidenceRoot = tmpDir("goas-jbr-unavailable-");
    const { jbrHome, javaPath } = createJbrHome("fake-jbr-runtime-unavailable");
    try {
      const profile = JSON.parse(JSON.stringify(validProfile));
      delete profile.java.sha256_custody;

      const summary = await runGoas({
        runId: "20261007T000501Z",
        repoRoot,
        profile,
        jarPath,
        javaPath,
        jbrHome,
        evidenceRoot,
        commandRunner: noopCommandRunner,
      });

      assert.equal(summary.signal, "TOOLCHAIN_BLOCKED", "missing JBR custody must block toolchain");
      assert.equal(
        summary.reason,
        "JBR_DIGEST_UNAVAILABLE",
        "missing JBR custody reason must be JBR_DIGEST_UNAVAILABLE",
      );
    } finally {
      cleanup(evidenceRoot);
      cleanup(jbrHome);
    }
  });
});
