import { prisma } from "@/lib/prisma";
import { PLANS, getPlanLimit } from "@/lib/mercadopago/config";
import { Prisma } from "@prisma/client";

export type ResourceType = "message" | "agent" | "world" | "api_call" | "tokens";

// Trackear uso de un recurso
export async function trackUsage(
  userId: string,
  resourceType: ResourceType,
  quantity: number = 1,
  resourceId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await prisma.usage.create({
    data: {
      userId,
      resourceType,
      resourceId,
      quantity,
      metadata: (metadata as Prisma.InputJsonValue) || undefined,
    },
  });
}

// Obtener uso del mes actual
export async function getCurrentMonthUsage(
  userId: string,
  resourceType?: ResourceType
): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const whereClause: { userId: string; resourceType?: string; createdAt: { gte: Date } } = {
    userId,
    createdAt: { gte: startOfMonth },
  };

  if (resourceType) {
    whereClause.resourceType = resourceType;
  }

  const usage = await prisma.usage.aggregate({
    where: whereClause,
    _sum: {
      quantity: true,
    },
  });

  return usage._sum.quantity || 0;
}

// Obtener conteo actual de recursos
export async function getCurrentResourceCount(
  userId: string,
  resourceType: "agent" | "world"
): Promise<number> {
  if (resourceType === "agent") {
    return await prisma.agent.count({ where: { userId } });
  } else if (resourceType === "world") {
    return await prisma.world.count({ where: { userId } });
  }
  return 0;
}

// Verificar si el usuario puede usar un recurso
export async function canUseResource(
  userId: string,
  resourceType: ResourceType,
  quantity: number = 1
): Promise<{ allowed: boolean; reason?: string; current?: number; limit?: number }> {
  // Obtener plan del usuario
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (!user) {
    return { allowed: false, reason: "User not found" };
  }

  const planId = user.plan as keyof typeof PLANS;
  const plan = PLANS[planId];

  if (!plan) {
    return { allowed: false, reason: "Invalid plan" };
  }

  // Verificar límites según tipo de recurso
  if (resourceType === "message") {
    const limit = plan.limits.messages;
    if (limit === -1) return { allowed: true }; // unlimited

    const current = await getCurrentMonthUsage(userId, "message");
    if (current + quantity > limit) {
      return {
        allowed: false,
        reason: `Monthly message limit reached (${limit})`,
        current,
        limit,
      };
    }
    return { allowed: true, current, limit };
  }

  if (resourceType === "agent") {
    const limit = plan.limits.agents;
    if (limit === -1) return { allowed: true }; // unlimited

    const current = await getCurrentResourceCount(userId, "agent");
    if (current + quantity > limit) {
      return {
        allowed: false,
        reason: `Agent limit reached (${limit})`,
        current,
        limit,
      };
    }
    return { allowed: true, current, limit };
  }

  if (resourceType === "world") {
    const limit = plan.limits.worlds;
    if (limit === -1) return { allowed: true }; // unlimited

    const current = await getCurrentResourceCount(userId, "world");
    if (current + quantity > limit) {
      return {
        allowed: false,
        reason: `World limit reached (${limit})`,
        current,
        limit,
      };
    }
    return { allowed: true, current, limit };
  }

  if (resourceType === "tokens") {
    const limit = plan.limits.tokensPerMessage;
    if (quantity > limit) {
      return {
        allowed: false,
        reason: `Token limit per message exceeded (${limit})`,
        current: quantity,
        limit,
      };
    }
    return { allowed: true };
  }

  // Default: allow
  return { allowed: true };
}

// Obtener estadísticas de uso
export async function getUsageStats(userId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Obtener plan del usuario
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (!user) return null;

  const planId = user.plan as keyof typeof PLANS;
  const plan = PLANS[planId];

  // Obtener uso del mes
  const [messagesUsed, agentsCount, worldsCount, tokensUsed] = await Promise.all([
    getCurrentMonthUsage(userId, "message"),
    getCurrentResourceCount(userId, "agent"),
    getCurrentResourceCount(userId, "world"),
    prisma.usage.aggregate({
      where: {
        userId,
        resourceType: "tokens",
        createdAt: { gte: startOfMonth },
      },
      _sum: { quantity: true },
    }),
  ]);

  return {
    plan: planId,
    messages: {
      used: messagesUsed,
      limit: plan.limits.messages,
      percentage: plan.limits.messages === -1 ? 0 : (messagesUsed / plan.limits.messages) * 100,
    },
    agents: {
      used: agentsCount,
      limit: plan.limits.agents,
      percentage: plan.limits.agents === -1 ? 0 : (agentsCount / plan.limits.agents) * 100,
    },
    worlds: {
      used: worldsCount,
      limit: plan.limits.worlds,
      percentage: plan.limits.worlds === -1 ? 0 : (worldsCount / plan.limits.worlds) * 100,
    },
    tokens: {
      used: tokensUsed._sum.quantity || 0,
      perMessage: plan.limits.tokensPerMessage,
    },
  };
}

// Resetear uso mensual (para testing o admin)
export async function resetMonthlyUsage(userId: string): Promise<void> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  await prisma.usage.deleteMany({
    where: {
      userId,
      createdAt: { gte: startOfMonth },
    },
  });
}

// Verificar si el usuario está cerca del límite (>80%)
export async function isNearLimit(
  userId: string,
  resourceType: "message" | "agent" | "world"
): Promise<boolean> {
  const stats = await getUsageStats(userId);
  if (!stats) return false;

  // Map singular to plural
  const pluralMap = { message: "messages", agent: "agents", world: "worlds" } as const;
  const resourceKey = pluralMap[resourceType];
  const resource = stats[resourceKey];
  if (resource.limit === -1) return false; // unlimited

  return resource.percentage >= 80;
}
