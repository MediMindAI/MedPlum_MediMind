// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { ObservationDefinition } from '@medplum/fhirtypes';
import type { ResearchComponentFormValues } from '../types/laboratory';

/**
 * Create a new research component
 * @param medplum
 * @param values
 */
export async function createResearchComponent(
  medplum: MedplumClient,
  values: ResearchComponentFormValues
): Promise<ObservationDefinition> {
  const resource: ObservationDefinition = {
    resourceType: 'ObservationDefinition',
    identifier: [
      ...(values.code
        ? [
            {
              system: 'http://medimind.ge/lab/component-code',
              value: values.code,
            },
          ]
        : []),
      ...(values.gisCode
        ? [
            {
              system: 'http://medimind.ge/lab/gis-code',
              value: values.gisCode,
            },
          ]
        : []),
    ],
    code: {
      text: values.name,
    },
    quantitativeDetails: values.unit
      ? {
          unit: {
            text: values.unit,
          },
        }
      : undefined,
    extension: [
      ...(values.type
        ? [
            {
              url: 'http://medimind.ge/fhir/StructureDefinition/service-type',
              valueCodeableConcept: {
                coding: [{ code: values.type }],
              },
            },
          ]
        : []),
      ...(values.department
        ? [
            {
              url: 'http://medimind.ge/fhir/StructureDefinition/department',
              valueString: values.department,
            },
          ]
        : []),
    ],
    status: values.status || 'active',
  };

  return medplum.createResource(resource);
}

/**
 * Update an existing research component
 * @param medplum
 * @param id
 * @param values
 */
export async function updateResearchComponent(
  medplum: MedplumClient,
  id: string,
  values: ResearchComponentFormValues
): Promise<ObservationDefinition> {
  const existing = await medplum.readResource('ObservationDefinition', id);

  const updated: ObservationDefinition = {
    ...existing,
    identifier: [
      ...(values.code
        ? [
            {
              system: 'http://medimind.ge/lab/component-code',
              value: values.code,
            },
          ]
        : []),
      ...(values.gisCode
        ? [
            {
              system: 'http://medimind.ge/lab/gis-code',
              value: values.gisCode,
            },
          ]
        : []),
    ],
    code: {
      text: values.name,
    },
    quantitativeDetails: values.unit
      ? {
          unit: {
            text: values.unit,
          },
        }
      : undefined,
    extension: [
      ...(values.type
        ? [
            {
              url: 'http://medimind.ge/fhir/StructureDefinition/service-type',
              valueCodeableConcept: {
                coding: [{ code: values.type }],
              },
            },
          ]
        : []),
      ...(values.department
        ? [
            {
              url: 'http://medimind.ge/fhir/StructureDefinition/department',
              valueString: values.department,
            },
          ]
        : []),
    ],
    status: values.status || 'active',
  };

  return medplum.updateResource(updated);
}

/**
 * Search for research components
 * @param medplum
 * @param options
 * @param options.code
 * @param options.gisCode
 * @param options.name
 * @param options.type
 * @param options.unit
 * @param options.status
 * @param options.count
 * @param options.offset
 */
export async function searchResearchComponents(
  medplum: MedplumClient,
  options?: {
    code?: string;
    gisCode?: string;
    name?: string;
    type?: string;
    unit?: string;
    status?: 'active' | 'retired';
    count?: number;
    offset?: number;
  }
): Promise<ObservationDefinition[]> {
  const params: Record<string, string> = {};

  // Only use supported search parameters
  if (options?.count) {
    params._count = options.count.toString();
  }

  if (options?.offset) {
    params._offset = options.offset.toString();
  }

  const bundle = await medplum.search('ObservationDefinition', params);
  let results = bundle.entry?.map((e) => e.resource as ObservationDefinition) || [];

  // Client-side filtering for all parameters (FHIR server doesn't support these search parameters)
  if (options?.status) {
    results = results.filter((r) =>
      r.extension?.some(
        (ext) =>
          ext.url === 'http://medimind.ge/fhir/StructureDefinition/component-status' &&
          ext.valueCode === options.status
      )
    );
  }

  if (options?.code) {
    const codeFilter = options.code.toLowerCase();
    results = results.filter((r) =>
      r.identifier?.some((id) => id.value?.toLowerCase().includes(codeFilter))
    );
  }

  if (options?.gisCode) {
    const gisFilter = options.gisCode.toLowerCase();
    results = results.filter((r) =>
      r.identifier?.some(
        (id) => id.system === 'http://medimind.ge/lab/gis-code' && id.value?.toLowerCase().includes(gisFilter)
      )
    );
  }

  if (options?.name) {
    const nameFilter = options.name.toLowerCase();
    results = results.filter((r) => r.code?.text?.toLowerCase().includes(nameFilter));
  }

  if (options?.type) {
    results = results.filter((r) =>
      r.extension?.some(
        (ext) =>
          ext.url === 'http://medimind.ge/fhir/StructureDefinition/service-type' &&
          ext.valueCodeableConcept?.coding?.[0]?.code === options.type
      )
    );
  }

  if (options?.unit) {
    results = results.filter((r) => r.quantitativeDetails?.unit?.text === options.unit);
  }

  return results;
}

/**
 * Soft delete a research component (set status to 'retired')
 * @param medplum
 * @param id
 */
export async function deleteResearchComponent(
  medplum: MedplumClient,
  id: string
): Promise<ObservationDefinition> {
  const existing = await medplum.readResource('ObservationDefinition', id);
  return medplum.updateResource({
    ...existing,
    status: 'retired',
  });
}

/**
 * Hard delete a research component (permanently remove)
 * @param medplum
 * @param id
 */
export async function hardDeleteResearchComponent(
  medplum: MedplumClient,
  id: string
): Promise<void> {
  await medplum.deleteResource('ObservationDefinition', id);
}

/**
 * Extract form values from an ObservationDefinition resource
 * @param resource
 */
export function extractResearchComponentFormValues(
  resource: ObservationDefinition
): ResearchComponentFormValues {
  const codeIdentifier = resource.identifier?.find(
    (id) => id.system === 'http://medimind.ge/lab/component-code'
  );
  const gisIdentifier = resource.identifier?.find((id) => id.system === 'http://medimind.ge/lab/gis-code');
  const serviceTypeExt = resource.extension?.find(
    (ext) => ext.url === 'http://medimind.ge/fhir/StructureDefinition/service-type'
  );
  const departmentExt = resource.extension?.find(
    (ext) => ext.url === 'http://medimind.ge/fhir/StructureDefinition/department'
  );

  return {
    code: codeIdentifier?.value || '',
    gisCode: gisIdentifier?.value || '',
    name: resource.code?.text || '',
    type: (serviceTypeExt?.valueCodeableConcept?.coding?.[0]?.code as any) || '',
    unit: resource.quantitativeDetails?.unit?.text || '',
    department: departmentExt?.valueString,
    status: (resource.status as 'active' | 'retired' | 'draft') || 'active',
  };
}
