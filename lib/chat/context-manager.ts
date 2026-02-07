import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { getLLMProvider } from "@/lib/llm/provider";
import type { UserTier } from "./types";

/**
 * Advanced Context Window Management System
 *
 * Basado en mejores prácticas de 2024-2025:
 * - MemGPT (virtual memory paging)
 * - LongLLMLingua (prompt compression)
 * - Progressive summarization
 * - Multi-tier memory architecture
 *
 * Budget de tokens (32K límite de Gemini):
 * FREE:  ~8K tokens  (25% del límite)
 * PLUS:  ~15K tokens (47% del límite)
 * ULTRA: ~25K tokens (78% del límite)
 */

// ============================================================================
// TIER CONFIGURATION
// ============================================================================

const TIER_CONFIG = {
  free: {
    // Mensajes
    maxRecentMessages: 10, // Solo 10 mensajes recientes completos
    includeSummary: false, // No incluye resumen de contexto antiguo

    // Memoria semántica
    maxSemanticFacts: 10, // Máximo 10 hechos importantes

    // Contextos dinámicos
    includeRoutineContext: false,
    includeGoalsContext: false,
    includeCrossContextMemory: false,
    maxTemporalReferences: 0,

    // Budget
    totalTokenBudget: 8000,
    messagesTokenBudget: 2000,
    contextTokenBudget: 3000,
    summaryTokenBudget: 0,
  },
  plus: {
    maxRecentMessages: 30,
    includeSummary: true,

    maxSemanticFacts: 30,

    includeRoutineContext: true,
    includeGoalsContext: true,
    includeCrossContextMemory: true,
    maxTemporalReferences: 3,

    totalTokenBudget: 15000,
    messagesTokenBudget: 6000,
    contextTokenBudget: 5000,
    summaryTokenBudget: 1000,
  },
  ultra: {
    maxRecentMessages: 60,
    includeSummary: true,

    maxSemanticFacts: 100, // Sin límite práctico

    includeRoutineContext: true,
    includeGoalsContext: true,
    includeCrossContextMemory: true,
    maxTemporalReferences: 5,

    totalTokenBudget: 25000,
    messagesTokenBudget: 12000,
    contextTokenBudget: 8000,
    summaryTokenBudget: 3000,
  },
};

// ============================================================================
// TOKEN ESTIMATION
// ============================================================================

/**
 * Estimador de tokens (4 caracteres ≈ 1 token para español/inglés)
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Trunca texto para que no exceda un número de tokens
 */
export function truncateToTokens(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 3) + "...";
}

// ============================================================================
// SEMANTIC MEMORY EXTRACTION
// ============================================================================

/**
 * Extrae hechos importantes de mensajes recientes
 * Inspirado en MemGPT - almacenamiento persistente de información clave
 */
export async function extractAndStoreSemanticFacts(
  agentId: string,
  userId: string,
  messages: Array<{ role: string; content: string }>
): Promise<string[]> {
  const userMessages = messages.filter((m) => m.role === "user");
  const newFacts: string[] = [];

  // Patrones de información personal expandidos
  const patterns = [
    { regex: /(?:me llamo|soy) ([A-ZÁ-Ú][a-zá-ú]+)/i, type: "name", template: "Se llama" },
    { regex: /tengo (\d+) años/i, type: "age", template: "Tiene" },
    { regex: /(?:vivo en|soy de) ([^,.]+)/i, type: "location", template: "Vive en" },
    { regex: /trabajo (?:como|de|en) ([^,.]+)/i, type: "occupation", template: "Trabaja como" },
    { regex: /estudio ([^,.]+)/i, type: "education", template: "Estudia" },
    { regex: /me (?:gusta|encanta) ([^,.]+)/i, type: "interest", template: "Le gusta" },
    { regex: /(?:odio|detesto) ([^,.]+)/i, type: "dislike", template: "No le gusta" },
    { regex: /mi (?:hobby|pasatiempo) es ([^,.]+)/i, type: "hobby", template: "Su hobby es" },
    { regex: /tengo (?:un|una) ([^,.]+)/i, type: "possession", template: "Tiene" },
    { regex: /(?:mi|el) objetivo es ([^,.]+)/i, type: "goal", template: "Su objetivo es" },
  ];

  for (const msg of userMessages) {
    for (const { regex, type, template } of patterns) {
      const match = msg.content.match(regex);
      if (match) {
        const fact = `${template} ${match[1]}`;
        newFacts.push(fact);
      }
    }
  }

  if (newFacts.length === 0) return [];

  // Actualizar memoria semántica en DB
  const existingMemory = await prisma.semanticMemory.findUnique({
    where: { agentId },
  });

  const currentFacts = (existingMemory?.userFacts as string[]) || [];
  const allFacts = [...new Set([...currentFacts, ...newFacts])]; // Deduplicar

  await prisma.semanticMemory.upsert({
    where: { agentId },
    create: {
      id: nanoid(),
      agentId,
      userFacts: allFacts,
      userPreferences: {},
    },
    update: {
      userFacts: allFacts,
      lastUpdated: new Date(),
    },
  });

  return newFacts;
}

/**
 * Obtiene hechos semánticos para inyectar en el contexto
 */
export async function getSemanticFacts(
  agentId: string,
  maxFacts: number
): Promise<string> {
  const memory = await prisma.semanticMemory.findUnique({
    where: { agentId },
  });

  if (!memory) return "";

  const facts = (memory.userFacts as string[]) || [];
  if (facts.length === 0) return "";

  const selectedFacts = facts.slice(-maxFacts); // Más recientes

  return `\n**HECHOS IMPORTANTES DEL USUARIO**\n${selectedFacts.map((f) => `- ${f}`).join("\n")}\n`;
}

// ============================================================================
// PROGRESSIVE SUMMARIZATION (LongLLMLingua-inspired)
// ============================================================================

/**
 * Genera un resumen inteligente de mensajes antiguos usando el LLM
 */
async function generateIntelligentSummary(
  messages: Array<{ role: string; content: string; createdAt: Date }>,
  maxTokens: number
): Promise<string> {
  if (messages.length === 0) return "";

  // Construir contexto para el LLM
  const conversationText = messages
    .map((m) => `${m.role === "user" ? "Usuario" : "Asistente"}: ${m.content}`)
    .join("\n\n");

  const summaryPrompt = `Resume la siguiente conversación de manera concisa pero completa. Incluye:
- Los temas principales discutidos
- Información importante compartida por el usuario
- Estado emocional general de la conversación
- Cualquier plan o compromiso mencionado

Conversación:
${conversationText}

Resumen (máximo ${maxTokens * 4} caracteres):`;

  try {
    const llm = getLLMProvider();
    const summary = await llm.generate({
      systemPrompt: "Eres un asistente que genera resúmenes concisos y precisos de conversaciones.",
      messages: [{ role: "user", content: summaryPrompt }],
    });

    return truncateToTokens(summary, maxTokens);
  } catch (error) {
    console.error("Error generating summary:", error);
    // Fallback: resumen simple
    return generateSimpleSummary(messages, maxTokens);
  }
}

/**
 * Resumen simple como fallback (sin LLM)
 */
function generateSimpleSummary(
  messages: Array<{ role: string; content: string; createdAt: Date }>,
  maxTokens: number
): string {
  const userMessages = messages.filter((m) => m.role === "user");

  // Tomar los mensajes más largos (más información)
  const importantMessages = userMessages
    .sort((a, b) => b.content.length - a.content.length)
    .slice(0, 5);

  let summary = `Resumen de ${messages.length} mensajes anteriores:\n\n`;
  summary += "Temas mencionados:\n";

  for (const msg of importantMessages) {
    const preview = msg.content.slice(0, 80);
    summary += `- ${preview}${msg.content.length > 80 ? "..." : ""}\n`;
  }

  return truncateToTokens(summary, maxTokens);
}

/**
 * Obtiene o genera resumen de conversación antigua
 */
async function getOrCreateSummary(
  agentId: string,
  userId: string | undefined,
  oldMessages: Array<{ role: string; content: string; createdAt: Date }>,
  maxTokens: number,
  useIntelligentSummary: boolean
): Promise<string | undefined> {
  if (oldMessages.length === 0) return undefined;

  // Buscar resumen existente
  const existing = await prisma.conversationSummary.findFirst({
    where: {
      agentId,
      userId: userId || null,
      messagesCount: oldMessages.length,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) return existing.summary;

  // Generar nuevo resumen
  const summary = useIntelligentSummary
    ? await generateIntelligentSummary(oldMessages, maxTokens)
    : generateSimpleSummary(oldMessages, maxTokens);

  // Guardar en DB para reutilizar
  await prisma.conversationSummary.create({
    data: {
      id: nanoid(),
      updatedAt: new Date(),
      agentId,
      userId: userId || null,
      summary,
      messagesCount: oldMessages.length,
      periodStart: oldMessages[0].createdAt,
      periodEnd: oldMessages[oldMessages.length - 1].createdAt,
      estimatedTokens: estimateTokens(summary),
    },
  });

  return summary;
}

// ============================================================================
// SLIDING WINDOW MESSAGE RETRIEVAL
// ============================================================================

/**
 * Obtiene mensajes optimizados con sliding window
 */
export async function getOptimizedMessages(
  agentId: string,
  userId: string | undefined,
  tier: UserTier
): Promise<{
  recentMessages: Array<{ role: string; content: string }>;
  summary?: string;
  semanticFacts?: string;
  stats: {
    totalMessages: number;
    recentCount: number;
    oldCount: number;
    messagesTokens: number;
    summaryTokens: number;
    factsTokens: number;
  };
}> {
  const config = TIER_CONFIG[tier];

  // 1. Obtener TODOS los mensajes
  const allMessages = await prisma.message.findMany({
    where: {
      agentId,
      ...(userId ? { userId } : {}),
    },
    orderBy: { createdAt: "asc" },
    select: {
      role: true,
      content: true,
      createdAt: true,
    },
  });

  if (allMessages.length === 0) {
    return {
      recentMessages: [],
      stats: {
        totalMessages: 0,
        recentCount: 0,
        oldCount: 0,
        messagesTokens: 0,
        summaryTokens: 0,
        factsTokens: 0,
      },
    };
  }

  // 2. Separar mensajes recientes vs antiguos (sliding window)
  const recentMessages = allMessages.slice(-config.maxRecentMessages);
  const oldMessages = allMessages.slice(0, -config.maxRecentMessages);

  // 3. Formatear mensajes recientes
  const formattedRecent = recentMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const messagesTokens = formattedRecent.reduce(
    (sum, m) => sum + estimateTokens(m.content),
    0
  );

  // 4. Generar resumen de mensajes antiguos (si aplica)
  let summary: string | undefined;
  let summaryTokens = 0;

  if (config.includeSummary && oldMessages.length > 0 && userId) {
    summary = await getOrCreateSummary(
      agentId,
      userId,
      oldMessages,
      config.summaryTokenBudget,
      tier === "ultra" // Ultra usa resumen inteligente con LLM
    );

    if (summary) {
      summaryTokens = estimateTokens(summary);
    }
  }

  // 5. Extraer y obtener hechos semánticos
  let semanticFacts: string | undefined;
  let factsTokens = 0;

  if (userId) {
    await extractAndStoreSemanticFacts(agentId, userId, formattedRecent);
    semanticFacts = await getSemanticFacts(agentId, config.maxSemanticFacts);

    if (semanticFacts) {
      factsTokens = estimateTokens(semanticFacts);
    }
  }

  return {
    recentMessages: formattedRecent,
    summary,
    semanticFacts,
    stats: {
      totalMessages: allMessages.length,
      recentCount: recentMessages.length,
      oldCount: oldMessages.length,
      messagesTokens,
      summaryTokens,
      factsTokens,
    },
  };
}

// ============================================================================
// CONTEXT PRIORITY SYSTEM
// ============================================================================

interface ContextItem {
  name: string;
  content: string;
  priority: number;
  essential: boolean;
  tokens: number;
}

/**
 * Prioriza y filtra contextos según budget de tokens
 */
export function prioritizeContexts(
  tier: UserTier,
  contexts: Record<string, string>
): {
  selectedContexts: string[];
  droppedContexts: string[];
  totalTokens: number;
} {
  const config = TIER_CONFIG[tier];

  // Definir prioridades
  const contextPriorities: Array<{
    name: string;
    priority: number;
    essential: boolean;
    tierRequired?: UserTier;
  }> = [
    // ESENCIALES (siempre se incluyen)
    { name: "vulnerabilityContext", priority: 100, essential: true },
    { name: "moodContext", priority: 95, essential: true },
    { name: "energyContext", priority: 90, essential: true },
    { name: "depthContext", priority: 85, essential: true },

    // IMPORTANTES (se incluyen si hay budget)
    { name: "routineContext", priority: 70, essential: false, tierRequired: "plus" },
    { name: "livingAIContext", priority: 65, essential: false, tierRequired: "plus" },
    { name: "memoryContext", priority: 60, essential: false, tierRequired: "plus" },
    { name: "temporalReferencesContext", priority: 55, essential: false, tierRequired: "plus" },

    // OPCIONALES (se incluyen si sobra budget)
    { name: "fatigueContext", priority: 40, essential: false },
    { name: "timeAwarenessContext", priority: 30, essential: false },
  ];

  // Crear lista de items con tokens
  const items: ContextItem[] = [];

  for (const { name, priority, essential, tierRequired } of contextPriorities) {
    const content = contexts[name];
    if (!content) continue;

    // Verificar tier requirement
    if (tierRequired) {
      const tierOrder = { free: 0, plus: 1, ultra: 2 };
      if (tierOrder[tier] < tierOrder[tierRequired]) {
        continue; // Skip este contexto para este tier
      }
    }

    items.push({
      name,
      content,
      priority,
      essential,
      tokens: estimateTokens(content),
    });
  }

  // Ordenar por prioridad
  items.sort((a, b) => b.priority - a.priority);

  // Seleccionar contextos según budget
  const selected: ContextItem[] = [];
  const dropped: string[] = [];
  let totalTokens = 0;

  for (const item of items) {
    if (item.essential) {
      // Esenciales siempre se incluyen
      selected.push(item);
      totalTokens += item.tokens;
    } else {
      // Opcionales solo si hay budget
      if (totalTokens + item.tokens <= config.contextTokenBudget) {
        selected.push(item);
        totalTokens += item.tokens;
      } else {
        dropped.push(item.name);
      }
    }
  }

  return {
    selectedContexts: selected.map((item) => item.content),
    droppedContexts: dropped,
    totalTokens,
  };
}

// ============================================================================
// MAIN BUILDER FUNCTION
// ============================================================================

/**
 * Construye el prompt final optimizado con gestión completa de tokens
 */
export async function buildOptimizedPrompt(
  agentId: string,
  userId: string | undefined,
  tier: UserTier,
  systemPrompt: string,
  dynamicContexts: Record<string, string>
): Promise<{
  finalPrompt: string;
  optimizedMessages: Array<{ role: string; content: string }>;
  stats: {
    totalTokens: number;
    systemTokens: number;
    contextTokens: number;
    factsTokens: number;
    summaryTokens: number;
    messagesTokens: number;
    percentageUsed: number;
    budget: number;
    remaining: number;
  };
  warnings: string[];
}> {
  const config = TIER_CONFIG[tier];
  const warnings: string[] = [];

  // 1. Obtener mensajes optimizados con sliding window
  const {
    recentMessages,
    summary,
    semanticFacts,
    stats: messageStats,
  } = await getOptimizedMessages(agentId, userId, tier);

  // 2. Priorizar contextos dinámicos
  const { selectedContexts, droppedContexts, totalTokens: contextTokens } =
    prioritizeContexts(tier, dynamicContexts);

  if (droppedContexts.length > 0) {
    warnings.push(`Contextos omitidos por límite de tokens: ${droppedContexts.join(", ")}`);
  }

  // 3. Construir prompt final
  let finalPrompt = systemPrompt;

  // Agregar hechos semánticos (memoria persistente)
  if (semanticFacts) {
    finalPrompt += "\n" + semanticFacts;
  }

  // Agregar resumen de contexto antiguo
  if (summary) {
    finalPrompt += "\n**CONTEXTO DE CONVERSACIÓN ANTERIOR**\n" + summary + "\n";
  }

  // Agregar contextos dinámicos priorizados
  if (selectedContexts.length > 0) {
    finalPrompt += "\n" + selectedContexts.join("\n");
  }

  // 4. Calcular estadísticas finales
  const systemTokens = estimateTokens(systemPrompt);
  const totalTokens =
    systemTokens +
    messageStats.factsTokens +
    messageStats.summaryTokens +
    contextTokens +
    messageStats.messagesTokens;

  const percentageUsed = (totalTokens / 32000) * 100;
  const remaining = config.totalTokenBudget - totalTokens;

  // 5. Warning si nos acercamos al límite
  if (percentageUsed > 80) {
    warnings.push(`⚠️ Uso de tokens alto: ${percentageUsed.toFixed(1)}%`);
  }

  if (remaining < 1000) {
    warnings.push(`⚠️ Poco budget restante: ${remaining} tokens`);
  }

  return {
    finalPrompt,
    optimizedMessages: recentMessages,
    stats: {
      totalTokens,
      systemTokens,
      contextTokens,
      factsTokens: messageStats.factsTokens,
      summaryTokens: messageStats.summaryTokens,
      messagesTokens: messageStats.messagesTokens,
      percentageUsed,
      budget: config.totalTokenBudget,
      remaining,
    },
    warnings,
  };
}

// ============================================================================
// MAINTENANCE
// ============================================================================

/**
 * Limpia resúmenes antiguos (ejecutar periódicamente)
 */
export async function cleanupOldSummaries(agentId?: string): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const result = await prisma.conversationSummary.deleteMany({
    where: {
      ...(agentId ? { agentId } : {}),
      createdAt: { lt: thirtyDaysAgo },
    },
  });

  return result.count;
}
