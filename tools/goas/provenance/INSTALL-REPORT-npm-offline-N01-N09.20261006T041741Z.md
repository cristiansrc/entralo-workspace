# Reporte de instalación local/offline — core npm G-OAS (N01–N09) — run `20261006T041741Z`

Ejecutor: `devops-architect`. Alcance: instalación **local-only, offline, sin redistribución** del inventario exacto §14.2 (`@redocly/cli` N03 autorizado pese a gaps de notices; N01/N02/N04–N09 «instala todas»).
Estado: **instalación 9/9 completada con lock `file:`**; SRI 9/9 PASS contra §14.2 y contra el lock; 0 egress; 0 lifecycle scripts; 0 leaks gitleaks en artefactos de instalación.
**NO** ejecutado: `@redocly/cli`, Java/JAR, parser, G-OAS, Git. Sistema Java intacto (Java26 por defecto **no invocado**; runtime futuro del generador = Java25/JBR25.0.3, no ahora).

## 1. Entorno efectivo

| Elemento | Valor |
|---|---|
| Node | `v26.7.0` (`/home/cristiansrc/.local/share/mise/installs/node/26.7.0/bin/node`) |
| npm | `11.19.0` (mismo tree mise) |
| Java | PATH por defecto `openjdk 26.0.2.1` — **no invocado** en ningún paso |
| Espacio | 967G disponibles en `/mnt/data` |

## 2. Aislamiento npm (sin HOME)

`tools/goas/.npmrc` (proyecto) + `tools/goas/.npmrc.user` (userconfig aislada) + `tools/goas/.npmrc.global` (globalconfig aislada), todas vacías o con settings offline. La config efectiva durante `install`/`ci` cargó **solo** esos tres archivos (verificado en debug log npm) más el npmrc interno de npm.

| Config | Valor efectivo |
|---|---|
| `cache` | `/mnt/data/Shares/Projects/entralo-workspace/tools/goas/.npm-cache` |
| `userconfig` | `…/tools/goas/.npmrc.user` |
| `globalconfig` | `…/tools/goas/.npmrc.global` |
| `offline` | `true` |
| `ignore-scripts` | `true` (persistente) |
| `audit` / `fund` | `false` / `false` |
| `update-notifier` | `false` |
| `TMPDIR` | `…/tools/goas/.tmp` |

`.npmrc` (proyecto) contiene: `ignore-scripts=true`, `offline=true`, `audit=false`, `fund=false`, `update-notifier=false`, `cache=.npm-cache`.

## 3. Procedimiento ejecutado

1. `npm install --package-lock-only --offline --ignore-scripts --no-audit --no-fund` → `up to date`, exit 0.
2. `npm ci --offline --ignore-scripts --no-audit --no-fund` → `added 9 packages`, exit 0.
3. `package-lock.json` **no cambió** entre pre y post (`npm ci` no lo reescribió).

## 4. Resultado de instalación

`npm ls --all --offline` (exit 0), 10 entradas (raíz + 9), sin `UNMET`/`invalid`:

```
goas-tooling@0.0.0 tools/goas
├── @redocly/cli@2.57.0
├─┬ ajv-formats@3.0.1
│ └── ajv@8.20.0 deduped
├─┬ ajv@8.20.0
│ ├── fast-deep-equal@3.1.3 deduped
│ ├── fast-uri@3.1.8 deduped
│ ├── json-schema-traverse@1.0.0 deduped
│ └── require-from-string@2.0.2 deduped
├── fast-deep-equal@3.1.3
├── fast-uri@3.1.8
├── json-schema-traverse@1.0.0
├── jsonc-parser@3.3.1
├── require-from-string@2.0.2
└── yaml@2.9.1
```

- **`ajv` único = 8.20.0**, satisfaciendo a la vez la `dependencies.ajv ^8.0.0` y la `peerDependencies.ajv ^8.0.0` (optional) de `ajv-formats@3.0.1` (dedupe, sin segunda versión).
- Edges de §14.3 respetados: N04→N06/N07/N08/N09 `^3.1.3`/`^3.0.1`/`^1.0.0`/`^2.0.2`, todos resueltos al nodo raíz exacto.
- **`fast-uri` = 3.1.8** (no `4.2.1`).
- N03 `@redocly/cli` sin dependencias/peer (coincide con la inspección del tarball).

## 5. Lock y resolución

`tools/goas/package-lock.json`, `lockfileVersion: 3`, 10 entradas. **Todos** los `resolved` de `node_modules/*` son `file:vendor/tarballs/<tarball>.tgz`; **cero** URLs `http(s)/git/ssh` (`grep` = 0). Cada entrada con `integrity` `sha512-…`.

| Hash | Valor |
|---|---|
| **`package-lock.json` SHA-256** | `486d24afc5f07f9ec1f1f06b8e5df47694bacd6202da20ac1a551775572e2e8b` |
| `package.json` SHA-256 | `bcd93c3a5706162b86d3a94c664f29f2d9ed24397b9942510b36978178693468` |
| `.npmrc` SHA-256 | `10436a4a3dc7705feea277ed0bb7791966338ce501db3dea1a8d692a89b65b59` |
| `.npmrc.user` SHA-256 | `196d61aa4795f5319c55dc2a44c276c420205eb6958053902e609a23e2428e05` |
| `.npmrc.global` SHA-256 | `55fad794e5bed7159ea5418f18e45f6f3be8fd1319424315a5764f0e00461ef9` |

## 6. Verificación SRI independiente (tarballs vs §14.2 vs lock)

Recómputo local SHA-512 de los 9 tarballs: **9/9 PASS**, bytes coincidentes con §14.2 y `integrity` del lock.

| ID | Paquete@versión | Ruta tarball | Bytes | SHA-256 |
|---|---|---|---|---|
| N01 | `yaml@2.9.1` | `vendor/tarballs/yaml-2.9.1.tgz` | 112114 | `4ef6c54cf559b8a207b7b518378230805a1c84af239b14960e8c67c7d59de5d3` |
| N02 | `jsonc-parser@3.3.1` | `vendor/tarballs/jsonc-parser-3.3.1.tgz` | 27354 | `4a0315b8671e7463bae7af7c142cdf19e9aa7ba39eb36dc2df383b8648e3cbc9` |
| N03 | `@redocly/cli@2.57.0` | `vendor/tarballs/redocly-cli-2.57.0.tgz` | 2820414 | `1bd67ffd126b063899629f13eccc8f772df3339f92640cc4968814acd0e021c0` |
| N04 | `ajv@8.20.0` | `vendor/tarballs/ajv-8.20.0.tgz` | 217611 | `b2f0b3a893bbb8cc5efb6814f08b1499e19e31d5dd73683f5893382f48f6e7b3` |
| N05 | `ajv-formats@3.0.1` | `vendor/tarballs/ajv-formats-3.0.1.tgz` | 15999 | `f4d6980fd367381fd29199066911e863db8d97496613b6c2c5b91563a150acc5` |
| N06 | `fast-deep-equal@3.1.3` | `vendor/tarballs/fast-deep-equal-3.1.3.tgz` | 3656 | `b019a0980f27638dc3f85836b0e478f188e00d7a6e5852c0819fa86f56e47b8f` |
| N07 | `fast-uri@3.1.8` | `vendor/tarballs/fast-uri-3.1.8.tgz` | 44269 | `86be033b406a7737c0521edc8fe3e15c7ac0cb6b5e509478cc9539a2efaa086c` |
| N08 | `json-schema-traverse@1.0.0` | `vendor/tarballs/json-schema-traverse-1.0.0.tgz` | 6074 | `023222622df29fc274bde5d3590e47aa1d4a8e3c1d6e2aba029948ed79799b21` |
| N09 | `require-from-string@2.0.2` | `vendor/tarballs/require-from-string-2.0.2.tgz` | 1816 | `cb694a4965908f7775a0c757f00cf4e624d193cd71d77988fbcca0f597b88d82` |

## 7. Egress y lifecycle

- **Egress: 0.** Logs npm sin `http fetch` contra registry. En `install --package-lock-only` npm registró `packumentCache … cache-miss` para los 4 transitivos de Ajv, pero **no hizo request** (offline) y los resolvió por los `file:` raíz. El lock resultante no contiene ninguna URL externa.
- **Lifecycle: 0.** `ignore-scripts=true` persistente; grep de logs sin `run-script`/`preinstall`/`postinstall`/`prepare`/`prepublish`/`prepack`. Scripts internos de los paquetes son publish-only y **no se ejecutaron**. No se invocó `@redocly/cli` ni `yaml` bin (los `.bin` symlinks se crearon, no se ejecutaron).

## 8. Tamaño

`node_modules` = `11918688` bytes (~11.4 MiB lógicos; 14M en bloques). Desglose: `@redocly/cli` 9.6M, `ajv` 2.4M, `yaml` 1.3M, resto < 400K.

## 9. Escaneo de secretos (gitleaks 8.30.1, acotado)

`gitleaks dir` sobre `package.json`, `package-lock.json` (forzado con nombre alterno: 4702 bytes), `.npmrc`, `.npmrc.user`, `.npmrc.global` y logs nuevos de install → **0 hallazgos**. Reportes JSON en `provenance/scans/`. **No** se escaneó `node_modules` ni se declara G-SCAN final.

## 10. Desviación de procedimiento (pre-flight) — reporte transparente

Durante la **inspección read-only previa al aislamiento** (consultas `npm config get/ls` para determinar qué aislar) npm, por diseño, escribió **6 archivos de log** en **`~/.npm/_logs/`** (timestamps `2026-10-06T04:17:02Z–04:17:03Z`), y su dir `~/.npm/_logs` actualizó mtime. No hubo egress, ni resolución de paquetes, ni instalación, ni ejecución; solo logging automático de npm de comandos de lectura.

- **El procedimiento de instalación propiamente dicho (lock + `ci`) usó únicamente config/cache/temp dentro de `tools/goas`** (confirmado en los debug logs: carga de `.npmrc`, `.npmrc.user`, `.npmrc.global`; logs en `tools/goas/.npm-cache/_logs`).
- No se tocó `~/.npmrc` (no existe), ni se instaló nada en HOME/global.
- Conforme al mandato «si modifica fuera `tools/goas`, DETENTE; no fallback»: **no se intentó fallback**; se detiene aquí cualquier paso adicional. **No** se borraron los logs de HOME (borrarlos sería otra modificación fuera de `tools/goas`). Decisión sobre este punto queda al humano.

## 11. Prohibiciones respetadas

- Sin Git, sin cambios a canónicos/plan/shared/pack, sin AWS/deploy, sin Task Decomposer/Executor.
- Sin ejecutar `@redocly/cli`, Java/JAR, parser ni G-OAS de prueba. JAR `openapi-generator-cli-7.25.0` **intacto, no invocado**.
- Sin instalación global/Registry global; sin redistribución (instalación local-only).
- No se declara G-OAS cerrado, ni `ready`, ni aprobación legal de licencias (hold N03 subsiste como riesgo residual de notices).

## 12. Pendientes (fuera de este alcance)

- Decisión sobre la desviación §10.
- Ejecución G-OAS (§6) y controles de capacidad/compatibilidad: **no realizados**.
- Runtime Java25/JBR25.0.3 para el generador: **no invocado**; sin cambio de sistema.
