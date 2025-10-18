/**
 * SCRIPT DE TESTING: Hybrid Emotional System
 *
 * Prueba el sistema híbrido Plutchik + OCC con routing automático.
 * Verifica:
 * 1. Routing correcto (Fast vs Deep Path)
 * 2. Generación de dyads (emociones secundarias)
 * 3. Mapeo OCC → Plutchik
 * 4. Performance y ahorro de costos
 */

import { hybridEmotionalOrchestrator } from "@/lib/emotional-system/hybrid-orchestrator";
import { prisma } from "@/lib/prisma";

// Test messages de diferentes complejidades
const TEST_MESSAGES = {
  simple: [
    "hola",
    "jaja",
    "ok",
    "qué tal?",
    "wow",
    "😊",
    "gracias",
  ],
  complex: [
    "Mi jefe me echó la culpa de algo que no hice y ahora todos en la oficina me odian",
    "No sé si debería decirle a mi mejor amigo que su novia me coqueteó, me siento muy confundido",
    "Perdí mi trabajo hace 3 meses y estoy cayendo en depresión, no sé qué hacer con mi vida",
    "Mi mamá está muy enferma y los doctores no dan esperanzas, pero no puedo aceptarlo",
    "Logré entrar a la universidad de mis sueños pero mis padres quieren que estudie otra cosa",
  ],
};

async function testHybridSystem() {
  console.log("=".repeat(80));
  console.log("🧪 TESTING: Hybrid Emotional System");
  console.log("=".repeat(80));
  console.log();

  // Buscar un agente para testing
  const agent = await prisma.agent.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!agent) {
    console.log("❌ No se encontró ningún agente para testing");
    console.log("   Crea un agente primero usando el constructor web");
    return;
  }

  console.log(`🤖 Usando agente: ${agent.name} (ID: ${agent.id})`);
  console.log();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEST 1: Mensajes simples (deben usar Fast Path)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log("━".repeat(80));
  console.log("1️⃣  TEST: Mensajes Simples (Fast Path esperado)");
  console.log("━".repeat(80));
  console.log();

  let fastPathCount = 0;
  let fastPathTotalTime = 0;

  for (const message of TEST_MESSAGES.simple) {
    console.log(`\n📨 Testing: "${message}"`);
    console.log("-".repeat(40));

    try {
      const result = await hybridEmotionalOrchestrator.processMessage({
        agentId: agent.id,
        userMessage: message,
        userId: "test-user",
        generateResponse: false,
      });

      console.log(`✅ Path: ${result.metadata.path}`);
      console.log(`   Time: ${result.metadata.processingTimeMs}ms`);
      console.log(`   Cost: $${result.metadata.costEstimate.toFixed(4)}`);
      console.log(`   Complexity: ${result.metadata.complexityScore.toFixed(2)}`);
      console.log(`   Primary emotion: ${result.metadata.primaryEmotion}`);
      console.log(`   Dyads active: ${result.activeDyads.length}`);

      if (result.activeDyads.length > 0) {
        console.log(`   Top dyads: ${result.activeDyads.slice(0, 3).map(d => d.label).join(", ")}`);
      }

      if (result.metadata.path === "fast") {
        fastPathCount++;
        fastPathTotalTime += result.metadata.processingTimeMs;
      } else {
        console.log(`   ⚠️  WARNING: Expected fast path but got deep path`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error}`);
    }
  }

  console.log();
  console.log(`📊 Fast Path Results:`);
  console.log(`   Messages: ${fastPathCount}/${TEST_MESSAGES.simple.length}`);
  console.log(`   Avg time: ${(fastPathTotalTime / fastPathCount).toFixed(0)}ms`);
  console.log();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEST 2: Mensajes complejos (deben usar Deep Path)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log("━".repeat(80));
  console.log("2️⃣  TEST: Mensajes Complejos (Deep Path esperado)");
  console.log("━".repeat(80));
  console.log();

  let deepPathCount = 0;
  let deepPathTotalTime = 0;
  let deepPathTotalCost = 0;

  for (const message of TEST_MESSAGES.complex) {
    console.log(`\n📨 Testing: "${message.substring(0, 60)}..."`);
    console.log("-".repeat(40));

    try {
      const result = await hybridEmotionalOrchestrator.processMessage({
        agentId: agent.id,
        userMessage: message,
        userId: "test-user",
        generateResponse: false,
      });

      console.log(`✅ Path: ${result.metadata.path}`);
      console.log(`   Time: ${result.metadata.processingTimeMs}ms`);
      console.log(`   Cost: $${result.metadata.costEstimate.toFixed(4)}`);
      console.log(`   Complexity: ${result.metadata.complexityScore.toFixed(2)}`);
      console.log(`   Primary emotion: ${result.metadata.primaryEmotion}`);
      console.log(`   Dyads active: ${result.activeDyads.length}`);

      if (result.activeDyads.length > 0) {
        const topDyads = result.activeDyads.slice(0, 3);
        topDyads.forEach(dyad => {
          console.log(`   - ${dyad.label}: ${(dyad.intensity * 100).toFixed(0)}% (${dyad.type})`);
        });
      }

      console.log(`   Emotional stability: ${(result.metadata.emotionalStability * 100).toFixed(0)}%`);

      if (result.metadata.path === "deep") {
        deepPathCount++;
        deepPathTotalTime += result.metadata.processingTimeMs;
        deepPathTotalCost += result.metadata.costEstimate;
      } else {
        console.log(`   ⚠️  WARNING: Expected deep path but got fast path`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error}`);
    }
  }

  console.log();
  console.log(`📊 Deep Path Results:`);
  console.log(`   Messages: ${deepPathCount}/${TEST_MESSAGES.complex.length}`);
  console.log(`   Avg time: ${(deepPathTotalTime / deepPathCount).toFixed(0)}ms`);
  console.log(`   Total cost: $${deepPathTotalCost.toFixed(4)}`);
  console.log();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TEST 3: Cálculo de ahorro
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log("━".repeat(80));
  console.log("3️⃣  TEST: Análisis de Ahorro");
  console.log("━".repeat(80));
  console.log();

  const totalMessages = TEST_MESSAGES.simple.length + TEST_MESSAGES.complex.length;
  const simplePercentage = (TEST_MESSAGES.simple.length / totalMessages) * 100;
  const complexPercentage = (TEST_MESSAGES.complex.length / totalMessages) * 100;

  // Calcular costos
  const hybridAvgTime = (fastPathTotalTime + deepPathTotalTime) / totalMessages;
  const hybridTotalCost = deepPathTotalCost; // Fast path = $0

  const deepOnlyAvgTime = 2500; // ms
  const deepOnlyCost = totalMessages * 0.007;

  const timeSaved = ((deepOnlyAvgTime - hybridAvgTime) / deepOnlyAvgTime) * 100;
  const costSaved = deepOnlyCost - hybridTotalCost;
  const costSavedPercentage = (costSaved / deepOnlyCost) * 100;

  console.log(`📊 ESTADÍSTICAS:`);
  console.log(`   Total messages: ${totalMessages}`);
  console.log(`   Simple (fast path): ${TEST_MESSAGES.simple.length} (${simplePercentage.toFixed(0)}%)`);
  console.log(`   Complex (deep path): ${TEST_MESSAGES.complex.length} (${complexPercentage.toFixed(0)}%)`);
  console.log();

  console.log(`⚡ PERFORMANCE:`);
  console.log(`   Hybrid avg time: ${hybridAvgTime.toFixed(0)}ms`);
  console.log(`   Deep-only avg time: ${deepOnlyAvgTime}ms`);
  console.log(`   Time saved: ${timeSaved.toFixed(1)}%`);
  console.log();

  console.log(`💰 COSTOS:`);
  console.log(`   Hybrid total cost: $${hybridTotalCost.toFixed(4)}`);
  console.log(`   Deep-only total cost: $${deepOnlyCost.toFixed(4)}`);
  console.log(`   Money saved: $${costSaved.toFixed(4)} (${costSavedPercentage.toFixed(1)}%)`);
  console.log();

  // Proyección a 1000 mensajes
  const scale = 1000 / totalMessages;
  console.log(`📈 PROYECCIÓN A 1000 MENSAJES:`);
  console.log(`   Hybrid cost: $${(hybridTotalCost * scale).toFixed(2)}`);
  console.log(`   Deep-only cost: $${(deepOnlyCost * scale).toFixed(2)}`);
  console.log(`   Savings: $${(costSaved * scale).toFixed(2)}`);
  console.log();

  console.log("=".repeat(80));
  console.log("✅ Testing completado");
  console.log("=".repeat(80));
}

// Ejecutar
testHybridSystem()
  .catch((error) => {
    console.error("❌ Error durante testing:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
