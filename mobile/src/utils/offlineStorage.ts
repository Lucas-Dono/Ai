/**
 * Offline Storage Utility
 *
 * Sistema de almacenamiento local con AsyncStorage para:
 * - Auto-guardado de drafts cada 30 segundos
 * - Carga automática al iniciar
 * - Indicador de sync status
 * - Manejo de reconexión
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  CHARACTER_DRAFT: '@character_draft',
  LAST_SYNC: '@last_sync',
};

export type SyncStatus = 'saved' | 'syncing' | 'error' | 'offline';

export interface CharacterDraft {
  // Basic Info
  description: string;
  name: string;
  age: string;
  gender: 'male' | 'female' | 'non-binary' | '';
  origin: string;
  avatarUrl: string | null;

  // Appearance
  physicalAppearance: string;

  // Voice
  selectedVoiceId?: string;
  selectedVoiceName?: string;

  // Biography
  biographyEvents: any[];

  // Personality
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;

  // Advanced Personality
  facets: Record<string, number>;
  darkTriad: {
    machiavellianism: number;
    narcissism: number;
    psychopathy: number;
  };
  attachment: {
    style: 'secure' | 'anxious' | 'avoidant' | 'fearful-avoidant';
    anxiety: number;
    avoidance: number;
  };
  psychologicalNeeds: {
    connection: number;
    autonomy: number;
    competence: number;
    novelty: number;
  };

  // Profession
  occupation: string;
  skills: string[];

  // Relationships
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed' | 'complicated' | '';
  relationshipNodes: any[];

  // Settings
  depthLevel: 'basic' | 'realistic' | 'ultra';
  isPublic: boolean;

  // Metadata
  lastModified: number;
}

// ============================================================================
// SAVE DRAFT
// ============================================================================

export async function saveDraft(draft: Partial<CharacterDraft>): Promise<boolean> {
  try {
    const draftWithTimestamp = {
      ...draft,
      lastModified: Date.now(),
    };

    await AsyncStorage.setItem(
      STORAGE_KEYS.CHARACTER_DRAFT,
      JSON.stringify(draftWithTimestamp)
    );

    await AsyncStorage.setItem(
      STORAGE_KEYS.LAST_SYNC,
      Date.now().toString()
    );

    return true;
  } catch (error) {
    console.error('Error saving draft:', error);
    return false;
  }
}

// ============================================================================
// LOAD DRAFT
// ============================================================================

export async function loadDraft(): Promise<Partial<CharacterDraft> | null> {
  try {
    const draftJson = await AsyncStorage.getItem(STORAGE_KEYS.CHARACTER_DRAFT);

    if (!draftJson) {
      return null;
    }

    const draft = JSON.parse(draftJson);
    return draft;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
}

// ============================================================================
// CLEAR DRAFT
// ============================================================================

export async function clearDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CHARACTER_DRAFT);
    await AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
  } catch (error) {
    console.error('Error clearing draft:', error);
  }
}

// ============================================================================
// GET LAST SYNC TIME
// ============================================================================

export async function getLastSyncTime(): Promise<number | null> {
  try {
    const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error('Error getting last sync time:', error);
    return null;
  }
}

// ============================================================================
// CHECK IF DRAFT EXISTS
// ============================================================================

export async function hasDraft(): Promise<boolean> {
  try {
    const draft = await AsyncStorage.getItem(STORAGE_KEYS.CHARACTER_DRAFT);
    return draft !== null;
  } catch (error) {
    console.error('Error checking draft:', error);
    return false;
  }
}
