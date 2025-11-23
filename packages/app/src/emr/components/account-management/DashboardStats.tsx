// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Grid, Paper, Text, Stack, Group, Skeleton, Box } from '@mantine/core';
import { IconUsers, IconUserCheck, IconClock, IconBan, IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react';
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
  index: number;
  loading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

/**
 * Loading skeleton for stat card - compact version
 */
function StatCardSkeleton(): JSX.Element {
  return (
    <Paper
      p="md"
      style={{
        background: 'linear-gradient(135deg, var(--emr-gray-100) 0%, var(--emr-gray-50) 100%)',
        border: '1px solid var(--emr-gray-200)',
        borderRadius: 'var(--emr-border-radius-lg)',
        boxShadow: 'var(--emr-shadow-sm)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '88px',
      }}
    >
      <Group gap="md" align="center" wrap="nowrap">
        <Skeleton height={44} width={44} radius="md" />
        <Stack gap={6} style={{ flex: 1 }}>
          <Skeleton height={28} width="50%" radius="sm" />
          <Skeleton height={12} width="70%" radius="sm" />
        </Stack>
      </Group>
    </Paper>
  );
}

/**
 * Individual stat card component - compact horizontal layout
 * Enhanced with:
 * - Cleaner horizontal design with icon on left
 * - Subtle gradient backgrounds
 * - Smooth hover transitions
 * - Trend indicator pill
 */
function StatCard({ title, value, icon, color, gradient, index, loading, trend, trendValue }: StatCardProps): JSX.Element {
  if (loading) {
    return <StatCardSkeleton />;
  }

  const TrendIcon = trend === 'up' ? IconTrendingUp : trend === 'down' ? IconTrendingDown : IconMinus;

  return (
    <Paper
      p="md"
      style={{
        background: 'var(--emr-text-inverse)',
        border: '1px solid var(--emr-gray-200)',
        borderRadius: 'var(--emr-border-radius-lg)',
        boxShadow: 'var(--emr-shadow-sm)',
        transition: 'all var(--emr-transition-smooth)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '88px',
        animation: `statCardFadeIn 0.3s ease-out ${index * 0.05}s both`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--emr-shadow-md)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--emr-accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--emr-shadow-sm)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--emr-gray-200)';
      }}
    >
      {/* Subtle gradient overlay */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: gradient,
          borderRadius: 'var(--emr-border-radius-lg) var(--emr-border-radius-lg) 0 0',
        }}
      />

      <Group gap="md" align="center" wrap="nowrap" style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon container with gradient */}
        <Box
          style={{
            background: gradient,
            borderRadius: 'var(--emr-border-radius)',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--emr-shadow-sm)',
            flexShrink: 0,
          }}
        >
          {typeof icon === 'object' && React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement<{ size?: number; color?: string; stroke?: number }>, {
                size: 22,
                color: 'white',
                stroke: 2,
              })
            : icon}
        </Box>

        {/* Value and title */}
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" align="baseline" wrap="nowrap">
            <Text
              fw={700}
              style={{
                fontSize: '26px',
                lineHeight: 1,
                letterSpacing: '-1px',
                fontVariantNumeric: 'tabular-nums',
                color: 'var(--emr-text-primary)',
              }}
            >
              {value.toLocaleString()}
            </Text>
            {trend && trendValue && (
              <Group
                gap={2}
                style={{
                  background:
                    trend === 'up'
                      ? 'rgba(16, 185, 129, 0.1)'
                      : trend === 'down'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'var(--emr-gray-100)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                }}
              >
                <TrendIcon
                  size={12}
                  color={trend === 'up' ? 'var(--emr-stat-success)' : trend === 'down' ? 'var(--emr-stat-danger)' : 'var(--emr-gray-500)'}
                  stroke={2.5}
                />
                <Text
                  size="xs"
                  fw={600}
                  c={trend === 'up' ? 'var(--emr-stat-success)' : trend === 'down' ? 'var(--emr-stat-danger)' : 'var(--emr-gray-500)'}
                >
                  {trendValue}
                </Text>
              </Group>
            )}
          </Group>
          <Text
            c="dimmed"
            fw={500}
            style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}
          >
            {title}
          </Text>
        </Stack>
      </Group>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes statCardFadeIn {
            from {
              opacity: 0;
              transform: translateY(8px);
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
}

/**
 * Main dashboard stats component
 *
 * Features:
 * - 4 KPI cards: Total, Active, Pending, Inactive
 * - Responsive grid: 2×2 on mobile, 1×4 on desktop
 * - Gradient icons with themed colors
 * - Hover effects with shadow and transform
 * - Staggered entrance animations
 * - Loading skeleton state
 * - Optional trend indicators
 *
 * @param stats - Statistics data to display
 * @param stats.stats
 * @param loading - Show loading skeleton
 * @param stats.loading
 */
export function DashboardStats({ stats, loading }: DashboardStatsProps): JSX.Element {
  const { t } = useTranslation();

  // Calculate percentages for trend display
  const activePercent = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;
  const inactivePercent = stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0;

  return (
    <Grid gutter={{ base: 16, sm: 24 }}>
      <Grid.Col span={{ base: 6, sm: 3 }}>
        <StatCard
          title={t('accountManagement.dashboard.total')}
          value={stats.total}
          icon={<IconUsers size={28} stroke={2} />}
          color="var(--emr-secondary)"
          gradient="var(--emr-stat-gradient-total)"
          index={0}
          loading={loading}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 3 }}>
        <StatCard
          title={t('accountManagement.dashboard.active')}
          value={stats.active}
          icon={<IconUserCheck size={28} stroke={2} />}
          color="var(--emr-primary)"
          gradient="var(--emr-stat-gradient-active)"
          index={1}
          loading={loading}
          trend={activePercent > 50 ? 'up' : activePercent < 50 ? 'down' : 'neutral'}
          trendValue={`${activePercent}%`}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 3 }}>
        <StatCard
          title={t('accountManagement.dashboard.pending')}
          value={stats.pending}
          icon={<IconClock size={28} stroke={2} />}
          color="var(--emr-accent)"
          gradient="var(--emr-stat-gradient-pending)"
          index={2}
          loading={loading}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 3 }}>
        <StatCard
          title={t('accountManagement.dashboard.inactive')}
          value={stats.inactive}
          icon={<IconBan size={28} stroke={2} />}
          color="var(--emr-gray-500)"
          gradient="var(--emr-stat-gradient-inactive)"
          index={3}
          loading={loading}
          trend={inactivePercent > 10 ? 'down' : 'neutral'}
          trendValue={inactivePercent > 0 ? `${inactivePercent}%` : undefined}
        />
      </Grid.Col>
    </Grid>
  );
}
