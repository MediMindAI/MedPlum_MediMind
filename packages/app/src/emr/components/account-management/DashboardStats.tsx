/**
 * DashboardStats Component
 *
 * Displays 4 KPI cards showing account statistics at a glance
 * Mobile-responsive with 2×2 grid on small screens, 1×4 on desktop
 */

import { Grid, Paper, Text, ThemeIcon, Stack, Group } from '@mantine/core';
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
 * Individual stat card component
 */
function StatCard({ title, value, icon, color, gradient }: StatCardProps): JSX.Element {
  return (
    <Paper
      p="md"
      withBorder
      style={{
        background: '#ffffff',
        borderRadius: '8px',
        boxShadow: 'var(--emr-shadow-card)',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--emr-shadow-card-hover)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--emr-shadow-card)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={8}>
          <Text size="sm" c="dimmed" fw={500} style={{ letterSpacing: '0.5px' }}>
            {title}
          </Text>
          <Text size="32px" fw={700} c={color}>
            {value.toLocaleString()}
          </Text>
        </Stack>

        <ThemeIcon
          size={56}
          radius={56}
          variant="gradient"
          gradient={{ from: color, to: color, deg: 135 }}
          style={{
            background: gradient,
          }}
        >
          {icon}
        </ThemeIcon>
      </Group>
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
 * @param loading - Show loading skeleton
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
          color="var(--emr-stat-info)"
          gradient="linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 3 }}>
        <StatCard
          title={t('accountManagement.dashboard.active')}
          value={stats.active}
          icon={<IconUserCheck size={28} stroke={2} />}
          color="var(--emr-stat-success)"
          gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 3 }}>
        <StatCard
          title={t('accountManagement.dashboard.pending')}
          value={stats.pending}
          icon={<IconClock size={28} stroke={2} />}
          color="var(--emr-stat-warning)"
          gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
        />
      </Grid.Col>

      <Grid.Col span={{ base: 6, sm: 3 }}>
        <StatCard
          title={t('accountManagement.dashboard.inactive')}
          value={stats.inactive}
          icon={<IconBan size={28} stroke={2} />}
          color="var(--emr-stat-neutral)"
          gradient="linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)"
        />
      </Grid.Col>
    </Grid>
  );
}
