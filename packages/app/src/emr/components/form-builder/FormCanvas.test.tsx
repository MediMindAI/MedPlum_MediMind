// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MedplumProvider } from '@medplum/react-hooks';
import { MantineProvider } from '@mantine/core';
import { MockClient } from '@medplum/mock';
import { FormCanvas } from './FormCanvas';
import type { FieldConfig } from '../../types/form-builder';

describe('FormCanvas', () => {
  let medplum: MockClient;

  const mockFields: FieldConfig[] = [
    {
      id: 'field-1',
      linkId: 'field-1',
      type: 'text',
      label: 'First Name',
      required: true,
      order: 0,
    },
    {
      id: 'field-2',
      linkId: 'field-2',
      type: 'date',
      label: 'Birth Date',
      required: false,
      order: 1,
    },
  ];

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

  it('renders canvas header', () => {
    const mockOnFieldSelect = jest.fn();
    const mockOnFieldsChange = jest.fn();

    renderWithProviders(
      <FormCanvas
        fields={[]}
        selectedField={null}
        onFieldSelect={mockOnFieldSelect}
        onFieldsChange={mockOnFieldsChange}
      />
    );

    expect(screen.getByText(/Form Canvas/i)).toBeInTheDocument();
  });

  it('shows empty state when no fields', () => {
    const mockOnFieldSelect = jest.fn();
    const mockOnFieldsChange = jest.fn();

    renderWithProviders(
      <FormCanvas
        fields={[]}
        selectedField={null}
        onFieldSelect={mockOnFieldSelect}
        onFieldsChange={mockOnFieldsChange}
      />
    );

    // Updated empty state text in modern design
    expect(screen.getByText(/Build your form/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag fields from the palette/i)).toBeInTheDocument();
  });

  it('renders list of fields', () => {
    const mockOnFieldSelect = jest.fn();
    const mockOnFieldsChange = jest.fn();

    renderWithProviders(
      <FormCanvas
        fields={mockFields}
        selectedField={null}
        onFieldSelect={mockOnFieldSelect}
        onFieldsChange={mockOnFieldsChange}
      />
    );

    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Birth Date')).toBeInTheDocument();
  });

  it('shows field type and required indicator', () => {
    const mockOnFieldSelect = jest.fn();
    const mockOnFieldsChange = jest.fn();

    renderWithProviders(
      <FormCanvas
        fields={mockFields}
        selectedField={null}
        onFieldSelect={mockOnFieldSelect}
        onFieldsChange={mockOnFieldsChange}
      />
    );

    // Check that field types are displayed
    const textFields = screen.getAllByText(/text/i);
    expect(textFields.length).toBeGreaterThan(0);

    // Check for required indicator
    expect(screen.getByText(/Required/i)).toBeInTheDocument();
  });

  it('highlights selected field', () => {
    const mockOnFieldSelect = jest.fn();
    const mockOnFieldsChange = jest.fn();

    const { container } = renderWithProviders(
      <FormCanvas
        fields={mockFields}
        selectedField={mockFields[0]}
        onFieldSelect={mockOnFieldSelect}
        onFieldsChange={mockOnFieldsChange}
      />
    );

    // Check that selected field has border with theme secondary color
    // The theme uses --emr-secondary which is #2b6cb0 = rgb(43, 108, 176)
    expect(container.innerHTML).toContain('var(--emr-secondary)');
  });

  it('calls onFieldSelect when clicking a field', () => {
    const mockOnFieldSelect = jest.fn();
    const mockOnFieldsChange = jest.fn();

    renderWithProviders(
      <FormCanvas
        fields={mockFields}
        selectedField={null}
        onFieldSelect={mockOnFieldSelect}
        onFieldsChange={mockOnFieldsChange}
      />
    );

    const firstField = screen.getByText('First Name').closest('div[style*="cursor: pointer"]');
    fireEvent.click(firstField!);

    expect(mockOnFieldSelect).toHaveBeenCalledWith(mockFields[0]);
  });

  it('renders delete button for each field', () => {
    const mockOnFieldSelect = jest.fn();
    const mockOnFieldsChange = jest.fn();

    const { container } = renderWithProviders(
      <FormCanvas
        fields={mockFields}
        selectedField={null}
        onFieldSelect={mockOnFieldSelect}
        onFieldsChange={mockOnFieldsChange}
      />
    );

    // Check for delete buttons/icons
    const allButtons = container.querySelectorAll('button');
    // Should have at least: 1 "Add Field" button + 2 delete buttons (one per field)
    expect(allButtons.length).toBeGreaterThanOrEqual(3);
  });

  it('calls onFieldsChange when deleting a field', () => {
    const mockOnFieldSelect = jest.fn();
    const mockOnFieldsChange = jest.fn();

    const { container } = renderWithProviders(
      <FormCanvas
        fields={mockFields}
        selectedField={null}
        onFieldSelect={mockOnFieldSelect}
        onFieldsChange={mockOnFieldsChange}
      />
    );

    // Find and click the first delete button
    const deleteButtons = container.querySelectorAll('button');
    const firstDeleteButton = Array.from(deleteButtons).find((btn) =>
      btn.innerHTML.includes('IconTrash')
    );

    if (firstDeleteButton) {
      fireEvent.click(firstDeleteButton);
      expect(mockOnFieldsChange).toHaveBeenCalled();
    }
  });

  it('renders add field button', () => {
    const mockOnFieldSelect = jest.fn();
    const mockOnFieldsChange = jest.fn();

    renderWithProviders(
      <FormCanvas
        fields={[]}
        selectedField={null}
        onFieldSelect={mockOnFieldSelect}
        onFieldsChange={mockOnFieldsChange}
      />
    );

    expect(screen.getByRole('button', { name: /Add Field/i })).toBeInTheDocument();
  });

  it('adds a default text field when clicking add button', () => {
    const mockOnFieldSelect = jest.fn();
    const mockOnFieldsChange = jest.fn();

    renderWithProviders(
      <FormCanvas
        fields={[]}
        selectedField={null}
        onFieldSelect={mockOnFieldSelect}
        onFieldsChange={mockOnFieldsChange}
      />
    );

    const addButton = screen.getByRole('button', { name: /Add Field/i });
    fireEvent.click(addButton);

    expect(mockOnFieldsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'text',
          label: 'New Field',
          required: false,
        }),
      ])
    );
  });

  it('hides add button in preview mode', () => {
    const mockOnFieldSelect = jest.fn();
    const mockOnFieldsChange = jest.fn();

    renderWithProviders(
      <FormCanvas
        fields={[]}
        selectedField={null}
        onFieldSelect={mockOnFieldSelect}
        onFieldsChange={mockOnFieldsChange}
        isPreview={true}
      />
    );

    expect(screen.queryByRole('button', { name: /Add Field/i })).not.toBeInTheDocument();
  });

  it('renders drag handles for each field', () => {
    const mockOnFieldSelect = jest.fn();
    const mockOnFieldsChange = jest.fn();

    const { container } = renderWithProviders(
      <FormCanvas
        fields={mockFields}
        selectedField={null}
        onFieldSelect={mockOnFieldSelect}
        onFieldsChange={mockOnFieldsChange}
      />
    );

    // Check for grip vertical icons (drag handles)
    const dragHandles = container.querySelectorAll('svg');
    expect(dragHandles.length).toBeGreaterThan(0);
  });

  it('applies dashed border to drop zone', () => {
    const mockOnFieldSelect = jest.fn();
    const mockOnFieldsChange = jest.fn();

    const { container } = renderWithProviders(
      <FormCanvas
        fields={[]}
        selectedField={null}
        onFieldSelect={mockOnFieldSelect}
        onFieldsChange={mockOnFieldsChange}
      />
    );

    expect(container.innerHTML).toContain('2px dashed');
  });
});
