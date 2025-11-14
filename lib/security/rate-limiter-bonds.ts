/**
 * RATE LIMITER ESPECÍFICO PARA SYMBOLIC BONDS
 *
 * Límites estrictos para prevenir abuso:
 * - Establecer bond: 1 intento/día por usuario
 * - Actualizar métricas: 100/hora por bond
 * - Ver leaderboards: 60/hora por usuario
 * - Reclamar slot: 3/día por usuario
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Configurar Redis para Upstash (o usar local)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? Redis.fromEnv()
  : new Redis({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      token: process.env.REDIS_TOKEN || "",
    });

// Definir rate limiters específicos
export const bondRateLimiters = {
  // Establecer nuevo bond: muy estricto
  establishBond: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, "1 d"), // 1 por día
    analytics: true,
    prefix: "@upstash/ratelimit:bonds:establish",
  }),

  // Intentar reclamar slot de cola
  claimSlot: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 d"), // 3 por día
    analytics: true,
    prefix: "@upstash/ratelimit:bonds:claim",
  }),

  // Ver bonds propios: generoso
  viewOwnBonds: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(300, "1 h"), // 300 por hora
    analytics: true,
    prefix: "@upstash/ratelimit:bonds:view",
  }),

  // Ver leaderboards
  viewLeaderboard: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "1 h"), // 60 por hora
    analytics: true,
    prefix: "@upstash/ratelimit:bonds:leaderboard",
  }),

  // Actualizar métricas de bond
  updateMetrics: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 h"), // 100 por hora
    analytics: true,
    prefix: "@upstash/ratelimit:bonds:update",
  }),

  // Liberar bond voluntariamente
  releaseBond: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 d"), // 5 por día (prevenir spam)
    analytics: true,
    prefix: "@upstash/ratelimit:bonds:release",
  }),

  // Configurar bond de agente (admin)
  configureBond: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"), // 20 por hora
    analytics: true,
    prefix: "@upstash/ratelimit:bonds:config",
  }),
};

// Rate limiter por IP (para prevenir bots sin cuenta)
export const ipRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 h"),
  analytics: true,
  prefix: "@upstash/ratelimit:bonds:ip",
});

/**
 * Helper para aplicar rate limit
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Middleware helper para Next.js API routes
 */
export async function withRateLimit(
  limiter: Ratelimit,
  identifier: string,
  onSuccess: () => Promise<Response>,
  onRateLimited?: () => Promise<Response>
): Promise<Response> {
  const result = await limiter.limit(identifier);

  if (!result.success) {
    if (onRateLimited) {
      return onRateLimited();
    }

    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
        limit: result.limit,
        remaining: result.remaining,
        reset: new Date(result.reset).toISOString(),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.reset.toString(),
        },
      }
    );
  }

  return onSuccess();
}

/**
 * Rate limit por acción específica con contador custom
 */
export async function checkCustomRateLimit(
  userId: string,
  action: string,
  limit: number,
  window: string // "1 h", "1 d", etc
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const key = `ratelimit:custom:${action}:${userId}`;
  const windowSeconds = parseTimeWindow(window);

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }

  return {
    allowed: current <= limit,
    current,
    limit,
  };
}

function parseTimeWindow(window: string): number {
  const match = window.match(/^(\d+)\s*([smhd])$/);
  if (!match) throw new Error(`Invalid window format: ${window}`);

  const [, amount, unit] = match;
  const seconds = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  }[unit];

  return parseInt(amount) * seconds;
}

export default bondRateLimiters;
