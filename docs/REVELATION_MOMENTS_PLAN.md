# Plan: Revelation Moments System

## Objetivo
Crear momentos especiales cuando el personaje nota que la relación ha avanzado de etapa, haciendo la progresión tangible y divertida para el usuario.

## Problema Actual
- El sistema detecta cuando `stageChanged = true` pero no hace nada con eso
- El usuario no percibe claramente cuando la relación avanza
- La progresión se siente gradual pero sin "hitos" memorables

## Solución Propuesta

### 1. Crear archivo `lib/relationship/revelation-moments.ts`

Este archivo contendrá:

```typescript
export interface RevelationMoment {
  fromStage: string;
  toStage: string;
  revelationPrompts: string[];  // Prompts que el personaje puede usar
  revelationType: "emotional" | "secret" | "vulnerability" | "commitment";
  importance: number; // 1-5
}

// Momentos de revelación por transición
export const REVELATION_MOMENTS: RevelationMoment[] = [
  {
    fromStage: "stranger",
    toStage: "acquaintance",
    revelationType: "emotional",
    importance: 2,
    revelationPrompts: [
      "Sabes, normalmente no hablo tanto con gente nueva... pero contigo es fácil.",
      "Me sorprende lo cómodo/a que me siento hablando contigo.",
      "Es raro, pero siento que puedo ser más yo mismo/a contigo."
    ]
  },
  {
    fromStage: "acquaintance",
    toStage: "friend",
    revelationType: "vulnerability",
    importance: 3,
    revelationPrompts: [
      "¿Sabes qué? Creo que ya te considero un/a amigo/a de verdad.",
      "Hay algo que nunca le cuento a conocidos, pero contigo... [revela algo personal leve]",
      "Me doy cuenta de que espero nuestras conversaciones. Eso no me pasa seguido."
    ]
  },
  {
    fromStage: "friend",
    toStage: "close_friend",
    revelationType: "secret",
    importance: 4,
    revelationPrompts: [
      "Necesito contarte algo que casi nadie sabe de mí...",
      "Confío tanto en ti que quiero compartir algo importante.",
      "Hay una parte de mí que solo muestro a la gente que realmente me importa... y tú eres una de esas personas."
    ]
  },
  {
    fromStage: "close_friend",
    toStage: "intimate",
    revelationType: "commitment",
    importance: 5,
    revelationPrompts: [
      "Nunca me he sentido tan conectado/a con alguien como contigo.",
      "Eres de las pocas personas con las que puedo ser completamente yo mismo/a, sin máscaras.",
      "Quiero que sepas que siempre estaré aquí para ti. Esto que tenemos es especial."
    ]
  }
];

// Función para obtener el momento de revelación apropiado
export function getRevelationMoment(
  fromStage: string,
  toStage: string,
  characterPersonality?: any
): RevelationMoment | null;

// Función para generar el contexto de revelación para el prompt
export function generateRevelationContext(
  moment: RevelationMoment,
  characterName: string
): string;
```

### 2. Modificar `lib/services/message.service.ts`

En la sección donde se detecta `stageChanged`:

```typescript
// Línea ~245 actual:
const stageChanged = shouldAdvanceStage(newTotalInteractions, relation.stage);

// AGREGAR:
let revelationContext = "";
if (stageChanged) {
  const revelation = getRevelationMoment(relation.stage, newStage);
  if (revelation) {
    revelationContext = generateRevelationContext(revelation, agent.name);
    // Log para analytics
    console.log(`[Revelation] ${agent.name}: ${relation.stage} → ${newStage}`);
  }
}

// Luego inyectar revelationContext en el prompt (línea ~344):
let enhancedPrompt = basePrompt + '\n\n' + emotionalContext;
if (revelationContext) {
  enhancedPrompt += '\n\n' + revelationContext;
}
```

### 3. Formato del contexto de revelación inyectado

```typescript
function generateRevelationContext(moment: RevelationMoment, characterName: string): string {
  const randomPrompt = moment.revelationPrompts[
    Math.floor(Math.random() * moment.revelationPrompts.length)
  ];

  return `
**MOMENTO ESPECIAL DE REVELACIÓN**
La relación ha avanzado de "${moment.fromStage}" a "${moment.toStage}".
Este es un momento significativo. ${characterName} debería:

1. Notar naturalmente que la relación se ha profundizado
2. Expresar este sentimiento de forma auténtica (no forzada)
3. Opcionalmente, compartir algo más personal de lo usual

Sugerencia de apertura (adaptar a tu estilo):
"${randomPrompt}"

IMPORTANTE: No menciones explícitamente "etapas" o "niveles".
Hazlo sentir natural, como si genuinamente notaras el cambio en la conexión.
`;
}
```

### 4. Personalización por Big Five

Los momentos de revelación deberían adaptarse a la personalidad:

```typescript
function adaptRevelationToPersonality(
  basePrompt: string,
  personality: BigFiveTraits
): string {
  let adapted = basePrompt;

  // Introvertidos: revelaciones más sutiles
  if (personality.extraversion < 40) {
    adapted = adapted.replace(
      "Sabes, normalmente no hablo tanto",
      "No suelo... abrirme así"
    );
  }

  // Alto neuroticismo: más emocionales
  if (personality.neuroticism > 60) {
    adapted += " (con algo de nerviosismo en la voz)";
  }

  // Baja amabilidad: más toscos pero genuinos
  if (personality.agreeableness < 40) {
    adapted = adapted.replace(
      "contigo es fácil",
      "contigo no me molesta tanto"
    );
  }

  return adapted;
}
```

### 5. Integración con el sistema de memoria

Cuando ocurre una revelación, guardarla como memoria episódica importante:

```typescript
// En message.service.ts, después de una revelación:
if (stageChanged && revelation) {
  await prisma.episodicMemory.create({
    data: {
      agentId,
      event: `Momento de revelación: Transición a ${newStage}`,
      userEmotion: "connection",
      characterEmotion: revelation.revelationType,
      emotionalValence: 0.8, // Positivo
      importance: revelation.importance / 5, // Normalizar a 0-1
      metadata: {
        type: "revelation_moment",
        fromStage: relation.stage,
        toStage: newStage
      }
    }
  });
}
```

## Archivos a crear/modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `lib/relationship/revelation-moments.ts` | CREAR | Definiciones y funciones de revelación |
| `lib/services/message.service.ts` | MODIFICAR | Integrar revelaciones en el flujo |
| `lib/emotional-system/types/index.ts` | MODIFICAR | Agregar tipos si es necesario |

## Criterios de éxito

1. Cuando `stageChanged = true`, se inyecta contexto de revelación en el prompt
2. El personaje hace un comentario natural sobre el avance de la relación
3. El momento se guarda como memoria episódica importante
4. La revelación se adapta a la personalidad del personaje

## Notas de implementación

- NO usar API de LLM para generar revelaciones (usar plantillas predefinidas)
- Los prompts son sugerencias, el LLM puede adaptarlos
- Priorizar naturalidad sobre drama
- Las revelaciones solo ocurren UNA VEZ por transición
