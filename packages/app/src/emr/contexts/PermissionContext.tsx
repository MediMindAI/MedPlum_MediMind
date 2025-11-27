// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useMedplum, useMedplumProfile } from '@medplum/react-hooks';
import { permissionCache } from '../services/permissionCacheService';
import { getUserPermissions } from '../services/permissionService';

/**
 * Context value provided by PermissionProvider.
 *
 * Provides permission checking functionality with preloaded cache,
 * manual refresh capability, and loading/error states.
 */
interface PermissionContextValue {
  /**
   * Check if user has a specific permission.
   *
   * Uses cached values for instant (<50ms) response.
   * Returns false (fail-closed) if permission not in cache.
   *
   * @param code - Permission code to check (e.g., 'view-patient-list')
   * @returns boolean - true if user has permission, false otherwise
   *
   * @example
   * ```typescript
   * const { checkPermission } = usePermissionContext();
   *
   * if (checkPermission('view-patient-list')) {
   *   return <PatientList />;
   * }
   * return <Alert>Access denied</Alert>;
   * ```
   */
  checkPermission: (code: string) => boolean;

  /**
   * Force refresh all permissions from server.
   *
   * Invalidates cache, fetches latest permissions, and updates cache.
   * Call this after role changes or manual permission updates.
   *
   * @returns Promise<void>
   *
   * @example
   * ```typescript
   * const { refreshPermissions } = usePermissionContext();
   *
   * async function handleRoleChange() {
   *   await assignRoleToUser(medplum, userId, 'admin');
   *   await refreshPermissions(); // Update cache with new permissions
   * }
   * ```
   */
  refreshPermissions: () => Promise<void>;

  /**
   * Whether permissions are being loaded.
   *
   * True during initial load and manual refresh.
   */
  loading: boolean;

  /**
   * Error that occurred during permission loading, if any.
   */
  error: Error | null;
}

/**
 * React Context for permission management.
 */
const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

/**
 * Props for PermissionProvider component.
 */
interface PermissionProviderProps {
  /** Child components to wrap with permission context */
  children: ReactNode;
}

/**
 * PermissionProvider - Context provider that preloads user permissions.
 *
 * Fetches all user permissions on mount and stores them in cache for fast access.
 * Provides checkPermission function and manual refresh capability.
 *
 * Features:
 * - Preloads all permissions on mount (single API call)
 * - Caches permissions with 10-second TTL (configurable)
 * - Fail-closed behavior (deny access until confirmed)
 * - Manual refresh support for role changes
 * - Loading and error states
 *
 * Usage:
 * ```typescript
 * // 1. Wrap your app with PermissionProvider
 * <PermissionProvider>
 *   <App />
 * </PermissionProvider>
 *
 * // 2. Use in components
 * function MyComponent() {
 *   const { checkPermission, loading } = usePermissionContext();
 *
 *   if (loading) return <Skeleton />;
 *
 *   return checkPermission('view-patient-list') ? (
 *     <PatientList />
 *   ) : (
 *     <Alert>Access denied</Alert>
 *   );
 * }
 * ```
 *
 * @see usePermissionContext
 */
export function PermissionProvider({ children }: PermissionProviderProps): React.ReactElement {
  const medplum = useMedplum();
  const profile = useMedplumProfile();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load all user permissions and populate cache.
   */
  const loadPermissions = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all user permissions
      const permissions = await getUserPermissions(medplum, profile.id);

      // Populate cache with all permissions
      // For permissions user has, set to true
      for (const permission of permissions) {
        permissionCache.set(permission, true);
      }

      setLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load permissions');
      console.error('[PermissionProvider] Error loading permissions:', error);
      setError(error);
      setLoading(false);
    }
  }, [medplum, profile?.id]);

  /**
   * Force refresh permissions from server.
   * Invalidates cache and reloads.
   */
  const refreshPermissions = useCallback(async () => {
    permissionCache.invalidate();
    await loadPermissions();
  }, [loadPermissions]);

  /**
   * Check if user has a permission (uses cache).
   * Returns false (fail-closed) if permission not in cache.
   */
  const checkPermission = useCallback((code: string): boolean => {
    const cached = permissionCache.get(code);
    // Fail-closed: return false if not in cache or explicitly false
    return cached === true;
  }, []);

  // Load permissions on mount
  useEffect(() => {
    loadPermissions().catch((err) => {
      console.error('[PermissionProvider] Error in loadPermissions:', err);
    });
  }, [loadPermissions]);

  const value: PermissionContextValue = {
    checkPermission,
    refreshPermissions,
    loading,
    error,
  };

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

/**
 * Hook to access permission context.
 *
 * Provides permission checking functionality with preloaded cache.
 *
 * @returns PermissionContextValue
 * @throws Error if used outside PermissionProvider
 *
 * @example
 * ```typescript
 * const { checkPermission, loading, refreshPermissions } = usePermissionContext();
 *
 * if (loading) return <Skeleton />;
 *
 * return (
 *   <div>
 *     {checkPermission('view-patient-list') && <PatientList />}
 *     {checkPermission('create-patient') && <Button>Add Patient</Button>}
 *   </div>
 * );
 * ```
 */
export function usePermissionContext(): PermissionContextValue {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissionContext must be used within a PermissionProvider');
  }
  return context;
}
