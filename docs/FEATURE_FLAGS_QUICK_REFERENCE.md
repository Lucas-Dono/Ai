# Feature Flags - Quick Reference

Guía rápida de referencia para el sistema de feature flags.

---

## Imports Comunes

```typescript
// Types
import { Feature, UserTier } from "@/lib/feature-flags/types";

// Service
import {
  hasFeature,
  checkFeature,
  getUserTier,
  getFeatureLimits,
  canUseFeature,
  trackFeatureUsage,
} from "@/lib/feature-flags";

// Middleware
import {
  requireFeature,
  requireFeatureWithLimit,
  withFeature,
  checkFeatureAccess,
} from "@/lib/feature-flags/middleware";

// React
import { useFeatures, useUserTier } from "@/hooks/useFeatures";
import { FeatureGate } from "@/components/features/FeatureGate";
import { UpgradePrompt } from "@/components/features/UpgradePrompt";
```

---

## Features Disponibles

```typescript
enum Feature {
  // Chat
  CHAT_BASIC = "CHAT_BASIC",
  VOICE_MESSAGES = "VOICE_MESSAGES",
  IMAGE_GENERATION = "IMAGE_GENERATION",
  MULTIMODAL_MESSAGES = "MULTIMODAL_MESSAGES",

  // Agents
  AGENT_CREATION = "AGENT_CREATION",
  AGENT_PUBLISHING = "AGENT_PUBLISHING",
  AGENT_API_ACCESS = "AGENT_API_ACCESS",

  // Worlds
  WORLDS = "WORLDS",
  WORLD_CREATION = "WORLD_CREATION",
  WORLD_ADVANCED_FEATURES = "WORLD_ADVANCED_FEATURES",

  // Marketplace
  MARKETPLACE_PUBLISHING = "MARKETPLACE_PUBLISHING",
  MARKETPLACE_UNLIMITED = "MARKETPLACE_UNLIMITED",

  // Community
  COMMUNITY_BASIC = "COMMUNITY_BASIC",
  COMMUNITY_ADVANCED = "COMMUNITY_ADVANCED",
  COMMUNITY_MODERATION = "COMMUNITY_MODERATION",

  // Analytics
  ANALYTICS_BASIC = "ANALYTICS_BASIC",
  ANALYTICS_ADVANCED = "ANALYTICS_ADVANCED",
  ANALYTICS_EXPORT = "ANALYTICS_EXPORT",

  // Support
  PRIORITY_SUPPORT = "PRIORITY_SUPPORT",
  EARLY_ACCESS = "EARLY_ACCESS",

  // API
  API_ACCESS = "API_ACCESS",
  API_WEBHOOKS = "API_WEBHOOKS",

  // Business
  TEAM_FEATURES = "TEAM_FEATURES",
  CUSTOM_BRANDING = "CUSTOM_BRANDING",
  SSO = "SSO",
}
```

---

## Backend Patterns

### Pattern 1: Block with requireFeature

```typescript
export async function POST(req: NextRequest) {
  await requireFeature(req, Feature.WORLDS);
  // Usuario tiene feature, continuar...
}
```

### Pattern 2: Wrap with withFeature

```typescript
export const POST = withFeature(Feature.WORLDS, async (req) => {
  // Usuario ya validado
});
```

### Pattern 3: Check with limits

```typescript
export async function POST(req: NextRequest) {
  const session = await auth();
  await requireFeatureWithLimit(req, Feature.IMAGE_GENERATION);

  // Generate...

  await trackFeatureUsage(session.user.id, Feature.IMAGE_GENERATION);
}
```

### Pattern 4: Non-blocking check

```typescript
export async function GET(req: NextRequest) {
  const hasAccess = await checkFeatureAccess(req, Feature.API_ACCESS);

  if (hasAccess) {
    return NextResponse.json({ apiKey: "..." });
  } else {
    return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
  }
}
```

---

## Frontend Patterns

### Pattern 1: useFeatures Hook

```tsx
function MyComponent() {
  const { hasFeature, limits, userTier } = useFeatures();

  if (!hasFeature(Feature.WORLDS)) {
    return <UpgradePrompt feature={Feature.WORLDS} />;
  }

  return <WorldCreator />;
}
```

### Pattern 2: FeatureGate Component

```tsx
function Dashboard() {
  return (
    <>
      <FeatureGate feature={Feature.WORLDS}>
        <WorldsPanel />
      </FeatureGate>

      <FeatureGate
        feature={Feature.API_ACCESS}
        fallback={<div>Upgrade to access API</div>}
      >
        <APISettings />
      </FeatureGate>
    </>
  );
}
```

### Pattern 3: Usage Limits Check

```tsx
function ImageGenerator() {
  const { canUseFeature, trackFeatureUsage } = useFeatures();

  const generate = async () => {
    const check = await canUseFeature(Feature.IMAGE_GENERATION);

    if (!check.canUse) {
      toast.error(check.reason);
      return;
    }

    // Generate...
    await trackFeatureUsage(Feature.IMAGE_GENERATION);
  };

  return <button onClick={generate}>Generate</button>;
}
```

### Pattern 4: Conditional Render

```tsx
function Settings() {
  const { canCreateWorlds, canGenerateImages, userTier } = useFeatures();

  return (
    <>
      <TierBadge tier={userTier} />
      {canCreateWorlds && <WorldSettings />}
      {canGenerateImages && <ImageSettings />}
    </>
  );
}
```

---

## Tier Limits Cheatsheet

```typescript
// Free
{
  maxAgents: 3,
  maxActiveWorlds: 0,
  imageGenerationsPerDay: 0,
  messagesPerDay: 100,
}

// Plus
{
  maxAgents: 20,
  maxActiveWorlds: 5,
  imageGenerationsPerDay: 10,
  messagesPerDay: 1000,
}

// Ultra
{
  maxAgents: 100,
  maxActiveWorlds: 20,
  imageGenerationsPerDay: 100,
  messagesPerDay: -1, // Unlimited
}
```

---

## Common Workflows

### Workflow 1: Protect API endpoint

```typescript
// app/api/worlds/route.ts
import { withFeature } from "@/lib/feature-flags/middleware";
import { Feature } from "@/lib/feature-flags/types";

export const POST = withFeature(Feature.WORLD_CREATION, async (req) => {
  // Handler code
});
```

### Workflow 2: Gate UI feature

```tsx
// components/Dashboard.tsx
import { FeatureGate } from "@/components/features/FeatureGate";
import { Feature } from "@/lib/feature-flags/types";

export function Dashboard() {
  return (
    <FeatureGate feature={Feature.WORLDS}>
      <WorldsSection />
    </FeatureGate>
  );
}
```

### Workflow 3: Check usage before action

```typescript
// app/api/images/route.ts
import { requireFeatureWithLimit, trackFeatureUsage } from "@/lib/feature-flags";

export async function POST(req) {
  const session = await auth();
  await requireFeatureWithLimit(req, Feature.IMAGE_GENERATION);

  const image = await generateImage();

  await trackFeatureUsage(session.user.id, Feature.IMAGE_GENERATION);

  return NextResponse.json({ image });
}
```

### Workflow 4: Invalidate cache on plan change

```typescript
// app/api/webhooks/subscription/route.ts
import { invalidateUserTierCache } from "@/lib/feature-flags";

export async function POST(req) {
  const event = await req.json();

  await prisma.user.update({
    where: { id: event.userId },
    data: { plan: event.newPlan },
  });

  await invalidateUserTierCache(event.userId);

  return new Response("OK");
}
```

---

## Error Handling

### Backend Error Types

```typescript
import {
  FeatureAccessError,
  FeatureUsageLimitError,
  handleFeatureError,
} from "@/lib/feature-flags/middleware";

try {
  await requireFeature(req, Feature.WORLDS);
} catch (error) {
  if (error instanceof FeatureAccessError) {
    // User doesn't have feature
    return NextResponse.json(
      {
        error: error.message,
        upgradeUrl: error.featureCheck.upgradeUrl,
      },
      { status: 403 }
    );
  }

  // Or use auto-handler
  return handleFeatureError(error);
}
```

---

## API Endpoints

```bash
# Get user features & limits
GET /api/features

# Check feature usage
GET /api/features/check?feature=IMAGE_GENERATION

# Track usage
POST /api/features/track
{
  "feature": "IMAGE_GENERATION",
  "count": 1
}
```

---

## Testing Checklist

```typescript
// Test all tiers
test("Free tier can't access WORLDS", async () => {
  mockUser({ plan: "free" });
  expect(await hasFeature(userId, Feature.WORLDS)).toBe(false);
});

test("Plus tier can access WORLDS", async () => {
  mockUser({ plan: "plus" });
  expect(await hasFeature(userId, Feature.WORLDS)).toBe(true);
});

// Test limits
test("Plus tier has 20 agents limit", async () => {
  mockUser({ plan: "plus" });
  const limits = await getFeatureLimits(userId);
  expect(limits.maxAgents).toBe(20);
});

// Test usage tracking
test("Tracks image generation usage", async () => {
  const usage = await trackFeatureUsage(userId, Feature.IMAGE_GENERATION);
  expect(usage.count).toBe(1);
});
```

---

## Migration Guide

### Migrating existing feature checks

**Before:**
```typescript
if (user.plan === "plus" || user.plan === "ultra") {
  // Allow worlds
}
```

**After:**
```typescript
await requireFeature(req, Feature.WORLDS);
```

**Before:**
```tsx
{user.plan !== "free" && <WorldsButton />}
```

**After:**
```tsx
<FeatureGate feature={Feature.WORLDS}>
  <WorldsButton />
</FeatureGate>
```

---

## Performance Tips

1. **Use caching**: Features are cached in Redis/memory
2. **Batch checks**: Get all features once with `getEnabledFeatures()`
3. **Frontend hook**: `useFeatures()` caches for 5 minutes
4. **Invalidate on changes**: Call `invalidateUserTierCache()` when plan changes

---

## Troubleshooting

**Issue**: Feature check always returns false
**Fix**: Check user.plan in database matches enum: "free", "plus", "ultra"

**Issue**: Cache not updating after upgrade
**Fix**: Call `invalidateUserTierCache(userId)` after plan change

**Issue**: Redis errors in logs
**Fix**: System auto-falls back to in-memory. Check UPSTASH_REDIS_* env vars

**Issue**: TypeScript errors on Feature enum
**Fix**: Import from `@/lib/feature-flags/types`, not config

---

## One-Liners

```typescript
// Check if user has feature
await hasFeature(userId, Feature.WORLDS) // -> boolean

// Get user tier
await getUserTier(userId) // -> "free" | "plus" | "ultra"

// Get limits
await getLimit(userId, "maxAgents") // -> number

// Protect route
await requireFeature(req, Feature.WORLDS) // throws if denied

// Track usage
await trackFeatureUsage(userId, Feature.IMAGE_GENERATION, 1)

// Invalidate cache
await invalidateUserTierCache(userId)
```

---

**¡Sistema listo para producción!**
