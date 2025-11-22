// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Modal, Text, Group, Button } from '@mantine/core';
import type { ActivityDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';

interface ManipulationDeletionModalProps {
  /** Manipulation to delete */
  manipulation: ActivityDefinition | null;
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
 * ManipulationDeletionModal Component
 * @param root0
 * @param root0.manipulation
 * @param root0.opened
 * @param root0.onClose
 * @param root0.onConfirm
 * @param root0.loading
 */
export function ManipulationDeletionModal({
  manipulation,
  opened,
  onClose,
  onConfirm,
  loading,
}: ManipulationDeletionModalProps): JSX.Element {
  const { t } = useTranslation();

  const handleConfirm = async (): Promise<void> => {
    if (!manipulation?.id) {return;}
    await onConfirm(manipulation.id);
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
        {manipulation?.title || manipulation?.code?.text}
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
