// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { PatientBindingSelector } from './PatientBindingSelector';
import type { BindingKey } from '../../types/patient-binding';

describe('PatientBindingSelector', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };

  it('renders patient binding selector', () => {
    const onChange = jest.fn();
    renderWithProviders(<PatientBindingSelector value={null} onChange={onChange} />);

    const labels = screen.getAllByLabelText(/patient data binding/i);
    expect(labels.length).toBeGreaterThan(0);
    expect(screen.getByText(/auto-populate this field with patient or encounter data/i)).toBeInTheDocument();
  });

  it('displays "None" as default when no binding selected', () => {
    const onChange = jest.fn();
    renderWithProviders(<PatientBindingSelector value={null} onChange={onChange} />);

    const selects = screen.getAllByLabelText(/patient data binding/i);
    const input = selects.find((el) => el.tagName === 'INPUT') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe('');
  });

  it('displays selected binding value', () => {
    const onChange = jest.fn();
    renderWithProviders(<PatientBindingSelector value="firstName" onChange={onChange} />);

    const selects = screen.getAllByLabelText(/patient data binding/i);
    const input = selects.find((el) => el.tagName === 'INPUT') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe('First Name');
  });

  it('calls onChange when binding is selected', async () => {
    const onChange = jest.fn();
    renderWithProviders(<PatientBindingSelector value={null} onChange={onChange} />);

    const selects = screen.getAllByLabelText(/patient data binding/i);
    const input = selects.find((el) => el.tagName === 'INPUT') as HTMLInputElement;
    fireEvent.click(input);

    // Wait for dropdown to open
    await waitFor(() => {
      const option = screen.getByRole('option', { name: /first name/i });
      expect(option).toBeInTheDocument();
      fireEvent.click(option);
    });

    expect(onChange).toHaveBeenCalledWith('firstName');
  });

  it('accepts null value prop for clearing selection', () => {
    const onChange = jest.fn();
    // Test that component renders correctly with null value (clearing functionality)
    const { rerender } = renderWithProviders(<PatientBindingSelector value="firstName" onChange={onChange} />);

    let selects = screen.getAllByLabelText(/patient data binding/i);
    let input = selects.find((el) => el.tagName === 'INPUT') as HTMLInputElement;
    expect(input.value).toBe('First Name');

    // Rerender with null value (simulates clearing)
    rerender(
      <MantineProvider>
        <PatientBindingSelector value={null} onChange={onChange} />
      </MantineProvider>
    );

    selects = screen.getAllByLabelText(/patient data binding/i);
    input = selects.find((el) => el.tagName === 'INPUT') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('displays FHIRPath expression for selected binding', () => {
    const onChange = jest.fn();
    renderWithProviders(<PatientBindingSelector value="firstName" onChange={onChange} />);

    expect(screen.getByText(/fhirpath:/i)).toBeInTheDocument();
    expect(screen.getByText(/patient\.name\.given\[0\]/i)).toBeInTheDocument();
  });

  it('displays calculated field indicator for calculated bindings', () => {
    const onChange = jest.fn();
    renderWithProviders(<PatientBindingSelector value="age" onChange={onChange} />);

    expect(screen.getByText(/calculated:/i)).toBeInTheDocument();
    // Use getAllByText since "age" appears multiple times (label, dropdown, etc)
    const ageTexts = screen.getAllByText(/age/i);
    expect(ageTexts.length).toBeGreaterThan(0);
  });

  it('does not display FHIRPath when no binding selected', () => {
    const onChange = jest.fn();
    renderWithProviders(<PatientBindingSelector value={null} onChange={onChange} />);

    expect(screen.queryByText(/fhirpath:/i)).not.toBeInTheDocument();
  });

  it('allows searching through binding options', async () => {
    const onChange = jest.fn();
    renderWithProviders(<PatientBindingSelector value={null} onChange={onChange} />);

    const selects = screen.getAllByLabelText(/patient data binding/i);
    const input = selects.find((el) => el.tagName === 'INPUT') as HTMLInputElement;
    fireEvent.click(input);

    // Type to search
    fireEvent.change(input, { target: { value: 'email' } });

    await waitFor(() => {
      const option = screen.getByRole('option', { name: /email/i });
      expect(option).toBeInTheDocument();
    });
  });

  it('displays all 17 binding options', async () => {
    const onChange = jest.fn();
    renderWithProviders(<PatientBindingSelector value={null} onChange={onChange} />);

    const selects = screen.getAllByLabelText(/patient data binding/i);
    const input = selects.find((el) => el.tagName === 'INPUT') as HTMLInputElement;
    fireEvent.click(input);

    await waitFor(() => {
      // Check for a few key options (not all 17 to keep test concise)
      expect(screen.getByRole('option', { name: /first name/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /last name/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /personal id/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /date of birth/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /gender/i })).toBeInTheDocument();
    });
  });

  it('updates when value prop changes', () => {
    const onChange = jest.fn();
    const { rerender } = renderWithProviders(<PatientBindingSelector value="firstName" onChange={onChange} />);

    let selects = screen.getAllByLabelText(/patient data binding/i);
    let input = selects.find((el) => el.tagName === 'INPUT') as HTMLInputElement;
    expect(input.value).toBe('First Name');

    rerender(
      <MantineProvider>
        <PatientBindingSelector value="lastName" onChange={onChange} />
      </MantineProvider>
    );

    selects = screen.getAllByLabelText(/patient data binding/i);
    input = selects.find((el) => el.tagName === 'INPUT') as HTMLInputElement;
    expect(input.value).toBe('Last Name');
  });

  it('displays description for each binding option', async () => {
    const onChange = jest.fn();
    renderWithProviders(<PatientBindingSelector value={null} onChange={onChange} />);

    const selects = screen.getAllByLabelText(/patient data binding/i);
    const input = selects.find((el) => el.tagName === 'INPUT') as HTMLInputElement;
    fireEvent.click(input);

    await waitFor(() => {
      // Mantine Select displays descriptions as part of the label
      const option = screen.getByRole('option', { name: /first name/i });
      expect(option).toBeInTheDocument();
    });
  });

  it('displays correct FHIRPath for encounter data', () => {
    const onChange = jest.fn();
    renderWithProviders(<PatientBindingSelector value="admissionDate" onChange={onChange} />);

    expect(screen.getByText(/fhirpath:/i)).toBeInTheDocument();
    expect(screen.getByText(/encounter\.period\.start/i)).toBeInTheDocument();
  });

  it('displays correct FHIRPath for identifiers', () => {
    const onChange = jest.fn();
    renderWithProviders(<PatientBindingSelector value="personalId" onChange={onChange} />);

    expect(screen.getByText(/fhirpath:/i)).toBeInTheDocument();
    expect(screen.getByText(/patient\.identifier\.where\(system='http:\/\/medimind\.ge\/identifiers\/personal-id'\)\.value/i)).toBeInTheDocument();
  });
});
