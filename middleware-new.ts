import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/lib/jwt";
import { middlewareLogger as log } from "@/lib/logging/loggers";
import {
  generateRequestId,
} from "@/lib/logging/request-context";
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";

// ============================================================================
// NEXT-INTL MIDDLEWARE
// ============================================================================
// Configuración de next-intl para manejo de internacionalización
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Solo agrega prefijo cuando no es el idioma por defecto
  localeDetection: true, // Habilita detección automática de idioma
});

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================
// SECURITY FIX #6: Whitelist de dominios permitidos para CORS
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://creador-inteligencias.vercel.app',
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

// ============================================================================
// PUBLIC ROUTES CONFIGURATION
// ============================================================================
// SECURITY FIX #5: Rutas públicas que no requieren autenticación
const publicRoutes = [
  "/login",
  "/api/auth/signin",
  "/api/auth/signout",
  "/api/auth/callback",
  "/api/auth/session",
  "/api/auth/providers",
  "/api/auth/csrf",
  "/api/webhooks/mercadopago",
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function getLocaleFromPathname(pathname: string): string | null {
  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return null;
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    // Coincidencia exacta
    if (pathname === route) return true;
    // Subruta válida
    if (pathname.startsWith(route + '/')) return true;

    // Verificar con prefijo de locale
    const pathWithoutLocale = getLocaleFromPathname(pathname)
      ? pathname.replace(/^\/[a-z]{2}/, '') || '/'
      : pathname;

    if (pathWithoutLocale === route) return true;
    if (pathWithoutLocale.startsWith(route + '/')) return true;

    return false;
  });
}

// ============================================================================
// MAIN MIDDLEWARE
// ============================================================================
export default async function middleware(req: any) {
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
  // HANDLE STATIC FILES AND API ROUTES
  // ============================================================================
  const excludedPaths = [
    '/_next',
    '/api',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/manifest.json',
    '/monitoring', // Sentry tunnel
  ];

  const isExcludedPath = excludedPaths.some(path => pathname.startsWith(path));

  // ============================================================================
  // HANDLE CORS PREFLIGHT
  // ============================================================================
  if (req.method === "OPTIONS") {
    log.debug('Handling OPTIONS preflight request');

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

  // ============================================================================
  // INTERNATIONALIZATION WITH NEXT-INTL
  // ============================================================================
  // Para rutas no excluidas, aplicar middleware de internacionalización
  let response: NextResponse;

  if (!isExcludedPath) {
    // Aplicar middleware de next-intl para manejo de locales
    const intlResponse = intlMiddleware(req);

    // Si next-intl devuelve una redirección, úsala
    if (intlResponse) {
      response = intlResponse;
    } else {
      response = NextResponse.next();
    }
  } else {
    response = NextResponse.next();
  }

  // ============================================================================
  // AUTHENTICATION CHECK
  // ============================================================================
  const isPublic = isPublicRoute(pathname);

  if (!isPublic && !isExcludedPath) {
    let isAuthenticated = false;
    let authMethod = 'none';

    // Verificar sesión NextAuth (web)
    if (req.auth) {
      log.info({
        userEmail: req.auth.user?.email,
        authMethod: 'NextAuth'
      }, 'NextAuth session found');
      isAuthenticated = true;
      authMethod = 'NextAuth';
    }
    // Verificar JWT token (mobile)
    else {
      const authHeader = req.headers.get('Authorization');
      const token = extractTokenFromHeader(authHeader);

      if (token) {
        const payload = await verifyToken(token);

        if (payload) {
          isAuthenticated = true;
          authMethod = 'JWT';
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

    // Redirigir a login si no está autenticado
    if (!isAuthenticated) {
      log.warn({ pathname }, 'Unauthorized access attempt - redirecting to login');
      const locale = getLocaleFromPathname(pathname) || defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      response = NextResponse.redirect(loginUrl);
    } else {
      log.info({ authMethod }, 'Request authorized');
    }
  } else {
    log.debug({ isPublic, isExcludedPath }, 'Public or excluded route - allowing without authentication');
  }

  // ============================================================================
  // ADD CORS HEADERS
  // ============================================================================
  if (origin && isOriginAllowed(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    log.debug({ origin }, 'CORS headers added for allowed origin');
  } else if (origin) {
    log.warn({ origin }, 'Origin not in whitelist - CORS headers not added');
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
     */
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/api/((?!auth).*)",
  ],
};
