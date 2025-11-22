// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import type { RoleRow } from '../../types/role-management';
import { RoleTable } from './RoleTable';

// Mock useTranslation
jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'roleManagement.roleName': 'Name',
        'roleManagement.roleDescription': 'Description',
        'roleManagement.userCount': '# Users',
        'roleManagement.permissionCount': 'Permissions',
        'roleManagement.roleStatus': 'Status',
        'roleManagement.createdDate': 'Created',
        'roleManagement.lastModified': 'Modified',
        'roleManagement.actions': 'Actions',
      };
      return translations[key] || key;
    },
    lang: 'en',
  }),
}));

describe('RoleTable', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
    <MantineProvider>{children}</MantineProvider>
  );

  const mockRoles: RoleRow[] = [
    {
      id: '1',
      code: 'physician',
      name: 'Physician',
      description: 'Medical doctor with full patient access',
      status: 'active',
      permissionCount: 15,
      userCount: 5,
      createdDate: '2025-11-20T10:00:00Z',
      lastModified: '2025-11-20T10:00:00Z',
    },
    {
      id: '2',
      code: 'nurse',
      name: 'Nurse',
      description: 'Registered nurse',
      status: 'inactive',
      permissionCount: 8,
      userCount: 3,
      createdDate: '2025-11-19T09:00:00Z',
      lastModified: '2025-11-19T09:00:00Z',
    },
  ];

  it('should render all 8 column headers', () => {
    render(<RoleTable roles={mockRoles} />, { wrapper: TestWrapper });

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('# Users')).toBeInTheDocument();
    expect(screen.getByText('Permissions')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Modified')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should display role data in rows', () => {
    render(<RoleTable roles={mockRoles} />, { wrapper: TestWrapper });

    expect(screen.getByText('Physician')).toBeInTheDocument();
    expect(screen.getByText('physician')).toBeInTheDocument();
    expect(screen.getByText('Medical doctor with full patient access')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('should show empty state when no roles', () => {
    render(<RoleTable roles={[]} />, { wrapper: TestWrapper });

    expect(screen.getByText(/No roles found/i)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(<RoleTable roles={[]} loading />, { wrapper: TestWrapper });

    expect(screen.getByText(/Loading roles/i)).toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    render(<RoleTable roles={mockRoles} onEdit={onEdit} />, { wrapper: TestWrapper });

    const editButtons = screen.getAllByLabelText('Edit role');
    fireEvent.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledWith(mockRoles[0]);
  });

  it('should call onDelete when delete button clicked', () => {
    const onDelete = jest.fn();
    render(<RoleTable roles={mockRoles} onDelete={onDelete} />, { wrapper: TestWrapper });

    const deleteButtons = screen.getAllByLabelText('Delete role');
    fireEvent.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith(mockRoles[0]);
  });
});
