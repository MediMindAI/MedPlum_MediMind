// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { AuditLogFilters, AuditLogEntryExtended, PaginationParams } from '../types/account-management';
import { searchAuditEvents } from '../services/auditService';

/**
 * Hook result for useAuditLogs
 */
export interface UseAuditLogsResult {
  /** Array of audit log entries with display values */
  events: AuditLogEntryExtended[];
  /** Total number of audit events matching filters */
  total: number;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
  /** Current page number (1-indexed) */
  page: number;
  /** Page size */
  pageSize: number;
  /** Set page number */
  setPage: (page: number) => void;
  /** Set page size */
  setPageSize: (size: number) => void;
  /** Set filters */
  setFilters: (filters: AuditLogFilters) => void;
  /** Current filters */
  filters: AuditLogFilters;
  /** Refetch audit logs */
  refetch: () => void;
}

/**
 * Default page size for audit logs
 */
const DEFAULT_PAGE_SIZE = 20;

/**
 * Debounce delay in milliseconds
 */
const DEBOUNCE_DELAY = 500;

/**
 * Hook for fetching and managing audit logs with filtering and pagination
 *
 * Features:
 * - Server-side pagination
 * - Filter by date range, actor, action, outcome
 * - Debounced filter changes
 * - Auto-refresh capability
 *
 * @returns UseAuditLogsResult
 *
 * @example
 * ```typescript
 * const { events, loading, setFilters, setPage } = useAuditLogs();
 *
 * // Filter by date range
 * setFilters({
 *   dateFrom: new Date('2025-11-01'),
 *   dateTo: new Date('2025-11-20'),
 * });
 *
 * // Change page
 * setPage(2);
 * ```
 */
export function useAuditLogs(): UseAuditLogsResult {
  const medplum = useMedplum();
  const [events, setEvents] = useState<AuditLogEntryExtended[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState<AuditLogFilters>({});

  // Track pending filter updates for debouncing
  const pendingFiltersRef = useRef<AuditLogFilters>({});
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  /**
   * Fetch audit logs from the server
   */
  const fetchAuditLogs = useCallback(
    async (currentFilters: AuditLogFilters) => {
      setLoading(true);
      setError(null);

      try {
        const pagination: PaginationParams = {
          page,
          pageSize,
          sortDirection: 'desc',
        };

        const result = await searchAuditEvents(medplum, currentFilters, pagination);
        setEvents(result.events);
        setTotal(result.total);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch audit logs'));
        setEvents([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [medplum, page, pageSize]
  );

  /**
   * Handle filter changes with debouncing
   */
  const handleSetFilters = useCallback((newFilters: AuditLogFilters) => {
    pendingFiltersRef.current = { ...pendingFiltersRef.current, ...newFilters };

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      setFilters(pendingFiltersRef.current);
      setPage(1); // Reset to first page when filters change
    }, DEBOUNCE_DELAY);
  }, []);

  /**
   * Refetch current data
   */
  const refetch = useCallback(() => {
    fetchAuditLogs(filters);
  }, [fetchAuditLogs, filters]);

  // Initial fetch
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchAuditLogs(filters);
    }
  }, [fetchAuditLogs, filters]);

  // Fetch when filters or pagination changes (after initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      fetchAuditLogs(filters);
    }
  }, [filters, page, pageSize, fetchAuditLogs]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    events,
    total,
    loading,
    error,
    page,
    pageSize,
    setPage,
    setPageSize,
    setFilters: handleSetFilters,
    filters,
    refetch,
  };
}
