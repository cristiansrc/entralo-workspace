# Ticketing + Validation — modelo y migration contract

Lifecycle status: `planning`. Owner `entralo_ticketing` app. common.md normativo, SQL sólo documental. NoQR/preimage enpayloadoutbox/public/log. Cifrado secreto sóloTicketing; proofreference no referenciaorder pública.

```sql
CREATE TABLE app.event_control (
 event_id uuid PRIMARY KEY, control_version bigint NOT NULL CHECK(control_version>0),
 use_blocked boolean NOT NULL, closure_id uuid NULL,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
);
CREATE TABLE app.issuance_guard (
 issuance_id uuid PRIMARY KEY, order_id uuid NOT NULL UNIQUE, user_id uuid NOT NULL, event_id uuid NOT NULL,
 state varchar(10) NOT NULL CHECK(state IN ('OPEN','ISSUED','CLOSED')),
 sale_authorization_version bigint NOT NULL CHECK(sale_authorization_version>0), payment_start_fence bigint NOT NULL CHECK(payment_start_fence>0),
 version bigint NOT NULL CHECK(version>0), accepted_at timestamptz NOT NULL,
 payment_approved_at timestamptz NOT NULL, grace_end_at timestamptz NOT NULL, reconciliation_deadline timestamptz NOT NULL,
 issued_at timestamptz NULL, closed_at timestamptz NULL,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 CHECK(accepted_at<reconciliation_deadline AND payment_approved_at<grace_end_at),
 CHECK(state<>'ISSUED' OR issued_at IS NOT NULL), CHECK(state<>'CLOSED' OR closed_at IS NOT NULL)
);
CREATE INDEX issuance_owner_idx ON app.issuance_guard(user_id,event_id);
CREATE TABLE app.ticket (
 ticket_id uuid PRIMARY KEY, issuance_id uuid NOT NULL REFERENCES app.issuance_guard(issuance_id),
 order_id uuid NOT NULL, line_id uuid NOT NULL, ordinal integer NOT NULL CHECK(ordinal>0),
 proof_reference uuid NOT NULL UNIQUE, emission_id uuid NOT NULL UNIQUE,
 commitment char(64) NOT NULL UNIQUE, algorithm_version varchar(40) NOT NULL,
 secret_ciphertext bytea NOT NULL, qr_ciphertext bytea NOT NULL,
 verification_digest char(64) NOT NULL UNIQUE,
 operational_status varchar(15) NOT NULL CHECK(operational_status IN ('VIGENTE','UTILIZADA','ANULADA','REEMBOLSADA')),
 proof_status varchar(12) NOT NULL CHECK(proof_status IN ('PENDIENTE','CONFIRMADA')),
 proof_version bigint NOT NULL CHECK(proof_version>0), proof_observed_at timestamptz NULL,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 UNIQUE(order_id,line_id,ordinal)
);
CREATE INDEX ticket_issuance_idx ON app.ticket(issuance_id,ticket_id);
CREATE TABLE app.issuance_attempt_result (
 issuance_id uuid NOT NULL REFERENCES app.issuance_guard(issuance_id),
 attempt_number smallint NOT NULL CHECK(attempt_number BETWEEN 1 AND 3),
 outcome varchar(30) NOT NULL CHECK(outcome IN ('ISSUED','RETRYABLE_TRANSIENT','NON_RETRYABLE_DEFINITIVE','UNCERTAIN')),
 evidence_digest char(64) NOT NULL, created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 PRIMARY KEY(issuance_id,attempt_number)
);
CREATE TABLE app.refund_guard (
  refund_id uuid NOT NULL, cycle_version bigint NOT NULL CHECK(cycle_version>0), order_id uuid NOT NULL, reason varchar(25) NULL,
  state varchar(15) NOT NULL CHECK(state IN ('BLOCKED','REJECTED_USED','RELEASED')),
 control_version bigint NULL CHECK(control_version>0), version bigint NOT NULL CHECK(version>0),
  created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
  PRIMARY KEY(refund_id,cycle_version)
);
CREATE INDEX refund_guard_order_idx ON app.refund_guard(order_id);
CREATE TABLE app.admission_attempt (
 admission_attempt_id uuid PRIMARY KEY, ticket_id uuid NOT NULL REFERENCES app.ticket(ticket_id),
 actor_id uuid NOT NULL, event_id uuid NOT NULL, device_id uuid NOT NULL, payload_digest char(64) NOT NULL,
 decision varchar(20) NOT NULL CHECK(decision IN ('ADMITTED','DENIED_USED','DENIED_BLOCKED','DENIED_EVENT')),
 permission_version bigint NOT NULL CHECK(permission_version>0), incident_id uuid NULL,
 decided_at timestamptz NOT NULL, created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
);
CREATE UNIQUE INDEX one_admission_idx ON app.admission_attempt(ticket_id) WHERE decision='ADMITTED';
CREATE INDEX admission_event_idx ON app.admission_attempt(event_id,decided_at);
```

O todas, P ticketsecrets/QR/actor/usage accesorestringido; verificación pública sólodigestseparadoaleatorio256bit, no secretoQR ni ticketid. Hash commitment dominio+secreto256bitconrevisióncryptoalgorithmversiongate; proof_as_ofrespuesta floor minuto UTCobservación, no issued_atpreciso. Generationsecret+commitment+ticket+guardISSUED+outboxPurchases yBlockchain una tx, ambasobligacionesindependientesdurables. Uniqueorder+lineordinal impideduplicates; claimissuanceguardrowlock serializaconclose, CLOSEDterminal no reopen. Cierredeguardante404 necesitaorder/issuance/saleauthorization conocido parapersistirtombstone, nofalsoausente. EventCANCELcontrol row compartidobajoLOCK compatiblelecturas y exclusivo actualizacionescontrol, luego guardorder/refund luego ticketidsordenados; noadmissionantespermisoactualIdentity fueraDBtx. Guardrefund/use mismajerarquía, ADMITTEDunique; usada porcancelación sípermiteeligibilitysinborraruso, changerejected. Postcancelissuepuede crearboletasANULADA sin access, ventaceptada no refundautomático.

No tablasBlockchainjoin/ FKexternaorder/usuario; ownprojectioncontrol síindexPK. V1.0.1__initial_ticketing_schema.sql común+DDL; futurasexpandalgorithmversion no recomputapruebashistóricas nirotaverificationcodes sincontrato. Acceptance EX06/07/12/13: timeoutguardISSUED recupera, closeganaCLOSEDnoticketstardío; firstuse concurrentuno, knowncanceldenies, reorgpendingestadousointacto; público serialization allowlist exacta, secretQR no exposicióneventoSQS.

## Propuesta DRAFT inicial — guard por alcance F02

```sql
ALTER TABLE app.refund_guard ADD COLUMN scope varchar(10) NULL CHECK(scope IN ('ORDER','ADJUSTMENT'));
ALTER TABLE app.refund_guard ADD COLUMN adjustment_id uuid NULL;
ALTER TABLE app.refund_guard ADD COLUMN snapshot_digest char(64) NOT NULL CHECK(snapshot_digest ~ '^[a-f0-9]{64}$');
ALTER TABLE app.refund_guard ADD CONSTRAINT refund_scope_check CHECK
  ((scope='ORDER' AND adjustment_id IS NULL) OR (scope='ADJUSTMENT' AND adjustment_id IS NOT NULL) OR (state='RELEASED' AND scope IS NULL AND adjustment_id IS NULL));
CREATE TABLE app.refund_guard_ticket (
  refund_id uuid NOT NULL, cycle_version bigint NOT NULL CHECK(cycle_version>0),
 ticket_id uuid NOT NULL REFERENCES app.ticket(ticket_id),
 line_id uuid NOT NULL, ordinal integer NOT NULL CHECK(ordinal>0),
 created_at timestamptz NOT NULL,
  PRIMARY KEY(refund_id,cycle_version,ticket_id), UNIQUE(refund_id,cycle_version,line_id,ordinal),
  FOREIGN KEY(refund_id,cycle_version) REFERENCES app.refund_guard(refund_id,cycle_version)
);
CREATE INDEX refund_guard_ticket_ticket_idx ON app.refund_guard_ticket(ticket_id,refund_id);
```

DDL sólo Markdown, futura inicial no aplicada. FK externos prohibidos, guard refs contra ticket local. Scope/reason/control requeridos en BLOCKED/REJECTED_USED, nullable únicamente RELEASED tombstone anterior aBlock; digest NOT NULL siempre. Membership por ticket/cycle, no bloqueo por mera filaorder; usada fuera no deniegaCHANGE, dentro rechaza completo. SetRefunded exactguard/cycle/digest, conserva uso/prueba. Retención O/P no purge abierto ni backfill inventado; AC scope2de8/replayconflict/ACKincierto sin dinero.

F03 event_control incorpora recorded_event_version/committed_event_version bigint NULL>0, control_kind CHANGE|CANCEL nullable, milestone_at nullable; requeridos al aplicar control excepto committed hasta aplicación. ACK BARRIER/APPLIED+acknowledged_event_version/owner_projection_version exactos. Superior control sustituye CHANGE, nunca CANCEL, stale commit/reopen inerte. Retención O/P/PK event sin FK externa. CHANGE conserva uso, CANCEL use_blocked terminal incluso emisión previa tardía; sin refund automático. **No RefundAdjustmentV1 ni proyección mapping**: guard contiene snapshot completo y valida refs contra ticket local.

## Delta SA — release por ciclo

refund_guard PK(refund_id,cycle_version); released_at timestamptz NULL requerido RELEASED, release_reason varchar(25) NULL enum SUPPORT_REJECTED|ELIGIBILITY_REJECTED|FAILED_NO_EFFECT, absence_evidence_id uuid NULL obligatorio FAILED_NO_EFFECT; snapshot_digest NOT NULL incluso tombstone, guard_version del comando nullable sólo release antes Block. Scope/adjustment nullable únicamente tombstone sin Block; membership congelado si existió. FK guard_ticket compuesta; índices order/ticket locales existentes, retención O/P, no purge/reutilizar tombstone. release serializado con event_control→guard→tickets ordenados, crea tombstone si Block no llegó; stale Block mismo ciclo retorna RELEASED sin acceso bloqueado. Nuevo ciclo sólo después cleanup ACK anterior, guard distinto mismo refund_id. SetRefunded sólo BLOCKED exacto refund/cycle/digest/version. RELEASED no restaura state a VIGENTE: elimina sólo restricción de ese guard; otro guard/CANCEL/uso/refund conservan denegación. No efecto monetario ni autorización SUPPORT desde Ticketing. Retry/outbox §1, ACK durable Released; AC-SA03/04.
