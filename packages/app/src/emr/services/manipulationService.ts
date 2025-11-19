/**
 * Manipulation Service
 *
 * FHIR CRUD operations for sample collection procedures (ActivityDefinition resources).
 * Maps ManipulationFormValues to/from FHIR ActivityDefinition.
 */

import { MedplumClient } from '@medplum/core';
import { ActivityDefinition } from '@medplum/fhirtypes';
import { ManipulationFormValues } from '../types/laboratory';

/**
 * Create a new manipulation/procedure
 */
export async function createManipulation(
  medplum: MedplumClient,
  values: ManipulationFormValues
): Promise<ActivityDefinition> {
  const resource: ActivityDefinition = {
    resourceType: 'ActivityDefinition',
    name: values.name.replace(/\s+/g, '_'), // Convert to valid identifier
    title: values.name,
    kind: 'ServiceRequest',
    code: {
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
 * Update an existing manipulation
 */
export async function updateManipulation(
  medplum: MedplumClient,
  id: string,
  values: ManipulationFormValues
): Promise<ActivityDefinition> {
  const existing = await medplum.readResource('ActivityDefinition', id);

  const updated: ActivityDefinition = {
    ...existing,
    name: values.name.replace(/\s+/g, '_'),
    title: values.name,
    code: {
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
 * Search for manipulations
 */
export async function searchManipulations(
  medplum: MedplumClient,
  options?: {
    name?: string;
    status?: 'active' | 'retired';
    count?: number;
    offset?: number;
  }
): Promise<ActivityDefinition[]> {
  const params: Record<string, string> = {};

  if (options?.name) {
    params.title = options.name;
  }

  if (options?.count) {
    params._count = options.count.toString();
  }

  if (options?.offset) {
    params._offset = options.offset.toString();
  }

  const bundle = await medplum.search('ActivityDefinition', params);
  let results = bundle.entry?.map((e) => e.resource as ActivityDefinition) || [];

  // Client-side filtering (FHIR server doesn't support kind/status search parameters)
  results = results.filter((r) => r.kind === 'ServiceRequest'); // Only manipulation-type activities

  if (options?.status) {
    results = results.filter((r) => r.status === options.status);
  }

  return results;
}

/**
 * Soft delete a manipulation (set status to 'retired')
 */
export async function deleteManipulation(
  medplum: MedplumClient,
  id: string
): Promise<ActivityDefinition> {
  const existing = await medplum.readResource('ActivityDefinition', id);
  return medplum.updateResource({
    ...existing,
    status: 'retired',
  });
}

/**
 * Hard delete a manipulation (permanently remove)
 */
export async function hardDeleteManipulation(
  medplum: MedplumClient,
  id: string
): Promise<void> {
  await medplum.deleteResource('ActivityDefinition', id);
}

/**
 * Extract form values from an ActivityDefinition resource
 */
export function extractManipulationFormValues(
  resource: ActivityDefinition
): ManipulationFormValues {
  return {
    name: resource.title || resource.code?.text || '',
    status: resource.status as 'active' | 'retired',
    snomedCode: resource.code?.coding?.[0]?.code,
  };
}
