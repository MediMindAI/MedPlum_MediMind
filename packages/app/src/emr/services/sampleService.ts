// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { SpecimenDefinition } from '@medplum/fhirtypes';
import type { SampleFormValues } from '../types/laboratory';

/**
 * Create a new sample type
 * @param medplum
 * @param values
 */
export async function createSample(
  medplum: MedplumClient,
  values: SampleFormValues
): Promise<SpecimenDefinition> {
  const resource: SpecimenDefinition = {
    resourceType: 'SpecimenDefinition',
    typeCollected: {
      text: values.name,
      ...(values.snomedCode && {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: values.snomedCode,
          },
        ],
      }),
    },
    status: values.status || 'active',
  };

  return medplum.createResource(resource);
}

/**
 * Update an existing sample type
 * @param medplum
 * @param id
 * @param values
 */
export async function updateSample(
  medplum: MedplumClient,
  id: string,
  values: SampleFormValues
): Promise<SpecimenDefinition> {
  const existing = await medplum.readResource('SpecimenDefinition', id);

  const updated: SpecimenDefinition = {
    ...existing,
    typeCollected: {
      text: values.name,
      ...(values.snomedCode && {
        coding: [
          {
            system: 'http://snomed.info/sct',
            code: values.snomedCode,
          },
        ],
      }),
    },
    status: values.status || 'active',
  };

  return medplum.updateResource(updated);
}

/**
 * Search for sample types
 * @param medplum
 * @param options
 * @param options.name
 * @param options.status
 * @param options.count
 * @param options.offset
 */
export async function searchSamples(
  medplum: MedplumClient,
  options?: {
    name?: string;
    status?: 'active' | 'retired';
    count?: number;
    offset?: number;
  }
): Promise<SpecimenDefinition[]> {
  const params: Record<string, string> = {};

  if (options?.name) {
    params['type-collected:text'] = options.name;
  }

  if (options?.count) {
    params._count = options.count.toString();
  }

  if (options?.offset) {
    params._offset = options.offset.toString();
  }

  const bundle = await medplum.search('SpecimenDefinition', params);
  let results = bundle.entry?.map((e) => e.resource as SpecimenDefinition) || [];

  // Client-side filtering for status (not supported by FHIR server)
  if (options?.status) {
    results = results.filter((r) => r.status === options.status);
  }

  return results;
}

/**
 * Soft delete a sample type (set status to 'retired')
 * @param medplum
 * @param id
 */
export async function deleteSample(
  medplum: MedplumClient,
  id: string
): Promise<SpecimenDefinition> {
  const existing = await medplum.readResource('SpecimenDefinition', id);
  return medplum.updateResource({
    ...existing,
    status: 'retired',
  });
}

/**
 * Hard delete a sample type (permanently remove)
 * @param medplum
 * @param id
 */
export async function hardDeleteSample(
  medplum: MedplumClient,
  id: string
): Promise<void> {
  await medplum.deleteResource('SpecimenDefinition', id);
}

/**
 * Extract form values from a SpecimenDefinition resource
 * @param resource
 */
export function extractSampleFormValues(
  resource: SpecimenDefinition
): SampleFormValues {
  return {
    name: resource.typeCollected?.text || '',
    status: resource.status as 'active' | 'retired',
    snomedCode: resource.typeCollected?.coding?.[0]?.code,
  };
}
