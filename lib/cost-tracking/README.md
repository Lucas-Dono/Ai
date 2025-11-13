# Cost Tracking Module

Sistema de tracking y análisis de costos de operaciones AI/LLM.

## Quick Start

```typescript
import { trackLLMCall, trackEmbedding } from './tracker';
import { estimateTokens } from './calculator';

// Track LLM call
await trackLLMCall({
  userId,
  agentId,
  provider: 'google',
  model: 'gemini-2.5-flash-lite',
  inputTokens: estimateTokens(prompt),
  outputTokens: estimateTokens(response),
});

// Track embedding
await trackEmbedding({
  userId,
  model: 'qwen3-embedding',
  tokens: estimateTokens(text),
});
```

## Files

### `calculator.ts`
Cálculo de costos basado en pricing actualizado.

**Functions:**
- `calculateLLMCost(model, inputTokens, outputTokens)` - Calcula costo de LLM
- `calculateEmbeddingCost(model, tokens)` - Calcula costo de embedding
- `calculateImageCost(model, resolution)` - Calcula costo de imagen
- `calculatePaymentFee(gateway, amount)` - Calcula fee de payment
- `estimateTokens(text)` - Estima tokens desde texto
- `formatCost(cost)` - Formatea como USD

**Pricing Tables:**
- `LLM_PRICING` - 20+ modelos LLM
- `EMBEDDING_PRICING` - 4 modelos embedding
- `IMAGE_PRICING` - 4 modelos imagen
- `PAYMENT_FEES` - Stripe, MercadoPago

### `tracker.ts`
Tracking asíncrono con batch processing.

**Tracking Functions:**
- `trackLLMCall(params)` - Trackea llamada LLM
- `trackEmbedding(params)` - Trackea embedding
- `trackImageGeneration(params)` - Trackea imagen
- `trackPaymentFee(params)` - Trackea payment fee

**Analytics Functions:**
- `getCostSummary(userId?, startDate?, endDate?)` - Resumen de costos
- `getDailyCosts(userId?, days)` - Costos diarios
- `getTopUsers(limit, startDate?, endDate?)` - Top usuarios
- `getCostProjection(userId?)` - Proyección mensual

**Utility:**
- `forceFlush()` - Flush manual del buffer

### `integration-example.ts`
Ejemplos de integración para todos los casos de uso.

## Architecture

### Batch Processing
- Buffer en memoria: 10 entradas
- Auto-flush: cada 5 segundos
- Manual flush: en shutdown

### Async Pattern
```typescript
// Fire and forget (no await)
trackLLMCall({...}).catch(err => log.error(err));

// Or with error handling
await trackLLMCall({...}).catch(err => {
  console.error('Failed to track:', err);
});
```

### Database Schema
```prisma
model CostTracking {
  id           String   @id @default(cuid())
  userId       String?
  agentId      String?
  worldId      String?
  type         String   // llm, embedding, image, payment
  provider     String   // google, openrouter, qwen, etc
  model        String?
  inputTokens  Int?
  outputTokens Int?
  cost         Float    // USD
  metadata     Json?
  createdAt    DateTime @default(now())

  @@index([userId, type, createdAt])
}
```

## Usage Examples

### 1. Message Service

```typescript
// After LLM generation
const inputTokens = estimateTokens(systemPrompt + userMessage);
const outputTokens = estimateTokens(response);

await trackLLMCall({
  userId,
  agentId,
  provider: 'google',
  model: 'gemini-2.5-flash-lite',
  inputTokens,
  outputTokens,
  metadata: { stage: 'initial-generation' },
});
```

### 2. Embeddings

```typescript
// After generating embedding
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

### 3. Image Generation

```typescript
// After generating image
await trackImageGeneration({
  userId,
  agentId,
  provider: 'aihorde',
  model: 'stable-diffusion-xl',
  resolution: '512x512',
  cost: 0, // Free provider
});
```

### 4. Payment Fee

```typescript
// After payment processed
await trackPaymentFee({
  userId,
  gateway: 'mercadopago',
  amount: 10.00,
  // fee calculated automatically
});
```

## API Reference

### trackLLMCall(params)

```typescript
interface LLMCallParams {
  userId?: string;
  agentId?: string;
  worldId?: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost?: number; // Optional, will calculate if not provided
  metadata?: Record<string, any>;
}
```

### trackEmbedding(params)

```typescript
interface EmbeddingParams {
  userId?: string;
  agentId?: string;
  worldId?: string;
  provider?: string;
  model: string;
  tokens: number;
  cost?: number; // Optional
  metadata?: Record<string, any>;
}
```

### trackImageGeneration(params)

```typescript
interface ImageParams {
  userId?: string;
  agentId?: string;
  worldId?: string;
  provider?: string;
  model: string;
  resolution?: string;
  cost?: number; // Optional
  metadata?: Record<string, any>;
}
```

### trackPaymentFee(params)

```typescript
interface PaymentParams {
  userId?: string;
  gateway: 'stripe' | 'mercadopago';
  amount: number;
  fee?: number; // Optional
  metadata?: Record<string, any>;
}
```

## Performance

### Buffer Size
- Default: 10 entries
- Configurable: Change `BUFFER_SIZE` constant

### Flush Interval
- Default: 5 seconds
- Configurable: Change `FLUSH_INTERVAL` constant

### Overhead
- Memory: ~1KB per entry in buffer
- CPU: Negligible (async)
- DB: 1 query per 10 operations

## Error Handling

```typescript
// Tracking never throws
await trackLLMCall({...}); // Safe, logs errors

// But you can catch errors
await trackLLMCall({...}).catch(err => {
  // Handle error (optional)
  console.error('Tracking failed:', err);
});

// Or fire-and-forget
trackLLMCall({...}).catch(err =>
  log.warn('Tracking error:', err)
);
```

## Testing

```bash
# Run test script
npx tsx scripts/test-cost-tracking.ts

# Manual testing
import { trackLLMCall } from '@/lib/cost-tracking/tracker';

await trackLLMCall({
  userId: 'test-user',
  provider: 'google',
  model: 'gemini-2.5-flash-lite',
  inputTokens: 100,
  outputTokens: 50,
});

// Wait for flush
await new Promise(resolve => setTimeout(resolve, 6000));

// Check database
// SELECT * FROM "CostTracking" ORDER BY "createdAt" DESC LIMIT 10;
```

## Maintenance

### Update Pricing
Edit `calculator.ts`:
```typescript
export const LLM_PRICING = {
  'new-model': {
    input: 0.5,
    output: 1.5,
  },
  // ...
};
```

### Monitor Buffer
```typescript
// In tracker.ts
console.log('Buffer size:', costBuffer.length);
```

### Force Flush
```typescript
import { forceFlush } from './tracker';
await forceFlush();
```

## Best Practices

1. **Always estimate tokens** if API doesn't provide
2. **Use async tracking** (fire-and-forget)
3. **Add meaningful metadata** for debugging
4. **Don't await** unless you need to (reduces latency)
5. **Check logs** for tracking errors
6. **Update pricing** when models change

## Troubleshooting

### Issue: No data in database
- Check buffer size (may not be full yet)
- Wait 5+ seconds for auto-flush
- Call `forceFlush()` manually
- Check server logs for errors

### Issue: Costs seem wrong
- Verify model name matches pricing table
- Check token estimation accuracy
- Update calculator.ts if pricing changed
- Compare with actual API bills

### Issue: Performance degradation
- Verify async pattern (no await)
- Check buffer size (should be 10)
- Monitor DB query time
- Review indexes on CostTracking table

## Support

- Full docs: `/COST_TRACKING_IMPLEMENTATION.md`
- Quick start: `/COST_TRACKING_QUICK_START.md`
- Examples: `./integration-example.ts`
- Test script: `/scripts/test-cost-tracking.ts`

---

**Version:** 1.0.0

**Status:** Production-ready

**License:** Internal use
