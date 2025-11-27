// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import { RequirePermission } from './RequirePermission';

// Mock usePermissionCheck hook
jest.mock('../../hooks/usePermissionCheck', () => ({
  usePermissionCheck: jest.fn(),
}));

import { usePermissionCheck } from '../../hooks/usePermissionCheck';
const mockUsePermissionCheck = usePermissionCheck as jest.Mock;

describe('RequirePermission', () => {
  let medplum: MockClient;

  const renderWithProviders = (
    ui: React.ReactElement,
    { initialEntries = ['/test'] } = {}
  ) => {
    return render(
      <MantineProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <MedplumProvider medplum={medplum}>
            <Routes>
              <Route path="/test" element={ui} />
              <Route path="/signin" element={<div>Sign In Page</div>} />
              <Route path="/emr/access-denied" element={<div>Access Denied</div>} />
            </Routes>
          </MedplumProvider>
        </MemoryRouter>
      </MantineProvider>
    );
  };

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders children when permission is granted', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: true,
      loading: false,
    });

    renderWithProviders(
      <RequirePermission permission="view-patient-list">
        <div>Protected Content</div>
      </RequirePermission>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('redirects to access-denied when permission is denied', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      loading: false,
    });

    renderWithProviders(
      <RequirePermission permission="delete-patient">
        <div>Protected Content</div>
      </RequirePermission>
    );

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  it('shows loading spinner while checking permission', () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      loading: true,
    });

    const { container } = renderWithProviders(
      <RequirePermission permission="view-patient-list">
        <div>Protected Content</div>
      </RequirePermission>
    );

    // Check for loader (Mantine Loader renders with role="presentation")
    expect(container.querySelector('.mantine-Loader-root')).toBeInTheDocument();
  });

  it('renders fallback when permission denied and fallback provided', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      loading: false,
    });

    renderWithProviders(
      <RequirePermission
        permission="delete-patient"
        fallback={<div>No Access Fallback</div>}
      >
        <div>Protected Content</div>
      </RequirePermission>
    );

    await waitFor(() => {
      expect(screen.getByText('No Access Fallback')).toBeInTheDocument();
    });
  });

  it('redirects to custom path when provided', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      loading: false,
    });

    render(
      <MantineProvider>
        <MemoryRouter initialEntries={['/test']}>
          <MedplumProvider medplum={medplum}>
            <Routes>
              <Route path="/test" element={
                <RequirePermission permission="admin" redirectTo="/custom-denied">
                  <div>Protected Content</div>
                </RequirePermission>
              } />
              <Route path="/custom-denied" element={<div>Custom Denied Page</div>} />
            </Routes>
          </MedplumProvider>
        </MemoryRouter>
      </MantineProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Custom Denied Page')).toBeInTheDocument();
    });
  });

  it('does not show loading spinner when showLoading is false', () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      loading: true,
    });

    const { container } = renderWithProviders(
      <RequirePermission permission="view-patient-list" showLoading={false}>
        <div>Protected Content</div>
      </RequirePermission>
    );

    // Should not have loader
    expect(container.querySelector('.mantine-Loader-root')).not.toBeInTheDocument();
  });
});
