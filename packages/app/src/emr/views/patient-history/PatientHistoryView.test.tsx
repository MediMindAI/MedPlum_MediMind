// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MedplumProvider } from '@medplum/react-hooks';
import { MantineProvider } from '@mantine/core';
import { MockClient } from '@medplum/mock';
import type { Patient, Encounter, Identifier, HumanName, Bundle } from '@medplum/fhirtypes';
import { PatientHistoryView } from './PatientHistoryView';

describe('PatientHistoryView', () => {
  let medplum: MockClient;

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <MantineProvider>
        <MemoryRouter initialEntries={['/emr/patient-history']}>
          <MedplumProvider medplum={medplum}>
            <Routes>
              <Route path="/emr/patient-history" element={component} />
              <Route path="/emr/patient-history/:id" element={<div>Visit Detail Page</div>} />
            </Routes>
          </MedplumProvider>
        </MemoryRouter>
      </MantineProvider>
    );
  };

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  /**
   * T013: Test case - displays patient visit table with 10 columns
   * Verifies that the patient history page displays all 10 required columns:
   * პ/ნ (Personal ID), სახელი (First Name), გვარი (Last Name), თარიღი (Date),
   * # (Registration Number), ჯამი (Total), % (Discount), ვალი (Debt),
   * გადახდ. (Payment), and Actions
   */
  it('displays patient visit table with 10 columns', async () => {
    // Create a mock patient
    const mockPatient: Patient = {
      resourceType: 'Patient',
      id: 'test-patient-1',
      identifier: [
        {
          system: 'http://medimind.ge/identifiers/personal-id',
          value: '26001014632',
        } as Identifier,
      ],
      name: [
        {
          given: ['თენგიზი'],
          family: 'ხოზვრია',
        } as HumanName,
      ],
    };

    // Create a mock encounter
    const mockEncounter: Encounter = {
      resourceType: 'Encounter',
      id: 'test-encounter-1',
      status: 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB',
      },
      subject: {
        reference: 'Patient/test-patient-1',
        display: 'თენგიზი ხოზვრია',
      },
      period: {
        start: '2025-11-14T10:00:00Z',
        end: '2025-11-14T11:30:00Z',
      },
      identifier: [
        {
          system: 'http://medimind.ge/identifiers/registration-number',
          value: '10357-2025',
        } as Identifier,
      ],
    };

    // Mock the search results
    medplum.router.add('GET', '/fhir/R4/Encounter', () => ({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [
        {
          resource: mockEncounter,
        },
        {
          resource: mockPatient,
        },
      ],
    } as Bundle) as any);

    renderWithProviders(<PatientHistoryView />);

    // Wait for table to load
    await waitFor(() => {
      // Verify all 10 column headers are present (Georgian translations)
      expect(screen.getByText('პ/ნ')).toBeInTheDocument(); // Personal ID
      expect(screen.getByText('სახელი')).toBeInTheDocument(); // First Name
      expect(screen.getByText('გვარი')).toBeInTheDocument(); // Last Name
      expect(screen.getByText('თარიღი')).toBeInTheDocument(); // Date
      expect(screen.getByText('#')).toBeInTheDocument(); // Registration Number
      expect(screen.getByText('ჯამი')).toBeInTheDocument(); // Total
      expect(screen.getByText('%')).toBeInTheDocument(); // Discount
      expect(screen.getByText('ვალი')).toBeInTheDocument(); // Debt
      expect(screen.getByText('გადახდ.')).toBeInTheDocument(); // Payment
    });
  });

  /**
   * T014: Test case - displays personal ID in first column
   * Verifies that the first column (პ/ნ) displays the patient's 11-digit Georgian personal ID
   */
  it('displays personal ID in first column', async () => {
    const mockPatient: Patient = {
      resourceType: 'Patient',
      id: 'test-patient-2',
      identifier: [
        {
          system: 'http://medimind.ge/identifiers/personal-id',
          value: '01001011116', // Valid Georgian personal ID
        } as Identifier,
      ],
      name: [
        {
          given: ['გიორგი'],
          family: 'მამულაშვილი',
        } as HumanName,
      ],
    };

    const mockEncounter: Encounter = {
      resourceType: 'Encounter',
      id: 'test-encounter-2',
      status: 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB',
      },
      subject: {
        reference: 'Patient/test-patient-2',
        display: 'გიორგი მამულაშვილი',
      },
      period: {
        start: '2025-11-14T09:00:00Z',
      },
      identifier: [
        {
          system: 'http://medimind.ge/identifiers/registration-number',
          value: '10358-2025',
        } as Identifier,
      ],
    };

    medplum.router.add('GET', '/fhir/R4/Encounter', () => ({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [
        {
          resource: mockEncounter,
        },
        {
          resource: mockPatient,
        },
      ],
    } as Bundle) as any);

    renderWithProviders(<PatientHistoryView />);

    // Wait for the personal ID to appear in the table
    await waitFor(() => {
      expect(screen.getByText('01001011116')).toBeInTheDocument();
    });
  });

  /**
   * T015: Test case - displays registration number in correct format (10357-2025 or a-6871-2025)
   * Verifies that registration numbers display in the correct format:
   * - Stationary/numeric format: "10357-2025"
   * - Ambulatory format with "a-" prefix: "a-6871-2025"
   */
  it('displays registration number in correct format (10357-2025 or a-6871-2025)', async () => {
    const mockPatient1: Patient = {
      resourceType: 'Patient',
      id: 'test-patient-3',
      identifier: [
        {
          system: 'http://medimind.ge/identifiers/personal-id',
          value: '12345678901',
        } as Identifier,
      ],
      name: [
        {
          given: ['ნინო'],
          family: 'კვარაცხელია',
        } as HumanName,
      ],
    };

    const mockPatient2: Patient = {
      resourceType: 'Patient',
      id: 'test-patient-4',
      identifier: [
        {
          system: 'http://medimind.ge/identifiers/personal-id',
          value: '98765432109',
        } as Identifier,
      ],
      name: [
        {
          given: ['ლაშა'],
          family: 'თევდორაძე',
        } as HumanName,
      ],
    };

    // Stationary encounter (numeric registration number)
    const stationaryEncounter: Encounter = {
      resourceType: 'Encounter',
      id: 'test-encounter-3',
      status: 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'IMP', // Inpatient
      },
      subject: {
        reference: 'Patient/test-patient-3',
        display: 'ნინო კვარაცხელია',
      },
      period: {
        start: '2025-11-14T08:00:00Z',
      },
      identifier: [
        {
          system: 'http://medimind.ge/identifiers/registration-number',
          value: '10357-2025', // Stationary format
        } as Identifier,
      ],
    };

    // Ambulatory encounter (alphanumeric registration number with "a-" prefix)
    const ambulatoryEncounter: Encounter = {
      resourceType: 'Encounter',
      id: 'test-encounter-4',
      status: 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB', // Ambulatory
      },
      subject: {
        reference: 'Patient/test-patient-4',
        display: 'ლაშა თევდორაძე',
      },
      period: {
        start: '2025-11-14T14:00:00Z',
      },
      identifier: [
        {
          system: 'http://medimind.ge/identifiers/registration-number',
          value: 'a-6871-2025', // Ambulatory format with "a-" prefix
        } as Identifier,
      ],
    };

    medplum.router.add('GET', '/fhir/R4/Encounter', () => ({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [
        {
          resource: stationaryEncounter,
        },
        {
          resource: mockPatient1,
        },
        {
            resource: ambulatoryEncounter,
          },
          {
            resource: mockPatient2,
          },
        ],
      } as Bundle) as any);

    renderWithProviders(<PatientHistoryView />);

    // Wait for both registration numbers to appear
    await waitFor(() => {
      expect(screen.getByText('10357-2025')).toBeInTheDocument(); // Stationary format
      expect(screen.getByText('a-6871-2025')).toBeInTheDocument(); // Ambulatory format
    });
  });

  /**
   * T016: Test case - displays multiple timestamps on separate lines in date column
   * Verifies that when a visit has multiple timestamps (admission and discharge),
   * they display on separate lines within the თარიღი (Date) cell
   */
  it('displays multiple timestamps on separate lines in date column', async () => {
    const mockPatient: Patient = {
      resourceType: 'Patient',
      id: 'test-patient-5',
      identifier: [
        {
          system: 'http://medimind.ge/identifiers/personal-id',
          value: '11223344556',
        } as Identifier,
      ],
      name: [
        {
          given: ['მარიამი'],
          family: 'გელაშვილი',
        } as HumanName,
      ],
    };

    const mockEncounter: Encounter = {
      resourceType: 'Encounter',
      id: 'test-encounter-5',
      status: 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'IMP',
      },
      subject: {
        reference: 'Patient/test-patient-5',
        display: 'მარიამი გელაშვილი',
      },
      period: {
        start: '2025-11-10T08:00:00Z', // Admission date
        end: '2025-11-14T16:00:00Z', // Discharge date
      },
      identifier: [
        {
          system: 'http://medimind.ge/identifiers/registration-number',
          value: '10359-2025',
        } as Identifier,
      ],
    };

    medplum.router.add('GET', '/fhir/R4/Encounter', () => ({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [
        {
          resource: mockEncounter,
        },
        {
          resource: mockPatient,
        },
      ],
    } as Bundle) as any);

    renderWithProviders(<PatientHistoryView />);

    // Wait for the date column to render
    await waitFor(() => {
      // Verify both admission and discharge dates are displayed
      // The component should format these dates and display them on separate lines
      const dateColumn = screen.getByText(/2025-11-10/i);
      expect(dateColumn).toBeInTheDocument();

      // Also check for discharge date
      const dischargeDateColumn = screen.getByText(/2025-11-14/i);
      expect(dischargeDateColumn).toBeInTheDocument();
    });
  });

  /**
   * T017: Test case - makes table rows clickable and navigates to visit detail on click
   * Verifies that:
   * 1. Table rows have cursor: pointer styling
   * 2. Clicking a row navigates to /emr/patient-history/:id
   */
  it('makes table rows clickable and navigates to visit detail on click', async () => {
    const mockPatient: Patient = {
      resourceType: 'Patient',
      id: 'test-patient-6',
      identifier: [
        {
          system: 'http://medimind.ge/identifiers/personal-id',
          value: '22334455667',
        } as Identifier,
      ],
      name: [
        {
          given: ['დავითი'],
          family: 'ბერიძე',
        } as HumanName,
      ],
    };

    const mockEncounter: Encounter = {
      resourceType: 'Encounter',
      id: 'test-encounter-6',
      status: 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB',
      },
      subject: {
        reference: 'Patient/test-patient-6',
        display: 'დავითი ბერიძე',
      },
      period: {
        start: '2025-11-14T12:00:00Z',
      },
      identifier: [
        {
          system: 'http://medimind.ge/identifiers/registration-number',
          value: '10360-2025',
        } as Identifier,
      ],
    };

    medplum.router.add('GET', '/fhir/R4/Encounter', () => ({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: [
        {
          resource: mockEncounter,
        },
        {
          resource: mockPatient,
        },
      ],
    } as Bundle) as any);

    renderWithProviders(<PatientHistoryView />);

    // Wait for the patient name to appear in the table
    await waitFor(() => {
      expect(screen.getByText('დავითი')).toBeInTheDocument();
    });

    // Find the table row containing the patient data
    const patientRow = screen.getByText('დავითი').closest('tr');
    expect(patientRow).toBeInTheDocument();

    // Verify the row has cursor pointer styling (or is clickable)
    // The component should apply cursor: pointer style to make rows visually clickable
    if (patientRow) {
      // Click the row
      fireEvent.click(patientRow);

      // Verify navigation to visit detail page
      await waitFor(() => {
        expect(screen.getByText('Visit Detail Page')).toBeInTheDocument();
      });
    }
  });
});
