#!/usr/bin/env tsx

/**
 * Script para poblar la base de datos con mundos predefinidos
 * Ejecutar con: npm run seed:worlds
 *
 * DEPRECATED: Este script fue deshabilitado debido a la migración del sistema de Worlds a Grupos.
 * El modelo 'world' ya no existe en el esquema de Prisma.
 * Si necesitas funcionalidad similar para el nuevo sistema de Grupos, crea un nuevo script.
 */

// import { seedPredefinedWorlds } from '../prisma/seeds/predefined-worlds';
// import { PrismaClient } from '@prisma/client';
//
// const prisma = new PrismaClient();
//
// async function main() {
//   try {
//     console.log('🚀 Starting predefined worlds seeding...\n');
//
//     // Limpiar mundos predefinidos existentes si es necesario
//     const confirm = process.argv.includes('--reset');
//
//     if (confirm) {
//       console.log('🗑️  Removing existing predefined worlds...');
//       await prisma.world.deleteMany({
//         where: { isPredefined: true },
//       });
//       console.log('✅ Existing predefined worlds removed\n');
//     }
//
//     // Crear nuevos mundos predefinidos
//     await seedPredefinedWorlds();
//
//     console.log('✨ Seeding completed successfully!');
//   } catch (error) {
//     console.error('❌ Error seeding predefined worlds:', error);
//     process.exit(1);
//   } finally {
//     await prisma.$disconnect();
//   }
// }
//
// main();

console.log('⚠️  Este script está deshabilitado debido a la migración de Worlds a Grupos.');
console.log('El modelo "world" ya no existe en el esquema de Prisma.');
process.exit(0);
