/**
 * SCRIPT DE TESTING: Knowledge Retrieval System
 *
 * Prueba el sistema de comandos on-demand para verificar:
 * 1. Detección de comandos
 * 2. Extracción de knowledge groups
 * 3. Formato de respuestas
 */

import { detectKnowledgeCommand, getKnowledgeGroup, KNOWLEDGE_COMMANDS } from "@/lib/profile/knowledge-retrieval";
import { prisma } from "@/lib/prisma";

async function testKnowledgeRetrieval() {
  console.log("=".repeat(80));
  console.log("🧪 TESTING: Knowledge Retrieval System");
  console.log("=".repeat(80));
  console.log();

  // 1. TEST: Detección de comandos
  console.log("━".repeat(80));
  console.log("1️⃣  TEST: Detección de Comandos");
  console.log("━".repeat(80));
  console.log();

  const testCases = [
    { input: "[FAMILY]", expected: "[FAMILY]", shouldDetect: true },
    { input: "[FRIENDS]", expected: "[FRIENDS]", shouldDetect: true },
    { input: "[INTERESTS]", expected: "[INTERESTS]", shouldDetect: true },
    { input: "Hola, ¿cómo estás?", expected: null, shouldDetect: false },
    { input: "Me gustaría hablar de [FAMILY]", expected: null, shouldDetect: false }, // No es SOLO el comando
    { input: "   [WORK]   ", expected: "[WORK]", shouldDetect: true }, // Con espacios
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const detected = detectKnowledgeCommand(testCase.input);
    const isCorrect = testCase.shouldDetect
      ? detected === testCase.expected
      : detected === null;

    if (isCorrect) {
      console.log(`✅ "${testCase.input}" → ${detected || "null"} (correcto)`);
      passed++;
    } else {
      console.log(`❌ "${testCase.input}" → ${detected || "null"} (esperado: ${testCase.expected || "null"})`);
      failed++;
    }
  }

  console.log();
  console.log(`Resultado: ${passed} ✅ | ${failed} ❌`);
  console.log();

  // 2. TEST: Extracción de Knowledge Groups
  console.log("━".repeat(80));
  console.log("2️⃣  TEST: Extracción de Knowledge Groups");
  console.log("━".repeat(80));
  console.log();

  // Buscar un agente para testing (el más reciente)
  const agent = await prisma.agent.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      semanticMemory: true,
    },
  });

  if (!agent) {
    console.log("❌ No se encontró ningún agente para testing");
    console.log("   Crea un agente primero usando el constructor web");
    return;
  }

  console.log(`🤖 Usando agente: ${agent.name} (ID: ${agent.id})`);
  console.log();

  // Verificar que tenga SemanticMemory
  if (!agent.semanticMemory) {
    console.log("⚠️  Este agente no tiene SemanticMemory inicializada");
    console.log("   Es probable que sea un agente viejo creado antes del nuevo sistema");
    return;
  }

  console.log("✅ SemanticMemory encontrada");
  console.log();

  // Probar cada comando
  const commandsToTest = [
    KNOWLEDGE_COMMANDS.FAMILY,
    KNOWLEDGE_COMMANDS.FRIENDS,
    KNOWLEDGE_COMMANDS.WORK,
    KNOWLEDGE_COMMANDS.INTERESTS,
    KNOWLEDGE_COMMANDS.INNER,
    KNOWLEDGE_COMMANDS.DAILY,
  ];

  for (const command of commandsToTest) {
    console.log(`\n📦 Testing: ${command}`);
    console.log("-".repeat(40));

    try {
      const knowledge = await getKnowledgeGroup(agent.id, command);
      const lines = knowledge.split("\n").length;
      const chars = knowledge.length;

      console.log(`✅ Knowledge obtenido:`);
      console.log(`   Líneas: ${lines}`);
      console.log(`   Caracteres: ${chars}`);
      console.log(`   Tokens estimados: ~${Math.ceil(chars / 4)}`);
      console.log();
      console.log("   Preview (primeras 200 chars):");
      console.log(`   ${knowledge.substring(0, 200)}...`);
    } catch (error) {
      console.log(`❌ Error: ${error}`);
    }
  }

  // 3. TEST: Cálculo de ahorro de tokens
  console.log();
  console.log("━".repeat(80));
  console.log("3️⃣  TEST: Cálculo de Ahorro de Tokens");
  console.log("━".repeat(80));
  console.log();

  // Estimar tamaño total del profile si se cargara completo
  const worldKnowledge = agent.semanticMemory.worldKnowledge as any;
  const profileJson = JSON.stringify(worldKnowledge, null, 2);
  const totalProfileChars = profileJson.length;
  const totalProfileTokens = Math.ceil(totalProfileChars / 4);

  console.log(`📊 ESTADÍSTICAS:`);
  console.log(`   Tamaño total del profile: ${totalProfileChars} chars (~${totalProfileTokens} tokens)`);
  console.log();

  // Simular uso promedio
  const avgBasePromptTokens = 200;
  const avgKnowledgeGroupTokens = 250; // Promedio de un knowledge group

  console.log(`   Prompt base (sin knowledge): ~${avgBasePromptTokens} tokens`);
  console.log(`   Prompt con 1 knowledge group: ~${avgBasePromptTokens + avgKnowledgeGroupTokens} tokens`);
  console.log(`   Prompt con profile completo: ~${avgBasePromptTokens + totalProfileTokens} tokens`);
  console.log();

  const savingPercentage = ((totalProfileTokens - avgKnowledgeGroupTokens) / totalProfileTokens) * 100;

  console.log(`💰 AHORRO ESTIMADO:`);
  console.log(`   Por mensaje casual (sin knowledge): ${((totalProfileTokens - 0) / totalProfileTokens * 100).toFixed(1)}%`);
  console.log(`   Por mensaje con 1 comando: ${savingPercentage.toFixed(1)}%`);
  console.log();

  // Simular 100 mensajes (85% casuales, 15% con comandos)
  const totalMessages = 100;
  const casualMessages = 85;
  const commandMessages = 15;

  const tokensWithoutSystem = totalMessages * (avgBasePromptTokens + totalProfileTokens);
  const tokensWithSystem =
    casualMessages * avgBasePromptTokens +
    commandMessages * (avgBasePromptTokens + avgKnowledgeGroupTokens);

  const totalSavings = tokensWithoutSystem - tokensWithSystem;
  const costSavings = (totalSavings / 1_000_000) * 2.5; // $2.50 per M tokens

  console.log(`📈 SIMULACIÓN: 100 mensajes (85% casuales, 15% con comandos)`);
  console.log(`   Sin knowledge system: ${tokensWithoutSystem.toLocaleString()} tokens`);
  console.log(`   Con knowledge system: ${tokensWithSystem.toLocaleString()} tokens`);
  console.log(`   Ahorro: ${totalSavings.toLocaleString()} tokens (${((totalSavings / tokensWithoutSystem) * 100).toFixed(1)}%)`);
  console.log(`   Ahorro en dinero: $${costSavings.toFixed(4)}`);
  console.log();

  console.log("=".repeat(80));
  console.log("✅ Testing completado");
  console.log("=".repeat(80));
}

// Ejecutar
testKnowledgeRetrieval()
  .catch((error) => {
    console.error("❌ Error durante testing:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
