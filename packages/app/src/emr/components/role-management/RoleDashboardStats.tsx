// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Group, Text, Skeleton, Box, Divider } from '@mantine/core';
import { IconShieldLock, IconShieldCheck, IconShieldOff, IconUsers, IconTrendingUp } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';

interface RoleStats {
  total: number;
  active: number;
  inactive: number;
  totalUsers: number;
}

interface RoleDashboardStatsProps {
  stats: RoleStats;
  loading?: boolean;
}

interface StatItemProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  loading?: boolean;
  trend?: string;
  trendColor?: string;
}

/**
 * Compact stat item - inline design
 */
function StatItem({ title, value, icon, iconColor, bgColor, loading, trend, trendColor }: StatItemProps): JSX.Element {
  if (loading) {
    return (
      <Group gap="xs" align="center" wrap="nowrap">
        <Skeleton height={28} width={28} radius="md" />
        <Skeleton height={16} width={60} radius="sm" />
      </Group>
    );
  }

  return (
    <Group gap={8} align="center" wrap="nowrap">
      <Box
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: bgColor,
          flexShrink: 0,
        }}
      >
        {typeof icon === 'object' && React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<{ size?: number; color?: string; stroke?: number }>, {
              size: 16,
              color: iconColor,
              stroke: 2,
            })
          : icon}
      </Box>
      <Group gap={4} align="baseline" wrap="nowrap">
        <Text
          fw={700}
          style={{
            fontSize: '18px',
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--emr-text-primary)',
          }}
        >
          {value.toLocaleString()}
        </Text>
        {trend && (
          <Group gap={2} align="center" wrap="nowrap">
            <IconTrendingUp size={12} color={trendColor} stroke={2.5} />
            <Text size="xs" fw={600} c={trendColor}>
              {trend}
            </Text>
          </Group>
        )}
      </Group>
      <Text
        size="xs"
        fw={500}
        c="dimmed"
        style={{ whiteSpace: 'nowrap' }}
      >
        {title}
      </Text>
    </Group>
  );
}

/**
 * Compact dashboard stats - single row design
 *
 * Space-efficient stats bar showing all 4 KPIs in a single row.
 * Takes minimal vertical space while maintaining clarity.
 */
export function RoleDashboardStats({ stats, loading }: RoleDashboardStatsProps): JSX.Element {
  const { lang } = useTranslation();

  const labels: Record<string, Record<string, string>> = {
    total: { ka: 'სულ როლები', en: 'Total Roles', ru: 'Всего ролей' },
    active: { ka: 'აქტიური', en: 'Active', ru: 'Активные' },
    inactive: { ka: 'არააქტიური', en: 'Inactive', ru: 'Неактивные' },
    totalUsers: { ka: 'მომხმარებლები', en: 'Users', ru: 'Пользователей' },
  };

  const activePercent = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

  return (
    <Box
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid var(--emr-gray-200)',
        borderRadius: '10px',
        padding: '10px 20px',
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <StatItem
          title={labels.total[lang] || labels.total.en}
          value={stats.total}
          icon={<IconShieldLock />}
          iconColor="#1a365d"
          bgColor="rgba(26, 54, 93, 0.1)"
          loading={loading}
        />

        <Divider orientation="vertical" style={{ height: '28px' }} />

        <StatItem
          title={labels.active[lang] || labels.active.en}
          value={stats.active}
          icon={<IconShieldCheck />}
          iconColor="#17a2b8"
          bgColor="rgba(23, 162, 184, 0.1)"
          loading={loading}
          trend={activePercent > 0 ? `${activePercent}%` : undefined}
          trendColor="#17a2b8"
        />

        <Divider orientation="vertical" style={{ height: '28px' }} />

        <StatItem
          title={labels.inactive[lang] || labels.inactive.en}
          value={stats.inactive}
          icon={<IconShieldOff />}
          iconColor="#63b3ed"
          bgColor="rgba(99, 179, 237, 0.1)"
          loading={loading}
        />

        <Divider orientation="vertical" style={{ height: '28px' }} />

        <StatItem
          title={labels.totalUsers[lang] || labels.totalUsers.en}
          value={stats.totalUsers}
          icon={<IconUsers />}
          iconColor="#2b6cb0"
          bgColor="rgba(43, 108, 176, 0.1)"
          loading={loading}
        />
      </Group>
    </Box>
  );
}
