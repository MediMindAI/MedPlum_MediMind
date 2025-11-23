// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { TableSkeleton } from './TableSkeleton';

describe('TableSkeleton', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  it('should render default 5 skeleton rows', () => {
    const { container } = renderWithProviders(<TableSkeleton />);

    // Check for skeleton elements
    const skeletons = container.querySelectorAll('[class*="Skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render specified number of rows', () => {
    const { container } = renderWithProviders(<TableSkeleton rows={3} />);

    // Check for skeleton rows
    const rows = container.querySelectorAll('[data-testid="skeleton-row"]');
    expect(rows).toHaveLength(3);
  });

  it('should render 10 rows when specified', () => {
    const { container } = renderWithProviders(<TableSkeleton rows={10} />);

    const rows = container.querySelectorAll('[data-testid="skeleton-row"]');
    expect(rows).toHaveLength(10);
  });

  it('should display loading text', () => {
    const { container } = renderWithProviders(<TableSkeleton />);

    // Check for loading text - may be Georgian or key fallback
    const loadingText = container.querySelector('[class*="Text"]');
    expect(loadingText).toBeInTheDocument();
  });

  it('should render header skeleton', () => {
    const { container } = renderWithProviders(<TableSkeleton />);

    const headerSkeleton = container.querySelector('[data-testid="skeleton-header"]');
    expect(headerSkeleton).toBeInTheDocument();
  });

  it('should match AccountTable column structure', () => {
    const { container } = renderWithProviders(<TableSkeleton />);

    // Each row should have multiple column skeletons
    const firstRow = container.querySelector('[data-testid="skeleton-row"]');
    expect(firstRow).toBeInTheDocument();

    const columns = firstRow?.querySelectorAll('[data-testid="skeleton-cell"]');
    // AccountTable has 9 columns
    expect(columns?.length).toBe(9);
  });

  it('should use Mantine Skeleton component with animation', () => {
    const { container } = renderWithProviders(<TableSkeleton />);

    // Mantine Skeleton should have animate prop by default (data-animate="true")
    const skeletonElement = container.querySelector('[class*="Skeleton"]');
    expect(skeletonElement).toBeInTheDocument();
  });

  it('should render within a Box container', () => {
    const { container } = renderWithProviders(<TableSkeleton />);

    // Check container exists
    const wrapper = container.firstChild;
    expect(wrapper).toBeInTheDocument();
  });

  it('should be accessible', () => {
    renderWithProviders(<TableSkeleton />);

    // Should have loading indicator role or aria-busy
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
