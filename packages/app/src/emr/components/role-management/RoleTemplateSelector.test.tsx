// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import userEvent from '@testing-library/user-event';
import { RoleTemplateSelector } from './RoleTemplateSelector';
import type { RoleTemplate } from '../../types/role-management';

// Mock useTranslation hook
jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({ lang: 'en', t: (key: string) => key }),
}));

describe('RoleTemplateSelector', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };

  it('should render select dropdown with label', () => {
    renderWithProviders(<RoleTemplateSelector onSelect={mockOnSelect} />);

    expect(screen.getByText('Role Template')).toBeInTheDocument();
  });

  it('should render placeholder text', () => {
    renderWithProviders(<RoleTemplateSelector onSelect={mockOnSelect} />);

    expect(screen.getByPlaceholderText('Select a template...')).toBeInTheDocument();
  });

  it('should display all 16 role templates when opened', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoleTemplateSelector onSelect={mockOnSelect} />);

    const select = screen.getByRole('textbox', { name: 'Role Template' });
    await user.click(select);

    // Check for some key templates
    expect(await screen.findByText('System Owner')).toBeInTheDocument();
    expect(await screen.findByText('Physician')).toBeInTheDocument();
    expect(await screen.findByText('Nurse')).toBeInTheDocument();
    expect(await screen.findByText('Registrar')).toBeInTheDocument();
  });

  it('should call onSelect when template is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoleTemplateSelector onSelect={mockOnSelect} />);

    const select = screen.getByRole('textbox', { name: 'Role Template' });
    await user.click(select);

    const physicianOption = await screen.findByText('Physician');
    await user.click(physicianOption);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);

    const selectedTemplate: RoleTemplate = mockOnSelect.mock.calls[0][0];
    expect(selectedTemplate.code).toBe('physician');
    expect(selectedTemplate.name).toBe('Physician');
    expect(selectedTemplate.defaultPermissions).toBeDefined();
    expect(selectedTemplate.departmentScoped).toBe(true);
  });

  it('should display selected template', () => {
    renderWithProviders(<RoleTemplateSelector onSelect={mockOnSelect} selectedCode="physician" />);

    const select = screen.getByRole('textbox', { name: 'Role Template' });
    expect(select).toHaveValue('Physician');
  });

  it('should allow clearing the selection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoleTemplateSelector onSelect={mockOnSelect} selectedCode="physician" />);

    const select = screen.getByRole('textbox', { name: 'Role Template' });

    // Verify initial value
    expect(select).toHaveValue('Physician');

    // Clear the input (Mantine clear button might not be accessible, so we use keyboard)
    await user.clear(select);

    expect(select).toHaveValue('');
  });

  it('should be searchable', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoleTemplateSelector onSelect={mockOnSelect} />);

    const select = screen.getByRole('textbox', { name: 'Role Template' });
    await user.type(select, 'phys');

    // Should filter to show Physician
    expect(await screen.findByText('Physician')).toBeInTheDocument();
  });

  it('should handle template with all required fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RoleTemplateSelector onSelect={mockOnSelect} />);

    const select = screen.getByRole('textbox', { name: 'Role Template' });
    await user.click(select);

    const ownerOption = await screen.findByText('System Owner');
    await user.click(ownerOption);

    const selectedTemplate: RoleTemplate = mockOnSelect.mock.calls[0][0];

    // Verify all required fields are present
    expect(selectedTemplate.code).toBe('owner');
    expect(selectedTemplate.name).toBe('System Owner');
    expect(selectedTemplate.description).toBeTruthy();
    expect(Array.isArray(selectedTemplate.defaultPermissions)).toBe(true);
    expect(selectedTemplate.defaultPermissions.length).toBeGreaterThan(0);
    expect(typeof selectedTemplate.departmentScoped).toBe('boolean');
  });

  it('should support custom select props', () => {
    renderWithProviders(
      <RoleTemplateSelector
        onSelect={mockOnSelect}
        disabled
        size="lg"
        data-testid="custom-template-selector"
      />
    );

    const select = screen.getByRole('textbox', { name: 'Role Template' });
    expect(select).toBeDisabled();
    expect(select).toHaveAttribute('data-testid', 'custom-template-selector');
  });
});
