/**
 * Admin API: Estadísticas del Sistema de Embeddings
 *
 * Endpoint para monitorear la carga y el rendimiento del sistema de embeddings.
 * Solo accesible para administradores.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/middleware/auth-helper';
import { embeddingQueue } from '@/lib/embeddings/queue-manager';
import { redis } from '@/lib/redis/config';
import { isQwenModelLoaded } from '@/lib/memory/qwen-embeddings';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación (solo admin)
    const session = await getAuthSession(request);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // TODO: Verificar que sea admin (agregar campo isAdmin en User)
    // const isAdmin = session.user.isAdmin;
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // Obtener estadísticas de la cola
    const queueStats = await embeddingQueue.getStats();

    // Obtener estadísticas de rate limiting
    const rateLimitStats = await getRateLimitStats();

    // Estadísticas del modelo
    const modelStats = {
      loaded: isQwenModelLoaded(),
      // TODO: Agregar más stats si es posible (memoria, etc)
    };

    // Estadísticas de caché
    const cacheStats = await getCacheStats();

    // Sistema de salud general
    const health = calculateSystemHealth(queueStats, rateLimitStats);

    return NextResponse.json({
      queue: queueStats,
      rateLimit: rateLimitStats,
      model: modelStats,
      cache: cacheStats,
      health,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error getting embeddings stats:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}

/**
 * Obtener estadísticas de rate limiting
 */
async function getRateLimitStats() {
  const operations = ['chat_retrieval', 'memory_storage', 'post_indexing', 'ml_analysis', 'batch_processing'];

  const stats: any = {};

  for (const op of operations) {
    const now = Date.now();
    const minuteKey = `embeddings:ratelimit:${op}:minute:${Math.floor(now / 60000)}`;
    const hourKey = `embeddings:ratelimit:${op}:hour:${Math.floor(now / 3600000)}`;

    const [minuteCount, hourCount] = await Promise.all([
      redis.get(minuteKey),
      redis.get(hourKey),
    ]);

    stats[op] = {
      currentMinute: parseInt(minuteCount as string || '0'),
      currentHour: parseInt(hourCount as string || '0'),
    };
  }

  return stats;
}

/**
 * Obtener estadísticas de caché
 */
async function getCacheStats() {
  // Obtener keys de caché
  const cacheKeys = await redis.keys('embeddings:cache:*');

  return {
    totalCached: cacheKeys?.length || 0,
    // TODO: Agregar hit rate si es posible
  };
}

/**
 * Calcular salud general del sistema
 */
function calculateSystemHealth(queueStats: any, rateLimitStats: any) {
  let score = 100;

  // Penalizar por cola grande
  if (queueStats.totalJobs > 200) score -= 30;
  else if (queueStats.totalJobs > 100) score -= 15;
  else if (queueStats.totalJobs > 50) score -= 5;

  // Penalizar por muchos jobs críticos esperando
  const criticalJobs = queueStats.byPriority[0] || 0;
  if (criticalJobs > 20) score -= 20;
  else if (criticalJobs > 10) score -= 10;

  // Penalizar por fallos
  if (queueStats.failed > 50) score -= 20;
  else if (queueStats.failed > 10) score -= 10;

  // Determinar estado
  let status: 'healthy' | 'degraded' | 'critical';
  if (score >= 80) status = 'healthy';
  else if (score >= 50) status = 'degraded';
  else status = 'critical';

  return {
    score: Math.max(0, score),
    status,
    recommendations: getRecommendations(queueStats, score),
  };
}

/**
 * Generar recomendaciones según el estado
 */
function getRecommendations(queueStats: any, healthScore: number): string[] {
  const recommendations: string[] = [];

  if (queueStats.totalJobs > 100) {
    recommendations.push('Cola grande: Considerar aumentar recursos o reducir frecuencia de análisis ML');
  }

  if (queueStats.byPriority[0] > 10) {
    recommendations.push('Muchos jobs críticos esperando: Verificar que el procesamiento esté activo');
  }

  if (queueStats.failed > 20) {
    recommendations.push('Alto ratio de fallos: Revisar logs para identificar errores');
  }

  if (healthScore < 50) {
    recommendations.push('Sistema crítico: Considerar pausar análisis ML hasta que se estabilice');
  }

  if (recommendations.length === 0) {
    recommendations.push('Sistema funcionando correctamente');
  }

  return recommendations;
}
