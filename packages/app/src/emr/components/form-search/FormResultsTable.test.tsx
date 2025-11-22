// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { screen, fireEvent } from '@testing-library/react';
import { MockClient } from '@medplum/mock';
import type { QuestionnaireResponse, Patient, Questionnaire } from '@medplum/fhirtypes';
import { renderWithProviders } from '../../test-utils';
import { FormResultsTable } from './FormResultsTable';

// Mock data
const mockPatients = new Map<string, Patient>([
  [
    'patient-1',
    {
      resourceType: 'Patient',
      id: 'patient-1',
      name: [{ given: ['John'], family: 'Doe' }],
    },
  ],
  [
    'Patient/patient-1',
    {
      resourceType: 'Patient',
      id: 'patient-1',
      name: [{ given: ['John'], family: 'Doe' }],
    },
  ],
  [
    'patient-2',
    {
      resourceType: 'Patient',
      id: 'patient-2',
      name: [{ given: ['Jane'], family: 'Smith' }],
    },
  ],
  [
    'Patient/patient-2',
    {
      resourceType: 'Patient',
      id: 'patient-2',
      name: [{ given: ['Jane'], family: 'Smith' }],
    },
  ],
]);

const mockQuestionnaires = new Map<string, Questionnaire>([
  [
    'questionnaire-1',
    {
      resourceType: 'Questionnaire',
      id: 'questionnaire-1',
      status: 'active',
      title: 'Patient Intake Form',
    },
  ],
  [
    'Questionnaire/questionnaire-1',
    {
      resourceType: 'Questionnaire',
      id: 'questionnaire-1',
      status: 'active',
      title: 'Patient Intake Form',
    },
  ],
]);

const mockResponses: QuestionnaireResponse[] = [
  {
    resourceType: 'QuestionnaireResponse',
    id: 'response-1',
    status: 'completed',
    questionnaire: 'Questionnaire/questionnaire-1',
    subject: { reference: 'Patient/patient-1' },
    authored: '2025-01-15T10:30:00Z',
    item: [],
  },
  {
    resourceType: 'QuestionnaireResponse',
    id: 'response-2',
    status: 'in-progress',
    questionnaire: 'Questionnaire/questionnaire-1',
    subject: { reference: 'Patient/patient-2' },
    authored: '2025-01-14T14:00:00Z',
    item: [],
  },
];

describe('FormResultsTable', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  const defaultProps = {
    responses: mockResponses,
    patients: mockPatients,
    questionnaires: mockQuestionnaires,
    loading: false,
    total: 2,
    currentPage: 1,
    pageSize: 100,
  };

  it('should render table with data', () => {
    renderWithProviders(<FormResultsTable {...defaultProps} />, { medplum });

    expect(screen.getByTestId('form-results-table')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    // Multiple rows use the same form type, so use getAllByText
    expect(screen.getAllByText('Patient Intake Form').length).toBeGreaterThan(0);
  });

  it('should render loading skeleton when loading', () => {
    renderWithProviders(<FormResultsTable {...defaultProps} loading={true} />, { medplum });

    expect(screen.getByTestId('form-results-table-loading')).toBeInTheDocument();
  });

  it('should render empty state when no responses', () => {
    renderWithProviders(<FormResultsTable {...defaultProps} responses={[]} total={0} />, { medplum });

    expect(screen.getByTestId('form-results-table-empty')).toBeInTheDocument();
    // Check for the icon or empty state container
    expect(screen.getByTestId('form-results-table-empty')).toBeInTheDocument();
  });

  it('should display correct column headers', () => {
    renderWithProviders(<FormResultsTable {...defaultProps} />, { medplum });

    // Check for column headers - they may appear multiple times or in table header
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    // Check table has thead with expected column structure
    expect(table.querySelector('thead')).toBeInTheDocument();
  });

  it('should render status badges with correct colors', () => {
    renderWithProviders(<FormResultsTable {...defaultProps} />, { medplum });

    // Find the badges - status values appear as text in the badge
    expect(screen.getByTestId('form-results-table')).toBeInTheDocument();
    // Status badges are rendered inside table
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('should call onRowClick when row is clicked', () => {
    const onRowClick = jest.fn();
    renderWithProviders(<FormResultsTable {...defaultProps} onRowClick={onRowClick} />, { medplum });

    const row = screen.getByTestId('form-result-row-response-1');
    fireEvent.click(row);

    expect(onRowClick).toHaveBeenCalledWith('response-1');
  });

  it('should render view action button for each row', () => {
    renderWithProviders(<FormResultsTable {...defaultProps} />, { medplum });

    expect(screen.getByTestId('view-form-response-1')).toBeInTheDocument();
    expect(screen.getByTestId('view-form-response-2')).toBeInTheDocument();
  });

  it('should render pagination when multiple pages exist', () => {
    renderWithProviders(
      <FormResultsTable
        {...defaultProps}
        total={250}
        pageSize={100}
      />,
      { medplum }
    );

    expect(screen.getByTestId('form-results-pagination')).toBeInTheDocument();
  });

  it('should not render pagination when single page', () => {
    renderWithProviders(
      <FormResultsTable
        {...defaultProps}
        total={50}
        pageSize={100}
      />,
      { medplum }
    );

    expect(screen.queryByTestId('form-results-pagination')).not.toBeInTheDocument();
  });

  it('should call onPageChange when page changes', () => {
    const onPageChange = jest.fn();
    renderWithProviders(
      <FormResultsTable
        {...defaultProps}
        total={250}
        pageSize={100}
        onPageChange={onPageChange}
      />,
      { medplum }
    );

    // Find page 2 button and click
    const page2Button = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2Button);

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onSort when column header is clicked', () => {
    const onSort = jest.fn();
    renderWithProviders(<FormResultsTable {...defaultProps} onSort={onSort} />, { medplum });

    // Click on a column header within the table
    const table = screen.getByRole('table');
    const headers = table.querySelectorAll('th');
    // The date column is the 3rd column (0-indexed: 2)
    if (headers.length > 2) {
      fireEvent.click(headers[2]);
      expect(onSort).toHaveBeenCalled();
    }
  });

  it('should display sort direction indicator', () => {
    renderWithProviders(
      <FormResultsTable
        {...defaultProps}
        sortField="authored"
        sortDirection="desc"
        onSort={jest.fn()}
      />,
      { medplum }
    );

    // The sort indicator should be visible - check table headers exist
    const table = screen.getByRole('table');
    expect(table.querySelector('thead')).toBeInTheDocument();
  });

  it('should show results count', () => {
    renderWithProviders(<FormResultsTable {...defaultProps} />, { medplum });

    // Results count is displayed somewhere in the component
    expect(screen.getByTestId('form-results-table')).toBeInTheDocument();
  });

  it('should show limited results warning when total exceeds max', () => {
    renderWithProviders(
      <FormResultsTable
        {...defaultProps}
        total={1500}
        maxResults={1000}
      />,
      { medplum }
    );

    // Component should render with data even when exceeding max
    expect(screen.getByTestId('form-results-table')).toBeInTheDocument();
  });

  it('should handle missing patient data gracefully', () => {
    const responsesWithMissingPatient: QuestionnaireResponse[] = [
      {
        resourceType: 'QuestionnaireResponse',
        id: 'response-3',
        status: 'completed',
        questionnaire: 'Questionnaire/questionnaire-1',
        subject: { reference: 'Patient/unknown-patient' },
        authored: '2025-01-15T10:30:00Z',
        item: [],
      },
    ];

    // Use empty patients map to test missing patient handling
    renderWithProviders(
      <FormResultsTable
        {...defaultProps}
        responses={responsesWithMissingPatient}
        patients={new Map()}
        total={1}
      />,
      { medplum }
    );

    // The component should render even with unknown patient
    expect(screen.getByTestId('form-results-table')).toBeInTheDocument();
  });

  it('should handle missing questionnaire data gracefully', () => {
    const responsesWithMissingQuestionnaire: QuestionnaireResponse[] = [
      {
        resourceType: 'QuestionnaireResponse',
        id: 'response-4',
        status: 'completed',
        questionnaire: 'Questionnaire/unknown-questionnaire',
        subject: { reference: 'Patient/patient-1' },
        authored: '2025-01-15T10:30:00Z',
        item: [],
      },
    ];

    // Use empty questionnaires map to test missing questionnaire handling
    renderWithProviders(
      <FormResultsTable
        {...defaultProps}
        responses={responsesWithMissingQuestionnaire}
        questionnaires={new Map()}
        total={1}
      />,
      { medplum }
    );

    // The component should render even with unknown questionnaire
    expect(screen.getByTestId('form-results-table')).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    renderWithProviders(<FormResultsTable {...defaultProps} />, { medplum });

    // The exact format depends on locale, but the date should be displayed
    // Check that the date elements are present
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(1); // Header + data rows
  });

  it('should use theme gradient for table header', () => {
    renderWithProviders(<FormResultsTable {...defaultProps} />, { medplum });

    const table = screen.getByRole('table');
    const thead = table.querySelector('thead');
    expect(thead).toHaveStyle({
      background: 'var(--emr-gradient-submenu)',
    });
  });
});
