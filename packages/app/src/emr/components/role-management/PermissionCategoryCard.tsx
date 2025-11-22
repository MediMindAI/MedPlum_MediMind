// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Card, Text, Stack, Checkbox, Group } from '@mantine/core';
import type { PermissionCategory } from '../../types/role-management';

interface PermissionCategoryCardProps {
  category: PermissionCategory;
  selectedPermissions: string[];
  onChange: (permissionCode: string, checked: boolean) => void;
  disabled?: boolean;
}

/**
 * Card displaying a permission category with its permissions
 * Alternative to tree view for grid layout
 * @param root0 - Component props
 * @param root0.category - Permission category to display
 * @param root0.selectedPermissions - Currently selected permission codes
 * @param root0.onChange - Callback when permission is toggled
 * @param root0.disabled - Whether the card is disabled
 * @returns Permission category card component
 */
export function PermissionCategoryCard({
  category,
  selectedPermissions,
  onChange,
  disabled,
}: PermissionCategoryCardProps): JSX.Element {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600} size="lg">
            {category.name}
          </Text>
          <Text size="sm" c="dimmed">
            {category.permissions.length} permissions
          </Text>
        </Group>

        <Text size="sm" c="dimmed">
          {category.description}
        </Text>

        <Stack gap="xs">
          {category.permissions.map((permission) => (
            <Checkbox
              key={permission.code}
              checked={selectedPermissions.includes(permission.code)}
              onChange={(e) => onChange(permission.code, e.currentTarget.checked)}
              disabled={disabled}
              label={
                <div>
                  <Text size="sm">{permission.name}</Text>
                  <Text size="xs" c="dimmed">
                    {permission.description}
                  </Text>
                </div>
              }
            />
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}
