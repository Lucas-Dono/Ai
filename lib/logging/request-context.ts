/**
 * Request context tracking
 *
 * Permite mantener un requestId único a través de toda la cadena de ejecución
 * sin necesidad de pasar el ID manualmente en cada función
 *
 * Compatible con Edge Runtime (usa Web Crypto API en lugar de Node.js crypto)
 */

import type { Logger } from 'pino';

interface RequestContext {
  requestId: string;
  userId?: string;
  agentId?: string;
  startTime: number;
  metadata?: Record<string, unknown>;
}

// Storage para el contexto de request
// Solo se inicializa en Node.js runtime (no en Edge)
let asyncLocalStorage: any = null;

// Inicializar AsyncLocalStorage solo si estamos en Node.js runtime
if (typeof process !== 'undefined' && process.versions?.node) {
  try {
    const { AsyncLocalStorage } = require('async_hooks');
    asyncLocalStorage = new AsyncLocalStorage();
  } catch (error) {
    // Edge runtime - AsyncLocalStorage no disponible
    console.warn('[RequestContext] AsyncLocalStorage not available (Edge Runtime)');
  }
}

/**
 * Genera un nuevo request ID único
 * Compatible con Edge Runtime (usa Web Crypto API)
 */
export function generateRequestId(): string {
  // Usar Web Crypto API que está disponible tanto en Node.js como en Edge Runtime
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback para entornos muy antiguos (no debería ser necesario)
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Obtiene el contexto actual del request
 */
export function getRequestContext(): RequestContext | undefined {
  if (!asyncLocalStorage) return undefined;
  return asyncLocalStorage.getStore();
}

/**
 * Obtiene el request ID actual
 */
export function getRequestId(): string | undefined {
  return getRequestContext()?.requestId;
}

/**
 * Obtiene el user ID del contexto actual
 */
export function getUserId(): string | undefined {
  return getRequestContext()?.userId;
}

/**
 * Ejecuta una función dentro de un contexto de request
 */
export function runInContext<T>(
  context: Partial<RequestContext>,
  fn: () => T
): T {
  const fullContext: RequestContext = {
    requestId: context.requestId || generateRequestId(),
    userId: context.userId,
    agentId: context.agentId,
    startTime: context.startTime || Date.now(),
    metadata: context.metadata,
  };

  // Si no hay asyncLocalStorage (Edge Runtime), ejecutar sin contexto
  if (!asyncLocalStorage) {
    return fn();
  }

  return asyncLocalStorage.run(fullContext, fn);
}

/**
 * Ejecuta una función async dentro de un contexto de request
 */
export async function runInContextAsync<T>(
  context: Partial<RequestContext>,
  fn: () => Promise<T>
): Promise<T> {
  const fullContext: RequestContext = {
    requestId: context.requestId || generateRequestId(),
    userId: context.userId,
    agentId: context.agentId,
    startTime: context.startTime || Date.now(),
    metadata: context.metadata,
  };

  // Si no hay asyncLocalStorage (Edge Runtime), ejecutar sin contexto
  if (!asyncLocalStorage) {
    return fn();
  }

  return asyncLocalStorage.run(fullContext, fn);
}

/**
 * Actualiza el contexto actual con nuevos datos
 */
export function updateContext(updates: Partial<RequestContext>): void {
  if (!asyncLocalStorage) return;

  const current = getRequestContext();
  if (current) {
    Object.assign(current, updates);
  }
}

/**
 * Crea un child logger que incluye automáticamente el requestId
 */
export function createContextLogger(baseLogger: Logger): Logger {
  // Si no hay asyncLocalStorage (Edge Runtime), retornar logger base
  if (!asyncLocalStorage) {
    return baseLogger;
  }

  const context = getRequestContext();

  if (!context) {
    return baseLogger;
  }

  return baseLogger.child({
    requestId: context.requestId,
    userId: context.userId,
    agentId: context.agentId,
  });
}

/**
 * Middleware helper para Next.js API routes
 *
 * Uso:
 * ```typescript
 * export async function POST(request: Request) {
 *   return withRequestContext(async () => {
 *     // Tu código aquí
 *     // El requestId estará disponible automáticamente en logs
 *   });
 * }
 * ```
 */
export async function withRequestContext<T>(
  fn: () => Promise<T>,
  context?: Partial<RequestContext>
): Promise<T> {
  // Si no hay asyncLocalStorage (Edge Runtime), ejecutar directamente
  if (!asyncLocalStorage) {
    return fn();
  }

  return runInContextAsync(
    {
      requestId: generateRequestId(),
      startTime: Date.now(),
      ...context,
    },
    fn
  );
}

/**
 * Helper para extraer user ID de headers de autenticación
 * (Se puede integrar con tu sistema de auth)
 */
export function extractUserIdFromHeaders(headers: Headers): string | undefined {
  // Implementar según tu sistema de auth
  // Por ejemplo, decodificar JWT del header Authorization
  return undefined;
}

/**
 * Obtiene la duración del request actual en ms
 */
export function getRequestDuration(): number {
  const context = getRequestContext();
  if (!context) {
    return 0;
  }

  return Date.now() - context.startTime;
}
