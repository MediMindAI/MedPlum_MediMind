// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { ObservationDefinition } from '@medplum/fhirtypes';
import {
  searchMedicalData,
  observationDefinitionToRow,
} from '../services/medicalDataService';
import type { MedicalDataRow, MedicalDataSearchFilters } from '../types/settings';

/**
 * Hook for fetching and managing medical data (physical or post-operative)
 *
 * @param filters - Search filters (category required)
 * @returns Medical data items, loading state, and refresh function
 */
export function useMedicalData(filters: MedicalDataSearchFilters) {
  const medplum = useMedplum();
  const [items, setItems] = useState<MedicalDataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await searchMedicalData(medplum, filters);
      const rows = results.map((item) => observationDefinitionToRow(item));
      
      // Sort by sortOrder if available, otherwise by nameKa
      rows.sort((a, b) => {
        if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
          return a.sortOrder - b.sortOrder;
        }
        return a.nameKa.localeCompare(b.nameKa, 'ka');
      });

      setItems(rows);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching medical data:', err);
    } finally {
      setLoading(false);
    }
  }, [medplum, JSON.stringify(filters)]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const refresh = useCallback(() => {
    return fetchItems();
  }, [fetchItems]);

  return {
    items,
    loading,
    error,
    refresh,
  };
}
