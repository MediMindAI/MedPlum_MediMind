// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import { FormEditView } from './FormEditView';
import { MockClient } from '@medplum/mock';
import type { Questionnaire } from '@medplum/fhirtypes';

// Mock questionnaire for testing
const mockQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'q-test-1',
  title: 'Patient Consent Form',
  description: 'Standard consent form for patients',
  status: 'active',
  version: '2.0',
  meta: { lastUpdated: '2025-11-20T10:00:00Z', versionId: '2' },
  item: [
    {
      linkId: 'field-1',
      text: 'Patient Name',
      type: 'string',
      required: true,
    },
    {
      linkId: 'field-2',
      text: 'Date of Birth',
      type: 'date',
      required: false,
    },
  ],
};

// Mock navigate and useParams
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'q-test-1' }),
}));

describe('FormEditView', () => {
  let medplum: MockClient;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
    mockNavigate.mockClear();
    medplum = new MockClient();

    // Mock readResource to return the questionnaire
    jest.spyOn(medplum, 'readResource').mockResolvedValue(mockQuestionnaire);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('shows loading skeleton initially', () => {
      renderWithProviders(<FormEditView />, { medplum });
      expect(screen.getByTestId('form-edit-view-loading')).toBeInTheDocument();
    });
  });

  describe('Loaded State', () => {
    it('renders the edit view after loading', async () => {
      renderWithProviders(<FormEditView />, { medplum });

      await waitFor(() => {
        expect(screen.getByTestId('form-edit-view')).toBeInTheDocument();
      });
    });

    it('displays form title', async () => {
      renderWithProviders(<FormEditView />, { medplum });

      await waitFor(() => {
        const titleInput = screen.getByLabelText('Form Title');
        expect(titleInput).toHaveValue('Patient Consent Form');
      });
    });

    it('displays form description', async () => {
      renderWithProviders(<FormEditView />, { medplum });

      await waitFor(() => {
        const descInput = screen.getByLabelText('Description');
        expect(descInput).toHaveValue('Standard consent form for patients');
      });
    });

    it('displays version badge', async () => {
      renderWithProviders(<FormEditView />, { medplum });

      await waitFor(() => {
        expect(screen.getByText('v2.0')).toBeInTheDocument();
      });
    });

    it('displays status badge', async () => {
      renderWithProviders(<FormEditView />, { medplum });

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });

    it('displays questionnaire ID', async () => {
      renderWithProviders(<FormEditView />, { medplum });

      await waitFor(() => {
        expect(screen.getByText(/ID: q-test-1/)).toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('shows error when questionnaire not found', async () => {
      jest.spyOn(medplum, 'readResource').mockRejectedValue(new Error('Not found'));

      renderWithProviders(<FormEditView />, { medplum, initialLanguage: 'en' });

      await waitFor(() => {
        expect(screen.getByTestId('form-edit-view-error')).toBeInTheDocument();
      });
    });

    it('displays error message', async () => {
      jest.spyOn(medplum, 'readResource').mockRejectedValue(new Error('Resource not found'));

      renderWithProviders(<FormEditView />, { medplum });

      await waitFor(() => {
        expect(screen.getByText('Resource not found')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates back when cancel button is clicked', async () => {
      // Mock window.confirm to return true
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithProviders(<FormEditView />, { medplum, initialLanguage: 'en' });

      await waitFor(() => {
        expect(screen.getByTestId('form-edit-view')).toBeInTheDocument();
      });

      const cancelBtn = screen.getByText('Cancel');
      fireEvent.click(cancelBtn);

      expect(mockNavigate).toHaveBeenCalledWith('/emr/forms');
    });
  });

  describe('Undo/Redo', () => {
    it('renders undo button', async () => {
      renderWithProviders(<FormEditView />, { medplum });

      await waitFor(() => {
        expect(screen.getByText('Undo')).toBeInTheDocument();
      });
    });

    it('renders redo button', async () => {
      renderWithProviders(<FormEditView />, { medplum });

      await waitFor(() => {
        expect(screen.getByText('Redo')).toBeInTheDocument();
      });
    });

    it('disables undo button when no history', async () => {
      renderWithProviders(<FormEditView />, { medplum });

      await waitFor(() => {
        const undoBtn = screen.getByText('Undo').closest('button');
        expect(undoBtn).toBeDisabled();
      });
    });
  });

  describe('Save', () => {
    it('renders save button', async () => {
      renderWithProviders(<FormEditView />, { medplum, initialLanguage: 'en' });

      await waitFor(() => {
        expect(screen.getByText('Save')).toBeInTheDocument();
      });
    });

    it('calls update when save is clicked', async () => {
      const updateSpy = jest.spyOn(medplum, 'updateResource').mockResolvedValue({
        ...mockQuestionnaire,
        version: '2.1',
      });

      renderWithProviders(<FormEditView />, { medplum, initialLanguage: 'en' });

      await waitFor(() => {
        expect(screen.getByTestId('form-edit-view')).toBeInTheDocument();
      });

      const saveBtn = screen.getByText('Save');
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Form Editing', () => {
    it('allows editing title', async () => {
      renderWithProviders(<FormEditView />, { medplum });

      await waitFor(() => {
        expect(screen.getByTestId('form-edit-view')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText('Form Title');
      fireEvent.change(titleInput, { target: { value: 'Updated Form Title' } });

      expect(titleInput).toHaveValue('Updated Form Title');
    });

    it('allows editing description', async () => {
      renderWithProviders(<FormEditView />, { medplum });

      await waitFor(() => {
        expect(screen.getByTestId('form-edit-view')).toBeInTheDocument();
      });

      const descInput = screen.getByLabelText('Description');
      fireEvent.change(descInput, { target: { value: 'Updated description' } });

      expect(descInput).toHaveValue('Updated description');
    });
  });

  describe('Multilingual Support', () => {
    it('renders with Georgian translations', async () => {
      renderWithProviders(<FormEditView />, { medplum, initialLanguage: 'ka' });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('form-edit-view')).toBeInTheDocument();
      }, { timeout: 3000 });

      // The Save button should have Georgian text
      expect(screen.getByText('შენახვა')).toBeInTheDocument();
    });

    it('renders with Russian translations', async () => {
      renderWithProviders(<FormEditView />, { medplum, initialLanguage: 'ru' });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('form-edit-view')).toBeInTheDocument();
      }, { timeout: 3000 });

      // The Save button should have Russian text
      expect(screen.getByText('Сохранить')).toBeInTheDocument();
    });
  });
});
