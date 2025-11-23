// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';
import { Text, Badge, Group, Tooltip, Stack } from '@mantine/core';
import { IconEdit, IconTrash, IconUserMinus, IconUserCheck, IconMailForward, IconLink } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from '../../hooks/useTranslation';
import { AccountStatusBadge } from './AccountStatusBadge';
import { InvitationStatusBadge } from './InvitationStatusBadge';
import { AccountCard } from './AccountCard';
import { EMRTable } from '../shared/EMRTable';
import type { EMRTableColumn, EMRTableActionsConfig } from '../shared/EMRTable';
import type { AccountRowExtended } from '../../types/account-management';

interface AccountTableProps {
  accounts: AccountRowExtended[];
  onEdit: (account: AccountRowExtended) => void;
  onDelete: (account: AccountRowExtended) => void;
  onDeactivate?: (account: AccountRowExtended) => void;
  onReactivate?: (account: AccountRowExtended) => void;
  onResendInvitation?: (account: AccountRowExtended) => void;
  onGenerateLink?: (account: AccountRowExtended) => void;
  loading?: boolean;
  /** Array of selected account IDs for bulk operations */
  selectedIds?: string[];
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Whether filters are currently active (changes empty state message) */
  hasActiveFilters?: boolean;
}

/**
 * Render roles with badge list and overflow handling
 * Shows first 2 roles, then "+N more" for additional roles
 */
function RolesCell({ roles }: { roles: string[] }): JSX.Element {
  if (!roles || roles.length === 0) {
    return <Text c="dimmed">-</Text>;
  }

  const visibleRoles = roles.slice(0, 2);
  const hiddenCount = roles.length - 2;

  return (
    <Group gap="xs" wrap="nowrap">
      {visibleRoles.map((role, index) => (
        <Badge key={index} size="sm" variant="light" color="blue">
          {role}
        </Badge>
      ))}
      {hiddenCount > 0 && (
        <Tooltip label={roles.slice(2).join(', ')} withArrow>
          <Badge size="sm" variant="filled" color="gray" style={{ cursor: 'help' }}>
            +{hiddenCount}
          </Badge>
        </Tooltip>
      )}
    </Group>
  );
}

/**
 * Table component for displaying account list
 *
 * Features:
 * - Uses shared EMRTable component for consistent styling
 * - 10 columns: Staff ID, Name, Email, Phone, Roles, Departments, Status, Last Modified, Actions
 * - Multi-role display with badge list (first 2 roles + "+N more")
 * - Row selection with checkboxes for bulk operations
 * - Combined action pattern (edit as primary, others in dropdown)
 * - Mobile card view for responsive design
 * - Loading skeleton state via EMRTable
 * - Empty state via EMRTable
 */
export const AccountTable = React.memo(function AccountTable({
  accounts,
  onEdit,
  onDelete,
  onDeactivate,
  onReactivate,
  onResendInvitation,
  onGenerateLink,
  loading,
  selectedIds = [],
  onSelectionChange,
  hasActiveFilters = false,
}: AccountTableProps): JSX.Element {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Define columns using EMRTableColumn type
  const columns = useMemo<EMRTableColumn<AccountRowExtended>[]>(
    () => [
      {
        key: 'staffId',
        title: t('accountManagement.table.staffId'),
        width: 120,
        render: (row) => <Text size="sm">{row.staffId || '-'}</Text>,
      },
      {
        key: 'name',
        title: t('accountManagement.table.name'),
        minWidth: 150,
        render: (row) => (
          <Text size="sm" fw={500}>
            {row.name}
          </Text>
        ),
      },
      {
        key: 'email',
        title: t('accountManagement.table.email'),
        minWidth: 200,
        hideOnMobile: true,
        render: (row) => (
          <Text size="sm" c="dimmed">
            {row.email}
          </Text>
        ),
      },
      {
        key: 'phone',
        title: t('accountManagement.table.phone'),
        width: 130,
        hideOnMobile: true,
        hideOnTablet: true,
        render: (row) => <Text size="sm">{row.phone || '-'}</Text>,
      },
      {
        key: 'roles',
        title: t('accountManagement.table.role'),
        minWidth: 180,
        render: (row) => <RolesCell roles={row.roles} />,
      },
      {
        key: 'departments',
        title: t('accountManagement.table.department'),
        minWidth: 150,
        hideOnMobile: true,
        hideOnTablet: true,
        render: (row) => <Text size="sm">{row.departments?.join(', ') || '-'}</Text>,
      },
      {
        key: 'status',
        title: t('accountManagement.table.status'),
        width: 140,
        align: 'center',
        render: (row) => (
          <Stack gap={4}>
            <AccountStatusBadge active={row.active} />
            {row.invitationStatus && <InvitationStatusBadge status={row.invitationStatus} />}
          </Stack>
        ),
      },
      {
        key: 'lastModified',
        title: t('accountManagement.table.lastModified'),
        width: 120,
        hideOnMobile: true,
        render: (row) => (
          <Text size="sm">{row.lastModified ? new Date(row.lastModified).toLocaleDateString() : '-'}</Text>
        ),
      },
    ],
    [t]
  );

  // Define actions using the combined pattern
  const getActions = useMemo(
    () =>
      (row: AccountRowExtended): EMRTableActionsConfig<AccountRowExtended> => {
        const secondaryActions = [];

        // Edit action
        secondaryActions.push({
          icon: IconEdit,
          label: t('accountManagement.table.edit'),
          onClick: () => onEdit(row),
          color: 'blue' as const,
        });

        // Deactivate/Reactivate
        if (row.active && onDeactivate) {
          secondaryActions.push({
            icon: IconUserMinus,
            label: t('accountManagement.table.deactivate'),
            onClick: () => onDeactivate(row),
            color: 'yellow' as const,
          });
        }
        if (!row.active && onReactivate) {
          secondaryActions.push({
            icon: IconUserCheck,
            label: t('accountManagement.table.reactivate'),
            onClick: () => onReactivate(row),
            color: 'green' as const,
          });
        }

        // Invitation actions
        if ((row.invitationStatus === 'pending' || row.invitationStatus === 'expired') && onResendInvitation) {
          secondaryActions.push({
            icon: IconMailForward,
            label: t('accountManagement.invitation.resend'),
            onClick: () => onResendInvitation(row),
            color: 'blue' as const,
          });
        }
        if ((row.invitationStatus === 'pending' || row.invitationStatus === 'expired') && onGenerateLink) {
          secondaryActions.push({
            icon: IconLink,
            label: t('accountManagement.invitation.generateLink'),
            onClick: () => onGenerateLink(row),
            color: 'blue' as const,
          });
        }

        // Delete action
        secondaryActions.push({
          icon: IconTrash,
          label: t('accountManagement.table.delete'),
          onClick: () => onDelete(row),
          color: 'red' as const,
        });

        return {
          secondary: secondaryActions,
        };
      },
    [t, onEdit, onDelete, onDeactivate, onReactivate, onResendInvitation, onGenerateLink]
  );

  // Mobile card view
  if (isMobile && !loading && accounts.length > 0) {
    return (
      <Stack gap="md">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={onEdit}
            onDelete={onDelete}
            onDeactivate={onDeactivate}
            onReactivate={onReactivate}
          />
        ))}
      </Stack>
    );
  }

  // Desktop table view using EMRTable
  return (
    <EMRTable<AccountRowExtended>
      columns={columns}
      data={accounts}
      loading={loading}
      loadingConfig={{ rows: 5, animate: true }}
      emptyState={{
        title: hasActiveFilters
          ? t('accountManagement.empty.noResults')
          : t('accountManagement.empty.title'),
        description: hasActiveFilters
          ? t('accountManagement.empty.noResultsDescription')
          : t('accountManagement.empty.description'),
      }}
      // Selection
      selectable={!!onSelectionChange}
      selectedRows={selectedIds}
      onSelectionChange={(ids) => onSelectionChange?.(ids as string[])}
      allowSelectAll={true}
      // Actions
      actions={getActions}
      // Styling
      stickyHeader={true}
      striped={true}
      minWidth={1100}
      ariaLabel={t('accountManagement.table.ariaLabel')}
    />
  );
});
