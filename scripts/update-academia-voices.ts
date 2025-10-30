#!/usr/bin/env tsx

/**
 * Script para actualizar los voice IDs de los personajes de Academia Sakura
 * Ejecutar con: npx tsx scripts/update-academia-voices.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Voice IDs de Eleven Labs para cada personaje
const VOICE_IDS = {
  'Hana Sakamoto': 'xzWD1ftyNVsuUMY2ll3j',    // Tsundere
  'Yuki Tanaka': 'iFhPOZcajR7W3sDL39qJ',      // Deportista (femenina) ✅
  'Aiko Miyazaki': 'CaJslL1xziwefCeTNzHv',   // Tímida
  'Kenji Yamamoto': 'wo6udizrrtpIxWGp2qJk',  // Otaku
};

async function main() {
  console.log('🎤 Actualizando voice IDs de Academia Sakura...\n');

  let updated = 0;
  let notFound = 0;

  for (const [characterName, voiceId] of Object.entries(VOICE_IDS)) {
    try {
      // Buscar el personaje por nombre
      const agent = await prisma.agent.findFirst({
        where: {
          name: characterName,
        },
      });

      if (!agent) {
        console.log(`❌ ${characterName}: No encontrado`);
        notFound++;
        continue;
      }

      // Actualizar el voiceId
      await prisma.agent.update({
        where: { id: agent.id },
        data: { voiceId },
      });

      console.log(`✅ ${characterName}: Voice ID actualizado (${voiceId})`);
      updated++;
    } catch (error) {
      console.error(`❌ Error actualizando ${characterName}:`, error);
    }
  }

  console.log('\n📊 Resumen:');
  console.log(`   ✅ Actualizados: ${updated}`);
  console.log(`   ❌ No encontrados: ${notFound}`);
  console.log(`   📝 Total: ${Object.keys(VOICE_IDS).length}`);

  if (updated > 0) {
    console.log('\n🎉 ¡Voces actualizadas exitosamente!');
    console.log('💡 Los personajes ahora tendrán voz en las interacciones.');
  }
}

main()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
