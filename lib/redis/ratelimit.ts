import { NextRequest, NextResponse } from "next/server";
import { getRateLimiter, isRedisConfigured } from "./config";
import { auth } from "@/lib/auth";

// In-memory fallback para cuando Redis no está configurado
const inMemoryLimits = new Map<string, { count: number; resetAt: number }>();

function inMemoryRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = inMemoryLimits.get(identifier);

  if (!record || record.resetAt < now) {
    // Nueva ventana
    inMemoryLimits.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (record.count >= limit) {
    return false; // Límite alcanzado
  }

  record.count++;
  return true;
}

// Verificar rate limit
export async function checkRateLimit(
  identifier: string,
  plan: string = "free"
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  // Si Redis no está configurado, usar in-memory fallback
  if (!isRedisConfigured()) {
    const limits = {
      free: { max: 10, window: 60000 }, // 10 req/min
      pro: { max: 100, window: 60000 }, // 100 req/min
      enterprise: { max: 1000, window: 60000 }, // 1000 req/min
    };

    const planLimit = limits[plan as keyof typeof limits] || limits.free;
    const success = inMemoryRateLimit(identifier, planLimit.max, planLimit.window);

    return {
      success,
      limit: planLimit.max,
      remaining: success ? planLimit.max - 1 : 0,
    };
  }

  // Usar Redis
  try {
    const limiter = getRateLimiter(plan);
    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // En caso de error, permitir la request (fail open)
    return { success: true };
  }
}

// Middleware helper para proteger rutas
export async function withRateLimit(
  req: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Obtener plan del usuario
    const plan = user.plan || "free";

    // Check rate limit
    const { success, limit, remaining, reset } = await checkRateLimit(
      user.id,
      plan
    );

    if (!success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          limit,
          remaining: 0,
          reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit?.toString() || "0",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": reset?.toString() || "0",
          },
        }
      );
    }

    // Ejecutar handler
    const response = await handler();

    // Agregar headers de rate limit
    if (limit) {
      response.headers.set("X-RateLimit-Limit", limit.toString());
      response.headers.set("X-RateLimit-Remaining", remaining?.toString() || "0");
      if (reset) {
        response.headers.set("X-RateLimit-Reset", reset.toString());
      }
    }

    return response;
  } catch (error) {
    console.error("Rate limit middleware error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Verificar rate limit por API key
export async function checkApiKeyRateLimit(
  apiKey: string
): Promise<{ success: boolean; limit?: number; remaining?: number }> {
  return await checkRateLimit(`api:${apiKey}`, "api");
}

// Limpiar in-memory cache periódicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of inMemoryLimits.entries()) {
    if (record.resetAt < now) {
      inMemoryLimits.delete(key);
    }
  }
}, 60000); // Cada minuto
