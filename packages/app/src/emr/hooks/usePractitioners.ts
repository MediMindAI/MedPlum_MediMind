// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { Practitioner } from '@medplum/fhirtypes';
import { searchPractitioners, practitionersToOptions, type PractitionerOption } from '../services/practitionerService';

interface UsePractitionersResult {
  practitioners: Practitioner[];
  practitionerOptions: PractitionerOption[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to load and manage practitioners from FHIR
 */
export function usePractitioners(): UsePractitionersResult {
  const medplum = useMedplum();
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPractitioners = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const results = await searchPractitioners(medplum);
      setPractitioners(results);
    } catch (err) {
      console.error('Error loading practitioners:', err);
      setError('Failed to load practitioners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPractitioners();
  }, [medplum]);

  const practitionerOptions = practitionersToOptions(practitioners);

  return {
    practitioners,
    practitionerOptions,
    loading,
    error,
    refetch: fetchPractitioners,
  };
}
