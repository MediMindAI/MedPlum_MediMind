// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Group } from '@mantine/core';
import { EMRTextInput, EMRSelect } from '../shared/EMRFormFields';
import { IconSearch } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface RoleFiltersProps {
  onSearchChange: (search: string) => void;
  onStatusChange: (status: 'active' | 'inactive' | 'all') => void;
}

/**
 * Search and filter controls for roles table
 * @param props - Component props
 * @param props.onSearchChange - Callback when search query changes (debounced)
 * @param props.onStatusChange - Callback when status filter changes
 * @returns Role filters component
 */
export function RoleFilters({ onSearchChange, onStatusChange }: RoleFiltersProps): JSX.Element {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 500);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  return (
    <Group gap="sm">
      <EMRTextInput
        placeholder={t('roleManagement.searchRoles')}
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={setSearch}
        style={{ flex: 1 }}
      />
      <EMRSelect
        placeholder={t('roleManagement.filterByStatus')}
        data={[
          { value: 'all', label: t('roleManagement.allRoles') },
          { value: 'active', label: t('roleManagement.active') },
          { value: 'inactive', label: t('roleManagement.inactive') },
        ]}
        defaultValue="all"
        onChange={(value) => onStatusChange(value as 'active' | 'inactive' | 'all')}
        style={{ width: 200 }}
      />
    </Group>
  );
}
