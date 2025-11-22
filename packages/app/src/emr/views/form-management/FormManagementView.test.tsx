// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import { FormManagementView } from './FormManagementView';
import { MockClient } from '@medplum/mock';
import type { Questionnaire } from '@medplum/fhirtypes';

// Mock questionnaires for testing
const mockQuestionnaires: Questionnaire[] = [
  {
    resourceType: 'Questionnaire',
    id: 'q-1',
    title: 'Patient Consent Form',
    description: 'Standard consent form',
    status: 'active',
    version: '2.0',
    meta: { lastUpdated: '2025-11-20T10:00:00Z' },
  },
  {
    resourceType: 'Questionnaire',
    id: 'q-2',
    title: 'Medical History Form',
    description: 'Patient medical history',
    status: 'draft',
    version: '1.0',
    meta: { lastUpdated: '2025-11-19T09:00:00Z' },
  },
];

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('FormManagementView', () => {
  let medplum: MockClient;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
    mockNavigate.mockClear();
    medplum = new MockClient();

    // Mock searchResources to return questionnaires
    jest.spyOn(medplum, 'searchResources').mockResolvedValue(mockQuestionnaires);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the view container', async () => {
      renderWithProviders(<FormManagementView />, { medplum });

      await waitFor(() => {
        expect(screen.getByTestId('form-management-view')).toBeInTheDocument();
      });
    });

    it('renders page title', async () => {
      renderWithProviders(<FormManagementView />, { medplum, initialLanguage: 'en' });

      await waitFor(() => {
        expect(screen.getByText('Form Templates')).toBeInTheDocument();
      });
    });

    it('renders create new button', async () => {
      renderWithProviders(<FormManagementView />, { medplum, initialLanguage: 'en' });

      await waitFor(() => {
        expect(screen.getByTestId('create-new-btn')).toBeInTheDocument();
      });
    });

    it('renders view mode toggle', async () => {
      renderWithProviders(<FormManagementView />, { medplum });

      await waitFor(() => {
        expect(screen.getByTestId('view-mode-toggle')).toBeInTheDocument();
      });
    });

    it('renders show archived toggle', async () => {
      renderWithProviders(<FormManagementView />, { medplum });

      await waitFor(() => {
        expect(screen.getByTestId('show-archived-toggle')).toBeInTheDocument();
      });
    });
  });

  describe('View Modes', () => {
    it('renders table view by default', async () => {
      renderWithProviders(<FormManagementView />, { medplum });

      await waitFor(() => {
        expect(screen.getByTestId('form-template-table')).toBeInTheDocument();
      });
    });

    it('switches to card view when toggled', async () => {
      renderWithProviders(<FormManagementView />, { medplum, initialLanguage: 'en' });

      await waitFor(() => {
        expect(screen.getByTestId('form-template-table')).toBeInTheDocument();
      });

      // Click on card view option
      const cardViewBtn = screen.getByText('Card View');
      fireEvent.click(cardViewBtn);

      await waitFor(() => {
        expect(screen.getByTestId('cards-container')).toBeInTheDocument();
        expect(screen.queryByTestId('form-template-table')).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to form builder when create new is clicked', async () => {
      renderWithProviders(<FormManagementView />, { medplum });

      await waitFor(() => {
        expect(screen.getByTestId('create-new-btn')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('create-new-btn'));
      expect(mockNavigate).toHaveBeenCalledWith('/emr/forms/builder');
    });

    it('navigates to form edit when row is clicked', async () => {
      renderWithProviders(<FormManagementView />, { medplum });

      await waitFor(() => {
        expect(screen.getByTestId('row-q-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('row-q-1'));
      expect(mockNavigate).toHaveBeenCalledWith('/emr/forms/edit/q-1');
    });

    it('navigates to form edit when edit button is clicked', async () => {
      renderWithProviders(<FormManagementView />, { medplum });

      await waitFor(() => {
        expect(screen.getByTestId('edit-btn-q-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('edit-btn-q-1'));
      expect(mockNavigate).toHaveBeenCalledWith('/emr/forms/edit/q-1');
    });
  });

  describe('Clone Modal', () => {
    it('opens clone modal when clone button is clicked', async () => {
      renderWithProviders(<FormManagementView />, { medplum });

      await waitFor(() => {
        expect(screen.getByTestId('clone-btn-q-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('clone-btn-q-1'));

      await waitFor(() => {
        expect(screen.getByTestId('clone-modal')).toBeInTheDocument();
      });
    });

    it('pre-fills original title in clone modal', async () => {
      renderWithProviders(<FormManagementView />, { medplum, initialLanguage: 'en' });

      await waitFor(() => {
        expect(screen.getByTestId('clone-btn-q-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('clone-btn-q-1'));

      await waitFor(() => {
        const input = screen.getByTestId('clone-title-input');
        expect(input).toHaveValue('Patient Consent Form (Copy)');
      });
    });
  });

  describe('Version History Modal', () => {
    it('opens version history modal when history button is clicked', async () => {
      // Mock readHistory
      jest.spyOn(medplum, 'readHistory').mockResolvedValue({
        resourceType: 'Bundle',
        type: 'history',
        entry: [
          {
            resource: mockQuestionnaires[0],
          },
        ],
      });

      renderWithProviders(<FormManagementView />, { medplum });

      await waitFor(() => {
        expect(screen.getByTestId('history-btn-q-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('history-btn-q-1'));

      await waitFor(() => {
        expect(screen.getByTestId('version-history-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Archive/Restore', () => {
    it('calls archive when archive button is clicked', async () => {
      const updateSpy = jest.spyOn(medplum, 'updateResource').mockResolvedValue({
        ...mockQuestionnaires[0],
        status: 'retired',
      });

      renderWithProviders(<FormManagementView />, { medplum });

      await waitFor(() => {
        expect(screen.getByTestId('archive-btn-q-1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('archive-btn-q-1'));

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Multilingual Support', () => {
    it('renders with Georgian translations', async () => {
      renderWithProviders(<FormManagementView />, { medplum, initialLanguage: 'ka' });

      await waitFor(() => {
        expect(screen.getByText('ფორმის შაბლონები')).toBeInTheDocument();
      });
    });

    it('renders with Russian translations', async () => {
      renderWithProviders(<FormManagementView />, { medplum, initialLanguage: 'ru' });

      await waitFor(() => {
        expect(screen.getByText('Шаблоны форм')).toBeInTheDocument();
      });
    });
  });
});
