// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { SubmitDropdownButton } from './SubmitDropdownButton';

describe('SubmitDropdownButton', () => {
  const mockOnSave = jest.fn();
  const mockOnSaveAndContinue = jest.fn();
  const mockOnSaveAndNew = jest.fn();
  const mockOnSaveAndView = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
    jest.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };

  it('renders primary save button', () => {
    renderWithProviders(
      <SubmitDropdownButton
        onSave={mockOnSave}
        onSaveAndContinue={mockOnSaveAndContinue}
        onSaveAndNew={mockOnSaveAndNew}
        onSaveAndView={mockOnSaveAndView}
      />
    );

    expect(screen.getByText('შენახვა')).toBeInTheDocument(); // Georgian: Save
  });

  it('calls onSave when primary button is clicked', () => {
    renderWithProviders(
      <SubmitDropdownButton
        onSave={mockOnSave}
        onSaveAndContinue={mockOnSaveAndContinue}
        onSaveAndNew={mockOnSaveAndNew}
        onSaveAndView={mockOnSaveAndView}
      />
    );

    fireEvent.click(screen.getByText('შენახვა'));
    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });

  it('displays dropdown menu when chevron button is clicked', async () => {
    renderWithProviders(
      <SubmitDropdownButton
        onSave={mockOnSave}
        onSaveAndContinue={mockOnSaveAndContinue}
        onSaveAndNew={mockOnSaveAndNew}
        onSaveAndView={mockOnSaveAndView}
      />
    );

    // Click the dropdown button (has IconChevronDown)
    const buttons = screen.getAllByRole('button');
    const dropdownButton = buttons[1]; // Second button is the dropdown
    fireEvent.click(dropdownButton);

    await waitFor(() => {
      expect(screen.getByText('შენახვა და გაგრძელება')).toBeInTheDocument(); // Save & Continue
      expect(screen.getByText('შენახვა და ახალი')).toBeInTheDocument(); // Save & New
      expect(screen.getByText('შენახვა და ნახვა')).toBeInTheDocument(); // Save & View
    });
  });

  it('calls onSaveAndContinue when clicked', async () => {
    renderWithProviders(
      <SubmitDropdownButton
        onSave={mockOnSave}
        onSaveAndContinue={mockOnSaveAndContinue}
        onSaveAndNew={mockOnSaveAndNew}
        onSaveAndView={mockOnSaveAndView}
      />
    );

    // Open dropdown
    const buttons = screen.getAllByRole('button');
    const dropdownButton = buttons[1];
    fireEvent.click(dropdownButton);

    // Click "Save & Continue"
    await waitFor(() => {
      const saveAndContinueItem = screen.getByText('შენახვა და გაგრძელება');
      fireEvent.click(saveAndContinueItem);
    });

    expect(mockOnSaveAndContinue).toHaveBeenCalledTimes(1);
  });

  it('calls onSaveAndNew when clicked', async () => {
    renderWithProviders(
      <SubmitDropdownButton
        onSave={mockOnSave}
        onSaveAndContinue={mockOnSaveAndContinue}
        onSaveAndNew={mockOnSaveAndNew}
        onSaveAndView={mockOnSaveAndView}
      />
    );

    // Open dropdown
    const buttons = screen.getAllByRole('button');
    const dropdownButton = buttons[1];
    fireEvent.click(dropdownButton);

    // Click "Save & New"
    await waitFor(() => {
      const saveAndNewItem = screen.getByText('შენახვა და ახალი');
      fireEvent.click(saveAndNewItem);
    });

    expect(mockOnSaveAndNew).toHaveBeenCalledTimes(1);
  });

  it('calls onSaveAndView when clicked', async () => {
    renderWithProviders(
      <SubmitDropdownButton
        onSave={mockOnSave}
        onSaveAndContinue={mockOnSaveAndContinue}
        onSaveAndNew={mockOnSaveAndNew}
        onSaveAndView={mockOnSaveAndView}
      />
    );

    // Open dropdown
    const buttons = screen.getAllByRole('button');
    const dropdownButton = buttons[1];
    fireEvent.click(dropdownButton);

    // Click "Save & View"
    await waitFor(() => {
      const saveAndViewItem = screen.getByText('შენახვა და ნახვა');
      fireEvent.click(saveAndViewItem);
    });

    expect(mockOnSaveAndView).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when disabled prop is true', () => {
    renderWithProviders(
      <SubmitDropdownButton
        onSave={mockOnSave}
        onSaveAndContinue={mockOnSaveAndContinue}
        onSaveAndNew={mockOnSaveAndNew}
        onSaveAndView={mockOnSaveAndView}
        disabled={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('shows loading state on primary button', () => {
    renderWithProviders(
      <SubmitDropdownButton
        onSave={mockOnSave}
        onSaveAndContinue={mockOnSaveAndContinue}
        onSaveAndNew={mockOnSaveAndNew}
        onSaveAndView={mockOnSaveAndView}
        loading={true}
      />
    );

    // Mantine Button with loading prop shows a loader
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeInTheDocument();
    expect(buttons[1]).toBeDisabled(); // Dropdown button should be disabled
  });

  it('renders in English when language is set to en', () => {
    localStorage.setItem('emrLanguage', 'en');

    renderWithProviders(
      <SubmitDropdownButton
        onSave={mockOnSave}
        onSaveAndContinue={mockOnSaveAndContinue}
        onSaveAndNew={mockOnSaveAndNew}
        onSaveAndView={mockOnSaveAndView}
      />
    );

    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders in Russian when language is set to ru', () => {
    localStorage.setItem('emrLanguage', 'ru');

    renderWithProviders(
      <SubmitDropdownButton
        onSave={mockOnSave}
        onSaveAndContinue={mockOnSaveAndContinue}
        onSaveAndNew={mockOnSaveAndNew}
        onSaveAndView={mockOnSaveAndView}
      />
    );

    expect(screen.getByText('Сохранить')).toBeInTheDocument();
  });

  it('applies blue gradient styling to buttons', () => {
    renderWithProviders(
      <SubmitDropdownButton
        onSave={mockOnSave}
        onSaveAndContinue={mockOnSaveAndContinue}
        onSaveAndNew={mockOnSaveAndNew}
        onSaveAndView={mockOnSaveAndView}
      />
    );

    const saveButton = screen.getByText('შენახვა');
    const buttonElement = saveButton.closest('button');

    expect(buttonElement).toHaveStyle({
      background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
    });
  });
});
