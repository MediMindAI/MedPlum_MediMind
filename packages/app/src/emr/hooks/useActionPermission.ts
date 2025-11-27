// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { usePermissionCheck } from './usePermissionCheck';

/**
 * Result of checking CRUD permissions for a resource type
 */
export interface ActionPermissionResult {
  /** Whether user can view/read the resource */
  canView: boolean;
  /** Whether user can create new instances of the resource */
  canCreate: boolean;
  /** Whether user can edit/update the resource */
  canEdit: boolean;
  /** Whether user can delete the resource */
  canDelete: boolean;
  /** Whether any permission check is still in progress */
  loading: boolean;
}

/**
 * Hook to check CRUD permissions for a resource type.
 *
 * Uses permission naming convention:
 * - view-{resource} - Read/view permission
 * - create-{resource} - Create permission
 * - edit-{resource} - Update/edit permission
 * - delete-{resource} - Delete permission
 *
 * Implements fail-closed behavior:
 * - All permissions default to false
 * - Permissions remain false while loading
 * - Permissions remain false on error
 *
 * @param resourceCode - Resource code like 'patient', 'encounter', 'invoice'
 * @returns Object with canView, canCreate, canEdit, canDelete, loading
 *
 * @example
 * ```typescript
 * const { canView, canCreate, canEdit, canDelete, loading } = useActionPermission('patient');
 *
 * if (loading) return <Skeleton />;
 *
 * return (
 *   <div>
 *     {canView && <PatientList />}
 *     {canCreate && <Button onClick={createPatient}>Create</Button>}
 *     {canEdit && <Button onClick={editPatient}>Edit</Button>}
 *     {canDelete && <Button onClick={deletePatient}>Delete</Button>}
 *   </div>
 * );
 * ```
 */
export function useActionPermission(resourceCode: string): ActionPermissionResult {
  const viewCheck = usePermissionCheck(`view-${resourceCode}`);
  const createCheck = usePermissionCheck(`create-${resourceCode}`);
  const editCheck = usePermissionCheck(`edit-${resourceCode}`);
  const deleteCheck = usePermissionCheck(`delete-${resourceCode}`);

  return useMemo(
    () => ({
      canView: viewCheck.hasPermission,
      canCreate: createCheck.hasPermission,
      canEdit: editCheck.hasPermission,
      canDelete: deleteCheck.hasPermission,
      loading: viewCheck.loading || createCheck.loading || editCheck.loading || deleteCheck.loading,
    }),
    [viewCheck, createCheck, editCheck, deleteCheck]
  );
}
