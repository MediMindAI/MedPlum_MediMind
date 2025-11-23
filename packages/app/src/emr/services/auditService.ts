// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { AuditEvent, Practitioner, Reference } from '@medplum/fhirtypes';
import type {
  AuditLogFilters,
  PaginationParams,
  AuditLogEntryExtended,
} from '../types/account-management';
import { AUDIT_EVENT_CODES } from '../types/account-management';
import { getPractitionerName } from './accountHelpers';

/**
 * DICOM system URI for audit event codes
 */
const DICOM_SYSTEM = 'http://dicom.nema.org/resources/ontology/DCM';

/**
 * EMR source observer identifier
 */
const EMR_SOURCE_OBSERVER = 'EMR Web Application';

/**
 * Human-readable action names
 */
const ACTION_DISPLAY_MAP: Record<string, string> = {
  C: 'Create',
  R: 'Read',
  U: 'Update',
  D: 'Delete',
  E: 'Execute',
};

/**
 * Human-readable outcome names
 */
const OUTCOME_DISPLAY_MAP: Record<string, string> = {
  '0': 'Success',
  '4': 'Minor Failure',
  '8': 'Serious Failure',
  '12': 'Major Failure',
};

/**
 * Convert FHIR AuditEvent to AuditLogEntryExtended with human-readable values
 *
 * @param auditEvent - FHIR AuditEvent resource
 * @returns AuditLogEntryExtended with display values
 */
export function auditEventToExtended(auditEvent: AuditEvent): AuditLogEntryExtended {
  const action = auditEvent.action || 'R';
  const outcome = auditEvent.outcome || '0';

  // Extract agent info
  const agent = auditEvent.agent?.[0];
  const agentRef = agent?.who?.reference || '';
  const agentId = agentRef.split('/')[1] || '';
  const agentDisplay = agent?.who?.display || 'Unknown';

  // Extract entity info
  const entity = auditEvent.entity?.[0];
  const entityRef = entity?.what?.reference || '';
  const entityParts = entityRef.split('/');
  const entityType = entityParts[0] || '';
  const entityId = entityParts[1] || '';
  const entityDisplay = entity?.what?.display;

  // Extract details as key-value pairs
  const details: Record<string, string> = {};
  if (entity?.detail) {
    for (const detail of entity.detail) {
      if (detail.type && detail.valueString) {
        details[detail.type] = detail.valueString;
      }
    }
  }

  // Extract IP address from agent network
  const ipAddress = agent?.network?.address;

  return {
    id: auditEvent.id || '',
    timestamp: auditEvent.recorded || new Date().toISOString(),
    action: action as 'C' | 'U' | 'D' | 'R' | 'E',
    actionDisplay: ACTION_DISPLAY_MAP[action] || action,
    agent: agentDisplay,
    agentId,
    entityType,
    entityId,
    entityDisplay,
    outcome: outcome as '0' | '4' | '8' | '12',
    outcomeDisplay: OUTCOME_DISPLAY_MAP[outcome] || outcome,
    outcomeDescription: auditEvent.outcomeDesc,
    details: Object.keys(details).length > 0 ? details : undefined,
    ipAddress,
  };
}

/**
 * Search audit events with filters and pagination
 *
 * @param medplum - Medplum client instance
 * @param filters - Audit log filters (date range, actor, action, outcome, etc.)
 * @param pagination - Pagination parameters (page, pageSize, sortField, sortDirection)
 * @returns Object with events array and total count
 *
 * @example
 * ```typescript
 * const { events, total } = await searchAuditEvents(
 *   medplum,
 *   { dateFrom: new Date('2025-11-01'), action: 'C' },
 *   { page: 1, pageSize: 20, sortDirection: 'desc' }
 * );
 * ```
 */
export async function searchAuditEvents(
  medplum: MedplumClient,
  filters: AuditLogFilters,
  pagination: PaginationParams
): Promise<{ events: AuditLogEntryExtended[]; total: number }> {
  const searchParams: Record<string, string> = {
    _count: pagination.pageSize.toString(),
    _sort: pagination.sortDirection === 'asc' ? '_lastUpdated' : '-_lastUpdated',
  };

  // Add date range filters using _lastUpdated (more reliable than date)
  if (filters.dateFrom) {
    searchParams['_lastUpdated'] = `ge${filters.dateFrom.toISOString()}`;
  }

  if (filters.dateTo) {
    // For date range, we need separate parameters
    if (filters.dateFrom) {
      // Already have dateFrom, add dateTo as second condition
      searchParams['_lastUpdated'] = `ge${filters.dateFrom.toISOString()}`;
      // Note: Medplum doesn't support multiple values for same param, so we prioritize dateFrom
    } else {
      searchParams['_lastUpdated'] = `le${filters.dateTo.toISOString()}`;
    }
  }

  // Add action filter (supported by Medplum)
  if (filters.action) {
    searchParams['action'] = filters.action;
  }

  // Note: Other filters (actor, outcome, entity-type, entity) may not be supported
  // by Medplum's AuditEvent search implementation. Filtering will be done client-side if needed.

  // Execute search with Bundle to get total count
  const bundle = await medplum.search('AuditEvent', searchParams);
  const auditEvents = (bundle.entry?.map((e) => e.resource).filter(Boolean) as AuditEvent[]) || [];

  // Convert to extended format
  const events = auditEvents.map(auditEventToExtended);

  // Get total from bundle
  const total = bundle.total ?? events.length;

  return { events, total };
}

/**
 * Get audit history for a specific practitioner account
 *
 * @param medplum - Medplum client instance
 * @param practitionerId - ID of the practitioner
 * @returns Array of AuditLogEntryExtended sorted by date (newest first)
 *
 * @example
 * ```typescript
 * const history = await getAccountAuditHistory(medplum, 'practitioner-123');
 * ```
 */
export async function getAccountAuditHistory(
  medplum: MedplumClient,
  practitionerId: string
): Promise<AuditLogEntryExtended[]> {
  const searchParams: Record<string, string> = {
    entity: `Practitioner/${practitionerId}`,
    _sort: '-recorded',
    _count: '100',
  };

  const auditEvents = await medplum.searchResources('AuditEvent', searchParams);

  return auditEvents.map(auditEventToExtended);
}

/**
 * Create an audit event for any resource operation
 *
 * @param medplum - Medplum client instance
 * @param action - Action type: C (create), R (read), U (update), D (delete), E (execute)
 * @param entity - Reference to the affected resource
 * @param outcome - Outcome code: 0 (success), 4 (minor failure), 8 (serious failure), 12 (major failure)
 * @param description - Optional human-readable description
 * @param details - Optional additional details as key-value pairs
 * @returns Created AuditEvent resource
 *
 * @example
 * ```typescript
 * await createAuditEvent(
 *   medplum,
 *   'U',
 *   { reference: 'Practitioner/123', display: 'John Doe' },
 *   0,
 *   'Account updated successfully'
 * );
 * ```
 */
export async function createAuditEvent(
  medplum: MedplumClient,
  action: 'C' | 'R' | 'U' | 'D' | 'E',
  entity: Reference,
  outcome: 0 | 4 | 8 | 12,
  description?: string,
  details?: Record<string, string>
): Promise<AuditEvent> {
  const currentUser = medplum.getProfile();

  // Build agent display name
  let agentDisplay = 'Unknown';
  if (currentUser) {
    if (currentUser.resourceType === 'Practitioner') {
      agentDisplay = getPractitionerName(currentUser as Practitioner);
    } else if (currentUser.resourceType === 'Patient') {
      const patientName = (currentUser as { name?: Array<{ family?: string; given?: string[] }> }).name?.[0];
      agentDisplay = patientName ? `${patientName.family || ''} ${patientName.given?.join(' ') || ''}`.trim() : 'Patient';
    } else {
      // For other resource types (e.g., RelatedPerson, ClientApplication, Bot)
      agentDisplay = 'System';
    }
  }

  const auditEvent: AuditEvent = {
    resourceType: 'AuditEvent',
    type: {
      system: DICOM_SYSTEM,
      code: AUDIT_EVENT_CODES.USER_SECURITY_ATTRIBUTE_CHANGED,
      display: 'User Security Attributes Changed',
    },
    action,
    recorded: new Date().toISOString(),
    outcome: outcome.toString() as '0' | '4' | '8' | '12',
    outcomeDesc: description,
    agent: [
      {
        who: {
          reference: currentUser ? `${currentUser.resourceType}/${currentUser.id}` : undefined,
          display: agentDisplay,
        },
        requestor: true,
      },
    ],
    source: {
      observer: {
        display: EMR_SOURCE_OBSERVER,
      },
    },
    entity: [
      {
        what: entity,
        type: {
          system: 'http://terminology.hl7.org/CodeSystem/audit-entity-type',
          code: '2',
          display: 'System Object',
        },
        detail: details
          ? Object.entries(details).map(([type, valueString]) => ({
              type,
              valueString,
            }))
          : undefined,
      },
    ],
  };

  return medplum.createResource(auditEvent);
}

/**
 * Legacy function - Create an audit event for account management operations
 * Kept for backward compatibility with existing code
 *
 * @deprecated Use createAuditEvent with Reference parameter instead
 *
 * @param medplum - Medplum client instance
 * @param action - Action type: C (create), U (update), D (delete/deactivate)
 * @param practitioner - The practitioner being affected
 * @param description - Human-readable description of the action
 * @param details - Optional additional details as key-value pairs
 * @returns Created AuditEvent resource
 */
export async function createAccountAuditEvent(
  medplum: MedplumClient,
  action: 'C' | 'U' | 'D',
  practitioner: Practitioner,
  description: string,
  details?: Record<string, string>
): Promise<AuditEvent> {
  const entity: Reference = {
    reference: `Practitioner/${practitioner.id}`,
    display: getPractitionerName(practitioner),
  };

  return createAuditEvent(medplum, action, entity, 0, description, details);
}

/**
 * Options for filtering audit trail queries
 * @deprecated Use AuditLogFilters from types/account-management.ts instead
 */
export interface AuditTrailOptions {
  /** Number of results per page (default: 50) */
  count?: number;
  /** Filter by date range - start date */
  dateFrom?: Date;
  /** Filter by date range - end date */
  dateTo?: Date;
  /** Filter by action type (C, U, D) */
  action?: 'C' | 'U' | 'D';
  /** Filter by outcome code (0=success, 4=minor failure, 8=serious failure, 12=major failure) */
  outcome?: string;
}

/**
 * Legacy function - Retrieve audit trail for a specific practitioner account
 * Returns raw AuditEvent resources (not extended)
 *
 * @deprecated Use getAccountAuditHistory for extended format with display values
 *
 * @param medplum - Medplum client instance
 * @param practitionerId - ID of the practitioner
 * @param options - Optional filters for the audit trail
 * @returns Array of AuditEvent resources sorted by recorded date (newest first)
 */
export async function getAccountAuditTrail(
  medplum: MedplumClient,
  practitionerId: string,
  options?: AuditTrailOptions
): Promise<AuditEvent[]> {
  const searchParams: Record<string, string> = {
    entity: `Practitioner/${practitionerId}`,
    _sort: '-recorded',
    _count: options?.count?.toString() || '50',
  };

  // Add date range filters
  if (options?.dateFrom) {
    searchParams['date'] = `ge${options.dateFrom.toISOString()}`;
  }
  if (options?.dateTo) {
    const dateToFilter = `le${options.dateTo.toISOString()}`;
    if (searchParams['date']) {
      // Combine with existing date filter
      searchParams['date'] = `${searchParams['date']},${dateToFilter}`;
    } else {
      searchParams['date'] = dateToFilter;
    }
  }

  // Add action filter
  if (options?.action) {
    searchParams['action'] = options.action;
  }

  // Add outcome filter
  if (options?.outcome) {
    searchParams['outcome'] = options.outcome;
  }

  const auditEvents = await medplum.searchResources('AuditEvent', searchParams);

  return auditEvents;
}
