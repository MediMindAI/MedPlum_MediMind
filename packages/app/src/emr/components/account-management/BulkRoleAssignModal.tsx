// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Modal, Stack, Text, Button, Group, List, Alert, Progress, Badge, Select } from '@mantine/core';
import { IconUserPlus } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useRoles } from '../../hooks/useRoles';
import type { BulkOperationProgress, BulkOperationResult } from '../../types/account-management';

interface BulkRoleAssignModalProps {
  /** Whether the modal is open */
  opened: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Array of account IDs to assign role to */
  accountIds: string[];
  /** Array of account names (parallel with accountIds) */
  accountNames: string[];
  /** Callback when role assignment is confirmed */
  onConfirm: (roleCode: string) => Promise<BulkOperationResult>;
  /** Whether operation is in progress */
  loading?: boolean;
  /** Current progress of operation */
  progress?: BulkOperationProgress | null;
}

/**
 * Modal for bulk assigning roles to multiple accounts
 *
 * Features:
 * - Role dropdown selection
 * - Shows list of accounts being affected (max 5, then "and X more")
 * - Progress bar during operation
 * - Result summary after completion
 *
 * @param opened - Modal open state
 * @param onClose - Close callback
 * @param accountIds - IDs of accounts to assign role
 * @param accountNames - Names of accounts to assign role
 * @param onConfirm - Confirmation callback with selected role code
 * @param loading - Loading state
 * @param progress - Operation progress
 */
export const BulkRoleAssignModal = React.memo(function BulkRoleAssignModal({
  opened,
  onClose,
  accountIds,
  accountNames,
  onConfirm,
  loading = false,
  progress,
}: BulkRoleAssignModalProps): React.ReactElement {
  const { t } = useTranslation();
  const { roles, loading: rolesLoading } = useRoles();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [result, setResult] = useState<BulkOperationResult | null>(null);

  // Determine accounts to display (max 5)
  const displayNames = accountNames.slice(0, 5);
  const remainingCount = accountNames.length - 5;

  // Format roles for Select component
  const roleOptions = roles.map((role) => ({
    value: role.code || role.id,
    label: role.name,
  }));

  const handleConfirm = async () => {
    if (!selectedRole) {return;}
    const operationResult = await onConfirm(selectedRole);
    setResult(operationResult);
  };

  const handleClose = () => {
    setSelectedRole(null);
    setResult(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconUserPlus size={20} color="var(--mantine-color-blue-6)" />
          <Text fw={600}>{t('accountManagement.bulk.assignRole')}</Text>
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
            color="blue"
            animated
            aria-label={t('accountManagement.bulk.progress', { current: progress.current, total: progress.total })}
          />
        )}

        {/* Confirmation content (only show before operation) */}
        {!result && (
          <>
            {/* Role selection */}
            <Select
              label={t('roleManagement.roleName')}
              placeholder={t('roleManagement.searchRoles')}
              data={roleOptions}
              value={selectedRole}
              onChange={setSelectedRole}
              searchable
              clearable
              size="md"
              disabled={loading || rolesLoading}
              styles={{
                input: {
                  minHeight: '44px',
                },
              }}
            />

            {/* Affected accounts info */}
            <Text>
              Assign role to the following {accountIds.length} account(s):
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
          </>
        )}

        {/* Action buttons */}
        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleClose} disabled={loading}>
            {result ? 'Close' : t('accountManagement.cancel')}
          </Button>
          {!result && (
            <Button
              color="blue"
              onClick={handleConfirm}
              loading={loading}
              disabled={!selectedRole}
              leftSection={<IconUserPlus size={16} />}
            >
              {t('accountManagement.bulk.assignRole')}
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
});
