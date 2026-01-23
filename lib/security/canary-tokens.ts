/**
 * Canary Tokens System
 *
 * Tokens trampa colocados estratégicamente en datos sensibles para detectar:
 * - Exfiltración de datos
 * - Acceso no autorizado a base de datos
 * - Scraping de datos
 * - Data leaks
 *
 * Tipos de canary tokens:
 * - API keys falsas
 * - Emails trampa
 * - URLs trampa
 * - Tokens de autenticación falsos
 * - Database queries trampa
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { nanoid } from 'nanoid';
import { sendAlert } from './alerting';

const prisma = new PrismaClient();

// ============================================================================
// TYPES
// ============================================================================

export type CanaryTokenType =
  | 'api_key'
  | 'email'
  | 'phone'
  | 'url'
  | 'auth_token'
  | 'database_query'
  | 'file_path'
  | 'credit_card'
  | 'ssh_key';

export interface CanaryTokenConfig {
  type: CanaryTokenType;
  description: string;
  placedIn: string;
  dataContext: any;
  alertEmails: string[];
  alertWebhook?: string;
}

// ============================================================================
// TOKEN GENERATION
// ============================================================================

/**
 * Genera un canary token convincente según el tipo
 */
export function generateCanaryToken(type: CanaryTokenType): string {
  switch (type) {
    case 'api_key':
      // Formato similar a claves reales: sk_live_...
      return `sk_live_${generateRandomString(32)}`;

    case 'email':
      // Email que parece legítimo
      return `admin.${generateRandomString(8)}@example.com`;

    case 'phone':
      // Número de teléfono falso pero válido
      return `+1-555-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

    case 'url':
      // URL trampa
      const token = generateRandomString(16);
      return `https://canary.example.com/t/${token}`;

    case 'auth_token':
      // JWT-like token
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({ sub: 'canary', exp: 9999999999 })).toString('base64');
      const signature = generateRandomString(43);
      return `${header}.${payload}.${signature}`;

    case 'database_query':
      // SQL query que parece sensible
      return `SELECT * FROM users WHERE role='admin' AND password='${generateRandomString(12)}'`;

    case 'file_path':
      // Path que parece sensible
      return `/var/backups/database_backup_${generateRandomString(8)}.sql`;

    case 'credit_card':
      // Número de tarjeta que pasa validación Luhn pero es falso
      return generateFakeCreditCard();

    case 'ssh_key':
      // SSH key falsa
      return `ssh-rsa ${generateRandomString(64)} canary@trap`;

    default:
      return generateRandomString(32);
  }
}

function generateRandomString(length: number): string {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
}

function generateFakeCreditCard(): string {
  // Genera un número que pasa Luhn algorithm pero es fake
  // Prefijo 4111 1111 1111 (Visa test card range)
  const base = '4111111111111';
  let sum = 0;
  let isEven = false;

  for (let i = base.length - 1; i >= 0; i--) {
    let digit = parseInt(base[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return `${base}${checkDigit}`;
}

// ============================================================================
// CANARY TOKEN CREATION
// ============================================================================

/**
 * Crea un nuevo canary token en la base de datos
 */
export async function createCanaryToken(config: CanaryTokenConfig): Promise<{
  id: string;
  tokenValue: string;
  tokenHash: string;
}> {
  try {
    const tokenValue = generateCanaryToken(config.type);
    const tokenHash = hashToken(tokenValue);

    const canaryToken = await prisma.canaryToken.create({
      data: {
        id: nanoid(),
        tokenType: config.type,
        tokenValue,
        tokenHash,
        description: config.description,
        placedIn: config.placedIn,
        dataContext: config.dataContext,
        alertEmails: config.alertEmails,
        alertWebhook: config.alertWebhook,
        isActive: true,
        triggered: false,
        triggerCount: 0,
        updatedAt: new Date(),
      },
    });

    console.log(`[CANARY] Created ${config.type} token: ${tokenValue.substring(0, 10)}...`);

    return {
      id: canaryToken.id,
      tokenValue,
      tokenHash,
    };
  } catch (error) {
    console.error('[CANARY] Error creating token:', error);
    throw error;
  }
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// ============================================================================
// TOKEN DETECTION & TRIGGERING
// ============================================================================

/**
 * Verifica si un valor es un canary token y lo activa si lo es
 */
export async function checkAndTriggerCanaryToken(
  value: string,
  context: {
    triggeredBy: string;
    ipAddress: string;
    userAgent: string;
    requestPath?: string;
    requestMethod?: string;
    headers?: Record<string, string>;
    contextData?: any;
  }
): Promise<boolean> {
  try {
    const tokenHash = hashToken(value);

    // Buscar el token
    const canaryToken = await prisma.canaryToken.findUnique({
      where: { tokenHash },
    });

    if (!canaryToken) {
      return false; // No es un canary token
    }

    if (!canaryToken.isActive) {
      console.log('[CANARY] Token found but is inactive');
      return false;
    }

    console.log(`[CANARY] 🚨 CANARY TOKEN TRIGGERED: ${canaryToken.tokenType} - ${canaryToken.description}`);

    // Registrar el trigger
    await prisma.canaryTokenTrigger.create({
      data: {
        id: nanoid(),
        canaryTokenId: canaryToken.id,
        triggeredBy: context.triggeredBy,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        requestPath: context.requestPath,
        requestMethod: context.requestMethod,
        headers: context.headers || {},
        contextData: context.contextData,
        fingerprint: null, // TODO: Obtener fingerprint si está disponible
        alertSent: false,
      },
    });

    // Actualizar contador
    await prisma.canaryToken.update({
      where: { id: canaryToken.id },
      data: {
        triggered: true,
        triggerCount: { increment: 1 },
        lastTriggered: new Date(),
      },
    });

    // Enviar alertas
    await sendCanaryAlert(canaryToken, context);

    return true;
  } catch (error) {
    console.error('[CANARY] Error checking token:', error);
    return false;
  }
}

/**
 * Middleware para verificar canary tokens en requests
 */
export async function canaryTokenMiddleware(request: Request): Promise<boolean> {
  try {
    const url = new URL(request.url);
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Extraer headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // 1. Verificar authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      const triggered = await checkAndTriggerCanaryToken(token, {
        triggeredBy: 'authorization_header',
        ipAddress,
        userAgent,
        requestPath: url.pathname,
        requestMethod: request.method,
        headers,
      });

      if (triggered) return true;
    }

    // 2. Verificar API key en headers
    const apiKey = request.headers.get('x-api-key') || request.headers.get('api-key');
    if (apiKey) {
      const triggered = await checkAndTriggerCanaryToken(apiKey, {
        triggeredBy: 'api_key_header',
        ipAddress,
        userAgent,
        requestPath: url.pathname,
        requestMethod: request.method,
        headers,
      });

      if (triggered) return true;
    }

    // 3. Verificar query parameters
    for (const [key, value] of url.searchParams.entries()) {
      if (key.toLowerCase().includes('token') || key.toLowerCase().includes('key') || key.toLowerCase().includes('api')) {
        const triggered = await checkAndTriggerCanaryToken(value, {
          triggeredBy: `query_param_${key}`,
          ipAddress,
          userAgent,
          requestPath: url.pathname,
          requestMethod: request.method,
          headers,
        });

        if (triggered) return true;
      }
    }

    // 4. Verificar body (solo para POST/PUT/PATCH)
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const bodyText = await request.clone().text();

        // Solo verificar si el body tiene tamaño razonable (< 1MB)
        if (bodyText.length < 1024 * 1024) {
          // Buscar patrones de tokens en el body
          const tokenPatterns = [
            /sk_live_[a-zA-Z0-9]{32}/g,
            /sk_test_[a-zA-Z0-9]{32}/g,
            /Bearer\s+([a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+)/g,
          ];

          for (const pattern of tokenPatterns) {
            const matches = bodyText.match(pattern);
            if (matches) {
              for (const match of matches) {
                const token = match.replace(/^Bearer\s+/i, '');
                const triggered = await checkAndTriggerCanaryToken(token, {
                  triggeredBy: 'request_body',
                  ipAddress,
                  userAgent,
                  requestPath: url.pathname,
                  requestMethod: request.method,
                  headers,
                  contextData: { bodySnippet: bodyText.substring(0, 500) },
                });

                if (triggered) return true;
              }
            }
          }
        }
      } catch {
        // Ignore body parsing errors
      }
    }

    return false;
  } catch (error) {
    console.error('[CANARY] Error in middleware:', error);
    return false;
  }
}

// ============================================================================
// ALERTING
// ============================================================================

/**
 * Envía alertas cuando se activa un canary token
 */
async function sendCanaryAlert(
  token: any,
  context: {
    triggeredBy: string;
    ipAddress: string;
    userAgent: string;
    requestPath?: string;
  }
): Promise<void> {
  try {
    const alertMessage = {
      severity: 'critical',
      title: `🚨 Canary Token Triggered: ${token.tokenType}`,
      description: `
A canary token has been triggered, indicating potential security breach!

Token Type: ${token.tokenType}
Description: ${token.description}
Placed In: ${token.placedIn}
Triggered By: ${context.triggeredBy}

Attacker Details:
- IP Address: ${context.ipAddress}
- User Agent: ${context.userAgent}
- Request Path: ${context.requestPath || 'N/A'}

This indicates that someone has accessed and potentially exfiltrated sensitive data.
Immediate action required!
      `.trim(),
      timestamp: new Date().toISOString(),
      actionable: true,
    };

    // Enviar a sistema de alertas
    await sendAlert({
      type: 'canary',
      severity: 'critical',
      title: alertMessage.title,
      description: alertMessage.description,
      channels: {
        email: token.alertEmails,
        webhook: token.alertWebhook,
        dashboard: true,
      },
    });

    console.log('[CANARY] Alert sent successfully');
  } catch (error) {
    console.error('[CANARY] Error sending alert:', error);

    // Log error pero no hacer throw para no interrumpir el flujo
    await prisma.canaryTokenTrigger.updateMany({
      where: {
        canaryTokenId: token.id,
        alertSent: false,
      },
      data: {
        alertError: String(error),
      },
    });
  }
}

// ============================================================================
// PRE-CONFIGURED CANARY TOKENS
// ============================================================================

/**
 * Crea set de canary tokens por defecto para la aplicación
 */
export async function setupDefaultCanaryTokens(): Promise<void> {
  const defaultTokens: CanaryTokenConfig[] = [
    {
      type: 'api_key',
      description: 'Fake Stripe API key in codebase comments',
      placedIn: 'Source code comments',
      dataContext: { location: 'lib/payment.ts' },
      alertEmails: ['security@example.com'],
    },
    {
      type: 'auth_token',
      description: 'Fake JWT token in database backup file',
      placedIn: 'Database backup documentation',
      dataContext: { location: 'docs/backup.md' },
      alertEmails: ['security@example.com'],
    },
    {
      type: 'email',
      description: 'Fake admin email in user list endpoint',
      placedIn: 'API response (fake data)',
      dataContext: { endpoint: '/api/internal/users' },
      alertEmails: ['security@example.com'],
    },
    {
      type: 'database_query',
      description: 'Suspicious SQL query in logs',
      placedIn: 'Application logs',
      dataContext: { location: 'logs/app.log' },
      alertEmails: ['security@example.com'],
    },
  ];

  for (const config of defaultTokens) {
    try {
      // Verificar si ya existe
      const existing = await prisma.canaryToken.findFirst({
        where: {
          description: config.description,
        },
      });

      if (!existing) {
        await createCanaryToken(config);
        console.log(`[CANARY] Created default token: ${config.description}`);
      }
    } catch (error) {
      console.error(`[CANARY] Error creating default token:`, error);
    }
  }
}

// ============================================================================
// CANARY TOKEN MANAGEMENT
// ============================================================================

/**
 * Lista todos los canary tokens
 */
export async function listCanaryTokens(): Promise<any[]> {
  try {
    return await prisma.canaryToken.findMany({
      include: {
        CanaryTokenTrigger: {
          orderBy: { triggeredAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('[CANARY] Error listing tokens:', error);
    throw error;
  }
}

/**
 * Desactiva un canary token
 */
export async function deactivateCanaryToken(tokenId: string): Promise<void> {
  try {
    await prisma.canaryToken.update({
      where: { id: tokenId },
      data: { isActive: false },
    });

    console.log(`[CANARY] Token ${tokenId} deactivated`);
  } catch (error) {
    console.error('[CANARY] Error deactivating token:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de canary tokens
 */
export async function getCanaryStats(timeRange: { from: Date; to: Date }) {
  try {
    const triggers = await prisma.canaryTokenTrigger.findMany({
      where: {
        triggeredAt: {
          gte: timeRange.from,
          lte: timeRange.to,
        },
      },
      include: {
        CanaryToken: {
          select: {
            tokenType: true,
            description: true,
          },
        },
      },
    });

    const byType: Record<string, number> = {};
    const uniqueIPs = new Set<string>();

    for (const trigger of triggers) {
      const type = trigger.CanaryToken.tokenType;
      byType[type] = (byType[type] || 0) + 1;
      uniqueIPs.add(trigger.ipAddress);
    }

    return {
      totalTriggers: triggers.length,
      byType,
      uniqueAttackers: uniqueIPs.size,
    };
  } catch (error) {
    console.error('[CANARY] Error getting stats:', error);
    throw error;
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

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
