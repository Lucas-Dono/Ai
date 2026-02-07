# 📧 Guía de Integración de Emails (5 minutos)

## ⚠️ Estado Actual

El sistema de notificaciones por email está **100% implementado** pero actualmente solo **logea** los emails en lugar de enviarlos. Necesitás integrar un servicio de email real.

**Archivo:** `lib/stripe/email-notifications.ts`

---

## 🚀 Opción 1: Resend (Recomendado - Más Fácil)

### Por qué Resend:
- ✅ Setup en 2 minutos
- ✅ API moderna y simple
- ✅ 3,000 emails gratis/mes
- ✅ Excellent deliverability
- ✅ Built para Next.js

### Paso 1: Crear cuenta (1 minuto)
```bash
# 1. Ir a https://resend.com/signup
# 2. Registrarte con GitHub o email
# 3. Verificar tu dominio (o usar onboarding@resend.dev para testing)
```

### Paso 2: Obtener API Key (30 segundos)
```bash
# Dashboard → API Keys → Create API Key
# Copiar la key que empieza con: re_...
```

### Paso 3: Instalar package (30 segundos)
```bash
npm install resend
```

### Paso 4: Agregar a .env (30 segundos)
```bash
RESEND_API_KEY="re_abc123..."
```

### Paso 5: Reemplazar código (2 minutos)

Abrir `lib/stripe/email-notifications.ts` y reemplazar las líneas 48-63:

**ANTES:**
```typescript
export async function sendEmail(emailData: EmailData): Promise<void> {
  const content = generateEmailContent(emailData);

  // TODO: Integrar con un servicio de email real (SendGrid, Resend, etc.)
  // Por ahora, solo logeamos el contenido
  log.info(
    {
      to: emailData.to,
      type: emailData.type,
      subject: content.subject,
    },
    "📧 Email notification would be sent"
  );

  // Implementación de ejemplo con Resend:
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({ ... });
}
```

**DESPUÉS:**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(emailData: EmailData): Promise<void> {
  const content = generateEmailContent(emailData);

  try {
    await resend.emails.send({
      from: 'Blaniel <noreply@tudominio.com>', // Cambiar por tu dominio
      to: emailData.to,
      subject: content.subject,
      html: content.html,
      text: content.text,
    });

    log.info(
      {
        to: emailData.to,
        type: emailData.type,
        subject: content.subject,
      },
      "✅ Email sent successfully"
    );
  } catch (error) {
    log.error(
      {
        err: error,
        to: emailData.to,
        type: emailData.type,
      },
      "❌ Failed to send email"
    );
    // No throw - no queremos que falle el webhook por un email
  }
}
```

### Paso 6: Testear (1 minuto)
```bash
# Hacer un pago de prueba y verificar que el email llega
# O ejecutar directamente:
node -e "
const { sendWelcomeEmail } = require('./lib/stripe/email-notifications');
sendWelcomeEmail('tu@email.com', 'Test User', 'plus', new Date());
"
```

---

## 🔧 Opción 2: SendGrid (Más Establecido)

### Por qué SendGrid:
- ✅ 100 emails gratis/día
- ✅ Más features (templates, analytics)
- ✅ Mejor para volumen alto
- ❌ Setup más complejo
- ❌ API menos moderna

### Paso 1: Crear cuenta
```bash
# https://signup.sendgrid.com/
```

### Paso 2: Obtener API Key
```bash
# Settings → API Keys → Create API Key
# Copiar la key que empieza con: SG.
```

### Paso 3: Instalar package
```bash
npm install @sendgrid/mail
```

### Paso 4: Agregar a .env
```bash
SENDGRID_API_KEY="SG.abc123..."
```

### Paso 5: Reemplazar código

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(emailData: EmailData): Promise<void> {
  const content = generateEmailContent(emailData);

  try {
    await sgMail.send({
      from: 'noreply@tudominio.com', // Debe estar verificado en SendGrid
      to: emailData.to,
      subject: content.subject,
      html: content.html,
      text: content.text,
    });

    log.info(
      {
        to: emailData.to,
        type: emailData.type,
      },
      "✅ Email sent successfully"
    );
  } catch (error) {
    log.error(
      {
        err: error,
        to: emailData.to,
        type: emailData.type,
      },
      "❌ Failed to send email"
    );
  }
}
```

---

## 📝 Templates de Email Disponibles

El sistema ya tiene estos 7 tipos de emails implementados:

### 1. **subscription_created** - Bienvenida
Enviado cuando un usuario se suscribe por primera vez.
```typescript
sendWelcomeEmail(
  "user@example.com",
  "Juan Pérez",
  "plus",
  new Date("2025-02-01")
);
```

### 2. **subscription_updated** - Cambio de Plan
Enviado cuando se hace upgrade/downgrade.
```typescript
sendEmail({
  to: "user@example.com",
  type: "subscription_updated",
  data: {
    userName: "Juan Pérez",
    planName: "ultra",
    nextBillingDate: new Date("2025-02-01"),
  },
});
```

### 3. **subscription_cancelled** - Cancelación
Enviado cuando se cancela la suscripción.
```typescript
sendCancellationEmail(
  "user@example.com",
  "Juan Pérez",
  new Date("2025-02-01")
);
```

### 4. **payment_succeeded** - Pago Exitoso
Enviado cuando se renueva la suscripción exitosamente.
```typescript
sendEmail({
  to: "user@example.com",
  type: "payment_succeeded",
  data: {
    userName: "Juan Pérez",
    planName: "plus",
    amount: 5.00,
    currency: "USD",
    nextBillingDate: new Date("2025-03-01"),
  },
});
```

### 5. **payment_failed** - Pago Fallido
Enviado cuando falla un pago (crítico).
```typescript
sendPaymentFailedEmail(
  "user@example.com",
  "Juan Pérez",
  1, // Intento número
  "Card declined"
);
```

### 6. **trial_ending** - Trial por Terminar
Enviado 3 días antes de que termine el trial.
```typescript
sendEmail({
  to: "user@example.com",
  type: "trial_ending",
  data: {
    userName: "Juan Pérez",
    planName: "plus",
    trialEndDate: new Date("2025-01-10"),
    amount: 5.00,
    currency: "USD",
  },
});
```

### 7. **subscription_reactivated** - Reactivación
Enviado cuando se reactiva una suscripción cancelada.
```typescript
sendEmail({
  to: "user@example.com",
  type: "subscription_reactivated",
  data: {
    userName: "Juan Pérez",
    planName: "plus",
    nextBillingDate: new Date("2025-02-01"),
  },
});
```

---

## 🎨 Personalizar Templates

Los templates se generan en `generateEmailContent()` (línea 82+). Podés personalizarlos:

```typescript
// Cambiar el estilo
const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0;">🎉 ¡Bienvenido!</h1>
    </div>
    <div style="padding: 40px; background: white;">
      <p>Hola ${userName},</p>
      <p>Tu suscripción al plan <strong>${planName}</strong> está activa.</p>
      <!-- Tu contenido custom aquí -->
    </div>
  </div>
`;
```

---

## 🔍 Testing de Emails

### Testing Local
```typescript
// Crear archivo test-email.ts
import { sendWelcomeEmail } from './lib/stripe/email-notifications';

sendWelcomeEmail(
  'tu@email.com',
  'Test User',
  'plus',
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
);
```

```bash
# Ejecutar
npx tsx test-email.ts
```

### Testing con Webhook
```bash
# 1. Iniciar app
npm run dev

# 2. Trigger webhook de Stripe
stripe trigger checkout.session.completed

# 3. Verificar logs
grep "Email sent" logs/*.log
```

---

## 📊 Monitoreo de Emails

### Logs a Revisar
```bash
# Ver emails enviados exitosamente
grep "✅ Email sent successfully" logs/*.log

# Ver emails fallidos
grep "❌ Failed to send email" logs/*.log

# Ver por tipo de email
grep "subscription_created" logs/*.log
```

### Métricas Importantes
- **Delivery Rate**: % de emails que llegan
- **Open Rate**: % de emails abiertos
- **Bounce Rate**: % de emails rebotados

Resend y SendGrid tienen dashboards con estas métricas.

---

## 🚨 Troubleshooting

### Error: "API Key not found"
```bash
# Verificar que la variable está en .env
cat .env | grep RESEND_API_KEY

# Reiniciar el servidor
npm run dev
```

### Error: "Domain not verified"
**Resend:**
- Ir a Settings → Domains
- Agregar tu dominio
- Configurar DNS records (MX, TXT, CNAME)
- O usar `onboarding@resend.dev` para testing

**SendGrid:**
- Similar, pero más complejo

### Emails van a spam
- Configurar SPF, DKIM, DMARC records
- Usar dominio verificado
- No usar palabras spam-trigger ("gratis", "urgente", etc.)
- Agregar botón de unsubscribe

### Emails no llegan
1. Verificar logs: `grep "Failed to send" logs/*.log`
2. Verificar API key
3. Verificar límite de la cuenta (3000/mes en Resend free)
4. Verificar que el email del destinatario es válido

---

## ✅ Checklist de Integración

- [ ] Crear cuenta en Resend (o SendGrid)
- [ ] Obtener API Key
- [ ] Instalar package (`npm install resend`)
- [ ] Agregar `RESEND_API_KEY` a `.env`
- [ ] Reemplazar función `sendEmail()` en `lib/stripe/email-notifications.ts`
- [ ] Cambiar `from` email por tu dominio
- [ ] Testear con email de prueba
- [ ] Verificar que emails llegan
- [ ] Verificar dominio (para producción)
- [ ] Configurar DNS records (SPF, DKIM)
- [ ] Agregar link de unsubscribe (para producción)
- [ ] Monitorear delivery rate

---

## 💰 Costos

### Resend (Recomendado para empezar)
```
Free:  3,000 emails/mes
Pro:   $20/mes → 50,000 emails
Scale: $85/mes → 500,000 emails
```

### SendGrid
```
Free:  100 emails/día (3,000/mes)
Basic: $19.95/mes → 100,000 emails
```

**Recomendación:** Empezar con plan gratuito de Resend. Con 100 usuarios pagos que renuevan mensualmente, enviás ~700 emails/mes (bien dentro del límite).

---

## 🎁 Bonus: Email de Bienvenida Custom

Si querés un email de bienvenida más elaborado:

```typescript
function generateWelcomeEmail(userName: string, planName: string): EmailContent {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 40px; text-align: center; }
          .header h1 { color: white; font-size: 32px; margin: 0; }
          .content { padding: 40px; background: white; }
          .cta { display: inline-block; padding: 16px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin-top: 24px; }
          .footer { padding: 32px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Bienvenido a tu aventura!</h1>
          </div>
          <div class="content">
            <h2>Hola ${userName},</h2>
            <p>¡Felicitaciones por unirte al plan <strong>${planName.toUpperCase()}</strong>!</p>
            <p>Ahora tenés acceso a:</p>
            <ul>
              <li>✨ Compañeros IA ilimitados</li>
              <li>💬 Conversaciones sin límites</li>
              <li>🎤 Mensajes de voz incluidos</li>
              <li>🌍 Mundos virtuales personalizados</li>
              <li>🔞 Contenido NSFW (si lo deseas)</li>
            </ul>
            <p>Estamos emocionados de tenerte con nosotros.</p>
            <a href="https://blaniel.com/dashboard" class="cta">
              Comenzar ahora →
            </a>
          </div>
          <div class="footer">
            <p>¿Necesitás ayuda? Respondé a este email.</p>
            <p>Blaniel © 2025</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return {
    subject: `🎉 ¡Bienvenido al plan ${planName}!`,
    text: `Hola ${userName}, tu suscripción está activa.`,
    html
  };
}
```

---

## 🚀 ¡Listo!

Con estos cambios, tu sistema de pagos estará **100% completo** y enviará emails automáticos para:
- ✅ Nuevas suscripciones
- ✅ Renovaciones exitosas
- ✅ Pagos fallidos (alertas críticas)
- ✅ Cancelaciones
- ✅ Cambios de plan
- ✅ Trials por terminar
- ✅ Reactivaciones

**Tiempo total:** ~5 minutos
**Esfuerzo:** Mínimo
**Impacto:** Máximo (mejor UX y retención)

---

**Creado:** 2025-01-04
**Por:** Claude Code
**Estado:** ✅ Listo para usar
