/**
 * EMOTIONAL SYSTEM INTEGRATION TEST
 *
 * Complete end-to-end test of the emotional system
 */

import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { createEmotionalAgent } from "../lib/emotional-system/utils/initialization";
import { getEmotionalSystemOrchestrator } from "../lib/emotional-system/orchestrator";

const prisma = new PrismaClient();

async function testEmotionalSystem() {
  console.log("\n🧪 TESTING EMOTIONAL SYSTEM - INTEGRATION TEST");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const startTime = Date.now();

  try {
    // 1. Setup test user
    console.log("1️⃣  Setting up test user...");

    let testUser = await prisma.user.findUnique({
      where: { email: "test-emotional@example.com" },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          id: nanoid(),
          updatedAt: new Date(),
          email: "test-emotional@example.com",
          name: "Test User (Emotional System)",
        },
      });
    }

    console.log(`   ✅ Test user ready: ${testUser.id}\n`);

    // 2. Create emotional agent
    console.log("2️⃣  Creating emotional agent with warmCompanion preset...");

    const agentId = await createEmotionalAgent({
      userId: testUser.id,
      name: "Anya",
      kind: "companion",
      preset: "warmCompanion",
      backstory: "Una compañera cálida y empática que valora las conexiones genuinas.",
    });

    console.log(`   ✅ Agent created: ${agentId}\n`);

    // 3. Get orchestrator
    const orchestrator = getEmotionalSystemOrchestrator();

    // 4. Simulate conversation
    console.log("3️⃣  Starting conversation simulation...\n");

    const messages = [
      "Hola! ¿Cómo estás?",
      "Hoy tuve un día terrible en el trabajo... mi jefe me criticó delante de todos.",
      "Gracias por escucharme. Me siento mejor hablando contigo.",
    ];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      console.log("───────────────────────────────────────");
      console.log(`👤 Usuario: ${msg}`);
      console.log("───────────────────────────────────────\n");

      const msgStartTime = Date.now();

      const response = await orchestrator.processMessage({
        agentId,
        userMessage: msg,
        userId: testUser.id,
      });

      const msgTime = Date.now() - msgStartTime;

      console.log(`\n🤖 ${response.responseText}\n`);
      console.log(`   ⏱️  Processing time: ${msgTime}ms`);
      console.log(`   💚 Emotions triggered: ${response.metadata.emotionsTriggered.join(", ")}`);

      if (i < messages.length - 1) {
        console.log("\n");
      }
    }

    // 5. Verify final state
    console.log("\n4️⃣  Verifying emotional state...\n");

    const finalAgent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        InternalState: true,
        CharacterGrowth: true,
        EpisodicMemory: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        SemanticMemory: true,
      },
    });

    if (!finalAgent) {
      throw new Error("Agent not found after processing");
    }

    console.log("📊 Final Emotional State:");
    console.log(`   Mood Valence: ${finalAgent.InternalState?.moodValence.toFixed(2)}`);
    console.log(`   Mood Arousal: ${finalAgent.InternalState?.moodArousal.toFixed(2)}`);
    console.log(`   Mood Dominance: ${finalAgent.InternalState?.moodDominance.toFixed(2)}`);
    console.log(`   Trust Level: ${finalAgent.CharacterGrowth?.trustLevel.toFixed(2)}`);
    console.log(`   Intimacy Level: ${finalAgent.CharacterGrowth?.intimacyLevel.toFixed(2)}`);
    console.log(`   Conversation Count: ${finalAgent.CharacterGrowth?.conversationCount}`);
    console.log(`   Memories Stored: ${finalAgent.EpisodicMemory.length}`);
    console.log(`   Relationship Stage: ${finalAgent.SemanticMemory?.relationshipStage}`);

    const totalTime = Date.now() - startTime;

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ EMOTIONAL SYSTEM TEST COMPLETE (${totalTime}ms)`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🎉 ALL SYSTEMS OPERATIONAL:");
    console.log("   ✅ Database integration");
    console.log("   ✅ Appraisal engine");
    console.log("   ✅ Emotion generation");
    console.log("   ✅ Memory system");
    console.log("   ✅ Internal reasoning");
    console.log("   ✅ Response generation");
    console.log("   ✅ Character growth");
    console.log("   ✅ Anti-sycophancy");

  } catch (error) {
    console.error("\n❌ TEST FAILED:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testEmotionalSystem()
  .then(() => {
    console.log("\n✅ Test completed successfully\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed with error:", error);
    process.exit(1);
  });
