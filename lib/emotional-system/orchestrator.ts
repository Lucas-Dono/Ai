/**
 * ⚠️ NOTA: Este orquestador ahora es usado internamente por HybridEmotionalOrchestrator
 *
 * NO USAR DIRECTAMENTE - Usar en su lugar:
 * import { hybridEmotionalOrchestrator } from "@/lib/emotional-system/hybrid-orchestrator";
 *
 * Este orchestrator (OCC puro) ahora se usa solo para el DEEP PATH
 * cuando el mensaje es complejo. El sistema híbrido decide automáticamente
 * cuándo usar este vs el Fast Path (Plutchik rule-based).
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * EMOTIONAL SYSTEM ORCHESTRATOR (OCC-based)
 *
 * Orquesta todo el flujo del sistema emocional:
 * 1. Appraisal → 2. Emotion → 3. Memory → 4. Reasoning →
 * 5. Action → 6. Response → 7. Storage → 8. Growth
 */

import { CompleteCharacterState, ResponseGenerationOutput } from "./types";
import { prisma } from "@/lib/prisma";
import { AppraisalEngine } from "./modules/appraisal/engine";
import { EmotionGenerator } from "./modules/emotion/generator";
import { EmotionDecaySystem } from "./modules/emotion/decay";
import { MemoryRetrievalSystem } from "./modules/memory/retrieval";
import { InternalReasoningEngine } from "./modules/cognition/reasoning";
import { ActionDecisionEngine } from "./modules/cognition/action-decision";
import { ResponseGenerator } from "./modules/response/generator";
import { CharacterGrowthSystem } from "./modules/growth/character-growth";
import { intelligentStorageSystem } from "./modules/memory/intelligent-storage";

export class EmotionalSystemOrchestrator {
  private appraisalEngine = new AppraisalEngine();
  private emotionGenerator = new EmotionGenerator();
  private decaySystem = new EmotionDecaySystem();
  private memorySystem = new MemoryRetrievalSystem();
  private reasoningEngine = new InternalReasoningEngine();
  private actionDecision = new ActionDecisionEngine();
  private responseGenerator = new ResponseGenerator();
  private growthSystem = new CharacterGrowthSystem();

  /**
   * Procesa un mensaje del usuario y genera respuesta completa
   */
  async processMessage(params: {
    agentId: string;
    userMessage: string;
    userId: string;
  }): Promise<ResponseGenerationOutput> {
    const { agentId, userMessage } = params;

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🧠 EMOTIONAL SYSTEM - Processing Message");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const startTime = Date.now();

    try {
      // ============================================
      // FASE 0: Cargar Character State Completo
      // ============================================
      console.log("[Phase 0] 📂 Loading character state...");
      const characterState = await this.loadCharacterState(agentId);

      // ============================================
      // FASE 1: APPRAISAL (Evaluación OCC)
      // ============================================
      console.log("[Phase 1] 🔍 Appraisal Engine...");
      const appraisal = await this.appraisalEngine.evaluateSituation(userMessage, characterState);

      // ============================================
      // FASE 2: EMOTION GENERATION
      // ============================================
      console.log("[Phase 2] 💚 Emotion Generator...");
      const emotionResult = await this.emotionGenerator.generateFromAppraisal(
        appraisal,
        characterState.internalState.emotions,
        characterState.personalityCore.bigFive
      );

      // ============================================
      // FASE 3: EMOTION DECAY & MOOD UPDATE
      // ============================================
      console.log("[Phase 3] ⏱️  Emotion Decay & Mood...");
      const { emotions: updatedEmotions, mood: updatedMood } = this.decaySystem.updateEmotionalSystem({
        currentEmotions: characterState.internalState.emotions,
        newEmotions: emotionResult.emotions,
        baselineEmotions: characterState.personalityCore.baselineEmotions,
        currentMood: {
          valence: characterState.internalState.moodValence,
          arousal: characterState.internalState.moodArousal,
          dominance: characterState.internalState.moodDominance,
        },
        targetMoodShift: emotionResult.moodShift,
        dynamics: {
          decayRate: characterState.internalState.emotionDecayRate,
          inertia: characterState.internalState.emotionInertia,
        },
        personality: characterState.personalityCore.bigFive,
      });

      // Actualizar internal state en memoria
      await prisma.internalState.update({
        where: { agentId },
        data: {
          currentEmotions: updatedEmotions,
          moodValence: updatedMood.valence,
          moodArousal: updatedMood.arousal,
          moodDominance: updatedMood.dominance,
          lastUpdated: new Date(),
        },
      });

      // ============================================
      // FASE 4: MEMORY RETRIEVAL
      // ============================================
      console.log("[Phase 4] 🧠 Memory Retrieval...");
      const memoryResult = await this.memorySystem.retrieveRelevantMemories({
        query: userMessage,
        agentId,
        emotionalContext: updatedEmotions,
        limit: 3,
        minImportance: 0.3,
        preferredValence: updatedMood.valence,
      });

      // ============================================
      // FASE 5: INTERNAL REASONING
      // ============================================
      console.log("[Phase 5] 🤔 Internal Reasoning...");
      const internalReasoning = await this.reasoningEngine.generateReasoning({
        userMessage,
        characterState,
        appraisal,
        currentEmotions: updatedEmotions,
        relevantMemories: memoryResult.memories,
      });

      // ============================================
      // FASE 6: ACTION DECISION
      // ============================================
      console.log("[Phase 6] 🎯 Action Decision...");
      const actionDecision = await this.actionDecision.decideAction({
        internalReasoning,
        currentEmotions: updatedEmotions,
        personality: characterState.personalityCore.bigFive,
        appraisal,
        activeGoals: characterState.internalState.goals,
      });

      // ============================================
      // FASE 7: RESPONSE GENERATION
      // ============================================
      console.log("[Phase 7] 💬 Response Generation...");
      const response = await this.responseGenerator.generateResponse({
        userMessage,
        characterState: {
          ...characterState,
          internalState: {
            ...characterState.internalState,
            emotions: updatedEmotions,
            moodValence: updatedMood.valence,
            moodArousal: updatedMood.arousal,
            moodDominance: updatedMood.dominance,
          },
        },
        appraisal,
        newEmotions: updatedEmotions,
        relevantMemories: memoryResult.memories,
        internalReasoning,
        actionDecision,
        behavioralCues: {
          tone: "",
          verbosity: "moderate",
          directness: "moderate",
          pacing: "normal",
        }, // Se genera dentro del ResponseGenerator
      });

      // ============================================
      // FASE 8: MEMORY STORAGE (INTELLIGENT)
      // ============================================
      console.log("[Phase 8] 💾 Memory Storage...");

      // Obtener decisión de storage del ResponseGenerator
      const storageDecision = this.responseGenerator.lastStorageDecision;

      if (storageDecision?.shouldStore) {
        console.log(`[Phase 8] ✅ Storing memory (score: ${storageDecision.finalScore})`);

        // Guardar memoria episódica
        await this.memorySystem.storeMemory({
          agentId,
          event: response.newMemory.event!,
          userEmotion: response.newMemory.userEmotion,
          characterEmotion: response.newMemory.characterEmotion,
          emotionalValence: response.newMemory.emotionalValence!,
          importance: response.newMemory.importance!,
          metadata: response.newMemory.metadata,
        });

        // Persistir entidades detectadas (eventos, personas)
        if (storageDecision.detectedEntities) {
          console.log("[Phase 8] 📝 Persisting detected entities...");
          await intelligentStorageSystem.persistDetectedEntities({
            agentId,
            userId: params.userId,
            detectedEntities: storageDecision.detectedEntities,
          });
        }
      } else {
        console.log(
          `[Phase 8] ⏭️  Skipping memory storage (score: ${storageDecision?.finalScore || 0} < threshold)`
        );
      }

      // ============================================
      // FASE 9: CHARACTER GROWTH (Async)
      // ============================================
      console.log("[Phase 9] 🌱 Character Growth (async)...");
      this.growthSystem
        .updateGrowth({
          agentId,
          appraisal,
          emotions: updatedEmotions,
          actionType: actionDecision.action,
          wasPositiveInteraction: appraisal.desirability > 0.3,
        })
        .catch((error) => console.error("[OrchestRator] Growth update failed:", error));

      this.growthSystem
        .updateRelationshipStage(agentId)
        .catch((error) => console.error("[Orchestrator] Relationship stage update failed:", error));

      const totalTime = Date.now() - startTime;

      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`✅ Processing Complete in ${totalTime}ms`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

      return response;
    } catch (error) {
      console.error("\n❌ ERROR in Emotional System:", error);
      throw error;
    }
  }

  /**
   * Carga el estado completo del personaje desde la BD
   */
  private async loadCharacterState(agentId: string): Promise<CompleteCharacterState> {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        personalityCore: true,
        internalState: true,
        episodicMemories: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        semanticMemory: true,
        proceduralMemory: true,
        characterGrowth: true,
      },
    });

    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (!agent.personalityCore || !agent.internalState) {
      throw new Error(`Agent ${agentId} missing emotional system components`);
    }

    // Construir working memory desde conversation buffer
    const conversationBuffer = agent.internalState.conversationBuffer as any[];

    return {
      agentId: agent.id,
      personalityCore: {
        bigFive: {
          openness: agent.personalityCore.openness,
          conscientiousness: agent.personalityCore.conscientiousness,
          extraversion: agent.personalityCore.extraversion,
          agreeableness: agent.personalityCore.agreeableness,
          neuroticism: agent.personalityCore.neuroticism,
        },
        coreValues: agent.personalityCore.coreValues as any[],
        moralSchemas: agent.personalityCore.moralSchemas as any[],
        backstory: agent.personalityCore.backstory || undefined,
        baselineEmotions: agent.personalityCore.baselineEmotions as any,
      },
      internalState: {
        emotions: agent.internalState.currentEmotions as any,
        currentEmotions: agent.internalState.currentEmotions as any,
        mood: {
          valence: agent.internalState.moodValence,
          arousal: agent.internalState.moodArousal,
          dominance: agent.internalState.moodDominance,
        },
        emotionDynamics: {
          decayRate: agent.internalState.emotionDecayRate,
          inertia: agent.internalState.emotionInertia,
        },
        needs: {
          connection: agent.internalState.needConnection,
          autonomy: agent.internalState.needAutonomy,
          competence: agent.internalState.needCompetence,
          novelty: agent.internalState.needNovelty,
        },
        goals: agent.internalState.activeGoals as any[],
        conversationBuffer: conversationBuffer || [],
        lastUpdated: agent.internalState.lastUpdated,
        moodValence: agent.internalState.moodValence,
        moodArousal: agent.internalState.moodArousal,
        moodDominance: agent.internalState.moodDominance,
        emotionDecayRate: agent.internalState.emotionDecayRate,
        emotionInertia: agent.internalState.emotionInertia,
        needConnection: agent.internalState.needConnection,
        needAutonomy: agent.internalState.needAutonomy,
        needCompetence: agent.internalState.needCompetence,
        needNovelty: agent.internalState.needNovelty,
        activeGoals: agent.internalState.activeGoals as any[],
      },
      workingMemory: {
        conversationBuffer: conversationBuffer || [],
        activeGoals: agent.internalState.activeGoals as any[],
        currentContext: "Conversación actual",
      },
      episodicMemories: agent.episodicMemories as any[],
      semanticMemory: {
        userFacts: agent.semanticMemory?.userFacts as any || {},
        userPreferences: agent.semanticMemory?.userPreferences as any || {},
        relationshipStage: (agent.semanticMemory?.relationshipStage as any) || "first_meeting",
      },
      proceduralMemory: {
        behavioralPatterns: agent.proceduralMemory?.behavioralPatterns as any || {},
        userTriggers: agent.proceduralMemory?.userTriggers as any || {},
        effectiveStrategies: agent.proceduralMemory?.effectiveStrategies as any || {},
      },
      characterGrowth: {
        relationshipDynamics: {
          trustLevel: agent.characterGrowth?.trustLevel || 0.4,
          intimacyLevel: agent.characterGrowth?.intimacyLevel || 0.3,
          positiveEventsCount: agent.characterGrowth?.positiveEventsCount || 0,
          negativeEventsCount: agent.characterGrowth?.negativeEventsCount || 0,
          conflictHistory: (agent.characterGrowth?.conflictHistory as any[]) || [],
        },
        personalityDrift: agent.characterGrowth?.personalityDrift as any,
        learnedUserPatterns: agent.characterGrowth?.learnedUserPatterns as any,
        conversationCount: agent.characterGrowth?.conversationCount || 0,
        lastSignificantEvent: agent.characterGrowth?.lastSignificantEvent || undefined,
      },
    };
  }
}

/**
 * Singleton del orchestrator
 */
let orchestrator: EmotionalSystemOrchestrator | null = null;

export function getEmotionalSystemOrchestrator(): EmotionalSystemOrchestrator {
  if (!orchestrator) {
    orchestrator = new EmotionalSystemOrchestrator();
    console.log("[EmotionalSystem] Orchestrator initialized");
  }
  return orchestrator;
}
