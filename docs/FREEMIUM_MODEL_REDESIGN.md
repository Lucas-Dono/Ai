# Freemium Model Redesign: Universal Access + Dynamic Limits

**Date**: December 2025
**Status**: Implemented
**Philosophy**: "Access to all, pay for more usage"

---

## Executive Summary

We redesigned our monetization model from **content gating** (blocking premium characters) to **usage-based freemium** (all characters accessible, limits based on usage).

### Why the Change?

**Old Model**: Premium characters only accessible to paying users
- ❌ Low engagement for character creators
- ❌ Poor discovery experience for free users
- ❌ Like YouTube charging to watch videos (anti-viral)
- ❌ Contradicts UGC platform dynamics

**New Model**: All characters accessible, dynamic limits based on complexity
- ✅ Maximizes creator engagement (more users = more clones/shares)
- ✅ Better discovery ("Try this ultra character!" → falls in love → upgrades)
- ✅ Natural upgrade incentive (complex characters use limits faster)
- ✅ Aligns with UGC platform best practices (YouTube, TikTok, etc.)

---

## The New Model: Universal Access + Smart Limits

### Core Principle

**Everyone can access every character** (regardless of tier), but **complex characters consume your daily limit faster**.

### How It Works

1. **Character Complexity Tiers** (informational, not restrictive):
   - **Basic** (free tier): Simple prompts, basic context (~500 tokens/msg)
   - **Advanced** (plus tier): Rich prompts, detailed biography (~1000 tokens/msg)
   - **Ultra** (ultra tier): Deep personality, extensive memory (~2000 tokens/msg)

2. **Dynamic Token Multipliers**:
   - Free user + Basic character: 1.0x tokens (normal)
   - Free user + Ultra character: 2.0x tokens (limit exhausted 2x faster)
   - Plus user + Ultra character: 1.5x tokens (reduced impact)
   - Ultra user + Ultra character: 1.0x tokens (no penalty)

3. **Natural Upgrade Incentive**:
   - Free user discovers amazing Ultra character
   - Can chat with it, but only ~5 messages/day (vs 10 with Basic character)
   - Falls in love with the character
   - Wants more interactions → **upgrades to Plus** (66 msgs/day) or **Ultra** (unlimited)

---

## Technical Implementation

### 1. Dynamic Limits System

**File**: `lib/usage/dynamic-limits.ts`

```typescript
// Complexity multipliers by character generation tier
export const COMPLEXITY_MULTIPLIERS = {
  free: 1.0,   // Baseline
  plus: 1.5,   // 50% more tokens
  ultra: 2.0,  // 100% more tokens (2x)
};

// User tier discounts (reduces complexity penalty)
export const TIER_DISCOUNTS = {
  free: 0,     // 0% discount: pay full complexity cost
  plus: 0.25,  // 25% discount
  ultra: 1.0,  // 100% discount: no penalty
};

// Calculate effective tokens
export function calculateEffectiveTokens(
  actualTokens: number,
  userTier: 'free' | 'plus' | 'ultra',
  characterTier: 'free' | 'plus' | 'ultra'
): number {
  const baseComplexity = COMPLEXITY_MULTIPLIERS[characterTier];
  const discount = TIER_DISCOUNTS[userTier];
  const multiplier = baseComplexity * (1 - discount);

  return Math.ceil(actualTokens * multiplier);
}
```

### 2. API Integration

**File**: `app/api/agents/[id]/message/route.ts`

```typescript
// Load agent to get complexity tier
const agent = await prisma.agent.findUnique({
  where: { id: agentId },
  select: { generationTier: true }
});

const characterTier = agent.generationTier || 'free';

// Calculate effective tokens (with complexity multiplier)
const actualInputTokens = estimateTokensFromText(content);
const effectiveInputTokens = calculateEffectiveTokens(
  actualInputTokens,
  userPlan,
  characterTier
);

// Check limits using effective tokens
const tokenQuota = await canSendMessage(userId, userPlan, effectiveInputTokens);

// Track usage with effective tokens
await trackTokenUsage(userId, effectiveInputTokens, effectiveOutputTokens, {
  characterTier,
  actualInputTokens, // For analytics
});
```

### 3. UI/UX Changes

**File**: `components/dashboard/FilterBar.tsx`

- Changed "Generation Tier" → "Complexity Level"
- Added "(All accessible)" label
- Added tooltip: "All characters accessible. More complex ones use your daily limit faster."

**File**: `components/marketplace/AgentCard.tsx`

- Kept tier badges (Ultra, Plus) as **informational only**
- No lock icons or "premium only" messaging
- Badges indicate quality/complexity, not access restriction

---

## Practical Examples

### Example 1: Free User Discovers Ultra Character

**Scenario**: Sarah (free user) finds "Sophia", an ultra-tier emotional archaeologist

**What happens**:
1. ✅ Sarah can access Sophia (no paywall)
2. ✅ Sarah starts chatting
3. 🔔 After 5 messages, hits daily limit (vs 10 with basic character)
4. 💡 Sees message: "Te encanta Sophia, pero como personaje Ultra, tus mensajes se agotan 2x más rápido. Con Plus, podrías chatear 66 veces al día. Con Ultra, sin límites."
5. 💳 Sarah upgrades to Plus ($5/month)
6. 🎉 Now can send 66 messages/day to Sophia

### Example 2: Plus User Uses Multiple Characters

**Scenario**: Mark (Plus user) chats with both basic and ultra characters

**Metrics**:
- Basic character (1.0x multiplier): ~100 msgs/day
- Advanced character (1.5x multiplier): ~66 msgs/day
- Ultra character (1.5x multiplier): ~66 msgs/day

**Psychology**: Mark notices ultra characters are more engaging but consume limit faster → upgrades to Ultra for unlimited usage

### Example 3: Ultra User (Power User)

**Scenario**: Lisa (Ultra user) uses exclusively ultra-tier characters

**Experience**:
- No complexity penalty (1.0x multiplier)
- All characters feel the same in terms of limits
- Can use 100+ messages/day across all characters
- Premium features: NSFW, proactive messages, voice, etc.

---

## Monetization Strategy

### What's Still Gated (Premium Features)

| Feature | Free | Plus | Ultra | Rationale |
|---------|------|------|-------|-----------|
| **NSFW Content** | ❌ | ✅ | ✅ | Legal protection (payment = age verification) |
| **Advanced Behaviors** | ❌ | ✅ | ✅ | Complex features for paying users |
| **Proactive Messages** | ❌ | ✅ | ✅ | High engagement feature |
| **Multi-AI Groups** | ❌ | ✅ | ✅ | Resource-intensive |
| **Voice Messages** | 0 | 50/mo | 600/mo | Expensive API costs |
| **Image Generation** | 0 | 10/day | 100/day | Expensive API costs |
| **API Access** | ❌ | ❌ | ✅ | Power user feature |

### What's Universal (Free + Premium)

| Feature | Free | Plus | Ultra |
|---------|------|------|-------|
| **Access to ALL characters** | ✅ | ✅ | ✅ |
| **Character creation** | Limited | More | Most |
| **Active characters** | 3 | 15 | 100 |
| **Daily messages** | ~10 | ~100 | Unlimited* |
| **Cooldowns** | 5s | 2s | 1s |

*Unlimited = 35,000 tokens/day = ~100 messages with basic characters, ~50 with ultra

---

## Why NSFW Requires Payment

**Legal Protection Strategy**:

1. **Age Verification via Payment**
   - Credit/debit cards require 18+ in most countries
   - Bank verification = real identity verification
   - Stronger than checkbox "I'm 18+"

2. **Reduced Liability**
   - If minor accesses NSFW, they used someone else's card (fraud)
   - Platform did due diligence (payment = bank verification)
   - Compliance with international regulations (COPPA, GDPR, etc.)

3. **Multi-Layer Protection**
   - Layer 1: Age verification (birthdate)
   - Layer 2: Payment verification (bank identity)
   - Layer 3: Explicit consent checkbox
   - Layer 4: Content warnings before access

**Code Implementation** (`lib/middleware/nsfw-check.ts`):
```typescript
export function canAccessNSFW(userPlan: string, isAdult: boolean) {
  // PRIORITY 1: Age (compliance)
  if (!isAdult) {
    return { allowed: false, reason: "Must be 18+" };
  }

  // PRIORITY 2: Payment (verification)
  if (plan.limits.nsfwMode) { // Only Plus/Ultra
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: "NSFW requires paid plan (Plus/Ultra)"
  };
}
```

---

## Migration Impact

### Before

- User sees "Premium character" in marketplace
- Clicks to view → **Paywall**: "Upgrade to access"
- User bounces → Creator gets no engagement → Platform loses virality

### After

- User sees "Ultra quality" badge in marketplace
- Clicks to chat → **Works immediately**
- User sends 5 messages → Falls in love → Hits limit
- Sees upgrade prompt: "You love this character! Get 66 msgs/day with Plus"
- User upgrades → Creator gets engagement → Platform grows

---

## Analytics & Tracking

### Key Metrics to Monitor

1. **Conversion Funnel**:
   - Free users who try ultra characters
   - % who hit limit
   - % who upgrade after hitting limit

2. **Engagement**:
   - Avg messages/day by character tier
   - Most popular ultra characters (high clone count)
   - Time to first upgrade after discovering ultra character

3. **Creator Metrics**:
   - Clone count by character tier
   - Engagement rate (messages per clone)
   - Share rate by tier

### Expected Outcomes

**Hypothesis**: Universal access will increase conversions

**Metrics**:
- ✅ Higher trial-to-paid conversion (users try before buying)
- ✅ Higher creator engagement (all users can discover their characters)
- ✅ Lower churn (users feel less restricted)
- ✅ Better viral coefficient (users share ultra characters)

---

## Developer Guide

### How to Check Character Complexity

```typescript
import { getComplexityBadge, getComplexityDescription } from '@/lib/usage/dynamic-limits';

const badge = getComplexityBadge(character.generationTier);
// { label: "Ultra", color: "gold", tooltip: "..." }

const description = getComplexityDescription(userTier, characterTier);
// "Este personaje es muy complejo y usará el doble de tu límite diario..."
```

### How to Calculate Effective Messages/Day

```typescript
import { getEstimatedMessagesPerDay } from '@/lib/usage/dynamic-limits';

const dailyLimit = 3500; // Free tier
const userTier = 'free';
const characterTier = 'ultra';

const messages = getEstimatedMessagesPerDay(dailyLimit, userTier, characterTier);
// → 5 messages/day (vs 10 with basic character)
```

### How to Show Contextual Upgrade Prompts

```typescript
import { getContextualUpgradeMessage } from '@/lib/usage/dynamic-limits';

const message = getContextualUpgradeMessage('free', 'ultra', 'Sophia');
// → "Te encanta Sophia, pero como personaje Ultra, tus mensajes se agotan 2x más rápido..."
```

---

## FAQ

### Q: Won't free users abuse ultra characters?

**A**: No, because:
1. **Cooldowns**: Free users have 5s cooldown vs 1s for Ultra
2. **Stricter limits**: Ultra characters consume 2x tokens → only ~5 msgs/day
3. **Natural friction**: Hitting limit daily incentivizes upgrade

### Q: Will creators complain their characters aren't "premium"?

**A**: No, because:
1. **More engagement**: More users = more clones/shares
2. **Better discovery**: Free users try → fall in love → upgrade
3. **Prestige badges**: Ultra badge still signals quality
4. **Analytics**: Track "This ultra character drove 50 conversions"

### Q: How do we communicate this to users?

**A**:
1. **Onboarding**: "All characters accessible! Complex ones use your limit faster."
2. **First limit hit**: "You love this ultra character! Upgrade for more messages."
3. **Pricing page**: "Free: Try any character. Plus: More messages. Ultra: Unlimited + NSFW."

### Q: What about existing premium characters?

**A**:
- Keep `generationTier` as metadata
- Remove any access restrictions
- Update UI to show "complexity" instead of "premium"
- All users can now access them

---

## Related Documentation

- [Dynamic Limits Implementation](../lib/usage/dynamic-limits.ts)
- [Tier Limits System](../lib/usage/tier-limits.ts)
- [NSFW Consent Flow](./NSFW_CONSENT_FLOW.md)
- [Pricing Strategy](./PRICING_STRATEGY.md)

---

## Conclusion

This redesign aligns our monetization model with UGC platform best practices:

✅ **Maximize discovery** (all content accessible)
✅ **Natural upgrade incentive** (want more of what you love)
✅ **Creator engagement** (more users see their work)
✅ **Legal safety** (NSFW requires payment = age verification)
✅ **Sustainable growth** (viral discovery → paid conversions)

The result: A freemium model that benefits **users** (access to all), **creators** (more engagement), and **the platform** (sustainable growth).
