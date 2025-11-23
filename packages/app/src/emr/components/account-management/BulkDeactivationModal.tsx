// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Modal, Stack, Text, Textarea, Button, Group, List, Alert, Progress, Badge } from '@mantine/core';
import { IconAlertTriangle, IconUserMinus } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import type { BulkOperationProgress, BulkOperationResult } from '../../types/account-management';

interface BulkDeactivationModalProps {
  /** Whether the modal is open */
  opened: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Array of account IDs to deactivate */
  accountIds: string[];
  /** Array of account names (parallel with accountIds) */
  accountNames: string[];
  /** Callback when deactivation is confirmed */
  onConfirm: (reason?: string) => Promise<BulkOperationResult>;
  /** Whether operation is in progress */
  loading?: boolean;
  /** Current progress of operation */
  progress?: BulkOperationProgress | null;
  /** Current user ID (to show self-exclusion warning) */
  currentUserId?: string;
}

/**
 * Modal for confirming bulk account deactivation
 *
 * Features:
 * - Shows list of accounts to be deactivated (max 5, then "and X more")
 * - Warning about self-exclusion if current user is in selection
 * - Optional reason input
 * - Progress bar during operation
 * - Result summary after completion
 *
 * @param opened - Modal open state
 * @param onClose - Close callback
 * @param accountIds - IDs of accounts to deactivate
 * @param accountNames - Names of accounts to deactivate
 * @param onConfirm - Confirmation callback
 * @param loading - Loading state
 * @param progress - Operation progress
 * @param currentUserId - Current user ID for self-exclusion check
 */
export const BulkDeactivationModal = React.memo(function BulkDeactivationModal({
  opened,
  onClose,
  accountIds,
  accountNames,
  onConfirm,
  loading = false,
  progress,
  currentUserId,
}: BulkDeactivationModalProps): React.ReactElement {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<BulkOperationResult | null>(null);

  // Check if current user is in selection
  const currentUserIncluded = currentUserId && accountIds.includes(currentUserId);

  // Determine accounts to display (max 5)
  const displayNames = accountNames.slice(0, 5);
  const remainingCount = accountNames.length - 5;

  const handleConfirm = async () => {
    const operationResult = await onConfirm(reason || undefined);
    setResult(operationResult);
  };

  const handleClose = () => {
    setReason('');
    setResult(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconUserMinus size={20} color="var(--mantine-color-orange-6)" />
          <Text fw={600}>{t('accountManagement.bulk.deactivate')}</Text>
        </Group>
      }
      size="md"
      centered
    >
      <Stack gap="md">
        {/* Result display */}
        {result && !loading && (
          <Alert
            color={result.failed > 0 ? 'yellow' : 'green'}
            title={t('accountManagement.bulk.complete', {
              successful: result.successful,
              failed: result.failed,
            })}
          >
            <Stack gap="xs">
              <Group gap="xs">
                <Badge color="green" variant="light">
                  {result.successful} successful
                </Badge>
                {result.failed > 0 && (
                  <Badge color="red" variant="light">
                    {result.failed} failed
                  </Badge>
                )}
              </Group>
              {result.errors.length > 0 && (
                <List size="sm">
                  {result.errors.map((error) => (
                    <List.Item key={error.id}>
                      <Text size="sm" c="dimmed">
                        {error.name}: {error.error}
                      </Text>
                    </List.Item>
                  ))}
                </List>
              )}
            </Stack>
          </Alert>
        )}

        {/* Progress bar */}
        {loading && progress && (
          <Progress
            value={progress.percentage}
            size="lg"
            color="orange"
            animated
            aria-label={t('accountManagement.bulk.progress', { current: progress.current, total: progress.total })}
          />
        )}

        {/* Confirmation content (only show before operation) */}
        {!result && (
          <>
            {/* Self-exclusion warning */}
            {currentUserIncluded && (
              <Alert icon={<IconAlertTriangle size={16} />} color="yellow" title={t('accountManagement.bulk.selfExcluded')}>
                <Text size="sm">
                  Your account will be automatically excluded from deactivation for security reasons.
                </Text>
              </Alert>
            )}

            {/* Confirmation message */}
            <Text>
              Are you sure you want to deactivate the following {accountIds.length} account(s)?
            </Text>

            {/* Account list */}
            <List spacing="xs" size="sm">
              {displayNames.map((name, index) => (
                <List.Item key={accountIds[index]}>
                  <Text fw={500}>{name}</Text>
                </List.Item>
              ))}
              {remainingCount > 0 && (
                <List.Item>
                  <Text c="dimmed" fs="italic">
                    and {remainingCount} more...
                  </Text>
                </List.Item>
              )}
            </List>

            {/* Reason input */}
            <Textarea
              label={t('accountManagement.deactivate.reasonLabel')}
              placeholder={t('accountManagement.deactivate.reasonPlaceholder')}
              value={reason}
              onChange={(e) => setReason(e.currentTarget.value)}
              minRows={2}
              disabled={loading}
            />
          </>
        )}

        {/* Action buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleClose} disabled={loading}>
            {result ? 'Close' : t('accountManagement.cancel')}
          </Button>
          {!result && (
            <Button
              color="orange"
              onClick={handleConfirm}
              loading={loading}
              leftSection={<IconUserMinus size={16} />}
            >
              {t('accountManagement.deactivate.confirm')}
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
});
