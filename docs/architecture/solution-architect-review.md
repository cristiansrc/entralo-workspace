# Entralo V1 — Revisión independiente del Solution Architect (snapshot 2026-10-01)

- **Autor/firma:** `solution-architect` (modelo `github-copilot/claude-sonnet-5.5`), revisión propia e independiente. No firma, reconstruye ni hereda ningún informe SA anterior (no localizable, ver §8).
- **Fecha:** 2026-10-01. **Tipo:** revisión documental de arquitectura, sin runtime, sin código, sin Git.
- **Estado de este informe:** `emitido`; **Lifecycle status del seguimiento:** `draft`. Opinión SA y findings §§1…8 son **snapshot previo a correcciones SAR**, preservados sin nueva firma/aval atribuidos; disposición Planner §9 añadida2026-10-01. **No es veredicto de Spec Validator, no es `ready`, Human Plan Approval ni Gate1.** Arquitectura draft/ADRs proposed/brief planning-revision-needed.
- **Opinión SA:** `apto para revisión del Spec Validator, con 14 findings abiertos (0 bloqueantes para esa revisión, 2 mayores a resolver antes de presentar el plan al usuario)`. **No se recomienda Gate 1, handoff, descomposición ni ejecución.**

> **Actualización vigente del SA (2026-10-01, post informe CA04, remediaciones SAR y decisión A): ver §10.** Las secciones §§1–8 siguen siendo el snapshot histórico previo a las correcciones SAR (no se reescriben); §9 es disposición del Planner (no aval SA). El estado actual de cada finding, según evidencia en disco, está en §10.

## 1. Alcance y evidencia de lectura

Ruta base `/mnt/data/Shares/Projects/entralo-workspace/`. Leído completo en esta sesión (conteo de líneas verificado contra el pack/shared, coincide):

| Artefacto | Líneas | Nota |
|---|---|---|
| `docs/specs/requirements/entralo-v1-requirements-brief.md` | 251 **(snapshot histórico pre-correcciones SAR — no es el conteo vigente: hoy 254, ver §10)** | `planning`/`revision-needed` (L3); `verdict: invalidated` histórico (L245–L251) |
| `docs/architecture/architecture-proposal.md` | 430 | §§5.2, 7.1, 7.2, 9, 10, 11, 11.1, 12, 16 leídas con detalle |
| `docs/architecture/integration-map.md` | 323 | I-01–I-28, §§2.2, 2.3, 3, 4, 4.1–4.3, 5.0, 5.1, 6, 7 |
| `docs/architecture/system-landscape.md` | 266 | |
| `docs/architecture/context-map.md` | 121 | |
| `docs/architecture/workspace-mapping.md` | 24 | |
| `docs/architecture/decision-summary.md` | 20 | |
| `docs/architecture/architecture-review-request.md` | 87 | |
| `docs/architecture/decision-records/ADR-001…ADR-006` | 35/34/53/60/27/35 | los seis |
| `docs/specs/.working/entralo-architecture-sdd-context.md` (shared) | 123 | contexto activo único |
| `docs/specs/.working/entralo-architecture-planning-context.md` (pack refresh5) | 205 | índice no normativo |

**No leído / fuera de alcance:** `entralo-architecture-global-validation-report.md` (no estaba en el listado solicitado; sólo vi líneas incidentales en una búsqueda y no las uso como insumo), `closure-proposal`, `discussion`, `pack-fiscal`, designs, `estilo/`. Los veredictos del Spec Validator que aparecen en este informe están **citados del shared/pack, no verificados por mí**.

**Criterios aplicados:** `design-patterns-standard` (patrón sólo con variabilidad real, dominio puro, sin sobreingeniería), hexagonal (adapters/ACL en infraestructura), D-AUTH-01/H-A/D-UNKNOWN-01/D-TIME-01/Cognito+BFF/seis servicios/Java 21 como **restricciones no reabribles**. Verifiqué también la aritmética declarada: 200 res/s×300 s=60.000; 400×60+200×240=72.000; ×1,30=93.600; 120.000/300 s=400 rps; 20+30+5=55 min; SNS 3+2+10+100.000=100.015 intentos (~23 d); 3 MB en base64=4 MB; blockchain T15+31=46 min. Todas coinciden.

**Límites declarados:** nada se probó en runtime; no hay cuenta AWS/Vercel/MP verificada; las fuentes oficiales citadas en el plan son las que el Planner reporta (no las reconsulté en esta ronda, salvo razonamiento propio indicado como tal).

## 2. Resumen ejecutivo

El conjunto es **coherente en lo esencial**: un writer por dato, saga persistida en Purchases, outbox/inbox, sin ACID distribuido, patrones moderados (Adapter/ACL, Command no sensible, process manager no-GoF, State sólo por transiciones explícitas), y el gate de aprobación humana está bien separado. La corrección F-E (reloj único Purchases para aceptar y liberar) es técnicamente sólida y elimina la comparación entre relojes de hosts distintos.

Hay tres tipos de debilidad real:

1. **Un delta de interpretación funcional** que el Planner declara inexistente y que yo considero que el Validator debe juzgar: la frontera «confirmación antes del deadline» pasa a medirse en el CAS de Purchases, no en la respuesta de MP (SAR-01).
2. **Una excepción de ingreso grande y poco justificada** (stream de evidencia fiscal 4–25 MB por ALB expuesto) que contradice la postura «ALB interno / ingreso único» y añade superficie para un flujo staff de volumen mínimo (SAR-02).
3. **Complejidad acumulada** (cuatro esquemas de firma/grant propios + verificación SNS con descarga de certificado) y huecos de capacidad/abuso (multi-cuenta, dependencia periódica de Identity, KMS/STS) (SAR-04…SAR-06).

Nada de lo anterior obliga a reabrir decisiones del usuario.

## 3. Resultado por área solicitada

| Área | Resultado SA | Findings |
|---|---|---|
| H-A pago aprobado y reloj CAS (§5.2) | Diseño sólido; mismo reloj BD Purchases para aceptar (`accepted_at<deadline`) y liberar (`now>=deadline`) cierra el hueco por complementariedad. Falta explicitar latencia efectiva de la frontera y un detalle de implementación de reloj. | SAR-01, SAR-08, SAR-09 |
| UNKNOWN 5 min / polling / retries | Calendario `+0…+300 s`, máx. 2 consultas en vuelo, slot+300 sólo concilia, deadline no depende de red: coherente en brief, integration §3.1 y ADR-004. Ambigüedad en el modelo de «intento» de emisión asíncrona y lease vs objetivo 15 s. | SAR-03, SAR-09 |
| D-AUTH-01 pre-reserva | Correctamente propagado (AUTH-01–06, ADR1/3). Riesgos de abuso multi-cuenta y de dependencia periódica de Identity en el camino de reserva. | SAR-04, SAR-05 |
| Gateway/BFF/Vercel/SES | REST+WAF+IAM, doble salto y transporte Vercel firmado son defendibles y están bien acotados. SNS→SQS para SES está bien; la verificación de firma SNS es redundante en parte. | SAR-05, SAR-06, SAR-12 |
| SQS | Standard+outbox/inbox+DLQ por destino correcto; `visibility 60 s` uniforme es inadecuado para la cola crítica de deadline. | SAR-07 |
| WAF | Matriz ruta→canal→owner, COUNT antes de BLOCK, 1,30× headroom: correcto y aritméticamente consistente. Sin objeción. | — (obs. §4) |
| RDS compartida | Decisión honesta (blast radius declarado, triggers, aislamiento antes de go-live si falla carga). Sin objeción de fondo; cifras de conexiones pendientes de bootstrap. | SAR-05 (cuotas) |
| S3 / CloudFront / documentos | Imágenes (presign+quarantine+OAC) correcto. Stream fiscal grande: sobre-ingeniería e inconsistencia de ingreso. | SAR-02, SAR-12 |
| Blockchain / gates de seguridad de prueba | Obligación durable, pending hasta finalidad, P-03 bloqueado: correcto. Falta fijar qué metadata puede salir por la verificación pública antes del gate. | SAR-10 |
| Factura externa | PDF NO fiscal + gestión manual externa + estados R-09 respetan el brief. Evidencia fiscal grande es el único punto de fricción. | SAR-02 |
| CI/CD | Digest inmutable, OIDC con roles separados, Flyway con lock, expand/contract: correcto. Faltan controles menores. | SAR-12 |

## 4. Observaciones favorables (sin acción)

- **WAF I-1:** distingue ventana 300 s, perfil de reserva aislado (93.600) del agregado de familia (120.000 semilla COUNT) y evita presentar 400 rps de burst como capacidad total. Correcto.
- **Release vs aceptación (F-E):** `accepted_at<deadline` y `now>=deadline` son complementarios sobre el mismo reloj y la misma guarda; no existe franja donde ambos fallen o ambos pasen.
- **Patrones:** no hay Abstract Factory/Strategy fiscal anticipados; process manager en Purchases como saga explícita es la opción pragmática. Acuerdo con mantener `OrderBuilder`/`PaymentStrategy`-style sólo si aparece variabilidad real (hoy no).
- **Fronteras:** ningún FK/join remoto; DB lógicas por owner; token MP sólo en memoria de Payments; claros los límites de Purchases por módulos.
- **Gate humano:** el texto de `## Human Plan Approval: approved_by_user` como único gate está correctamente definido y no se da por cumplido.

## 5. Findings

Escala: **Mayor** = debe resolverse o decidirse explícitamente antes de presentar el plan al usuario; **Menor** = corregir en spec SDD/bootstrap o en documentos; **Obs** = sugerencia. «Responsable» = quién actúa; el cierre sólo lo certifica Spec Validator (SA no autocierra).

### SAR-01 — La frontera de aceptación F-E estrecha en la práctica el criterio CA-03/CA-04 del brief
- **Tipo:** conformidad de spec / interpretación funcional. **Severidad:** Mayor. **Responsable:** Planner (texto de arquitectura) → Spec Validator (juicio de conformidad); usuario sólo si el Validator concluye que cambia el resultado funcional.
- **Evidencia:** brief CA-04 (L149) exige «respuesta +299.999 s admisible acepta, +300 s no» y CA-03 (L148) «consulta confirma approval=cutoff−1 ms antes del deadline → VENDIDA». Propuesta §5.2.3–4 (L177–L178) define que sólo el CAS de Purchases con `accepted_at<reconciliation_deadline` acepta; el hecho debe estar antes comprometido y firmado en Payments y entregado (outbox p95≤5 s, SQS, I-28 con 3 s/1 retry). El pipeline consulta MP → commit Payments → firma → entrega → CAS no cabe en 1 ms.
- **Impacto:** la frontera comercial efectiva es `deadline − latencia(pipeline)`, no `deadline`. Un pago cuya respuesta de MP llega en `deadline−1 ms` (válido por brief) acaba en refund R-04 bajo F-E. La diferencia es de segundos, pero cambia un caso límite que el brief declara verificable, y el resultado para el comprador (compra vs refund) es observable.
- **Recomendación:** (a) el Planner documenta en la propuesta el efecto («aceptación = decisión durable en Purchases; latencia de pipeline reduce la ventana efectiva») y propone reescribir M1-AC y el caso CA-04 en términos medibles de F-E sin tocar el brief; (b) el Spec Validator decide si es interpretación técnica o delta funcional; sólo en el segundo caso se pide **una** confirmación al usuario, sin reabrir H-A/UNKNOWN. Mitigación técnica opcional: ajustar los slots de polling para que el último slot útil sea anterior al deadline con margen (hoy `+240` y `+300`), y priorizar I-28/I-08 en la última ventana.
- **Alternativa descartada por el SA:** compensar con un margen de tolerancia en el CAS (`accepted_at<deadline+ε`): viola «sin renovación/sin tolerancia».

### SAR-02 — Stream de evidencia fiscal 4–25 MB por ALB expuesto: inconsistencia de ingreso y sobreingeniería
- **Tipo:** seguridad / complejidad / consistencia. **Severidad:** Mayor. **Responsable:** Planner; decisión final humana (el propio plan lo marca «no aprobado por usuario»).
- **Evidencia:** §9 (L279) y I-17 (L44) crean un endpoint documental Purchases «WAF→ALB→worker», con grant header-only 60 s, revalidación de permiso cada ≤5 s, bulkhead 10 transferencias, stream de 60 s, finalize idempotente y limpieza. Contradice P1 (L60: integración privada VPC Link→ALB interno), §11 (L299: «ALB interno… no IP pública de servicio») y la postura «único camino de APIs» (H-B). El diagrama C4 (L114) lo muestra pero el inventario de red de §11 no incluye un ALB/ingreso público ni su coste.
- **Impacto:** nueva superficie pública fuera de Gateway para un flujo staff de volumen mínimo (registro de evidencia de factura manual externa, R-09), con protocolo propio de capacidad. El rango 4–25 MB es una hipótesis: una factura DIAN/representación gráfica suele ser mucho menor; no hay evidencia de que >3 MB ocurra.
- **Recomendación (pragmática):** (1) fijar V1 en ≤3 MB vía BFF (ya diseñado) para evidencia fiscal; >3 MB → registro por referencia externa verificada, que ya es el camino previsto para >25 MB; **o** (2) si se exige subir archivos mayores, reutilizar el patrón ya aprobado de imágenes (presign PUT/POST a quarantine con AV, TTL 5 min, rol staff con permiso Identity actual) en vez de un servidor de streaming propio. Mantener el stream como opción sólo con ADR que cuantifique archivos reales y justifique la superficie. Si se mantiene, añadir el ingreso (ALB/WAF/CloudFront-VPC-origin) al inventario de red, coste y diagrama de trust boundaries.

### SAR-03 — Modelo de «intento» de emisión asíncrona vs timeout de 10 s
- **Tipo:** diseño / ambigüedad. **Severidad:** Menor. **Responsable:** Planner (SDD).
- **Evidencia:** integration §3.1 (L143) y §4.2 (L192) fijan «timeout 10 s por intento»; la emisión es un comando SQS con resultado por otra cola (I-10→I-12) y el SLO P (L295–L296) pone la emisión sana en p95≤30 s.
- **Impacto:** un intento sano con latencia 10–30 s se clasificaría `UNCERTAIN` (timeout), lanzando conciliación innecesaria; no hay forma única de contar «intento» (¿envío del comando? ¿ACK del consumidor? ¿resultado?) y el contador `(issuance_id,attempt_number)` depende de ello.
- **Recomendación:** definir en SDD qué evento inicia y cierra un intento (p. ej. intento = dispatch del comando; timeout 10 s = espera de ACK técnico del consumidor, no del resultado; resultado se espera hasta conciliación). Alinear SLO y timeout; evitar que `UNCERTAIN` sea el camino normal.

### SAR-04 — El límite 8 por `userId` es el único control de acaparamiento y es esquivable con multi-cuenta
- **Tipo:** seguridad / abuso. **Severidad:** Menor (no reabre D-AUTH-01). **Responsable:** Planner (controles) + seguridad/plataforma.
- **Evidencia:** D-AUTH-01 hace del `userId` el ámbito del límite (brief R-02, §9). El diseño de abuso (propuesta §7.2, L251) limita ritmo por `(userId,event)` y por IP en Vercel; el alta de cuenta sólo exige email verificado. No hay control anti-automatización de registro ni de acaparamiento multi-cuenta.
- **Impacto:** un actor con N cuentas retiene N×8 boletas durante TTL20+grace30(+5) = hasta 55 min por reserva, repetible; degrada disponibilidad en eventos calientes y consume cuota Cognito/SES.
- **Recomendación:** añadir al diseño (sin cambiar negocio): protección de signup/login (WAF Bot Control/CAPTCHA o verificación escalonada), límite de altas por IP/dispositivo/dominio de correo, señal `reservation_account_cluster_*` (cuentas que comparten egress/tarjeta/dispositivo) y alerta operativa. Sólo si se quiere un límite adicional por tarjeta/identidad real sería decisión de negocio (no se propone aquí).

### SAR-05 — Dependencias periódicas del camino de reserva no presupuestadas: Identity, KMS, STS, DynamoDB
- **Tipo:** capacidad / disponibilidad. **Severidad:** Menor. **Responsable:** Planner → plataforma (bootstrap).
- **Evidencia:** §7.1 (L235): `mapping_valid_until=identity_read_started_at+60 s`, mint/caché no renuevan; sólo una nueva lectura ACTIVE de Identity renueva. Cada sesión activa implica ≥1 lectura de Identity por minuto y la aserción puede vencer mientras la mutación ya está en vuelo (budget 3–5 s). El perfil H-C (integration L305) y la matriz de cuotas (§7.1, L239) incluyen Cognito/SES/Gateway pero no Identity, KMS (Sign por mint), STS (credenciales Vercel/BFF) ni DynamoDB; SLO de reserva (99,9 %) no compone la disponibilidad de Identity.
- **Impacto:** con ~10.000 cuentas activas el orden de magnitud son cientos de lecturas/mint por segundo hacia Identity/KMS; una caída de Identity ≥60 s bloquea nuevos holds aunque Purchases esté sano (fail-closed, correcto pero no declarado en SLO). Rechazos espurios cerca del segundo 59.
- **Recomendación:** (1) el BFF renueva proactivamente con margen (p. ej. cuando queden ≤½ de la frescura o ≤ budget de la petición); (2) incluir Identity, KMS Sign, STS y DynamoDB en el inventario de cuotas y en el perfil de carga H-C; (3) declarar Identity como dependencia del SLO de reserva y definir su degradación (qué se sirve sin Identity: lectura pública sí, hold no).

### SAR-06 — Proliferación de protocolos de firma/grant y verificación SNS redundante
- **Tipo:** diseño / sobreingeniería (`design-patterns-standard`). **Severidad:** Menor. **Responsable:** Planner.
- **Evidencia:** cuatro mecanismos independientes: `CanonicalPaymentFactV1` firmado KMS/JWKS (L176), aserción de principal BFF (L235), grant de admisión staff firmado (integration L270) y grant de transferencia fiscal (L279), más verificación de firma SNS v2 con descarga/validación de certificado (integration L107). La cola SES ya restringe el emisor por política (`SendMessage` sólo del `TopicArn` y cuenta exactos, L107), y la entrega a SQS es autenticada por IAM.
- **Impacto:** cuatro runbooks de claves/rotación/JWKS, superficie SSRF por descarga de certificados, coste/latencia de KMS y más puntos de fallo. El valor marginal de firmar hechos entre servicios del mismo dominio de confianza (IAM+TLS ya exigidos) es defensa en profundidad, no necesidad demostrada.
- **Recomendación:** (1) un único perfil de token interno (p. ej. JWS ES256 con claves KMS y un runbook común) para aserción/grants, o justificar por escrito cada uno; (2) valorar si `CanonicalPaymentFactV1` necesita firma o basta contrato + IAM por cola + `evidence_id` verificable por consulta I-28 (decisión del Planner, mantiene el mismo reloj Purchases); (3) para SES, usar el validador oficial del SDK de AWS o apoyarse en la política de cola y descartar descarga propia de certificado; mantener dedup y DLQs.

### SAR-07 — `visibility 60 s`/`maxReceiveCount 5` uniformes sobre `purchases-payment-results`
- **Tipo:** diseño de mensajería. **Severidad:** Menor. **Responsable:** Planner (SDD) / plataforma.
- **Evidencia:** política P única (propuesta §6, L210): visibility 60 s, 5 recepciones, long poll 20 s. La ventana de decisión de pago es 300 s (deadline). I-28 mitiga con recuperación proactiva (3 s/1 retry).
- **Impacto:** un fallo transitorio en la primera recepción retrasa el reintento 60 s; cinco fallos (≈5 min) envían el hecho a DLQ ya fuera de ventana. I-28 cubre pero depende de su propio timer.
- **Recomendación:** colas críticas de deadline (`purchases-payment-results`) con visibility corta (p. ej. 15–20 s, handler ≤5 s) o `ChangeMessageVisibility` en error recuperable, y alarma de edad de mensaje específica; documentar que I-28 es el respaldo, no el camino primario.

### SAR-08 — Guía de implementación del reloj del CAS (PostgreSQL)
- **Tipo:** guía de spec. **Severidad:** Obs. **Responsable:** Planner (SDD) / backend Purchases.
- **Evidencia:** §5.2.3 exige «una lectura del reloj actual BD, no hora de inicio de tx». En PostgreSQL `now()`/`transaction_timestamp()` devuelven el inicio de la transacción; la lectura correcta es de reloj real (`clock_timestamp()`) dentro de la sentencia final.
- **Recomendación:** fijarlo como criterio de la spec y como caso de prueba M1-AC04 (tx iniciada antes del deadline, lock obtenido después). Confirmar el comportamiento de reevaluación de predicados volátiles tras espera de lock con el pin real de PostgreSQL (HC-09).

### SAR-09 — Lease de 30 s vs objetivo de liberación de 15 s; comparación de reloj proveedor
- **Tipo:** consistencia. **Severidad:** Menor. **Responsable:** Planner.
- **Evidencia:** propuesta §6 (L210) y integration §3.2 (L159) usan lease 30 s con fencing; integration L179 fija «liberador cada 1 s» y objetivo técnico de 15 s (incumplir = overdue). Además `payment_approved_at<grace_end_at` compara un instante del proveedor (MP) contra un reloj Purchases; el diseño evita tolerancias pero no documenta precisión/zona esperadas de MP.
- **Impacto:** si el worker que posee el lease cae, la liberación puede tardar ≥30 s (>15 s objetivo); la cota de error entre reloj MP y UTC Purchases no está medida.
- **Recomendación:** liberador con ≥2 réplicas que compiten por CAS/fence (no depender del lease completo), o lease ≤10 s para ese job; verificar en DR-05 formato/precisión/zona del timestamp MP y medir deriva proveedor vs NTP/Amazon Time Sync; mantener «incierto → UNKNOWN, nunca fallback local».

### SAR-10 — Alcance de la respuesta pública de verificación antes del gate P-03
- **Tipo:** seguridad / gate. **Severidad:** Menor. **Responsable:** Planner + seguridad/producto (gate).
- **Evidencia:** I-25 devuelve «proof_status/proof_as_of» y I-16 transporta `batch_id`, referencias y «metadata de confirmación permitida»; P-03 bloquea hoja/hash/proof públicos hasta threat model (brief §13.D; propuesta §10).
- **Impacto:** si «metadata permitida» incluye `batch_id`, tx o timestamps finos, se adelanta la exposición que el gate bloquea y se abre correlación/enumeración.
- **Recomendación:** fijar en la spec que, hasta el gate, la respuesta pública sólo incluye `proof_status` + `proof_as_of` redondeado y el estado operativo; sin batch/tx/hash. Asignar responsable y alcance mínimo del threat model (enumeración, correlación temporal, uniformidad de respuesta/tiempos) con fecha previa a cualquier endpoint de proof.

### SAR-11 — Higiene documental y estado contradictorio entre artefactos
- **Tipo:** consistencia documental. **Severidad:** Menor. **Responsable:** Planner (artefactos propios); context-curator (pack).
- **Evidencia:** (a) integration L54–L56: la fila I-28 queda separada de la tabla por una línea en blanco y se renderiza como párrafo. (b) Siguen diciendo «pack/shared stale»: review L44, decision-summary L20, propuesta L428, landscape L242, brief L243, mientras shared y pack declaran refresh 5 `cleared`. (c) La propuesta (L412, L416) y el review-request (L42) hablan de «review SA pendiente»; este informe pasa a ser el snapshot vigente. (d) El shared y la propuesta conviven con el estado «PASS selectivo reportado» sin archivo de dictamen en disco (procedencia sólo de instrucción de ronda).
- **Recomendación:** corregir (a); actualizar (b)/(c) cuando el Validator emita su dictamen, citando este informe como existente; mantener el PASS selectivo etiquetado como «reportado, sin dictamen persistido».

### SAR-12 — Controles menores de entrega y de capacidad
- **Tipo:** CI/CD y bootstrap. **Severidad:** Obs. **Responsable:** plataforma/Planner (SDD bootstrap).
- **Recomendaciones:** (1) análisis estático de IaC en el pipeline Terraform (p. ej. tfsec/checkov equivalentes) y política de revisión del plan; (2) tests de contrato entre repos (esquemas de evento generados y versionados, comprobación de compatibilidad al promover digest) ya que no hay librería de dominio compartida; (3) para uploads de imagen, preferir presigned POST con condición `content-length-range` (o PUT con `Content-Length` firmado) para imponer 10 MiB en origen, verificándolo en bootstrap; (4) calcular `max_connections`/pools por owner antes de bootstrap y evaluar RDS Proxy sólo si los pools superan el presupuesto 70 % (hoy no demostrado); (5) pin y prueba de interoperabilidad del generador OpenAPI con Spring Boot 4/Jackson 3 como bloqueante de bootstrap, no de plan.

### SAR-13 — Incertidumbre de emisión sin cota de tiempo hacia intervención manual
- **Tipo:** operación. **Severidad:** Menor. **Responsable:** Planner.
- **Evidencia:** integration §4.2 (L195–L196): `UNCERTAIN` conciliado «antes de retry o refund», con Ticketing caído `COMPENSATION_PENDING_GUARD` persiste con alerta/incidente 24 h.
- **Impacto:** un comprador puede quedar pagado, sin boletas y sin refund durante horas; el diseño es correcto (no false refund) pero sin tiempo máximo de escalamiento a operación ni mensaje al usuario definido para ese estado.
- **Recomendación:** definir en SDD un umbral de escalamiento (p. ej. alerta de guardia y aviso al comprador al cruzar X minutos) sin cambiar la regla de «no refund sin prueba».

### SAR-14 — Evidencia/proceso pendientes: secret scan no ejecutado
- **Tipo:** proceso / seguridad de artefactos. **Severidad:** Menor (bloquea cierre de revisión, no su lectura). **Responsable:** orquestador/plataforma.
- **Evidencia:** Gitleaks no disponible para este agente; sin shell. **Scan pendiente.** No afirmo instalado, ausente, pass ni «sin secretos». Mi lectura manual de los artefactos no sustituye un scan. No observé valores de credenciales en los textos leídos, pero eso **no es** resultado de scan.
- **Recomendación:** ejecutar Gitleaks sobre el filesystem del workspace (sin Git) con salida redactada antes de cualquier cierre o handoff.

## 6. Disposición de puntos conocidos (informativa; el cierre lo emite Spec Validator)

| Punto | Opinión SA sobre el snapshot actual |
|---|---|
| F-A (exp ≤ fin de frescura 60 s, mint a 59 s) | Diseño correcto; ver SAR-05 sobre renovación proactiva y presupuesto |
| F-B (SES→SNS→SQS) | Correcto como excepción acotada; ver SAR-06 (verificación SNS) |
| F-C (posters públicos approved vía CloudFront OAC; privado sólo si hay restricción) | Sin objeción; Catalog signer sólo en rama privada |
| F-D (límites de bytes) | Aritmética correcta (3 MB→4 MB base64, 4,5 MB Vercel); stream fiscal grande: SAR-02 |
| F-E (reloj único Purchases) | Sólido técnicamente; ver SAR-01, SAR-08, SAR-09 |
| F-G…F-L (remediaciones mecánicas) | Revisé coherencia de texto en proposal/integration/ADRs/landscape: sin contradicción mecánica nueva salvo SAR-11 |
| M-1/M-2/I-1/I-2/I-3 | M-1 → F-E (SAR-01); M-2 → §7.1 (SAR-05); I-1 → §7.2 sin objeción; I-2 → §11.1 sin objeción (SAR-12.4); I-3 → §9 (SAR-02, SAR-12.3) |
| M-3 histórico | **No localizable.** No lo equiparo a integration §4.1 ni a I-28. El riesgo de reloj/I-28 queda cubierto por esta revisión propia (SAR-01, SAR-08, SAR-09) |
| H-B / H-C | H-B: ver SAR-02 (excepción fiscal) y SAR-04; H-C: advisory transaccional + `close_requested` durable es razonable; la ausencia de fairness está declarada; `HC-09` depende de verificar `transaction_timeout` en el pin RDS |
| Prerrequisitos §16 | Sin objeción; añadir Identity/KMS/STS/DynamoDB a la matriz de cuotas (SAR-05) |

## 7. Conclusión y recomendación de ruta

1. **Recomendado:** enviar el conjunto actual al **Spec Validator** para la revalidación global (incluido el brief completo), señalándole SAR-01 como foco de conformidad R/CA↔F-E.
2. **No recomendado:** Gate 1, `## Human Plan Approval`, handoff a Task Decomposer/Executor, creación de OpenAPI/DDL/código. Siguen vigentes: arquitectura `draft`, ADRs `proposed`, brief `planning`/`revision-needed`, plan sin aprobación humana.
3. **Antes de presentar el plan al usuario** (tras el dictamen del Validator): resolver o decidir explícitamente SAR-01 y SAR-02. SAR-03…SAR-13 pueden pasar a spec SDD/bootstrap con criterios de aceptación.
4. **Patrones:** conservar los propuestos (Adapter/ACL, Command no sensible, process manager Purchases, State por transiciones explícitas). Evitar añadir patrones GoF nuevos hasta que exista variabilidad real; reducir la proliferación de protocolos de firma (SAR-06).
5. **Sin reabrir:** H-A, D-UNKNOWN-01, D-TIME-01, D-AUTH-01, Cognito+BFF, seis servicios, Java 21, TTL/gracia, refund/SUPPORT, fiscal externo.

## 8. Procedencia, límites y bloqueos

- Este informe es propio y se basa únicamente en los archivos listados en §1. No reconstruye ni atribuye texto a la revisión SA anterior (no localizable; consistente con review-request §F-J y shared).
- No ejecuté builds, tests, render, carga, Git ni escrituras fuera de este archivo. No consulté fuentes externas en esta ronda; las afirmaciones sobre PostgreSQL (SAR-08) son criterio técnico propio a confirmar en la spec con el pin real.
- **Blocked: secret scan execution unavailable** — Gitleaks no disponible; **scan pendiente**; sin resultado de scan.
- Veredictos de Spec Validator mencionados provienen del shared/pack y no fueron verificados aquí. No hay dictamen selectivo F-G…F-L en disco que yo pueda confirmar.

---
Firmado: `solution-architect` — 2026-10-01 — revisión documental independiente; no constituye aprobación del plan ni veredicto de Spec Validator.

## 9. Disposición posterior del Planner — 2026-10-01 (no dictamen ni firma SA)

**Autor exclusivamente Planner.** La firma/opinión/findings anteriores se conservan como snapshot independiente previo; sus líneas/counts/citas describen ese snapshot, no artefactos tras corrección. No se sustituye opinión SA «14 abiertos» por autocierre. Detalle/casos/alternativas/impacto persistidos en [review-request](architecture-review-request.md) y [propuesta §§5.2/7.1/9/17](architecture-proposal.md). Estados siguientes requieren revisión independiente; ningún finding auto-closed/ready.

| Finding | Disposición Planner / estado vigente del seguimiento |
|---|---|
| SAR-01 Mayor | **addressed-with-human-approved-delta-applied-awaiting-independent-review — seguimiento Planner, no aval SA.** D-SAR01-CA04 **«sí, dale la opción A»** (2026-10-01), aprobada/aplicada brief R03/R04/CA03/CA04/source trace y propuesta§5.2/I08/I28/ADR004/mapas/resumen/request. MP payment_approved_at<grace determina elegibilidad; evidencia durable reconciliada Purchases<deadline honra con accepted_at post-cutoff. Sin confirmación al deadline release; approval tras deadline o release sin decisión durable previa R-04/no reconsumo. Raw+299.999+delay2s sin reconciliación previa release/refund conforme brief actualizado. I08 postcommit IAM/SQS/I28 margen5s/reloj tras locks/CAS-stock conservados; host sello/epsilon/sharedDB descartados. M1-AC01…08 actualizados, no tests ejecutados ni reconocimiento funcional pendiente; TTL20/grace30/R07/UNKNOWN5m intactos |
| SAR-02 Mayor | **fixed-in-draft-awaiting-review**. R09 evidencia protegida/verificada requerida, upload4–25MB no requerido. Default referencia/CUFE/expediente externo protegido verificados; copia opcional<=3MB owner/BFF/body4MB, mayor no upload V1. Eliminar ALB público/stream/grant/presign fiscal, DOC-SAR02/I17/19. No delta negocio ni decisión humana adicional |
| SAR-03 | **fixed-in-draft-awaiting-review**. Timeout10s dispatch→resultado durable, ACK no ISSUED; slots absolutos1/5/25s/presupuesto nominal35s, no31min. UNCERTAIN consulta/no false refund; p95dispatch-result8s/venta-ISSUED30s separados/SAR03-AC |
| SAR-04 | **fixed-in-draft-awaiting-review**. Rates signup/login/challenge CAPTCHA risk-based/calibrar NAT/accesibilidad/alertas, no nuevo máximo cuentas ni identidad real/tarjeta |
| SAR-05 | **fixed-in-draft-awaiting-review**. Mapping proactive<=30s/budget+1s/no freshness reset, quotas Identity/KMS/STS/Dynamo/RDS/SQS más Cognito/SES/GW, budgets auth-reserva separados/30%headroom/deps disponibilidad y warm-cold tests |
| SAR-06 | **fixed-in-draft-awaiting-review**. Único token interno propio aserción BFF, quitar hecho/grants fiscal/admisión; SNS→SQS source policies/IAM/HTTPS/envelope/TopicArn/schema/dedup no fetch SigningCertURL; SNS HTTPS no elegido requeriría validador oficial/review |
| SAR-07 | **fixed-in-draft-awaiting-review**. payment-results30s/handler5s/ChangeVisibility5s tras rollback/heartbeat10s total10s, general60s; scheduler/directo/I28 independiente de receives/deadline |
| SAR-08 | **fixed-in-draft-awaiting-review**. Context7 PostgreSQL18 confirma clock_timestamp instantáneo vs now inicio tx; locks primero/sentencia nueva, no claim reevaluación volátil; tx predeadline/lock postdeadline test obligatorio/pin/enforcement HC09 |
| SAR-09 | **fixed-in-draft-awaiting-review**. críticos lease5s/fence/tick1s/dos réplicas/crash objetivo6s/15s ejecución sano no tolerancia; proveedor UTC/zona/precisión DR05/no deriva medida inventada, salud reloj BD no inferir host |
| SAR-10 | **fixed-in-draft-awaiting-review**. Pública allowlist estado/proof_status/proof_as_of minutoUTC/null/errorR06, sin batch/tx/hash/proof/finetime/metadata I16 pre-gate; threat model/acta seguridad-producto previa/negative serialization tests |
| SAR-11 | **fixed-in-draft-awaiting-review — seguimiento Planner**. Pack refresh6/incomplete leído; refresh7 ejecutado por context-curator (2026-10-01, `stale_status: cleared`), pack sin editar. I28 tabla/ref SA/shared actual; PASS selectivo histórico sin dictamen no ready; brief cambiado sólo para opción A aprobada, lifecycle intacto |
| SAR-12 | **fixed-in-draft-awaiting-review**. IaC Checkov/plan review, contract compatibility multi-repo/promote digest, image POST10MiB cap origen, aggregate pool70%/Proxy sólo evidencia, pin generatorBoot4Jackson3interop bloqueante bootstrap/casos exactos |
| SAR-13 | **fixed-in-draft-awaiting-review**. UNCERTAIN timer durable/alerta inmediata/reconciler5min/paging+aviso5min/escalado15min/major24h, dedup/retries aviso, no refund ciego ni4º intento/stock por tiempo |
| SAR-14 | **blocked**. Gitleaks no ejecutado sin herramienta shell/CLI/instalación no verificada. No pass/no-secrets ni sustitución por regex/lectura; ejecutar scan autorizado filesystem sin Git antes cierre |

**Ruta — exclusivamente Planner:** Spec Validator review con brief completo y **D-SAR01-CA04 aprobada/aplicada**; consulta formal SA sobre materialización F-E/I08/I28/accepted_at post-cutoff/margen/protocolos/patrones en request, sin delegación/aval nuevo inventados. Refresh curator ejecutado (refresh7, 2026-10-01, `stale_status: cleared`); scan pendiente, último global not ready. Arquitectura draft/ADR proposed/brief planning-revision-needed; aprobación humana **de decisión funcional** registrada, **de plan** ausente. Sólo ready vigente→awaiting-human-plan-approval/paquete único; no repreguntar opción A ni Gate1 ahora. No Task Decomposer/Executor/código/Git/tests ejecutados. Firma/opinión/§§1…8 anteriores preservados como snapshot independiente, §7 histórico no envío incondicional del conjunto corregido.

---

## 10. Revisión independiente ACTUALIZADA del Solution Architect — 2026-10-01 (post informe CA04, remediaciones SAR y decisión de usuario A)

- **Autor/firma:** `solution-architect` (`github-copilot/claude-sonnet-5.5`). Revisión propia sobre el artifact set releído en disco en esta sesión. **Documental: no se ejecutó runtime, build, tests, carga, Git ni código.** No es veredicto de Spec Validator, no es `ready`, no es Human Plan Approval ni Gate 1.
- **Relación con lo anterior:** §§1–8 (opinión y SAR-01…14 originales) son **histórico**; §9 es seguimiento del Planner sin aval SA. Lo que sigue (§10) es el **estado actual** según evidencia verificada hoy. Donde coincido con una disposición del Planner lo indico con evidencia; no heredo ninguna sin verificarla.
- **Decisión de usuario respetada:** D-SAR01-CA04 («sí, dale la opción A», 2026-10-01) es decisión de negocio ya tomada. Este informe verifica que se propaga bien; **no la cuestiona ni la reabre**. Tampoco constituye aprobación del plan.

### 10.1 Aclaración sobre el dictamen anterior

El dictamen SA anterior (§0 y §7) **no decía «no ready»**: decía «apto para revisión del Spec Validator, con 14 findings abiertos (2 mayores a resolver antes de presentar el plan al usuario)». El `not ready` vigente es del **Spec Validator** (`entralo-architecture-global-validation-report-2026-10-01-ca04.md`, L5/L79: V-01…V-08). Este §10 atiende V-03 de ese informe (re-review SA independiente de la materialización actual) desde el lado SA; el Planner debe registrarlo, y el cierre sigue siendo del Validator.

### 10.2 Alcance y evidencia de lectura (releído hoy)

| Artefacto | Líneas | Lectura |
|---|---|---|
| `docs/specs/requirements/entralo-v1-requirements-brief.md` | 254 | completo (R-01…12, CA, E-01…15, §§11–15) |
| `docs/architecture/architecture-proposal.md` | 448 | completo (§§1–17) |
| `docs/architecture/integration-map.md` | 323 | completo (I-01…28, §§2.1–2.3, 3, 4, 4.1–4.3, 5.0, 5.1, 6, 7, 8) |
| `docs/architecture/system-landscape.md` | 266 | completo |
| `docs/architecture/context-map.md` | 122 | completo |
| `docs/architecture/workspace-mapping.md` / `decision-summary.md` / `architecture-review-request.md` | 24 / 18 / 53 | completos |
| `docs/architecture/decision-records/ADR-001…006` | 35/34/55/54/27/35 | los seis, completos |
| `docs/specs/.working/entralo-architecture-sdd-context.md` (shared) | 121 | completo |
| `docs/specs/.working/entralo-architecture-global-validation-report-2026-10-01-ca04.md` | 79 | completo |
| Este informe (§§1–9 previos) | 206 | completo |

**No leído en profundidad:** pack `entralo-architecture-planning-context.md` (sólo grep dirigido; índice no normativo), informe global anterior `entralo-architecture-global-validation-report.md` (sólo grep dirigido), closure-proposal, discussion, designs. Los veredictos del Validator los cito, no los verifico más allá de lo indicado en §10.7.

**Aritmética recomprobada:** 200×300=60.000; 400×60+200×240=72.000; ×1,30=93.600; 120.000/300=400 rps; 10.000/30≈333,3→«334 lecturas/s»; emisión 25+10=35 s y secuencia +1→+11→+25; TTL20+gracia30+5 = 55 min; todas coinciden. Las fuentes externas (Context7/PostgreSQL 18, AWS) las cita el Planner de rondas previas; **no las reconsulté** hoy. Mi afirmación sobre `clock_timestamp()` vs `now()` es criterio técnico propio coincidente con lo citado, a confirmar con el pin real (HC-09).

### 10.3 Opinión actual

**No encuentro blocker arquitectónico real** en el conjunto actual: la materialización de D-SAR01-CA04 es coherente de extremo a extremo (brief → propuesta §5.2 → integration I-08/I-24/I-28 → ADR-004 → mapas), sin franja donde dos reglas contradictorias apliquen a la vez, y los SAR-02…13 corregidos son coherentes entre sí y con los seis ADRs. Los **blockers reales son de proceso, no de diseño** (ver §10.9). Quedan **8 residuales** (§10.8), ninguno obliga a reabrir decisiones del usuario ni a cambiar el diseño; uno es de severidad media (RES-01).

**Opinión:** el conjunto está **listo para ser re-validado por el Spec Validator** desde la perspectiva de arquitectura. Eso no implica plan aprobado, `ready`, Gate 1, handoff, descomposición ni ejecución; arquitectura sigue `draft`, ADRs `proposed`, brief `planning/revision-needed`.

### 10.4 Verificación de D-SAR01-CA04 (con evidencia)

| Condición | Evidencia verificada | Resultado |
|---|---|---|
| `payment_approved_at < grace_end_at` determina elegibilidad comercial | brief L11, L43 (R-03), L162; propuesta L9, L173, L176 (paso 2), L185; I-08 (integration L35); ADR-004 L18, L21 | Coherente; `approval ≥ grace` no es admisible y va a R-04 |
| Confirmación durable **reconciliada** antes de `reconciliation_deadline = grace_end_at+300 s` | brief L43/L44/L149/L150; propuesta L177 (paso 3: tras todos los locks, sentencia nueva con una lectura de `clock_timestamp()`, `accepted_at < deadline`); ADR-004 L23 | Coherente; respuesta MP cruda **no** equivale a reconciliación (brief L150; propuesta L177, L181 AC02/AC07) |
| `accepted_at` puede persistir post-cutoff | brief L43, L149, L162; propuesta L152, L177 («No condición accepted_at<grace_end_at»), L181 AC01; ADR-004 L23, L47; I-28 (integration L55) | Coherente; `purchased_at = payment_approved_at` (comercial), `accepted_at` sólo auditoría |
| Pagos no confirmados se liberan | brief L43/L44; propuesta L178 (paso 4); integration L177, L153; ADR-004 L24 | Coherente; release local sin MP/I-28/SQS, misma BD/guarda/reloj que la aceptación (complementarios, sin franja doble) |
| Late refunds | brief L44, L149 (R-04), E-07 (L121); integration L181 (UNKNOWN-04), L177; propuesta L155, L181 AC03/AC05/AC07 | Coherente; aprobación hallada tras deadline o tras LIBERADA sin decisión durable previa → R-04, cero reconsumo, `LIBERADA→VENDIDA` prohibido |
| Ventana sólo de conciliación, sin nuevos pagos ni extensión comercial; TTL20/grace30/UNKNOWN5m/R-07 intactos | brief L11, L43, L162, L172; propuesta L185; ADR-004 L18, L28 | Coherente |
| Casos de aceptación | propuesta L181 (M1-AC01…08), ADR-004 L47 (ADR4-AC2), integration L202 (F01-AC2), L321 (I-AC19), propuesta L370 (PLAN-03) | Cubren los 5 predicados; **ninguno ejecutado** (los textos lo declaran) |

**Observación:** la consecuencia visible al comprador (pago aprobado + pipeline retrasado → refund R-04, p. ej. «raw +299.999 s con retraso de 2 s») es la que el usuario aprobó en la opción A; no la trato como defecto. Véase RES-02 sólo para medición y comunicación.

### 10.5 Subfindings M-1/M-2, H-B/H-C, I-1/I-2/I-3

| Subfinding | Dónde se materializa | Resultado SA actual |
|---|---|---|
| **M-1** (reloj/frontera) | propuesta §5.2 (L171–L187), M1-AC01…08, SAR-08/09; integration §4.1 (L183–L188) | Coherente. Mismo reloj BD Purchases para aceptar y liberar; tras locks, sentencia nueva; sin tolerancia ni sello de host. Ver RES-01/RES-02 |
| **M-2** (identidad/cuotas) | propuesta §7.1 (L235–L251), M2-AC01–06; ADR-003 (L45–L53) | Coherente. Aserción ≤60 s con `exp` acotado a fin de frescura (sin 119 s); renovación proactiva; inventario de cuotas ampliado a Identity/KMS/STS/DynamoDB/RDS/SQS. Ver RES-05 |
| **H-B** (ingreso de APIs y bytes) | propuesta §7 (L229), §9 (L271–L291); I-17/I-19; ADR-002 L14–L16, ADR-003 L43, ADR-005 L16–L20; landscape C4 (L82–L85, L105) | Coherente. Sin ALB público ni stream fiscal 4–25 MB ni grant/presign fiscal en ningún artefacto como estado vigente; imágenes por presigned POST + cuarentena + CDN; documentos ≤3 MB/body ≤4 MB/Vercel 4,5 MB por dirección |
| **H-C** (cierre/advisory/fencing) | propuesta §1 (L27), §13; integration §5.0 (L220–L240), HC-01…09 | Coherente. `close_requested` durable + advisory transaccional + fencing, sin afirmar fairness; la adjudicación previa usa CAS de orden y no el gate. HC-09 (`transaction_timeout` en el pin RDS) sigue como bloqueo de readiness a verificar en bootstrap |
| **I-1** (WAF/Gateway/principal) | propuesta §7.2 (L253–L259); ADR-002 L12 | Coherente y aritméticamente correcta (60.000 / 72.000 / 93.600 / 400 rps promedio de familia). Semillas 120.000 y 10.000 sólo en COUNT |
| **I-2** (RDS compartida) | propuesta §11.1 (L317–L327); ADR-001 L33, ADR-006 L28–L30 | Coherente. Blast radius declarado; aislar **antes** de go-live si la carga mixta falla; sin ACID cross-DB |
| **I-3** (S3/CloudFront/documentos) | propuesta §9; ADR-002 L14, ADR-005 L18–L20 | Coherente. OAC, public approved sin PII, privado sólo por restricción con signer en Catalog; cap de imagen impuesto en origen (POST `content-length-range`) |

### 10.6 Estado actual de SAR-01…14 (sólo con evidencia)

«Conforme en diseño» = coherente y suficiente en los artefactos releídos hoy. **No** es cierre (lo emite el Spec Validator) ni evidencia runtime.

| SAR | Original | Estado actual (SA) | Evidencia |
|---|---|---|---|
| SAR-01 | Mayor | **Resuelto funcionalmente por decisión de usuario; conforme en diseño.** Sin objeción mayor. Residuales RES-01/02 | §10.4 |
| SAR-02 | Mayor | **Conforme en diseño.** La superficie fiscal grande fue eliminada; V1 = referencia/CUFE/localizador externo protegido verificado + copia opcional ≤3 MB | propuesta L287, L289; I-17 (integration L44), I-19 (L46); ADR-002 L16; ADR-005 L20; landscape L105 |
| SAR-03 | Menor | **Conforme en diseño.** Intento = dispatch→resultado durable/timeout 10 s; offsets absolutos +1/+5/+25 s; presupuesto nominal 35 s verificado. Residual RES-06 | propuesta L442; integration L143, L149, L192–L196; ADR-004 L32 |
| SAR-04 | Menor | **Conforme en diseño.** Anti-automatización sin nuevo máximo de cuentas ni identidad por tarjeta | propuesta L443; ADR-003 L53 |
| SAR-05 | Menor | **Conforme en diseño, con RES-05.** Renovación proactiva, inventario de dependencias, presupuestos separados | propuesta L249; ADR-003 L51 |
| SAR-06 | Menor | **Conforme en diseño.** Un único token interno (aserción BFF); firma del hecho, grant fiscal y grant de admisión retirados; SNS→SQS autenticado por políticas, sin descarga de certificado | propuesta L176, L251; integration L53, L107, L270; ADR-004 L42. Vestigio de texto: RES-03 |
| SAR-07 | Menor | **Conforme en diseño, con RES-01 (parte).** Visibilidad 30 s/handler 5 s/ChangeVisibility 5 s en la cola crítica; el SQS ya no es el timer de la frontera | propuesta L214; integration L158; ADR-002 L20 |
| SAR-08 | Obs | **Conforme en diseño.** `clock_timestamp()` en sentencia nueva tras locks; sin suponer reevaluación volátil; test M1-AC04 | propuesta L177, L181, L444; ADR-004 L23, L50 |
| SAR-09 | Menor | **Conforme en diseño.** Lease ≤5 s, tick 1 s, 2 réplicas, recuperación ≤6 s; precisión/zona del timestamp MP queda en DR-05 (externo) | propuesta L214, L444; integration L159 |
| SAR-10 | Menor | **Conforme en diseño.** Allowlist pública pre-gate (`operational_status`, `proof_status`, `proof_as_of` al minuto/null) | propuesta L303, L445; I-25 (integration L52); ADR-005 L12 |
| SAR-11 | Menor | **Parcialmente conforme.** I-28 ya es fila contigua de la tabla (integration L54–L55); la mayoría de referencias stale fue corregida; quedan vestigios (RES-03) | integration L54–L55; grep dirigido |
| SAR-12 | Obs | **Conforme en diseño.** Checkov/plan review, compat de contratos entre repos, cap en origen de imagen, pools ≤70 %, pin generator/Boot4/Jackson3 como bloqueante de bootstrap. Sin pipeline existente | propuesta L446; ADR-006 L32 |
| SAR-13 | Menor | **Conforme en diseño.** Timer durable desde el primer UNCERTAIN; aviso/paging 5 min, escalado 15 min, mayor 24 h; sin refund ciego ni 4º intento. Residual RES-06 | propuesta L447; ADR-004 L34 |
| SAR-14 | Menor/proceso | **BLOQUEADO — sin cambio.** Ver §10.7 | §10.7 |

### 10.7 Informe Validator CA04 (V-01…V-08) y Gitleaks

Verificación puntual por mí (no sustituye la re-validación del Validator):

| Finding | Estado verificado hoy |
|---|---|
| V-01 (workspace-mapping WM-04) | **Corregido en disco**: WM-04 (L24) dice «aprobada funcionalmente… propagada/aplicada al brief… pendiente revisión independiente» |
| V-02 (context-map CM-11) | **Corregido en disco**: CM-11 (L116) ya no dice «deltaCA04propuesto» |
| V-03 (re-review SA) | **Atendido por este §10**; falta registro/ruta del Planner |
| V-04 (brief «confirmación MP» vs reconciliación) | **Corregido**: brief L56, L71, L116 usan «evidencia canónica/durable reconciliada antes del deadline» |
| V-05 (refs «refresh curator pendiente») | **Mayormente corregido**; vestigio en landscape L17 («Pack refresh4… requiere actualización context-curator») → RES-03 |
| V-06 (fuente única de aprobación) | **Parcial**: brief L11/L172 corregidos; **persiste «ratificada por solicitud actual»** en propuesta L173 y ADR-004 L18 → RES-03 |
| V-07 / V-08 | Fuera de mi alcance / ver Gitleaks abajo |

**Gitleaks / correcciones de secret scan (SAR-14 / V-08):** no encuentro **ninguna evidencia en disco** de que Gitleaks se haya ejecutado: no hay reporte, SARIF ni configuración (`glob` de `*gitleaks*`/`*.sarif` sin resultados), y todos los artefactos que lo mencionan (propuesta L420/L436/L448; review-request L31/L53; decision-summary L16; shared L61/L106/L119; informe CA04 L61–L62) declaran de forma consistente **«Blocked: secret scan execution unavailable»**. No existen, por tanto, «correcciones Gitleaks» verificables. Además **este agente no dispone de shell ni de Gitleaks**: tampoco lo ejecuté. Como indicio no equivalente a un scan, un `grep` dirigido sobre `docs/**/*.md` (claves AWS `AKIA/ASIA`, cabeceras de clave privada, `ghp_`, `xox*`, tokens MP `APP_USR-/TEST-`, asignaciones `password|secret|token|api_key = "…"`) devolvió **cero coincidencias**. **No** afirmo «sin secretos», «pass» ni «instalado/ausente». SAR-14 sigue **blocked** hasta que el orquestador/plataforma ejecute Gitleaks sobre el filesystem (sin Git, salida redactada).

### 10.8 Findings actuales (residuales)

Escala: **Media** = resolver o decidir explícitamente en la spec SDD antes de ejecutar; **Baja/Obs** = corrección mecánica o criterio de aceptación. Ninguno es blocker de arquitectura.

- **RES-01 (Media) — Ola de deadline: recuperación I-28 de un solo barrido y carga no perfilada.** Evidencia: propuesta L183 («prioridad deadline−5s», «ledger recovery +295»), integration L55 (I-28: máx. 2 intentos en 3 s, prioridad deadline−5s), propuesta L214 (cola crítica: 5 recepciones con reintento a 5 s ⇒ un mensaje puede llegar a DLQ en ~25–30 s), integration L305 (perfil H-C: I-24 200/s, **sin I-08/I-28**). Impacto: tras una degradación breve de Purchases/Payments, los hechos atascados dependen de un único barrido a ≈deadline−5 s; con holds creados en ráfaga (200–400/s) sus `deadline` se concentran, de modo que el barrido puede concentrar cientos de llamadas I-28 con 3 s de presupuesto y sólo 5 s de margen. La consecuencia cae en el lado ya aprobado (refund R-04), pero erosiona la finalidad de la opción A. Recomendación (SDD, sin tocar negocio): (a) barrido I-28 periódico y acotado desde `grace_end_at` (no sólo en deadline−5 s) con jitter y prioridad por proximidad al deadline; (b) incluir en el perfil H-C la «ola de aprobaciones/recuperación» I-08/I-28 con la misma intensidad que I-24 y una métrica de colisión; (c) revisar `maxReceiveCount`/backoff de `purchases-payment-results` para no depender sólo del barrido; (d) aclarar que `heartbeat 10 s` con tope total de 10 s es no-op (propuesta L214).
- **RES-02 (Baja, consecuencia aceptada) — medición y visibilidad del efecto práctico de la opción A.** La ventana efectiva de aceptación = `deadline − latencia(pipeline)`; el diseño ya fija p95 ≤1 s/p99 ≤5 s con alarma `payment_predeadline_delivery_missed_total > 0` (propuesta L183). Pendiente en SDD: tablero de esa métrica y copy de aviso al comprador para el caso «aprobado y devuelto por R-04». Además, los polls MP útiles son +0…+240 y luego +300 (brief L150; integration L142): una aprobación MP con visibilidad retrasada >240 s y webhook perdido terminaría en R-04; DR-05 debe medir cuánto tarda en reflejarse `approved` en la consulta tras `approved_at`.
- **RES-03 (Baja, mecánico) — vestigios de remediación V-05/V-06 y SAR-06.** (i) propuesta L173 y ADR-004 L18: «ratificada por/en solicitud actual» (V-06 pidió fuente única literal). (ii) system-landscape L17: «Pack refresh4… requiere actualización context-curator» (stale; refresh7 ejecutado). (iii) system-landscape L142: Ticketing con «grants staff» contradice la eliminación del grant de admisión (SAR-06); debe decir «verificación de permiso Identity actual». Ruta: spec-remediator.
- **RES-04 (Baja) — «confirmación» sin definir.** integration L181 (UNKNOWN-03) y L236 (H2-04) usan «confirmation=deadline−1ms»; sin glosario podría leerse como respuesta MP. Fijar «reconciliación durable en Purchases» como único sentido.
- **RES-05 (Baja) — KMS «mint por request».** propuesta L249 asume una firma KMS por petición. La aserción es válida hasta `exp` (≤60 s) y ligada a audiencia/token; permitir reutilización por `(sesión, audiencia)` hasta `exp`/`jti` reduce el techo de cuota KMS Sign. Decisión de bootstrap con el inventario real de cuotas.
- **RES-06 (Baja) — ruido de UNCERTAIN.** Con timeout 10 s y p95 dispatch→resultado ≤8 s, una fracción no despreciable de intentos sanos puede caer en UNCERTAIN; «alerta inmediata» desde el primer UNCERTAIN (propuesta L447) debe definirse como métrica/ticket, reservando paging a los 5 min.
- **RES-07 (Obs) — dependencia síncrona bidireccional Payments↔Purchases.** I-24, I-08 e I-28 están separadas por fases y se declara que «CI prohíbe callbacks recursivos» (context-map L56), pero no hay criterio de test que lo haga cumplir. Añadir una prueba de contrato/traza (p. ej., I-08 no puede disparar I-28/I-24 en el mismo request) a los AC CM-07/PLAN-04.
- **RES-08 (Proceso) — SAR-14/secret scan.** Ver §10.7.

### 10.9 Blockers reales vs residuales

**Blockers de arquitectura/diseño: ninguno.**

**Blockers de proceso reales (previos a cualquier cierre/handoff; ninguno lo resuelvo yo):**
1. Re-validación global del Spec Validator pendiente (último global `not ready`); V-03 queda cubierto por este §10 pero el Planner debe registrarlo y cerrar RES-03 (V-05/V-06 parciales).
2. Gitleaks no ejecutado (SAR-14/V-08): sin scan no hay cierre ni handoff.
3. Aprobación humana **del plan** ausente (distinta de la decisión funcional A, ya aprobada). Esto es un gate, no un defecto.

**Residuales:** RES-01…RES-07, a resolver como criterios de la spec SDD/bootstrap salvo RES-03/RES-04 (corrección mecánica documental).

**Gates de go-live ya conocidos, no tocados aquí:** DR-05 (MP, precisión/zona de timestamp y visibilidad de `approved`), DR-07, gate público de proof P-03, región/cuenta/compliance, retención Q-N05, cadena productiva.

### 10.10 Límites y procedencia de este §10

- Revisión documental; **sin runtime, tests, builds, carga, Git, código ni scan**. «Conforme en diseño» no es resultado de prueba.
- No consulté fuentes externas en esta ronda; las del Planner no fueron reconsultadas.
- No edité artefactos del Planner (brief, propuesta, ADRs, mapas, shared): sólo este archivo (pointer al inicio y este §10). Las correcciones RES-03/RES-04 y el registro del re-review en shared/pack corresponden al Planner/spec-remediator/context-curator.
- No hay Human Plan Approval ni Gate 1; no recomiendo handoff, descomposición ni ejecución.

---
Firmado: `solution-architect` — 2026-10-01 — revisión documental independiente actualizada (§10); no constituye aprobación del plan ni veredicto de Spec Validator.
