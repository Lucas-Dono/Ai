# Sistema de Email Sequences

Sistema automatizado de secuencias de emails para activación, retención y conversión de usuarios.

## Índice

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Secuencias Implementadas](#secuencias-implementadas)
- [Configuración](#configuración)
- [Uso](#uso)
- [Analytics y Tracking](#analytics-y-tracking)
- [Triggers Automáticos](#triggers-automáticos)
- [Personalización](#personalización)

---

## Descripción General

El sistema de Email Sequences permite enviar emails automáticos personalizados basados en el comportamiento del usuario, con el objetivo de:

1. **Activación**: Guiar a nuevos usuarios (Welcome sequence)
2. **Retención**: Reactivar usuarios inactivos (Reactivation sequence)
3. **Conversión**: Promover upgrades (Upgrade Nudge & Trial Ending)
4. **Engagement**: Anunciar features y mantener usuarios informados

### Características principales:

- Secuencias multi-step con delays configurables
- Templates profesionales con React Email
- Tracking completo (delivered, opened, clicked, converted)
- A/B testing de subject lines
- Personalización con variables dinámicas
- Respeto de preferencias de usuario (horarios, categorías)
- Analytics y métricas de conversión
- GDPR compliant con unsubscribe

---

## Arquitectura

### Componentes

```
lib/email/
├── resend-client.ts          # Cliente de Resend
├── types.ts                  # Tipos TypeScript
├── triggers.ts               # Funciones para disparar secuencias
├── sequences/
│   └── sequence.service.ts   # Servicio principal de sequences
└── templates/
    ├── renderer.ts           # Renderizador de templates
    ├── components/           # Componentes reusables
    │   ├── EmailLayout.tsx
    │   └── Button.tsx
    ├── welcome/              # 5 emails de bienvenida
    ├── reactivation/         # 4 emails de reactivación
    ├── upgrade/              # 3 emails de upgrade
    └── trial/                # 3 emails de trial ending

app/api/
├── cron/email-sequences/     # Cron job para envío automático
└── webhooks/resend/          # Webhook para tracking

prisma/schema.prisma          # 6 modelos nuevos:
                              # - EmailSequence
                              # - EmailTemplate
                              # - EmailSent
                              # - EmailPreference
                              # - EmailSequenceAnalytics
                              # - UserSequenceState
```

### Flujo de trabajo

1. **Trigger Event** → Usuario realiza una acción (signup, inactivo, límite alcanzado)
2. **Create Sequence State** → Se crea un `UserSequenceState` activo
3. **Schedule First Email** → Se calcula `nextEmailAt` basado en delays
4. **Cron Job** → Ejecuta cada hora, procesa emails programados
5. **Send Email** → Envía via Resend, crea registro en `EmailSent`
6. **Webhook** → Resend notifica eventos (delivered, opened, clicked)
7. **Update State** → Actualiza siguiente paso o completa secuencia
8. **Analytics** → Agrega métricas diarias por secuencia

---

## Secuencias Implementadas

### 1. Welcome Sequence (Onboarding)

**Trigger**: Signup
**Target**: Todos los planes
**Duración**: 14 días
**Emails**: 5

| Email | Delay | Subject | Objetivo |
|-------|-------|---------|----------|
| Welcome 1 | Inmediato | "Bienvenido a Circuit Prompt AI, {{userName}}!" | Quick start guide |
| Welcome 2 | Día 1 | "Tips para conversaciones increíbles" | Best practices |
| Welcome 3 | Día 3 | "Descubre los mundos virtuales" | Feature education |
| Welcome 4 | Día 7 | "Únete a nuestra comunidad" | Community engagement |
| Welcome 5 | Día 14 | "Desbloquea todo el potencial" | Upgrade prompt (20% OFF) |

**Conversión esperada**: 8-12% upgrade en día 14

---

### 2. Reactivation Sequence (Retention)

**Trigger**: 7 días inactivo
**Target**: Todos los planes
**Duración**: 30 días
**Emails**: 4

| Email | Delay | Subject | Objetivo |
|-------|-------|---------|----------|
| Reactivation 1 | Día 7 | "Te extrañamos, {{userName}}" | Recordatorio suave |
| Reactivation 2 | Día 14 | "Nuevas features que te encantarán" | Feature highlights |
| Reactivation 3 | Día 21 | "50% OFF si vuelves hoy" | Oferta agresiva |
| Reactivation 4 | Día 30 | "Última oportunidad" | Feedback request |

**Conversión esperada**: 15-20% reactivación

---

### 3. Upgrade Nudge Sequence (Conversion)

**Trigger**: 90% del límite de mensajes alcanzado
**Target**: Plan Free
**Duración**: 30 días
**Emails**: 3

| Email | Delay | Subject | Objetivo |
|-------|-------|---------|----------|
| Upgrade 1 | Inmediato | "Casi alcanzaste tu límite" | Awareness |
| Upgrade 2 | Día 10 | "Unlock los mundos virtuales" | Value proposition |
| Upgrade 3 | Día 20 | "Oferta especial: 20% OFF" | Conversión con descuento |

**Conversión esperada**: 25-35% upgrade a Plus/Ultra

---

### 4. Trial Ending Sequence (Conversion)

**Trigger**: 3 días antes de fin de trial
**Target**: Planes Plus/Ultra en trial
**Duración**: 4 días
**Emails**: 3

| Email | Delay | Subject | Objetivo |
|-------|-------|---------|----------|
| Trial 1 | 3 días antes | "Tu trial termina en 3 días" | Early warning |
| Trial 2 | 1 día antes | "Última oportunidad: Tu trial termina mañana" | Urgencia |
| Trial 3 | 1 día después | "Tu plan ha cambiado a Free" | Recover con 25% OFF |

**Conversión esperada**: 40-50% retención post-trial

---

## Configuración

### 1. Instalar dependencias

```bash
npm install resend react-email @react-email/components
```

### 2. Configurar Resend

1. Crear cuenta en [Resend](https://resend.com)
2. Verificar dominio de email
3. Obtener API key
4. Configurar `.env`:

```bash
RESEND_API_KEY="re_your_api_key"
RESEND_FROM_EMAIL="noreply@tudominio.com"
RESEND_FROM_NAME="Circuit Prompt AI"
```

### 3. Actualizar base de datos

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed de secuencias

```bash
npx tsx scripts/seed-email-sequences.ts
```

### 5. Configurar webhook de Resend

1. En Resend Dashboard → Webhooks
2. Crear webhook: `https://tudominio.com/api/webhooks/resend`
3. Seleccionar eventos:
   - `email.sent`
   - `email.delivered`
   - `email.bounced`
   - `email.opened`
   - `email.clicked`

### 6. Configurar cron job

**Opción A: Vercel Cron**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/email-sequences",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Opción B: External Cron (cron-job.org, EasyCron)**

```bash
# Ejecutar diariamente a las 9am
curl -X GET https://tudominio.com/api/cron/email-sequences \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Uso

### Disparar secuencia de bienvenida

```typescript
import { triggerWelcomeSequence } from '@/lib/email/triggers';

// Después de signup
await triggerWelcomeSequence(user.id);
```

### Disparar secuencia de upgrade

```typescript
import { triggerUpgradeNudge } from '@/lib/email/triggers';

// Cuando usuario alcanza 90% del límite
await triggerUpgradeNudge(user.id, 'limit_90');
```

### Cancelar secuencia

```typescript
import { cancelSequence } from '@/lib/email/sequences/sequence.service';

// Si usuario hace upgrade
await cancelSequence(user.id, 'upgrade_nudge');
```

### Trackear conversión

```typescript
import { trackConversion } from '@/lib/email/sequences/sequence.service';

// Cuando usuario upgradeq
await trackConversion({
  userId: user.id,
  sequenceId: 'welcome',
  conversionType: 'upgrade',
});
```

---

## Analytics y Tracking

### Métricas disponibles

Para cada secuencia, se trackea:

- **Volume**: scheduled, sent, delivered, bounced, failed
- **Engagement**: opened, clicked, unsubscribed
- **Conversion**: conversiones atribuidas
- **Rates**: delivery, open, click, conversion, unsubscribe

### Acceder a analytics

```typescript
import { prisma } from '@/lib/prisma';

// Analytics de hoy para una secuencia
const analytics = await prisma.emailSequenceAnalytics.findUnique({
  where: {
    sequenceId_date: {
      sequenceId: 'welcome',
      date: new Date(),
    },
  },
});

console.log(`Open rate: ${analytics.openRate * 100}%`);
console.log(`Conversion rate: ${analytics.conversionRate * 100}%`);
```

### Dashboard de analytics (próximamente)

```typescript
// app/dashboard/email-analytics/page.tsx
export default function EmailAnalyticsPage() {
  // Mostrar gráficos de conversión por secuencia
  // Comparar A/B tests
  // Insights y recomendaciones
}
```

---

## Triggers Automáticos

### Signup

```typescript
// app/api/auth/[...nextauth]/route.ts
import { triggerWelcomeSequence } from '@/lib/email/triggers';

// Después de crear usuario
await triggerWelcomeSequence(newUser.id);
```

### Mensaje enviado (check límites)

```typescript
// app/api/agents/[id]/message/route.ts
import { checkMessageLimits } from '@/lib/email/triggers';

// Después de enviar mensaje
await checkMessageLimits(user.id, userMessageCount);
```

### Inactividad (cron job)

```typescript
// Se ejecuta automáticamente vía cron
// Revisa usuarios inactivos 7, 14, 21, 30 días
```

### Trial ending (cron job)

```typescript
// Se ejecuta automáticamente vía cron
// Revisa trials terminando en 3d, 1d, y terminados
```

---

## Personalización

### Variables disponibles

```typescript
interface EmailTemplateData {
  userName?: string;
  userEmail?: string;
  plan?: 'free' | 'plus' | 'ultra';
  messagesUsed?: number;
  messagesLimit?: number;
  daysInactive?: number;
  trialEndsAt?: Date;
  unsubscribeUrl: string;
  loginUrl: string;
  dashboardUrl: string;
  upgradeUrl: string;
  supportUrl: string;
  customData?: Record<string, any>;
}
```

### Usar variables en subject

```typescript
{
  subject: "Hola {{userName}}, te quedan {{messagesLimit - messagesUsed}} mensajes"
}
```

### Crear nuevo template

```typescript
// lib/email/templates/custom/MyEmail.tsx
import { Heading, Text } from '@react-email/components';
import EmailLayout from '../components/EmailLayout';
import Button from '../components/Button';

export default function MyEmail(props: EmailTemplateData) {
  return (
    <EmailLayout preview="Preview text" unsubscribeUrl={props.unsubscribeUrl}>
      <Heading>Hola {props.userName}</Heading>
      <Text>Tu contenido aquí</Text>
      <Button href={props.dashboardUrl}>Call to action</Button>
    </EmailLayout>
  );
}
```

### Agregar a renderer

```typescript
// lib/email/templates/renderer.ts
import MyEmail from './custom/MyEmail';

const TEMPLATES = {
  // ... existing templates
  'my_email': MyEmail,
};
```

---

## Preferencias de Usuario

Los usuarios pueden controlar:

### Categorías de email

```typescript
interface EmailPreference {
  onboardingEmails: boolean;   // Welcome, tips
  retentionEmails: boolean;     // Reactivation
  featureEmails: boolean;       // Announcements
  conversionEmails: boolean;    // Upgrade prompts
  transactionalEmails: boolean; // Siempre true (no se puede desactivar)
}
```

### Frecuencia

```typescript
{
  maxEmailsPerWeek: 5,  // Máximo de emails marketing por semana
}
```

### Horario preferido

```typescript
{
  preferredHourStart: 9,   // 9am
  preferredHourEnd: 18,    // 6pm
  timezone: "America/Buenos_Aires"
}
```

### Unsubscribe

```typescript
{
  unsubscribedAll: true,  // Opt-out de todos los emails marketing
}
```

---

## Mejores Prácticas

### Subject lines

- **Personalizar**: Usar `{{userName}}`
- **Ser específico**: Decir exactamente qué hay en el email
- **Crear urgencia** (cuando apropiado): "Solo 24 horas"
- **A/B test**: Probar variantes y medir open rates

### Timing

- **Onboarding**: Enviar rápido (día 0, 1, 3, 7)
- **Retention**: Dar tiempo (7, 14, 21, 30 días)
- **Conversion**: Cerca del momento de decisión
- **Respetar horarios**: 9am-6pm, nunca fines de semana noche

### Contenido

- **Corto y claro**: 150-200 palabras máximo
- **Un objetivo por email**: Una CTA principal
- **Mobile-first**: 60%+ abren en mobile
- **Value first**: Beneficio antes de pedir acción

### Frequency

- **Onboarding**: OK ser agresivo (5 emails en 14 días)
- **Retention**: Espaciado (4 emails en 30 días)
- **Respetar límites**: Max 5 emails/semana
- **Unsubscribe fácil**: En todos los emails

---

## Roadmap

### Próximas features

- [ ] **A/B Testing UI**: Interface para crear y comparar variantes
- [ ] **Segmentación avanzada**: Por ubicación, comportamiento, device
- [ ] **Email Builder**: Crear templates sin código
- [ ] **RSS to Email**: Auto-enviar cuando publiques blog posts
- [ ] **Smart Timing**: ML para predecir mejor hora de envío
- [ ] **Recommendaciones**: Sugerir qué enviar a cada usuario
- [ ] **Multi-idioma**: Templates en ES, EN, PT
- [ ] **SMS Integration**: Combinar email + SMS
- [ ] **Push Notifications**: Combinar email + push

---

## Costos Estimados

### Resend Pricing

- **Free**: 100 emails/día, 3,000/mes - $0
- **Pro**: 50,000 emails/mes - $20/mes
- **Enterprise**: Ilimitado - Custom

### Estimación para 10,000 usuarios

- **Welcome**: 10,000 users × 5 emails = 50,000 emails/mes
- **Reactivation**: 20% inactive × 4 emails = 8,000 emails/mes
- **Upgrade**: 50% reach limit × 3 emails = 15,000 emails/mes
- **Trial**: 5% trial × 3 emails = 1,500 emails/mes

**Total**: ~75,000 emails/mes = **$20/mes** (Plan Pro)

### ROI Esperado

- **Upgrade conversions**: 10% × 10,000 users = 1,000 upgrades/año
- **Revenue at $9.99/mo**: 1,000 × $9.99 × 12 = **$119,880/año**
- **Email cost**: $20 × 12 = **$240/año**
- **ROI**: **49,850%** 🚀

---

## Soporte

Para preguntas o problemas:

1. Revisar logs: `app/api/cron/email-sequences`
2. Verificar webhook: `app/api/webhooks/resend`
3. Check Resend Dashboard: [resend.com/emails](https://resend.com/emails)
4. Ver analytics: `EmailSequenceAnalytics` table

---

## Changelog

### v1.0.0 (2025-10-31)

- ✅ 4 secuencias implementadas (15 emails)
- ✅ Templates profesionales con React Email
- ✅ Tracking completo (open, click, conversion)
- ✅ Cron job automático
- ✅ Webhook de Resend
- ✅ Analytics por secuencia
- ✅ Preferencias de usuario
- ✅ GDPR compliant

---

¡El sistema está listo para lanzar! 🚀
