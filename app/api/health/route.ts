/**
 * HEALTH CHECK ENDPOINT
 *
 * Endpoint crítico para deployment y monitoring.
 * Load balancers y orquestradores lo usan para verificar si la instancia está viva.
 *
 * Verifica:
 * - Database connectivity (Prisma)
 * - Redis availability (Upstash)
 * - AI Services (Gemini - solo ping básico)
 * - Storage (R2 - solo config check)
 *
 * Returns:
 * - 200 OK si todo está funcionando
 * - 503 Service Unavailable si algún servicio crítico falla
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface HealthCheck {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  checks: {
    database: CheckResult;
    redis: CheckResult;
    ai: CheckResult;
    storage: CheckResult;
  };
  uptime?: number;
}

interface CheckResult {
  status: "ok" | "warning" | "error";
  message?: string;
  latency?: number; // ms
}

/**
 * GET /api/health
 * Public endpoint - no requiere autenticación
 */
export async function GET() {
  const startTime = Date.now();

  const checks: HealthCheck["checks"] = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    ai: await checkAIServices(),
    storage: await checkStorage(),
  };

  // Determinar estado general
  const hasError = Object.values(checks).some((check) => check.status === "error");
  const hasWarning = Object.values(checks).some((check) => check.status === "warning");

  let overallStatus: HealthCheck["status"];
  if (hasError) {
    overallStatus = "unhealthy";
  } else if (hasWarning) {
    overallStatus = "degraded";
  } else {
    overallStatus = "healthy";
  }

  const healthCheck: HealthCheck = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
    uptime: process.uptime(),
  };

  // Logging para monitoring
  if (overallStatus !== "healthy") {
    console.error("[HEALTH CHECK] System is " + overallStatus, {
      checks,
    });
  }

  // Retornar 503 si unhealthy (load balancers lo detectan)
  const statusCode = overallStatus === "unhealthy" ? 503 : 200;

  return NextResponse.json(healthCheck, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}

/**
 * Check Database (Prisma + PostgreSQL)
 */
async function checkDatabase(): Promise<CheckResult> {
  const start = Date.now();

  try {
    // Simple query para verificar conectividad
    await prisma.$queryRaw`SELECT 1`;

    const latency = Date.now() - start;

    // Warning si latency > 1 segundo
    if (latency > 1000) {
      return {
        status: "warning",
        message: `Database slow (${latency}ms)`,
        latency,
      };
    }

    return {
      status: "ok",
      latency,
    };
  } catch (error) {
    console.error("[HEALTH] Database check failed:", error);
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Database connection failed",
      latency: Date.now() - start,
    };
  }
}

/**
 * Check Redis (Upstash / Local)
 */
async function checkRedis(): Promise<CheckResult> {
  const start = Date.now();

  try {
    // Redis puede no estar configurado (in-memory fallback)
    if (!redis) {
      return {
        status: "warning",
        message: "Redis not configured (using in-memory fallback)",
      };
    }

    // Ping Redis
    const pong = await redis.ping();

    const latency = Date.now() - start;

    if (pong !== "PONG") {
      return {
        status: "error",
        message: "Redis ping failed",
        latency,
      };
    }

    // Warning si latency > 500ms
    if (latency > 500) {
      return {
        status: "warning",
        message: `Redis slow (${latency}ms)`,
        latency,
      };
    }

    return {
      status: "ok",
      latency,
    };
  } catch (error) {
    console.error("[HEALTH] Redis check failed:", error);

    // Redis failure NO es crítico (hay fallback)
    return {
      status: "warning",
      message: "Redis unavailable (fallback active)",
    };
  }
}

/**
 * Check AI Services (Gemini)
 * Solo verifica que las API keys estén configuradas.
 * No hacemos llamadas reales (costosas).
 */
async function checkAIServices(): Promise<CheckResult> {
  try {
    // Verificar que Gemini API key existe
    const geminiKey = process.env.GOOGLE_AI_API_KEY;

    if (!geminiKey) {
      return {
        status: "error",
        message: "Gemini API key not configured",
      };
    }

    // Venice es opcional (NSFW)
    const veniceKey = process.env.VENICE_API_KEY;

    if (!veniceKey) {
      return {
        status: "warning",
        message: "Venice API key not configured (NSFW disabled)",
      };
    }

    return {
      status: "ok",
    };
  } catch (error) {
    console.error("[HEALTH] AI services check failed:", error);
    return {
      status: "error",
      message: "AI services configuration error",
    };
  }
}

/**
 * Check Storage (Cloudflare R2)
 * Solo verifica que las credenciales estén configuradas.
 * No hacemos llamadas reales (costosas).
 */
async function checkStorage(): Promise<CheckResult> {
  try {
    const s3Endpoint = process.env.S3_ENDPOINT;
    const s3AccessKey = process.env.S3_ACCESS_KEY_ID;
    const s3SecretKey = process.env.S3_SECRET_ACCESS_KEY;

    if (!s3Endpoint || !s3AccessKey || !s3SecretKey) {
      return {
        status: "warning",
        message: "R2 storage not fully configured (features may be limited)",
      };
    }

    return {
      status: "ok",
    };
  } catch (error) {
    console.error("[HEALTH] Storage check failed:", error);
    return {
      status: "warning",
      message: "Storage configuration error",
    };
  }
}
