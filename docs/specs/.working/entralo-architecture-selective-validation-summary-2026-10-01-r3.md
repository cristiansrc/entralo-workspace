# SEL-01 — resumen persistido de revalidación selectiva R3

- **Lifecycle status:** `planning`; revisión `revision-needed`; arquitectura `draft`, ADRs `proposed`.
- **Naturaleza:** **resumen persistido de dictamen emitido por Spec Validator en conversación**. No es un dictamen nuevo de Planner ni una reproducción literal de la salida original.
- Fecha del dictamen y de persistencia: **2026-10-01**; hora no disponible, no inferida.
- Agente emisor del dictamen original: **spec-validator**. Responsable de persistir este resumen: **Planner**.
- Fuente conversacional: confirmación explícita de la persona usuaria en la solicitud SEL-01; el dictamen fue emitido inmediatamente antes de actualizar los cinco claims enumerados abajo. La salida original no se persistió en archivo; no se dispone aquí de transcripción literal, identificador de mensaje ni log original verificable.
- Resultado selectivo: **PASS**. **Global validation: `not ready`**; no revisión global en esta ronda.

## Checks del dictamen conversacional

**Namespaces (precisión de procedencia, 2026-10-01):** `histórico:R3-01` es el finding mecánico de claims de scan documentado en el log del shared; no tiene informe original en disco. `SEL-R3:R3-01a…e`, `SEL-R3:R3-02` y `SEL-R3:R3-03` son **checks** del dictamen selectivo resumido aquí. «SEL-01» identifica la persistencia de ese dictamen; no una nueva revisión. No equivalencia, renumeración ni cierre inferidos entre finding y checks, ni entre SEL-R3:R3-02/03 y global R2:R2-02/03. Los IDs cortos de la tabla pertenecen exclusivamente a `SEL-R3`.

| Check | Resultado emitido | Límite de lo persistido |
|---|---|---|
| R3-01a | PASS | Check de la revalidación selectiva R3; no reconstruir su texto literal |
| R3-01b | PASS | Check de la revalidación selectiva R3; no reconstruir su texto literal |
| R3-01c | PASS | Check de la revalidación selectiva R3; no reconstruir su texto literal |
| R3-01d | PASS | Check de la revalidación selectiva R3; no reconstruir su texto literal |
| R3-01e | PASS | Check de la revalidación selectiva R3; no reconstruir su texto literal |
| R3-02 | PASS | Check de la revalidación selectiva R3; no inferir equivalencia con R2-02 |
| R3-03 | PASS | Check de la revalidación selectiva R3; no inferir equivalencia con R2-03 |

La salida explícita confirmó **SAR-14/R2-01/V-08 cerrados formalmente por Spec Validator**, scan **PASS** y lifecycle global **`not ready`**. Se persisten los IDs y resultados comunicados; no se inventan descripciones por check, pruebas adicionales ni cierres de otros findings.

## Evidencia Gitleaks reutilizada del contexto

Fuente en disco: `/mnt/data/Shares/Projects/entralo-workspace/docs/specs/.working/entralo-architecture-sdd-context.md`, registro «Cierre R2-01 / V-08 — evidencia del escaneo real» y fila Gitleaks de `Artifact evidence`; corroboración documental: pack `entralo-architecture-planning-context.md` refresh11 y `/mnt/data/Shares/Projects/entralo-workspace/.gitleaksignore`.

- Ejecución anterior por orquestador con shell, **2026-10-01**; **Gitleaks 8.30.1**.
- Comando registrado, desde `/mnt/data/Shares/Projects/entralo-workspace/`: **`gitleaks dir . --redact`**.
- Modo filesystem, workspace **sin Git**, alcance registrado **1.86 MB**.
- Resultado registrado: **exit 0 / 0 leaks — PASS**.
- `.gitleaksignore`: 13 líneas, un único fingerprint exacto **`docs/architecture/architecture-proposal.md:generic-api-key:293`**; falso positivo clasificado por Security Reviewer. No exclusión de archivo ni desactivación de `generic-api-key`.
- El contexto registra debug con skipping por fingerprint y contraste sin ignore con **exit 1**; valor nunca expuesto, salida redactada.
- **No se ejecutó nuevamente Gitleaks al persistir SEL-01**. Lo anterior es evidencia registrada de la ejecución previa, no un scan nuevo ni certificación del contenido posterior a estas ediciones. No se inventa ruta de reporte JSON/SARIF, log crudo, hash o evidencia adicional.

## SEL-01 — decisión, alternativas e impacto

**Decisión:** persistir con procedencia explícita el cierre selectivo realmente emitido en conversación. La ausencia de un archivo original no se interpreta como ausencia del dictamen; tampoco se convierte el cierre selectivo en aprobación global.

**Alternativas descartadas:** (a) mantener SAR-14/R2-01/V-08 como pendientes de cierre formal, contradiciendo el dictamen comunicado; (b) atribuir a Planner una nueva validación o fabricar salida literal/evidencia; (c) declarar arquitectura `ready` o abrir gates; (d) editar specs técnicas o brief para propagar metadatos, expresamente fuera de alcance.

**Impacto:** el shared context y los documentos de seguimiento usan **«scan SAR-14 PASS / SAR-14/R2-01/V-08 cerrados selectivamente por Spec Validator (2026-10-01); global validation not ready»**. Las cinco ediciones anteriores siguen siendo propagación documental posterior al dictamen, no una segunda revisión independiente de esas ediciones.

## Registro de alineación de claims

Rutas relativas a `/mnt/data/Shares/Projects/entralo-workspace/`; anclas corresponden al estado leído antes de esta persistencia.

| Grupo | Claims | Estado vigente / tratamiento |
|---|---|---|
| Cinco ya actualizados | `docs/architecture/architecture-proposal.md` L420/L438; `docs/architecture/architecture-review-request.md` L31; `docs/architecture/system-landscape.md` L242; `docs/architecture/integration-map.md` L321 | Correctos respecto al cierre selectivo; su referencia al shared ahora tiene respaldo en este resumen. No acreditan global ready ni revisión posterior de las cinco ediciones |
| Seguimiento restante permitido | `docs/architecture/decision-summary.md` L16; `docs/architecture/architecture-review-request.md` L41/L53 | Actualizados directamente y verificados por grep posterior: cierre selectivo formal y global `not ready` |
| Fuentes protegidas, sin editar | `docs/architecture/architecture-proposal.md` L391/L395/L436/L448; `docs/architecture/system-landscape.md` L244/L248; `docs/specs/requirements/entralo-v1-requirements-brief.md` L246 | **Supersedida únicamente su cláusula de proceso «cerrados sujeto a revalidación del validator»**: cierre selectivo ya emitido. Alineación mediante este registro y shared context, sin alterar contenido técnico/funcional ni brief |
| Informes/snapshots históricos | Informes Validator globales R2/CA04/previo; `solution-architect-review.md`; logs de rondas y pack refresh11 | Preservados. Sus menciones de scan/cierre pendiente describen el snapshot anterior, no el estado vigente SAR-14 |

## Limitaciones y criterios de aceptación SEL-01

- [x] Checks R3-01a…e/R3-02/R3-03 y PASS registrados con procedencia conversacional, fecha y alcance selectivo.
- [x] Evidencia Gitleaks limitada al registro existente; sin nueva ejecución ni evidencia inventada.
- [x] SAR-14/R2-01/V-08 cerrados selectivamente; los cinco claims y restantes cubiertos por actualización de seguimiento o supersesión explícita de metadatos protegidos.
- [x] **Global verdict remains `not ready`**; informe global R2 conservado. R3-02/R3-03 no autorizan inferir cierres R2-02/R2-03 ni otros findings no explicitados en la fuente suministrada.
- [x] Sin aprobación de arquitectura, Human Plan Approval, Gate1, handoff, código, Git ni edición de specs técnicas/brief.

Siguiente acción: revisión global de Spec Validator pendiente; solicitar al context-curator actualización del pack con SEL-01 antes de reutilizarlo como índice vigente. Este resumen no finaliza la planificación.

**Nota de seguimiento posterior, Planner2026-10-01 (no cambio de dictamen):** la nueva autorización permite actualizar propuesta §§14/16, mapas/ADRs y brief **sólo L246 de lifecycle**; el grupo «Fuentes protegidas, sin editar» de la tabla anterior describe exclusivamente el alcance de SEL-01, no una prohibición vigente de esta ronda. Nuevas anclas/decisiones están en shared y propuesta §14.1; no atribuir al PASS SEL-R3 revisión de esas ediciones posteriores. Se conserva íntegro el resultado/procedencia selectivos y R2 último global not ready pendiente de nueva revisión.
