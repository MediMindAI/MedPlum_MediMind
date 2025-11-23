// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Paper, Group, SegmentedControl, ActionIcon, Text, Stack, Box } from '@mantine/core';
import { IconSearch, IconX, IconFilter } from '@tabler/icons-react';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { EMRTextInput, EMRSelect } from '../shared/EMRFormFields';

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
  const isMobile = useMediaQuery('(max-width: 768px)');

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

  // Check if any filters are active
  const hasActiveFilters = filters.searchQuery !== '' || filters.statusFilter !== 'all' || filters.roleFilter !== '';

  return (
    <Paper
      p="lg"
      withBorder
      style={{
        background: 'var(--emr-text-inverse)',
        borderRadius: 'var(--emr-border-radius-lg)',
        boxShadow: 'var(--emr-shadow-sm)',
        border: '1px solid var(--emr-gray-200)',
        transition: 'var(--emr-transition-smooth)',
      }}
    >
      <Stack gap="md">
        {/* Search Row */}
        <Group gap="md" wrap={isMobile ? 'wrap' : 'nowrap'} align="center">
          {/* Search Input */}
          <Box style={{ flex: 1, minWidth: isMobile ? '100%' : '240px' }}>
            <EMRTextInput
              placeholder={t('accountManagement.filters.searchPlaceholder')}
              leftSection={<IconSearch size={16} color="var(--emr-gray-400)" />}
              rightSection={
                localSearchQuery && (
                  <ActionIcon
                    onClick={handleClearSearch}
                    variant="subtle"
                    size="sm"
                    color="gray"
                    style={{ marginRight: '4px' }}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                )
              }
              value={localSearchQuery}
              onChange={(value) => setLocalSearchQuery(value)}
              style={{ width: '100%' }}
            />
          </Box>

          {/* Status Filter */}
          <SegmentedControl
            data={[
              { label: t('accountManagement.filters.all'), value: 'all' },
              { label: t('accountManagement.filters.active'), value: 'active' },
              { label: t('accountManagement.filters.inactive'), value: 'inactive' },
            ]}
            value={filters.statusFilter}
            onChange={handleStatusChange}
            size="sm"
            styles={{
              root: {
                background: 'var(--emr-gray-100)',
                borderRadius: 'var(--emr-border-radius)',
                padding: '3px',
              },
              indicator: {
                background: 'var(--emr-gradient-primary)',
                borderRadius: 'var(--emr-border-radius-sm)',
                boxShadow: 'var(--emr-shadow-sm)',
              },
              label: {
                fontSize: '12px',
                fontWeight: 500,
                padding: '6px 12px',
                '&[data-active]': {
                  color: 'var(--emr-text-inverse)',
                },
              },
            }}
          />

          {/* Role Filter */}
          <Box style={{ minWidth: isMobile ? '100%' : '180px' }}>
            <EMRSelect
              placeholder={t('accountManagement.filters.rolePlaceholder')}
              leftSection={<IconFilter size={14} color="var(--emr-gray-400)" />}
              data={[{ value: '', label: t('accountManagement.filters.allRoles') }, ...roleOptions]}
              value={filters.roleFilter}
              onChange={handleRoleChange}
              clearable
              searchable
              size="sm"
              style={{ width: '100%' }}
            />
          </Box>

          {/* Result Count Badge */}
          <Text
            size="xs"
            fw={500}
            style={{
              whiteSpace: 'nowrap',
              background: hasActiveFilters ? 'var(--emr-light-accent)' : 'var(--emr-gray-100)',
              color: hasActiveFilters ? 'var(--emr-primary)' : 'var(--emr-gray-600)',
              padding: '6px 10px',
              borderRadius: 'var(--emr-border-radius)',
              transition: 'var(--emr-transition-fast)',
            }}
          >
            {t('accountManagement.filters.showing', { count: resultCount, total: totalCount })}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}
