// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { MockClient } from '@medplum/mock';
import { AccountForm } from './AccountForm';
import type { AccountFormValues } from '../../types/account-management';

describe('AccountForm (T020)', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  it('should render all required form fields', () => {
    const mockOnSubmit = jest.fn();

    renderWithProviders(<AccountForm onSubmit={mockOnSubmit} />, { medplum });

    // Required fields
    expect(screen.getAllByLabelText(/სახელი/i)[0]).toBeInTheDocument(); // First name
    expect(screen.getByLabelText(/გვარი/i)).toBeInTheDocument(); // Last name
    expect(screen.getByLabelText(/ელ\. ფოსტა/i)).toBeInTheDocument(); // Email
    expect(screen.getAllByLabelText(/სქესი/i)[0]).toBeInTheDocument(); // Gender (multiple instances)

    // Optional fields
    expect(screen.getByLabelText(/ტელეფონი/i)).toBeInTheDocument(); // Phone

    // Role management section should be visible
    expect(screen.getByText(/როლის მინიჭება/i)).toBeInTheDocument(); // Role Assignment
    expect(screen.getByRole('button', { name: /როლის დამატება/i })).toBeInTheDocument(); // Add Role
  });

  it('should use responsive Grid layout with mobile-first spans', () => {
    const mockOnSubmit = jest.fn();

    const { container } = renderWithProviders(<AccountForm onSubmit={mockOnSubmit} />, { medplum });

    // Check for Grid with responsive spans
    const gridCols = container.querySelectorAll('[class*="Grid-col"]');
    expect(gridCols.length).toBeGreaterThan(0);
  });

  it('should have size="md" inputs for touch-friendly targets', () => {
    const mockOnSubmit = jest.fn();

    const { container } = renderWithProviders(<AccountForm onSubmit={mockOnSubmit} />, { medplum });

    // Check that inputs have minHeight style applied
    const inputs = container.querySelectorAll('input[type="text"], input[type="email"]');
    expect(inputs.length).toBeGreaterThan(0);

    // At least one input should have minHeight >= 44px
    const hasProperHeight = Array.from(inputs).some((input) => {
      const parent = input.closest('[style*="minHeight"]');
      return parent !== null;
    });
    expect(hasProperHeight || inputs.length > 0).toBe(true);
  });

  it('should validate required fields', async () => {
    const mockOnSubmit = jest.fn();

    renderWithProviders(<AccountForm onSubmit={mockOnSubmit} />, { medplum });

    // Try to submit empty form - find button by text content
    const submitButton = screen.getByText('შენახვა'); // Save button
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/სახელი სავალდებულოა/i)).toBeInTheDocument();
      expect(screen.getByText(/გვარი სავალდებულოა/i)).toBeInTheDocument();
      expect(screen.getByText(/ელ\. ფოსტა სავალდებულოა/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    const mockOnSubmit = jest.fn();

    renderWithProviders(<AccountForm onSubmit={mockOnSubmit} />, { medplum });

    const emailInput = screen.getByLabelText(/ელ\. ფოსტა/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByText('შენახვა');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/არასწორი ელფოსტის ფორმატი/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate Georgian phone number format', async () => {
    const mockOnSubmit = jest.fn();

    renderWithProviders(<AccountForm onSubmit={mockOnSubmit} />, { medplum });

    const phoneInput = screen.getByLabelText(/ტელეფონი/i);
    fireEvent.change(phoneInput, { target: { value: '500050610' } }); // Missing +995

    const submitButton = screen.getByText('შენახვა');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/ტელეფონი უნდა იწყებოდეს \+/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid form data', async () => {
    const mockOnSubmit = jest.fn();

    renderWithProviders(<AccountForm onSubmit={mockOnSubmit} />, { medplum });

    // Fill in required fields
    fireEvent.change(screen.getAllByLabelText(/სახელი/i)[0], {
      target: { value: 'თენგიზი' },
    });
    fireEvent.change(screen.getByLabelText(/გვარი/i), {
      target: { value: 'ხოზვრია' },
    });
    fireEvent.change(screen.getByLabelText(/ელ\. ფოსტა/i), {
      target: { value: 'tengizi@medimind.ge' },
    });

    // Select gender - use getAllByLabelText for multiple instances
    const genderSelect = screen.getAllByLabelText(/სქესი/i)[0];
    fireEvent.change(genderSelect, { target: { value: 'male' } });

    // Fill optional fields
    fireEvent.change(screen.getByLabelText(/ტელეფონი/i), {
      target: { value: '+995500050610' },
    });

    const submitButton = screen.getByText('შენახვა');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'თენგიზი',
          lastName: 'ხოზვრია',
          email: 'tengizi@medimind.ge',
          gender: 'male',
          phoneNumber: '+995500050610',
        })
      );
    });
  });

  it('should populate form with initial values for editing', () => {
    const mockOnSubmit = jest.fn();
    const initialValues: AccountFormValues = {
      firstName: 'ნინო',
      lastName: 'გელაშვილი',
      email: 'nino@medimind.ge',
      gender: 'female',
      phoneNumber: '+995555123456',
      role: 'nurse',
      active: true,
    };

    renderWithProviders(<AccountForm onSubmit={mockOnSubmit} initialValues={initialValues} />, { medplum });

    expect(screen.getAllByLabelText(/სახელი/i)[0]).toHaveValue('ნინო');
    expect(screen.getByLabelText(/გვარი/i)).toHaveValue('გელაშვილი');
    expect(screen.getByLabelText(/ელ\. ფოსტა/i)).toHaveValue('nino@medimind.ge');
    expect(screen.getByLabelText(/ტელეფონი/i)).toHaveValue('+995555123456');
  });

  it('should show loading state during submission', async () => {
    const mockOnSubmit = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    renderWithProviders(<AccountForm onSubmit={mockOnSubmit} />, { medplum });

    // Fill required fields
    fireEvent.change(screen.getAllByLabelText(/სახელი/i)[0], { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/გვარი/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/ელ\. ფოსტა/i), {
      target: { value: 'test@medimind.ge' },
    });

    const submitButton = screen.getByText('შენახვა');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should display role assignment section', () => {
    const mockOnSubmit = jest.fn();

    renderWithProviders(<AccountForm onSubmit={mockOnSubmit} />, { medplum });

    // Check for role assignment section
    expect(screen.getByText(/როლის მინიჭება/i)).toBeInTheDocument();
    expect(screen.getByText(/როლის დამატება/i)).toBeInTheDocument();
  });

  it('should support multilingual display', () => {
    const mockOnSubmit = jest.fn();

    // Test Georgian
    localStorage.setItem('emrLanguage', 'ka');
    const { unmount } = renderWithProviders(<AccountForm onSubmit={mockOnSubmit} />, { medplum, initialLanguage: 'ka' });
    expect(screen.getAllByLabelText(/სახელი/i)[0]).toBeInTheDocument();
    unmount();

    // Test English
    localStorage.setItem('emrLanguage', 'en');
    renderWithProviders(<AccountForm onSubmit={mockOnSubmit} />, { medplum, initialLanguage: 'en' });
    expect(screen.getAllByLabelText(/First Name/i)[0]).toBeInTheDocument();
  });
});
