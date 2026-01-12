/**
 * Tarpit Middleware
 *
 * Ralentiza respuestas a atacantes detectados para:
 * 1. Consumir sus recursos
 * 2. Hacer que el scanning sea extremadamente lento
 * 3. Frustrar ataques automatizados
 *
 * Estrategias:
 * - Delay fijo basado en threat score
 * - Delay exponencial para attackers repetitivos
 * - Respuestas lentas byte-por-byte
 * - Timeouts largos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// TARPIT CONFIGURATION
// ============================================================================

export interface TarpitConfig {
  enabled: boolean;
  minDelay: number; // ms
  maxDelay: number; // ms
  exponentialBackoff: boolean;
  slowByteResponse: boolean; // Enviar respuesta byte por byte
  bytesPerSecond: number; // Para slow byte response
}

const DEFAULT_CONFIG: TarpitConfig = {
  enabled: true,
  minDelay: 1000, // 1 segundo
  maxDelay: 60000, // 60 segundos
  exponentialBackoff: true,
  slowByteResponse: true,
  bytesPerSecond: 100, // 100 bytes/sec (extremadamente lento)
};

// ============================================================================
// DELAY CALCULATION
// ============================================================================

/**
 * Calcula el delay apropiado basado en threat score y historial
 */
export async function calculateTarpitDelay(
  fingerprintId: string,
  threatScore: number,
  config: Partial<TarpitConfig> = {}
): Promise<number> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  if (!cfg.enabled || threatScore < 30) {
    return 0; // No tarpit para amenazas bajas
  }

  try {
    // Obtener fingerprint con historial
    const fingerprint = await prisma.clientFingerprint.findUnique({
      where: { id: fingerprintId },
      include: {
        threatDetections: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        honeypotHitRecords: {
          select: {
            id: true,
            ipAddress: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!fingerprint) {
      return cfg.minDelay;
    }

    // Base delay según threat score
    // 30-50: 1-5 segundos
    // 50-70: 5-15 segundos
    // 70-90: 15-30 segundos
    // 90-100: 30-60 segundos
    let delay = cfg.minDelay;

    if (threatScore >= 90) {
      delay = 30000 + Math.random() * 30000; // 30-60s
    } else if (threatScore >= 70) {
      delay = 15000 + Math.random() * 15000; // 15-30s
    } else if (threatScore >= 50) {
      delay = 5000 + Math.random() * 10000; // 5-15s
    } else {
      delay = 1000 + Math.random() * 4000; // 1-5s
    }

    // Exponential backoff basado en intentos previos
    if (cfg.exponentialBackoff) {
      const recentAttempts = (fingerprint.threatDetections?.length || 0) + (fingerprint.honeypotHits || 0);

      if (recentAttempts > 0) {
        // Multiplicar por 1.5^attempts (máximo 10 veces)
        const multiplier = Math.min(Math.pow(1.5, recentAttempts), 10);
        delay *= multiplier;
      }
    }

    // Cap al máximo configurado
    delay = Math.min(delay, cfg.maxDelay);

    return Math.floor(delay);
  } catch (error) {
    console.error('[TARPIT] Error calculating delay:', error);
    return cfg.minDelay;
  }
}

// ============================================================================
// TARPIT MIDDLEWARE
// ============================================================================

/**
 * Aplica tarpit a un request
 */
export async function applyTarpit(
  fingerprintId: string,
  threatScore: number,
  handler: () => Promise<Response>,
  config: Partial<TarpitConfig> = {}
): Promise<Response> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const delay = await calculateTarpitDelay(fingerprintId, threatScore, cfg);

  if (delay === 0) {
    return handler();
  }

  console.log(`[TARPIT] Applying ${delay}ms delay to fingerprint ${fingerprintId.substring(0, 8)}...`);

  // Aplicar delay
  await sleep(delay);

  // Ejecutar handler
  const response = await handler();

  // Si está configurado slow byte response, modificar la respuesta
  if (cfg.slowByteResponse && threatScore > 70) {
    return createSlowResponse(response, cfg.bytesPerSecond);
  }

  return response;
}

/**
 * Crea una respuesta que se envía byte por byte (lenta)
 */
function createSlowResponse(originalResponse: Response, bytesPerSecond: number): Response {
  // Esta funcionalidad requiere ReadableStream
  // Por ahora, solo agregamos el delay inicial
  // TODO: Implementar streaming lento real
  return originalResponse;
}

// ============================================================================
// TARPIT WRAPPER PARA ROUTE HANDLERS
// ============================================================================

/**
 * Wrapper para aplicar tarpit automáticamente a route handlers
 */
export function withTarpit(
  handler: (request: Request, ...args: any[]) => Promise<Response>,
  config: Partial<TarpitConfig> = {}
) {
  return async (request: Request, ...args: any[]): Promise<Response> => {
    try {
      // Obtener fingerprint del request
      const ipAddress = getClientIp(request);

      const fingerprint = await prisma.clientFingerprint.findFirst({
        where: { ipAddress },
        orderBy: { lastSeen: 'desc' },
      });

      if (!fingerprint || fingerprint.threatScore < 30) {
        // No tarpit
        return handler(request, ...args);
      }

      // Aplicar tarpit
      return applyTarpit(
        fingerprint.id,
        fingerprint.threatScore,
        () => handler(request, ...args),
        config
      );
    } catch (error) {
      console.error('[TARPIT] Error in tarpit wrapper:', error);
      // En caso de error, ejecutar handler normalmente
      return handler(request, ...args);
    }
  };
}

// ============================================================================
// SMART TARPIT
// ============================================================================

/**
 * Tarpit inteligente que ajusta dinámicamente el delay
 * basado en el comportamiento del atacante
 */
export class SmartTarpit {
  private delays: Map<string, number> = new Map();
  private attempts: Map<string, number> = new Map();
  private config: TarpitConfig;

  constructor(config: Partial<TarpitConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Registra un intento y calcula el delay apropiado
   */
  async recordAttempt(fingerprintId: string, threatScore: number): Promise<number> {
    const currentAttempts = this.attempts.get(fingerprintId) || 0;
    const newAttempts = currentAttempts + 1;
    this.attempts.set(fingerprintId, newAttempts);

    // Calcular delay
    const delay = await calculateTarpitDelay(fingerprintId, threatScore, this.config);
    this.delays.set(fingerprintId, delay);

    return delay;
  }

  /**
   * Obtiene el delay actual para un fingerprint
   */
  getDelay(fingerprintId: string): number {
    return this.delays.get(fingerprintId) || 0;
  }

  /**
   * Aplica el delay
   */
  async apply(fingerprintId: string): Promise<void> {
    const delay = this.getDelay(fingerprintId);
    if (delay > 0) {
      await sleep(delay);
    }
  }

  /**
   * Limpia datos antiguos (llamar periódicamente)
   */
  cleanup(): void {
    // Mantener solo los últimos 1000 fingerprints
    if (this.delays.size > 1000) {
      const entries = Array.from(this.delays.entries());
      const toKeep = entries.slice(-1000);
      this.delays = new Map(toKeep);

      const attemptEntries = Array.from(this.attempts.entries());
      const attemptToKeep = attemptEntries.slice(-1000);
      this.attempts = new Map(attemptToKeep);
    }
  }
}

// Instancia global de SmartTarpit
export const globalTarpit = new SmartTarpit();

// Cleanup cada hora
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    globalTarpit.cleanup();
  }, 60 * 60 * 1000);
}

// ============================================================================
// PROGRESSIVE TARPIT
// ============================================================================

/**
 * Tarpit progresivo que aumenta el delay con cada intento
 */
export class ProgressiveTarpit {
  private readonly baseDelay: number;
  private readonly maxDelay: number;
  private readonly multiplier: number;
  private attempts: Map<string, { count: number; lastAttempt: Date }> = new Map();

  constructor(
    baseDelay: number = 1000,
    maxDelay: number = 60000,
    multiplier: number = 2
  ) {
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
    this.multiplier = multiplier;
  }

  /**
   * Calcula delay progresivo
   */
  getDelay(fingerprintId: string): number {
    const entry = this.attempts.get(fingerprintId);

    if (!entry) {
      return this.baseDelay;
    }

    // Reset si pasó más de 1 hora desde el último intento
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (entry.lastAttempt < hourAgo) {
      this.attempts.delete(fingerprintId);
      return this.baseDelay;
    }

    // Calcular delay: baseDelay * multiplier^attempts
    const delay = Math.min(
      this.baseDelay * Math.pow(this.multiplier, entry.count),
      this.maxDelay
    );

    return delay;
  }

  /**
   * Registra un intento
   */
  recordAttempt(fingerprintId: string): void {
    const entry = this.attempts.get(fingerprintId);

    if (entry) {
      entry.count++;
      entry.lastAttempt = new Date();
    } else {
      this.attempts.set(fingerprintId, {
        count: 1,
        lastAttempt: new Date(),
      });
    }
  }

  /**
   * Aplica tarpit progresivo
   */
  async apply(fingerprintId: string): Promise<void> {
    const delay = this.getDelay(fingerprintId);
    this.recordAttempt(fingerprintId);

    if (delay > 0) {
      console.log(`[PROGRESSIVE_TARPIT] Applying ${delay}ms delay (attempt ${this.attempts.get(fingerprintId)?.count})`);
      await sleep(delay);
    }
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getClientIp(request: Request): string {
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'dev-ip';
}

/**
 * Obtiene estadísticas de tarpit
 */
export async function getTarpitStats(timeRange: { from: Date; to: Date }) {
  try {
    const threats = await prisma.threatDetection.findMany({
      where: {
        createdAt: {
          gte: timeRange.from,
          lte: timeRange.to,
        },
        tarpitDelay: {
          gt: 0,
        },
      },
      select: {
        tarpitDelay: true,
        ipAddress: true,
      },
    });

    const totalDelay = threats.reduce((sum, t) => sum + (t.tarpitDelay || 0), 0);
    const avgDelay = threats.length > 0 ? totalDelay / threats.length : 0;
    const uniqueIPs = new Set(threats.map(t => t.ipAddress)).size;

    return {
      totalRequests: threats.length,
      totalDelayMs: totalDelay,
      totalDelayMinutes: Math.floor(totalDelay / 1000 / 60),
      avgDelayMs: Math.floor(avgDelay),
      uniqueAttackers: uniqueIPs,
    };
  } catch (error) {
    console.error('[TARPIT] Error getting stats:', error);
    throw error;
  }
}
