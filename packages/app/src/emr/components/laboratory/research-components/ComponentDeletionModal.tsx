// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Modal, Text, Button, Box, Stack } from '@mantine/core';
import type { ObservationDefinition } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';
import { extractResearchComponentFormValues } from '../../../services/researchComponentService';

interface ComponentDeletionModalProps {
  /** Component to delete (null if modal closed) */
  component: ObservationDefinition | null;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when delete is confirmed */
  onConfirm: (id: string) => Promise<void>;
  /** Loading state during deletion */
  loading?: boolean;
}

/**
 * Modal for confirming component deletion
 * @param root0
 * @param root0.component
 * @param root0.onClose
 * @param root0.onConfirm
 * @param root0.loading
 */
export function ComponentDeletionModal({
  component,
  onClose,
  onConfirm,
  loading = false,
}: ComponentDeletionModalProps): JSX.Element {
  const { t } = useTranslation();

  const handleConfirm = async (): Promise<void> => {
    if (!component?.id) {
      return;
    }

    await onConfirm(component.id);
    onClose();
  };

  if (!component) {
    return <></>;
  }

  const values = extractResearchComponentFormValues(component);

  return (
    <Modal
      opened={!!component}
      onClose={onClose}
      title={t('laboratory.components.delete.title')}
      size="md"
    >
      <Stack gap="md">
        <Text>
          {t('laboratory.components.delete.message')}
        </Text>

        <Box
          p="md"
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
          }}
        >
          <Stack gap="xs">
            <Text size="sm">
              <strong>{t('laboratory.components.fields.code')}:</strong> {values.code || '-'}
            </Text>
            <Text size="sm">
              <strong>{t('laboratory.components.fields.gisCode')}:</strong> {values.gisCode || '-'}
            </Text>
            <Text size="sm">
              <strong>{t('laboratory.components.fields.name')}:</strong> {values.name}
            </Text>
            <Text size="sm">
              <strong>{t('laboratory.components.fields.type')}:</strong> {values.type || '-'}
            </Text>
          </Stack>
        </Box>

        <Text size="sm" c="dimmed">
          {t('laboratory.components.delete.warning')}
        </Text>

        <Box style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="subtle" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            color="red"
            onClick={handleConfirm}
            loading={loading}
          >
            {t('common.delete')}
          </Button>
        </Box>
      </Stack>
    </Modal>
  );
}
