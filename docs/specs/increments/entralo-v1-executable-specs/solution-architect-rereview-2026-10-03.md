# Nueva revisión independiente Solution Architect — 2026-10-03

- Rol/autor: `solution-architect` (agente, dictamen nuevo de diseño documental).
- Fecha: 2026-10-03; hora y snapshot criptográfico no disponibles.
- Incremento: `entralo-v1-executable-specs`; lifecycle: `planning`.
- Veredicto SA: **`approved`**.
- Spec Validator: **`verdict: none`**, sin modificación ni declaración de readiness.
- Mandato: `review-request.md`, sección «Nueva revisión SA por evidencia histórica no recuperada — 2026-10-03», líneas 77–89, y petición humana actual.

## 1. Naturaleza, alcance y precedencia

Esta es una revisión independiente de las fuentes actuales, no recuperación, reconstrucción ni ratificación de una respuesta histórica perdida. El fragmento aportado acredita invocaciones, no salidas sustantivas ni condiciones SA. No se atribuyen firmas o condiciones anteriores. `solution-architect-review.md` de 2026-10-02 permanece intacto con su `changes-required` histórico.

Alcance aprobado: disposición de **SA-F01…SA-F07 y SA-F10**, D-N1-01 y sus dependencias N2–N6; carrera aceptación/CAS/fence/release, CHANGE/CANCEL/supersession/ACK/reopen, refunds/identidades/ciclos/claims/guards/digests, ownership, DTO boundary y selección de patrones. Se cotejan Master §§10–13, integration §§7–8 y restricciones I08/I24/I28, los cuatro modelos de datos y contratos HTTP/eventos pertinentes. No se aprueba el conjunto documental completo ni su implementación.

Precedencia aplicada: petición actual y deltas explícitos vigentes, especialmente Master §13 y encabezados de supersession, sobre menciones históricas a confirmación N1. El pack es índice `incomplete`, ahora stale por la nueva solicitud; no fuente normativa. Shared `Current status`/`Decisions locked` conserva los gates, pero sus referencias a una aprobación SA sin verbatim no equivalen a este dictamen nuevo.

Conflicto macro concreto observado: `docs/architecture/integration-map.md` §5.0, L230, y `architecture-proposal.md` L165 fijan hito tras ACK; Master §§9–10 e integration §7 fijan registro inicial anterior a ACK, con preparación/fence previa sin hito. Se acepta el delta local explícito solicitado, coherente con brief R07 («al confirmar registro»); no se atribuye esa modificación a una aprobación macro. Reconciliación macro por su owner permanece separada. Tampoco se reutilizan los aliases macro L224/L229 como contratos v1 vigentes.

## 2. Fuentes realmente observadas y límite de snapshot

Root único: `/mnt/data/Shares/Projects/entralo-workspace`. En la tabla, salvo rutas expresas, el prefijo es `docs/specs/increments/entralo-v1-executable-specs/`. «Completo» significa lectura documental, no validación ejecutada.

| Archivo | Secciones/rango observado |
|---|---|
| `docs/specs/.working/entralo-v1-executable-specs-planning-context.md` | Completo, L1–104; índice refresh #15/incomplete, autoridad y límites |
| `docs/specs/.working/entralo-v1-executable-specs-sdd-context.md` | Completo, L1–191; en particular Current status, Decisions locked y Validator Approval |
| `review-request.md` | Completo, L1–89; mandato formal nuevo L77–89 |
| `solution-architect-review.md` | Completo, L1–177; findings originales §7 y firma histórica |
| `master-spec.md` | Completo, L1–223; §§2–4, 9–13 y AC-N1 |
| `integration-contract.md` | Completo, L1–169; §§1–4, 7/7.1, 8/8.1/8.2 y mapping §2 |
| `data/purchases.md` | Completo, L1–262; SQL documental, consistencia, deltas SA/N3–N6/D-N1-01 |
| `data/payments.md` | Completo, L1–93; ledger, índices, ausencia monetaria, ciclos y D-N1-01 |
| `data/catalog.md` | Completo, L1–106; control activo/preparing, ACK y sustitución atómica |
| `data/ticketing.md` | Completo, L1–92; guards emisión/refund/uso y tombstone por ciclo |
| `api/purchases.yaml` | Completo, L1–442; claims/facts/closing, mapping, solicitud/decisión/lecturas refund |
| `api/payments.yaml` | Completo, L1–104; create, I28 ledger y GET refund |
| `api/catalog.yaml` | Completo, L1–260; controls/operations/managed y milestones |
| `api/ticketing.yaml` | Completo, L1–161; emisión/cierre/facts/refund guard/admisión |
| `api/common.yaml` | L225–319, 480–789 y 805–944; receipts, AcceptanceDecision, RefundRequest/View/Approval, emisión, GuardRequest/TicketFacts, snapshots/paid allocation y ClosingPreparation |
| `api/admin-bff.yaml` | L95–244; managed/control/GET operation/mapping/decisión como proxies |
| `api/buyer-bff.yaml` | L170–249; pago, solicitud y GET ajustes propio |
| `events/integration-envelope.v1.schema.json` | Completo, L1–111; tipos/productores, ACK, refund/release/guard/resultados |
| `events/change-lifecycle.v1.schema.json` | Completo, L1–44; registro/aplicación/ACK stage |
| `events/change-reopen.v1.schema.json` | Completo, L1–27; cuatro fases y versiones/sello |
| `events/order-scope-snapshot.v1.schema.json` | Completo, L1–19; ORDER R07 remanente |
| `events/adjustment-snapshot.v1.schema.json` | Completo, L1–61; items, allocation y enum conceptual |
| `consistency-review.md` | L132–181; tabla SA histórica y AC-N2…N6 con supersession N1 |
| `docs/specs/requirements/entralo-v1-requirements-brief.md` | Lectura L39–57 (R03–08 y contexto fiscal); búsqueda dirigida adicional de reglas R/CA, sin afirmar lectura completa |
| `docs/architecture/integration-map.md` | L220–235; §5.0, conflicto de sello y protocolo macro histórico |
| `docs/architecture/architecture-proposal.md` | L160–167; conflicto concreto del sello L165 |

Se cargaron `design-patterns-standard`, `hexagonal-architecture` y `context-pinning`. Búsquedas dirigidas internas localizaron contratos y conflicto macro; no hubo exploración externa ni grafo. Son **26 archivos fuente** observados con los límites de rango anteriores, no un inventario de todo el incremento.

**Snapshot hash: unavailable.** No se calculó manifiesto/hash de bytes en esta revisión de lectura; no se ejecutó CLI, scripts ni cómputo criptográfico. El HEAD `feb38aa` citado por el pack es evidencia histórica ajena, no snapshot certificado de esta revisión. Las líneas identifican el corte leído, no prueban freeze ni ausencia de cambios concurrentes. No parser/lint/bundle/refs, schema engine, generador, build, SQL, pruebas, scan, Git o red. Las restricciones de framework se revisan como diseño, no como imports reales.

## 3. Disposición independiente de findings originales y N1–N6

«Cerrado en diseño para este alcance» no significa test pasado, gate cerrado ni edición del informe histórico. No se impone literalmente una alternativa sugerida en 2026-10-02 si la decisión vigente resuelve mejor el problema.

| ID original | Disposición SA actual | Evidencia y criterio verificable |
|---|---|---|
| SA-F01, major | **Cerrado en diseño**; D-N1-01 aceptado como derivación mínima, no nueva aprobación funcional | Master §13/AC-N1; integration §7.1 L101–109; Purchases datos L254–262/API L276–294; common AcceptanceDecision/ClosingPreparation; Payments D-N1-01/envelope L25. Registro Catalog exige fence durable previo, que drena commits/rollbacks: no ventana T→barrera con nuevas ventas antiguas. Commit aceptación ganador conserva H2; fence ganador impide aceptación/emisión incluso approval previo. Cobro canónico sin venta compensa total original SYSTEM_R04; UNKNOWN no dinero. No excepción PRODUCT_OWNER ni extensión R07 para llenar el hueco original. |
| SA-F02, major | **Cerrado en diseño** | integration §8.1 L131 y §8.2 L145; Purchases POST mapping L332–352/GET propio L353–369, Admin proxy L196–216, Buyer GET L209–225; common AdjustmentCreateRequest/RefundRequest. SUPPORT REFUND_APPROVE crea alcance sin monto y sin dinero; servidor congela allocation/digest; buyer obtiene id durable y sólo lo referencia. Creación no es aprobación ni reserva de claims. |
| SA-F03, major | **Cerrado en diseño** | integration L135–137; Ticketing datos L90–92/API L138–156; envelope release/released L46–47/L101–102. REJECT predispatch o FAILED_FINAL con prueba monetaria terminal libera claims y emite release atómicamente; cleanup espera ACK. Release antes Block crea tombstone; stale Block no re-bloquea. No VIGENTE forzado, no restaurar usada/CANCEL/refunded, no release por UNKNOWN/timeout. |
| SA-F04, major | **Cerrado en diseño**, con alternativa vigente distinta de liberar business identity | Purchases índices L123–125/delta L238/L244; Payments L60–70/L79/L85–87; integration L133. Identidad permanente por motivo, mismo refund_id/key y ciclo superior seguro. Motivo distinto permite identidad distinta tras cleanup/cero efecto; índice total parcial más locks/claims impide otra total monetaria. C2 revalida ventana sin reset de tres envíos ni primera autorización/SLA. Payload monetario ya enviado no cambia; DR05 no probado mantiene UNKNOWN/manual. |
| SA-F05, moderate | **Cerrado en diseño** | Catalog datos L87–90/L98–106; integration §7 L83–97 y §7.1 L107–109; Purchases datos L240; lifecycle/reopen. Una PREPARING coexiste con activa PENDING/APPLIED; registro sustituye anterior y promueve nueva en tx local. C2/CANCEL no espera ACK anterior; control superior/fence invalida handlers/reopen viejos. CANCEL terminal; caída de dependencia vigente sigue PENDING observable, no garantía ficticia de progreso. |
| SA-F06, moderate | **Cerrado en diseño** | Payments ledger/cycle L53–55/L79/L87/L91; integration L115–119/L139–141; common GuardRequest/OrderScopeSnapshot; schemas adjustment/order/envelope. Persistencia completa por ciclo permite mismatch antes red y digest RFC8785 reproducible. ORDER R07 congela remanente; R04 sin emisión usa prueba/digest total, no guard/lista ficticia. Prueba no venta de Purchases distinta de ausencia monetaria FAILED_FINAL de Payments. |
| SA-F07, moderate | **Cerrado en diseño** | Catalog GET operation L149–164, Admin GET L180–195, common OperationReceipt L235–263; integration L93. resource_path consultable en misma API; fases/sello visibles, PENDING no implica ventas disponibles; BFF no inventa estado ni resultado financiero. |
| SA-F10, minor | **Cerrado en diseño** | Envelope enum/productores L11/L27–34; lifecycle ACK L36–41; integration L86–97; Catalog datos L53/L100. Aliases retirados, APPLIED no RECORDED para términos; BARRIER reconoce versión registrada, APPLIED committed; producer↔owner restringido. PREPARED no sustituye ACK APPLIED Purchases: ambos owners exactos + oferta + PREPARED antes COMMIT; stale/CANCEL no abre. |
| N1 / D-N1-01 | **Revisado y aprobado en diseño en esta revisión nueva** | Brief R03/R04 exige asignación válida y release irreversible; R07 compra válida; R08 automatismo R04 sin SUPPORT. Master §13 delimita exactamente la derivación. No conflicto funcional nuevo demostrado que justifique repetir aprobación general N1. |
| N2 | **Adecuado en diseño** | Catalog §N2 y dos índices separados; rollback preserva control previo sin hito nuevo, registro/supersession/outbox atómicos. |
| N3 | **Adecuado en diseño** | integration §8.1, índices y ciclos en ambos owners; key anterior conserva recibo, motivo distinto no queda bloqueado por identidad histórica; ausencia/cleanup/caps siguen obligatorios. |
| N4 | **Adecuado en diseño** | GET propio owner/Buyer + AdjustmentPage y data Purchases L246; id consultable sin email, sin monto libre ni autoridad buyer nueva. |
| N5 | **Adecuado como propuesta operativa** | integration §8.2 L147/L151 y Purchases L248; aging por ciclo no reset, R04 excluido, umbrales operativos no expiran derechos ni autorizan dinero; siete días siguen desde autorización. No se certifica operación real. |
| N6 | **Adecuado en diseño** | Purchases L238/L250–252, Payments L87/L91; history físico append-only y puntero local atómico, snapshots/digest/authority durables; claim enum/schema iguales sin DTO HTTP huérfano. |

SA-F08/09/11 no forman parte de la firma solicitada. Se observó incidentalmente la eliminación de RefundAdjustmentV1 y de proyección redundante, pero no se amplía el cierre formal a esos tres findings ni al proceso macro completo.

## 4. Resultado transversal y patrones

La secuencia no necesita ACID crossDB: Payments es owner del hecho canónico; Purchases de aceptación/asignación/compensación y claims; Catalog del control/hito; Ticketing de guard/emisión/uso. La prueba R04 local se apoya en fence/release y ausencia de acceptance/issuance_obligation, no en 404 Ticketing. El proof de FAILED_FINAL debe ser monetario, de Payments, no reutilizar el anterior. FK sólo locales; refs externas opacas.

I24 sólo reclama permiso, no llama I08/I28. I08 procesa hecho postcommit sin callbacks ni red bajo locks. I28 es job independiente que lee ledger sin MP/I08/I24. Sus dependencias temporales no forman un ciclo de llamadas. Preparación/reopen son fases durables con outbox/inbox y CAS, no callbacks recursivos. Advisory/barrera sólo durante transacciones locales participantes; evento→cuenta→stocks ordenados→orden evita upgrades o espera MP. La aceptación usa reloj nuevo tras locks y conserva decisión sólo al commit; deadlines/release no esperan red.

| Patrón recomendado | Motivo real / boundary | Alternativa simple y límites |
|---|---|---|
| Adapter/ACL, por ejemplo `PaymentProviderAdapter` | Traducir hechos MP y DTO externos a modelos puros; infraestructura implementa puertos de salida | Mapper/función basta para conversión simple. No pasar body proveedor, DTO generado ni entidades ORM al dominio/aplicación; no tomar elegibilidad en el mapper. |
| Commands explícitos, por ejemplo `ReleaseRefundGuardCommand` | Intención durable auditada/retry con id/cycle/version/digest | Datos inmutables + handler de aplicación bastan; no jerarquía genérica de comandos, nuevo bus o undo distribuido. Redelivery no consume otro intento monetario. |
| Process manager durable de compra/refund en Purchases | Orquestación ya existente de hechos, compensación, jobs y recuperación | Ledger + use cases específicos; no servicio/módulo adicional, transacción distribuida ni god facade que asuma reglas de Catalog/Payments/Ticketing. |
| Enums + transiciones/CAS/versiones | Estado finito y concurrencia real; dominio puro define invariantes, repositorio/adaptador aplica persistencia | No State hierarchy para cada enum. No Strategy fiscal hipotética: calculador puro PRICE-01 y snapshot original, sin recalcular refund con tasas actuales. |
| Proxy simple de canal | Admin/Buyer adaptan rutas/auth/transporte, preservan facts/errores | Cliente/mapper acotado; no estado financiero BFF, caché autorizatoria ni wildcard que oculte contrato. |

Master §2 L31–42 y §§5–6 preservan dominio sin framework, application→domain e infrastructure→application/domain; `common.yaml` es reutilización contractual, no modelo de dominio compartido. La ausencia de código limita la comprobación de dependencias reales; tests de arquitectura futuros deben hacerla efectiva.

## 5. Hallazgos nuevos y severidad

Criterio: major bloquea aprobación si permite venta tras fence, dinero incierto/duplicado, reapertura stale o violación de ownership; moderate bloquea si falta ruta/correlación durable necesaria para un flujo; minor corresponde a ambigüedad documental con autoridad vigente inequívoca y sin hueco de diseño.

| ID / clasificación | Severidad / disposición | Evidencia y criterio verificable |
|---|---|---|
| SA-RR-01 — `mechanical` | minor, **no bloquea diseño**; recomendación de claridad documental posterior | `api/catalog.yaml` L133 abrevia «previo H-A/SUPPORT R07» frente a Purchases L283/Master §13: approval previo solo no es venta. Master §13, integration §7.1 y ClosingPreparation ya resuelven la regla explícitamente. Al reconciliar prosa, nombrar «aceptación durable ganadora antes fence», sin cambiar schemas, tasas, clocks ni políticas. Criterio: ninguna explicación operativa presenta approval aislado como suficiente para vender tras fence. |

No se detectaron nuevos hallazgos `technical-decision`, `architectural-decision` ni `functional-decision` bloqueantes en el alcance leído. Los textos N1 históricos están explícitamente superseded; no se convierten en nueva pregunta funcional. El conflicto macro del sello está identificado en §1, no escondido ni resuelto por edición cosmética.

## 6. Veredicto y condiciones textuales persistidas

**Veredicto SA exacto: `approved`. Diseño aprobado para el alcance definido, sin condiciones pendientes de corrección de diseño.** Los ocho findings solicitados están cerrados en diseño por evidencia actual; N1–N6 quedan revisados conforme a la matriz. No es «approved» con major abiertos. La recomendación minor SA-RR-01 no suspende esta aprobación.

### 6.1 Condiciones obligatorias de conservación del diseño aprobado

Estas condiciones ya están especificadas en las fuentes leídas; son invariantes de esta firma, no cambios pendientes ni resultados de pruebas:

1. **«Registrar el hito Catalog únicamente después de la preparación/fence Purchases durable que drena commits y rollbacks de aceptación; approval MP aislado nunca constituye venta ni revive un permiso invalidado o una orden LIBERADA.»** Verificación: ambos órdenes de commit, rollback, ACK perdido y replay conservan una sola decisión/obligación, sin aceptación antigua después del fence.
2. **«Fence ganador sin venta más cobro canónico verificado produce release irreversible y obligación R04 por total original al medio original, SYSTEM_R04 sin SUPPORT; UNKNOWN no inicia dinero. Venta durable ganadora conserva H2 y política normal R07 nominal/SUPPORT, nunca refund por mera CLOSING/CANCEL.»** Verificación: total con servicio/impuestos, accepted_at null en REFUND_REQUIRED, cero emisión sin venta y autoridades incompatibles rechazadas.
3. **«CHANGE/CANCEL superior sustituye CHANGE pendiente sin esperar su ACK; conserva hitos y cierre, invalida ACK/commit/reopen obsoletos y CANCEL es terminal. Reopen exige oferta y ambos ACK APPLIED exactos, no sólo PREPARED.»** Verificación: C1/C2/CANCEL reorder/concurrentes, dos índices activos separados, rollback y replay con un solo incremento OPEN.
4. **«Mantener identidad refund permanente por motivo, mismo id/key y máximo tres envíos acumulativos/primera autorización/SLA sin reset por ciclo; motivo distinto permite identidad distinta sólo con cleanup y cero efecto probado, sin eludir caps ni duplicar total monetaria.»** Verificación: rechazo CHANGE por uso→CANCEL legítimo; C2 revalidado; UNKNOWN/CONFIRMED bloquean duplicación; payload ya enviado no cambia y DR05 no demostrado conserva UNKNOWN/manual.
5. **«Liberar claims/guard sólo por rechazo antes dispatch o ausencia monetaria terminal probada; tombstone por ciclo y ACK de cleanup antes reapertura segura, sin restaurar usada/CANCEL/refunded. Persistir snapshots/paid allocation/digests completos append-only y rechazar mismatch antes red.»** Verificación: Release antes Block, stale ciclo, scope exacto, ajuste seguido ORDER remanente y recuperación de history sin overwrite.
6. **«Preservar owners, puertos/modelos puros y separación DTO/ORM; I08/I24/I28 sin callbacks recursivos ni red dentro locks. No añadir State hierarchy, Strategy fiscal hipotética, servicio o módulo extra para materializar este diseño.»** Verificación: contratos/trazas y tests de arquitectura en implementación futura.

Cambio sustantivo a estas condiciones invalida la firma del alcance afectado y requiere revisión nueva, no reutilización automática de este informe.

### 6.2 Pruebas/gates posteriores independientes, no condiciones de diseño pendientes

- G-OAS: parse/lint/bundles/refs/formatos/fixtures/generador sobre bytes actuales; este cotejo manual no certifica schemas ni invariantes aritméticas/crossrow.
- G-API-GOV: auditoría independiente después de G-OAS válido, mismo snapshot; no se sustituye por esta firma SA ni por registro Planner.
- Freeze y G-SCAN final después de todas las escrituras. Límite declarado, sin análisis ni cierre: última corrida `gitleaks dir` reportada exit 1 con dos falsos positivos ya verificados en matriz fixture L9–10, allowlist intacta; no certifica ausencia de secretos ni scan final. No se ejecutó scanner aquí.
- Spec Validator conserva `verdict: none`; sólo ese rol emite su dictamen global tras prerrequisitos. G-HUMAN-CONTRACT es independiente, no satisfecho por esta revisión, conformidad F02/F03 o Gate1 macro.
- AC-N1, AC-SA02…07/10 y AC-N2…N6 son criterios para validación/implementación futura, no tests ejecutados. DR05 debe demostrar capacidad real, idempotencia y ausencia terminal monetaria; si no, se mantiene UNKNOWN/manual sin redefinir negocio.

P04 físico/fiscal y HC completo (pin/enforcement de presupuesto total, drenaje/performance/load-wave, capacidad real) **permanecen residuales separados, fuera de esta firma**. Se revisó seguridad lógica del fencing, no su capacidad o rendimiento. DR07, P03, chain, bootstrap, QN05 y go-live no se evalúan ni se cierran. No tasas, fees, costos, derechos, retención o garantías nuevos.

## 7. Sustitución de evidencia y cierre acotado

Este informe satisface la necesidad de **una respuesta SA nueva, durable y con condiciones textuales** para los ocho findings y D-N1-01; permite resolver por evidencia actual la ausencia del verbatim histórico sin exigir recuperarlo como prerrequisito circular. No demuestra que existiera una aprobación anterior, cuáles eran sus condiciones o que fueran aplicadas. La historia y su fuente siguen no recuperadas.

G-SA para este scope dispone ahora de aprobación de diseño nueva; no se modifica administrativamente su registro en shared/gates/Master, ni se proclama cerrado el gate global que incluye residuales. El owner podrá citar este informe en una intervención posterior autorizada; no necesita reconstruir la respuesta perdida para usar esta firma acotada. Macro/P04/HC y los gates independientes siguen abiertos según sus owners.

Única escritura de esta sesión: este informe, mediante `apply_patch`; lectura posterior requerida para verificar existencia/contenido. Ningún otro archivo, contrato, shared, pack, allowlist o histórico se modifica. Sin implementación, decomposition, tooling ni autorización de ejecución.

Firma nueva: `solution-architect` — 2026-10-03 — **`approved`**, exclusivamente diseño y alcance de §1.
