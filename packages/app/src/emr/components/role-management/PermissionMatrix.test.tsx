// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { PermissionMatrix } from './PermissionMatrix';

describe('PermissionMatrix', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  it('renders 8 permission categories', () => {
    renderWithProviders(
      <PermissionMatrix selectedPermissions={[]} onTogglePermission={() => {}} />
    );

    // Check for all 8 category names (using getAllByText for categories that may appear multiple times)
    expect(screen.getAllByText(/Patient Management/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Clinical Documentation/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Laboratory/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Billing/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Administration/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Reports/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Nomenclature/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Scheduling/i).length).toBeGreaterThan(0);
  });

  it('displays total selected and total permissions in header', () => {
    renderWithProviders(
      <PermissionMatrix
        selectedPermissions={['view-patient-list', 'view-patient-demographics']}
        onTogglePermission={() => {}}
      />
    );

    // Check for permission count display (including dependencies)
    const countElements = screen.getAllByText(/2/);
    expect(countElements.length).toBeGreaterThan(0);
  });

  it('expands and collapses categories on click', async () => {
    renderWithProviders(
      <PermissionMatrix selectedPermissions={[]} onTogglePermission={() => {}} />
    );

    const patientManagementHeaders = screen.getAllByText(/Patient Management/i);
    const firstHeader = patientManagementHeaders[0];
    const parentElement = firstHeader.closest('[style*="cursor"]');

    // Initially collapsed - no checkboxes visible
    expect(screen.queryAllByRole('checkbox').length).toBe(0);

    // Click to expand
    if (parentElement) {
      fireEvent.click(parentElement);
    }

    // Wait for checkboxes to appear
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
    });
  });

  it('toggles permission on checkbox click', async () => {
    const mockToggle = jest.fn();
    renderWithProviders(
      <PermissionMatrix selectedPermissions={[]} onTogglePermission={mockToggle} />
    );

    // Expand Patient Management category
    const patientManagementHeaders = screen.getAllByText(/Patient Management/i);
    const firstHeader = patientManagementHeaders[0];
    const parentElement = firstHeader.closest('[style*="cursor"]');
    if (parentElement) {
      fireEvent.click(parentElement);
    }

    // Wait for checkboxes to appear and click one
    await waitFor(() => {
      const checkbox = screen.getByLabelText(/View Patient List/i);
      fireEvent.click(checkbox);
    });

    expect(mockToggle).toHaveBeenCalledWith('view-patient-list');
  });

  it('auto-enables dependencies when permission is selected', () => {
    renderWithProviders(
      <PermissionMatrix
        selectedPermissions={['edit-patient-demographics']}
        onTogglePermission={() => {}}
      />
    );

    // 'edit-patient-demographics' depends on 'view-patient-demographics' and 'view-patient-list'
    // The component should show inherited permissions
    // We verify this by checking the inherited permissions text
    expect(screen.getByText(/auto-enabled due to dependencies/i)).toBeInTheDocument();
  });

  it('shows dependency indicators for auto-enabled permissions', async () => {
    renderWithProviders(
      <PermissionMatrix
        selectedPermissions={['edit-patient-demographics']}
        onTogglePermission={() => {}}
      />
    );

    // Expand Patient Management
    const patientManagementHeaders = screen.getAllByText(/Patient Management/i);
    const firstHeader = patientManagementHeaders[0];
    const parentElement = firstHeader.closest('[style*="cursor"]');
    if (parentElement) {
      fireEvent.click(parentElement);
    }

    // Wait and check for 'auto-enabled' badge
    await waitFor(() => {
      expect(screen.getAllByText(/auto-enabled/i).length).toBeGreaterThan(0);
    });
  });

  it('shows dangerous badge for dangerous permissions', async () => {
    renderWithProviders(
      <PermissionMatrix
        selectedPermissions={['delete-patient']}
        onTogglePermission={() => {}}
      />
    );

    // Expand Patient Management
    const patientManagementHeaders = screen.getAllByText(/Patient Management/i);
    const firstHeader = patientManagementHeaders[0];
    const parentElement = firstHeader.closest('[style*="cursor"]');
    if (parentElement) {
      fireEvent.click(parentElement);
    }

    // Wait for checkboxes to appear, then check for dangerous badge
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
    });

    // Dangerous permissions should have a red badge
    const dangerousBadges = screen.queryAllByText(/dangerous/i);
    expect(dangerousBadges.length).toBeGreaterThan(0);
  });

  it('displays permission count badge for each category', () => {
    renderWithProviders(
      <PermissionMatrix
        selectedPermissions={['view-patient-list', 'view-encounters']}
        onTogglePermission={() => {}}
      />
    );

    // Each category should have a badge showing selected/total count
    const badges = screen.getAllByText(/\//); // Format: "1/15"
    expect(badges.length).toBeGreaterThan(0);
  });
});
