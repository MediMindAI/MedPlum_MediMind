// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { MockClient } from '@medplum/mock';
import type { Practitioner, ProjectMembership } from '@medplum/fhirtypes';
import { PractitionerRole } from '@medplum/fhirtypes';
import {
  createPractitioner,
  searchPractitioners,
  updatePractitioner,
  getPractitionerById,
  deactivatePractitioner,
  reactivatePractitioner,
} from './accountService';
import type { AccountFormValues } from '../types/account-management';

describe('accountService', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
  });

  describe('createPractitioner (T017)', () => {
    it('should create practitioner using Medplum Invite API', async () => {
      const values: AccountFormValues = {
        firstName: 'თენგიზი',
        lastName: 'ხოზვრია',
        email: 'tengizi@medimind.ge',
        gender: 'male',
        phoneNumber: '+995500050610',
        role: 'physician',
        specialty: '207RC0000X',
        active: true,
      };

      const mockMembership: ProjectMembership = {
        resourceType: 'ProjectMembership',
        id: 'membership-123',
        project: { reference: 'Project/hospital-xyz' },
        user: { reference: 'User/user-123' },
        profile: { reference: 'Practitioner/practitioner-123', display: 'თენგიზი ხოზვრია' },
      };

      medplum.post = jest.fn().mockResolvedValue(mockMembership);

      const result = await createPractitioner(medplum, values);

      expect(medplum.post).toHaveBeenCalledWith(
        expect.stringContaining('admin/projects/'),
        expect.objectContaining({
          resourceType: 'Practitioner',
          firstName: 'თენგიზი',
          lastName: 'ხოზვრია',
          email: 'tengizi@medimind.ge',
          sendEmail: true,
        })
      );

      expect(result).toEqual(mockMembership);
    });

    it('should create practitioner with custom password', async () => {
      const values: AccountFormValues = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@medimind.ge',
        gender: 'male',
      };

      const mockMembership: ProjectMembership = {
        resourceType: 'ProjectMembership',
        id: 'membership-456',
        project: { reference: 'Project/hospital-xyz' },
        user: { reference: 'User/user-456' },
        profile: { reference: 'Practitioner/practitioner-456' },
      };

      medplum.post = jest.fn().mockResolvedValue(mockMembership);

      const result = await createPractitioner(medplum, values, 'CustomP@ssw0rd123');

      expect(medplum.post).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          password: 'CustomP@ssw0rd123',
        })
      );

      expect(result).toEqual(mockMembership);
    });

    it('should throw error when email is missing', async () => {
      const values: AccountFormValues = {
        firstName: 'Test',
        lastName: 'User',
        email: '',
        gender: 'unknown',
      };

      await expect(createPractitioner(medplum, values)).rejects.toThrow('Email is required');
    });
  });

  describe('searchPractitioners (T018)', () => {
    it('should search practitioners with name filter', async () => {
      const mockPractitioners: Practitioner[] = [
        {
          resourceType: 'Practitioner',
          id: 'practitioner-1',
          name: [{ family: 'ხოზვრია', given: ['თენგიზი'] }],
          active: true,
        },
        {
          resourceType: 'Practitioner',
          id: 'practitioner-2',
          name: [{ family: 'გელაშვილი', given: ['ნინო'] }],
          active: true,
        },
      ];

      medplum.searchResources = jest.fn().mockResolvedValue(mockPractitioners);

      const result = await searchPractitioners(medplum, { name: 'თენგიზი' });

      expect(medplum.searchResources).toHaveBeenCalledWith(
        'Practitioner',
        expect.objectContaining({
          'name:contains': 'თენგიზი',
        })
      );

      expect(result).toEqual(mockPractitioners);
    });

    it('should search practitioners with email filter', async () => {
      const mockPractitioners: Practitioner[] = [
        {
          resourceType: 'Practitioner',
          id: 'practitioner-1',
          telecom: [{ system: 'email', value: 'tengizi@medimind.ge', use: 'work' }],
          active: true,
        },
      ];

      medplum.searchResources = jest.fn().mockResolvedValue(mockPractitioners);

      const result = await searchPractitioners(medplum, { email: 'tengizi@medimind.ge' });

      expect(medplum.searchResources).toHaveBeenCalledWith(
        'Practitioner',
        expect.objectContaining({
          email: 'tengizi@medimind.ge',
        })
      );

      expect(result).toEqual(mockPractitioners);
    });

    it('should use cursor-based pagination with count 50', async () => {
      medplum.searchResources = jest.fn().mockResolvedValue([]);

      await searchPractitioners(medplum, {});

      expect(medplum.searchResources).toHaveBeenCalledWith(
        'Practitioner',
        expect.objectContaining({
          _count: '50',
          _sort: '-_lastUpdated',
        })
      );
    });

    it('should filter by active status', async () => {
      medplum.searchResources = jest.fn().mockResolvedValue([]);

      await searchPractitioners(medplum, { active: true });

      expect(medplum.searchResources).toHaveBeenCalledWith(
        'Practitioner',
        expect.objectContaining({
          active: 'true',
        })
      );
    });
  });

  describe('updatePractitioner (T019)', () => {
    it('should update practitioner resource', async () => {
      const existingPractitioner: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-123',
        name: [{ family: 'Smith', given: ['John'] }],
        active: true,
      };

      const updatedValues: AccountFormValues = {
        firstName: 'Jonathan',
        lastName: 'Smith',
        email: 'jonathan@medimind.ge',
        gender: 'male',
        phoneNumber: '+995555123456',
      };

      const mockUpdatedPractitioner: Practitioner = {
        ...existingPractitioner,
        name: [{ family: 'Smith', given: ['Jonathan'], use: 'official' }],
        telecom: [
          { system: 'email', value: 'jonathan@medimind.ge', use: 'work' },
          { system: 'phone', value: '+995555123456', use: 'work' },
        ],
      };

      medplum.updateResource = jest.fn().mockResolvedValue(mockUpdatedPractitioner);

      const result = await updatePractitioner(medplum, existingPractitioner, updatedValues);

      expect(medplum.updateResource).toHaveBeenCalledWith(
        expect.objectContaining({
          resourceType: 'Practitioner',
          id: 'practitioner-123',
          name: expect.arrayContaining([
            expect.objectContaining({
              family: 'Smith',
              given: expect.arrayContaining(['Jonathan']),
            }),
          ]),
        })
      );

      expect(result).toEqual(mockUpdatedPractitioner);
    });

    it('should preserve existing practitioner ID and meta', async () => {
      const existingPractitioner: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-999',
        meta: {
          versionId: '5',
          lastUpdated: '2025-11-19T10:00:00Z',
        },
        name: [{ family: 'Test', given: ['User'] }],
        active: true,
      };

      const updatedValues: AccountFormValues = {
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated@medimind.ge',
        gender: 'unknown',
      };

      medplum.updateResource = jest.fn().mockResolvedValue(existingPractitioner);

      await updatePractitioner(medplum, existingPractitioner, updatedValues);

      expect(medplum.updateResource).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'practitioner-999',
          meta: existingPractitioner.meta,
        })
      );
    });
  });

  describe('getPractitionerById', () => {
    it('should fetch practitioner by ID', async () => {
      const mockPractitioner: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-123',
        name: [{ family: 'ხოზვრია', given: ['თენგიზი'] }],
        active: true,
      };

      medplum.readResource = jest.fn().mockResolvedValue(mockPractitioner);

      const result = await getPractitionerById(medplum, 'practitioner-123');

      expect(medplum.readResource).toHaveBeenCalledWith('Practitioner', 'practitioner-123');
      expect(result).toEqual(mockPractitioner);
    });

    it('should throw error when practitioner not found', async () => {
      medplum.readResource = jest.fn().mockRejectedValue(new Error('Not found'));

      await expect(getPractitionerById(medplum, 'invalid-id')).rejects.toThrow('Not found');
    });
  });

  describe('deactivatePractitioner (T063)', () => {
    let adminPractitioner: Practitioner;
    let targetPractitioner: Practitioner;

    beforeEach(async () => {
      // Create admin practitioner (current user)
      adminPractitioner = await medplum.createResource<Practitioner>({
        resourceType: 'Practitioner',
        id: 'admin-123',
        active: true,
        name: [{ use: 'official', family: 'Admin', given: ['System'] }],
      });

      // Create target practitioner
      targetPractitioner = await medplum.createResource<Practitioner>({
        resourceType: 'Practitioner',
        id: 'practitioner-456',
        active: true,
        name: [{ use: 'official', family: 'ხოზვრია', given: ['თენგიზი'] }],
      });

      // Mock getProfile to return admin
      jest.spyOn(medplum, 'getProfile').mockReturnValue(adminPractitioner);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should deactivate an active practitioner', async () => {
      const updateSpy = jest.spyOn(medplum, 'updateResource');

      const result = await deactivatePractitioner(medplum, targetPractitioner.id!);

      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(result.active).toBe(false);
      expect(result.id).toBe(targetPractitioner.id);
    });

    it('should set active field to false', async () => {
      const result = await deactivatePractitioner(medplum, targetPractitioner.id!);
      expect(result.active).toBe(false);
    });

    it('should preserve all other practitioner data', async () => {
      const result = await deactivatePractitioner(medplum, targetPractitioner.id!);

      expect(result.name).toEqual(targetPractitioner.name);
      expect(result.resourceType).toBe('Practitioner');
    });

    it('should create audit event for deactivation', async () => {
      const createSpy = jest.spyOn(medplum, 'createResource');

      await deactivatePractitioner(medplum, targetPractitioner.id!);

      const auditCalls = createSpy.mock.calls.filter(
        call => call[0].resourceType === 'AuditEvent'
      );
      expect(auditCalls.length).toBeGreaterThan(0);

      const auditEvent = auditCalls[0][0];
      expect(auditEvent.action).toBe('D');
      expect(auditEvent.entity?.[0]?.what?.reference).toContain(targetPractitioner.id);
    });

    it('should prevent self-deactivation', async () => {
      jest.spyOn(medplum, 'getProfile').mockReturnValue(targetPractitioner);

      await expect(
        deactivatePractitioner(medplum, targetPractitioner.id!)
      ).rejects.toThrow('Cannot deactivate your own account');
    });

    it('should throw error if practitioner not found', async () => {
      await expect(
        deactivatePractitioner(medplum, 'nonexistent-999')
      ).rejects.toThrow();
    });

    it('should handle already inactive practitioner gracefully', async () => {
      await deactivatePractitioner(medplum, targetPractitioner.id!);
      const result = await deactivatePractitioner(medplum, targetPractitioner.id!);

      expect(result.active).toBe(false);
    });

    it('should include deactivation reason in audit event if provided', async () => {
      const createSpy = jest.spyOn(medplum, 'createResource');

      await deactivatePractitioner(medplum, targetPractitioner.id!, 'Employee terminated');

      const auditCalls = createSpy.mock.calls.filter(
        call => call[0].resourceType === 'AuditEvent'
      );
      const auditEvent = auditCalls[0][0];

      expect(auditEvent.entity?.[0]?.detail).toBeDefined();
      const reasonDetail = auditEvent.entity?.[0]?.detail?.find(d => d.type === 'reason');
      expect(reasonDetail?.valueString).toBe('Employee terminated');
    });

    it('should use DICOM Security Alert codes in audit event', async () => {
      const createSpy = jest.spyOn(medplum, 'createResource');

      await deactivatePractitioner(medplum, targetPractitioner.id!);

      const auditCalls = createSpy.mock.calls.filter(
        call => call[0].resourceType === 'AuditEvent'
      );
      const auditEvent = auditCalls[0][0];

      expect(auditEvent.type?.code).toBe('110113');
      expect(auditEvent.subtype?.[0]?.code).toBe('110137');
    });
  });

  describe('reactivatePractitioner (T064)', () => {
    let adminPractitioner: Practitioner;
    let targetPractitioner: Practitioner;

    beforeEach(async () => {
      adminPractitioner = await medplum.createResource<Practitioner>({
        resourceType: 'Practitioner',
        id: 'admin-123',
        active: true,
        name: [{ use: 'official', family: 'Admin', given: ['System'] }],
      });

      targetPractitioner = await medplum.createResource<Practitioner>({
        resourceType: 'Practitioner',
        id: 'practitioner-456',
        active: false,
        name: [{ use: 'official', family: 'ხოზვრია', given: ['თენგიზი'] }],
      });

      jest.spyOn(medplum, 'getProfile').mockReturnValue(adminPractitioner);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should reactivate an inactive practitioner', async () => {
      const updateSpy = jest.spyOn(medplum, 'updateResource');

      const result = await reactivatePractitioner(medplum, targetPractitioner.id!);

      expect(updateSpy).toHaveBeenCalled();
      expect(result.active).toBe(true);
      expect(result.id).toBe(targetPractitioner.id);
    });

    it('should set active field to true', async () => {
      const result = await reactivatePractitioner(medplum, targetPractitioner.id!);
      expect(result.active).toBe(true);
    });

    it('should preserve all other practitioner data', async () => {
      const result = await reactivatePractitioner(medplum, targetPractitioner.id!);

      expect(result.name).toEqual(targetPractitioner.name);
      expect(result.resourceType).toBe('Practitioner');
    });

    it('should create audit event for reactivation', async () => {
      const createSpy = jest.spyOn(medplum, 'createResource');

      await reactivatePractitioner(medplum, targetPractitioner.id!);

      const auditCalls = createSpy.mock.calls.filter(
        call => call[0].resourceType === 'AuditEvent'
      );

      expect(auditCalls.length).toBeGreaterThan(0);
      const auditEvent = auditCalls[0][0];
      expect(auditEvent.action).toBe('U');
      expect(auditEvent.entity?.[0]?.what?.reference).toContain(targetPractitioner.id);
    });

    it('should throw error if practitioner not found', async () => {
      await expect(
        reactivatePractitioner(medplum, 'nonexistent-999')
      ).rejects.toThrow();
    });

    it('should handle already active practitioner gracefully', async () => {
      await reactivatePractitioner(medplum, targetPractitioner.id!);
      const result = await reactivatePractitioner(medplum, targetPractitioner.id!);

      expect(result.active).toBe(true);
    });

    it('should include reactivation reason in audit event if provided', async () => {
      const createSpy = jest.spyOn(medplum, 'createResource');

      await reactivatePractitioner(medplum, targetPractitioner.id!, 'Employee rehired');

      const auditCalls = createSpy.mock.calls.filter(
        call => call[0].resourceType === 'AuditEvent'
      );
      const auditEvent = auditCalls[0][0];

      expect(auditEvent.entity?.[0]?.detail).toBeDefined();
      const reasonDetail = auditEvent.entity?.[0]?.detail?.find(d => d.type === 'reason');
      expect(reasonDetail?.valueString).toBe('Employee rehired');
    });

    it('should use DICOM Security Alert codes in audit event', async () => {
      const createSpy = jest.spyOn(medplum, 'createResource');

      await reactivatePractitioner(medplum, targetPractitioner.id!);

      const auditCalls = createSpy.mock.calls.filter(
        call => call[0].resourceType === 'AuditEvent'
      );
      const auditEvent = auditCalls[0][0];

      expect(auditEvent.type?.code).toBe('110113');
      expect(auditEvent.subtype?.[0]?.code).toBe('110137');
    });

    it('should return updated practitioner with active=true', async () => {
      const result = await reactivatePractitioner(medplum, targetPractitioner.id!);

      expect(result).toBeDefined();
      expect(result.resourceType).toBe('Practitioner');
      expect(result.id).toBe(targetPractitioner.id);
      expect(result.active).toBe(true);
    });
  });
});
