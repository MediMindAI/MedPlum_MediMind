// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { Practitioner, ProjectMembership } from '@medplum/fhirtypes';
import type {
  AccountFormValues,
  AccountSearchFilters,
  AccountSearchFiltersExtended,
  InviteRequest,
  AccountRowExtended,
  PaginationParams,
  PaginatedResponse,
  BulkOperationResult,
  BulkOperationError,
  BulkOperationProgress,
} from '../types/account-management';
import { getInvitationStatus, findInviteForPractitioner } from './invitationService';
import { getPractitionerName, getPractitionerEmail, getPractitionerPhone, getPractitionerStaffId } from './accountHelpers';
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

// ============================================================================
// EMR User Management Improvements - Pagination and Bulk Operations (Feature 001)
// ============================================================================

/**
 * Convert Practitioner to AccountRowExtended with invitation status
 */
async function practitionerToAccountRow(
  medplum: MedplumClient,
  practitioner: Practitioner,
  includeInvitationStatus: boolean = false
): Promise<AccountRowExtended> {
  const roles = await getUserRoles(medplum, practitioner.id || '');
  const roleNames = roles.map((r) =>
    r.code?.[0]?.coding?.[0]?.display || r.code?.[0]?.text || 'Unknown'
  );

  let invitationStatus;
  if (includeInvitationStatus && practitioner.id) {
    const invite = await findInviteForPractitioner(medplum, practitioner.id);
    invitationStatus = getInvitationStatus(invite, undefined);
  }

  return {
    id: practitioner.id || '',
    staffId: getPractitionerStaffId(practitioner),
    name: getPractitionerName(practitioner),
    email: getPractitionerEmail(practitioner) || '',
    phone: getPractitionerPhone(practitioner),
    roles: roleNames,
    active: practitioner.active !== false,
    lastModified: practitioner.meta?.lastUpdated,
    invitationStatus,
    createdAt: practitioner.meta?.lastUpdated, // Use lastUpdated as proxy for createdAt
  };
}

/**
 * Search accounts with server-side pagination and extended filters
 *
 * Uses FHIR search parameters with _count, _offset, _total for pagination.
 * Returns accounts with invitation status for enhanced display.
 *
 * @param medplum - Medplum client
 * @param filters - Extended search filters including invitation status
 * @param pagination - Pagination parameters (page, pageSize, sort)
 * @returns Paginated response with accounts and total count
 *
 * @example
 * ```typescript
 * const { data, total, totalPages } = await searchAccounts(medplum, {
 *   search: 'john',
 *   active: true,
 *   role: 'physician'
 * }, { page: 1, pageSize: 20, sortField: 'name', sortDirection: 'asc' });
 * ```
 */
export async function searchAccounts(
  medplum: MedplumClient,
  filters: AccountSearchFiltersExtended = {},
  pagination: PaginationParams = { page: 1, pageSize: 20 }
): Promise<PaginatedResponse<AccountRowExtended>> {
  const searchParams: Record<string, string> = {
    _count: pagination.pageSize.toString(),
    _offset: ((pagination.page - 1) * pagination.pageSize).toString(),
    _total: 'accurate',
  };

  // Sort
  if (pagination.sortField) {
    const sortPrefix = pagination.sortDirection === 'desc' ? '-' : '';
    const sortField = pagination.sortField === 'name' ? 'family' : pagination.sortField;
    searchParams._sort = `${sortPrefix}${sortField}`;
  } else {
    searchParams._sort = '-_lastUpdated';
  }

  // Combined name/email search
  if (filters.search) {
    searchParams['name:contains'] = filters.search;
  }

  // Individual field filters
  if (filters.name) {
    searchParams['name:contains'] = filters.name;
  }

  if (filters.email) {
    searchParams.email = filters.email;
  }

  if (filters.staffId) {
    searchParams.identifier = `http://medimind.ge/identifiers/staff-id|${filters.staffId}`;
  }

  // Role filter via PractitionerRole search (future enhancement)
  // For now, filter in memory after fetching

  // Active status
  if (filters.active !== undefined) {
    searchParams.active = filters.active ? 'true' : 'false';
  }

  // Execute search with Bundle to get total
  const bundle = await medplum.search('Practitioner', searchParams);
  const practitioners = (bundle.entry?.map((e) => e.resource).filter(Boolean) as Practitioner[]) || [];

  // Convert to AccountRowExtended with invitation status
  const accounts: AccountRowExtended[] = [];
  for (const practitioner of practitioners) {
    const row = await practitionerToAccountRow(medplum, practitioner, true);
    accounts.push(row);
  }

  // Filter by invitation status if specified (post-fetch filter)
  let filteredAccounts = accounts;
  if (filters.invitationStatus) {
    filteredAccounts = accounts.filter((a) => a.invitationStatus === filters.invitationStatus);
  }

  const total = bundle.total ?? filteredAccounts.length;
  const totalPages = Math.ceil(total / pagination.pageSize);

  return {
    data: filteredAccounts,
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages,
  };
}

/**
 * Bulk deactivate multiple practitioner accounts
 *
 * Processes accounts sequentially to prevent rate limiting.
 * Automatically excludes the current user from deactivation.
 * Reports progress via callback and returns detailed results.
 *
 * @param medplum - Medplum client
 * @param practitionerIds - Array of practitioner IDs to deactivate
 * @param currentUserId - ID of current user (to prevent self-deactivation)
 * @param reason - Optional reason for deactivation
 * @param onProgress - Optional progress callback
 * @returns Bulk operation result with success/failure counts
 *
 * @example
 * ```typescript
 * const result = await bulkDeactivate(
 *   medplum,
 *   ['pract-1', 'pract-2', 'pract-3'],
 *   currentUser.id,
 *   'Annual audit - inactive accounts',
 *   (progress) => console.log(`${progress.percentage}% complete`)
 * );
 * console.log(`${result.successful} deactivated, ${result.failed} failed`);
 * ```
 */
export async function bulkDeactivate(
  medplum: MedplumClient,
  practitionerIds: string[],
  currentUserId: string,
  reason?: string,
  onProgress?: (progress: BulkOperationProgress) => void
): Promise<BulkOperationResult> {
  // Filter out current user
  const idsToProcess = practitionerIds.filter((id) => id !== currentUserId);
  const selfExcluded = practitionerIds.length - idsToProcess.length;

  const errors: BulkOperationError[] = [];
  let successful = 0;

  for (let i = 0; i < idsToProcess.length; i++) {
    const id = idsToProcess[i];

    try {
      await deactivatePractitioner(medplum, id, reason);
      successful++;
    } catch (error) {
      const practitioner = await medplum.readResource('Practitioner', id).catch(() => null);
      errors.push({
        id,
        name: practitioner ? getPractitionerName(practitioner) : id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Report progress
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: idsToProcess.length,
        percentage: Math.round(((i + 1) / idsToProcess.length) * 100),
      });
    }
  }

  // Add self-exclusion note if applicable
  if (selfExcluded > 0) {
    errors.push({
      id: currentUserId,
      name: 'Your account',
      error: 'Cannot deactivate your own account',
      code: 'SELF_EXCLUDED',
    });
  }

  return {
    operationType: 'deactivate',
    total: practitionerIds.length,
    successful,
    failed: errors.length,
    errors,
  };
}

/**
 * Bulk assign role to multiple practitioner accounts
 *
 * Processes accounts sequentially to prevent rate limiting.
 * Reports progress via callback and returns detailed results.
 *
 * @param medplum - Medplum client
 * @param practitionerIds - Array of practitioner IDs
 * @param roleCode - Role code to assign
 * @param onProgress - Optional progress callback
 * @returns Bulk operation result with success/failure counts
 *
 * @example
 * ```typescript
 * const result = await bulkAssignRole(
 *   medplum,
 *   ['pract-1', 'pract-2'],
 *   'nurse',
 *   (progress) => console.log(`${progress.percentage}% complete`)
 * );
 * ```
 */
export async function bulkAssignRole(
  medplum: MedplumClient,
  practitionerIds: string[],
  roleCode: string,
  onProgress?: (progress: BulkOperationProgress) => void
): Promise<BulkOperationResult> {
  const errors: BulkOperationError[] = [];
  let successful = 0;

  for (let i = 0; i < practitionerIds.length; i++) {
    const id = practitionerIds[i];

    try {
      await assignRoleToUser(medplum, id, roleCode);
      successful++;
    } catch (error) {
      const practitioner = await medplum.readResource('Practitioner', id).catch(() => null);
      errors.push({
        id,
        name: practitioner ? getPractitionerName(practitioner) : id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Report progress
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: practitionerIds.length,
        percentage: Math.round(((i + 1) / practitionerIds.length) * 100),
      });
    }
  }

  return {
    operationType: 'assignRole',
    total: practitionerIds.length,
    successful,
    failed: errors.length,
    errors,
  };
}

/**
 * Bulk activate multiple practitioner accounts
 *
 * @param medplum - Medplum client
 * @param practitionerIds - Array of practitioner IDs to activate
 * @param reason - Optional reason for activation
 * @param onProgress - Optional progress callback
 * @returns Bulk operation result
 */
export async function bulkActivate(
  medplum: MedplumClient,
  practitionerIds: string[],
  reason?: string,
  onProgress?: (progress: BulkOperationProgress) => void
): Promise<BulkOperationResult> {
  const errors: BulkOperationError[] = [];
  let successful = 0;

  for (let i = 0; i < practitionerIds.length; i++) {
    const id = practitionerIds[i];

    try {
      await reactivatePractitioner(medplum, id, reason);
      successful++;
    } catch (error) {
      const practitioner = await medplum.readResource('Practitioner', id).catch(() => null);
      errors.push({
        id,
        name: practitioner ? getPractitionerName(practitioner) : id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    if (onProgress) {
      onProgress({
        current: i + 1,
        total: practitionerIds.length,
        percentage: Math.round(((i + 1) / practitionerIds.length) * 100),
      });
    }
  }

  return {
    operationType: 'activate',
    total: practitionerIds.length,
    successful,
    failed: errors.length,
    errors,
  };
}

