/**
 * Script para mostrar todos los prompts asignados a la IA "Anya"
 *
 * Muestra:
 * - System prompt base
 * - Prompts por etapa de relación (5 stages)
 * - Prompts de behaviors si tiene alguno activo
 * - Reglas anti-roleplay
 * - Guidelines por etapa
 */

import { prisma } from "@/lib/prisma";
import { ANTI_ROLEPLAY_RULES } from "@/lib/relationship/prompt-generator";

async function main() {
  console.log("=".repeat(80));
  console.log("TODOS LOS PROMPTS ASIGNADOS A ANYA");
  console.log("=".repeat(80));
  console.log();

  // Buscar el agente Anya
  const agent = await prisma.agent.findFirst({
    where: {
      name: "Anya",
      kind: "companion",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      internalState: true,
      behaviorProfiles: true,
    },
  });

  if (!agent) {
    console.error("❌ No se encontró ninguna IA llamada 'Anya' de tipo companion");
    return;
  }

  console.log(`✅ IA encontrada: ${agent.name}`);
  console.log(`   ID: ${agent.id}`);
  console.log(`   Tipo: ${agent.kind}`);
  console.log(`   NSFW Mode: ${agent.nsfwMode ? "Sí" : "No"}`);
  console.log(`   Creada: ${agent.createdAt.toLocaleString("es")}`);
  console.log();

  // 1. SYSTEM PROMPT BASE
  console.log("━".repeat(80));
  console.log("1️⃣  SYSTEM PROMPT BASE");
  console.log("━".repeat(80));
  console.log();
  console.log(agent.systemPrompt);
  console.log();

  // 2. PROMPTS POR ETAPA DE RELACIÓN
  if (agent.stagePrompts) {
    const stagePrompts = agent.stagePrompts as any;
    const currentStage = "stranger"; // Default stage

    console.log("━".repeat(80));
    console.log("2️⃣  PROMPTS POR ETAPA DE RELACIÓN");
    console.log("━".repeat(80));
    console.log();
    console.log(`📍 Etapa actual: ${currentStage?.toUpperCase() || "STRANGER"}`);
    console.log();

    const stages = ["stranger", "acquaintance", "friend", "close", "intimate"];
    const stageLabels = {
      stranger: "DESCONOCIDO (0-10 mensajes)",
      acquaintance: "CONOCIDO (11-30 mensajes)",
      friend: "AMIGO (31-100 mensajes)",
      close: "CERCANO (101-200 mensajes)",
      intimate: "ÍNTIMO (200+ mensajes)",
    };

    for (const stage of stages) {
      const isCurrentStage = stage === currentStage;
      const marker = isCurrentStage ? "👉 " : "   ";

      console.log(`${marker}${"─".repeat(75)}`);
      console.log(`${marker}ETAPA: ${stage.toUpperCase()} - ${stageLabels[stage as keyof typeof stageLabels]}`);
      console.log(`${marker}${"─".repeat(75)}`);

      if (stagePrompts[stage]) {
        console.log(stagePrompts[stage]);
      } else {
        console.log("   (No hay prompt específico para esta etapa)");
      }
      console.log();
    }
  } else {
    console.log("━".repeat(80));
    console.log("2️⃣  PROMPTS POR ETAPA DE RELACIÓN");
    console.log("━".repeat(80));
    console.log();
    console.log("⚠️  No se han generado prompts por etapa aún.");
    console.log("    Se generarán automáticamente en la primera interacción.");
    console.log();
  }

  // 3. BEHAVIORS ACTIVOS
  if (agent.behaviorProfiles && agent.behaviorProfiles.length > 0) {
    console.log("━".repeat(80));
    console.log("3️⃣  BEHAVIORS ACTIVOS");
    console.log("━".repeat(80));
    console.log();

    for (const behavior of agent.behaviorProfiles) {
      console.log(`📌 Behavior: ${behavior.behaviorType}`);
      console.log(`   Intensidad base: ${(behavior.baseIntensity * 100).toFixed(1)}%`);
      console.log(`   Fase actual: ${behavior.currentPhase}`);
      console.log(`   Escalation rate: ${behavior.escalationRate}`);
      console.log(`   De-escalation rate: ${behavior.deEscalationRate}`);
      console.log();
    }

    console.log("ℹ️  Los prompts específicos de behaviors se generan dinámicamente");
    console.log("   basándose en la fase actual, emoción dominante y triggers recientes.");
    console.log();
  } else {
    console.log("━".repeat(80));
    console.log("3️⃣  BEHAVIORS ACTIVOS");
    console.log("━".repeat(80));
    console.log();
    console.log("   Sin comportamiento especial");
    console.log("   Personalidad base sin patrones psicológicos complejos");
    console.log();
  }

  // 4. PERSONALIDAD Y CONFIGURACIÓN
  console.log("━".repeat(80));
  console.log("4️⃣  CONFIGURACIÓN DEL PERSONAJE");
  console.log("━".repeat(80));
  console.log();

  const profile = agent.profile as any;
  console.log(`Personalidad: ${agent.personality}`);
  if (profile?.purpose) console.log(`Propósito: ${profile.purpose}`);
  if (profile?.tone) console.log(`Tono: ${profile.tone}`);
  if (profile?.age) console.log(`Edad: ${profile.age}`);
  console.log(`NSFW Mode: ${agent.nsfwMode ? "Activado" : "Desactivado"}`);
  console.log();

  // 5. ESTADÍSTICAS DE INTERACCIÓN
  // Comentado temporalmente - estos datos están en Relation o BehaviorProgressionState, no en InternalState
  // if (agent.internalState) {
  //   const state = agent.internalState;
  //   console.log("━".repeat(80));
  //   console.log("5️⃣  ESTADÍSTICAS DE RELACIÓN");
  //   console.log("━".repeat(80));
  //   console.log();
  //   console.log(`Total interacciones: ${state.totalInteractions}`);
  //   console.log(`Etapa actual: ${state.currentStage}`);
  //   console.log(`Trust: ${(state.trust * 100).toFixed(1)}%`);
  //   console.log(`Affinity: ${(state.affinity * 100).toFixed(1)}%`);
  //   console.log(`Respect: ${(state.respect * 100).toFixed(1)}%`);
  //   console.log();
  // }

  console.log("=".repeat(80));
  console.log("FIN DEL REPORTE DE PROMPTS");
  console.log("=".repeat(80));
}

main()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
