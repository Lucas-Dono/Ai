import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Solo crear rate limiter si las variables de entorno están configuradas
let redis: Redis | null = null;
let loginRatelimit: Ratelimit | null = null;
let registerRatelimit: Ratelimit | null = null;
let aiGenerationRatelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Rate limit para login: 5 intentos por 15 minutos por IP
  loginRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15m"),
    analytics: true,
    prefix: "ratelimit:login",
  });

  // Rate limit para registro: 3 registros por hora por IP
  registerRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: true,
    prefix: "ratelimit:register",
  });

  // Rate limit para AI generation: 20 requests por minuto por usuario
  aiGenerationRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    analytics: true,
    prefix: "ratelimit:ai-generation",
  });
}

export async function checkLoginRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  // Si no hay rate limiter configurado, permitir siempre
  if (!loginRatelimit) {
    return { success: true, remaining: 999, reset: 0 };
  }

  const result = await loginRatelimit.limit(identifier);

  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export async function checkRegisterRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  // Si no hay rate limiter configurado, permitir siempre
  if (!registerRatelimit) {
    return { success: true, remaining: 999, reset: 0 };
  }

  const result = await registerRatelimit.limit(identifier);

  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Check AI generation rate limit (20 requests per minute per user)
 * Used for Smart Start and character creation AI endpoints
 */
export async function checkAIGenerationRateLimit(userId: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  // Si no hay rate limiter configurado, permitir siempre
  if (!aiGenerationRatelimit) {
    return { success: true, remaining: 999, reset: 0 };
  }

  const result = await aiGenerationRatelimit.limit(userId);

  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

// Utilidad para obtener IP del request
export function getClientIp(request: Request): string {
  // Intentar obtener IP de headers comunes
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  if (cfConnectingIp) return cfConnectingIp;
  if (realIp) return realIp;
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}
