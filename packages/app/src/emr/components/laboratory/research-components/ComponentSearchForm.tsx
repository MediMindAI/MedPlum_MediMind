// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Box, ActionIcon, Grid } from '@mantine/core';
import { EMRTextInput, EMRSelect } from '../../shared/EMRFormFields';
import { IconSearch, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from '../../../hooks/useTranslation';
import type { ComponentSearchFilters } from '../../../types/laboratory';
import { SERVICE_TYPES } from '../../../translations/service-types.js';
import { MEASUREMENT_UNITS } from '../../../translations/measurement-units.js';

interface ComponentSearchFormProps {
  /** Current filter values */
  filters: ComponentSearchFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: ComponentSearchFilters) => void;
  /** Callback when search button clicked */
  onSearch: () => void;
  /** Callback when refresh button clicked */
  onRefresh: () => void;
}

/**
 * Search form with 6 filter fields matching original EMR
 * @param root0
 * @param root0.filters
 * @param root0.onFiltersChange
 * @param root0.onSearch
 * @param root0.onRefresh
 */
export function ComponentSearchForm({
  filters,
  onFiltersChange,
  onSearch,
  onRefresh,
}: ComponentSearchFormProps): JSX.Element {
  const { t, lang } = useTranslation();

  // Service type options (7 types from original)
  const serviceTypeOptions = [
    { value: '', label: t('laboratory.components.filters.allTypes') },
    ...SERVICE_TYPES.map((type) => ({
      value: type.code,
      label: type.name[lang] || type.name.ka,
    })),
  ];

  // Measurement unit options (56 units from original)
  const unitOptions = [
    { value: '', label: t('laboratory.components.filters.allUnits') },
    ...MEASUREMENT_UNITS.map((unit) => ({
      value: unit.value,
      label: unit.value, // Units are universal, no need for translation
    })),
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: t('laboratory.components.filters.active') },
    { value: 'retired', label: t('laboratory.components.filters.deleted') },
  ];

  return (
    <Box
      p="md"
      style={{
        borderBottom: '1px solid #dee2e6',
        backgroundColor: '#f8f9fa',
      }}
    >
      <Grid gutter="sm" align="flex-end">
        {/* Row 1: Code, GIS Code, Parameter Name */}
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <EMRTextInput
            placeholder={t('laboratory.components.fields.code')}
            value={filters.code || ''}
            onChange={(value) => onFiltersChange({ ...filters, code: value })}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <EMRTextInput
            placeholder={t('laboratory.components.fields.gisCode')}
            value={filters.gisCode || ''}
            onChange={(value) => onFiltersChange({ ...filters, gisCode: value })}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 12, md: 3 }}>
          <EMRTextInput
            placeholder={t('laboratory.components.filters.parameterSearch')}
            value={filters.parameterName || ''}
            onChange={(value) => onFiltersChange({ ...filters, parameterName: value })}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </Grid.Col>

        {/* Row 2: Status, Type, Unit, Actions */}
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <EMRSelect
            data={statusOptions}
            value={filters.status || 'active'}
            onChange={(value) => onFiltersChange({ ...filters, status: (value as 'active' | 'retired') || 'active' })}
            allowDeselect={false}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <EMRSelect
            data={serviceTypeOptions}
            value={filters.type || ''}
            onChange={(value) => onFiltersChange({ ...filters, type: value || undefined })}
            placeholder={t('laboratory.components.fields.type')}
            searchable
            clearable
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 9, md: 2 }}>
          <EMRSelect
            data={unitOptions}
            value={filters.unit || ''}
            onChange={(value) => onFiltersChange({ ...filters, unit: value || undefined })}
            placeholder={t('laboratory.components.fields.unit')}
            searchable
            clearable
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 3, md: 1 }}>
          <Box style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <ActionIcon
              variant="filled"
              color="cyan"
              size="lg"
              onClick={onSearch}
              title={t('laboratory.components.actions.search')}
            >
              <IconSearch size={20} />
            </ActionIcon>
            <ActionIcon
              variant="filled"
              color="gray"
              size="lg"
              onClick={onRefresh}
              title={t('laboratory.components.actions.refresh')}
            >
              <IconRefresh size={20} />
            </ActionIcon>
          </Box>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
