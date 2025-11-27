// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react';
import { Paper, Group, Text, Collapse, Checkbox, Stack, Badge } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import type { PermissionCategory, Permission } from '../../types/role-management';

interface CategoryPermissionGroupProps {
  category: PermissionCategory;
  selectedPermissions: string[];
  onTogglePermission: (code: string) => void;
  /** Permissions that are auto-enabled due to dependencies */
  inheritedPermissions?: string[];
}

/**
 * Collapsible permission category group with checkbox list
 * Shows permission count badge and handles expand/collapse state
 */
export function CategoryPermissionGroup({
  category,
  selectedPermissions,
  onTogglePermission,
  inheritedPermissions = [],
}: CategoryPermissionGroupProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  const selectedCount = category.permissions.filter((p) => selectedPermissions.includes(p.code)).length;

  return (
    <Paper p="sm" withBorder>
      <Group onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }} justify="space-between">
        <Group>
          {expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          <Text fw={500}>{category.name}</Text>
          <Badge size="sm" variant="light">
            {selectedCount}/{category.permissions.length}
          </Badge>
        </Group>
      </Group>

      <Collapse in={expanded}>
        <Stack gap="xs" mt="sm" pl="md">
          {category.permissions.map((permission) => (
            <PermissionCheckbox
              key={permission.code}
              permission={permission}
              checked={selectedPermissions.includes(permission.code)}
              inherited={inheritedPermissions.includes(permission.code)}
              onChange={() => onTogglePermission(permission.code)}
            />
          ))}
        </Stack>
      </Collapse>
    </Paper>
  );
}

interface PermissionCheckboxProps {
  permission: Permission;
  checked: boolean;
  inherited: boolean;
  onChange: () => void;
}

/**
 * Individual permission checkbox with badges for inherited and dangerous permissions
 */
function PermissionCheckbox({ permission, checked, inherited, onChange }: PermissionCheckboxProps) {
  return (
    <Checkbox
      label={
        <Group gap="xs">
          <Text size="sm">{permission.name}</Text>
          {inherited && (
            <Badge size="xs" variant="outline" color="gray">
              auto-enabled
            </Badge>
          )}
          {permission.dangerous && (
            <Badge size="xs" color="red">
              dangerous
            </Badge>
          )}
        </Group>
      }
      description={permission.description}
      checked={checked || inherited}
      disabled={inherited}
      onChange={onChange}
    />
  );
}
