/**
 * Script de prueba para verificar las optimizaciones de rendimiento
 *
 * Ejecutar con: npx tsx scripts/test-performance-optimizations.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando pruebas de optimizaciones de rendimiento...\n');

  // ==========================================
  // Test 1: Verificar índices compuestos
  // ==========================================
  console.log('📊 Test 1: Verificando índices compuestos en la base de datos...');

  try {
    // Verificar índice en Message
    const messageIndexes = await prisma.$queryRaw`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'Message'
      AND indexname LIKE '%agentId%createdAt%';
    `;

    console.log('✅ Índices en Message:', messageIndexes);

    // Verificar índice en WorldInteraction
    const worldInteractionIndexes = await prisma.$queryRaw`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'WorldInteraction'
      AND indexname LIKE '%worldId%turnNumber%';
    `;

    console.log('✅ Índices en WorldInteraction:', worldInteractionIndexes);
  } catch (error) {
    console.error('❌ Error verificando índices:', error);
  }

  console.log('\n');

  // ==========================================
  // Test 2: Benchmark de groupBy vs findMany
  // ==========================================
  console.log('📊 Test 2: Benchmark groupBy vs findMany (si hay datos)...');

  try {
    const agentWithTriggers = await prisma.agent.findFirst({
      where: {
        // Find any agent to test with
        id: { not: '' }
      },
      select: { id: true, name: true }
    });

    if (agentWithTriggers) {
      console.log(`Testing con agente: ${agentWithTriggers.name} (${agentWithTriggers.id})`);

      // Método ANTIGUO (findMany + forEach)
      const oldMethodStart = Date.now();
      const allTriggers = await prisma.behaviorTriggerLog.findMany({
        where: {
          message: {
            agentId: agentWithTriggers.id,
          },
        },
        select: {
          triggerType: true,
          behaviorType: true,
          weight: true,
        },
      });

      const oldStats = {
        triggersByType: {} as Record<string, number>,
        averageWeight: 0,
      };

      let totalWeight = 0;
      allTriggers.forEach((trigger) => {
        oldStats.triggersByType[trigger.triggerType] =
          (oldStats.triggersByType[trigger.triggerType] || 0) + 1;
        totalWeight += trigger.weight;
      });

      if (allTriggers.length > 0) {
        oldStats.averageWeight = totalWeight / allTriggers.length;
      }

      const oldMethodEnd = Date.now();
      const oldMethodDuration = oldMethodEnd - oldMethodStart;

      // Método NUEVO (groupBy + aggregate)
      const newMethodStart = Date.now();

      const triggersByTypeResults = await prisma.behaviorTriggerLog.groupBy({
        by: ['triggerType'],
        where: {
          message: {
            agentId: agentWithTriggers.id,
          },
        },
        _count: {
          triggerType: true,
        },
      });

      const newStats = {
        triggersByType: {} as Record<string, number>,
        averageWeight: 0,
      };

      triggersByTypeResults.forEach((result) => {
        newStats.triggersByType[result.triggerType] = result._count.triggerType;
      });

      const avgWeightResult = await prisma.behaviorTriggerLog.aggregate({
        where: {
          message: {
            agentId: agentWithTriggers.id,
          },
        },
        _avg: {
          weight: true,
        },
      });

      newStats.averageWeight = avgWeightResult._avg.weight || 0;

      const newMethodEnd = Date.now();
      const newMethodDuration = newMethodEnd - newMethodStart;

      console.log(`\n📈 Resultados:`);
      console.log(`  Triggers totales: ${allTriggers.length}`);
      console.log(`  Método antiguo (findMany): ${oldMethodDuration}ms`);
      console.log(`  Método nuevo (groupBy): ${newMethodDuration}ms`);
      console.log(`  Mejora: ${(oldMethodDuration / newMethodDuration).toFixed(2)}x más rápido`);
      console.log(`  Reducción: ${((1 - newMethodDuration / oldMethodDuration) * 100).toFixed(1)}% menos tiempo`);
    } else {
      console.log('⚠️  No hay agentes con triggers para testear. Crea un agente y chatea con él primero.');
    }
  } catch (error) {
    console.error('❌ Error en benchmark:', error);
  }

  console.log('\n');

  // ==========================================
  // Test 3: Verificar paginación
  // ==========================================
  console.log('📊 Test 3: Verificando paginación en worlds...');

  try {
    const totalWorlds = await prisma.world.count();
    console.log(`  Total de mundos en DB: ${totalWorlds}`);

    if (totalWorlds > 0) {
      const limit = 5;

      // Página 1
      const page1Start = Date.now();
      const page1Worlds = await prisma.world.findMany({
        take: limit,
        skip: 0,
        select: { id: true, name: true }
      });
      const page1End = Date.now();

      // Sin paginación (todos)
      const allStart = Date.now();
      const allWorlds = await prisma.world.findMany({
        select: { id: true, name: true }
      });
      const allEnd = Date.now();

      console.log(`\n📈 Resultados:`);
      console.log(`  Fetch con paginación (${limit} items): ${page1End - page1Start}ms`);
      console.log(`  Fetch sin paginación (${allWorlds.length} items): ${allEnd - allStart}ms`);
      if (totalWorlds > limit) {
        console.log(`  Mejora: ${((allEnd - allStart) / (page1End - page1Start)).toFixed(2)}x más rápido`);
      }
    }
  } catch (error) {
    console.error('❌ Error verificando paginación:', error);
  }

  console.log('\n');

  // ==========================================
  // Test 4: Verificar configuración de Redis
  // ==========================================
  console.log('📊 Test 4: Verificando configuración de Redis...');

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.log('✅ Variables de entorno de Redis configuradas');
    console.log(`  URL: ${process.env.UPSTASH_REDIS_REST_URL}`);

    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      // Test de conexión
      const testKey = 'perf_test_' + Date.now();
      await redis.set(testKey, 'test_value', { ex: 10 });
      const value = await redis.get(testKey);
      await redis.del(testKey);

      if (value === 'test_value') {
        console.log('✅ Conexión a Redis exitosa');
      } else {
        console.log('⚠️  Redis responde pero el valor no coincide');
      }
    } catch (error: any) {
      console.error('❌ Error conectando a Redis:', error.message);
    }
  } else {
    console.log('⚠️  Redis no configurado (opcional). Configurar UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN en .env');
  }

  console.log('\n✅ Pruebas completadas!\n');
}

main()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
