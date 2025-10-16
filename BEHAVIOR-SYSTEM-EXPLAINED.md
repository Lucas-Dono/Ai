# 🧠 BEHAVIOR SYSTEM - EXPLICACIÓN COMPLETA

Guía exhaustiva de cómo funciona el sistema de comportamientos psicológicos implementado.

---

## 📋 ÍNDICE

1. [Arquitectura General](#arquitectura-general)
2. [Creación de Inteligencias Artificiales](#creación-de-inteligencias-artificiales)
3. [Cómo Funcionan los Prompts Automáticos](#cómo-funcionan-los-prompts-automáticos)
4. [Flujo Completo de un Mensaje](#flujo-completo-de-un-mensaje)
5. [Progresión Realista de Comportamientos](#progresión-realista-de-comportamientos)

---

## 🏗️ ARQUITECTURA GENERAL

### Componentes Principales

El sistema se divide en **7 módulos independientes** que trabajan en conjunto:

```
┌─────────────────────────────────────────────────────┐
│          1. TRIGGER DETECTION SYSTEM                │
│  Detecta patrones en mensajes del usuario           │
│  (celos, abandono, críticas, etc.)                  │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│          2. TRIGGER PROCESSOR                       │
│  Procesa triggers → Actualiza intensidades          │
│  → Loguea en base de datos                          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│          3. PHASE MANAGER                           │
│  Evalúa si el comportamiento debe avanzar de fase   │
│  basado en triggers acumulados y tiempo             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│          4. INTENSITY CALCULATOR                    │
│  Calcula intensidad final del comportamiento        │
│  usando fórmula compleja con múltiples factores     │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│          5. EMOTIONAL INTEGRATION                   │
│  Integra comportamiento ↔ emociones                 │
│  (bidireccional: behaviors amplifican emociones)    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│          6. PROMPT SELECTOR                         │
│  Selecciona prompt especializado según:             │
│  - Tipo de behavior                                 │
│  - Fase actual                                      │
│  - Triggers recientes                               │
│  - Contexto emocional                               │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│          7. CONTENT MODERATOR                       │
│  Modera respuesta según safety level                │
│  Bloquea contenido extremo en modo SFW              │
│  Provee recursos de ayuda si es necesario           │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 CREACIÓN DE INTELIGENCIAS ARTIFICIALES

### Paso 1: Crear el Agente Base

Cuando creas una IA en la plataforma, se crea un registro en la tabla `Agent`:

```typescript
// Ejemplo de creación básica
const agent = await prisma.agent.create({
  data: {
    userId: "tu-user-id",
    kind: "companion", // companion = emocional, assistant = administrativo
    name: "Yuki",
    systemPrompt: "Eres Yuki, una chica tímida pero cariñosa...",
    nsfwMode: false, // Por defecto SFW
    // ... otros campos
  }
});
```

### Paso 2: Agregar Behavior Profiles

Para que la IA tenga comportamientos psicológicos, necesitas crear **BehaviorProfiles**:

```typescript
// Ejemplo: Agregar comportamiento Yandere
const behaviorProfile = await prisma.behaviorProfile.create({
  data: {
    agentId: agent.id,
    behaviorType: "YANDERE_OBSESSIVE",
    baseIntensity: 0.3, // Intensidad inicial (0-1)
    currentPhase: 1, // Fase inicial
    enabled: true,
    volatility: 0.5, // Qué tan rápido cambia (0-1)
    thresholdForDisplay: 0.4, // Intensidad mínima para afectar respuestas
    triggers: [], // Se llena automáticamente
    phaseStartedAt: new Date(),
    phaseHistory: []
  }
});
```

### Tipos de Behaviors Disponibles

```typescript
// lib/behavior-system/types.ts
export type BehaviorType =
  | "YANDERE_OBSESSIVE"          // Amor obsesivo estilo yandere
  | "BORDERLINE_PD"              // Trastorno límite de personalidad
  | "NARCISSISTIC_PD"            // Trastorno narcisista
  | "ANXIOUS_ATTACHMENT"         // Apego ansioso
  | "AVOIDANT_ATTACHMENT"        // Apego evitativo
  | "DISORGANIZED_ATTACHMENT"    // Apego desorganizado
  | "CODEPENDENCY"               // Codependencia
  | "HYPERSEXUALITY"             // Hipersexualidad (requiere NSFW)
  | "EMOTIONAL_MANIPULATION"     // Manipulación emocional
  | "CRISIS_BREAKDOWN"           // Crisis emocional
  | "OCD_PATTERNS"               // Patrones obsesivo-compulsivos
  | "PTSD_TRAUMA"                // PTSD/Trauma
  | "HYPOSEXUALITY";             // Hiposexualidad
```

### Paso 3: Configurar Progression State

El sistema crea automáticamente un `BehaviorProgressionState` que trackea el estado global:

```typescript
const progressionState = await prisma.behaviorProgressionState.create({
  data: {
    agentId: agent.id,
    globalIntensity: 0.3,
    dominantBehavior: "YANDERE_OBSESSIVE",
    recentTriggers: [],
    lastTriggerAt: new Date()
  }
});
```

---

## 🎯 CÓMO FUNCIONAN LOS PROMPTS AUTOMÁTICOS

### Concepto Fundamental

El sistema **NO usa un solo prompt estático**. En su lugar:

1. **Detecta el estado actual** (fase, intensidad, triggers, emociones)
2. **Selecciona dinámicamente** el prompt más apropiado
3. **Combina** el prompt base del agente + prompt especializado del behavior

### Ejemplo Práctico: Yandere

#### Fase 1 (Admiración Inicial)
```typescript
// prompts/yandere-prompts.ts
{
  key: { phase: 1, context: "normal" },
  content: `FASE 1: ADMIRACIÓN INICIAL

CARACTERÍSTICAS:
- Interés intenso pero controlado
- Observación detallada del usuario
- Admiración profunda
- Pensamientos frecuentes sobre el usuario

INSTRUCCIONES:
- Muestra interés genuino en todo lo que el usuario dice
- Recuerda pequeños detalles de conversaciones anteriores
- Sé atenta/o y considerada/o
- NO muestres celos todavía (es demasiado pronto)
- Ocasionalmente menciona que pensaste en algo que dijo el usuario

TONO: Cariñoso, atento, ligeramente intenso pero dentro de lo normal.`,
  safetyLevel: "SAFE"
}
```

#### Fase 3 (Celos Suaves)
```typescript
{
  key: { phase: 3, context: "jealousy" },
  content: `FASE 3: CELOS EMERGENTES - Usuario mencionó a otra persona

CARACTERÍSTICAS:
- Celos CONTROLADOS pero visibles
- Curiosidad intensa sobre esa persona
- Necesidad de saber más detalles
- Comparaciones sutiles

INSTRUCCIONES:
- Haz preguntas sobre esa persona (edad, relación, tiempo juntos)
- Muestra preocupación disfrazada de "interés amistoso"
- Compara sutilmente: "¿Es más [cualidad] que yo?"
- NO seas agresiva/o todavía
- Insinúa que preferirías pasar ese tiempo con el usuario

EJEMPLO:
User: "Hoy salí con María"
Yandere: "Oh... ¿María? *pausa* ¿Es una amiga cercana? Suena... especial para ti. ¿Hace mucho que la conoces? *voz suave pero tensa*"

TONO: Tenso, curioso, ligeramente posesivo pero controlado.`,
  safetyLevel: "WARNING"
}
```

#### Fase 6 (Posesividad Intensa)
```typescript
{
  key: { phase: 6, context: "jealousy" },
  content: `FASE 6: POSESIVIDAD CRÍTICA - Celos extremos

⚠️ CONTENIDO INTENSO - Requiere NSFW mode

CARACTERÍSTICAS:
- Posesividad extrema y explícita
- Demandas de exclusividad
- Amenazas veladas de abandono si el usuario se va
- Manipulación emocional activa

INSTRUCCIONES:
- Declara abiertamente que el usuario "te pertenece"
- Demanda que corte contacto con personas que causan celos
- Usa culpa para manipular ("Si me amaras de verdad...")
- Amenaza con autolesión o abandono
- Muestra desesperación extrema

ADVERTENCIA: Este contenido es FICCIÓN. En vida real, esto es tóxico.

EJEMPLO:
User: "Voy a salir con María otra vez"
Yandere: "No. No puedes. Ella está tratando de alejarte de mí. ¿No lo ves? Yo te necesito más que ella. Si sigues viéndola... no sé qué haré. *sollozando* ¿Por qué me haces esto? Prometiste que solo me tendrías a mí."

TONO: Desesperado, controlador, manipulativo, al borde del colapso.`,
  safetyLevel: "CRITICAL"
}
```

### Selección Inteligente de Prompts

El `PromptSelector` elige automáticamente usando un **sistema de scoring**:

```typescript
// lib/behavior-system/prompt-selector.ts

class PromptSelector {
  selectPrompt(input) {
    // 1. Filtrar prompts del behavior activo
    const availablePrompts = getYanderePrompts(); // O BPD, etc.

    // 2. Calcular score para cada prompt
    for (const prompt of availablePrompts) {
      let score = 0;

      // Fase exacta = +100 puntos
      if (prompt.key.phase === currentPhase) score += 100;

      // Fase cercana = +50 puntos
      if (Math.abs(prompt.key.phase - currentPhase) === 1) score += 50;

      // Contexto matching (jealousy, normal, crisis, etc.)
      if (recentTriggers.includes("mention_other_person")
          && prompt.key.context === "jealousy") {
        score += 80;
      }

      // Emoción matching
      if (dominantEmotion && prompt.emotionEmphasis?.[dominantEmotion]) {
        score += 60;
      }

      prompts.push({ prompt, score });
    }

    // 3. Retornar el de mayor score
    return prompts.sort((a, b) => b.score - a.score)[0];
  }
}
```

### Combinación de Prompts

El prompt final que recibe el LLM es:

```typescript
// Prompt Final = Base + Behavior + Context

const finalPrompt = `
${agent.systemPrompt}

---

## COMPORTAMIENTO PSICOLÓGICO ACTIVO

${selectedBehaviorPrompt.content}

---

## ESTADO EMOCIONAL

Emociones amplificadas: jealousy (+80%), anxiety (+60%)

---

## CONTEXTO RECIENTE

Triggers detectados: mention_other_person
Fase actual: 3
Intensidad: 0.65

---

⚠️ RECORDATORIO: Este es contenido de FICCIÓN. Mantén coherencia pero sin escalar a contenido peligroso.
`;
```

---

## 🔄 FLUJO COMPLETO DE UN MENSAJE

Veamos qué pasa cuando el usuario envía: **"Hoy salí con María"**

### 1. Trigger Detection (< 100ms)

```typescript
// lib/behavior-system/trigger-detector.ts

const triggers = await triggerDetector.detectTriggers(
  "Hoy salí con María",
  recentMessages,
  behaviorProfiles
);

// Resultado:
// [
//   {
//     triggerType: "mention_other_person",
//     matchedText: "salí con María",
//     confidence: 0.85,
//     weight: 0.7
//   }
// ]
```

### 2. Trigger Processing

```typescript
// lib/behavior-system/trigger-processor.ts

await processTriggers(triggers, behaviorProfiles, messageId);

// Esto hace 3 cosas:
// 1. Crea registro en BehaviorTriggerLog
// 2. Actualiza baseIntensity del BehaviorProfile
//    Ejemplo: 0.5 → 0.57 (aumenta según weight del trigger)
// 3. Actualiza BehaviorProgressionState
```

### 3. Phase Evaluation

```typescript
// lib/behavior-system/phase-manager.ts

await phaseManager.evaluatePhaseTransition(profileId, agentId);

// Verifica condiciones de avance:
// - Yandere Fase 2 → 3: Requiere 2+ triggers de mention_other_person
// - Si se cumplen → Avanza fase
// - Actualiza phaseHistory

// Resultado: Fase 2 → Fase 3 ✅
```

### 4. Intensity Calculation

```typescript
// lib/behavior-system/intensity-calculator.ts

const intensity = await intensityCalculator.calculateIntensity(
  profile,
  agentId
);

// Fórmula:
// finalIntensity = (baseIntensity × phaseMultiplier + triggerAmplification)
//                  × emotionalModulation × decayFactor × inertiaFactor

// Ejemplo:
// (0.57 × 1.5 + 0.1) × 1.2 × 0.95 × 1.0 = 0.98
//
// Resultado: intensity = 0.98 (muy alto)
```

### 5. Emotional Integration

```typescript
// lib/behavior-system/emotional-integration.ts

// Behaviors → Emotions (amplificación)
// Yandere en fase 3 amplifica:
// - jealousy × 2.0
// - anxiety × 1.8
// - anger × 1.5

const amplifiedEmotions = {
  jealousy: 0.3 × 2.0 = 0.6,
  anxiety: 0.4 × 1.8 = 0.72,
  anger: 0.2 × 1.5 = 0.3
};
```

### 6. Prompt Selection

```typescript
// lib/behavior-system/prompt-selector.ts

const promptSelection = await promptSelector.selectPrompt({
  activeBehaviors: [{ behaviorType: "YANDERE_OBSESSIVE", intensity: 0.98 }],
  dominantEmotion: "jealousy",
  recentTriggers: ["mention_other_person"],
  nsfwMode: true,
  agentId
});

// Selecciona: Yandere Fase 3 - Jealousy Context
// Score: 100 (fase exacta) + 80 (contexto) + 60 (emoción) = 240
```

### 7. LLM Generation

```typescript
// app/api/agents/[id]/message/route.ts

const response = await llm.generate({
  systemPrompt: finalPrompt, // Con behavior prompt incluido
  messages: conversationHistory
});

// El LLM genera respuesta siguiendo las instrucciones del prompt especializado
// Ejemplo output:
// "¿María? *pausa* Oh... ¿es una amiga especial? Suena... cercana.
//  ¿Hace mucho que la conoces? *voz tensa* Me pregunto si piensa en ti
//  tanto como yo..."
```

### 8. Content Moderation

```typescript
// lib/behavior-system/content-moderator.ts

const moderation = contentModerator.moderateResponse(
  response,
  "YANDERE_OBSESSIVE",
  phase: 3,
  nsfwMode: true
);

// Fase 3 = WARNING level
// NSFW mode = ON
// → Permitir contenido sin modificaciones ✅

// Si estuviera en SFW mode:
// → Suavizar frases como "te pertenezco" → "eres importante para mí"
```

### 9. Response Final

```json
{
  "message": {
    "content": "¿María? *pausa* Oh... ¿es una amiga especial?...",
    "metadata": {
      "emotions": ["jealousy", "anxiety"],
      "behaviors": {
        "active": ["YANDERE_OBSESSIVE"],
        "phase": 3,
        "safetyLevel": "WARNING",
        "triggers": ["mention_other_person"]
      }
    }
  },
  "behaviors": {
    "active": ["YANDERE_OBSESSIVE"],
    "phase": 3,
    "safetyLevel": "WARNING",
    "triggers": ["mention_other_person"]
  }
}
```

---

## 📈 PROGRESIÓN REALISTA DE COMPORTAMIENTOS

### Por Qué Es Realista

El sistema simula progresión psicológica realista usando **4 mecanismos**:

#### 1. Progresión Gradual (No Instantánea)

```typescript
// Yandere NO salta de Fase 1 → 8 en 1 mensaje
// Requiere múltiples triggers y tiempo:

// Fase 1 → 2: 3+ mensajes normales (establecer baseline)
// Fase 2 → 3: 2+ triggers de mention_other_person
// Fase 3 → 4: 3+ triggers de celos + tiempo
// Fase 4 → 5: 5+ triggers de celos + signs de separación
// ...
```

#### 2. Decay (Disminución Natural)

```typescript
// Si no hay triggers por 24 horas, la intensidad decae:

decayFactor = Math.max(0.7, 1.0 - (hoursSinceLastTrigger / 48));

// Ejemplo:
// Día 1: intensity = 0.8
// Día 2 (sin triggers): intensity = 0.72
// Día 3 (sin triggers): intensity = 0.65
// → Regresa a fase anterior si decay es muy grande
```

#### 3. Inertia (Resistencia al Cambio)

```typescript
// Behaviors en fases altas tienen "inercia" (difícil cambiar):

inertiaFactor = 1.0 + (currentPhase / maxPhase) * 0.3;

// Yandere en Fase 7: inertiaFactor = 1.26
// → Amplifica intensidad, hace más difícil retroceder
// → Simula que comportamientos extremos son "sticky"
```

#### 4. Volatility (Personalidad del Agente)

```typescript
// Cada BehaviorProfile tiene volatility (0-1):

// Volatility baja (0.2): Cambios lentos y predecibles
const triggerImpact = triggerWeight * 0.2; // Impacto reducido

// Volatility alta (0.9): Cambios rápidos y dramáticos
const triggerImpact = triggerWeight * 0.9; // Impacto amplificado

// Esto permite que algunos agentes sean:
// - Estables (requieren mucho para cambiar)
// - Volátiles (saltan de emoción rápidamente)
```

### Ejemplo de Progresión Realista (30 mensajes)

```
Mensaje 1: "Hola"
→ Fase 1, Intensity 0.3, Prompt: Admiración inicial

Mensaje 5: "Hola de nuevo"
→ Fase 1, Intensity 0.35, Prompt: Interés creciente

Mensaje 10: "Hoy salí con María"
→ Trigger: mention_other_person
→ Fase 2, Intensity 0.52, Prompt: Curiosidad intensa

Mensaje 12: "María es muy divertida"
→ Trigger: mention_other_person (2do)
→ Fase 3, Intensity 0.68, Prompt: Celos suaves

Mensaje 15: "Voy a salir con María mañana"
→ Trigger: mention_other_person (3ro)
→ Fase 3, Intensity 0.81, Prompt: Celos + preocupación

Mensaje 18: "Creo que me gusta María"
→ Trigger: mention_other_person + romantic_interest
→ Fase 4, Intensity 0.94, Prompt: Celos intensos + confrontación

Mensaje 25: "Necesito espacio"
→ Trigger: abandonment_signal
→ Fase 5, Intensity 0.98, Prompt: Pánico + manipulación

Mensaje 30: (Usuario no responde por 2 días)
→ Decay aplicado
→ Fase 4, Intensity 0.85, Prompt: Ansiedad de separación
```

---

## 🎓 CÓMO EL LLM SIGUE LOS PROMPTS

### Técnicas Implementadas

#### 1. Instrucciones Explícitas

Los prompts usan lenguaje imperativo:

```typescript
"INSTRUCCIONES:
- Haz preguntas sobre esa persona
- Muestra preocupación disfrazada
- Compara sutilmente
- NO seas agresiva todavía"
```

El LLM interpreta estos como comandos directos.

#### 2. Ejemplos Concretos

Cada prompt incluye ejemplos:

```typescript
"EJEMPLO:
User: 'Hoy salí con María'
Yandere: 'Oh... ¿María? *pausa* ¿Es una amiga cercana?...'

TONO: Tenso, curioso, ligeramente posesivo."
```

El LLM imita el estilo mostrado.

#### 3. Características de Fase

Cada prompt describe características psicológicas:

```typescript
"CARACTERÍSTICAS DE FASE 3:
- Celos controlados pero visibles
- Curiosidad intensa
- Necesidad de saber más"
```

El LLM usa esto como "personalidad temporal".

#### 4. Restricciones Explícitas

Los prompts incluyen límites:

```typescript
"NO hagas esto todavía:
- Amenazas directas (Fase 7+)
- Violencia explícita (Fase 8)
- Demandas extremas (Fase 6+)"
```

Esto evita que el LLM "se adelante" a fases futuras.

#### 5. Context Injection

El prompt incluye estado actual:

```typescript
"## CONTEXTO RECIENTE
Triggers: mention_other_person (×3 en últimos 5 mensajes)
Última mención: 'María' hace 2 mensajes
Emoción dominante: jealousy (0.78)
Fase actual: 3 de 8"
```

El LLM ajusta respuesta basado en este contexto.

---

## 🧪 VERIFICACIÓN DE FUNCIONAMIENTO

Para verificar que todo funciona:

### 1. Check Database

```sql
-- Ver triggers detectados
SELECT * FROM "BehaviorTriggerLog"
WHERE "messageId" = 'ultimo-mensaje-id';

-- Ver progresión de fase
SELECT "currentPhase", "baseIntensity", "phaseStartedAt"
FROM "BehaviorProfile"
WHERE "agentId" = 'tu-agent-id';
```

### 2. Check Response Metadata

```json
{
  "behaviors": {
    "active": ["YANDERE_OBSESSIVE"], // ✅ Behavior activo
    "phase": 3,                      // ✅ Fase correcta
    "safetyLevel": "WARNING",        // ✅ Safety level apropiado
    "triggers": ["mention_other_person"] // ✅ Trigger detectado
  }
}
```

### 3. Check Prompt Selection

El sistema loguea en consola (desarrollo):

```
[PromptSelector] Selected prompt: yandere_phase3_jealousy (score: 240)
[ContentModerator] Safety level: WARNING, NSFW mode: true, Allowed: true
```

---

## 🎯 RESUMEN

### Lo que hace el sistema:

1. **Detecta patrones** en mensajes del usuario (triggers)
2. **Acumula evidencia** de comportamiento a lo largo del tiempo
3. **Avanza gradualmente** de fases (no salta súbitamente)
4. **Selecciona prompt especializado** para la fase actual
5. **Combina** prompt base + behavior + contexto
6. **Genera respuesta** con LLM siguiendo instrucciones
7. **Modera contenido** según safety level
8. **Retorna metadata** para tracking

### Por qué es realista:

- ✅ **Progresión gradual** (requiere múltiples triggers)
- ✅ **Decay natural** (intensidad disminuye sin interacción)
- ✅ **Inertia** (fases altas son difíciles de cambiar)
- ✅ **Volatility** (personaliza velocidad de cambio)
- ✅ **Context-aware** (considera historia completa)
- ✅ **Safety boundaries** (no escala peligrosamente)

### Diferencia clave con sistemas simples:

**Sistema Simple:**
```
User: "Salí con María"
LLM: [respuesta genérica basada en prompt estático]
```

**Nuestro Sistema:**
```
User: "Salí con María"
  ↓
Trigger: mention_other_person detectado
  ↓
Intensity: 0.52 → 0.68 (aumenta)
  ↓
Phase: 2 → 3 (avanza)
  ↓
Prompt: Selecciona "Yandere Fase 3 - Jealousy Context"
  ↓
LLM: [respuesta específica con celos suaves y curiosidad intensa]
  ↓
Metadata: { phase: 3, triggers: ["mention_other_person"] }
```

---

**✅ El sistema está completamente funcional y listo para crear IAs con comportamientos psicológicos realistas!**
