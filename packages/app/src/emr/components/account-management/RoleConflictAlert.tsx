// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Alert, Stack, Text, Badge, Group } from '@mantine/core';
import { IconAlertTriangle, IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import type { RoleConflict } from '../../types/account-management';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Props for RoleConflictAlert component
 */
export interface RoleConflictAlertProps {
  /** Array of role conflicts to display */
  conflicts: RoleConflict[];
}

/**
 * Get icon for conflict type
 */
function getConflictIcon(type: RoleConflict['type']): React.ReactNode {
  switch (type) {
    case 'separation_of_duties':
      return <IconAlertTriangle size={20} />;
    case 'redundant_roles':
      return <IconInfoCircle size={20} />;
    case 'permission_conflict':
      return <IconAlertCircle size={20} />;
    default:
      return <IconAlertCircle size={20} />;
  }
}

/**
 * Get color for conflict severity
 */
function getConflictColor(severity: RoleConflict['severity']): string {
  switch (severity) {
    case 'error':
      return 'red';
    case 'warning':
      return 'yellow';
    default:
      return 'blue';
  }
}

/**
 * RoleConflictAlert - Alert banner for role conflict warnings
 *
 * Displays alerts when role conflicts are detected:
 * - separation_of_duties: Error (red) - Admin + Billing roles combined
 * - redundant_roles: Warning (yellow) - Higher role includes lower role permissions
 * - permission_conflict: Warning (yellow) - Read-only and write roles combined
 *
 * Features:
 * - Color-coded by severity (red for error, yellow for warning)
 * - Icon indicators for conflict type
 * - Displays affected role names
 * - Detailed conflict message
 * - Non-blocking (doesn't prevent selection)
 *
 * @example
 * ```tsx
 * const conflicts = detectRoleConflicts(['admin', 'billing']);
 * if (conflicts.length > 0) {
 *   return <RoleConflictAlert conflicts={conflicts} />;
 * }
 * ```
 */
export function RoleConflictAlert({ conflicts }: RoleConflictAlertProps): JSX.Element | null {
  const { t } = useTranslation();

  if (!conflicts || conflicts.length === 0) {
    return null;
  }

  /**
   * Get translated title for conflict type
   */
  const getConflictTitle = (type: RoleConflict['type']): string => {
    switch (type) {
      case 'separation_of_duties':
        return t('accountManagement.permissions.conflictSeparation');
      case 'redundant_roles':
        return t('accountManagement.permissions.conflictRedundant');
      case 'permission_conflict':
        return t('accountManagement.permissions.conflictWarning');
      default:
        return t('accountManagement.permissions.conflictWarning');
    }
  };

  return (
    <Stack gap="sm">
      {conflicts.map((conflict, index) => (
        <Alert
          key={`${conflict.type}-${index}`}
          icon={getConflictIcon(conflict.type)}
          title={getConflictTitle(conflict.type)}
          color={getConflictColor(conflict.severity)}
          variant="filled"
          styles={{
            root: {
              background:
                conflict.severity === 'error'
                  ? 'linear-gradient(135deg, #c92a2a 0%, #e03131 100%)'
                  : 'linear-gradient(135deg, #f59f00 0%, #fd7e14 100%)',
            },
            title: {
              color: 'white',
              fontWeight: 600,
            },
            message: {
              color: 'white',
            },
          }}
        >
          <Stack gap="xs">
            <Text size="sm">{conflict.message}</Text>

            <Group gap="xs" mt="xs">
              <Text size="xs" fw={500} opacity={0.9}>
                Affected roles:
              </Text>
              {conflict.roles.map((role) => (
                <Badge
                  key={role}
                  color="white"
                  variant="outline"
                  size="sm"
                  styles={{
                    root: {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      color: 'white',
                    },
                  }}
                >
                  {role}
                </Badge>
              ))}
            </Group>
          </Stack>
        </Alert>
      ))}
    </Stack>
  );
}
