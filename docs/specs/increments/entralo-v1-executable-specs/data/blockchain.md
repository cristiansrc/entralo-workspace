# Blockchain — modelo y migration contract

Lifecycle status: `planning`. Owner `entralo_blockchain` app. **Sin API HTTP pública ni privada inventada**: administración/recovery jobs porowner eeventos. common.md normativo. Proveedor/red/finalidad/firmacustodia no asumidos; adapterproductivobloqueado gateCHAIN.

```sql
CREATE TABLE app.anchor_obligation (
 emission_id uuid PRIMARY KEY, proof_reference uuid NOT NULL UNIQUE,
 proof_version bigint NOT NULL CHECK(proof_version>0), commitment char(64) NOT NULL UNIQUE,
 algorithm_version varchar(40) NOT NULL, issued_at timestamptz NOT NULL,
 state varchar(12) NOT NULL CHECK(state IN ('PENDING','BATCHED','CONFIRMED')),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
);
CREATE INDEX anchor_pending_idx ON app.anchor_obligation(created_at,emission_id) WHERE state='PENDING';
CREATE TABLE app.anchor_batch (
 batch_id uuid PRIMARY KEY, intent_id uuid NOT NULL UNIQUE, root char(64) NOT NULL,
 format_version varchar(40) NOT NULL, state varchar(15) NOT NULL
 CHECK(state IN ('PREPARED','UNKNOWN','SUBMITTED','CONFIRMED','FAILED_FINAL')),
 threshold_n integer NOT NULL DEFAULT 100 CHECK(threshold_n>0),
 threshold_t_seconds integer NOT NULL DEFAULT 900 CHECK(threshold_t_seconds>0),
 first_pending_at timestamptz NOT NULL, attempts smallint NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 4),
 chain_id varchar(100) NULL, provider_reference varchar(300) NULL, confirmed_at timestamptz NULL,
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL
);
CREATE TABLE app.batch_member (
 emission_id uuid PRIMARY KEY REFERENCES app.anchor_obligation(emission_id),
 batch_id uuid NOT NULL REFERENCES app.anchor_batch(batch_id), ordinal integer NOT NULL CHECK(ordinal>=0),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL, UNIQUE(batch_id,ordinal)
);
CREATE TABLE app.anchor_attempt (
 intent_id uuid NOT NULL REFERENCES app.anchor_batch(intent_id), attempt_number smallint NOT NULL CHECK(attempt_number BETWEEN 1 AND 4),
 due_at timestamptz NOT NULL, dispatched_at timestamptz NULL, resolved_at timestamptz NULL,
 outcome varchar(20) NOT NULL CHECK(outcome IN ('RESERVED','UNKNOWN','SUBMITTED','CONFIRMED','DEFINITIVE_FAILURE')),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL, PRIMARY KEY(intent_id,attempt_number)
);
```

O todas, sinuser/order/payment/PII/QR/preimage; referenciascadena únicamenteinternas. Batchmembershipunaemissiontotal no dosactivos; failedcycle repairredrivemismointent/batch previaquerynonce/tx, nocreaotraobligación. Merkleformato/modelo rootdocumental propuesto hasta cryptogate, schemaalgorithm_version opaco; N/Tdefaultsapproved primerumbraldesdeprimera pendiente, locksclaimSKIPLOCKED/CAS batchpersistmembersrootintentantesbroadcast. Timeout15s submit/query propuesto/poll1min/recon5min, inicial+3retryintervalos1/5/25min; UNKNOWNconsultaantesretry yno exactlyonetxguarantee. Confirmacionesfinalidadverificadas→CONFIRMEDoutboxproofresult, reorg→PENDING/incidente versiónsuperior, nofundirseconoperativoboleta. Fallo4dead+incidentconobligaciónretendida yproofPENDING, no borraral14dSQS.

V1.0.1__initial_blockchain_schema.sql common+DDL, preparaciónDBsinadapterreal despuésapproval; root/format exactogate antesbroadcast, noFlywayseedschain/pkeys. Acceptance umbral100/15elseconfig, crashatbroadcast/queryack no obligationloss, nooverlappingbatch, expiredSQSrecovery, reorgpending ysinpublicendpoints.
