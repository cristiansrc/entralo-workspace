# Revisión independiente Solution Architect — delta F02/F03

- Incremento: `docs/specs/increments/entralo-v1-executable-specs/`
- Fecha: 2026-10-02
- Autor: agente `solution-architect` (revisión de lectura; no es Planner, no es Spec Validator)
- Lifecycle del incremento: `planning`, `verdict: none` (esta revisión no lo modifica)
- Naturaleza: respuesta SA a la consulta formal de `review-request.md` L33 y L39–L41 (F02/F03), **acotada a este delta**. No es aval de producción, de go-live ni de implementación.

## 1. Scope y método

**En alcance (pedido):**

1. Refund adjustments (R07 por subconjunto de boletas), `paid_allocation` con cargo e impuestos fijos originales, cap acumulativo por componente, boleta, línea y orden.
2. Ciclo de vida CHANGE: sello al registro frente a ACK/commit, cancelación terminal, reapertura de ventas tras el cambio, usabilidad y elegibilidad de boletas.
3. Orden de la saga order / payment / issue frente al delta.
4. Compatibilidad de esquemas de eventos y fronteras de ownership.
5. Que el diseño no redefina requisitos y que el Planner etiquete con honestidad las aprobaciones sin resolver.

**Método:** lectura completa de los 27 artefactos del incremento y del pack de planificación `entralo-v1-executable-specs-planning-context.md` (refresh #2, 27 archivos / 3.954 líneas según el pack). Esos conteos NO fueron recontados línea a línea por mí; sí verifiqué con glob que son 27 archivos. Contraste con brief R-05/R-07/R-08 y con `integration-map` §5.0 (`docs/architecture`, sólo lectura).

**No hecho (por instrucción y por límite de herramientas):** parseo YAML/JSON, validación OpenAPI/JSON Schema, fixtures, Gitleaks, Git, código, tests, ejecución de SQL. Todo razonamiento sobre schemas es manual. Esta revisión **no sustituye G-OAS ni G-SCAN**.

## 2. Inventario auditado (27)

| Grupo | Cantidad | Archivos |
|---|---|---|
| MD raíz | 7 | master-spec, integration-contract, decomposition-contract, consistency-review, gate-register, review-request, api-governance |
| OpenAPI | 8 | api/{common,identity,catalog,purchases,payments,ticketing,buyer-bff,admin-bff}.yaml |
| Datos | 7 | data/{common,identity,catalog,purchases,payments,ticketing,blockchain}.md |
| JSON Schema | 5 | events/{integration-envelope,adjustment-snapshot,change-reopen,change-lifecycle,refund-adjustment}.v1.schema.json |
| **Total** | **27** | coincide con la ronda F02/F03 (`review-request.md` L43, `gate-register.md` L32) |

Este informe es el artefacto 28 del directorio; no forma parte del conjunto auditado.

## 3. Veredicto

**`changes-required` — NO listo, a nivel macro, para entregar al Validator.**

- 4 hallazgos `major` (SA-F01…SA-F04) requieren decisión o cierre de diseño del Planner (SA-F01 además puede requerir al humano) antes del handoff.
- 3 hallazgos `moderate` (SA-F05…SA-F07) deberían cerrarse en la misma pasada.
- 4 hallazgos `minor` (SA-F08…SA-F11).
- Ningún hallazgo exige cambiar servicios, stack, patrones acordados ni reglas cerradas.

**Esto no es readiness SDD.** Con o sin estos hallazgos siguen abiertos G-OAS, G-SCAN final, G-API-GOV, G-VALIDATOR, DR-05, DR-07, P-03, P-04 y los demás gates. No autoriza Task Decomposer ni Executor. Este informe tampoco cierra G-SA del incremento por sí solo: el cierre se registra en `gate-register.md`, que no edité.

## 4. Confirmaciones (sin hallazgo)

| Tema | Resultado |
|---|---|
| Patrones | Se confirman Adapter/ACL en infraestructura, Command para intención/retry, process manager durable en Purchases y enums/CAS en lugar de jerarquías State. Se confirma descartar Strategy fiscal hipotética, módulo ChangeProposal independiente (`event_control` basta) y transacción distribuida. Sin sobreingeniería detectada en F02/F03, salvo SA-F09/SA-F10. |
| Hexagonal / dominio | Sin fuga de DTO ni framework al dominio en el delta. `RefundAdjustment` es un agregado lógico con snapshot append-only, sin tabla ni DTO paralelos. |
| Cap acumulativo | Diseño sólido: PK `(order_id,line_id,ordinal,component)` en `refund_component_claim` impide solapamiento aunque cambien motivo, hito, key o adjustment. Suma RESERVED+UNKNOWN+INITIATED+CONFIRMED ≤ `paid_allocation`. Orden bloquea antes que claims. Payments revalida límite total fuera de tx de red. Cobertura de «partial» entendida como **subconjunto de boletas con nominal completo**: no existen pagos parciales (1 orden = 1 transacción MP, R-04), ni fracciones libres. |
| `paid_allocation` | Cargo/impuestos pagados se conservan por boleta, entran al digest y se separan de lo devuelto. `service`/`nominal_tax`/`service_tax` devueltos = `0.00` en R07. Correcto frente a R-07 «nominal sin servicio». El desglose se toma del `price_snapshot` PRICE-01 sin prorrateo. |
| Sello CHANGE | Una sola lectura `clock_timestamp` tras locks, durable al commit inicial, replay devuelve el mismo sello, `committed_at` y ACK no lo mueven, rollback inicial no deja hito. Coherente entre integration §7, Master §4/§9, `data/catalog.md`, `change-lifecycle` y `change-reopen`. |
| Reapertura | REQUESTED→PREPARED→COMMIT→OPENED exige commit aplicado, oferta ACK, ACK de ambos owners sobre `committed_event_version`, CAS bajo barrera exclusiva y `gate_version+1`; `OfferApplied` solo no abre. Replay idempotente. Sin llamadas recursivas. |
| CANCEL terminal | `cancelled_at` = hito al registro, estado CANCELLED, sin reopen (409), Ticketing bloquea uso, previos H2, usadas elegibles por R07 sin refund automático. Consistente con brief R-05/R-07. |
| Saga order/payment/issue | El delta no altera locks (cuenta→stock→orden), CAS único de aceptación, obligación de emisión en la misma tx, 3 intentos absolutos, UNCERTAIN/guard, R04 ni recovery RES01. No hay regresión de orden. |
| Ownership de eventos | `integration-envelope` fija productor por tipo; `order_id` null en Catalog/Ticketing-control; `RefundAdjustmentV1` sólo Purchases; ACK con `owner` coherente con `producer`. Esquema v1 sin consumidores desplegados: el cambio incompatible frente al borrador es aceptable y el registro `api-governance.md` L21 lo reconoce. |

## 5. ¿Redefine requisitos?

**Conclusión: no en lo estructural; sí hay consecuencias de requisito sin etiquetar (SA-F01).**

- R-07 se respeta: `purchased_at = payment_approved_at`, comparación estricta `<`, ventana `[hito, hito+3 meses calendario)`, renovación por último cambio, usada sólo en cancelación, SUPPORT necesario, sin refund automático.
- R-08 se respeta: identidad `order_id + motivo + alcance/adjustment_id`, clave MP desde `refund_id`, una total por orden, ajustes distintos identificables, 3 envíos 1/5/25 min, consulta antes de reintentar.
- R-13 se declara ausente del brief y no se inventa fee. Correcto.
- El cambio de «hito tras ambos ACK» a «hito al registro» contradice `integration-map` §5.0 (L230) y `architecture-proposal` L165, pero lo ordena la solicitud actual del usuario y el brief R-07 dice «hitos servidor al confirmar registro». Se acepta como diseño, no como redefinición. El drift documental queda en SA-F11.

## 6. Etiquetado de aprobaciones por el Planner

**Correcto:** Gate1 macro ≠ aprobación contractual; G-SA «Parcial» y sin firma atribuida; P-04 como propuesta; barrera ACK como «propuesta técnica Planner»; contador de cuota tras refund como propuesta; F02/F03 como `specified-awaiting-validation`; `verdict: none`; ningún `.sql`; no se afirma auditoría independiente.

**No sostenible tal como está escrito:** `master-spec.md` L149 y `consistency-review.md` L104 afirman «ninguna decisión humana real pendiente detectada para F02/F03». SA-F01 muestra una consecuencia de negocio de la precedencia del sello que debe verse y aceptarse explícitamente. Hasta entonces la etiqueta correcta es «decisión de producto pendiente de reconocimiento» (candidato a G-HUMAN-CONTRACT, sin repetir Gate1).

## 7. Hallazgos tipados

Tipos: `architectural-decision` (requiere elegir entre alternativas), `design-gap` (falta de diseño o contradicción interna), `mechanical` (texto o referencia; ruta spec-remediator), `simplification`, `process-drift`.

### SA-F01 — `architectural-decision`, major: ventas aceptadas en la ventana registro→barrera quedan fuera de R07

- **Evidencia:** integration §7 pasos 1–2 y 6, y L88 («no se backdatea para incluir pagos posteriores»); Master §4 («Ventas con approval previo admisible se completan»); `data/ticketing.md` L62 (emisión posterior a cancelación crea boletas ANULADA); brief R-07 (empate/posterior fuera).
- **Problema:** entre el sello T del registro y la barrera efectiva de Purchases pueden admitirse holds/permisos y completarse ventas (H2). Su `payment_approved_at ≥ T`, por lo que no son elegibles por R07. En CANCEL, el comprador pagó un evento ya cancelado en el sistema, su boleta queda ANULADA, R04 no aplica (la venta se aceptó) y no existe ruta de devolución salvo excepción PRODUCT_OWNER. En CHANGE, compra con el horario viejo y sin derecho de refund. El diseño anterior (hito tras ACK) no tenía este hueco.
- **Alternativa simple (A):** aceptar el riesgo explícitamente como residual conocido, nombrar la vía PRODUCT_OWNER (R-07 «excepciones product owner») y añadir señales: `purchases_accepted_after_change_recorded_total{kind}` y la edad de la ventana. No cambia requisito. (B) Tratar esas ventas como elegibles redefine R-07 y exige decisión humana; no la tomo aquí.
- **AC propuesto:** una venta con approval en `[T, barrera)` queda registrada con marca de ventana y visible a SUPPORT; la métrica es > 0 y se alerta; el runbook cubre devolución por excepción.
- **Impacto:** Master §9/§Aclaraciones, integration §7, `gate-register` (G-HUMAN-CONTRACT condicional). Redactar la decisión de producto como pendiente de reconocimiento.

### SA-F02 — `design-gap`, major: nadie crea el mapping legítimo de ADJUSTMENT

- **Evidencia:** `api/*.yaml` sin operación de creación de ajuste (grep `adjustment_id` sólo en RefundRequest, GuardRequest y snapshot); integration §8 («buyer sólo aporta adjustment_id», «mapping legítimo previamente registrado»), `RefundAdjustmentV1` «al crear mapping legítimo (no solicitud buyer ni approval)».
- **Problema:** el origen del mapping (actor, evento, endpoint o job) no está especificado. Sin él, `ADJUSTMENT_NOT_FOUND` es siempre alcanzable y no hay forma de probar el flujo. Consecuencia con CHANGE: en una orden con una boleta usada, el ORDER se rechaza completo (REJECTED_USED), y las boletas sin usar sólo podrían recuperarse vía un ajuste que nadie sabe crear.
- **Alternativa simple:** o bien (A) operación SUPPORT-only en Purchases que crea el snapshot desde boletas elegibles de la orden (sin monto libre, mismo digest), o bien (B) crear el snapshot dentro de `requestOwnRefund` cuando el comprador elige boletas (requiere decisión de producto: afecta «sin lista libre del comprador»). Recomiendo (A), pero la elección no es mía.
- **AC propuesto:** existe una única ruta de creación con autorización explícita, idempotente por `(order_id,adjustment_id)`; cualquier snapshot posterior idéntico es replay; contenido distinto → 409.
- **Impacto:** `api/purchases.yaml` y `api/admin-bff.yaml` (si SUPPORT), `data/purchases.md`, integration §8, Master §9.

### SA-F03 — `design-gap`, major: guard BLOCKED y claims sin ruta de liberación tras REJECT o FAILED_FINAL

- **Evidencia:** integration §2 (BlockTickets «antes de approval»), `api/ticketing.yaml` L138 («BLOCKED impide acceso antes autorización SUPPORT»; «no restaura automáticamente»), `data/ticketing.md` (`refund_guard.state` sólo BLOCKED/REJECTED_USED, sin transición de salida), `RefundApproval` decision REJECT; integration §8 («rechazo antes dispatch **puede** liberar»; FAILED_FINAL «requiere ausencia monetaria probada»).
- **Problema:** si SUPPORT rechaza o el refund termina FAILED_FINAL sin dinero devuelto, las boletas del alcance siguen bloqueadas para ingreso y los claims no tienen regla normativa de liberación. Afecta directamente usabilidad de boletas válidas.
- **Alternativa simple:** transición explícita `BLOCKED→RELEASED` en Ticketing por comando idempotente `ReleaseRefundGuard` (misma key `refund_id`+versión), emitida por Purchases sólo tras REJECT o FAILED_FINAL con ausencia monetaria canónica probada; claims RESERVED se liberan en la misma tx de Purchases.
- **AC propuesto:** REJECT libera guard y claims exactamente una vez; boleta vuelve a VIGENTE; replay no libera dos veces; incierto no libera.
- **Impacto:** `data/ticketing.md`, `api/common.yaml` (`refund_guard_state`), integration §2/§8.

### SA-F04 — `design-gap`, major: identidad única de refund vs REJECTED/FAILED_FINAL y vs ventana renovada

- **Evidencia:** `data/purchases.md` L119–L120: `refund_business_key_idx` **sin filtro de estado**, `refund_one_total_idx` con `state<>'REJECTED'`; `data/payments.md` L53–L54 (`refund_total_idx` sin filtro). integration §8 («nueva clave mismo ajuste devuelve refund existente»); AC-F03-06 (C2 renueva la ventana).
- **Problema:** (1) un refund REJECTED por boleta usada bajo C1 bloquea para siempre la misma `(order,reason,scope,adjustment)` aunque C2 renueve la elegibilidad; (2) FAILED_FINAL conserva `refund_one_total_idx`: aunque se liberen los claims, no se puede reintentar el ORDER; (3) los dos índices de Purchases se contradicen en el tratamiento de REJECTED; (4) no se dice si los claims se toman en REQUESTED o al AUTHORIZED.
- **Alternativa simple:** declarar que REJECTED/FAILED_FINAL son terminales para el `refund_id` pero **liberan la identidad** cuando se prueba ausencia monetaria (índice parcial `state NOT IN ('REJECTED','FAILED_FINAL')` en ambos owners) y que la nueva solicitud crea otro `refund_id`; tomar claims en REQUESTED y liberarlos al terminal. No añade requisito: es aplicar R-08 («una total por orden»).
- **AC propuesto:** REJECTED bajo C1 + nueva solicitud bajo C2 → nuevo `refund_id` sin duplicar nominal; FAILED_FINAL sin dinero → reintento permitido; nunca dos vivos.
- **Impacto:** `data/purchases.md`, `data/payments.md`, integration §8.

### SA-F05 — `architectural-decision`, moderate: CANCEL bloqueado detrás de un CHANGE incompleto

- **Evidencia:** integration §7 paso 1 («ausencia de control anterior incompleto»), `api/catalog.yaml` L118 («Control incompleto 409»), `data/catalog.md` L87 (`control_one_unacked_idx`), L98 («Validar tx control previo incompleto»).
- **Problema:** un CHANGE esperando ACK (owner caído) impide registrar la cancelación del mismo evento. La cancelación es el caso con mayor urgencia operativa. Tiene el mismo riesgo de «vendedor en PENDING» que el propio informe reconoce.
- **Alternativa simple:** CANCEL puede **sustituir** un CHANGE no OPENED (precedencia monótona CANCEL > CHANGE; el sello CANCEL se fija en su propio registro; el CHANGE queda `SUPERSEDED` sin reopen). Alternativa descartable: mantener 409 y escalar por runbook.
- **AC propuesto:** CHANGE en CLOSING sin ACK + CANCEL → registra cancelación terminal, el reopen del CHANGE queda inerte, el hito CHANGE previo se conserva para R07.
- **Impacto:** integration §7, `data/catalog.md`, `api/catalog.yaml`.

### SA-F06 — `design-gap`, moderate: Payments no puede detectar mismatch de digest y el digest del ORDER no está definido

- **Evidencia:** integration §8 («snapshot digest replay mismatch incidente» en Payments) frente a `data/payments.md` `refund_execution` (sin `snapshot_digest`, sin `guard_version`); `refundCommand`/`refundGuard` ORDER: `adjustment_snapshot` null y `snapshot_digest` «del alcance de orden congelado» sin esquema ni regla de canonicalización; `refundGuard.tickets minItems 1` con `reason R04` permitido, mientras `common.yaml` L558 dice que R04 sin emisión no usa lista.
- **Problema:** una verificación exigida no tiene dato donde apoyarse; el alcance ORDER (restante elegible) no es verificable por Ticketing ni Payments.
- **Alternativa simple:** añadir `snapshot_digest` y `guard_version` a `refund_execution`; definir `OrderScopeSnapshot` mínimo (lista ordenada de `ticket`+componentes nominales restantes) hasheado igual (RFC 8785); retirar `R04` del enum de `refundGuard`/`GuardRequest` o permitir `tickets` vacío sólo en R04.
- **AC propuesto:** replay con digest distinto → conflicto sin dinero en Payments; ORDER posterior a ADJUSTMENT produce un digest reproducible desde datos de Purchases.
- **Impacto:** `data/payments.md`, `events/integration-envelope.v1.schema.json`, `api/common.yaml`.

### SA-F07 — `design-gap`, moderate: el canal admin no puede consultar el estado del CHANGE/CANCEL

- **Evidencia:** `api/catalog.yaml` L134–L141 (`readCatalogOperation`, `listManagedEvents`); `api/admin-bff.yaml` sin `/v1/admin/operations/{id}` ni listado; `OperationReceipt.resource_path` es «ruta relativa misma API owner».
- **Problema:** el 202 de `/controls` apunta a un recurso que el canal admin no expone, por lo que PENDING/COMPLETED/FAILED y la espera de ACK no son visibles para EVENT_ADMIN.
- **Alternativa simple:** proxy `readAdminOperation` (y opcionalmente `listAdminOperations`) en `admin-bff.yaml` con la misma matriz de errores del owner.
- **AC propuesto:** tras `controlAdminEvent` el canal puede leer la operación hasta COMPLETED/FAILED; no se anuncia disponibilidad bajo CLOSING.
- **Impacto:** `api/admin-bff.yaml`, `consistency-review.md` (matriz F-05/C5).

### SA-F08 — `mechanical`, minor: texto residual contradictorio (ruta spec-remediator)

- `api/admin-bff.yaml` L110: «hito sóloACKambos» contradice F03 (hito al registro). Debe alinearse con `api/catalog.yaml` L118.
- `data/catalog.md` L73: «firstnewmilestone UTCBDalconfirmar» es ambiguo frente a «registro inicial». Aclarar «al registro, no al ACK».
- `data/catalog.md` L53/L96: estado `RECORDED` se usa para «términos aplicados», en choque con «registro inicial». Aclarar nombre o semántica (ver SA-F10).

### SA-F09 — `simplification`, minor: `RefundAdjustmentV1` sin proyección en el consumidor

- **Evidencia:** integration §8 L108 («inbox+proyección sólo mapping»); `data/ticketing.md` no define tabla de proyección; el guard ya recibe el snapshot completo y verifica membresía.
- **Problema:** evento, cola, retries y outbox sin estado persistido útil en Ticketing. Es acoplamiento adicional sin beneficio demostrado.
- **Alternativa simple:** eliminar el evento (el guard valida membresía con el snapshot recibido) o definir la tabla de proyección y un AC que la use. Elegir antes de la materialización; el esquema v1 aún no tiene consumidores.

### SA-F10 — `simplification`, minor: higiene de compatibilidad de eventos v1

- Alias `CloseEventRequestedV1`, `EventSaleGateClosedV1` y `EventControlAppliedV1` se mantienen en el enum «sólo compatibilidad documental»; sin consumidores desplegados no aportan. Además los dos últimos no restringen `owner`↔`producer` como sí hace `ChangeAcknowledgedV1`. Recomendación: retirarlos de v1 o aplicar la misma restricción.
- El ACK reutiliza `recorded_event_version` para dos fases (barrera vs aplicación) y `gate_version` para el `control_version` de Ticketing. Recomendación barata antes de congelar: campo `ack_stage` (`BARRIER|APPLIED`) y nombre honesto para la versión reconocida.
- `event_control.state` usa `RECORDED` para «aplicado»; usar `APPLIED` evita confusión con el registro inicial.

### SA-F11 — `process-drift`, minor: documentación macro y de gates desalineada

- `integration-map` §5.0 (L230) y `architecture-proposal` L165 siguen diciendo «hito tras ambos ACK» y no se editan: aceptable, pero registrar la divergencia como delta local referenciable para Enterprise Architect y para el Validator, no como decisión del macro.
- `gate-register.md` G-CURATOR («pack ahora stale») y `master-spec.md` L141 / `review-request.md` L36/L43 describen el refresh como pendiente, mientras el pack ya declara refresh #2 ejecutado (27/3.954). Alinear el estado en una pasada documental.
- `consistency-review.md` L85 mantiene conteos y estados F-05/C5 marcados `pass documental`; no cambian por este informe.

## 8. Qué debe pasar a continuación

1. **Planner:** decidir o redactar SA-F01 como «pendiente de reconocimiento» y elegir alternativa en SA-F02…SA-F07; no cerrar F02/F03 por cotejo propio.
2. **spec-remediator:** SA-F08 (mecánico).
3. **Orquestador:** registrar esta respuesta como entrada de G-SA del incremento solo si se acepta su alcance; despachar G-OAS con validador técnico; no abrir api-governance hasta sintaxis válida.
4. **Re-revisión SA** solo si cambia el diseño de SA-F01…SA-F07; no hace falta si sólo se aplican SA-F08…SA-F11.
5. **Spec Validator:** no antes de G-SCAN final, freeze y cierre de los `major`.

## 9. Firma

| Campo | Valor |
|---|---|
| Rol | solution-architect (agente) |
| Fecha | 2026-10-02 |
| Alcance firmado | Revisión SA del delta F02/F03 (diseño de refund adjustments, ciclo CHANGE, saga, compatibilidad de eventos) sobre los 27 artefactos releídos |
| Verdict | `changes-required` (4 major, 3 moderate, 4 minor) |
| Readiness SDD | **No declarado.** Sin parser, sin scan final, sin Validator, sin aprobación humana contractual |
| No firmado | OAS/JSON Schema, Gitleaks, DR-05, DR-07, P-03, P-04, go-live, ni aprobación humana de nada |
| Archivos modificados | Sólo este informe |
