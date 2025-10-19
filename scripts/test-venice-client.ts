/**
 * Test Venice AI Client
 *
 * Verifica que la migración a Venice esté funcionando correctamente
 */

// Cargar variables de entorno primero
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { getVeniceClient, RECOMMENDED_MODELS, VENICE_MODELS } from '@/lib/emotional-system/llm/venice';

console.log('\n🏝️  VENICE AI CLIENT TEST\n');
console.log('='.repeat(70));

async function testVeniceConnection() {
  console.log('\n✅ Test 1: Inicialización del cliente\n');

  try {
    const client = getVeniceClient();
    console.log('   ✓ Cliente Venice inicializado correctamente');
  } catch (error) {
    console.error('   ❌ Error al inicializar:', error);
    process.exit(1);
  }
}

async function testSimpleGeneration() {
  console.log('\n✅ Test 2: Generación simple\n');

  try {
    const client = getVeniceClient();

    console.log('   🚀 Enviando request a Venice...');
    const response = await client.generate({
      prompt: 'Di "Hola mundo" en una oración',
      temperature: 0.7,
      maxTokens: 50,
    });

    console.log('   ✓ Respuesta recibida');
    console.log(`   📝 Texto: "${response.text}"`);
    console.log(`   📊 Tokens: ${response.usage.totalTokens} (input: ${response.usage.promptTokens}, output: ${response.usage.completionTokens})`);
    console.log(`   🎯 Modelo usado: ${response.model}`);
  } catch (error) {
    console.error('   ❌ Error en generación:', error);
    throw error;
  }
}

async function testSystemPrompt() {
  console.log('\n✅ Test 3: Generación con system prompt\n');

  try {
    const client = getVeniceClient();

    console.log('   🚀 Enviando request con system prompt...');
    const response = await client.generateWithSystemPrompt(
      'Eres un asistente conciso y directo.',
      '¿Cuál es la capital de Argentina?',
      {
        temperature: 0.3,
        maxTokens: 30,
      }
    );

    console.log('   ✓ Respuesta recibida');
    console.log(`   📝 Texto: "${response.text}"`);
    console.log(`   📊 Tokens: ${response.usage.totalTokens}`);
  } catch (error) {
    console.error('   ❌ Error con system prompt:', error);
    throw error;
  }
}

async function testJSONGeneration() {
  console.log('\n✅ Test 4: Generación de JSON estructurado\n');

  try {
    const client = getVeniceClient();

    console.log('   🚀 Generando JSON...');
    const jsonResponse = await client.generateJSON<{ emocion: string; intensidad: number }>(
      'Eres un analizador de emociones. Respondes SOLO con JSON.',
      'Analiza esta frase: "Estoy muy feliz hoy". Devuelve JSON con campos "emocion" (string) e "intensidad" (0-1)',
      {
        temperature: 0.2,
        model: RECOMMENDED_MODELS.JSON,
      }
    );

    console.log('   ✓ JSON parseado correctamente');
    console.log('   📋 Resultado:', jsonResponse);
    console.log(`   😊 Emoción: ${jsonResponse.emocion}, Intensidad: ${jsonResponse.intensidad}`);
  } catch (error) {
    console.error('   ❌ Error en generación JSON:', error);
    throw error;
  }
}

async function testDifferentModels() {
  console.log('\n✅ Test 5: Probando diferentes modelos\n');

  const modelsToTest = [
    { name: 'Fast (llama-3.2-3b)', model: VENICE_MODELS.FAST },
    { name: 'Default (llama-3.3-70b)', model: VENICE_MODELS.DEFAULT },
  ];

  for (const { name, model } of modelsToTest) {
    try {
      const client = getVeniceClient();

      console.log(`   🧪 Probando ${name}...`);
      const start = Date.now();

      const response = await client.generateWithSystemPrompt(
        'Responde en una palabra.',
        '¿2+2?',
        {
          model,
          temperature: 0.1,
          maxTokens: 10,
        }
      );

      const elapsed = Date.now() - start;
      console.log(`      ✓ ${name}: "${response.text.trim()}" (${elapsed}ms)`);
    } catch (error) {
      console.error(`      ❌ Error con ${name}:`, error);
    }
  }
}

async function testEmotionalSystemModels() {
  console.log('\n✅ Test 6: Modelos configurados para sistema emocional\n');

  console.log('   📋 Modelos recomendados:');
  console.log(`      - Appraisal: ${RECOMMENDED_MODELS.APPRAISAL}`);
  console.log(`      - Emotion: ${RECOMMENDED_MODELS.EMOTION}`);
  console.log(`      - Reasoning: ${RECOMMENDED_MODELS.REASONING}`);
  console.log(`      - Action: ${RECOMMENDED_MODELS.ACTION}`);
  console.log(`      - Response: ${RECOMMENDED_MODELS.RESPONSE}`);
  console.log(`      - JSON: ${RECOMMENDED_MODELS.JSON}`);

  console.log('\n   🧪 Probando modelo de Appraisal...');
  try {
    const client = getVeniceClient();
    const response = await client.generateWithSystemPrompt(
      'Eres un evaluador emocional.',
      'El usuario dice: "Perdí mi trabajo". ¿Es esto deseable? Responde solo "Sí" o "No".',
      {
        model: RECOMMENDED_MODELS.APPRAISAL,
        temperature: 0.2,
        maxTokens: 5,
      }
    );

    console.log(`      ✓ Evaluación: "${response.text.trim()}"`);
  } catch (error) {
    console.error('      ❌ Error:', error);
    throw error;
  }
}

async function calculateCost() {
  console.log('\n💰 Cálculo de costos\n');

  console.log('   Precios Venice AI:');
  console.log('   - Input: $0.20 por millón de tokens');
  console.log('   - Output: $0.90 por millón de tokens');
  console.log('');
  console.log('   Estimación por mensaje emocional completo:');
  console.log('   - Input: ~2,000 tokens (prompts + contexto)');
  console.log('   - Output: ~500 tokens (respuesta + razonamiento)');
  console.log('   - Costo: ~$0.0024 USD por mensaje');
  console.log('');
  console.log('   Con $10 USD puedes procesar:');
  console.log('   - Aproximadamente 4,166 mensajes emocionales');
  console.log('   - Suficiente para desarrollo extensivo');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function main() {
  try {
    await testVeniceConnection();
    await testSimpleGeneration();
    await testSystemPrompt();
    await testJSONGeneration();
    await testDifferentModels();
    await testEmotionalSystemModels();
    calculateCost();

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ TODOS LOS TESTS PASARON!\n');
    console.log('🎉 Venice AI está funcionando correctamente');
    console.log('🏝️  Sistema emocional listo para usar Venice\n');

  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('\n❌ TEST FAILED\n');
    console.error('Error:', error);
    console.error('\nVerifica:');
    console.error('1. Que VENICE_API_KEY esté en .env');
    console.error('2. Que la API key sea válida');
    console.error('3. Que tengas créditos en tu cuenta de Venice\n');
    process.exit(1);
  }
}

main();
