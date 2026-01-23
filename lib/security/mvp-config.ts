/**
 * SECURITY CONFIG - MVP MODE
 *
 * Configuración minimalista para MVP con 0 usuarios.
 *
 * ¿Por qué deshabilitado?
 * - Fingerprinting: Necesita DB writes, slow, innecesario sin atacantes
 * - Honeypots: Innecesario sin atacantes reales
 * - Tarpit: Slow down requests, mala UX para testing
 * - Canary Tokens: Detección de exfiltración innecesaria pre-producción
 * - Threat Detection: Overhead sin beneficio con 0 usuarios
 *
 * ¿Qué SÍ está activo?
 * - Rate limiting básico (evitar spam)
 * - CSRF protection (seguridad web básica)
 * - Headers de seguridad (CSP, etc.)
 *
 * CUÁNDO HABILITAR:
 * - Fingerprinting: Cuando tengas 100+ usuarios
 * - Honeypots: Cuando veas ataques reales
 * - Tarpit: Cuando tengas DDoS attempts
 * - Threat Detection: Cuando tengas 1,000+ usuarios
 */

import { SecurityConfig } from './security-middleware';

/**
 * Config para MVP / Development / Testing
 */
export const MVP_SECURITY_CONFIG: SecurityConfig = {
  enableFingerprinting: false, // ❌ OFF - Innecesario para MVP
  enableHoneypots: false, // ❌ OFF - Sin atacantes reales todavía
  enableTarpit: false, // ❌ OFF - Slow down requests, mala UX
  enableCanaryTokens: false, // ❌ OFF - Innecesario pre-producción
  enableThreatDetection: false, // ❌ OFF - Overhead sin beneficio
  autoBlock: false, // ❌ OFF - No bloquear automáticamente
  autoBlockThreshold: 80, // N/A cuando autoBlock = false
};

/**
 * Config para cuando tengas ~100 usuarios
 */
export const EARLY_PRODUCTION_CONFIG: SecurityConfig = {
  enableFingerprinting: true, // ✅ ON - Tracking básico
  enableHoneypots: false, // ❌ OFF - Todavía no necesario
  enableTarpit: false, // ❌ OFF - Esperar a ver ataques reales
  enableCanaryTokens: false, // ❌ OFF - Esperar a tener data sensible
  enableThreatDetection: true, // ✅ ON - Detección básica
  autoBlock: false, // ❌ OFF - Bloqueo manual todavía
  autoBlockThreshold: 90, // Threshold alto (solo casos extremos)
};

/**
 * Config para producción completa (1,000+ usuarios)
 */
export const FULL_PRODUCTION_CONFIG: SecurityConfig = {
  enableFingerprinting: true, // ✅ ON
  enableHoneypots: true, // ✅ ON
  enableTarpit: true, // ✅ ON
  enableCanaryTokens: true, // ✅ ON
  enableThreatDetection: true, // ✅ ON
  autoBlock: true, // ✅ ON
  autoBlockThreshold: 80, // Threshold medio
};

/**
 * Config activa (cambiar según etapa)
 */
export const ACTIVE_SECURITY_CONFIG = MVP_SECURITY_CONFIG;

/**
 * Helper: Obtener config según environment
 */
export function getSecurityConfig(): SecurityConfig {
  // En producción, puedes usar env var para controlar:
  // const mode = process.env.SECURITY_MODE || 'mvp';

  // Por ahora, siempre MVP
  return MVP_SECURITY_CONFIG;

  // Cuando lances:
  // if (mode === 'early') return EARLY_PRODUCTION_CONFIG;
  // if (mode === 'full') return FULL_PRODUCTION_CONFIG;
  // return MVP_SECURITY_CONFIG;
}
