// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Title, Stack, Paper, Group, Button, Modal, Box, Tabs } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useMemo } from 'react';
import { IconPlus, IconChartBar, IconFilter, IconUsers, IconShieldLock } from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import { useMediaQuery } from '@mantine/hooks';
import { SectionHeader } from '../../components/common/SectionHeader';
import { DashboardStats  } from '../../components/account-management/DashboardStats';
import type {DashboardStatsData} from '../../components/account-management/DashboardStats';
import { AccountFilters  } from '../../components/account-management/AccountFilters';
import type {AccountFiltersState} from '../../components/account-management/AccountFilters';
import { AccountTable } from '../../components/account-management/AccountTable';
import { AccountForm } from '../../components/account-management/AccountForm';
import { AccountEditModal } from '../../components/account-management/AccountEditModal';
import { CreateAccountFAB } from '../../components/account-management/CreateAccountFAB';
import { DeactivationConfirmationModal } from '../../components/account-management/deactivation/DeactivationConfirmationModal';
import { useTranslation } from '../../hooks/useTranslation';
import { useAccountList } from '../../hooks/useAccountList';
import { useDeactivation } from '../../hooks/useDeactivation';
import { createPractitionerWithActivationUrl } from '../../services/accountService';
import accountRolesData from '../../translations/account-roles.json';
import type { AccountFormValues, AccountRow } from '../../types/account-management';
import { RoleManagementView } from '../role-management/RoleManagementView';

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
 * @returns Account management view component
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
          (account.staffId?.toLowerCase().includes(query))
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
   * @param values - Account form values
   * @returns Promise that resolves when account is created
   */
  const handleCreate = async (values: AccountFormValues): Promise<void> => {
    setCreating(true);
    try {
      const { activationUrl } = await createPractitionerWithActivationUrl(medplum, values);

      // Show success notification
      notifications.show({
        title: t('accountManagement.create.success'),
        message: t('accountManagement.create.successMessage'),
        color: 'green',
      });

      // If activation URL is available (email not configured), show it
      if (activationUrl) {
        notifications.show({
          title: t('accountManagement.activationUrlTitle'),
          message: t('accountManagement.activationUrlMessage'),
          color: 'yellow',
          autoClose: false, // Don't auto-close - user needs to copy the URL
          styles: {
            root: {
              background: 'linear-gradient(135deg, #f59f00 0%, #fd7e14 100%)',
              color: 'white',
            },
            description: {
              color: 'white',
              fontSize: '14px',
              marginBottom: '8px',
            },
          },
          // Show the URL in a copyable format
          message: (
            <div>
              <div style={{ marginBottom: '8px' }}>{t('accountManagement.activationUrlMessage')}</div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '8px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  wordBreak: 'break-all',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  navigator.clipboard.writeText(activationUrl);
                  notifications.show({
                    message: t('accountManagement.urlCopied'),
                    color: 'green',
                  });
                }}
              >
                {activationUrl}
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.9 }}>
                {t('accountManagement.clickToCopy')}
              </div>
            </div>
          ),
        });
      }

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
   * @param account
   */
  const handleEdit = (account: AccountRow) => {
    setEditingAccount(account);
    setEditModalOpened(true);
  };

  /**
   * Handle delete button click
   * @param account
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
    <Box
      style={{
        background: 'var(--emr-section-header-bg)',
        minHeight: '100vh',
      }}
    >
      {/* Gradient Accent Bar */}
      <Box
        style={{
          height: 4,
          background: 'var(--emr-gradient-primary)',
          width: '100%',
        }}
      />

      <Container size="100%" px={{ base: 20, sm: 32, md: 48, lg: 64 }} py={32} style={{ maxWidth: '1800px' }}>
        <Stack gap={32}>
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

          {/* Tabs for Accounts and Roles */}
          <Tabs defaultValue="accounts" variant="pills">
            <Tabs.List>
              <Tabs.Tab value="accounts" leftSection={<IconUsers size={16} />}>
                Accounts
              </Tabs.Tab>
              <Tabs.Tab value="roles" leftSection={<IconShieldLock size={16} />}>
                Roles
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="accounts" pt="md">
              <Stack gap={32}>

          {/* Dashboard Stats Section */}
          <Box>
            <SectionHeader icon={IconChartBar} title="მეტრიკა" />
            <DashboardStats stats={stats} loading={loading} />
          </Box>

          {/* Filters Section */}
          <Box>
            <SectionHeader icon={IconFilter} title="ძიება და ფილტრები" />
            <AccountFilters
              filters={filters}
              onFiltersChange={setFilters}
              roleOptions={roleOptions}
              resultCount={filteredAccounts.length}
              totalCount={accounts.length}
            />
          </Box>

          {/* Account Table Section */}
          <Box>
            <SectionHeader icon={IconUsers} title="მომხმარებლების სია" />
            <Paper
              p={24}
              withBorder
              style={{
                background: 'var(--emr-text-inverse)',
                borderRadius: 'var(--emr-border-radius-lg)',
                boxShadow: 'var(--emr-shadow-card)',
                borderTop: '4px solid transparent',
                borderImage: 'var(--emr-gradient-primary) 1',
                transition: 'var(--emr-transition-base)',
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
          </Box>
        </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="roles" pt="md">
              <RoleManagementView />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>

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
    </Box>
  );
}
