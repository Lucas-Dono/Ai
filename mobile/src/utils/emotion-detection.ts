/**
 * Emotion Detection System
 *
 * Maps character categories/genres from different sources to emotional tones
 * Provides automatic emotion detection for character customization
 */

import type { SearchResult } from '@circuitpromptai/smart-start-core';

// ============================================================================
// EMOTION TYPES
// ============================================================================

export type EmotionType =
  | 'romantic'
  | 'adventurous'
  | 'cheerful'
  | 'mysterious'
  | 'dramatic'
  | 'magical'
  | 'scientific'
  | 'dark'
  | 'heroic'
  | 'playful';

export interface Emotion {
  id: EmotionType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

// ============================================================================
// AVAILABLE EMOTIONS
// ============================================================================

export const EMOTIONS: Record<EmotionType, Emotion> = {
  romantic: {
    id: 'romantic',
    label: 'Romántico',
    description: 'Amoroso y apasionado',
    icon: '💕',
    color: '#EC4899', // Pink
  },
  adventurous: {
    id: 'adventurous',
    label: 'Aventurero',
    description: 'Emocionante y dinámico',
    icon: '⚔️',
    color: '#F59E0B', // Amber
  },
  cheerful: {
    id: 'cheerful',
    label: 'Alegre',
    description: 'Divertido y positivo',
    icon: '😄',
    color: '#FBBF24', // Yellow
  },
  mysterious: {
    id: 'mysterious',
    label: 'Misterioso',
    description: 'Intrigante y enigmático',
    icon: '🔮',
    color: '#8B5CF6', // Purple
  },
  dramatic: {
    id: 'dramatic',
    label: 'Dramático',
    description: 'Emotivo e intenso',
    icon: '🎭',
    color: '#EF4444', // Red
  },
  magical: {
    id: 'magical',
    label: 'Mágico',
    description: 'Fantástico y maravilloso',
    icon: '✨',
    color: '#A78BFA', // Light Purple
  },
  scientific: {
    id: 'scientific',
    label: 'Científico',
    description: 'Futurista y tecnológico',
    icon: '🚀',
    color: '#3B82F6', // Blue
  },
  dark: {
    id: 'dark',
    label: 'Oscuro',
    description: 'Terrorífico y sombrío',
    icon: '🌑',
    color: '#1F2937', // Dark Gray
  },
  heroic: {
    id: 'heroic',
    label: 'Heroico',
    description: 'Valiente y noble',
    icon: '🦸',
    color: '#10B981', // Green
  },
  playful: {
    id: 'playful',
    label: 'Juguetón',
    description: 'Travieso y divertido',
    icon: '🎮',
    color: '#06B6D4', // Cyan
  },
};

// ============================================================================
// CATEGORY TO EMOTION MAPPING
// ============================================================================

/**
 * Category keywords mapped to emotions
 * Keywords are case-insensitive and checked with includes()
 */
const CATEGORY_EMOTION_MAP: Record<string, EmotionType> = {
  // Romantic
  romance: 'romantic',
  love: 'romantic',
  romantic: 'romantic',
  shoujo: 'romantic',
  'slice of life': 'romantic',

  // Adventurous
  action: 'adventurous',
  adventure: 'adventurous',
  shounen: 'adventurous',
  battle: 'adventurous',
  fighting: 'adventurous',
  sports: 'adventurous',
  military: 'adventurous',

  // Cheerful
  comedy: 'cheerful',
  humor: 'cheerful',
  funny: 'cheerful',
  parody: 'cheerful',
  school: 'cheerful',

  // Mysterious
  mystery: 'mysterious',
  thriller: 'mysterious',
  detective: 'mysterious',
  psychological: 'mysterious',
  suspense: 'mysterious',
  crime: 'mysterious',

  // Dramatic
  drama: 'dramatic',
  tragedy: 'dramatic',
  melodrama: 'dramatic',
  seinen: 'dramatic',
  mature: 'dramatic',

  // Magical
  fantasy: 'magical',
  magic: 'magical',
  supernatural: 'magical',
  isekai: 'magical',
  'fairy tale': 'magical',

  // Scientific
  'sci-fi': 'scientific',
  'science fiction': 'scientific',
  mecha: 'scientific',
  cyberpunk: 'scientific',
  'space opera': 'scientific',
  futuristic: 'scientific',

  // Dark
  horror: 'dark',
  gore: 'dark',
  vampire: 'dark',
  zombie: 'dark',
  demon: 'dark',
  apocalyptic: 'dark',

  // Heroic
  superhero: 'heroic',
  hero: 'heroic',
  super: 'heroic',
  justice: 'heroic',

  // Playful
  game: 'playful',
  gaming: 'playful',
  ecchi: 'playful',
  harem: 'playful',
};

// ============================================================================
// DETECTION FUNCTIONS
// ============================================================================

/**
 * Detect emotion from category/genre string
 */
function detectEmotionFromCategory(category: string): EmotionType | null {
  const lowerCategory = category.toLowerCase().trim();

  // Check for exact or partial matches
  for (const [keyword, emotion] of Object.entries(CATEGORY_EMOTION_MAP)) {
    if (lowerCategory.includes(keyword.toLowerCase())) {
      return emotion;
    }
  }

  return null;
}

/**
 * Extract categories from SearchResult metadata based on source
 */
function extractCategories(result: SearchResult): string[] {
  const categories: string[] = [];

  if (!result.metadata) {
    return categories;
  }

  // AniList/MyAnimeList - genres array
  if (result.sourceId === 'anilist' || result.sourceId === 'myanimelist' || result.sourceId === 'jikan') {
    if (Array.isArray(result.metadata.genres)) {
      categories.push(...result.metadata.genres);
    }
    if (Array.isArray(result.metadata.tags)) {
      categories.push(...result.metadata.tags);
    }
  }

  // TMDB/Movies - genre_ids or genres array
  if (result.sourceId === 'tmdb') {
    if (Array.isArray(result.metadata.genres)) {
      categories.push(...result.metadata.genres.map((g: any) => g.name || g));
    }
    if (Array.isArray(result.metadata.genre_ids)) {
      // Map TMDB genre IDs to names (common ones)
      const genreMap: Record<number, string> = {
        28: 'Action',
        12: 'Adventure',
        16: 'Animation',
        35: 'Comedy',
        80: 'Crime',
        18: 'Drama',
        14: 'Fantasy',
        27: 'Horror',
        9648: 'Mystery',
        10749: 'Romance',
        878: 'Science Fiction',
        53: 'Thriller',
      };
      categories.push(
        ...result.metadata.genre_ids.map((id: number) => genreMap[id] || '').filter(Boolean)
      );
    }
  }

  // TVDB/TVMaze - genres array
  if ((result.sourceId as any) === 'tvdb' || (result.sourceId as any) === 'tvmaze') {
    if (Array.isArray(result.metadata.genres)) {
      categories.push(...result.metadata.genres);
    }
  }

  // IGDB/Games - genres array
  if (result.sourceId === 'igdb') {
    if (Array.isArray(result.metadata.genres)) {
      categories.push(...result.metadata.genres.map((g: any) => g.name || g));
    }
  }

  // Wikipedia - try to extract from description or metadata
  if (result.sourceId === 'wikipedia') {
    if (result.metadata.categories) {
      categories.push(...result.metadata.categories);
    }
  }

  return categories.filter(Boolean);
}

/**
 * Detect emotion from SearchResult
 *
 * Returns the detected emotion and confidence score
 */
export function detectEmotion(result: SearchResult): {
  emotion: EmotionType;
  confidence: 'high' | 'medium' | 'low';
  detectedFrom: string[];
} | null {
  const categories = extractCategories(result);

  if (categories.length === 0) {
    return null;
  }

  // Try to detect emotion from each category
  const detections: { emotion: EmotionType; category: string }[] = [];

  for (const category of categories) {
    const emotion = detectEmotionFromCategory(category);
    if (emotion) {
      detections.push({ emotion, category });
    }
  }

  if (detections.length === 0) {
    return null;
  }

  // Count emotions
  const emotionCounts = detections.reduce((acc, { emotion }) => {
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {} as Record<EmotionType, number>);

  // Get most common emotion
  const sortedEmotions = Object.entries(emotionCounts).sort(([, a], [, b]) => b - a);
  const [detectedEmotion, count] = sortedEmotions[0];

  // Determine confidence
  let confidence: 'high' | 'medium' | 'low';
  if (count >= 3) {
    confidence = 'high';
  } else if (count === 2) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    emotion: detectedEmotion as EmotionType,
    confidence,
    detectedFrom: detections.filter((d) => d.emotion === detectedEmotion).map((d) => d.category),
  };
}

/**
 * Get emotion by ID
 */
export function getEmotion(id: EmotionType): Emotion {
  return EMOTIONS[id];
}

/**
 * Get all emotions as array
 */
export function getAllEmotions(): Emotion[] {
  return Object.values(EMOTIONS);
}

/**
 * Get detection message for UI
 */
export function getDetectionMessage(
  detectedEmotion: EmotionType,
  confidence: 'high' | 'medium' | 'low'
): string {
  const emotion = EMOTIONS[detectedEmotion];

  if (confidence === 'high') {
    return `Hemos detectado que el personaje hace match con un tono **${emotion.label}** (${emotion.description})`;
  } else if (confidence === 'medium') {
    return `Este personaje parece tener un tono **${emotion.label}** (${emotion.description})`;
  } else {
    return `Sugerimos un tono **${emotion.label}** para este personaje`;
  }
}
