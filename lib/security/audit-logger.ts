/**
 * AUDIT LOGGER PARA SYMBOLIC BONDS
 *
 * Registra TODAS las acciones críticas para:
 * - Compliance y auditoría
 * - Debugging de issues
 * - Análisis forense de fraude
 * - Rollback de acciones
 */

import { prisma } from "@/lib/prisma";

export enum AuditAction {
  BOND_ESTABLISHED = "bond_established",
  BOND_UPDATED = "bond_updated",
  BOND_RELEASED = "bond_released",
  BOND_TRANSFERRED = "bond_transferred", // Futuro
  QUEUE_JOINED = "queue_joined",
  QUEUE_LEFT = "queue_left",
  SLOT_OFFERED = "slot_offered",
  SLOT_CLAIMED = "slot_claimed",
  SLOT_EXPIRED = "slot_expired",
  RARITY_CALCULATED = "rarity_calculated",
  PENALTY_APPLIED = "penalty_applied",
  FRAUD_DETECTED = "fraud_detected",
  USER_BLOCKED = "user_blocked",
  CONFIG_UPDATED = "config_updated",
}

export interface AuditEntry {
  action: AuditAction;
  userId?: string;
  agentId?: string;
  bondId?: string;
  actorId?: string; // Quien realizó la acción (usuario, sistema, admin)
  actorType: "user" | "system" | "admin";
  metadata: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * Log de acción con todos los detalles
 */
export async function logAudit(entry: Omit<AuditEntry, "timestamp">) {
  try {
    // Guardar en tabla Log
    await prisma.log.create({
      data: {
        userId: entry.userId || null,
        agentId: entry.agentId || null,
        action: entry.action,
        metadata: {
          ...entry.metadata,
          actorId: entry.actorId,
          actorType: entry.actorType,
          bondId: entry.bondId,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      },
    });

    console.log(`[Audit] ${entry.action}`, {
      userId: entry.userId,
      actorId: entry.actorId,
    });
  } catch (error) {
    console.error("[Audit] Error logging:", error);
    // No lanzar error para no romper flujo principal
  }
}

/**
 * Log específico de establecimiento de bond
 */
export async function logBondEstablished(
  userId: string,
  agentId: string,
  bondId: string,
  tier: string,
  metadata: any
) {
  await logAudit({
    action: AuditAction.BOND_ESTABLISHED,
    userId,
    agentId,
    bondId,
    actorId: userId,
    actorType: "user",
    metadata: {
      tier,
      ...metadata,
    },
  });
}

/**
 * Log de actualización de bond
 */
export async function logBondUpdated(
  userId: string,
  bondId: string,
  changes: any,
  metadata?: any
) {
  await logAudit({
    action: AuditAction.BOND_UPDATED,
    userId,
    bondId,
    actorId: userId,
    actorType: "user",
    metadata: {
      changes,
      ...metadata,
    },
  });
}

/**
 * Log de liberación de bond
 */
export async function logBondReleased(
  userId: string,
  agentId: string,
  bondId: string,
  reason: string,
  metadata?: any
) {
  await logAudit({
    action: AuditAction.BOND_RELEASED,
    userId,
    agentId,
    bondId,
    actorId: userId,
    actorType: "user",
    metadata: {
      reason,
      ...metadata,
    },
  });
}

/**
 * Log de entrada a cola
 */
export async function logQueueJoined(
  userId: string,
  agentId: string,
  tier: string,
  queuePosition: number
) {
  await logAudit({
    action: AuditAction.QUEUE_JOINED,
    userId,
    agentId,
    actorId: userId,
    actorType: "user",
    metadata: {
      tier,
      queuePosition,
    },
  });
}

/**
 * Log de slot ofrecido
 */
export async function logSlotOffered(
  userId: string,
  agentId: string,
  tier: string,
  expiresAt: Date
) {
  await logAudit({
    action: AuditAction.SLOT_OFFERED,
    userId,
    agentId,
    actorId: "system",
    actorType: "system",
    metadata: {
      tier,
      expiresAt: expiresAt.toISOString(),
    },
  });
}

/**
 * Log de slot reclamado
 */
export async function logSlotClaimed(
  userId: string,
  agentId: string,
  bondId: string,
  tier: string
) {
  await logAudit({
    action: AuditAction.SLOT_CLAIMED,
    userId,
    agentId,
    bondId,
    actorId: userId,
    actorType: "user",
    metadata: {
      tier,
    },
  });
}

/**
 * Log de cálculo de rareza
 */
export async function logRarityCalculated(
  bondId: string,
  userId: string,
  oldRarity: string,
  newRarity: string,
  score: number
) {
  await logAudit({
    action: AuditAction.RARITY_CALCULATED,
    userId,
    bondId,
    actorId: "system",
    actorType: "system",
    metadata: {
      oldRarity,
      newRarity,
      score,
    },
  });
}

/**
 * Log de penalización aplicada
 */
export async function logPenaltyApplied(
  userId: string,
  severity: string,
  reason: string,
  metadata: any
) {
  await logAudit({
    action: AuditAction.PENALTY_APPLIED,
    userId,
    actorId: "anti_gaming_system",
    actorType: "system",
    metadata: {
      severity,
      reason,
      ...metadata,
    },
  });
}

/**
 * Log de fraude detectado
 */
export async function logFraudDetected(
  userId: string,
  fraudScore: number,
  signals: any[],
  action: string
) {
  await logAudit({
    action: AuditAction.FRAUD_DETECTED,
    userId,
    actorId: "fraud_detection_system",
    actorType: "system",
    metadata: {
      fraudScore,
      signals,
      action,
    },
  });
}

/**
 * Log de usuario bloqueado
 */
export async function logUserBlocked(
  userId: string,
  reason: string,
  blockedBy: string,
  metadata: any
) {
  await logAudit({
    action: AuditAction.USER_BLOCKED,
    userId,
    actorId: blockedBy,
    actorType: blockedBy === "system" ? "system" : "admin",
    metadata: {
      reason,
      ...metadata,
    },
  });
}

/**
 * Log de actualización de configuración
 */
export async function logConfigUpdated(
  agentId: string,
  adminId: string,
  changes: any
) {
  await logAudit({
    action: AuditAction.CONFIG_UPDATED,
    agentId,
    actorId: adminId,
    actorType: "admin",
    metadata: {
      changes,
    },
  });
}

/**
 * Obtener logs de un usuario específico
 */
export async function getUserAuditLog(
  userId: string,
  limit: number = 100,
  offset: number = 0
) {
  return await prisma.log.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

/**
 * Obtener logs de un bond específico
 */
export async function getBondAuditLog(bondId: string) {
  return await prisma.log.findMany({
    where: {
      metadata: {
        path: ["bondId"],
        equals: bondId,
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Búsqueda avanzada de logs
 */
export async function searchAuditLogs(filters: {
  userId?: string;
  agentId?: string;
  action?: string;
  actorType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const where: any = {};

  if (filters.userId) where.userId = filters.userId;
  if (filters.agentId) where.agentId = filters.agentId;
  if (filters.action) where.action = filters.action;

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
  }

  return await prisma.log.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: filters.limit || 100,
  });
}

/**
 * Estadísticas de audit logs
 */
export async function getAuditStats(startDate: Date, endDate: Date) {
  const logs = await prisma.log.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    select: {
      action: true,
    },
  });

  // Contar por acción
  const byAction: Record<string, number> = {};
  logs.forEach((log) => {
    byAction[log.action] = (byAction[log.action] || 0) + 1;
  });

  return {
    total: logs.length,
    byAction,
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
  };
}

/**
 * Exportar logs a JSON (para análisis forense)
 */
export async function exportAuditLogs(
  filters: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<string> {
  const logs = await searchAuditLogs({
    ...filters,
    limit: 10000, // Max export
  });

  return JSON.stringify(logs, null, 2);
}

export default {
  logAudit,
  logBondEstablished,
  logBondUpdated,
  logBondReleased,
  logQueueJoined,
  logSlotOffered,
  logSlotClaimed,
  logRarityCalculated,
  logPenaltyApplied,
  logFraudDetected,
  logUserBlocked,
  logConfigUpdated,
  getUserAuditLog,
  getBondAuditLog,
  searchAuditLogs,
  getAuditStats,
  exportAuditLogs,
};
