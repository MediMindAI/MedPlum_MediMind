// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { Bundle, Encounter, Patient, Identifier, HumanName, ContactPoint, Extension } from '@medplum/fhirtypes';
import type { VisitTableRow, FinancialSummary } from '../types/patient-history';

/**
 * Extract identifier value by system URL
 */
export function getIdentifierValue(
  resource: { identifier?: Identifier[] } | undefined,
  system: string
): string {
  return resource?.identifier?.find((id) => id.system === system)?.value || '';
}

/**
 * Extract name parts from HumanName array
 */
export function getNameParts(names?: HumanName[]): { firstName: string; lastName: string } {
  const name = names?.[0];
  return {
    firstName: name?.given?.[0] || '',
    lastName: name?.family || '',
  };
}

/**
 * Extract telecom value by system
 */
export function getTelecomValue(
  resource: { telecom?: ContactPoint[] } | undefined,
  system: string
): string {
  return resource?.telecom?.find((t) => t.system === system)?.value || '';
}

/**
 * Extract extension value by URL
 */
export function getExtensionValue(resource: { extension?: Extension[] } | undefined, url: string): any {
  const ext = resource?.extension?.find((e) => e.url === url);
  return ext?.valueString || ext?.valueCodeableConcept?.coding?.[0]?.code || '';
}

/**
 * Map FHIR Encounter + Patient to table row
 */
export function mapEncounterToTableRow(encounter: Encounter, bundle: Bundle): VisitTableRow {
  // Find the CORRECT Patient in bundle by matching encounter.subject.reference
  // encounter.subject.reference is like "Patient/123" or full URL
  const subjectRef = encounter.subject?.reference || '';
  const patientId = subjectRef.split('/').pop() || ''; // Extract ID from "Patient/123"

  const patient = bundle.entry?.find((e) => {
    if (e.resource?.resourceType !== 'Patient') return false;
    const pat = e.resource as Patient;
    // Match by ID or full URL
    return pat.id === patientId || e.fullUrl?.includes(patientId);
  })?.resource as Patient;

  const personalId = getIdentifierValue(patient, 'http://medimind.ge/identifiers/personal-id');

  const { firstName, lastName } = getNameParts(patient?.name);

  const registrationNumber =
    getIdentifierValue(encounter, 'http://medimind.ge/identifiers/visit-registration') ||
    getIdentifierValue(encounter, 'http://medimind.ge/identifiers/ambulatory-registration');

  return {
    id: encounter.id!,
    encounterId: encounter.id!,
    patientId: patient?.id || patientId,
    personalId,
    firstName,
    lastName,
    date: encounter.period?.start || '',
    endDate: encounter.period?.end,
    registrationNumber,
    total: 0, // TODO: Calculate from ChargeItem resources
    discountPercent: 0,
    debt: 0,
    payment: 0,
    status: encounter.status,
    visitType: encounter.class?.code === 'IMP' ? 'stationary' : 'ambulatory',
  };
}

/**
 * Calculate financial summary
 */
export function calculateFinancials(
  total: number,
  discountPercent: number,
  payment: number
): FinancialSummary {
  const discountAmount = total * (discountPercent / 100);
  const subtotal = total - discountAmount;
  const debt = Math.max(0, subtotal - payment);

  return {
    total,
    discountPercent,
    discountAmount,
    subtotal,
    payment,
    debt,
    currency: 'GEL',
  };
}