// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Table, Badge, ActionIcon, Group, Text, Tooltip, TextInput, Select, Box, Skeleton, Stack } from '@mantine/core';
import { IconEdit, IconCopy, IconArchive, IconHistory, IconArchiveOff, IconSearch } from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import type { Questionnaire } from '@medplum/fhirtypes';
import { useTranslation } from '../../hooks/useTranslation';
import { useDebouncedValue } from '@mantine/hooks';

/**
 * Props for FormTemplateList component
 */
export interface FormTemplateListProps {
  /** Array of FHIR Questionnaire resources */
  questionnaires: Questionnaire[];
  /** Whether data is loading */
  loading?: boolean;
  /** Callback when edit action is clicked */
  onEdit?: (id: string) => void;
  /** Callback when clone action is clicked */
  onClone?: (id: string) => void;
  /** Callback when archive action is clicked */
  onArchive?: (id: string) => void;
  /** Callback when restore action is clicked */
  onRestore?: (id: string) => void;
  /** Callback when view history action is clicked */
  onViewHistory?: (id: string) => void;
  /** Callback when row is clicked */
  onRowClick?: (id: string) => void;
  /** Show archived forms */
  showArchived?: boolean;
}

/**
 * FormTemplateList Component
 *
 * Table view for displaying form templates with search and filter capabilities.
 *
 * Columns:
 * - Name
 * - Description
 * - Version
 * - Status (draft/active/retired)
 * - Last Modified
 * - Actions (Edit, Clone, Archive, History)
 *
 * Features:
 * - Search by name (debounced 500ms)
 * - Filter by status
 * - Sortable columns
 * - Loading skeleton
 */
export function FormTemplateList({
  questionnaires,
  loading = false,
  onEdit,
  onClone,
  onArchive,
  onRestore,
  onViewHistory,
  onRowClick,
  showArchived = false,
}: FormTemplateListProps): JSX.Element {
  const { t, lang } = useTranslation();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(searchQuery, 500);

  // Format date based on language
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(lang === 'ka' ? 'ka-GE' : lang === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'green';
      case 'draft':
        return 'blue';
      case 'retired':
        return 'gray';
      default:
        return 'gray';
    }
  };

  // Get status label
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active':
        return t('formManagement.status.active');
      case 'draft':
        return t('formManagement.status.draft');
      case 'retired':
        return t('formManagement.status.archived');
      default:
        return status;
    }
  };

  // Filter and search questionnaires
  const filteredQuestionnaires = useMemo(() => {
    let filtered = questionnaires;

    // Filter by archived status
    if (!showArchived) {
      filtered = filtered.filter((q) => q.status !== 'retired');
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter((q) => q.status === statusFilter);
    }

    // Filter by search query
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.title?.toLowerCase().includes(searchLower) ||
          q.description?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [questionnaires, showArchived, statusFilter, debouncedSearch]);

  // Status filter options
  const statusOptions = [
    { value: 'draft', label: t('formManagement.status.draft') },
    { value: 'active', label: t('formManagement.status.active') },
    ...(showArchived ? [{ value: 'retired', label: t('formManagement.status.archived') }] : []),
  ];

  // Loading skeleton
  if (loading) {
    return (
      <Stack gap="md">
        <Group gap="md">
          <Skeleton height={36} width={300} />
          <Skeleton height={36} width={150} />
        </Group>
        <Skeleton height={40} />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} height={50} />
        ))}
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {/* Search and Filter Controls */}
      <Group gap="md">
        <TextInput
          placeholder={t('formManagement.searchPlaceholder')}
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1, maxWidth: 400 }}
          data-testid="search-input"
        />
        <Select
          placeholder={t('formManagement.filterByStatus')}
          data={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          style={{ width: 180 }}
          data-testid="status-filter"
        />
      </Group>

      {/* Results count */}
      <Text size="sm" c="dimmed">
        {t('formManagement.resultsCount', { count: filteredQuestionnaires.length })}
      </Text>

      {/* Table */}
      <Box style={{ overflowX: 'auto' }}>
        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          data-testid="form-template-table"
        >
          <Table.Thead
            style={{
              background: 'linear-gradient(90deg, #138496, #17a2b8, #20c4dd)',
            }}
          >
            <Table.Tr>
              <Table.Th style={{ color: 'white', fontWeight: 600 }}>
                {t('formManagement.columns.name')}
              </Table.Th>
              <Table.Th style={{ color: 'white', fontWeight: 600 }}>
                {t('formManagement.columns.description')}
              </Table.Th>
              <Table.Th style={{ color: 'white', fontWeight: 600, width: 100 }}>
                {t('formManagement.columns.version')}
              </Table.Th>
              <Table.Th style={{ color: 'white', fontWeight: 600, width: 100 }}>
                {t('formManagement.columns.status')}
              </Table.Th>
              <Table.Th style={{ color: 'white', fontWeight: 600, width: 180 }}>
                {t('formManagement.columns.lastModified')}
              </Table.Th>
              <Table.Th style={{ color: 'white', fontWeight: 600, width: 150 }}>
                {t('formManagement.columns.actions')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredQuestionnaires.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" c="dimmed" py="xl">
                    {t('formManagement.noResults')}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              filteredQuestionnaires.map((q) => {
                const id = q.id || '';
                const isArchived = q.status === 'retired';

                return (
                  <Table.Tr
                    key={id}
                    style={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      opacity: isArchived ? 0.6 : 1,
                    }}
                    onClick={() => onRowClick && id && onRowClick(id)}
                    data-testid={`row-${id}`}
                  >
                    <Table.Td>
                      <Text fw={500} lineClamp={1}>
                        {q.title || t('formManagement.untitled')}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed" lineClamp={1}>
                        {q.description || '-'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="cyan" size="sm">
                        v{q.version || '1.0'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(q.status || 'draft')} size="sm">
                        {getStatusLabel(q.status || 'draft')}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatDate(q.meta?.lastUpdated || q.date)}</Text>
                    </Table.Td>
                    <Table.Td onClick={(e) => e.stopPropagation()}>
                      <Group gap="xs" wrap="nowrap">
                        {onEdit && (
                          <Tooltip label={t('formManagement.actions.edit')}>
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => onEdit(id)}
                              data-testid={`edit-btn-${id}`}
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}

                        {onClone && (
                          <Tooltip label={t('formManagement.actions.clone')}>
                            <ActionIcon
                              variant="subtle"
                              color="teal"
                              onClick={() => onClone(id)}
                              data-testid={`clone-btn-${id}`}
                            >
                              <IconCopy size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}

                        {onViewHistory && (
                          <Tooltip label={t('formManagement.actions.viewHistory')}>
                            <ActionIcon
                              variant="subtle"
                              color="violet"
                              onClick={() => onViewHistory(id)}
                              data-testid={`history-btn-${id}`}
                            >
                              <IconHistory size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}

                        {isArchived && onRestore ? (
                          <Tooltip label={t('formManagement.actions.restore')}>
                            <ActionIcon
                              variant="subtle"
                              color="green"
                              onClick={() => onRestore(id)}
                              data-testid={`restore-btn-${id}`}
                            >
                              <IconArchiveOff size={16} />
                            </ActionIcon>
                          </Tooltip>
                        ) : (
                          onArchive && (
                            <Tooltip label={t('formManagement.actions.archive')}>
                              <ActionIcon
                                variant="subtle"
                                color="orange"
                                onClick={() => onArchive(id)}
                                data-testid={`archive-btn-${id}`}
                              >
                                <IconArchive size={16} />
                              </ActionIcon>
                            </Tooltip>
                          )
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
      </Box>
    </Stack>
  );
}
