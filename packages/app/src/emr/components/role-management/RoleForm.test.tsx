// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { RoleFormValues } from '../../types/role-management';
import { RoleForm } from './RoleForm';

// Mock useTranslation
jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'roleManagement.roleName': 'Role Name',
        'roleManagement.roleCode': 'Role Code',
        'roleManagement.roleDescription': 'Description',
        'roleManagement.roleStatus': 'Status',
        'roleManagement.active': 'Active',
        'roleManagement.inactive': 'Inactive',
      };
      return translations[key] || key;
    },
    lang: 'en',
  }),
}));

describe('RoleForm', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
    <MantineProvider>{children}</MantineProvider>
  );

  const FormWrapper = (): JSX.Element => {
    const form = useForm<RoleFormValues>({
      initialValues: {
        code: '',
        name: '',
        description: '',
        status: 'active',
        permissions: [],
      },
    });

    return <RoleForm form={form} hidePermissions />;
  };

  it('should render all form fields', () => {
    render(<FormWrapper />, { wrapper: TestWrapper });

    expect(screen.getByLabelText(/Role Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
  });

  it('should show required indicators', () => {
    render(<FormWrapper />, { wrapper: TestWrapper });

    const nameInput = screen.getByLabelText(/Role Name/i);
    const codeInput = screen.getByLabelText(/Role Code/i);

    expect(nameInput).toBeRequired();
    expect(codeInput).toBeRequired();
  });

  it('should display placeholder text', () => {
    render(<FormWrapper />, { wrapper: TestWrapper });

    expect(screen.getByPlaceholderText(/e.g., Physician/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g., physician/i)).toBeInTheDocument();
  });

  it('should render status dropdown with active/inactive options', () => {
    render(<FormWrapper />, { wrapper: TestWrapper });

    const statusSelect = screen.getByLabelText(/Status/i);
    expect(statusSelect).toBeInTheDocument();
  });

  it('should hide permissions section when hidePermissions is true', () => {
    render(<FormWrapper />, { wrapper: TestWrapper });

    // Permissions section should not be visible
    expect(screen.queryByText(/permissions/i)).not.toBeInTheDocument();
  });

  it('should support pre-filled values', () => {
    const PreFilledFormWrapper = (): JSX.Element => {
      const form = useForm<RoleFormValues>({
        initialValues: {
          code: 'physician',
          name: 'Physician',
          description: 'Medical doctor',
          status: 'active',
          permissions: [],
        },
      });

      return <RoleForm form={form} hidePermissions />;
    };

    render(<PreFilledFormWrapper />, { wrapper: TestWrapper });

    expect(screen.getByDisplayValue('Physician')).toBeInTheDocument();
    expect(screen.getByDisplayValue('physician')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Medical doctor')).toBeInTheDocument();
  });
});
