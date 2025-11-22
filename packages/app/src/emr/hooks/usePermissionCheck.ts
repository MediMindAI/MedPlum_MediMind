// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useMedplum } from '@medplum/react-hooks';
import type { AccessPolicy } from '@medplum/fhirtypes';
import { useState, useEffect } from 'react';
import { getUserRoles } from '../services/roleService';
import { accessPolicyToPermissions } from '../services/permissionService';

/**
 * Hook to check if current user has a specific permission
 * @param permissionCode - Permission code to check
 * @returns Boolean indicating if user has permission
 */
export function usePermissionCheck(permissionCode: string): boolean {
  const medplum = useMedplum();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    async function checkPermission(): Promise<void> {
      try {
        const profile = medplum.getProfile();
        if (!profile?.id) {
          setHasPermission(false);
          return;
        }

        // Get all roles for current user
        const practitionerRoles = await getUserRoles(medplum, profile.id);

        // Extract role codes from PractitionerRole resources
        const roleCodes = practitionerRoles
          .map((pr) => pr.meta?.tag?.find((tag) => tag.system === 'http://medimind.ge/role-assignment')?.code)
          .filter((code): code is string => code !== undefined);

        // Get AccessPolicy resources for each role code
        const allPermissions: string[] = [];
        for (const roleCode of roleCodes) {
          // Search for AccessPolicy with this role code
          const bundle = await medplum.search('AccessPolicy', {
            _tag: `http://medimind.ge/role-identifier|${roleCode}`,
          });

          const roles = (bundle.entry?.map((entry) => entry.resource as AccessPolicy) || []);

          // Extract permissions from each role
          for (const role of roles) {
            const permissions = accessPolicyToPermissions(role);
            allPermissions.push(...permissions);
          }
        }

        // Check if permission exists
        setHasPermission(allPermissions.includes(permissionCode));
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasPermission(false);
      }
    }

    checkPermission().catch(console.error);
  }, [medplum, permissionCode]);

  return hasPermission;
}
