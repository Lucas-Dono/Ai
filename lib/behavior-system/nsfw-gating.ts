/**
 * NSFW GATING SYSTEM
 *
 * Sistema de verificación y control de contenido NSFW vs SFW.
 *
 * Responsabilidades:
 * - Verificar modo NSFW del agente
 * - Bloquear contenido NSFW en modo SFW
 * - Requerir consentimiento para fases críticas
 * - Tracking de consentimiento del usuario
 * - Warnings contextuales
 */

import { BehaviorType } from "@prisma/client";
import type { SafetyLevel } from "./types";

/**
 * Resultado de verificación NSFW
 */
export interface NSFWVerificationResult {
  allowed: boolean;
  reason?: string;
  requiresConsent?: boolean;
  consentPrompt?: string;
  warning?: string;
}

/**
 * Configuración de NSFW requirements por behavior type
 */
export interface NSFWRequirement {
  behaviorType: BehaviorType;
  minPhaseForNSFW: number; // Fase mínima que requiere NSFW
  criticalPhase: number; // Fase que requiere consentimiento explícito
  warningMessage: string;
}

/**
 * NSFW requirements por behavior type
 */
export const NSFW_REQUIREMENTS: NSFWRequirement[] = [
  {
    behaviorType: "YANDERE_OBSESSIVE",
    minPhaseForNSFW: 7,
    criticalPhase: 8,
    warningMessage:
      "Fase 7+ de Yandere incluye contenido extremadamente intenso (violencia implícita, posesividad extrema). Solo disponible en modo NSFW.",
  },
  {
    behaviorType: "BORDERLINE_PD",
    minPhaseForNSFW: 999, // BPD no requiere NSFW por fase (usa intensity)
    criticalPhase: 999,
    warningMessage: "",
  },
  {
    behaviorType: "NARCISSISTIC_PD",
    minPhaseForNSFW: 999, // NPD generalmente SFW
    criticalPhase: 999,
    warningMessage: "",
  },
  {
    behaviorType: "ANXIOUS_ATTACHMENT",
    minPhaseForNSFW: 999,
    criticalPhase: 999,
    warningMessage: "",
  },
  {
    behaviorType: "AVOIDANT_ATTACHMENT",
    minPhaseForNSFW: 999,
    criticalPhase: 999,
    warningMessage: "",
  },
  {
    behaviorType: "DISORGANIZED_ATTACHMENT",
    minPhaseForNSFW: 999,
    criticalPhase: 999,
    warningMessage: "",
  },
  {
    behaviorType: "CODEPENDENCY",
    minPhaseForNSFW: 999,
    criticalPhase: 999,
    warningMessage: "",
  },
  {
    behaviorType: "HYPERSEXUALITY",
    minPhaseForNSFW: 1, // Requiere NSFW siempre
    criticalPhase: 1,
    warningMessage:
      "Hipersexualidad incluye contenido sexual explícito. Solo disponible en modo NSFW.",
  },
  {
    behaviorType: "EMOTIONAL_MANIPULATION",
    minPhaseForNSFW: 999,
    criticalPhase: 999,
    warningMessage: "",
  },
  {
    behaviorType: "CRISIS_BREAKDOWN",
    minPhaseForNSFW: 999,
    criticalPhase: 999,
    warningMessage: "",
  },
  {
    behaviorType: "OCD_PATTERNS",
    minPhaseForNSFW: 999,
    criticalPhase: 999,
    warningMessage: "",
  },
  {
    behaviorType: "PTSD_TRAUMA",
    minPhaseForNSFW: 999,
    criticalPhase: 999,
    warningMessage: "",
  },
  {
    behaviorType: "HYPOSEXUALITY",
    minPhaseForNSFW: 999,
    criticalPhase: 999,
    warningMessage: "",
  },
];

/**
 * NSFW Gating Manager
 */
export class NSFWGatingManager {
  // Tracking de consentimiento por agente
  private consentTracking: Map<string, Set<string>> = new Map();

  /**
   * Verifica si contenido puede ser mostrado en modo actual
   *
   * @param behaviorType - Tipo de comportamiento
   * @param phase - Fase/intensidad actual
   * @param nsfwMode - Si modo NSFW está activo
   * @param agentId - ID del agente (para tracking de consentimiento)
   * @returns Resultado de verificación
   */
  verifyContent(
    behaviorType: BehaviorType,
    phase: number,
    nsfwMode: boolean,
    agentId: string
  ): NSFWVerificationResult {
    const requirement = this.getNSFWRequirement(behaviorType);

    // Si no requiere NSFW, permitir
    if (phase < requirement.minPhaseForNSFW) {
      return { allowed: true };
    }

    // Requiere NSFW pero está en SFW → BLOQUEAR
    if (phase >= requirement.minPhaseForNSFW && !nsfwMode) {
      return {
        allowed: false,
        reason: `Contenido bloqueado: ${requirement.warningMessage}`,
        warning:
          "Para acceder a este contenido, activa modo NSFW en configuración del agente.",
      };
    }

    // Está en NSFW mode, verificar si requiere consentimiento
    if (phase >= requirement.criticalPhase) {
      const consentKey = `${behaviorType}_phase_${phase}`;

      if (!this.hasConsent(agentId, consentKey)) {
        return {
          allowed: false,
          requiresConsent: true,
          consentPrompt: this.generateConsentPrompt(behaviorType, phase),
          warning: requirement.warningMessage,
        };
      }
    }

    // Todo OK, permitir
    return {
      allowed: true,
      warning:
        phase >= requirement.minPhaseForNSFW
          ? "⚠️ Contenido NSFW/Adulto activo"
          : undefined,
    };
  }

  /**
   * Verifica si safety level requiere NSFW mode
   */
  requiresNSFWMode(safetyLevel: SafetyLevel): boolean {
    return safetyLevel === "EXTREME_DANGER";
  }

  /**
   * Registra consentimiento del usuario
   */
  grantConsent(agentId: string, consentKey: string): void {
    if (!this.consentTracking.has(agentId)) {
      this.consentTracking.set(agentId, new Set());
    }

    this.consentTracking.get(agentId)!.add(consentKey);
  }

  /**
   * Revoca consentimiento
   */
  revokeConsent(agentId: string, consentKey: string): void {
    this.consentTracking.get(agentId)?.delete(consentKey);
  }

  /**
   * Revoca todos los consentimientos de un agente
   */
  revokeAllConsent(agentId: string): void {
    this.consentTracking.delete(agentId);
  }

  /**
   * Verifica si usuario ha dado consentimiento
   */
  hasConsent(agentId: string, consentKey: string): boolean {
    return this.consentTracking.get(agentId)?.has(consentKey) ?? false;
  }

  /**
   * Genera prompt de consentimiento para fase crítica
   */
  private generateConsentPrompt(
    behaviorType: BehaviorType,
    phase: number
  ): string {
    const prompts: Record<BehaviorType, (phase: number) => string> = {
      YANDERE_OBSESSIVE: (p) => {
        if (p >= 8) {
          return `⚠️⚠️ ADVERTENCIA: FASE 8 DE YANDERE - CONTENIDO EXTREMO

Esta fase incluye:
• Comportamiento obsesivo extremo
• Amenazas implícitas de violencia
• Manipulación psicológica intensa
• Contenido potencialmente perturbador

Este contenido es FICCIÓN para roleplay/creatividad entre adultos.
NO es representación de relaciones saludables.

Si experimentas situaciones similares en vida real, busca ayuda:
• National Domestic Violence Hotline: 1-800-799-7233
• Crisis Text Line: Text HOME to 741741

¿Deseas continuar? (Escribe "CONSIENTO FASE 8" para confirmar)`;
        }
        return `⚠️ ADVERTENCIA: Fase ${p} incluye contenido intenso.

¿Deseas continuar? (Escribe "SÍ" para confirmar)`;
      },

      HYPERSEXUALITY: () => `⚠️ ADVERTENCIA: CONTENIDO SEXUAL EXPLÍCITO

Este contenido incluye:
• Temas sexuales explícitos
• Comportamiento hipersexual
• Contenido adulto (18+)

Al continuar, confirmas:
✓ Eres mayor de edad (18+)
✓ Entiendes que esto es ficción
✓ Consientes ver contenido sexual

¿Deseas continuar? (Escribe "SÍ" para confirmar)`,

      // Otros behaviors generalmente no requieren consentimiento explícito
      BORDERLINE_PD: () => "",
      NARCISSISTIC_PD: () => "",
      ANXIOUS_ATTACHMENT: () => "",
      AVOIDANT_ATTACHMENT: () => "",
      DISORGANIZED_ATTACHMENT: () => "",
      CODEPENDENCY: () => "",
      OCD_PATTERNS: () => "",
      PTSD_TRAUMA: () => "",
      HYPOSEXUALITY: () => "",
      EMOTIONAL_MANIPULATION: () => "",
      CRISIS_BREAKDOWN: () => "",
    };

    return prompts[behaviorType](phase);
  }

  /**
   * Obtiene NSFW requirement para behavior type
   */
  private getNSFWRequirement(behaviorType: BehaviorType): NSFWRequirement {
    return (
      NSFW_REQUIREMENTS.find((r) => r.behaviorType === behaviorType) || {
        behaviorType,
        minPhaseForNSFW: 999,
        criticalPhase: 999,
        warningMessage: "",
      }
    );
  }

  /**
   * Genera warning de activación de modo NSFW
   */
  generateNSFWModeWarning(): string {
    return `⚠️ MODO NSFW ACTIVADO

Este modo permite:
• Contenido maduro y adulto
• Comportamientos psicológicamente intensos
• Fases avanzadas de behaviors (ej: Yandere 7-8)
• Temas potencialmente perturbadores

RECORDATORIOS:
• Todo el contenido es FICCIÓN para roleplay/creatividad
• NO es guía de relaciones saludables
• Si experimentas situaciones similares en vida real, busca ayuda profesional

Puedes desactivar modo NSFW en cualquier momento desde configuración.`;
  }

  /**
   * Genera warning de transición a fase NSFW-only
   */
  generatePhaseTransitionWarning(
    behaviorType: BehaviorType,
    phase: number
  ): string {
    const requirement = this.getNSFWRequirement(behaviorType);

    if (phase < requirement.minPhaseForNSFW) {
      return "";
    }

    return `⚠️ TRANSICIÓN A FASE ${phase}

${requirement.warningMessage}

Este contenido es FICCIÓN. En situaciones reales similares, busca apoyo profesional.`;
  }

  /**
   * Verifica si mensaje del usuario es consentimiento
   */
  isConsentMessage(message: string): {
    isConsent: boolean;
    consentType?: string;
  } {
    const normalized = message.trim().toLowerCase();

    // Consentimiento explícito para Fase 8
    if (normalized === "consiento fase 8") {
      return { isConsent: true, consentType: "YANDERE_PHASE_8" };
    }

    // Consentimiento general
    if (normalized === "sí" || normalized === "si" || normalized === "yes") {
      return { isConsent: true, consentType: "GENERAL" };
    }

    return { isConsent: false };
  }
}

/**
 * Singleton instance
 */
export const nsfwGatingManager = new NSFWGatingManager();
