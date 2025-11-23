// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Title, Stack, Paper, Group, Button, Modal, Box, Tabs, Select, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useMemo, useCallback } from 'react';
import { IconPlus, IconChartBar, IconFilter, IconUsers, IconShieldLock, IconHistory, IconKey } from '@tabler/icons-react';
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
import { ActivationLinkModal } from '../../components/account-management/ActivationLinkModal';
import { CreateAccountFAB } from '../../components/account-management/CreateAccountFAB';
import { DeactivationConfirmationModal } from '../../components/account-management/deactivation/DeactivationConfirmationModal';
import { KeyboardShortcutsHelp } from '../../components/account-management/KeyboardShortcutsHelp';
import { BulkActionBar } from '../../components/account-management/BulkActionBar';
import { BulkDeactivationModal } from '../../components/account-management/BulkDeactivationModal';
import { BulkRoleAssignModal } from '../../components/account-management/BulkRoleAssignModal';
import { ExportButton } from '../../components/account-management/ExportButton';
import { useTranslation } from '../../hooks/useTranslation';
import { useAccountList } from '../../hooks/useAccountList';
import { useAccountManagement } from '../../hooks/useAccountManagement';
import { useDeactivation } from '../../hooks/useDeactivation';
import { useBulkOperations } from '../../hooks/useBulkOperations';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { createPractitionerWithActivationUrl } from '../../services/accountService';
import { resendInvitation, findInviteForPractitioner, generateActivationLink } from '../../services/invitationService';
import accountRolesData from '../../translations/account-roles.json';
import type { AccountFormValues, AccountRowExtended, AccountSearchFiltersExtended } from '../../types/account-management';
import { RoleManagementView } from '../role-management/RoleManagementView';
import { AuditLogView } from './AuditLogView';
import { PermissionMatrix } from '../../components/account-management/PermissionMatrix';
import { usePermissionsMatrix } from '../../hooks/usePermissions';
import { useRoles } from '../../hooks/useRoles';

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
  const [editingAccount, setEditingAccount] = useState<AccountRowExtended | null>(null);
  const [editModalOpened, setEditModalOpened] = useState(false);

  // Activation link modal state
  const [activationLinkModalOpened, setActivationLinkModalOpened] = useState(false);
  const [activationLinkData, setActivationLinkData] = useState<{ url: string; expiresAt: string } | null>(null);

  // Keyboard shortcuts help modal state
  const [shortcutsHelpOpened, setShortcutsHelpOpened] = useState(false);

  // Permission matrix state
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const { roles, loading: rolesLoading } = useRoles();
  const {
    permissions: matrixPermissions,
    loading: permissionsLoading,
    hasChanges: permissionsHasChanges,
    updatePermission,
    savePermissions,
    refreshPermissions,
  } = usePermissionsMatrix({ policyId: selectedRoleId || undefined });

  // Filter state
  const [filters, setFilters] = useState<AccountFiltersState>({
    searchQuery: '',
    statusFilter: 'all',
    roleFilter: '',
  });

  // Advanced filters panel state (reserved for future AdvancedFiltersPanel integration)
  const [_advancedFiltersExpanded, _setAdvancedFiltersExpanded] = useState(false);
  const [advancedFilters, _setAdvancedFilters] = useState<AccountSearchFiltersExtended>({});

  // Server-side pagination state using the new hook (reserved for future integration)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    accounts: _paginatedAccounts,
    total: _paginatedTotal,
    totalPages: _totalPages,
    loading: _paginationLoading,
    pagination: _pagination,
    setPage: _setPage,
    setPageSize: _setPageSize,
    presets: _filterPresets,
    savePreset: _saveFilterPreset,
    deletePreset: _deleteFilterPreset,
    loadPreset: _loadFilterPreset,
    refresh: _refreshPaginated,
  } = useAccountManagement({
    initialFilters: advancedFilters,
    initialPageSize: 20,
    debounceDelay: 500,
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

  // Bulk operations
  const {
    selectedIds,
    setSelection,
    clearSelection,
    executeBulkDeactivate,
    executeBulkActivate,
    executeBulkAssignRole,
    progress: bulkProgress,
    loading: bulkLoading,
    result: bulkResult,
  } = useBulkOperations();

  // Bulk modal states
  const [bulkDeactivationModalOpened, setBulkDeactivationModalOpened] = useState(false);
  const [bulkRoleAssignModalOpened, setBulkRoleAssignModalOpened] = useState(false);

  // Get current user ID for self-exclusion
  const currentUserId = medplum.getProfile()?.id;

  // Get selected account names for modals
  const selectedAccountNames = useMemo(() => {
    return selectedIds.map((id) => {
      const account = accounts.find((a) => a.id === id);
      return account?.name || id;
    });
  }, [selectedIds, accounts]);

  // Bulk operation handlers
  const handleBulkDeactivate = useCallback(async (reason?: string) => {
    const result = await executeBulkDeactivate(reason);
    if (result.successful > 0) {
      refresh();
    }
    return result;
  }, [executeBulkDeactivate, refresh]);

  const handleBulkActivate = useCallback(async () => {
    const result = await executeBulkActivate();
    if (result.successful > 0) {
      refresh();
    }
    notifications.show({
      title: 'Bulk Activate',
      message: `${result.successful} accounts activated`,
      color: result.failed > 0 ? 'yellow' : 'green',
    });
    clearSelection();
  }, [executeBulkActivate, refresh, clearSelection]);

  const handleBulkAssignRole = useCallback(async (roleCode: string) => {
    const result = await executeBulkAssignRole(roleCode);
    if (result.successful > 0) {
      refresh();
    }
    return result;
  }, [executeBulkAssignRole, refresh]);

  // Keyboard shortcut handlers
  const handleShortcutSearch = useCallback(() => {
    // Focus the search input (we'll use the filters component)
    const searchInput = document.querySelector('[placeholder*="ძიება"], [placeholder*="Search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  const handleShortcutCreate = useCallback(() => {
    setCreateModalOpened(true);
  }, []);

  const handleShortcutHelp = useCallback(() => {
    setShortcutsHelpOpened(true);
  }, []);

  const handleShortcutEscape = useCallback(() => {
    // Close any open modals
    if (createModalOpened) {
      setCreateModalOpened(false);
    } else if (editModalOpened) {
      setEditModalOpened(false);
    } else if (shortcutsHelpOpened) {
      setShortcutsHelpOpened(false);
    } else if (deactivationModalOpened) {
      closeDeactivationModal();
    } else if (activationLinkModalOpened) {
      setActivationLinkModalOpened(false);
    }
  }, [createModalOpened, editModalOpened, shortcutsHelpOpened, deactivationModalOpened, activationLinkModalOpened, closeDeactivationModal]);

  // Register keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: handleShortcutSearch,
    onCreate: handleShortcutCreate,
    onHelp: handleShortcutHelp,
    onEscape: handleShortcutEscape,
  });

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

      // Show success notification with animation
      notifications.show({
        title: t('accountManagement.create.success'),
        message: t('accountManagement.create.successMessage'),
        color: 'green',
        autoClose: 4000,
        withCloseButton: true,
        styles: {
          root: {
            background: 'linear-gradient(135deg, #2f9e44 0%, #40c057 100%)',
            border: 'none',
          },
          title: { color: 'white' },
          description: { color: 'white' },
          closeButton: { color: 'white' },
        },
      });

      // If activation URL is available (email not configured), show it
      if (activationUrl) {
        notifications.show({
          title: t('accountManagement.activationUrlTitle'),
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
  const handleEdit = (account: AccountRowExtended) => {
    setEditingAccount(account);
    setEditModalOpened(true);
  };

  /**
   * Handle delete button click
   * @param account
   */
  const handleDelete = async (account: AccountRowExtended) => {
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

  /**
   * Handle resend invitation
   * @param account - Account to resend invitation for
   */
  const handleResendInvitation = async (account: AccountRowExtended) => {
    try {
      await resendInvitation(medplum, account.id, account.email);
      notifications.show({
        title: t('accountManagement.create.success'),
        message: t('accountManagement.invitation.resendSuccess'),
        color: 'green',
      });
      refresh();
    } catch (error) {
      notifications.show({
        title: t('accountManagement.create.error'),
        message: t('accountManagement.invitation.resendError'),
        color: 'red',
      });
    }
  };

  /**
   * Handle generate activation link
   * @param account - Account to generate link for
   */
  const handleGenerateLink = async (account: AccountRowExtended) => {
    try {
      const invite = await findInviteForPractitioner(medplum, account.id);
      if (invite) {
        const { url, expiresAt } = generateActivationLink(medplum, invite);
        setActivationLinkData({
          url,
          expiresAt: expiresAt.toISOString(),
        });
        setActivationLinkModalOpened(true);
      } else {
        notifications.show({
          title: t('accountManagement.create.error'),
          message: t('accountManagement.invitation.resendError'),
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: t('accountManagement.create.error'),
        message: (error as Error).message,
        color: 'red',
      });
    }
  };

  return (
    <Box
      style={{
        background: 'var(--emr-gray-50)',
        minHeight: '100vh',
      }}
    >
      <Container size="100%" px={{ base: 16, sm: 24, md: 32, lg: 40 }} py={{ base: 16, md: 24 }} style={{ maxWidth: '1600px' }}>
        <Stack gap={{ base: 16, md: 20 }}>
          {/* Page Header - Compact */}
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Title
              order={1}
              style={{
                fontSize: isMobile ? '22px' : '26px',
                fontWeight: 700,
                color: 'var(--emr-text-primary)',
                letterSpacing: '-0.5px',
              }}
            >
              {t('accountManagement.title')}
            </Title>

            {/* Create Button (Mobile only - FAB shown on desktop) */}
            {isMobile && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setCreateModalOpened(true)}
                size="sm"
                style={{
                  background: 'var(--emr-gradient-primary)',
                }}
              >
                {t('accountManagement.create.title')}
              </Button>
            )}
          </Group>

          {/* Tabs for Accounts, Roles, Permissions, and Audit Log */}
          <Tabs
            defaultValue="accounts"
            variant="pills"
            styles={{
              root: {
                background: 'var(--emr-text-inverse)',
                borderRadius: 'var(--emr-border-radius-lg)',
                padding: '12px 16px',
                boxShadow: 'var(--emr-shadow-sm)',
                border: '1px solid var(--emr-gray-200)',
              },
              list: {
                gap: '8px',
                flexWrap: 'wrap',
              },
              tab: {
                fontSize: '13px',
                fontWeight: 500,
                padding: '8px 14px',
                borderRadius: 'var(--emr-border-radius)',
                transition: 'var(--emr-transition-fast)',
                '&[data-active]': {
                  background: 'var(--emr-gradient-primary)',
                  color: 'var(--emr-text-inverse)',
                },
                '&:not([data-active]):hover': {
                  background: 'var(--emr-gray-100)',
                },
              },
            }}
          >
            <Tabs.List>
              <Tabs.Tab value="accounts" leftSection={<IconUsers size={16} />}>
                Accounts
              </Tabs.Tab>
              <Tabs.Tab value="roles" leftSection={<IconShieldLock size={16} />}>
                Roles
              </Tabs.Tab>
              <Tabs.Tab value="permissions" leftSection={<IconKey size={16} />}>
                {t('accountManagement.permissions.title')}
              </Tabs.Tab>
              <Tabs.Tab value="audit" leftSection={<IconHistory size={16} />}>
                Audit Log
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="accounts" pt="md">
              <Stack gap={{ base: 16, md: 20 }}>
                {/* Dashboard Stats Section - More compact */}
                <Box>
                  <SectionHeader icon={IconChartBar} title={t('accountManagement.dashboard.metrics')} variant="prominent" spacing="sm" />
                  <DashboardStats stats={stats} loading={loading} />
                </Box>

                {/* Filters Section - Streamlined */}
                <Box>
                  <SectionHeader icon={IconFilter} title={t('accountManagement.filters.searchAndFilter')} spacing="sm" />
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
                  <Group justify="space-between" align="center" mb="sm" wrap="wrap" gap="sm">
                    <SectionHeader icon={IconUsers} title={t('accountManagement.table.userList')} spacing="xs" />
                    <ExportButton
                      data={filteredAccounts as AccountRowExtended[]}
                      exportedBy={medplum.getProfile()?.name?.[0]?.text || 'Unknown User'}
                      filters={advancedFilters}
                      onSuccess={() => {
                        notifications.show({
                          title: t('accountManagement.export.success'),
                          message: t('accountManagement.export.success'),
                          color: 'green',
                        });
                      }}
                      onError={(error) => {
                        notifications.show({
                          title: t('accountManagement.export.error'),
                          message: error.message || t('accountManagement.export.error'),
                          color: 'red',
                        });
                      }}
                    />
                  </Group>
                  <Paper
                    p={{ base: 'sm', md: 'md' }}
                    withBorder
                    style={{
                      background: 'var(--emr-text-inverse)',
                      borderRadius: 'var(--emr-border-radius-lg)',
                      boxShadow: 'var(--emr-shadow-sm)',
                      border: '1px solid var(--emr-gray-200)',
                      overflow: 'hidden',
                    }}
                  >
                    <AccountTable
                      accounts={filteredAccounts as AccountRowExtended[]}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onDeactivate={openDeactivationModal}
                      onReactivate={handleReactivate}
                      onResendInvitation={handleResendInvitation}
                      onGenerateLink={handleGenerateLink}
                      loading={loading}
                      hasActiveFilters={filters.searchQuery !== '' || filters.statusFilter !== 'all' || filters.roleFilter !== ''}
                      selectedIds={selectedIds}
                      onSelectionChange={setSelection}
                    />
                  </Paper>
                </Box>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="roles" pt="md">
              <RoleManagementView />
            </Tabs.Panel>

            <Tabs.Panel value="permissions" pt="md">
              <Stack gap={24}>
                {/* Role Selector for Permission Matrix */}
                <Paper
                  p={24}
                  withBorder
                  style={{
                    background: 'var(--emr-text-inverse)',
                    borderRadius: 'var(--emr-border-radius-lg)',
                    boxShadow: 'var(--emr-shadow-card)',
                  }}
                >
                  <Stack gap="md">
                    <Text fw={600} size="lg" c="var(--emr-primary)">
                      {t('accountManagement.permissions.matrix')}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Select a role to view and edit its permissions. Changes are saved when you click the Save button.
                    </Text>
                    <Select
                      label={t('roleManagement.roleName')}
                      placeholder={t('roleManagement.searchRoles')}
                      data={roles.map((role) => ({
                        value: role.id,
                        label: role.name,
                      }))}
                      value={selectedRoleId}
                      onChange={setSelectedRoleId}
                      searchable
                      clearable
                      size="md"
                      disabled={rolesLoading}
                      styles={{
                        input: {
                          minHeight: '44px',
                        },
                      }}
                    />
                  </Stack>
                </Paper>

                {/* Permission Matrix */}
                {selectedRoleId && (
                  <Paper
                    p={24}
                    withBorder
                    style={{
                      background: 'var(--emr-text-inverse)',
                      borderRadius: 'var(--emr-border-radius-lg)',
                      boxShadow: 'var(--emr-shadow-card)',
                      borderTop: '4px solid transparent',
                      borderImage: 'var(--emr-gradient-submenu) 1',
                    }}
                  >
                    <PermissionMatrix
                      permissions={matrixPermissions}
                      loading={permissionsLoading}
                      hasChanges={permissionsHasChanges}
                      onPermissionChange={updatePermission}
                      onSave={async () => {
                        try {
                          await savePermissions();
                          notifications.show({
                            title: t('accountManagement.edit.success'),
                            message: t('roleManagement.roleUpdatedSuccess'),
                            color: 'green',
                          });
                        } catch (error) {
                          notifications.show({
                            title: t('accountManagement.edit.error'),
                            message: (error as Error).message,
                            color: 'red',
                          });
                        }
                      }}
                      onRefresh={refreshPermissions}
                    />
                  </Paper>
                )}

                {/* Empty state when no role selected */}
                {!selectedRoleId && (
                  <Paper
                    p={48}
                    withBorder
                    style={{
                      background: 'var(--emr-text-inverse)',
                      borderRadius: 'var(--emr-border-radius-lg)',
                      textAlign: 'center',
                    }}
                  >
                    <IconKey size={48} style={{ color: 'var(--emr-gray-400)', marginBottom: '16px' }} />
                    <Text size="lg" c="dimmed">
                      Select a role above to view and edit its permissions
                    </Text>
                  </Paper>
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="audit" pt="md">
              <AuditLogView />
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

      {/* Activation Link Modal */}
      {activationLinkData && (
        <ActivationLinkModal
          opened={activationLinkModalOpened}
          onClose={() => {
            setActivationLinkModalOpened(false);
            setActivationLinkData(null);
          }}
          activationUrl={activationLinkData.url}
          expiresAt={activationLinkData.expiresAt}
        />
      )}

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        opened={shortcutsHelpOpened}
        onClose={() => setShortcutsHelpOpened(false)}
      />

      {/* Bulk Action Bar - floating at bottom when accounts are selected */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onDeactivate={() => setBulkDeactivationModalOpened(true)}
        onActivate={handleBulkActivate}
        onAssignRole={() => setBulkRoleAssignModalOpened(true)}
        onClear={clearSelection}
        loading={bulkLoading}
        progress={bulkProgress}
        result={bulkResult}
      />

      {/* Bulk Deactivation Modal */}
      <BulkDeactivationModal
        opened={bulkDeactivationModalOpened}
        onClose={() => setBulkDeactivationModalOpened(false)}
        accountIds={selectedIds}
        accountNames={selectedAccountNames}
        onConfirm={handleBulkDeactivate}
        loading={bulkLoading}
        progress={bulkProgress}
        currentUserId={currentUserId}
      />

      {/* Bulk Role Assignment Modal */}
      <BulkRoleAssignModal
        opened={bulkRoleAssignModalOpened}
        onClose={() => setBulkRoleAssignModalOpened(false)}
        accountIds={selectedIds}
        accountNames={selectedAccountNames}
        onConfirm={handleBulkAssignRole}
        loading={bulkLoading}
        progress={bulkProgress}
      />
    </Box>
  );
}
