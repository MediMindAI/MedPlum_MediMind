// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Stack,
  Title,
  Text,
  Alert,
  Group,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useMedplum } from '@medplum/react-hooks';
import type { Patient, Questionnaire, QuestionnaireResponse } from '@medplum/fhirtypes';
import { useTranslation } from '../../hooks/useTranslation';
import { FormSearchFilters } from '../../components/form-search/FormSearchFilters';
import { FormResultsTable } from '../../components/form-search/FormResultsTable';
import {
  searchQuestionnaireResponses,
  fetchAvailableQuestionnaires,
  type FormSearchParams,
  type FormSearchResult,
} from '../../services/formRendererService';

/**
 * Default page size for search results
 */
const DEFAULT_PAGE_SIZE = 100;

/**
 * Maximum results limit
 */
const MAX_RESULTS = 1000;

/**
 * FormSearchView Component
 *
 * Main view for searching and browsing QuestionnaireResponses.
 * Features:
 * - Search filters (patient, date range, form type, status)
 * - Results table with pagination
 * - Sortable columns
 * - Navigation to FormViewerView on row click
 *
 * Route: /emr/forms/search
 */
export function FormSearchView(): JSX.Element {
  const { t } = useTranslation();
  const medplum = useMedplum();
  const navigate = useNavigate();

  // Search state
  const [searchParams, setSearchParams] = useState<FormSearchParams>({
    _count: DEFAULT_PAGE_SIZE,
    _offset: 0,
  });
  const [searchResult, setSearchResult] = useState<FormSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<string>('authored');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Cached resources
  const [patients, setPatients] = useState<Map<string, Patient>>(new Map());
  const [questionnaires, setQuestionnaires] = useState<Map<string, Questionnaire>>(new Map());
  const [availableQuestionnaires, setAvailableQuestionnaires] = useState<Questionnaire[]>([]);

  // Current page (1-indexed)
  const currentPage = useMemo(() => {
    const offset = searchParams._offset || 0;
    const count = searchParams._count || DEFAULT_PAGE_SIZE;
    return Math.floor(offset / count) + 1;
  }, [searchParams._offset, searchParams._count]);

  // Fetch available questionnaires on mount
  useEffect(() => {
    fetchAvailableQuestionnaires(medplum)
      .then((qs) => {
        setAvailableQuestionnaires(qs);
        // Build questionnaire map
        const qMap = new Map<string, Questionnaire>();
        for (const q of qs) {
          if (q.id) {
            qMap.set(q.id, q);
            qMap.set(`Questionnaire/${q.id}`, q);
          }
        }
        setQuestionnaires(qMap);
      })
      .catch(console.error);
  }, [medplum]);

  // Perform search
  const performSearch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build sort parameter
      const sortParam = sortDirection === 'desc' ? `-${sortField}` : sortField;

      const result = await searchQuestionnaireResponses(medplum, {
        ...searchParams,
        _sort: sortParam,
      });

      setSearchResult(result);

      // Extract and cache patients from included resources
      // Note: The search service includes patients via _include
      const patientMap = new Map(patients);
      for (const response of result.responses) {
        if (response.subject?.reference) {
          const patientId = response.subject.reference.replace('Patient/', '');
          if (!patientMap.has(patientId)) {
            try {
              const patient = await medplum.readResource('Patient', patientId);
              patientMap.set(patientId, patient);
              patientMap.set(response.subject.reference, patient);
            } catch {
              // Patient not found, continue
            }
          }
        }
      }
      setPatients(patientMap);
    } catch (err) {
      console.error('Search failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : t('formSearch.searchError') || 'Search failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [medplum, searchParams, sortField, sortDirection, patients, t]);

  // Trigger search on mount and when params change
  useEffect(() => {
    performSearch();
  }, [searchParams, sortField, sortDirection]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle search params change
  const handleSearchParamsChange = useCallback((params: FormSearchParams) => {
    setSearchParams((prev) => ({
      ...prev,
      ...params,
      // Reset to first page when filters change (except pagination)
      _offset: params._offset !== undefined ? params._offset : 0,
    }));
  }, []);

  // Handle manual search trigger
  const handleSearch = useCallback(() => {
    setSearchParams((prev) => ({
      ...prev,
      _offset: 0, // Reset to first page
    }));
    performSearch();
  }, [performSearch]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    const offset = (page - 1) * (searchParams._count || DEFAULT_PAGE_SIZE);
    setSearchParams((prev) => ({
      ...prev,
      _offset: offset,
    }));
  }, [searchParams._count]);

  // Handle sort change
  const handleSort = useCallback((field: string) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    // Reset to first page when sorting
    setSearchParams((prev) => ({
      ...prev,
      _offset: 0,
    }));
  }, [sortField]);

  // Handle row click
  const handleRowClick = useCallback((responseId: string) => {
    navigate(`/emr/forms/view/${responseId}`);
  }, [navigate]);

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: 'var(--emr-gray-50)',
      }}
      data-testid="form-search-view"
    >
      <Container size="xl" py="lg">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" align="center">
            <div>
              <Title order={2} style={{ color: 'var(--emr-text-primary)' }}>
                {t('formSearch.title') || 'Search Form Responses'}
              </Title>
              <Text c="dimmed" size="sm">
                {t('formSearch.subtitle') || 'Search and browse completed form responses'}
              </Text>
            </div>
          </Group>

          {/* Error Alert */}
          {error && (
            <Alert
              icon={<IconAlertCircle size={24} />}
              title={t('formSearch.error') || 'Error'}
              color="red"
              variant="light"
              withCloseButton
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Search Filters */}
          <FormSearchFilters
            searchParams={searchParams}
            onSearchParamsChange={handleSearchParamsChange}
            onSearch={handleSearch}
            questionnaires={availableQuestionnaires}
          />

          {/* Results Table */}
          <FormResultsTable
            responses={searchResult?.responses || []}
            patients={patients}
            questionnaires={questionnaires}
            loading={loading}
            total={searchResult?.total || 0}
            currentPage={currentPage}
            pageSize={searchParams._count || DEFAULT_PAGE_SIZE}
            onPageChange={handlePageChange}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onRowClick={handleRowClick}
            maxResults={MAX_RESULTS}
          />
        </Stack>
      </Container>
    </Box>
  );
}

export default FormSearchView;
