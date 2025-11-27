// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useMedplum, useMedplumProfile } from '@medplum/react-hooks';
import { useState, useEffect } from 'react';
import { permissionCache } from '../services/permissionCacheService';
import { checkPermissionFromServer } from '../services/permissionService';

/**
 * Result of a permission check with loading state and error handling
 */
export interface UsePermissionCheckResult {
  /** Whether user has the permission (false until confirmed - fail-closed) */
  hasPermission: boolean;
  /** Whether the permission check is in progress */
  loading: boolean;
  /** Error that occurred during permission check, if any */
  error: Error | null;
}

/**
 * Hook to check if current user has a specific permission.
 *
 * Implements fail-closed behavior:
 * - Returns false (deny access) by default
 * - Returns false while loading
 * - Returns false on error
 * - Only returns true when permission is confirmed from cache or server
 *
 * Uses permission cache for performance (<50ms latency target).
 *
 * @param permissionCode - Permission code to check (e.g., 'view-patient-list')
 * @returns UsePermissionCheckResult with hasPermission, loading, and error
 *
 * @example
 * ```typescript
 * const { hasPermission, loading, error } = usePermissionCheck('view-patient-list');
 *
 * if (loading) return <Skeleton />;
 * if (error) return <Alert>Error checking permissions</Alert>;
 * if (!hasPermission) return <Alert>Access denied</Alert>;
 *
 * return <PatientList />;
 * ```
 */
export function usePermissionCheck(permissionCode: string): UsePermissionCheckResult {
  const medplum = useMedplum();
  const profile = useMedplumProfile();
  const [hasPermission, setHasPermission] = useState(false); // fail-closed default
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!profile?.id) {
      setHasPermission(false);
      setLoading(false);
      return;
    }

    const startTime = Date.now();

    // Check cache first
    const cached = permissionCache.get(permissionCode);
    if (cached !== null) {
      // Cache hit - use cached value
      setHasPermission(cached);
      setLoading(false);

      // Record cache hit metric
      const latency = Date.now() - startTime;
      permissionCache.recordCheck({
        hit: true,
        denied: !cached,
        latencyMs: latency,
      });

      return;
    }

    // Cache miss - fetch from server
    checkPermissionFromServer(medplum, profile.id, permissionCode)
      .then((result) => {
        // Update cache
        permissionCache.set(permissionCode, result);

        // Update state
        setHasPermission(result);
        setLoading(false);

        // Record cache miss metric
        const latency = Date.now() - startTime;
        permissionCache.recordCheck({
          hit: false,
          denied: !result,
          latencyMs: latency,
        });
      })
      .catch((err) => {
        console.error('[usePermissionCheck] Error checking permission:', err);
        setError(err);
        setHasPermission(false); // fail-closed on error
        setLoading(false);

        // Record error metric
        const latency = Date.now() - startTime;
        permissionCache.recordCheck({
          hit: false,
          denied: true,
          latencyMs: latency,
        });
      });
  }, [medplum, profile?.id, permissionCode]);

  return { hasPermission, loading, error };
}

/**
 * Backward-compatible export that returns only the boolean value.
 * This maintains compatibility with existing code that uses:
 * `const hasPermission = usePermissionCheck('code')`
 *
 * @deprecated Use the full hook result instead to handle loading and error states
 */
export function usePermissionCheckBoolean(permissionCode: string): boolean {
  const { hasPermission } = usePermissionCheck(permissionCode);
  return hasPermission;
}
