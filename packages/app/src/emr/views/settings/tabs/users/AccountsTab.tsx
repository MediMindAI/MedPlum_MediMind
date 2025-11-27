// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Paper, Group, Modal, Box, Text, CloseButton, Collapse, ActionIcon, Title, Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useMemo, useCallback } from 'react';
import { IconChartBar, IconFilter, IconUsers, IconUserPlus, IconX, IconChevronDown, IconChevronUp, IconUsersGroup, IconPlus } from '@tabler/icons-react';
import modalStyles from '../../../../components/account-management/CreateAccountModal.module.css';
import styles from '../../../account-management/AccountManagement.module.css';
import { useMedplum } from '@medplum/react-hooks';
import { useMediaQuery } from '@mantine/hooks';
import { DashboardStats  } from '../../../../components/account-management/DashboardStats';
import type {DashboardStatsData} from '../../../../components/account-management/DashboardStats';
import { AccountFilters  } from '../../../../components/account-management/AccountFilters';
import type {AccountFiltersState} from '../../../../components/account-management/AccountFilters';
import { AccountTable } from '../../../../components/account-management/AccountTable';
import { AccountForm } from '../../../../components/account-management/AccountForm';
import { AccountEditModal } from '../../../../components/account-management/AccountEditModal';
import { ActivationLinkModal } from '../../../../components/account-management/ActivationLinkModal';
// CreateAccountFAB removed - using inline header button instead
import { DeactivationConfirmationModal } from '../../../../components/account-management/deactivation/DeactivationConfirmationModal';
import { KeyboardShortcutsHelp } from '../../../../components/account-management/KeyboardShortcutsHelp';
import { BulkActionBar } from '../../../../components/account-management/BulkActionBar';
import { BulkDeactivationModal } from '../../../../components/account-management/BulkDeactivationModal';
import { BulkRoleAssignModal } from '../../../../components/account-management/BulkRoleAssignModal';
import { ExportButton } from '../../../../components/account-management/ExportButton';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useAccountList } from '../../../../hooks/useAccountList';
import { useAccountManagement } from '../../../../hooks/useAccountManagement';
import { useDeactivation } from '../../../../hooks/useDeactivation';
import { useBulkOperations } from '../../../../hooks/useBulkOperations';
import { useKeyboardShortcuts } from '../../../../hooks/useKeyboardShortcuts';
import { createPractitionerWithActivationUrl } from '../../../../services/accountService';
import { resendInvitation, findInviteForPractitioner, generateActivationLink } from '../../../../services/invitationService';
import accountRolesData from '../../../../translations/account-roles.json';
import type { AccountFormValues, AccountRowExtended, AccountSearchFiltersExtended } from '../../../../types/account-management';

/**
 * AccountsTab - Extracted accounts tab from AccountManagementView
 *
 * Features:
 * - Dashboard KPI cards showing key metrics
 * - Search and filter controls
 * - Responsive table/card view
 * - Create new accounts via modal
 * - Edit accounts via modal
 * - Delete accounts (soft delete)
 * - Deactivate/reactivate accounts
 * - Bulk operations
 * - Mobile-first responsive layout
 * - Auto-refresh after CRUD operations
 */
export function AccountsTab(): JSX.Element {
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

  // Collapsible sections (default collapsed)
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<AccountFiltersState>({
    searchQuery: '',
    statusFilter: 'all',
    roleFilter: '',
  });

  // Advanced filters panel state (reserved for future AdvancedFiltersPanel integration)
  const [advancedFilters] = useState<AccountSearchFiltersExtended>({});

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
          autoClose: false,
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
   */
  const handleEdit = (account: AccountRowExtended) => {
    setEditingAccount(account);
    setEditModalOpened(true);
  };

  /**
   * Handle delete button click
   */
  const handleDelete = async (account: AccountRowExtended) => {
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
    <Box>
      <Stack gap="xl">
        {/* Page Header - Glassmorphism Design (matching Roles page) */}
        <Box className={`${styles.headerSection} ${styles.animateFadeIn}`}>
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <Group gap="md" align="center">
              {/* Icon container */}
              <Box className={styles.headerIcon}>
                <IconUsersGroup size={18} stroke={1.8} />
              </Box>

              <Box>
                <Title order={3} className={styles.headerTitle}>
                  {t('accountManagement.title')}
                </Title>
                <Text className={styles.headerSubtitle}>
                  {t('accountManagement.dashboard.subtitle') || 'Manage user accounts, roles, and permissions'}
                </Text>
              </Box>

              {accounts.length > 0 && (
                <Box className={styles.accountBadge}>
                  {accounts.length} {lang === 'ka' ? 'ანგარიში' : lang === 'ru' ? 'аккаунтов' : 'accounts'}
                </Box>
              )}
            </Group>

            <Button
              leftSection={<IconPlus size={14} stroke={2} />}
              onClick={() => setCreateModalOpened(true)}
              className={styles.createButton}
            >
              {t('accountManagement.create.title')}
            </Button>
          </Group>
        </Box>

        {/* Dashboard Stats Section - Collapsible */}
        <Paper
          p="sm"
          className={`${styles.statsSection} ${styles.animateFadeIn} ${styles.animateDelay1}`}
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
              {t('accountManagement.dashboard.metrics')}
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
            <DashboardStats stats={stats} loading={loading} />
          </Collapse>
        </Paper>

        {/* Filters Section - Collapsible Compact Card */}
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
              {t('accountManagement.filters.searchAndFilter')}
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
            <AccountFilters
              filters={filters}
              onFiltersChange={setFilters}
              roleOptions={roleOptions}
              resultCount={filteredAccounts.length}
              totalCount={accounts.length}
            />
          </Collapse>
        </Paper>

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
              p="sm"
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

      {/* Floating Action Button removed - using inline header button instead */}

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
        zIndex={1100}
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
