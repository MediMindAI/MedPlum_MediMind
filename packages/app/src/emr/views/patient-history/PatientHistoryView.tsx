// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Paper, Text, Group, Stack, Box } from '@mantine/core';
import type { JSX } from 'react';
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { usePatientHistory } from '../../hooks/usePatientHistory';
import { PatientHistoryTable } from '../../components/patient-history/PatientHistoryTable';
import { PatientHistoryFilters } from '../../components/patient-history/PatientHistoryFilters';
import { VisitEditModal } from '../../components/patient-history/VisitEditModal';
import { DeletionConfirmationModal } from '../../components/patient-history/DeletionConfirmationModal';
import { PatientHistoryDetailModal } from '../../components/patient-history/PatientHistoryDetailModal';
import { PatientHistorySidebar } from '../../components/patient-history/PatientHistorySidebar';
import type { VisitTableRow } from '../../types/patient-history';

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
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<VisitTableRow | undefined>(undefined);

  /**
   * Handle row click to select patient and open detail modal
   * @param visitId
   */
  const handleRowClick = (visitId: string) => {
    // Find the selected visit/patient
    const visit = visits.find((v) => v.id === visitId);
    if (visit) {
      setSelectedPatient(visit);
    }
    setSelectedVisitId(visitId);
    setDetailModalOpen(true);
  };

  /**
   * Handle edit button click
   * @param visitId
   */
  const handleEdit = (visitId: string) => {
    setSelectedVisitId(visitId);
    setEditModalOpen(true);
  };

  /**
   * Handle delete button click
   * @param visitId
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
    <Box style={{ display: 'flex', height: '100%', position: 'relative' }}>
      {/* Main Content Area */}
      <Box style={{ flex: 1, overflow: 'auto' }}>
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
            onSearch={refresh}
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
              onRowClick={handleRowClick}
              selectedPatientId={selectedPatient?.id}
            />
          </Paper>
        </Stack>
      </Box>

      {/* Collapsible Right Sidebar */}
      <PatientHistorySidebar
        selectedPatient={selectedPatient}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Detail Modal (opens on row click) */}
      <PatientHistoryDetailModal
        opened={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        encounterId={selectedVisitId}
        onSuccess={handleSuccess}
      />

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
    </Box>
  );
}
