/**
 * Audit Service (T068, T069)
 *
 * Provides audit logging functionality for account management operations
 * using FHIR AuditEvent resources with DICOM Security Alert codes
 */

import { MedplumClient } from '@medplum/core';
import { AuditEvent, Practitioner } from '@medplum/fhirtypes';
import { getPractitionerName } from './accountHelpers';

/**
 * Create an audit event for account management operations
 *
 * @param medplum - Medplum client instance
 * @param action - Action type: C (create), U (update), D (delete/deactivate)
 * @param practitioner - The practitioner being affected
 * @param description - Human-readable description of the action
 * @param details - Optional additional details as key-value pairs
 * @returns Created AuditEvent resource
 *
 * @example
 * ```typescript
 * await createAuditEvent(
 *   medplum,
 *   'D',
 *   practitioner,
 *   'Account deactivated',
 *   { reason: 'Employee terminated', previousStatus: 'active' }
 * );
 * ```
 */
export async function createAuditEvent(
  medplum: MedplumClient,
  action: 'C' | 'U' | 'D',
  practitioner: Practitioner,
  description: string,
  details?: Record<string, string>
): Promise<AuditEvent> {
  const currentUser = medplum.getProfile();

  const auditEvent: AuditEvent = {
    resourceType: 'AuditEvent',
    type: {
      system: 'http://dicom.nema.org/resources/ontology/DCM',
      code: '110113',
      display: 'Security Alert'
    },
    subtype: [
      {
        system: 'http://dicom.nema.org/resources/ontology/DCM',
        code: '110137',
        display: 'User Security Attributes Changed'
      }
    ],
    action,
    recorded: new Date().toISOString(),
    outcome: '0', // Success
    outcomeDesc: description,
    agent: [
      {
        who: {
          reference: `${currentUser?.resourceType}/${currentUser?.id}`,
          display: currentUser ? getPractitionerName(currentUser as Practitioner) : 'Unknown'
        },
        requestor: true
      }
    ],
    entity: [
      {
        what: {
          reference: `Practitioner/${practitioner.id}`,
          display: getPractitionerName(practitioner)
        },
        type: {
          system: 'http://terminology.hl7.org/CodeSystem/audit-entity-type',
          code: '2',
          display: 'System Object'
        },
        detail: details
          ? Object.entries(details).map(([type, valueString]) => ({
              type,
              valueString
            }))
          : undefined
      }
    ]
  };

  return await medplum.createResource(auditEvent);
}

/**
 * Options for filtering audit trail queries
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
 * Retrieve audit trail for a specific practitioner account
 *
 * @param medplum - Medplum client instance
 * @param practitionerId - ID of the practitioner
 * @param options - Optional filters for the audit trail
 * @returns Array of AuditEvent resources sorted by recorded date (newest first)
 *
 * @example
 * ```typescript
 * // Get all audit events for a practitioner
 * const trail = await getAccountAuditTrail(medplum, 'practitioner-123');
 *
 * // Get only deactivation events from last 30 days
 * const deactivations = await getAccountAuditTrail(medplum, 'practitioner-123', {
 *   action: 'D',
 *   dateFrom: new Date('2025-10-20'),
 *   dateTo: new Date('2025-11-19')
 * });
 * ```
 */
export async function getAccountAuditTrail(
  medplum: MedplumClient,
  practitionerId: string,
  options?: AuditTrailOptions
): Promise<AuditEvent[]> {
  const searchParams: Record<string, string> = {
    entity: `Practitioner/${practitionerId}`,
    type: '110113', // DICOM Security Alert
    _sort: '-recorded', // Newest first
    _count: options?.count?.toString() || '50'
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
