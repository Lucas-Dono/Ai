import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { verifyToken, extractTokenFromHeader } from "@/lib/jwt";
import { middlewareLogger as log } from "@/lib/logging/loggers";
import {
  generateRequestId,
  runInContextAsync
} from "@/lib/logging/request-context";
import {
  detectLocale,
  hasLocalePrefix,
  addLocalePrefix,
  getLocaleFromPathname,
} from "@/lib/i18n/locale-detector";
import {
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
} from "@/i18n/config";
import { handleHoneypotRequest } from "@/lib/security/honeypots";

// SECURITY FIX #6: Whitelist de dominios permitidos para CORS
// Previene requests desde dominios maliciosos
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://creador-inteligencias.vercel.app',
  // Agregar URL de ngrok aquí cuando necesites testing de webhooks
  process.env.NEXTAUTH_URL,
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  // SECURITY: Validación exacta de orígenes, no usar includes() que puede ser bypasseado
  // Ejemplo: "evil-localhost.com" NO debe pasar como válido

  // Desarrollo: permitir localhost y 127.0.0.1 con cualquier puerto
  if (process.env.NODE_ENV === 'development') {
    // Regex estricta: debe ser exactamente localhost o 127.0.0.1 con puerto opcional
    // ^http:// = debe empezar con http://
    // (localhost|127\.0\.0\.1) = exactamente localhost o 127.0.0.1
    // (:\d+)? = puerto opcional
    // $ = fin de string (no permite nada después)
    const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
    if (localhostPattern.test(origin)) {
      return true;
    }
  }

  // Producción: validación exacta contra whitelist
  return ALLOWED_ORIGINS.includes(origin);
}

export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const origin = req.headers.get("origin");
  const requestId = generateRequestId();

  log.info({
    method: req.method,
    pathname,
    origin,
    requestId
  }, 'Request received');

  // ============================================================================
  // SECURITY: Bloquear métodos HTTP peligrosos/innecesarios
  // ============================================================================
  // TRACE/TRACK pueden exponer información sensible en headers y
  // permitir ataques de Cross-Site Tracing (XST)
  // Referencias: OWASP, PCI-DSS, CWE-693
  if (["TRACE", "TRACK"].includes(req.method)) {
    log.warn({ method: req.method, requestId }, 'Blocked dangerous HTTP method');
    return new NextResponse("Method Not Allowed", {
      status: 405,
      headers: {
        Allow: "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  // ============================================================================
  // SECURITY: Sistema de Honeypots
  // ============================================================================
  // Detectar acceso a honeypots (endpoints trampa) ANTES de cualquier otra lógica
  // Esto atrapa atacantes temprano y registra su actividad
  try {
    const honeypotResponse = await handleHoneypotRequest(req);
    if (honeypotResponse) {
      log.warn({ pathname, requestId }, 'Honeypot triggered - returning fake response');
      return honeypotResponse;
    }
  } catch (error) {
    log.error({ error, requestId }, 'Error in honeypot handler');
    // Continuar con el flujo normal si hay error
  }

  // ============================================================================
  // DETECCIÓN AUTOMÁTICA DE IDIOMA POR GEOLOCALIZACIÓN
  // ============================================================================
  //
  // Sistema de detección con el siguiente orden de prioridad:
  // 1. Cookie NEXT_LOCALE (preferencia guardada del usuario)
  // 2. Geolocalización por IP (headers de Vercel/Cloudflare)
  // 3. Header Accept-Language del navegador
  // 4. Default: español
  //
  // NOTA: NO usamos prefijos de locale en las URLs (como /es o /en)
  // porque la estructura actual de la app no está organizada con [locale]
  // En su lugar, solo guardamos el idioma preferido en un cookie y
  // los componentes usan useTranslations() para mostrar el idioma correcto.

  // Rutas que no necesitan detección de locale
  const excludedPaths = [
    '/_next',
    '/api',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/manifest.json',
  ];

  const shouldHandleLocale = !excludedPaths.some(path => pathname.startsWith(path));

  // Detectar y guardar locale (sin redirección)
  let detectedLocale: string | null = null;
  if (shouldHandleLocale) {
    detectedLocale = detectLocale(req);
    const currentCookie = req.cookies.get(LOCALE_COOKIE_NAME)?.value;

    if (!currentCookie || currentCookie !== detectedLocale) {
      log.debug({
        locale: detectedLocale,
        requestId
      }, 'Locale detected (will be saved in cookie)');
    }
  }

  // ============================================================================
  // CONTINUACIÓN DEL MIDDLEWARE EXISTENTE (AUTH, CORS, etc.)
  // ============================================================================

  // SECURITY FIX #5: Rutas públicas que no requieren autenticación
  // Usar coincidencia exacta o con trailing slash para prevenir bypass
  // NOTA: Estas rutas pueden tener prefijo de locale (ej: /es/login, /en/login)
  const publicRoutes = [
    "/",
    "/login",
    "/registro",
    "/landing",
    "/dashboard", // GROWTH: Permitir ver personajes sin registro (solo para explorar, no para chatear)
    "/community", // GROWTH: Comunidad pública - comentar como anónimo (Discord-style)
    "/docs",
    "/legal",
    "/pricing", // Página de precios pública
    "/sponsors", // Página de sponsors pública
    "/careers", // Página de carreras pública
    "/security", // Security Dashboard (TODO: proteger en producción)
    "/api/auth", // better-auth: Todas las rutas de autenticación (sign-in, sign-out, get-session, register, etc.)
    "/api/webhooks/mercadopago",
    "/api/community", // GROWTH: API pública de comunidad (read + anonymous post)
    "/api/groups", // GROWTH: API pública de grupos (read-only)
    "/api/security", // Security API (TODO: proteger en producción)
    "/api/demo", // Demo chat system - Sin autenticación para visitantes de landing
  ];

  // SECURITY FIX #5: Verificar coincidencia exacta o que sea subruta válida
  // Previene bypass como /login-admin o /api/authentication
  // Ahora también considera rutas con prefijo de locale (ej: /es/login, /en/login)
  const isPublicRoute = publicRoutes.some(route => {
    // Coincidencia exacta
    if (pathname === route) return true;
    // Subruta válida (debe terminar con /)
    if (pathname.startsWith(route + '/')) return true;

    // Verificar con prefijo de locale (ej: /es/login, /en/login)
    // Extraer el path sin locale
    const pathWithoutLocale = getLocaleFromPathname(pathname)
      ? pathname.replace(/^\/[a-z]{2}/, '') || '/'
      : pathname;

    if (pathWithoutLocale === route) return true;
    if (pathWithoutLocale.startsWith(route + '/')) return true;

    return false;
  });

  log.debug({ isPublicRoute }, 'Route type determined');

  // Manejar preflight requests (OPTIONS) para CORS
  if (req.method === "OPTIONS") {
    log.debug('Handling OPTIONS preflight request');

    // SECURITY FIX #6: Validar origen antes de permitir CORS
    const allowedOrigin = isOriginAllowed(origin) ? origin! : '';

    if (!allowedOrigin) {
      log.warn({ origin }, 'Origin not allowed for CORS');
      return new NextResponse(null, { status: 403 });
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  let response: NextResponse;

  // Si es ruta pública, permitir acceso
  if (isPublicRoute) {
    log.debug('Public route - allowing without authentication');
    response = NextResponse.next();
  }
  // Verificar autenticación: NextAuth (web) o JWT (mobile)
  else {
    let isAuthenticated = false;
    let authMethod = 'none';

    // Primero verificar sesión better-auth (web)
    const session = await auth.api.getSession({ headers: req.headers });

    if (session?.user?.id) {
      log.info({
        userId: session.user.id,
        userEmail: session.user.email,
        authMethod: 'better-auth'
      }, 'better-auth session found and validated');
      isAuthenticated = true;
      authMethod = 'better-auth';
    }

    // Si no hay sesión web, verificar JWT token (mobile)
    if (!isAuthenticated) {
      const authHeader = req.headers.get('Authorization');
      const token = extractTokenFromHeader(authHeader);

      if (token) {
        const payload = await verifyToken(token);

        if (payload) {
          isAuthenticated = true;
          authMethod = 'JWT';
          // Agregar payload al request para que las rutas puedan usarlo
          (req as any).jwtPayload = payload;
          log.info({
            userId: payload.userId,
            email: payload.email,
            authMethod: 'JWT'
          }, 'JWT token valid');
        } else {
          log.warn('JWT token verification failed');
        }
      } else {
        log.debug('No JWT token found in Authorization header');
      }
    }

    // Si no está autenticado por ningún método
    if (!isAuthenticated) {
      // Para rutas de API, devolver 401 en lugar de redirect
      // Esto previene loops infinitos en requests AJAX
      if (pathname.startsWith('/api/')) {
        log.warn({ pathname }, 'Unauthorized API request - returning 401');
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Para rutas web, redirigir a login
      log.warn({ pathname }, 'Unauthorized access attempt - redirecting to login');
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      response = NextResponse.redirect(loginUrl);

      // SECURITY: Clear all auth-related cookies when session is invalid
      // This prevents zombie sessions from persisting
      const isProduction = process.env.NODE_ENV === 'production';
      const cookiesToClear = [
        'better-auth.session_token',
        'better-auth.csrf_token',
        // __Secure- cookies only work in production (HTTPS)
        ...(isProduction ? [
          '__Secure-better-auth.session_token',
          '__Secure-better-auth.csrf_token',
        ] : []),
      ];

      cookiesToClear.forEach(cookieName => {
        response.cookies.set(cookieName, '', {
          maxAge: 0,
          path: '/',
          secure: isProduction,
          sameSite: 'lax',
        });
      });

      log.info('Cleared invalid session cookies');
    } else {
      log.info({ authMethod }, 'Request authorized');
      response = NextResponse.next();
    }
  }

  // SECURITY FIX #6: Agregar headers CORS solo para orígenes permitidos
  if (origin && isOriginAllowed(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    log.debug({ origin }, 'CORS headers added for allowed origin');
  } else if (origin) {
    log.warn({ origin }, 'Origin not in whitelist - CORS headers not added');
  }

  // Agregar cookie de locale si fue detectado
  if (detectedLocale && shouldHandleLocale) {
    const currentCookie = req.cookies.get(LOCALE_COOKIE_NAME)?.value;
    if (!currentCookie || currentCookie !== detectedLocale) {
      response.cookies.set(LOCALE_COOKIE_NAME, detectedLocale, {
        maxAge: LOCALE_COOKIE_MAX_AGE,
        path: '/',
        sameSite: 'lax',
      });
      log.debug({ locale: detectedLocale }, 'Locale cookie saved');
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     *
     * Note: /api/auth/* routes are included in the matcher because they need
     * to be checked against publicRoutes (e.g., /api/auth/register is public
     * but /api/auth/protected would require auth)
     */
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/api/(.*)", // Include all API routes (publicRoutes list will filter public ones)
  ],
  // IMPORTANT: Use Node.js runtime because NextAuth session callbacks use Prisma
  // which cannot run on Edge Runtime without Prisma Accelerate or Driver Adapters
  runtime: 'nodejs',
};
