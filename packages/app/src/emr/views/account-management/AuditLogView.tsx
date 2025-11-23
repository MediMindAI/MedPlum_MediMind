// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useState } from 'react';
import { Stack, Group, Text, Box, SimpleGrid } from '@mantine/core';
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
  const { t } = useTranslation();
  const { events, loading, total, page, pageSize, setPage, filters, setFilters } = useAuditLogs();

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

  /**
   * Get variant class for stat card
   */
  const getStatCardClass = (variant: string): string => {
    switch (variant) {
      case 'total':
        return styles.statCardTotal;
      case 'success':
        return styles.statCardSuccess;
      case 'warning':
        return styles.statCardWarning;
      case 'error':
        return styles.statCardError;
      default:
        return styles.statCardTotal;
    }
  };

  return (
    <Box className={styles.auditContainer}>
      <Stack gap="xl">
        {/* Premium Header Card */}
        <Box className={styles.headerCard}>
          <Box className={styles.headerGradient}>
            <Group gap={18} align="center">
              <Box className={styles.headerIconBadge}>
                <IconHistory size={28} stroke={1.8} color="white" />
              </Box>
              <Box>
                <Text component="h2" className={styles.headerTitle}>
                  {t('accountManagement.audit.title')}
                </Text>
                <Text className={styles.headerSubtitle}>
                  Track system activity and security events
                </Text>
              </Box>
            </Group>
          </Box>

          {/* Quick Stats */}
          <Box className={styles.headerBody}>
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" className={styles.statsGrid}>
              {stats.map((stat, index) => (
                <Box key={stat.label} className={`${styles.statCard} ${getStatCardClass(stat.variant)}`}>
                  <Box className={styles.statIcon}>{stat.icon}</Box>
                  <Text className={styles.statValue}>{loading ? '-' : stat.value.toLocaleString()}</Text>
                  <Text className={styles.statLabel}>{stat.label}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </Box>

        {/* Filters Section */}
        <AuditLogFilters filters={filters} onChange={setFilters} />

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
