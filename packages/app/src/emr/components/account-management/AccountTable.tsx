/**
 * AccountTable Component
 *
 * Displays practitioner accounts in a responsive table/card view
 * Desktop: Table with sticky header and action menu
 * Mobile: Card layout for better UX
 */

import React from 'react';
import { Table, Box, ActionIcon, Text, Skeleton, Badge, Group, Tooltip, Button, Menu, Stack, ThemeIcon } from '@mantine/core';
import { IconEdit, IconTrash, IconDots, IconUserMinus, IconUserCheck, IconUsers } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from '../../hooks/useTranslation';
import { AccountStatusBadge } from './AccountStatusBadge';
import { AccountCard } from './AccountCard';
import type { AccountRow } from '../../types/account-management';

interface AccountTableProps {
  accounts: AccountRow[];
  onEdit: (account: AccountRow) => void;
  onDelete: (account: AccountRow) => void;
  onDeactivate?: (account: AccountRow) => void;
  onReactivate?: (account: AccountRow) => void;
  loading?: boolean;
}

/**
 * Render roles with badge list and overflow handling
 * Shows first 2 roles, then "+N more" for additional roles
 */
function RolesCell({ roles }: { roles: string[] }): JSX.Element {
  const { t } = useTranslation();

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
 * - 10 columns: Staff ID, Name, Email, Phone, Roles, Departments, Status, Last Modified, Actions
 * - Multi-role display with badge list (first 2 roles + "+N more")
 * - Horizontal scroll wrapper for mobile
 * - Turquoise gradient header (var(--emr-gradient-submenu))
 * - Clickable rows with pointer cursor
 * - Edit and delete action buttons
 * - React.memo() optimization
 * - Loading skeleton state
 *
 * @param accounts - Array of account rows
 * @param onEdit - Edit button callback
 * @param onDelete - Delete button callback
 * @param loading - Show loading skeleton
 */
export const AccountTable = React.memo(function AccountTable({
  accounts,
  onEdit,
  onDelete,
  onDeactivate,
  onReactivate,
  loading,
}: AccountTableProps): JSX.Element {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (loading) {
    return (
      <Box>
        <Skeleton height={50} mb="sm" />
        <Skeleton height={40} mb="xs" />
        <Skeleton height={40} mb="xs" />
        <Skeleton height={40} mb="xs" />
        <Text ta="center" c="dimmed">
          {t('accountManagement.table.loading')}
        </Text>
      </Box>
    );
  }

  // Empty state with icon and CTA
  if (accounts.length === 0) {
    return (
      <Box ta="center" py={80}>
        <ThemeIcon
          size={80}
          radius={80}
          variant="light"
          color="blue"
          style={{ margin: '0 auto 24px' }}
        >
          <IconUsers size={40} />
        </ThemeIcon>

        <Text size="xl" fw={600} mb="sm" c="dimmed">
          {t('accountManagement.table.noAccounts')}
        </Text>

        <Text size="sm" c="dimmed" mb="xl">
          {t('accountManagement.table.noAccountsDescription')}
        </Text>
      </Box>
    );
  }

  // Mobile card view
  if (isMobile) {
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

  // Desktop table view
  return (
    <Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <Table highlightOnHover style={{ minWidth: '1200px' }}>
        <Table.Thead>
          <Table.Tr
            style={{
              background: 'var(--emr-gradient-submenu)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 600,
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '16px',
              }}
            >
              {t('accountManagement.table.staffId')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 600,
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '16px',
              }}
            >
              {t('accountManagement.table.name')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 600,
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '16px',
              }}
            >
              {t('accountManagement.table.email')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 600,
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '16px',
              }}
            >
              {t('accountManagement.table.phone')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 600,
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '16px',
              }}
            >
              {t('accountManagement.table.role')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 600,
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '16px',
              }}
            >
              {t('accountManagement.table.department')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 600,
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '16px',
              }}
            >
              {t('accountManagement.table.status')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 600,
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '16px',
              }}
            >
              {t('accountManagement.table.lastModified')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 600,
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '16px',
                textAlign: 'right',
              }}
            >
              {t('accountManagement.table.actions')}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {accounts.map((account) => (
            <Table.Tr key={account.id}>
              <Table.Td>{account.staffId || '-'}</Table.Td>
              <Table.Td>{account.name}</Table.Td>
              <Table.Td>{account.email}</Table.Td>
              <Table.Td>{account.phone || '-'}</Table.Td>
              <Table.Td>
                <RolesCell roles={account.roles} />
              </Table.Td>
              <Table.Td>{account.departments?.join(', ') || '-'}</Table.Td>
              <Table.Td>
                <AccountStatusBadge active={account.active} />
              </Table.Td>
              <Table.Td>
                {account.lastModified ? new Date(account.lastModified).toLocaleDateString() : '-'}
              </Table.Td>
              <Table.Td>
                <Group gap="xs" wrap="nowrap" justify="flex-end">
                  {/* Action Menu Dropdown */}
                  <Menu position="bottom-end">
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray" size="lg">
                        <IconDots size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconEdit size={14} />}
                        onClick={() => onEdit(account)}
                      >
                        {t('accountManagement.table.edit')}
                      </Menu.Item>
                      {account.active && onDeactivate && (
                        <Menu.Item
                          leftSection={<IconUserMinus size={14} />}
                          onClick={() => onDeactivate(account)}
                          color="orange"
                        >
                          {t('accountManagement.table.deactivate')}
                        </Menu.Item>
                      )}
                      {!account.active && onReactivate && (
                        <Menu.Item
                          leftSection={<IconUserCheck size={14} />}
                          onClick={() => onReactivate(account)}
                          color="green"
                        >
                          {t('accountManagement.table.reactivate')}
                        </Menu.Item>
                      )}
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        onClick={() => onDelete(account)}
                        color="red"
                      >
                        {t('accountManagement.table.delete')}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
});
