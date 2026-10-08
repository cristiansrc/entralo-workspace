# Capture Report — OpenAPI Generator CLI 7.25.0 JAR `.sha512` (1 authorized GET)

- run_utc: `20261004T234041Z` (server date: `2026-10-04T23:40:41Z`)
- Scope: exactly **1 GET HTTPS** on `repo.maven.apache.org` — the expected `.sha512` checksum sidecar of the candidate JAR `7.25.0`.
- Attempts: **1** (no retry/backoff: `--retry 0`). No HEAD, no other URLs, no JAR body, no extra POMs, no install/execution, no G-OAS, no Git, no scan.
- Redirects followed: **none** (`--max-redirs 0`; `num_redirects=0`; empty `redirect_url`; no `Location` header → would have stopped).
- Limits enforced: `--max-time 30` (30 s), `--max-filesize 10485760` (10 MiB/body). Body 554 B, well under limit.
- curlrc disabled (`-q`) to prevent ambient options from altering behavior.
- No plan/shared/pack files were modified.

## 1. Request result (exact)

| field | value |
|-------|-------|
| URL requested | `https://repo.maven.apache.org/maven2/org/openapitools/openapi-generator-cli/7.25.0/openapi-generator-cli-7.25.0.jar.sha512` |
| HTTP status | **`404`** (Not Found) |
| server date (UTC) | `2026-10-04T23:40:41Z` |
| bytes (body) | `554` |
| redirects | `0` (`redirect_url=` empty) |
| exit code (curl) | `0` |
| time_total | `0.294523` |
| content-type | `text/html` |
| body SHA-256 | `e791ccfcfee9c0d299d07474d9bfcbfcbebf1181323be601220c8a823062ab99` |

Definitive server-side cause (from response headers):
- `x-amz-error-code: NoSuchKey`
- `x-amz-error-detail-key: maven2/org/openapitools/openapi-generator-cli/7.25.0/openapi-generator-cli-7.25.0.jar.sha512`
- `x-amz-error-message: The specified key does not exist.`

→ Maven Central (S3) reports the `.sha512` object **does not exist** for this artifact. This is an
authoritative 404, not a transient error (no redirect, no retry warranted/attempted).

## 2. Custody artifacts (unique names, no overwrite)

- Body (vendor/metadata/): `maven-openapi-generator-cli-7.25.0.jar.sha512.20261004T234041Z.sha512`
  - size `554 B`; sha256 `e791ccfcfee9c0d299d07474d9bfcbfcbebf1181323be601220c8a823062ab99`
- Headers (provenance/): `headers-maven-openapi-generator-cli-jar-sha512.7.25.0.20261004T234041Z.txt`
  - size `432 B`; sha256 `eebab87acc890d437dc532ea024032482eb54eb2a8583addf203d09ffa9aa76b`
- Fetch log (provenance/): `fetch-maven-jar-sha512.20261004T234041Z.log`
  - size `712 B`; sha256 `5245ae5e56517e6ed9582ba5137048856538ec4ed2cb5243ae403c667fd7709a`

## 3. Local analysis of the captured body (no network)

Byte content / classification:
- The body is **not** a SHA-512 digest. It is an nginx HTML error page:
  `<html><head><title>404 Not Found</title></head>…<hr><center>nginx</center></html>`
  followed by MSIE/Chrome padding comments.
- Validation `^[0-9a-fA-F]{128}$` → **NO**. There is **no** 128-hex-character string present.
- Therefore: **no checksum string can be extracted**. `exact checksum string = (none — body is a 404 HTML page)`.

Interpretation:
- The expected `.sha512` sidecar is **absent** from Maven Central for
  `openapi-generator-cli-7.25.0.jar`. Note that Maven Central does not publish `.sha512` for all
  artifacts; availability is not guaranteed. A `.sha256`/`.sha1`/`.md5` sidecar may exist instead,
  but **none were requested here** (single-GET mandate).
- This response says nothing about the artifact's *publisher identity* (no signature / no PGP / no
  provenance attestation is conveyed by a checksum sidecar even when present). It only reports
  object existence.

## 4. Conclusions / next necessary URLs (NOT consulted here)

1. The candidate JAR `openapi-generator-cli-7.25.0.jar.sha512` checksum sidecar is **not published**
   on `repo.maven.apache.org` (HTTP 404, `NoSuchKey`).
2. Integrity verification cannot be performed via `.sha512` at this coordinate. If integrity evidence
   is required, request (each in a **separate, separately-authorized** capture):
   - `openapi-generator-cli-7.25.0.jar.sha256`
   - `openapi-generator-cli-7.25.0.jar.sha1`
   - or fetch the JAR and a published signature (`*.asc`) if present.
3. No JAR, POM, script or executable was downloaded, created or run. No G-OAS/Git/scan operations.

None of the URLs in section 4 were requested during this capture.
