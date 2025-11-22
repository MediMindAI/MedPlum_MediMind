// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { DeviceDefinition } from '@medplum/fhirtypes';
import type { SyringeFormValues } from '../types/laboratory';

/**
 * Create a new syringe/container
 * @param medplum
 * @param values
 */
export async function createSyringe(
  medplum: MedplumClient,
  values: SyringeFormValues
): Promise<DeviceDefinition> {
  const resource: DeviceDefinition = {
    resourceType: 'DeviceDefinition',
    deviceName: [
      {
        name: values.name,
        type: 'user-friendly-name',
      },
    ],
    property: [
      // Color property
      {
        type: { text: 'color' },
        valueCode: [
          {
            coding: [
              {
                system: 'http://medimind.ge/lab/tube-colors',
                code: values.color,
                display: values.color,
              },
            ],
          },
        ],
      },
      // Volume property (if provided)
      ...(values.volume
        ? [
            {
              type: { text: 'volume' },
              valueQuantity: [
                {
                  value: values.volume,
                  unit: 'ml',
                  system: 'http://unitsofmeasure.org',
                  code: 'mL',
                },
              ],
            },
          ]
        : []),
    ],
    status: values.status || 'active',
  };

  return medplum.createResource(resource);
}

/**
 * Update an existing syringe/container
 * @param medplum
 * @param id
 * @param values
 */
export async function updateSyringe(
  medplum: MedplumClient,
  id: string,
  values: SyringeFormValues
): Promise<DeviceDefinition> {
  const existing = await medplum.readResource('DeviceDefinition', id);

  const updated: DeviceDefinition = {
    ...existing,
    deviceName: [
      {
        name: values.name,
        type: 'user-friendly-name',
      },
    ],
    property: [
      {
        type: { text: 'color' },
        valueCode: [
          {
            coding: [
              {
                system: 'http://medimind.ge/lab/tube-colors',
                code: values.color,
                display: values.color,
              },
            ],
          },
        ],
      },
      ...(values.volume
        ? [
            {
              type: { text: 'volume' },
              valueQuantity: [
                {
                  value: values.volume,
                  unit: 'ml',
                  system: 'http://unitsofmeasure.org',
                  code: 'mL',
                },
              ],
            },
          ]
        : []),
    ],
    status: values.status || 'active',
  };

  return medplum.updateResource(updated);
}

/**
 * Search for syringes/containers
 * @param medplum
 * @param options
 * @param options.name
 * @param options.status
 * @param options.count
 * @param options.offset
 */
export async function searchSyringes(
  medplum: MedplumClient,
  options?: {
    name?: string;
    status?: 'active' | 'retired';
    count?: number;
    offset?: number;
  }
): Promise<DeviceDefinition[]> {
  const params: Record<string, string> = {};

  if (options?.count) {
    params._count = options.count.toString();
  }

  if (options?.offset) {
    params._offset = options.offset.toString();
  }

  const bundle = await medplum.search('DeviceDefinition', params);
  let results = bundle.entry?.map((e) => e.resource as DeviceDefinition) || [];

  // Client-side filtering (FHIR server doesn't support status/deviceName search parameters)
  if (options?.status) {
    results = results.filter((r) => r.status === options.status);
  }

  if (options?.name) {
    const nameFilter = options.name.toLowerCase();
    results = results.filter((r) =>
      r.deviceName?.some((dn) => dn.name?.toLowerCase().includes(nameFilter))
    );
  }

  return results;
}

/**
 * Soft delete a syringe (set status to 'retired')
 * @param medplum
 * @param id
 */
export async function deleteSyringe(
  medplum: MedplumClient,
  id: string
): Promise<DeviceDefinition> {
  const existing = await medplum.readResource('DeviceDefinition', id);
  return medplum.updateResource({
    ...existing,
    status: 'inactive',
  });
}

/**
 * Hard delete a syringe (permanently remove)
 * @param medplum
 * @param id
 */
export async function hardDeleteSyringe(
  medplum: MedplumClient,
  id: string
): Promise<void> {
  await medplum.deleteResource('DeviceDefinition', id);
}

/**
 * Extract form values from a DeviceDefinition resource
 * @param resource
 */
export function extractSyringeFormValues(resource: DeviceDefinition): SyringeFormValues {
  const colorProp = resource.property?.find((p) => p.type?.text === 'color');
  const volumeProp = resource.property?.find((p) => p.type?.text === 'volume');

  return {
    name: resource.deviceName?.[0]?.name || '',
    color: colorProp?.valueCode?.[0]?.coding?.[0]?.code || '#808080',
    volume: volumeProp?.valueQuantity?.[0]?.value,
    status: (resource.status as 'active' | 'retired') || 'active',
  };
}
