// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { CodeSystem, CodeSystemConcept } from '@medplum/fhirtypes';
import type { AdminRouteFormValues, AdminRouteSearchFilters } from '../types/settings';

/**
 * Administration Route Service - CRUD operations for medication administration routes
 *
 * Routes are stored as FHIR CodeSystem concepts with:
 * - URL: http://medimind.ge/CodeSystem/admin-routes
 * - Multilingual display names
 * - Abbreviation (e.g., "p.o.", "i.v.", "s.c.")
 * - Description/notes
 */

const ADMIN_ROUTE_CODESYSTEM_URL = 'http://medimind.ge/CodeSystem/admin-routes';

/**
 * Get or create the administration routes CodeSystem
 */
async function getOrCreateAdminRouteCodeSystem(medplum: MedplumClient): Promise<CodeSystem> {
  // Try to find existing CodeSystem
  const existing = await medplum.searchResources('CodeSystem', {
    url: ADMIN_ROUTE_CODESYSTEM_URL,
    _count: '1',
  });

  if (existing.length > 0) {
    return existing[0];
  }

  // Create new CodeSystem
  const codeSystem: CodeSystem = {
    resourceType: 'CodeSystem',
    url: ADMIN_ROUTE_CODESYSTEM_URL,
    name: 'AdministrationRoutes',
    title: 'Medication Administration Routes',
    status: 'active',
    content: 'complete',
    concept: [],
  };

  return await medplum.createResource(codeSystem);
}

/**
 * Get all administration routes
 */
export async function getAdminRoutes(
  medplum: MedplumClient,
  filters: AdminRouteSearchFilters = {}
): Promise<CodeSystemConcept[]> {
  const codeSystem = await getOrCreateAdminRouteCodeSystem(medplum);
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

  // Filter by abbreviation
  if (filters.abbreviation) {
    concepts = concepts.filter((c) => {
      const abbrev = c.property?.find((p) => p.code === 'abbreviation')?.valueString;
      return abbrev?.toLowerCase().includes(filters.abbreviation!.toLowerCase());
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
 * Create a new administration route
 */
export async function createAdminRoute(medplum: MedplumClient, values: AdminRouteFormValues): Promise<CodeSystem> {
  const codeSystem = await getOrCreateAdminRouteCodeSystem(medplum);

  // Check if code already exists
  const existing = codeSystem.concept?.find((c) => c.code === values.code);
  if (existing) {
    throw new Error(`Administration route with code "${values.code}" already exists`);
  }

  // Build designation array for multilingual names
  const designation: any[] = [];

  if (values.displayKa) {
    designation.push({
      language: 'ka',
      value: values.displayKa,
    });
  }

  // Build property array for abbreviation, description, active
  const property: any[] = [
    {
      code: 'active',
      valueBoolean: values.active,
    },
    {
      code: 'abbreviation',
      valueString: values.abbreviation,
    },
  ];

  if (values.description) {
    property.push({
      code: 'description',
      valueString: values.description,
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
 * Update an existing administration route
 */
export async function updateAdminRoute(
  medplum: MedplumClient,
  code: string,
  values: AdminRouteFormValues
): Promise<CodeSystem> {
  const codeSystem = await getOrCreateAdminRouteCodeSystem(medplum);

  // Find concept to update
  const conceptIndex = codeSystem.concept?.findIndex((c) => c.code === code);
  if (conceptIndex === undefined || conceptIndex === -1) {
    throw new Error(`Administration route with code "${code}" not found`);
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
    {
      code: 'abbreviation',
      valueString: values.abbreviation,
    },
  ];

  if (values.description) {
    property.push({
      code: 'description',
      valueString: values.description,
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
 * Delete an administration route (soft delete - set active=false)
 */
export async function deleteAdminRoute(medplum: MedplumClient, code: string): Promise<CodeSystem> {
  const codeSystem = await getOrCreateAdminRouteCodeSystem(medplum);

  // Find concept to deactivate
  const conceptIndex = codeSystem.concept?.findIndex((c) => c.code === code);
  if (conceptIndex === undefined || conceptIndex === -1) {
    throw new Error(`Administration route with code "${code}" not found`);
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
 * Convert CodeSystemConcept to AdminRouteFormValues for editing
 */
export function conceptToFormValues(concept: CodeSystemConcept): AdminRouteFormValues {
  const displayKa = concept.designation?.find((d) => d.language === 'ka')?.value || concept.display || '';
  const abbreviation = concept.property?.find((p) => p.code === 'abbreviation')?.valueString || '';
  const description = concept.property?.find((p) => p.code === 'description')?.valueString;
  const active = concept.property?.find((p) => p.code === 'active')?.valueBoolean ?? true;

  return {
    code: concept.code || '',
    displayKa,
    abbreviation,
    description,
    active,
  };
}
