# Planning Context Pack: entralo-v1-executable-specs (cobertura de commit / readiness de los 46 artefactos fuera de `feb38aa`)

- generated_at: 2026-10-03 (ISO-8601; sesión `context-curator` sin shell/Git/red)
- source_snapshot: **HEAD = `feb38aabfbccb3f0a7a34586a3706c24320b6691` (`feb38aa`)**, reflog `.git/logs/HEAD` L4; árbol de trabajo = HEAD **+ 46 paths reportados fuera del commit** (no diff-eados con Git por este agente). Commits previos: `55f57d0` → `02fb954` → `232b953` → `feb38aa`. [.git/logs/HEAD: L1–L4]
- pack_status: **`incomplete`** — readiness/versionabilidad **no** pueden afirmarse desde aquí: los diffs de los 2 `modified` no se inspeccionaron, los SHA-256 del manifiesto no se re-hasearon, y G-OAS/G-SCAN/G-API-GOV/G-SA/G-VALIDATOR siguen abiertos.
- refresh_when: cualquier commit nuevo o `git add`/`git restore` sobre las 46 rutas; nueva escritura bajo `docs/specs/increments/entralo-v1-executable-specs/**` o sobre los 2 shared/pack de arquitectura; rehash/remanifiesto del artifact set; cierre o nueva evidencia de G-OAS, G-SCAN, G-SA (verbatim) o G-API-GOV; dictamen `spec-validator`; aparición de `graphify-out/`.
- **Alcance de este pack:** exclusivamente **cobertura de commit + gates que condicionan el dictamen** sobre los 46 artefactos. **No sustituye ni supersede** al pack activo `entralo-v1-executable-specs-planning-context.md` (`refresh #13`, foco G-OAS/tooling), que sigue siendo el índice del incremento. Este pack es índice no normativo.

## Objective and scope

- **Objetivo:** dar a `spec-validator` el contexto mínimo para determinar **(a) readiness y versionabilidad** de los **46 artefactos excluidos del commit `feb38aa`** y **(b) la cadena de gates** que condiciona ese dictamen.
- **46 rutas reportadas por git-executor:** **44 untracked** bajo `docs/specs/increments/entralo-v1-executable-specs/` + **2 modified**: `docs/specs/.working/entralo-architecture-sdd-context.md` y `docs/specs/.working/entralo-architecture-planning-context.md`. [reporte git-executor: sesión; verificación curator abajo]
- **NO corresponde a este pack ni a `context-curator`:** decidir, ejecutar ni recomendar comandos Git; `add`/`commit`/`push`/`restore`; staging; editar specs canónicas, fixtures, código, tests o config; declarar `ready`, PASS o cierre de gates. Git **no fue ejecutado** en esta sesión (sólo lectura de `.git/logs/HEAD` y `.gitignore`).
- **Siguiente validador: `spec-validator`** (`G-VALIDATOR`), condicionado por `G-SCAN` y por la secuencia residual de `gate-register` L60.

## Canonical sources

Prefijo absoluto: `/mnt/data/Shares/Projects/entralo-workspace/`. Este pack es índice; verificar el fragmento citado antes de decidir.

| Fuente | Rol y autoridad | Evidencia / vigencia |
|---|---|---|
| `.git/logs/HEAD` (4 líneas) | **Única evidencia Git leída por curator** (reflog, read-only) | L4: `232b953 → feb38aa`, mensaje `docs(entralo-v1-executable-specs): registrar avance G-OAS en shared, plan y pack`, epoch `1791082756` offset `-0500` (≈2026-10-03 21:59 -0500 / 2026-10-04T02:59Z, **conversión del curator, no verificada con Git**) [.git/logs/HEAD: L4] |
| `.gitignore` (1 línea) | Única regla de exclusión del repo | Contenido = `.playwright-mcp/` → **ninguna de las 46 rutas está ignorada** [.gitignore: L1] |
| `/tmp/opencode/entralo-v1-executable-specs/g-oas-2026-10-03/G-OAS-report.md` (145 líneas, **externo al workspace**) | **Manifiesto del artifact set**: 44 paths con bytes/líneas/SHA-256 | §1 L14–L67: `TOTAL_FILES=44`, **557.866 bytes / 5.202 líneas**, 8 YAML · 5 schemas · 14 MP · 1 matriz · 7 data · 9 MD raíz; matriz **27 casos** re-leída L67. Ruta puede desaparecer → `Blocked: verification evidence unavailable` [informe-GOAS: L16, L18, L67] |
| Glob filesystem 2026-10-03 (`docs/specs/increments/entralo-v1-executable-specs/**`) | Conteo real en disco | **44 archivos, coincidencia 1:1 con el manifiesto** (mismo set de rutas) [glob: 2026-10-03] |
| `docs/specs/increments/entralo-v1-executable-specs/gate-register.md` (60 líneas) | **Definición exacta de gates y secuencia** | L3 lifecycle `planning`; tabla G-SCAN/G-OAS/G-SA/G-CURATOR/G-API-GOV/G-VALIDATOR/G-HUMAN-CONTRACT/N1/DR-05…**L9–L25**; secuencia H02 **L29–L31**; procedimiento bundle/freeze **L41–L48**; `## Estado vigente … refresh#5` **L50–L52**; `## Estado vigente — D-N1-01` **L54–L60 (supersede secciones anteriores)** [gate-register: L3, L54] |
| `docs/specs/increments/entralo-v1-executable-specs/review-request.md` (75 líneas) | Solicitudes formales; define prerrequisitos del validador | Revisión spec-validator **bloqueada** L17–L21; solicitudes vigentes post F-GOAS **L65–L67**; D-N1-01 **L69–L75** [review-request: L17, L65] |
| `docs/specs/.working/entralo-v1-executable-specs-sdd-context.md` (188 líneas) — **shared activo** | Estado/gates/next action del incremento | `## Current status` **L18–L24**; G-OAS L21; G-SCAN L22; G-SA L23; `## Spec Validator Approval` **L91–L102** (`verdict: none` L94); `## Next action` **L142–L148**; `## Fuentes de verdad` **L150–L163**; `## Vacíos y conflictos` **L165–L173**; `## Lane: feature` **L175–L179** [shared: L18, L94, L142] |
| `docs/specs/.working/entralo-v1-executable-specs-planning-context.md` (148 líneas) — **pack activo** | Índice no normativo del incremento | `refresh #13`, `pack_status: incomplete` **L3–L8**; inventario 44 artefactos **L53–L60**; gates **L22** [pack-activo: L3, L7] |
| `docs/specs/.working/entralo-architecture-{sdd-context,planning-context}.md` (121 / 147 líneas) | **Los 2 `modified` reportados**; ambos marcados `HISTÓRICO / superseded` (2026-10-02) | Banner L3 de cada archivo; preservan `## Human Plan Approval: approved_by_user` y el `ready` GLOBAL 2026-10-02 (manifiesto `569945…`) [architecture-sdd: L3, L5, L54–L69] |
| `docs/specs/.working/` resto de packs e informes | Históricos/cerrados; fuera de este alcance | `architecture-global-validation-report*`, `…selective-validation-summary…`, `greenfield-bootstrap`, `visual-proposals-sdd-gate`, etc. [shared: L161] |
| Graphify | **Inactivo** | `graphify-out/` ausente → sin `GRAPH_REPORT.md`, sin `graphify query` [shared: L163] |

## Existing behavior and contracts

- **Commit vigente `feb38aa` (2026-10-03 local):** mensaje «registrar avance G-OAS en shared, plan y pack» → su alcance declarado es el **shared, el plan de tooling y el pack** del incremento, **no** los 44 artefactos canónicos del directorio del incremento. [.git/logs/HEAD: L4]
- **Cambios presentes localmente pero FUERA del commit (46):**
  - **44 untracked** en `docs/specs/increments/entralo-v1-executable-specs/` → `api-governance.md`, `api-lint-policy.md`, `consistency-review.md`, `decomposition-contract.md`, `gate-register.md`, `integration-contract.md`, `master-spec.md`, `review-request.md`, `solution-architect-review.md` (9 MD raíz); `api/{admin-bff,buyer-bff,catalog,common,identity,payments,purchases,ticketing}.yaml` (8); `data/{blockchain,catalog,common,identity,payments,purchases,ticketing}.md` (7); `events/{adjustment-snapshot,change-lifecycle,change-reopen,integration-envelope,order-scope-snapshot}.v1.schema.json` (5); `fixtures/contratos/schema-cases.v1.json` (1); `fixtures/mercado-pago/` (14 = README + 13 JSON). **Set completo = manifiesto §1** [informe-GOAS: L20–L65; glob: 2026-10-03]
  - **2 modified** en `docs/specs/.working/`: `entralo-architecture-sdd-context.md`, `entralo-architecture-planning-context.md` (ambos `superseded`, sólo metadata de lifecycle/histórico; **contenido del diff NO inspeccionado**).
- **Corroboración indirecta (curator sin shell):** HEAD=`feb38aa` (reflog) ✓; las 44 rutas existen en disco y coinciden 1:1 con el manifiesto ✓; ninguna está en `.gitignore` ✓ → «untracked» es consistente, pero **el estado `untracked`/`modified` no fue verificado con `git status` por este agente** (bloqueo de herramienta, no de contenido).
- **Estado SDD del incremento:** lifecycle **`planning`**, **`verdict: none`**, carril **`feature`**; **sin readiness, sin task board, sin handoff a `task-decomposer`/`executor`** [gate-register: L3, L56; shared: L94, L175].
- **El commit `feb38aa` no aporta readiness:** un commit es operación de versionado, no evidencia de gate; `G-VALIDATOR` sigue `verdict: none` [shared: L94; gate-register: L14].

## Decisions locked

- **`context-curator` no ejecuta Git ni decide versionabilidad:** sólo describe el estado reportado y sus fuentes. Ningún `add`/`commit`/`push`, ninguna edición de specs canónicas, fixtures, tests o config [reglas duras curator].
- **N1 = `specified-awaiting-independent-review`** (derivación Master§13), no aprobación humana específica; **Gate1 macro cerrado 2026-10-02, no repreguntar** [gate-register: L5, L56; shared: L106].
- **Etapa A del tooling consumida** (4 GET metadata, 2026-10-03, DevOps); etapa B/transitivos/instalación/corrída G-OAS = `Blocked: requieren aprobación humana nueva`; **Planner excluido de ejecución (`gate-register` L44)** [shared: L44, L167].
- **Freeze/bundle y manifestos:** el procedimiento L07 (manifiesto byte-exacto, digests reales, tooling autorizada) está **especificado, NO ejecutado** [gate-register: L41–L48].
- **Curator sólo escribe en `.working/**`:** este pack es el único artefacto creado en esta sesión.

## Impact map

| Gate | Estado vigente | Depende de / bloqueado por | Rutas de los 46 que toca |
|---|---|---|---|
| **G-SCAN** | Sólo PASS *snapshot initial* 2026-10-02T19:38:15Z (88 archivos, exit0, 0 findings); **rescan final obligatorio** | Freeze previo; **no cubre** bytes posteriores (incl. `feb38aa` y los 44) | **las 46** (scan filesystem `docs/**` incl. `.working/`) [gate-register: L9, L45] |
| **G-OAS** | **ABIERTO / NO cerrado**; corrida 2026-10-03 `Blocked: permission/tool unavailable`; parse auxiliar 8/8 YAML + 19/19 JSON **no es PASS** | Tooling autorizado o corrida externa; rerun sobre bytes actuales | 44 canónicos (8 YAML / 5 schemas / 14 MP / matriz 27 / 9 MD) [shared: L21; informe-GOAS: L8–L9] |
| **G-SA** | **`Blocked: condiciones no verificables`** — verbatim de la re-review `approved` (2026-10-03) **ausente en disco**; `changes-required11` (2026-10-02) intacto | Localizar/recuperar verbatim **o** documentar ausencia y pedir re-review; prerequisito **pre-freeze** | `solution-architect-review.md` [shared: L23, L169] |
| **G-API-GOV** | Pendiente (registro de Planner, no auditoría independiente) | **Sólo después de G-OAS válido** | `api-governance.md` + `api/*.yaml` [gate-register: L13; review-request: L63] |
| **G-CURATOR** | `refresh #13` ejecutado; pack activo **stale por esta escritura y por `feb38aa`** | Actualización única tras último delta | packs `.working/` [pack-activo: L8] |
| **G-VALIDATOR** | **`verdict: none`**; revisión **condicionada a G-SCAN** | Secuencia residual **L60**: re-review SA + G-OAS bytes nuevos → G-API-GOV → curator/freeze → G-SCAN final → **Spec Validator** → si `ready` → `awaiting-human-plan-approval` | artifact set exacto + hashes [gate-register: L14, L60; shared: L94] |
| **G-HUMAN-CONTRACT** | Pendiente, **posterior a `ready`** | Dictamen `ready` del spec-validator | n/a [gate-register: L15] |
| **Externos intactos** | DR-05, DR-07, P-03, P-04, G-CHAIN, G-BOOTSTRAP, G-CAPACITY, Q-N05, G-GO-LIVE | Fuera de este alcance; **no se cierran por commit** | n/a [gate-register: L17–L25] |

## Risks and edge cases

- **Este pack es un artefacto nuevo:** al escribirse añade una **47ª ruta `untracked`** en `docs/specs/.working/` → el set «fuera del commit» deja de ser 46 si se re-lee el estado.
- **Metadata post-freeze:** `gate-register` L46 exige que escrituras de informe/contexto posteriores al freeze se separen del *contract manifest* con **delta explícito, scan acotado resto de hashes igual y aprobación sobre el artifact set identificado** → el commit de este pack (si ocurre) debe tratar ese delta, no mezclarlo con los 44 contratos.
- **Manifiesto potencialmente desactualizado:** los SHA-256/bytes del informe G-OAS son del **2026-10-03** y **no se re-certificaron** aquí; si cualquier uno de los 44 cambió después, el manifiesto miente. Re-hashear antes de freeze [informe-GOAS: L16; shared: L170].
- **Diff de los 2 `modified` desconocido:** sólo se conoce el contenido actual del filesystem (banner `superseded` + registro de `ready` GLOBAL/`232b953`), no **qué cambió** respecto a `feb38aa`. Cualquier cambio que altere bytes contractuales invalidaría el estado; son `.working/**` (metadata), pero debe verificarlo quien ejecute Git.
- **Evidencia externa frágil:** el manifiesto vive en `/tmp/opencode/…`; si desaparece → `Blocked: verification evidence unavailable`, sin reconstruir hashes.
- **Sin `git status` del curator:** afirmar «44 untracked» como hecho propio sería inventar evidencia; se registra como **reporte de git-executor corroborado indirectamente**.
- **Prohibido por `Stale terms guard`:** declarar parsers/lint/validators PASS, `ready`, cierre de G-OAS, o que el commit habilite implementación [shared: L140].

## Conflicts and open questions

1. **Pointer stale en el shared:** `shared` L157 describe el pack como **`refresh #9`, 122 líneas**; el pack real está en **`refresh #13`, 148 líneas** → prevalece el archivo del pack; pointer a corregir en el próximo refresh (curator, no Planner). [shared: L157; pack-activo: L3]
2. **Claim de `source_snapshot` del pack activo superseded:** `pack-activo` L6 afirma «último `232b953` → la re-review SA y la etapa A **no están en ningún commit**»; **`feb38aa` sí commiteó shared+plan+pack** → el claim queda **snapshot-bound pre-`feb38aa`**. [pack-activo: L6; .git/logs/HEAD: L4]
3. **Polaridad fixtures MP:** README = **4 válidos / 9 inválidos** vs «6 previos + 7 negativos» en shared → **prevalece README**; no re-numerar. [shared: L170]
4. **Conteos históricos vs vigentes:** `44/5.079 líneas` y `matriz 21` = pre-delta; vigentes (informe 2026-10-03, **no re-certificados**): **44 rutas / 557.866 bytes / 5.202 líneas / matriz 27**. [gate-register: L5; informe-GOAS: L16]
5. **¿Contenido del diff de los 2 `modified`?** Abierto: requiere lectura de diff por quien ejecute Git; curator sin herramienta.
6. **¿El artifact set bajo `ready` futuro incluye los 44 y los 2 contextos?** El `artifact_set_boundary` de un dictamen previo no se reutiliza por inferencia; el Validator debe **inventariar el set exacto** en su dictamen [gate-register: L46].
7. **Verbatim de condiciones SA ausente** → `Blocked` pre-freeze; pregunta del usuario («¿deberían estar en el repositorio?») **abierta, texto no inventado**. [shared: L169]

## Planner handoff

- **Qué NO puede decidir este pack:** ninguno. **No hay handoff a `task-decomposer` ni `executor`** (sin `ready`, sin task breakdown). El Planner **no** ejecuta Git ni decide staging.
- **Qué debe verificar directamente el receptor:** (a) `git status`/diff real de las 46 rutas (curator no lo aporta); (b) rehash del artifact set contra el manifiesto; (c) los fragmentos citados antes de usarlos.

### Handoff → spec-validator

- **target_agent:** `spec-validator`
- **task_id:** `entralo-v1-executable-specs` (cobertura de commit `feb38aa`)
- **objective:** determinar **readiness y versionabilidad** de los 46 artefactos fuera de `feb38aa` (44 canónicos + 2 contextos `.working`) y su dependencia de gates, **sin ejecutar Git**.
- **must_read:** `docs/specs/increments/entralo-v1-executable-specs/gate-register.md` (L9–L31, L41–L48, **L54–L60**); `docs/specs/.working/entralo-v1-executable-specs-sdd-context.md` (L18–L24, L91–L102, L142–L173); `docs/specs/increments/entralo-v1-executable-specs/review-request.md` (L17–L21, L65–L75); manifiesto `/tmp/opencode/entralo-v1-executable-specs/g-oas-2026-10-03/G-OAS-report.md` §1 (L14–L67); `.git/logs/HEAD`, `.gitignore`.
- **relevant_context:** HEAD=`feb38aa` (2026-10-03 local) = shared+plan+pack; los 44 canónicos **nunca commiteados**; lifecycle `planning`/`verdict: none`/carril `feature`; pack activo `refresh #13` `incomplete`.
- **contracts:** `master-spec.md` (§12 G-OAS, §13 D-N1-01), `api-lint-policy.md` (única fuente normativa G-OAS), `integration-contract.md`, `decomposition-contract.md`, `api/*.yaml` (8), `events/*.v1.schema.json` (5), `fixtures/**` (15), `data/*.md` (7) — **todos dentro de los 44 untracked**.
- **constraints:** **sin Git** (ni staging/commit/push); sin edición de canónicos/fixtures/tests/config; sin declarar PASS/`ready` por el curator; sin inventar hashes ni diffs; metadata post-freeze con delta explícito + scan acotado (gate-register L46).
- **allowed_scope:** lectura de filesystem y de rutas `.working/**`/incremento; elaboración del dictamen **una vez** cumplida la secuencia L60.
- **out_of_scope:** ejecución de gates (G-OAS/G-SCAN/G-API-GOV), instalación de tooling, descomposición/implementación, cierre de gates externos (DR-05/DR-07/P-03/P-04/go-live).
- **edge_cases:** manifiesto externo desaparecido; SHA-256 desfasados; diff de los 2 `modified` con bytes contractuales; este pack como 47ª ruta untracked; escritura posterior al freeze.
- **verification:** `git status`/diff real (fuera de este agente) + rehash del set + relectura de los fragmentos citados.
- **blockers:** **G-SCAN final no ejecutado** (initial no cubre estos bytes); **G-OAS abierto**; **G-SA `Blocked: condiciones no verificables`**; **G-API-GOV pendiente**; **verificado `verdict: none`**; curator sin shell/Git → `source_snapshot` parcial.
- **routing_reason:** existen specs locales del incremento y un reporte de estado de commit que requiere dictamen de consistencia/readiness → `spec-validator` (no `planner`, no `executor`). **Si el estado fuera `awaiting-human-plan-approval`/`awaiting-human-qa-approval`: detenerse y pedir aprobación humana — hoy aplica `G-HUMAN-CONTRACT` *posterior* a `ready`, aún no alcanzado.**
