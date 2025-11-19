// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { Practitioner } from '@medplum/fhirtypes';

export interface PractitionerOption {
  id: string;
  display: string;
  value: string; // Same as id, for Mantine Select compatibility
  label: string; // Same as display, for Mantine Select compatibility
}

/**
 * Search for all active practitioners in the system
 */
export async function searchPractitioners(medplum: MedplumClient): Promise<Practitioner[]> {
  try {
    const bundle = await medplum.search('Practitioner', {
      active: 'true',
      _count: '1000',
      _sort: 'name',
    });

    return bundle.entry?.map((entry) => entry.resource as Practitioner) || [];
  } catch (error) {
    console.error('Error searching practitioners:', error);
    return [];
  }
}

/**
 * Get display name for a practitioner (Given Family format)
 */
export function getPractitionerDisplay(practitioner: Practitioner): string {
  if (!practitioner.name || practitioner.name.length === 0) {
    return 'Unknown Practitioner';
  }

  const name = practitioner.name[0];
  const given = name.given?.join(' ') || '';
  const family = name.family || '';

  return `${given} ${family}`.trim() || 'Unknown Practitioner';
}

/**
 * Convert practitioners to select options for Mantine Select
 */
export function practitionersToOptions(practitioners: Practitioner[]): PractitionerOption[] {
  return practitioners.map((practitioner) => {
    const display = getPractitionerDisplay(practitioner);
    return {
      id: practitioner.id || '',
      display,
      value: practitioner.id || '',
      label: display,
    };
  });
}

/**
 * Get a single practitioner by ID
 */
export async function getPractitioner(
  medplum: MedplumClient,
  practitionerId: string
): Promise<Practitioner | undefined> {
  try {
    return await medplum.readResource('Practitioner', practitionerId);
  } catch (error) {
    console.error('Error fetching practitioner:', error);
    return undefined;
  }
}
