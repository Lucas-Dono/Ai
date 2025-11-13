/**
 * BOND ANALYTICS SERVICE
 *
 * Servicio para tracking y análisis de métricas de Symbolic Bonds
 * - KPIs globales del sistema
 * - Analytics por tier
 * - User behavior analytics
 * - Conversion funnels
 * - Engagement metrics
 */

import { prisma } from "@/lib/prisma";

export interface GlobalBondStats {
  totalBonds: number;
  activeBonds: number;
  totalUsers: number;
  usersWithBonds: number;
  avgBondsPerUser: number;
  avgAffinityLevel: number;
  avgDurationDays: number;
  totalInteractions: number;
  conversionRate: number; // % de usuarios con al menos 1 bond
}

export interface TierStats {
  tier: string;
  totalBonds: number;
  activeBonds: number;
  avgAffinity: number;
  avgDuration: number;
  fillRate: number; // % de slots ocupados
  avgWaitTime: number; // días en cola promedio
  churnRate: number; // % de bonds liberados vs creados
}

export interface RarityDistribution {
  Common: number;
  Uncommon: number;
  Rare: number;
  Epic: number;
  Legendary: number;
  Mythic: number;
}

export interface TimeSeriesData {
  date: string;
  bondsCreated: number;
  bondsReleased: number;
  activeUsers: number;
  totalInteractions: number;
}

export interface UserBehaviorMetrics {
  userId: string;
  totalBonds: number;
  activeBonds: number;
  avgAffinityLevel: number;
  totalInteractions: number;
  avgSessionDuration: number;
  lastActiveDate: string;
  engagementScore: number; // 0-100
  churnRisk: "low" | "medium" | "high";
}

/**
 * Obtener estadísticas globales del sistema de bonds
 */
export async function getGlobalBondStats(): Promise<GlobalBondStats> {
  const [
    totalBonds,
    activeBonds,
    totalUsers,
    usersWithBonds,
    affinityStats,
    interactionStats,
  ] = await Promise.all([
    prisma.symbolicBond.count(),
    prisma.symbolicBond.count({ where: { status: "active" } }),
    prisma.user.count(),
    prisma.symbolicBond.groupBy({
      by: ["userId"],
      where: { status: "active" },
    }),
    prisma.symbolicBond.aggregate({
      _avg: { affinityLevel: true, durationDays: true },
    }),
    prisma.symbolicBond.aggregate({
      _sum: { totalInteractions: true },
    }),
  ]);

  const uniqueUsers = usersWithBonds.length;
  const avgBondsPerUser = uniqueUsers > 0 ? activeBonds / uniqueUsers : 0;
  const conversionRate = totalUsers > 0 ? (uniqueUsers / totalUsers) * 100 : 0;

  return {
    totalBonds,
    activeBonds,
    totalUsers,
    usersWithBonds: uniqueUsers,
    avgBondsPerUser,
    avgAffinityLevel: affinityStats._avg.affinityLevel || 0,
    avgDurationDays: affinityStats._avg.durationDays || 0,
    totalInteractions: interactionStats._sum.totalInteractions || 0,
    conversionRate,
  };
}

/**
 * Obtener estadísticas por tier
 */
export async function getTierStats(): Promise<TierStats[]> {
  const tiers = [
    "ROMANTIC",
    "BEST_FRIEND",
    "MENTOR",
    "CONFIDANT",
    "CREATIVE_PARTNER",
    "ADVENTURE_COMPANION",
    "ACQUAINTANCE",
  ];

  const tierStatsPromises = tiers.map(async (tier) => {
    const [totalBonds, activeBonds, stats, queueStats] = await Promise.all([
      prisma.symbolicBond.count({ where: { tier } }),
      prisma.symbolicBond.count({ where: { tier, status: "active" } }),
      prisma.symbolicBond.aggregate({
        where: { tier, status: "active" },
        _avg: { affinityLevel: true, durationDays: true },
      }),
      prisma.bondQueuePosition.aggregate({
        where: { tier },
        _avg: { estimatedWaitDays: true },
      }),
    ]);

    // Calculate fill rate (necesitaríamos la config del agente)
    // Por ahora usamos una estimación
    const fillRate = totalBonds > 0 ? (activeBonds / totalBonds) * 100 : 0;

    // Calculate churn rate (bonds released vs created in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [created, released] = await Promise.all([
      prisma.symbolicBond.count({
        where: { tier, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.bondLegacy.count({
        where: { tier, endDate: { gte: thirtyDaysAgo } },
      }),
    ]);

    const churnRate = created > 0 ? (released / created) * 100 : 0;

    return {
      tier,
      totalBonds,
      activeBonds,
      avgAffinity: stats._avg.affinityLevel || 0,
      avgDuration: stats._avg.durationDays || 0,
      fillRate,
      avgWaitTime: queueStats._avg.estimatedWaitDays || 0,
      churnRate,
    };
  });

  return Promise.all(tierStatsPromises);
}

/**
 * Obtener distribución de rareza
 */
export async function getRarityDistribution(): Promise<RarityDistribution> {
  const bonds = await prisma.symbolicBond.findMany({
    where: { status: "active" },
    select: { rarityTier: true },
  });

  const distribution: RarityDistribution = {
    Common: 0,
    Uncommon: 0,
    Rare: 0,
    Epic: 0,
    Legendary: 0,
    Mythic: 0,
  };

  bonds.forEach((bond) => {
    if (bond.rarityTier in distribution) {
      distribution[bond.rarityTier as keyof RarityDistribution]++;
    }
  });

  return distribution;
}

/**
 * Obtener datos de time series (últimos 30 días)
 */
export async function getTimeSeriesData(
  days: number = 30
): Promise<TimeSeriesData[]> {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  const data: TimeSeriesData[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

    const [bondsCreated, bondsReleased, interactions] = await Promise.all([
      prisma.symbolicBond.count({
        where: {
          createdAt: { gte: date, lt: nextDate },
        },
      }),
      prisma.bondLegacy.count({
        where: {
          endDate: { gte: date, lt: nextDate },
        },
      }),
      prisma.symbolicBond.aggregate({
        where: {
          lastInteraction: { gte: date, lt: nextDate },
        },
        _sum: { totalInteractions: true },
      }),
    ]);

    // Active users (usuarios que interactuaron ese día)
    const activeUsers = await prisma.symbolicBond.groupBy({
      by: ["userId"],
      where: {
        lastInteraction: { gte: date, lt: nextDate },
      },
    });

    data.push({
      date: date.toISOString().split("T")[0],
      bondsCreated,
      bondsReleased,
      activeUsers: activeUsers.length,
      totalInteractions: interactions._sum.totalInteractions || 0,
    });
  }

  return data;
}

/**
 * Obtener métricas de comportamiento de usuario
 */
export async function getUserBehaviorMetrics(
  userId: string
): Promise<UserBehaviorMetrics> {
  const [bonds, activeBonds, stats] = await Promise.all([
    prisma.symbolicBond.count({ where: { userId } }),
    prisma.symbolicBond.count({ where: { userId, status: "active" } }),
    prisma.symbolicBond.aggregate({
      where: { userId, status: "active" },
      _avg: { affinityLevel: true },
      _sum: { totalInteractions: true },
      _max: { lastInteraction: true },
    }),
  ]);

  // Calculate engagement score (0-100)
  const avgAffinity = stats._avg.affinityLevel || 0;
  const totalInteractions = stats._sum.totalInteractions || 0;
  const hasRecentActivity =
    stats._max.lastInteraction &&
    Date.now() - new Date(stats._max.lastInteraction).getTime() <
      7 * 24 * 60 * 60 * 1000; // < 7 days

  let engagementScore = 0;
  engagementScore += avgAffinity * 0.4; // 40% weight on affinity
  engagementScore += Math.min((totalInteractions / 100) * 30, 30); // 30% weight on interactions
  engagementScore += activeBonds * 10; // 10 points per active bond
  engagementScore += hasRecentActivity ? 20 : 0; // 20% weight on recent activity

  engagementScore = Math.min(Math.round(engagementScore), 100);

  // Determine churn risk
  let churnRisk: "low" | "medium" | "high" = "low";
  if (!hasRecentActivity) {
    churnRisk = "high";
  } else if (avgAffinity < 50) {
    churnRisk = "medium";
  }

  return {
    userId,
    totalBonds: bonds,
    activeBonds,
    avgAffinityLevel: avgAffinity,
    totalInteractions,
    avgSessionDuration: 0, // Requiere tracking adicional
    lastActiveDate: stats._max.lastInteraction?.toISOString() || "",
    engagementScore,
    churnRisk,
  };
}

/**
 * Obtener top usuarios por engagement
 */
export async function getTopUsersByEngagement(limit: number = 10) {
  const users = await prisma.symbolicBond.groupBy({
    by: ["userId"],
    where: { status: "active" },
    _avg: { affinityLevel: true },
    _sum: { totalInteractions: true },
    _count: { id: true },
    orderBy: { _sum: { totalInteractions: "desc" } },
    take: limit,
  });

  return users.map((user) => ({
    userId: user.userId,
    activeBonds: user._count.id,
    avgAffinity: user._avg.affinityLevel || 0,
    totalInteractions: user._sum.totalInteractions || 0,
  }));
}

/**
 * Obtener conversion funnel
 */
export async function getConversionFunnel() {
  const [totalUsers, usersInQueue, usersWithOffers, usersWithBonds] =
    await Promise.all([
      prisma.user.count(),
      prisma.bondQueuePosition.groupBy({ by: ["userId"] }),
      prisma.bondSlotOffer.groupBy({ by: ["userId"] }),
      prisma.symbolicBond.groupBy({
        by: ["userId"],
        where: { status: "active" },
      }),
    ]);

  return {
    totalUsers,
    usersInQueue: usersInQueue.length,
    conversionQueue: (usersInQueue.length / totalUsers) * 100,
    usersWithOffers: usersWithOffers.length,
    conversionOffers: (usersWithOffers.length / usersInQueue.length) * 100,
    usersWithBonds: usersWithBonds.length,
    conversionBonds: (usersWithBonds.length / totalUsers) * 100,
  };
}

/**
 * Track evento de analytics
 */
export async function trackBondAnalyticsEvent(
  eventType: string,
  userId: string,
  metadata: any
) {
  try {
    await prisma.log.create({
      data: {
        userId,
        action: `analytics_${eventType}`,
        metadata: {
          eventType,
          timestamp: new Date().toISOString(),
          ...metadata,
        },
      },
    });
  } catch (error) {
    console.error("[Analytics] Error tracking event:", error);
  }
}

export default {
  getGlobalBondStats,
  getTierStats,
  getRarityDistribution,
  getTimeSeriesData,
  getUserBehaviorMetrics,
  getTopUsersByEngagement,
  getConversionFunnel,
  trackBondAnalyticsEvent,
};
