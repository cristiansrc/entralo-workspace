# Catalog — modelo y migration contract

Lifecycle status: `planning`. Owner `entralo_catalog` app. SQLdocumental propuesto. common.md normativo. P04 diseño físicofiscal aquí **propuesta Planner pendienteconsultaSA/aprobaciónplancontractual**, no impone tasas ni infiere retenciones/precioparafiscal.

```sql
CREATE TABLE app.event (
 event_id uuid PRIMARY KEY, title varchar(200) NOT NULL, starts_at timestamptz NOT NULL,
 venue varchar(300) NOT NULL, status varchar(20) NOT NULL
 CHECK(status IN ('DRAFT','PUBLISHING','PUBLISHED','CLOSING','CANCELLED')),
 version bigint NOT NULL CHECK(version>0), offer_version bigint NOT NULL CHECK(offer_version>0),
 latest_change_at timestamptz NULL, cancelled_at timestamptz NULL,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
);
CREATE INDEX event_public_idx ON app.event(starts_at,event_id) WHERE status IN ('PUBLISHED','CLOSING','CANCELLED');
CREATE TABLE app.offer_version (
 event_id uuid NOT NULL REFERENCES app.event(event_id), version bigint NOT NULL CHECK(version>0),
 service_rate numeric(12,6) NOT NULL DEFAULT 0.15 CHECK(service_rate>=0),
 order_limit integer NOT NULL DEFAULT 8 CHECK(order_limit>0),
 account_event_limit integer NOT NULL DEFAULT 8 CHECK(account_event_limit>=order_limit),
 hold_ttl_seconds integer NOT NULL DEFAULT 1200 CHECK(hold_ttl_seconds>0),
 grace_seconds integer NOT NULL DEFAULT 1800 CHECK(grace_seconds>0),
 cultural_applicable boolean NOT NULL, authorization_reference varchar(200) NULL,
 parafiscal_rate numeric(5,4) NULL, validated_by uuid NOT NULL,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 PRIMARY KEY(event_id,version), CHECK((cultural_applicable AND parafiscal_rate=0.10 AND authorization_reference IS NOT NULL) OR
 (NOT cultural_applicable AND parafiscal_rate IS NULL AND authorization_reference IS NULL))
);
CREATE TABLE app.offer_locality (
 event_id uuid NOT NULL, offer_version bigint NOT NULL, locality_id uuid NOT NULL,
 name varchar(100) NOT NULL, capacity integer NOT NULL CHECK(capacity>0),
 nominal numeric NOT NULL CHECK(nominal>=100000 AND nominal=round(nominal,2)),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 PRIMARY KEY(event_id,offer_version,locality_id),
 FOREIGN KEY(event_id,offer_version) REFERENCES app.offer_version(event_id,version)
);
CREATE TABLE app.fiscal_line (
 event_id uuid NOT NULL, offer_version bigint NOT NULL,
 line_kind varchar(10) NOT NULL CHECK(line_kind IN ('NOMINAL','SERVICE')),
 classification varchar(20) NOT NULL CHECK(classification IN ('TAXABLE','EXCLUDED_476_11','NOT_APPLICABLE')),
 taxable_base varchar(20) NOT NULL CHECK(taxable_base IN ('UNIT_NOMINAL','UNIT_SERVICE')),
 rate numeric(7,6) NOT NULL CHECK(rate BETWEEN 0 AND 1),
 liable_role varchar(100) NOT NULL, qualification_reference varchar(200) NOT NULL,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 PRIMARY KEY(event_id,offer_version,line_kind),
 FOREIGN KEY(event_id,offer_version) REFERENCES app.offer_version(event_id,version),
 CHECK(classification<>'EXCLUDED_476_11' OR (line_kind='NOMINAL' AND rate=0))
);
CREATE TABLE app.event_control (
 closure_id uuid PRIMARY KEY, event_id uuid NOT NULL REFERENCES app.event(event_id),
 version bigint NOT NULL CHECK(version>0), kind varchar(10) NOT NULL CHECK(kind IN ('CHANGE','CANCEL')),
 note varchar(1000) NOT NULL, new_starts_at timestamptz NULL, new_venue varchar(300) NULL,
 purchases_ack_at timestamptz NULL, ticketing_ack_at timestamptz NULL,
  milestone_at timestamptz NULL, state varchar(15) NOT NULL CHECK(state IN ('PREPARING','PENDING','APPLIED','COMPLETED','SUPERSEDED','FAILED')),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
  UNIQUE(event_id,version)
);
CREATE INDEX control_event_idx ON app.event_control(event_id,version DESC);
CREATE TABLE app.asset (
 asset_id uuid PRIMARY KEY, event_id uuid NOT NULL REFERENCES app.event(event_id),
 version bigint NOT NULL CHECK(version>0), upload_intent_id uuid NOT NULL UNIQUE,
 object_key varchar(300) NOT NULL UNIQUE, checksum char(64) NULL,
 byte_size bigint NOT NULL CHECK(byte_size BETWEEN 1 AND 10485760),
 mime varchar(50) NOT NULL CHECK(mime IN ('image/jpeg','image/png','image/webp')),
 state varchar(20) NOT NULL CHECK(state IN ('QUARANTINE','SCANNING','APPROVED','REJECTED')),
 visibility varchar(10) NOT NULL CHECK(visibility IN ('PUBLIC','PRIVATE')),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
);
CREATE INDEX asset_event_idx ON app.asset(event_id,state);
```

event/offer/locality/fiscal/control claseO; assetO final/T quarantine24h. Snapshotsappendonly y exactamente NOMINAL/SERVICE a publicar (validaciónapplication tx, no UNIQUE simulaexistencia). SERVICE sólobaseUNIT_SERVICE/TAXABLE/tasaverificada; nominalexclusión sóloqualification válida, otrasclasificacionesroles/externalverified; cero/porcentaje universalprohibido. Base parafiscal no incorporada alcheckout sin definiciónespecífica ylegal gate; culturalapplicable exigeautorizationantespublish. PublicaciónOfferApplied exactversionantesPUBLISHED; capacidadreduce sóloACKPurchasessi≥obligaciones; nuncaCatalogstock compartido. Cambiofecha/lugar sólocontrolsemánticohito, noPUTpublished.

V1.0.1__initial_catalog_schema.sql common+contrato documental consolidado aquí; no .sql. Expansión futura no cambia snapshots. AC: fiscal faltante422; primer hito UTC BD **al registro, no al ACK**, preparación sin hito; replay mismo sello; imágenes fail-closed.

## Propuesta DRAFT inicial F03/assets — no aplicada

Incluir documentalmente en futura V1.0.1 inicial, no parche de migración aplicada. Retención O para controles, T quarantine24h sin borrar obligaciones/ledger. Las columnas nuevas nullable sólo antes correspondiente fase; application exige versions/refs consistentes antes emisión outbox.

```sql
ALTER TABLE app.event_control ADD COLUMN milestone_version bigint NULL CHECK(milestone_version>0);
ALTER TABLE app.event_control ADD COLUMN target_offer_version bigint NULL CHECK(target_offer_version>0);
ALTER TABLE app.event_control ADD COLUMN reopen_id uuid NULL UNIQUE;
ALTER TABLE app.event_control ADD COLUMN reopen_state varchar(15) NULL
 CHECK(reopen_state IN ('REQUESTED','PREPARED','COMMITTED','OPENED'));
ALTER TABLE app.event_control ADD COLUMN prepared_gate_version bigint NULL CHECK(prepared_gate_version>0);
ALTER TABLE app.event_control ADD COLUMN opened_gate_version bigint NULL CHECK(opened_gate_version>0);
CREATE UNIQUE INDEX control_one_active_idx ON app.event_control(event_id)
  WHERE state IN ('PENDING','APPLIED');
CREATE UNIQUE INDEX control_one_preparing_idx ON app.event_control(event_id)
  WHERE state='PREPARING';
ALTER TABLE app.asset ADD COLUMN upload_expires_at timestamptz NOT NULL;
```

Initial upload_expires_at=created_at+5min immutable; expirado409. CHANGE hito registro, aplicación tras ACK. Control superior sustituye CHANGE activo atómicamente sin esperar ACK (anterior SUPERSEDED, quita predicado índice); CANCELLED terminal. Event.version ETag distinto gate_version. OPENED mueve control a estado final fuera predicado: APPLIED pasa FAILED sólo ante fallo terminal, o nuevo estado COMPLETED según aclaración siguiente.

## Aclaración normativa F03 — registro vs intención y publicación

Contrato inicial sin .sql: event_control/proposal_id=closure_id, expected_event_version bigint NOT NULL>0. close_at/recorded_at/request_event_version/recorded_event_version/milestone_at/milestone_version nullable sólo PREPARING o FAILED previo registro; tras registro todos presentes, request/recorded_version=expected+1, close_at=recorded_at=milestone_at. created_at intención no se iguala artificialmente al registro. committed_* nullable hasta APPLIED; committed_version=recorded_version+1/committed_at>=recorded_at. Sin backfill/default ficticio; FK local event, retención O, ETag event.version. CHECK de estado incluye COMPLETED además de PREPARING/PENDING/APPLIED/SUPERSEDED/FAILED, OPENED o ACK CANCEL→COMPLETED fuera índice activo.

Registro sólo preparación Purchases durable exacta: prepared_gate_version bigint NULL>0/prepared_at timestamptz NULL (requeridos antes registro); reloj BD y hito/version/outbox atómicos. ACK ledger BARRIER purchases_ack_at/ticketing_ack_at ligados recorded_version, APPLIED purchases_committed_ack_at/ticketing_committed_ack_at ligados committed_version. Ambos APPLIED+offer antes reopen. Nuevo CHANGE/CANCEL sustituye anterior sin ACK: superseded_by uuid NULL FK local event_control, superseded_at timestamptz NULL ambos requeridos SUPERSEDED; no borrar milestone ni outbox publicado. Tx orden lock event→control; índices active/preparing/event. Reorder stale control no muta vigente. API operación phase/recorded_at/failure_code derivadas del ledger, SUPERSEDED FAILED CONTROL_SUPERSEDED. Retención O.

CLOSING muestra horario anterior hasta aplicación ChangeCommitted, después nuevo horario sin venta hasta OPENED/PUBLISHED. ACK puede demorar finalización operativa vendedor, nunca registro/ventana: propuesta técnica explícita, no garantía de pausa breve en outage. Migration contract inicial vacío conserva cinco sellos/versiones exactos y ledger ACK; no migration aplicada alterada. AC-F03 consistency/integration normativos: rollback inicial cero hito; rollback aplicación conserva hito y propuesta; ACK tarde no renueva; CANCEL terminal desde inicio.

## N2 — preparación y control activo coexistentes

Los dos índices parciales anteriores sustituyen el predicado que incluía PREPARING: una preparación superior debe coexistir con el control registrado PENDING/APPLIED al que sustituirá. Bajo lock `event` se asigna `control_version=max(version)+1`, se valida If-Match y se crea como máximo una PREPARING. Replay de la misma key conserva closure/version; otra intención mientras exista PREPARING devuelve409 CONTROL_PREPARATION_IN_PROGRESS, sin segunda preparación ni llamada externa. No se marca SUPERSEDED el control registrado al crear intención: conserva hito y ACK históricos. Registro, en una sola tx event→controls por version ascendente, marca el anterior SUPERSEDED y luego mueve PREPARING→PENDING, actualiza evento/hito/outbox. Así el índice activo admite exactamente uno al commit. Rollback mantiene anterior y preparación sin hito nuevo; fallo de preparación no abre ventas. CANCEL superior a CHANGE pendiente usa el mismo protocolo sin esperar ACK anterior; CANCEL registrado sigue terminal. Campos nuevos sin defaults/backfill; FK locales/retención O existentes. AC-N2 en consistency-review; no SQL ejecutado.
