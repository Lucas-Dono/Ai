/**
 * Script de Migración: Asignar personalityVariant a Agentes Existentes
 *
 * Este script analiza todos los agentes sin personalityVariant asignado
 * y usa IA para clasificar su personalidad de forma precisa.
 *
 * Ejecutar con: npx tsx scripts/migrate-personality-variants.ts
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { migrateAllAgents } from '@/lib/behavior-system/prompts/personality-classifier';
import { prisma } from '@/lib/prisma';

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 Migración: Asignar personalityVariant a Agentes');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Contar agentes sin variante
    const totalWithoutVariant = await prisma.agent.count({
      where: {
        personalityVariant: null,
        personality: { not: null },
      },
    });

    console.log(`📊 Agentes sin personalityVariant: ${totalWithoutVariant}\n`);

    if (totalWithoutVariant === 0) {
      console.log('✅ Todos los agentes ya tienen personalityVariant asignado\n');
      return;
    }

    console.log('🤖 Iniciando clasificación con IA...\n');

    const migrated = await migrateAllAgents();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Migración completada');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Agentes migrados: ${migrated}/${totalWithoutVariant}\n`);

    // Mostrar distribución de variantes
    const distribution = await prisma.agent.groupBy({
      by: ['personalityVariant'],
      _count: true,
      where: {
        personalityVariant: { not: null },
      },
    });

    console.log('📊 Distribución de variantes:\n');
    distribution
      .sort((a, b) => b._count - a._count)
      .forEach(({ personalityVariant, _count }) => {
        console.log(`  ${personalityVariant?.padEnd(15)} → ${_count} agentes`);
      });

    console.log('');
  } catch (error) {
    console.error('❌ Error en migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
