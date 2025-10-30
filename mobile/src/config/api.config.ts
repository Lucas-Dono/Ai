/**
 * Configuración centralizada de API
 *
 * IMPORTANTE: Este es el ÚNICO lugar donde se debe definir la URL base de la API
 * Cualquier otro archivo debe importar desde aquí
 */

/**
 * URL base de la API según el entorno
 *
 * Desarrollo: Usa la IP local de tu computadora
 * Producción: Usa el dominio desplegado
 */
export const API_BASE_URL = __DEV__
  ? 'http://192.168.0.170:3000' // TODO: Cambiar a tu IP local
  : 'https://tu-dominio.com';   // TODO: Cambiar a tu dominio de producción

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

  // Si ya es una URL completa, retornarla tal cual
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }

  // Si es una ruta relativa, construir URL completa
  return `${API_BASE_URL}${avatar}`;
};
