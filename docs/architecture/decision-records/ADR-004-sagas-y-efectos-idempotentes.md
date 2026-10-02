# ADR-004 — Saga persistente, aceptación predeadline y efectos idempotentes

- **Estado ADR:** `proposed`; **Lifecycle status:** `draft`; revisión `revision-needed`.
- **Fecha:** 2026-10-01; owner Purchases/Payments/Ticketing; autor Planner. Sustituye precisión técnica F-E anterior por SAR-01/03/06/07/08/09/13; no accepted ni plan aprobado.

## Contexto y restricciones conservadas

Brief R-03/04/07/08, H-A/H-2 y deltas D-UNKNOWN-01/D-TIME-01/D-AUTH-01: auth antes hold, 8/userId-evento, TTL20+gracia30 configurables; UNKNOWN máximo5min fijo/no renovable sólo conciliación; una transacción MP/orden, provider payment_approved_at tiempo compra; emisión posterior no deadline físico, CLOSING no refund por latencia. LIBERADA terminal, late discovery refund original R-04, SUPPORT sólo R-07. Seis DB lógicas separadas no ACID repartido.

Procedencia H-2 histórica: «antes de ejecutar el pago revisar si el evento aun se encuentra disponible, si si ejecutar el pago, ya si termina el pago ya se termina todo el flujo, ya la boleta entra en la politica de devoluciones, no se puede nada más». H-A confirmado2026-09-30: pago admisible completa compra, emisión async y fallo definitivo R-04; no nueva confirmación de estas reglas.

## Decisión propuesta

Process manager Purchases, outbox/inbox/guards/jobs/fences por key. Token MP sólo memoria sync TLS Browser/BFF→Payments, no Purchases/DB/SQS/outbox/vault/logs ni creación de pago en cola; intento durable/key antes MP, incierto consulta identidad antes retry. Precheck I-24 gate/stock/owner/deadline en Purchases antes red, no locks durante MP. H-C close_requested durable+advisory tx shared admisión/exclusive try barrera, no fairness/FOR SHARE hot gate; permisos previos no vuelven a exigir OPEN. integration §5.0/HC-01…09 canónicos.

### SAR-01/F-E — elegibilidad comercial MP y reconciliación acotada; D-SAR01-CA04 aprobada

**Fuente funcional:** única fuente de aprobación: respuesta literal del usuario **«sí, dale la opción A»** (2026-10-01), aprobación **solo del punto funcional**; la solicitud actual sólo da procedencia de propagación, no ratificación ni fuente adicional. Trazabilidad: brief R-03/R-04/CA-03/CA-04/§13.A source trace y propuesta §5.2. Approval MP `<grace_end_at` determina elegibilidad; evidencia canónica/durable reconciliada `<reconciliation_deadline=grace_end_at+5m` honra compra con asignación válida **aunque accepted_at Purchases sea post-cutoff**. Sin confirmación al deadline libera; approval encontrado después de liberar o después del deadline sin decisión durable previa → refund R-04/no reconsumo. Ventana no extiende compra/nuevos pagos; TTL20/grace30/R-07/UNKNOWN5m intactos. Decisión funcional aprobada y aplicada, ADR técnico sigue proposed/draft, sin plan approval/ready.

1. Purchases primaria genera grace_end_at y deadline=grace+300s inmutables, snapshot I-24/fence/monto. Payments no recalcula.
2. Payments webhook autenticado/query canónico MP valida approved/provider approved_at<grace, referencia/amount/COP/fence/snapshot; ambiguo UNKNOWN. Commit idempotente intent+observation_version persiste evidencia CanonicalPaymentFactV1+evidence_id+outbox. canonical_confirmed_at auditoría de registro BD, no exact commit ni comparador cross-host.
3. Tras commit notificación **directa** I-08 privada IAM/SigV4/TLS, budget3s/connect1s/1retry seguro dentro3s misma key; no JWS/firma KMS del hecho. SQS outbox/inbox recuperación/producer Payments exclusivo/hash conflicto incidente. I-28 recupera ledger durable sin MP/callback I-24. No red bajo locks.
4. Purchases adquiere todos locks cuenta/localidades/orden/permiso/asignación en orden HC; después **sentencia nueva clock_timestamp()** única lectura, CAS reconciliación accepted_at<deadline y approval<grace/fence/asignación/monto válidos. **No exige accepted_at<grace**: timestamp de compra purchased_at=payment_approved_at MP; accepted_at audita decisión local y puede ser post-cutoff. Decisión canónica+venta+stock reservado→vendido+obligación/outbox atómicos. now/transaction_timestamp/statement_timestamp anteriores a locks no sirven; no asumir predicado volátil reevaluado. Tx<=1s HC-09; commit exitoso conserva resultado, ACK tardío recupera decisión previa, rollback no venta/retry nuevo reloj.
5. Release misma guarda/BD al deadline, sin MP/I-28/SQS/red, lease<=5s/fence/tick1s/dos réplicas. Nueva aceptación>=deadline nunca, aun release retrasado. Evidencia host Payments previa **no basta** para CAS tardío; LIBERADA nunca revive. Relojes JVM sólo budgets, salud real BD debe verificarse (guard1s/medición<=60s propuesto), no inferir por host app; fuente proveedor precisión/zona DR-05, incierto UNKNOWN/sin fallback/backdating.

Margen planificación conservador5s Planner: recuperación prioritaria deadline−5s, no deadline anticipado/epsilon ni rechazo si CAS termina+299.999. Presupuesto3s red+1s tx+1s scheduler, objetivos p95 evidence→CAS<=1s/p99<=5s bajo carga, no garantía under failure.

**D-SAR01-CA04 — approved-by-user / applied-awaiting-independent-review:** brief ya sustituye respuesta MP cruda+299.999 como venta por evidencia canónica/durable reconciliada antes del deadline, approval previo al cutoff y accepted_at post-cutoff permitido. Raw MP+299.999 con pipeline2s sin reconciliación previa → release/refund conforme CA-04 actualizada; no garantía pipeline1ms. DB física compartida no crea ACID común; sharedDB/2PC descartados, al igual que host sello para CAS tardío, accepted_at como tiempo comercial, deadline+epsilon/renovar hold/nuevos pagos/LIBERADA→VENDIDA. Impacto comprador compra previa honrada con persistencia post-cutoff; sin confirmación al deadline refund sin reconsumo. Fuente literal «sí, dale la opción A» cerrada, no otro reconocimiento funcional; re-review SA emitida en `solution-architect-review.md` §10 (2026-10-01; §10 antecede a SV-R1/SV-R2/F-1/F-3/F-5: **el informe §10 examinó el corte de su momento** y no acredita cada edición posterior; **no se exige re-review SA adicional — lo único pendiente es la Spec Validator global**); Validator pendiente, no ready ni plan aprobado.

### SAR-03/13 — intento de emisión e incertidumbre

Máximo3 `(issuance_id,attempt_number)` reservados durable antes dispatch; base obligación única/slots absolutos+1/+5/+25 **segundos**, actual>=max(slot,resolución anterior). Timeout10s desde actual_dispatch_at hasta resultado durable o UNCERTAIN, ACK transporte no ISSUED. Presupuesto nominal35s (+25dispatch+10espera) sin incertidumbre, no31min/intervalos acumulados; p95 dispatch→resultado<=8s y venta→ISSUED<=30s separados.

Transient **probado sin efecto** habilita siguiente slot; non-retryable definitivo cierra temprano sin gastar3; tres fallos definitivos→CLOSED/tombstone+ausencia→refund original R-04. Timeout/ACK/404 incierto consulta guard, nunca ausencia por tiempo; ISSUED recupera/sin false refund; CLOSED terminal serializa comandos tardíos. Cierre/consulta no cuarto intento; SQS/restart no reset. Ticketing caído conserva obligación/stock, no refund ciego. Primer UNCERTAIN timer: alerta inmediata/reconciler5min; paging guardia+aviso comprador a5min, escalado operación15min, incidente mayor24h. Aviso key order+issuance_uncertain+version/5intentos1/2/4/8/16min10s. Textos/metrics/casos propuesta §17/integration §4.2.

### SAR-07/09 — entrega vs scheduler

General SQS visibility60s/handler10s; payment-results visibility30s/handler<=5s, rollback confirmado ChangeMessageVisibility5s, heartbeat10s extensión30s vivo/total10s. receive5/DLQ fuente4d/14d no contador negocio ni hold deadline. Jobs críticos lease5s/fence/tick1s/dos réplicas, recuperación objetivo<=6s/liberación<=15s sano pero overdue>0 incumple/no tolerancia; otros lease30s. DB obligaciones sobreviven DLQ/redrive conserva keys.

## Patrones, alternativas e impacto

Adapter/ACL MP/SES infraestructura, Command no sensible/obligación durable, process manager no GoF, State enum/transiciones sin jerarquía hipotética. Choreography pura/BFF saga/2PC/JTA/FIFO universal/Step Functions no elegidos. Sin dominio/JPA compartido/red bajo lock; seis owners intactos. Firma principal BFF única propia, hecho/grant fiscal/admisión eliminados SAR-06. Backend APIs no definidos como implementación, OpenAPI/DDL posterior a gates.

## Acceptance criteria (no ejecutados)

**Disposición conceptual RES-01/02/06/07 (2026-10-01), propuesta §§14.1/16 autoritativa:** no cierre Validator ni nueva firma SA; ADR `proposed`/`draft`. RES-01 permanece riesgo visible load-wave/recuperación concentrada; SDD debe fijar barrido periódico acotado desde grace/jitter/prioridad, catch-up y perfil I-08/I-28, receive/backoff/heartbeat antes bootstrap. RES-02 conserva riesgo pipeline/visibilidad MP tardíos→R-04; follow-on tablero misses/latencia/refund y DR-05 visibilidad `approved`, copy UX futuro sin prometer boleta/acreditación ni editar brief. No cambia cutoff/deadline/polling/opción A.

**RES-06 — definición vinculante de «alerta inmediata» UNCERTAIN en este ADR:** métrica `issuance_uncertain_total` + ticket/registro durable deduplicado `(order_id,issuance_id,uncertainty_version)`, **sin paging por cada timeout**. Timer desde primer incierto inmutable; replay/restart no duplican ticket ni acciones por nivel. Paging+aviso5min, escalado15min, mayor24h/reconciler5min conservados; resolución antes5min cancela escalamiento pendiente y conserva auditoría. Critical de integridad inmediata intacta; no refund ciego/4º intento/release por tiempo. **ADR4-AC8:** probar primer incierto/replay/crash/resolución temprana y niveles con `issuance_uncertain_age_seconds`/`issuance_uncertain_escalation_total{level}`, ticket único y cero paging UNCERTAIN antes5min.

**ADR4-AC9 / RES-07:** contrato/traza CM-07/PLAN-04-RES07 exige cero I-08→I-28/I-24 anidados, cero I-28→MP/I-08/I-24 y cero I-24→I-08/I-28, incluidos timeout/ACK perdido/duplicados; sólo job I-28 independiente tras finalizar request. Cero llamadas/spans descendientes prohibidos; no DAG global ni test ejecutado. Alternativa diagrama sin verificación descartada; sin patrón GoF/servicio nuevo.

- ADR4-AC1 crash/ACK perdido conserva key/cero segundo pago/token en cola.
- ADR4-AC2/M1-AC01…08/CA-03/04: approval=cutoff−1ms/evidencia durable reconciliada CAS+299.999 acepta con **accepted_at post-cutoff**, stock≥0/obligación única; reconciliación+300 o después sin decisión durable previa niega/refund aun release demorado. Raw MP+299.999+delay2s sin reconciliación previa release/refund conforme CA-04 actualizada. I-08/I-28/SQS duplicados/crash/ACK recuperan misma decisión; LIBERADA no revive/cero nuevo pago ni reconsumo.
- ADR4-AC3/F02-AC1…6 y SAR03-AC offsets1/5/25s/segundo+11/timeout35/UNCERTAIN resultado tardío ISSUED/cero cuarto intento/false refund; tres fallos probados CLOSED/refund.
- ADR4-AC4 H2-01…06/UNKNOWN-01…04/TIME-01…03 conserva hold5min/inmutabilidad/late refund/R-07 proveedor/SUPPORT/cancelación/uso.
- ADR4-AC5/CLOCK/M1-04 tx predeadline/lock después clock_timestamp niega; clocks hosts±1s no efecto, pin DB/failover/rollback y reloj proveedor incierto UNKNOWN.
- ADR4-AC6 HC-01…09 cierre/fences/starvation/churn/pool/enforcement total1s probado antes bootstrap.
- ADR4-AC7 SAR07/09/13 duplicate receive/ChangeVisibility/worker stale/crash lease/overdue y paging5min/15min/24h+dedup aviso, ningún refund por tiempo.

Consulta SA atendida por §10 firmado del informe existente para su snapshot, sin aval de esta disposición posterior ni nueva firma atribuida. Disposición RES sigue las recomendaciones SA y dirección autorizada del orquestador; nueva revisión global Spec Validator pendiente, último global R2 `not ready` histórico. Scan/SEL-R3 PASS selectivo no ready global; sin aprobación humana ni ejecución.
