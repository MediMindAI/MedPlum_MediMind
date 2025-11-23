// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Accordion, Badge, Group, Text, Stack, Skeleton, Box, ThemeIcon } from '@mantine/core';
import {
  IconEye,
  IconPlus,
  IconPencil,
  IconTrash,
  IconSearch,
  IconShieldCheck,
  IconShieldOff,
} from '@tabler/icons-react';
import type { PermissionRow } from '../../types/account-management';
import { PERMISSION_OPERATIONS } from '../../types/account-management';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Props for PermissionPreview component
 */
export interface PermissionPreviewProps {
  /** Permission rows to display */
  permissions: PermissionRow[];
  /** Loading state */
  loading?: boolean;
  /** Title for the accordion */
  title?: string;
  /** Default expanded state */
  defaultExpanded?: boolean;
}

/**
 * Operation icons mapping
 */
const operationIcons: Record<string, React.ReactNode> = {
  create: <IconPlus size={14} />,
  read: <IconEye size={14} />,
  update: <IconPencil size={14} />,
  delete: <IconTrash size={14} />,
  search: <IconSearch size={14} />,
};

/**
 * PermissionPreview - Read-only accordion showing combined permissions
 *
 * Displays permissions grouped by resource type in a collapsible accordion.
 * Shows which operations are allowed for each resource type.
 * Used to preview what permissions a user will have based on selected roles.
 *
 * Features:
 * - Collapsible accordion sections per resource type
 * - Badge indicators for each operation
 * - Icons for quick visual reference
 * - Read-only (no editing)
 * - Mobile-friendly layout
 *
 * @example
 * ```tsx
 * <PermissionPreview
 *   permissions={combinedPermissions}
 *   title="Permission Preview"
 *   defaultExpanded={false}
 * />
 * ```
 */
export function PermissionPreview({
  permissions,
  loading = false,
  title,
  defaultExpanded = false,
}: PermissionPreviewProps): JSX.Element {
  const { t } = useTranslation();

  // Operation labels with translations
  const operationLabels: Record<string, string> = {
    create: t('accountManagement.permissions.create'),
    read: t('accountManagement.permissions.read'),
    update: t('accountManagement.permissions.update'),
    delete: t('accountManagement.permissions.delete'),
    search: t('accountManagement.permissions.search'),
  };

  /**
   * Get enabled operations for a resource
   */
  const getEnabledOperations = (row: PermissionRow): string[] => {
    return PERMISSION_OPERATIONS.filter((op) => row[op as keyof PermissionRow] as boolean);
  };

  /**
   * Check if any permission is enabled for a resource
   */
  const hasAnyPermission = (row: PermissionRow): boolean => {
    return getEnabledOperations(row).length > 0;
  };

  /**
   * Count total enabled permissions
   */
  const totalEnabledCount = permissions.reduce(
    (acc, row) => acc + getEnabledOperations(row).length,
    0
  );

  /**
   * Count resources with at least one permission
   */
  const resourcesWithPermissions = permissions.filter((row) => hasAnyPermission(row)).length;

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton height={40} />
        <Skeleton height={100} />
      </Stack>
    );
  }

  // Filter to only show resources with permissions
  const visiblePermissions = permissions.filter((row) => hasAnyPermission(row));

  return (
    <Accordion
      variant="separated"
      defaultValue={defaultExpanded ? 'permissions' : undefined}
      styles={{
        control: {
          background: 'var(--emr-section-header-bg)',
          borderRadius: 'var(--emr-border-radius-lg)',
        },
        content: {
          padding: '16px',
        },
        item: {
          border: '1px solid var(--emr-gray-200)',
          borderRadius: 'var(--emr-border-radius-lg)',
        },
      }}
    >
      <Accordion.Item value="permissions">
        <Accordion.Control>
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm">
              <ThemeIcon variant="light" color="blue" size="md">
                <IconShieldCheck size={16} />
              </ThemeIcon>
              <Text fw={600} c="var(--emr-primary)">
                {title || t('accountManagement.permissions.title')}
              </Text>
            </Group>
            <Group gap="xs">
              <Badge color="blue" variant="light" size="sm">
                {resourcesWithPermissions} resources
              </Badge>
              <Badge color="green" variant="light" size="sm">
                {totalEnabledCount} permissions
              </Badge>
            </Group>
          </Group>
        </Accordion.Control>

        <Accordion.Panel>
          {visiblePermissions.length === 0 ? (
            <Group justify="center" py="xl">
              <ThemeIcon variant="light" color="gray" size="xl" radius="xl">
                <IconShieldOff size={24} />
              </ThemeIcon>
              <Text c="dimmed" size="sm">
                {t('roleManagement.noPermissionsSelected')}
              </Text>
            </Group>
          ) : (
            <Stack gap="sm">
              {visiblePermissions.map((row) => {
                const enabledOps = getEnabledOperations(row);

                return (
                  <Box
                    key={row.resourceType}
                    style={{
                      background: 'var(--emr-text-inverse)',
                      padding: '12px 16px',
                      borderRadius: 'var(--emr-border-radius-lg)',
                      border: '1px solid var(--emr-gray-200)',
                    }}
                  >
                    <Group justify="space-between" wrap="wrap" gap="sm">
                      <Text fw={500} size="sm">
                        {row.resourceType}
                      </Text>
                      <Group gap="xs">
                        {PERMISSION_OPERATIONS.map((op) => {
                          const enabled = enabledOps.includes(op);
                          return (
                            <Badge
                              key={op}
                              color={enabled ? 'green' : 'gray'}
                              variant={enabled ? 'light' : 'outline'}
                              size="sm"
                              leftSection={operationIcons[op]}
                              styles={{
                                root: {
                                  opacity: enabled ? 1 : 0.4,
                                },
                              }}
                            >
                              {operationLabels[op]}
                            </Badge>
                          );
                        })}
                      </Group>
                    </Group>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
