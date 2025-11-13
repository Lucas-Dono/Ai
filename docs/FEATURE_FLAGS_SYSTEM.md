# Feature Flags System

Sistema robusto de feature flags basado en tier de usuario con caching Redis, middleware para API, hooks de React y componentes UI.

## Índice

- [Características](#características)
- [Tiers y Features](#tiers-y-features)
- [Uso en Backend](#uso-en-backend)
- [Uso en Frontend](#uso-en-frontend)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Ejemplos](#ejemplos)

---

## Características

- **Type-safe**: Tipos TypeScript estrictos para features y tiers
- **Performance**: Caching en Redis con fallback in-memory
- **Middleware**: Protección automática de rutas API
- **React Hooks**: Hooks listos para usar en frontend
- **UI Components**: Componentes de upgrade prompts y feature gates
- **Testing**: Suite completa de tests
- **Logging**: Tracking de accesos para analytics

---

## Tiers y Features

### Free Tier

**Features:**
- ✅ Chat básico 1-1
- ✅ Creación de agentes (máx. 3)
- ✅ Community básica
- ✅ Analytics básicas

**Limits:**
```typescript
{
  maxAgents: 3,
  maxActiveWorlds: 0,
  imageGenerationsPerDay: 0,
  messagesPerDay: 100,
  maxStorageGB: 1
}
```

### Plus Tier ($9.99/mes)

**Features:**
- ✅ Todo de Free
- ✅ Mundos virtuales (5 activos)
- ✅ Image generation (10/día)
- ✅ Voice messages
- ✅ Marketplace publishing (5 items)
- ✅ Community avanzada
- ✅ Priority support
- ✅ Mensajes multimodales

**Limits:**
```typescript
{
  maxAgents: 20,
  maxActiveWorlds: 5,
  maxWorldAgents: 10,
  imageGenerationsPerDay: 10,
  messagesPerDay: 1000,
  maxStorageGB: 10
}
```

### Ultra Tier ($29.99/mes)

**Features:**
- ✅ Todo de Plus
- ✅ 100 agentes
- ✅ 20 mundos activos
- ✅ Image generation (100/día)
- ✅ Advanced analytics
- ✅ Early access features
- ✅ Marketplace unlimited
- ✅ API access (10k calls/día)
- ✅ Team features
- ✅ Custom branding

**Limits:**
```typescript
{
  maxAgents: 100,
  maxActiveWorlds: 20,
  maxWorldAgents: 50,
  imageGenerationsPerDay: 100,
  messagesPerDay: -1, // Unlimited
  maxMarketplaceItems: -1, // Unlimited
  apiCallsPerDay: 10000,
  maxStorageGB: 100
}
```

---

## Uso en Backend

### 1. Middleware: `requireFeature`

Bloquea request si usuario no tiene feature (throw error):

```typescript
import { requireFeature } from "@/lib/feature-flags/middleware";
import { Feature } from "@/lib/feature-flags/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Bloqueará con 403 si usuario no tiene WORLDS
  await requireFeature(req, Feature.WORLDS);

  // Usuario tiene acceso - continuar
  const body = await req.json();
  // ... crear mundo
  return NextResponse.json({ success: true });
}
```

### 2. Middleware: `withFeature`

Wrapper que protege el handler completo:

```typescript
import { withFeature } from "@/lib/feature-flags/middleware";
import { Feature } from "@/lib/feature-flags/types";
import { NextRequest, NextResponse } from "next/server";

export const POST = withFeature(
  Feature.IMAGE_GENERATION,
  async (req: NextRequest) => {
    // Usuario ya validado
    const body = await req.json();
    // ... generar imagen
    return NextResponse.json({ imageUrl: "..." });
  }
);
```

### 3. Check con límites de uso: `requireFeatureWithLimit`

Para features con límites diarios (image generation, API calls):

```typescript
import { requireFeatureWithLimit } from "@/lib/feature-flags/middleware";
import { trackFeatureUsage } from "@/lib/feature-flags";
import { Feature } from "@/lib/feature-flags/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session!.user!.id;

  // Verifica feature + límite diario
  await requireFeatureWithLimit(req, Feature.IMAGE_GENERATION);

  // Generar imagen...
  const imageUrl = await generateImage();

  // Trackear uso (incrementa contador)
  await trackFeatureUsage(userId, Feature.IMAGE_GENERATION, 1);

  return NextResponse.json({ imageUrl });
}
```

### 4. Check no-bloqueante: `checkFeatureAccess`

Retorna boolean, no lanza error:

```typescript
import { checkFeatureAccess } from "@/lib/feature-flags/middleware";
import { Feature } from "@/lib/feature-flags/types";

export async function GET(req: NextRequest) {
  const hasAPI = await checkFeatureAccess(req, Feature.API_ACCESS);

  if (hasAPI) {
    return NextResponse.json({ apiKey: user.apiKey });
  } else {
    return NextResponse.json({
      message: "Actualiza a Ultra para acceso API",
      upgradeUrl: "/pricing?upgrade=ultra",
    });
  }
}
```

### 5. Service directo: `hasFeature`

Uso directo del service (sin request):

```typescript
import { hasFeature, getUserTier, getFeatureLimits } from "@/lib/feature-flags";
import { Feature } from "@/lib/feature-flags/types";

async function myBackgroundJob(userId: string) {
  // Check simple
  if (await hasFeature(userId, Feature.EARLY_ACCESS)) {
    // Dar acceso a beta features
  }

  // Get tier
  const tier = await getUserTier(userId);
  console.log(`User tier: ${tier}`);

  // Get limits
  const limits = await getFeatureLimits(userId);
  console.log(`Max agents: ${limits.maxAgents}`);
}
```

### 6. Error Handling

```typescript
import {
  requireFeature,
  FeatureAccessError,
  handleFeatureError,
} from "@/lib/feature-flags/middleware";
import { Feature } from "@/lib/feature-flags/types";

export async function POST(req: NextRequest) {
  try {
    await requireFeature(req, Feature.WORLDS);
    // ... lógica
  } catch (error) {
    // Auto-handling de FeatureAccessError
    return handleFeatureError(error);
  }
}
```

---

## Uso en Frontend

### 1. Hook: `useFeatures`

Hook principal para acceder a feature flags:

```tsx
import { useFeatures } from "@/hooks/useFeatures";
import { Feature } from "@/lib/feature-flags/types";

function MyComponent() {
  const {
    hasFeature,
    canCreateWorlds,
    canGenerateImages,
    limits,
    userTier,
    isLoading,
  } = useFeatures();

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div>
      <p>Your plan: {userTier}</p>
      <p>Max agents: {limits?.maxAgents}</p>

      {hasFeature(Feature.WORLDS) ? (
        <CreateWorldButton />
      ) : (
        <UpgradePrompt feature={Feature.WORLDS} />
      )}

      {canGenerateImages && <ImageGenerator />}
    </div>
  );
}
```

### 2. Component: `FeatureGate`

Renderiza children solo si usuario tiene feature:

```tsx
import { FeatureGate } from "@/components/features/FeatureGate";
import { Feature } from "@/lib/feature-flags/types";

function Dashboard() {
  return (
    <div>
      {/* Muestra WorldsPanel solo si tiene WORLDS */}
      <FeatureGate feature={Feature.WORLDS}>
        <WorldsPanel />
      </FeatureGate>

      {/* Con custom fallback */}
      <FeatureGate
        feature={Feature.API_ACCESS}
        fallback={<div>API access requires Ultra plan</div>}
      >
        <APISettings />
      </FeatureGate>

      {/* Sin upgrade prompt automático */}
      <FeatureGate feature={Feature.IMAGE_GENERATION} showUpgradePrompt={false}>
        <ImageGenerator />
      </FeatureGate>
    </div>
  );
}
```

### 3. Component: `UpgradePrompt`

Muestra mensaje de upgrade cuando usuario no tiene feature:

```tsx
import { UpgradePrompt } from "@/components/features/UpgradePrompt";
import { Feature } from "@/lib/feature-flags/types";

function WorldsLockedView() {
  return (
    <div>
      {/* Alert variant (default) */}
      <UpgradePrompt feature={Feature.WORLDS} />

      {/* Card variant */}
      <UpgradePrompt feature={Feature.IMAGE_GENERATION} variant="card" />

      {/* Inline variant */}
      <UpgradePrompt feature={Feature.API_ACCESS} variant="inline" />
    </div>
  );
}
```

### 4. Component: `FeatureLocked`

Muestra elemento bloqueado con lock icon:

```tsx
import { FeatureLocked } from "@/components/features/UpgradePrompt";
import { Feature } from "@/lib/feature-flags/types";

function SettingsPage() {
  return (
    <div>
      {/* Botón bloqueado con tooltip */}
      <FeatureLocked feature={Feature.API_ACCESS}>
        <button>Generate API Key</button>
      </FeatureLocked>
    </div>
  );
}
```

### 5. Component: `TierBadge`

Muestra badge del tier del usuario:

```tsx
import { TierBadge } from "@/components/features/UpgradePrompt";
import { useFeatures } from "@/hooks/useFeatures";

function UserProfile() {
  const { userTier } = useFeatures();

  return (
    <div>
      <h2>Profile</h2>
      <TierBadge tier={userTier} />
    </div>
  );
}
```

### 6. Checking con límites de uso

```tsx
import { useFeatures } from "@/hooks/useFeatures";
import { Feature } from "@/lib/feature-flags/types";

function ImageGenerator() {
  const { canUseFeature, trackFeatureUsage } = useFeatures();

  const generateImage = async () => {
    // Check si puede usar (considera límites)
    const check = await canUseFeature(Feature.IMAGE_GENERATION);

    if (!check.canUse) {
      toast.error(check.reason);
      if (check.upgradeUrl) {
        router.push(check.upgradeUrl);
      }
      return;
    }

    // Generar imagen
    const result = await fetch("/api/images/generate", {
      method: "POST",
      body: JSON.stringify({ prompt: "..." }),
    });

    // Trackear uso
    await trackFeatureUsage(Feature.IMAGE_GENERATION, 1);

    toast.success(`Generada! (${check.usage?.count}/${check.usage?.limit})`);
  };

  return <button onClick={generateImage}>Generate Image</button>;
}
```

### 7. Hook: `useUserTier`

Hook simple solo para tier:

```tsx
import { useUserTier } from "@/hooks/useFeatures";

function PricingBanner() {
  const { tier, isFree, isPlus, isUltra } = useUserTier();

  if (isUltra) return null; // No mostrar banner

  return (
    <div className="banner">
      {isFree && "Upgrade to Plus for Worlds!"}
      {isPlus && "Upgrade to Ultra for API access!"}
    </div>
  );
}
```

---

## API Endpoints

### GET /api/features

Obtiene features y limits del usuario:

```typescript
const response = await fetch("/api/features");
const data = await response.json();

// Response:
{
  tier: "plus",
  features: ["CHAT_BASIC", "WORLDS", "IMAGE_GENERATION", ...],
  limits: {
    maxAgents: 20,
    maxActiveWorlds: 5,
    imageGenerationsPerDay: 10,
    ...
  }
}
```

### GET /api/features/check?feature=FEATURE_NAME

Check si puede usar feature (con límites):

```typescript
const response = await fetch(
  "/api/features/check?feature=IMAGE_GENERATION"
);
const data = await response.json();

// Response (canUse = true):
{
  canUse: true,
  usage: {
    userId: "...",
    feature: "IMAGE_GENERATION",
    count: 5,
    limit: 10,
    resetAt: "2025-11-01T00:00:00Z"
  }
}

// Response (canUse = false):
{
  canUse: false,
  reason: "Has alcanzado el límite diario de 10. Actualiza a Ultra para más.",
  upgradeUrl: "/pricing?upgrade=ultra",
  usage: { ... }
}
```

### POST /api/features/track

Trackea uso de feature:

```typescript
const response = await fetch("/api/features/track", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    feature: "IMAGE_GENERATION",
    count: 1, // Opcional, default 1
  }),
});

// Response:
{
  success: true,
  usage: {
    userId: "...",
    feature: "IMAGE_GENERATION",
    count: 6,
    limit: 10,
    resetAt: "2025-11-01T00:00:00Z"
  }
}
```

---

## Testing

### Ejecutar tests

```bash
npm test lib/feature-flags
```

### Test Coverage

- ✅ Config validation (tiers, features, limits)
- ✅ Service functions (getUserTier, hasFeature, etc.)
- ✅ Middleware (requireFeature, withFeature)
- ✅ Caching behavior
- ✅ Limit checking
- ✅ Usage tracking

### Ejemplo de test

```typescript
import { describe, it, expect, vi } from "vitest";
import { hasFeature } from "@/lib/feature-flags";
import { Feature, UserTier } from "@/lib/feature-flags/types";

describe("hasFeature", () => {
  it("should return true for Plus user with WORLDS", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-123",
      plan: "plus",
    } as any);

    const result = await hasFeature("user-123", Feature.WORLDS);
    expect(result).toBe(true);
  });
});
```

---

## Ejemplos Completos

### Ejemplo 1: Proteger API de Mundos

```typescript
// app/api/worlds/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withFeature } from "@/lib/feature-flags/middleware";
import { Feature } from "@/lib/feature-flags/types";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const POST = withFeature(
  Feature.WORLD_CREATION,
  async (req: NextRequest) => {
    const session = await auth();
    const userId = session!.user!.id;
    const body = await req.json();

    // Check límite de mundos activos
    const { withinLimit, limit, current } = await checkLimit(
      userId,
      "maxActiveWorlds",
      await getActiveWorldsCount(userId)
    );

    if (!withinLimit) {
      return NextResponse.json(
        {
          error: `Has alcanzado el límite de ${limit} mundos activos`,
          upgradeUrl: "/pricing?upgrade=ultra",
        },
        { status: 403 }
      );
    }

    // Crear mundo
    const world = await prisma.world.create({
      data: {
        userId,
        name: body.name,
        // ...
      },
    });

    return NextResponse.json(world);
  }
);
```

### Ejemplo 2: Image Generation con límites

```typescript
// app/api/images/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireFeatureWithLimit } from "@/lib/feature-flags/middleware";
import { trackFeatureUsage } from "@/lib/feature-flags";
import { Feature } from "@/lib/feature-flags/types";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session!.user!.id;

  // Check feature + límite
  await requireFeatureWithLimit(req, Feature.IMAGE_GENERATION);

  const body = await req.json();

  // Generar imagen
  const imageUrl = await generateImageWithAI(body.prompt);

  // Trackear uso
  await trackFeatureUsage(userId, Feature.IMAGE_GENERATION, 1);

  return NextResponse.json({ imageUrl });
}
```

### Ejemplo 3: UI con Feature Gates

```tsx
// app/dashboard/page.tsx
import { FeatureGate } from "@/components/features/FeatureGate";
import { UpgradePrompt } from "@/components/features/UpgradePrompt";
import { useFeatures } from "@/hooks/useFeatures";
import { Feature } from "@/lib/feature-flags/types";

export default function Dashboard() {
  const { hasFeature, limits, userTier } = useFeatures();

  return (
    <div className="space-y-6">
      <h1>Dashboard</h1>
      <TierBadge tier={userTier} />

      {/* Always visible */}
      <AgentsPanel maxAgents={limits?.maxAgents || 0} />

      {/* Gated by feature */}
      <FeatureGate feature={Feature.WORLDS}>
        <WorldsPanel />
      </FeatureGate>

      <FeatureGate feature={Feature.IMAGE_GENERATION}>
        <ImageGeneratorPanel />
      </FeatureGate>

      {/* Conditional render */}
      {!hasFeature(Feature.API_ACCESS) && (
        <UpgradePrompt feature={Feature.API_ACCESS} variant="card" />
      )}

      {hasFeature(Feature.API_ACCESS) && <APISettingsPanel />}
    </div>
  );
}
```

### Ejemplo 4: Invalidar cache al cambiar plan

```typescript
// app/api/subscription/webhook/route.ts
import { invalidateUserTierCache } from "@/lib/feature-flags";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const event = await req.json();

  if (event.type === "subscription.updated") {
    const userId = event.data.userId;
    const newPlan = event.data.plan; // "plus" | "ultra"

    // Actualizar plan en DB
    await prisma.user.update({
      where: { id: userId },
      data: { plan: newPlan },
    });

    // Invalidar cache para que próximo request obtenga nuevo tier
    await invalidateUserTierCache(userId);
  }

  return new Response("OK");
}
```

---

## Mejores Prácticas

1. **Siempre usar middleware en APIs**: No confiar solo en frontend
2. **Trackear uso para features con límites**: Llamar `trackFeatureUsage` después de usar
3. **Invalidar cache al cambiar plan**: Llamar `invalidateUserTierCache` en webhooks
4. **Usar FeatureGate en frontend**: Más limpio que if/else
5. **Mostrar upgrade prompts**: Siempre dar opción de upgrade
6. **Test coverage**: Testear todos los tiers en features críticas

---

## Troubleshooting

### Cache no actualiza después de upgrade

```typescript
import { invalidateUserTierCache } from "@/lib/feature-flags";
await invalidateUserTierCache(userId);
```

### Usuario tiene feature pero API retorna 403

Verificar que session esté actualizada:
```typescript
// Force refresh session
await update(); // en useSession hook
```

### Redis errors en logs

Sistema tiene fallback automático a in-memory cache. Revisar env:
```bash
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## Matriz Completa de Features por Tier

| Feature | Free | Plus | Ultra |
|---------|------|------|-------|
| Chat Básico | ✅ | ✅ | ✅ |
| Agents (3/20/100) | ✅ | ✅ | ✅ |
| Community Básica | ✅ | ✅ | ✅ |
| Analytics Básicas | ✅ | ✅ | ✅ |
| Voice Messages | ❌ | ✅ | ✅ |
| Image Generation (0/10/100 día) | ❌ | ✅ | ✅ |
| Mundos Virtuales (0/5/20) | ❌ | ✅ | ✅ |
| Marketplace Publishing (0/5/∞) | ❌ | ✅ | ✅ |
| Community Avanzada | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |
| Multimodal Messages | ❌ | ✅ | ✅ |
| World Advanced Features | ❌ | ❌ | ✅ |
| Analytics Avanzadas | ❌ | ❌ | ✅ |
| Analytics Export | ❌ | ❌ | ✅ |
| Early Access | ❌ | ❌ | ✅ |
| API Access (10k/día) | ❌ | ❌ | ✅ |
| API Webhooks | ❌ | ❌ | ✅ |
| Team Features | ❌ | ❌ | ✅ |
| Custom Branding | ❌ | ❌ | ✅ |

---

## Archivos Creados

```
lib/feature-flags/
├── types.ts                 # Type definitions
├── config.ts                # Tier configs y feature metadata
├── index.ts                 # Core service functions
└── middleware.ts            # Backend middleware

hooks/
└── useFeatures.ts           # React hooks

components/features/
├── FeatureGate.tsx          # Conditional rendering component
└── UpgradePrompt.tsx        # Upgrade UI components

app/api/features/
├── route.ts                 # GET features & limits
├── check/route.ts           # GET check feature usage
└── track/route.ts           # POST track usage

__tests__/lib/feature-flags/
├── config.test.ts           # Config tests
└── index.test.ts            # Service tests
```

---

## Contacto

Para preguntas o issues, contactar al equipo de desarrollo.
