#!/usr/bin/env tsx

/**
 * Script para pre-generar audios de Academia Sakura
 * Genera y guarda todos los audios de diálogos predefinidos
 * Ejecutar con: npx tsx scripts/pregenerate-academia-voices.ts
 */

import { PrismaClient } from '@prisma/client';
import { getElevenLabsClient } from '../lib/voice-system/elevenlabs-client';
import { cleanTextForTTS, hasSpokenContent } from '../lib/voice-system/text-cleaner';
import { getVoiceConfig, getVoiceSettings } from '../lib/voice-system/voice-config';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🎤 Pre-generando audios de Academia Sakura...\n');

  try {
    // 1. Buscar el mundo Academia Sakura
    const world = await prisma.world.findFirst({
      where: {
        name: { contains: 'Academia Sakura' },
      },
      include: {
        interactions: {
          orderBy: { turnNumber: 'asc' },
          include: {
            speaker: {
              select: {
                id: true,
                name: true,
                voiceId: true,
              },
            },
          },
        },
      },
    });

    if (!world) {
      console.log('❌ Academia Sakura no encontrada.');
      return;
    }

    console.log(`📍 Mundo: ${world.name}`);
    console.log(`📝 Interacciones encontradas: ${world.interactions.length}\n`);

    // 2. Crear directorio para audios si no existe
    const audioDir = path.join(process.cwd(), 'public', 'worlds', 'academia-sakura', 'audio');
    await fs.mkdir(audioDir, { recursive: true });

    console.log(`📁 Directorio de audios: ${audioDir}\n`);

    // 3. Pre-generar audios
    const elevenlabs = getElevenLabsClient();
    let generated = 0;
    let skipped = 0;
    let errors = 0;

    for (const interaction of world.interactions) {
      const speaker = interaction.speaker;

      // Verificar si el speaker tiene voiceId
      if (!speaker?.voiceId) {
        console.log(`⏭️  Turn ${interaction.turnNumber}: ${speaker?.name || 'Unknown'} - Sin voz configurada`);
        skipped++;
        continue;
      }

      // Nombre del archivo de audio
      const audioFileName = `turn-${interaction.turnNumber}-${speaker.id}.mp3`;
      const audioFilePath = path.join(audioDir, audioFileName);

      // Verificar si ya existe
      try {
        await fs.access(audioFilePath);
        console.log(`✓  Turn ${interaction.turnNumber}: ${speaker.name} - Ya existe`);

        // Actualizar interacción con la URL del audio si no la tiene
        if (!interaction.metadata || !(interaction.metadata as any).audioUrl) {
          await prisma.worldInteraction.update({
            where: { id: interaction.id },
            data: {
              metadata: {
                ...(interaction.metadata as any || {}),
                audioUrl: `/worlds/academia-sakura/audio/${audioFileName}`,
              },
            },
          });
        }

        skipped++;
        continue;
      } catch {
        // El archivo no existe, generarlo
      }

      try {
        console.log(`🎙️  Turn ${interaction.turnNumber}: Generando voz para ${speaker.name}...`);

        // Limpiar texto de acciones, risas, etc.
        const cleanedText = cleanTextForTTS(interaction.content);

        // Verificar que hay contenido hablable
        if (!hasSpokenContent(cleanedText)) {
          console.log(`   ⏭️  Sin contenido hablable después de limpiar`);
          skipped++;
          continue;
        }

        // Obtener configuración del personaje
        const voiceConfig = getVoiceConfig(speaker.voiceId);
        const voiceSettings = getVoiceSettings(speaker.voiceId);

        console.log(`   📝 Original: ${interaction.content.substring(0, 50)}...`);
        console.log(`   ✨ Limpio:   ${cleanedText.substring(0, 50)}...`);
        console.log(`   ⚙️  Config:   Speed ${voiceConfig.speed}x, Stability ${voiceSettings.stability}`);

        // Generar audio con configuración mejorada
        const result = await elevenlabs.generateSpeechToFile(
          cleanedText,
          speaker.voiceId,
          audioFilePath,
          {
            currentEmotion: (interaction.speakerEmotion as any)?.type || 'neutral',
            intensity: 0.6,
            mood: {
              valence: 0.5,
              arousal: 0.5,
              dominance: 0.5,
            },
            ...voiceSettings,
          }
        );

        // Actualizar interacción con la URL del audio y metadata
        await prisma.worldInteraction.update({
          where: { id: interaction.id },
          data: {
            metadata: {
              ...(interaction.metadata as any || {}),
              audioUrl: `/worlds/academia-sakura/audio/${audioFileName}`,
              voiceGenerated: true,
              generatedAt: new Date().toISOString(),
              cleanedText, // Guardar texto limpio para referencia
              voiceConfig: {
                speed: voiceConfig.speed,
                stability: voiceSettings.stability,
              },
            },
          },
        });

        console.log(`   ✅ Audio generado: ${audioFileName} (${voiceConfig.speed}x speed)`);
        generated++;

        // Pequeña pausa para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`   ❌ Error generando audio para turn ${interaction.turnNumber}:`, error);
        errors++;
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`   ✅ Generados: ${generated}`);
    console.log(`   ⏭️  Saltados: ${skipped}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📝 Total: ${world.interactions.length}`);

    if (generated > 0) {
      console.log('\n🎉 ¡Audios pre-generados exitosamente!');
      console.log('💡 Los audios se reproducirán sin costo adicional.');
      console.log(`📁 Ubicación: ${audioDir}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
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
