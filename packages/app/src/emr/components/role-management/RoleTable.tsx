// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Table, Text, ActionIcon, Group, Box } from '@mantine/core';
import { IconEdit, IconTrash, IconLock, IconLockOpen, IconCopy } from '@tabler/icons-react';
import { useState } from 'react';
import type { RoleRow } from '../../types/role-management';
import { RoleStatusBadge } from './RoleStatusBadge';
import { useTranslation } from '../../hooks/useTranslation';

interface RoleTableProps {
  roles: RoleRow[];
  loading?: boolean;
  onEdit?: (role: RoleRow) => void;
  onDelete?: (role: RoleRow) => void;
  onDeactivate?: (role: RoleRow) => void;
  onReactivate?: (role: RoleRow) => void;
  onClone?: (role: RoleRow) => void;
}

/**
 * Role list table with 8 columns
 *
 * Columns: Name, Description, # Users, Permissions Count, Status, Created Date, Last Modified, Actions
 * @param props - Component props
 * @param props.roles - Array of roles to display
 * @param props.loading - Loading state
 * @param props.onEdit - Edit handler
 * @param props.onDelete - Delete handler
 * @param props.onDeactivate - Deactivate handler
 * @param props.onReactivate - Reactivate handler
 * @param props.onClone - Clone handler
 * @returns Role table component
 */
export function RoleTable({ roles, loading, onEdit, onDelete, onDeactivate, onReactivate, onClone }: RoleTableProps): JSX.Element {
  const { t } = useTranslation();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string): void => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort roles based on selected column
  const sortedRoles = [...roles].sort((a, b) => {
    if (!sortColumn) {return 0;}

    const aValue = a[sortColumn as keyof RoleRow];
    const bValue = b[sortColumn as keyof RoleRow];

    if (aValue === undefined || aValue === null) {return 1;}
    if (bValue === undefined || bValue === null) {return -1;}

    if (aValue < bValue) {return sortDirection === 'asc' ? -1 : 1;}
    if (aValue > bValue) {return sortDirection === 'asc' ? 1 : -1;}
    return 0;
  });

  if (loading) {
    return (
      <Box p="xl" style={{ textAlign: 'center' }}>
        <Text c="dimmed">Loading roles...</Text>
      </Box>
    );
  }

  if (roles.length === 0) {
    return (
      <Box p="xl" style={{ textAlign: 'center' }}>
        <Text c="dimmed">No roles found. Create your first role to get started.</Text>
      </Box>
    );
  }

  return (
    <Table striped highlightOnHover>
      <Table.Thead
        style={{
          background: 'linear-gradient(90deg, #138496, #17a2b8, #20c4dd)',
        }}
      >
        <Table.Tr>
          <Table.Th
            onClick={() => handleSort('name')}
            style={{ color: 'white', cursor: 'pointer', userSelect: 'none' }}
          >
            {t('roleManagement.roleName')} {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Table.Th>
          <Table.Th style={{ color: 'white' }}>{t('roleManagement.roleDescription')}</Table.Th>
          <Table.Th
            onClick={() => handleSort('userCount')}
            style={{ color: 'white', cursor: 'pointer', userSelect: 'none' }}
          >
            {t('roleManagement.userCount')} {sortColumn === 'userCount' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Table.Th>
          <Table.Th
            onClick={() => handleSort('permissionCount')}
            style={{ color: 'white', cursor: 'pointer', userSelect: 'none' }}
          >
            {t('roleManagement.permissionCount')} {sortColumn === 'permissionCount' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Table.Th>
          <Table.Th
            onClick={() => handleSort('status')}
            style={{ color: 'white', cursor: 'pointer', userSelect: 'none' }}
          >
            {t('roleManagement.roleStatus')} {sortColumn === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Table.Th>
          <Table.Th
            onClick={() => handleSort('createdDate')}
            style={{ color: 'white', cursor: 'pointer', userSelect: 'none' }}
          >
            {t('roleManagement.createdDate')} {sortColumn === 'createdDate' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Table.Th>
          <Table.Th
            onClick={() => handleSort('lastModified')}
            style={{ color: 'white', cursor: 'pointer', userSelect: 'none' }}
          >
            {t('roleManagement.lastModified')} {sortColumn === 'lastModified' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Table.Th>
          <Table.Th style={{ color: 'white' }}>{t('roleManagement.actions')}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {sortedRoles.map((role) => (
          <Table.Tr key={role.id}>
            <Table.Td>
              <Text fw={500}>{role.name}</Text>
              <Text size="xs" c="dimmed">
                {role.code}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="sm" lineClamp={2}>
                {role.description || '-'}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text>{role.userCount}</Text>
            </Table.Td>
            <Table.Td>
              <Text>{role.permissionCount}</Text>
            </Table.Td>
            <Table.Td>
              <RoleStatusBadge status={role.status} />
            </Table.Td>
            <Table.Td>
              <Text size="sm">{new Date(role.createdDate).toLocaleDateString()}</Text>
            </Table.Td>
            <Table.Td>
              <Text size="sm">{new Date(role.lastModified).toLocaleDateString()}</Text>
            </Table.Td>
            <Table.Td>
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={() => onEdit?.(role)}
                  aria-label="Edit role"
                >
                  <IconEdit size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="cyan"
                  onClick={() => onClone?.(role)}
                  aria-label="Clone role"
                >
                  <IconCopy size={16} />
                </ActionIcon>
                {role.status === 'active' ? (
                  <ActionIcon
                    variant="subtle"
                    color="orange"
                    onClick={() => onDeactivate?.(role)}
                    aria-label="Deactivate role"
                  >
                    <IconLock size={16} />
                  </ActionIcon>
                ) : (
                  <ActionIcon
                    variant="subtle"
                    color="green"
                    onClick={() => onReactivate?.(role)}
                    aria-label="Reactivate role"
                  >
                    <IconLockOpen size={16} />
                  </ActionIcon>
                )}
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => onDelete?.(role)}
                  aria-label="Delete role"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
