/**
 * Honeypot System
 *
 * Endpoints trampa que parecen reales pero están diseñados para detectar atacantes
 *
 * Tipos de honeypots:
 * - Admin panels falsos (/admin, /wp-admin, /phpmyadmin)
 * - APIs falsas (/api/internal, /api/debug, /api/users/all)
 * - Archivos de configuración (/config.php, /.env, /database.yml)
 * - Endpoints de upload falsos
 * - Endpoints de autenticación débiles
 */

import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import { fingerprintRequest } from './fingerprinting';
import { detectScanningTools } from './threat-detection';

const prisma = new PrismaClient();

// ============================================================================
// HONEYPOT CONFIGURATION
// ============================================================================

export interface HoneypotConfig {
  path: string;
  name: string;
  type: string;
  description: string;
  fakeResponse: any;
  shouldTarpit: boolean;
  tarpitDelay: number; // ms
  autoBlock: boolean;
}

/**
 * Configuración de honeypots predefinidos
 */
export const HONEYPOT_CONFIGS: HoneypotConfig[] = [
  // Admin panels
  {
    path: '/admin',
    name: 'Fake Admin Panel',
    type: 'fake_admin',
    description: 'Admin panel falso para detectar escaneos de directorios',
    fakeResponse: {
      title: 'Admin Login',
      message: 'Please enter your credentials',
      version: '1.0.0',
    },
    shouldTarpit: true,
    tarpitDelay: 5000,
    autoBlock: false,
  },
  {
    path: '/wp-admin',
    name: 'Fake WordPress Admin',
    type: 'fake_admin',
    description: 'WordPress admin falso (la app no usa WordPress)',
    fakeResponse: {
      message: 'WordPress Login',
      redirect_to: '/wp-admin/admin.php',
    },
    shouldTarpit: true,
    tarpitDelay: 8000,
    autoBlock: true, // Alto confidence de ataque
  },
  {
    path: '/phpmyadmin',
    name: 'Fake PHPMyAdmin',
    type: 'fake_database',
    description: 'PHPMyAdmin falso',
    fakeResponse: {
      phpMyAdmin: '4.9.0.1',
      serverVersion: '5.7.28',
    },
    shouldTarpit: true,
    tarpitDelay: 10000,
    autoBlock: true,
  },

  // APIs internas falsas
  {
    path: '/api/internal/users',
    name: 'Fake Internal API',
    type: 'fake_api',
    description: 'API interna falsa con datos de usuarios',
    fakeResponse: {
      users: [
        {
          id: 'fake-user-1',
          email: 'admin@example.com',
          apiKey: 'fake-key-12345',
          role: 'admin',
        },
        {
          id: 'fake-user-2',
          email: 'developer@example.com',
          apiKey: 'fake-key-67890',
          role: 'developer',
        },
      ],
      total: 2,
    },
    shouldTarpit: true,
    tarpitDelay: 3000,
    autoBlock: true,
  },
  {
    path: '/api/debug',
    name: 'Fake Debug Endpoint',
    type: 'fake_api',
    description: 'Endpoint de debug falso con información sensible',
    fakeResponse: {
      environment: 'production',
      database: {
        host: 'fake-db.example.com',
        username: 'root',
        password: 'fake-password-123',
      },
      secrets: {
        jwtSecret: 'fake-secret-key',
        apiKey: 'fake-api-key',
      },
    },
    shouldTarpit: true,
    tarpitDelay: 2000,
    autoBlock: true,
  },
  {
    path: '/api/v1/admin/export',
    name: 'Fake Data Export',
    type: 'fake_api',
    description: 'Endpoint de exportación falso',
    fakeResponse: {
      status: 'processing',
      exportId: 'fake-export-123',
      downloadUrl: '/downloads/export-fake-123.zip',
    },
    shouldTarpit: true,
    tarpitDelay: 5000,
    autoBlock: false,
  },

  // Archivos de configuración
  {
    path: '/.env',
    name: 'Fake Environment File',
    type: 'fake_config',
    description: 'Archivo .env falso',
    fakeResponse: `DATABASE_URL=postgresql://admin:fake-password@db.example.com:5432/mydb
NEXTAUTH_SECRET=fake-secret-key-12345
API_KEY=fake-api-key-67890
STRIPE_SECRET_KEY=sk_test_fake123456789`,
    shouldTarpit: true,
    tarpitDelay: 1000,
    autoBlock: true,
  },
  {
    path: '/config.json',
    name: 'Fake Config JSON',
    type: 'fake_config',
    description: 'Archivo de configuración JSON falso',
    fakeResponse: {
      database: {
        host: 'localhost',
        user: 'admin',
        password: 'fake-db-password',
      },
      api: {
        key: 'fake-api-key',
        secret: 'fake-api-secret',
      },
    },
    shouldTarpit: true,
    tarpitDelay: 2000,
    autoBlock: true,
  },
  {
    path: '/.git/config',
    name: 'Fake Git Config',
    type: 'fake_config',
    description: 'Git config falso',
    fakeResponse: `[core]
  repositoryformatversion = 0
  filemode = true
[remote "origin"]
  url = https://github.com/fake/repo.git
  fetch = +refs/heads/*:refs/remotes/origin/*
[user]
  email = admin@example.com`,
    shouldTarpit: true,
    tarpitDelay: 1000,
    autoBlock: true,
  },

  // Endpoints de upload
  {
    path: '/api/upload/unrestricted',
    name: 'Fake Unrestricted Upload',
    type: 'fake_upload',
    description: 'Endpoint de upload sin restricciones (falso)',
    fakeResponse: {
      success: true,
      fileUrl: 'https://cdn.example.com/uploads/fake-file.php',
      message: 'File uploaded successfully',
    },
    shouldTarpit: true,
    tarpitDelay: 4000,
    autoBlock: true,
  },

  // Endpoints de autenticación débiles
  {
    path: '/api/auth/test',
    name: 'Fake Test Auth',
    type: 'fake_auth',
    description: 'Endpoint de autenticación de prueba',
    fakeResponse: {
      token: 'fake-jwt-token-12345',
      user: {
        id: 'test-user',
        email: 'test@example.com',
        role: 'admin',
      },
    },
    shouldTarpit: true,
    tarpitDelay: 3000,
    autoBlock: false,
  },
];

// ============================================================================
// HONEYPOT HIT LOGGING
// ============================================================================

/**
 * Registra un hit a un honeypot
 */
export async function logHoneypotHit(
  request: Request,
  config: HoneypotConfig,
  fingerprintId?: string
): Promise<void> {
  try {
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const url = new URL(request.url);

    // Detect scanning tools
    const scanningTools = detectScanningTools(userAgent, request.headers);
    const isAutomated = scanningTools.length > 0 || isLikelyBot(userAgent);

    // Extraer headers relevantes
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Extraer query y payload
    const query = url.search;
    let payload: string | undefined;

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const body = await request.clone().text();
        payload = body.substring(0, 10000); // Limitar tamaño
      } catch {
        // Ignore if body is already consumed
      }
    }

    await prisma.honeypotHit.create({
      data: {
        id: nanoid(),
        fingerprintId: fingerprintId || null,
        honeypotType: config.type,
        honeypotPath: config.path,
        honeypotName: config.name,
        method: request.method,
        query: query || null,
        payload: payload || null,
        headers,
        ipAddress,
        userAgent,
        isAutomated,
        scanningTools,
        fakeData: config.fakeResponse,
        tarpitDelay: config.shouldTarpit ? config.tarpitDelay : 0,
      },
    });

    // Increment honeypot hit counter en fingerprint
    if (fingerprintId) {
      await prisma.clientFingerprint.update({
        where: { id: fingerprintId },
        data: {
          honeypotHits: { increment: 1 },
        },
      });
    }

    console.log(`[HONEYPOT] Hit detected: ${config.name} from ${ipAddress}`);
  } catch (error) {
    console.error('[HONEYPOT] Error logging honeypot hit:', error);
  }
}

// ============================================================================
// HONEYPOT RESPONSE GENERATION
// ============================================================================

/**
 * Genera una respuesta de honeypot con tarpit opcional
 */
export async function generateHoneypotResponse(
  request: Request,
  config: HoneypotConfig,
  options: {
    fingerprintId?: string;
    shouldBlock?: boolean;
  } = {}
): Promise<Response> {
  // Log the hit
  await logHoneypotHit(request, config, options.fingerprintId);

  // Si debe bloquear, retornar 403
  if (options.shouldBlock || config.autoBlock) {
    return new Response(
      JSON.stringify({
        error: 'Forbidden',
        message: 'Access denied',
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Aplicar tarpit si está configurado
  if (config.shouldTarpit) {
    await sleep(config.tarpitDelay);
  }

  // Determinar content type
  const isTextResponse = typeof config.fakeResponse === 'string';
  const contentType = isTextResponse ? 'text/plain' : 'application/json';

  // Retornar respuesta falsa
  return new Response(
    isTextResponse
      ? config.fakeResponse
      : JSON.stringify(config.fakeResponse, null, 2),
    {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'X-Powered-By': 'PHP/7.4.3', // Fake header para hacer más convincente
        'Server': 'Apache/2.4.41', // Fake server header
      },
    }
  );
}

// ============================================================================
// HONEYPOT ROUTE HANDLER
// ============================================================================

/**
 * Handler principal para rutas de honeypot
 */
export async function handleHoneypotRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Buscar configuración de honeypot que coincida
  const config = HONEYPOT_CONFIGS.find(h => h.path === pathname);

  if (!config) {
    return null; // No es un honeypot
  }

  console.log(`[HONEYPOT] Request to honeypot: ${pathname}`);

  // Fingerprint del cliente
  let fingerprintId: string | undefined;
  try {
    const { dbRecord } = await fingerprintRequest(request, {
      includeGeolocation: false, // Skip para honeypots (performance)
      includeReputation: false,
    });
    fingerprintId = dbRecord.id;
  } catch (error) {
    console.error('[HONEYPOT] Error fingerprinting request:', error);
  }

  // Generar respuesta
  return generateHoneypotResponse(request, config, {
    fingerprintId,
    shouldBlock: false, // Dejar que el config.autoBlock decida
  });
}

// ============================================================================
// DYNAMIC HONEYPOTS
// ============================================================================

/**
 * Crea un honeypot dinámico personalizado
 */
export function createDynamicHoneypot(config: HoneypotConfig): void {
  HONEYPOT_CONFIGS.push(config);
  console.log(`[HONEYPOT] Dynamic honeypot created: ${config.path}`);
}

/**
 * Genera honeypots basados en paths comúnmente escaneados
 */
export function generateCommonHoneypots(): HoneypotConfig[] {
  const commonPaths = [
    '/api/v1/users',
    '/api/admin',
    '/backup',
    '/backup.sql',
    '/db.sql',
    '/dump.sql',
    '/database.sql',
    '/config.php',
    '/settings.php',
    '/admin.php',
    '/test.php',
    '/shell.php',
    '/upload.php',
    '/login.php',
    '/administrator',
    '/manager',
    '/webdav',
    '/.svn',
    '/.hg',
    '/api/keys',
    '/api/secrets',
  ];

  return commonPaths.map(path => ({
    path,
    name: `Dynamic Honeypot: ${path}`,
    type: 'fake_api',
    description: `Auto-generated honeypot for ${path}`,
    fakeResponse: {
      error: 'Not found',
      path,
    },
    shouldTarpit: true,
    tarpitDelay: 3000,
    autoBlock: true,
  }));
}

// ============================================================================
// HONEYPOT STATISTICS
// ============================================================================

/**
 * Obtiene estadísticas de honeypots
 */
export async function getHoneypotStats(timeRange: {
  from: Date;
  to: Date;
}): Promise<{
  totalHits: number;
  hitsByType: Record<string, number>;
  hitsByHoneypot: Record<string, number>;
  uniqueIPs: number;
  automatedHits: number;
  topAttackers: Array<{ ipAddress: string; hits: number }>;
}> {
  try {
    const hits = await prisma.honeypotHit.findMany({
      where: {
        createdAt: {
          gte: timeRange.from,
          lte: timeRange.to,
        },
      },
      select: {
        honeypotType: true,
        honeypotName: true,
        ipAddress: true,
        isAutomated: true,
      },
    });

    const hitsByType: Record<string, number> = {};
    const hitsByHoneypot: Record<string, number> = {};
    const ips = new Set<string>();
    let automatedHits = 0;
    const attackerCounts: Record<string, number> = {};

    for (const hit of hits) {
      // By type
      hitsByType[hit.honeypotType] = (hitsByType[hit.honeypotType] || 0) + 1;

      // By honeypot
      hitsByHoneypot[hit.honeypotName] = (hitsByHoneypot[hit.honeypotName] || 0) + 1;

      // Unique IPs
      ips.add(hit.ipAddress);

      // Automated hits
      if (hit.isAutomated) {
        automatedHits++;
      }

      // Attacker counts
      attackerCounts[hit.ipAddress] = (attackerCounts[hit.ipAddress] || 0) + 1;
    }

    const topAttackers = Object.entries(attackerCounts)
      .map(([ipAddress, hits]) => ({ ipAddress, hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    return {
      totalHits: hits.length,
      hitsByType,
      hitsByHoneypot,
      uniqueIPs: ips.size,
      automatedHits,
      topAttackers,
    };
  } catch (error) {
    console.error('[HONEYPOT] Error getting stats:', error);
    throw error;
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getClientIp(request: Request): string {
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'dev-ip';
}

function isLikelyBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  const botPatterns = [
    'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
    'python', 'go-http', 'java/', 'okhttp'
  ];

  return botPatterns.some(pattern => ua.includes(pattern));
}
