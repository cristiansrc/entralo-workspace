# Capture Report — OpenAPI Generator CLI JAR-via metadata (1 authorized GET)

- run_utc: 20261004T233531Z  (server date: 2026-10-04T23:35:42Z)
- Scope: exactly **1 GET HTTPS** on `repo.maven.apache.org` (Maven `maven-metadata.xml`), one attempt.
- Redirects followed: **none** (`--max-redirs 0`). `num_redirects=0`; no `Location` header present.
- Retries / backoff: **none** (`--retry 0`). No HEAD. No POM, no `.sha512`, no JAR requested.
- Limits enforced: `--max-time 30` (30 s), `--max-filesize 10485760` (10 MiB/body). Body 2948 B, well under limit.
- XML parser validation: `xmllint --noout` → **well-formed**.
- Cross-check (local, no extra request): local md5/sha1 of body match response headers
  `x-checksum-md5=55139b12366d1cb250d740df29cf085c`, `x-checksum-sha1=8d700daaa47da47b0055125e8078c18a1a93f8a1`.
- Note: **METADATA ONLY**. No JAR/POM/checksum was fetched. No generator compatibility is asserted here.

## 1. Request & custody

| # | resource | URL | HTTP | server date (UTC) | bytes | redirects | exit |
|---|----------|-----|------|-------------------|-------|-----------|------|
| 1 | openapi-generator-cli metadata | https://repo.maven.apache.org/maven2/org/openapitools/openapi-generator-cli/maven-metadata.xml | 200 | 2026-10-04T23:35:42Z | 2948 | 0 | 0 |

- Body (vendor/metadata/): `maven-openapi-generator-cli-maven-metadata.20261004T233531Z.xml`
  - sha256 `999d0b983bcea1867a9ee3ab7b15c8758a424110d061f2ec5ae0cdd640978f53`
- Headers (provenance/): `headers-maven-openapi-generator-cli.20261004T233531Z.txt`
  - sha256 `faa6a095b23fd37c9170973bf95a62abebbc5189ea2571dbae16efabaea18572`
- Fetch log (provenance/): `fetch-maven-metadata.20261004T233531Z.log`
  - sha256 `6debf756f4d1981843a5ce8c33d4e915990116cb6ab5fabcc257d2223644dd3a`
- SHA-256 manifest (provenance/): `sha256-maven-metadata.20261004T233531Z.txt`

Relevant response headers:
- `content-type: text/xml`, `content-length: 2948`
- `last-modified: Mon, 24 Aug 2026 08:35:15 GMT`
- `etag: "55139b12366d1cb250d740df29cf085c"`, `cf-cache-status: HIT`, `age: 1708`

## 2. Local analysis (from captured metadata)

- groupId: `org.openapitools`
- artifactId: `openapi-generator-cli`
- `<latest>`: **7.25.0**
- `<release>`: **7.25.0**
- `<lastUpdated>`: `20260824083515` → **2026-08-24T08:35:15Z**
- Total versions listed: 83.

Prerelease identifiers present (excluded from "latest stable"):
`4.0.0-beta`, `4.0.0-beta2`, `4.0.0-beta3`, `5.0.0-beta`, `5.0.0-beta2`, `5.0.0-beta3`, `6.0.0-beta`, `7.0.0-beta`.

Highest stable version: **7.25.0** (no `8.x` or newer stable exists in this metadata).

## 3. Candidate + versioned URL (NOT queried)

- **Candidate latest stable:** `7.25.0`
- **Versioned JAR URL that could be requested in a later authorized phase (NOT requested here):**
  `https://repo.maven.apache.org/maven2/org/openapitools/openapi-generator-cli/7.25.0/openapi-generator-cli-7.25.0.jar`

## 4. Compatibility — explicitly deferred

The local target reported **Java 26**. This metadata does **not** declare Java/runtime compatibility.
Generator↔Java compatibility must be concluded only after consulting official evidence/metadata
(e.g., POM or JAR manifest) in a **separate later phase**. No such endpoint was touched here.
