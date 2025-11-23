// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Text } from '@mantine/core';
import { IconEdit, IconTrash, IconLock, IconLockOpen, IconCopy, IconShieldOff } from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import type { RoleRow } from '../../types/role-management';
import { RoleStatusBadge } from './RoleStatusBadge';
import { useTranslation } from '../../hooks/useTranslation';
import { EMRTable } from '../shared/EMRTable';
import type { EMRTableColumn, EMRTableActionsConfig, SortDirection } from '../shared/EMRTable';

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
 * Role list table with 7 columns using EMRTable component
 *
 * Columns: Name, Description, # Users, Permissions Count, Status, Created Date, Last Modified
 * Actions: Edit (primary), Clone, Deactivate/Reactivate, Delete (secondary dropdown)
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
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Handle sort changes from EMRTable
  const handleSort = (field: string, direction: SortDirection): void => {
    setSortField(direction ? field : undefined);
    setSortDirection(direction);
  };

  // Sort roles based on selected column
  const sortedRoles = useMemo(() => {
    if (!sortField || !sortDirection) {
      return roles;
    }

    return [...roles].sort((a, b) => {
      const aValue = a[sortField as keyof RoleRow];
      const bValue = b[sortField as keyof RoleRow];

      if (aValue === undefined || aValue === null) {
        return 1;
      }
      if (bValue === undefined || bValue === null) {
        return -1;
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [roles, sortField, sortDirection]);

  // Define columns for EMRTable
  const columns: EMRTableColumn<RoleRow>[] = useMemo(() => [
    {
      key: 'name',
      title: t('roleManagement.roleName'),
      sortable: true,
      minWidth: 150,
      render: (role) => (
        <>
          <Text fw={500}>{role.name}</Text>
          <Text size="xs" c="dimmed">{role.code}</Text>
        </>
      ),
    },
    {
      key: 'description',
      title: t('roleManagement.roleDescription'),
      minWidth: 200,
      hideOnMobile: true,
      render: (role) => (
        <Text size="sm" lineClamp={2}>{role.description || '—'}</Text>
      ),
    },
    {
      key: 'userCount',
      title: t('roleManagement.userCount'),
      sortable: true,
      align: 'center',
      width: 100,
      hideOnMobile: true,
    },
    {
      key: 'permissionCount',
      title: t('roleManagement.permissionCount'),
      sortable: true,
      align: 'center',
      width: 120,
      hideOnMobile: true,
    },
    {
      key: 'status',
      title: t('roleManagement.roleStatus'),
      sortable: true,
      align: 'center',
      width: 100,
      render: (role) => <RoleStatusBadge status={role.status} />,
    },
    {
      key: 'createdDate',
      title: t('roleManagement.createdDate'),
      sortable: true,
      width: 120,
      hideOnTablet: true,
      render: (role) => (
        <Text size="sm">{new Date(role.createdDate).toLocaleDateString()}</Text>
      ),
    },
    {
      key: 'lastModified',
      title: t('roleManagement.lastModified'),
      sortable: true,
      width: 120,
      hideOnTablet: true,
      render: (role) => (
        <Text size="sm">{new Date(role.lastModified).toLocaleDateString()}</Text>
      ),
    },
  ], [t]);

  // Define actions for each row using the combined action pattern
  const getActions = (role: RoleRow): EMRTableActionsConfig<RoleRow> => ({
    primary: {
      icon: IconEdit,
      label: t('common.edit'),
      onClick: () => onEdit?.(role),
      color: 'blue',
    },
    secondary: [
      {
        icon: IconCopy,
        label: t('roleManagement.cloneRole'),
        onClick: () => onClone?.(role),
        color: 'blue',
      },
      role.status === 'active'
        ? {
            icon: IconLock,
            label: t('roleManagement.deactivateRole'),
            onClick: () => onDeactivate?.(role),
            color: 'yellow',
          }
        : {
            icon: IconLockOpen,
            label: t('roleManagement.reactivateRole'),
            onClick: () => onReactivate?.(role),
            color: 'green',
          },
      {
        icon: IconTrash,
        label: t('common.delete'),
        onClick: () => onDelete?.(role),
        color: 'red',
      },
    ],
  });

  return (
    <EMRTable<RoleRow>
      columns={columns}
      data={sortedRoles}
      loading={loading}
      loadingConfig={{ rows: 5, animate: true }}
      emptyState={{
        icon: IconShieldOff,
        title: t('roleManagement.noRolesFound'),
        description: t('roleManagement.createFirstRole'),
      }}
      sortField={sortField}
      sortDirection={sortDirection}
      onSort={handleSort}
      actions={getActions}
      getRowId={(role) => role.id}
      stickyHeader
      striped
      ariaLabel="Roles table"
    />
  );
}
