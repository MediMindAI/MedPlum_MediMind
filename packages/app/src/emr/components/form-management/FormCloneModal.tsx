// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Button, Group, Stack, Text } from '@mantine/core';
import { useState, useEffect } from 'react';
import { IconCopy } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import { EMRTextInput } from '../shared/EMRFormFields';

/**
 * Props for FormCloneModal component
 */
export interface FormCloneModalProps {
  /** Whether the modal is open */
  opened: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Original form title */
  originalTitle: string;
  /** Callback when clone is confirmed */
  onConfirm: (newTitle: string) => void;
  /** Whether clone operation is loading */
  loading?: boolean;
}

/**
 * FormCloneModal Component
 *
 * Modal dialog for cloning a form template with a new title.
 *
 * Features:
 * - Pre-filled title with " (Copy)" suffix
 * - Title input with validation
 * - Cancel and Confirm buttons
 * - Loading state
 */
export function FormCloneModal({
  opened,
  onClose,
  originalTitle,
  onConfirm,
  loading = false,
}: FormCloneModalProps): JSX.Element {
  const { t } = useTranslation();
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');

  // Reset title when modal opens with new original title
  useEffect(() => {
    if (opened) {
      const suffix = t('formManagement.clone.copySuffix');
      setNewTitle(`${originalTitle} ${suffix}`);
      setError('');
    }
  }, [opened, originalTitle, t]);

  // Handle title change
  const handleTitleChange = (value: string): void => {
    setNewTitle(value);
    if (error && value.trim()) {
      setError('');
    }
  };

  // Handle confirm
  const handleConfirm = (): void => {
    const trimmedTitle = newTitle.trim();

    if (!trimmedTitle) {
      setError(t('formManagement.clone.titleRequired'));
      return;
    }

    if (trimmedTitle === originalTitle) {
      setError(t('formManagement.clone.titleMustBeDifferent'));
      return;
    }

    onConfirm(trimmedTitle);
  };

  // Handle close
  const handleClose = (): void => {
    if (!loading) {
      setNewTitle('');
      setError('');
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="sm">
          <IconCopy size={20} />
          <Text fw={600}>{t('formManagement.clone.title')}</Text>
        </Group>
      }
      size="md"
      centered
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
      data-testid="clone-modal"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('formManagement.clone.description')}
        </Text>

        <EMRTextInput
          label={t('formManagement.clone.newTitleLabel')}
          placeholder={t('formManagement.clone.titlePlaceholder')}
          value={newTitle}
          onChange={handleTitleChange}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' && !loading) {
              handleConfirm();
            }
          }}
          error={error}
          disabled={loading}
          required
          autoFocus
          data-testid="clone-title-input"
        />

        <Text size="xs" c="dimmed">
          {t('formManagement.clone.info')}
        </Text>

        <Group justify="flex-end" gap="sm" mt="md">
          <Button variant="default" onClick={handleClose} disabled={loading} data-testid="clone-cancel-btn">
            {t('formUI.buttons.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            loading={loading}
            leftSection={<IconCopy size={16} />}
            data-testid="clone-confirm-btn"
          >
            {t('formManagement.clone.confirmButton')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
