# Analytics Tracking System

Sistema completo de tracking de eventos para analytics. Soporta tracking client-side y server-side con auto-captura de contexto, UTM params, device detection y manejo de sesiones.

## Archivos

- **`types.ts`**: Tipos TypeScript y enums para todos los eventos
- **`track-client.ts`**: Utilidad de tracking client-side (navegador)
- **`track-server.ts`**: Utilidad de tracking server-side (API routes)
- **`test-tracking.ts`**: Tests y guía de testing manual

## Quick Start

### 1. Client-Side Tracking (Landing Page)

```typescript
import { trackEvent, LandingEventType } from '@/lib/analytics/track-client';

// Track page view
trackEvent({
  eventType: LandingEventType.PAGE_VIEW
});

// Track CTA click
trackEvent({
  eventType: LandingEventType.CTA_PRIMARY,
  metadata: {
    ctaLocation: 'hero',
    ctaText: 'Get Started'
  }
});

// Track demo interaction
trackEvent({
  eventType: LandingEventType.DEMO_MESSAGE,
  metadata: {
    messageCount: 1,
    messageLength: 42
  }
});
```

### 2. Server-Side Tracking (API Routes)

```typescript
import { trackServerEvent, ConversionEventType } from '@/lib/analytics/track-server';

// Track signup
await trackServerEvent({
  userId: user.id,
  eventType: ConversionEventType.SIGNUP,
  metadata: {
    signupMethod: 'email',
    fromDemo: true
  }
});

// Track first message
await trackServerEvent({
  userId: user.id,
  eventType: ConversionEventType.FIRST_MESSAGE,
  metadata: {
    agentId: 'agent_123',
    timeToFirstMessage: 120 // seconds
  }
});

// Track plan upgrade
await trackPlanUpgrade(user.id, {
  oldPlan: 'free',
  newPlan: 'plus',
  amount: 9.99,
  daysSinceSignup: 5
});
```

## Features

### Auto-Captured Data (Client-Side)

El sistema automáticamente captura:

- **Session ID**: Persiste por 30 minutos de inactividad
- **UTM Parameters**: Se capturan de la URL y persisten toda la sesión
- **Device Info**: Tipo (mobile/desktop/tablet), navegador, OS
- **Browser Context**: URL, referrer, userAgent
- **Timestamp**: ISO string del momento del evento

### Session Management

```typescript
import { getOrCreateSessionId, getCurrentSession } from '@/lib/analytics/track-client';

// Obtener o crear sesión
const sessionId = getOrCreateSessionId();
// Returns: "sess_1641234567890_abc123def456"

// Obtener info de sesión actual
const session = getCurrentSession();
// Returns: {
//   sessionId: "sess_...",
//   startedAt: "2026-01-11T10:00:00.000Z",
//   lastActivityAt: "2026-01-11T10:15:00.000Z",
//   utm: { utm_source: "google", utm_medium: "cpc", ... }
// }
```

### UTM Tracking

Los parámetros UTM se capturan automáticamente de la URL y se persisten en localStorage:

```typescript
import { getUTMParams, clearUTMParams } from '@/lib/analytics/track-client';

// URL: /?utm_source=google&utm_medium=cpc&utm_campaign=winter2025

const utms = getUTMParams();
// Returns: {
//   utm_source: "google",
//   utm_medium: "cpc",
//   utm_campaign: "winter2025"
// }

// Limpiar UTMs (útil para testing)
clearUTMParams();
```

### Device Detection

```typescript
import {
  detectDeviceType,
  detectBrowser,
  detectOS,
  getDeviceInfo
} from '@/lib/analytics/track-client';

// Detectar tipo de dispositivo
const deviceType = detectDeviceType();
// Returns: "mobile" | "desktop" | "tablet"

// Detectar navegador
const browser = detectBrowser();
// Returns: "chrome" | "firefox" | "safari" | "edge" | "opera" | "other"

// Detectar OS
const os = detectOS();
// Returns: "windows" | "macos" | "ios" | "android" | "linux" | "other"

// Obtener todo junto
const deviceInfo = getDeviceInfo();
// Returns: {
//   deviceType: "desktop",
//   browser: "chrome",
//   os: "macos",
//   userAgent: "Mozilla/5.0..."
// }
```

## Event Types

### Landing Events (Pre-signup, no requieren autenticación)

```typescript
enum LandingEventType {
  PAGE_VIEW = "landing.page_view",
  SCROLL_DEPTH = "landing.scroll_depth",
  CTA_PRIMARY = "landing.cta_primary",
  CTA_SECONDARY = "landing.cta_secondary",
  DEMO_START = "landing.demo_start",
  DEMO_MESSAGE = "landing.demo_message",
  DEMO_LIMIT_REACHED = "landing.demo_limit_reached",
  DEMO_SIGNUP = "landing.demo_signup",
  FEATURE_CLICK = "landing.feature_click",
  PLAN_VIEW = "landing.plan_view",
  PLAN_SELECT = "landing.plan_select",
}
```

### App Events (Post-signup, requieren autenticación)

```typescript
enum AppEventType {
  AGENT_SELECT = "app.agent_select",
  AGENT_CREATE = "app.agent_create",
  MESSAGE_SEND = "app.message_send",
  MESSAGE_RECEIVE = "app.message_receive",
  BOND_PROGRESS = "app.bond_progress",
  BOND_TIER_UNLOCK = "app.bond_tier_unlock",
  PAGE_VIEW = "app.page_view",
  FEATURE_DISCOVERED = "app.feature_discovered",
  SESSION_START = "app.session_start",
  SESSION_END = "app.session_end",
}
```

### Conversion Events (Funnel crítico, requieren autenticación)

```typescript
enum ConversionEventType {
  SIGNUP = "conversion.signup",
  FIRST_AGENT = "conversion.first_agent",
  FIRST_MESSAGE = "conversion.first_message",
  FREE_TO_PLUS = "conversion.free_to_plus",
  FREE_TO_ULTRA = "conversion.free_to_ultra",
  PLUS_TO_ULTRA = "conversion.plus_to_ultra",
  UPGRADE_MODAL_VIEW = "conversion.upgrade_modal_view",
  UPGRADE_MODAL_CLICK = "conversion.upgrade_modal_click",
  LIMIT_REACHED = "conversion.limit_reached",
}
```

## Advanced Usage

### Scroll Depth Tracking

```typescript
import { createScrollDepthTracker } from '@/lib/analytics/track-client';

// En un componente React
useEffect(() => {
  const tracker = createScrollDepthTracker((depth) => {
    console.log(`User scrolled to ${depth}%`);
  });

  return () => tracker.cleanup();
}, []);
```

### Batch Events

```typescript
import { trackEventsBatch } from '@/lib/analytics/track-client';

trackEventsBatch([
  { eventType: LandingEventType.PAGE_VIEW },
  { eventType: LandingEventType.DEMO_START, metadata: { ... } }
]);
```

### Server-Side Convenience Functions

```typescript
import {
  trackSignup,
  trackFirstAgent,
  trackFirstMessage,
  trackPlanUpgrade,
  trackLimitReached
} from '@/lib/analytics/track-server';

// En API route de signup
await trackSignup(user.id, {
  signupMethod: 'google',
  referralSource: 'facebook_ads',
  fromDemo: true
});

// En API route de create agent
await trackFirstAgent(user.id, {
  agentId: agent.id,
  agentTier: 'premium',
  timeSinceSignup: 300 // seconds
});

// En API route de upgrade
await trackPlanUpgrade(user.id, {
  oldPlan: 'free',
  newPlan: 'plus',
  amount: 9.99,
  daysSinceSignup: 5,
  triggerType: 'bond_limit'
});
```

### Query User Events

```typescript
import { getUserEvents, getUserConversionMetrics } from '@/lib/analytics/track-server';

// Obtener eventos de un usuario
const events = await getUserEvents(userId, {
  eventTypes: [ConversionEventType.SIGNUP, ConversionEventType.FIRST_MESSAGE],
  startDate: new Date('2026-01-01'),
  limit: 50
});

// Obtener métricas de conversión
const metrics = await getUserConversionMetrics(userId);
// Returns: {
//   signupAt: Date,
//   firstAgentAt: Date,
//   firstMessageAt: Date,
//   timeToFirstAgent: 120, // seconds
//   timeToFirstMessage: 300,
//   upgrades: [...]
// }
```

## Error Handling

El sistema de tracking está diseñado para **nunca romper la UX**:

- Todos los errores son silenciosos (console.warn)
- No se lanzan excepciones
- Si falla el tracking, el flujo principal continúa
- Fire-and-forget en client-side (no bloquea UI)

```typescript
// Esto nunca lanzará un error, incluso si el API endpoint está caído
trackEvent({
  eventType: LandingEventType.PAGE_VIEW
});
```

## Testing

### Browser Console Testing

```typescript
import { getAnalyticsDebugInfo, clearAnalyticsData } from '@/lib/analytics/track-client';

// Ver estado actual
const debug = getAnalyticsDebugInfo();
console.log(debug);

// Limpiar datos (útil para testing)
clearAnalyticsData();
```

### Manual Testing Guide

Ver `test-tracking.ts` para una guía completa de testing manual.

### Automated Tests

```bash
# En browser console
import { runBrowserTests } from '@/lib/analytics/test-tracking';
runBrowserTests();
```

## API Endpoint

**POST** `/api/analytics/track`

### Request

```json
{
  "eventType": "landing.page_view",
  "metadata": {
    "sessionId": "sess_1641234567890_abc123",
    "url": "https://app.com/",
    "referrer": "https://google.com",
    "deviceType": "desktop",
    "browser": "chrome",
    "os": "macos",
    "utmSource": "google",
    "utmMedium": "cpc",
    "utmCampaign": "winter2025",
    "timestamp": "2026-01-11T10:00:00.000Z"
  }
}
```

### Response

```json
{
  "success": true,
  "message": "Event tracked successfully"
}
```

### Authentication

- **Landing events** (`landing.*`): No requieren autenticación
- **App events** (`app.*`): Requieren autenticación
- **Conversion events** (`conversion.*`): Requieren autenticación

## Best Practices

### 1. Use Type-Safe Enums

```typescript
// Good
import { LandingEventType } from '@/lib/analytics/track-client';
trackEvent({ eventType: LandingEventType.PAGE_VIEW });

// Bad
trackEvent({ eventType: 'landing.page_view' }); // No type safety
```

### 2. Include Relevant Metadata

```typescript
// Good - contexto útil
trackEvent({
  eventType: LandingEventType.CTA_PRIMARY,
  metadata: {
    ctaLocation: 'hero',
    ctaText: 'Get Started',
    scrollDepth: 25
  }
});

// Bad - metadata vacía
trackEvent({ eventType: LandingEventType.CTA_PRIMARY });
```

### 3. Track at the Right Time

```typescript
// Good - track después de que ocurra la acción
async function handleSignup(data) {
  const user = await createUser(data);
  await trackSignup(user.id, { ... }); // Track después
  return user;
}

// Bad - track antes de que ocurra
async function handleSignup(data) {
  await trackSignup(data.email, { ... }); // ¿Y si falla createUser?
  const user = await createUser(data);
  return user;
}
```

### 4. Don't Block UI

```typescript
// Good - fire-and-forget
trackEvent({ eventType: LandingEventType.PAGE_VIEW });
// UI continúa inmediatamente

// Bad - esperar respuesta
await trackEvent({ eventType: LandingEventType.PAGE_VIEW });
// UI bloqueada hasta que responda el servidor
```

### 5. Clean Data for Testing

```typescript
// En tests, limpiar datos antes de cada test
beforeEach(() => {
  clearAnalyticsData();
});
```

## Integration Examples

### Landing Page Component

```typescript
'use client';

import { useEffect } from 'react';
import { trackEvent, LandingEventType, createScrollDepthTracker } from '@/lib/analytics/track-client';

export function LandingPage() {
  useEffect(() => {
    // Track page view
    trackEvent({ eventType: LandingEventType.PAGE_VIEW });

    // Setup scroll tracking
    const tracker = createScrollDepthTracker();
    return () => tracker.cleanup();
  }, []);

  const handleCTAClick = () => {
    trackEvent({
      eventType: LandingEventType.CTA_PRIMARY,
      metadata: { ctaLocation: 'hero', ctaText: 'Get Started' }
    });
  };

  return (
    <div>
      <button onClick={handleCTAClick}>Get Started</button>
    </div>
  );
}
```

### Signup API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { trackSignup } from '@/lib/analytics/track-server';

export async function POST(req: NextRequest) {
  const data = await req.json();

  // Create user
  const user = await createUser(data);

  // Track signup (no await - fire and forget)
  trackSignup(user.id, {
    signupMethod: data.provider || 'email',
    fromDemo: data.fromDemo || false
  });

  return NextResponse.json({ user });
}
```

## Troubleshooting

### Events Not Showing Up

1. Check browser console for errors
2. Verify API endpoint is accessible: `POST /api/analytics/track`
3. Check Network tab for failed requests
4. Run `getAnalyticsDebugInfo()` to see current state

### Session Not Persisting

1. Check if localStorage is enabled
2. Verify 30-minute timeout hasn't passed
3. Clear data and try again: `clearAnalyticsData()`

### UTM Params Not Captured

1. Verify URL has UTM params: `?utm_source=test&utm_medium=email`
2. Run `getUTMParams()` to see what's stored
3. Check localStorage key: `analytics_utm`

### Device Detection Wrong

Device detection is based on userAgent and viewport:
- Open DevTools device toolbar to test mobile
- Check `getDeviceInfo()` to see detected values

## Performance

- **Client-side**: Fire-and-forget, no blocking
- **Server-side**: Async, no blocking
- **localStorage**: < 1KB data stored
- **Network**: 1 POST request per event (~500 bytes)

## Security

- Landing events: Anónimos, no PII requerido
- App events: Requieren autenticación
- UTM params: Sanitizados automáticamente
- SQL injection: Protegido por Prisma
- XSS: Metadata sanitizada antes de guardar

## Next Steps

1. Implement dashboard to visualize events
2. Create cron jobs for daily KPI aggregation
3. Add Redis caching for analytics queries
4. Implement conversion funnel visualization

## Support

Para más información ver:
- `ANALYTICS-IMPLEMENTATION-SUMMARY.md` - Plan completo
- `test-tracking.ts` - Guía de testing
- `types.ts` - Todos los tipos y enums disponibles
