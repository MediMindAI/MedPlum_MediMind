// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import {
  Box,
  Stack,
  Grid,
  Paper,
  Text,
  Title,
  Group,
  Select,
  Button,
  Table,
  Badge,
  Skeleton,
  Progress,
  Alert,
  ActionIcon,
  Tooltip,
  Menu,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import {
  IconFileText,
  IconCheck,
  IconProgress,
  IconFile,
  IconDownload,
  IconRefresh,
  IconTrendingUp,
  IconTrendingDown,
  IconClock,
  IconAlertCircle,
  IconDots,
  IconFileSpreadsheet,
} from '@tabler/icons-react';
import { useFormAnalytics, type AnalyticsPeriod } from '../../hooks/useFormAnalytics';
import { useTranslation } from '../../hooks/useTranslation';
import { FormCompletionChart } from './FormCompletionChart';

/**
 * FormAnalyticsDashboard Props
 */
export interface FormAnalyticsDashboardProps {
  /** Optional initial period selection */
  initialPeriod?: AnalyticsPeriod;
}

/**
 * FormAnalyticsDashboard Component
 *
 * Comprehensive analytics dashboard for form submissions.
 *
 * Features:
 * - Overview cards with key metrics
 * - Completion rate trends
 * - Form usage by type
 * - Skipped fields analysis
 * - Date range filtering
 * - CSV export
 *
 * @example
 * ```tsx
 * // In route: /emr/forms/analytics
 * <FormAnalyticsDashboard />
 * ```
 */
export function FormAnalyticsDashboard({
  initialPeriod,
}: FormAnalyticsDashboardProps): JSX.Element {
  const { t } = useTranslation();

  const {
    analytics,
    isLoading,
    error,
    period,
    setPeriod,
    customDateRange,
    setCustomDateRange,
    formTypeFilter,
    setFormTypeFilter,
    refreshAnalytics,
    exportCSV,
    exportSummary,
    completionTrend,
    formTypes,
    hasData,
  } = useFormAnalytics();

  // Initialize period if provided
  if (initialPeriod && period !== initialPeriod) {
    setPeriod(initialPeriod);
  }

  // Handle CSV download
  const handleExportCSV = useCallback(() => {
    const csv = exportCSV();
    if (!csv) {
      return;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `form-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [exportCSV]);

  // Handle summary CSV download
  const handleExportSummary = useCallback(() => {
    const csv = exportSummary();
    if (!csv) {
      return;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `form-analytics-summary-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [exportSummary]);

  // Period options
  const periodOptions = [
    { value: '7d', label: t('analytics.last7Days') || 'Last 7 Days' },
    { value: '30d', label: t('analytics.last30Days') || 'Last 30 Days' },
    { value: '90d', label: t('analytics.last90Days') || 'Last 90 Days' },
    { value: 'custom', label: t('analytics.custom') || 'Custom Range' },
  ];

  // Format completion time for display
  const formatCompletionTime = (ms: number): string => {
    if (ms === 0) {
      return '-';
    }
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <Box p="md">
        <Stack gap="lg">
          {/* Header skeleton */}
          <Group justify="space-between">
            <Skeleton height={32} width={200} />
            <Group gap="sm">
              <Skeleton height={36} width={150} />
              <Skeleton height={36} width={100} />
            </Group>
          </Group>

          {/* Stats cards skeleton */}
          <Grid>
            {[1, 2, 3, 4].map((i) => (
              <Grid.Col key={i} span={{ base: 12, sm: 6, md: 3 }}>
                <Skeleton height={120} radius="md" />
              </Grid.Col>
            ))}
          </Grid>

          {/* Chart skeleton */}
          <Skeleton height={300} radius="md" />

          {/* Table skeleton */}
          <Skeleton height={200} radius="md" />
        </Stack>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box p="md">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t('analytics.error') || 'Error Loading Analytics'}
          color="red"
        >
          {error}
          <Button size="xs" mt="sm" onClick={refreshAnalytics}>
            {t('analytics.retry') || 'Retry'}
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Title order={2}>{t('analytics.dashboard') || 'Form Analytics Dashboard'}</Title>

          <Group gap="sm">
            {/* Period filter */}
            <Select
              value={period}
              onChange={(value) => setPeriod(value as AnalyticsPeriod)}
              data={periodOptions}
              size="sm"
              style={{ width: 150 }}
            />

            {/* Custom date inputs */}
            {period === 'custom' && (
              <>
                <DateInput
                  value={customDateRange?.from ? new Date(customDateRange.from) : null}
                  onChange={(date) =>
                    setCustomDateRange({
                      from: date?.toISOString().split('T')[0] || '',
                      to: customDateRange?.to || '',
                    })
                  }
                  placeholder={t('analytics.from') || 'From'}
                  size="sm"
                  style={{ width: 130 }}
                />
                <DateInput
                  value={customDateRange?.to ? new Date(customDateRange.to) : null}
                  onChange={(date) =>
                    setCustomDateRange({
                      from: customDateRange?.from || '',
                      to: date?.toISOString().split('T')[0] || '',
                    })
                  }
                  placeholder={t('analytics.to') || 'To'}
                  size="sm"
                  style={{ width: 130 }}
                />
              </>
            )}

            {/* Form type filter */}
            {formTypes.length > 0 && (
              <Select
                value={formTypeFilter || ''}
                onChange={(value) => setFormTypeFilter(value || null)}
                data={[
                  { value: '', label: t('analytics.allForms') || 'All Forms' },
                  ...formTypes,
                ]}
                placeholder={t('analytics.filterByForm') || 'Filter by form'}
                size="sm"
                style={{ width: 180 }}
                clearable
              />
            )}

            {/* Actions */}
            <Tooltip label={t('analytics.refresh') || 'Refresh'}>
              <ActionIcon variant="light" onClick={refreshAnalytics}>
                <IconRefresh size={18} />
              </ActionIcon>
            </Tooltip>

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="light">
                  <IconDots size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{t('analytics.export') || 'Export'}</Menu.Label>
                <Menu.Item
                  leftSection={<IconFileSpreadsheet size={14} />}
                  onClick={handleExportCSV}
                >
                  {t('analytics.exportCSV') || 'Export CSV'}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconDownload size={14} />}
                  onClick={handleExportSummary}
                >
                  {t('analytics.exportSummary') || 'Export Summary'}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {/* Overview Stats Cards */}
        <Grid>
          {/* Total Forms */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" withBorder radius="md">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  {t('analytics.totalForms') || 'Total Forms'}
                </Text>
                <IconFileText size={20} color="var(--mantine-color-blue-6)" />
              </Group>
              <Text size="xl" fw={700}>
                {analytics?.totalForms || 0}
              </Text>
            </Paper>
          </Grid.Col>

          {/* Completed */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" withBorder radius="md">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  {t('analytics.completed') || 'Completed'}
                </Text>
                <IconCheck size={20} color="var(--mantine-color-green-6)" />
              </Group>
              <Text size="xl" fw={700} c="green">
                {analytics?.completedForms || 0}
              </Text>
            </Paper>
          </Grid.Col>

          {/* In Progress */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" withBorder radius="md">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  {t('analytics.inProgress') || 'In Progress'}
                </Text>
                <IconProgress size={20} color="var(--mantine-color-yellow-6)" />
              </Group>
              <Text size="xl" fw={700} c="yellow">
                {analytics?.inProgressForms || 0}
              </Text>
            </Paper>
          </Grid.Col>

          {/* Drafts */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Paper p="md" withBorder radius="md">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  {t('analytics.drafts') || 'Drafts'}
                </Text>
                <IconFile size={20} color="var(--mantine-color-gray-6)" />
              </Group>
              <Text size="xl" fw={700} c="gray">
                {analytics?.draftForms || 0}
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Completion Rate & Avg Time Cards */}
        <Grid>
          {/* Completion Rate */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="md" withBorder radius="md">
              <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed" fw={500}>
                  {t('analytics.completionRate') || 'Completion Rate'}
                </Text>
                {analytics && analytics.completionRate >= 80 ? (
                  <IconTrendingUp size={20} color="var(--mantine-color-green-6)" />
                ) : analytics && analytics.completionRate < 50 ? (
                  <IconTrendingDown size={20} color="var(--mantine-color-red-6)" />
                ) : null}
              </Group>
              <Text size="xl" fw={700} mb="xs">
                {analytics?.completionRate || 0}%
              </Text>
              <Progress
                value={analytics?.completionRate || 0}
                size="md"
                radius="sm"
                color={
                  (analytics?.completionRate || 0) >= 80
                    ? 'green'
                    : (analytics?.completionRate || 0) >= 50
                      ? 'yellow'
                      : 'red'
                }
              />
            </Paper>
          </Grid.Col>

          {/* Average Completion Time */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="md" withBorder radius="md">
              <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed" fw={500}>
                  {t('analytics.avgCompletionTime') || 'Avg. Completion Time'}
                </Text>
                <IconClock size={20} color="var(--mantine-color-blue-6)" />
              </Group>
              <Text size="xl" fw={700}>
                {formatCompletionTime(analytics?.averageCompletionTimeMs || 0)}
              </Text>
              <Text size="xs" c="dimmed" mt="xs">
                {t('analytics.forCompletedForms') || 'For completed forms'}
              </Text>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Completion Trend Chart */}
        <FormCompletionChart
          data={completionTrend}
          isLoading={isLoading}
          title={t('analytics.completionTrend') || 'Completion Trend'}
        />

        {/* Form Usage by Type */}
        {analytics?.formsByType && analytics.formsByType.length > 0 && (
          <Paper p="md" withBorder radius="md">
            <Title order={4} mb="md">
              {t('analytics.formsByType') || 'Form Usage by Type'}
            </Title>
            <Box style={{ overflowX: 'auto' }}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('analytics.formType') || 'Form Type'}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>
                      {t('analytics.count') || 'Count'}
                    </Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>
                      {t('analytics.percentage') || '%'}
                    </Table.Th>
                    <Table.Th style={{ width: 200 }}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {analytics.formsByType.map((type) => {
                    const percentage =
                      analytics.totalForms > 0
                        ? Math.round((type.count / analytics.totalForms) * 100)
                        : 0;
                    return (
                      <Table.Tr key={type.typeId}>
                        <Table.Td>{type.type}</Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>{type.count}</Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>{percentage}%</Table.Td>
                        <Table.Td>
                          <Progress value={percentage} size="sm" radius="sm" />
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Box>
          </Paper>
        )}

        {/* Frequently Skipped Fields */}
        {analytics?.skippedFields && analytics.skippedFields.length > 0 && (
          <Paper p="md" withBorder radius="md">
            <Title order={4} mb="md">
              {t('analytics.skippedFields') || 'Frequently Skipped Fields'}
            </Title>
            <Box style={{ overflowX: 'auto' }}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('analytics.fieldName') || 'Field Name'}</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>
                      {t('analytics.skipCount') || 'Skip Count'}
                    </Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>
                      {t('analytics.skipRate') || 'Skip Rate'}
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {analytics.skippedFields.slice(0, 10).map((field) => (
                    <Table.Tr key={field.fieldId}>
                      <Table.Td>{field.fieldLabel}</Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>{field.skipCount}</Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>
                        <Badge
                          color={field.skipRate > 50 ? 'red' : field.skipRate > 25 ? 'yellow' : 'green'}
                          variant="light"
                        >
                          {field.skipRate}%
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          </Paper>
        )}

        {/* Empty state */}
        {!hasData && !isLoading && (
          <Paper p="xl" withBorder radius="md">
            <Stack align="center" gap="md">
              <IconFileText size={48} color="var(--mantine-color-gray-5)" />
              <Text size="lg" c="dimmed">
                {t('analytics.noFormsFound') || 'No form submissions found for this period'}
              </Text>
              <Button variant="light" onClick={refreshAnalytics}>
                {t('analytics.refresh') || 'Refresh'}
              </Button>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Box>
  );
}

export default FormAnalyticsDashboard;
