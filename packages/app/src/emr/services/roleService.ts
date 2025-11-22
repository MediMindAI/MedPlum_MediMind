// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { MedplumClient } from '@medplum/core';
import type { AccessPolicy, PractitionerRole } from '@medplum/fhirtypes';
import type { RoleFormValues } from '../types/role-management';
import { permissionsToAccessPolicy } from './permissionService';

/**
 * Creates a new role (AccessPolicy) with permissions
 *
 * @param medplum - Medplum client instance
 * @param values - Role form values
 * @returns Created AccessPolicy resource
 */
export async function createRole(medplum: MedplumClient, values: RoleFormValues): Promise<AccessPolicy> {
  // Convert permissions to AccessPolicy resources
  const resources = permissionsToAccessPolicy(values.permissions);

  const role: AccessPolicy = {
    resourceType: 'AccessPolicy',
    meta: {
      tag: [
        {
          system: 'http://medimind.ge/role-identifier',
          code: values.code,
          display: values.name,
        },
        {
          system: 'http://medimind.ge/role-status',
          code: values.status,
          display: values.status === 'active' ? 'Active' : 'Inactive',
        },
      ],
    },
    description: values.description,
    resource: resources,
  };

  return medplum.createResource(role);
}

/**
 * Searches for roles with optional filters
 *
 * @param medplum - Medplum client instance
 * @param filters - Search filters (name, status, count)
 * @param filters.name - Role name filter
 * @param filters.status - Role status filter (active or inactive)
 * @param filters.count - Maximum number of results to return
 * @returns Array of AccessPolicy resources
 */
export async function searchRoles(
  medplum: MedplumClient,
  filters?: { name?: string; status?: 'active' | 'inactive'; count?: number }
): Promise<AccessPolicy[]> {
  const searchParams: Record<string, string> = {};

  if (filters?.count) {
    searchParams._count = String(filters.count);
  }

  const bundle = await medplum.search('AccessPolicy', searchParams);
  let roles = (bundle.entry?.map((entry) => entry.resource as AccessPolicy) || []);

  // Filter only roles (have role-identifier tag)
  roles = roles.filter((role) =>
    role.meta?.tag?.some((tag) => tag.system === 'http://medimind.ge/role-identifier')
  );

  // Client-side filtering by status
  if (filters?.status) {
    roles = roles.filter((role) => {
      const statusTag = role.meta?.tag?.find((tag) => tag.system === 'http://medimind.ge/role-status');
      return statusTag?.code === filters.status;
    });
  }

  // Client-side filtering by name (FHIR doesn't support tag display search)
  if (filters?.name) {
    const nameFilter = filters.name.toLowerCase();
    roles = roles.filter((role) => {
      const roleNameTag = role.meta?.tag?.find(
        (tag) => tag.system === 'http://medimind.ge/role-identifier'
      );
      return roleNameTag?.display?.toLowerCase().includes(nameFilter);
    });
  }

  return roles;
}

/**
 * Gets a role by ID
 *
 * @param medplum - Medplum client instance
 * @param id - AccessPolicy resource ID
 * @returns AccessPolicy resource
 */
export async function getRoleById(medplum: MedplumClient, id: string): Promise<AccessPolicy> {
  return medplum.readResource('AccessPolicy', id);
}

/**
 * Updates an existing role
 *
 * @param medplum - Medplum client instance
 * @param id - AccessPolicy resource ID
 * @param values - Updated role form values
 * @returns Updated AccessPolicy resource
 */
export async function updateRole(
  medplum: MedplumClient,
  id: string,
  values: RoleFormValues
): Promise<AccessPolicy> {
  const role = await medplum.readResource('AccessPolicy', id);

  // Convert permissions to AccessPolicy resources
  const resources = permissionsToAccessPolicy(values.permissions);

  // Update meta tags
  role.meta = {
    ...role.meta,
    tag: [
      {
        system: 'http://medimind.ge/role-identifier',
        code: values.code,
        display: values.name,
      },
      {
        system: 'http://medimind.ge/role-status',
        code: values.status,
        display: values.status === 'active' ? 'Active' : 'Inactive',
      },
    ],
  };

  role.description = values.description;
  role.resource = resources;

  return medplum.updateResource(role);
}

/**
 * Deactivates a role (soft delete)
 *
 * @param medplum - Medplum client instance
 * @param id - AccessPolicy resource ID
 * @returns Updated AccessPolicy resource
 */
export async function deactivateRole(medplum: MedplumClient, id: string): Promise<AccessPolicy> {
  const role = await medplum.readResource('AccessPolicy', id);

  // Update status tag to inactive
  role.meta = {
    ...role.meta,
    tag: role.meta?.tag?.map((tag) => {
      if (tag.system === 'http://medimind.ge/role-status') {
        return {
          ...tag,
          code: 'inactive',
          display: 'Inactive',
        };
      }
      return tag;
    }),
  };

  return medplum.updateResource(role);
}

/**
 * Reactivates a role (undo soft delete)
 *
 * @param medplum - Medplum client instance
 * @param id - AccessPolicy resource ID
 * @returns Updated AccessPolicy resource
 */
export async function reactivateRole(medplum: MedplumClient, id: string): Promise<AccessPolicy> {
  const role = await medplum.readResource('AccessPolicy', id);

  // Update status tag to active
  role.meta = {
    ...role.meta,
    tag: role.meta?.tag?.map((tag) => {
      if (tag.system === 'http://medimind.ge/role-status') {
        return {
          ...tag,
          code: 'active',
          display: 'Active',
        };
      }
      return tag;
    }),
  };

  return medplum.updateResource(role);
}

/**
 * Hard deletes a role (permanent removal)
 * WARNING: Should only be used if role has no assigned users
 *
 * @param medplum - Medplum client instance
 * @param id - AccessPolicy resource ID
 */
export async function hardDeleteRole(medplum: MedplumClient, id: string): Promise<void> {
  // Check for assigned users first
  const userCount = await getRoleUserCount(medplum, id);
  if (userCount > 0) {
    throw new Error(`Cannot delete role with ${userCount} assigned users. Deactivate the role instead.`);
  }

  await medplum.deleteResource('AccessPolicy', id);
}

/**
 * Clones a role with a new name and code
 *
 * @param medplum - Medplum client instance
 * @param sourceId - Source AccessPolicy resource ID
 * @param newName - New role name
 * @param newCode - New role code
 * @returns Created AccessPolicy resource (clone)
 */
export async function cloneRole(
  medplum: MedplumClient,
  sourceId: string,
  newName: string,
  newCode: string
): Promise<AccessPolicy> {
  const sourceRole = await medplum.readResource('AccessPolicy', sourceId);

  const clonedRole: AccessPolicy = {
    resourceType: 'AccessPolicy',
    meta: {
      tag: [
        {
          system: 'http://medimind.ge/role-identifier',
          code: newCode,
          display: newName,
        },
        {
          system: 'http://medimind.ge/role-status',
          code: 'active',
          display: 'Active',
        },
      ],
    },
    description: sourceRole.description ? `${sourceRole.description} (Copy)` : undefined,
    resource: sourceRole.resource,
  };

  return medplum.createResource(clonedRole);
}

/**
 * Assigns a role to a user by creating a PractitionerRole resource
 *
 * @param medplum - Medplum client instance
 * @param practitionerId - Practitioner resource ID
 * @param roleCode - Role code from AccessPolicy meta.tag
 * @returns Created PractitionerRole resource
 */
export async function assignRoleToUser(
  medplum: MedplumClient,
  practitionerId: string,
  roleCode: string
): Promise<PractitionerRole> {
  const practitionerRole: PractitionerRole = {
    resourceType: 'PractitionerRole',
    active: true,
    practitioner: {
      reference: `Practitioner/${practitionerId}`,
    },
    meta: {
      tag: [
        {
          system: 'http://medimind.ge/role-assignment',
          code: roleCode,
        },
      ],
    },
  };

  return medplum.createResource(practitionerRole);
}

/**
 * Removes a role from a user by deleting the PractitionerRole resource
 *
 * @param medplum - Medplum client instance
 * @param practitionerRoleId - PractitionerRole resource ID
 */
export async function removeRoleFromUser(medplum: MedplumClient, practitionerRoleId: string): Promise<void> {
  await medplum.deleteResource('PractitionerRole', practitionerRoleId);
}

/**
 * Gets all roles assigned to a user
 *
 * @param medplum - Medplum client instance
 * @param practitionerId - Practitioner resource ID
 * @returns Array of PractitionerRole resources
 */
export async function getUserRoles(medplum: MedplumClient, practitionerId: string): Promise<PractitionerRole[]> {
  const bundle = await medplum.search('PractitionerRole', {
    practitioner: `Practitioner/${practitionerId}`,
    active: 'true',
    _tag: 'http://medimind.ge/role-assignment|',
  });

  return bundle.entry?.map((entry) => entry.resource as PractitionerRole) || [];
}

/**
 * Gets the number of users assigned to a role
 *
 * @param medplum - Medplum client instance
 * @param roleId - AccessPolicy resource ID
 * @returns Number of assigned users
 */
export async function getRoleUserCount(medplum: MedplumClient, roleId: string): Promise<number> {
  const role = await medplum.readResource('AccessPolicy', roleId);
  const roleCode = role.meta?.tag?.find((tag) => tag.system === 'http://medimind.ge/role-identifier')?.code;

  if (!roleCode) {
    return 0;
  }

  const bundle = await medplum.search('PractitionerRole', {
    active: 'true',
    _tag: `http://medimind.ge/role-assignment|${roleCode}`,
    _summary: 'count',
  });

  return bundle.total || 0;
}

