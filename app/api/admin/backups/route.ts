/**
 * Admin Backups API
 *
 * Endpoints para gestionar backups desde el dashboard de admin.
 *
 * SEGURIDAD:
 * - Requiere autenticación de admin
 * - Solo accesible para usuarios con role "ADMIN"
 *
 * ENDPOINTS:
 * - GET: Lista todos los backups disponibles
 * - POST: Crea un nuevo backup manualmente
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from "@/lib/auth-server";
import { DatabaseBackupService } from '@/lib/services/database-backup.service';
import { createLogger } from '@/lib/logging/logger';
import { prisma } from '@/lib/prisma';

const log = createLogger('AdminBackups');

// Helper: Verificar autenticación de admin
async function verifyAdminAuth(req: NextRequest) {
  const user = await getAuthenticatedUser(req);

  if (!user?.email) {
    return { authorized: false, error: 'Unauthorized' };
  }

  // Verificar que el usuario existe
  const user = await prisma.user.findUnique({
    where: { email: user.email },
    select: { id: true, email: true },
  });

  if (!user) {
    return { authorized: false, error: 'User not found' };
  }

  // TODO: Add proper admin role check when role field is added to User model
  // For now, only allow specific admin emails
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  if (!adminEmails.includes(user.email)) {
    return { authorized: false, error: 'Forbidden - Admin access required' };
  }

  return { authorized: true, userId: user.id };
}

/**
 * GET /api/admin/backups
 * Lista todos los backups disponibles
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    log.info({ userId: auth.userId }, 'Admin listing backups');

    const [stats, backups] = await Promise.all([
      DatabaseBackupService.getBackupStats(),
      DatabaseBackupService.listBackups(),
    ]);

    // Formatear datos para UI
    const formattedBackups = backups.map(backup => ({
      id: backup.key,
      filename: backup.key.replace('postgres-backups/', ''),
      size: backup.size,
      sizeFormatted: formatBytes(backup.size),
      createdAt: backup.lastModified.toISOString(),
      age: getAge(backup.lastModified),
    }));

    return NextResponse.json({
      success: true,
      stats: {
        total: stats.totalBackups,
        totalSize: stats.totalSize,
        totalSizeFormatted: formatBytes(stats.totalSize),
        oldestBackup: stats.oldestBackup?.toISOString(),
        newestBackup: stats.newestBackup?.toISOString(),
      },
      backups: formattedBackups,
    });
  } catch (error) {
    log.error({ error }, 'Error listing backups');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/backups
 * Crea un nuevo backup manualmente
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    log.info({ userId: auth.userId }, 'Admin creating manual backup');

    const result = await DatabaseBackupService.createBackup();

    if (result.success) {
      // Enviar notificación (no bloquea)
      DatabaseBackupService.sendNotification(result).catch(error => {
        log.error({ error }, 'Error sending notification');
      });

      return NextResponse.json({
        success: true,
        filename: result.filename,
        size: result.size,
        sizeFormatted: formatBytes(result.size || 0),
        durationMs: result.durationMs,
        uploadedToR2: result.uploadedToR2,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    log.error({ error }, 'Error creating backup');
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper functions
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getAge(date: Date): string {
  const now = Date.now();
  const age = now - date.getTime();
  const days = Math.floor(age / (24 * 60 * 60 * 1000));
  const hours = Math.floor((age % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return 'Less than 1 hour ago';
  }
}
