// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Stack, TextInput, Textarea, Select, Text } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { RoleFormValues } from '../../types/role-management';
import { useTranslation } from '../../hooks/useTranslation';
import { PermissionTree } from './PermissionTree';

interface RoleFormProps {
  form: UseFormReturnType<RoleFormValues>;
  hidePermissions?: boolean; // For US1, we hide permissions section
  loading?: boolean; // Loading state for async operations
}

/**
 * Role creation/editing form
 *
 * Phase 1 (US1): Basic fields only (name, code, description, status)
 * Phase 2 (US2): Add permissions section
 * @param props - Component props
 * @param props.form - Mantine form instance
 * @param props.hidePermissions - Whether to hide permissions section
 * @param props.loading - Loading state
 * @returns Role form component
 */
export function RoleForm({ form, hidePermissions = false, loading = false }: RoleFormProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      {/* Role Name */}
      <TextInput
        label={t('roleManagement.roleName')}
        placeholder="e.g., Physician, Nurse, Lab Technician"
        required
        {...form.getInputProps('name')}
      />

      {/* Role Code */}
      <TextInput
        label={t('roleManagement.roleCode')}
        placeholder="e.g., physician, nurse, lab-tech"
        description="Lowercase with hyphens only"
        required
        {...form.getInputProps('code')}
      />

      {/* Description */}
      <Textarea
        label={t('roleManagement.roleDescription')}
        placeholder="Brief description of this role's responsibilities"
        minRows={3}
        maxRows={6}
        {...form.getInputProps('description')}
      />

      {/* Status */}
      <Select
        label={t('roleManagement.roleStatus')}
        data={[
          { value: 'active', label: t('roleManagement.active') },
          { value: 'inactive', label: t('roleManagement.inactive') },
        ]}
        required
        {...form.getInputProps('status')}
      />

      {/* Permissions section - Hidden in US1, shown in US2 */}
      {!hidePermissions && (
        <div>
          <Text fw={500} size="sm" mb="xs">
            {t('roleManagement.selectPermissions')}
          </Text>
          <PermissionTree
            selectedPermissions={form.values.permissions}
            onChange={(permissions) => form.setFieldValue('permissions', permissions)}
          />
        </div>
      )}
    </Stack>
  );
}
