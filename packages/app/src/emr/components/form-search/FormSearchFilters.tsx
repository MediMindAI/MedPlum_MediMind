// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Grid,
  TextInput,
  Select,
  Button,
  Group,
  Paper,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconSearch, IconX, IconFilter } from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import type { Questionnaire } from '@medplum/fhirtypes';
import { useTranslation } from '../../hooks/useTranslation';
import { fetchAvailableQuestionnaires } from '../../services/formRendererService';
import type { FormSearchParams } from '../../services/formRendererService';

/**
 * Props for FormSearchFilters component
 */
export interface FormSearchFiltersProps {
  /** Current search parameters */
  searchParams: FormSearchParams;
  /** Callback when search params change */
  onSearchParamsChange: (params: FormSearchParams) => void;
  /** Callback to trigger search */
  onSearch?: () => void;
  /** Whether to show form type filter */
  showFormTypeFilter?: boolean;
  /** Custom questionnaires list (overrides auto-fetch) */
  questionnaires?: Questionnaire[];
}

/**
 * Status options for filtering
 */
const STATUS_OPTIONS = [
  { value: '', label: 'all' },
  { value: 'completed', label: 'completed' },
  { value: 'in-progress', label: 'in-progress' },
  { value: 'amended', label: 'amended' },
  { value: 'entered-in-error', label: 'entered-in-error' },
  { value: 'stopped', label: 'stopped' },
];

/**
 * FormSearchFilters Component
 *
 * Provides search and filter controls for QuestionnaireResponse search.
 * Features:
 * - Patient search (name or ID)
 * - Date range filter (from/to)
 * - Form type/template dropdown
 * - Status filter
 * - Clear filters button
 * - Debounced search (500ms)
 */
export function FormSearchFilters({
  searchParams,
  onSearchParamsChange,
  onSearch,
  showFormTypeFilter = true,
  questionnaires: propQuestionnaires,
}: FormSearchFiltersProps): JSX.Element {
  const { t, lang } = useTranslation();
  const medplum = useMedplum();

  // Local state for debounced inputs
  const [patientSearch, setPatientSearch] = useState(
    searchParams.patientName || searchParams.patientId || ''
  );
  const [fullTextSearch, setFullTextSearch] = useState(searchParams.fullTextSearch || '');
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(propQuestionnaires || []);
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(false);

  // Date state
  const [dateFrom, setDateFrom] = useState<Date | null>(
    searchParams.dateFrom ? new Date(searchParams.dateFrom) : null
  );
  const [dateTo, setDateTo] = useState<Date | null>(
    searchParams.dateTo ? new Date(searchParams.dateTo) : null
  );

  // Fetch questionnaires on mount (if not provided as prop)
  useEffect(() => {
    if (propQuestionnaires) {
      setQuestionnaires(propQuestionnaires);
      return;
    }

    if (showFormTypeFilter) {
      setLoadingQuestionnaires(true);
      fetchAvailableQuestionnaires(medplum)
        .then(setQuestionnaires)
        .catch(console.error)
        .finally(() => setLoadingQuestionnaires(false));
    }
  }, [medplum, showFormTypeFilter, propQuestionnaires]);

  // Debounced patient search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Detect if it's a patient ID (e.g., UUID or numeric) or name
      const isPatientId = /^[0-9a-f-]{36}$/i.test(patientSearch) || /^\d{11}$/.test(patientSearch);

      onSearchParamsChange({
        ...searchParams,
        patientId: isPatientId ? patientSearch : undefined,
        patientName: isPatientId ? undefined : patientSearch || undefined,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [patientSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced full-text search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchParamsChange({
        ...searchParams,
        fullTextSearch: fullTextSearch || undefined,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [fullTextSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle date changes
  const handleDateFromChange = useCallback((date: Date | null) => {
    setDateFrom(date);
    onSearchParamsChange({
      ...searchParams,
      dateFrom: date ? date.toISOString().split('T')[0] : undefined,
    });
  }, [searchParams, onSearchParamsChange]);

  const handleDateToChange = useCallback((date: Date | null) => {
    setDateTo(date);
    onSearchParamsChange({
      ...searchParams,
      dateTo: date ? date.toISOString().split('T')[0] : undefined,
    });
  }, [searchParams, onSearchParamsChange]);

  // Handle status change
  const handleStatusChange = useCallback((value: string | null) => {
    onSearchParamsChange({
      ...searchParams,
      status: value || undefined,
    });
  }, [searchParams, onSearchParamsChange]);

  // Handle questionnaire change
  const handleQuestionnaireChange = useCallback((value: string | null) => {
    onSearchParamsChange({
      ...searchParams,
      questionnaireId: value || undefined,
    });
  }, [searchParams, onSearchParamsChange]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setPatientSearch('');
    setFullTextSearch('');
    setDateFrom(null);
    setDateTo(null);
    onSearchParamsChange({
      _count: searchParams._count,
      _offset: 0,
    });
  }, [onSearchParamsChange, searchParams._count]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(
      patientSearch ||
      fullTextSearch ||
      dateFrom ||
      dateTo ||
      searchParams.status ||
      searchParams.questionnaireId
    );
  }, [patientSearch, fullTextSearch, dateFrom, dateTo, searchParams.status, searchParams.questionnaireId]);

  // Questionnaire options for select
  const questionnaireOptions = useMemo(() => {
    const options = [{ value: '', label: t('formSearch.allFormTypes') || 'All Form Types' }];
    for (const q of questionnaires) {
      if (q.id && q.title) {
        options.push({ value: q.id, label: q.title });
      }
    }
    return options;
  }, [questionnaires, t]);

  // Status options with translations
  const translatedStatusOptions = useMemo(() => {
    return STATUS_OPTIONS.map((opt) => ({
      value: opt.value,
      label: opt.value ? t(`formSearch.status.${opt.value}`) || opt.label : t('formSearch.allStatuses') || 'All Statuses',
    }));
  }, [t]);

  return (
    <Paper
      p="md"
      withBorder
      style={{
        borderColor: 'var(--emr-border-color)',
        backgroundColor: 'var(--emr-gray-50)',
      }}
      data-testid="form-search-filters"
    >
      <Grid gutter={{ base: 'xs', md: 'md' }}>
        {/* Patient Search */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <TextInput
            label={t('formSearch.patientSearch') || 'Patient (Name or ID)'}
            placeholder={t('formSearch.patientSearchPlaceholder') || 'Search by name or ID...'}
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            data-testid="patient-search-input"
          />
        </Grid.Col>

        {/* Full-text Search */}
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <TextInput
            label={t('formSearch.contentSearch') || 'Content Search'}
            placeholder={t('formSearch.contentSearchPlaceholder') || 'Search in form content...'}
            value={fullTextSearch}
            onChange={(e) => setFullTextSearch(e.currentTarget.value)}
            leftSection={<IconFilter size={16} />}
            data-testid="fulltext-search-input"
          />
        </Grid.Col>

        {/* Date From */}
        <Grid.Col span={{ base: 6, sm: 6, md: 2 }}>
          <DateInput
            label={t('formSearch.dateFrom') || 'From Date'}
            placeholder={t('formSearch.selectDate') || 'Select date'}
            value={dateFrom}
            onChange={handleDateFromChange}
            maxDate={dateTo || undefined}
            clearable
            data-testid="date-from-input"
          />
        </Grid.Col>

        {/* Date To */}
        <Grid.Col span={{ base: 6, sm: 6, md: 2 }}>
          <DateInput
            label={t('formSearch.dateTo') || 'To Date'}
            placeholder={t('formSearch.selectDate') || 'Select date'}
            value={dateTo}
            onChange={handleDateToChange}
            minDate={dateFrom || undefined}
            clearable
            data-testid="date-to-input"
          />
        </Grid.Col>

        {/* Status Filter */}
        <Grid.Col span={{ base: 6, sm: 6, md: 2 }}>
          <Select
            label={t('formSearch.status') || 'Status'}
            placeholder={t('formSearch.selectStatus') || 'Select status'}
            data={translatedStatusOptions}
            value={searchParams.status as string || ''}
            onChange={handleStatusChange}
            clearable
            data-testid="status-select"
          />
        </Grid.Col>

        {/* Form Type Filter */}
        {showFormTypeFilter && (
          <Grid.Col span={{ base: 6, sm: 6, md: 3 }}>
            <Select
              label={t('formSearch.formType') || 'Form Type'}
              placeholder={t('formSearch.selectFormType') || 'Select form type'}
              data={questionnaireOptions}
              value={searchParams.questionnaireId || ''}
              onChange={handleQuestionnaireChange}
              searchable
              clearable
              disabled={loadingQuestionnaires}
              data-testid="form-type-select"
            />
          </Grid.Col>
        )}

        {/* Action Buttons */}
        <Grid.Col span={{ base: 12, sm: 12, md: showFormTypeFilter ? 3 : 2 }}>
          <Box style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
            <Group gap="xs" style={{ width: '100%' }}>
              {onSearch && (
                <Button
                  leftSection={<IconSearch size={16} />}
                  onClick={onSearch}
                  style={{
                    background: 'var(--emr-gradient-primary)',
                  }}
                  data-testid="search-button"
                >
                  {t('formSearch.search') || 'Search'}
                </Button>
              )}
              <Button
                variant="outline"
                leftSection={<IconX size={16} />}
                onClick={handleClearFilters}
                disabled={!hasActiveFilters}
                data-testid="clear-filters-button"
              >
                {t('formSearch.clearFilters') || 'Clear'}
              </Button>
            </Group>
          </Box>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}

export default FormSearchFilters;
