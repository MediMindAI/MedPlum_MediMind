/**
 * Sample Service
 *
 * FHIR CRUD operations for biological sample types (SpecimenDefinition resources).
 * Maps SampleFormValues to/from FHIR SpecimenDefinition.
 */

import { MedplumClient } from '@medplum/core';
import { SpecimenDefinition } from '@medplum/fhirtypes';
import { SampleFormValues } from '../types/laboratory';

/**
 * Create a new sample type
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
 */
export async function hardDeleteSample(
  medplum: MedplumClient,
  id: string
): Promise<void> {
  await medplum.deleteResource('SpecimenDefinition', id);
}

/**
 * Extract form values from a SpecimenDefinition resource
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
