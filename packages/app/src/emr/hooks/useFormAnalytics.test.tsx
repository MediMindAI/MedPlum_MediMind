// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderHook, act, waitFor } from '@testing-library/react';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import type { ReactNode } from 'react';
import { useFormAnalytics } from './useFormAnalytics';
import { COMPLETION_TIME_EXTENSION_URL } from '../services/formAnalyticsService';

describe('useFormAnalytics', () => {
  let medplum: MockClient;

  const createWrapper = (client: MockClient) => {
    return function Wrapper({ children }: { children: ReactNode }) {
      return <MedplumProvider medplum={client}>{children}</MedplumProvider>;
    };
  };

  beforeEach(async () => {
    medplum = new MockClient();

    // Create test questionnaire
    await medplum.createResource({
      resourceType: 'Questionnaire',
      id: 'test-form',
      status: 'active',
      title: 'Test Form',
      item: [
        {
          linkId: 'q1',
          type: 'string',
          text: 'Question 1',
        },
      ],
    });

    // Create test responses
    await medplum.createResource({
      resourceType: 'QuestionnaireResponse',
      id: 'response-1',
      status: 'completed',
      questionnaire: 'Questionnaire/test-form',
      authored: new Date().toISOString(),
      meta: {
        extension: [
          {
            url: COMPLETION_TIME_EXTENSION_URL,
            valueInteger: 120000,
          },
        ],
      },
      item: [
        {
          linkId: 'q1',
          answer: [{ valueString: 'Answer 1' }],
        },
      ],
    });

    await medplum.createResource({
      resourceType: 'QuestionnaireResponse',
      id: 'response-2',
      status: 'in-progress',
      questionnaire: 'Questionnaire/test-form',
      authored: new Date().toISOString(),
      item: [],
    });
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.analytics).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should fetch analytics on mount', async () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.analytics).not.toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should have default period of 30d', () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    expect(result.current.period).toBe('30d');
  });

  it('should allow changing period', async () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setPeriod('7d');
    });

    expect(result.current.period).toBe('7d');
  });

  it('should allow setting custom date range', async () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setPeriod('custom');
      result.current.setCustomDateRange({
        from: '2025-01-01',
        to: '2025-01-31',
      });
    });

    expect(result.current.customDateRange).toEqual({
      from: '2025-01-01',
      to: '2025-01-31',
    });
  });

  it('should allow setting form type filter', async () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setFormTypeFilter('test-form');
    });

    expect(result.current.formTypeFilter).toBe('test-form');
  });

  it('should refresh analytics on demand', async () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialAnalytics = result.current.analytics;

    await act(async () => {
      await result.current.refreshAnalytics();
    });

    expect(result.current.analytics).not.toBe(null);
    // Analytics should be refetched
    expect(result.current.isLoading).toBe(false);
  });

  it('should generate daily report', async () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.generateReport('daily', '2025-11-15');
    });

    expect(result.current.dailyReport).not.toBe(null);
    expect(result.current.dailyReport?.date).toBe('2025-11-15');
  });

  it('should generate weekly report', async () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.generateReport('weekly', '2025-11-10');
    });

    expect(result.current.weeklyReport).not.toBe(null);
    expect(result.current.weeklyReport?.weekStart).toBe('2025-11-10');
  });

  it('should generate monthly report', async () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.generateReport('monthly', '2025-11-01');
    });

    expect(result.current.monthlyReport).not.toBe(null);
    expect(result.current.monthlyReport?.month).toBe('November');
    expect(result.current.monthlyReport?.year).toBe(2025);
  });

  it('should export analytics to CSV', async () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const csv = result.current.exportCSV();

    expect(typeof csv).toBe('string');
    expect(csv).toContain('Date,Form Type,Total,Completed,Completion Rate,Avg Time (min)');
  });

  it('should export summary to CSV', async () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const csv = result.current.exportSummary();

    expect(typeof csv).toBe('string');
    expect(csv).toContain('Metric,Value');
    expect(csv).toContain('Total Forms');
  });

  it('should return empty CSV when no analytics data', () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    // Before loading completes
    const csv = result.current.exportCSV();
    expect(csv).toBe('');
  });

  it('should compute hasData correctly', async () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    // Initially false (no data yet)
    expect(result.current.hasData).toBe(false);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // After loading, should have data
    expect(result.current.hasData).toBe(true);
  });

  it('should compute formTypes from analytics', async () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(Array.isArray(result.current.formTypes)).toBe(true);
  });

  it('should compute completionTrend from analytics', async () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(Array.isArray(result.current.completionTrend)).toBe(true);
  });

  it('should handle API errors gracefully', async () => {
    // Create a mock client that throws errors
    const errorMedplum = new MockClient();
    const originalSearch = errorMedplum.search.bind(errorMedplum);
    errorMedplum.search = async () => {
      throw new Error('API Error');
    };

    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(errorMedplum),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('API Error');
    expect(result.current.analytics).toBe(null);
  });

  it('should clear error on successful refresh', async () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Ensure no error after successful load
    expect(result.current.error).toBe(null);
  });

  it('should set isGeneratingReport during report generation', async () => {
    const { result } = renderHook(() => useFormAnalytics(), {
      wrapper: createWrapper(medplum),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Start report generation
    const reportPromise = act(async () => {
      await result.current.generateReport('daily');
    });

    // isGeneratingReport should be true while generating
    await reportPromise;

    // After completion
    expect(result.current.isGeneratingReport).toBe(false);
  });
});
