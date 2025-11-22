// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Modal, Text, Group, Button } from '@mantine/core';
import type { SpecimenDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';

interface SampleDeletionModalProps {
  /** Sample to delete */
  sample: SpecimenDefinition | null;
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
 * SampleDeletionModal Component
 * @param root0
 * @param root0.sample
 * @param root0.opened
 * @param root0.onClose
 * @param root0.onConfirm
 * @param root0.loading
 */
export function SampleDeletionModal({
  sample,
  opened,
  onClose,
  onConfirm,
  loading,
}: SampleDeletionModalProps): JSX.Element {
  const { t } = useTranslation();

  const handleConfirm = async (): Promise<void> => {
    if (!sample?.id) {return;}
    await onConfirm(sample.id);
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
        {sample?.typeCollected?.text}
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
