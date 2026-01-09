/**
 * Verificaciones atómicas de recursos para prevenir race conditions
 *
 * CRITICAL: Estas funciones usan transacciones con isolation level Serializable
 * para garantizar que múltiples requests simultáneos no puedan bypassear límites.
 */

import { prisma } from "@/lib/prisma";
import { getTierLimits } from "./tier-limits";

/**
 * Verificar límite de agentes de forma atómica y retornar el count actual
 *
 * DEBE usarse dentro de una transacción antes de crear un agente
 *
 * @throws Error con formato JSON si el límite es alcanzado
 */
export async function atomicCheckAgentLimit(
  tx: any, // PrismaTransaction
  userId: string,
  userPlan: string
): Promise<{ current: number; limit: number }> {
  // Count dentro de la transacción con lock implícito
  const current = await tx.agent.count({
    where: { userId },
  });

  const limits = getTierLimits(userPlan);
  const limit = limits.resources.maxAgents;

  // Si el límite es -1, es ilimitado
  if (limit === -1) {
    return { current, limit };
  }

  // Verificar si se excede el límite
  if (current >= limit) {
    throw new Error(
      JSON.stringify({
        error: `Límite de ${limit} agentes alcanzado`,
        current,
        limit,
        upgradeUrl: "/pricing",
      })
    );
  }

  return { current, limit };
}

/**
 * Verificar límite de grupos de forma atómica
 * Ya implementado directamente en app/api/groups/route.ts
 * Esta función es para referencia y futuro uso
 */
export async function atomicCheckGroupLimit(
  tx: any,
  userId: string,
  userPlan: string
): Promise<{ current: number; limit: number }> {
  const current = await tx.group.count({
    where: {
      creatorId: userId,
      status: "ACTIVE",
    },
  });

  const limits = getTierLimits(userPlan);
  const limit = limits.resources.activeGroups;

  if (limit === -1) {
    return { current, limit };
  }

  if (current >= limit) {
    throw new Error(
      JSON.stringify({
        error: `Límite de ${limit} grupos alcanzado`,
        current,
        limit,
        upgradeUrl: "/pricing",
      })
    );
  }

  return { current, limit };
}

/**
 * Verificar límite de posts de comunidad de forma atómica
 */
export async function atomicCheckPostLimit(
  tx: any,
  userId: string,
  dailyLimit: number
): Promise<{ current: number; limit: number }> {
  // Count posts creados hoy
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const current = await tx.post.count({
    where: {
      authorId: userId,
      createdAt: {
        gte: startOfDay,
      },
    },
  });

  if (current >= dailyLimit) {
    throw new Error(
      JSON.stringify({
        error: `Límite diario de ${dailyLimit} posts alcanzado`,
        current,
        limit: dailyLimit,
        retryAfter: getSecondsUntilMidnight(),
      })
    );
  }

  return { current, limit: dailyLimit };
}

/**
 * Helper: Calcular segundos hasta medianoche
 */
function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 1000);
}

/**
 * Verificar límite de IAs en un grupo de forma atómica
 */
export async function atomicCheckGroupAILimit(
  tx: any,
  groupId: string,
  userPlan: string
): Promise<{ current: number; limit: number }> {
  const current = await tx.groupMember.count({
    where: {
      groupId,
      memberType: "agent",
      isActive: true,
    },
  });

  const limits = getTierLimits(userPlan);
  const limit = limits.resources.maxAIsPerGroup;

  if (current >= limit) {
    throw new Error(
      JSON.stringify({
        error: `Límite de ${limit} IAs por grupo alcanzado`,
        current,
        limit,
        upgradeUrl: "/pricing",
      })
    );
  }

  return { current, limit };
}

/**
 * Verificar límite de usuarios en un grupo de forma atómica
 */
export async function atomicCheckGroupUserLimit(
  tx: any,
  groupId: string,
  userPlan: string
): Promise<{ current: number; limit: number }> {
  const current = await tx.groupMember.count({
    where: {
      groupId,
      memberType: "user",
      isActive: true,
    },
  });

  const limits = getTierLimits(userPlan);
  const limit = limits.resources.maxUsersPerGroup;

  if (current >= limit) {
    throw new Error(
      JSON.stringify({
        error: `Límite de ${limit} usuarios por grupo alcanzado`,
        current,
        limit,
        upgradeUrl: "/pricing",
      })
    );
  }

  return { current, limit };
}
