// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Modal, Button, Group, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMedplum } from '@medplum/react-hooks';
import { useEffect, useState } from 'react';
import { RoleForm } from './RoleForm';
import { useRoleForm } from '../../hooks/useRoleForm';
import { cloneRole, getRoleById } from '../../services/roleService';
import { accessPolicyToPermissions } from '../../services/permissionService';
import { useTranslation } from '../../hooks/useTranslation';
import type { RoleRow } from '../../types/role-management';

interface RoleCloneModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  sourceRole: RoleRow | null;
}

/**
 * Modal for cloning existing roles
 *
 * Features:
 * - Clones role with " (Copy)" suffix
 * - Loads source role permissions
 * - Allows editing before cloning
 * - Validates new role name/code
 *
 * @param props - Component props
 * @param props.opened - Modal open state
 * @param props.onClose - Close handler
 * @param props.onSuccess - Success callback
 * @param props.sourceRole - Source role to clone
 * @returns Clone modal component
 */
export function RoleCloneModal({ opened, onClose, onSuccess, sourceRole }: RoleCloneModalProps): JSX.Element {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const { form, handleSubmit } = useRoleForm({
    initialValues: sourceRole
      ? {
          code: `${sourceRole.code}-copy`,
          name: `${sourceRole.name} (Copy)`,
          description: sourceRole.description,
          status: 'active',
          permissions: [],
        }
      : undefined,
    onSubmit: async (values) => {
      if (!sourceRole) {
        return;
      }

      try {
        await cloneRole(medplum, sourceRole.id, values.name, values.code);

        notifications.show({
          title: t('roleManagement.roleClonedSuccess'),
          message: `Role "${values.name}" has been created from "${sourceRole.name}"`,
          color: 'green',
        });

        onClose();
        onSuccess?.();
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to clone role',
          color: 'red',
        });
      }
    },
  });

  // Load source role permissions when modal opens
  useEffect(() => {
    async function loadSourcePermissions(): Promise<void> {
      if (sourceRole && opened) {
        setLoadingPermissions(true);
        try {
          const accessPolicy = await getRoleById(medplum, sourceRole.id);
          const permissions = accessPolicyToPermissions(accessPolicy);
          form.setFieldValue('permissions', permissions);
        } catch (error) {
          console.error('Error loading source permissions:', error);
          notifications.show({
            title: 'Error',
            message: 'Failed to load source role permissions',
            color: 'red',
          });
        } finally {
          setLoadingPermissions(false);
        }
      }
    }

    loadSourcePermissions().catch(console.error);
  }, [sourceRole, opened, medplum, form]);

  // Reset form when modal closes
  useEffect(() => {
    if (!opened) {
      form.reset();
    }
  }, [opened, form]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('roleManagement.cloneRole')}
      size="lg"
      styles={{
        title: {
          fontSize: '20px',
          fontWeight: 600,
        },
      }}
    >
      <form
        onSubmit={(e) => {
          handleSubmit(e).catch(console.error);
        }}
      >
        <Stack gap="md">
          <RoleForm form={form} hidePermissions={false} loading={loadingPermissions} />

          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #1a365d, #2b6cb0, #3182ce)',
              }}
              disabled={loadingPermissions}
            >
              {t('roleManagement.cloneRole')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
