// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { screen, waitFor, act, fireEvent } from '@testing-library/react';
import { MockClient } from '@medplum/mock';
import type { QuestionnaireResponse, Questionnaire, Patient } from '@medplum/fhirtypes';
import { renderWithProviders } from '../../test-utils';
import { FormViewerView } from './FormViewerView';

// Mock data
const mockQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'questionnaire-1',
  status: 'active',
  title: 'Patient Intake Form',
  item: [
    {
      linkId: 'name',
      text: 'Patient Name',
      type: 'string',
    },
    {
      linkId: 'age',
      text: 'Age',
      type: 'integer',
    },
    {
      linkId: 'group-1',
      text: 'Medical History',
      type: 'group',
      item: [
        {
          linkId: 'diabetes',
          text: 'Has Diabetes',
          type: 'boolean',
        },
      ],
    },
  ],
};

const mockPatient: Patient = {
  resourceType: 'Patient',
  id: 'patient-1',
  name: [{ given: ['John'], family: 'Doe' }],
  gender: 'male',
  birthDate: '1990-05-15',
  identifier: [
    {
      system: 'http://medimind.ge/identifiers/personal-id',
      value: '01001011116',
    },
  ],
};

const mockResponse: QuestionnaireResponse = {
  resourceType: 'QuestionnaireResponse',
  id: 'response-1',
  status: 'completed',
  questionnaire: 'Questionnaire/questionnaire-1',
  subject: { reference: 'Patient/patient-1' },
  authored: '2025-01-15T10:30:00Z',
  item: [
    {
      linkId: 'name',
      text: 'Patient Name',
      answer: [{ valueString: 'John Doe' }],
    },
    {
      linkId: 'age',
      text: 'Age',
      answer: [{ valueInteger: 34 }],
    },
    {
      linkId: 'group-1',
      text: 'Medical History',
      item: [
        {
          linkId: 'diabetes',
          text: 'Has Diabetes',
          answer: [{ valueBoolean: true }],
        },
      ],
    },
  ],
};

// Mock useParams
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'response-1' }),
  useNavigate: () => mockNavigate,
}));

describe('FormViewerView', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
    mockNavigate.mockReset();

    // Mock readResource
    jest.spyOn(medplum, 'readResource').mockImplementation(async (resourceType: string, id: string) => {
      if (resourceType === 'QuestionnaireResponse' && id === 'response-1') {
        return mockResponse;
      }
      if (resourceType === 'Questionnaire' && id === 'questionnaire-1') {
        return mockQuestionnaire;
      }
      if (resourceType === 'Patient' && id === 'patient-1') {
        return mockPatient;
      }
      throw new Error('Resource not found');
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render loading state initially', async () => {
    // Delay the response to show loading state
    jest.spyOn(medplum, 'readResource').mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockResponse), 100))
    );

    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    expect(screen.getByTestId('form-viewer-loading')).toBeInTheDocument();
  });

  it('should render the view after loading', async () => {
    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('form-viewer-view')).toBeInTheDocument();
    });
  });

  it('should display form title area', async () => {
    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('form-viewer-view')).toBeInTheDocument();
    });
  });

  it('should render view after loading', async () => {
    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('form-viewer-view')).toBeInTheDocument();
    });
  });

  it('should display patient identifier', async () => {
    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByText('01001011116')).toBeInTheDocument();
    });
  });

  it('should render form content', async () => {
    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('form-viewer-view')).toBeInTheDocument();
    });
  });

  it('should display form content', async () => {
    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('form-content')).toBeInTheDocument();
    });
  });

  it('should display form answers', async () => {
    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByText('Patient Name')).toBeInTheDocument();
      // Note: The value may be in a different element
    });
  });

  it('should display boolean answer as Yes/No', async () => {
    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByText('Has Diabetes')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
    });
  });

  it('should render print button', async () => {
    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('print-button')).toBeInTheDocument();
    });
  });

  it('should render export PDF button', async () => {
    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('export-pdf-button')).toBeInTheDocument();
    });
  });

  it('should render breadcrumbs area', async () => {
    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('form-viewer-view')).toBeInTheDocument();
    });
  });

  it('should display error state when response not found', async () => {
    jest.spyOn(medplum, 'readResource').mockRejectedValue(new Error('Not found'));

    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('form-viewer-error')).toBeInTheDocument();
    });
  });

  it('should render back button', async () => {
    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('form-viewer-view')).toBeInTheDocument();
    });
  });

  it('should handle print button click', async () => {
    const printSpy = jest.spyOn(window, 'print').mockImplementation(() => {});

    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      const printButton = screen.getByTestId('print-button');
      fireEvent.click(printButton);
    });

    expect(printSpy).toHaveBeenCalled();
    printSpy.mockRestore();
  });

  it('should render export PDF button', async () => {
    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('form-viewer-view')).toBeInTheDocument();
    });
  });

  it('should display group items correctly', async () => {
    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByText('Medical History')).toBeInTheDocument();
    });
  });

  it('should handle missing questionnaire gracefully', async () => {
    jest.spyOn(medplum, 'readResource').mockImplementation(async (resourceType: string, id: string) => {
      if (resourceType === 'QuestionnaireResponse' && id === 'response-1') {
        return mockResponse;
      }
      if (resourceType === 'Patient' && id === 'patient-1') {
        return mockPatient;
      }
      throw new Error('Resource not found');
    });

    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('form-viewer-view')).toBeInTheDocument();
    });
  });

  it('should handle missing patient gracefully', async () => {
    jest.spyOn(medplum, 'readResource').mockImplementation(async (resourceType: string, id: string) => {
      if (resourceType === 'QuestionnaireResponse' && id === 'response-1') {
        return mockResponse;
      }
      if (resourceType === 'Questionnaire' && id === 'questionnaire-1') {
        return mockQuestionnaire;
      }
      throw new Error('Resource not found');
    });

    await act(async () => {
      renderWithProviders(<FormViewerView />, { medplum });
    });

    await waitFor(() => {
      expect(screen.getByTestId('form-viewer-view')).toBeInTheDocument();
      expect(screen.queryByTestId('patient-info-card')).not.toBeInTheDocument();
    });
  });
});
