// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { WelcomeMessageEditor } from './WelcomeMessageEditor';

describe('WelcomeMessageEditor (T082-T086)', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component with title', () => {
      renderWithProviders(<WelcomeMessageEditor {...defaultProps} />, { initialLanguage: 'en' });

      expect(screen.getByText('Welcome Message')).toBeInTheDocument();
    });

    it('should render textarea for custom message', () => {
      renderWithProviders(<WelcomeMessageEditor {...defaultProps} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should display provided value in textarea', () => {
      const customMessage = 'Welcome to our clinic!';
      renderWithProviders(<WelcomeMessageEditor {...defaultProps} value={customMessage} />);

      expect(screen.getByRole('textbox')).toHaveValue(customMessage);
    });

    it('should show default placeholder when value is empty', () => {
      renderWithProviders(<WelcomeMessageEditor {...defaultProps} value="" />, { initialLanguage: 'en' });

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder');
    });
  });

  describe('Placeholder list display', () => {
    it('should display available placeholders list', () => {
      renderWithProviders(<WelcomeMessageEditor {...defaultProps} />, { initialLanguage: 'en' });

      expect(screen.getByText(/Variables:/i)).toBeInTheDocument();
      expect(screen.getByText(/{firstName}/)).toBeInTheDocument();
      expect(screen.getByText(/{lastName}/)).toBeInTheDocument();
      expect(screen.getByText(/{role}/)).toBeInTheDocument();
      expect(screen.getByText(/{adminName}/)).toBeInTheDocument();
    });

    it('should display Georgian placeholder text', () => {
      renderWithProviders(<WelcomeMessageEditor {...defaultProps} />, { initialLanguage: 'ka' });

      expect(screen.getByText(/ცვლადები:/i)).toBeInTheDocument();
    });

    it('should display Russian placeholder text', () => {
      renderWithProviders(<WelcomeMessageEditor {...defaultProps} />, { initialLanguage: 'ru' });

      expect(screen.getByText(/Переменные:/i)).toBeInTheDocument();
    });
  });

  describe('Preview section', () => {
    it('should display preview section', () => {
      renderWithProviders(<WelcomeMessageEditor {...defaultProps} />, { initialLanguage: 'en' });

      expect(screen.getByText(/Preview/i)).toBeInTheDocument();
    });

    it('should substitute {firstName} in preview', () => {
      renderWithProviders(
        <WelcomeMessageEditor {...defaultProps} value="Hello {firstName}!" />,
        { initialLanguage: 'en' }
      );

      // Preview section should show the substituted value
      expect(screen.getByText(/Hello John!/)).toBeInTheDocument();
    });

    it('should substitute {lastName} in preview', () => {
      renderWithProviders(
        <WelcomeMessageEditor {...defaultProps} value="Welcome {lastName}" />,
        { initialLanguage: 'en' }
      );

      expect(screen.getByText(/Welcome Doe/)).toBeInTheDocument();
    });

    it('should substitute {role} in preview', () => {
      renderWithProviders(
        <WelcomeMessageEditor {...defaultProps} value="Your role is {role}" />,
        { initialLanguage: 'en' }
      );

      expect(screen.getByText(/Your role is Physician/)).toBeInTheDocument();
    });

    it('should substitute {adminName} in preview', () => {
      renderWithProviders(
        <WelcomeMessageEditor {...defaultProps} value="Contact {adminName}" />,
        { initialLanguage: 'en' }
      );

      expect(screen.getByText(/Contact Admin/)).toBeInTheDocument();
    });

    it('should substitute multiple placeholders', () => {
      renderWithProviders(
        <WelcomeMessageEditor {...defaultProps} value="Hello {firstName} {lastName}!" />,
        { initialLanguage: 'en' }
      );

      expect(screen.getByText(/Hello John Doe!/)).toBeInTheDocument();
    });
  });

  describe('onChange handler', () => {
    it('should call onChange when textarea value changes', () => {
      const onChange = jest.fn();
      renderWithProviders(<WelcomeMessageEditor {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'New message' } });

      expect(onChange).toHaveBeenCalledWith('New message');
    });

    it('should call onChange with empty string when cleared', () => {
      const onChange = jest.fn();
      renderWithProviders(
        <WelcomeMessageEditor {...defaultProps} value="Some text" onChange={onChange} />
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '' } });

      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('Reset to default', () => {
    it('should display reset button', () => {
      renderWithProviders(<WelcomeMessageEditor {...defaultProps} />, { initialLanguage: 'en' });

      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
    });

    it('should call onChange with default template when reset is clicked', () => {
      const onChange = jest.fn();
      renderWithProviders(
        <WelcomeMessageEditor {...defaultProps} value="Custom message" onChange={onChange} />,
        { initialLanguage: 'en' }
      );

      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);

      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('Character count', () => {
    it('should display character count', () => {
      renderWithProviders(
        <WelcomeMessageEditor {...defaultProps} value="Hello" />,
        { initialLanguage: 'en' }
      );

      expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    it('should update character count when text changes', () => {
      const { rerender } = renderWithProviders(
        <WelcomeMessageEditor {...defaultProps} value="Hi" />,
        { initialLanguage: 'en' }
      );

      expect(screen.getByText(/2/)).toBeInTheDocument();

      rerender(<WelcomeMessageEditor {...defaultProps} value="Hello World" />);

      expect(screen.getByText(/11/)).toBeInTheDocument();
    });

    it('should show 0 for empty value', () => {
      renderWithProviders(
        <WelcomeMessageEditor {...defaultProps} value="" />,
        { initialLanguage: 'en' }
      );

      expect(screen.getByText(/0/)).toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('should disable textarea when disabled prop is true', () => {
      renderWithProviders(<WelcomeMessageEditor {...defaultProps} disabled />);

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should disable reset button when disabled prop is true', () => {
      renderWithProviders(<WelcomeMessageEditor {...defaultProps} disabled />);

      expect(screen.getByRole('button', { name: /reset/i })).toBeDisabled();
    });

    it('should not be disabled by default', () => {
      renderWithProviders(<WelcomeMessageEditor {...defaultProps} />);

      expect(screen.getByRole('textbox')).not.toBeDisabled();
    });
  });

  describe('Translations', () => {
    it('should display Georgian translations', () => {
      renderWithProviders(<WelcomeMessageEditor {...defaultProps} />, { initialLanguage: 'ka' });

      expect(screen.getByText('მისასალმებელი შეტყობინება')).toBeInTheDocument();
    });

    it('should display English translations', () => {
      renderWithProviders(<WelcomeMessageEditor {...defaultProps} />, { initialLanguage: 'en' });

      expect(screen.getByText('Welcome Message')).toBeInTheDocument();
    });

    it('should display Russian translations', () => {
      renderWithProviders(<WelcomeMessageEditor {...defaultProps} />, { initialLanguage: 'ru' });

      expect(screen.getByText('Приветственное сообщение')).toBeInTheDocument();
    });
  });
});
