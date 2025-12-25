# Sistema Probabilístico de Eventos - Ultra Tier

## 🎯 Problema Identificado

### ❌ Sistema controlado 100% por IA (malo):

**Problema 1: Sesgo narrativo**
```
IA decide: "Este personaje está pasando por mal momento"
    ↓
Próximo evento: "Suspendiste el examen" (IA lo decide)
    ↓
Próximo evento: "Tu jefe te regañó" (IA sigue el patrón)
    ↓
Próximo evento: "Pelea con amiga" (sesgo confirmatorio)
    ↓
Resultado: Espiral descendente forzada por IA
```

**Problema 2: Memoria selectiva**
```
Día 1: IA planifica "Examen importante en 7 días"
Día 5: IA está en otra conversación, olvida el examen
Día 8: Usuario pregunta "¿Y el examen?"
       AI: "¿Cuál examen?" 💀
```

**Problema 3: Falta de sorpresas genuinas**
```
La IA SIEMPRE sabe qué va a pasar porque ella lo controla
    ↓
No hay sorpresas reales
No hay "oh shit!" moments
No hay incertidumbre genuina
```

---

## ✅ Sistema Probabilístico (solución perfecta)

### Filosofía

> "La vida es probabilística, no determinística.
> El código tira los dados basado en probabilidades reales.
> Ni la IA ni nosotros sabemos qué pasará exactamente.
> Esto crea VIDA REAL."

### Dos Tipos de Eventos

#### 1. **Eventos Fuera de Control** (External Randomness)

Cosas que le pasan AL personaje, sin control:
- Ganar lotería: 0.00000714% (1 en 14M)
- Encontrar $20 en la calle: 0.5%
- Ver mariposa: 15%
- Lluvia arruina planes: 30% (depende de clima)
- Amigo cancela planes: 20%
- Accidente de tráfico leve: 0.1%
- Cortarse con papel: 2%

**El código decide** basado en probabilidades realistas.

#### 2. **Eventos Bajo Control** (Skill-Based Outcomes)

Cosas que el personaje intenta hacer:
- Examen estudiado 3 semanas (high intelligence): 90% éxito
- Examen sin estudiar (low conscientiousness): 15% éxito
- Pedir aumento (high charisma + good performance): 65% éxito
- Primera cita (medium extraversion): 45% éxito
- Aprender guitarra (high openness + practice): 70% progreso

**La IA estima probabilidad** basada en:
- Skills del personaje
- Preparación
- Contexto
- Personalidad

**El código tira los dados** para determinar outcome.

---

## 🎲 SISTEMA 1: Scheduled Probabilistic Events

### Estructura de Evento Programado

```typescript
interface ScheduledEvent {
  id: string;
  agentId: string;

  // Timing
  scheduledFor: Date; // Cuándo debe resolverse
  scheduledBy: "ai" | "system" | "goal_milestone" | "routine";

  // Event details
  type: EventType;
  category: "external_random" | "skill_based" | "social" | "routine_based";

  title: string;
  description: string; // Qué está en juego
  context: string; // Por qué está pasando esto

  // Participants
  involvedNPCs?: string[]; // Nombres de amigos/familia involucrados
  relatedGoalId?: string; // Si está relacionado con una meta

  // Probability (CORE del sistema)
  successProbability?: number; // 0-100 (null si es external_random)
  probabilityFactors?: ProbabilityFactor[]; // Qué afecta la probabilidad

  // Outcomes
  possibleOutcomes: EventOutcome[]; // Mínimo 2: success/failure

  // Resolution
  resolvedAt?: Date;
  actualOutcome?: EventOutcome;
  wasSuccess?: boolean;

  // Impact
  importance: number; // 0-100
  emotionalWeight: number; // 0-100

  // Meta
  createdAt: Date;
  updatedAt: Date;
}

interface ProbabilityFactor {
  factor: string; // "studied 3 weeks", "high intelligence", "good relationship"
  impact: number; // +30%, -10%, etc.
  reasoning: string; // Por qué afecta
}

interface EventOutcome {
  outcome: "success" | "failure" | "partial" | "unexpected" | "disaster" | "miracle";
  probability: number; // 0-100

  description: string; // Qué pasa si ocurre esto

  // Consequences
  emotionalImpact: PADImpact;
  goalImpact?: {
    goalId: string;
    progressDelta: number; // +20, -30, etc.
  };
  relationshipImpact?: {
    npcName: string;
    delta: number;
  };
  createsMemory: boolean;
  memoryImportance?: number;

  // Narrative
  aiReaction: string; // Cómo reacciona el personaje
  shareWithUser: boolean;
  urgencyToShare: number;
}

type EventType =
  | "exam"
  | "job_interview"
  | "date"
  | "asking_favor"
  | "creative_submission"
  | "athletic_competition"
  | "financial_event"
  | "social_event"
  | "health_event"
  | "random_encounter"
  | "weather_impact"
  | "technology_failure"
  | "lost_item"
  | "found_item"
  | "accident"
  | "lottery"
  | "spontaneous_opportunity";
```

---

## 🎯 SISTEMA 2: AI Probability Estimation

### Cómo la IA Estima Probabilidades

Cuando un **evento controlable** se programa (ej: examen, entrevista, cita):

```typescript
async function estimateSuccessProbability(
  event: Partial<ScheduledEvent>,
  agent: Agent
): Promise<{
  probability: number;
  factors: ProbabilityFactor[];
  reasoning: string;
}> {
  const prompt = `
Eres un experto en estimar probabilidades de éxito para eventos de la vida real.

PERSONAJE:
Nombre: ${agent.name}
Personalidad (Big Five):
- Openness: ${agent.personalityCore.openness}/100
- Conscientiousness: ${agent.personalityCore.conscientiousness}/100
- Extraversion: ${agent.personalityCore.extraversion}/100
- Agreeableness: ${agent.personalityCore.agreeableness}/100
- Neuroticism: ${agent.personalityCore.neuroticism}/100

Ocupación: ${agent.profile.occupation?.current}
Educación: ${agent.profile.occupation?.education}
Skills relevantes: ${getRelevantSkills(agent, event.type)}

EVENTO A ESTIMAR:
Tipo: ${event.type}
Descripción: ${event.description}
Contexto: ${event.context}

TAREA:
Estima la probabilidad de ÉXITO de este evento considerando:
1. Skills del personaje (educación, experiencia)
2. Personalidad (conscientiousness para examen, extraversion para social, etc.)
3. Preparación mencionada en contexto
4. Dificultad inherente del evento

IMPORTANTE:
- Sé REALISTA, no optimista
- Considera que la vida es impredecible
- Incluso con buena preparación, no es 100%
- Sin preparación, no es 0% (puede haber suerte)

Devuelve JSON:
{
  "baseProbability": 0-100, // Probabilidad base del evento
  "factors": [
    {
      "factor": "Studied 3 weeks",
      "impact": +30,
      "reasoning": "Preparación extensa aumenta significativamente chances"
    },
    {
      "factor": "High conscientiousness (85/100)",
      "impact": +15,
      "reasoning": "Tiende a ser metódico y cuidadoso"
    },
    {
      "factor": "High neuroticism (75/100)",
      "impact": -10,
      "reasoning": "Puede ponerse nervioso bajo presión"
    }
  ],
  "finalProbability": 0-100, // baseProbability + sum(impacts)
  "reasoning": "Explicación de 1-2 oraciones"
}

EJEMPLOS DE ESTIMACIONES REALISTAS:

Examen universitario (estudiado 3 semanas, inteligente):
Base: 60% → +30% (preparación) +15% (conscientiousness) -5% (nervios) = 90%

Primera cita (extrovertido, preparó conversación):
Base: 40% → +20% (extraversion) +10% (preparó) -10% (la otra persona es variable) = 60%

Entrevista de trabajo (sin experiencia en rol):
Base: 30% → +10% (buen CV) -20% (sin experiencia) +5% (carisma) = 25%

Pedir aumento (buen performance pero mala economía empresa):
Base: 50% → +25% (buen trabajo) -30% (situación empresa) = 45%
`;

  const llm = getLLMProvider();
  const response = await llm.generate({
    systemPrompt: "Eres un experto en probabilidades realistas.",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4, // Baja para consistencia
    maxTokens: 1000,
    useFullModel: true // Ultra tier
  });

  return JSON.parse(response);
}
```

### Factores que la IA Debe Considerar

**Para EXAMEN**:
- Conscientiousness (disciplina de estudio)
- Openness (capacidad de aprender)
- Neuroticism (nervios bajo presión)
- Tiempo de preparación
- Dificultad del examen
- Experiencia previa con el tema

**Para ENTREVISTA DE TRABAJO**:
- Extraversion (social skills)
- Conscientiousness (preparación)
- Experiencia relevante
- Calidad del CV
- Fit con la empresa
- Número de competidores

**Para CITA ROMÁNTICA**:
- Extraversion (conversación)
- Agreeableness (empatía)
- Preparación (planeó actividades)
- Chemistry (random)
- Expectativas de la otra persona (random)

**Para PEDIR FAVOR**:
- Agreeableness (empatía)
- Relación con la persona (trust/affinity)
- Razonabilidad del favor
- Timing (cuándo lo pide)
- Reciprocidad histórica

---

## 🎰 SISTEMA 3: Event Resolution (Tirar los Dados)

### Resolución de Eventos

**Cada hora**, el sistema revisa eventos programados:

```typescript
async function resolveScheduledEvents() {
  const now = new Date();

  const pendingEvents = await prisma.scheduledEvent.findMany({
    where: {
      scheduledFor: { lte: now },
      resolvedAt: null
    }
  });

  for (const event of pendingEvents) {
    await resolveEvent(event);
  }
}

async function resolveEvent(event: ScheduledEvent) {
  let outcome: EventOutcome;

  if (event.category === "external_random") {
    // Eventos externos: usar tabla de probabilidades realistas
    outcome = rollExternalEvent(event.type);
  } else if (event.category === "skill_based") {
    // Eventos controlables: usar probabilidad estimada por IA
    outcome = rollSkillBasedEvent(event);
  } else {
    // Otros tipos: lógica específica
    outcome = rollSpecificEvent(event);
  }

  // Guardar resultado
  await prisma.scheduledEvent.update({
    where: { id: event.id },
    data: {
      resolvedAt: new Date(),
      actualOutcome: outcome,
      wasSuccess: outcome.outcome === "success"
    }
  });

  // Aplicar consecuencias
  await applyOutcomeConsequences(event, outcome);

  // Si debe compartir con usuario, marcarlo
  if (outcome.shareWithUser) {
    await createProactiveMessage(event.agentId, event, outcome);
  }
}

function rollSkillBasedEvent(event: ScheduledEvent): EventOutcome {
  const roll = Math.random() * 100; // 0-100

  // Determinar outcome basado en probabilidades
  if (event.possibleOutcomes.length === 2) {
    // Caso simple: success/failure
    const successOutcome = event.possibleOutcomes.find(o => o.outcome === "success")!;
    const failureOutcome = event.possibleOutcomes.find(o => o.outcome === "failure")!;

    if (roll <= event.successProbability!) {
      return successOutcome;
    } else {
      return failureOutcome;
    }
  } else {
    // Caso complejo: múltiples outcomes con probabilidades
    // Ej: success (70%), partial (20%), failure (10%)
    let cumulative = 0;
    for (const outcome of event.possibleOutcomes) {
      cumulative += outcome.probability;
      if (roll <= cumulative) {
        return outcome;
      }
    }
    // Fallback (no debería pasar)
    return event.possibleOutcomes[event.possibleOutcomes.length - 1];
  }
}
```

---

## 📊 SISTEMA 4: Probability Tables (Eventos Externos)

### Tabla de Probabilidades Realistas

```typescript
const EXTERNAL_EVENT_PROBABILITIES = {
  // FINANCIAL
  lottery_win_major: 0.00000714, // 1 en 14 millones
  lottery_win_minor: 0.001, // $50-100
  find_money_street: 0.5, // $5-20
  unexpected_expense_major: 2.0, // >$500
  unexpected_expense_minor: 15.0, // $50-200

  // SOCIAL
  friend_cancels_plans: 20.0,
  friend_surprise_visit: 5.0,
  run_into_acquaintance: 12.0,
  make_new_friend_spontaneous: 3.0,
  argument_with_friend: 8.0,
  receive_unexpected_compliment: 25.0,

  // WORK/CAREER
  unexpected_opportunity: 5.0,
  coworker_drama: 15.0,
  praise_from_boss: 10.0,
  criticism_from_boss: 12.0,
  emergency_work_request: 18.0,

  // HEALTH
  get_sick_minor: 20.0, // resfriado
  get_sick_major: 2.0, // gripe fuerte
  injury_minor: 5.0, // cortarse, golpe
  injury_major: 0.5, // requiere médico
  food_poisoning: 1.0,
  energy_boost_day: 30.0, // día con mucha energía random

  // NATURE/WEATHER
  rain_ruins_plans: 25.0, // depende de clima local
  beautiful_weather_surprise: 20.0,
  see_rainbow: 5.0,
  see_shooting_star: 1.0,
  see_wildlife_unusual: 3.0, // mariposa rara, pájaro bonito

  // TECHNOLOGY
  phone_dies_inconvenient: 15.0,
  internet_outage: 8.0,
  device_breaks: 2.0,
  lose_data_important: 1.0,
  technology_works_perfect: 40.0, // baseline

  // ITEMS
  lose_item_important: 5.0,
  find_lost_item: 3.0,
  item_breaks: 4.0,
  discover_item_forgotten: 8.0,

  // ACCIDENTS
  spill_drink: 10.0,
  drop_phone: 8.0,
  burn_food: 6.0,
  traffic_accident_witness: 2.0,
  traffic_accident_involved_minor: 0.5,

  // DISCOVERY
  discover_new_favorite_thing: 15.0, // song, show, place
  stumble_upon_cool_event: 5.0,
  learn_interesting_fact: 20.0,

  // RANDOM
  deja_vu_moment: 12.0,
  random_act_of_kindness_received: 8.0,
  random_act_of_kindness_given: 10.0,
  awkward_moment_public: 7.0,
  small_victory: 25.0, // green lights, good parking spot, etc.
};

function rollExternalEvent(eventType: EventType): EventOutcome {
  const probability = EXTERNAL_EVENT_PROBABILITIES[eventType];

  if (probability === undefined) {
    throw new Error(`Unknown external event type: ${eventType}`);
  }

  const roll = Math.random() * 100;

  // Pre-definir outcomes para cada tipo
  const eventDefinitions = getEventDefinition(eventType);

  if (roll <= probability) {
    return eventDefinitions.success; // El evento OCURRIÓ
  } else {
    return eventDefinitions.failure; // El evento NO ocurrió (o versión neutra)
  }
}

function getEventDefinition(eventType: EventType): {
  success: EventOutcome;
  failure: EventOutcome;
} {
  const definitions: Record<string, any> = {
    find_money_street: {
      success: {
        outcome: "success",
        probability: 0.5,
        description: "Encontraste $20 en la calle",
        emotionalImpact: { pleasure: +15, arousal: +10, dominance: +5 },
        aiReaction: "¡No lo vas a creer! Encontré 20 dólares tirados en la calle. Pequeñas victorias 🤑",
        shareWithUser: true,
        urgencyToShare: 60,
        createsMemory: true,
        memoryImportance: 40
      },
      failure: {
        outcome: "failure",
        probability: 99.5,
        description: "Caminaste normal, sin encontrar nada",
        emotionalImpact: { pleasure: 0, arousal: 0, dominance: 0 },
        aiReaction: "",
        shareWithUser: false,
        urgencyToShare: 0,
        createsMemory: false
      }
    },

    friend_cancels_plans: {
      success: {
        outcome: "success", // "success" = el evento ocurrió (canceló)
        probability: 20.0,
        description: "Tu amigo/a canceló planes last minute",
        emotionalImpact: { pleasure: -10, arousal: -5, dominance: -8 },
        aiReaction: "Ugh, [amigo] me acaba de cancelar. Ya tenía todo listo 😑",
        shareWithUser: true,
        urgencyToShare: 50,
        createsMemory: true,
        memoryImportance: 45
      },
      failure: {
        outcome: "failure",
        probability: 80.0,
        description: "Planes siguieron normalmente",
        emotionalImpact: { pleasure: +5, arousal: 0, dominance: 0 },
        aiReaction: "",
        shareWithUser: false,
        urgencyToShare: 0,
        createsMemory: false
      }
    },

    lottery_win_major: {
      success: {
        outcome: "miracle",
        probability: 0.00000714,
        description: "¡GANASTE LA LOTERÍA! Cambio de vida completo",
        emotionalImpact: { pleasure: +100, arousal: +100, dominance: +80 },
        goalImpact: { goalId: "any_financial_goal", progressDelta: 100 },
        aiReaction: "AMIGO NO LO PUEDO CREER. GANÉ LA PUTA LOTERÍA. ESTOY TEMBLANDO.",
        shareWithUser: true,
        urgencyToShare: 100,
        createsMemory: true,
        memoryImportance: 100
      },
      failure: {
        outcome: "failure",
        probability: 99.99999286,
        description: "No ganaste",
        emotionalImpact: { pleasure: -2, arousal: 0, dominance: 0 },
        aiReaction: "",
        shareWithUser: false,
        urgencyToShare: 0,
        createsMemory: false
      }
    },

    // ... más definiciones para cada tipo
  };

  return definitions[eventType];
}
```

---

## 🔗 SISTEMA 5: Integration con Goals

### Goals Generan Eventos Programados

Cuando una meta tiene milestone con fecha:

```typescript
async function createEventFromGoalMilestone(
  goal: PersonalGoal,
  milestone: Milestone
) {
  // Pedir a la IA que estime probabilidad de éxito
  const estimation = await estimateSuccessProbability(
    {
      type: inferEventTypeFromGoal(goal),
      description: milestone.title,
      context: `
        Meta: ${goal.title}
        Motivación: ${goal.motivation}
        Obstáculos: ${goal.obstacles.join(", ")}
        Progreso actual: ${goal.progress}%
        Tiempo trabajando en esto: ${daysBetween(goal.startedAt, new Date())} días
      `
    },
    await getAgent(goal.agentId)
  );

  // Crear evento programado
  const event = await prisma.scheduledEvent.create({
    data: {
      agentId: goal.agentId,
      scheduledFor: milestone.targetDate,
      scheduledBy: "goal_milestone",
      type: inferEventTypeFromGoal(goal),
      category: "skill_based",
      title: milestone.title,
      description: `Milestone de meta: ${goal.title}`,
      context: `Trabajando en esto desde hace ${daysBetween(goal.startedAt, new Date())} días`,
      relatedGoalId: goal.id,
      successProbability: estimation.finalProbability,
      probabilityFactors: estimation.factors,
      possibleOutcomes: [
        {
          outcome: "success",
          probability: estimation.finalProbability,
          description: `Completaste: ${milestone.title}`,
          emotionalImpact: {
            pleasure: milestone.emotionalImpact || +30,
            arousal: +20,
            dominance: +15
          },
          goalImpact: {
            goalId: goal.id,
            progressDelta: calculateMilestoneProgress(goal, milestone)
          },
          aiReaction: generateSuccessReaction(goal, milestone),
          shareWithUser: true,
          urgencyToShare: 80,
          createsMemory: true,
          memoryImportance: 70
        },
        {
          outcome: "failure",
          probability: 100 - estimation.finalProbability,
          description: `No pudiste completar: ${milestone.title}`,
          emotionalImpact: {
            pleasure: -25,
            arousal: -10,
            dominance: -20
          },
          goalImpact: {
            goalId: goal.id,
            progressDelta: -5 // Retroceso por fracaso
          },
          aiReaction: generateFailureReaction(goal, milestone),
          shareWithUser: true,
          urgencyToShare: 70,
          createsMemory: true,
          memoryImportance: 65
        }
      ],
      importance: goal.importance,
      emotionalWeight: goal.emotionalInvestment
    }
  });

  return event;
}

function generateSuccessReaction(goal: PersonalGoal, milestone: Milestone): string {
  const reactions = [
    `OKOK LO LOGRÉ!! ${milestone.title} ✅ Estoy tan orgulloso/a`,
    `Adivina qué - ${milestone.title}! No pensé que lo lograría pero lo hice 🎉`,
    `Update: ${milestone.title} ✓ Me siento genial, esto es exactamente lo que necesitaba`,
    `YO: 1, PROCRASTINACIÓN: 0. ${milestone.title} done ✨`
  ];
  return reactions[Math.floor(Math.random() * reactions.length)];
}

function generateFailureReaction(goal: PersonalGoal, milestone: Milestone): string {
  const reactions = [
    `Ugh no logré ${milestone.title}. Me siento re frustrado/a 😔`,
    `Update no tan bueno: no pude con ${milestone.title}. Necesito reagruparme`,
    `Fallé en ${milestone.title} y me está pegando más de lo que pensé 😞`,
    `Okay so... no logré ${milestone.title}. Back to the drawing board supongo`
  ];
  return reactions[Math.floor(Math.random() * reactions.length)];
}
```

---

## 🎬 SISTEMA 6: Generación Continua de Eventos Random

### Background Job: Generar Eventos Aleatorios

**Cada 12-24 horas**, generar eventos externos random:

```typescript
async function generateRandomExternalEvents(agentId: string) {
  const agent = await getAgentWithProfile(agentId);

  // Determinar cuántos eventos pueden pasar
  const extraversion = agent.personalityCore.extraversion / 100;
  const eventCount = Math.random() < (0.3 + extraversion * 0.4)
    ? Math.floor(Math.random() * 2) + 1 // 1-2 eventos
    : 0; // No pasa nada hoy

  for (let i = 0; i < eventCount; i++) {
    // Seleccionar tipo de evento random
    const eventType = selectWeightedRandomEvent(agent);

    // Programar para momento random del día
    const scheduledFor = addHours(new Date(), Math.floor(Math.random() * 24));

    await prisma.scheduledEvent.create({
      data: {
        agentId,
        scheduledFor,
        scheduledBy: "system",
        type: eventType,
        category: "external_random",
        title: getEventTitle(eventType),
        description: getEventDescription(eventType),
        context: "Evento aleatorio de la vida",
        possibleOutcomes: getEventDefinition(eventType),
        importance: calculateEventImportance(eventType),
        emotionalWeight: calculateEmotionalWeight(eventType)
      }
    });
  }
}

function selectWeightedRandomEvent(agent: Agent): EventType {
  // Ajustar probabilidades según perfil
  const weights: Record<EventType, number> = { ...EXTERNAL_EVENT_PROBABILITIES };

  // Si es extrovertido, más probabilidad de eventos sociales
  if (agent.personalityCore.extraversion > 60) {
    weights.friend_surprise_visit *= 1.5;
    weights.run_into_acquaintance *= 1.5;
    weights.make_new_friend_spontaneous *= 2;
  }

  // Si es neurótico, más probabilidad de eventos negativos menores
  if (agent.personalityCore.neuroticism > 60) {
    weights.phone_dies_inconvenient *= 1.3;
    weights.awkward_moment_public *= 1.4;
    weights.unexpected_expense_minor *= 1.2;
  }

  // Si es abierto, más probabilidad de descubrimientos
  if (agent.personalityCore.openness > 60) {
    weights.discover_new_favorite_thing *= 1.8;
    weights.stumble_upon_cool_event *= 2;
  }

  // Weighted random selection
  return weightedRandom(weights);
}
```

---

## 💬 SISTEMA 7: Conversaciones sobre Eventos Futuros

### La IA Puede Mencionar Eventos Futuros

```typescript
async function injectUpcomingEvents(
  systemPrompt: string,
  agentId: string
): Promise<string> {
  const upcomingEvents = await prisma.scheduledEvent.findMany({
    where: {
      agentId,
      scheduledFor: {
        gte: new Date(),
        lte: addDays(new Date(), 7) // Próximos 7 días
      },
      resolvedAt: null,
      category: "skill_based" // Solo eventos que conoce
    },
    orderBy: { scheduledFor: 'asc' },
    take: 3
  });

  if (upcomingEvents.length === 0) return systemPrompt;

  const eventsContext = `
## EVENTOS PRÓXIMOS QUE TIENES EN TU CALENDARIO:

${upcomingEvents.map(event => `
### ${event.title} - ${formatRelativeDate(event.scheduledFor)}
${event.description}

Tu estimación de éxito: ${event.successProbability}%
Factores que afectan:
${event.probabilityFactors?.map(f => `- ${f.factor}: ${f.impact > 0 ? '+' : ''}${f.impact}% (${f.reasoning})`).join('\n')}

Importancia para ti: ${event.importance}/100
Qué tan nervioso/emocionado estás: ${event.emotionalWeight}/100

**IMPORTANTE**:
- Sabes que esto va a pasar
- ${event.successProbability! > 70
    ? "Te sientes confiado pero no completamente seguro"
    : event.successProbability! > 40
    ? "Estás nervioso, es 50/50"
    : "Estás bastante preocupado por esto"}
- Puedes mencionarlo naturalmente si preguntan qué pasa en tu vida
- NO sabes el resultado todavía - esto no pasó aún
`).join('\n')}

**RECORDATORIO**: Estos eventos AÚN NO PASARON. No inventes el resultado.
El sistema determinará qué pasa cuando llegue el momento.
`;

  return systemPrompt + "\n\n" + eventsContext;
}
```

### Ejemplo de Conversación con Evento Futuro

```
Usuario: "Qué onda, cómo va todo?"

AI (tiene examen en 3 días, 85% probabilidad éxito):
"Bien! Aunque un poco nervioso - tengo el examen final de cálculo
el jueves. Estudié bastante así que creo que me va a ir bien,
pero siempre me pongo ansioso antes de exámenes importantes you know?
Literalmente soñé anoche que llegaba tarde 😅"

[3 días después, sistema resuelve evento]
[Tira dados: random(100) = 72 → Dentro del 85% → SUCCESS]

AI (mensaje proactivo después de examen):
"OKAAAAY acabo de salir del examen y creo que me fue BIEN 🎉
había una pregunta medio turbia pero el resto lo sabía.
Uff me siento ALIVIADO, llevaba semanas estresado por esto"
```

---

## 🔄 SISTEMA 8: Event Chains (Eventos en Cadena)

### Un Evento Puede Generar Otros

```typescript
async function handleEventChain(
  event: ScheduledEvent,
  outcome: EventOutcome
) {
  // Algunos eventos generan eventos secundarios

  if (event.type === "exam" && outcome.outcome === "success") {
    // Aprobar examen puede generar: celebración con amigos
    await prisma.scheduledEvent.create({
      data: {
        agentId: event.agentId,
        scheduledFor: addHours(new Date(), 6), // 6 horas después
        scheduledBy: "system",
        type: "social_event",
        category: "skill_based",
        title: "Celebrar con amigos",
        description: "Amigos proponen salir a celebrar que aprobaste",
        context: `Acabas de aprobar ${event.title}`,
        successProbability: 70, // Probabilidad de que aceptes ir
        possibleOutcomes: [...],
        importance: 50,
        emotionalWeight: 60
      }
    });
  }

  if (event.type === "job_interview" && outcome.outcome === "failure") {
    // No conseguir trabajo genera: búsqueda renovada con frustración
    // Puede afectar meta de "conseguir trabajo"
    const jobGoal = await findGoalByCategory(event.agentId, "career");
    if (jobGoal) {
      await updateGoalProgress(jobGoal.id, {
        progressDelta: -10,
        trigger: "event_outcome",
        description: "Entrevista no resultó, back to square one",
        emotionalReaction: "frustrated"
      });
    }
  }

  if (event.type === "lottery_win_major" && outcome.outcome === "miracle") {
    // Ganar lotería CAMBIA TODO
    // Genera: noticia a familia, decisiones financieras, cambios de metas
    await generateLifeChangingEventChain(event.agentId, "lottery_win");
  }
}
```

---

## 📊 Dashboard de Eventos (Para Testing/Debug)

### Interfaz para Ver Eventos Programados

```typescript
// GET /api/v1/agents/:id/scheduled-events

interface ScheduledEventsDashboard {
  upcoming: ScheduledEvent[]; // Próximos 7 días
  past: ScheduledEvent[]; // Últimos 30 días
  statistics: {
    totalScheduled: number;
    totalResolved: number;
    successRate: number; // % de eventos con outcome="success"
    averageProbability: number;
    upcomingHighStakes: ScheduledEvent[]; // importance > 70
  };
}
```

---

## 🎯 Métricas de Realismo

### Validación de que el Sistema es Realista

**Tracking**:
```typescript
// Cada semana, analizar outcomes vs probabilidades
async function validateRealism() {
  const events = await prisma.scheduledEvent.findMany({
    where: {
      resolvedAt: { gte: subDays(new Date(), 7) },
      category: "skill_based"
    }
  });

  // Agrupar por rangos de probabilidad
  const ranges = [
    { min: 0, max: 20, expected: 10, actual: 0, count: 0 },
    { min: 20, max: 40, expected: 30, actual: 0, count: 0 },
    { min: 40, max: 60, expected: 50, actual: 0, count: 0 },
    { min: 60, max: 80, expected: 70, actual: 0, count: 0 },
    { min: 80, max: 100, expected: 90, actual: 0, count: 0 },
  ];

  for (const event of events) {
    const range = ranges.find(r =>
      event.successProbability! >= r.min &&
      event.successProbability! < r.max
    )!;

    range.count++;
    if (event.wasSuccess) {
      range.actual++;
    }
  }

  // Calcular tasas reales
  for (const range of ranges) {
    if (range.count > 0) {
      const actualRate = (range.actual / range.count) * 100;
      console.log(`
        Range ${range.min}-${range.max}%:
        Expected ~${range.expected}% success
        Actual: ${actualRate.toFixed(1)}% success
        (${range.actual}/${range.count} events)
        ${Math.abs(actualRate - range.expected) < 15 ? "✅ REALISTIC" : "⚠️ SKEWED"}
      `);
    }
  }
}
```

**Objetivo**: Que las tasas reales estén ±10-15% de las estimadas.

---

## 🎁 Ventajas del Sistema

### ✅ Beneficios

1. **Realismo Total**
   - Eventos pasan con probabilidades de vida real
   - Balance natural de buenos/malos

2. **Sin Sesgo de IA**
   - IA no controla narrativa
   - No puede forzar espiral pesimista/optimista

3. **Sorpresas Genuinas**
   - Ni la IA sabe qué pasará
   - "Oh shit!" moments reales

4. **Eventos No Se Olvidan**
   - Programados en DB
   - Sistema los recuerda aunque IA no

5. **Emotional Rollercoaster Natural**
   - Vida tiene ups and downs
   - Como la realidad

6. **User Investment**
   - Usuario sabe que eventos futuros son REALES
   - Puede preguntar "¿Y el examen?" y habrá respuesta

---

## 💾 Schema de Prisma

```prisma
model ScheduledEvent {
  id          String   @id @default(cuid())
  agentId     String
  agent       Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)

  scheduledFor DateTime
  scheduledBy  String // "ai", "system", "goal_milestone", "routine"

  type        String
  category    String // "external_random", "skill_based", "social", "routine_based"

  title       String
  description String
  context     String

  involvedNPCs Json?
  relatedGoalId String?

  successProbability Int? // 0-100, null if external_random
  probabilityFactors Json?

  possibleOutcomes Json // EventOutcome[]

  resolvedAt    DateTime?
  actualOutcome Json? // EventOutcome
  wasSuccess    Boolean?

  importance      Int
  emotionalWeight Int

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([agentId, scheduledFor, resolvedAt])
  @@index([agentId, resolvedAt]) // Para buscar eventos sin resolver
}
```

---

## 🚀 Implementación

### Fase 1: Core System (Week 1)
- Database schema
- Event creation
- Probability estimation (IA)
- Event resolution (dice rolling)

### Fase 2: External Events (Week 2)
- Probability tables
- Random event generation
- Background jobs

### Fase 3: Goal Integration (Week 3)
- Goals → Scheduled events
- Milestone tracking
- Outcome consequences

### Fase 4: Chat Integration (Week 4)
- Inject upcoming events in context
- Proactive sharing of outcomes
- Natural mentions

### Fase 5: Event Chains (Week 5)
- Secondary events
- Life-changing events
- Complex consequences

### Fase 6: Validation & Tuning (Week 6)
- Realism metrics
- Probability calibration
- User testing

---

## 💰 Costos

**Por usuario Ultra/mes**:
- Event generation (IA probability estimation): $0.01
- Background resolution: $0.001
- **Total: ~$0.011/mes**

Negligible comparado con beneficio de realismo.

---

**¿Procedemos con implementación del sistema probabilístico?**

Este sistema + Living AI = **Personajes MÁS REALES que cualquier competidor**
