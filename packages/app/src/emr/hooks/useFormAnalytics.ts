// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @module useFormAnalytics
 * @description React hook for fetching and managing form analytics data.
 *
 * Features:
 * - Aggregate metrics (completion rate, avg time, form counts)
 * - Period filtering (7d, 30d, 90d, custom)
 * - Report generation (daily, weekly, monthly)
 * - CSV export functionality
 * - Automatic data refresh
 *
 * ## Usage Example
 * ```typescript
 * import { useFormAnalytics } from '@/emr/hooks/useFormAnalytics';
 *
 * function AnalyticsDashboard() {
 *   const {
 *     analytics,
 *     isLoading,
 *     error,
 *     period,
 *     setPeriod,
 *     refresh,
 *     exportCSV,
 *   } = useFormAnalytics({ period: '30d' });
 *
 *   if (isLoading) return <Loader />;
 *   if (error) return <Error message={error} />;
 *
 *   return (
 *     <Box>
 *       <Text>Completion Rate: {analytics?.completionRate}%</Text>
 *       <Text>Total Forms: {analytics?.totalForms}</Text>
 *       <Button onClick={exportCSV}>Export CSV</Button>
 *     </Box>
 *   );
 * }
 * ```
 *
 * @see formAnalyticsService for underlying analytics calculations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import type {
  FormAnalytics,
  AnalyticsFilters,
  DailyReport,
  WeeklyReport,
  MonthlyReport,
  CompletionTrendPoint,
} from '../services/formAnalyticsService';
import {
  aggregateMetrics,
  generateDailyReport,
  generateWeeklyReport,
  generateMonthlyReport,
  exportToCSV,
  exportSummaryToCSV,
  getDateRangeForPeriod,
} from '../services/formAnalyticsService';

/**
 * Period options for analytics filtering
 */
export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'custom';

/**
 * Report type options
 */
export type ReportType = 'daily' | 'weekly' | 'monthly';

/**
 * Hook state interface
 */
export interface UseFormAnalyticsState {
  analytics: FormAnalytics | null;
  dailyReport: DailyReport | null;
  weeklyReport: WeeklyReport | null;
  monthlyReport: MonthlyReport | null;
  isLoading: boolean;
  isGeneratingReport: boolean;
  error: string | null;
}

/**
 * Hook return interface
 */
export interface UseFormAnalyticsReturn extends UseFormAnalyticsState {
  // Filters
  period: AnalyticsPeriod;
  setPeriod: (period: AnalyticsPeriod) => void;
  customDateRange: { from: string; to: string } | null;
  setCustomDateRange: (range: { from: string; to: string } | null) => void;
  formTypeFilter: string | null;
  setFormTypeFilter: (type: string | null) => void;

  // Actions
  refreshAnalytics: () => Promise<void>;
  generateReport: (type: ReportType, date?: string) => Promise<void>;
  exportCSV: () => string;
  exportSummary: () => string;

  // Computed values
  completionTrend: CompletionTrendPoint[];
  formTypes: Array<{ value: string; label: string }>;
  hasData: boolean;
}

/**
 * useFormAnalytics Hook
 *
 * Provides form analytics data and report generation functionality.
 *
 * @example
 * ```tsx
 * function AnalyticsDashboard() {
 *   const {
 *     analytics,
 *     isLoading,
 *     period,
 *     setPeriod,
 *     refreshAnalytics,
 *     exportCSV,
 *   } = useFormAnalytics();
 *
 *   return (
 *     <div>
 *       <Select value={period} onChange={setPeriod}>
 *         <option value="7d">Last 7 days</option>
 *         <option value="30d">Last 30 days</option>
 *       </Select>
 *       {isLoading ? (
 *         <Skeleton />
 *       ) : (
 *         <div>
 *           <Text>Total: {analytics?.totalForms}</Text>
 *           <Text>Completion Rate: {analytics?.completionRate}%</Text>
 *         </div>
 *       )}
 *       <Button onClick={() => downloadFile(exportCSV(), 'analytics.csv')}>
 *         Export CSV
 *       </Button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFormAnalytics(): UseFormAnalyticsReturn {
  const medplum = useMedplum();

  // State
  const [analytics, setAnalytics] = useState<FormAnalytics | null>(null);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string } | null>(null);
  const [formTypeFilter, setFormTypeFilter] = useState<string | null>(null);

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    return getDateRangeForPeriod(period, customDateRange?.from, customDateRange?.to);
  }, [period, customDateRange]);

  // Build filters object
  const filters = useMemo((): AnalyticsFilters => {
    const f: AnalyticsFilters = {
      dateFrom: dateRange.dateFrom,
      dateTo: dateRange.dateTo,
    };

    if (formTypeFilter) {
      f.formType = formTypeFilter;
    }

    return f;
  }, [dateRange, formTypeFilter]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await aggregateMetrics(medplum, filters);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  }, [medplum, filters]);

  // Initial fetch and re-fetch on filter changes
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Refresh analytics manually
  const refreshAnalytics = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  // Generate report
  const generateReport = useCallback(
    async (type: ReportType, date?: string) => {
      setIsGeneratingReport(true);
      setError(null);

      try {
        const targetDate = date || new Date().toISOString().split('T')[0];

        switch (type) {
          case 'daily': {
            const report = await generateDailyReport(medplum, targetDate);
            setDailyReport(report);
            break;
          }
          case 'weekly': {
            const report = await generateWeeklyReport(medplum, targetDate);
            setWeeklyReport(report);
            break;
          }
          case 'monthly': {
            const dateObj = new Date(targetDate);
            const report = await generateMonthlyReport(
              medplum,
              dateObj.getMonth() + 1,
              dateObj.getFullYear()
            );
            setMonthlyReport(report);
            break;
          }
        }
      } catch (err) {
        console.error(`Failed to generate ${type} report:`, err);
        setError(err instanceof Error ? err.message : `Failed to generate ${type} report`);
      } finally {
        setIsGeneratingReport(false);
      }
    },
    [medplum]
  );

  // Export to CSV
  const exportCSV = useCallback((): string => {
    if (!analytics) {
      return '';
    }
    return exportToCSV(analytics, formTypeFilter || undefined);
  }, [analytics, formTypeFilter]);

  // Export summary to CSV
  const exportSummary = useCallback((): string => {
    if (!analytics) {
      return '';
    }
    return exportSummaryToCSV(analytics);
  }, [analytics]);

  // Computed values
  const completionTrend = useMemo((): CompletionTrendPoint[] => {
    return analytics?.completionTrend || [];
  }, [analytics]);

  const formTypes = useMemo((): Array<{ value: string; label: string }> => {
    if (!analytics?.formsByType) {
      return [];
    }
    return analytics.formsByType.map((ft) => ({
      value: ft.typeId,
      label: `${ft.type} (${ft.count})`,
    }));
  }, [analytics]);

  const hasData = useMemo((): boolean => {
    return analytics !== null && analytics.totalForms > 0;
  }, [analytics]);

  return {
    // State
    analytics,
    dailyReport,
    weeklyReport,
    monthlyReport,
    isLoading,
    isGeneratingReport,
    error,

    // Filters
    period,
    setPeriod,
    customDateRange,
    setCustomDateRange,
    formTypeFilter,
    setFormTypeFilter,

    // Actions
    refreshAnalytics,
    generateReport,
    exportCSV,
    exportSummary,

    // Computed
    completionTrend,
    formTypes,
    hasData,
  };
}

export default useFormAnalytics;
