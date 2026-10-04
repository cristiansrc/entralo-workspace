# Diagnóstico de recuperación y organización documental

Lifecycle status: `planning` — propuesta de reorganización pendiente; los hallazgos siguientes son observaciones, no un dictamen contractual. Fecha: **2026-10-03**. Responsable: Planner.

**Actualización de recuperación SA:** §«Resolución mediante revisión nueva» prevalece sobre la ausencia operativa de informe/condiciones SA descrita en el diagnóstico inicial. La respuesta histórica sigue no recuperada, pero existe firma nueva para un alcance explícito. No sustituye Governance, metadata DevOps o validación global.

## Alcance y límites

Repositorio inspeccionado: `/mnt/data/Shares/Projects/entralo-workspace`. Investigación de archivos, referencias y Git local, sin búsquedas fuera del repo, acceso al almacén externo de sesiones, red, restauración, commit ni push. No se inspeccionó el resto del PC.

Graphify no está activo: no existe `graphify-out/`. No hay task board ni `docs/specs/workspace_changes.md` en el corte inspeccionado. El incremento contractual sigue `planning`, Spec Validator `verdict: none`. Este informe no cambia reglas de negocio, gates ni aprobaciones.

## Resultado sobre el archivo perdido

No se conoce todavía el nombre o contenido exacto señalado por el usuario. **No se demuestra un borrado local.** Los rastros principales corresponden a informes no persistidos y evidencia externa. Ausencia en este repo no equivale a ausencia en todo el PC.

| Candidato | Evidencia concreta | Resultado y vía de recuperación |
|---|---|---|
| Re-review SA del 2026-10-03 con condiciones pre-freeze | [Shared activo](../specs/.working/entralo-v1-executable-specs-sdd-context.md), §Current status y §Recovery log; [informe SA](../specs/increments/entralo-v1-executable-specs/solution-architect-review.md), §Firma | La aprobación posterior está **reportada**, no acreditada por informe propio. El informe presente es del 2026-10-02 y conserva `changes-required`. No se encontró el texto de las condiciones ni copia interna. Recuperar respuesta original o pedir revisión nueva con fecha/snapshot/autor reales. |
| Informe independiente API Governance — Changes Required | [Registro Governance](../specs/increments/entralo-v1-executable-specs/api-governance.md), §Procedencia y §Registro de remediación | El registro declara que el informe no se localizó y no lo sustituye. No copiar la interpretación del Planner como firma del auditor. Una auditoría nueva, tras G-OAS, puede sustituir la necesidad del informe histórico según su propia disposición. |
| Captura primaria DevOps de metadata | Shared activo, §Etapa A ejecutada y §Artifact evidence | El shared conserva resultados parciales y documenta borrado de temporales. No transcribe `repository`, `engines` ni `dist.tarball`. La fuente está identificada como sesión OpenCode `ses_efbd0785dffeu6rRzm2RUxiYWP`, parte `prt_1042fd09e001onp5C1zTuKQSWW`. No se accedió al almacén de sesiones. |
| Informes y bundles G-OAS/Gitleaks | [Gates](../specs/increments/entralo-v1-executable-specs/gate-register.md), G-OAS/G-SCAN; shared activo, §Fuentes de verdad | Rutas citadas bajo `/tmp/opencode`, sin copia interna encontrada. Existencia externa actual **no verificada**. Los resultados históricos no validan los bytes actuales. |

### Lo que sí se encontró

- [Master Spec canónica](../specs/increments/entralo-v1-executable-specs/master-spec.md) y [contrato de descomposición](../specs/increments/entralo-v1-executable-specs/decomposition-contract.md).
- Ocho OpenAPI en `docs/specs/increments/entralo-v1-executable-specs/api/`.
- Siete documentos de datos, cinco esquemas de eventos y quince archivos bajo `fixtures/`.
- En total, **44 archivos en el directorio del incremento**; son documentación, contratos, esquemas y fixtures sintéticas, no código de producción.
- No se localizó backup documental ni duplicado exacto documental en la exploración. Los informes SA macro y V1 no son duplicados.

### Pistas externas: no inspeccionadas

La documentación menciona `/tmp/opencode/entralo-v1-executable-specs/g-oas-2026-10-03/G-OAS-report.md`, el directorio anterior `g-oas-post-remediation-2026-10-02/`, `gitleaks-initial-2026-10-02/` y `/tmp/opencode/g-oas-metadata/`. También cita el nombre histórico `/mnt/data/Shares/Projects/entregalo-workspace` y otros workspaces como referencias.

Estas rutas son pistas, no hallazgos de archivos existentes. No ampliar la investigación a otros proyectos ni al PC completo desde este informe. El humano puede aportar el archivo o exportar la respuesta de sesión pertinente, revisada para excluir secretos y datos personales.

## Evidencia Git local

Investigación de lectura delegada a `git-executor`; HEAD observado `feb38aa`. Comandos de comprobación: `git status --porcelain=v1 --branch`, `git ls-files -- docs/specs/increments`, `git ls-files --others --exclude-standard`, `git log --all` con filtros de borrado/renombre, `git stash list`, `git reflog` y `git fsck --no-reflogs --unreachable --dangling` (sin `--lost-found`).

| Comprobación | Resultado observado |
|---|---|
| Historial local accesible | Cuatro commits: `55f57d0`, `02fb954`, `232b953`, `feb38aa`. |
| Borrados/renombres documentales en ese historial | Ninguno encontrado. No prueba que nunca se borrara un archivo no versionado. |
| Stash/reflog | Sin stashes; cuatro entradas de commit, sin reset/checkout descartado observado. |
| Objetos inalcanzables | `fsck` terminó exit 0 sin salida; no se encontraron objetos locales recuperables adicionales. |
| Incremento contractual | **44 archivos presentes, cero tracked** bajo `docs/specs/increments/`. Sin respaldo en el historial Git local inspeccionado. |
| Resto del corte previo a esta organización | Un pack de cobertura no versionado; dos contextos macro modificados. `.playwright-mcp/` contiene 113 artefactos ignorados. |

Estos conteos describen el corte **anterior a los nuevos índices y a este informe**, no un inventario final de cambios. No se verificó el remoto ni respaldo del sistema operativo. La falta de objetos recuperables no demuestra qué agente actuó o si nunca existió un archivo fuera de Git.

## Diagnóstico de desorganización

| ID | Problema | Impacto y disposición |
|---|---|---|
| DOC-01 | README afirmaba ausencia de OpenAPI y Gate1 macro pendiente; enlazaba el shared macro histórico como activo | Falsa sensación de pérdida. Corregir navegación sin mover contratos ni alterar aprobaciones. |
| DOC-02 | Re-review SA reportada sin informe ni condiciones durables; metadata de sesión parcialmente transcrita | No se puede demostrar alcance/cumplimiento. Mantener evidencia ausente explícita y recuperar o emitir revisión nueva. |
| DOC-03 | 44 documentos canónicos no versionados | Riesgo de pérdida y de clones incompletos. Preservación Git pendiente, con escaneo y revisión de alcance, por owner Git. |
| DOC-04 | Estados, conteos y refresh repetidos en cabeceras, shared, pack, Master y gates | Aumenta ruido y drift. Eliminar duplicación sólo con trazabilidad y sin cambiar decisiones; pack por curator, informes históricos conservados. |
| DOC-05 | Divergencia macro/local sobre hito tras ACK frente a registro previo a ACK | Divergencia explícita en Master §§9–10. Requiere reconciliación de decisión por owners arquitectónicos; no resolverla mediante una edición cosmética del README. |
| DOC-06 | Supuesto conflicto «6 fixtures previos + 7 negativos» frente a «4 válidos / 9 inválidos» | **No es contradicción aritmética:** los seis previos incluyen cuatro válidos y dos inválidos. Son dos clasificaciones del mismo total de trece, no un finding de contrato nuevo. |

## Propuesta de organización no destructiva

Decisión documental de esta intervención: **mejorar descubribilidad mediante enlaces antes de mover archivos**. Se descartan una segunda Master, copiar YAML manualmente, borrar `.working/` en bloque y atribuir nuevos dictámenes a informes ausentes. Impacto: navegación y diagnóstico; ningún endpoint, esquema, migración o integración cambia.

| Requisito | Criterio de aceptación | Disposición |
|---|---|---|
| ORG-01 — Entrada única | README raíz enlaza `docs/README.md`, Master V1 y shared activo; no dice que faltan contratos presentes ni aprobación macro ya registrada. | Corrección inicial en esta intervención; comprobar enlaces tras escritura. |
| ORG-02 — Autoridad explícita | Índice distingue requisitos, macro, contratos actuales, contextos históricos, prototipos y evidencia; no declara `ready` contractual. | Índice inicial en esta intervención. |
| ORG-03 — Recuperación honesta | Cada ausencia tiene fuente, estado no verificado y vía original/nueva; ningún texto de condiciones, firma o resultado se inventa. | Este diagnóstico; la recuperación efectiva sigue pendiente. |
| ORG-04 — Preservación | Los 44 archivos quedan incluidos en un respaldo durable y, cuando se autorice, commit revisado con escaneo de archivos no versionados. Registrar alcance/resultado sin equipararlo a validación del plan. | Pendiente; no commit ni push en esta intervención. |
| ORG-05 — Estado sin duplicación | Shared mantiene un único bloque de cada heading SDD obligatorio; pack actualizado por curator con evidencia vigente y sin reproducir el historial completo. Referencias a cortes antiguos marcadas como históricas. | Refresh focalizado solicitado; simplificación integral de shared/contratos todavía no aplicada. |
| ORG-06 — Custodia de revisiones | Definir y aprobar política de ubicación/retención de originales firmados y metadata saneada; cada revisión identifica autor/rol/fecha, snapshot, hallazgos y condiciones. Rutas `/tmp` no son la única custodia. | Propuesta pendiente. No copiar bundles bajo el freeze existente ni modificar su contrato en esta intervención. |
| ORG-07 — Histórico ordenado | Antes de archivar, inventariar consumidores/enlaces, conservar aprobaciones y procedencia; comprobar enlaces tras el traslado. No mover una fuente canónica sin decisión del owner. | Pendiente; ningún traslado ni eliminación aplicado. |

### Estructura mínima recomendada

Conservar las rutas actuales de contratos y arquitectura. Usar `README.md` → `docs/README.md` como entrada; `docs/reviews/` para diagnósticos documentales claramente separados de las revisiones contractuales; `.working/` para estado e índices curados. Evaluar archivo histórico **después** de preservar archivos y resolver el inventario, no antes.

## Verificación y siguiente decisión

Verificación posterior requerida: lectura de archivos escritos, existencia de enlaces locales, unicidad de headings del shared, ausencia de cambios en contratos y escaneo de secretos que incluya nuevos archivos. No declarar un PASS hasta ejecución real. G-OAS, G-SA, G-API-GOV, G-SCAN contractual, Spec Validator y aprobación humana contractual conservan su estado abierto.

Prioridad de recuperación: identificar con el humano si buscaba condiciones SA, informe Governance o metadata DevOps; aportar la salida original o solicitar revisión nueva si no puede obtenerse. Prioridad de organización: preservación durable, luego custodia de evidencia y reducción del historial repetido. Esta propuesta no es descomposición en tareas de implementación ni autoriza Executor/Task Decomposer.

## Resultados de la primera organización

- README raíz corregido; índice `docs/README.md` y este diagnóstico creados. Shared actualizado sólo para navegación, evidencia y aclaraciones, sin contratos ni gates alterados. No se movieron ni borraron documentos.
- Curator emitió pack **refresh #14 de 101 líneas**, frente a 148 del #13; conservó incompletitud, permisos, fuentes y bloqueos, reduciendo repetición e historial de sesiones.
- Revisión independiente por `reviewer`: enlaces locales y anchors comprobados, sin rotos; diez headings SDD obligatorios del shared únicos; estado macro frente a contractual correctamente separado. No es veredicto de Spec Validator.
- Residuales documentales de prioridad baja: cita G-SCAN del shared a `gate-register L7/L43` imprecisa (referencias correctas L9/L45); inventario histórico mezclado con citas actuales; repetición de autorización etapa A en el shared. Ya contemplados por ORG-05; no se reescribió el histórico en bloque.

### Escaneo y triaje de seguridad

Agente `security-reviewer`, gitleaks **8.30.1**, sólo verificación; `.gitleaksignore` intacto:

| Comando | Resultado observado |
|---|---|
| `gitleaks git --pre-commit --verbose` | exit 0, cero findings. No cubre por sí solo todos los nuevos archivos no versionados. |
| `gitleaks dir --verbose .` | exit 1, dos findings `generic-api-key` en `fixtures/contratos/schema-cases.v1.json`, líneas 9 y 10. Incluye archivos no versionados. |

**Triaje independiente: ambos son falsos positivos demostrados**, marcadores sintéticos de casos de validación, no credenciales. Evidencia semántica: la matriz se declara sintética; las instancias prueban combinaciones de autoridad R04 y su `idempotency_key` es un marcador inerte; el enum de autoridad está documentado en `integration-envelope.v1.schema.json`. No se publican valores ni fingerprints; no procede rotación por estas alertas.

**Estado del scanner: `Blocked: secret detected` según su salida, clasificado como falso positivo por seguridad; excepción o remediación aún no aprobada.** No se añadieron allowlists ni se editaron fixtures. El scan inicial coincidió con escritura del pack, por lo que no representa un snapshot frozen. Se requiere repetición tras terminar escrituras para verificar el corte final, y disposición autorizada de los dos findings antes de un scan limpio. Nada de ello declara cerrado G-SCAN contractual.

## Resolución mediante revisión nueva — 2026-10-03

El humano aportó un fragmento de conversación compactada de la sesión bloqueada: incluye invocaciones de SA y termina en un comando de enumeración de archivos temporales por DevOps, **sin mostrar respuestas ni condiciones de SA**. El fragmento no permite recuperarlas ni demostrar la causa del atasco. No se repitió ese comando, no se inspeccionó proceso externo y no se presume borrado.

Según autorización actual, se invocó `solution-architect` para una evaluación **nueva**. [Informe creado y leído](../specs/increments/entralo-v1-executable-specs/solution-architect-rereview-2026-10-03.md): `approved`, diseño SA-F01…07/10 y D-N1-01/N2–N6, condiciones textuales §6.1; 26 fuentes/rangos observados, sin hash/freeze ni pruebas. No ratifica la historia ausente ni modifica el informe original.

**Resuelto para ese alcance:** ya no es necesario recuperar el chat perdido para disponer de criterio y condiciones SA verificables. Master§14, registro de gates y shared enlazan la firma nueva; G-SA global queda parcial con P04/HC/residuales separados. Una recomendación de claridad `mechanical/minor` SA-RR-01 no bloquea aprobación de diseño; no se editó OpenAPI. Revisión nueva añade un documento al conjunto previo de 44; inventario técnico debe actualizarse antes de freeze.

**No resuelto por esta intervención:** informe histórico y metadatos DevOps originales, Governance independiente, G-OAS, escaneo limpio/freeze final, Spec Validator, aprobación humana contractual, preservación Git y sesión atascada. No hay implementación ni autorización de tooling/red nueva. Un scan posterior debe cubrir todos los bytes escritos en esta recuperación; resultados anteriores no certifican este corte.
