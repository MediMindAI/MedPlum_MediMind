// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Modal, Button, Group, Box, ScrollArea, Text, Progress, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useMedplum } from '@medplum/react-hooks';
import { IconShieldLock, IconKey, IconCheck, IconSparkles } from '@tabler/icons-react';
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
 * Premium modal for editing existing roles
 * Matches the design of RoleCreateModal with full-screen layout,
 * glassmorphism header, and permission progress tracking.
 *
 * @param props - Component props
 * @param props.opened - Whether modal is open
 * @param props.onClose - Close callback
 * @param props.onSuccess - Success callback (triggers table refresh)
 * @param props.role - Role to edit
 * @returns Role edit modal component
 */
export function RoleEditModal({ opened, onClose, onSuccess, role }: RoleEditModalProps): JSX.Element {
  const medplum = useMedplum();
  const { t, lang } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');

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
    roleId: role?.id, // Pass role ID for duplicate check exclusion
    onSubmit: async (values) => {
      if (!role) {
        return;
      }

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

  // Reset form values when role changes (important for editing different roles)
  useEffect(() => {
    if (role && opened) {
      // Pre-fill form with existing role data
      form.setValues({
        code: role.code || '',
        name: role.name || '',
        description: role.description || '',
        status: role.status || 'active',
        permissions: [], // Will be loaded separately
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role?.id, opened]);

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

  // Get permission count for display
  const permissionCount = form.values.permissions?.length || 0;
  const totalPermissions = 30; // Total available permissions
  const coveragePercent = Math.round((permissionCount / totalPermissions) * 100);

  // Modal title text
  const titleText: Record<string, string> = {
    ka: 'როლის რედაქტირება',
    en: 'Edit Role',
    ru: 'Редактировать роль',
  };

  const subtitleText: Record<string, string> = {
    ka: 'შეცვალეთ როლის სახელი, აღწერა და უფლებები',
    en: 'Modify role name, description and permissions',
    ru: 'Измените название роли, описание и разрешения',
  };

  const cancelText: Record<string, string> = {
    ka: 'გაუქმება',
    en: 'Cancel',
    ru: 'Отмена',
  };

  const saveText: Record<string, string> = {
    ka: 'ცვლილებების შენახვა',
    en: 'Save Changes',
    ru: 'Сохранить изменения',
  };

  if (!role) {
    return <></>;
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size={isMobile ? '100%' : '95vw'}
      fullScreen={isMobile}
      centered
      padding={0}
      styles={{
        header: {
          display: 'none',
        },
        body: {
          padding: 0,
          overflow: 'hidden',
        },
        content: {
          borderRadius: isMobile ? 0 : '24px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(26, 54, 93, 0.15), 0 24px 80px rgba(26, 54, 93, 0.12)',
          maxWidth: '1400px',
        },
        inner: {
          padding: isMobile ? 0 : '16px',
        },
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', height: isMobile ? '100vh' : 'calc(96vh - 32px)', maxHeight: '950px' }}>
        {/* Premium Header with Glassmorphism */}
        <Box
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 251, 252, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--emr-gray-200)',
            padding: '28px 36px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top accent gradient bar */}
          <Box
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #1a365d 0%, #2b6cb0 30%, #17a2b8 70%, #20c4dd 100%)',
            }}
          />

          <Group justify="space-between" align="center" style={{ position: 'relative', zIndex: 1 }}>
            <Group gap="xl" align="center">
              {/* Icon container with premium gradient */}
              <Box
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  background: 'var(--emr-gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(26, 54, 93, 0.25)',
                }}
              >
                <IconShieldLock size={32} style={{ color: 'white' }} stroke={1.8} />
              </Box>

              <Stack gap={6}>
                <Text
                  fw={700}
                  style={{
                    fontSize: 26,
                    color: 'var(--emr-text-primary)',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {titleText[lang] || titleText.en}
                </Text>
                <Text size="md" style={{ color: 'var(--emr-gray-500)' }}>
                  {subtitleText[lang] || subtitleText.en}
                </Text>
              </Stack>
            </Group>

            {/* Close button - Premium design */}
            <Button
              variant="subtle"
              onClick={onClose}
              style={{
                width: 44,
                height: 44,
                minWidth: 44,
                padding: 0,
                borderRadius: 12,
                background: 'var(--emr-gray-100)',
                color: 'var(--emr-gray-500)',
                transition: 'all 0.2s ease',
                fontSize: 18,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--emr-gray-200)';
                e.currentTarget.style.color = 'var(--emr-gray-700)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--emr-gray-100)';
                e.currentTarget.style.color = 'var(--emr-gray-500)';
              }}
            >
              ✕
            </Button>
          </Group>
        </Box>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <ScrollArea
            style={{
              flex: 1,
              background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            }}
            offsetScrollbars
            scrollbarSize={10}
            type="always"
          >
            <Box p="xl" px={36} py={32}>
              <RoleForm form={form} hidePermissions={false} />
            </Box>
          </ScrollArea>

          {/* Premium Footer with Progress */}
          <Box
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
              borderTop: '1px solid var(--emr-gray-200)',
              padding: '24px 36px',
            }}
          >
            {/* Progress bar - Premium design */}
            {permissionCount > 0 && (
              <Box mb="lg">
                <Group justify="space-between" mb={8}>
                  <Group gap="sm">
                    <Box
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: 'rgba(43, 108, 176, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconKey size={14} style={{ color: 'var(--emr-secondary)' }} />
                    </Box>
                    <Text size="sm" fw={600} style={{ color: 'var(--emr-text-primary)' }}>
                      {t('roleManagement.permissionProgress')}
                    </Text>
                  </Group>
                  <Text size="sm" fw={700} style={{ color: 'var(--emr-secondary)' }}>
                    {permissionCount} / {totalPermissions}
                  </Text>
                </Group>
                <Progress
                  value={coveragePercent}
                  size="md"
                  radius="xl"
                  styles={{
                    root: {
                      background: 'var(--emr-gray-200)',
                      height: 8,
                    },
                    section: {
                      background: coveragePercent >= 50
                        ? 'linear-gradient(90deg, #17a2b8, #20c4dd)' // Turquoise gradient
                        : 'var(--emr-gradient-primary)',
                      transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                  }}
                />
              </Box>
            )}

            <Group justify="space-between" wrap="wrap" gap="md">
              <Group gap="md">
                {/* Permission count badge - Premium */}
                <Box
                  style={{
                    background: permissionCount > 0
                      ? 'linear-gradient(135deg, rgba(43, 108, 176, 0.1), rgba(99, 179, 237, 0.08))'
                      : 'var(--emr-gray-100)',
                    color: permissionCount > 0 ? 'var(--emr-secondary)' : 'var(--emr-gray-500)',
                    border: `1px solid ${permissionCount > 0 ? 'rgba(43, 108, 176, 0.15)' : 'var(--emr-gray-200)'}`,
                    fontWeight: 600,
                    padding: '8px 16px',
                    borderRadius: 20,
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <IconKey size={15} />
                  {permissionCount} {t('roleManagement.permissions')}
                </Box>

                {/* Coverage badge - Theme colors */}
                {permissionCount > 0 && (
                  <Box
                    style={{
                      background: coveragePercent >= 50
                        ? 'linear-gradient(135deg, rgba(23, 162, 184, 0.12), rgba(32, 196, 221, 0.08))'
                        : 'linear-gradient(135deg, rgba(99, 179, 237, 0.12), rgba(43, 108, 176, 0.08))',
                      color: coveragePercent >= 50 ? '#17a2b8' : '#3182ce',
                      border: `1px solid ${coveragePercent >= 50 ? 'rgba(23, 162, 184, 0.2)' : 'rgba(49, 130, 206, 0.2)'}`,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: 11,
                      letterSpacing: '0.05em',
                      padding: '8px 16px',
                      borderRadius: 20,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {coveragePercent >= 50 ? <IconCheck size={14} /> : <IconSparkles size={14} />}
                    {coveragePercent}% {t('roleManagement.coverage').toUpperCase()}
                  </Box>
                )}
              </Group>

              <Group gap="md">
                <Button
                  variant="subtle"
                  onClick={onClose}
                  size="md"
                  style={{
                    color: 'var(--emr-gray-600)',
                    fontWeight: 600,
                    borderRadius: 10,
                  }}
                >
                  {cancelText[lang] || cancelText.en}
                </Button>
                <Button
                  type="submit"
                  size="md"
                  style={{
                    background: 'var(--emr-gradient-primary)',
                    minWidth: 180,
                    fontWeight: 600,
                    boxShadow: '0 4px 16px rgba(26, 54, 93, 0.25)',
                    borderRadius: 10,
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(26, 54, 93, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(26, 54, 93, 0.25)';
                  }}
                >
                  {saveText[lang] || saveText.en}
                </Button>
              </Group>
            </Group>
          </Box>
        </form>
      </Box>
    </Modal>
  );
}
