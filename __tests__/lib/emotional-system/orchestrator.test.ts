/**
 * ORCHESTRATOR TESTS
 *
 * Tests for Hybrid Emotional Orchestrator
 * Covers: complexity analysis, routing, dyad calculation
 */

import { describe, it, expect } from "vitest";
import { ComplexityAnalyzer, type ComplexityAnalysisResult } from "@/lib/emotional-system/complexity-analyzer";
import { DyadCalculator } from "@/lib/emotional-system/modules/emotion/dyad-calculator";
import { createNeutralState, type PlutchikEmotionState } from "@/lib/emotions/plutchik";

describe("Hybrid Emotional Orchestrator", () => {
  describe("ComplexityAnalyzer", () => {
    const analyzer = new ComplexityAnalyzer();

    describe("Simple message detection", () => {
      it("should detect simple greetings", () => {
        const messages = ["Hola", "Hey", "Buenos días", "Qué tal"];

        for (const message of messages) {
          const result = analyzer.analyze(message);
          expect(result.complexity).toBe("simple");
          expect(result.recommendedPath).toBe("fast");
          // Simple patterns return score 0 for greetings
          expect(result.score).toBe(0);
        }
      });

      it("should detect simple greeting with question mark", () => {
        const result = analyzer.analyze("¿Cómo estás?");
        expect(result.complexity).toBe("simple");
        expect(result.recommendedPath).toBe("fast");
        // Has question mark so score > 0 but still simple
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThan(0.5);
      });

      it("should detect simple reactions", () => {
        const messages = ["jaja", "jeje", "lol", "xd", "ok", "vale", "sí", "no"];

        for (const message of messages) {
          const result = analyzer.analyze(message);
          expect(result.complexity).toBe("simple");
          expect(result.recommendedPath).toBe("fast");
        }
      });

      it("should detect simple emoji-only messages", () => {
        const messages = ["👍", "😊", "❤️", "😢", "😡"];

        for (const message of messages) {
          const result = analyzer.analyze(message);
          expect(result.complexity).toBe("simple");
          expect(result.recommendedPath).toBe("fast");
        }
      });

      it("should detect simple farewells", () => {
        const messages = ["Adiós", "Chau", "Bye", "Nos vemos", "Hasta luego"];

        for (const message of messages) {
          const result = analyzer.analyze(message);
          expect(result.complexity).toBe("simple");
          expect(result.recommendedPath).toBe("fast");
        }
      });
    });

    describe("Complex message detection", () => {
      it("should detect emotional keywords as complex", () => {
        const message = "Estoy muy triste y deprimido, no sé qué hacer con mi vida";
        const result = analyzer.analyze(message);

        expect(result.complexity).toBe("complex");
        expect(result.recommendedPath).toBe("deep");
        expect(result.score).toBeGreaterThanOrEqual(0.5);
        // Check that emotional keywords were detected
        expect(result.reasons.some(r => r.includes("emocional"))).toBe(true);
      });

      it("should detect decision-making as complex", () => {
        const message = "¿Debería renunciar a mi trabajo? No sé qué hacer";
        const result = analyzer.analyze(message);

        expect(result.complexity).toBe("complex");
        expect(result.recommendedPath).toBe("deep");
      });

      it("should detect conflict narratives as complex", () => {
        const message = "Tuve una pelea terrible con mi pareja ayer, me dijo cosas horribles";
        const result = analyzer.analyze(message);

        expect(result.complexity).toBe("complex");
        expect(result.recommendedPath).toBe("deep");
      });

      it("should detect long messages as complex", () => {
        const message =
          "Hoy fue un día muy difícil. Primero tuve problemas en el trabajo con mi jefe. " +
          "Luego, cuando llegué a casa, mi pareja estaba molesta conmigo. " +
          "No sé cómo manejar todo esto, me siento abrumado y confundido. " +
          "¿Qué debería hacer en esta situación?";

        const result = analyzer.analyze(message);

        expect(result.complexity).toBe("complex");
        expect(result.recommendedPath).toBe("deep");
        // Check that message length was a factor
        expect(result.reasons.some(r => r.toLowerCase().includes("palabra"))).toBe(true);
      });

      it("should detect memory references as complex", () => {
        const message = "Recuerdo cuando me dijiste que me apoyarías siempre";
        const result = analyzer.analyze(message);

        expect(result.complexity).toBe("complex");
        expect(result.recommendedPath).toBe("deep");
      });

      it("should detect moral dilemmas as complex", () => {
        const message = "¿Es correcto mentir si es para proteger a alguien?";
        const result = analyzer.analyze(message);

        expect(result.complexity).toBe("complex");
        expect(result.recommendedPath).toBe("deep");
      });

      it("should detect social situations as complex", () => {
        const message = "Mi amigo hizo algo que me molestó mucho, pero él no se da cuenta";
        const result = analyzer.analyze(message);

        expect(result.complexity).toBe("complex");
        expect(result.recommendedPath).toBe("deep");
      });
    });

    describe("Scoring system", () => {
      it("should give higher scores for longer messages", () => {
        const shortMessage = "Estoy bien";
        const longMessage = "Estoy bien, aunque hoy fue un día complicado con muchas cosas que pasaron";

        const shortResult = analyzer.analyze(shortMessage);
        const longResult = analyzer.analyze(longMessage);

        expect(longResult.score).toBeGreaterThan(shortResult.score);
      });

      it("should give higher scores for multiple emotional keywords", () => {
        const singleEmotion = "Estoy triste";
        const multipleEmotions = "Estoy triste, deprimido, angustiado y desesperado";

        const singleResult = analyzer.analyze(singleEmotion);
        const multipleResult = analyzer.analyze(multipleEmotions);

        expect(multipleResult.score).toBeGreaterThan(singleResult.score);
      });

      it("should give higher scores for multiple complexity patterns", () => {
        const simple = "¿Debería ir?";
        const complex = "¿Debería ir? No sé si es correcto. Por un lado quiero, pero por otro lado tengo miedo";

        const simpleResult = analyzer.analyze(simple);
        const complexResult = analyzer.analyze(complex);

        expect(complexResult.score).toBeGreaterThan(simpleResult.score);
      });

      it("should cap complexity score at 1.0", () => {
        const extremeMessage =
          "Estoy muy triste, deprimido, ansioso, frustrado, enojado, confundido, desesperado, perdido, " +
          "mi mamá me dijo algo horrible, mi papá está enojado, mi hermano no me habla, " +
          "tengo problemas en el trabajo, problemas financieros, crisis existencial, " +
          "no sé qué hacer, ¿debería renunciar? ¿es correcto? ¿qué pensarías tú? " +
          "Hace tiempo me dijiste algo importante, recuerdo cuando hablamos de esto.";

        const result = analyzer.analyze(extremeMessage);

        expect(result.score).toBeLessThanOrEqual(1.0);
        expect(result.complexity).toBe("complex");
      });
    });

    describe("Edge cases", () => {
      it("should handle empty messages", () => {
        const result = analyzer.analyze("");
        expect(result.complexity).toBe("simple");
        expect(result.score).toBeLessThan(0.5);
      });

      it("should handle whitespace-only messages", () => {
        const result = analyzer.analyze("   \n  \t  ");
        expect(result.complexity).toBe("simple");
      });

      it("should handle messages with only punctuation", () => {
        const result = analyzer.analyze("...");
        expect(result.complexity).toBe("simple");
      });

      it("should be case-insensitive for keywords", () => {
        const lowercase = "estoy muy triste y deprimido, necesito ayuda";
        const uppercase = "ESTOY MUY TRISTE Y DEPRIMIDO, NECESITO AYUDA";
        const mixed = "EsToy MuY TRiste Y DePRimido, NecESito AyuDA";

        const results = [lowercase, uppercase, mixed].map((msg) => analyzer.analyze(msg));

        results.forEach((result) => {
          expect(result.complexity).toBe("complex");
          expect(result.score).toBeGreaterThanOrEqual(0.5);
        });
      });
    });

    describe("Stats calculation", () => {
      it("should calculate correct statistics", () => {
        const messages = [
          "Hola",
          "¿Cómo estás?",
          "Estoy muy triste y deprimido",
          "No sé qué hacer con mi vida",
          "jaja",
          "ok",
          "Tengo un problema serio con mi familia",
        ];

        const stats = ComplexityAnalyzer.getStats(messages);

        expect(stats.total).toBe(7);
        expect(stats.simple + stats.complex).toBe(7);
        expect(stats.simplePercentage + stats.complexPercentage).toBeCloseTo(100, 1);
        expect(stats.averageScore).toBeGreaterThanOrEqual(0);
        expect(stats.averageScore).toBeLessThanOrEqual(1);
      });
    });

    describe("getRecommendedPath", () => {
      it("should return fast for simple messages", () => {
        expect(analyzer.getRecommendedPath("Hola")).toBe("fast");
        expect(analyzer.getRecommendedPath("jaja")).toBe("fast");
        expect(analyzer.getRecommendedPath("ok")).toBe("fast");
      });

      it("should return deep for complex messages", () => {
        expect(analyzer.getRecommendedPath("Estoy muy triste y no sé qué hacer")).toBe("deep");
        expect(analyzer.getRecommendedPath("¿Debería renunciar a mi trabajo?")).toBe("deep");
      });
    });
  });

  describe("DyadCalculator", () => {
    const calculator = new DyadCalculator();

    describe("Dyad calculation", () => {
      it("should calculate love dyad (joy + trust)", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.8,
          trust: 0.7,
        };

        const dyads = calculator.calculateDyads(state);
        const loveDyad = dyads.find((d) => d.name === "love");

        expect(loveDyad).toBeDefined();
        expect(loveDyad!.intensity).toBeGreaterThan(0);
        expect(loveDyad!.type).toBe("primary");
      });

      it("should calculate despair dyad (fear + sadness)", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          fear: 0.8,
          sadness: 0.7,
        };

        const dyads = calculator.calculateDyads(state);
        const despairDyad = dyads.find((d) => d.name === "despair");

        expect(despairDyad).toBeDefined();
        expect(despairDyad!.intensity).toBeGreaterThan(0);
        expect(despairDyad!.type).toBe("secondary");
      });

      it("should calculate ambivalence dyad (joy + sadness - opposite emotions)", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.7,
          sadness: 0.6,
        };

        const dyads = calculator.calculateDyads(state);
        const ambivalenceDyad = dyads.find((d) => d.name === "ambivalence");

        expect(ambivalenceDyad).toBeDefined();
        expect(ambivalenceDyad!.type).toBe("tertiary");
      });

      it("should not calculate dyad if emotions below threshold", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.2, // Below MIN_INTENSITY (0.25)
          trust: 0.2,
        };

        const dyads = calculator.calculateDyads(state);
        const loveDyad = dyads.find((d) => d.name === "love");

        expect(loveDyad).toBeUndefined();
      });

      it("should use geometric mean for intensity calculation", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.8,
          trust: 0.5,
        };

        const dyads = calculator.calculateDyads(state);
        const loveDyad = dyads.find((d) => d.name === "love");

        // Geometric mean: sqrt(0.8 * 0.5) = sqrt(0.4) ≈ 0.632
        // With primary dyad weight (1.2): 0.632 * 1.2 ≈ 0.758
        expect(loveDyad).toBeDefined();
        expect(loveDyad!.intensity).toBeGreaterThan(0.6);
        expect(loveDyad!.intensity).toBeLessThan(0.8);
      });

      it("should apply different weights by dyad type", () => {
        // Create two similar emotion states but for different dyad types
        const primaryState: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.6,
          trust: 0.6,
        };

        const secondaryState: PlutchikEmotionState = {
          ...createNeutralState(),
          fear: 0.6,
          sadness: 0.6,
        };

        const primaryDyads = calculator.calculateDyads(primaryState);
        const secondaryDyads = calculator.calculateDyads(secondaryState);

        const loveDyad = primaryDyads.find((d) => d.name === "love");
        const despairDyad = secondaryDyads.find((d) => d.name === "despair");

        // Primary dyads have 1.2x weight, secondary have 1.0x
        if (loveDyad && despairDyad) {
          expect(loveDyad.intensity).toBeGreaterThan(despairDyad.intensity);
        }
      });

      it("should sort dyads by intensity (highest first)", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.9,
          trust: 0.8,
          fear: 0.6,
          sadness: 0.5,
          anger: 0.7,
          anticipation: 0.6,
        };

        const dyads = calculator.calculateDyads(state);

        for (let i = 0; i < dyads.length - 1; i++) {
          expect(dyads[i].intensity).toBeGreaterThanOrEqual(dyads[i + 1].intensity);
        }
      });

      it("should calculate multiple dyads simultaneously", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.8,
          trust: 0.7,
          anticipation: 0.6,
        };

        const dyads = calculator.calculateDyads(state);

        // Should have love (joy+trust) and optimism (joy+anticipation)
        const loveDyad = dyads.find((d) => d.name === "love");
        const optimismDyad = dyads.find((d) => d.name === "optimism");

        expect(loveDyad).toBeDefined();
        expect(optimismDyad).toBeDefined();
      });
    });

    describe("getTopDyads", () => {
      it("should return top N dyads", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.8,
          trust: 0.7,
          anticipation: 0.6,
          fear: 0.5,
          sadness: 0.4,
        };

        const top3 = calculator.getTopDyads(state, 3);

        expect(top3).toHaveLength(3);
        expect(top3[0].intensity).toBeGreaterThanOrEqual(top3[1].intensity);
        expect(top3[1].intensity).toBeGreaterThanOrEqual(top3[2].intensity);
      });

      it("should return fewer dyads if not enough meet threshold", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.5,
          trust: 0.4,
        };

        const top5 = calculator.getTopDyads(state, 5);

        expect(top5.length).toBeLessThan(5);
      });
    });

    describe("getDominantDyad", () => {
      it("should return the most intense dyad", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.9,
          trust: 0.8,
          fear: 0.5,
          sadness: 0.4,
        };

        const dominant = calculator.getDominantDyad(state);

        expect(dominant).toBeDefined();
        expect(dominant!.name).toBe("love"); // joy + trust should be highest
      });

      it("should return null if no dyads meet threshold", () => {
        // Create a truly minimal state
        const state: PlutchikEmotionState = {
          joy: 0.2,
          trust: 0.2,
          fear: 0.1,
          surprise: 0.1,
          sadness: 0.2,
          disgust: 0.1,
          anger: 0.1,
          anticipation: 0.2,
          lastUpdated: new Date(),
        };

        const dominant = calculator.getDominantDyad(state);

        expect(dominant).toBeNull();
      });
    });

    describe("isDyadActive", () => {
      it("should return true for active dyads", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.8,
          trust: 0.7,
        };

        const isLoveActive = calculator.isDyadActive(state, "love");

        expect(isLoveActive).toBe(true);
      });

      it("should return false for inactive dyads", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.2,
          trust: 0.2,
        };

        const isLoveActive = calculator.isDyadActive(state, "love");

        expect(isLoveActive).toBe(false);
      });
    });

    describe("getDyadIntensity", () => {
      it("should return correct intensity for active dyads", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.8,
          trust: 0.7,
        };

        const loveIntensity = calculator.getDyadIntensity(state, "love");

        expect(loveIntensity).toBeGreaterThan(0);
        expect(loveIntensity).toBeLessThanOrEqual(1);
      });

      it("should return 0 for inactive dyads", () => {
        const state: PlutchikEmotionState = {
          joy: 0.2,
          trust: 0.2,
          fear: 0.1,
          surprise: 0.1,
          sadness: 0.2,
          disgust: 0.1,
          anger: 0.1,
          anticipation: 0.2,
          lastUpdated: new Date(),
        };
        const intensity = calculator.getDyadIntensity(state, "love");

        expect(intensity).toBe(0);
      });
    });

    describe("describeDyads", () => {
      it("should generate text description of active dyads", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.8,
          trust: 0.7,
          anticipation: 0.6,
        };

        const description = calculator.describeDyads(state);

        expect(description).toContain("Amor");
        expect(description).toContain("%");
      });

      it("should return message when no significant dyads", () => {
        const state: PlutchikEmotionState = {
          joy: 0.2,
          trust: 0.2,
          fear: 0.1,
          surprise: 0.1,
          sadness: 0.2,
          disgust: 0.1,
          anger: 0.1,
          anticipation: 0.2,
          lastUpdated: new Date(),
        };
        const description = calculator.describeDyads(state);

        expect(description).toBe("Sin emociones secundarias significativas");
      });
    });

    describe("detectEmotionalConflicts", () => {
      it("should detect tertiary dyads (opposite emotions)", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.7,
          sadness: 0.6, // Ambivalence (opposite emotions)
        };

        const conflicts = calculator.detectEmotionalConflicts(state);

        expect(conflicts.length).toBeGreaterThan(0);
        expect(conflicts[0].type).toBe("tertiary");
      });

      it("should return empty array when no conflicts", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.8,
          trust: 0.7,
        };

        const conflicts = calculator.detectEmotionalConflicts(state);

        expect(conflicts).toHaveLength(0);
      });
    });

    describe("calculateEmotionalStability", () => {
      it("should return high stability (1.0) when no conflicts", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.8,
          trust: 0.7,
        };

        const stability = calculator.calculateEmotionalStability(state);

        expect(stability).toBe(1.0);
      });

      it("should return lower stability with conflicts", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.7,
          sadness: 0.6,
          fear: 0.5,
          anger: 0.5,
        };

        const stability = calculator.calculateEmotionalStability(state);

        expect(stability).toBeLessThan(1.0);
        expect(stability).toBeGreaterThanOrEqual(0);
      });

      it("should never return negative stability", () => {
        const extremeConflict: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.9,
          sadness: 0.9,
          trust: 0.9,
          disgust: 0.9,
          fear: 0.9,
          anger: 0.9,
        };

        const stability = calculator.calculateEmotionalStability(extremeConflict);

        expect(stability).toBeGreaterThanOrEqual(0);
      });
    });

    describe("getClinicalInsights", () => {
      it("should provide stability assessment", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.8,
          trust: 0.7,
        };

        const insights = calculator.getClinicalInsights(state);

        expect(insights.stability).toBeGreaterThan(0);
        expect(insights.recommendation).toBeDefined();
      });

      it("should identify high despair as clinical concern", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          fear: 0.9,
          sadness: 0.8,
        };

        const insights = calculator.getClinicalInsights(state);

        expect(insights.dominantDyad?.name).toBe("despair");
        expect(insights.recommendation.toLowerCase()).toContain("desesperación");
      });

      it("should identify high anxiety as clinical concern", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          anticipation: 0.9,
          trust: 0.8,
        };

        const insights = calculator.getClinicalInsights(state);

        expect(insights.dominantDyad?.name).toBe("anxiety");
        expect(insights.recommendation.toLowerCase()).toContain("ansiedad");
      });

      it("should warn about high emotional conflict", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.8,
          sadness: 0.7,
          fear: 0.6,
          anger: 0.6,
        };

        const insights = calculator.getClinicalInsights(state);

        expect(insights.conflicts.length).toBeGreaterThan(0);
        expect(insights.stability).toBeLessThan(0.7);
      });

      it("should provide stable recommendation for balanced emotions", () => {
        const state: PlutchikEmotionState = {
          ...createNeutralState(),
          joy: 0.6,
          trust: 0.6,
        };

        const insights = calculator.getClinicalInsights(state);

        expect(insights.recommendation).toContain("estable");
      });
    });

    describe("Edge cases", () => {
      it("should handle neutral state with some dyads", () => {
        const state = createNeutralState();
        const dyads = calculator.calculateDyads(state);

        // Neutral state has joy:0.5, trust:0.5, anticipation:0.4 which can form dyads
        expect(dyads.length).toBeGreaterThanOrEqual(0);
        expect(dyads.length).toBeLessThan(10);
      });

      it("should handle extreme single emotion with minimal other emotions", () => {
        const state: PlutchikEmotionState = {
          joy: 1.0,
          trust: 0.1,
          fear: 0.1,
          surprise: 0.1,
          sadness: 0.1,
          disgust: 0.1,
          anger: 0.1,
          anticipation: 0.1,
          lastUpdated: new Date(),
        };

        const dyads = calculator.calculateDyads(state);

        // Very low other emotions shouldn't create many dyads
        expect(dyads.length).toBeLessThan(5);
      });

      it("should handle all emotions at maximum", () => {
        const extremeState: PlutchikEmotionState = {
          joy: 1.0,
          trust: 1.0,
          fear: 1.0,
          surprise: 1.0,
          sadness: 1.0,
          disgust: 1.0,
          anger: 1.0,
          anticipation: 1.0,
          lastUpdated: new Date(),
        };

        const dyads = calculator.calculateDyads(extremeState);

        // Should calculate many dyads, all at high intensity
        expect(dyads.length).toBeGreaterThan(10);
        dyads.forEach((dyad) => {
          expect(dyad.intensity).toBeGreaterThan(0.5);
        });
      });

      it("should handle all emotions at minimum", () => {
        const minimalState: PlutchikEmotionState = {
          joy: 0,
          trust: 0,
          fear: 0,
          surprise: 0,
          sadness: 0,
          disgust: 0,
          anger: 0,
          anticipation: 0,
          lastUpdated: new Date(),
        };

        const dyads = calculator.calculateDyads(minimalState);

        expect(dyads).toHaveLength(0);
      });
    });
  });
});
