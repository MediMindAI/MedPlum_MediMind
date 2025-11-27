// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { ObservationDefinition } from '@medplum/fhirtypes';
import type { MedicalDataFormValues, MedicalDataRow, MedicalDataSearchFilters } from '../types/settings';

/**
 * Medical Data Service - CRUD operations for physical and post-operative data
 *
 * Medical data types are stored as FHIR ObservationDefinition resources with:
 * - identifier system: http://medimind.ge/identifiers/medical-data-code
 * - category extension: http://medimind.ge/extensions/medical-data-category (physical | postop)
 * - code: code (unique identifier)
 * - title: multilingual names stored in extensions
 * - quantitativeDetails.unit: measurement unit
 */

/**
 * Search for medical data with filtering
 *
 * @param medplum - Medplum client
 * @param filters - Search filters
 * @returns Array of ObservationDefinition resources
 */
export async function searchMedicalData(
  medplum: MedplumClient,
  filters: MedicalDataSearchFilters = {}
): Promise<ObservationDefinition[]> {
  // Note: ObservationDefinition has limited search parameters in Medplum
  // We fetch all and filter client-side for: category, status, name, code
  const searchParams: Record<string, string> = {
    _count: '500', // Fetch more since we filter client-side
  };

  const results = await medplum.searchResources('ObservationDefinition', searchParams);

  // Client-side filtering
  let filtered = results;

  // Filter by category if specified (physical vs postop vs ambulatory)
  if (filters.category) {
    filtered = filtered.filter((item) => {
      const categoryExt = item.extension?.find(
        (ext) => ext.url === 'http://medimind.ge/extensions/medical-data-category'
      );
      return categoryExt?.valueString === filters.category;
    });
  }

  // Filter by active status if specified
  if (filters.active !== undefined) {
    const targetStatus = filters.active ? 'active' : 'retired';
    filtered = filtered.filter((item) => item.status === targetStatus);
  }

  // Filter by name (partial match, case-insensitive)
  if (filters.name) {
    const searchTerm = filters.name.toLowerCase();
    filtered = filtered.filter((item) => {
      const title = item.title?.toLowerCase() || '';
      return title.includes(searchTerm);
    });
  }

  // Filter by code
  if (filters.code) {
    filtered = filtered.filter((item) => {
      const code = item.code?.coding?.[0]?.code || '';
      return code === filters.code;
    });
  }

  return filtered;
}

/**
 * Get medical data item by ID
 *
 * @param medplum - Medplum client
 * @param id - ObservationDefinition resource ID
 * @returns ObservationDefinition resource
 */
export async function getMedicalDataItem(medplum: MedplumClient, id: string): Promise<ObservationDefinition> {
  return await medplum.readResource('ObservationDefinition', id);
}

/**
 * Create a new medical data item
 *
 * @param medplum - Medplum client
 * @param values - Medical data form values
 * @returns Created ObservationDefinition resource
 */
export async function createMedicalData(
  medplum: MedplumClient,
  values: MedicalDataFormValues
): Promise<ObservationDefinition> {
  // Build extensions for multilingual names and category
  const extensions: any[] = [
    {
      url: 'http://medimind.ge/extensions/medical-data-category',
      valueString: values.category,
    },
  ];

  if (values.nameKa) {
    extensions.push({
      url: 'http://medimind.ge/extensions/name-ka',
      valueString: values.nameKa,
    });
  }

  if (values.sortOrder !== undefined) {
    extensions.push({
      url: 'http://medimind.ge/extensions/sort-order',
      valueInteger: values.sortOrder,
    });
  }

  const item: ObservationDefinition = {
    resourceType: 'ObservationDefinition',
    code: {
      coding: [
        {
          system: 'http://medimind.ge/medical-data-codes',
          code: values.code,
          display: values.nameKa,
        },
      ],
    },
    title: values.nameKa, // Primary title is Georgian
    status: values.active ? 'active' : 'retired',
    extension: extensions,
    quantitativeDetails: values.unit
      ? {
          unit: {
            coding: [
              {
                system: 'http://unitsofmeasure.org',
                code: values.unitCode || values.unit,
                display: values.unit,
              },
            ],
          },
        }
      : undefined,
  };

  return await medplum.createResource(item);
}

/**
 * Update an existing medical data item
 *
 * @param medplum - Medplum client
 * @param id - ObservationDefinition resource ID
 * @param values - Updated form values
 * @returns Updated ObservationDefinition resource
 */
export async function updateMedicalData(
  medplum: MedplumClient,
  id: string,
  values: MedicalDataFormValues
): Promise<ObservationDefinition> {
  // Fetch existing item
  const existing = await getMedicalDataItem(medplum, id);

  // Build extensions for multilingual names and category
  const extensions: any[] = [
    {
      url: 'http://medimind.ge/extensions/medical-data-category',
      valueString: values.category,
    },
  ];

  if (values.nameKa) {
    extensions.push({
      url: 'http://medimind.ge/extensions/name-ka',
      valueString: values.nameKa,
    });
  }

  if (values.sortOrder !== undefined) {
    extensions.push({
      url: 'http://medimind.ge/extensions/sort-order',
      valueInteger: values.sortOrder,
    });
  }

  const updated: ObservationDefinition = {
    ...existing,
    code: {
      coding: [
        {
          system: 'http://medimind.ge/medical-data-codes',
          code: values.code,
          display: values.nameKa,
        },
      ],
    },
    title: values.nameKa,
    status: values.active ? 'active' : 'retired',
    extension: extensions,
    quantitativeDetails: values.unit
      ? {
          unit: {
            coding: [
              {
                system: 'http://unitsofmeasure.org',
                code: values.unitCode || values.unit,
                display: values.unit,
              },
            ],
          },
        }
      : undefined,
  };

  return await medplum.updateResource(updated);
}

/**
 * Delete a medical data item (soft delete - set status=retired)
 *
 * @param medplum - Medplum client
 * @param id - ObservationDefinition resource ID
 * @returns Updated ObservationDefinition resource with status=retired
 */
export async function deleteMedicalData(medplum: MedplumClient, id: string): Promise<ObservationDefinition> {
  const item = await getMedicalDataItem(medplum, id);

  const updated: ObservationDefinition = {
    ...item,
    status: 'retired',
  };

  return await medplum.updateResource(updated);
}

/**
 * Convert ObservationDefinition resource to MedicalDataRow for table display
 *
 * @param item - ObservationDefinition resource
 * @returns MedicalDataRow
 */
export function observationDefinitionToRow(item: ObservationDefinition): MedicalDataRow {
  // Extract code
  const code = item.code?.coding?.[0]?.code || '';

  // Extract category from extension
  const categoryExt = item.extension?.find(
    (ext) => ext.url === 'http://medimind.ge/extensions/medical-data-category'
  );
  const category = (categoryExt?.valueString as 'physical' | 'postop' | 'ambulatory') || 'physical';

  // Extract multilingual names from extensions
  const nameKa =
    item.extension?.find((ext) => ext.url === 'http://medimind.ge/extensions/name-ka')?.valueString ||
    item.title ||
    '';

  // Extract sort order
  const sortOrderExt = item.extension?.find((ext) => ext.url === 'http://medimind.ge/extensions/sort-order');
  const sortOrder = sortOrderExt?.valueInteger;

  // Extract unit
  const unit = item.quantitativeDetails?.unit?.coding?.[0]?.display;

  return {
    id: item.id || '',
    code,
    nameKa,
    unit,
    sortOrder,
    category,
    active: item.status === 'active',
    lastModified: item.meta?.lastUpdated,
  };
}

/**
 * Convert ObservationDefinition resource to MedicalDataFormValues for editing
 *
 * @param item - ObservationDefinition resource
 * @returns MedicalDataFormValues
 */
export function observationDefinitionToFormValues(item: ObservationDefinition): MedicalDataFormValues {
  const code = item.code?.coding?.[0]?.code || '';

  const categoryExt = item.extension?.find(
    (ext) => ext.url === 'http://medimind.ge/extensions/medical-data-category'
  );
  const category = (categoryExt?.valueString as 'physical' | 'postop' | 'ambulatory') || 'physical';

  const nameKa =
    item.extension?.find((ext) => ext.url === 'http://medimind.ge/extensions/name-ka')?.valueString ||
    item.title ||
    '';

  const sortOrderExt = item.extension?.find((ext) => ext.url === 'http://medimind.ge/extensions/sort-order');
  const sortOrder = sortOrderExt?.valueInteger;

  const unit = item.quantitativeDetails?.unit?.coding?.[0]?.display;
  const unitCode = item.quantitativeDetails?.unit?.coding?.[0]?.code;

  return {
    id: item.id,
    code,
    nameKa,
    unit,
    unitCode,
    sortOrder,
    category,
    active: item.status === 'active',
  };
}
