/**
 * useOfflineSync Hook
 *
 * Hook personalizado para manejar:
 * - Auto-guardado de drafts cada 30 segundos
 * - Carga de draft al montar
 * - Indicador de sync status
 * - Detección de conexión de red
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
  saveDraft,
  loadDraft,
  clearDraft,
  getLastSyncTime,
  hasDraft,
  type CharacterDraft,
  type SyncStatus,
} from '../utils/offlineStorage';

const AUTO_SAVE_INTERVAL = 30000; // 30 segundos

export interface UseOfflineSyncOptions {
  onDraftLoaded?: (draft: Partial<CharacterDraft>) => void;
  onSaveError?: (error: Error) => void;
  autoSave?: boolean;
}

export interface UseOfflineSyncReturn {
  syncStatus: SyncStatus;
  lastSyncTime: number | null;
  isOnline: boolean;
  saveDraftNow: () => Promise<boolean>;
  clearDraftNow: () => Promise<void>;
  loadDraftNow: () => Promise<void>;
  hasDraftSaved: boolean;
}

export function useOfflineSync(
  draft: Partial<CharacterDraft>,
  options: UseOfflineSyncOptions = {}
): UseOfflineSyncReturn {
  const {
    onDraftLoaded,
    onSaveError,
    autoSave = true,
  } = options;

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('saved');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [hasDraftSaved, setHasDraftSaved] = useState(false);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDraftRef = useRef<string>('');

  // ============================================================================
  // NETWORK DETECTION
  // ============================================================================

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);

      if (state.isConnected) {
        // Cuando se reconecta, cambiar status a saved si estaba offline
        if (syncStatus === 'offline') {
          setSyncStatus('saved');
        }
      } else {
        setSyncStatus('offline');
      }
    });

    return () => unsubscribe();
  }, [syncStatus]);

  // ============================================================================
  // SAVE DRAFT FUNCTION
  // ============================================================================

  const saveDraftNow = useCallback(async (): Promise<boolean> => {
    try {
      // No guardar si el draft está vacío
      const draftString = JSON.stringify(draft);
      if (draftString === lastDraftRef.current) {
        // No hay cambios desde el último guardado
        return true;
      }

      setSyncStatus('syncing');

      const success = await saveDraft(draft);

      if (success) {
        lastDraftRef.current = draftString;
        setSyncStatus(isOnline ? 'saved' : 'offline');
        const syncTime = Date.now();
        setLastSyncTime(syncTime);
        setHasDraftSaved(true);
        return true;
      } else {
        setSyncStatus('error');
        if (onSaveError) {
          onSaveError(new Error('Failed to save draft'));
        }
        return false;
      }
    } catch (error) {
      console.error('Error in saveDraftNow:', error);
      setSyncStatus('error');
      if (onSaveError && error instanceof Error) {
        onSaveError(error);
      }
      return false;
    }
  }, [draft, isOnline, onSaveError]);

  // ============================================================================
  // LOAD DRAFT FUNCTION
  // ============================================================================

  const loadDraftNow = useCallback(async (): Promise<void> => {
    try {
      const savedDraft = await loadDraft();

      if (savedDraft && onDraftLoaded) {
        onDraftLoaded(savedDraft);
        lastDraftRef.current = JSON.stringify(savedDraft);
        setHasDraftSaved(true);
      }

      const syncTime = await getLastSyncTime();
      setLastSyncTime(syncTime);
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  }, [onDraftLoaded]);

  // ============================================================================
  // CLEAR DRAFT FUNCTION
  // ============================================================================

  const clearDraftNow = useCallback(async (): Promise<void> => {
    try {
      await clearDraft();
      lastDraftRef.current = '';
      setLastSyncTime(null);
      setHasDraftSaved(false);
      setSyncStatus('saved');
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, []);

  // ============================================================================
  // AUTO-SAVE
  // ============================================================================

  useEffect(() => {
    if (!autoSave) return;

    // Guardar inmediatamente si hay cambios
    const draftString = JSON.stringify(draft);
    if (draftString !== lastDraftRef.current && draftString !== '{}') {
      // Cancelar timer anterior
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Programar auto-guardado
      autoSaveTimerRef.current = setTimeout(() => {
        saveDraftNow();
      }, AUTO_SAVE_INTERVAL);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [draft, autoSave, saveDraftNow]);

  // ============================================================================
  // LOAD ON MOUNT
  // ============================================================================

  useEffect(() => {
    let mounted = true;

    const loadInitialDraft = async () => {
      if (!mounted) return;

      // Solo cargar una vez al montar
      const savedDraft = await loadDraft();

      if (savedDraft && onDraftLoaded && mounted) {
        onDraftLoaded(savedDraft);
        lastDraftRef.current = JSON.stringify(savedDraft);
        setHasDraftSaved(true);
      }

      const syncTime = await getLastSyncTime();
      if (mounted) {
        setLastSyncTime(syncTime);
      }

      // Verificar si hay draft guardado
      const exists = await hasDraft();
      if (mounted) {
        setHasDraftSaved(exists);
      }
    };

    loadInitialDraft();

    return () => {
      mounted = false;
    };
  }, []); // Solo ejecutar al montar, sin dependencias

  // ============================================================================
  // CLEANUP ON UNMOUNT
  // ============================================================================

  useEffect(() => {
    return () => {
      // Guardar antes de desmontar si hay cambios
      if (autoSave && lastDraftRef.current !== JSON.stringify(draft)) {
        saveDraft(draft);
      }
    };
  }, [draft, autoSave]);

  return {
    syncStatus,
    lastSyncTime,
    isOnline,
    saveDraftNow,
    clearDraftNow,
    loadDraftNow,
    hasDraftSaved,
  };
}
