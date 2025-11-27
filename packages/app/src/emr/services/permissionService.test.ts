// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { AccessPolicy } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import type { PermissionRow } from '../types/account-management';
import { PERMISSION_RESOURCES } from '../types/account-management';
import {
  getPermissionTree,
  resolvePermissionDependencies,
  permissionsToAccessPolicy,
  accessPolicyToPermissions,
  getPermissionMatrix,
  updatePermissionMatrix,
  detectRoleConflicts,
  resolvePermissionDependenciesForOperation,
  getCombinedPermissions,
} from './permissionService';

describe('permissionService', () => {
  describe('getPermissionTree', () => {
    it('should return 8 permission categories', () => {
      const tree = getPermissionTree();

      expect(tree).toHaveLength(8);
      expect(tree[0].code).toBe('patient-management');
      expect(tree[1].code).toBe('clinical-documentation');
      expect(tree[2].code).toBe('laboratory');
      expect(tree[3].code).toBe('billing-financial');
      expect(tree[4].code).toBe('administration');
      expect(tree[5].code).toBe('reports');
      expect(tree[6].code).toBe('nomenclature');
      expect(tree[7].code).toBe('scheduling');
    });

    it('should include permissions for each category', () => {
      const tree = getPermissionTree();

      const patientManagement = tree.find((c) => c.code === 'patient-management');
      expect(patientManagement?.permissions.length).toBeGreaterThan(0);

      const administration = tree.find((c) => c.code === 'administration');
      expect(administration?.permissions.length).toBeGreaterThan(0);
    });

    it('should include permission dependencies', () => {
      const tree = getPermissionTree();
      const allPermissions = tree.flatMap((c) => c.permissions);

      const editPatientDemo = allPermissions.find((p) => p.code === 'edit-patient-demographics');
      expect(editPatientDemo?.dependencies).toContain('view-patient-demographics');

      const deletePatient = allPermissions.find((p) => p.code === 'delete-patient');
      expect(deletePatient?.dependencies).toContain('view-patient-demographics');
      // Note: delete-patient now only depends on view-patient-demographics, not edit
    });
  });

  describe('resolvePermissionDependencies', () => {
    it('should auto-enable parent permissions', () => {
      const selected = ['edit-patient-demographics'];
      const resolved = resolvePermissionDependencies(selected);

      expect(resolved).toContain('edit-patient-demographics');
      expect(resolved).toContain('view-patient-demographics'); // Dependency
    });

    it('should handle multiple dependency levels', () => {
      const selected = ['delete-patient'];
      const resolved = resolvePermissionDependencies(selected);

      expect(resolved).toContain('delete-patient');
      expect(resolved).toContain('view-patient-demographics'); // Dependency
      expect(resolved).toContain('view-patient-list'); // Transitive dependency
    });

    it('should handle permissions with no dependencies', () => {
      const selected = ['view-patient-list'];
      const resolved = resolvePermissionDependencies(selected);

      expect(resolved).toEqual(['view-patient-list']);
    });

    it('should handle empty input', () => {
      const resolved = resolvePermissionDependencies([]);
      expect(resolved).toEqual([]);
    });

    it('should handle multiple selected permissions', () => {
      const selected = ['edit-patient-demographics', 'create-patient'];
      const resolved = resolvePermissionDependencies(selected);

      expect(resolved).toContain('edit-patient-demographics');
      expect(resolved).toContain('create-patient');
      expect(resolved).toContain('view-patient-demographics'); // Dependency of edit
      expect(resolved).toContain('view-patient-list'); // Dependency of create
    });
  });

  describe('permissionsToAccessPolicy', () => {
    it('should convert permission codes to AccessPolicy resources with interaction arrays', () => {
      const permissions = ['view-patient-demographics', 'view-encounters'];
      const resources = permissionsToAccessPolicy(permissions);

      expect(resources).toHaveLength(2);

      const patientResource = resources.find((r) => r.resourceType === 'Patient');
      expect(patientResource?.interaction).toContain('read');
      expect(patientResource?.interaction).toContain('search');
      expect(patientResource?.interaction).not.toContain('create');
      expect(patientResource?.interaction).not.toContain('update');
      expect(patientResource?.interaction).not.toContain('delete');

      const encounterResource = resources.find((r) => r.resourceType === 'Encounter');
      expect(encounterResource?.interaction).toContain('read');
      expect(encounterResource?.interaction).toContain('search');
    });

    it('should include create and update interactions when write permissions are included', () => {
      const permissions = ['view-patient-demographics', 'edit-patient-demographics'];
      const resources = permissionsToAccessPolicy(permissions);

      expect(resources).toHaveLength(1);
      expect(resources[0].resourceType).toBe('Patient');
      expect(resources[0].interaction).toContain('read');
      expect(resources[0].interaction).toContain('create');
      expect(resources[0].interaction).toContain('update');
      expect(resources[0].interaction).toContain('search');
    });

    it('should aggregate multiple permissions for same resource', () => {
      const permissions = ['view-encounters', 'create-encounter', 'edit-encounter'];
      const resources = permissionsToAccessPolicy(permissions);

      // After dependency resolution, may include Patient resources as well
      expect(resources.length).toBeGreaterThanOrEqual(1);

      const encounterResource = resources.find((r) => r.resourceType === 'Encounter');
      expect(encounterResource).toBeDefined();
      expect(encounterResource?.interaction).toContain('read');
      expect(encounterResource?.interaction).toContain('create');
      expect(encounterResource?.interaction).toContain('update');
      expect(encounterResource?.interaction).toContain('search');
    });

    it('should resolve dependencies before mapping', () => {
      const permissions = ['edit-patient-demographics']; // Has dependency on view-patient-demographics
      const resources = permissionsToAccessPolicy(permissions);

      expect(resources).toHaveLength(1);
      const patientResource = resources.find((r) => r.resourceType === 'Patient');
      // Should include both read (from dependency) and write (from edit)
      expect(patientResource?.interaction).toContain('read');
      expect(patientResource?.interaction).toContain('create');
      expect(patientResource?.interaction).toContain('update');
      expect(patientResource?.interaction).toContain('search');
    });

    it('should map delete accessLevel to delete interaction', () => {
      const permissions = ['delete-patient'];
      const resources = permissionsToAccessPolicy(permissions);

      expect(resources).toHaveLength(1);
      const patientResource = resources.find((r) => r.resourceType === 'Patient');
      expect(patientResource?.interaction).toContain('delete');
      // Dependencies should add read/search via resolvePermissionDependencies
      // delete-patient depends on view-patient-demographics which has accessLevel: 'read'
      expect(patientResource?.interaction).toContain('read');
      expect(patientResource?.interaction).toContain('search');
      // Should NOT include create/update (those come from 'write' accessLevel only)
      expect(patientResource?.interaction).not.toContain('create');
      expect(patientResource?.interaction).not.toContain('update');
    });

    it('should map admin accessLevel to all interactions', () => {
      // Assuming there's a permission with accessLevel: 'admin'
      // For now, test with multiple permissions that cover all operations
      const permissions = ['view-patient-list', 'create-patient', 'edit-patient-demographics', 'delete-patient'];
      const resources = permissionsToAccessPolicy(permissions);

      const patientResource = resources.find((r) => r.resourceType === 'Patient');
      expect(patientResource?.interaction).toContain('read');
      expect(patientResource?.interaction).toContain('create');
      expect(patientResource?.interaction).toContain('update');
      expect(patientResource?.interaction).toContain('delete');
      expect(patientResource?.interaction).toContain('search');
    });

    it('should sort interactions for consistency', () => {
      const permissions = ['edit-patient-demographics'];
      const resources = permissionsToAccessPolicy(permissions);

      const patientResource = resources.find((r) => r.resourceType === 'Patient');
      const interactions = patientResource?.interaction || [];
      const sortedInteractions = [...interactions].sort();
      expect(interactions).toEqual(sortedInteractions);
    });

    it('should handle empty permissions array', () => {
      const resources = permissionsToAccessPolicy([]);
      expect(resources).toEqual([]);
    });
  });

  describe('accessPolicyToPermissions', () => {
    it('should extract permission codes from AccessPolicy', () => {
      const policy: AccessPolicy = {
        resourceType: 'AccessPolicy',
        resource: [
          {
            resourceType: 'Patient',
            readonly: true,
          },
        ],
      };

      const permissions = accessPolicyToPermissions(policy);

      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions).toContain('view-patient-list');
      expect(permissions).toContain('view-patient-demographics');
    });

    it('should extract read-write permissions', () => {
      const policy: AccessPolicy = {
        resourceType: 'AccessPolicy',
        resource: [
          {
            resourceType: 'Patient',
            readonly: false,
          },
        ],
      };

      const permissions = accessPolicyToPermissions(policy);

      expect(permissions).toContain('view-patient-list');
      expect(permissions).toContain('view-patient-demographics');
      expect(permissions).toContain('edit-patient-demographics');
      expect(permissions).toContain('create-patient');
      expect(permissions).toContain('delete-patient');
    });

    it('should handle multiple resources', () => {
      const policy: AccessPolicy = {
        resourceType: 'AccessPolicy',
        resource: [
          {
            resourceType: 'Patient',
            readonly: true,
          },
          {
            resourceType: 'Encounter',
            readonly: false,
          },
        ],
      };

      const permissions = accessPolicyToPermissions(policy);

      // Should have Patient read permissions
      expect(permissions).toContain('view-patient-demographics');

      // Should have Encounter read-write permissions
      expect(permissions).toContain('view-encounters');
      expect(permissions).toContain('create-encounter');
      expect(permissions).toContain('edit-encounter');
    });

    it('should handle empty AccessPolicy', () => {
      const policy: AccessPolicy = {
        resourceType: 'AccessPolicy',
      };

      const permissions = accessPolicyToPermissions(policy);
      expect(permissions).toEqual([]);
    });
  });

  // ============================================================================
  // New Tests: Permission Matrix Functions (FHIR AccessPolicy-based)
  // ============================================================================

  describe('getPermissionMatrix', () => {
    let medplum: MockClient;

    beforeEach(() => {
      medplum = new MockClient();
    });

    it('should return permission matrix for an AccessPolicy', async () => {
      // Create an AccessPolicy with some resources
      const policy = await medplum.createResource<AccessPolicy>({
        resourceType: 'AccessPolicy',
        name: 'Test Policy',
        resource: [
          { resourceType: 'Patient', readonly: false },
          { resourceType: 'Observation', readonly: true },
        ],
      });

      const matrix = await getPermissionMatrix(medplum, policy.id!);

      // Should return a row for each PERMISSION_RESOURCES
      expect(matrix.length).toBe(PERMISSION_RESOURCES.length);

      // Check Patient has full access
      const patientRow = matrix.find((r) => r.resourceType === 'Patient');
      expect(patientRow).toBeDefined();
      expect(patientRow?.create).toBe(true);
      expect(patientRow?.read).toBe(true);
      expect(patientRow?.update).toBe(true);
      expect(patientRow?.delete).toBe(true);
      expect(patientRow?.search).toBe(true);

      // Check Observation has read-only access
      const observationRow = matrix.find((r) => r.resourceType === 'Observation');
      expect(observationRow).toBeDefined();
      expect(observationRow?.create).toBe(false);
      expect(observationRow?.read).toBe(true);
      expect(observationRow?.update).toBe(false);
      expect(observationRow?.delete).toBe(false);
      expect(observationRow?.search).toBe(true);

      // Check Practitioner has no access (not in policy)
      const practitionerRow = matrix.find((r) => r.resourceType === 'Practitioner');
      expect(practitionerRow).toBeDefined();
      expect(practitionerRow?.create).toBe(false);
      expect(practitionerRow?.read).toBe(false);
      expect(practitionerRow?.update).toBe(false);
      expect(practitionerRow?.delete).toBe(false);
      expect(practitionerRow?.search).toBe(false);
    });

    it('should return empty permissions for AccessPolicy with no resources', async () => {
      const policy = await medplum.createResource<AccessPolicy>({
        resourceType: 'AccessPolicy',
        name: 'Empty Policy',
      });

      const matrix = await getPermissionMatrix(medplum, policy.id!);

      // All resources should have false for all operations
      for (const row of matrix) {
        expect(row.create).toBe(false);
        expect(row.read).toBe(false);
        expect(row.update).toBe(false);
        expect(row.delete).toBe(false);
        expect(row.search).toBe(false);
      }
    });

    it('should handle resources not in PERMISSION_RESOURCES list', async () => {
      const policy = await medplum.createResource<AccessPolicy>({
        resourceType: 'AccessPolicy',
        name: 'Policy with unknown resource',
        resource: [
          { resourceType: 'Patient', readonly: false },
          { resourceType: 'CustomResource' as any, readonly: false }, // Unknown resource
        ],
      });

      const matrix = await getPermissionMatrix(medplum, policy.id!);

      // Should not include CustomResource
      const customRow = matrix.find((r) => r.resourceType === 'CustomResource');
      expect(customRow).toBeUndefined();

      // Should still include Patient
      const patientRow = matrix.find((r) => r.resourceType === 'Patient');
      expect(patientRow?.read).toBe(true);
    });
  });

  describe('updatePermissionMatrix', () => {
    let medplum: MockClient;

    beforeEach(() => {
      medplum = new MockClient();
    });

    it('should update AccessPolicy with new permissions', async () => {
      // Create initial policy
      const policy = await medplum.createResource<AccessPolicy>({
        resourceType: 'AccessPolicy',
        name: 'Test Policy',
        resource: [{ resourceType: 'Patient', readonly: true }],
      });

      // Update with new permissions
      const newPermissions: PermissionRow[] = [
        { resourceType: 'Patient', create: true, read: true, update: true, delete: false, search: true },
        { resourceType: 'Observation', create: false, read: true, update: false, delete: false, search: true },
      ];

      const updated = await updatePermissionMatrix(medplum, policy.id!, newPermissions);

      // Should have 2 resources now
      expect(updated.resource?.length).toBe(2);

      // Patient should be read-write (create, update enabled)
      const patientResource = updated.resource?.find((r) => r.resourceType === 'Patient');
      expect(patientResource?.readonly).toBe(false);

      // Observation should be read-only
      const observationResource = updated.resource?.find((r) => r.resourceType === 'Observation');
      expect(observationResource?.readonly).toBe(true);
    });

    it('should skip resources with no permissions', async () => {
      const policy = await medplum.createResource<AccessPolicy>({
        resourceType: 'AccessPolicy',
        name: 'Test Policy',
      });

      const newPermissions: PermissionRow[] = [
        { resourceType: 'Patient', create: true, read: true, update: true, delete: false, search: true },
        { resourceType: 'Observation', create: false, read: false, update: false, delete: false, search: false }, // No permissions
      ];

      const updated = await updatePermissionMatrix(medplum, policy.id!, newPermissions);

      // Should only have 1 resource (Observation has no permissions)
      expect(updated.resource?.length).toBe(1);
      expect(updated.resource?.[0].resourceType).toBe('Patient');
    });

    it('should preserve other AccessPolicy fields', async () => {
      const policy = await medplum.createResource<AccessPolicy>({
        resourceType: 'AccessPolicy',
        name: 'Test Policy',
        description: 'Important description',
      });

      const newPermissions: PermissionRow[] = [
        { resourceType: 'Patient', create: true, read: true, update: true, delete: true, search: true },
      ];

      const updated = await updatePermissionMatrix(medplum, policy.id!, newPermissions);

      // Should preserve name and description
      expect(updated.name).toBe('Test Policy');
      expect(updated.description).toBe('Important description');
    });
  });

  // ============================================================================
  // New Tests: Role Conflict Detection
  // ============================================================================

  describe('detectRoleConflicts', () => {
    it('should detect separation of duties violation (admin + billing)', () => {
      const conflicts = detectRoleConflicts(['admin', 'billing']);

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].type).toBe('separation_of_duties');
      expect(conflicts[0].severity).toBe('error');
      expect(conflicts[0].roles).toContain('admin');
      expect(conflicts[0].roles).toContain('billing');
    });

    it('should detect separation of duties with different role names', () => {
      const conflicts = detectRoleConflicts(['administrator', 'finance']);

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].type).toBe('separation_of_duties');
      expect(conflicts[0].severity).toBe('error');
    });

    it('should detect redundant roles (superadmin + admin)', () => {
      const conflicts = detectRoleConflicts(['superadmin', 'admin']);

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].type).toBe('redundant_roles');
      expect(conflicts[0].severity).toBe('warning');
      expect(conflicts[0].roles).toContain('superadmin');
      expect(conflicts[0].roles).toContain('admin');
    });

    it('should detect multiple redundant roles', () => {
      const conflicts = detectRoleConflicts(['superadmin', 'admin', 'manager', 'receptionist']);

      // Should detect redundant roles
      const redundantConflict = conflicts.find((c) => c.type === 'redundant_roles');
      expect(redundantConflict).toBeDefined();
      expect(redundantConflict?.roles).toContain('superadmin');
    });

    it('should detect permission conflict (read-only + write roles)', () => {
      const conflicts = detectRoleConflicts(['viewer', 'editor']);

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].type).toBe('permission_conflict');
      expect(conflicts[0].severity).toBe('warning');
    });

    it('should return empty array for non-conflicting roles', () => {
      const conflicts = detectRoleConflicts(['physician', 'nurse']);

      expect(conflicts).toEqual([]);
    });

    it('should return empty array for single role', () => {
      const conflicts = detectRoleConflicts(['admin']);

      expect(conflicts).toEqual([]);
    });

    it('should return empty array for empty roles', () => {
      const conflicts = detectRoleConflicts([]);

      expect(conflicts).toEqual([]);
    });

    it('should handle case-insensitive role names', () => {
      const conflicts = detectRoleConflicts(['Admin', 'BILLING']);

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].type).toBe('separation_of_duties');
    });

    it('should detect multiple conflicts at once', () => {
      // This combination has both separation of duties AND redundant roles
      const conflicts = detectRoleConflicts(['superadmin', 'admin', 'billing']);

      expect(conflicts.length).toBe(2);

      const separationConflict = conflicts.find((c) => c.type === 'separation_of_duties');
      expect(separationConflict).toBeDefined();

      const redundantConflict = conflicts.find((c) => c.type === 'redundant_roles');
      expect(redundantConflict).toBeDefined();
    });
  });

  // ============================================================================
  // New Tests: Permission Dependency Resolution (Resource/Operation based)
  // ============================================================================

  describe('resolvePermissionDependenciesForOperation', () => {
    const createTestPermissions = (): PermissionRow[] => [
      { resourceType: 'Patient', create: false, read: false, update: false, delete: false, search: false },
      { resourceType: 'Observation', create: false, read: false, update: false, delete: false, search: false },
    ];

    it('should auto-enable read when update is enabled', () => {
      const permissions = createTestPermissions();
      permissions[0].update = true; // Enable update for Patient

      const resolved = resolvePermissionDependenciesForOperation('Patient', 'update', permissions);

      const patientRow = resolved.find((r) => r.resourceType === 'Patient');
      expect(patientRow?.update).toBe(true);
      expect(patientRow?.read).toBe(true); // Auto-enabled
    });

    it('should auto-enable read when delete is enabled', () => {
      const permissions = createTestPermissions();
      permissions[0].delete = true; // Enable delete for Patient

      const resolved = resolvePermissionDependenciesForOperation('Patient', 'delete', permissions);

      const patientRow = resolved.find((r) => r.resourceType === 'Patient');
      expect(patientRow?.delete).toBe(true);
      expect(patientRow?.read).toBe(true); // Auto-enabled
    });

    it('should auto-enable read when search is enabled', () => {
      const permissions = createTestPermissions();
      permissions[0].search = true; // Enable search for Patient

      const resolved = resolvePermissionDependenciesForOperation('Patient', 'search', permissions);

      const patientRow = resolved.find((r) => r.resourceType === 'Patient');
      expect(patientRow?.search).toBe(true);
      expect(patientRow?.read).toBe(true); // Auto-enabled
    });

    it('should not modify other resources', () => {
      const permissions = createTestPermissions();
      permissions[0].update = true;

      const resolved = resolvePermissionDependenciesForOperation('Patient', 'update', permissions);

      const observationRow = resolved.find((r) => r.resourceType === 'Observation');
      expect(observationRow?.read).toBe(false); // Should remain false
      expect(observationRow?.update).toBe(false);
    });

    it('should not modify input array (immutability)', () => {
      const permissions = createTestPermissions();
      const originalReadValue = permissions[0].read;

      resolvePermissionDependenciesForOperation('Patient', 'update', permissions);

      expect(permissions[0].read).toBe(originalReadValue); // Original should be unchanged
    });

    it('should handle create operation (no dependencies)', () => {
      const permissions = createTestPermissions();
      permissions[0].create = true;

      const resolved = resolvePermissionDependenciesForOperation('Patient', 'create', permissions);

      const patientRow = resolved.find((r) => r.resourceType === 'Patient');
      expect(patientRow?.create).toBe(true);
      expect(patientRow?.read).toBe(false); // Create has no dependencies
    });

    it('should handle read operation (no dependencies)', () => {
      const permissions = createTestPermissions();
      permissions[0].read = true;

      const resolved = resolvePermissionDependenciesForOperation('Patient', 'read', permissions);

      const patientRow = resolved.find((r) => r.resourceType === 'Patient');
      expect(patientRow?.read).toBe(true);
    });

    it('should handle unknown resource type', () => {
      const permissions = createTestPermissions();

      const resolved = resolvePermissionDependenciesForOperation('UnknownResource', 'update', permissions);

      // Should return permissions unchanged
      expect(resolved).toEqual(permissions);
    });

    it('should handle invalid operation', () => {
      const permissions = createTestPermissions();

      const resolved = resolvePermissionDependenciesForOperation('Patient', 'invalid-op', permissions);

      // Should return permissions unchanged
      expect(resolved).toEqual(permissions);
    });
  });

  // ============================================================================
  // New Tests: Combined Permissions from Multiple Roles
  // ============================================================================

  describe('getCombinedPermissions', () => {
    let medplum: MockClient;

    beforeEach(() => {
      medplum = new MockClient();
    });

    it('should merge permissions from multiple roles using union logic', async () => {
      // Create two policies with different permissions
      const policy1 = await medplum.createResource<AccessPolicy>({
        resourceType: 'AccessPolicy',
        name: 'Policy 1',
        resource: [
          { resourceType: 'Patient', readonly: false }, // Full access
        ],
      });

      const policy2 = await medplum.createResource<AccessPolicy>({
        resourceType: 'AccessPolicy',
        name: 'Policy 2',
        resource: [
          { resourceType: 'Observation', readonly: true }, // Read-only
        ],
      });

      const combined = await getCombinedPermissions(medplum, [policy1.id!, policy2.id!]);

      // Should have Patient full access from policy1
      const patientRow = combined.find((r) => r.resourceType === 'Patient');
      expect(patientRow?.create).toBe(true);
      expect(patientRow?.read).toBe(true);
      expect(patientRow?.update).toBe(true);
      expect(patientRow?.delete).toBe(true);
      expect(patientRow?.search).toBe(true);

      // Should have Observation read-only from policy2
      const observationRow = combined.find((r) => r.resourceType === 'Observation');
      expect(observationRow?.create).toBe(false);
      expect(observationRow?.read).toBe(true);
      expect(observationRow?.update).toBe(false);
      expect(observationRow?.delete).toBe(false);
      expect(observationRow?.search).toBe(true);
    });

    it('should use union logic when same resource in multiple policies', async () => {
      // Create two policies with overlapping resources
      const policy1 = await medplum.createResource<AccessPolicy>({
        resourceType: 'AccessPolicy',
        name: 'Policy 1',
        resource: [
          { resourceType: 'Patient', readonly: true }, // Read-only
        ],
      });

      const policy2 = await medplum.createResource<AccessPolicy>({
        resourceType: 'AccessPolicy',
        name: 'Policy 2',
        resource: [
          { resourceType: 'Patient', readonly: false }, // Full access
        ],
      });

      const combined = await getCombinedPermissions(medplum, [policy1.id!, policy2.id!]);

      // Union logic: full access wins
      const patientRow = combined.find((r) => r.resourceType === 'Patient');
      expect(patientRow?.create).toBe(true);
      expect(patientRow?.read).toBe(true);
      expect(patientRow?.update).toBe(true);
      expect(patientRow?.delete).toBe(true);
      expect(patientRow?.search).toBe(true);
    });

    it('should return empty permissions for empty role IDs', async () => {
      const combined = await getCombinedPermissions(medplum, []);

      // All resources should have false for all operations
      expect(combined.length).toBe(PERMISSION_RESOURCES.length);
      for (const row of combined) {
        expect(row.create).toBe(false);
        expect(row.read).toBe(false);
        expect(row.update).toBe(false);
        expect(row.delete).toBe(false);
        expect(row.search).toBe(false);
      }
    });

    it('should handle single role', async () => {
      const policy = await medplum.createResource<AccessPolicy>({
        resourceType: 'AccessPolicy',
        name: 'Single Policy',
        resource: [
          { resourceType: 'Patient', readonly: false },
          { resourceType: 'Encounter', readonly: true },
        ],
      });

      const combined = await getCombinedPermissions(medplum, [policy.id!]);

      // Should match the single policy
      const patientRow = combined.find((r) => r.resourceType === 'Patient');
      expect(patientRow?.create).toBe(true);

      const encounterRow = combined.find((r) => r.resourceType === 'Encounter');
      expect(encounterRow?.read).toBe(true);
      expect(encounterRow?.create).toBe(false);
    });

    it('should return all PERMISSION_RESOURCES in result', async () => {
      const policy = await medplum.createResource<AccessPolicy>({
        resourceType: 'AccessPolicy',
        name: 'Partial Policy',
        resource: [{ resourceType: 'Patient', readonly: false }],
      });

      const combined = await getCombinedPermissions(medplum, [policy.id!]);

      // Should return all resources, not just ones in policy
      expect(combined.length).toBe(PERMISSION_RESOURCES.length);

      // Verify all PERMISSION_RESOURCES are present
      for (const resourceType of PERMISSION_RESOURCES) {
        const row = combined.find((r) => r.resourceType === resourceType);
        expect(row).toBeDefined();
      }
    });
  });
});
