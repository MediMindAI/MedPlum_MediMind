// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Title, Stack, Paper, Group, Button, Modal, Box, Tabs, Select, Text, CloseButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useMemo, useCallback } from 'react';
import { IconPlus, IconChartBar, IconFilter, IconUsers, IconShieldLock, IconHistory, IconKey, IconUserPlus, IconX } from '@tabler/icons-react';
import modalStyles from '../../components/account-management/CreateAccountModal.module.css';
import styles from './AccountManagement.module.css';
import { useMedplum } from '@medplum/react-hooks';
import { useMediaQuery } from '@mantine/hooks';
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
    <Box className={styles.dashboardContainer}>
      <Container size="100%" px={{ base: 16, sm: 24, md: 32, lg: 40 }} py={{ base: 20, md: 28 }} style={{ maxWidth: '1600px' }}>
        <Stack gap="lg">
          {/* Page Header - Premium Design */}
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="md" className={styles.pageHeader}>
            <Stack gap={4}>
              <Title order={1} className={styles.pageTitle}>
                {t('accountManagement.title')}
              </Title>
              <Text className={styles.pageSubtitle}>
                {t('accountManagement.dashboard.subtitle') || 'Manage user accounts, roles, and permissions'}
              </Text>
            </Stack>

            {/* Create Button (Mobile only - FAB shown on desktop) */}
            {isMobile && (
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={() => setCreateModalOpened(true)}
                size="md"
                style={{
                  background: 'var(--emr-gradient-primary)',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  boxShadow: '0 4px 12px rgba(26, 54, 93, 0.2)',
                }}
              >
                {t('accountManagement.create.title')}
              </Button>
            )}
          </Group>

          {/* Tabs for Accounts, Roles, Permissions, and Audit Log - Premium Design */}
          <Tabs
            defaultValue="accounts"
            variant="pills"
            styles={{
              root: {
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '16px',
                padding: '16px 20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(26, 54, 93, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                position: 'relative',
                overflow: 'hidden',
              },
              list: {
                gap: '10px',
                flexWrap: 'wrap',
              },
              tab: {
                fontSize: '13px',
                fontWeight: 600,
                padding: '10px 18px',
                borderRadius: '10px',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&[data-active]': {
                  background: 'var(--emr-gradient-primary)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(26, 54, 93, 0.25)',
                },
                '&:not([data-active]):hover': {
                  background: 'rgba(43, 108, 176, 0.08)',
                  color: 'var(--emr-primary)',
                },
              },
            }}
          >
            <Tabs.List>
              <Tabs.Tab value="accounts" leftSection={<IconUsers size={17} stroke={1.8} />}>
                Accounts
              </Tabs.Tab>
              <Tabs.Tab value="roles" leftSection={<IconShieldLock size={17} stroke={1.8} />}>
                Roles
              </Tabs.Tab>
              <Tabs.Tab value="permissions" leftSection={<IconKey size={17} stroke={1.8} />}>
                {t('accountManagement.permissions.title')}
              </Tabs.Tab>
              <Tabs.Tab value="audit" leftSection={<IconHistory size={17} stroke={1.8} />}>
                Audit Log
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="accounts" pt="lg">
              <Stack gap="xl">
                {/* Dashboard Stats Section - Premium Glassmorphism Cards */}
                <Box className={`${styles.statsSection} ${styles.animateFadeIn} ${styles.animateDelay1}`}>
                  <Group gap="md" align="center" mb="md">
                    <Box className={styles.sectionIcon}>
                      <IconChartBar size={18} stroke={2} />
                    </Box>
                    <Text fw={600} size="sm" c="var(--emr-text-primary)" style={{ letterSpacing: '-0.2px' }}>
                      {t('accountManagement.dashboard.metrics')}
                    </Text>
                  </Group>
                  <DashboardStats stats={stats} loading={loading} />
                </Box>

                {/* Filters Section - Premium Card */}
                <Box className={`${styles.animateFadeIn} ${styles.animateDelay2}`}>
                  <Paper
                    p="lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(26, 54, 93, 0.06)',
                    }}
                  >
                    <Group gap="md" align="center" mb="md">
                      <Box className={styles.sectionIcon}>
                        <IconFilter size={18} stroke={2} />
                      </Box>
                      <Text fw={600} size="sm" c="var(--emr-text-primary)" style={{ letterSpacing: '-0.2px' }}>
                        {t('accountManagement.filters.searchAndFilter')}
                      </Text>
                    </Group>
                    <AccountFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      roleOptions={roleOptions}
                      resultCount={filteredAccounts.length}
                      totalCount={accounts.length}
                    />
                  </Paper>
                </Box>

                {/* Account Table Section - Premium Card */}
                <Box className={`${styles.animateFadeIn} ${styles.animateDelay3}`}>
                  <Paper
                    style={{
                      background: 'rgba(255, 255, 255, 0.98)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(26, 54, 93, 0.06)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Table Header */}
                    <Group
                      justify="space-between"
                      align="center"
                      wrap="wrap"
                      gap="sm"
                      p="lg"
                      style={{
                        background: 'linear-gradient(180deg, #fafbfc 0%, #f5f7fa 100%)',
                        borderBottom: '1px solid var(--emr-gray-200)',
                      }}
                    >
                      <Group gap="md" align="center">
                        <Box className={styles.sectionIcon}>
                          <IconUsers size={18} stroke={2} />
                        </Box>
                        <Text fw={600} size="sm" c="var(--emr-text-primary)" style={{ letterSpacing: '-0.2px' }}>
                          {t('accountManagement.table.userList')}
                        </Text>
                      </Group>
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
                    {/* Table Content */}
                    <Box p={{ base: 'sm', md: 'md' }}>
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
                    </Box>
                  </Paper>
                </Box>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="roles" pt="md">
              <RoleManagementView />
            </Tabs.Panel>

            <Tabs.Panel value="permissions" pt="md">
              <Stack gap={24}>
                {/* Premium Role Selector Card */}
                <Paper
                  p={0}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.6)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(26, 54, 93, 0.08)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Card Header with Gradient */}
                  <Box
                    style={{
                      background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
                      padding: '20px 24px',
                    }}
                  >
                    <Group gap={14} align="center">
                      <Box
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(8px)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconKey size={22} color="white" />
                      </Box>
                      <Box>
                        <Text fw={700} size="lg" c="white" style={{ letterSpacing: '-0.3px' }}>
                          {t('accountManagement.permissions.matrix')}
                        </Text>
                        <Text size="xs" c="rgba(255, 255, 255, 0.8)" mt={2}>
                          {t('common.selectRoleHint')}
                        </Text>
                      </Box>
                    </Group>
                  </Box>

                  {/* Role Selector Body */}
                  <Box p={24}>
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
                      leftSection={<IconShieldLock size={18} style={{ color: 'var(--emr-gray-400)' }} />}
                      styles={{
                        input: {
                          minHeight: '48px',
                          borderRadius: '12px',
                          border: '1.5px solid var(--emr-gray-200)',
                          background: 'white',
                          transition: 'all 0.2s ease',
                          '&:focus': {
                            borderColor: 'var(--emr-secondary)',
                            boxShadow: '0 0 0 3px rgba(43, 108, 176, 0.15)',
                          },
                        },
                        label: {
                          fontWeight: 600,
                          color: 'var(--emr-text-primary)',
                          marginBottom: '8px',
                        },
                      }}
                    />
                  </Box>
                </Paper>

                {/* Permission Matrix */}
                {selectedRoleId && (
                  <Paper
                    p={24}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      borderRadius: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(26, 54, 93, 0.08)',
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
                            styles: {
                              root: {
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                              },
                              title: { color: 'white' },
                              description: { color: 'white' },
                            },
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

                {/* Premium Empty State */}
                {!selectedRoleId && (
                  <Paper
                    p={0}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      borderRadius: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(26, 54, 93, 0.08)',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '64px 32px',
                        textAlign: 'center',
                        background: 'linear-gradient(180deg, rgba(99, 179, 237, 0.03) 0%, transparent 100%)',
                      }}
                    >
                      <Box
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '24px',
                          background: 'linear-gradient(135deg, rgba(43, 108, 176, 0.08) 0%, rgba(99, 179, 237, 0.08) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '24px',
                          border: '2px dashed var(--emr-gray-300)',
                          animation: 'pulse 2s ease-in-out infinite',
                        }}
                      >
                        <IconKey size={44} style={{ color: 'var(--emr-secondary)', opacity: 0.7 }} />
                      </Box>
                      <Text fw={700} size="lg" c="var(--emr-text-primary)" mb={8} style={{ letterSpacing: '-0.3px' }}>
                        {t('accountManagement.permissions.title')}
                      </Text>
                      <Text size="sm" c="var(--emr-gray-500)" maw={360} lh={1.6}>
                        {t('common.noRoleSelected')}
                      </Text>
                    </Box>
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

      {/* Create Account Modal - Premium Ultra-Wide Design */}
      <Modal
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
        size={isMobile ? '100%' : 1140}
        fullScreen={isMobile}
        centered
        padding={0}
        radius={isMobile ? 0 : 24}
        withCloseButton={false}
        transitionProps={{ transition: 'scale-y', duration: 300 }}
        overlayProps={{
          backgroundOpacity: 0.4,
          blur: 8,
        }}
        styles={{
          content: {
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          },
          body: {
            padding: 0,
          },
          inner: {
            padding: isMobile ? 0 : '20px',
          },
        }}
      >
        {/* Custom Premium Header - Ultra Wide */}
        <Box className={modalStyles.modalHeader}>
          <Group gap={18} align="center">
            <Box className={modalStyles.modalTitleIcon}>
              <IconUserPlus size={28} stroke={1.8} color="white" />
            </Box>
            <Box>
              <Text className={modalStyles.modalTitle} component="span" style={{ fontSize: '22px' }}>
                {t('accountManagement.create.title')}
              </Text>
              <Text className={modalStyles.modalSubtitle}>
                {t('accountManagement.create.subtitle') || 'Fill in the details to create a new user account'}
              </Text>
            </Box>
          </Group>
          <CloseButton
            onClick={() => setCreateModalOpened(false)}
            className={modalStyles.modalCloseButton}
            icon={<IconX size={20} />}
            aria-label="Close"
          />
        </Box>

        {/* Form Body */}
        <Box className={modalStyles.modalBody}>
          <AccountForm onSubmit={handleCreate} loading={creating} />
        </Box>
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
