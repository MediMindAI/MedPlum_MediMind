// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { Organization } from '@medplum/fhirtypes';
import type { DepartmentFormValues, DepartmentRow, DepartmentSearchFilters } from '../types/settings';

/**
 * Department Service - CRUD operations for departments
 *
 * Departments are stored as FHIR Organization resources with:
 * - identifier system: http://medimind.ge/identifiers/department-id
 * - type: dept
 * - name: multilingual names stored in extensions
 */

/**
 * Search for departments with filtering
 *
 * @param medplum - Medplum client
 * @param filters - Search filters
 * @returns Array of Organization resources
 */
export async function searchDepartments(
  medplum: MedplumClient,
  filters: DepartmentSearchFilters = {}
): Promise<Organization[]> {
  const searchParams: Record<string, string> = {
    type: 'dept',
    _count: '100',
    _sort: 'name',
  };

  // Name search (partial match) - searches across all names
  if (filters.name) {
    searchParams['name:contains'] = filters.name;
  }

  // Code search
  if (filters.code) {
    searchParams.identifier = `http://medimind.ge/identifiers/department-id|${filters.code}`;
  }

  // Active status filter
  if (filters.active !== undefined) {
    searchParams.active = filters.active ? 'true' : 'false';
  }

  // Parent department filter
  if (filters.parentId) {
    searchParams.partof = `Organization/${filters.parentId}`;
  }

  const departments = await medplum.searchResources('Organization', searchParams);
  return departments;
}

/**
 * Get department by ID
 *
 * @param medplum - Medplum client
 * @param departmentId - Organization resource ID
 * @returns Organization resource
 */
export async function getDepartment(medplum: MedplumClient, departmentId: string): Promise<Organization> {
  return await medplum.readResource('Organization', departmentId);
}

/**
 * Create a new department
 *
 * @param medplum - Medplum client
 * @param values - Department form values
 * @returns Created Organization resource
 */
export async function createDepartment(medplum: MedplumClient, values: DepartmentFormValues): Promise<Organization> {
  // Build extensions for multilingual names
  const extensions: any[] = [];

  if (values.nameKa) {
    extensions.push({
      url: 'http://medimind.ge/extensions/name-ka',
      valueString: values.nameKa,
    });
  }

  const department: Organization = {
    resourceType: 'Organization',
    identifier: [
      {
        system: 'http://medimind.ge/identifiers/department-id',
        value: values.code,
      },
    ],
    type: [
      {
        coding: [
          {
            system: 'http://medimind.ge/organization-type',
            code: 'dept',
            display: 'Department',
          },
        ],
      },
    ],
    name: values.nameKa, // Primary name is Georgian
    active: values.active,
    extension: extensions.length > 0 ? extensions : undefined,
    partOf: values.parentId
      ? {
          reference: `Organization/${values.parentId}`,
        }
      : undefined,
  };

  return await medplum.createResource(department);
}

/**
 * Update an existing department
 *
 * @param medplum - Medplum client
 * @param departmentId - Organization resource ID
 * @param values - Updated form values
 * @returns Updated Organization resource
 */
export async function updateDepartment(
  medplum: MedplumClient,
  departmentId: string,
  values: DepartmentFormValues
): Promise<Organization> {
  // Fetch existing department
  const existing = await getDepartment(medplum, departmentId);

  // Build extensions for multilingual names
  const extensions: any[] = [];

  if (values.nameKa) {
    extensions.push({
      url: 'http://medimind.ge/extensions/name-ka',
      valueString: values.nameKa,
    });
  }

  const updated: Organization = {
    ...existing,
    identifier: [
      {
        system: 'http://medimind.ge/identifiers/department-id',
        value: values.code,
      },
    ],
    name: values.nameKa,
    active: values.active,
    extension: extensions.length > 0 ? extensions : undefined,
    partOf: values.parentId
      ? {
          reference: `Organization/${values.parentId}`,
        }
      : undefined,
  };

  return await medplum.updateResource(updated);
}

/**
 * Delete a department (soft delete - set active=false)
 *
 * @param medplum - Medplum client
 * @param departmentId - Organization resource ID
 * @returns Updated Organization resource with active=false
 */
export async function deleteDepartment(medplum: MedplumClient, departmentId: string): Promise<Organization> {
  const department = await getDepartment(medplum, departmentId);

  const updated: Organization = {
    ...department,
    active: false,
  };

  return await medplum.updateResource(updated);
}

/**
 * Convert Organization resource to DepartmentRow for table display
 *
 * @param department - Organization resource
 * @param allDepartments - All departments (for resolving parent names)
 * @returns DepartmentRow
 */
export function organizationToDepartmentRow(
  department: Organization,
  allDepartments: Organization[] = []
): DepartmentRow {
  // Extract code from identifier
  const code =
    department.identifier?.find((id) => id.system === 'http://medimind.ge/identifiers/department-id')?.value || '';

  // Extract multilingual names from extensions
  const nameKa =
    department.extension?.find((ext) => ext.url === 'http://medimind.ge/extensions/name-ka')?.valueString ||
    department.name ||
    '';

  // Resolve parent department name
  let parentName: string | undefined;
  if (department.partOf?.reference) {
    const parentId = department.partOf.reference.split('/')[1];
    const parent = allDepartments.find((d) => d.id === parentId);
    if (parent) {
      parentName =
        parent.extension?.find((ext) => ext.url === 'http://medimind.ge/extensions/name-ka')?.valueString ||
        parent.name;
    }
  }

  return {
    id: department.id || '',
    code,
    nameKa,
    parentName,
    active: department.active !== false,
    lastModified: department.meta?.lastUpdated,
  };
}

/**
 * Convert Organization resource to DepartmentFormValues for editing
 *
 * @param department - Organization resource
 * @returns DepartmentFormValues
 */
export function organizationToFormValues(department: Organization): DepartmentFormValues {
  const code =
    department.identifier?.find((id) => id.system === 'http://medimind.ge/identifiers/department-id')?.value || '';

  const nameKa =
    department.extension?.find((ext) => ext.url === 'http://medimind.ge/extensions/name-ka')?.valueString ||
    department.name ||
    '';

  const parentId = department.partOf?.reference?.split('/')[1];

  return {
    id: department.id,
    code,
    nameKa,
    parentId,
    active: department.active !== false,
  };
}
