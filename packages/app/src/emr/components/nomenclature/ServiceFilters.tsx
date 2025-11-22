// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Stack,
  Group,
  TextInput,
  NumberInput,
  Checkbox,
  Button,
  Select,
  Paper,
  Box,
  Text,
  Collapse,
  Grid,
} from '@mantine/core';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { IconSearch, IconX, IconFilter, IconChevronDown, IconChevronUp, IconFileSpreadsheet } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import ServiceGroupSelect from './ServiceGroupSelect';
import { ServiceSubgroupSelect } from './ServiceSubgroupSelect';
import ServiceTypeSelect from './ServiceTypeSelect';
import type { ServiceSearchParams } from '../../types/nomenclature';
import departmentsData from '../../translations/departments.json';

interface ServiceFiltersProps {
  /** Search callback with filter parameters */
  onSearch: (params: ServiceSearchParams) => void;

  /** Clear all filters callback */
  onClear: () => void;

  /** Optional Excel export callback */
  onExport?: () => void;

  /** Disable controls when loading */
  loading?: boolean;
}

/**
 * Advanced filtering component for medical service nomenclature
 *
 * Features:
 * - 12 filter fields (code, name, group, type, subgroup, price range, status, department)
 * - Mobile-first responsive design with Accordion collapse
 * - Debounced text inputs (500ms) for performance
 * - Turquoise gradient theme matching EMR design
 * - Excel export option
 * - Department conditional logic (only show when assignment selected)
 *
 * Usage:
 * ```tsx
 * <ServiceFilters
 *   onSearch={(params) => handleSearch(params)}
 *   onClear={() => handleClear()}
 *   onExport={() => exportToExcel()}
 *   loading={isLoading}
 * />
 * ```
 * @param root0
 * @param root0.onSearch
 * @param root0.onClear
 * @param root0.onExport
 * @param root0.loading
 */
export function ServiceFilters({
  onSearch,
  onClear,
  onExport,
  loading = false,
}: ServiceFiltersProps): JSX.Element {
  const { t, lang } = useTranslation();

  // Local state for form inputs
  const [localCode, setLocalCode] = useState('');
  const [localName, setLocalName] = useState('');
  const [localGroup, setLocalGroup] = useState<string | null>(null);
  const [localType, setLocalType] = useState<string | null>(null);
  const [localSubgroup, setLocalSubgroup] = useState<string | null>(null);
  const [localPriceStart, setLocalPriceStart] = useState<number | string>('');
  const [localPriceEnd, setLocalPriceEnd] = useState<number | string>('');
  const [priceRangeDisabled, setPriceRangeDisabled] = useState(false);
  const [localStatus, setLocalStatus] = useState<string>('active');
  const [localDepartmentAssignment, setLocalDepartmentAssignment] = useState<string>('');
  const [localDepartmentId, setLocalDepartmentId] = useState<string>('');

  // Debounced values for text inputs (500ms delay)
  const [debouncedCode] = useDebouncedValue(localCode, 500);
  const [debouncedName] = useDebouncedValue(localName, 500);

  // Collapsible section for filters (collapsed by default on mobile)
  const [filtersOpened, { toggle: toggleFilters }] = useDisclosure(true);

  // Department options from translations
  const departmentOptions = departmentsData.departments
    .filter((dept) => dept.value !== '') // Exclude "All Departments" option
    .map((dept) => ({
      value: dept.value,
      label: dept[lang as 'ka' | 'en' | 'ru'], // Clean name without number prefix
    }));

  // Status filter options
  const statusOptions = [
    { value: 'active', label: t('nomenclature.medical1.filter.active') },
    { value: 'retired', label: t('nomenclature.medical1.filter.deleted') },
    { value: 'all', label: t('nomenclature.medical1.filter.all') },
  ];

  // Department assignment options
  const departmentAssignmentOptions = [
    { value: '', label: t('nomenclature.medical1.filter.all') },
    { value: 'is', label: t('nomenclature.medical1.filter.isDepartment') },
    { value: 'is-not', label: t('nomenclature.medical1.filter.isNotDepartment') },
  ];

  // Handle search button click
  const handleSearch = (): void => {
    const params: ServiceSearchParams = {
      code: debouncedCode || undefined,
      name: debouncedName || undefined,
      group: localGroup ?? undefined,
      type: localType ?? undefined,
      subgroup: localSubgroup ?? undefined,
      priceStart: !priceRangeDisabled && localPriceStart ? Number(localPriceStart) : undefined,
      priceEnd: !priceRangeDisabled && localPriceEnd ? Number(localPriceEnd) : undefined,
      status: localStatus === 'all' ? undefined : (localStatus as 'active' | 'retired'),
      departmentAssignment: localDepartmentAssignment ? (localDepartmentAssignment as 'is' | 'is-not') : undefined,
      departmentId: localDepartmentAssignment && localDepartmentId ? localDepartmentId : undefined,
    };

    onSearch(params);
  };

  // Handle clear all filters
  const handleClearAll = (): void => {
    setLocalCode('');
    setLocalName('');
    setLocalGroup(null);
    setLocalType(null);
    setLocalSubgroup(null);
    setLocalPriceStart('');
    setLocalPriceEnd('');
    setPriceRangeDisabled(false);
    setLocalStatus('active');
    setLocalDepartmentAssignment('');
    setLocalDepartmentId('');
    onClear();
  };

  // Auto-search when debounced values change (after 500ms)
  useEffect(() => {
    if (debouncedCode || debouncedName) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCode, debouncedName]);

  // Section card style
  const sectionCardStyle = {
    backgroundColor: 'var(--emr-gray-50, #f9fafb)',
    borderLeft: '3px solid var(--emr-turquoise, #17a2b8)',
    borderRadius: 'var(--emr-border-radius, 6px)',
    padding: '12px 16px',
  };

  return (
    <Paper
      shadow="sm"
      radius="md"
      style={{
        overflow: 'hidden',
        border: '1px solid var(--emr-border-color, #e5e7eb)',
      }}
    >
      {/* Gradient Header - Clickable to expand/collapse */}
      <Box
        p="md"
        onClick={toggleFilters}
        style={{
          background: 'var(--emr-gradient-submenu, linear-gradient(90deg, #138496 0%, #17a2b8 50%, #20c4dd 100%))',
          cursor: 'pointer',
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap">
          <Group gap="sm">
            <IconFilter size={20} color="white" />
            <Text size="lg" fw={600} c="white">
              {t('nomenclature.medical1.filter.title')}
            </Text>
            {filtersOpened ? (
              <IconChevronUp size={20} color="white" />
            ) : (
              <IconChevronDown size={20} color="white" />
            )}
          </Group>
          <Group gap="sm" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="subtle"
              color="white"
              size="sm"
              leftSection={<IconX size={16} />}
              onClick={handleClearAll}
              disabled={loading}
              styles={{
                root: {
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:disabled': {
                    color: 'rgba(255, 255, 255, 0.5)',
                    cursor: 'not-allowed',
                  },
                },
              }}
            >
              {t('nomenclature.medical1.filter.clearAll')}
            </Button>
            {onExport && (
              <Button
                variant="white"
                size="sm"
                leftSection={<IconFileSpreadsheet size={16} />}
                onClick={onExport}
                disabled={loading}
                styles={{
                  root: {
                    color: '#10b981',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#f0fdf4',
                    },
                  },
                }}
              >
                {t('nomenclature.medical1.filter.exportExcel')}
              </Button>
            )}
            <Button
              variant="white"
              size="sm"
              leftSection={<IconSearch size={16} />}
              onClick={handleSearch}
              loading={loading}
              styles={{
                root: {
                  color: 'var(--emr-turquoise, #17a2b8)',
                  fontWeight: 600,
                },
              }}
            >
              {t('nomenclature.medical1.filter.search')}
            </Button>
          </Group>
        </Group>
      </Box>

      {/* Filter Content - Collapsible */}
      <Collapse in={filtersOpened} transitionDuration={300} transitionTimingFunction="ease">
        <Stack gap="md" p="md">
          {/* Code & Name Search Section */}
          <Box style={sectionCardStyle}>
            <Text size="xs" fw={600} c="var(--emr-text-secondary, #6b7280)" mb="xs" tt="uppercase">
              {t('nomenclature.medical1.filter.codeSearch')} / {t('nomenclature.medical1.filter.nameSearch')}
            </Text>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label={t('nomenclature.medical1.filter.codeSearch')}
                  placeholder={t('nomenclature.medical1.form.codePlaceholder')}
                  value={localCode}
                  onChange={(e) => setLocalCode(e.currentTarget.value)}
                  disabled={loading}
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: 'var(--emr-turquoise, #17a2b8)',
                        boxShadow: '0 0 0 3px rgba(23, 162, 184, 0.3)',
                      },
                    },
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label={t('nomenclature.medical1.filter.nameSearch')}
                  placeholder={t('nomenclature.medical1.form.namePlaceholder')}
                  value={localName}
                  onChange={(e) => setLocalName(e.currentTarget.value)}
                  disabled={loading}
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: 'var(--emr-turquoise, #17a2b8)',
                        boxShadow: '0 0 0 3px rgba(23, 162, 184, 0.3)',
                      },
                    },
                  }}
                />
              </Grid.Col>
            </Grid>
          </Box>

          {/* Service Categorization Section */}
          <Box style={sectionCardStyle}>
            <Text size="xs" fw={600} c="var(--emr-text-secondary, #6b7280)" mb="xs" tt="uppercase">
              {t('nomenclature.medical1.filter.groupFilter')} / {t('nomenclature.medical1.filter.typeFilter')}
            </Text>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <ServiceGroupSelect
                  value={localGroup}
                  onChange={setLocalGroup}
                  label={t('nomenclature.medical1.filter.groupFilter')}
                  disabled={loading}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <ServiceTypeSelect
                  value={localType}
                  onChange={setLocalType}
                  label={t('nomenclature.medical1.filter.typeFilter')}
                  disabled={loading}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
                <ServiceSubgroupSelect
                  value={localSubgroup ?? ''}
                  onChange={setLocalSubgroup}
                  label={t('nomenclature.medical1.filter.subgroupFilter')}
                  disabled={loading}
                />
              </Grid.Col>
            </Grid>
          </Box>

          {/* Price Range Section */}
          <Box style={sectionCardStyle}>
            <Group justify="space-between" align="center" mb="xs">
              <Text size="xs" fw={600} c="var(--emr-text-secondary, #6b7280)" tt="uppercase">
                {t('nomenclature.medical1.filter.startAmount')} / {t('nomenclature.medical1.filter.endAmount')}
              </Text>
              <Checkbox
                label={t('nomenclature.medical1.filter.disablePriceRange')}
                checked={priceRangeDisabled}
                onChange={(e) => setPriceRangeDisabled(e.currentTarget.checked)}
                disabled={loading}
                size="sm"
                styles={{
                  label: {
                    fontSize: '12px',
                    color: 'var(--emr-text-secondary, #6b7280)',
                  },
                }}
              />
            </Group>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label={t('nomenclature.medical1.filter.startAmount')}
                  placeholder="0.00"
                  value={localPriceStart}
                  onChange={setLocalPriceStart}
                  min={0}
                  decimalScale={2}
                  disabled={loading || priceRangeDisabled}
                  prefix="₾ "
                  thousandSeparator=","
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: 'var(--emr-turquoise, #17a2b8)',
                        boxShadow: '0 0 0 3px rgba(23, 162, 184, 0.3)',
                      },
                    },
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <NumberInput
                  label={t('nomenclature.medical1.filter.endAmount')}
                  placeholder="0.00"
                  value={localPriceEnd}
                  onChange={setLocalPriceEnd}
                  min={0}
                  decimalScale={2}
                  disabled={loading || priceRangeDisabled}
                  prefix="₾ "
                  thousandSeparator=","
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: 'var(--emr-turquoise, #17a2b8)',
                        boxShadow: '0 0 0 3px rgba(23, 162, 184, 0.3)',
                      },
                    },
                  }}
                />
              </Grid.Col>
            </Grid>
          </Box>

          {/* Status & Department Section */}
          <Box style={sectionCardStyle}>
            <Text size="xs" fw={600} c="var(--emr-text-secondary, #6b7280)" mb="xs" tt="uppercase">
              {t('nomenclature.medical1.filter.statusFilter')} / {t('nomenclature.medical1.filter.departmentAssignment')}
            </Text>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label={t('nomenclature.medical1.filter.statusFilter')}
                  placeholder={t('nomenclature.medical1.filter.all')}
                  value={localStatus}
                  onChange={(value) => setLocalStatus(value || 'active')}
                  data={statusOptions}
                  disabled={loading}
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: 'var(--emr-turquoise, #17a2b8)',
                        boxShadow: '0 0 0 3px rgba(23, 162, 184, 0.3)',
                      },
                    },
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label={t('nomenclature.medical1.filter.departmentAssignment')}
                  placeholder={t('nomenclature.medical1.filter.all')}
                  value={localDepartmentAssignment}
                  onChange={(value) => {
                    setLocalDepartmentAssignment(value || '');
                    if (!value) {
                      setLocalDepartmentId(''); // Clear department when assignment is cleared
                    }
                  }}
                  data={departmentAssignmentOptions}
                  disabled={loading}
                  clearable
                  styles={{
                    input: {
                      '&:focus': {
                        borderColor: 'var(--emr-turquoise, #17a2b8)',
                        boxShadow: '0 0 0 3px rgba(23, 162, 184, 0.3)',
                      },
                    },
                  }}
                />
              </Grid.Col>

              {/* Conditional Department Selector - Only show when assignment is selected */}
              {localDepartmentAssignment && (
                <Grid.Col span={{ base: 12 }}>
                  <Select
                    label={t('nomenclature.medical1.filter.department')}
                    placeholder={t('nomenclature.medical1.filter.department')}
                    value={localDepartmentId}
                    onChange={(value) => setLocalDepartmentId(value || '')}
                    data={departmentOptions}
                    disabled={loading}
                    searchable
                    clearable
                    styles={{
                      input: {
                        '&:focus': {
                          borderColor: 'var(--emr-turquoise, #17a2b8)',
                          boxShadow: '0 0 0 3px rgba(23, 162, 184, 0.3)',
                        },
                      },
                    }}
                  />
                </Grid.Col>
              )}
            </Grid>
          </Box>
        </Stack>
      </Collapse>
    </Paper>
  );
}
