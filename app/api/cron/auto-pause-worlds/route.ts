/**
 * Cron Job: Auto-Pause Inactive Worlds
 *
 * Endpoint para pausar automáticamente mundos inactivos.
 * Debe ejecutarse cada 6 horas.
 *
 * SEGURIDAD:
 * - Requiere token de autorización CRON_SECRET
 * - Solo accesible desde servidor
 *
 * SETUP EN VERCEL:
 * 1. Agregar variable de entorno: CRON_SECRET=<token-seguro>
 * 2. Configurar cron job en vercel.json o usar servicio externo
 * 3. URL: https://tu-dominio.com/api/cron/auto-pause-worlds
 * 4. Headers: Authorization: Bearer <CRON_SECRET>
 *
 * ALTERNATIVAS:
 * - Vercel Cron Jobs (recomendado)
 * - GitHub Actions scheduled workflow
 * - Servicio externo como cron-job.org
 */

import { NextRequest, NextResponse } from 'next/server';
import { WorldPauseService } from '@/lib/services/world-pause.service';
import { createLogger } from '@/lib/logger';

const log = createLogger('CronAutoPause');

// Aumentar timeout para cron job
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

    log.info('Starting auto-pause cron job');

    // Ejecutar auto-pause
    const stats = await WorldPauseService.autoPauseInactiveWorlds();

    const duration = Date.now() - startTime;

    log.info(
      {
        stats,
        durationMs: duration,
      },
      'Auto-pause cron job completed successfully'
    );

    return NextResponse.json({
      success: true,
      stats,
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
      'Auto-pause cron job failed'
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

// GET endpoint para verificar estado (solo en desarrollo)
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 404 }
    );
  }

  try {
    const pauseStats = await WorldPauseService.getPauseStats();

    return NextResponse.json({
      success: true,
      stats: pauseStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.error({ error }, 'Error getting pause stats');
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
