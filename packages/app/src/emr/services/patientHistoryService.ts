// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { Bundle, Encounter } from '@medplum/fhirtypes';
import type { PatientHistorySearchParams } from '../types/patient-history';

/**
 * Search for Encounter resources with Patient and Coverage includes
 *
 * FHIR search parameters:
 * - _include: Encounter:patient, Encounter:coverage
 * - _sort: -date (descending) or date (ascending)
 * - _count: 100 (default pagination)
 * - patient.identifier: Filter by personal ID
 * - date: Filter by date range (ge/le prefixes)
 * - identifier: Filter by registration number
 * - coverage.payor: Filter by insurance company
 *
 * @param medplum - MedplumClient instance
 * @param params - Search parameters for filtering Encounters
 * @returns Bundle containing matching Encounter resources with includes
 */
export async function searchEncounters(
  medplum: MedplumClient,
  params: PatientHistorySearchParams
): Promise<Bundle> {
  const searchParams: Record<string, string | string[]> = {
    _sort: params._sort || '-date',
    _count: params._count || '100',
    _include: ['Encounter:patient', 'Encounter:coverage'],
  };

  // Filter by personal ID (Patient identifier)
  if (params.personalId) {
    searchParams['patient.identifier'] = `http://medimind.ge/identifiers/personal-id|${params.personalId}`;
  }

  // Filter by patient name
  if (params.firstName) {
    searchParams['patient.given'] = params.firstName;
  }
  if (params.lastName) {
    searchParams['patient.family'] = params.lastName;
  }

  // Filter by date range
  if (params.dateFrom) {
    searchParams['date'] = `ge${params.dateFrom}`;
  }
  if (params.dateTo) {
    const existingDate = searchParams['date'];
    searchParams['date'] = existingDate ? `${existingDate},le${params.dateTo}` : `le${params.dateTo}`;
  }

  // Filter by registration number
  if (params.registrationNumber) {
    searchParams['identifier'] = params.registrationNumber;
  }

  // Filter by insurance company (via Coverage.payor)
  if (params.insuranceCompanyId && params.insuranceCompanyId !== '0') {
    searchParams['coverage.payor'] = `Organization/${params.insuranceCompanyId}`;
  }

  return medplum.searchResources('Encounter', searchParams);
}

/**
 * Read single Encounter by ID with includes
 *
 * @param medplum - MedplumClient instance
 * @param encounterId - Encounter resource ID
 * @returns Encounter resource
 */
export async function getEncounterById(medplum: MedplumClient, encounterId: string): Promise<Encounter> {
  return medplum.readResource('Encounter', encounterId);
}

/**
 * Update Encounter resource
 *
 * @param medplum - MedplumClient instance
 * @param encounter - Encounter resource to update
 * @returns Updated Encounter resource
 */
export async function updateEncounter(medplum: MedplumClient, encounter: Encounter): Promise<Encounter> {
  return medplum.updateResource(encounter);
}

/**
 * Soft delete: Set status to 'entered-in-error'
 *
 * This is the recommended deletion method as it preserves the record
 * for audit purposes while marking it as invalid.
 *
 * @param medplum - MedplumClient instance
 * @param encounterId - Encounter resource ID
 * @returns Updated Encounter with status='entered-in-error'
 */
export async function deleteEncounter(medplum: MedplumClient, encounterId: string): Promise<Encounter> {
  const encounter = await medplum.readResource('Encounter', encounterId);
  encounter.status = 'entered-in-error';
  return medplum.updateResource(encounter);
}

/**
 * Hard delete: Permanently remove Encounter (admin only)
 *
 * WARNING: This permanently deletes the Encounter resource.
 * Only use for admin operations or data cleanup.
 *
 * @param medplum - MedplumClient instance
 * @param encounterId - Encounter resource ID
 */
export async function hardDeleteEncounter(medplum: MedplumClient, encounterId: string): Promise<void> {
  await medplum.deleteResource('Encounter', encounterId);
}
