// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { CodeSystem, CodeSystemConcept } from '@medplum/fhirtypes';
import type { OperatorTypeFormValues } from '../types/settings';

/**
 * CodeSystem URL for operator types
 */
const OPERATOR_TYPE_SYSTEM = 'http://medimind.ge/CodeSystem/operator-types';

/**
 * Get or create the operator types CodeSystem
 * @param medplum - MedplumClient instance
 */
async function getOrCreateCodeSystem(medplum: MedplumClient): Promise<CodeSystem> {
  // Search for existing CodeSystem
  const bundle = await medplum.search('CodeSystem', {
    url: OPERATOR_TYPE_SYSTEM,
  });

  if (bundle.entry && bundle.entry.length > 0) {
    return bundle.entry[0].resource as CodeSystem;
  }

  // Create new CodeSystem if not found
  const newCodeSystem: CodeSystem = {
    resourceType: 'CodeSystem',
    url: OPERATOR_TYPE_SYSTEM,
    name: 'OperatorTypes',
    title: 'Operator Types',
    status: 'active',
    content: 'complete',
    concept: [],
  };

  return medplum.createResource(newCodeSystem);
}

/**
 * Convert form values to CodeSystem concept
 * @param values - OperatorTypeFormValues
 */
function formValuesToConcept(values: OperatorTypeFormValues): CodeSystemConcept {
  const concept: CodeSystemConcept = {
    code: values.code,
    display: values.displayKa,
    designation: [
      {
        language: 'ka',
        value: values.displayKa,
      },
    ],
    property: [
      {
        code: 'type',
        valueString: values.type,
      },
      {
        code: 'active',
        valueBoolean: values.active,
      },
    ],
  };

  // Add specialty if provided
  if (values.specialty) {
    concept.property?.push({
      code: 'specialty',
      valueString: values.specialty,
    });
  }

  // Add capabilities
  if (values.canRegister !== undefined) {
    concept.property?.push({
      code: 'canRegister',
      valueBoolean: values.canRegister,
    });
  }

  if (values.canPrescribe !== undefined) {
    concept.property?.push({
      code: 'canPrescribe',
      valueBoolean: values.canPrescribe,
    });
  }

  if (values.canPerformSurgery !== undefined) {
    concept.property?.push({
      code: 'canPerformSurgery',
      valueBoolean: values.canPerformSurgery,
    });
  }

  return concept;
}

/**
 * Convert CodeSystem concept to form values
 * @param concept - CodeSystemConcept
 */
function conceptToFormValues(concept: CodeSystemConcept): OperatorTypeFormValues {
  const kaDesignation = concept.designation?.find((d) => d.language === 'ka');

  const typeProperty = concept.property?.find((p) => p.code === 'type');
  const activeProperty = concept.property?.find((p) => p.code === 'active');
  const specialtyProperty = concept.property?.find((p) => p.code === 'specialty');
  const canRegisterProperty = concept.property?.find((p) => p.code === 'canRegister');
  const canPrescribeProperty = concept.property?.find((p) => p.code === 'canPrescribe');
  const canPerformSurgeryProperty = concept.property?.find((p) => p.code === 'canPerformSurgery');

  return {
    code: concept.code || '',
    displayKa: kaDesignation?.value || concept.display || '',
    type: (typeProperty?.valueString as OperatorTypeFormValues['type']) || 'medical',
    specialty: specialtyProperty?.valueString,
    canRegister: canRegisterProperty?.valueBoolean,
    canPrescribe: canPrescribeProperty?.valueBoolean,
    canPerformSurgery: canPerformSurgeryProperty?.valueBoolean,
    active: activeProperty?.valueBoolean ?? true,
  };
}

/**
 * Get all operator types
 * @param medplum - MedplumClient instance
 */
export async function getOperatorTypes(medplum: MedplumClient): Promise<OperatorTypeFormValues[]> {
  const codeSystem = await getOrCreateCodeSystem(medplum);
  const concepts = codeSystem.concept || [];
  return concepts.map(conceptToFormValues);
}

/**
 * Create a new operator type
 * @param medplum - MedplumClient instance
 * @param values - OperatorTypeFormValues
 */
export async function createOperatorType(
  medplum: MedplumClient,
  values: OperatorTypeFormValues
): Promise<OperatorTypeFormValues> {
  const codeSystem = await getOrCreateCodeSystem(medplum);

  // Check if code already exists
  const existingConcept = codeSystem.concept?.find((c) => c.code === values.code);
  if (existingConcept) {
    throw new Error(`Operator type with code "${values.code}" already exists`);
  }

  // Add new concept
  const newConcept = formValuesToConcept(values);
  const updatedCodeSystem: CodeSystem = {
    ...codeSystem,
    concept: [...(codeSystem.concept || []), newConcept],
  };

  await medplum.updateResource(updatedCodeSystem);
  return values;
}

/**
 * Update an existing operator type
 * @param medplum - MedplumClient instance
 * @param code - Operator type code
 * @param values - OperatorTypeFormValues
 */
export async function updateOperatorType(
  medplum: MedplumClient,
  code: string,
  values: OperatorTypeFormValues
): Promise<OperatorTypeFormValues> {
  const codeSystem = await getOrCreateCodeSystem(medplum);

  const conceptIndex = codeSystem.concept?.findIndex((c) => c.code === code);
  if (conceptIndex === undefined || conceptIndex === -1) {
    throw new Error(`Operator type with code "${code}" not found`);
  }

  // Update concept
  const updatedConcept = formValuesToConcept(values);
  const updatedConcepts = [...(codeSystem.concept || [])];
  updatedConcepts[conceptIndex] = updatedConcept;

  const updatedCodeSystem: CodeSystem = {
    ...codeSystem,
    concept: updatedConcepts,
  };

  await medplum.updateResource(updatedCodeSystem);
  return values;
}

/**
 * Delete an operator type (mark as inactive)
 * @param medplum - MedplumClient instance
 * @param code - Operator type code
 */
export async function deleteOperatorType(medplum: MedplumClient, code: string): Promise<void> {
  const codeSystem = await getOrCreateCodeSystem(medplum);

  const conceptIndex = codeSystem.concept?.findIndex((c) => c.code === code);
  if (conceptIndex === undefined || conceptIndex === -1) {
    throw new Error(`Operator type with code "${code}" not found`);
  }

  // Mark as inactive instead of removing
  const concept = codeSystem.concept![conceptIndex];
  const activeProperty = concept.property?.find((p) => p.code === 'active');
  if (activeProperty) {
    activeProperty.valueBoolean = false;
  } else {
    concept.property = [...(concept.property || []), { code: 'active', valueBoolean: false }];
  }

  const updatedCodeSystem: CodeSystem = {
    ...codeSystem,
  };

  await medplum.updateResource(updatedCodeSystem);
}

/**
 * Hard delete an operator type (permanently remove)
 * @param medplum - MedplumClient instance
 * @param code - Operator type code
 */
export async function hardDeleteOperatorType(medplum: MedplumClient, code: string): Promise<void> {
  const codeSystem = await getOrCreateCodeSystem(medplum);

  const updatedConcepts = codeSystem.concept?.filter((c) => c.code !== code) || [];

  const updatedCodeSystem: CodeSystem = {
    ...codeSystem,
    concept: updatedConcepts,
  };

  await medplum.updateResource(updatedCodeSystem);
}

/**
 * Search operator types
 * @param medplum - MedplumClient instance
 * @param filters - Search filters
 */
export async function searchOperatorTypes(
  medplum: MedplumClient,
  filters?: {
    code?: string;
    displayName?: string;
    type?: string;
    active?: boolean;
  }
): Promise<OperatorTypeFormValues[]> {
  const allTypes = await getOperatorTypes(medplum);

  return allTypes.filter((type) => {
    if (filters?.code && !type.code.toLowerCase().includes(filters.code.toLowerCase())) {
      return false;
    }

    if (filters?.displayName && !type.displayKa.toLowerCase().includes(filters.displayName.toLowerCase())) {
      return false;
    }

    if (filters?.type && type.type !== filters.type) {
      return false;
    }

    if (filters?.active !== undefined && type.active !== filters.active) {
      return false;
    }

    return true;
  });
}
