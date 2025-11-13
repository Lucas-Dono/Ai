/**
 * Qwen3-Embedding-0.6B Q8 Integration usando GGUF
 * Modelo local de embeddings optimizado (639MB archivo GGUF)
 *
 * Ubicación del modelo: ./model/Qwen3-Embedding-0.6B-Q8_0.gguf
 *
 * NOTA: Este módulo usa dynamic imports para evitar problemas con Next.js Edge Runtime
 */

import { createLogger } from '@/lib/logger';
import path from 'path';
import { trackEmbedding } from '@/lib/cost-tracking/tracker';
import { estimateTokens } from '@/lib/cost-tracking/calculator';

const log = createLogger('QwenEmbeddings');

// Ruta al modelo GGUF
const MODEL_PATH = path.join(process.cwd(), 'model', 'Qwen3-Embedding-0.6B-Q8_0.gguf');

let llama: any = null;
let model: any = null;
let context: any = null;
let modelLoading: Promise<void> | null = null;
let llamaCppModule: any = null;

/**
 * Cargar node-llama-cpp dinámicamente (evita problemas con Next.js Edge)
 */
async function loadLlamaCpp() {
  if (llamaCppModule) return llamaCppModule;

  try {
    // Dynamic import para evitar que Next.js lo procese en build time
    llamaCppModule = await import('node-llama-cpp');
    return llamaCppModule;
  } catch (error) {
    log.error({ error }, 'No se pudo cargar node-llama-cpp (requiere Node.js runtime)');
    throw error;
  }
}

/**
 * Cargar modelo Qwen3-0.6B Q8 GGUF (lazy loading)
 */
async function loadQwenModel(): Promise<void> {
  if (model && context) {
    return;
  }

  // Si ya se está cargando, esperar
  if (modelLoading) {
    return modelLoading;
  }

  modelLoading = (async () => {
    try {
      log.info({ path: MODEL_PATH }, 'Cargando Qwen3-Embedding-0.6B Q8 GGUF...');
      const startTime = Date.now();

      // Cargar node-llama-cpp dinámicamente
      const llamaCpp = await loadLlamaCpp();
      const { getLlama } = llamaCpp;

      // Inicializar llama.cpp
      llama = await getLlama();

      // Cargar modelo GGUF con la API v3
      model = await llama.loadModel({
        modelPath: MODEL_PATH,
      });

      // Crear contexto para embeddings con la API v3
      context = await model.createEmbeddingContext();

      const loadTime = Date.now() - startTime;
      log.info({ loadTimeMs: loadTime }, 'Modelo Qwen3-0.6B Q8 GGUF cargado exitosamente');

      modelLoading = null;
    } catch (error) {
      log.error({ error, path: MODEL_PATH }, 'Error cargando modelo Qwen3-0.6B Q8 GGUF');
      modelLoading = null;
      throw new Error(`Failed to load Qwen3-0.6B Q8 GGUF: ${error}`);
    }
  })();

  return modelLoading;
}

/**
 * Generar embedding para un texto usando Qwen3-0.6B Q8 GGUF
 */
export async function generateQwenEmbedding(text: string): Promise<number[]> {
  try {
    const startTime = Date.now();

    await loadQwenModel();

    if (!context) {
      throw new Error('Context not initialized');
    }

    // Generar embedding usando llama.cpp (API v3)
    // En v3, getEmbeddingFor retorna LlamaEmbedding directamente
    const embedding = await context.getEmbeddingFor(text);

    // Convertir LlamaEmbedding a array de números
    // En v3, el vector está directamente en la propiedad 'vector'
    const embeddingArray = Array.from(embedding.vector) as number[];

    const genTime = Date.now() - startTime;
    log.debug(
      { textLength: text.length, embeddingDim: embeddingArray.length, timeMs: genTime },
      'Embedding generado'
    );

    // Track embedding cost (local model, cost is 0 but we track for monitoring)
    const tokens = estimateTokens(text);
    trackEmbedding({
      provider: 'qwen-local',
      model: 'qwen3-embedding-0.6b-q8',
      tokens,
      cost: 0, // Local model, no API cost
      metadata: {
        textLength: text.length,
        embeddingDim: embeddingArray.length,
        timeMs: genTime,
      },
    }).catch(err => log.warn({ error: err.message }, 'Failed to track embedding cost'));

    return embeddingArray;
  } catch (error) {
    log.error({ error, text: text.substring(0, 100) }, 'Error generando embedding');
    throw error;
  }
}

/**
 * Calcular similitud coseno entre dos embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have same dimensions');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Calcular similitud entre un query y múltiples embeddings
 */
export function batchCosineSimilarity(
  queryEmbedding: number[],
  embeddings: number[][]
): number[] {
  return embeddings.map(emb => cosineSimilarity(queryEmbedding, emb));
}

/**
 * Descargar modelo de memoria (liberar RAM)
 * Útil si el modelo no se usa por mucho tiempo
 */
export async function unloadQwenModel(): Promise<void> {
  if (context) {
    log.info('Descargando contexto Qwen3-0.6B Q8 de memoria');
    await context.dispose();
    context = null;
  }

  if (model) {
    log.info('Descargando modelo Qwen3-0.6B Q8 de memoria');
    await model.dispose();
    model = null;
  }

  // El garbage collector de Node.js liberará la memoria
  if (global.gc) {
    global.gc();
  }
}

/**
 * Verificar si el modelo está cargado
 */
export function isQwenModelLoaded(): boolean {
  return model !== null && context !== null;
}

/**
 * Pre-calentar el modelo (cargar en memoria sin usarlo)
 * Útil para reducir latencia en primera búsqueda
 */
export async function warmupQwenModel(): Promise<void> {
  log.info('Pre-calentando modelo Qwen3-0.6B Q8 GGUF...');
  await loadQwenModel();

  // Generar un embedding de prueba para asegurar que todo funciona
  await generateQwenEmbedding('test warmup');

  log.info('Modelo pre-calentado y listo para usar');
}
