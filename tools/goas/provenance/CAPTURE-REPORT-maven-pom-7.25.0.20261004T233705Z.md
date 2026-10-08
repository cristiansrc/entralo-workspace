# Capture Report — OpenAPI Generator CLI 7.25.0 POM (1 authorized GET)

- run_utc: `20261004T233705Z` (server date: `2026-10-04T23:37:05Z`)
- Scope: exactly **1 GET HTTPS** on `repo.maven.apache.org` — the versioned POM of the chosen stable candidate.
- Redirects followed: **none** (`--max-redirs 0`; `num_redirects=0`; no `Location` / `redirect_url` present → stop).
- Retries / backoff: **none** (`--retry 0`). No HEAD, no other URLs, no JAR, no checksums, no install/execution.
- Limits enforced: `--max-time 30` (30 s), `--max-filesize 10485760` (10 MiB/body). Body 4303 B, well under limit.
- curlrc disabled (`-q`) to prevent ambient options from altering behavior.
- XML parser validation: `xmllint --noout` → **well-formed**.
- No plan/shared/pack files were modified.

## 1. Request result (exact)

| field | value |
|-------|-------|
| URL requested | `https://repo.maven.apache.org/maven2/org/openapitools/openapi-generator-cli/7.25.0/openapi-generator-cli-7.25.0.pom` |
| HTTP status | `200` |
| server date (UTC) | `2026-10-04T23:37:05Z` |
| bytes (body) | `4303` |
| redirects | `0` (`redirect_url=` empty) |
| exit code | `0` |
| time_total | `0.196200` |
| body SHA-256 | `8fd322115776682468db4887ede1a0e432bd859efc5570efe68d826fff20f109` |

Response headers of note: `content-type: text/xml`, `content-length: 4303`,
`last-modified: Mon, 24 Aug 2026 08:25:01 GMT`, `etag: "c73890c475d665d7cd4d2f39d253c3bd"`,
`x-checksum-md5: c73890c475d665d7cd4d2f39d253c3bd`, `x-checksum-sha1: 8b7aa14d474ed19a106ad5d38c76475de3fa3897`.

## 2. Custody artifacts (unique names, no overwrite)

- Body XML (vendor/metadata/): `maven-openapi-generator-cli-7.25.0.pom.20261004T233705Z.xml`
  - sha256 `8fd322115776682468db4887ede1a0e432bd859efc5570efe68d826fff20f109`
- Headers (provenance/): `headers-maven-openapi-generator-cli-pom-7.25.0.20261004T233705Z.txt`
  - sha256 `3b6a7217e67b4184c0114d25da19e8545470d289352c43392ba5b8f6c341b3aa`
- Fetch log (provenance/): `fetch-maven-pom-7.25.0.20261004T233705Z.log`
  - sha256 `765f2bf033e7cb5c5545aa6770dfdf1d8dade4a8931b658111f5f071fc939d47`
- SHA-256 manifest (provenance/): `sha256-maven-pom-7.25.0.20261004T233705Z.txt`

## 3. Local analysis of the POM (no network)

Identity / coordinates:
- `groupId`: `org.openapitools` (inherited from parent)
- `artifactId`: `openapi-generator-cli`
- `version`: `7.25.0` (inherited from parent)
- `<name>`: `openapi-generator (executable)`
- Parent: `org.openapitools:openapi-generator-project:7.25.0` (NOT contained in this file).

Packaging / fat-jar:
- `<packaging>` is **absent** → Maven default packaging = `jar`.
- `maven-jar-plugin` sets manifest `<mainClass>org.openapitools.codegen.OpenAPIGenerator</mainClass>`.
- `maven-shade-plugin` v`3.2.0` runs at `package` with goal `shade`, `minimizeJar=false`,
  `createDependencyReducedPom=true`, filtering `META-INF/*.SF|*.DSA|*.RSA`.
- `finalName` = `openapi-generator-cli`.
- **Conclusion:** this module is built as an **executable/shaded (über) JAR** — the published
  `openapi-generator-cli-7.25.0.jar` is intended to be a runnable fat-jar. The POM **does** describe
  a fat-jar (via the shade plugin), but it does **not** enumerate the runtime dependencies that get
  shaded in (they are managed by the parent POM, not listed here).

Dependencies declared in THIS POM:
- `org.testng:testng:7.10.2` — scope `test`
- `org.mockito:mockito-core:4.10.0` — scope `test`
- **No `compile`/`runtime` dependencies are declared here.** Runtime dependencies come from the parent
  `dependencyManagement` and are bundled by the shade plugin.

Java compile/run requirements:
- **Not declared in this POM.** There is no `maven.compiler.source/target/release`,
  `java.version`, or equivalent. These are inherited from the parent POM
  (`openapi-generator-project:7.25.0`), which is not part of this capture.

## 4. Compatibility — explicitly NOT asserted

- Local environment observed: **OpenJDK 26.0.2.1** (javac 26.0.2.1); **no Maven** installed.
- This POM provides **no evidence** of the target Java version for compile or runtime.
  Therefore **no runtime compatibility with Java 26 can be claimed** from this artifact.
- Compatibility must be concluded only after consulting the parent POM (for compiler settings)
  and/or the JAR manifest (`Build-Jdk`, `Automatic-Module-Name`) in a separate, later authorized phase.

## 5. Next necessary URLs (NOT consulted here)

1. Parent POM — for `maven.compiler.*` and `dependencyManagement` (runtime deps):
   `https://repo.maven.apache.org/maven2/org/openapitools/openapi-generator-project/7.25.0/openapi-generator-project-7.25.0.pom`
2. Candidate executable JAR — for `META-INF/MANIFEST.MF` (`Main-Class`, `Build-Jdk`) runtime evidence:
   `https://repo.maven.apache.org/maven2/org/openapitools/openapi-generator-cli/7.25.0/openapi-generator-cli-7.25.0.jar`
3. (Optional) Core module POM, if a non-shaded dependency graph is needed:
   `https://repo.maven.apache.org/maven2/org/openapitools/openapi-generator/7.25.0/openapi-generator-7.25.0.pom`
4. (Optional) Checksums: `.sha1` / `.sha512` for either artifact above (verification only).

None of the URLs in this section were requested during this capture.
