# Testing Guide: Freemium Model Redesign

**Purpose**: Verify that the new universal access + dynamic limits system works correctly

---

## Pre-Testing Checklist

- [ ] Code compiles without errors
- [ ] Database has characters with different `generationTier` values (free, plus, ultra)
- [ ] Test users exist for each plan (free, plus, ultra)
- [ ] NSFW characters exist for testing age/plan restrictions

---

## Test Scenarios

### 1. Universal Access (Core Feature)

**Goal**: Verify ALL users can access ALL characters regardless of tier

#### Test 1.1: Free User Accesses Ultra Character

**Steps**:
1. Login as free user
2. Navigate to dashboard/marketplace
3. Find an ultra-tier character (should have "Ultra" badge)
4. Click to view character details
5. Start a conversation

**Expected**:
- ✅ Character details load successfully
- ✅ Chat interface opens
- ✅ Can send messages
- ❌ No paywall or "premium only" message
- ✅ May see complexity warning: "This character uses your limit faster"

#### Test 1.2: Free User Accesses All Tiers

**Steps**:
1. Login as free user
2. Send 1 message to:
   - Free tier character
   - Plus tier character
   - Ultra tier character

**Expected**:
- ✅ All conversations work
- ✅ No access restrictions
- ✅ All characters respond

---

### 2. Dynamic Limits (Complexity Multiplier)

**Goal**: Verify that complex characters consume limits faster

#### Test 2.1: Free User + Ultra Character (2x Multiplier)

**Steps**:
1. Login as free user (fresh account with full daily limit)
2. Chat with ultra character
3. Send messages until hitting daily limit
4. Count number of messages sent

**Expected**:
- ✅ Hits limit after ~5 messages (vs 10 with basic character)
- ✅ Limit error includes `characterComplexity: "ultra"` in response
- ✅ Logs show:
  - `actualInputTokens: ~150`
  - `effectiveInputTokens: ~300` (2x multiplier)
  - `complexityMultiplier: 2.0`

#### Test 2.2: Plus User + Ultra Character (1.5x Multiplier)

**Steps**:
1. Login as plus user (fresh daily limit)
2. Chat with ultra character
3. Track limit consumption

**Expected**:
- ✅ Gets ~66 messages/day (vs 100 with basic character)
- ✅ Multiplier: 1.5x (25% discount applied)

#### Test 2.3: Ultra User + Ultra Character (1.0x Multiplier)

**Steps**:
1. Login as ultra user
2. Chat with ultra character
3. Track limit consumption

**Expected**:
- ✅ Gets ~100 messages/day (same as basic character)
- ✅ Multiplier: 1.0x (no complexity penalty)

---

### 3. UI/UX Verification

**Goal**: Verify UI reflects "complexity" not "access restriction"

#### Test 3.1: Filter Bar Labels

**Steps**:
1. Navigate to dashboard
2. Open advanced filters

**Expected**:
- ✅ Label says "Complexity Level" (not "Generation Tier")
- ✅ Shows "(All accessible)" hint
- ✅ Tooltip: "All characters accessible. More complex ones use your daily limit faster."
- ✅ Options say: "Basic (Simple context)", "Advanced (Rich context)", "Ultra (Deep personality)"

#### Test 3.2: Character Cards

**Steps**:
1. Browse marketplace/dashboard
2. Find characters with different tiers

**Expected**:
- ✅ Ultra badge shows (informational)
- ✅ Plus badge shows (informational)
- ❌ NO lock icon
- ❌ NO "Premium only" text
- ✅ Badge indicates quality/complexity only

---

### 4. NSFW Restrictions (Legal Compliance)

**Goal**: Verify NSFW remains restricted to paid plans

#### Test 4.1: Free User Cannot Access NSFW

**Steps**:
1. Login as free user (verified adult)
2. Try to access NSFW character
3. Attempt to enable NSFW mode

**Expected**:
- ❌ NSFW characters may show but content is restricted
- ❌ Cannot enable NSFW mode
- ✅ Sees upgrade prompt: "NSFW requires Plus or Ultra plan"
- ✅ Age verification alone is NOT enough

#### Test 4.2: Minor Cannot Access NSFW (Even with Payment)

**Steps**:
1. Login as plus/ultra user
2. Set `isAdult: false` (or use account with age < 18)
3. Try to access NSFW content

**Expected**:
- ❌ NSFW blocked
- ✅ Message: "Content restricted to 18+"
- ✅ Payment plan doesn't override age restriction

#### Test 4.3: Adult + Paid Plan Can Access NSFW

**Steps**:
1. Login as plus or ultra user
2. Verified adult (`isAdult: true`)
3. Has given NSFW consent
4. Access NSFW character

**Expected**:
- ✅ NSFW content accessible
- ✅ No restrictions
- ✅ Full NSFW experience

---

### 5. Token Tracking & Analytics

**Goal**: Verify tokens are tracked correctly with multipliers

#### Test 5.1: Check Database Logs

**Steps**:
1. Login as free user
2. Send message to ultra character
3. Check database `Usage` table

**Expected**:
```sql
-- Query:
SELECT * FROM "Usage" WHERE "userId" = 'test-free-user' ORDER BY "createdAt" DESC LIMIT 1;

-- Expected metadata:
{
  "characterTier": "ultra",
  "actualInputTokens": 150,
  "actualOutputTokens": 200,
  "effectiveInputTokens": 300,  -- 2x multiplier
  "effectiveOutputTokens": 400,  -- 2x multiplier
  "complexityMultiplier": 2.0
}
```

#### Test 5.2: Check Server Logs

**Steps**:
1. Send message to ultra character as free user
2. Check console/log output

**Expected logs**:
```
[INFO] Token usage tracked with complexity multiplier
{
  userId: "...",
  characterTier: "ultra",
  actualInputTokens: 150,
  effectiveInputTokens: 300,
  complexityMultiplier: 2.0
}
```

---

### 6. Upgrade Messaging

**Goal**: Verify upgrade prompts reflect new value proposition

#### Test 6.1: Limit Hit Message

**Steps**:
1. Login as free user
2. Exhaust daily limit on ultra character
3. Try to send another message

**Expected error response**:
```json
{
  "error": "Daily token limit exceeded",
  "messagesUsedToday": 5,
  "messagesLimitToday": 5,
  "characterComplexity": "ultra",
  "upgradeUrl": "/dashboard/billing"
}
```

#### Test 6.2: Contextual Upgrade Message

**Steps**:
1. Free user loves ultra character
2. Hits limit
3. Check upgrade messaging

**Expected**:
- ✅ Message acknowledges character name
- ✅ Explains 2x faster limit consumption
- ✅ Shows benefits: "With Plus: 66 msgs/day. With Ultra: unlimited"
- ❌ NO mention of "unlock character" (already unlocked)

---

### 7. Edge Cases

#### Test 7.1: Character Without generationTier

**Steps**:
1. Create character without `generationTier` field
2. Try to chat with it

**Expected**:
- ✅ Defaults to 'free' tier
- ✅ 1.0x multiplier
- ✅ No errors

#### Test 7.2: Invalid Tier Value

**Steps**:
1. Manually set `generationTier: "invalid"` in database
2. Chat with character

**Expected**:
- ✅ Falls back to 'free' tier
- ✅ System doesn't crash
- ✅ Logs warning about invalid tier

#### Test 7.3: Switching Between Character Tiers

**Steps**:
1. Free user sends 3 messages to ultra character (uses ~6 messages worth)
2. Switch to free character
3. Send 4 more messages (uses ~4 messages worth)
4. Check total usage: ~10 messages consumed

**Expected**:
- ✅ Hits limit at correct point
- ✅ Limit accounts for different complexity

---

## API Testing (Curl/Postman)

### Test API Endpoint Directly

```bash
# 1. Send message to ultra character as free user
curl -X POST http://localhost:3000/api/agents/{ultra-agent-id}/message \
  -H "Authorization: Bearer {free-user-token}" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello!"}'

# Expected response:
# - Success (200)
# - Message processed
# - Effective tokens tracked (2x multiplier)

# 2. Check response headers
# Look for custom headers (if implemented):
# X-Character-Complexity: ultra
# X-Effective-Tokens-Used: 700
```

---

## Performance Testing

### Test 10: High Load with Mixed Tiers

**Steps**:
1. Create 100 concurrent users
2. 50 chat with free characters
3. 50 chat with ultra characters
4. Measure API response time

**Expected**:
- ✅ No significant performance degradation
- ✅ Complexity calculation adds < 5ms overhead
- ✅ Database queries optimized (no N+1)

---

## Rollback Plan

If critical issues found:

1. **Quick rollback** (emergency):
   ```typescript
   // In dynamic-limits.ts, set all multipliers to 1.0
   export const COMPLEXITY_MULTIPLIERS = {
     free: 1.0,
     plus: 1.0,
     ultra: 1.0,
   };
   ```

2. **Re-enable tier restrictions** (if legal issues):
   - Re-add access checks in API
   - Update UI to show "premium only" again

3. **Gradual rollout**:
   - Deploy to 10% of users first
   - Monitor metrics for 48 hours
   - Scale to 100% if successful

---

## Success Criteria

**Must Pass**:
- [ ] All tier characters accessible to all users
- [ ] Complexity multipliers work correctly
- [ ] NSFW remains premium-only
- [ ] No access errors for free users on ultra characters
- [ ] Token tracking accurate

**Nice to Have**:
- [ ] Upgrade messaging feels natural
- [ ] UI clearly communicates "complexity" not "restriction"
- [ ] Performance impact < 10ms per message

---

## Monitoring After Launch

### Key Metrics (First 7 Days)

1. **Conversion Metrics**:
   - Free users who try ultra characters
   - % who upgrade within 7 days
   - Time from "first ultra character" to upgrade

2. **Engagement Metrics**:
   - Messages/day per character tier
   - Clone count by tier
   - Share rate by tier

3. **Error Metrics**:
   - 403/401 errors (should decrease)
   - 429 (rate limit) errors by tier
   - User complaints about access

### Alerts to Set Up

```
- Alert: "Free user blocked from character" → Should not happen
- Alert: "Invalid generationTier value" → Data issue
- Alert: "NSFW accessed by free user" → Security issue
- Alert: "Complexity multiplier > 3.0" → Bug in calculation
```

---

## Automated Tests

### Unit Tests

```typescript
// __tests__/lib/usage/dynamic-limits.test.ts

describe('Dynamic Limits', () => {
  it('should calculate 2x multiplier for free + ultra', () => {
    const result = calculateEffectiveTokens(350, 'free', 'ultra');
    expect(result).toBe(700); // 2x
  });

  it('should calculate 1.5x multiplier for plus + ultra', () => {
    const result = calculateEffectiveTokens(350, 'plus', 'ultra');
    expect(result).toBe(525); // 1.5x
  });

  it('should have no multiplier for ultra + ultra', () => {
    const result = calculateEffectiveTokens(350, 'ultra', 'ultra');
    expect(result).toBe(350); // 1.0x (no penalty)
  });
});
```

### Integration Tests

```typescript
// __tests__/api/message.test.ts

describe('POST /api/agents/[id]/message', () => {
  it('should allow free user to message ultra character', async () => {
    const response = await request(app)
      .post(`/api/agents/${ultraCharacterId}/message`)
      .set('Authorization', `Bearer ${freeUserToken}`)
      .send({ content: 'Hello!' });

    expect(response.status).toBe(200);
    expect(response.body.characterComplexity).toBe('ultra');
  });

  it('should apply 2x multiplier to free user on ultra character', async () => {
    // Send message
    await sendMessage(freeUser, ultraCharacter, 'Hi');

    // Check usage tracking
    const usage = await getLatestUsage(freeUser.id);
    expect(usage.metadata.complexityMultiplier).toBe(2.0);
    expect(usage.metadata.effectiveInputTokens).toBeGreaterThan(
      usage.metadata.actualInputTokens
    );
  });
});
```

---

## Conclusion

This testing guide ensures:
1. ✅ Universal access works (no paywalls on characters)
2. ✅ Dynamic limits incentivize upgrades naturally
3. ✅ NSFW remains protected for legal compliance
4. ✅ User experience is smooth and intuitive

Run all tests before deploying to production. Monitor metrics closely for first week.
