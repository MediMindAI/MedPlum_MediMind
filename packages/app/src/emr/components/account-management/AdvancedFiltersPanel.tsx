// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { JSX } from 'react';
import {
  Paper,
  Group,
  Button,
  Collapse,
  Grid,
  SegmentedControl,
  Text,
  ActionIcon,
  Select,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconFilter, IconChevronDown, IconChevronUp, IconX } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import type { AccountSearchFiltersExtended, InvitationStatus } from '../../types/account-management';

interface AdvancedFiltersPanelProps {
  filters: AccountSearchFiltersExtended;
  onChange: (filters: AccountSearchFiltersExtended) => void;
  expanded: boolean;
  onToggle: () => void;
  roleOptions: { value: string; label: string }[];
}

/**
 * Advanced filters panel with expandable UI
 *
 * Features:
 * - Collapsible panel with toggle button
 * - Status filter (All/Active/Inactive)
 * - Role filter dropdown
 * - Hire date range filter
 * - Invitation status filter
 * - Clear all filters button
 * - Mobile-responsive layout
 */
export const AdvancedFiltersPanel = React.memo(function AdvancedFiltersPanel({
  filters,
  onChange,
  expanded,
  onToggle,
  roleOptions,
}: AdvancedFiltersPanelProps): JSX.Element {
  const { t } = useTranslation();

  // Status filter options
  const statusOptions = [
    { label: t('accountManagement.filters.all'), value: 'all' },
    { label: t('accountManagement.filters.active'), value: 'active' },
    { label: t('accountManagement.filters.inactive'), value: 'inactive' },
  ];

  // Invitation status options
  const invitationStatusOptions = [
    { value: '', label: t('accountManagement.filters.all') },
    { value: 'pending', label: t('accountManagement.invitation.pending') },
    { value: 'accepted', label: t('accountManagement.invitation.accepted') },
    { value: 'expired', label: t('accountManagement.invitation.expired') },
    { value: 'bounced', label: t('accountManagement.invitation.bounced') },
    { value: 'cancelled', label: t('accountManagement.invitation.cancelled') },
  ];

  // Determine current status filter value
  const statusValue =
    filters.active === true ? 'active' : filters.active === false ? 'inactive' : 'all';

  // Check if any filters are applied
  const hasActiveFilters =
    filters.active !== undefined ||
    filters.role !== undefined ||
    filters.hireDateFrom !== undefined ||
    filters.hireDateTo !== undefined ||
    filters.invitationStatus !== undefined;

  const handleStatusChange = (value: string) => {
    const newActive = value === 'active' ? true : value === 'inactive' ? false : undefined;
    onChange({ ...filters, active: newActive });
  };

  const handleRoleChange = (value: string | null) => {
    onChange({ ...filters, role: value || undefined });
  };

  const handleHireDateFromChange = (value: string | null) => {
    onChange({ ...filters, hireDateFrom: value || undefined });
  };

  const handleHireDateToChange = (value: string | null) => {
    onChange({ ...filters, hireDateTo: value || undefined });
  };

  const handleInvitationStatusChange = (value: string | null) => {
    onChange({ ...filters, invitationStatus: (value as InvitationStatus) || undefined });
  };

  const handleClearFilters = () => {
    onChange({
      ...filters,
      active: undefined,
      role: undefined,
      hireDateFrom: undefined,
      hireDateTo: undefined,
      invitationStatus: undefined,
    });
  };

  return (
    <Paper
      p="md"
      withBorder
      style={{
        background: 'var(--emr-text-inverse)',
        borderRadius: 'var(--emr-border-radius-lg)',
        boxShadow: 'var(--emr-shadow-card)',
        borderLeft: '4px solid var(--emr-turquoise)',
        transition: 'var(--emr-transition-base)',
      }}
    >
      {/* Toggle Header */}
      <Group justify="space-between" wrap="nowrap">
        <Button
          variant="subtle"
          leftSection={<IconFilter size={18} />}
          rightSection={expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          onClick={onToggle}
          style={{
            color: 'var(--emr-primary)',
            fontWeight: 600,
          }}
        >
          {t('accountManagement.filters.advancedFilters') || 'Advanced Filters'}
          {hasActiveFilters && (
            <Text component="span" size="sm" c="dimmed" ml="xs">
              ({t('accountManagement.filters.activeFilters') || 'Filters applied'})
            </Text>
          )}
        </Button>

        {hasActiveFilters && expanded && (
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={handleClearFilters}
            title={t('accountManagement.filters.clearAll') || 'Clear all filters'}
          >
            <IconX size={16} />
          </ActionIcon>
        )}
      </Group>

      {/* Collapsible Content */}
      <Collapse in={expanded}>
        <Grid mt="md" gutter={{ base: 'sm', md: 'md' }}>
          {/* Status Filter */}
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Text size="sm" fw={500} mb="xs" c="var(--emr-primary)">
              {t('accountManagement.table.status') || 'Status'}
            </Text>
            <SegmentedControl
              fullWidth
              data={statusOptions}
              value={statusValue}
              onChange={handleStatusChange}
              size="md"
              styles={{
                root: {
                  background: 'var(--emr-gray-100)',
                },
                indicator: {
                  background: 'var(--emr-gradient-submenu)',
                },
                label: {
                  '&[data-active]': {
                    color: 'white',
                  },
                },
              }}
            />
          </Grid.Col>

          {/* Role Filter */}
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Text size="sm" fw={500} mb="xs" c="var(--emr-primary)">
              {t('accountManagement.table.role') || 'Role'}
            </Text>
            <Select
              placeholder={t('accountManagement.filters.selectRole') || 'Select role'}
              data={[{ value: '', label: t('accountManagement.filters.allRoles') || 'All Roles' }, ...roleOptions]}
              value={filters.role || ''}
              onChange={handleRoleChange}
              clearable
              searchable
              size="md"
              styles={{
                input: {
                  minHeight: '44px',
                },
              }}
            />
          </Grid.Col>

          {/* Invitation Status Filter */}
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Text size="sm" fw={500} mb="xs" c="var(--emr-primary)">
              {t('accountManagement.invitation.status') || 'Invitation Status'}
            </Text>
            <Select
              placeholder={t('accountManagement.filters.invitationStatus') || 'Invitation status'}
              data={invitationStatusOptions}
              value={filters.invitationStatus || ''}
              onChange={handleInvitationStatusChange}
              clearable
              size="md"
              styles={{
                input: {
                  minHeight: '44px',
                },
              }}
            />
          </Grid.Col>

          {/* Hire Date From */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Text size="sm" fw={500} mb="xs" c="var(--emr-primary)">
              {t('accountManagement.filters.hireDateFrom') || 'Hire Date From'}
            </Text>
            <DatePickerInput
              placeholder={t('accountManagement.filters.selectDate') || 'Select date'}
              value={filters.hireDateFrom || null}
              onChange={handleHireDateFromChange}
              clearable
              size="md"
              styles={{
                input: {
                  minHeight: '44px',
                },
              }}
            />
          </Grid.Col>

          {/* Hire Date To */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Text size="sm" fw={500} mb="xs" c="var(--emr-primary)">
              {t('accountManagement.filters.hireDateTo') || 'Hire Date To'}
            </Text>
            <DatePickerInput
              placeholder={t('accountManagement.filters.selectDate') || 'Select date'}
              value={filters.hireDateTo || null}
              onChange={handleHireDateToChange}
              clearable
              size="md"
              minDate={filters.hireDateFrom || undefined}
              styles={{
                input: {
                  minHeight: '44px',
                },
              }}
            />
          </Grid.Col>

          {/* Clear Button */}
          {hasActiveFilters && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Group justify="flex-end" mt="md">
                <Button
                  variant="light"
                  color="red"
                  leftSection={<IconX size={16} />}
                  onClick={handleClearFilters}
                >
                  {t('accountManagement.filters.clearAll') || 'Clear'}
                </Button>
              </Group>
            </Grid.Col>
          )}
        </Grid>
      </Collapse>
    </Paper>
  );
});
