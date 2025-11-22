// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { ObservationDefinition } from '@medplum/fhirtypes';
import { searchResearchComponents } from '../services/researchComponentService';
import type { ComponentSearchFilters } from '../types/laboratory';

interface UseResearchComponentsOptions extends Partial<ComponentSearchFilters> {
  /** Enable auto-fetch on mount */
  autoFetch?: boolean;
}

interface UseResearchComponentsResult {
  /** Array of research components */
  components: ObservationDefinition[];
  /** Loading state */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually trigger a refresh */
  refresh: () => Promise<void>;
  /** Total count of components */
  count: number;
}

/**
 * Hook for fetching and managing research component types
 * @param options
 */
export function useResearchComponents(options: UseResearchComponentsOptions = {}): UseResearchComponentsResult {
  const medplum = useMedplum();
  const [components, setComponents] = useState<ObservationDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComponents = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const results = await searchResearchComponents(medplum, {
        code: options.code,
        gisCode: options.gisCode,
        name: options.parameterName,
        type: options.type,
        unit: options.unit,
        status: options.status || 'active',
        count: 100,
      });
      setComponents(results);
    } catch (err) {
      console.error('Failed to fetch research components:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchComponents();
    }
  }, [options.code, options.gisCode, options.parameterName, options.type, options.unit, options.status]);

  return {
    components,
    loading,
    error,
    refresh: fetchComponents,
    count: components.length,
  };
}
