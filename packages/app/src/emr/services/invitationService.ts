// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { MedplumClient } from '@medplum/core';
import type { Invite, User } from '@medplum/fhirtypes';
import type { InvitationStatus } from '../types/account-management';

/**
 * Default invitation expiry period in milliseconds (7 days)
 */
const INVITATION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Meta tag codes used for invitation status tracking
 */
export const INVITATION_TAG_CODES = {
  EMAIL_BOUNCED: 'email-bounced',
  CANCELLED: 'cancelled',
} as const;

/**
 * Derives the invitation status from an Invite resource and optional User resource.
 *
 * Status determination logic:
 * 1. If invite.user is set (User activated their account) -> 'accepted'
 * 2. If invite has 'email-bounced' tag -> 'bounced'
 * 3. If invite has 'cancelled' tag -> 'cancelled'
 * 4. If 7+ days since invitation created -> 'expired'
 * 5. Otherwise -> 'pending'
 *
 * @param invite - The Invite FHIR resource (may be undefined if not found)
 * @param user - Optional User resource linked to the invite
 * @returns The derived invitation status
 *
 * @example
 * ```typescript
 * const invite = await medplum.readResource('Invite', inviteId);
 * const status = getInvitationStatus(invite, undefined);
 * // Returns: 'pending' | 'accepted' | 'expired' | 'bounced' | 'cancelled'
 * ```
 */
export function getInvitationStatus(
  invite: Invite | undefined,
  user: User | undefined
): InvitationStatus {
  // If no invite exists, treat as pending (edge case)
  if (!invite) {
    return 'pending';
  }

  // Check if user activated their account (invite.user is set)
  if (invite.user || user) {
    return 'accepted';
  }

  // Check for bounced email tag
  if (invite.meta?.tag?.some((t) => t.code === INVITATION_TAG_CODES.EMAIL_BOUNCED)) {
    return 'bounced';
  }

  // Check for cancelled tag
  if (invite.meta?.tag?.some((t) => t.code === INVITATION_TAG_CODES.CANCELLED)) {
    return 'cancelled';
  }

  // Check expiry (7 days from creation)
  const createdAt = new Date(invite.meta?.lastUpdated || invite.meta?.versionId || Date.now());
  const expiryDate = new Date(createdAt.getTime() + INVITATION_EXPIRY_MS);
  if (new Date() > expiryDate) {
    return 'expired';
  }

  return 'pending';
}

/**
 * Resends an invitation by deleting the old invite and creating a new one.
 *
 * This function:
 * 1. Searches for and deletes any existing Invite for the practitioner
 * 2. Creates a new invitation via the Medplum Invite API
 * 3. Returns the new Invite resource
 *
 * @param medplum - Medplum client instance
 * @param practitionerId - ID of the Practitioner to resend invitation for
 * @param email - Email address to send the invitation to
 * @returns The newly created Invite resource
 *
 * @throws Error if project is not found or API call fails
 *
 * @example
 * ```typescript
 * const newInvite = await resendInvitation(medplum, 'practitioner-123', 'user@example.com');
 * console.log('New invitation sent:', newInvite.id);
 * ```
 */
export async function resendInvitation(
  medplum: MedplumClient,
  practitionerId: string,
  email: string
): Promise<Invite> {
  const project = medplum.getProject();
  if (!project?.id) {
    throw new Error('No active project found');
  }

  // Try to search for and delete existing invites for this practitioner
  // Note: Invite search may not be available on all server configurations
  try {
    const existingInvites = await medplum.searchResources('Invite', {
      'membership:Practitioner': practitionerId,
      _count: '100',
    });

    // Delete all existing invites for this practitioner
    for (const invite of existingInvites) {
      if (invite.id) {
        try {
          await medplum.deleteResource('Invite', invite.id);
        } catch (error) {
          // Log but continue - invite may already be deleted
          console.warn(`Failed to delete existing invite ${invite.id}:`, error);
        }
      }
    }
  } catch (error) {
    // Invite search not available - continue with creating new invitation
    console.debug('Invite search not available, skipping cleanup:', error);
  }

  // Get practitioner details for the invite
  const practitioner = await medplum.readResource('Practitioner', practitionerId);
  const firstName = practitioner.name?.[0]?.given?.[0] || '';
  const lastName = practitioner.name?.[0]?.family || '';

  // Create new invitation via Invite API
  const inviteResponse = await medplum.post(`admin/projects/${project.id}/invite`, {
    resourceType: 'Practitioner',
    firstName,
    lastName,
    email,
    sendEmail: true,
  });

  // Try to find the newly created invite
  // Note: Invite search may not be available on all server configurations
  try {
    const newInvites = await medplum.searchResources('Invite', {
      'membership:Practitioner': practitionerId,
      _sort: '-_lastUpdated',
      _count: '1',
    });

    if (newInvites.length > 0) {
      return newInvites[0];
    }
  } catch (error) {
    console.debug('Invite search not available:', error);
  }

  // Return a synthetic invite from the response
  return {
    resourceType: 'Invite',
    project: { reference: `Project/${project.id}` },
    membership: { reference: `ProjectMembership/${(inviteResponse as { id?: string })?.id}` },
  } as Invite;
}

/**
 * Generates an activation link for an invitation.
 *
 * The activation URL format is:
 * {baseUrl}/setpassword/{userId}?secret={secret}
 *
 * The link expires 7 days from the invite creation date.
 *
 * @param medplum - Medplum client instance
 * @param invite - The Invite FHIR resource
 * @returns Object containing the activation URL and expiry date
 *
 * @example
 * ```typescript
 * const invite = await medplum.readResource('Invite', inviteId);
 * const { url, expiresAt } = generateActivationLink(medplum, invite);
 * console.log('Activation link:', url);
 * console.log('Expires at:', expiresAt);
 * ```
 */
export function generateActivationLink(
  medplum: MedplumClient,
  invite: Invite
): { url: string; expiresAt: Date } {
  // Get base URL from medplum client or window
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : medplum.getBaseUrl();

  // Extract user ID from invite.user reference
  const userId = invite.user?.reference?.split('/')[1];

  // Calculate expiry date (7 days from creation)
  const createdAt = new Date(invite.meta?.lastUpdated || invite.meta?.versionId || Date.now());
  const expiresAt = new Date(createdAt.getTime() + INVITATION_EXPIRY_MS);

  // Construct activation URL
  // If user ID is available, use the setpassword endpoint
  // Otherwise, use a fallback URL that prompts login
  let url: string;
  if (userId) {
    // Include secret if available in invite resource
    const secret = invite.secret;
    url = secret ? `${baseUrl}/setpassword/${userId}?secret=${secret}` : `${baseUrl}/setpassword/${userId}`;
  } else {
    // Fallback: redirect to signin page
    url = `${baseUrl}/signin`;
  }

  return { url, expiresAt };
}

/**
 * Cancels an invitation by adding a 'cancelled' tag to the Invite resource.
 *
 * This is a soft cancellation - the Invite resource is preserved for audit purposes.
 * Note: Invite resource operations may not be available on all server configurations.
 *
 * @param medplum - Medplum client instance
 * @param inviteId - ID of the Invite resource to cancel
 * @returns The updated Invite resource with cancelled tag, or undefined if not available
 *
 * @example
 * ```typescript
 * const cancelledInvite = await cancelInvitation(medplum, 'invite-123');
 * if (cancelledInvite) {
 *   console.log('Invitation cancelled:', cancelledInvite.id);
 * }
 * ```
 */
export async function cancelInvitation(medplum: MedplumClient, inviteId: string): Promise<Invite | undefined> {
  try {
    const invite = await medplum.readResource('Invite', inviteId);

    // Add cancelled tag to meta
    const existingTags = invite.meta?.tag || [];
    const updatedInvite: Invite = {
      ...invite,
      meta: {
        ...invite.meta,
        tag: [
          ...existingTags.filter((t) => t.code !== INVITATION_TAG_CODES.CANCELLED),
          {
            system: 'http://medimind.ge/invitation-status',
            code: INVITATION_TAG_CODES.CANCELLED,
            display: 'Cancelled',
          },
        ],
      },
    };

    return medplum.updateResource(updatedInvite);
  } catch (error) {
    // Invite resource operations may not be available
    console.debug('Invite cancellation not available:', error);
    return undefined;
  }
}

/**
 * Finds an Invite resource for a given practitioner.
 *
 * Note: Invite is a Medplum-specific resource that may not be searchable
 * via the standard FHIR API on all Medplum server configurations.
 * This function gracefully handles the case where Invite search fails.
 *
 * @param medplum - Medplum client instance
 * @param practitionerId - ID of the Practitioner
 * @returns The Invite resource if found, undefined otherwise
 *
 * @example
 * ```typescript
 * const invite = await findInviteForPractitioner(medplum, 'practitioner-123');
 * if (invite) {
 *   const status = getInvitationStatus(invite, undefined);
 * }
 * ```
 */
export async function findInviteForPractitioner(
  medplum: MedplumClient,
  practitionerId: string
): Promise<Invite | undefined> {
  try {
    const invites = await medplum.searchResources('Invite', {
      'membership:Practitioner': practitionerId,
      _sort: '-_lastUpdated',
      _count: '1',
    });

    return invites.length > 0 ? invites[0] : undefined;
  } catch (error) {
    // Invite resource search may fail if not supported by the server
    // This is expected in some configurations - treat as no invite found
    console.debug('Invite search not available:', error);
    return undefined;
  }
}

/**
 * Checks if an invitation is still valid (not expired, bounced, or cancelled).
 *
 * @param invite - The Invite FHIR resource
 * @returns True if the invitation is still valid and pending
 *
 * @example
 * ```typescript
 * const invite = await medplum.readResource('Invite', inviteId);
 * if (isInvitationValid(invite)) {
 *   console.log('Invitation can still be used');
 * }
 * ```
 */
export function isInvitationValid(invite: Invite | undefined): boolean {
  const status = getInvitationStatus(invite, undefined);
  return status === 'pending';
}

/**
 * Values for welcome message placeholder substitution
 */
export interface WelcomeMessageValues {
  firstName?: string;
  lastName?: string;
  role?: string;
  adminName?: string;
}

/**
 * Substitutes placeholders in a welcome message template with actual values.
 *
 * Available placeholders:
 * - {firstName} - User's first name
 * - {lastName} - User's last name
 * - {role} - User's assigned role
 * - {adminName} - Name of the admin who created the invitation
 *
 * @param template - The message template with placeholders
 * @param values - Object containing values for substitution
 * @returns The message with placeholders replaced
 *
 * @example
 * ```typescript
 * const message = substituteWelcomePlaceholders(
 *   'Welcome {firstName}! Your role is {role}.',
 *   { firstName: 'John', role: 'Physician' }
 * );
 * // Returns: 'Welcome John! Your role is Physician.'
 * ```
 */
export function substituteWelcomePlaceholders(
  template: string,
  values: WelcomeMessageValues
): string {
  let result = template;

  // Replace placeholders with values, handling undefined gracefully
  // Keep placeholder if value is undefined
  if (values.firstName !== undefined) {
    result = result.replace(/{firstName}/g, values.firstName);
  }
  if (values.lastName !== undefined) {
    result = result.replace(/{lastName}/g, values.lastName);
  }
  if (values.role !== undefined) {
    result = result.replace(/{role}/g, values.role);
  }
  if (values.adminName !== undefined) {
    result = result.replace(/{adminName}/g, values.adminName);
  }

  return result;
}

/**
 * Default welcome message templates for each language
 */
export const DEFAULT_WELCOME_TEMPLATES = {
  en: 'Welcome {firstName}! Your account has been created with the role of {role}. Please activate your account using the link below.',
  ka: 'მოგესალმებით {firstName}! თქვენი ანგარიში შეიქმნა როლით {role}. გთხოვთ გაააქტიუროთ თქვენი ანგარიში ქვემოთ მოცემული ბმულით.',
  ru: 'Добро пожаловать {firstName}! Ваш аккаунт создан с ролью {role}. Пожалуйста, активируйте свой аккаунт, используя ссылку ниже.',
} as const;
