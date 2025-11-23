// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Badge } from '@mantine/core';
import { useTranslation } from '../../hooks/useTranslation';
import type { InvitationStatus } from '../../types/account-management';

interface InvitationStatusBadgeProps {
  status: InvitationStatus;
}

/**
 * Badge component showing invitation status with appropriate color
 *
 * Status colors:
 * - pending: yellow/orange - awaiting user activation
 * - accepted: green - user has activated their account
 * - expired: gray - invitation has expired (7+ days)
 * - bounced: red - email delivery failed
 * - cancelled: gray with strikethrough style - admin cancelled
 *
 * @param status - The invitation status to display
 * @returns Badge component with status text and color
 *
 * @example
 * <InvitationStatusBadge status="pending" />  // Yellow "მოლოდინში"
 * <InvitationStatusBadge status="accepted" /> // Green "აქტივირებული"
 * <InvitationStatusBadge status="expired" />  // Gray "ვადაგასული"
 * <InvitationStatusBadge status="bounced" />  // Red "მიუწვდომელი"
 * <InvitationStatusBadge status="cancelled" />// Gray "გაუქმებული"
 */
export function InvitationStatusBadge({ status }: InvitationStatusBadgeProps): JSX.Element {
  const { t } = useTranslation();

  const getStatusConfig = (): { color: string; text: string } => {
    switch (status) {
      case 'pending':
        return {
          color: 'yellow',
          text: t('accountManagement.invitation.pending'),
        };
      case 'accepted':
        return {
          color: 'green',
          text: t('accountManagement.invitation.accepted'),
        };
      case 'expired':
        return {
          color: 'gray',
          text: t('accountManagement.invitation.expired'),
        };
      case 'bounced':
        return {
          color: 'red',
          text: t('accountManagement.invitation.bounced'),
        };
      case 'cancelled':
        return {
          color: 'gray',
          text: t('accountManagement.invitation.cancelled'),
        };
      default:
        return {
          color: 'gray',
          text: status,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge
      color={config.color}
      variant="filled"
      size="sm"
      style={status === 'cancelled' ? { textDecoration: 'line-through' } : undefined}
    >
      {config.text}
    </Badge>
  );
}
