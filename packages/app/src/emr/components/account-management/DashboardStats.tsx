// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Group, Text, Skeleton, Box, Divider } from '@mantine/core';
import { IconUsers, IconUserCheck, IconClock, IconBan, IconTrendingUp } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';

export interface DashboardStatsData {
  total: number;
  active: number;
  pending: number;
  inactive: number;
}

interface DashboardStatsProps {
  stats: DashboardStatsData;
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
export function DashboardStats({ stats, loading }: DashboardStatsProps): JSX.Element {
  const { t } = useTranslation();

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
          title={t('accountManagement.dashboard.total')}
          value={stats.total}
          icon={<IconUsers />}
          iconColor="#2b6cb0"
          bgColor="rgba(43, 108, 176, 0.1)"
          loading={loading}
        />

        <Divider orientation="vertical" style={{ height: '28px' }} />

        <StatItem
          title={t('accountManagement.dashboard.active')}
          value={stats.active}
          icon={<IconUserCheck />}
          iconColor="#10b981"
          bgColor="rgba(16, 185, 129, 0.1)"
          loading={loading}
          trend={activePercent > 0 ? `${activePercent}%` : undefined}
          trendColor="#10b981"
        />

        <Divider orientation="vertical" style={{ height: '28px' }} />

        <StatItem
          title={t('accountManagement.dashboard.pending')}
          value={stats.pending}
          icon={<IconClock />}
          iconColor="#3182ce"
          bgColor="rgba(49, 130, 206, 0.1)"
          loading={loading}
        />

        <Divider orientation="vertical" style={{ height: '28px' }} />

        <StatItem
          title={t('accountManagement.dashboard.inactive')}
          value={stats.inactive}
          icon={<IconBan />}
          iconColor="#6b7280"
          bgColor="rgba(107, 114, 128, 0.1)"
          loading={loading}
        />
      </Group>
    </Box>
  );
}
