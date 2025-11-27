// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { OperatorTypeFormValues } from '../types/settings';
import { getOperatorTypes } from '../services/operatorTypeService';

interface UseOperatorTypesOptions {
  /** Enable auto-fetch on mount */
  autoFetch?: boolean;
}

interface UseOperatorTypesResult {
  /** Array of operator types */
  operatorTypes: OperatorTypeFormValues[];
  /** Loading state */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually trigger a refresh */
  refresh: () => Promise<void>;
  /** Total count of operator types */
  count: number;
}

/**
 * Hook for fetching and managing operator types
 * @param options - Configuration options
 */
export function useOperatorTypes(options: UseOperatorTypesOptions = {}): UseOperatorTypesResult {
  const medplum = useMedplum();
  const [operatorTypes, setOperatorTypes] = useState<OperatorTypeFormValues[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOperatorTypes = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const results = await getOperatorTypes(medplum);
      setOperatorTypes(results);
    } catch (err) {
      console.error('Failed to fetch operator types:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchOperatorTypes();
    }
  }, []);

  return {
    operatorTypes,
    loading,
    error,
    refresh: fetchOperatorTypes,
    count: operatorTypes.length,
  };
}
