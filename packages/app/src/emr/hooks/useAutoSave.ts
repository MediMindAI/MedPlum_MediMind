// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import {
  saveDraft,
  getDraft,
  createDraft,
  syncDraftToServer,
  isIndexedDBAvailable,
  type DraftData,
} from '../services/draftService';

/**
 * Options for the useAutoSave hook
 */
export interface UseAutoSaveOptions {
  /** Unique form identifier */
  formId: string;
  /** Current form data to save */
  data: Record<string, any>;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
  /** Auto-save interval in milliseconds (default: 5000 = 5 seconds) */
  intervalMs?: number;
  /** Background sync interval to FHIR server in milliseconds (default: 30000 = 30 seconds) */
  syncIntervalMs?: number;
  /** Questionnaire ID for the form */
  questionnaireId: string;
  /** Patient ID if form is associated with a patient */
  patientId?: string;
  /** Encounter ID if form is associated with an encounter */
  encounterId?: string;
  /** Callback when draft is saved locally */
  onSave?: (data: DraftData) => void;
  /** Callback when draft is synced to server */
  onSync?: (data: DraftData) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
}

/**
 * Return value from the useAutoSave hook
 */
export interface UseAutoSaveReturn {
  /** Whether a save operation is in progress */
  isSaving: boolean;
  /** Whether a sync operation is in progress */
  isSyncing: boolean;
  /** When the draft was last saved locally */
  lastSaved: Date | null;
  /** When the draft was last synced to server */
  lastSynced: Date | null;
  /** Any error that occurred during save/sync */
  error: Error | null;
  /** Force an immediate save (bypasses throttle) */
  forceSave: () => Promise<void>;
  /** Force an immediate sync to server */
  forceSync: () => Promise<void>;
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Current draft data if available */
  currentDraft: DraftData | null;
}

/** Default auto-save interval (5 seconds) */
const DEFAULT_INTERVAL_MS = 5000;
/** Default background sync interval (30 seconds) */
const DEFAULT_SYNC_INTERVAL_MS = 30000;

/**
 * Deep equality check for objects
 */
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {return true;}
  if (obj1 === null || obj2 === null) {return false;}
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {return false;}

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {return false;}

  for (const key of keys1) {
    if (!deepEqual(obj1[key], obj2[key])) {return false;}
  }

  return true;
}

/**
 * Hook for automatic form draft saving with throttling and background sync
 *
 * Features:
 * - Throttled auto-save every 5 seconds (configurable)
 * - Saves drafts to IndexedDB for offline support
 * - Background sync to FHIR server every 30 seconds (configurable)
 * - Tracks unsaved changes
 * - Force save capability
 *
 * @example
 * ```tsx
 * const {
 *   isSaving,
 *   lastSaved,
 *   hasUnsavedChanges,
 *   forceSave,
 * } = useAutoSave({
 *   formId: 'form-123',
 *   questionnaireId: 'questionnaire-456',
 *   data: formValues,
 *   enabled: true,
 *   onSave: (draft) => console.log('Draft saved:', draft),
 *   onError: (error) => console.error('Save failed:', error),
 * });
 * ```
 */
export function useAutoSave({
  formId,
  data,
  enabled = true,
  intervalMs = DEFAULT_INTERVAL_MS,
  syncIntervalMs = DEFAULT_SYNC_INTERVAL_MS,
  questionnaireId,
  patientId,
  encounterId,
  onSave,
  onSync,
  onError,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const medplum = useMedplum();

  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [currentDraft, setCurrentDraft] = useState<DraftData | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Refs for tracking state across renders
  const lastSavedDataRef = useRef<Record<string, any>>({});
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Check for IndexedDB availability
  const isDBAvailable = isIndexedDBAvailable();

  /**
   * Save draft to IndexedDB
   */
  const saveDraftLocally = useCallback(
    async (forceSync = false): Promise<void> => {
      if (!enabled || !isDBAvailable) {
        return;
      }

      // Skip if no changes since last save
      if (!forceSync && deepEqual(data, lastSavedDataRef.current)) {
        return;
      }

      setIsSaving(true);
      setError(null);

      try {
        const draft = createDraft(formId, questionnaireId, data, {
          patientId,
          encounterId,
        });

        // Preserve existing questionnaireResponseId if available
        const existingDraft = await getDraft(formId);
        if (existingDraft?.questionnaireResponseId) {
          draft.questionnaireResponseId = existingDraft.questionnaireResponseId;
        }

        await saveDraft(draft);

        if (isMountedRef.current) {
          lastSavedDataRef.current = { ...data };
          setLastSaved(draft.savedAt);
          setCurrentDraft(draft);
          setHasUnsavedChanges(false);
          onSave?.(draft);
        }
      } catch (err) {
        const saveError = err instanceof Error ? err : new Error('Failed to save draft');
        if (isMountedRef.current) {
          setError(saveError);
          onError?.(saveError);
        }
      } finally {
        if (isMountedRef.current) {
          setIsSaving(false);
        }
      }
    },
    [
      enabled,
      isDBAvailable,
      formId,
      questionnaireId,
      data,
      patientId,
      encounterId,
      onSave,
      onError,
    ]
  );

  /**
   * Sync draft to FHIR server
   */
  const syncToServer = useCallback(async (): Promise<void> => {
    if (!enabled || !isDBAvailable) {
      return;
    }

    const draft = await getDraft(formId);
    if (!draft || draft.syncedToServer) {
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const syncedDraft = await syncDraftToServer(medplum, draft);

      if (isMountedRef.current) {
        setLastSynced(new Date());
        setCurrentDraft(syncedDraft);
        onSync?.(syncedDraft);
      }
    } catch (err) {
      const syncError = err instanceof Error ? err : new Error('Failed to sync draft to server');
      if (isMountedRef.current) {
        // Don't set error for sync failures - they're not critical
        console.warn('Draft sync failed (will retry):', syncError);
      }
    } finally {
      if (isMountedRef.current) {
        setIsSyncing(false);
      }
    }
  }, [enabled, isDBAvailable, formId, medplum, onSync]);

  /**
   * Force immediate save (bypasses throttle)
   */
  const forceSave = useCallback(async (): Promise<void> => {
    // Clear pending throttled save
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    await saveDraftLocally(true);
  }, [saveDraftLocally]);

  /**
   * Force immediate sync to server
   */
  const forceSync = useCallback(async (): Promise<void> => {
    // First save locally, then sync
    await forceSave();
    await syncToServer();
  }, [forceSave, syncToServer]);

  // Track data changes
  useEffect(() => {
    if (!enabled) {return;}

    const hasChanges = !deepEqual(data, lastSavedDataRef.current);
    setHasUnsavedChanges(hasChanges);
  }, [data, enabled]);

  // Throttled auto-save effect
  useEffect(() => {
    if (!enabled || !isDBAvailable) {
      return;
    }

    // Clear any existing timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Schedule save after interval
    saveTimerRef.current = setTimeout(() => {
      saveDraftLocally();
    }, intervalMs);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [data, enabled, isDBAvailable, intervalMs, saveDraftLocally]);

  // Background sync effect
  useEffect(() => {
    if (!enabled || !isDBAvailable) {
      return;
    }

    // Set up periodic sync
    syncTimerRef.current = setInterval(() => {
      syncToServer();
    }, syncIntervalMs);

    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, [enabled, isDBAvailable, syncIntervalMs, syncToServer]);

  // Load existing draft on mount
  useEffect(() => {
    if (!enabled || !isDBAvailable) {
      return;
    }

    const loadExistingDraft = async () => {
      try {
        const existingDraft = await getDraft(formId);
        if (existingDraft && isMountedRef.current) {
          setCurrentDraft(existingDraft);
          setLastSaved(existingDraft.savedAt);
          if (existingDraft.syncedToServer) {
            setLastSynced(existingDraft.savedAt);
          }
        }
      } catch (err) {
        console.warn('Failed to load existing draft:', err);
      }
    };

    loadExistingDraft();
  }, [enabled, isDBAvailable, formId]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    isSyncing,
    lastSaved,
    lastSynced,
    error,
    forceSave,
    forceSync,
    hasUnsavedChanges,
    currentDraft,
  };
}

export default useAutoSave;
