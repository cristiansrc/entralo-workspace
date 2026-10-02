# ADR-001 — Seis servicios y ownership de datos

- **Estado ADR:** `proposed`; **Lifecycle status:** `draft`; revisión `revision-needed`.
- **Fecha:** 2026-10-01 (delta D-AUTH-01; origen 2026-09-30); **Owner:** producto Entralo + responsables de servicio propuestos; autor Planner.

## Contexto
Usuario descarta monolito y declara seis servicios. Compra/stock requieren integridad fuerte; separación completa stock/order añadiría otra frontera distribuida. Brief R-01–R-12, [context-map](../context-map.md), [landscape](../system-landscape.md).

## Decisión propuesta
Seis deployables/contextos Identity, Catalog, Purchases+Inventory, Payments, Ticketing+Validation y Blockchain. Purchases único writer stock/order, orquestador y owner refund autorizado/fiscal manual/PDF/avisos. Cada servicio base lógica propia/schema app/usuarios exclusivos/Flyway local; instancia RDS compartible V1 sin tablas compartidas. Identity no duplica Cognito, Catalog no vende, Payments no adjudica cupos, Blockchain no concede acceso. Roles funcional/técnico del landscape deben asignarse a personas antes operar.

**D-AUTH-01 — límite/ownership vinculantes:** visitante consulta eventos públicos sin sesión, pero auth obligatoria antes hold; compra y solicitud de refund sobre cuenta propia autenticada. Identity vincula issuer+sub validado a userId estable; Purchases obtiene owner server-side y lo fija inmutable en hold/orden/compra/solicitud. Contador por `userId+event_id`, default8/orden y8/cuenta-evento incluyendo confirmadas/holds/gracia/UNKNOWN, serializado junto con stock+orden antes crear hold; no contador por sesión/dispositivo/cookie anónima/tarjeta. Owner de negocio no se comparte como entidad JPA/domain entre servicios; contratos transmiten referencia opaca subject_id del mismo userId.

**Relojes/continuación:** selección y login no crean reserva ni garantizan stock. Purchases revalida disponibilidad al hold y precheck I-24 antes MP. TTL desde created_at del hold; sesión expirada niega nuevas acciones hasta reauth del mismo owner dentro estado/plazos originales, nunca transferencia/renovación ni revivir LIBERADA. Jobs conciliación/emisión/refund conservan autoridad interna sin sesión abierta. No nuevos servicios/stack/tablas compartidas; contrato macro y AUTH-01–06 en integration §2.2, modelo físico posterior.

R-7/L-1: Catalog autora términos comerciales/fiscales/costos; **Purchases pricing** posee total/fee/margen/refund canónicos mediante snapshot y regla única **PRICE-01** (context-map §4). BFF admin compone términos Catalog y estimador Purchases I-27; Catalog **no llama sync Purchases**. BFF buyer compone oferta Catalog y proyección availability Purchases I-21. Purchases lee hechos hito/uso Catalog/Ticketing I-22 y decide refund, no recibe decisión remota ni callback circular. Payments valida importe autorizado y conserva costo MP real. Sin duplicación de fórmula/domain library; scale/redondeo P a verificar MP, no regla fiscal aprobada.

R-8: particionar Purchases en módulos hexagonales inventory/ordering/pricing/purchase-saga/refunds/documents-fiscal/notifications, contratos internos y transacción local inventario+orden. Workers saga/corte/refund/documentos/avisos separados para capacidad/IAM/colas, no extraer servicios por mera cantidad de responsabilidades; límites/patrones/AC MOD-01–04 en context-map §6. Sin god facade, controllers→use cases→ports; workers no escriben tablas saltando aplicación.

## Alternativas
- Monolito modular: descartado por preferencia explícita usuario, no por afirmar que no escale.
- Inventory separado: descartado para propuesta inicial por transacción local cupo/orden y seis servicios acordados.
- Schema por servicio en una DB: posible pero aislamiento/permisos/restore menos claros; preferir seis DB lógicas. Instancias por servicio: mayor aislamiento, costo pendiente según carga.
- Shared tables/domain library: descartado por ownership y acoplamiento.
- Hold anónimo adoptado al login, límite por session_id/dispositivo y cambio de owner al reautenticar: descartados por D-AUTH-01; crean bypass de límite/propiedad. Renovar TTL por login: descartado, contradice reserva con reloj servidor. No nueva alternativa de negocio sometida a aprobación.

## Consecuencias y acceptance criteria
Más contratos, despliegues, pools y guardia desde V1; no simplicidad de ACID global. ADR1-AC1: sólo credencial owner escribe store; joins/FKs/imports remotos ausentes. ADR1-AC2: último cupo/8 por cuenta serializados en Purchases, ningún Payments/Ticketing escribe stock. ADR1-AC3: matrices/C4 nombran exactamente seis contextos y owners. ADR1-AC4: mismos terms/engine/rounding version dan total igual en estimador/checkout/refund snapshot; saturar avisos no bloquea reserva/corte/refund. Alternativa fee engine Catalog descartada en propuesta por separar cálculo autoritativo de transacción/snapshot Purchases; términos siguen Catalog, no dos escritores.

- ADR1-AC5: dos sesiones/dispositivos del mismo userId reservan concurrentemente y no superan8 agregadas/evento con confirmadas/gracia/UNKNOWN; visitante sin auth o userId cliente suplantado no crea hold/orden ni consume stock, auth antes hold y disponibilidad fuerte verificadas.
- ADR1-AC6: sesión A expira con hold activo; reauth A conserva owner y todos los relojes, reauth B no opera/transfiere hold/compra/refund de A ni renueva reserva. Jobs internos siguen reglas previas sin login; stock no garantizado al autenticarse ni al recuperar hold liberado. ADR proposed, pendiente consulta/validación independiente, no Gate1.

Confirmación humana pendiente; seis servicios no convierte ADR accepted. **I-2 / DATA-01:** una RDS Multi-AZ física inicial/seis DB lógicas, no seis instancias por contar microservicios ni aislamiento físico/PITR lógico. No separar Purchases ahora sin evidencia; carga mixta/DR/headroom y coste1/2/3/6 instancias **antes go-live**. Si falla por contención compartida, aislar antes prod; hotness determina Purchases/Ticketing/Payments primero. Trigger tres ventanas5min SLO/errores/headroom insuficiente, breach integridad/deadline inmediato; endpoint por owner desde bootstrap, writer único/fences/pausa/conciliación/cutover y rollback no ciego. Contrato conceptual y I2-AC01–04 [propuesta §11.1](../architecture-proposal.md). Trade-off costo base menor vs blast radius failover/IOPS/CPU/locks/mantenimiento/PITR compartido; workers separados no eliminan riesgo.

**M-2 / ADR1-AC7:** Identity posee vínculo único issuer+sub→UUID y lifecycle; onboarding/login/refresh antes sesión operable, assertion firmada BFF fresca permite hold sin lookup Identity sync, cache no grants actuales. Suspensión/recreación nunca transfiere owner histórico. Propuesta §7.1/M2-AC01–05, ADR003; no entidades compartidas.
