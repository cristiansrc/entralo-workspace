# Planning Context Pack: entralo-v1-executable-specs

- generated_at: 2026-10-08 — refresh **#81** (`context-curator`), reconstruido desde el `shared` **222 l. (18ª escritura)** + `gate-register.md` **121 l.** con citas **L3, L11, L12, L15–L17, L35, L46–L50, L95–L121**. **Estado POST Spec Validator: `verdict: ready` (2026-10-08) · lifecycle `awaiting-human-plan-approval` en `shared` y `gate-register`.** **Escritura de esta sesión: SÓLO este pack (#81); SIN EJECUCIÓN** (sin shell/Git/gitleaks/freeze/tests/red) `[shared: L3, L129–L134, L180; gate-register.md: L3, L16, L17, L35, L50]`. **⚠ Este write es POST-rescan → ENTRA en el delta del rescan final.**
- source_snapshot: `0d71d28b34fefc2ecb84c57d748f3fe79545aca5` (HEAD `master` declarado en #77; **NO re-verificado hoy**, sin Git; `tools/` sigue sin versionar) `[pack #79, historia]`.
- shared_context: `docs/specs/.working/entralo-v1-executable-specs-sdd-context.md` — **222 l., 18ª escritura**; nota `ready` **L3** · §Estado vigente **L40** · §Gates **L53, L55–L58** · §Spec Validator Approval **L126–L141** · §Next action **L180** `[shared: L3, L40, L126–L141, L180]`.
- pack_status: `incomplete`
- refresh_when: ejecución/resultado del **rescan acotado final**; respuesta del usuario al **Gate humano contractual**; cualquier escritura nueva bajo `docs/` (rompería de nuevo pre=post); pérdida de evidencia `/tmp/opencode/`. **No refrescar por nits** `[gate-register.md: L35, L50]`.

## Objective and scope

- **OBJETIVO: (a)** congelar el estado **post-`verdict: ready`**; **(b)** fijar el alcance del **rescan acotado final** exigido por las escrituras post-rescan (shared + gate-register L3 + este pack) frente a la **base rescan `g-scan-rescan-20261008T023819Z`**; **(c)** dejar como **única acción humana pendiente** el **Gate contractual (G-HUMAN-CONTRACT)**. **Sin ejecución, sin editar canónicos, sin cerrar gates, sin enrutar a robots.** `[gate-register.md: L35, L50; shared: L3, L180]`
- **BASE A MANTENER (no reabrir):** **(1) G-OAS PASS** — run `20261007T235900Z-consolidated`, `overall: G-OAS_PASS`, 12/12, snapshot `535f671b…0b3b1`, driver `b42e2f56…2adf4` `[gate-register.md: L12]`; **(2) G-API-GOV PASS** — informe independiente sobre ese snapshot, 105 `operationId`, 10 `ignore`s, 1 `low`/nit DEFERRED, `Needs confirmation:` fecha/ruta `[gate-register.md: L15]`.
- **(3) G-SCAN = PASS final run D + rescan acotado PASS:** bundle `/tmp/opencode/entralo-v1-executable-specs/g-scan-final2-20261008T005449Z/`, `freeze_id` `FZ-entralo-v1-executable-specs-g-scan-final2-20261008T005449Z`, `generated_at` `2026-10-08T00:55:54Z`, `exit_code=0`, 0 findings, pre/post idénticos **SHA-256 `7ec934614348c4b72492bbd5e261fa5b72489754ed9ddc1be1e6c90b2b5d99d2`** (1853 entradas = 1850 regulares + 3 symlinks); **rescan acotado PASS `g-scan-rescan-20261008T023819Z`** (delta 3 rutas, resto 1850 byte-idéntico, gitleaks 8.30.1 exit 0 / 0 findings, manifest actual pre==post `6c924a772d16e904f12f6d669300d6a2db9ca2a16cb044dc783dc89fb0110181`) `[gate-register.md: L11, L16; shared: L55, L57]`.
- **(4) G-VALIDATOR = `ready` exacto:** `verdict: ready` · `reviewed_at: 2026-10-08` · `validator_agent: spec-validator` · `invalidated_by_changes_since: none` (no `ready with minor changes`); F1+F2+F3 revalidados `[gate-register.md: L16; shared: L129–L134]`.
- **(5) Secuencia restante:** rescan acotado final → **Gate humano contractual en el chat** → sólo tras respuesta explícita del usuario (`## Human Plan Approval: approved_by_user`) → `task-decomposer` `[shared: L141, L180; gate-register.md: L17]`.
- **Fuera de alcance:** cualquier ejecución, edición de canónicos/contratos/OpenAPI, cierre de gates, reapertura de hallazgos cerrados/DEFERRED, `executor` de producto.

## Canonical sources

Prefijo `docs/specs/increments/entralo-v1-executable-specs/`. Root `/mnt/data/Shares/Projects/entralo-workspace/`.

| Fuente | Rol / autoridad | Vigencia (leída 2026-10-08) |
|---|---|---|
| `gate-register.md` (**121 l.**) | **Autoridad de gates**: lifecycle **L3** · G-SCAN **L11** · G-OAS **L12** · G-API-GOV **L15** · G-VALIDATOR **L16** · G-HUMAN-CONTRACT **L17** · regla re-scan acotado **L35** · procedimiento freeze **L46–L50** · **§Adjudicación F-2 L95–L121** | citado por lectura directa `[gate-register.md: L3, L11, L35, L46–L50, L95–L121]` |
| `api-lint-policy.md` · `api-governance.md` | Normativa G-OAS + resumen GOV | sincronizados, PASS 2026-10-07 `[gate-register.md: L12, L15]` |
| `master-spec.md` §6.1/§11–§14 · `review-request.md` | Contratos/macro; frases fechadas «G-OAS pendiente» = históricas | vigentes con precedencia `[gate-register.md: L5, L7]` |
| Artifact set **45 rutas** (`api/*.yaml` 8 · `events/` 5 · `data/` 7 · `fixtures/**` 15 · 10 md raíz) + 3 registros | **Contract set** (selector C = **47**); byte-idénticos al freeze run D | **no tocados desde el freeze** (a verificar por el rescan) `[gate-register.md: L108, L111]` |
| `.working/entralo-v1-executable-specs-sdd-context.md` (222 l., 18ª) | Estado `ready`/gates/F1-F3/secuencia — índice, no spec | vigente `[shared: L3, L180]` |
| Evidencia externa `/tmp/opencode/...` | Runs G-OAS + run D + rescan 20261008T023819Z → si falta: `Blocked: verification evidence unavailable` | volátil, retener `[shared: L120]` |
| `tools/goas/**` (sin versionar) | Runner 12 `lib/*.mjs`, 25 suites, **180/180 = verde de código, no gate** | FS sin diff Git `[shared: L40–L46]` |
| Graphify | **Inactivo** (`graphify-out/` no existe) → sin `GRAPH_REPORT.md`, sin `graphify query` | verificado `[shared: L44, L114]` |

## Existing behavior and contracts

- **Estado:** lifecycle **`awaiting-human-plan-approval`** (en `shared` **y** en `gate-register.md` L3), **`verdict: ready`** (2026-10-08), lane **`feature`** `[shared: L3, L40, L108; gate-register.md: L3, L16]`.
- **G-VALIDATOR CERRADO con `ready`:** dictamen exacto sobre artifact set identificado (45 rutas + shared + pack = C=47, disjunto de B=15); `invalidated_by_changes_since: none`; evidencia = bloque `## Spec Validator Approval` verbatim en el shared (L129–L134) `[gate-register.md: L16; shared: L126–L135]`.
- **F1 / F2 / F3 = VALIDADOS** por `spec-validator` 2026-10-08: F1 = fila G-SCAN cita el run D correcto · **F2 `D-F2-01`** (manifiesto unificado, C=47/B=15 disjuntos, 28/28 byte-exact, AC-F2-01..04 pass) · **F3 conservado no bloqueante** (digest histórico `c66a000f…` = `Needs confirmation:`; `.gitleaksignore` vigente pre=post `6a5b7e7314004cc1ec16816e57627e5d64d0c71f81f3b1caa2336cd9e218cd3b`, 2033 B, intacta) `[shared: L3; gate-register.md: L95–L121]`.
- **G-OAS PASS + G-API-GOV PASS** — ver Objective (1)(2); **sólo esos tres gates (con G-SCAN) están en PASS/cerrados**; **G-HUMAN-CONTRACT = `awaiting-human-plan-approval` (abierto)**; G-SA parcial, G-BOOTSTRAP y externos DR-05/DR-07/P-03/P-04/G-CHAIN/G-CAPACITY/Q-N05/G-GO-LIVE sin cambio `[gate-register.md: L12, L13, L15–L17, L18–L27]`.
- **Cierre con veredicto, no con fix:** SEC-61-1..4 + B-1 · SR67-1/2 + HIGH-1/2/3 + cota 256 · `strictTypes` → **cierran hallazgos, no gates**; residuales low/nits = DEFERRED (`no new round`) `[shared: L60–L76]`.

## Decisions locked

- **`D-F2-01` (Planner):** manifiesto workspace-wide unificado aceptado; baseline B = conjunto read-only **disjunto y derivable**; **los bytes frozen no se reescriben** `[gate-register.md: L99, L101]`.
- **Alcance del scan = criterio literal del gate:** workspace completo, exclusiones **sólo** `.git/` y `.playwright-mcp/`; **`node_modules` NO excluido** salvo autorización expresa (no existe); `.gitleaksignore` intacta `[gate-register.md: L11, L49]`.
- **Regla de re-scan inscrita en el gate (L35/L50):** «si Validator/escritura metadata cambia bytes → **re-scan acotado + resto manifiesto igual**; si contenido contractual cambia → invalida `ready`» → **autoriza el rescan acotado final sin rehacer el full scan y sin decisión humana nueva** `[gate-register.md: L35, L50]`.
- **Ver `shared` §Decisions locked** (autoridad, no duplicar): **D-J25-01** · **D-REC-SA01** · **D-N1-01** · **Delta G-OAS** · precedencia Master§14 + `gate-register` §Estado vigente `[shared: L149–L155]`.
- **No reabrir cerrados/DEFERRED** (SEC-61, B-1, SR67, HIGH-1/2/3, cota 256, `strictTypes`, TOCTOU low, `Needs confirmation:`); **`ready` no se reabre: `invalidated_by_changes_since: none`** `[shared: L134, L157–L167]`.

## Impact map

- **Escrituras de esta sesión: sólo este pack (refresh #81).** Canónicos y OpenAPI intactos `[shared: L143]`.
- **DELTA post-rescan `g-scan-rescan-20261008T023819Z` — exactamente 3 rutas, único alcance del rescan final:**
  1. `docs/specs/.working/entralo-v1-executable-specs-sdd-context.md` — **18ª escritura** (transcripción verbatim de `ready` + lifecycle) = **A COMPUTAR por el rescan (no inventar)** `[shared: L3, L143]`.
  2. `docs/specs/increments/entralo-v1-executable-specs/gate-register.md` — **L3 lifecycle → `awaiting-human-plan-approval`** (+ filas G-VALIDATOR **L16** / G-HUMAN-CONTRACT **L17**); hash en `shared` L132 (**`4666de9b…32e6` / 31970 B**) es el valor **post-F1/F2**, hoy **DESACTUALIZADO → A COMPUTAR** `[gate-register.md: L3, L16, L17; shared: L132, L143]`.
  3. `docs/specs/.working/entralo-v1-executable-specs-planning-context.md` — **#80 → #81 (esta escritura)** = **A COMPUTAR** `[este pack]`.
- **Resto del workspace:** debe quedar **byte-idéntico** al manifiesto de la **base rescan `g-scan-rescan-20261008T023819Z`** (manifest actual pre==post **`6c924a772d16e904f12f6d669300d6a2db9ca2a16cb044dc783dc89fb0110181`**), y esa base ya probó **1850 entradas byte-idénticas** al freeze run D `7ec93461…99d2` `[gate-register.md: L11; shared: L55]`.
- **Cadena vigente (orden exacto, sin salto):** **1)** fin de escrituras (este pack = último write conocido) → **2)** **rescan acotado final** (3 rutas vs base `20261008T023819Z` + resto idéntico) → **3)** **Gate humano contractual en el chat** → **4)** `## Human Plan Approval: approved_by_user` → **5)** `task-decomposer` `[gate-register.md: L17, L35, L50; shared: L180]`.

### Rescan acotado final — alcance y criterios (repara la invalidación metadata post-`ready`)

- **SÍ se rescanéa (gitleaks modo `dir`, NO Git):** las **3 rutas** de arriba, **tras** la escritura de este pack, **contra la base `g-scan-rescan-20261008T023819Z`**. Exclusiones **sólo** `.git/`+`.playwright-mcp/`; `.gitleaksignore` intacta (`6a5b7e73…cd3b`); versión/comando/exit/cero findings en destino **externo** `[gate-register.md: L11, L49]`.
- **NO se rehace el full scan SÍ la prueba se sostiene:** para **cada otra ruta** → hash **idéntico** al de la base rescan `6c924a77…181`; **delta explícito (old/new) sólo para las 3 cambiadas**; 0 altas/bajas → **cobertura del run D reafirmada sobre el artifact set identificado** `[gate-register.md: L35, L50, L120]`.
- **Si la prueba falla** (cualquier otra ruta difiere, falta una fuente, hash contractual cambia o hay finding secreto) → **`Blocked:`** y escalar/ampliar el scan; **nunca excluir paths en silencio ni sustituir la entrada frozen por el hash actual** `[gate-register.md: L47, L49, L120]`.
- **Cambio de contenido contractual ≠ metadata:** si el rescan revela cambio contractual (no sólo wording/metadata de lifecycle) → **invalida `ready`** y exige revisión nueva `[gate-register.md: L35, L50]`.
- **NO EJECUTADO en esta sesión** (sin herramienta autorizada); sin evidencia → **`Blocked:`** por falta de prueba, **sin degradar el gate a PASS** `[gate-register.md: L49]`.

## Risks and edge cases

- **⚠ Cualquier escritura tras el rescan final vuelve a romper pre=post** → cerrar todas las escrituras antes y **cero writes después** `[gate-register.md: L35, L49–L50]`.
- **PASS run D + rescan previo ≠ cobertura de los bytes de hoy:** citar el run D como PASS **con su rescan `20261008T023819Z`**, y el rescan final como **pendiente**; nunca el bundle BLOCKED `g-scan-final-20261008T004914Z` ni el PASS *initial* 2026-10-02 (88 archivos, histórico) `[shared: L171; gate-register.md: L11]`.
- **PASS ≠ aprobación humana:** `ready` habilita **únicamente** el Gate contractual; **`ready` vigente no se auto-renueva** si hay cambios `[shared: L141; gate-register.md: L16, L17]`.
- **Evidencia `/tmp/opencode/` volátil:** si desaparece → `Blocked: verification evidence unavailable`, sin reconstruir `[shared: L199]`.
- **Verde de código ≠ gate:** 180/180, preflight 13/13 y aprobaciones duales no produjeron PASS `[shared: L44, L46]`.
- **Guard:** `Blocked: secret detected` sólo para findings no exceptuados, nunca publicar el valor. **Ruta humana:** estado `awaiting-human-*-approval` → **detenerse y pedir la aprobación en el chat, sin enrutar a robots**.

## Conflicts and open questions

- **[Pendiente técnico] Rescan acotado final** de las 3 rutas post-rescan vs base `g-scan-rescan-20261008T023819Z` — única prueba de cobertura faltante `[gate-register.md: L35, L50]`.
- **[Pendiente humano] G-HUMAN-CONTRACT** — **única aprobación que falta** para el plan contractual: respuesta explícita del usuario → `## Human Plan Approval: approved_by_user` `[gate-register.md: L17; shared: L141, L180]`.
- **[Abierta] `Needs confirmation:` sin round nuevo:** digest histórico `c66a000f…` (F3, no verificable); fecha/ruta del artefacto GOV; procedencia durable de informes de sesión; marcaje N1–N4 / security N1–N8; autoría `killOwnChild`/EIO/`lib/*.mjs`; `F04 complement vacua?`; `H1 complement now fixed?`; typo `scenario enoe nt` `[shared: L165; gate-register.md: L11, L15]`.
- **[Abierta, fuera de esta secuencia] Gates restantes:** **G-BOOTSTRAP (matriz Java25 + 6 decisiones)**, **G-SA parcial** (P04/HC, SA-F08/09/11); externos DR-05/DR-07/P-03/P-04/G-CHAIN/G-CAPACITY/Q-N05/G-GO-LIVE `[gate-register.md: L13, L18–L27]`.
- **[Residual textual, no bloqueante]** fila G-CURATOR (L14) conserva narrativa histórica «Refresh#3»; canónico no editado `[gate-register.md: L14]`.
- **`pack_status: incomplete`** hasta rescan acotado final + Gate humano + matriz Java25 `[shared: L200]`.

## Planner handoff

- **target_agent:** **`usuario humano` (G-HUMAN-CONTRACT)** — ésta es la única acción de aprobación pendiente. En paralelo documental, el **rescan acotado final** se despacha a la **herramienta autorizada / orquestador de seguridad**. **Inhibidos: `task-decomposer` y `executor`** `[gate-register.md: L16, L17]`.
- **task_id:** `entralo-v1-executable-specs`.
- **objective:** UNA secuencia, sin salto: (1) fin de escrituras (= este pack #81); (2) **rescan acotado final** = gitleaks `dir` sobre las **3 rutas** + comparación del resto contra la **base `g-scan-rescan-20261008T023819Z` (`6c924a77…181`)** con delta explícito old/new sólo para esas 3; exit 0/cero findings/`.gitleaksignore` intacta, evidencia en destino externo; **full scan sólo si la prueba falla**; (3) **pedir en el chat la aprobación contractual del usuario** → sólo entonces `## Human Plan Approval: approved_by_user` → `task-decomposer`.
- **must_read:** `gate-register.md` **L3, L11, L16, L17, L35, L46–L50, L95–L121** · `docs/specs/.working/entralo-v1-executable-specs-sdd-context.md` (222 l., 18ª: **L3, L40, L55–L58, L126–L141, L171, L180**) · este pack · evidencia **`/tmp/opencode/entralo-v1-executable-specs/{g-scan-final2-20261008T005449Z,g-scan-rescan-20261008T023819Z}/`**. **Graphify inactivo: sin `GRAPH_REPORT.md` ni `graphify query` (no inventar grafo).**
- **relevant_context:** G-OAS PASS + G-API-GOV PASS + G-SCAN PASS (run D + rescan previo) · G-VALIDATOR **`ready` 2026-10-08** · F1/F2/F3 validados · lifecycle `awaiting-human-plan-approval` · exclusiones fijas del gate.
- **contracts:** OpenAPI 3.1 (8 YAML), 5 schemas Draft 2020-12, 14 fixtures MP + README, `schema-cases.v1.json` (matriz 27), `api-lint-policy` AC-GOAS-01…07, Master§11–§14 — **ninguno se modifica en rescan ni en el Gate**.
- **constraints:** **sin red/egress, sin Git, sin instalaciones, sin edición de OpenAPI/contratos/fixtures/canónicos**; **sin writes tras el rescan final**; **no ejecutar el rescan en esta sesión**; **no cerrar G-SCAN/G-HUMAN-CONTRACT**; **no inventar hashes/`freeze_id`/`generated_at`/fecha GOV**; **no reutilizar ni alterar el manifest frozen**; **no reabrir cerrados/DEFERRED**; **no presentar PASS/`ready` como aprobación humana** `[gate-register.md: L47, L50]`.
- **allowed_scope:** despacho del rescan acotado a herramienta autorizada; lectura de canónicos, `.working/**` y `/tmp/opencode/...`; edición de `docs/specs/.working/**` (pack/shared) por su owner.
- **out_of_scope:** edición de canónicos/contratos, ejecución de rescan/scan por este agente, `Human Plan Approval` escrito sin respuesta del usuario, `task-decomposer`/`executor`, reapertura de hallazgos.
- **edge_cases:** escrituras pendientes al rescanear → rechazar · cualquier ruta fuera de las 3 difiere → `Blocked:` (ampliar scan, nunca excluir en silencio) · encontrar secreto no exceptuado → `Blocked: secret detected` · hash de `gate-register`/`shared` desconocido → **computar, no inventar** · cambiar contenido contractual → invalidar `ready` · evidencia `/tmp` ausente → `Blocked: verification evidence unavailable` · enrutar antes del Gate humano → rechazar · estado `awaiting-human-*-approval` → **detenerse y pedirlo en el chat**.
- **verification:** (1) delta = **exactamente 3 rutas** documentadas con old/new reales; (2) **resto del workspace byte-idéntico** a `6c924a77…181` (base rescan) y, por transitividad, al freeze run D `7ec93461…99d2`; (3) rescan: exit 0, cero findings, exclusiones sólo `.git/`+`.playwright-mcp/`, `.gitleaksignore` `6a5b7e73…cd3b` intacta, versión/comando registrados; (4) **sin `## Human Plan Approval` escrito mientras no haya respuesta explícita del usuario**; (5) si falta cualquiera → gates **ABIERTOS**.
- **blockers:** **rescan acotado final no ejecutado** · **G-HUMAN-CONTRACT (aprobación humana contractual) pendiente** · **G-BOOTSTRAP + matriz Java25** · `Needs confirmation:` (digest `c66a000f…`, fecha/ruta GOV) · `pack_status: incomplete` · `tools/` sin versionar · evidencia `/tmp` volátil. **NO bloquean:** G-OAS PASS, G-API-GOV PASS, G-SCAN PASS (run D + rescan previo), G-VALIDATOR `ready`, F1/F2/F3 ni el verde de código.
- **routing_reason:** estado del incremento = **`awaiting-human-plan-approval`** → **bloqueo por Gate humano: detenerse y solicitar la aprobación contractual al usuario en el chat; NO enrutar a `task-decomposer`, `executor` ni ningún agente robot.** No hay decisión técnica, fix ni auditoría pendiente: lo que queda es (a) **rescan acotado final** por herramienta autorizada (regla ya inscrita en L35/L50, sin decisión humana nueva) y (b) **el Gate contractual**; **no** `api-governance-agent`/`api-lint` (PASS vigentes), **no** `planner` editando canónicos, **no** `spec-validator` (ya emitió `ready`).

pack_status: **`incomplete`** — refresh **#81** (post-`verdict: ready`). **Sólo este pack escrito; sin ejecuciones, Git, scans ni apertura de hallazgos.** Estado: **G-OAS = PASS · G-API-GOV = PASS · G-SCAN = PASS run D `g-scan-final2-20261008T005449Z` (`7ec93461…99d2`) + rescan acotado PASS `g-scan-rescan-20261008T023819Z` (`6c924a77…181`) · G-VALIDATOR = `ready` (2026-10-08) · F1+F2+F3 validados · lifecycle `awaiting-human-plan-approval`.** **ÚNICA APROBACIÓN QUE FALTA: la aprobación humana contractual del usuario (G-HUMAN-CONTRACT).** **Pendiente documental: ÚLTIMO rescan acotado de exactamente 3 rutas (shared 18ª, `gate-register.md` L3 lifecycle, este pack #81) vs base rescan `20261008T023819Z`, resto del workspace idéntico → después, DETENERSE y pedir el Gate en el chat.** **`task-decomposer`/`executor` INHIBIDOS; sin `## Human Plan Approval: approved_by_user` (no escrito).**
