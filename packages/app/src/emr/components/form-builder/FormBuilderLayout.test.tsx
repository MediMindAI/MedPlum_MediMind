// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MedplumProvider } from '@medplum/react-hooks';
import { MantineProvider } from '@mantine/core';
import { MockClient } from '@medplum/mock';
import { FormBuilderLayout, FormBuilderLayoutProps } from './FormBuilderLayout';
import type { FieldConfig } from '../../types/form-builder';

describe('FormBuilderLayout', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  const defaultProps: FormBuilderLayoutProps = {
    fields: [],
    formTitle: 'Test Form',
    selectedFieldId: null,
    onFieldsChange: jest.fn(),
    onFieldSelect: jest.fn(),
    onFieldAdd: jest.fn(),
    onFieldUpdate: jest.fn(),
    onFieldDelete: jest.fn(),
    onFieldsReorder: jest.fn(),
  };

  const renderWithProviders = (props: Partial<FormBuilderLayoutProps> = {}) => {
    return render(
      <MantineProvider>
        <MemoryRouter>
          <MedplumProvider medplum={medplum}>
            <FormBuilderLayout {...defaultProps} {...props} />
          </MedplumProvider>
        </MemoryRouter>
      </MantineProvider>
    );
  };

  it('renders three-panel layout', () => {
    renderWithProviders();

    expect(screen.getByText(/Field Palette/i)).toBeInTheDocument();
    expect(screen.getByText(/Form Canvas/i)).toBeInTheDocument();
  });

  it('renders form title', () => {
    renderWithProviders({ formTitle: 'My Form Title' });

    expect(screen.getByText('My Form Title')).toBeInTheDocument();
  });

  it('renders preview toggle button', () => {
    renderWithProviders();

    expect(screen.getByRole('button', { name: /Preview/i })).toBeInTheDocument();
  });

  it('toggles preview mode', () => {
    renderWithProviders();

    const previewButton = screen.getByRole('button', { name: /Preview/i });
    fireEvent.click(previewButton);

    // In preview mode, button text changes to "Edit"
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
  });

  it('renders header with gray background', () => {
    const { container } = renderWithProviders();

    const header = container.querySelector('div[style*="border-bottom"]');
    expect(header).toBeTruthy();
    expect(header?.getAttribute('style')).toContain('border-bottom');
  });

  it('renders canvas in center panel', () => {
    renderWithProviders();

    expect(screen.getByText(/Drag fields here or click/i)).toBeInTheDocument();
  });

  it('hides palette in preview mode', () => {
    renderWithProviders();

    // Initially palette is visible
    expect(screen.getByText(/Field Palette/i)).toBeInTheDocument();

    // Toggle preview
    const previewButton = screen.getByRole('button', { name: /Preview/i });
    fireEvent.click(previewButton);

    // Palette should be hidden in preview mode
    expect(screen.queryByText(/Field Palette/i)).not.toBeInTheDocument();
  });

  it('uses consistent spacing and theme colors', () => {
    const { container } = renderWithProviders();

    // Check that theme CSS variables are used
    expect(container.innerHTML).toContain('var(--emr-gray-200)');
    expect(container.innerHTML).toContain('var(--emr-gray-50)');
  });

  it('shows properties panel when a field is selected', () => {
    const testField: FieldConfig = {
      id: 'field-1',
      linkId: 'field-1',
      type: 'text',
      label: 'Test Field',
      required: false,
    };

    renderWithProviders({
      fields: [testField],
      selectedFieldId: 'field-1',
    });

    expect(screen.getByText(/Properties/i)).toBeInTheDocument();
  });

  it('displays correct field count', () => {
    const testFields: FieldConfig[] = [
      { id: 'field-1', linkId: 'field-1', type: 'text', label: 'Field 1', required: false },
      { id: 'field-2', linkId: 'field-2', type: 'date', label: 'Field 2', required: true },
    ];

    renderWithProviders({ fields: testFields });

    // The field count is displayed at the bottom
    expect(screen.getByText(/Fields: 2/i)).toBeInTheDocument();
  });
});
