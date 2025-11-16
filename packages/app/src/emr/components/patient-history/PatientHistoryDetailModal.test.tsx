// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import { PatientHistoryDetailModal } from './PatientHistoryDetailModal';
import type { Patient, Encounter } from '@medplum/fhirtypes';

describe('PatientHistoryDetailModal', () => {
  let medplum: MockClient;
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  const mockPatient: Patient = {
    resourceType: 'Patient',
    id: 'pat-123',
    name: [
      {
        given: ['კონსტანტინე'],
        family: 'ხაჭაკაძე',
      },
    ],
    address: [
      {
        state: 'თბილისი',
        district: 'ვაკე',
        city: 'თბილისი',
        line: ['ჭავჭავაძის გამზირი 10'],
      },
    ],
  };

  const mockEncounter: Encounter = {
    resourceType: 'Encounter',
    id: 'enc-456',
    status: 'in-progress',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'AMB',
    },
    subject: {
      reference: 'Patient/pat-123',
    },
    period: {
      start: '2025-11-16T12:43:00Z',
    },
    type: [
      {
        coding: [{ code: 'AMB' }],
      },
    ],
  };

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
    jest.clearAllMocks();

    // Mock the resources
    medplum.createResource(mockPatient);
    medplum.createResource(mockEncounter);
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

  describe('Modal Rendering', () => {
    it('renders modal when opened is true', () => {
      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      // Modal should be visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render modal when opened is false', () => {
      renderWithProviders(
        <PatientHistoryDetailModal
          opened={false}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      // Modal should not be visible
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('displays 4 section titles', async () => {
      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText(/რეგისტრაცია/)).toBeInTheDocument();
      });

      // Check for all 4 sections
      expect(screen.getByText(/რეგისტრაცია/)).toBeInTheDocument(); // Registration
      expect(screen.getByText(/დაზღვევა/)).toBeInTheDocument(); // Insurance
      expect(screen.getByText(/საგარანტიო/)).toBeInTheDocument(); // Guarantee
      expect(screen.getByText(/დემოგრაფია/)).toBeInTheDocument(); // Demographics
    });

    it('displays save and cancel buttons', async () => {
      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('შენახვა')).toBeInTheDocument(); // Save
      });

      expect(screen.getByText('გაუქმება')).toBeInTheDocument(); // Cancel
    });

    it('displays visit badge with format "ვიზიტები: X/Y (type)"', async () => {
      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/ვიზიტები:/)).toBeInTheDocument();
      });
    });
  });

  describe('Registration Section', () => {
    it('displays visit date field', async () => {
      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/თარიღი/)).toBeInTheDocument();
      });
    });

    it('displays admission type field', async () => {
      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/შემოსვლის ტიპი/)).toBeInTheDocument();
      });
    });

    it('displays department field', async () => {
      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/განყოფილება/)).toBeInTheDocument();
      });
    });
  });

  describe('Insurance Section', () => {
    it('displays insurance checkbox toggle', async () => {
      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('დაზღვევის ჩართვა')).toBeInTheDocument();
      });
    });

    it('shows primary insurer fields when insurance is enabled', async () => {
      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('დაზღვევის ჩართვა')).toBeInTheDocument();
      });

      // Enable insurance
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByText('პირველი მზღვეველი')).toBeInTheDocument();
      });
    });

    it('displays add insurer button when less than 3 insurers', async () => {
      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('დაზღვევის ჩართვა')).toBeInTheDocument();
      });

      // Enable insurance
      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(screen.getByText('მეტი მზღვეველის დამატება')).toBeInTheDocument();
      });
    });
  });

  describe('Demographics Section', () => {
    it('displays demographics tab', async () => {
      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/დემოგრაფია/)).toBeInTheDocument();
      });
    });

    it('displays copy tab', async () => {
      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('კოპირება')).toBeInTheDocument();
      });
    });

    it('displays region field in demographics', async () => {
      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('რეგიონი')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when cancel button is clicked', async () => {
      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('გაუქმება')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('გაუქმება'));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when X button is clicked', async () => {
      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click the close button (X) - Mantine's CloseButton doesn't have a name
      const closeButton = screen.getAllByRole('button').find(
        (btn) => btn.classList.contains('mantine-Modal-close')
      );
      expect(closeButton).toBeDefined();
      if (closeButton) {
        fireEvent.click(closeButton);
      }

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Multilingual Support', () => {
    it('displays Georgian labels when language is ka', async () => {
      localStorage.setItem('emrLanguage', 'ka');

      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/რეგისტრაცია/)).toBeInTheDocument();
      });
    });

    it('displays English labels when language is en', async () => {
      localStorage.setItem('emrLanguage', 'en');

      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Registration/)).toBeInTheDocument();
      });
    });

    it('displays Russian labels when language is ru', async () => {
      localStorage.setItem('emrLanguage', 'ru');

      renderWithProviders(
        <PatientHistoryDetailModal
          opened={true}
          onClose={mockOnClose}
          encounterId="enc-456"
          onSuccess={mockOnSuccess}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Регистрация/)).toBeInTheDocument();
      });
    });
  });
});
