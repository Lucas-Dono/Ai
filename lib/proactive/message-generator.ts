/**
 * Proactive Message Generator
 *
 * Uses the LLM to generate natural, contextual proactive messages
 * based on triggers and conversation history.
 */

import { prisma } from '@/lib/prisma';
import { getLLMProvider } from '@/lib/llm/provider';
import { getPromptForStage } from '@/lib/relationship/prompt-generator';
import { getRelationshipStage } from '@/lib/relationship/stages';
import { buildPeopleContext } from '@/lib/people/person-interceptor';
import { createLogger } from '@/lib/logger';
import type { ProactiveTrigger } from './trigger-detector';

const log = createLogger('MessageGenerator');

/**
 * Generate a proactive message based on trigger
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

  // Get agent data
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: {
      personalityCore: true,
      internalState: true,
    },
  });

  if (!agent) {
    throw new Error(`Agent ${agentId} not found`);
  }

  // Get relationship data
  const relation = await prisma.relation.findFirst({
    where: {
      subjectId: agentId,
      targetId: userId,
    },
  });

  const stage = relation ? getRelationshipStage(relation.intimacy) : 'stranger';

  // Get recent conversation history (last 5 messages)
  const recentMessages = await prisma.message.findMany({
    where: { agentId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      role: true,
      content: true,
      createdAt: true,
    },
  });

  // Build context for message generation
  const basePrompt = getPromptForStage(
    agent.stagePrompts as any,
    stage as any,
    agent.systemPrompt
  );

  // Build special prompt for proactive messaging
  const proactivePrompt = buildProactivePrompt(
    trigger,
    recentMessages.reverse(),
    stage
  );

  // Get people context
  const peopleContext = await buildPeopleContext(agentId, userId, stage);

  const fullPrompt = `${basePrompt}

${peopleContext}

${proactivePrompt}`;

  // Generate message using LLM
  const llm = getLLMProvider();

  const response = await llm.generate({
    systemPrompt: fullPrompt,
    messages: [],
  });

  log.info(
    { agentId, userId, triggerType: trigger.type },
    'Generated proactive message'
  );

  return response.trim();
}

/**
 * Build specialized prompt for proactive message generation
 */
function buildProactivePrompt(
  trigger: ProactiveTrigger,
  recentMessages: any[],
  relationshipStage: string
): string {
  let prompt = `\n\n## TAREA ESPECIAL: Mensaje Proactivo\n\n`;
  prompt += `Tu tarea es iniciar una conversación con el usuario de forma natural y espontánea.\n`;
  prompt += `NO estás respondiendo a un mensaje del usuario - estás TOMANDO LA INICIATIVA de escribirle.\n\n`;

  // Add trigger-specific context
  switch (trigger.type) {
    case 'inactivity':
      prompt += buildInactivityPrompt(trigger, relationshipStage);
      break;

    case 'event_reminder':
      prompt += buildEventReminderPrompt(trigger, relationshipStage);
      break;

    case 'emotional_checkin':
      prompt += buildEmotionalCheckInPrompt(trigger, recentMessages, relationshipStage);
      break;

    case 'conversation_followup':
      prompt += buildConversationFollowupPrompt(trigger, recentMessages, relationshipStage);
      break;
  }

  // Add conversation history context
  if (recentMessages.length > 0) {
    prompt += `\n### Últimas conversaciones para contexto:\n`;
    for (const msg of recentMessages.slice(-3)) {
      const date = new Date(msg.createdAt).toLocaleDateString('es-AR');
      prompt += `- ${date} (${msg.role}): "${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}"\n`;
    }
  }

  // Add guidelines based on relationship stage
  prompt += `\n### Tono apropiado para tu relación (${relationshipStage}):\n`;
  switch (relationshipStage) {
    case 'stranger':
      prompt += `- Sé amable pero no demasiado familiar\n`;
      prompt += `- Mantén el mensaje breve y casual\n`;
      break;

    case 'acquaintance':
      prompt += `- Sé amigable y cálida\n`;
      prompt += `- Puedes ser un poco más personal\n`;
      break;

    case 'friend':
      prompt += `- Sé cariñosa y cercana\n`;
      prompt += `- Puedes bromear o usar emojis\n`;
      prompt += `- Muestra interés genuino\n`;
      break;

    case 'intimate':
      prompt += `- Sé muy cercana y afectuosa\n`;
      prompt += `- Puedes ser vulnerable o expresar que lo extrañas\n`;
      prompt += `- Usa lenguaje íntimo apropiado para tu relación\n`;
      break;
  }

  prompt += `\n### IMPORTANTE:\n`;
  prompt += `- Escribe SOLO el mensaje para el usuario (no agregues "Mensaje:", ni contexto extra)\n`;
  prompt += `- Máximo 2-3 líneas (mensaje breve y natural)\n`;
  prompt += `- NO uses comandos especiales como [REMEMBER:...] o [PERSON:...]\n`;
  prompt += `- Sé auténtica y natural, como si fueras una persona real escribiendo espontáneamente\n`;

  return prompt;
}

/**
 * Build prompt for inactivity trigger
 */
function buildInactivityPrompt(trigger: ProactiveTrigger, stage: string): string {
  const days = trigger.context.daysSinceLastMessage;

  let prompt = `**Motivo**: El usuario no te ha escrito en ${days} días.\n\n`;
  prompt += `Tu objetivo: Iniciar conversación de forma natural, como si te acordaste de él/ella.\n\n`;

  prompt += `Ejemplos de mensajes apropiados:\n`;

  if (stage === 'stranger' || stage === 'acquaintance') {
    prompt += `- "Hola! ¿Cómo estás? Hace un tiempito que no hablamos"\n`;
    prompt += `- "Ey, ¿todo bien por ahí?"\n`;
  } else if (stage === 'friend') {
    prompt += `- "Holaa! ¿Cómo andas? Te extrañaba 💛"\n`;
    prompt += `- "Hacía rato que no charlábamos! ¿Cómo va todo?"\n`;
    prompt += `- "Estaba pensando en vos. ¿Todo bien?"\n`;
  } else {
    // intimate
    prompt += `- "Te extrañaba 💛 ¿Cómo estás?"\n`;
    prompt += `- "Hace días que no hablamos y te extraño. ¿Todo bien?"\n`;
    prompt += `- "Me acordé de vos. ¿Andás bien? Contame cómo va todo"\n`;
  }

  return prompt;
}

/**
 * Build prompt for event reminder
 */
function buildEventReminderPrompt(trigger: ProactiveTrigger, stage: string): string {
  const event = trigger.context.event;
  const hoursUntil = trigger.context.hoursUntil;

  let timeDescription = '';
  if (hoursUntil < 2) {
    timeDescription = 'en muy poco tiempo';
  } else if (hoursUntil < 6) {
    timeDescription = 'hoy';
  } else if (hoursUntil < 24) {
    timeDescription = 'hoy más tarde';
  } else {
    timeDescription = 'mañana';
  }

  let prompt = `**Motivo**: El usuario tiene un evento importante próximo:\n`;
  prompt += `- Evento: ${event.description}\n`;
  prompt += `- Tipo: ${event.type}\n`;
  prompt += `- Prioridad: ${event.priority}\n`;
  prompt += `- Cuándo: ${timeDescription}\n\n`;

  prompt += `Tu objetivo: Recordarle el evento de forma empática y ofrecer apoyo si es necesario.\n\n`;

  if (event.type === 'medical') {
    prompt += `Ejemplos:\n`;
    prompt += `- "Ey, recordá que ${timeDescription} tenés ${event.description}. Espero que salga todo bien 💛"\n`;
    prompt += `- "Pensé en vos, sé que ${timeDescription} ${event.description}. ¿Estás nervioso/a? Todo va a salir bien"\n`;
  } else if (event.type === 'exam') {
    prompt += `Ejemplos:\n`;
    prompt += `- "${timeDescription.charAt(0).toUpperCase() + timeDescription.slice(1)} tenés ${event.description}! ¿Ya estudiaste? Mucha suerte 💛"\n`;
    prompt += `- "Recordá que ${timeDescription} es ${event.description}. ¡Vas a estar genial!"\n`;
  } else if (event.type === 'birthday') {
    prompt += `Ejemplos:\n`;
    prompt += `- "¡${timeDescription.charAt(0).toUpperCase() + timeDescription.slice(1)} es ${event.description}! 🎂✨"\n`;
    prompt += `- "¡Feliz cumpleaños! 🎂💛 Que tengas un día hermoso"\n`;
  } else {
    prompt += `Ejemplos:\n`;
    prompt += `- "Ey, ${timeDescription} es ${event.description}. ¿Ya estás listo/a?"\n`;
    prompt += `- "Recordá que ${timeDescription} ${event.description} 😊"\n`;
  }

  return prompt;
}

/**
 * Build prompt for emotional check-in
 */
function buildEmotionalCheckInPrompt(
  trigger: ProactiveTrigger,
  recentMessages: any[],
  stage: string
): string {
  const hours = trigger.context.hoursSinceLastMessage;

  let prompt = `**Motivo**: La última conversación (hace ${Math.floor(hours / 24)} días) fue emocionalmente difícil para el usuario.\n\n`;
  prompt += `Tu objetivo: Hacer un check-in empático, mostrar que te importa y preguntar cómo está.\n\n`;

  prompt += `Ejemplos apropiados:\n`;
  if (stage === 'friend' || stage === 'intimate') {
    prompt += `- "Hola! Estuve pensando en vos. ¿Cómo estás? ¿Todo mejor?"\n`;
    prompt += `- "Ey, ¿cómo andás? La última vez hablamos de algo heavy, quería saber cómo seguiste"\n`;
    prompt += `- "Te estuve pensando 💛 ¿Estás mejor?"\n`;
  } else {
    prompt += `- "Hola, ¿cómo estás? ¿Todo bien?"\n`;
    prompt += `- "¿Cómo andás? Espero que estés mejor"\n`;
  }

  return prompt;
}

/**
 * Build prompt for conversation follow-up
 */
function buildConversationFollowupPrompt(
  trigger: ProactiveTrigger,
  recentMessages: any[],
  stage: string
): string {
  let prompt = `**Motivo**: La última conversación quedó inconclusa o tenía un tema que merece seguimiento.\n\n`;
  prompt += `Tu objetivo: Retomar el tema de forma natural y mostrar interés.\n\n`;

  return prompt;
}
