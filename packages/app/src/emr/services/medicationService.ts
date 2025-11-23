// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { MedicationRequest, Patient, Practitioner, Reference, Resource } from '@medplum/fhirtypes';
import type {
  MedicationRequestFormValues,
  MedicationRequestRow,
  MedicationRequestFilters,
} from '../types/medication';

/**
 * Creates a new MedicationRequest resource
 *
 * @param medplum - MedplumClient instance
 * @param values - Form values for the medication request
 * @returns Created MedicationRequest resource
 */
export async function createMedicationRequest(
  medplum: MedplumClient,
  values: MedicationRequestFormValues
): Promise<MedicationRequest> {
  const resource: MedicationRequest = {
    resourceType: 'MedicationRequest',
    status: values.status,
    intent: 'order',
    subject: {
      reference: `Patient/${values.patientId}`,
    },
    medicationCodeableConcept: {
      text: values.medicationName,
      coding: values.medicationCode
        ? [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: values.medicationCode,
              display: values.medicationName,
            },
          ]
        : undefined,
    },
    dosageInstruction: [
      {
        text: values.dosageInstruction,
        timing: values.frequency
          ? {
              code: {
                text: values.frequency,
              },
            }
          : undefined,
        route: values.route
          ? {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: getRouteCode(values.route),
                  display: values.route,
                },
              ],
            }
          : undefined,
        doseAndRate: values.doseQuantity
          ? [
              {
                doseQuantity: {
                  value: values.doseQuantity,
                  unit: values.doseUnit || 'mg',
                },
              },
            ]
          : undefined,
      },
    ],
    dispenseRequest: {
      numberOfRepeatsAllowed: values.numberOfRefills,
      quantity: values.dispenseQuantity
        ? {
            value: values.dispenseQuantity,
          }
        : undefined,
      validityPeriod:
        values.startDate || values.endDate
          ? {
              start: values.startDate,
              end: values.endDate,
            }
          : undefined,
    },
    authoredOn: new Date().toISOString(),
    requester: values.prescriberId
      ? {
          reference: `Practitioner/${values.prescriberId}`,
        }
      : undefined,
    priority: values.priority,
    note: values.notes
      ? [
          {
            text: values.notes,
          },
        ]
      : undefined,
    reasonCode: values.reasonText
      ? [
          {
            text: values.reasonText,
          },
        ]
      : undefined,
    substitution: {
      allowedBoolean: values.substitutionAllowed ?? true,
    },
  };

  return medplum.createResource(resource);
}

/**
 * Updates an existing MedicationRequest resource
 *
 * @param medplum - MedplumClient instance
 * @param id - Resource ID
 * @param values - Updated form values
 * @returns Updated MedicationRequest resource
 */
export async function updateMedicationRequest(
  medplum: MedplumClient,
  id: string,
  values: MedicationRequestFormValues
): Promise<MedicationRequest> {
  const existing = await medplum.readResource('MedicationRequest', id);

  const updated: MedicationRequest = {
    ...existing,
    status: values.status,
    medicationCodeableConcept: {
      text: values.medicationName,
      coding: values.medicationCode
        ? [
            {
              system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
              code: values.medicationCode,
              display: values.medicationName,
            },
          ]
        : undefined,
    },
    dosageInstruction: [
      {
        text: values.dosageInstruction,
        timing: values.frequency
          ? {
              code: {
                text: values.frequency,
              },
            }
          : undefined,
        route: values.route
          ? {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: getRouteCode(values.route),
                  display: values.route,
                },
              ],
            }
          : undefined,
        doseAndRate: values.doseQuantity
          ? [
              {
                doseQuantity: {
                  value: values.doseQuantity,
                  unit: values.doseUnit || 'mg',
                },
              },
            ]
          : undefined,
      },
    ],
    dispenseRequest: {
      numberOfRepeatsAllowed: values.numberOfRefills,
      quantity: values.dispenseQuantity
        ? {
            value: values.dispenseQuantity,
          }
        : undefined,
      validityPeriod:
        values.startDate || values.endDate
          ? {
              start: values.startDate,
              end: values.endDate,
            }
          : undefined,
    },
    priority: values.priority,
    note: values.notes
      ? [
          {
            text: values.notes,
          },
        ]
      : undefined,
    reasonCode: values.reasonText
      ? [
          {
            text: values.reasonText,
          },
        ]
      : undefined,
    substitution: {
      allowedBoolean: values.substitutionAllowed ?? true,
    },
  };

  return medplum.updateResource(updated);
}

/**
 * Searches for medication requests with filters
 *
 * @param medplum - MedplumClient instance
 * @param filters - Search filters
 * @returns Array of MedicationRequestRow for table display
 */
export async function searchMedicationRequests(
  medplum: MedplumClient,
  filters: MedicationRequestFilters = {}
): Promise<MedicationRequestRow[]> {
  const searchParams: Record<string, string> = {
    _count: String(filters.count || 50),
    _sort: '-authored',
    _include: 'MedicationRequest:subject,MedicationRequest:requester',
  };

  if (filters.patientId) {
    searchParams.subject = `Patient/${filters.patientId}`;
  }

  if (filters.prescriberId) {
    searchParams.requester = `Practitioner/${filters.prescriberId}`;
  }

  if (filters.status) {
    searchParams.status = filters.status;
  }

  if (filters.dateFrom) {
    searchParams['authored'] = `ge${filters.dateFrom}`;
  }

  if (filters.dateTo) {
    searchParams['authored'] = `le${filters.dateTo}`;
  }

  const bundle = await medplum.search('MedicationRequest', searchParams);

  // Extract included resources
  const patients = new Map<string, Patient>();
  const practitioners = new Map<string, Practitioner>();

  bundle.entry?.forEach((entry) => {
    const resource = entry.resource as Resource | undefined;
    if (resource?.resourceType === 'Patient' && resource.id) {
      patients.set(`Patient/${resource.id}`, resource as Patient);
    }
    if (resource?.resourceType === 'Practitioner' && resource.id) {
      practitioners.set(`Practitioner/${resource.id}`, resource as Practitioner);
    }
  });

  // Convert to row format
  const rows: MedicationRequestRow[] = [];

  bundle.entry?.forEach((entry) => {
    const resource = entry.resource;
    if (resource?.resourceType === 'MedicationRequest' && resource.id) {
      const patientRef = (resource.subject as Reference)?.reference;
      const patient = patientRef ? patients.get(patientRef) : undefined;
      const prescriberRef = (resource.requester as Reference)?.reference;
      const prescriber = prescriberRef ? practitioners.get(prescriberRef) : undefined;

      rows.push({
        id: resource.id,
        patientId: patientRef?.replace('Patient/', '') || '',
        patientName: patient
          ? `${patient.name?.[0]?.given?.join(' ') || ''} ${patient.name?.[0]?.family || ''}`.trim()
          : 'Unknown',
        medicationName:
          resource.medicationCodeableConcept?.text ||
          resource.medicationCodeableConcept?.coding?.[0]?.display ||
          'Unknown',
        dosageInstruction: resource.dosageInstruction?.[0]?.text || '',
        status: resource.status || 'unknown',
        prescriberName: prescriber
          ? `${prescriber.name?.[0]?.given?.join(' ') || ''} ${prescriber.name?.[0]?.family || ''}`.trim()
          : undefined,
        authoredOn: resource.authoredOn,
        startDate: resource.dispenseRequest?.validityPeriod?.start,
        endDate: resource.dispenseRequest?.validityPeriod?.end,
      });
    }
  });

  // Filter by medication name if provided (client-side)
  if (filters.medicationName) {
    const searchTerm = filters.medicationName.toLowerCase();
    return rows.filter((row) => row.medicationName.toLowerCase().includes(searchTerm));
  }

  return rows;
}

/**
 * Gets a single medication request by ID
 *
 * @param medplum - MedplumClient instance
 * @param id - Resource ID
 * @returns MedicationRequest resource
 */
export async function getMedicationRequest(
  medplum: MedplumClient,
  id: string
): Promise<MedicationRequest> {
  return medplum.readResource('MedicationRequest', id);
}

/**
 * Cancels a medication request (soft delete)
 *
 * @param medplum - MedplumClient instance
 * @param id - Resource ID
 * @returns Updated MedicationRequest with cancelled status
 */
export async function cancelMedicationRequest(
  medplum: MedplumClient,
  id: string
): Promise<MedicationRequest> {
  const existing = await medplum.readResource('MedicationRequest', id);

  const updated: MedicationRequest = {
    ...existing,
    status: 'cancelled',
  };

  return medplum.updateResource(updated);
}

/**
 * Deletes a medication request (hard delete)
 *
 * @param medplum - MedplumClient instance
 * @param id - Resource ID
 */
export async function deleteMedicationRequest(medplum: MedplumClient, id: string): Promise<void> {
  await medplum.deleteResource('MedicationRequest', id);
}

/**
 * Extracts form values from a MedicationRequest resource
 *
 * @param resource - MedicationRequest resource
 * @returns MedicationRequestFormValues
 */
export function extractFormValues(resource: MedicationRequest): MedicationRequestFormValues {
  const dosage = resource.dosageInstruction?.[0];

  return {
    id: resource.id,
    patientId: (resource.subject as Reference)?.reference?.replace('Patient/', '') || '',
    prescriberId: (resource.requester as Reference)?.reference?.replace('Practitioner/', ''),
    medicationName:
      resource.medicationCodeableConcept?.text ||
      resource.medicationCodeableConcept?.coding?.[0]?.display ||
      '',
    medicationCode: resource.medicationCodeableConcept?.coding?.[0]?.code,
    dosageInstruction: dosage?.text || '',
    doseQuantity: dosage?.doseAndRate?.[0]?.doseQuantity?.value,
    doseUnit: dosage?.doseAndRate?.[0]?.doseQuantity?.unit,
    frequency: dosage?.timing?.code?.text,
    route: dosage?.route?.coding?.[0]?.display as MedicationRequestFormValues['route'],
    durationDays: undefined, // Not directly stored in FHIR
    dispenseQuantity: resource.dispenseRequest?.quantity?.value,
    numberOfRefills: resource.dispenseRequest?.numberOfRepeatsAllowed,
    startDate: resource.dispenseRequest?.validityPeriod?.start,
    endDate: resource.dispenseRequest?.validityPeriod?.end,
    status: resource.status as MedicationRequestFormValues['status'],
    priority: resource.priority as MedicationRequestFormValues['priority'],
    notes: resource.note?.[0]?.text,
    reasonText: resource.reasonCode?.[0]?.text,
    substitutionAllowed: resource.substitution?.allowedBoolean,
  };
}

/**
 * Gets SNOMED CT code for route of administration
 */
function getRouteCode(route: string): string {
  const routeCodes: Record<string, string> = {
    oral: '26643006',
    intravenous: '47625008',
    intramuscular: '78421000',
    subcutaneous: '34206005',
    topical: '6064005',
    inhalation: '18679011000001101',
    other: '74964007',
  };
  return routeCodes[route] || '74964007';
}
