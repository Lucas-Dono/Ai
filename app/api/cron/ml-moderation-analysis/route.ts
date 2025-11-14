/**
 * Cron Job: Análisis ML de Moderación Nocturno
 *
 * Se ejecuta automáticamente en horarios de baja carga (2-5 AM)
 * para generar sugerencias ML sin afectar operaciones en tiempo real.
 *
 * Configuración en Vercel:
 * - Path: /api/cron/ml-moderation-analysis
 * - Schedule: 0 3 * * * (3 AM diario)
 * - Authorization: Bearer ${CRON_SECRET}
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MLModerationAnalyzer } from '@/lib/services/ml-moderation-analyzer.service';
import { embeddingQueue } from '@/lib/embeddings/queue-manager';
import { createLogger } from '@/lib/logger';

const log = createLogger('MLModerationCron');

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutos

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      log.warn('Intento de acceso no autorizado al cron ML');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    log.info('Iniciando cron de análisis ML de moderación');

    // Verificar que estemos en horario de baja carga
    const currentHour = new Date().getHours();
    if (currentHour < 2 || currentHour > 5) {
      log.warn({ currentHour }, 'Cron ejecutado fuera de horario de baja carga');
      // Continuar de todas formas (puede ser ejecución manual)
    }

    // Obtener usuarios activos que han moderado recientemente
    const activeUsers = await prisma.user.findMany({
      where: {
        OR: [
          // Usuarios que han ocultado posts en los últimos 7 días
          {
            hiddenPosts: {
              some: {
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
              },
            },
          },
          // Usuarios que han bloqueado en los últimos 7 días
          {
            blockedUsers: {
              some: {
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
      },
      take: 100, // Limitar a 100 usuarios por ejecución
    });

    log.info({ count: activeUsers.length }, 'Usuarios activos encontrados para análisis ML');

    // Estadísticas de la ejecución
    const stats = {
      usersProcessed: 0,
      suggestionsGenerated: 0,
      errors: 0,
      startTime: Date.now(),
    };

    // Procesar cada usuario
    for (const user of activeUsers) {
      try {
        log.info({ userId: user.id }, 'Analizando usuario');

        // Generar sugerencias ML
        const suggestions = await MLModerationAnalyzer.analyzeModerationPatterns(user.id);

        // Guardar sugerencias
        if (suggestions.length > 0) {
          await MLModerationAnalyzer.saveSuggestions(user.id, suggestions);
          stats.suggestionsGenerated += suggestions.length;
          log.info(
            { userId: user.id, suggestionsCount: suggestions.length },
            'Sugerencias guardadas'
          );
        } else {
          log.debug({ userId: user.id }, 'No se generaron sugerencias');
        }

        stats.usersProcessed++;

        // Pequeña pausa entre usuarios para no saturar
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        log.error({ userId: user.id, error }, 'Error analizando usuario');
        stats.errors++;
      }
    }

    // Limpiar sugerencias expiradas
    const deletedCount = await prisma.mLSuggestion.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    log.info({ deletedCount: deletedCount.count }, 'Sugerencias expiradas eliminadas');

    // Obtener estadísticas finales del sistema de embeddings
    const queueStats = await embeddingQueue.getStats();

    const executionTime = Date.now() - stats.startTime;

    log.info(
      {
        ...stats,
        executionTimeMs: executionTime,
        queueStats,
      },
      'Cron de análisis ML completado'
    );

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        executionTimeMs: executionTime,
        deletedExpired: deletedCount.count,
      },
      queueStats,
      message: `Procesados ${stats.usersProcessed} usuarios, generadas ${stats.suggestionsGenerated} sugerencias`,
    });
  } catch (error: any) {
    log.error({ error }, 'Error en cron de análisis ML');
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
