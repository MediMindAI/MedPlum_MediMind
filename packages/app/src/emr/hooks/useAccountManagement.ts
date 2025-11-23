// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { useDebouncedValue } from '@mantine/hooks';
import type {
  AccountRowExtended,
  AccountSearchFiltersExtended,
  PaginationParams,
  PaginatedResponse,
  FilterPreset,
} from '../types/account-management';
import { searchAccounts } from '../services/accountService';

const FILTER_PRESETS_KEY = 'emrAccountFilterPresets';
const DEFAULT_PAGE_SIZE = 20;

interface UseAccountManagementOptions {
  /** Initial filters */
  initialFilters?: AccountSearchFiltersExtended;
  /** Initial page size (default: 20) */
  initialPageSize?: number;
  /** Debounce delay in ms (default: 500) */
  debounceDelay?: number;
}

interface UseAccountManagementReturn {
  /** Array of accounts for current page */
  accounts: AccountRowExtended[];
  /** Total number of accounts matching filters */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Loading state */
  loading: boolean;
  /** Error if any */
  error: Error | null;
  /** Current filters */
  filters: AccountSearchFiltersExtended;
  /** Update filters */
  setFilters: (filters: AccountSearchFiltersExtended) => void;
  /** Current pagination */
  pagination: PaginationParams;
  /** Update pagination */
  setPagination: (pagination: PaginationParams) => void;
  /** Change current page */
  setPage: (page: number) => void;
  /** Change page size */
  setPageSize: (pageSize: number) => void;
  /** Refresh data */
  refresh: () => void;
  /** Saved filter presets */
  presets: FilterPreset[];
  /** Save current filters as preset */
  savePreset: (name: string) => void;
  /** Delete a preset */
  deletePreset: (presetId: string) => void;
  /** Load a preset */
  loadPreset: (preset: FilterPreset) => void;
}

/**
 * Hook for managing account list with server-side pagination and filtering
 *
 * Features:
 * - Server-side pagination via searchAccounts API
 * - Debounced filter changes (500ms default)
 * - Filter preset save/load with localStorage
 * - Automatic refetch on filter/pagination changes
 *
 * @param options - Configuration options
 * @returns Account management state and actions
 *
 * @example
 * ```tsx
 * const {
 *   accounts,
 *   total,
 *   totalPages,
 *   loading,
 *   filters,
 *   setFilters,
 *   pagination,
 *   setPage,
 *   setPageSize,
 *   presets,
 *   savePreset,
 *   loadPreset,
 * } = useAccountManagement({ initialPageSize: 20 });
 * ```
 */
export function useAccountManagement(options: UseAccountManagementOptions = {}): UseAccountManagementReturn {
  const {
    initialFilters = {},
    initialPageSize = DEFAULT_PAGE_SIZE,
    debounceDelay = 500,
  } = options;

  const medplum = useMedplum();

  // State
  const [accounts, setAccounts] = useState<AccountRowExtended[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFiltersInternal] = useState<AccountSearchFiltersExtended>(initialFilters);
  const [pagination, setPaginationInternal] = useState<PaginationParams>({
    page: 1,
    pageSize: initialPageSize,
  });
  const [presets, setPresets] = useState<FilterPreset[]>([]);

  // Debounce filters
  const [debouncedFilters] = useDebouncedValue(filters, debounceDelay);

  // Load presets from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FILTER_PRESETS_KEY);
      if (stored) {
        setPresets(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load filter presets:', err);
    }
  }, []);

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<AccountRowExtended> = await searchAccounts(
        medplum,
        debouncedFilters,
        pagination
      );

      setAccounts(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch accounts:', err);
      setAccounts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [medplum, debouncedFilters, pagination]);

  // Fetch on mount and when filters/pagination change
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPaginationInternal((prev) => ({
      ...prev,
      page: 1,
    }));
  }, [debouncedFilters]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / pagination.pageSize));
  }, [total, pagination.pageSize]);

  // Actions
  const setFilters = useCallback((newFilters: AccountSearchFiltersExtended) => {
    setFiltersInternal(newFilters);
  }, []);

  const setPagination = useCallback((newPagination: PaginationParams) => {
    setPaginationInternal(newPagination);
  }, []);

  const setPage = useCallback((page: number) => {
    setPaginationInternal((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(page, totalPages)),
    }));
  }, [totalPages]);

  const setPageSize = useCallback((pageSize: number) => {
    setPaginationInternal((prev) => ({
      ...prev,
      pageSize,
      page: 1, // Reset to first page when changing page size
    }));
  }, []);

  const refresh = useCallback(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Preset management
  const savePreset = useCallback((name: string) => {
    const newPreset: FilterPreset = {
      id: `preset-${Date.now()}`,
      name,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
    };

    const newPresets = [...presets, newPreset];
    setPresets(newPresets);

    try {
      localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(newPresets));
    } catch (err) {
      console.error('Failed to save filter preset:', err);
    }
  }, [filters, presets]);

  const deletePreset = useCallback((presetId: string) => {
    const newPresets = presets.filter((p) => p.id !== presetId);
    setPresets(newPresets);

    try {
      localStorage.setItem(FILTER_PRESETS_KEY, JSON.stringify(newPresets));
    } catch (err) {
      console.error('Failed to delete filter preset:', err);
    }
  }, [presets]);

  const loadPreset = useCallback((preset: FilterPreset) => {
    setFiltersInternal(preset.filters);
  }, []);

  return {
    accounts,
    total,
    totalPages,
    loading,
    error,
    filters,
    setFilters,
    pagination,
    setPagination,
    setPage,
    setPageSize,
    refresh,
    presets,
    savePreset,
    deletePreset,
    loadPreset,
  };
}
