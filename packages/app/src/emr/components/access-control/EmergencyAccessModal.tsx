// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { Modal, Stack, Textarea, Button, Alert } from '@mantine/core';
import { useTranslation } from '../../hooks/useTranslation';
import { useEmergencyAccess } from '../../hooks/useEmergencyAccess';

/**
 * Props for EmergencyAccessModal component
 */
export interface EmergencyAccessModalProps {
  /** Whether modal is open */
  opened: boolean;
  /** Close handler */
  onClose: () => void;
  /** Resource ID being accessed */
  resourceId: string;
  /** Resource type being accessed */
  resourceType: string;
  /** Callback when access granted */
  onAccessGranted?: () => void;
}

/**
 * Modal for requesting emergency (break-glass) access to restricted patient data
 *
 * Displays warning about audit logging and requires mandatory reason (min 10 chars).
 *
 * @example
 * ```typescript
 * <EmergencyAccessModal
 *   opened={modalOpen}
 *   onClose={() => setModalOpen(false)}
 *   resourceId="patient-123"
 *   resourceType="Patient"
 *   onAccessGranted={() => {
 *     // Access granted - refresh data
 *   }}
 * />
 * ```
 */
export function EmergencyAccessModal({
  opened,
  onClose,
  resourceId,
  resourceType,
  onAccessGranted,
}: EmergencyAccessModalProps): JSX.Element {
  const { t } = useTranslation();
  const { requestAccess, loading } = useEmergencyAccess();
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (): Promise<void> => {
    setError(null);

    const result = await requestAccess(resourceId, resourceType, reason);

    if (result.granted) {
      onAccessGranted?.();
      onClose();
      setReason('');
    } else {
      setError(result.error || 'Failed to grant emergency access');
    }
  };

  const handleClose = (): void => {
    setReason('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('emergencyAccess.title')}
      size="md"
    >
      <Stack gap="md">
        <Alert color="yellow" title={t('emergencyAccess.warning')}>
          {t('emergencyAccess.warningDescription')}
        </Alert>

        <Textarea
          label={t('emergencyAccess.reasonLabel')}
          placeholder={t('emergencyAccess.reasonPlaceholder')}
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
          minRows={4}
          required
          error={error}
        />

        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={reason.length < 10}
          fullWidth
        >
          {t('emergencyAccess.submit')}
        </Button>
      </Stack>
    </Modal>
  );
}
