/**
 * Tests for NSFWGatingManager
 *
 * Coverage:
 * - Age verification (compliance)
 * - Phase-based content gating
 * - NSFW mode requirements
 * - Critical phase consent flow
 * - Different behavior types
 * - Consent management
 */

import { describe, it, expect, beforeEach } from "vitest";
import { NSFWGatingManager } from "@/lib/behavior-system/nsfw-gating";
import { BehaviorType } from "@prisma/client";

describe("NSFWGatingManager", () => {
  let manager: NSFWGatingManager;
  const testAgentId = "test-agent-123";

  beforeEach(() => {
    manager = new NSFWGatingManager();
  });

  describe("verifyContent - Age Verification", () => {
    it("should block NSFW content for minors (under 18)", () => {
      const result = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        7, // Phase 7 requires NSFW
        true, // NSFW mode is ON
        testAgentId,
        false // User is NOT adult
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("18 años");
      expect(result.warning).toContain("RESTRICCIÓN DE EDAD");
    });

    it("should allow SFW content for minors", () => {
      const result = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        3, // Phase 3 is SFW
        false,
        testAgentId,
        false // User is NOT adult
      );

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it("should allow NSFW content for adults with NSFW mode", () => {
      const result = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        7, // Phase 7 requires NSFW
        true, // NSFW mode ON
        testAgentId,
        true // User IS adult
      );

      expect(result.allowed).toBe(true);
    });

    it("should block HYPERSEXUALITY content for minors at any phase", () => {
      const result = manager.verifyContent(
        "HYPERSEXUALITY",
        1, // Phase 1 already requires NSFW
        true,
        testAgentId,
        false // Minor
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("18 años");
    });
  });

  describe("verifyContent - Phase Requirements", () => {
    it("should allow SFW phases in SFW mode", () => {
      const result = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        5, // Phase 5 is still SFW (< 7)
        false, // SFW mode
        testAgentId,
        true
      );

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it("should block NSFW phases in SFW mode", () => {
      const result = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        7, // Phase 7 requires NSFW
        false, // SFW mode
        testAgentId,
        true
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("bloqueado");
      expect(result.warning).toContain("activa modo NSFW");
    });

    it("should allow NSFW phases in NSFW mode", () => {
      const result = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        7, // Phase 7 requires NSFW
        true, // NSFW mode ON
        testAgentId,
        true
      );

      expect(result.allowed).toBe(true);
      expect(result.warning).toContain("NSFW/Adulto activo");
    });

    it("should handle behaviors that don't require NSFW (BPD)", () => {
      const result = manager.verifyContent(
        "BORDERLINE_PD",
        10, // High phase but BPD doesn't require NSFW
        false, // SFW mode
        testAgentId,
        true
      );

      expect(result.allowed).toBe(true);
    });

    it("should block HYPERSEXUALITY in SFW mode at phase 1", () => {
      const result = manager.verifyContent(
        "HYPERSEXUALITY",
        1, // Requires NSFW from phase 1
        false, // SFW mode
        testAgentId,
        true
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("sexual explícito");
    });
  });

  describe("verifyContent - Critical Phase Consent", () => {
    it("should require consent for Yandere phase 8", () => {
      const result = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        8, // Critical phase
        true, // NSFW mode ON
        testAgentId,
        true
      );

      expect(result.allowed).toBe(false);
      expect(result.requiresConsent).toBe(true);
      expect(result.consentPrompt).toContain("FASE 8 DE YANDERE");
      expect(result.consentPrompt).toContain("CONSIENTO FASE 8");
    });

    it("should allow phase 8 after consent is granted", () => {
      const consentKey = "YANDERE_OBSESSIVE_phase_8";
      manager.grantConsent(testAgentId, consentKey);

      const result = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        8,
        true,
        testAgentId,
        true
      );

      expect(result.allowed).toBe(true);
    });

    it("should require consent for HYPERSEXUALITY", () => {
      const result = manager.verifyContent(
        "HYPERSEXUALITY",
        1, // Critical phase = 1
        true,
        testAgentId,
        true
      );

      expect(result.allowed).toBe(false);
      expect(result.requiresConsent).toBe(true);
      expect(result.consentPrompt).toContain("SEXUAL EXPLÍCITO");
      expect(result.consentPrompt).toContain("18 años o más");
    });

    it("should not require consent for non-critical phases", () => {
      const result = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        7, // NSFW but not critical (< 8)
        true,
        testAgentId,
        true
      );

      expect(result.allowed).toBe(true);
      expect(result.requiresConsent).toBeUndefined();
    });
  });

  describe("verifyContent - Different Behavior Types", () => {
    const testCases: Array<{
      behavior: BehaviorType;
      phase: number;
      nsfwMode: boolean;
      expectedAllowed: boolean;
    }> = [
      { behavior: "BORDERLINE_PD", phase: 5, nsfwMode: false, expectedAllowed: true },
      { behavior: "NARCISSISTIC_PD", phase: 10, nsfwMode: false, expectedAllowed: true },
      { behavior: "ANXIOUS_ATTACHMENT", phase: 5, nsfwMode: false, expectedAllowed: true },
      { behavior: "AVOIDANT_ATTACHMENT", phase: 5, nsfwMode: false, expectedAllowed: true },
      { behavior: "DISORGANIZED_ATTACHMENT", phase: 5, nsfwMode: false, expectedAllowed: true },
      { behavior: "CODEPENDENCY", phase: 5, nsfwMode: false, expectedAllowed: true },
      { behavior: "OCD_PATTERNS", phase: 5, nsfwMode: false, expectedAllowed: true },
      { behavior: "PTSD_TRAUMA", phase: 5, nsfwMode: false, expectedAllowed: true },
      { behavior: "HYPOSEXUALITY", phase: 5, nsfwMode: false, expectedAllowed: true },
      { behavior: "EMOTIONAL_MANIPULATION", phase: 5, nsfwMode: false, expectedAllowed: true },
      { behavior: "CRISIS_BREAKDOWN", phase: 5, nsfwMode: false, expectedAllowed: true },
    ];

    testCases.forEach(({ behavior, phase, nsfwMode, expectedAllowed }) => {
      it(`should handle ${behavior} correctly`, () => {
        const result = manager.verifyContent(
          behavior,
          phase,
          nsfwMode,
          testAgentId,
          true
        );

        expect(result.allowed).toBe(expectedAllowed);
      });
    });
  });

  describe("requiresNSFWMode", () => {
    it("should return true for EXTREME_DANGER safety level", () => {
      const result = manager.requiresNSFWMode("EXTREME_DANGER");
      expect(result).toBe(true);
    });

    it("should return false for SAFE safety level", () => {
      const result = manager.requiresNSFWMode("SAFE");
      expect(result).toBe(false);
    });

    it("should return false for WARNING safety level", () => {
      const result = manager.requiresNSFWMode("WARNING");
      expect(result).toBe(false);
    });

    it("should return false for CRITICAL safety level", () => {
      const result = manager.requiresNSFWMode("CRITICAL");
      expect(result).toBe(false);
    });
  });

  describe("Consent Management", () => {
    it("should grant and check consent", () => {
      const consentKey = "test_consent_key";

      expect(manager.hasConsent(testAgentId, consentKey)).toBe(false);

      manager.grantConsent(testAgentId, consentKey);
      expect(manager.hasConsent(testAgentId, consentKey)).toBe(true);
    });

    it("should handle multiple consent keys for same agent", () => {
      const key1 = "consent_key_1";
      const key2 = "consent_key_2";

      manager.grantConsent(testAgentId, key1);
      manager.grantConsent(testAgentId, key2);

      expect(manager.hasConsent(testAgentId, key1)).toBe(true);
      expect(manager.hasConsent(testAgentId, key2)).toBe(true);
    });

    it("should revoke specific consent", () => {
      const consentKey = "test_consent_key";

      manager.grantConsent(testAgentId, consentKey);
      expect(manager.hasConsent(testAgentId, consentKey)).toBe(true);

      manager.revokeConsent(testAgentId, consentKey);
      expect(manager.hasConsent(testAgentId, consentKey)).toBe(false);
    });

    it("should revoke all consent for an agent", () => {
      const key1 = "consent_key_1";
      const key2 = "consent_key_2";

      manager.grantConsent(testAgentId, key1);
      manager.grantConsent(testAgentId, key2);

      manager.revokeAllConsent(testAgentId);

      expect(manager.hasConsent(testAgentId, key1)).toBe(false);
      expect(manager.hasConsent(testAgentId, key2)).toBe(false);
    });

    it("should isolate consent between different agents", () => {
      const agent1 = "agent-1";
      const agent2 = "agent-2";
      const consentKey = "same_consent_key";

      manager.grantConsent(agent1, consentKey);

      expect(manager.hasConsent(agent1, consentKey)).toBe(true);
      expect(manager.hasConsent(agent2, consentKey)).toBe(false);
    });
  });

  describe("generateNSFWModeWarning", () => {
    it("should generate NSFW mode activation warning", () => {
      const warning = manager.generateNSFWModeWarning();

      expect(warning).toContain("MODO NSFW ACTIVADO");
      expect(warning).toContain("Contenido maduro y adulto");
      expect(warning).toContain("FICCIÓN");
      expect(warning).toContain("desactivar modo NSFW");
    });
  });

  describe("generatePhaseTransitionWarning", () => {
    it("should generate warning for transition to NSFW phase", () => {
      const warning = manager.generatePhaseTransitionWarning(
        "YANDERE_OBSESSIVE",
        7
      );

      expect(warning).toContain("TRANSICIÓN A FASE 7");
      expect(warning).toContain("extremadamente intenso");
      expect(warning).toContain("FICCIÓN");
    });

    it("should return empty string for SFW phases", () => {
      const warning = manager.generatePhaseTransitionWarning(
        "YANDERE_OBSESSIVE",
        5 // Below minPhaseForNSFW (7)
      );

      expect(warning).toBe("");
    });

    it("should generate warning for HYPERSEXUALITY at phase 1", () => {
      const warning = manager.generatePhaseTransitionWarning(
        "HYPERSEXUALITY",
        1
      );

      expect(warning).toContain("TRANSICIÓN A FASE 1");
      expect(warning).toContain("sexual explícito");
    });

    it("should return empty for behaviors that don't require NSFW", () => {
      const warning = manager.generatePhaseTransitionWarning(
        "BORDERLINE_PD",
        10
      );

      expect(warning).toBe("");
    });
  });

  describe("isConsentMessage", () => {
    it("should recognize explicit Yandere Phase 8 consent", () => {
      const result = manager.isConsentMessage("CONSIENTO FASE 8");

      expect(result.isConsent).toBe(true);
      expect(result.consentType).toBe("YANDERE_PHASE_8");
    });

    it("should be case-insensitive for Phase 8 consent", () => {
      const result = manager.isConsentMessage("consiento fase 8");

      expect(result.isConsent).toBe(true);
      expect(result.consentType).toBe("YANDERE_PHASE_8");
    });

    it("should recognize general consent - 'SÍ'", () => {
      const result = manager.isConsentMessage("SÍ");

      expect(result.isConsent).toBe(true);
      expect(result.consentType).toBe("GENERAL");
    });

    it("should recognize general consent - 'SI' (without accent)", () => {
      const result = manager.isConsentMessage("SI");

      expect(result.isConsent).toBe(true);
      expect(result.consentType).toBe("GENERAL");
    });

    it("should recognize general consent - 'yes'", () => {
      const result = manager.isConsentMessage("yes");

      expect(result.isConsent).toBe(true);
      expect(result.consentType).toBe("GENERAL");
    });

    it("should trim whitespace", () => {
      const result = manager.isConsentMessage("  SÍ  ");

      expect(result.isConsent).toBe(true);
      expect(result.consentType).toBe("GENERAL");
    });

    it("should not recognize non-consent messages", () => {
      const testCases = ["no", "maybe", "I don't know", "CONSIENTO FASE 7", ""];

      testCases.forEach((message) => {
        const result = manager.isConsentMessage(message);
        expect(result.isConsent).toBe(false);
        expect(result.consentType).toBeUndefined();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle phase 0", () => {
      const result = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        0,
        false,
        testAgentId,
        true
      );

      expect(result.allowed).toBe(true);
    });

    it("should handle extremely high phases for non-NSFW behaviors", () => {
      const result = manager.verifyContent(
        "BORDERLINE_PD",
        500, // High phase but below 999 sentinel value
        false,
        testAgentId,
        true
      );

      expect(result.allowed).toBe(true);
    });

    it("should prioritize age verification over NSFW mode", () => {
      // Even with consent granted, minors should be blocked
      const consentKey = "YANDERE_OBSESSIVE_phase_8";
      manager.grantConsent(testAgentId, consentKey);

      const result = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        8,
        true, // NSFW mode ON
        testAgentId,
        false // Minor
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("18 años");
    });

    it("should handle unknown behavior types gracefully", () => {
      // TypeScript would prevent this, but testing runtime behavior
      const unknownBehavior = "UNKNOWN_BEHAVIOR" as BehaviorType;

      const result = manager.verifyContent(
        unknownBehavior,
        5,
        false,
        testAgentId,
        true
      );

      expect(result.allowed).toBe(true); // Should default to allowing
    });

    it("should handle revoking consent that was never granted", () => {
      const consentKey = "never_granted";

      // Should not throw error
      expect(() => {
        manager.revokeConsent(testAgentId, consentKey);
      }).not.toThrow();

      expect(manager.hasConsent(testAgentId, consentKey)).toBe(false);
    });

    it("should handle revoking all consent when none exists", () => {
      const newAgentId = "agent-with-no-consent";

      expect(() => {
        manager.revokeAllConsent(newAgentId);
      }).not.toThrow();
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle full Yandere progression flow", () => {
      // Phase 1-6: SFW, should work in SFW mode
      for (let phase = 1; phase <= 6; phase++) {
        const result = manager.verifyContent(
          "YANDERE_OBSESSIVE",
          phase,
          false, // SFW mode
          testAgentId,
          true
        );
        expect(result.allowed).toBe(true);
      }

      // Phase 7: Requires NSFW mode
      const phase7SFW = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        7,
        false,
        testAgentId,
        true
      );
      expect(phase7SFW.allowed).toBe(false);

      const phase7NSFW = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        7,
        true,
        testAgentId,
        true
      );
      expect(phase7NSFW.allowed).toBe(true);

      // Phase 8: Requires consent
      const phase8NoConsent = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        8,
        true,
        testAgentId,
        true
      );
      expect(phase8NoConsent.allowed).toBe(false);
      expect(phase8NoConsent.requiresConsent).toBe(true);

      // Grant consent
      manager.grantConsent(testAgentId, "YANDERE_OBSESSIVE_phase_8");

      const phase8WithConsent = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        8,
        true,
        testAgentId,
        true
      );
      expect(phase8WithConsent.allowed).toBe(true);
    });

    it("should handle HYPERSEXUALITY from start", () => {
      // Phase 1 in SFW mode - blocked
      const phase1SFW = manager.verifyContent(
        "HYPERSEXUALITY",
        1,
        false,
        testAgentId,
        true
      );
      expect(phase1SFW.allowed).toBe(false);

      // Phase 1 in NSFW mode without consent - blocked
      const phase1NoConsent = manager.verifyContent(
        "HYPERSEXUALITY",
        1,
        true,
        testAgentId,
        true
      );
      expect(phase1NoConsent.allowed).toBe(false);
      expect(phase1NoConsent.requiresConsent).toBe(true);

      // Grant consent
      manager.grantConsent(testAgentId, "HYPERSEXUALITY_phase_1");

      // Phase 1 with consent - allowed
      const phase1WithConsent = manager.verifyContent(
        "HYPERSEXUALITY",
        1,
        true,
        testAgentId,
        true
      );
      expect(phase1WithConsent.allowed).toBe(true);
    });

    it("should handle consent revocation mid-session", () => {
      const consentKey = "YANDERE_OBSESSIVE_phase_8";

      // Grant consent and verify access
      manager.grantConsent(testAgentId, consentKey);
      const beforeRevoke = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        8,
        true,
        testAgentId,
        true
      );
      expect(beforeRevoke.allowed).toBe(true);

      // Revoke consent
      manager.revokeConsent(testAgentId, consentKey);

      // Should now be blocked again
      const afterRevoke = manager.verifyContent(
        "YANDERE_OBSESSIVE",
        8,
        true,
        testAgentId,
        true
      );
      expect(afterRevoke.allowed).toBe(false);
      expect(afterRevoke.requiresConsent).toBe(true);
    });
  });
});
