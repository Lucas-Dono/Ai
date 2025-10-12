# Configuración de Mercado Pago

Esta guía te ayudará a configurar Mercado Pago para el sistema de pagos y suscripciones.

## Paso 1: Crear cuenta de Mercado Pago

1. Ve a [https://www.mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers)
2. Regístrate o inicia sesión
3. Ve a "Tus aplicaciones" → "Crear aplicación"

## Paso 2: Obtener credenciales

### Access Token y Public Key

1. En el panel de Mercado Pago, ve a "Tus aplicaciones"
2. Selecciona tu aplicación
3. En la sección "Credenciales", encontrarás:
   - **Access Token** (para el backend): `APP_USR-xxxxxxxxxx`
   - **Public Key** (para el frontend): `APP_USR-xxxxxxxxxx`
4. Copia ambas credenciales

### Credenciales de producción vs prueba

- **Prueba**: Usa las credenciales de prueba para desarrollo
- **Producción**: Cuando estés listo para producción, cambia a las credenciales de producción

## Paso 3: Configurar planes de suscripción

### Opción 1: Suscripciones automáticas (Recomendado)

1. Ve a "Suscripciones" en el panel de Mercado Pago
2. Crea un plan de suscripción para "Pro":
   - Frecuencia: Mensual
   - Precio: El que definiste en `lib/mercadopago/config.ts`
   - Copia el ID del plan
3. Repite para el plan "Enterprise"

### Opción 2: Sin planes pre-configurados

Si no usas planes pre-configurados, Mercado Pago creará las suscripciones automáticamente usando la API.

## Paso 4: Configurar variables de entorno

Edita tu archivo `.env.local`:

```env
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN="APP_USR-tu_access_token_aqui"
MERCADOPAGO_PUBLIC_KEY="APP_USR-tu_public_key_aqui"
MERCADOPAGO_PRO_PLAN_ID="tu_plan_id_pro" # Opcional
MERCADOPAGO_ENTERPRISE_PLAN_ID="tu_plan_id_enterprise" # Opcional
```

## Paso 5: Configurar Webhooks

Los webhooks permiten que Mercado Pago notifique a tu aplicación sobre eventos de pago.

1. En el panel de Mercado Pago, ve a "Webhooks"
2. Agrega una nueva URL de webhook:
   ```
   https://tudominio.com/api/webhooks/mercadopago
   ```
3. Selecciona los eventos que quieres recibir:
   - `payment`
   - `preapproval`
   - `subscription_preapproval`

## Paso 6: Probar la integración

### Tarjetas de prueba

Mercado Pago proporciona tarjetas de prueba para desarrollo:

**Tarjeta aprobada:**
- Número: `5031 7557 3453 0604`
- CVV: `123`
- Fecha: Cualquier fecha futura
- Titular: APRO

**Tarjeta rechazada:**
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Fecha: Cualquier fecha futura
- Titular: OTHE

Más tarjetas de prueba: [https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards)

## Ajustar precios por país

En `lib/mercadopago/config.ts`, puedes ajustar los precios según el país:

```typescript
pro: {
  price: 9900, // ARS (Argentina)
  // Ajusta según tu mercado:
  // Brasil: ~50 BRL
  // México: ~500 MXN
  // Colombia: ~120000 COP
  // Chile: ~25000 CLP
  currency: "ARS",
}
```

## Soporte

Para más información:
- Documentación oficial: [https://www.mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers)
- API Reference: [https://www.mercadopago.com.ar/developers/es/reference](https://www.mercadopago.com.ar/developers/es/reference)
