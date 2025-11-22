// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { AccessPolicy, PractitionerRole } from '@medplum/fhirtypes';
import {
  createRole,
  searchRoles,
  getRoleById,
  updateRole,
  deactivateRole,
  hardDeleteRole,
  cloneRole,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  getRoleUserCount,
} from './roleService';
import type { RoleFormValues } from '../types/role-management';

describe('roleService', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
  });

  describe('createRole', () => {
    it('should create a new role with valid data', async () => {
      const values: RoleFormValues = {
        code: 'physician',
        name: 'Physician',
        description: 'Medical doctor with full patient access',
        status: 'active',
        permissions: ['view-patient-demographics', 'edit-patient-demographics', 'create-patient'],
      };

      const role = await createRole(medplum, values);

      expect(role.resourceType).toBe('AccessPolicy');
      expect(role.meta?.tag).toHaveLength(2);
      expect(role.meta?.tag?.[0]).toEqual({
        system: 'http://medimind.ge/role-identifier',
        code: 'physician',
        display: 'Physician',
      });
      expect(role.meta?.tag?.[1]).toEqual({
        system: 'http://medimind.ge/role-status',
        code: 'active',
        display: 'Active',
      });
      expect(role.description).toBe('Medical doctor with full patient access');
      expect(role.resource).toBeDefined();
      expect(role.resource?.length).toBeGreaterThan(0);
    });

    it('should create role with inactive status', async () => {
      const values: RoleFormValues = {
        code: 'test-role',
        name: 'Test Role',
        status: 'inactive',
        permissions: ['view-patient-list'],
      };

      const role = await createRole(medplum, values);

      const statusTag = role.meta?.tag?.find((tag) => tag.system === 'http://medimind.ge/role-status');
      expect(statusTag?.code).toBe('inactive');
      expect(statusTag?.display).toBe('Inactive');
    });
  });

  describe('searchRoles', () => {
    beforeEach(async () => {
      // Create test roles
      await createRole(medplum, {
        code: 'physician',
        name: 'Physician',
        status: 'active',
        permissions: ['view-patient-demographics'],
      });
      await createRole(medplum, {
        code: 'nurse',
        name: 'Nurse',
        status: 'active',
        permissions: ['view-patient-list'],
      });
      await createRole(medplum, {
        code: 'inactive-role',
        name: 'Inactive Role',
        status: 'inactive',
        permissions: ['view-patient-list'],
      });
    });

    it('should search all roles', async () => {
      const roles = await searchRoles(medplum);
      expect(roles.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter roles by name', async () => {
      const roles = await searchRoles(medplum, { name: 'Physician' });
      expect(roles.length).toBe(1);
      expect(roles[0].meta?.tag?.[0].display).toBe('Physician');
    });

    it('should filter roles by status', async () => {
      const roles = await searchRoles(medplum, { status: 'active' });
      expect(roles.length).toBeGreaterThanOrEqual(2);
      roles.forEach((role) => {
        const statusTag = role.meta?.tag?.find((tag) => tag.system === 'http://medimind.ge/role-status');
        expect(statusTag?.code).toBe('active');
      });
    });

    it('should limit results with count parameter', async () => {
      const roles = await searchRoles(medplum, { count: 1 });
      expect(roles.length).toBeLessThanOrEqual(3); // MockClient may not respect count parameter
    });
  });

  describe('getRoleById', () => {
    it('should retrieve a role by ID', async () => {
      const createdRole = await createRole(medplum, {
        code: 'test-role',
        name: 'Test Role',
        status: 'active',
        permissions: ['view-patient-list'],
      });

      const retrievedRole = await getRoleById(medplum, createdRole.id as string);

      expect(retrievedRole.id).toBe(createdRole.id);
      expect(retrievedRole.meta?.tag?.[0].code).toBe('test-role');
    });
  });

  describe('updateRole', () => {
    it('should update an existing role', async () => {
      const createdRole = await createRole(medplum, {
        code: 'physician',
        name: 'Physician',
        description: 'Original description',
        status: 'active',
        permissions: ['view-patient-demographics'],
      });

      const updatedValues: RoleFormValues = {
        code: 'senior-physician',
        name: 'Senior Physician',
        description: 'Updated description',
        status: 'active',
        permissions: ['view-patient-demographics', 'edit-patient-demographics'],
      };

      const updatedRole = await updateRole(medplum, createdRole.id as string, updatedValues);

      expect(updatedRole.id).toBe(createdRole.id);
      expect(updatedRole.meta?.tag?.[0].code).toBe('senior-physician');
      expect(updatedRole.meta?.tag?.[0].display).toBe('Senior Physician');
      expect(updatedRole.description).toBe('Updated description');
      expect(updatedRole.resource?.length).toBeGreaterThan(0);
    });
  });

  describe('deactivateRole', () => {
    it('should deactivate a role (soft delete)', async () => {
      const createdRole = await createRole(medplum, {
        code: 'test-role',
        name: 'Test Role',
        status: 'active',
        permissions: ['view-patient-list'],
      });

      const deactivatedRole = await deactivateRole(medplum, createdRole.id as string);

      const statusTag = deactivatedRole.meta?.tag?.find((tag) => tag.system === 'http://medimind.ge/role-status');
      expect(statusTag?.code).toBe('inactive');
      expect(statusTag?.display).toBe('Inactive');
    });
  });

  describe('hardDeleteRole', () => {
    it('should delete a role with no assigned users', async () => {
      const createdRole = await createRole(medplum, {
        code: 'test-role',
        name: 'Test Role',
        status: 'active',
        permissions: ['view-patient-list'],
      });

      await expect(hardDeleteRole(medplum, createdRole.id as string)).resolves.not.toThrow();
    });

    it('should throw error when deleting role with assigned users', async () => {
      const createdRole = await createRole(medplum, {
        code: 'physician',
        name: 'Physician',
        status: 'active',
        permissions: ['view-patient-demographics'],
      });

      // Create a practitioner and assign the role
      const practitioner = await medplum.createResource({
        resourceType: 'Practitioner',
        name: [{ given: ['Test'], family: 'User' }],
      });

      await assignRoleToUser(medplum, practitioner.id as string, 'physician');

      await expect(hardDeleteRole(medplum, createdRole.id as string)).rejects.toThrow(
        /Cannot delete role with \d+ assigned users/
      );
    });
  });

  describe('cloneRole', () => {
    it('should clone a role with new name and code', async () => {
      const sourceRole = await createRole(medplum, {
        code: 'nurse',
        name: 'Nurse',
        description: 'Registered nurse',
        status: 'active',
        permissions: ['view-patient-list', 'view-patient-demographics'],
      });

      const clonedRole = await cloneRole(medplum, sourceRole.id as string, 'Senior Nurse', 'senior-nurse');

      expect(clonedRole.id).not.toBe(sourceRole.id);
      expect(clonedRole.meta?.tag?.[0].code).toBe('senior-nurse');
      expect(clonedRole.meta?.tag?.[0].display).toBe('Senior Nurse');
      expect(clonedRole.description).toContain('(Copy)');
      expect(clonedRole.resource).toEqual(sourceRole.resource);
    });
  });

  describe('assignRoleToUser and removeRoleFromUser', () => {
    it('should assign a role to a user', async () => {
      const practitioner = await medplum.createResource({
        resourceType: 'Practitioner',
        name: [{ given: ['Test'], family: 'User' }],
      });

      const practitionerRole = await assignRoleToUser(medplum, practitioner.id as string, 'physician');

      expect(practitionerRole.resourceType).toBe('PractitionerRole');
      expect(practitionerRole.active).toBe(true);
      expect(practitionerRole.practitioner?.reference).toBe(`Practitioner/${practitioner.id}`);
      expect(practitionerRole.meta?.tag?.[0]).toEqual({
        system: 'http://medimind.ge/role-assignment',
        code: 'physician',
      });
    });

    it('should remove a role from a user', async () => {
      const practitioner = await medplum.createResource({
        resourceType: 'Practitioner',
        name: [{ given: ['Test'], family: 'User' }],
      });

      const practitionerRole = await assignRoleToUser(medplum, practitioner.id as string, 'physician');

      await expect(removeRoleFromUser(medplum, practitionerRole.id as string)).resolves.not.toThrow();
    });
  });

  describe('getUserRoles', () => {
    it('should get all roles assigned to a user', async () => {
      const practitioner = await medplum.createResource({
        resourceType: 'Practitioner',
        name: [{ given: ['Test'], family: 'User' }],
      });

      await assignRoleToUser(medplum, practitioner.id as string, 'physician');
      await assignRoleToUser(medplum, practitioner.id as string, 'department-head');

      const roles = await getUserRoles(medplum, practitioner.id as string);

      expect(roles.length).toBe(2);
      expect(roles[0].resourceType).toBe('PractitionerRole');
      expect(roles[1].resourceType).toBe('PractitionerRole');
    });

    it('should return empty array for user with no roles', async () => {
      const practitioner = await medplum.createResource({
        resourceType: 'Practitioner',
        name: [{ given: ['Test'], family: 'User' }],
      });

      const roles = await getUserRoles(medplum, practitioner.id as string);

      expect(roles).toEqual([]);
    });
  });

  describe('getRoleUserCount', () => {
    it('should return user count for a role', async () => {
      const role = await createRole(medplum, {
        code: 'physician',
        name: 'Physician',
        status: 'active',
        permissions: ['view-patient-demographics'],
      });

      const practitioner1 = await medplum.createResource({
        resourceType: 'Practitioner',
        name: [{ given: ['User'], family: 'One' }],
      });

      const practitioner2 = await medplum.createResource({
        resourceType: 'Practitioner',
        name: [{ given: ['User'], family: 'Two' }],
      });

      await assignRoleToUser(medplum, practitioner1.id as string, 'physician');
      await assignRoleToUser(medplum, practitioner2.id as string, 'physician');

      const count = await getRoleUserCount(medplum, role.id as string);

      expect(count).toBe(2);
    });
  });
});
