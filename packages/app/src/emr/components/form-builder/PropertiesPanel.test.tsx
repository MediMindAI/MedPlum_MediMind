// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MedplumProvider } from '@medplum/react-hooks';
import { MantineProvider } from '@mantine/core';
import { MockClient } from '@medplum/mock';
import { PropertiesPanel } from './PropertiesPanel';
import type { FieldConfig } from '../../types/form-builder';

describe('PropertiesPanel', () => {
  let medplum: MockClient;

  const mockField: FieldConfig = {
    id: 'field-1',
    linkId: 'field-1',
    type: 'text',
    label: 'First Name',
    required: true,
    text: 'Enter your first name',
    order: 0,
  };

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <MantineProvider>
        <MemoryRouter>
          <MedplumProvider medplum={medplum}>{component}</MedplumProvider>
        </MemoryRouter>
      </MantineProvider>
    );
  };

  it('shows empty state when no field is selected', () => {
    const mockOnFieldUpdate = jest.fn();

    renderWithProviders(<PropertiesPanel selectedField={null} onFieldUpdate={mockOnFieldUpdate} />);

    expect(screen.getByText(/Select a field to configure/i)).toBeInTheDocument();
    expect(screen.getByText(/Click on a field in the canvas/i)).toBeInTheDocument();
  });

  it('renders panel header when field is selected', () => {
    const mockOnFieldUpdate = jest.fn();

    renderWithProviders(<PropertiesPanel selectedField={mockField} onFieldUpdate={mockOnFieldUpdate} />);

    expect(screen.getByText(/Properties/i)).toBeInTheDocument();
    expect(screen.getByText(/Configure field settings/i)).toBeInTheDocument();
  });

  it('displays field type', () => {
    const mockOnFieldUpdate = jest.fn();

    renderWithProviders(<PropertiesPanel selectedField={mockField} onFieldUpdate={mockOnFieldUpdate} />);

    expect(screen.getByText('Field Type')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('renders label input with current value', () => {
    const mockOnFieldUpdate = jest.fn();

    renderWithProviders(<PropertiesPanel selectedField={mockField} onFieldUpdate={mockOnFieldUpdate} />);

    const labelInput = screen.getByDisplayValue('First Name');
    expect(labelInput).toBeInTheDocument();
  });

  it('calls onFieldUpdate when label changes', () => {
    const mockOnFieldUpdate = jest.fn();

    renderWithProviders(<PropertiesPanel selectedField={mockField} onFieldUpdate={mockOnFieldUpdate} />);

    const labelInput = screen.getByDisplayValue('First Name');
    fireEvent.change(labelInput, { target: { value: 'Last Name' } });

    // FieldConfigEditor passes the updated field via onValuesChange
    expect(mockOnFieldUpdate).toHaveBeenCalled();
    const calledWith = mockOnFieldUpdate.mock.calls[mockOnFieldUpdate.mock.calls.length - 1][0];
    expect(calledWith.label).toBe('Last Name');
  });

  it('renders required checkbox with current value', () => {
    const mockOnFieldUpdate = jest.fn();

    renderWithProviders(<PropertiesPanel selectedField={mockField} onFieldUpdate={mockOnFieldUpdate} />);

    const requiredCheckbox = screen.getByRole('checkbox', { name: /Required Field/i });
    expect(requiredCheckbox).toBeChecked();
  });

  it('calls onFieldUpdate when required checkbox changes', () => {
    const mockOnFieldUpdate = jest.fn();

    renderWithProviders(<PropertiesPanel selectedField={mockField} onFieldUpdate={mockOnFieldUpdate} />);

    const requiredCheckbox = screen.getByRole('checkbox', { name: /Required Field/i });
    fireEvent.click(requiredCheckbox);

    // FieldConfigEditor passes the updated field via onValuesChange
    expect(mockOnFieldUpdate).toHaveBeenCalled();
    const calledWith = mockOnFieldUpdate.mock.calls[mockOnFieldUpdate.mock.calls.length - 1][0];
    expect(calledWith.required).toBe(false);
  });

  it('renders help text textarea with current value', () => {
    const mockOnFieldUpdate = jest.fn();

    renderWithProviders(<PropertiesPanel selectedField={mockField} onFieldUpdate={mockOnFieldUpdate} />);

    const helpTextArea = screen.getByDisplayValue('Enter your first name');
    expect(helpTextArea).toBeInTheDocument();
  });

  it('calls onFieldUpdate when help text changes', () => {
    const mockOnFieldUpdate = jest.fn();

    renderWithProviders(<PropertiesPanel selectedField={mockField} onFieldUpdate={mockOnFieldUpdate} />);

    const helpTextArea = screen.getByDisplayValue('Enter your first name');
    fireEvent.change(helpTextArea, { target: { value: 'Updated help text' } });

    // FieldConfigEditor passes the updated field via onValuesChange
    expect(mockOnFieldUpdate).toHaveBeenCalled();
    const calledWith = mockOnFieldUpdate.mock.calls[mockOnFieldUpdate.mock.calls.length - 1][0];
    expect(calledWith.text).toBe('Updated help text');
  });

  it('displays field ID', () => {
    const mockOnFieldUpdate = jest.fn();

    renderWithProviders(<PropertiesPanel selectedField={mockField} onFieldUpdate={mockOnFieldUpdate} />);

    expect(screen.getByText('Field ID')).toBeInTheDocument();
    expect(screen.getByText('field-1')).toBeInTheDocument();
  });

  it('shows Validation Rules accordion section', () => {
    const mockOnFieldUpdate = jest.fn();

    renderWithProviders(<PropertiesPanel selectedField={mockField} onFieldUpdate={mockOnFieldUpdate} />);

    expect(screen.getByText(/Validation Rules/i)).toBeInTheDocument();
  });

  it('shows Field Styling accordion section', () => {
    const mockOnFieldUpdate = jest.fn();

    renderWithProviders(<PropertiesPanel selectedField={mockField} onFieldUpdate={mockOnFieldUpdate} />);

    expect(screen.getByText(/Field Styling/i)).toBeInTheDocument();
  });

  it('renders all form sections with dividers', () => {
    const mockOnFieldUpdate = jest.fn();

    const { container } = renderWithProviders(
      <PropertiesPanel selectedField={mockField} onFieldUpdate={mockOnFieldUpdate} />
    );

    // Check for divider elements
    const dividers = container.querySelectorAll('[role="separator"]');
    expect(dividers.length).toBeGreaterThanOrEqual(2);
  });

  it('displays format validation select for text fields', () => {
    const mockOnFieldUpdate = jest.fn();

    renderWithProviders(<PropertiesPanel selectedField={mockField} onFieldUpdate={mockOnFieldUpdate} />);

    expect(screen.getByText(/Format Validation/i)).toBeInTheDocument();
  });

  it('handles field with empty label', () => {
    const mockOnFieldUpdate = jest.fn();
    const fieldWithoutLabel = { ...mockField, label: '' };

    renderWithProviders(<PropertiesPanel selectedField={fieldWithoutLabel} onFieldUpdate={mockOnFieldUpdate} />);

    const labelInput = screen.getByPlaceholderText(/Enter field label/i);
    expect(labelInput).toHaveValue('');
  });

  it('handles field without required flag', () => {
    const mockOnFieldUpdate = jest.fn();
    const fieldWithoutRequired = { ...mockField, required: undefined };

    renderWithProviders(<PropertiesPanel selectedField={fieldWithoutRequired} onFieldUpdate={mockOnFieldUpdate} />);

    const requiredCheckbox = screen.getByRole('checkbox', { name: /Required Field/i });
    expect(requiredCheckbox).not.toBeChecked();
  });

  it('handles field without help text', () => {
    const mockOnFieldUpdate = jest.fn();
    const fieldWithoutText = { ...mockField, text: undefined };

    renderWithProviders(<PropertiesPanel selectedField={fieldWithoutText} onFieldUpdate={mockOnFieldUpdate} />);

    const helpTextArea = screen.getByPlaceholderText(/Enter help text/i);
    expect(helpTextArea).toHaveValue('');
  });

  it('uses Mantine components for styling', () => {
    const mockOnFieldUpdate = jest.fn();

    const { container } = renderWithProviders(
      <PropertiesPanel selectedField={mockField} onFieldUpdate={mockOnFieldUpdate} />
    );

    // Check for Mantine Accordion component
    expect(container.querySelector('[data-accordion="true"]')).toBeInTheDocument();
    // Check for Mantine ScrollArea
    expect(container.querySelector('.mantine-ScrollArea-root')).toBeInTheDocument();
  });
});
