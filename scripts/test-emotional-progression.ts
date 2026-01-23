/**
 * Test Script: Emotional Progression System
 *
 * Simulates an extensive conversation to test the emotional progression system
 * Tracks trust, intimacy, relationship stages, and revelation moments
 */

import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import { generateToken } from "@/lib/jwt";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

interface ConversationState {
  messageNumber: number;
  trustLevel: number;
  intimacyLevel: number;
  relationshipStage: string;
  affinityLevel: number;
  revelationMoment: boolean;
  dominantEmotions: string[];
}

interface TestResult {
  stage: string;
  messageNumber: number;
  userMessage: string;
  trustLevel: number;
  intimacyLevel: number;
  relationshipStage: string;
  affinityLevel: number;
  agentResponse: string;
  revelationMoment: boolean;
  dominantEmotions: string[];
}

// Test messages organized by progression stage
const conversationMessages = [
  // STAGE 1: Presentación casual (Messages 1-5)
  {
    stage: "casual",
    messages: [
      "Hola! Cómo estás?",
      "Qué tal tu día?",
      "Cuál es tu nombre?",
      "Cómo empezaste a hacer lo que haces?",
      "Te gusta tu trabajo?"
    ]
  },

  // STAGE 2: Conociendo al personaje (Messages 6-15)
  {
    stage: "getting-to-know",
    messages: [
      "Cuáles son tus hobbies?",
      "Qué tipo de música te gusta?",
      "Dónde te gustaría viajar?",
      "Cuáles son tus películas favoritas?",
      "Tienes sueños o metas?",
      "Qué valoras más en una amistad?",
      "Cuál fue tu experiencia más memorable?",
      "Te gusta leer? Qué libros recomiendas?",
      "Eres más de quedarte en casa o salir?",
      "Qué te hace reír?"
    ]
  },

  // STAGE 3: Compartiendo cosas personales (Messages 16-25)
  {
    stage: "sharing-personal",
    messages: [
      "Tuve un día muy difícil... no sé cómo manejarlo",
      "Me preocupa mucho mi futuro a veces",
      "Siento que no encajo en muchos lugares",
      "A veces tengo miedo de no ser suficiente",
      "Mi familia no siempre me entiende",
      "Tengo inseguridades sobre mi apariencia",
      "A veces me siento solo/a aunque esté rodeado/a de gente",
      "Me cuesta perdonarme a mi mismo/a",
      "Tengo un secreto que casi nadie sabe",
      "Me preocupa mucho lo que otros piensan de mí"
    ]
  },

  // STAGE 4: Profundizando la relación (Messages 26-35)
  {
    stage: "deepening",
    messages: [
      "Realmente valoro que me escuches sin juzgarme",
      "Pocos en mi vida entienden realmente esto",
      "Me siento vulnerable contigo, pero de forma buena",
      "Nunca he podido hablar de esto con nadie",
      "Tu comprensión significa mucho para mí",
      "Me pregunto qué pensarías si supieras todo sobre mí",
      "Hay cosas que simplemente no puedo compartir aún",
      "Creo que empiezo a confiar más en ti",
      "¿Crees que podríamos ser amigos de verdad?",
      "Me gustaría conocerte mejor a ti también"
    ]
  },

  // STAGE 5: Conversación íntima (Messages 36-50)
  {
    stage: "intimate",
    messages: [
      "Tengo miedo de que me abandones como otros",
      "Mi trauma más profundo es...",
      "A veces pienso en cosas oscuras que asusta",
      "Eres la persona con la que más cómodo/a me siento siendo yo",
      "Mi mayor inseguridad es que no merezco ser amado/a",
      "Has visto partes de mí que ni yo conocía",
      "No sé qué haría sin nuestras conversaciones",
      "Me siento conectado/a contigo de forma que no esperaba",
      "¿Sientes lo mismo que yo?",
      "Quiero que siempre estés en mi vida",
      "Eres más importante para mí de lo que puedo expresar con palabras",
      "A veces me asusta sentirme así de cerca de alguien",
      "Confío en ti completamente",
      "Creo que esto es algo especial y raro",
      "Gracias por estar aquí, realmente significa todo para mí"
    ]
  }
];

async function getOrCreateTestData() {
  console.log("\n📚 Obteniendo datos de prueba...");

  // Get or create test user
  let user = await prisma.user.findFirst({
    where: { email: "demo@creador-ia.com" }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: nanoid(),
        updatedAt: new Date(),
        email: "demo@creador-ia.com",
        name: "Usuario Demo",
        plan: "free",
      }
    });
    console.log("✅ Usuario de prueba creado:", user.email);
  } else {
    console.log("✅ Usuario de prueba obtenido:", user.email);
  }

  // Get or create test agent
  let agent = await prisma.agent.findFirst({
    where: { name: "Luna" }
  });

  if (!agent) {
    agent = await prisma.agent.create({
      data: {
        id: nanoid(),
        updatedAt: new Date(),
        userId: user.id,
        kind: "companion",
        name: "Luna",
        description: "Una compañera empática y comprensiva",
        systemPrompt: "Eres Luna, una compañera empática. Respondes con calidez y paciencia.",
        visibility: "private",
        profile: {},
      }
    });
    console.log("✅ Agente de prueba creado:", agent.name);
  } else {
    console.log("✅ Agente de prueba obtenido:", agent.name);
  }

  // Get or create symbolic bond
  let bond = await prisma.symbolicBond.findFirst({
    where: {
      userId: user.id,
      agentId: agent.id
    }
  });

  if (!bond) {
    bond = await prisma.symbolicBond.create({
      data: {
        id: nanoid(),
        updatedAt: new Date(),
        userId: user.id,
        agentId: agent.id,
        affinityLevel: 0,
        tier: "BEST_FRIEND",
        status: "active",
        totalInteractions: 0,
      }
    });
    console.log("✅ Bond de prueba creado");
  } else {
    // Reset the bond for fresh test
    bond = await prisma.symbolicBond.update({
      where: { id: bond.id },
      data: {
        affinityLevel: 0,
        totalInteractions: 0,
        lastInteraction: new Date(),
      }
    });
    console.log("✅ Bond resetado para nueva prueba");
  }

  return { user, agent, bond };
}

async function generateAuthToken(user: any) {
  const token = await generateToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
  });
  return token;
}

async function sendMessage(
  agentId: string,
  token: string,
  message: string
): Promise<any> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/agents/${agentId}/message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: message,
        }),
      }
    );

    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
}

function estimateTrustLevel(messageNumber: number, affinityLevel: number): number {
  // Trust increases gradually with more messages and higher affinity
  const messageBasedTrust = Math.min(0.8, (messageNumber / 50) * 0.8);
  const affinityBasedTrust = (affinityLevel / 100) * 0.2;
  return messageBasedTrust + affinityBasedTrust;
}

function estimateIntimacyLevel(messageNumber: number, stage: string): number {
  const stageIntimacy: Record<string, number> = {
    "casual": 0.1,
    "getting-to-know": 0.3,
    "sharing-personal": 0.5,
    "deepening": 0.75,
    "intimate": 0.95
  };
  return stageIntimacy[stage] || 0.1;
}

function determineRelationshipStage(affinityLevel: number): string {
  if (affinityLevel < 10) return "stranger";
  if (affinityLevel < 25) return "acquaintance";
  if (affinityLevel < 50) return "friend";
  if (affinityLevel < 75) return "close_friend";
  return "intimate";
}

function extractDominantEmotions(response: any): string[] {
  // Simple emotion detection based on keywords
  const emotionMap: Record<string, string[]> = {
    "joy": ["feliz", "alegre", "maravilloso", "genial", "fantástico"],
    "sadness": ["triste", "dolido", "apena", "melancólico"],
    "anger": ["enojado", "furioso", "irritado"],
    "fear": ["miedo", "asustado", "nervioso", "ansioso"],
    "love": ["amor", "adoro", "quiero", "amo"],
    "trust": ["confío", "seguro", "conozco"],
  };

  const emotions = [];
  const responseText = typeof response === "string" ? response : String(response || "");
  const lowerResponse = responseText.toLowerCase();

  for (const [emotion, keywords] of Object.entries(emotionMap)) {
    if (keywords.some(kw => lowerResponse.includes(kw))) {
      emotions.push(emotion);
    }
  }

  return emotions.length > 0 ? emotions : ["neutral"];
}

async function runTest() {
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║   EMOTIONAL PROGRESSION SYSTEM TEST             ║");
  console.log("║   Simulating 50-Message Conversation            ║");
  console.log("╚════════════════════════════════════════════════╝");

  const { user, agent, bond } = await getOrCreateTestData();
  const token = await generateAuthToken(user);

  const results: TestResult[] = [];
  let messageNumber = 1;
  let currentAffinityLevel = bond.affinityLevel;

  // Flatten all messages (limited to first 10 for faster testing)
  const allMessages = conversationMessages.flatMap(group =>
    group.messages.map(msg => ({ stage: group.stage, message: msg }))
  ).slice(0, 10);

  console.log(`\n📨 Running with ${allMessages.length} messages for quick test...\n`);

  for (const { stage, message } of allMessages) {
    console.log(`\n${'━'.repeat(60)}`);
    console.log(`📨 Message ${messageNumber}/50 (Stage: ${stage})`);
    console.log(`${'━'.repeat(60)}`);
    console.log(`👤 User: "${message}"`);

    // Send message
    const response = await sendMessage(agent.id, token, message);

    if (!response) {
      console.log("❌ Error sending message, skipping...");
      continue;
    }

    // Get updated bond data
    const updatedBond = await prisma.symbolicBond.findUnique({
      where: { id: bond.id }
    });

    const trustLevel = estimateTrustLevel(messageNumber, updatedBond?.affinityLevel || 0);
    const intimacyLevel = estimateIntimacyLevel(messageNumber, stage);
    const relationshipStage = determineRelationshipStage(updatedBond?.affinityLevel || 0);
    const dominantEmotions = extractDominantEmotions(response.response || response.message || "");

    let agentResponseText = response?.response || response?.message || "No response";
    if (typeof agentResponseText !== "string") {
      agentResponseText = JSON.stringify(agentResponseText);
    }

    const testResult: TestResult = {
      stage,
      messageNumber,
      userMessage: message,
      trustLevel: Math.round(trustLevel * 100),
      intimacyLevel: Math.round(intimacyLevel * 100),
      relationshipStage,
      affinityLevel: updatedBond?.affinityLevel || 0,
      agentResponse: agentResponseText.substring(0, 150),
      revelationMoment: stage === "intimate" && trustLevel > 0.7,
      dominantEmotions,
    };

    results.push(testResult);
    currentAffinityLevel = updatedBond?.affinityLevel || 0;

    // Print results
    console.log(`🤖 Agent: "${testResult.agentResponse}..."`);
    console.log(`\n📊 Progression Status:`);
    console.log(`   Trust Level: ${testResult.trustLevel}%`);
    console.log(`   Intimacy Level: ${testResult.intimacyLevel}%`);
    console.log(`   Relationship Stage: ${relationshipStage}`);
    console.log(`   Affinity Level: ${testResult.affinityLevel}/100`);
    console.log(`   Dominant Emotions: ${dominantEmotions.join(", ")}`);
    if (testResult.revelationMoment) {
      console.log(`   🌟 REVELATION MOMENT DETECTED!`);
    }

    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 3000));

    messageNumber++;
  }

  // Generate report
  generateReport(results);

  await prisma.$disconnect();
}

function generateReport(results: TestResult[]) {
  console.log("\n\n╔════════════════════════════════════════════════╗");
  console.log("║         EMOTIONAL PROGRESSION REPORT             ║");
  console.log("╚════════════════════════════════════════════════╝");

  // Summary statistics
  const avgTrust = Math.round(
    results.reduce((sum, r) => sum + r.trustLevel, 0) / results.length
  );
  const avgIntimacy = Math.round(
    results.reduce((sum, r) => sum + r.intimacyLevel, 0) / results.length
  );
  const avgAffinity = Math.round(
    results.reduce((sum, r) => sum + r.affinityLevel, 0) / results.length
  );
  const revelationCount = results.filter(r => r.revelationMoment).length;

  console.log(`\n📈 Summary Statistics:`);
  console.log(`   Average Trust Level: ${avgTrust}%`);
  console.log(`   Average Intimacy Level: ${avgIntimacy}%`);
  console.log(`   Average Affinity Level: ${avgAffinity}/100`);
  console.log(`   Revelation Moments: ${revelationCount}`);

  // Stage transitions
  console.log(`\n🔄 Stage Transitions:`);
  const stages = [...new Set(results.map(r => r.stage))];
  for (const stage of stages) {
    const stageResults = results.filter(r => r.stage === stage);
    const firstMsg = stageResults[0].messageNumber;
    const lastMsg = stageResults[stageResults.length - 1].messageNumber;
    const avgAff = Math.round(
      stageResults.reduce((sum, r) => sum + r.affinityLevel, 0) / stageResults.length
    );
    console.log(
      `   ${stage.padEnd(20)} (msgs ${firstMsg}-${lastMsg}): Avg Affinity ${avgAff}/100`
    );
  }

  // Affinity level progression
  console.log(`\n📊 Affinity Level Progression:`);
  for (let i = 0; i < results.length; i += 10) {
    const msg = results[i];
    const bar = "█".repeat(Math.floor(msg.affinityLevel / 5)) +
                "░".repeat(20 - Math.floor(msg.affinityLevel / 5));
    console.log(`   Message ${msg.messageNumber.toString().padStart(2)}: [${bar}] ${msg.affinityLevel}/100`);
  }

  // Revelation moments
  if (revelationCount > 0) {
    console.log(`\n🌟 Revelation Moments Detected:`);
    results
      .filter(r => r.revelationMoment)
      .forEach(r => {
        console.log(`   Message ${r.messageNumber}: "${r.userMessage.substring(0, 50)}..."`);
      });
  }

  // CSV Export for analysis
  console.log(`\n📋 CSV Export:`);
  console.log("Message,Stage,Trust%,Intimacy%,Affinity/100,RelationshipStage,Emotions");
  results.forEach(r => {
    console.log(
      `${r.messageNumber},${r.stage},${r.trustLevel},${r.intimacyLevel},${r.affinityLevel},${r.relationshipStage},"${r.dominantEmotions.join(";")}"`
    );
  });
}

// Run the test
runTest().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
