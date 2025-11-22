// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Modal, Button, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMedplum } from '@medplum/react-hooks';
import { RoleForm } from './RoleForm';
import { useRoleForm } from '../../hooks/useRoleForm';
import { createRole } from '../../services/roleService';
import { useTranslation } from '../../hooks/useTranslation';

interface RoleCreateModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Modal for creating new roles
 * @param props - Component props
 * @param props.opened - Whether modal is opened
 * @param props.onClose - Close handler
 * @param props.onSuccess - Success callback
 * @returns Role creation modal component
 */
export function RoleCreateModal({ opened, onClose, onSuccess }: RoleCreateModalProps): JSX.Element {
  const medplum = useMedplum();
  const { t } = useTranslation();

  const { form, handleSubmit } = useRoleForm({
    onSubmit: async (values) => {
      try {
        await createRole(medplum, values);

        notifications.show({
          title: t('roleManagement.roleCreatedSuccess'),
          message: `Role "${values.name}" has been created successfully`,
          color: 'green',
        });

        onClose();
        onSuccess?.();
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to create role',
          color: 'red',
        });
      }
    },
  });

  return (
    <Modal opened={opened} onClose={onClose} title={t('roleManagement.createRole')} size="lg">
      <form onSubmit={handleSubmit}>
        <RoleForm form={form} hidePermissions={false} />

        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #1a365d, #2b6cb0, #3182ce)',
            }}
          >
            {t('roleManagement.createRole')}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
