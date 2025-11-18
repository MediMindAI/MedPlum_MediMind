// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Paper, Text, Group, Stack, Box, Button } from '@mantine/core';
import { IconFileSpreadsheet } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type { JSX } from 'react';
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNomenclature } from '../../hooks/useNomenclature';
import { ServiceEntryForm } from '../../components/nomenclature/ServiceEntryForm';
import { ServiceTable } from '../../components/nomenclature/ServiceTable';
import { ServiceEditModal } from '../../components/nomenclature/ServiceEditModal';
import { ServiceDeletionModal } from '../../components/nomenclature/ServiceDeletionModal';
import { ServiceFilters } from '../../components/nomenclature/ServiceFilters';
import { exportServicesToExcel } from '../../services/excelExportService';
import type { ServiceTableRow } from '../../types/nomenclature';

/**
 * Main Nomenclature Medical 1 page component
 *
 * Features:
 * - Inline service entry form (create/edit)
 * - Advanced search and filtering
 * - Service data table with sorting
 * - Edit and delete actions
 * - Excel export capability
 * - Record count display
 */
export function NomenclatureMedical1View(): JSX.Element {
  const { t, lang } = useTranslation();

  // Use custom hook for data management
  const {
    services,
    loading,
    error,
    searchParams,
    totalCount,
    sortField,
    sortOrder,
    searchServices,
    refreshServices,
    handleSort,
    clearFilters,
  } = useNomenclature();

  // Edit mode state
  const [editingService, setEditingService] = useState<ServiceTableRow | null>(null);

  // Modal states
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<ServiceTableRow | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceTableRow | null>(null);

  /**
   * Handle service created or updated successfully
   */
  const handleServiceSuccess = () => {
    refreshServices();
    // Reset form to create mode
    setEditingService(null);
  };

  /**
   * Handle edit button click from table
   */
  const handleEdit = (service: ServiceTableRow) => {
    setServiceToEdit(service);
    setEditModalOpened(true);
  };

  /**
   * Handle delete button click from table
   */
  const handleDelete = (service: ServiceTableRow) => {
    setServiceToDelete(service);
    setDeleteModalOpened(true);
  };

  /**
   * Handle modal close
   */
  const handleEditModalClose = () => {
    setEditModalOpened(false);
    setServiceToEdit(null);
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpened(false);
    setServiceToDelete(null);
  };

  /**
   * Handle successful edit or delete
   */
  const handleModalSuccess = () => {
    refreshServices();
  };

  /**
   * Handle Excel export
   */
  const handleExcelExport = () => {
    try {
      if (services.length === 0) {
        notifications.show({
          title: t('nomenclature.error.exportFailed'),
          message: t('nomenclature.medical1.empty.noServices'),
          color: 'orange',
        });
        return;
      }

      // Export all currently displayed services
      exportServicesToExcel(services, {}, lang);

      notifications.show({
        title: t('common.success'),
        message: t('nomenclature.success.exported', { count: services.length }),
        color: 'green',
      });
    } catch (error) {
      console.error('Excel export failed:', error);
      notifications.show({
        title: t('nomenclature.error.exportFailed'),
        message: error instanceof Error ? error.message : 'Unknown error',
        color: 'red',
      });
    }
  };

  return (
    <Box style={{ height: '100%', overflow: 'auto' }}>
      <Stack gap="md" p="md">
        {/* Page Title and Actions */}
        <Group justify="space-between" align="center">
          <Text size="xl" fw={700}>
            {t('menu.nomenclature.nomenclature')}
          </Text>
          <Group gap="sm">
            <Button
              variant="light"
              leftSection={<IconFileSpreadsheet size={16} />}
              onClick={handleExcelExport}
            >
              {t('common.exportExcel')}
            </Button>
            <Text c="dimmed" size="sm">
              {t('common.recordCount', { count: totalCount })}
            </Text>
          </Group>
        </Group>

        {/* Error Alert */}
        {error && (
          <Paper bg="red.1" p="md" withBorder>
            <Text c="red" fw={600}>
              {t('nomenclature.error.loadFailed')}
            </Text>
            <Text c="red" size="sm">
              {error}
            </Text>
          </Paper>
        )}

        {/* Section 1: Service Entry Form (Inline Create/Edit) */}
        <Paper withBorder>
          <ServiceEntryForm
            serviceToEdit={editingService?.resource}
            isEditMode={!!editingService}
            onSuccess={handleServiceSuccess}
          />
        </Paper>

        {/* Section 2: Service Filters (Search/Filter Section) */}
        <ServiceFilters
          onSearch={searchServices}
          onClear={clearFilters}
          onExport={handleExcelExport}
          loading={loading}
        />

        {/* Section 3: Service Table */}
        <Paper withBorder>
          <ServiceTable
            services={services}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
          />
        </Paper>

        {/* Section 4: Record Count (Bottom Right) */}
        <Group justify="flex-end">
          <Text c="dimmed" size="sm" fw={500}>
            ხაზზე ({totalCount})
          </Text>
        </Group>
      </Stack>

      {/* Modals */}
      <ServiceEditModal
        opened={editModalOpened}
        onClose={handleEditModalClose}
        service={serviceToEdit}
        onSuccess={handleModalSuccess}
      />

      <ServiceDeletionModal
        opened={deleteModalOpened}
        onClose={handleDeleteModalClose}
        service={serviceToDelete}
        onSuccess={handleModalSuccess}
      />
    </Box>
  );
}
