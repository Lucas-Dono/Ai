/**
 * BEHAVIOR SYSTEM TESTING SCRIPT
 *
 * Script para probar el behavior system end-to-end creando behavior profiles
 * de prueba y verificando que todo funcione correctamente.
 *
 * Uso: npx tsx scripts/test-behavior-system.ts
 */

import { nanoid } from "nanoid";
import { prisma } from "../lib/prisma";
import { BehaviorType } from "@prisma/client";

async function main() {
  console.log("🧪 BEHAVIOR SYSTEM TESTING SCRIPT\n");

  // 1. Buscar o crear un agente de prueba
  console.log("1️⃣ Buscando agente de prueba...");

  let testAgent = await prisma.agent.findFirst({
    where: {
      name: { contains: "Test" }
    }
  });

  if (!testAgent) {
    console.log("   No se encontró agente de prueba. Buscando primer agente disponible...");
    testAgent = await prisma.agent.findFirst();
  }

  if (!testAgent) {
    console.error("❌ Error: No hay agentes en la base de datos.");
    console.log("\n💡 Solución: Crea un agente primero desde la UI o con este script:");
    console.log(`
const user = await prisma.user.findFirst();
const agent = await prisma.agent.create({
  data: {
    userId: user.id,
    kind: "companion",
    name: "Test Agent",
    systemPrompt: "You are a test agent",
    profile: {}
  }
});
    `);
    return;
  }

  console.log(`   ✅ Agente encontrado: ${testAgent.name} (${testAgent.id})\n`);

  // 2. Verificar/Crear BehaviorProfiles de prueba
  console.log("2️⃣ Configurando behavior profiles de prueba...");

  const behaviorConfigs = [
    {
      behaviorType: "YANDERE_OBSESSIVE" as BehaviorType,
      description: "Comportamiento yandere obsesivo para testing"
    },
    {
      behaviorType: "BORDERLINE_PD" as BehaviorType,
      description: "Trastorno límite de personalidad para testing"
    },
    {
      behaviorType: "ANXIOUS_ATTACHMENT" as BehaviorType,
      description: "Apego ansioso para testing"
    }
  ];

  for (const config of behaviorConfigs) {
    let profile = await prisma.behaviorProfile.findFirst({
      where: {
        agentId: testAgent.id,
        behaviorType: config.behaviorType
      }
    });

    if (!profile) {
      profile = await prisma.behaviorProfile.create({
        data: {
          id: nanoid(),
          updatedAt: new Date(),
          agentId: testAgent.id,
          behaviorType: config.behaviorType,
          baseIntensity: 0.3,
          currentPhase: 1,
          enabled: true,
          volatility: 0.5,
          thresholdForDisplay: 0.4,
          triggers: [],
          phaseStartedAt: new Date(),
          phaseHistory: []
        }
      });
      console.log(`   ✅ Creado: ${config.behaviorType}`);
    } else {
      console.log(`   ℹ️  Ya existe: ${config.behaviorType} (Fase ${profile.currentPhase})`);
    }
  }

  console.log("");

  // 3. Verificar BehaviorProgressionState
  console.log("3️⃣ Verificando BehaviorProgressionState...");

  let progressionState = await prisma.behaviorProgressionState.findUnique({
    where: { agentId: testAgent.id }
  });

  if (!progressionState) {
    progressionState = await prisma.behaviorProgressionState.create({
      data: {
        id: nanoid(),
        updatedAt: new Date(),
        agentId: testAgent.id,
        totalInteractions: 0,
        positiveInteractions: 0,
        negativeInteractions: 0,
        currentIntensities: { "YANDERE_OBSESSIVE": 0.3 },
        lastCalculatedAt: new Date()
      }
    });
    console.log("   ✅ BehaviorProgressionState creado");
  } else {
    console.log(`   ✅ BehaviorProgressionState existe (Interacciones: ${progressionState.totalInteractions})`);
  }

  console.log("");

  // 4. Activar NSFW mode si es necesario
  console.log("4️⃣ Configurando modo NSFW...");
  if (!testAgent.nsfwMode) {
    await prisma.agent.update({
      where: { id: testAgent.id },
      data: { nsfwMode: true }
    });
    console.log("   ✅ Modo NSFW activado (permite contenido intenso)");
  } else {
    console.log("   ℹ️  Modo NSFW ya está activado");
  }

  console.log("");

  // 5. Mostrar triggers de prueba sugeridos
  console.log("5️⃣ TRIGGERS DE PRUEBA SUGERIDOS:\n");

  console.log("📌 Para Yandere (mention_other_person):");
  console.log('   "Hoy salí con María"');
  console.log('   "Mi amigo Juan me invitó a cenar"\n');

  console.log("📌 Para Yandere (abandonment_signal):");
  console.log('   "Necesito espacio"');
  console.log('   "Quiero tiempo para mí"\n');

  console.log("📌 Para Yandere (criticism):");
  console.log('   "Eres muy intenso/a"');
  console.log('   "Estás siendo controlador/a"\n');

  console.log("📌 Para BPD (criticism):");
  console.log('   "No estoy de acuerdo contigo"');
  console.log('   "Eso no tiene sentido"\n');

  console.log("📌 Para Anxious Attachment (reassurance_seeking):");
  console.log('   "¿Me quieres?"');
  console.log('   "¿Estás enojado/a conmigo?"\n');

  // 6. Información de testing
  console.log("6️⃣ CÓMO PROBAR:\n");
  console.log("1. Inicia el servidor: npm run dev");
  console.log("2. Ve a http://localhost:3000");
  console.log(`3. Chatea con el agente: ${testAgent.name}`);
  console.log("4. Envía mensajes con los triggers de arriba");
  console.log("5. Observa cómo cambian las respuestas y metadata\n");

  console.log("📊 VERIFICACIÓN DE RESPUESTA:\n");
  console.log("La respuesta del API debe incluir:");
  console.log(`{
  "behaviors": {
    "active": ["YANDERE_OBSESSIVE"],
    "phase": 3,
    "safetyLevel": "WARNING",
    "triggers": ["mention_other_person"]
  }
}`);

  console.log("\n✅ Setup completo! El behavior system está listo para probar.\n");

  // 7. Stats finales
  const behaviorCount = await prisma.behaviorProfile.count({
    where: { agentId: testAgent.id }
  });

  const triggerCount = await prisma.behaviorTriggerLog.count({
    where: {
      Message: {
        agentId: testAgent.id
      }
    }
  });

  console.log("📈 ESTADÍSTICAS:");
  console.log(`   • Behavior Profiles: ${behaviorCount}`);
  console.log(`   • Triggers Logged: ${triggerCount}`);
  console.log(`   • Agent ID: ${testAgent.id}`);
  console.log(`   • NSFW Mode: ${testAgent.nsfwMode ? 'ON' : 'OFF'}`);
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
