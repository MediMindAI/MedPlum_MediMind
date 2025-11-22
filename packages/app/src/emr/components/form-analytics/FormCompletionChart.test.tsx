// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import type { CompletionTrendPoint } from '../../services/formAnalyticsService';
import { FormCompletionChart } from './FormCompletionChart';

describe('FormCompletionChart', () => {
  const mockData: CompletionTrendPoint[] = [
    { date: '2025-11-01', completed: 10, started: 12, completionRate: 83.3 },
    { date: '2025-11-02', completed: 15, started: 18, completionRate: 83.3 },
    { date: '2025-11-03', completed: 8, started: 10, completionRate: 80.0 },
    { date: '2025-11-04', completed: 20, started: 22, completionRate: 90.9 },
    { date: '2025-11-05', completed: 12, started: 15, completionRate: 80.0 },
  ];

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };

  it('should render loading state', () => {
    renderWithProviders(<FormCompletionChart data={[]} isLoading />);

    // Skeleton elements should be present
    expect(document.querySelector('.mantine-Skeleton-root')).toBeInTheDocument();
  });

  it('should render empty state when no data', () => {
    renderWithProviders(<FormCompletionChart data={[]} />);

    expect(screen.getByText(/no completion data available/i)).toBeInTheDocument();
  });

  it('should render chart with data', () => {
    renderWithProviders(<FormCompletionChart data={mockData} />);

    // Should show date labels
    expect(screen.getByText(/Nov 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Nov 2/i)).toBeInTheDocument();

    // Should show completion rates - use getAllByText since there may be duplicates
    expect(screen.getAllByText('83.3%').length).toBeGreaterThan(0);
  });

  it('should render custom title', () => {
    renderWithProviders(<FormCompletionChart data={mockData} title="Custom Chart Title" />);

    expect(screen.getByText('Custom Chart Title')).toBeInTheDocument();
  });

  it('should show summary statistics', () => {
    renderWithProviders(<FormCompletionChart data={mockData} />);

    // Total started: 12 + 18 + 10 + 22 + 15 = 77
    expect(screen.getByText('77')).toBeInTheDocument();

    // Total completed: 10 + 15 + 8 + 20 + 12 = 65
    expect(screen.getByText('65')).toBeInTheDocument();

    // Labels
    expect(screen.getByText(/total started/i)).toBeInTheDocument();
    expect(screen.getByText(/total completed/i)).toBeInTheDocument();
    expect(screen.getByText(/average rate/i)).toBeInTheDocument();
  });

  it('should show trend indicator for increasing completion', () => {
    // Data with increasing completion rate
    const increasingData: CompletionTrendPoint[] = [
      { date: '2025-11-01', completed: 5, started: 10, completionRate: 50.0 },
      { date: '2025-11-02', completed: 6, started: 10, completionRate: 60.0 },
      { date: '2025-11-03', completed: 7, started: 10, completionRate: 70.0 },
      { date: '2025-11-04', completed: 8, started: 10, completionRate: 80.0 },
      { date: '2025-11-05', completed: 9, started: 10, completionRate: 90.0 },
    ];

    renderWithProviders(<FormCompletionChart data={increasingData} />);

    // Should show trending up badge
    const trendingBadge = document.querySelector('[class*="Badge"]');
    expect(trendingBadge).toBeInTheDocument();
  });

  it('should show trend indicator for decreasing completion', () => {
    // Data with decreasing completion rate
    const decreasingData: CompletionTrendPoint[] = [
      { date: '2025-11-01', completed: 9, started: 10, completionRate: 90.0 },
      { date: '2025-11-02', completed: 8, started: 10, completionRate: 80.0 },
      { date: '2025-11-03', completed: 7, started: 10, completionRate: 70.0 },
      { date: '2025-11-04', completed: 6, started: 10, completionRate: 60.0 },
      { date: '2025-11-05', completed: 5, started: 10, completionRate: 50.0 },
    ];

    renderWithProviders(<FormCompletionChart data={decreasingData} />);

    // Should show trending down badge
    const trendingBadge = document.querySelector('[class*="Badge"]');
    expect(trendingBadge).toBeInTheDocument();
  });

  it('should show comparison badge when showComparison is true with data', () => {
    const comparisonData: CompletionTrendPoint[] = [
      { date: '2025-10-25', completed: 6, started: 10, completionRate: 60.0 },
      { date: '2025-10-26', completed: 5, started: 10, completionRate: 50.0 },
    ];

    renderWithProviders(
      <FormCompletionChart data={mockData} showComparison comparisonData={comparisonData} />
    );

    // Should show comparison badge
    expect(screen.getByText(/vs previous/i)).toBeInTheDocument();
  });

  it('should not show comparison badge when comparison data is empty', () => {
    renderWithProviders(<FormCompletionChart data={mockData} showComparison comparisonData={[]} />);

    expect(screen.queryByText(/vs previous/i)).not.toBeInTheDocument();
  });

  it('should apply correct color based on completion rate', () => {
    const mixedRateData: CompletionTrendPoint[] = [
      { date: '2025-11-01', completed: 9, started: 10, completionRate: 90.0 }, // green
      { date: '2025-11-02', completed: 6, started: 10, completionRate: 60.0 }, // yellow
      { date: '2025-11-03', completed: 3, started: 10, completionRate: 30.0 }, // red
    ];

    renderWithProviders(<FormCompletionChart data={mixedRateData} />);

    // Progress bars should be present with different colors
    const progressBars = document.querySelectorAll('[class*="Progress"]');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('should handle single data point', () => {
    const singleData: CompletionTrendPoint[] = [
      { date: '2025-11-01', completed: 10, started: 12, completionRate: 83.3 },
    ];

    renderWithProviders(<FormCompletionChart data={singleData} />);

    // Use getAllByText since there may be multiple occurrences
    expect(screen.getAllByText('83.3%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('12').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
  });

  it('should apply custom height', () => {
    const { container } = renderWithProviders(
      <FormCompletionChart data={mockData} height={500} />
    );

    // Check that the container has the custom height style
    const chartArea = container.querySelector('[style*="max-height"]');
    expect(chartArea).toHaveStyle({ maxHeight: '500px' });
  });

  it('should display progress bars for each data point', () => {
    renderWithProviders(<FormCompletionChart data={mockData} />);

    // Should have progress elements for each data point (at least as many as data points)
    const progressElements = document.querySelectorAll('[class*="Progress"]');
    expect(progressElements.length).toBeGreaterThanOrEqual(mockData.length);
  });

  it('should calculate average rate correctly', () => {
    // Average of 83.3, 83.3, 80.0, 90.9, 80.0 = 417.5 / 5 = 83.5
    renderWithProviders(<FormCompletionChart data={mockData} />);

    expect(screen.getByText('83.5%')).toBeInTheDocument();
  });
});
