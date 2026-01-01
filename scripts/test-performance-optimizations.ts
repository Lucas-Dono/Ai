/**
 * Script de prueba para optimizaciones de rendimiento
 *
 * DEPRECATED: Este script fue deshabilitado debido a la migración del sistema de Worlds a Grupos.
 * El modelo 'world' ya no existe en el esquema de Prisma.
 * Si necesitas funcionalidad similar para el nuevo sistema de Grupos, crea un nuevo script.
 */

// import { PrismaClient } from '@prisma/client';
//
// const prisma = new PrismaClient();
//
// async function testOptimizations() {
//   console.log('⚡ Testing Performance Optimizations\n');
//
//   // ==========================================
//   // Test 1: Verificar índices
//   // ==========================================
//   console.log('🔍 Test 1: Verificando índices en DB...');
//
//   // ... resto del código comentado
//
//   // ==========================================
//   // Test 3: Verificar paginación
//   // ==========================================
//   console.log('📊 Test 3: Verificando paginación en worlds...');
//
//   try {
//     const totalWorlds = await prisma.world.count();
//     console.log(`  Total de mundos en DB: ${totalWorlds}`);
//
//     if (totalWorlds > 0) {
//       const limit = 5;
//
//       // Página 1
//       const page1Start = Date.now();
//       const page1Worlds = await prisma.world.findMany({
//         take: limit,
//         skip: 0,
//         select: { id: true, name: true }
//       });
//       const page1End = Date.now();
//
//       // Sin paginación (todos)
//       const allStart = Date.now();
//       const allWorlds = await prisma.world.findMany({
//         select: { id: true, name: true }
//       });
//       const allEnd = Date.now();
//
//       console.log(`\n📈 Resultados:`);
//       // ... más código comentado
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }
//
// testOptimizations()
//   .catch(console.error)
//   .finally(() => prisma.$disconnect());

console.log('⚠️  Este script está deshabilitado debido a la migración de Worlds a Grupos.');
console.log('El modelo "world" ya no existe en el esquema de Prisma.');
process.exit(0);
