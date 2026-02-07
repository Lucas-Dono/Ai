# Sistema de Pagos con Mercado Pago

Este directorio contiene todos los componentes relacionados con el sistema de pagos y suscripciones de la aplicación.

## Componentes Principales

### 1. PaymentModal
Modal principal que maneja el flujo completo de checkout con Mercado Pago.

**Características:**
- Integración con Mercado Pago y Paddle
- Detección geográfica automática
- UI atractiva con animaciones
- Manejo de errores
- Estados de carga

**Uso básico:**
```tsx
import { PaymentModal } from "@/components/billing/PaymentModal";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Mejorar Plan
      </Button>

      <PaymentModal
        open={isOpen}
        onOpenChange={setIsOpen}
        currentPlan="free"
        onSuccess={() => {
          console.log("Pago exitoso!");
        }}
      />
    </>
  );
}
```

### 2. PricingTable
Tabla de precios atractiva con marketing y comparación de planes.

**Características:**
- Toggle mensual/anual
- Badges de popularidad
- Animaciones con Framer Motion
- Responsive design
- Trust badges

**Uso:**
```tsx
import { PricingTable } from "@/components/billing/PricingTable";

function PricingPage() {
  const handleSelectPlan = async (planId: "plus" | "ultra") => {
    // Lógica de checkout
  };

  return (
    <PricingTable
      currentPlan="free"
      onSelectPlan={handleSelectPlan}
      loading={false}
    />
  );
}
```

### 3. UpgradeButton
Botón pre-configurado que abre el modal de pago automáticamente.

**Uso:**
```tsx
import { UpgradeButton } from "@/components/billing/UpgradeButton";

function Header() {
  return (
    <UpgradeButton
      currentPlan="free"
      variant="gradient"
      size="default"
    >
      Mejorar a Premium
    </UpgradeButton>
  );
}
```

**Variantes:**
- `gradient` (default) - Fondo degradado azul a morado
- `default` - Botón estándar
- `outline` - Botón con borde
- `ghost` - Botón transparente

### 4. PaymentModalProvider
Provider global que debe estar en el layout raíz.

**Instalación:**
```tsx
// app/layout.tsx
import { PaymentModalProvider } from "@/components/billing/PaymentModalProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
          <PaymentModalProvider />
        </Providers>
      </body>
    </html>
  );
}
```

### 5. usePaymentModal Hook
Hook global para controlar el modal desde cualquier componente.

**Uso:**
```tsx
import { usePaymentModal } from "@/hooks/usePaymentModal";

function MyComponent() {
  const { open, close, isOpen, currentPlan } = usePaymentModal();

  return (
    <Button onClick={() => open("free")}>
      Ver Planes
    </Button>
  );
}
```

## Flujo de Pago

1. Usuario hace clic en "Mejorar Plan" o similar
2. Se abre el `PaymentModal` con la tabla de precios
3. Usuario selecciona un plan (Plus o Ultra)
4. Se llama a `/api/billing/checkout-unified` para crear el checkout
5. Sistema detecta país y elige proveedor (Mercado Pago para LATAM, Paddle para resto del mundo)
6. Usuario es redirigido al checkout del proveedor
7. Usuario completa el pago
8. Webhook actualiza la suscripción en la base de datos
9. Usuario es redirigido a `/dashboard/billing/success`

## Endpoints de API

### POST `/api/billing/checkout-unified`
Crea un checkout unificado con detección geográfica automática.

**Request:**
```json
{
  "planId": "plus" | "ultra",
  "interval": "month" | "year"
}
```

**Response (Mercado Pago):**
```json
{
  "provider": "mercadopago",
  "initPoint": "https://www.mercadopago.com.ar/...",
  "preapprovalId": "preapproval_id",
  "countryCode": "AR",
  "pricing": {
    "amount": 4900,
    "currency": "ARS",
    "displayPrice": "$4.900"
  }
}
```

### GET `/api/billing/subscription`
Obtiene la suscripción actual del usuario.

**Response:**
```json
{
  "plan": "plus",
  "subscription": {
    "id": "sub_123",
    "status": "active",
    "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false,
    "trialEnd": null
  },
  "hasMercadoPagoCustomer": true
}
```

### POST `/api/billing/cancel`
Cancela la suscripción actual (se mantiene activa hasta el final del período).

**Request:**
```json
{
  "reason": "expensive",
  "feedback": "Optional user feedback"
}
```

## Configuración Requerida

### Variables de Entorno
```env
# Mercado Pago (LATAM)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
MERCADOPAGO_PUBLIC_KEY=APP_USR-...
MERCADOPAGO_PLUS_PLAN_ID=preapproval_plan_id
MERCADOPAGO_ULTRA_PLAN_ID=preapproval_plan_id
MERCADOPAGO_WEBHOOK_SECRET=secret_key

# Paddle (Global)
PADDLE_API_KEY=api_key
PADDLE_WEBHOOK_SECRET=webhook_secret
PADDLE_PLUS_MONTHLY_PRICE_ID=pri_...
PADDLE_ULTRA_MONTHLY_PRICE_ID=pri_...

# URLs
NEXTAUTH_URL=https://yourdomain.com
APP_URL=https://yourdomain.com
```

### Dependencias
```json
{
  "mercadopago": "^2.0.0",
  "zustand": "^4.0.0",
  "framer-motion": "^10.0.0"
}
```

## Planes Disponibles

### Free
- **Precio:** Gratis
- **Límites:** 3 agentes, 20 mensajes/día, sin NSFW

### Plus
- **Precio:** $4,900 ARS/mes (~$5 USD)
- **Límites:** 10 agentes, mensajes ilimitados, NSFW habilitado

### Ultra
- **Precio:** $14,900 ARS/mes (~$15 USD)
- **Límites:** Agentes ilimitados, API access, NSFW sin restricciones

## Personalización

### Cambiar Precios
Edita `/lib/mercadopago/config.ts`:

```ts
export const PLANS = {
  plus: {
    price: 4900, // Precio en centavos
    // ...
  },
  ultra: {
    price: 14900,
    // ...
  }
}
```

### Cambiar Colores
Edita los gradientes en `PricingTable.tsx`:

```tsx
const planConfigs = [
  {
    color: "from-blue-500 to-purple-600", // Personaliza aquí
    borderColor: "border-blue-500",
    // ...
  }
]
```

### Agregar Features
Edita `/lib/mercadopago/config.ts`:

```ts
features: [
  "10 compañeros IA",
  "Mensajes ilimitados",
  // Añade aquí nuevas características
]
```

## Troubleshooting

### Error: "Failed to create checkout"
- Verifica que las variables de entorno estén configuradas correctamente
- Revisa que los IDs de planes de Mercado Pago sean válidos
- Comprueba los logs del servidor para más detalles

### Error: "Unauthorized"
- El usuario debe estar autenticado con NextAuth
- Verifica que la sesión esté activa

### Modal no se abre
- Asegúrate de que `PaymentModalProvider` esté en el layout raíz
- Verifica que zustand esté instalado correctamente

### Webhook no funciona
- Configura la URL del webhook en el dashboard de Mercado Pago
- Verifica que `MERCADOPAGO_WEBHOOK_SECRET` esté configurado
- Revisa los logs de webhook en `/api/webhooks/mercadopago`

## Testing

### Test Manual
1. Navega a `/dashboard/billing`
2. Haz clic en "Mejorar Plan"
3. Selecciona un plan
4. Completa el checkout de prueba en Mercado Pago
5. Verifica que la suscripción se active correctamente

### Modo Sandbox
Mercado Pago ofrece un modo sandbox para testing. Configura las credenciales de sandbox en las variables de entorno.

## Soporte

Para más información sobre Mercado Pago:
- [Documentación oficial](https://www.mercadopago.com.ar/developers)
- [API Reference](https://www.mercadopago.com.ar/developers/es/reference)
- [Webhooks](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/webhooks)
