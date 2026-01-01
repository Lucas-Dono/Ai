/**
 * Test Script: Redis World State System
 *
 * Prueba el sistema de cache Redis para mundos virtuales
 * y verifica las mejoras de performance.
 *
 * DEPRECATED: Este script fue deshabilitado debido a la migración del sistema de Worlds a Grupos.
 * El módulo '@/lib/worlds/world-state-redis' y el modelo 'world' ya no existen.
 * Si necesitas funcionalidad similar para el nuevo sistema de Grupos, crea un nuevo script.
 */

// import { getWorldStateRedis } from '@/lib/worlds/world-state-redis';
// import { prisma } from '@/lib/prisma';
// import { createLogger } from '@/lib/logger';
//
// const log = createLogger('TestRedisWorldState');
//
// interface TestResult {
//   test: string;
//   // ... resto de la interfaz
// }
//
// async function testRedisWorldState() {
//   console.log('🧪 Testing Redis World State System\n');
//
//   // 1. Buscar un mundo de prueba
//   const world = await prisma.world.findFirst({
//     where: { name: { contains: 'Test' } },
//   });
//
//   if (!world) {
//     console.log('❌ No test world found. Create a world first.');
//     process.exit(1);
//   }
//
//   // ... resto del código comentado
// }
//
// testRedisWorldState().catch(console.error);

console.log('⚠️  Este script está deshabilitado debido a la migración de Worlds a Grupos.');
console.log('Los módulos y modelos relacionados con Worlds ya no existen.');
process.exit(0);
