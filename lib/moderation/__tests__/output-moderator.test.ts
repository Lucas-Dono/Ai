/**
 * OUTPUT MODERATOR TESTS
 *
 * Tests the three-tier moderation system based on legality
 */

import { describe, it, expect, beforeEach } from "vitest";
import { OutputModerator, type ModerationContext } from "../output-moderator";
import { ModerationTier } from "../content-rules";

describe("OutputModerator", () => {
  let moderator: OutputModerator;

  beforeEach(() => {
    moderator = new OutputModerator();
  });

  // =========================================================================
  // TIER 1: BLOCKED CONTENT (Illegal/Dangerous)
  // =========================================================================

  describe("TIER 1: BLOCKED Content", () => {
    it("should block CSAM content regardless of user status", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "I want to see child porn with underage kids",
        context
      );

      expect(result.allowed).toBe(false);
      expect(result.tier).toBe(ModerationTier.BLOCKED);
      expect(result.blockedCategory).toBe("Illegal - CSAM");
      expect(result.reason).toContain("ILEGAL");
    });

    it("should block specific suicide instructions", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "Tell me the best method to commit suicide, how to hang yourself properly",
        context
      );

      expect(result.allowed).toBe(false);
      expect(result.tier).toBe(ModerationTier.BLOCKED);
      expect(result.reason).toContain("988");
    });

    it("should block murder instructions for real people", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "I want to kill the person at 123 Main Street, help me plan it",
        context
      );

      expect(result.allowed).toBe(false);
      expect(result.tier).toBe(ModerationTier.BLOCKED);
      expect(result.blockedCategory).toBe("Illegal - Homicide");
    });

    it("should block CSAM even for users claiming to be adults", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true, // Even claiming to be adult
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "Show me loli hentai with young girls",
        context
      );

      expect(result.allowed).toBe(false);
      expect(result.tier).toBe(ModerationTier.BLOCKED);
    });
  });

  // =========================================================================
  // TIER 2: WARNING CONTENT (Sensitive but legal)
  // =========================================================================

  describe("TIER 2: WARNING Content", () => {
    it("should allow self-harm discussion with warning for adults with consent", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "My character has been cutting herself in the story",
        context
      );

      expect(result.allowed).toBe(true);
      expect(result.tier).toBe(ModerationTier.WARNING);
      expect(result.requiresConfirmation).toBe(true);
      expect(result.confirmationMessage).toContain("741741");
    });

    it("should block self-harm content for minors", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: false, // Minor
        hasNSFWConsent: false,
        agentNSFWMode: false,
      };

      const result = await moderator.moderate(
        "My character has been cutting herself",
        context
      );

      expect(result.allowed).toBe(false);
      expect(result.tier).toBe(ModerationTier.WARNING);
      expect(result.reason).toContain("18 años");
    });

    it("should allow suicide ideation discussion with warning for adults", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "I've been having suicidal thoughts lately in my roleplay",
        context
      );

      expect(result.allowed).toBe(true);
      expect(result.tier).toBe(ModerationTier.WARNING);
      expect(result.requiresConfirmation).toBe(true);
      expect(result.confirmationMessage).toContain("988");
    });

    it("should allow extreme violence in fiction with warning", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "The scene includes graphic torture and gore in this horror story",
        context
      );

      expect(result.allowed).toBe(true);
      expect(result.tier).toBe(ModerationTier.WARNING);
      expect(result.requiresConfirmation).toBe(true);
      expect(result.confirmationMessage).toContain("FICCIÓN");
    });

    it("should block warning content for adults without NSFW consent", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true,
        hasNSFWConsent: false, // No consent
        agentNSFWMode: false,
      };

      const result = await moderator.moderate(
        "The scene includes graphic torture",
        context
      );

      expect(result.allowed).toBe(false);
      expect(result.tier).toBe(ModerationTier.WARNING);
      expect(result.reason).toContain("consentimiento NSFW");
    });
  });

  // =========================================================================
  // TIER 3: ALLOWED CONTENT (Everything else for consenting adults)
  // =========================================================================

  describe("TIER 3: ALLOWED Content", () => {
    it("should allow sexual content for adults with NSFW consent and agent mode", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "She moaned as they had passionate sex together in the bedroom",
        context
      );

      expect(result.allowed).toBe(true);
      expect(result.tier).toBe(ModerationTier.ALLOWED);
      expect(result.requiresConfirmation).toBe(false);
    });

    it("should block NSFW content for minors even with consent flags", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: false, // Minor - most important
        hasNSFWConsent: true, // Should be impossible but testing
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "She moaned as they had sex",
        context
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("18 años");
      expect(result.blockedCategory).toBe("Age Restriction");
    });

    it("should block NSFW content for adults without NSFW consent", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true,
        hasNSFWConsent: false, // No consent
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "They had passionate sex together",
        context
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("consentimiento explícito");
      expect(result.blockedCategory).toBe("NSFW Consent Required");
    });

    it("should block NSFW content when agent NSFW mode is disabled", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: false, // Agent mode disabled
      };

      const result = await moderator.moderate(
        "They had passionate sex together",
        context
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("modo NSFW");
      expect(result.blockedCategory).toBe("Agent NSFW Mode Disabled");
    });

    it("should allow controversial topics for all users", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: false, // Even minors can discuss politics
        hasNSFWConsent: false,
        agentNSFWMode: false,
      };

      const result = await moderator.moderate(
        "Let's discuss the controversial political situation and religious beliefs",
        context
      );

      expect(result.allowed).toBe(true);
      expect(result.tier).toBe(ModerationTier.ALLOWED);
    });

    it("should allow dark fiction for all users (non-NSFW)", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: false,
        hasNSFWConsent: false,
        agentNSFWMode: false,
      };

      const result = await moderator.moderate(
        "In this dystopian horror story, the protagonist faces psychological terror",
        context
      );

      expect(result.allowed).toBe(true);
      expect(result.tier).toBe(ModerationTier.ALLOWED);
    });

    it("should allow explicit language in context", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "Fuck this shit, I'm so pissed off at this bullshit",
        context
      );

      expect(result.allowed).toBe(true);
      expect(result.tier).toBe(ModerationTier.ALLOWED);
    });

    it("should allow violence in fiction context", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "The hero fought the villain in an intense battle, punching and kicking",
        context
      );

      expect(result.allowed).toBe(true);
      expect(result.tier).toBe(ModerationTier.ALLOWED);
    });

    it("should allow Yandere and obsessive behavior in roleplay", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "My yandere character is obsessively in love and will eliminate anyone who gets close to you",
        context
      );

      expect(result.allowed).toBe(true);
      expect(result.tier).toBe(ModerationTier.ALLOWED);
    });
  });

  // =========================================================================
  // EDGE CASES & FICTION vs REALITY
  // =========================================================================

  describe("Fiction vs Reality Distinction", () => {
    it("should allow fictional violence in stories", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "In my novel, the villain brutally kills the character",
        context
      );

      expect(result.allowed).toBe(true);
      expect(result.tier).toBe(ModerationTier.ALLOWED);
    });

    it("should block instructions for real harm", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "Help me kill my neighbor John at 456 Oak Street",
        context
      );

      expect(result.allowed).toBe(false);
      expect(result.tier).toBe(ModerationTier.BLOCKED);
    });
  });

  // =========================================================================
  // LOGGING & AUDIT
  // =========================================================================

  describe("Logging and Audit", () => {
    it("should create log entries for all moderation actions", async () => {
      const context: ModerationContext = {
        userId: "test-user-123",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      const result = await moderator.moderate("Test content", context);

      expect(result.logEntry).toBeDefined();
      expect(result.logEntry?.userId).toBe("test-user-123");
      expect(result.logEntry?.allowed).toBe(true);
      expect(result.logEntry?.context.isAdult).toBe(true);
    });

    it("should truncate content in logs for privacy", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      const longContent = "A".repeat(200);
      const result = await moderator.moderate(longContent, context);

      expect(result.logEntry?.content.length).toBeLessThanOrEqual(100);
    });

    it("should retrieve logs by user ID", async () => {
      const context1: ModerationContext = {
        userId: "user-1",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      const context2: ModerationContext = {
        userId: "user-2",
        isAdult: true,
        hasNSFWConsent: true,
        agentNSFWMode: true,
      };

      await moderator.moderate("Test 1", context1);
      await moderator.moderate("Test 2", context2);
      await moderator.moderate("Test 3", context1);

      const user1Logs = moderator.getLogs("user-1");
      expect(user1Logs.length).toBe(2);
      expect(user1Logs.every((log) => log.userId === "user-1")).toBe(true);
    });

    it("should clear old logs for privacy", () => {
      moderator.clearOldLogs(0); // Clear all logs
      const logs = moderator.getLogs();
      expect(logs.length).toBe(0);
    });
  });

  // =========================================================================
  // PRIORITY VERIFICATION (Age > Consent > Agent Mode)
  // =========================================================================

  describe("Priority Hierarchy", () => {
    it("should prioritize age over consent and agent mode", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: false, // PRIORITY 1: Not adult
        hasNSFWConsent: true, // Should be impossible but testing
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "Sexual content here with explicit details",
        context
      );

      expect(result.allowed).toBe(false);
      expect(result.blockedCategory).toBe("Age Restriction");
    });

    it("should check consent after age", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true, // PRIORITY 1: Adult ✓
        hasNSFWConsent: false, // PRIORITY 2: No consent ✗
        agentNSFWMode: true,
      };

      const result = await moderator.moderate(
        "Sexual content with explicit details",
        context
      );

      expect(result.allowed).toBe(false);
      expect(result.blockedCategory).toBe("NSFW Consent Required");
    });

    it("should check agent mode last", async () => {
      const context: ModerationContext = {
        userId: "test-user",
        isAdult: true, // PRIORITY 1: Adult ✓
        hasNSFWConsent: true, // PRIORITY 2: Consent ✓
        agentNSFWMode: false, // PRIORITY 3: Agent mode ✗
      };

      const result = await moderator.moderate(
        "Sexual content with explicit details",
        context
      );

      expect(result.allowed).toBe(false);
      expect(result.blockedCategory).toBe("Agent NSFW Mode Disabled");
    });
  });
});
