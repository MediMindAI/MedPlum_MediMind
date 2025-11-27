// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { MedplumClient } from '@medplum/core';
import type { AccessPolicy, PractitionerRole } from '@medplum/fhirtypes';
import type { RoleFormValues } from '../types/role-management';
import { permissionsToAccessPolicy } from './permissionService';
import { createAuditEvent } from './auditService';

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

  const tags = [
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
  ];

  // Store description in a tag (AccessPolicy doesn't have a description field)
  if (values.description) {
    tags.push({
      system: 'http://medimind.ge/role-description',
      code: 'description',
      display: values.description,
    });
  }

  const role: AccessPolicy = {
    resourceType: 'AccessPolicy',
    meta: {
      tag: tags,
    },
    resource: resources,
  };

  const created = await medplum.createResource(role);

  // Create audit event for role creation
  try {
    await createAuditEvent(
      medplum,
      'C',
      { reference: `AccessPolicy/${created.id}`, display: values.name },
      0, // success
      `Role created: ${values.name}`,
      {
        roleCode: values.code,
        permissions: values.permissions.join(', '),
      }
    );
    console.log('✅ Audit event created for role creation:', values.name);
  } catch (auditError) {
    console.error('❌ Failed to create audit event for role creation:', auditError);
  }

  return created;
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

  // Build updated tags
  const updatedTags = [
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
  ];

  // Store description in a tag (AccessPolicy doesn't have a description field)
  if (values.description) {
    updatedTags.push({
      system: 'http://medimind.ge/role-description',
      code: 'description',
      display: values.description,
    });
  }

  // Update meta tags
  role.meta = {
    ...role.meta,
    tag: updatedTags,
  };

  role.resource = resources;

  const updated = await medplum.updateResource(role);

  // Create audit event for role update
  try {
    await createAuditEvent(
      medplum,
      'U',
      { reference: `AccessPolicy/${updated.id}`, display: values.name },
      0, // success
      `Role updated: ${values.name}`,
      {
        roleCode: values.code,
        permissions: values.permissions.join(', '),
      }
    );
    console.log('✅ Audit event created for role update:', values.name);
  } catch (auditError) {
    console.error('❌ Failed to create audit event for role update:', auditError);
  }

  return updated;
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
  const roleName = role.meta?.tag?.find((t) => t.system === 'http://medimind.ge/role-identifier')?.display || 'Unknown';

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

  const updated = await medplum.updateResource(role);

  // Create audit event for role deactivation
  await createAuditEvent(
    medplum,
    'D',
    { reference: `AccessPolicy/${updated.id}`, display: roleName },
    0, // success
    `Role deactivated: ${roleName}`
  );

  return updated;
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
  const roleName = role.meta?.tag?.find((t) => t.system === 'http://medimind.ge/role-identifier')?.display || 'Unknown';

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

  const updated = await medplum.updateResource(role);

  // Create audit event for role reactivation
  await createAuditEvent(
    medplum,
    'U',
    { reference: `AccessPolicy/${updated.id}`, display: roleName },
    0, // success
    `Role reactivated: ${roleName}`
  );

  return updated;
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

  // Get role info before deleting for audit log
  const role = await medplum.readResource('AccessPolicy', id);
  const roleName = role.meta?.tag?.find((t) => t.system === 'http://medimind.ge/role-identifier')?.display || 'Unknown';
  const roleCode = role.meta?.tag?.find((t) => t.system === 'http://medimind.ge/role-identifier')?.code || '';

  await medplum.deleteResource('AccessPolicy', id);

  // Create audit event for role deletion (after delete to ensure it succeeded)
  await createAuditEvent(
    medplum,
    'D',
    { reference: `AccessPolicy/${id}`, display: roleName },
    0, // success
    `Role permanently deleted: ${roleName}`,
    { roleCode }
  );
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

  // Get original description from tag
  const originalDescription = sourceRole.meta?.tag?.find(
    (tag) => tag.system === 'http://medimind.ge/role-description'
  )?.display;

  const cloneTags = [
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
  ];

  // Copy description with " (Copy)" suffix if exists
  if (originalDescription) {
    cloneTags.push({
      system: 'http://medimind.ge/role-description',
      code: 'description',
      display: `${originalDescription} (Copy)`,
    });
  }

  const clonedRole: AccessPolicy = {
    resourceType: 'AccessPolicy',
    meta: {
      tag: cloneTags,
    },
    resource: sourceRole.resource,
  };

  const created = await medplum.createResource(clonedRole);

  // Get source role name for audit
  const sourceRoleName = sourceRole.meta?.tag?.find((t) => t.system === 'http://medimind.ge/role-identifier')?.display || 'Unknown';

  // Create audit event for role cloning
  await createAuditEvent(
    medplum,
    'C',
    { reference: `AccessPolicy/${created.id}`, display: newName },
    0, // success
    `Role cloned: ${newName} (from ${sourceRoleName})`,
    {
      sourceRoleId: sourceId,
      sourceRoleName,
      newRoleCode: newCode,
    }
  );

  return created;
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

/**
 * Creates a department-scoped role
 * Restricts role permissions to resources within a specific department
 *
 * @param medplum - Medplum client instance
 * @param values - Role form values
 * @param departmentId - Organization ID for department scoping
 * @returns Created AccessPolicy resource with department scoping
 */
export async function createDepartmentScopedRole(
  medplum: MedplumClient,
  values: RoleFormValues,
  departmentId: string
): Promise<AccessPolicy> {
  // Import dynamically to avoid circular dependency
  const { permissionsToAccessPolicy, addDepartmentScoping } = await import('./permissionService');

  // Convert permissions to AccessPolicy resources
  const resources = permissionsToAccessPolicy(values.permissions);

  // Apply department scoping
  const scopedResources = addDepartmentScoping(resources, departmentId);

  const tags = [
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
    {
      system: 'http://medimind.ge/department-scope',
      code: departmentId,
      display: 'Department Scoped',
    },
  ];

  // Store description in a tag (AccessPolicy doesn't have a description field)
  if (values.description) {
    tags.push({
      system: 'http://medimind.ge/role-description',
      code: 'description',
      display: values.description,
    });
  }

  const role: AccessPolicy = {
    resourceType: 'AccessPolicy',
    meta: {
      tag: tags,
    },
    resource: scopedResources,
  };

  const created = await medplum.createResource(role);

  // Create audit event for role creation
  const { createAuditEvent } = await import('./auditService');
  try {
    await createAuditEvent(
      medplum,
      'C',
      { reference: `AccessPolicy/${created.id}`, display: values.name },
      0, // success
      `Department-scoped role created: ${values.name} (Department: ${departmentId})`,
      {
        roleCode: values.code,
        departmentId,
        permissions: values.permissions.join(', '),
      }
    );
    console.log('✅ Audit event created for department-scoped role creation:', values.name);
  } catch (auditError) {
    console.error('❌ Failed to create audit event for role creation:', auditError);
  }

  return created;
}

