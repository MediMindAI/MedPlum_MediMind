// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useMedplum } from '@medplum/react-hooks';
import { useEMRPermissions, EMRPermission } from '../../hooks/useEMRPermissions';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requiredPermission?: EMRPermission;
}

/**
 * Protected route component that redirects to sign-in if not authenticated
 * Optionally requires admin permissions or specific EMR permissions
 */
export function ProtectedRoute({
  children,
  requireAdmin = false,
  requiredPermission
}: ProtectedRouteProps): JSX.Element {
  const medplum = useMedplum();
  const profile = medplum.getProfile();
  const { hasPermission, isAdmin } = useEMRPermissions();

  // Not authenticated - redirect to sign-in
  if (!profile) {
    return <Navigate to="/signin" replace />;
  }

  // Check for specific permission if provided
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/emr" replace />;
  }

  // Admin required but user is not admin
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/emr" replace />;
  }

  return <>{children}</>;
}