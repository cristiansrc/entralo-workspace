# Planning Context Pack: entralo-rename-docs-migration

- generated_at: 2026-09-27T12:25:55-05:00
- last_updated: 2026-09-27T12:45:00-05:00 (revisión post-migración: inventario de `estilo/` → **7 PNG** (`brand-board.png` añadido y `Mini-design-system.png` aparecido durante la revisión), ambos **referencias iniciales no aprobadas**; dato stale de `pack: L6` **corregido** → R-f cerrado; antes: migración ejecutada — ver *Resultado de la migración*)
- source_snapshot: `unavailable` (workspace sin git; no se ejecutó ningún comando git)
- pack_status: **executed** — la migración documental de nombres/rutas se ejecutó el 2026-09-27 con autorización explícita del usuario (grafía oficial «Entralo», ruta `…/entralo-workspace`, renombre del pack de decisiones y corrección de la referencia y la pregunta de nombre del brief). **Q-N01 queda parcialmente resuelta**: la **grafía** está confirmada; **marca/logo/colores/dominio siguen abiertos** (decisión 30, pendiente no bloqueante). El `pack_status: conflicting` **del pack de decisiones sigue vigente** y no lo modifica esta migración.
- refresh_when: cualquier cambio posterior en `estilo/`; decisión humana sobre marca/logo/colores o dominio (Q-N01/Q-07); edición posterior del pack de decisiones o del brief; nueva instrucción del usuario sobre el alcance.

## Objective and scope

- Incremento: **migración de identidad documental** tras el renombre del workspace a `entralo-workspace` (proyecto **Entralo**): actualizar nombres/rutas en documentos, revisar insumos de estilo y continuar el flujo SDD en este workspace `[chat: usuario 2026-09-27]`. **Estado: EJECUTADA (2026-09-27).**
- Alcance ejecutado: (1) inventario de referencias obsoletas con ruta+línea, (2) estado de la carpeta `estilo/`, (3) migración **acotada** de nombres/rutas **sin replace global** de «entregalo». El usuario **autorizó expresamente**: grafía oficial **«Entralo»**, ruta nueva `/mnt/data/Shares/Projects/entralo-workspace`, **renombre del pack de decisiones**, actualización de la referencia relativa en el brief y de su pregunta de nombre `[chat: usuario 2026-09-27]`.
- Fuerza de evidencia del renombre: la carpeta real es `/mnt/data/Shares/Projects/entralo-workspace` y el brief ya se titula `entralo-v1-requirements-brief.md` con grafía «Entralo» en todo su cuerpo [docs/specs/requirements/entralo-v1-requirements-brief.md: L1].
- **No** incluye (y **no** se hizo): edición de código, contratos, tests, reglas funcionales de specs, datos de marca nuevos ni ejecución de git.

## Canonical sources

| Fuente (ruta absoluta) | Rol | Razón de autoridad / límite |
|---|---|---|
| `/mnt/data/Shares/Projects/entralo-workspace/docs/specs/requirements/entralo-v1-requirements-brief.md` | Requisitos de producto vigentes (status `requirements-blocked`) | Artefacto propio de Entralo; **editado en este incremento solo en L6 y L139** por autorización explícita del usuario (referencia relativa + pregunta de nombre); **el resto de su contenido funcional no se tocó** [brief: L3; chat: usuario 2026-09-27] |
| `/mnt/data/Shares/Projects/entralo-workspace/docs/specs/.working/entralo-greenfield-bootstrap-planning-context.md` | Pack de decisiones 1–30 del usuario (índice, no verdad) | Único registro de decisiones de producto; **renombrado el 2026-09-27** (antes `entregalo-…`); `pack_status: conflicting` **sigue vigente** [pack: L1, L6] |
| `/mnt/data/Shares/Projects/entralo-workspace/estilo/` (7 PNG) | Insumos de marca/estilo (no canónicos aún) — **referencias iniciales, NO diseño aprobado** | Decisión 30: marca/logo/colores «sin definir pero no bloqueantes» → los assets **no** son aprobados, incluido `brand-board.png` (inventario actualizado 2026-09-27) [pack: L4; pack decisiones: decisión 30] |
| Chat del usuario (2026-09-27) | Fuente del renombre y del mandato de migración | Prevalecte sobre nombres históricos de los docs `[chat: usuario 2026-09-27]` |
| `/mnt/data/Shares/Projects/criptopass-workspace/**` | Solo insumo de análisis | **No canónico** para Entralo; no editar [pack: L28, L77] |

- **Graphify:** `graphify-out/` **no existe** en el workspace → la Regla de Grafo queda inaplicable en este incremento (verificado por filesystem).
- **MEMORY.md:** no existe en la raíz del workspace (aún no hay ciclo done/implemented que compactar).
- `pack_status: conflicting` del pack de decisiones **se mantiene vigente**: XP/Q abiertas sin resolver [pack: L6, L270].

## Existing behavior and contracts

- **Workspace sin git, sin specs técnicas validadas, sin contratos OpenAPI, sin código**: `docs/` (requirements brief + 2 packs en `specs/.working/` + `specs/logo/` vacío) y `estilo/` con **7 PNG** [filesystem 2026-09-27].
- ~~El pack de decisiones afirma «specs/contratos/código = 0»~~ → **CORREGIDO el 2026-09-27** (revisión posterior): `pack: L6` ya registra que `EP` contiene brief, packs y `estilo/` (7 PNG) y que **solo** faltan specs técnicas validadas, contratos y código [pack: L6].
- `refresh_when` del pack de decisiones ya se activó: «creación del primer artefacto propio de Entralo (README, requirements brief…)» → ocurrido [pack: L7].
- Brief en estado `requirements-blocked`: bloqueado por Q-C01..Q-C07, no por el renombre de identidad [brief: L3, L123-133].
- No hay nada que migrar en contratos/config: **la migración fue 100 % documental** (3 archivos markdown: pack de decisiones, brief y este pack) [filesystem 2026-09-27].

## Decisions locked

1. **Proyecto/carpeta renombrada a Entralo → `entralo-workspace`** (hecho por el usuario, no por agente) `[chat: usuario 2026-09-27]`.
2. **Migrar nombres/rutas en documentos** y **revisar insumos de estilo**; migración **acotada** (sin replace global) `[chat: usuario 2026-09-27]`.
3. Las decisiones de producto 1–30 del pack siguen vigentes y **no se tocaron** con la migración [pack: L90-171].
4. Marca/logo/colores = **pendiente no bloqueante** (decisión 30); los PNG de `estilo/` son insumo, no especificación aprobada [pack: L4].
5. **Grafía oficial = «Entralo»** y **ruta nueva = `/mnt/data/Shares/Projects/entralo-workspace`** (interpretación autorizada por el usuario) → cierra la dimensión «grafía» de X-10 y la pregunta de nombre de Q-N01/Q-07 `[chat: usuario 2026-09-27]`.
6. **Autorización de migración sobre 3 archivos:** renombrar el pack de decisiones a `entralo-greenfield-bootstrap-planning-context.md`, corregir sus rutas/nombres y **actualizar el brief** (referencia relativa + pregunta de nombre) `[chat: usuario 2026-09-27]`.
7. **Los assets de `estilo/` son referencias iniciales**; su existencia **no implica aprobación formal de diseño** ni define marca/dominio `[chat: usuario 2026-09-27]`.

## Resultado de la migración (impact map)

### Documentos migrados (lista acotada: 3 archivos)

**A. `/mnt/data/Shares/Projects/entralo-workspace/docs/specs/.working/entralo-greenfield-bootstrap-planning-context.md`** — **RENOMBRADO** desde `entregalo-greenfield-bootstrap-planning-context.md` (266 líneas al momento de la migración; **270 hoy**, tras la revisión del 2026-09-27):

| Línea | Referencia obsoleta | Tipo | Resultado |
|---|---|---|---|
| L1 | `# Planning Context Pack: entregalo-greenfield-bootstrap` | título/nombre de incremento | ✅ → `entralo-greenfield-bootstrap` |
| L5 | `source_snapshot: \`entregalo-workspace\`` | nombre de workspace | ✅ → `entralo-workspace` |
| L6 | `pack_status: … \`entregalo-workspace\` sigue sin fuentes canónicas propias` | nombre de workspace **+ dato stale** (ya hay brief) | ✅ nombre corregido / ✅ **dato stale corregido el 2026-09-27** en revisión posterior (`pack: L6` registra brief + packs + `estilo/` 7 PNG; ver R-f) |
| L9 | alias `EP = /mnt/data/Shares/Projects/entregalo-workspace` | **ruta absoluta antigua** | ✅ → `…/entralo-workspace` |
| L32 | `\`EP/docs/specs/.working/entregalo-greenfield-bootstrap-planning-context.md\`` | ruta relativa al propio archivo | ✅ → `entralo-…` |
| L4 | `last_updated` | trazabilidad | ✅ anexado registro de la migración; **decisiones 1–30 intactas** |
| L207 | X-10: «`EP` = `entregalo-workspace`; … tres grafías → nombre oficial sin confirmar» | conflicto de grafía | ✅ marcado **RESUELTO para grafía** («Entralo», decisión del usuario); **historia de las 3 grafías conservada** |
| L255 | Q-07: «nombre oficial (Entregalo/Entrarlo/…); mapeo `criptopass-*` → `entregalo-*`» | naming de repos heredado | ✅ nombre oficial **RESUELTO**; propuesta de mapeo → `criptopass-*` → `entralo-*`; **dominio y naming de repos siguen abiertos** |

- El alias `EP` se usa como prefijo en decenas de líneas: **solo L9 define la ruta**; corregir L9 bastó para re-apuntar el alias (no se reescribieron las ocurrencias de `EP`).
- **Numeración de líneas:** todas las citas `[pack: L…]` y las etiquetas «Línea» de las tablas de este documento apuntan a la numeración **actual** del pack de decisiones tras la revisión post-migración del 2026-09-27 (que añadió 3 filas en *Canonical sources* y 1 nota en la decisión 30 → **+3 desde su L33 y +4 desde su L146**; p. ej. su X-10 está hoy en L207 y su `pack_status` final en L270).

**B. `/mnt/data/Shares/Projects/entralo-workspace/docs/specs/requirements/entralo-v1-requirements-brief.md`** (155 líneas; editado **con autorización explícita del usuario** en este incremento):

| Línea | Referencia obsoleta | Tipo | Resultado |
|---|---|---|---|
| L6 | `docs/specs/.working/entregalo-greenfield-bootstrap-planning-context.md` | **ruta relativa** al pack renombrado | ✅ → `entralo-greenfield-bootstrap-planning-context.md` (**enlace reparado**) |
| L139 | Q-N01: grafía «Entralo» frente a «Entregalo/Entrarlo» | pregunta de nombre abierta | ✅ **grafía resuelta** («Entralo»); marca visual, logo, colores y dominio **siguen pendientes** |

**C. `/mnt/data/Shares/Projects/entralo-workspace/docs/specs/.working/entralo-rename-docs-migration-planning-context.md`** (este pack): actualizado tras la ejecución → estado `executed`, rutas/filenames nuevos, decisiones 5–7, nota de assets no aprobados y verificación post-migración.

### Rutas antiguas vs. rutas vigentes (verificación posterior a la migración)

- ✅ `/mnt/data/Shares/Projects/entralo-workspace` — **única forma vigente**. Verificación por grep tras la edición: **ninguna ruta absoluta `entregalo-workspace` en uso**; la única restante en `docs/` es la de la columna «Referencia obsoleta» de la tabla A de arriba (registro del cambio) y las menciones históricas de la siguiente viñeta.
- ✅ nombre de archivo del pack: `entralo-greenfield-bootstrap-planning-context.md`.
- ⚠️ menciones **históricas conservadas a propósito** (no son erratas y **no** se sustituyeron): `entregalo-workspace` dentro del registro de X-10 (pack L207), `entalro-workspace` (grafía errónea previa), `entrarlo-portal-rebuild*` / `entrarlo-portal-rebuild-sdd-context.md` (nombres técnicos del repo externo CriptoPass) y `criptopass-*` / `criptopass-workspace`; en el brief, las variantes «Entregalo/Entrarlo» de Q-N01 (L139) como registro de las grafías descartadas.
- Rutas **externas** referenciadas y **sí existentes** (no migrar): `/mnt/data/Shares/Projects/criptopass-workspace`, `/mnt/data/Shares/Projects/ms-ticket-cripto` [pack: L9].

### Carpeta de estilo: **SÍ existe** — `/mnt/data/Shares/Projects/entralo-workspace/estilo/`

> ⚠️ **Nota — assets visuales detectados, NO aprobados:** los **7 PNG** de `estilo/` (`logo.png`, `logo-fondo.png`, `paleta.png`, `banner.png`, `pagina.png`, **`brand-board.png`** y **`Mini-design-system.png`**) son **referencias iniciales** colocadas en esa carpeta (los cinco originales y `brand-board.png`, aportados por el usuario; `Mini-design-system.png`, aparecido durante esta revisión con **procedencia no confirmada**). **Ninguno es diseño aprobado:** `brand-board.png` se añadió al inventario el 2026-09-27 y `Mini-design-system.png` apareció en `estilo/` durante esta misma revisión (12:50); ambos tienen exactamente la misma condición que los otros cinco: **referencia inicial NO aprobada.** Su presencia **no implica aprobación formal de diseño** ni decide marca, logo, colores o dominio: la **decisión 30 sigue «pendiente no bloqueante»** y Q-N01/Q-07 **no se cierran** por ellos. En la migración **no** se copiaron, movieron ni enlazaron como recursos (sin link ni imagen embebida en `docs/`) `[chat: usuario 2026-09-27; pack: L4; pack decisiones: decisión 30]`.

| Archivo | Dimensiones | Contenido (inspeccionado 2026-09-27) |
|---|---|---|
| `logo.png` | 1254×1254 RGBA | Ícono suelto: boleto con destello, haces magenta/ámbar, siluetas de público; **sin texto** |
| `logo-fondo.png` | 1254×1254 RGBA | App icon: mismo ícono sobre cuadrado redondeado oscuro (#111827-ish) |
| `paleta.png` | 1254×1254 RGB | Board «CONCEPT 3»: wordmark **`entralo.com`**, tagline «TICKETS FOR A BRIGHTER TOMORROW», brand essence «Live Moments. Brighter Together.», app icon, paleta **#111827 CHARCOAL / #D946EF VIBRANT MAGENTA / #F59E0B GOLDEN AMBER / #F5F3EF LIGHT SAND**, mockups de banner y móvil |
| `banner.png` | 2172×724 RGBA | Lockup horizontal: ícono + wordmark `entralo.com` |
| `pagina.png` | 2172×724 RGBA | Solo wordmark `entralo.com` (ísimo `entralo` carbón + `.com` magenta) |
| `brand-board.png` | 1448×1086 RGB | **Añadido al inventario 2026-09-27 (post-migración):** board «ENTRALO — IDENTIDAD DE MARCA» con wordmark **`entralo.com`** + tagline «ENTRADAS PARA UN MAÑANA MÁS BRILLANTE», esencia «Momentos en vivo. Juntos brillamos más.», sistema de logo (principal horizontal, icono independiente, logotipo, icono de app, micro icono), paleta **#111827 / #D946EF / #F59E0B / #6D28D9 / #F8FAFC / #64748B**, gradiente de marca, tipografías **Manrope** e **Inter**, estilos de botones/categorías/tarjeta de evento y notas de uso. **Es referencia inicial NO aprobada:** no decide marca, logo, paleta ni dominio (decisión 30 sigue pendiente no bloqueante) |
| `Mini-design-system.png` | 1448×1086 RGB | **Aparecido en `estilo/` durante esta revisión (2026-09-27 12:50):** board «ENTRALO — MINI DESIGN SYSTEM — Sistema base para portal web y app» con wordmark **`entralo.com`**, paleta **#111827 / #D946EF / #F59E0B / #6D28D9 / #F8FAFC / #64748B**, gradiente **#7C3AED → #D946EF → #F59E0B**, tipografías **Manrope** e **Inter**, escala de espaciado/radios/sombras, variantes de botones, formularios con estados de error, header/nav móvil/breadcrumbs, chips/badges y tarjetas de evento, y flujo de compra/checkout con importes **en euros (€)**. **Es referencia inicial NO aprobada:** no decide marca, logo, paleta, dominio ni moneda — los **€** del asset **no** alteran la decisión 9 (Colombia/COP) |

- **Coherencia de grafía:** los assets **con texto** (`paleta.png`, `banner.png`, `pagina.png`, `brand-board.png` y `Mini-design-system.png`) dicen **`entralo.com`** y **coinciden** con la grafía oficial «Entralo» **ya confirmada por el usuario** (la confirmación proviene del chat, **no** de los PNG; `logo.png` **no** lleva texto) [chat: usuario 2026-09-27]. El **dominio `entralo.com` NO está decidido**: es propuesta de los assets.
- ⚠️ **`estilo/` cambió durante esta revisión:** `brand-board.png` fue **reemplazado** a las 12:40 (mismo nombre) y apareció **`Mini-design-system.png`** a las 12:50 → el inventario refleja el estado al cierre de la revisión (**7 PNG**). El `refresh_when` de este pack («cualquier cambio posterior en `estilo/`») queda **activo**: cualquier nuevo asset obliga a re-inventariar y **no** altera por sí solo la decisión 30 [filesystem 2026-09-27].
- ⚠️ `/mnt/data/Shares/Projects/entralo-workspace/docs/logo/` existe y está **vacío** (0 archivos) → carpeta residual, pendiente de decidir (recibir assets o eliminarse) **fuera de este pack** [filesystem 2026-09-27].
- Los assets **no están enlazados ni embebidos** en ningún markdown (no existe ningún link ni imagen `![]()` hacia ellos en `docs/`) → decisión 30 sigue «pendiente no bloqueante».

## Risks and edge cases

- **R-a → CERRADO:** el renombre del pack de decisiones **rompía la referencia del brief (L6)**; con la autorización del usuario el brief se editó en la misma pasada → **enlace reparado, sin enlace roto**.
- **R-b → MITIGADO, no cerrado:** X-10/Q-N01 **no** se cerraron por inferencia sobre los PNG sino por **confirmación explícita del usuario** (grafía «Entralo»). La **decisión 30 (marca/logo/colores) y el dominio siguen formalmente pendientes**; los assets siguen **no aprobados**.
- **R-c → EVITADO:** no se hizo replace global de «entregalo»; el **contexto histórico deliberado** de X-10/Q-07 (grafías erróneas previas) y los nombres técnicos externos (`entrarlo-portal-rebuild*`, `criptopass-*`) **se conservaron** [pack: L207, L255].
- **R-d → vigente:** el pack de decisiones (**270 líneas** tras la revisión del 2026-09-27; eran 266) excede el límite de 250 de la skill → cualquier edición futura debe hacerse con pasada de resumen, sin perder evidencia.
- **R-e → vigente:** `pack_status: conflicting` heredado prohíbe asumir completitud de specs; la migración de nombres **no** desbloquea Q-C01..Q-C07 ni autoriza handoff a Planner.
- **R-f → CERRADO (2026-09-27, revisión posterior):** el dato **stale** «specs/contratos/código = 0» de `pack: L6` (pese a existir el brief) **fue corregido fuera del alcance de nombres/rutas**: el pack de decisiones registra ahora el contenido real de `EP` (brief + 2 packs + `estilo/` con 7 PNG) y su `last_updated` se actualizó. Queda solo como pendiente humano lo que **no** se decide aquí: marca/logo/colores/dominio (decisión 30).

## Conflicts and open questions

- **X-10 → RESUELTO en su dimensión de grafía (2026-09-27):** el usuario confirmó **«Entralo»** como grafía oficial y `/mnt/data/Shares/Projects/entralo-workspace` como ruta → ya no es «evidencia convergente sin confirmación»; las tres grafías históricas (`entregalo`, `entalro`, `entrarlo`) quedan **registradas como evidencia**, no como conflicto abierto [chat: usuario 2026-09-27; pack: L207].
- **Q-N01 → PARCIALMENTE resuelta:** la **grafía/nombre oficial quedó respondida por el usuario**; **siguen abiertos** marca visual, logo, colores y dominio (`entralo.com` es propuesta de los assets, **no** una decisión registrada) [brief: L139].
- **Q-07 → PARCIALMENTE abierta:** nombre oficial **resuelto**; **siguen abiertos** el dominio, el naming de repos (`criptopass-*` → `entralo-*` **aún no decidido**) y cualquier renombrado de artefactos externos [pack: L255].
- **Resueltas en esta migración (ya no bloquean):** decisión operativa sobre renombre del pack de decisiones (**ejecutada**), edición del brief (**autorizada**) y alcance de la migración (**acotada a nombres/rutas, sin replace global**) `[chat: usuario 2026-09-27]`.
- Sin resolver (heredadas, **no** bloquean esta migración): Q-C01..Q-C07, Q-01, Q-03..Q-10, decisión 25 (cargo de servicio), decisión 30 (marca/logo/colores) [pack: L259-267].

## Planner handoff

- **Puede decidir el Planner:** cómo dejar registrado en specs el cierre de X-10 (grafía) sin perder el registro histórico; propuesta de estructura para `docs/logo/` (hoy vacío) vs `estilo/`; verificar que el dato stale de `pack: L6` siga corregido (**R-f cerrado el 2026-09-27**); naming de repos `criptopass-*` → `entralo-*` **como propuesta, no como decisión**.
- **Debe verificar directamente:** el resultado de cada línea del *Resultado de la migración* (evidencia de 2026-09-27T12:25-05:00, migración aplicada el mismo día); que `refresh_when` no haya cambiado las fuentes; que el enlace del brief (L6) apunte al archivo **renombrado**.
- **Requiere insumo humano (no lo decide agente):** aprobación de marca/logo/colores y de `entralo.com` como dominio (Q-N01/Q-07 restantes, decisión 30); decisión sobre `docs/logo/` vacío; resolución de Q-C01..Q-C07 antes de cualquier handoff a Planner funcional.
- **Bloquea el incremento:** cualquier intento de handoff a `task-decomposer`/`executor` sigue prohibido: no hay specs SDD validadas ni task breakdown [pack: L264].
- **Restricciones duras para el receptor:** no ejecutar git; no hacer replace global de «entregalo» sin preservar X-10/Q-07; no editar código, contratos ni reglas funcionales de specs; **no tratar los assets de `estilo/` ni la marca como decididos/aprobados**; no ocultar que el `pack_status: conflicting` del pack de decisiones sigue vigente.

pack_status: **executed** — migración documental ejecutada y verificada el 2026-09-27 sobre 3 archivos (renombrado del pack de decisiones + corrección de sus rutas/nombres/grafía, reparación de la referencia relativa y de la pregunta de nombre en el brief, y actualización de este pack). **Quedan abiertos** marca/logo/colores/dominio/naming de repos (Q-N01/Q-07 parciales, decisión 30) y todas las Q-C/Q- heredadas; el `pack_status: conflicting` del pack de decisiones **sigue vigente**. Sin cambios funcionales, sin git. **Revisión posterior (2026-09-27):** inventario de `estilo/` ampliado a **7 PNG** (`brand-board.png` y `Mini-design-system.png` = **referencias iniciales NO aprobadas**, este último detectado durante la revisión), ruta del pack en el brief reescrita como ruta relativa a la raíz del workspace + enlace relativo correcto, nota de assets no aprobados añadida a la **decisión 30** y trazabilidad stale corregida (`pack: L6` y `last_updated` del pack de decisiones → **R-f cerrado**). **Sin cambios de requisitos ni de decisiones comerciales; sin código y sin git.**
