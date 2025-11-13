/**
 * MULTIMODAL ORCHESTRATOR SERVICE
 *
 * Orquesta la generación de respuestas multimodales
 * (texto + audio + imagen) con sistema emocional
 */

import { hybridEmotionalOrchestrator } from "@/lib/emotional-system/hybrid-orchestrator";
import type { UserEmotionAnalysis } from "./emotional-analyzer";

export interface MultimodalResponseParams {
  agentId: string;
  userMessage: string;
  userEmotion?: UserEmotionAnalysis;
  includeMetadata?: boolean;
}

export interface MultimodalResponse {
  text: string;
  emotion: {
    dominantEmotion: string;
    intensity: "low" | "medium" | "high";
  };
  metadata?: {
    emotionsTriggered: string[];
    internalReasoning?: {
      situation: string;
      primaryEmotion: string;
    };
  };
}

export class EmotionalOrchestrator {
  /**
   * Genera una respuesta del agente considerando el contexto emocional del usuario
   */
  async generateResponse(
    params: MultimodalResponseParams
  ): Promise<MultimodalResponse> {
    const { agentId, userMessage, userEmotion, includeMetadata } = params;

    console.log("[EmotionalOrchestrator] Generating response for agent:", agentId);

    // Usar el orchestrator híbrido para generar la respuesta
    // (decide automáticamente entre Fast Path y Deep Path)
    const hybridResult = await hybridEmotionalOrchestrator.processMessage({
      agentId,
      userMessage,
      userId: "system", // Se puede obtener del contexto si es necesario
      generateResponse: true,
    });

    // Extraer emoción dominante del agente
    const emotionsTriggered = hybridResult.metadata.emotionsTriggered || [];
    const dominantEmotion = emotionsTriggered[0] || "neutral";

    // Calcular intensidad basada en el sistema emocional
    const intensity = this.calculateIntensity(hybridResult);

    // Obtener el texto de respuesta
    const responseText = hybridResult.response?.responseText || "Lo siento, no pude procesar tu mensaje.";

    const result: MultimodalResponse = {
      text: responseText,
      emotion: {
        dominantEmotion,
        intensity,
      },
    };

    if (includeMetadata) {
      result.metadata = {
        emotionsTriggered,
        internalReasoning: (hybridResult.response?.metadata as any)?.internalReasoning
          ? {
              situation: (hybridResult.response?.metadata as any).internalReasoning.situation,
              primaryEmotion: (hybridResult.response?.metadata as any).internalReasoning.primaryEmotion,
            }
          : undefined,
      };
    }

    return result;
  }

  /**
   * Calcula la intensidad emocional de la respuesta
   */
  private calculateIntensity(response: any): "low" | "medium" | "high" {
    // Si hay metadata con intensidad explícita
    if (response.metadata?.emotionalIntensity) {
      const intensity = response.metadata.emotionalIntensity;
      if (intensity < 0.3) return "low";
      if (intensity < 0.7) return "medium";
      return "high";
    }

    // Calcular desde número de emociones triggeradas
    const emotionCount = response.metadata.emotionsTriggered?.length || 0;
    if (emotionCount === 0) return "low";
    if (emotionCount <= 2) return "medium";
    return "high";
  }
}

// Singleton instance
let emotionalOrchestrator: EmotionalOrchestrator | null = null;

export function getEmotionalOrchestrator(): EmotionalOrchestrator {
  if (!emotionalOrchestrator) {
    emotionalOrchestrator = new EmotionalOrchestrator();
    console.log("[EmotionalOrchestrator] Service initialized");
  }
  return emotionalOrchestrator;
}
