import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
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

  // Desarrollo: permitir cualquier localhost
  if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
    return true;
  }

  return ALLOWED_ORIGINS.includes(origin);
}

export default auth(async (req) => {
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
    "/api/auth/signin",
    "/api/auth/signout",
    "/api/auth/callback",
    "/api/auth/session",
    "/api/auth/providers",
    "/api/auth/csrf",
    "/api/auth/register", // IMPORTANTE: Endpoint de registro debe ser público
    "/api/auth/login", // IMPORTANTE: Endpoint de login debe ser público
    "/api/webhooks/mercadopago",
    "/api/community", // GROWTH: API pública de comunidad (read + anonymous post)
    "/api/worlds", // GROWTH: API pública de mundos (read-only)
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

    // Primero verificar sesión NextAuth (web)
    // SECURITY: req.auth must have a valid user object
    // If user was deleted from DB, the session callback returns null and req.auth.user will be undefined
    if (req.auth?.user?.id) {
      log.info({
        userId: req.auth.user.id,
        userEmail: req.auth.user?.email,
        authMethod: 'NextAuth'
      }, 'NextAuth session found and validated');
      isAuthenticated = true;
      authMethod = 'NextAuth';
    } else if (req.auth) {
      // Session exists but user is invalid (deleted from DB)
      log.warn({
        pathname,
        hasAuth: !!req.auth,
        hasUser: !!req.auth.user
      }, 'Invalid session detected - user may have been deleted');
      isAuthenticated = false;
    }
    // Si no hay sesión web, verificar JWT token (mobile)
    else {
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

    // Si no está autenticado por ningún método, redirigir a login
    if (!isAuthenticated) {
      log.warn({ pathname }, 'Unauthorized access attempt - redirecting to login');
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      response = NextResponse.redirect(loginUrl);

      // SECURITY: Clear all auth-related cookies when session is invalid
      // This prevents zombie sessions from persisting
      const isProduction = process.env.NODE_ENV === 'production';
      const cookiesToClear = [
        'authjs.session-token',
        'next-auth.session-token',
        'authjs.csrf-token',
        'next-auth.csrf-token',
        // __Secure- cookies only work in production (HTTPS)
        ...(isProduction ? [
          '__Secure-authjs.session-token',
          '__Secure-next-auth.session-token',
          '__Secure-authjs.csrf-token',
          '__Secure-next-auth.csrf-token',
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
});

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
