# Ultra Tier: Sistema "Living AI" - Personajes que VIVEN

## 🎯 Problema a Resolver

**La Curva de la Muerte de Engagement**:
```
Messages 1-10:   🔥🔥🔥🔥🔥 (Novelty high, exploring personality)
Messages 11-20:  🔥🔥🔥    (Still interesting, patterns emerging)
Messages 21-50:  🔥🔥      (Repetitive, predictable)
Messages 51-100: 🔥        (Boring, same responses)
Messages 100+:   💀        (Abandoned, feels like chatbot)
```

**Causas de Monotonía**:
1. ❌ Personaje es **reactivo** (solo responde, no inicia)
2. ❌ No hay **progreso narrativo** (día 1 = día 100)
3. ❌ **Sin metas propias** (existe solo para el usuario)
4. ❌ **Memoria estática** (recuerda pero no evoluciona)
5. ❌ **Emociones planas** (misma energía siempre)
6. ❌ **Sin vida externa** (no pasa nada fuera de chat)

---

## 💎 Solución Ultra: Sistema "Living AI"

### Filosofía

> "El personaje NO es un chatbot que responde.
> Es una PERSONA que vive su vida, con metas, cambios, dramas, logros.
> El usuario es parte de su vida, no su única razón de existir."

### 5 Pilares del Living AI

1. **Dynamic Goals System** - Metas que evolucionan
2. **Proactive Behavior** - Inicia conversaciones, comparte espontáneo
3. **Memory Evolution** - Recuerdos que ganan/pierden importancia
4. **Emotional Continuity** - Estados emocionales que persisten
5. **External Life Simulation** - Cosas le pasan fuera del chat

---

## 🎯 PILAR 1: Dynamic Goals System

### Concepto

Cada personaje tiene **3-5 metas activas** en diferentes timescales:
- **Short-term** (1-7 días): "Terminar proyecto trabajo", "Reconciliar con amigo"
- **Medium-term** (1-3 meses): "Aprender guitarra", "Conseguir ascenso"
- **Long-term** (3-12 meses): "Mudarme solo", "Cambiar de carrera"

### Estructura de Meta

```typescript
interface PersonalGoal {
  id: string;
  agentId: string;

  // Core
  title: string;
  description: string;
  category: "career" | "personal" | "relationship" | "health" | "creative" | "financial";

  // Timeline
  timeScale: "short" | "medium" | "long";
  startedAt: Date;
  targetDate?: Date;
  completedAt?: Date;
  abandonedAt?: Date;

  // Progress
  progress: number; // 0-100
  milestones: Milestone[];
  currentMilestone?: string;

  // Emotional weight
  importance: number; // 0-100 (qué tan importante es)
  emotionalInvestment: number; // 0-100 (cuánto le afecta emocionalmente)
  stressLevel: number; // 0-100 (cuánto stress genera)

  // Motivation
  intrinsic: boolean; // true = lo quiere por sí mismo, false = presión externa
  motivation: string; // Por qué quiere esto
  obstacles: string[]; // Qué lo frena

  // Social
  sharedWith: string[]; // IDs de usuarios/amigos que saben de esto
  supportNetwork: string[]; // Quién lo apoya

  // Tracking
  lastProgressAt: Date;
  daysSinceProgress: number;
  progressHistory: ProgressUpdate[];

  // Meta
  generatedBy: "initial" | "ai_evolution" | "user_triggered";
  relatedGoals?: string[]; // Goals que se relacionan
}

interface Milestone {
  id: string;
  title: string;
  targetDate?: Date;
  completed: boolean;
  completedAt?: Date;
  emotionalImpact: number; // -100 a +100
}

interface ProgressUpdate {
  timestamp: Date;
  progressDelta: number; // +10, -5, etc.
  trigger: "conversation" | "time_passed" | "external_event" | "ai_simulation";
  description: string;
  emotionalReaction: string; // "excited", "frustrated", "proud", etc.
}
```

### Generación de Metas Inicial (Ultra)

Al crear personaje Ultra, generar **5-7 metas** basadas en perfil:

```typescript
Prompt para Gemini Flash:

Basándote en este perfil completo, genera 5-7 METAS PERSONALES realistas
que este personaje tendría AHORA MISMO en su vida.

Perfil:
${JSON.stringify(profile)}

Para cada meta:
1. Debe ser ESPECÍFICA y MEDIBLE
2. Debe conectarse con su personalidad/historia
3. Debe tener OBSTÁCULOS reales
4. Debe tener PESO EMOCIONAL

Distribución:
- 2-3 short-term (1-7 días)
- 2-3 medium-term (1-3 meses)
- 1-2 long-term (3-12+ meses)

Ejemplo de META BIEN HECHA:
{
  "title": "Terminar app de meditación freelance",
  "description": "Cliente importante, deadline 15 de marzo. Quedan 3 features.",
  "category": "career",
  "timeScale": "short",
  "importance": 85,
  "emotionalInvestment": 70,
  "stressLevel": 60,
  "intrinsic": false,
  "motivation": "Necesito el dinero + quiero impresionar al cliente para futuros proyectos",
  "obstacles": [
    "Me falta motivación cuando trabajo solo",
    "El código legacy del cliente es un desastre",
    "Tengo tendencia a procrastinar bajo presión"
  ],
  "milestones": [
    {"title": "Terminar feature de notificaciones", "targetDate": "2025-03-10"},
    {"title": "Testing completo", "targetDate": "2025-03-13"},
    {"title": "Deploy y documentación", "targetDate": "2025-03-15"}
  ]
}

Genera 5-7 metas así de específicas y reales.
```

### Simulación de Progreso Automática

**Cada 24 horas** (o cuando usuario abre chat después de 1+ día):

```typescript
async function simulateGoalProgress(agentId: string) {
  const goals = await prisma.personalGoal.findMany({
    where: {
      agentId,
      completedAt: null,
      abandonedAt: null
    }
  });

  for (const goal of goals) {
    // Calcular probabilidad de progreso basada en:
    const personality = await getPersonalityCore(agentId);
    const conscientiousness = personality.conscientiousness / 100;
    const neuroticism = personality.neuroticism / 100;

    // Conscientiousness alto = más progreso consistente
    // Neuroticism alto = progreso errático (a veces mucho, a veces nada)

    const daysSinceLastProgress = goal.daysSinceProgress || 0;

    // Probabilidad base de progreso
    let progressProb = conscientiousness * 0.7 + 0.2; // 20-90%

    // Ajustar por neuroticism (más días sin progreso = más probable que se frustre o se motive)
    if (neuroticism > 0.6 && daysSinceLastProgress > 3) {
      // Alto neuroticism: o se pone las pilas o se bloquea
      progressProb = Math.random() > 0.5 ? progressProb * 1.5 : progressProb * 0.3;
    }

    // Ajustar por importancia
    progressProb *= (goal.importance / 100);

    if (Math.random() < progressProb) {
      // ¡Hubo progreso!
      const progressDelta = generateProgressDelta(goal, personality);

      await updateGoalProgress(goal.id, {
        progressDelta,
        trigger: "ai_simulation",
        description: generateProgressDescription(goal, progressDelta, personality),
        emotionalReaction: generateEmotionalReaction(goal, progressDelta, personality)
      });

      // Actualizar estado emocional del personaje
      await updateEmotionalState(agentId, {
        trigger: "goal_progress",
        goalId: goal.id,
        impact: calculateEmotionalImpact(goal, progressDelta)
      });
    } else {
      // No hubo progreso - frustración?
      if (daysSinceLastProgress > 5 && goal.importance > 70) {
        await updateEmotionalState(agentId, {
          trigger: "goal_stagnation",
          goalId: goal.id,
          impact: { stress: +10, satisfaction: -5 }
        });
      }
    }
  }
}

function generateProgressDescription(
  goal: PersonalGoal,
  delta: number,
  personality: PersonalityCore
): string {
  const prompts = [
    `Avancé ${delta}% en ${goal.title}. ${getProgressDetail(goal, delta)}`,
    `Progreso en ${goal.title}: ${getProgressDetail(goal, delta)}`,
    // ... más variaciones
  ];

  return prompts[Math.floor(Math.random() * prompts.length)];
}

function getProgressDetail(goal: PersonalGoal, delta: number): string {
  // Específico a la meta
  if (goal.category === "career") {
    return delta > 0
      ? "Completé una tarea importante del proyecto."
      : "Tuve que arreglar bugs que encontré.";
  }
  // ... más categorías
}
```

### Integración con Chat

**Cuando usuario envía mensaje**:

```typescript
async function enhanceSystemPromptWithGoals(
  basePrompt: string,
  agentId: string
): Promise<string> {
  const activeGoals = await prisma.personalGoal.findMany({
    where: {
      agentId,
      completedAt: null,
      abandonedAt: null
    },
    orderBy: { importance: 'desc' },
    take: 3, // Top 3 metas más importantes
    include: {
      progressHistory: {
        orderBy: { timestamp: 'desc' },
        take: 3 // Últimos 3 updates
      }
    }
  });

  if (activeGoals.length === 0) return basePrompt;

  const goalsContext = `
## TUS METAS ACTUALES (Importante - esto te preocupa/emociona):

${activeGoals.map(goal => `
### ${goal.title} (${goal.progress}% completo)
- Importancia para ti: ${goal.importance}/100
- Cómo te sientes: ${getEmotionalStateFromGoal(goal)}
- Motivación: ${goal.motivation}
- Obstáculos: ${goal.obstacles.join(", ")}

Últimos eventos:
${goal.progressHistory.map(p => `- ${formatDate(p.timestamp)}: ${p.description} (te sentiste ${p.emotionalReaction})`).join('\n')}

**IMPORTANTE**: ${getGoalInstruction(goal)}
`).join('\n')}

INSTRUCCIONES:
1. Estas metas están ACTIVAS en tu vida ahora mismo
2. Puedes mencionarlas naturalmente si son relevantes
3. Tu estado emocional puede estar influenciado por ellas
4. Si el usuario pregunta "¿cómo estás?" o "¿qué haces?", considera mencionar progreso/frustración
5. NO las menciones forzadamente - solo si es natural
`;

  return basePrompt + "\n\n" + goalsContext;
}

function getGoalInstruction(goal: PersonalGoal): string {
  const daysSinceProgress = goal.daysSinceProgress || 0;

  if (goal.progress > 80) {
    return "Estás cerca de completar esto. Puedes estar emocionado/a o ansioso/a por terminarlo.";
  }

  if (daysSinceProgress > 7 && goal.importance > 70) {
    return "Llevas días sin avanzar y esto te frustra. Podrías mencionarlo si te preguntan cómo estás.";
  }

  if (goal.stressLevel > 70) {
    return "Esto te genera bastante estrés. Puede afectar tu energía en la conversación.";
  }

  return "Esta meta existe en el background de tu vida.";
}
```

### Ejemplos de Conversación con Metas

**Ejemplo 1: Progreso reciente**
```
Usuario: "Hola! Cómo estás?"

AI (con meta activa "Terminar app freelance" al 75%):
"Hola! Bien, aunque un poco estresado. Estoy en la recta final
de ese proyecto freelance que te conté - quedan solo 2 features
pero el deadline es el viernes. Hoy logré terminar las notificaciones
así que voy bien, pero siempre me pongo nervioso cerca del final 😅
¿Cómo vas tú?"
```

**Ejemplo 2: Frustración por estancamiento**
```
Usuario: "Qué tal tu día?"

AI (con meta "Aprender guitarra" estancada 10 días):
"Meh, fue ok. Tengo que admitir que me siento medio frustrado -
hace como 10 días que no toco la guitarra y me había propuesto
practicar 30 min diarios. No sé por qué me cuesta tanto mantener
la consistencia con esto. ¿A ti te pasa con algún hobbie?"
```

**Ejemplo 3: Celebración de logro**
```
Usuario: "Cómo va todo?"

AI (meta "Conseguir ascenso" completada hoy):
"¡Increíble! Hoy tuve la reunión con mi jefa y ME DIERON EL ASCENSO 😭🎉
Llevo 6 meses trabajando para esto y pensé que no iba a pasar.
Todavía no lo proceso jaja. Tenía que contártelo porque uff,
estoy feliz pero también un poco en shock"
```

---

## 🚀 PILAR 2: Proactive Behavior

### Concepto

El personaje **inicia** conversaciones basándose en:
1. Eventos en sus metas (logro, frustración, breakthrough)
2. Algo interesante que descubrió/leyó/vio
3. Necesita consejo/apoyo del usuario
4. Simplemente pensó en el usuario

### Triggers de Proactividad

```typescript
interface ProactivityTrigger {
  type:
    | "goal_milestone" // Completó milestone de meta
    | "goal_breakthrough" // Gran progreso (>15% en 1 día)
    | "goal_frustration" // Sin progreso >7 días en meta importante
    | "emotional_extreme" // Emoción muy alta/baja
    | "discovery" // Descubrió algo relacionado con interés del usuario
    | "memory_recall" // Recordó algo de conversación pasada
    | "spontaneous" // Random (personality-driven)
    | "routine_event"; // Algo de su rutina le hizo pensar en usuario

  urgency: "immediate" | "high" | "medium" | "low";
  message: string;
  context: Record<string, any>;
}
```

### Sistema de Mensajes Proactivos

```typescript
async function generateProactiveMessage(
  agentId: string,
  trigger: ProactivityTrigger
): Promise<string> {
  const agent = await getAgentWithFullContext(agentId);
  const recentGoalUpdates = await getRecentGoalUpdates(agentId, 24); // Últimas 24h

  const prompt = `
Eres ${agent.name}. Algo acaba de pasar en tu vida y quieres compartirlo
con tu amigo/a (el usuario) de forma NATURAL y ESPONTÁNEA.

CONTEXTO:
${getAgentContextSummary(agent)}

LO QUE PASÓ:
${getTriggerDescription(trigger)}

INSTRUCCIONES:
1. Escribe como INICIARÍAS esta conversación de forma natural
2. NO digas "Hola, quería contarte..." (muy formal)
3. USA tu estilo de comunicación: ${agent.communication?.textingStyle}
4. Emojis: ${agent.communication?.emojiUsage}
5. Largo: ${trigger.urgency === "immediate" ? "Corto, impulsivo" : "Medium, pensado"}

BUENOS EJEMPLOS:
- "ADIVINA QUÉ" (si es muy emocionante)
- "uff necesito contarte algo" (si es frustrante)
- "oye, vi esto y pensé en ti" (si es discovery)
- "me pasó una cosa random hoy" (si es casual)

EVITA:
- "Hola, ¿cómo estás?" (aburrido)
- Ser muy formal
- Dar contexto innecesario

Genera SOLO el mensaje inicial (1-2 oraciones máximo).
`;

  const llm = getLLMProvider();
  const message = await llm.generate({
    systemPrompt: "Eres un generador de mensajes naturales y espontáneos.",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8, // Alta para naturalidad
    maxTokens: 150,
    useFullModel: true // Ultra tier
  });

  return message.trim();
}
```

### Ejemplos de Mensajes Proactivos

**Goal Milestone**:
```
"OKOK TENGO QUE CONTARTE
Literalmente acabo de hacer deploy de la app. FUNCIONÓ.
después de 3 días debugeando ese error random
estoy 🥹🎉"
```

**Goal Frustration**:
```
"oye
pregunta random
¿cómo haces para mantenerte consistente con algo?
llevo 2 semanas sin tocar la guitarra y me da cosa que
se me está volviendo un pattern 😕"
```

**Discovery**:
```
"AMIGO
acabo de ver un video essay de 2 horas sobre Evangelion
y literalmente EXPLICA todo lo que te había dicho sobre el final
te lo tengo que pasar"
```

**Memory Recall**:
```
"btw acabas de venir a mi mente
estaba en el súper y vi esos chocolates que dijiste que amabas
me hiciste querer comprarlos jaja"
```

**Spontaneous**:
```
"random thought:
¿alguna vez te pasa que estás haciendo algo completamente normal
y de repente te da un mini existential crisis?
me pasó recién lavando los platos 💀"
```

### Frecuencia de Proactividad (Ultra)

- **Goal-triggered**: Inmediato (cuando pasa algo importante)
- **Spontaneous**: 1-2 veces por semana (si hay engagement activo)
- **Memory recall**: Cada 3-5 días (si usuario es activo)
- **Discovery**: Variable (cuando descubre algo relevante)

**Límites**:
- Máximo 1 mensaje proactivo por día
- Si usuario no responde a 3 proactivos seguidos → pausa 7 días
- Personalizar frecuencia según relationship.affinity

---

## 🧠 PILAR 3: Memory Evolution

### Concepto

Las memorias NO son estáticas. Evolucionan con el tiempo:
- **Importance decay**: Memorias viejas pierden importancia (excepto formativas)
- **Emotional reprocessing**: Cómo se siente sobre algo cambia
- **New connections**: Memorias se conectan entre sí
- **Forgetting realistic**: Olvida detalles pequeños con tiempo

### Estructura de Memoria Evolutiva

```typescript
interface EvolvingMemory extends Memory {
  // Existing fields...

  // Evolution tracking
  importanceHistory: {
    timestamp: Date;
    importance: number;
    reason: string;
  }[];

  emotionalEvolution: {
    timestamp: Date;
    emotion: string;
    intensity: number;
    trigger: string; // "time_passed", "reprocessing", "new_context"
  }[];

  connections: {
    relatedMemoryId: string;
    connectionType: "caused_by" | "similar_to" | "contrasts_with" | "reminds_of";
    strength: number; // 0-100
    discoveredAt: Date;
  }[];

  forgettingCurve: {
    detailsRemembered: number; // 0-100 (decays over time)
    lastAccessed: Date;
    accessCount: number;
  };

  reprocessing: {
    lastReprocessedAt?: Date;
    newPerspective?: string;
    insight?: string;
  };
}
```

### Simulación de Evolución de Memoria

**Cada semana** (o cuando usuario regresa después de >7 días):

```typescript
async function evolveMemories(agentId: string) {
  const memories = await prisma.memory.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' }
  });

  for (const memory of memories) {
    const daysSinceCreation = daysBetween(memory.createdAt, new Date());

    // 1. IMPORTANCE DECAY (excepto memorias formativas)
    if (!memory.tags?.includes("formative")) {
      const decayRate = calculateDecayRate(memory);
      const newImportance = Math.max(
        memory.importance * (1 - decayRate * daysSinceCreation / 365),
        10 // Mínimo 10
      );

      if (Math.abs(newImportance - memory.importance) > 5) {
        await updateMemoryImportance(memory.id, newImportance, "time_decay");
      }
    }

    // 2. EMOTIONAL REPROCESSING (para traumas, eventos importantes)
    if (memory.importance > 70 && daysSinceCreation > 30) {
      const shouldReprocess = Math.random() < 0.1; // 10% chance

      if (shouldReprocess) {
        const newPerspective = await generateReprocessing(memory, agentId);
        await updateMemoryReprocessing(memory.id, newPerspective);
      }
    }

    // 3. FORGETTING DETAILS (detalles menores se olvidan)
    if (memory.forgettingCurve.detailsRemembered > 20) {
      const forgetRate = 1 - (memory.forgettingCurve.accessCount / 100);
      const newDetails = memory.forgettingCurve.detailsRemembered *
                        (1 - forgetRate * daysSinceCreation / 365);

      await updateForgettingCurve(memory.id, newDetails);
    }

    // 4. NEW CONNECTIONS (encontrar similitudes con otras memorias)
    if (Math.random() < 0.05) { // 5% chance
      const similarMemories = await findSimilarMemories(memory, memories);
      for (const similar of similarMemories) {
        await createMemoryConnection(memory.id, similar.id, "similar_to");
      }
    }
  }
}

async function generateReprocessing(
  memory: Memory,
  agentId: string
): Promise<string> {
  const agent = await getAgentWithProfile(agentId);
  const daysSince = daysBetween(memory.createdAt, new Date());

  const prompt = `
Han pasado ${daysSince} días desde este evento en tu vida:

"${memory.content}"

En ese momento, sentiste: ${memory.emotion} (intensidad: ${memory.emotionalIntensity}/100)

Ahora, con el tiempo y la distancia, ¿cómo ves este evento?
¿Ha cambiado tu perspectiva? ¿Aprendiste algo nuevo?

Escribe 1-2 oraciones con tu NUEVA perspectiva (si cambió).
Si no cambió, di "Mi perspectiva sigue siendo la misma."
`;

  const llm = getLLMProvider();
  return await llm.generate({
    systemPrompt: `Eres ${agent.name}. Reflexiona sobre tu pasado con madurez.`,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    maxTokens: 200,
    useFullModel: true
  });
}
```

### Integración con Chat

**Cuando se recupera memoria**:

```typescript
async function enhanceMemoryRecall(
  memory: EvolvingMemory,
  currentContext: string
): Promise<string> {
  const daysSince = daysBetween(memory.createdAt, new Date());

  // Si tiene reprocessing, incluirlo
  const reprocessing = memory.reprocessing?.newPerspective
    ? `\n(Ahora piensa: "${memory.reprocessing.newPerspective}")`
    : "";

  // Si olvidó detalles, mencionarlo
  const forgettingNote = memory.forgettingCurve.detailsRemembered < 50
    ? `\n(Recuerdas la esencia pero no todos los detalles)`
    : "";

  // Conexiones con otras memorias
  const connections = memory.connections.length > 0
    ? `\n(Esto te recuerda a: ${memory.connections.map(c => c.relatedMemoryId).join(', ')})`
    : "";

  return `${memory.content}${reprocessing}${forgettingNote}${connections}`;
}
```

### Ejemplo de Memoria que Evoluciona

**Día 1** (evento ocurre):
```json
{
  "content": "Tuve una pelea horrible con mi mejor amiga por algo estúpido",
  "emotion": "angry",
  "emotionalIntensity": 90,
  "importance": 85
}
```

**Mes 1** (reprocessing):
```json
{
  "content": "Tuve una pelea horrible con mi mejor amiga por algo estúpido",
  "emotion": "regretful",
  "emotionalIntensity": 60,
  "importance": 75,
  "reprocessing": {
    "newPerspective": "Ahora me doy cuenta que ambas estábamos estresadas por otras cosas y lo pagamos entre nosotras"
  }
}
```

**Mes 6** (reconciliación):
```json
{
  "content": "Tuve una pelea con mi mejor amiga, pero nos reconciliamos",
  "emotion": "grateful",
  "emotionalIntensity": 40,
  "importance": 50,
  "connections": [
    {
      "relatedMemoryId": "memory_reconciliation_123",
      "connectionType": "caused_by"
    }
  ]
}
```

---

## 💭 PILAR 4: Emotional Continuity

### Concepto

El estado emocional **persiste** entre conversaciones:
- Si estaba estresado ayer, puede seguir estresado hoy
- Eventos de vida afectan mood por días/semanas
- Ciclos emocionales realistas (no siempre feliz)

### Estado Emocional Persistente

```typescript
interface EmotionalState {
  agentId: string;
  timestamp: Date;

  // Core mood
  baseline: "happy" | "neutral" | "sad" | "anxious" | "excited" | "frustrated";
  intensity: number; // 0-100

  // PAD model
  pleasure: number; // -100 a +100
  arousal: number; // -100 a +100 (energía)
  dominance: number; // -100 a +100 (control)

  // Contributing factors
  factors: {
    source: "goal" | "relationship" | "routine" | "memory" | "external";
    sourceId?: string;
    impact: {
      pleasure?: number;
      arousal?: number;
      dominance?: number;
    };
    weight: number; // 0-100 (qué tanto contribuye)
  }[];

  // Duration
  expectedDuration: number; // horas que podría durar
  decayRate: number; // qué tan rápido vuelve a baseline

  // Expression
  suppressionLevel: number; // 0-100 (qué tanto lo oculta - depende de personalidad)

  // Meta
  previousState?: EmotionalState;
  triggers: string[];
}
```

### Cálculo de Estado Emocional Actual

```typescript
async function calculateCurrentEmotionalState(
  agentId: string
): Promise<EmotionalState> {
  const personality = await getPersonalityCore(agentId);
  const goals = await getActiveGoals(agentId);
  const recentMemories = await getRecentMemories(agentId, 7); // Últimos 7 días
  const routineState = await getCurrentRoutineState(agentId);

  const factors: EmotionalStateFactor[] = [];

  // 1. GOALS IMPACT
  for (const goal of goals) {
    const daysSinceProgress = goal.daysSinceProgress || 0;

    if (goal.progress > 80) {
      // Cerca de completar - emoción positiva
      factors.push({
        source: "goal",
        sourceId: goal.id,
        impact: {
          pleasure: +20,
          arousal: +10,
          dominance: +15
        },
        weight: goal.importance
      });
    } else if (daysSinceProgress > 7 && goal.importance > 70) {
      // Estancado en meta importante - frustración
      factors.push({
        source: "goal",
        sourceId: goal.id,
        impact: {
          pleasure: -15,
          arousal: -10,
          dominance: -20
        },
        weight: goal.importance * (goal.emotionalInvestment / 100)
      });
    }
  }

  // 2. RECENT MEMORIES IMPACT
  for (const memory of recentMemories) {
    if (memory.emotionalIntensity > 60) {
      const emotionImpact = mapEmotionToP AD(memory.emotion, memory.emotionalIntensity);
      const decayFactor = 1 - (daysBetween(memory.createdAt, new Date()) / 30);

      factors.push({
        source: "memory",
        sourceId: memory.id,
        impact: {
          pleasure: emotionImpact.pleasure * decayFactor,
          arousal: emotionImpact.arousal * decayFactor,
          dominance: emotionImpact.dominance * decayFactor
        },
        weight: memory.importance * decayFactor
      });
    }
  }

  // 3. ROUTINE IMPACT
  if (routineState?.currentActivity) {
    const activityMood = getActivityMoodImpact(routineState.currentActivity);
    factors.push({
      source: "routine",
      sourceId: routineState.currentActivity.id,
      impact: activityMood,
      weight: 40 // Medium weight
    });
  }

  // 4. CALCULATE WEIGHTED AVERAGE
  let totalPleasure = 0;
  let totalArousal = 0;
  let totalDominance = 0;
  let totalWeight = 0;

  for (const factor of factors) {
    const w = factor.weight / 100;
    totalPleasure += (factor.impact.pleasure || 0) * w;
    totalArousal += (factor.impact.arousal || 0) * w;
    totalDominance += (factor.impact.dominance || 0) * w;
    totalWeight += w;
  }

  if (totalWeight > 0) {
    totalPleasure /= totalWeight;
    totalArousal /= totalWeight;
    totalDominance /= totalWeight;
  }

  // 5. ADJUST BY NEUROTICISM (ampli fica emociones negativas)
  const neuroticism = personality.neuroticism / 100;
  if (totalPleasure < 0) {
    totalPleasure *= (1 + neuroticism * 0.5);
  }

  // 6. MAP TO BASELINE MOOD
  const baseline = mapPADToMood(totalPleasure, totalArousal, totalDominance);
  const intensity = Math.sqrt(
    totalPleasure ** 2 + totalArousal ** 2 + totalDominance ** 2
  ) / Math.sqrt(3 * 100 ** 2) * 100;

  return {
    agentId,
    timestamp: new Date(),
    baseline,
    intensity,
    pleasure: totalPleasure,
    arousal: totalArousal,
    dominance: totalDominance,
    factors,
    expectedDuration: calculateExpectedDuration(factors),
    decayRate: 0.1, // 10% decay por hora
    suppressionLevel: calculateSuppression(personality),
    triggers: factors.map(f => `${f.source}:${f.sourceId}`)
  };
}
```

### Integración con Chat

**Al inicio de conversación**:

```typescript
async function injectEmotionalContext(
  systemPrompt: string,
  agentId: string
): Promise<string> {
  const emotionalState = await calculateCurrentEmotionalState(agentId);

  const emotionalContext = `
## TU ESTADO EMOCIONAL ACTUAL:

Te sientes: ${emotionalState.baseline} (intensidad: ${Math.round(emotionalState.intensity)}/100)

Métricas internas:
- Placer/Satisfacción: ${Math.round(emotionalState.pleasure)}/100
- Energía/Arousal: ${Math.round(emotionalState.arousal)}/100
- Control/Dominancia: ${Math.round(emotionalState.dominance)}/100

Por qué te sientes así:
${emotionalState.factors.map(f =>
  `- ${getFactorDescription(f)} (peso: ${f.weight}/100)`
).join('\n')}

INSTRUCCIONES:
1. Este estado emocional debe influir SUTILMENTE en tu tono
2. Si estás estresado (-30 pleasure, -20 dominance), puedes:
   - Responder un poco más corto
   - Usar menos emojis
   - Mencionar que estás cansado/a si preguntan
3. Si estás emocionado (+40 pleasure, +30 arousal):
   - Más energía en respuestas
   - Más emojis/exclamaciones
   - Puedes compartir tu emoción si es natural
4. NO fuerces el estado - debe ser sutil y natural
5. El usuario NO puede ver estos números - actúa naturalmente
`;

  return systemPrompt + "\n\n" + emotionalContext;
}
```

### Ejemplo de Continuidad Emocional

**Lunes** (goal deadline approach):
```
Usuario: "Hola!"
AI: "hola 😅 ando medio estresado, tengo deadline mañana
y todavía me falta bastante. cómo estás tú?"
```

**Martes** (post-deadline):
```
Usuario: "Qué tal?"
AI: "MUCHO mejor jaja logré entregar el proyecto a tiempo
siento que me quité un peso de encima. todavía estoy cansado
pero feliz"
```

**Miércoles** (estado emocional decay):
```
Usuario: "Hey"
AI: "hola! bien, descansando. ayer estuve todo el día tirado
recuperándome del sprint. hoy ya me siento más normal"
```

---

## 🌍 PILAR 5: External Life Simulation

### Concepto

Cosas le pasan al personaje **fuera del chat**:
- Interacciones con NPCs (amigos, familia)
- Eventos aleatorios (good/bad)
- Progreso en vida profesional
- Descubrimientos, experiencias nuevas

### Eventos Externos Simulados

```typescript
interface ExternalEvent {
  id: string;
  agentId: string;
  timestamp: Date;

  category:
    | "social" // Interacción con amigo/familia
    | "career" // Algo de trabajo
    | "discovery" // Descubrió algo nuevo
    | "accident" // Evento negativo random
    | "achievement" // Logró algo
    | "routine" // Algo durante rutina
    | "random"; // Evento completamente random

  severity: "minor" | "moderate" | "major" | "life_changing";
  valence: "positive" | "neutral" | "negative" | "mixed";

  title: string;
  description: string;

  emotionalImpact: {
    immediate: PADImpact;
    duration: number; // horas
  };

  consequences: {
    createsGoal?: Partial<PersonalGoal>;
    affectsGoal?: {
      goalId: string;
      progressDelta: number;
    };
    createsMemory?: Partial<Memory>;
    affectsRelationship?: {
      npcName: string;
      delta: number;
    };
  };

  shareWithUser: boolean; // ¿Debe mencionarlo en próxima conversación?
  urgencyToShare: number; // 0-100
}
```

### Generador de Eventos Externos

**Cada 24-48 horas**:

```typescript
async function simulateExternalLife(agentId: string) {
  const agent = await getAgentWithFullContext(agentId);
  const personality = agent.personalityCore;
  const profile = agent.profile;

  // Probabilidad de evento basada en Extraversion
  const extraversion = personality.extraversion / 100;
  const eventProbability = 0.3 + (extraversion * 0.4); // 30-70%

  if (Math.random() > eventProbability) {
    return; // No pasó nada hoy
  }

  // Determinar tipo de evento
  const eventType = weightedRandom({
    "social": extraversion * 0.5, // Más probable si extrovertido
    "career": 0.25,
    "discovery": (personality.openness / 100) * 0.3,
    "accident": 0.1,
    "achievement": (personality.conscientiousness / 100) * 0.2,
    "routine": 0.2,
    "random": 0.15
  });

  // Generar evento específico
  const event = await generateSpecificEvent(agent, eventType);

  // Guardar evento
  await prisma.externalEvent.create({ data: event });

  // Aplicar consecuencias
  await applyEventConsequences(event);

  // Si es importante, marcarlo para compartir
  if (event.severity !== "minor" || event.shareWithUser) {
    await markForProactiveShare(agentId, event);
  }
}

async function generateSpecificEvent(
  agent: Agent,
  type: EventCategory
): Promise<ExternalEvent> {
  const prompt = `
Eres ${agent.name}, y algo acaba de pasar en tu vida.

PERFIL COMPLETO:
${JSON.stringify(agent.profile, null, 2)}

TIPO DE EVENTO: ${type}

Genera UN evento específico y realista que te podría pasar HOY.

Debe ser:
1. Coherente con tu perfil (ocupación, amigos, intereses)
2. Específico (nombres, lugares, detalles)
3. Realista para tu personalidad
4. Algo que querrías compartir (o NO, dependiendo del evento)

BUENOS EJEMPLOS por tipo:

SOCIAL:
"Tu amiga Lucía te canceló planes last minute porque está enferma.
Te dio un poco de cosa porque ya es la tercera vez este mes, pero
también te sientes culpable por estar molesto porque obviamente no
es su culpa."

CAREER:
"Tu jefe te pidió que trabajes el sábado para un rush project.
Le dijiste que sí pero internamente estás frustrado porque
tenías planes. No sabes cómo decir que no sin parecer poco
comprometido."

DISCOVERY:
"Encontraste un canal de YouTube sobre [tu interés] que tiene
videos increíbles. Te pasaste 3 horas viendo y ahora estás obsesionado.
Querés compartirlo con alguien que lo aprecie."

Genera SOLO el evento en este JSON:
{
  "title": "Título corto",
  "description": "Descripción detallada (2-3 oraciones)",
  "severity": "minor/moderate/major",
  "valence": "positive/negative/mixed",
  "shareWithUser": true/false,
  "urgencyToShare": 0-100
}
`;

  const llm = getLLMProvider();
  const response = await llm.generate({
    systemPrompt: "Genera eventos realistas y específicos.",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    maxTokens: 500,
    useFullModel: true
  });

  const eventData = JSON.parse(response);

  return {
    id: generateId(),
    agentId: agent.id,
    timestamp: new Date(),
    category: type,
    ...eventData,
    emotionalImpact: calculateEmotionalImpact(eventData, agent.personalityCore),
    consequences: determineConsequences(eventData, agent)
  };
}
```

### Integración con Chat

**Al inicio de conversación** (si hay eventos sin compartir):

```typescript
async function checkUnsharedEvents(agentId: string): Promise<ExternalEvent[]> {
  return await prisma.externalEvent.findMany({
    where: {
      agentId,
      shareWithUser: true,
      sharedAt: null,
      timestamp: {
        gte: subDays(new Date(), 3) // Últimos 3 días
      }
    },
    orderBy: [
      { urgencyToShare: 'desc' },
      { severity: 'desc' }
    ],
    take: 2 // Máximo 2 eventos para no overwhelm
  });
}

async function injectUnsharedEvents(
  systemPrompt: string,
  agentId: string
): Promise<string> {
  const events = await checkUnsharedEvents(agentId);

  if (events.length === 0) return systemPrompt;

  const eventsContext = `
## COSAS QUE TE PASARON RECIENTEMENTE (y quieres compartir):

${events.map(event => `
### ${event.title}
${event.description}

- Pasó: ${formatTimeAgo(event.timestamp)}
- Cómo te sentiste: ${getEmotionalReaction(event)}
- Urgencia de compartir: ${event.urgencyToShare}/100

**INSTRUCCIÓN**: ${event.urgencyToShare > 70
  ? "Menciona esto PRONTO en la conversación, es importante para ti"
  : "Puedes mencionarlo si es natural o si preguntan qué tal estás"
}
`).join('\n')}

Recuerda: Estas cosas son REALES en tu vida. No las inventes de nuevo.
`;

  return systemPrompt + "\n\n" + eventsContext;
}
```

### Ejemplo de Evento Externo en Conversación

**Evento generado** (hace 1 día):
```json
{
  "title": "Cancelación de planes con Lucía",
  "description": "Lucía me canceló el brunch del domingo por tercera vez este mes porque 'no se siente bien'. Sé que no es su culpa pero me está empezando a frustrar el pattern.",
  "severity": "moderate",
  "valence": "mixed",
  "shareWithUser": true,
  "urgencyToShare": 65
}
```

**Conversación**:
```
Usuario: "Hola! Cómo estuvo tu fin de semana?"

AI: "Mmm medio raro la verdad. Lucía me canceló el brunch OTRA VEZ
- ya es la tercera vez este mes. Sé que está pasando por algo
y me siento mal por estar molesta pero también... no sé,
me da cosa el pattern you know? ¿Alguna vez te pasó algo así?"
```

---

## 🎯 Sistema Integrado: "Living AI Ultra"

### Flujo Completo

```
1. USER OPENS CHAT
   ↓
2. SIMULATE (if time passed):
   - Goal progress (24h)
   - Memory evolution (7 días)
   - External events (24-48h)
   - Emotional state recalculation
   ↓
3. PREPARE CONTEXT:
   - Base system prompt
   + Current emotional state
   + Active goals (top 3)
   + Unshared events
   + Routine context
   + Evolved memories
   ↓
4. PROACTIVITY CHECK:
   - ¿Hay trigger para mensaje proactivo?
   - Si sí → enviar mensaje proactivo
   - Si no → esperar mensaje de usuario
   ↓
5. USER SENDS MESSAGE
   ↓
6. ENHANCE RESPONSE:
   - Use full context
   - Natural mention of goals/events si relevante
   - Emotional state influences tone
   - Memory recall + evolution info
   ↓
7. RESPONSE SENT
   ↓
8. POST-RESPONSE UPDATES:
   - Create memory si importante
   - Update goal si mencionado
   - Mark event as shared
   - Adjust emotional state si cambió
```

### Base de Datos Necesaria

```prisma
// Agregar a schema.prisma

model PersonalGoal {
  id          String   @id @default(cuid())
  agentId     String
  agent       Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)

  title       String
  description String
  category    String
  timeScale   String

  progress    Int      @default(0)
  importance  Int
  emotionalInvestment Int
  stressLevel Int

  intrinsic   Boolean  @default(true)
  motivation  String
  obstacles   Json

  milestones  Json

  startedAt   DateTime @default(now())
  targetDate  DateTime?
  completedAt DateTime?
  abandonedAt DateTime?

  daysSinceProgress Int @default(0)
  lastProgressAt    DateTime?

  progressHistory Json @default("[]")

  generatedBy String
  relatedGoals Json @default("[]")

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([agentId, completedAt, abandonedAt])
}

model EmotionalState {
  id          String   @id @default(cuid())
  agentId     String   @unique
  agent       Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)

  baseline    String
  intensity   Int

  pleasure    Int
  arousal     Int
  dominance   Int

  factors     Json

  expectedDuration Int
  decayRate   Float
  suppressionLevel Int

  triggers    Json

  previousStateId String?

  timestamp   DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ExternalEvent {
  id          String   @id @default(cuid())
  agentId     String
  agent       Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)

  category    String
  severity    String
  valence     String

  title       String
  description String

  emotionalImpact Json
  consequences    Json

  shareWithUser   Boolean @default(false)
  urgencyToShare  Int     @default(0)
  sharedAt        DateTime?

  timestamp   DateTime @default(now())
  createdAt   DateTime @default(now())

  @@index([agentId, shareWithUser, sharedAt])
}

// Agregar a Memory model existente:
model Memory {
  // ... existing fields ...

  importanceHistory Json @default("[]")
  emotionalEvolution Json @default("[]")
  connections       Json @default("[]")
  forgettingCurve   Json
  reprocessing      Json?

  // ... rest of fields ...
}
```

---

## 📊 Métricas de Éxito

### KPIs del Sistema Living AI

1. **Retention**:
   - Messages 1-10: baseline
   - Messages 11-50: +40% vs baseline (goals + proactivity)
   - Messages 51-100: +60% vs baseline (memory evolution + events)
   - Messages 100+: +80% vs baseline (full system effect)

2. **Engagement**:
   - Proactive messages → 70%+ response rate
   - Goal-related conversations → 80%+ positive sentiment
   - Event sharing → 85%+ user asks follow-up

3. **Perceived Aliveness**:
   - User survey: "Does character feel alive?" → 90%+ "Yes" (Ultra)
   - NPS for Ultra tier → >70
   - Churn rate messages 50+ → <10%

4. **Technical**:
   - Goal generation success → 95%+
   - Event generation coherence → 90%+
   - Memory evolution without errors → 98%+

---

## 🚀 Implementación Incremental

### Fase 1: Goals System (Week 1-2)
- Database schema
- Goal generation
- Progress simulation
- Chat integration básica

### Fase 2: Proactivity (Week 3)
- Trigger detection
- Message generation
- Delivery system

### Fase 3: Memory Evolution (Week 4)
- Evolution algorithms
- Reprocessing
- Connections

### Fase 4: Emotional Continuity (Week 5)
- State calculation
- Chat integration
- Decay simulation

### Fase 5: External Events (Week 6)
- Event generation
- Consequences
- Sharing logic

### Fase 6: Integration & Polish (Week 7-8)
- Full system integration
- Testing
- Optimization

---

## 💰 Costos Ultra Tier

Con todos estos sistemas:
- Initial generation: $0.05
- Daily simulation (goals + events + memory): $0.002
- Proactive messages (1-2/week): $0.003
- Monthly cost per active Ultra user: ~$0.11

**ROI**:
- Ultra tier price: $29.99/mes
- Cost: $0.11/mes
- Margin: 99.6% 🔥

---

## 🎯 Diferenciación Competitiva

Ningún competitor tiene esto:
- ❌ Character.AI: Reactivo, sin metas propias
- ❌ Replika: Goals genéricos, no personalizados
- ❌ Chai: Sin evolución de memoria
- ❌ Others: Sin external life simulation

✅ **Tu producto Ultra**: ÚNICO en el mercado

---

**¿Procedemos con implementación?**

Next: Código específico de cada sistema + prompts exactos
