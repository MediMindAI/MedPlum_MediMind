// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { Location } from '@medplum/fhirtypes';
import type {
  CashRegisterFormValues,
  CashRegisterRow,
  CashRegisterSearchFilters,
} from '../types/settings';

/**
 * Cash Register Service - CRUD operations for cash registers
 *
 * Cash registers are stored as FHIR Location resources with:
 * - identifier system: http://medimind.ge/identifiers/cash-register-id
 * - type: cash-register
 * - name: multilingual names stored in extensions
 * - bankCode: stored in extension (optional)
 */

/**
 * Search for cash registers with filtering
 *
 * @param medplum - Medplum client
 * @param filters - Search filters
 * @returns Array of Location resources
 */
export async function searchCashRegisters(
  medplum: MedplumClient,
  filters: CashRegisterSearchFilters = {}
): Promise<Location[]> {
  const searchParams: Record<string, string> = {
    type: 'cash-register',
    _count: '100',
    _sort: 'name',
  };

  // Name search (partial match) - searches across all names
  if (filters.name) {
    searchParams['name:contains'] = filters.name;
  }

  // Code search
  if (filters.code) {
    searchParams.identifier = `http://medimind.ge/identifiers/cash-register-id|${filters.code}`;
  }

  // Active status filter
  if (filters.active !== undefined) {
    searchParams.status = filters.active ? 'active' : 'inactive';
  }

  // Type filter (stored in extension)
  if (filters.type) {
    searchParams['extension'] = `http://medimind.ge/extensions/cash-register-type|${filters.type}`;
  }

  const cashRegisters = await medplum.searchResources('Location', searchParams);
  return cashRegisters;
}

/**
 * Get cash register by ID
 *
 * @param medplum - Medplum client
 * @param cashRegisterId - Location resource ID
 * @returns Location resource
 */
export async function getCashRegister(medplum: MedplumClient, cashRegisterId: string): Promise<Location> {
  return await medplum.readResource('Location', cashRegisterId);
}

/**
 * Create a new cash register
 *
 * @param medplum - Medplum client
 * @param values - Cash register form values
 * @returns Created Location resource
 */
export async function createCashRegister(
  medplum: MedplumClient,
  values: CashRegisterFormValues
): Promise<Location> {
  // Build extensions for multilingual names and type
  const extensions: any[] = [];

  // Cash register type (required)
  extensions.push({
    url: 'http://medimind.ge/extensions/cash-register-type',
    valueString: values.type,
  });

  // Multilingual names
  if (values.nameKa) {
    extensions.push({
      url: 'http://medimind.ge/extensions/name-ka',
      valueString: values.nameKa,
    });
  }

  // Bank code (optional, ქარხნული კოდი)
  if (values.bankCode) {
    extensions.push({
      url: 'http://medimind.ge/extensions/bank-code',
      valueString: values.bankCode,
    });
  }

  const cashRegister: Location = {
    resourceType: 'Location',
    identifier: [
      {
        system: 'http://medimind.ge/identifiers/cash-register-id',
        value: values.code,
      },
    ],
    type: [
      {
        coding: [
          {
            system: 'http://medimind.ge/location-type',
            code: 'cash-register',
            display: 'Cash Register',
          },
        ],
      },
    ],
    name: values.nameKa, // Primary name is Georgian
    status: values.active ? 'active' : 'inactive',
    extension: extensions.length > 0 ? extensions : undefined,
  };

  return await medplum.createResource(cashRegister);
}

/**
 * Update an existing cash register
 *
 * @param medplum - Medplum client
 * @param cashRegisterId - Location resource ID
 * @param values - Updated form values
 * @returns Updated Location resource
 */
export async function updateCashRegister(
  medplum: MedplumClient,
  cashRegisterId: string,
  values: CashRegisterFormValues
): Promise<Location> {
  // Fetch existing cash register
  const existing = await getCashRegister(medplum, cashRegisterId);

  // Build extensions
  const extensions: any[] = [];

  // Cash register type
  extensions.push({
    url: 'http://medimind.ge/extensions/cash-register-type',
    valueString: values.type,
  });

  // Multilingual names
  if (values.nameKa) {
    extensions.push({
      url: 'http://medimind.ge/extensions/name-ka',
      valueString: values.nameKa,
    });
  }

  // Bank code (optional)
  if (values.bankCode) {
    extensions.push({
      url: 'http://medimind.ge/extensions/bank-code',
      valueString: values.bankCode,
    });
  }

  const updated: Location = {
    ...existing,
    identifier: [
      {
        system: 'http://medimind.ge/identifiers/cash-register-id',
        value: values.code,
      },
    ],
    name: values.nameKa,
    status: values.active ? 'active' : 'inactive',
    extension: extensions.length > 0 ? extensions : undefined,
  };

  return await medplum.updateResource(updated);
}

/**
 * Delete a cash register (soft delete - set status=inactive)
 *
 * @param medplum - Medplum client
 * @param cashRegisterId - Location resource ID
 * @returns Updated Location resource with status=inactive
 */
export async function deleteCashRegister(medplum: MedplumClient, cashRegisterId: string): Promise<Location> {
  const cashRegister = await getCashRegister(medplum, cashRegisterId);

  const updated: Location = {
    ...cashRegister,
    status: 'inactive',
  };

  return await medplum.updateResource(updated);
}

/**
 * Convert Location resource to CashRegisterRow for table display
 *
 * @param cashRegister - Location resource
 * @returns CashRegisterRow
 */
export function locationToCashRegisterRow(cashRegister: Location): CashRegisterRow {
  // Extract code from identifier
  const code =
    cashRegister.identifier?.find((id) => id.system === 'http://medimind.ge/identifiers/cash-register-id')?.value ||
    '';

  // Extract type from extension
  const type =
    (cashRegister.extension?.find((ext) => ext.url === 'http://medimind.ge/extensions/cash-register-type')
      ?.valueString as any) || 'cash';

  // Extract bank code from extension
  const bankCode = cashRegister.extension?.find((ext) => ext.url === 'http://medimind.ge/extensions/bank-code')
    ?.valueString;

  // Extract multilingual names from extensions
  const nameKa =
    cashRegister.extension?.find((ext) => ext.url === 'http://medimind.ge/extensions/name-ka')?.valueString ||
    cashRegister.name ||
    '';

  return {
    id: cashRegister.id || '',
    code,
    bankCode,
    nameKa,
    type,
    active: cashRegister.status === 'active',
    lastModified: cashRegister.meta?.lastUpdated,
  };
}

/**
 * Convert Location resource to CashRegisterFormValues for editing
 *
 * @param cashRegister - Location resource
 * @returns CashRegisterFormValues
 */
export function locationToFormValues(cashRegister: Location): CashRegisterFormValues {
  const code =
    cashRegister.identifier?.find((id) => id.system === 'http://medimind.ge/identifiers/cash-register-id')?.value ||
    '';

  const type =
    (cashRegister.extension?.find((ext) => ext.url === 'http://medimind.ge/extensions/cash-register-type')
      ?.valueString as any) || 'cash';

  const bankCode = cashRegister.extension?.find((ext) => ext.url === 'http://medimind.ge/extensions/bank-code')
    ?.valueString;

  const nameKa =
    cashRegister.extension?.find((ext) => ext.url === 'http://medimind.ge/extensions/name-ka')?.valueString ||
    cashRegister.name ||
    '';

  return {
    id: cashRegister.id,
    code,
    bankCode,
    nameKa,
    type,
    active: cashRegister.status === 'active',
  };
}
