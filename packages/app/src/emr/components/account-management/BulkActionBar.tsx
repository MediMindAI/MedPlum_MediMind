// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Paper, Group, Text, Button, ActionIcon, Progress, Badge } from '@mantine/core';
import { IconX, IconUserMinus, IconUserCheck, IconUserPlus } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import type { BulkOperationProgress, BulkOperationResult } from '../../types/account-management';

interface BulkActionBarProps {
  /** Number of selected accounts */
  selectedCount: number;
  /** Callback when deactivate button is clicked */
  onDeactivate: () => void;
  /** Callback when activate button is clicked */
  onActivate: () => void;
  /** Callback when assign role button is clicked */
  onAssignRole: () => void;
  /** Callback when clear/close button is clicked */
  onClear: () => void;
  /** Whether any bulk operation is in progress */
  loading?: boolean;
  /** Current progress of bulk operation */
  progress?: BulkOperationProgress | null;
  /** Result of last bulk operation */
  result?: BulkOperationResult | null;
}

/**
 * Floating action bar for bulk operations on selected accounts
 *
 * Features:
 * - Shows count of selected accounts
 * - Deactivate, Activate, and Assign Role buttons
 * - Close button to clear selection
 * - Progress bar during operations
 * - Result summary after operation completes
 * - Sticky position at bottom of viewport
 * - Mobile responsive
 *
 * @param selectedCount - Number of selected accounts
 * @param onDeactivate - Deactivate button callback
 * @param onActivate - Activate button callback
 * @param onAssignRole - Assign role button callback
 * @param onClear - Clear selection callback
 * @param loading - Loading state
 * @param progress - Operation progress
 * @param result - Operation result
 */
export const BulkActionBar = React.memo(function BulkActionBar({
  selectedCount,
  onDeactivate,
  onActivate,
  onAssignRole,
  onClear,
  loading = false,
  progress,
  result,
}: BulkActionBarProps): React.ReactElement | null {
  const { t } = useTranslation();

  // Don't render if nothing is selected
  if (selectedCount === 0) {
    return null;
  }

  return (
    <Paper
      shadow="xl"
      p="md"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        background: 'var(--emr-text-inverse)',
        borderRadius: 'var(--emr-border-radius-lg)',
        borderTop: '4px solid transparent',
        borderImage: 'var(--emr-gradient-primary) 1',
        boxShadow: '0 8px 32px rgba(26, 54, 93, 0.2)',
        minWidth: 320,
        maxWidth: 'calc(100vw - 48px)',
      }}
      data-testid="bulk-action-bar"
    >
      {/* Progress bar during operation */}
      {loading && progress && (
        <Progress
          value={progress.percentage}
          size="xs"
          mb="sm"
          color="blue"
          animated
          aria-label={t('accountManagement.bulk.progress', { current: progress.current, total: progress.total })}
        />
      )}

      {/* Result summary */}
      {result && !loading && (
        <Group gap="xs" mb="sm" justify="center">
          <Badge color="green" variant="light">
            {result.successful} {t('accountManagement.edit.success').toLowerCase()}
          </Badge>
          {result.failed > 0 && (
            <Badge color="red" variant="light">
              {result.failed} failed
            </Badge>
          )}
          {result.errors.some((e) => e.code === 'SELF_EXCLUDED') && (
            <Badge color="yellow" variant="light">
              {t('accountManagement.bulk.selfExcluded')}
            </Badge>
          )}
        </Group>
      )}

      <Group gap="md" justify="space-between" wrap="nowrap">
        {/* Selection count */}
        <Text fw={600} size="sm" c="var(--emr-primary)">
          {t('accountManagement.bulk.selected', { count: selectedCount })}
        </Text>

        {/* Action buttons */}
        <Group gap="xs" wrap="nowrap">
          <Button
            variant="light"
            color="orange"
            size="sm"
            leftSection={<IconUserMinus size={16} />}
            onClick={onDeactivate}
            disabled={loading}
            style={{ minHeight: 36 }}
          >
            {t('accountManagement.bulk.deactivate')}
          </Button>

          <Button
            variant="light"
            color="green"
            size="sm"
            leftSection={<IconUserCheck size={16} />}
            onClick={onActivate}
            disabled={loading}
            style={{ minHeight: 36 }}
          >
            {t('accountManagement.bulk.activate')}
          </Button>

          <Button
            variant="light"
            color="blue"
            size="sm"
            leftSection={<IconUserPlus size={16} />}
            onClick={onAssignRole}
            disabled={loading}
            style={{ minHeight: 36 }}
          >
            {t('accountManagement.bulk.assignRole')}
          </Button>

          {/* Close/Clear button */}
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={onClear}
            disabled={loading}
            aria-label={t('accountManagement.bulk.deselectAll')}
            style={{
              transition: 'var(--emr-transition-fast)',
            }}
          >
            <IconX size={18} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
});
