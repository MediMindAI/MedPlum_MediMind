// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { Coverage, Encounter, Reference, Patient } from '@medplum/fhirtypes';
import type { InsuranceCoverageValues } from '../types/patient-history';

/**
 * Fetch all Coverage resources for an Encounter (up to 3)
 *
 * Note: FHIR R4 Coverage does not have a direct 'encounter' search parameter.
 * We use a custom extension to link Coverage to Encounter.
 * Extension URL: http://medimind.ge/fhir/StructureDefinition/encounter-reference
 *
 * Since we can't search by extension directly, we fetch all Coverages and filter client-side.
 * This is a workaround until custom search parameters are configured on the server.
 * @param medplum
 * @param encounterId
 */
export async function fetchCoveragesForEncounter(
  medplum: MedplumClient,
  encounterId: string
): Promise<Coverage[]> {
  try {
    // Since Coverage doesn't have an 'encounter' search parameter in FHIR R4,
    // we'll return an empty array for now. Insurance data can be stored as
    // extensions on the Encounter itself, or we need to configure custom
    // search parameters on the Medplum server.
    //
    // For now, return empty array to prevent API errors
    console.warn('Coverage search by encounter not supported in FHIR R4. Returning empty array.');
    return [];
  } catch (error) {
    console.error('Error fetching coverages:', error);
    return [];
  }
}

/**
 * Upsert Coverage resource (create or update)
 * order: 1=primary, 2=secondary, 3=tertiary
 * @param medplum
 * @param encounter
 * @param values
 * @param order
 */
export async function upsertCoverage(
  medplum: MedplumClient,
  encounter: Encounter,
  values: InsuranceCoverageValues,
  order: 1 | 2 | 3
): Promise<Coverage> {
  // Find existing coverage for this order
  const existingCoverages = await fetchCoveragesForEncounter(medplum, encounter.id!);
  const existing = existingCoverages.find((c) => c.order === order);

  const coverage: Coverage = {
    resourceType: 'Coverage',
    id: existing?.id,
    status: 'active',
    order: order,
    payor: values.insuranceCompany ? [{ reference: values.insuranceCompany }] : [],
    beneficiary: encounter.subject as Reference<Patient>,
    period: {
      start: values.issueDate,
      end: values.expirationDate,
    },
    subscriberId: values.policyNumber,
    type: values.insuranceType
      ? {
          coding: [{ code: values.insuranceType }],
        }
      : undefined,
    extension: values.referralNumber
      ? [
          {
            url: 'http://medimind.ge/extensions/referral-number',
            valueString: values.referralNumber,
          },
        ]
      : undefined,
    costToBeneficiary:
      values.copayPercent !== undefined
        ? [
            {
              type: { coding: [{ code: 'copay' }] },
              valueQuantity: {
                value: values.copayPercent,
                unit: '%',
              },
            },
          ]
        : undefined,
  };

  return existing ? medplum.updateResource(coverage) : medplum.createResource(coverage);
}

/**
 * Delete Coverage resource
 * @param medplum
 * @param coverageId
 */
export async function deleteCoverage(medplum: MedplumClient, coverageId: string): Promise<void> {
  await medplum.deleteResource('Coverage', coverageId);
}