// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Group, SegmentedControl, ActionIcon, Box } from '@mantine/core';
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
    <Group gap="sm" wrap={isMobile ? 'wrap' : 'nowrap'} align="center">
      {/* Search Input - Premium Design */}
      <Box style={{ flex: 1, minWidth: isMobile ? '100%' : '280px' }}>
        <EMRTextInput
          placeholder={t('accountManagement.filters.searchPlaceholder')}
          leftSection={<IconSearch size={18} color="var(--emr-gray-400)" />}
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

      {/* Status Filter - Premium Segmented Control */}
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
            borderRadius: '12px',
            padding: '4px',
          },
          indicator: {
            background: 'var(--emr-gradient-primary)',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(26, 54, 93, 0.2)',
          },
          label: {
            fontSize: '13px',
            fontWeight: 600,
            padding: '6px 12px',
            transition: 'all 0.2s ease',
            '&[data-active]': {
              color: 'white',
            },
          },
        }}
      />

      {/* Role Filter - Premium Select */}
      <Box style={{ minWidth: isMobile ? '100%' : '200px' }}>
        <EMRSelect
          placeholder={t('accountManagement.filters.rolePlaceholder')}
          leftSection={<IconFilter size={16} color="var(--emr-gray-400)" />}
          data={[{ value: '', label: t('accountManagement.filters.allRoles') }, ...roleOptions]}
          value={filters.roleFilter}
          onChange={handleRoleChange}
          clearable
          searchable
          size="sm"
          style={{ width: '100%' }}
        />
      </Box>

      {/* Result Count Badge - Compact Design */}
      <Box
        style={{
          whiteSpace: 'nowrap',
          background: hasActiveFilters
            ? 'linear-gradient(135deg, rgba(99, 179, 237, 0.15) 0%, rgba(43, 108, 176, 0.1) 100%)'
            : 'var(--emr-gray-100)',
          color: hasActiveFilters ? 'var(--emr-primary)' : 'var(--emr-gray-600)',
          padding: '6px 10px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: 600,
          border: hasActiveFilters ? '1px solid rgba(99, 179, 237, 0.2)' : '1px solid transparent',
          transition: 'all 0.25s ease',
        }}
      >
        {t('accountManagement.filters.showing', { count: resultCount, total: totalCount })}
      </Box>
    </Group>
  );
}
