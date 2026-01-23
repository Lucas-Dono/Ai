/**
 * Script de inicialización de estados para agentes existentes
 *
 * Crea InternalState para todos los agentes que no lo tengan.
 * Esto es necesario para que las features de sincronización funcionen.
 *
 * Ejecutar con: npx tsx scripts/init-agent-states.ts
 */

import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

async function initAgentStates() {
  console.log("🚀 Iniciando configuración de estados para agentes...\n");

  // 1. Obtener agentes sin InternalState
  const agentsWithoutState = await prisma.agent.findMany({
    where: { InternalState: null },
    select: {
      id: true,
      name: true,
      PersonalityCore: {
        select: {
          extraversion: true,
          neuroticism: true,
          openness: true,
        }
      }
    },
  });

  console.log(`📊 Agentes sin InternalState: ${agentsWithoutState.length}`);

  if (agentsWithoutState.length === 0) {
    console.log("✅ Todos los agentes ya tienen InternalState");
    return;
  }

  // 2. Crear InternalState para cada agente
  let created = 0;
  for (const agent of agentsWithoutState) {
    try {
      // Valores base con ligera variación según personalidad
      const extraversion = agent.PersonalityCore?.extraversion ?? 50;
      const neuroticism = agent.PersonalityCore?.neuroticism ?? 50;
      const openness = agent.PersonalityCore?.openness ?? 50;

      // Calcular mood inicial basado en personalidad
      // Extraversión alta = valence más positiva
      // Neuroticismo alto = arousal más alto
      const baseValence = ((extraversion - 50) / 100) * 0.3; // -0.15 a +0.15
      const baseArousal = 0.3 + ((neuroticism - 50) / 100) * 0.2; // 0.2 a 0.4
      const baseDominance = 0.5 + ((openness - 50) / 100) * 0.1; // 0.45 a 0.55

      await prisma.internalState.create({
        data: {
          id: nanoid(),
          agentId: agent.id,
          // Emociones iniciales neutrales
          currentEmotions: {
            joy: 0.3,
            interest: 0.4,
            calm: 0.5,
          },
          // Mood basado en personalidad
          moodValence: baseValence,
          moodArousal: baseArousal,
          moodDominance: baseDominance,
          // Parámetros de decay
          emotionDecayRate: 0.1,
          emotionInertia: 0.3,
          // Necesidades psicológicas en equilibrio
          needConnection: 0.5,
          needAutonomy: 0.5,
          needCompetence: 0.5,
          needNovelty: 0.5,
          // Sin goals activos inicialmente
          activeGoals: [],
          // Buffer de conversación vacío
          conversationBuffer: [],
        },
      });

      created++;
      console.log(`  ✓ ${agent.name}`);
    } catch (error) {
      console.error(`  ✗ Error con ${agent.name}:`, error);
    }
  }

  console.log(`\n✅ InternalState creado para ${created} agentes`);

  // 3. Resumen final
  const finalCounts = await Promise.all([
    prisma.agent.count(),
    prisma.internalState.count(),
  ]);

  console.log(`\n📈 Estado final:`);
  console.log(`   - Agentes totales: ${finalCounts[0]}`);
  console.log(`   - Con InternalState: ${finalCounts[1]}`);
}

async function main() {
  try {
    await initAgentStates();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
