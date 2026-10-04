# Adjudicación Gitleaks — fixtures de contratos (2026-10-03)

- **Fecha:** 2026-10-03
- **Lifecycle:** `planning` (esta entrada NO cierra ni marca ready ningún gate contractual; no es evidencia GSCAN)
- **Autoría responsable:** agente Git Executor (rol Git) ejecutando, por decisión ya emitida
  del `security-reviewer` y con autorización humana explícita del responsable del repositorio
  (literal registrado: «si autorizado»), la aplicación de las dos supresiones estrechas.
- **Naturaleza:** registro durable de una adjudicación PREVIA. No constituye una revisión de
  seguridad nueva ni una re-triaje; no se convoca revisión adicional.

## Alcance adjudicado

| Campo | Valor |
|---|---|
| Regla | `generic-api-key` |
| Path | `docs/specs/increments/entralo-v1-executable-specs/fixtures/contratos/schema-cases.v1.json` |
| Líneas (start-line) | `9`, `10` |
| Formato | Gitleaks v8 filesystem fingerprint: `file:rule-id:start-line` |
| Excepciones aplicadas | 2 (exactas, una por línea) |

Los límites de la supresión son **sintácticos**: `file` + `rule` + `line`. No hay ninguna
supresión semántica (no se ignora por contenido, por contenido parcial, por regex amplia ni
por clase de hallazgo).

## Clasificación

- **Veredicto del security-reviewer:** dos FALSOS POSITIVOS demostrados.
- **Motivo sintético:** los matches provienen de marcadores sintéticos de prueba
  (`idempotency_key` con valor de caso `R04`) dentro de fixtures JSON de contratos
  de validación. Son datos de fixtures, no material sensible.
- **No son credenciales.** No existe credencial real asociada; por tanto **no aplica
  revocación ni rotación**.

## Controles aplicados

- Sin wildcards, sin desactivación de la regla, sin regex global, sin allow-inline
  (`gitleaks:allow`), sin baseline.
- Entrada histórica previa preservada sin modificación:
  `docs/architecture/architecture-proposal.md:generic-api-key:293`.
- Ni el fixture JSON/OpenAPI ni ningún código/runtime fueron alterados por esta excepción.
- **Reversión requerida:** retirar/revisar estas dos entradas si el fixture
  `schema-cases.v1.json` cambia de estructura o de numeración de líneas, o si la
  clasificación de seguridad de esos matches cambia.
