// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import type { Patient } from '@medplum/fhirtypes';
import { DuplicateWarningModal } from './DuplicateWarningModal';

// Mock useTranslation hook
jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'registration.duplicate.title': 'Duplicate Found',
        'registration.duplicate.message': 'A patient with this personal ID already exists. Do you want to continue?',
        'registration.duplicate.existingInfo': 'Existing Patient Information',
        'registration.field.personalId': 'Personal ID',
        'registration.field.firstName': 'First Name',
        'registration.field.lastName': 'Last Name',
        'registration.field.birthDate': 'Birth Date',
        'registration.field.phoneNumber': 'Phone Number',
        'registration.action.cancel': 'Cancel',
        'registration.action.openExisting': 'Open Existing Patient',
        'registration.action.registerAnyway': 'Register Anyway',
        'registration.state.unknown': 'Unknown',
      };
      return translations[key] || key;
    },
    lang: 'en',
    setLang: jest.fn(),
  }),
}));

describe('DuplicateWarningModal', () => {
  const mockPatient: Patient = {
    resourceType: 'Patient',
    id: 'patient-123',
    identifier: [
      {
        system: 'http://medimind.ge/identifiers/personal-id',
        value: '26001014632',
      },
    ],
    name: [
      {
        given: ['John'],
        family: 'Doe',
      },
    ],
    birthDate: '1986-01-26',
    telecom: [
      {
        system: 'phone',
        value: '+995555123456',
      },
    ],
  };

  const defaultProps = {
    opened: true,
    onClose: jest.fn(),
    existingPatient: mockPatient,
    onOpenExisting: jest.fn(),
    onRegisterAnyway: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProviders = (props = defaultProps) => {
    return render(
      <MantineProvider>
        <DuplicateWarningModal {...props} />
      </MantineProvider>
    );
  };

  it('should render modal when opened', () => {
    renderWithProviders();

    expect(screen.getByText('Duplicate Found')).toBeInTheDocument();
    expect(screen.getByText('A patient with this personal ID already exists. Do you want to continue?')).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    renderWithProviders({ ...defaultProps, opened: false });

    expect(screen.queryByText('Duplicate Found')).not.toBeInTheDocument();
  });

  it('should display existing patient information', () => {
    renderWithProviders();

    expect(screen.getByText('26001014632')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('1986-01-26')).toBeInTheDocument();
    expect(screen.getByText('+995555123456')).toBeInTheDocument();
  });

  it('should display patient with missing phone as "-"', () => {
    const patientNoPhone: Patient = {
      ...mockPatient,
      telecom: [],
    };

    renderWithProviders({
      ...defaultProps,
      existingPatient: patientNoPhone,
    });

    // Find all "-" text nodes (there should be one for the missing phone)
    const phoneDashes = screen.getAllByText('-');
    expect(phoneDashes.length).toBeGreaterThan(0);
  });

  it('should display patient with missing birth date as "-"', () => {
    const patientNoBirthDate: Patient = {
      ...mockPatient,
      birthDate: undefined,
    };

    renderWithProviders({
      ...defaultProps,
      existingPatient: patientNoBirthDate,
    });

    const birthDateDashes = screen.getAllByText('-');
    expect(birthDateDashes.length).toBeGreaterThan(0);
  });

  it('should display "Unknown" for patient with no name', () => {
    const patientNoName: Patient = {
      ...mockPatient,
      name: [],
    };

    renderWithProviders({
      ...defaultProps,
      existingPatient: patientNoName,
    });

    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', () => {
    renderWithProviders();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onRegisterAnyway when register anyway button is clicked', () => {
    renderWithProviders();

    const registerAnywayButton = screen.getByRole('button', { name: /register anyway/i });
    fireEvent.click(registerAnywayButton);

    expect(defaultProps.onRegisterAnyway).toHaveBeenCalledTimes(1);
  });

  it('should call onOpenExisting when open existing button is clicked', () => {
    renderWithProviders();

    const openExistingButton = screen.getByRole('button', { name: /open existing patient/i });
    fireEvent.click(openExistingButton);

    expect(defaultProps.onOpenExisting).toHaveBeenCalledTimes(1);
  });

  it('should render all three action buttons', () => {
    renderWithProviders();

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register anyway/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open existing patient/i })).toBeInTheDocument();
  });

  it('should display existing patient info section header', () => {
    renderWithProviders();

    expect(screen.getByText('Existing Patient Information')).toBeInTheDocument();
  });

  it('should render modal title with alert icon', () => {
    renderWithProviders();

    // Modal title should be visible
    expect(screen.getByText('Duplicate Found')).toBeInTheDocument();
  });

  it('should handle patient with partial name (first name only)', () => {
    const patientFirstNameOnly: Patient = {
      ...mockPatient,
      name: [
        {
          given: ['John'],
        },
      ],
    };

    renderWithProviders({
      ...defaultProps,
      existingPatient: patientFirstNameOnly,
    });

    expect(screen.getByText('John')).toBeInTheDocument();
  });

  it('should handle patient with partial name (last name only)', () => {
    const patientLastNameOnly: Patient = {
      ...mockPatient,
      name: [
        {
          family: 'Doe',
        },
      ],
    };

    renderWithProviders({
      ...defaultProps,
      existingPatient: patientLastNameOnly,
    });

    expect(screen.getByText('Doe')).toBeInTheDocument();
  });

  it('should extract correct personal ID from identifiers', () => {
    const patientMultipleIds: Patient = {
      ...mockPatient,
      identifier: [
        {
          system: 'http://medimind.ge/identifiers/registration-number',
          value: '12345-2025',
        },
        {
          system: 'http://medimind.ge/identifiers/personal-id',
          value: '01001011116',
        },
      ],
    };

    renderWithProviders({
      ...defaultProps,
      existingPatient: patientMultipleIds,
    });

    // Should display the personal ID, not the registration number
    expect(screen.getByText('01001011116')).toBeInTheDocument();
    expect(screen.queryByText('12345-2025')).not.toBeInTheDocument();
  });
});
