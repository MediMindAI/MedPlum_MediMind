// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Paper, TextInput, Select, Group, SegmentedControl, ActionIcon, Text } from '@mantine/core';
import { IconSearch, IconX, IconFilter } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

export interface AccountFiltersState {
  searchQuery: string;
  statusFilter: 'all' | 'active' | 'inactive';
  roleFilter: string;
}

interface AccountFiltersProps {
  filters: AccountFiltersState;
  onFiltersChange: (filters: AccountFiltersState) => void;
  roleOptions: { value: string; label: string }[];
  resultCount: number;
  totalCount: number;
}

/**
 * Filters component for account management
 *
 * Features:
 * - Search input with 500ms debounce
 * - Status filter (SegmentedControl: All/Active/Inactive)
 * - Role filter (Select dropdown)
 * - Clear search button
 * - Result count display
 * - Mobile-responsive layout
 *
 * @param filters - Current filter state
 * @param filters.filters
 * @param onFiltersChange - Callback when filters change
 * @param filters.onFiltersChange
 * @param roleOptions - Available role options for filtering
 * @param filters.roleOptions
 * @param resultCount - Number of filtered results
 * @param filters.resultCount
 * @param totalCount - Total number of accounts
 * @param filters.totalCount
 */
export function AccountFilters({
  filters,
  onFiltersChange,
  roleOptions,
  resultCount,
  totalCount,
}: AccountFiltersProps): JSX.Element {
  const { t } = useTranslation();
  const [localSearchQuery, setLocalSearchQuery] = useState(filters.searchQuery);
  const [debouncedSearchQuery] = useDebouncedValue(localSearchQuery, 500);

  // Update parent filter state when debounced search changes
  useEffect(() => {
    if (debouncedSearchQuery !== filters.searchQuery) {
      onFiltersChange({ ...filters, searchQuery: debouncedSearchQuery });
    }
  }, [debouncedSearchQuery]);

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, statusFilter: value as 'all' | 'active' | 'inactive' });
  };

  const handleRoleChange = (value: string | null) => {
    onFiltersChange({ ...filters, roleFilter: value || '' });
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    onFiltersChange({ ...filters, searchQuery: '' });
  };

  return (
    <Paper
      p="xl"
      withBorder
      style={{
        background: 'var(--emr-text-inverse)',
        borderRadius: 'var(--emr-border-radius-lg)',
        boxShadow: 'var(--emr-shadow-card)',
        borderLeft: '4px solid var(--emr-primary)',
        transition: 'var(--emr-transition-base)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--emr-shadow-card-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--emr-shadow-card)';
      }}
    >
      <Group justify="space-between" wrap="nowrap" mb="lg">
        {/* Search Input */}
        <TextInput
          placeholder={t('accountManagement.filters.searchPlaceholder')}
          leftSection={<IconSearch size={18} color="var(--emr-primary)" />}
          rightSection={
            localSearchQuery && (
              <ActionIcon onClick={handleClearSearch} variant="subtle" size="sm" color="gray">
                <IconX size={16} />
              </ActionIcon>
            )
          }
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          size="md"
          style={{
            flex: 1,
            minWidth: '200px',
            maxWidth: '400px',
          }}
          styles={{
            input: {
              minHeight: '44px',
              borderColor: 'var(--emr-gray-300)',
              '&:focus': {
                borderColor: 'var(--emr-primary)',
                boxShadow: '0 0 0 2px rgba(26, 54, 93, 0.1)',
              },
            },
          }}
        />

        {/* Result Count */}
        <Text
          size="sm"
          c="dimmed"
          fw={500}
          style={{
            whiteSpace: 'nowrap',
            background: 'var(--emr-section-header-bg)',
            padding: '6px 12px',
            borderRadius: 'var(--emr-border-radius)',
          }}
        >
          {t('accountManagement.filters.showing', { count: resultCount, total: totalCount })}
        </Text>
      </Group>

      <Group gap="md" wrap="wrap">
        {/* Status Filter */}
        <SegmentedControl
          data={[
            { label: t('accountManagement.filters.all'), value: 'all' },
            { label: t('accountManagement.filters.active'), value: 'active' },
            { label: t('accountManagement.filters.inactive'), value: 'inactive' },
          ]}
          value={filters.statusFilter}
          onChange={handleStatusChange}
          size="md"
          styles={{
            root: {
              background: 'var(--emr-gray-100)',
            },
            indicator: {
              background: 'var(--emr-gradient-primary)',
            },
            label: {
              '&[data-active]': {
                color: 'white',
              },
            },
          }}
        />

        {/* Role Filter */}
        <Select
          placeholder={t('accountManagement.filters.rolePlaceholder')}
          leftSection={<IconFilter size={16} color="var(--emr-primary)" />}
          data={[{ value: '', label: t('accountManagement.filters.allRoles') }, ...roleOptions]}
          value={filters.roleFilter}
          onChange={handleRoleChange}
          clearable
          searchable
          size="md"
          style={{
            minWidth: '200px',
          }}
          styles={{
            input: {
              borderColor: 'var(--emr-gray-300)',
              minHeight: '44px',
            },
          }}
        />
      </Group>
    </Paper>
  );
}
