// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useState, useMemo } from 'react';
import { Stack, Text, Group, Collapse, ActionIcon, Box } from '@mantine/core';
import { EMRCheckbox } from '../shared/EMRFormFields';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import type { PermissionCategory } from '../../types/role-management';
import { resolvePermissionDependencies } from '../../services/permissionService';
import { usePermissions } from '../../hooks/usePermissions';

interface PermissionTreeProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

/**
 * Hierarchical permission tree with expand/collapse and checkbox selection
 *
 * Features:
 * - 6 permission categories
 * - Auto-enable dependencies when permission selected
 * - Expand/collapse categories
 * - Category-level select all
 * @param root0 - Component props
 * @param root0.selectedPermissions - Currently selected permission codes
 * @param root0.onChange - Callback when permissions change
 * @param root0.disabled - Whether the tree is disabled
 * @returns Permission tree component
 */
export function PermissionTree({ selectedPermissions, onChange, disabled }: PermissionTreeProps): JSX.Element {
  const { categories, loading } = usePermissions();

  // Auto-expand all categories initially
  const initialExpanded = useMemo(() => new Set(categories.map((c) => c.code)), [categories]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(initialExpanded);

  const toggleCategory = (categoryCode: string): void => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryCode)) {
      newExpanded.delete(categoryCode);
    } else {
      newExpanded.add(categoryCode);
    }
    setExpandedCategories(newExpanded);
  };

  const handlePermissionToggle = (permissionCode: string, checked: boolean): void => {
    let newPermissions: string[];

    if (checked) {
      // Add permission and resolve dependencies
      newPermissions = resolvePermissionDependencies([...selectedPermissions, permissionCode]);
    } else {
      // Remove permission
      newPermissions = selectedPermissions.filter((p) => p !== permissionCode);
    }

    onChange(newPermissions);
  };

  const handleCategoryToggle = (category: PermissionCategory, checked: boolean): void => {
    const categoryPermissionCodes = category.permissions.map((p) => p.code);

    let newPermissions: string[];
    if (checked) {
      // Add all category permissions
      newPermissions = resolvePermissionDependencies([...selectedPermissions, ...categoryPermissionCodes]);
    } else {
      // Remove all category permissions
      newPermissions = selectedPermissions.filter((p) => !categoryPermissionCodes.includes(p));
    }

    onChange(newPermissions);
  };

  const isCategoryChecked = (category: PermissionCategory): boolean => {
    return category.permissions.every((p) => selectedPermissions.includes(p.code));
  };

  const isCategoryIndeterminate = (category: PermissionCategory): boolean => {
    const selected = category.permissions.filter((p) => selectedPermissions.includes(p.code));
    return selected.length > 0 && selected.length < category.permissions.length;
  };

  if (loading) {
    return <Text c="dimmed">Loading permissions...</Text>;
  }

  return (
    <Stack gap="md">
      {categories.map((category) => {
        const isExpanded = expandedCategories.has(category.code);
        const isChecked = isCategoryChecked(category);
        const isIndeterminate = isCategoryIndeterminate(category);

        return (
          <Box key={category.code} style={{ borderLeft: '3px solid var(--emr-turquoise)', paddingLeft: '12px' }}>
            <Group gap="xs" mb="xs">
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => toggleCategory(category.code)}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
              </ActionIcon>

              <EMRCheckbox
                checked={isChecked}
                indeterminate={isIndeterminate}
                onChange={(e) => handleCategoryToggle(category, e.currentTarget.checked)}
                disabled={disabled}
                label={
                  <Group gap="xs">
                    <Text fw={600}>{category.name}</Text>
                    <Text size="sm" c="dimmed">
                      ({category.permissions.length} permissions)
                    </Text>
                  </Group>
                }
              />
            </Group>

            <Collapse in={isExpanded}>
              <Stack gap="xs" ml="xl">
                {category.permissions.map((permission) => (
                  <EMRCheckbox
                    key={permission.code}
                    checked={selectedPermissions.includes(permission.code)}
                    onChange={(e) => handlePermissionToggle(permission.code, e.currentTarget.checked)}
                    disabled={disabled}
                    label={
                      <Box>
                        <Text size="sm">{permission.name}</Text>
                        <Text size="xs" c="dimmed">
                          {permission.description}
                        </Text>
                      </Box>
                    }
                  />
                ))}
              </Stack>
            </Collapse>
          </Box>
        );
      })}
    </Stack>
  );
}
