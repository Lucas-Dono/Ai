# Current Cost Analysis - Creador de Inteligencias

## Current Stack & Costs

### LLM Provider: Google Gemini 2.5

#### Models Used
1. **gemini-2.5-flash-lite** (Primary)
   - Use case: Message generation, emotional analysis
   - Pricing: $0.40 per 1M tokens (combined input/output)
   - Frequency: ~95% of all LLM calls

2. **gemini-2.5-flash** (Profile Generation)
   - Use case: One-time agent profile generation
   - Pricing: $2.50 per 1M tokens (combined input/output)
   - Frequency: Once per agent creation

### Embeddings: Qwen3-0.6B (Local)
- Model: Qwen3-Embedding-0.6B-Q8 GGUF
- Pricing: **$0** (local model, 639MB)
- Use case: Selective message storage
- Saves: ~$0.02 per 1M tokens vs API

### Image Generation: AI Horde + FastSD

1. **AI Horde** (Primary)
   - Pricing: **$0** (free, community-powered)
   - Quality: High (Stable Diffusion XL)
   - Speed: ~30-60 seconds per image

2. **FastSD Local** (Fallback)
   - Pricing: **$0** (local CPU model)
   - Quality: Good (Stable Diffusion)
   - Speed: ~5-10 minutes per image

### Storage: Cloudflare R2
- Pricing: $0.015 per GB/month + $0.36 per million requests
- Use case: Store generated images
- Cost: Minimal (~$1-5/month for typical usage)

## Cost Breakdown per Operation

### Message Exchange (1 conversation turn)

| Component | Tokens | Cost |
|-----------|--------|------|
| User input | ~150 | $0.00006 |
| System prompt | ~200 | $0.00008 |
| Conversation history (avg 3 msgs) | ~450 | $0.00018 |
| Total input | ~800 | $0.00032 |
| AI response | ~200 | $0.00008 |
| **Total per message** | **~1,000** | **$0.0004** |

**Cost: $0.0004 per message = 2,500 messages per $1**

### Advanced Features

| Feature | Extra Tokens | Extra Cost |
|---------|-------------|------------|
| Knowledge expansion | +500-1,000 | +$0.0002-0.0004 |
| Memory search (SEARCH command) | +300-500 | +$0.00012-0.0002 |
| Emotional analysis | Included | $0 |
| Behavior orchestration | Included | $0 |

### Agent Profile Generation (One-time)

| Component | Tokens | Cost |
|-----------|--------|------|
| Input prompt (character details) | ~500 | $0.00125 |
| Generated profile | ~2,000 | $0.005 |
| **Total per agent** | **~2,500** | **$0.00625** |

**Cost: ~$0.006 per agent profile = 160 profiles per $1**

### Visual Expression Generation

| Component | Cost |
|-----------|------|
| Image generation (AI Horde) | $0 |
| Image storage (R2) | ~$0.00001 |
| **Total per image** | **~$0.00001** |

**Cost: ~$0.00001 per image = 100,000 images per $1**

### Embeddings (Selective Storage)

Only important messages are embedded:
- Frequency: ~10% of messages
- Cost per embedding: $0 (local model)
- Saves vs API: $0.0002 per 1,000 messages

## Monthly Cost Projections

### Scenario 1: Small Scale (1,000 users)
- Avg 10 messages/user/month = 10,000 messages
- Avg 2 agents/user (one-time) = 2,000 profiles
- Avg 5 images/user/month = 5,000 images

| Component | Calculation | Monthly Cost |
|-----------|-------------|--------------|
| Messages | 10,000 × $0.0004 | $4.00 |
| Knowledge expansions (20%) | 2,000 × $0.0003 | $0.60 |
| Memory searches (10%) | 1,000 × $0.00016 | $0.16 |
| Agent profiles | 2,000 × $0.006 | $12.00 |
| Images | 5,000 × $0.00001 | $0.05 |
| Storage | | $2.00 |
| **Total** | | **$18.81** |

**Per-user cost: $0.019/month**

### Scenario 2: Medium Scale (10,000 users)
- Avg 20 messages/user/month = 200,000 messages
- Avg 2 agents/user (one-time) = 20,000 profiles
- Avg 8 images/user/month = 80,000 images

| Component | Calculation | Monthly Cost |
|-----------|-------------|--------------|
| Messages | 200,000 × $0.0004 | $80.00 |
| Knowledge expansions (20%) | 40,000 × $0.0003 | $12.00 |
| Memory searches (10%) | 20,000 × $0.00016 | $3.20 |
| Agent profiles | 20,000 × $0.006 | $120.00 |
| Images | 80,000 × $0.00001 | $0.80 |
| Storage | | $10.00 |
| **Total** | | **$226.00** |

**Per-user cost: $0.023/month**

### Scenario 3: Large Scale (100,000 users)
- Avg 30 messages/user/month = 3,000,000 messages
- Avg 2 agents/user (one-time) = 200,000 profiles
- Avg 10 images/user/month = 1,000,000 images

| Component | Calculation | Monthly Cost |
|-----------|-------------|--------------|
| Messages | 3M × $0.0004 | $1,200.00 |
| Knowledge expansions (20%) | 600K × $0.0003 | $180.00 |
| Memory searches (10%) | 300K × $0.00016 | $48.00 |
| Agent profiles | 200K × $0.006 | $1,200.00 |
| Images | 1M × $0.00001 | $10.00 |
| Storage | | $50.00 |
| **Total** | | **$2,688.00** |

**Per-user cost: $0.027/month**

## Cost Comparison: Alternatives

### If Using Claude 3.5 Sonnet Instead of Gemini

| Scenario | Gemini Cost | Claude Cost | Difference |
|----------|-------------|-------------|------------|
| Small (1K users) | $18.81 | $150.00 | +698% |
| Medium (10K users) | $226.00 | $1,800.00 | +697% |
| Large (100K users) | $2,688.00 | $21,600.00 | +703% |

**Gemini saves ~87% vs Claude** for our use case.

### If Using OpenAI Embeddings Instead of Local

| Scenario | Local Qwen | OpenAI Ada | Savings |
|----------|------------|------------|---------|
| Small (1K users) | $0 | $1.00 | $1.00 |
| Medium (10K users) | $0 | $20.00 | $20.00 |
| Large (100K users) | $0 | $300.00 | $300.00 |

**Local embeddings save 100%** vs API.

### If Using DALL-E Instead of AI Horde

| Scenario | AI Horde | DALL-E 3 | Savings |
|----------|----------|----------|---------|
| Small (1K users) | $0.05 | $200.00 | $199.95 |
| Medium (10K users) | $0.80 | $3,200.00 | $3,199.20 |
| Large (100K users) | $10.00 | $40,000.00 | $39,990.00 |

**AI Horde saves ~99.9%** vs DALL-E.

## Revenue Targets per Plan

To be profitable at different scales:

### Free Plan
- Max messages: 100/month
- Max agents: 2
- Max images: 10
- Cost: $0.05/user/month
- Need: Ads or conversion to paid

### Plus Plan ($9.99/month)
- Max messages: 1,000/month
- Max agents: 10
- Max images: 100
- Cost: $0.50/user/month
- **Margin: $9.49 (95%)**

### Ultra Plan ($24.99/month)
- Unlimited messages
- Unlimited agents
- Unlimited images
- Avg cost: $1.50/user/month (assuming 5,000 msgs)
- **Margin: $23.49 (94%)**

## Cost Optimization Strategies

### Already Implemented ✅
1. **Gemini Flash-Lite** instead of Claude/GPT-4 (-87% cost)
2. **Local Qwen embeddings** instead of API (-100% cost)
3. **AI Horde** for images instead of DALL-E (-99.9% cost)
4. **Selective embedding storage** (only 10% of messages)
5. **Visual expression caching** (generate once, reuse many times)
6. **Batch processing** in cost tracker (efficiency)

### Future Optimizations 🔮
1. **Smart prompt compression** (reduce input tokens by 20-30%)
2. **Response streaming cutoff** (stop generation early when appropriate)
3. **Context window optimization** (smarter history selection)
4. **Model switching** (use lighter models when appropriate)
5. **User-based throttling** (rate limits for free users)
6. **Caching LLM responses** (for common queries)

## Break-even Analysis

### Plus Plan ($9.99/month)
- Cost per user: $0.50
- Revenue per user: $9.99
- Margin: $9.49
- **Break-even: 1 user** ✅

### Ultra Plan ($24.99/month)
- Cost per user: $1.50 (avg)
- Revenue per user: $24.99
- Margin: $23.49
- **Break-even: 1 user** ✅

### Free Plan (Ad-supported)
- Cost per user: $0.05
- Need: $0.05+ from ads/conversions
- **Break-even: $0.05 CPM or 0.5% conversion to paid**

## Risk Analysis

### Cost Spike Scenarios

| Scenario | Impact | Mitigation |
|----------|--------|------------|
| User abuses unlimited (10K+ msgs/day) | +$12/day | Rate limiting + alerts |
| API price increase (50%) | +50% costs | Multi-provider fallback |
| Viral growth (10x users overnight) | 10x costs | Budget alerts + throttling |
| DDoS attack on API | Massive spike | Rate limiting + CAPTCHA |

### Monitoring Thresholds

Current alert system triggers at:
- Daily cost > $50 (⚠️ warning)
- Monthly projection > $1,000 (⚠️ warning)
- Single user > $10/day (🚨 urgent)
- Growth rate > 20%/week (ℹ️ info)

## Conclusion

### Current Status: ✅ EXCELLENT

1. **Very low costs** due to smart model selection
2. **High profit margins** (94-95% on paid plans)
3. **Scalable** to 100K+ users without breaking bank
4. **Well-optimized** through free/local alternatives
5. **Future-proof** with cost tracking and alerts

### Key Metrics

| Metric | Value |
|--------|-------|
| Cost per message | $0.0004 |
| Cost per user/month (avg) | $0.023 |
| Plus plan margin | 95% |
| Ultra plan margin | 94% |
| Savings vs Claude | 87% |
| Savings vs DALL-E | 99.9% |

### Recommendation

Current cost structure is **excellent** and supports profitable scaling. Key priorities:

1. ✅ Continue using current stack (optimal)
2. ✅ Monitor costs with new dashboard
3. ⚠️ Set up budget alerts (daily/monthly)
4. 🔮 Implement smart rate limiting for free users
5. 🔮 Add context compression for future optimization

---

**Analysis Date:** 2025-01-31

**Models Used:** Gemini 2.5 Flash-Lite, Qwen3 Local, AI Horde

**Confidence Level:** High (based on actual pricing and usage patterns)
