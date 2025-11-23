// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Modal, Button, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMedplum } from '@medplum/react-hooks';
import { useEffect, useRef } from 'react';
import { RoleForm } from './RoleForm';
import { useRoleForm } from '../../hooks/useRoleForm';
import { getRoleById, updateRole } from '../../services/roleService';
import { accessPolicyToPermissions } from '../../services/permissionService';
import { useTranslation } from '../../hooks/useTranslation';
import type { RoleRow } from '../../types/role-management';

interface RoleEditModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  role: RoleRow | null;
}

/**
 * Modal for editing existing roles
 * @param props - Component props
 * @param props.opened - Whether modal is open
 * @param props.onClose - Close callback
 * @param props.onSuccess - Success callback (triggers table refresh)
 * @param props.role - Role to edit
 * @returns Role edit modal component
 */
export function RoleEditModal({ opened, onClose, onSuccess, role }: RoleEditModalProps): JSX.Element {
  const medplum = useMedplum();
  const { t } = useTranslation();

  // Track which role's permissions have been loaded to prevent infinite loop
  const loadedRoleIdRef = useRef<string | null>(null);

  const { form, handleSubmit } = useRoleForm({
    initialValues: role
      ? {
          code: role.code,
          name: role.name,
          description: role.description,
          status: role.status,
          permissions: [],
        }
      : undefined,
    onSubmit: async (values) => {
      if (!role) {return;}

      try {
        await updateRole(medplum, role.id, values);

        notifications.show({
          title: t('roleManagement.roleUpdatedSuccess'),
          message: `Role "${values.name}" has been updated successfully`,
          color: 'green',
        });

        // Notify about real-time permission updates
        notifications.show({
          title: 'Permissions Updated',
          message: 'All users with this role will receive updated permissions immediately',
          color: 'blue',
        });

        onClose();
        onSuccess?.();
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to update role',
          color: 'red',
        });
      }
    },
  });

  // Load role permissions when modal opens
  useEffect(() => {
    async function loadRolePermissions(): Promise<void> {
      // Only load if we have a role, modal is open, and we haven't already loaded this role's permissions
      if (role && opened && loadedRoleIdRef.current !== role.id) {
        try {
          loadedRoleIdRef.current = role.id; // Mark as loading to prevent re-trigger
          const accessPolicy = await getRoleById(medplum, role.id);
          const permissions = accessPolicyToPermissions(accessPolicy);
          form.setFieldValue('permissions', permissions);
        } catch (error) {
          console.error('Error loading role permissions:', error);
          loadedRoleIdRef.current = null; // Reset on error so user can retry
        }
      }
    }

    // Reset the ref when modal closes to allow loading again when reopened
    if (!opened) {
      loadedRoleIdRef.current = null;
    }

    loadRolePermissions().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role?.id, opened, medplum]);

  if (!role) {
    return <></>;
  }

  return (
    <Modal opened={opened} onClose={onClose} title={t('roleManagement.editRole')} size="lg">
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
            {t('roleManagement.editRole')}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
