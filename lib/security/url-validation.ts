/**
 * Validación de URLs para prevenir Open Redirect vulnerability
 *
 * OWASP: https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html
 */

/**
 * Lista de protocolos permitidos
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * Patrones peligrosos que siempre deben bloquearse
 */
const DANGEROUS_PATTERNS = [
  /^javascript:/i,
  /^data:/i,
  /^vbscript:/i,
  /^file:/i,
  /^about:/i,
];

/**
 * Validar si una URL es segura para redirigir
 *
 * Criterios:
 * 1. Debe ser una URL relativa (sin dominio) o del mismo origin
 * 2. No debe usar protocolos peligrosos (javascript:, data:, etc.)
 * 3. No debe intentar bypass con // (protocol-relative URLs a dominios externos)
 *
 * @param url - URL a validar
 * @param allowedOrigin - Origin permitido (default: window.location.origin o process.env.NEXTAUTH_URL)
 * @returns true si la URL es segura, false si es peligrosa
 *
 * @example
 * isValidRedirectUrl('/dashboard') // true - URL relativa
 * isValidRedirectUrl('https://tuapp.com/profile') // true - mismo origin
 * isValidRedirectUrl('https://evil.com') // false - dominio externo
 * isValidRedirectUrl('//evil.com') // false - protocol-relative externa
 * isValidRedirectUrl('javascript:alert(1)') // false - XSS
 */
export function isValidRedirectUrl(url: string, allowedOrigin?: string): boolean {
  // Validación básica
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Limpiar espacios
  url = url.trim();

  // Bloquear URLs vacías
  if (url.length === 0) {
    return false;
  }

  // Verificar patrones peligrosos
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(url)) {
      console.warn('[SECURITY] Blocked dangerous URL pattern:', url);
      return false;
    }
  }

  // URLs relativas son siempre seguras (empiezan con /, pero no //)
  if (url.startsWith('/') && !url.startsWith('//')) {
    return true;
  }

  // Determinar el origin permitido
  const origin = allowedOrigin ||
    (typeof window !== 'undefined' ? window.location.origin : process.env.NEXTAUTH_URL) ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';

  try {
    // Intentar parsear como URL absoluta
    const parsedUrl = new URL(url, origin);

    // Verificar que el protocolo sea permitido
    if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
      console.warn('[SECURITY] Blocked URL with disallowed protocol:', parsedUrl.protocol);
      return false;
    }

    // Verificar que el origin sea el mismo
    const parsedOrigin = new URL(origin);
    const isSameOrigin = parsedUrl.origin === parsedOrigin.origin;

    if (!isSameOrigin) {
      console.warn('[SECURITY] Blocked URL with different origin:', {
        url: parsedUrl.origin,
        expected: parsedOrigin.origin,
      });
      return false;
    }

    return true;
  } catch (error) {
    // Si no se puede parsear, es probablemente inválida
    console.warn('[SECURITY] Failed to parse URL:', url, error);
    return false;
  }
}

/**
 * Sanitizar URL de redirect para uso seguro
 *
 * Si la URL es válida, la retorna. Si no, retorna una URL por defecto.
 *
 * @param url - URL a sanitizar
 * @param defaultUrl - URL por defecto si la validación falla (default: '/dashboard')
 * @param allowedOrigin - Origin permitido
 * @returns URL segura
 *
 * @example
 * sanitizeRedirectUrl('/profile') // '/profile'
 * sanitizeRedirectUrl('//evil.com') // '/dashboard'
 * sanitizeRedirectUrl('javascript:alert(1)') // '/dashboard'
 * sanitizeRedirectUrl('https://evil.com', '/home') // '/home'
 */
export function sanitizeRedirectUrl(
  url: string | null | undefined,
  defaultUrl: string = '/dashboard',
  allowedOrigin?: string
): string {
  // Si no hay URL, usar default
  if (!url) {
    return defaultUrl;
  }

  // Validar URL
  if (isValidRedirectUrl(url, allowedOrigin)) {
    return url;
  }

  // URL inválida, usar default
  console.warn('[SECURITY] Invalid redirect URL blocked, using default:', {
    attempted: url,
    default: defaultUrl,
  });

  return defaultUrl;
}

/**
 * Obtener callbackUrl segura de URL search params
 *
 * @param searchParams - URLSearchParams o string
 * @param defaultUrl - URL por defecto
 * @returns URL segura para callback
 *
 * @example
 * const params = new URLSearchParams('?callbackUrl=/profile');
 * getSecureCallbackUrl(params) // '/profile'
 *
 * const params2 = new URLSearchParams('?callbackUrl=https://evil.com');
 * getSecureCallbackUrl(params2) // '/dashboard'
 */
export function getSecureCallbackUrl(
  searchParams: URLSearchParams | string | null | undefined,
  defaultUrl: string = '/dashboard'
): string {
  if (!searchParams) {
    return defaultUrl;
  }

  // Convertir a URLSearchParams si es string
  const params = typeof searchParams === 'string'
    ? new URLSearchParams(searchParams)
    : searchParams;

  const callbackUrl = params.get('callbackUrl');

  return sanitizeRedirectUrl(callbackUrl, defaultUrl);
}
