# Propuesta de compatibilidad Java 25 — borrador para revisión SA

- **Incremento:** `entralo-v1-executable-specs`.
- **Lifecycle:** `planning`.
- status: awaiting-sa-rereview
- **Fecha:** 2026-10-04.
- **Naturaleza:** propuesta no canónica, resumida para revisión de Solution Architect (SA); no sustituye specs ni contratos vigentes.
- **Decisión del usuario:** Java 25 LTS es el target propuesto para backend; se autoriza a Planner/SA revisar el delta 21→25, no aplicarlo.
- **Baseline fuente:** Java 21 sigue vigente. Context Pack #29 consumido como índice (`pack_status: incomplete`), no como fuente de verdad; las secciones canónicas citadas en §6 se cotejaron mediante lecturas locales dirigidas, no mediante auditoría del repositorio ni del runtime.
- **Revisión de referencia:** `docs/specs/.working/entralo-v1-executable-specs-java25-sa-review.md`, 2026-10-04, dictamen `changes-required` sobre el borrador anterior de 116 líneas. Esta remediación modifica sólo la propuesta; no modifica ese informe ni su dictamen.
- **Aprobaciones:** re-review SA pendiente sobre estos nuevos bytes; sin aprobación SA de este delta, sin Spec Validator `ready` ni Human Plan Approval. La firma SA de 2026-10-03 pertenece a otro alcance y no se reabre, invalida ni amplía aquí. La autorización para revisar no equivale a aprobación del plan, implementación o despliegue.

## 1. Alcance y separación de targets

| Ámbito | Baseline / target | Efecto de esta propuesta |
| --- | --- | --- |
| Ejecutables JVM de producto | Kotlin / Spring Boot 4.1.1, Java 21 baseline de diseño, AWS ECS Fargate propuesto | Evaluar Java 25 en los seis servicios, ambos BFF y workers/jobs JVM; ningún cambio aplicado. |
| Canales de producto | React buyer/admin y transporte Node/TS / Vercel propuestos | Sin cambio de runtimes; aceptación E2E obligatoria frente al candidato backend. No se presume una versión efectiva Vercel. |
| G-OAS local | Generador OpenAPI con Java 26 | Entorno separado: no determina el runtime del producto. |

**Inventario de alcance de diseño, no inventario de aplicaciones existentes ni desplegadas:**

| Owner / rol previsto | Alcance de evaluación Java 25 | Prueba aplicable posterior (§5.1) |
| --- | --- | --- |
| Identity | API y ejecutables JVM asociados de binding/permisos | C2, C3, C4 y C5/C6 cuando aplique al rol |
| Catalog | API y ejecutables JVM asociados de oferta/control/activos | C2–C6 según rol |
| Purchases+Inventory | API y ejecutables JVM de reserva, saga y obligaciones | C2–C6, incluidos deadlines y recovery |
| Payments | API/webhook y ejecutables JVM de evidencia, conciliación/refund | C2–C6; MP real/sandbox sujeto a DR-05 |
| Ticketing+Validation | API y ejecutables JVM de emisión/guard/uso/verificación | C2–C6, incluido uso concurrente |
| Blockchain | Worker interno y jobs JVM de obligación/lotes/recovery; sin API HTTP V1 | C2, C4–C6; integración real de cadena sujeta a G-CHAIN |
| BFF buyer Kotlin AWS | Ejecutable independiente de sesión/callback/composición del canal buyer | C2–C6 según rol, E2E buyer obligatorio |
| BFF admin Kotlin AWS | Ejecutable independiente de sesión/callback/composición del canal admin | C2–C6 según rol, E2E admin obligatorio |
| Workers/jobs JVM por owner | Expiración/release, outbox/inbox, saga/emisión, reconciliación/refund, documentos/avisos y cadena según contratos; cualquier proceso JVM separado se registra individualmente | C2, C4–C6 según responsabilidad; compartir imagen base no los valida |
| Jobs técnicos JVM | Migración Flyway cuando se ejecute mediante JVM y otros launchers/jobs técnicos JVM que se materialicen | C2, C4 y C6 según rol; invocación/pins/identidad propios |
| React buyer + transporte Node/TS Vercel | Fuera del upgrade JVM, dentro de aceptación de compatibilidad full stack | C3/C5 desde browser por la ruta autorizada |
| React admin + transporte Node/TS Vercel | Fuera del upgrade JVM, dentro de aceptación de compatibilidad full stack | C3/C5 desde browser por la ruta autorizada |

Fuente de alcance: `docs/architecture/architecture-proposal.md` §1, §2 (BFF-01/02, RUN-01), §3, §11 y §12; `docs/architecture/decision-records/ADR-006-stack-runtime-y-entrega.md` «Decisión propuesta»; Master §1–2 (rutas completas en §6). Los BFF son adaptadores de canal, no dos bounded contexts adicionales. Los roles de workers no presuponen un binario por fila ni repositorios creados: el inventario ejecutable efectivo se completa posteriormente bajo autorización.

**Aceptación del inventario (R1/R2/R4):** antes de adopción, una fila por ejecutable y configuración efectivamente evaluados registra owner/rol, identidad de build/artefacto, runtime y patch, JDK de build/toolchain, JVM de tests/generación, release/target/límite de API, digest OCI/CPU cuando aplique, launch command, AC de origen→prueba→resultado/evidencia. Para UI/transporte no JVM se registra su versión/configuración efectiva y prueba E2E, sin asignarle JDK ni imagen ECS ficticios. No hay exclusiones implícitas de BFF, workers ni jobs JVM. Toda exclusión o adopción por fases necesita decisión explícita SA/owner y autorización posterior, indicando qué conserva 21, qué evalúa 25 y la prueba de interoperabilidad entre versiones; sin ello no se declara adopción completa.

### 1.1 Preservación contractual y límite de G-OAS

No se propone cambiar semántica de endpoints, DTOs, contratos OpenAPI, datos/migraciones, reglas de dominio ni integraciones. No se crea implementación ni paquete de salida. Se distinguen expresamente:

1. **Tooling y salidas locales de validación G-OAS, excluidos del producto por este delta:** JAR del Generator, JRE/JDK Java 26 local, herramientas de validación y sus dependencias, informes, metadata, provenance, fixtures locales, bundles y salidas de ensayo G-OAS. No se copian al backend/frontend ni a imágenes de producción como consecuencia de esta propuesta; el ensayo del JAR local no acredita compatibilidad del producto.
2. **Generación contractual de producto, preservada:** desde la fuente canónica declarada por Master §1/§6, pipeline `openApiValidate→openApiGenerate→compileKotlin/compileJava`; interfaces/modelos/DTOs Java en `build/generated/openapi`, clientes TS del contrato de canal y recursos OpenAPI derivados durante build cuando la fuente lo autorice. Su compilación y empaquetado derivados permitidos **no quedan excluidos**; no hay DTOs manuales duplicados ni segunda fuente runtime. Todo derivado conserva paths/methods/schemas/auth/errores/headers y semántica contractual del source. Véanse landscape §6 y decomposition «Fuentes autoritativas y nombres», L11, en §6.

R7 verifica ausencia de contaminación del tooling G-OAS, no una prohibición general de derivados OpenAPI. Los fixtures de interoperabilidad de producto exigidos en C1 son evidencia posterior distinta de los fixtures locales de G-OAS; no se prohíbe generar/compilar producto por haber un generador local con Java 26.

## 2. Hechos oficiales y límites de la evidencia

Las siguientes referencias fueron **verificadas en línea por el orchestrator el 2026-10-04**, según el contexto proporcionado. Planner no realizó consultas web en esta operación.

1. **Oracle Java SE Support Roadmap**, actualizado el **2026-09-15**: identifica Java 8, 11, 17, 21 y 25 como LTS; Java 27 como non-LTS; Java 29 planificado para septiembre de 2027.
   Fuente: https://www.oracle.com/java/technologies/java-se-support-roadmap.html
2. **Spring Boot 4.1.1 — System Requirements**: requiere como mínimo Java 17 y documenta compatibilidad hasta Java 26 inclusive. Advierte que componentes de terceros pueden tener requisitos adicionales o superiores.
   Fuente: https://docs.spring.io/spring-boot/4.1.1/system-requirements.html

La segunda referencia sitúa Java 25 dentro del rango documentado del framework. **No demuestra compatibilidad de toda la aplicación, dependencias, herramientas, agentes o imágenes OCI; tampoco acredita soporte de una imagen o distribución concreta en AWS ECS Fargate.** La clasificación LTS de Oracle no sustituye las condiciones de soporte, licencia y parches del proveedor elegido.

## 3. Matriz obligatoria de compatibilidad

Todos los pins y pruebas pendientes deben resolverse antes de aprobar la adopción. Ninguna fila se considera validada por las dos referencias anteriores, salvo el rango documentado de Spring Boot.

| Dimensión | Decisión o evidencia requerida para revisión/adopción |
| --- | --- |
| JDK que ejecuta el build | Proveedor, distribución, versión/patch y ruta efectiva; soporte del wrapper/plugins. Registrar JVM efectiva del daemon y procesos de build; distinguir compilador, tests y runtime. No heredar implícitamente el JDK del shell. |
| Toolchain de compilación | JDK exacto efectivo para Java/Kotlin, disponibilidad reproducible y límites de API verificados; no inferirlos sólo de release/target. |
| Release / bytecode | Fijar por separado `release` Java y target JVM Kotlin; inspeccionar clases propias/generadas, launcher y dependencias efectivamente seleccionadas por runtime. Target 21 corresponde a classfile major 65; target 25, a major 69. Para multi-release JAR, registrar variantes seleccionadas en 25 y en 21 sólo si se declara dual; no rechazar mecánicamente variantes futuras que no se carguen. |
| JRE de ejecución | Java 25 candidato con proveedor/patch exactos; Java 21 permanece baseline. Acreditar soporte de la distribución y de la aplicación. |
| Kotlin, plugins, target y API | Pins del compilador y plugins, compatibilidad con Gradle/Spring, target JVM y límite efectivo de APIs Java usadas por código propio/generado. No inferir compatibilidad de APIs a partir del bytecode solamente. |
| Gradle wrapper y plugins de build | Versiones exactas y fuentes oficiales de soporte para el JDK de build y toolchains; incluir generación, empaquetado y pruebas. |
| Spring BOM y cierre de terceros | Spring Boot 4.1.1 y BOM resuelto; inventario de dependencias transitivas, procesadores, librerías nativas y requisitos mínimos de JVM. |
| Imagen OCI | Proveedor, tag y digest inmutable, licencia/redistribución, sistema base, glibc u otra libc y dependencias nativas; definir imagen JRE/JDK sin presumir que ambas existen. |
| ECS Fargate / CPU | Elegir `X86_64` o `ARM64`; demostrar coincidencia entre manifiesto OCI, binarios nativos y target ECS. Una prueba en una arquitectura no valida la otra. |
| JVM de pruebas, integración y generación | Fijar y registrar proveedor/distribución/versión/patch/ruta efectiva de cada proceso forked, test worker y generador de producto. Tests bajo el daemon no prueban runtime 25. Suite mínima C1–C6 obligatoria aunque no haya tests previos; ejecutar el artefacto empaquetado con launcher real en Java 25. Java 21 adicional para el candidato sólo si se declara soporte dual. Java 26 del Generator local G-OAS conserva su carril separado. |
| Agentes, logging y APM | Versiones y soporte de instrumentación, cobertura, logging y APM; comprobar arranque, instrumentación y señales sin errores de enlace o carga. |
| Seguridad, soporte y operación | Cadencia y responsable de parches, plazo de soporte contratado/documentado, vulnerabilidades de JRE/imagen, criterios de rollout, rollback y monitoreo. |

## 4. Recomendación y alternativas

**Recomendación para SA:** evaluar runtime Java 25 manteniendo release/bytecode 21 **si resulta técnicamente viable** en la matriz. Separar explícitamente JDK de build, toolchain, APIs permitidas, bytecode y JRE. Runtime 25 no implica bytecode 25 ni autoriza uso de APIs exclusivas de Java 25.

- **Opción recomendada, condicionada:** runtime 25 con release/target 21; reduce el cambio de compilación, pero no prueba por sí sola que el mismo artefacto ejecute en 21.
- **Opción alternativa:** release/target 25 con runtime 25. Requiere justificación y aprobación separadas; no ofrece fallback del mismo artefacto a Java 21.
- **Opción de continuidad:** conservar íntegramente Java 21 si falta soporte, evidencia o decisiones de la matriz. Es la salida obligatoria ante incompatibilidad no resuelta.

No afirmar que un mismo artefacto funciona en Java 21 y 25 sin demostrar compatibilidad de APIs, dependencias, código generado y classfiles, y ejecutar la matriz de pruebas en ambos runtimes. El rollback puede usar el artefacto/imagen baseline 21 previamente verificado; no exige ni presupone portabilidad dual del artefacto candidato.

No se introducen módulos, boundaries ni patrones GoF nuevos. La revisión SA debe confirmar si la separación entre build y runtime basta o si aparece una decisión arquitectónica adicional; cualquier ampliación queda fuera de esta autorización.

## 5. Requisitos y criterios de aceptación de adopción

Estos son requisitos de evidencia **posterior**, no instrucciones ni resultados de ejecución en esta operación.

| ID | Requisito | Criterio de aceptación / evidencia |
| --- | --- | --- |
| R1 | Resolver pins y soporte | Registrar versiones exactas de JDK/JRE, Kotlin, Gradle, plugins, BOM/dependencias y agentes, con fuentes del proveedor y fecha de verificación. No quedan incompatibilidades ni soporte desconocido en la matriz. |
| R2 | Reproducibilidad y aceptación greenfield no vacua | Crear/ejecutar posteriormente la suite mínima C1–C6, desde entradas fijadas y para cada rol aplicable de §1; registrar AC de origen→ejecutable→prueba→resultado, comandos, JVM efectiva, entorno e identidad del artefacto. Si hay tests/baseline ejecutable, añadir comparación de regresión; si no, marcar comparación pendiente, nunca «sin fallos nuevos» por cero tests. Ausencia de suite/evidencia no satisface R2. |
| R3 | Compatibilidad Kotlin/Java | Registrar toolchains, release/target y mecanismo efectivo que limita APIs Java/Kotlin; verificar clases propias, generadas, launcher y dependencias/variantes multi-release seleccionadas por runtime. C2 prueba el artefacto empaquetado en 25; mismo candidato en 21 sólo ante declaración dual. `jvmTarget`/major por sí solos no prueban el límite de API ni portabilidad. |
| R4 | Validar cada ejecutable y la ruta full stack | Ejecutar cada digest candidato Java 25 con launcher/configuración y CPU ECS Fargate elegidos; arranque/health checks son necesarios pero insuficientes. C2–C5 cubren BFF, APIs, workers/jobs JVM, dependencias y ruta buyer/admin React/transporte Vercel→Gateway→BFF→familia owner, sin cambiar runtimes Vercel ni presumir infraestructura existente. |
| R5 | Seguridad y lifecycle de parches | Documentar licencia, responsable, cadencia de actualización y fin de soporte; disponer de evaluación de vulnerabilidades del JRE/imagen y política de bloqueo o excepciones aprobadas. No asumir equivalencia de soporte entre vendors. |
| R6 | Rollout/rollback y restore sin repetir efectos | C6 ensaya convivencia rolling 21/25 y rollback a artefacto/imagen 21 identificados y previamente verificados, también después de efectos durables. Si el baseline aún no existe, su preparación/verificación queda pendiente, no se inventa evidencia. Preservar mínimos de Master §6–7, ADR6-AC3/AC5/AC6 e I2-AC01–04; fijar después ventanas/responsables/señales sin sustituir umbrales contractuales. Sin cambio de schema ni down migrations por este delta. Artefacto dual requiere pruebas independientes del mismo candidato en 21/25. |
| R7 | Aislar tooling G-OAS sin bloquear generación contractual | Aplicar la clasificación §1.1: verificar en paquete/imagen que no se transfieran JAR/JRE26, dependencias, informes/metadata/provenance/fixtures/salidas locales G-OAS. Preservar interfaces/DTOs/clientes/recursos derivados autorizados de source canónico y su empaquetado, sin cambio de semántica; C1 prueba interoperabilidad y regeneración determinista de producto. Frontend conserva su runtime. Evidencias G-OAS no sustituyen R1–R6. |
| R8 | Respetar autorización | Ninguna fuente autoritativa cambia durante esta revisión. Su futura edición requiere permiso explícito del usuario; implementación/despliegue requieren además Spec Validator `ready` y aprobación humana del plan en el shared context. |

### 5.1 Suite mínima posterior y trazabilidad de aceptación

`C1`…`C6` son identificadores locales **de esta propuesta**, no AC canónicos nuevos ni resultados. Concretan evidencia de compatibilidad contra los AC existentes citados; no son implementation tasks. Se prepararán/ejecutarán sólo con autorización posterior. Un caso aplicable sin resultado o bloqueado por un externo queda pendiente/bloqueado con owner/evidencia faltante, no se convierte en PASS ni compatibilidad presumida. Un doble/stub contractual no cierra DR-05, G-CHAIN ni un E2E real.

| Caso / R | Fuente de aceptación existente | Evidencia mínima y resultado exigido posterior |
| --- | --- | --- |
| C1 / R2,R3,R7 — generación de producto | Master §6–7; landscape §6; ADR6-AC1 y prerrequisitos SAR-05/12; G-BOOTSTRAP; arquitectura §17 SAR12-AC | Fixture de producto con pins generator/Boot4.1.1/Jackson3/Kotlin: generar, compilar e interoperar implementación Kotlin/interfaces Java; serializar requests/responses y errores `ApiErrorResponse`, nullability y decimales COP string scale2 sin float ni alteración de contrato. Regenerar desde mismas entradas sin diff no determinista; verificar clientes TS/recursos derivados autorizados donde aplique. No sustituible por invocar JAR local G-OAS. |
| C2 / R1–R4 — artefacto y JVM efectiva | Master §6–7; G-BOOTSTRAP; ADR6-AC1/AC4 | Build repetible, unidad/integración PostgreSQL y arquitectura por rol aplicable; dominio sin framework/DTO HTTP/JPA y application sin infraestructura. JaCoCo≥85% por archivo testable, exclusiones según Master §7. Registrar JVM efectiva de build/tests/generación y probar paquete/launcher real en 25, no sólo clases sueltas ni tests con daemon distinto. Verificar APIs/classfiles efectivos incluidos multi-release/nativos/agentes/TLS sin errores de carga/enlace. Sólo declaración dual exige el mismo paquete candidato probado además en 21. |
| C3 / R2,R4 — E2E buyer/admin | Master EX-01/EX-04/EX-07/EX-08/EX-09/EX-13/EX-14 y §5/§7; brief §12 CA-AUTH-01/CA-04/05/07/08; arquitectura §7 «AC AUTH» y §16 Ingress/cookie/Criterios de test | Cada canal desde React/transporte Vercel→Gateway IAM→BFF correspondiente→familia owner autorizada: sesión/login/callback, cookies same-origin, CSRF/Origin, refresh concurrente/fail-closed, autorización/propiedad/MFA y propagación de status/errores. Buyer compra/pago/emisión/consulta; admin autorización SUPPORT/refund y acceso staff con permiso actual. Rechazos sin efectos, sin fuga de tokens/PII ni fallback de origen. No cambiar runtimes React/Node ni afirmar apps desplegadas; host/callback/entornos reales se fijan posteriormente. |
| C4 / R2,R4 — async y dependencias | Master EX-03…EX-09/EX-12/EX-14/EX-15 y §4/§6/§7; G-BOOTSTRAP (HC09); ADR-006 prerrequisitos SAR-05/12; arquitectura §5.2 M1-AC01–08, §6 y §17 SAR-08/09 | PostgreSQL/JPA/Flyway por owner, SQS/outbox/inbox, DynamoDB sesiones y AWS SDK/TLS ejercitados con las versiones fijadas; MP/cadena según contrato y gates, evidencia externa o bloqueo explícito. Inyectar crash, ACK perdido, duplicados, timeout/outage, worker stale/failover: claves/leases/fences/deadlines/retries/compensaciones originales no se resetean. HC09 demuestra enforcement total tx≤1s incluso con múltiples statements individuales<1s y suma>1s; virtual threads no eluden pools/bulkheads ni reloj DB. Jobs release no esperan red. No se inventa nueva política async. |
| C5 / R2,R4,R6 — capacidad/integridad | Master §6–7; G-CAPACITY; ADR6-AC3/AC6; arquitectura §11.1 I2-AC01–04 y §17 SAR12-AC | Perfil existente: hot event10 localidades/100000 cupos/10000 cuentas,200 holds/s15min y burst400/s60s, I24/I08/I28 a misma intensidad, deadline/recovery-wave y carga mixta puerta/PDF/chain/failover. Concurrencia último cupo/límite de cuenta, emisión/uso/refund únicos; todos los contadores de integridad de Master §6=0. Medir p95 lecturas/puerta≤200ms, hold≤300ms, evidence→acceptance p95≤1s/p99≤5s y restantes objetivos existentes; pools agregados≤70% y headroom30% incluidos rolling/workers/Flyway. Registrar JVM/CPU/memoria/GC/latencia/locks/colas, virtual threads y saturación, sin nuevos umbrales ni garantía de volumen MP. Objetivos propuestos, no benchmarks obtenidos. |
| C6 / R2,R6 — rolling, rollback y restore | Master §6–7; ADR6-AC3/AC5/AC6; arquitectura §11/§11.1 I2-AC01–04 y §12; G-CAPACITY/G-GO-LIVE | Ensayar convivencia 21/25 y retirada del candidato a baseline21 verificado tras pagos/aceptaciones/emisiones/uso/refunds durables. Preservar contratos, ledger, outbox/inbox, jobs, fences/idempotencia y writer único; cero segundo MP/desembolso/emisión/acceso y `restore_reconciliation_mismatch_total=0` antes reabrir. Restore aislado incluye force-login y conciliación MP/guard/uso antes replay; registrar pérdida/tiempos frente a objetivos existentes RPO5min/RTO60min instancia/AZ y24h/8h regional, sin prometerlos. Rollback de aplicación no es restore ni down migration; este delta no cambia schema. |

**Regla de observabilidad de aceptación:** cada resultado enlaza artefacto/digest/runtime/CPU y perfil con logs/trazas W3C sanitizados y métricas de Master §6, incluyendo `reservation_oversell_total`, `ticket_duplicate_effect_total`, `ticket_double_use_total`, `refund_duplicate_disbursement_total`, `issuance_false_refund_total`, `payment_unknown_hold_limit_breach_total` y `refund_initiation_sla_breach_total` (todos cero), además de `payment_evidence_to_acceptance_seconds`, misses/overdue, salud/pools y mediciones JVM/CPU/memoria/GC. Cualquier contador de integridad>0 impide aceptación y conserva alerta critical inmediata; métricas sin ejecución ni resultados no acreditan un caso. Los budgets, timeouts y compensaciones siguen siendo los de las fuentes, no valores derivados del cambio de JRE.

## 6. Impacto documental propuesto — no aplicado

Solo después de revisión SA y autorización expresa para editar fuentes autoritativas, evaluar y sincronizar:

Rutas relativas al repositorio activo `/mnt/data/Shares/Projects/entralo-workspace/`. Las secciones/rangos siguientes fueron leídos localmente para este cotejo; las líneas son punteros de lectura, no hashes ni auditoría completa. **Ninguna fuente de esta tabla se edita en esta operación.**

| Fuente / sección verificada | Hecho observado | Delta a evaluar sólo con autorización posterior |
| --- | --- | --- |
| `README.md`, «Dirección de arquitectura (propuesta)», L59–70 | Diseño no implementado; L64 Kotlin/Java21/Boot4; React/Vercel L69 | Sincronizar resumen del runtime sólo tras decisión de adopción/fuentes; conservar naturaleza propuesta/estado real. |
| `docs/architecture/architecture-proposal.md`, §2 L56/62–63, §11 L307, §12 L331–343, §16–17 L437–468 | §2 Java21 «C, no reabrir»; §11 virtual threads21; §12 baseline21, generación y releases independientes; aceptación futura | La autorización actual permite revisar esa restricción **como propuesta**, no sobrescribirla. Futuro delta explícito separará build/toolchain/API/release/JRE y alcance por ejecutable; preservará boundaries/generación/AC. No reescribir firmas históricas. |
| `docs/architecture/system-landscape.md`, §6 L184–198 y §7 L204/210 | Java21 confirmado, Java25 candidato; `build/generated/`/recursos runtime derivados y releases de canal separados | Sincronizar target candidato/adoptado según decisión posterior y matriz; mantener pipeline/empaquetado autorizado y separación Vercel/BFF/tooling. |
| `docs/architecture/decision-records/ADR-006-stack-runtime-y-entrega.md`, «Contexto»/«Decisión propuesta» L6–18, «Consecuencias y criterios» L23–26, «I-2 — bootstrap y evolución de aislamiento físico» L28–32, «Recuperación y coste operativo» L34–35 | Baseline21; 25 candidato; ADR `proposed`; ADR6-AC1/3/4/5/6 y fixture/capacidad/restore | Registrar delta/alternativas/evidencia tras permiso, sin convertir propuesta en ADR accepted ni soporte completo por inferencia; conservar AC. |
| `docs/specs/increments/entralo-v1-executable-specs/master-spec.md`, §1 L15–27, §6–7 L93–107 | Greenfield/rutas futuras; **pin Java21 literal en §6 L95**; generación y mínimos futuros de carga/integridad/restore | Proponer delta autorizado al baseline de runtime y verificación por ejecutable, preservando semántica OpenAPI/datos/AC y distinguiendo release21 de runtime25; no aplicarlo aquí. |
| `docs/specs/increments/entralo-v1-executable-specs/gate-register.md`, tabla de gates L24–27 y «Estado vigente — nueva firma SA» L64–68 | **G-BOOTSTRAP no contiene literalmente pin Java21**: exige pins/compileBoot4.1.1/Jackson3/nullability/HC09; G-CAPACITY/G-GO-LIVE separados, gates pendientes | Cotejar/ampliar evidencia JVM efectiva/paquete/interop de G-BOOTSTRAP y capacidad/restore asociados si se autoriza; no «reemplazar Java21» inexistente en esa fila ni cerrar gate por este informe. |
| `docs/specs/increments/entralo-v1-executable-specs/decomposition-contract.md`, «Fuentes autoritativas y nombres» L7–13 | Generación/modelos únicos en L11; remite opciones a Master §6 y pin bootstrap, no pin Java21 literal en esa sección | Cotejar referencias/nombres/orden/bloqueos contra futuro delta; editar sólo drift demostrado y autorizado, no automáticamente ni crear tareas. |
| `docs/specs/increments/entralo-v1-executable-specs/consistency-review.md`, cabecera L1–5, «Evidencia documental y findings» L7–22 | Registro Planner, no dictamen; firma previa de alcance distinto y residuales diferenciados; sin pin21 literal en secciones cotejadas | Cotejar referencias/estado del conjunto futuro sin sustituir revisión independiente ni reescribir firma/historia; no cambio automático. |
| `docs/specs/increments/entralo-v1-executable-specs/review-request.md`, «Consulta formal — solution-architect», «Refresh — context-curator», «Revisión independiente — spec-validator», L7–21 | Mandato/proceso y solicitudes históricas; no firma ni pin Java21 literal en secciones cotejadas | Cotejar solicitud vigente y conjunto sometido a futura revisión; sólo delta autorizado necesario, sin atribuir aprobaciones o invocaciones. |

No existe drift por conservar Java21 en las fuentes: es el baseline correcto hasta aprobación y sincronización autorizadas. G-BOOTSTRAP y G-CAPACITY, requisitos de release/restore de arquitectura/ADR y G-GO-LIVE/G-HUMAN-CONTRACT permanecen distintos de G-OAS local. No se inventa un gate de release nuevo ni se sustituye aceptación de producto por evidencia del generador.

Este borrador no es un Decomposition Contract ni habilita tareas de implementación. La futura sincronización debe impedir que “Java 25 aprobado”, “bytecode 25 obligatorio”, “mismo artefacto 21/25 garantizado” o “Java 26 runtime del producto” aparezcan como hechos sin decisión y evidencia.

## 7. Solicitud formal de revisión SA y decisiones abiertas

Se solicita **re-review SA** de este borrador remediado frente a SA-J25-01…05 del informe independiente enlazado en la cabecera: alcance/generación, inventario full stack, aceptación greenfield, JVM efectiva y mapa documental, además de recomendación/matriz/alternativas. Devolver dictamen propio, decisiones justificadas e información pendiente; no se atribuye aquí aprobación SA nueva ni cierre independiente de findings.

SA y owner deben resolver:

1. Proveedor/distribución Java y condiciones de licencia/soporte.
2. Versiones y patches exactos de JDK de build, toolchain y JRE candidato.
3. Target CPU ECS Fargate: `X86_64` o `ARM64`.
4. Pins exactos de Gradle, Kotlin, plugins, dependencias y agentes.
5. Si el objetivo exige **un mismo artefacto** ejecutable en Java 21/25 o admite rollback a un artefacto baseline distinto.
6. Restricciones de rollout: entorno de validación, ventana, tráfico, umbrales de salud/error/latencia, tiempo de observación y recuperación.

## 8. Consistencia interna y siguiente acción

- Java 21 continúa como baseline; Java 25 es candidato, no adopción realizada.
- El rango de Spring Boot no valida el cierre de dependencias ni ECS/imágenes.
- Runtime 25, bytecode 21 y eventual soporte dual son decisiones distintas.
- React/Vercel y Java 26 de G-OAS no cambian por esta propuesta.
- Generación contractual de producto permitida por las fuentes no equivale a empaquetar tooling/salidas locales G-OAS; R7 no prohíbe interfaces/DTOs/clientes/recursos derivados autorizados.
- No hay cambios de semántica API/BD/integraciones ni autorización para generar implementación, paquetes o despliegues. Inventario y C1–C6 son criterios posteriores, no aplicaciones ni pruebas existentes afirmadas.
- Cotejo documental focalizado de §6 realizado por lectura; no auditoría completa ni certificación de consistencia global, compatibilidad, build/tests, hashes, Git o scan. Sólo se modifica este borrador; canónicos, README, shared, pack y runtime quedan intactos.

**Siguiente acción:** re-review independiente SA de los nuevos bytes del borrador (`awaiting-sa-rereview`), no handoff de implementación. Esta escritura activa `refresh_when` del pack #29: solicitar actualización focalizada a su owner `context-curator` antes de reutilizarlo como índice vigente; no actualizar pack/shared en esta operación. Tras re-review, resolver preguntas con owner y obtener permiso explícito para sincronizar fuentes autoritativas; después continuar gates y Spec Validator sobre el conjunto autorizado. Sólo tras `ready`, pasar a `awaiting-human-plan-approval`; sin el encabezado `## Human Plan Approval: approved_by_user` en el shared context, no finalizar planificación ni habilitar descomposición, implementación o despliegue. Este archivo no constituye ni reemplaza ese shared context.

## 9. Trazabilidad de remediación SA — pendiente de re-review

Disposición Planner: cambios textuales para atender cada finding, **no veredicto SA aprobado ni cierre independiente**. Fuente de todos los IDs: informe `docs/specs/.working/entralo-v1-executable-specs-java25-sa-review.md` §4.

| Finding | Corrección en esta propuesta | Alternativa descartada / impacto | Aceptación textual para re-review |
| --- | --- | --- | --- |
| SA-J25-01 Major | §1.1, R7 y C1 distinguen G-OAS local de generación contractual/empaquetado derivado autorizado | Prohibición general de «documentos generados» descartada: bloquearía interfaces/DTOs/clientes/recursos previstos por las fuentes. Sin cambio semántico del contrato. | Exclusión delimitada a tooling/salidas G-OAS; pipeline/source/build/generated/ y fixture Boot4/Jackson3/Kotlin preservados explícitamente. |
| SA-J25-02 Major | §1 inventaría seis servicios, ambos BFF, workers/jobs JVM y canales; R2/R4 y C3–C5 cubren E2E/async/dependencias | «Backend» agregado o una imagen base como validación de todos descartados. Sin nuevos bounded contexts ni claim de apps desplegadas. | Matriz futura por ejecutable/configuración→AC/prueba/resultado, E2E buyer/admin por ruta autorizada y externos bloqueados sin compatibilidad asumida. |
| SA-J25-03 Major | R2/R4/R6 y §5.1 C1–C6 anclan suite mínima a Master §6–7, bootstrap/capacidad/restore y AC verificados | Aceptación por cero «pruebas existentes» o sólo smoke descartada. Regresión sin baseline queda pendiente; sin thresholds/schema nuevos. | Carga/concurrencia/fallo-reinicio/rolling/rollback/restore y métricas de integridad cero explícitos, con budgets/pools/HC09 preservados. |
| SA-J25-04 Minor | §3, R2/R3 y C2 fijan evidencia de JVM efectiva build/tests/generación, paquete/launcher25 y multi-release por runtime | Inferir API desde jvmTarget/major o rechazo indiscriminado de variantes futuras descartados. No pin/config syntax elegidos sin evidencia. | Artefacto identificado ejecutado en25 posteriormente; mismo candidato21 sólo ante claim dual, límite efectivo de API verificado y clases seleccionadas cubiertas. |
| SA-J25-05 Minor | §6 sustituye nombres genéricos por rutas/secciones leídas y delta esperado por fuente | Atribuir pin21 literal a G-BOOTSTRAP o actualizar todos los registros automáticamente descartado. Baseline sigue en Master/arquitectura; firmas previas intactas. | Pin21 localizado en Master §6/arquitectura, gate sin ese literal, mapa futuro condicionado a permiso y gates separados de G-OAS. |
