/**
 * Servicio de Clasificación de Vibes
 * Sistema 100% determinista basado en reglas (SIN LLM)
 * - Prioridad 1: Mapeo directo de categorías
 * - Prioridad 2: Análisis de keywords
 * - Prioridad 3: Heurística por personalityVariant
 */

import { VIBE_CONFIGS, type VibeType } from '@/lib/vibes/config';

export interface VibeClassificationResult {
  primary: VibeType;
  secondary?: VibeType;
  confidence: number;
  reasoning?: string;
}

export interface AgentToClassify {
  name: string;
  description?: string | null;
  personality?: string | null;
  personalityVariant?: string | null;
  categories?: string[];
}

// Mapeo de categorías a vibes (mayor peso)
const CATEGORY_TO_VIBE_MAP: Record<string, VibeType> = {
  // Amor y Conexión
  'romance': 'love_connection',
  'romantic': 'love_connection',
  'love': 'love_connection',
  'sensual': 'love_connection',
  'passionate': 'love_connection',

  // Aventura
  'adventure': 'adventure',
  'explorer': 'adventure',
  'traveler': 'adventure',
  'bold': 'adventure',
  'daring': 'adventure',

  // Energía Caótica
  'chaotic': 'chaotic_energy',
  'playful': 'chaotic_energy',
  'wild': 'chaotic_energy',
  'unpredictable': 'chaotic_energy',
  'funny': 'chaotic_energy',
  'comedian': 'chaotic_energy',

  // Zona de Confort
  'calm': 'comfort_zone',
  'peaceful': 'comfort_zone',
  'gentle': 'comfort_zone',
  'wise': 'comfort_zone',
  'philosopher': 'comfort_zone',
  'mentor': 'comfort_zone'
};

export class VibeClassifierService {
  /**
   * Clasifica un agente usando SOLO reglas deterministas (SIN LLM)
   * Más rápido, más barato, más predecible
   */
  static async classifyAgent(agent: AgentToClassify): Promise<VibeClassificationResult> {
    // Sistema de clasificación puramente basado en reglas
    return this.ruleBasedClassification(agent);
  }


  /**
   * Clasificación basada en reglas deterministas
   * PRIORIDAD 1: Categorías explícitas
   * PRIORIDAD 2: Keywords en descripción/personalidad
   * PRIORIDAD 3: Heurística por personalityVariant
   */
  private static ruleBasedClassification(agent: AgentToClassify): VibeClassificationResult {
    // PRIORIDAD 1: Revisar categorías del personaje
    const categoryVibe = this.getVibeFromCategories(agent.categories);
    if (categoryVibe) {
      return {
        primary: categoryVibe,
        confidence: 0.85,
        reasoning: 'Classification based on character categories'
      };
    }

    // PRIORIDAD 2: Keywords en texto
    const text = `${agent.name} ${agent.description} ${agent.personality} ${agent.personalityVariant}`.toLowerCase();

    // Contar matches por vibe
    const scores: Record<VibeType, number> = {
      chaotic_energy: 0,
      comfort_zone: 0,
      love_connection: 0,
      adventure: 0
    };

    Object.entries(VIBE_CONFIGS).forEach(([vibe, config]) => {
      config.keywords.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
          scores[vibe as VibeType]++;
        }
      });
    });

    // Ordenar por score
    const sortedVibes = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([vibe]) => vibe as VibeType);

    // Si no hay matches, usar heurística por personalityVariant
    let primary = sortedVibes[0];
    if (scores[primary] === 0) {
      primary = this.guessVibeByVariant(agent.personalityVariant);
    }

    const secondary = scores[sortedVibes[1]] > 0 ? sortedVibes[1] : undefined;
    const maxScore = scores[primary];
    const confidence = maxScore > 0 ? Math.min(0.3 + (maxScore * 0.1), 0.9) : 0.5;

    return {
      primary,
      secondary,
      confidence,
      reasoning: 'Fallback classification based on keywords'
    };
  }

  /**
   * Obtener vibe basado en categorías del personaje
   */
  private static getVibeFromCategories(categories?: string[]): VibeType | null {
    if (!categories || categories.length === 0) return null;

    // Buscar la primera categoría que tenga un mapeo directo
    for (const category of categories) {
      const categoryLower = category.toLowerCase();
      if (CATEGORY_TO_VIBE_MAP[categoryLower]) {
        return CATEGORY_TO_VIBE_MAP[categoryLower];
      }
    }

    return null;
  }

  /**
   * Adivinar vibe por personalityVariant
   */
  private static guessVibeByVariant(variant?: string | null): VibeType {
    if (!variant) return 'comfort_zone';

    const variantLower = variant.toLowerCase();

    if (variantLower.includes('playful') || variantLower.includes('chaotic')) {
      return 'chaotic_energy';
    }
    if (variantLower.includes('romantic') || variantLower.includes('sensual')) {
      return 'love_connection';
    }
    if (variantLower.includes('extroverted') || variantLower.includes('adventurous')) {
      return 'adventure';
    }

    return 'comfort_zone'; // Default
  }

  /**
   * Clasificar múltiples agentes en batch
   */
  static async classifyBatch(
    agents: AgentToClassify[],
    onProgress?: (current: number, total: number) => void
  ): Promise<Map<string, VibeClassificationResult>> {
    const results = new Map<string, VibeClassificationResult>();

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];

      try {
        const result = await this.classifyAgent(agent);
        results.set(agent.name, result);

        if (onProgress) {
          onProgress(i + 1, agents.length);
        }

        // Pequeño delay para no saturar el LLM
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error classifying ${agent.name}:`, error);
      }
    }

    return results;
  }
}
