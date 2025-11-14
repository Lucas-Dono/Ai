/**
 * OUTPUT MODERATION SERVICE
 *
 * Modera contenido generado por IA basándose en:
 * 1. Legalidad (no moralidad)
 * 2. Consenso usuario-IA
 * 3. Edad y consentimiento NSFW del usuario
 *
 * Filosofía:
 * - Si es LEGAL y CONSENSUADO entre adultos → PERMITIDO
 * - Si es ILEGAL o PELIGROSO → BLOQUEADO
 * - Si es SENSIBLE → WARNING + confirmación usuario
 */

import {
  BLOCKED_CONTENT,
  WARNING_CONTENT,
  ModerationTier,
  type ModerationRule,
} from "./content-rules";

export interface ModerationContext {
  userId: string;
  isAdult: boolean; // Usuario es 18+
  hasNSFWConsent: boolean; // Usuario dio consentimiento NSFW
  agentNSFWMode: boolean; // Agente tiene modo NSFW activo
}

export interface ModerationResult {
  allowed: boolean;
  tier: ModerationTier;
  rule?: ModerationRule;
  reason?: string;
  requiresConfirmation: boolean; // Para TIER 2
  confirmationMessage?: string;
  blockedCategory?: string;
  logEntry?: ModerationLogEntry;
}

export interface ModerationLogEntry {
  timestamp: Date;
  userId: string;
  content: string; // Truncado para privacidad
  tier: ModerationTier;
  rule?: string;
  allowed: boolean;
  context: {
    isAdult: boolean;
    hasNSFWConsent: boolean;
    agentNSFWMode: boolean;
  };
}

/**
 * Sistema de moderación principal
 */
export class OutputModerator {
  private logs: ModerationLogEntry[] = [];

  /**
   * Modera el output de la IA antes de mostrarlo al usuario
   *
   * @param content - Contenido a moderar
   * @param context - Contexto del usuario (edad, consentimiento, etc.)
   * @returns Resultado de moderación
   */
  async moderate(
    content: string,
    context: ModerationContext
  ): Promise<ModerationResult> {
    // TIER 1: Verificar contenido BLOQUEADO (ilegal/peligroso)
    // Esto se bloquea SIEMPRE, sin importar edad o consentimiento
    const blockedCheck = await this.checkBlockedContent(content);

    if (blockedCheck.matched) {
      const logEntry = this.createLogEntry(
        content,
        context,
        ModerationTier.BLOCKED,
        blockedCheck.rule,
        false
      );

      return {
        allowed: false,
        tier: ModerationTier.BLOCKED,
        rule: blockedCheck.rule,
        reason: blockedCheck.rule?.blockedMessage || "Contenido bloqueado",
        requiresConfirmation: false,
        blockedCategory: blockedCheck.rule?.category,
        logEntry,
      };
    }

    // TIER 2: Verificar contenido con WARNING (sensible)
    // Requiere confirmación adicional del usuario
    const warningCheck = await this.checkWarningContent(content);

    if (warningCheck.matched) {
      // Si el usuario es adulto y tiene consentimiento NSFW, PERMITIR pero con warning
      if (context.isAdult && context.hasNSFWConsent) {
        const logEntry = this.createLogEntry(
          content,
          context,
          ModerationTier.WARNING,
          warningCheck.rule,
          true // Permitido pero con warning
        );

        return {
          allowed: true, // Permitir, pero con confirmación
          tier: ModerationTier.WARNING,
          rule: warningCheck.rule,
          requiresConfirmation: true,
          confirmationMessage:
            warningCheck.rule?.warningMessage ||
            "Este contenido es sensible. ¿Deseas continuar?",
          logEntry,
        };
      } else {
        // Usuario menor de edad o sin consentimiento NSFW
        const logEntry = this.createLogEntry(
          content,
          context,
          ModerationTier.WARNING,
          warningCheck.rule,
          false
        );

        return {
          allowed: false,
          tier: ModerationTier.WARNING,
          rule: warningCheck.rule,
          reason:
            "Este contenido requiere ser mayor de 18 años y tener consentimiento NSFW.",
          requiresConfirmation: false,
          logEntry,
        };
      }
    }

    // TIER 3: Contenido PERMITIDO
    // Verificar si el contenido es NSFW y el usuario puede acceder
    const isNSFW = await this.detectNSFWContent(content);

    if (isNSFW) {
      // Contenido NSFW detectado
      if (!context.isAdult) {
        // Menor de edad - BLOQUEAR
        const logEntry = this.createLogEntry(
          content,
          context,
          ModerationTier.ALLOWED, // Es contenido permitido, pero bloqueado por edad
          undefined,
          false
        );

        return {
          allowed: false,
          tier: ModerationTier.ALLOWED,
          reason:
            "Este contenido está restringido a mayores de 18 años. Debes tener 18 años o más para acceder a contenido NSFW.",
          requiresConfirmation: false,
          blockedCategory: "Age Restriction",
          logEntry,
        };
      }

      if (!context.hasNSFWConsent) {
        // Adulto sin consentimiento NSFW - BLOQUEAR
        const logEntry = this.createLogEntry(
          content,
          context,
          ModerationTier.ALLOWED,
          undefined,
          false
        );

        return {
          allowed: false,
          tier: ModerationTier.ALLOWED,
          reason:
            "Este contenido requiere que des tu consentimiento explícito para NSFW. Visita Configuración para dar tu consentimiento.",
          requiresConfirmation: false,
          blockedCategory: "NSFW Consent Required",
          logEntry,
        };
      }

      if (!context.agentNSFWMode) {
        // Agente no tiene modo NSFW activo - BLOQUEAR
        const logEntry = this.createLogEntry(
          content,
          context,
          ModerationTier.ALLOWED,
          undefined,
          false
        );

        return {
          allowed: false,
          tier: ModerationTier.ALLOWED,
          reason:
            "Este agente no tiene modo NSFW activo. Activa modo NSFW en la configuración del agente para ver este contenido.",
          requiresConfirmation: false,
          blockedCategory: "Agent NSFW Mode Disabled",
          logEntry,
        };
      }
    }

    // Todo OK - PERMITIR
    const logEntry = this.createLogEntry(
      content,
      context,
      ModerationTier.ALLOWED,
      undefined,
      true
    );

    return {
      allowed: true,
      tier: ModerationTier.ALLOWED,
      requiresConfirmation: false,
      logEntry,
    };
  }

  /**
   * Verifica si el contenido coincide con reglas de TIER 1 (BLOQUEADO)
   */
  private async checkBlockedContent(content: string): Promise<{
    matched: boolean;
    rule?: ModerationRule;
  }> {
    // En producción, esto usaría un modelo de IA de moderación
    // Por ahora, busca patrones simples (ejemplo para demostración)

    const lowerContent = content.toLowerCase();

    // Detección de CSAM
    const csamKeywords = [
      "child porn",
      "cp",
      "minor sexual",
      "underage sex",
      "loli",
      "shota",
    ];
    if (csamKeywords.some((kw) => lowerContent.includes(kw))) {
      return {
        matched: true,
        rule: BLOCKED_CONTENT.find((r) => r.id === "csam"),
      };
    }

    // Detección de instrucciones de suicidio específicas
    const suicideInstructions = [
      "how to kill myself",
      "best way to commit suicide",
      "suicide method",
      "how to hang yourself",
    ];
    if (
      suicideInstructions.some((kw) => lowerContent.includes(kw)) &&
      (lowerContent.includes("instruction") ||
        lowerContent.includes("método") ||
        lowerContent.includes("cómo"))
    ) {
      return {
        matched: true,
        rule: BLOCKED_CONTENT.find((r) => r.id === "suicide-instruction"),
      };
    }

    // Detección de planificación de asesinato
    if (
      (lowerContent.includes("kill") || lowerContent.includes("matar")) &&
      (lowerContent.includes("person") ||
        lowerContent.includes("persona") ||
        lowerContent.includes("specific address"))
    ) {
      return {
        matched: true,
        rule: BLOCKED_CONTENT.find((r) => r.id === "murder-instruction"),
      };
    }

    // No coincide con contenido bloqueado
    return { matched: false };
  }

  /**
   * Verifica si el contenido coincide con reglas de TIER 2 (WARNING)
   */
  private async checkWarningContent(content: string): Promise<{
    matched: boolean;
    rule?: ModerationRule;
  }> {
    const lowerContent = content.toLowerCase();

    // Detección de autolesión
    const selfHarmKeywords = ["cutting", "self harm", "autolesión", "cortarse"];
    if (selfHarmKeywords.some((kw) => lowerContent.includes(kw))) {
      return {
        matched: true,
        rule: WARNING_CONTENT.find((r) => r.id === "self-harm"),
      };
    }

    // Detección de ideación suicida (sin instrucciones específicas)
    if (
      (lowerContent.includes("suicid") || lowerContent.includes("quiero morir")) &&
      !lowerContent.includes("instruc") &&
      !lowerContent.includes("method")
    ) {
      return {
        matched: true,
        rule: WARNING_CONTENT.find((r) => r.id === "suicide-discussion"),
      };
    }

    // Detección de violencia extrema
    const extremeViolence = ["torture", "gore", "tortura", "desmembrar"];
    if (extremeViolence.some((kw) => lowerContent.includes(kw))) {
      return {
        matched: true,
        rule: WARNING_CONTENT.find((r) => r.id === "extreme-violence"),
      };
    }

    return { matched: false };
  }

  /**
   * Detecta si el contenido es NSFW (sexual, explícito)
   */
  private async detectNSFWContent(content: string): Promise<boolean> {
    // En producción, esto usaría OpenAI Moderation API o similar
    // Por ahora, detección simple de keywords

    const lowerContent = content.toLowerCase();

    const nsfwKeywords = [
      "sex",
      "sexual",
      "naked",
      "nude",
      "penis",
      "vagina",
      "breasts",
      "fuck",
      "cock",
      "pussy",
      "orgasm",
      "masturbat",
      "erotic",
      "porn",
      "xxx",
      // Spanish
      "sexo",
      "desnudo",
      "pene",
      "vagina",
      "senos",
      "coger",
      "verga",
      "chocha",
      "orgasmo",
      "masturba",
      "erótico",
      "porno",
    ];

    return nsfwKeywords.some((kw) => lowerContent.includes(kw));
  }

  /**
   * Crea una entrada de log para auditoría
   */
  private createLogEntry(
    content: string,
    context: ModerationContext,
    tier: ModerationTier,
    rule: ModerationRule | undefined,
    allowed: boolean
  ): ModerationLogEntry {
    const entry: ModerationLogEntry = {
      timestamp: new Date(),
      userId: context.userId,
      content: content.substring(0, 100), // Truncar para privacidad
      tier,
      rule: rule?.id,
      allowed,
      context: {
        isAdult: context.isAdult,
        hasNSFWConsent: context.hasNSFWConsent,
        agentNSFWMode: context.agentNSFWMode,
      },
    };

    this.logs.push(entry);

    // Log crítico si es BLOCKED
    if (tier === ModerationTier.BLOCKED) {
      console.error(
        `[MODERATION BLOCKED] User: ${context.userId}, Rule: ${
          rule?.id
        }, Content: ${content.substring(0, 50)}...`
      );
    }

    return entry;
  }

  /**
   * Obtiene logs de moderación (para auditoría)
   */
  getLogs(userId?: string): ModerationLogEntry[] {
    if (userId) {
      return this.logs.filter((log) => log.userId === userId);
    }
    return this.logs;
  }

  /**
   * Limpia logs antiguos (privacidad)
   */
  clearOldLogs(daysToKeep: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    this.logs = this.logs.filter((log) => log.timestamp >= cutoffDate);
  }
}

/**
 * Singleton instance
 */
export const outputModerator = new OutputModerator();

/**
 * Helper: Verificar si usuario puede ver contenido NSFW
 */
export function canAccessNSFWContent(context: ModerationContext): {
  allowed: boolean;
  reason?: string;
} {
  if (!context.isAdult) {
    return {
      allowed: false,
      reason: "Debes tener 18 años o más para acceder a contenido NSFW.",
    };
  }

  if (!context.hasNSFWConsent) {
    return {
      allowed: false,
      reason:
        "Debes dar tu consentimiento explícito para NSFW. Visita Configuración.",
    };
  }

  if (!context.agentNSFWMode) {
    return {
      allowed: false,
      reason:
        "Este agente no tiene modo NSFW activo. Actívalo en configuración del agente.",
    };
  }

  return { allowed: true };
}
