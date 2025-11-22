// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Text, Group, Button, Stack, Box } from '@mantine/core';
import type { JSX } from 'react';
import { useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '../../hooks/useTranslation';
import type { Patient } from '@medplum/fhirtypes';

interface PatientDeletionConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess: () => void;
}

/**
 * Confirmation modal for deleting patients
 * Displays patient information and confirms deletion
 * @param root0
 * @param root0.opened
 * @param root0.onClose
 * @param root0.patient
 * @param root0.onSuccess
 */
export function PatientDeletionConfirmationModal({
  opened,
  onClose,
  patient,
  onSuccess,
}: PatientDeletionConfirmationModalProps): JSX.Element {
  const { t } = useTranslation();
  const medplum = useMedplum();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!patient?.id) {return;}

    setLoading(true);

    try {
      // Hard delete the patient
      await medplum.deleteResource('Patient', patient.id);

      notifications.show({
        title: t('registration.success.title') || 'Success',
        message: t('registration.message.deleteSuccess') || 'Patient deleted successfully',
        color: 'green',
      });

      onSuccess();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete patient';
      notifications.show({
        title: t('registration.error.title') || 'Error',
        message: t('registration.message.deleteError') || message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPatientName = () => {
    if (!patient?.name?.[0]) {return '-';}
    const given = patient.name[0].given?.join(' ') || '';
    const family = patient.name[0].family || '';
    return `${given} ${family}`.trim() || '-';
  };

  const getPersonalId = () => {
    return patient?.identifier?.find(
      (id) => id.system === 'http://medimind.ge/identifiers/personal-id'
    )?.value || '-';
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('registration.button.delete') || 'Delete Patient'}
      size="md"
    >
      <Stack gap="md">
        <Text fw={500}>
          {t('registration.message.deleteConfirm') || 'Are you sure you want to delete this patient?'}
        </Text>

        {patient && (
          <Box
            p="md"
            style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
            }}
          >
            <Stack gap="xs">
              <Group>
                <Text size="sm" fw={600} c="dimmed">
                  {t('registration.field.firstName') || 'Name'}:
                </Text>
                <Text size="sm">{getPatientName()}</Text>
              </Group>
              <Group>
                <Text size="sm" fw={600} c="dimmed">
                  {t('registration.field.personalId') || 'Personal ID'}:
                </Text>
                <Text size="sm">{getPersonalId()}</Text>
              </Group>
              {patient.birthDate && (
                <Group>
                  <Text size="sm" fw={600} c="dimmed">
                    {t('registration.field.birthDate') || 'Birth Date'}:
                  </Text>
                  <Text size="sm">{patient.birthDate}</Text>
                </Group>
              )}
            </Stack>
          </Box>
        )}

        <Text c="red" size="sm" fw={600}>
          {t('registration.delete.warning') || 'This action cannot be undone!'}
        </Text>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('registration.button.cancel') || 'Cancel'}
          </Button>
          <Button
            color="red"
            onClick={handleDelete}
            loading={loading}
          >
            {t('registration.button.delete') || 'Delete'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
