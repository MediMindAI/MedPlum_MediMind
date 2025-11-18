// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Text, Group, Button, Radio, Stack } from '@mantine/core';
import type { JSX } from 'react';
import { useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '../../hooks/useTranslation';
import { deleteService, hardDeleteService } from '../../services/nomenclatureService';
import type { ServiceTableRow } from '../../types/nomenclature';

interface ServiceDeletionModalProps {
  opened: boolean;
  onClose: () => void;
  service: ServiceTableRow | null;
  onSuccess: () => void;
}

/**
 * Confirmation modal for deleting medical services
 * Supports both soft delete (status='retired') and hard delete (permanent removal)
 */
export function ServiceDeletionModal({
  opened,
  onClose,
  service,
  onSuccess,
}: ServiceDeletionModalProps): JSX.Element {
  const { t } = useTranslation();
  const medplum = useMedplum();
  const [loading, setLoading] = useState(false);
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');

  const handleDelete = async () => {
    if (!service) return;

    setLoading(true);

    try {
      if (deleteType === 'soft') {
        // Soft delete: set status to 'retired'
        await deleteService(medplum, service.id);
        notifications.show({
          title: t('common.success'),
          message: t('nomenclature.medical1.delete.softDeleteSuccess'),
          color: 'green',
        });
      } else {
        // Hard delete: permanently remove
        await hardDeleteService(medplum, service.id);
        notifications.show({
          title: t('common.success'),
          message: t('nomenclature.medical1.delete.hardDeleteSuccess'),
          color: 'green',
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete service';
      notifications.show({
        title: t('common.error'),
        message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={t('nomenclature.medical1.delete.title')} size="md" centered>
      <Stack gap="md">
        <Text>{t('nomenclature.medical1.delete.message')}</Text>

        {service && (
          <Stack gap="xs">
            <Group gap="xs">
              <Text fw={600}>{t('nomenclature.medical1.delete.serviceName')}:</Text>
              <Text>{service.name}</Text>
            </Group>
            <Group gap="xs">
              <Text fw={600}>{t('nomenclature.medical1.form.code')}:</Text>
              <Text>{service.code}</Text>
            </Group>
          </Stack>
        )}

        <Radio.Group
          value={deleteType}
          onChange={(value) => setDeleteType(value as 'soft' | 'hard')}
          label={t('nomenclature.medical1.delete.deleteTypeLabel')}
        >
          <Stack mt="xs" gap="xs">
            <Radio
              value="soft"
              label={t('nomenclature.medical1.delete.softDeleteLabel')}
              description={t('nomenclature.medical1.delete.softDeleteDescription')}
            />
            <Radio
              value="hard"
              label={t('nomenclature.medical1.delete.hardDeleteLabel')}
              description={t('nomenclature.medical1.delete.hardDeleteDescription')}
              color="red"
            />
          </Stack>
        </Radio.Group>

        {deleteType === 'hard' && (
          <Text c="red" size="sm" fw={600}>
            {t('nomenclature.medical1.delete.hardDeleteWarning')}
          </Text>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('nomenclature.medical1.delete.cancel')}
          </Button>
          <Button color={deleteType === 'hard' ? 'red' : 'blue'} onClick={handleDelete} loading={loading}>
            {deleteType === 'hard'
              ? t('nomenclature.medical1.delete.permanentDelete')
              : t('nomenclature.medical1.delete.softDelete')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
