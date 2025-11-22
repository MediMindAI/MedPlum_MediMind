// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * @module formAnalyticsService
 * @description Form Analytics Service for tracking form usage metrics.
 *
 * Provides analytics capabilities:
 * - Aggregate metrics (completion rate, avg time, form counts)
 * - Skipped field analysis (identify problematic fields)
 * - Daily/Weekly/Monthly reports
 * - CSV export for external analysis
 * - Completion time tracking
 *
 * ## Usage Example
 * ```typescript
 * import {
 *   aggregateMetrics,
 *   generateDailyReport,
 *   exportToCSV,
 * } from '@/emr/services/formAnalyticsService';
 *
 * // Get analytics for last 30 days
 * const analytics = await aggregateMetrics(medplum, {
 *   dateFrom: '2025-10-22',
 *   dateTo: '2025-11-22',
 * });
 *
 * console.log(analytics.completionRate); // 85.5%
 * console.log(analytics.averageCompletionTimeMs); // 180000 (3 min)
 *
 * // Export to CSV
 * const csv = exportToCSV(analytics);
 * ```
 *
 * ## Metrics Tracked
 * - Total forms created/submitted
 * - Completion rate (completed / total)
 * - Average completion time
 * - Forms by type/category
 * - Most skipped fields
 * - Daily/weekly/monthly trends
 *
 * @see useFormAnalytics hook for React integration
 */

import type { MedplumClient } from '@medplum/core';
import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  Bundle,
} from '@medplum/fhirtypes';

/**
 * Extension URL for tracking completion time
 */
export const COMPLETION_TIME_EXTENSION_URL =
  'http://medimind.ge/fhir/StructureDefinition/completion-time';

/**
 * Extension URL for tracking form start time
 */
export const FORM_START_TIME_EXTENSION_URL =
  'http://medimind.ge/fhir/StructureDefinition/form-start-time';

// ============================================================================
// Types
// ============================================================================

/**
 * Aggregated form analytics data
 */
export interface FormAnalytics {
  totalForms: number;
  completedForms: number;
  inProgressForms: number;
  draftForms: number;
  completionRate: number;
  averageCompletionTimeMs: number;
  formsByType: FormTypeCount[];
  completionTrend: CompletionTrendPoint[];
  skippedFields: SkippedFieldStats[];
}

/**
 * Form count by type
 */
export interface FormTypeCount {
  type: string;
  typeId: string;
  count: number;
}

/**
 * Completion trend data point
 */
export interface CompletionTrendPoint {
  date: string;
  completed: number;
  started: number;
  completionRate: number;
}

/**
 * Skipped field statistics
 */
export interface SkippedFieldStats {
  fieldId: string;
  fieldLabel: string;
  skipCount: number;
  skipRate: number;
}

/**
 * Analytics filter parameters
 */
export interface AnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  questionnaireId?: string;
  formType?: string;
}

/**
 * Daily report data
 */
export interface DailyReport {
  date: string;
  totalSubmissions: number;
  completedForms: number;
  draftsSaved: number;
  averageCompletionTimeMs: number;
  formsByType: FormTypeCount[];
  topSkippedFields: SkippedFieldStats[];
}

/**
 * Weekly report data
 */
export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  totalSubmissions: number;
  completedForms: number;
  draftsSaved: number;
  averageCompletionTimeMs: number;
  dailyBreakdown: DailyReport[];
  formsByType: FormTypeCount[];
  completionRateTrend: CompletionTrendPoint[];
}

/**
 * Monthly report data
 */
export interface MonthlyReport {
  month: string;
  year: number;
  totalSubmissions: number;
  completedForms: number;
  draftsSaved: number;
  averageCompletionTimeMs: number;
  weeklyBreakdown: WeeklyReport[];
  formsByType: FormTypeCount[];
  completionRateTrend: CompletionTrendPoint[];
  topSkippedFields: SkippedFieldStats[];
}

/**
 * CSV export row
 */
export interface CSVExportRow {
  date: string;
  formType: string;
  total: number;
  completed: number;
  completionRate: string;
  avgTimeMinutes: string;
}

// ============================================================================
// Core Analytics Functions
// ============================================================================

/**
 * Aggregate metrics from QuestionnaireResponses
 *
 * @param medplum - Medplum client
 * @param filters - Analytics filters
 * @returns Aggregated form analytics
 */
export async function aggregateMetrics(
  medplum: MedplumClient,
  filters: AnalyticsFilters = {}
): Promise<FormAnalytics> {
  // Fetch all responses within the filter range
  const responses = await fetchFilteredResponses(medplum, filters);

  // Calculate basic counts
  const totalForms = responses.length;
  const completedForms = responses.filter((r) => r.status === 'completed').length;
  const inProgressForms = responses.filter((r) => r.status === 'in-progress').length;
  const draftForms = responses.filter(
    (r) => r.status === 'in-progress' && hasDraftExtension(r)
  ).length;

  // Calculate completion rate
  const completionRate = calculateCompletionRate(responses);

  // Calculate average completion time
  const averageCompletionTimeMs = getAverageCompletionTime(responses);

  // Group by form type
  const formsByType = await getFormsByType(medplum, responses);

  // Calculate completion trend
  const completionTrend = calculateCompletionTrend(responses, filters);

  // Analyze skipped fields
  const skippedFields = await getSkippedFieldStats(medplum, responses);

  return {
    totalForms,
    completedForms,
    inProgressForms,
    draftForms,
    completionRate,
    averageCompletionTimeMs,
    formsByType,
    completionTrend,
    skippedFields,
  };
}

/**
 * Fetch QuestionnaireResponses with filters
 */
async function fetchFilteredResponses(
  medplum: MedplumClient,
  filters: AnalyticsFilters
): Promise<QuestionnaireResponse[]> {
  const searchParams: Record<string, string> = {
    _count: '1000',
    _sort: '-authored',
  };

  // Date range filter - FHIR uses separate parameters for multiple values
  if (filters.dateFrom && filters.dateTo) {
    // For date range, use the ge prefix for start
    searchParams['authored'] = `ge${filters.dateFrom}`;
  } else if (filters.dateFrom) {
    searchParams['authored'] = `ge${filters.dateFrom}`;
  } else if (filters.dateTo) {
    searchParams['authored'] = `le${filters.dateTo}`;
  }

  // Questionnaire filter
  if (filters.questionnaireId) {
    searchParams['questionnaire'] = `Questionnaire/${filters.questionnaireId}`;
  }

  const bundle = await medplum.search('QuestionnaireResponse', searchParams);

  if (!bundle.entry) {
    return [];
  }

  return bundle.entry
    .filter((e) => e.resource?.resourceType === 'QuestionnaireResponse')
    .map((e) => e.resource as QuestionnaireResponse);
}

/**
 * Calculate completion rate from responses
 *
 * @param responses - QuestionnaireResponses
 * @returns Completion rate as percentage (0-100)
 */
export function calculateCompletionRate(responses: QuestionnaireResponse[]): number {
  if (responses.length === 0) {
    return 0;
  }

  const completedCount = responses.filter((r) => r.status === 'completed').length;
  return Math.round((completedCount / responses.length) * 100 * 10) / 10;
}

/**
 * Get average completion time from responses
 *
 * @param responses - QuestionnaireResponses
 * @returns Average completion time in milliseconds
 */
export function getAverageCompletionTime(responses: QuestionnaireResponse[]): number {
  const completionTimes: number[] = [];

  for (const response of responses) {
    if (response.status === 'completed') {
      const completionTime = getCompletionTimeFromResponse(response);
      if (completionTime > 0) {
        completionTimes.push(completionTime);
      }
    }
  }

  if (completionTimes.length === 0) {
    return 0;
  }

  const sum = completionTimes.reduce((a, b) => a + b, 0);
  return Math.round(sum / completionTimes.length);
}

/**
 * Extract completion time from a QuestionnaireResponse
 */
function getCompletionTimeFromResponse(response: QuestionnaireResponse): number {
  const extension = response.meta?.extension?.find(
    (ext) => ext.url === COMPLETION_TIME_EXTENSION_URL
  );

  if (extension?.valueInteger) {
    return extension.valueInteger;
  }

  return 0;
}

/**
 * Check if response has draft extension
 */
function hasDraftExtension(response: QuestionnaireResponse): boolean {
  return (
    response.meta?.extension?.some(
      (ext) => ext.url === 'http://medimind.ge/fhir/StructureDefinition/is-draft' && ext.valueBoolean
    ) || false
  );
}

/**
 * Get forms grouped by type/questionnaire
 */
async function getFormsByType(
  medplum: MedplumClient,
  responses: QuestionnaireResponse[]
): Promise<FormTypeCount[]> {
  // Group by questionnaire reference
  const questionnaireGroups = new Map<string, number>();

  for (const response of responses) {
    const questionnaireRef = response.questionnaire || 'Unknown';
    const current = questionnaireGroups.get(questionnaireRef) || 0;
    questionnaireGroups.set(questionnaireRef, current + 1);
  }

  // Fetch questionnaire titles
  const formTypes: FormTypeCount[] = [];
  const questionnaireIds = Array.from(questionnaireGroups.keys())
    .filter((ref) => ref.startsWith('Questionnaire/'))
    .map((ref) => ref.replace('Questionnaire/', ''));

  const questionnaireMap = new Map<string, string>();

  // Fetch questionnaire titles in batch
  if (questionnaireIds.length > 0) {
    try {
      const bundle = await medplum.search('Questionnaire', {
        _id: questionnaireIds.join(','),
        _count: '100',
      });

      if (bundle.entry) {
        for (const entry of bundle.entry) {
          const questionnaire = entry.resource as Questionnaire;
          if (questionnaire.id) {
            questionnaireMap.set(
              `Questionnaire/${questionnaire.id}`,
              questionnaire.title || questionnaire.name || questionnaire.id
            );
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch questionnaire titles:', error);
    }
  }

  // Build form type counts
  for (const [ref, count] of questionnaireGroups) {
    const title = questionnaireMap.get(ref) || ref.replace('Questionnaire/', '');
    formTypes.push({
      type: title,
      typeId: ref.replace('Questionnaire/', ''),
      count,
    });
  }

  // Sort by count descending
  return formTypes.sort((a, b) => b.count - a.count);
}

/**
 * Calculate completion trend over time
 */
function calculateCompletionTrend(
  responses: QuestionnaireResponse[],
  filters: AnalyticsFilters
): CompletionTrendPoint[] {
  // Group responses by date
  const dateGroups = new Map<string, { completed: number; started: number }>();

  for (const response of responses) {
    const dateStr = response.authored?.split('T')[0];
    if (!dateStr) {
      continue;
    }

    const group = dateGroups.get(dateStr) || { completed: 0, started: 0 };

    if (response.status === 'completed') {
      group.completed++;
    }
    group.started++;

    dateGroups.set(dateStr, group);
  }

  // Convert to array and sort by date
  const trend: CompletionTrendPoint[] = [];

  for (const [date, counts] of dateGroups) {
    const completionRate =
      counts.started > 0 ? Math.round((counts.completed / counts.started) * 100 * 10) / 10 : 0;

    trend.push({
      date,
      completed: counts.completed,
      started: counts.started,
      completionRate,
    });
  }

  return trend.sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================================================
// Skipped Field Analysis
// ============================================================================

/**
 * Analyze skipped (unanswered) fields across responses
 *
 * @param medplum - Medplum client
 * @param responses - QuestionnaireResponses to analyze
 * @returns Statistics on skipped fields
 */
export async function getSkippedFieldStats(
  medplum: MedplumClient,
  responses: QuestionnaireResponse[]
): Promise<SkippedFieldStats[]> {
  // Count skips per field
  const fieldSkipCounts = new Map<string, { count: number; label: string; total: number }>();

  // Get unique questionnaire IDs
  const questionnaireIds = new Set<string>();
  for (const response of responses) {
    if (response.questionnaire) {
      questionnaireIds.add(response.questionnaire.replace('Questionnaire/', ''));
    }
  }

  // Fetch questionnaires to get field definitions
  const questionnaireMap = new Map<string, Questionnaire>();

  for (const qId of questionnaireIds) {
    try {
      const questionnaire = await medplum.readResource('Questionnaire', qId);
      questionnaireMap.set(qId, questionnaire);
    } catch (error) {
      console.warn(`Failed to fetch questionnaire ${qId}:`, error);
    }
  }

  // Analyze each response
  for (const response of responses) {
    const qId = response.questionnaire?.replace('Questionnaire/', '');
    if (!qId) {
      continue;
    }

    const questionnaire = questionnaireMap.get(qId);
    if (!questionnaire) {
      continue;
    }

    // Get all field IDs from questionnaire
    const allFields = extractAllFieldIds(questionnaire.item || []);

    // Get answered field IDs from response
    const answeredFields = new Set<string>();
    extractAnsweredFieldIds(response.item || [], answeredFields);

    // Find skipped fields
    for (const field of allFields) {
      if (!answeredFields.has(field.linkId)) {
        const key = `${qId}:${field.linkId}`;
        const current = fieldSkipCounts.get(key) || {
          count: 0,
          label: field.text || field.linkId,
          total: 0,
        };
        current.count++;
        current.total++;
        fieldSkipCounts.set(key, current);
      } else {
        // Track total occurrences for non-skipped fields too
        const key = `${qId}:${field.linkId}`;
        const current = fieldSkipCounts.get(key) || {
          count: 0,
          label: field.text || field.linkId,
          total: 0,
        };
        current.total++;
        fieldSkipCounts.set(key, current);
      }
    }
  }

  // Convert to stats array
  const stats: SkippedFieldStats[] = [];

  for (const [key, data] of fieldSkipCounts) {
    if (data.count > 0) {
      const fieldId = key.split(':')[1];
      stats.push({
        fieldId,
        fieldLabel: data.label,
        skipCount: data.count,
        skipRate: data.total > 0 ? Math.round((data.count / data.total) * 100 * 10) / 10 : 0,
      });
    }
  }

  // Sort by skip count descending
  return stats.sort((a, b) => b.skipCount - a.skipCount).slice(0, 20);
}

/**
 * Extract all field IDs from questionnaire items
 */
function extractAllFieldIds(
  items: QuestionnaireItem[]
): Array<{ linkId: string; text: string }> {
  const fields: Array<{ linkId: string; text: string }> = [];

  for (const item of items) {
    if (item.type !== 'display' && item.type !== 'group') {
      fields.push({
        linkId: item.linkId,
        text: item.text || item.linkId,
      });
    }

    // Recurse into nested items
    if (item.item) {
      fields.push(...extractAllFieldIds(item.item));
    }
  }

  return fields;
}

/**
 * Extract answered field IDs from response items
 */
function extractAnsweredFieldIds(
  items: QuestionnaireResponseItem[],
  answeredFields: Set<string>
): void {
  for (const item of items) {
    if (item.answer && item.answer.length > 0) {
      answeredFields.add(item.linkId);
    }

    // Recurse into nested items
    if (item.item) {
      extractAnsweredFieldIds(item.item, answeredFields);
    }
  }
}

// ============================================================================
// Report Generation
// ============================================================================

/**
 * Generate a daily report
 *
 * @param medplum - Medplum client
 * @param date - Date in ISO format (YYYY-MM-DD)
 * @returns Daily report data
 */
export async function generateDailyReport(
  medplum: MedplumClient,
  date: string
): Promise<DailyReport> {
  const nextDay = getNextDay(date);

  const analytics = await aggregateMetrics(medplum, {
    dateFrom: date,
    dateTo: nextDay,
  });

  return {
    date,
    totalSubmissions: analytics.totalForms,
    completedForms: analytics.completedForms,
    draftsSaved: analytics.draftForms,
    averageCompletionTimeMs: analytics.averageCompletionTimeMs,
    formsByType: analytics.formsByType,
    topSkippedFields: analytics.skippedFields.slice(0, 10),
  };
}

/**
 * Generate a weekly report
 *
 * @param medplum - Medplum client
 * @param weekStart - Start of week in ISO format (YYYY-MM-DD)
 * @returns Weekly report data
 */
export async function generateWeeklyReport(
  medplum: MedplumClient,
  weekStart: string
): Promise<WeeklyReport> {
  const weekEnd = addDays(weekStart, 6);

  // Get overall analytics for the week
  const analytics = await aggregateMetrics(medplum, {
    dateFrom: weekStart,
    dateTo: addDays(weekEnd, 1),
  });

  // Generate daily breakdown
  const dailyBreakdown: DailyReport[] = [];
  let currentDate = weekStart;

  for (let i = 0; i < 7; i++) {
    const dayReport = await generateDailyReport(medplum, currentDate);
    dailyBreakdown.push(dayReport);
    currentDate = getNextDay(currentDate);
  }

  return {
    weekStart,
    weekEnd,
    totalSubmissions: analytics.totalForms,
    completedForms: analytics.completedForms,
    draftsSaved: analytics.draftForms,
    averageCompletionTimeMs: analytics.averageCompletionTimeMs,
    dailyBreakdown,
    formsByType: analytics.formsByType,
    completionRateTrend: analytics.completionTrend,
  };
}

/**
 * Generate a monthly report
 *
 * @param medplum - Medplum client
 * @param month - Month (1-12)
 * @param year - Year (e.g., 2025)
 * @returns Monthly report data
 */
export async function generateMonthlyReport(
  medplum: MedplumClient,
  month: number,
  year: number
): Promise<MonthlyReport> {
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const monthEnd = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

  // Get overall analytics for the month
  const analytics = await aggregateMetrics(medplum, {
    dateFrom: monthStart,
    dateTo: monthEnd,
  });

  // Generate weekly breakdown
  const weeklyBreakdown: WeeklyReport[] = [];
  let currentWeekStart = monthStart;

  while (currentWeekStart < monthEnd) {
    const weekReport = await generateWeeklyReport(medplum, currentWeekStart);
    weeklyBreakdown.push(weekReport);
    currentWeekStart = addDays(currentWeekStart, 7);
  }

  const monthName = new Date(monthStart).toLocaleString('default', { month: 'long' });

  return {
    month: monthName,
    year,
    totalSubmissions: analytics.totalForms,
    completedForms: analytics.completedForms,
    draftsSaved: analytics.draftForms,
    averageCompletionTimeMs: analytics.averageCompletionTimeMs,
    weeklyBreakdown,
    formsByType: analytics.formsByType,
    completionRateTrend: analytics.completionTrend,
    topSkippedFields: analytics.skippedFields,
  };
}

// ============================================================================
// CSV Export
// ============================================================================

/**
 * Export analytics data to CSV format
 *
 * @param analytics - Form analytics data
 * @param formTypeFilter - Optional filter for specific form type
 * @returns CSV string
 */
export function exportToCSV(analytics: FormAnalytics, formTypeFilter?: string): string {
  const rows: CSVExportRow[] = [];

  // Group trend data by form type
  for (const typeData of analytics.formsByType) {
    if (formTypeFilter && typeData.type !== formTypeFilter) {
      continue;
    }

    // Get trend data for this type (simplified - uses overall trend)
    for (const trendPoint of analytics.completionTrend) {
      const row: CSVExportRow = {
        date: trendPoint.date,
        formType: typeData.type,
        total: trendPoint.started,
        completed: trendPoint.completed,
        completionRate: `${trendPoint.completionRate}%`,
        avgTimeMinutes: formatMinutes(analytics.averageCompletionTimeMs),
      };
      rows.push(row);
    }
  }

  // Build CSV
  const headers = ['Date', 'Form Type', 'Total', 'Completed', 'Completion Rate', 'Avg Time (min)'];
  const csvLines = [headers.join(',')];

  for (const row of rows) {
    const values = [
      row.date,
      `"${row.formType}"`,
      String(row.total),
      String(row.completed),
      row.completionRate,
      row.avgTimeMinutes,
    ];
    csvLines.push(values.join(','));
  }

  return csvLines.join('\n');
}

/**
 * Export analytics summary to CSV
 */
export function exportSummaryToCSV(analytics: FormAnalytics): string {
  const headers = [
    'Metric',
    'Value',
  ];
  const csvLines = [headers.join(',')];

  csvLines.push(`Total Forms,${analytics.totalForms}`);
  csvLines.push(`Completed Forms,${analytics.completedForms}`);
  csvLines.push(`In Progress Forms,${analytics.inProgressForms}`);
  csvLines.push(`Draft Forms,${analytics.draftForms}`);
  csvLines.push(`Completion Rate,${analytics.completionRate}%`);
  csvLines.push(`Average Completion Time,${formatMinutes(analytics.averageCompletionTimeMs)} min`);

  // Add form types section
  csvLines.push('');
  csvLines.push('Form Type,Count');
  for (const type of analytics.formsByType) {
    csvLines.push(`"${type.type}",${type.count}`);
  }

  // Add skipped fields section
  csvLines.push('');
  csvLines.push('Skipped Field,Skip Count,Skip Rate');
  for (const field of analytics.skippedFields.slice(0, 10)) {
    csvLines.push(`"${field.fieldLabel}",${field.skipCount},${field.skipRate}%`);
  }

  return csvLines.join('\n');
}

// ============================================================================
// Completion Time Tracking
// ============================================================================

/**
 * Create completion time extension for QuestionnaireResponse
 *
 * @param startTime - Form start time in milliseconds
 * @returns Extension object to add to response.meta.extension
 */
export function createCompletionTimeExtension(
  startTime: number
): { url: string; valueInteger: number } {
  const completionTime = Date.now() - startTime;
  return {
    url: COMPLETION_TIME_EXTENSION_URL,
    valueInteger: completionTime,
  };
}

/**
 * Create form start time extension
 *
 * @returns Extension object to add when form is opened
 */
export function createStartTimeExtension(): { url: string; valueInstant: string } {
  return {
    url: FORM_START_TIME_EXTENSION_URL,
    valueInstant: new Date().toISOString(),
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the next day in ISO format
 */
function getNextDay(date: string): string {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

/**
 * Add days to a date string
 */
function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Format milliseconds as minutes string
 */
function formatMinutes(ms: number): string {
  if (ms === 0) {
    return '0';
  }
  const minutes = ms / 60000;
  return minutes.toFixed(1);
}

/**
 * Get date range for predefined periods
 */
export function getDateRangeForPeriod(
  period: '7d' | '30d' | '90d' | 'custom',
  customFrom?: string,
  customTo?: string
): { dateFrom: string; dateTo: string } {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  if (period === 'custom' && customFrom && customTo) {
    return { dateFrom: customFrom, dateTo: customTo };
  }

  let daysBack: number;
  switch (period) {
    case '7d':
      daysBack = 7;
      break;
    case '30d':
      daysBack = 30;
      break;
    case '90d':
      daysBack = 90;
      break;
    default:
      daysBack = 30;
  }

  const fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - daysBack);
  const fromStr = fromDate.toISOString().split('T')[0];

  return { dateFrom: fromStr, dateTo: todayStr };
}
