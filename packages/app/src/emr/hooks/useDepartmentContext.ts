// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useMedplum } from '@medplum/react-hooks';
import { useEffect, useState } from 'react';
import type { PractitionerRole } from '@medplum/fhirtypes';

/**
 * useDepartmentContext - Get current user's department from PractitionerRole
 *
 * Returns the department ID from the current user's active PractitionerRole resource.
 * Useful for department-scoped permission checks and filtering.
 *
 * @returns Department ID or null if no department assigned
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const departmentId = useDepartmentContext();
 *
 *   if (departmentId) {
 *     // User has department assignment
 *     console.log('Department:', departmentId);
 *   }
 * }
 * ```
 */
export function useDepartmentContext(): string | null {
  const medplum = useMedplum();
  const [departmentId, setDepartmentId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserDepartment(): Promise<void> {
      try {
        const profile = medplum.getProfile();
        if (!profile || profile.resourceType !== 'Practitioner') {
          setDepartmentId(null);
          return;
        }

        // Search for active PractitionerRole resources for this practitioner
        const bundle = await medplum.search('PractitionerRole', {
          practitioner: `Practitioner/${profile.id}`,
          active: 'true',
        });

        const roles = bundle.entry?.map((entry) => entry.resource as PractitionerRole) || [];

        // Get department from first active role (if any)
        // PractitionerRole.organization typically holds the department reference
        for (const role of roles) {
          if (role.organization?.reference) {
            const orgId = role.organization.reference.replace('Organization/', '');
            setDepartmentId(orgId);
            return;
          }
        }

        setDepartmentId(null);
      } catch (error) {
        console.error('[useDepartmentContext] Failed to fetch user department:', error);
        setDepartmentId(null);
      }
    }

    void fetchUserDepartment();
  }, [medplum]);

  return departmentId;
}
