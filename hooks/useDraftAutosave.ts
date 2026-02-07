import { useEffect, useCallback, useRef } from 'react';
import type { CharacterDraft } from '@/types/character-wizard';

/**
 * Auto-save draft to localStorage
 *
 * Features:
 * - Debounced save (500ms delay)
 * - Saves on every change
 * - Loads on mount
 * - Clears on successful creation
 * - Shows "last saved" timestamp
 */

const STORAGE_KEY = 'character-creator-draft';
const AUTOSAVE_DELAY = 500; // ms

export interface AutosaveState {
  lastSaved: Date | null;
  isSaving: boolean;
}

export function useDraftAutosave(
  draft: CharacterDraft,
  enabled: boolean = true
) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSavedRef = useRef<Date | null>(null);

  // Save to localStorage
  const saveDraft = useCallback((draftToSave: CharacterDraft) => {
    if (!enabled) return;

    try {
      const dataToSave = {
        draft: draftToSave,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      lastSavedRef.current = new Date();
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [enabled]);

  // Load from localStorage
  const loadDraft = useCallback((): CharacterDraft | null => {
    if (!enabled) return null;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const data = JSON.parse(saved);

      // Note: CharacterDraft doesn't have createdAt or lastModified fields
      // These might be legacy fields that can be safely ignored

      lastSavedRef.current = new Date(data.savedAt);
      return data.draft;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  }, [enabled]);

  // Clear draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      lastSavedRef.current = null;
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, []);

  // Auto-save on draft changes (debounced)
  useEffect(() => {
    if (!enabled) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveDraft(draft);
    }, AUTOSAVE_DELAY) as unknown as NodeJS.Timeout;

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [draft, enabled, saveDraft]);

  return {
    loadDraft,
    saveDraft,
    clearDraft,
    lastSaved: lastSavedRef.current,
  };
}

// Hook to check if there's a saved draft
export function useHasSavedDraft(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return !!saved;
  } catch {
    return false;
  }
}
