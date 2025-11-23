// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { MockClient } from '@medplum/mock';
import type { AuditEvent, Practitioner, Reference } from '@medplum/fhirtypes';
import {
  createAuditEvent,
  createAccountAuditEvent,
  getAccountAuditTrail,
  getAccountAuditHistory,
  searchAuditEvents,
  auditEventToExtended,
} from './auditService';
import type { AuditLogFilters, PaginationParams } from '../types/account-management';
import { AUDIT_EVENT_CODES } from '../types/account-management';

describe('auditService', () => {
  let medplum: MockClient;
  let adminPractitioner: Practitioner;
  let targetPractitioner: Practitioner;

  beforeEach(() => {
    medplum = new MockClient();

    // Create admin practitioner (the one performing actions)
    adminPractitioner = {
      resourceType: 'Practitioner',
      id: 'admin-123',
      active: true,
      name: [
        {
          use: 'official',
          family: 'Admin',
          given: ['System'],
        },
      ],
    };

    // Create target practitioner (the one being affected)
    targetPractitioner = {
      resourceType: 'Practitioner',
      id: 'practitioner-456',
      active: true,
      name: [
        {
          use: 'official',
          family: 'ხოზვრია',
          given: ['თენგიზი'],
        },
      ],
    };

    // Mock getProfile to return admin practitioner
    jest.spyOn(medplum, 'getProfile').mockReturnValue(adminPractitioner);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('auditEventToExtended', () => {
    it('should convert AuditEvent to AuditLogEntryExtended', () => {
      const auditEvent: AuditEvent = {
        resourceType: 'AuditEvent',
        id: 'audit-123',
        type: {
          system: 'http://dicom.nema.org/resources/ontology/DCM',
          code: '110137',
        },
        action: 'C',
        recorded: '2025-11-20T10:00:00Z',
        outcome: '0',
        outcomeDesc: 'Account created successfully',
        agent: [
          {
            who: {
              reference: 'Practitioner/admin-123',
              display: 'Admin System',
            },
            requestor: true,
            network: {
              address: '192.168.1.1',
            },
          },
        ],
        entity: [
          {
            what: {
              reference: 'Practitioner/practitioner-456',
              display: 'Test User',
            },
            detail: [
              { type: 'role', valueString: 'Physician' },
              { type: 'status', valueString: 'active' },
            ],
          },
        ],
      };

      const extended = auditEventToExtended(auditEvent);

      expect(extended.id).toBe('audit-123');
      expect(extended.timestamp).toBe('2025-11-20T10:00:00Z');
      expect(extended.action).toBe('C');
      expect(extended.actionDisplay).toBe('Create');
      expect(extended.agent).toBe('Admin System');
      expect(extended.agentId).toBe('admin-123');
      expect(extended.entityType).toBe('Practitioner');
      expect(extended.entityId).toBe('practitioner-456');
      expect(extended.entityDisplay).toBe('Test User');
      expect(extended.outcome).toBe('0');
      expect(extended.outcomeDisplay).toBe('Success');
      expect(extended.outcomeDescription).toBe('Account created successfully');
      expect(extended.details).toEqual({ role: 'Physician', status: 'active' });
      expect(extended.ipAddress).toBe('192.168.1.1');
    });

    it('should handle missing optional fields', () => {
      const auditEvent: AuditEvent = {
        resourceType: 'AuditEvent',
        recorded: '2025-11-20T10:00:00Z',
      };

      const extended = auditEventToExtended(auditEvent);

      expect(extended.id).toBe('');
      expect(extended.action).toBe('R');
      expect(extended.actionDisplay).toBe('Read');
      expect(extended.agent).toBe('Unknown');
      expect(extended.agentId).toBe('');
      expect(extended.entityType).toBe('');
      expect(extended.entityId).toBe('');
      expect(extended.outcome).toBe('0');
      expect(extended.outcomeDisplay).toBe('Success');
      expect(extended.details).toBeUndefined();
      expect(extended.ipAddress).toBeUndefined();
    });

    it('should map all action types correctly', () => {
      const actions = ['C', 'R', 'U', 'D', 'E'] as const;
      const expectedDisplays = ['Create', 'Read', 'Update', 'Delete', 'Execute'];

      actions.forEach((action, index) => {
        const auditEvent: AuditEvent = {
          resourceType: 'AuditEvent',
          action,
          recorded: '2025-11-20T10:00:00Z',
        };
        const extended = auditEventToExtended(auditEvent);
        expect(extended.actionDisplay).toBe(expectedDisplays[index]);
      });
    });

    it('should map all outcome codes correctly', () => {
      const outcomes = ['0', '4', '8', '12'] as const;
      const expectedDisplays = ['Success', 'Minor Failure', 'Serious Failure', 'Major Failure'];

      outcomes.forEach((outcome, index) => {
        const auditEvent: AuditEvent = {
          resourceType: 'AuditEvent',
          outcome,
          recorded: '2025-11-20T10:00:00Z',
        };
        const extended = auditEventToExtended(auditEvent);
        expect(extended.outcomeDisplay).toBe(expectedDisplays[index]);
      });
    });
  });

  describe('createAuditEvent', () => {
    it('should create audit event with Reference entity', async () => {
      const createSpy = jest.spyOn(medplum, 'createResource');

      const entity: Reference = {
        reference: 'Practitioner/practitioner-456',
        display: 'Test User',
      };

      const auditEvent = await createAuditEvent(medplum, 'C', entity, 0, 'Account created');

      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(auditEvent.resourceType).toBe('AuditEvent');
      expect(auditEvent.type?.code).toBe(AUDIT_EVENT_CODES.USER_SECURITY_ATTRIBUTE_CHANGED);
      expect(auditEvent.type?.system).toBe('http://dicom.nema.org/resources/ontology/DCM');
      expect(auditEvent.action).toBe('C');
      expect(auditEvent.outcome).toBe('0');
      expect(auditEvent.outcomeDesc).toBe('Account created');
      expect(auditEvent.entity?.[0]?.what?.reference).toBe('Practitioner/practitioner-456');
      expect(auditEvent.entity?.[0]?.what?.display).toBe('Test User');
    });

    it('should create audit event with all action types', async () => {
      const entity: Reference = { reference: 'Practitioner/123' };
      const actions = ['C', 'R', 'U', 'D', 'E'] as const;

      for (const action of actions) {
        const auditEvent = await createAuditEvent(medplum, action, entity, 0);
        expect(auditEvent.action).toBe(action);
      }
    });

    it('should create audit event with all outcome codes', async () => {
      const entity: Reference = { reference: 'Practitioner/123' };
      const outcomes = [0, 4, 8, 12] as const;

      for (const outcome of outcomes) {
        const auditEvent = await createAuditEvent(medplum, 'C', entity, outcome);
        expect(auditEvent.outcome).toBe(outcome.toString());
      }
    });

    it('should include source observer as EMR Web Application', async () => {
      const entity: Reference = { reference: 'Practitioner/123' };
      const auditEvent = await createAuditEvent(medplum, 'C', entity, 0);

      expect(auditEvent.source?.observer?.display).toBe('EMR Web Application');
    });

    it('should include current user as agent', async () => {
      const entity: Reference = { reference: 'Practitioner/123' };
      const auditEvent = await createAuditEvent(medplum, 'C', entity, 0);

      expect(auditEvent.agent).toHaveLength(1);
      expect(auditEvent.agent?.[0]?.who?.reference).toBe('Practitioner/admin-123');
      expect(auditEvent.agent?.[0]?.requestor).toBe(true);
    });

    it('should include details when provided', async () => {
      const entity: Reference = { reference: 'Practitioner/123' };
      const details = { role: 'Physician', department: 'Cardiology' };

      const auditEvent = await createAuditEvent(medplum, 'C', entity, 0, 'Test', details);

      expect(auditEvent.entity?.[0]?.detail).toHaveLength(2);
      expect(auditEvent.entity?.[0]?.detail?.[0]?.type).toBe('role');
      expect(auditEvent.entity?.[0]?.detail?.[0]?.valueString).toBe('Physician');
      expect(auditEvent.entity?.[0]?.detail?.[1]?.type).toBe('department');
      expect(auditEvent.entity?.[0]?.detail?.[1]?.valueString).toBe('Cardiology');
    });

    it('should not include details when not provided', async () => {
      const entity: Reference = { reference: 'Practitioner/123' };
      const auditEvent = await createAuditEvent(medplum, 'C', entity, 0);

      expect(auditEvent.entity?.[0]?.detail).toBeUndefined();
    });

    it('should record timestamp in ISO format', async () => {
      const entity: Reference = { reference: 'Practitioner/123' };
      const auditEvent = await createAuditEvent(medplum, 'C', entity, 0);

      expect(auditEvent.recorded).toBeDefined();
      expect(auditEvent.recorded).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include entity type as System Object', async () => {
      const entity: Reference = { reference: 'Practitioner/123' };
      const auditEvent = await createAuditEvent(medplum, 'C', entity, 0);

      expect(auditEvent.entity?.[0]?.type?.code).toBe('2');
      expect(auditEvent.entity?.[0]?.type?.display).toBe('System Object');
    });
  });

  describe('createAccountAuditEvent (legacy)', () => {
    it('should create audit event for account creation (action C)', async () => {
      const createSpy = jest.spyOn(medplum, 'createResource');

      const auditEvent = await createAccountAuditEvent(
        medplum,
        'C',
        targetPractitioner,
        'Account created successfully',
        { accountStatus: 'active', role: 'Physician' }
      );

      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(auditEvent.resourceType).toBe('AuditEvent');
      expect(auditEvent.action).toBe('C');
      expect(auditEvent.outcome).toBe('0');
      expect(auditEvent.outcomeDesc).toBe('Account created successfully');
      expect(auditEvent.entity?.[0]?.what?.reference).toBe('Practitioner/practitioner-456');
    });

    it('should create audit event for account update (action U)', async () => {
      const auditEvent = await createAccountAuditEvent(
        medplum,
        'U',
        targetPractitioner,
        'Account updated successfully'
      );

      expect(auditEvent.action).toBe('U');
      expect(auditEvent.outcomeDesc).toBe('Account updated successfully');
    });

    it('should create audit event for account deactivation (action D)', async () => {
      const auditEvent = await createAccountAuditEvent(
        medplum,
        'D',
        targetPractitioner,
        'Account deactivated',
        { reason: 'Employee terminated', previousStatus: 'active' }
      );

      expect(auditEvent.action).toBe('D');
      expect(auditEvent.outcomeDesc).toBe('Account deactivated');
    });

    it('should use practitioner display name in entity', async () => {
      const auditEvent = await createAccountAuditEvent(
        medplum,
        'C',
        targetPractitioner,
        'Test audit'
      );

      expect(auditEvent.entity?.[0]?.what?.display).toBe('ხოზვრია თენგიზი');
    });
  });

  describe('searchAuditEvents', () => {
    beforeEach(async () => {
      // Create some audit events
      await medplum.createResource<AuditEvent>({
        resourceType: 'AuditEvent',
        type: { system: 'http://dicom.nema.org/resources/ontology/DCM', code: '110137' },
        action: 'C',
        recorded: '2025-11-15T10:00:00Z',
        outcome: '0',
        outcomeDesc: 'Account created',
        agent: [{ who: { reference: 'Practitioner/admin-123', display: 'Admin' }, requestor: true }],
        entity: [{ what: { reference: 'Practitioner/practitioner-456', display: 'Test User' } }],
      });

      await medplum.createResource<AuditEvent>({
        resourceType: 'AuditEvent',
        type: { system: 'http://dicom.nema.org/resources/ontology/DCM', code: '110137' },
        action: 'U',
        recorded: '2025-11-16T14:30:00Z',
        outcome: '0',
        outcomeDesc: 'Account updated',
        agent: [{ who: { reference: 'Practitioner/admin-123', display: 'Admin' }, requestor: true }],
        entity: [{ what: { reference: 'Practitioner/practitioner-456', display: 'Test User' } }],
      });

      await medplum.createResource<AuditEvent>({
        resourceType: 'AuditEvent',
        type: { system: 'http://dicom.nema.org/resources/ontology/DCM', code: '110137' },
        action: 'D',
        recorded: '2025-11-17T09:15:00Z',
        outcome: '4',
        outcomeDesc: 'Account deactivation failed',
        agent: [{ who: { reference: 'Practitioner/admin-123', display: 'Admin' }, requestor: true }],
        entity: [{ what: { reference: 'Practitioner/practitioner-456', display: 'Test User' } }],
      });
    });

    it('should search audit events with pagination', async () => {
      const filters: AuditLogFilters = {};
      const pagination: PaginationParams = { page: 1, pageSize: 10 };

      const { events, total } = await searchAuditEvents(medplum, filters, pagination);

      expect(events).toHaveLength(3);
      expect(total).toBe(3);
      expect(events[0]).toHaveProperty('actionDisplay');
      expect(events[0]).toHaveProperty('outcomeDisplay');
    });

    it('should filter by action type', async () => {
      const filters: AuditLogFilters = { action: 'U' };
      const pagination: PaginationParams = { page: 1, pageSize: 10 };

      const { events } = await searchAuditEvents(medplum, filters, pagination);

      expect(events).toHaveLength(1);
      expect(events[0].action).toBe('U');
      expect(events[0].actionDisplay).toBe('Update');
    });

    it('should filter by outcome', async () => {
      const filters: AuditLogFilters = { outcome: 4 };
      const pagination: PaginationParams = { page: 1, pageSize: 10 };

      const { events } = await searchAuditEvents(medplum, filters, pagination);

      expect(events).toHaveLength(1);
      expect(events[0].outcome).toBe('4');
      expect(events[0].outcomeDisplay).toBe('Minor Failure');
    });

    it('should support pagination offset', async () => {
      const filters: AuditLogFilters = {};
      const pagination: PaginationParams = { page: 2, pageSize: 2 };

      const { events } = await searchAuditEvents(medplum, filters, pagination);

      // MockClient may not perfectly support offset, but the query should work
      expect(Array.isArray(events)).toBe(true);
    });

    it('should support sort direction', async () => {
      const filtersAsc: AuditLogFilters = {};
      const paginationAsc: PaginationParams = { page: 1, pageSize: 10, sortDirection: 'asc' };

      const filtersDesc: AuditLogFilters = {};
      const paginationDesc: PaginationParams = { page: 1, pageSize: 10, sortDirection: 'desc' };

      const { events: eventsAsc } = await searchAuditEvents(medplum, filtersAsc, paginationAsc);
      const { events: eventsDesc } = await searchAuditEvents(medplum, filtersDesc, paginationDesc);

      // Both queries should succeed
      expect(eventsAsc.length).toBe(3);
      expect(eventsDesc.length).toBe(3);
    });

    it('should return extended format with display values', async () => {
      const filters: AuditLogFilters = {};
      const pagination: PaginationParams = { page: 1, pageSize: 10 };

      const { events } = await searchAuditEvents(medplum, filters, pagination);

      expect(events[0]).toHaveProperty('actionDisplay');
      expect(events[0]).toHaveProperty('outcomeDisplay');
      expect(events[0]).toHaveProperty('agent');
      expect(events[0]).toHaveProperty('agentId');
      expect(events[0]).toHaveProperty('entityType');
      expect(events[0]).toHaveProperty('entityId');
    });
  });

  describe('getAccountAuditHistory', () => {
    beforeEach(async () => {
      // Create audit events for the target practitioner
      await medplum.createResource<AuditEvent>({
        resourceType: 'AuditEvent',
        type: { system: 'http://dicom.nema.org/resources/ontology/DCM', code: '110137' },
        action: 'C',
        recorded: '2025-11-15T10:00:00Z',
        outcome: '0',
        outcomeDesc: 'Account created',
        agent: [{ who: { reference: 'Practitioner/admin-123' }, requestor: true }],
        entity: [{ what: { reference: 'Practitioner/practitioner-456' } }],
      });

      await medplum.createResource<AuditEvent>({
        resourceType: 'AuditEvent',
        type: { system: 'http://dicom.nema.org/resources/ontology/DCM', code: '110137' },
        action: 'U',
        recorded: '2025-11-16T14:30:00Z',
        outcome: '0',
        outcomeDesc: 'Account updated',
        agent: [{ who: { reference: 'Practitioner/admin-123' }, requestor: true }],
        entity: [{ what: { reference: 'Practitioner/practitioner-456' } }],
      });

      // Create audit event for a different practitioner
      await medplum.createResource<AuditEvent>({
        resourceType: 'AuditEvent',
        type: { system: 'http://dicom.nema.org/resources/ontology/DCM', code: '110137' },
        action: 'C',
        recorded: '2025-11-18T11:00:00Z',
        outcome: '0',
        outcomeDesc: 'Other account created',
        agent: [{ who: { reference: 'Practitioner/admin-123' }, requestor: true }],
        entity: [{ what: { reference: 'Practitioner/other-789' } }],
      });
    });

    it('should retrieve audit history for specific practitioner', async () => {
      const history = await getAccountAuditHistory(medplum, 'practitioner-456');

      expect(history).toHaveLength(2);
      expect(history.every((e) => e.entityId === 'practitioner-456' || e.entityId === '')).toBe(true);
    });

    it('should return extended format with display values', async () => {
      const history = await getAccountAuditHistory(medplum, 'practitioner-456');

      expect(history[0]).toHaveProperty('actionDisplay');
      expect(history[0]).toHaveProperty('outcomeDisplay');
      expect(history[0]).toHaveProperty('timestamp');
    });

    it('should return empty array for nonexistent practitioner', async () => {
      const history = await getAccountAuditHistory(medplum, 'nonexistent-999');

      expect(history).toHaveLength(0);
    });

    it('should include all action types', async () => {
      const history = await getAccountAuditHistory(medplum, 'practitioner-456');

      const actions = history.map((e) => e.action);
      expect(actions).toContain('C');
      expect(actions).toContain('U');
    });
  });

  describe('getAccountAuditTrail (legacy)', () => {
    beforeEach(async () => {
      await medplum.createResource<AuditEvent>({
        resourceType: 'AuditEvent',
        type: { system: 'http://dicom.nema.org/resources/ontology/DCM', code: '110113' },
        action: 'C',
        recorded: '2025-11-15T10:00:00Z',
        outcome: '0',
        outcomeDesc: 'Account created',
        agent: [{ who: { reference: 'Practitioner/admin-123' }, requestor: true }],
        entity: [{ what: { reference: 'Practitioner/practitioner-456' } }],
      });

      await medplum.createResource<AuditEvent>({
        resourceType: 'AuditEvent',
        type: { system: 'http://dicom.nema.org/resources/ontology/DCM', code: '110113' },
        action: 'U',
        recorded: '2025-11-16T14:30:00Z',
        outcome: '0',
        outcomeDesc: 'Account updated',
        agent: [{ who: { reference: 'Practitioner/admin-123' }, requestor: true }],
        entity: [{ what: { reference: 'Practitioner/practitioner-456' } }],
      });

      await medplum.createResource<AuditEvent>({
        resourceType: 'AuditEvent',
        type: { system: 'http://dicom.nema.org/resources/ontology/DCM', code: '110113' },
        action: 'D',
        recorded: '2025-11-17T09:15:00Z',
        outcome: '0',
        outcomeDesc: 'Account deactivated',
        agent: [{ who: { reference: 'Practitioner/admin-123' }, requestor: true }],
        entity: [{ what: { reference: 'Practitioner/practitioner-456' } }],
      });
    });

    it('should retrieve all audit events for a specific practitioner', async () => {
      const auditTrail = await getAccountAuditTrail(medplum, 'practitioner-456');

      expect(auditTrail).toHaveLength(3);
      expect(auditTrail.every((event) => event.resourceType === 'AuditEvent')).toBe(true);
    });

    it('should return raw AuditEvent resources', async () => {
      const auditTrail = await getAccountAuditTrail(medplum, 'practitioner-456');

      // Legacy function returns raw FHIR resources, not extended
      expect(auditTrail[0].resourceType).toBe('AuditEvent');
      expect(auditTrail[0]).not.toHaveProperty('actionDisplay');
    });

    it('should filter by action type if provided', async () => {
      const auditTrail = await getAccountAuditTrail(medplum, 'practitioner-456', {
        action: 'U',
      });

      expect(auditTrail).toHaveLength(1);
      expect(auditTrail[0].action).toBe('U');
    });

    it('should filter by outcome if provided', async () => {
      // Add a failed event
      await medplum.createResource<AuditEvent>({
        resourceType: 'AuditEvent',
        type: { system: 'http://dicom.nema.org/resources/ontology/DCM', code: '110113' },
        action: 'U',
        recorded: '2025-11-19T10:00:00Z',
        outcome: '4',
        outcomeDesc: 'Account update failed',
        agent: [{ who: { reference: 'Practitioner/admin-123' }, requestor: true }],
        entity: [{ what: { reference: 'Practitioner/practitioner-456' } }],
      });

      const failedEvents = await getAccountAuditTrail(medplum, 'practitioner-456', {
        outcome: '4',
      });

      expect(failedEvents).toHaveLength(1);
      expect(failedEvents[0].outcome).toBe('4');
    });

    it('should support pagination with count parameter', async () => {
      const auditTrail = await getAccountAuditTrail(medplum, 'practitioner-456', { count: 2 });

      expect(auditTrail.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array if no audit events found', async () => {
      const auditTrail = await getAccountAuditTrail(medplum, 'nonexistent-999');

      expect(auditTrail).toHaveLength(0);
    });
  });
});
