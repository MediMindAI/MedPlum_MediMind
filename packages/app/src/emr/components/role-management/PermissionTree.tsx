// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useState, useMemo } from 'react';
import { Stack, Text, Group, Collapse, Box, Badge, Paper, SimpleGrid, Progress, Tooltip } from '@mantine/core';
import { EMRCheckbox } from '../shared/EMRFormFields';
import {
  IconChevronDown,
  IconUsers,
  IconStethoscope,
  IconFlask,
  IconCoin,
  IconSettings,
  IconChartBar,
  IconCheck,
  IconCircleCheck,
} from '@tabler/icons-react';
import type { PermissionCategory } from '../../types/role-management';
import { resolvePermissionDependencies } from '../../services/permissionService';
import { usePermissions } from '../../hooks/usePermissions';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Category icons and colors - Using ONLY EMR theme colors
 *
 * Color Palette:
 * - Primary: #1a365d (dark navy)
 * - Secondary: #2b6cb0 (medium blue)
 * - Accent: #3182ce, #63b3ed (light blues)
 * - Turquoise: #17a2b8, #138496 (teal accents)
 */
const categoryStyles: Record<string, { icon: typeof IconUsers; color: string; gradient: string; lightBg: string }> = {
  'patient-management': {
    icon: IconUsers,
    color: '#1a365d',
    gradient: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)',
    lightBg: 'rgba(26, 54, 93, 0.08)',
  },
  'clinical-documentation': {
    icon: IconStethoscope,
    color: '#2b6cb0',
    gradient: 'linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%)',
    lightBg: 'rgba(43, 108, 176, 0.08)',
  },
  laboratory: {
    icon: IconFlask,
    color: '#3182ce',
    gradient: 'linear-gradient(135deg, #3182ce 0%, #63b3ed 100%)',
    lightBg: 'rgba(49, 130, 206, 0.08)',
  },
  'billing-financial': {
    icon: IconCoin,
    color: '#17a2b8',
    gradient: 'linear-gradient(135deg, #138496 0%, #17a2b8 100%)',
    lightBg: 'rgba(23, 162, 184, 0.08)',
  },
  administration: {
    icon: IconSettings,
    color: '#1a365d',
    gradient: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)',
    lightBg: 'rgba(26, 54, 93, 0.08)',
  },
  reporting: {
    icon: IconChartBar,
    color: '#63b3ed',
    gradient: 'linear-gradient(135deg, #3182ce 0%, #63b3ed 100%)',
    lightBg: 'rgba(99, 179, 237, 0.08)',
  },
};

interface PermissionTreeProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

/**
 * Premium Permission Tree with EMR Theme Colors
 *
 * Features:
 * - Glassmorphism category cards
 * - Smooth hover animations
 * - Blue/Turquoise color scheme only
 * - Elegant progress indicators
 */
export function PermissionTree({ selectedPermissions, onChange, disabled }: PermissionTreeProps): JSX.Element {
  const { categories, loading } = usePermissions();
  const { t, lang } = useTranslation();

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
      newPermissions = resolvePermissionDependencies([...selectedPermissions, permissionCode]);
    } else {
      newPermissions = selectedPermissions.filter((p) => p !== permissionCode);
    }
    onChange(newPermissions);
  };

  const handleCategoryToggle = (category: PermissionCategory, checked: boolean): void => {
    const categoryPermissionCodes = category.permissions.map((p) => p.code);
    let newPermissions: string[];
    if (checked) {
      newPermissions = resolvePermissionDependencies([...selectedPermissions, ...categoryPermissionCodes]);
    } else {
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

  const selectedCount = selectedPermissions.length;
  const totalCount = categories.reduce((sum, c) => sum + c.permissions.length, 0);

  if (loading) {
    return <Text c="dimmed">Loading permissions...</Text>;
  }

  const coveragePercent = totalCount > 0 ? Math.round((selectedCount / totalCount) * 100) : 0;

  const summaryText = {
    ka: 'უფლება არჩეულია',
    en: 'permissions selected',
    ru: 'разрешений выбрано',
  };

  return (
    <Stack gap="lg">
      {/* Premium Summary Header */}
      <Box
        style={{
          background: 'linear-gradient(135deg, rgba(26, 54, 93, 0.04) 0%, rgba(43, 108, 176, 0.06) 50%, rgba(99, 179, 237, 0.04) 100%)',
          borderRadius: '16px',
          padding: '20px 24px',
          border: '1px solid rgba(43, 108, 176, 0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative accent line */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #1a365d, #2b6cb0, #17a2b8)',
          }}
        />

        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Group gap="md" align="center">
            <Box
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'var(--emr-gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(26, 54, 93, 0.2)',
              }}
            >
              <IconCheck size={22} style={{ color: 'white' }} stroke={2.5} />
            </Box>
            <Box>
              <Text fw={700} style={{ fontSize: '18px', color: 'var(--emr-text-primary)' }}>
                {selectedCount} / {totalCount}
              </Text>
              <Text size="sm" c="dimmed">
                {summaryText[lang] || summaryText.en}
              </Text>
            </Box>
          </Group>

          {/* Coverage Badge - Theme colors only */}
          <Badge
            size="lg"
            variant="light"
            leftSection={coveragePercent >= 50 ? <IconCircleCheck size={14} /> : null}
            style={{
              background: coveragePercent >= 50
                ? 'linear-gradient(135deg, rgba(23, 162, 184, 0.15), rgba(32, 196, 221, 0.1))'
                : 'linear-gradient(135deg, rgba(43, 108, 176, 0.12), rgba(99, 179, 237, 0.08))',
              color: coveragePercent >= 50 ? '#138496' : '#2b6cb0',
              border: `1px solid ${coveragePercent >= 50 ? 'rgba(23, 162, 184, 0.25)' : 'rgba(43, 108, 176, 0.2)'}`,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontSize: '11px',
              padding: '8px 14px',
            }}
          >
            {coveragePercent}% {t('roleManagement.coverage').toUpperCase()}
          </Badge>
        </Group>

        {/* Progress bar - Theme colors */}
        <Progress
          value={coveragePercent}
          size="sm"
          radius="xl"
          mt="md"
          styles={{
            root: {
              background: 'rgba(255, 255, 255, 0.8)',
              height: 6,
            },
            section: {
              background: coveragePercent >= 50
                ? 'linear-gradient(90deg, #17a2b8, #20c4dd)'
                : 'linear-gradient(90deg, #2b6cb0, #3182ce)',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          }}
        />
      </Box>

      {/* Permission Categories Grid */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {categories.map((category, categoryIndex) => {
          const isExpanded = expandedCategories.has(category.code);
          const isChecked = isCategoryChecked(category);
          const isIndeterminate = isCategoryIndeterminate(category);
          const categorySelectedCount = category.permissions.filter((p) =>
            selectedPermissions.includes(p.code)
          ).length;
          const categoryPercent = Math.round((categorySelectedCount / category.permissions.length) * 100);

          const style = categoryStyles[category.code] || {
            icon: IconUsers,
            color: '#2b6cb0',
            gradient: 'var(--emr-gradient-primary)',
            lightBg: 'rgba(43, 108, 176, 0.08)',
          };
          const CategoryIcon = style.icon;

          return (
            <Paper
              key={category.code}
              p={0}
              style={{
                borderRadius: '16px',
                border: `2px solid ${isChecked ? style.color : 'rgba(255, 255, 255, 0.6)'}`,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: isChecked
                  ? `0 4px 20px ${style.color}20, 0 0 0 1px ${style.color}15`
                  : '0 2px 12px rgba(26, 54, 93, 0.06)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                position: 'relative',
                animation: `permissionCardSlide 0.4s ease-out ${categoryIndex * 0.08}s both`,
              }}
            >
              {/* Left accent bar */}
              <Box
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: style.gradient,
                  opacity: isChecked || isIndeterminate ? 1 : 0.5,
                  transition: 'opacity 0.3s ease',
                }}
              />

              {/* Complete badge */}
              {isChecked && (
                <Badge
                  size="xs"
                  variant="filled"
                  leftSection={<IconCheck size={10} />}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: '#17a2b8',
                    zIndex: 2,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                  }}
                >
                  {lang === 'ka' ? 'სრული' : 'FULL'}
                </Badge>
              )}

              {/* Category Header */}
              <Box
                p="md"
                pl={20}
                style={{
                  cursor: 'pointer',
                  background: isChecked ? style.lightBg : 'transparent',
                  transition: 'background 0.2s ease',
                }}
                onClick={() => toggleCategory(category.code)}
              >
                <Group gap="md" wrap="nowrap">
                  {/* Icon container */}
                  <Box
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: style.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: `0 4px 14px ${style.color}30`,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                  >
                    <CategoryIcon size={24} style={{ color: 'white' }} stroke={1.8} />
                  </Box>

                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text fw={600} size="sm" lineClamp={1} mb={6}>
                      {category.name}
                    </Text>

                    {/* Mini progress bar */}
                    <Group gap="sm" align="center">
                      <Box style={{ flex: 1, maxWidth: 100 }}>
                        <Progress
                          value={categoryPercent}
                          size={5}
                          radius="xl"
                          styles={{
                            root: { background: 'var(--emr-gray-200)' },
                            section: {
                              background: categoryPercent === 100 ? '#17a2b8' : style.color,
                              transition: 'width 0.3s ease',
                            },
                          }}
                        />
                      </Box>
                      <Tooltip label={`${categorySelectedCount} of ${category.permissions.length}`}>
                        <Badge
                          size="sm"
                          variant="light"
                          style={{
                            background: categorySelectedCount > 0 ? `${style.color}12` : 'var(--emr-gray-100)',
                            color: categorySelectedCount > 0 ? style.color : 'var(--emr-gray-500)',
                            fontWeight: 600,
                            minWidth: 48,
                            border: 'none',
                          }}
                        >
                          {categorySelectedCount}/{category.permissions.length}
                        </Badge>
                      </Tooltip>
                    </Group>
                  </Box>

                  <Group gap={10}>
                    <Box onClick={(e) => e.stopPropagation()}>
                      <EMRCheckbox
                        checked={isChecked}
                        indeterminate={isIndeterminate}
                        onChange={(checked) => handleCategoryToggle(category, checked)}
                        disabled={disabled}
                        aria-label={`${category.name} - select all`}
                      />
                    </Box>
                    <Box
                      role="button"
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      tabIndex={0}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: 'var(--emr-gray-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.25s ease, background 0.2s ease',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        cursor: 'pointer',
                      }}
                    >
                      <IconChevronDown size={16} style={{ color: 'var(--emr-gray-600)' }} />
                    </Box>
                  </Group>
                </Group>
              </Box>

              {/* Expanded Permissions */}
              <Collapse in={isExpanded}>
                <Box
                  style={{
                    borderTop: '1px solid var(--emr-gray-200)',
                    background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0.5) 100%)',
                  }}
                >
                  <Stack gap={0} p="sm" pl={24}>
                    {category.permissions.map((permission, index) => {
                      const isSelected = selectedPermissions.includes(permission.code);
                      return (
                        <Box
                          key={permission.code}
                          py={10}
                          px={14}
                          style={{
                            borderRadius: 10,
                            background: isSelected ? style.lightBg : 'transparent',
                            transition: 'all 0.2s ease',
                            borderBottom: index < category.permissions.length - 1 ? '1px solid var(--emr-gray-100)' : 'none',
                          }}
                        >
                          <Group gap="sm" wrap="nowrap">
                            <EMRCheckbox
                              checked={isSelected}
                              onChange={(checked) => handlePermissionToggle(permission.code, checked)}
                              disabled={disabled}
                              aria-label={permission.name}
                            />
                            <Box style={{ flex: 1 }}>
                              <Text size="sm" fw={isSelected ? 500 : 400}>
                                {permission.name}
                              </Text>
                              {permission.description && (
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                  {permission.description}
                                </Text>
                              )}
                            </Box>
                            {isSelected && (
                              <IconCheck size={16} style={{ color: style.color, flexShrink: 0 }} />
                            )}
                          </Group>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </Collapse>

              {/* CSS Animation */}
              <style>
                {`
                  @keyframes permissionCardSlide {
                    from {
                      opacity: 0;
                      transform: translateY(12px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                `}
              </style>
            </Paper>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
