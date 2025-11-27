// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useState, useMemo } from 'react';
import { Title, Button, Stack, Box, Paper, Group, Badge, Text, Collapse, ActionIcon } from '@mantine/core';
import { IconPlus, IconShieldLock, IconChartBar, IconFilter, IconChevronUp, IconChevronDown } from '@tabler/icons-react';
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
import { useRoles } from '../../hooks/useRoles';
import { useTranslation } from '../../hooks/useTranslation';
import { reactivateRole } from '../../services/roleService';
import type { RoleRow } from '../../types/role-management';
import styles from './RoleManagement.module.css';

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

  // Collapsible sections - collapsed by default
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

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
    <Stack gap="xl">
      {/* Premium Header with Glassmorphism */}
      <Box className={`${styles.headerSection} ${styles.animateFadeIn}`}>
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Group gap="lg" align="center">
            {/* Icon container */}
            <Box className={styles.headerIcon}>
              <IconShieldLock size={18} stroke={1.8} />
            </Box>

            <Box>
              <Title order={2} className={styles.headerTitle}>
                {t('roleManagement.title')}
              </Title>
              <Text className={styles.headerSubtitle}>
                {lang === 'ka'
                  ? 'მართეთ როლები და წვდომის უფლებები'
                  : lang === 'ru'
                    ? 'Управление ролями и правами доступа'
                    : 'Manage roles and access permissions'}
              </Text>
            </Box>

            {roles.length > 0 && (
              <Box className={styles.roleBadge}>
                {roles.length} {lang === 'ka' ? 'როლი' : lang === 'ru' ? 'ролей' : 'roles'}
              </Box>
            )}
          </Group>

          {!showEmptyState && (
            <Button
              leftSection={<IconPlus size={14} stroke={2} />}
              onClick={() => {
                setTemplateCode(null);
                setCreateModalOpened(true);
              }}
              className={styles.createButton}
            >
              {t('roleManagement.createRole')}
            </Button>
          )}
        </Group>
      </Box>

      {/* Show Empty State OR Dashboard + Table */}
      {showEmptyState ? (
        <Paper
          p="xl"
          className={styles.sectionCard}
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
          {/* Dashboard Stats - Collapsible */}
          <Paper
            p="sm"
            className={`${styles.animateFadeIn} ${styles.animateDelay1}`}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(26, 54, 93, 0.06)',
            }}
          >
            <Group
              gap="md"
              align="center"
              mb={statsExpanded ? 'sm' : 0}
              onClick={() => setStatsExpanded(!statsExpanded)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <Box className={styles.sectionIcon}>
                <IconChartBar size={18} stroke={2} />
              </Box>
              <Text fw={600} size="sm" c="var(--emr-text-primary)" style={{ letterSpacing: '-0.2px' }}>
                {lang === 'ka' ? 'სტატისტიკა' : lang === 'ru' ? 'Статистика' : 'Statistics'}
              </Text>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                style={{ marginLeft: 'auto' }}
              >
                {statsExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              </ActionIcon>
            </Group>
            <Collapse in={statsExpanded}>
              <RoleDashboardStats stats={stats} loading={loading} />
            </Collapse>
          </Paper>

          {/* Filters Section - Collapsible */}
          <Paper
            p="sm"
            className={`${styles.animateFadeIn} ${styles.animateDelay2}`}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(26, 54, 93, 0.06)',
            }}
          >
            <Group
              gap="md"
              align="center"
              mb={filtersExpanded ? 'sm' : 0}
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <Box className={styles.sectionIcon}>
                <IconFilter size={18} stroke={2} />
              </Box>
              <Text fw={600} size="sm" c="var(--emr-text-primary)" style={{ letterSpacing: '-0.2px' }}>
                {lang === 'ka' ? 'ძიება და ფილტრები' : lang === 'ru' ? 'Поиск и фильтры' : 'Search & Filters'}
              </Text>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                style={{ marginLeft: 'auto' }}
              >
                {filtersExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              </ActionIcon>
            </Group>
            <Collapse in={filtersExpanded}>
              <RoleFilters onSearchChange={setSearchQuery} onStatusChange={setStatusFilter} />
            </Collapse>
          </Paper>

          {/* Roles Table - Premium Card */}
          <Paper
            className={`${styles.animateFadeIn} ${styles.animateDelay3}`}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(26, 54, 93, 0.06)',
              overflow: 'hidden',
            }}
          >
            <Group
              gap="md"
              align="center"
              p="sm"
              style={{
                background: 'linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%)',
                borderBottom: '1px solid var(--emr-gray-200)',
              }}
            >
              <Box className={styles.sectionIcon}>
                <IconShieldLock size={18} stroke={2} />
              </Box>
              <Text fw={600} size="sm" c="var(--emr-text-primary)" style={{ letterSpacing: '-0.2px' }}>
                {lang === 'ka' ? 'როლების სია' : lang === 'ru' ? 'Список ролей' : 'Roles List'}
              </Text>
            </Group>
            <Box p="sm">
              <RoleTable
                roles={roles}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDeactivate={handleDeactivate}
                onReactivate={handleReactivate}
                onClone={handleClone}
              />
            </Box>
          </Paper>
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
