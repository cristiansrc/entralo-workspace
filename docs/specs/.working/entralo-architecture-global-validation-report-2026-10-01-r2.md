# Global Spec Validation (revalidación formal R2) — entralo-architecture

- validator_agent: spec-validator
- reviewed_at: 2026-10-01
- verdict: **not ready**
- Alcance (leído desde disco en esta sesión): brief (254 l.), closure proposal (existencia), shared context (158 l.), pack refresh10 (índice no normativo), architecture-proposal (448), architecture-review-request (53), decision-summary (18), system-landscape (266), context-map (122), integration-map (323), workspace-mapping (24), ADR-001…006, solution-architect-review §§1–10 (344; **no existe §11 ni apéndices**), informe CA04 previo (79). Informes previos conservados sin editar.

## Conformidad verificada (sin hallazgo)

- **V-01** resuelto: `workspace-mapping.md` L24 «D-SAR01-CA04 aprobada funcionalmente por el usuario y propagada/aplicada al brief … aprobación funcional, no plan approval».
- **V-02** resuelto: `context-map.md` L116 sin «deltaCA04propuesto» (grep 0 en `docs/architecture`).
- **V-03** atendido: `solution-architect-review.md` §10 (L212–L344) firmado, «Blockers de arquitectura/diseño: ninguno» (L325).
- **V-04 / SV-R2 / F-3 / RES-04** resueltos: grep `confirmad[oa] antes|confirma antes|confirmation=` = 0 en brief y `docs/architecture`; brief L153 y integration L236 usan «evidencia canónica/durable reconciliada en Purchases antes del deadline».
- **V-06 / RES-03(i)** resueltos: brief L11/L172, proposal L173, ADR-004 L18 = única fuente literal «sí, dale la opción A»; grep «ratificada por» = 0 fuera de reportes.
- **RES-03(ii)/(iii)**: grep «Pack refresh4» y «grants staff» en landscape = 0.
- **F-2** resuelto: proposal L448 «pack curator refresh ejecutado (refresh7/refresh9 …)».
- **F-5** resuelto según shared; SA §10 intacto.
- **Decisiones de usuario**: D-SAR01-CA04 exacta y no reabierta (brief L11/L149/L150/L162; proposal L173/L185; ADR-004 L18/L28; SA §10.4). TTL20/grace30/UNKNOWN5m/R-07/D-AUTH-01 intactos. Sin nueva pregunta de negocio.
- **Lifecycle**: brief `planning`/`revision-needed` (L3) + `verdict: invalidated` (L249); arquitectura `draft`, ADRs `proposed`; ningún `## Human Plan Approval` escrito; sin código/OpenAPI/DDL/tasks.
- Indicio de secretos: grep de patrones (AKIA/ASIA, PRIVATE KEY, ghp_, xox*, APP_USR-, asignaciones password/secret/token/api_key) sobre todo el workspace = 0. **No equivale a scan.**

## Findings

### R2-01 — blocker (proceso) — Gitleaks no ejecutado
- Este agente no dispone de shell ni de Gitleaks; no hay reporte/SARIF en disco. Skill `secret-scanning`: validación final requiere scan; sin herramienta → `Blocked: gitleaks unavailable`. SA §10.9 L329 lo declara blocker de proceso.
- Cambio requerido: orquestador/plataforma con shell ejecuta Gitleaks en modo filesystem (`gitleaks dir` / `--no-git`) sobre la raíz del workspace, registrando sólo comando y resultado (sin valores).
- change_type: technical-decision (ejecución de proceso, no edición documental) — route: planner (coordina con orquestador).
- Executor risk: aprobar plan con un secreto no detectado en specs/ejemplos.

### R2-02 — medium — stale claim: «re-review SA pendiente» contradice SA §10 emitido
- Strings exactos en disco:
  - `decision-summary.md` L18: «Re-review SA y Spec Validator global con brief completo pendientes».
  - `system-landscape.md` L244: «re-review SA cambios/scan autorizado pendientes».
  - `architecture-proposal.md` L391: «con consulta formal SA/scan pendientes según request».
  - `architecture-proposal.md` L395: «consulta formal SA I-08/I-28/F-E/margen5s/protocolos pendiente».
  - `architecture-proposal.md` L438: «re-review cambios/global pendientes».
  - `ADR-004` L28: «re-review SA/Validator pendiente».
  - brief L246: «seguimiento Planner actualizado, re-review SA cambios pendiente».
- Fuente autoritativa inequívoca: `solution-architect-review.md` §10 L212–L344 (firmado L344) y shared L8 «Consulta SA atendida por §10».
- Cambio requerido: sustituir por «re-review SA emitida en `solution-architect-review.md` §10 (2026-10-01); Spec Validator global pendiente». No tocar semántica.
- change_type: mechanical — route: spec-remediator.
- Executor risk: bajo-medio; presentar al usuario un plan cuyo estado de revisión SA es contradictorio.
- (`solution-architect-review.md` §9 L208 es seguimiento histórico Planner; no se reporta.)

### R2-03 — low — stale claim: review-request pide refresh ya ejecutado
- `architecture-review-request.md` L10: «refresh9 es el último snapshot curado … **Solicitar refresh al context-curator** … no afirmar ejecución ni `stale_status: cleared` nuevo»; L41: «refresh del pack por context-curator solicitado tras correcciones posteriores al refresh9».
- Conflicto: shared L10/L24 y pack L5 = refresh10 ejecutado, `stale_status: cleared`.
- Cambio requerido: registrar refresh10 ejecutado (2026-10-01, `stale_status: cleared`) en L10/L41.
- change_type: mechanical — route: spec-remediator.
- Executor risk: bajo.

### R2-04 — info — brief L217 «solicitar refresh al context-curator antes de reutilizarlos»
- Regla general de uso de packs, no claim de estado. Sin acción.

### R2-05 — info — referencia a «SA §11 enmendado» inexistente
- `solution-architect-review.md` termina en §10.10 (L344); no hay §11 ni apéndices. Revisado §10 como vigente. Sin acción salvo que se espere un §11 no entregado.

## Clasificación de residuales SA (RES-01/02/05/06/07)

Ninguno impide diseñar el plan; no bloquean `ready` de arquitectura por sí mismos.

| RES | Ubicación recomendada | Motivo |
|---|---|---|
| RES-01 (Media) barrido I-28 / perfil H-C I-08/I-28 / maxReceiveCount / heartbeat no-op | **Paquete de aprobación del plan de arquitectura**, como residual declarado con criterio obligatorio de spec SDD (o decisión explícita del Planner) | Toca capacidad/recuperación macro de la opción A; el usuario debe verlo al aprobar el plan |
| RES-02 copy aviso R-04 + tablero + medición DR-05 | Spec técnica/requirements SDD posterior (copy funcional → confirmación UX en spec) | Detalle de UX/observabilidad, no estructura |
| RES-05 reuso aserción KMS por (sesión, audiencia) | Spec técnica / bootstrap | Depende de cuotas reales |
| RES-06 «alerta inmediata» = métrica/ticket vs paging | Spec técnica / runbook | Umbral operativo |
| RES-07 test contrato sin callbacks I-08↛I-28/I-24 | Spec técnica (AC CM-07/PLAN-04) | Autoría de AC |

## Remediation Routing

| Finding | change_type | route |
|---|---|---|
| R2-01 | technical-decision (proceso: ejecutar Gitleaks) | planner → orquestador con shell |
| R2-02 | mechanical | spec-remediator |
| R2-03 | mechanical | spec-remediator |
| R2-04 | info | — |
| R2-05 | info | — |
| RES-01 | technical-decision (no bloqueante) | planner (incluir en paquete de plan) |
| RES-02/05/06/07 | technical-decision (no bloqueante) | planner (spec SDD posterior) |

## Verdict

**not ready** — Diseño sin blockers; bloqueo por proceso (Gitleaks no ejecutado) + claims obsoletos R2-02/R2-03. Next action: spec-remediator (R2-02/R2-03) + ejecución Gitleaks filesystem por orquestador; luego revalidación selectiva de esas líneas y del resultado del scan. Sin Human Plan Approval, Gate1, descomposición ni ejecución.
