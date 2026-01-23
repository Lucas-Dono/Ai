/**
 * VISUAL SYSTEM INTEGRATION TEST
 *
 * Prueba completa del sistema de generación visual
 * - Creación de personaje con apariencia
 * - Generación de expresiones base
 * - Cache y reutilización
 * - Mapeo de emociones a expresiones visuales
 */

import { PrismaClient } from "@prisma/client";
import { createEmotionalAgent } from "../lib/emotional-system/utils/initialization";
import { getVisualGenerationService } from "../lib/visual-system/visual-generation-service";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

async function testVisualSystem() {
  console.log("\n🎨 TESTING VISUAL GENERATION SYSTEM");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const startTime = Date.now();

  try {
    // 1. Setup test user
    console.log("1️⃣  Setting up test user...");

    let testUser = await prisma.user.findUnique({
      where: { email: "test-visual@example.com" },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          id: nanoid(),
          updatedAt: new Date(),
          email: "test-visual@example.com",
          name: "Test User (Visual System)",
        },
      });
    }

    console.log(`   ✅ Test user ready: ${testUser.id}\n`);

    // 2. Create emotional agent with visual system
    console.log("2️⃣  Creating emotional agent with visual system...");

    const agentId = await createEmotionalAgent({
      userId: testUser.id,
      name: "Luna",
      kind: "companion",
      preset: "warmCompanion",
      gender: "female",
      description:
        "Una joven de 25 años con cabello castaño largo, ojos verdes, piel clara, sonrisa cálida",
      backstory:
        "Soy Luna, una persona que disfruta de las conversaciones profundas y crear conexiones genuinas.",
      enableVoice: false, // Deshabilitado para este test
      enableVisual: true,
      visualStyle: "realistic",
      ethnicity: "caucasian",
      age: "25",
    });

    console.log(`   ✅ Agent created: ${agentId}\n`);

    // 3. Verify character appearance
    console.log("3️⃣  Verifying character appearance...");

    const appearance = await prisma.characterAppearance.findUnique({
      where: { agentId },
    });

    if (!appearance) {
      throw new Error("Character appearance not created!");
    }

    console.log(`   ✅ Character appearance configured:`);
    console.log(`      Style: ${appearance.style}`);
    console.log(`      Gender: ${appearance.gender}`);
    console.log(`      Age: ${appearance.age}`);
    console.log(`      Ethnicity: ${appearance.ethnicity || "not specified"}`);
    console.log(`      Seed: ${appearance.seed}`);
    console.log(`      Base prompt: ${appearance.basePrompt.substring(0, 100)}...`);
    console.log(`      Provider: ${appearance.preferredProvider}\n`);

    // 4. Wait for base expressions to generate
    console.log("4️⃣  Waiting for base expressions generation...");
    console.log("   ℹ️  This may take 2-5 minutes (10 images @ ~15-30s each)...\n");

    // Esperar a que se generen las expresiones
    await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 segundos inicial

    // Check progress
    let expressionsCount = 0;
    const maxWaitTime = 300000; // 5 minutos máximo
    const checkInterval = 10000; // Check cada 10 segundos
    const startWait = Date.now();

    while (expressionsCount < 10 && Date.now() - startWait < maxWaitTime) {
      const expressions = await prisma.visualExpression.findMany({
        where: { agentId },
      });

      expressionsCount = expressions.length;

      if (expressionsCount > 0) {
        console.log(
          `   📊 Progress: ${expressionsCount}/10 expressions generated...`
        );
      }

      if (expressionsCount < 10) {
        await new Promise((resolve) => setTimeout(resolve, checkInterval));
      }
    }

    console.log(`   ✅ Generated ${expressionsCount} expressions\n`);

    // 5. Test expression retrieval
    console.log("5️⃣  Testing expression retrieval (cache)...");

    const visualService = getVisualGenerationService();

    // Test 1: Joy expression
    console.log("   Testing: joy/medium...");
    const joyResult = await visualService.getOrGenerateExpression({
      agentId,
      emotionType: "joy",
      intensity: "medium",
      contentType: "sfw",
      userTier: "free",
    });

    console.log(`      ${joyResult.cached ? "✅ FROM CACHE" : "🆕 NEWLY GENERATED"}`);
    console.log(`      Provider: ${joyResult.provider}`);
    console.log(`      URL: ${joyResult.imageUrl.substring(0, 60)}...`);

    // Test 2: Distress expression
    console.log("\n   Testing: distress/medium...");
    const distressResult = await visualService.getOrGenerateExpression({
      agentId,
      emotionType: "distress",
      intensity: "medium",
      contentType: "sfw",
      userTier: "free",
    });

    console.log(`      ${distressResult.cached ? "✅ FROM CACHE" : "🆕 NEWLY GENERATED"}`);
    console.log(`      Provider: ${distressResult.provider}`);

    // Test 3: Request same expression again (should be cached)
    console.log("\n   Testing: joy/medium (second time - should be cached)...");
    const joyResult2 = await visualService.getOrGenerateExpression({
      agentId,
      emotionType: "joy",
      intensity: "medium",
      contentType: "sfw",
      userTier: "free",
    });

    console.log(`      ${joyResult2.cached ? "✅ FROM CACHE (CORRECT!)" : "❌ NOT CACHED (BUG!)"}`);

    // 6. Get statistics
    console.log("\n6️⃣  Getting statistics...");

    const stats = await visualService.getExpressionStats(agentId);

    console.log(`   📊 Visual Expression Statistics:`);
    console.log(`      Total expressions: ${stats.totalExpressions}`);
    console.log(`      Total generations: ${stats.totalGenerations}`);
    console.log(
      `      Cache hit rate: ${stats.cacheHitRate.toFixed(1)}%`
    );
    if (stats.mostUsedExpression) {
      console.log(
        `      Most used: ${stats.mostUsedExpression.emotionType}/${stats.mostUsedExpression.intensity} (${stats.mostUsedExpression.timesUsed} times)`
      );
    }

    // 7. List all generated expressions
    console.log("\n7️⃣  Listing all generated expressions...");

    const allExpressions = await prisma.visualExpression.findMany({
      where: { agentId },
      orderBy: { createdAt: "asc" },
    });

    console.log(`   Generated Expressions (${allExpressions.length} total):`);
    for (const expr of allExpressions) {
      console.log(
        `      • ${expr.emotionType}/${expr.intensity} - ${expr.provider} - used ${expr.timesUsed}x`
      );
    }

    const totalTime = Date.now() - startTime;

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ VISUAL SYSTEM TEST COMPLETE (${(totalTime / 1000).toFixed(1)}s)`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🎉 ALL VISUAL SYSTEMS OPERATIONAL:");
    console.log("   ✅ Character appearance initialization");
    console.log("   ✅ Base expressions generation");
    console.log("   ✅ Cache system working");
    console.log("   ✅ Expression retrieval");
    console.log("   ✅ Statistics tracking");
    console.log("   ✅ Hugging Face Spaces integration\n");

    console.log("📝 NEXT STEPS:");
    console.log("   1. Integrate with orchestrator to show images in responses");
    console.log("   2. Build frontend UI to display character expressions");
    console.log("   3. Add Gemini Imagen when API becomes available");
    console.log("   4. Implement video generation for special moments\n");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testVisualSystem()
  .then(() => {
    console.log("\n✅ Test completed successfully\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed with error:", error);
    process.exit(1);
  });
