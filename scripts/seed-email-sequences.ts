/**
 * Seed Email Sequences
 *
 * Populates the database with predefined email sequences and templates
 *
 * Usage: npx tsx scripts/seed-email-sequences.ts
 *
 * DEPRECATED: Este script fue deshabilitado porque el modelo 'emailSequence'
 * ya no existe en el esquema de Prisma.
 * Si necesitas funcionalidad similar, crea un nuevo script con el modelo actualizado.
 */

// import { PrismaClient } from '@prisma/client';
//
// const prisma = new PrismaClient();
//
// async function main() {
//   console.log('🌱 Seeding email sequences...');
//
//   // ... resto del código comentado
// }
//
// main()
//   .catch((error) => {
//     console.error('❌ Error seeding email sequences:', error);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

console.log('⚠️  Este script está deshabilitado.');
console.log('El modelo "emailSequence" ya no existe en el esquema de Prisma.');
process.exit(0);
