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
  iconColor: string;
  accentColor: string;
  gradient: string;
  index: number;
  loading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

/**
 * Loading skeleton for stat card - premium glassmorphism version
 */
function StatCardSkeleton(): JSX.Element {
  return (
    <Paper
      p="lg"
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(26, 54, 93, 0.06)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100px',
      }}
    >
      <Group gap="lg" align="center" wrap="nowrap">
        <Skeleton height={52} width={52} radius={14} />
        <Stack gap={8} style={{ flex: 1 }}>
          <Skeleton height={32} width="45%" radius="sm" />
          <Skeleton height={14} width="65%" radius="sm" />
        </Stack>
      </Group>
    </Paper>
  );
}

/**
 * Individual stat card component - premium glassmorphism design
 * Enhanced with:
 * - Glassmorphism background with blur
 * - Elegant left accent bar on hover
 * - Refined icon container with gradient overlay
 * - Smooth spring animations
 * - Premium trend indicator badges
 */
function StatCard({ title, value, icon, iconColor, accentColor, gradient, index, loading, trend, trendValue }: StatCardProps): JSX.Element {
  const [isHovered, setIsHovered] = React.useState(false);

  if (loading) {
    return <StatCardSkeleton />;
  }

  const TrendIcon = trend === 'up' ? IconTrendingUp : trend === 'down' ? IconTrendingDown : IconMinus;

  return (
    <Paper
      p="lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${isHovered ? accentColor : 'rgba(255, 255, 255, 0.6)'}`,
        borderRadius: '16px',
        boxShadow: isHovered
          ? '0 4px 8px rgba(0, 0, 0, 0.06), 0 12px 32px rgba(26, 54, 93, 0.12)'
          : '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(26, 54, 93, 0.06)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100px',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        animation: `statCardSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.08}s both`,
      }}
    >
      {/* Left accent bar that appears on hover */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          background: accentColor,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      <Group gap="lg" align="center" wrap="nowrap" style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon container with gradient overlay */}
        <Box
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flexShrink: 0,
            transition: 'transform 0.3s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
        >
          {/* Gradient background overlay */}
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '14px',
              background: gradient,
              opacity: 0.12,
            }}
          />
          {typeof icon === 'object' && React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement<{ size?: number; color?: string; stroke?: number }>, {
                size: 26,
                color: iconColor,
                stroke: 1.8,
              })
            : icon}
        </Box>

        {/* Value and title */}
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Group gap="sm" align="baseline" wrap="nowrap">
            <Text
              fw={700}
              style={{
                fontSize: '32px',
                lineHeight: 1,
                letterSpacing: '-1.5px',
                fontVariantNumeric: 'tabular-nums',
                color: 'var(--emr-text-primary)',
              }}
            >
              {value.toLocaleString()}
            </Text>
            {trend && trendValue && (
              <Group
                gap={4}
                style={{
                  background:
                    trend === 'up'
                      ? 'rgba(16, 185, 129, 0.12)'
                      : trend === 'down'
                        ? 'rgba(239, 68, 68, 0.12)'
                        : 'var(--emr-gray-100)',
                  padding: '3px 8px',
                  borderRadius: '20px',
                  transition: 'transform 0.2s ease',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <TrendIcon
                  size={13}
                  color={trend === 'up' ? '#059669' : trend === 'down' ? '#dc2626' : 'var(--emr-gray-500)'}
                  stroke={2.5}
                />
                <Text
                  size="xs"
                  fw={600}
                  style={{
                    color: trend === 'up' ? '#059669' : trend === 'down' ? '#dc2626' : 'var(--emr-gray-500)',
                  }}
                >
                  {trendValue}
                </Text>
              </Group>
            )}
          </Group>
          <Text
            fw={600}
            style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--emr-gray-500)',
            }}
          >
            {title}
          </Text>
        </Stack>
      </Group>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes statCardSlideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
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
 * Main dashboard stats component - Premium Design
 *
 * Features:
 * - 4 KPI cards: Total, Active, Pending, Inactive
 * - Premium glassmorphism card design
 * - Responsive grid: 2×2 on mobile, 1×4 on desktop
 * - Elegant icon containers with gradient overlays
 * - Smooth hover effects with accent borders
 * - Staggered entrance animations
 * - Loading skeleton state
 * - Refined trend indicator badges
 *
 * @param stats - Statistics data to display
 * @param loading - Show loading skeleton
 */
export function DashboardStats({ stats, loading }: DashboardStatsProps): JSX.Element {
  const { t } = useTranslation();

  // Calculate percentages for trend display
  const activePercent = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;
  const inactivePercent = stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0;

  return (
    <Grid gutter={{ base: 16, sm: 20, md: 24 }}>
      <Grid.Col span={{ base: 6, sm: 3 }}>
        <StatCard
          title={t('accountManagement.dashboard.total')}
          value={stats.total}
          icon={<IconUsers size={26} stroke={1.8} />}
          iconColor="#2b6cb0"
          accentColor="#2b6cb0"
          gradient="linear-gradient(135deg, #2b6cb0, #3182ce)"
          index={0}
          loading={loading}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 3 }}>
        <StatCard
          title={t('accountManagement.dashboard.active')}
          value={stats.active}
          icon={<IconUserCheck size={26} stroke={1.8} />}
          iconColor="#10b981"
          accentColor="#10b981"
          gradient="linear-gradient(135deg, #10b981, #34d399)"
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
          icon={<IconClock size={26} stroke={1.8} />}
          iconColor="#3182ce"
          accentColor="#3182ce"
          gradient="linear-gradient(135deg, #3182ce, #63b3ed)"
          index={2}
          loading={loading}
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 3 }}>
        <StatCard
          title={t('accountManagement.dashboard.inactive')}
          value={stats.inactive}
          icon={<IconBan size={26} stroke={1.8} />}
          iconColor="#6b7280"
          accentColor="#6b7280"
          gradient="linear-gradient(135deg, #6b7280, #9ca3af)"
          index={3}
          loading={loading}
          trend={inactivePercent > 10 ? 'down' : 'neutral'}
          trendValue={inactivePercent > 0 ? `${inactivePercent}%` : undefined}
        />
      </Grid.Col>
    </Grid>
  );
}
