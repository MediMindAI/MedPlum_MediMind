// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useState, useMemo } from 'react';
import { Stack, Text, Group, Collapse, ActionIcon, Box, Badge, ThemeIcon, Paper, SimpleGrid } from '@mantine/core';
import { EMRCheckbox } from '../shared/EMRFormFields';
import {
  IconChevronDown,
  IconChevronRight,
  IconUsers,
  IconStethoscope,
  IconFlask,
  IconCoin,
  IconSettings,
  IconChartBar,
} from '@tabler/icons-react';
import type { PermissionCategory } from '../../types/role-management';
import { resolvePermissionDependencies } from '../../services/permissionService';
import { usePermissions } from '../../hooks/usePermissions';

// Category icons and colors mapping
const categoryStyles: Record<string, { icon: typeof IconUsers; color: string; gradient: string }> = {
  'patient-management': {
    icon: IconUsers,
    color: '#2b6cb0',
    gradient: 'linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)',
  },
  'clinical-documentation': {
    icon: IconStethoscope,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  },
  laboratory: {
    icon: IconFlask,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
  },
  'billing-financial': {
    icon: IconCoin,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
  },
  administration: {
    icon: IconSettings,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
  },
  reporting: {
    icon: IconChartBar,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
  },
};

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

  // Count selected permissions
  const selectedCount = selectedPermissions.length;
  const totalCount = categories.reduce((sum, c) => sum + c.permissions.length, 0);

  if (loading) {
    return <Text c="dimmed">Loading permissions...</Text>;
  }

  return (
    <Stack gap="md">
      {/* Selected permissions summary */}
      <Group justify="space-between" align="center">
        <Text size="sm" fw={500} c="dimmed">
          {selectedCount} / {totalCount} permissions selected
        </Text>
        {selectedCount > 0 && (
          <Badge
            size="sm"
            variant="light"
            style={{
              background: 'var(--emr-light-accent)',
              color: 'var(--emr-secondary)',
            }}
          >
            {Math.round((selectedCount / totalCount) * 100)}% coverage
          </Badge>
        )}
      </Group>

      {/* Permission categories in a grid */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category.code);
          const isChecked = isCategoryChecked(category);
          const isIndeterminate = isCategoryIndeterminate(category);
          const categorySelectedCount = category.permissions.filter((p) =>
            selectedPermissions.includes(p.code)
          ).length;

          // Get category styling (fallback to default)
          const style = categoryStyles[category.code] || {
            icon: IconUsers,
            color: 'var(--emr-secondary)',
            gradient: 'var(--emr-gradient-primary)',
          };
          const CategoryIcon = style.icon;

          return (
            <Paper
              key={category.code}
              p="sm"
              withBorder
              style={{
                borderRadius: 'var(--emr-border-radius-lg)',
                borderColor: isChecked ? style.color : 'var(--emr-gray-200)',
                borderWidth: isChecked ? '2px' : '1px',
                background: isChecked ? `${style.color}08` : 'var(--emr-text-inverse)',
                transition: 'var(--emr-transition-smooth)',
              }}
            >
              {/* Category Header */}
              <Group
                gap="sm"
                wrap="nowrap"
                style={{ cursor: 'pointer' }}
                onClick={() => toggleCategory(category.code)}
              >
                <ThemeIcon
                  size={36}
                  radius="md"
                  style={{
                    background: style.gradient,
                    flexShrink: 0,
                  }}
                >
                  <CategoryIcon size={18} style={{ color: 'white' }} />
                </ThemeIcon>

                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Group gap="xs" justify="space-between" wrap="nowrap">
                    <Text fw={600} size="sm" lineClamp={1}>
                      {category.name}
                    </Text>
                    <Badge
                      size="sm"
                      variant="light"
                      style={{
                        background: categorySelectedCount > 0 ? `${style.color}20` : 'var(--emr-gray-100)',
                        color: categorySelectedCount > 0 ? style.color : 'var(--emr-gray-500)',
                        flexShrink: 0,
                      }}
                    >
                      {categorySelectedCount}/{category.permissions.length}
                    </Badge>
                  </Group>
                </Box>

                <Group gap={4}>
                  <Box onClick={(e) => e.stopPropagation()}>
                    <EMRCheckbox
                      checked={isChecked}
                      indeterminate={isIndeterminate}
                      onChange={(checked) => handleCategoryToggle(category, checked)}
                      disabled={disabled}
                    />
                  </Box>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                  </ActionIcon>
                </Group>
              </Group>

              {/* Expanded Permissions */}
              <Collapse in={isExpanded}>
                <Stack gap={4} mt="sm" pl={44}>
                  {category.permissions.map((permission) => {
                    const isSelected = selectedPermissions.includes(permission.code);
                    return (
                      <Box
                        key={permission.code}
                        p={6}
                        style={{
                          borderRadius: 'var(--emr-border-radius-sm)',
                          background: isSelected ? `${style.color}10` : 'transparent',
                          transition: 'var(--emr-transition-fast)',
                        }}
                      >
                        <EMRCheckbox
                          checked={isSelected}
                          onChange={(checked) => handlePermissionToggle(permission.code, checked)}
                          disabled={disabled}
                          label={permission.name}
                        />
                        {permission.description && (
                          <Text size="xs" c="dimmed" ml={26} lineClamp={1}>
                            {permission.description}
                          </Text>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              </Collapse>
            </Paper>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
