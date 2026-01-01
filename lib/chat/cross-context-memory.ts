import { prisma } from "@/lib/prisma";
import type { UserTier } from "./types";

/**
 * Sistema de Memoria Compartida Cross-Context
 *
 * Permite que los personajes recuerden conversaciones grupales
 * cuando hablan individualmente y viceversa.
 *
 * Ejemplo: "Ey, la charla de ayer con {personaje2} estuvo muy interesante"
 */

export interface CrossContextMemoryData {
  id: string;
  summary: string;
  involvedAgents: Array<{ agentId: string; agentName: string }>;
  happenedAt: Date;
  emotionalTone?: string;
  sourceType: string;
  importance: number;
  timeSince: string; // "hace 2 horas", "ayer", "hace 3 días"
}

// Límites de memoria según tier
const MEMORY_LIMITS = {
  free: {
    maxMemories: 10, // Solo recuerda 10 cosas recientes
    maxDaysBack: 7, // Máximo 7 días atrás
    includeGroupMemories: false, // No puede referenciar grupos
  },
  plus: {
    maxMemories: 50,
    maxDaysBack: 30, // 30 días
    includeGroupMemories: true,
  },
  ultra: {
    maxMemories: null, // Ilimitado
    maxDaysBack: null, // Todo el tiempo
    includeGroupMemories: true,
  },
};

/**
 * Crea una memoria cross-context desde una interacción de mundo
 */
export async function createMemoryFromWorldInteraction(
  agentId: string,
  worldId: string,
  interactionId: string,
  summary: string,
  involvedAgents: Array<{ agentId: string; agentName: string }>,
  importance: number = 0.5
): Promise<void> {
  await prisma.crossContextMemory.create({
    data: {
      agentId,
      sourceType: "group_interaction",
      sourceGroupId: worldId,
      summary,
      involvedAgents,
      happenedAt: new Date(),
      importance,
      emotionalTone: "neutral",
    },
  });
}

/**
 * Crea una memoria cross-context desde un chat individual
 */
export async function createMemoryFromIndividualChat(
  agentId: string,
  userId: string,
  summary: string,
  importance: number = 0.5
): Promise<void> {
  await prisma.crossContextMemory.create({
    data: {
      agentId,
      sourceType: "individual_chat",
      sourceUserId: userId,
      summary,
      happenedAt: new Date(),
      importance,
    },
  });
}

/**
 * Obtiene memorias relevantes para inyectar en el contexto
 */
export async function getRelevantMemories(
  agentId: string,
  tier: UserTier,
  currentContext: "individual" | "world",
  limit: number = 5
): Promise<CrossContextMemoryData[]> {
  const limits = MEMORY_LIMITS[tier];

  // Free tier: No cross-context memories
  if (!limits.includeGroupMemories && currentContext === "individual") {
    return [];
  }

  // Calcular fecha límite
  const dateLimit =
    limits.maxDaysBack !== null
      ? new Date(Date.now() - limits.maxDaysBack * 24 * 60 * 60 * 1000)
      : new Date(0);

  // Obtener memorias
  const memories = await prisma.crossContextMemory.findMany({
    where: {
      agentId,
      happenedAt: {
        gte: dateLimit,
      },
      // Si estamos en chat individual, traer memorias de worlds
      // Si estamos en world, traer memorias de chats individuales
      sourceType:
        currentContext === "individual" ? "world_interaction" : "individual_chat",
    },
    orderBy: [{ importance: "desc" }, { happenedAt: "desc" }],
    take: limits.maxMemories !== null ? Math.min(limit, limits.maxMemories) : limit,
  });

  // Formatear con tiempo relativo
  return memories.map((mem) => ({
    id: mem.id,
    summary: mem.summary,
    involvedAgents: (mem.involvedAgents as any) || [],
    happenedAt: mem.happenedAt,
    emotionalTone: mem.emotionalTone || undefined,
    sourceType: mem.sourceType,
    importance: mem.importance,
    timeSince: getRelativeTime(mem.happenedAt),
  }));
}

/**
 * Registra que una memoria fue referenciada
 */
export async function recordMemoryReference(memoryId: string): Promise<void> {
  await prisma.crossContextMemory.update({
    where: { id: memoryId },
    data: {
      lastReferencedAt: new Date(),
      referenceCount: {
        increment: 1,
      },
      // Aumentar importancia cuando se referencia
      importance: {
        increment: 0.05,
      },
    },
  });
}

/**
 * Actualiza el contexto temporal del agente con el usuario
 */
export async function updateTemporalContext(
  agentId: string,
  userId: string,
  contextType: "individual" | "world",
  worldId?: string
): Promise<void> {
  const updates: any = {
    lastSeenAt: new Date(),
  };

  if (contextType === "individual") {
    updates.lastIndividualChatAt = new Date();
    updates.individualChatCount = {
      increment: 1,
    };
  } else if (contextType === "world") {
    updates.lastWorldInteractionAt = new Date();
    updates.lastWorldId = worldId;
    updates.worldInteractionCount = {
      increment: 1,
    };
  }

  await prisma.temporalContext.upsert({
    where: {
      agentId_userId: {
        agentId,
        userId,
      },
    },
    create: {
      agentId,
      userId,
      ...updates,
      individualChatCount: contextType === "individual" ? 1 : 0,
      worldInteractionCount: contextType === "world" ? 1 : 0,
    },
    update: updates,
  });
}

/**
 * Obtiene el contexto temporal actual
 */
export async function getTemporalContext(agentId: string, userId: string) {
  return await prisma.temporalContext.findUnique({
    where: {
      agentId_userId: {
        agentId,
        userId,
      },
    },
  });
}

/**
 * Genera contexto de memoria para inyectar en el prompt
 */
export function generateMemoryContext(memories: CrossContextMemoryData[]): string {
  if (memories.length === 0) {
    return "";
  }

  let context = "\n**Memorias Recientes Relevantes**:\n";

  for (const memory of memories) {
    const involvedNames =
      memory.involvedAgents?.map((a) => a.agentName).join(", ") || "otros";

    context += `- ${memory.timeSince}: ${memory.summary}`;

    if (memory.involvedAgents && memory.involvedAgents.length > 0) {
      context += ` (con ${involvedNames})`;
    }

    context += "\n";
  }

  context +=
    "\n*Puedes mencionar estas memorias naturalmente si son relevantes a la conversación actual.*\n";

  return context;
}

/**
 * Calcula tiempo relativo en español
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `hace ${diffMinutes} minuto${diffMinutes !== 1 ? "s" : ""}`;
  } else if (diffHours < 24) {
    return `hace ${diffHours} hora${diffHours !== 1 ? "s" : ""}`;
  } else if (diffDays === 1) {
    return "ayer";
  } else if (diffDays < 7) {
    return `hace ${diffDays} días`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `hace ${weeks} semana${weeks !== 1 ? "s" : ""}`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `hace ${months} mes${months !== 1 ? "es" : ""}`;
  }
}

/**
 * Extrae memorias importantes desde interacciones de mundo
 * (Se llama periódicamente o al final de cada sesión de mundo)
 */
export async function extractMemoriesFromWorld(
  worldId: string,
  agentId: string,
  lastNInteractions: number = 10
): Promise<void> {
  // TODO: Implement group interaction tracking
  // The worldInteraction model has been removed in favor of group messages
  // This functionality should be reimplemented using GroupMessage model
  console.warn('[Cross Context Memory] World interaction tracking not implemented - using group messages instead');

  // For now, return early
  return;

  /* Original code - keeping for reference until reimplemented
  const interactions = await prisma.worldInteraction.findMany({
    where: {
      worldId,
      OR: [{ speakerId: agentId }, { targetId: agentId }],
    },
    orderBy: { createdAt: "desc" },
    take: lastNInteractions,
  });

  if (interactions.length === 0) {
    return;
  }

  // Por ahora, crear una memoria resumida simple
  // En el futuro, usar LLM para generar resumen más inteligente
  const recentContent = interactions
    .reverse()
    .map((i: any) => i.content)
    .join(" ");

  // Calcular importancia basada en sentiment y metadata
  let importance = 0.5;
  const hasPositiveSentiment = interactions.some((i: any) => i.sentiment === "positive");
  const hasNegativeSentiment = interactions.some((i: any) => i.sentiment === "negative");

  if (hasPositiveSentiment || hasNegativeSentiment) {
    importance = 0.7; // Interacciones emocionales son más importantes
  }

  // Obtener otros agentes involucrados
  const otherAgentIds = [
    ...new Set(
      interactions
        .flatMap((i: any) => [i.speakerId, i.targetId])
        .filter((id: any) => id && id !== agentId)
    ),
  ];

  const otherAgents = await prisma.agent.findMany({
    where: {
      id: {
        in: otherAgentIds as string[],
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const involvedAgents = otherAgents.map((a) => ({
    agentId: a.id,
    agentName: a.name,
  }));

  // Crear memoria simplificada (en el futuro, usar LLM para resumen)
  const summary = `Conversación en grupo sobre: ${recentContent.slice(0, 200)}...`;

  await createMemoryFromWorldInteraction(
    agentId,
    worldId,
    interactions[0].id,
    summary,
    involvedAgents,
    importance
  );
  */
}

/**
 * Limpia memorias antiguas según tier
 */
export async function cleanupOldMemories(agentId: string, tier: UserTier): Promise<void> {
  const limits = MEMORY_LIMITS[tier];

  if (limits.maxDaysBack === null) {
    return; // Ultra tier: no cleanup
  }

  const dateLimit = new Date(Date.now() - limits.maxDaysBack * 24 * 60 * 60 * 1000);

  await prisma.crossContextMemory.deleteMany({
    where: {
      agentId,
      happenedAt: {
        lt: dateLimit,
      },
    },
  });
}
