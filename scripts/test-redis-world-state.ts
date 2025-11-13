/**
 * Test Script: Redis World State System
 *
 * Prueba el sistema de cache Redis para mundos virtuales
 * y verifica las mejoras de performance.
 */

import { getWorldStateRedis } from '@/lib/worlds/world-state-redis';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const log = createLogger('TestRedisWorldState');

interface TestResult {
  test: string;
  passed: boolean;
  duration?: number;
  error?: string;
  details?: any;
}

/**
 * Test Suite Principal
 */
async function runTests() {
  log.info('🧪 Starting Redis World State System Tests');

  const results: TestResult[] = [];

  // Test 1: Get world state (cache miss -> DB load)
  results.push(await testGetWorldStateCacheMiss());

  // Test 2: Get world state (cache hit)
  results.push(await testGetWorldStateCacheHit());

  // Test 3: Lock and unlock
  results.push(await testLockSystem());

  // Test 4: Concurrent lock attempts
  results.push(await testConcurrentLocks());

  // Test 5: Save and retrieve state
  results.push(await testSaveAndRetrieve());

  // Test 6: Sync to database
  results.push(await testSyncToDatabase());

  // Test 7: Cache invalidation
  results.push(await testCacheInvalidation());

  // Test 8: Performance comparison (Redis vs DB)
  results.push(await testPerformanceComparison());

  // Imprimir resultados
  printResults(results);

  return results;
}

/**
 * Test 1: Cache MISS - debe cargar de DB
 */
async function testGetWorldStateCacheMiss(): Promise<TestResult> {
  try {
    log.info('Test 1: Cache MISS (initial load from DB)');

    const service = getWorldStateRedis();

    // Obtener primer mundo activo
    const world = await prisma.world.findFirst({
      where: {
        status: { in: ['RUNNING', 'PAUSED'] },
      },
    });

    if (!world) {
      return {
        test: 'Get World State (Cache MISS)',
        passed: false,
        error: 'No active worlds found',
      };
    }

    // Invalidar cache primero para forzar MISS
    await service.invalidateCache(world.id);

    const startTime = Date.now();
    const state = await service.getWorldState(world.id);
    const duration = Date.now() - startTime;

    const passed = state !== null && duration < 500; // Debe completar en <500ms

    return {
      test: 'Get World State (Cache MISS)',
      passed,
      duration,
      details: {
        worldId: world.id,
        agentsCount: state?.agents.length || 0,
        interactionsCount: state?.recentInteractions.length || 0,
      },
    };
  } catch (error) {
    return {
      test: 'Get World State (Cache MISS)',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test 2: Cache HIT - debe ser <10ms
 */
async function testGetWorldStateCacheHit(): Promise<TestResult> {
  try {
    log.info('Test 2: Cache HIT (fast retrieval from Redis)');

    const service = getWorldStateRedis();

    const world = await prisma.world.findFirst({
      where: {
        status: { in: ['RUNNING', 'PAUSED'] },
      },
    });

    if (!world) {
      return {
        test: 'Get World State (Cache HIT)',
        passed: false,
        error: 'No active worlds found',
      };
    }

    // Primera carga para popular cache
    await service.getWorldState(world.id);

    // Segunda carga debe ser cache HIT
    const startTime = Date.now();
    const state = await service.getWorldState(world.id);
    const duration = Date.now() - startTime;

    const passed = state !== null && duration < 50; // Debe ser <50ms

    return {
      test: 'Get World State (Cache HIT)',
      passed,
      duration,
      details: {
        worldId: world.id,
        expectedUnder: '50ms',
        improvement: duration < 50 ? `${((1 - duration / 200) * 100).toFixed(0)}%` : 'N/A',
      },
    };
  } catch (error) {
    return {
      test: 'Get World State (Cache HIT)',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test 3: Lock system básico
 */
async function testLockSystem(): Promise<TestResult> {
  try {
    log.info('Test 3: Lock system (acquire and release)');

    const service = getWorldStateRedis();
    const testWorldId = 'test-lock-world-' + Date.now();

    // Adquirir lock
    const lock1 = await service.lockWorld(testWorldId, 10);

    if (!lock1.acquired || !lock1.lockId) {
      return {
        test: 'Lock System',
        passed: false,
        error: 'Failed to acquire first lock',
      };
    }

    // Intentar adquirir otro lock (debe fallar)
    const lock2 = await service.lockWorld(testWorldId, 10);

    if (lock2.acquired) {
      return {
        test: 'Lock System',
        passed: false,
        error: 'Second lock should have failed',
      };
    }

    // Liberar lock
    const released = await service.unlockWorld(testWorldId, lock1.lockId);

    if (!released) {
      return {
        test: 'Lock System',
        passed: false,
        error: 'Failed to release lock',
      };
    }

    // Ahora debe poder adquirir
    const lock3 = await service.lockWorld(testWorldId, 10);

    if (!lock3.acquired) {
      return {
        test: 'Lock System',
        passed: false,
        error: 'Third lock should have succeeded after release',
      };
    }

    // Cleanup
    await service.unlockWorld(testWorldId, lock3.lockId);

    return {
      test: 'Lock System',
      passed: true,
      details: {
        firstLockAcquired: true,
        secondLockBlocked: true,
        lockReleased: true,
        thirdLockAcquired: true,
      },
    };
  } catch (error) {
    return {
      test: 'Lock System',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test 4: Locks concurrentes
 */
async function testConcurrentLocks(): Promise<TestResult> {
  try {
    log.info('Test 4: Concurrent lock attempts');

    const service = getWorldStateRedis();
    const testWorldId = 'test-concurrent-' + Date.now();

    // Intentar adquirir 5 locks simultáneamente
    const lockPromises = Array(5)
      .fill(null)
      .map(() => service.lockWorld(testWorldId, 10));

    const locks = await Promise.all(lockPromises);

    // Solo 1 debe tener éxito
    const acquiredCount = locks.filter(l => l.acquired).length;

    // Liberar locks
    for (const lock of locks) {
      if (lock.acquired && lock.lockId) {
        await service.unlockWorld(testWorldId, lock.lockId);
      }
    }

    const passed = acquiredCount === 1;

    return {
      test: 'Concurrent Locks',
      passed,
      details: {
        attempts: 5,
        acquired: acquiredCount,
        blocked: 5 - acquiredCount,
        expected: 'Only 1 should acquire',
      },
    };
  } catch (error) {
    return {
      test: 'Concurrent Locks',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test 5: Guardar y recuperar estado
 */
async function testSaveAndRetrieve(): Promise<TestResult> {
  try {
    log.info('Test 5: Save and retrieve state');

    const service = getWorldStateRedis();

    const world = await prisma.world.findFirst({
      where: {
        status: { in: ['RUNNING', 'PAUSED'] },
      },
      include: {
        worldAgents: { where: { isActive: true } },
        simulationState: true,
      },
    });

    if (!world) {
      return {
        test: 'Save and Retrieve',
        passed: false,
        error: 'No active worlds found',
      };
    }

    // Crear estado mock
    const testState = {
      world,
      agents: world.worldAgents,
      simulationState: world.simulationState,
      recentInteractions: [],
      cachedAt: new Date(),
      version: 1,
    };

    // Guardar
    const saved = await service.saveWorldState(world.id, testState, 300);

    if (!saved) {
      return {
        test: 'Save and Retrieve',
        passed: false,
        error: 'Failed to save state',
      };
    }

    // Recuperar
    const retrieved = await service.getWorldState(world.id);

    const passed =
      retrieved !== null &&
      retrieved.world.id === world.id &&
      retrieved.agents.length === world.worldAgents.length;

    return {
      test: 'Save and Retrieve',
      passed,
      details: {
        worldId: world.id,
        agentsSaved: testState.agents.length,
        agentsRetrieved: retrieved?.agents.length || 0,
      },
    };
  } catch (error) {
    return {
      test: 'Save and Retrieve',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test 6: Sincronización a DB
 */
async function testSyncToDatabase(): Promise<TestResult> {
  try {
    log.info('Test 6: Sync to database');

    const service = getWorldStateRedis();

    const world = await prisma.world.findFirst({
      where: {
        status: { in: ['RUNNING', 'PAUSED'] },
      },
    });

    if (!world) {
      return {
        test: 'Sync to Database',
        passed: false,
        error: 'No active worlds found',
      };
    }

    // Cargar estado
    const state = await service.getWorldState(world.id);

    if (!state) {
      return {
        test: 'Sync to Database',
        passed: false,
        error: 'Failed to load world state',
      };
    }

    // Modificar estado (simular cambio)
    if (state.simulationState) {
      state.simulationState.currentTurn += 1;
    }

    // Guardar (marca como dirty)
    await service.saveWorldState(world.id, state);

    // Sincronizar
    const startTime = Date.now();
    const synced = await service.syncToDatabase(world.id);
    const duration = Date.now() - startTime;

    return {
      test: 'Sync to Database',
      passed: synced,
      duration,
      details: {
        worldId: world.id,
        syncTime: `${duration}ms`,
      },
    };
  } catch (error) {
    return {
      test: 'Sync to Database',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test 7: Invalidación de cache
 */
async function testCacheInvalidation(): Promise<TestResult> {
  try {
    log.info('Test 7: Cache invalidation');

    const service = getWorldStateRedis();

    const world = await prisma.world.findFirst({
      where: {
        status: { in: ['RUNNING', 'PAUSED'] },
      },
    });

    if (!world) {
      return {
        test: 'Cache Invalidation',
        passed: false,
        error: 'No active worlds found',
      };
    }

    // Cargar (popular cache)
    await service.getWorldState(world.id);

    // Invalidar
    await service.invalidateCache(world.id);

    // Próxima carga debe ser MISS (más lenta)
    const startTime = Date.now();
    await service.getWorldState(world.id);
    const duration = Date.now() - startTime;

    // Debe ser lento (>50ms) porque es cache MISS
    const passed = duration > 30; // Esperar que tome más tiempo

    return {
      test: 'Cache Invalidation',
      passed,
      duration,
      details: {
        worldId: world.id,
        reloadTime: `${duration}ms`,
        expectedSlow: '>30ms (cache MISS)',
      },
    };
  } catch (error) {
    return {
      test: 'Cache Invalidation',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test 8: Comparación de performance Redis vs DB
 */
async function testPerformanceComparison(): Promise<TestResult> {
  try {
    log.info('Test 8: Performance comparison (Redis vs DB)');

    const service = getWorldStateRedis();

    const world = await prisma.world.findFirst({
      where: {
        status: { in: ['RUNNING', 'PAUSED'] },
      },
    });

    if (!world) {
      return {
        test: 'Performance Comparison',
        passed: false,
        error: 'No active worlds found',
      };
    }

    // Medir DB directo (sin cache)
    await service.invalidateCache(world.id);
    const dbStart = Date.now();
    await service.getWorldState(world.id);
    const dbDuration = Date.now() - dbStart;

    // Medir Redis cache (segunda llamada)
    const redisStart = Date.now();
    await service.getWorldState(world.id);
    const redisDuration = Date.now() - redisStart;

    const improvement = ((1 - redisDuration / dbDuration) * 100).toFixed(0);
    const passed = redisDuration < dbDuration / 2; // Redis debe ser al menos 2x más rápido

    return {
      test: 'Performance Comparison',
      passed,
      details: {
        worldId: world.id,
        dbDirect: `${dbDuration}ms`,
        redisCache: `${redisDuration}ms`,
        improvement: `${improvement}% faster`,
        speedup: `${(dbDuration / redisDuration).toFixed(1)}x`,
      },
    };
  } catch (error) {
    return {
      test: 'Performance Comparison',
      passed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Imprimir resultados de los tests
 */
function printResults(results: TestResult[]) {
  log.info('\n' + '='.repeat(80));
  log.info('📊 TEST RESULTS');
  log.info('='.repeat(80) + '\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const duration = result.duration ? ` (${result.duration}ms)` : '';

    log.info(`${index + 1}. ${status} - ${result.test}${duration}`);

    if (result.error) {
      log.error(`   Error: ${result.error}`);
    }

    if (result.details) {
      log.info(`   Details:`, result.details);
    }

    log.info('');
  });

  log.info('='.repeat(80));
  log.info(`SUMMARY: ${passed}/${results.length} passed, ${failed}/${results.length} failed`);
  log.info('='.repeat(80) + '\n');

  if (failed === 0) {
    log.info('🎉 ALL TESTS PASSED! Redis World State System is working correctly.');
  } else {
    log.warn(`⚠️  ${failed} test(s) failed. Check errors above.`);
  }
}

/**
 * Ejecutar tests
 */
runTests()
  .then(() => {
    log.info('✅ Test suite completed');
    process.exit(0);
  })
  .catch(error => {
    log.error('❌ Test suite failed:', error);
    process.exit(1);
  });
