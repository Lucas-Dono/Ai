# Plan de Implementación: Sistema de Analytics y KPIs

## Resumen Ejecutivo

Diseño de un sistema completo de analytics que aprovecha la infraestructura existente (`AnalyticsEvent`, `kpi-tracker.ts`, `analytics/service.ts`) para proporcionar métricas accionables sobre el comportamiento del usuario desde la landing page hasta el engagement profundo en la aplicación.

---

## 1. ARQUITECTURA DE DATOS

### 1.1 Extensión del Modelo AnalyticsEvent Existente

**Estado actual**: Ya existe `AnalyticsEvent` con `eventType` (string), `metadata` (JSON), `timestamp`

**Propuesta**: Crear enums y tipos específicos para estandarizar eventos

```typescript
enum LandingEventType {
  LANDING_PAGE_VIEW = 'landing.page_view',
  LANDING_FEATURE_CLICK = 'landing.feature_click',
  LANDING_CTA_PRIMARY = 'landing.cta_primary',
  LANDING_CTA_SECONDARY = 'landing.cta_secondary',
  LANDING_DEMO_START = 'landing.demo_start',
  LANDING_DEMO_MESSAGE = 'landing.demo_message',
  LANDING_DEMO_SIGNUP = 'landing.demo_signup',
  LANDING_SCROLL_DEPTH = 'landing.scroll_depth',
  LANDING_VIDEO_PLAY = 'landing.video_play',
}

enum AppEventType {
  APP_PAGE_VIEW = 'app.page_view',
  APP_AGENT_SELECT = 'app.agent_select',
  APP_MESSAGE_SEND = 'app.message_send',
  APP_BOND_PROGRESS = 'app.bond_progress',
  APP_FEATURE_USE = 'app.feature_use',
  APP_TIER_CHANGE = 'app.tier_change',
}

enum ConversionEventType {
  CONVERSION_SIGNUP = 'conversion.signup',
  CONVERSION_FIRST_AGENT = 'conversion.first_agent',
  CONVERSION_FIRST_MESSAGE = 'conversion.first_message',
  CONVERSION_FREE_TO_PLUS = 'conversion.free_to_plus',
  CONVERSION_FREE_TO_ULTRA = 'conversion.free_to_ultra',
  CONVERSION_PLUS_TO_ULTRA = 'conversion.plus_to_ultra',
}
```

### 1.2 Nuevo Modelo: UserSession (tracking de sesiones)

```prisma
model UserSession {
  id            String    @id @default(cuid())
  userId        String?   // null si es anónimo
  sessionId     String    @unique // cookie/fingerprint

  // Attribution
  utmSource     String?
  utmMedium     String?
  utmCampaign   String?
  referrer      String?
  landingPage   String?

  // Device
  deviceType    String    // mobile/desktop/tablet
  browser       String?
  os            String?

  // Timestamps
  startedAt     DateTime  @default(now())
  lastActivityAt DateTime @default(now())
  endedAt       DateTime?

  // Conversión
  convertedAt   DateTime? // momento de signup

  user          User?     @relation(fields: [userId], references: [id])
  events        AnalyticsEvent[]

  @@index([userId])
  @@index([sessionId])
  @@index([startedAt])
  @@index([convertedAt])
}
```

### 1.3 Nuevo Modelo: DailyKPI (agregado diario)

```prisma
model DailyKPI {
  id            String    @id @default(cuid())
  date          DateTime  @unique @db.Date

  // Landing Page
  landingViews          Int @default(0)
  demoStarts            Int @default(0)
  demoMessages          Int @default(0)
  ctaPrimaryClicks      Int @default(0)

  // Conversión
  signups               Int @default(0)
  signupRate            Float @default(0) // signups / landingViews
  demoToSignup          Int @default(0)
  demoConversionRate    Float @default(0) // demoToSignup / demoStarts

  // Activación
  firstAgentCreated     Int @default(0)
  firstMessageSent      Int @default(0)
  activationRate        Float @default(0) // firstMessage / signups

  // Engagement
  dau                   Int @default(0) // Daily Active Users
  totalMessages         Int @default(0)
  avgMessagesPerUser    Float @default(0)

  // Monetización
  freeToPlus            Int @default(0)
  freeToPlusRate        Float @default(0)
  freeToUltra           Int @default(0)
  freeToUltraRate       Float @default(0)
  plusToUltra           Int @default(0)

  // Retención
  d1Retention           Float @default(0) // % usuarios que vuelven día 1
  d7Retention           Float @default(0)
  d30Retention          Float @default(0)

  // Bonds
  bondsTier1            Int @default(0) // ROMANTIC
  bondsTier2            Int @default(0) // BEST_FRIEND
  bondsTier3            Int @default(0) // MENTOR
  bondsTier4            Int @default(0) // CONFIDANT
  bondsTier5            Int @default(0) // CREATIVE_PARTNER
  bondsTier6            Int @default(0) // ADVENTURE_COMPANION
  bondsTier7            Int @default(0) // ACQUAINTANCE

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([date])
}
```

### 1.4 Nuevo Modelo: UserAnalyticsSummary (snapshot por usuario)

```prisma
model UserAnalyticsSummary {
  id            String    @id @default(cuid())
  userId        String    @unique

  // Fuente de adquisición
  acquisitionSource    String?   // utm_source del primer session
  acquisitionMedium    String?
  acquisitionCampaign  String?

  // Actividad
  totalMessages        Int       @default(0)
  totalSessions        Int       @default(0)
  avgSessionDuration   Int       @default(0) // segundos
  lastActiveAt         DateTime?

  // Engagement
  favoriteAgentId      String?   // agente con más mensajes
  favoriteAgentMessages Int      @default(0)
  avgMessagesPerSession Float    @default(0)
  longestStreak        Int       @default(0) // días consecutivos
  currentStreak        Int       @default(0)

  // Bonds
  totalBonds           Int       @default(0)
  highestBondTier      String?   // BondTier
  avgBondAffinity      Float     @default(0)

  // Monetización
  plan                 String    @default("free")
  lifetimeValue        Float     @default(0) // USD
  firstPaidAt          DateTime?

  // Relation stages
  stageStranger        Int       @default(0)
  stageAcquaintance    Int       @default(0)
  stageFriend          Int       @default(0)
  stageClose           Int       @default(0)
  stageIntimate        Int       @default(0)

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  favoriteAgent Agent?    @relation(fields: [favoriteAgentId], references: [id])

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId])
  @@index([lastActiveAt])
  @@index([plan])
}
```

---

## 2. TRACKING DE EVENTOS

### 2.1 Landing Page Tracking

**Ubicación**: `app/landing/page.tsx` y componentes

**Eventos a capturar**:

```typescript
// Client-side tracking utility
// lib/analytics/track-client.ts

interface TrackEventParams {
  eventType: string;
  metadata?: Record<string, any>;
  sessionId?: string;
}

export async function trackEvent({ eventType, metadata, sessionId }: TrackEventParams) {
  const session = sessionId || getOrCreateSessionId();

  await fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType,
      metadata: {
        ...metadata,
        sessionId: session,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      }
    })
  });
}

// Ejemplos de uso:

// HeroSection.tsx
<Button onClick={() => {
  trackEvent({
    eventType: 'landing.cta_primary',
    metadata: { ctaText: 'Ir al Dashboard', position: 'hero' }
  });
  router.push('/dashboard');
}}>

// LandingDemoChat.tsx
const handleSendMessage = async (message: string) => {
  await trackEvent({
    eventType: 'landing.demo_message',
    metadata: {
      messageCount: messages.length + 1,
      messageLength: message.length,
      remainingMessages: messagesRemaining - 1
    }
  });
  // ... enviar mensaje
};

// Scroll depth tracking (page.tsx)
useEffect(() => {
  const handleScroll = () => {
    const scrollPercentage = (window.scrollY / document.body.scrollHeight) * 100;
    if (scrollPercentage > 75 && !scrolledPast75) {
      trackEvent({
        eventType: 'landing.scroll_depth',
        metadata: { depth: 75 }
      });
      setScrolledPast75(true);
    }
  };
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

### 2.2 App Tracking (Dashboard)

**Eventos clave**:

```typescript
// components/chat/MessageInput.tsx
const handleSend = async (message: string) => {
  await trackEvent({
    eventType: 'app.message_send',
    metadata: {
      agentId,
      messageLength: message.length,
      hasAttachment: false,
      conversationLength: messages.length
    }
  });
  // ... enviar mensaje
};

// components/AgentSelector.tsx
const handleSelectAgent = (agent: Agent) => {
  trackEvent({
    eventType: 'app.agent_select',
    metadata: {
      agentId: agent.id,
      agentName: agent.name,
      agentTier: agent.generationTier,
      previousAgentId: currentAgent?.id
    }
  });
  setCurrentAgent(agent);
};

// components/bonds/BondProgress.tsx
useEffect(() => {
  if (bond.affinityLevel > previousAffinity + 10) {
    trackEvent({
      eventType: 'app.bond_progress',
      metadata: {
        agentId: bond.agentId,
        bondTier: bond.rarityTier,
        oldAffinity: previousAffinity,
        newAffinity: bond.affinityLevel
      }
    });
  }
}, [bond.affinityLevel]);
```

### 2.3 Conversion Tracking

**Momentos clave del funnel**:

```typescript
// app/api/auth/signup/route.ts (o donde se maneje signup)
await trackEvent({
  eventType: 'conversion.signup',
  userId: newUser.id,
  metadata: {
    signupMethod: 'google', // o 'email'
    referralSource: session.utmSource,
    fromDemo: !!session.hadDemoInteraction
  }
});

// app/api/agents/create/route.ts
if (isFirstAgent) {
  await trackEvent({
    eventType: 'conversion.first_agent',
    userId: user.id,
    metadata: {
      agentTier: agent.generationTier,
      timeSinceSignup: Date.now() - user.createdAt.getTime()
    }
  });
}

// app/api/billing/upgrade/route.ts
await trackEvent({
  eventType: `conversion.${oldPlan}_to_${newPlan}`,
  userId: user.id,
  metadata: {
    oldPlan,
    newPlan,
    amount: subscription.amount,
    daysSinceSignup: calculateDaysSince(user.createdAt)
  }
});
```

---

## 3. API ENDPOINTS PARA ADMIN

### 3.1 GET /api/congrats-secure/analytics/landing

**Retorna KPIs de landing page**:

```typescript
{
  timeRange: '7d',
  data: {
    overview: {
      totalViews: 45230,
      uniqueVisitors: 32100,
      demoStarts: 8920,
      demoStartRate: 0.197, // 19.7%
      signups: 1820,
      signupRate: 0.040, // 4.0%
      demoToSignupRate: 0.204 // 20.4%
    },
    traffic: {
      sources: [
        { source: 'google', visits: 18500, signups: 820 },
        { source: 'facebook', visits: 12300, signups: 430 },
        { source: 'direct', visits: 8200, signups: 350 },
        { source: 'reddit', visits: 6230, signups: 220 }
      ],
      devices: [
        { device: 'mobile', percentage: 62.3 },
        { device: 'desktop', percentage: 32.1 },
        { device: 'tablet', percentage: 5.6 }
      ]
    },
    engagement: {
      avgScrollDepth: 68.5, // %
      ctaPrimaryClicks: 5820,
      ctaSecondaryClicks: 2340,
      avgTimeOnPage: 142 // segundos
    },
    demo: {
      totalStarts: 8920,
      avgMessagesPerSession: 2.3,
      completionRate: 0.67, // % que envían los 3 mensajes
      signupAfterDemo: 1820
    },
    timeSeries: [
      { date: '2026-01-05', views: 6200, signups: 248 },
      { date: '2026-01-06', views: 6450, signups: 265 },
      // ...
    ]
  }
}
```

### 3.2 GET /api/congrats-secure/analytics/app

**Retorna KPIs de la aplicación**:

```typescript
{
  timeRange: '30d',
  data: {
    engagement: {
      dau: 3420, // Daily Active Users (promedio)
      mau: 12850, // Monthly Active Users
      avgSessionDuration: 18.5, // minutos
      avgMessagesPerSession: 8.2,
      avgSessionsPerUser: 4.3
    },
    agents: {
      totalAgents: 45200,
      mostUsed: [
        { agentId: 'xxx', name: 'Luna', messageCount: 125000, percentage: 15.2 },
        { agentId: 'yyy', name: 'Marcus', messageCount: 98000, percentage: 11.9 },
        { agentId: 'zzz', name: 'Aria', messageCount: 87000, percentage: 10.6 }
        // top 10
      ],
      byTier: [
        { tier: 'free', count: 28300, percentage: 62.6 },
        { tier: 'plus', count: 12100, percentage: 26.8 },
        { tier: 'ultra', count: 4800, percentage: 10.6 }
      ]
    },
    messages: {
      totalMessages: 823000,
      avgPerUser: 64.2,
      avgLength: 87, // caracteres
      peakHours: [
        { hour: 20, count: 125000 },
        { hour: 21, count: 118000 }
      ]
    },
    bonds: {
      totalActiveBonds: 8920,
      distribution: [
        { tier: 'ROMANTIC', count: 2340, percentage: 26.2 },
        { tier: 'BEST_FRIEND', count: 1890, percentage: 21.2 },
        { tier: 'MENTOR', count: 1450, percentage: 16.2 },
        { tier: 'CONFIDANT', count: 1120, percentage: 12.6 },
        { tier: 'CREATIVE_PARTNER', count: 980, percentage: 11.0 },
        { tier: 'ADVENTURE_COMPANION', count: 720, percentage: 8.1 },
        { tier: 'ACQUAINTANCE', count: 420, percentage: 4.7 }
      ],
      avgAffinityLevel: 62.4,
      rarityDistribution: [
        { rarity: 'Mythic', count: 45, percentage: 0.5 },
        { rarity: 'Legendary', count: 230, percentage: 2.6 },
        { rarity: 'Epic', count: 890, percentage: 10.0 },
        { rarity: 'Rare', count: 2100, percentage: 23.5 },
        { rarity: 'Uncommon', count: 3200, percentage: 35.9 },
        { rarity: 'Common', count: 2455, percentage: 27.5 }
      ]
    },
    relationStages: {
      stranger: 12400,
      acquaintance: 8900,
      friend: 6200,
      close: 3100,
      intimate: 1450
    }
  }
}
```

### 3.3 GET /api/congrats-secure/analytics/conversion

**Retorna funnel de conversión**:

```typescript
{
  timeRange: '30d',
  data: {
    funnel: [
      { stage: 'landing_view', count: 45230, percentage: 100, conversionRate: 100 },
      { stage: 'demo_start', count: 8920, percentage: 19.7, conversionRate: 19.7 },
      { stage: 'signup', count: 1820, percentage: 4.0, conversionRate: 20.4 },
      { stage: 'first_agent', count: 1650, percentage: 3.6, conversionRate: 90.7 },
      { stage: 'first_message', count: 1520, percentage: 3.4, conversionRate: 92.1 },
      { stage: 'first_bond', count: 890, percentage: 2.0, conversionRate: 58.6 },
      { stage: 'paid_upgrade', count: 245, percentage: 0.5, conversionRate: 13.5 }
    ],
    monetization: {
      totalUsers: 12850,
      freeUsers: 10240,
      plusUsers: 1890,
      ultraUsers: 720,
      conversions: {
        freeToPlus: { count: 185, rate: 0.018 }, // 1.8%
        freeToUltra: { count: 42, rate: 0.004 }, // 0.4%
        plusToUltra: { count: 18, rate: 0.009 } // 0.9%
      },
      avgTimeToUpgrade: 14.5, // días
      ltv: {
        free: 0,
        plus: 89.50, // USD lifetime
        ultra: 234.80
      }
    },
    retention: {
      d1: 0.68, // 68% vuelven día 1
      d7: 0.42,
      d14: 0.31,
      d30: 0.24
    }
  }
}
```

### 3.4 GET /api/congrats-secure/analytics/users/:userId

**Retorna analytics de un usuario específico**:

```typescript
{
  userId: 'user_xxx',
  profile: {
    email: 'user@example.com',
    plan: 'plus',
    signupDate: '2025-12-15T10:30:00Z',
    daysSinceSignup: 27,
    acquisitionSource: 'google',
    acquisitionCampaign: 'winter-2025'
  },
  engagement: {
    totalSessions: 42,
    totalMessages: 328,
    avgMessagesPerSession: 7.8,
    avgSessionDuration: 22.5, // minutos
    lastActive: '2026-01-10T18:45:00Z',
    currentStreak: 5,
    longestStreak: 12
  },
  agents: {
    favoriteAgent: {
      id: 'agent_xxx',
      name: 'Luna',
      messageCount: 156,
      percentage: 47.6
    },
    allAgents: [
      { id: 'xxx', name: 'Luna', count: 156 },
      { id: 'yyy', name: 'Marcus', count: 98 },
      { id: 'zzz', name: 'Aria', count: 74 }
    ]
  },
  bonds: {
    totalBonds: 3,
    highestTier: 'ROMANTIC',
    avgAffinity: 68.5,
    bonds: [
      {
        agentId: 'xxx',
        agentName: 'Luna',
        tier: 'ROMANTIC',
        rarity: 'Epic',
        affinityLevel: 82,
        stage: 'intimate',
        daysActive: 25
      }
    ]
  },
  relations: {
    stages: {
      stranger: 0,
      acquaintance: 1,
      friend: 0,
      close: 1,
      intimate: 1
    },
    avgTrust: 0.72,
    avgAffinity: 0.68,
    avgRespect: 0.75
  },
  monetization: {
    plan: 'plus',
    lifetimeValue: 89.50,
    firstPaidDate: '2025-12-20T14:22:00Z',
    daysToPaid: 5,
    subscriptionStatus: 'active'
  },
  flags: {
    isChurnRisk: false, // inactivo >7 días
    isPowerUser: true, // top 10% engagement
    isHighValue: true, // LTV > $50
    needsAttention: false // signos de abandono
  }
}
```

---

## 4. COMPONENTES UI PARA ADMIN DASHBOARD

### 4.1 Nueva página: /congrats/analytics

**Layout con tabs**:
- Overview (KPIs principales)
- Landing Page
- App Engagement
- Conversión & Monetización
- Usuarios (tabla con búsqueda)

### 4.2 Componentes reutilizables

```typescript
// components/admin/analytics/

- MetricCard.tsx → KPI card con valor, cambio %, trend
- FunnelChart.tsx → Visualización del funnel de conversión
- TimeSeriesChart.tsx → Gráfica de series temporales (Recharts)
- DistributionPieChart.tsx → Distribución (planes, tiers, etc)
- TopAgentsTable.tsx → Tabla de agentes más usados
- UserSegmentTable.tsx → Tabla de usuarios con filtros
- HeatmapChart.tsx → Mapa de calor (horas pico)
- RetentionCohortTable.tsx → Tabla de cohortes
```

### 4.3 Página de Usuario Individual

**Ubicación**: `/congrats/users/:userId/analytics`

**Secciones**:
- Header con perfil y flags (churn risk, power user, high value)
- Timeline de actividad
- Agentes favoritos
- Bonds activos
- Relaciones (trust, affinity, respect por agente)
- Historial de plan (upgrades, downgrades)
- Eventos recientes (últimos 50)

---

## 5. BACKGROUND JOBS PARA AGREGACIÓN

### 5.1 Cron Jobs (con Vercel Cron o Bull Queue)

```typescript
// app/api/cron/aggregate-daily-kpis/route.ts
// Se ejecuta diariamente a las 00:05 UTC

export async function GET(req: Request) {
  const yesterday = subDays(new Date(), 1);

  // Calcular KPIs del día anterior
  const kpis = await calculateDailyKPIs(yesterday);

  // Guardar en DailyKPI
  await prisma.dailyKPI.create({
    data: {
      date: yesterday,
      ...kpis
    }
  });

  return Response.json({ success: true });
}

// app/api/cron/update-user-summaries/route.ts
// Se ejecuta cada hora

export async function GET(req: Request) {
  // Obtener usuarios activos en la última hora
  const activeUsers = await getRecentlyActiveUsers();

  for (const user of activeUsers) {
    await updateUserAnalyticsSummary(user.id);
  }

  return Response.json({ success: true, updated: activeUsers.length });
}
```

### 5.2 Real-time Updates

**Webhook desde API de eventos**:
- Al crear mensaje → incrementar contadores en UserAnalyticsSummary
- Al crear bond → actualizar distribución
- Al cambiar plan → registrar conversión

---

## 6. PLAN DE IMPLEMENTACIÓN POR FASES

### FASE 1: Fundamentos (Semana 1)
1. Crear migraciones Prisma (UserSession, DailyKPI, UserAnalyticsSummary)
2. Implementar `lib/analytics/track-client.ts` (cliente)
3. Mejorar API `/api/analytics/track` para manejar nuevos eventos
4. Agregar tracking básico en Landing Page (page view, CTA clicks, demo)

### FASE 2: Landing Analytics (Semana 2)
5. Implementar tracking completo de demo chat
6. Session tracking con UTM params
7. API endpoint `/api/congrats-secure/analytics/landing`
8. Página admin `/congrats/analytics` con tab "Landing Page"
9. Componentes: MetricCard, TimeSeriesChart, FunnelChart

### FASE 3: App Analytics (Semana 3)
10. Tracking de selección de agentes
11. Tracking de mensajes y bonds
12. API endpoint `/api/congrats-secure/analytics/app`
13. Tab "App Engagement" en dashboard admin
14. Componentes: TopAgentsTable, DistributionPieChart, HeatmapChart

### FASE 4: Conversión & Monetización (Semana 4)
15. Tracking de conversiones (signup, first agent, upgrades)
16. API endpoint `/api/congrats-secure/analytics/conversion`
17. Tab "Conversión & Monetización"
18. Funnel completo con tasas de conversión

### FASE 5: Analytics por Usuario (Semana 5)
19. API endpoint `/api/congrats-secure/analytics/users/:userId`
20. Página detalle de usuario `/congrats/users/:userId/analytics`
21. Flags automáticos (churn risk, power user, high value)
22. Timeline de eventos

### FASE 6: Agregación y Optimización (Semana 6)
23. Cron job para DailyKPI
24. Cron job para UserAnalyticsSummary
25. Índices de BD optimizados
26. Caching de queries frecuentes (Redis)
27. Sistema de alertas (churn spikes, conversion drops)

---

## 7. CONSIDERACIONES TÉCNICAS

### 7.1 Performance
- **Índices**: Todos los modelos tienen índices en campos de consulta frecuente
- **Agregación**: DailyKPI pre-calcula métricas para evitar queries costosas
- **Caching**: Redis para KPIs del dashboard (TTL 5 minutos)
- **Pagination**: Todas las listas de usuarios/eventos paginadas

### 7.2 Privacidad
- **GDPR**: Al eliminar usuario, cascade delete en UserSession, AnalyticsEvent
- **Anonimización**: Landing page tracking sin PII hasta signup
- **Opt-out**: Header DNT respetado

### 7.3 Escalabilidad
- **Event ingestion**: Usar cola (Bull/BullMQ) para procesar eventos async
- **Sharding**: DailyKPI por date permite fácil archivado
- **Read replicas**: Queries de analytics en read replica de BD

### 7.4 Testing
- **Unit tests**: Funciones de cálculo de KPIs
- **Integration tests**: API endpoints con datos mock
- **E2E tests**: Verificar que tracking se dispara correctamente

---

## 8. MÉTRICAS DE ÉXITO

**Objetivos del sistema de analytics**:

✅ **Visibilidad**: Admin puede ver todos los KPIs clave en <5 segundos
✅ **Accionabilidad**: Identificar problemas (churn, conversión baja) en <1 minuto
✅ **Granularidad**: Drill-down desde métricas globales hasta usuario individual
✅ **Confiabilidad**: 99.9% de eventos capturados sin pérdida
✅ **Performance**: Dashboard carga en <2 segundos con 1M+ eventos

---

## 9. EXTENSIONES FUTURAS

- **A/B Testing**: Framework para probar variantes de landing/features
- **Cohort Analysis**: Comparar cohortes por fecha de signup
- **Predictive Analytics**: ML para predecir churn y LTV
- **Real-time Dashboard**: WebSockets para updates en vivo
- **Custom Reports**: Query builder para analytics ad-hoc
- **Exportación**: CSV/PDF de reportes para stakeholders
- **Integraciones**: Amplitude, Mixpanel, Segment

---

## ANEXO: Ejemplos de Queries

### Query: Usuarios que entraron por demo pero no hicieron signup

```typescript
const demoNonConverters = await prisma.userSession.findMany({
  where: {
    events: {
      some: { eventType: 'landing.demo_start' }
    },
    convertedAt: null,
    startedAt: { gte: subDays(new Date(), 7) }
  },
  include: {
    events: {
      where: { eventType: { startsWith: 'landing.demo' } },
      orderBy: { createdAt: 'asc' }
    }
  }
});
```

### Query: Top 10 agentes por mensajes (últimos 30 días)

```typescript
const topAgents = await prisma.message.groupBy({
  by: ['agentId'],
  where: {
    createdAt: { gte: subDays(new Date(), 30) }
  },
  _count: true,
  orderBy: { _count: { agentId: 'desc' } },
  take: 10
});

const agentDetails = await prisma.agent.findMany({
  where: { id: { in: topAgents.map(a => a.agentId) } },
  select: { id: true, name: true, avatarUrl: true }
});
```

### Query: Tasa de conversión free → paid por fuente de adquisición

```typescript
const conversionBySource = await prisma.userAnalyticsSummary.groupBy({
  by: ['acquisitionSource'],
  where: {
    acquisitionSource: { not: null }
  },
  _count: true,
  _sum: {
    lifetimeValue: true
  }
});

// Post-process para calcular tasas
const results = conversionBySource.map(source => ({
  source: source.acquisitionSource,
  totalUsers: source._count,
  paidUsers: /* query adicional */,
  conversionRate: paidUsers / totalUsers,
  avgLTV: source._sum.lifetimeValue / paidUsers
}));
```

---

**FIN DEL PLAN**

Este documento define la arquitectura completa del sistema de analytics. ¿Deseas que profundice en alguna sección o ajustemos el alcance?
