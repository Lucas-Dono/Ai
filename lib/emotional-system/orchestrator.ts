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
import { nanoid } from "nanoid";
import { AppraisalEngine } from "./modules/appraisal/engine";
import { EmotionGenerator } from "./modules/emotion/generator";
import { EmotionDecaySystem } from "./modules/emotion/decay";
import { MemoryRetrievalSystem } from "./modules/memory/retrieval";
import { InternalReasoningEngine } from "./modules/cognition/reasoning";
import { ActionDecisionEngine } from "./modules/cognition/action-decision";
import { ResponseGenerator } from "./modules/response/generator";
import { CharacterGrowthSystem } from "./modules/growth/character-growth";
import { intelligentStorageSystem } from "./modules/memory/intelligent-storage";
import { normalizeCoreValuesToWeightedArray } from "@/lib/psychological-analysis/corevalues-normalizer";

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
        PersonalityCore: true,
        InternalState: true,
        EpisodicMemory: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        SemanticMemory: true,
        ProceduralMemory: true,
        CharacterGrowth: true,
      },
    });

    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    // If agent is missing emotional system components (e.g., system/public agents),
    // create them with default values
    if (!agent.PersonalityCore) {
      console.log(`[Orchestrator] Creating default personalityCore for agent ${agentId}`);
      agent.PersonalityCore = await prisma.personalityCore.create({
        data: {
          id: nanoid(),
          updatedAt: new Date(),
          agentId,
          openness: 0.5,
          conscientiousness: 0.5,
          extraversion: 0.5,
          agreeableness: 0.7,
          neuroticism: 0.3,
          coreValues: ["helpfulness", "honesty", "kindness"],
          moralSchemas: [],
          baselineEmotions: {
            joy: 0.5,
            fear: 0.1,
            sadness: 0.1,
            anger: 0.1,
            disliking: 0.1,
            interest: 0.4,
          },
        },
      });
    }

    if (!agent.InternalState) {
      console.log(`[Orchestrator] Creating default internalState for agent ${agentId}`);
      agent.InternalState = await prisma.internalState.create({
        data: {
          id: nanoid(),
          agentId,
          currentEmotions: {
            joy: 0.5,
            fear: 0.1,
            sadness: 0.1,
            anger: 0.1,
            disliking: 0.1,
            interest: 0.4,
          },
          moodValence: 0.0,
          moodArousal: 0.5,
          moodDominance: 0.5,
          emotionDecayRate: 0.1,
          emotionInertia: 0.3,
          needConnection: 0.5,
          needAutonomy: 0.5,
          needCompetence: 0.5,
          needNovelty: 0.5,
          conversationBuffer: [],
          activeGoals: [],
        },
      });
    }

    // Construir working memory desde conversation buffer
    const conversationBuffer = agent.InternalState.conversationBuffer as any[];

    return {
      agentId: agent.id,
      personalityCore: {
        bigFive: {
          openness: agent.PersonalityCore.openness,
          conscientiousness: agent.PersonalityCore.conscientiousness,
          extraversion: agent.PersonalityCore.extraversion,
          agreeableness: agent.PersonalityCore.agreeableness,
          neuroticism: agent.PersonalityCore.neuroticism,
        },
        coreValues: normalizeCoreValuesToWeightedArray(agent.PersonalityCore.coreValues),
        moralSchemas: agent.PersonalityCore.moralSchemas as any[],
        backstory: agent.PersonalityCore.backstory || undefined,
        baselineEmotions: agent.PersonalityCore.baselineEmotions as any,
      },
      internalState: {
        emotions: agent.InternalState.currentEmotions as any,
        currentEmotions: agent.InternalState.currentEmotions as any,
        mood: {
          valence: agent.InternalState.moodValence,
          arousal: agent.InternalState.moodArousal,
          dominance: agent.InternalState.moodDominance,
        },
        emotionDynamics: {
          decayRate: agent.InternalState.emotionDecayRate,
          inertia: agent.InternalState.emotionInertia,
        },
        needs: {
          connection: agent.InternalState.needConnection,
          autonomy: agent.InternalState.needAutonomy,
          competence: agent.InternalState.needCompetence,
          novelty: agent.InternalState.needNovelty,
        },
        goals: agent.InternalState.activeGoals as any[],
        conversationBuffer: conversationBuffer || [],
        lastUpdated: agent.InternalState.lastUpdated,
        moodValence: agent.InternalState.moodValence,
        moodArousal: agent.InternalState.moodArousal,
        moodDominance: agent.InternalState.moodDominance,
        emotionDecayRate: agent.InternalState.emotionDecayRate,
        emotionInertia: agent.InternalState.emotionInertia,
        needConnection: agent.InternalState.needConnection,
        needAutonomy: agent.InternalState.needAutonomy,
        needCompetence: agent.InternalState.needCompetence,
        needNovelty: agent.InternalState.needNovelty,
        activeGoals: agent.InternalState.activeGoals as any[],
      },
      workingMemory: {
        conversationBuffer: conversationBuffer || [],
        activeGoals: agent.InternalState.activeGoals as any[],
        currentContext: "Conversación actual",
      },
      episodicMemories: agent.EpisodicMemory as any[],
      semanticMemory: {
        userFacts: agent.SemanticMemory?.userFacts as any || {},
        userPreferences: agent.SemanticMemory?.userPreferences as any || {},
        relationshipStage: (agent.SemanticMemory?.relationshipStage as any) || "first_meeting",
      },
      proceduralMemory: {
        behavioralPatterns: agent.ProceduralMemory?.behavioralPatterns as any || {},
        userTriggers: agent.ProceduralMemory?.userTriggers as any || {},
        effectiveStrategies: agent.ProceduralMemory?.effectiveStrategies as any || {},
      },
      characterGrowth: {
        relationshipDynamics: {
          trustLevel: agent.CharacterGrowth?.trustLevel || 0.4,
          intimacyLevel: agent.CharacterGrowth?.intimacyLevel || 0.3,
          positiveEventsCount: agent.CharacterGrowth?.positiveEventsCount || 0,
          negativeEventsCount: agent.CharacterGrowth?.negativeEventsCount || 0,
          conflictHistory: (agent.CharacterGrowth?.conflictHistory as any[]) || [],
        },
        personalityDrift: agent.CharacterGrowth?.personalityDrift as any,
        learnedUserPatterns: agent.CharacterGrowth?.learnedUserPatterns as any,
        conversationCount: agent.CharacterGrowth?.conversationCount || 0,
        lastSignificantEvent: agent.CharacterGrowth?.lastSignificantEvent || undefined,
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
