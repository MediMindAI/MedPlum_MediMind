// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Paper, Text, Group, Stack } from '@mantine/core';
import type { JSX } from 'react';
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { usePatientHistory } from '../../hooks/usePatientHistory';
import { PatientHistoryTable } from '../../components/patient-history/PatientHistoryTable';
import { PatientHistoryFilters } from '../../components/patient-history/PatientHistoryFilters';
import { VisitEditModal } from '../../components/patient-history/VisitEditModal';
import { DeletionConfirmationModal } from '../../components/patient-history/DeletionConfirmationModal';

/**
 * Main Patient History page component
 *
 * Features:
 * - View patient visit history in 10-column table
 * - Filter by insurance company
 * - Search by personal ID, name, date range, registration number
 * - Sort by date (ascending/descending)
 * - Edit visit details (134-field modal form)
 * - Delete patient visits (soft/hard delete)
 * - Financial status highlighting (green for debt > 0)
 */
export function PatientHistoryView(): JSX.Element {
  const { t } = useTranslation();

  // Use custom hook for data management
  const {
    visits,
    loading,
    error,
    searchParams,
    setSearchParams,
    sortField,
    sortDirection,
    handleSort,
    refresh,
  } = usePatientHistory();

  // Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  /**
   * Handle edit button click
   */
  const handleEdit = (visitId: string) => {
    setSelectedVisitId(visitId);
    setEditModalOpen(true);
  };

  /**
   * Handle delete button click
   */
  const handleDelete = (visitId: string) => {
    setSelectedVisitId(visitId);
    setDeleteModalOpen(true);
  };

  /**
   * Handle successful edit/delete (refresh table)
   */
  const handleSuccess = () => {
    refresh();
  };

  return (
    <Stack gap="md" p="md">
      {/* Page Title */}
      <Group justify="space-between" align="center">
        <Text size="xl" fw={700}>
          {t('patientHistory.title')}
        </Text>
        <Text c="dimmed" size="sm">
          {t('patientHistory.recordCount', { count: visits.length })}
        </Text>
      </Group>

      {/* Error Alert */}
      {error && (
        <Paper bg="red.1" p="md" withBorder>
          <Text c="red" fw={600}>
            {t('patientHistory.error.loadFailed')}
          </Text>
          <Text c="red" size="sm">
            {error}
          </Text>
        </Paper>
      )}

      {/* Filters */}
      <PatientHistoryFilters
        searchParams={searchParams}
        onSearchParamsChange={setSearchParams}
      />

      {/* Table */}
      <Paper withBorder>
        <PatientHistoryTable
          visits={visits}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </Paper>

      {/* Edit Modal */}
      <VisitEditModal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        visitId={selectedVisitId}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeletionConfirmationModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        visitId={selectedVisitId}
        onSuccess={handleSuccess}
      />
    </Stack>
  );
}
