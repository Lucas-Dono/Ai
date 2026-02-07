/**
 * Protección CSRF (Cross-Site Request Forgery)
 *
 * Valida que las peticiones que modifican datos provengan del origin correcto.
 * OWASP: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
 */

import { NextRequest } from 'next/server';

/**
 * Obtener los origins permitidos desde variables de entorno
 */
function getAllowedOrigins(): string[] {
  const origins: string[] = [];

  // Production URL
  if (process.env.NEXTAUTH_URL) {
    origins.push(process.env.NEXTAUTH_URL);
  }

  // Public app URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  }

  // Desarrollo local
  origins.push('http://localhost:3000');
  origins.push('http://127.0.0.1:3000');

  // Eliminar duplicados y normalizar (sin trailing slash)
  return Array.from(new Set(origins.map(origin => origin.replace(/\/$/, ''))));
}

/**
 * Validar que el Origin header sea válido para prevenir CSRF
 *
 * Para peticiones que modifican estado (POST, PUT, PATCH, DELETE),
 * debemos verificar que el Origin header coincida con uno de nuestros dominios.
 *
 * @param req - NextRequest
 * @returns true si el origin es válido, false si es inválido o sospechoso
 *
 * @example
 * // En un endpoint API:
 * export async function PATCH(req: NextRequest) {
 *   if (!validateCSRFOrigin(req)) {
 *     return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
 *   }
 *   // ... resto del código
 * }
 */
export function validateCSRFOrigin(req: NextRequest): boolean {
  const method = req.method?.toUpperCase();

  // Solo validar métodos que modifican estado
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return true;
  }

  // Obtener Origin header
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');

  // El Origin header debería estar presente en requests modernos
  // Si no está, intentamos usar Referer como fallback
  const requestOrigin = origin || (referer ? extractOriginFromReferer(referer) : null);

  if (!requestOrigin) {
    console.warn('[CSRF] Request without Origin or Referer header', {
      method,
      url: req.url,
      userAgent: req.headers.get('user-agent')?.substring(0, 50),
    });
    return false;
  }

  // Validar contra origins permitidos
  const allowedOrigins = getAllowedOrigins();
  const normalizedRequestOrigin = requestOrigin.replace(/\/$/, '');

  const isValid = allowedOrigins.includes(normalizedRequestOrigin);

  if (!isValid) {
    console.warn('[CSRF] Invalid origin detected', {
      method,
      requestOrigin: normalizedRequestOrigin,
      allowedOrigins,
      url: req.url,
    });
  }

  return isValid;
}

/**
 * Extraer origin de la URL del Referer
 *
 * @param referer - Referer header completo
 * @returns Origin extraído o null si es inválido
 */
function extractOriginFromReferer(referer: string): string | null {
  try {
    const url = new URL(referer);
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Middleware helper para validar CSRF y retornar respuesta de error si falla
 *
 * @param req - NextRequest
 * @returns Error response si la validación falla, null si es válida
 *
 * @example
 * export async function PATCH(req: NextRequest) {
 *   const csrfError = checkCSRF(req);
 *   if (csrfError) return csrfError;
 *   // ... resto del código
 * }
 */
export function checkCSRF(req: NextRequest) {
  if (!validateCSRFOrigin(req)) {
    return new Response(
      JSON.stringify({
        error: 'Forbidden',
        message: 'Invalid origin - CSRF protection',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  return null;
}
