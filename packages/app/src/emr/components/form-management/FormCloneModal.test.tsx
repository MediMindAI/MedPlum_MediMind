// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import { FormCloneModal } from './FormCloneModal';

describe('FormCloneModal', () => {
  const onClose = jest.fn();
  const onConfirm = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
    onClose.mockClear();
    onConfirm.mockClear();
  });

  it('renders modal when opened', () => {
    renderWithProviders(
      <FormCloneModal
        opened={true}
        onClose={onClose}
        originalTitle="Patient Consent Form"
        onConfirm={onConfirm}
      />
    );
    expect(screen.getByTestId('clone-modal')).toBeInTheDocument();
  });

  it('does not show modal content when closed', () => {
    renderWithProviders(
      <FormCloneModal
        opened={false}
        onClose={onClose}
        originalTitle="Patient Consent Form"
        onConfirm={onConfirm}
      />
    );
    // When closed, the modal body/content should not be visible
    expect(screen.queryByTestId('clone-title-input')).not.toBeInTheDocument();
  });

  it('pre-fills title with copy suffix', () => {
    renderWithProviders(
      <FormCloneModal
        opened={true}
        onClose={onClose}
        originalTitle="Patient Consent Form"
        onConfirm={onConfirm}
      />,
      { initialLanguage: 'en' }
    );

    const input = screen.getByTestId('clone-title-input');
    expect(input).toHaveValue('Patient Consent Form (Copy)');
  });

  it('calls onConfirm with new title when confirmed', async () => {
    renderWithProviders(
      <FormCloneModal
        opened={true}
        onClose={onClose}
        originalTitle="Patient Consent Form"
        onConfirm={onConfirm}
      />
    );

    const input = screen.getByTestId('clone-title-input');
    fireEvent.change(input, { target: { value: 'New Form Title' } });

    fireEvent.click(screen.getByTestId('clone-confirm-btn'));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith('New Form Title');
    });
  });

  it('shows error when title is empty', async () => {
    renderWithProviders(
      <FormCloneModal
        opened={true}
        onClose={onClose}
        originalTitle="Patient Consent Form"
        onConfirm={onConfirm}
      />,
      { initialLanguage: 'en' }
    );

    const input = screen.getByTestId('clone-title-input');
    fireEvent.change(input, { target: { value: '' } });

    fireEvent.click(screen.getByTestId('clone-confirm-btn'));

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('shows error when title matches original', async () => {
    renderWithProviders(
      <FormCloneModal
        opened={true}
        onClose={onClose}
        originalTitle="Patient Consent Form"
        onConfirm={onConfirm}
      />,
      { initialLanguage: 'en' }
    );

    const input = screen.getByTestId('clone-title-input');
    fireEvent.change(input, { target: { value: 'Patient Consent Form' } });

    fireEvent.click(screen.getByTestId('clone-confirm-btn'));

    await waitFor(() => {
      expect(screen.getByText('Title must be different from the original')).toBeInTheDocument();
    });
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('calls onClose when cancel button is clicked', () => {
    renderWithProviders(
      <FormCloneModal
        opened={true}
        onClose={onClose}
        originalTitle="Patient Consent Form"
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByTestId('clone-cancel-btn'));
    expect(onClose).toHaveBeenCalled();
  });

  it('disables buttons when loading', () => {
    renderWithProviders(
      <FormCloneModal
        opened={true}
        onClose={onClose}
        originalTitle="Patient Consent Form"
        onConfirm={onConfirm}
        loading={true}
      />
    );

    expect(screen.getByTestId('clone-cancel-btn')).toBeDisabled();
    expect(screen.getByTestId('clone-title-input')).toBeDisabled();
  });

  it('has input that can be typed into', async () => {
    renderWithProviders(
      <FormCloneModal
        opened={true}
        onClose={onClose}
        originalTitle="Patient Consent Form"
        onConfirm={onConfirm}
      />
    );

    const input = screen.getByTestId('clone-title-input');
    fireEvent.change(input, { target: { value: 'New Form' } });

    // Verify the input value was changed
    expect(input).toHaveValue('New Form');
  });

  it('renders with Georgian translations', () => {
    renderWithProviders(
      <FormCloneModal
        opened={true}
        onClose={onClose}
        originalTitle="Patient Consent Form"
        onConfirm={onConfirm}
      />,
      { initialLanguage: 'ka' }
    );

    expect(screen.getByText('ფორმის შაბლონის კლონირება')).toBeInTheDocument();
    // Georgian copy suffix
    const input = screen.getByTestId('clone-title-input');
    expect(input).toHaveValue('Patient Consent Form (ასლი)');
  });

  it('renders with Russian translations', () => {
    renderWithProviders(
      <FormCloneModal
        opened={true}
        onClose={onClose}
        originalTitle="Patient Consent Form"
        onConfirm={onConfirm}
      />,
      { initialLanguage: 'ru' }
    );

    expect(screen.getByText('Клонирование шаблона формы')).toBeInTheDocument();
    // Russian copy suffix
    const input = screen.getByTestId('clone-title-input');
    expect(input).toHaveValue('Patient Consent Form (Копия)');
  });

  it('clears error when user starts typing', async () => {
    renderWithProviders(
      <FormCloneModal
        opened={true}
        onClose={onClose}
        originalTitle="Patient Consent Form"
        onConfirm={onConfirm}
      />,
      { initialLanguage: 'en' }
    );

    const input = screen.getByTestId('clone-title-input');

    // Trigger error
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(screen.getByTestId('clone-confirm-btn'));

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    // Start typing to clear error
    fireEvent.change(input, { target: { value: 'New' } });

    await waitFor(() => {
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
  });
});
