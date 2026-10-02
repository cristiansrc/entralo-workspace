# Contexto visual — exploración Entralo

## Fuentes y vigencia

- `../../specs/requirements/entralo-v1-requirements-brief.md` (estado **requirements-blocked**, Q-C01..Q-C07 sin resolver).
- `../../specs/.working/entralo-visual-proposals-sdd-gate-planning-context.md` y packs de decisiones y migración referenciados allí. No existe Master Spec ni contrato OpenAPI en este workspace.
- `../../../estilo/logo.png`, `logo-fondo.png`, `paleta.png`, `banner.png`, `pagina.png`, `brand-board.png`, `Mini-design-system.png`: referencias iniciales, **ningún asset aprobado**. En particular el último tiene procedencia sin confirmar. Se inspeccionaron los boards y el inventario de los siete archivos; no se incrustan PNG para que cada HTML funcione sin archivos auxiliares.

## Auditoría del sistema existente

La raíz contiene `docs/` y `estilo/` solamente: no hay `src/`, frontend, `tailwind.config.*`, `tokens.*`, `theme.*`, CSS global, librería `components/ui|common|shared`, escala tipográfica, espaciado/radios de código ni estrategia de modo oscuro. **Inventario de tokens y componentes reutilizables: ninguno.** Los boards de `estilo/` son material exploratorio, no tokens del repo. No hay conflicto entre tokens *implementados*; la discrepancia de euros frente a COP y el dominio propuesto en los PNG se resuelven a favor de las decisiones documentadas (COP; dominio abierto), no heredando esos elementos.

## Semilla propuesta (no aprobada)

Cada HTML declara al inicio de `<style>` sus propios roles `--ink`, `--muted`, `--surface`, `--canvas`, `--line`, `--accent`, `--accent-ink`, `--focus`, `--danger`, `--success` y `--soft`; diez roles cromáticos propuestos, **no** ramp oficial. Tipografía local de sistema: 12/14/16/24/40 px (cinco escalones), base de espaciado 4px y radios 8/16px. Paleta y tipografías de las imágenes no quedan aprobadas: A explora acento expresivo, B un editorial cálido y C una cartografía de información. Los tres se diseñan solo en **modo claro**.

## Límites funcionales visibles en los artboards

- Mercado Colombia, COP, Mercado Pago como proveedor futuro; los botones de pago de estos prototipos **no cobran ni reservan cupo real**.
- Se muestra precio de boleta de ejemplo, pero **cargo de servicio, pagador, importe final y conducta al vencer la reserva siguen por definir (Q-C03/Q-C06)**. El CTA de pago final se deshabilita expresamente: no se propone cobrar con un total indeterminado.
- Localidades con cupo, nunca asiento numerado; las cantidades son solo exploración de interacción, no límites comerciales. Los eventos y disponibilidades son **datos ficticios ilustrativos** administrados por Entralo en este concepto; ninguna cifra de cupo se compromete.
- Se mencionan 20 minutos configurables sin mostrar contador que presuponga inicio/expiración exactos. No se diseñan políticas de devolución, factura ni prueba pública como si estuviesen resueltas.
- Los estados vacío, cargando, error, parcial, acceso requerido y offline son **simulaciones UI** desde un selector de pruebas visible; el flujo feliz recupera selección e importes al regresar. Se omite autenticación real deliberadamente.

## Accesibilidad de diseño

Landmarks, enlace de salto, idioma español, foco visible, botones táctiles ≥44px, labels persistentes, mensajes dinámicos `role=status/alert`, validación al salir del campo, resumen en checkout y sin temporizador automático. Contrastes de tokens elegidos para legibilidad; revisión automatizada y con tecnologías de asistencia requerida antes de implementar. El HTML de exploración no equivale a auditoría WCAG ni a un proceso de pago real.
