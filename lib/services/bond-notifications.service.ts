/**
 * BOND NOTIFICATIONS SERVICE
 *
 * Servicio centralizado para crear y enviar notificaciones relacionadas con bonds.
 * Integra con:
 * - Sistema de notificaciones existente (DB + WebSocket)
 * - Email (opcional)
 * - Push notifications (Web Push API)
 */

import { prisma } from "@/lib/prisma";
import { emitBondUpdated, emitSlotAvailable, emitRankChanged, emitMilestoneReached, emitBondAtRisk } from "@/lib/websocket/bonds-events";

export enum BondNotificationType {
  SLOT_AVAILABLE = "bond_slot_available",
  SLOT_EXPIRING = "bond_slot_expiring",
  BOND_ESTABLISHED = "bond_established",
  BOND_AT_RISK = "bond_at_risk",
  BOND_CRITICAL = "bond_critical",
  RANK_CHANGED = "bond_rank_changed",
  RANK_TOP_10 = "bond_rank_top_10",
  MILESTONE_REACHED = "bond_milestone_reached",
  NARRATIVE_UNLOCKED = "bond_narrative_unlocked",
  QUEUE_POSITION_IMPROVED = "bond_queue_improved",
  AFFINITY_MILESTONE = "bond_affinity_milestone",
  RARITY_UPGRADED = "bond_rarity_upgraded",
}

interface NotificationData {
  userId: string;
  type: BondNotificationType;
  title: string;
  message: string;
  metadata?: any;
  link?: string;
  priority?: "low" | "medium" | "high" | "urgent";
}

/**
 * Crear notificación de bond en base de datos
 */
export async function createBondNotification(data: NotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata || {},
        link: data.link,
        read: false,
        priority: data.priority || "medium",
      },
    });

    console.log(`[BondNotifications] Created notification for user ${data.userId}: ${data.type}`);

    // Emit real-time notification via WebSocket
    // En producción, esto usaría el sistema de sockets del servidor
    // Por ahora, emitimos el evento correspondiente

    return notification;
  } catch (error) {
    console.error("[BondNotifications] Error creating notification:", error);
    throw error;
  }
}

/**
 * Notificar slot disponible (cuando usuario está en cola)
 */
export async function notifySlotAvailable(
  userId: string,
  agentId: string,
  agentName: string,
  tier: string,
  offerId: string,
  expiresAt: Date
) {
  const hoursToExpire = Math.floor(
    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)
  );

  await createBondNotification({
    userId,
    type: BondNotificationType.SLOT_AVAILABLE,
    title: "🎉 ¡Slot Disponible!",
    message: `Un slot para ${tier.replace(/_/g, " ")} con ${agentName} está disponible. Tienes ${hoursToExpire}h para reclamarlo.`,
    metadata: {
      agentId,
      agentName,
      tier,
      offerId,
      expiresAt: expiresAt.toISOString(),
    },
    link: `/bonds/queue`,
    priority: "urgent",
  });

  // Emit WebSocket event
  emitSlotAvailable(userId, agentId, tier, {
    offerId,
    expiresAt: expiresAt.toISOString(),
  });
}

/**
 * Notificar slot expirando (6 horas antes)
 */
export async function notifySlotExpiring(
  userId: string,
  agentName: string,
  tier: string,
  hoursLeft: number
) {
  await createBondNotification({
    userId,
    type: BondNotificationType.SLOT_EXPIRING,
    title: "⏰ Slot por Expirar",
    message: `Tu slot para ${agentName} expira en ${hoursLeft} horas. ¡No lo pierdas!`,
    link: `/bonds/queue`,
    priority: "high",
  });
}

/**
 * Notificar bond establecido
 */
export async function notifyBondEstablished(
  userId: string,
  bondId: string,
  agentName: string,
  tier: string
) {
  await createBondNotification({
    userId,
    type: BondNotificationType.BOND_ESTABLISHED,
    title: "💝 Nuevo Vínculo",
    message: `Has establecido un vínculo ${tier.replace(/_/g, " ")} con ${agentName}`,
    metadata: { bondId },
    link: `/bonds/${bondId}`,
    priority: "medium",
  });
}

/**
 * Notificar bond en riesgo
 */
export async function notifyBondAtRisk(
  userId: string,
  bondId: string,
  agentName: string,
  daysInactive: number,
  status: string
) {
  const isUrgent = status === "at_risk";

  await createBondNotification({
    userId,
    type: isUrgent ? BondNotificationType.BOND_CRITICAL : BondNotificationType.BOND_AT_RISK,
    title: isUrgent ? "🚨 Vínculo en Riesgo Crítico" : "⚠️ Vínculo Necesita Atención",
    message: `Tu vínculo con ${agentName} lleva ${daysInactive} días sin interacción. ${
      isUrgent ? "¡Interactúa urgentemente para salvarlo!" : "Chatea pronto para mantenerlo saludable."
    }`,
    metadata: { bondId, daysInactive, status },
    link: `/agentes/${bondId}`, // Link directo al chat
    priority: isUrgent ? "urgent" : "high",
  });

  // Emit WebSocket event
  emitBondAtRisk(userId, bondId, { daysInactive, status });
}

/**
 * Notificar cambio de ranking
 */
export async function notifyRankChanged(
  userId: string,
  bondId: string,
  agentName: string,
  newRank: number,
  oldRank: number,
  tier: string
) {
  const improved = newRank < oldRank;
  const change = Math.abs(newRank - oldRank);

  await createBondNotification({
    userId,
    type: newRank <= 10 ? BondNotificationType.RANK_TOP_10 : BondNotificationType.RANK_CHANGED,
    title: improved ? "📈 ¡Ranking Mejorado!" : "📉 Cambio en Ranking",
    message: `Tu vínculo con ${agentName} ${improved ? "subió" : "bajó"} ${change} posiciones. Ahora estás en #${newRank}`,
    metadata: { bondId, newRank, oldRank, tier },
    link: `/bonds/${bondId}`,
    priority: newRank <= 10 ? "high" : "medium",
  });

  // Emit WebSocket event
  emitRankChanged(userId, bondId, { newRank, oldRank, tier });
}

/**
 * Notificar milestone alcanzado
 */
export async function notifyMilestoneReached(
  userId: string,
  bondId: string,
  agentName: string,
  milestoneName: string,
  milestoneDescription: string,
  reward?: string
) {
  await createBondNotification({
    userId,
    type: BondNotificationType.MILESTONE_REACHED,
    title: "🏆 Logro Desbloqueado",
    message: `${milestoneName}: ${milestoneDescription}${reward ? ` Recompensa: ${reward}` : ""}`,
    metadata: { bondId, milestoneName, reward },
    link: `/bonds/${bondId}`,
    priority: "medium",
  });

  // Emit WebSocket event
  emitMilestoneReached(userId, bondId, { milestoneName, reward });
}

/**
 * Notificar narrativa desbloqueada
 */
export async function notifyNarrativeUnlocked(
  userId: string,
  bondId: string,
  agentName: string,
  narrativeName: string,
  narrativeDescription: string
) {
  await createBondNotification({
    userId,
    type: BondNotificationType.NARRATIVE_UNLOCKED,
    title: "📖 Nueva Historia",
    message: `Desbloqueaste "${narrativeName}" con ${agentName}: ${narrativeDescription}`,
    metadata: { bondId, narrativeName },
    link: `/bonds/${bondId}`,
    priority: "medium",
  });
}

/**
 * Notificar mejora en posición de cola
 */
export async function notifyQueuePositionImproved(
  userId: string,
  agentName: string,
  tier: string,
  newPosition: number,
  totalInQueue: number
) {
  await createBondNotification({
    userId,
    type: BondNotificationType.QUEUE_POSITION_IMPROVED,
    title: "🔼 Posición en Cola",
    message: `Avanzaste a la posición #${newPosition} de ${totalInQueue} para ${tier.replace(/_/g, " ")} con ${agentName}`,
    link: `/bonds/queue`,
    priority: newPosition === 1 ? "high" : "low",
  });
}

/**
 * Notificar milestone de afinidad (50, 75, 90, 100)
 */
export async function notifyAffinityMilestone(
  userId: string,
  bondId: string,
  agentName: string,
  affinityLevel: number
) {
  const milestones: Record<number, string> = {
    25: "¡Primera Conexión! 🌱",
    50: "¡Conexión Fuerte! 💪",
    75: "¡Vínculo Profundo! 💝",
    90: "¡Casi Perfecto! ✨",
    100: "¡Conexión Máxima! 🌟",
  };

  const title = milestones[affinityLevel];
  if (!title) return; // Solo notificar en milestones específicos

  await createBondNotification({
    userId,
    type: BondNotificationType.AFFINITY_MILESTONE,
    title,
    message: `Alcanzaste ${affinityLevel}% de afinidad con ${agentName}`,
    metadata: { bondId, affinityLevel },
    link: `/bonds/${bondId}`,
    priority: affinityLevel === 100 ? "high" : "medium",
  });
}

/**
 * Notificar upgrade de rareza
 */
export async function notifyRarityUpgraded(
  userId: string,
  bondId: string,
  agentName: string,
  oldRarity: string,
  newRarity: string
) {
  await createBondNotification({
    userId,
    type: BondNotificationType.RARITY_UPGRADED,
    title: "✨ Rareza Mejorada",
    message: `Tu vínculo con ${agentName} subió de ${oldRarity} a ${newRarity}`,
    metadata: { bondId, oldRarity, newRarity },
    link: `/bonds/${bondId}`,
    priority: newRarity === "Mythic" || newRarity === "Legendary" ? "high" : "medium",
  });
}

/**
 * Obtener notificaciones de bonds del usuario
 */
export async function getUserBondNotifications(
  userId: string,
  limit: number = 20,
  unreadOnly: boolean = false
) {
  const where: any = {
    userId,
    type: {
      startsWith: "bond_",
    },
  };

  if (unreadOnly) {
    where.read = false;
  }

  return await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Marcar notificación como leída
 */
export async function markBondNotificationAsRead(notificationId: string) {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

/**
 * Marcar todas las notificaciones de bonds como leídas
 */
export async function markAllBondNotificationsAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: {
      userId,
      type: { startsWith: "bond_" },
      read: false,
    },
    data: { read: true },
  });
}

/**
 * Obtener count de notificaciones no leídas
 */
export async function getUnreadBondNotificationsCount(userId: string): Promise<number> {
  return await prisma.notification.count({
    where: {
      userId,
      type: { startsWith: "bond_" },
      read: false,
    },
  });
}

export default {
  notifySlotAvailable,
  notifySlotExpiring,
  notifyBondEstablished,
  notifyBondAtRisk,
  notifyRankChanged,
  notifyMilestoneReached,
  notifyNarrativeUnlocked,
  notifyQueuePositionImproved,
  notifyAffinityMilestone,
  notifyRarityUpgraded,
  getUserBondNotifications,
  markBondNotificationAsRead,
  markAllBondNotificationsAsRead,
  getUnreadBondNotificationsCount,
};
