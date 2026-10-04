# Identity — modelo y migration contract

Lifecycle status: `planning`. Owner DB lógica `entralo_identity`, schema app. Convenciones/migración/retención y DDL común: `common.md`. No repo/DB/migration ejecutados.

```sql
CREATE TABLE app.user_profile (
 user_id uuid PRIMARY KEY, issuer varchar(300) NOT NULL, subject varchar(128) NOT NULL,
 status varchar(12) NOT NULL CHECK(status IN ('ACTIVE','SUSPENDED')),
 display_name varchar(100) NULL, contact_verified boolean NOT NULL,
 contact_ciphertext bytea NULL, contact_version bigint NOT NULL CHECK(contact_version>0),
 mapping_version bigint NOT NULL CHECK(mapping_version>0),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 UNIQUE(issuer,subject), CHECK(NOT contact_verified OR contact_ciphertext IS NOT NULL)
);
CREATE TABLE app.permission (
 permission_id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES app.user_profile(user_id),
 action varchar(30) NOT NULL CHECK(action IN ('EVENT_ADMIN','REFUND_APPROVE','ADMIT','INVOICE_MANAGE')),
 event_id uuid NOT NULL, device_id uuid NULL, active boolean NOT NULL,
 version bigint NOT NULL CHECK(version>0),
 created_at timestamptz NOT NULL, updated_at timestamptz NOT NULL,
 CHECK(action<>'ADMIT' OR device_id IS NOT NULL)
);
CREATE UNIQUE INDEX permission_scope_idx ON app.permission(user_id,action,event_id,device_id) NULLS NOT DISTINCT;
CREATE INDEX permission_user_idx ON app.permission(user_id,event_id) WHERE active;
```

Bindingissuer/sub autenticado enallowlist, UUID estable server; emailverifiedsólohechoCognito verificado/no bodycliente. user_profileO/P, permissionO; contacctcifrado no cola ni logs; displaynameopcional/no dato fiscal. Revokepermission incrementaversion/outbox/audit local, privilegedauthorize leeprimarioactual antesTicketinguse; sin grantoffline. No tablaCuenta enotrosDB, user_idexternoreferencia noFK. ContactReferenceChanged emisión ContactVersion única; Purchases resolvesólojobavisosautorizado. No endpointescritura depermisos enV1 públicoadmin: bootstrapstaff controloperativoautorizado, requisito de provisioning/rotación pendiente gatego-live no actororganizador.

V1.0.1__initial_identity_schema.sql futuracomún+esteDDL. Expandcontactnuevochannelnullable no obliga buyercolectarPIIextra; purgaQN05 sin romper stablebinding. Acceptance: bindingsconcurrentesmismoiss/sub unoUUID; tokenfalso/claimmismatch401nocuenta; currentpermission revokedniegaadmisión; contactoausente dejaaviso pendientesincompensacióncompra; noemailenSQS.
