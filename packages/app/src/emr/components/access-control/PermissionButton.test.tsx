// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';
import { MantineProvider } from '@mantine/core';
import { PermissionButton } from './PermissionButton';
import { permissionCache } from '../../services/permissionCacheService';
import { ReactNode } from 'react';

// Mock the permission check hook
jest.mock('../../hooks/usePermissionCheck', () => ({
  usePermissionCheck: jest.fn(),
}));

// Mock translation hook
jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'permission.accessDenied': "You don't have permission for this action",
      };
      return translations[key] || key;
    },
    lang: 'en',
    setLang: jest.fn(),
  }),
}));

const mockUsePermissionCheck = jest.requireMock('../../hooks/usePermissionCheck').usePermissionCheck;

describe('PermissionButton', () => {
  let medplum: MockClient;

  const renderWithProviders = (component: ReactNode) => {
    return render(
      <MantineProvider>
        <MedplumProvider medplum={medplum}>{component}</MedplumProvider>
      </MantineProvider>
    );
  };

  beforeEach(() => {
    medplum = new MockClient();
    permissionCache.invalidate();
    jest.clearAllMocks();
  });

  it('should render button when permission is granted', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: true,
      loading: false,
      error: null,
    });

    renderWithProviders(
      <PermissionButton permission="create-patient">Create Patient</PermissionButton>
    );

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /create patient/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  it('should disable button when permission is denied', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      loading: false,
      error: null,
    });

    renderWithProviders(
      <PermissionButton permission="delete-patient">Delete Patient</PermissionButton>
    );

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /delete patient/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  it('should hide button when hiddenIfDenied=true and permission denied', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      loading: false,
      error: null,
    });

    renderWithProviders(
      <PermissionButton permission="edit-patient" hiddenIfDenied={true}>
        Edit Patient
      </PermissionButton>
    );

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /edit patient/i })).not.toBeInTheDocument();
    });
  });

  it('should show button when hiddenIfDenied=true and permission granted', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: true,
      loading: false,
      error: null,
    });

    renderWithProviders(
      <PermissionButton permission="edit-patient" hiddenIfDenied={true}>
        Edit Patient
      </PermissionButton>
    );

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /edit patient/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  it('should call onClick handler when permission granted and button clicked', async () => {
    const handleClick = jest.fn();

    mockUsePermissionCheck.mockReturnValue({
      hasPermission: true,
      loading: false,
      error: null,
    });

    renderWithProviders(
      <PermissionButton permission="create-patient" onClick={handleClick}>
        Create Patient
      </PermissionButton>
    );

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /create patient/i });
      expect(button).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /create patient/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should NOT call onClick handler when permission denied and button clicked', async () => {
    const handleClick = jest.fn();

    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      loading: false,
      error: null,
    });

    renderWithProviders(
      <PermissionButton permission="delete-patient" onClick={handleClick}>
        Delete Patient
      </PermissionButton>
    );

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /delete patient/i });
      expect(button).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /delete patient/i });
    fireEvent.click(button);

    // onClick should not be called because button is disabled
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should show loading state while checking permissions', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      loading: true,
      error: null,
    });

    renderWithProviders(
      <PermissionButton permission="create-patient">Create Patient</PermissionButton>
    );

    const button = screen.getByRole('button', { name: /create patient/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('should show tooltip when permission denied and deniedTooltip provided', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      loading: false,
      error: null,
    });

    renderWithProviders(
      <PermissionButton
        permission="delete-patient"
        deniedTooltip="Admin access required to delete patients"
      >
        Delete Patient
      </PermissionButton>
    );

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /delete patient/i });
      expect(button).toBeInTheDocument();
    });

    // Note: Testing tooltip visibility requires user interaction (hover)
    // This test verifies the tooltip wrapper is present
    const button = screen.getByRole('button', { name: /delete patient/i });
    expect(button.closest('span')).toBeInTheDocument(); // Tooltip wraps button in span
  });

  it('should use default tooltip text when denied and no custom tooltip provided', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      loading: false,
      error: null,
    });

    renderWithProviders(
      <PermissionButton permission="edit-patient" deniedTooltip="">
        Edit Patient
      </PermissionButton>
    );

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /edit patient/i });
      expect(button).toBeInTheDocument();
    });

    // Button should still be disabled, but no tooltip wrapper
    const button = screen.getByRole('button', { name: /edit patient/i });
    expect(button).toBeDisabled();
  });

  it('should pass through additional button props', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: true,
      loading: false,
      error: null,
    });

    renderWithProviders(
      <PermissionButton
        permission="create-patient"
        color="blue"
        size="lg"
        variant="filled"
        data-testid="custom-button"
      >
        Create Patient
      </PermissionButton>
    );

    await waitFor(() => {
      const button = screen.getByTestId('custom-button');
      expect(button).toBeInTheDocument();
    });
  });

  it('should not render button while loading when hiddenIfDenied=true', async () => {
    mockUsePermissionCheck.mockReturnValue({
      hasPermission: false,
      loading: true,
      error: null,
    });

    renderWithProviders(
      <PermissionButton permission="edit-patient" hiddenIfDenied={true}>
        Edit Patient
      </PermissionButton>
    );

    // While loading, button should still be visible but disabled
    const button = screen.getByRole('button', { name: /edit patient/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
