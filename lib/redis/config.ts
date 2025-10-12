import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Inicializar Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Rate limiters por plan
export const rateLimiters = {
  // Free plan: 10 requests por minuto
  free: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "@ratelimit/free",
  }),

  // Pro plan: 100 requests por minuto
  pro: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "@ratelimit/pro",
  }),

  // Enterprise plan: 1000 requests por minuto
  enterprise: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, "1 m"),
    analytics: true,
    prefix: "@ratelimit/enterprise",
  }),

  // API rate limit: Por API key
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(500, "1 m"),
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

// Get rate limiter by plan
export function getRateLimiter(plan: string): Ratelimit {
  switch (plan) {
    case "pro":
      return rateLimiters.pro;
    case "enterprise":
      return rateLimiters.enterprise;
    default:
      return rateLimiters.free;
  }
}
