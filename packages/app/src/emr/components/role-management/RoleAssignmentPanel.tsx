// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';
import { Stack, MultiSelect, Text, Button, Group, Badge, ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import { useRoles } from '../../hooks/useRoles';
import { useTranslation } from '../../hooks/useTranslation';
import { getUserRoles } from '../../services/roleService';

interface RoleAssignment {
  roleId: string;
  roleName: string;
  roleCode: string;
}

interface RoleAssignmentPanelProps {
  practitionerId?: string;
  value: RoleAssignment[];
  onChange: (roles: RoleAssignment[]) => void;
  disabled?: boolean;
}

/**
 * Panel for assigning multiple roles to a practitioner
 *
 * Features:
 * - Multi-select dropdown with active roles
 * - Display assigned roles as badges
 * - Add/remove controls
 *
 * @param props - Component props
 * @param props.practitionerId - ID of practitioner (optional for new accounts)
 * @param props.value - Currently assigned roles
 * @param props.onChange - Callback when roles change
 * @param props.disabled - Disable all controls
 * @returns Role assignment panel component
 */
export function RoleAssignmentPanel({
  practitionerId,
  value,
  onChange,
  disabled,
}: RoleAssignmentPanelProps): JSX.Element {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const { roles, loading } = useRoles({ status: 'active' });
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Load existing roles when practitionerId changes
  useEffect(() => {
    async function loadUserRoles(): Promise<void> {
      if (practitionerId) {
        try {
          const userRoles = await getUserRoles(medplum, practitionerId);
          const assignments: RoleAssignment[] = userRoles.map((practitionerRole) => {
            const roleTag = practitionerRole.meta?.tag?.find(
              (t) => t.system === 'http://medimind.ge/role-assignment'
            );
            const roleCode = roleTag?.code || '';
            const role = roles.find((r) => r.code === roleCode);
            return {
              roleId: role?.id || '',
              roleName: role?.name || roleCode,
              roleCode,
            };
          });
          onChange(assignments.filter((a) => a.roleId)); // Filter out roles not found
        } catch (error) {
          console.error('Error loading user roles:', error);
        }
      }
    }

    if (roles.length > 0) {
      loadUserRoles().catch((err) => console.error('Error loading user roles:', err));
    }
    // Note: onChange is intentionally excluded from deps to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practitionerId, medplum, roles]);

  const handleAddRoles = (): void => {
    const newRoles = selectedRoleIds
      .filter((id) => !value.some((r) => r.roleId === id))
      .map((id) => {
        const role = roles.find((r) => r.id === id);
        return {
          roleId: id,
          roleName: role?.name || '',
          roleCode: role?.code || '',
        };
      });

    onChange([...value, ...newRoles]);
    setSelectedRoleIds([]);
  };

  const handleRemoveRole = (roleId: string): void => {
    onChange(value.filter((r) => r.roleId !== roleId));
  };

  const availableRoles = roles
    .filter((role) => !value.some((v) => v.roleId === role.id))
    .map((role) => ({
      value: role.id,
      label: role.name,
    }));

  return (
    <Stack gap="md">
      <Text fw={500} size="sm">
        {t('roleManagement.assignRole')}
      </Text>

      {/* Role Selection */}
      <Group gap="sm">
        <MultiSelect
          placeholder={t('roleManagement.searchRoles')}
          data={availableRoles}
          value={selectedRoleIds}
          onChange={setSelectedRoleIds}
          disabled={disabled || loading}
          searchable
          style={{ flex: 1 }}
        />
        <Button onClick={handleAddRoles} disabled={disabled || selectedRoleIds.length === 0} variant="light">
          Add
        </Button>
      </Group>

      {/* Assigned Roles */}
      {value.length > 0 && (
        <Stack gap="xs">
          <Text size="sm" c="dimmed">
            Assigned Roles ({value.length})
          </Text>
          <Group gap="xs">
            {value.map((role) => (
              <Badge
                key={role.roleId}
                size="lg"
                variant="light"
                rightSection={
                  !disabled && (
                    <ActionIcon
                      size="xs"
                      color="red"
                      variant="transparent"
                      onClick={() => handleRemoveRole(role.roleId)}
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  )
                }
              >
                {role.roleName}
              </Badge>
            ))}
          </Group>
        </Stack>
      )}

      {value.length === 0 && (
        <Text size="sm" c="dimmed">
          No roles assigned. Select roles from the dropdown to assign.
        </Text>
      )}
    </Stack>
  );
}
