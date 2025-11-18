// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { ActivityDefinition, Bundle } from '@medplum/fhirtypes';
import type { ServiceFormValues, ServiceSearchParams } from '../types/nomenclature';
import { NOMENCLATURE_EXTENSION_URLS, NOMENCLATURE_IDENTIFIER_SYSTEMS } from '../types/nomenclature';

/**
 * Search for ActivityDefinition resources (medical services)
 *
 * FHIR search parameters:
 * - _sort: Sort by field (code, title, -code, -title)
 * - _count: Number of results per page (default: 100)
 * - _offset: Pagination offset
 * - identifier: Filter by service code (partial match)
 * - title:contains: Filter by service name (partial match)
 * - topic: Filter by service group
 * - status: Filter by service status (active, retired, draft)
 *
 * Extensions are used for:
 * - type: service-type (internal, other-clinics, limbach, etc.)
 * - subgroup: service-subgroup (medical specialties or DRG categories)
 * - serviceCategory: service-category (ambulatory, stationary, both)
 * - price: base-price (number range filtering)
 * - departments: assigned-departments (department assignments)
 *
 * @param medplum - MedplumClient instance
 * @param params - Search parameters for filtering ActivityDefinitions
 * @returns Bundle containing matching ActivityDefinition resources
 */
export async function searchServices(
  medplum: MedplumClient,
  params: ServiceSearchParams
): Promise<Bundle<ActivityDefinition>> {
  const searchParams = new URLSearchParams();

  // Pagination
  const count = params.count || 100;
  const page = params.page || 1;
  const offset = (page - 1) * count;

  searchParams.append('_count', count.toString());
  if (offset > 0) {
    searchParams.append('_offset', offset.toString());
  }

  // Sorting - use valid FHIR search parameters for ActivityDefinition
  // Valid sort fields: _id, _lastUpdated, date, title, url, version, status
  let sortField = params.sortField || 'title';
  // Map our custom sort fields to valid FHIR fields
  if (sortField === 'code') {
    sortField = 'title'; // Sort by title instead of code
  } else if (sortField === 'name') {
    sortField = 'title';
  }
  const sortOrder = params.sortOrder || 'asc';
  const sortPrefix = sortOrder === 'desc' ? '-' : '';
  searchParams.append('_sort', `${sortPrefix}${sortField}`);

  // Code search (partial match via identifier)
  if (params.code) {
    searchParams.append('identifier', `${NOMENCLATURE_IDENTIFIER_SYSTEMS.SERVICE_CODE}|${params.code}`);
  }

  // Name search (partial match via title)
  if (params.name) {
    searchParams.append('title:contains', params.name);
  }

  // Group filter (exact match via topic)
  if (params.group) {
    searchParams.append('topic', params.group);
  }

  // Status filter
  if (params.status && params.status !== 'all') {
    searchParams.append('status', params.status);
  }

  // Type filter (extension parameter)
  if (params.type) {
    searchParams.append(`${NOMENCLATURE_EXTENSION_URLS.SERVICE_TYPE}`, params.type);
  }

  // Subgroup filter (extension parameter)
  if (params.subgroup) {
    searchParams.append(`${NOMENCLATURE_EXTENSION_URLS.SUBGROUP}`, params.subgroup);
  }

  // Service category filter (extension parameter)
  if (params.serviceCategory) {
    searchParams.append(`${NOMENCLATURE_EXTENSION_URLS.SERVICE_CATEGORY}`, params.serviceCategory);
  }

  // Price range filtering (extension parameters)
  if (params.priceStart !== undefined) {
    searchParams.append(`${NOMENCLATURE_EXTENSION_URLS.BASE_PRICE}`, `ge${params.priceStart}`);
  }
  if (params.priceEnd !== undefined) {
    searchParams.append(`${NOMENCLATURE_EXTENSION_URLS.BASE_PRICE}`, `le${params.priceEnd}`);
  }

  // Department assignment filter (extension parameter)
  if (params.departmentAssignment && params.departmentId) {
    if (params.departmentAssignment === 'is') {
      searchParams.append(`${NOMENCLATURE_EXTENSION_URLS.ASSIGNED_DEPARTMENTS}`, params.departmentId);
    } else if (params.departmentAssignment === 'is-not') {
      searchParams.append(`${NOMENCLATURE_EXTENSION_URLS.ASSIGNED_DEPARTMENTS}:not`, params.departmentId);
    }
  }

  return medplum.search('ActivityDefinition', searchParams);
}

/**
 * Read single ActivityDefinition by ID
 *
 * @param medplum - MedplumClient instance
 * @param serviceId - ActivityDefinition resource ID
 * @returns ActivityDefinition resource
 */
export async function getServiceById(medplum: MedplumClient, serviceId: string): Promise<ActivityDefinition> {
  return medplum.readResource('ActivityDefinition', serviceId);
}

/**
 * Create new ActivityDefinition (medical service)
 *
 * Maps ServiceFormValues to FHIR ActivityDefinition resource structure:
 * - code → identifier (service-code system)
 * - name → title
 * - group → topic (CodeableConcept)
 * - subgroup → extension (service-subgroup)
 * - type → extension (service-type)
 * - serviceCategory → extension (service-category)
 * - price → extension (base-price)
 * - totalAmount → extension (total-amount)
 * - calHed → extension (cal-hed)
 * - printable → extension (printable)
 * - itemGetPrice → extension (item-get-price)
 * - departments → extension (assigned-departments)
 * - status → status (active, retired, draft)
 *
 * @param medplum - MedplumClient instance
 * @param values - Service form values
 * @returns Created ActivityDefinition resource
 */
export async function createService(
  medplum: MedplumClient,
  values: ServiceFormValues
): Promise<ActivityDefinition> {
  const service: ActivityDefinition = {
    resourceType: 'ActivityDefinition',
    status: values.status || 'active',
    identifier: [
      {
        system: NOMENCLATURE_IDENTIFIER_SYSTEMS.SERVICE_CODE,
        value: values.code,
      },
    ],
    title: values.name,
    topic: [
      {
        coding: [
          {
            code: values.group,
          },
        ],
      },
    ],
    extension: [],
  };

  // Add optional extensions
  if (values.subgroup) {
    service.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.SUBGROUP,
      valueString: values.subgroup,
    });
  }

  if (values.type) {
    service.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.SERVICE_TYPE,
      valueString: values.type,
    });
  }

  if (values.serviceCategory) {
    service.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.SERVICE_CATEGORY,
      valueString: values.serviceCategory,
    });
  }

  if (values.price !== undefined) {
    service.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.BASE_PRICE,
      valueMoney: {
        value: values.price,
        currency: 'GEL',
      },
    });
  }

  if (values.totalAmount !== undefined) {
    service.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.TOTAL_AMOUNT,
      valueMoney: {
        value: values.totalAmount,
        currency: 'GEL',
      },
    });
  }

  if (values.calHed !== undefined) {
    service.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.CAL_HED,
      valueDecimal: values.calHed,
    });
  }

  if (values.printable !== undefined) {
    service.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.PRINTABLE,
      valueBoolean: values.printable,
    });
  }

  if (values.itemGetPrice !== undefined) {
    service.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.ITEM_GET_PRICE,
      valueDecimal: values.itemGetPrice,
    });
  }

  if (values.departments && values.departments.length > 0) {
    service.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.ASSIGNED_DEPARTMENTS,
      valueString: values.departments.join(','),
    });
  }

  return medplum.createResource(service);
}

/**
 * Update existing ActivityDefinition (medical service)
 *
 * @param medplum - MedplumClient instance
 * @param id - ActivityDefinition resource ID
 * @param values - Service form values
 * @returns Updated ActivityDefinition resource
 */
export async function updateService(
  medplum: MedplumClient,
  id: string,
  values: ServiceFormValues
): Promise<ActivityDefinition> {
  // Read existing service
  const existingService = await medplum.readResource('ActivityDefinition', id);

  // Update fields
  const updatedService: ActivityDefinition = {
    ...existingService,
    status: values.status || existingService.status,
    identifier: [
      {
        system: NOMENCLATURE_IDENTIFIER_SYSTEMS.SERVICE_CODE,
        value: values.code,
      },
    ],
    title: values.name,
    topic: [
      {
        coding: [
          {
            code: values.group,
          },
        ],
      },
    ],
    extension: [],
  };

  // Rebuild extensions with new values
  if (values.subgroup) {
    updatedService.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.SUBGROUP,
      valueString: values.subgroup,
    });
  }

  if (values.type) {
    updatedService.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.SERVICE_TYPE,
      valueString: values.type,
    });
  }

  if (values.serviceCategory) {
    updatedService.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.SERVICE_CATEGORY,
      valueString: values.serviceCategory,
    });
  }

  if (values.price !== undefined) {
    updatedService.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.BASE_PRICE,
      valueMoney: {
        value: values.price,
        currency: 'GEL',
      },
    });
  }

  if (values.totalAmount !== undefined) {
    updatedService.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.TOTAL_AMOUNT,
      valueMoney: {
        value: values.totalAmount,
        currency: 'GEL',
      },
    });
  }

  if (values.calHed !== undefined) {
    updatedService.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.CAL_HED,
      valueDecimal: values.calHed,
    });
  }

  if (values.printable !== undefined) {
    updatedService.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.PRINTABLE,
      valueBoolean: values.printable,
    });
  }

  if (values.itemGetPrice !== undefined) {
    updatedService.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.ITEM_GET_PRICE,
      valueDecimal: values.itemGetPrice,
    });
  }

  if (values.departments && values.departments.length > 0) {
    updatedService.extension?.push({
      url: NOMENCLATURE_EXTENSION_URLS.ASSIGNED_DEPARTMENTS,
      valueString: values.departments.join(','),
    });
  }

  return medplum.updateResource(updatedService);
}

/**
 * Soft delete: Set status to 'retired'
 *
 * This is the recommended deletion method as it preserves the record
 * for audit purposes while marking it as no longer active.
 *
 * @param medplum - MedplumClient instance
 * @param serviceId - ActivityDefinition resource ID
 * @returns Updated ActivityDefinition with status='retired'
 */
export async function deleteService(medplum: MedplumClient, serviceId: string): Promise<ActivityDefinition> {
  const service = await medplum.readResource('ActivityDefinition', serviceId);
  service.status = 'retired';
  return medplum.updateResource(service);
}

/**
 * Hard delete: Permanently remove ActivityDefinition (admin only)
 *
 * WARNING: This permanently deletes the ActivityDefinition resource.
 * Only use for admin operations or data cleanup.
 *
 * @param medplum - MedplumClient instance
 * @param serviceId - ActivityDefinition resource ID
 */
export async function hardDeleteService(medplum: MedplumClient, serviceId: string): Promise<void> {
  await medplum.deleteResource('ActivityDefinition', serviceId);
}

/**
 * Check if a service code already exists (for duplicate prevention)
 *
 * @param medplum - MedplumClient instance
 * @param code - Service code to check
 * @param excludeId - Optional ID to exclude from check (for updates)
 * @returns True if code exists, false otherwise
 */
export async function checkCodeExists(
  medplum: MedplumClient,
  code: string,
  excludeId?: string
): Promise<boolean> {
  const searchParams = new URLSearchParams();
  searchParams.append('identifier', `${NOMENCLATURE_IDENTIFIER_SYSTEMS.SERVICE_CODE}|${code}`);
  searchParams.append('_count', '1');

  const bundle = await medplum.search('ActivityDefinition', searchParams);

  if (!bundle.entry || bundle.entry.length === 0) {
    return false;
  }

  // If excludeId is provided, check if the found resource is different
  if (excludeId) {
    const foundId = bundle.entry[0].resource?.id;
    return foundId !== excludeId;
  }

  return true;
}
