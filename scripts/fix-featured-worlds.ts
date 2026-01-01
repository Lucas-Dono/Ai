/**
 * SCRIPT OBSOLETO
 * Este script usa el modelo 'World' que fue migrado a 'Group'
 * Mantenerlo solo para referencia histórica
 */

/*
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Arreglando mundos destacados...");

  // Primero, quitar featured de todos los mundos
  const unfeatured = await prisma.world.updateMany({
    where: { featured: true },
    data: { featured: false },
  });

  console.log(`✅ Se quitó el estado 'featured' de ${unfeatured.count} mundos`);

  // Buscar Academia Sakura y marcarlo como featured
  const academiaSakura = await prisma.world.findFirst({
    where: {
      name: {
        contains: "Academia Sakura",
        mode: "insensitive",
      },
    },
  });

  if (academiaSakura) {
    await prisma.world.update({
      where: { id: academiaSakura.id },
      data: { featured: true },
    });
    console.log(`⭐ Academia Sakura marcado como destacado`);
  } else {
    console.log(`⚠️  No se encontró Academia Sakura`);
  }

  // Mostrar resumen de mundos featured
  const featuredWorlds = await prisma.world.findMany({
    where: { featured: true },
    select: { id: true, name: true, featured: true },
  });

  console.log("\n📊 Mundos destacados actuales:");
  featuredWorlds.forEach((world: any) => {
    console.log(`  - ${world.name} (${world.id})`);
  });

  if (featuredWorlds.length === 0) {
    console.log("  (ninguno)");
  }

  console.log("\n✨ Proceso completado");
}

main()
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
*/

console.log('❌ Este script está obsoleto. El sistema World fue migrado a Group.');
console.log('💡 Usa los nuevos scripts de gestión de grupos en su lugar.');
