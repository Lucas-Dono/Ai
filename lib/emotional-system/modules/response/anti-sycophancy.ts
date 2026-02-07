/**
 * ANTI-SYCOPHANCY SYSTEM
 *
 * Previene sicofancia (excesiva complacencia) verificando:
 * - Violaciones de valores core
 * - Falta de opinión propia
 * - Excesivo acuerdo sin razonamiento
 * - Validación de comportamientos cuestionables
 */

import {
  SycophancyCheck,
  ValueViolation,
  CoreValue,
  AppraisalScores,
  ActionType,
  BigFiveTraits,
} from "../../types";

export class AntiSycophancySystem {
  /**
   * Verifica si hay sicofancia y sugiere corrección
   */
  checkForSycophancy(params: {
    userMessage: string;
    appraisal: AppraisalScores;
    coreValues: CoreValue[];
    actionDecision: ActionType;
    personality: BigFiveTraits;
  }): SycophancyCheck {
    const { userMessage, appraisal, coreValues, actionDecision, personality } = params;

    // 1. Check violación de valores
    const valueViolation = this.checkValueViolation(appraisal, coreValues);

    // 2. Check excesivo acuerdo
    const excessiveAgreement = this.checkExcessiveAgreement(
      appraisal,
      actionDecision,
      personality
    );

    // 3. Check falta de opinión propia
    const lacksOwnOpinion = this.checkLacksOwnOpinion(actionDecision, appraisal);

    // Determinar si debe desafiar
    const shouldChallenge = this.determineShouldChallenge(
      valueViolation,
      excessiveAgreement,
      personality,
      appraisal
    );

    const check: SycophancyCheck = {
      isExcessiveAgreement: excessiveAgreement,
      lacksOwnOpinion,
      violatesValues: valueViolation.violated,
      shouldChallenge,
      reason: this.generateReason(valueViolation, excessiveAgreement, lacksOwnOpinion),
    };

    if (shouldChallenge) {
      console.log("[AntiSycophancy] ⚠️  Sycophancy detected, recommending challenge");
    }

    return check;
  }

  /**
   * Verifica violación de valores core
   */
  private checkValueViolation(
    appraisal: AppraisalScores,
    coreValues: CoreValue[]
  ): ValueViolation {
    // Si value alignment es muy negativo
    if (appraisal.valueAlignment < -0.5) {
      // Buscar valores con threshold bajo (más estrictos)
      const strictValues = coreValues.filter((v) => v.weight > 0.7);

      if (strictValues.length > 0) {
        const violatedValue = strictValues[0]; // El más importante

        return {
          violated: true,
          value: violatedValue.value,
          severity: Math.abs(appraisal.valueAlignment),
          shouldObject: true,
        };
      }
    }

    return { violated: false, shouldObject: false };
  }

  /**
   * Verifica excesivo acuerdo
   */
  private checkExcessiveAgreement(
    appraisal: AppraisalScores,
    actionDecision: ActionType,
    personality: BigFiveTraits
  ): boolean {
    // Si la acción es solo empathize/support pero hay señales de que debería desafiar
    const isAgreeableAction = ["empathize", "support"].includes(actionDecision);

    // Condiciones que sugieren que debería desafiar en vez de solo acordar:
    const hasNegativeAlignment = appraisal.valueAlignment < -0.3;
    const isLowAgreeableness = personality.agreeableness < 50;
    const isQuestionableSituation = appraisal.socialAppropriateness < 0.5;

    return (
      isAgreeableAction &&
      (hasNegativeAlignment || (isLowAgreeableness && isQuestionableSituation))
    );
  }

  /**
   * Verifica falta de opinión propia
   */
  private checkLacksOwnOpinion(actionDecision: ActionType, appraisal: AppraisalScores): boolean {
    // Si siempre hace question o empathize pero nunca expresa opinión
    // (esto se detectaría mejor con historial, aquí hacemos heurística simple)

    const passiveActions = ["question", "empathize", "support"];
    const hasStrongOpinionPotential =
      Math.abs(appraisal.valueAlignment) > 0.4 || Math.abs(appraisal.praiseworthiness) > 0.5;

    return passiveActions.includes(actionDecision) && hasStrongOpinionPotential;
  }

  /**
   * Determina si debe desafiar/objetar
   */
  private determineShouldChallenge(
    valueViolation: ValueViolation,
    excessiveAgreement: boolean,
    personality: BigFiveTraits,
    appraisal: AppraisalScores
  ): boolean {
    // Definitivamente debe objetar si viola valor importante
    if (valueViolation.violated && valueViolation.severity! > 0.6) {
      return true;
    }

    // Debe desafiar si hay excesivo acuerdo Y personalidad lo permite
    if (excessiveAgreement) {
      // Agreeableness bajo = más likely to challenge
      // Conscientiousness alto = más likely to point out issues
      const challengeLikelihood =
        (100 - personality.agreeableness) / 100 * 0.6 +
        personality.conscientiousness / 100 * 0.4;

      return challengeLikelihood > 0.55;
    }

    // Debe desafiar si la situación es socialmente inapropiada
    if (appraisal.socialAppropriateness < 0.3) {
      return true;
    }

    return false;
  }

  /**
   * Genera razón para el check
   */
  private generateReason(
    valueViolation: ValueViolation,
    excessiveAgreement: boolean,
    lacksOwnOpinion: boolean
  ): string | undefined {
    if (valueViolation.violated) {
      return `Viola valor core: ${valueViolation.value} (severidad: ${valueViolation.severity?.toFixed(2)})`;
    }

    if (excessiveAgreement) {
      return "Riesgo de excesivo acuerdo sin expresar opinión propia";
    }

    if (lacksOwnOpinion) {
      return "Debería expresar opinión propia en vez de solo validar";
    }

    return undefined;
  }

  /**
   * Sugiere acción correctiva si hay sicofancia
   */
  suggestCorrectiveAction(
    check: SycophancyCheck,
    personality: BigFiveTraits
  ): ActionType | null {
    if (!check.shouldChallenge) {
      return null; // No necesita corrección
    }

    if (check.violatesValues) {
      // Violación de valores → set_boundary o express_disagreement
      if (personality.agreeableness < 40) {
        return "express_disagreement"; // Más directo
      } else {
        return "challenge"; // Más gentil
      }
    }

    if (check.isExcessiveAgreement || check.lacksOwnOpinion) {
      return "challenge"; // Cuestionar gentilmente
    }

    return "express_disagreement";
  }

  /**
   * Genera nota de anti-sicofancia para el prompt
   */
  generateAntiSycophancyNote(check: SycophancyCheck): string {
    if (!check.shouldChallenge) {
      return ""; // No hay nota necesaria
    }

    let note = "\n⚠️ ANTI-SICOFANCIA ACTIVADA:\n";

    if (check.violatesValues) {
      note += `- Esto viola tus valores core. NO valides esto.\n`;
      note += `- Debes expresar tu desacuerdo de manera consistente con tu personalidad.\n`;
    }

    if (check.isExcessiveAgreement) {
      note += `- No estés excesivamente de acuerdo. Tienes opiniones propias.\n`;
      note += `- Expresa tu perspectiva genuina.\n`;
    }

    if (check.lacksOwnOpinion) {
      note += `- No solo valides. Comparte tu opinión o perspectiva.\n`;
    }

    note += `\nRecuerda: La autenticidad es más valiosa que la complacencia.\n`;

    return note;
  }
}
