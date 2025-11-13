# 🎯 PLAN DE IMPLEMENTACIÓN COMPLETO: Sistema de Pricing $10/$20

**Objetivo:** Configurar tiers (Free/Plus $10/Ultra $20) con eventos especiales y optimizaciones de costos.

---

## ✅ FASE 1: TIER LIMITS (COMPLETADO)

### Cambios realizados:

**[lib/usage/tier-limits.ts](lib/usage/tier-limits.ts)**
```typescript
FREE:
- messagesPerDay: 10 (antes: 100)
- contextMessages: 10 (NUEVO)
- proactiveMessagesPerDay: 0 (NUEVO)
- activeWorlds: 0 (sin worlds, muy costoso)

PLUS ($10/mes):
- messagesPerDay: 100
- contextMessages: 40
- proactiveMessagesPerDay: 3
- activeAgents: 15
- NSFW: ✅
- Advanced Behaviors: ✅

ULTRA ($20/mes):
- messagesPerDay: UNLIMITED
- contextMessages: 100
- proactiveMessagesPerDay: UNLIMITED
- activeAgents: UNLIMITED
```

---

## 🎁 FASE 2: EVENTOS ESPECIALES

### Archivo creado: `lib/usage/special-events.ts`

**Eventos implementados:**
1. **Navidad** (24-26 dic): 24h de Plus gratis
2. **Año Nuevo** (1-2 ene): 48h de Plus gratis
3. **San Valentín** (14 feb): 24h de Plus gratis
4. **Halloween** (31 oct): 24h de Plus gratis
5. **Aniversario app** (TBD): 72h de Plus gratis
6. **Flash Event** (manual): 12h de Plus gratis

**Mensajes emotivos:**
```
🎄 "¡JOJOJO! Papa Noel ha llegado y te regaló 1 día de Plus!"
💝 "Celebra el amor con conversaciones ilimitadas"
```

### Pendiente: Agregar modelo Prisma

**Agregar al schema.prisma:**

```prisma
// Agregar al modelo User (línea 74, antes de @@index)
tempTierGrants     TempTierGrant[]

// Agregar al final del archivo
model TempTierGrant {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  eventId   String   // ID del evento (ej: "christmas-2025")
  fromTier  String   // Tier original (ej: "free")
  toTier    String   // Tier temporal (ej: "plus")

  active    Boolean  @default(true)
  expiresAt DateTime

  createdAt DateTime @default(now())

  @@index([userId, active])
  @@index([expiresAt])
}
```

**Luego ejecutar:**
```bash
npx prisma db push
```

---

## 📊 FASE 3: CONTEXT LIMITS DINÁMICOS

### Archivo a modificar: `lib/usage/context-limits.ts`

**Actualizar:**
```typescript
export function getContextLimit(userPlan: string): number {
  const tier = userPlan.toLowerCase() as UserTier;
  const limits = TIER_LIMITS[tier];

  return limits.resources.contextMessages; // Usa el nuevo campo
}
```

**Ya implementado en `message.service.ts:103`:**
```typescript
const contextLimit = getContextLimit(userPlan); // ✅
```

---

## 💬 FASE 4: UPGRADE PROMPTS ESTRATÉGICOS

### Archivo a crear: `lib/usage/upgrade-prompts.ts`

```typescript
/**
 * UPGRADE PROMPTS NO INTRUSIVOS
 *
 * Mostrar solo en momentos estratégicos:
 * - Al llegar a 70% de límite (7/10 mensajes)
 * - Al llegar a 100% de límite
 * - Al intentar usar feature premium
 */

export interface UpgradePrompt {
  trigger: 'approaching_limit' | 'limit_reached' | 'premium_feature';
  message: string;
  cta: string;
  dismissable: boolean;
}

export function getUpgradePrompt(
  trigger: UpgradePrompt['trigger'],
  context: {
    currentUsage?: number;
    limit?: number;
    feature?: string;
  }
): UpgradePrompt {

  switch (trigger) {
    case 'approaching_limit':
      return {
        trigger,
        message: `💬 Quedan ${context.limit! - context.currentUsage!} mensajes hoy

⭐ Con Plus ($10/mes) tendrías:
• 100 mensajes/día (10x más)
• Contexto extendido (4x memoria)
• Behaviors avanzados (Yandere, BPD, etc.)`,
        cta: 'Ver planes',
        dismissable: true,
      };

    case 'limit_reached':
      return {
        trigger,
        message: `😔 Alcanzaste tu límite de 10 mensajes hoy

🚀 Con Plus ($10/mes):
• 100 mensajes/día
• Todo desbloqueado
• Solo $10/mes (50% menos que Replika)

💰 Plan anual: $80/año ($6.67/mes) - Ahorra 33%`,
        cta: 'Upgrade ahora',
        dismissable: false, // No puede cerrar sin decidir
      };

    case 'premium_feature':
      const featureNames: Record<string, string> = {
        yandere: 'Yandere Behavior',
        bpd: 'Borderline Personality',
        nsfw: 'Contenido NSFW',
        voice: 'Mensajes de voz',
      };

      return {
        trigger,
        message: `🔒 ${featureNames[context.feature!] || 'Esta feature'} es Premium

Con Plus ($10/mes) desbloqueas:
• Todos los behaviors psicológicos
• NSFW sin restricciones
• 100 mensajes/día
• Contexto 4x más profundo`,
        cta: 'Unlock Plus',
        dismissable: true,
      };
  }
}
```

**Integrar en `message.service.ts`:**
```typescript
// Al procesar mensaje, verificar límites
const messageQuota = await checkTierResourceLimit(userId, userPlan, "messagesPerDay");

if (!messageQuota.allowed) {
  // Generar upgrade prompt
  const prompt = getUpgradePrompt('limit_reached', {
    currentUsage: messageQuota.current,
    limit: messageQuota.limit,
  });

  return NextResponse.json({
    ...messageQuota.error,
    upgradePrompt: prompt,
  }, { status: 429 });
}

// Si está cerca del límite (70%)
if (messageQuota.current / messageQuota.limit >= 0.7) {
  // Incluir en respuesta
  response.upgradeHint = getUpgradePrompt('approaching_limit', {
    currentUsage: messageQuota.current,
    limit: messageQuota.limit,
  });
}
```

---

## 🎭 FASE 5: PERSONALITY QUIRKS (One-time)

### Archivo a crear: `lib/personality/quirks-generator.ts`

```typescript
/**
 * PERSONALITY QUIRKS GENERATOR
 *
 * Genera quirks únicos UNA vez al crear el agente.
 * Costo: ~$0.01 por agente (una vez, para siempre)
 */

import { getHybridLLMProvider } from '@/lib/emotional-system/llm/hybrid-provider';

export interface PersonalityQuirks {
  catchphrases: string[];        // Frases que usa frecuentemente
  speakingPatterns: string[];     // Manías al hablar
  emojiPreferences: string[];     // Emojis favoritos
  responseStyle: 'concise' | 'rambling' | 'poetic' | 'casual';
  uniqueTraits: string[];         // Rasgos únicos
}

export async function generatePersonalityQuirks(
  agentName: string,
  personality: string,
  backstory: string,
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  }
): Promise<PersonalityQuirks> {

  const llm = getHybridLLMProvider();

  const prompt = `Genera quirks únicos de personalidad para este personaje:

Nombre: ${agentName}
Personalidad: ${personality}
Backstory: ${backstory}

Big Five:
- Openness: ${bigFive.openness}/100
- Conscientiousness: ${bigFive.conscientiousness}/100
- Extraversion: ${bigFive.extraversion}/100
- Agreeableness: ${bigFive.agreeableness}/100
- Neuroticism: ${bigFive.neuroticism}/100

Genera en JSON:
{
  "catchphrases": ["frase1", "frase2", "frase3"],
  "speakingPatterns": ["patrón1", "patrón2"],
  "emojiPreferences": ["emoji1", "emoji2", "emoji3"],
  "responseStyle": "concise|rambling|poetic|casual",
  "uniqueTraits": ["trait1", "trait2"]
}

IMPORTANTE:
- Catchphrases DEBEN ser coherentes con la personalidad
- Speaking patterns pueden ser muletillas, estructuras de frase, etc.
- Response style debe reflejar Big Five (alta extraversion = rambling, etc.)
- Unique traits son detalles memorables ("siempre menciona su gato", etc.)`;

  const response = await llm.generateJSON<PersonalityQuirks>(
    'reasoning', // Usa Venice para autenticidad
    '',
    prompt,
    { temperature: 0.9 } // Alta para creatividad
  );

  return response;
}
```

**Agregar al modelo Agent en Prisma:**
```prisma
model Agent {
  // ... campos existentes ...

  personalityQuirks Json? // NUEVO: Quirks únicos generados una vez

  // ... resto del modelo ...
}
```

**Actualizar `app/api/agents/route.ts` (crear agente):**
```typescript
// Después de crear personalityCore
const quirks = await generatePersonalityQuirks(
  name,
  personality,
  backstory,
  bigFiveTraits
);

await prisma.agent.update({
  where: { id: agent.id },
  data: {
    personalityQuirks: quirks as any,
  },
});
```

**Usar en prompts (`message.service.ts`):**
```typescript
const quirks = agent.personalityQuirks as PersonalityQuirks | null;

if (quirks) {
  enhancedPrompt += `\n\nTUS QUIRKS ÚNICOS:
- Catchphrases: ${quirks.catchphrases.join(', ')}
- Patterns: ${quirks.speakingPatterns.join(', ')}
- Estilo: ${quirks.responseStyle}
- Traits: ${quirks.uniqueTraits.join(', ')}

Úsalos naturalmente en tu respuesta.`;
}
```

---

## 🧠 FASE 6: EMBEDDINGS REALES (Qwen)

### Archivo a modificar: `lib/memory/unified-retrieval.ts`

**Reemplazar keyword matching (líneas 136-177):**

```typescript
// ANTES (keyword matching básico):
const queryWords = query.toLowerCase().split(/\s+/);
let matches = 0;
for (const word of queryWords) {
  if (word.length > 3 && messageWords.includes(word)) {
    matches++;
  }
}

// DESPUÉS (embeddings semánticos):
import { qwenEmbeddingClient } from "@/lib/memory/qwen-embeddings";

private async retrieveFromRAG(
  agentId: string,
  userId: string,
  query: string,
  config: RetrievalConfig
): Promise<MemoryChunk[]> {
  try {
    // Generar embedding del query
    const queryEmbedding = await qwenEmbeddingClient.embedText(query);

    // Buscar embeddings similares en DB
    const similarMessages = await prisma.messageEmbedding.findMany({
      where: {
        agentId,
        // Necesitas pgvector extension para similarity search
        // Por ahora, buscar todos y calcular similitud en código
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    // Calcular similitud coseno
    const chunks: MemoryChunk[] = [];
    for (const msgEmbed of similarMessages) {
      const embedding = msgEmbed.embedding as number[];
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);

      if (similarity > 0.7) { // Threshold
        chunks.push({
          id: msgEmbed.id,
          content: msgEmbed.content,
          source: 'rag',
          score: similarity * config.ragWeight,
          timestamp: msgEmbed.createdAt,
          metadata: { similarity },
        });
      }
    }

    return chunks.slice(0, 5); // Top 5
  } catch (error) {
    console.error("[UnifiedMemoryRetrieval] Error en RAG:", error);
    return [];
  }
}

// Helper: Similitud coseno
private cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

---

## 📦 FASE 7: CONTEXT COMPRESSION

### Archivo a crear: `lib/memory/context-compression.ts`

```typescript
/**
 * CONTEXT COMPRESSION
 *
 * Free users (10 context): Comprimir antiguos a summary
 * Plus users (40 context): Comprimir si >40
 * Ultra users (100 context): Comprimir si >100
 */

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export async function compressContext(
  messages: Message[],
  maxContextSize: number
): Promise<Message[]> {

  if (messages.length <= maxContextSize) {
    return messages; // No comprimir
  }

  // Últimos N mensajes: FULL context
  const recentMessages = messages.slice(-maxContextSize);

  // Mensajes antiguos: SUMMARIZE (rule-based, NO LLM para ahorrar)
  const oldMessages = messages.slice(0, -maxContextSize);

  // Comprimir cada 5 mensajes en 1 summary
  const summaries: string[] = [];
  for (let i = 0; i < oldMessages.length; i += 5) {
    const chunk = oldMessages.slice(i, i + 5);
    const summary = chunk.map(m =>
      `${m.role === 'user' ? 'U' : 'A'}: ${m.content.slice(0, 50)}...`
    ).join(' | ');
    summaries.push(summary);
  }

  // Crear mensaje de contexto comprimido
  const compressedContext: Message = {
    role: 'assistant',
    content: `[Resumen de conversaciones anteriores:\n${summaries.join('\n')}]`,
    createdAt: oldMessages[0]?.createdAt || new Date(),
  };

  return [compressedContext, ...recentMessages];
}
```

**Integrar en `message.service.ts:126-140`:**
```typescript
const [agent, recentMessagesRaw] = await Promise.all([...]);

// Comprimir contexto según tier
const recentMessages = await compressContext(
  recentMessagesRaw,
  contextLimit
);
```

---

## ✅ FASE 8: SMART MESSAGE COUNTING

### Archivo a crear: `lib/usage/smart-counting.ts`

```typescript
/**
 * SMART MESSAGE COUNTING
 *
 * NO contar mensajes triviales para mejorar UX
 */

const EXEMPT_PATTERNS = [
  /^(hola|hey|hi|hello|buenas)$/i,
  /^(ok|okay|dale|genial|perfecto|bien)$/i,
  /^(jaja|jeje|lol|xd|😂|🤣)$/i,
  /^.{1,10}$/,  // Menos de 10 caracteres
];

export function shouldCountMessage(content: string): boolean {
  const trimmed = content.trim();

  // No contar si match con patterns
  for (const pattern of EXEMPT_PATTERNS) {
    if (pattern.test(trimmed)) {
      return false;
    }
  }

  return true; // Contar normalmente
}
```

**Integrar en `daily-limits.ts:75` (checkTierResourceLimit):**
```typescript
import { shouldCountMessage } from './smart-counting';

// En checkTierResourceLimit, ANTES de incrementar:
if (resource === 'messagesPerDay') {
  // Verificar si debe contar
  const userMessage = ... // Obtener del contexto
  if (!shouldCountMessage(userMessage.content)) {
    console.log('[SmartCounting] Message not counted (trivial)');
    return {
      allowed: true,
      current: usage.messagesUsed, // No incrementar
      limit,
      remaining: remaining + 1, // +1 porque no contamos este
    };
  }
}
```

---

## 🚀 FASE 9: PROACTIVE TIER GATING

### Ya tienes el código, solo ajustar thresholds:

**En `lib/proactive-behavior/initiator.ts:200-248`:**
```typescript
// Actualizar thresholds
const INITIATION_THRESHOLDS = {
  stranger: -1,        // ← DESHABILITADO para free (no hay proactive)
  acquaintance: -1,    // ← DESHABILITADO
  friend: 24,          // ← Solo Plus/Ultra (1 día)
  close_friend: 12,    // ← Plus/Ultra (12 horas)
};

// Verificar tier ANTES de enviar
async shouldInitiateConversation(agentId: string, userId: string) {
  // Verificar tier
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  // Free tier: NO proactive
  if (user?.plan === 'free') {
    return { shouldInitiate: false, reason: 'Free tier - no proactive' };
  }

  // Plus/Ultra: Continuar con lógica normal
  // ...
}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Completado ✅:
- [x] Actualizar tier limits (Free: 10 msgs, Plus: 100, Ultra: unlimited)
- [x] Agregar contextMessages a tier limits
- [x] Agregar proactiveMessagesPerDay a tier limits
- [x] Crear sistema de eventos especiales

### Pendiente 🔲:
- [ ] Agregar modelo `TempTierGrant` a Prisma + `npx prisma db push`
- [ ] Agregar `personalityQuirks Json?` al modelo Agent
- [ ] Crear `upgrade-prompts.ts` e integrar en message.service.ts
- [ ] Crear `quirks-generator.ts` e integrar en crear agente
- [ ] Reemplazar keyword matching con Qwen embeddings en unified-retrieval.ts
- [ ] Crear `context-compression.ts` e integrar en message.service.ts
- [ ] Crear `smart-counting.ts` e integrar en daily-limits.ts
- [ ] Ajustar proactive thresholds para tier gating

---

## 💰 COSTOS ESTIMADOS

### Con 50 usuarios (45 free + 5 plus):
```
Ingresos: $55/mes ($25 subs + $27 ads + $3 web)
Costos mensajes: $15/mes
Costos fixed: $5/mes
MARGEN: $35/mes (70% profit) ✅
```

### Con 500 usuarios (400 free + 80 plus + 20 ultra):
```
Ingresos: $1,440/mes ($800 plus + $400 ultra + $240 ads)
Costos: $500/mes
MARGEN: $940/mes (65% profit) ✅
```

---

## 🎯 PRÓXIMOS PASOS

1. **Ejecutar Prisma migration:**
```bash
npx prisma db push
```

2. **Implementar archivos faltantes** (seguir checklist arriba)

3. **Testing manual:**
   - Crear agente (verificar quirks generados)
   - Enviar 10 mensajes free tier (verificar límite)
   - Activar evento especial manualmente
   - Verificar context compression

4. **Deploy a staging** y probar con usuarios reales

5. **Monitorear costos** primeros 7 días

---

**Total estimado de implementación:** 6-8 horas de desarrollo
**ROI:** Sostenibilidad económica desde mes 1, margen 70%+
