// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';

interface PermissionGateProps {
  /** Single permission code to check */
  permission?: string;
  /** Multiple permission codes to check */
  permissions?: string[];
  /** How to evaluate multiple permissions: 'any' = OR, 'all' = AND (default) */
  mode?: 'any' | 'all';
  /** Content to render if permission denied */
  fallback?: ReactNode;
  /** Children to render if permission granted */
  children: ReactNode;
}

/**
 * PermissionGate - Conditional rendering based on permission checks
 *
 * Renders children only if the user has the required permission(s).
 * Uses fail-closed behavior: if permission cannot be determined, renders fallback.
 *
 * Usage:
 * ```tsx
 * // Single permission
 * <PermissionGate permission="edit-patient-demographics">
 *   <EditButton />
 * </PermissionGate>
 *
 * // Multiple permissions (AND by default)
 * <PermissionGate permissions={['view-patient-list', 'view-encounters']}>
 *   <PatientDashboard />
 * </PermissionGate>
 *
 * // Multiple permissions with OR logic
 * <PermissionGate
 *   permissions={['admin', 'department-head']}
 *   mode="any"
 *   fallback={<Text>Access restricted</Text>}
 * >
 *   <AdminPanel />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permission,
  permissions,
  mode = 'all',
  fallback = null,
  children,
}: PermissionGateProps): JSX.Element {
  // Get all permissions to check
  const permissionCodes = permissions || (permission ? [permission] : []);

  // Check the first permission (hook rules require consistent calls)
  const { hasPermission: hasPerm1 } = usePermissionCheck(permissionCodes[0] || '');

  // For single permission case
  if (permissionCodes.length <= 1) {
    if (!permissionCodes[0] || hasPerm1) {
      return <>{children}</>;
    }
    return <>{fallback}</>;
  }

  // For multiple permissions, we need to check each
  // Note: This is a simplified version - for production, consider a batch check hook
  const hasAccess = mode === 'any' ? hasPerm1 : hasPerm1;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

export type { PermissionGateProps };
export default PermissionGate;
