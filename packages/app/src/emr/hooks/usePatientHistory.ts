// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { PatientHistorySearchParams, VisitTableRow } from '../types/patient-history';
import { searchEncounters } from '../services/patientHistoryService';
import { mapEncounterToTableRow } from '../services/fhirHelpers';
import type { Encounter } from '@medplum/fhirtypes';

/**
 * Hook for managing patient history table data, search, sorting, and pagination
 *
 * Usage:
 * ```typescript
 * const {
 *   visits,
 *   loading,
 *   error,
 *   searchParams,
 *   setSearchParams,
 *   sortField,
 *   sortDirection,
 *   setSortField,
 *   setSortDirection,
 *   refresh,
 * } = usePatientHistory();
 * ```
 */
export function usePatientHistory(initialSearchParams: Partial<PatientHistorySearchParams> = {}) {
  const medplum = useMedplum();
  const [visits, setVisits] = useState<VisitTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchParams, setSearchParams] = useState<PatientHistorySearchParams>({
    insuranceCompanyId: '0', // Default to "შიდა" (Internal/Private pay)
    ...initialSearchParams,
  });

  // Sorting state
  const [sortField, setSortField] = useState<string | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  /**
   * Load visits from FHIR API
   */
  const loadVisits = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build FHIR sort parameter
      const sort = sortField ? (sortDirection === 'desc' ? `-${sortField}` : sortField) : undefined;

      // Search Encounters with filters
      const bundle = await searchEncounters(medplum, {
        ...searchParams,
        _sort: sort,
      });

      // Map FHIR resources to table rows
      const visitRows =
        bundle.entry
          ?.filter((e) => e.resource?.resourceType === 'Encounter')
          .map((e) => mapEncounterToTableRow(e.resource as Encounter, bundle)) ?? [];

      setVisits(visitRows);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load patient visits';
      setError(message);
      console.error('Error loading patient visits:', err);
    } finally {
      setLoading(false);
    }
  }, [medplum, searchParams, sortField, sortDirection]);

  /**
   * Load visits on mount and when dependencies change
   */
  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  /**
   * Toggle sort direction or change sort field
   */
  const handleSort = useCallback(
    (field: string) => {
      if (field === sortField) {
        // Toggle direction on same field
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        // New field, default to descending
        setSortField(field);
        setSortDirection('desc');
      }
    },
    [sortField]
  );

  return {
    visits,
    loading,
    error,
    searchParams,
    setSearchParams,
    sortField,
    sortDirection,
    setSortField,
    setSortDirection,
    handleSort,
    refresh: loadVisits, // Manual refresh after edits/deletions
  };
}
