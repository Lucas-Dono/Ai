/**
 * Configuración centralizada de API
 *
 * IMPORTANTE: Este es el ÚNICO lugar donde se debe definir la URL base de la API
 * Cualquier otro archivo debe importar desde aquí
 */

import { DEV_API_URL as ENV_DEV_API_URL, PROD_API_URL as ENV_PROD_API_URL } from '@env';

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE URLs DE API
// ═══════════════════════════════════════════════════════════════════
/**
 * CÓMO OBTENER TU IP LOCAL:
 *
 * Linux/Mac:
 *   - Opción 1: ip addr show | grep "inet " | grep -v 127.0.0.1
 *   - Opción 2: ifconfig | grep "inet " | grep -v 127.0.0.1
 *   - Opción 3: hostname -I
 *
 * Windows:
 *   - ipconfig | findstr IPv4
 *
 * IMPORTANTE: No uses "localhost" o "127.0.0.1" - no funcionará en emuladores/dispositivos.
 *             Debes usar tu IP local en la red (ej: 192.168.x.x o 10.0.x.x)
 *
 * CONFIGURACIÓN RECOMENDADA:
 * 1. Crea un archivo mobile/.env (ver mobile/.env.example)
 * 2. Define DEV_API_URL=http://TU_IP:3000
 * 3. Define PROD_API_URL=https://tu-dominio.com
 *
 * Si no configuras variables de entorno, se usarán los valores por defecto abajo.
 */

const DEV_API_URL = ENV_DEV_API_URL || 'http://192.168.0.170:3000';
const PROD_API_URL = ENV_PROD_API_URL || 'https://api.example.com';

// Advertencia en desarrollo si no se configuró la IP
const DEFAULT_DEV_IP = '192.168.0.170';
if (__DEV__ && DEV_API_URL.includes(DEFAULT_DEV_IP)) {
  console.warn('⚠️  API URL no configurada - usando IP por defecto');
  console.warn('📖 Para configurar tu IP local, lee: mobile/README.md sección "Configuración de API"');
  console.warn(`🔧 Tu URL actual: ${DEV_API_URL}`);
}

/**
 * URL base de la API según el entorno
 *
 * Desarrollo: Usa la IP local de tu computadora en la red
 * Producción: Usa el dominio desplegado en internet
 */
export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

/**
 * Timeout por defecto para requests HTTP (en ms)
 */
export const API_TIMEOUT = 30000; // 30 segundos

/**
 * Configuración de WebSocket
 */
export const SOCKET_CONFIG = {
  url: API_BASE_URL,
  path: '/api/socketio',
  timeout: 5000,
  reconnection: false, // Por ahora desactivado, Socket.io es opcional
} as const;

/**
 * Helper para construir URLs completas
 */
export const buildApiUrl = (path: string): string => {
  // Asegurar que el path empiece con /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

/**
 * Helper para construir URLs de avatares
 */
export const buildAvatarUrl = (avatar: string | null | undefined): string | undefined => {
  if (!avatar) return undefined;

  // IMPORTANTE: Si es una data URL (base64), NO la procesamos
  // React Native Image tiene problemas con data URLs grandes
  // Esto solo debería ocurrir con agentes antiguos creados antes de la migración
  // Los nuevos agentes guardan las imágenes como archivos
  if (avatar.startsWith('data:')) {
    console.warn('[buildAvatarUrl] Legacy data URL detected (should not happen with new agents)');
    return undefined;
  }

  // Si ya es una URL completa, retornarla tal cual
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }

  // Si es una ruta relativa (empieza con /), construir URL completa
  if (avatar.startsWith('/')) {
    return `${API_BASE_URL}${avatar}`;
  }

  // Si no tiene protocolo ni barra inicial, asumimos que es una ruta relativa
  // y la convertimos agregando la barra inicial
  return `${API_BASE_URL}/${avatar}`;
};
