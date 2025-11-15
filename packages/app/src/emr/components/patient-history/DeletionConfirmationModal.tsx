// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Text, Group, Button, Radio, Stack } from '@mantine/core';
import type { JSX } from 'react';
import { useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '../../hooks/useTranslation';
import { deleteEncounter, hardDeleteEncounter } from '../../services/patientHistoryService';

interface DeletionConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  visitId: string | null;
  onSuccess: () => void;
}

/**
 * Confirmation modal for deleting patient visits
 * Supports both soft delete (status='entered-in-error') and hard delete (permanent removal)
 */
export function DeletionConfirmationModal({
  opened,
  onClose,
  visitId,
  onSuccess,
}: DeletionConfirmationModalProps): JSX.Element {
  const { t } = useTranslation();
  const medplum = useMedplum();
  const [loading, setLoading] = useState(false);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');

  const handleDelete = async () => {
    if (!visitId) return;

    setLoading(true);

    try {
      if (deleteType === 'soft') {
        // Soft delete: set status to 'entered-in-error'
        await deleteEncounter(medplum, visitId);
        notifications.show({
          title: t('patientHistory.delete.success'),
          message: t('patientHistory.delete.softDeleteSuccess'),
          color: 'green',
        });
      } else {
        // Hard delete: permanently remove
        await hardDeleteEncounter(medplum, visitId);
        notifications.show({
          title: t('patientHistory.delete.success'),
          message: t('patientHistory.delete.hardDeleteSuccess'),
          color: 'green',
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete visit';
      notifications.show({
        title: t('patientHistory.delete.error'),
        message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('patientHistory.delete.title')}
      size="md"
    >
      <Stack gap="md">
        <Text>
          {t('patientHistory.delete.confirmMessage')}
        </Text>

        <Radio.Group
          value={deleteType}
          onChange={(value) => setDeleteType(value as 'soft' | 'hard')}
          label={t('patientHistory.delete.deleteTypeLabel')}
        >
          <Stack mt="xs" gap="xs">
            <Radio
              value="soft"
              label={t('patientHistory.delete.softDeleteLabel')}
              description={t('patientHistory.delete.softDeleteDescription')}
            />
            <Radio
              value="hard"
              label={t('patientHistory.delete.hardDeleteLabel')}
              description={t('patientHistory.delete.hardDeleteDescription')}
              color="red"
            />
          </Stack>
        </Radio.Group>

        {deleteType === 'hard' && (
          <Text c="red" size="sm" fw={600}>
            {t('patientHistory.delete.hardDeleteWarning')}
          </Text>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('patientHistory.delete.cancel')}
          </Button>
          <Button
            color={deleteType === 'hard' ? 'red' : 'blue'}
            onClick={handleDelete}
            loading={loading}
          >
            {deleteType === 'hard'
              ? t('patientHistory.delete.permanentDelete')
              : t('patientHistory.delete.softDelete')
            }
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
