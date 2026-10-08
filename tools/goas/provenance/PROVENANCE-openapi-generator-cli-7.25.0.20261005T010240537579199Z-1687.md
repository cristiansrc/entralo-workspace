# Provenance — OpenAPI Generator CLI 7.25.0 JAR (stage + verificación SHA-1 por header)

- run_utc (cliente): `2026-10-05T01:02:40Z` (server `Date: Mon, 05 Oct 2026 01:02:40 GMT`)
- Método autorizado: **SHA-1 por header (`X-Checksum-SHA1`) de ESTA respuesta**, tras 404 confirmado
  de `.sha512` y `.sha256` (evidencia local previa en `tools/goas/provenance/`).
- Alcance: **exactamente 1 GET HTTPS**. Sin redirects (`--max-redirs 0`, `num_redirects=0`),
  sin retries/backoff (`--retry` no usado), sin HEAD, sin otros endpoints, sin sidecars.
- curlrc deshabilitado (`-q`). Límite defensivo: `--max-filesize 104857600` (100 MiB).
- Estado: **STAGED + VERIFIED (match)**. NO se extrajo, NO se ejecutó, NO se instaló.

## 1. Request result (exacto)

| campo | valor |
|-------|-------|
| URL | `https://repo.maven.apache.org/maven2/org/openapitools/openapi-generator-cli/7.25.0/openapi-generator-cli-7.25.0.jar` |
| HTTP status | `200` |
| server date (UTC) | `2026-10-05T01:02:40Z` |
| bytes (body) | `31942042` (~30.5 MiB) |
| redirects | `0` (`redirect_url=` vacío; sin `Location`) |
| curl exit code | `0` |
| time_total | `0.524276` s |
| content-type | `application/java-archive` |
| Content-Length | `31942042` (coincide con bytes descargados → **no truncado**) |
| CF-Cache-Status | `HIT` (Age `923089`) |
| ETag / X-Checksum-MD5 | `e01eddf220074439f733bdf6e8c3daad` (coherentes entre sí) |

## 2. Verificación de integridad

| checksum | esperado (header del MISMO servidor) | observado (local) | resultado |
|----------|--------------------------------------|-------------------|-----------|
| SHA-1 | `56a9bb79e3bb565f477eddca2c6daa288a9c6f35` | `56a9bb79e3bb565f477eddca2c6daa288a9c6f35` | **MATCH** |
| SHA-256 (solo custodia) | — (no provisto) | `41ce4f6b07f196676439d710759fa1ced7a08066d06ff1bf314681470289efae` | registrado |
| MD5 (referencia ETag) | `e01eddf220074439f733bdf6e8c3daad` | no recalculado (fuera de alcance) | n/a |

- Contenido: `file` → `Java archive data (JAR)`; magic bytes `50 4b 03 04` (PKZIP).
- Longitud: `Content-Length == size_download == wc -c == 31942042` → respuesta íntegra.

## 3. Artefactos de custodia (nombres únicos, sin overwrite)

- JAR (staging): `tools/goas/vendor/tarballs/openapi-generator-cli-7.25.0.20261005T010240537579199Z-1687.jar`
  - bytes `31942042`; sha1 `56a9bb79e3bb565f477eddca2c6daa288a9c6f35`;
    sha256 `41ce4f6b07f196676439d710759fa1ced7a08066d06ff1bf314681470289efae`
- Headers (provenance): `tools/goas/provenance/headers-maven-jar-7.25.0.20261005T010240537579199Z-1687.txt`
  - sha256 `4a1676b09472e2606c3740a14bc37468cfbdae1e174b8f0281af1bfa95a683d6`
- Fetch log (provenance): `tools/goas/provenance/fetch-maven-jar-sha1header-7.25.0.20261005T010240537579199Z-1687.log`
  - sha256 `6463314f9981107ffb9f4277a6f3a43b8d75015018673bc237a5de3618ce1148`
- Custodia SHA-256 (provenance): `tools/goas/provenance/sha256-custody-maven-jar-7.25.0.20261005T010240537579199Z-1687.txt`

## 4. Limitaciones y advertencias (no bloqueantes para stage)

1. **SHA-1 no es autenticidad independiente**: el hash proviene del MISMO servidor/CDN que sirvió el
   cuerpo (Cloudflare → S3 Maven Central). Verifica integridad de transferencia, pero **no**
   autentica al publicador. No hay firma PGP ni atestación de proveniencia en este flujo.
2. **SHA-1 está criptográficamente debilitado** (colisiones prácticas). Se aceptó como método
   alternativo por ausencia de `.sha512`/`.sha256` (ambos 404 `NoSuchKey`), con alcance acotado.
3. **Cache HIT** (`CF-Cache-Status: HIT`, `Age: 923089`): el body provino de caché del CDN; el
   checksum es del objeto cacheado. Consistente con el artefacto publicado, pero es la misma
   cadena de confianza que el header.
4. **Entorno Java**: el sistema tiene **Java 26** (`openjdk 26.0.2.1`, único en `/usr/lib/jvm`).
   El JAR debe ejecutarse **solo con Java 25, no Java 26**. No se dispone actualmente de un JDK 25
   local; **no se modificó el Java del sistema**. Ejecución pendiente y fuera de este alcance.
5. No se realizó: extracción, ejecución, instalación, G-OAS, tests, Git, escaneos ni edición de
   plan/shared/pack.

## 5. Siguiente paso (NO ejecutado en este run)

- Solo stage/verificación completado. Cualquier extracción o ejecución (con JDK 25) requiere una
  autorización nueva y explícita.
