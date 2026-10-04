# Registro API Governance — Entralo V1

Lifecycle status: `planning`. Fecha: 2026-10-02. Autor: Planner. Tipo: registro de interpretación y cotejo documental focalizado; **no auditoría independiente ejecutada por api-governance-agent**, no parser/lint, no dictamen ready.

## Procedencia y S-01

Informe original no localizado bajo docs del repositorio activo; no se inventa su fecha, firma, contenido ni conclusión. IDs M01–04/F01–05/S01–03 provienen de solicitudes humanas anteriores; no basta esa procedencia para atribuir auditoría técnica propia. S01/S-01: texto original no disponible, estado `unverified-source`, no hallazgo de seguridad específico demostrado. Su ausencia **no es prerrequisito externo exigido por usuario**, ni blocker de planificación; tampoco se declara S01 resuelto o auditado. Revisión actual puede sustituir necesidad de localizar informe histórico, registrando sus hallazgos nuevos con evidencia y autor reales.

## Hallazgos cotejados por Planner

Prefijo absoluto P=`/mnt/data/Shares/Projects/entralo-workspace/docs/specs/increments/entralo-v1-executable-specs/`.

| ID | Evidencia leída / corrección | Estado real |
|---|---|---|
| F02 | P+api/common.yaml AdjustmentSnapshot/AdjustmentItem/AdjustmentPaidAllocation y RefundRequest; events/adjustment-snapshot.v1.schema.json; integration§8; data/purchases§Aclaración | paid_allocation separa pagado/devuelto; mapping stable, límites por componente e idempotencia/409; cotejo documental, revisión independiente pendiente |
| F03 | P+api/catalog.yaml controls/operation; events/change-lifecycle/change-reopen/integration-envelope; integration§7; data/catalog/purchases/ticketing | Solicitud actual corrige sello: registro inicial antes ACK, committed operativo distinto; ACK barrera/reopen propuesta Planner, no nueva regla humana. CANCEL terminal/no auto refund; revisión independiente pendiente |
| S01 | Búsqueda de informe original sin artefacto encontrado | unverified-source, no bloqueo artificial ni cierre atribuido |

## Compatibilidad y revisión siguiente

Se añaden campos requeridos paid_allocation en snapshot y event_version/close_at en eventos: cambio incompatible frente al **borrador documental** anterior, no frente a consumidores desplegados (workspace greenfield sin runtime). Mantener v1 inicial por no publicación/ejecución; antes distribuir congelar set completo. Si aparecen consumidores reales de versión previa, bloquear despliegue y exigir nueva versión contractual mediante Planner; no redrive de mensajes antiguos incompletos ni rellenar importes/timestamps ficticios.

G-OAS pendiente ochoYAML/cinco schemas Master§1: order-scope reemplaza refund-adjustment eliminado. Después sintaxis válida auditoría semántica independiente actual, no editorOpenAPI. Revisar SUPPORTmapping/endpointsadmin/prepareClosing/RefundViewcycles/OrderScopeSnapshot, removalRefundAdjustmentV1+3aliases, ACKstages/version/ambosAPPLIED, releaseguard/absenceproof/cutoffno ventaspostCancel. Cambios incompatibles sólo borradorgreenfield sin consumidores; si aparece uno bloquear v1/nueva versión Planner. Ningún scan/parser/audit simulado; SAchanges-required re-review pendiente,0humanbusinesschoice según tabla consistency.

## Registro de remediación — API Governance actual Changes Required

Fuente: solicitud humana actual H-01 high, M-01…03, L-01…07. Informe independiente titulado `API Governance — Changes Required` **no localizado en disco**; este registro no lo sustituye ni inventa firma/fecha/resultado. Párrafo previo «0humanbusinesschoice» es **histórico**; el estado previo «N1 = una confirmación funcional pendiente» queda **`superseded`**. **Nota local de precedencia:** Master§13 (D-N1-01/AC-N1) y gate-register L56 prevalecen sobre este registro: N1 `specified-awaiting-independent-review` por derivación conservadora R03/R04/R07/R08, sin pregunta ni confirmación pendiente. Findings nuevos no equivalen a códigos M01… históricos. Estado común `specified-awaiting-validation`, sin cierre auditor.

| Finding | Corrección contractual / fuente autoritativa | Estado |
|---|---|---|
| H-01 high | common EventManaged/EventOperationReceipt/EventAccepted, Catalog GET managed draft y Admin list/get/replace; resource_id/event_version o GET operations inequívoco, GET ETag→PUT If-Match. integration§10/Master§11 | Especificado; coherencia admin necesita G-OAS/GOV/Validator antes cierre |
| M-01 | NoStore/NoReferrer headers success+error tickets/PDF/dossier/presign/assets owner+BFF; VerificationUnavailable503 común last_known/status/code/Retry-After | Especificado; sin test de header/caché/runtime |
| M-02 | mp-payment-webhook-v1 allowlist versionada/additionalProperties false; unknown400,409 sólo mismo inbox ID/hash diferente; alerta400; fixtures/mercado-pago seis JSON+README, G-OAS incluido | Especificado; fixtures sintéticas/no sandbox/firma/PCI, DR05 no cerrado |
| M-03 | common x-error-codes registry versión1/ErrorCode cerrado/status mapping/responses específicos y BFF parity | Especificado; lint registry/ref/schema pendiente |
| L-01 | 404 event selectors y reserve owner/canal;429 tickets/PDF/internos Ticketing;400 pagination parejas afectadas | Especificado, inventario independiente pendiente |
| L-02 | plural receipts/dossiers/milestones/canonical-facts/contacts, métodos/DTOs/operationIds intactos | Prepublicación draft, sería breaking si aparece consumidor; bloqueo/versionado entonces |
| L-03 | ServiceRate read/write/envelope idéntico; Money scale2 sin float, fiscal TaxLine distinta por dominio | Especificado, fixtures decimal futura en G-OAS |
| L-04 | EventControl if/then CANCEL prohíbe nuevos términos; CHANGE requiere al menos uno; distinto de actual validación semántica422 | Especificado, validación schema/negativos pendiente |
| L-05 | cuatro reopen tipos en integration§2, producer/consumer/queue/phase/payload/key/retry/failure/monitor §1/7 | Especificado, no evento/workflow nuevo |
| L-06 | once defaults BFF retirados, status conocidos explícitos, drift owner no declarado con incidente y503 sanitizado | Especificado, no catch-all como sustituto; nueva matriz consistency |
| L-07 | freeze/source manifest/bundles externos/byte hashes/scan/review exacto y invalidación al cambiar bytes gate-register | Procedimiento escrito, no freeze/hash/scan ejecutado |

AC-GOV en Master§11 y cotejo actual consistency al final. PCI/PII/no public raw proof/financial decisions intactos; el estado previo «N1 no resuelto por esta solicitud» queda **`superseded`** por la nota de precedencia Master§13 D-N1-01/gate-register L56 (N1 `specified-awaiting-independent-review`, sin confirmación pendiente). Re-auditoría api-governance-agent tras G-OAS real sobre snapshot frozen identificado, luego gates restantes; lifecycle planning/verdict none. No Git/código/scripts/migraciones/boards/tests ni handoff.
