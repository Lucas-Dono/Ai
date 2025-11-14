/**
 * Barrel export para el sistema de logging
 */

// Logger principal y utilidades
export {
  logger,
  defaultLogger,
  createLogger,
  logError,
  createTimer,
  logRequest,
  logResponse,
  sanitize,
  type Logger,
} from './logger';

// Loggers específicos por módulo
export {
  apiLogger,
  llmLogger,
  dbLogger,
  authLogger,
  emotionalLogger,
  memoryLogger,
  socketLogger,
  voiceLogger,
  visualLogger,
  behaviorLogger,
  notificationLogger,
  billingLogger,
  recommendationLogger,
  worldLogger,
  middlewareLogger,
  cronLogger,
  metricsLogger,
} from './loggers';

// Request context tracking
export {
  generateRequestId,
  getRequestContext,
  getRequestId,
  getUserId,
  runInContext,
  runInContextAsync,
  updateContext,
  createContextLogger,
  withRequestContext,
  extractUserIdFromHeaders,
  getRequestDuration,
} from './request-context';
