// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Paper, Box, Select, Text, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { IconKey, IconShieldLock } from '@tabler/icons-react';
import { PermissionMatrix } from '../../../../components/account-management/PermissionMatrix';
import { useAccessPolicyPermissions } from '../../../../hooks/useAccessPolicyPermissions';
import { useRoles } from '../../../../hooks/useRoles';
import { useTranslation } from '../../../../hooks/useTranslation';

/**
 * PermissionsTab - Extracted permissions tab from AccountManagementView
 *
 * Features:
 * - Role selector dropdown
 * - Permission matrix for selected role
 * - Save/refresh functionality
 */
export function PermissionsTab(): JSX.Element {
  const { t } = useTranslation();

  // Permission matrix state
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const { roles, loading: rolesLoading } = useRoles();
  const {
    selectedPermissions,
    loading: permissionsLoading,
    hasChanges: permissionsHasChanges,
    togglePermission,
    savePermissions,
    refreshPermissions,
  } = useAccessPolicyPermissions(selectedRoleId || undefined);

  return (
    <Stack gap={24}>
      {/* Premium Role Selector Card */}
      <Paper
        p={0}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(26, 54, 93, 0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Card Header with Gradient */}
        <Box
          style={{
            background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
            padding: '20px 24px',
          }}
        >
          <Group gap={14} align="center">
            <Box
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconKey size={22} color="white" />
            </Box>
            <Box>
              <Text fw={700} size="lg" c="white" style={{ letterSpacing: '-0.3px' }}>
                {t('accountManagement.permissions.matrix')}
              </Text>
              <Text size="xs" c="rgba(255, 255, 255, 0.8)" mt={2}>
                {t('common.selectRoleHint')}
              </Text>
            </Box>
          </Group>
        </Box>

        {/* Role Selector Body */}
        <Box p={24}>
          <Select
            label={t('roleManagement.roleName')}
            placeholder={t('roleManagement.searchRoles')}
            data={roles.map((role) => {
              // Try to get translated role name based on code
              const translatedName = t(`roles.${role.code}`) !== `roles.${role.code}`
                ? t(`roles.${role.code}`)
                : role.name;
              return {
                value: role.id,
                label: translatedName,
              };
            })}
            value={selectedRoleId}
            onChange={setSelectedRoleId}
            searchable
            clearable
            size="md"
            disabled={rolesLoading}
            leftSection={<IconShieldLock size={18} style={{ color: 'var(--emr-gray-400)' }} />}
            styles={{
              input: {
                minHeight: '48px',
                borderRadius: '12px',
                border: '1.5px solid var(--emr-gray-200)',
                background: 'white',
                transition: 'all 0.2s ease',
                '&:focus': {
                  borderColor: 'var(--emr-secondary)',
                  boxShadow: '0 0 0 3px rgba(43, 108, 176, 0.15)',
                },
              },
              label: {
                fontWeight: 600,
                color: 'var(--emr-text-primary)',
                marginBottom: '8px',
              },
            }}
          />
        </Box>
      </Paper>

      {/* Permission Matrix */}
      {selectedRoleId && (
        <Paper
          p={24}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(26, 54, 93, 0.08)',
          }}
        >
          <PermissionMatrix
            selectedPermissions={selectedPermissions}
            loading={permissionsLoading}
            hasChanges={permissionsHasChanges}
            onPermissionChange={togglePermission}
            onSave={async () => {
              try {
                await savePermissions();
                notifications.show({
                  title: t('accountManagement.edit.success'),
                  message: t('roleManagement.roleUpdatedSuccess'),
                  color: 'green',
                  styles: {
                    root: {
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                    },
                    title: { color: 'white' },
                    description: { color: 'white' },
                  },
                });
              } catch (error) {
                notifications.show({
                  title: t('accountManagement.edit.error'),
                  message: (error as Error).message,
                  color: 'red',
                });
              }
            }}
            onRefresh={refreshPermissions}
          />
        </Paper>
      )}

      {/* Premium Empty State */}
      {!selectedRoleId && (
        <Paper
          p={0}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(26, 54, 93, 0.08)',
            overflow: 'hidden',
          }}
        >
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '64px 32px',
              textAlign: 'center',
              background: 'linear-gradient(180deg, rgba(99, 179, 237, 0.03) 0%, transparent 100%)',
            }}
          >
            <Box
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(43, 108, 176, 0.08) 0%, rgba(99, 179, 237, 0.08) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                border: '2px dashed var(--emr-gray-300)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              <IconKey size={44} style={{ color: 'var(--emr-secondary)', opacity: 0.7 }} />
            </Box>
            <Text fw={700} size="lg" c="var(--emr-text-primary)" mb={8} style={{ letterSpacing: '-0.3px' }}>
              {t('accountManagement.permissions.title')}
            </Text>
            <Text size="sm" c="var(--emr-gray-500)" maw={360} lh={1.6}>
              {t('common.noRoleSelected')}
            </Text>
          </Box>
        </Paper>
      )}
    </Stack>
  );
}
