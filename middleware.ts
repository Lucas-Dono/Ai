import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/lib/jwt";

export default auth(async (req) => {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin");

  console.log(`\n[MIDDLEWARE] === ${req.method} ${pathname} ===`);

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/login", "/api/auth"];

  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  console.log(`[MIDDLEWARE] Public route: ${isPublicRoute}`);

  // Manejar preflight requests (OPTIONS) para CORS
  if (req.method === "OPTIONS") {
    console.log(`[MIDDLEWARE] OPTIONS preflight - allowing`);
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  let response: NextResponse;

  // Si es ruta pública, permitir acceso
  if (isPublicRoute) {
    console.log(`[MIDDLEWARE] Public route - allowing without auth`);
    response = NextResponse.next();
  }
  // Verificar autenticación: NextAuth (web) o JWT (mobile)
  else {
    let isAuthenticated = false;
    let authMethod = 'none';

    // Primero verificar sesión NextAuth (web)
    if (req.auth) {
      console.log(`[MIDDLEWARE] ✅ NextAuth session found:`, req.auth.user?.email);
      isAuthenticated = true;
      authMethod = 'NextAuth';
    }
    // Si no hay sesión web, verificar JWT token (mobile)
    else {
      const authHeader = req.headers.get('Authorization');
      console.log(`[MIDDLEWARE] Authorization header:`, authHeader ? `${authHeader.substring(0, 30)}...` : 'MISSING');

      const token = extractTokenFromHeader(authHeader);
      console.log(`[MIDDLEWARE] Extracted token:`, token ? `${token.substring(0, 30)}...` : 'NONE');

      if (token) {
        const payload = await verifyToken(token);
        console.log(`[MIDDLEWARE] Token payload:`, payload ? `userId: ${payload.userId}, email: ${payload.email}` : 'INVALID');

        if (payload) {
          isAuthenticated = true;
          authMethod = 'JWT';
          // Agregar payload al request para que las rutas puedan usarlo
          (req as any).jwtPayload = payload;
          console.log(`[MIDDLEWARE] ✅ JWT token valid for user: ${payload.email}`);
        } else {
          console.log(`[MIDDLEWARE] ❌ JWT token verification failed`);
        }
      } else {
        console.log(`[MIDDLEWARE] ❌ No JWT token found in header`);
      }
    }

    // Si no está autenticado por ningún método, redirigir a login
    if (!isAuthenticated) {
      console.log(`[MIDDLEWARE] ❌ UNAUTHORIZED - Redirecting to login`);
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      response = NextResponse.redirect(loginUrl);
    } else {
      console.log(`[MIDDLEWARE] ✅ AUTHORIZED via ${authMethod} - Allowing request`);
      response = NextResponse.next();
    }
  }

  // Agregar headers CORS a todas las respuestas
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Credentials", "true");
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
     */
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/api/((?!auth).*)",
  ],
  // No especificamos runtime - usa Edge Runtime por defecto (más rápido)
  // Ahora funciona porque usamos 'jose' en lugar de 'jsonwebtoken'
};
