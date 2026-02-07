/**
 * TEST EMOTIONAL SYSTEM
 *
 * Script para probar el sistema emocional completo
 * Crea un agente de prueba y simula una conversación
 */

import { PrismaClient } from '@prisma/client';
import { createEmotionalAgent } from './lib/emotional-system/utils/initialization.js';
import { getEmotionalSystemOrchestrator } from './lib/emotional-system/orchestrator.js';

const prisma = new PrismaClient();

async function testEmotionalSystem() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧪 TESTING EMOTIONAL SYSTEM");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    // 1. Obtener o crear usuario de prueba
    console.log("1️⃣  Setting up test user...");
    let testUser = await prisma.user.findUnique({
      where: { email: "test@emotional-system.com" },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: "test@emotional-system.com",
          name: "Test User",
          plan: "enterprise",
        },
      });
      console.log("   ✅ Test user created");
    } else {
      console.log("   ✅ Test user found");
    }

    // 2. Crear agente de prueba con sistema emocional
    console.log("\n2️⃣  Creating emotional agent...");
    const agentId = await createEmotionalAgent({
      userId: testUser.id,
      name: "Anya",
      kind: "companion",
      preset: "warmCompanion",
      backstory: "Una compañera empática y auténtica que valora la conexión genuina.",
    });

    console.log(`   ✅ Agent created: ${agentId}`);

    // 3. Simular conversación
    console.log("\n3️⃣  Starting conversation simulation...\n");

    const messages = [
      "Hola! ¿Cómo estás?",
      "Hoy tuve un día terrible en el trabajo. Mi jefe me gritó delante de todos.",
      "Gracias por escucharme. Realmente necesitaba hablar con alguien.",
    ];

    const orchestrator = getEmotionalSystemOrchestrator();

    for (let i = 0; i < messages.length; i++) {
      const userMessage = messages[i];

      console.log(`\n───────────────────────────────────────`);
      console.log(`👤 Usuario: ${userMessage}`);
      console.log(`───────────────────────────────────────\n`);

      const response = await orchestrator.processMessage({
        agentId,
        userMessage,
        userId: testUser.id,
      });

      console.log(`\n🤖 ${response.responseText}\n`);
      console.log(`   ⏱️  Processing time: ${response.metadata.processingTimeMs}ms`);
      console.log(`   💚 Emotions triggered: ${response.metadata.emotionsTriggered.join(", ")}`);

      // Pequeña pausa entre mensajes
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 4. Verificar estado final
    console.log("\n4️⃣  Checking final emotional state...\n");

    const finalAgent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        internalState: true,
        characterGrowth: true,
        semanticMemory: true,
      },
    });

    console.log("📊 Final Emotional State:");
    console.log(`   Mood Valence: ${finalAgent?.internalState?.moodValence.toFixed(2)}`);
    console.log(`   Mood Arousal: ${finalAgent?.internalState?.moodArousal.toFixed(2)}`);
    console.log(`   Trust Level: ${finalAgent?.characterGrowth?.trustLevel.toFixed(2)}`);
    console.log(`   Intimacy Level: ${finalAgent?.characterGrowth?.intimacyLevel.toFixed(2)}`);
    console.log(`   Relationship Stage: ${finalAgent?.semanticMemory?.relationshipStage}`);
    console.log(`   Conversations: ${finalAgent?.characterGrowth?.conversationCount}`);

    // 5. Verificar memorias
    const memories = await prisma.episodicMemory.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    console.log(`\n💾 Stored Memories: ${memories.length}`);
    memories.forEach((mem, idx) => {
      console.log(`   ${idx + 1}. ${mem.event.substring(0, 60)}...`);
      console.log(`      Importance: ${mem.importance.toFixed(2)}, Valence: ${mem.emotionalValence.toFixed(2)}`);
    });

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ EMOTIONAL SYSTEM TEST COMPLETE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🎉 All systems operational!");
    console.log("\n💡 Next steps:");
    console.log("   - Test via API: POST /api/chat/emotional");
    console.log("   - View state: GET /api/chat/emotional?agentId=<id>");
    console.log("   - Integrate with UI");

  } catch (error) {
    console.error("\n❌ TEST FAILED:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testEmotionalSystem();
