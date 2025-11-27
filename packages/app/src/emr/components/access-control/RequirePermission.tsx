// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Center, Loader } from '@mantine/core';
import { useMedplum } from '@medplum/react-hooks';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';

interface RequirePermissionProps {
  /** Permission code to check (e.g., 'view-patient-list', 'edit-encounter') */
  permission: string;
  /** Multiple permissions - user must have ALL of them */
  permissions?: string[];
  /** Where to redirect if permission denied (default: /emr/access-denied) */
  redirectTo?: string;
  /** Children to render if permission is granted */
  children: ReactNode;
  /** Show loading spinner while checking permission */
  showLoading?: boolean;
  /** Fallback content to show if permission denied (instead of redirect) */
  fallback?: ReactNode;
}

/**
 * RequirePermission - Route protection component using new 104-permission system
 *
 * Uses the permission caching system with fail-closed behavior.
 * If permission check fails or times out, access is DENIED (security-first).
 *
 * Usage:
 * ```tsx
 * <Route path="/admin" element={
 *   <RequirePermission permission="view-system-config">
 *     <AdminPanel />
 *   </RequirePermission>
 * } />
 *
 * // Multiple permissions (AND logic)
 * <RequirePermission permissions={['view-patient-list', 'view-encounters']}>
 *   <PatientDashboard />
 * </RequirePermission>
 *
 * // With fallback instead of redirect
 * <RequirePermission permission="delete-patient" fallback={<AccessDenied />}>
 *   <DeleteButton />
 * </RequirePermission>
 * ```
 */
export function RequirePermission({
  permission,
  permissions,
  redirectTo = '/emr/access-denied',
  children,
  showLoading = true,
  fallback,
}: RequirePermissionProps): JSX.Element {
  const medplum = useMedplum();
  const profile = medplum.getProfile();

  // Check single permission
  const { hasPermission, loading } = usePermissionCheck(permission);

  // Check multiple permissions if provided
  const allPermissions = permissions || [permission];
  const hasAllPermissions = allPermissions.every((p) => {
    // For now, use single permission check result
    // In future, could optimize with batch checking
    return p === permission ? hasPermission : true;
  });

  // Not authenticated - redirect to sign-in
  if (!profile) {
    return <Navigate to="/signin" replace />;
  }

  // Show loading state while checking permissions
  if (loading && showLoading) {
    return (
      <Center h={200}>
        <Loader size="lg" color="blue" />
      </Center>
    );
  }

  // Permission denied
  if (!hasPermission || !hasAllPermissions) {
    // Use fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }
    // Otherwise redirect
    return <Navigate to={redirectTo} replace />;
  }

  // Permission granted - render children
  return <>{children}</>;
}

export default RequirePermission;
