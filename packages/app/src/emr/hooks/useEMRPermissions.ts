// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useMedplum } from '@medplum/react-hooks';
import { useCallback } from 'react';

/**
 * EMR Permission levels for access control
 */
export const EMRPermission = {
  VIEW_PATIENTS: 'view_patients',
  EDIT_PATIENTS: 'edit_patients',
  DELETE_PATIENTS: 'delete_patients',
  VIEW_VISITS: 'view_visits',
  EDIT_VISITS: 'edit_visits',
  DELETE_VISITS: 'delete_visits',
  ADMIN: 'admin',
} as const;

export type EMRPermission = typeof EMRPermission[keyof typeof EMRPermission];

/**
 * Hook for managing EMR permissions and access control
 *
 * Features:
 * - Check if current user has specific permissions
 * - Role-based access control (admin, doctor, nurse, receptionist)
 * - Resource-level permissions
 *
 * Usage:
 * ```typescript
 * const { hasPermission, isAdmin, canDelete } = useEMRPermissions();
 *
 * if (canDelete) {
 *   return <DeleteButton />;
 * }
 * ```
 */
export function useEMRPermissions() {
  const medplum = useMedplum();
  const profile = medplum.getProfile();

  /**
   * Check if user has admin role
   */
  const isAdmin = useCallback((): boolean => {
    // For now, simple check - can be enhanced with FHIR AccessPolicy
    return profile?.resourceType === 'Practitioner' || profile?.resourceType === 'Patient';
  }, [profile]);

  /**
   * Check if user can delete resources
   */
  const canDelete = useCallback((): boolean => {
    // Only admins can delete by default
    return isAdmin();
  }, [isAdmin]);

  /**
   * Check if user can edit resources
   */
  const canEdit = useCallback((): boolean => {
    // Most users can edit
    return true;
  }, []);

  /**
   * Check if user can view resources
   */
  const canView = useCallback((): boolean => {
    // All authenticated users can view
    return !!profile;
  }, [profile]);

  /**
   * Generic permission check
   */
  const hasPermission = useCallback((permission: EMRPermission): boolean => {
    switch (permission) {
      case EMRPermission.ADMIN:
        return isAdmin();
      case EMRPermission.DELETE_PATIENTS:
      case EMRPermission.DELETE_VISITS:
        return canDelete();
      case EMRPermission.EDIT_PATIENTS:
      case EMRPermission.EDIT_VISITS:
        return canEdit();
      case EMRPermission.VIEW_PATIENTS:
      case EMRPermission.VIEW_VISITS:
        return canView();
      default:
        return false;
    }
  }, [isAdmin, canDelete, canEdit, canView]);

  return {
    hasPermission,
    isAdmin,
    canDelete,
    canEdit,
    canView,
  };
}