/**
 * Security System Integration Examples
 *
 * Ejemplos de cómo integrar el sistema de seguridad en diferentes partes de la aplicación
 */

// ============================================================================
// EJEMPLO 1: Integración en el Middleware Principal
// ============================================================================

// File: middleware.ts
/*
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { securityMiddleware, SecurityPresets } from "@/lib/security";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ========================================================================
  // SECURITY LAYER - Aplicar primero antes de cualquier otra lógica
  // ========================================================================

  // 1. Honeypots (todas las rutas)
  // Los honeypots se activan automáticamente si la ruta coincide
  // No necesitas hacer nada especial aquí

  // 2. API Routes con seguridad diferenciada
  if (pathname.startsWith('/api/')) {
    // API pública (menos restrictiva)
    if (pathname.startsWith('/api/community') || pathname.startsWith('/api/groups')) {
      return securityMiddleware(
        req,
        async () => NextResponse.next(),
        SecurityPresets.publicAPI
      );
    }

    // API privada/admin (muy restrictiva)
    if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/internal')) {
      return securityMiddleware(
        req,
        async () => NextResponse.next(),
        SecurityPresets.privateAPI
      );
    }

    // API de autenticación (detectar brute force)
    if (pathname.startsWith('/api/auth')) {
      return securityMiddleware(
        req,
        async () => NextResponse.next(),
        SecurityPresets.authentication
      );
    }

    // API general (seguridad estándar)
    return securityMiddleware(
      req,
      async () => NextResponse.next(),
      {
        enableFingerprinting: true,
        enableThreatDetection: true,
        enableCanaryTokens: true,
        autoBlock: true,
        autoBlockThreshold: 70,
      }
    );
  }

  // ========================================================================
  // TU LÓGICA DE MIDDLEWARE EXISTENTE
  // ========================================================================

  // Rutas públicas
  const publicRoutes = ["/", "/login", "/registro", "/dashboard", "/community"];

  const isPublicRoute = publicRoutes.some(route => {
    if (pathname === route) return true;
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verificar autenticación
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user?.id) {
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    "/api/(.*)",
  ],
  runtime: 'nodejs',
};
*/

// ============================================================================
// EJEMPLO 2: Proteger Route Handler Específico
// ============================================================================

// File: app/api/users/route.ts
/*
import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, SecurityPresets } from '@/lib/security';

// Opción 1: Con preset
export const GET = withSecurity(async (request: NextRequest) => {
  // Tu lógica aquí
  const users = await prisma.user.findMany();
  return NextResponse.json({ users });
}, SecurityPresets.privateAPI);

// Opción 2: Con configuración personalizada
export const POST = withSecurity(async (request: NextRequest) => {
  const body = await request.json();
  // Tu lógica aquí
  return NextResponse.json({ success: true });
}, {
  enableFingerprinting: true,
  enableThreatDetection: true,
  enableTarpit: true,
  autoBlock: true,
  autoBlockThreshold: 60,
});
*/

// ============================================================================
// EJEMPLO 3: Detección de Brute Force en Login
// ============================================================================

// File: app/api/auth/login/route.ts
/*
import { NextRequest, NextResponse } from 'next/server';
import { withSecurity, SecurityPresets } from '@/lib/security';
import { detectBruteForce, logThreat } from '@/lib/security';
import { sendAlert, AlertTemplates } from '@/lib/security';

export const POST = withSecurity(async (request: NextRequest) => {
  const { email, password } = await request.json();

  // Obtener IP del cliente
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Verificar brute force ANTES de intentar login
  const bruteForceCheck = await detectBruteForce(ipAddress, '/api/auth/login', 5);

  if (bruteForceCheck.isBruteForce) {
    // Enviar alerta
    await sendAlert(
      AlertTemplates.bruteForceDetected(
        ipAddress,
        '/api/auth/login',
        bruteForceCheck.attempts
      )
    );

    return NextResponse.json(
      { error: 'Too many login attempts. Try again later.' },
      { status: 429 }
    );
  }

  // Intentar autenticación
  const user = await authenticateUser(email, password);

  if (!user) {
    // Login fallido - registrar como threat
    await logThreat(request, {
      threatType: 'failed_login',
      severity: 'low',
      confidence: 0.5,
      attackVector: 'Invalid credentials',
      indicators: { email, ipAddress },
    });

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  // Login exitoso
  return NextResponse.json({ user, token: generateToken(user) });
}, SecurityPresets.authentication);
*/

// ============================================================================
// EJEMPLO 4: Crear Honeypot Personalizado
// ============================================================================

// File: app/api/admin/debug/route.ts (HONEYPOT)
/*
import { NextRequest } from 'next/server';
import { handleHoneypotRequest, createDynamicHoneypot } from '@/lib/security';

// Registrar honeypot dinámico
createDynamicHoneypot({
  path: '/api/admin/debug',
  name: 'Admin Debug Panel',
  type: 'fake_api',
  description: 'Fake admin debug endpoint with sensitive data',
  fakeResponse: {
    environment: 'production',
    database: {
      host: 'fake-db.example.com',
      user: 'admin',
      password: 'fake-password-123',
    },
    apiKeys: {
      stripe: 'sk_live_fake_12345',
      openai: 'sk-fake-67890',
    },
  },
  shouldTarpit: true,
  tarpitDelay: 10000, // 10 segundos
  autoBlock: true,
});

// El handler simplemente delega al sistema de honeypots
export async function GET(request: NextRequest) {
  const response = await handleHoneypotRequest(request);
  return response || new Response('Not Found', { status: 404 });
}
*/

// ============================================================================
// EJEMPLO 5: Crear y Verificar Canary Token
// ============================================================================

// Setup inicial (una vez)
/*
import { createCanaryToken } from '@/lib/security';

await createCanaryToken({
  type: 'api_key',
  description: 'Fake Stripe key in code comments',
  placedIn: 'lib/payment.ts comment',
  dataContext: { file: 'lib/payment.ts', line: 42 },
  alertEmails: ['security@example.com'],
  alertWebhook: process.env.SLACK_WEBHOOK_URL,
});
*/

// Verificación automática (ya está en el middleware)
/*
// El middleware canaryTokenMiddleware verifica automáticamente:
// - Authorization headers
// - API key headers
// - Query parameters con "token" o "key"
// - Request body (solo POST/PUT/PATCH)

// No necesitas hacer nada adicional, ya está integrado en securityMiddleware
*/

// ============================================================================
// EJEMPLO 6: Enviar Alertas Personalizadas
// ============================================================================

// En cualquier parte de tu código
/*
import { sendAlert } from '@/lib/security';

// Alerta personalizada
await sendAlert({
  type: 'real_time',
  severity: 'high',
  title: 'Suspicious Data Export',
  description: `User ${userId} exported large dataset\n\nSize: 10GB\nRecords: 1M`,
  channels: {
    email: ['security@example.com'],
    webhook: process.env.SLACK_WEBHOOK_URL,
    dashboard: true,
  },
  metadata: {
    userId,
    exportSize: '10GB',
    recordCount: 1000000,
  },
});

// O usar templates predefinidos
import { AlertTemplates } from '@/lib/security';

await sendAlert(
  AlertTemplates.suspiciousActivity(ipAddress, threatScore)
);
*/

// ============================================================================
// EJEMPLO 7: Monitoreo Proactivo
// ============================================================================

// Cron job diario para enviar resumen
// File: scripts/cron-security-digest.ts
/*
import { sendDailySecurityDigest } from '@/lib/security';

async function main() {
  console.log('Sending daily security digest...');
  await sendDailySecurityDigest();
  console.log('Done!');
}

main().catch(console.error);
*/

// ============================================================================
// EJEMPLO 8: Consultar Estadísticas
// ============================================================================

/*
import {
  getAlertStats,
  getThreatStats,
  getHoneypotStats,
  getTarpitStats,
  getCanaryStats,
} from '@/lib/security';

// Último día
const timeRange = {
  from: new Date(Date.now() - 24 * 60 * 60 * 1000),
  to: new Date(),
};

const [alerts, threats, honeypots, tarpit, canary] = await Promise.all([
  getAlertStats(timeRange),
  getThreatStats(timeRange),
  getHoneypotStats(timeRange),
  getTarpitStats(timeRange),
  getCanaryStats(timeRange),
]);

console.log('Security Stats:', {
  alerts: alerts.total,
  threats: threats.total,
  honeypotHits: honeypots.totalHits,
  canaryTriggers: canary.totalTriggers,
  tarpitDelay: tarpit.totalDelayMinutes + ' minutes',
});
*/

// ============================================================================
// EJEMPLO 9: Quick Setup Helpers
// ============================================================================

/*
import { quickSetup } from '@/lib/security';

// Proteger API pública
export const GET = quickSetup.publicAPI(async (request) => {
  return NextResponse.json({ data: 'public' });
});

// Proteger API privada
export const POST = quickSetup.privateAPI(async (request) => {
  return NextResponse.json({ data: 'private' });
});

// Proteger autenticación
export const POST = quickSetup.auth(async (request) => {
  return NextResponse.json({ token: '...' });
});
*/

export {};
