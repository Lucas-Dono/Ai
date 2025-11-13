/**
 * Moderation Service
 *
 * Servicio principal de moderación de contenido
 * Integra filtros de contenido, rate limiting y tracking de violaciones
 */

import { prisma } from '@/lib/prisma';
import { moderateContent, quickModerate, type ContentModerationResult } from './content-filter';
import {
  checkMessageRate,
  checkPostCreation,
  checkCommentCreation,
  checkUserBan,
  banUser,
} from './rate-limiter';
import { apiLogger as log } from '@/lib/logging';

// ============================================
// TYPES
// ============================================

export interface ModerationResult {
  allowed: boolean;
  blocked: boolean;
  severity: 'low' | 'medium' | 'high';
  reason?: string;
  suggestion?: string;
  action?: 'warning' | 'blocked' | 'temp_ban' | 'permanent_ban';
  violationId?: string;
  details?: {
    contentFilter?: ContentModerationResult;
    rateLimit?: any;
    userHistory?: any;
  };
}

export interface FlagContentParams {
  contentType: 'message' | 'post' | 'comment' | 'agent' | 'world';
  contentId: string;
  userId: string;
  reason: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high';
}

// ============================================
// MODERATION LOGIC
// ============================================

/**
 * Moderate a message before sending
 */
export async function moderateMessage(
  userId: string,
  content: string,
  options: {
    agentId?: string;
    worldId?: string;
    quickCheck?: boolean;
  } = {}
): Promise<ModerationResult> {
  const { quickCheck = false } = options;

  try {
    // 1. CHECK USER BAN
    const banStatus = await checkUserBan(userId, 'message');
    if (banStatus.banned) {
      log.warn({ userId, reason: banStatus.reason }, 'Banned user attempted to send message');

      return {
        allowed: false,
        blocked: true,
        severity: 'high',
        reason: banStatus.reason || 'Tu cuenta está temporalmente suspendida',
        suggestion: banStatus.expiresAt
          ? `Podrás volver a enviar mensajes en ${Math.ceil((banStatus.expiresAt - Date.now()) / 1000 / 60)} minutos`
          : 'Contacta soporte para más información',
        action: 'temp_ban',
      };
    }

    // 2. CHECK RATE LIMIT
    const rateLimit = await checkMessageRate(userId);
    if (!rateLimit.allowed) {
      log.warn({ userId, rateLimit }, 'User exceeded message rate limit');

      return {
        allowed: false,
        blocked: true,
        severity: 'medium',
        reason: 'Estás enviando mensajes demasiado rápido',
        suggestion: `Espera ${rateLimit.retryAfter} segundos antes de enviar otro mensaje`,
        action: 'blocked',
        details: { rateLimit },
      };
    }

    // 3. CONTENT FILTERING
    let contentResult: ContentModerationResult | { allowed: boolean; reason?: string };

    if (quickCheck) {
      // Quick check - only critical filters
      contentResult = quickModerate(content);
    } else {
      // Full check - all filters
      contentResult = moderateContent(content, {
        checkSpam: true,
        checkInjection: true,
        checkDangerous: true,
        checkProfanity: false, // Disabled by default
      });
    }

    if (!contentResult.allowed) {
      // Get user violation history
      const violationCount = await getUserViolationCount(userId, 24); // Last 24 hours

      // Determine action based on severity and history
      let action: ModerationResult['action'] = 'warning';
      let severity: 'low' | 'medium' | 'high' = 'low';

      if ('severity' in contentResult) {
        severity = contentResult.severity;
      }

      // Auto-escalation based on violations
      if (violationCount >= 10) {
        action = 'permanent_ban';
        severity = 'high';
      } else if (violationCount >= 5) {
        action = 'temp_ban';
        severity = 'high';
        // Ban por 24 horas
        await banUser(userId, 86400, 'Múltiples violaciones de moderación', 'message');
      } else if (violationCount >= 3 || severity === 'high') {
        action = 'blocked';
        severity = 'high';
      } else if (severity === 'medium') {
        action = 'blocked';
      } else {
        action = 'warning';
      }

      // Log violation
      const violation = await logViolation({
        userId,
        contentType: 'message',
        contentId: null,
        reason: ('reason' in contentResult && contentResult.reason) ? contentResult.reason : 'Content filter violation',
        content,
        severity,
        action,
      });

      log.warn({
        userId,
        violationId: violation.id,
        severity,
        action,
        violationCount,
      }, 'Message moderation violation');

      return {
        allowed: false,
        blocked: true,
        severity,
        reason: 'reason' in contentResult ? contentResult.reason : 'Contenido no permitido',
        suggestion: 'suggestion' in contentResult ? contentResult.suggestion : undefined,
        action,
        violationId: violation.id,
        details: {
          contentFilter: 'violations' in contentResult ? contentResult : undefined,
          userHistory: { violationCount },
        },
      };
    }

    // All checks passed
    return {
      allowed: true,
      blocked: false,
      severity: 'low',
    };

  } catch (error) {
    log.error({ error, userId }, 'Error in message moderation');

    // En caso de error, permitir pero loggear
    return {
      allowed: true,
      blocked: false,
      severity: 'low',
      reason: 'Moderation check failed, allowing by default',
    };
  }
}

/**
 * Moderate a community post
 */
export async function moderatePost(
  userId: string,
  content: string,
  title?: string
): Promise<ModerationResult> {
  try {
    // 1. CHECK USER BAN
    const banStatus = await checkUserBan(userId, 'post');
    if (banStatus.banned) {
      return {
        allowed: false,
        blocked: true,
        severity: 'high',
        reason: banStatus.reason || 'No puedes crear posts en este momento',
        action: 'temp_ban',
      };
    }

    // 2. CHECK RATE LIMIT
    const rateLimit = await checkPostCreation(userId);
    if (!rateLimit.allowed) {
      return {
        allowed: false,
        blocked: true,
        severity: 'medium',
        reason: 'Has alcanzado el límite de posts',
        suggestion: `Espera ${Math.ceil((rateLimit.retryAfter || 3600) / 60)} minutos antes de crear otro post`,
        action: 'blocked',
      };
    }

    // 3. CONTENT FILTERING
    const fullContent = title ? `${title}\n\n${content}` : content;
    const contentResult = moderateContent(fullContent, {
      checkSpam: true,
      checkInjection: true,
      checkDangerous: true,
      checkProfanity: false,
    });

    if (!contentResult.allowed) {
      const violationCount = await getUserViolationCount(userId, 24);
      let action: ModerationResult['action'] = 'warning';
      let severity = contentResult.severity;

      if (violationCount >= 5 || severity === 'high') {
        action = 'temp_ban';
        await banUser(userId, 86400, 'Múltiples violaciones en posts', 'post');
      } else if (severity === 'medium') {
        action = 'blocked';
      }

      const violation = await logViolation({
        userId,
        contentType: 'post',
        contentId: null,
        reason: contentResult.overallReason || 'Content filter violation',
        content: fullContent,
        severity,
        action,
      });

      return {
        allowed: false,
        blocked: true,
        severity,
        reason: contentResult.overallReason,
        suggestion: contentResult.suggestion,
        action,
        violationId: violation.id,
      };
    }

    return {
      allowed: true,
      blocked: false,
      severity: 'low',
    };

  } catch (error) {
    log.error({ error, userId }, 'Error in post moderation');
    return {
      allowed: true,
      blocked: false,
      severity: 'low',
    };
  }
}

/**
 * Moderate a comment
 */
export async function moderateComment(
  userId: string,
  content: string
): Promise<ModerationResult> {
  try {
    // 1. CHECK USER BAN
    const banStatus = await checkUserBan(userId, 'comment');
    if (banStatus.banned) {
      return {
        allowed: false,
        blocked: true,
        severity: 'high',
        reason: banStatus.reason || 'No puedes comentar en este momento',
        action: 'temp_ban',
      };
    }

    // 2. CHECK RATE LIMIT
    const rateLimit = await checkCommentCreation(userId);
    if (!rateLimit.allowed) {
      return {
        allowed: false,
        blocked: true,
        severity: 'medium',
        reason: 'Estás comentando demasiado rápido',
        suggestion: `Espera ${rateLimit.retryAfter} segundos`,
        action: 'blocked',
      };
    }

    // 3. CONTENT FILTERING (quick check for comments)
    const contentResult = quickModerate(content);

    if (!contentResult.allowed) {
      const violation = await logViolation({
        userId,
        contentType: 'comment',
        contentId: null,
        reason: contentResult.reason || 'Content filter violation',
        content,
        severity: 'high',
        action: 'blocked',
      });

      return {
        allowed: false,
        blocked: true,
        severity: 'high',
        reason: contentResult.reason,
        action: 'blocked',
        violationId: violation.id,
      };
    }

    return {
      allowed: true,
      blocked: false,
      severity: 'low',
    };

  } catch (error) {
    log.error({ error, userId }, 'Error in comment moderation');
    return {
      allowed: true,
      blocked: false,
      severity: 'low',
    };
  }
}

/**
 * Flag content manually (user report)
 */
export async function flagContent(params: FlagContentParams): Promise<{
  success: boolean;
  flagId?: string;
  message: string;
}> {
  try {
    const { userId, contentType, contentId, reason, description, severity = 'medium' } = params;

    // Create flag record
    const flag = await prisma.contentViolation.create({
      data: {
        userId,
        contentType,
        contentId,
        reason: `User report: ${reason}`,
        content: description || null,
        severity,
        action: 'flagged',
      },
    });

    log.info({ flagId: flag.id, userId, contentType, contentId }, 'Content flagged by user');

    return {
      success: true,
      flagId: flag.id,
      message: 'Gracias por tu reporte. Lo revisaremos pronto.',
    };

  } catch (error) {
    log.error({ error, params }, 'Error flagging content');
    return {
      success: false,
      message: 'Error al reportar contenido. Intenta nuevamente.',
    };
  }
}

/**
 * Get user violation history
 */
export async function getUserViolations(
  userId: string,
  options: {
    limit?: number;
    hoursBack?: number;
    severity?: 'low' | 'medium' | 'high';
  } = {}
): Promise<any[]> {
  const { limit = 50, hoursBack = 168, severity } = options; // Default: last 7 days

  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const violations = await prisma.contentViolation.findMany({
    where: {
      userId,
      createdAt: { gte: since },
      ...(severity && { severity }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return violations;
}

/**
 * Get violation count for a user
 */
async function getUserViolationCount(userId: string, hoursBack: number = 24): Promise<number> {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const count = await prisma.contentViolation.count({
    where: {
      userId,
      createdAt: { gte: since },
      severity: { in: ['medium', 'high'] }, // Only count significant violations
    },
  });

  return count;
}

/**
 * Log a violation to database
 */
async function logViolation(params: {
  userId: string;
  contentType: string;
  contentId: string | null;
  reason: string;
  content: string;
  severity: 'low' | 'medium' | 'high';
  action: string;
}) {
  const violation = await prisma.contentViolation.create({
    data: {
      userId: params.userId,
      contentType: params.contentType,
      contentId: params.contentId,
      reason: params.reason,
      content: params.content,
      severity: params.severity,
      action: params.action,
    },
  });

  return violation;
}

/**
 * Get recent violations (admin)
 */
export async function getRecentViolations(options: {
  limit?: number;
  severity?: 'low' | 'medium' | 'high';
  action?: string;
  contentType?: string;
} = {}) {
  const { limit = 100, severity, action, contentType } = options;

  const violations = await prisma.contentViolation.findMany({
    where: {
      ...(severity && { severity }),
      ...(action && { action }),
      ...(contentType && { contentType }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          plan: true,
        },
      },
    },
  });

  return violations;
}

/**
 * Get moderation statistics
 */
export async function getModerationStats(hoursBack: number = 24) {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const [total, bySeverity, byAction, byType] = await Promise.all([
    // Total violations
    prisma.contentViolation.count({
      where: { createdAt: { gte: since } },
    }),

    // By severity
    prisma.contentViolation.groupBy({
      by: ['severity'],
      where: { createdAt: { gte: since } },
      _count: true,
    }),

    // By action
    prisma.contentViolation.groupBy({
      by: ['action'],
      where: { createdAt: { gte: since } },
      _count: true,
    }),

    // By content type
    prisma.contentViolation.groupBy({
      by: ['contentType'],
      where: { createdAt: { gte: since } },
      _count: true,
    }),
  ]);

  return {
    total,
    bySeverity,
    byAction,
    byType,
    period: `Last ${hoursBack} hours`,
  };
}

/**
 * Check if user is banned
 */
export async function isUserBanned(userId: string): Promise<{
  banned: boolean;
  reason?: string;
  expiresAt?: Date;
}> {
  const ban = await prisma.userBan.findUnique({
    where: { userId },
  });

  if (!ban) {
    return { banned: false };
  }

  // Check if ban expired
  if (ban.expiresAt && ban.expiresAt < new Date()) {
    // Remove expired ban
    await prisma.userBan.delete({ where: { userId } });
    return { banned: false };
  }

  return {
    banned: true,
    reason: ban.reason,
    expiresAt: ban.expiresAt || undefined,
  };
}

/**
 * Ban user permanently or temporarily
 */
export async function banUserPermanent(
  userId: string,
  reason: string,
  expiresAt?: Date
): Promise<void> {
  await prisma.userBan.upsert({
    where: { userId },
    create: {
      userId,
      reason,
      expiresAt,
    },
    update: {
      reason,
      expiresAt,
    },
  });

  log.warn({ userId, reason, expiresAt }, 'User banned');
}

/**
 * Unban user
 */
export async function unbanUserPermanent(userId: string): Promise<void> {
  await prisma.userBan.deleteMany({
    where: { userId },
  });

  log.info({ userId }, 'User unbanned');
}

/**
 * Get top violators (admin)
 */
export async function getTopViolators(limit: number = 20, hoursBack: number = 168) {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const violators = await prisma.contentViolation.groupBy({
    by: ['userId'],
    where: {
      createdAt: { gte: since },
      severity: { in: ['medium', 'high'] },
    },
    _count: true,
    orderBy: {
      _count: {
        userId: 'desc',
      },
    },
    take: limit,
  });

  // Enrich with user data
  const enriched = await Promise.all(
    violators.map(async (v) => {
      const user = await prisma.user.findUnique({
        where: { id: v.userId },
        select: { id: true, name: true, email: true, plan: true },
      });

      return {
        user,
        violationCount: v._count,
      };
    })
  );

  return enriched;
}
