// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useState, useMemo } from 'react';
import { Title, Button, Stack, Box, Paper, Group, Badge } from '@mantine/core';
import { IconPlus, IconShieldLock, IconChartBar, IconFilter } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useMedplum } from '@medplum/react-hooks';
import { RoleTable } from '../../components/role-management/RoleTable';
import { RoleCreateModal } from '../../components/role-management/RoleCreateModal';
import { RoleEditModal } from '../../components/role-management/RoleEditModal';
import { RoleDeactivationModal } from '../../components/role-management/RoleDeactivationModal';
import { RoleDeleteModal } from '../../components/role-management/RoleDeleteModal';
import { RoleCloneModal } from '../../components/role-management/RoleCloneModal';
import { RoleFilters } from '../../components/role-management/RoleFilters';
import { RoleEmptyState } from '../../components/role-management/RoleEmptyState';
import { RoleDashboardStats } from '../../components/role-management/RoleDashboardStats';
import { SectionHeader } from '../../components/common/SectionHeader';
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
  const { t, lang } = useTranslation();

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
  // Template code for pre-filling role form (currently unused but reserved for future)
  const [, setTemplateCode] = useState<string | null>(null);

  // Calculate stats
  const stats = useMemo(() => {
    const total = roles.length;
    const active = roles.filter((r) => r.status === 'active').length;
    const inactive = total - active;
    const totalUsers = roles.reduce((sum, r) => sum + (r.userCount || 0), 0);
    return { total, active, inactive, totalUsers };
  }, [roles]);

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

  const handleUseTemplate = (code: string): void => {
    setTemplateCode(code);
    setCreateModalOpened(true);
  };

  // Check if we should show empty state
  const showEmptyState = !loading && roles.length === 0 && !searchQuery && statusFilter === 'all';

  return (
    <Stack gap="lg">
      {/* Header with Title and Create Button */}
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="md" align="center">
          <Title
            order={2}
            style={{
              color: 'var(--emr-text-primary)',
              fontWeight: 700,
            }}
          >
            {t('roleManagement.title')}
          </Title>
          {roles.length > 0 && (
            <Badge
              size="lg"
              variant="light"
              color="blue"
              style={{
                background: 'var(--emr-light-accent)',
                color: 'var(--emr-secondary)',
              }}
            >
              {roles.length} {lang === 'ka' ? 'როლი' : lang === 'ru' ? 'ролей' : 'roles'}
            </Badge>
          )}
        </Group>
        {!showEmptyState && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setTemplateCode(null);
              setCreateModalOpened(true);
            }}
            style={{
              background: 'var(--emr-gradient-primary)',
            }}
          >
            {t('roleManagement.createRole')}
          </Button>
        )}
      </Group>

      {/* Show Empty State OR Dashboard + Table */}
      {showEmptyState ? (
        <Paper
          p="xl"
          withBorder
          style={{
            background: 'var(--emr-text-inverse)',
            borderRadius: 'var(--emr-border-radius-lg)',
            borderColor: 'var(--emr-gray-200)',
          }}
        >
          <RoleEmptyState
            onCreateRole={() => {
              setTemplateCode(null);
              setCreateModalOpened(true);
            }}
            onUseTemplate={handleUseTemplate}
          />
        </Paper>
      ) : (
        <>
          {/* Dashboard Stats */}
          <Box>
            <SectionHeader
              icon={IconChartBar}
              title={lang === 'ka' ? 'სტატისტიკა' : lang === 'ru' ? 'Статистика' : 'Statistics'}
              variant="prominent"
              spacing="sm"
            />
            <RoleDashboardStats stats={stats} loading={loading} />
          </Box>

          {/* Filters Section */}
          <Box>
            <SectionHeader
              icon={IconFilter}
              title={lang === 'ka' ? 'ძიება და ფილტრები' : lang === 'ru' ? 'Поиск и фильтры' : 'Search & Filters'}
              spacing="sm"
            />
            <Paper
              p="md"
              withBorder
              style={{
                background: 'var(--emr-text-inverse)',
                borderRadius: 'var(--emr-border-radius-lg)',
                borderColor: 'var(--emr-gray-200)',
              }}
            >
              <RoleFilters onSearchChange={setSearchQuery} onStatusChange={setStatusFilter} />
            </Paper>
          </Box>

          {/* Roles Table */}
          <Box>
            <SectionHeader
              icon={IconShieldLock}
              title={lang === 'ka' ? 'როლების სია' : lang === 'ru' ? 'Список ролей' : 'Roles List'}
              spacing="sm"
            />
            <Paper
              p="md"
              withBorder
              style={{
                background: 'var(--emr-text-inverse)',
                borderRadius: 'var(--emr-border-radius-lg)',
                borderColor: 'var(--emr-gray-200)',
                overflow: 'hidden',
              }}
            >
              <RoleTable
                roles={roles}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDeactivate={handleDeactivate}
                onReactivate={handleReactivate}
                onClone={handleClone}
              />
            </Paper>
          </Box>
        </>
      )}

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
    </Stack>
  );
}
