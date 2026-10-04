# Payments — modelo y migration contract

Lifecycle status: `planning`. Owner `entralo_payments` app. DDL documental, common.md normativo; nunca token/PAN/CVV/bodyMPraw en DB/JSON/logs.

**N1 vigente:** sección final D-N1-01 supersede mención histórica «extensión pendiente N1»; derivación requisito Master§13, `specified-awaiting-independent-review`, no aprobación específica ni ejecución.

Delta F-GOAS-03: nombre histórico RefundComponent no designa DTO OpenAPI vigente (retirado por falta de consumo). Enum conceptual/DB/schema permanece NOMINAL|SERVICE|NOMINAL_TAX|SERVICE_TAX según `events/adjustment-snapshot.v1.schema.json#/$defs/component` y claim Purchases; R07 sólo NOMINAL. No campo wire, cambio de DB/digest ni migración. Véase `../api-lint-policy.md` AC-GOAS-03.

```sql
CREATE TABLE app.payment_intent (
 payment_intent_id uuid PRIMARY KEY, order_id uuid NOT NULL UNIQUE, user_id uuid NOT NULL,
 provider_key uuid NOT NULL UNIQUE, provider_payment_reference varchar(128) NULL UNIQUE,
 amount numeric NOT NULL CHECK(amount>0 AND amount=round(amount,2)), currency char(3) NOT NULL CHECK(currency='COP'),
 state varchar(12) NOT NULL CHECK(state IN ('CREATED','UNKNOWN','APPROVED','DECLINED','FAILED')),
 payment_start_fence bigint NOT NULL CHECK(payment_start_fence>0), gate_version bigint NOT NULL CHECK(gate_version>0),
 grace_end_at timestamptz NOT NULL, reconciliation_deadline timestamptz NOT NULL,
 payment_approved_at timestamptz NULL, latest_observation_version bigint NOT NULL DEFAULT 0 CHECK(latest_observation_version>=0),
 dispatch_started_at timestamptz NULL, resolved_at timestamptz NULL,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 CHECK(reconciliation_deadline=grace_end_at+interval '5 minutes'),
 CHECK(state<>'APPROVED' OR payment_approved_at IS NOT NULL)
);
CREATE INDEX payment_owner_idx ON app.payment_intent(user_id,created_at DESC);
CREATE INDEX payment_reconciliation_idx ON app.payment_intent(reconciliation_deadline) WHERE state IN ('CREATED','UNKNOWN');
CREATE TABLE app.payment_evidence (
 evidence_id uuid PRIMARY KEY, payment_intent_id uuid NOT NULL REFERENCES app.payment_intent(payment_intent_id),
 observation_version bigint NOT NULL CHECK(observation_version>0),
 payment_state varchar(12) NOT NULL CHECK(payment_state IN ('APPROVED','DECLINED','FAILED','UNKNOWN')),
 payment_approved_at timestamptz NULL, provider_timestamp_original varchar(100) NULL,
 provider_timestamp_precision varchar(20) NOT NULL, provider_timestamp_zone varchar(50) NULL,
 canonical_confirmed_at timestamptz NOT NULL, observed_at timestamptz NOT NULL,
 amount numeric NOT NULL CHECK(amount>0 AND amount=round(amount,2)), currency char(3) NOT NULL CHECK(currency='COP'),
 evidence_digest char(64) NOT NULL, provider_reference varchar(128) NOT NULL,
 provenance varchar(30) NOT NULL CHECK(provenance IN ('CANONICAL_QUERY','CANONICAL_CREATE_RESPONSE_VERIFIED')),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 UNIQUE(payment_intent_id,observation_version), CHECK(payment_state<>'APPROVED' OR payment_approved_at IS NOT NULL)
);
CREATE TABLE app.webhook_receipt (
 receipt_id uuid PRIMARY KEY, provider_event_key varchar(300) NOT NULL UNIQUE,
 provider_payment_reference varchar(128) NOT NULL, request_id varchar(200) NOT NULL,
 payload_digest char(64) NOT NULL, authenticated_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
);
CREATE INDEX webhook_payment_idx ON app.webhook_receipt(provider_payment_reference);
CREATE TABLE app.refund_execution (
 refund_id uuid PRIMARY KEY, payment_intent_id uuid NOT NULL REFERENCES app.payment_intent(payment_intent_id),
 order_id uuid NOT NULL, reason varchar(25) NOT NULL CHECK(reason IN ('EVENT_CANCELLED','EVENT_CHANGED','R04')),
 scope varchar(10) NOT NULL CHECK(scope IN ('ORDER','ADJUSTMENT')), adjustment_id uuid NULL,
 provider_key uuid NOT NULL UNIQUE, amount numeric NOT NULL CHECK(amount>0 AND amount=round(amount,2)),
 state varchar(20) NOT NULL CHECK(state IN ('AUTHORIZED','UNKNOWN','INITIATED','CONFIRMED','FAILED_FINAL')),
 authorized_at timestamptz NOT NULL, initiated_at timestamptz NULL, confirmed_at timestamptz NULL,
 provider_reference varchar(128) NULL UNIQUE, attempts smallint NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 3),
 cycle_version bigint NOT NULL CHECK(cycle_version>0), snapshot_digest char(64) NOT NULL,
 guard_version bigint NOT NULL CHECK(guard_version>0), scope_snapshot jsonb NULL,
 adjustment_snapshot jsonb NULL, absence_evidence_id uuid NULL,
 observation_version bigint NOT NULL CHECK(observation_version>0),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 CHECK((scope='ORDER' AND adjustment_id IS NULL) OR(scope='ADJUSTMENT' AND adjustment_id IS NOT NULL))
);
CREATE UNIQUE INDEX refund_functional_idx ON app.refund_execution(order_id,reason,scope,adjustment_id) NULLS NOT DISTINCT;
CREATE UNIQUE INDEX refund_total_idx ON app.refund_execution(order_id)
 WHERE scope='ORDER' AND state<>'FAILED_FINAL';
CREATE TABLE app.refund_attempt (
 refund_id uuid NOT NULL REFERENCES app.refund_execution(refund_id),
 attempt_number smallint NOT NULL CHECK(attempt_number BETWEEN 1 AND 3),
 due_at timestamptz NOT NULL, dispatched_at timestamptz NULL, resolved_at timestamptz NULL,
 outcome varchar(20) NOT NULL CHECK(outcome IN ('RESERVED','UNKNOWN','INITIATED','CONFIRMED','DEFINITIVE_FAILURE')),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL, PRIMARY KEY(refund_id,attempt_number)
);
CREATE UNIQUE INDEX refund_inflight_idx ON app.refund_attempt(refund_id) WHERE resolved_at IS NULL;
```

RetenciónO payment/evidence/refundattempt, D webhook; referenciasproveedor sóloauditoríaprotegida no públicaproof. SinFKorder externo. Authowner antescrearintención, rowlockintent/únicaorder impide segundodispatch; providerkey deriva payment_intent_id yrefund_id estable UUID, DR05 verificaridempotencia/búsqueda enMPreal antesadapter. No tokenpersistido/digesttoken; replay mismointent ignora tokennuevo yleeledger sinMP. Canonicalcreate sóloadmisible siresponseverificada normalizada ydurable (no rawpor sísola); consulta canónica defuente MP manda antewebhook. Provider approved_at ausente/impreciso/zonaambiguo UNKNOWN, nunca observed_atfallback/backdating. Evidenciaappendonly/version ycorrección excepcionalauditada, no estadofinalregresado pornotifydesordenada. Inboxrefundcomando+refundledger+job atómicos; rowlockpaymentintent verifica suma obligacionesrefunded≤amount, no exceder aunajustes/replay. RedMP fueraDBtx.

3envíosrefundoffsets1/5/25min desdeauthorized_at/sinreset, consultaidentidadantesnext incierto, hourlyrecon24h/incidente persistente. Confirmado outboxRefundObserved+ledger, ACKmissingrecoverkey. EvidenciaMP enPayments ydecisiónPurchases distintas transacciones noACIDdistribuido. V1.0.1__initial_payments_schema.sql común+DDL; expand no cambia keys/approved_atpretendidas. Acceptance unaorder/unaMP, webhookduplicadounaconsultaefecto, keypayloaddifferentincidente, inciertoqueryantesretry, lateapprovalrefundoriginaltotal/cero reconsumo.

## Delta SA — digest durable y cero efecto terminal

Campos refund_execution: digest char64 NOT NULL, cycle/guard bigint NOT NULL>0, scope_snapshot JSONB nullable obligatorio ORDER R07, adjustment_snapshot JSONB nullable obligatorio ADJUSTMENT, absence_evidence_id nullable obligatorio FAILED_FINAL/R04. Índices identidad/key permanentes; total parcial excluye sólo FAILED_FINAL con ausencia terminal probada. Mismo ciclo digest/amount/guard distinto conflicto/cero red. Ciclo superior sólo FAILED_FINAL ausencia terminal probada y mismo refund_id/provider_key/payload monetario ya enviado (amount/currency/alcance); nuevo milestone/cycle/digest válido auditado no es nuevo payload MP. Cambio de monto/alcance tras envío bloquea manual, no key nueva. Attempts≤3 acumulativos/primer authorized_at sin reset. integration §8.1.

Prueba ausencia en ledger refund_absence_evidence: absence_evidence_id uuid PK, refund_id uuid FK local execution NOT NULL, observation_version bigint NOT NULL>0, provider_key uuid NOT NULL, canonical_checked_at timestamptz NOT NULL, evidence_digest char64 NOT NULL, outcome varchar(20) NOT NULL const TERMINAL_NO_EFFECT; UNIQUE(refund_id,observation_version), índice refund_id/canonical_checked_at. ACL sólo hechos allowlist de búsqueda canónica oficial, no body crudo/tokens. DR05 debe demostrar no pendiente/ningún efecto tardío posible; 404/timeout/agotar retries no prueba. Sin prueba UNKNOWN+incidente/obligación sin release. Retención O, no delete abierto. RefundObserved/GET ledger incluyen absence_evidence_id sólo prueba verificada. R04 existente por release/deadline/fallo de emisión sigue intacto; extensión de clasificación a barrera ganadora sin venta queda pendiente N1. Nunca evento cancelación automático de ventas previas. AC-SA06/AC-N1.

## N3/N6 — identidad distinta e historial físico

`refund_functional_idx` permanece por order/reason/scope/adjustment; razones distintas generan refund_id/provider_key distintos, nunca se cambia reason anterior. Lock payment_intent antes execution/cycles serializa límite por cobro; otra ORDER no puede entrar si anterior sigue UNKNOWN/INITIATED/CONFIRMED o ausencia no probada. Sólo FAILED_FINAL con FK local a refund_absence_evidence validada permite soltar exclusión monetaria; no basta nombre de estado. Purchases REJECTED sin dispatch no tiene fila execution. CANCEL tras CHANGE rechazado por uso puede ejecutar su identidad distinta si Purchases revalida R05/R07/claims/cleanup; misma identidad sigue ciclos y tres envíos acumulativos. Una total efectiva, no una identidad histórica total que impida R05.

Tabla local **refund_execution_cycle** (no sólo texto «audit»): PK `(refund_id,cycle_version)`, refund_id uuid FK refund_execution NOT NULL, cycle_version bigint NOT NULL>0; reason enum refund NOT NULL, scope ORDER|ADJUSTMENT NOT NULL, adjustment_id uuid NULL sólo ADJUSTMENT, amount numeric NOT NULL>0 scale2, currency char(3) NOT NULL COP, authorized_at timestamptz NOT NULL, guard_version bigint NOT NULL>0, snapshot_digest char(64) NOT NULL regex hex64, scope_snapshot JSONB NULL ORDER R07 obligatorio, adjustment_snapshot JSONB NULL ADJUSTMENT obligatorio, absence_evidence_id uuid NULL, created_at/updated_at timestamptz NOT NULL. CHECK scopes igual Purchases, R04 ambos snapshots null. UNIQUE PK; índice `(refund_id,cycle_version DESC)` y GIN snapshots no null. No FK crossDB adjustment/orden/guard. Insert append-only exacto comando+inbox+execution/job en una tx antes MP; fila execution es puntero/proyección actual, historial no UPDATE/DELETE. Replay idéntico sin inserción, mismo ciclo diferente snapshot/digest/guard/amount→409/incidente/cero red. Ciclo superior requiere prueba/no effect y payload monetario estable; attempt ledger sigue por refund_id, no por ciclo. Retención O/D, sin purge con obligación abierta; initial migration contract, no .sql. `absence_evidence_id` R04 de comando referencia prueba de no venta/no emisión de Purchases/Ticketing (opaca, sin FK Payments); prueba FAILED_FINAL es distinta, monetaria, local refund_absence_evidence. No confundir prueba de ausencia de boleta con ausencia de desembolso. RefundComponent enum NOMINAL|SERVICE|NOMINAL_TAX|SERVICE_TAX; R07 sólo NOMINAL. AC-N3/N6.

## D-N1-01 — autorización y cap R04 (planning)

ExecuteRefundRequestedV1 producer Purchases workload/inbox autorizado es único trigger; R04 exige SYSTEM_R04, ORDER, adjustment_id y ambos snapshots null, prueba no venta/no emisión UUID/version presentes, amount=payment_intent.amount original canónico/COP y cero desembolso previo. No decide eligibility R07 desde payment_intent.state APPROVED ni pide SUPPORT. R07 exige SUPPORT o PRODUCT_OWNER existente, nunca SYSTEM_R04. Invalid/mismatch→conflict/incidente antes red; UNKNOWN/obligación previa bloquea segundo envío ciego. Añadir `authority varchar(20) NOT NULL` SUPPORT|SYSTEM_R04|PRODUCT_OWNER a refund_execution y refund_execution_cycle con CHECK reason R04 iff authority SYSTEM_R04; sin default/backfill, inicial documental futura. Guard/absence de R04 opacos Purchases, no FK crossDB; FAILED_FINAL requiere prueba monetaria local refund_absence_evidence distinta. Snapshot histórico mantiene prueba R04; RefundView actual FAILED_FINAL referencia sólo prueba monetaria, nunca invalida retrospectivamente cobro ni prueba compra.

PKs/índices identity/provider_key/total/attempt permanecen; digest/authority/amount/cycle/guard replay mismatch cero red, mismo id/key/R08≤3 envíos acumulativos/SLA/avisos intactos. Servicio/impuestos no se descuentan de R04; tarifas MP reales DR05 no alteran importe comprador. Retención O/D/no purge abierto. AC-N1 Master§13 y envelope constraint reason/authority, además caps aplicación antes MP. Sin adapter/pago/SQL/test ejecutado.
