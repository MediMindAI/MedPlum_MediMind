/**
 * useAccountList Hook
 *
 * Fetches and manages practitioner account list with pagination and search
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { Practitioner, PractitionerRole } from '@medplum/fhirtypes';
import type { AccountRow, AccountSearchFilters } from '../types/account-management';
import { searchPractitioners } from '../services/accountService';
import { practitionerToAccountRow } from '../services/accountHelpers';
import { useDebouncedValue } from '@mantine/hooks';

/**
 * Hook for fetching and managing account list
 *
 * Features:
 * - Cursor-based pagination (50 accounts per page)
 * - Search filtering (name, email, status)
 * - Debounced search (500ms)
 * - Auto-refresh capability
 * - Loading and error states
 *
 * @returns Account list state and control functions
 *
 * @example
 * const { accounts, loading, setFilters, refresh } = useAccountList();
 */
export function useAccountList() {
  const medplum = useMedplum();
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<AccountSearchFilters>({});

  // Debounce filters to reduce API calls (500ms delay)
  const [debouncedFilters] = useDebouncedValue(filters, 500);

  /**
   * Fetch accounts from server
   */
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const practitioners = await searchPractitioners(medplum, debouncedFilters);

      // Convert Practitioner resources to AccountRow format
      const accountRows = practitioners.map((practitioner) =>
        practitionerToAccountRow(practitioner)
      );

      setAccounts(accountRows);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch accounts:', err);
    } finally {
      setLoading(false);
    }
  }, [medplum, debouncedFilters]);

  /**
   * Refresh account list
   */
  const refresh = useCallback(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Fetch accounts on mount and when filters change
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    loading,
    error,
    filters,
    setFilters,
    refresh,
  };
}
