// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import {
  Group,
  Button,
  Paper,
  Box,
  Text,
  Collapse,
  Grid,
  Badge,
  Tooltip,
} from '@mantine/core';
import { EMRTextInput, EMRNumberInput, EMRCheckbox, EMRSelect } from '../shared/EMRFormFields';
import { useDebouncedValue, useDisclosure } from '@mantine/hooks';
import { IconSearch, IconX, IconFilter, IconChevronDown, IconChevronUp, IconFileSpreadsheet } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useState, useEffect, useMemo } from 'react';
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

  // Collapsible section for filters (collapsed by default for compact UI)
  const [filtersOpened, { toggle: toggleFilters }] = useDisclosure(false);

  // Count active filters to show badge when collapsed
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (localCode) count++;
    if (localName) count++;
    if (localGroup) count++;
    if (localType) count++;
    if (localSubgroup) count++;
    if (localPriceStart) count++;
    if (localPriceEnd) count++;
    if (localStatus !== 'active') count++;
    if (localDepartmentAssignment) count++;
    return count;
  }, [localCode, localName, localGroup, localType, localSubgroup, localPriceStart, localPriceEnd, localStatus, localDepartmentAssignment]);

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

  // Compact input style - smaller padding
  const compactInputStyle = {
    input: {
      '&:focus': {
        borderColor: 'var(--emr-turquoise, #17a2b8)',
        boxShadow: '0 0 0 2px rgba(23, 162, 184, 0.2)',
      },
    },
  };

  return (
    <Paper
      shadow="xs"
      radius="md"
      style={{
        overflow: 'hidden',
        border: '1px solid var(--emr-border-color, #e5e7eb)',
      }}
    >
      {/* Compact Header - Clickable to expand/collapse */}
      <Box
        px="sm"
        py="xs"
        onClick={toggleFilters}
        style={{
          background: 'var(--emr-gradient-submenu, linear-gradient(90deg, #138496 0%, #17a2b8 50%, #20c4dd 100%))',
          cursor: 'pointer',
        }}
      >
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="xs">
            <IconFilter size={18} color="white" />
            <Text size="sm" fw={600} c="white">
              {t('nomenclature.medical1.filter.title')}
            </Text>
            {activeFilterCount > 0 && (
              <Tooltip label={`${activeFilterCount} ${t('nomenclature.medical1.filter.activeFilters')}`}>
                <Badge size="sm" color="white" variant="filled" style={{ color: '#17a2b8' }}>
                  {activeFilterCount}
                </Badge>
              </Tooltip>
            )}
            {filtersOpened ? (
              <IconChevronUp size={16} color="white" />
            ) : (
              <IconChevronDown size={16} color="white" />
            )}
          </Group>
          <Group gap="xs" onClick={(e) => e.stopPropagation()}>
            {activeFilterCount > 0 && (
              <Tooltip label={t('nomenclature.medical1.filter.clearAll')}>
                <Button
                  variant="subtle"
                  color="white"
                  
                  px="xs"
                  onClick={handleClearAll}
                  disabled={loading}
                  styles={{
                    root: {
                      color: 'white',
                      '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
                    },
                  }}
                >
                  <IconX size={14} />
                </Button>
              </Tooltip>
            )}
            {onExport && (
              <Tooltip label={t('nomenclature.medical1.filter.exportExcel')}>
                <Button
                  variant="white"
                  
                  px="xs"
                  onClick={onExport}
                  disabled={loading}
                  styles={{
                    root: { color: '#10b981' },
                  }}
                >
                  <IconFileSpreadsheet size={16} />
                </Button>
              </Tooltip>
            )}
            <Button
              variant="white"
              
              leftSection={<IconSearch size={14} />}
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

      {/* Filter Content - Collapsible - Compact single grid layout */}
      <Collapse in={filtersOpened} transitionDuration={200} transitionTimingFunction="ease">
        <Box p="sm" style={{ backgroundColor: 'var(--emr-gray-50, #f9fafb)' }}>
          <Grid gutter="xs">
            {/* Row 1: Code, Name */}
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <EMRTextInput
                label={t('nomenclature.medical1.filter.codeSearch')}
                placeholder={t('nomenclature.medical1.form.codePlaceholder')}
                value={localCode}
                onChange={setLocalCode}
                disabled={loading}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <EMRTextInput
                label={t('nomenclature.medical1.filter.nameSearch')}
                placeholder={t('nomenclature.medical1.form.namePlaceholder')}
                value={localName}
                onChange={setLocalName}
                disabled={loading}
              />
            </Grid.Col>
            {/* Row 1: Group, Type */}
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <ServiceGroupSelect
                value={localGroup}
                onChange={setLocalGroup}
                label={t('nomenclature.medical1.filter.groupFilter')}
                disabled={loading}
                
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <ServiceTypeSelect
                value={localType}
                onChange={setLocalType}
                label={t('nomenclature.medical1.filter.typeFilter')}
                disabled={loading}
                
              />
            </Grid.Col>

            {/* Row 2: Subgroup, Price Range, Status */}
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <ServiceSubgroupSelect
                value={localSubgroup ?? ''}
                onChange={setLocalSubgroup}
                label={t('nomenclature.medical1.filter.subgroupFilter')}
                disabled={loading}
                
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
              <EMRNumberInput
                label={t('nomenclature.medical1.filter.startAmount')}
                placeholder="0"
                value={localPriceStart}
                onChange={setLocalPriceStart}
                min={0}
                decimalScale={2}
                disabled={loading || priceRangeDisabled}
                prefix="₾"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3, md: 2 }}>
              <EMRNumberInput
                label={t('nomenclature.medical1.filter.endAmount')}
                placeholder="0"
                value={localPriceEnd}
                onChange={setLocalPriceEnd}
                min={0}
                decimalScale={2}
                disabled={loading || priceRangeDisabled}
                prefix="₾"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
              <EMRSelect
                label={t('nomenclature.medical1.filter.statusFilter')}
                value={localStatus}
                onChange={(value) => setLocalStatus(value || 'active')}
                data={statusOptions}
                disabled={loading}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <EMRSelect
                label={t('nomenclature.medical1.filter.departmentAssignment')}
                placeholder={t('nomenclature.medical1.filter.all')}
                value={localDepartmentAssignment}
                onChange={(value) => {
                  setLocalDepartmentAssignment(value || '');
                  if (!value) {
                    setLocalDepartmentId('');
                  }
                }}
                data={departmentAssignmentOptions}
                disabled={loading}
                clearable
              />
            </Grid.Col>

            {/* Conditional: Department selector + Price disable checkbox */}
            {localDepartmentAssignment && (
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <EMRSelect
                  label={t('nomenclature.medical1.filter.department')}
                  placeholder={t('nomenclature.medical1.filter.department')}
                  value={localDepartmentId}
                  onChange={(value) => setLocalDepartmentId(value || '')}
                  data={departmentOptions}
                  disabled={loading}
                  searchable
                  clearable
                />
              </Grid.Col>
            )}
            <Grid.Col span={{ base: 12, sm: 6, md: localDepartmentAssignment ? 3 : 12 }}>
              <Box style={{ marginTop: 'var(--mantine-spacing-lg)' }}>
                <EMRCheckbox
                  label={t('nomenclature.medical1.filter.disablePriceRange')}
                  checked={priceRangeDisabled}
                  onChange={setPriceRangeDisabled}
                  disabled={loading}
                />
              </Box>
            </Grid.Col>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
}
