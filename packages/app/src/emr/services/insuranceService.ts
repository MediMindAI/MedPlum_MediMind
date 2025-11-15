// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { Coverage, Encounter } from '@medplum/fhirtypes';
import type { InsuranceCoverageValues } from '../types/patient-history';

/**
 * Fetch all Coverage resources for an Encounter (up to 3)
 */
export async function fetchCoveragesForEncounter(
  medplum: MedplumClient,
  encounterId: string
): Promise<Coverage[]> {
  const bundle = await medplum.searchResources('Coverage', {
    encounter: `Encounter/${encounterId}`,
    _sort: 'order', // Sort by order (1=primary, 2=secondary, 3=tertiary)
  });
  return bundle ?? [];
}

/**
 * Upsert Coverage resource (create or update)
 * order: 1=primary, 2=secondary, 3=tertiary
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
    beneficiary: encounter.subject!,
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
 */
export async function deleteCoverage(medplum: MedplumClient, coverageId: string): Promise<void> {
  await medplum.deleteResource('Coverage', coverageId);
}