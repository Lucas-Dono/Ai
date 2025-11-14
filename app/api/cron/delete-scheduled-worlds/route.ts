/**
 * Cron Job: Delete Scheduled Worlds
 *
 * Endpoint para eliminar mundos marcados para eliminación.
 * Debe ejecutarse diariamente.
 *
 * SEGURIDAD:
 * - Requiere token de autorización CRON_SECRET
 * - Solo accesible desde servidor
 */

import { NextRequest, NextResponse } from 'next/server';
import { WorldPauseService } from '@/lib/services/world-pause.service';
import { createLogger } from '@/lib/logger';

const log = createLogger('CronDeleteWorlds');

export const maxDuration = 300; // 5 minutos

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // SECURITY: Verificar token de autorización
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken) {
      log.error('CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Cron job not configured' },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      log.warn('Unauthorized cron job attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    log.info('Starting scheduled worlds deletion cron job');

    // Ejecutar eliminación
    const result = await WorldPauseService.deleteScheduledWorlds();

    const duration = Date.now() - startTime;

    log.info(
      {
        deleted: result.deleted,
        failed: result.failedDeletions.length,
        durationMs: duration,
      },
      'Scheduled worlds deletion completed'
    );

    return NextResponse.json({
      success: true,
      deleted: result.deleted,
      failed: result.failedDeletions.length,
      failedWorldIds: result.failedDeletions,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    log.error(
      {
        error,
        durationMs: duration,
      },
      'Scheduled worlds deletion failed'
    );

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: duration,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
