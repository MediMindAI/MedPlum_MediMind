// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo, useCallback } from 'react';
import {
  Table,
  Box,
  Text,
  Badge,
  Group,
  ActionIcon,
  Skeleton,
  Pagination,
  Stack,
  Paper,
} from '@mantine/core';
import {
  IconEye,
  IconChevronUp,
  IconChevronDown,
  IconSelector,
  IconFileText,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { QuestionnaireResponse, Patient, Questionnaire, Bundle } from '@medplum/fhirtypes';
import { useTranslation } from '../../hooks/useTranslation';
import type { QuestionnaireResponseStatus } from '../../types/form-renderer';

/**
 * Props for FormResultsTable component
 */
export interface FormResultsTableProps {
  /** QuestionnaireResponse resources */
  responses: QuestionnaireResponse[];
  /** FHIR Bundle containing included resources (patients, questionnaires) */
  includedResources?: Bundle;
  /** Map of patient ID to Patient resource */
  patients?: Map<string, Patient>;
  /** Map of questionnaire ID to Questionnaire resource */
  questionnaires?: Map<string, Questionnaire>;
  /** Whether data is loading */
  loading?: boolean;
  /** Total number of results */
  total?: number;
  /** Current page (1-indexed) */
  currentPage?: number;
  /** Results per page */
  pageSize?: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Current sort field */
  sortField?: string;
  /** Current sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Callback when sort changes */
  onSort?: (field: string) => void;
  /** Callback when row is clicked */
  onRowClick?: (responseId: string) => void;
  /** Maximum results limit */
  maxResults?: number;
}

/**
 * Status badge colors mapping
 */
const STATUS_COLORS: Record<QuestionnaireResponseStatus, string> = {
  'completed': 'green',
  'in-progress': 'blue',
  'amended': 'orange',
  'entered-in-error': 'red',
  'stopped': 'gray',
};

/**
 * FormResultsTable Component
 *
 * Displays search results for QuestionnaireResponses in a paginated table.
 * Features:
 * - Columns: Patient Name, Form Type, Date, Status, Actions
 * - Sortable columns (click header)
 * - Pagination (100 per page, max 1000 results)
 * - Row click navigates to FormViewerView
 * - Empty state message
 * - Loading skeleton
 */
export function FormResultsTable({
  responses,
  patients = new Map(),
  questionnaires = new Map(),
  loading = false,
  total = 0,
  currentPage = 1,
  pageSize = 100,
  onPageChange,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  maxResults = 1000,
}: FormResultsTableProps): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Calculate total pages
  const totalPages = useMemo(() => {
    const effectiveTotal = Math.min(total, maxResults);
    return Math.ceil(effectiveTotal / pageSize);
  }, [total, pageSize, maxResults]);

  // Handle row click
  const handleRowClick = useCallback((responseId: string) => {
    if (onRowClick) {
      onRowClick(responseId);
    } else {
      navigate(`/emr/forms/view/${responseId}`);
    }
  }, [onRowClick, navigate]);

  // Handle view action click
  const handleViewClick = useCallback((e: React.MouseEvent, responseId: string) => {
    e.stopPropagation();
    navigate(`/emr/forms/view/${responseId}`);
  }, [navigate]);

  // Render sort icon
  const renderSortIcon = useCallback((field: string) => {
    if (sortField !== field) {
      return <IconSelector size={14} />;
    }
    return sortDirection === 'asc' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />;
  }, [sortField, sortDirection]);

  // Handle sort click
  const handleSortClick = useCallback((field: string) => {
    if (onSort) {
      onSort(field);
    }
  }, [onSort]);

  // Get patient name from response
  const getPatientName = useCallback((response: QuestionnaireResponse): string => {
    if (!response.subject?.reference) {
      return t('formSearch.unknownPatient') || 'Unknown Patient';
    }
    const patientId = response.subject.reference.replace('Patient/', '');
    const patient = patients.get(patientId) || patients.get(response.subject.reference);
    if (!patient?.name?.[0]) {
      return t('formSearch.unknownPatient') || 'Unknown Patient';
    }
    const name = patient.name[0];
    return [
      ...(name.given || []),
      name.family || '',
    ].filter(Boolean).join(' ') || t('formSearch.unknownPatient') || 'Unknown Patient';
  }, [patients, t]);

  // Get form type from response
  const getFormType = useCallback((response: QuestionnaireResponse): string => {
    if (!response.questionnaire) {
      return t('formSearch.unknownFormType') || 'Unknown Form';
    }
    const questionnaireId = response.questionnaire.replace('Questionnaire/', '');
    const questionnaire = questionnaires.get(questionnaireId) || questionnaires.get(response.questionnaire);
    return questionnaire?.title || t('formSearch.unknownFormType') || 'Unknown Form';
  }, [questionnaires, t]);

  // Format date
  const formatDate = useCallback((dateString?: string): string => {
    if (!dateString) {
      return '-';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Get status label
  const getStatusLabel = useCallback((status?: QuestionnaireResponseStatus): string => {
    if (!status) {
      return '-';
    }
    return t(`formSearch.status.${status}`) || status;
  }, [t]);

  // Render loading skeleton
  if (loading) {
    return (
      <Paper withBorder data-testid="form-results-table-loading">
        <Box style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('formSearch.columns.patientName') || 'Patient Name'}</Table.Th>
                <Table.Th>{t('formSearch.columns.formType') || 'Form Type'}</Table.Th>
                <Table.Th>{t('formSearch.columns.date') || 'Date'}</Table.Th>
                <Table.Th>{t('formSearch.columns.status') || 'Status'}</Table.Th>
                <Table.Th>{t('formSearch.columns.actions') || 'Actions'}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <Table.Tr key={index}>
                  <Table.Td><Skeleton height={20} /></Table.Td>
                  <Table.Td><Skeleton height={20} /></Table.Td>
                  <Table.Td><Skeleton height={20} /></Table.Td>
                  <Table.Td><Skeleton height={20} width={80} /></Table.Td>
                  <Table.Td><Skeleton height={20} width={40} /></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>
    );
  }

  // Render empty state
  if (responses.length === 0) {
    return (
      <Paper withBorder p="xl" data-testid="form-results-table-empty">
        <Stack align="center" gap="md">
          <IconFileText size={48} color="var(--emr-gray-400)" />
          <Text c="dimmed" size="lg">
            {t('formSearch.noResults') || 'No form responses found'}
          </Text>
          <Text c="dimmed" size="sm">
            {t('formSearch.noResultsHint') || 'Try adjusting your search filters'}
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="md" data-testid="form-results-table">
      {/* Results count */}
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {t('formSearch.resultsCount', { count: total }) ||
            `Showing ${responses.length} of ${total} results`}
          {total > maxResults && (
            <Text span c="orange" size="sm">
              {' '}({t('formSearch.limitedTo', { max: maxResults }) || `Limited to ${maxResults}`})
            </Text>
          )}
        </Text>
      </Group>

      {/* Table */}
      <Paper withBorder>
        <Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Table striped highlightOnHover style={{ minWidth: '700px' }}>
            <Table.Thead
              style={{
                background: 'var(--emr-gradient-submenu)',
              }}
            >
              <Table.Tr>
                <Table.Th
                  style={{ cursor: onSort ? 'pointer' : 'default', color: 'white' }}
                  onClick={() => handleSortClick('subject')}
                >
                  <Group gap={4}>
                    {t('formSearch.columns.patientName') || 'Patient Name'}
                    {onSort && renderSortIcon('subject')}
                  </Group>
                </Table.Th>
                <Table.Th
                  style={{ cursor: onSort ? 'pointer' : 'default', color: 'white' }}
                  onClick={() => handleSortClick('questionnaire')}
                >
                  <Group gap={4}>
                    {t('formSearch.columns.formType') || 'Form Type'}
                    {onSort && renderSortIcon('questionnaire')}
                  </Group>
                </Table.Th>
                <Table.Th
                  style={{ cursor: onSort ? 'pointer' : 'default', color: 'white' }}
                  onClick={() => handleSortClick('authored')}
                >
                  <Group gap={4}>
                    {t('formSearch.columns.date') || 'Date'}
                    {onSort && renderSortIcon('authored')}
                  </Group>
                </Table.Th>
                <Table.Th
                  style={{ cursor: onSort ? 'pointer' : 'default', color: 'white' }}
                  onClick={() => handleSortClick('status')}
                >
                  <Group gap={4}>
                    {t('formSearch.columns.status') || 'Status'}
                    {onSort && renderSortIcon('status')}
                  </Group>
                </Table.Th>
                <Table.Th style={{ color: 'white' }}>
                  {t('formSearch.columns.actions') || 'Actions'}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {responses.map((response) => (
                <Table.Tr
                  key={response.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => response.id && handleRowClick(response.id)}
                  data-testid={`form-result-row-${response.id}`}
                >
                  <Table.Td>
                    <Text fw={500}>{getPatientName(response)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text>{getFormType(response)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatDate(response.authored)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={STATUS_COLORS[response.status as QuestionnaireResponseStatus] || 'gray'}
                      variant="light"
                    >
                      {getStatusLabel(response.status as QuestionnaireResponseStatus)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={(e) => response.id && handleViewClick(e, response.id)}
                      title={t('formSearch.viewForm') || 'View Form'}
                      data-testid={`view-form-${response.id}`}
                    >
                      <IconEye size={18} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Group justify="center">
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={onPageChange}
            withEdges
            data-testid="form-results-pagination"
          />
        </Group>
      )}
    </Stack>
  );
}

export default FormResultsTable;
