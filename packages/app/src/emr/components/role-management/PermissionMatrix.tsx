// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from 'react';
import { Stack, Paper, Group, Text, Box } from '@mantine/core';
import { IconKey } from '@tabler/icons-react';
import { CategoryPermissionGroup } from './CategoryPermissionGroup';
import { getPermissionTree, resolvePermissionDependencies } from '../../services/permissionService';
import { useTranslation } from '../../hooks/useTranslation';

interface PermissionMatrixProps {
  selectedPermissions: string[];
  onTogglePermission: (code: string) => void;
}

/**
 * Visual permission matrix UI with 8 collapsible categories
 * Displays all permissions organized by category with dependency resolution
 *
 * @param props.selectedPermissions - Array of selected permission codes
 * @param props.onTogglePermission - Callback when permission is toggled
 */
export function PermissionMatrix({ selectedPermissions, onTogglePermission }: PermissionMatrixProps): React.ReactElement {
  const { lang } = useTranslation();

  // Get permission tree with translations
  const categories = useMemo(() => getPermissionTree(lang), [lang]);

  // Calculate inherited permissions (auto-enabled due to dependencies)
  const allPermissionsWithDeps = useMemo(
    () => resolvePermissionDependencies(selectedPermissions),
    [selectedPermissions]
  );

  const inheritedPermissions = useMemo(
    () => allPermissionsWithDeps.filter((p) => !selectedPermissions.includes(p)),
    [allPermissionsWithDeps, selectedPermissions]
  );

  // Calculate total permissions count
  const totalPermissions = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.permissions.length, 0),
    [categories]
  );

  const selectedCount = allPermissionsWithDeps.length;

  return (
    <Stack gap="md">
      {/* Header showing total selected/total permissions */}
      <Paper p="md" withBorder style={{ background: 'var(--emr-gray-50)' }}>
        <Group justify="space-between">
          <Group gap="sm">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(43, 108, 176, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconKey size={18} style={{ color: 'var(--emr-secondary)' }} />
            </Box>
            <div>
              <Text size="sm" fw={600} style={{ color: 'var(--emr-text-primary)' }}>
                Permissions Configuration
              </Text>
              <Text size="xs" style={{ color: 'var(--emr-gray-500)' }}>
                Select permissions for this role
              </Text>
            </div>
          </Group>
          <div style={{ textAlign: 'right' }}>
            <Text size="xl" fw={700} style={{ color: 'var(--emr-secondary)' }}>
              {selectedCount}
            </Text>
            <Text size="xs" style={{ color: 'var(--emr-gray-500)' }}>
              of {totalPermissions} permissions
            </Text>
          </div>
        </Group>

        {/* Show inherited permissions info */}
        {inheritedPermissions.length > 0 && (
          <Text size="xs" mt="sm" style={{ color: 'var(--emr-gray-600)' }}>
            {inheritedPermissions.length} permission{inheritedPermissions.length > 1 ? 's' : ''} auto-enabled due to
            dependencies
          </Text>
        )}
      </Paper>

      {/* Render all 8 categories */}
      {categories.map((category) => (
        <CategoryPermissionGroup
          key={category.code}
          category={category}
          selectedPermissions={selectedPermissions}
          onTogglePermission={onTogglePermission}
          inheritedPermissions={inheritedPermissions}
        />
      ))}
    </Stack>
  );
}
