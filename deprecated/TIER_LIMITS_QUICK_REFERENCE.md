# Tier Limits - Quick Reference Card

## Límites por Tier (Referencia Rápida)

### Free Tier
```
API: 10/min, 100/hora, 1000/día
Mensajes: 100/día
Agentes: 3
Mundos: 1
Marketplace: 0 characters
Imágenes: 0 gen/día, 5 análisis/mes
Voz: 0/mes
Cooldowns: 3s mensaje, 5s mundo
Features: ❌ NSFW, ❌ Behaviors, ❌ Voz, ❌ API
```

### Plus Tier
```
API: 30/min, 500/hora, 5000/día
Mensajes: 1000/día
Agentes: 20
Mundos: 5
Marketplace: 5 characters
Imágenes: 10 gen/día, 50 análisis/mes
Voz: 100/mes
Cooldowns: 1s mensaje, 2s mundo
Features: ✅ NSFW, ✅ Behaviors, ✅ Voz, ❌ API
```

### Ultra Tier
```
API: 100/min, ♾️ hora, ♾️ día
Mensajes: ♾️/día
Agentes: 100
Mundos: 20
Marketplace: 50 characters
Imágenes: 100 gen/día, 200 análisis/mes
Voz: 500/mes
Cooldowns: 0s (sin cooldown)
Features: ✅ NSFW, ✅ Behaviors, ✅ Voz, ✅ API, ✅ Priority, ✅ Voice Cloning
```

---

## Code Snippets

### 1. Rate Limit Check (API requests)

```typescript
import { checkTierRateLimit } from '@/lib/redis/ratelimit';

const result = await checkTierRateLimit(userId, userPlan);
if (!result.success) {
  return NextResponse.json(result.error, { status: 429 });
}
```

### 2. Resource Check (Mensajes, agentes, etc.)

```typescript
import { checkTierResourceLimit } from '@/lib/usage/daily-limits';

const quota = await checkTierResourceLimit(userId, userPlan, "messagesPerDay");
if (!quota.allowed) {
  return NextResponse.json(quota.error, { status: 429 });
}
```

### 3. Get Tier Info

```typescript
import { getTierLimits } from '@/lib/usage/tier-limits';

const limits = getTierLimits(userPlan);
console.log(limits.apiRequests.perMinute); // 10, 30, or 100
console.log(limits.resources.messagesPerDay); // 100, 1000, or -1
console.log(limits.features.nsfwContent); // false, true, or true
```

### 4. Cache User Plan (Performance)

```typescript
import { getCachedUserPlan } from '@/lib/redis/ratelimit';

const plan = await getCachedUserPlan(userId); // Cached 5 min
```

### 5. Full Endpoint Example

```typescript
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);

  // Rate limit check
  const rateLimit = await checkTierRateLimit(user.id, user.plan);
  if (!rateLimit.success) {
    return NextResponse.json(rateLimit.error, {
      status: 429,
      headers: {
        "X-RateLimit-Tier": rateLimit.tier,
        "X-RateLimit-Limit": rateLimit.limit.toString(),
        "X-RateLimit-Remaining": "0",
      },
    });
  }

  // Resource check
  const quota = await checkTierResourceLimit(user.id, user.plan, "messagesPerDay");
  if (!quota.allowed) {
    return NextResponse.json(quota.error, { status: 429 });
  }

  // Process request
  const result = await processRequest(...);

  return NextResponse.json({ ...result, quota }, {
    headers: {
      "X-RateLimit-Tier": rateLimit.tier,
      "X-RateLimit-Limit": rateLimit.limit.toString(),
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-Resource-Quota-Remaining": quota.remaining.toString(),
    },
  });
}
```

### 6. Invalidate Cache (When plan changes)

```typescript
import { invalidateUserPlanCache } from '@/lib/redis/ratelimit';

// After updating user plan
await prisma.user.update({ where: { id: userId }, data: { plan: 'plus' } });
await invalidateUserPlanCache(userId);
```

---

## Error Response Format

```typescript
// Rate Limit Error
{
  error: "Rate limit exceeded",
  code: "RATE_LIMIT_EXCEEDED",
  tier: "free",
  limit: 10,
  remaining: 0,
  reset: 1672531260,
  upgradeUrl: "/pricing",
  upgradeMessage: "Límite de solicitudes por minuto alcanzado (10/min). Actualiza a Plus para 30 req/min o Ultra para 100 req/min. /pricing"
}

// Resource Limit Error
{
  error: "Resource limit exceeded",
  code: "RESOURCE_LIMIT_EXCEEDED",
  tier: "plus",
  resource: "activeWorlds",
  current: 5,
  limit: 5,
  upgradeUrl: "/pricing",
  upgradeMessage: "Límite de mundos activos alcanzado (5/5). Actualiza a Ultra para 20 mundos simultáneos. /pricing"
}
```

---

## Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 73
X-RateLimit-Reset: 1672531200
X-RateLimit-Tier: ultra
X-RateLimit-Window: minute
X-Resource-Quota-Current: 420
X-Resource-Quota-Limit: 1000
X-Resource-Quota-Remaining: 580
Retry-After: 45
```

---

## Testing Commands

```bash
# Run tests
npm run test __tests__/lib/usage/tier-rate-limiting.test.ts

# Free tier (10/min)
for i in {1..15}; do curl -X POST /api/agents/[id]/message -H "Authorization: Bearer $TOKEN_FREE"; done

# Plus tier (30/min)
for i in {1..35}; do curl -X POST /api/agents/[id]/message -H "Authorization: Bearer $TOKEN_PLUS"; done

# Ultra tier (100/min)
for i in {1..110}; do curl -X POST /api/agents/[id]/message -H "Authorization: Bearer $TOKEN_ULTRA"; done

# Check Redis cache
redis-cli KEYS "cache:user-plan:*"
redis-cli GET "cache:user-plan:cuid123"
redis-cli TTL "cache:user-plan:cuid123"
```

---

## Resource Types

```typescript
type ResourceType =
  | "messagesPerDay"
  | "activeAgents"
  | "activeWorlds"
  | "charactersInMarketplace"
  | "imageGenerationPerDay"
  | "imageAnalysisPerMonth"
  | "voiceMessagesPerMonth";
```

---

## Feature Flags

```typescript
// Check if user has feature
const limits = getTierLimits(userPlan);

if (!limits.features.nsfwContent) {
  return NextResponse.json({ error: "NSFW content requires Plus or Ultra" }, { status: 403 });
}

if (!limits.features.apiAccess) {
  return NextResponse.json({ error: "API access requires Ultra tier" }, { status: 403 });
}
```

---

## Performance Targets

```
getTierLimits(): < 0.01ms
getCachedUserPlan() (hit): ~5ms
checkTierRateLimit(): ~10ms
checkTierResourceLimit(): ~30ms
Total overhead: ~40ms (✅ < 100ms target)
```

---

## Upgrade Messages by Tier

**Free → Plus/Ultra:**
```
"Límite alcanzado. Actualiza a Plus para [límite] o Ultra para [límite/ilimitado]. /pricing"
```

**Plus → Ultra:**
```
"Límite alcanzado. Actualiza a Ultra para [límite/ilimitado]. /pricing"
```

**Ultra (top tier):**
```
"Límite alcanzado. Por favor espera un momento."
```

---

## Common Patterns

### Check Multiple Resources

```typescript
import { checkMultipleTierLimits } from '@/lib/usage/daily-limits';

const checks = await checkMultipleTierLimits(userId, userPlan, [
  "messagesPerDay",
  "activeAgents",
  "activeWorlds"
]);

if (!checks.allowed) {
  console.log('Violations:', checks.violations);
  return NextResponse.json(
    { error: "Resource limit exceeded", violations: checks.violations },
    { status: 429 }
  );
}
```

### Get Usage Summary

```typescript
import { getTierUsageSummary } from '@/lib/usage/daily-limits';

const summary = await getTierUsageSummary(userId, userPlan);
// {
//   tier: "plus",
//   tierLimits: { ... },
//   usage: {
//     messages: { current: 420, limit: 1000, remaining: 580 },
//     agents: { current: 5, limit: 20, remaining: 15 },
//     worlds: { current: 2, limit: 5, remaining: 3 },
//     ...
//   }
// }
```

### Middleware Helper (Simple)

```typescript
import { withTierRateLimit } from '@/lib/redis/ratelimit';

export const POST = (req: NextRequest) =>
  withTierRateLimit(req, async (user) => {
    // Rate limiting already applied
    const result = await processRequest(user);
    return NextResponse.json(result);
  });
```

---

## Troubleshooting

### Redis Not Working
```typescript
// Check if Redis is configured
import { isRedisConfigured } from '@/lib/redis/config';

if (!isRedisConfigured()) {
  console.warn('Redis not configured - using in-memory fallback');
}
```

### Cache Not Updating
```typescript
// Manually invalidate cache
await invalidateUserPlanCache(userId);

// Verify deletion
const cached = await redis.get(getCacheKey('user-plan', userId));
console.log(cached); // Should be null
```

### Rate Limit Not Working
```bash
# Check Redis keys
redis-cli KEYS "@ratelimit/*"

# Monitor Redis operations
redis-cli MONITOR

# Check logs
grep "Rate limit" logs/api.log
```

---

## Files Reference

```
lib/usage/tier-limits.ts              # Tier definitions
lib/usage/daily-limits.ts             # Resource checks
lib/redis/config.ts                   # Rate limiter config
lib/redis/ratelimit.ts                # Rate limit functions
app/api/agents/[id]/message/route.ts  # Example implementation
__tests__/lib/usage/tier-rate-limiting.test.ts  # Tests
TIER_RATE_LIMITING_GUIDE.md           # Full documentation
TIER_RATE_LIMITING_SUMMARY.md         # Executive summary
TIER_RATE_LIMITING_CHECKLIST.md       # Implementation checklist
```

---

**Quick Links:**
- Full Guide: `TIER_RATE_LIMITING_GUIDE.md`
- Summary: `TIER_RATE_LIMITING_SUMMARY.md`
- Checklist: `TIER_RATE_LIMITING_CHECKLIST.md`
- Tests: `__tests__/lib/usage/tier-rate-limiting.test.ts`

**Status:** ✅ Production Ready
