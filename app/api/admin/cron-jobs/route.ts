/**
 * API Admin: Cron Jobs Management
 *
 * GET /api/admin/cron-jobs - Obtiene estado y métricas de cron jobs
 * POST /api/admin/cron-jobs/[action] - Ejecuta acción (enable, disable, run)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { cronManager } from '@/lib/worlds/jobs/cron-manager';
import { worldStateManager } from '@/lib/worlds/world-state-manager';
import { createLogger } from '@/lib/logger';

const log = createLogger('CronJobsAPI');

/**
 * GET - Obtiene estado y métricas de cron jobs
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Solo admins pueden acceder
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Obtener estadísticas de cron manager
    const cronStats = cronManager.getStats();

    // Obtener métricas detalladas de cada job
    const detailedMetrics = cronManager.getDetailedMetrics();

    // Obtener estadísticas de Redis
    const redisStats = await worldStateManager.getStats();

    return NextResponse.json({
      success: true,
      data: {
        cronManager: cronStats,
        jobMetrics: detailedMetrics,
        redis: redisStats,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    log.error({ error }, 'Error getting cron jobs status');
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Ejecuta acción en cron jobs
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    // Solo admins pueden acceder
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, jobName } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'enable':
        if (!jobName) {
          return NextResponse.json(
            { error: 'jobName is required for enable action' },
            { status: 400 }
          );
        }
        cronManager.enableJob(jobName);
        log.info({ jobName }, 'Job enabled by admin');
        break;

      case 'disable':
        if (!jobName) {
          return NextResponse.json(
            { error: 'jobName is required for disable action' },
            { status: 400 }
          );
        }
        cronManager.disableJob(jobName);
        log.info({ jobName }, 'Job disabled by admin');
        break;

      case 'run':
        if (!jobName) {
          return NextResponse.json(
            { error: 'jobName is required for run action' },
            { status: 400 }
          );
        }
        await cronManager.runJobManually(jobName);
        log.info({ jobName }, 'Job executed manually by admin');
        break;

      case 'stop-all':
        cronManager.stop();
        log.info('All jobs stopped by admin');
        break;

      case 'restart-all':
        cronManager.restart();
        log.info('All jobs restarted by admin');
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Action ${action} executed successfully`,
    });
  } catch (error) {
    log.error({ error }, 'Error executing cron job action');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
