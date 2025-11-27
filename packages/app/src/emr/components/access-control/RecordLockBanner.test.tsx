// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { RecordLockBanner } from './RecordLockBanner';
import type { RecordLockStatus } from '../../types/permission-cache';

describe('RecordLockBanner', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<MantineProvider>{ui}</MantineProvider>);
  };

  it('shows lock icon when locked without override', () => {
    const status: RecordLockStatus = {
      isLocked: true,
      createdAt: '2025-01-01T12:00:00Z',
      locksAt: '2025-01-02T12:00:00Z',
      canOverride: false,
      timeRemainingMs: -3600000, // -1 hour
    };

    renderWithTheme(<RecordLockBanner status={status} />);

    expect(screen.getByText(/this record is locked/i)).toBeInTheDocument();
  });

  it('shows time remaining when unlocked', () => {
    const status: RecordLockStatus = {
      isLocked: false,
      createdAt: '2025-01-01T12:00:00Z',
      locksAt: '2025-01-02T12:00:00Z',
      canOverride: false,
      timeRemainingMs: 18 * 60 * 60 * 1000, // 18 hours
    };

    renderWithTheme(<RecordLockBanner status={status} />);

    expect(screen.getByText(/18h/)).toBeInTheDocument();
    expect(screen.getByText(/remaining to edit/i)).toBeInTheDocument();
  });

  it('shows override button for admins', () => {
    const status: RecordLockStatus = {
      isLocked: true,
      createdAt: '2025-01-01T12:00:00Z',
      locksAt: '2025-01-02T12:00:00Z',
      canOverride: true,
      timeRemainingMs: -3600000,
    };

    const onOverride = jest.fn();

    renderWithTheme(<RecordLockBanner status={status} onOverride={onOverride} />);

    const overrideButton = screen.getByRole('button', { name: /override lock/i });
    expect(overrideButton).toBeInTheDocument();

    fireEvent.click(overrideButton);
    expect(onOverride).toHaveBeenCalledTimes(1);
  });

  it('does not show override button when callback not provided', () => {
    const status: RecordLockStatus = {
      isLocked: true,
      createdAt: '2025-01-01T12:00:00Z',
      locksAt: '2025-01-02T12:00:00Z',
      canOverride: true,
      timeRemainingMs: -3600000,
    };

    renderWithTheme(<RecordLockBanner status={status} />);

    expect(screen.queryByRole('button', { name: /override lock/i })).not.toBeInTheDocument();
  });

  it('shows appropriate color for locked state', () => {
    const status: RecordLockStatus = {
      isLocked: true,
      createdAt: '2025-01-01T12:00:00Z',
      locksAt: '2025-01-02T12:00:00Z',
      canOverride: false,
      timeRemainingMs: -3600000,
    };

    const { container } = renderWithTheme(<RecordLockBanner status={status} />);

    // Check for red Alert color
    const alert = container.querySelector('[data-color="red"]');
    expect(alert).toBeInTheDocument();
  });

  it('shows appropriate color for unlocked state', () => {
    const status: RecordLockStatus = {
      isLocked: false,
      createdAt: '2025-01-01T12:00:00Z',
      locksAt: '2025-01-02T12:00:00Z',
      canOverride: false,
      timeRemainingMs: 18 * 60 * 60 * 1000,
    };

    const { container } = renderWithTheme(<RecordLockBanner status={status} />);

    // Check for blue Alert color (informational)
    const alert = container.querySelector('[data-color="blue"]');
    expect(alert).toBeInTheDocument();
  });

  it('shows appropriate color for override state', () => {
    const status: RecordLockStatus = {
      isLocked: true,
      createdAt: '2025-01-01T12:00:00Z',
      locksAt: '2025-01-02T12:00:00Z',
      canOverride: true,
      timeRemainingMs: -3600000,
    };

    const { container } = renderWithTheme(<RecordLockBanner status={status} onOverride={() => {}} />);

    // Check for orange Alert color (warning)
    const alert = container.querySelector('[data-color="orange"]');
    expect(alert).toBeInTheDocument();
  });

  it('returns null when not locked and no time remaining message needed', () => {
    const status: RecordLockStatus = {
      isLocked: false,
      createdAt: '2025-01-01T12:00:00Z',
      locksAt: '2025-01-02T12:00:00Z',
      canOverride: false,
      timeRemainingMs: 0, // Edge case: exactly at lock time
    };

    const { container } = renderWithTheme(<RecordLockBanner status={status} />);

    // Should render nothing or minimal content
    expect(container.querySelector('.mantine-Alert-root')).not.toBeInTheDocument();
  });
});
