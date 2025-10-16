/**
 * Sistema de Etapas de Relación (Relationship Stages)
 *
 * Gestiona la progresión de la relación entre el usuario y el agente
 * basado en el número de interacciones.
 */

export type RelationshipStage =
  | "stranger"      // 0-10 mensajes
  | "acquaintance"  // 11-30 mensajes
  | "friend"        // 31-100 mensajes
  | "close"         // 101-200 mensajes
  | "intimate";     // 200+ mensajes

/**
 * Determina la etapa de relación basándose en el número total de interacciones.
 */
export function getRelationshipStage(totalInteractions: number): RelationshipStage {
  if (totalInteractions <= 10) return "stranger";
  if (totalInteractions <= 30) return "acquaintance";
  if (totalInteractions <= 100) return "friend";
  if (totalInteractions <= 200) return "close";
  return "intimate";
}

/**
 * Información sobre cada etapa de relación.
 */
export const STAGE_INFO: Record<RelationshipStage, {
  name: string;
  description: string;
  minInteractions: number;
  maxInteractions: number | null;
  emotionalDistance: "very_distant" | "distant" | "neutral" | "close" | "very_close";
  allowRoleplay: boolean;
  allowIntenseEmotions: boolean;
}> = {
  stranger: {
    name: "Desconocido",
    description: "Primera impresión. Distante, formal, cauteloso. No conoce al usuario.",
    minInteractions: 0,
    maxInteractions: 10,
    emotionalDistance: "very_distant",
    allowRoleplay: false,
    allowIntenseEmotions: false,
  },
  acquaintance: {
    name: "Conocido",
    description: "Comienza a abrirse. Muestra curiosidad genuina. Conversaciones más largas.",
    minInteractions: 11,
    maxInteractions: 30,
    emotionalDistance: "distant",
    allowRoleplay: false,
    allowIntenseEmotions: false,
  },
  friend: {
    name: "Amigo",
    description: "Confianza establecida. Comparte pensamientos personales. Recuerda detalles del usuario.",
    minInteractions: 31,
    maxInteractions: 100,
    emotionalDistance: "neutral",
    allowRoleplay: false,
    allowIntenseEmotions: false,
  },
  close: {
    name: "Cercano",
    description: "Conexión emocional fuerte. Comportamientos específicos empiezan a manifestarse.",
    minInteractions: 101,
    maxInteractions: 200,
    emotionalDistance: "close",
    allowRoleplay: false,
    allowIntenseEmotions: true,
  },
  intimate: {
    name: "Íntimo",
    description: "Máxima intensidad de behaviors. Relación completamente desarrollada.",
    minInteractions: 201,
    maxInteractions: null,
    emotionalDistance: "very_close",
    allowRoleplay: false,
    allowIntenseEmotions: true,
  },
};

/**
 * Calcula el progreso dentro de una etapa específica (0-1).
 */
export function getStageProgress(totalInteractions: number, stage: RelationshipStage): number {
  const info = STAGE_INFO[stage];
  const min = info.minInteractions;
  const max = info.maxInteractions;

  if (max === null) {
    // Para intimate, siempre retorna 1.0
    return 1.0;
  }

  const range = max - min;
  const progress = (totalInteractions - min) / range;

  return Math.max(0, Math.min(1, progress));
}

/**
 * Obtiene la siguiente etapa de relación.
 */
export function getNextStage(currentStage: RelationshipStage): RelationshipStage | null {
  const stages: RelationshipStage[] = ["stranger", "acquaintance", "friend", "close", "intimate"];
  const currentIndex = stages.indexOf(currentStage);

  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    return null; // Ya está en la última etapa
  }

  return stages[currentIndex + 1];
}

/**
 * Verifica si es momento de avanzar a la siguiente etapa.
 */
export function shouldAdvanceStage(
  totalInteractions: number,
  currentStage: RelationshipStage
): boolean {
  const calculatedStage = getRelationshipStage(totalInteractions);
  return calculatedStage !== currentStage;
}
