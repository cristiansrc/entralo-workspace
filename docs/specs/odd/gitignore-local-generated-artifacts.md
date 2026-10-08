# ODD: gitignore-local-generated-artifacts
lane: trivial
origin: solicitud secundaria del orquestador (ajuste de `.gitignore`)

Rutas de Graphify resueltas por el orquestador (cierra el `Needs confirmation:`
anterior): **todos los outputs finales que se conservan viven dentro de
`graphify-out/`** — `graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md`,
`graphify-out/graph.html` (no en la raíz del repo); los caches/intermedios
`graphify-out/cache/` y `graphify-out/.graphify_*` se ignoran.

## Outcome

El `.gitignore` de la raíz excluye únicamente artefactos locales regenerables:
`tools/goas/node_modules`, `tools/goas/.npm-cache`, `tools/goas/.tmp`,
`tools/goas/.npmrc*` y los caches/intermedios de Graphify
(`graphify-out/cache/`, `graphify-out/.graphify_*`). Se preserva lo ya
existente y lo necesario: `.playwright-mcp` sigue excluido igual que hoy,
`tools/goas/vendor/tarballs`, `tools/goas/provenance/` y el lock offline
(`tools/goas/package-lock.json`) siguen versionables, y los tres finales de
Graphify — **todos bajo `graphify-out/`**: `graphify-out/graph.json`,
`graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.html` — quedan
versionables (no excluidos).

## Evidence

- before: `cat .gitignore` → una única línea `.playwright-mcp/`; ningún
  artefacto local regenerable está excluido. Inventario git-executor:
  `tools/goas/node_modules` 971 archivos (reconteo en transcripción: 968),
  `tools/goas/.tmp` 554, `tools/goas/.npm-cache` 29, `graphify-out` 49
  (caches/intermedios `.graphify_ast.json`, `.graphify_chunks.txt`,
  `.graphify_detect.json`, `.graphify_python`, `.graphify_root`,
  `.graphify_uncached.txt`, `cache/stat-index.json`); `git status
  --porcelain` los reporta como `?? tools/` y `?? graphify-out/`
  (0 trackeados, pero visibles como no-ignorados). **Los tres finales
  (`graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md`,
  `graphify-out/graph.html`) aún no existen en filesystem** — al momento de
  esta transcripción `graphify-out/` sólo contiene `cache/` y los 6
  `.graphify_*`; su ruta conservada queda fijada arriba.
- after: (git-executor, 2026-10-07 — **en verde**) mismo par de comandos
  tras la edición:
  - `cat .gitignore` → `.playwright-mcp/` + 6 patrones root-anchored:
    `/tools/goas/node_modules/`, `/tools/goas/.npm-cache/`,
    `/tools/goas/.tmp/`, `/tools/goas/.npmrc*`, `/graphify-out/cache/`,
    `/graphify-out/.graphify_*`.
  - `git check-ignore -v` → **match** para cada artefacto regenerable
    previsto (`tools/goas/node_modules/`, `tools/goas/.npm-cache/`,
    `tools/goas/.tmp/`, `tools/goas/.npmrc*`, `graphify-out/cache/`,
    `graphify-out/.graphify_*`) y **match mantenido** para
    `.playwright-mcp/` (sigue ignorado, igual que antes de la edición).
  - `git check-ignore -v` → **NO-match** (siguen versionables) para
    `tools/goas/vendor/tarballs/`, `tools/goas/provenance/`,
    `tools/goas/package-lock.json`, la fuente de validación
    `tools/goas/validation/**`, los contratos/docs `docs/**` y los tres
    finales de Graphify `graphify-out/graph.json`,
    `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.html`.
  - `git status --porcelain` → `.gitignore` reportado como **modificado**
    (única ruta trackeada con diff) y **ningún cache/intermedio ignorado
    colándose** en la salida (no se listan `tools/goas/node_modules`,
    `tools/goas/.npm-cache`, `tools/goas/.tmp`, `graphify-out/cache/` ni
    `.graphify_*`).

## Boundaries

- touches: `/mnt/data/Shares/Projects/entralo-workspace/.gitignore` (solo
  archivo de la raíz).
- must-not-touch: specs (`docs/specs/**`), contratos OpenAPI/AsyncAPI, código
  fuente, cualquier otro `.gitignore`; no excluir `docs/**`,
  `tools/goas/validation/**`, `tools/goas/vendor/tarballs/**`,
  `tools/goas/provenance/**`, `tools/goas/package-lock.json`, ni los finales
  `graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md`,
  `graphify-out/graph.html`.

## Escalation

Ninguno (sin disparadores §2 al momento de la transcripción).

## Checklist (cierre)

- [x] Evidencia `before` registrada (estado actual observado).
- [x] Evidencia `after` en verde con el mismo comando (git-executor
      2026-10-07; ver §Evidence `after`).
- [x] Diff limitado a `.gitignore` (dentro de `touches`): única ruta
      trackeada modificada reportada por `git status --porcelain`
      (git-executor 2026-10-07).
- [x] `git check-ignore -v` confirma exclusión de artefactos regenerables y
      NO-exclusión de las rutas preservadas/finales
      (`tools/goas/vendor/tarballs/`, `tools/goas/provenance/`,
      `tools/goas/package-lock.json`, `tools/goas/validation/**`,
      `docs/**`, `graphify-out/graph.json`,
      `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.html`);
      `.playwright-mcp/` sigue ignorado (match mantenido).
- [x] Ningún disparador §2 (contratos, BD, auth, dependencias nuevas,
      decisiones de negocio, diff fuera de boundaries) — diff = sólo
      patrones de `.gitignore`, `## Escalation`: Ninguno.
- [x] `## Reviewer Approval: approved` transcrito por el reviewer tras
      `review: approved` (veredicto textual recibido; ver §Reviewer
      Approval).
- [x] Señales: N/A en carril `trivial`.

## Reviewer Approval: approved

- **Fecha:** 2026-10-07 · **Scope:** `ODD trivial:
  .gitignore-local-generated-artifacts` · **Veredicto (literal):**
  `review: approved`.
- **Alcance del veredicto:** la odd-card `gitignore-local-generated-artifacts`
  en carril `trivial` — `.gitignore` de la raíz limitado a artefactos
  locales regenerables, con evidencia `before`/`after` registrada y diff
  dentro de `touches`; sin disparadores §2 y sin escalamiento a SDD.
  **Aprobación de reviewer ≠ PASS de gate:** no cierra
  G-SCAN/G-VALIDATOR/G-HUMAN-CONTRACT; el carril principal
  `## Lane: feature` sigue `awaiting-human-plan-approval`.
