/**
 * Script de Prueba: AI Horde Client
 *
 * Este script prueba la generación de imágenes con AI Horde
 *
 * Uso:
 *   npx tsx scripts/test-ai-horde.ts
 */

import { getAIHordeClient } from "../lib/visual-system/ai-horde-client";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🎨 AI Horde - Test de Generación de Imágenes");
  console.log("=".repeat(50));
  console.log("");

  // Configurar cliente con tu API key
  const apiKey = process.env.AI_HORDE_API_KEY || "a3Su0lOQ57pmIukPFJ1_Pg";
  const client = getAIHordeClient({
    apiKey,
    clientAgent: "CreadorInteligencias:1.0:test@example.com",
  });

  try {
    // 1. Obtener información del usuario
    console.log("📊 Obteniendo información del usuario...");
    const userInfo = await client.getUserInfo();
    console.log(`   Usuario: ${userInfo.username}`);
    console.log(`   Kudos disponibles: ${userInfo.kudos}`);
    console.log(`   Requests realizados: ${userInfo.usage.requests}`);
    console.log("");

    // 2. Listar modelos disponibles (top 10)
    console.log("🤖 Modelos disponibles (top 10 por workers):");
    const models = await client.getAvailableModels();
    const topModels = models
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    topModels.forEach((model, i) => {
      console.log(
        `   ${i + 1}. ${model.name} (${model.count} workers, perf: ${model.performance.toFixed(1)})`
      );
    });
    console.log("");

    // 3. Generar imagen de prueba
    console.log("🎨 Generando imagen de prueba...");
    console.log("");

    const prompt =
      "professional portrait photo, beautiful young woman, 25 years old, " +
      "brown eyes, long dark hair, gentle smile, natural lighting, " +
      "photorealistic, detailed face, 8k uhd, sharp focus";

    console.log(`   Prompt: ${prompt.substring(0, 60)}...`);

    const result = await client.generateImage({
      prompt,
      negativePrompt:
        "deformed, bad anatomy, ugly, blurry, low quality, cartoon, anime",
      width: 512,
      height: 512,
      steps: 25, // 25-30 pasos para buena calidad
      cfgScale: 7.5,
      sampler: "k_euler_a",
      karras: true,
      nsfw: false,
    });

    console.log("");
    console.log("✅ Imagen generada exitosamente!");
    console.log(`   Tiempo: ${result.generationTime.toFixed(1)}s`);
    console.log(`   Modelo: ${result.model}`);
    console.log(`   Worker: ${result.workerName}`);
    console.log(`   Seed: ${result.seed}`);
    console.log(`   Kudos gastados: ${result.kudosCost}`);
    console.log(`   URL: ${result.imageUrl.substring(0, 80)}...`);
    console.log("");

    // 4. Descargar imagen
    if (result.imageUrl) {
      console.log("💾 Descargando imagen...");

      const imageResponse = await fetch(result.imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();

      const outputDir = path.join(process.cwd(), "test-output");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const filename = `ai-horde-test-${Date.now()}.png`;
      const filepath = path.join(outputDir, filename);

      fs.writeFileSync(filepath, Buffer.from(imageBuffer));

      console.log(`   Guardada en: ${filepath}`);
      console.log("");
    }

    // 5. Probar generación de expresión de personaje
    console.log("😊 Probando generación de expresión emocional...");

    const expressionResult = await client.generateCharacterExpression({
      characterDescription: "young woman, 25 years old, brown eyes, long dark hair",
      emotionType: "joy",
      intensity: "medium",
    });

    console.log("");
    console.log("✅ Expresión generada!");
    console.log(`   URL: ${expressionResult.imageUrl.substring(0, 80)}...`);
    console.log(`   Seed: ${expressionResult.seed}`);
    console.log(`   Kudos: ${expressionResult.kudosCost}`);
    console.log("");

    // 6. Información final
    console.log("📊 Información post-generación:");
    const finalUserInfo = await client.getUserInfo();
    console.log(`   Kudos restantes: ${finalUserInfo.kudos}`);
    console.log(`   Total requests: ${finalUserInfo.usage.requests}`);
    console.log("");

    console.log("🎉 Test completado exitosamente!");
    console.log("");
    console.log("💡 Notas:");
    console.log("   - Las imágenes se guardan en: test-output/");
    console.log("   - Tiempo promedio: 30-90 segundos por imagen");
    console.log("   - Calidad: Alta (comparable a Stable Diffusion local)");
    console.log("   - Sin costo de hardware, todo en la nube");
    console.log("");
  } catch (error) {
    console.error("❌ Error durante el test:", error);
    process.exit(1);
  }
}

// Ejecutar
main();
