// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Text, Stack, Pagination, Box } from '@mantine/core';
import { IconFileSearch, IconCheck, IconAlertTriangle, IconX } from '@tabler/icons-react';
import type { AuditLogEntryExtended } from '../../types/account-management';
import { useTranslation } from '../../hooks/useTranslation';
import styles from '../../views/account-management/AuditLog.module.css';

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
  /** Callback when a row is clicked */
  onRowClick?: (event: AuditLogEntryExtended) => void;
}

/**
 * Format ISO timestamp to readable date/time with two lines
 * @param timestamp - ISO 8601 timestamp
 * @returns Object with time and date strings
 */
function formatTimestamp(timestamp: string): { time: string; date: string } {
  try {
    const dateObj = new Date(timestamp);
    const time = dateObj.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const date = dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
    return { time, date };
  } catch {
    return { time: timestamp, date: '' };
  }
}

/**
 * Get badge class based on action type
 * @param action - Action code ('C', 'R', 'U', 'D', 'E')
 * @returns CSS class name
 */
function getActionBadgeClass(action: string): string {
  switch (action) {
    case 'C':
      return styles.actionBadgeCreate;
    case 'R':
      return styles.actionBadgeRead;
    case 'U':
      return styles.actionBadgeUpdate;
    case 'D':
      return styles.actionBadgeDelete;
    case 'E':
      return styles.actionBadgeExecute;
    default:
      return styles.actionBadgeRead;
  }
}

/**
 * Get badge class based on outcome code
 * @param outcome - Outcome code ('0', '4', '8', '12')
 * @returns CSS class name
 */
function getOutcomeBadgeClass(outcome: string): string {
  switch (outcome) {
    case '0':
      return styles.outcomeBadgeSuccess;
    case '4':
      return styles.outcomeBadgeMinor;
    case '8':
      return styles.outcomeBadgeSerious;
    case '12':
      return styles.outcomeBadgeMajor;
    default:
      return styles.outcomeBadgeSuccess;
  }
}

/**
 * Get icon for outcome badge
 */
function getOutcomeIcon(outcome: string) {
  switch (outcome) {
    case '0':
      return <IconCheck size={12} stroke={2.5} />;
    case '4':
      return <IconAlertTriangle size={12} stroke={2.5} />;
    case '8':
      return <IconAlertTriangle size={12} stroke={2.5} />;
    case '12':
      return <IconX size={12} stroke={2.5} />;
    default:
      return <IconCheck size={12} stroke={2.5} />;
  }
}

/**
 * Loading skeleton for table rows
 */
function LoadingSkeleton(): JSX.Element {
  return (
    <Box className={styles.skeletonContainer} data-testid="audit-log-loading">
      {Array(5)
        .fill(null)
        .map((_, i) => (
          <Box key={i} className={styles.skeletonRow}>
            <Box className={`${styles.skeletonCell} ${styles.skeletonTimestamp}`} />
            <Box className={`${styles.skeletonCell} ${styles.skeletonActor}`} />
            <Box className={`${styles.skeletonCell} ${styles.skeletonAction}`} />
            <Box className={`${styles.skeletonCell} ${styles.skeletonResource}`} />
            <Box className={`${styles.skeletonCell} ${styles.skeletonEntity}`} />
            <Box className={`${styles.skeletonCell} ${styles.skeletonOutcome}`} />
            <Box className={`${styles.skeletonCell} ${styles.skeletonIp}`} />
          </Box>
        ))}
    </Box>
  );
}

/**
 * Empty state when no logs found
 */
function EmptyState(): JSX.Element {
  const { t } = useTranslation();

  return (
    <Box className={styles.emptyState}>
      <Box className={styles.emptyIconContainer}>
        <IconFileSearch size={48} style={{ color: 'var(--emr-secondary)', opacity: 0.7 }} />
      </Box>
      <Text className={styles.emptyTitle}>
        {t('accountManagement.audit.noLogs')}
      </Text>
      <Text className={styles.emptyDescription}>
        No audit events match your current filters. Try adjusting the date range or clearing filters to see more results.
      </Text>
    </Box>
  );
}

/**
 * AuditLogTable displays audit log entries in a premium 7-column table
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
 * - Premium glassmorphism design
 * - Elegant row hover states
 * - Refined action and outcome badges
 * - Loading skeleton
 * - Animated empty state
 * - Pagination controls
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
  onRowClick,
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
    <Stack gap={0}>
      <Box style={{ overflowX: 'auto' }}>
        <table className={styles.premiumTable}>
          <thead>
            <tr>
              <th style={{ minWidth: '150px' }}>{t('accountManagement.audit.timestamp')}</th>
              <th style={{ minWidth: '140px' }}>{t('accountManagement.audit.actor')}</th>
              <th style={{ minWidth: '110px' }}>{t('accountManagement.audit.action')}</th>
              <th style={{ minWidth: '130px' }}>Resource Type</th>
              <th style={{ minWidth: '160px' }}>{t('accountManagement.audit.entity')}</th>
              <th style={{ minWidth: '100px' }}>{t('accountManagement.audit.outcome')}</th>
              <th style={{ minWidth: '120px' }}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const { time, date } = formatTimestamp(log.timestamp);
              return (
                <tr
                  key={log.id}
                  onClick={() => onRowClick?.(log)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {/* Timestamp */}
                  <td>
                    <span className={styles.timestamp}>
                      {time}
                      <span className={styles.timestampDate}>{date}</span>
                    </span>
                  </td>

                  {/* Actor */}
                  <td>
                    <Text className={styles.actorName}>{log.agent}</Text>
                  </td>

                  {/* Action */}
                  <td>
                    <span className={`${styles.actionBadge} ${getActionBadgeClass(log.action)}`}>
                      {log.actionDisplay}
                    </span>
                  </td>

                  {/* Resource Type */}
                  <td>
                    <span className={styles.resourceType}>{log.entityType}</span>
                  </td>

                  {/* Entity */}
                  <td>
                    <Text className={styles.entityName}>{log.entityDisplay || log.entityId}</Text>
                  </td>

                  {/* Outcome */}
                  <td>
                    <span className={`${styles.outcomeBadge} ${getOutcomeBadgeClass(log.outcome)}`}>
                      {getOutcomeIcon(log.outcome)}
                      {log.outcomeDisplay}
                    </span>
                  </td>

                  {/* IP Address */}
                  <td>
                    <span className={styles.ipAddress}>{log.ipAddress || '-'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>

      {totalPages > 1 && onPageChange && (
        <Box className={styles.paginationWrapper}>
          <Pagination
            value={page}
            onChange={onPageChange}
            total={totalPages}
            size="sm"
            radius="md"
            withEdges
            styles={{
              control: {
                borderRadius: '8px',
                border: '1px solid var(--emr-gray-200)',
                transition: 'all 0.2s ease',
                '&[data-active]': {
                  background: 'var(--emr-gradient-primary)',
                  border: 'none',
                },
                '&:hover:not([data-active])': {
                  background: 'var(--emr-gray-100)',
                },
              },
            }}
          />
        </Box>
      )}
    </Stack>
  );
}
