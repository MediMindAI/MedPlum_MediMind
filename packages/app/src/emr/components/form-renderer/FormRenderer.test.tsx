// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import type { Questionnaire, Patient, Encounter } from '@medplum/fhirtypes';
import { FormRenderer } from './FormRenderer';

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <MantineProvider>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </MantineProvider>
  );
};

describe('FormRenderer', () => {
  // Test questionnaire
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'questionnaire-123',
    status: 'active',
    title: 'Patient Intake Form',
    description: 'Please fill out this intake form',
    item: [
      {
        linkId: 'patient-name',
        text: 'Patient Name',
        type: 'string',
        required: true,
        extension: [
          {
            url: 'http://medimind.ge/patient-binding',
            valueString: 'fullName',
          },
        ],
      },
      {
        linkId: 'patient-dob',
        text: 'Date of Birth',
        type: 'date',
        required: true,
        extension: [
          {
            url: 'http://medimind.ge/patient-binding',
            valueString: 'dob',
          },
        ],
      },
      {
        linkId: 'patient-age',
        text: 'Age',
        type: 'integer',
        extension: [
          {
            url: 'http://medimind.ge/patient-binding',
            valueString: 'age',
          },
        ],
      },
      {
        linkId: 'chief-complaint',
        text: 'Chief Complaint',
        type: 'text',
        required: true,
      },
      {
        linkId: 'consent',
        text: 'I consent to treatment',
        type: 'boolean',
        required: true,
      },
      {
        linkId: 'severity',
        text: 'Pain Severity',
        type: 'choice',
        answerOption: [
          { valueCoding: { code: 'mild', display: 'Mild' } },
          { valueCoding: { code: 'moderate', display: 'Moderate' } },
          { valueCoding: { code: 'severe', display: 'Severe' } },
        ],
      },
    ],
  };

  // Test patient
  const mockPatient: Patient = {
    resourceType: 'Patient',
    id: 'patient-456',
    name: [
      {
        family: 'Smith',
        given: ['John'],
        extension: [
          {
            url: 'patronymic',
            valueString: 'William',
          },
        ],
      },
    ],
    birthDate: '1990-05-15',
    gender: 'male',
  };

  // Test encounter
  const mockEncounter: Encounter = {
    resourceType: 'Encounter',
    id: 'encounter-789',
    status: 'in-progress',
    class: {
      code: 'AMB',
    },
    period: {
      start: '2025-11-22T10:30:00Z',
    },
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  describe('Rendering', () => {
    it('should render form title and description', () => {
      renderWithProviders(
        <FormRenderer questionnaire={mockQuestionnaire} />
      );

      expect(screen.getByText('Patient Intake Form')).toBeInTheDocument();
      expect(screen.getByText('Please fill out this intake form')).toBeInTheDocument();
    });

    it('should render all questionnaire items', () => {
      renderWithProviders(
        <FormRenderer questionnaire={mockQuestionnaire} />
      );

      expect(screen.getByText('Patient Name')).toBeInTheDocument();
      expect(screen.getByText('Date of Birth')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Chief Complaint')).toBeInTheDocument();
      expect(screen.getByText('I consent to treatment')).toBeInTheDocument();
      expect(screen.getByText('Pain Severity')).toBeInTheDocument();
    });

    it('should render loading skeleton when isLoading is true', () => {
      renderWithProviders(
        <FormRenderer questionnaire={mockQuestionnaire} isLoading={true} />
      );

      // Should not render form content
      expect(screen.queryByText('Patient Intake Form')).not.toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderWithProviders(
        <FormRenderer questionnaire={mockQuestionnaire} onSubmit={jest.fn()} />
      );

      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should render save draft button when onSaveDraft provided', () => {
      renderWithProviders(
        <FormRenderer
          questionnaire={mockQuestionnaire}
          onSubmit={jest.fn()}
          onSaveDraft={jest.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument();
    });

    it('should hide buttons when hideButtons is true', () => {
      renderWithProviders(
        <FormRenderer
          questionnaire={mockQuestionnaire}
          onSubmit={jest.fn()}
          hideButtons={true}
        />
      );

      expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument();
    });
  });

  describe('Patient Data Auto-Population', () => {
    it('should auto-populate fields from patient data', () => {
      renderWithProviders(
        <FormRenderer
          questionnaire={mockQuestionnaire}
          patient={mockPatient}
          enablePatientBinding={true}
        />
      );

      // Name should be auto-populated
      const nameInput = screen.getByRole('textbox', { name: /patient name/i });
      expect(nameInput).toHaveValue('John William Smith');
    });

    it('should show auto-population indicator when enabled', () => {
      renderWithProviders(
        <FormRenderer
          questionnaire={mockQuestionnaire}
          patient={mockPatient}
          enablePatientBinding={true}
          showBindingIndicators={true}
        />
      );

      // Should show alert about auto-populated fields (alert component)
      // The Alert shows "Fields auto-populated from patient data" or similar
      const alerts = screen.getAllByText(/auto-populated/i);
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('should not auto-populate when enablePatientBinding is false', () => {
      renderWithProviders(
        <FormRenderer
          questionnaire={mockQuestionnaire}
          patient={mockPatient}
          enablePatientBinding={false}
        />
      );

      const nameInput = screen.getByRole('textbox', { name: /patient name/i });
      expect(nameInput).toHaveValue('');
    });

    it('should use initial values over auto-populated values', () => {
      renderWithProviders(
        <FormRenderer
          questionnaire={mockQuestionnaire}
          patient={mockPatient}
          enablePatientBinding={true}
          initialValues={{
            'patient-name': 'Custom Name',
          }}
        />
      );

      const nameInput = screen.getByRole('textbox', { name: /patient name/i });
      expect(nameInput).toHaveValue('Custom Name');
    });
  });

  describe('Form Interaction', () => {
    it('should update form values on input change', () => {
      const handleChange = jest.fn();

      renderWithProviders(
        <FormRenderer
          questionnaire={mockQuestionnaire}
          onChange={handleChange}
        />
      );

      const nameInput = screen.getByRole('textbox', { name: /patient name/i });
      fireEvent.change(nameInput, { target: { value: 'Test Name' } });

      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle checkbox change', () => {
      const handleChange = jest.fn();

      renderWithProviders(
        <FormRenderer
          questionnaire={mockQuestionnaire}
          onChange={handleChange}
        />
      );

      const checkbox = screen.getByRole('checkbox', { name: /consent/i });
      fireEvent.click(checkbox);

      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onSubmit when form is submitted', async () => {
      const handleSubmit = jest.fn();

      renderWithProviders(
        <FormRenderer
          questionnaire={mockQuestionnaire}
          patient={mockPatient}
          enablePatientBinding={true}
          onSubmit={handleSubmit}
          initialValues={{
            'chief-complaint': 'Test complaint',
            'consent': true,
          }}
        />
      );

      // Fill required fields that aren't auto-populated
      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalled();
      });
    });

    it('should call onSaveDraft when save draft is clicked', async () => {
      const handleSaveDraft = jest.fn();

      renderWithProviders(
        <FormRenderer
          questionnaire={mockQuestionnaire}
          onSubmit={jest.fn()}
          onSaveDraft={handleSaveDraft}
        />
      );

      const saveDraftButton = screen.getByRole('button', { name: /save draft/i });
      fireEvent.click(saveDraftButton);

      await waitFor(() => {
        expect(handleSaveDraft).toHaveBeenCalled();
      });
    });
  });

  describe('View Mode', () => {
    it('should disable inputs in view mode', () => {
      renderWithProviders(
        <FormRenderer
          questionnaire={mockQuestionnaire}
          mode="view"
          initialValues={{
            'patient-name': 'Test Name',
          }}
        />
      );

      const nameInput = screen.getByRole('textbox', { name: /patient name/i });
      expect(nameInput).toBeDisabled();
    });

    it('should hide action buttons in view mode', () => {
      renderWithProviders(
        <FormRenderer
          questionnaire={mockQuestionnaire}
          mode="view"
          onSubmit={jest.fn()}
        />
      );

      expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument();
    });
  });

  describe('Field Types', () => {
    it('should render string input correctly', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          { linkId: 'string-field', text: 'String Field', type: 'string' },
        ],
      };

      renderWithProviders(<FormRenderer questionnaire={questionnaire} />);

      expect(screen.getByRole('textbox', { name: /string field/i })).toBeInTheDocument();
    });

    it('should render textarea for text type', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          { linkId: 'text-field', text: 'Text Field', type: 'text' },
        ],
      };

      renderWithProviders(<FormRenderer questionnaire={questionnaire} />);

      expect(screen.getByRole('textbox', { name: /text field/i })).toBeInTheDocument();
    });

    it('should render number input for integer type', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          { linkId: 'int-field', text: 'Integer Field', type: 'integer' },
        ],
      };

      renderWithProviders(<FormRenderer questionnaire={questionnaire} />);

      expect(screen.getByRole('textbox', { name: /integer field/i })).toBeInTheDocument();
    });

    it('should render checkbox for boolean type', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          { linkId: 'bool-field', text: 'Boolean Field', type: 'boolean' },
        ],
      };

      renderWithProviders(<FormRenderer questionnaire={questionnaire} />);

      expect(screen.getByRole('checkbox', { name: /boolean field/i })).toBeInTheDocument();
    });

    it('should render radio buttons for choice type with few options', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          {
            linkId: 'choice-field',
            text: 'Choice Field',
            type: 'choice',
            answerOption: [
              { valueCoding: { code: 'a', display: 'Option A' } },
              { valueCoding: { code: 'b', display: 'Option B' } },
            ],
          },
        ],
      };

      renderWithProviders(<FormRenderer questionnaire={questionnaire} />);

      expect(screen.getByRole('radio', { name: /option a/i })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: /option b/i })).toBeInTheDocument();
    });

    it('should render display text correctly', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        item: [
          { linkId: 'display-field', text: 'This is display text', type: 'display' },
        ],
      };

      renderWithProviders(<FormRenderer questionnaire={questionnaire} />);

      expect(screen.getByText('This is display text')).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should show validation error for required fields', async () => {
      const handleSubmit = jest.fn();

      renderWithProviders(
        <FormRenderer
          questionnaire={mockQuestionnaire}
          onSubmit={handleSubmit}
        />
      );

      // Submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Should not call submit due to validation errors
        expect(handleSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Custom Button Text', () => {
    it('should use custom submit button text', () => {
      renderWithProviders(
        <FormRenderer
          questionnaire={mockQuestionnaire}
          onSubmit={jest.fn()}
          submitButtonText="Complete Form"
        />
      );

      expect(screen.getByRole('button', { name: /complete form/i })).toBeInTheDocument();
    });

    it('should use custom save draft button text', () => {
      renderWithProviders(
        <FormRenderer
          questionnaire={mockQuestionnaire}
          onSubmit={jest.fn()}
          onSaveDraft={jest.fn()}
          saveDraftButtonText="Save Progress"
        />
      );

      expect(screen.getByRole('button', { name: /save progress/i })).toBeInTheDocument();
    });
  });

  describe('Empty/Missing Data Handling', () => {
    it('should handle questionnaire without items', () => {
      const emptyQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'Empty Form',
      };

      renderWithProviders(<FormRenderer questionnaire={emptyQuestionnaire} />);

      expect(screen.getByText('Empty Form')).toBeInTheDocument();
    });

    it('should handle patient without name', () => {
      const patientWithoutName: Patient = {
        resourceType: 'Patient',
        id: 'no-name',
      };

      renderWithProviders(
        <FormRenderer
          questionnaire={mockQuestionnaire}
          patient={patientWithoutName}
          enablePatientBinding={true}
        />
      );

      // Should render without crashing
      expect(screen.getByText('Patient Intake Form')).toBeInTheDocument();
    });
  });
});
