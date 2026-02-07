/**
 * CONTEXT COMPRESSION
 *
 * Comprime mensajes antiguos para que free users (10 context)
 * puedan "ver" más historial sin pagar el costo completo.
 *
 * Estrategia:
 * - Últimos N mensajes: FULL (según tier)
 * - Mensajes antiguos: SUMMARIZE (rule-based, NO LLM)
 *
 * Ejemplo:
 * Free user (10 context):
 * - Últimos 10 mensajes: completos
 * - Mensajes 11-50: comprimidos en 1 resumen
 *
 * Ahorro: $0 (no usa LLM para comprimir)
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface CompressionResult {
  messages: Message[];
  compressionApplied: boolean;
  originalCount: number;
  compressedCount: number;
}

/**
 * Comprime contexto según límite del tier
 */
export async function compressContext(
  messages: Message[],
  maxContextSize: number
): Promise<CompressionResult> {

  // Si no excede límite, no comprimir
  if (messages.length <= maxContextSize) {
    return {
      messages,
      compressionApplied: false,
      originalCount: messages.length,
      compressedCount: messages.length,
    };
  }

  // Últimos N mensajes: FULL context
  const recentMessages = messages.slice(-maxContextSize);

  // Mensajes antiguos: COMPRIMIR
  const oldMessages = messages.slice(0, -maxContextSize);

  // Comprimir en grupos de 5 mensajes
  const compressedSummary = compressMessagesSimple(oldMessages);

  // Crear mensaje de sistema con resumen
  const summaryMessage: Message = {
    id: `compressed-${Date.now()}`,
    role: 'system',
    content: `[📜 Resumen de ${oldMessages.length} mensajes anteriores:
${compressedSummary}]`,
    createdAt: oldMessages[0]?.createdAt || new Date(),
    metadata: {
      compressed: true,
      originalCount: oldMessages.length,
    },
  };

  return {
    messages: [summaryMessage, ...recentMessages],
    compressionApplied: true,
    originalCount: messages.length,
    compressedCount: recentMessages.length + 1,
  };
}

/**
 * Comprime mensajes usando reglas simples (NO LLM)
 */
function compressMessagesSimple(messages: Message[]): string {
  const summaries: string[] = [];

  // Comprimir cada 5 mensajes en 1 línea
  for (let i = 0; i < messages.length; i += 5) {
    const chunk = messages.slice(i, i + 5);

    // Extraer temas principales (keywords)
    const topics = extractTopics(chunk);

    // Formato: "Usuario habló sobre X, Y. IA respondió Z."
    const userMessages = chunk.filter(m => m.role === 'user');
    const aiMessages = chunk.filter(m => m.role === 'assistant');

    let summary = '';

    if (userMessages.length > 0) {
      const userTopics = userMessages.map(m =>
        m.content.slice(0, 50).trim() + (m.content.length > 50 ? '...' : '')
      ).join('; ');

      summary += `U: ${userTopics}`;
    }

    if (aiMessages.length > 0) {
      const aiSample = aiMessages[0].content.slice(0, 50).trim() +
                      (aiMessages[0].content.length > 50 ? '...' : '');

      summary += ` | IA: ${aiSample}`;
    }

    summaries.push(summary);
  }

  return summaries.join('\n');
}

/**
 * Extrae keywords/topics de un grupo de mensajes
 */
function extractTopics(messages: Message[]): string[] {
  const stopWords = new Set([
    'el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'ser', 'se', 'no', 'haber',
    'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'todo',
    'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este', 'ir', 'otro', 'ese',
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
  ]);

  const words: Map<string, number> = new Map();

  messages.forEach(msg => {
    const tokens = msg.content
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    tokens.forEach(word => {
      words.set(word, (words.get(word) || 0) + 1);
    });
  });

  // Top 3 palabras más frecuentes
  return Array.from(words.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);
}

/**
 * Variante avanzada: Comprime SOLO si es necesario (lazy)
 * Útil para evitar procesamiento innecesario
 */
export function shouldCompress(
  messageCount: number,
  maxContextSize: number
): boolean {
  return messageCount > maxContextSize;
}

/**
 * Helper: Estima tokens ahorrados por compresión
 */
export function estimateTokensSaved(
  originalMessages: Message[],
  maxContextSize: number
): number {
  if (originalMessages.length <= maxContextSize) {
    return 0;
  }

  const oldMessages = originalMessages.slice(0, -maxContextSize);

  // Estimar ~4 chars = 1 token
  const originalTokens = oldMessages.reduce(
    (sum, msg) => sum + Math.ceil(msg.content.length / 4),
    0
  );

  // Resumen comprimido: ~50 chars por grupo de 5 mensajes
  const groups = Math.ceil(oldMessages.length / 5);
  const compressedTokens = groups * Math.ceil(50 / 4);

  return originalTokens - compressedTokens;
}

/**
 * Formatea el resultado de compresión para logging
 */
export function logCompressionStats(result: CompressionResult): void {
  if (!result.compressionApplied) {
    return;
  }

  const savings = ((1 - result.compressedCount / result.originalCount) * 100).toFixed(1);

  console.log(`[ContextCompression] Compressed ${result.originalCount} → ${result.compressedCount} messages (${savings}% reduction)`);
}
