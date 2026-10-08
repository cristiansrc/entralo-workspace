# Plan condicionado de tooling G-OAS — entralo-v1-executable-specs

Lifecycle status: `planning`. Actualización: 2026-10-06 (§16). Autor: Planner. Carril: `feature`. Spec Validator `verdict: none`.
**Estado: bloqueado para preparación efectiva/corrida; diseño documental únicamente.** No aprobación de implementación, cierre de gate ni resultado de validación.

**Prelación documental D-J25-01 — 2026-10-04, posterior a pack #31:** permiso literal «apruebo la actualizacion de la sfuentes canonicas a java 25 lts» (mensaje/pack #31) para sincronizar canónicos, no ejecutar tooling/producto. [Master§6.1](../increments/entralo-v1-executable-specs/master-spec.md#61-d-j25-01--target-documental-y-matriz-de-adopción-pendiente) y ADR-006 fijan ahora target documental backend **Java25 LTS + Kotlin/Spring Boot4.1.1 en ECS Fargate, propuesto/pendiente de validación**. Las referencias backend **Java21 de §§9/10** describen el **corte histórico anterior**, no runtime vigente, build/toolchain local ni requisito del Generator; quedan conservadas, no reescritas. Esta nota prevalece únicamente en target producto: evidencia/capturas/pins/runtime PC/permisos de aquellos cortes intactos. Boot4.1.1 Java17–26 incluye25 sólo framework; stack/imagen/ECS sin demostrar, JDK build/toolchain/API/bytecode/runtime separados, sin autoelevar release/jvmTarget. Java21 referencia previa/candidato continuidad-rollback por verificar; **Java26 del Generator G-OAS local no es runtime producto**, ni se transfiere su JAR/JRE/deps/salidas locales al producto. Generación/empaquetado contractual autorizado preservados. React/Vercel sin cambio. [SA Java25 ronda2](entralo-v1-executable-specs-java25-sa-review.md) aprobó sólo diseño del borrador, no firma este plan. G-OAS/BOOTSTRAP/VALIDATOR/HUMAN-CONTRACT abiertos; sin nuevas descargas/instalaciones/red/config/runtime/deploy ni ready. Único delta en este plan: esta nota de prelación; resto son registros de sus cortes.

**Estado vigente de esta propuesta — delta de inventario y ambiente 2026-10-04 (§10, sobre §9 y pack refresh #22):** lifecycle `draft`, Spec Validator `verdict: none`, **G-OAS abierto**. Preferencia aprobada: **última estable sólo después de verificar metadata, integridad y compatibilidad, con lock exacto reproducible**. Los pins anteriores son referencias históricas, no selección actual. **Node 26.7.0 vía mise, npm 11.19.0 y pnpm 12.3.4 ya están presentes en el PC según el resultado DevOps aportado por el usuario: no instalar ni actualizar esos runtimes/gestores en este alcance.** §10 prevalece sobre las menciones anteriores de runtime desconocido o distribución nueva necesaria y delimita paquetes/fuentes candidatas, no permisos de acceso. No se sustituyen metadata #19 ni gates canónicos. Tooling local PC, backend AWS y frontends Vercel son ámbitos distintos; runtime efectivo de Vercel pendiente de verificar.

**Actualización de evidencia SA 2026-10-03:** informe nuevo `I/solution-architect-rereview-2026-10-03.md` leído, `approved` sólo para SA-F01…07/10 y D-N1-01/N2–N6. Condiciones nuevas §6.1 persistidas; la respuesta histórica no recuperada **ya no bloquea ese scope**. P04/HC/residuales G-SA y todos los permisos/controles técnicos siguen separados. El corte de reconciliación previo siguiente es histórico en cuanto a estado SA; no es autorización de red/tooling.

**Reconciliación documental 2026-10-03 con el shared actualizado:** la etapa A fue confirmada y **completada por el agente DevOps (`devops-architect`)**: cuatro GET de metadata, HTTP 200, sin redirects. **Autorización consumida; no habilita nuevas solicitudes ni repetición.** §3.1 registra exclusivamente resultados transcritos en el shared; no se consultan URLs ni se recalculan hashes en esta sesión. Tarballs, transitivos, instalación, scripts y validación siguen **NO autorizados** y requieren nueva propuesta y confirmación humana. Sólo se actualiza este plan; shared, pack, contratos y registros canónicos/gates permanecen intactos. **G-OAS abierto; G-SA formal `changes-required` / registro `pending` (pendiente), condiciones no verificables; lifecycle `planning`, `verdict: none`.**

**Actualización de evidencia 2026-10-04 (§3.1.1):** nueva autorización humana verbatim **«si dale»**, cubierta **sólo cuatro GET** de metadata de los mismos cuatro pins, ejecutados por el agente DevOps (`devops-architect`): 4/4 `HTTP 200`, **0 redirects**, **sin `Location`**, URLs exactamente las de §3.1. Aporta los valores literales de `repository`, `engines` y `dist.tarball` que el corte 2026-10-03 registraba como vacío; **§3.1 se conserva íntegra como registro histórico** y §3.1.1 declara qué vacío queda sustituido. SHA-256 de los cuatro bodies **idénticos a la captura 2026-10-03** = **coincidencia de captura**, no autenticidad/procedencia ni integridad de tarballs. **Autorización de estos GET consumida; ninguna solicitud o descarga posterior autorizada.** Sin tarballs, transitivos, instalación, ejecución, G-OAS, contratos ni Git; evidencia previa estuvo en `/tmp/opencode/devops-b/` (fuera del repo). Lifecycle `planning`, `verdict: none`, G-OAS abierto.

**Actualización de evidencia 2026-10-04 (§11):** transcripción durable de una **captura ya ejecutada bajo autorización humana** sobre las **cinco URLs M-CORE de §10.3** (run `20261004T191337Z`; artefactos en `tools/goas/vendor/metadata/` y `tools/goas/provenance/`, sin nuevas peticiones de red): **5/5 `HTTP 200`, cero redirects, sin cabecera `Location`, una sola solicitud por URL**, con SHA-256 completos y bytes exactos transcritos de los artefactos de custodia del run (manifiesto, reporte y análisis). Sección **noncanonical / WIP**. Resultados `latest stable` **preliminares** (yaml `2.9.1`, jsonc-parser `3.3.1`, @redocly/cli `2.57.0`, ajv `8.20.0`, ajv-formats `3.0.1`) = **candidatos para resolución, no compatibilidad verificada ni closure**; `engines` ausente en jsonc-parser/ajv/ajv-formats = **compatibilidad no declarada**. Las cuatro URLs transitivas figuran **pendientes y no autorizadas aún**. Sin tarballs, instalación, scripts ni corrida G-OAS; **G-OAS abierto**; pins históricos §3.1/§3.1.1 **conservados sin sustitución destructiva**.

**Actualización de evidencia 2026-10-04 (§12):** transcripción durable de la **captura metadata transitiva ya ejecutada** sobre las **cuatro URLs de las dependencias de `ajv@8.20.0`** (run `20261004T194645Z`; artefactos ya custodiados en `tools/goas/vendor/metadata/` y `tools/goas/provenance/`, **sin ninguna petición de red nueva en esta sesión**): **4/4 `HTTP 200`**, UTC **`19:46:45Z`–`19:46:46Z`**, **cero redirects, sin cabecera `Location`, una solicitud por URL, sin retries/backoff**, con **bytes y SHA-256 completos leídos del manifest local**. Candidatos contra los rangos literales de `ajv@8.20.0`: `fast-deep-equal 3.1.3` (`^3.1.3`), `fast-uri 3.1.8` (`^3.0.1`; **no** se sigue `dist-tags.latest 4.2.1`, fuera de rango), `json-schema-traverse 1.0.0` (`^1.0.0`), `require-from-string 2.0.2` (`^2.0.2`). **Ninguno de los cuatro declara nuevas runtime/peer/optional dependencies → este frente de 4 nodos no aporta URLs nuevas**; **closure global NO declarada** (bundle de `@redocly/cli` sin inspeccionar y generador no resuelto). Sección **noncanonical / WIP**. **Sin** compatibilidad `engines` verificada, **sin** lock cerrado, **sin** integridad de tarballs, **sin** autenticidad, **sin** instalación y **sin** corrida G-OAS; **G-OAS permanece abierto**; lifecycle `planning`/`draft`, `verdict: none`. **Autorización de estos cuatro GET consumida y no ampliada.** §11.4 y la última línea de §11 («pendientes y no autorizadas aún») quedan **históricas** respecto de este frente.

## 1. Alcance, autoridad y evidencia de lectura

Raíz activa: `/mnt/data/Shares/Projects/entralo-workspace`. En las citas siguientes, `I/` significa `docs/specs/increments/entralo-v1-executable-specs/`; `W/` significa `docs/specs/.working/` bajo esa raíz. Alias `pack`/`shared` = `W/entralo-v1-executable-specs-planning-context.md`/`W/entralo-v1-executable-specs-sdd-context.md`; `matriz` = `I/fixtures/contratos/schema-cases.v1.json`; `MP README` = `I/fixtures/mercado-pago/README.md`.

- Solicitud actual: actualizar **exclusivamente este artefacto de trabajo** con el shared y los resultados de los cuatro GET ya autorizados; sin red, descargas, instalación, scripts, validación ni cambios canónicos. No autoriza al Planner a preparar tooling ni a repetir la etapa A. [solicitud humana actual; shared:§Etapa A ejecutada,§Next action,§Vacíos y conflictos]
- Pack leído: refresh #12, `incomplete`, **stale** respecto a la ejecución de etapa A: todavía dice que los cuatro GET no se realizaron y que falta identidad nominal. Para esos puntos se lee la sección exacta del shared actualizado, que registra ejecución e identidad; no se reescribe el pack ni se utiliza su handoff obsoleto. Refresh dirigido a context-curator pendiente, no despachado en esta sesión. Sin manifests/config, Graphify inactivo y sin task board según evidencia curator heredada, no nueva detección. [pack:7–11,§Conflicts and open questions,§Next handoff; shared:26–46,84,144,167–169]
- Política normativa única: `I/api-lint-policy.md`; este plan no la sustituye. Parse/lint/bundle, refs offline, Draft 2020-12, formatos y resultados por caso siguen pendientes. [I/api-lint-policy.md:15–40; I/gate-register.md:10,43–46,54–60]
- Master §12 preserva las disposiciones G-OAS; §13 gobierna N1. No se prueba venta durable, importes, firma/inbox ni compatibilidad de generación mediante validación de schemas. [I/master-spec.md:193–223; I/api-lint-policy.md:21–23,48–52]
- Ampliaciones dirigidas para resolver el diseño del adaptador y los controles: matriz real y `schema_ref`, polaridad MP y schema autoritativo, formatos/refs/condicionales. [I/fixtures/contratos/schema-cases.v1.json:3–31; I/fixtures/mercado-pago/README.md:7–27; I/api/common.yaml:179–263; I/events/integration-envelope.v1.schema.json:2–3,21,25–35,57–63]
- Evidencia histórica de la revisión anterior: `docs/specs/workspace_changes.md` devolvió `File not found`; no se vuelve a comprobar ni se infiere un cambio global. En esta sesión las lecturas/búsqueda local se limitan a `.working/`; no se ejecutan Graphify, Git, hashes, instalación o scan. El informe externo de corrida se referencia vía shared/pack, no se relee ni recertifica.

Documento de trabajo fuera de `I/`: no añade un artefacto al conjunto canónico de 44 rutas. No crea otro shared context, task board, configuración, código ni tests. No modifica endpoints, DTOs, tablas, migraciones, integraciones ni decisiones de negocio. G-SCAN y G-API-GOV quedan fuera del trabajo actual.

## 2. Decisiones y bloqueos de autorización

| ID | Decisión / alternativas descartadas | Criterio de aceptación y estado |
|---|---|---|
| D-T01 | Motor propuesto: Redocly CLI para lint/bundle, no validador de payload ni generador. No reemplazarlo silenciosamente por otro motor con suppressions más amplias. | Motor local con versión exacta, reglas activas y mapping archivo/regla/pointer corroborados en documentación offline de esa versión. **Metadata del pin reportada; paquete, capacidades y preparación pendientes, no autorizados.** |
| D-T02 | Motor propuesto: Ajv 2020 + ajv-formats en modo completo para schemas y formatos. Parse YAML/JSON independiente y rechazo de duplicate keys antes de los motores. No usar format como mera anotación ni convertir OpenAPI a 3.0. | Compila los cinco schemas 2020-12; registra opciones y rechaza controles inválidos por `format`; conserva nulls/condicionales. **No ejecutado.** |
| D-T03 | Toolchain privado dentro del workspace; fuentes canónicas read-only; bundles y evidencia fuera del repo. No instalación global, npx, caché de usuario ni Docker. | Todas las rutas de preparación resueltas permanecen dentro de la raíz, sin symlinks a HOME; evidencias/bundles en destino externo autorizado. **Sólo ubicación propuesta.** |
| D-T04 | **Precedencia resuelta para esta fase:** solicitud humana actual = reconciliación documental; etapa A consumida por DevOps. L44 sigue prohibiendo instalación/scripts por Planner. No hay autorización implícita para ejecución ni delta de L44. | Esta sesión sólo escribe este plan. **Preparación efectiva bloqueada** hasta nueva confirmación de owner/alcance; si se pide cambiar L44, requiere autorización expresa de delta contractual y se conservan los límites del rol Planner. [shared:§Etapa A ejecutada,§Aclaraciones del usuario; I/gate-register.md:44, referencia heredada] |
| B-T01 | **Blocked para alcances posteriores: closure sin corroborar y adquisición posterior sin confirmar.** Etapa A **confirmada/completada**, no pendiente. §3 registra metadata, no concede permisos adicionales. Kit offline completo sigue siendo alternativa. | Toda nueva request, transitivo, tarball, inventario/lock o instalación exige propuesta y confirmación humana nuevas; inventario exacto y lock revisados antes de adquirir closure. En esta sesión, cero requests y cero instalación. [shared:26–46,144; este plan:§3.1–§3.5] |
| B-T02 | **Blocked: owner/alcance de preparación posterior no confirmados.** El ejecutor efectivo de A está identificado como DevOps; ese mandato no se extiende a otras fases. Mantener L44, no reinterpretar «preparar» como permiso de scripts por Planner. | Nueva confirmación del responsable y límites de cada fase posterior (§3.5), distinto de Planner; sin dispatch a Decomposer/Executor ni Architect Executor desde este plan. Si contradice canónicos, delta autorizado antes de actuar. |
| B-T03 | **Dependencia de evidencia perdida sustituida para scope revisado; G-SA global residual.** Firma nueva `approved` de diseño SA-F01…07/10 y D-N1-01/N2–N6, no ratificación histórica. | Informe nuevo §§1/3/6.1/7 con rol/fecha/alcance/condiciones y limitación hash explícita, leído en disco; Master§14 y gates lo registran. P04/HC completos y residuales fuera de firma pendientes; conservar condiciones y verificar snapshot técnico antes de freeze. No habilita preparación ni corrida sin permisos separados. |

El plan es deliberadamente condicionado, no listo para implementar. No introduce bypass/deuda técnica: conserva bloqueos. No se envía a Task Decomposer/Executor ni se añade `Human Plan Approval`.

## 3. Ubicación, pins y adquisición

**Ruta propuesta, no creada:** `tools/goas/` bajo la raíz activa, aislada del futuro bootstrap de producto. En ella: manifest y lock npm propios, dependencias locales, documentación offline de las versiones, configuración lint y allowlist estrecha, eventual adaptador de validación, caché y temporales privados. Un aporte offline se deposita primero en `tools/goas/vendor/` por su owner autorizado, no por esta sesión. No manifest npm en raíz, configuración CI, Gradle ni runtime de aplicación.

| Componente | Pin de diseño (metadata reportada, no instalado) | Evidencia exigida antes de preparar |
|---|---|---|
| `@redocly/cli` | `2.57.0` | GET metadata HTTP 200 reportado en §3.1; paquete íntegro, engines y documentación de lint/bundle/ignore de esa versión aún pendientes. |
| `ajv` | `8.17.1` | GET metadata HTTP 200 reportado en §3.1; export/motor Draft 2020-12, metschemas locales y compatibilidad con runtime aún pendientes. |
| `ajv-formats` | `3.0.1` | GET metadata HTTP 200 reportado en §3.1; compatibilidad con Ajv y modo completo/formatos uuid/date-time aún pendientes. |
| `yaml` | `2.8.1` | GET metadata HTTP 200 reportado en §3.1; API/documentación local y límites de aliases aún pendientes. JSON requiere rechazo explícito de claves repetidas, no JSON.parse solo. |
| Node / npm | `26.7.0` / `11.19.0` | Baseline reportada por pack, no verificada hoy. Registrar ruta/versión real y engines de toda la closure; incompatibilidad bloquea, no actualizar runtime por cuenta propia. [pack:63] |

No rangos `^`, `~`, `latest`, resolución oportunista ni CLI de paquetes desde PATH global. Node/npm existentes sólo pueden usarse mediante ruta real identificada y versión corroborada; no se instalan globalmente. Se exigirán lockfile completo con versiones transitivas e `integrity`, y SHA-256 de binarios/paquetes, lock, configs, adaptador y documentación local en fases posteriores autorizadas. **La respuesta de metadata de cada pin está reportada; eso no acredita bytes de paquetes, compatibilidad, procedencia independiente ni closure/pinning reproducible.** Cambiar cualquier pin requiere registrar motivo y revisar este plan, nunca instalar un reemplazo silencioso.

**Alternativa offline conservada:** aporte trasladado al workspace con todos los paquetes transitivos necesarios (incluidas dependencias opcionales aplicables a Linux), lock reproducible, checksums, metadata engines/licencias y documentación local. Registrar origen, fecha, owner y método de verificación del aporte. Un hash sin procedencia no certifica autenticidad. Caché vacía/incompleta, discrepancia integrity, fuente faltante o provenance no verificable → bloqueo, no fallback de red. Preparación offline con scripts de instalación deshabilitados; si un paquete necesita un lifecycle script, detener y pedir aprobación específica, no reactivarlo globalmente.

**Vía de red: etapa A autorizada y consumida; resto NO autorizado.** DevOps realizó únicamente los cuatro GET de metadata (§3.1); este plan no habilita repetición, transitivos, tarballs ni acceso a fuentes de documentación. Instalación, preparación de scripts/config y corrida requieren mandatos nuevos y separados, por responsable no Planner. No descargas de runtime, JAR, Docker, credenciales ni telemetría. La futura validación contractual permanece offline. Sin lock/closure e integridad de paquetes corroborados no se declara pinning reproducible. [shared:26–46,60–64,144]

**AC-T03:** manifest/lock/configs reproducibles, closure íntegra y rutas privadas acreditadas antes de corrida; ningún acceso a `~/.npm/_npx`, npm global, caché del usuario ni escritura en fuentes. No se afirma cumplido.

### 3.1 Metadata reportada de los cuatro pins y límites de evidencia

**Fuente leída en esta sesión:** `W/entralo-v1-executable-specs-sdd-context.md`, sección `## Etapa A ejecutada — 4 GET de metadata (agente DevOps, 2026-10-03)` (L26–L46). Registra resultados del agente `devops-architect`; sesión origen `ses_efbd0785dffeu6rRzm2RUxiYWP`, salida `prt_1042fd09e001onp5C1zTuKQSWW` **externas al workspace, no consultadas aquí**. Es transcripción trazable, no una nueva verificación HTTP, de cuerpos o de autenticidad del publisher.

**Resultado común reportado:** 4/4 GET `HTTP 200`, `num_redirects=0`, sin cabecera `Location`, `url_effective` igual a URL solicitada, `curl_exit=0`, `errormsg` vacío y `content-type: application/json`. Tres consultas a `2026-10-03T23:53:25Z`; `yaml` a `2026-10-03T23:53:26Z`. **No tarballs ni paquetes/scripts ejecutados.** [shared:30–32]

| Pin / `name` · `version` reportados | URL exacta del GET completado | Timestamp UTC | HTTP / redirects | SHA-256 del body recibido | Bytes reportados |
|---|---|---|---|---|---|
| `@redocly/cli` · `2.57.0` | `https://registry.npmjs.org/@redocly%2Fcli/2.57.0` | `2026-10-03T23:53:25Z` | `200` / `0` | `a44b7eba5405283b5c7162f1974c4b864013107058e620b1da40b919a3b8384d` | 2447 |
| `ajv` · `8.17.1` | `https://registry.npmjs.org/ajv/8.17.1` | `2026-10-03T23:53:25Z` | `200` / `0` | `304fd07120cb2a8e16a5589bfd921fd54cc8e4a793e929e32a76a2e57cd29823` | 4717 |
| `ajv-formats` · `3.0.1` | `https://registry.npmjs.org/ajv-formats/3.0.1` | `2026-10-03T23:53:25Z` | `200` / `0` | `4285e5c887c98572f0aef6736cc2908e68c0f7a4656292b3004d3ddb6b8420d1` | 2525 |
| `yaml` · `2.8.1` | `https://registry.npmjs.org/yaml/2.8.1` | `2026-10-03T23:53:26Z` | `200` / `0` | `fb67dccf1f97e7f3974f82e48b2cd5380ef8a3d5c7c524199c465e4d4f9e5b75` | 3688 |

| Pin | `dist.integrity` SRI SHA-512 leído como dato de metadata, **no comparado con tarball** |
|---|---|
| `@redocly/cli@2.57.0` | `sha512-1d5fVyUaYlMNgCHUoyE2vUyxBhs/jmOHgsX/kFmfWzESw4f/G/OV/SU9E55rU7aUNmw9rHj1vXmL6yUdIn+KKQ==` |
| `ajv@8.17.1` | `sha512-B/gBuNg5SiMTrPkC+A2+cW0RszwxYmn6VYxB/inlBStS5nx6xHIt/ehKRhIMhqusl7a8LjQoZnjCs5vhwxOQ1g==` |
| `ajv-formats@3.0.1` | `sha512-8iUql50EUR+uUcdRQ3HDqa6EVyo3docL8g5WJ3FNcWmu62IbkGUue/pEyLBW8VGKKucTPgqeks4fIU1DA4yowQ==` |
| `yaml@2.8.1` | `sha512-lcYcMxX2PO9XMGvAJkJ3OsNMw+/7FKes7/hgerGUYWIoWu5j/+YQqcZr5JnPZWzOsEBgMbSbiSTn/dv/69Mkpw==` |

Ambas tablas reproducen **shared L35–L42**, sin calcular hashes. SHA-256 corresponde al **body de esa captura** (curl sin `Accept-Encoding`, JSON sin comprimir); no es hash de tarball, lock ni manifiesto y puede variar con otra captura/encoding o cambios de campos del registry.

**Vacío explícito de metadata — `Blocked: metadata fields evidence unavailable`:** el shared **no transcribe valores literales** de `repository`, `engines` ni URLs `dist.tarball` para ninguno de los cuatro pins. Registra que `dist.tarball` sólo se leyó como campo JSON, no se descargó. No se equiparan URLs de proyecto/tarball candidatas de la tabla siguiente a valores recuperados, ni se interpreta la falta de transcripción como `engines` ausente/null. Se requiere aporte literal del reporte existente por DevOps/humano antes de registrar esos campos como metadata real o evaluar compatibilidad. Sin nuevas GET ni reconstrucción por memoria. [shared:32,35–46; búsqueda local dirigida en `.working/`]

| Pin | `repository` real transcrito | `engines` real transcrito | `dist.tarball` real transcrito / adquisición |
|---|---|---|---|
| `@redocly/cli@2.57.0` | No disponible en shared | No disponible en shared | Valor no disponible; leído como dato según reporte, **no descargado** |
| `ajv@8.17.1` | No disponible en shared | No disponible en shared | Valor no disponible; leído como dato según reporte, **no descargado** |
| `ajv-formats@3.0.1` | No disponible en shared | No disponible en shared | Valor no disponible; leído como dato según reporte, **no descargado** |
| `yaml@2.8.1` | No disponible en shared | No disponible en shared | Valor no disponible; leído como dato según reporte, **no descargado** |

**Custodia y límites:** el shared reporta temporales borrados (`temp_removed=yes`), sin cuerpos/headers persistidos; sólo `run.ZZOaaG/` vacío bajo el destino temporal reportado. No se afirma que se guardaron cuerpos en `tools/goas/` ni que se pueda recalcular sus hashes hoy. Si la sesión origen deja de estar disponible: `Blocked: verification evidence unavailable`; no reconstruir ni repetir GET sin permiso nuevo. `scripts` reportado `null` para Redocly y presente en los otros tres, incluidos `prepublish`/`prepublishOnly` entre otros; **lectura únicamente, no ejecución**. La etapa A está completada como alcance de solicitudes, **no** como cumplimiento del objetivo original de custodia/metadata completa. [shared:33,42–46]

**Referencias candidatas conservadas para revisión futura:** no son resultados de los GET ni destinos autorizados actualmente.

| Paquete / pin | URL metadata (GET ya consumido) | Tarball candidato, **NO confirmado como `dist.tarball` / NO descargado** | Fuente candidata para cotejar identidad/documentación, **NO consultada** |
|---|---|---|---|
| `@redocly/cli@2.57.0` | `https://registry.npmjs.org/@redocly%2Fcli/2.57.0` | `https://registry.npmjs.org/@redocly/cli/-/cli-2.57.0.tgz` | `https://redocly.com/docs/cli/` · `https://github.com/Redocly/redocly-cli` |
| `ajv@8.17.1` | `https://registry.npmjs.org/ajv/8.17.1` | `https://registry.npmjs.org/ajv/-/ajv-8.17.1.tgz` | `https://ajv.js.org/` · `https://github.com/ajv-validator/ajv` |
| `ajv-formats@3.0.1` | `https://registry.npmjs.org/ajv-formats/3.0.1` | `https://registry.npmjs.org/ajv-formats/-/ajv-formats-3.0.1.tgz` | `https://ajv.js.org/packages/ajv-formats.html` · `https://github.com/ajv-validator/ajv-formats` |
| `yaml@2.8.1` (pin ya propuesto, conservado) | `https://registry.npmjs.org/yaml/2.8.1` | `https://registry.npmjs.org/yaml/-/yaml-2.8.1.tgz` | `https://eemeli.org/yaml/` · `https://github.com/eemeli/yaml` |

**Dominio mínimo de una posible adquisición futura:** `registry.npmjs.org`, HTTPS TCP 443, limitado a URLs exactas de un inventario que se proponga y confirme nuevamente. Los cuatro paths metadata anteriores son permiso **ya consumido**, no autorización abierta de host; los tarballs candidatos tampoco están autorizados. Propuestas de fuentes npm para el método: `https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json` (lock/integrity), `https://docs.npmjs.com/cli/v11/using-npm/registry` (registry) y `https://docs.npmjs.com/about-registry-signatures` (firmas del registry). **No consultadas ni autorizadas para acceso en este paso.**

`redocly.com`, `ajv.js.org`, `eemeli.org`, `github.com` y `docs.npmjs.com` son referencias de cotejo/documentación, **no destinos de descarga aprobados ni parte del alcance mínimo**. Documentación específica de versión se obtiene preferentemente del contenido del paquete/kit offline. Si ese material no basta para acreditar una capacidad, registrar el vacío y pedir un alcance adicional con URLs concretas; no consultar las páginas ni seguir enlaces implícitamente. No suponer que documentación pública actual describe exactamente estos pins.

### 3.1.1 Delta 2026-10-04 — segunda captura de los cuatro GET y campos literales aportados

**Autorización humana 2026-10-04, verbatim «si dale»:** cubrió **exclusivamente los cuatro GET** de §3.1, sobre **las mismas URLs exactas del plan**, ejecutados por el agente DevOps (`devops-architect`). **Consumida con estos cuatro GET; no se autoriza ninguna solicitud o descarga posterior.** Transcripción documental desde el shared (sección `## Delta 2026-10-04`); en esta sesión no se ejecuta ninguna petición, descarga ni cálculo.

**Resultado reportado:** 4/4 GET `HTTP 200`, **0 redirects** (`num_redirects=0`), **sin cabecera `Location`**. Horas UTC reportadas: Redocly `06:34:32Z`; `ajv` `06:34:32–06:34:33Z`; `ajv-formats` `06:34:33Z`; `yaml` `06:34:33Z`. URLs: Redocly `https://registry.npmjs.org/@redocly%2Fcli/2.57.0`; los otros tres `https://registry.npmjs.org/{ajv|ajv-formats|yaml}/{version}` — **exactamente las de la tabla §3.1, sin variación de host/path.**

| Pin · `version` | URL exacta (GET) | Timestamp UTC reportado | HTTP / redirects / `Location` | SHA-256 del body | `content-length` |
|---|---|---|---|---|---|
| `@redocly/cli` · `2.57.0` | `https://registry.npmjs.org/@redocly%2Fcli/2.57.0` | `06:34:32Z` | `200` / `0` / ausente | `a44b7eba5405283b5c7162f1974c4b864013107058e620b1da40b919a3b8384d` | 2447 |
| `ajv` · `8.17.1` | `https://registry.npmjs.org/ajv/8.17.1` | `06:34:32–06:34:33Z` | `200` / `0` / ausente | `304fd07120cb2a8e16a5589bfd921fd54cc8e4a793e929e32a76a2e57cd29823` | 4717 |
| `ajv-formats` · `3.0.1` | `https://registry.npmjs.org/ajv-formats/3.0.1` | `06:34:33Z` | `200` / `0` / ausente | `4285e5c887c98572f0aef6736cc2908e68c0f7a4656292b3004d3ddb6b8420d1` | 2525 |
| `yaml` · `2.8.1` | `https://registry.npmjs.org/yaml/2.8.1` | `06:34:33Z` | `200` / `0` / ausente | `fb67dccf1f97e7f3974f82e48b2cd5380ef8a3d5c7c524199c465e4d4f9e5b75` | 3688 |

**Campos literales aportados por este delta.** Sustituyen el vacío de §3.1 como **estado vigente** para `repository`, `engines` y `dist.tarball`; el vacío de §3.1 (tabla «No disponible en shared») **se conserva sin alteración** como registro del corte 2026-10-03.

| Pin | `repository` reportado | `engines` reportado | `dist.tarball` reportado / adquisición |
|---|---|---|---|
| `@redocly/cli@2.57.0` | `{ "url": "git+https://github.com/Redocly/redocly-cli.git", "type": "git" }` | `{ "npm": ">=10", "node": ">=22.12.0 || >=20.19.0 <21.0.0" }` | `https://registry.npmjs.org/@redocly/cli/-/cli-2.57.0.tgz` — campo JSON leído, **no descargado** |
| `ajv@8.17.1` | `{ "url": "git+https://github.com/ajv-validator/ajv.git", "type": "git" }` | **ausente en el JSON (no `null`)** | `https://registry.npmjs.org/ajv/-/ajv-8.17.1.tgz` — campo JSON leído, **no descargado** |
| `ajv-formats@3.0.1` | `{ "url": "git+https://github.com/ajv-validator/ajv-formats.git", "type": "git" }` | **ausente (no `null`)** | `https://registry.npmjs.org/ajv-formats/-/ajv-formats-3.0.1.tgz` — campo JSON leído, **no descargado** |
| `yaml@2.8.1` | `{ "url": "git+https://github.com/eemeli/yaml.git", "type": "git" }` | `{ "node": ">= 14.6" }` | `https://registry.npmjs.org/yaml/-/yaml-2.8.1.tgz` — campo JSON leído, **no descargado** |

**Límites de evidencia de este delta:**

- Son **valores reportados por el agente DevOps** y transcritos aquí. Los cuatro SHA-256 **son idénticos a los de la captura 2026-10-03**: eso registra **coincidencia de captura**, **no** autenticidad ni procedencia del publisher y **no** integridad de tarballs (ningún `.tgz` fue solicitado).
- **No se afirma metadata, compatibilidad ni capacidades de los paquetes más allá de lo consultado:** únicamente `repository`, `engines`, `dist.tarball`, SHA-256 y `content-length` del body. `engines` ausente en `ajv` y `ajv-formats` se registra como **ausencia de campo**, no como «sin restricciones» ni como compatibilidad con el runtime; no se evaluó compatibilidad de ningún paquete.
- **Fuera de alcance y sin autorizar:** tarballs, transitivos, instalación, ejecución, corrida G-OAS, contratos y Git. Evidencia previa (captura 2026-10-03) estuvo en `/tmp/opencode/devops-b/`, **fuera del repo**; **la transcripción documental vuelve durable la información, no los cuerpos originales.**
- Lifecycle `planning`, `verdict: none`, **G-OAS abierto**. §3.1 (2026-10-03) se conserva sin alteración; pack no tocado.

### 3.2 Etapa A consumida y etapas posteriores NO autorizadas

No se conocen los nombres/versiones de toda la closure, sus URLs ni hashes; inventarlos no haría verificable el plan. Por eso se separan permisos de descubrimiento y de adquisición/preparación:

1. **Etapa A — confirmada, ejecutada y autorización consumida:** DevOps realizó exclusivamente los cuatro GET de §3.1, sin tarballs/transitivos/instalación/scripts/validación. Resultado HTTP y digests se transcriben desde shared; cuerpos/headers no persistidos y campos no transcritos se registran como vacíos, no como verificaciones completas. **No repetir los GET para rellenar vacíos.** Siguiente acción documental: recuperar los campos literales del reporte existente mediante aporte de DevOps/humano; si no es recuperable, registrar bloqueo y proponer alcance nuevo antes de cualquier red. A no autoriza pasos 2–4.
2. **Inventario transitivo y lock candidato:** el responsable presenta los siguientes destinos concretos requeridos para metadata transitiva. Cada extensión exige confirmación explícita antes de acceder, o se aporta un kit offline con lock/metadata completos. No hay permiso de «cualquier paquete bajo registry». Toda dependency/peer/optional efectiva en Linux debe terminar con versión exacta, URL e integridad en inventario/lock; rangos declarados por upstream no son pins autorizados. Resolver closure sin ejecutar paquetes, scripts ni build; detener si la herramienta disponible no permite ese límite. Este plan no crea un resolver ni un script.
3. **Etapa B propuesta — adquisición de closure inventariada:** antes de cualquier tarball, el humano confirma el inventario completo con nombre/versión/URL/SRI por paquete y el digest real del lock candidato. Sólo se descargan esas entradas, incluidas las cuatro de §3.1; nada seleccionado oportunistamente. Lock sin closure, URL fuera del alcance, nueva dependencia o cambio de integridad → revisión del plan y nueva confirmación, no fallback ni regeneración silenciosa del lock.
4. **Preparación posterior — sin red:** sólo con mandato específico de preparación y después de la verificación §3.3, el responsable instala localmente desde el aporte/cache privada con scripts de lifecycle deshabilitados y lock inmutable. Prohibidos audit/fund/telemetría/actualizaciones automáticas y ejecución de binarios adquiridos durante adquisición. Corroboración offline de capacidades/engines y corrida G-OAS son fases posteriores con sus propios permisos; no vienen autorizadas por A/B.

**Restricción de red posterior a A:** cero requests nuevos hasta nueva confirmación; después, sólo lectura HTTPS pública a las URLs exactas de la fase nuevamente confirmada. Sin auth/tokens/cookies de usuario, envío de contratos/fixtures, `.npmrc` de HOME ni consultas a `.invalid`. No HEAD exploratorios, POST/audit, mirrors, Git dependencies, registry privado ni CDN implícito. No seguir redirects automáticamente, incluidos cambios de path en el mismo host: registrar Location y solicitar confirmación del destino antes de seguir. DNS necesario se limita a resolver el host aprobado mediante el resolver existente; no añade un dominio proveedor al permiso. Si el entorno exige delimitación adicional de DNS/proxy/TLS, esa delimitación debe confirmarse antes del primer request; no se desactiva TLS.

La política de un intento, sin retries automáticos y sin backoff de §7 aplica por adquisición futura autorizada: timeout de request propuesto 30 s, límite total de etapa 300 s. Un 404, 429, 5xx, timeout o error TLS no habilita cambiar pin/destino ni reintentar. Registrar bloqueo sin confundirlo con incompatibilidad contractual. Señales futuras: `ACQUISITION_RECORDED` por entrada, `ACQUISITION_BLOCKED` ante fallo; no se afirma que DevOps emitió estas señales ni se crean logs en esta sesión.

### 3.3 Integridad y procedencia: método, no checksums inventados

- **Valor esperado:** tomar el SRI `dist.integrity` de la metadata de la versión exacta obtenida por HTTPS del registry aprobado, conservar esa metadata y fijar el mismo valor en el lock. Exigir SHA-512 cuando esté disponible en la metadata; si falta SRI SHA-512, detener y pedir revisión del método. No sustituir silenciosamente con `dist.shasum` SHA-1 ni aceptar sólo un SHA-256 calculado sobre lo descargado.
- **Verificación de bytes:** antes de extraer/instalar, calcular SHA-512 de cada tarball y comparar su codificación SRI con el valor esperado byte por byte. Calcular además SHA-256 local para inventario/custodia. Registrar por paquete nombre/versión, URL original/efectiva aprobada, SRI esperado/observado, SHA-256, tamaño, fecha y resultado. Discrepancia o entrada sin verificación → `INTEGRITY_MISMATCH`/`TOOLCHAIN_BLOCKED`, sin extracción ni promoción.
- **Lock y material local:** registrar SHA-256 de metadata, inventario de closure, manifest, lock, tarballs, docs/configs/adaptador y herramientas efectivas; verificar manifest/lock pre=post de preparación. `package.json` interno del tarball debe coincidir con nombre/versión aprobados. Extracción debe rechazar path traversal y symlinks que salgan de staging; fallos conservan evidencia parcial y no escriben fuera de `tools/goas/`.
- **Límite de autenticidad:** SRI del mismo registry detecta bytes diferentes de la metadata, no es prueba independiente de identidad del publisher ni inmunidad a compromiso del registry. SHA-256 local aporta trazabilidad, no autenticidad por sí solo. Cotejar identidad/repository con documentación oficial disponible offline; si no basta, registrar `Blocked: procedencia no corroborada`. Firmas/provenance, si se aportan offline, requieren verificación y evidencia real; no se declaran verificadas aquí. Un método que consulte claves/endpoints de firmas requeriría URLs y permiso adicionales, no está incluido en A/B.
- **Criterio de aceptación AC-T03-I:** 100 % de entradas de closure con pin/URL/SRI y comparación exitosa documentada, manifest/lock reproducibles e inmutables y procedencia corroborada; cero datos inventados. Hoy: **pendiente, no verificado**. §3.1 sí contiene SHA-256 de los cuatro bodies y SRI esperado reportados en shared; **no** contiene hashes/SRI observados de tarballs ni digest de lock/closure. Obtener metadata no cumple este criterio.

### 3.4 Ubicación y límites de escritura propuestos

Todo lo siguiente es **ruta futura, no creada** bajo `/mnt/data/Shares/Projects/entralo-workspace/tools/goas/`:

| Subruta propuesta | Uso y límite |
|---|---|
| `vendor/metadata/`, `vendor/tarballs/`, `vendor/docs/` | Material original adquirido/aportado; no sobrescribir entradas verificadas. |
| `staging/<acquisition_id>/` | Intento único y salidas parciales; ID real asignado por responsable, nunca placeholder como evidencia. |
| `package.json`, `package-lock.json`, `node_modules/` | Toolchain privada; lock completo, sin manifest en raíz ni cambios a bootstrap/producto. |
| `.cache/npm/`, `.tmp/` | Caché/temporales explícitos locales; no usar HOME, `/usr`, npm global ni `~/.npm/_npx`. |
| `provenance/` | Inventario/metadata/digests y decisiones de permiso; no resultados contractuales ni bundles. |

Config/adaptador y documentación de capacidades sólo se preparan por responsable autorizado distinto de Planner. Paquetes/toolchain pueden estar en workspace; snapshots, bundles y resultados de G-OAS siguen **fuera del repo** en destino externo confirmado conforme §6/L44. No descargar Node/npm, generador/JAR ni otro parser adicional dentro de este alcance; cualquier necesidad nueva vuelve a revisión. Retener procedencia mientras gates abiertos; no promover staging incompleto ni eliminar logs de fallo. Owner confirma espacio/permisos/realpaths y retención antes de preparar; no hay mediciones ni directorios afirmados como existentes.

### 3.5 Ejecutor de A registrado; responsables y permisos posteriores pendientes

**Ejecutor efectivo de la etapa A:** agente DevOps (`devops-architect`), identificado en shared §Etapa A ejecutada. No queda pendiente designar un responsable para esos GET ya completados. **Para fases posteriores:** el propio usuario puede asumirlas mediante nueva confirmación, o el humano/orquestador puede designar una herramienta/operador técnico distinto de Planner, con alcance explícito por fase. No se extiende el mandato de DevOps automáticamente ni se realiza handoff/dispatch a Task Decomposer, Executor o Architect Executor en esta sesión. [shared:26–46,56–61,144]

Planner sólo mantiene diseño documental y recibe discrepancias. No descarga, instala, crea config/scripts ni corre validaciones. L44 queda intacta, sin delta de permisos ni bypass. El responsable de evidencia de corrida continúa siendo validación técnica; la propuesta de owner de preparación no cierra G-OAS ni G-SA.

**AC-T03-A:** antes de cada fase nueva debe existir confirmación durable que enumere alcance, responsable, destinos exactos, pins/closure según fase, método de integridad, rutas, límites y prohibiciones. **Estado real:** A confirmada y completada (4 GET), autorización consumida; custodia completa/campos literales faltantes no acreditados (§3.1). B, transitivos/inventario/lock, preparación/instalación, scripts/config y corrida **no confirmados ni autorizados**. B exige inventario íntegro revisado; ninguna confirmación de alcance equivale a G-HUMAN-CONTRACT ni `Human Plan Approval`.

## 4. Perfil lint y excepciones

Baseline propuesto: reglas `recommended` de Redocly **2.57.0**, sin desactivaciones adicionales; inventariar severidad/reglas efectivas para no asumir que el exit mide toda la conformidad. Cualquier incompatibilidad con la política vuelve a Planner; no remediar contratos en este trabajo.

Dos pasadas sobre el mismo snapshot: **bruta** sin ignore y **dispuesta** con sólo diez tuples permitidas. Ambas guardan salida JSON completa y exit real. El informe enlaza la salida bruta y cada disposition; los warnings no se borran de la evidencia. Config del motor y fichero ignore son artefactos de tooling, no se escriben aquí.

Tuples canónicas, paths relativos a `I/`:

| Archivo | Regla | JSON Pointer exacto |
|---|---|---|
| `api/admin-bff.yaml` | `info-license` | `#/info` |
| `api/buyer-bff.yaml` | `info-license` | `#/info` |
| `api/catalog.yaml` | `info-license` | `#/info` |
| `api/common.yaml` | `info-license` | `#/info` |
| `api/identity.yaml` | `info-license` | `#/info` |
| `api/payments.yaml` | `info-license` | `#/info` |
| `api/purchases.yaml` | `info-license` | `#/info` |
| `api/ticketing.yaml` | `info-license` | `#/info` |
| `api/admin-bff.yaml` | `operation-2xx-response` | `#/paths/~1v1~1auth~1callback/get/responses` |
| `api/buyer-bff.yaml` | `operation-2xx-response` | `#/paths/~1v1~1auth~1callback/get/responses` |

Estas diez tuples son el límite, no diez findings garantizados. La configuración debe resolver inequívocamente los paths reales del snapshot externo a esos paths canónicos; guardar cwd, ruta de config/ignore y tabla de correspondencia. Corroborar con docs offline del pin dónde resuelve Redocly los paths de ignore. Si el motor emite un pointer distinto, **bloquear esa excepción y retornar a Planner**, nunca ampliar a operación/archivo/regla entera. Prohibidos wildcards, `rules: off`, generate-ignore indiscriminado y suppressions de struct/refs/seguridad/formato. [I/api-lint-policy.md:27–34]

Los warnings `no-unused-components` de common siguen visibles: verificar alcanzabilidad en unión de siete roots y reportar componentes no alcanzados; no fabricar uso ni agregar ignores. Common es documental, no octavo servicio. [I/api-lint-policy.md:19,40; I/gate-register.md:44]

**AC-T04:** salida bruta conservada; toda suppression dispuesta coincide exactamente con una tuple autorizada y todo warning restante tiene inventario/disposición, sin conteo histórico prefijado. Config desconocida o mismatch de ubicación = bloqueo.

## 5. Perfil JSON Schema, parsing y refs offline

- Un solo motor Ajv Draft 2020-12 con ajv-formats completo; validación de schemas y `validateFormats` activas. Sin coerción, defaults ni eliminación de propiedades; comparar digest de instancia antes/después. No convertir null a ausencia/string ni retirar `required`, `{}`, `not`, `if/then`, `allOf`, `oneOf`, `additionalProperties` o `dependentRequired` para hacer compilar.
- Parse YAML antes de lint con rechazo de claves duplicadas, tags ejecutables y aliases que excedan límites; JSON con rechazo de claves repetidas antes de pérdida de información. Límite propuesto: 10 MiB/documento, 100 niveles y 256 expansiones de alias (elevado desde 100: las fuentes canónicas legítimas admin-bff 178, buyer-bff 160 y purchases 178 superan la cota anterior; el caso DoS sintético de 257 referencias sigue bloqueado con `ALIAS_LIMIT`); exceso bloquea el artefacto y se informa, no se trunca. Estos límites operativos no alteran schemas.
- Registry local: registrar cinco recursos de eventos por `$id` original y path físico; resolver refs relativas según base URI del recurso, no cwd. `$schema`/metschemas del motor provienen del aporte offline. `.invalid` no se consulta; `$id` no equivale a URL descargable. URI desconocida, pointer inexistente, colisión de `$id`, salida del snapshot o symlink externo → bloqueo con origen/pointer. No resolver asincrónicamente desde HTTP ni habilitar fallback de red. [I/api-lint-policy.md:40,44; I/events/integration-envelope.v1.schema.json:2–3,26–35]
- OpenAPI 3.1 no es un schema JSON completo. Para MP/matriz extraer schemas de `common.yaml` y su closure en recursos **derivados externos**, con mapa de origen `(archivo,pointer)` → `(recurso derivado,pointer)`. Copiar sin cambiar assertions; reubicar componentes a `$defs` y reescribir sólo refs a esos componentes a su ubicación equivalente. Ref fuera de schemas, dialecto/vocabulario no soportado o transformación no trazable → bloqueo, no drop de keywords ni recompilar como Draft 7. Conservar siblings de `$ref`, ciclos y base URI; registrar hashes y equivalencia de cada schema extraído. Los canónicos permanecen byte-exactos.
- Corroborar perfil del motor para vocabulario/annotations OpenAPI 3.1 y formatos alcanzados (`uuid`, `date-time`, `int64` en Version, etc.) con documentación offline. No configurar unknown formats como válidos por omisión ni un `strict: false` general como solución. Keywords anotacionales no tienen efecto de validación; no atribuirles assertions. Motor incapaz de compilar la closure con semántica equivalente → bloqueo técnico para Planner, sin modificar contratos. [I/api/common.yaml:202–210,248–262]
- Verificar assertion con `uuid-valid`, `uuid-invalid`, `instant-valid`, `instant-impossible-date`, `instant-missing-zone`; guardar keyword/schemaPath de cada rechazo para distinguir assertion `format` de un rechazo por otra regla. Negativo inválido aceptado → cobertura de formatos bloqueada aun si el resto coincide. Incluir también MP `invalid-date`/`missing-date-zone`. [matriz:11–15; MP README:20–21,27]
- Matriz: por cada `id` único resolver `schema_ref` **desde la matriz**, extraer `instance` y comparar booleano con `expected_valid`, no validar el documento matriz como webhook. Semántica N1 dinero/CAS/firma sigue fuera de G-OAS. [I/api-lint-policy.md:38; matriz:5–10; I/master-spec.md:214–221]

**AC-T05:** cinco schemas compilados y refs resueltas offline, 27 resultados individuales, 13 fixtures MP con polaridad 4/9 y controles de formatos con motivo de rechazo; inputs inmutables. Sin alguno de estos componentes, reporte de cobertura incompleta/bloqueada, no conformidad inferida.

## 6. Protocolo futuro de corrida y evidencia (NO ejecutado)

Precondiciones: B-T01/B-T02 resueltos explícitamente; toolchain/closure/config verificables; permiso específico para la corrida por herramienta/orquestador. B-T03 debe resolverse antes del freeze formal; esta corrida técnica sobre snapshot no se denomina freeze final ni cierra G-SA. Sin esas precondiciones, no iniciar.

Destino externo propuesto: directorio nuevo de evidencia bajo `/tmp/opencode/entralo-v1-executable-specs/`, con `run_id` único asignado realmente por la herramienta; no reutilizar/reconstruir informe anterior. Persistencia/owner del destino deben confirmarse antes de correr; `/tmp` no asegura retención. No copiar bundles al workspace.

Secuencia de verificación, no tareas de implementación:
1. Inventariar **todos los paths actuales** bajo `I/`, incluida la revisión SA nueva, sin exclusiones silenciosas, y SHA-256/bytes originales por path ordenado. El conjunto de 44 era anterior a esa adición; no imponerlo como cardinalidad vigente. Recontar bytes/líneas; 557.866/5.202 del pack son históricos, no expected hashes. Guardar manifest y digest real, copiar fuentes byte-exactas a snapshot externo y comprobar igualdad. Manifest separado para este plan, shared/pack y toolchain; no mezclarlos con el incremento. Cardinalidad no conciliada = bloqueo/retorno a curator, no omitir informes para alcanzar el conteo histórico.
2. Reparsear ocho YAML y 19 JSON (5 schemas + 13 MP + matriz) sin duplicate keys, sobre el snapshot. Markdown se inventaría, no se presenta como payload parseado. No reutilizar el auxiliar anterior.
3. Lint bruto ocho YAML y lint dispuesto según §4; guardar diagnostics de cada artefacto y alcance por servicio.
4. Bundles de siete roots (`admin-bff`, `buyer-bff`, `catalog`, `identity`, `payments`, `purchases`, `ticketing`) más common documental, **sólo externamente**. Resolución refs offline y tabla origen→destino; comparar paths/methods/operationIds/schemas/auth/errors/headers fuente vs bundle y alcanzabilidad común. Diferencia o pérdida de constraints = bloqueo, no sustituir fuente por bundle. [I/gate-register.md:43–44]
5. Compilar cinco schemas; resolver refs/links/`schema_ref` locales; ejecutar controles de formatos, fixtures MP y 27 casos según §5. Esperar exactamente cuatro MP válidos/nueve inválidos por README; preservar resultados individuales de todos los casos, incluso después de una discrepancia.
6. Registrar componente generador como **bloqueado** mientras falten CLI soportado/config real. No añadir OpenAPI Generator, build Gradle ni generación ficticia en este alcance. Obtener un permiso/diseño separado si se requiere preparación del generador; Redocly/Ajv no sustituyen AC-GOAS-07. Informe de ausencia/config inexistente no satisface por sí solo la alternativa que exige corroborar config real. [I/api-lint-policy.md:23; pack:63,104]
7. Manifest fuente post idéntico al pre, y hashes de toolchain/config pre=post. Si cambian fuentes/config, invalidar cobertura de esa corrida, no reutilizar exits para bytes nuevos. Findings contractuales → retorno a Planner y autorización de corrección fuera de esta solicitud → nueva corrida; no suppression automática.

Para cada operación guardar `run_id`, `snapshot_manifest_sha256`, fase, archivo/pointer o case_id, command/argv **real**, cwd, ruta/versión/digest de herramienta, opciones/config/ignore digest, timestamps UTC inicio/fin, exit_code real (null si no arrancó), expected_valid/observed_valid cuando aplique, diagnostics por regla/keyword/pointer y hashes de entradas/salidas. No inventar comandos ejecutados; este plan define la evidencia exigida, no contiene logs.

Archivos de evidencia propuestos: manifests pre/post, inventario toolchain, commands/resultados JSONL, lint raw/dispuesto JSON, refs y source-map, bundles/checksums, resultados compile/MP/matriz/controles de formato, cobertura generador y reporte legible con blockers. Los errores no incluyen payloads ni valores rechazados; referenciar path/id/keyword. Retención del bundle: no borrarlo ni sobrescribirlo mientras los gates del incremento estén abiertos; owner acuerda destino durable sin copiarlo después del scan al repo. No afirmar evidencia vigente si la ruta desaparece.

**AC-T06:** cada resultado tiene artefacto, snapshot, comando/versión/exit y diagnostics; cada fase ausente figura bloqueada o no ejecutada con causa. Ningún exit 0 aislado implica gate cerrado. [I/api-lint-policy.md:23,40; I/gate-register.md:43–46]

## 7. Fallos, repetición, límites y concurrencia

Flujo feliz futuro: permisos/fuente verificables → preparación privada → controles de capacidad → snapshot byte-exacto → fases §6 → reporte sin cierre automático. Hoy se detiene antes de preparación.

- Una sola corrida por snapshot/config y un writer por directorio; fuente read-only y ejecución secuencial. Corrida concurrente usa otro run_id, nunca modifica directorio compartido. Cambio de fuente concurrente detectado por manifests invalida la corrida.
- Adquisición/preparación: máximo **un intento** por etapa/intento autorizado, timeout propuesto 300 s; request de adquisición 30 s (§3.2). Fase lint/bundle/refs por artefacto: 120 s; compile por schema: 60 s; validación por caso: 10 s; corrida total: 900 s. Timeout/fallo de herramienta se registra como bloqueo, no schema inválido. Límites son decisiones operativas propuestas, no SLA medido.
- **Sin retries automáticos ni backoff**: fallo de integridad/permisos/ref/capacidad se eleva. Repetición sólo tras resolución explícita y con run_id nuevo; fuentes cambiadas exigen manifest nuevo. Idempotencia documental por `(manifest fuente, manifest toolchain/config, fase, artefacto/case_id)`; no sobrescribir resultados ni deducir éxito por existencia de archivo.
- Compensación: fuentes no se escriben; marcar staging/salidas parciales como incompletas y no promoverlas. Conservar logs del intento; nueva preparación/corrida en directorio nuevo. No borrar ni revertir canónicos.
- Señales exactas propuestas en resultados JSONL: `TOOLCHAIN_BLOCKED`, `PARSE_REJECTED`, `LINT_RECORDED`, `REF_UNRESOLVED`, `FORMAT_ASSERTION_BLOCKED`, `CASE_POLARITY_MISMATCH`, `SOURCE_CHANGED`, `GENERATOR_BLOCKED`, `RUN_INCOMPLETE`, `RUN_RECORDED`. `RUN_RECORDED` significa informe producido, no gate satisfecho. Sin logs reales hoy.

**AC-T07:** fallo no se confunde con polaridad negativa esperada; no hay retry/descarga silenciosa, salidas parciales no son evidencia completa y toda mutación de fuente/config invalida cobertura.

## 8. Cotejo de consistencia y próximos permisos (sin handoff)

Cotejo documental de fuentes leídas, **no PASS**:
- Excepciones: §4 reproduce sólo las diez tuples de `I/api-lint-policy.md:31–32`; no amplía reglas ni pointers.
- Ubicación: instalación futura local propuesta compatible con output externo/read-only de `I/gate-register.md:43–44`; Planner no instala ni crea scripts.
- Alcance: ocho YAML/cinco schemas/13 MP/matriz 27 coincide con política L5/L38/L40 y fuentes fixtures leídas; menciones matriz21/seis MP en `gate-register.md:10,39` y Master§12 son históricas. No se corrigen contratos aquí.
- N1: §5 no atribuye prueba transaccional a schemas, según `I/master-spec.md:214–223`; no pregunta humana N1 repetida.
- Generador: bloqueado, no satisfecho por Redocly/parse ni por ausencia de config. Condiciones SA nuevas del alcance aprobado están persistidas; G-SA global residual y orden posterior de gates intactos. [I/gate-register.md: §Estado vigente — nueva firma SA]
- Adquisición: §3.1 reproduce cuatro resultados metadata HTTP 200/0 redirects, timestamps, nombres/versiones, SRI y SHA-256 bodies desde **shared L26–L46**, no nuevas consultas. `repository`/`engines`/valor literal `dist.tarball` no disponibles en la transcripción se mantienen como vacío explícito; candidatos no se promueven a evidencia. A completada ≠ custodia completa, closure verificada, preparación o validación. §3.2 no autoriza transitivos ni nuevos GET; §3.3 separa SRI esperado de comparación sobre tarballs **no descargados**. **Alcances posteriores/closure pendientes; cero permiso heredado.**
- SA: `I/solution-architect-review.md` conserva `changes-required` histórico; **nuevo** `I/solution-architect-rereview-2026-10-03.md` `approved` para su diseño/alcance explícito, condiciones §6.1 y hash unavailable. Falta de respuesta antigua no vuelve a bloquear ese scope; P04/HC/residuales fuera de firma siguen pendientes. No convertir esta firma en validación de schemas, cierre G-SA global o permiso de ejecución.

**AC-T08:** bloqueos y permisos permanecen visibles, lifecycle `planning`/verdict `none`; G-OAS abierto, firma SA nueva de diseño limitada y residuales separados. El plan nunca habilita una fase posterior por sí solo. Solicitar refresh dirigido al curator tras este delta; pack anterior no sustituye canónicos. **Este plan no es Decomposition Contract ni lista de implementation tasks**: no alimenta a Task Decomposer (el incremento tiene su contrato de descomposición separado, todavía no habilitante).

**Evidencia de esta actualización:** lectura local del plan, shared actualizado (188 líneas) y pack refresh #12 (`incomplete`, stale); listado/búsqueda dirigida en `.working/` para valores de metadata faltantes. Escritura mediante `apply_patch` y relectura limitada a este plan; sin contratos/shared/gates/pack/config/scripts. **Sin requests de red, comandos, cálculo de hashes, descargas, instalaciones, scripts, validación, corrida, Git ni scan.** Los hashes numéricos son transcripciones del shared, no mediciones nuevas. Informe/sesión externos no consultados; canónicos no releídos ni recertificados. **G-SCAN final pendiente; este cambio documental no está escaneado en esta sesión y no habilita handoff.** Las citas de política/master/fixtures describen el diseño anterior con evidencia heredada, no validación nueva.

Próxima decisión humana mínima, sin repetir la aprobación de A:
1. **Aporte de evidencia existente, sin red ni ejecución:** ¿puedes aportar la salida original de DevOps con los valores literales de `repository`, `engines` y `dist.tarball` de los cuatro pins (§3.1), o confirmar que esa evidencia no puede recuperarse? No se requiere repetir los cuatro GET ni aprobar tarballs para aportar el reporte. Si no se recupera, conservar el bloqueo y formular un alcance nuevo concreto antes de cualquier solicitud; no reutilizar la autorización consumida.
2. **Sólo después de completar la evidencia, elegir el siguiente alcance documental:** propuesta delimitada de inventario/lock/transitivos (URLs exactas y responsable), o aporte offline íntegro. Su elaboración efectiva/adquisición **requiere confirmación humana nueva**; no queda autorizada por responder al punto 1. A continuación, y sólo con inventario/lock/SRI íntegros revisados, confirmar separadamente tarballs B, verificación de bytes, preparación/instalación y scripts/config, y validación/corrida G-OAS. Ningún permiso incluye implícitamente la fase siguiente; L44 intacta, sin Decomposer/Executor ni handoff.
3. **SA: respuesta nueva ya persistida para scope revisado**, no pedir nuevamente el verbatim histórico como prerrequisito. Conservación de condiciones §6.1, tratamiento separado de P04/HC/residuales y snapshot técnico posterior siguen obligatorios. No sustituye permisos de adquisición/preparación ni approval humano contractual.

**Siguiente fase SDD:** continúa `planning` en carril `feature`, `verdict: none`. **A confirmada/completada y autorización consumida** → aporte de campos faltantes desde evidencia existente o bloqueo explícito → propuesta y nueva confirmación de cada alcance posterior por responsable no Planner → adquisición/preparación/corrida únicamente bajo sus permisos específicos. G-OAS sigue **abierto**, no acreditado por metadata; G-SA tiene firma **nueva parcial de diseño `approved`**, condiciones persistidas para su scope, P04/HC/residuales separados. Generador AC-GOAS-07 sigue bloqueado. G-API-GOV, curator/freeze, G-SCAN final, Spec Validator y, sólo tras `ready`, aprobación humana contractual conservan sus owners/gates. **No iniciar ninguno desde este plan; ningún PASS ni handoff a Decomposer/Executor o Architect Executor.**

## 9. Delta propuesto 2026-10-04 — última estable compatible y separación de targets (refresh #22)

### 9.1 Estado, autoridad y prelación acotada

**Estado vigente: propuesta documental condicionada; lifecycle `draft`; Spec Validator `verdict: none`; G-OAS abierto.** §10 incorpora el resultado local y acota esta propuesta; las referencias de §9 a identificación pendiente/selección de Node/npm son históricas en ese alcance. No hay resolución efectiva, pin nuevo, lock, instalación, smoke ni corrida producidos por estos deltas. No modifica arquitectura macro, Master, contratos, README, shared, pack, gates ni el conjunto canónico del incremento. No es aprobación humana contractual, Decomposition Contract ni handoff de implementación.

Fuentes de esta decisión: solicitud humana actual (ratifica política de resolución aprobada, `devops-architect` y rutas de custodia para metadata transitiva); pack refresh **#22**, `incomplete`, como índice de los mandatos #20/#21 y de la separación #22, **no** como contrato sustituto; este plan §§3–7; `I/api-lint-policy.md` §§Disposición única, Excepciones de lint y Matriz documental; `I/gate-register.md` §§Delta Governance y freeze/bundle L-07, Estado vigente — nueva firma SA; `docs/architecture/decision-records/ADR-006-stack-runtime-y-entrega.md` §§Contexto y Decisión propuesta. Las secciones canónicas citadas se leyeron de forma dirigida, sin revalidar sus hechos upstream. La topología AWS/Vercel se conserva; el ADR sigue `proposed`/`draft`, no pasa a arquitectura aprobada por este delta.

**Corrección explícita de estado, no borrado de historia:** las afirmaciones de §§2, 3.2, 3.4, 3.5 y 8 que exigen permiso humano genérico nuevo para cada fase, dejan owner de metadata transitiva sin designar, piden otra vez los campos aportados en §3.1.1 o excluyen en principio un Node/npm local necesario son cortes anteriores a las aclaraciones actuales. Se sustituyen **sólo en ese alcance** por §9: los campos #19 ya están transcritos; la política de resolución, el owner y la custodia de metadata están aceptados; el mandato general cubre las fases y la instalación necesaria de tooling, incluido Node/npm **si se acredita su necesidad**. Los destinos, versiones, closure, compatibilidad, integridad y presupuesto siguen pendientes; Planner no ejecuta. Etapa A y «si dale» siguen consumidos, sin habilitar su repetición. §§3.1 y 3.1.1, tablas de pins y hashes permanecen íntegros. Las menciones anteriores «NO autorizado» se leen como históricas respecto del **permiso de principio**, no como dispensa de los requisitos concretos actuales.

**AC-T09-ESTADO:** esta propuesta no declara `ready`, instalación inexistente/existente, compatibilidad probada, último release determinado, runtime Vercel verificado ni gate cerrado. Ninguna sección histórica habilita una acción que §9 mantiene bloqueada.

### 9.2 Tres dominios de compatibilidad y mapa por fase

| Dominio | Target y baseline de diseño | Evidencia exigida / fase que la debe aportar | Lo que G-OAS local no demuestra |
|---|---|---|---|
| A — tooling local G-OAS | **PC del usuario**, toolchain privada Node/npm y Redocly/Ajv/ajv-formats/yaml; no producto ni ejecución cloud. Node/npm efectivos **desconocidos**. | Identificación local acotada futura → metadata y resolución → closure/lock → integridad/adquisición → preparación offline con scripts deshabilitados → controles de capacidad → corrida §6 autorizada. Cada fase registra versiones/target efectivos y evidencia de su propio alcance. | No acredita compilación backend, funcionamiento ECS, despliegue frontend ni runtime Vercel. |
| B — aplicación backend AWS | **Kotlin / Java 21 / Spring, ECS Fargate**. Java 21 se conserva; referencias Boot del ADR son baseline de diseño, no inventario instalado. | Futuro G-BOOTSTRAP: JDK/distribución y Kotlin/Spring/Gradle/generador exactos, matriz de soporte versionada, configuración real, compilación de generado e implementación y pruebas de serialización/interoperabilidad. Validación operativa de ECS en su fase de despliegue, no en adquisición local. | Parse/lint/bundle/schema no prueba transacciones, workers, capacidad, despliegue ni compatibilidad Boot/Jackson del generado. |
| C — frontends | **React buyer/admin desplegados en Vercel**; no se fija runtime Node ni Edge, ni su versión de build/ejecución. | Futuro bootstrap/deploy frontend: proyecto/entorno, configuración efectiva Vercel, versiones exactas de build y de runtime de cada función/transporte si existen, matriz soportada, lock frontend propio y logs de build/deploy/pruebas pertinentes. Hasta entonces: **runtime real Vercel por verificar**. | Node del PC, `engines` de herramientas o éxito G-OAS no certifican soporte de Vercel, ejecución React ni comportamiento same-origin/OIDC. |

**Asignación de alcance:** metadata, adquisición y preparación prueban únicamente A. Los controles de capacidad y G-OAS prueban semántica de validación contractual offline conforme §§4–6 y política canónica, no B/C. AC-GOAS-07 conserva su requisito de evidencia de generador/config real; compilación y compatibilidad Boot/Jackson pertenecen a G-BOOTSTRAP. G-API-GOV, freeze/scan y Spec Validator conservan sus scopes y owners, sin convertirse en pruebas de despliegue. Desconocer runtime Vercel no obliga a mover G-OAS a Vercel ni bloquea por sí solo el tooling A; **sí detiene cualquier afirmación de compatibilidad o fase de ejecución que dependa de C**. Lo mismo aplica al runtime efectivo de B.

**AC-T09-TARGET:** cada evidencia futura identifica `compatibility_domain` A/B/C y su fase; no deriva Java/Spring/React/Vercel de `engines` de G-OAS ni reinterpreta «últimas estables» como upgrade del producto. No se cambia Java 21, stack backend, React ni topología en este plan.

### 9.3 Política de resolución y estado de los pins históricos

Se persiste la política ya aprobada en conversación: **`highest stable satisfying` = seleccionar la versión estable más alta cuya compatibilidad completa se pueda verificar dentro del scope G-OAS y del target A identificado**, con un corte de metadata fechado, y después fijarla exactamente. «Última» se evalúa en ese corte, **no** en cada instalación. Si faltan pruebas para el candidato más reciente, detener la selección: no asumir compatibilidad ni bajar al histórico silenciosamente. Una versión más reciente con incompatibilidad demostrada puede descartarse con causa/evidencia, y considerar la siguiente estable dentro del scope ya confirmado; cada consulta adicional requiere estar enumerada y presupuestada. No se aprueba un cambio de motor ni de semántica G-OAS por esta regla.

| Referencia conservada | Estado después de este delta |
|---|---|
| `@redocly/cli@2.57.0` | Pin histórico de diseño; **no instalado/ejecutado en esta preparación**; supersedido sólo en intención de selección, `pending actual resolution`. Metadata #19 se conserva para comparación. |
| `ajv@8.17.1` | Mismo estado; `engines` ausente en #19 sigue siendo bloqueo de compatibilidad no declarada, no permiso ni compatibilidad inferida. |
| `ajv-formats@3.0.1` | Mismo estado; `engines` ausente en #19 y compatibilidad mutua con Ajv requieren evidencia, no inferencia. |
| `yaml@2.8.1` | Mismo estado; rango `engines` reportado no prueba por sí solo API, parsing seguro ni capacidades. |
| Node/npm `26.7.0` / `11.19.0` | **Baseline reportada, no medición del PC**, no prueba de estabilidad actual, soporte ni instalación. Supersedida sólo en intención de selección; versiones efectivas y finales `pending actual resolution`. |

«No ejecutado» aquí delimita **esta preparación**, no niega los resultados históricos de otra corrida que la política canónica referencia. No se reescribe esa evidencia. Tampoco se declara `superseded` el lifecycle del documento ni se promueve ninguno de los números anteriores a release estable actual.

Evidencia requerida para seleccionar, **antes de adquirir/instalar la closure**:

1. **Corte de releases:** por componente, nombre, versión exacta, fecha UTC de captura y publicación, condición estable (sin prerelease; canal y soporte oficial del release cuando apliquen), estado de deprecación/retirada, origen de datos, URL exacta consultada/aportada y digest del body custodiado. Un `dist-tag latest` aislado no demuestra estabilidad ni compatibilidad. Para Node/npm, acreditar también relación de soporte entre ambos y artefacto para el target real; «última estable» no equivale automáticamente a LTS ni a cualquier versión numerada del plan.
2. **Target PC, en una fase futura acotada sin instalación:** evidencia aportada por `devops-architect` o usuario de SO/arquitectura CPU/libc cuando aplique, rutas reales y versiones exactas de Node/npm seleccionables, origen/distribución y disponibilidad dentro de las rutas permitidas. No enumerar HOME, configuraciones, credenciales ni filesystem ajeno para descubrirlas. Si se propone reutilizar un binario externo al área privada, corroborar su ruta concreta y la compatibilidad con D-T03 antes de usarlo; no convertir permiso de lectura en instalación global. En esta sesión nada se inspecciona ni se mide.
3. **Compatibilidad declarada y mutual:** valores literales `engines`, `dependencies`, `peerDependencies`/metadata de peers, `optionalDependencies`, `os`/`cpu`/`libc` cuando existan y scripts declarados para directos y transitivos efectivos; distinguir campo ausente, `null` y valor. Tabla paquete/versión → constraints → Node/npm/target evaluados → fuente exacta → resultado. Peers incompatibles, optional aplicable sin resolver o dependencia git/mirror no permitida detienen la closure; no forzar, omitir ni aceptar warnings como éxito.
4. **Compatibilidad funcional G-OAS:** documentación versionada y luego controles autorizados del candidato corroboran lint/bundle OpenAPI 3.1, reglas y pointers exactos, ignore estrecho, resolución offline, Ajv 2020 y formatos en modo completo, parsing/rechazo de duplicados y límites de aliases, metschemas/vocabularios y API usada por el adaptador. La referencia Redocly `2.57.0` de §4 es baseline histórica: un candidato nuevo exige inventario real de reglas/severidades y mismo límite de diez tuples; no hereda capacidades del pin previo ni flexibiliza assertions/excepciones.
5. **Pinning reproducible:** selección explícita de versiones exactas directas y transitivas para el target identificado, inventario completo con URL/SRI por entrada, peers/optionals resueltos o exclusiones justificadas por target, manifest/lock candidatos y digest del lock. Sin `^`, `~`, `latest` ni rangos como selección final; los rangos upstream se conservan sólo como constraints de resolución. Runtime local Node/npm exactos con origen/URL/digests y método de integridad propio; para paquetes npm, comparación SRI de §3.3. Reproducción offline con la versión fijada de npm, lock inmutable y manifest/lock pre=post antes de afirmar reproducibilidad. No se crean esos archivos aquí.

**AC-T09-PIN:** ninguna versión final se declara seleccionada sólo por estabilidad o `engines`; requiere evidencia de soporte, compatibilidad mutua/capacidades y pin/lock verificable. Todos los candidatos rechazados llevan motivo y evidencia. Un release nuevo posterior al corte no cambia la selección automáticamente: requiere resolución nueva trazable.

### 9.4 Detenciones obligatorias y evidencia para levantarlas

| Condición | Detención exacta | Evidencia mínima para reconsiderar; nunca bypass |
|---|---|---|
| Node/npm exactos del PC desconocidos, o target SO/CPU/libc necesario no acreditado | **`Blocked: PC Node/npm exactos desconocidos`**; no afirmar satisfechos los engines, no instalar para adivinar compatibilidad. | Aporte local acotado del punto 9.3.2 en la fase futura permitida. Si falta capacidad del agente, pedir al usuario sólo esa evidencia/instrucción pertinente, no permiso genérico de instalación ya dado. |
| `engines` ausente, `null`, incompleto o ambiguo en un componente necesario | **`Blocked: compatibilidad no declarada`** antes de seleccionar/promover/instalar; aplica hoy a Ajv y ajv-formats históricos. | Fuente oficial **de la versión exacta** que declare explícitamente soporte del Node/npm/target pertinente, custodiada y citada; Planner registra la decisión técnica y los controles de confirmación autorizados. No inventar un campo `engines`, no tratar ausencia como «sin restricciones», no usar sólo una prueba exitosa como sustituto de soporte declarado. Si no existe evidencia suficiente, mantener bloqueo y resolver alternativa técnica fuera de ejecución. |
| Candidato incompatible con §4/§5 o AC-GOAS-07 | **`Blocked: candidato incompatible con plan G-OAS`**; no alterar contratos, ampliar ignore, retirar formats/keywords ni cambiar motor. | Documentar diferencia de regla/pointer/API/dialecto/format/capacidad y alternativa compatible verificable dentro de política; si exige cambio de diseño o riesgo no autorizado, decisión explícita del owner y nueva revisión, no downgrade/upgrade silencioso. |
| Versión estable actual, URL, closure, SRI/procedencia o presupuesto sin concretar | **`Blocked: resolución/alcance exacto pendiente`**; no metadata exploratoria, tarball ni instalación oportunista. | Propuesta concreta de fase y evidencia/inventario respectivos conforme §9.5; no rellenar valores por memoria ni derivar tarballs de nombres. |
| Fallo HTTP/TLS/timeout, redirect o discrepancia de bytes | **`ACQUISITION_BLOCKED`** o **`INTEGRITY_MISMATCH`**, sin retry/backoff/fallback y sin promoción de staging. | Registro del intento único y resolución explícita; cualquier intento posterior constituye fase nueva delimitada, nunca repetición automática ni consumo doble de A. |

**AC-T09-STOP:** cada bloqueo futuro registra componente/fase, causa, evidencia faltante, owner y condición de desbloqueo; ningún fallo se presenta como schema negativo esperado. La ausencia de permisos de herramienta del agente no se confunde con incompatibilidad; la alternativa de instalación por el usuario mantiene todos los controles.

### 9.5 Autorización general, acotación efectiva y procedimiento de URLs

**Ya autorizado en principio; no volver a preguntarlo:** política de resolución compatible, avance por fases, metadata/adquisición necesarias de tooling, instalación necesaria en el PC y alternativa «si no puedes, me dices cómo y yo las instalo». La designación **`devops-architect` para metadata transitiva** y rutas de custodia ya aceptadas se conserva: `tools/goas/vendor/metadata/`, `tools/goas/provenance/` y staging privado de §3.4 dentro del workspace. No pedir otra designación/custodia para ese mismo scope. «Metadata closure» significa aquí **inventario transitivo y lock candidato de §3.2.2**, no reabrir transcripción #19. Instalación privada por DevOps es una fase futura condicionada; si el agente carece de capacidad, el usuario puede realizarla siguiendo instrucciones concretas. Planner sólo documenta; no hay dispatch a agentes de implementación ni de tooling desde esta sesión.

**Todavía no autorizado efectivamente:** consultas/descargas a URLs no delimitadas, instalación con versiones/closure/presupuesto desconocidos, ejecución de scripts/config, corrida G-OAS, cambios del producto o cierre de gates. La autorización general nueva no convierte el host del registry en permiso abierto, ni extiende las URLs históricas a una consulta `latest`. Las referencias candidatas de §3.1 siguen sin ser destinos nuevos aprobados. **Este delta no inventa versiones, URLs ni endpoints de descubrimiento.** La topología #22 no añade permisos de red.

Procedimiento futuro, secuencia de control **no ejecutable ahora**:

1. **Propuesta exacta de descubrimiento**, distinta de adquisición: objetivo limitado a versiones estables/constraints de los cuatro componentes G-OAS y, si resulta necesario, Node/npm locales; método de consulta y campos concretos del punto 9.3, lista literal de cada URL/destino, owner, custodia y presupuesto. Nada de búsquedas genéricas ni query scope «todo el registry». Descubrir transitivos no exige conocer de antemano toda la closure: cada expansión debe enumerar consultas nuevas antes de ejecutarlas; metadata no autoriza los tarballs que mencione. Evidencia ya existente puede aportarse offline, sin repetir GET de A/#19.
2. **Ficha de alcance por fase antes del acceso:** versiones/URLs pertinentes, closure conocida o límite exacto de expansión de metadata, número máximo de requests (una por entrada), bytes máximos por respuesta y totales, espacio/retención, timeout por request y total, rutas reales de custodia, método de integridad/procedencia, owner y evidencia de autorización. Los límites propuestos de §§3.2/7 (30 s/request, 300 s/etapa) se conservan; conteos/bytes/espacio reales están **pendientes** y deben fijarse, no asumir que caben. Si no cabe en el presupuesto, detener antes del request y proponer acotación nueva; no fraccionar para eludir límites.
3. **Gate de destinos exactos:** los controles previos de §3.2/AC-T03-A exigen confirmación durable del contenido concreto antes de acceder a destinos externos o adquirir una closure. Presentar una sola ficha completa para las URLs/alcance que realmente faltan por confirmar; no preguntar otra vez «¿autorizas instalar/metadata?» ni reaprobación de política/owner/custodia ya aceptados. Si existe autorización previa exacta, no consumida y coincidente con toda la ficha, citarla y no duplicar el pedido; **aquí no se acredita una ficha así**. Si falta, solicitar sólo esa confirmación específica. No es Human Plan Approval ni sustituye gates técnicos.
4. **Descubrimiento y resolución, en fases futuras confirmadas:** un intento por consulta enumerada, **sin retries, sin backoff y sin seguir redirects**; no HEAD exploratorio, audit, fund, telemetría, mirrors, auth ni envío de documentos de producto. Un 3xx/`Location` se registra como bloqueo; no se sigue dentro del intento. Un destino nuevo exige ficha y confirmación antes de una solicitud independiente. Custodiar bodies/headers sanitizados y digests reales; no logs con tokens. Registrar releases, constraints, evidencia de soporte y candidatos rechazados; detenerse por §9.4. Sin metadata o fuentes suficientes no declarar última estable compatible.
5. **Adquisición sólo después de resolución:** versiones finales Node/npm/componentes, URLs exactas reales, closure completa, manifest/lock candidato revisado con digest, integridades esperadas y presupuesto exacto. Confirmación concreta de inventario/destinos según el punto 3, no permiso de principio repetido. Descarga única por entrada, verificación antes de extracción/promoción según §3.3. Si Node/npm requiere distribución local, conservar su método oficial de integridad/procedencia y rutas privadas; no inferir que un runtime distribuido tiene lock npm ni fabricar un SRI para él. Nueva dependencia, scripts indispensables o source fuera del scope → stop y revisión, sin forzar instalación.
6. **Preparación privada futura offline:** únicamente con material completo verificado, lock inmutable y versiones concretas; **lifecycle scripts deshabilitados**, sin red, instalación global, HOME/caché de usuario ni cambios al runtime del producto. Un paquete que necesite lifecycle scripts detiene esta vía; no reactivarlos ni instalar dependencias alternativas silenciosamente. Cualquier excepción requeriría decisión y permiso específicos fuera de esta propuesta. Controles de capacidad y corrida §6 conservan permisos y owners separados; no se ejecutan por satisfacer adquisición/instalación.
7. **Si instala el usuario:** proporcionarle instrucciones exactas sólo cuando se conozcan SO/CPU/libc, versiones, URLs, closure, integridades, rutas y límites; no crear scripts/config ni sugerir ahora comandos con pins no resueltos, instalación global o `npx latest`. Solicitar como salida versiones/rutas reales, inventario/lock y digests/SRI, opciones que prueben scripts deshabilitados, logs sanitizados de instalación offline y manifest/lock pre=post, con fecha/owner. DevOps corrobora esa evidencia antes de promover tooling. Si el usuario no puede cumplir/verificar aislamiento o evidencia, mantener bloqueo; su ejecución no exime controles ni cierra G-OAS.

**AC-T09-PERMISOS:** cada request/entrada futura tiene ficha concreta y autorización trazable no consumida; una sola tentativa, cero redirects seguidos, cero retries/backoff y cero lifecycle scripts ejecutados. Ninguna instrucción de instalación por usuario omite versiones/URLs/integridades/lock, aislamiento o evidencia. El presupuesto exacto es prerrequisito, no un dato inventado en este delta.

### 9.6 Consistencia documental, cuestiones pendientes y siguiente acción

Cotejo limitado, **no PASS técnico ni dictamen**:
- **Pins/metadata:** §§3/3.1/3.1.1 conservados; #19 resuelve la transcripción, no engines ausentes, procedencia, tarballs, closure ni compatibilidad. §9.3 cambia intención/política de selección, no números ni hashes.
- **Política G-OAS:** los motores y semántica §§4–6 se mantienen; diez tuples, assertions, offline/refs y evidencia de generador no se relajan. `I/api-lint-policy.md` §§Disposición única y Matriz documental mantienen su autoridad; capabilities de una versión nueva requieren evidencia nueva.
- **Targets:** ADR-006 §§Contexto/Decisión propuesta respalda Kotlin/Java 21/Spring/ECS y React/Vercel como diseño existente; ninguna evidencia del PC se convierte en runtime cloud ni aprobación del ADR. Versiones efectivas Vercel no constan en esta lectura y permanecen por verificar.
- **Ownership/gates:** `I/gate-register.md` §Delta Governance y freeze/bundle L-07 mantiene Planner excluido de instalar/crear scripts; §Estado vigente — nueva firma SA mantiene residuales y gates. Permiso de tooling no es `verdict: ready` ni Human Plan Approval. No se edita shared para registrar aprobación inexistente.

**Cuestiones pendientes reales:** (a) evidencia local acotada del PC y Node/npm efectivos; (b) releases estables/versiones exactas y soporte declarado, en particular alternativa de evidencia ante `engines` ausente; (c) URLs/query scope concretos del descubrimiento y su confirmación exacta cuando corresponda; (d) closure/lock/integridad/procedencia y presupuesto numérico; (e) evidencia de capacidades del candidato sin cambiar semántica; (f) runtime/build frontend Vercel y versiones backend efectivos para sus fases propias, no como condición artificial de tooling local; (g) decisión específica sólo si aparece incompatibilidad que obligue a cambiar motor/diseño, rutas, riesgo o usar scripts. Política de selección, permiso genérico de instalar, owner/custodia de metadata y transcripción #19 **no son preguntas abiertas**.

**Siguiente acción de planificación:** preparar una ficha documental exacta de descubrimiento/identificación local antes de cualquier ejecución futura; si para fijarla falta evidencia, pedir sólo el aporte necesario o la confirmación de destinos concretos. No consultar registry ni inspeccionar PC para rellenarla en esta sesión. El cambio deja el pack #22 susceptible de refresh conforme su `refresh_when`; corresponde a `context-curator` cuando se solicite, **sin editarlo ni despacharlo aquí**. No cambia shared, gates ni arquitectura. G-OAS sigue abierto y AC-GOAS-07 conserva su bloqueo independiente; no se envía a Decomposer/Executor/Architect Executor. Tras los controles y revisión independiente que correspondan, sólo `ready` válido y aprobación humana contractual explícita podrían habilitar el handoff; ninguno existe por este delta.

**Evidencia y permisos de esta actualización:** lectura documental del pack #22, este plan y secciones canónicas citadas; escritura limitada a este plan y relectura del fragmento nuevo. Sin inspección del PC, búsqueda/listado de filesystem operativo, shell, red/Context7, descargas, instalación, ejecución de paquetes/scripts/G-OAS, creación de scripts/config/manifests, Git, scan ni medición de hashes/versiones. Los datos históricos no se recertifican. G-SCAN final permanece pendiente sobre los bytes nuevos. **AC-T09-CONSISTENCIA:** un único artefacto editado, estado de propuesta visible, pendientes y evidencia delimitados; no se registra aprobación humana de plan ni cierre de gate.

## 10. Propuesta de inventario mínimo y ambiente — resultado local DevOps, 2026-10-04

### 10.1 Autoridad, estado y ambiente efectivo reportado

**Lifecycle de este plan: `draft`, hasta lock exacto y evidencia exigida; `verdict: none`; G-OAS abierto.** Este delta sustituye sólo las incertidumbres de ambiente y el inventario incompleto de §§3/6/9. No cambia el lifecycle canónico del incremento (`planning` según pack/gates), no cierra gates y no habilita ejecución. La solicitud actual permite exclusivamente lectura documental local y edición de este plan; prohíbe red, descargas, instalaciones, npm/pnpm, scripts, CLI, scans y Git. No se prepara tooling ni se despacha a otros agentes.

**Procedencia del resultado local:** resultado de DevOps aportado en la solicitud humana actual, integrado como evidencia reportada, no como medición repetida por Planner. El pack #22 sigue siendo índice `incomplete`; sus afirmaciones de PC/Node desconocidos son anteriores a este aporte. No se reescribe pack/shared ni se atribuyen al pack datos nuevos.

| Ámbito | Estado reportado / consecuencia exacta |
|---|---|
| PC de validación | Omarchy 4.0.4 / Arch Linux, `x86_64`, glibc `2.44`. Las dependencias efectivas deben ser compatibles con este target, incluyendo opcionales o binarios nativos si los hubiera. |
| Runtime/gestores locales existentes | Node `26.7.0` vía mise, npm `11.19.0`, pnpm `12.3.4` **presentes**. No descargar, instalar, actualizar ni reemplazar Node/npm/pnpm. Reutilización futura read-only del ejecutable local mediante ruta real corroborada por DevOps; no cambiar mise, PATH global ni configuración del usuario. Rutas exactas/digests de ejecutables no aportados: faltan para ejecución trazable, no para definir paquetes candidatos. |
| Workspace | Sin manifests, lockfiles ni tooling según el resultado aportado. Redocly, Ajv/ajv-formats y OpenAPI Generator no instalados. No se afirma instalación de `yaml` o `jsonc-parser` fuera del workspace; no se necesita usar paquetes globales. |
| Toolchain de validación privada propuesta | `tools/goas/` **en la raíz del workspace**, no paquetes instalados en la raíz desnuda ni tooling de producto. Futuro `package.json`/`package-lock.json` propios, `node_modules`, caché/staging/procedencia privados conforme §3.4; estas rutas no se crean aquí. Se conserva npm y `package-lock.json` como diseño de §§3/9; pnpm disponible no implica migración a `pnpm-lock.yaml`, segundo lock ni instalación de otro gestor. |
| Backend de producto | Kotlin / Java 21 / Spring en AWS ECS Fargate. No equivale a JDK/JRE instalado en el PC. Compatibilidad del generado con Spring/Jackson y compilación pertenecen a G-BOOTSTRAP, no al lint/schema local. |
| Frontends de producto | React buyer/admin en Vercel. Versiones efectivas de build y runtime Vercel pendientes de verificar en su fase propia; no se infieren desde Node local ni bloquean la consulta de metadata del tooling. |

**AC-T10-ENV:** inventario futuro distingue ejecutables locales reutilizados de dependencias privadas a adquirir; no añade `node`, `npm`, `pnpm`, mise, JDK de producto, React ni Spring al manifest de G-OAS como medios para actualizar el PC/producto. Incompatibilidad con Node existente → bloqueo y decisión específica, no actualización tácita.

### 10.2 Inventario directo mínimo por responsabilidad

Se propone **cinco paquetes npm directos para el núcleo parse/lint/schema** y **una capacidad de generador obligatoria con vía de distribución pendiente**, no cinco herramientas que por sí solas cierren G-OAS. Los nombres siguientes son candidatos para metadata/adquisición; ninguna versión publicada se determina en esta sesión. Los transitivos efectivos se inventariarán después, sin fingir que esta lista es la closure.

| Responsabilidad separada | Package name / recurso candidato | Acceptance criteria de selección y cobertura |
|---|---|---|
| Parser YAML y claves duplicadas YAML | `yaml` | Evidencia versionada de parseo con diagnóstico de claves repetidas antes de convertir a objetos; rechazo de errores/tags no permitidos y límites de alias/tamaño/profundidad de §5. No delegar este control al lint ni permitir que la última clave sobrescriba la primera. |
| JSON estricto y claves duplicadas JSON | `jsonc-parser` (candidato adicional recomendado) | Verificar API de recorrido que conserve propiedades antes de materializarlas y permita detectar nombres decodificados repetidos **por objeto**, con ubicación. Exigir JSON estricto: rechazar comentarios, comas finales, contenido extra y errores aunque el parser sea tolerante; el adaptador futuro debe comprobar todos los diagnósticos. Un nombre repetido en objetos diferentes no es duplicado. `JSON.parse` solo no cumple. Si la API/capacidad no se acredita, mantener decisión pendiente, no usar el modo JSONC permisivo ni agregar otro paquete sin propuesta. |
| Lint OpenAPI 3.1 y bundles/refs | `@redocly/cli` | Lint bruto/dispuesto, reglas/severidades/pointers corroborados, únicamente diez tuples canónicas; siete roots + common documental, refs offline y equivalencia fuente/bundle. No valida payloads JSON Schema ni sustituye generador. |
| JSON Schema Draft 2020-12 | `ajv`, perfil Ajv 2020 | Evidencia del entrypoint 2020 y metschemas offline de la versión exacta; compile cinco schemas, resolución local de closure y matriz, sin coerción/defaults/eliminación de propiedades, con invariantes de §5. No asumir que el entrypoint por defecto implementa 2020-12. No añadir `ajv-cli` ni `ajv-draft-04` al mínimo. |
| Assertion de `format` | `ajv-formats`, separado de `ajv` | Compatibilidad exacta con Ajv; modo completo, `validateFormats` activo y controles uuid/date-time positivos/negativos con keyword de rechazo, incluida fecha imposible/sin zona. Unknown formats/dialecto siguen bloqueados hasta soporte explícito; instalar el plugin no acredita por sí solo assertion ni `int64`. |
| Generador AC-GOAS-07 | OpenAPI Generator: opción npm `@openapitools/openapi-generator-cli` **o** JAR `org.openapitools:openapi-generator-cli`, no selección cerrada | Evidencia `CLI validate`/`openApiValidate` y ensayo de generación aplicable sobre snapshot nuevo, con versión del motor y configuración real. Redocly, Ajv y ausencia de tooling no satisfacen AC-GOAS-07. El wrapper no es el motor; no inferir versión del JAR desde versión npm. Vía, JAR/JRE y config siguen pendientes en §10.4. |
| Runtime Node y gestor npm | Node `26.7.0` / npm `11.19.0`, ya disponibles | Constraints y soporte versionado de directos/transitivos evaluados contra estos valores y target PC; rutas reales registradas antes de usar. No forman parte de la adquisición npm de dependencias directas. pnpm `12.3.4` queda disponible sin uso propuesto ni cambio de lock. |

**Por qué el parser JSON adicional está en el mínimo propuesto:** §5 exige rechazo de claves JSON repetidas antes de pérdida de información, independiente de validación de schema. No hay adaptador/tooling implementado que lo acredite. Se recomienda un parser inspeccionable en vez de especificar un parser completo nuevo o asumir JSON estricto desde YAML. La selección definitiva de `jsonc-parser` depende de metadata, soporte y capacidad verificados; no es una afirmación de compatibilidad actual.

**AC-T10-INV:** cada responsabilidad tiene proveedor y prueba propia; un resultado de parse no se presenta como lint, lint no como assertion de formatos, y ninguno como prueba del generador. No agregar Jest/TypeScript/ts-node/Gradle/Docker/linters genéricos ni herramientas G-SCAN/G-API-GOV por comodidad al inventario mínimo G-OAS; cualquier necesidad nueva se propone por separado. Config/adaptador y controles serán trabajo posterior de un owner autorizado, nunca código escrito por Planner en esta sesión.

### 10.3 Fuentes npm candidatas exactas y ficha inicial de metadata

**Propuesta M-CORE, lista cerrada para futura confirmación específica; NO requests autorizadas por este documento.** Método candidato: un GET HTTPS de metadata completa por package name (packument), para disponer de releases, tiempos, dist-tags y metadata de versiones sin consultar `/latest`. Son URLs propuestas, no obtenidas mediante red ni prueba de publicación/identidad. La aprobación genérica de instalar no las autoriza automáticamente.

| Package name | URL candidata exacta de metadata M-CORE |
|---|---|
| `yaml` | `https://registry.npmjs.org/yaml` |
| `jsonc-parser` | `https://registry.npmjs.org/jsonc-parser` |
| `@redocly/cli` | `https://registry.npmjs.org/@redocly%2Fcli` |
| `ajv` | `https://registry.npmjs.org/ajv` |
| `ajv-formats` | `https://registry.npmjs.org/ajv-formats` |

Ficha candidata M-CORE: owner `devops-architect` ya designado para metadata; **5 requests máximo, uno por URL, sin redirects seguidos ni retries**; timeout 30 s/request y 300 s/etapa; límite propuesto **10 MiB por body y 50 MiB total**, también sobre contenido descomprimido, lectura interrumpida al excederlo. Custodia futura en `tools/goas/vendor/metadata/` y `tools/goas/provenance/` con staging privado §3.4, sin HOME ni evidencias G-OAS mezcladas. Presupuesto de custodia propuesta **100 MiB** para bodies/headers sanitizados/procedencia de esta ficha, sujeto a espacio/realpaths corroborados antes de ejecutar; conservar mientras las decisiones/gates dependan de estos cuerpos, sin sobrescribirlos ni limpiar silenciosamente. Un packument excedido → bloqueo y propuesta nueva, no fallback a otra URL. Esta ficha no incluye validación ejecutable ni resolución mediante npm/pnpm.

Campos solicitados: `name`, `dist-tags`, `time`, entradas `versions` y por candidato `version`, `deprecated`, `repository`, `license`, `engines`, `dependencies`, `peerDependencies`, `peerDependenciesMeta`, `optionalDependencies`, `os`, `cpu`, `libc`, `scripts`, `bin`/`exports` cuando existan y `dist` (tarball, integrity y datos de firmas/provenance disponibles). Preservar ausencia/null/valor literal; body/headers sanitizados, timestamp, URL solicitada/efectiva, HTTP/redirect/Location, tamaños y digests reales se registran por DevOps en fase autorizada. No consultar repositorios/documentación enlazados, claves de firma ni URLs de provenance por aparecer en campos JSON.

**Fuente candidata de adquisición posterior para cada paquete:** `dist.tarball` **literal de la versión exacta seleccionada** en metadata custodiada de `registry.npmjs.org`, con `dist.integrity` esperado y comparación SRI de §3.3. No inventar paths `.tgz` actuales, no reutilizar tarballs históricos como aprobación y no interpretar metadata como permiso de descargar. Manifest/lock/closure se concretan por separado; toda metadata transitiva/version-specific nueva exige lista exacta y confirmación antes del request. Dependencia git, mirror, CDN u otro host → stop, no autorización heredada del registry.

**M-GEN-NPM, opcional y separado de M-CORE:** sólo si el humano decide incluir investigación del wrapper, un GET candidato a `https://registry.npmjs.org/@openapitools%2Fopenapi-generator-cli`, owner/custodia iguales, un intento, 30 s/request, 300 s/etapa, 10 MiB body y 20 MiB custodia máxima. Esto elevaría la investigación a **6 paquetes**, pero no selecciona wrapper ni permite su instalación/ejecución, JAR o fuentes fuera de npm. No incluirlo automáticamente en la ficha de cinco requests.

**AC-T10-META:** M-CORE queda suficientemente delimitada para **solicitar confirmación de esas cinco URLs y sus límites**, sin esperar la closure ni decidir el generador; no queda autorizada/ejecutada. M-GEN-NPM es una confirmación separada u opción explícita en una ficha revisada. Cualquier URL/destino adicional vuelve a propuesta, incluso mismo host/nuevo path, y cada autorización consumida sigue consumida.

### 10.4 Generador: opciones conservadas y decisión pendiente

| Opción | Fuente candidata exacta / recurso | Coste y evidencia faltante; estado |
|---|---|---|
| Wrapper npm privado | Package `@openapitools/openapi-generator-cli`; metadata M-GEN-NPM; tarball npm posterior sólo desde `dist.tarball` confirmado | Wrapper y motor se fijan **independientemente**. Investigar cómo selecciona/obtiene el JAR y si intenta descarga en instalación o primer uso, scripts y necesidad de Java local; bloquear toda descarga automática. Metadata/tarball npm no autorizan ni acreditan el JAR. Opción pendiente, no elección como hecho. |
| JAR directo, sin wrapper | Coordenada Maven `org.openapitools:openapi-generator-cli`; fuente candidata Maven Central en `https://repo.maven.apache.org/maven2/org/openapitools/openapi-generator-cli/` | La URL identifica **la fuente/directorio candidato**, no una ficha de requests ni una URL de JAR versión exacta. Versión, paths de artifact/integridad/procedencia y soporte Java deben concretarse después de decidir la vía. **Fuera de registry npm, no autorizado**; requerir decisión y autorización explícita de cada destino/método antes de acceder. No consultar índice ni metadata Maven ahora. |
| Aporte offline del motor | JAR exacto y material de procedencia aportados por usuario/DevOps bajo ruta privada confirmada | Debe tener versión/origen, integridad esperada verificable y soporte Java; no basta un hash calculado sobre bytes de origen desconocido. Conserva control de custodia y permiso de ejecución. Alternativa a nueva fuente de red, no aporte existente afirmado. |

**No hay evidencia local suficiente para escoger wrapper frente a JAR.** No se presupone JRE/JDK local: Java 21 del backend es target de producto. Si falta Java requerido por el generador, se registra una necesidad nueva; este plan no selecciona distribución, versión, URL ni permite instalar Java globalmente. No añadir Docker/Gradle/plugin como tercera vía encubierta.

AC-GOAS-07 sigue bloqueado hasta resolver vía/versión de motor, runtime Java local soportado y **configuración real de tooling de generación**. Esa config deberá corroborar input/snapshot, generatorName/library/options efectivos, outputs externos y ensayo aplicable; esos valores no se inventan desde el stack ni desde el nombre del wrapper. Ausencia actual de manifests/build/config no satisface la alternativa documental de la política. Elegir vía de distribución tampoco certifica generado compatible con Spring/Java 21 o Vercel; compile/interoperabilidad de producto siguen G-BOOTSTRAP.

**AC-T10-GEN:** no adquisición/ejecución del generador hasta decisión durable, pins independientes cuando haya wrapper, integridad/procedencia, runtime local y configuración real corroborados. Ningún acceso fuera de npm ni descarga automática por wrapper se deriva de «instalar lo necesario». Si la evidencia obtenida exige otra decisión de diseño, retorna a Planner antes de ejecución.

### 10.5 Selección, decisiones humanas y consistencia final de la propuesta

**Política mantenida:** latest stable es un objetivo de selección tras verificar metadata/estabilidad, soporte/compatibilidad declarada y mutua, integridad/procedencia y capacidades del target A; no usar `latest`/rangos en manifest/lock finales. La metadata identifica un **candidato**, no un pin verificado. `engines` ausente no significa compatible; soporte insuficiente → bloqueo §9.4 y decisión explícita sobre alternativa, nunca actualización local automática. La integridad real de bytes sólo se verifica en adquisición autorizada posterior, no mediante campos JSON o hashes de bodies históricos. Controles de capacidad e instalación offline permanecen en fases autorizadas separadas.

El plan se mantiene **`draft` hasta que exista selección exacta de directos y closure, manifest/lock reproducibles, URLs/SRI/integridad/procedencia y compatibilidad corroboradas**, incluyendo motor de generador y runtime local reutilizado. Incluso entonces no hay promoción automática: G-OAS exige su evidencia propia y readiness contractual exige Validator y aprobación humana, sin handoff desde esta propuesta. No hay lock creado ni números nuevos seleccionados hoy.

| Dato pendiente | ¿Requiere decisión humana ahora? / siguiente tratamiento |
|---|---|
| Cinco URLs M-CORE y presupuesto | **Sí: confirmación específica del alcance de consulta**, no repetir autorización genérica de instalar. Ya suficientemente definido para presentarlo; cero requests en esta sesión. |
| `jsonc-parser` como candidato adicional mínimo | Incluido explícitamente en M-CORE; la confirmación de la ficha abarca **investigarlo**, no aceptar una versión/API no verificada ni instalarlo. Si no cubre controles estrictos, decisión técnica nueva antes de sustituirlo. |
| Wrapper npm vs JAR/aporte offline | **Sí: vía de investigación/distribución pendiente.** Puede aprobarse M-GEN-NPM para investigar sin escoger wrapper; cualquier consulta/acquisición Maven u otra fuente exige aprobación nueva exacta. La falta de esta decisión no bloquea M-CORE; sí bloquea completar AC-GOAS-07. |
| Node/npm/pnpm locales | **No se requiere elegir ni autorizar instalarlos**: ya disponibles, fuera de adquisición. Rutas/digests son datos de evidencia de DevOps para preparación/ejecución posterior. Incompatibilidad probada o Java local necesario requeriría nueva decisión específica, no upgrade automático. |
| Versiones npm, transitivos, integridad, soporte y capacidades | Datos por obtener en fases delimitadas, **no votar números sin evidencia**. Tras resolución: inventario/lock y URLs exactas de adquisición para confirmación, no autorización abierta de registry. |
| Config del generador y target de ensayo | Decisión técnica pendiente con evidencia/config real; si hay alternativas no resueltas, decisión del owner/humano antes del ensayo. No confundir con elección de wrapper ni G-BOOTSTRAP. |
| Runtime/build efectivos Vercel | Evidencia/decisión de su fase de producto, no prerequisito artificial de metadata M-CORE. No inferir ni seleccionar aquí. |

**Cotejo documental explícito (no PASS técnico):** `I/api-lint-policy.md` L21/23/38–40 exige formatos, generador y revalidación: §10 los separa y no sustituye AC-GOAS-07. `I/master-spec.md` §12 remite a esa política: permanece intacta. `I/gate-register.md` L12/24/43–50 separa G-OAS/G-BOOTSTRAP, outputs externos y excluye instalar/crear scripts por Planner: conservado. Matriz 21/seis MP en cortes históricos de master/gates no prevalece sobre policy L5 ni §5 del plan (27/13); no se corrigen canónicos aquí. §10 sustituye en el plan, de modo expreso, Node/npm desconocidos o por adquirir y generador excluido del inventario inicial; conserva bloqueos de ejecución. No contradice topología #22 ni convierte permiso genérico en destinos aprobados.

**Evidencia de esta sesión:** lectura local de este plan (incluido §9), pack #22, policy completa, gates completos y Master §§12–14/contexto inmediato. Escritura exclusivamente en este plan mediante `apply_patch`, seguida de relectura local. Sin red/Context7, consultas de releases, comandos, scans, Git, npm/pnpm, scripts, descargas, instalaciones ni mediciones del PC; sin editar shared, pack, gates ni canónicos. Pack susceptible de refresh por su owner tras esta escritura; no se actualiza ni se despacha aquí. G-SCAN final pendiente sobre bytes nuevos, ningún `ready` ni aprobación contractual afirmados.

**AC-T10-CIERRE:** propuesta suficiente para pedir confirmación M-CORE, generador explícitamente pendiente y Node/npm instalados separados de adquisición privada; lifecycle `draft`, G-OAS abierto, sin permisos implícitos ni handoff. Siguiente acción documental: presentar sólo confirmaciones de destinos/presupuestos y elección/investigación de generador que falten; no ejecutar ninguna en esta sesión.

## 11. Evidencia de captura 2026-10-04 — 5 GET de metadata M-CORE (noncanonical / WIP)

**Naturaleza de esta sección: transcripción durable de evidencia ya producida. Sección no canónica, en WIP.** No modifica §1–§10, no sustituye la política canónica ni los gates. **G-OAS sigue ABIERTO / NO cerrado**; lifecycle `draft`, Spec Validator `verdict: none`. **Ejecución limitada a metadata:** sin descarga de tarballs, sin instalación, sin ejecución de paquetes ni scripts, sin corrida G-OAS, sin Git. **Política de red conservada:** **una sola solicitud por URL**, **sin retries/backoff**, **sin seguimiento de redirects** (`curl --max-redirs 0`, sin `-L`). Esta sesión **no hizo ninguna petición de red**: todo se transcribe de artefactos ya presentes en el repo.

**Fuentes leídas (run `20261004T191337Z`):** `tools/goas/provenance/CAPTURE-REPORT-20261004T191337Z.md`, `tools/goas/provenance/analysis-npm-metadata.20261004T191337Z.json`, `tools/goas/provenance/manifest-20261004T191337Z.sha256`, `tools/goas/provenance/fetch-20261004T191337Z.log`, `tools/goas/provenance/headers-npmjs-<pkg>.20261004T191337Z.txt` (5) y `tools/goas/vendor/metadata/npmjs-<pkg>.20261004T191337Z.json` (5).

### 11.1 URLs exactas, resultado HTTP y política cumplida

| # | Paquete | URL exacta solicitada | HTTP | Redirects | `Location` | Solicitudes | Transcurrido (s) | Bytes |
|---|---|---|---|---|---|---|---|---|
| 1 | `yaml` | `https://registry.npmjs.org/yaml` | `200` | 0 | ausente | 1 | 0.392 | 386415 |
| 2 | `jsonc-parser` | `https://registry.npmjs.org/jsonc-parser` | `200` | 0 | ausente | 1 | 0.379 | 102715 |
| 3 | `@redocly/cli` | `https://registry.npmjs.org/@redocly%2Fcli` | `200` | 0 | ausente | 1 | 0.768 | 2458147 |
| 4 | `ajv` | `https://registry.npmjs.org/ajv` | `200` | 0 | ausente | 1 | 0.932 | 1142658 |
| 5 | `ajv-formats` | `https://registry.npmjs.org/ajv-formats` | `200` | 0 | ausente | 1 | 0.146 | 141264 |

- **5/5 `HTTP 200`, cero redirects, sin cabecera `Location`, una solicitud por URL, `curl_exit=0` en los cinco intentos.** Verificación por lectura local: las cinco cabeceras abren con `HTTP/2 200` y contienen **0** ocurrencias de `location:`; el log registra `location_header=` vacío en los cinco bloques.
- **Total de bodies: 4231199 bytes (~4,03 MiB)**, dentro de los límites de la ficha (10 MiB por body, 50 MiB total). Timeout propuesto 30 s/request y 300 s/etapa: transcurrido máximo observado 0.932 s.
- **Una sola tentativa por consulta, cero retries, cero redirects seguidos.** El run **está consumido**; no habilita repetición ni nuevas URLs.

### 11.2 Artefactos, rutas, SHA-256 y bytes exactos

Hashes **leídos de `manifest-20261004T191337Z.sha256`**; bytes exactos de los cuerpos **leídos de `CAPTURE-REPORT-20261004T191337Z.md` y `analysis-npm-metadata.20261004T191337Z.json`**; ambos cotejados entre sí sin discrepancia. La lectura local de los cinco cuerpos reproduce exactamente los hashes del manifiesto. Los tamaños de cabeceras y de los cuatro artefactos de provenance provienen de la lectura local de disco.

| Artefacto (ruta relativa a la raíz activa) | UTC | SHA-256 | Bytes |
|---|---|---|---|
| `tools/goas/vendor/metadata/npmjs-yaml.20261004T191337Z.json` | `2026-10-04T19:14:06Z` | `ad712932fc55443ad3c4e4033717553f8a90814f9eee776a706d852375dce964` | 386415 |
| `tools/goas/vendor/metadata/npmjs-jsonc-parser.20261004T191337Z.json` | `2026-10-04T19:14:06Z` | `fc60fa698bcffe094f5c6ccf9d47fca18d236c3135020fe362b0dfb6cab490a3` | 102715 |
| `tools/goas/vendor/metadata/npmjs-redocly-cli.20261004T191337Z.json` | `2026-10-04T19:14:07Z` | `d0047d7f8b4b522f99ea9a2c5cce043105f7829f87f15a31c0857723bddaf759` | 2458147 |
| `tools/goas/vendor/metadata/npmjs-ajv.20261004T191337Z.json` | `2026-10-04T19:14:08Z` | `799734d4d891f673173149e92d3a25bfb8c25d24ced218f4e839c83757cfc238` | 1142658 |
| `tools/goas/vendor/metadata/npmjs-ajv-formats.20261004T191337Z.json` | `2026-10-04T19:14:08Z` | `f29397500377fbca77948d710f7434fd3d190fe2c29ab5eb46f20d69b4400816` | 141264 |

| Cabeceras HTTP (provenance) | SHA-256 | Bytes |
|---|---|---|
| `tools/goas/provenance/headers-npmjs-yaml.20261004T191337Z.txt` | `485ae434750d747de3b762fb430898baf487673e6d2c741f1a179e8b7eb9f28f` | 912 |
| `tools/goas/provenance/headers-npmjs-jsonc-parser.20261004T191337Z.txt` | `d1bc9c36cd8371f417b330126efd53213c6f0ef6ce16300b18e4d3b516e2fc6e` | 911 |
| `tools/goas/provenance/headers-npmjs-redocly-cli.20261004T191337Z.txt` | `444612a6c05e2b2cae30b342350daad569d30790ea504828a3c90a9506a1d694` | 904 |
| `tools/goas/provenance/headers-npmjs-ajv.20261004T191337Z.txt` | `58e1ead1dc934dc204d34870031727e213654b55bb7dc3205fde20f10730f6b7` | 914 |
| `tools/goas/provenance/headers-npmjs-ajv-formats.20261004T191337Z.txt` | `2cece711efbaac5c4ce1dd78dfae389a32491ea314e63a72b213d20f29ea95e9` | 910 |

| Otros artefactos del run | Ruta | Bytes |
|---|---|---|
| Reporte de captura | `tools/goas/provenance/CAPTURE-REPORT-20261004T191337Z.md` | 4373 |
| Análisis estructurado | `tools/goas/provenance/analysis-npm-metadata.20261004T191337Z.json` | 8259 |
| Manifiesto SHA-256 | `tools/goas/provenance/manifest-20261004T191337Z.sha256` | 1448 |
| Log de ejecución | `tools/goas/provenance/fetch-20261004T191337Z.log` | 2053 |

**Estos SHA-256 son la huella de los JSON de metadata y de los archivos de cabeceras capturados.** No son hash de tarball, ni digest de lock/closure, ni prueba de autenticidad del publisher.

### 11.3 Candidatos `latest stable` preliminares y `engines` declarados

**Distinción obligatoria:** `dist-tags.latest` es un **puntero del registry**; el criterio **«latest stable»** de §§9.3/10.5 exige verificar estabilidad, soporte, compatibilidad declarada y mutua, integridad/procedencia y capacidades del target A. **Esa verificación NO se hizo.** Por tanto los valores siguientes son **candidatos preliminares para resolución**, no selección, no pin fijado, no compatibilidad verificada, no closure.

| Paquete | `dist-tags.latest` (tag) | Candidato preliminar `latest stable` | ¿Prerelease? | Otros `dist-tags` conservados aparte |
|---|---|---|---|---|
| `yaml` | `2.9.1` | `2.9.1` | no | `next` `3.0.0-2` (prerelease) |
| `jsonc-parser` | `3.3.1` | `3.3.1` | no | `next` `4.0.0-next.2` (prerelease) |
| `@redocly/cli` | `2.57.0` | `2.57.0` | no | `next` `2.0.0-next.10`, `snapshot` `0.0.0-snapshot.1790673161` (prerelease); `v1-archive` `1.34.20` |
| `ajv` | `8.20.0` | `8.20.0` | no | `beta` `8.11.1`, `4.x` `4.11.8`, `legacy` `6.15.0` |
| `ajv-formats` | `3.0.1` | `3.0.1` | no | `beta` `3.0.0-rc.0` (prerelease) |

Los tags prerelease se **conservan aparte**: no se promueven a candidato ni se descartan por decisión propia; quedan fuera del criterio «latest stable» de esta sección.

| Paquete | `engines` declarado en la versión candidata | Lectura para el target |
|---|---|---|
| `yaml@2.9.1` | `{ "node": ">= 14.6" }` | Declarado. |
| `@redocly/cli@2.57.0` | `{ "npm": ">=10", "node": ">=22.12.0 \|\| >=20.19.0 <21.0.0" }` | Declarado. |
| `jsonc-parser@3.3.1` | **ausente (no `null`)** | **Compatibilidad NO declarada** |
| `ajv@8.20.0` | **ausente (no `null`)** | **Compatibilidad NO declarada** |
| `ajv-formats@3.0.1` | **ausente (no `null`)** | **Compatibilidad NO declarada** |

`engines` ausente **no significa «sin restricciones» ni compatible**: aplica la detención `Blocked: compatibilidad no declarada` de §9.4. El análisis reporta como base `node 26.7.0` / `npm 11.19.0` sobre Linux Arch/Omarchy x86_64 glibc 2.44 (dato reportado, **no medido ni modificado en esta sesión**; sin instalación ni actualización de runtimes); según ese reporte cumple lo declarado por `yaml` y `@redocly/cli`, y para los tres paquetes sin `engines` **no hay compatibilidad declarada que evaluar**.

### 11.4 Dependencias declaradas exactas y URLs transitivas pendientes

| Paquete candidato | `dependencies` declaradas (literales) | `peerDependencies` / `optionalDependencies` |
|---|---|---|
| `yaml@2.9.1` | ninguna (campo ausente) | ninguna (campos ausentes) |
| `jsonc-parser@3.3.1` | ninguna (campo ausente) | ninguna (campos ausentes) |
| `@redocly/cli@2.57.0` | **cero `dependencies` declaradas** (campo ausente; sin `peerDependencies` ni `optionalDependencies`) | ninguna (campos ausentes) |
| `ajv@8.20.0` | `fast-deep-equal` `^3.1.3`, `fast-uri` `^3.0.1`, `json-schema-traverse` `^1.0.0`, `require-from-string` `^2.0.2` | ninguna |
| `ajv-formats@3.0.1` | `ajv` `^8.0.0` | `ajv` `^8.0.0` (peer), `peerDependenciesMeta.ajv.optional: true` |

**Cuatro URLs transitivas a consultar según el reporte — PENDIENTES y NO AUTORIZADAS AÚN** (no se consultaron en este run ni en esta sesión):

1. `https://registry.npmjs.org/fast-deep-equal` — para `ajv@8.20.0` dependencies
2. `https://registry.npmjs.org/fast-uri` — para `ajv@8.20.0` dependencies
3. `https://registry.npmjs.org/json-schema-traverse` — para `ajv@8.20.0` dependencies
4. `https://registry.npmjs.org/require-from-string` — para `ajv@8.20.0` dependencies

`ajv` **ya está capturado en este run** (dependencia/peer de `ajv-formats`), por lo que no requiere URL nueva en esa lista. **Toda URL adicional, incluida cualquier expansión de segundo nivel, exige ficha y confirmación nuevas** (§9.5); esta sección no autoriza ninguna.

**Sobre `@redocly/cli`:** declara **cero `dependencies`**, pero **los internals del bundle NO fueron inspeccionados** (el tarball no se descargó ni abrió). No se afirma que el paquete no necesite dependencias en runtime; queda como desconocido explícito.

### 11.5 `dist.integrity` y `dist.tarball` como metadata solamente

Ambos campos se **leyeron del JSON capturado**; **ningún `.tgz` fue solicitado ni descargado**.

| Paquete · versión | `dist.integrity` (dato declarado) | `dist.tarball` (dato declarado) / adquisición |
|---|---|---|
| `yaml@2.9.1` | `sha512-3NxN8+78OdzbT7C/WjGsyfPAtJaN3FNDsWxv7Y7mcDsT/oOmgW8BpyQQFFBnvZE3j9Y2Sdz1ULFLezL7Eb2yFw==` | `https://registry.npmjs.org/yaml/-/yaml-2.9.1.tgz` — **NO descargado** |
| `jsonc-parser@3.3.1` | `sha512-HUgH65KyejrUFPvHFPbqOY0rsFip3Bo5wb4ngvdi1EpCYWUQDC5V+Y7mZws+DLkr4M//zQJoanu1SP+87Dv1oQ==` | `https://registry.npmjs.org/jsonc-parser/-/jsonc-parser-3.3.1.tgz` — **NO descargado** |
| `@redocly/cli@2.57.0` | `sha512-1d5fVyUaYlMNgCHUoyE2vUyxBhs/jmOHgsX/kFmfWzESw4f/G/OV/SU9E55rU7aUNmw9rHj1vXmL6yUdIn+KKQ==` | `https://registry.npmjs.org/@redocly/cli/-/cli-2.57.0.tgz` — **NO descargado** |
| `ajv@8.20.0` | `sha512-Thbli+OlOj+iMPYFBVBfJ3OmCAnaSyNn4M1vz9T6Gka5Jt9ba/HIR56joy65tY6kx/FCF5VXNB819Y7/GUrBGA==` | `https://registry.npmjs.org/ajv/-/ajv-8.20.0.tgz` — **NO descargado** |
| `ajv-formats@3.0.1` | `sha512-8iUql50EUR+uUcdRQ3HDqa6EVyo3docL8g5WJ3FNcWmu62IbkGUue/pEyLBW8VGKKucTPgqeks4fIU1DA4yowQ==` | `https://registry.npmjs.org/ajv-formats/-/ajv-formats-3.0.1.tgz` — **NO descargado** |

**Límites de evidencia de esta sección:**

- Los hashes/`dist.integrity` son **declaraciones del registry** y, en el caso de los SHA-256 de §11.2, la **huella de los JSON capturados**. **No son verificación de autenticidad** del publisher, **ni verificación de integridad de ningún tarball**. §3.3 sigue exigiendo comparación SRI sobre bytes reales en una adquisición autorizada.
- **No se declara compatible verificado ni closure de dependencias:** sólo metadata de cinco paquetes directos. Desconocidos abiertos: transitivos de segundo nivel de las cuatro dependencias de `ajv`, compatibilidad real de los tres paquetes con `engines` ausente, internals/bundle de `@redocly/cli` e integridad real de los tarballs.
- **Sin instalación:** ninguna herramienta G-OAS se afirma instalada ni ejecutable; no hay `package.json`, lock, `node_modules` ni corrida G-OAS por este delta. **G-OAS permanece ABIERTO.**
- **Pins históricos no sustituidos destructivamente:** §3.1/§3.1.1 conservan `@redocly/cli@2.57.0`, `ajv@8.17.1`, `ajv-formats@3.0.1` y `yaml@2.8.1` como registro histórico intacto. Aquí `yaml@2.9.1`, `jsonc-parser@3.3.1` y `ajv@8.20.0` se presentan **sólo como candidatos preliminares para resolución** (§9.3); `@redocly/cli@2.57.0` y `ajv-formats@3.0.1` **coinciden numéricamente** con el pin histórico, lo que **no equivale a selección verificada**.
- **Estado:** lifecycle `draft`, `verdict: none`, **G-OAS abierto**, sin readiness, sin handoff, sin cierre de gates. La autorización de red de este run está **consumida**; las URLs transitivas de §11.4 siguen **pendientes y no autorizadas aún** *(corte de §11, conservado como registro histórico; el estado vigente de esas cuatro URLs está en §12)*.

## 12. Evidencia de captura 2026-10-04 — 4 GET de metadata transitiva de `ajv@8.20.0` (noncanonical / WIP)

**Naturaleza de esta sección: transcripción durable de la captura metadata transitiva ya ejecutada y custodiada bajo `tools/goas/`. Sección no canónica, en WIP.** No modifica §1–§11, no sustituye la política canónica ni los gates. **G-OAS permanece ABIERTO / NO cerrado**; lifecycle `planning` (`draft` en este plan), Spec Validator `verdict: none`. **Ejecución limitada a metadata:** sin descarga de tarballs, sin instalación, sin ejecución de paquetes ni scripts, sin corrida G-OAS, sin Git. **Política de red conservada:** **una sola solicitud por URL**, **sin retries/backoff**, **sin seguimiento de redirects**. Esta sesión **no hizo ninguna petición de red**: todo se transcribe de artefactos ya presentes en el repo (run `20261004T194645Z`).

### 12.1 Autorización literal, URLs exactas y política de requests

**Autorización humana 2026-10-04 — exactamente cuatro GET de metadata:** el alcance autorizado es **cuatro (4) GET** de metadata sobre `registry.npmjs.org`, **uno por URL**, sin ninguna otra solicitud, endpoint, dominio ni descarga. Registrada desde la solicitud humana actual (fuera del repo, mismo criterio de procedencia que los mandatos #20–#23 del pack).

- **Verbatim de la frase de autorización (mensaje de usuario 2026-10-04, fuera del repo):** «si, te autorizo». **Alcance asociado a esa frase:** exactamente las **cuatro URLs** de la tabla de §12.1 (`fast-deep-equal`, `fast-uri`, `json-schema-traverse`, `require-from-string`), **1 GET por URL**, **sólo metadata** sobre `registry.npmjs.org`, **sin redirects, sin retries/backoff**, **sin descarga de tarballs, sin instalación, sin corrida G-OAS**. Registro fiel de la autorización disponible; **sin ampliación** a ningún otro dominio, endpoint ni request.

| # | Paquete (nombre) | URL exacta solicitada | HTTP | UTC (server `date`) | Redirects | `Location` | Solicitudes | Transcurrido (s) | `exit` |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `fast-deep-equal` | `https://registry.npmjs.org/fast-deep-equal` | `200` | `2026-10-04T19:46:45Z` | 0 | ausente | 1 | 0.149517 | 0 |
| 2 | `fast-uri` | `https://registry.npmjs.org/fast-uri` | `200` | `2026-10-04T19:46:46Z` | 0 | ausente | 1 | 0.133234 | 0 |
| 3 | `json-schema-traverse` | `https://registry.npmjs.org/json-schema-traverse` | `200` | `2026-10-04T19:46:46Z` | 0 | ausente | 1 | 0.153701 | 0 |
| 4 | `require-from-string` | `https://registry.npmjs.org/require-from-string` | `200` | `2026-10-04T19:46:46Z` | 0 | ausente | 1 | 0.098171 | 0 |

- **4/4 `HTTP 200`**, ventana UTC **`19:46:45Z`–`19:46:46Z`** del `2026-10-04` (run `20261004T194645Z`), **cero redirects**, **sin cabecera `Location`**, **una sola solicitud por URL**, **sin retries ni backoff**. Verificación por lectura local: las cuatro cabeceras abren con `HTTP/2 200` y contienen **0** ocurrencias de `location:`.
- Límites del run reportados: `--max-redirs 0`, `--max-time 30` (30 s/request), `--max-filesize 10485760` (10 MiB/body). Sin `HEAD`, sin otro endpoint ni dominio, **sin descarga de tarballs**. Total de bodies: **224633 bytes (~0,21 MiB)**.
- **Ejecutor:** los artefactos del run **no nombran ejecutor**; no se atribuye a ningún agente. **Permisos de estos cuatro requests: CONSUMIDOS y NO ampliados** (§12.9).

### 12.2 Artefactos del run `20261004T194645Z` — rutas y custodia

Run id: **`20261004T194645Z`**. Fuentes leídas en esta sesión (sólo lectura local, sin red):

| Artefacto (ruta relativa a la raíz activa) | Bytes |
|---|---|
| `tools/goas/provenance/CAPTURE-REPORT-ajv820-frontier.20261004T194645Z.md` | 4565 |
| `tools/goas/provenance/sha256-ajv820-frontier.20261004T194645Z.txt` | 1657 |
| `tools/goas/provenance/fetch-ajv820-closure.20261004T194645Z.log` | 1764 |
| `tools/goas/provenance/headers-npmjs-fast-deep-equal.20261004T194645Z.txt` | 912 |
| `tools/goas/provenance/headers-npmjs-fast-uri.20261004T194645Z.txt` | 912 |
| `tools/goas/provenance/headers-npmjs-json-schema-traverse.20261004T194645Z.txt` | 911 |
| `tools/goas/provenance/headers-npmjs-require-from-string.20261004T194645Z.txt` | 909 |
| `tools/goas/vendor/metadata/npmjs-fast-deep-equal.20261004T194645Z.json` | 48634 |
| `tools/goas/vendor/metadata/npmjs-fast-uri.20261004T194645Z.json` | 137334 |
| `tools/goas/vendor/metadata/npmjs-json-schema-traverse.20261004T194645Z.json` | 23537 |
| `tools/goas/vendor/metadata/npmjs-require-from-string.20261004T194645Z.json` | 15128 |

### 12.3 Bytes y SHA-256 completos (leídos del manifest local)

SHA-256 **leídos de `tools/goas/provenance/sha256-ajv820-frontier.20261004T194645Z.txt`**; bytes de los cuerpos **leídos del reporte y de los headers**; cotejados entre sí sin discrepancia. La lectura local de los cuatro cuerpos reproduce exactamente los hashes del manifiesto.

| Cuerpo (relativo a la raíz activa) | Bytes | SHA-256 |
|---|---|---|
| `tools/goas/vendor/metadata/npmjs-fast-deep-equal.20261004T194645Z.json` | 48634 | `490d6b92e71413bba95d4c6dc9015e3ff974aa56db066cf756310c3bb78b85a2` |
| `tools/goas/vendor/metadata/npmjs-fast-uri.20261004T194645Z.json` | 137334 | `7d999d8c49bad0132be2ac5828b35d560e63f4a9d02b394ca384cbd97fca46eb` |
| `tools/goas/vendor/metadata/npmjs-json-schema-traverse.20261004T194645Z.json` | 23537 | `b9c213075bc26f316fd5a3d9393401cf13a28ca05b26dce2d07b0d007e490d04` |
| `tools/goas/vendor/metadata/npmjs-require-from-string.20261004T194645Z.json` | 15128 | `306a04f6125642e8b422a90fc24033ba250946584d9510175467390773b928b5` |

| Cabeceras HTTP (provenance) | Bytes | SHA-256 |
|---|---|---|
| `tools/goas/provenance/headers-npmjs-fast-deep-equal.20261004T194645Z.txt` | 912 | `66d4e7a72649a9d2a52d4ea08976637b0d1d8a4113b4aaeee46874851ce1b91b` |
| `tools/goas/provenance/headers-npmjs-fast-uri.20261004T194645Z.txt` | 912 | `2d0987a93c3c2acd92edef9c409bf03fe5d13b7b00513a3579d13a7b6d6694e8` |
| `tools/goas/provenance/headers-npmjs-json-schema-traverse.20261004T194645Z.txt` | 911 | `c0e572425636dac4eb7bb6189aadab1e8f9c5580dd18c2432788907e03c2efc2` |
| `tools/goas/provenance/headers-npmjs-require-from-string.20261004T194645Z.txt` | 909 | `6a93ae0575ac32ee10f1c529384d501ace9e3fcffba1c0a2d9f63e4a757efb29` |

**Estos SHA-256 son la huella de los JSON de metadata y de los archivos de cabeceras capturados.** No son hash de tarball, ni digest de lock/closure, ni prueba de autenticidad del publisher.

### 12.4 Candidatos contra los rangos de `ajv@8.20.0`

Rangos literales de `ajv@8.20.0` (`dependencies`): `fast-deep-equal` `^3.1.3`, `fast-uri` `^3.0.1`, `json-schema-traverse` `^1.0.0`, `require-from-string` `^2.0.2`.

| Paquete | Rango literal en `ajv@8.20.0` | Candidato seleccionado en rango | ¿Satisface el rango? | `dist-tags.latest` | ¿`latest` dentro del rango? |
|---|---|---|---|---|---|
| `fast-deep-equal` | `^3.1.3` | **3.1.3** | **sí** (`3.1.3` ∈ `^3.1.3`) | `3.1.3` | sí (igual al candidato) |
| `fast-uri` | `^3.0.1` | **3.1.8** | **sí** (`3.1.8` ∈ `^3.0.1`) | `4.2.1` | **no — `4.x` fuera de rango** |
| `json-schema-traverse` | `^1.0.0` | **1.0.0** | **sí** (`1.0.0` ∈ `^1.0.0`) | `1.0.0` | sí (único estable en rango) |
| `require-from-string` | `^2.0.2` | **2.0.2** | **sí** (`2.0.2` ∈ `^2.0.2`) | `2.0.2` | sí (único estable en rango) |

- **Prereleases excluidos** (p. ej. `fast-deep-equal` `3.0.0-beta.*`), no seleccionados.
- Tags conservados aparte: `fast-uri` `three` = `3.1.8`, `two` = `2.4.7`; `fast-deep-equal` `beta` = `3.0.0-beta.2`.
- Son **candidatos dentro del rango para resolución**, no pins fijados ni selección verificada (§9.3).

### 12.5 `engines`, `dependencies`, `peerDependencies` y `optionalDependencies` exactos

| Paquete @ versión | `engines` | `dependencies` | `peerDependencies` | `optionalDependencies` |
|---|---|---|---|---|
| `fast-deep-equal@3.1.3` | **ausente (no declarada)** | **ausente — ninguna runtime dependency declarada** | ausente | ausente |
| `fast-uri@3.1.8` | **ausente (no declarada)** | **ausente — ninguna runtime dependency declarada** | ausente | ausente |
| `json-schema-traverse@1.0.0` | **ausente (no declarada)** | **ausente — ninguna runtime dependency declarada** | ausente | ausente |
| `require-from-string@2.0.2` | `{ "node": ">=0.10.0" }` | `{}` — declarado y **vacío** (cero entradas) | ausente | ausente |

- `peerDependenciesMeta` **ausente** en los cuatro. `require-from-string` declara **`node >=0.10`** (`">=0.10.0"`); **los demás no declaran runtime deps ni engines**.
- **`engines` ausente = NO declarada**: no significa «sin restricciones» ni compatible. **No se declara compatibilidad `engines` verificada para ninguno de los cuatro** (incluido `require-from-string`, cuyo `engines` está declarado pero **no evaluado** contra el runtime).

### 12.6 `dist.integrity` y `dist.tarball` — valores de metadata solamente

Ambos campos se **leyeron del JSON capturado**; **ningún `.tgz` fue solicitado ni descargado**, y **ninguno fue verificado**.

| Paquete · versión | `dist.integrity` (dato declarado, NO verificado) | `dist.tarball` (dato declarado) / adquisición |
|---|---|---|
| `fast-deep-equal@3.1.3` | `sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==` | `https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz` — **NO descargado** |
| `fast-uri@3.1.8` | `sha512-GZMtZUTNRpOVIECoXwLNZS5xUGE+mVNbTB8h/7Rwh2TFWcBQiPzTgyZi05BF9UMZKkLJv8XBRJTlU7zg8+ZfMg==` | `https://registry.npmjs.org/fast-uri/-/fast-uri-3.1.8.tgz` — **NO descargado** |
| `json-schema-traverse@1.0.0` | `sha512-NM8/P9n3XjXhIZn1lLhkFaACTOURQXjWhV4BA/RnOv8xvgqtqpAX9IO4mRQxSx1Rlo4tqzeqb0sOlruaOy3dug==` | `https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-1.0.0.tgz` — **NO descargado** |
| `require-from-string@2.0.2` | `sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==` | `https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz` — **NO descargado** |

### 12.7 Frente de 4 nodos sin URLs nuevas; closure global NO declarada

- **Ninguno de los cuatro candidatos declara nuevas `dependencies`/`peerDependencies`/`optionalDependencies`** → **este frente de 4 nodos no aporta URLs nuevas** al inventario de `§11.4`/`§9.5`. No hay segunda URL que solicitar por este nivel.
- **NO se declara la closure global de `ajv@8.20.0` ni la del tooling:** la declaración es únicamente «este nivel no añade dependencias declaradas». Faltan, entre otros: **inspección del bundle de `@redocly/cli`** (tarball no descargado ni abierto; cero `dependencies` declaradas ≠ cero dependencias en runtime) y **generador no resuelto** (§10.4). **Desconocido explícito:** cualquier dependencia no declarada en `package.json` de estos cuatro paquetes (bundle/`node_modules` embebidos) **no fue inspeccionada**.

### 12.8 «Latest estable» sujeto a rango y a la policy aprobada

**La «latest estable» se selecciona SUJETA al rango declarado y a la policy aprobada (§9.3): no se sigue `dist-tags.latest` si cae fuera del rango.** Caso registrado: `fast-uri` `dist-tags.latest` = **`4.2.1` (fuera de `^3.0.1`)** → **no se toma**; el candidato en rango es **`3.1.8`** (coincidente con el tag `three`). Los otros tres `latest` sí caen dentro de su rango. La verificación completa de «latest estable» (estabilidad, soporte, compatibilidad declarada y mutua, integridad/procedencia, capacidades del target A) **NO se hizo**; §12.4 registra candidatos para resolución.

### 12.9 Límites de evidencia, permisos consumidos y estado

- **NO se declara:** compatibilidad `engines` verificada · lock cerrado/reproducible · integridad de tarballs · autenticidad/procedencia del publisher · instalación · corrida **G-OAS**. **G-OAS permanece ABIERTO / NO cerrado.**
- **Estado:** lifecycle `planning` (`draft` en este plan), Spec Validator **`verdict: none`**, lane `feature`, sin readiness, sin handoff, sin cierre de gates.
- **Permisos de estos cuatro requests: CONSUMIDOS y NO ampliados.** No se autoriza repetición, segunda tentativa, `HEAD`, otros endpoints/dominios, tarballs, transitivos, instalación ni ejecución. Toda URL nueva exige ficha y confirmación nuevas (§9.5/§3.2).
- **Alcance de escritura:** sólo este plan y el shared; **sin tocar contratos, APIs, schemas, README, Master, `gate-register`, pack ni la metadata capturada** en `tools/goas/`. **Sin instalación y sin Git.**
- **Precedencia sobre §11:** §11.4 («PENDIENTES y NO AUTORIZADAS AÚN») y la última línea de §11 quedan **históricas** para estas cuatro URLs; el estado vigente es **consultadas, HTTP 200 y autorización consumida** (§12.1–§12.3). §11 y sus pins/`latest stable` preliminares **no se reescriben**.
- **Pins históricos no sustituidos:** §3.1/§3.1.1 (`@redocly/cli@2.57.0`, `ajv@8.17.1`, `ajv-formats@3.0.1`, `yaml@2.8.1`) y los candidatos de §11 (`yaml@2.9.1`, `jsonc-parser@3.3.1`, `ajv@8.20.0`, …) **se conservan intactos**; §12 **no** fija ningún pin ni selección final.

## 13. Evidencia 2026-10-05 — generador G-OAS: Maven metadata/POMs, JAR staged y runtime Java (noncanonical / WIP)

**Naturaleza de esta sección: transcripción durable de la evidencia NUEVA del generador ya producida (reportes de DevOps de esta conversación + artefactos custodiados bajo `tools/goas/`). Sección no canónica, en WIP.** No modifica §1–§12, no sustituye la política canónica ni los gates. **G-OAS permanece ABIERTO / NO cerrado**; lifecycle `planning` (`draft` en este plan), Spec Validator `verdict: none`. **Sin descarga ni instalación de paquetes npm, sin ejecución del generador, sin resultado G-OAS, sin Git.** Esta sesión **no hizo ninguna petición de red ni ejecutó, extrajo ni instaló nada**: sólo leyó artefactos locales; los run ids/UTC son transcripciones literales de los reportes. Los artefactos de estos runs **no nombran ejecutor**; la solicitud los atribuye a DevOps (`devops-architect`) — mismo criterio que §12.1.

### 13.1 Autorización del método SHA-1 por header tras los 404 de los sidecars

- **Autorización humana:** el usuario autorizó el **método SHA-1 por header** (`X-Checksum-SHA1`) de la **misma respuesta** del GET del JAR, **tras el `404` de `.jar.sha512`** (run `20261004T234041Z`, server `2026-10-04T23:40:41Z`, `x-amz-error-code: NoSuchKey`, 554 B, `num_redirects=0`, sin retry) **y el `404` de `.jar.sha256`** (run `20261005T004812Z-a7f3`, server `Mon, 05 Oct 2026 00:48:24 GMT`, `404`/`NoSuchKey`, `size_download=554`, `num_redirects=0`, sin retry), **exactamente sobre `openapi-generator-cli-7.25.0.jar`** — ninguna otra versión, sidecar, host ni endpoint.
- **Alcance del intento del JAR:** exactamente **1 GET** HTTPS; `--max-redirs 0` (cero redirects seguidos), `attempts=1` (sin retries/backoff), sin `HEAD`, curlrc deshabilitado (`-q`), `--max-filesize 104857600` (100 MiB).
- **Límite de autenticidad (no sobrestimar la procedencia):** el `X-Checksum-SHA1` proviene del **mismo servidor/CDN (Cloudflare → S3 Maven Central) que sirvió el cuerpo** → **consistencia interna de transferencia**, **no** checksum independiente, **no** autenticidad ni procedencia del publicador. **SHA-1 criptográficamente debilitado**; el JAR **no lleva firma embebida**; **sin PGP ni atestación de provenance** en este flujo; existe **sólo custodia SHA-256 local**. `CF-Cache-Status: HIT` (`Age: 923089`): cuerpo desde caché del CDN, misma cadena de confianza que el header. `X-Checksum-MD5`/ETag `e01eddf220074439f733bdf6e8c3daad` coherentes entre sí; MD5 **no recalculado** (fuera de alcance).

### 13.2 Metadata Maven y POMs versionados — consultados y capturados, sin ejecución

Cada recurso = **1 GET autorizado** reportado, `--max-redirs 0`, `--retry 0`, `--max-time 30` (30 s), `--max-filesize 10485760` (10 MiB), sin `HEAD`, sin JAR en estos runs.

| # | Recurso | Run id | UTC (server `date`) | URL exacta | HTTP / redirects | Bytes | SHA-256 del body |
|---|---|---|---|---|---|---|---|
| 1 | `maven-metadata.xml` | `20261004T233531Z` | `2026-10-04T23:35:42Z` | `https://repo.maven.apache.org/maven2/org/openapitools/openapi-generator-cli/maven-metadata.xml` | `200` / `0` | 2948 | `999d0b983bcea1867a9ee3ab7b15c8758a424110d061f2ec5ae0cdd640978f53` |
| 2 | POM del CLI `7.25.0` | `20261004T233705Z` | `2026-10-04T23:37:05Z` | `https://repo.maven.apache.org/maven2/org/openapitools/openapi-generator-cli/7.25.0/openapi-generator-cli-7.25.0.pom` | `200` / `0` | 4303 | `8fd322115776682468db4887ede1a0e432bd859efc5570efe68d826fff20f109` |
| 3 | POM parent `7.25.0` | `20261004T233810Z` | `2026-10-04T23:38:10Z` | `https://repo.maven.apache.org/maven2/org/openapitools/openapi-generator-project/7.25.0/openapi-generator-project-7.25.0.pom` | `200` / `0` | 51098 | `1a7083fe73ee36210e7b65ce3b0e233cbef85d6f79c953578dd7287006acf68a` |

Hallazgos transcritos de los reportes (análisis local de los bodies capturados; **ningún XML se ejecutó** — Maven no instalado según el reporte):

- **Metadata:** `<latest>` **7.25.0**, `<release>` **7.25.0**, `<lastUpdated>` `20260824083515` → `2026-08-24T08:35:15Z`; 83 versiones listadas; mayor estable **7.25.0** (identificadores `beta` excluidos); XML *well-formed* (`xmllint --noout`).
- **POM del CLI:** `<packaging>` ausente → `jar` por defecto; `maven-jar-plugin` fija `Main-Class org.openapitools.codegen.OpenAPIGenerator`; `maven-shade-plugin` `3.2.0` (`minimizeJar=false`, `createDependencyReducedPom=true`) → **JAR ejecutable fat-jar/sombreado**; dependencias declaradas **sólo `test`** (`testng 7.10.2`, `mockito-core 4.10.0`); **cero dependencias compile/runtime declaradas**; **sin configuración de compilación Java en este POM** (heredada del parent).
- **POM parent:** `maven.compiler.source`/`maven.compiler.target` = **11** (class-file 55), `maven.compiler.release` **ausente**; `maven-enforcer-plugin` exige **Java ≥ 11** y Maven ≥ 3.3.4; `dependencyManagement` sólo con entradas **test** (`junit-bom 5.10.2` import, `testng`) → **sin dependencias runtime declaradas**. El runtime efectivo está **dentro del JAR sombreado** y no se deriva de los POMs.
- **Estado:** cuerpos **consultados y custodiados** en `tools/goas/vendor/metadata/`, con reportes y hashes en `tools/goas/provenance/`; **no ejecutados, no resueltos con Maven, no instalados**.

### 13.3 Descarga y custodia del JAR — run `20261005T010240537579199Z-1687`

| Campo | Valor reportado |
|---|---|
| URL exacta | `https://repo.maven.apache.org/maven2/org/openapitools/openapi-generator-cli/7.25.0/openapi-generator-cli-7.25.0.jar` |
| Run id / UTC | `20261005T010240537579199Z-1687` · cliente `2026-10-05T01:02:40Z` · server `Mon, 05 Oct 2026 01:02:40 GMT` |
| HTTP / redirects / intentos | `200` / `0` (`redirect_url` vacío, sin `Location`) / `1` (sin retries/backoff) |
| Bytes | `31942042` (`Content-Length` = `size_download` → no truncado) |
| `curl_exit` / `time_total` | `0` / `0.524276` s |
| `content-type` | `application/java-archive` |
| Verificación SHA-1 | header `X-Checksum-SHA1` `56a9bb79e3bb565f477eddca2c6daa288a9c6f35` == SHA-1 local observado → **MATCH** |
| Custodia SHA-256 local | `41ce4f6b07f196676439d710759fa1ced7a08066d06ff1bf314681470289efae` (no provisto por el servidor; **custodia, no autenticidad**) |
| Estado | **STAGED + VERIFIED (match)**; **NO extraído, NO ejecutado, NO instalado** |

- **Descarga exactamente una vez** sobre esa URL, **sin redirect y sin retry**; una sola copia bajo custodia en el workspace.
- **Ruta guardada exacta:** `tools/goas/vendor/tarballs/openapi-generator-cli-7.25.0.20261005T010240537579199Z-1687.jar` — **verificada en disco en esta sesión**, `31942042` bytes.
- **Artefactos de provenance (nombres del task output, leídos en disco):**
  - `tools/goas/provenance/PROVENANCE-openapi-generator-cli-7.25.0.20261005T010240537579199Z-1687.md`
  - `tools/goas/provenance/headers-maven-jar-7.25.0.20261005T010240537579199Z-1687.txt` — SHA-256 `4a1676b09472e2606c3740a14bc37468cfbdae1e174b8f0281af1bfa95a683d6`
  - `tools/goas/provenance/fetch-maven-jar-sha1header-7.25.0.20261005T010240537579199Z-1687.log` — SHA-256 `6463314f9981107ffb9f4277a6f3a43b8d75015018673bc237a5de3618ce1148`
  - `tools/goas/provenance/sha256-custody-maven-jar-7.25.0.20261005T010240537579199Z-1687.txt`

### 13.4 Inspección local del archivador — sin ejecución ni extracción (reporte DevOps)

Transcrito del reporte de DevOps de esta conversación; inspección hecha localmente **sin ejecutar y sin extraer** el JAR:

- **Manifest:** `Build-Jdk-Spec11`; `Main-Class` presente; implementation `7.25.0`; **`mode: development`**.
- **Clases:** major **55**; entradas **MR-JAR** `META-INF/versions/9`, `11`, `17`, `21`; **sin variantes Java 25** (no hay entrada `versions/25`).
- **Inferencia, no declaración:** el JAR **podría cargarse en Java 25**, pero **el soporte NO está declarado**. **No se declara compatible** hasta una **validación real aprobada** posterior; esta inspección **no** cierra AC-GOAS-07 ni acredita ejecución.

### 13.5 Runtime Java del generador (reporte DevOps + instrucción del usuario)

- **Reporte DevOps local:** **JBR 25.0.3 empaquetado en IntelliJ Toolbox**, verificado con `java --version` / `javac --version`; el **`/usr/lib/jvm/default` del sistema es OpenJDK 26.0.2.1**. La ruta del JBR queda bajo el home del usuario y **no se expone** en este documento.
- **Instrucción del usuario:** el generador usa **Java 25, no Java 26**. **JBR 25 sólo si es aceptado/preparado dentro de la política del proyecto**; en caso contrario, **JDK 25 privado dedicado**.
- **Sistema:** el usuario indica que **un cambio del sistema a Java 25 puede ocurrir si hace falta**, pero **ahora no se autoriza ninguna modificación del sistema ni se requiere todavía**; **no quitar Java 26 ahora**. (El PROVENANCE local del run del JAR confirma: sistema con `openjdk 26.0.2.1`, **Java del sistema no modificado**, ejecución pendiente y fuera de ese alcance.)
- El uso, licencia y ruta efectiva del JBR **no se adjudican aquí**; su existencia reportada **no** equivale a JDK 25 preparado ni a compatibilidad verificada.

### 13.6 Corrección `fast-uri` y estado G-OAS

- **Corrección `fast-uri`:** `ajv@8.20.0` exige **`^3.0.1`**; el candidato es **`3.1.8`**; `dist-tags.latest` = **`4.2.1`** está **fuera de rango → nunca seleccionarlo** (consistente con §12.4/§12.8; run `20261004T194645Z`).
- **Estado:** **G-OAS ABIERTO**; **sin tarballs ni instalación de paquetes npm**; **sin ejecución del generador**; **sin resultado G-OAS**; lifecycle **`planning`**, Spec Validator **`verdict: none`**. El JAR está **staged y verificado, no extraído ni corrido**. **Java25 de producto (D-J25-01) sigue siendo target documental PROPUESTO**, separado del runtime de esta herramienta; **sin cambios AWS**.

### 13.7 Límites de evidencia, alcance de escritura y estado

- **No se declara:** compatibilidad Java del generador · autenticidad/procedencia independiente · closure/lock npm · instalación · ejecución · resultado G-OAS · `ready` ni cierre de gates. Sólo **consistencia interna SHA-1 + custodia SHA-256** para el JAR.
- **Runs consumidos:** metadata, POMs, sidecars y JAR — **cada URL autorizada queda consumida**; `.sha1`/`.asc`, índice u otras URLs Maven exigen **ficha y confirmación nuevas** (§9.5/§3.2). Sin paquetes npm adquiridos ni instalados; sin scripts/config creados.
- **Alcance de escritura:** **sólo este plan y el shared**; **sin tocar canónicos, pack, `Java25 proposal`/review, API/contratos, `tools/goas/**` ni la metadata capturada**. **Sin red, sin instalación, sin Git.**
- **Escaneo de secretos acotado** a los dos archivos editados en esta sesión; **G-SCAN final sigue pendiente** y no se ejecuta aquí.

## 14. Propuesta de inventario exacto de adquisición del core G-OAS — mandato hasta Spec Validator (noncanonical / WIP)

**Lifecycle status: `draft`.** Propuesta documental no canónica; Spec Validator `verdict: none`, **G-OAS ABIERTO**. Base: **context pack refresh #38**, captura M-CORE **§11**, frente transitivo Ajv **§12** y evidencia Maven/Java **§13**, leídos localmente. Los datos de adquisición e integridad siguientes se transcriben de esas secciones; **no se consultó la red ni se recalcularon hashes**. El inventario fija **nueve candidatos npm exactos**, no un lock cerrado ni compatibilidad demostrada. El JAR directo `7.25.0` se incluye como **artefacto ya staged, sin nueva adquisición ni ejecución**.

### 14.1 Autoridad, precedencia y límite de esta propuesta

- **Mandato amplio ya confirmado:** el permiso humano registrado en el pack #34 y conservado en #38 cubre las fases necesarias **hasta Spec Validator**, incluida la adquisición/preparación privada del tooling. **La solicitud actual confirma que basta para este inventario exacto del core G-OAS**; no se solicita otra aprobación genérica ni otra confirmación por cada una de las nueve URLs aquí fijadas. Esto no es autorización abierta del host ni de dependencias nuevas, y no equivale a aprobación contractual de plan.
- **Límite de esta sesión:** escribir **únicamente §14 de este plan** y verificarlo por relectura. **Cero red, descargas, instalación, ejecución, scripts, scans o Git**; no crear `package.json`/`package-lock.json`, config, adaptadores ni directorios. Master, contratos, gates, arquitectura, README, shared, pack y `tools/goas/**` permanecen sin editar.
- **Delta de precedencia explícito, sin reescribir historia:** para este inventario, las prohibiciones históricas de adquisición «no autorizada»/«requiere nueva confirmación» de §§1–12 quedan superadas **sólo en cuanto al permiso humano de estas nueve entradas concretas** por el mandato ratificado en la solicitud actual. Sus capturas y permisos consumidos siguen intactos: no repetir metadata ni GET Maven. Las menciones anteriores de **Java26 como runtime del Generator** quedan históricas; el runtime pretendido es **Java25**, conforme §§13.5/14.4. No altera D-J25-01 ni el target de producto.
- **Responsabilidad futura:** adquisición/custodia y generación del lock corresponden a **DevOps (`devops-architect`)**, no a Planner. Este documento no lo invoca ni despacha trabajo. **Sin Task Decomposer, Executor, Architect Executor, implementación de producto ni deploy**. No se registra `ready`, aprobación humana contractual ni cierre de gate.

**AC-T14-A:** la propuesta enumera exactamente 9 paquetes npm, conserva el JAR ya staged y permite distinguir permiso existente de precondiciones técnicas pendientes. Ningún destino nuevo, repetición de request consumido, operación de sistema o handoff de implementación se deriva de esta lista.

### 14.2 Nueve candidatos npm — fuente de adquisición y SRI esperado exactos

Fuente común: **`dist.tarball` y `dist.integrity` literales de la versión candidata en metadata ya capturada de `registry.npmjs.org`**, transcritos en §11.5 o §12.6. **No se reconstruyen URLs por convención.** Todos los `.tgz` de esta tabla están **NO adquiridos / NO verificados / NO instalados según el corte leído**. Versiones exactas para adquisición candidata; los rangos upstream se conservan como edges en §14.3, no como selección flotante.

| ID | Paquete | Versión candidata exacta | URL de adquisición (`dist.tarball`) | Integridad esperada (`dist.integrity`, SRI SHA-512) | Evidencia |
|---|---|---|---|---|---|
| N01 | `yaml` | `2.9.1` | `https://registry.npmjs.org/yaml/-/yaml-2.9.1.tgz` | `sha512-3NxN8+78OdzbT7C/WjGsyfPAtJaN3FNDsWxv7Y7mcDsT/oOmgW8BpyQQFFBnvZE3j9Y2Sdz1ULFLezL7Eb2yFw==` | §11.5, run `20261004T191337Z` |
| N02 | `jsonc-parser` | `3.3.1` | `https://registry.npmjs.org/jsonc-parser/-/jsonc-parser-3.3.1.tgz` | `sha512-HUgH65KyejrUFPvHFPbqOY0rsFip3Bo5wb4ngvdi1EpCYWUQDC5V+Y7mZws+DLkr4M//zQJoanu1SP+87Dv1oQ==` | §11.5, run `20261004T191337Z` |
| N03 | `@redocly/cli` | `2.57.0` | `https://registry.npmjs.org/@redocly/cli/-/cli-2.57.0.tgz` | `sha512-1d5fVyUaYlMNgCHUoyE2vUyxBhs/jmOHgsX/kFmfWzESw4f/G/OV/SU9E55rU7aUNmw9rHj1vXmL6yUdIn+KKQ==` | §11.5, run `20261004T191337Z` |
| N04 | `ajv` | `8.20.0` | `https://registry.npmjs.org/ajv/-/ajv-8.20.0.tgz` | `sha512-Thbli+OlOj+iMPYFBVBfJ3OmCAnaSyNn4M1vz9T6Gka5Jt9ba/HIR56joy65tY6kx/FCF5VXNB819Y7/GUrBGA==` | §11.5, run `20261004T191337Z` |
| N05 | `ajv-formats` | `3.0.1` | `https://registry.npmjs.org/ajv-formats/-/ajv-formats-3.0.1.tgz` | `sha512-8iUql50EUR+uUcdRQ3HDqa6EVyo3docL8g5WJ3FNcWmu62IbkGUue/pEyLBW8VGKKucTPgqeks4fIU1DA4yowQ==` | §11.5, run `20261004T191337Z` |
| N06 | `fast-deep-equal` | `3.1.3` | `https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz` | `sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==` | §12.6, run `20261004T194645Z` |
| N07 | `fast-uri` | **`3.1.8`** | `https://registry.npmjs.org/fast-uri/-/fast-uri-3.1.8.tgz` | `sha512-GZMtZUTNRpOVIECoXwLNZS5xUGE+mVNbTB8h/7Rwh2TFWcBQiPzTgyZi05BF9UMZKkLJv8XBRJTlU7zg8+ZfMg==` | §12.6, run `20261004T194645Z` |
| N08 | `json-schema-traverse` | `1.0.0` | `https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-1.0.0.tgz` | `sha512-NM8/P9n3XjXhIZn1lLhkFaACTOURQXjWhV4BA/RnOv8xvgqtqpAX9IO4mRQxSx1Rlo4tqzeqb0sOlruaOy3dug==` | §12.6, run `20261004T194645Z` |
| N09 | `require-from-string` | `2.0.2` | `https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz` | `sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==` | §12.6, run `20261004T194645Z` |

**AC-T14-N:** 9/9 fichas tienen nombre, versión, URL y SRI literales concordantes con §§11.5/12.6. **`fast-uri@4.2.1` está excluido**: cae fuera de `ajv@8.20.0 → fast-uri ^3.0.1`; el único candidato de este inventario es **`3.1.8`**. `dist-tags.latest` no puede sustituirlo. SRI esperado de metadata **no significa integridad observada** de bytes ni autenticidad del publicador.

### 14.3 Propósito, edges declarados y compatibilidad por paquete

Las primeras cinco entradas son directas por responsabilidad; N06–N09 son transitivas de N04. En la tabla, «ausente» significa campo no declarado, **no una garantía de ausencia de código/dependencias internas**. No se incorporan `devDependencies` de upstream como necesidades del consumidor ni se construyen paquetes desde su repositorio fuente.

| ID | Propósito / edge entrante | `engines` declarado | Edges salientes declarados (`dependencies` / peer / optional) | Pendiente verificable |
|---|---|---|---|---|
| N01 | Parse YAML; claves duplicadas, tags y límites de §5 | `{ "node": ">= 14.6" }` | Los tres campos ausentes | Capacidad de parseo y controles estrictos de §§5/10.2 con bytes locales |
| N02 | Parse JSON antes de materialización; claves repetidas por objeto | **ausente = compatibilidad no declarada** | Los tres campos ausentes | API de recorrido, nombres decodificados duplicados y rechazo de comentarios/comas finales/contenido extra |
| N03 | Lint OpenAPI 3.1, bundle y refs; no payload validator ni Generator | `{ "npm": ">=10", "node": ">=22.12.0 \|\| >=20.19.0 <21.0.0" }` | **Sin dependencies/peerDependencies/optionalDependencies declaradas** | **Bundle interno NO verificado desde tarball**; cero deps declaradas no prueba autosuficiencia runtime |
| N04 | Ajv 2020, compile/validación Draft 2020-12; entrante N05 dependency y peer `^8.0.0` | **ausente = compatibilidad no declarada** | Dependencies: N06 `^3.1.3`, N07 `^3.0.1`, N08 `^1.0.0`, N09 `^2.0.2`; sin peer/optional declaradas | Entrypoint 2020, metschemas/refs offline, invariantes de §5 y compatibilidad efectiva |
| N05 | Assertions de `format`, modo completo | **ausente = compatibilidad no declarada** | Dependency N04 `^8.0.0`; peer N04 `^8.0.0`, `peerDependenciesMeta.ajv.optional: true`; sin optionalDependencies declaradas | Resolver ambos edges a N04 `8.20.0`, sin segunda versión; controles `uuid`/`date-time` y formatos alcanzados |
| N06 | Ajv → igualdad profunda, dependency `^3.1.3` | **ausente = compatibilidad no declarada** | Los tres campos ausentes | `3.1.3` en rango; comportamiento efectivo no probado |
| N07 | Ajv → tratamiento de URI, dependency `^3.0.1` | **ausente = compatibilidad no declarada** | Los tres campos ausentes | `3.1.8` en rango; **no `4.2.1`**, comportamiento efectivo no probado |
| N08 | Ajv → recorrido de schemas, dependency `^1.0.0` | **ausente = compatibilidad no declarada** | Los tres campos ausentes | `1.0.0` en rango; comportamiento efectivo no probado |
| N09 | Ajv → carga desde string, dependency `^2.0.2` | `{ "node": ">=0.10.0" }` | Dependencies `{}` vacío; peer/optional ausentes | `2.0.2` en rango; engines declarado pero no evaluado en §12 |

**Límite de closure:** §§11.4/12.5 permiten enumerar estos **9 nodos de metadata declarada** y sus edges; el frente Ajv no aporta URLs nuevas. **No se declara closure más allá de esa metadata**, internals del bundle de Redocly u otros paquetes, ni lock cerrado. No tener `engines` es **compatibilidad no declarada**, no «sin restricciones», no «compatible» y tampoco incompatibilidad probada. El mandato permite adquirir bytes para inspección; no dispensa los bloqueos de capacidad/compatibilidad antes de preparación/corrida.

**AC-T14-E:** todo edge declarado tiene candidato exacto en la tabla; la resolución posterior conserva rangos/peer optional como evidencia y no sustituye N07 por un major fuera de rango. Cualquier dependencia efectiva adicional o divergencia del `package.json` interno bloquea promoción/lock y vuelve a Planner para inventario revisado, sin adquisición automática.

### 14.4 OpenAPI Generator 7.25.0 — JAR ya staged y runtime Java25

| Campo | Valor / límite |
|---|---|
| Recurso / vía | `org.openapitools:openapi-generator-cli:7.25.0`, **JAR directo**, sin wrapper npm |
| Propósito | Capacidad del generador AC-GOAS-07; adquisición no satisface `validate` ni ensayo de generación |
| URL exacta de origen ya consumida | `https://repo.maven.apache.org/maven2/org/openapitools/openapi-generator-cli/7.25.0/openapi-generator-cli-7.25.0.jar` |
| Custodia local reportada en §13.3 | `tools/goas/vendor/tarballs/openapi-generator-cli-7.25.0.20261005T010240537579199Z-1687.jar`, `31942042` bytes; run `20261005T010240537579199Z-1687` |
| SHA-1 esperado del header ya recibido | `56a9bb79e3bb565f477eddca2c6daa288a9c6f35` (`X-Checksum-SHA1`); §13 reporta **MATCH** contra SHA-1 local |
| SHA-256 local de custodia | `41ce4f6b07f196676439d710759fa1ced7a08066d06ff1bf314681470289efae` |
| Estado | **Ya staged**, consistencia interna SHA-1 reportada; **no descargar de nuevo, no extraer, no instalar ni ejecutar ahora** |
| Método autorizado / alcance | Sidecars Maven SHA-512 y SHA-256 dieron **404**, intentos consumidos. Usuario autorizó **sólo para este JAR exacto** comparar SHA-1 del header de su respuesta con SHA-1 local, más custodia SHA-256. No extender excepción a npm, otro JAR o versión |
| Autenticidad / procedencia | Header y cuerpo del **mismo origen/CDN**; SHA-1 debilitado, sin firma embebida/PGP/attestation en el flujo registrado. **No checksum independiente ni prueba de autenticidad/procedencia**; SHA-256 local sólo custodia |
| Build declarado en POM | Parent: `maven.compiler.source=11`, `maven.compiler.target=11`, `maven.compiler.release` ausente; Java ≥11 del enforcer es requisito de **build**, no contrato explícito de soporte runtime25 |
| Runtime declarado en POM / archivador | Runtime **no explícito** en los POMs; fat JAR/sombreado, internals no inferibles desde ausencia de deps runtime declaradas. Manifest reportado `Build-Jdk-Spec11`, `mode: development`, clases major55, MR-JAR hasta21 |
| Runtime de tooling propuesto | **JBR25.0.3**, existente y probado con `java`/`javac --version` según reporte DevOps; aceptación/licencia y ruta efectiva explícita aún por documentar antes de invocar. **Jamás Java26 para este generador**, tampoco fallback al Java del PATH/default |
| Compatibilidad pendiente | Source/target11, JDK11 de build, `mode: development` y ausencia de variante MR-JAR25 **no establecen ni soporte ni incompatibilidad/«runtime25 unsupported»**. Requiere **invocación real posterior bajo Java25** con ruta/versión/argv/exit y controles aplicables de AC-GOAS-07; no basta `java --version` |
| Sistema / producto | **Sin cambio de sistema salvo necesidad técnica demostrada**: primero evaluar JBR25 existente. No remover Java26 ni instalar Java25 ahora; sin upgrade integral ni operaciones forzadas. No cambia runtime/bytecode/AWS del producto ni instala Maven/Gradle/Docker |

**AC-T14-J:** JAR identificado con URL, ruta, bytes y ambos hashes exactos; su GET no se repite. Runtime25 queda requisito de la futura invocación, no resultado comprobado. Una falla de JBR25 bloquea y exige decisión/evidencia; nunca prueba con Java26 ni modificación automática del sistema.

### 14.5 Protocolo futuro de adquisición — un intento, sin redirects y lifecycle deshabilitado

**Protocolo propuesto para DevOps; NO ejecutado aquí.** Orden de evidencia: inventario exacto → adquisición/custodia de tarballs → comparación de integridad e inspección local → **generación del lock desde los tarballs fuente locales** → revisión de resolución/compatibilidad → eventual preparación offline → corrida separada. No exige un lock inexistente antes de obtener sus fuentes locales ni permite generar uno consultando el registry.

1. **Adquisición acotada:** máximo **9 GET**, **uno por cada URL N01–N09**, HTTPS con TLS verificado, **un intento por URL**, sin retry/backoff, sin redirects seguidos (ni al mismo host), sin HEAD, metadata nueva, audit/fund, documentación enlazada, mirrors, firmas/provenance remota o descarga automática por npm. Timeout **30 s/request**, máximo **300 s para esta etapa**. El JAR y todas las consultas consumidas quedan fuera de esas nueve solicitudes.
2. **Custodia privada e idempotencia:** staging bajo `tools/goas/staging/`, originales en `tools/goas/vendor/tarballs/` y evidencia en `tools/goas/provenance/`, con realpaths y permisos corroborados. Clave de entrada: `(nombre, versión, URL, SRI esperado)`; una entrada completa verificada se reutiliza, nunca se sobrescribe ni se vuelve a descargar. Un único writer por staging; sin HOME/cache de usuario, instalación global ni cambios a Node/npm/pnpm existentes. Registrar tamaños y espacio disponible antes de la adquisición; espacio insuficiente bloquea, no limpieza silenciosa.
3. **Integridad antes de promoción:** comparar SHA-512/SRI real con el literal de §14.2 y registrar SHA-256 local, bytes, timestamp UTC, URL solicitada/efectiva, HTTP, `Location`, intento, SRI esperado/observado y resultado. No confundir hashes de bodies metadata con hashes de tarballs. Discrepancia, truncado, HTTP distinto de200, 3xx, 404, 429, 5xx, timeout o error TLS → **bloqueo sin segundo intento, cambio de pin ni fallback**.
4. **Inspección y compensación:** sólo después de comparación exitosa, inspección local del tarball sin ejecutar contenido; verificar nombre/versión y deps/peer/optional reales, bundle y lifecycle, rechazando path traversal y symlinks que salgan del staging. Fallo deja entrada parcial en staging sin promover/usar; conservar evidencia, no tocar originales válidos ni producto. No hay rollback transaccional de producto porque esta adquisición no lo modifica.
5. **Lifecycle deshabilitado en todas las fases de preparación:** `ignore-scripts=true`; ningún `preinstall`, `install`, `postinstall`, `prepare`, build ni script del paquete adquirido. Declaración de un script no autoriza ejecutarlo. Si requiere lifecycle para funcionar, bloquear y proponer permiso específico; jamás activación global. Sin `npx`, CLI global ni ejecución de paquetes/JAR durante adquisición. Los comandos de validación serán fase posterior explícita, no lifecycle.
6. **Lock posterior, no escrito por Planner:** DevOps crea `tools/goas/package.json` y `tools/goas/package-lock.json` **sólo una vez staged los tarballs locales íntegros**, generando el lock desde **esas fuentes locales**, offline y sin lifecycle. La resolución debe contener versiones exactas y SRI/custodia trazables, resolver los cuatro edges de Ajv y el dependency/peer de ajv-formats sin paquetes nuevos ni URL de red. No fabricar un lock a mano ni declarar closure por esta tabla. Si el método disponible necesita red, descarga adicional, script o produce resolución distinta, detener y revisar. Instalación queda después del lock debidamente generado/revisado, no en este incremento documental.
7. **Observabilidad exigida:** por entrada, futura señal `ACQUISITION_RECORDED` sólo con transferencia e integridad documentadas; `ACQUISITION_BLOCKED` ante fallo, `INTEGRITY_MISMATCH` ante SRI distinto y `TOOLCHAIN_BLOCKED` ante divergencia/escape/lifecycle requerido. Conservar `acquisition_id`, ID N01–N09, estado, duración y causa sin payloads/tokens. Son señales propuestas, **no logs emitidos aquí**. Retener originales/provenance mientras las decisiones y gates dependan de ellos; bundles/resultados G-OAS futuros siguen externos conforme §6.

**AC-T14-P:** preparación sólo tras 9/9 entradas íntegramente custodiadas/inspeccionadas y lock generado correctamente desde fuentes locales; cero lifecycle, red implícita, reintentos o redirects. Cada fallo tiene causa, evidencia y staging no promovido. **Hoy ese criterio está pendiente: no hay lock cerrado, instalación ni corrida G-OAS declarados.**

### 14.6 Consistencia documental, pendientes y siguiente límite

| Cotejo local en esta propuesta | Resultado observado / estado |
|---|---|
| §14.2 frente a §§11.5/12.6 de este archivo | 5 directos + 4 transitivos; URLs y SRI literales conservados; **concordancia documental**, no verificación de bytes |
| §§14.2–14.3 frente a §§11.4/12.4–12.8 | `fast-uri 3.1.8` en `^3.0.1`; `4.2.1` excluido; dependency/peer de ajv-formats convergen al candidato Ajv8.20.0; sin ampliación de closure declarada |
| §14.4 frente a §§13.1–13.5 y pack #38 | JAR7.25.0 ya staged; SHA-1 de header y SHA-256 de custodia exactos; build11 separado de runtime25; **invocación Java25 pendiente**, sin dictamen de incompatibilidad |
| §§14.1/14.5 frente al mandato actual y pack #34/#38 | Autorización suficiente para inventario exacto y fases hasta Validator; esta sesión sólo documentación; lock posterior a fuentes locales, sin saltar evidencia/gates |
| Canónicos, resultado técnico y aprobaciones | **No reevaluados ni modificados** por esta propuesta; compatibilidad, internals Redocly, integridad npm, lock, G-OAS y Validator **pendientes**, no `pass` técnico ni `ready` |

**AC-T14-C:** §14 no afirma hechos más allá de la evidencia declarada ni contradice sus tablas/protocolo: 9 candidatos exactos, 0 tarballs adquiridos por esta sesión, JAR previamente staged, Java25 requerido, lock no cerrado y gates abiertos. No alimenta Task Decomposer ni añade un Decomposition Contract de implementación.

**Siguiente límite:** queda preparado el inventario documental para la fase técnica de DevOps dentro del mandato existente, **sin dispatch en esta sesión**. No falta otra aprobación genérica de este core; sí faltan sus bytes/verificaciones locales, lock real y pruebas efectivas. La escritura invalida la vigencia del pack por su `refresh_when`: solicitar **refresh focalizado #38→nuevo corte al `context-curator`**, no reescribirlo aquí ni asumir que ya se actualizó. Tras las fases técnicas autorizadas, la revisión de Spec Validator sigue independiente; **no dar por finalizada planificación ni avanzar a descomposición/ejecución sin los gates Validator y humano correspondientes**.

## 15. Evidencia 2026-10-06 — instalación offline N01–N09 y smoke `version` bajo JBR 25.0.3 (noncanonical / WIP)

**Lifecycle status: `draft`.** Transcripción durable de evidencia **ya producida y custodiada** bajo `tools/goas/provenance/`; **esta sesión no ejecutó red, instalación, tests, scans ni corrida G-OAS**: sólo leyó artefactos locales y verificó hashes/listados por lectura. **G-OAS permanece ABIERTO / NO cerrado**, Spec Validator `verdict: none`, carril `feature`. **No es aprobación de plan, no es `ready`, no cierra gates y no habilita `task-decomposer`/`executor` ni implementación/deploy de producto.**

**Fuentes leídas (rutas relativas a la raíz activa):** `tools/goas/provenance/INSTALL-REPORT-npm-offline-N01-N09.20261006T041741Z.md` · `tools/goas/provenance/install-lock-only.20261006T041741Z.log` · `tools/goas/provenance/install-ci.20261006T041741Z.log` · `tools/goas/provenance/install-verify.20261006T041741Z.log` · `tools/goas/provenance/.install-run-id` · `tools/goas/package.json` · `tools/goas/package-lock.json` · `tools/goas/.npmrc`, `.npmrc.user`, `.npmrc.global` · `tools/goas/provenance/SMOKE-REPORT-jbr25-openapi-generator-version.20261006T135704Z.md` · `tools/goas/provenance/smoke-jbr25-openapi-generator-version.20261006T135704Z.log` · `tools/goas/provenance/smoke-jbr25-openapi-generator-version.20261006T135704Z.stderr.log`.

### 15.1 Instalación offline del core npm — run `20261006T041741Z` (ejecutor reportado: `devops-architect`)

- **Procedimiento exacto (§3 del reporte; logs en `provenance/`):** (1) `npm install --package-lock-only --offline --ignore-scripts --no-audit --no-fund` → `up to date`, **exit 0** (`install-lock-only…log`: `up to date in 676ms`); (2) **`npm ci --offline --ignore-scripts --no-audit --no-fund`** → **`added 9 packages`**, **exit 0** (`install-ci…log`: `added 9 packages in 326ms`); (3) `package-lock.json` **no cambió** entre pre y post (`npm ci` no lo reescribió). Run id: `.install-run-id` = `20261006T041741Z`; verificación `date_utc=2026-10-06T04:19:23Z`.
- **Gestor del paquete = Node/npm, NO Java:** Node `v26.7.0` y npm `11.19.0` (tree mise, `…/installs/node/26.7.0/bin/`) usados **sólo para gestionar el paquete npm**. **Node26.7 sí se usó; Java26 NO.** El Java del PATH por defecto (`openjdk 26.0.2.1`) **no fue invocado en ningún paso**. El usuario exige **Java 25 únicamente para el Generator**; **ningún proceso Java26 participó en el generador** (ver §15.3).
- **Aislamiento npm (sin HOME):** `.npmrc` de proyecto con `ignore-scripts=true`, `offline=true`, `audit=false`, `fund=false`, `update-notifier=false`, `cache=.npm-cache`; `.npmrc.user` (userconfig aislada) y `.npmrc.global` (globalconfig aislada) vacías/comentario. `cache`, `userconfig`, `globalconfig` y `TMPDIR` apuntan dentro de `tools/goas`; la config efectiva cargó **sólo** esos tres archivos más el npmrc interno de npm (verificado en debug log).
- **Lock:** `tools/goas/package-lock.json`, **`lockfileVersion: 3`**, 10 entradas (raíz + 9). **Los 9 `resolved` son `file:vendor/tarballs/<tarball>.tgz`; 0 URLs externas entre los `resolved`** (las 4 ocurrencias `http` del lock son campos `funding.url` de metadata, no resolución). Cada entrada con `integrity` `sha512-…` (**9/9**).
- **Resolución y dedupe:** `npm ls --all --offline` **exit 0**, 10 entradas, sin `UNMET`/`invalid`. **Ajv único = `8.20.0`**, satisfaciendo a la vez la `dependencies.ajv ^8.0.0` **y** la `peerDependencies.ajv ^8.0.0` (`optional: true`) de `ajv-formats@3.0.1` → **deduped, sin segunda versión**. `fast-uri` = `3.1.8` (no `4.2.1`). N03 `@redocly/cli@2.57.0` sin dependencies/peer declaradas.
- **SRI:** recomputo local SHA-512 de los 9 tarballs contra §14.2 y contra el `integrity` del lock → **9/9 PASS**.

| Hash (verificado por lectura local, coincide con el reporte) | Valor |
|---|---|
| **`package-lock.json` SHA-256** | `486d24afc5f07f9ec1f1f06b8e5df47694bacd6202da20ac1a551775572e2e8b` |
| `package.json` SHA-256 | `bcd93c3a5706162b86d3a94c664f29f2d9ed24397b9942510b36978178693468` |
| `.npmrc` SHA-256 | `10436a4a3dc7705feea277ed0bb7791966338ce501db3dea1a8d692a89b65b59` |
| `.npmrc.user` SHA-256 | `196d61aa4795f5319c55dc2a44c276c420205eb6958053902e609a23e2428e05` |
| `.npmrc.global` SHA-256 | `55fad794e5bed7159ea5418f18e45f6f3be8fd1319424315a5764f0e00461ef9` |

| ID | Paquete@versión | Bytes | SHA-256 local |
|---|---|---|---|
| N01 | `yaml@2.9.1` | 112114 | `4ef6c54cf559b8a207b7b518378230805a1c84af239b14960e8c67c7d59de5d3` |
| N02 | `jsonc-parser@3.3.1` | 27354 | `4a0315b8671e7463bae7af7c142cdf19e9aa7ba39eb36dc2df383b8648e3cbc9` |
| N03 | `@redocly/cli@2.57.0` | 2820414 | `1bd67ffd126b063899629f13eccc8f772df3339f92640cc4968814acd0e021c0` |
| N04 | `ajv@8.20.0` | 217611 | `b2f0b3a893bbb8cc5efb6814f08b1499e19e31d5dd73683f5893382f48f6e7b3` |
| N05 | `ajv-formats@3.0.1` | 15999 | `f4d6980fd367381fd29199066911e863db8d97496613b6c2c5b91563a150acc5` |
| N06 | `fast-deep-equal@3.1.3` | 3656 | `b019a0980f27638dc3f85836b0e478f188e00d7a6e5852c0819fa86f56e47b8f` |
| N07 | `fast-uri@3.1.8` | 44269 | `86be033b406a7737c0521edc8fe3e15c7ac0cb6b5e509478cc9539a2efaa086c` |
| N08 | `json-schema-traverse@1.0.0` | 6074 | `023222622df29fc274bde5d3590e47aa1d4a8e3c1d6e2aba029948ed79799b21` |
| N09 | `require-from-string@2.0.2` | 1816 | `cb694a4965908f7775a0c757f00cf4e624d193cd71d77988fbcca0f597b88d82` |

- **Egress: 0** (logs npm sin `http fetch` contra registry; el `packumentCache … cache-miss` de los 4 transitivos de Ajv **no hizo request** y resolvió por los `file:` raíz). **Lifecycle scripts ejecutados: 0** — `ignore-scripts=true` persistente; grep de logs sin `run-script`/`preinstall`/`postinstall`/`prepare`/`prepublish`/`prepack`; los `.bin` symlinks se crearon, **no se ejecutaron** (`@redocly/cli` y `yaml` bin **no invocados**). `node_modules` = `11918688` bytes.
- **NO ejecutado en este run:** `@redocly/cli`, Java/JAR, parser, G-OAS, Git.

### 15.2 Incidente acotado de escritura fuera de `tools/goas` y limpieza posterior autorizada

- **Hecho (§10 del reporte):** durante la **inspección read-only previa al aislamiento** (`npm config get`/`npm config ls`, para determinar qué aislar) npm, por diseño, escribió **exactamente 6 archivos de log** en **`~/.npm/_logs/`**, timestamps **`2026-10-06T04:17:02Z`–`2026-10-06T04:17:03Z`**, y ese directorio actualizó su mtime. **Sin egress, sin resolución de paquetes, sin instalación, sin ejecución**: sólo logging automático de npm sobre comandos de lectura.
- **Instalación limpia:** el procedimiento propiamente dicho (lock-only + `ci`) usó **únicamente** config/cache/temp dentro de `tools/goas` (confirmado en debug logs: carga de `.npmrc`, `.npmrc.user`, `.npmrc.global`; logs en `tools/goas/.npm-cache/_logs`). **No se tocó `~/.npmrc`** (no existe) ni se instaló nada en HOME/global.
- **Decisión diferida en el reporte:** «No se borraron los logs de HOME (borrarlos sería otra modificación fuera de `tools/goas`). Decisión sobre este punto queda al humano.»
- **Resolución registrada (posterior, fuera del repo):** el **usuario autorizó** el borrado de **esos seis logs concretos** con mensaje explícito, **transcripción literal: «si, autorizo»**. **Alcance de la autorización:** **exactamente los seis logs** de `~/.npm/_logs/` con timestamps **`2026-10-06T04:17:02Z`–`2026-10-06T04:17:03Z`**; **no se extiende a ningún otro log ni archivo**. **Ejecución completada y verificada:** se eliminaron **exactamente 6** (los de esa ventana) y **quedan intactos los cinco logs anteriores** (listado en el punto siguiente). El registro de la autorización es **fuera del repo** y **no consta en ningún artefacto de `tools/goas/provenance/`**.
- **Evidencia de la limpieza (lectura local read-only hecha en esta escritura, 2026-10-06):** `~/.npm/_logs/` contiene **exactamente 5 archivos** — `2026-10-04T06_18_30_940Z-debug-0.log`, `2026-10-04T17_47_24_221Z-debug-0.log`, `2026-10-04T19_03_25_594Z-debug-0.log`, `2026-10-06T03_31_54_269Z-debug-0.log`, `2026-10-06T13_53_13_613Z-debug-0.log` — y **ninguno** con timestamps `04:17:02Z`–`04:17:03Z`.
- **Alcance de la declaración:** este plan **no afirma que nunca haya existido escritura fuera de `tools/goas`**. El hecho queda registrado como **incidente acotado** (6 logs de npm producidos por comandos de lectura, sin red, sin instalación, sin ejecución) **con su limpieza posterior autorizada y verificada por listado**. **No se reporta ni se verifica aquí ninguna otra escritura fuera de `tools/goas`.**

### 15.3 Smoke `version` — JAR CLI 7.25.0 bajo JBR 25.0.3 — run `20261006T135704Z`

- **Comando (redactado, único subcomando):** proxy env a puerto cerrado local `127.0.0.1:9` en las cuatro variables + `ALL_PROXY`, `no_proxy=`/`NO_PROXY=` vacíos; `/home/<user>/.local/share/JetBrains/Toolbox/apps/intellij-idea/jbr/bin/java -jar tools/goas/vendor/tarballs/openapi-generator-cli-7.25.0.20261005T010240537579199Z-1687.jar version`. **Sólo `version`**; sin `--help` (evita disparo de plugin/red).
- **Runtime exacto:** **JBR 25.0.3** (`JAVA_VERSION` `25.0.3`, `IMPLEMENTOR_VERSION` `JBR-25.0.3+9-508.16-nomod`, `java -version` → `openjdk version "25.0.3" 2026-04-21`, `OS_ARCH` `x86_64`). **Es Java 25, no Java 26:** el `java` por PATH (`/usr/bin/java` = OpenJDK **26.0.2.1**) **no fue usado**; ruta del JBR explícita, nunca PATH. **Sin cambio de JDK de sistema ni instalación de Java.**
- **Artefacto bajo prueba:** `tools/goas/vendor/tarballs/openapi-generator-cli-7.25.0.20261005T010240537579199Z-1687.jar`, `31942042` bytes, SHA-256 `41ce4f6b07f196676439d710759fa1ced7a08066d06ff1bf314681470289efae` (idéntico a §14.4).
- **Resultado:** **exit code 0**; **STDOUT `7.25.0`** (7 bytes en `…135704Z.log`); **STDERR vacío, 0 bytes**; sin procesos residuales; **sin artefactos generados** (sin `.openapi-generator/`, sin `generated/`).
- **Red/aislamiento:** **egress bloqueado/offline** (proxy `127.0.0.1:9`); **sin red, sin callbacks, sin egress** durante el smoke; **sin paquetes JS instalados ni ejecutados** en el smoke (`ignore-scripts=true` intacto); **Node no invocado** en el smoke; **sin Git ni secret-scan** en esa ejecución.
- **Escrituras:** **sólo 3 archivos dentro de `tools/goas/provenance/`** — `smoke-jbr25-openapi-generator-version.20261006T135704Z.log` (7 B), `smoke-jbr25-openapi-generator-version.20261006T135704Z.stderr.log` (0 B) y el reporte `SMOKE-REPORT-jbr25-openapi-generator-version.20261006T135704Z.md`. **No se escribió nada fuera de `tools/goas/provenance/`.**
- **Límite del veredicto:** **el mínimo runtime funciona** (arranca y responde `version` con exit 0 bajo JBR25.0.3), **no es soporte ni compatibilidad completos**; **NO se declara compatibilidad completa ni G-OAS PASS**. **Todavía NO hay en G-OAS `lint`, bundle, validación de schemas ni `generate`.**

### 15.4 N03 `@redocly/cli@2.57.0` y residuales legales

- **N03 instalado localmente** amparado por la decisión humana 2026-10-05 registrada en el shared (**local-only para G-OAS en este PC, explícitamente aprobada pese a las deficiencias del Third Party Notice**), bajo los controles allí listados: **sin redistribución**, **`ignore-scripts=true` (sin lifecycle scripts)**, **egress minimizado**, **sólo local**, tarball y provenance retenidos intactos.
- **Residuales legales SIGUEN ABIERTOS** (gaps del aviso de terceros: registros MIT sin texto de licencia, etiquetas `unknown`, dual con sólo texto Apache, MIT sin copyright holder, árbol vendorizado del bundle N03): **esta instalación NO los corrige, NO constituye legal clearance ni licencias verificadas/liberadas** y **NO sustituye al owner de licencias/legal**. Cualquier distribución/uso compartido/CI/producto o extensión del alcance **re-abre revisión**.
- **NO se declara:** **SBOM**, **scan de vulnerabilidades/advisories** (ausencia de escaneo ≠ ausencia de vulnerabilidades) ni **licensing fully checked**. **No hay SBOM independiente.**

### 15.5 Estado, límites y límite de escritura de §15

- **Estado:** **G-OAS ABIERTO / NO cerrado**; lifecycle `draft` (plan) / `planning` (incremento), Spec Validator **`verdict: none`**; **sin Task Decomposer, sin Executor, sin implementación ni deploy de producto**; **sin corrida G-OAS** (inventario/hashes/parse/lint 8 YAML/bundles/refs/compile/polaridad/matriz27/formatos pendientes, §6).
- **NO se declara:** compatibilidad completa de ningún paquete ni del generador (los `engines` ausentes siguen siendo **compatibilidad no declarada**), pinning reproducible global, closure más allá de los 9 nodos, autenticidad/procedencia independiente, `ready` ni cierre de gates. La instalación y el smoke **no cierran G-OAS, G-API-GOV, G-SCAN, G-VALIDATOR ni G-HUMAN-CONTRACT**.
- **Alcance de escritura:** **sólo este plan y el shared**; **sin tocar canónicos, pack, `tools/goas/**`, metadata ni informes de provenance**. **Sin red, sin instalación, sin ejecución de tests/G-OAS, sin Git.** Gitleaks acotado a los dos archivos editados **≠ G-SCAN final** (pendiente). Pack **stale** por esta escritura → refresh focalizado al `context-curator`, no reescrito aquí.
- **Precedencia (sin reescribir historia):** las menciones de **«sin instalación», «lock no cerrado», «tarballs NO adquiridos/NO instalados» (§14.2), «no hay lock cerrado, instalación ni corrida» (AC-T14-P §14.5) e «invocación real posterior bajo Java25» (§14.4)** describen **cortes anteriores** y quedan **históricas en cuanto a esos tres hechos**: el **lock y la instalación offline existen y están verificados (§15.1)** y la **invocación mínima bajo Java25 ya ocurrió (§15.3, sólo `version`)**. **Siguen vigentes sin cambio:** §14.2 como inventario/SRI esperado, el **protocolo de adquisición de §14.5** como regla para futuras URLs, **Java25 como único runtime del generador**, los **bloqueos de capacidad/compatibilidad**, la exigencia de **corrida G-OAS real** y **todos los gates**. §15 **no** autoriza nuevas requests, distribución ni ejecución de G-OAS.

## 16. Propuesta exacta AC-GOAS-07 — validate y generación de ensayo de siete roots (noncanonical / WIP)

**Lifecycle status: `planning`. Fecha: 2026-10-06. Spec Validator `verdict: none`. G-OAS ABIERTO.** Propuesta documental ya elaborada, persistida bajo la solicitud actual; **no ejecutada**, sin resultado `pass`, sin cierre ni `ready`. La cabecera refleja el estado actual; las menciones `draft` y los estados de ejecución de §§1–15 permanecen como registros de sus respectivos cortes. Esta sección no modifica contratos, canónicos, shared, pack, configuración, scripts ni código, y no habilita Task Decomposer/Executor ni promoción al producto.

### 16.1 Autoridad, alcance aprobado y límite de evidencia

- **Contexto consumido:** pack refresh **#45**, como índice de la aprobación humana **«listo, apruebo»**, no como sustituto de contratos. El usuario confirma en la solicitud actual el patrón/set aprobado y el destino: `com.entralo.goas.validation.<root>.api|model|invoker` para los siete roots HTTP y `/tmp/opencode/entralo-v1-executable-specs/<run_id>`, **retenido hasta el cierre de gates**. No se pide ni se introduce una decisión nueva de namespaces/destino.
- **Motor/vía:** JAR directo OpenAPI Generator CLI **7.25.0**, identificado en §§14.4/15.3; runtime **JBR25.0.3** por ejecutable absoluto explícito, **nunca Java26 ni `java` del PATH/default**. Sin wrapper npm, descarga, instalación ni cambio del sistema.
- **Evidencia de opciones aportada por la solicitud:** `config-help` del **JAR7.25 bajo JBR25.0.3** confirmó la existencia de las opciones de §16.3. **Sólo acredita existencia de opciones**; no acredita que esta combinación genere correctamente, compatibilidad Spring Boot/Jackson/Java, soporte completo del runtime ni cumplimiento AC-GOAS-07. No se repite `config-help` en esta sesión; no se inventa ruta/hash/exit de esa captura. El smoke `version` de §15 tampoco demuestra `validate`/`generate`.
- **Único alcance futuro descrito:** `validate` y ensayo de interfaces/modelos sobre **siete bundles congelados** del mismo run externo. `common` aporta schemas por refs resueltas y cobertura documental de §6; **no es octavo servicio, no tiene namespace/output de generación y no recibe `generate`**.

**AC-T16-A:** siete roots exactos, namespaces y destino aprobados sin nueva decisión; evidencia de `config-help` limitada a existencia; ninguna afirmación de ejecución, compatibilidad o cierre derivada de la aprobación humana.

### 16.2 Roots, normalización de slug y paquetes exactos

`<root>` en los paths conserva el slug HTTP. En el segmento Java del patrón aprobado se normalizan únicamente los guiones: **`admin-bff → adminbff`**, **`buyer-bff → buyerbff`**; los otros cinco slugs se preservan. Es materialización del patrón/set ya aprobado, no cambio de servicio ni decisión pendiente.

| Root HTTP / input congelado | `apiPackage` | `modelPackage` | `invokerPackage` | Output de ensayo |
|---|---|---|---|---|
| `admin-bff` / `${run}/bundles/admin-bff.yaml` | `com.entralo.goas.validation.adminbff.api` | `com.entralo.goas.validation.adminbff.model` | `com.entralo.goas.validation.adminbff.invoker` | `${run}/generate/admin-bff` |
| `buyer-bff` / `${run}/bundles/buyer-bff.yaml` | `com.entralo.goas.validation.buyerbff.api` | `com.entralo.goas.validation.buyerbff.model` | `com.entralo.goas.validation.buyerbff.invoker` | `${run}/generate/buyer-bff` |
| `catalog` / `${run}/bundles/catalog.yaml` | `com.entralo.goas.validation.catalog.api` | `com.entralo.goas.validation.catalog.model` | `com.entralo.goas.validation.catalog.invoker` | `${run}/generate/catalog` |
| `identity` / `${run}/bundles/identity.yaml` | `com.entralo.goas.validation.identity.api` | `com.entralo.goas.validation.identity.model` | `com.entralo.goas.validation.identity.invoker` | `${run}/generate/identity` |
| `payments` / `${run}/bundles/payments.yaml` | `com.entralo.goas.validation.payments.api` | `com.entralo.goas.validation.payments.model` | `com.entralo.goas.validation.payments.invoker` | `${run}/generate/payments` |
| `purchases` / `${run}/bundles/purchases.yaml` | `com.entralo.goas.validation.purchases.api` | `com.entralo.goas.validation.purchases.model` | `com.entralo.goas.validation.purchases.invoker` | `${run}/generate/purchases` |
| `ticketing` / `${run}/bundles/ticketing.yaml` | `com.entralo.goas.validation.ticketing.api` | `com.entralo.goas.validation.ticketing.model` | `com.entralo.goas.validation.ticketing.invoker` | `${run}/generate/ticketing` |

`run = /tmp/opencode/entralo-v1-executable-specs/<run_id>`: identificador único real de la futura corrida, no valor asignado ni directorio creado aquí. Los nombres de bundle de la tabla fijan los inputs derivados externos de este ensayo; **no** renombrar/editar los contratos fuente ni crear bundles desde este documento. Precondición: bundles ya producidos por §6, refs locales resueltas sin red, equivalencia fuente→bundle documentada y manifest congelado con SHA-256/bytes por input. No generar desde fuentes vivas del repo ni mutar bundles para satisfacer el Generator.

**AC-T16-ROOT:** 7/7 entradas y comandos de §16.4 usan exactamente esos inputs, paquetes y outputs; ningún paquete contiene guion, ningún root extra ni generación `common`. Fijar `invokerPackage` no selecciona supporting files ni obliga a producir clases invoker en este ensayo.

### 16.3 Perfil real del generador y selección global exacta

**`generatorName=spring`, `library=spring-boot`.** Las siguientes propiedades son las opciones confirmadas por el `config-help` aportado; se pasan explícitamente, sin depender de defaults:

| Opción adicional | Valor exacto |
|---|---|
| `interfaceOnly` | `true` |
| `skipDefaultInterface` | `true` |
| `useSpringBoot4` | `true` |
| `useSpringBoot3` | `false` |
| `useJakartaEe` | `true` |
| `useJackson3` | `true` |
| `useBeanValidation` | `true` |
| `documentationProvider` | `none` |
| `useSwaggerUI` | `false` |
| `annotationLibrary` | `none` |
| `hideGenerationTimestamp` | `true` |
| `useTags` | `true` |

**Selección global literal:** `apis,models,apiDocs=false,modelDocs=false,apiTests=false,modelTests=false`, mediante **`--global-property`**, no `--additional-properties`. **No incluir `supportingFiles` como opción**, ni `supportingFiles=false`, ni selección de supporting files. Sólo APIs/modelos para ensayo; no documentación/tests generados ni scaffold de aplicación/build. Los metadatos internos que el motor produzca, si los hay, se inventarían como tales, no como producto ni prueba de compilación. Un archivo inesperado se conserva en evidencia y bloquea la conformidad del alcance, no se oculta/borrar para fabricar éxito.

**AC-T16-OPTIONS:** argv real de cada `generate` reproduce motor, library, las doce propiedades y la selección global literal; discrepancia/propiedad no efectiva se reporta como bloqueo, sin sustituir perfil, retirar constraints ni ampliar salidas. Que una opción exista no prueba que los templates/runtime respeten la combinación.

### 16.4 Comandos documentales por root — JBR25 explícito y no-egress del SO

**Plantilla documental para una fase futura, NO ejecutada ni escrita como script.** Variables de enlace, no evidencia medida: `run` será la ruta absoluta externa aprobada con run_id real; `JBR25_JAVA` será la ruta absoluta corroborada del **`…/intellij-idea/jbr/bin/java` de JBR25.0.3** de §15.3; no se inventa el nombre/ruta privada del usuario ni se usa búsqueda de HOME. `JBR25_HOME` será el directorio absoluto de ese JBR. `JAR` se fija al artefacto ya custodiado:

`/mnt/data/Shares/Projects/entralo-workspace/tools/goas/vendor/tarballs/openapi-generator-cli-7.25.0.20261005T010240537579199Z-1687.jar`.

Antes de invocar, el responsable técnico debe enlazar/registrar esas rutas reales y sus versiones/digests, corroborar realpaths y directorios privados `${run}/home`, `${run}/tmp`, y fijar cwd **`${run}`**. Son precondiciones futuras, **no** instrucciones para ejecutarlas ahora. Ruta JBR sin corroborar, bundle faltante/no congelado, destino reutilizado o aislamiento indisponible → `GENERATOR_BLOCKED`, sin fallback.

El prefijo común de **cada uno de los catorce comandos** queda especificado así (notación Bash documental; `CMD` es sólo abreviatura de argv):

```bash
CMD=(/usr/bin/timeout --signal=KILL 120s
     /usr/bin/unshare --user --map-root-user --net
     /usr/bin/env -i
     HOME="${run}/home" TMPDIR="${run}/tmp" TMP="${run}/tmp" TEMP="${run}/tmp"
     XDG_CACHE_HOME="${run}/home/.cache" XDG_CONFIG_HOME="${run}/home/.config"
     XDG_DATA_HOME="${run}/home/.local/share" JAVA_HOME="${JBR25_HOME}"
     "${JBR25_JAVA}" "-Duser.home=${run}/home" "-Djava.io.tmpdir=${run}/tmp")
OPTIONS='interfaceOnly=true,skipDefaultInterface=true,useSpringBoot4=true,useSpringBoot3=false,useJakartaEe=true,useJackson3=true,useBeanValidation=true,documentationProvider=none,useSwaggerUI=false,annotationLibrary=none,hideGenerationTimestamp=true,useTags=true'
GLOBAL='apis,models,apiDocs=false,modelDocs=false,apiTests=false,modelTests=false'
```

**No-egress obligatorio:** namespace de red nuevo del SO vía **`unshare --user --map-root-user --net`**, sin habilitar interfaces/rutas/egress; proxy a puerto cerrado no lo sustituye. `env -i` elimina entorno heredado (incluidos proxies, `JAVA_TOOL_OPTIONS`/`JDK_JAVA_OPTIONS`); HOME/tmp/caché/config Java quedan bajo el run. El JBR se lee por ruta explícita, no se instala/escribe en HOME real. Este aislamiento de red **no equivale a sandbox de filesystem**: los límites de escritura/read-only se corroboran por realpaths, manifests y evidencia pre/post; no atribuir a `unshare` protección de archivos que no aporta.

**Timeouts:** §7 fija **120 s por artefacto** y **900 s para la corrida total**. Aplicar **120 s/root a `validate` y 120 s/root a la fase `generate`**, ambos incluidos en el deadline total de **900 s**, sin ampliarlo. El prefijo limita cada proceso a 120 s; el responsable también debe imponer el deadline global y recortar/terminar el comando al agotarse el tiempo restante, sin iniciar uno fuera de plazo. Siete parejas que agotaran todos sus máximos exigirían 1.680 s, antes de otras fases: **no se afirma que los máximos individuales quepan acumulados en 900 s**. `generate=120 s/root` es coherente como techo individual, no reserva de tiempo ni garantía de completar; agotamiento del total → `RUN_INCOMPLETE`, sin subir límites o fraccionar para eludirlos. Si una corrida futura necesita más presupuesto, quedará pendiente de revisión explícita del plan, no aprobado aquí.

En orden secuencial, `validate` primero y `generate` **sólo si ese validate tuvo exit 0 y se mantienen las precondiciones/deadline**; no usar `--skip-validate-spec`:

```bash
# admin-bff
"${CMD[@]}" -jar "${JAR}" validate -i "${run}/bundles/admin-bff.yaml"
"${CMD[@]}" -jar "${JAR}" generate -g spring --library spring-boot -i "${run}/bundles/admin-bff.yaml" -o "${run}/generate/admin-bff" --api-package com.entralo.goas.validation.adminbff.api --model-package com.entralo.goas.validation.adminbff.model --invoker-package com.entralo.goas.validation.adminbff.invoker --additional-properties "${OPTIONS}" --global-property "${GLOBAL}"
# buyer-bff
"${CMD[@]}" -jar "${JAR}" validate -i "${run}/bundles/buyer-bff.yaml"
"${CMD[@]}" -jar "${JAR}" generate -g spring --library spring-boot -i "${run}/bundles/buyer-bff.yaml" -o "${run}/generate/buyer-bff" --api-package com.entralo.goas.validation.buyerbff.api --model-package com.entralo.goas.validation.buyerbff.model --invoker-package com.entralo.goas.validation.buyerbff.invoker --additional-properties "${OPTIONS}" --global-property "${GLOBAL}"
# catalog
"${CMD[@]}" -jar "${JAR}" validate -i "${run}/bundles/catalog.yaml"
"${CMD[@]}" -jar "${JAR}" generate -g spring --library spring-boot -i "${run}/bundles/catalog.yaml" -o "${run}/generate/catalog" --api-package com.entralo.goas.validation.catalog.api --model-package com.entralo.goas.validation.catalog.model --invoker-package com.entralo.goas.validation.catalog.invoker --additional-properties "${OPTIONS}" --global-property "${GLOBAL}"
# identity
"${CMD[@]}" -jar "${JAR}" validate -i "${run}/bundles/identity.yaml"
"${CMD[@]}" -jar "${JAR}" generate -g spring --library spring-boot -i "${run}/bundles/identity.yaml" -o "${run}/generate/identity" --api-package com.entralo.goas.validation.identity.api --model-package com.entralo.goas.validation.identity.model --invoker-package com.entralo.goas.validation.identity.invoker --additional-properties "${OPTIONS}" --global-property "${GLOBAL}"
# payments
"${CMD[@]}" -jar "${JAR}" validate -i "${run}/bundles/payments.yaml"
"${CMD[@]}" -jar "${JAR}" generate -g spring --library spring-boot -i "${run}/bundles/payments.yaml" -o "${run}/generate/payments" --api-package com.entralo.goas.validation.payments.api --model-package com.entralo.goas.validation.payments.model --invoker-package com.entralo.goas.validation.payments.invoker --additional-properties "${OPTIONS}" --global-property "${GLOBAL}"
# purchases
"${CMD[@]}" -jar "${JAR}" validate -i "${run}/bundles/purchases.yaml"
"${CMD[@]}" -jar "${JAR}" generate -g spring --library spring-boot -i "${run}/bundles/purchases.yaml" -o "${run}/generate/purchases" --api-package com.entralo.goas.validation.purchases.api --model-package com.entralo.goas.validation.purchases.model --invoker-package com.entralo.goas.validation.purchases.invoker --additional-properties "${OPTIONS}" --global-property "${GLOBAL}"
# ticketing
"${CMD[@]}" -jar "${JAR}" validate -i "${run}/bundles/ticketing.yaml"
"${CMD[@]}" -jar "${JAR}" generate -g spring --library spring-boot -i "${run}/bundles/ticketing.yaml" -o "${run}/generate/ticketing" --api-package com.entralo.goas.validation.ticketing.api --model-package com.entralo.goas.validation.ticketing.model --invoker-package com.entralo.goas.validation.ticketing.invoker --additional-properties "${OPTIONS}" --global-property "${GLOBAL}"
```

**Prohibiciones del ensayo:** sin compile, `javac`, Maven, Gradle, build de producto ni ejecución del generado; sin `supportingFiles`, generación de `common`, output en `build/generated/` o cualquier ruta de producto, copia/promoción/empaquetado, instalación, red, Git ni scan. `library=spring-boot`/opciones Boot4/Jackson3 describen el perfil del ensayo, **no** actualizan ni prueban el stack de producto. No alterar contratos/bundles/perfil para obtener exit 0.

**AC-T16-CMD:** 7 validates y, si sus condiciones se cumplen, 7 generates registrados por separado; cada uno bajo JBR25 explícito, aislamiento OS no-egress, HOME/tmp externos y deadline individual/global. Los comandos son propuesta, no log ejecutado; fallos/no iniciados quedan diferenciados y nunca se usan Java26, red o compile como alternativa.

### 16.5 Evidencia futura, fallos, retención y criterios del ensayo

- **Manifests externos:** `${run}/manifests/generator-inputs.pre.json` y `generator-inputs.post.json` (siete bundles, ruta/bytes/SHA-256, vínculo a snapshot/source-map); `${run}/manifests/generator-toolchain.json` (JAR/JBR/rutas/versiones/digests, perfil/selección/paquetes y evidencia de aislamiento); `${run}/manifests/generator-outputs.json` (por root, cada archivo generado con ruta relativa, tipo, bytes/SHA-256; declarar output ausente/parcial). Son rutas propuestas, **no archivos creados**. Exigir inputs/toolchain pre=post; cambios invalidan los resultados para ese snapshot.
- **Commands/exit logs:** `${run}/logs/generator-commands.jsonl` registra cada fase/root, run_id, manifest de entrada/config, **argv expandido real**, cwd, timestamps UTC, duración, límites/deadline, ejecutable JBR/JAR, exit real (`null` si no inició), estado de timeout/señal/aislamiento y rutas stdout/stderr. Guardar `${run}/logs/<root>.validate.stdout.log`, `.validate.stderr.log`, `.generate.stdout.log`, `.generate.stderr.log` sin perder exit por pipes. No registrar payloads/tokens ni atribuir éxito a existencia de output.
- **Resultados separados:** `${run}/generator-report.md` enlaza manifests/logs y enumera las siete parejas, diagnostics, omisiones, archivos inesperados y blockers. Exit 0 de `validate` no prueba generación; exit 0 de `generate` no prueba compilación, compatibilidad runtime/Boot/Jackson ni semántica transaccional. Un informe del ensayo no cierra G-OAS, que conserva el resto de cobertura/gates de §6.
- **Fallos/retries/concurrencia:** un writer y orden secuencial por run; **máximo un intento por comando, sin retries/backoff** (§7). `validate` fallido impide `generate` del mismo root; registrar éste como no iniciado con causa. Fallo de aislamiento, input/toolchain cambiado o deadline total agotado detiene el resto. Fallo de generación conserva outputs parciales marcados incompletos; otras parejas sólo continúan si mantienen precondiciones y tiempo restante. Señales propuestas: `GENERATOR_VALIDATE_RECORDED`, `GENERATOR_GENERATE_RECORDED` (resultado registrado, **no gate satisfecho**), `GENERATOR_BLOCKED`, `SOURCE_CHANGED`, `RUN_INCOMPLETE`. No son señales emitidas ahora.
- **Idempotencia/compensación:** clave documental `(manifest de bundles, manifest JAR/JBR/perfil/paquetes, fase, root)`, asociada al run_id; no deducir éxito ni sobrescribir/reutilizar outputs como evidencia de otro intento. Repetición sólo tras resolución explícita con **run_id nuevo**, nunca automática. No hay cambios transaccionales de producto que revertir: compensación = conservar salidas parciales no promovibles/logs, marcar cobertura incompleta y no tocar canónicos.
- **Retención aprobada:** conservar **todo el run externo**, bundles, outputs, manifests y logs **hasta el cierre de gates**; `/tmp` no asegura persistencia por sí mismo. Responsable técnico debe asegurar dicha retención sin copia al repo/producto ni limpieza automática. Pérdida de evidencia → bloqueo de verificabilidad, no reconstrucción de resultados ni claim de cierre.

**AC-T16-E:** cobertura completa del ensayo sólo podrá evaluarse con 7/7 validates y 7/7 generates reales, argv/exit/logs y manifests íntegros, inputs inmutables, perfil/paquetes exactos, no-egress, outputs exclusivamente externos y ninguna salida de producto/compile. Cualquier fase faltante/fallida/timeout, drift o archivo de alcance inesperado queda explícito como pendiente/bloqueado; **este criterio no está cumplido ni evaluado por la persistencia documental**.

### 16.6 Cotejo documental y límite de esta escritura — sin handoff

**Cotejo explícito sobre este plan leído, no PASS de tooling ni validación canónica:** §16 mantiene los siete roots/common documental de §§4/6; JAR7.25/JBR25 de §§14.4/15.3; output externo y manifests de §6; un intento, compensación y deadline total de §7. El patrón/destino/retención aprobados en pack #45 y ratificados por la solicitud se materializan en §16.2 sin reabrir decisión. `generate=120 s/root` respeta el techo por artefacto, sin ampliar 900 s globales ni prometer que quepan los máximos acumulados. `config-help` se usa sólo como evidencia de existencia; runtime/compatibilidad de generación siguen sin probar. Canónicos no releídos ni recertificados; no se altera la política AC-GOAS-07.

**Precedencia acotada:** las referencias históricas a generador/config no resueltos de §§6/8/10/14 describen cortes anteriores. §16 fija ahora **la propuesta concreta**, no configuración desplegada ni ejecución; el smoke existente sigue siendo únicamente `version`, y `validate`/`generate` continúan **NO ejecutados por esta sesión**. No se afirma corrida ejecutada o `pass`. Estado final documental: **`planning`, G-OAS abierto, `verdict: none`**.

**AC-T16-LIMITE:** única escritura autorizada = este plan (cabecera de estado + §16), seguida de read-back. Sin contratos/canónicos/shared/pack/código/config/scripts/migraciones/tests, sin comandos de tooling, red/Context7, Git, instalación ni scan. No dispatch a Task Decomposer/Executor/Architect Executor; ningún `Human Plan Approval` ni closure/ready. La nueva escritura activa `refresh_when` del pack #45 para su owner; no se edita ni se despacha curator aquí. No se da por finalizada planificación ni se ejecuta la siguiente fase desde esta propuesta.
