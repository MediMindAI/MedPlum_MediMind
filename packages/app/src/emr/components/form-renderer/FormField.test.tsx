// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import type { QuestionnaireItem } from '@medplum/fhirtypes';
import { FormField } from './FormField';

// Mock react-signature-canvas
jest.mock('react-signature-canvas', () => {
  return jest.fn().mockImplementation(() => null);
});

describe('FormField', () => {
  let medplum: MockClient;

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <MantineProvider>
        <MemoryRouter>
          <MedplumProvider medplum={medplum}>{ui}</MedplumProvider>
        </MemoryRouter>
      </MantineProvider>
    );
  };

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  describe('Text field (string type)', () => {
    it('renders text input for string type', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'string',
        text: 'Test Field',
      };

      renderWithProviders(
        <FormField item={item} value="" onChange={jest.fn()} />
      );

      expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
    });

    it('calls onChange when text is entered', () => {
      const onChange = jest.fn();
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'string',
        text: 'Test Field',
      };

      renderWithProviders(
        <FormField item={item} value="" onChange={onChange} />
      );

      fireEvent.change(screen.getByLabelText('Test Field'), {
        target: { value: 'Hello' },
      });

      expect(onChange).toHaveBeenCalledWith('Hello');
    });

    it('displays required indicator when required', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'string',
        text: 'Test Field',
        required: true,
      };

      renderWithProviders(
        <FormField item={item} value="" onChange={jest.fn()} />
      );

      // Mantine uses required attribute on the input
      expect(screen.getByRole('textbox')).toHaveAttribute('required');
    });

    it('is disabled when readOnly is true', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'string',
        text: 'Test Field',
      };

      renderWithProviders(
        <FormField item={item} value="" onChange={jest.fn()} readOnly />
      );

      expect(screen.getByLabelText('Test Field')).toBeDisabled();
    });
  });

  describe('Textarea field (text type)', () => {
    it('renders textarea for text type', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'text',
        text: 'Long Text Field',
      };

      renderWithProviders(
        <FormField item={item} value="" onChange={jest.fn()} />
      );

      const textarea = screen.getByLabelText('Long Text Field');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('handles multiline text input', () => {
      const onChange = jest.fn();
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'text',
        text: 'Long Text Field',
      };

      renderWithProviders(
        <FormField item={item} value="" onChange={onChange} />
      );

      fireEvent.change(screen.getByLabelText('Long Text Field'), {
        target: { value: 'Line 1\nLine 2\nLine 3' },
      });

      expect(onChange).toHaveBeenCalledWith('Line 1\nLine 2\nLine 3');
    });
  });

  describe('Integer field', () => {
    it('renders number input for integer type', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'integer',
        text: 'Age',
      };

      renderWithProviders(
        <FormField item={item} value={undefined} onChange={jest.fn()} />
      );

      const input = screen.getByLabelText('Age');
      expect(input).toHaveAttribute('inputmode', 'numeric');
    });

    it('calls onChange with number value', () => {
      const onChange = jest.fn();
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'integer',
        text: 'Age',
      };

      renderWithProviders(
        <FormField item={item} value={undefined} onChange={onChange} />
      );

      fireEvent.change(screen.getByLabelText('Age'), {
        target: { value: '25' },
      });

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('Decimal field', () => {
    it('renders number input for decimal type', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'decimal',
        text: 'Weight',
      };

      renderWithProviders(
        <FormField item={item} value={undefined} onChange={jest.fn()} />
      );

      expect(screen.getByLabelText('Weight')).toBeInTheDocument();
    });
  });

  describe('Date field', () => {
    it('renders date input for date type', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'date',
        text: 'Birth Date',
      };

      renderWithProviders(
        <FormField item={item} value={null} onChange={jest.fn()} />
      );

      expect(screen.getByLabelText('Birth Date')).toBeInTheDocument();
    });

    it('displays formatted date value', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'date',
        text: 'Birth Date',
      };

      renderWithProviders(
        <FormField item={item} value="1990-05-15" onChange={jest.fn()} />
      );

      // Date should be displayed
      expect(screen.getByLabelText('Birth Date')).toBeInTheDocument();
    });
  });

  describe('Boolean field (checkbox)', () => {
    it('renders checkbox for boolean type', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'boolean',
        text: 'I agree to the terms',
      };

      renderWithProviders(
        <FormField item={item} value={false} onChange={jest.fn()} />
      );

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText('I agree to the terms')).toBeInTheDocument();
    });

    it('toggles checkbox state', () => {
      const onChange = jest.fn();
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'boolean',
        text: 'I agree',
      };

      renderWithProviders(
        <FormField item={item} value={false} onChange={onChange} />
      );

      fireEvent.click(screen.getByRole('checkbox'));
      expect(onChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Choice field (select/radio)', () => {
    it('renders radio buttons for 4 or fewer options', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'choice',
        text: 'Gender',
        answerOption: [
          { valueCoding: { code: 'male', display: 'Male' } },
          { valueCoding: { code: 'female', display: 'Female' } },
          { valueCoding: { code: 'other', display: 'Other' } },
        ],
      };

      renderWithProviders(
        <FormField item={item} value="" onChange={jest.fn()} />
      );

      expect(screen.getByRole('radio', { name: 'Male' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Female' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Other' })).toBeInTheDocument();
    });

    it('renders select dropdown for more than 4 options', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'choice',
        text: 'Country',
        answerOption: [
          { valueCoding: { code: 'ge', display: 'Georgia' } },
          { valueCoding: { code: 'us', display: 'United States' } },
          { valueCoding: { code: 'uk', display: 'United Kingdom' } },
          { valueCoding: { code: 'de', display: 'Germany' } },
          { valueCoding: { code: 'fr', display: 'France' } },
        ],
      };

      renderWithProviders(
        <FormField item={item} value="" onChange={jest.fn()} />
      );

      // Should render a combobox (select)
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('selects radio option', () => {
      const onChange = jest.fn();
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'choice',
        text: 'Gender',
        answerOption: [
          { valueCoding: { code: 'male', display: 'Male' } },
          { valueCoding: { code: 'female', display: 'Female' } },
        ],
      };

      renderWithProviders(
        <FormField item={item} value="" onChange={onChange} />
      );

      fireEvent.click(screen.getByRole('radio', { name: 'Male' }));
      expect(onChange).toHaveBeenCalledWith('male');
    });
  });

  describe('Display field', () => {
    it('renders read-only text for display type', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'display',
        text: 'This is informational text',
      };

      renderWithProviders(
        <FormField item={item} value={undefined} onChange={jest.fn()} />
      );

      expect(screen.getByText('This is informational text')).toBeInTheDocument();
    });
  });

  describe('Group field', () => {
    it('renders nested fields in group', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-group',
        type: 'group',
        text: 'Patient Information',
        item: [
          { linkId: 'first-name', type: 'string', text: 'First Name' },
          { linkId: 'last-name', type: 'string', text: 'Last Name' },
        ],
      };

      renderWithProviders(
        <FormField item={item} value={{}} onChange={jest.fn()} />
      );

      expect(screen.getByText('Patient Information')).toBeInTheDocument();
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    });

    it('handles nested field changes', () => {
      const onChange = jest.fn();
      const item: QuestionnaireItem = {
        linkId: 'test-group',
        type: 'group',
        text: 'Patient Information',
        item: [
          { linkId: 'first-name', type: 'string', text: 'First Name' },
        ],
      };

      renderWithProviders(
        <FormField item={item} value={{}} onChange={onChange} />
      );

      fireEvent.change(screen.getByLabelText('First Name'), {
        target: { value: 'John' },
      });

      expect(onChange).toHaveBeenCalledWith({ 'first-name': 'John' });
    });
  });

  describe('URL field', () => {
    it('renders URL input', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'url',
        text: 'Website',
      };

      renderWithProviders(
        <FormField item={item} value="" onChange={jest.fn()} />
      );

      expect(screen.getByLabelText('Website')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
    });

    it('shows link when valid URL is entered', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'url',
        text: 'Website',
      };

      renderWithProviders(
        <FormField item={item} value="https://example.com" onChange={jest.fn()} />
      );

      expect(screen.getByText('Open link')).toBeInTheDocument();
    });
  });

  describe('Error display', () => {
    it('displays error message', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'string',
        text: 'Test Field',
      };

      renderWithProviders(
        <FormField item={item} value="" onChange={jest.fn()} error="This field is required" />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  describe('Auto-populated indicator', () => {
    it('shows indicator for auto-populated fields', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'string',
        text: 'Patient Name',
        extension: [
          {
            url: 'http://medimind.ge/patient-binding',
            valueString: 'firstName',
          },
        ],
      };

      renderWithProviders(
        <FormField
          item={item}
          value="John"
          onChange={jest.fn()}
          isAutoPopulated
        />
      );

      // Should have description about auto-population
      expect(screen.getByText(/Auto-populated from/)).toBeInTheDocument();
    });
  });

  describe('Unsupported field type', () => {
    it('renders text input as fallback for unknown types', () => {
      const item: QuestionnaireItem = {
        linkId: 'test-field',
        type: 'reference' as any, // Unknown type falls back to text
        text: 'Reference Field',
      };

      renderWithProviders(
        <FormField item={item} value={undefined} onChange={jest.fn()} />
      );

      // Unknown types fall back to text input
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });
});
