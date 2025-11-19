// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActivityDefinition, Extension, Reference } from '@medplum/fhirtypes';

/**
 * LIS (Laboratory Information System) integration configuration
 */
export interface LISIntegration {
  enabled: boolean;
  provider?: string; // LIS provider name (e.g., "ლიმბახი", "Limbach")
}

/**
 * Extension URL for LIS integration
 */
const LIS_INTEGRATION_EXTENSION_URL = 'http://medimind.ge/fhir/extension/lis-integration';
const LIS_PROVIDER_EXTENSION_URL = 'http://medimind.ge/fhir/extension/lis-provider';

/**
 * Link a sample (SpecimenDefinition) to a service
 *
 * Adds a reference to the specimenRequirement array in the ActivityDefinition.
 * This indicates that the service requires this specific sample/container.
 *
 * @param service - ActivityDefinition resource
 * @param specimenDefinitionId - SpecimenDefinition resource ID
 * @returns Updated ActivityDefinition with sample linked
 */
export function linkSample(service: ActivityDefinition, specimenDefinitionId: string): ActivityDefinition {
  const specimenReference: Reference = {
    reference: `SpecimenDefinition/${specimenDefinitionId}`,
  };

  // Check if already linked
  const existingRequirements = service.specimenRequirement || [];
  const alreadyLinked = existingRequirements.some(
    (ref) => ref.reference === specimenReference.reference
  );

  if (alreadyLinked) {
    return service; // No change needed
  }

  return {
    ...service,
    specimenRequirement: [...existingRequirements, specimenReference],
  };
}

/**
 * Unlink a sample (SpecimenDefinition) from a service
 *
 * Removes the reference from the specimenRequirement array.
 *
 * @param service - ActivityDefinition resource
 * @param specimenDefinitionId - SpecimenDefinition resource ID
 * @returns Updated ActivityDefinition with sample unlinked
 */
export function unlinkSample(service: ActivityDefinition, specimenDefinitionId: string): ActivityDefinition {
  const specimenReference = `SpecimenDefinition/${specimenDefinitionId}`;

  const updatedRequirements = (service.specimenRequirement || []).filter(
    (ref) => ref.reference !== specimenReference
  );

  return {
    ...service,
    specimenRequirement: updatedRequirements.length > 0 ? updatedRequirements : undefined,
  };
}

/**
 * Get all linked samples for a service
 *
 * @param service - ActivityDefinition resource
 * @returns Array of SpecimenDefinition IDs
 */
export function getLinkedSamples(service: ActivityDefinition): string[] {
  if (!service.specimenRequirement) {
    return [];
  }

  return service.specimenRequirement
    .map((ref) => ref.reference?.split('/')[1])
    .filter((id): id is string => !!id);
}

/**
 * Link a research component (ObservationDefinition) to a service
 *
 * Adds a reference to the observationRequirement array in the ActivityDefinition.
 * This indicates that the service requires this specific lab test/measurement.
 *
 * @param service - ActivityDefinition resource
 * @param observationDefinitionId - ObservationDefinition resource ID
 * @returns Updated ActivityDefinition with component linked
 */
export function linkComponent(service: ActivityDefinition, observationDefinitionId: string): ActivityDefinition {
  const observationReference: Reference = {
    reference: `ObservationDefinition/${observationDefinitionId}`,
  };

  // Check if already linked
  const existingRequirements = service.observationRequirement || [];
  const alreadyLinked = existingRequirements.some(
    (ref) => ref.reference === observationReference.reference
  );

  if (alreadyLinked) {
    return service; // No change needed
  }

  return {
    ...service,
    observationRequirement: [...existingRequirements, observationReference],
  };
}

/**
 * Unlink a research component (ObservationDefinition) from a service
 *
 * Removes the reference from the observationRequirement array.
 *
 * @param service - ActivityDefinition resource
 * @param observationDefinitionId - ObservationDefinition resource ID
 * @returns Updated ActivityDefinition with component unlinked
 */
export function unlinkComponent(service: ActivityDefinition, observationDefinitionId: string): ActivityDefinition {
  const observationReference = `ObservationDefinition/${observationDefinitionId}`;

  const updatedRequirements = (service.observationRequirement || []).filter(
    (ref) => ref.reference !== observationReference
  );

  return {
    ...service,
    observationRequirement: updatedRequirements.length > 0 ? updatedRequirements : undefined,
  };
}

/**
 * Get all linked research components for a service
 *
 * @param service - ActivityDefinition resource
 * @returns Array of ObservationDefinition IDs
 */
export function getLinkedComponents(service: ActivityDefinition): string[] {
  if (!service.observationRequirement) {
    return [];
  }

  return service.observationRequirement
    .map((ref) => ref.reference?.split('/')[1])
    .filter((id): id is string => !!id);
}

/**
 * Update LIS (Laboratory Information System) integration configuration
 *
 * Manages the LIS integration extension on the ActivityDefinition.
 * When enabled=true, the provider name is stored in a separate extension.
 * When enabled=false, both extensions are removed.
 *
 * @param service - ActivityDefinition resource
 * @param enabled - Whether LIS integration is enabled
 * @param provider - LIS provider name (required if enabled=true)
 * @returns Updated ActivityDefinition with LIS integration configured
 */
export function updateLISIntegration(
  service: ActivityDefinition,
  enabled: boolean,
  provider?: string
): ActivityDefinition {
  // Remove existing LIS extensions
  const otherExtensions = (service.extension || []).filter(
    (ext) => ext.url !== LIS_INTEGRATION_EXTENSION_URL && ext.url !== LIS_PROVIDER_EXTENSION_URL
  );

  if (!enabled) {
    // LIS disabled - remove all LIS extensions
    return {
      ...service,
      extension: otherExtensions.length > 0 ? otherExtensions : undefined,
    };
  }

  // LIS enabled - add integration extensions
  const lisExtensions: Extension[] = [
    {
      url: LIS_INTEGRATION_EXTENSION_URL,
      valueBoolean: true,
    },
  ];

  if (provider) {
    lisExtensions.push({
      url: LIS_PROVIDER_EXTENSION_URL,
      valueString: provider,
    });
  }

  return {
    ...service,
    extension: [...otherExtensions, ...lisExtensions],
  };
}

/**
 * Get LIS integration configuration
 *
 * @param service - ActivityDefinition resource
 * @returns LIS integration configuration
 */
export function getLISIntegration(service: ActivityDefinition): LISIntegration {
  const integrationExt = service.extension?.find((ext) => ext.url === LIS_INTEGRATION_EXTENSION_URL);
  const providerExt = service.extension?.find((ext) => ext.url === LIS_PROVIDER_EXTENSION_URL);

  return {
    enabled: integrationExt?.valueBoolean || false,
    provider: providerExt?.valueString,
  };
}

/**
 * Check if a service has LIS integration enabled
 *
 * @param service - ActivityDefinition resource
 * @returns True if LIS integration is enabled
 */
export function isLISEnabled(service: ActivityDefinition): boolean {
  const integration = getLISIntegration(service);
  return integration.enabled;
}

/**
 * Bulk link multiple samples to a service
 *
 * Efficiently links multiple SpecimenDefinition references at once.
 *
 * @param service - ActivityDefinition resource
 * @param specimenDefinitionIds - Array of SpecimenDefinition resource IDs
 * @returns Updated ActivityDefinition with all samples linked
 */
export function linkMultipleSamples(
  service: ActivityDefinition,
  specimenDefinitionIds: string[]
): ActivityDefinition {
  const existingRequirements = service.specimenRequirement || [];
  const existingReferences = new Set(existingRequirements.map((ref) => ref.reference));

  const newReferences: Reference[] = specimenDefinitionIds
    .filter((id) => !existingReferences.has(`SpecimenDefinition/${id}`))
    .map((id) => ({ reference: `SpecimenDefinition/${id}` }));

  if (newReferences.length === 0) {
    return service; // No new samples to add
  }

  return {
    ...service,
    specimenRequirement: [...existingRequirements, ...newReferences],
  };
}

/**
 * Bulk link multiple research components to a service
 *
 * Efficiently links multiple ObservationDefinition references at once.
 *
 * @param service - ActivityDefinition resource
 * @param observationDefinitionIds - Array of ObservationDefinition resource IDs
 * @returns Updated ActivityDefinition with all components linked
 */
export function linkMultipleComponents(
  service: ActivityDefinition,
  observationDefinitionIds: string[]
): ActivityDefinition {
  const existingRequirements = service.observationRequirement || [];
  const existingReferences = new Set(existingRequirements.map((ref) => ref.reference));

  const newReferences: Reference[] = observationDefinitionIds
    .filter((id) => !existingReferences.has(`ObservationDefinition/${id}`))
    .map((id) => ({ reference: `ObservationDefinition/${id}` }));

  if (newReferences.length === 0) {
    return service; // No new components to add
  }

  return {
    ...service,
    observationRequirement: [...existingRequirements, ...newReferences],
  };
}

/**
 * Clear all sample and component links from a service
 *
 * Removes all specimenRequirement and observationRequirement references.
 * Useful for reconfiguring a service from scratch.
 *
 * @param service - ActivityDefinition resource
 * @returns Updated ActivityDefinition with all links cleared
 */
export function clearAllLinks(service: ActivityDefinition): ActivityDefinition {
  return {
    ...service,
    specimenRequirement: undefined,
    observationRequirement: undefined,
  };
}

/**
 * Get medical configuration summary
 *
 * Returns a summary of the service's medical configuration including
 * linked samples, components, and LIS integration status.
 *
 * @param service - ActivityDefinition resource
 * @returns Medical configuration summary
 */
export function getMedicalConfiguration(service: ActivityDefinition): {
  samples: string[];
  components: string[];
  lisIntegration: LISIntegration;
} {
  return {
    samples: getLinkedSamples(service),
    components: getLinkedComponents(service),
    lisIntegration: getLISIntegration(service),
  };
}
