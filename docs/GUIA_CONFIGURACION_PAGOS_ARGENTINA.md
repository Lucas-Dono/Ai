# Guía Completa: Configuración de Mercado Pago y Paddle para Argentina

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Consideraciones Legales en Argentina](#consideraciones-legales-en-argentina)
3. [Configuración de Mercado Pago](#configuración-de-mercado-pago)
4. [Configuración de Paddle](#configuración-de-paddle)
5. [Integración en tu Aplicación](#integración-en-tu-aplicación)
6. [Testing y Validación](#testing-y-validación)
7. [Salir a Producción](#salir-a-producción)

---

## 📌 Requisitos Previos

### Para Mercado Pago
- ✅ Cuenta de Mercado Pago Argentina (personal o empresarial)
- ✅ CUIT/CUIL
- ✅ CBU o CVU para recibir pagos
- ✅ Email verificado

### Para Paddle
- ✅ Cuenta bancaria para recibir transferencias internacionales
- ✅ Documentación de identidad (DNI escaneado)
- ✅ Comprobante de domicilio
- ✅ CUIT (si sos monotributista o responsable inscripto)

### Para tu Negocio
- ✅ Sitio web o aplicación donde vendes
- ✅ URL de producción (puede ser temporal durante desarrollo)
- ✅ Servidor o hosting para recibir webhooks

---

## ⚖️ Consideraciones Legales en Argentina

### Facturación Electrónica AFIP/ARCA

**¿Qué necesitas saber?**

Desde 2025, la facturación electrónica es **obligatoria** para todos los monotributistas y responsables inscriptos que ofrecen servicios online.

#### Pasos para Cumplir con AFIP

1. **Inscribirse en AFIP (ahora ARCA)**
   - Necesitas estar inscripto como:
     - **Monotributista** (para facturar hasta ciertos límites)
     - **Responsable Inscripto** (para volúmenes mayores)
   - ¿No estás inscripto? → [Guía de inscripción AFIP](https://www.afip.gob.ar/monotributo/)

2. **Obtener Clave Fiscal Nivel 3 o superior**
   - Ingresa a [AFIP](https://www.afip.gob.ar/)
   - Ve a "Administrador de Relaciones de Clave Fiscal"
   - Solicita aumento de nivel si tienes nivel inferior
   - **Importante**: El nivel 3 requiere validación biométrica en oficinas de AFIP

3. **Habilitar Facturación Electrónica**
   - Accede con tu Clave Fiscal a [AFIP - Comprobantes en Línea](https://serviciosweb.afip.gob.ar/)
   - Registra un **Punto de Venta** (código de 4-5 dígitos)
   - Genera tu primer CAE (Código de Autorización Electrónico)

4. **Facturación según tu condición fiscal**
   - **Monotributistas**: Factura tipo "C" (Consumidor Final)
   - **Responsables Inscriptos**: Factura tipo "A" (para otros RI) o "B" (consumidor final)

#### ¿Mercado Pago o Paddle manejan esto?

- **Mercado Pago**: 🟡 **Parcial**
  - Mercado Pago emite comprobantes a tus clientes automáticamente
  - **TÚ debes facturar** a Mercado Pago por las comisiones que te cobran
  - Los ingresos por ventas los declaras vos en AFIP

- **Paddle**: ✅ **Sí (casi completo)**
  - Paddle actúa como **Merchant of Record** (comerciante registrado)
  - **Ellos facturan a tus clientes** y manejan el IVA/impuestos globalmente
  - Te envían un pago neto mensual
  - **Vos facturas** a Paddle por tus servicios como proveedor
  - Simplifica mucho la operativa internacional

#### Resumen: ¿Qué facturas vos?

| Proveedor | Qué facturas | A quién |
|-----------|--------------|---------|
| Mercado Pago | Servicios prestados / Productos vendidos | A tus clientes (opcional según AFIP) |
| Mercado Pago | Comisiones cobradas por MP | A Mercado Pago Argentina |
| Paddle | Servicios de desarrollo/software | A Paddle (mensualmente) |

---

## 🇦🇷 Configuración de Mercado Pago

### Paso 1: Crear Cuenta de Mercado Pago (si no tienes)

1. Ve a [www.mercadopago.com.ar](https://www.mercadopago.com.ar)
2. Haz clic en **"Crear cuenta"**
3. Completa con:
   - Email
   - Contraseña segura
   - Datos personales (nombre, apellido, DNI)
4. Verifica tu email
5. **Importante**: Completa tu perfil con CUIT/CUIL y datos bancarios para recibir dinero

### Paso 2: Verificar tu Identidad

Mercado Pago te pedirá verificar tu identidad para poder operar:

1. Ingresa a tu cuenta → **Mi perfil** → **Datos personales**
2. Completa:
   - CUIT/CUIL
   - Foto de DNI (frente y dorso)
   - Selfie de verificación
   - Domicilio fiscal
3. Espera la aprobación (puede tomar 24-48 horas)

### Paso 3: Crear una Aplicación en Mercado Pago

1. **Accede al Panel de Desarrolladores**
   - Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
   - Haz clic en **"Ingresar"** (esquina superior derecha)
   - Inicia sesión con tu cuenta de Mercado Pago

2. **Crear Nueva Aplicación**
   - Haz clic en **"Tus integraciones"** → **"Crear aplicación"**
   - **Nombre de aplicación**: "Blaniel" (o el nombre de tu proyecto)
   - **Tipo de pago**: Selecciona **"Pagos online"**
   - **¿Usas plataforma e-commerce?**: Selecciona **"No"** (desarrollo propio)
   - **Producto a integrar**: Selecciona **"Suscripciones"**

3. **Confirmar creación**
   - Acepta la [Declaración de Privacidad](https://www.mercadopago.com.ar/privacidad)
   - Acepta los [Términos y Condiciones](https://www.mercadopago.com.ar/ayuda/terminos-y-condiciones_299)
   - Completa el CAPTCHA
   - Haz clic en **"Confirmar"**

### Paso 4: Obtener Credenciales de Prueba

1. **Acceder a tu aplicación**
   - En [Tus integraciones](https://www.mercadopago.com.ar/developers/panel/app)
   - Haz clic en la tarjeta de tu aplicación recién creada

2. **Ver credenciales de prueba**
   - En el menú lateral izquierdo: **"Pruebas"** → **"Credenciales de prueba"**
   - Copia y guarda de forma segura:
     - ✅ **Public Key** (empieza con `TEST-...`)
     - ✅ **Access Token** (empieza con `TEST-...`)

3. **Agregar a tu archivo `.env`**
   ```env
   # Mercado Pago - CREDENCIALES DE PRUEBA
   MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxx
   ```

### Paso 5: Crear Planes de Suscripción

Ahora vamos a crear los planes Plus y Ultra en Mercado Pago.

#### 5.1. Crear Plan PLUS

Usa el MCP tool de Mercado Pago para buscar la documentación actualizada sobre cómo crear planes:

**Mediante API (recomendado para desarrollo):**

```bash
curl -X POST \
  'https://api.mercadopago.com/preapproval_plan' \
  -H 'Authorization: Bearer TEST-TU_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "reason": "Plan Plus - Blaniel",
  "auto_recurring": {
    "frequency": 1,
    "frequency_type": "months",
    "transaction_amount": 4900,
    "currency_id": "ARS"
  },
  "back_url": "https://tudominio.com/billing/success",
  "payment_methods_allowed": {
    "payment_types": [
      {
        "id": "credit_card"
      },
      {
        "id": "debit_card"
      }
    ]
  }
}'
```

**Respuesta esperada:**
```json
{
  "id": "2c938084726fca48172750000000000",
  "reason": "Plan Plus - Blaniel",
  ...
}
```

**Guarda el ID del plan** en tu `.env`:
```env
MERCADOPAGO_PLUS_PLAN_ID=2c938084726fca48172750000000000
```

#### 5.2. Crear Plan ULTRA

```bash
curl -X POST \
  'https://api.mercadopago.com/preapproval_plan' \
  -H 'Authorization: Bearer TEST-TU_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "reason": "Plan Ultra - Blaniel",
  "auto_recurring": {
    "frequency": 1,
    "frequency_type": "months",
    "transaction_amount": 14900,
    "currency_id": "ARS"
  },
  "back_url": "https://tudominio.com/billing/success",
  "payment_methods_allowed": {
    "payment_types": [
      {
        "id": "credit_card"
      },
      {
        "id": "debit_card"
      }
    ]
  }
}'
```

**Guarda el ID**:
```env
MERCADOPAGO_ULTRA_PLAN_ID=2c938084726fca48172750001111111
```

### Paso 6: Configurar Webhooks (Notificaciones)

Los webhooks son cruciales para saber cuándo un usuario paga, cancela, etc.

1. **Accede a tu aplicación** en [Tus integraciones](https://www.mercadopago.com.ar/developers/panel/app)
2. En el menú lateral: **"Producción"** → **"Webhooks"**
3. Haz clic en **"Configurar notificaciones"**
4. **URL de notificaciones**: `https://tudominio.com/api/webhooks/mercadopago`
   - Debe ser HTTPS en producción
   - En desarrollo local puedes usar [ngrok](https://ngrok.com/)
5. **Eventos a suscribir**:
   - ✅ `payment` - Notificaciones de pagos
   - ✅ `subscription_preapproval` - Suscripciones (creación/actualización)
   - ✅ `subscription_authorized_payment` - Pagos recurrentes de suscripciones
   - ✅ `subscription_preapproval_plan` - Cambios en planes de suscripción

6. **Webhook Secret**
   - Mercado Pago te dará un "Secret" para validar webhooks
   - Guárdalo en `.env`:
   ```env
   MERCADOPAGO_WEBHOOK_SECRET=tu_secret_key_aqui
   ```

### Paso 7: Activar Credenciales de Producción

**⚠️ SOLO cuando estés listo para salir a producción**

1. En tu aplicación → **"Producción"** → **"Credenciales de producción"**
2. Completa:
   - **Industria**: Selecciona "Software y servicios tecnológicos"
   - **Sitio web**: Tu URL de producción (ej: `https://circuitprompt.ai`)
3. Acepta términos y condiciones
4. Completa CAPTCHA
5. Haz clic en **"Activar credenciales de producción"**

6. **Copia las nuevas credenciales**:
   ```env
   # Mercado Pago - PRODUCCIÓN
   MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxx
   ```

### Paso 8: Crear Planes de Producción

Repite el Paso 5, pero usando tus **credenciales de producción** y los precios reales:

- **Plan Plus**: ARS $4,900/mes
- **Plan Ultra**: ARS $14,900/mes

---

## 🌍 Configuración de Paddle

Paddle es ideal para ventas internacionales porque:
- ✅ Maneja impuestos automáticamente en 100+ países
- ✅ Actúa como "Merchant of Record" (facturan ellos, no vos)
- ✅ Te simplifican la operativa con AFIP para ventas al exterior
- ✅ Soportan pagos en ARS (peso argentino) y 29+ monedas

### Paso 1: Crear Cuenta en Paddle

1. **Registrarte en Paddle**
   - Ve a [www.paddle.com](https://www.paddle.com/)
   - Haz clic en **"Get Started"** o **"Sign Up"**
   - Completa el formulario:
     - Email
     - Contraseña
     - Nombre del negocio
     - País: **Argentina**

2. **Verificación de identidad**

   Paddle te pedirá documentación para verificar tu cuenta:

   - ✅ **DNI escaneado** (frente y dorso)
   - ✅ **Comprobante de domicilio** (factura de luz, gas, agua - no mayor a 3 meses)
   - ✅ **CUIT/CUIL** (si sos monotributista o RI)
   - ✅ **Comprobante de CBU/CVU** o datos de cuenta bancaria internacional

   > **Nota**: Paddle puede tardar 2-5 días hábiles en aprobar tu cuenta

### Paso 2: Completar Información Fiscal y de Pagos

1. **Configurar Datos Bancarios**

   Para recibir pagos desde Paddle, tienes 2 opciones:

   **Opción A: Cuenta bancaria argentina (transferencia SWIFT)**
   - Necesitas que tu banco soporte transferencias internacionales
   - Algunos bancos recomendados:
     - Banco Galicia
     - ICBC
     - Santander
     - BBVA
   - Paddle te transferirá mensualmente en USD
   - Tu banco convertirá a ARS al tipo de cambio del día

   **Opción B: Cuenta en el exterior (recomendado)**
   - Abre una cuenta en Payoneer o Wise
   - Paddle te paga a esa cuenta en USD
   - Luego transferís a tu cuenta argentina cuando quieras
   - Ventaja: control sobre el timing del cambio de divisa

2. **Información fiscal**
   - **Tax ID**: Ingresa tu CUIT/CUIL
   - **Business Type**:
     - Si sos monotributista: "Sole Proprietor"
     - Si tenés SRL/SA: "Company"
   - **VAT Number**: Déjalo vacío (Argentina no usa VAT europeo)

### Paso 3: Crear Productos en Paddle

1. **Acceder al Dashboard de Paddle**
   - Ve a [vendors.paddle.com](https://vendors.paddle.com/)
   - Inicia sesión

2. **Crear Plan Plus**

   - En el menú lateral: **"Catalog"** → **"Products"** → **"+ Add Product"**
   - Completa:
     - **Product Name**: "Blaniel - Plan Plus"
     - **Description**: "10 agentes IA, mensajes ilimitados, NSFW, 100 min voz/mes"
     - **Product Type**: Selecciona **"Subscription"**

3. **Configurar Precios Plan Plus**

   - **Pricing**: Haz clic en **"+ Add Price"**
   - **Billing Cycle**:
     - Mensual:
       - Amount: `4.99` USD (o equivalente)
       - Currency: USD
       - Interval: Monthly
     - Anual (con 20% descuento):
       - Amount: `47.90` USD (4.99 × 12 × 0.8)
       - Currency: USD
       - Interval: Yearly

   > **Nota sobre precios en Argentina**: Paddle te permite configurar precios en ARS, pero es recomendable usar USD como moneda base y que Paddle haga la conversión automática. Así evitas tener que actualizar precios por inflación.

4. **Crear Plan Ultra**

   Repite el proceso:
   - **Product Name**: "Blaniel - Plan Ultra"
   - **Description**: "Agentes ilimitados, mensajes ilimitados, NSFW sin límites, 500 min voz/mes, API access"
   - **Pricing**:
     - Mensual: `14.99` USD
     - Anual: `143.90` USD (14.99 × 12 × 0.8)

5. **Guardar Price IDs**

   Paddle te dará un **Price ID** para cada plan/intervalo:
   ```env
   # Paddle - Planes
   PADDLE_PLUS_MONTHLY_PRICE_ID=pri_01xxxxxxxxxxxxxx
   PADDLE_PLUS_YEARLY_PRICE_ID=pri_01yyyyyyyyyyyyyy
   PADDLE_ULTRA_MONTHLY_PRICE_ID=pri_01zzzzzzzzzzzzzz
   PADDLE_ULTRA_YEARLY_PRICE_ID=pri_01wwwwwwwwwwwwww
   ```

### Paso 4: Configurar Webhooks en Paddle

1. **Acceder a Webhooks**
   - En Paddle Dashboard: **"Developer Tools"** → **"Webhooks"**

2. **Crear Webhook Endpoint**
   - Haz clic en **"+ New Webhook Endpoint"**
   - **URL**: `https://tudominio.com/api/webhooks/paddle`
   - **Description**: "Production webhook"
   - **Events to subscribe**:
     - ✅ `subscription.created`
     - ✅ `subscription.updated`
     - ✅ `subscription.canceled`
     - ✅ `transaction.completed`
     - ✅ `transaction.paid`
     - ✅ `transaction.refunded`

3. **Webhook Secret**
   - Paddle te dará un **Webhook Secret**
   - Guárdalo en `.env`:
   ```env
   PADDLE_WEBHOOK_SECRET=pdl_ntfset_01xxxxxxxxxxxxx
   ```

### Paso 5: Obtener API Keys

1. **Crear API Key**
   - En Paddle Dashboard: **"Developer Tools"** → **"API Keys"**
   - Haz clic en **"+ New API Key"**
   - **Name**: "Blaniel Production"
   - **Permissions**: Selecciona:
     - ✅ Read access (subscriptions, transactions)
     - ✅ Write access (subscriptions)

2. **Copiar API Key**
   ```env
   # Paddle - API
   PADDLE_API_KEY=live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Paso 6: Configurar Paddle.js (Checkout)

Para usar Paddle Checkout en tu frontend, necesitas el **Vendor ID** (o **Seller ID**):

1. En Paddle Dashboard → **"Settings"** → **"Account Information"**
2. Copia tu **Vendor ID** (número de 5-6 dígitos)
   ```env
   PADDLE_VENDOR_ID=123456
   ```

---

## 🔗 Integración en tu Aplicación

Ya tienes todo configurado en los dashboards de Mercado Pago y Paddle. Ahora vamos a integrar ambos en tu código.

### Actualizar Variables de Entorno

Tu archivo `.env` debería verse así:

```env
# URLs
APP_URL=https://tudominio.com
NEXTAUTH_URL=https://tudominio.com

# Mercado Pago (Argentina y LATAM)
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxx
MERCADOPAGO_PLUS_PLAN_ID=2c938084726fca48172750000000000
MERCADOPAGO_ULTRA_PLAN_ID=2c938084726fca48172750001111111
MERCADOPAGO_WEBHOOK_SECRET=tu_secret_key_aqui

# Paddle (Global)
PADDLE_API_KEY=live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PADDLE_VENDOR_ID=123456
PADDLE_WEBHOOK_SECRET=pdl_ntfset_01xxxxxxxxxxxxx
PADDLE_PLUS_MONTHLY_PRICE_ID=pri_01xxxxxxxxxxxxxx
PADDLE_PLUS_YEARLY_PRICE_ID=pri_01yyyyyyyyyyyyyy
PADDLE_ULTRA_MONTHLY_PRICE_ID=pri_01zzzzzzzzzzzzzz
PADDLE_ULTRA_YEARLY_PRICE_ID=pri_01wwwwwwwwwwwwww
```

### Verificar Configuración Actual

Tu aplicación ya tiene implementada la detección geográfica automática. Revisemos que todo esté correcto:

#### 1. Archivo de configuración de Mercado Pago

Verifica que `/lib/mercadopago/config.ts` tenga los planes correctos:

```typescript
export const PLANS = {
  plus: {
    id: 'plus',
    name: 'Plus',
    price: 4900, // ARS centavos
    currency: 'ARS',
    interval: 'month',
    features: [
      '10 compañeros IA',
      'Mensajes ilimitados',
      'NSFW habilitado',
      '100 mensajes de voz/mes',
      'Sin publicidad'
    ]
  },
  ultra: {
    id: 'ultra',
    name: 'Ultra',
    price: 14900, // ARS centavos
    currency: 'ARS',
    interval: 'month',
    features: [
      'Compañeros IA ilimitados',
      'Mensajes ilimitados',
      'NSFW sin restricciones',
      '500 mensajes de voz/mes',
      'API access'
    ]
  }
}
```

#### 2. Endpoint de checkout unificado

El endpoint `/app/api/billing/checkout-unified/route.ts` ya hace la detección automática.

**Cómo funciona:**
1. Usuario hace clic en "Upgrade to Plus"
2. Frontend llama a `/api/billing/checkout-unified`
3. El endpoint detecta el país del usuario mediante headers:
   - `CF-IPCountry` (Cloudflare)
   - `X-Vercel-IP-Country` (Vercel)
   - `X-Forwarded-For` (otros)
4. Si el país es Argentina, Brasil, México, etc. → **Mercado Pago**
5. Si el país es USA, Europa, etc. → **Paddle**

### Configurar Webhooks en tu Servidor

#### Webhook de Mercado Pago

El archivo `/app/api/webhooks/mercadopago/route.ts` ya existe y maneja:
- Pagos completados
- Suscripciones creadas/actualizadas/canceladas
- Validación de firma HMAC-SHA256

**Importante**: Asegúrate de que la URL sea accesible públicamente:
- ✅ Producción: `https://tudominio.com/api/webhooks/mercadopago`
- ✅ Desarrollo: Usa [ngrok](https://ngrok.com/) → `https://abc123.ngrok.io/api/webhooks/mercadopago`

#### Webhook de Paddle

El archivo `/app/api/webhooks/paddle/route.ts` debe manejar eventos de Paddle.

**Testing Webhooks Localmente**

Usa [ngrok](https://ngrok.com/) para exponer tu servidor local:

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto 3000
ngrok http 3000
```

Copia la URL HTTPS que te da (ej: `https://abc123.ngrok.io`) y úsala en:
- Mercado Pago → Webhooks
- Paddle → Webhook Endpoints

---

## 🧪 Testing y Validación

### Testing Mercado Pago

#### 1. Usar Tarjetas de Prueba

Mercado Pago proporciona [tarjetas de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/testing) para simular pagos:

**Tarjetas que APRUEBAN:**
```
Número: 5031 7557 3453 0604
CVV: 123
Fecha: 11/25
Nombre: APRO
DNI: 12345678
```

**Tarjetas que RECHAZAN:**
```
Número: 5031 7557 3453 0604
CVV: 123
Fecha: 11/25
Nombre: OTHE
DNI: 12345678
```

#### 2. Probar Flujo Completo

1. En tu app en modo desarrollo (con credenciales TEST)
2. Haz clic en "Upgrade to Plus"
3. Completa el formulario con la tarjeta de prueba
4. Verifica que:
   - ✅ El pago se procesa
   - ✅ Recibes el webhook en tu servidor
   - ✅ El usuario se actualiza a plan "plus" en la DB
   - ✅ La suscripción se crea correctamente

#### 3. Monitorear Webhooks

Revisa los logs de Mercado Pago:
- Panel de Desarrolladores → Tu Aplicación → Notificaciones → Historial

### Testing Paddle

#### 1. Modo Sandbox

Paddle tiene un modo sandbox separado:

1. Crea una cuenta sandbox en [sandbox-vendors.paddle.com](https://sandbox-vendors.paddle.com/)
2. Obtén credenciales de sandbox
3. Úsalas en tu `.env.local`:
   ```env
   PADDLE_API_KEY=test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   PADDLE_VENDOR_ID=123456
   PADDLE_ENVIRONMENT=sandbox
   ```

#### 2. Tarjetas de Prueba Paddle

Paddle proporciona [tarjetas de prueba](https://developer.paddle.com/concepts/payment-methods/credit-debit-card#test-card-numbers):

**Pago exitoso:**
```
Número: 4242 4242 4242 4242
CVV: 123
Fecha: cualquier fecha futura
```

**Pago rechazado:**
```
Número: 4000 0000 0000 0002
CVV: 123
Fecha: cualquier fecha futura
```

#### 3. Probar Flujo Internacional

1. Cambia tu ubicación simulada (puedes usar VPN o cambiar header manualmente)
2. Intenta hacer un upgrade desde "USA" o "España"
3. Verifica que se redirija a Paddle Checkout
4. Completa el pago con tarjeta de prueba
5. Verifica webhook y actualización de usuario

---

## 🚀 Salir a Producción

### Checklist Pre-Producción

#### Mercado Pago
- ✅ Credenciales de producción activadas
- ✅ Planes creados con credenciales de producción
- ✅ Webhook URL configurada (HTTPS)
- ✅ Webhook secret configurado en `.env`
- ✅ Probado flujo completo con tarjeta real (opcional: con monto mínimo)
- ✅ AFIP: Facturación electrónica configurada
- ✅ CBU/CVU configurado en tu cuenta Mercado Pago

#### Paddle
- ✅ Cuenta verificada y aprobada
- ✅ Productos y precios creados
- ✅ API Key de producción generada
- ✅ Webhook configurado
- ✅ Datos bancarios configurados (Payoneer/Wise/banco argentino)
- ✅ Información fiscal completa (CUIT)

#### Aplicación
- ✅ Variables de entorno de producción configuradas
- ✅ HTTPS habilitado en tu dominio
- ✅ Webhook endpoints funcionando
- ✅ Logs de errores configurados
- ✅ Base de datos de producción lista

### Activar Producción Paso a Paso

1. **Actualizar `.env` de producción** (Vercel, Railway, etc.)
   ```env
   # Usar credenciales de PRODUCCIÓN
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxx... # SIN "TEST-"
   PADDLE_API_KEY=live_xxxx... # SIN "test_"
   PADDLE_ENVIRONMENT=production
   ```

2. **Verificar Webhooks**
   - Accede a Mercado Pago Dashboard
   - Ve a tu aplicación → Webhooks
   - Confirma que la URL sea tu dominio de producción
   - Haz una prueba enviando un webhook de prueba

3. **Primer Pago Real de Prueba**
   - Usa tu propia tarjeta
   - Compra el plan más barato
   - Verifica todo el flujo
   - Cancela la suscripción si es solo prueba

4. **Monitoreo Post-Lanzamiento**
   - Revisa logs de webhooks diariamente la primera semana
   - Configura alertas para pagos fallidos
   - Monitorea tasas de conversión en dashboards

---

## 📊 Resumen: ¿Qué elegir según el caso?

| Escenario | Recomendación | Razón |
|-----------|---------------|-------|
| Usuario de Argentina | Mercado Pago | Pago en pesos, sin comisión de cambio, métodos locales (Rapipago, Pago Fácil) |
| Usuario de LATAM (BR, MX, CL) | Mercado Pago | Moneda local, métodos de pago locales |
| Usuario de USA, Europa, Asia | Paddle | Manejo automático de impuestos, compliance global |
| Empresa argentina vendiendo al mundo | Paddle | Te simplifican todo el tema fiscal internacional |
| Freelancer argentino con clientes locales | Mercado Pago | Menos fricción para cobrar |

---

## 🆘 Soporte y Recursos

### Mercado Pago
- 📚 [Documentación oficial](https://www.mercadopago.com.ar/developers/es/docs)
- 💬 [Comunidad de desarrolladores](https://www.mercadopago.com.ar/developers/es/support)
- 📧 Email: developers@mercadopago.com
- 📞 Teléfono: 0800-666-0004 (Argentina)

### Paddle
- 📚 [Documentación oficial](https://developer.paddle.com/)
- 💬 [Support Center](https://www.paddle.com/help)
- 📧 Email: hello@paddle.com
- 💬 Live Chat: Disponible en el dashboard

### AFIP/ARCA
- 📚 [Guía de facturación electrónica](https://www.afip.gob.ar/fe/)
- 📞 Teléfono: 0810-999-2347
- 🏢 Oficinas: [Buscar agencia cercana](https://www.afip.gob.ar/atencionvirtual/agencias.asp)

---

## ✅ Próximos Pasos Recomendados

1. **Corto plazo (esta semana)**
   - ✅ Crear cuenta en Mercado Pago (si no tienes)
   - ✅ Crear aplicación en Mercado Pago
   - ✅ Obtener credenciales de prueba
   - ✅ Probar checkout con tarjetas de prueba

2. **Mediano plazo (próximas 2 semanas)**
   - ✅ Registrarte en Paddle
   - ✅ Completar verificación de identidad
   - ✅ Configurar productos en Paddle
   - ✅ Probar ambos flujos end-to-end

3. **Antes de producción**
   - ✅ Configurar facturación en AFIP
   - ✅ Activar credenciales de producción
   - ✅ Hacer prueba real con monto mínimo
   - ✅ Configurar monitoreo y alertas

---

**¿Necesitas ayuda con algún paso específico?** Puedo ayudarte a:
- Debuggear problemas de webhooks
- Configurar los endpoints de API
- Resolver errores de integración
- Optimizar el flujo de checkout

¡Éxitos con la configuración! 🚀
