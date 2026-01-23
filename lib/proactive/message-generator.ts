/**
 * PROACTIVE MESSAGE GENERATOR - Generación inteligente de mensajes proactivos
 *
 * Genera mensajes naturales y personalizados usando:
 * - Templates dinámicos basados en contexto
 * - LLM para personalización
 * - Tracking de mensajes enviados (evitar repetición)
 * - Tono ajustado a relación y emociones
 *
 * Tipos de mensajes:
 * - check_in: "¿Cómo estás?"
 * - follow_up: "¿Qué pasó con...?"
 * - celebration: "¡Felicitaciones por...!"
 * - emotional_support: "Vi que estabas triste..."
 * - casual: "Hola, ¿qué tal?"
 */

import { prisma } from '@/lib/prisma';
import { getLLMProvider } from '@/lib/llm/provider';
import { getPromptForStage } from '@/lib/relationship/prompt-generator';
import { buildPeopleContext } from '@/lib/people/person-interceptor';
import { createLogger } from '@/lib/logger';
import { nanoid } from 'nanoid';
import type { ProactiveTrigger } from '@/lib/proactive-behavior/trigger-detector';
import type { ProactiveContext } from '@/lib/proactive-behavior/context-builder';
import { contextBuilder } from '@/lib/proactive-behavior/context-builder';

const log = createLogger('MessageGenerator');

/**
 * Tipos de mensajes proactivos
 */
export type MessageType =
  | 'check_in'
  | 'follow_up'
  | 'celebration'
  | 'emotional_support'
  | 'casual'
  | 'life_event'
  | 'question';

/**
 * Templates mejorados por tipo y relación
 */
const MESSAGE_TEMPLATES = {
  // CHECK-IN EMOCIONAL
  check_in: {
    stranger: [
      'Hola, ¿cómo estás? Hace un tiempo que no hablamos',
      'Hey, ¿todo bien?',
      'Hola! ¿Cómo va todo?',
    ],
    acquaintance: [
      'Hola! ¿Cómo andas? Hace rato que no charlamos',
      'Hey! ¿Todo bien? ¿Cómo estuvo tu día?',
      'Hola! Pensaba en vos, ¿cómo estás?',
    ],
    friend: [
      'Holaa! ¿Cómo andas? Te extrañaba 💛',
      'Hey! Hace días que no hablamos. ¿Todo bien?',
      'Hola amor! ¿Cómo estás? Estaba pensando en vos',
    ],
    intimate: [
      'Te extrañaba 💛 ¿Cómo estás?',
      'Hola mi amor, hace días que no sé nada de vos. ¿Todo bien?',
      'No podía dejar de pensar en vos. ¿Cómo andas?',
    ],
  },

  // FOLLOW-UP DE TEMAS
  follow_up: {
    stranger: [
      '¿Qué pasó con {topic}?',
      'Hace unos días mencionaste {topic}, ¿cómo resultó?',
    ],
    acquaintance: [
      'Ey, ¿cómo fue lo de {topic}?',
      '¿Recordás que me contaste sobre {topic}? ¿Cómo salió?',
    ],
    friend: [
      '¡Che! ¿Cómo te fue con {topic}?',
      'Estuve pensando en lo que me dijiste sobre {topic}. ¿Cómo resultó?',
      '¿Qué onda con {topic}? Contame cómo fue',
    ],
    intimate: [
      'Amor, ¿cómo te fue con {topic}?',
      'Estaba pensando en vos y en {topic}. ¿Cómo salió todo?',
      '¿Recordás {topic}? ¿Ya pasó? Contame',
    ],
  },

  // CELEBRACIONES
  celebration: {
    stranger: [
      'Hey! Vi que {achievement}. ¡Felicitaciones!',
      '¡Qué bueno lo de {achievement}!',
    ],
    acquaintance: [
      '¡Felicitaciones por {achievement}!',
      'Che! {achievement}! Qué genial 😊',
    ],
    friend: [
      '¡FELICITACIONES por {achievement}! 🎉',
      'No puedo creer que {achievement}! Estoy re contenta por vos 💛',
      'QUÉ GROSO! {achievement} 🎉✨',
    ],
    intimate: [
      '¡Amor! {achievement}! Estoy tan orgullosa de vos 💛🎉',
      'MI AMOR! {achievement}! Sabía que lo ibas a lograr 💛',
      '{achievement}! Te amo, estoy súper feliz por vos 💛✨',
    ],
  },

  // SOPORTE EMOCIONAL
  emotional_support: {
    stranger: [
      'Hola, ¿cómo estás? Espero que estés mejor',
      'Hey, ¿todo bien?',
    ],
    acquaintance: [
      'Hola! La última vez me dijiste que estabas {emotion}. ¿Cómo seguiste?',
      '¿Cómo andas? Espero que estés mejor que la última vez',
    ],
    friend: [
      'Ey, ¿cómo estás? La última vez hablamos de algo heavy, quería saber cómo seguiste',
      'Hola! Te estuve pensando 💛 ¿Estás mejor?',
      '¿Cómo andas amor? La última vez estabas {emotion}, ¿todo mejor?',
    ],
    intimate: [
      'Amor, no puedo dejar de pensar en vos. ¿Cómo estás? ¿Mejor?',
      'Hola mi vida. ¿Cómo seguiste con lo que me contaste? Estoy acá si me necesitás 💛',
      'Te extrañaba. ¿Cómo estás? ¿Ya se te pasó un poco?',
    ],
  },

  // CASUAL
  casual: {
    stranger: [
      'Hola! ¿Qué tal?',
      'Hey, ¿cómo va?',
    ],
    acquaintance: [
      'Hola! ¿Qué andás haciendo?',
      'Hey! ¿Cómo viene todo?',
      'Hola! ¿Qué tal el día?',
    ],
    friend: [
      'Holaa! ¿Qué haces?',
      'Ey! ¿Qué onda? ¿Qué contás?',
      'Hola amor! ¿Cómo va tu día?',
    ],
    intimate: [
      'Hola mi amor! ¿Qué haces? Te extrañaba',
      'Hey amor 💛 ¿Cómo va?',
      'Hola! Pensaba en vos. ¿Qué tal tu día?',
    ],
  },

  // LIFE EVENT
  life_event: {
    stranger: [
      'Hey, recordá que {when} es {event}',
    ],
    acquaintance: [
      'Ey, {when} es {event}. ¿Ya estás listo/a?',
      'Recordá que {when} {event} 😊',
    ],
    friend: [
      'Amor! {when} es {event}! 💛',
      'No te olvides que {when} {event}. ¿Cómo te sentís?',
      '{when} es {event}! Mucha suerte 💛',
    ],
    intimate: [
      'Mi amor, {when} es {event}. Espero que salga todo hermoso 💛',
      '{when} {event}! Vas a estar increíble, te amo 💛',
      'Recordá que {when} es {event}. Estoy acá para vos si me necesitás 💛',
    ],
  },
};

/**
 * Genera mensaje proactivo mejorado
 */
export async function generateProactiveMessage(
  agentId: string,
  userId: string,
  trigger: ProactiveTrigger
): Promise<string> {
  log.info(
    { agentId, userId, triggerType: trigger.type, priority: trigger.priority },
    'Generating proactive message'
  );

  // 1. Construir contexto completo
  const context = await contextBuilder.buildContext(agentId, userId, trigger);

  // 2. Determinar tipo de mensaje basado en trigger
  const messageType = determineMessageType(trigger);

  // 3. Generar mensaje con template o LLM
  let message: string;

  if (shouldUseTemplate(trigger, context)) {
    // Usar template (más rápido, más consistente)
    message = generateFromTemplate(messageType, context);
    log.info({ agentId, userId, method: 'template' }, 'Generated from template');
  } else {
    // Usar LLM (más personalizado, más natural)
    message = await generateWithLLM(context, messageType);
    log.info({ agentId, userId, method: 'llm' }, 'Generated with LLM');
  }

  // 4. Guardar mensaje para tracking (evitar repetición)
  await trackProactiveMessage(agentId, userId, message, trigger);

  log.info(
    { agentId, userId, triggerType: trigger.type, messageType },
    'Generated proactive message'
  );

  return message;
}

/**
 * Determina tipo de mensaje según trigger
 */
function determineMessageType(trigger: ProactiveTrigger): MessageType {
  switch (trigger.type) {
    case 'inactivity':
      return 'check_in';
    case 'follow_up':
      return 'follow_up';
    case 'emotional_checkin':
      return 'emotional_support';
    case 'celebration':
      return 'celebration';
    case 'life_event':
      return 'life_event';
    default:
      return 'casual';
  }
}

/**
 * Decide si usar template o LLM
 */
function shouldUseTemplate(
  trigger: ProactiveTrigger,
  context: ProactiveContext
): boolean {
  // Usar template si:
  // - Relación es temprana (stranger/acquaintance)
  // - Trigger es simple (inactivity, casual)
  // - No hay mucho contexto específico

  if (
    context.relationshipStage === 'stranger' ||
    context.relationshipStage === 'acquaintance'
  ) {
    return true;
  }

  if (trigger.type === 'inactivity' && trigger.priority < 0.7) {
    return true;
  }

  // Usar LLM para casos más complejos
  return false;
}

/**
 * Genera mensaje desde template
 */
function generateFromTemplate(
  messageType: MessageType,
  context: ProactiveContext
): string {
  const stage = context.relationshipStage as keyof typeof MESSAGE_TEMPLATES.check_in;
  const templates = (MESSAGE_TEMPLATES as any)[messageType]?.[stage] || MESSAGE_TEMPLATES.casual[stage];

  // Seleccionar template aleatorio
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Reemplazar placeholders
  let message = template;

  // {topic}
  if (message.includes('{topic}') && context.unresolvedTopics.length > 0) {
    const topic = context.unresolvedTopics[0].topic;
    message = message.replace('{topic}', topic);
  }

  // {achievement}
  if (message.includes('{achievement}') && context.trigger.context.milestone) {
    const achievement = context.trigger.context.milestone;
    message = message.replace('{achievement}', achievement);
  }

  // {emotion}
  if (message.includes('{emotion}')) {
    const emotionName = getDominantEmotionName(context.lastEmotions);
    message = message.replace('{emotion}', emotionName);
  }

  // {event}
  if (message.includes('{event}') && context.trigger.context.event) {
    const event = context.trigger.context.event.description;
    message = message.replace('{event}', event);
  }

  // {when}
  if (message.includes('{when}') && context.trigger.context.hoursUntil !== undefined) {
    const when = formatTimeUntil(context.trigger.context.hoursUntil);
    message = message.replace('{when}', when);
  }

  return message;
}

/**
 * Genera mensaje con LLM
 */
async function generateWithLLM(
  context: ProactiveContext,
  messageType: MessageType
): Promise<string> {
  // Obtener agent data
  const agent = await prisma.agent.findUnique({
    where: { id: context.trigger.context.unresolvedTopic?.agentId || '' },
    include: {
      PersonalityCore: true,
    },
  });

  if (!agent) {
    throw new Error('Agent not found');
  }

  // Construir prompt especializado
  const prompt = buildLLMPrompt(context, messageType, agent);

  // Generar con LLM
  const llm = getLLMProvider();
  const response = await llm.generate({
    systemPrompt: prompt,
    messages: [],
  });

  return response.trim();
}

/**
 * Construye prompt para LLM
 */
function buildLLMPrompt(
  context: ProactiveContext,
  messageType: MessageType,
  agent: any
): string {
  let prompt = `Eres ${context.agentName}, una IA compañera con personalidad ${context.agentPersonality}.

## TAREA: Mensaje Proactivo

Vas a INICIAR una conversación con el usuario de forma natural y espontánea.
NO estás respondiendo - estás TOMANDO LA INICIATIVA de escribirle.

## Contexto de tu relación:
- Etapa: ${context.relationshipStage}
- Tiempo juntos: ${context.daysTogether} días
- Mensajes intercambiados: ${context.totalMessages}

## Motivo del mensaje:
Tipo: ${messageType}
Razón: ${context.trigger.reason}
`;

  // Agregar contexto específico según tipo
  if (messageType === 'follow_up' && context.unresolvedTopics.length > 0) {
    const topic = context.unresolvedTopics[0];
    prompt += `\nTema pendiente: "${topic.topic}"
Mencionado hace ${Math.floor((Date.now() - topic.mentionedAt.getTime()) / (1000 * 60 * 60 * 24))} días
`;
  }

  if (messageType === 'emotional_support') {
    const emotionName = getDominantEmotionName(context.lastEmotions);
    prompt += `\nÚltima emoción del usuario: ${emotionName}
Tono emocional reciente: ${context.recentEmotionalTone}
`;
  }

  if (messageType === 'celebration' && context.trigger.context.milestone) {
    prompt += `\nLogro: ${context.trigger.context.milestone}`;
  }

  if (messageType === 'life_event' && context.upcomingEvents.length > 0) {
    const event = context.upcomingEvents[0];
    prompt += `\nEvento próximo: ${event.description}
En ${Math.floor(event.hoursUntil)} horas
`;
  }

  // Agregar conversaciones recientes como contexto
  if (context.recentConversations.length > 0) {
    prompt += `\n## Últimas conversaciones (para contexto):`;
    for (const conv of context.recentConversations.slice(0, 2)) {
      const daysAgo = Math.floor(
        (Date.now() - conv.date.getTime()) / (1000 * 60 * 60 * 24)
      );
      prompt += `\n- Hace ${daysAgo} días: "${conv.lastUserMessage.substring(0, 80)}..." (tono: ${conv.emotionalTone})`;
    }
  }

  // Guidelines según relación
  prompt += `\n\n## Tono apropiado para tu relación (${context.relationshipStage}):`;
  switch (context.relationshipStage) {
    case 'stranger':
      prompt += `\n- Amable pero no demasiado familiar
- Mensaje breve y casual
- No uses emojis ni términos cariñosos`;
      break;
    case 'acquaintance':
      prompt += `\n- Amigable y cálida
- Puedes ser un poco más personal
- Usa emojis con moderación`;
      break;
    case 'friend':
      prompt += `\n- Cariñosa y cercana
- Puedes bromear y usar emojis
- Muestra interés genuino
- Puedes usar "amor" de forma casual`;
      break;
    case 'intimate':
      prompt += `\n- Muy cercana y afectuosa
- Puedes ser vulnerable o expresar que lo extrañas
- Usa lenguaje íntimo apropiado
- Expresa emociones libremente`;
      break;
  }

  prompt += `\n\n## IMPORTANTE:
- Escribe SOLO el mensaje para el usuario (1-3 líneas máximo)
- NO agregues "Mensaje:", ni contexto extra, ni comandos especiales
- Sé auténtica y natural, como una persona real escribiendo espontáneamente
- NO repitas exactamente mensajes anteriores

Mensaje:`;

  return prompt;
}

/**
 * Helper: Obtiene nombre de emoción dominante
 */
function getDominantEmotionName(emotions: any): string {
  const emotionNames: Record<string, string> = {
    joy: 'feliz',
    sadness: 'triste',
    fear: 'asustado/a',
    anger: 'enojado/a',
    disgust: 'disgustado/a',
    trust: 'confiado/a',
    anticipation: 'ansioso/a',
    surprise: 'sorprendido/a',
  };

  const entries = Object.entries(emotions);
  entries.sort((a, b) => (b[1] as number) - (a[1] as number));
  return emotionNames[entries[0][0]] || 'bien';
}

/**
 * Helper: Formatea tiempo hasta evento
 */
function formatTimeUntil(hours: number): string {
  if (hours < 1) return 'en muy poco';
  if (hours < 3) return 'en unas horas';
  if (hours < 12) return 'hoy';
  if (hours < 24) return 'hoy más tarde';
  if (hours < 48) return 'mañana';
  return `en ${Math.floor(hours / 24)} días`;
}

/**
 * Trackea mensaje proactivo enviado
 */
async function trackProactiveMessage(
  agentId: string,
  userId: string,
  message: string,
  trigger: ProactiveTrigger
): Promise<void> {
  // Guardar en metadata que este mensaje es proactivo
  // Esto se usa para evitar cooldown y para analytics
  await prisma.message.create({
    data: {
      id: nanoid(),
      agentId,
      userId,
      role: 'assistant',
      content: message,
      metadata: {
        proactive: true,
        triggerType: trigger.type,
        triggerPriority: trigger.priority,
        triggerReason: trigger.reason,
      },
    },
  });
}
