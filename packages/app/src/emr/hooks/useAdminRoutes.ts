// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { CodeSystemConcept } from '@medplum/fhirtypes';
import type { AdminRouteSearchFilters } from '../types/settings';
import { getAdminRoutes } from '../services/adminRouteService';

interface UseAdminRoutesResult {
  routes: CodeSystemConcept[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and managing administration routes
 *
 * @param filters - Optional search filters
 * @returns Routes data, loading state, error, and refresh function
 *
 * @example
 * const { routes, loading, error, refresh } = useAdminRoutes({ active: true });
 */
export function useAdminRoutes(filters?: AdminRouteSearchFilters): UseAdminRoutesResult {
  const medplum = useMedplum();
  const [routes, setRoutes] = useState<CodeSystemConcept[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize filters to avoid infinite re-renders when filters object reference changes
  const filtersKey = JSON.stringify(filters);

  const fetchRoutes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const concepts = await getAdminRoutes(medplum, filters);
      setRoutes(concepts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch administration routes');
      console.error('Error fetching administration routes:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medplum, filtersKey]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  return {
    routes,
    loading,
    error,
    refresh: fetchRoutes,
  };
}
