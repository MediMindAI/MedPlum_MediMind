// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Card, Text, Group, Stack, Badge, Button, ActionIcon, Menu } from '@mantine/core';
import { IconMail, IconPhone, IconBriefcase, IconDots, IconEdit, IconUserMinus, IconUserCheck, IconTrash } from '@tabler/icons-react';
import { AccountStatusBadge } from './AccountStatusBadge';
import { useTranslation } from '../../hooks/useTranslation';
import type { AccountRow } from '../../types/account-management';

interface AccountCardProps {
  account: AccountRow;
  onEdit: (account: AccountRow) => void;
  onDelete: (account: AccountRow) => void;
  onDeactivate?: (account: AccountRow) => void;
  onReactivate?: (account: AccountRow) => void;
}

/**
 * Mobile card view for account information
 *
 * Features:
 * - Compact card layout optimized for mobile
 * - Icon indicators for contact information
 * - Status badge in header
 * - Full-width action buttons
 * - Dropdown menu for secondary actions
 * - Touch-friendly 44px minimum targets
 *
 * @param account - Account data to display
 * @param account.account
 * @param onEdit - Edit callback
 * @param account.onEdit
 * @param onDelete - Delete callback
 * @param account.onDelete
 * @param onDeactivate - Deactivate callback (optional)
 * @param account.onDeactivate
 * @param onReactivate - Reactivate callback (optional)
 * @param account.onReactivate
 */
export function AccountCard({
  account,
  onEdit,
  onDelete,
  onDeactivate,
  onReactivate,
}: AccountCardProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <Card
      p="md"
      withBorder
      style={{
        background: '#ffffff',
        borderRadius: '8px',
        boxShadow: 'var(--emr-shadow-card)',
      }}
    >
      {/* Header: Name + Status */}
      <Group justify="space-between" mb="md">
        <Stack gap={4}>
          <Text fw={600} size="lg">
            {account.name}
          </Text>
          {account.staffId && (
            <Text size="xs" c="dimmed">
              {t('accountManagement.table.staffId')}: {account.staffId}
            </Text>
          )}
        </Stack>

        <Group gap="xs">
          <AccountStatusBadge active={account.active} />
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
      </Group>

      {/* Contact Information */}
      <Stack gap="xs" mb="md">
        {account.email && (
          <Group gap="xs" wrap="nowrap">
            <IconMail size={16} color="var(--emr-gray-500)" style={{ flexShrink: 0 }} />
            <Text size="sm" style={{ wordBreak: 'break-all' }}>
              {account.email}
            </Text>
          </Group>
        )}

        {account.phone && (
          <Group gap="xs" wrap="nowrap">
            <IconPhone size={16} color="var(--emr-gray-500)" style={{ flexShrink: 0 }} />
            <Text size="sm">{account.phone}</Text>
          </Group>
        )}

        {account.roles && account.roles.length > 0 && (
          <Group gap="xs" wrap="nowrap">
            <IconBriefcase size={16} color="var(--emr-gray-500)" style={{ flexShrink: 0 }} />
            <Group gap={4} wrap="wrap">
              {account.roles.map((role, index) => (
                <Badge key={index} size="sm" variant="light" color="blue">
                  {role}
                </Badge>
              ))}
            </Group>
          </Group>
        )}
      </Stack>

      {/* Department and Last Modified */}
      {(account.departments || account.lastModified) && (
        <Stack gap={4} mb="md">
          {account.departments && account.departments.length > 0 && (
            <Text size="xs" c="dimmed">
              {t('accountManagement.table.department')}: {account.departments.join(', ')}
            </Text>
          )}
          {account.lastModified && (
            <Text size="xs" c="dimmed">
              {t('accountManagement.table.lastModified')}: {new Date(account.lastModified).toLocaleDateString()}
            </Text>
          )}
        </Stack>
      )}

      {/* Actions */}
      <Group gap="xs" grow>
        <Button
          variant="light"
          size="sm"
          leftSection={<IconEdit size={16} />}
          onClick={() => onEdit(account)}
          style={{ minHeight: '44px' }}
        >
          {t('accountManagement.table.edit')}
        </Button>
        {account.active && onDeactivate ? (
          <Button
            variant="light"
            size="sm"
            color="orange"
            leftSection={<IconUserMinus size={16} />}
            onClick={() => onDeactivate(account)}
            style={{ minHeight: '44px' }}
          >
            {t('accountManagement.table.deactivate')}
          </Button>
        ) : !account.active && onReactivate ? (
          <Button
            variant="light"
            size="sm"
            color="green"
            leftSection={<IconUserCheck size={16} />}
            onClick={() => onReactivate(account)}
            style={{ minHeight: '44px' }}
          >
            {t('accountManagement.table.reactivate')}
          </Button>
        ) : null}
      </Group>
    </Card>
  );
}
