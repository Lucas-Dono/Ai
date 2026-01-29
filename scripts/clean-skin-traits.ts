/**
 * Script para limpiar skinTraits bugueados de la base de datos
 *
 * Esto forzará a los agentes a no tener skin de Minecraft,
 * usando la skin por defecto (Steve/Alex) hasta que se generen nuevas.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanBuggedSkinTraits() {
  console.log('🔍 Buscando agentes con skinTraits...');

  // Obtener todos los agentes que tienen skinTraits
  const agents = await prisma.agent.findMany({
    where: {
      metadata: {
        path: ['minecraft', 'skinTraits'],
        not: null,
      },
    },
    select: {
      id: true,
      name: true,
      metadata: true,
    },
  });

  console.log(`📊 Encontrados ${agents.length} agentes con skinTraits\n`);

  if (agents.length === 0) {
    console.log('✅ No hay skinTraits para limpiar');
    return;
  }

  // Mostrar lista
  console.log('Agentes con skinTraits:');
  agents.forEach((agent, i) => {
    console.log(`  ${i + 1}. ${agent.name} (${agent.id})`);
  });

  console.log('\n⚠️  Se eliminarán los skinTraits de estos agentes.');
  console.log('💡 Los agentes usarán skin por defecto (Steve/Alex) hasta regenerar skins.\n');

  // Eliminar skinTraits de todos los agentes
  for (const agent of agents) {
    const metadata = agent.metadata as any;

    if (metadata?.minecraft?.skinTraits) {
      // Eliminar skinTraits
      delete metadata.minecraft.skinTraits;

      // Si minecraft quedó vacío, eliminarlo también
      if (Object.keys(metadata.minecraft).length === 0) {
        delete metadata.minecraft;
      }

      // Actualizar en BD
      await prisma.agent.update({
        where: { id: agent.id },
        data: { metadata },
      });

      console.log(`✅ Limpiado: ${agent.name}`);
    }
  }

  console.log(`\n🎉 Limpieza completada: ${agents.length} agentes actualizados`);
  console.log('\n📝 Próximos pasos:');
  console.log('  1. En Minecraft, ejecuta: /blaniel clearskins');
  console.log('  2. Los personajes usarán skin por defecto');
  console.log('  3. Para generar nuevas skins: usar sistema de generación manual de skins');
}

cleanBuggedSkinTraits()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('❌ Error:', error);
    prisma.$disconnect();
    process.exit(1);
  });
