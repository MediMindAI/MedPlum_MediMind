// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo, useState } from 'react';
import { Stack, Paper, Group, Text, Box, Collapse, Checkbox, Badge, Button, Loader } from '@mantine/core';
import {
  IconRefresh,
  IconDeviceFloppy,
  IconShieldCheck,
  IconKey,
  IconChevronDown,
  IconChevronRight,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { getPermissionTree, resolvePermissionDependencies } from '../../services/permissionService';
import { useTranslation } from '../../hooks/useTranslation';
import type { PermissionCategory, Permission } from '../../types/role-management';
import styles from './PermissionMatrix.module.css';

/**
 * Props for PermissionMatrix component (EMR Permissions version)
 */
export interface PermissionMatrixProps {
  /** Selected permission codes */
  selectedPermissions: string[];
  /** Whether the matrix is in read-only mode */
  readOnly?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Whether there are unsaved changes */
  hasChanges?: boolean;
  /** Callback when a permission is toggled */
  onPermissionChange?: (permissionCode: string, value: boolean) => void;
  /** Callback to save permissions */
  onSave?: () => Promise<void>;
  /** Callback to refresh permissions */
  onRefresh?: () => Promise<void>;
}

/**
 * PermissionMatrix - EMR Permissions with 8 Categories
 *
 * Displays 104 granular EMR permissions organized in 8 collapsible categories:
 * - Patient Management (15 permissions)
 * - Clinical Documentation (18 permissions)
 * - Laboratory (12 permissions)
 * - Billing & Financial (15 permissions)
 * - Administration (18 permissions)
 * - Reports (10 permissions)
 * - Nomenclature (8 permissions)
 * - Scheduling (8 permissions)
 *
 * Features:
 * - Collapsible category groups
 * - Permission dependency resolution (edit requires view)
 * - Select all / Clear all per category
 * - Dangerous permission badges
 * - Inherited permission indicators
 */
export function PermissionMatrix({
  selectedPermissions = [],
  readOnly = false,
  loading = false,
  hasChanges = false,
  onPermissionChange,
  onSave,
  onRefresh,
}: PermissionMatrixProps): JSX.Element {
  const { t, lang } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Ensure selectedPermissions is always an array
  const safeSelectedPermissions = selectedPermissions || [];

  // Get permission tree with translations
  const categories = useMemo(() => getPermissionTree(lang as 'ka' | 'en' | 'ru'), [lang]);

  // Calculate inherited permissions (auto-enabled due to dependencies)
  const allPermissionsWithDeps = useMemo(
    () => resolvePermissionDependencies(safeSelectedPermissions),
    [safeSelectedPermissions]
  );

  const inheritedPermissions = useMemo(
    () => allPermissionsWithDeps.filter((p) => !safeSelectedPermissions.includes(p)),
    [allPermissionsWithDeps, safeSelectedPermissions]
  );

  // Calculate total permissions count
  const totalPermissions = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.permissions.length, 0),
    [categories]
  );

  const selectedCount = allPermissionsWithDeps.length;

  // Handle save
  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.matrixContainer}>
        <div className={styles.skeletonContainer}>
          <div className={styles.skeletonHeader} />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Stack gap="md">
      {/* Header Section */}
      <Paper p="md" withBorder style={{ background: 'var(--emr-gray-50)' }}>
        <Group justify="space-between">
          <Group gap="sm">
            <Box
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, rgba(23, 162, 184, 0.15) 0%, rgba(43, 108, 176, 0.15) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconShieldCheck size={22} style={{ color: 'var(--emr-turquoise)' }} />
            </Box>
            <div>
              <Text size="sm" fw={600} style={{ color: 'var(--emr-text-primary)' }}>
                {t('accountManagement.permissions.matrix')}
              </Text>
              <Text size="xs" style={{ color: 'var(--emr-gray-500)' }}>
                {t('roleManagement.form.selectPermissions')}
              </Text>
            </div>
          </Group>

          <Group gap="md">
            {/* Stats */}
            <div style={{ textAlign: 'right' }}>
              <Text size="xl" fw={700} style={{ color: 'var(--emr-turquoise)' }}>
                {selectedCount}
              </Text>
              <Text size="xs" style={{ color: 'var(--emr-gray-500)' }}>
                {t('accountManagement.permissions.ofTotal', { total: totalPermissions }) || `of ${totalPermissions}`}
              </Text>
            </div>

            {/* Action Buttons */}
            {!readOnly && (
              <Group gap="xs">
                {onRefresh && (
                  <Button
                    variant="subtle"
                    size="sm"
                    leftSection={refreshing ? <Loader size={14} /> : <IconRefresh size={16} />}
                    onClick={handleRefresh}
                    disabled={refreshing}
                    style={{ color: 'var(--emr-gray-600)' }}
                  >
                    {t('common.refresh')}
                  </Button>
                )}
                {onSave && (
                  <Button
                    size="sm"
                    leftSection={saving ? <Loader size={14} color="white" /> : <IconDeviceFloppy size={16} />}
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    style={{
                      background: hasChanges
                        ? 'linear-gradient(135deg, var(--emr-turquoise) 0%, #138496 100%)'
                        : 'var(--emr-gray-300)',
                    }}
                  >
                    {t('common.save')}
                  </Button>
                )}
              </Group>
            )}
          </Group>
        </Group>

        {/* Inherited permissions info */}
        {inheritedPermissions.length > 0 && (
          <Text size="xs" mt="sm" style={{ color: 'var(--emr-gray-600)' }}>
            <IconKey size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {inheritedPermissions.length} {t('roleManagement.form.autoEnabled')}
          </Text>
        )}
      </Paper>

      {/* Permission Categories */}
      {categories.map((category) => (
        <CategoryPermissionGroup
          key={category.code}
          category={category}
          selectedPermissions={safeSelectedPermissions}
          inheritedPermissions={inheritedPermissions}
          readOnly={readOnly}
          onTogglePermission={(code) => onPermissionChange?.(code, !safeSelectedPermissions.includes(code))}
          onSelectAll={(codes) => {
            codes.forEach((code) => {
              if (!safeSelectedPermissions.includes(code)) {
                onPermissionChange?.(code, true);
              }
            });
          }}
          onClearAll={(codes) => {
            codes.forEach((code) => {
              if (safeSelectedPermissions.includes(code)) {
                onPermissionChange?.(code, false);
              }
            });
          }}
        />
      ))}

      {/* Unsaved Changes Indicator */}
      {hasChanges && !readOnly && (
        <Paper p="sm" withBorder style={{ background: 'rgba(251, 191, 36, 0.1)', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
          <Group gap="xs">
            <IconAlertTriangle size={16} style={{ color: '#f59e0b' }} />
            <Text size="sm" style={{ color: '#b45309' }}>
              {t('common.unsavedChanges') || 'You have unsaved changes'}
            </Text>
          </Group>
        </Paper>
      )}
    </Stack>
  );
}

/**
 * Props for CategoryPermissionGroup
 */
interface CategoryPermissionGroupProps {
  category: PermissionCategory;
  selectedPermissions: string[];
  inheritedPermissions: string[];
  readOnly: boolean;
  onTogglePermission: (code: string) => void;
  onSelectAll: (codes: string[]) => void;
  onClearAll: (codes: string[]) => void;
}

/**
 * Collapsible category group with permissions
 */
function CategoryPermissionGroup({
  category,
  selectedPermissions = [],
  inheritedPermissions = [],
  readOnly,
  onTogglePermission,
  onSelectAll,
  onClearAll,
}: CategoryPermissionGroupProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();

  // Ensure arrays are never undefined
  const safeSelectedPermissions = selectedPermissions || [];
  const safeInheritedPermissions = inheritedPermissions || [];

  const selectedCount = category.permissions.filter(
    (p) => safeSelectedPermissions.includes(p.code) || safeInheritedPermissions.includes(p.code)
  ).length;

  const allCodes = category.permissions.map((p) => p.code);
  const allSelected = selectedCount === category.permissions.length;

  return (
    <Paper p="sm" withBorder style={{ background: 'white' }}>
      {/* Category Header */}
      <Group justify="space-between">
        <Group
          gap="sm"
          onClick={() => setExpanded(!expanded)}
          style={{ cursor: 'pointer', flex: 1 }}
        >
          {expanded ? (
            <IconChevronDown size={18} style={{ color: 'var(--emr-gray-500)' }} />
          ) : (
            <IconChevronRight size={18} style={{ color: 'var(--emr-gray-500)' }} />
          )}
          <Text fw={500} style={{ color: 'var(--emr-text-primary)' }}>
            {category.name}
          </Text>
          <Badge
            size="sm"
            variant="light"
            color={selectedCount > 0 ? 'teal' : 'gray'}
          >
            {selectedCount}/{category.permissions.length}
          </Badge>
        </Group>

        {/* Select All / Clear All */}
        {!readOnly && expanded && (
          <Group gap="xs">
            <Button
              variant="subtle"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onSelectAll(allCodes);
              }}
              disabled={allSelected}
              style={{ color: 'var(--emr-turquoise)' }}
            >
              {t('common.selectAll')}
            </Button>
            <Button
              variant="subtle"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onClearAll(allCodes);
              }}
              disabled={selectedCount === 0}
              style={{ color: 'var(--emr-gray-500)' }}
            >
              {t('common.clearAll')}
            </Button>
          </Group>
        )}
      </Group>

      {/* Permissions List */}
      <Collapse in={expanded}>
        <Stack gap="xs" mt="md" pl="md">
          {category.permissions.map((permission) => (
            <PermissionCheckboxItem
              key={permission.code}
              permission={permission}
              checked={safeSelectedPermissions.includes(permission.code)}
              inherited={safeInheritedPermissions.includes(permission.code)}
              disabled={readOnly}
              onChange={() => onTogglePermission(permission.code)}
            />
          ))}
        </Stack>
      </Collapse>
    </Paper>
  );
}

/**
 * Props for PermissionCheckboxItem
 */
interface PermissionCheckboxItemProps {
  permission: Permission;
  checked: boolean;
  inherited: boolean;
  disabled: boolean;
  onChange: () => void;
}

/**
 * Individual permission checkbox with badges
 */
function PermissionCheckboxItem({
  permission,
  checked,
  inherited,
  disabled,
  onChange,
}: PermissionCheckboxItemProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <Checkbox
      label={
        <Group gap="xs">
          <Text size="sm" style={{ color: 'var(--emr-text-primary)' }}>
            {permission.name}
          </Text>
          {inherited && (
            <Badge size="xs" variant="outline" color="gray">
              {t('roleManagement.form.autoEnabled')}
            </Badge>
          )}
          {permission.dangerous && (
            <Badge size="xs" color="red" variant="light">
              {t('roleManagement.form.dangerous')}
            </Badge>
          )}
        </Group>
      }
      description={permission.description}
      checked={checked || inherited}
      disabled={disabled || inherited}
      onChange={() => {
        if (!disabled && !inherited) {
          onChange();
        }
      }}
      styles={{
        root: {
          padding: '8px 12px',
          borderRadius: 8,
          background: checked || inherited ? 'rgba(23, 162, 184, 0.05)' : 'transparent',
          border: `1px solid ${checked || inherited ? 'rgba(23, 162, 184, 0.2)' : 'transparent'}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            background: 'rgba(23, 162, 184, 0.08)',
          },
        },
        label: {
          cursor: disabled || inherited ? 'not-allowed' : 'pointer',
        },
        description: {
          color: 'var(--emr-gray-500)',
          fontSize: 12,
        },
      }}
    />
  );
}

export default PermissionMatrix;
