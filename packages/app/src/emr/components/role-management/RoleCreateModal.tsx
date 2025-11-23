// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Modal, Button, Group, Box, ScrollArea, Divider, Text, Badge } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMedplum } from '@medplum/react-hooks';
import { IconShieldLock } from '@tabler/icons-react';
import { RoleForm } from './RoleForm';
import { useRoleForm } from '../../hooks/useRoleForm';
import { createRole } from '../../services/roleService';
import { useTranslation } from '../../hooks/useTranslation';

interface RoleCreateModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  templateCode?: string | null;
}

/**
 * Modal for creating new roles with improved UX
 * @param props - Component props
 * @param props.opened - Whether modal is opened
 * @param props.onClose - Close handler
 * @param props.onSuccess - Success callback
 * @param props.templateCode - Optional template code to pre-populate form
 * @returns Role creation modal component
 */
export function RoleCreateModal({ opened, onClose, onSuccess, templateCode }: RoleCreateModalProps): JSX.Element {
  const medplum = useMedplum();
  const { t, lang } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');

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

  // Get permission count for display
  const permissionCount = form.values.permissions?.length || 0;

  // Modal title text
  const titleText: Record<string, string> = {
    ka: 'ახალი როლის შექმნა',
    en: 'Create New Role',
    ru: 'Создать новую роль',
  };

  const cancelText: Record<string, string> = {
    ka: 'გაუქმება',
    en: 'Cancel',
    ru: 'Отмена',
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconShieldLock size={22} style={{ color: 'var(--emr-secondary)' }} />
          <Text fw={600} size="lg">
            {titleText[lang] || titleText.en}
          </Text>
        </Group>
      }
      size="xl"
      fullScreen={isMobile}
      centered
      styles={{
        header: {
          borderBottom: '1px solid var(--emr-gray-200)',
          paddingBottom: '12px',
          marginBottom: 0,
        },
        body: {
          padding: 0,
        },
        content: {
          borderRadius: isMobile ? 0 : 'var(--emr-border-radius-lg)',
        },
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: isMobile ? 'calc(100vh - 60px)' : 'auto' }}>
        <ScrollArea
          style={{
            flex: 1,
            maxHeight: isMobile ? 'none' : 'calc(80vh - 140px)',
          }}
          offsetScrollbars
          scrollbarSize={8}
        >
          <Box p="lg">
            <RoleForm form={form} hidePermissions={false} />
          </Box>
        </ScrollArea>

        <Divider />

        {/* Footer with summary and actions */}
        <Box
          p="md"
          style={{
            background: 'var(--emr-gray-50)',
            borderTop: '1px solid var(--emr-gray-200)',
          }}
        >
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Group gap="sm">
              {permissionCount > 0 && (
                <Badge
                  size="lg"
                  variant="light"
                  style={{
                    background: 'var(--emr-light-accent)',
                    color: 'var(--emr-secondary)',
                  }}
                >
                  {permissionCount} {lang === 'ka' ? 'უფლება' : lang === 'ru' ? 'разрешений' : 'permissions'}
                </Badge>
              )}
            </Group>
            <Group gap="sm">
              <Button variant="subtle" onClick={onClose} size="md">
                {cancelText[lang] || cancelText.en}
              </Button>
              <Button
                type="submit"
                size="md"
                style={{
                  background: 'var(--emr-gradient-primary)',
                  minWidth: '140px',
                }}
              >
                {t('roleManagement.createRole')}
              </Button>
            </Group>
          </Group>
        </Box>
      </form>
    </Modal>
  );
}
