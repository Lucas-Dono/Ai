#!/usr/bin/env tsx
/**
 * Elimina todos los PersonalityCores para poder recrearlos correctamente
 */
import { prisma } from '@/lib/prisma';

async function main() {
  console.log('⚠️  Eliminando todos los PersonalityCores...\n');

  const result = await prisma.personalityCore.deleteMany({});

  console.log(`✓ Eliminados: ${result.count} PersonalityCores\n`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
