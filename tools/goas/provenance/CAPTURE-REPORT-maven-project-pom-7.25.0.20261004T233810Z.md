# Capture Report — OpenAPI Generator **project (parent)** POM 7.25.0 (1 authorized GET)

- run_utc: `20261004T233810Z` (server date: `2026-10-04T23:38:10Z`)
- Scope: exactly **1 GET HTTPS** on `repo.maven.apache.org` — the parent/aggregator POM that governs the CLI 7.25.0 build.
- Redirects followed: **none** (`--max-redirs 0`; `num_redirects=0`; no `Location` / `redirect_url` → stop).
- Retries / backoff: **none** (`--retry 0`). No HEAD, no other URLs, no JAR, no checksums, no install/execution.
- Limits enforced: `--max-time 30` (30 s), `--max-filesize 10485760` (10 MiB/body). Body 51098 B, well under limit.
- curlrc disabled (`-q`) to prevent ambient options from altering behavior.
- XML parser validation: `xmllint --noout` → **well-formed**.
- No plan/shared/pack files were modified. No Git operations. No scans.

## 1. Request result (exact)

| field | value |
|-------|-------|
| URL requested | `https://repo.maven.apache.org/maven2/org/openapitools/openapi-generator-project/7.25.0/openapi-generator-project-7.25.0.pom` |
| HTTP status | `200` |
| server date (UTC) | `2026-10-04T23:38:10Z` |
| bytes (body) | `51098` |
| redirects | `0` (`redirect_url=` empty) |
| exit code | `0` |
| time_total | `0.086513` |
| body SHA-256 | `1a7083fe73ee36210e7b65ce3b0e233cbef85d6f79c953578dd7287006acf68a` |

Response headers of note: `content-type: text/xml`, `content-length: 51098`,
`last-modified: Mon, 24 Aug 2026 08:25:01 GMT`, `etag: "fe4f6759361c46cfc3b3b9b18a891017"`,
`x-checksum-md5: fe4f6759361c46cfc3b3b9b18a891017`, `x-checksum-sha1: 59bf2cd5bc1a57098def0ef07ca06ce9533d4a64`.

## 2. Custody artifacts (unique names, no overwrite)

- Body XML (vendor/metadata/): `maven-openapi-generator-project-7.25.0.pom.20261004T233810Z.xml`
  - sha256 `1a7083fe73ee36210e7b65ce3b0e233cbef85d6f79c953578dd7287006acf68a`
- Headers (provenance/): `headers-maven-openapi-generator-project-pom-7.25.0.20261004T233810Z.txt`
  - sha256 `87a99456becce1473ba0a54cdfbae3635f471e783eb47e432117ecd05b4d9970`
- Fetch log (provenance/): `fetch-maven-project-pom-7.25.0.20261004T233810Z.log`
  - sha256 `cfc080f7852d67cd1cc8e8766f01029cb8ffc1470fa6a316821c4784e61ef9b1`
- SHA-256 manifest (provenance/): `sha256-maven-project-pom-7.25.0.20261004T233810Z.txt`

## 3. Identity and role of this POM

- `groupId`: `org.openapitools`, `artifactId`: `openapi-generator-project`, `version`: `7.25.0` (`<packaging>pom</packaging>`).
- Its own parent: `org.sonatype.oss:oss-parent:5` (`relativePath` empty → resolved from repository). **Not part of this capture.**
- `<modules>`: `openapi-generator-core`, `openapi-generator`, `openapi-generator-cli`, `openapi-generator-maven-plugin` (gradle/mill/online modules commented out).
- This is the **build parent of the CLI** (`openapi-generator-cli` declares it as `<parent>`), so its `build`, `properties`, `dependencyManagement` and `pluginManagement` are inherited by the CLI module.

## 4. Java configuration inherited by the CLI 7.25.0 (build requirements)

Declared in `<properties>` (lines 1250–1251) and consumed by plugins:

| item | value | meaning |
|------|-------|---------|
| `maven.compiler.source` | `11` | language level for `javac` source |
| `maven.compiler.target` | `11` | bytecode/class-file target (version 55) |
| `maven.compiler.release` | **absent** | no `--release` cross-compilation; build links against the *running JDK's* bootclasspath |
| `maven-compiler-plugin` | `3.14.0` | `<source>${maven.compiler.source}</source>`, `<target>${maven.compiler.source}</target>` → both 11 |
| annotation processors | Lombok `1.18.38`, `kotlin-compiler-embeddable 1.6.21` | declared via `<annotationProcessorPaths>` |
| `maven-enforcer-plugin` | `3.3.0` | `requireJavaVersion ≥ 1.11.0`, `requireMavenVersion ≥ 3.3.4`, no-SNAPSHOT deps |
| `forbiddenapis` | `3.5.1` | bundled signatures `jdk-unsafe/deprecated/internal/non-portable/reflection`, chosen from `maven.compiler.target` (=11) |
| `maven-javadoc-plugin` | `3.11.2` | `<source>${maven.compiler.source}</source>` = 11 |
| `project.build.sourceEncoding` | not set here | referenced (line 552) but inherited from `oss-parent:5` |

**Build requirements conclusion:** to build from source you need **JDK 11+** and **Maven ≥ 3.3.4**. There is **no `<release>`** and **no `animal-sniffer`/`bootclasspath` pinning**, so a build executed on a newer JDK (e.g., the locally installed JDK 26) compiles *against JDK 26's* API while stamping class files as version 55. `forbiddenapis` (jdk-internal etc.) mitigates but does not fully guarantee Java 11 API cleanliness.

## 5. `dependencyManagement` inherited by the CLI 7.25.0

The only managed entries (lines 1223–1239), both **test-scoped**:

| groupId:artifactId | version | scope | type |
|---|---|---|---|
| `org.junit:junit-bom` | `5.10.2` | import (bom) | pom |
| `org.testng:testng` | `${testng.version}` = `7.10.2` | test | jar |

- The parent POM declares **no project-level `<dependencies>`** (the only `<dependencies>` blocks are the surefire plugin block and `dependencyManagement`).
- Therefore `dependencyManagement` pins **no compile/runtime dependency** of the CLI. It only governs test tooling.

## 6. Build vs runtime — explicit distinction

- **Build-time (this POM):** compiler source/target 11, enforcer Java≥11 & Maven≥3.3.4, Lombok/Kotlin annotation processors, forbiddenapis, jacoco/surefire/checkstyle/spotbugs/pmd, shade plugin wiring (CLI). Versions of build libs are in `<properties>`.
- **Runtime (this POM):** **nothing enumerable.** The parent exposes no runtime dependency list. The CLI's runtime classpath is produced by the **maven-shade-plugin** (`createDependencyReducedPom=true`), which **strips shaded dependencies from the deployed POM**. That is why the captured CLI POM (`openapi-generator-cli-7.25.0.pom`) shows only `testng` + `mockito-core` test deps and **no** `org.openapitools:openapi-generator` core dependency, even though `Main-Class` is `org.openapitools.codegen.OpenAPIGenerator` (a class owned by the **core** module).
- **Consequence:** the published CLI artifact is a **fat-jar**; as a Maven dependency it resolves **almost no runtime transitives**. The true runtime set is *inside the JAR*, not derivable from the POM alone.

## 7. Transitive dependencies needed to inspect (NOT consulted here)

To resolve the real compile/runtime graph of the CLI 7.25.0, the following would need to be read **in a later authorized phase** (URLs deliberately **not requested**):

1. Core module POM (the CLI's stripped compile dependency; source of runtime deps):
   `org.openapitools:openapi-generator:7.25.0` (module `modules/openapi-generator`).
2. `org.openapitools:openapi-generator-core:7.25.0` (module `modules/openapi-generator-core`).
3. Build-parent-of-parent: `org.sonatype.oss:oss-parent:5` (plugin/compiler defaults, encoding).
4. Version properties in this POM hint at candidate runtime libraries whose **actual** membership/versions must be confirmed against the core POM (not assumed):
   `io.swagger.parser.v3:swagger-parser:2.1.46`,
   `com.fasterxml.jackson*:2.21.4` (+ `jackson-annotations:2.21`, `jackson-datatype-threetenbp:2.18.2`),
   `com.google.guava:guava:32.1.3-jre`, `org.slf4j:slf4j-api:1.7.36`,
   `org.apache.commons:commons-lang3:3.18.0`, `commons-io:2.20.0`, `commons-cli:1.10.0`, `commons-text:1.10.0`,
   `org.yaml:snakeyaml:2.4`, `com.samskivert:jmustache:1.16`, `com.github.jknack:handlebars:4.3.1`,
   `com.github.mifmif:generex:1.0.2`, diffutils `1.3.0`, `resolver-util 1.9.18`.
   Each of these carries its own transitives (e.g., swagger-parser → swagger-core/jackson).
5. Test-only closure: `org.testng:testng:7.10.2`, `org.mockito:mockito-core:4.10.0`, `org.junit:junit-bom:5.10.2`, `com.tngtech.archunit:archunit:1.3.0`.
6. Runtime evidence artifact (not a POM): executable JAR manifest/dependency metadata
   `org.openapitools:openapi-generator-cli:7.25.0` (`META-INF/MANIFEST.MF` `Build-Jdk`/`Main-Class`, and `META-INF/maven/**/pom.xml`).

None of the coordinates above were requested during this capture. No checksums/JAR fetched.

## 8. Compatibility — explicitly NOT asserted

- Local environment observed: **OpenJDK 26.0.2.1** (`javac 26.0.2.1`); **Maven not installed**.
- This parent POM shows the **build target is Java 11** and the **build floor is Java 11 / Maven 3.3.4**, but with **no `<release>`** the produced classes may reference APIs absent from a Java 11 runtime.
- **Runtime compatibility of the published shaded CLI JAR (any JDK, including 26) cannot be concluded from the POM alone.** It requires the JAR manifest/`Build-Jdk`, the shaded runtime dependency set, and ideally execution — a separate, later authorized phase.
