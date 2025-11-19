// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActivityDefinition, Extension } from '@medplum/fhirtypes';

/**
 * Performer configuration for salary distribution
 */
export interface Performer {
  id?: string;
  name: string; // Performer name or department
  type: string; // Role type (e.g., "მოქრილი", "კაბი")
  percentage: number; // Salary percentage (0-100)
  isDefault: boolean; // Default performer flag
  practitionerRoleId?: string; // Reference to PractitionerRole resource
}

/**
 * Secondary personnel category
 */
export interface SecondaryPersonnel {
  id?: string;
  category: number; // 1, 2, or 3
  personnelId: string; // Reference to staff member
  personnelName: string; // Display name
}

/**
 * Other salary line item
 */
export interface OtherSalary {
  id?: string;
  description: string; // Description of the salary item
  amount?: number; // Optional fixed amount
}

/**
 * Complete salary configuration for a service
 */
export interface SalaryConfiguration {
  performers: Performer[];
  secondaryPersonnel: SecondaryPersonnel[];
  otherSalaries: OtherSalary[];
  description?: string; // General salary description
}

/**
 * Extension URL for service salary configuration
 */
const SERVICE_SALARY_EXTENSION_URL = 'http://medimind.ge/fhir/extension/service-salary-config';

/**
 * Get all performers from an ActivityDefinition
 *
 * @param service - ActivityDefinition resource
 * @returns Array of performers
 */
export function getPerformers(service: ActivityDefinition): Performer[] {
  const salaryExt = service.extension?.find((ext) => ext.url === SERVICE_SALARY_EXTENSION_URL);
  if (!salaryExt) {
    return [];
  }

  const performersExt = salaryExt.extension?.find((e) => e.url === 'performers');
  if (!performersExt?.extension) {
    return [];
  }

  return performersExt.extension.map((performerExt) => {
    const nameExt = performerExt.extension?.find((e) => e.url === 'name');
    const typeExt = performerExt.extension?.find((e) => e.url === 'type');
    const percentageExt = performerExt.extension?.find((e) => e.url === 'percentage');
    const isDefaultExt = performerExt.extension?.find((e) => e.url === 'isDefault');
    const practitionerRoleExt = performerExt.extension?.find((e) => e.url === 'practitionerRole');

    return {
      id: `performer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: nameExt?.valueString || '',
      type: typeExt?.valueString || '',
      percentage: percentageExt?.valueDecimal || 0,
      isDefault: isDefaultExt?.valueBoolean || false,
      practitionerRoleId: practitionerRoleExt?.valueReference?.reference?.split('/')[1],
    };
  });
}

/**
 * Add a performer to an ActivityDefinition
 *
 * @param service - ActivityDefinition resource
 * @param performer - Performer to add
 * @returns Updated ActivityDefinition with performer added
 */
export function addPerformer(service: ActivityDefinition, performer: Performer): ActivityDefinition {
  const performerExtension: Extension = {
    url: 'performer',
    extension: [
      { url: 'name', valueString: performer.name },
      { url: 'type', valueString: performer.type },
      { url: 'percentage', valueDecimal: performer.percentage },
      { url: 'isDefault', valueBoolean: performer.isDefault },
    ],
  };

  if (performer.practitionerRoleId) {
    performerExtension.extension?.push({
      url: 'practitionerRole',
      valueReference: {
        reference: `PractitionerRole/${performer.practitionerRoleId}`,
      },
    });
  }

  // Find or create salary config extension
  const otherExtensions = service.extension?.filter((ext) => ext.url !== SERVICE_SALARY_EXTENSION_URL) || [];
  const salaryExt = service.extension?.find((ext) => ext.url === SERVICE_SALARY_EXTENSION_URL);

  let performersExt: Extension | undefined;
  let otherSalaryExtensions: Extension[] = [];

  if (salaryExt?.extension) {
    performersExt = salaryExt.extension.find((e) => e.url === 'performers');
    otherSalaryExtensions = salaryExt.extension.filter((e) => e.url !== 'performers');
  }

  const updatedPerformersExt: Extension = {
    url: 'performers',
    extension: [...(performersExt?.extension || []), performerExtension],
  };

  const updatedSalaryExt: Extension = {
    url: SERVICE_SALARY_EXTENSION_URL,
    extension: [...otherSalaryExtensions, updatedPerformersExt],
  };

  return {
    ...service,
    extension: [...otherExtensions, updatedSalaryExt],
  };
}

/**
 * Update a performer in an ActivityDefinition
 *
 * @param service - ActivityDefinition resource
 * @param index - Index of the performer to update (0-based)
 * @param performer - Updated performer data
 * @returns Updated ActivityDefinition with performer modified
 */
export function updatePerformer(service: ActivityDefinition, index: number, performer: Performer): ActivityDefinition {
  const performers = getPerformers(service);

  if (index < 0 || index >= performers.length) {
    throw new Error(`Performer index ${index} out of bounds (0-${performers.length - 1})`);
  }

  const updatedPerformerExtension: Extension = {
    url: 'performer',
    extension: [
      { url: 'name', valueString: performer.name },
      { url: 'type', valueString: performer.type },
      { url: 'percentage', valueDecimal: performer.percentage },
      { url: 'isDefault', valueBoolean: performer.isDefault },
    ],
  };

  if (performer.practitionerRoleId) {
    updatedPerformerExtension.extension?.push({
      url: 'practitionerRole',
      valueReference: {
        reference: `PractitionerRole/${performer.practitionerRoleId}`,
      },
    });
  }

  // Rebuild salary extension with updated performer
  const otherExtensions = service.extension?.filter((ext) => ext.url !== SERVICE_SALARY_EXTENSION_URL) || [];
  const salaryExt = service.extension?.find((ext) => ext.url === SERVICE_SALARY_EXTENSION_URL);
  const performersExt = salaryExt?.extension?.find((e) => e.url === 'performers');
  const otherSalaryExtensions = salaryExt?.extension?.filter((e) => e.url !== 'performers') || [];

  const updatedPerformerExtensions = [
    ...(performersExt?.extension?.slice(0, index) || []),
    updatedPerformerExtension,
    ...(performersExt?.extension?.slice(index + 1) || []),
  ];

  const updatedPerformersExt: Extension = {
    url: 'performers',
    extension: updatedPerformerExtensions,
  };

  const updatedSalaryExt: Extension = {
    url: SERVICE_SALARY_EXTENSION_URL,
    extension: [...otherSalaryExtensions, updatedPerformersExt],
  };

  return {
    ...service,
    extension: [...otherExtensions, updatedSalaryExt],
  };
}

/**
 * Delete a performer from an ActivityDefinition
 *
 * @param service - ActivityDefinition resource
 * @param index - Index of the performer to delete (0-based)
 * @returns Updated ActivityDefinition with performer removed
 */
export function deletePerformer(service: ActivityDefinition, index: number): ActivityDefinition {
  const performers = getPerformers(service);

  if (index < 0 || index >= performers.length) {
    throw new Error(`Performer index ${index} out of bounds (0-${performers.length - 1})`);
  }

  // Rebuild salary extension without the deleted performer
  const otherExtensions = service.extension?.filter((ext) => ext.url !== SERVICE_SALARY_EXTENSION_URL) || [];
  const salaryExt = service.extension?.find((ext) => ext.url === SERVICE_SALARY_EXTENSION_URL);
  const performersExt = salaryExt?.extension?.find((e) => e.url === 'performers');
  const otherSalaryExtensions = salaryExt?.extension?.filter((e) => e.url !== 'performers') || [];

  const updatedPerformerExtensions = [
    ...(performersExt?.extension?.slice(0, index) || []),
    ...(performersExt?.extension?.slice(index + 1) || []),
  ];

  const updatedPerformersExt: Extension = {
    url: 'performers',
    extension: updatedPerformerExtensions,
  };

  const updatedSalaryExt: Extension = {
    url: SERVICE_SALARY_EXTENSION_URL,
    extension: [...otherSalaryExtensions, updatedPerformersExt],
  };

  return {
    ...service,
    extension: [...otherExtensions, updatedSalaryExt],
  };
}

/**
 * Get secondary personnel from an ActivityDefinition
 *
 * @param service - ActivityDefinition resource
 * @returns Array of secondary personnel
 */
export function getSecondaryPersonnel(service: ActivityDefinition): SecondaryPersonnel[] {
  const salaryExt = service.extension?.find((ext) => ext.url === SERVICE_SALARY_EXTENSION_URL);
  if (!salaryExt) {
    return [];
  }

  const secondaryExt = salaryExt.extension?.find((e) => e.url === 'secondaryPersonnel');
  if (!secondaryExt?.extension) {
    return [];
  }

  return secondaryExt.extension
    .map((personnelExt) => {
      const categoryExt = personnelExt.extension?.find((e) => e.url === 'category');
      const personnelIdExt = personnelExt.extension?.find((e) => e.url === 'personnelId');
      const personnelNameExt = personnelExt.extension?.find((e) => e.url === 'personnelName');

      if (!categoryExt || !personnelIdExt) {
        return null;
      }

      return {
        id: `secondary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        category: categoryExt.valueInteger || 1,
        personnelId: personnelIdExt.valueString || '',
        personnelName: personnelNameExt?.valueString || '',
      };
    })
    .filter((p): p is SecondaryPersonnel => p !== null);
}

/**
 * Add secondary personnel to an ActivityDefinition
 *
 * @param service - ActivityDefinition resource
 * @param personnel - Secondary personnel to add
 * @returns Updated ActivityDefinition with secondary personnel added
 */
export function addSecondaryPersonnel(
  service: ActivityDefinition,
  personnel: SecondaryPersonnel
): ActivityDefinition {
  const personnelExtension: Extension = {
    url: 'personnelEntry',
    extension: [
      { url: 'category', valueInteger: personnel.category },
      { url: 'personnelId', valueString: personnel.personnelId },
      { url: 'personnelName', valueString: personnel.personnelName },
    ],
  };

  // Find or create salary config extension
  const otherExtensions = service.extension?.filter((ext) => ext.url !== SERVICE_SALARY_EXTENSION_URL) || [];
  const salaryExt = service.extension?.find((ext) => ext.url === SERVICE_SALARY_EXTENSION_URL);

  let secondaryExt: Extension | undefined;
  let otherSalaryExtensions: Extension[] = [];

  if (salaryExt?.extension) {
    secondaryExt = salaryExt.extension.find((e) => e.url === 'secondaryPersonnel');
    otherSalaryExtensions = salaryExt.extension.filter((e) => e.url !== 'secondaryPersonnel');
  }

  const updatedSecondaryExt: Extension = {
    url: 'secondaryPersonnel',
    extension: [...(secondaryExt?.extension || []), personnelExtension],
  };

  const updatedSalaryExt: Extension = {
    url: SERVICE_SALARY_EXTENSION_URL,
    extension: [...otherSalaryExtensions, updatedSecondaryExt],
  };

  return {
    ...service,
    extension: [...otherExtensions, updatedSalaryExt],
  };
}

/**
 * Get other salaries from an ActivityDefinition
 *
 * @param service - ActivityDefinition resource
 * @returns Array of other salary items
 */
export function getOtherSalaries(service: ActivityDefinition): OtherSalary[] {
  const salaryExt = service.extension?.find((ext) => ext.url === SERVICE_SALARY_EXTENSION_URL);
  if (!salaryExt) {
    return [];
  }

  const otherSalariesExt = salaryExt.extension?.find((e) => e.url === 'otherSalaries');
  if (!otherSalariesExt?.extension) {
    return [];
  }

  return otherSalariesExt.extension.map((itemExt) => {
    const descriptionExt = itemExt.extension?.find((e) => e.url === 'description');
    const amountExt = itemExt.extension?.find((e) => e.url === 'amount');

    return {
      id: `other-salary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: descriptionExt?.valueString || '',
      amount: amountExt?.valueMoney?.value,
    };
  });
}

/**
 * Add other salary item to an ActivityDefinition
 *
 * @param service - ActivityDefinition resource
 * @param salary - Other salary item to add
 * @returns Updated ActivityDefinition with other salary added
 */
export function addOtherSalary(service: ActivityDefinition, salary: OtherSalary): ActivityDefinition {
  const salaryExtension: Extension = {
    url: 'item',
    extension: [{ url: 'description', valueString: salary.description }],
  };

  if (salary.amount !== undefined) {
    salaryExtension.extension?.push({
      url: 'amount',
      valueMoney: { value: salary.amount, currency: 'GEL' },
    });
  }

  // Find or create salary config extension
  const otherExtensions = service.extension?.filter((ext) => ext.url !== SERVICE_SALARY_EXTENSION_URL) || [];
  const salaryConfigExt = service.extension?.find((ext) => ext.url === SERVICE_SALARY_EXTENSION_URL);

  let otherSalariesExt: Extension | undefined;
  let otherSalaryExtensions: Extension[] = [];

  if (salaryConfigExt?.extension) {
    otherSalariesExt = salaryConfigExt.extension.find((e) => e.url === 'otherSalaries');
    otherSalaryExtensions = salaryConfigExt.extension.filter((e) => e.url !== 'otherSalaries');
  }

  const updatedOtherSalariesExt: Extension = {
    url: 'otherSalaries',
    extension: [...(otherSalariesExt?.extension || []), salaryExtension],
  };

  const updatedSalaryConfigExt: Extension = {
    url: SERVICE_SALARY_EXTENSION_URL,
    extension: [...otherSalaryExtensions, updatedOtherSalariesExt],
  };

  return {
    ...service,
    extension: [...otherExtensions, updatedSalaryConfigExt],
  };
}

/**
 * Get salary description from an ActivityDefinition
 *
 * @param service - ActivityDefinition resource
 * @returns Salary description or undefined
 */
export function getSalaryDescription(service: ActivityDefinition): string | undefined {
  const salaryExt = service.extension?.find((ext) => ext.url === SERVICE_SALARY_EXTENSION_URL);
  if (!salaryExt) {
    return undefined;
  }

  const descriptionExt = salaryExt.extension?.find((e) => e.url === 'description');
  return descriptionExt?.valueString;
}

/**
 * Update salary description in an ActivityDefinition
 *
 * @param service - ActivityDefinition resource
 * @param description - Salary description
 * @returns Updated ActivityDefinition with description updated
 */
export function updateSalaryDescription(service: ActivityDefinition, description: string): ActivityDefinition {
  const otherExtensions = service.extension?.filter((ext) => ext.url !== SERVICE_SALARY_EXTENSION_URL) || [];
  const salaryExt = service.extension?.find((ext) => ext.url === SERVICE_SALARY_EXTENSION_URL);
  const otherSalaryExtensions = salaryExt?.extension?.filter((e) => e.url !== 'description') || [];

  const updatedSalaryExt: Extension = {
    url: SERVICE_SALARY_EXTENSION_URL,
    extension: [...otherSalaryExtensions, { url: 'description', valueString: description }],
  };

  return {
    ...service,
    extension: [...otherExtensions, updatedSalaryExt],
  };
}

/**
 * Get complete salary configuration from an ActivityDefinition
 *
 * @param service - ActivityDefinition resource
 * @returns Complete salary configuration
 */
export function getSalaryConfiguration(service: ActivityDefinition): SalaryConfiguration {
  return {
    performers: getPerformers(service),
    secondaryPersonnel: getSecondaryPersonnel(service),
    otherSalaries: getOtherSalaries(service),
    description: getSalaryDescription(service),
  };
}
