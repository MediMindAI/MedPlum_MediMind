/**
 * Syringe Deletion Modal Component
 *
 * Confirmation dialog for deleting syringe/container types.
 */

import React from 'react';
import { Modal, Text, Group, Button } from '@mantine/core';
import { DeviceDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';

interface SyringeDeletionModalProps {
  /** Syringe to delete */
  syringe: DeviceDefinition | null;
  /** Modal open state */
  opened: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Callback when deletion is confirmed */
  onConfirm: (id: string) => Promise<void>;
  /** Loading state during deletion */
  loading?: boolean;
}

/**
 * SyringeDeletionModal Component
 */
export function SyringeDeletionModal({
  syringe,
  opened,
  onClose,
  onConfirm,
  loading,
}: SyringeDeletionModalProps): JSX.Element {
  const { t } = useTranslation();

  const handleConfirm = async (): Promise<void> => {
    if (!syringe?.id) return;
    await onConfirm(syringe.id);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('laboratory.action.delete')}
      centered
    >
      <Text mb="lg">
        {t('laboratory.confirm.delete')}
      </Text>
      <Text mb="lg" fw={600}>
        {syringe?.deviceName?.[0]?.name}
      </Text>
      <Group justify="flex-end" gap="sm">
        <Button
          variant="default"
          onClick={onClose}
          disabled={loading}
        >
          {t('laboratory.confirm.no')}
        </Button>
        <Button
          color="red"
          onClick={handleConfirm}
          loading={loading}
        >
          {t('laboratory.confirm.yes')}
        </Button>
      </Group>
    </Modal>
  );
}
