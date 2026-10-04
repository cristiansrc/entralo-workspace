# Índice documental de Entralo

Fecha de contraste: **2026-10-03**. Índice informativo, no segunda Master Spec ni registro de aprobación. El workspace sigue siendo documental: no hay aplicación de producción.

## Por dónde empezar

1. [README del workspace](../README.md): propósito y estado general.
2. [Contexto SDD activo](specs/.working/entralo-v1-executable-specs-sdd-context.md): estado, evidencia, bloqueos y próxima acción del incremento `entralo-v1-executable-specs`.
3. [Planning Context Pack](specs/.working/entralo-v1-executable-specs-planning-context.md): índice curado no normativo; verificar `pack_status` y sus fuentes antes de decidir.
4. [Master Spec V1](specs/increments/entralo-v1-executable-specs/master-spec.md): fuente contractual canónica inicial, lifecycle `planning`.
5. [Diagnóstico de recuperación](reviews/2026-10-03-documentation-recovery.md): qué falta, qué sí existe y cómo evitar otra pérdida.

**Estado contractual:** Spec Validator `verdict: none`; no aprobación humana contractual habilitante ni handoff de implementación. El `ready` conceptual histórico no cubre este incremento.

## Fuentes y responsabilidad

| Área | Fuente | Cómo interpretarla |
|---|---|---|
| Requisitos | [Brief V1](specs/requirements/entralo-v1-requirements-brief.md) | Reglas funcionales y límites; no inferir aprobación de implementación de una aprobación de requisitos. |
| Arquitectura conceptual | [Propuesta](architecture/architecture-proposal.md), [landscape](architecture/system-landscape.md), [context map](architecture/context-map.md), [integraciones macro](architecture/integration-map.md), [mapping](architecture/workspace-mapping.md) | Diseño, no runtime. Las divergencias con deltas actuales deben reconciliarse explícitamente, no ocultarse. |
| Decisiones | [ADRs](architecture/decision-records/), [resumen](architecture/decision-summary.md) | Autoridad y estado propios; conservar procedencia y alternativas. |
| Contratos V1 | [Master](specs/increments/entralo-v1-executable-specs/master-spec.md), [integraciones](specs/increments/entralo-v1-executable-specs/integration-contract.md), [descomposición](specs/increments/entralo-v1-executable-specs/decomposition-contract.md) | Canónicos actuales en `planning`. El contrato de descomposición no es un task board. |
| Datos y eventos | [Modelos de datos](specs/increments/entralo-v1-executable-specs/data/), [esquemas de eventos](specs/increments/entralo-v1-executable-specs/events/), [fixtures](specs/increments/entralo-v1-executable-specs/fixtures/) | DDL documental y datos sintéticos; no migraciones aplicadas ni evidencia de integración real. |
| Gates y cotejo | [Registro](specs/increments/entralo-v1-executable-specs/gate-register.md), [consistencia](specs/increments/entralo-v1-executable-specs/consistency-review.md), [política G-OAS](specs/increments/entralo-v1-executable-specs/api-lint-policy.md) | Criterios y cotejo del Planner; no reemplazan ejecución técnica o revisión independiente. |
| Revisiones contractuales | [SA nuevo](specs/increments/entralo-v1-executable-specs/solution-architect-rereview-2026-10-03.md), [SA anterior](specs/increments/entralo-v1-executable-specs/solution-architect-review.md), [registro Governance](specs/increments/entralo-v1-executable-specs/api-governance.md), [solicitud de revisión](specs/increments/entralo-v1-executable-specs/review-request.md) | **SA nuevo `approved` para diseño SA-F01…07/10 y D-N1-01/N2–N6**, condiciones persistidas, sin readiness global. Anterior `changes-required` conservado como histórico. P04/HC/residuales fuera de firma; Governance es registro Planner, no informe auditor. |
| Diseño | [Demo aprobado](designs/entralo-referencia-imagenes/README.md), [demo HTML](designs/entralo-referencia-imagenes/demo.html), [exploración anterior](designs/entralo-exploracion/), [assets](../estilo/) | Aprobación visual limitada; no aprueba negocio, pagos ni arquitectura. |

## OpenAPI: una sola ubicación actual

Directorio canónico: [specs/increments/entralo-v1-executable-specs/api/](specs/increments/entralo-v1-executable-specs/api/).

| Superficie | Archivo |
|---|---|
| Buyer BFF | [buyer-bff.yaml](specs/increments/entralo-v1-executable-specs/api/buyer-bff.yaml) |
| Admin BFF | [admin-bff.yaml](specs/increments/entralo-v1-executable-specs/api/admin-bff.yaml) |
| Identity | [identity.yaml](specs/increments/entralo-v1-executable-specs/api/identity.yaml) |
| Catalog | [catalog.yaml](specs/increments/entralo-v1-executable-specs/api/catalog.yaml) |
| Purchases | [purchases.yaml](specs/increments/entralo-v1-executable-specs/api/purchases.yaml) |
| Payments | [payments.yaml](specs/increments/entralo-v1-executable-specs/api/payments.yaml) |
| Ticketing | [ticketing.yaml](specs/increments/entralo-v1-executable-specs/api/ticketing.yaml) |
| Componentes comunes; no servicio HTTP | [common.yaml](specs/increments/entralo-v1-executable-specs/api/common.yaml) |

Blockchain no expone contrato HTTP V1 según Master §1. Las rutas a repositorios futuros en los mapas no representan carpetas creadas. No copiar estos YAML a otra ubicación para facilitar navegación: enlazarlos evita contratos divergentes.

## Actual frente a histórico

- **Activo:** un solo shared context del incremento V1, enlazado arriba. El pack es un índice regenerable, no fuente de verdad ni autorización.
- **Histórico de planificación macro:** [contexto de arquitectura](specs/.working/entralo-architecture-sdd-context.md), marcado `superseded` al inicio. Conserva la aprobación humana conceptual del 2026-10-02; no aplicar sus antiguas ausencias de contratos al estado actual.
- **Otros packs e informes en `.working/`:** consultar alcance y fecha; no tomar el mayor número de refresh o el nombre de archivo como prueba de vigencia.
- **Revisiones SA macro y V1:** son informes distintos, no copias intercambiables.
- **Evidencia externa citada:** no está verificada por este índice. Un enlace textual a `/tmp` o a una sesión no demuestra que el informe exista hoy.

## Qué sigue abierto en la documentación

1. **Dependencia de condiciones SA perdidas sustituida:** informe nuevo de diseño aprobado y condiciones §6.1, no recuperación de respuesta histórica. No volver a bloquear ese scope por el chat perdido; P04/HC y residuales de G-SA siguen separados.
2. Recuperar el informe independiente Governance o emitir uno nuevo tras cumplir su prerrequisito G-OAS. La ausencia histórica no crea un gate adicional.
3. Recuperar la salida DevOps de metadata y los informes externos citados. No repetir requests ni preparar tooling desde este índice.
4. Preservar en Git los documentos existentes con revisión de alcance y escaneo previo; esta organización no realiza operaciones Git de escritura.
5. Reducir duplicación de estados e historia y reconciliar divergencias de negocio en un cambio explícito revisado. Por ahora **no se movieron ni borraron fuentes canónicas**.

Los criterios y límites de esa reorganización están en el [diagnóstico](reviews/2026-10-03-documentation-recovery.md#propuesta-de-organización-no-destructiva).
