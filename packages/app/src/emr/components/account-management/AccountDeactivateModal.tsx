// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { Modal, Button, Text, Stack, Alert, Group } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import type { Practitioner } from '@medplum/fhirtypes';
import { useTranslation } from '../../hooks/useTranslation';
import { deactivatePractitioner, reactivatePractitioner } from '../../services/accountService';
import { getPractitionerName } from '../../services/accountHelpers';

export interface AccountDeactivateModalProps {
  /** Whether the modal is opened */
  opened: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Practitioner to deactivate/reactivate */
  practitioner: Practitioner;
  /** Callback after successful operation */
  onSuccess: () => void;
  /** Optional reason for deactivation/reactivation */
  reason?: string;
}

/**
 * AccountDeactivateModal Component
 *
 * Modal dialog for confirming account deactivation or reactivation.
 * Displays practitioner name, shows appropriate action button based on current status,
 * and provides feedback for loading states and errors.
 *
 * @param root0
 * @param root0.opened
 * @param root0.onClose
 * @param root0.practitioner
 * @param root0.onSuccess
 * @param root0.reason
 * @example
 * ```tsx
 * <AccountDeactivateModal
 *   opened={isModalOpen}
 *   onClose={() => setModalOpen(false)}
 *   practitioner={selectedPractitioner}
 *   onSuccess={() => refreshAccountList()}
 * />
 * ```
 */
export function AccountDeactivateModal({
  opened,
  onClose,
  practitioner,
  onSuccess,
  reason,
}: AccountDeactivateModalProps): JSX.Element {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isActive = practitioner.active !== false;
  const practitionerName = getPractitionerName(practitioner);

  const handleAction = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (isActive) {
        // Deactivate
        await deactivatePractitioner(medplum, practitioner.id!, reason);
      } else {
        // Reactivate
        await reactivatePractitioner(medplum, practitioner.id!, reason);
      }

      // Success - call callbacks
      onSuccess();
      onClose();
    } catch (err) {
      // Handle errors
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';

      // Check for specific error types
      if (errorMessage.includes('Cannot deactivate your own account')) {
        setError(t('account.errors.cannotDeactivateSelf'));
      } else {
        setError(errorMessage);
      }

      setLoading(false);
    }
  };

  const handleClose = (): void => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text size="lg" fw={600}>
          {isActive ? t('account.deactivate.title') : t('account.reactivate.title')}
        </Text>
      }
      centered
      size="md"
    >
      <Stack gap="md">
        {/* Confirmation message */}
        <Text>
          {isActive
            ? t('account.deactivate.confirmMessage', { name: practitionerName })
            : t('account.reactivate.confirmMessage', { name: practitionerName })}
        </Text>

        {/* Practitioner details */}
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            {t('account.practitionerName')}:
          </Text>
          <Text fw={500}>{practitionerName}</Text>

          {practitioner.telecom?.find(t => t.system === 'email')?.value && (
            <>
              <Text size="sm" c="dimmed" mt="xs">
                {t('account.email')}:
              </Text>
              <Text fw={500}>
                {practitioner.telecom.find(t => t.system === 'email')?.value}
              </Text>
            </>
          )}
        </Stack>

        {/* Error alert */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={t('common.error')}
            color="red"
            variant="light"
          >
            {error}
          </Alert>
        )}

        {/* Action buttons */}
        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            onClick={handleClose}
            disabled={loading}
          >
            {t('common.cancel')}
          </Button>

          <Button
            color={isActive ? 'red' : 'green'}
            onClick={handleAction}
            loading={loading}
            disabled={loading}
          >
            {isActive ? t('account.deactivate.action') : t('account.reactivate.action')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
