// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Table, Checkbox, Text, Stack, Group, Button, Skeleton, Box } from '@mantine/core';
import { IconRefresh, IconDeviceFloppy } from '@tabler/icons-react';
import type { PermissionRow } from '../../types/account-management';
import { PERMISSION_RESOURCES, PERMISSION_OPERATIONS } from '../../types/account-management';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Props for PermissionMatrix component
 */
export interface PermissionMatrixProps {
  /** Permission rows to display */
  permissions: PermissionRow[];
  /** Whether the matrix is in read-only mode */
  readOnly?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Whether there are unsaved changes */
  hasChanges?: boolean;
  /** Callback when a permission is toggled */
  onPermissionChange?: (resourceType: string, operation: string, value: boolean) => void;
  /** Callback to save permissions */
  onSave?: () => Promise<void>;
  /** Callback to refresh permissions */
  onRefresh?: () => Promise<void>;
}

/**
 * PermissionMatrix - Grid/table showing resources vs operations
 *
 * Displays a matrix of FHIR resource types (rows) vs CRUD operations (columns).
 * Each cell contains a checkbox to toggle permissions.
 * When update/delete is enabled, read is auto-enabled (dependency).
 *
 * Features:
 * - Mobile-first responsive design
 * - Turquoise gradient header theme
 * - Auto-enable dependencies (update requires read)
 * - Read-only mode for preview
 * - Save/refresh actions
 *
 * @example
 * ```tsx
 * <PermissionMatrix
 *   permissions={permissions}
 *   onPermissionChange={(resource, op, value) => updatePermission(resource, op, value)}
 *   onSave={savePermissions}
 *   hasChanges={hasChanges}
 * />
 * ```
 */
export function PermissionMatrix({
  permissions,
  readOnly = false,
  loading = false,
  hasChanges = false,
  onPermissionChange,
  onSave,
  onRefresh,
}: PermissionMatrixProps): JSX.Element {
  const { t } = useTranslation();

  // Create a map for quick lookup
  const permissionMap = new Map(permissions.map((p) => [p.resourceType, p]));

  // Operation labels with translations
  const operationLabels: Record<string, string> = {
    create: t('accountManagement.permissions.create'),
    read: t('accountManagement.permissions.read'),
    update: t('accountManagement.permissions.update'),
    delete: t('accountManagement.permissions.delete'),
    search: t('accountManagement.permissions.search'),
  };

  /**
   * Handle checkbox toggle
   */
  const handleToggle = (resourceType: string, operation: string, currentValue: boolean) => {
    if (readOnly || !onPermissionChange) {
      return;
    }
    onPermissionChange(resourceType, operation, !currentValue);
  };

  /**
   * Check if a permission is enabled
   */
  const isEnabled = (resourceType: string, operation: string): boolean => {
    const row = permissionMap.get(resourceType);
    if (!row) {
      return false;
    }
    return row[operation as keyof PermissionRow] as boolean;
  };

  /**
   * Handle save button click
   */
  const handleSave = async () => {
    if (onSave) {
      await onSave();
    }
  };

  /**
   * Handle refresh button click
   */
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  if (loading) {
    return (
      <Stack gap="md">
        <Skeleton height={40} />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} height={32} />
        ))}
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {/* Title and Actions */}
      <Group justify="space-between" align="center">
        <Text fw={600} size="lg" c="var(--emr-primary)">
          {t('accountManagement.permissions.matrix')}
        </Text>

        {!readOnly && (
          <Group gap="sm">
            {onRefresh && (
              <Button
                variant="light"
                size="sm"
                leftSection={<IconRefresh size={16} />}
                onClick={handleRefresh}
              >
                {t('common.refresh') || 'Refresh'}
              </Button>
            )}
            {onSave && (
              <Button
                size="sm"
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={handleSave}
                disabled={!hasChanges}
                style={{
                  background: hasChanges ? 'var(--emr-gradient-primary)' : undefined,
                }}
              >
                {t('accountManagement.form.save')}
              </Button>
            )}
          </Group>
        )}
      </Group>

      {/* Matrix Table */}
      <Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          styles={{
            table: {
              minWidth: '600px',
            },
            thead: {
              background: 'var(--emr-gradient-submenu)',
            },
            th: {
              color: 'white',
              fontWeight: 600,
              textAlign: 'center',
              padding: '12px 8px',
            },
            td: {
              textAlign: 'center',
              padding: '10px 8px',
            },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ textAlign: 'left', minWidth: '150px' }}>
                Resource
              </Table.Th>
              {PERMISSION_OPERATIONS.map((op) => (
                <Table.Th key={op}>{operationLabels[op]}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {PERMISSION_RESOURCES.map((resourceType) => (
              <Table.Tr key={resourceType}>
                <Table.Td style={{ textAlign: 'left', fontWeight: 500 }}>
                  {resourceType}
                </Table.Td>
                {PERMISSION_OPERATIONS.map((operation) => {
                  const enabled = isEnabled(resourceType, operation);
                  return (
                    <Table.Td key={operation}>
                      <Checkbox
                        checked={enabled}
                        onChange={() => handleToggle(resourceType, operation, enabled)}
                        disabled={readOnly}
                        styles={{
                          input: {
                            cursor: readOnly ? 'default' : 'pointer',
                          },
                        }}
                        aria-label={`${resourceType} ${operation}`}
                      />
                    </Table.Td>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      {/* Unsaved Changes Indicator */}
      {hasChanges && !readOnly && (
        <Text size="sm" c="orange" ta="right">
          {t('formUI.messages.unsavedChanges') || 'You have unsaved changes'}
        </Text>
      )}
    </Stack>
  );
}
