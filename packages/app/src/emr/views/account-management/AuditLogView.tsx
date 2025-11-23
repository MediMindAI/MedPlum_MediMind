// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Title, Group, Button, Paper, Text, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconFileSpreadsheet, IconHistory } from '@tabler/icons-react';
import { AuditLogTable } from '../../components/account-management/AuditLogTable';
import { AuditLogFilters } from '../../components/account-management/AuditLogFilters';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { useTranslation } from '../../hooks/useTranslation';
import { exportAuditLogs } from '../../services/exportService';

/**
 * AuditLogView - Main audit log management page
 *
 * Features:
 * - Filter controls (date range, action, outcome)
 * - 7-column audit log table
 * - Pagination
 * - Export to Excel/CSV
 *
 * Route: /emr/account-management/audit
 *
 * @returns AuditLogView component
 */
export function AuditLogView(): JSX.Element {
  const { t } = useTranslation();
  const { events, loading, total, page, pageSize, setPage, filters, setFilters } = useAuditLogs();

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
    <Stack gap="lg">
      {/* Page Header */}
      <Group justify="space-between" align="center" wrap="wrap">
        <Group gap="sm">
          <IconHistory size={28} style={{ color: 'var(--emr-primary)' }} />
          <Title order={2} style={{ color: 'var(--emr-primary)' }}>
            {t('accountManagement.audit.title')}
          </Title>
        </Group>

        {/* Export Buttons */}
        <Group gap="xs">
          <Button
            leftSection={<IconFileSpreadsheet size={16} />}
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={events.length === 0}
          >
            {t('accountManagement.export.excel')}
          </Button>
          <Button
            leftSection={<IconFileSpreadsheet size={16} />}
            variant="subtle"
            size="sm"
            onClick={handleExportCSV}
            disabled={events.length === 0}
          >
            {t('accountManagement.export.csv')}
          </Button>
        </Group>
      </Group>

      {/* Filters Section */}
      <Box>
        <AuditLogFilters filters={filters} onChange={setFilters} />
      </Box>

      {/* Audit Log Table */}
      <Paper
        p="md"
        withBorder
        style={{
          borderRadius: 'var(--emr-border-radius-lg)',
          boxShadow: 'var(--emr-shadow-card)',
        }}
      >
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {loading ? 'Loading...' : `Showing ${events.length} of ${total} records`}
            </Text>
          </Group>

          <AuditLogTable
            logs={events}
            loading={loading}
            page={page}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
