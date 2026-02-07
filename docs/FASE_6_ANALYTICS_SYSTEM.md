# Sistema de Analytics & KPIs - FASE 6

## 📋 Tabla de Contenidos
- [Overview](#overview)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [KPIs por Categoría](#kpis-por-categoría)
- [Tracking de Eventos](#tracking-de-eventos)
- [Dashboards](#dashboards)
- [Integración en el Código](#integración-en-el-código)
- [Sistema de Alertas](#sistema-de-alertas)
- [Testing](#testing)
- [Deployment](#deployment)

---

## Overview

El Sistema de Analytics de la Fase 6 es un sistema completo de monitoreo de KPIs (Key Performance Indicators) del negocio, diseñado para:

1. **Monitorear métricas críticas** en tiempo real
2. **Detectar problemas** antes de que se conviertan en crisis
3. **Optimizar conversiones** basándose en datos
4. **Cumplir con compliance** automáticamente
5. **Tomar decisiones basadas en datos** reales

### Métricas Clave

El sistema monitorea 4 categorías principales:

| Categoría | Objetivo | Métricas Clave |
|-----------|----------|----------------|
| **Compliance & Safety** | Cumplir 100% regulaciones | Age verification, NSFW consent, Moderation |
| **User Experience** | Optimizar conversión | Time to first agent, Signup→Message, D7 retention |
| **Engagement** | Maximizar uso | Messages/session, Sessions/week, Feature discovery |
| **Monetization** | Generar revenue | MRR, Conversion rate, Churn |

---

## Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION CODE                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Age Gate     │  │ NSFW Consent │  │ Chat System  │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          trackEvent(EventType, metadata)             │   │
│  └───────────────────┬─────────────────────────────────┘   │
└────────────────────────┬───────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  lib/analytics/kpi-tracker.ts                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         STORAGE - prisma.analyticsEvent              │  │
│  │  {                                                   │  │
│  │    eventType: "age_verification_completed",         │  │
│  │    metadata: { userId: "...", success: true },      │  │
│  │    timestamp: "2025-11-11T10:30:00Z"                │  │
│  │  }                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         CALCULATION - getAllKPIs()                   │  │
│  │  - getComplianceMetrics()                           │  │
│  │  - getUserExperienceMetrics()                       │  │
│  │  - getEngagementMetrics()                           │  │
│  │  - getMonetizationMetrics()                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         ALERTING - checkAlerts()                     │  │
│  │  - Detect critical issues                           │  │
│  │  - Trigger notifications                            │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            app/api/analytics/kpis/route.ts                   │
│                   GET /api/analytics/kpis                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         app/dashboard/metrics/page.tsx (Monetization)        │
│         app/dashboard/kpis/page.tsx (Complete KPIs)          │
│         app/dashboard/analytics/page.tsx (Behaviors)         │
└─────────────────────────────────────────────────────────────┘
```

### Base de Datos

```prisma
model AnalyticsEvent {
  id        String   @id @default(cuid())
  eventType String   // EventType enum como string
  metadata  Json     // Metadata flexible del evento
  timestamp DateTime @default(now())

  @@index([eventType])
  @@index([timestamp])
  @@index([eventType, timestamp])
}
```

---

## KPIs por Categoría

### 1. Compliance & Safety

#### Age Verification Rate
- **Target**: 100%
- **Cálculo**: (verifications completed / total signups) × 100
- **Status**:
  - ✅ Good: ≥99%
  - ⚠️ Warning: 95-99%
  - 🚨 Critical: <95%

#### NSFW Consent Rate
- **Target**: 100% (for adults accessing NSFW content)
- **Cálculo**: (consents accepted / total NSFW prompts) × 100
- **Status**:
  - ✅ Good: ≥99%
  - ⚠️ Warning: 95-99%
  - 🚨 Critical: <95%

#### Moderation False Positive Rate
- **Target**: <0.1%
- **Cálculo**: (false positives / total moderated) × 100
- **Status**:
  - ✅ Good: ≤0.1%
  - ⚠️ Warning: 0.1-0.5%
  - 🚨 Critical: >0.5%

#### PII Redaction Rate
- **Target**: 100%
- **Cálculo**: (PII redacted / PII detected) × 100
- **Status**:
  - ✅ Good: ≥99%
  - ⚠️ Warning: 95-99%
  - 🚨 Critical: <95%

### 2. User Experience

#### Time to First Agent
- **Baseline**: 8 minutes
- **Target**: 3 minutes
- **Cálculo**: Avg time from signup → first agent created
- **Status**:
  - ✅ Good: ≤3 min
  - ⚠️ Warning: 3-5 min
  - 🚨 Critical: >5 min

#### Signup → First Message Conversion
- **Baseline**: 40%
- **Target**: 65%
- **Cálculo**: (users who sent message / total signups) × 100
- **Status**:
  - ✅ Good: ≥65%
  - ⚠️ Warning: 50-65%
  - 🚨 Critical: <50%

#### Mobile Bounce Rate
- **Baseline**: 65%
- **Target**: 40%
- **Cálculo**: (sessions <30s / total mobile sessions) × 100
- **Status**:
  - ✅ Good: ≤40%
  - ⚠️ Warning: 40-50%
  - 🚨 Critical: >50%

#### D7 Retention
- **Baseline**: 25%
- **Target**: 35%
- **Cálculo**: (users active on day 7 / cohort size) × 100
- **Status**:
  - ✅ Good: ≥35%
  - ⚠️ Warning: 30-35%
  - 🚨 Critical: <30%

### 3. Engagement

#### Avg Messages per Session
- **Baseline**: 12
- **Target**: 18
- **Cálculo**: Total messages / total sessions
- **Status**:
  - ✅ Good: ≥18
  - ⚠️ Warning: 15-18
  - 🚨 Critical: <15

#### Sessions per Week (per active user)
- **Baseline**: 3
- **Target**: 5
- **Cálculo**: Avg sessions/week for active users
- **Status**:
  - ✅ Good: ≥5
  - ⚠️ Warning: 4-5
  - 🚨 Critical: <4

#### Command Palette Discovery Rate
- **Baseline**: 0%
- **Target**: 15%
- **Cálculo**: (users who opened command palette / total sessions) × 100
- **Status**:
  - ✅ Good: ≥15%
  - ⚠️ Warning: 10-15%
  - 🚨 Critical: <10%

### 4. Monetization

#### Free → Plus Conversion
- **Target**: 6-12%
- **Cálculo**: (paid users / free users) × 100
- **Status**:
  - ✅ Good: ≥6%
  - ⚠️ Warning: 4-6%
  - 🚨 Critical: <4%

#### MRR (Monthly Recurring Revenue)
- **Target**: $18,000 - $48,000
- **Cálculo**: Sum of active subscriptions
- **Status**:
  - ✅ Good: ≥$18,000
  - ⚠️ Warning: $10,000-$18,000
  - 🚨 Critical: <$10,000

#### Churn Rate
- **Target**: <5%
- **Cálculo**: (cancelled subs / total subs) × 100 (monthly)
- **Status**:
  - ✅ Good: ≤5%
  - ⚠️ Warning: 5-7%
  - 🚨 Critical: >7%

#### Upgrade Modal CTR
- **Target**: >10%
- **Cálculo**: (modal clicks / modal views) × 100
- **Status**:
  - ✅ Good: ≥10%
  - ⚠️ Warning: 5-10%
  - 🚨 Critical: <5%

---

## Tracking de Eventos

### EventType Enum

```typescript
export enum EventType {
  // Compliance & Safety
  AGE_VERIFICATION_COMPLETED = "age_verification_completed",
  AGE_VERIFICATION_FAILED = "age_verification_failed",
  NSFW_CONSENT_ACCEPTED = "nsfw_consent_accepted",
  NSFW_CONSENT_DECLINED = "nsfw_consent_declined",
  CONTENT_MODERATED = "content_moderated",
  CONTENT_FALSE_POSITIVE = "content_false_positive",
  PII_DETECTED = "pii_detected",
  PII_REDACTED = "pii_redacted",

  // User Experience
  SIGNUP_COMPLETED = "signup_completed",
  FIRST_AGENT_CREATED = "first_agent_created",
  FIRST_MESSAGE_SENT = "first_message_sent",
  PAGE_VIEW = "page_view",
  MOBILE_SESSION = "mobile_session",

  // Engagement
  SESSION_STARTED = "session_started",
  SESSION_ENDED = "session_ended",
  MESSAGE_SENT = "message_sent",
  COMMAND_PALETTE_OPENED = "command_palette_opened",
  FEATURE_DISCOVERED = "feature_discovered",

  // Monetization
  SUBSCRIPTION_STARTED = "subscription_started",
  SUBSCRIPTION_CANCELLED = "subscription_cancelled",
  PAYMENT_SUCCEEDED = "payment_succeeded",
  PAYMENT_FAILED = "payment_failed",
  UPGRADE_MODAL_VIEWED = "upgrade_modal_viewed",
  UPGRADE_MODAL_CLICKED = "upgrade_modal_clicked",
}
```

### Función Principal: trackEvent()

```typescript
import { trackEvent, EventType } from "@/lib/analytics/kpi-tracker";

// Ejemplo: Age Verification
await trackEvent(EventType.AGE_VERIFICATION_COMPLETED, {
  userId: user.id,
  age: 25,
  method: "birthdate",
});

// Ejemplo: First Message
await trackEvent(EventType.FIRST_MESSAGE_SENT, {
  userId: user.id,
  agentId: agent.id,
  sessionId: session.id,
  tokensUsed: 350,
});

// Ejemplo: Subscription
await trackEvent(EventType.SUBSCRIPTION_STARTED, {
  userId: user.id,
  plan: "plus",
  previousPlan: "free",
  amount: 9.99,
});
```

---

## Dashboards

### Dashboard de KPIs Completo
**Ruta**: `/dashboard/kpis`
**API**: `GET /api/analytics/kpis`

Muestra **todas** las métricas de la Fase 6:
- Overview con las 4 métricas principales
- Tabs separados por categoría
- Sistema de alertas en tiempo real
- Visualización de status (good/warning/critical)

### Dashboard de Monetización
**Ruta**: `/dashboard/metrics`
**API**: `GET /api/analytics/monetization`

Enfocado en métricas de ingresos:
- MRR, ARPU, LTV, Churn
- Distribución de planes
- Contexto de upgrades
- Tendencias temporales

### Dashboard de Behaviors
**Ruta**: `/dashboard/analytics`
**API**: `GET /api/analytics/behaviors`

Métricas de comportamiento de agentes:
- Distribución de behaviors
- Safety levels
- Triggers más frecuentes
- Comparación entre agentes

---

## Integración en el Código

### 1. Age Verification (Compliance)

```typescript
// app/api/auth/register/route.ts
import { trackEvent, EventType } from "@/lib/analytics/kpi-tracker";

export async function POST(req: Request) {
  const { email, password, birthDate } = await req.json();

  // Verificar edad
  const age = calculateAge(birthDate);
  const isAdult = age >= 18;

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      birthDate,
      isAdult,
      ageVerified: true,
      ageVerifiedAt: new Date(),
    },
  });

  // TRACKING: Age Verification Completed
  await trackEvent(EventType.AGE_VERIFICATION_COMPLETED, {
    userId: user.id,
    age,
    isAdult,
  });

  // TRACKING: Signup Completed
  await trackEvent(EventType.SIGNUP_COMPLETED, {
    userId: user.id,
    method: "credentials",
  });

  return NextResponse.json({ success: true, userId: user.id });
}
```

### 2. NSFW Consent (Compliance)

```typescript
// components/onboarding/NSFWConsent.tsx
import { trackEvent, EventType } from "@/lib/analytics/kpi-tracker";

async function handleAccept() {
  await fetch("/api/user/nsfw-consent", {
    method: "POST",
    body: JSON.stringify({ consent: true }),
  });

  // TRACKING: NSFW Consent Accepted
  await trackEvent(EventType.NSFW_CONSENT_ACCEPTED, {
    userId: session.user.id,
    consentVersion: "v1.0",
  });

  router.push("/dashboard");
}

async function handleDecline() {
  // TRACKING: NSFW Consent Declined
  await trackEvent(EventType.NSFW_CONSENT_DECLINED, {
    userId: session.user.id,
  });

  router.push("/dashboard");
}
```

### 3. First Agent Created (UX)

```typescript
// app/constructor/page.tsx
import { trackEvent, EventType } from "@/lib/analytics/kpi-tracker";

async function createAgent(data: AgentData) {
  const response = await fetch("/api/agents", {
    method: "POST",
    body: JSON.stringify(data),
  });

  const agent = await response.json();

  // Verificar si es el primer agente del usuario
  const agentsCount = await prisma.agent.count({
    where: { userId: session.user.id },
  });

  if (agentsCount === 1) {
    // TRACKING: First Agent Created
    await trackEvent(EventType.FIRST_AGENT_CREATED, {
      userId: session.user.id,
      agentId: agent.id,
      creationMethod: "wizard",
    });
  }

  router.push(`/agentes/${agent.id}`);
}
```

### 4. First Message Sent (UX + Engagement)

```typescript
// app/api/agents/[id]/message/route.ts
import { trackEvent, EventType } from "@/lib/analytics/kpi-tracker";

export async function POST(req: Request) {
  const { content } = await req.json();

  // Enviar mensaje al LLM...
  const response = await llmProvider.chat({ messages });

  // Guardar mensaje
  const savedMessage = await prisma.message.create({ data: {...} });

  // Verificar si es el primer mensaje del usuario
  const messagesCount = await prisma.message.count({
    where: { userId: session.user.id },
  });

  if (messagesCount === 1) {
    // TRACKING: First Message Sent
    await trackEvent(EventType.FIRST_MESSAGE_SENT, {
      userId: session.user.id,
      agentId: params.id,
      sessionId: generateSessionId(),
    });
  }

  // TRACKING: Message Sent (engagement)
  await trackEvent(EventType.MESSAGE_SENT, {
    userId: session.user.id,
    agentId: params.id,
    sessionId: getCurrentSession(),
    tokensUsed: response.usage.total_tokens,
  });

  return NextResponse.json(savedMessage);
}
```

### 5. Command Palette Opened (Engagement)

```typescript
// components/ui/command-palette.tsx
import { trackEvent, EventType } from "@/lib/analytics/kpi-tracker";

function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);

        // TRACKING: Command Palette Opened
        trackEvent(EventType.COMMAND_PALETTE_OPENED, {
          userId: session?.user.id,
          trigger: "keyboard",
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return <CommandPaletteUI open={open} onOpenChange={setOpen} />;
}
```

### 6. Subscription Started (Monetization)

```typescript
// app/api/webhooks/mercadopago/route.ts
import { trackEvent, EventType } from "@/lib/analytics/kpi-tracker";

export async function POST(req: Request) {
  const webhook = await req.json();

  if (webhook.type === "payment" && webhook.action === "payment.created") {
    const payment = webhook.data;

    // Actualizar suscripción del usuario
    const subscription = await prisma.subscription.create({
      data: {
        userId: payment.metadata.userId,
        status: "active",
        plan: payment.metadata.plan,
      },
    });

    // Obtener el plan anterior del usuario
    const user = await prisma.user.findUnique({
      where: { id: payment.metadata.userId },
      select: { plan: true },
    });

    // TRACKING: Subscription Started
    await trackEvent(EventType.SUBSCRIPTION_STARTED, {
      userId: payment.metadata.userId,
      plan: payment.metadata.plan,
      previousPlan: user?.plan || "free",
      amount: payment.transaction_amount,
    });

    // TRACKING: Payment Succeeded
    await trackEvent(EventType.PAYMENT_SUCCEEDED, {
      userId: payment.metadata.userId,
      amount: payment.transaction_amount,
      paymentId: payment.id,
    });
  }

  return NextResponse.json({ received: true });
}
```

### 7. Mobile Session (UX)

```typescript
// app/layout.tsx
import { trackEvent, EventType } from "@/lib/analytics/kpi-tracker";

function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Detectar mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      const sessionStart = Date.now();

      // TRACKING: Mobile Session
      trackEvent(EventType.MOBILE_SESSION, {
        userId: session?.user.id,
        userAgent: navigator.userAgent,
        screenSize: `${window.screen.width}x${window.screen.height}`,
      });

      // Track duration on unmount
      return () => {
        const duration = Math.floor((Date.now() - sessionStart) / 1000);
        trackEvent(EventType.MOBILE_SESSION, {
          userId: session?.user.id,
          duration, // en segundos
        });
      };
    }
  }, []);

  return <html>{children}</html>;
}
```

---

## Sistema de Alertas

### checkAlerts()

Función que se ejecuta automáticamente para detectar problemas críticos:

```typescript
import { checkAlerts } from "@/lib/analytics/kpi-tracker";

// Ejecutar en un cron job cada hora
export async function GET() {
  const alerts = await checkAlerts();

  if (alerts.length > 0) {
    // Enviar notificaciones (email, Slack, etc.)
    await sendAlertNotifications(alerts);
  }

  return NextResponse.json({ alerts });
}
```

### Tipos de Alertas

| Nivel | Descripción | Acción |
|-------|-------------|--------|
| 🚨 **Critical** | KPI en zona crítica | Notificación inmediata + Escalamiento |
| ⚠️ **Warning** | KPI acercándose al límite | Notificación + Monitoreo |

### Ejemplos de Alertas

```typescript
{
  level: "critical",
  category: "Compliance",
  metric: "Age Verification Rate",
  message: "Age verification rate is 94% (target: 100%)"
}

{
  level: "critical",
  category: "Monetization",
  metric: "Churn Rate",
  message: "Churn rate is 8% (target: <5%)"
}

{
  level: "warning",
  category: "User Experience",
  metric: "Signup to Message Conversion",
  message: "Only 55% of users send their first message (target: 65%)"
}
```

---

## Testing

### Unit Tests

```typescript
// __tests__/lib/analytics/kpi-tracker.test.ts
import { trackEvent, EventType, getComplianceMetrics } from "@/lib/analytics/kpi-tracker";

describe("KPI Tracker", () => {
  it("should track age verification event", async () => {
    await trackEvent(EventType.AGE_VERIFICATION_COMPLETED, {
      userId: "test_user_123",
      age: 25,
    });

    const events = await prisma.analyticsEvent.findMany({
      where: {
        eventType: EventType.AGE_VERIFICATION_COMPLETED,
      },
    });

    expect(events.length).toBeGreaterThan(0);
  });

  it("should calculate compliance metrics correctly", async () => {
    // Setup: Create test data
    await trackEvent(EventType.SIGNUP_COMPLETED, { userId: "user1" });
    await trackEvent(EventType.SIGNUP_COMPLETED, { userId: "user2" });
    await trackEvent(EventType.AGE_VERIFICATION_COMPLETED, { userId: "user1" });
    await trackEvent(EventType.AGE_VERIFICATION_COMPLETED, { userId: "user2" });

    // Test
    const metrics = await getComplianceMetrics();

    expect(metrics.ageVerification.rate).toBe(100);
    expect(metrics.ageVerification.status).toBe("good");
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/analytics-flow.test.ts
describe("Analytics Flow", () => {
  it("should track complete user journey", async () => {
    // 1. Signup
    const signupRes = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        birthDate: "2000-01-01",
      }),
    });
    expect(signupRes.status).toBe(200);

    // Verificar que se trackeo signup
    const signupEvents = await prisma.analyticsEvent.findMany({
      where: { eventType: EventType.SIGNUP_COMPLETED },
    });
    expect(signupEvents.length).toBeGreaterThan(0);

    // 2. Create First Agent
    const agentRes = await fetch("/api/agents", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Agent",
        personality: "Friendly",
      }),
    });
    expect(agentRes.status).toBe(200);

    // Verificar que se trackeo first agent
    const agentEvents = await prisma.analyticsEvent.findMany({
      where: { eventType: EventType.FIRST_AGENT_CREATED },
    });
    expect(agentEvents.length).toBeGreaterThan(0);

    // 3. Send First Message
    const messageRes = await fetch("/api/agents/test_agent/message", {
      method: "POST",
      body: JSON.stringify({ content: "Hello!" }),
    });
    expect(messageRes.status).toBe(200);

    // Verificar que se trackeo first message
    const messageEvents = await prisma.analyticsEvent.findMany({
      where: { eventType: EventType.FIRST_MESSAGE_SENT },
    });
    expect(messageEvents.length).toBeGreaterThan(0);

    // 4. Verificar métricas calculadas
    const uxMetrics = await getUserExperienceMetrics();
    expect(uxMetrics.signupToMessage.current).toBeGreaterThan(0);
  });
});
```

---

## Deployment

### 1. Migración de Base de Datos

```bash
# Agregar modelo AnalyticsEvent
npx prisma migrate dev --name add_analytics_events

# Verificar migración
npx prisma migrate status

# Deploy a producción
npx prisma migrate deploy
```

### 2. Variables de Entorno

No se requieren variables de entorno adicionales para el sistema de analytics base.

### 3. Cron Jobs (Opcional)

Para ejecutar `checkAlerts()` automáticamente cada hora:

```typescript
// app/api/cron/check-alerts/route.ts
import { checkAlerts } from "@/lib/analytics/kpi-tracker";

export async function GET(req: Request) {
  // Verificar autenticación de cron job
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ejecutar alertas
  const alerts = await checkAlerts();

  if (alerts.length > 0) {
    // Enviar notificaciones
    for (const alert of alerts) {
      await sendSlackNotification({
        channel: "#alerts",
        text: `${alert.level === "critical" ? "🚨" : "⚠️"} *${alert.category}*: ${alert.metric}\n${alert.message}`,
      });
    }
  }

  return NextResponse.json({
    success: true,
    alertsCount: alerts.length,
    alerts,
  });
}
```

**Configurar en Vercel**:
```bash
# vercel.json
{
  "crons": [
    {
      "path": "/api/cron/check-alerts",
      "schedule": "0 * * * *"
    }
  ]
}
```

### 4. Monitoreo

#### Dashboard Principal
- URL: `https://tu-dominio.com/dashboard/kpis`
- Actualizar cada 5 minutos automáticamente

#### Alertas por Email/Slack
Configurar notificaciones para alertas críticas:

```typescript
// lib/notifications/alerts.ts
export async function sendAlertNotifications(alerts: Alert[]) {
  const criticalAlerts = alerts.filter((a) => a.level === "critical");

  if (criticalAlerts.length > 0) {
    // Email
    await sendEmail({
      to: "admin@tu-dominio.com",
      subject: `🚨 ${criticalAlerts.length} Critical Alerts`,
      body: renderAlertsEmail(criticalAlerts),
    });

    // Slack
    await sendSlackMessage({
      channel: "#alerts",
      text: formatAlertsForSlack(criticalAlerts),
    });
  }
}
```

---

## Métricas de Éxito de la Fase 6

### Objetivos (3 meses post-implementación)

| Métrica | Target | Medición |
|---------|--------|----------|
| **Dashboard Usage** | 100% del equipo usa dashboards semanalmente | Google Analytics |
| **Data-Driven Decisions** | 80% de decisiones basadas en KPIs | Team surveys |
| **Alert Response Time** | <1 hora para critical alerts | Alert logs |
| **KPI Improvement** | 20% mejora en KPIs críticos | KPI dashboard |

### KPIs de los KPIs

- Tiempo promedio de resolución de alertas críticas
- Número de decisiones basadas en datos por mes
- Porcentaje de KPIs en zona "good"
- Engagement con dashboards (views/week)

---

## Próximos Pasos

### Fase 6.1: ML Predictions (Futuro)
- Predicción de churn usando ML
- Anomaly detection en métricas
- Recomendaciones automáticas de optimización

### Fase 6.2: A/B Testing Integration
- Framework de A/B testing integrado
- Tracking automático de variantes
- Análisis estadístico de resultados

### Fase 6.3: Advanced Analytics
- Cohort analysis avanzado
- Funnel analysis detallado
- Revenue attribution modeling

---

## Referencias

- [Plan de Coordinación (META_COORDINACION_AGENTES.md)](/META_COORDINACION_AGENTES.md)
- [Token-Based Limits System](/docs/TOKEN_BASED_LIMITS_SYSTEM.md)
- [Billing System](/docs/PAYMENT_QUICK_START.md)
- [Safety & Compliance](/docs/NSFW_CONSENT_FLOW.md)

---

**Última actualización**: 2025-11-11
**Versión**: 1.0.0
**Autor**: Sistema de desarrollo (Fase 6 - Analytics & Iteration)
