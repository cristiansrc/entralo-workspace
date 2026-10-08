# Reporte de adquisición e inspección — core npm G-OAS (N01–N09) — run `20261005T015000Z`

Ejecutor: `devops-architect`. Fase: adquisición exacta del inventario §14.2 + inspección read-only.
Autorización: mandato amplio vigente hasta Spec Validator (pack #34/#38) + instrucción humana actual.
Estado: **SRI 9/9 PASS**; inspección 9/9 completada; **sin instalación, sin lock, sin npm/pnpm, sin G-OAS, sin Git/scan**.
JAR `openapi-generator-cli-7.25.0` y metadata previa: **intactos / no sobrescritos**. Runtime del generador a futuro: **Java25 (nunca Java26)**.

## 1. Método y límites aplicados

- **9 GET, uno por URL exacta `dist.tarball` de §14.2**, en orden N01→N09. Sin otras URLs/endpoints, sin HEAD, sin retries/backoff, sin resolución npm.
- curl: `-q --proto '=https' --tlsv1.2 --retry 0 --max-redirs 0 --max-time 30 --max-filesize 104857600`; sin `-L`.
- Límite individual 100 MiB; agregado 500 MiB. Consumido: **3.249.307 bytes (~3,10 MiB)**.
- Custodia: `tools/goas/vendor/tarballs/`; provenance: `tools/goas/provenance/`. Un solo writer; `.part` promovido con `mv -n` (sin sobrescritura). Sin `.part` residuales.
- Manifiesto de inventario: `manifest-npm-core-tarballs.20261005T015000Z.json` (validado: 9 entradas, IDs/URLs únicas, campos requeridos). sha256 manifiesto = `078d5f816f5496a83df5fc66f33b7850eedcfe014dcdfc7911b6d3171a67c176`.
- Verificación de integridad: `sha512-<base64>` de los bytes reales comparado byte a byte con `dist.integrity` esperado de §14.2; SHA-256 local para custodia.

## 2. Resultado por entrada (bytes / SRI esperado = observado / SHA-256 / estado)

| ID | Paquete · versión | Bytes | SRI SHA-512 (esperado == observado) | SHA-256 custodia | Estado |
|---|---|---|---|---|---|
| N01 | `yaml@2.9.1` | 112114 | `sha512-3NxN8+78OdzbT7C/WjGsyfPAtJaN3FNDsWxv7Y7mcDsT/oOmgW8BpyQQFFBnvZE3j9Y2Sdz1ULFLezL7Eb2yFw==` | `4ef6c54cf559b8a207b7b518378230805a1c84af239b14960e8c67c7d59de5d3` | ACQUISITION_RECORDED |
| N02 | `jsonc-parser@3.3.1` | 27354 | `sha512-HUgH65KyejrUFPvHFPbqOY0rsFip3Bo5wb4ngvdi1EpCYWUQDC5V+Y7mZws+DLkr4M//zQJoanu1SP+87Dv1oQ==` | `4a0315b8671e7463bae7af7c142cdf19e9aa7ba39eb36dc2df383b8648e3cbc9` | ACQUISITION_RECORDED |
| N03 | `@redocly/cli@2.57.0` | 2820414 | `sha512-1d5fVyUaYlMNgCHUoyE2vUyxBhs/jmOHgsX/kFmfWzESw4f/G/OV/SU9E55rU7aUNmw9rHj1vXmL6yUdIn+KKQ==` | `1bd67ffd126b063899629f13eccc8f772df3339f92640cc4968814acd0e021c0` | ACQUISITION_RECORDED |
| N04 | `ajv@8.20.0` | 217611 | `sha512-Thbli+OlOj+iMPYFBVBfJ3OmCAnaSyNn4M1vz9T6Gka5Jt9ba/HIR56joy65tY6kx/FCF5VXNB819Y7/GUrBGA==` | `b2f0b3a893bbb8cc5efb6814f08b1499e19e31d5dd73683f5893382f48f6e7b3` | ACQUISITION_RECORDED |
| N05 | `ajv-formats@3.0.1` | 15999 | `sha512-8iUql50EUR+uUcdRQ3HDqa6EVyo3docL8g5WJ3FNcWmu62IbkGUue/pEyLBW8VGKKucTPgqeks4fIU1DA4yowQ==` | `f4d6980fd367381fd29199066911e863db8d97496613b6c2c5b91563a150acc5` | ACQUISITION_RECORDED |
| N06 | `fast-deep-equal@3.1.3` | 3656 | `sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==` | `b019a0980f27638dc3f85836b0e478f188e00d7a6e5852c0819fa86f56e47b8f` | ACQUISITION_RECORDED |
| N07 | `fast-uri@3.1.8` | 44269 | `sha512-GZMtZUTNRpOVIECoXwLNZS5xUGE+mVNbTB8h/7Rwh2TFWcBQiPzTgyZi05BF9UMZKkLJv8XBRJTlU7zg8+ZfMg==` | `86be033b406a7737c0521edc8fe3e15c7ac0cb6b5e509478cc9539a2efaa086c` | ACQUISITION_RECORDED |
| N08 | `json-schema-traverse@1.0.0` | 6074 | `sha512-NM8/P9n3XjXhIZn1lLhkFaACTOURQXjWhV4BA/RnOv8xvgqtqpAX9IO4mRQxSx1Rlo4tqzeqb0sOlruaOy3dug==` | `023222622df29fc274bde5d3590e47aa1d4a8e3c1d6e2aba029948ed79799b21` | ACQUISITION_RECORDED |
| N09 | `require-from-string@2.0.2` | 1816 | `sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==` | `cb694a4965908f7775a0c757f00cf4e624d193cd71d77988fbcca0f597b88d82` | ACQUISITION_RECORDED |

- HTTP: 9/9 `200`; redirects 0; sin `Location`; `curl_exit=0`; una solicitud por URL. `content-type: application/octet-stream` (autoritativo: `headers-npm-tarball-N<ID>.<run>.txt`). *Nota: el campo `content_type` del JSONL quedó vacío por omisión de parseo; el archivo de cabeceras es la fuente autoritativa y el JSONL no se reescribe.*
- `content-length` == bytes locales en las 9 entradas → transferencia no truncada.
- SRI = `dist.integrity` de §14.2, verificado byte a byte. **No implica autenticidad del publisher** (mismo registry).

## 3. Inspección read-only (sin extracción a disco, sin ejecución)

Fuentes: `inspection-npm-core-tarballs.20261005T015000Z.jsonl`, `INSPECTION-npm-core-tarballs.20261005T015000Z.md`, listados `listing-N<ID>.<run>.txt(.verbose.txt)`.

- **9/9**: top-level único `package/`; **0 hallazgos de path traversal/absolutos**; **0 enlaces** (ni symlink ni hardlink) en los 9 archivos → sin symlinks salientes.
- **9/9** `package/package.json` presente, JSON válido; `name`/`version` internos **coinciden** con lo esperado y con la metadata capturada.
- `engines` observados == metadata: N01 `{node:">= 14.6"}`; N03 `{node:">=22.12.0 || >=20.19.0 <21.0.0", npm:">=10"}`; N09 `{node:">=0.10.0"}`; N02/N04/N05/N06/N07/N08 sin campo (`ausente`, no `null`).
- `dependencies` observadas == metadata: N04 exactamente `fast-deep-equal ^3.1.3`, `fast-uri ^3.0.1`, `json-schema-traverse ^1.0.0`, `require-from-string ^2.0.2`; N05 `ajv ^8.0.0` (dep) + peer `ajv ^8.0.0` con `peerDependenciesMeta.ajv.optional:true`; N01/N02/N03/N06/N07/N08/N09 sin dependencias declaradas. `bundledDependencies` vacío en 9/9. Sin `node_modules/` embebido en 9/9.
- **Lifecycle scripts detectados (registrados, NO ejecutados)** — exigirán `ignore-scripts=true` en la futura instalación: N01 `prepublishOnly`; N02 `prepack`; N04 `prepublish`; N06 `prepublish`. (N03/N05/N07/N08/N09 sin lifecycle.)

## 4. Hallazgo material en N03 `@redocly/cli@2.57.0` — DETENCIÓN antes de instalación

- `package.json`: `dependencies`/`peerDependencies`/`optionalDependencies` **ausentes**; `bundledDependencies` ausente; `node_modules/` **0**; `scripts` ausente; `type:"module"`; `bin` → `bin/cli.js`; contenido = `lib/index.js` (bundle) + 158 `lib/chunks/*.js` + `lib/eject-assets/**`.
- `bin/cli.js` sólo importa `node:module` y `../lib/index.js` (builtins de Node). El bundle es **autocontenido por vendorización**.
- **`package/THIRD_PARTY_NOTICES` (39 745 B) revela un árbol third-party vendorizado** que la metadata del registry no exponía, con **divergencias frente al inventario**: p. ej. `fast-uri@3.1.7` **bundleado** vs `fast-uri@3.1.8` del inventario (N07); además de `ajv@8.20.0`, `ajv-formats@3.0.1`, `fast-deep-equal@3.1.3`, `json-schema-traverse@1.0.0`, `yaml@2.9.1` (coincidentes con N01/N04/N05/N06/N08), `@redocly/ajv@8.11.2`, `@redocly/ajv@8.18.3`, `@redocly/openapi-core@1.34.20`, `@redocly/config@0.22.0`, `@redocly/config@0.59.0`, `@redocly/cli-otel@0.3.7`, y ~100 paquetes más.
- **Lectura:** no contradice el número de `dependencies` **declaradas** (cero) ni añade edges al lock npm del conjunto N01–N09, ya que todo está inlineado dentro del tarball de N03. **Sí contradice el supuesto de inventario/closure vendored**: el contenido interno de N03 no refleja 1:1 las versiones del inventario (caso `fast-uri` 3.1.7 vs 3.1.8) e incluye copias propias de Ajv (fork `@redocly/ajv`).
- **Acción:** **DETENER antes de instalación** (conforme a la condición explícita) y **reportar para decisión de Planner/humano**. No se instala, no se extrae, no se ejecuta. El resto de N01–N09 no presenta contradicciones.

## 5. Artefactos de provenance del run

- `manifest-npm-core-tarballs.20261005T015000Z.json`
- `fetch-npm-core-tarballs.20261005T015000Z.log`
- `integrity-npm-core-tarballs.20261005T015000Z.txt`
- `acquisition-npm-core-tarballs.20261005T015000Z.jsonl`
- `headers-npm-tarball-N01..N09.20261005T015000Z.txt` (9)
- `writeout-npm-tarball-N01..N09.20261005T015000Z.txt` (9)
- `listing-N01..N09.20261005T015000Z.txt` y `.verbose.txt` (18)
- `inspection-npm-core-tarballs.20261005T015000Z.jsonl`
- `INSPECTION-npm-core-tarballs.20261005T015000Z.md`
- (este) `ACQUISITION-REPORT-npm-core-tarballs.20261005T015000Z.md`

## 6. Estado y prohibiciones respetadas

- **NO** ejecutados npm/pnpm, `package.json`/`package-lock.json`/config, instalación, lifecycle scripts, npx/CLI, generación, JAR, G-OAS, Git ni scan.
- JAR previo y metadata previa: sin modificación. Directorios `tools/goas/vendor/tarballs/` y `tools/goas/provenance/` sólo recibieron artefactos nuevos.
- Runtime del generador: **Java25** en fase posterior; **no** Java26; sin cambio de sistema.
- G-OAS permanece **ABIERTO**; sin `ready`, sin cierre de gates, sin handoff.
