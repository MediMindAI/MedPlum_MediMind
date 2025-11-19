/**
 * DeactivationConfirmationModal Component
 *
 * Confirmation dialog for deactivating practitioner accounts
 * Shows account details and reason input field
 */

import { Modal, Text, Button, Stack, Textarea, Group, Box } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import type { AccountRow } from '../../../types/account-management';

interface DeactivationConfirmationModalProps {
  account: AccountRow | null;
  opened: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  loading?: boolean;
  isReactivation?: boolean;
}

/**
 * Modal component for deactivation/reactivation confirmation
 *
 * Features:
 * - Shows account name and details
 * - Optional reason text area
 * - Different messaging for deactivate vs reactivate
 * - Loading state during API call
 * - Mobile-friendly layout
 *
 * @param account - Account to deactivate/reactivate
 * @param opened - Modal open state
 * @param onClose - Close handler
 * @param onConfirm - Confirm handler with optional reason
 * @param loading - Show loading state
 * @param isReactivation - Show reactivation messaging instead of deactivation
 */
export function DeactivationConfirmationModal({
  account,
  opened,
  onClose,
  onConfirm,
  loading,
  isReactivation,
}: DeactivationConfirmationModalProps): JSX.Element {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  const handleConfirm = async () => {
    await onConfirm(reason || undefined);
    setReason(''); // Clear reason after submission
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  if (!account) return <></>;

  const title = isReactivation
    ? t('accountManagement.reactivate.title')
    : t('accountManagement.deactivate.title');

  const message = isReactivation
    ? t('accountManagement.reactivate.confirmMessage', { name: account.name })
    : t('accountManagement.deactivate.confirmMessage', { name: account.name });

  const confirmButtonText = isReactivation
    ? t('accountManagement.reactivate.confirm')
    : t('accountManagement.deactivate.confirm');

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={title}
      size="md"
      centered
    >
      <Stack gap="md">
        {/* Account Details */}
        <Box>
          <Text size="sm" c="dimmed" mb="xs">
            {t('accountManagement.table.name')}
          </Text>
          <Text fw={600} size="lg">
            {account.name}
          </Text>
        </Box>

        {account.email && (
          <Box>
            <Text size="sm" c="dimmed" mb="xs">
              {t('accountManagement.table.email')}
            </Text>
            <Text>{account.email}</Text>
          </Box>
        )}

        {account.staffId && (
          <Box>
            <Text size="sm" c="dimmed" mb="xs">
              {t('accountManagement.table.staffId')}
            </Text>
            <Text>{account.staffId}</Text>
          </Box>
        )}

        {/* Confirmation Message */}
        <Text size="md" mt="md">
          {message}
        </Text>

        {/* Reason Input (optional) */}
        {!isReactivation && (
          <Textarea
            label={t('accountManagement.deactivate.reasonLabel')}
            placeholder={t('accountManagement.deactivate.reasonPlaceholder')}
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            rows={3}
            size="md"
          />
        )}

        {/* Action Buttons */}
        <Group justify="flex-end" mt="lg">
          <Button
            variant="default"
            onClick={handleClose}
            disabled={loading}
            size="md"
          >
            {t('accountManagement.cancel')}
          </Button>
          <Button
            color={isReactivation ? 'teal' : 'red'}
            onClick={handleConfirm}
            loading={loading}
            size="md"
          >
            {confirmButtonText}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
