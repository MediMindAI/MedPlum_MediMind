// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { Encounter, Patient } from '@medplum/fhirtypes';
import { getNextUnknownSequence } from './unknownPatientService';

export type VisitType = 'ambulatory' | 'stationary' | 'emergency';

/**
 * Generate unique registration number for encounter
 * Format: "a-1234-2025" (ambulatory), "1234-2025" (stationary/emergency), or "UNK-1-2025" (unknown patient)
 * @param medplum
 * @param visitType
 * @param isUnknownPatient
 */
export async function generateRegistrationNumber(
  medplum: MedplumClient,
  visitType: VisitType,
  isUnknownPatient: boolean = false
): Promise<string> {
  const year = new Date().getFullYear();

  // Special format for unknown patients
  if (isUnknownPatient) {
    const unknownSequence = await getNextUnknownSequence(medplum);
    return `UNK-${unknownSequence}-${year}`;
  }

  const prefix = visitType === 'ambulatory' ? 'a-' : '';

  // Get the count of existing encounters to generate next number
  // In production, you'd want a more robust counter mechanism
  // Query all encounters and use the total count
  const searchResult = await medplum.search('Encounter', {
    _count: '0',
    _total: 'accurate',
  });

  // Extract total count and increment
  const count = searchResult.total ?? 0;
  const newNumber = count + 1;

  return `${prefix}${newNumber}-${year}`;
}

/**
 * Create FHIR Encounter resource when patient is registered
 * This represents the patient's visit/admission to the hospital
 * @param medplum
 * @param patient
 * @param visitType
 * @param isUnknownPatient
 */
export async function createEncounterForPatient(
  medplum: MedplumClient,
  patient: Patient,
  visitType: VisitType = 'ambulatory',
  isUnknownPatient: boolean = false
): Promise<Encounter> {
  // Generate registration number (special format for unknown patients)
  const registrationNumber = await generateRegistrationNumber(medplum, visitType, isUnknownPatient);

  // Map visit type to FHIR class code
  const classCode = visitType === 'ambulatory' ? 'AMB' : visitType === 'stationary' ? 'IMP' : 'EMER';
  const classDisplay = visitType === 'ambulatory' ? 'ambulatory' : visitType === 'stationary' ? 'inpatient encounter' : 'emergency';

  // Determine identifier system based on patient type and visit type
  let identifierSystem: string;
  if (isUnknownPatient) {
    identifierSystem = 'http://medimind.ge/identifiers/unknown-patient-registration';
  } else if (visitType === 'ambulatory') {
    identifierSystem = 'http://medimind.ge/identifiers/ambulatory-registration';
  } else {
    identifierSystem = 'http://medimind.ge/identifiers/visit-registration';
  }

  // Create encounter resource
  const encounter: Encounter = {
    resourceType: 'Encounter',
    status: 'in-progress',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: classCode,
      display: classDisplay,
    },
    subject: {
      reference: `Patient/${patient.id}`,
      display: `${patient.name?.[0]?.given?.[0] || ''} ${patient.name?.[0]?.family || ''}`.trim(),
    },
    identifier: [
      {
        system: identifierSystem,
        value: registrationNumber,
      },
    ],
    period: {
      start: new Date().toISOString(),
    },
    // Financial tracking extensions (initial values)
    extension: [
      {
        url: 'http://medimind.ge/fhir/StructureDefinition/total-amount',
        valueDecimal: 0,
      },
      {
        url: 'http://medimind.ge/fhir/StructureDefinition/discount-percent',
        valueDecimal: 0,
      },
      {
        url: 'http://medimind.ge/fhir/StructureDefinition/debt-amount',
        valueDecimal: 0,
      },
      {
        url: 'http://medimind.ge/fhir/StructureDefinition/payment-amount',
        valueDecimal: 0,
      },
    ],
  };

  // Create in FHIR server
  return medplum.createResource(encounter);
}
