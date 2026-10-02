# Entralo — mapeo objetivo de workspace

- **Lifecycle status:** `draft`; revisión `revision-needed`; fecha 2026-10-01; owner Planner.
- **Estado real:** workspace documental sin Git, sin `projects/` ni repositorios de aplicación verificados. La siguiente tabla es **propuesta**, no carpetas/repos remotos creados. Layout canónico futuro `projects/`, nunca `proyectos/`.

| Proyecto futuro / ruta relativa propuesta | Bounded context / owner técnico propuesto | Estado / remoto |
|---|---|---|
| `projects/entralo-identity/` | Identity / responsable Identity | no creado / por definir |
| `projects/entralo-catalog/` | Catalog / responsable Catalog | no creado / por definir |
| `projects/entralo-purchases/` | Purchases+Inventory / responsable Purchases | no creado / por definir |
| `projects/entralo-payments/` | Payments / responsable Payments | no creado / por definir |
| `projects/entralo-ticketing/` | Ticketing+Validation / responsable Ticketing | no creado / por definir |
| `projects/entralo-blockchain/` | Blockchain Proof / responsable Blockchain | no creado / por definir |
| `projects/entralo-buyer/` | UI+BFF canal buyer / responsable frontend buyer | no creado / por definir |
| `projects/entralo-admin/` | UI+BFF canal admin / responsable frontend admin | no creado / por definir |
| `projects/entralo-platform/` | Terraform/IaC/operación sin dominio nuevo / plataforma | recomendado en plan, no creado / por definir |

**Default seleccionado P:** BFF Kotlin AWS subproyecto repo canal/build-release propios; React+transporte Node/TS mínimo Vercel same-origin firmado OIDC→STS/SigV4 y store DynamoDB por canal ADR003. BFF Node completo/monorepo alternativas no elegidas, dominio real pendiente. Purchases módulos/worker mismo repo/contexto. Ocho repos aplicación+platform recomendados, exactamente seis contexts negocio, ninguno creado ni Git. Propuesta §§7/12 canónica selecciones/roles/contratos futuros.

Cuando se configure repo global de arquitectura, ignorar `projects/*` en su `.gitignore`, subrepos con lifecycle/version propios; sincronización global/local mediante `docs/specs/workspace_changes.md` y contratos versionados. Cada backend futuro posee `docs/api/openapi.yaml`, spec local y migrations propias; APIs/Event schemas de productor son autoridad, workspace indexa versiones y compatibilidad. No fuente duplicada manual global/local.

Deuda técnica futura local `projects/<nombre-real>/docs/specs/technical_debt.md`, consolidación global si existe bypass aprobado; no crear registros ficticios ni tratar decisiones propuestas como deuda. Graphify no activo; activar/actualizar cuando se configure, no inventar grafo de dependencias.

**Acceptance WM-01:** owner/remoto/ruta/estado/contrato futuros no readiness/carpetas creadas. WM-02 global/local concordantes antes gates/sin Git. WM-03 pools/endpoint owner/RDSshared físico sin ACID crossDB. WM-04 SAR-01 Payments evidencia durable/I-08 directo postcommit sin JWS/I-28 ledger no callback, Purchases deadline/CAS-stock reloj único predeadline; D-SAR01-CA04 aprobada funcionalmente por el usuario y propagada/aplicada al brief (R-03/R-04/CA-03/CA-04), pendiente revisión independiente; aprobación funcional, no plan approval. WM-05 SAR-02/05/06 docs<=3MB/body4MB/4.5MBabsoluto por owner/BFF, grandes externos referenciados/sin ALB público/grants, SES policies/IAM/envelope no cert fetch, aserción BFF única propia/freshness60/proactive30/quotas deps; Catalog CDN owner/signer privado sólo restricción. Contratos futuros no creados/CI compatibilidad multi-repo SAR12/proposed/draft sin plan approval.
