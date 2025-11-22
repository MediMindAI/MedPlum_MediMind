// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import {
  Box,
  Stack,
  Text,
  Paper,
  Skeleton,
  Group,
  Badge,
  Tooltip,
  Progress,
} from '@mantine/core';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import type { CompletionTrendPoint } from '../../services/formAnalyticsService';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * FormCompletionChart Props
 */
export interface FormCompletionChartProps {
  /** Completion trend data points */
  data: CompletionTrendPoint[];
  /** Loading state */
  isLoading?: boolean;
  /** Chart title */
  title?: string;
  /** Show comparison with previous period */
  showComparison?: boolean;
  /** Previous period data for comparison */
  comparisonData?: CompletionTrendPoint[];
  /** Chart height in pixels */
  height?: number;
}

/**
 * FormCompletionChart Component
 *
 * Displays form completion rates over time using progress bars and visual indicators.
 * Uses Mantine components for a clean, accessible visualization.
 *
 * Features:
 * - Daily completion rate visualization
 * - Trend indicators (up/down)
 * - Comparison with previous period
 * - Loading and empty states
 * - Responsive design
 *
 * @example
 * ```tsx
 * <FormCompletionChart
 *   data={completionTrend}
 *   isLoading={isLoading}
 *   showComparison
 *   comparisonData={previousPeriodData}
 * />
 * ```
 */
export function FormCompletionChart({
  data,
  isLoading = false,
  title,
  showComparison = false,
  comparisonData,
  height = 300,
}: FormCompletionChartProps): JSX.Element {
  const { t } = useTranslation();

  // Calculate overall trend
  const trend = useMemo(() => {
    if (data.length < 2) {
      return { direction: 'neutral' as const, percentage: 0 };
    }

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, d) => sum + d.completionRate, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, d) => sum + d.completionRate, 0) / secondHalf.length;

    const change = secondAvg - firstAvg;

    return {
      direction: change > 1 ? 'up' : change < -1 ? 'down' : 'neutral',
      percentage: Math.abs(Math.round(change * 10) / 10),
    };
  }, [data]);

  // Calculate comparison change
  const comparisonChange = useMemo(() => {
    if (!showComparison || !comparisonData || comparisonData.length === 0 || data.length === 0) {
      return null;
    }

    const currentAvg =
      data.reduce((sum, d) => sum + d.completionRate, 0) / data.length;
    const previousAvg =
      comparisonData.reduce((sum, d) => sum + d.completionRate, 0) / comparisonData.length;

    const change = currentAvg - previousAvg;

    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(Math.round(change * 10) / 10),
    };
  }, [data, comparisonData, showComparison]);

  // Format date for display
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
  };

  // Render loading state
  if (isLoading) {
    return (
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Skeleton height={24} width="40%" />
          <Skeleton height={height} />
        </Stack>
      </Paper>
    );
  }

  // Render empty state
  if (data.length === 0) {
    return (
      <Paper p="md" withBorder>
        <Stack gap="md" align="center" justify="center" style={{ minHeight: height }}>
          <Text c="dimmed" size="sm">
            {t('analytics.noData') || 'No completion data available for this period'}
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Text fw={600} size="lg">
            {title || t('analytics.completionRate') || 'Completion Rate'}
          </Text>
          <Group gap="xs">
            {/* Trend indicator */}
            {trend.direction !== 'neutral' && (
              <Badge
                color={trend.direction === 'up' ? 'green' : 'red'}
                variant="light"
                leftSection={
                  trend.direction === 'up' ? (
                    <IconTrendingUp size={14} />
                  ) : (
                    <IconTrendingDown size={14} />
                  )
                }
              >
                {trend.percentage}%
              </Badge>
            )}

            {/* Comparison indicator */}
            {comparisonChange && comparisonChange.direction !== 'neutral' && (
              <Badge
                color={comparisonChange.direction === 'up' ? 'teal' : 'orange'}
                variant="outline"
              >
                {comparisonChange.direction === 'up' ? '+' : '-'}
                {comparisonChange.percentage}% vs previous
              </Badge>
            )}
          </Group>
        </Group>

        {/* Chart area - using progress bars */}
        <Box style={{ maxHeight: height, overflowY: 'auto' }}>
          <Stack gap="xs">
            {data.map((point, index) => (
              <Tooltip
                key={point.date}
                label={
                  <Stack gap={2}>
                    <Text size="sm" fw={600}>
                      {formatDate(point.date)}
                    </Text>
                    <Text size="xs">
                      {t('analytics.completed') || 'Completed'}: {point.completed}/{point.started}
                    </Text>
                    <Text size="xs">
                      {t('analytics.rate') || 'Rate'}: {point.completionRate}%
                    </Text>
                  </Stack>
                }
                position="right"
                withArrow
              >
                <Box>
                  <Group gap="xs" justify="space-between" mb={4}>
                    <Text size="xs" c="dimmed" style={{ minWidth: 60 }}>
                      {formatDate(point.date)}
                    </Text>
                    <Text size="xs" fw={500}>
                      {point.completionRate}%
                    </Text>
                  </Group>
                  <Progress
                    value={point.completionRate}
                    size="md"
                    radius="sm"
                    color={
                      point.completionRate >= 80
                        ? 'green'
                        : point.completionRate >= 50
                          ? 'yellow'
                          : 'red'
                    }
                  />
                </Box>
              </Tooltip>
            ))}
          </Stack>
        </Box>

        {/* Summary stats */}
        <Group justify="space-around" mt="xs">
          <Stack gap={2} align="center">
            <Text size="xl" fw={700} c="blue">
              {data.reduce((sum, d) => sum + d.started, 0)}
            </Text>
            <Text size="xs" c="dimmed">
              {t('analytics.totalStarted') || 'Total Started'}
            </Text>
          </Stack>
          <Stack gap={2} align="center">
            <Text size="xl" fw={700} c="green">
              {data.reduce((sum, d) => sum + d.completed, 0)}
            </Text>
            <Text size="xs" c="dimmed">
              {t('analytics.totalCompleted') || 'Total Completed'}
            </Text>
          </Stack>
          <Stack gap={2} align="center">
            <Text size="xl" fw={700} c="gray">
              {data.length > 0
                ? Math.round(
                    (data.reduce((sum, d) => sum + d.completionRate, 0) / data.length) * 10
                  ) / 10
                : 0}
              %
            </Text>
            <Text size="xs" c="dimmed">
              {t('analytics.averageRate') || 'Average Rate'}
            </Text>
          </Stack>
        </Group>
      </Stack>
    </Paper>
  );
}

export default FormCompletionChart;
