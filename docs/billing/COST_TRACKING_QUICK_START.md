# Cost Tracking - Quick Start Guide

## 1. Setup (One-time)

### Migrate Database

```bash
npx prisma db push
```

This will create the `CostTracking` table in your database.

## 2. Access Dashboard

Open your browser and navigate to:

```
http://localhost:3000/dashboard/costs
```

You'll see:
- Total costs
- Daily/monthly breakdown
- Cost by type (LLM, embeddings, images)
- Cost by provider
- Top users
- Projections

## 3. Use the API

### Get Cost Summary

```bash
curl http://localhost:3000/api/admin/costs?view=summary
```

### Get Daily Costs (Last 30 Days)

```bash
curl http://localhost:3000/api/admin/costs?view=daily&days=30
```

### Get Top Users

```bash
curl http://localhost:3000/api/admin/costs?view=top-users
```

### Get Cost Projection

```bash
curl http://localhost:3000/api/admin/costs?view=projection
```

## 4. Integration in Your Code

### Track LLM Call

```typescript
import { trackLLMCall } from '@/lib/cost-tracking/tracker';
import { estimateTokens } from '@/lib/cost-tracking/calculator';

// After LLM call
const inputTokens = estimateTokens(prompt);
const outputTokens = estimateTokens(response);

await trackLLMCall({
  userId,
  agentId,
  provider: 'google',
  model: 'gemini-2.5-flash-lite',
  inputTokens,
  outputTokens,
  metadata: { /* optional */ },
});
```

### Track Embedding

```typescript
import { trackEmbedding } from '@/lib/cost-tracking/tracker';
import { estimateTokens } from '@/lib/cost-tracking/calculator';

const tokens = estimateTokens(text);
await trackEmbedding({
  userId,
  agentId,
  provider: 'qwen-local',
  model: 'qwen3-embedding-0.6b-q8',
  tokens,
  cost: 0, // Local model
});
```

### Track Image Generation

```typescript
import { trackImageGeneration } from '@/lib/cost-tracking/tracker';

await trackImageGeneration({
  userId,
  agentId,
  provider: 'aihorde',
  model: 'stable-diffusion-xl',
  resolution: '512x512',
  cost: 0, // Free provider
});
```

### Track Payment Fee

```typescript
import { trackPaymentFee } from '@/lib/cost-tracking/tracker';

await trackPaymentFee({
  userId,
  gateway: 'mercadopago',
  amount: 10.00,
  // fee is calculated automatically
});
```

## 5. Test the System

```bash
npx tsx scripts/test-cost-tracking.ts
```

This will:
1. Generate sample tracking data
2. Test all tracking functions
3. Display cost summaries
4. Show projections

## 6. Monitor Costs

### Daily Checks

1. Visit dashboard
2. Check for cost spikes
3. Review top users
4. Monitor alerts

### Weekly Analysis

1. Review cost trends
2. Analyze efficiency
3. Optimize high-cost operations

### Monthly Review

1. Compare actual vs projected
2. Update budget
3. Adjust pricing if needed

## 7. Alerts

The system automatically generates alerts for:

- ⚠️ Daily cost > $50
- ⚠️ Monthly projection > $1000
- ⚠️ Cost trend increasing > 20%
- ℹ️ Users with cost > $10/day

## 8. Current Pricing (2025)

### LLM Models
- **Gemini 2.5 Flash-Lite:** $0.40/1M tokens (our current model)
- **Claude 3.5 Sonnet:** $3/$15 per 1M (input/output)
- **GPT-4 Turbo:** $10/$30 per 1M
- **Qwen 2.5 72B:** $0.18/$0.54 per 1M (cheapest)

### Embeddings
- **Qwen3 (Local):** $0 (we use this!)
- **OpenAI Ada:** $0.10 per 1M

### Images
- **AI Horde:** $0 (we use this!)
- **Stable Diffusion XL:** $0.002-$0.004
- **DALL-E 3:** $0.04-$0.08

## 9. Performance Features

- ✅ Batch inserts (10 entries at a time)
- ✅ Auto-flush every 5 seconds
- ✅ Async tracking (non-blocking)
- ✅ Graceful shutdown handling
- ✅ Error logging (doesn't throw)

## 10. Common Issues

### Issue: "Table CostTracking does not exist"

**Solution:**
```bash
npx prisma db push
```

### Issue: "Dashboard shows no data"

**Solution:**
1. Check if tracking is integrated in your endpoints
2. Run test script: `npx tsx scripts/test-cost-tracking.ts`
3. Wait 5-10 seconds for buffer to flush
4. Refresh dashboard

### Issue: "Costs seem inaccurate"

**Solution:**
1. Verify model name matches pricing table
2. Check token estimation (use actual tokens if available)
3. Update pricing in `calculator.ts` if models changed

## 11. Next Steps

1. ✅ Migrate database
2. ✅ View dashboard
3. ✅ Run test script
4. ✅ Integrate in endpoints (already done for main flows)
5. 📧 Setup email alerts (future)
6. 💰 Set budget limits (future)
7. 📊 Add more analytics (future)

## 12. Support

- 📖 Full documentation: `COST_TRACKING_IMPLEMENTATION.md`
- 💡 Integration examples: `lib/cost-tracking/integration-example.ts`
- 🧪 Test script: `scripts/test-cost-tracking.ts`

---

**Status:** ✅ Ready to use

**Version:** 1.0.0
