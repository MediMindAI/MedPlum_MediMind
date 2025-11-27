// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { CodeSystem, CodeSystemConcept } from '@medplum/fhirtypes';
import type { UnitFormValues, UnitSearchFilters } from '../types/settings';

/**
 * Unit Service - CRUD operations for measurement units
 *
 * Units are stored as FHIR CodeSystem concepts with:
 * - URL: http://medimind.ge/CodeSystem/measurement-units
 * - Multilingual display names
 * - Symbol for abbreviation
 * - Category for grouping
 */

const UNIT_CODESYSTEM_URL = 'http://medimind.ge/CodeSystem/measurement-units';

/**
 * Get or create the measurement units CodeSystem
 */
async function getOrCreateUnitCodeSystem(medplum: MedplumClient): Promise<CodeSystem> {
  // Try to find existing CodeSystem
  const existing = await medplum.searchResources('CodeSystem', {
    url: UNIT_CODESYSTEM_URL,
    _count: '1',
  });

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new CodeSystem
  const codeSystem: CodeSystem = {
    resourceType: 'CodeSystem',
    url: UNIT_CODESYSTEM_URL,
    name: 'MeasurementUnits',
    title: 'Measurement Units',
    status: 'active',
    content: 'complete',
    concept: [],
  };

  return await medplum.createResource(codeSystem);
}

/**
 * Get all measurement units
 */
export async function getUnits(medplum: MedplumClient, filters: UnitSearchFilters = {}): Promise<CodeSystemConcept[]> {
  const codeSystem = await getOrCreateUnitCodeSystem(medplum);
  let concepts = codeSystem.concept || [];

  // Filter by code
  if (filters.code) {
    concepts = concepts.filter((c) => c.code?.toLowerCase().includes(filters.code!.toLowerCase()));
  }

  // Filter by display name
  if (filters.displayName) {
    concepts = concepts.filter((c) => {
      const displayKa = c.designation?.find((d) => d.language === 'ka')?.value || c.display || '';
      const displayEn = c.designation?.find((d) => d.language === 'en')?.value || '';
      const displayRu = c.designation?.find((d) => d.language === 'ru')?.value || '';
      const searchTerm = filters.displayName!.toLowerCase();
      return (
        displayKa.toLowerCase().includes(searchTerm) ||
        displayEn.toLowerCase().includes(searchTerm) ||
        displayRu.toLowerCase().includes(searchTerm)
      );
    });
  }

  // Filter by category
  if (filters.category) {
    concepts = concepts.filter((c) => {
      const category = c.property?.find((p) => p.code === 'category')?.valueString;
      return category === filters.category;
    });
  }

  // Filter by active status
  if (filters.active !== undefined) {
    concepts = concepts.filter((c) => {
      const active = c.property?.find((p) => p.code === 'active')?.valueBoolean;
      return active === filters.active;
    });
  }

  return concepts;
}

/**
 * Create a new measurement unit
 */
export async function createUnit(medplum: MedplumClient, values: UnitFormValues): Promise<CodeSystem> {
  const codeSystem = await getOrCreateUnitCodeSystem(medplum);

  // Check if code already exists
  const existing = codeSystem.concept?.find((c) => c.code === values.code);
  if (existing) {
    throw new Error(`Unit with code "${values.code}" already exists`);
  }

  // Build designation array for multilingual names
  const designation: any[] = [];

  if (values.displayKa) {
    designation.push({
      language: 'ka',
      value: values.displayKa,
    });
  }

  // Build property array for symbol, category, active
  const property: any[] = [
    {
      code: 'active',
      valueBoolean: values.active,
    },
  ];

  if (values.symbol) {
    property.push({
      code: 'symbol',
      valueString: values.symbol,
    });
  }

  if (values.category) {
    property.push({
      code: 'category',
      valueString: values.category,
    });
  }

  // Create new concept
  const newConcept: CodeSystemConcept = {
    code: values.code,
    display: values.displayKa, // Primary display is Georgian
    designation: designation.length > 0 ? designation : undefined,
    property: property.length > 0 ? property : undefined,
  };

  // Add to CodeSystem
  const updated: CodeSystem = {
    ...codeSystem,
    concept: [...(codeSystem.concept || []), newConcept],
  };

  return await medplum.updateResource(updated);
}

/**
 * Update an existing measurement unit
 */
export async function updateUnit(medplum: MedplumClient, code: string, values: UnitFormValues): Promise<CodeSystem> {
  const codeSystem = await getOrCreateUnitCodeSystem(medplum);

  // Find concept to update
  const conceptIndex = codeSystem.concept?.findIndex((c) => c.code === code);
  if (conceptIndex === undefined || conceptIndex === -1) {
    throw new Error(`Unit with code "${code}" not found`);
  }

  // Build designation array
  const designation: any[] = [];

  if (values.displayKa) {
    designation.push({
      language: 'ka',
      value: values.displayKa,
    });
  }

  // Build property array
  const property: any[] = [
    {
      code: 'active',
      valueBoolean: values.active,
    },
  ];

  if (values.symbol) {
    property.push({
      code: 'symbol',
      valueString: values.symbol,
    });
  }

  if (values.category) {
    property.push({
      code: 'category',
      valueString: values.category,
    });
  }

  // Update concept
  const updatedConcept: CodeSystemConcept = {
    code: values.code,
    display: values.displayKa,
    designation: designation.length > 0 ? designation : undefined,
    property: property.length > 0 ? property : undefined,
  };

  // Replace concept in array
  const concepts = [...(codeSystem.concept || [])];
  concepts[conceptIndex] = updatedConcept;

  const updated: CodeSystem = {
    ...codeSystem,
    concept: concepts,
  };

  return await medplum.updateResource(updated);
}

/**
 * Delete a measurement unit (soft delete - set active=false)
 */
export async function deleteUnit(medplum: MedplumClient, code: string): Promise<CodeSystem> {
  const codeSystem = await getOrCreateUnitCodeSystem(medplum);

  // Find concept to deactivate
  const conceptIndex = codeSystem.concept?.findIndex((c) => c.code === code);
  if (conceptIndex === undefined || conceptIndex === -1) {
    throw new Error(`Unit with code "${code}" not found`);
  }

  const concept = codeSystem.concept![conceptIndex];

  // Update active property
  const property = concept.property || [];
  const activeIndex = property.findIndex((p) => p.code === 'active');

  if (activeIndex !== -1) {
    property[activeIndex] = { code: 'active', valueBoolean: false };
  } else {
    property.push({ code: 'active', valueBoolean: false });
  }

  // Update concept
  const updatedConcept: CodeSystemConcept = {
    ...concept,
    property,
  };

  // Replace concept in array
  const concepts = [...(codeSystem.concept || [])];
  concepts[conceptIndex] = updatedConcept;

  const updated: CodeSystem = {
    ...codeSystem,
    concept: concepts,
  };

  return await medplum.updateResource(updated);
}

/**
 * Convert CodeSystemConcept to UnitFormValues for editing
 */
export function conceptToFormValues(concept: CodeSystemConcept): UnitFormValues {
  const displayKa = concept.designation?.find((d) => d.language === 'ka')?.value || concept.display || '';
  const symbol = concept.property?.find((p) => p.code === 'symbol')?.valueString;
  const category = concept.property?.find((p) => p.code === 'category')?.valueString as any;
  const active = concept.property?.find((p) => p.code === 'active')?.valueBoolean ?? true;

  return {
    code: concept.code || '',
    displayKa,
    symbol,
    category,
    active,
  };
}
