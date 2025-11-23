// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { JSX } from 'react';
import { Group, Select, Button, Paper, Stack, Grid } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconFilter, IconX } from '@tabler/icons-react';
import type { AuditLogFilters as AuditLogFiltersType } from '../../types/account-management';
import { useTranslation } from '../../hooks/useTranslation';

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
  { value: 'C', label: 'Create' },
  { value: 'R', label: 'Read' },
  { value: 'U', label: 'Update' },
  { value: 'D', label: 'Delete' },
  { value: 'E', label: 'Execute' },
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
 * AuditLogFilters provides filter controls for audit log table
 *
 * Features:
 * - Date range picker (dateFrom, dateTo)
 * - Action dropdown (Create, Read, Update, Delete, Execute)
 * - Outcome dropdown (Success, Minor/Serious/Major Failure)
 * - Clear all filters button
 * - Responsive grid layout
 *
 * @param props - Component props
 * @returns AuditLogFilters component
 */
export function AuditLogFilters({ filters, onChange }: AuditLogFiltersProps): JSX.Element {
  const { t } = useTranslation();

  /**
   * Handle date from change
   */
  const handleDateFromChange = (value: string | null) => {
    onChange({
      ...filters,
      dateFrom: value ? new Date(value) : undefined,
    });
  };

  /**
   * Handle date to change
   */
  const handleDateToChange = (value: string | null) => {
    onChange({
      ...filters,
      dateTo: value ? new Date(value) : undefined,
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

  return (
    <Paper p="md" withBorder mb="md" data-testid="audit-filters">
      <Stack gap="md">
        <Group gap="xs" align="center">
          <IconFilter size={20} style={{ color: 'var(--emr-primary)' }} />
          <span style={{ fontWeight: 600, color: 'var(--emr-primary)' }}>Filters</span>
        </Group>

        <Grid gutter="md">
          {/* Date From */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <DatePickerInput
              label="Date From"
              placeholder="From"
              value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : null}
              onChange={handleDateFromChange}
              clearable
              size="sm"
              maxDate={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : undefined}
            />
          </Grid.Col>

          {/* Date To */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <DatePickerInput
              label="Date To"
              placeholder="To"
              value={filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : null}
              onChange={handleDateToChange}
              clearable
              size="sm"
              minDate={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : undefined}
            />
          </Grid.Col>

          {/* Action Filter */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              label={t('accountManagement.audit.action')}
              aria-label="Action"
              placeholder="All Actions"
              data={ACTION_OPTIONS}
              value={filters.action || null}
              onChange={handleActionChange}
              clearable
              size="sm"
            />
          </Grid.Col>

          {/* Outcome Filter */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Select
              label={t('accountManagement.audit.outcome')}
              aria-label="Outcome"
              placeholder="All Outcomes"
              data={OUTCOME_OPTIONS}
              value={filters.outcome !== undefined ? filters.outcome.toString() : null}
              onChange={handleOutcomeChange}
              clearable
              size="sm"
            />
          </Grid.Col>
        </Grid>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Group justify="flex-end">
            <Button
              variant="subtle"
              leftSection={<IconX size={16} />}
              onClick={handleClearFilters}
              size="xs"
              aria-label="Clear filters"
            >
              Clear Filters
            </Button>
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
