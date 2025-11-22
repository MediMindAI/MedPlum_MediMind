// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { Practitioner, ProjectMembership } from '@medplum/fhirtypes';
import type { AccountFormValues, AccountSearchFilters, InviteRequest } from '../types/account-management';
import { formValuesToPractitioner } from './accountHelpers';
import { createAuditEvent } from './auditService';
import { assignRoleToUser, removeRoleFromUser, getUserRoles } from './roleService';

/**
 * Create a new practitioner account using Medplum Invite API
 *
 * This creates:
 * - User resource (login credentials)
 * - Practitioner resource (profile)
 * - ProjectMembership (links user to practitioner)
 *
 * @param medplum - Medplum client
 * @param values - Account form values
 * @param password - Optional custom password (auto-generated if omitted)
 * @returns ProjectMembership resource
 *
 * @throws Error if email is missing or API call fails
 */
export async function createPractitioner(
  medplum: MedplumClient,
  values: AccountFormValues,
  password?: string
): Promise<ProjectMembership> {
  if (!values.email || values.email.trim() === '') {
    throw new Error('Email is required for account creation');
  }

  const project = medplum.getProject();
  if (!project?.id) {
    throw new Error('No active project found');
  }

  const inviteRequest: InviteRequest = {
    resourceType: 'Practitioner',
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    sendEmail: true, // Send welcome email with activation link
  };

  if (password) {
    inviteRequest.password = password;
  }

  // Create membership with access policy if role is specified
  if (values.role) {
    inviteRequest.membership = {
      admin: values.role === 'admin',
      // accessPolicy: { reference: `AccessPolicy/${values.role}-role-template` },
    };
  }

  const membership = await medplum.post(
    `admin/projects/${project.id}/invite`,
    inviteRequest
  ) as ProjectMembership;

  // Assign RBAC roles if provided
  const practitionerId = membership.profile?.reference?.split('/')[1];
  if (practitionerId && values.rbacRoles && values.rbacRoles.length > 0) {
    for (const role of values.rbacRoles) {
      try {
        await assignRoleToUser(medplum, practitionerId, role.roleCode);
      } catch (error) {
        console.error(`Error assigning role ${role.roleCode}:`, error);
      }
    }
  }

  return membership;
}

/**
 * Create a new practitioner account and return activation URL
 *
 * This is a workaround for development environments without email configured.
 * Creates the account normally but also generates a password reset URL that
 * serves as the activation link.
 *
 * @param medplum - Medplum client
 * @param values - Account form values
 * @returns Object containing ProjectMembership and activation URL
 *
 * @throws Error if email is missing or API call fails
 */
export async function createPractitionerWithActivationUrl(
  medplum: MedplumClient,
  values: AccountFormValues
): Promise<{ membership: ProjectMembership; activationUrl?: string }> {
  // Create the practitioner account first
  const membership = await createPractitioner(medplum, values);

  // Try to generate activation URL via password reset endpoint
  try {
    // Request password reset to get activation link
    const response = await medplum.post('auth/resetpassword', {
      email: values.email,
    });

    // The response should be an OperationOutcome, but if email is not configured,
    // we need to construct the URL manually using the User resource
    if (response.resourceType === 'OperationOutcome') {
      // Email failed, try to get User resource and construct URL manually
      const user = await medplum.searchOne('User', {
        email: values.email,
      });

      if (user && user.id) {
        // Generate a setpassword URL (user will need to use "forgot password" flow)
        const baseUrl = window.location.origin;
        return {
          membership,
          activationUrl: `${baseUrl}/setpassword/${user.id}`,
        };
      }
    }

    // If we got here, email might have been sent successfully
    return { membership };
  } catch (error) {
    // If password reset fails, just return the membership
    // The UI can display a message that email configuration is needed
    console.warn('Could not generate activation URL:', error);
    return { membership };
  }
}

/**
 * Search for practitioners with filtering and pagination
 *
 * Uses cursor-based pagination (50 results per page) for optimal performance
 *
 * @param medplum - Medplum client
 * @param filters - Search filters (name, email, active status, etc.)
 * @returns Array of Practitioner resources
 */
export async function searchPractitioners(
  medplum: MedplumClient,
  filters: AccountSearchFilters = {}
): Promise<Practitioner[]> {
  const searchParams: Record<string, string> = {
    _count: filters.count?.toString() || '50',
    _sort: '-_lastUpdated', // Required for cursor-based pagination
  };

  // Name search (partial match)
  if (filters.name) {
    searchParams['name:contains'] = filters.name;
  }

  // Email search (exact match)
  if (filters.email) {
    searchParams.email = filters.email;
  }

  // Staff ID search
  if (filters.staffId) {
    searchParams.identifier = `http://medimind.ge/identifiers/staff-id|${filters.staffId}`;
  }

  // Active status filter
  if (filters.active !== undefined) {
    searchParams.active = filters.active ? 'true' : 'false';
  }

  // Page parameter (for offset-based pagination)
  // Note: _offset is a Medplum/HAPI FHIR server extension, not part of FHIR R4 core spec
  // FHIR R4 recommends cursor-based pagination for better performance in large datasets
  // See: https://www.hl7.org/fhir/R4/search.html#count
  if (filters.page !== undefined && filters.page > 1) {
    searchParams._offset = ((filters.page - 1) * 50).toString();
  }

  const practitioners = await medplum.searchResources('Practitioner', searchParams);

  return practitioners;
}

/**
 * Update an existing practitioner resource
 *
 * @param medplum - Medplum client
 * @param existingPractitioner - Current practitioner resource
 * @param values - Updated form values
 * @returns Updated Practitioner resource
 */
export async function updatePractitioner(
  medplum: MedplumClient,
  existingPractitioner: Practitioner,
  values: AccountFormValues
): Promise<Practitioner> {
  const updatedPractitioner = formValuesToPractitioner(values, existingPractitioner);

  const result = await medplum.updateResource(updatedPractitioner);

  return result;
}

/**
 * Get practitioner by ID
 *
 * @param medplum - Medplum client
 * @param practitionerId - Practitioner resource ID
 * @returns Practitioner resource
 *
 * @throws Error if practitioner not found
 */
export async function getPractitionerById(
  medplum: MedplumClient,
  practitionerId: string
): Promise<Practitioner> {
  const practitioner = await medplum.readResource('Practitioner', practitionerId);

  return practitioner;
}

/**
 * Deactivate practitioner account (T070)
 *
 * Sets Practitioner.active = false and creates audit event
 * Prevents self-deactivation for security
 * Does not delete the resource (preserves audit trail)
 *
 * @param medplum - Medplum client
 * @param practitionerId - ID of practitioner to deactivate
 * @param reason - Optional reason for deactivation
 * @returns Updated Practitioner resource with active=false
 *
 * @throws Error if attempting self-deactivation or practitioner not found
 */
export async function deactivatePractitioner(
  medplum: MedplumClient,
  practitionerId: string,
  reason?: string
): Promise<Practitioner> {
  // Fetch the target practitioner
  const practitioner = await medplum.readResource('Practitioner', practitionerId);

  // Prevent self-deactivation
  const currentUser = medplum.getProfile();
  if (currentUser?.id === practitionerId) {
    throw new Error('Cannot deactivate your own account');
  }

  // Update practitioner to inactive
  const updated = await medplum.updateResource({
    ...practitioner,
    active: false,
  });

  // Create audit event
  const auditDetails: Record<string, string> = {
    previousStatus: practitioner.active ? 'active' : 'inactive',
  };
  if (reason) {
    auditDetails.reason = reason;
  }

  await createAuditEvent(
    medplum,
    'D',
    updated,
    reason ? `Account deactivated: ${reason}` : 'Account deactivated',
    auditDetails
  );

  return updated;
}

/**
 * Reactivate practitioner account (T071)
 *
 * Sets Practitioner.active = true and creates audit event
 *
 * @param medplum - Medplum client
 * @param practitionerId - ID of practitioner to reactivate
 * @param reason - Optional reason for reactivation
 * @returns Updated Practitioner resource with active=true
 *
 * @throws Error if practitioner not found
 */
export async function reactivatePractitioner(
  medplum: MedplumClient,
  practitionerId: string,
  reason?: string
): Promise<Practitioner> {
  // Fetch the target practitioner
  const practitioner = await medplum.readResource('Practitioner', practitionerId);

  // Update practitioner to active
  const updated = await medplum.updateResource({
    ...practitioner,
    active: true,
  });

  // Create audit event
  const auditDetails: Record<string, string> = {
    previousStatus: practitioner.active ? 'active' : 'inactive',
  };
  if (reason) {
    auditDetails.reason = reason;
  }

  await createAuditEvent(
    medplum,
    'U',
    updated,
    reason ? `Account reactivated: ${reason}` : 'Account reactivated',
    auditDetails
  );

  return updated;
}

/**
 * Update practitioner role assignments
 * @param medplum - MedplumClient instance
 * @param practitionerId - Practitioner resource ID
 * @param newRoles - New role assignments
 */
export async function updatePractitionerRoles(
  medplum: MedplumClient,
  practitionerId: string,
  newRoles: { roleId: string; roleName: string; roleCode: string }[]
): Promise<void> {
  // Get existing roles (PractitionerRole resources with role-assignment tag)
  const existingPractitionerRoles = await getUserRoles(medplum, practitionerId);
  const existingRoleCodes = existingPractitionerRoles
    .map((pr) => pr.meta?.tag?.find((t) => t.system === 'http://medimind.ge/role-assignment')?.code)
    .filter((code): code is string => !!code);
  const newRoleCodes = newRoles.map((r) => r.roleCode);

  // Remove roles that are no longer assigned
  for (const practitionerRole of existingPractitionerRoles) {
    const roleCode = practitionerRole.meta?.tag?.find((t) => t.system === 'http://medimind.ge/role-assignment')?.code;
    if (roleCode && !newRoleCodes.includes(roleCode) && practitionerRole.id) {
      try {
        await removeRoleFromUser(medplum, practitionerRole.id);
      } catch (error) {
        console.error(`Error removing role ${roleCode}:`, error);
      }
    }
  }

  // Add new roles
  for (const role of newRoles) {
    if (!existingRoleCodes.includes(role.roleCode)) {
      try {
        await assignRoleToUser(medplum, practitionerId, role.roleCode);
      } catch (error) {
        console.error(`Error assigning role ${role.roleCode}:`, error);
      }
    }
  }
}

