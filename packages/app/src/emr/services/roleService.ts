import { MedplumClient } from '@medplum/core';
import { PractitionerRole, Reference, Period } from '@medplum/fhirtypes';

/**
 * Parameters for creating a PractitionerRole
 */
export interface CreatePractitionerRoleParams {
  practitioner: Reference;
  organization: Reference;
  roleCode: string;
  specialtyCode?: string;
  locations?: Reference[];
  period?: Period;
}

/**
 * Parameters for updating a PractitionerRole
 */
export interface UpdatePractitionerRoleParams {
  organization?: Reference;
  roleCode?: string;
  specialtyCode?: string;
  locations?: Reference[];
  period?: Period;
}

/**
 * Creates a new PractitionerRole resource with specialty and organization
 *
 * @param medplum - Medplum client instance
 * @param params - Role creation parameters
 * @returns Created PractitionerRole resource
 */
export async function createPractitionerRole(
  medplum: MedplumClient,
  params: CreatePractitionerRoleParams
): Promise<PractitionerRole> {
  const { practitioner, organization, roleCode, specialtyCode, locations, period } = params;

  const role: PractitionerRole = {
    resourceType: 'PractitionerRole',
    active: true,
    practitioner,
    organization,
    code: [
      {
        coding: [
          {
            system: 'http://medimind.ge/role-codes',
            code: roleCode,
          },
        ],
      },
    ],
  };

  // Add specialty if provided
  if (specialtyCode) {
    role.specialty = [
      {
        coding: [
          {
            system: 'http://nucc.org/provider-taxonomy',
            code: specialtyCode,
          },
        ],
      },
    ];
  }

  // Add locations if provided
  if (locations && locations.length > 0) {
    role.location = locations;
  }

  // Add period if provided
  if (period) {
    role.period = period;
  }

  return medplum.createResource(role);
}

/**
 * Fetches all active PractitionerRole resources for a practitioner
 *
 * @param medplum - Medplum client instance
 * @param practitionerId - Practitioner resource ID
 * @returns Array of PractitionerRole resources
 */
export async function getPractitionerRoles(
  medplum: MedplumClient,
  practitionerId: string
): Promise<PractitionerRole[]> {
  if (!practitionerId) {
    return [];
  }

  const bundle = await medplum.search('PractitionerRole', {
    practitioner: `Practitioner/${practitionerId}`,
    active: 'true',
    _sort: '-_lastUpdated',
  });

  return (bundle.entry?.map((entry) => entry.resource as PractitionerRole) || []);
}

/**
 * Updates a PractitionerRole resource
 *
 * @param medplum - Medplum client instance
 * @param roleId - PractitionerRole resource ID
 * @param params - Update parameters
 * @returns Updated PractitionerRole resource
 */
export async function updatePractitionerRole(
  medplum: MedplumClient,
  roleId: string,
  params: UpdatePractitionerRoleParams
): Promise<PractitionerRole> {
  const role = await medplum.readResource('PractitionerRole', roleId);

  // Update organization if provided
  if (params.organization) {
    role.organization = params.organization;
  }

  // Update role code if provided
  if (params.roleCode) {
    role.code = [
      {
        coding: [
          {
            system: 'http://medimind.ge/role-codes',
            code: params.roleCode,
          },
        ],
      },
    ];
  }

  // Update specialty if provided
  if (params.specialtyCode) {
    role.specialty = [
      {
        coding: [
          {
            system: 'http://nucc.org/provider-taxonomy',
            code: params.specialtyCode,
          },
        ],
      },
    ];
  }

  // Update locations if provided
  if (params.locations) {
    role.location = params.locations;
  }

  // Update period if provided
  if (params.period) {
    role.period = params.period;
  }

  return medplum.updateResource(role);
}

/**
 * Deletes a PractitionerRole resource
 *
 * @param medplum - Medplum client instance
 * @param roleId - PractitionerRole resource ID
 * @param hardDelete - If true, permanently deletes the role; otherwise soft deletes (sets active=false)
 * @returns Updated PractitionerRole (soft delete) or void (hard delete)
 */
export async function deletePractitionerRole(
  medplum: MedplumClient,
  roleId: string,
  hardDelete: boolean = false
): Promise<PractitionerRole | void> {
  if (hardDelete) {
    // Hard delete: permanently remove the role
    await medplum.deleteResource('PractitionerRole', roleId);
    return;
  }

  // Soft delete: set active = false
  const role = await medplum.readResource('PractitionerRole', roleId);
  role.active = false;
  return medplum.updateResource(role);
}
