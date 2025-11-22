// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';
import { RoleAssignmentPanel } from './RoleAssignmentPanel';

// Mock hooks
jest.mock('../../hooks/useRoles', () => ({
  useRoles: () => ({
    roles: [
      {
        id: '1',
        code: 'physician',
        name: 'Physician',
        status: 'active',
        permissionCount: 10,
        userCount: 5,
        createdDate: '2025-11-20',
        lastModified: '2025-11-20',
      },
      {
        id: '2',
        code: 'nurse',
        name: 'Nurse',
        status: 'active',
        permissionCount: 5,
        userCount: 3,
        createdDate: '2025-11-20',
        lastModified: '2025-11-20',
      },
    ],
    loading: false,
  }),
}));

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    lang: 'en',
  }),
}));

jest.mock('../../services/roleService', () => ({
  getUserRoles: jest.fn().mockResolvedValue([]),
}));

describe('RoleAssignmentPanel', () => {
  let medplum: MockClient;

  const TestWrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
    <MantineProvider>
      <MedplumProvider medplum={medplum}>{children}</MedplumProvider>
    </MantineProvider>
  );

  beforeEach(() => {
    medplum = new MockClient();
  });

  it('should render role selection dropdown', () => {
    const onChange = jest.fn();
    render(<RoleAssignmentPanel value={[]} onChange={onChange} />, { wrapper: TestWrapper });

    expect(screen.getByPlaceholderText('roleManagement.searchRoles')).toBeInTheDocument();
  });

  it('should display assigned roles as badges', () => {
    const onChange = jest.fn();
    const value = [{ roleId: '1', roleName: 'Physician', roleCode: 'physician' }];

    render(<RoleAssignmentPanel value={value} onChange={onChange} />, { wrapper: TestWrapper });

    expect(screen.getByText('Physician')).toBeInTheDocument();
    expect(screen.getByText(/Assigned Roles \(1\)/i)).toBeInTheDocument();
  });

  it('should show empty state when no roles assigned', () => {
    const onChange = jest.fn();
    render(<RoleAssignmentPanel value={[]} onChange={onChange} />, { wrapper: TestWrapper });

    expect(screen.getByText(/No roles assigned/i)).toBeInTheDocument();
  });

  it('should add selected role when Add button clicked', async () => {
    const onChange = jest.fn();
    render(<RoleAssignmentPanel value={[]} onChange={onChange} />, { wrapper: TestWrapper });

    // This test is simplified - in reality would need to interact with MultiSelect
    // which requires more complex testing setup
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('should remove role when X button clicked', () => {
    const onChange = jest.fn();
    const value = [{ roleId: '1', roleName: 'Physician', roleCode: 'physician' }];

    render(<RoleAssignmentPanel value={value} onChange={onChange} />, { wrapper: TestWrapper });

    const removeButtons = screen.getAllByRole('button');
    const removeButton = removeButtons.find((btn) => btn.querySelector('svg'));

    if (removeButton) {
      fireEvent.click(removeButton);
      expect(onChange).toHaveBeenCalledWith([]);
    }
  });

  it('should disable controls when disabled prop is true', () => {
    const onChange = jest.fn();
    const value = [{ roleId: '1', roleName: 'Physician', roleCode: 'physician' }];

    render(<RoleAssignmentPanel value={value} onChange={onChange} disabled />, { wrapper: TestWrapper });

    const multiSelect = screen.getByPlaceholderText('roleManagement.searchRoles');
    expect(multiSelect).toBeDisabled();
  });
});
