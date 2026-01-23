/**
 * HYBRID EMOTIONAL ORCHESTRATOR
 *
 * Sistema híbrido inteligente que combina:
 * - Sistema Plutchik (rule-based, rápido, con dyads)
 * - Sistema OCC Orchestrator (LLM-based, context-aware, profundo)
 *
 * Routing automático:
 * - FAST PATH: Mensajes simples → Plutchik rule-based (50ms, $0)
 * - DEEP PATH: Mensajes complejos → OCC + Plutchik mapping (2500ms, $0.007)
 *
 * Resultado unificado: Estado Plutchik con 8 primarias + 20 dyads
 */

import { PlutchikEmotionState } from "@/lib/emotions/plutchik";
import { analyzeMessageEmotions, applyEmotionDeltas } from "@/lib/emotions/system";
import { ComplexityAnalyzer } from "./complexity-analyzer";
import { OCCToPlutchikMapper } from "./occ-to-plutchik-mapper";
import { DyadCalculator, DyadResult } from "./modules/emotion/dyad-calculator";
import { EmotionalSystemOrchestrator } from "./orchestrator";
import { ResponseGenerationOutput } from "./types";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export interface HybridProcessingResult {
  // Estado emocional unificado (Plutchik)
  emotionState: PlutchikEmotionState;

  // Dyads activos (emociones secundarias)
  activeDyads: DyadResult[];

  // Metadata de procesamiento
  metadata: {
    path: "fast" | "deep";
    processingTimeMs: number;
    costEstimate: number; // USD
    complexityScore: number;
    emotionsTriggered: string[];
    primaryEmotion: string;
    dominantDyad: string | null;
    emotionalStability: number;
  };

  // Response (solo si es deep path con full orchestration)
  response?: ResponseGenerationOutput;
}

export class HybridEmotionalOrchestrator {
  private complexityAnalyzer: ComplexityAnalyzer;
  private occMapper: OCCToPlutchikMapper;
  private dyadCalculator: DyadCalculator;
  private deepOrchestrator: EmotionalSystemOrchestrator;

  constructor() {
    this.complexityAnalyzer = new ComplexityAnalyzer();
    this.occMapper = new OCCToPlutchikMapper();
    this.dyadCalculator = new DyadCalculator();
    this.deepOrchestrator = new EmotionalSystemOrchestrator();
  }

  /**
   * Procesa un mensaje con routing automático
   */
  async processMessage(params: {
    agentId: string;
    userMessage: string;
    userId: string;
    generateResponse?: boolean; // Si false, solo procesa emociones
  }): Promise<HybridProcessingResult> {
    const { agentId, userMessage, generateResponse = true } = params;
    const startTime = Date.now();

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔀 HYBRID EMOTIONAL SYSTEM");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // 1. COMPLEXITY ANALYSIS
    console.log("[Hybrid] 🔍 Analyzing message complexity...");
    const complexityAnalysis = this.complexityAnalyzer.analyze(userMessage);

    console.log(`[Hybrid] Complexity: ${complexityAnalysis.complexity} (score: ${complexityAnalysis.score.toFixed(2)})`);
    console.log(`[Hybrid] Recommended path: ${complexityAnalysis.recommendedPath}`);
    console.log(`[Hybrid] Reasons: ${complexityAnalysis.reasons.join(", ")}`);

    // 2. ROUTING
    if (complexityAnalysis.recommendedPath === "fast") {
      // ===== FAST PATH: Plutchik Rule-Based =====
      return await this.processFastPath(agentId, userMessage, startTime, complexityAnalysis.score);
    } else {
      // ===== DEEP PATH: OCC Orchestrator + Plutchik Mapping =====
      return await this.processDeepPath(agentId, userMessage, params.userId, startTime, complexityAnalysis.score, generateResponse);
    }
  }

  /**
   * FAST PATH: Procesamiento rápido con Plutchik rule-based
   */
  private async processFastPath(
    agentId: string,
    userMessage: string,
    startTime: number,
    complexityScore: number
  ): Promise<HybridProcessingResult> {
    console.log("\n[Hybrid] ⚡ FAST PATH: Plutchik rule-based");
    console.log("━".repeat(50));

    // 1. Obtener estado emocional actual
    let internalState = await prisma.internalState.findUnique({
      where: { agentId },
    });

    if (!internalState) {
      // Crear estado neutral si no existe
      const { createNeutralState } = await import("@/lib/emotions");
      const neutralState = createNeutralState();

      internalState = await prisma.internalState.create({
        data: {
          id: nanoid(),
          agentId,
          currentEmotions: neutralState as any,
          moodValence: 0.0,
          moodArousal: 0.5,
          moodDominance: 0.5,
          activeGoals: [],
          conversationBuffer: [],
        },
      });
    }

    // 2. Parsear emociones actuales
    const emotionsFromDB = internalState.currentEmotions as any;
    const currentEmotions: PlutchikEmotionState = {
      joy: typeof emotionsFromDB?.joy === "number" ? emotionsFromDB.joy : 0.5,
      trust: typeof emotionsFromDB?.trust === "number" ? emotionsFromDB.trust : 0.5,
      fear: typeof emotionsFromDB?.fear === "number" ? emotionsFromDB.fear : 0.2,
      surprise: typeof emotionsFromDB?.surprise === "number" ? emotionsFromDB.surprise : 0.1,
      sadness: typeof emotionsFromDB?.sadness === "number" ? emotionsFromDB.sadness : 0.2,
      disgust: typeof emotionsFromDB?.disgust === "number" ? emotionsFromDB.disgust : 0.1,
      anger: typeof emotionsFromDB?.anger === "number" ? emotionsFromDB.anger : 0.1,
      anticipation: typeof emotionsFromDB?.anticipation === "number" ? emotionsFromDB.anticipation : 0.4,
      lastUpdated: new Date(),
    };

    // 3. Analizar mensaje y generar deltas emocionales (Plutchik rule-based)
    console.log("[Hybrid] 💚 Generating emotion deltas...");
    const emotionDeltas = analyzeMessageEmotions(userMessage);

    // 4. Aplicar deltas con decay e inertia
    console.log("[Hybrid] ⏱️  Applying decay and inertia...");
    const newEmotionState = applyEmotionDeltas(
      currentEmotions,
      emotionDeltas,
      internalState.emotionDecayRate,
      internalState.emotionInertia
    );

    // 5. Calcular dyads (emociones secundarias)
    console.log("[Hybrid] 🔗 Calculating dyads...");
    const activeDyads = this.dyadCalculator.calculateDyads(newEmotionState);

    console.log(`[Hybrid] ✅ ${activeDyads.length} dyads activos`);
    if (activeDyads.length > 0) {
      activeDyads.slice(0, 3).forEach((dyad) => {
        console.log(`  - ${dyad.label}: ${(dyad.intensity * 100).toFixed(0)}%`);
      });
    }

    // 6. Actualizar InternalState en DB
    const { emotionStateToPAD } = await import("@/lib/emotions/system");
    const pad = emotionStateToPAD(newEmotionState);

    await prisma.internalState.update({
      where: { agentId },
      data: {
        currentEmotions: newEmotionState as any,
        moodValence: pad.valence,
        moodArousal: pad.arousal,
        moodDominance: pad.dominance,
        lastUpdated: new Date(),
      },
    });

    // 7. Metadata
    const processingTime = Date.now() - startTime;
    const emotionsTriggered = Object.entries(newEmotionState)
      .filter(([key, value]) => key !== "lastUpdated" && typeof value === "number" && value > 0.5)
      .map(([key]) => key)
      .slice(0, 3);

    const primaryEmotion = this.getPrimaryEmotion(newEmotionState);
    const dominantDyad = activeDyads.length > 0 ? activeDyads[0].label : null;
    const emotionalStability = this.dyadCalculator.calculateEmotionalStability(newEmotionState);

    console.log(`\n[Hybrid] ⚡ Fast path completed in ${processingTime}ms`);
    console.log(`[Hybrid] Cost: $0 (rule-based)`);

    return {
      emotionState: newEmotionState,
      activeDyads,
      metadata: {
        path: "fast",
        processingTimeMs: processingTime,
        costEstimate: 0,
        complexityScore,
        emotionsTriggered,
        primaryEmotion,
        dominantDyad,
        emotionalStability,
      },
    };
  }

  /**
   * DEEP PATH: Procesamiento profundo con OCC Orchestrator
   */
  private async processDeepPath(
    agentId: string,
    userMessage: string,
    userId: string,
    startTime: number,
    complexityScore: number,
    generateResponse: boolean
  ): Promise<HybridProcessingResult> {
    console.log("\n[Hybrid] 🧠 DEEP PATH: OCC Orchestrator + Plutchik mapping");
    console.log("━".repeat(50));

    // 1. Procesar con Orchestrator completo (9 fases)
    console.log("[Hybrid] 🔮 Running full emotional orchestration...");
    const orchestratorResult = await this.deepOrchestrator.processMessage({
      agentId,
      userMessage,
      userId,
    });

    // 2. Mapear emociones OCC a Plutchik
    console.log("[Hybrid] 🗺️  Mapping OCC emotions to Plutchik...");

    // Las emociones están en updatedState.currentEmotions (que es JsonValue)
    // Necesitamos convertirlo a EmotionState
    const currentEmotions = (orchestratorResult.updatedState.currentEmotions as any) || {};
    const plutchikState = this.occMapper.mapOCCToPlutchik(currentEmotions);

    // 3. Calcular dyads desde Plutchik state
    console.log("[Hybrid] 🔗 Calculating dyads...");
    const activeDyads = this.dyadCalculator.calculateDyads(plutchikState);

    console.log(`[Hybrid] ✅ ${activeDyads.length} dyads activos`);
    if (activeDyads.length > 0) {
      activeDyads.slice(0, 3).forEach((dyad) => {
        console.log(`  - ${dyad.label}: ${(dyad.intensity * 100).toFixed(0)}%`);
      });
    }

    // 4. Actualizar InternalState con Plutchik state unificado
    const { emotionStateToPAD } = await import("@/lib/emotions/system");
    const pad = emotionStateToPAD(plutchikState);

    await prisma.internalState.update({
      where: { agentId },
      data: {
        currentEmotions: plutchikState as any,
        moodValence: pad.valence,
        moodArousal: pad.arousal,
        moodDominance: pad.dominance,
        lastUpdated: new Date(),
      },
    });

    // 5. Metadata
    const processingTime = Date.now() - startTime;
    const costEstimate = 0.007; // Aprox: 5 LLM calls × ~500 tokens promedio × $2.50/M

    const emotionsTriggered = Object.entries(plutchikState)
      .filter(([key, value]) => key !== "lastUpdated" && typeof value === "number" && value > 0.5)
      .map(([key]) => key)
      .slice(0, 3);

    const primaryEmotion = this.getPrimaryEmotion(plutchikState);
    const dominantDyad = activeDyads.length > 0 ? activeDyads[0].label : null;
    const emotionalStability = this.dyadCalculator.calculateEmotionalStability(plutchikState);

    console.log(`\n[Hybrid] 🧠 Deep path completed in ${processingTime}ms`);
    console.log(`[Hybrid] Cost: ~$${costEstimate.toFixed(4)}`);

    return {
      emotionState: plutchikState,
      activeDyads,
      metadata: {
        path: "deep",
        processingTimeMs: processingTime,
        costEstimate,
        complexityScore,
        emotionsTriggered,
        primaryEmotion,
        dominantDyad,
        emotionalStability,
      },
      response: generateResponse ? orchestratorResult : undefined,
    };
  }

  /**
   * Helper: Obtiene la emoción primaria más intensa
   */
  private getPrimaryEmotion(state: PlutchikEmotionState): string {
    const emotions = [
      { name: "joy", value: state.joy },
      { name: "trust", value: state.trust },
      { name: "fear", value: state.fear },
      { name: "surprise", value: state.surprise },
      { name: "sadness", value: state.sadness },
      { name: "disgust", value: state.disgust },
      { name: "anger", value: state.anger },
      { name: "anticipation", value: state.anticipation },
    ];

    emotions.sort((a, b) => b.value - a.value);
    return emotions[0].name;
  }

  /**
   * Obtiene estadísticas de uso del sistema (para analytics)
   */
  async getUsageStats(agentId: string, period: "day" | "week" | "month" = "day"): Promise<{
    totalMessages: number;
    fastPathCount: number;
    deepPathCount: number;
    fastPathPercentage: number;
    deepPathPercentage: number;
    averageProcessingTime: number;
    totalCostEstimate: number;
    costSavedVsAlwaysDeep: number;
  }> {
    // TODO: Implementar analytics tracking
    // Por ahora retornar mock data
    return {
      totalMessages: 100,
      fastPathCount: 80,
      deepPathCount: 20,
      fastPathPercentage: 80,
      deepPathPercentage: 20,
      averageProcessingTime: 440, // 80% × 50ms + 20% × 2500ms
      totalCostEstimate: 0.14, // 20 × $0.007
      costSavedVsAlwaysDeep: 0.56, // (100 × $0.007) - $0.14
    };
  }
}

/**
 * Singleton instance
 */
export const hybridEmotionalOrchestrator = new HybridEmotionalOrchestrator();

/**
 * Helper function para uso simple
 */
export async function processMessageHybrid(
  agentId: string,
  userMessage: string,
  userId: string
): Promise<HybridProcessingResult> {
  return hybridEmotionalOrchestrator.processMessage({
    agentId,
    userMessage,
    userId,
  });
}
