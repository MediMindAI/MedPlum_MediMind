// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getDraft,
  getDraftsByQuestionnaire,
  deleteDraft,
  isIndexedDBAvailable,
  type DraftData,
} from '../services/draftService';

/**
 * Options for the useDraftRecovery hook
 */
export interface UseDraftRecoveryOptions {
  /** Unique form identifier */
  formId: string;
  /** Questionnaire ID for the form */
  questionnaireId: string;
  /** Patient ID if form is associated with a patient */
  patientId?: string;
  /** Whether to automatically check for drafts on mount (default: true) */
  autoCheck?: boolean;
  /** Callback when a draft is recovered */
  onRecover?: (draft: DraftData) => void;
  /** Callback when a draft is discarded */
  onDiscard?: (formId: string) => void;
}

/**
 * Return value from the useDraftRecovery hook
 */
export interface UseDraftRecoveryReturn {
  /** Whether a draft exists for this form */
  hasDraft: boolean;
  /** The draft data if available */
  draft: DraftData | null;
  /** Whether the hook is loading/checking for drafts */
  isLoading: boolean;
  /** Recover the draft (apply values to form) */
  recoverDraft: () => void;
  /** Discard the draft (delete from storage) */
  discardDraft: () => Promise<void>;
  /** Whether to show the recovery modal */
  showRecoveryModal: boolean;
  /** Set whether to show the recovery modal */
  setShowRecoveryModal: (show: boolean) => void;
  /** All drafts for this questionnaire (useful for listing) */
  relatedDrafts: DraftData[];
  /** Refresh draft data from storage */
  refreshDrafts: () => Promise<void>;
  /** Format the last saved time for display */
  formatLastSaved: (date: Date) => string;
}

/**
 * Hook for recovering auto-saved form drafts
 *
 * Features:
 * - Checks for existing drafts on mount
 * - Shows recovery modal when draft found
 * - Recover or discard draft options
 * - Lists related drafts for same questionnaire
 *
 * @example
 * ```tsx
 * const {
 *   hasDraft,
 *   draft,
 *   showRecoveryModal,
 *   setShowRecoveryModal,
 *   recoverDraft,
 *   discardDraft,
 *   formatLastSaved,
 * } = useDraftRecovery({
 *   formId: 'form-123',
 *   questionnaireId: 'questionnaire-456',
 *   onRecover: (draft) => {
 *     // Apply draft.values to form
 *     form.setValues(draft.values);
 *   },
 *   onDiscard: () => {
 *     // Draft was discarded
 *   },
 * });
 *
 * // Render recovery modal
 * {showRecoveryModal && hasDraft && (
 *   <Modal opened={showRecoveryModal} onClose={() => setShowRecoveryModal(false)}>
 *     <Text>Draft found from {formatLastSaved(draft.savedAt)}</Text>
 *     <Button onClick={recoverDraft}>Recover</Button>
 *     <Button onClick={discardDraft}>Discard</Button>
 *   </Modal>
 * )}
 * ```
 */
export function useDraftRecovery({
  formId,
  questionnaireId,
  patientId,
  autoCheck = true,
  onRecover,
  onDiscard,
}: UseDraftRecoveryOptions): UseDraftRecoveryReturn {
  const [draft, setDraft] = useState<DraftData | null>(null);
  const [relatedDrafts, setRelatedDrafts] = useState<DraftData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  const isMountedRef = useRef(true);
  const hasCheckedRef = useRef(false);

  // Check if IndexedDB is available
  const isDBAvailable = isIndexedDBAvailable();

  /**
   * Load draft from storage
   */
  const loadDraft = useCallback(async (): Promise<void> => {
    if (!isDBAvailable) {
      return;
    }

    setIsLoading(true);

    try {
      const existingDraft = await getDraft(formId);

      if (isMountedRef.current) {
        setDraft(existingDraft);

        // Show recovery modal if draft found and not yet shown
        if (existingDraft && !hasCheckedRef.current) {
          setShowRecoveryModal(true);
        }
        hasCheckedRef.current = true;
      }
    } catch (err) {
      console.warn('Failed to load draft:', err);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [formId, isDBAvailable]);

  /**
   * Load all related drafts for this questionnaire
   */
  const loadRelatedDrafts = useCallback(async (): Promise<void> => {
    if (!isDBAvailable) {
      return;
    }

    try {
      const drafts = await getDraftsByQuestionnaire(questionnaireId);

      // Filter to only show drafts for the same patient if specified
      const filtered = patientId
        ? drafts.filter((d) => d.patientId === patientId)
        : drafts;

      if (isMountedRef.current) {
        setRelatedDrafts(filtered);
      }
    } catch (err) {
      console.warn('Failed to load related drafts:', err);
    }
  }, [questionnaireId, patientId, isDBAvailable]);

  /**
   * Refresh all draft data
   */
  const refreshDrafts = useCallback(async (): Promise<void> => {
    await Promise.all([loadDraft(), loadRelatedDrafts()]);
  }, [loadDraft, loadRelatedDrafts]);

  /**
   * Recover the draft (call onRecover callback)
   */
  const recoverDraft = useCallback(() => {
    if (draft) {
      onRecover?.(draft);
      setShowRecoveryModal(false);
    }
  }, [draft, onRecover]);

  /**
   * Discard the draft (delete from storage)
   */
  const discardDraft = useCallback(async (): Promise<void> => {
    if (!isDBAvailable) {
      return;
    }

    try {
      await deleteDraft(formId);

      if (isMountedRef.current) {
        setDraft(null);
        setShowRecoveryModal(false);
        onDiscard?.(formId);

        // Refresh related drafts
        await loadRelatedDrafts();
      }
    } catch (err) {
      console.warn('Failed to discard draft:', err);
    }
  }, [formId, isDBAvailable, onDiscard, loadRelatedDrafts]);

  /**
   * Format last saved date for display
   */
  const formatLastSaved = useCallback((date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      // Format as date
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }, []);

  // Check for drafts on mount
  useEffect(() => {
    if (autoCheck && isDBAvailable) {
      refreshDrafts();
    }
  }, [autoCheck, isDBAvailable, refreshDrafts]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    hasDraft: draft !== null,
    draft,
    isLoading,
    recoverDraft,
    discardDraft,
    showRecoveryModal,
    setShowRecoveryModal,
    relatedDrafts,
    refreshDrafts,
    formatLastSaved,
  };
}

export default useDraftRecovery;
