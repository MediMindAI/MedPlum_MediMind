// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { AccessPolicy } from '@medplum/fhirtypes';
import {
  getPermissionTree,
  resolvePermissionDependencies,
  permissionsToAccessPolicy,
  accessPolicyToPermissions,
} from './permissionService';

describe('permissionService', () => {
  describe('getPermissionTree', () => {
    it('should return 6 permission categories', () => {
      const tree = getPermissionTree();

      expect(tree).toHaveLength(6);
      expect(tree[0].code).toBe('patient-management');
      expect(tree[1].code).toBe('clinical-documentation');
      expect(tree[2].code).toBe('laboratory');
      expect(tree[3].code).toBe('billing-financial');
      expect(tree[4].code).toBe('administration');
      expect(tree[5].code).toBe('reports');
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
      expect(deletePatient?.dependencies).toContain('edit-patient-demographics');
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
      expect(resolved).toContain('edit-patient-demographics'); // Dependency
      expect(resolved).toContain('view-patient-demographics'); // Transitive dependency
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
    it('should convert permission codes to AccessPolicy resources', () => {
      const permissions = ['view-patient-demographics', 'view-encounters'];
      const resources = permissionsToAccessPolicy(permissions);

      expect(resources).toHaveLength(2);

      const patientResource = resources.find((r) => r.resourceType === 'Patient');
      expect(patientResource?.readonly).toBe(true);

      const encounterResource = resources.find((r) => r.resourceType === 'Encounter');
      expect(encounterResource?.readonly).toBe(true);
    });

    it('should set readonly=false when write permissions are included', () => {
      const permissions = ['view-patient-demographics', 'edit-patient-demographics'];
      const resources = permissionsToAccessPolicy(permissions);

      expect(resources).toHaveLength(1);
      expect(resources[0].resourceType).toBe('Patient');
      expect(resources[0].readonly).toBe(false); // Write permission overrides read
    });

    it('should aggregate multiple permissions for same resource', () => {
      const permissions = ['view-encounters', 'create-encounter', 'edit-encounter'];
      const resources = permissionsToAccessPolicy(permissions);

      expect(resources).toHaveLength(1);
      expect(resources[0].resourceType).toBe('Encounter');
      expect(resources[0].readonly).toBe(false);
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
});
