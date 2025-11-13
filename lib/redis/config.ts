import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { getTierLimits, type UserTier } from "@/lib/usage/tier-limits";

// Inicializar Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Rate limiters por plan (usando tier-limits)
const tierLimits = {
  free: getTierLimits("free"),
  plus: getTierLimits("plus"),
  ultra: getTierLimits("ultra"),
};

export const rateLimiters = {
  // Free plan: 10 requests/min, 100/hour, 1000/day
  free: {
    perMinute: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(tierLimits.free.apiRequests.perMinute, "1 m"),
      analytics: true,
      prefix: "@ratelimit/free/minute",
    }),
    perHour: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(tierLimits.free.apiRequests.perHour, "1 h"),
      analytics: true,
      prefix: "@ratelimit/free/hour",
    }),
    perDay: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(tierLimits.free.apiRequests.perDay, "1 d"),
      analytics: true,
      prefix: "@ratelimit/free/day",
    }),
  },

  // Plus plan: 30 requests/min, 500/hour, 5000/day
  plus: {
    perMinute: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(tierLimits.plus.apiRequests.perMinute, "1 m"),
      analytics: true,
      prefix: "@ratelimit/plus/minute",
    }),
    perHour: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(tierLimits.plus.apiRequests.perHour, "1 h"),
      analytics: true,
      prefix: "@ratelimit/plus/hour",
    }),
    perDay: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(tierLimits.plus.apiRequests.perDay, "1 d"),
      analytics: true,
      prefix: "@ratelimit/plus/day",
    }),
  },

  // Ultra plan: 100 requests/min, unlimited hour/day
  ultra: {
    perMinute: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(tierLimits.ultra.apiRequests.perMinute, "1 m"),
      analytics: true,
      prefix: "@ratelimit/ultra/minute",
    }),
    // No hourly/daily limits for ultra (unlimited)
  },

  // API rate limit: Por API key (ultra tier limits)
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "@ratelimit/api",
  }),
};

// Cache TTLs
export const CACHE_TTL = {
  user: 60 * 5, // 5 minutos
  agent: 60 * 10, // 10 minutos
  subscription: 60 * 15, // 15 minutos
  usage: 60, // 1 minuto
};

// Keys para cache
export function getCacheKey(type: string, id: string): string {
  return `cache:${type}:${id}`;
}

// Verificar si Redis está configurado
export function isRedisConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

// Get rate limiter by plan and window
export function getRateLimiter(
  plan: string,
  window: "perMinute" | "perHour" | "perDay" = "perMinute"
): Ratelimit | null {
  const tier = plan.toLowerCase() as UserTier;

  switch (tier) {
    case "free":
      return rateLimiters.free[window];
    case "plus":
      return rateLimiters.plus[window];
    case "ultra":
      // Ultra only has per-minute limit
      return window === "perMinute" ? rateLimiters.ultra.perMinute : null;
    default:
      return rateLimiters.free[window];
  }
}

// Legacy function for backward compatibility
export function getRateLimiterLegacy(plan: string): Ratelimit {
  const limiter = getRateLimiter(plan, "perMinute");
  return limiter || rateLimiters.free.perMinute;
}
