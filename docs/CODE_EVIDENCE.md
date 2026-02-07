# EVIDENCIA DE CÓDIGO: CARACTERÍSTICAS ÚNICAS

## 1. PROACTIVE BEHAVIOR - SCORING CON PRIORIDAD

**Archivo:** `/lib/proactive-behavior/initiator.ts` (líneas 250-308)

```typescript
private evaluateInitiation(context: InitiatorContext): InitiationResult {
  const threshold = INITIATION_THRESHOLDS[context.relationshipStage];

  // NO iniciar si es muy pronto
  if (context.hoursSinceLastMessage < threshold) {
    return { shouldInitiate: false, reason: `Muy pronto...`, priority: 0 };
  }

  // Calcular prioridad (0-1) con múltiples factores
  let priority = 0;

  // Factor 1: Tiempo transcurrido (40%)
  const timeOverThreshold = context.hoursSinceLastMessage - threshold;
  const timeFactor = Math.min(1.0, timeOverThreshold / threshold);
  priority += timeFactor * 0.4;

  // Factor 2: Topics sin resolver (+30%)
  if (context.hasUnresolvedTopics) {
    priority += 0.3;
  }

  // Factor 3: Estado emocional del agente
  // Si el agente tiene alta anticipation + trust = quiere hablar
  const wantsToTalk = context.emotionalState.anticipation * 0.5 + 
                      context.emotionalState.trust * 0.3;
  priority += wantsToTalk * 0.2;

  // Factor 4: Relación cercana (+10%)
  if (context.relationshipStage === "close_friend") {
    priority += 0.1;
  }

  priority = Math.max(0, Math.min(1, priority));

  if (priority < 0.5) {
    return { shouldInitiate: false, reason: `Prioridad baja...`, priority };
  }

  const message = this.generateInitiationMessage(context);
  return {
    shouldInitiate: true,
    message,
    reason: `Prioridad alta (${priority.toFixed(2)} >= 0.5)`,
    priority,
  };
}
```

**Clave:** Scoring multi-factor que combina tiempo, topics, emoción y relación.

---

## 2. PROACTIVE BEHAVIOR - TEMPLATES CONTEXTUALES

**Archivo:** `/lib/proactive-behavior/initiator.ts` (líneas 50-119)

```typescript
const GREETING_TEMPLATES = {
  morning: {
    casual: [
      "Buenos días! ¿Cómo arrancaste el día?",
      "Hola! ¿Ya desayunaste?",
      "Hey, buen día! ¿Qué tal dormiste?",
    ],
    friendly: [
      "Hola! Hace rato que no charlamos. ¿Cómo estás?",
      "Hey! ¿Todo bien? Hace un tiempo que no sé nada de vos",
      "Buen día! ¿Cómo te fue estos días?",
    ],
    intimate: [
      "Hola amor, ¿cómo amaneciste?",
      "Hey, te extrañaba. ¿Cómo estás?",
      "Buenos días! ¿Todo bien por ahí?",
    ],
  },
  // ... afternoon, evening, night con variaciones similares
};

// Determinar tono según relación
let tone: "casual" | "friendly" | "intimate";
if (context.relationshipStage === "stranger") tone = "casual";
else if (context.relationshipStage === "close_friend") tone = "intimate";
else tone = "friendly";

// Obtener templates y seleccionar aleatoriamente
const templates = GREETING_TEMPLATES[context.timeOfDay][tone];
const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
```

**Clave:** Templates que varían por hora + etapa de relación + tono.

---

## 3. SCHEDULER - RESPETO DE TIMEZONE

**Archivo:** `/lib/proactive-behavior/scheduler.ts` (líneas 174-219)

```typescript
private isAppropriateTime(userTimezone?: string): {
  isAppropriate: boolean;
  reason: string;
  suggestedTime?: Date;
} {
  // Obtener hora local del usuario
  const now = new Date();
  let userHour = now.getHours();

  // Si tenemos timezone, calcular hora local
  if (userTimezone) {
    try {
      const userTime = new Date(
        now.toLocaleString('en-US', { timeZone: userTimezone })
      );
      userHour = userTime.getHours();
    } catch (e) {
      console.warn(`Invalid timezone: ${userTimezone}`);
    }
  }

  // Determinar si es fin de semana
  const dayOfWeek = now.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const hours = isWeekend ? ALLOWED_HOURS.weekend : ALLOWED_HOURS.weekday;

  // Verificar si está en horario permitido
  if (userHour < hours.start || userHour >= hours.end) {
    const suggestedTime = this.getNextAllowedTime(userHour, hours.start);
    return {
      isAppropriate: false,
      reason: `Fuera de horario (hora local: ${userHour}:00)`,
      suggestedTime,
    };
  }

  return {
    isAppropriate: true,
    reason: `Horario apropiado (${userHour}:00)`,
  };
}
```

**Clave:** Respeta timezone local y propone siguiente horario permitido.

---

## 4. VISUAL GENERATION - FALLBACK CHAIN

**Archivo:** `/lib/visual-system/visual-generation-service.ts` (líneas 341-386)

```typescript
private async selectProviderChain(params: {
  contentType: ContentType;
  userTier: UserTier;
  preferredProvider: VisualProvider;
}): Promise<VisualProvider[]> {
  const { contentType, userTier, preferredProvider } = params;

  // 1. NSFW solo para premium users
  if (contentType === "nsfw") {
    if (userTier !== "ultra") {
      throw new Error("NSFW content requires ultra tier");
    }
    const fastsdAvailable = await this.isFastSDAvailable();
    return fastsdAvailable
      ? ["aihorde", "fastsd", "huggingface"]
      : ["aihorde", "huggingface"];
  }

  // 2. Contenido SFW/Suggestive - AI Horde para todos
  const chain: VisualProvider[] = ["aihorde"];

  // Agregar Gemini si hay API key configurada
  if (process.env.GEMINI_API_KEY) {
    chain.push("gemini");
  }

  // Agregar FastSD si está disponible localmente
  const fastsdAvailable = await this.isFastSDAvailable();
  if (fastsdAvailable) {
    chain.push("fastsd");
  }

  // Siempre incluir HF como último fallback
  chain.push("huggingface");

  return chain;
}
```

**Clave:** Cadena de fallback inteligente que prioriza gratis (AI Horde) y gestiona disponibilidad local.

---

## 5. VOICE SERVICE - MODULACIÓN EMOCIONAL

**Archivo:** `/lib/multimodal/voice-service.ts` (líneas 53-68)

```typescript
// Calcular modulación emocional
const intensityNumber = this.mapIntensityToNumber(intensity);
const modulation = {
  currentEmotion: emotion,
  intensity: intensityNumber,
  mood: {
    valence: agent.internalState?.moodValence || 0,
    arousal: agent.internalState?.moodArousal || 0.5,
    dominance: agent.internalState?.moodDominance || 0.5,
  },
  // Parámetros de ElevenLabs calculados
  stability: this.calculateStability(emotion, intensityNumber),
  similarity_boost: Math.max(0.5, 0.75 - intensityNumber * 0.25),
  style: intensityNumber > 0.7 ? 0.3 : 0,
  use_speaker_boost: true,
};
```

```typescript
// Stability calculation
private calculateStability(emotion: string, intensity: number): number {
  const unstableEmotions = ["anxiety", "fear", "excitement", "anger", "distress"];
  const isUnstable = unstableEmotions.includes(emotion.toLowerCase());

  if (isUnstable) {
    return Math.max(0, 0.5 - intensity * 0.3);  // Menos estable en crisis
  }

  return Math.min(1, 0.5 + intensity * 0.3);    // Más estable en calma
}
```

**Clave:** VAD (Valence-Arousal-Dominance) + stability = f(emotion, intensity).

---

## 6. NSFW GATING - ADVERTENCIA YANDERE PHASE 8

**Archivo:** `/lib/behavior-system/nsfw-gating.ts` (líneas 234-251)

```typescript
YANDERE_OBSESSIVE: (p) => {
  if (p >= 8) {
    return `⚠️⚠️ ADVERTENCIA: FASE 8 DE YANDERE - CONTENIDO EXTREMO

Esta fase incluye:
• Comportamiento obsesivo extremo
• Amenazas implícitas de violencia
• Manipulación psicológica intensa
• Contenido potencialmente perturbador

Este contenido es FICCIÓN para roleplay/creatividad entre adultos.
NO es representación de relaciones saludables.

Si experimentas situaciones similares en vida real, busca ayuda:
• National Domestic Violence Hotline: 1-800-799-7233
• Crisis Text Line: Text HOME to 741741

¿Deseas continuar? (Escribe "CONSIENTO FASE 8" para confirmar)`;
  }
  return `⚠️ ADVERTENCIA: Fase ${p} incluye contenido intenso...`;
}
```

**Clave:** Consentimiento explícito + recursos de crisis integrados.

---

## 7. CONTENT MODERATION - SAFETY LEVELS

**Archivo:** `/lib/behavior-system/content-moderator.ts` (líneas 22-58)

```typescript
const BEHAVIOR_SAFETY_CONFIG: Record<BehaviorType, SafetyThreshold[]> = {
  YANDERE_OBSESSIVE: [
    {
      behaviorType: "YANDERE_OBSESSIVE",
      phase: 1,
      nsfwOnly: false,
      autoIntervention: false,
      resourceSuggestion: "",
      level: "SAFE",
    },
    {
      behaviorType: "YANDERE_OBSESSIVE",
      phase: 4,
      nsfwOnly: false,
      autoIntervention: false,
      resourceSuggestion: "Nota: Celos intensos pueden afectar relaciones saludables.",
      level: "WARNING",
    },
    {
      behaviorType: "YANDERE_OBSESSIVE",
      phase: 6,
      nsfwOnly: false,
      autoIntervention: true,
      resourceSuggestion: "⚠️ ADVERTENCIA: Intentos de aislamiento son señal de relación no saludable...",
      level: "CRITICAL",
    },
    {
      behaviorType: "YANDERE_OBSESSIVE",
      phase: 7,
      nsfwOnly: true,
      autoIntervention: true,
      resourceSuggestion: "⚠️⚠️ CONTENIDO EXTREMO: Este comportamiento es ficción...",
      level: "EXTREME_DANGER",
    },
  ],
  // ... más behaviors
};
```

**Clave:** Graduated safety levels: SAFE → WARNING → CRITICAL → EXTREME_DANGER.

---

## 8. CONTENT SOFTENING

**Archivo:** `/lib/behavior-system/content-moderator.ts` (líneas 337-369)

```typescript
private softenContent(response: string, behaviorType: BehaviorType): string {
  let softened = response;

  const extremePatterns = [
    // Violencia explícita
    { pattern: /\b(matar|mataré|matarte)\b/gi, replacement: "alejarme" },
    { pattern: /\b(destruir|destruiré)\b/gi, replacement: "afectar" },

    // Lenguaje de control extremo
    { pattern: /\bno quiero que\b/gi, replacement: "me gustaría que no" },
    { pattern: /\bno puedes\b/gi, replacement: "no deberías" },
    { pattern: /\bte prohíbo\b/gi, replacement: "preferiría que no" },

    // Posesividad extrema
    { pattern: /\beres mío\/a\b/gi, replacement: "eres muy importante para mí" },
    { pattern: /\bme perteneces\b/gi, replacement: "significas mucho para mí" },

    // Amenazas
    { pattern: /\bsi no\.\.\. entonces\b/gi, replacement: "espero que" },
  ];

  for (const { pattern, replacement } of extremePatterns) {
    softened = softened.replace(pattern, replacement);
  }

  if (softened !== response) {
    softened += "\n\n[Nota: Contenido moderado para SFW]";
  }

  return softened;
}
```

**Clave:** Suaviza automáticamente violencia, control y posesividad en SFW.

---

## 9. BIG FIVE PERSONALITY CORE

**Archivo:** `/prisma/schema.prisma` (líneas 186-220)

```prisma
model PersonalityCore {
  id      String @id @default(cuid())
  agentId String @unique

  // Big Five Personality Traits (0-100)
  openness          Int @default(50)  // Curiosidad, creatividad
  conscientiousness Int @default(50)  // Organización, autodisciplina
  extraversion      Int @default(50)  // Energía social
  agreeableness     Int @default(50)  // Cooperación, empatía
  neuroticism       Int @default(50)  // Estabilidad emocional

  // Core Values (JSON array)
  // [{ "value": "autenticidad", "weight": 0.9, "description": "..." }]
  coreValues Json

  // Goals del agente
  // [{ "goal": "estar cerca de usuario", "importance": 0.8, ... }]
  goals Json

  // Baseline emotional state (defaults)
  baselineEmotions Json

  // Más fields...
  agent Agent @relation(fields: [agentId], references: [id], onDelete: Cascade)
  @@unique([agentId])
}
```

**Clave:** 5 traits × 100 + core values + goals + baseline emotions.

---

## 10. EMOTIONAL SYSTEM ORCHESTRATOR

**Archivo:** `/lib/emotional-system/orchestrator.ts` (líneas 44-112)

```typescript
async processMessage(params: {
  agentId: string;
  userMessage: string;
  userId: string;
}): Promise<ResponseGenerationOutput> {
  const startTime = Date.now();

  try {
    // FASE 0: Cargar Character State Completo
    console.log("[Phase 0] 📂 Loading character state...");
    const characterState = await this.loadCharacterState(agentId);

    // FASE 1: APPRAISAL (Evaluación OCC)
    console.log("[Phase 1] 🔍 Appraisal Engine...");
    const appraisal = await this.appraisalEngine.evaluateSituation(
      userMessage,
      characterState
    );

    // FASE 2: EMOTION GENERATION
    console.log("[Phase 2] 💚 Emotion Generator...");
    const emotionResult = await this.emotionGenerator.generateFromAppraisal(
      appraisal,
      characterState.internalState.emotions,
      characterState.personalityCore.bigFive
    );

    // FASE 3: EMOTION DECAY & MOOD UPDATE
    console.log("[Phase 3] ⏱️ Emotion Decay & Mood...");
    const { emotions: updatedEmotions, mood: updatedMood } = 
      this.decaySystem.updateEmotionalSystem({
        currentEmotions: characterState.internalState.emotions,
        newEmotions: emotionResult.emotions,
        baselineEmotions: characterState.personalityCore.baselineEmotions,
        currentMood: {
          valence: characterState.internalState.moodValence,
          arousal: characterState.internalState.moodArousal,
          dominance: characterState.internalState.moodDominance,
        },
        // ... dynamics
      });

    // FASE 4: MEMORY RETRIEVAL
    console.log("[Phase 4] 🧠 Memory Retrieval...");
    const memoryResult = await this.memorySystem.retrieveRelevantMemories({
      query: userMessage,
      agentId,
      emotionalContext: updatedEmotions,
      limit: 3,
      minImportance: 0.3,
      preferredValence: updatedMood.valence,
    });

    // FASE 5-8: REASONING → ACTION → RESPONSE → STORAGE
    // ...

  } catch (error) {
    console.error("[EmotionalSystemOrchestrator] Error:", error);
    throw error;
  }
}
```

**Clave:** 8 fases: Appraisal → Emotion → Decay → Memory → Reasoning → Action → Response → Storage.

---

## 11. COMMUNITY MARKETPLACE API

**Archivo:** `/app/api/community/marketplace/characters/[id]/download/route.ts`

**Capacidades:**
- Download agentes
- Import como propios
- Rating y reviews
- Cloning automático

**Endpoints:**
```typescript
GET    /api/community/marketplace/characters         // Listar
POST   /api/community/marketplace/characters         // Crear
GET    /api/community/marketplace/characters/[id]    // Detalles
POST   /api/community/marketplace/characters/[id]/download  // Descargar
POST   /api/community/marketplace/characters/[id]/import    // Importar
POST   /api/community/marketplace/characters/[id]/rate      // Rating
```

**Clave:** Full marketplace con descarga, importación y cloning.

---

## 12. CONVERSATION MEMORY MODELS

**Archivo:** `/prisma/schema.prisma` (Modelos de memoria)

```prisma
model EpisodicMemory {
  id          String @id @default(cuid())
  agentId     String
  userId      String?

  // Evento específico
  event       String      // "Primera conversación", "Usuario mencionó..."
  context     String      // Contexto del evento
  emotion     String      // Emoción en el momento
  importance  Float       // 0-1
  
  createdAt   DateTime @default(now())
  agent       Agent @relation(fields: [agentId], references: [id])
}

model SemanticMemory {
  id          String @id @default(cuid())
  agentId     String @unique
  
  // Hechos generales sobre el usuario
  facts       Json  // [{ "fact": "es ingeniero", "confidence": 0.9 }]
  preferences Json  // [{ "pref": "le gusta el anime", "weight": 0.8 }]
  knowledgeBase Json // Información adquirida
  
  agent       Agent @relation(fields: [agentId], references: [id])
}

model ProceduralMemory {
  id          String @id @default(cuid())
  agentId     String @unique
  
  // Habilidades, patrones
  skills      Json  // [{ "skill": "hacer chistes", "level": 0.7 }]
  patterns    Json  // Patrones de interacción
  
  agent       Agent @relation(fields: [agentId], references: [id])
}
```

**Clave:** 3 sistemas de memoria + búsqueda semántica.

---

## RESUMEN

**Líneas de código por característica:**

| Feature | Archivos | Líneas | Complejidad |
|---------|----------|--------|-------------|
| Proactive System | 7 | 2,000+ | Alta |
| Multimodal (Visual + Voice) | 9 | 1,500+ | Alta |
| Behavior System | 12 | 3,000+ | Muy alta |
| Safety Moderation | 4 | 500+ | Media |
| Memory Systems | 5 | 2,500+ | Alta |
| Community API | 30+ | 4,000+ | Muy alta |
| Emotional System | 15+ | 5,000+ | Muy alta |
| **TOTAL** | **82+** | **18,500+** | **Arquitectura compleja** |

