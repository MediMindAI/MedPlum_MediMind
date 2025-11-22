// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { ServiceSearchParams, ServiceTableRow } from '../types/nomenclature';
import { searchServices } from '../services/nomenclatureService';
import { mapActivityDefinitionToTableRow } from '../services/nomenclatureHelpers';
import type { ActivityDefinition } from '@medplum/fhirtypes';

/**
 * Hook for managing nomenclature (medical services) table data, search, sorting, and pagination
 *
 * Usage:
 * ```typescript
 * const {
 *   services,
 *   loading,
 *   error,
 *   searchParams,
 *   totalCount,
 *   page,
 *   sortField,
 *   sortOrder,
 *   searchServices,
 *   refreshServices,
 *   clearFilters,
 *   setSearchParam,
 *   setSorting,
 *   setPage,
 * } = useNomenclature();
 * ```
 * @param initialSearchParams
 */
export function useNomenclature(initialSearchParams: Partial<ServiceSearchParams> = {}) {
  const medplum = useMedplum();
  const [services, setServices] = useState<ServiceTableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Search and filter state
  const [searchParams, setSearchParams] = useState<ServiceSearchParams>({
    status: 'active', // Default to active services only
    page: 1,
    count: 100, // 100 services per page
    sortField: 'title',
    sortOrder: 'asc',
    ...initialSearchParams,
  });

  // Sorting state
  const [sortField, setSortFieldState] = useState<string>(initialSearchParams.sortField || 'title');
  const [sortOrder, setSortOrderState] = useState<'asc' | 'desc'>(initialSearchParams.sortOrder || 'asc');

  // Pagination state
  const [page, setPageState] = useState<number>(initialSearchParams.page || 1);

  /**
   * Load services from FHIR API
   */
  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Search ActivityDefinitions with filters
      const bundle = await searchServices(medplum, {
        ...searchParams,
        sortField: sortField,
        sortOrder: sortOrder,
        page: page,
      });

      // Map FHIR resources to table rows
      const serviceRows =
        bundle.entry
          ?.filter((e) => e.resource?.resourceType === 'ActivityDefinition')
          .map((e) => mapActivityDefinitionToTableRow(e.resource as ActivityDefinition)) ?? [];

      setServices(serviceRows);
      setTotalCount(bundle.total || serviceRows.length);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load medical services';
      setError(message);
      console.error('Error loading medical services:', err);
    } finally {
      setLoading(false);
    }
  }, [medplum, searchParams, sortField, sortOrder, page]);

  /**
   * Load services on mount and when dependencies change
   */
  useEffect(() => {
    loadServices();
  }, [loadServices]);

  /**
   * Search services with given parameters
   */
  const handleSearchServices = useCallback(
    async (params: ServiceSearchParams) => {
      setSearchParams({ ...searchParams, ...params });
      setPageState(1); // Reset to first page on new search
    },
    [searchParams]
  );

  /**
   * Refresh current search (manual reload after edits/deletions)
   */
  const refreshServices = useCallback(async () => {
    await loadServices();
  }, [loadServices]);

  /**
   * Clear all filters and reset to defaults
   */
  const clearFilters = useCallback(() => {
    setSearchParams({
      status: 'active',
      page: 1,
      count: 100, // 100 services per page
      sortField: 'code',
      sortOrder: 'asc',
    });
    setPageState(1);
    setSortFieldState('code');
    setSortOrderState('asc');
  }, []);

  /**
   * Update a single search parameter
   */
  const setSearchParam = useCallback(
    (key: keyof ServiceSearchParams, value: any) => {
      setSearchParams((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  /**
   * Update sorting configuration
   */
  const setSorting = useCallback((field: string, order: 'asc' | 'desc') => {
    setSortFieldState(field);
    setSortOrderState(order);
    setSearchParams((prev) => ({ ...prev, sortField: field, sortOrder: order }));
  }, []);

  /**
   * Toggle sort direction or change sort field
   */
  const handleSort = useCallback(
    (field: string) => {
      if (field === sortField) {
        // Toggle direction on same field
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSorting(field, newOrder);
      } else {
        // New field, default to ascending
        setSorting(field, 'asc');
      }
    },
    [sortField, sortOrder, setSorting]
  );

  /**
   * Change current page
   */
  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
    setSearchParams((prev) => ({ ...prev, page: newPage }));
  }, []);

  return {
    services,
    loading,
    error,
    searchParams,
    totalCount,
    page,
    sortField,
    sortOrder,
    searchServices: handleSearchServices,
    refreshServices,
    clearFilters,
    setSearchParam,
    setSorting,
    handleSort,
    setPage,
  };
}
