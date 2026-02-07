/**
 * KNOWLEDGE COMMAND INTERCEPTOR
 *
 * Maneja el flujo de detección e intercepción de comandos de knowledge retrieval.
 * Si la IA responde con un comando, lo intercepta y reenvía el request con contexto expandido.
 */

import { detectKnowledgeCommand, getKnowledgeGroup, cleanKnowledgeCommands } from "./knowledge-retrieval";

export interface InterceptResult {
  shouldIntercept: boolean;
  command?: string;
  knowledgeContext?: string;
  cleanResponse: string; // SIEMPRE retorna una respuesta limpia
}

/**
 * Intercepta la respuesta de la IA y detecta si contiene un comando
 */
export async function interceptKnowledgeCommand(
  agentId: string,
  aiResponse: string
): Promise<InterceptResult> {
  // Detectar si hay un comando en la respuesta
  const command = detectKnowledgeCommand(aiResponse);

  if (!command) {
    // No hay comando, pero limpiar por si hay tags sueltos
    return {
      shouldIntercept: false,
      cleanResponse: cleanKnowledgeCommands(aiResponse),
    };
  }

  console.log(`[KnowledgeInterceptor] Comando detectado: ${command}`);

  // Hay comando, obtener el knowledge group correspondiente
  const knowledgeContext = await getKnowledgeGroup(agentId, command);

  console.log(`[KnowledgeInterceptor] Knowledge context obtenido (${knowledgeContext.length} chars)`);

  return {
    shouldIntercept: true,
    command,
    knowledgeContext,
    cleanResponse: cleanKnowledgeCommands(aiResponse),
  };
}

/**
 * Construye un prompt expandido con el knowledge context
 */
export function buildExpandedPrompt(
  originalPrompt: string,
  knowledgeContext: string,
  command: string
): string {
  return `${originalPrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 CONTEXTO ADICIONAL (Solicitaste: ${command})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${knowledgeContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ahora que tenés esta información, respondé la pregunta del usuario de forma natural.
NO menciones que "solicitaste información" ni el sistema de comandos.
Respondé como si siempre hubieras tenido esta información en tu memoria.
`;
}

/**
 * Estadísticas de uso de comandos (para analytics)
 */
export async function logCommandUsage(
  agentId: string,
  command: string,
  contextSize: number
): Promise<void> {
  try {
    // Aquí podrías guardar estadísticas en la BD si quieres
    console.log(`[KnowledgeStats] Agent ${agentId} used ${command} (${contextSize} chars)`);

    // Opcional: guardar en una tabla de analytics
    // await prisma.knowledgeCommandLog.create({
    //   data: { agentId, command, contextSize, timestamp: new Date() }
    // });
  } catch (error) {
    console.error("[KnowledgeStats] Error logging command usage:", error);
  }
}

/**
 * Calcula el ahorro de tokens estimado
 */
export function calculateTokenSavings(
  totalProfileSize: number,
  usedContextSize: number
): { savedTokens: number; savingPercentage: number } {
  const savedTokens = totalProfileSize - usedContextSize;
  const savingPercentage = (savedTokens / totalProfileSize) * 100;

  return {
    savedTokens,
    savingPercentage,
  };
}
