// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo, useState } from 'react';
import { Stack, Group, Text, Box, Title, Paper, Collapse, ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { AuditLogEntryExtended } from '../../types/account-management';
import {
  IconHistory,
  IconFileSpreadsheet,
  IconTable,
  IconActivity,
  IconShieldCheck,
  IconAlertTriangle,
  IconX,
  IconDownload,
  IconChartBar,
  IconChevronDown,
  IconChevronUp,
  IconFilter,
} from '@tabler/icons-react';
import { AuditLogTable } from '../../components/account-management/AuditLogTable';
import { AuditLogFilters } from '../../components/account-management/AuditLogFilters';
import { AuditDetailDrawer } from '../../components/account-management/AuditDetailDrawer';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useTranslation } from '../../hooks/useTranslation';
import { exportAuditLogs } from '../../services/exportService';
import styles from './AuditLog.module.css';

/**
 * Stat card data interface
 */
interface StatCardData {
  label: string;
  value: number;
  icon: JSX.Element;
  variant: 'total' | 'success' | 'warning' | 'error';
}

/**
 * AuditLogView - Premium audit log management page
 *
 * Features:
 * - Premium glassmorphism design
 * - Quick insight stats (total events, success rate, warnings, failures)
 * - Filter controls (date range, action, outcome)
 * - 7-column premium audit log table
 * - Pagination
 * - Export to Excel/CSV
 * - Smooth staggered animations
 *
 * Route: /emr/account-management/audit (as tab within AccountManagementView)
 *
 * @returns AuditLogView component
 */
export function AuditLogView(): JSX.Element {
  const { t, lang } = useTranslation();
  const { events, loading, total, page, pageSize, setPage, filters, setFilters } = useAuditLogs();

  // Collapsible sections state (default collapsed)
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // State for detail drawer
  const [selectedEvent, setSelectedEvent] = useState<AuditLogEntryExtended | null>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);

  // Handle row click
  const handleRowClick = (event: AuditLogEntryExtended) => {
    setSelectedEvent(event);
    setDrawerOpened(true);
  };

  /**
   * Calculate stats from events
   */
  const stats = useMemo((): StatCardData[] => {
    const successCount = events.filter((e) => e.outcome === '0').length;
    const warningCount = events.filter((e) => e.outcome === '4').length;
    const errorCount = events.filter((e) => e.outcome === '8' || e.outcome === '12').length;

    return [
      {
        label: 'Total Events',
        value: total,
        icon: <IconActivity size={22} stroke={1.8} />,
        variant: 'total',
      },
      {
        label: 'Successful',
        value: successCount,
        icon: <IconShieldCheck size={22} stroke={1.8} />,
        variant: 'success',
      },
      {
        label: 'Warnings',
        value: warningCount,
        icon: <IconAlertTriangle size={22} stroke={1.8} />,
        variant: 'warning',
      },
      {
        label: 'Failures',
        value: errorCount,
        icon: <IconX size={22} stroke={1.8} />,
        variant: 'error',
      },
    ];
  }, [events, total]);

  /**
   * Handle export to Excel
   */
  const handleExportExcel = () => {
    if (events.length === 0) {
      notifications.show({
        title: t('accountManagement.export.error'),
        message: 'No data to export',
        color: 'yellow',
      });
      return;
    }

    try {
      const filename = `audit-log-export-${new Date().toISOString().split('T')[0]}`;
      exportAuditLogs(events, 'xlsx', filename);

      notifications.show({
        title: t('accountManagement.export.success'),
        message: `Exported ${events.length} audit log entries`,
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
        title: t('accountManagement.export.error'),
        message: (error as Error).message,
        color: 'red',
      });
    }
  };

  /**
   * Handle export to CSV
   */
  const handleExportCSV = () => {
    if (events.length === 0) {
      notifications.show({
        title: t('accountManagement.export.error'),
        message: 'No data to export',
        color: 'yellow',
      });
      return;
    }

    try {
      const filename = `audit-log-export-${new Date().toISOString().split('T')[0]}`;
      exportAuditLogs(events, 'csv', filename);

      notifications.show({
        title: t('accountManagement.export.success'),
        message: `Exported ${events.length} audit log entries`,
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
        title: t('accountManagement.export.error'),
        message: (error as Error).message,
        color: 'red',
      });
    }
  };

  return (
    <Box className={styles.auditContainer}>
      <Stack gap="xl">
        {/* Page Header - Glassmorphism Design (matching Accounts/Roles) */}
        <Box className={styles.headerSection}>
          <Group justify="space-between" align="center" wrap="wrap" gap="md">
            <Group gap="md" align="center">
              {/* Icon container */}
              <Box className={styles.headerIcon}>
                <IconHistory size={18} stroke={1.8} />
              </Box>

              <Box>
                <Title order={3} className={styles.headerTitle}>
                  {t('accountManagement.audit.title')}
                </Title>
                <Text className={styles.headerSubtitle}>
                  {lang === 'ka' ? 'სისტემის აქტივობისა და უსაფრთხოების თვალყურის დევნება' :
                   lang === 'ru' ? 'Отслеживание активности системы и событий безопасности' :
                   'Track system activity and security events'}
                </Text>
              </Box>

              {total > 0 && (
                <Box className={styles.auditBadge}>
                  {total} {lang === 'ka' ? 'მოვლენა' : lang === 'ru' ? 'событий' : 'events'}
                </Box>
              )}
            </Group>
          </Group>
        </Box>

        {/* Stats Section - Collapsible (compact inline design) */}
        <Paper
          p="sm"
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
            {/* Compact inline stats bar */}
            <Box
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid var(--emr-gray-200)',
                borderRadius: '10px',
                padding: '10px 20px',
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                {stats.map((stat, index) => (
                  <React.Fragment key={stat.label}>
                    {index > 0 && <Box style={{ width: '1px', height: '28px', background: 'var(--emr-gray-200)' }} />}
                    <Group gap={8} align="center" wrap="nowrap">
                      <Box
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: stat.variant === 'total' ? 'rgba(59, 130, 246, 0.1)' :
                                      stat.variant === 'success' ? 'rgba(16, 185, 129, 0.1)' :
                                      stat.variant === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
                                      'rgba(239, 68, 68, 0.1)',
                          flexShrink: 0,
                        }}
                      >
                        {stat.variant === 'total' && <IconActivity size={16} color="#3b82f6" stroke={2} />}
                        {stat.variant === 'success' && <IconShieldCheck size={16} color="#10b981" stroke={2} />}
                        {stat.variant === 'warning' && <IconAlertTriangle size={16} color="#f59e0b" stroke={2} />}
                        {stat.variant === 'error' && <IconX size={16} color="#ef4444" stroke={2} />}
                      </Box>
                      <Text
                        fw={700}
                        style={{
                          fontSize: '18px',
                          lineHeight: 1,
                          fontVariantNumeric: 'tabular-nums',
                          color: 'var(--emr-text-primary)',
                        }}
                      >
                        {loading ? '-' : stat.value.toLocaleString()}
                      </Text>
                      <Text size="xs" fw={500} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                        {stat.label}
                      </Text>
                    </Group>
                  </React.Fragment>
                ))}
              </Group>
            </Box>
          </Collapse>
        </Paper>

        {/* Filters Section - Collapsible */}
        <Paper
          p="sm"
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
              {lang === 'ka' ? 'ძიება და ფილტრები' : lang === 'ru' ? 'Поиск и фильтры' : 'Search and Filters'}
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
            <AuditLogFilters filters={filters} onChange={setFilters} inline />
          </Collapse>
        </Paper>

        {/* Audit Log Table Card */}
        <Box className={styles.tableCard}>
          {/* Table Header */}
          <Box className={styles.tableHeader}>
            <Box className={styles.tableHeaderLeft}>
              <Box className={styles.tableIconBadge}>
                <IconTable size={18} stroke={2} />
              </Box>
              <Box>
                <Text className={styles.tableTitle}>Audit Events</Text>
              </Box>
              <Box className={styles.recordCount}>
                {loading ? 'Loading...' : `${events.length} of ${total}`}
              </Box>
            </Box>

            {/* Export Buttons */}
            <Box className={styles.exportButtons}>
              <button
                className={`${styles.exportButton} ${styles.exportButtonPrimary}`}
                onClick={handleExportExcel}
                disabled={events.length === 0}
              >
                <IconFileSpreadsheet size={16} />
                {t('accountManagement.export.excel')}
              </button>
              <button
                className={styles.exportButton}
                onClick={handleExportCSV}
                disabled={events.length === 0}
              >
                <IconDownload size={16} />
                {t('accountManagement.export.csv')}
              </button>
            </Box>
          </Box>

          {/* Table Body */}
          <Box className={styles.tableBody}>
            <AuditLogTable
              logs={events}
              loading={loading}
              page={page}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              onRowClick={handleRowClick}
            />
          </Box>
        </Box>
      </Stack>

      {/* Audit Detail Drawer */}
      <AuditDetailDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        event={selectedEvent}
      />
    </Box>
  );
}
