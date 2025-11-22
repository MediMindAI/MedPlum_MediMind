// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Box, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMedplum } from '@medplum/react-hooks';
import type { ObservationDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';
import { useResearchComponents } from '../../../hooks/useResearchComponents';
import { createResearchComponent, updateResearchComponent, deleteResearchComponent } from '../../../services/researchComponentService';
import type { ComponentSearchFilters, ResearchComponentFormValues } from '../../../types/laboratory';
import { ComponentEntryForm } from '../research-components/ComponentEntryForm';
import { ComponentSearchForm } from '../research-components/ComponentSearchForm';
import { ResearchComponentTable } from '../research-components/ResearchComponentTable';
import { ComponentEditModal } from '../research-components/ComponentEditModal';
import { ComponentDeletionModal } from '../research-components/ComponentDeletionModal';

/**
 * Research Components Tab with full search and CRUD functionality
 */
export function ResearchComponentsTab(): JSX.Element {
  const { t } = useTranslation();
  const medplum = useMedplum();

  // Search filters state
  const [filters, setFilters] = useState<ComponentSearchFilters>({
    status: 'active',
  });

  // Fetch components with current filters
  const { components, loading, error, refresh, count } = useResearchComponents(filters);

  // Modal state
  const [editingComponent, setEditingComponent] = useState<ObservationDefinition | null>(null);
  const [deletingComponent, setDeletingComponent] = useState<ObservationDefinition | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Add new component
  const handleAdd = async (values: ResearchComponentFormValues): Promise<void> => {
    setSaving(true);
    try {
      await createResearchComponent(medplum, values);
      notifications.show({
        title: t('laboratory.components.success.created'),
        message: values.name,
        color: 'green',
      });
      await refresh();
    } catch (err) {
      notifications.show({
        title: t('laboratory.components.error.createFailed'),
        message: err instanceof Error ? err.message : 'Unknown error',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  // Edit component
  const handleEdit = (component: ObservationDefinition): void => {
    setEditingComponent(component);
  };

  // Save edited component
  const handleSave = async (id: string, values: ResearchComponentFormValues): Promise<void> => {
    setSaving(true);
    try {
      await updateResearchComponent(medplum, id, values);
      notifications.show({
        title: t('laboratory.components.success.updated'),
        message: values.name,
        color: 'green',
      });
      await refresh();
    } catch (err) {
      notifications.show({
        title: t('laboratory.components.error.updateFailed'),
        message: err instanceof Error ? err.message : 'Unknown error',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete component
  const handleDelete = (component: ObservationDefinition): void => {
    setDeletingComponent(component);
  };

  // Confirm deletion
  const handleConfirmDelete = async (id: string): Promise<void> => {
    setDeleting(true);
    try {
      await deleteResearchComponent(medplum, id);
      notifications.show({
        title: t('laboratory.components.success.deleted'),
        message: t('laboratory.components.success.deletedMessage'),
        color: 'green',
      });
      await refresh();
    } catch (err) {
      notifications.show({
        title: t('laboratory.components.error.deleteFailed'),
        message: err instanceof Error ? err.message : 'Unknown error',
        color: 'red',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Search button clicked
  const handleSearch = (): void => {
    refresh();
  };

  // Refresh button clicked
  const handleRefresh = (): void => {
    setFilters({ status: 'active' });
    refresh();
  };

  if (error) {
    return (
      <Box p="xl" style={{ textAlign: 'center' }}>
        <Text c="red">{t('laboratory.components.error.loadFailed')}: {error}</Text>
      </Box>
    );
  }

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with record count */}
      <Box
        p="md"
        style={{
          borderBottom: '1px solid #dee2e6',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Text fw={600} size="lg">
          {t('laboratory.components.title')}
        </Text>
        <Text size="sm" c="dimmed">
          {t('laboratory.recordCount', { count })}
        </Text>
      </Box>

      {/* Add Form */}
      <ComponentEntryForm onSubmit={handleAdd} loading={saving} />

      {/* Search Filters */}
      <ComponentSearchForm
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
        onRefresh={handleRefresh}
      />

      {/* Table */}
      <Box style={{ flex: 1, overflow: 'auto' }}>
        <ResearchComponentTable
          components={components}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </Box>

      {/* Edit Modal */}
      <ComponentEditModal
        component={editingComponent}
        onClose={() => setEditingComponent(null)}
        onSave={handleSave}
        loading={saving}
      />

      {/* Delete Modal */}
      <ComponentDeletionModal
        component={deletingComponent}
        onClose={() => setDeletingComponent(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </Box>
  );
}
