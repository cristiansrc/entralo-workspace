# Plan condicionado de tooling G-OAS — entralo-v1-executable-specs

Lifecycle status: `planning`. Fecha: 2026-10-03. Autor: Planner. Carril: `feature`. Spec Validator `verdict: none`.
**Estado: bloqueado para preparación efectiva/corrida; diseño documental únicamente.** No aprobación de implementación, cierre de gate ni resultado de validación.

**Actualización de evidencia SA 2026-10-03:** informe nuevo `I/solution-architect-rereview-2026-10-03.md` leído, `approved` sólo para SA-F01…07/10 y D-N1-01/N2–N6. Condiciones nuevas §6.1 persistidas; la respuesta histórica no recuperada **ya no bloquea ese scope**. P04/HC/residuales G-SA y todos los permisos/controles técnicos siguen separados. El corte de reconciliación previo siguiente es histórico en cuanto a estado SA; no es autorización de red/tooling.

**Reconciliación documental 2026-10-03 con el shared actualizado:** la etapa A fue confirmada y **completada por el agente DevOps (`devops-architect`)**: cuatro GET de metadata, HTTP 200, sin redirects. **Autorización consumida; no habilita nuevas solicitudes ni repetición.** §3.1 registra exclusivamente resultados transcritos en el shared; no se consultan URLs ni se recalculan hashes en esta sesión. Tarballs, transitivos, instalación, scripts y validación siguen **NO autorizados** y requieren nueva propuesta y confirmación humana. Sólo se actualiza este plan; shared, pack, contratos y registros canónicos/gates permanecen intactos. **G-OAS abierto; G-SA formal `changes-required` / registro `pending` (pendiente), condiciones no verificables; lifecycle `planning`, `verdict: none`.**

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
- Parse YAML antes de lint con rechazo de claves duplicadas, tags ejecutables y aliases que excedan límites; JSON con rechazo de claves repetidas antes de pérdida de información. Límite propuesto: 10 MiB/documento, 100 niveles y 100 expansiones de alias; exceso bloquea el artefacto y se informa, no se trunca. Estos límites operativos no alteran schemas.
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
