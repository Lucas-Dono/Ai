# Sistema de Analytics - Resumen Ejecutivo de Implementación

## Decisiones Clave

### Estrategia
- **Implementación**: Todo de una vez (~6 semanas)
- **Prioridad**: Funnel completo Landing → Signup → Conversión Free→Paid
- **Visualización**: Componentes custom con Recharts
- **Tracking**: Client-side para máxima granularidad

---

## Alcance del Proyecto

### 1. MODELOS DE BASE DE DATOS (Prisma)

#### UserSession
Tracking de sesiones desde landing hasta conversión:
```prisma
- sessionId: Identificador único de sesión
- utmSource/Medium/Campaign: Attribution marketing
- deviceType, browser, os: Context técnico
- startedAt, convertedAt: Timestamps clave
- Relación con User y AnalyticsEvent[]
```

#### DailyKPI
Métricas agregadas diarias (performance optimizado):
```prisma
- Landing: views, demoStarts, ctaClicks, signups
- Conversión: signupRate, demoConversionRate, activationRate
- Engagement: DAU, totalMessages, avgMessagesPerUser
- Monetización: freeToPlus, freeToPlusRate, freeToUltra, plusToUltra
- Retención: d1/d7/d30 retention
- Bonds: distribución por tier (ROMANTIC, BEST_FRIEND, etc)
```

#### UserAnalyticsSummary
Snapshot por usuario (para queries rápidas):
```prisma
- acquisitionSource/Medium/Campaign: De dónde vino
- totalMessages, totalSessions, avgSessionDuration
- favoriteAgentId, favoriteAgentMessages
- totalBonds, highestBondTier, avgBondAffinity
- plan, lifetimeValue, firstPaidAt
- relationStages: stranger→acquaintance→friend→close→intimate
- Actualizado via cron job cada hora
```

---

### 2. TRACKING DE EVENTOS

#### Landing Page (Client-side)
**Componentes a instrumentar:**

```typescript
// HeroSection.tsx
- landing.page_view → Al cargar
- landing.cta_primary → Click "Ir al Dashboard"
- landing.cta_secondary → Click "Ver Demo" / "Más Info"

// LandingDemoChat.tsx
- landing.demo_start → Primer mensaje enviado
- landing.demo_message → Cada mensaje (metadata: messageCount, length)
- landing.demo_limit_reached → Al llegar a 3 mensajes
- landing.demo_signup → Click "Signup" desde demo

// FeaturesGrid.tsx
- landing.feature_click → Click en cada feature
- landing.scroll_depth → 25%, 50%, 75%, 100%

// ComparisonTable.tsx
- landing.plan_view → Visualiza tabla de planes
- landing.plan_select → Click en plan específico
```

**Utility client-side:**
```typescript
// lib/analytics/track-client.ts
export async function trackEvent({
  eventType: string,
  metadata?: Record<string, any>,
  sessionId?: string
})

// Auto-captura:
- sessionId (cookie o fingerprint)
- url, referrer, userAgent
- timestamp
- UTM params (localStorage persist)
```

#### App (Client-side + Server-side)

**Client-side (interacciones UI):**
```typescript
// components/AgentSelector.tsx
- app.agent_select → Selecciona agente (metadata: agentId, tier)

// components/chat/MessageInput.tsx
- app.message_send → Envía mensaje (metadata: agentId, length, conversationLength)

// components/bonds/BondProgress.tsx
- app.bond_progress → Avance de bond (metadata: agentId, oldAffinity, newAffinity)
```

**Server-side (API routes):**
```typescript
// app/api/auth/signup
- conversion.signup → metadata: signupMethod, referralSource, fromDemo

// app/api/agents/create
- conversion.first_agent → metadata: agentTier, timeSinceSignup

// app/api/messages/send (primer mensaje)
- conversion.first_message → metadata: agentId, timeToFirstMessage

// app/api/billing/upgrade
- conversion.free_to_plus, conversion.free_to_ultra, conversion.plus_to_ultra
- metadata: oldPlan, newPlan, amount, daysSinceSignup
```

---

### 3. API ENDPOINTS ADMIN

#### GET /api/congrats-secure/analytics/funnel
**Retorna el funnel completo de conversión:**

```typescript
{
  timeRange: '30d',
  funnel: [
    { stage: 'landing_view', count: 45230, rate: 100% },
    { stage: 'demo_start', count: 8920, rate: 19.7% },
    { stage: 'demo_complete', count: 5980, rate: 13.2% }, // enviaron 3 msg
    { stage: 'signup', count: 1820, rate: 4.0% },
    { stage: 'first_agent', count: 1650, rate: 3.6% },
    { stage: 'first_message', count: 1520, rate: 3.4% },
    { stage: 'paid_upgrade', count: 245, rate: 0.5% }
  ],
  dropoff: [
    { from: 'landing_view', to: 'demo_start', loss: 36310, rate: 80.3% },
    { from: 'demo_start', to: 'signup', loss: 7100, rate: 79.6% },
    { from: 'signup', to: 'paid_upgrade', loss: 1575, rate: 86.5% }
  ],
  timeSeries: [
    { date: '2026-01-05', signups: 58, conversions: 8 },
    // ...
  ]
}
```

#### GET /api/congrats-secure/analytics/landing
**Landing page específico:**

```typescript
{
  overview: {
    totalViews: 45230,
    uniqueVisitors: 32100,
    avgTimeOnPage: 142, // segundos
    bounceRate: 0.58
  },
  demo: {
    starts: 8920,
    startRate: 0.197,
    avgMessages: 2.3,
    completionRate: 0.67, // llegaron a 3 mensajes
    signupAfterDemo: 1820,
    conversionRate: 0.204 // 20.4% de demos → signup
  },
  traffic: {
    sources: [
      { source: 'google', visits: 18500, signups: 820, conversionRate: 0.044 },
      { source: 'facebook', visits: 12300, signups: 430, conversionRate: 0.035 },
      { source: 'direct', visits: 8200, signups: 350, conversionRate: 0.043 },
      { source: 'reddit', visits: 6230, signups: 220, conversionRate: 0.035 }
    ],
    campaigns: [
      { campaign: 'winter-2025', visits: 8900, signups: 420, roas: 2.8 },
      // ...
    ]
  },
  ctas: {
    primary: { clicks: 5820, rate: 0.129 }, // 12.9% CTR
    secondary: { clicks: 2340, rate: 0.052 }
  },
  devices: [
    { type: 'mobile', percentage: 62.3, signupRate: 0.035 },
    { type: 'desktop', percentage: 32.1, signupRate: 0.052 },
    { type: 'tablet', percentage: 5.6, signupRate: 0.028 }
  ]
}
```

#### GET /api/congrats-secure/analytics/conversion
**Monetización y planes:**

```typescript
{
  overview: {
    totalUsers: 12850,
    freeUsers: 10240 (79.7%),
    plusUsers: 1890 (14.7%),
    ultraUsers: 720 (5.6%)
  },
  conversions: {
    freeToPlus: {
      count: 185,
      rate: 0.018, // 1.8%
      avgTimeToConvert: 14.5 // días
    },
    freeToUltra: {
      count: 42,
      rate: 0.004,
      avgTimeToConvert: 8.2
    },
    plusToUltra: {
      count: 18,
      rate: 0.009,
      avgTimeToConvert: 22.1
    }
  },
  revenue: {
    mrr: 28450, // Monthly Recurring Revenue (USD)
    arr: 341400, // Annual Recurring Revenue
    avgLTV: {
      free: 0,
      plus: 89.50,
      ultra: 234.80
    },
    churnRate: 0.042 // 4.2% monthly churn
  },
  triggers: [
    { trigger: 'bond_limit_reached', conversions: 85, rate: 0.32 },
    { trigger: 'generation_tier_limit', conversions: 62, rate: 0.28 },
    { trigger: 'feature_discovery', conversions: 38, rate: 0.18 }
  ],
  timeSeries: [
    { date: '2026-01', freeToPlus: 18, freeToUltra: 4, mrr: 28450 },
    // ...
  ]
}
```

#### GET /api/congrats-secure/analytics/users/:userId
**Vista individual de usuario:**

```typescript
{
  profile: {
    userId: 'user_xxx',
    email: 'user@example.com',
    plan: 'plus',
    signupDate: '2025-12-15',
    daysSinceSignup: 27,
    acquisition: {
      source: 'google',
      medium: 'cpc',
      campaign: 'winter-2025',
      referrer: 'https://google.com'
    }
  },
  journey: {
    landingToSignup: 5, // minutos
    signupToFirstAgent: 2, // minutos
    signupToFirstMessage: 8,
    signupToFirstPaid: 5 // días
  },
  engagement: {
    totalSessions: 42,
    totalMessages: 328,
    avgMessagesPerSession: 7.8,
    currentStreak: 5,
    longestStreak: 12,
    lastActive: '2026-01-10T18:45:00Z'
  },
  agents: {
    total: 3,
    favorite: { id: 'xxx', name: 'Luna', messages: 156, percentage: 47.6 },
    all: [
      { id: 'xxx', name: 'Luna', tier: 'plus', messages: 156 },
      { id: 'yyy', name: 'Marcus', tier: 'free', messages: 98 }
    ]
  },
  bonds: {
    total: 2,
    highest: 'ROMANTIC',
    avgAffinity: 68.5,
    details: [
      {
        agentId: 'xxx',
        tier: 'ROMANTIC',
        rarity: 'Epic',
        affinity: 82,
        stage: 'intimate'
      }
    ]
  },
  monetization: {
    plan: 'plus',
    ltv: 89.50,
    firstPaidDate: '2025-12-20',
    subscriptionStatus: 'active',
    totalSpent: 89.50
  },
  flags: {
    isChurnRisk: false,
    isPowerUser: true, // top 10%
    isHighValue: true, // LTV > $50
    suspiciousActivity: false
  },
  timeline: [
    { date: '2026-01-10', event: 'message_sent', count: 12 },
    { date: '2026-01-09', event: 'bond_progress', metadata: {...} }
    // últimos 30 eventos
  ]
}
```

---

### 4. COMPONENTES UI (Recharts)

#### /congrats/analytics → Dashboard principal

**Layout:**
```
┌─────────────────────────────────────────┐
│ Tab Navigation                          │
│ [ Funnel ] [ Landing ] [ Conversión ]   │
├─────────────────────────────────────────┤
│                                         │
│  Tab Content (renderizado dinámico)    │
│                                         │
└─────────────────────────────────────────┘
```

**Tab 1: Funnel (Vista principal)**

```tsx
// Componentes:
<FunnelChart data={funnelData} />
  → Gráfica de embudo vertical con % drop-off
  → Tooltips con números absolutos
  → Color coding: verde (bueno) → rojo (crítico)

<MetricsGrid>
  <MetricCard
    title="Tasa de Conversión Total"
    value="0.5%"
    change="+0.08%"
    trend="up"
  />
  <MetricCard title="Landing → Demo" ... />
  <MetricCard title="Demo → Signup" ... />
  <MetricCard title="Signup → Paid" ... />
</MetricsGrid>

<TimeSeriesChart
  title="Conversiones Diarias"
  data={timeSeries}
  lines={['signups', 'conversions']}
/>
```

**Tab 2: Landing Page**

```tsx
<StatGrid>
  <StatCard title="Total Visitas" value="45.2K" />
  <StatCard title="Demo Starts" value="8.9K" />
  <StatCard title="Signups" value="1.8K" />
</StatGrid>

<TrafficSourcesTable
  data={trafficSources}
  columns={['source', 'visits', 'signups', 'rate']}
  sortable
/>

<PieChart
  title="Distribución por Dispositivo"
  data={devices}
/>

<HeatmapChart
  title="Horas Pico de Actividad"
  data={hourlyActivity}
/>
```

**Tab 3: Conversión & Monetización**

```tsx
<PlanDistributionChart
  data={planDistribution}
  type="bar"
/>

<ConversionRatesTable
  data={conversionRates}
  highlight="best" // Resalta mejor performing
/>

<LineChart
  title="MRR Trend"
  data={mrrTimeSeries}
  formatValue="currency"
/>

<TopConversionTriggers
  data={triggers}
  maxItems={5}
/>
```

#### /congrats/users → Tabla de usuarios

```tsx
<UserTable
  columns={[
    'email',
    'plan',
    'signupDate',
    'messages',
    'ltv',
    'lastActive',
    'flags'
  ]}
  filters={[
    'plan',
    'acquisitionSource',
    'churnRisk',
    'powerUser'
  ]}
  searchable
  sortable
  pagination
  onRowClick={(user) => navigate(`/congrats/users/${user.id}/analytics`)}
/>
```

#### /congrats/users/:userId/analytics → Detalle individual

```tsx
<UserHeader user={user} flags={flags} />

<TabsContainer>
  <Tab name="Overview">
    <JourneyTimeline journey={journey} />
    <EngagementMetrics engagement={engagement} />
    <AgentsGrid agents={agents} />
    <BondsList bonds={bonds} />
  </Tab>

  <Tab name="Timeline">
    <EventTimeline events={timelineEvents} />
  </Tab>

  <Tab name="Monetization">
    <MonetizationDetails monetization={monetization} />
    <PaymentHistory payments={payments} />
  </Tab>
</TabsContainer>
```

---

### 5. BACKGROUND JOBS

#### Cron: Agregación Diaria (00:05 UTC)
```typescript
// app/api/cron/aggregate-daily-kpis/route.ts

export async function GET() {
  const yesterday = subDays(new Date(), 1);

  const kpis = await calculateDailyKPIs(yesterday);

  await prisma.dailyKPI.upsert({
    where: { date: yesterday },
    create: { date: yesterday, ...kpis },
    update: kpis
  });

  return Response.json({ success: true, date: yesterday });
}

// Funciones:
- calculateLandingKPIs(date)
- calculateConversionKPIs(date)
- calculateEngagementKPIs(date)
- calculateMonetizationKPIs(date)
- calculateBondKPIs(date)
```

#### Cron: User Summaries (cada hora)
```typescript
// app/api/cron/update-user-summaries/route.ts

export async function GET() {
  // Usuarios activos en última hora
  const activeUsers = await getRecentlyActiveUsers();

  for (const user of activeUsers) {
    await updateUserAnalyticsSummary(user.id);
  }

  return Response.json({ updated: activeUsers.length });
}

// updateUserAnalyticsSummary(userId):
- Recalcular totalMessages, totalSessions
- Actualizar favoriteAgent
- Calcular avgMessagesPerSession
- Actualizar lastActiveAt
- Recalcular bonds y relation stages
```

---

### 6. IMPLEMENTACIÓN TÉCNICA

#### Arquitectura de Archivos

```
prisma/
  schema.prisma → Agregar UserSession, DailyKPI, UserAnalyticsSummary
  migrations/
    XXXXXX_add_analytics_models/

lib/
  analytics/
    track-client.ts → Client-side tracking utility
    track-server.ts → Server-side helper
    kpi-calculator.ts → Funciones de cálculo de KPIs
    queries.ts → Queries reutilizables
    types.ts → TypeScript types

app/
  api/
    analytics/
      track/route.ts → POST endpoint para eventos
    congrats-secure/
      analytics/
        funnel/route.ts → GET funnel data
        landing/route.ts → GET landing data
        conversion/route.ts → GET conversion data
        users/[userId]/route.ts → GET user data
    cron/
      aggregate-daily-kpis/route.ts
      update-user-summaries/route.ts

  congrats/
    analytics/
      page.tsx → Dashboard principal
      components/
        FunnelChart.tsx
        MetricCard.tsx
        TimeSeriesChart.tsx
        TrafficSourcesTable.tsx
        etc.
    users/
      page.tsx → Tabla de usuarios
      [userId]/
        analytics/
          page.tsx → Detalle usuario

components/
  admin/
    analytics/
      (componentes compartidos)

hooks/
  useAnalytics.ts → Custom hook para fetch data
```

#### Stack Tecnológico

```json
{
  "database": "Prisma + PostgreSQL",
  "charts": "Recharts",
  "client_tracking": "Custom (fetch API)",
  "cron": "Vercel Cron (vercel.json) o API routes manuales",
  "caching": "Redis (Upstash) para KPIs dashboard",
  "types": "TypeScript strict mode"
}
```

#### Performance Optimizations

1. **Índices de BD**:
   - `UserSession`: sessionId, userId, startedAt, convertedAt
   - `DailyKPI`: date
   - `UserAnalyticsSummary`: userId, lastActiveAt, plan
   - `AnalyticsEvent`: userId, eventType, createdAt

2. **Caching**:
   - Dashboard KPIs: 5 minutos (Redis)
   - User summaries: 1 hora
   - DailyKPIs: 24 horas (inmutable después de calcular)

3. **Pagination**:
   - User table: 50 per page
   - Events timeline: 30 eventos iniciales, load more

4. **Agregación**:
   - DailyKPI pre-calcula todo
   - UserAnalyticsSummary evita queries pesadas on-demand
   - Use raw SQL para queries complejas cuando sea necesario

---

### 7. CRONOGRAMA DE IMPLEMENTACIÓN

#### Semana 1-2: Fundamentos
- [x] Crear modelos Prisma (UserSession, DailyKPI, UserAnalyticsSummary)
- [x] Migración de BD
- [x] Implementar `track-client.ts` y `track-server.ts`
- [x] API endpoint `/api/analytics/track`
- [x] Tracking básico en Landing Page (page_view, cta_click)

#### Semana 3: Landing Analytics
- [x] Tracking completo demo chat
- [x] Session tracking con UTM params
- [x] API `/api/congrats-secure/analytics/landing`
- [x] Componentes UI: TrafficSourcesTable, DeviceDistribution
- [x] Tab "Landing" en dashboard

#### Semana 4: Conversion Funnel
- [x] Tracking signup, first_agent, first_message
- [x] Tracking conversiones free→plus→ultra
- [x] API `/api/congrats-secure/analytics/funnel`
- [x] API `/api/congrats-secure/analytics/conversion`
- [x] Componentes: FunnelChart, ConversionRatesTable
- [x] Tabs "Funnel" y "Conversión"

#### Semana 5: User Analytics
- [x] API `/api/congrats-secure/analytics/users/:userId`
- [x] Página `/congrats/users` con tabla filtrable
- [x] Página `/congrats/users/:userId/analytics`
- [x] Componentes: UserTable, UserHeader, JourneyTimeline
- [x] Flags automáticos (churn risk, power user)

#### Semana 6: Jobs & Optimización
- [x] Cron jobs (DailyKPI agregation, UserSummary updates)
- [x] Configurar Vercel Cron (vercel.json)
- [x] Redis caching para dashboard
- [x] Optimizar queries con índices
- [x] Testing E2E del tracking
- [x] Documentation

---

### 8. MÉTRICAS DE ÉXITO DEL PROYECTO

Al finalizar, debes poder responder estas preguntas en <30 segundos:

✅ ¿Cuántas personas visitaron la landing hoy?
✅ ¿Qué % de visitantes prueban el demo chat?
✅ ¿Qué % del demo convierten a signup?
✅ ¿Cuál es la fuente de tráfico con mejor ROI?
✅ ¿Cuántos signups hubo hoy y cuál es la tasa?
✅ ¿Qué % de nuevos usuarios envían su primer mensaje?
✅ ¿Cuántos usuarios free convirtieron a paid esta semana?
✅ ¿Cuál es el MRR actual y su tendencia?
✅ ¿Qué trigger de conversión es más efectivo?
✅ ¿Quiénes son los usuarios en riesgo de churn?
✅ ¿Qué usuario específico X ha hecho desde que se registró?

---

## PRÓXIMO PASO

Salir de plan mode y comenzar implementación empezando por:

1. **Migración Prisma**: Crear los 3 modelos nuevos
2. **Track Client**: Implementar utility de tracking
3. **Landing Page**: Instrumentar HeroSection y LandingDemoChat

¿Listo para comenzar?
