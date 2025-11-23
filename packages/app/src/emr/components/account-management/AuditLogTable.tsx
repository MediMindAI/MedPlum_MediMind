// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Table, Badge, Text, Skeleton, Stack, Pagination, Group, Box } from '@mantine/core';
import { IconFileAlert } from '@tabler/icons-react';
import type { AuditLogEntryExtended } from '../../types/account-management';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Props for AuditLogTable component
 */
export interface AuditLogTableProps {
  /** Array of audit log entries to display */
  logs: AuditLogEntryExtended[];
  /** Loading state */
  loading: boolean;
  /** Current page number (1-indexed) */
  page?: number;
  /** Total number of records */
  total?: number;
  /** Page size */
  pageSize?: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
}

/**
 * Format ISO timestamp to readable date/time
 * @param timestamp - ISO 8601 timestamp
 * @returns Formatted date string
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return timestamp;
  }
}

/**
 * Get badge color based on outcome code
 * @param outcome - Outcome code ('0', '4', '8', '12')
 * @returns Mantine color string
 */
function getOutcomeColor(outcome: string): string {
  switch (outcome) {
    case '0':
      return 'green';
    case '4':
      return 'yellow';
    case '8':
      return 'orange';
    case '12':
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Get badge color based on action type
 * @param action - Action code ('C', 'R', 'U', 'D', 'E')
 * @returns Mantine color string
 */
function getActionColor(action: string): string {
  switch (action) {
    case 'C':
      return 'blue';
    case 'R':
      return 'gray';
    case 'U':
      return 'cyan';
    case 'D':
      return 'red';
    case 'E':
      return 'violet';
    default:
      return 'gray';
  }
}

/**
 * Loading skeleton for table rows
 */
function LoadingSkeleton(): JSX.Element {
  return (
    <Stack gap="sm" data-testid="audit-log-loading">
      {Array(5)
        .fill(null)
        .map((_, i) => (
          <Skeleton key={i} height={40} radius="sm" />
        ))}
    </Stack>
  );
}

/**
 * Empty state when no logs found
 */
function EmptyState(): JSX.Element {
  const { t } = useTranslation();

  return (
    <Stack align="center" py="xl" gap="md">
      <IconFileAlert size={48} style={{ color: 'var(--mantine-color-gray-5)' }} />
      <Text c="dimmed" size="lg">
        {t('accountManagement.audit.noLogs')}
      </Text>
    </Stack>
  );
}

/**
 * AuditLogTable displays audit log entries in a 7-column table
 *
 * Columns:
 * 1. Timestamp
 * 2. User (actor)
 * 3. Action
 * 4. Resource Type
 * 5. Resource (entity)
 * 6. Outcome
 * 7. IP Address
 *
 * Features:
 * - Turquoise gradient header (theme: var(--emr-gradient-submenu))
 * - Pagination controls
 * - Loading skeleton
 * - Empty state
 * - Color-coded action and outcome badges
 *
 * @param props - Component props
 * @returns AuditLogTable component
 */
export function AuditLogTable({
  logs,
  loading,
  page = 1,
  total = 0,
  pageSize = 20,
  onPageChange,
}: AuditLogTableProps): JSX.Element {
  const { t } = useTranslation();
  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (logs.length === 0) {
    return <EmptyState />;
  }

  return (
    <Stack gap="md">
      <Box style={{ overflowX: 'auto' }}>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead
            style={{
              background: 'var(--emr-gradient-submenu)',
            }}
          >
            <Table.Tr>
              <Table.Th style={{ color: 'white', minWidth: '160px' }}>{t('accountManagement.audit.timestamp')}</Table.Th>
              <Table.Th style={{ color: 'white', minWidth: '140px' }}>{t('accountManagement.audit.actor')}</Table.Th>
              <Table.Th style={{ color: 'white', minWidth: '100px' }}>{t('accountManagement.audit.action')}</Table.Th>
              <Table.Th style={{ color: 'white', minWidth: '120px' }}>Resource Type</Table.Th>
              <Table.Th style={{ color: 'white', minWidth: '150px' }}>{t('accountManagement.audit.entity')}</Table.Th>
              <Table.Th style={{ color: 'white', minWidth: '110px' }}>{t('accountManagement.audit.outcome')}</Table.Th>
              <Table.Th style={{ color: 'white', minWidth: '120px' }}>IP Address</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {logs.map((log) => (
              <Table.Tr key={log.id}>
                <Table.Td>
                  <Text size="sm">{formatTimestamp(log.timestamp)}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {log.agent}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={getActionColor(log.action)} variant="light" size="sm">
                    {log.actionDisplay}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {log.entityType}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{log.entityDisplay || log.entityId}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={getOutcomeColor(log.outcome)} variant="filled" size="sm">
                    {log.outcomeDisplay}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed" ff="monospace">
                    {log.ipAddress || '-'}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      {totalPages > 1 && onPageChange && (
        <Group justify="center" py="md">
          <Pagination value={page} onChange={onPageChange} total={totalPages} size="sm" />
        </Group>
      )}
    </Stack>
  );
}
