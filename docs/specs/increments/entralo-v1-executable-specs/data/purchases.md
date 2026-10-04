# Purchases + Inventory — modelo y migration contract

Lifecycle status: `planning`. Owner `entralo_purchases` app; noBDcompartida. common.md applies. DDLpropuesto noejecutado. Todaqty>0; importesnumeric sin máximocomercial/scale2check; user/event/offerreferenciasexternas opacas.

**N1 vigente:** §D-N1-01 al final supersede «rama propuesta/bloqueada confirmación N1» posterior; Master§13/integration§7.1 normativos. No nueva migración real ni aprobación humana específica.

Delta F-GOAS-03: toda mención posterior a `RefundComponent del OpenAPI` es histórica y queda superseded como fuente de implementación. DTO huérfano retirado sin reemplazo HTTP; autoridad enum: CHECK `refund_component_claim.component` y `events/adjustment-snapshot.v1.schema.json#/$defs/component`, mismos cuatro valores/mapping allocation. AC-N6 intacto, sin columna/migración/claim/digest nuevo; no generar DTO ni campo wire para usarlo. Véase `../api-lint-policy.md` AC-GOAS-03.

```sql
CREATE TABLE app.event_gate (
 event_id uuid PRIMARY KEY, event_lock_key bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
 sale_state varchar(10) NOT NULL CHECK(sale_state IN ('OPEN','CLOSING','CLOSED')),
 close_requested boolean NOT NULL DEFAULT false, close_requested_at timestamptz NULL,
 closure_id uuid NULL, control_version bigint NOT NULL CHECK(control_version>0),
 gate_version bigint NOT NULL CHECK(gate_version>0), offer_version bigint NOT NULL CHECK(offer_version>0),
 terms jsonb NOT NULL, created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 CHECK(event_lock_key>0), CHECK(close_requested=(close_requested_at IS NOT NULL))
);
CREATE INDEX gate_terms_idx ON app.event_gate USING gin(terms);
CREATE TABLE app.inventory (
 locality_id uuid PRIMARY KEY, event_id uuid NOT NULL REFERENCES app.event_gate(event_id),
 capacity integer NOT NULL CHECK(capacity>0), reserved integer NOT NULL DEFAULT 0,
 sold integer NOT NULL DEFAULT 0, version bigint NOT NULL DEFAULT 1 CHECK(version>0),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 CHECK(reserved>=0 AND sold>=0 AND reserved+sold<=capacity)
);
CREATE INDEX inventory_event_idx ON app.inventory(event_id,locality_id);
CREATE TABLE app.account_event_counter (
 user_id uuid NOT NULL, event_id uuid NOT NULL REFERENCES app.event_gate(event_id),
 reserved integer NOT NULL DEFAULT 0 CHECK(reserved>=0),
 confirmed integer NOT NULL DEFAULT 0 CHECK(confirmed>=0),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 PRIMARY KEY(user_id,event_id)
);
CREATE TABLE app.purchase_order (
 order_id uuid PRIMARY KEY, hold_id uuid NOT NULL UNIQUE, user_id uuid NOT NULL,
 event_id uuid NOT NULL REFERENCES app.event_gate(event_id), offer_version bigint NOT NULL,
 reservation_state varchar(12) NOT NULL CHECK(reservation_state IN ('RESERVADA','EXPIRANDO','VENDIDA','LIBERADA')),
 saga_state varchar(30) NOT NULL CHECK(saga_state IN ('PAYMENT_PENDING','ISSUANCE_PENDING','CONFIRMED','ISSUANCE_FAILED_FINAL',
 'COMPENSATION_PENDING_GUARD','ABORTING','REFUND_PENDING','COMPENSATED','MANUAL_RECONCILIATION')),
 quantity integer NOT NULL CHECK(quantity>0), currency char(3) NOT NULL CHECK(currency='COP'),
 total numeric NOT NULL CHECK(total>0 AND total=round(total,2)),
 nominal_total numeric NOT NULL CHECK(nominal_total>0 AND nominal_total=round(nominal_total,2)),
 expires_at timestamptz NOT NULL, grace_end_at timestamptz NOT NULL,
 reconciliation_deadline timestamptz NOT NULL, payment_approved_at timestamptz NULL,
 accepted_at timestamptz NULL, released_at timestamptz NULL, release_reason varchar(80) NULL,
 fence bigint NOT NULL DEFAULT 1 CHECK(fence>0), version bigint NOT NULL CHECK(version>0),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 CHECK(created_at<expires_at AND expires_at<grace_end_at),
 CHECK(reconciliation_deadline=grace_end_at+interval '5 minutes'),
 CHECK((accepted_at IS NULL AND payment_approved_at IS NULL) OR
 (accepted_at IS NOT NULL AND payment_approved_at IS NOT NULL AND accepted_at<reconciliation_deadline AND payment_approved_at<grace_end_at)),
 CHECK(reservation_state<>'VENDIDA' OR accepted_at IS NOT NULL),
 CHECK(reservation_state<>'LIBERADA' OR released_at IS NOT NULL)
);
CREATE INDEX order_owner_idx ON app.purchase_order(user_id,created_at DESC,order_id);
CREATE INDEX order_business_time_idx ON app.purchase_order(event_id,payment_approved_at) WHERE accepted_at IS NOT NULL;
CREATE INDEX order_deadline_idx ON app.purchase_order(reconciliation_deadline,order_id) WHERE reservation_state IN ('RESERVADA','EXPIRANDO');
CREATE TABLE app.order_line (
 line_id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES app.purchase_order(order_id),
 locality_id uuid NOT NULL REFERENCES app.inventory(locality_id), quantity integer NOT NULL CHECK(quantity>0),
 unit_nominal numeric NOT NULL CHECK(unit_nominal>=100000 AND unit_nominal=round(unit_nominal,2)),
 unit_service numeric NOT NULL CHECK(unit_service>=0 AND unit_service=round(unit_service,2)),
 unit_tax numeric NOT NULL CHECK(unit_tax>=0 AND unit_tax=round(unit_tax,2)),
 price_snapshot jsonb NOT NULL, created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 UNIQUE(order_id,locality_id)
);
CREATE INDEX line_locality_idx ON app.order_line(locality_id);
CREATE INDEX line_snapshot_idx ON app.order_line USING gin(price_snapshot);
CREATE TABLE app.payment_permit (
 payment_intent_id uuid PRIMARY KEY, order_id uuid NOT NULL UNIQUE REFERENCES app.purchase_order(order_id),
 gate_version bigint NOT NULL, payment_start_fence bigint NOT NULL CHECK(payment_start_fence>0),
 amount numeric NOT NULL CHECK(amount>0 AND amount=round(amount,2)),
 start_committed_at timestamptz NOT NULL, grace_end_at timestamptz NOT NULL,
 reconciliation_deadline timestamptz NOT NULL, invalidated_at timestamptz NULL,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 CHECK(start_committed_at<grace_end_at), CHECK(reconciliation_deadline=grace_end_at+interval '5 minutes')
);
CREATE TABLE app.payment_acceptance (
 order_id uuid PRIMARY KEY REFERENCES app.purchase_order(order_id),
 payment_intent_id uuid NOT NULL UNIQUE REFERENCES app.payment_permit(payment_intent_id),
 evidence_id uuid NOT NULL, observation_version bigint NOT NULL CHECK(observation_version>0),
 evidence_digest char(64) NOT NULL, payment_approved_at timestamptz NOT NULL,
 reconciled_at timestamptz NOT NULL, sale_authorization_version bigint NOT NULL CHECK(sale_authorization_version>0),
 grace_end_at timestamptz NOT NULL, reconciliation_deadline timestamptz NOT NULL,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 CHECK(payment_approved_at<grace_end_at AND reconciled_at<reconciliation_deadline)
);
CREATE TABLE app.closure_member (
 closure_id uuid NOT NULL, payment_intent_id uuid NOT NULL REFERENCES app.payment_permit(payment_intent_id),
 classification varchar(20) NOT NULL CHECK(classification IN ('SALE','COMPENSATION','UNKNOWN_HOLD','RELEASED')),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 PRIMARY KEY(closure_id,payment_intent_id)
);
CREATE TABLE app.issuance_obligation (
 issuance_id uuid PRIMARY KEY, order_id uuid NOT NULL UNIQUE REFERENCES app.payment_acceptance(order_id),
 cycle_started_at timestamptz NOT NULL, attempts smallint NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 3),
 state varchar(30) NOT NULL CHECK(state IN ('PENDING','ISSUED','UNCERTAIN','FAILED_FINAL','CLOSED')),
 uncertainty_started_at timestamptz NULL, terminal_guard_version bigint NULL,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
);
CREATE TABLE app.issuance_attempt (
 issuance_id uuid NOT NULL REFERENCES app.issuance_obligation(issuance_id),
 attempt_number smallint NOT NULL CHECK(attempt_number BETWEEN 1 AND 3),
 due_at timestamptz NOT NULL, dispatched_at timestamptz NULL, resolved_at timestamptz NULL,
 outcome varchar(30) NOT NULL CHECK(outcome IN ('RESERVED','ISSUED','RETRYABLE_TRANSIENT','NON_RETRYABLE_DEFINITIVE','UNCERTAIN')),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 PRIMARY KEY(issuance_id,attempt_number)
);
CREATE UNIQUE INDEX issuance_one_inflight_idx ON app.issuance_attempt(issuance_id) WHERE resolved_at IS NULL;
CREATE TABLE app.refund (
 refund_id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES app.purchase_order(order_id),
 reason varchar(25) NOT NULL CHECK(reason IN ('EVENT_CANCELLED','EVENT_CHANGED','R04')),
 scope varchar(10) NOT NULL CHECK(scope IN ('ORDER','ADJUSTMENT')), adjustment_id uuid NULL,
 state varchar(20) NOT NULL CHECK(state IN ('REQUESTED','PENDING_GUARD','AUTHORIZED','UNKNOWN','INITIATED','CONFIRMED','FAILED_FINAL','REJECTED')),
 amount numeric NOT NULL CHECK(amount>0 AND amount=round(amount,2)),
 authority varchar(20) NULL CHECK(authority IN ('SUPPORT','SYSTEM_R04','PRODUCT_OWNER')),
 authorized_by uuid NULL, authorized_at timestamptz NULL, milestone_version bigint NULL,
 guard_version bigint NULL, initiated_at timestamptz NULL, confirmed_at timestamptz NULL,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 CHECK((scope='ORDER' AND adjustment_id IS NULL) OR(scope='ADJUSTMENT' AND adjustment_id IS NOT NULL))
);
CREATE UNIQUE INDEX refund_business_key_idx ON app.refund(order_id,reason,scope,adjustment_id) NULLS NOT DISTINCT;
CREATE UNIQUE INDEX refund_one_total_idx ON app.refund(order_id)
 WHERE scope='ORDER' AND state NOT IN ('REJECTED','FAILED_FINAL');
CREATE INDEX refund_due_idx ON app.refund(authorized_at) WHERE state IN ('AUTHORIZED','UNKNOWN','INITIATED');
CREATE TABLE app.invoice_request (
 invoice_request_id uuid PRIMARY KEY, order_id uuid NOT NULL UNIQUE REFERENCES app.purchase_order(order_id),
 holder_ciphertext bytea NOT NULL, state varchar(30) NOT NULL
 CHECK(state IN ('SOLICITADA','EN_GESTION_EXTERNA','EMITIDA_Y_ENVIADA','ERROR_PENDIENTE')),
 external_evidence_ciphertext bytea NULL, verified_by uuid NULL, verified_at timestamptz NULL,
 reviewed_at timestamptz NULL, credit_note_required boolean NOT NULL DEFAULT false,
 version bigint NOT NULL CHECK(version>0), created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 CHECK(state<>'EMITIDA_Y_ENVIADA' OR(external_evidence_ciphertext IS NOT NULL AND verified_by IS NOT NULL AND verified_at IS NOT NULL))
);
CREATE TABLE app.document (
 document_id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES app.purchase_order(order_id),
 kind varchar(20) NOT NULL CHECK(kind IN ('NON_FISCAL_RECEIPT','EXTERNAL_COPY')),
 version bigint NOT NULL CHECK(version>0), object_key varchar(300) NOT NULL UNIQUE,
 byte_size integer NOT NULL CHECK(byte_size BETWEEN 1 AND 3000000), checksum char(64) NOT NULL,
 state varchar(12) NOT NULL CHECK(state IN ('QUARANTINE','APPROVED','REJECTED')),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 UNIQUE(order_id,kind,version)
);
CREATE TABLE app.notification (
 notification_id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES app.purchase_order(order_id),
 type varchar(80) NOT NULL, version bigint NOT NULL CHECK(version>0), user_id uuid NOT NULL,
 state varchar(15) NOT NULL CHECK(state IN ('PENDING','SENT','DELIVERED','SUPPRESSED','DEAD')),
 attempts smallint NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 5), ses_message_id varchar(200) NULL UNIQUE,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL, UNIQUE(order_id,type,version)
);
```

## Consistencia fuerte y ausencia de sobreventa

event_gate términos JSONclosed snapshotOffer version aplicado; todoswriter cooperanadvisoryshared/exclusivo namespaceexclusivo eventadmission/keyuniqueidentity positiva, jamás hashUUID. Admission flag/controllecturasprimarioREADCOMMITTED, no writegatecadareserva. Counter lazyINSERTONCONFLICTnocambiaqty luegoFORUPDATE user/event; inventory locks idsordenados; order/permit alfinal. Enmismatx checks accountreserved+confirmed+qty≤snapshotlimit/capacity, suma líneas=orderqty/total, localidadperteneceevent; actualizaciónstock/counter exactamenteuna. No exclusiónGiST necesaria (noasientos/rangos): PK+rowlocks+CHECK+counters bastan. Counterconfirmadas conserva compras válidas históricas como límiteusuario/event; refund no abre cuota automática (propuesta técnica explícita para revisión; evita inferir reinstalación comercial).

Deadline/release yacceptance misma jerarquíalocks y fence; leer clock_timestamp en sentencianueva traslocks, CASguard<deadline/snapshot/fence y noLIBERADA. Insertacceptance+ordervendida+reserved→sold+counterreserved→confirmed+issuanceobligation/outbox una tx; accepted_at=reconciled_at CASreal, compra sólo trascommit. Checksnotcrossrow reforzadosapplication y testsconcurrencia. Si rollbacksincanonicaldurable predeadline no venta. LIBERADA no cambioaVENDIDA/permitinvalidated irreversible, updated_at no backdating. R04late totalcobrado; issuancefailed liberar inventario vendido sóloguardclosed/noaccessprobado, noestadoMPincierto; preservarregistroventahistórico ycounterconfirmadas. No se borra usohistórico. Scopeajustefinancierolimit conrowlockorder suma refundautorizados/confirmed≤total; rechazoautoriza0. Productowner excepción jamásotro medio.

RetenciónO todas, P invoice/doc/evidence, D commondedup; ningún token/QR/PIIholder enpriceJSON/outbox. Invoiceciphertextplaintextcontenido schemaInvoiceRequest/Evidence; no ownerbindings duplicadas. Receiptgen jobindependiente disponibletrasaceptación sinwaitissued. V1.0.1__initial_purchases_schema.sql común+DDL; aplicarinicialvacío, expandnullable sin rewritinghistoricalpaymenttimestamp. Acceptance EX02–06/08–11/15 + HC01–09/M1; enpin sinenforcementtotal1stx **blockedbootstrap**, noaprobacióninventada.

## Propuesta DRAFT de ampliación inicial — F02/F03 (no migración aplicada)

Contrato documental para futura `V1.0.1__initial_purchases_schema.sql` (todavía no aplicada, por tanto incluir en inicial; no alterar checksum aplicado). No `.sql` materializado por Planner. FK exclusivamente locales, ticket_id referencia externa sin FK. Retención O/D según common: nunca purgar obligación abierta, política legal pendiente.

```sql
CREATE TABLE app.adjustment_snapshot (
 adjustment_id uuid PRIMARY KEY,
 order_id uuid NOT NULL REFERENCES app.purchase_order(order_id),
 version bigint NOT NULL CHECK(version=1),
 currency char(3) NOT NULL CHECK(currency='COP'),
 amount numeric NOT NULL CHECK(amount>0 AND amount=round(amount,2)),
 nominal_total numeric NOT NULL CHECK(nominal_total=amount),
 service_total numeric NOT NULL CHECK(service_total=0),
 nominal_tax_total numeric NOT NULL CHECK(nominal_tax_total=0),
 service_tax_total numeric NOT NULL CHECK(service_tax_total=0),
 snapshot_digest char(64) NOT NULL CHECK(snapshot_digest ~ '^[a-f0-9]{64}$'),
 created_at timestamptz NOT NULL,
 UNIQUE(order_id,adjustment_id)
);
CREATE TABLE app.adjustment_item (
 adjustment_id uuid NOT NULL REFERENCES app.adjustment_snapshot(adjustment_id),
 line_id uuid NOT NULL REFERENCES app.order_line(line_id),
 ordinal integer NOT NULL CHECK(ordinal>0), ticket_id uuid NOT NULL,
 nominal numeric NOT NULL CHECK(nominal>0 AND nominal=round(nominal,2)),
 service numeric NOT NULL CHECK(service=0),
 nominal_tax numeric NOT NULL CHECK(nominal_tax=0),
 service_tax numeric NOT NULL CHECK(service_tax=0),
 refundable_amount numeric NOT NULL CHECK(refundable_amount=nominal),
 created_at timestamptz NOT NULL,
 PRIMARY KEY(adjustment_id,line_id,ordinal), UNIQUE(adjustment_id,ticket_id)
);
CREATE INDEX adjustment_order_idx ON app.adjustment_snapshot(order_id,created_at DESC,adjustment_id);
CREATE TABLE app.refund_component_claim (
 order_id uuid NOT NULL REFERENCES app.purchase_order(order_id),
 line_id uuid NOT NULL REFERENCES app.order_line(line_id),
 ordinal integer NOT NULL CHECK(ordinal>0),
 component varchar(20) NOT NULL CHECK(component IN ('NOMINAL','SERVICE','NOMINAL_TAX','SERVICE_TAX')),
 refund_id uuid NOT NULL REFERENCES app.refund(refund_id),
 amount numeric NOT NULL CHECK(amount>0 AND amount=round(amount,2)),
 state varchar(15) NOT NULL CHECK(state IN ('RESERVED','UNKNOWN','INITIATED','CONFIRMED')),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 PRIMARY KEY(order_id,line_id,ordinal,component)
);
CREATE INDEX refund_component_refund_idx ON app.refund_component_claim(refund_id);
ALTER TABLE app.refund ADD COLUMN version bigint NOT NULL DEFAULT 1 CHECK(version>0);
ALTER TABLE app.refund ADD COLUMN snapshot_digest char(64) NULL CHECK(snapshot_digest ~ '^[a-f0-9]{64}$');
ALTER TABLE app.refund ADD CONSTRAINT refund_adjustment_fk
 FOREIGN KEY(order_id,adjustment_id) REFERENCES app.adjustment_snapshot(order_id,adjustment_id);
ALTER TABLE app.event_gate ADD COLUMN milestone_version bigint NOT NULL DEFAULT 0 CHECK(milestone_version>=0);
ALTER TABLE app.event_gate ADD COLUMN change_recorded_at timestamptz NULL;
ALTER TABLE app.event_gate ADD COLUMN reopen_id uuid NULL;
ALTER TABLE app.event_gate ADD COLUMN reopen_state varchar(15) NULL CHECK(reopen_state IN ('PREPARED','OPENED'));
```

Snapshot/items append-only, nunca UPDATE/DELETE de contenido; versión1 no reemplazable. Application transaction valida line.order_id=adjustment.order_id, ordinal<=line.quantity, ticket refs canónicos, nominal=original unit_nominal, sin repeats y sums del snapshot. Digest RFC8785 sin snapshot_digest. Hasta mapping legítimo verificado no refund ADJUSTMENT; no nueva autoridad/producto. Claim PK impide overlap entre ajustes y total incluso reason/hito distintos; lock orden antes claims. Sólo rechazo preenvío o ausencia monetaria canónica permite eliminar reserva con audit durable, nunca UNKNOWN. R04 total sin emisión no exige ticket_id fabricado, usa line/ordinal snapshot original + guard CLOSED; conserva rule total original y prohíbe duplicar componentes previos.

Refund.snapshot_digest NOT NULL desde REQUESTED congelado en la misma tx de claims; rechazos previos a creación retornan422 sin refund parcial. Refund.version ETag por transición. Gate OPEN sólo CAS control/version/hito/oferta/reopen con ambos ACK APPLIED; OfferApplied no abre. CHECK locales no simulan suma/pertenencia crossrow.

AC-DRAFT: schema vacío materializado por Executor valida PK/FK/CHECK/índices; ajuste ajeno falla; dos scopes simultáneos comparten nominal una sola vez; NULL timestamp/ACK previo pendiente impiden OPEN; importes de servicio/impuestos R07 siempre0. No ensayo ni Flyway ejecutado en esta sesión.

## Aclaración normativa F02/F03 — contrato de migración inicial, 2026-10-02

Los bloques SQL anteriores son propuestas incompletas respecto a los campos siguientes; esta sección los amplía para futura materialización, no escribe ni aplica migraciones. RefundAdjustment lógico usa adjustment_snapshot/adjustment_item, sin tabla alternativa. Se añaden a adjustment_item `paid_nominal`, `paid_service`, `paid_nominal_tax`, `paid_service_tax`, `paid_total`: numeric scale2 no negativos, NOT NULL, sin default ni backfill inventado. paid_total=sum cuatro componentes; paid_nominal=nominal=order_line.unit_nominal. Los otros paid_* corresponden exactamente al snapshot unitario original order_line/PRICE-01; son asignación pagada, no devolución. Transporte items[].paid_allocation usa esos campos; todos participan en digest. Índices existentes adjustment_order_idx y PK/UNIQUE por adjustment+line+ordinal/ticket bastan; FK local line y order con pertenencia validada en tx. No FK crossDB ticket. Cantidad implícita una boleta por item, ordinal<=order_line.quantity, suma items y líneas consistente; refs, montos y digest inmutables.

Claim por componente único conserva estados RESERVED/UNKNOWN/INITIATED/CONFIRMED; autorización conserva RESERVED hasta resultado. Agregado de obligaciones abiertas y confirmadas no supera cada paid_* por boleta, ni quantity*unit_component por línea ni pago canónico orden. Lock order antes claims y límite Payments serializado; nueva identidad/motivo/hito no elude claim. Completar mapping/pago verificables antes guard; defecto/exceso409 y rollback sin outbox monetario. Retención O/D, no purge con obligación abierta ni modificación de snapshots; política legal Q-N05 pendiente. AC: monto original con servicio/impuestos no cero queda visible internamente en paid_* sin ampliar refund R07; dos ajustes solapados jamás comparten claim; solicitud duplicada no nueva reserva.

Mapping fiscal original exacto: order_line.price_snapshot JSON cerrado conserva campos unit_nominal/unit_service/unit_nominal_tax/unit_service_tax/subtotal de PriceEstimate PRICE-01 para esa línea al crear hold. paid_nominal=order_line.unit_nominal=price_snapshot.unit_nominal; paid_service=order_line.unit_service=price_snapshot.unit_service; paid_nominal_tax=price_snapshot.unit_nominal_tax; paid_service_tax=price_snapshot.unit_service_tax; order_line.unit_tax=suma de ambos impuestos. price_snapshot.subtotal=quantity*(suma cuatro componentes), total pagado orden=suma subtotales. No repartir unit_tax agregado por proporción ni recalcular tasas vigentes. Inconsistencia o ausencia de desglose original bloquea mapping409 sin monto supuesto; greenfield debe persistirlo desde primera orden. Sin columnas unit_nominal_tax/unit_service_tax ficticias en DDL anterior, desglose autoritativo JSON existente. AC: impuesto nominal y servicio diferentes conservan exactamente allocation original por ordinal.

event_gate incorpora `recorded_event_version bigint NULL CHECK >0`, `committed_event_version bigint NULL CHECK >0`, `control_close_at timestamptz NULL`; versión inicial/sello requeridos al proyectar ChangeRequested y hito, versión committed requerida antes PREPARED/OPENED. change_recorded_at copia registro inicial, no ACK ni commit de schedule. CAS reopen compara committed_event_version y hito inicial además closure/control/milestone/offer/gate/reopen; no ETag posterior publicación. Retención O, PK event sin índices nuevos/defaults/backfill. AC: ACK/commit operativo no renueva ventana, versión aplicada ausente/divergente no OPEN, replay OPENED no incrementa de nuevo.

Baseline F02 verificado: RefundRequest sólo reason/scope/adjustment_id condicional; purchase_order.order_id del path y idempotency_record (common) ligan principal/operation/key/payload a refund_id; no duplicar order_id ni key en body. UNIQUE(order_id,adjustment_id) de snapshot y refund_component_claim PK por componente son barreras adicionales a identidad funcional R08. Refund parcial significa subset de boletas con nominal completo, no fracción monetaria arbitraria; scope ORDER R07 congela **sólo boletas/componentes restantes elegibles**, excluye nominal ya reservado/devuelto y fees/servicio/impuestos adicionales. Cero restante→409 REFUND_AMOUNT_CONFLICT, no refund de monto0 ni desbloqueo. Ledger auditado nunca borra confirmados. R-13 no figura como requisito del brief leído: no crear fee ni nueva regla fiscal; exclusión vigente R07/R10/PRICE01 y nota externa R09/R12. AC: ajuste2 de8 seguido ORDER cubre6 nominales, sumas≤nominal pagado/reembolsable por boleta y pago orden, sin duplicar los2 anteriores; SUPPORT/medio original intactos.

## Delta SA — origen/ciclos/fence (normativo, planning)

Mapping creado sólo SUPPORT REFUND_APPROVE por API canónica; adjustment_snapshot añade created_by uuid NOT NULL, permission_version bigint NOT NULL>0, source_milestone_version bigint NOT NULL>0 y reason varchar(25) NOT NULL EVENT_CHANGED|EVENT_CANCELLED. Auditoría de origen, no nuevo derecho. Sin claims/guard al crear mapping; REQUESTED reserva bajo lock order→claims y snapshot congelado. Caps existentes intactos.

Identidad refund_business_key_idx **permanente**, incluidos REJECTED/FAILED_FINAL, por `(order_id,reason,scope,adjustment_id)`; refund_one_total_idx sólo excluye terminales sin efecto. Añadir refund.cycle_version bigint NOT NULL>0, cleanup_state varchar(10) NOT NULL NONE|PENDING|COMPLETE, absence_evidence_id uuid NULL referencia opaca al owner de prueba. Historial local refund_cycle PK(refund_id,cycle_version), FK refund; state enum refund, scope_snapshot jsonb NULL (ORDER R07 obligatorio), adjustment_snapshot jsonb NULL (ADJUSTMENT obligatorio), snapshot_digest char64 NOT NULL, milestone_version bigint NULL sólo R04, requested_at timestamptz NOT NULL, authorized_at/rejected_at/closed_at timestamptz NULL, absence_evidence_id uuid NULL, cleanup_state enum NOT NULL, created_at/updated_at NOT NULL. Índice refund_cycle(refund_id,cycle_version DESC); contenido snapshot append-only desde REQUESTED, nunca reescrito al autorizar. Retención O/D. Claimed components activos PK original; eliminación terminal sólo tras audit append-only monto/refs/refund/cycle/absence. Nueva key para la misma identidad tras cleanup completo revalida y reabre **mismo refund_id** con ciclo siguiente; key vieja devuelve resultado anterior. Primer refund.authorized_at inmutable/SLA no reset,3 envíos total por refund_id. Estado CONFIRMED jamás reabre. C2 expiry exclusiva C2+3 meses UTC calendario; C1 vencido no deniega C2 vigente. AC-SA04/AC-N3 consistency normativos.

event_gate añade acceptance_paused boolean NOT NULL default false, prepared_closure_id uuid NULL, prepared_control_version bigint NULL>0, prepared_gate_version bigint NULL>0, prepared_at timestamptz NULL; required juntos si pausa. control_kind varchar(10) NULL CHANGE|CANCEL y cancelled_at timestamptz NULL; CANCEL terminal projection. prepare cierra admisión/CAS locales antes devolver fence, ningún lock de red. Acceptance/release participan barrera local en orden evento→cuenta→stock→orden, CAS relee pausa/control después locks. La barrera drena commits de aceptación previos; no se infiere aceptación a partir de approval. Tras fence no crea payment_acceptance/issuance_obligation para permisos antiguos, incluso approval<T; registro/ACK no reactivan esos permisos. Release/conciliación sin venta siguen clocks originales. Cobro canónico sin venta por barrera: rama propuesta R04 bloqueada por confirmación N1; no emisión ni extensión R07. Control superior sustituye preparación/closure sin OPEN entre ellas; stale commit/reopen no modifica gate. Retención O, PK event basta; AC-N1/SA05.

## N3–N6 — identidad, entrega, aging y snapshots

**Identidad entre motivos (N3).** EVENT_CHANGED y EVENT_CANCELLED son identidades distintas R08; no mutar reason del refund anterior ni reutilizar su key MP. Si CHANGE fue rechazado por uso, posterior CANCEL puede crear otro refund_id con reason CANCELLED (R05), tras cleanup COMPLETE y cero efecto probado del anterior. La misma identidad conserva refund_id/ciclos. El lock order bloquea nueva ORDER mientras otra ORDER tenga cleanup PENDING o dinero RESERVED/UNKNOWN/INITIATED/CONFIRMED. FAILED_FINAL sólo es válido con prueba terminal monetaria; REJECTED implica cero dispatch y cero dinero. El índice parcial no basta: validación bajo lock+claims garantiza una total monetaria por orden, incluidos intentos entre motivos. CONFIRMED permanece en el índice para siempre según retención; ajustes distintos siguen PK componente. No reset de intentos de una identidad; ninguna identidad nueva elude caps.

**Entrega (N4).** `adjustment_snapshot` existente es el almacenamiento del mapping; lookup `adjustment_order_idx` soporta GET propio `/v1/orders/{id}/refund-adjustments`, orden created_at DESC/adjustment_id ASC (ampliar índice a esas columnas), page/size vigentes. Persistir snapshot+audit hace el id consultable inmediatamente, sin depender de email. Sólo orden propia autenticada; snapshot ya existente, sin escritura/claims ni cálculo del buyer. Creación SUPPORT existente conserva reason/source_milestone_version; el mapping de alcance no concede elegibilidad perpetua ni restringe CANCEL por el reason de origen: Purchases revalida el motivo solicitado y último hito/uso actuales R05/R07.

**Aging SUPPORT (N5, propuesta operativa).** `refund_cycle.support_pending_since timestamptz NULL`: requerido para R07 desde REQUESTED, inmutable en el ciclo; NULL para R04. `support_decided_at timestamptz NULL`: sólo decisión SUPPORT durable. Índice parcial `(support_pending_since,refund_id,cycle_version)` WHERE support_decided_at IS NULL AND support_pending_since IS NOT NULL; retención O. Tiempos/alertas en integration §8.2; no expiran solicitud, no aprueban dinero, no amplían elegibilidad.

**History (N6).** `refund_cycle` conserva el snapshot completo exacto ORDER/ADJUSTMENT desde REQUESTED; el mapping original permanece en adjustment_snapshot/item. Añadir `reason varchar(25) NOT NULL` con enum refund, `scope varchar(10) NOT NULL` ORDER|ADJUSTMENT, `adjustment_id uuid NULL` con FK compuesta local al mapping, `amount numeric NOT NULL >0 scale2`, `currency char(3) NOT NULL COP`, `guard_version bigint NULL >0` requerido tras BLOCKED; no defaults/backfill. CHECK de exclusión: ADJUSTMENT→adjustment_snapshot no null/scope_snapshot null/adjustment_id no null; ORDER R07→scope_snapshot no null/adjustment_snapshot null/adjustment_id null; R04→ambos null/ORDER. Snapshot/digest/importe/motivo/alcance/hito/requested_at nunca UPDATE, nuevos ciclos INSERT; state/cleanup/ACK auditados sí progresan. GIN en columnas JSONB snapshot presentes para lookup de refs protegido; no índices crossDB. Versiones y FK garantizan que refund actual apunte a ciclo local existente, inserción ciclo+cambio puntero atómicos. `refund_component_claim.component` enum canónico NOMINAL|SERVICE|NOMINAL_TAX|SERVICE_TAX, igual a RefundComponent del OpenAPI y schema dedicado: R07 sólo crea NOMINAL positivo; otros importes devueltos son cero, nunca claims cero. Digest usa claves de allocation JSON snake_case existentes, no nombres enum en su lugar. AC-N6; materialización inicial futura, sin migración ejecutada.

Precisiones de constraint: CHECK R04 exige adjustment_id NULL; snapshot_digest de ciclo regex hex64. FK `(refund_id,cycle_version)` de refund a refund_cycle **DEFERRABLE INITIALLY DEFERRED** y FK ciclo→refund local, para inserción inicial atómica sin fila incompleta; validar ambos al commit. FK compuesta `(order_id,adjustment_id)` del ciclo requiere `refund_cycle.order_id uuid NOT NULL` FK purchase_order local, igual refund.order_id en tx. Snapshot history no necesita defaults ni backfill greenfield. reason exacto de cancelación es **EVENT_CANCELLED**, no literal CANCELLED (estado evento distinto); nota N3 usa CANCELLED sólo abreviatura semántica. Todos consumidores/índices usan enum exacto.

## D-N1-01 — cobro sin venta y prueba durable (planning)

Ampliación documental **sólo audit_record de Purchases**, porque common.md no tiene columna de payload: añadir `evidence_snapshot jsonb NULL`, sin default; requerida no null por CHECK cuando operation='R04_NO_SALE_PROOF', NULL permitida para auditorías anteriores/otras operaciones. JSON cerrado definido abajo; un objeto por prueba, append-only; sin GIN nuevo (consulta exclusiva por audit_id PK). No asumir que commonDDL de los otros cinco owners ya contiene esta columna. Inicial greenfield la incluye; no .sql ni ALTER ejecutado. `absence_evidence_id` es referencia polimórfica ya existente: **sin FK incondicional a audit_record**, porque FAILED_FINAL usa evidencia monetaria de otro owner. Para prueba R04, aplicación verifica existencia/operation/contenido audit_record local bajo misma tx; monetaria Payments sigue opaca sin FK crossDB.

Sin acceptance commit previo al fence, liberar reserved/account_counter una sola vez, invalidar permit y dejar purchase_order LIBERADA; jamás VENDIDA. UNKNOWN sólo conserva conciliación/deadline original, no un hold de venta reactivable. `purchase_order.payment_approved_at` continúa NULL sin venta según CHECK inicial; approval del cobro se conserva en payment_evidence Payments y audit Purchases, no crear timestamp de compra ficticio ni relajar CHECK. accepted_at NULL y cero payment_acceptance/issuance_obligation. Venta previa durable conserva ambos timestamps y H2.

Prueba no venta/no emisión utiliza `audit_record` común append-only existente, no tabla paralela: `absence_evidence_id` UUID=su audit_id validado en aplicación local; guard_version=versión positiva purchase_order después release/invalidation. Payload cerrado no sensible con order_id/payment_intent_id/closure_id UUID, control_version/payment_start_fence/order_version bigint>0, payment_evidence_id UUID opaco Payments, evidence_digest hex64, amount decimal scale2 COP, currency COP, recorded_at UTC, outcome=NO_SALE_NO_ISSUANCE; campos requeridos no null. No índice nuevo: PK audit_id y FK/index refund_id/cycle_version existentes; refs externos sin FK. Lock/fence y FK obligación→acceptance prueban imposibilidad de emisión futura, no 404 Ticketing. Audit de prueba+release+refund AUTHORIZED SYSTEM_R04+outbox/job atómicos; rollback ninguno. Retención O/D/no purge obligación abierta, legal Q-N05 intacto.

R04 exige scope ORDER/adjustment_id null, snapshots ORDER/ADJUSTMENT null, amount=importe total canónico original sin deducción servicio/impuestos/costos MP; authority SYSTEM_R04 NOT NULL, authorized_by NULL, milestone_version NULL, authorized_at sello primera autorización automática durable. support_pending_since/support_decided_at NULL, cleanup COMPLETE local. CHECK R04 reason/authority/scope/nullability; para R07 authority autorizada SUPPORT o excepción PRODUCT_OWNER existente, nunca SYSTEM_R04. Prueba ausencia NOT NULL al autorizar R04; no prueba monetaria FAILED_FINAL reutilizada. Historial refund_cycle snapshot de prueba/digest/amount inmutable, puntero actual puede identificar posteriormente prueba FAILED_FINAL sin overwrite del ciclo congelado. Identidad/índices/caps/MPkey/retries y avisos no cambian; inicial futura incorpora constraints documentales, sin .sql/default/backfill. AC-N1 Master§13: cobro117850.00 sin venta devuelve117850.00, replay única obligación, UNKNOWN no dinero, acceptance ganadora conserva H2/R07.
