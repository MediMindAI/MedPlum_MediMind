// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { Organization } from '@medplum/fhirtypes';
import type { DepartmentRow, DepartmentSearchFilters } from '../types/settings';
import { searchDepartments, organizationToDepartmentRow } from '../services/departmentService';

interface UseDepartmentsResult {
  departments: DepartmentRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and managing departments
 *
 * @param filters - Optional search filters
 * @returns Departments data, loading state, error, and refresh function
 *
 * @example
 * const { departments, loading, error, refresh } = useDepartments({ active: true });
 */
export function useDepartments(filters?: DepartmentSearchFilters): UseDepartmentsResult {
  const medplum = useMedplum();
  const [departments, setDepartments] = useState<DepartmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize filters to avoid infinite re-renders when filters object reference changes
  const filtersKey = JSON.stringify(filters);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const orgs = await searchDepartments(medplum, filters);

      // Convert to rows (pass all departments for parent name resolution)
      const rows = orgs.map((org) => organizationToDepartmentRow(org, orgs));

      setDepartments(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch departments');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medplum, filtersKey]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return {
    departments,
    loading,
    error,
    refresh: fetchDepartments,
  };
}
