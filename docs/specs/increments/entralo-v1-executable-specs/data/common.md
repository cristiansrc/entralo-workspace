# Modelo transversal y contrato Flyway por owner

Lifecycle status: `planning`. SQL **propuesto documental**, no migration creada/aplicada. PostgreSQL18.x candidato condicionado RDS/pin/JPA/Flyway; schema `app` en seis bases lógicas distintas, owners/roles separados. Ninguna tabla compartida ni FK/joins crossDB. UUID externo a otro owner es referencia opaca no FK distribuida.

## Convenciones y retención

DDL abajo se materializa una vez por DB owner al inicio de V1.0.1, antes del bloque de su archivo. Columnas declaradas NOT NULL salvo NULL explícito (SQL nullable por defecto); DEFAULT no permite null. created_at/updated_at UTC timestamptz en todas tablas de negocio; aplicación actualiza updated_at en misma tx y auditoría, no tiempo negocio por trigger. Append-only evidencia/uso/hito/audit conserva updated_at=created_at. IDs UUID generados servidor, claves BIGINT internas jamás públicas. No soft delete monetario/tombstone/uso; perfiles/eventos lifecyclestatus como desactivación sin borrado físico.

Retención por clases: **O** obligación/ledger/guard/uso/hitos/evidencia/audit sin purga automática, no expiran conTTL/SQS; legal QN05 determina plazo/rights/legalhold antesprod. **D** dedup mínimo técnico60d y siempre mientras obligación/replay autorizado; jamás key monetaria/guard terminal reusable traspurga. **P** PII cifrada por envelopeKMS, acceso propósito/rol, no logs; datos titular sólo solicitud. **T** temporales imágenes24h cleanup sólo quarantine y sin obligación abierta; no elimina evidencia final. Logs técnicos30d propuesta, no retención legal. QN05 abierto no autoriza retener eternamente enprod: gate bloquea producciónPII/purga hasta política firmada. Guard financiero/fence sigue ledger aun seudonimización.

## DDL transversal (propuesta, por cada owner)

```sql
CREATE SCHEMA app;
CREATE TABLE app.idempotency_record (
 principal_id uuid NOT NULL, operation varchar(80) NOT NULL, key uuid NOT NULL,
 payload_digest char(64) NOT NULL, resource_id uuid NOT NULL,
 result_code integer NOT NULL, created_at timestamptz NOT NULL,
 updated_at timestamptz NOT NULL, PRIMARY KEY(principal_id,operation,key)
);
CREATE TABLE app.outbox (
 event_id uuid NOT NULL, destination varchar(100) NOT NULL,
 aggregate_id uuid NOT NULL, aggregate_version bigint NOT NULL CHECK(aggregate_version>0),
 type varchar(100) NOT NULL, payload jsonb NOT NULL,
 state varchar(12) NOT NULL CHECK(state IN ('PENDING','SENT','DEAD')),
 attempts smallint NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 5),
 due_at timestamptz NOT NULL, acknowledged_at timestamptz NULL,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 PRIMARY KEY(event_id,destination), CHECK(jsonb_typeof(payload)='object')
);
CREATE INDEX outbox_due_idx ON app.outbox(due_at) WHERE state='PENDING';
CREATE INDEX outbox_payload_idx ON app.outbox USING gin(payload);
CREATE TABLE app.inbox (
 consumer varchar(100) NOT NULL, event_id uuid NOT NULL,
 business_key varchar(300) NOT NULL, payload_digest char(64) NOT NULL,
 aggregate_version bigint NOT NULL CHECK(aggregate_version>0),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 PRIMARY KEY(consumer,event_id), UNIQUE(consumer,business_key)
);
CREATE TABLE app.durable_job (
 job_id uuid PRIMARY KEY, type varchar(80) NOT NULL, aggregate_id uuid NOT NULL,
 cycle_version bigint NOT NULL CHECK(cycle_version>0), due_at timestamptz NOT NULL,
 state varchar(12) NOT NULL CHECK(state IN ('PENDING','RUNNING','DONE','DEAD')),
 attempts integer NOT NULL DEFAULT 0 CHECK(attempts>=0),
 lease_until timestamptz NULL, lease_owner uuid NULL, fence bigint NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 UNIQUE(type,aggregate_id,cycle_version,due_at),
 CHECK((lease_owner IS NULL)=(lease_until IS NULL)), CHECK(fence>0)
);
CREATE INDEX job_due_idx ON app.durable_job(due_at,job_id) WHERE state IN ('PENDING','RUNNING');
CREATE TABLE app.audit_record (
 audit_id uuid PRIMARY KEY, actor_id uuid NULL, aggregate_id uuid NOT NULL,
 operation varchar(80) NOT NULL, outcome varchar(80) NOT NULL,
 correlation_id uuid NOT NULL, evidence_id uuid NULL, recorded_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
);
CREATE INDEX audit_aggregate_idx ON app.audit_record(aggregate_id,recorded_at);
CREATE TABLE app.incident (
 incident_id uuid PRIMARY KEY, business_key varchar(300) NOT NULL UNIQUE,
 aggregate_id uuid NOT NULL, kind varchar(80) NOT NULL,
 opened_at timestamptz NOT NULL, paging_due_at timestamptz NULL,
 escalated_at timestamptz NULL, resolved_at timestamptz NULL,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
);
```

Payload outbox validado closed JSONSchema antesINSERT; jamás token/PII/QR/preimage/URLbearer, excepto SES **proveedor** separado enACL nooutbox interno. Hash key con payload distinto409/incidente; payloaddigest de pago excluyetoken y PAN; respuesta referenciada recurso minimizaPII, no body sensible guardado. Inbox business_key incluye tipo+aggregate+version+attempt/scope segúnintegration; distintosmensajes mismoefecto conflicto dehash nooverwrite. Outboxdestino fanout una fila cadaowner. Outbox+inbox+efecto/job/audit misma tx; SQSACK despuéscommit. App roles CRUD sóloowner; migrationrole DDL exclusivo.

Jobs claim SKIP LOCKED fila+lease/fence en transacción corta, no mantenertxdurante red. Leasecritical5s/tick1s/dosréplicas, otros30s/tick30s; overdue process latestslot coalesced, noreset base. Fence compare en commit deefecto; workerstale no commit nuevo. Expiraciónlease≠fallonegocio. Índices PK/UNIQUE Btree implícitos, FKlocal índice explícito donde consultado. JSONBGIN conformeestándar; no almacén de JSONs sin contrato.

## Migración inicial y evolución (aplica a seis archivos)

| Fase | Contrato exacto | Acceptance |
|---|---|---|
| Greenfield V1.0.1 | commonDDL+ownDDL una tx PostgreSQL; nombre futuro V1.0.1__initial_owner_schema.sql, no IFNOTEXISTS para ocultardrift; noseedlegal/secrets | DBvacía aplica; segunda validaciónFlyway no reejecuta; checksum invariantes/NOTNULL/FK/CHECK verificadas; producciónJPAvalidate nuncaDDLauto |
| Expand V1.0.2+ | Nuevos campos nullable/nuevatabla compatibles, índiceCONCURRENTLY sólo migrationseparada no transaccional cuando DBpoblada; no editVaplicada | Old/new writers concurrentes compatibles, locks/statementcap yEXPLAIN plan testeados; no índiceconcurrently dentrotx |
| Backfill | Jobowner acotado checkpoint/key/version sin tiempo compra ficticio, sin red bajo locks | Crash/restart idempotente, ledger contraowner no extrapolación de accepted_at |
| Contract nuevaV | Sólo tras dualread compat y consumidores viejos drenados, NOTNULL/checkVALIDATE/FK, drop posteriorautorizado | Inventario/evidencia/inbox exactos y restoreensayado; no downmigrationdestructiva ni Flywayrepair ciego |

Antes Executor: materializar migration real porowner según contrato aprobado, migración testcontainer y Flywayvalidate obligatorias en fase de implementación, nunca ejecutarDDLpropuesto de este workspace automáticamente. Runtime config/scripts fueraalcancePlanner. PostgreSQL enums negocio como CHECKvarchar versionado paraexpand, decisiónexplícita frente nativeenum difícil rollback; no librería enum crossDB.
