// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Text, Stack, Loader } from '@mantine/core';
import type { ActivityDefinition } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/react-hooks';
import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '../../hooks/useTranslation';
import { ServiceEntryForm } from './ServiceEntryForm';
import type { ServiceTableRow } from '../../types/nomenclature';

interface ServiceEditModalProps {
  /** Modal open state */
  opened: boolean;

  /** Close handler */
  onClose: () => void;

  /** Service to edit (contains full ActivityDefinition resource) */
  service: ServiceTableRow | null;

  /** Success callback (refresh table) */
  onSuccess?: () => void;
}

/**
 * Modal for editing existing medical services
 *
 * Features:
 * - Auto-fetches ActivityDefinition by ID when opened
 * - Loading state while fetching
 * - Reuses ServiceEntryForm component in edit mode
 * - Closes modal on successful save
 * - Shows error notification if fetch fails
 *
 * Based on PatientEditModal pattern for consistency.
 * @param root0
 * @param root0.opened
 * @param root0.onClose
 * @param root0.service
 * @param root0.onSuccess
 */
export function ServiceEditModal({ opened, onClose, service, onSuccess }: ServiceEditModalProps) {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const [activityDefinition, setActivityDefinition] = useState<ActivityDefinition | null>(null);
  const [loading, setLoading] = useState(true);

  // Load ActivityDefinition when modal opens
  useEffect(() => {
    if (opened && service?.id) {
      loadService();
    }
  }, [opened, service?.id]);

  const loadService = async () => {
    if (!service?.id) {return;}

    try {
      setLoading(true);
      const data = await medplum.readResource('ActivityDefinition', service.id);
      setActivityDefinition(data);
    } catch (error) {
      console.error('Error loading service:', error);
      notifications.show({
        title: t('nomenclature.error.title') || 'Error',
        message: t('nomenclature.error.loadFailed') || 'Failed to load service',
        color: 'red',
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle successful service update
   * - Close modal
   * - Call success callback to refresh table
   * @param savedService
   */
  const handleSuccess = (savedService: ActivityDefinition) => {
    onClose();
    onSuccess?.();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      centered
      title={
        <Text fw={700} size="xl" c="dark">
          {t('nomenclature.medical1.edit.title') || 'Edit Service'}
        </Text>
      }
      styles={{
        root: { zIndex: 1000 },
        inner: { paddingTop: '40px' },
        header: {
          borderBottom: '2px solid #e9ecef',
          paddingBottom: 12,
          marginBottom: 0,
          backgroundColor: 'white',
        },
        body: {
          padding: '20px 24px',
          maxHeight: 'calc(100vh - 200px)',
          overflowY: 'auto',
          backgroundColor: 'white',
        },
        content: {
          borderRadius: '12px',
        },
      }}
      closeOnEscape
      closeOnClickOutside
    >
      {loading ? (
        <Stack align="center" justify="center" gap="md" style={{ minHeight: '200px' }}>
          <Loader size="xl" color="cyan" />
          <Text size="lg" c="dimmed">
            {t('nomenclature.medical1.edit.loading') || 'Loading data...'}
          </Text>
        </Stack>
      ) : activityDefinition ? (
        <ServiceEntryForm
          serviceToEdit={activityDefinition}
          isEditMode={true}
          onSuccess={handleSuccess}
        />
      ) : (
        <Stack align="center" justify="center" gap="md" style={{ minHeight: '200px' }}>
          <Text size="lg" c="red">
            {t('nomenclature.error.notFound') || 'Service not found'}
          </Text>
        </Stack>
      )}
    </Modal>
  );
}
