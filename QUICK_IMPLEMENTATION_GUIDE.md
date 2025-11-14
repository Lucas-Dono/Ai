# 🚀 Guía Rápida de Implementación
## Circuit Prompt AI - Roadmap Ejecutable

**Duración Total:** 14 semanas
**Inversión:** $23.5K
**ROI Proyectado:** 9.2x en 12 meses

---

## 📋 FASE 0: PRE-LAUNCH (Semanas 1-2)
### Objetivo: Safety Compliance antes de lanzar

### Día 1-2: Age Verification

```bash
# 1. Schema
npx prisma migrate dev --name add_age_verification
```

```prisma
// prisma/schema.prisma - Agregar a User model
model User {
  birthDate      DateTime?
  ageVerified    Boolean   @default(false)
  isAdult        Boolean   @default(false)
}
```

```typescript
// components/onboarding/AgeGate.tsx (simplificado)
export function AgeGate({ onVerified }: { onVerified: () => void }) {
  const [birthDate, setBirthDate] = useState("");

  const handleVerify = async () => {
    const age = calculateAge(birthDate);
    if (age < 13) {
      return alert("Debes tener al menos 13 años");
    }

    await fetch("/api/user/age-verification", {
      method: "POST",
      body: JSON.stringify({ birthDate, isAdult: age >= 18 })
    });

    onVerified();
  };

  return <form onSubmit={handleVerify}>...</form>;
}
```

```typescript
// app/api/user/age-verification/route.ts
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  const { birthDate, isAdult } = await req.json();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { birthDate, ageVerified: true, isAdult }
  });

  return NextResponse.json({ success: true });
}
```

---

### Día 3-4: NSFW Consent Flow

```typescript
// components/onboarding/NSFWConsent.tsx
export function NSFWConsentFlow({ onComplete }) {
  const [checks, setChecks] = useState({
    over18: false,
    fiction: false,
    consent: false
  });

  const allChecked = Object.values(checks).every(Boolean);

  return (
    <Card>
      <h2>Contenido para Adultos</h2>
      <Checkbox onChange={(e) => setChecks({...checks, over18: e.target.checked})}>
        Confirmo que tengo 18+ años
      </Checkbox>
      <Checkbox onChange={(e) => setChecks({...checks, fiction: e.target.checked})}>
        Entiendo que es contenido ficticio
      </Checkbox>
      <Checkbox onChange={(e) => setChecks({...checks, consent: e.target.checked})}>
        Acepto los términos de uso
      </Checkbox>
      <Button disabled={!allChecked} onClick={onComplete}>
        Continuar
      </Button>
    </Card>
  );
}
```

---

### Día 5: Output Moderation

```typescript
// lib/safety/output-moderator.ts
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function moderateOutput(text: string, userAge: number) {
  const result = await openai.moderations.create({
    input: text,
    model: "text-moderation-latest"
  });

  const flagged = result.results[0];

  // SIEMPRE bloquear
  if (flagged.categories["sexual/minors"] ||
      flagged.categories["violence/graphic"]) {
    return { allowed: false, reason: "prohibited_content" };
  }

  // Bloquear para menores
  if (userAge < 18 && flagged.categories["sexual"]) {
    return { allowed: false, reason: "age_restricted" };
  }

  return { allowed: true };
}
```

```typescript
// Integrar en app/api/agents/[id]/message/route.ts
const moderation = await moderateOutput(response.text, user.birthDate);

if (!moderation.allowed) {
  return NextResponse.json({
    error: "Content blocked by safety filters",
    reason: moderation.reason
  }, { status: 451 });
}
```

---

### Día 6-7: PII Detection

```typescript
// lib/safety/pii-detector.ts
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone_ar: /\b(?:\+54\s?)?(?:11|[2-9]\d{1,2})\s?\d{4}[-\s]?\d{4}\b/g,
  dni: /\b\d{7,8}\b/g,
  address: /\b\d{1,5}\s[\w\s]{5,40}(?:calle|avenida|av\.|street|st\.)\b/gi
};

export function detectAndRedactPII(text: string) {
  let redacted = text;
  const matches = [];

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    const found = text.match(pattern);
    if (found) {
      matches.push({ type, values: found });
      redacted = redacted.replace(pattern, `[${type.toUpperCase()}_REDACTED]`);
    }
  }

  return { redacted, matches };
}
```

---

### Día 8: Content Policy Page

```bash
mkdir -p app/legal/politica-contenido
touch app/legal/politica-contenido/page.tsx
```

```typescript
// app/legal/politica-contenido/page.tsx
export default function ContentPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1>Política de Contenido</h1>

      <section>
        <h2>✅ Permitido</h2>
        <ul>
          <li>Conversaciones adultas consensuales (18+)</li>
          <li>Roleplay ficticio</li>
          <li>Contenido creativo</li>
        </ul>
      </section>

      <section>
        <h2>🚫 Prohibido</h2>
        <ul>
          <li>Contenido con menores (CSAM)</li>
          <li>Violencia gráfica real</li>
          <li>Intercambio de datos personales</li>
        </ul>
      </section>

      <section>
        <h2>⚖️ Enforcement</h2>
        <p>Sistema automatizado + revisión humana para reportes.</p>
      </section>
    </div>
  );
}
```

---

### Día 9-10: Testing

```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// __tests__/safety-flow.spec.ts
import { test, expect } from '@playwright/test';

test('Age gate blocks underage users', async ({ page }) => {
  await page.goto('/');
  await page.fill('[name="birthDate"]', '2020-01-01'); // 5 años
  await page.click('button[type="submit"]');

  await expect(page.locator('text=al menos 13 años')).toBeVisible();
});

test('NSFW requires all consents', async ({ page }) => {
  // Mock adult user
  await page.goto('/agentes/123?nsfw=true');

  const continueBtn = page.locator('button:has-text("Continuar")');
  await expect(continueBtn).toBeDisabled();

  await page.check('text=18+ años');
  await page.check('text=contenido ficticio');
  await page.check('text=términos de uso');

  await expect(continueBtn).toBeEnabled();
});
```

```bash
# Ejecutar tests
npx playwright test
```

---

## 🎯 FASE 1: Quick Wins (Semana 3)

### Día 11-12: Habilitar Multimodal

```bash
# Ya está en el código, solo activar feature flag
```

```typescript
// lib/feature-flags/config.ts
export const FEATURE_FLAGS = {
  MULTIMODAL_ENABLED: true, // Cambiar a true
  IMAGE_GENERATION: true,
  VOICE_MESSAGES: true
};
```

```typescript
// Verificar que funcione
// components/chat/v2/ModernChat.tsx ya tiene:
// - ImageUploader
// - VoiceRecorder
// - StickerGifPicker
```

**Testing:**
```bash
npm run dev
# Abrir chat → Probar enviar imagen → Probar grabar voz
```

---

### Día 13: Semantic Caching

```typescript
// lib/cache/semantic-cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function semanticCacheCheck(query: string, context: string) {
  const key = `cache:${hash(query + context)}`;
  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached);
  }

  return null;
}

export async function semanticCacheSet(query: string, context: string, response: any) {
  const key = `cache:${hash(query + context)}`;
  await redis.setex(key, 3600, JSON.stringify(response)); // 1 hora TTL
}
```

```typescript
// Integrar en app/api/agents/[id]/message/route.ts
const cached = await semanticCacheCheck(userMessage, agentContext);
if (cached) {
  return NextResponse.json({ response: cached, cached: true });
}

// ... generar respuesta con LLM

await semanticCacheSet(userMessage, agentContext, response);
```

**Ahorro estimado:** 30% costos de inferencia

---

### Día 14: Vector Search Optimization

```typescript
// lib/memory/unified-retrieval.ts - Optimizar queries existentes

// Antes: búsqueda plana
const memories = await prisma.memory.findMany({
  where: { agentId },
  orderBy: { createdAt: 'desc' },
  take: 50
});

// Después: búsqueda vectorial + filtros
export async function optimizedMemorySearch(query: string, agentId: string) {
  const embedding = await getEmbedding(query);

  // Vector search con Prisma + pgvector
  const results = await prisma.$queryRaw`
    SELECT id, content, embedding <-> ${embedding}::vector AS distance
    FROM "Memory"
    WHERE "agentId" = ${agentId}
    ORDER BY distance
    LIMIT 10
  `;

  return results;
}
```

**Mejora esperada:** 40% más rápido en retrieval

---

### Día 15-17: Onboarding Optimizado

```typescript
// components/onboarding/OnboardingFlow.tsx
export function OnboardingFlow() {
  const steps = [
    { id: 'welcome', component: <WelcomeStep /> },
    { id: 'age-gate', component: <AgeGate /> },
    { id: 'create-first', component: <CreateFirstAgent /> },
    { id: 'first-chat', component: <GuidedFirstChat /> }
  ];

  return (
    <div className="onboarding-container">
      {steps.map(step => renderStep(step))}
      <ProgressBar current={currentStep} total={steps.length} />
    </div>
  );
}
```

```typescript
// lib/onboarding/tracking.ts
export async function trackOnboardingStep(userId: string, step: string) {
  await prisma.onboardingProgress.upsert({
    where: { userId },
    update: { currentStep: step, updatedAt: new Date() },
    create: { userId, currentStep: step }
  });
}
```

---

## 💰 FASE 2: Monetización (Semanas 4-6)

### Implementar Paywall

```typescript
// components/upgrade/UpgradeModal.tsx
export function UpgradeModal({ feature }: { feature: string }) {
  const plans = [
    { name: 'Free', price: 0, features: ['1 agente', '50 msgs/día'] },
    { name: 'Plus', price: 9.99, features: ['5 agentes', 'Ilimitado', 'Multimodal'] }
  ];

  return (
    <Modal>
      <h2>Desbloquea {feature}</h2>
      {plans.map(plan => <PlanCard key={plan.name} {...plan} />)}
    </Modal>
  );
}
```

```typescript
// lib/usage/daily-limits.ts - Ya existe, integrar checks
export async function checkMessageLimit(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (user.plan === 'FREE') {
    const todayCount = await redis.get(`messages:${userId}:${today}`);
    if (todayCount >= 50) {
      throw new Error('LIMIT_REACHED');
    }
  }

  return true;
}
```

---

## 📊 Métricas Clave a Trackear

```typescript
// lib/analytics/metrics.ts
export const METRICS = {
  // AARRR
  activation: {
    event: 'first_message_sent',
    goal: '40% of signups'
  },
  retention: {
    event: 'day_7_active',
    goal: '35% D7 retention'
  },
  revenue: {
    event: 'subscription_started',
    goal: '$216K ARR'
  },

  // HEART
  happiness: {
    event: 'rating_given',
    metric: 'avg_rating >= 4.2'
  },
  engagement: {
    event: 'daily_active_user',
    metric: 'avg_sessions_per_week >= 5'
  }
};

export function trackMetric(metric: string, userId: string, value?: any) {
  // Integrar con PostHog/Mixpanel/Google Analytics
  analytics.track({
    event: metric,
    userId,
    properties: { value, timestamp: new Date() }
  });
}
```

---

## 🚀 DEPLOYMENT

### Pre-Deploy Checklist

```bash
# 1. Tests
npm run test
npx playwright test

# 2. Build
npm run build

# 3. Environment variables
cp .env.example .env.production
# Configurar: DATABASE_URL, REDIS_URL, OPENAI_API_KEY, NEXTAUTH_SECRET

# 4. Database migrations
npx prisma migrate deploy

# 5. Deploy
vercel --prod
# o
docker-compose up -d
```

---

## 📈 Proyecciones (12 meses)

| Métrica | Conservador | Optimista |
|---------|-------------|-----------|
| Usuarios | 3,000 | 8,000 |
| Conversión Free→Plus | 6% | 12% |
| ARR | $216K | $576K |
| Gross Margin | 89% | 89% |
| ROI | 9.2x | 24.5x |

---

## 🎯 Roadmap Completo

**T0 - Quick Wins (Semana 3):**
- ✅ Multimodal enable
- ✅ Semantic caching
- ✅ Vector search optimization
- ✅ Onboarding flow

**T1 - Retention (Semanas 4-10):**
- Paywall + billing
- Push notifications
- Gamificación básica
- Proactive behavior V2
- Memory compression

**T2 - Scale (Semanas 11-14):**
- Marketplace de personajes
- Sistema de comunidad
- Eventos narrativos emergentes
- Analytics dashboard

---

## 🔗 Enlaces Útiles

- **Documentos de referencia:**
  - `STRATEGIC_AI_ROADMAP.md` - Análisis completo
  - `EXECUTIVE_SUMMARY_AI_STRATEGY.md` - Resumen ejecutivo
  - `AI_STRATEGY_INDEX.md` - Índice navegable

- **Testing:**
  - Playwright docs: https://playwright.dev
  - Vitest: https://vitest.dev

- **Deployment:**
  - Vercel: https://vercel.com/docs
  - Railway: https://docs.railway.app

---

## ✅ Primera Semana - Action Plan

```bash
# Lunes-Martes
git checkout -b feature/age-verification
# Implementar Age Gate
npm run dev # probar
git commit -am "feat: Add age verification"

# Miércoles-Jueves
git checkout -b feature/nsfw-consent
# Implementar NSFW Consent
git commit -am "feat: Add NSFW consent flow"

# Viernes
git checkout -b feature/output-moderation
# Implementar Output Moderation
git commit -am "feat: Add output moderation"

# Fin de semana
# PII Detection + Content Policy + Tests
git commit -am "feat: Complete safety compliance"

# Lunes siguiente
git merge --no-ff feature/* into main
vercel --prod
```

---

**Tiempo estimado total implementación:** 14 semanas
**Equipo mínimo:** 1 dev full-time + 1 diseñador part-time
**Inversión:** $23.5K

**¿Listo para empezar? Podés arrancar hoy mismo con el Age Gate.** 🚀
