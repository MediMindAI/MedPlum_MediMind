// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect, useCallback } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { AccessPolicy } from '@medplum/fhirtypes';
import { searchRoles, getRoleUserCount } from '../services/roleService';
import type { RoleRow } from '../types/role-management';

interface UseRolesOptions {
  name?: string;
  status?: 'active' | 'inactive';
  page?: number;
  count?: number;
  autoRefresh?: boolean;
}

interface UseRolesResult {
  roles: RoleRow[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  totalCount: number;
}

/**
 * Hook for fetching and managing roles
 * @param options - Search and filter options
 * @returns Roles data with loading/error states
 */
export function useRoles(options: UseRolesOptions = {}): UseRolesResult {
  const medplum = useMedplum();
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const accessPolicies = await searchRoles(medplum, {
        name: options.name,
        status: options.status,
        count: options.count,
      });

      // Convert AccessPolicy to RoleRow with user counts
      const roleRows: RoleRow[] = await Promise.all(
        accessPolicies.map(async (policy) => {
          const roleTag = policy.meta?.tag?.find((t) => t.system === 'http://medimind.ge/role-identifier');
          const statusTag = policy.meta?.tag?.find((t) => t.system === 'http://medimind.ge/role-status');

          const userCount = await getRoleUserCount(medplum, policy.id!);

          return {
            id: policy.id!,
            code: roleTag?.code || '',
            name: roleTag?.display || '',
            description: policy.description,
            status: (statusTag?.code as 'active' | 'inactive') || 'active',
            permissionCount: policy.resource?.length || 0,
            userCount,
            createdDate: policy.meta?.lastUpdated || new Date().toISOString(),
            lastModified: policy.meta?.lastUpdated || new Date().toISOString(),
          };
        })
      );

      setRoles(roleRows);
      setTotalCount(roleRows.length);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch roles'));
    } finally {
      setLoading(false);
    }
  }, [medplum, options.name, options.status, options.count]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (options.autoRefresh) {
      const interval = setInterval(() => {
        fetchRoles();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, fetchRoles]);

  return {
    roles,
    loading,
    error,
    refresh: fetchRoles,
    totalCount,
  };
}
