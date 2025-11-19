/**
 * useSyringes Hook
 *
 * Manages syringe/container data fetching, caching, and state management.
 */

import { useEffect, useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { DeviceDefinition } from '@medplum/fhirtypes';
import { searchSyringes } from '../services/syringeService';

interface UseSyringesOptions {
  /** Filter by syringe name */
  name?: string;
  /** Filter by status */
  status?: 'active' | 'retired';
  /** Enable auto-fetch on mount */
  autoFetch?: boolean;
}

interface UseSyringesResult {
  /** Array of syringes */
  syringes: DeviceDefinition[];
  /** Loading state */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually trigger a refresh */
  refresh: () => Promise<void>;
  /** Total count of syringes */
  count: number;
}

/**
 * Hook for fetching and managing syringe/container types
 */
export function useSyringes(options: UseSyringesOptions = {}): UseSyringesResult {
  const medplum = useMedplum();
  const [syringes, setSyringes] = useState<DeviceDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSyringes = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const results = await searchSyringes(medplum, {
        name: options.name,
        status: options.status || 'active',
        count: 100,
      });
      setSyringes(results);
    } catch (err) {
      console.error('Failed to fetch syringes:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchSyringes();
    }
  }, [options.name, options.status]);

  return {
    syringes,
    loading,
    error,
    refresh: fetchSyringes,
    count: syringes.length,
  };
}
