// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Modal, Text, Button, Group, Stack, Alert } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useMedplum } from '@medplum/react-hooks';
import { useState, useEffect } from 'react';
import { hardDeleteRole, getRoleUserCount } from '../../services/roleService';
import { useTranslation } from '../../hooks/useTranslation';
import type { RoleRow } from '../../types/role-management';

interface RoleDeleteModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  role: RoleRow | null;
}

/**
 * Confirmation modal for permanently deleting roles
 *
 * Features:
 * - Checks for assigned users before deletion
 * - Blocks deletion if users are assigned
 * - Shows warning about permanent deletion
 * - Audit trail note for compliance
 *
 * @param props - Component props
 * @param props.opened - Modal open state
 * @param props.onClose - Close handler
 * @param props.onSuccess - Success callback
 * @param props.role - Role to delete
 * @returns Delete confirmation modal component
 */
export function RoleDeleteModal({ opened, onClose, onSuccess, role }: RoleDeleteModalProps): JSX.Element {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkingUsers, setCheckingUsers] = useState(false);

  useEffect(() => {
    async function fetchUserCount(): Promise<void> {
      if (role && opened) {
        setCheckingUsers(true);
        try {
          const count = await getRoleUserCount(medplum, role.id);
          setUserCount(count);
        } catch (error) {
          console.error('Error fetching user count:', error);
          setUserCount(0);
        } finally {
          setCheckingUsers(false);
        }
      }
    }

    fetchUserCount().catch(console.error);
  }, [role, opened, medplum]);

  const handleConfirm = async (): Promise<void> => {
    if (!role) {
      return;
    }

    // Block deletion if users assigned
    if (userCount > 0) {
      notifications.show({
        title: 'Cannot Delete',
        message: t('roleManagement.cannotDeleteWithUsers').replace('{count}', userCount.toString()),
        color: 'red',
      });
      return;
    }

    setLoading(true);
    try {
      await hardDeleteRole(medplum, role.id);

      notifications.show({
        title: t('roleManagement.roleDeletedSuccess'),
        message: `Role "${role.name}" has been permanently deleted`,
        color: 'green',
      });

      onClose();
      onSuccess?.();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to delete role',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const canDelete = userCount === 0;

  return (
    <Modal opened={opened} onClose={onClose} title={t('roleManagement.deleteRole')} size="md">
      <Stack gap="md">
        {checkingUsers ? (
          <Text>Checking for assigned users...</Text>
        ) : (
          <>
            {!canDelete && (
              <Alert icon={<IconAlertTriangle size={16} />} color="red" title="Cannot Delete">
                {t('roleManagement.cannotDeleteWithUsers').replace('{count}', userCount.toString())}
              </Alert>
            )}

            <Text>
              {canDelete
                ? `Are you sure you want to permanently delete the role "${role?.name}"? This action cannot be undone.`
                : `This role has ${userCount} assigned user${userCount !== 1 ? 's' : ''}. Remove all users before deleting.`}
            </Text>

            {canDelete && (
              <Text size="sm" c="dimmed">
                Note: The role name will be preserved in audit logs for compliance.
              </Text>
            )}
          </>
        )}

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose} disabled={loading || checkingUsers}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => {
              handleConfirm().catch(console.error);
            }}
            loading={loading}
            disabled={!canDelete || checkingUsers}
          >
            Delete Permanently
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
