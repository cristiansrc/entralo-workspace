# Reporte de captura de metadata npm — run 20261004T191337Z

## Alcance y límites respetados
- Exactamente 5 solicitudes GET HTTPS, una por URL autorizada.
- Sin seguimiento de redirects (`curl --max-redirs 0`, sin `-L`). No se observó ningún `Location`.
- Sin retries/backoff, sin otras URLs ni dominios.
- Sin descarga de tarballs, sin abrir `dist.tarball`, sin install/npm/npx/build, sin validación G-OAS, sin git.
- Límites: máx. 10 MiB por body, 50 MiB total, 30 s por request. Cumplidos.
- No había evidencia previa en `vendor/metadata/` ni en `provenance/`; no se sobrescribió nada.

## URLs solicitadas y resultado
| Paquete | URL solicitada | HTTP | Redirect | Location | Transcurrido (s) | Bytes |
|---|---|---|---|---|---|---|
| yaml | https://registry.npmjs.org/yaml | 200 | no | — | 0.392 | 386415 |
| jsonc-parser | https://registry.npmjs.org/jsonc-parser | 200 | no | — | 0.379 | 102715 |
| @redocly/cli | https://registry.npmjs.org/@redocly%2Fcli | 200 | no | — | 0.768 | 2458147 |
| ajv | https://registry.npmjs.org/ajv | 200 | no | — | 0.932 | 1142658 |
| ajv-formats | https://registry.npmjs.org/ajv-formats | 200 | no | — | 0.146 | 141264 |

Total bodies: 4.231.199 bytes (~4,03 MiB) — bajo el límite de 50 MiB.

## Evidencia por captura (UTC / SHA-256 / tamaño)
| Body path (relativo a `tools/goas/`) | UTC | SHA-256 | Bytes |
|---|---|---|---|
| vendor/metadata/npmjs-yaml.20261004T191337Z.json | 2026-10-04T19:14:06Z | ad712932fc55443ad3c4e4033717553f8a90814f9eee776a706d852375dce964 | 386415 |
| vendor/metadata/npmjs-jsonc-parser.20261004T191337Z.json | 2026-10-04T19:14:06Z | fc60fa698bcffe094f5c6ccf9d47fca18d236c3135020fe362b0dfb6cab490a3 | 102715 |
| vendor/metadata/npmjs-redocly-cli.20261004T191337Z.json | 2026-10-04T19:14:07Z | d0047d7f8b4b522f99ea9a2c5cce043105f7829f87f15a31c0857723bddaf759 | 2458147 |
| vendor/metadata/npmjs-ajv.20261004T191337Z.json | 2026-10-04T19:14:08Z | 799734d4d891f673173149e92d3a25bfb8c25d24ced218f4e839c83757cfc238 | 1142658 |
| vendor/metadata/npmjs-ajv-formats.20261004T191337Z.json | 2026-10-04T19:14:08Z | f29397500377fbca77948d710f7434fd3d190fe2c29ab5eb46f20d69b4400816 | 141264 |

Cabeceras HTTP crudas: `provenance/headers-<pkg>.20261004T191337Z.txt` (hash en `manifest-20261004T191337Z.sha256`).
Log de ejecución: `provenance/fetch-20261004T191337Z.log`.
Análisis estructurado: `provenance/analysis-npm-metadata.20261004T191337Z.json`.

## Candidatos `latest stable` (preliminar, NO closure verificado)
| Paquete | dist-tags.latest | ¿prerelease? | engines declarados | Dependencias declaradas | dist.integrity (dato) |
|---|---|---|---|---|---|
| yaml | 2.9.1 | no | node >= 14.6 | ninguna | sha512-3NxN8+78... |
| jsonc-parser | 3.3.1 | no | ausente | ninguna | sha512-HUgH65Ky... |
| @redocly/cli | 2.57.0 | no | npm >=10, node >=22.12.0 \|\| >=20.19.0 <21.0.0 | ninguna | sha512-1d5fVyUa... |
| ajv | 8.20.0 | no | ausente | fast-deep-equal ^3.1.3, fast-uri ^3.0.1, json-schema-traverse ^1.0.0, require-from-string ^2.0.2 | sha512-Thbli+Ol... |
| ajv-formats | 3.0.1 | no | ausente | ajv ^8.0.0 (también peer, optional) | sha512-8iUql50E... |

- `dist.tarball` registrados como datos, NO accedidos (ver analysis JSON).
- `engines` ausente = compatibilidad NO declarada (jsonc-parser, ajv, ajv-formats).
- Base local: Node 26.7.0 / npm 11.19.0 sobre Linux Arch/Omarchy x86_64 glibc 2.44. Cumple lo declarado por yaml y @redocly/cli; sin declaración para el resto.

## Pendiente de autorización (transitivos; NO consultados)
- https://registry.npmjs.org/fast-deep-equal
- https://registry.npmjs.org/fast-uri
- https://registry.npmjs.org/json-schema-traverse
- https://registry.npmjs.org/require-from-string
- ajv ya capturado en este run (dependencia/peer de ajv-formats).

## Unknowns
- Transitivos de segundo nivel de las cuatro dependencias de ajv.
- Compatibilidad real (no declarada) de jsonc-parser, ajv y ajv-formats en el entorno base.
- Si @redocly/cli 2.57.0 empaqueta dependencias (bundle) o realmente no las requiere.
- Integridad real de tarballs (no descargados); los SHA del JSON son datos declarados, no verificación.

## Estado del análisis de versiones
**Candidato preliminar de `latest stable`** derivado de `dist-tags.latest` + campo declarado. **NO es compatibilidad verificada** ni closure de dependencias. No se reporta ni declara cierre G-OAS.
