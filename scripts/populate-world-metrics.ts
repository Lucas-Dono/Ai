/**
 * Script para popular métricas de mundos con datos de prueba
 * Esto ayudará a que el ranking tenga sentido
 *
 * DEPRECATED: Este script fue deshabilitado debido a la migración del sistema de Worlds a Grupos.
 * El modelo 'world' ya no existe en el esquema de Prisma.
 * Si necesitas funcionalidad similar para el nuevo sistema de Grupos, crea un nuevo script.
 */

// import { PrismaClient } from "@prisma/client";
//
// const prisma = new PrismaClient();
//
// async function main() {
//   console.log("📊 Populando métricas de mundos...");
//
//   // Obtener todos los mundos predefinidos
//   const worlds = await prisma.world.findMany({
//     where: {
//       isPredefined: true,
//     },
//     select: {
//       id: true,
//       name: true,
//       _count: {
//         select: {
//           interactions: true,
//         },
//       },
//     },
//   });
//
//   console.log(`\n🌍 Encontrados ${worlds.length} mundos predefinidos`);
//
//   // Asignar métricas aleatorias pero coherentes a cada mundo
//   for (const world of worlds) {
//     // Academia Sakura debe tener las mejores métricas
//     const isAcademia = world.name.toLowerCase().includes("academia sakura");
//
//     // Generar métricas basadas en si es Academia o no
//     const baseViews = isAcademia ? 500 : Math.floor(Math.random() * 300) + 50;
//     const baseTime = isAcademia ? 15000 : Math.floor(Math.random() * 5000) + 500;
//     const rating = isAcademia ? 4.8 : Math.random() * 2 + 3; // 3.0-5.0
//
//     await prisma.world.update({
//       where: { id: world.id },
//       data: {
//         viewCount: baseViews,
//         totalTimeSpent: baseTime, // en segundos
//         rating: Number(rating.toFixed(1)),
//         lastViewedAt: new Date(
//           Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
//         ), // Última semana
//       },
//     });
//
//     console.log(
//       `  ✅ ${world.name}:\n     Views: ${baseViews} | Time: ${Math.floor(baseTime / 60)}min | Rating: ${rating.toFixed(1)}`
//     );
//   }
//
//   console.log("\n✨ Métricas populadas exitosamente");
//
//   // Mostrar ranking resultante
//   console.log("\n🏆 Top 5 Mundos por Views:");
//   const topWorlds = await prisma.world.findMany({
//     where: { isPredefined: true },
//     orderBy: { viewCount: "desc" },
//     take: 5,
//     select: {
//       name: true,
//       viewCount: true,
//       rating: true,
//       totalTimeSpent: true,
//     },
//   });
//
//   topWorlds.forEach((world, idx) => {
//     console.log(
//       `  ${idx + 1}. ${world.name} - ${world.viewCount} views (${Math.floor((world.totalTimeSpent || 0) / 60)}min)`
//     );
//   });
// }
//
// main()
//   .catch((error) => {
//     console.error("❌ Error:", error);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

console.log('⚠️  Este script está deshabilitado debido a la migración de Worlds a Grupos.');
console.log('El modelo "world" ya no existe en el esquema de Prisma.');
process.exit(0);
