// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { SimpleGrid, Paper, Group, Text, Stack, Box, Skeleton, RingProgress } from '@mantine/core';
import { IconShieldLock, IconShieldCheck, IconShieldOff, IconUsers, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
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

interface StatCardProps {
  icon: typeof IconShieldLock;
  label: string;
  value: number;
  iconColor: string;
  accentColor: string;
  gradient: string;
  index: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  showRing?: boolean;
  ringValue?: number;
  loading?: boolean;
}

/**
 * Premium Stat Card with Glassmorphism
 * Uses ONLY EMR theme colors (blues and turquoise)
 */
function StatCard({ icon: Icon, label, value, iconColor, accentColor, gradient, index, trend, showRing, ringValue, loading }: StatCardProps): JSX.Element {
  const [isHovered, setIsHovered] = React.useState(false);

  if (loading) {
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
          minHeight: '110px',
        }}
      >
        <Group gap="lg" wrap="nowrap">
          <Skeleton height={52} width={52} radius={14} />
          <Stack gap={8}>
            <Skeleton height={14} width={80} />
            <Skeleton height={32} width={50} />
          </Stack>
        </Group>
      </Paper>
    );
  }

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
        minHeight: '110px',
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

      <Group gap="lg" wrap="nowrap" align="flex-start" style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon with gradient overlay */}
        <Box
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
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
              borderRadius: 14,
              background: gradient,
              opacity: 0.12,
            }}
          />
          <Icon size={26} style={{ color: iconColor, position: 'relative', zIndex: 1 }} stroke={1.8} />
        </Box>

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            fw={600}
            style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--emr-gray-500)',
              marginBottom: 4,
            }}
          >
            {label}
          </Text>

          <Group gap="sm" align="center" wrap="nowrap">
            <Text
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: 'var(--emr-text-primary)',
                lineHeight: 1,
                letterSpacing: '-1.5px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {value}
            </Text>

            {/* Trend badge - Theme colors only */}
            {trend && trend.value > 0 && (
              <Group
                gap={4}
                style={{
                  background: trend.isPositive
                    ? 'linear-gradient(135deg, rgba(23, 162, 184, 0.12), rgba(32, 196, 221, 0.08))'
                    : 'linear-gradient(135deg, rgba(26, 54, 93, 0.12), rgba(43, 108, 176, 0.08))',
                  padding: '3px 8px',
                  borderRadius: '20px',
                  transition: 'transform 0.2s ease',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {trend.isPositive ? (
                  <IconTrendingUp size={13} color="#17a2b8" stroke={2.5} />
                ) : (
                  <IconTrendingDown size={13} color="#1a365d" stroke={2.5} />
                )}
                <Text
                  size="xs"
                  fw={600}
                  style={{ color: trend.isPositive ? '#17a2b8' : '#1a365d' }}
                >
                  {trend.value}%
                </Text>
              </Group>
            )}

            {/* Ring progress for percentage */}
            {showRing && ringValue !== undefined && (
              <RingProgress
                size={44}
                thickness={4}
                roundCaps
                sections={[{ value: ringValue, color: '#17a2b8' }]}
                label={
                  <Text size="xs" fw={700} ta="center" style={{ color: '#17a2b8' }}>
                    {ringValue}%
                  </Text>
                }
              />
            )}
          </Group>
        </Box>
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
 * Premium Dashboard Stats for Role Management
 *
 * Features:
 * - Glassmorphism cards with blur effects
 * - Left accent bar on hover
 * - Staggered entrance animations
 * - EMR theme colors only (blues and turquoise)
 */
export function RoleDashboardStats({ stats, loading }: RoleDashboardStatsProps): JSX.Element {
  const { lang } = useTranslation();

  const labels: Record<string, Record<string, string>> = {
    total: { ka: 'სულ როლები', en: 'Total Roles', ru: 'Всего ролей' },
    active: { ka: 'აქტიური', en: 'Active', ru: 'Активные' },
    inactive: { ka: 'არააქტიური', en: 'Inactive', ru: 'Неактивные' },
    totalUsers: { ka: 'მომხმარებლები', en: 'Total Users', ru: 'Пользователей' },
  };

  const activePercentage = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;
  const inactivePercentage = stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0;

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
      <StatCard
        icon={IconShieldLock}
        label={labels.total[lang] || labels.total.en}
        value={stats.total}
        iconColor="#1a365d"
        accentColor="#1a365d"
        gradient="linear-gradient(135deg, #1a365d, #2b6cb0)"
        index={0}
        loading={loading}
      />
      <StatCard
        icon={IconShieldCheck}
        label={labels.active[lang] || labels.active.en}
        value={stats.active}
        iconColor="#17a2b8"
        accentColor="#17a2b8"
        gradient="linear-gradient(135deg, #138496, #17a2b8)"
        index={1}
        showRing={stats.total > 0}
        ringValue={activePercentage}
        loading={loading}
      />
      <StatCard
        icon={IconShieldOff}
        label={labels.inactive[lang] || labels.inactive.en}
        value={stats.inactive}
        iconColor="#63b3ed"
        accentColor="#63b3ed"
        gradient="linear-gradient(135deg, #3182ce, #63b3ed)"
        index={2}
        trend={inactivePercentage > 0 ? {
          value: inactivePercentage,
          isPositive: false,
        } : undefined}
        loading={loading}
      />
      <StatCard
        icon={IconUsers}
        label={labels.totalUsers[lang] || labels.totalUsers.en}
        value={stats.totalUsers}
        iconColor="#2b6cb0"
        accentColor="#2b6cb0"
        gradient="linear-gradient(135deg, #2b6cb0, #3182ce)"
        index={3}
        loading={loading}
      />
    </SimpleGrid>
  );
}
