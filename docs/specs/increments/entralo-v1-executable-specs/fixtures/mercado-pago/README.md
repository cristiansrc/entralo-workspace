# Fixtures documentales — Mercado Pago payment webhook

Lifecycle status: `planning`. Policy `mp-payment-webhook-v1`, versión 1. **Ejemplos sintéticos con estructura de proveedor; no captura de cliente/sandbox, prueba de firma, PCI ni certificación DR-05.** Sin credenciales, PAN/CVV, valores de token, direcciones de email, nombres o datos reales; campos prohibidos negativos contienen sólo marcadores inertes. No URL bearer ni firma reutilizable.

Fuente consultada mediante Context7 el 2026-10-02: `/websites/mercadopago_br_developers_pt`, ejemplo oficial en https://www.mercadopago.com.br/developers/pt/docs/shopify/additional-content/your-integrations/notifications/webhooks. La estructura publicada contiene id/live_mode/type/date_created/user_id/api_version/action/data.id. `payment-created` conserva estructura/fecha de ejemplo, usa live_mode=false; `payment-updated` y variantes son derivaciones sintéticas. No afirmar soporte de modalidad Colombia/sandbox a partir de docs de otra integración/región.

Schema autoritativo: `../../api/common.yaml#/components/schemas/MercadoPagoPaymentNotificationV1`. Semántica HTTP/inbox: `../../api/payments.yaml`, `../../integration-contract.md` §9. Todos los escenarios semánticos siguientes **suponen autenticidad ya verificada por fixture de firma separada DR-05**, no bypass de seguridad. G-OAS prueba schema sin llamar al proveedor; las verificaciones inbox/firma son acceptance futura, no ejecución aquí.

| Archivo JSON | Schema esperado | Query data.id / precondición | HTTP esperado tras auth y disponibilidad |
|---|---|---|---|
| payment-created.v1.json | válido | 999999999, inbox vacío | 204 inbox+job durables; consulta pendiente, cero venta por body |
| payment-updated.v1.json | válido | 999999999, ID notificación distinto | 204; integer/string exactos, no segundo cobro |
| payment-minimal.v1.json | válido | 999999999, x-request-id sintético estable | 204; usa fallback inbox key; replay mismo header/body204 |
| unknown-root.v1.json | inválido additionalProperties raíz | 999999999 | 400 VALIDATION_ERROR, cero inbox/job; nunca409 |
| unknown-data.v1.json | inválido additionalProperties data | 999999999 | 400 VALIDATION_ERROR, cero inbox/job; nunca409 |
| inbox-conflict.v1.json | válido | 999999999, inbox de payment-created existente | 409 IDEMPOTENCY_CONFLICT: mismo payment:12345, hash distinto por action; original intacto |
| unsupported-type.v1.json | inválido const type | 999999999 | 400 VALIDATION_ERROR, cero inbox/job |
| zero-id.v1.json | inválido minimum ID | 999999999; body0 | 400 VALIDATION_ERROR, cero inbox/job |
| leading-zero-id.v1.json | inválido pattern ID | 999999999; body0999 | 400 VALIDATION_ERROR, cero inbox/job |
| invalid-date.v1.json | inválido date-time (fecha imposible) | 999999999 | 400 VALIDATION_ERROR; exige assertion de formatos |
| missing-date-zone.v1.json | inválido date-time (sin zona) | 999999999 | 400 VALIDATION_ERROR; exige assertion de formatos |
| forbidden-token-field.v1.json | inválido additionalProperties raíz | 999999999 | 400 VALIDATION_ERROR; marcador no credencial, sin echo |
| forbidden-email-field.v1.json | inválido additionalProperties data | 999999999 | 400 VALIDATION_ERROR; marcador no dirección, sin echo |

Casos de aplicación, **no validables mediante body JSON Schema**: replay exacto de payment-created→204/cero job extra; mismo payload con id=12347→204/nueva notificación, no conflicto por data.id compartido; query999999998 con payment-created→400 WEBHOOK_ID_MISMATCH/cero inbox tras autenticidad válida; caída DB→503/rollback/cero ACK durable. Firma ausente/inválida/manifiesto alterado/expirada→401 TOKEN_INVALID/cero inbox/job; exige evidencia DR-05, no firma sintética inventada. Para el par de conflicto G-OAS sólo prueba schema válido; hash/inbox/DB/seguridad quedan aceptación de aplicación futura. No introducir PAN/CVV en fixtures para probar rechazo; unknown-root/data y marcadores inertes prueban cierre de propiedades sin datos financieros. Errores nunca incluyen valores rechazados (rejected_value=null).

Conjunto actual: 13 JSON MP (4 válidos, 9 inválidos) + este README. Nuevos casos y matriz `../contratos/schema-cases.v1.json` son documentales, no tests/scripts ni resultados ejecutados. `format: date-time` ya existe; sin motor que aserte formatos los dos negativos de fecha deben registrarse blocked, no pass. Disposición de warnings/formatos/generador y semántica de firma: `../../api-lint-policy.md`. El informe externo de seis JSON no valida estos bytes nuevos.

DR-05 requiere captura sandbox **sanitizada** de la modalidad contratada y fixtures de firma/replay sin secretos reales antes adapter real. Nueva extensión del proveedor no se ignora automáticamente: Planner añade allowlist, revisión privacidad, policy v2 y fixtures positivos/negativos antes activación. Se preserva el ejemplo v1 histórico para compatibilidad. Ausencia de captura sandbox sigue gate externo, no suplida por estos ejemplos.
