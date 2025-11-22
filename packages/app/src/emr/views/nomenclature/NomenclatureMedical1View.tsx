// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Paper, Text, Stack, Box, Pagination, Center, Group } from '@mantine/core';
import { IconStethoscope } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type { JSX } from 'react';
import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNomenclature } from '../../hooks/useNomenclature';
import { ServiceEntryForm } from '../../components/nomenclature/ServiceEntryForm';
import { ServiceTable } from '../../components/nomenclature/ServiceTable';
import { ServiceEditModal } from '../../components/nomenclature/ServiceEditModal';
import { ServiceDeletionModal } from '../../components/nomenclature/ServiceDeletionModal';
import { RegisteredServicesModal } from '../../components/nomenclature/RegisteredServicesModal';
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
    page,
    sortField,
    sortOrder,
    searchServices,
    refreshServices,
    handleSort,
    clearFilters,
    setPage,
  } = useNomenclature();

  // Edit mode state
  const [editingService, setEditingService] = useState<ServiceTableRow | null>(null);

  // Modal states
  const [editModalOpened, setEditModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [registeredServicesModalOpened, setRegisteredServicesModalOpened] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<ServiceTableRow | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceTableRow | null>(null);
  const [serviceForRegisteredServices, setServiceForRegisteredServices] = useState<ServiceTableRow | null>(null);

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
   * @param service
   */
  const handleEdit = (service: ServiceTableRow) => {
    setServiceToEdit(service);
    setEditModalOpened(true);
  };

  /**
   * Handle delete button click from table
   * @param service
   */
  const handleDelete = (service: ServiceTableRow) => {
    setServiceToDelete(service);
    setDeleteModalOpened(true);
  };

  /**
   * Handle registered services button click from table
   * @param service
   */
  const handleOpenRegisteredServices = (service: ServiceTableRow) => {
    setServiceForRegisteredServices(service);
    setRegisteredServicesModalOpened(true);
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

  const handleRegisteredServicesModalClose = () => {
    setRegisteredServicesModalOpened(false);
    setServiceForRegisteredServices(null);
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
    <Box>
      <Stack gap="xl" p="md">
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
            onExcelExport={handleExcelExport}
            totalCount={totalCount}
          />
        </Paper>

        {/* Section 2: Service Filters (Search/Filter Section) */}
        <ServiceFilters onSearch={searchServices} onClear={clearFilters} loading={loading} />

        {/* Section 3: Service Table */}
        <Paper withBorder>
          <ServiceTable
            services={services}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onOpenRegisteredServices={handleOpenRegisteredServices}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
          />
        </Paper>

        {/* Section 4: Pagination */}
        {!loading && services.length > 0 && (
          <Paper
            p="lg"
            withBorder
            style={{
              background: 'white',
              border: '1px solid var(--emr-border-color, #e5e7eb)',
            }}
          >
            <Group justify="space-between" align="center" wrap="wrap">
              <Text size="sm" c="dimmed">
                {t('nomenclature.medical1.pagination.showing')}{' '}
                <Text span fw={600} c="var(--emr-text-primary)">
                  {(page - 1) * 100 + 1}
                </Text>
                {' - '}
                <Text span fw={600} c="var(--emr-text-primary)">
                  {Math.min(page * 100, totalCount)}
                </Text>
                {' '}
                {t('nomenclature.medical1.pagination.of')}{' '}
                <Text span fw={600} c="var(--emr-text-primary)">
                  {totalCount}
                </Text>
              </Text>

              <Center>
                <Pagination
                  total={Math.ceil(totalCount / 100)}
                  value={page}
                  onChange={setPage}
                  size="md"
                  withEdges
                  style={{
                    '--mantine-color-primary': 'var(--emr-primary)',
                  } as React.CSSProperties}
                />
              </Center>
            </Group>
          </Paper>
        )}

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

      <RegisteredServicesModal
        opened={registeredServicesModalOpened}
        onClose={handleRegisteredServicesModalClose}
        serviceId={serviceForRegisteredServices?.id || null}
        onSuccess={handleModalSuccess}
      />
    </Box>
  );
}
