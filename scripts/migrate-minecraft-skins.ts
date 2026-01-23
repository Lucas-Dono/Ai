/**
 * Script de migración: Aplicar MinecraftSkinTraits a personajes existentes
 *
 * Lee el archivo generado por el agente con todos los traits y actualiza
 * la base de datos con metadata.minecraft.skinTraits para cada agente.
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

interface CharacterSkinData {
  characterName: string;
  imageAnalyzed: string;
  minecraftSkinTraits: {
    version: 1;
    gender: 'male' | 'female' | 'non_binary';
    skinTone: string;
    hairColor: string;
    eyeColor: string;
    hairStyle: 'short' | 'long' | 'bald' | 'ponytail' | 'curly';
    clothingStyle: 'modern' | 'fantasy' | 'medieval' | 'casual' | 'formal' | 'athletic';
    hasGlasses: boolean;
    hasHat: boolean;
    hasFacialHair: boolean;
    templateId: string;
    generatedAt: string;
  };
}

interface BatchData {
  processedAt: string;
  total: number;
  characters: CharacterSkinData[];
}

async function main() {
  console.log('🎮 Migración de MinecraftSkinTraits\n');

  // 1. Leer archivo JSON generado
  const batchFilePath = path.join(process.cwd(), 'scripts/minecraft-skin-traits-batch.json');

  console.log('📖 Leyendo archivo de traits...');
  const fileContent = await fs.readFile(batchFilePath, 'utf-8');
  const batchData: BatchData = JSON.parse(fileContent);

  console.log(`✓ Archivo cargado: ${batchData.total} personajes encontrados\n`);

  // Estadísticas
  let updated = 0;
  let notFound = 0;
  let errors = 0;
  const notFoundList: string[] = [];

  // 2. Procesar cada personaje
  for (const character of batchData.characters) {
    try {
      // Normalizar nombre del personaje para búsqueda
      // El nombre puede tener variaciones: "albert-einstein" vs "Albert Einstein"
      const searchName = character.characterName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Buscar agente por nombre (case insensitive)
      const agent = await prisma.agent.findFirst({
        where: {
          OR: [
            { name: { equals: searchName, mode: 'insensitive' } },
            { name: { equals: character.characterName, mode: 'insensitive' } },
            {
              // Buscar por nombre parcial si no coincide exacto
              name: {
                contains: searchName.split(' ')[0],
                mode: 'insensitive'
              }
            }
          ]
        },
      });

      if (!agent) {
        console.log(`⚠️  Agente no encontrado: ${character.characterName} (buscado como: "${searchName}")`);
        notFound++;
        notFoundList.push(character.characterName);
        continue;
      }

      // Obtener metadata actual
      const currentMetadata = (agent.metadata as any) || {};

      // Actualizar con skinTraits
      const updatedMetadata = {
        ...currentMetadata,
        minecraft: {
          compatible: true,
          skinTraits: character.minecraftSkinTraits,
          generatedAt: new Date().toISOString(),
        },
      };

      // Guardar en BD
      await prisma.agent.update({
        where: { id: agent.id },
        data: {
          metadata: updatedMetadata,
        },
      });

      console.log(`✓ ${agent.name} (${agent.id.substring(0, 8)}...)`);
      updated++;

    } catch (error) {
      console.error(`❌ Error procesando ${character.characterName}:`, error);
      errors++;
    }
  }

  // 3. Resumen final
  console.log('\n' + '═'.repeat(60));
  console.log('📊 Resumen de Migración:');
  console.log('═'.repeat(60));
  console.log(`✅ Actualizados:     ${updated}/${batchData.total}`);
  console.log(`⚠️  No encontrados:   ${notFound}/${batchData.total}`);
  console.log(`❌ Errores:          ${errors}/${batchData.total}`);

  if (notFoundList.length > 0) {
    console.log('\n🔍 Personajes no encontrados en BD:');
    notFoundList.forEach(name => console.log(`   - ${name}`));
  }

  console.log('\n✨ Migración completada!\n');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});
