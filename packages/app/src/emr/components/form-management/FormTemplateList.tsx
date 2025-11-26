// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Badge, Group, Text, Stack } from '@mantine/core';
import { EMRTextInput, EMRSelect } from '../shared/EMRFormFields';
import { IconEdit, IconCopy, IconArchive, IconHistory, IconArchiveOff, IconSearch, IconFolderOpen } from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import type { Questionnaire } from '@medplum/fhirtypes';
import { useTranslation } from '../../hooks/useTranslation';
import { useDebouncedValue } from '@mantine/hooks';
import { EMRTable } from '../shared/EMRTable';
import type { EMRTableColumn } from '../shared/EMRTable';
import serviceGroupsData from '../../translations/service-groups.json';
import formTypesData from '../../translations/form-types.json';

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

// Extended type for table data
interface FormTableRow extends Questionnaire {
  id: string;
}

/**
 * FormTemplateList Component
 *
 * Table view for displaying form templates with search and filter capabilities.
 * Now using the reusable EMRTable component for consistent styling.
 *
 * Features:
 * - Apple-inspired light/minimal design
 * - Search by name (debounced 500ms)
 * - Filter by status
 * - Combined action pattern (Edit visible, others in menu)
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

  // Get form group name from extension
  const getFormGroupName = (questionnaire: Questionnaire): string => {
    const groupValue = questionnaire.extension?.find((ext) => ext.url === 'http://medimind.ge/form-group')?.valueString;
    if (!groupValue) return '-';
    const group = serviceGroupsData.groups.find((g) => g.value === groupValue);
    return group ? group[lang as 'ka' | 'en' | 'ru'] : '-';
  };

  // Get form type name from extension
  const getFormTypeName = (questionnaire: Questionnaire): string => {
    const typeValue = questionnaire.extension?.find((ext) => ext.url === 'http://medimind.ge/form-type')?.valueString;
    if (!typeValue) return '-';
    const type = formTypesData.formTypes.find((t) => t.value === typeValue);
    return type ? type[lang as 'ka' | 'en' | 'ru'] : '-';
  };

  // Filter and search questionnaires
  const filteredQuestionnaires = useMemo(() => {
    let filtered = questionnaires.filter((q): q is FormTableRow => !!q.id);

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

  // Define columns using EMRTable column type
  const columns: EMRTableColumn<FormTableRow>[] = [
    {
      key: 'title',
      title: t('formManagement.columns.name'),
      sortable: true,
      minWidth: 200,
      render: (row) => (
        <Text fw={500} size="sm">
          {row.title || t('formManagement.untitled')}
        </Text>
      ),
    },
    {
      key: 'description',
      title: t('formManagement.columns.description'),
      hideOnMobile: true,
      render: (row) => (
        <Text size="sm" c="dimmed" lineClamp={1}>
          {row.description || '-'}
        </Text>
      ),
    },
    {
      key: 'formGroup',
      title: t('formManagement.columns.group'),
      width: 150,
      render: (row) => (
        <Text size="sm">
          {getFormGroupName(row)}
        </Text>
      ),
    },
    {
      key: 'formType',
      title: t('formManagement.columns.formType'),
      width: 150,
      render: (row) => (
        <Text size="sm">
          {getFormTypeName(row)}
        </Text>
      ),
    },
    {
      key: 'version',
      title: t('formManagement.columns.version'),
      width: 80,
      align: 'center',
      render: (row) => (
        <Badge variant="light" color="blue" size="sm" radius="sm" style={{ fontWeight: 500 }}>
          V{row.version || '1.0'}
        </Badge>
      ),
    },
    {
      key: 'status',
      title: t('formManagement.columns.status'),
      width: 100,
      align: 'center',
      render: (row) => (
        <Badge color={getStatusColor(row.status || 'draft')} size="sm">
          {getStatusLabel(row.status || 'draft')}
        </Badge>
      ),
    },
    {
      key: 'lastModified',
      title: t('formManagement.columns.lastModified'),
      width: 160,
      hideOnMobile: true,
      render: (row) => (
        <Text size="sm">{formatDate(row.meta?.lastUpdated || row.date)}</Text>
      ),
    },
  ];

  return (
    <Stack gap="md">
      {/* Search and Filter Controls */}
      <Group gap="md">
        <EMRTextInput
          placeholder={t('formManagement.searchPlaceholder')}
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={setSearchQuery}
          style={{ flex: 1, maxWidth: 400 }}
          data-testid="search-input"
        />
        <EMRSelect
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

      {/* EMRTable with modern styling */}
      <EMRTable
        columns={columns}
        data={filteredQuestionnaires}
        loading={loading}
        loadingConfig={{ rows: 5 }}
        striped
        stickyHeader
        minWidth={700}
        getRowId={(row) => row.id}
        onRowClick={onRowClick ? (row) => onRowClick(row.id) : undefined}
        highlightRow={(row) => row.status === 'retired' ? 'rgba(0, 0, 0, 0.04)' : false}
        emptyState={{
          icon: IconFolderOpen,
          title: t('formManagement.noResults'),
          description: t('formManagement.noResultsDescription'),
        }}
        actions={(row) => {
          const id = row.id;
          const isArchived = row.status === 'retired';

          return {
            primary: onEdit
              ? { icon: IconEdit, label: t('formManagement.actions.edit'), onClick: () => onEdit(id) }
              : undefined,
            secondary: [
              ...(onClone
                ? [{ icon: IconCopy, label: t('formManagement.actions.clone'), onClick: () => onClone(id) }]
                : []),
              ...(onViewHistory
                ? [{ icon: IconHistory, label: t('formManagement.actions.viewHistory'), onClick: () => onViewHistory(id) }]
                : []),
              ...(isArchived && onRestore
                ? [{ icon: IconArchiveOff, label: t('formManagement.actions.restore'), onClick: () => onRestore(id), color: 'green' as const }]
                : []),
              ...(!isArchived && onArchive
                ? [{ icon: IconArchive, label: t('formManagement.actions.archive'), onClick: () => onArchive(id), color: 'gray' as const }]
                : []),
            ],
          };
        }}
        ariaLabel="Form templates table"
      />
    </Stack>
  );
}
