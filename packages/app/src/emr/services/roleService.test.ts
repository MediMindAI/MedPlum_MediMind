import { MockClient } from '@medplum/mock';
import { PractitionerRole, Reference } from '@medplum/fhirtypes';
import {
  createPractitionerRole,
  getPractitionerRoles,
  updatePractitionerRole,
  deletePractitionerRole,
} from './roleService';

describe('roleService', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
  });

  describe('createPractitionerRole', () => {
    it('should create PractitionerRole with specialty and organization', async () => {
      const practitionerRef: Reference = {
        reference: 'Practitioner/test-practitioner-123',
        display: 'თენგიზი ხოზვრია',
      };

      const organizationRef: Reference = {
        reference: 'Organization/dept-cardiology',
        display: 'კარდიოლოგიის განყოფილება',
      };

      const role = await createPractitionerRole(medplum, {
        practitioner: practitionerRef,
        organization: organizationRef,
        roleCode: 'physician',
        specialtyCode: '207RC0000X', // Cardiovascular Disease
        period: { start: '2025-11-19' },
      });

      expect(role.resourceType).toBe('PractitionerRole');
      expect(role.active).toBe(true);
      expect(role.practitioner?.reference).toBe('Practitioner/test-practitioner-123');
      expect(role.organization?.reference).toBe('Organization/dept-cardiology');

      // Check role code
      expect(role.code).toBeDefined();
      expect(role.code?.[0]?.coding?.[0]?.code).toBe('physician');

      // Check specialty
      expect(role.specialty).toBeDefined();
      expect(role.specialty?.[0]?.coding?.[0]?.code).toBe('207RC0000X');
      expect(role.specialty?.[0]?.coding?.[0]?.system).toBe('http://nucc.org/provider-taxonomy');

      // Check period
      expect(role.period?.start).toBe('2025-11-19');
    });

    it('should create PractitionerRole without specialty (optional)', async () => {
      const practitionerRef: Reference = {
        reference: 'Practitioner/test-practitioner-456',
      };

      const organizationRef: Reference = {
        reference: 'Organization/dept-admin',
      };

      const role = await createPractitionerRole(medplum, {
        practitioner: practitionerRef,
        organization: organizationRef,
        roleCode: 'administrator',
      });

      expect(role.resourceType).toBe('PractitionerRole');
      expect(role.active).toBe(true);
      expect(role.code?.[0]?.coding?.[0]?.code).toBe('administrator');
      expect(role.specialty).toBeUndefined();
    });

    it('should create PractitionerRole with multiple locations', async () => {
      const practitionerRef: Reference = {
        reference: 'Practitioner/test-practitioner-789',
      };

      const organizationRef: Reference = {
        reference: 'Organization/dept-emergency',
      };

      const locations = [
        { reference: 'Location/building-a-floor-1' },
        { reference: 'Location/building-b-floor-2' },
      ];

      const role = await createPractitionerRole(medplum, {
        practitioner: practitionerRef,
        organization: organizationRef,
        roleCode: 'nurse',
        locations,
      });

      expect(role.location).toBeDefined();
      expect(role.location?.length).toBe(2);
      expect(role.location?.[0]?.reference).toBe('Location/building-a-floor-1');
      expect(role.location?.[1]?.reference).toBe('Location/building-b-floor-2');
    });
  });

  describe('getPractitionerRoles', () => {
    it('should fetch all roles for a practitioner', async () => {
      const practitionerId = 'test-practitioner-123';

      // Create mock roles
      const role1: PractitionerRole = {
        resourceType: 'PractitionerRole',
        id: 'role-1',
        active: true,
        practitioner: { reference: `Practitioner/${practitionerId}` },
        organization: { reference: 'Organization/dept-cardiology' },
        code: [
          {
            coding: [
              {
                system: 'http://medimind.ge/role-codes',
                code: 'physician',
              },
            ],
          },
        ],
      };

      const role2: PractitionerRole = {
        resourceType: 'PractitionerRole',
        id: 'role-2',
        active: true,
        practitioner: { reference: `Practitioner/${practitionerId}` },
        organization: { reference: 'Organization/dept-emergency' },
        code: [
          {
            coding: [
              {
                system: 'http://medimind.ge/role-codes',
                code: 'department-head',
              },
            ],
          },
        ],
      };

      await medplum.createResource(role1);
      await medplum.createResource(role2);

      const roles = await getPractitionerRoles(medplum, practitionerId);

      expect(roles).toBeDefined();
      expect(roles.length).toBe(2);
      // roles are sorted by -_lastUpdated, so most recent (role-2) comes first
      expect(roles[0].id).toBe('role-2');
      expect(roles[1].id).toBe('role-1');
    });

    it('should return empty array when practitioner has no roles', async () => {
      const roles = await getPractitionerRoles(medplum, 'non-existent-practitioner');

      expect(roles).toBeDefined();
      expect(roles.length).toBe(0);
    });

    it('should only return active roles', async () => {
      const practitionerId = 'test-practitioner-456';

      const activeRole: PractitionerRole = {
        resourceType: 'PractitionerRole',
        id: 'role-active',
        active: true,
        practitioner: { reference: `Practitioner/${practitionerId}` },
        organization: { reference: 'Organization/dept-cardiology' },
      };

      const inactiveRole: PractitionerRole = {
        resourceType: 'PractitionerRole',
        id: 'role-inactive',
        active: false,
        practitioner: { reference: `Practitioner/${practitionerId}` },
        organization: { reference: 'Organization/dept-emergency' },
      };

      await medplum.createResource(activeRole);
      await medplum.createResource(inactiveRole);

      const roles = await getPractitionerRoles(medplum, practitionerId);

      expect(roles.length).toBe(1);
      expect(roles[0].id).toBe('role-active');
      expect(roles[0].active).toBe(true);
    });
  });

  describe('updatePractitionerRole', () => {
    it('should update PractitionerRole specialty', async () => {
      const role: PractitionerRole = {
        resourceType: 'PractitionerRole',
        id: 'role-update-test',
        active: true,
        practitioner: { reference: 'Practitioner/test-123' },
        organization: { reference: 'Organization/dept-cardiology' },
        specialty: [
          {
            coding: [
              {
                system: 'http://nucc.org/provider-taxonomy',
                code: '207RC0000X',
              },
            ],
          },
        ],
      };

      const createdRole = await medplum.createResource(role);

      const updated = await updatePractitionerRole(medplum, createdRole.id!, {
        specialtyCode: '207P00000X', // Change to Emergency Medicine
      });

      expect(updated.specialty?.[0]?.coding?.[0]?.code).toBe('207P00000X');
    });

    it('should update PractitionerRole organization', async () => {
      const role: PractitionerRole = {
        resourceType: 'PractitionerRole',
        id: 'role-org-update',
        active: true,
        practitioner: { reference: 'Practitioner/test-456' },
        organization: { reference: 'Organization/dept-cardiology' },
      };

      const createdRole = await medplum.createResource(role);

      const updated = await updatePractitionerRole(medplum, createdRole.id!, {
        organization: { reference: 'Organization/dept-emergency' },
      });

      expect(updated.organization?.reference).toBe('Organization/dept-emergency');
    });

    it('should update PractitionerRole period', async () => {
      const role: PractitionerRole = {
        resourceType: 'PractitionerRole',
        id: 'role-period-update',
        active: true,
        practitioner: { reference: 'Practitioner/test-789' },
        organization: { reference: 'Organization/dept-surgery' },
        period: { start: '2025-01-01' },
      };

      const createdRole = await medplum.createResource(role);

      const updated = await updatePractitionerRole(medplum, createdRole.id!, {
        period: { start: '2025-01-01', end: '2025-12-31' },
      });

      expect(updated.period?.start).toBe('2025-01-01');
      expect(updated.period?.end).toBe('2025-12-31');
    });
  });

  describe('deletePractitionerRole', () => {
    it('should soft delete PractitionerRole by setting active=false', async () => {
      const role: PractitionerRole = {
        resourceType: 'PractitionerRole',
        id: 'role-delete-test',
        active: true,
        practitioner: { reference: 'Practitioner/test-123' },
        organization: { reference: 'Organization/dept-cardiology' },
      };

      const createdRole = await medplum.createResource(role);

      const deleted = await deletePractitionerRole(medplum, createdRole.id!);

      expect(deleted.active).toBe(false);
    });

    it('should hard delete PractitionerRole when hardDelete=true', async () => {
      const role: PractitionerRole = {
        resourceType: 'PractitionerRole',
        id: 'role-hard-delete-test',
        active: true,
        practitioner: { reference: 'Practitioner/test-456' },
        organization: { reference: 'Organization/dept-emergency' },
      };

      const createdRole = await medplum.createResource(role);

      await deletePractitionerRole(medplum, createdRole.id!, true);

      // Verify role is deleted (should throw error when reading)
      await expect(medplum.readResource('PractitionerRole', createdRole.id!)).rejects.toThrow();
    });

    it('should throw error when deleting non-existent role', async () => {
      await expect(deletePractitionerRole(medplum, 'non-existent-role')).rejects.toThrow();
    });
  });
});
