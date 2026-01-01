/**
 * SCRIPT OBSOLETO
 * Este script usa el modelo 'World' que fue migrado a 'Group'
 * Mantenerlo solo para referencia histórica
 */

/*
import { prisma } from "../lib/prisma";

async function cleanupWorlds() {
  console.log("🔍 Buscando mundos en la base de datos...\n");

  // Listar todos los mundos
  const allWorlds = await prisma.world.findMany({
    select: {
      id: true,
      name: true,
      isPredefined: true,
      _count: {
        select: {
          worldAgents: true,
          interactions: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`📊 Total de mundos encontrados: ${allWorlds.length}\n`);

  // Mostrar todos los mundos
  allWorlds.forEach((world: any, idx: number) => {
    console.log(`${idx + 1}. ${world.name}`);
    console.log(`   ID: ${world.id}`);
    console.log(`   Predefinido: ${world.isPredefined ? 'Sí' : 'No'}`);
    console.log(`   Agentes: ${world._count.worldAgents}`);
    console.log(`   Interacciones: ${world._count.interactions}`);
    console.log();
  });

  // Buscar Academia Sakura
  const academiaSakura = allWorlds.find((w: any) =>
    w.name.toLowerCase().includes('academia') &&
    w.name.toLowerCase().includes('sakura')
  );

  if (!academiaSakura) {
    console.log("❌ No se encontró el mundo 'Academia Sakura - Primavera del Amor'");
    console.log("   No se eliminará ningún mundo por seguridad.");
    return;
  }

  console.log(`✅ Mundo a mantener: ${academiaSakura.name} (${academiaSakura.id})\n`);

  // Mundos a eliminar
  const worldsToDelete = allWorlds.filter((w: any) => w.id !== academiaSakura.id);

  if (worldsToDelete.length === 0) {
    console.log("ℹ️  No hay mundos para eliminar. Solo existe Academia Sakura.");
    return;
  }

  console.log(`🗑️  Mundos a eliminar: ${worldsToDelete.length}\n`);
  worldsToDelete.forEach((w: any) => console.log(`   - ${w.name} (${w.id})`));

  console.log("\n⚠️  Iniciando eliminación en cascada...\n");

  // Eliminar en cascada (gracias a onDelete: Cascade en schema.prisma)
  for (const world of worldsToDelete) {
    console.log(`🗑️  Eliminando: ${world.name}...`);

    try {
      await prisma.world.delete({
        where: { id: world.id }
      });
      console.log(`   ✅ Eliminado correctamente\n`);
    } catch (error) {
      console.error(`   ❌ Error al eliminar:`, error);
    }
  }

  // Verificar resultado final
  const remainingWorlds = await prisma.world.findMany({
    select: { id: true, name: true }
  });

  console.log("\n✨ Resultado final:");
  console.log(`📊 Mundos restantes: ${remainingWorlds.length}\n`);
  remainingWorlds.forEach((w: any) => console.log(`   ✓ ${w.name} (${w.id})`));

  console.log("\n✅ Limpieza completada!");
}

cleanupWorlds()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
*/

console.log('❌ Este script está obsoleto. El sistema World fue migrado a Group.');
console.log('💡 Usa los nuevos scripts de gestión de grupos en su lugar.');
