/**
 * EMOTION ENGINE TESTS
 *
 * Tests for Plutchik-based emotion system (Fast Path)
 * Covers: emotion analysis, state management, PAD model conversion
 */

import { describe, it, expect } from "vitest";
import {
  analyzeMessageEmotions,
  applyEmotionDeltas,
  emotionStateToPAD,
  getEmotionalSummary,
} from "@/lib/emotions/system";
import {
  createNeutralState,
  getDominantEmotions,
  getOppositeEmotion,
  calculateSecondaryEmotion,
  type PlutchikEmotionState,
  type PrimaryEmotion,
} from "@/lib/emotions/plutchik";

describe("Emotion Engine", () => {
  describe("analyzeMessageEmotions", () => {
    it("should detect joy keywords", () => {
      const message = "Estoy muy feliz y alegre hoy";
      const deltas = analyzeMessageEmotions(message);

      expect(deltas.joy).toBeGreaterThan(0);
      expect(deltas.sadness).toBeLessThan(0); // Opposite emotion reduced
    });

    it("should detect sadness keywords", () => {
      const message = "Me siento muy triste y deprimido";
      const deltas = analyzeMessageEmotions(message);

      expect(deltas.sadness).toBeGreaterThan(0);
      expect(deltas.joy).toBeLessThan(0); // Opposite emotion reduced
    });

    it("should detect fear keywords", () => {
      const message = "Tengo mucho miedo y estoy muy nervioso";
      const deltas = analyzeMessageEmotions(message);

      expect(deltas.fear).toBeGreaterThan(0);
      expect(deltas.anger).toBeLessThan(0); // Opposite emotion reduced
    });

    it("should detect anger keywords", () => {
      const message = "Estoy muy enojado y frustrado con esto";
      const deltas = analyzeMessageEmotions(message);

      expect(deltas.anger).toBeGreaterThan(0);
      expect(deltas.fear).toBeLessThan(0); // Opposite emotion reduced
    });

    it("should detect trust keywords", () => {
      const message = "Confío en ti, eres muy honesto y sincero";
      const deltas = analyzeMessageEmotions(message);

      expect(deltas.trust).toBeGreaterThan(0);
      expect(deltas.disgust).toBeLessThan(0); // Opposite emotion reduced
    });

    it("should detect disgust keywords", () => {
      const message = "Esto es asqueroso y me da mucho asco";
      const deltas = analyzeMessageEmotions(message);

      expect(deltas.disgust).toBeGreaterThan(0);
      expect(deltas.trust).toBeLessThan(0); // Opposite emotion reduced
    });

    it("should detect surprise keywords", () => {
      const message = "Wow, qué sorpresa inesperada, no lo esperaba";
      const deltas = analyzeMessageEmotions(message);

      expect(deltas.surprise).toBeGreaterThan(0);
      expect(deltas.anticipation).toBeLessThan(0); // Opposite emotion reduced
    });

    it("should detect anticipation keywords", () => {
      const message = "Estoy esperando con ansias el futuro";
      const deltas = analyzeMessageEmotions(message);

      expect(deltas.anticipation).toBeGreaterThan(0);
    });

    it("should detect questions (increase surprise and trust)", () => {
      const message = "¿Cómo estás? ¿Qué piensas de esto?";
      const deltas = analyzeMessageEmotions(message);

      expect(deltas.surprise).toBeGreaterThan(0);
      expect(deltas.trust).toBeGreaterThan(0);
    });

    it("should detect exclamations (increase joy)", () => {
      const message = "¡Esto es genial!! ¡Increíble!!";
      const deltas = analyzeMessageEmotions(message);

      expect(deltas.joy).toBeGreaterThan(0);
    });

    it("should handle neutral messages with baseline increases", () => {
      const message = "Hola, ¿cómo estás?";
      const deltas = analyzeMessageEmotions(message);

      // Baseline increases
      expect(deltas.joy).toBeGreaterThanOrEqual(0.02);
      expect(deltas.trust).toBeGreaterThanOrEqual(0.02);
    });

    it("should handle multiple emotions in one message", () => {
      const message = "Estoy feliz pero también un poco triste";
      const deltas = analyzeMessageEmotions(message);

      expect(deltas.joy).toBeGreaterThan(0);
      expect(deltas.sadness).toBeGreaterThan(0);
    });

    it("should handle emoji detection", () => {
      const message = "Me siento así 😢😭💔";
      const deltas = analyzeMessageEmotions(message);

      expect(deltas.sadness).toBeGreaterThan(0);
    });
  });

  describe("applyEmotionDeltas", () => {
    it("should apply positive deltas correctly", () => {
      const currentState = createNeutralState();
      const deltas = { joy: 0.2 };

      const newState = applyEmotionDeltas(currentState, deltas, 0.05, 0.3);

      expect(newState.joy).toBeGreaterThan(currentState.joy);
    });

    it("should apply negative deltas correctly", () => {
      const currentState = createNeutralState();
      const deltas = { sadness: -0.1 };

      const newState = applyEmotionDeltas(currentState, deltas, 0.05, 0.3);

      expect(newState.sadness).toBeLessThan(currentState.sadness);
    });

    it("should apply decay towards neutral (0.5)", () => {
      const currentState: PlutchikEmotionState = {
        ...createNeutralState(),
        joy: 0.9, // High value
      };

      const newState = applyEmotionDeltas(currentState, {}, 0.1, 0.0);

      expect(newState.joy).toBeLessThan(currentState.joy);
      expect(newState.joy).toBeGreaterThan(0.5);
    });

    it("should apply inertia (resistance to change)", () => {
      const currentState = createNeutralState();
      const deltas = { joy: 0.4 };

      // High inertia (0.8) should reduce the delta effect
      const newStateHighInertia = applyEmotionDeltas(currentState, deltas, 0.05, 0.8);

      // Low inertia (0.1) should allow more change
      const newStateLowInertia = applyEmotionDeltas(currentState, deltas, 0.05, 0.1);

      expect(newStateLowInertia.joy).toBeGreaterThan(newStateHighInertia.joy);
    });

    it("should clamp values between 0 and 1", () => {
      const currentState = createNeutralState();
      const deltas = { joy: 5.0 }; // Extreme delta

      const newState = applyEmotionDeltas(currentState, deltas, 0.05, 0.0);

      expect(newState.joy).toBeLessThanOrEqual(1.0);
      expect(newState.joy).toBeGreaterThanOrEqual(0.0);
    });

    it("should update lastUpdated timestamp", () => {
      const currentState = createNeutralState();
      const oldTimestamp = currentState.lastUpdated;

      // Wait 1ms to ensure timestamp changes
      const newState = applyEmotionDeltas(currentState, { joy: 0.1 }, 0.05, 0.3);

      expect(newState.lastUpdated.getTime()).toBeGreaterThanOrEqual(oldTimestamp.getTime());
    });

    it("should handle empty deltas (only decay)", () => {
      const currentState: PlutchikEmotionState = {
        ...createNeutralState(),
        joy: 0.8,
        sadness: 0.3,
      };

      const newState = applyEmotionDeltas(currentState, {}, 0.1, 0.0);

      // Joy should decay towards 0.5 (neutral)
      expect(newState.joy).toBeLessThan(currentState.joy);
      // Sadness should move towards 0.5
      expect(newState.sadness).toBeGreaterThan(currentState.sadness);
    });
  });

  describe("emotionStateToPAD", () => {
    it("should calculate positive valence for positive emotions", () => {
      const state: PlutchikEmotionState = {
        ...createNeutralState(),
        joy: 0.9,
        trust: 0.8,
        anticipation: 0.7,
        sadness: 0.1,
        fear: 0.1,
        anger: 0.1,
        disgust: 0.1,
      };

      const pad = emotionStateToPAD(state);

      expect(pad.valence).toBeGreaterThan(0);
    });

    it("should calculate negative valence for negative emotions", () => {
      const state: PlutchikEmotionState = {
        ...createNeutralState(),
        sadness: 0.9,
        fear: 0.8,
        anger: 0.7,
        disgust: 0.6,
        joy: 0.1,
        trust: 0.1,
        anticipation: 0.1,
      };

      const pad = emotionStateToPAD(state);

      expect(pad.valence).toBeLessThan(0);
    });

    it("should calculate high arousal for activating emotions", () => {
      const state: PlutchikEmotionState = {
        ...createNeutralState(),
        anger: 0.9,
        fear: 0.8,
        surprise: 0.7,
        anticipation: 0.8,
      };

      const pad = emotionStateToPAD(state);

      expect(pad.arousal).toBeGreaterThan(0.6);
    });

    it("should calculate low arousal for calming emotions", () => {
      const state: PlutchikEmotionState = {
        ...createNeutralState(),
        sadness: 0.7,
        trust: 0.8,
        anger: 0.1,
        fear: 0.1,
        surprise: 0.1,
      };

      const pad = emotionStateToPAD(state);

      expect(pad.arousal).toBeLessThan(0.5);
    });

    it("should calculate high dominance for dominant emotions", () => {
      const state: PlutchikEmotionState = {
        ...createNeutralState(),
        anger: 0.9,
        disgust: 0.7,
        anticipation: 0.8,
        fear: 0.1,
        sadness: 0.1,
      };

      const pad = emotionStateToPAD(state);

      expect(pad.dominance).toBeGreaterThan(0.6);
    });

    it("should calculate low dominance for submissive emotions", () => {
      const state: PlutchikEmotionState = {
        ...createNeutralState(),
        fear: 0.9,
        sadness: 0.8,
        surprise: 0.7,
        anger: 0.1,
        disgust: 0.1,
      };

      const pad = emotionStateToPAD(state);

      expect(pad.dominance).toBeLessThan(0.4);
    });

    it("should clamp PAD values within valid ranges", () => {
      const extremeState: PlutchikEmotionState = {
        ...createNeutralState(),
        joy: 1.0,
        trust: 1.0,
        anticipation: 1.0,
      };

      const pad = emotionStateToPAD(extremeState);

      expect(pad.valence).toBeGreaterThanOrEqual(-1);
      expect(pad.valence).toBeLessThanOrEqual(1);
      expect(pad.arousal).toBeGreaterThanOrEqual(0);
      expect(pad.arousal).toBeLessThanOrEqual(1);
      expect(pad.dominance).toBeGreaterThanOrEqual(0);
      expect(pad.dominance).toBeLessThanOrEqual(1);
    });
  });

  describe("getEmotionalSummary", () => {
    it("should identify dominant emotions", () => {
      const state: PlutchikEmotionState = {
        ...createNeutralState(),
        joy: 0.9,
        trust: 0.7,
        anticipation: 0.6,
      };

      const summary = getEmotionalSummary(state);

      expect(summary.dominant).toHaveLength(3);
      // First dominant emotion should be related to joy (highest value)
      expect(["Serenidad", "Alegría", "Éxtasis"]).toContain(summary.dominant[0]);
    });

    it("should detect secondary emotions (dyads)", () => {
      const state: PlutchikEmotionState = {
        ...createNeutralState(),
        joy: 0.8,
        trust: 0.7,
      };

      const summary = getEmotionalSummary(state);

      // Joy + Trust = Love
      expect(summary.secondary).toContain("Amor");
    });

    it("should calculate mood as Eufórico for high valence and arousal", () => {
      const state: PlutchikEmotionState = {
        ...createNeutralState(),
        joy: 1.0,
        trust: 0.9,
        anticipation: 1.0,
        fear: 0,
        sadness: 0,
        disgust: 0,
        anger: 0,
      };

      const summary = getEmotionalSummary(state);

      // With very high joy and anticipation, should be Eufórico
      expect(["Eufórico", "Positivo"]).toContain(summary.mood);
    });

    it("should calculate mood as Sereno or Positivo for high valence and low arousal", () => {
      const state: PlutchikEmotionState = {
        ...createNeutralState(),
        joy: 0.7,
        trust: 0.8,
        fear: 0,
        sadness: 0.1,
        anger: 0,
        surprise: 0,
        anticipation: 0.3,
      };

      const summary = getEmotionalSummary(state);

      // Mood should be positive
      expect(["Sereno", "Positivo"]).toContain(summary.mood);
    });

    it("should calculate mood as Melancólico or Negativo for low valence and low arousal", () => {
      const state: PlutchikEmotionState = {
        ...createNeutralState(),
        sadness: 0.9,
        disgust: 0.7,
        trust: 0.1,
        joy: 0,
        anticipation: 0.1,
        anger: 0.1,
        fear: 0.3,
      };

      const summary = getEmotionalSummary(state);

      // Mood should be negative
      expect(["Melancólico", "Negativo"]).toContain(summary.mood);
    });

    it("should include PAD values in summary", () => {
      const state = createNeutralState();
      const summary = getEmotionalSummary(state);

      expect(summary.pad).toBeDefined();
      expect(summary.pad.valence).toBeDefined();
      expect(summary.pad.arousal).toBeDefined();
      expect(summary.pad.dominance).toBeDefined();
    });
  });

  describe("Plutchik Emotion Helpers", () => {
    it("should create neutral state with correct values", () => {
      const state = createNeutralState();

      expect(state.joy).toBe(0.5);
      expect(state.trust).toBe(0.5);
      expect(state.fear).toBe(0.2);
      expect(state.surprise).toBe(0.1);
      expect(state.sadness).toBe(0.2);
      expect(state.disgust).toBe(0.1);
      expect(state.anger).toBe(0.1);
      expect(state.anticipation).toBe(0.4);
      expect(state.lastUpdated).toBeInstanceOf(Date);
    });

    it("should get dominant emotions sorted by intensity", () => {
      const state: PlutchikEmotionState = {
        ...createNeutralState(),
        joy: 0.9,
        trust: 0.7,
        fear: 0.6,
      };

      const dominant = getDominantEmotions(state);

      expect(dominant).toHaveLength(3);
      expect(dominant[0].intensity).toBeGreaterThanOrEqual(dominant[1].intensity);
      expect(dominant[1].intensity).toBeGreaterThanOrEqual(dominant[2].intensity);
    });

    it("should get opposite emotions correctly", () => {
      expect(getOppositeEmotion("joy")).toBe("sadness");
      expect(getOppositeEmotion("sadness")).toBe("joy");
      expect(getOppositeEmotion("trust")).toBe("disgust");
      expect(getOppositeEmotion("disgust")).toBe("trust");
      expect(getOppositeEmotion("fear")).toBe("anger");
      expect(getOppositeEmotion("anger")).toBe("fear");
      expect(getOppositeEmotion("surprise")).toBe("anticipation");
      expect(getOppositeEmotion("anticipation")).toBe("surprise");
    });

    it("should calculate secondary emotions from two primaries", () => {
      // Joy + Trust = Love
      const love = calculateSecondaryEmotion("joy", 0.8, "trust", 0.7);
      expect(love).toBeDefined();
      expect(love?.name).toBe("love");

      // Fear + Sadness = Despair
      const despair = calculateSecondaryEmotion("fear", 0.8, "sadness", 0.7);
      expect(despair).toBeDefined();
      expect(despair?.name).toBe("despair");
    });

    it("should not calculate secondary emotion if intensities too low", () => {
      const result = calculateSecondaryEmotion("joy", 0.2, "trust", 0.2);
      expect(result).toBeNull();
    });

    it("should calculate secondary emotion regardless of order", () => {
      const result1 = calculateSecondaryEmotion("joy", 0.8, "trust", 0.7);
      const result2 = calculateSecondaryEmotion("trust", 0.7, "joy", 0.8);

      expect(result1?.name).toBe(result2?.name);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty message", () => {
      const deltas = analyzeMessageEmotions("");

      // Should still have baseline increases
      expect(deltas.joy).toBeGreaterThanOrEqual(0.02);
      expect(deltas.trust).toBeGreaterThanOrEqual(0.02);
    });

    it("should handle very long messages", () => {
      const longMessage = "a ".repeat(500); // 1000 characters
      const deltas = analyzeMessageEmotions(longMessage);

      // Long messages increase anticipation and trust
      expect(deltas.anticipation).toBeGreaterThan(0);
      expect(deltas.trust).toBeGreaterThan(0);
    });

    it("should handle messages with only symbols", () => {
      const message = "!!!!????";
      const deltas = analyzeMessageEmotions(message);

      expect(deltas.surprise).toBeGreaterThan(0);
      expect(deltas.joy).toBeGreaterThan(0);
    });

    it("should handle extreme decay rate", () => {
      const currentState = createNeutralState();
      const newState = applyEmotionDeltas(currentState, { joy: 0.1 }, 1.0, 0.0);

      // With decay rate of 1.0, emotions should move very quickly to neutral
      expect(Math.abs(newState.joy - 0.5)).toBeLessThan(0.1);
    });

    it("should handle zero decay rate", () => {
      const currentState = createNeutralState();
      const deltas = { joy: 0.2 };

      const newState = applyEmotionDeltas(currentState, deltas, 0.0, 0.0);

      // With no decay, delta should be applied directly
      expect(newState.joy).toBe(currentState.joy + deltas.joy);
    });
  });
});
