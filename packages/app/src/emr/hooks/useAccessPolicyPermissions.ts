// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useCallback, useEffect, useRef } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type { AccessPolicy } from '@medplum/fhirtypes';
import {
  accessPolicyToPermissions,
  permissionsToAccessPolicy,
} from '../services/permissionService';

/**
 * Result from useAccessPolicyPermissions hook
 */
export interface UseAccessPolicyPermissionsResult {
  /** Selected EMR permission codes */
  selectedPermissions: string[];
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether there are unsaved changes */
  hasChanges: boolean;
  /** Toggle a single permission */
  togglePermission: (permissionCode: string, value: boolean) => void;
  /** Save permissions to the AccessPolicy */
  savePermissions: () => Promise<void>;
  /** Refresh permissions from server */
  refreshPermissions: () => Promise<void>;
  /** Set all permissions (for bulk operations) */
  setPermissions: (permissions: string[]) => void;
}

/**
 * Hook for managing role permissions using EMR permission codes
 *
 * Converts between FHIR AccessPolicy format and 104 EMR permission codes.
 *
 * Features:
 * - Loads permissions from AccessPolicy and converts to EMR codes
 * - Supports toggling individual permissions
 * - Saves permissions back to AccessPolicy in FHIR format
 * - Tracks unsaved changes
 *
 * @param policyId - AccessPolicy resource ID to edit
 * @returns UseAccessPolicyPermissionsResult with permissions and actions
 *
 * @example
 * ```tsx
 * const {
 *   selectedPermissions,
 *   togglePermission,
 *   savePermissions,
 *   hasChanges
 * } = useAccessPolicyPermissions('accesspolicy-123');
 *
 * // Toggle permission
 * togglePermission('view-patient-list', true);
 *
 * // Save
 * await savePermissions();
 * ```
 */
export function useAccessPolicyPermissions(policyId?: string): UseAccessPolicyPermissionsResult {
  const medplum = useMedplum();

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessPolicy, setAccessPolicy] = useState<AccessPolicy | null>(null);

  // Track if we've loaded
  const loadedPolicyIdRef = useRef<string | undefined>(undefined);

  /**
   * Fetch permissions from server
   */
  const fetchPermissions = useCallback(async () => {
    if (!policyId) {
      setSelectedPermissions([]);
      setOriginalPermissions([]);
      setAccessPolicy(null);
      return;
    }

    // Avoid refetching if already loaded for this policy
    if (loadedPolicyIdRef.current === policyId && accessPolicy) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch the AccessPolicy
      const policy = await medplum.readResource('AccessPolicy', policyId);
      setAccessPolicy(policy);
      loadedPolicyIdRef.current = policyId;

      // Convert to EMR permission codes
      const permissions = accessPolicyToPermissions(policy);
      setSelectedPermissions(permissions);
      setOriginalPermissions([...permissions]);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch permissions');
      setSelectedPermissions([]);
      setOriginalPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [medplum, policyId, accessPolicy]);

  /**
   * Toggle a single permission
   */
  const togglePermission = useCallback((permissionCode: string, value: boolean) => {
    setSelectedPermissions((prev) => {
      if (value) {
        // Add permission if not already present
        if (!prev.includes(permissionCode)) {
          return [...prev, permissionCode];
        }
        return prev;
      } else {
        // Remove permission
        return prev.filter((p) => p !== permissionCode);
      }
    });
  }, []);

  /**
   * Set all permissions (for bulk operations)
   */
  const setPermissions = useCallback((permissions: string[]) => {
    setSelectedPermissions(permissions);
  }, []);

  /**
   * Save permissions to server
   */
  const savePermissions = useCallback(async () => {
    if (!policyId || !accessPolicy) {
      throw new Error('No AccessPolicy selected');
    }

    setLoading(true);
    setError(null);

    try {
      // Convert EMR permissions to AccessPolicy resources
      const resources = permissionsToAccessPolicy(selectedPermissions);

      // Update the AccessPolicy
      const updatedPolicy: AccessPolicy = {
        ...accessPolicy,
        resource: resources,
      };

      await medplum.updateResource(updatedPolicy);

      // Update original permissions to mark as saved
      setOriginalPermissions([...selectedPermissions]);
      setAccessPolicy(updatedPolicy);
    } catch (err) {
      setError((err as Error).message || 'Failed to save permissions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [medplum, policyId, accessPolicy, selectedPermissions]);

  /**
   * Refresh permissions from server
   */
  const refreshPermissions = useCallback(async () => {
    loadedPolicyIdRef.current = undefined; // Force reload
    await fetchPermissions();
  }, [fetchPermissions]);

  /**
   * Check if there are unsaved changes
   */
  const hasChanges = (() => {
    if (selectedPermissions.length !== originalPermissions.length) {
      return true;
    }
    const sorted1 = [...selectedPermissions].sort();
    const sorted2 = [...originalPermissions].sort();
    return sorted1.some((p, i) => p !== sorted2[i]);
  })();

  // Fetch permissions when policyId changes
  useEffect(() => {
    if (policyId !== loadedPolicyIdRef.current) {
      fetchPermissions();
    }
  }, [policyId, fetchPermissions]);

  return {
    selectedPermissions,
    loading,
    error,
    hasChanges,
    togglePermission,
    savePermissions,
    refreshPermissions,
    setPermissions,
  };
}

export default useAccessPolicyPermissions;
