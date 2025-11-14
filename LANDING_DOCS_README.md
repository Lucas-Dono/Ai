# Landing Page & User Documentation - Implementation Guide

## 📋 Overview

This document explains the dual-language strategy implemented for Circuit Prompt, separating user-facing marketing language from **practical user documentation** (NOT technical implementation details).

## 🎯 Core Philosophy - REVISED

**Landing Page**: Emotional, accessible language
- "Memoria ilimitada" ✓
- "Emociones reales" ✓
- "Relaciones que crecen" ✓

**Documentation**: **HOW TO USE** the product, NOT how it works internally
- "How to create compelling companions" ✓
- "How relationships develop over time" ✓
- "Best practices for better conversations" ✓
- "How to use behaviors safely" ✓

❌ **DO NOT REVEAL**:
- Internal architecture (OCC Model, Plutchik implementation)
- Specific models used (Qwen3, Llama 3.3)
- Scoring systems (threshold: 50 pts)
- Technical metrics (embeddings 1536D, Redis cache)

## 🚫 Important: What We DON'T Do

Companies like OpenAI, Anthropic, and Google **don't reveal how their systems work internally**. They focus on:
- How to use their product effectively
- Best practices and guidelines
- API documentation (when available)
- User guides and tutorials

We follow the same approach. Our docs teach users **how to get better results**, not **how the system is built**.

---

## 📁 File Structure

### Landing Page Components
```
components/landing/
├── LandingNav.tsx           # Navigation with Docs link
├── HeroSection.tsx          # Single CTA (1:1 ratio principle)
├── FeaturesGrid.tsx         # 6 features with tier badges
├── ComparisonTable.tsx      # Generic competitors ("Others")
├── SocialProof.tsx          # Real metrics only
└── ...other components
```

### Documentation System (USER-FOCUSED)
```
app/docs/
├── page.tsx                      # Docs landing page
├── getting-started/page.tsx      # Quick start guide
├── character-creation/page.tsx   # How to design companions
├── memory-relationships/page.tsx # How memory & relationships work
├── behaviors/page.tsx            # How to use behaviors safely
├── worlds/page.tsx               # How to create multi-companion worlds
└── best-practices/page.tsx       # Tips for better conversations
```

### Translation Files
```
messages/
├── es-landing.json    # Accessible landing copy
└── es.json            # General application translations
```

---

## 📚 Documentation Pages

### 1. **Getting Started** (`/docs/getting-started`)
**Purpose**: Onboard new users quickly
**Content**:
- Create your account
- Create your first companion
- Start your first conversation
- Understanding the interface
- Free vs Pro features

**NO**: Architecture details, model names, technical implementation

### 2. **Character Creation** (`/docs/character-creation`)
**Purpose**: Help users create compelling companions
**Content**:
- Choosing personality types
- Writing effective backstories
- Selecting traits
- Avatar selection tips
- Advanced character design

**NO**: How personality generation works internally, prompt engineering details

### 3. **Memory & Relationships** (`/docs/memory-relationships`)
**Purpose**: Explain what users can expect from memory and relationships
**Content**:
- How memory works (Free vs Pro)
- 5 relationship stages explained
- Building trust with your companion
- Memory tips for better recall
- Relationship progression timeline

**NO**: Vector embeddings, RAG architecture, scoring algorithms

### 4. **Behaviors Guide** (`/docs/behaviors`)
**Purpose**: Teach safe use of personality behaviors
**Content**:
- 13 behavior types explained
- Intensity control
- Safety features and consent
- Usage tips
- Common pitfalls

**NO**: DSM-5 implementation details, trigger detection algorithms

### 5. **Worlds Guide** (`/docs/worlds`)
**Purpose**: Teach multi-companion world creation
**Content**:
- What are worlds?
- Creating your first world
- Interaction modes (participant vs narrator)
- Story direction techniques
- Use cases and best practices

**NO**: Simulation engine details, AI Director architecture, Redis implementation

### 6. **Best Practices** (`/docs/best-practices`)
**Purpose**: Help users have better conversations
**Content**:
- Conversation techniques
- Message structure tips
- Building emotional depth
- Advanced techniques
- Common pitfalls to avoid

**NO**: Natural language processing details, response generation mechanics

---

## 🎨 Design Principles Applied

### 1. **User-Centric Focus**
Every doc page answers: "How does this help the USER?"
- Not: "Here's how our system works"
- Yes: "Here's how YOU can use this feature"

### 2. **Progressive Disclosure**
Information in layers:
1. **What** - What is this feature?
2. **Why** - Why should I use it?
3. **How** - How do I use it effectively?

### 3. **Practical Examples**
Every concept has real examples:
- Good vs Bad message examples
- Backstory templates
- Conversation flow demonstrations

### 4. **Safety & Transparency**
Clear about limitations and tier features:
- Free vs Pro clearly marked
- Content warnings where appropriate
- Safety features explained

---

## 🌐 Translation System

### Landing Copy (`es-landing.json`)
```json
{
  "landing": {
    "nav": {
      "docs": "Documentación"
    },
    "hero": {
      "title": "Compañeros virtuales que",
      "titleHighlight": "evolucionan contigo",
      "subtitle": "Memoria ilimitada. Emociones reales. Relaciones que crecen.",
      "ctaPrimary": "Crear tu compañero gratis"
    }
  }
}
```

---

## 📊 Content Guidelines

### Landing Page - Accessible Language
✅ **Use**:
- "Memoria ilimitada"
- "Emociones reales"
- "Relaciones que crecen"
- "Basado en psicología"

❌ **Avoid**:
- "Embeddings vectoriales"
- "RAG con búsqueda semántica"
- Technical jargon

### Documentation - Practical User Guides
✅ **Use**:
- "Your companion remembers conversations"
- "Relationships develop through 5 stages"
- "Here's how to create better backstories"
- "Tips for more natural conversations"

❌ **Avoid**:
- "We use Qwen3-Embedding-0.6B with 1536 dimensions"
- "OCC Model processes appraisal variables"
- "Redis multi-layer cache with 93% reduction"
- Internal implementation details

---

## 🚀 Quick Start

### Run Development Server
```bash
npm run dev
```

### View Landing Page
```
http://localhost:3000/landing
```

### View Documentation
```
http://localhost:3000/docs
```

---

## 📝 Future Improvements

### Landing Page
- [ ] Add video demo in HeroSection
- [ ] A/B test alternative CTAs
- [ ] Implement scroll-based animations
- [ ] Add live chat widget

### Documentation
- [ ] Add video tutorials for each guide
- [ ] Add search functionality
- [ ] Create interactive tutorials
- [ ] Add more "Quick Tips" cards
- [ ] API documentation (when API is ready)
- [ ] FAQ section
- [ ] Troubleshooting guide

### Translation
- [ ] Add English version (en-landing.json)
- [ ] Add Portuguese (pt-landing.json)
- [ ] Localize documentation pages

---

## 🛠️ Maintenance

### Updating Landing Copy
1. Edit `messages/es-landing.json`
2. Update corresponding component if needed
3. Test on development server
4. Deploy

### Adding New Documentation
1. Create new page in `app/docs/[topic]/page.tsx`
2. **Focus on USER VALUE**: How does this help users?
3. Use existing practical doc pages as template
4. **NO TECHNICAL DETAILS**: Don't reveal architecture
5. Add link to main docs page (`app/docs/page.tsx`)
6. Include metadata for SEO

### Content Review Checklist
Before publishing new docs, ask:
- [ ] Does this teach USAGE, not IMPLEMENTATION?
- [ ] Would OpenAI/Anthropic reveal this in their docs?
- [ ] Does it help users get better results?
- [ ] Are there practical examples?
- [ ] Is it accessible to non-technical users?

---

## 🎯 Conversion Optimization

### Landing Page
- [x] Single primary CTA
- [x] Clear value propositions
- [x] Tier differentiation
- [x] Real social proof only
- [x] Trust indicators

### Documentation
- [x] User-focused content
- [x] Practical examples
- [x] Step-by-step guides
- [x] Best practices
- [x] Safety guidelines

---

## 💎 Competitive Advantage: Radical Transparency in Limits

Unlike competitors who hide their limits behind vague language, Circuit Prompt is completely transparent.

### Industry Standard (What Others Do)
**OpenAI:**
- ❌ "Higher limits than Free tier"
- ❌ "5x more usage"
- ❌ Never specify actual numbers

**Anthropic (Claude):**
- ❌ "Claude Pro offers 5x more usage than Claude Free"
- ❌ Doesn't say what Free tier limit actually is

**Character.AI:**
- ❌ "Priority access"
- ❌ "Faster response times"
- ❌ No specific numbers

### Circuit Prompt Standard (What We Do)
**Free Tier:**
- ✅ "~50 messages per day"
- ✅ Clear number shown upfront
- ✅ Tooltip explains: "Based on 20,000 tokens/day average"

**Pro Tier:**
- ✅ "~5,000 messages per day"
- ✅ Clear number shown upfront
- ✅ Tooltip explains: "Based on 2,000,000 tokens/day average"

### Technical Implementation

**Token-Based System (Internal):**
```typescript
// Límites reales (internos, para control de costos)
free: {
  inputTokensPerDay: 10_000,
  outputTokensPerDay: 10_000,
  totalTokensPerDay: 20_000
}

pro: {
  inputTokensPerDay: 1_000_000,
  outputTokensPerDay: 1_000_000,
  totalTokensPerDay: 2_000_000
}
```

**Message-Based Display (UI - User Friendly):**
```tsx
// Lo que el usuario ve (fácil de entender)
<UsageCard>
  <h3>Daily Limit</h3>
  <p>23 / ~50 messages today</p>
  <ProgressBar value={23} max={50} />
  <Tooltip>
    Based on average 350 tokens/message.
    Actual limit: 20,000 tokens/day
  </Tooltip>
</UsageCard>
```

### Why This Is Better

**1. User Trust**
- Users know exactly what they're getting
- No surprises or hidden limits
- Builds confidence in the product

**2. Fair Pricing**
- Token-based = pay for actual usage
- Short messages don't count same as long ones
- More accurate than fixed message limits

**3. Marketing Advantage**
- "Unlike other platforms that hide limits, we tell you exactly what you get"
- Differentiator in a secretive industry
- Appeals to transparency-focused users

**4. Cost Honesty**
- Free tier: ~$0.066/month actual cost per user
- 1000 active users = ~$66-252/month total cost
- Sustainable without external investment
- Clear path to profitability

### Conversion Formula (For Reference)

```typescript
// Promedio real de tokens por mensaje:
const TOKENS_PER_MESSAGE = {
  input: 150,    // Lo que escribe el usuario
  output: 200,   // Lo que responde el compañero
  total: 350,    // Total por intercambio
};

// Free tier: 20,000 tokens / 350 = ~57 mensajes
// Mostramos conservador: ~50 mensajes
```

---

## 🎉 Summary

This implementation focuses on **USER EDUCATION** rather than **TECHNICAL TRANSPARENCY**.

**Key Principles**:
1. ✅ Teach users how to get better results
2. ✅ Provide practical tips and examples
3. ✅ Explain what features do (not how they work)
4. ❌ Don't reveal internal architecture
5. ❌ Don't expose competitive advantages
6. ❌ Don't share implementation details

**Inspiration**: OpenAI, Anthropic, Google docs
- They explain HOW TO USE their products
- They DON'T explain HOW THEIR SYSTEMS WORK
- We follow the same professional standard

---

## 📞 Support

For questions about this implementation:
- Review the code in the files listed above
- Check user-focused documentation pages
- Ensure no technical secrets are revealed

---

**Philosophy**: Be an excellent teacher of PRODUCT USE, not an open book of TECHNICAL IMPLEMENTATION.

**Last Updated**: 2025-01-15
**Version**: 2.0.0 (User-Focused)
**Status**: ✅ Complete
