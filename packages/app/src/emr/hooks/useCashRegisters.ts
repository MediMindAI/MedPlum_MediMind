// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { CashRegisterRow, CashRegisterSearchFilters } from '../types/settings';
import { searchCashRegisters, locationToCashRegisterRow } from '../services/cashRegisterService';

/**
 * Hook for fetching and managing cash registers
 *
 * @param filters - Optional search filters
 * @returns Object with cash registers, loading state, error, and refresh function
 */
export function useCashRegisters(filters?: CashRegisterSearchFilters) {
  const medplum = useMedplum();
  const [cashRegisters, setCashRegisters] = useState<CashRegisterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Serialize filters to avoid infinite re-renders when filters object reference changes
  const filtersKey = JSON.stringify(filters);

  const fetchCashRegisters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const locations = await searchCashRegisters(medplum, filters);
      const rows = locations.map(locationToCashRegisterRow);

      setCashRegisters(rows);
    } catch (err) {
      console.error('Error fetching cash registers:', err);
      setError(err as Error);
      setCashRegisters([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medplum, filtersKey]);

  useEffect(() => {
    fetchCashRegisters();
  }, [fetchCashRegisters]);

  const refresh = useCallback(async () => {
    await fetchCashRegisters();
  }, [fetchCashRegisters]);

  return {
    cashRegisters,
    loading,
    error,
    refresh,
  };
}
