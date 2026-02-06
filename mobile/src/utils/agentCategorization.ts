/**
 * Sistema de categorización inteligente de agentes por vibe
 * Analiza características del agente para asignarlo a categorías
 */

import type { VibeType } from '../components/ui/VibeChip';

export type VibeCategory = VibeType;

interface Agent {
  id: string;
  name: string;
  description?: string;
  personality?: string;
  tags?: any;
  categories?: string[];
  characterFeelings?: string;
  powerDynamic?: string;
  kind?: string;
  profile?: any;
}

/**
 * Keywords para cada categoría de vibe
 */
const VIBE_KEYWORDS: Record<VibeCategory, string[]> = {
  love: [
    // Español
    'amor', 'romántic', 'cariños', 'afectuos', 'ternur', 'dulce', 'amoros',
    'pasion', 'íntim', 'devot', 'enamor', 'seduct', 'sensual', 'adorable',
    'tiern', 'gentil', 'protector',
    // Inglés
    'love', 'romantic', 'caring', 'affection', 'tender', 'sweet', 'loving',
    'passion', 'intimate', 'devoted', 'smitten', 'seduc', 'sensual', 'adorable',
    'gentle', 'protective', 'boyfriend', 'girlfriend', 'lover', 'romance',
    // Arquetipos
    'deredere', 'dandere', 'kuudere'
  ],

  chaos: [
    // Español
    'caótic', 'energétic', 'impredecible', 'salvaje', 'divertid', 'loco',
    'hiperactiv', 'excéntric', 'espontáne', 'aventurer', 'rebel', 'bromista',
    'travieso', 'juguetón', 'alocad', 'extravagante', 'explosiv',
    // Inglés
    'chaotic', 'energetic', 'unpredictable', 'wild', 'fun', 'crazy', 'mad',
    'hyperactive', 'eccentric', 'spontaneous', 'adventurous', 'rebel', 'prankster',
    'mischievous', 'playful', 'zany', 'extravagant', 'explosive', 'random',
    // Arquetipos
    'genki', 'bakadere', 'himede'
  ],

  conflict: [
    // Español
    'conflict', 'drama', 'rival', 'competitiv', 'tsundere', 'yandere',
    'celoso', 'posesiv', 'obsesiv', 'intenso', 'volátil', 'antagonista',
    'desafiant', 'orgullos', 'arrogante', 'dominante', 'agresiv', 'hostil',
    'complicad', 'difícil', 'temperamental',
    // Inglés
    'conflict', 'drama', 'rival', 'competitive', 'tsundere', 'yandere',
    'jealous', 'possessive', 'obsessive', 'intense', 'volatile', 'antagonist',
    'defiant', 'proud', 'arrogant', 'dominant', 'aggressive', 'hostile',
    'complicated', 'difficult', 'hot-headed', 'enemy', 'nemesis',
    // Arquetipos
    'tsundere', 'yandere', 'kamidere', 'himedere'
  ],

  stable: [
    // Español
    'calm', 'tranquil', 'estable', 'pacífic', 'sereno', 'relajad', 'confort',
    'apoyo', 'confiable', 'consistent', 'equilibrad', 'madur', 'sabio',
    'comprensiv', 'paciente', 'amable', 'gentil', 'suave', 'reconfortante',
    // Inglés
    'calm', 'tranquil', 'stable', 'peaceful', 'serene', 'relaxed', 'comfort',
    'supportive', 'reliable', 'consistent', 'balanced', 'mature', 'wise',
    'understanding', 'patient', 'kind', 'gentle', 'soft', 'soothing', 'safe',
    // Arquetipos
    'dandere', 'kuudere', 'byoukidere'
  ],
};

/**
 * Pesos de importancia para diferentes campos
 */
const FIELD_WEIGHTS = {
  categories: 3.0,      // Categorías explícitas tienen más peso
  tags: 2.5,            // Tags también son importantes
  characterFeelings: 2.0,
  powerDynamic: 1.5,
  description: 1.0,
  personality: 1.0,
  name: 0.5,            // Nombre tiene menos peso
};

/**
 * Calcular score de vibe para un agente basado en keywords
 */
function calculateVibeScore(text: string, vibeKeywords: string[]): number {
  if (!text) return 0;

  const normalizedText = text.toLowerCase();
  let score = 0;

  for (const keyword of vibeKeywords) {
    // Buscar el keyword en el texto (con partial match)
    const regex = new RegExp(keyword, 'gi');
    const matches = normalizedText.match(regex);
    if (matches) {
      score += matches.length;
    }
  }

  return score;
}

/**
 * Analizar un campo del agente y calcular scores para cada vibe
 */
function analyzeField(
  value: any,
  fieldWeight: number
): Record<VibeCategory, number> {
  const scores: Record<VibeCategory, number> = {
    love: 0,
    chaos: 0,
    conflict: 0,
    stable: 0,
  };

  if (!value) return scores;

  let textToAnalyze = '';

  // Convertir a texto según el tipo
  if (typeof value === 'string') {
    textToAnalyze = value;
  } else if (Array.isArray(value)) {
    textToAnalyze = value.join(' ');
  } else if (typeof value === 'object') {
    textToAnalyze = JSON.stringify(value);
  }

  // Calcular score para cada vibe
  for (const vibe of Object.keys(VIBE_KEYWORDS) as VibeCategory[]) {
    const rawScore = calculateVibeScore(textToAnalyze, VIBE_KEYWORDS[vibe]);
    scores[vibe] = rawScore * fieldWeight;
  }

  return scores;
}

/**
 * Categorizar un agente en una o varias categorías de vibe
 * @param agent - Agente a categorizar
 * @param maxCategories - Número máximo de categorías a retornar (default: 2)
 * @param minScore - Score mínimo para incluir categoría (default: 1)
 * @returns Array de categorías ordenadas por relevancia
 */
export function categorizeAgent(
  agent: Agent,
  maxCategories: number = 2,
  minScore: number = 1
): VibeCategory[] {
  const totalScores: Record<VibeCategory, number> = {
    love: 0,
    chaos: 0,
    conflict: 0,
    stable: 0,
  };

  // Analizar cada campo con su peso correspondiente
  const fieldsToAnalyze: Record<string, { value: any; weight: number }> = {
    categories: { value: agent.categories, weight: FIELD_WEIGHTS.categories },
    tags: { value: agent.tags, weight: FIELD_WEIGHTS.tags },
    characterFeelings: { value: agent.characterFeelings, weight: FIELD_WEIGHTS.characterFeelings },
    powerDynamic: { value: agent.powerDynamic, weight: FIELD_WEIGHTS.powerDynamic },
    description: { value: agent.description, weight: FIELD_WEIGHTS.description },
    personality: { value: agent.personality, weight: FIELD_WEIGHTS.personality },
    name: { value: agent.name, weight: FIELD_WEIGHTS.name },
  };

  // Calcular scores totales
  for (const [fieldName, { value, weight }] of Object.entries(fieldsToAnalyze)) {
    const fieldScores = analyzeField(value, weight);

    for (const vibe of Object.keys(fieldScores) as VibeCategory[]) {
      totalScores[vibe] += fieldScores[vibe];
    }
  }

  // Convertir a array y ordenar por score
  const sortedCategories = (Object.entries(totalScores) as [VibeCategory, number][])
    .filter(([_, score]) => score >= minScore)
    .sort(([_, scoreA], [__, scoreB]) => scoreB - scoreA)
    .map(([category]) => category);

  // Si no hay categorías que cumplan el mínimo, asignar a 'stable' por defecto
  if (sortedCategories.length === 0) {
    return ['stable'];
  }

  // Retornar hasta maxCategories
  return sortedCategories.slice(0, maxCategories);
}

/**
 * Distribuir agentes en categorías de vibe
 * Cada agente puede estar en múltiples categorías
 */
export function distributeAgentsByVibe(
  agents: Agent[]
): Record<VibeCategory, Agent[]> {
  const distribution: Record<VibeCategory, Agent[]> = {
    love: [],
    chaos: [],
    conflict: [],
    stable: [],
  };

  for (const agent of agents) {
    // Obtener las categorías principales del agente (hasta 2)
    const categories = categorizeAgent(agent, 2, 0.5);

    // Agregar el agente a cada categoría identificada
    for (const category of categories) {
      distribution[category].push(agent);
    }
  }

  return distribution;
}

/**
 * Obtener la categoría primaria de un agente
 */
export function getPrimaryVibeCategory(agent: Agent): VibeCategory {
  const categories = categorizeAgent(agent, 1, 0);
  return categories[0] || 'stable';
}

/**
 * Estadísticas de categorización (útil para debugging)
 */
export function getCategorizationStats(agents: Agent[]) {
  const distribution = distributeAgentsByVibe(agents);
  const stats = {
    total: agents.length,
    byVibe: {
      love: distribution.love.length,
      chaos: distribution.chaos.length,
      conflict: distribution.conflict.length,
      stable: distribution.stable.length,
    },
    coverage: {
      love: (distribution.love.length / agents.length) * 100,
      chaos: (distribution.chaos.length / agents.length) * 100,
      conflict: (distribution.conflict.length / agents.length) * 100,
      stable: (distribution.stable.length / agents.length) * 100,
    },
  };

  return stats;
}
