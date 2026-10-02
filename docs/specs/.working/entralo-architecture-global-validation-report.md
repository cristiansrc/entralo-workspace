# Spec Validator — validación global arquitectura Entralo (post F-A..F-E, F-F)

- reviewed_at: 2026-10-01
- validator_agent: spec-validator
- verdict: **not ready**
- Raíz: `/mnt/data/Shares/Projects/entralo-workspace/`
- Conjunto rehidratado desde disco: `docs/architecture/{architecture-proposal,decision-summary,architecture-review-request,system-landscape,context-map,integration-map,workspace-mapping}.md`, `docs/architecture/decision-records/ADR-001..006`, `docs/specs/requirements/entralo-v1-requirements-brief.md`, `docs/specs/.working/entralo-architecture-sdd-context.md`, índice `entralo-architecture-planning-context.md`.

## Verificaciones superadas (documental)

- F-F: ADR-002 L3–L4 y ADR-005 L3–L4 → `Estado ADR: proposed`, `Lifecycle status: revision-needed`, `Fecha: 2026-10-01` con proveniencia. **Resuelto.**
- F-1/F-2: propuesta L31/L387 gate `## Human Plan Approval: approved_by_user` nunca saltado; workspace-mapping L3 y ADR-006 L4 normalizados. **Resuelto.**
- Stack fijo (Java21/Kotlin/Boot4.1.1/PostgreSQL/OpenAPI-first Gradle, 6 servicios, SQS/S3/Gateway, Cognito+BFF, Vercel, GitHub) coherente en propuesta §2/§12.
- D-AUTH-01 (propuesta §5 paso 0–1, §7; brief R-03), H-A/emisión 3 intentos 1/5/25s timeout10s, polling +0..+300, D-UNKNOWN-01, D-TIME-01, H-B (§7/§9), H-C, WAF COUNT/no BLOCK (§7.2), Cognito+SES userId/aserción F-A (§7.1), S3/CDN F-C/F-D, RDS compartida §11.1, SES→SNS→SQS F-B: coherentes entre propuesta, ADR-002..005, integration-map I-08/I-24/I-28/L153/L166/L176 y context-map L70.
- No existe heading `Human Plan Approval` en ningún artefacto; ningún ADR `accepted`. La frase «apruebo el diseño» está correctamente acotada (propuesta L31) y no se trata como aprobación de plan.

## Findings

### F-G — high — contract-drift en shared context activo (F-E stale)
- change_type: `mechanical` — route: `spec-remediator` (fuente autoritativa inequívoca: propuesta L9 «Precisión vinculante F-E (sustituye la formalización técnica M-1 anterior)» y ADR-004 L6).
- Evidencia:
  - `docs/specs/.working/entralo-architecture-sdd-context.md` L67: «accepted_at real puede materializar evidencia previa después deadline sobre asignación nunca liberada».
  - Contradice `architecture-proposal.md` L9: «aceptación atómica Purchases con `accepted_at<reconciliation_deadline`… I-28 … no concede aceptación tardía por sello remoto» e `integration-map.md` L166: «accepted_at no puede quedar en/tras deadline para venta nueva pendiente».
  - Mismo archivo L66: «evidencia canónica Payments<deadline» contradice propuesta L9 «`canonical_confirmed_at` es auditoría Payments, no reloj de corte remoto».
  - Mismo archivo L78 y L61 citan «sello I-28» como mecanismo vigente; ADR-004 L42 «No permitir accepted_at postdeadline por sello remoto».
- Cambio requerido: reescribir `## Decisions locked` (bullets D-UNKNOWN-01 y M-1) y `## Validator findings` L78 con la formalización F-E (CAS `accepted_at<deadline` en BD Purchases; canonical_confirmed_at solo auditoría; sin sello remoto); registrar F-A..F-E en `## Validator findings` (hoy solo M-1/M-2/I-1/I-2/I-3).
- Executor risk: el shared context es la autoridad de handoff; un Executor implementaría aceptación post-deadline o comparación con reloj Payments → venta tras deadline / LIBERADA→VENDIDA de facto.

### F-H — medium — redacción ambigua «confirmación canónica antes deadline»
- change_type: `mechanical` — route: `spec-remediator` (fuente: propuesta L9/§5.2, integration-map L166).
- Evidencia: `architecture-proposal.md` L152 «confirmación canónica durable antes reconciliation_deadline aceptan compra», L155 «la confirmación canónica ocurre antes de `reconciliation_deadline`»; `integration-map.md` L32 (I-05) mismo texto. Leído aisladamente equivale al sello Payments (`canonical_confirmed_at`) como comparador, prohibido por L9.
- Cambio requerido: sustituir por «hecho Payments comprometido y CAS de aceptación Purchases con `accepted_at<reconciliation_deadline` (reloj BD Purchases)» o remitir explícitamente a §5.2. Brief no se toca (su redacción es requisito; F-E es su interpretación).
- Executor risk: implementación de la comparación con el timestamp Payments.

### F-I — medium — brief del paquete sin validación vigente
- change_type: `technical-decision` (gate de proceso) — route: `planner`.
- Evidencia: brief L3 `Lifecycle status: planning`/`revision-needed`; L245–L246 `## Spec Validator Approval` / `verdict: invalidated`; L243 «Siguiente acción: Spec Validator review» con índices refresh3 «stale».
- Cambio requerido: Planner debe presentar el brief dentro del paquete re-validado con estado coherente (o declarar explícitamente que el brief se valida en la misma ronda y qué secciones cubre), y actualizar L243 que cita refresh3 cuando el pack está en refresh4 stale.
- Executor risk: paquete de plan apoyado en requisitos con validación invalidada.

### F-J — medium — consulta formal Solution Architect pendiente declarada como gate
- change_type: `architectural-decision` — route: `planner`.
- Evidencia: shared context L12 «Siguiente gate: Spec Validator review global y consulta formal complementaria SA de I-28/principal/quota/rates/RDS/S3»; review-request L42 «Consulta SA/revisión Spec Validator no ejecutadas»; propuesta L430 «consulta formal Solution Architect … pendientes». Informe SA original no en disco; M-3 independiente `unverified-detail` (shared L76).
- Cambio requerido: obtener y persistir el dictamen SA, o que Planner registre explícitamente que no es gate de readiness del plan (decisión de proceso), cerrando M-3 con evidencia o declarándolo fuera de alcance.
- Executor risk: aprobar un paquete cuyos propios artefactos declaran revisión arquitectónica obligatoria pendiente.

### F-K — low — siguiente acción stale en propuesta
- change_type: `mechanical` — route: `spec-remediator`.
- Evidencia: `architecture-proposal.md` L387 «consulta formal Solution Architect sobre D-AUTH-01»; la ronda vigente es F-A..F-E (L430). Review-request L14 «ADR001/006 … no cambiadas en esta ronda» mientras F-2 modificó ADR-006 L4.
- Cambio requerido: alinear L387 con L430; matizar review-request L14 (cambio solo de metadatos F-2).
- Executor risk: bajo; confusión de gate.

### F-L — low — lifecycle heterogéneo de ADRs
- change_type: `mechanical` — route: `spec-remediator`.
- Evidencia: ADR-006 L3 `Lifecycle status: draft`; ADR-002/005 L3 `revision-needed`; ADR-001/003/004 `draft` + `estado de revisión: revision-needed`.
- Cambio requerido: aplicar una convención única (p. ej. `draft` + `estado de revisión: revision-needed`) a los seis ADRs.
- Executor risk: bajo.

### F-M — info/blocker de proceso — pack índice stale y secret scan
- `entralo-architecture-planning-context.md` refresh4 `incomplete`/stale respecto F-A..F-E (shared L10, review-request L44): requiere context-curator antes de cualquier ready.
- **Blocked: secret scan execution unavailable** — este validador no dispone de shell; Gitleaks no ejecutado ni verificado. No se afirma ausencia de secretos. Inspección manual de lectura no detectó valores con forma de credencial (no sustituye scan).

## Remediation Routing

| Finding | Severidad | change_type | Agente |
|---|---|---|---|
| F-G | high | mechanical | spec-remediator |
| F-H | medium | mechanical | spec-remediator |
| F-I | medium | technical-decision | planner |
| F-J | medium | architectural-decision | planner |
| F-K | low | mechanical | spec-remediator |
| F-L | low | mechanical | spec-remediator |
| F-M | process | — | context-curator / orquestador (scan) |

## Verdict

**not ready**. Next action: Planner corrections (F-I, F-J) + spec-remediator (F-G, F-H, F-K, F-L), refresh curator y scan Gitleaks; luego re-validación global. Sin aprobación humana de plan presente ni asumida; sin tasks/implementación/Git.
