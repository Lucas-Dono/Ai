/**
 * Middleware de Validación para API Admin
 * Verifica certificados mTLS + roles + audit logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface AdminContext {
  adminAccessId: string;
  userId: string;
  email: string;
  role: string;
  certificateSerial: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Error de autenticación admin
 */
export class AdminAuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 403,
    public logReason?: string
  ) {
    super(message);
    this.name = 'AdminAuthError';
  }
}

/**
 * Valida certificado mTLS y permisos admin
 *
 * Este middleware debe usarse en TODAS las rutas /api/admin-secure/*
 *
 * @param request - NextRequest
 * @returns AdminContext con información del admin autenticado
 * @throws AdminAuthError si la autenticación falla
 */
export async function validateAdminAccess(
  request: NextRequest
): Promise<AdminContext> {
  try {
    // MODO DESARROLLO: Permitir testing sin NGINX
    const isDevelopment = process.env.NODE_ENV === 'development';
    const devAdminEmail = request.headers.get('x-dev-admin-email');

    let certSerial: string | null;
    let certFingerprint: string | null;
    let certificate: any;

    if (isDevelopment && devAdminEmail) {
      // En desarrollo, buscar el certificado activo más reciente del admin
      console.log(`[DEV MODE] Buscando certificado activo para ${devAdminEmail}`);

      const adminAccess = await prisma.adminAccess.findFirst({
        where: {
          user: { email: devAdminEmail },
          enabled: true
        },
        include: {
          certificates: {
            where: {
              revokedAt: null,
              expiresAt: { gt: new Date() }
            },
            orderBy: { issuedAt: 'desc' },
            take: 1,
            include: {
              adminAccess: {
                include: {
                  user: {
                    select: { id: true, email: true, name: true }
                  }
                }
              }
            }
          }
        }
      });

      if (!adminAccess || adminAccess.certificates.length === 0) {
        throw new AdminAuthError(
          'No hay certificado activo para este admin',
          401,
          'no_active_certificate'
        );
      }

      certificate = adminAccess.certificates[0];
      certSerial = certificate.serialNumber;
      certFingerprint = certificate.fingerprint;

      console.log(`[DEV MODE] Usando certificado: ${certSerial?.substring(0, 16)}...`);
    } else {
      // MODO PRODUCCIÓN: Obtener headers del certificado cliente (inyectados por NGINX)
      certSerial = request.headers.get('x-client-cert-serial');
      certFingerprint = request.headers.get('x-client-cert-fingerprint');
      const certVerify = request.headers.get('x-client-cert-verify');

      // Validar que NGINX inyectó los headers
      if (!certSerial || !certFingerprint || certVerify !== 'SUCCESS') {
        throw new AdminAuthError(
          'Certificado cliente no válido o no presente',
          401,
          'missing_certificate'
        );
      }
    }

    // 2. Buscar certificado en BD (si no se buscó ya en modo desarrollo)
    if (!certificate) {
      certificate = await prisma.adminCertificate.findUnique({
        where: { serialNumber: certSerial! },
        include: {
          adminAccess: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true
                }
              }
            }
          }
        }
      });

      if (!certificate) {
        throw new AdminAuthError(
          'Certificado no encontrado',
          403,
          'certificate_not_found'
        );
      }
    }

    // 3. Verificar que el certificado no está revocado
    if (certificate.revokedAt) {
      throw new AdminAuthError(
        `Certificado revocado: ${certificate.revokedReason || 'unknown'}`,
        403,
        'certificate_revoked'
      );
    }

    // 4. Verificar que el certificado no ha expirado
    if (certificate.expiresAt < new Date()) {
      throw new AdminAuthError(
        'Certificado expirado',
        403,
        'certificate_expired'
      );
    }

    // 5. Verificar que el fingerprint coincide (doble verificación en producción)
    if (!isDevelopment && certFingerprint) {
      if (certificate.fingerprint !== certFingerprint.replace(/:/g, '')) {
        throw new AdminAuthError(
          'Fingerprint de certificado no coincide',
          403,
          'fingerprint_mismatch'
        );
      }
    }

    // 6. Verificar que AdminAccess está habilitado
    if (!certificate.adminAccess.enabled) {
      throw new AdminAuthError(
        'Acceso admin deshabilitado',
        403,
        'admin_access_disabled'
      );
    }

    // 7. Obtener IP y User Agent
    const ipAddress = request.headers.get('x-real-ip')
      || request.headers.get('x-forwarded-for')?.split(',')[0]
      || 'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 8. Actualizar último login
    await prisma.adminAccess.update({
      where: { id: certificate.adminAccess.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
        lastLoginUserAgent: userAgent
      }
    });

    // 9. Retornar contexto admin
    return {
      adminAccessId: certificate.adminAccess.id,
      userId: certificate.adminAccess.userId,
      email: certificate.adminAccess.user.email,
      role: certificate.adminAccess.role,
      certificateSerial: certSerial || '',
      ipAddress,
      userAgent
    };

  } catch (error) {
    // Si es un error de autenticación, propagarlo
    if (error instanceof AdminAuthError) {
      throw error;
    }

    // Error inesperado
    console.error('Error validando acceso admin:', error);
    throw new AdminAuthError(
      'Error interno validando acceso',
      500,
      'internal_error'
    );
  }
}

/**
 * Wrapper para endpoints admin que maneja autenticación y errores
 *
 * Uso:
 * ```ts
 * export const GET = withAdminAuth(async (request, context) => {
 *   // context.admin contiene AdminContext
 *   // Tu lógica aquí
 *   return NextResponse.json({ data: '...' });
 * });
 * ```
 */
export function withAdminAuth(
  handler: (
    request: NextRequest,
    context: { admin: AdminContext; params?: any }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, routeContext?: { params: any }) => {
    try {
      // Validar acceso admin
      const admin = await validateAdminAccess(request);

      // Ejecutar handler con contexto
      return await handler(request, {
        admin,
        params: routeContext?.params
      });

    } catch (error) {
      // Manejar errores de autenticación
      if (error instanceof AdminAuthError) {
        // Log de intento fallido
        try {
          const ipAddress = request.headers.get('x-real-ip') || 'unknown';
          const userAgent = request.headers.get('user-agent') || 'unknown';

          await prisma.auditLog.create({
            data: {
              adminAccessId: 'system',
              action: 'admin.access_denied',
              targetType: 'AdminAccess',
              ipAddress,
              userAgent,
              details: {
                reason: error.logReason,
                message: error.message,
                path: request.nextUrl.pathname
              }
            }
          });
        } catch (logError) {
          console.error('Error logging failed access:', logError);
        }

        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }

      // Error inesperado
      console.error('Unexpected error in admin endpoint:', error);
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      );
    }
  };
}

/**
 * Verifica que el admin tiene un rol específico
 */
export function requireRole(admin: AdminContext, requiredRole: string): void {
  if (admin.role !== requiredRole && admin.role !== 'admin') {
    throw new AdminAuthError(
      `Requiere rol: ${requiredRole}`,
      403,
      'insufficient_role'
    );
  }
}

/**
 * Verifica que el admin tiene uno de varios roles
 */
export function requireAnyRole(admin: AdminContext, roles: string[]): void {
  if (!roles.includes(admin.role) && admin.role !== 'admin') {
    throw new AdminAuthError(
      `Requiere uno de los roles: ${roles.join(', ')}`,
      403,
      'insufficient_role'
    );
  }
}
