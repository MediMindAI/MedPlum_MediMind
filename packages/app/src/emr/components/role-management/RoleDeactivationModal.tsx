// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Modal, Text, Button, Group, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMedplum } from '@medplum/react-hooks';
import { useState, useEffect } from 'react';
import { deactivateRole, getRoleUserCount } from '../../services/roleService';
import { useTranslation } from '../../hooks/useTranslation';
import type { RoleRow } from '../../types/role-management';

interface RoleDeactivationModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  role: RoleRow | null;
}

/**
 * Confirmation modal for deactivating roles
 * @param props - Component props
 * @param props.opened - Whether modal is open
 * @param props.onClose - Close callback
 * @param props.onSuccess - Success callback (triggers table refresh)
 * @param props.role - Role to deactivate
 * @returns Role deactivation modal component
 */
export function RoleDeactivationModal({
  opened,
  onClose,
  onSuccess,
  role,
}: RoleDeactivationModalProps): JSX.Element {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUserCount(): Promise<void> {
      if (role && opened) {
        try {
          const count = await getRoleUserCount(medplum, role.id);
          setUserCount(count);
        } catch (error) {
          console.error('Error fetching user count:', error);
          setUserCount(0);
        }
      }
    }

    fetchUserCount().catch(console.error);
  }, [role, opened, medplum]);

  const handleConfirm = async (): Promise<void> => {
    if (!role) {return;}

    setLoading(true);
    try {
      await deactivateRole(medplum, role.id);

      notifications.show({
        title: t('roleManagement.roleDeactivatedSuccess'),
        message: `Role "${role.name}" has been deactivated`,
        color: 'green',
      });

      onClose();
      onSuccess?.();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to deactivate role',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return <></>;
  }

  return (
    <Modal opened={opened} onClose={onClose} title={t('roleManagement.deactivateRole')} size="md">
      <Stack gap="md">
        <Text>{t('roleManagement.confirmDeactivate')}</Text>

        {userCount > 0 && (
          <Text c="orange" fw={500}>
            Warning: This role has {userCount} active user{userCount !== 1 ? 's' : ''}. Existing users will keep
            their permissions, but you won&apos;t be able to assign this role to new users.
          </Text>
        )}

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button color="orange" onClick={handleConfirm} loading={loading}>
            Deactivate
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
