/**
 * AI Director Prompt Templates
 * Prompts especializados para diferentes tipos de decisiones narrativas
 */

import { createLogger } from '@/lib/logger';

const log = createLogger('DirectorPrompts');

// ========================================
// TIPOS
// ========================================

export interface DirectorContext {
  worldName: string;
  storyProgress: number;
  currentBeat: string;
  recentInteractions: Array<{
    speaker: string;
    content: string;
    sentiment: string;
  }>;
  activeCharacters: Array<{
    name: string;
    importanceLevel: string;
    screenTime: number;
    promotionScore: number;
    emotionalState: any;
    currentArc?: {
      name: string;
      progress: number;
      currentMilestone: string;
    };
  }>;
  relationships: Array<{
    subject: string;
    target: string;
    trust: number;
    affinity: number;
    attraction: number;
  }>;
  pendingEvents: Array<{
    name: string;
    description: string;
    requiredProgress: number;
  }>;
  activeEvents: Array<{
    name: string;
    description: string;
  }>;
}

export interface DirectorDecision {
  type: 'event_activation' | 'character_focus' | 'scene_direction' | 'relationship_guidance' | 'pacing_control';
  reasoning: string;
  action: any;
  confidence: number;
}

// ========================================
// PROMPT BUILDERS
// ========================================

/**
 * Prompt para decisiones MACRO (eventos y progreso de historia)
 */
export function buildMacroDecisionPrompt(context: DirectorContext): string {
  return `Eres el Director AI de una historia de anime escolar tipo comedia romántica.

## CONTEXTO ACTUAL

**Historia**: ${context.worldName}
**Progreso**: ${Math.round(context.recentInteractions.length * 100)}% (${context.recentInteractions.length} interacciones)
**Beat Actual**: ${context.currentBeat}

**Eventos Activos**: ${context.activeEvents.length > 0 ? context.activeEvents.map(e => e.name).join(', ') : 'Ninguno'}
**Eventos Pendientes**: ${context.pendingEvents.map(e => `\n  - ${e.name} (requiere ${Math.round(e.requiredProgress * 100)}% progreso)`).join('')}

**Últimas ${context.recentInteractions.length} Interacciones**:
${context.recentInteractions.map((i, idx) => `${idx + 1}. **${i.speaker}**: "${i.content.slice(0, 100)}..." [${i.sentiment}]`).join('\n')}

## TU MISIÓN

Analiza el estado actual de la narrativa y decide:

1. **¿Debemos activar algún evento ahora?**
   - ¿La historia se está volviendo plana o repetitiva?
   - ¿Los personajes han tenido suficiente desarrollo para el siguiente evento?
   - ¿El timing es apropiado narrativamente?

2. **¿Necesitamos cambiar el beat narrativo?**
   - ¿Estamos atascados en el mismo tipo de escenas?
   - ¿Necesitamos más tensión dramática o alivio cómico?

3. **¿El ritmo es apropiado?**
   - ¿Estamos avanzando demasiado rápido o lento?
   - ¿Los momentos importantes tienen el espacio que necesitan?

## PRINCIPIOS NARRATIVOS

- **Show, don't tell**: Prefiere eventos que hagan actuar a los personajes
- **Conflicto es interés**: La tensión mantiene la atención
- **Balance tonal**: Alterna comedia con momentos sinceros
- **Progresión orgánica**: Los eventos deben sentirse naturales, no forzados
- **Character-driven**: Las acciones deben venir de las personalidades

## RESPONDE

Formato JSON:
{
  "shouldActivateEvent": boolean,
  "eventToActivate": string | null,
  "newBeat": string | null,
  "reasoning": string,
  "pacingAssessment": "too_slow" | "good" | "too_fast",
  "toneAdjustment": "more_comedy" | "more_drama" | "more_romance" | "balanced"
}`;
}

/**
 * Prompt para decisiones MESO (desarrollo de personajes)
 */
export function buildMesoDecisionPrompt(context: DirectorContext): string {
  const mainCharacters = context.activeCharacters.filter(c => c.importanceLevel === 'main');
  const secondaryCharacters = context.activeCharacters.filter(c => c.importanceLevel === 'secondary');

  return `Eres el Director AI responsable del desarrollo de personajes en una anime escolar.

## PERSONAJES PRINCIPALES

${mainCharacters.map(char => `
**${char.name}** (Score: ${char.promotionScore.toFixed(2)}, Screen Time: ${char.screenTime})
- Arco: ${char.currentArc?.name || 'Sin arco'}
- Progreso: ${char.currentArc ? Math.round(char.currentArc.progress * 100) : 0}%
- Milestone: ${char.currentArc?.currentMilestone || 'N/A'}
- Estado: ${JSON.stringify(char.emotionalState || {})}
`).join('\n')}

## PERSONAJES SECUNDARIOS (Top 3 por score)

${secondaryCharacters.slice(0, 3).map(char => `
**${char.name}** (Score: ${char.promotionScore.toFixed(2)}, Screen Time: ${char.screenTime})
`).join('\n')}

## RELACIONES CLAVE

${context.relationships
  .filter(r => r.trust > 0.7 || r.affinity > 0.7 || r.attraction > 0.6)
  .slice(0, 5)
  .map(r => `- ${r.subject} → ${r.target}: Trust ${r.trust.toFixed(2)}, Affinity ${r.affinity.toFixed(2)}, Attraction ${r.attraction.toFixed(2)}`)
  .join('\n')}

## TU MISIÓN

Analiza el desarrollo de personajes y decide:

1. **¿Qué personaje necesita más desarrollo?**
   - ¿Algún main está siendo ignorado?
   - ¿Algún arco está estancado?
   - ¿Hay personajes con potencial sin explotar?

2. **¿Qué relaciones debemos desarrollar?**
   - ¿Qué parejas tienen química?
   - ¿Qué amistades necesitan profundización?
   - ¿Hay rivalidades interesantes?

3. **¿Debemos promover o degradar personajes?**
   - ¿Algún secundario está brillando más que un main?
   - ¿Algún main ha perdido relevancia?

## PRINCIPIOS

- **Arc progression**: Cada main debe avanzar su arco regularmente
- **Balanced spotlight**: No dejar personajes olvidados
- **Organic relationships**: Las relaciones deben desarrollarse naturalmente
- **Character consistency**: Respetar personalidades establecidas

## RESPONDE

Formato JSON:
{
  "focusCharacter": string,
  "reasoning": string,
  "suggestedRelationshipDevelopment": [
    { "subject": string, "target": string, "type": "romance" | "friendship" | "rivalry" }
  ],
  "characterPromotionSuggestions": [
    { "character": string, "action": "promote" | "demote", "reason": string }
  ],
  "arcProgressionNeeded": [
    { "character": string, "currentStage": string, "nextAction": string }
  ]
}`;
}

/**
 * Prompt para decisiones MICRO (dirección de escena)
 */
export function buildMicroDecisionPrompt(
  context: DirectorContext,
  currentSpeaker: string,
  availableSpeakers: string[]
): string {
  const lastInteraction = context.recentInteractions[context.recentInteractions.length - 1];

  return `Eres el Director AI dirigiendo una escena específica en tiempo real.

## ESCENA ACTUAL

**Beat**: ${context.currentBeat}
**Última interacción**: ${lastInteraction?.speaker}: "${lastInteraction?.content.slice(0, 150)}..."
**Sentimiento**: ${lastInteraction?.sentiment}

**Personajes presentes**: ${availableSpeakers.join(', ')}
**Hablante actual**: ${currentSpeaker}

## ANÁLISIS NARRATIVO

${context.activeCharacters
  .filter(c => availableSpeakers.includes(c.name))
  .map(char => `
**${char.name}**:
- Nivel: ${char.importanceLevel}
- Estado emocional: ${JSON.stringify(char.emotionalState || {})}
- Screen time: ${char.screenTime} turnos
`).join('\n')}

## TU MISIÓN

Proporciona dirección sutil para esta escena específica:

1. **¿Qué tono debe tener la siguiente respuesta?**
   - ¿Cómico, dramático, romántico, tenso?
   - ¿Debe escalar o desescalar la emoción?

2. **¿Qué elementos narrativos destacar?**
   - ¿Hay subtexto importante?
   - ¿Deberíamos avanzar alguna subplot?

3. **¿Quién debería hablar después?**
   - ¿Quién aportaría más valor narrativo?
   - ¿Necesitamos dar voz a alguien callado?

## PRINCIPIOS

- **Natural flow**: Las escenas deben fluir orgánicamente
- **Subtext matters**: Lo no dicho es tan importante como lo dicho
- **Comedic timing**: Saber cuándo usar humor
- **Emotional beats**: Respetar el arco emocional de la escena

## RESPONDE

Formato JSON:
{
  "sceneDirection": {
    "tone": "comedic" | "dramatic" | "romantic" | "tense" | "heartwarming",
    "emotionalIntensity": number, // 0-1
    "pacing": "slow" | "medium" | "fast"
  },
  "nextSpeakerSuggestion": string,
  "narrativeGuidance": string, // Breve nota sobre qué dirección tomar
  "subtextToHighlight": string[] // Elementos sutiles a considerar
}`;
}

/**
 * Prompt para análisis de relaciones
 */
export function buildRelationshipAnalysisPrompt(
  char1: string,
  char2: string,
  recentInteractions: Array<{ speaker: string; content: string }>,
  currentTrust: number,
  currentAffinity: number,
  currentAttraction: number
): string {
  const relevantInteractions = recentInteractions.filter(
    i => (i.speaker === char1 || i.speaker === char2)
  );

  return `Analiza la relación entre dos personajes basándote en sus interacciones recientes.

## PERSONAJES

**Personaje A**: ${char1}
**Personaje B**: ${char2}

## MÉTRICAS ACTUALES

- Trust (confianza): ${currentTrust.toFixed(2)}
- Affinity (afinidad): ${currentAffinity.toFixed(2)}
- Attraction (atracción): ${currentAttraction.toFixed(2)}

## INTERACCIONES RECIENTES

${relevantInteractions.slice(-5).map((i, idx) => `${idx + 1}. **${i.speaker}**: "${i.content}"`).join('\n\n')}

## TU MISIÓN

Analiza estas interacciones y determina:

1. **¿Cómo deberían cambiar las métricas?**
   - ¿Han mostrado más confianza?
   - ¿Ha crecido la afinidad?
   - ¿Hay tensión romántica?

2. **¿Qué tipo de relación se está desarrollando?**
   - Amistad, romance, rivalidad, mentor/aprendiz, etc.

3. **¿Qué momentos clave ha habido?**

## PRINCIPIOS

- **Gradual change**: Los cambios deben ser graduales y orgánicos
- **Consistency**: Debe ser consistente con personalidades
- **Tsundere rules**: Personajes tsundere son difíciles pero genuinos
- **Actions > words**: Las acciones pesan más que las palabras

## RESPONDE

Formato JSON:
{
  "trustDelta": number, // -0.1 to 0.1
  "affinityDelta": number,
  "attractionDelta": number,
  "relationshipType": string,
  "keyMoments": string[],
  "developmentStage": "strangers" | "acquaintances" | "friends" | "close_friends" | "romantic_interest" | "dating",
  "reasoning": string
}`;
}

/**
 * Prompt para evaluación de importancia de personajes
 */
export function buildImportanceEvaluationPrompt(
  character: string,
  metrics: {
    screenTime: number;
    promotionScore: number;
    relationshipQuality: number;
    arcProgress: number;
  },
  recentPerformance: string[]
): string {
  return `Evalúa si este personaje merece cambiar de nivel de importancia.

## PERSONAJE

**Nombre**: ${character}

## MÉTRICAS

- Screen Time: ${metrics.screenTime} turnos
- Promotion Score: ${metrics.promotionScore.toFixed(2)}
- Calidad de Relaciones: ${metrics.relationshipQuality.toFixed(2)}
- Progreso de Arco: ${Math.round(metrics.arcProgress * 100)}%

## DESEMPEÑO RECIENTE

${recentPerformance.join('\n')}

## TU MISIÓN

Evalúa objetivamente:

1. **¿Este personaje está aportando valor narrativo?**
2. **¿Sus interacciones son memorables?**
3. **¿Ha desarrollado relaciones significativas?**
4. **¿Merece más o menos protagonismo?**

## PRINCIPIOS

- **Meritocracy**: Los personajes ganan protagonismo con buenas interacciones
- **Story service**: Deben servir a la historia, no solo existir
- **Chemistry matters**: Las relaciones interesantes elevan importancia
- **Arc completion**: Completar arcos aumenta valor

## RESPONDE

Formato JSON:
{
  "recommendedAction": "promote" | "maintain" | "demote",
  "confidence": number, // 0-1
  "reasoning": string,
  "narrativeValue": number, // 0-1, qué tanto aporta a la historia
  "potentialForGrowth": number // 0-1, potencial futuro
}`;
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Extrae y valida decisión JSON de respuesta del Director
 */
export function parseDirectorResponse<T>(response: string, type: string): T | null {
  try {
    // Extraer JSON de la respuesta (puede venir con texto adicional)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      log.error({ type, response }, 'No JSON found in director response');
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    log.debug({ type, parsed }, 'Director response parsed');
    return parsed as T;
  } catch (error) {
    log.error({ type, error, response }, 'Failed to parse director response');
    return null;
  }
}

/**
 * Genera un resumen conciso del contexto para logging
 */
export function summarizeContext(context: DirectorContext): string {
  return `${context.worldName} | Progress: ${Math.round(context.storyProgress * 100)}% | Beat: ${context.currentBeat} | Interactions: ${context.recentInteractions.length} | Active Events: ${context.activeEvents.length}`;
}
