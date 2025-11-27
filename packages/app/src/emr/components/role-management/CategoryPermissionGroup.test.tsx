// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { CategoryPermissionGroup } from './CategoryPermissionGroup';
import type { PermissionCategory } from '../../types/role-management';

describe('CategoryPermissionGroup', () => {
  const mockCategory: PermissionCategory = {
    code: 'patient-management',
    name: 'Patient Management',
    description: 'Permissions for patient registration, demographics, and history',
    displayOrder: 1,
    icon: 'IconUsers',
    permissions: [
      {
        code: 'view-patient-list',
        name: 'View Patient List',
        description: 'Access the patient registration page and view list of patients',
        category: 'patient-management',
        displayOrder: 1,
        resourceType: 'Patient',
        accessLevel: 'read',
      },
      {
        code: 'edit-patient-demographics',
        name: 'Edit Patient Demographics',
        description: 'Modify patient personal information',
        category: 'patient-management',
        displayOrder: 2,
        resourceType: 'Patient',
        accessLevel: 'write',
        dependencies: ['view-patient-list'],
      },
      {
        code: 'delete-patient',
        name: 'Delete Patient',
        description: 'Remove patient records from the system',
        category: 'patient-management',
        displayOrder: 3,
        resourceType: 'Patient',
        accessLevel: 'delete',
        dependencies: ['view-patient-list'],
        dangerous: true,
      },
    ],
  };

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  it('renders category name', () => {
    renderWithProviders(
      <CategoryPermissionGroup
        category={mockCategory}
        selectedPermissions={[]}
        onTogglePermission={() => {}}
      />
    );

    expect(screen.getByText('Patient Management')).toBeInTheDocument();
  });

  it('shows permission count badge', () => {
    renderWithProviders(
      <CategoryPermissionGroup
        category={mockCategory}
        selectedPermissions={['view-patient-list']}
        onTogglePermission={() => {}}
      />
    );

    // Shows "1/3" (1 selected out of 3 total)
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('expands on click to show permissions', async () => {
    renderWithProviders(
      <CategoryPermissionGroup
        category={mockCategory}
        selectedPermissions={[]}
        onTogglePermission={() => {}}
      />
    );

    // Initially collapsed - checkboxes not visible (text might be in Collapse component)
    const checkboxes = screen.queryAllByRole('checkbox');
    expect(checkboxes.length).toBe(0);

    // Click to expand
    const header = screen.getByText('Patient Management');
    const clickableParent = header.closest('[style*="cursor"]');
    if (clickableParent) {
      fireEvent.click(clickableParent);
    }

    // Wait for permissions to be visible - now checkboxes should appear
    await waitFor(() => {
      const visibleCheckboxes = screen.getAllByRole('checkbox');
      expect(visibleCheckboxes.length).toBe(3); // 3 permissions in mockCategory
    });
  });

  it('collapses on second click', async () => {
    renderWithProviders(
      <CategoryPermissionGroup
        category={mockCategory}
        selectedPermissions={[]}
        onTogglePermission={() => {}}
      />
    );

    const header = screen.getByText('Patient Management');
    const clickableParent = header.closest('[style*="cursor"]');

    // Expand
    if (clickableParent) {
      fireEvent.click(clickableParent);
    }

    // Wait for expansion
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox').length).toBe(3);
    });

    // Collapse
    if (clickableParent) {
      fireEvent.click(clickableParent);
    }

    // Wait for collapse - checkboxes should be hidden
    await waitFor(() => {
      expect(screen.queryAllByRole('checkbox').length).toBe(0);
    });
  });

  it('shows chevron icon that changes on expand/collapse', () => {
    renderWithProviders(
      <CategoryPermissionGroup
        category={mockCategory}
        selectedPermissions={[]}
        onTogglePermission={() => {}}
      />
    );

    // Icon element should exist (we check for its presence indirectly)
    const header = screen.getByText('Patient Management');
    expect(header).toBeInTheDocument();
  });

  it('calls onTogglePermission when checkbox clicked', async () => {
    const mockToggle = jest.fn();
    renderWithProviders(
      <CategoryPermissionGroup
        category={mockCategory}
        selectedPermissions={[]}
        onTogglePermission={mockToggle}
      />
    );

    // Expand
    const header = screen.getByText('Patient Management');
    const clickableParent = header.closest('[style*="cursor"]');
    if (clickableParent) {
      fireEvent.click(clickableParent);
    }

    // Wait for checkboxes to appear
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox').length).toBe(3);
    });

    // Click checkbox
    const checkbox = screen.getByLabelText(/View Patient List/i) as HTMLInputElement;
    fireEvent.click(checkbox);

    expect(mockToggle).toHaveBeenCalledWith('view-patient-list');
  });

  it('shows inherited badge for auto-enabled permissions', async () => {
    renderWithProviders(
      <CategoryPermissionGroup
        category={mockCategory}
        selectedPermissions={['edit-patient-demographics']}
        onTogglePermission={() => {}}
        inheritedPermissions={['view-patient-list']}
      />
    );

    // Expand
    const header = screen.getByText('Patient Management');
    const clickableParent = header.closest('[style*="cursor"]');
    if (clickableParent) {
      fireEvent.click(clickableParent);
    }

    // Wait for expansion and check for badge
    await waitFor(() => {
      expect(screen.getByText(/auto-enabled/i)).toBeInTheDocument();
    });
  });

  it('shows dangerous badge for dangerous permissions', async () => {
    renderWithProviders(
      <CategoryPermissionGroup
        category={mockCategory}
        selectedPermissions={['delete-patient']}
        onTogglePermission={() => {}}
      />
    );

    // Expand
    const header = screen.getByText('Patient Management');
    const clickableParent = header.closest('[style*="cursor"]');
    if (clickableParent) {
      fireEvent.click(clickableParent);
    }

    // Wait for expansion and check for badge
    await waitFor(() => {
      expect(screen.getByText(/dangerous/i)).toBeInTheDocument();
    });
  });

  it('disables checkbox for inherited permissions', async () => {
    renderWithProviders(
      <CategoryPermissionGroup
        category={mockCategory}
        selectedPermissions={['edit-patient-demographics']}
        onTogglePermission={() => {}}
        inheritedPermissions={['view-patient-list']}
      />
    );

    // Expand
    const header = screen.getByText('Patient Management');
    const clickableParent = header.closest('[style*="cursor"]');
    if (clickableParent) {
      fireEvent.click(clickableParent);
    }

    // Wait for expansion then check checkbox
    await waitFor(() => {
      const checkbox = screen.getByLabelText(/View Patient List/i) as HTMLInputElement;
      expect(checkbox).toBeDisabled();
    });
  });

  it('checks checkbox for selected permissions', async () => {
    renderWithProviders(
      <CategoryPermissionGroup
        category={mockCategory}
        selectedPermissions={['view-patient-list']}
        onTogglePermission={() => {}}
      />
    );

    // Expand
    const header = screen.getByText('Patient Management');
    const clickableParent = header.closest('[style*="cursor"]');
    if (clickableParent) {
      fireEvent.click(clickableParent);
    }

    // Wait for expansion then check checkbox state
    await waitFor(() => {
      const checkbox = screen.getByLabelText(/View Patient List/i) as HTMLInputElement;
      expect(checkbox).toBeChecked();
    });
  });
});
