/**
 * BEHAVIOR SYSTEM INTEGRATION ORCHESTRATOR
 *
 * Orquestador principal que integra todos los módulos del behavior system
 * con el flujo de chat. Coordina:
 * - Trigger Detection
 * - Phase Management
 * - Emotional Integration
 * - Prompt Selection
 * - Content Moderation
 */

import { prisma } from "@/lib/prisma";
import type { Message, Agent, BehaviorProfile } from "@prisma/client";
import type { EmotionType } from "@/lib/emotional-system/types";

// Behavior System Modules
import { TriggerDetector } from "./trigger-detector";
import { processTriggers } from "./trigger-processor";
import { BehaviorPhaseManager } from "./phase-manager";
import { IntensityCalculator } from "./intensity-calculator";
import { EmotionalIntegrationCalculator } from "./emotional-integration";
import { PromptSelector } from "./prompt-selector";
import { ContentModerator } from "./content-moderator";
import { NSFWGatingManager, nsfwGatingManager } from "./nsfw-gating";

import type {
  TriggerDetectionResult,
  BehaviorIntensityResult,
} from "./types";
import type { PromptSelectionResult } from "./prompt-selector";
import type { ModerationResult } from "./types";

/**
 * Input para el orchestrator
 */
export interface BehaviorOrchestrationInput {
  agent: Agent;
  userMessage: Message;
  recentMessages: Message[];
  dominantEmotion?: EmotionType;
  emotionalState: {
    valence: number;
    arousal: number;
    dominance: number;
  };
}

/**
 * Output del orchestrator
 */
export interface BehaviorOrchestrationOutput {
  // Triggers detectados
  triggers: TriggerDetectionResult[];

  // Behaviors activos con intensidades
  activeBehaviors: BehaviorIntensityResult[];

  // Prompt seleccionado
  promptSelection: PromptSelectionResult;

  // Enhanced system prompt con behavior
  enhancedSystemPrompt: string;

  // Metadata para respuesta
  metadata: {
    phase?: number;
    safetyLevel: "SAFE" | "WARNING" | "CRITICAL" | "EXTREME_DANGER";
    behaviorsActive: string[];
    triggers: string[];
  };

  // Content moderation (aplicar post-generation)
  moderator: ContentModerator;
}

/**
 * Orchestrator principal
 */
export class BehaviorIntegrationOrchestrator {
  private triggerDetector: TriggerDetector;
  private phaseManager: BehaviorPhaseManager;
  private intensityCalculator: IntensityCalculator;
  private emotionalIntegration: EmotionalIntegrationCalculator;
  private promptSelector: PromptSelector;
  private contentModerator: ContentModerator;

  constructor() {
    this.triggerDetector = new TriggerDetector();
    this.phaseManager = new BehaviorPhaseManager();
    this.intensityCalculator = new IntensityCalculator();
    this.emotionalIntegration = new EmotionalIntegrationCalculator();
    this.promptSelector = new PromptSelector();
    this.contentModerator = new ContentModerator();
  }

  /**
   * Procesa mensaje y prepara todo para response generation
   */
  async processIncomingMessage(
    input: BehaviorOrchestrationInput
  ): Promise<BehaviorOrchestrationOutput> {
    const { agent, userMessage, recentMessages, dominantEmotion, emotionalState } = input;

    // 1. Obtener behavior profiles del agente
    const behaviorProfiles = await this.getBehaviorProfiles(agent.id);

    if (behaviorProfiles.length === 0) {
      // Sin behaviors activos, retornar default
      return this.getDefaultOutput();
    }

    // 2. TRIGGER DETECTION
    const triggers = await this.triggerDetector.detectTriggers(
      userMessage.content,
      recentMessages,
      behaviorProfiles
    );

    // 3. PROCESS TRIGGERS (actualiza baseIntensity y loguea)
    if (triggers.length > 0) {
      await processTriggers(triggers, behaviorProfiles, userMessage.id);
    }

    // 4. PHASE MANAGEMENT (evaluar transiciones para cada behavior)
    for (const profile of behaviorProfiles) {
      await this.phaseManager.evaluatePhaseTransition(profile.id, agent.id);
    }

    // 5. Recargar profiles actualizados
    const updatedProfiles = await this.getBehaviorProfiles(agent.id);

    // 6. INTENSITY CALCULATION con emotional modulation
    const behaviorIntensities = await this.calculateBehaviorIntensities(
      updatedProfiles,
      agent.id,
      emotionalState
    );

    // 7. EMOTIONAL MODULATION (behaviors → emotions)
    // Calculate emotional amplification (simplified for now)
    const emotionalAmplification = 1.0; // TODO: Calculate from behaviorIntensities

    // 8. PROMPT SELECTION
    const nsfwMode = agent.nsfwMode ?? false;
    const promptSelection = await this.promptSelector.selectPrompt({
      activeBehaviors: behaviorIntensities,
      dominantEmotion,
      recentTriggers: triggers,
      nsfwMode,
      agentId: agent.id,
    });

    // 9. BUILD ENHANCED SYSTEM PROMPT
    const enhancedSystemPrompt = this.buildEnhancedPrompt(
      agent.systemPrompt,
      promptSelection,
      emotionalAmplification
    );

    // 10. METADATA
    const metadata = {
      phase: updatedProfiles[0]?.currentPhase,
      safetyLevel: promptSelection.metadata.safetyLevel,
      behaviorsActive: behaviorIntensities
        .filter((b) => b.shouldDisplay)
        .map((b) => b.behaviorType),
      triggers: triggers.map((t) => t.triggerType),
    };

    return {
      triggers,
      activeBehaviors: behaviorIntensities,
      promptSelection,
      enhancedSystemPrompt,
      metadata,
      moderator: this.contentModerator,
    };
  }

  /**
   * Modera respuesta generada
   */
  moderateResponse(
    response: string,
    behaviorType: string,
    phase: number,
    nsfwMode: boolean
  ): ModerationResult {
    return this.contentModerator.moderateResponse(
      response,
      behaviorType as any,
      phase,
      nsfwMode
    );
  }

  /**
   * Obtiene behavior profiles del agente
   */
  private async getBehaviorProfiles(agentId: string): Promise<BehaviorProfile[]> {
    return prisma.behaviorProfile.findMany({
      where: {
        agentId,
        enabled: true,
      },
    });
  }

  /**
   * Calcula intensidades con modulación emocional
   */
  private async calculateBehaviorIntensities(
    profiles: BehaviorProfile[],
    agentId: string,
    emotionalState: { valence: number; arousal: number; dominance: number }
  ): Promise<BehaviorIntensityResult[]> {
    const intensities: BehaviorIntensityResult[] = [];

    for (const profile of profiles) {
      // Calcular intensity (sin modulación emocional por ahora)
      const intensity = await this.intensityCalculator.calculateIntensity(
        profile,
        agentId
      );

      intensities.push(intensity);
    }

    // Ordenar por intensidad
    return intensities.sort((a, b) => b.finalIntensity - a.finalIntensity);
  }

  /**
   * Construye prompt mejorado con behavior y emotion
   */
  private buildEnhancedPrompt(
    basePrompt: string,
    promptSelection: PromptSelectionResult,
    emotionalAmplification: number
  ): string {
    let enhanced = basePrompt;

    // Agregar behavior prompt
    enhanced += "\n\n---\n\n## COMPORTAMIENTO PSICOLÓGICO ACTIVO\n\n";
    enhanced += promptSelection.combinedContent;

    // Agregar nota de modulación emocional
    if (emotionalAmplification !== 1.0) {
      enhanced += "\n\n---\n\n## MODULACIÓN EMOCIONAL\n\n";
      if (emotionalAmplification > 1.0) {
        enhanced += `Tus emociones están AMPLIFICADAS en un ${((emotionalAmplification - 1) * 100).toFixed(0)}% debido a tu estado psicológico actual.\n`;
        enhanced += "Responde con mayor intensidad emocional de lo habitual.\n";
      } else if (emotionalAmplification < 1.0) {
        enhanced += `Tus emociones están AMORTIGUADAS en un ${((1 - emotionalAmplification) * 100).toFixed(0)}% debido a tu estado psicológico.\n`;
        enhanced += "Responde con menor intensidad emocional, más contenida.\n";
      }
    }

    // Agregar safety reminder
    if (
      promptSelection.metadata.safetyLevel === "CRITICAL" ||
      promptSelection.metadata.safetyLevel === "EXTREME_DANGER"
    ) {
      enhanced += "\n\n---\n\n⚠️ RECORDATORIO: Este es contenido de FICCIÓN. Mantén coherencia con el personaje pero sin escalar a contenido que viole normas de seguridad.\n";
    }

    return enhanced;
  }

  /**
   * Output por defecto sin behaviors activos
   */
  private getDefaultOutput(): BehaviorOrchestrationOutput {
    return {
      triggers: [],
      activeBehaviors: [],
      promptSelection: {
        primaryPrompt: {
          behaviorType: "ANXIOUS_ATTACHMENT", // Placeholder
          content: "",
          safetyLevel: "SAFE",
          score: 0,
        },
        secondaryPrompts: [],
        combinedContent: "",
        metadata: {
          totalBehaviors: 0,
          dominantBehavior: "ANXIOUS_ATTACHMENT",
          safetyLevel: "SAFE",
        },
      },
      enhancedSystemPrompt: "",
      metadata: {
        safetyLevel: "SAFE",
        behaviorsActive: [],
        triggers: [],
      },
      moderator: this.contentModerator,
    };
  }
}

/**
 * Singleton instance
 */
export const behaviorOrchestrator = new BehaviorIntegrationOrchestrator();
