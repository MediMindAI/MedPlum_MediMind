/**
 * AccountManagementView - Main Dashboard
 *
 * Modern account management interface with dashboard stats, filters, and responsive table
 * Features:
 * - Dashboard KPI cards (Total, Active, Pending, Inactive)
 * - Search and filter controls
 * - Responsive table/card view
 * - Floating action button for quick account creation
 * - Modal forms for create/edit operations
 */

import { Container, Title, Stack, Paper, Group, Button, Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useMemo } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import { useMediaQuery } from '@mantine/hooks';
import { DashboardStats, type DashboardStatsData } from '../../components/account-management/DashboardStats';
import { AccountFilters, type AccountFiltersState } from '../../components/account-management/AccountFilters';
import { AccountTable } from '../../components/account-management/AccountTable';
import { AccountForm } from '../../components/account-management/AccountForm';
import { AccountEditModal } from '../../components/account-management/AccountEditModal';
import { CreateAccountFAB } from '../../components/account-management/CreateAccountFAB';
import { DeactivationConfirmationModal } from '../../components/account-management/deactivation/DeactivationConfirmationModal';
import { useTranslation } from '../../hooks/useTranslation';
import { useAccountList } from '../../hooks/useAccountList';
import { useDeactivation } from '../../hooks/useDeactivation';
import { createPractitioner } from '../../services/accountService';
import accountRolesData from '../../translations/account-roles.json';
import type { AccountFormValues, AccountRow } from '../../types/account-management';

/**
 * Main account management dashboard view
 *
 * Features:
 * - Dashboard KPI cards showing key metrics
 * - Search and filter controls
 * - Responsive table/card view
 * - Create new accounts via modal
 * - Edit accounts via modal
 * - Delete accounts (soft delete)
 * - Deactivate/reactivate accounts
 * - Mobile-first responsive layout
 * - Auto-refresh after CRUD operations
 */
export function AccountManagementView(): JSX.Element {
  const medplum = useMedplum();
  const { t, lang } = useTranslation();
  const { accounts, loading, refresh } = useAccountList();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [creating, setCreating] = useState(false);
  const [createModalOpened, setCreateModalOpened] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountRow | null>(null);
  const [editModalOpened, setEditModalOpened] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<AccountFiltersState>({
    searchQuery: '',
    statusFilter: 'all',
    roleFilter: '',
  });

  // Deactivation workflow
  const {
    isDeactivating,
    targetAccount,
    deactivationModalOpened,
    openDeactivationModal,
    closeDeactivationModal,
    handleDeactivate,
    handleReactivate,
  } = useDeactivation(refresh);

  // Calculate dashboard stats
  const stats: DashboardStatsData = useMemo(() => {
    const total = accounts.length;
    const active = accounts.filter((a) => a.active).length;
    const inactive = total - active;
    const pending = 0; // TODO: Implement pending status tracking
    return { total, active, pending, inactive };
  }, [accounts]);

  // Filter accounts based on search and filters
  const filteredAccounts = useMemo(() => {
    let filtered = [...accounts];

    // Search filter (name, email, staff ID)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (account) =>
          account.name.toLowerCase().includes(query) ||
          account.email.toLowerCase().includes(query) ||
          (account.staffId && account.staffId.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (filters.statusFilter !== 'all') {
      filtered = filtered.filter((account) =>
        filters.statusFilter === 'active' ? account.active : !account.active
      );
    }

    // Role filter
    if (filters.roleFilter) {
      filtered = filtered.filter((account) =>
        account.roles.some((role) => role.toLowerCase().includes(filters.roleFilter.toLowerCase()))
      );
    }

    return filtered;
  }, [accounts, filters]);

  // Role options for filter dropdown
  const roleOptions = useMemo(() => {
    return accountRolesData.roles.map((role) => ({
      value: role.code,
      label: role.name[lang as 'ka' | 'en' | 'ru'] || role.name.en,
    }));
  }, [lang]);

  /**
   * Handle new account creation
   */
  const handleCreate = async (values: AccountFormValues) => {
    setCreating(true);
    try {
      await createPractitioner(medplum, values);

      notifications.show({
        title: t('accountManagement.create.success'),
        message: t('accountManagement.create.successMessage'),
        color: 'green',
      });

      // Close modal and refresh list
      setCreateModalOpened(false);
      refresh();
    } catch (error) {
      notifications.show({
        title: t('accountManagement.create.error'),
        message: (error as Error).message || t('accountManagement.create.errorMessage'),
        color: 'red',
      });
    } finally {
      setCreating(false);
    }
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (account: AccountRow) => {
    setEditingAccount(account);
    setEditModalOpened(true);
  };

  /**
   * Handle delete button click
   */
  const handleDelete = async (account: AccountRow) => {
    // TODO: Implement delete confirmation modal
    notifications.show({
      title: t('accountManagement.delete.info'),
      message: t('accountManagement.delete.notImplemented'),
      color: 'blue',
    });
  };

  /**
   * Handle edit modal success
   */
  const handleEditSuccess = () => {
    refresh();
    setEditModalOpened(false);
    setEditingAccount(null);
  };

  return (
    <Container size="xl" px={32} py={24}>
      <Stack gap={24}>
        {/* Page Header */}
        <Group justify="space-between" align="center" wrap="wrap">
          <Title order={1} style={{ fontSize: '32px', fontWeight: 700, color: 'var(--emr-primary)' }}>
            {t('accountManagement.title')}
          </Title>

          {/* Create Button (Mobile only - FAB shown on desktop) */}
          {isMobile && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setCreateModalOpened(true)}
              style={{
                background: 'var(--emr-gradient-primary)',
              }}
            >
              {t('accountManagement.create.title')}
            </Button>
          )}
        </Group>

        {/* Dashboard Stats Cards */}
        <DashboardStats stats={stats} loading={loading} />

        {/* Filters */}
        <AccountFilters
          filters={filters}
          onFiltersChange={setFilters}
          roleOptions={roleOptions}
          resultCount={filteredAccounts.length}
          totalCount={accounts.length}
        />

        {/* Account Table */}
        <Paper
          p={24}
          withBorder
          style={{
            background: '#ffffff',
            borderRadius: '8px',
            boxShadow: 'var(--emr-shadow-card)',
          }}
        >
          <AccountTable
            accounts={filteredAccounts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeactivate={openDeactivationModal}
            onReactivate={handleReactivate}
            loading={loading}
          />
        </Paper>
      </Stack>

      {/* Floating Action Button (Desktop only) */}
      <CreateAccountFAB onClick={() => setCreateModalOpened(true)} />

      {/* Create Account Modal */}
      <Modal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        title={t('accountManagement.create.title')}
        size="lg"
        centered
      >
        <AccountForm onSubmit={handleCreate} loading={creating} />
      </Modal>

      {/* Edit Modal */}
      <AccountEditModal
        account={editingAccount}
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        onSuccess={handleEditSuccess}
      />

      {/* Deactivation Confirmation Modal */}
      <DeactivationConfirmationModal
        account={targetAccount}
        opened={deactivationModalOpened}
        onClose={closeDeactivationModal}
        onConfirm={handleDeactivate}
        loading={isDeactivating}
      />
    </Container>
  );
}
