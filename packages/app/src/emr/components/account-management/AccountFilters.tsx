/**
 * AccountFilters Component
 *
 * Search bar and filter controls for account management table
 * Responsive layout with debounced search input
 */

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
  roleOptions: Array<{ value: string; label: string }>;
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
 * @param onFiltersChange - Callback when filters change
 * @param roleOptions - Available role options for filtering
 * @param resultCount - Number of filtered results
 * @param totalCount - Total number of accounts
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
      p={24}
      withBorder
      style={{
        background: '#ffffff',
        borderRadius: '8px',
        boxShadow: 'var(--emr-shadow-card)',
      }}
    >
      <Group justify="space-between" wrap="nowrap" mb="md">
        {/* Search Input */}
        <TextInput
          placeholder={t('accountManagement.filters.searchPlaceholder')}
          leftSection={<IconSearch size={16} />}
          rightSection={
            localSearchQuery && (
              <ActionIcon onClick={handleClearSearch} variant="subtle" size="sm">
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
          styles={{ input: { minHeight: '44px' } }}
        />

        {/* Result Count */}
        <Text size="sm" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
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
          size="sm"
          color="blue"
        />

        {/* Role Filter */}
        <Select
          placeholder={t('accountManagement.filters.rolePlaceholder')}
          leftSection={<IconFilter size={16} />}
          data={[{ value: '', label: t('accountManagement.filters.allRoles') }, ...roleOptions]}
          value={filters.roleFilter}
          onChange={handleRoleChange}
          clearable
          searchable
          size="sm"
          style={{
            minWidth: '200px',
          }}
        />
      </Group>
    </Paper>
  );
}
