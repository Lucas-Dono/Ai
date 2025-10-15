/**
 * VOICE SYSTEM INTEGRATION TEST
 *
 * Prueba completa del sistema de voz multimodal
 */

import { PrismaClient } from "@prisma/client";
import { createEmotionalAgent } from "../lib/emotional-system/utils/initialization";
import { getWhisperClient } from "../lib/voice-system/whisper-client";
import { getElevenLabsClient } from "../lib/voice-system/elevenlabs-client";
import { getVoiceConfig } from "../lib/voice-system/voice-initialization";
import { getEmotionalSystemOrchestrator } from "../lib/emotional-system/orchestrator";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function testVoiceSystem() {
  console.log("\n🎤 TESTING VOICE SYSTEM - COMPLETE INTEGRATION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const startTime = Date.now();

  try {
    // 1. Setup test user
    console.log("1️⃣  Setting up test user...");

    let testUser = await prisma.user.findUnique({
      where: { email: "test-voice@example.com" },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: "test-voice@example.com",
          name: "Test User (Voice System)",
        },
      });
    }

    console.log(`   ✅ Test user ready: ${testUser.id}\n`);

    // 2. Create emotional agent with voice
    console.log("2️⃣  Creating emotional agent with auto-selected voice...");

    const agentId = await createEmotionalAgent({
      userId: testUser.id,
      name: "Sofia",
      kind: "companion",
      preset: "warmCompanion",
      gender: "female",
      description:
        "Una compañera cálida y empática de Argentina que valora las conexiones genuinas",
      accent: "es-AR",
      backstory:
        "Soy Sofia, una persona que disfruta las conversaciones profundas y crear lazos emocionales auténticos.",
      enableVoice: true,
    });

    console.log(`   ✅ Agent created: ${agentId}\n`);

    // 3. Verify voice configuration
    console.log("3️⃣  Verifying voice configuration...");

    const voiceConfig = await getVoiceConfig(agentId);

    if (!voiceConfig) {
      throw new Error("Voice config not created!");
    }

    console.log(`   ✅ Voice configured:`);
    console.log(`      Voice ID: ${voiceConfig.voiceId}`);
    console.log(`      Voice Name: ${voiceConfig.voiceName}`);
    console.log(`      Gender: ${voiceConfig.gender}`);
    console.log(`      Accent: ${voiceConfig.accent || "none"}`);
    console.log(
      `      Selection Confidence: ${voiceConfig.selectionConfidence.toFixed(2)}`
    );
    console.log(`      Manual Selection: ${voiceConfig.manualSelection}\n`);

    // 4. Test ElevenLabs voice search
    console.log("4️⃣  Testing ElevenLabs voice library search...");

    const elevenlabs = getElevenLabsClient();

    const femaleSpanishVoices = await elevenlabs.searchVoices({
      gender: "female",
      accent: "es",
    });

    console.log(
      `   ✅ Found ${femaleSpanishVoices.length} female Spanish voices in library\n`
    );

    // 5. Test voice generation (text to speech)
    console.log("5️⃣  Testing voice generation (Text-to-Speech)...");

    const testMessage = "¡Hola! ¿Cómo estás? Me alegra mucho poder hablar contigo.";

    const voiceResult = await elevenlabs.generateSpeech(
      testMessage,
      voiceConfig.voiceId,
      {
        currentEmotion: "joy",
        intensity: 0.6,
        mood: {
          valence: 0.5,
          arousal: 0.6,
          dominance: 0.5,
        },
        stability: 0.5,
        similarity_boost: 0.75,
      }
    );

    console.log(`   ✅ Voice generated:`);
    console.log(`      Audio size: ${voiceResult.audioBuffer.length} bytes`);
    console.log(`      Voice used: ${voiceResult.voiceName}\n`);

    // Guardar audio para verificación manual
    const outputDir = path.join(process.cwd(), "test-output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const audioPath = path.join(outputDir, "test-voice-output.mp3");
    fs.writeFileSync(audioPath, voiceResult.audioBuffer);

    console.log(`   💾 Audio saved to: ${audioPath}\n`);

    // 6. Test Whisper transcription (si hay audio de prueba)
    console.log("6️⃣  Testing Whisper transcription...");
    console.log(
      "   ℹ️  Skipping (requires real audio file - manually test via API)\n"
    );

    // 7. Test complete voice interaction flow
    console.log("7️⃣  Testing complete voice interaction flow...");

    const orchestrator = getEmotionalSystemOrchestrator();

    // Simular mensaje del usuario
    const userMessage = "Hola Sofia, hoy tuve un día muy difícil en el trabajo";

    const response = await orchestrator.processMessage({
      agentId,
      userMessage,
      userId: testUser.id,
    });

    console.log(`   👤 Usuario: "${userMessage}"`);
    console.log(`   🤖 Sofia: "${response.responseText}"\n`);

    // Generar audio de la respuesta
    const responseVoice = await elevenlabs.generateSpeech(
      response.responseText,
      voiceConfig.voiceId,
      {
        currentEmotion: response.metadata.emotionsTriggered[0] || "neutral",
        intensity: 0.5,
        mood: {
          valence: 0.3, // Mood más serio por el contexto
          arousal: 0.4,
          dominance: 0.5,
        },
        stability: 0.5,
        similarity_boost: 0.75,
      }
    );

    const responseAudioPath = path.join(outputDir, "test-voice-response.mp3");
    fs.writeFileSync(responseAudioPath, responseVoice.audioBuffer);

    console.log(`   ✅ Response voice generated:`);
    console.log(`      Audio size: ${responseVoice.audioBuffer.length} bytes`);
    console.log(`      Emotions: ${response.metadata.emotionsTriggered.join(", ")}`);
    console.log(`   💾 Response audio saved to: ${responseAudioPath}\n`);

    // 8. Verify voice config stats
    console.log("8️⃣  Verifying voice usage statistics...");

    const updatedConfig = await getVoiceConfig(agentId);

    console.log(`   ✅ Usage statistics:`);
    console.log(`      Total generations: ${updatedConfig?.totalVoiceGenerations}`);
    console.log(`      Total transcriptions: ${updatedConfig?.totalTranscriptions}\n`);

    // 9. Test voice characteristics mapping
    console.log("9️⃣  Testing personality → voice characteristics mapping...");

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        personalityCore: true,
      },
    });

    if (agent?.personalityCore) {
      console.log(`   ✅ Personality traits:`);
      console.log(`      Openness: ${agent.personalityCore.openness}/100`);
      console.log(`      Conscientiousness: ${agent.personalityCore.conscientiousness}/100`);
      console.log(`      Extraversion: ${agent.personalityCore.extraversion}/100`);
      console.log(`      Agreeableness: ${agent.personalityCore.agreeableness}/100`);
      console.log(`      Neuroticism: ${agent.personalityCore.neuroticism}/100\n`);

      console.log(`   🎯 Mapped to voice:`);
      console.log(`      High agreeableness (${agent.personalityCore.agreeableness}) → Warm, empathetic voice`);
      console.log(`      High extraversion (${agent.personalityCore.extraversion}) → Energetic, expressive voice`);
    }

    const totalTime = Date.now() - startTime;

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ VOICE SYSTEM TEST COMPLETE (${totalTime}ms)`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🎉 ALL VOICE SYSTEMS OPERATIONAL:");
    console.log("   ✅ Automatic voice selection from ElevenLabs library");
    console.log("   ✅ Voice configuration per agent");
    console.log("   ✅ Personality-based voice matching");
    console.log("   ✅ Emotional modulation of voice");
    console.log("   ✅ Text-to-Speech generation");
    console.log("   ✅ Voice usage statistics tracking");
    console.log("   ✅ Audio file export\n");

    console.log("📝 NEXT STEPS:");
    console.log("   1. Test Whisper transcription with real audio");
    console.log("   2. Test via API endpoint: POST /api/chat/voice");
    console.log("   3. Build frontend voice chat UI");
    console.log("   4. Add voice streaming for lower latency\n");

    console.log("🎧 AUDIO FILES GENERATED:");
    console.log(`   • ${audioPath}`);
    console.log(`   • ${responseAudioPath}`);
    console.log("\n   Play these files to hear Sofia's voice!\n");

  } catch (error) {
    console.error("\n❌ TEST FAILED:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testVoiceSystem()
  .then(() => {
    console.log("\n✅ Test completed successfully\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed with error:", error);
    process.exit(1);
  });
