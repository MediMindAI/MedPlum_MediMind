// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { SpecimenDefinition } from '@medplum/fhirtypes';
import { searchSamples } from '../services/sampleService';

interface UseSamplesOptions {
  /** Filter by sample name */
  name?: string;
  /** Filter by status */
  status?: 'active' | 'retired';
  /** Enable auto-fetch on mount */
  autoFetch?: boolean;
}

interface UseSamplesResult {
  /** Array of sample types */
  samples: SpecimenDefinition[];
  /** Loading state */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually trigger a refresh */
  refresh: () => Promise<void>;
  /** Total count of samples */
  count: number;
}

/**
 * Hook for fetching and managing sample types
 * @param options
 */
export function useSamples(options: UseSamplesOptions = {}): UseSamplesResult {
  const medplum = useMedplum();
  const [samples, setSamples] = useState<SpecimenDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSamples = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const results = await searchSamples(medplum, {
        name: options.name,
        status: options.status || 'active',
        count: 100, // Fetch up to 100 samples
      });
      setSamples(results);
    } catch (err) {
      console.error('Failed to fetch samples:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchSamples();
    }
  }, [options.name, options.status]);

  return {
    samples,
    loading,
    error,
    refresh: fetchSamples,
    count: samples.length,
  };
}
