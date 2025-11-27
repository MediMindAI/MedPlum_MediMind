// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { CodeSystemConcept } from '@medplum/fhirtypes';
import type { UnitSearchFilters } from '../types/settings';
import { getUnits } from '../services/unitService';

interface UseUnitsResult {
  units: CodeSystemConcept[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and managing measurement units
 *
 * @param filters - Optional search filters
 * @returns Units data, loading state, error, and refresh function
 *
 * @example
 * const { units, loading, error, refresh } = useUnits({ active: true });
 */
export function useUnits(filters?: UnitSearchFilters): UseUnitsResult {
  const medplum = useMedplum();
  const [units, setUnits] = useState<CodeSystemConcept[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize filters to avoid infinite re-renders when filters object reference changes
  const filtersKey = JSON.stringify(filters);

  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const concepts = await getUnits(medplum, filters);
      setUnits(concepts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch units');
      console.error('Error fetching units:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medplum, filtersKey]);

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  return {
    units,
    loading,
    error,
    refresh: fetchUnits,
  };
}
