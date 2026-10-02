# Global Spec Validation — entralo-architecture tras propagación D-SAR01-CA04

- validator_agent: spec-validator
- reviewed_at: 2026-10-01
- verdict: **not ready**
- Alcance: brief (254 l.), proposal, decision-summary, integration-map, system-landscape, context-map, workspace-mapping, ADR-001…006, architecture-review-request, solution-architect-review, shared context, pack refresh7 (índice no normativo), closure proposal (referencia).
- Informe global previo `entralo-architecture-global-validation-report.md` conservado como histórico, sin editar.

## Conformidad verificada (sin hallazgo)

- Evidencia de aprobación: decisión funcional literal «sí, dale la opción A» (brief L11/L172; shared L79). No se usa como Gate1/plan approval/ready en ningún artefacto.
- Regla CA-04 (brief L43/L44/L149/L150/L162): `payment_approved_at < grace_end_at`; evidencia canónica/durable reconciliada `< grace_end_at+5m`; `accepted_at` post-cutoff admitido; sin confirmación al deadline libera; tardía tras release/deadline → refund R-04/no reconsumo; sin nuevos pagos; TTL20/grace30/UNKNOWN5m intactos; R-07 usa el mismo `payment_approved_at` (L47/L153); 3 intentos emisión → refund (L44/L150/§13.C F-02).
- Lifecycle: brief planning/revision-needed; arquitectura draft; ADR-001…006 `proposed`/draft/revision-needed (L3 de cada uno).
- Enlaces relativos de arquitectura (incluidos BFF/ADR-003 → `../architecture-proposal.md`) resuelven a archivos existentes.
- WAF/Gateway/BFF/S3/SES/SQS/RDS: coherentes entre proposal P1/P7, ADR-002/003/005/006, integration I-17/18/21/25 y landscape (sin ALB público fiscal, SES→SNS→SQS sin fetch de cert, WAF semillas COUNT, RDS Multi-AZ compartida con pools ≤70%).

## Findings

### V-01 — high — contract-drift: workspace-mapping declara CA-04 como no aprobado
- Archivo: `docs/architecture/workspace-mapping.md` L24, string exacto: «delta CA-04 propuesto explícito no brief alterado ni aprobado».
- Conflicto: brief L11 «D-SAR01-CA04 — decisión funcional aprobada (2026-10-01)»; shared L109 prohíbe como estado actual «D-SAR01-CA04 propuesto/no aprobado/no aplicado/…/brief intacto».
- Cambio requerido: WM-04 debe decir «D-SAR01-CA04 aprobada y aplicada al brief (R-03/R-04/CA-03/CA-04), pendiente revisión independiente».
- change_type: mechanical — route: spec-remediator.
- Executor risk: tratar CA-04 como no vigente y aceptar respuesta MP cruda como venta.

### V-02 — high — contract-drift: context-map CM-11 conserva «deltaCA04propuesto»
- Archivo: `docs/architecture/context-map.md` L116, string exacto: «release local/margen5s/deltaCA04propuesto».
- Conflicto: mismo que V-01 (brief L11; shared L109).
- Cambio requerido: sustituir por «D-SAR01-CA04 aprobada/aplicada».
- change_type: mechanical — route: spec-remediator.
- Executor risk: igual que V-01.

### V-03 — high — re-review SA de la materialización actual inexistente
- `solution-architect-review.md` L1–L6 es snapshot previo a correcciones SAR (brief 251 l., pack refresh5); §7.3 (L171) exige resolver o decidir SAR-01 y SAR-02 antes de presentar el plan; §9 (L187–L206) es autoría Planner, sin aval SA. Shared L18/L113 declara la consulta formal SA como requerida. No existe revisión SA fresca de F-E/I-08/I-28/accepted_at post-cutoff/margen5s ni de SAR-02…13 `fixed-in-draft-awaiting-review`.
- Cambio requerido: obtener re-review independiente del Solution Architect sobre el conjunto actual (o decisión explícita documentada del Planner de prescindir, con justificación), antes de nueva validación global.
- change_type: technical-decision — route: planner.
- Executor risk: implementar F-E/I-28 y protocolos SAR con defectos arquitectónicos no revisados que el SA marcó como mayores.

### V-04 — medium — ambigüedad «confirmación MP» vs evidencia durable reconciliada
- `brief` L116 (E-02): «Consulta MP confirma antes del deadline approval `<grace_end_at` → compra/consumo único»; L71 (§6): «`approved` confirmado antes del deadline»; L56: «aprobación MP estrictamente previa y confirmada antes de `reconciliation_deadline`».
- Conflicto: CA-04 L150 «Respuesta MP cruda a +299.999s … sin reconciliación durable previa → no venta»; fronteras L162 «Raw respuesta no confirma venta».
- Cambio requerido: alinear E-02/§6/L56 a «evidencia canónica/durable reconciliada antes del deadline», según CA-04 (fuente inequívoca).
- change_type: mechanical — route: spec-remediator.
- Executor risk: aceptar venta al recibir respuesta MP sin CAS predeadline.

### V-05 — low — referencias «solicitar refresh curator / no ejecutado» obsoletas
- brief L246 «solicitar refresh a context-curator, sin editar pack ni afirmar ejecución»; proposal L50 y L436; landscape L242; decision-summary L18; review-request L10; solution-architect-review §9 L201/L206. Shared L16/L56 registra refresh7 ejecutado.
- Cambio requerido: marcar refresh7 ejecutado (2026-10-01) en esas líneas Planner-owned.
- change_type: mechanical — route: spec-remediator.
- Executor risk: bajo; confusión sobre vigencia del índice.

### V-06 — low — evidencia de aprobación con fuente adicional no literal
- brief L11 «ratificada por la solicitud actual»; L172 «la solicitud actual ratifica la semántica y manda propagación».
- Cambio requerido: dejar como única evidencia de aprobación la respuesta literal «sí, dale la opción A» (2026-10-01); la instrucción de propagación puede quedar como procedencia, no como ratificación.
- change_type: mechanical — route: spec-remediator.
- Executor risk: bajo; ambigüedad de procedencia.

### V-07 — info — pack refresh7 reporta conformidad sin detectar V-01/V-02
- `entralo-architecture-planning-context.md` L5 afirma etiquetas no aprobadas retiradas; WM L24/CM L116 lo contradicen. Pack no normativo; refrescar tras remediación (context-curator).

### V-08 — info — secret scan
- Blocked: secret scan execution unavailable (sin shell/Gitleaks). No se cuenta como blocker de este dictamen; no hay pass. Inspección manual no detectó credenciales en el alcance leído, sin equivaler a scan.

## Remediation Routing

| Finding | change_type | route |
|---|---|---|
| V-01 | mechanical | spec-remediator |
| V-02 | mechanical | spec-remediator |
| V-03 | technical-decision | planner |
| V-04 | mechanical | spec-remediator |
| V-05 | mechanical | spec-remediator |
| V-06 | mechanical | spec-remediator |
| V-07 | info | context-curator (tras remediación) |
| V-08 | info | orquestador con shell |

## Verdict

**not ready** — Next action: Planner corrections (V-03) + spec-remediator (V-01/02/04/05/06), luego re-validación global. No Human Plan Approval, Gate1, descomposición ni ejecución.
