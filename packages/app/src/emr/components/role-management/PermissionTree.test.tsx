// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { PermissionTree } from './PermissionTree';

// Mock usePermissions hook
jest.mock('../../hooks/usePermissions', () => ({
  usePermissions: () => ({
    categories: [
      {
        code: 'patient-management',
        name: 'Patient Management',
        description: 'Patient-related permissions',
        displayOrder: 1,
        permissions: [
          {
            code: 'view-patient-list',
            name: 'View Patient List',
            description: 'View list of patients',
            category: 'patient-management',
            accessLevel: 'read',
          },
          {
            code: 'view-patient-demographics',
            name: 'View Patient Demographics',
            description: 'View patient details',
            category: 'patient-management',
            accessLevel: 'read',
          },
          {
            code: 'edit-patient-demographics',
            name: 'Edit Patient Demographics',
            description: 'Edit patient details',
            category: 'patient-management',
            accessLevel: 'write',
            dependencies: ['view-patient-demographics'],
          },
        ],
      },
      {
        code: 'administration',
        name: 'Administration',
        description: 'Admin permissions',
        displayOrder: 2,
        permissions: [
          {
            code: 'view-roles',
            name: 'View Roles',
            description: 'View role list',
            category: 'administration',
            accessLevel: 'read',
          },
        ],
      },
    ],
    loading: false,
  }),
}));

describe('PermissionTree', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
    <MantineProvider>{children}</MantineProvider>
  );

  it('should render all permission categories', async () => {
    const onChange = jest.fn();
    render(<PermissionTree selectedPermissions={[]} onChange={onChange} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('Patient Management')).toBeInTheDocument();
      expect(screen.getByText('Administration')).toBeInTheDocument();
    });
  });

  it('should show permission count for each category', async () => {
    const onChange = jest.fn();
    render(<PermissionTree selectedPermissions={[]} onChange={onChange} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('(3 permissions)')).toBeInTheDocument();
      expect(screen.getByText('(1 permissions)')).toBeInTheDocument();
    });
  });

  it('should expand/collapse categories', async () => {
    const onChange = jest.fn();
    render(<PermissionTree selectedPermissions={[]} onChange={onChange} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByText('View Patient List')).toBeInTheDocument();
    });

    // Find collapse button for Patient Management
    const collapseButtons = screen.getAllByLabelText('Collapse');
    fireEvent.click(collapseButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('View Patient List')).not.toBeVisible();
    });
  });

  it('should select individual permission', async () => {
    const onChange = jest.fn();
    render(<PermissionTree selectedPermissions={[]} onChange={onChange} />, { wrapper: TestWrapper });

    await waitFor(() => {
      const checkbox = screen.getByLabelText(/View Patient List/i);
      fireEvent.click(checkbox);
    });

    expect(onChange).toHaveBeenCalledWith(['view-patient-list']);
  });

  it('should auto-enable dependencies when permission selected', async () => {
    const onChange = jest.fn();
    render(<PermissionTree selectedPermissions={[]} onChange={onChange} />, { wrapper: TestWrapper });

    await waitFor(() => {
      const checkbox = screen.getByLabelText(/Edit Patient Demographics/i);
      fireEvent.click(checkbox);
    });

    // Should include both the selected permission and its dependency
    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining(['edit-patient-demographics', 'view-patient-demographics'])
    );
  });

  it('should select all category permissions', async () => {
    const onChange = jest.fn();
    render(<PermissionTree selectedPermissions={[]} onChange={onChange} />, { wrapper: TestWrapper });

    await waitFor(() => {
      const categoryCheckbox = screen.getAllByRole('checkbox')[0]; // First checkbox is category
      fireEvent.click(categoryCheckbox);
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining(['view-patient-list', 'view-patient-demographics', 'edit-patient-demographics'])
    );
  });

  it('should show indeterminate state when some permissions selected', () => {
    const onChange = jest.fn();
    render(<PermissionTree selectedPermissions={['view-patient-list']} onChange={onChange} />, {
      wrapper: TestWrapper,
    });

    const categoryCheckbox = screen.getAllByRole('checkbox')[0];
    expect(categoryCheckbox).toHaveProperty('indeterminate', true);
  });

  it('should disable all checkboxes when disabled prop is true', () => {
    const onChange = jest.fn();
    render(<PermissionTree selectedPermissions={[]} onChange={onChange} disabled />, { wrapper: TestWrapper });

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });
});
