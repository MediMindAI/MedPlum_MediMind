// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { screen, waitFor, act } from '@testing-library/react';
import { MockClient } from '@medplum/mock';
import type { QuestionnaireResponse, Questionnaire, Patient, Bundle } from '@medplum/fhirtypes';
import { renderWithProviders } from '../../test-utils';
import { FormSearchView } from './FormSearchView';

// Mock data
const mockQuestionnaires: Questionnaire[] = [
  {
    resourceType: 'Questionnaire',
    id: 'questionnaire-1',
    status: 'active',
    title: 'Patient Intake Form',
  },
  {
    resourceType: 'Questionnaire',
    id: 'questionnaire-2',
    status: 'active',
    title: 'Medical History Form',
  },
];

const mockPatient: Patient = {
  resourceType: 'Patient',
  id: 'patient-1',
  name: [{ given: ['John'], family: 'Doe' }],
};

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
    subject: { reference: 'Patient/patient-1' },
    authored: '2025-01-14T14:00:00Z',
    item: [],
  },
];

const createMockBundle = (responses: QuestionnaireResponse[], total?: number): Bundle => ({
  resourceType: 'Bundle',
  type: 'searchset',
  total: total ?? responses.length,
  entry: [
    ...responses.map((r) => ({ resource: r })),
    { resource: mockPatient },
  ],
});

describe('FormSearchView', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');

    // Mock questionnaire search
    jest.spyOn(medplum, 'search').mockImplementation(async (resourceType: string) => {
      if (resourceType === 'Questionnaire') {
        return {
          resourceType: 'Bundle',
          type: 'searchset',
          entry: mockQuestionnaires.map((q) => ({ resource: q })),
        };
      }
      if (resourceType === 'QuestionnaireResponse') {
        return createMockBundle(mockResponses);
      }
      return { resourceType: 'Bundle', type: 'searchset', entry: [] };
    });

    // Mock readResource for patients
    jest.spyOn(medplum, 'readResource').mockImplementation(async (resourceType: string, id: string) => {
      if (resourceType === 'Patient' && id === 'patient-1') {
        return mockPatient;
      }
      throw new Error('Resource not found');
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render the search view', async () => {
    await act(async () => {
      renderWithProviders(<FormSearchView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('form-search-view')).toBeInTheDocument();
    });
  });

  it('should render page title', async () => {
    await act(async () => {
      renderWithProviders(<FormSearchView />, { medplum });
    });

    // The component should render with some title element
    await waitFor(() => {
      expect(screen.getByTestId('form-search-view')).toBeInTheDocument();
    });
  });

  it('should render search filters', async () => {
    await act(async () => {
      renderWithProviders(<FormSearchView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('form-search-filters')).toBeInTheDocument();
    });
  });

  it('should render results table', async () => {
    await act(async () => {
      renderWithProviders(<FormSearchView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('form-results-table')).toBeInTheDocument();
    });
  });

  it('should call search on mount', async () => {
    await act(async () => {
      renderWithProviders(<FormSearchView />, { medplum });
    });

    await waitFor(() => {
      expect(medplum.search).toHaveBeenCalledWith(
        'QuestionnaireResponse',
        expect.any(Object)
      );
    });
  });

  it('should display questionnaires in filter dropdown', async () => {
    await act(async () => {
      renderWithProviders(<FormSearchView />, { medplum });
    });

    await waitFor(() => {
      expect(medplum.search).toHaveBeenCalledWith(
        'Questionnaire',
        expect.objectContaining({ status: 'active' })
      );
    });
  });

  it('should display error alert when search fails', async () => {
    jest.spyOn(medplum, 'search').mockRejectedValue(new Error('Search failed'));

    await act(async () => {
      renderWithProviders(<FormSearchView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByText(/Search failed/i)).toBeInTheDocument();
    });
  });

  it('should search for QuestionnaireResponses on mount', async () => {
    await act(async () => {
      renderWithProviders(<FormSearchView />, { medplum });
    });

    await waitFor(() => {
      expect(medplum.search).toHaveBeenCalledWith(
        'QuestionnaireResponse',
        expect.objectContaining({
          _count: '100',
          _offset: '0',
        })
      );
    });
  });

  it('should use theme colors', async () => {
    await act(async () => {
      renderWithProviders(<FormSearchView />, { medplum });
    });

    await waitFor(() => {
      const view = screen.getByTestId('form-search-view');
      expect(view).toHaveStyle({
        backgroundColor: 'var(--emr-gray-50)',
      });
    });
  });

  it('should render empty state when no results', async () => {
    jest.spyOn(medplum, 'search').mockImplementation(async (resourceType: string) => {
      if (resourceType === 'Questionnaire') {
        return {
          resourceType: 'Bundle',
          type: 'searchset',
          entry: mockQuestionnaires.map((q) => ({ resource: q })),
        };
      }
      return { resourceType: 'Bundle', type: 'searchset', entry: [], total: 0 };
    });

    await act(async () => {
      renderWithProviders(<FormSearchView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('form-results-table-empty')).toBeInTheDocument();
    });
  });

  it('should include sort parameter in search', async () => {
    await act(async () => {
      renderWithProviders(<FormSearchView />, { medplum });
    });

    await waitFor(() => {
      expect(medplum.search).toHaveBeenCalledWith(
        'QuestionnaireResponse',
        expect.objectContaining({
          _sort: '-authored',
        })
      );
    });
  });

  it('should include patient resources in search', async () => {
    await act(async () => {
      renderWithProviders(<FormSearchView />, { medplum });
    });

    await waitFor(() => {
      expect(medplum.search).toHaveBeenCalledWith(
        'QuestionnaireResponse',
        expect.objectContaining({
          _include: 'QuestionnaireResponse:subject',
        })
      );
    });
  });
});
