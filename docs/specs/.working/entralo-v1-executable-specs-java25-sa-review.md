# Revisión independiente SA — propuesta de compatibilidad Java 25

- **Rol / autor:** Solution Architect (`solution-architect`), revisión independiente de la remediación de Planner.
- **Fecha:** 2026-10-04. **Ronda:** 2, re-review SA.
- **Naturaleza:** informe no canónico; no sustituye Master Spec, arquitectura, shared context, contratos ni registro de gates.
- **Artefacto revisado:** `docs/specs/.working/entralo-v1-executable-specs-java25-compatibility-proposal.md`, fecha 2026-10-04, lifecycle `planning`, status `awaiting-sa-rereview`, **L1–180 leídas íntegramente**.
- **Referencia de ronda 1:** este mismo informe antes de su reemplazo, 2026-10-04, L1–101 leídas íntegramente, `changes-required` para el borrador anterior de 116 líneas; findings SA-J25-01…05 (§4, L52–85). Se conserva aquí su identidad, severidad, motivo y disposición; el reemplazo no convierte el dictamen anterior en aprobación histórica.
- **Identificación de bytes:** contenido observado mediante lectura local en esta sesión. SHA-256, freeze y revisión Git: **no comprobados**. Pack #29 describe el corte anterior, no identifica estos bytes remediados; cualquier modificación sustantiva posterior requiere nuevo cotejo.
- **Veredicto SA:** **`approved`, exclusivamente para el diseño documental del borrador de 180 líneas y el cierre de SA-J25-01…05.** Sin nuevos bloqueantes de diseño identificados en este alcance.

## 1. Alcance exacto, autoridad y método

Se cotejó uno por uno el criterio de corrección/aceptación de los cinco findings de ronda 1 contra el texto remediado, la separación build/toolchain/API/bytecode/tests/runtime, el inventario y aceptación full stack, la generación contractual, los mínimos de aceptación no vacua y el mapa de impacto documental. No es una revisión integral del incremento ni una certificación de consistencia global del repositorio.

Prelación aplicada: solicitud humana actual y autorización acotada > fuentes canónicas pertinentes > propuesta actual como objeto de revisión. El informe previo define los findings; **Pack #29 es índice de autoridad/procedencia, `pack_status: incomplete`, no norma ni snapshot del borrador actual**. Sus registros #27–#29 confirman que Java 25 LTS fue aprobado por el usuario como **target candidato/propuesto para revisión**, no para aplicación ni edición canónica. Los fragmentos históricos #26/4.1.0 no desplazan la evidencia específica Boot 4.1.1 de #27.

**Java 21 continúa baseline vigente.** Pasar esta revisión no autoriza actualizar fuentes canónicas, cambiar runtime/bytecode, instalar JDK, implementar, desplegar ni modificar AWS. No se reabre, invalida o amplía la firma SA del 2026-10-03, de otro alcance. `planning`, Spec Validator `verdict: none`, G-OAS abierto y G-HUMAN-CONTRACT pendiente se conservan según los registros observados; este informe no los transiciona.

Método: lecturas locales y cotejo documental focalizado. No se hizo red ni Context7, builds/tests, generación, instalación, AWS, Git o scans. La búsqueda dirigida `graphify-out/graph.json` no encontró archivo; no se instaló ni construyó grafo. Una búsqueda de contenido del pack devolvió también coincidencias de archivos vecinos; los hechos esenciales se cotejaron por lecturas exactas. No se auditó el filesystem completo.

## 2. Fuentes y rangos efectivamente revisados

Rutas relativas a `/mnt/data/Shares/Projects/entralo-workspace/`. Rangos de texto observado, no hashes ni declaración de auditoría completa de todos los contratos.

| Fuente | Rango observado / foco | Uso en esta ronda |
| --- | --- | --- |
| `docs/specs/.working/entralo-v1-executable-specs-java25-compatibility-proposal.md` | L1–180, íntegro; §1–1.1 L13–49, §3–5.1 L62–121, §6–9 L123–180 | Objeto actual y evidencia de cada corrección |
| `docs/specs/.working/entralo-v1-executable-specs-java25-sa-review.md`, antes del reemplazo | L1–101, íntegro; findings L52–85 | Criterios de ronda 1, no cierre atribuido a Planner |
| `docs/specs/.working/entralo-v1-executable-specs-planning-context.md` | Lectura visible L1–76; foco cabecera #27–#29 L10–14, autoridad L29–38 y L69–75; búsqueda dirigida complementaria L102/139/201/231 | Permiso acotado, procedencia Boot 4.1.1 y estado histórico del borrador/informe. Líneas largas parcialmente truncadas; no se afirma lectura íntegra del pack |
| `README.md` | L59–72 | Java21, topología y diseño no implementado |
| `docs/architecture/architecture-proposal.md` | L1–468, lectura en tres bloques; foco §2 L56/62–63, §3 L94–125, §5.2 L171–189, §6–7 L191–259, §11–12 L305–343, §16–17 L437–468 | Inventario, rutas de canal, AC, capacidad/restore, generación y baseline |
| `docs/architecture/system-landscape.md` | L184–212, §6–7 | Generación/empaquetado derivado autorizado, baseline21/candidato25, releases independientes |
| `docs/architecture/decision-records/ADR-006-stack-runtime-y-entrega.md` | L1–35, íntegro | Baseline/candidato, ADR proposed, ADR6-AC1/3/4/5/6 y fixture SAR-05/12 |
| `docs/specs/increments/entralo-v1-executable-specs/master-spec.md` | L1–116; foco §1–2 L9–44, EX L50–66, §4–7 L68–107 | Fuentes actuales/futuras, ownership, pin Java21 L95, generación, budgets, integridad y pruebas futuras |
| `docs/specs/increments/entralo-v1-executable-specs/gate-register.md` | L1–68, íntegro; foco L24–27 y L64–68 | G-BOOTSTRAP sin pin Java21 literal; gates separados y pendientes |
| `docs/specs/increments/entralo-v1-executable-specs/decomposition-contract.md` | L1–23; foco L7–13 | Fuente única, DTOs generados, fronteras y proceso |
| `docs/specs/increments/entralo-v1-executable-specs/consistency-review.md` | L1–25 | Registro Planner, firma de alcance distinto, no pin21 literal en secciones cotejadas |
| `docs/specs/increments/entralo-v1-executable-specs/review-request.md` | L1–25 | Mandato/proceso, no firma ni aprobación humana |
| `docs/specs/requirements/entralo-v1-requirements-brief.md` | L130–214; foco §12 L143–162 | CA-AUTH-01 y CA-04/05/07/08 citados por C3; preservación funcional |

No se releían shared, APIs/schemas/data completos, integration-contract completo ni la firma histórica para reemitirla. Los enlaces a esos contratos en las fuentes observadas son referencias, no evidencia de auditoría integral. No se inspeccionaron dependencias resueltas, build, imágenes ni aplicaciones desplegadas; la condición greenfield se toma de las fuentes, no de una búsqueda física nueva.

### Evidencia oficial reportada, no revalidada en red por SA

- Oracle Java SE Support Roadmap, actualización reportada 2026-09-15: `https://www.oracle.com/java/technologies/java-se-support-roadmap.html`; procedencia de verificación del orquestador 2026-10-04, conservada en pack/borrador L53–56.
- Requisitos específicos Spring Boot 4.1.1: `https://docs.spring.io/spring-boot/4.1.1/system-requirements.html`; procedencia del orquestador, pack L73 y borrador L57–60: **Java17–26 inclusive sólo a nivel framework**, con requisitos adicionales/superiores posibles en terceros.
- El rango incluye25; **no demuestra compatibilidad del stack, Kotlin/Gradle/plugins/BOM/transitivos/nativos/agentes, APIs, OCI, CPU o ECS Fargate**. Oracle LTS no equivale a soporte/licencia/parches de cualquier vendor. No se recertifican hoy las páginas ni se inventa evidencia de ejecución.

## 3. Disposición independiente, finding por finding

### SA-J25-01 — Mayor — cerrado en diseño

**Motivo original:** exclusión general de «documentos generados» que podía impedir generación/empaquetado de producto exigidos por las fuentes.

**Corrección comprobada:** borrador L42–49 distingue tooling/salidas locales G-OAS de generación contractual de producto; R7 L105 verifica contaminación, no prohibición de derivados; C1 L114 exige fixture producto compile/interop/serialize/errors/nullability/decimal y regeneración determinista. Conserva pipeline, `build/generated/openapi`, clientes TS y recursos derivados autorizados, sin DTO manual duplicado. Coincide con Master L95, arquitectura L337, landscape L194–196 y decomposition L11. Java26/JAR/dependencias/informes/provenance/fixtures locales G-OAS no se transfieren por este delta; su ensayo no acredita producto. **Criterio textual satisfecho; prueba real pendiente.**

### SA-J25-02 — Mayor — cerrado en diseño

**Motivo original:** «backend» agregado no identificaba BFF, workers/jobs ni aceptación E2E React/transporte→Gateway→BFF→owner.

**Corrección comprobada:** L21–40 incluye seis owners, ambos BFF Kotlin, workers/jobs JVM y jobs técnicos/migración cuando JVM, más los dos canales no JVM; exige futura fila por ejecutable/configuración, identidad/artefacto/JVM/toolchain/API/digest/CPU/prueba y exclusiones/fases explícitas. R4 L102 y C3/C4 L116–117 cubren E2E buyer/admin, sesión/callback/cookies/CSRF/Origin/autorización/errores y dependencias async PostgreSQL/JPA/Flyway/SQS/DynamoDB/AWS SDK/TLS. MP/cadena quedan con evidencia externa o bloqueo, no PASS por stub. Coincide con arquitectura L23/62–63/94–125/220–231/333, ADR L14–16, Master §1–2 y brief §12. No crea bounded contexts ni presume apps/versions Vercel efectivas. **Criterio satisfecho como inventario de diseño y obligación de trazabilidad futura; inventario efectivo pendiente.**

### SA-J25-03 — Mayor — cerrado en diseño

**Motivo original:** aceptar sólo «pruebas existentes» permitía aceptación vacía greenfield y smoke sin mínimos contractuales de capacidad/rolling/rollback.

**Corrección comprobada:** R2 L100 hace obligatoria suite C1–C6 aun sin tests previos; comparación de regresión sin baseline queda pendiente, no «sin fallos nuevos». R4/R6 L102–104 y L110–121 anclan fixture, arquitectura/interop, carga/concurrencia/fallo-reinicio, budgets/pools/HC09, rolling21/25, rollback tras efectos durables y restore. Perfil200/400, headroom30%/pools≤70%, integridad cero, métricas JVM/CPU/memoria/GC/latencia y RPO/RTO coinciden con Master L83/95–105, gate L24–27, arquitectura L307–327/341/447/464/466 y ADR L24/30–35. C6 distingue rollback de aplicación de restore y no introduce schema/down migrations ni umbrales nuevos. Baseline ejecutable21 debe identificarse/verificarse, no se inventa existente. **Aceptación no vacua suficientemente especificada; ninguna suite o métrica se declara ejecutada.**

### SA-J25-04 — Menor requerido — cerrado en diseño

**Motivo original:** JVM de tests/generación efectiva y alcance de classfiles/dual insuficientemente explícitos.

**Corrección comprobada:** matriz L68–78, R2/R3 L100–101 y C2 L115 distinguen daemon/build, compilador/toolchain, tests forked/integración/generador y runtime empaquetado con launcher real25. Exigen mecanismo efectivo de límite API y clases propias/generadas/launcher/dependencias seleccionadas por runtime, incluidas variantes multi-release; no rechazo mecánico de variantes futuras no cargadas. L83–89/L104 mantienen dual como decisión separada: mismo candidato21 adicional sólo si se declara dual; rollback a artefacto21 distinto exige su verificación propia. No confunden target/major65/69 con límite API ni el Generator local26 con generación de producto. **Criterio satisfecho; sin seleccionar pins o sintaxis no corroborados.**

### SA-J25-05 — Menor requerido — cerrado en diseño

**Motivo original:** impacto documental genérico sin rutas/secciones/prelación concreta, con riesgo de atribuir pin21 literal al gate o editar automáticamente registros.

**Corrección comprobada:** §6 L123–143 proporciona rutas/rangos y delta esperado por fuente, condicionado a permiso explícito; L135 ubica Java21 literal en Master L95, L136 reconoce su ausencia literal en G-BOOTSTRAP L24. README L64, arquitectura L56/307/331 y landscape/ADR conservan baseline; no es drift actual. Decomposition/consistency/review-request se cotejan por referencias/estado, sin edición automática ni reescritura de firmas. R8 L106 y siguiente acción L168 separan revisión, autorización canónica, Validator y aprobación humana. Gates de producto no se confunden con G-OAS. **Mapa contrastado y criterio satisfecho; ninguna edición canónica aprobada.**

## 4. Veredicto y recomendación técnica acotados

**`approved` para el diseño documental revisado de 180 líneas. SA-J25-01…05 cerrados en esta ronda; no nuevos findings bloqueantes en el alcance cotejado.** Las correcciones son suficientes frente a los criterios del informe previo; no se usa la propia tabla de remediación de Planner como firma independiente.

Se mantiene la recomendación **evaluar runtime25 con release/target21 si la matriz acredita viabilidad**, separando límite API, toolchains y JVM efectiva. No se adopta esa combinación ni se garantiza el mismo artefacto21/25. Release/target25 necesita justificación/decisión separada y no sirve como fallback del mismo paquete en21. Continuidad íntegra21 es obligatoria ante incompatibilidad no resuelta. El rollback puede usar un baseline21 distinto, identificado y verificado previamente.

No se justifican patrones GoF, nuevos servicios o cambios de boundaries por el delta JVM. Conservación de dominio puro, aplicación sin infraestructura, DTOs generados HTTP y entidades JPA separados, adapters técnicos en infraestructura: consistente con Master L44 y arquitectura L333/337. No se introduce Factory/Strategy de JVM ni se reabre arquitectura enterprise.

## 5. Residuales y límites que no se convierten en aprobación

- **Compatibilidad completa pendiente:** proveedor/distribución/licencia/soporte/patches; pins Kotlin/Gradle/plugins/BOM/transitivos/procesadores/nativos/agentes; API/classfiles efectivos; imagen/digest/libc/CPU; JVM real de build/tests/generación/launcher, ECS y E2E. R1–R7/C1–C6 son obligaciones futuras, no resultados PASS. La matriz pendiente bloquea adopción, no el cierre documental de estos findings.
- Owner/SA deben resolver las seis decisiones de §7: proveedor, versiones, CPU, pins, dual o rollback distinto y entorno/rollout/observación. No se eligen por inferencia. Casos aplicables sin evidencia o bloqueados por externos siguen pendientes/bloqueados; un stub no cierra DR-05/G-CHAIN ni E2E real.
- **Java21 baseline; Java25 candidato aprobado para revisión; Java26 local sólo Generator G-OAS.** React/transporte Vercel no cambian sus runtimes por esta revisión. El rango Boot4.1.1 Java17–26 es framework-level only.
- Este dictamen **no** es Human Plan Approval, G-HUMAN-CONTRACT, Spec Validator `ready`, aprobación del plan contractual, cierre G-SA global o de ningún gate, ni permiso de implementación/despliegue/runtime. No invalida/amplía la firma histórica2026-10-03. No autoriza actualizar canónicos/README/arquitectura/contratos/gates/shared/pack.
- Siguiente paso permitido: comunicar este dictamen; solicitar refresh focalizado al owner `context-curator` antes de reutilizar pack #29 como índice vigente y obtener autorización humana explícita antes de sincronizar fuentes. Continuar después el proceso de evidencia/Validator/humano aplicable; no handoff de implementación. **No se invocó curator ni se editó pack/shared aquí.**
- **Única escritura de esta operación:** reemplazo de este informe independiente. Propuesta y todas las demás fuentes permanecen sin intervención de esta sesión. Verificación de persistencia por lectura; no build/tests/scan/Git, no estado limpio/hash/freeze/PASS técnico atribuidos. La nueva escritura activa `refresh_when` y exige revisar cobertura del scan final cuando corresponda, sin ejecutarlo ni cerrarlo ahora.
