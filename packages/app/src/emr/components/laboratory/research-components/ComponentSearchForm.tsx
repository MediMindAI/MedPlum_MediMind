/**
 * Component Search Form
 *
 * Advanced search form matching original EMR design with 6 filter fields:
 * - Code filter
 * - GIS Code filter
 * - Parameter name search
 * - Status dropdown (active/retired)
 * - Type dropdown (7 service types)
 * - Unit dropdown (56 measurement units)
 */

import React from 'react';
import { TextInput, Select, Box, ActionIcon, Grid } from '@mantine/core';
import { IconSearch, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { ComponentSearchFilters } from '../../../types/laboratory';
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
          <TextInput
            placeholder={t('laboratory.components.fields.code')}
            value={filters.code || ''}
            onChange={(e) => onFiltersChange({ ...filters, code: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <TextInput
            placeholder={t('laboratory.components.fields.gisCode')}
            value={filters.gisCode || ''}
            onChange={(e) => onFiltersChange({ ...filters, gisCode: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 12, md: 3 }}>
          <TextInput
            placeholder={t('laboratory.components.filters.parameterSearch')}
            value={filters.parameterName || ''}
            onChange={(e) => onFiltersChange({ ...filters, parameterName: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </Grid.Col>

        {/* Row 2: Status, Type, Unit, Actions */}
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <Select
            data={statusOptions}
            value={filters.status || 'active'}
            onChange={(value) => onFiltersChange({ ...filters, status: (value as 'active' | 'retired') || 'active' })}
            allowDeselect={false}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <Select
            data={serviceTypeOptions}
            value={filters.type || ''}
            onChange={(value) => onFiltersChange({ ...filters, type: value || undefined })}
            placeholder={t('laboratory.components.fields.type')}
            searchable
            clearable
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 9, md: 2 }}>
          <Select
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
