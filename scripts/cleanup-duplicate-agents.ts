/**
 * Script para limpiar agentes duplicados
 *
 * Problema: Hay agentes featured con nombres duplicados
 * - Algunos tienen avatar, otros no
 * - Probablemente causado por seeds ejecutados múltiples veces
 *
 * Este script:
 * 1. Encuentra agentes con nombres duplicados
 * 2. Para cada grupo:
 *    - Mantiene el que tiene avatar
 *    - Si ninguno tiene avatar, mantiene el primero (más antiguo)
 *    - Elimina los demás
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicates(dryRun = true) {
  try {
    console.log('\n========== CLEANUP DUPLICATE AGENTS ==========');
    console.log(`Mode: ${dryRun ? 'DRY RUN (no changes)' : 'LIVE (will delete)'}\n`);

    // Obtener todos los agentes featured
    const featuredAgents = await prisma.agent.findMany({
      where: {
        featured: true,
        visibility: 'public'
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' }
    });

    console.log(`Found ${featuredAgents.length} featured agents\n`);

    // Agrupar por nombre
    const nameGroups = new Map<string, typeof featuredAgents>();
    featuredAgents.forEach(agent => {
      if (!nameGroups.has(agent.name)) {
        nameGroups.set(agent.name, []);
      }
      nameGroups.get(agent.name)!.push(agent);
    });

    // Filtrar solo duplicados
    const duplicates = Array.from(nameGroups.entries())
      .filter(([_, agents]) => agents.length > 1);

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }

    console.log(`Found ${duplicates.length} duplicate agent names:\n`);

    let totalToDelete = 0;
    const idsToDelete: string[] = [];

    for (const [name, agents] of duplicates) {
      console.log(`"${name}" (${agents.length} copies):`);

      // Ordenar: primero los que tienen avatar, luego por fecha (más antiguo primero)
      const sorted = agents.sort((a, b) => {
        if (a.avatar && !b.avatar) return -1;
        if (!a.avatar && b.avatar) return 1;
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

      // El primero se mantiene
      const toKeep = sorted[0];
      const toDelete = sorted.slice(1);

      console.log(`  ✅ KEEP: ID=${toKeep.id.substring(0, 15)}... Avatar=${toKeep.avatar ? 'YES' : 'NO'} Created=${toKeep.createdAt.toISOString()}`);

      toDelete.forEach(agent => {
        console.log(`  ❌ DELETE: ID=${agent.id.substring(0, 15)}... Avatar=${agent.avatar ? 'YES' : 'NO'} Created=${agent.createdAt.toISOString()}`);
        idsToDelete.push(agent.id);
        totalToDelete++;
      });

      console.log('');
    }

    console.log(`\n========== SUMMARY ==========`);
    console.log(`Total duplicates: ${duplicates.length} names`);
    console.log(`Agents to delete: ${totalToDelete}`);
    console.log(`Agents to keep: ${duplicates.length}`);

    if (!dryRun) {
      console.log('\n🔥 DELETING AGENTS...');

      const result = await prisma.agent.deleteMany({
        where: {
          id: { in: idsToDelete }
        }
      });

      console.log(`✅ Deleted ${result.count} agents`);
    } else {
      console.log('\n⚠️  DRY RUN - No changes made');
      console.log('Run with --live to actually delete:');
      console.log('  npx tsx scripts/cleanup-duplicate-agents.ts --live');
    }

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const isLive = args.includes('--live');

cleanupDuplicates(!isLive);
