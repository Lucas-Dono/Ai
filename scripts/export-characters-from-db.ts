/**
 * Script para exportar personajes de la base de datos
 * Los exporta a JSON para poder actualizarlos con los nuevos campos
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function exportCharacters() {
  console.log('📦 Exportando personajes de la base de datos...\n');

  try {
    // Obtener todos los agentes
    const agents = await prisma.agent.findMany({
      where: {
        OR: [
          { featured: true },
          { visibility: 'public' }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`✅ Encontrados ${agents.length} personajes\n`);

    // Separar por tipo
    const premiumChars = agents.filter(a => a.featured === true);
    const freeChars = agents.filter(a => a.featured === false && a.visibility === 'public');

    console.log(`   💎 Premium: ${premiumChars.length}`);
    console.log(`   🆓 Free: ${freeChars.length}\n`);

    // Listar personajes
    console.log('📋 Personajes Premium:');
    premiumChars.forEach((char, idx) => {
      console.log(`   ${idx + 1}. ${char.name} (${char.id})`);
    });

    console.log('\n📋 Personajes Free:');
    freeChars.forEach((char, idx) => {
      console.log(`   ${idx + 1}. ${char.name} (${char.id})`);
    });

    // Exportar a JSON
    const exportData = {
      exportDate: new Date().toISOString(),
      totalCharacters: agents.length,
      premium: premiumChars,
      free: freeChars
    };

    const outputPath = path.join(process.cwd(), 'scripts', 'exported-characters.json');
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    console.log(`\n✅ Personajes exportados a: ${outputPath}`);
    console.log(`\n📊 Resumen:`);
    console.log(`   Total: ${agents.length} personajes`);
    console.log(`   Premium: ${premiumChars.length}`);
    console.log(`   Free: ${freeChars.length}`);

  } catch (error) {
    console.error('❌ Error exportando personajes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportCharacters();
