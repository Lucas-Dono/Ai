/**
 * Embedding Generation Service
 * Generates vector embeddings for text using Xenova Transformers
 * Runs locally without requiring external API keys
 *
 * IMPORTANT: This module uses dynamic imports to avoid bundling native binaries
 * in the client-side code. It should only be used in server-side contexts.
 */

// Model configuration
const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2"; // 384 dimensions
const EMBEDDING_DIMENSIONS = 384;

// Singleton pattern for the embedding pipeline
let embeddingPipeline: any = null;
let initializationPromise: Promise<any> | null = null;

/**
 * Initialize the embedding pipeline (lazy loading with dynamic import)
 */
async function getEmbeddingPipeline() {
  // Verificar que estamos en el servidor
  if (typeof window !== "undefined") {
    throw new Error("Embeddings can only be generated on the server side");
  }

  if (embeddingPipeline) {
    return embeddingPipeline;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    console.log("[Embeddings] Initializing embedding model...");

    // Importación dinámica para evitar que Webpack lo incluya en el bundle del cliente
    const { pipeline, env } = await import("@xenova/transformers");

    // Configure Xenova to use local cache
    env.cacheDir = "./.cache/transformers";
    env.allowLocalModels = false;

    // Deshabilitar Sharp - no es necesario para embeddings de texto
    // Esto permite que el código funcione en Windows y Linux sin problemas de binarios
    env.backends.onnx.wasm.proxy = false;
    env.useBrowserCache = false;

    const pipe = await pipeline("feature-extraction", EMBEDDING_MODEL);
    embeddingPipeline = pipe;
    console.log("[Embeddings] Model ready");
    return pipe;
  })();

  return initializationPromise;
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error("Text cannot be empty");
  }

  try {
    const pipe = await getEmbeddingPipeline();

    // Generate embedding
    const output = await pipe(text, {
      pooling: "mean",
      normalize: true,
    });

    // Extract the embedding array
    const embedding = Array.from(output.data) as number[];

    return embedding;
  } catch (error) {
    console.error("[Embeddings] Error generating embedding:", error);
    throw new Error(`Failed to generate embedding: ${error}`);
  }
}

/**
 * Generate embeddings for multiple texts (batch processing)
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  try {
    // Process in parallel with reasonable concurrency
    const batchSize = 5;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchEmbeddings = await Promise.all(
        batch.map((text) => generateEmbedding(text))
      );
      results.push(...batchEmbeddings);
    }

    return results;
  } catch (error) {
    console.error("[Embeddings] Error generating batch embeddings:", error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Embeddings must have the same dimensions");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Find most similar embeddings from a list
 */
export function findMostSimilar(
  queryEmbedding: number[],
  embeddings: Array<{ id: string; embedding: number[]; metadata?: any }>,
  topK: number = 5
): Array<{ id: string; similarity: number; metadata?: any }> {
  const results = embeddings.map((item) => ({
    id: item.id,
    similarity: cosineSimilarity(queryEmbedding, item.embedding),
    metadata: item.metadata,
  }));

  // Sort by similarity (descending)
  results.sort((a, b) => b.similarity - a.similarity);

  // Return top K results
  return results.slice(0, topK);
}

/**
 * Prepare text for embedding (chunking for long texts)
 */
export function prepareTextForEmbedding(
  text: string,
  maxLength: number = 512
): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  // Split by sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Get embedding dimensions for the current model
 */
export function getEmbeddingDimensions(): number {
  return EMBEDDING_DIMENSIONS;
}

/**
 * Preload the embedding model (optional, for faster first use)
 */
export async function preloadEmbeddingModel(): Promise<void> {
  await getEmbeddingPipeline();
}
