// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { createDepartmentScopedRole } from './roleService';
import type { AccessPolicy } from '@medplum/fhirtypes';
import type { RoleFormValues } from '../types/role-management';

describe('createDepartmentScopedRole', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
  });

  it('creates a department-scoped role with scoping criteria', async () => {
    const roleValues: RoleFormValues = {
      code: 'dept-physician',
      name: 'Department Physician',
      description: 'Physician scoped to department',
      status: 'active',
      permissions: ['view-patient-demographics', 'view-encounters'],
    };

    const created = await createDepartmentScopedRole(medplum, roleValues, 'dept-cardiology');

    expect(created).toBeDefined();
    expect(created.resourceType).toBe('AccessPolicy');
    expect(created.meta?.tag).toContainEqual({
      system: 'http://medimind.ge/role-identifier',
      code: 'dept-physician',
      display: 'Department Physician',
    });
    expect(created.meta?.tag).toContainEqual({
      system: 'http://medimind.ge/department-scope',
      code: 'dept-cardiology',
      display: 'Department Scoped',
    });
  });

  it('applies department scoping to Patient resources', async () => {
    const roleValues: RoleFormValues = {
      code: 'dept-nurse',
      name: 'Department Nurse',
      status: 'active',
      permissions: ['view-patient-demographics'],
    };

    const created = await createDepartmentScopedRole(medplum, roleValues, 'dept-001');

    // Check that Patient resources have department scoping criteria
    const patientResource = created.resource?.find((r) => r.resourceType === 'Patient');
    expect(patientResource?.criteria).toBe('Patient?_compartment=Organization/dept-001');
  });

  it('applies department scoping to Encounter resources', async () => {
    const roleValues: RoleFormValues = {
      code: 'dept-physician',
      name: 'Department Physician',
      status: 'active',
      permissions: ['view-encounters'],
    };

    const created = await createDepartmentScopedRole(medplum, roleValues, 'dept-radiology');

    const encounterResource = created.resource?.find((r) => r.resourceType === 'Encounter');
    expect(encounterResource?.criteria).toBe('Encounter?_compartment=Organization/dept-radiology');
  });

  it('does not apply scoping to non-scoped resources', async () => {
    const roleValues: RoleFormValues = {
      code: 'dept-admin',
      name: 'Department Admin',
      status: 'active',
      permissions: ['view-users', 'view-roles'],
    };

    const created = await createDepartmentScopedRole(medplum, roleValues, 'dept-001');

    // Practitioner and AccessPolicy should not have department scoping
    const practitionerResource = created.resource?.find((r) => r.resourceType === 'Practitioner');
    expect(practitionerResource?.criteria).toBeUndefined();

    const accessPolicyResource = created.resource?.find((r) => r.resourceType === 'AccessPolicy');
    expect(accessPolicyResource?.criteria).toBeUndefined();
  });

  it('creates audit event for department-scoped role', async () => {
    const roleValues: RoleFormValues = {
      code: 'dept-physician',
      name: 'Department Physician',
      status: 'active',
      permissions: ['view-patient-demographics'],
    };

    const createSpy = jest.spyOn(medplum, 'createResource');

    await createDepartmentScopedRole(medplum, roleValues, 'dept-cardiology');

    // Check that audit event was created (2nd call after AccessPolicy creation)
    expect(createSpy).toHaveBeenCalledTimes(2);
    const auditCall = createSpy.mock.calls[1][0];
    expect(auditCall.resourceType).toBe('AuditEvent');
  });

  it('includes description in role tags', async () => {
    const roleValues: RoleFormValues = {
      code: 'dept-nurse',
      name: 'Department Nurse',
      description: 'Nurse limited to specific department',
      status: 'active',
      permissions: ['view-patient-demographics'],
    };

    const created = await createDepartmentScopedRole(medplum, roleValues, 'dept-001');

    expect(created.meta?.tag).toContainEqual({
      system: 'http://medimind.ge/role-description',
      code: 'description',
      display: 'Nurse limited to specific department',
    });
  });

  it('sets status tag correctly', async () => {
    const activeRole: RoleFormValues = {
      code: 'dept-active',
      name: 'Active Role',
      status: 'active',
      permissions: ['view-patient-demographics'],
    };

    const created = await createDepartmentScopedRole(medplum, activeRole, 'dept-001');

    expect(created.meta?.tag).toContainEqual({
      system: 'http://medimind.ge/role-status',
      code: 'active',
      display: 'Active',
    });
  });

  it('handles multiple permissions with dependency resolution', async () => {
    const roleValues: RoleFormValues = {
      code: 'dept-physician',
      name: 'Department Physician',
      status: 'active',
      permissions: ['edit-patient-demographics', 'create-encounter'],
    };

    const created = await createDepartmentScopedRole(medplum, roleValues, 'dept-001');

    // edit-patient-demographics depends on view-patient-demographics
    // Both should have Patient resource with department scoping
    const patientResource = created.resource?.find((r) => r.resourceType === 'Patient');
    expect(patientResource).toBeDefined();
    expect(patientResource?.criteria).toBe('Patient?_compartment=Organization/dept-001');

    const encounterResource = created.resource?.find((r) => r.resourceType === 'Encounter');
    expect(encounterResource).toBeDefined();
    expect(encounterResource?.criteria).toBe('Encounter?_compartment=Organization/dept-001');
  });

  it('creates role with correct FHIR structure', async () => {
    const roleValues: RoleFormValues = {
      code: 'dept-test',
      name: 'Test Role',
      status: 'active',
      permissions: ['view-patient-demographics'],
    };

    const created = await createDepartmentScopedRole(medplum, roleValues, 'dept-001');

    expect(created).toMatchObject({
      resourceType: 'AccessPolicy',
      meta: {
        tag: expect.arrayContaining([
          expect.objectContaining({
            system: 'http://medimind.ge/role-identifier',
          }),
          expect.objectContaining({
            system: 'http://medimind.ge/department-scope',
          }),
        ]),
      },
      resource: expect.any(Array),
    });
  });
});
