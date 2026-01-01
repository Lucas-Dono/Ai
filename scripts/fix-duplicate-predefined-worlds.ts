/**
 * SCRIPT OBSOLETO
 * Este script usa el modelo 'World' que fue migrado a 'Group'
 * Mantenerlo solo para referencia histórica
 */

/*
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando mundos predefinidos duplicados...\n');

  // Obtener todos los mundos predefinidos
  const predefinedWorlds = await prisma.world.findMany({
    where: {
      isPredefined: true,
    },
    orderBy: {
      createdAt: 'asc', // Más antiguos primero
    },
  });

  console.log(`📊 Total de mundos predefinidos: ${predefinedWorlds.length}\n`);

  // Agrupar por nombre
  const worldsByName = new Map<string, typeof predefinedWorlds>();
  for (const world of predefinedWorlds) {
    if (!worldsByName.has(world.name)) {
      worldsByName.set(world.name, []);
    }
    worldsByName.get(world.name)!.push(world);
  }

  // Identificar duplicados
  const duplicates: string[] = [];
  for (const [name, worlds] of worldsByName) {
    if (worlds.length > 1) {
      console.log(`⚠️  Duplicados encontrados para "${name}": ${worlds.length} copias`);
      console.log(`   IDs: ${worlds.map((w: any) => w.id).join(', ')}`);

      // Mantener el primero (más antiguo), eliminar el resto
      const toKeep = worlds[0];
      const toDelete = worlds.slice(1);

      console.log(`   ✅ Mantener: ${toKeep.id} (creado: ${toKeep.createdAt})`);
      console.log(`   🗑️  Eliminar: ${toDelete.map((w: any) => `${w.id} (${w.createdAt})`).join(', ')}`);

      duplicates.push(...toDelete.map((w: any) => w.id));
      console.log('');
    }
  }

  if (duplicates.length === 0) {
    console.log('✅ No se encontraron duplicados\n');
    return;
  }

  console.log(`\n🗑️  Total de mundos a eliminar: ${duplicates.length}\n`);
  console.log('⏳ Eliminando duplicados...\n');

  // Eliminar las referencias en worldAgents primero
  const deletedWorldAgents = await prisma.worldAgent.deleteMany({
    where: {
      worldId: {
        in: duplicates,
      },
    },
  });
  console.log(`   Eliminadas ${deletedWorldAgents.count} referencias en worldAgents`);

  // Eliminar las referencias en messages
  const deletedMessages = await prisma.message.deleteMany({
    where: {
      worldId: {
        in: duplicates,
      },
    },
  });
  console.log(`   Eliminados ${deletedMessages.count} mensajes`);

  // Eliminar las referencias en worldInteractions
  const deletedInteractions = await prisma.worldInteraction.deleteMany({
    where: {
      worldId: {
        in: duplicates,
      },
    },
  });
  console.log(`   Eliminadas ${deletedInteractions.count} interacciones`);

  // Eliminar worldSimulationState
  const deletedStates = await prisma.groupSimulationState.deleteMany({
    where: {
      worldId: {
        in: duplicates,
      },
    },
  });
  console.log(`   Eliminados ${deletedStates.count} estados de simulación`);

  // Finalmente, eliminar los mundos duplicados
  const deletedWorlds = await prisma.world.deleteMany({
    where: {
      id: {
        in: duplicates,
      },
    },
  });

  console.log(`\n✅ Eliminados ${deletedWorlds.count} mundos duplicados`);

  // Verificar resultado
  const remaining = await prisma.world.findMany({
    where: {
      isPredefined: true,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  console.log(`\n📋 Mundos predefinidos restantes: ${remaining.length}`);
  for (const world of remaining) {
    console.log(`   - ${world.name} (${world.id})`);
  }
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
*/

console.log('❌ Este script está obsoleto. El sistema World fue migrado a Group.');
console.log('💡 Usa los nuevos scripts de gestión de grupos en su lugar.');
