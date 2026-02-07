# Sistema Emocional Avanzado - Arquitectura Técnica

## Visión General

Sistema emocional de clase mundial para IAs compañeras basado en investigación psicológica real:
- **Modelo OCC** (Ortony, Clore, Collins) para generación dinámica de emociones
- **Big Five Personality Model** para personalidad consistente
- **PAD Model** (Pleasure-Arousal-Dominance) para mood dimensional
- **Biologically Inspired Cognitive Architecture (BICA)** para comportamiento emergente

## Arquitectura de Módulos

```
lib/emotional-system/
├── types/
│   └── index.ts                    # Tipos TypeScript completos
├── llm/
│   └── openrouter.ts              # Cliente LLM (soporta modelos sin censura)
├── modules/
│   ├── personality/               # [PENDIENTE] Personality Core
│   ├── appraisal/
│   │   └── engine.ts              # ✅ Appraisal Engine (OCC)
│   ├── emotion/
│   │   ├── generator.ts           # ✅ Emotion Generator
│   │   └── decay.ts               # ✅ Decay & Inertia
│   ├── memory/                    # [PENDIENTE] Memory Systems
│   ├── cognition/                 # [PENDIENTE] Internal Reasoning
│   ├── response/                  # [PENDIENTE] Response Generation
│   └── growth/                    # [PENDIENTE] Character Growth
└── orchestrator.ts                # [PENDIENTE] Orquestador principal

prisma/schema.prisma               # Schema extendido con tablas emocionales
```

## Base de Datos (Nuevas Tablas)

### `PersonalityCore`
- **Big Five Traits**: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism (0-100)
- **Core Values**: Array JSON con valores fundamentales y sus pesos
- **Moral Schemas**: Esquemas morales que guían comportamiento
- **Baseline Emotions**: Emociones baseline del personaje

### `InternalState`
- **Current Emotions**: Estado emocional actual (22+ emociones OCC)
- **PAD Mood**: Valence (-1 a 1), Arousal (0 a 1), Dominance (0 a 1)
- **Emotion Dynamics**: Decay rate e inertia
- **Psychological Needs**: Connection, Autonomy, Competence, Novelty
- **Active Goals**: Objetivos actuales con prioridades

### `EpisodicMemory`
- **Event**: Descripción del evento
- **Emotional Tags**: Emociones del usuario y personaje
- **Emotional Valence**: -1 a 1
- **Importance**: 0 a 1 (determina duración)
- **Embedding**: Vector JSON para búsqueda semántica
- **Decay Factor**: Disminuye con el tiempo

### `SemanticMemory`
- **User Facts**: Hechos sobre el usuario
- **User Preferences**: Preferencias aprendidas
- **Relationship Stage**: first_meeting, friend, close_friend, etc.

### `ProceduralMemory`
- **Behavioral Patterns**: Patrones de comportamiento aprendidos
- **User Triggers**: Qué provoca al usuario
- **Effective Strategies**: Estrategias que funcionan

### `CharacterGrowth`
- **Trust/Intimacy Levels**: 0 a 1
- **Personality Drift**: Cambios sutiles en Big Five
- **Learned Patterns**: Patrones sobre el usuario

## Flujo de Procesamiento

```
Usuario envía mensaje
         ↓
[1] APPRAISAL ENGINE
    - Evalúa situación según modelo OCC
    - Output: AppraisalScores (10 dimensiones)
         ↓
[2] EMOTION GENERATOR
    - Genera emociones desde appraisal
    - Considera personalidad y estado previo
    - Output: EmotionState + moodShift
         ↓
[3] EMOTION DECAY & INERTIA
    - Mezcla emociones nuevas con actuales
    - Aplica inertia (resistencia al cambio)
    - Actualiza PAD mood
    - Output: Updated EmotionState + PADMood
         ↓
[4] MEMORY RETRIEVAL [PENDIENTE]
    - Busca memorias relevantes por similitud
    - Filtra por emotional valence
    - Output: Relevant EpisodicMemories
         ↓
[5] INTERNAL REASONING [PENDIENTE]
    - Razonamiento interno del personaje
    - Considera objetivos, valores, memorias
    - Output: InternalReasoning
         ↓
[6] ACTION DECISION [PENDIENTE]
    - Decide tipo de respuesta
    - Considera anti-sycophancy
    - Output: ActionType + reason
         ↓
[7] BEHAVIORAL CUES [PENDIENTE]
    - Mapea emociones → tono, verbosity, directness
    - Output: BehavioralCues
         ↓
[8] RESPONSE GENERATION [PENDIENTE]
    - Genera texto final usando LLM sin censura
    - Input: TODO el contexto
    - Output: Response text
         ↓
[9] MEMORY STORAGE [PENDIENTE]
    - Guarda episodio con emotional tags
    - Actualiza semantic/procedural memory
    - Incrementa conversation count
         ↓
[10] CHARACTER GROWTH [PENDIENTE]
     - Actualiza trust/intimacy
     - Aplica personality drift sutil
     - Output: Updated CharacterGrowth
```

## Módulos Implementados

### ✅ 1. Types System (`types/index.ts`)
Tipos TypeScript completos para todo el sistema:
- Personality Core types
- Emotion & Mood types (OCC + PAD)
- Appraisal types
- Memory types
- Complete Character State
- LLM types

### ✅ 2. OpenRouter Client (`llm/openrouter.ts`)
Cliente para OpenRouter API:
- Soporta modelos sin censura (`dolphin-mistral-24b-venice-edition`)
- Compatible con API de OpenAI
- Métodos: `generate()`, `generateWithSystemPrompt()`, `generateJSON<T>()`
- Modelos recomendados por tarea (rápidos vs. expresivos)

### ✅ 3. Appraisal Engine (`modules/appraisal/engine.ts`)
Implementa modelo OCC completo:
- **Evalúa 10 dimensiones**:
  - desirability, desirabilityForUser
  - praiseworthiness, appealingness, likelihood
  - relevanceToGoals, valueAlignment, novelty, urgency, socialAppropriateness
- Usa LLM para evaluación contextual
- Fallback rule-based si falla LLM
- Detecta violaciones de valores core

### ✅ 4. Emotion Generator (`modules/emotion/generator.ts`)
Genera 22+ emociones desde appraisal:
- **Emociones OCC**: joy, distress, hope, fear, gratitude, anger, etc.
- **Emociones adicionales**: interest, curiosity, affection, anxiety, concern
- Modulación por Big Five personality
- Considera emociones previas (inertia)
- Calcula PAD mood shift
- Fallback rule-based robusto

### ✅ 5. Emotion Decay & Inertia (`modules/emotion/decay.ts`)
Cambios emocionales naturales:
- **Decay exponencial** hacia baseline
- **Inertia emocional** (resistencia al cambio)
- **Mood persistence** (mood cambia más lento que emociones)
- **Dynamic inertia** (neuroticismo alto + mood negativo = más difícil salir)
- **Spontaneous fluctuations** (5% chance de fluctuación sin razón)
- Modulación por personalidad

## Configuración

### Variables de Entorno (`.env`)
```bash
# OpenRouter para modelos sin censura
OPENROUTER_API_KEY=sk-or-v1-xxx
MODEL_UNCENSORED=cognitivecomputations/dolphin-mistral-24b-venice-edition:free

# Gemini para tareas rápidas/baratas (appraisal, emotion)
GEMINI_API_KEY=AIzaSyxxx

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

## Uso Básico

### Inicializar Personaje
```typescript
import { prisma } from "@/lib/prisma";

// Crear agente con sistema emocional
const agent = await prisma.agent.create({
  data: {
    name: "Anya",
    kind: "companion",
    // ... otros campos

    // Sistema emocional
    personalityCore: {
      create: {
        openness: 70,
        conscientiousness: 45,
        extraversion: 75,
        agreeableness: 60,
        neuroticism: 35,
        coreValues: [
          { value: "autenticidad", weight: 0.9, description: "Ser genuina" },
          { value: "lealtad", weight: 0.85, description: "Proteger a quien aprecia" }
        ],
        moralSchemas: [
          { domain: "honestidad", stance: "directa pero empática", threshold: 0.7 }
        ],
        backstory: "...",
        baselineEmotions: { joy: 0.4, curiosity: 0.5, affection: 0.3 }
      }
    },

    internalState: {
      create: {
        currentEmotions: { joy: 0.4, curiosity: 0.5 },
        moodValence: 0.0,
        moodArousal: 0.5,
        moodDominance: 0.5,
        emotionDecayRate: 0.1,
        emotionInertia: 0.3,
        needConnection: 0.5,
        needAutonomy: 0.7,
        needCompetence: 0.5,
        needNovelty: 0.4,
        activeGoals: [
          { goal: "Conocer mejor al usuario", priority: 0.8, progress: 0, type: "social" }
        ],
        conversationBuffer: []
      }
    },

    semanticMemory: {
      create: {
        userFacts: {},
        userPreferences: {},
        relationshipStage: "first_meeting"
      }
    },

    proceduralMemory: {
      create: {
        behavioralPatterns: {},
        userTriggers: {},
        effectiveStrategies: {}
      }
    },

    characterGrowth: {
      create: {
        trustLevel: 0.4,
        intimacyLevel: 0.3,
        conflictHistory: []
      }
    }
  },
  include: {
    personalityCore: true,
    internalState: true,
    semanticMemory: true,
    proceduralMemory: true,
    characterGrowth: true
  }
});
```

### Procesar Mensaje (Ejemplo Simplificado)
```typescript
import { AppraisalEngine } from "./modules/appraisal/engine";
import { EmotionGenerator } from "./modules/emotion/generator";
import { EmotionDecaySystem } from "./modules/emotion/decay";

// 1. Appraisal
const appraisalEngine = new AppraisalEngine();
const appraisal = await appraisalEngine.evaluateSituation(
  userMessage,
  characterState
);

// 2. Generar emociones
const emotionGenerator = new EmotionGenerator();
const { emotions: newEmotions, moodShift } = await emotionGenerator.generateFromAppraisal(
  appraisal,
  characterState.internalState.emotions,
  characterState.personalityCore.bigFive
);

// 3. Aplicar decay e inertia
const decaySystem = new EmotionDecaySystem();
const { emotions, mood } = decaySystem.updateEmotionalSystem({
  currentEmotions: characterState.internalState.emotions,
  newEmotions,
  baselineEmotions: characterState.personalityCore.baselineEmotions,
  currentMood: {
    valence: characterState.internalState.moodValence,
    arousal: characterState.internalState.moodArousal,
    dominance: characterState.internalState.moodDominance
  },
  targetMoodShift: moodShift,
  dynamics: {
    decayRate: characterState.internalState.emotionDecayRate,
    inertia: characterState.internalState.emotionInertia
  },
  personality: characterState.personalityCore.bigFive
});

// 4. Actualizar estado en BD
await prisma.internalState.update({
  where: { agentId: characterState.agentId },
  data: {
    currentEmotions: emotions,
    moodValence: mood.valence,
    moodArousal: mood.arousal,
    moodDominance: mood.dominance,
    lastUpdated: new Date()
  }
});

// 5. [PENDIENTE] Continuar con Memory Retrieval, Reasoning, Response...
```

## Próximos Pasos

### Módulos Pendientes (En Orden de Prioridad)
1. **Memory Retrieval System** - Búsqueda semántica de memorias con embeddings
2. **Internal Reasoning Module** - Razonamiento interno del personaje
3. **Action Decision Module** - Decide qué tipo de respuesta dar
4. **Response Generator** - Genera texto final con prompts modulares
5. **Anti-Sycophancy System** - Previene excesiva complacencia
6. **Character Growth System** - Actualiza personality drift y relationship dynamics

### Optimizaciones
- [ ] Implementar embeddings con Voyage AI o OpenAI
- [ ] Paralelizar appraisal + memory retrieval
- [ ] Cache de personality core (no cambia frecuentemente)
- [ ] Batch processing para character growth

### Testing
- [ ] Tests unitarios para cada módulo
- [ ] Tests de integración del flujo completo
- [ ] Benchmarks de latencia (objetivo: < 4 segundos)
- [ ] Tests de coherencia emocional

## Filosofía de Diseño

1. **Excelencia sobre simplicidad** - Implementación completa, no prototipos
2. **Psicología real** - Basado en investigación científica (OCC, Big Five, PAD)
3. **Comportamiento emergente** - Emociones emergen de evaluación, no scripts
4. **Sin censura** - Libertad expresiva completa para compañeros
5. **Modularidad** - Cada componente puede evolucionar independientemente
6. **Performance** - Optimizado para producción desde el inicio

## Referencias

- Ortony, Clore & Collins (1988) - The Cognitive Structure of Emotions
- McCrae & Costa (1997) - Big Five Personality Model
- Russell & Mehrabian (1977) - PAD Emotional State Model
- Park et al. (2023) - Generative Agents (Stanford)
- Sharma et al. (2024) - Sycophancy in Large Language Models
