// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { JSX } from 'react';
import { Group, Select, Box, Grid, Text, ActionIcon, Tooltip } from '@mantine/core';
import { IconFilter, IconX, IconCalendarEvent, IconAdjustments, IconAlertCircle } from '@tabler/icons-react';
import { EMRDatePicker } from '../common/EMRDatePicker';
import type { AuditLogFilters as AuditLogFiltersType } from '../../types/account-management';
import { useTranslation } from '../../hooks/useTranslation';
import styles from '../../views/account-management/AuditLog.module.css';

/**
 * Props for AuditLogFilters component
 */
export interface AuditLogFiltersProps {
  /** Current filter values */
  filters: AuditLogFiltersType;
  /** Callback when filters change */
  onChange: (filters: AuditLogFiltersType) => void;
}

/**
 * Action options for filter dropdown
 */
const ACTION_OPTIONS = [
  { value: 'C', label: 'Create', icon: '+' },
  { value: 'R', label: 'Read', icon: '?' },
  { value: 'U', label: 'Update', icon: '~' },
  { value: 'D', label: 'Delete', icon: '-' },
  { value: 'E', label: 'Execute', icon: '!' },
];

/**
 * Outcome options for filter dropdown
 */
const OUTCOME_OPTIONS = [
  { value: '0', label: 'Success' },
  { value: '4', label: 'Minor Failure' },
  { value: '8', label: 'Serious Failure' },
  { value: '12', label: 'Major Failure' },
];

/**
 * AuditLogFilters provides premium filter controls for audit log table
 *
 * Features:
 * - Date range picker (dateFrom, dateTo)
 * - Action dropdown (Create, Read, Update, Delete, Execute)
 * - Outcome dropdown (Success, Minor/Serious/Major Failure)
 * - Clear all filters button
 * - Premium glassmorphism design
 *
 * @param props - Component props
 * @returns AuditLogFilters component
 */
export function AuditLogFilters({ filters, onChange }: AuditLogFiltersProps): JSX.Element {
  const { t } = useTranslation();

  /**
   * Handle date from change
   */
  const handleDateFromChange = (value: Date | null) => {
    onChange({
      ...filters,
      dateFrom: value ?? undefined,
    });
  };

  /**
   * Handle date to change
   */
  const handleDateToChange = (value: Date | null) => {
    onChange({
      ...filters,
      dateTo: value ?? undefined,
    });
  };

  /**
   * Handle action filter change
   */
  const handleActionChange = (value: string | null) => {
    onChange({
      ...filters,
      action: value ? (value as 'C' | 'R' | 'U' | 'D' | 'E') : undefined,
    });
  };

  /**
   * Handle outcome filter change
   */
  const handleOutcomeChange = (value: string | null) => {
    if (!value) {
      onChange({
        ...filters,
        outcome: undefined,
      });
      return;
    }

    const outcomeValue = parseInt(value, 10) as 0 | 4 | 8 | 12;
    onChange({
      ...filters,
      outcome: outcomeValue,
    });
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    onChange({});
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters =
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined ||
    filters.action !== undefined ||
    filters.outcome !== undefined ||
    filters.actorId !== undefined;

  const activeFilterCount = [
    filters.dateFrom,
    filters.dateTo,
    filters.action,
    filters.outcome,
    filters.actorId,
  ].filter(Boolean).length;

  return (
    <Box className={styles.filtersCard} data-testid="audit-filters">
      {/* Premium Header */}
      <Box className={styles.filtersHeader}>
        <Group gap={14} align="center">
          <Box className={styles.filtersIconBadge}>
            <IconFilter size={18} stroke={2} />
          </Box>
          <Box>
            <Text className={styles.filtersTitle}>Filters</Text>
            {activeFilterCount > 0 && (
              <Text size="xs" c="var(--emr-gray-500)" mt={2}>
                {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
              </Text>
            )}
          </Box>
        </Group>

        {hasActiveFilters && (
          <Tooltip label="Clear all filters" position="left">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              onClick={handleClearFilters}
              aria-label="Clear filters"
              style={{
                borderRadius: '10px',
                transition: 'all 0.2s ease',
              }}
            >
              <IconX size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      </Box>

      {/* Filter Fields */}
      <Box className={styles.filtersBody}>
        <Grid gutter="md">
          {/* Date From */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Box className={styles.filterField}>
              <Text className={styles.filterLabel}>
                <IconCalendarEvent size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Date From
              </Text>
              <EMRDatePicker
                placeholder="Select start date"
                value={filters.dateFrom ?? null}
                onChange={handleDateFromChange}
                maxDate={filters.dateTo ?? new Date()}
              />
            </Box>
          </Grid.Col>

          {/* Date To */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Box className={styles.filterField}>
              <Text className={styles.filterLabel}>
                <IconCalendarEvent size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Date To
              </Text>
              <EMRDatePicker
                placeholder="Select end date"
                value={filters.dateTo ?? null}
                onChange={handleDateToChange}
                minDate={filters.dateFrom ?? undefined}
                maxDate={new Date()}
              />
            </Box>
          </Grid.Col>

          {/* Action Filter */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Box className={styles.filterField}>
              <Text className={styles.filterLabel}>
                <IconAdjustments size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                {t('accountManagement.audit.action')}
              </Text>
              <Select
                aria-label="Action"
                placeholder="All Actions"
                data={ACTION_OPTIONS}
                value={filters.action || null}
                onChange={handleActionChange}
                clearable
                size="sm"
                leftSection={<IconAdjustments size={16} style={{ color: 'var(--emr-gray-400)' }} />}
                styles={{
                  input: {
                    minHeight: '42px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--emr-gray-200)',
                    background: 'white',
                    transition: 'all 0.2s ease',
                    '&:focus': {
                      borderColor: 'var(--emr-secondary)',
                      boxShadow: '0 0 0 3px rgba(43, 108, 176, 0.12)',
                    },
                  },
                }}
              />
            </Box>
          </Grid.Col>

          {/* Outcome Filter */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Box className={styles.filterField}>
              <Text className={styles.filterLabel}>
                <IconAlertCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                {t('accountManagement.audit.outcome')}
              </Text>
              <Select
                aria-label="Outcome"
                placeholder="All Outcomes"
                data={OUTCOME_OPTIONS}
                value={filters.outcome !== undefined ? filters.outcome.toString() : null}
                onChange={handleOutcomeChange}
                clearable
                size="sm"
                leftSection={<IconAlertCircle size={16} style={{ color: 'var(--emr-gray-400)' }} />}
                styles={{
                  input: {
                    minHeight: '42px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--emr-gray-200)',
                    background: 'white',
                    transition: 'all 0.2s ease',
                    '&:focus': {
                      borderColor: 'var(--emr-secondary)',
                      boxShadow: '0 0 0 3px rgba(43, 108, 176, 0.12)',
                    },
                  },
                }}
              />
            </Box>
          </Grid.Col>
        </Grid>
      </Box>
    </Box>
  );
}
