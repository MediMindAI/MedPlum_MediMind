// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useCallback, useEffect } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { PermissionCategory } from '../types/role-management';
import type { PermissionRow, RoleConflict } from '../types/account-management';
import {
  getPermissionTree,
  getPermissionMatrix,
  updatePermissionMatrix,
  detectRoleConflicts,
  resolvePermissionDependenciesForOperation,
  getCombinedPermissions,
} from '../services/permissionService';
import { useTranslation } from './useTranslation';

/**
 * Basic hook result for permission tree (backward compatible)
 */
interface UsePermissionsBasicResult {
  categories: PermissionCategory[];
  loading: boolean;
}

/**
 * Extended hook result for permission matrix
 */
export interface UsePermissionsMatrixResult {
  /** Current permission matrix rows */
  permissions: PermissionRow[];
  /** Detected role conflicts */
  conflicts: RoleConflict[];
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Update a single permission in the matrix */
  updatePermission: (resourceType: string, operation: string, value: boolean) => void;
  /** Save all permissions to the server */
  savePermissions: () => Promise<void>;
  /** Refresh permissions from server */
  refreshPermissions: () => Promise<void>;
  /** Check if there are unsaved changes */
  hasChanges: boolean;
}

/**
 * Options for matrix-based permission management
 */
export interface UsePermissionsMatrixOptions {
  /** AccessPolicy resource ID for single role editing */
  policyId?: string;
  /** Array of AccessPolicy IDs for combined permissions preview */
  roleIds?: string[];
  /** Array of role codes for conflict detection */
  roleCodes?: string[];
}

/**
 * Hook for fetching permission tree (backward compatible)
 * @returns Permission categories with loading state
 */
export function usePermissions(): UsePermissionsBasicResult {
  const { lang } = useTranslation();
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Get permission tree for current language
    const tree = getPermissionTree(lang as 'ka' | 'en' | 'ru');
    setCategories(tree);

    setLoading(false);
  }, [lang]);

  return { categories, loading };
}

/**
 * Hook for managing role permissions using a matrix interface
 *
 * Features:
 * - Fetches permission matrix for a specific role (AccessPolicy)
 * - Supports updating individual permissions
 * - Auto-resolves permission dependencies (update requires read)
 * - Detects role conflicts
 * - Saves updated permissions back to server
 *
 * @param options - Configuration options
 * @param options.policyId - AccessPolicy resource ID (optional, for single role editing)
 * @param options.roleIds - Array of AccessPolicy IDs (optional, for combined permissions preview)
 * @param options.roleCodes - Array of role codes (optional, for conflict detection)
 * @returns UsePermissionsMatrixResult with permissions, conflicts, and actions
 *
 * @example
 * ```tsx
 * // For editing a single role's permissions
 * const { permissions, updatePermission, savePermissions } = usePermissionsMatrix({ policyId: 'role-123' });
 *
 * // For previewing combined permissions from multiple roles
 * const { permissions } = usePermissionsMatrix({ roleIds: ['role-1', 'role-2'] });
 *
 * // For detecting role conflicts
 * const { conflicts } = usePermissionsMatrix({ roleCodes: ['admin', 'billing'] });
 * ```
 */
export function usePermissionsMatrix(options: UsePermissionsMatrixOptions = {}): UsePermissionsMatrixResult {
  const medplum = useMedplum();
  const { policyId, roleIds, roleCodes } = options;

  const [permissions, setPermissions] = useState<PermissionRow[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<PermissionRow[]>([]);
  const [conflicts, setConflicts] = useState<RoleConflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Memoize array props to prevent infinite re-renders
   */
  const roleIdsKey = roleIds?.join(',') || '';
  const roleCodesKey = roleCodes?.join(',') || '';

  /**
   * Fetch permissions from server
   */
  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let matrix: PermissionRow[];

      if (policyId) {
        // Single role editing mode
        matrix = await getPermissionMatrix(medplum, policyId);
      } else if (roleIds && roleIds.length > 0) {
        // Combined permissions preview mode
        matrix = await getCombinedPermissions(medplum, roleIds);
      } else {
        // No policy or roles specified - return empty matrix
        matrix = [];
      }

      setPermissions(matrix);
      setOriginalPermissions(JSON.parse(JSON.stringify(matrix)));
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medplum, policyId, roleIdsKey]);

  /**
   * Detect role conflicts when role codes change
   */
  useEffect(() => {
    if (roleCodes && roleCodes.length > 0) {
      const detected = detectRoleConflicts(roleCodes);
      setConflicts(detected);
    } else {
      setConflicts([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleCodesKey]); // Use string key instead of array reference

  /**
   * Fetch permissions on mount or when dependencies change
   */
  useEffect(() => {
    if (policyId || roleIdsKey) {
      fetchPermissions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policyId, roleIdsKey]);

  /**
   * Update a single permission in the matrix
   * Automatically resolves dependencies (e.g., update requires read)
   */
  const updatePermission = useCallback(
    (resourceType: string, operation: string, value: boolean) => {
      setPermissions((current) => {
        // Find and update the permission
        const updated = current.map((row) => {
          if (row.resourceType === resourceType) {
            return {
              ...row,
              [operation]: value,
            };
          }
          return row;
        });

        // If enabling a permission, resolve dependencies
        if (value) {
          return resolvePermissionDependenciesForOperation(resourceType, operation, updated);
        }

        return updated;
      });
    },
    []
  );

  /**
   * Save all permissions to the server
   */
  const savePermissions = useCallback(async () => {
    if (!policyId) {
      throw new Error('Cannot save permissions without a policy ID');
    }

    setLoading(true);
    setError(null);

    try {
      await updatePermissionMatrix(medplum, policyId, permissions);
      setOriginalPermissions(JSON.parse(JSON.stringify(permissions)));
    } catch (err) {
      setError((err as Error).message || 'Failed to save permissions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [medplum, policyId, permissions]);

  /**
   * Refresh permissions from server
   */
  const refreshPermissions = useCallback(async () => {
    await fetchPermissions();
  }, [fetchPermissions]);

  /**
   * Check if there are unsaved changes
   */
  const hasChanges = JSON.stringify(permissions) !== JSON.stringify(originalPermissions);

  return {
    permissions,
    conflicts,
    loading,
    error,
    updatePermission,
    savePermissions,
    refreshPermissions,
    hasChanges,
  };
}
