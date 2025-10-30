/**
 * Benchmark de Qwen3-Embedding-0.6B-Q8 en CPU
 *
 * Mide:
 * - Tiempo de carga del modelo
 * - Tiempo de generación de embeddings (diferentes tamaños)
 * - Memoria RAM consumida
 * - Throughput (embeddings/segundo)
 */

import path from 'path';
import os from 'os';

const MODEL_PATH = path.join(process.cwd(), 'model', 'Qwen3-Embedding-0.6B-Q8_0.gguf');

interface BenchmarkResult {
  modelLoadTime: number;
  memoryUsedMB: number;
  tests: {
    name: string;
    textLength: number;
    iterations: number;
    totalTime: number;
    avgTime: number;
    embeddingsPerSecond: number;
  }[];
}

async function benchmark(): Promise<BenchmarkResult> {
  console.log('🔬 BENCHMARK: Qwen3-Embedding-0.6B-Q8 en CPU\n');
  console.log(`📊 Sistema:`);
  console.log(`   CPUs: ${os.cpus().length} x ${os.cpus()[0].model}`);
  console.log(`   RAM Total: ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`   RAM Libre: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB\n`);

  const result: BenchmarkResult = {
    modelLoadTime: 0,
    memoryUsedMB: 0,
    tests: [],
  };

  try {
    // Verificar que el modelo existe
    const fs = await import('fs/promises');
    await fs.access(MODEL_PATH);
    console.log(`✅ Modelo encontrado: ${MODEL_PATH}\n`);
  } catch (error) {
    console.error(`❌ Modelo no encontrado en: ${MODEL_PATH}`);
    console.log('⚠️  Ejecuta primero: npm run setup (o descarga el modelo manualmente)');
    process.exit(1);
  }

  // Medir memoria antes de cargar
  const memBefore = process.memoryUsage().heapUsed;

  // Cargar modelo y medir tiempo
  console.log('⏳ Cargando modelo...');
  const loadStart = performance.now();

  let llamaCpp: any;
  let model: any;
  let context: any;

  try {
    llamaCpp = await import('node-llama-cpp');
    const { getLlama } = llamaCpp;

    // Inicializar llama.cpp
    const llama = await getLlama();

    // Cargar modelo con la API v3
    model = await llama.loadModel({
      modelPath: MODEL_PATH,
    });

    // Crear contexto para embeddings
    context = await model.createEmbeddingContext();

    const loadEnd = performance.now();
    result.modelLoadTime = loadEnd - loadStart;

    // Medir memoria después de cargar
    const memAfter = process.memoryUsage().heapUsed;
    result.memoryUsedMB = (memAfter - memBefore) / 1024 / 1024;

    console.log(`✅ Modelo cargado en ${result.modelLoadTime.toFixed(0)}ms`);
    console.log(`💾 Memoria usada: ${result.memoryUsedMB.toFixed(2)} MB\n`);

    // Test 1: Texto corto (pregunta de usuario típica)
    await runTest(result, context, 'Texto Corto (50 chars)',
      'Hola, ¿cómo estás? ¿Qué hiciste hoy?', 10);

    // Test 2: Texto medio (mensaje con contexto)
    await runTest(result, context, 'Texto Medio (200 chars)',
      'Hola, quería preguntarte sobre los beneficios de consumir magnesio. He leído que ayuda con el sueño y la recuperación muscular, pero no estoy seguro de cuál es la dosis recomendada. ¿Qué me puedes decir?',
      10);

    // Test 3: Texto largo (sección de knowledge)
    const longText = `
    INFORMACIÓN DE FAMILIA:

    MADRE: Carmen García
    Edad: 52 años
    Ocupación: Profesora de historia en secundaria
    Personalidad: Cariñosa, estricta con los estudios, muy organizada
    Relación: Muy cercana, hablamos casi todos los días

    PADRE: Roberto Fernández (Fallecido)
    Status: Falleció hace 3 años de un ataque al corazón
    Ocupación: Era ingeniero civil
    Relación: Éramos muy unidos, su muerte fue muy difícil para toda la familia

    HERMANOS:
    - Ana (25 años) - Médica, vive en Buenos Aires, nos llevamos muy bien
    - Lucas (19 años) - Estudiante de arquitectura, un poco rebelde pero buen chico

    MASCOTAS:
    - Max (Perro golden, 5 años) - Es el consentido de la casa, super juguetón
    `;
    await runTest(result, context, 'Texto Largo (600 chars)', longText, 5);

    // Test 4: Throughput sostenido
    console.log('\n📈 Test de throughput sostenido (30 segundos)...');
    const throughputTest = await measureThroughput(context, 30000);
    console.log(`   Embeddings generados: ${throughputTest.count}`);
    console.log(`   Tiempo total: ${(throughputTest.time / 1000).toFixed(1)}s`);
    console.log(`   Throughput: ${throughputTest.embeddingsPerSecond.toFixed(2)} embeddings/s`);

  } catch (error: any) {
    console.error('\n❌ Error durante benchmark:', error.message);

    if (error.message.includes('Cannot find module')) {
      console.log('\n💡 Solución: Instala node-llama-cpp');
      console.log('   npm install node-llama-cpp');
    }

    process.exit(1);
  } finally {
    // Cleanup
    if (context) {
      try {
        await context.dispose?.();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  return result;
}

async function runTest(
  result: BenchmarkResult,
  context: any,
  name: string,
  text: string,
  iterations: number
) {
  console.log(`\n🧪 Test: ${name}`);
  console.log(`   Texto: ${text.length} caracteres`);
  console.log(`   Iteraciones: ${iterations}`);

  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await context.getEmbeddingFor(text);
    const end = performance.now();
    times.push(end - start);
  }

  const totalTime = times.reduce((a, b) => a + b, 0);
  const avgTime = totalTime / iterations;
  const embeddingsPerSecond = 1000 / avgTime;

  result.tests.push({
    name,
    textLength: text.length,
    iterations,
    totalTime,
    avgTime,
    embeddingsPerSecond,
  });

  console.log(`   ⏱️  Tiempo promedio: ${avgTime.toFixed(0)}ms`);
  console.log(`   📊 Throughput: ${embeddingsPerSecond.toFixed(2)} embeddings/s`);
  console.log(`   📉 Min: ${Math.min(...times).toFixed(0)}ms | Max: ${Math.max(...times).toFixed(0)}ms`);
}

async function measureThroughput(context: any, durationMs: number) {
  const startTime = performance.now();
  const endTime = startTime + durationMs;
  let count = 0;

  const testText = 'Este es un texto de prueba para medir throughput sostenido del sistema de embeddings.';

  while (performance.now() < endTime) {
    await context.getEmbeddingFor(testText);
    count++;

    // Progress indicator cada segundo
    if (count % 10 === 0) {
      const elapsed = performance.now() - startTime;
      const rate = (count / elapsed) * 1000;
      process.stdout.write(`\r   Progreso: ${count} embeddings (${rate.toFixed(1)}/s)   `);
    }
  }

  const actualTime = performance.now() - startTime;
  process.stdout.write('\r' + ' '.repeat(60) + '\r'); // Clear line

  return {
    count,
    time: actualTime,
    embeddingsPerSecond: (count / actualTime) * 1000,
  };
}

// Función para formatear resultados
function printSummary(result: BenchmarkResult) {
  console.log('\n\n' + '='.repeat(80));
  console.log('📋 RESUMEN DEL BENCHMARK');
  console.log('='.repeat(80));
  console.log(`\n⏱️  Tiempo de carga del modelo: ${result.modelLoadTime.toFixed(0)}ms`);
  console.log(`💾 Memoria RAM usada: ${result.memoryUsedMB.toFixed(2)} MB`);
  console.log('\n📊 Rendimiento por tipo de texto:');
  console.log('─'.repeat(80));
  console.log('Tipo                    | Chars | Avg Time | Throughput');
  console.log('─'.repeat(80));

  result.tests.forEach(test => {
    const name = test.name.padEnd(23);
    const chars = test.textLength.toString().padStart(5);
    const avgTime = `${test.avgTime.toFixed(0)}ms`.padStart(8);
    const throughput = `${test.embeddingsPerSecond.toFixed(2)}/s`.padStart(10);
    console.log(`${name} | ${chars} | ${avgTime} | ${throughput}`);
  });

  console.log('─'.repeat(80));
}

// Ejecutar benchmark
benchmark()
  .then(result => {
    printSummary(result);

    console.log('\n\n💡 Interpretación de resultados:');
    console.log('   - Tiempo de carga < 5s: ✅ Aceptable para inicio de servidor');
    console.log('   - Memoria < 1GB: ✅ No consume mucha RAM');
    console.log('   - Throughput > 5/s: ✅ Suficiente para producción');
    console.log('   - Avg Time < 200ms: ✅ No bloquea requests HTTP');

    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
