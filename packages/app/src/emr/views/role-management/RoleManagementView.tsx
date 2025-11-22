// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useState } from 'react';
import { Container, Title, Button, Stack, Box } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useMedplum } from '@medplum/react-hooks';
import { RoleTable } from '../../components/role-management/RoleTable';
import { RoleCreateModal } from '../../components/role-management/RoleCreateModal';
import { RoleEditModal } from '../../components/role-management/RoleEditModal';
import { RoleDeactivationModal } from '../../components/role-management/RoleDeactivationModal';
import { RoleDeleteModal } from '../../components/role-management/RoleDeleteModal';
import { RoleCloneModal } from '../../components/role-management/RoleCloneModal';
import { RoleFilters } from '../../components/role-management/RoleFilters';
import { useRoles } from '../../hooks/useRoles';
import { useTranslation } from '../../hooks/useTranslation';
import { reactivateRole } from '../../services/roleService';
import type { RoleRow } from '../../types/role-management';

/**
 * Main role management page
 *
 * US1: Create role + table
 * US4: View and search roles
 * US5: Edit roles
 * US6: Deactivate/reactivate roles
 * @returns Role management view component
 */
export function RoleManagementView(): JSX.Element {
  const medplum = useMedplum();
  const { t } = useTranslation();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('all');

  // Fetch roles with filters
  const { roles, loading, refresh } = useRoles({
    name: searchQuery,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  // Modal state
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRow | null>(null);
  const [deactivationModalOpened, setDeactivationModalOpened] = useState(false);
  const [deactivatingRole, setDeactivatingRole] = useState<RoleRow | null>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [deletingRole, setDeletingRole] = useState<RoleRow | null>(null);
  const [cloneModalOpened, setCloneModalOpened] = useState(false);
  const [cloningRole, setCloningRole] = useState<RoleRow | null>(null);

  const handleEdit = (role: RoleRow): void => {
    setEditingRole(role);
    setEditModalOpened(true);
  };

  const handleDeactivate = (role: RoleRow): void => {
    setDeactivatingRole(role);
    setDeactivationModalOpened(true);
  };

  const handleReactivate = async (role: RoleRow): Promise<void> => {
    try {
      await reactivateRole(medplum, role.id);
      notifications.show({
        title: t('roleManagement.roleReactivatedSuccess'),
        message: `Role "${role.name}" has been reactivated`,
        color: 'green',
      });
      refresh().catch(console.error);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to reactivate role',
        color: 'red',
      });
    }
  };

  const handleDelete = (role: RoleRow): void => {
    setDeletingRole(role);
    setDeleteModalOpened(true);
  };

  const handleClone = (role: RoleRow): void => {
    setCloningRole(role);
    setCloneModalOpened(true);
  };

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        {/* Header */}
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title order={2}>{t('roleManagement.title')}</Title>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCreateModalOpened(true)}
            style={{
              background: 'linear-gradient(135deg, #1a365d, #2b6cb0, #3182ce)',
            }}
          >
            {t('roleManagement.createRole')}
          </Button>
        </Box>

        {/* Filters */}
        <RoleFilters onSearchChange={setSearchQuery} onStatusChange={setStatusFilter} />

        {/* Roles Table */}
        <RoleTable
          roles={roles}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeactivate={handleDeactivate}
          onReactivate={handleReactivate}
          onClone={handleClone}
        />
      </Stack>

      {/* Create Role Modal */}
      <RoleCreateModal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        onSuccess={refresh}
      />

      {/* Edit Role Modal */}
      <RoleEditModal
        opened={editModalOpened}
        onClose={() => {
          setEditModalOpened(false);
          setEditingRole(null);
        }}
        onSuccess={refresh}
        role={editingRole}
      />

      {/* Deactivation Modal */}
      <RoleDeactivationModal
        opened={deactivationModalOpened}
        onClose={() => {
          setDeactivationModalOpened(false);
          setDeactivatingRole(null);
        }}
        onSuccess={refresh}
        role={deactivatingRole}
      />

      {/* Delete Modal */}
      <RoleDeleteModal
        opened={deleteModalOpened}
        onClose={() => {
          setDeleteModalOpened(false);
          setDeletingRole(null);
        }}
        onSuccess={refresh}
        role={deletingRole}
      />

      {/* Clone Modal */}
      <RoleCloneModal
        opened={cloneModalOpened}
        onClose={() => {
          setCloneModalOpened(false);
          setCloningRole(null);
        }}
        onSuccess={refresh}
        sourceRole={cloningRole}
      />
    </Container>
  );
}
