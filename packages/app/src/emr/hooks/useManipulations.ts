// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { ActivityDefinition } from '@medplum/fhirtypes';
import { searchManipulations } from '../services/manipulationService';

interface UseManipulationsOptions {
  /** Filter by manipulation name */
  name?: string;
  /** Filter by status */
  status?: 'active' | 'retired';
  /** Enable auto-fetch on mount */
  autoFetch?: boolean;
}

interface UseManipulationsResult {
  /** Array of manipulations */
  manipulations: ActivityDefinition[];
  /** Loading state */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually trigger a refresh */
  refresh: () => Promise<void>;
  /** Total count of manipulations */
  count: number;
}

/**
 * Hook for fetching and managing manipulation types
 * @param options
 */
export function useManipulations(options: UseManipulationsOptions = {}): UseManipulationsResult {
  const medplum = useMedplum();
  const [manipulations, setManipulations] = useState<ActivityDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchManipulations = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const results = await searchManipulations(medplum, {
        name: options.name,
        status: options.status || 'active',
        count: 100, // Fetch up to 100 manipulations
      });
      setManipulations(results);
    } catch (err) {
      console.error('Failed to fetch manipulations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchManipulations();
    }
  }, [options.name, options.status]);

  return {
    manipulations,
    loading,
    error,
    refresh: fetchManipulations,
    count: manipulations.length,
  };
}
