// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { SimpleGrid, Paper, Group, ThemeIcon, Text, Stack, Box, Skeleton } from '@mantine/core';
import { IconShieldLock, IconShieldCheck, IconShieldOff, IconUsers } from '@tabler/icons-react';
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
  gradient: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

function StatCard({ icon: Icon, label, value, gradient, trend, loading }: StatCardProps): JSX.Element {
  if (loading) {
    return (
      <Paper
        p="md"
        withBorder
        style={{
          borderRadius: 'var(--emr-border-radius-lg)',
          borderColor: 'var(--emr-gray-200)',
        }}
      >
        <Group gap="md" wrap="nowrap">
          <Skeleton height={48} width={48} radius="md" />
          <Stack gap={4}>
            <Skeleton height={12} width={80} />
            <Skeleton height={24} width={40} />
          </Stack>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper
      p="md"
      withBorder
      style={{
        borderRadius: 'var(--emr-border-radius-lg)',
        borderColor: 'var(--emr-gray-200)',
        transition: 'var(--emr-transition-smooth)',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--emr-shadow-md)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Group gap="md" wrap="nowrap">
        <ThemeIcon
          size={48}
          radius="md"
          style={{
            background: gradient,
          }}
        >
          <Icon size={24} style={{ color: 'white' }} />
        </ThemeIcon>
        <Box>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500} style={{ letterSpacing: '0.02em' }}>
            {label}
          </Text>
          <Group gap="xs" align="baseline">
            <Text size="xl" fw={700} style={{ color: 'var(--emr-text-primary)', lineHeight: 1.2 }}>
              {value}
            </Text>
            {trend && (
              <Text
                size="xs"
                fw={500}
                style={{
                  color: trend.isPositive ? 'var(--emr-stat-success)' : 'var(--emr-stat-danger)',
                }}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </Text>
            )}
          </Group>
        </Box>
      </Group>
    </Paper>
  );
}

/**
 * Dashboard stats cards for role management
 */
export function RoleDashboardStats({ stats, loading }: RoleDashboardStatsProps): JSX.Element {
  const { lang } = useTranslation();

  const labels: Record<string, Record<string, string>> = {
    total: { ka: 'სულ როლები', en: 'Total Roles', ru: 'Всего ролей' },
    active: { ka: 'აქტიური', en: 'Active', ru: 'Активные' },
    inactive: { ka: 'არააქტიური', en: 'Inactive', ru: 'Неактивные' },
    totalUsers: { ka: 'მომხმარებლები', en: 'Total Users', ru: 'Пользователей' },
  };

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
      <StatCard
        icon={IconShieldLock}
        label={labels.total[lang] || labels.total.en}
        value={stats.total}
        gradient="var(--emr-stat-gradient-total)"
        loading={loading}
      />
      <StatCard
        icon={IconShieldCheck}
        label={labels.active[lang] || labels.active.en}
        value={stats.active}
        gradient="var(--emr-stat-gradient-active)"
        trend={stats.total > 0 ? {
          value: Math.round((stats.active / stats.total) * 100),
          isPositive: true,
        } : undefined}
        loading={loading}
      />
      <StatCard
        icon={IconShieldOff}
        label={labels.inactive[lang] || labels.inactive.en}
        value={stats.inactive}
        gradient="var(--emr-stat-gradient-inactive)"
        loading={loading}
      />
      <StatCard
        icon={IconUsers}
        label={labels.totalUsers[lang] || labels.totalUsers.en}
        value={stats.totalUsers}
        gradient="var(--emr-stat-gradient-pending)"
        loading={loading}
      />
    </SimpleGrid>
  );
}
