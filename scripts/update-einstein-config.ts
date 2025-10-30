#!/usr/bin/env tsx

/**
 * Script para actualizar la configuración de Albert Einstein
 * Actualiza el avatar y la voz
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando Albert Einstein en la base de datos...\n');

  try {
    const einstein = await prisma.agent.findFirst({
      where: { name: "Albert Einstein" },
      include: {
        voiceConfig: true,
      }
    });

    if (!einstein) {
      console.log('❌ Albert Einstein no existe en la base de datos.');
      console.log('   Ejecuta: npm run db:seed:einstein');
      console.log('');
      return;
    }

    console.log('✅ Encontrado Albert Einstein');
    console.log(`   ID: ${einstein.id}`);
    console.log(`   Avatar actual: ${einstein.avatar}`);
    console.log(`   Voz actual: ${einstein.voiceConfig?.voiceId || 'N/A'}`);
    console.log('');

    // Actualizar avatar si es necesario
    if (einstein.avatar !== "/Albert Einstein.png") {
      console.log('📸 Actualizando avatar...');
      await prisma.agent.update({
        where: { id: einstein.id },
        data: { avatar: "/Albert Einstein.png" }
      });
      console.log('✅ Avatar actualizado a: /Albert Einstein.png');
    } else {
      console.log('✅ Avatar ya está configurado correctamente');
    }

    // Actualizar configuración de voz
    if (einstein.voiceConfig) {
      if (einstein.voiceConfig.voiceId !== "0geCr4xSMhS4uwbapqVu") {
        console.log('🎤 Actualizando voz...');
        await prisma.voiceConfig.update({
          where: { id: einstein.voiceConfig.id },
          data: {
            voiceId: "0geCr4xSMhS4uwbapqVu",
            voiceName: "Einstein Voice (Eleven Labs)",
            selectionConfidence: 0.95,
            manualSelection: true,
          }
        });
        console.log('✅ Voz actualizada a: 0geCr4xSMhS4uwbapqVu (Eleven Labs)');
      } else {
        console.log('✅ Voz ya está configurada correctamente');
      }
    } else {
      console.log('🎤 Creando configuración de voz...');
      await prisma.voiceConfig.create({
        data: {
          agentId: einstein.id,
          voiceId: "0geCr4xSMhS4uwbapqVu",
          voiceName: "Einstein Voice (Eleven Labs)",
          gender: "male",
          age: "old",
          accent: "de-DE",
          characterDescription: "Voz masculina mayor con acento alemán distintivo. Debe sonar sabio, contemplativo, con toque de humor. Einstein nunca perdió su acento alemán viviendo en USA. Voz cálida cuando habla de física, más tensa cuando habla de familia.",
          selectionConfidence: 0.95,
          manualSelection: true,
          defaultStability: 0.6,
          defaultSimilarityBoost: 0.75,
          defaultStyle: 0.5,
          enableVoiceInput: true,
          enableVoiceOutput: true,
          autoPlayVoice: false,
          voiceSpeed: 0.9,
        }
      });
      console.log('✅ Configuración de voz creada');
    }

    console.log('');
    console.log('🎉 ¡Configuración de Albert Einstein actualizada exitosamente!');
    console.log('');
    console.log('📊 Configuración final:');
    console.log(`   - Avatar: /Albert Einstein.png`);
    console.log(`   - Voz: 0geCr4xSMhS4uwbapqVu (Eleven Labs)`);
    console.log('');
    console.log('🎭 Puedes interactuar con él en:');
    console.log(`   http://localhost:3000/agentes/${einstein.id}`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Error actualizando Einstein:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
