# Entralo — exploración visual para selección humana

Abre cualquiera de los HTML directamente en un navegador, sin servidor. Usa Inicio / Catálogo para llegar a un evento, elige localidad/tipo y cantidad, entra a Compra y luego a Checkout. El selector «Probar estado» permite simular vacío, carga, error, datos parciales, acceso requerido y desconexión; vuelve a «Normal» para continuar. Cambia el ancho del navegador para comparar móvil/escritorio. Todas las vistas son **modo claro únicamente**.

| Dirección | Archivo | Lenguaje visual | Pros | Contras |
|-----------|---------|-----------------|------|---------|
| A · Escenario | [a-escenario.html](a-escenario.html) | Hero inmersivo tipográfico, cartel de evento dominante y CTA escénico; listado en mosaico amplio | Emoción y reconocimiento rápido de los eventos; buena vitrina de lanzamiento | Hero ocupa más primer pliegue; catálogo menos denso |
| B · Agenda | [b-agenda.html](b-agenda.html) | Editorial cálido, listado por fechas, lectura lineal y ficha tipo programa cultural | Fácil comparar fechas y sedes; pocos estímulos para decidir | Menos impacto gráfico; eventos sin imagen pierden atractivo emocional |
| C · Radar | [c-radar.html](c-radar.html) | Estructura modular de exploración, cuadrícula compacta y selección a la vista | Mayor densidad y rapidez de recorrido; importes visibles desde temprano | Más elementos simultáneos; menor protagonismo de cada artista |

## Qué está y qué no está decidido

Las tres direcciones y sus tokens son **propuestas nuevas**, no design system de producción. `estilo/` inspira algunas formas/energía sin aprobar logo, hex, fuentes, tagline ni dominio. Se usa **Entralo** (nombre confirmado), **Colombia/COP** y localidades con cupo; eventos, precios y nombres son ilustrativos. El cargo de servicio se muestra separado **«por definir»** y el total final se deja pendiente, de modo que el pago no se puede ejecutar en estos prototipos. Mercado Pago aparece como proveedor decidido, no como integración. La reserva es de **20 minutos configurables**; su comienzo y vencimiento operativo siguen abiertos. No hay límites máximos de compra modelados.

El brief sigue `requirements-blocked` por Q-C01..Q-C07. Esta exploración paralela **no** cierra esos bloqueos ni autoriza implementación. Ver [design-context.md](design-context.md) para inventario de fuentes, ausencia de frontend y semilla propuesta de tokens.

## Decisión de diseño
**Aprobación humana de la demo visual actual (2026-09-29):** el usuario aprueba expresamente la demo visual actual como referencia visual. No selecciona expresamente A, B o C por separado ni aprueba por esta frase un design system, especificación funcional/legal, plan técnico o implementación.

Elegida (dirección específica A/B/C): <pendiente de selección explícita>
Justificación de dirección específica: <pendiente de la persona usuaria>

Se pueden combinar elementos de A/B/C en otra iteración antes de firmar una dirección concreta. El Gate 1 (`awaiting-human-plan-approval`) **aún no está activo**: la aprobación visual de la demo no lo sustituye ni desbloquea el brief `requirements-blocked`.
