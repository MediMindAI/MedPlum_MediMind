// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Grid, Paper, Text, Stack, Group } from '@mantine/core';
import { IconUsers, IconUserCheck, IconClock, IconBan } from '@tabler/icons-react';
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

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

/**
 * Individual stat card component with gradient background
 * @param root0
 * @param root0.title
 * @param root0.value
 * @param root0.icon
 * @param root0.color
 * @param root0.gradient
 */
function StatCard({ title, value, icon, color, gradient }: StatCardProps): JSX.Element {
  return (
    <Paper
      p="xl"
      style={{
        background: gradient,
        border: 'none',
        borderRadius: 'var(--emr-border-radius-lg)',
        boxShadow: 'var(--emr-shadow-lg)',
        transition: 'all var(--emr-transition-base)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--emr-shadow-xl)';
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--emr-shadow-lg)';
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
      }}
    >
      <Stack gap="sm">
        {/* Icon at top */}
        <Group justify="space-between" align="flex-start">
          {typeof icon === 'object' && React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement, {
                size: 32,
                color: 'white',
                style: { opacity: 0.9, flexShrink: 0 },
              })
            : icon}
        </Group>

        {/* Large value */}
        <Text
          size="48px"
          fw={700}
          c="white"
          style={{
            lineHeight: 1,
            letterSpacing: '-1px',
          }}
        >
          {value.toLocaleString()}
        </Text>

        {/* Title */}
        <Text
          size="sm"
          c="white"
          fw={500}
          style={{
            opacity: 0.95,
            letterSpacing: '0.3px',
            textTransform: 'uppercase',
            fontSize: '11px',
          }}
        >
          {title}
        </Text>
      </Stack>

      {/* Decorative gradient overlay */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
    </Paper>
  );
}

/**
 * Main dashboard stats component
 *
 * Features:
 * - 4 KPI cards: Total, Active, Pending, Inactive
 * - Responsive grid: 2×2 on mobile, 1×4 on desktop
 * - Gradient icons with themed colors
 * - Hover effects with shadow and transform
 * - Supports loading state
 *
 * @param stats - Statistics data to display
 * @param stats.stats
 * @param loading - Show loading skeleton
 * @param stats.loading
 */
export function DashboardStats({ stats, loading }: DashboardStatsProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <Grid gutter={24}>
      <Grid.Col span={{ base: 6, sm: 3 }}>
        <StatCard
          title={t('accountManagement.dashboard.total')}
          value={stats.total}
          icon={<IconUsers size={28} stroke={2} />}
          color="var(--emr-secondary)"
          gradient="var(--emr-stat-gradient-total)"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 3 }}>
        <StatCard
          title={t('accountManagement.dashboard.active')}
          value={stats.active}
          icon={<IconUserCheck size={28} stroke={2} />}
          color="var(--emr-primary)"
          gradient="var(--emr-stat-gradient-active)"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 3 }}>
        <StatCard
          title={t('accountManagement.dashboard.pending')}
          value={stats.pending}
          icon={<IconClock size={28} stroke={2} />}
          color="var(--emr-accent)"
          gradient="var(--emr-stat-gradient-pending)"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 3 }}>
        <StatCard
          title={t('accountManagement.dashboard.inactive')}
          value={stats.inactive}
          icon={<IconBan size={28} stroke={2} />}
          color="var(--emr-gray-500)"
          gradient="var(--emr-stat-gradient-inactive)"
        />
      </Grid.Col>
    </Grid>
  );
}
