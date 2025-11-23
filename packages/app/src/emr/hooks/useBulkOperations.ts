// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useCallback } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { bulkDeactivate, bulkActivate, bulkAssignRole } from '../services/accountService';
import type { BulkOperationResult, BulkOperationProgress } from '../types/account-management';

export interface UseBulkOperationsReturn {
  // Selection state
  selectedIds: string[];

  // Selection actions
  selectAccount: (id: string) => void;
  deselectAccount: (id: string) => void;
  selectAll: (ids: string[]) => void;
  setSelection: (ids: string[]) => void;
  deselectAll: () => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;

  // Bulk operations
  executeBulkDeactivate: (reason?: string) => Promise<BulkOperationResult>;
  executeBulkActivate: (reason?: string) => Promise<BulkOperationResult>;
  executeBulkAssignRole: (roleCode: string) => Promise<BulkOperationResult>;

  // Operation state
  progress: BulkOperationProgress | null;
  loading: boolean;
  result: BulkOperationResult | null;
  clearResult: () => void;
}

/**
 * Hook for managing bulk operations on accounts
 *
 * Features:
 * - Selection state management (select/deselect individual or all)
 * - Execute bulk deactivate with self-exclusion
 * - Execute bulk activate
 * - Execute bulk role assignment
 * - Progress tracking via callback
 * - Result tracking with success/failure counts
 *
 * @returns Bulk operation state and handlers
 */
export function useBulkOperations(): UseBulkOperationsReturn {
  const medplum = useMedplum();

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Operation state
  const [progress, setProgress] = useState<BulkOperationProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulkOperationResult | null>(null);

  // Get current user ID for self-exclusion
  const getCurrentUserId = useCallback((): string => {
    const profile = medplum.getProfile();
    return profile?.id || '';
  }, [medplum]);

  /**
   * Select a single account
   */
  const selectAccount = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  /**
   * Deselect a single account
   */
  const deselectAccount = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
  }, []);

  /**
   * Select all accounts from provided IDs
   */
  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  /**
   * Set selection directly (replaces current selection)
   */
  const setSelection = useCallback((ids: string[]) => {
    setSelectedIds(ids);
  }, []);

  /**
   * Deselect all accounts
   */
  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  /**
   * Clear selection (alias for deselectAll)
   */
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setResult(null);
    setProgress(null);
  }, []);

  /**
   * Check if account is selected
   */
  const isSelected = useCallback((id: string): boolean => {
    return selectedIds.includes(id);
  }, [selectedIds]);

  /**
   * Toggle selection for an account
   */
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      }
      return [...prev, id];
    });
  }, []);

  /**
   * Execute bulk deactivation
   * Automatically excludes current user from deactivation
   */
  const executeBulkDeactivate = useCallback(async (reason?: string): Promise<BulkOperationResult> => {
    setLoading(true);
    setProgress(null);
    setResult(null);

    try {
      const currentUserId = getCurrentUserId();
      const operationResult = await bulkDeactivate(
        medplum,
        selectedIds,
        currentUserId,
        reason,
        (progressUpdate) => setProgress(progressUpdate)
      );

      setResult(operationResult);
      return operationResult;
    } finally {
      setLoading(false);
    }
  }, [medplum, selectedIds, getCurrentUserId]);

  /**
   * Execute bulk activation
   */
  const executeBulkActivate = useCallback(async (reason?: string): Promise<BulkOperationResult> => {
    setLoading(true);
    setProgress(null);
    setResult(null);

    try {
      const operationResult = await bulkActivate(
        medplum,
        selectedIds,
        reason,
        (progressUpdate) => setProgress(progressUpdate)
      );

      setResult(operationResult);
      return operationResult;
    } finally {
      setLoading(false);
    }
  }, [medplum, selectedIds]);

  /**
   * Execute bulk role assignment
   */
  const executeBulkAssignRole = useCallback(async (roleCode: string): Promise<BulkOperationResult> => {
    setLoading(true);
    setProgress(null);
    setResult(null);

    try {
      const operationResult = await bulkAssignRole(
        medplum,
        selectedIds,
        roleCode,
        (progressUpdate) => setProgress(progressUpdate)
      );

      setResult(operationResult);
      return operationResult;
    } finally {
      setLoading(false);
    }
  }, [medplum, selectedIds]);

  /**
   * Clear result state
   */
  const clearResult = useCallback(() => {
    setResult(null);
    setProgress(null);
  }, []);

  return {
    // Selection state
    selectedIds,

    // Selection actions
    selectAccount,
    deselectAccount,
    selectAll,
    setSelection,
    deselectAll,
    clearSelection,
    isSelected,
    toggleSelection,

    // Bulk operations
    executeBulkDeactivate,
    executeBulkActivate,
    executeBulkAssignRole,

    // Operation state
    progress,
    loading,
    result,
    clearResult,
  };
}
