// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';

/**
 * Service for managing unknown/emergency patient registrations
 * Provides sequential numbering and name generation for unidentified patients
 */

/**
 * Get the next sequence number for unknown patients
 * Counts existing unknown patients and returns the next number
 * @param medplum
 */
export async function getNextUnknownSequence(medplum: MedplumClient): Promise<number> {
  try {
    // Search for patients with specific naming pattern (უცნობი)
    // We can't easily query by extension value in FHIR, so we search by name pattern
    const unknownPatients = await medplum.searchResources('Patient', {
      name: 'უცნობი',
      _count: '1000',
    });

    // Filter to only those that are truly unknown patients (have the extension)
    let maxSequence = 0;
    for (const patient of unknownPatients) {
      const hasUnknownExtension = patient.extension?.some(
        (ext) => ext.url === 'http://medimind.ge/fhir/StructureDefinition/unknown-patient' && ext.valueBoolean === true
      );

      if (hasUnknownExtension) {
        // Extract sequence number from name (e.g., "უცნობი #5" -> 5)
        const nameText = patient.name?.[0]?.family || patient.name?.[0]?.text || '';
        const match = nameText.match(/უცნობი\s*#?(\d+)/);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (seq > maxSequence) {
            maxSequence = seq;
          }
        }
      }
    }

    return maxSequence + 1;
  } catch (error) {
    // If search fails, start from 1
    console.error('Error getting unknown patient sequence:', error);
    return 1;
  }
}

/**
 * Generate a unique name for an unknown patient
 * Format: "უცნობი #1", "უცნობი #2", etc.
 * @param medplum
 */
export async function generateUnknownPatientName(medplum: MedplumClient): Promise<string> {
  const sequence = await getNextUnknownSequence(medplum);
  return `უცნობი #${sequence}`;
}

/**
 * Generate a temporary identifier for unknown patient
 * Format: "UNK-2025-001", "UNK-2025-002", etc.
 * @param medplum
 */
export async function generateUnknownPatientIdentifier(medplum: MedplumClient): Promise<string> {
  const year = new Date().getFullYear();
  const sequence = await getNextUnknownSequence(medplum);
  const paddedSequence = sequence.toString().padStart(3, '0');
  return `UNK-${year}-${paddedSequence}`;
}
