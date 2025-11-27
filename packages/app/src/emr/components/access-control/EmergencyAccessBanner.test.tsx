// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { EmergencyAccessBanner } from './EmergencyAccessBanner';
import type { EmergencyAccessResult } from '../../types/permission-cache';

describe('EmergencyAccessBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };

  it('should show banner when access is active', () => {
    const activeAccess: EmergencyAccessResult = {
      granted: true,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      auditEventId: 'audit-123',
    };

    renderWithProviders(<EmergencyAccessBanner activeAccess={activeAccess} />);

    expect(screen.getByText('Emergency access active - all actions are being logged')).toBeInTheDocument();
  });

  it('should hide banner when no active access', () => {
    renderWithProviders(<EmergencyAccessBanner activeAccess={null} />);

    expect(
      screen.queryByText('Emergency access active - all actions are being logged')
    ).not.toBeInTheDocument();
  });

  it('should display expiration time correctly', async () => {
    const activeAccess: EmergencyAccessResult = {
      granted: true,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      auditEventId: 'audit-123',
    };

    renderWithProviders(<EmergencyAccessBanner activeAccess={activeAccess} />);

    // Wait for timer to update
    await waitFor(
      () => {
        const banner = screen.getByText(/Expires in/);
        expect(banner).toBeInTheDocument();
        // Should show minutes and seconds (e.g., "4m 59s")
        expect(banner.textContent).toMatch(/\d+m \d+s/);
      },
      { timeout: 2000 }
    );
  });

  it('should render alert with warning styling', () => {
    const activeAccess: EmergencyAccessResult = {
      granted: true,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      auditEventId: 'audit-123',
    };

    const { container } = renderWithProviders(<EmergencyAccessBanner activeAccess={activeAccess} />);

    // Find the Alert component
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();

    // Verify banner is visible and has content
    expect(screen.getByText('Emergency access active - all actions are being logged')).toBeInTheDocument();
  });

  it('should hide banner when access expires', async () => {
    const activeAccess: EmergencyAccessResult = {
      granted: true,
      expiresAt: new Date(Date.now() + 1000).toISOString(), // 1 second from now
      auditEventId: 'audit-123',
    };

    const { container } = renderWithProviders(<EmergencyAccessBanner activeAccess={activeAccess} />);

    // Banner should be visible initially
    expect(screen.getByText('Emergency access active - all actions are being logged')).toBeInTheDocument();

    // Wait for expiration
    await waitFor(
      () => {
        const alert = container.querySelector('[role="alert"]');
        expect(alert).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should update countdown every second', async () => {
    const activeAccess: EmergencyAccessResult = {
      granted: true,
      expiresAt: new Date(Date.now() + 65 * 1000).toISOString(), // 65 seconds from now
      auditEventId: 'audit-123',
    };

    renderWithProviders(<EmergencyAccessBanner activeAccess={activeAccess} />);

    // Get initial time
    const initialText = screen.getByText(/Expires in/).textContent;

    // Wait 1 second and check if time updated
    await waitFor(
      () => {
        const updatedText = screen.getByText(/Expires in/).textContent;
        expect(updatedText).not.toBe(initialText);
      },
      { timeout: 2000 }
    );
  });

  it('should show seconds only when less than 1 minute remaining', async () => {
    const activeAccess: EmergencyAccessResult = {
      granted: true,
      expiresAt: new Date(Date.now() + 45 * 1000).toISOString(), // 45 seconds from now
      auditEventId: 'audit-123',
    };

    renderWithProviders(<EmergencyAccessBanner activeAccess={activeAccess} />);

    await waitFor(
      () => {
        const banner = screen.getByText(/Expires in/);
        // Should show only seconds (e.g., "45s")
        expect(banner.textContent).toMatch(/\d+s/);
        expect(banner.textContent).not.toMatch(/\d+m/);
      },
      { timeout: 1000 }
    );
  });
});
