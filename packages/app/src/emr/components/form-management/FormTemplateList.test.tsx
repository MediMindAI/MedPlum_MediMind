// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderWithProviders, screen, fireEvent, waitFor } from '../../test-utils';
import { FormTemplateList } from './FormTemplateList';
import type { Questionnaire } from '@medplum/fhirtypes';

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
    description: 'Patient medical history questionnaire',
    status: 'draft',
    version: '1.0',
    meta: { lastUpdated: '2025-11-19T09:00:00Z' },
  },
  {
    resourceType: 'Questionnaire',
    id: 'q-3',
    title: 'Archived Form',
    description: 'Old form',
    status: 'retired',
    version: '3.0',
    meta: { lastUpdated: '2025-11-18T08:00:00Z' },
  },
];

describe('FormTemplateList', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  describe('Basic Rendering', () => {
    it('renders table with questionnaires', () => {
      renderWithProviders(<FormTemplateList questionnaires={mockQuestionnaires} />);
      expect(screen.getByTestId('form-template-table')).toBeInTheDocument();
    });

    it('renders all column headers', () => {
      renderWithProviders(<FormTemplateList questionnaires={mockQuestionnaires} />, {
        initialLanguage: 'en',
      });

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Version')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Last Modified')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders questionnaire titles', () => {
      renderWithProviders(<FormTemplateList questionnaires={mockQuestionnaires} />);
      expect(screen.getByText('Patient Consent Form')).toBeInTheDocument();
      expect(screen.getByText('Medical History Form')).toBeInTheDocument();
    });

    it('renders version badges', () => {
      renderWithProviders(<FormTemplateList questionnaires={mockQuestionnaires} />);
      expect(screen.getByText('v2.0')).toBeInTheDocument();
      expect(screen.getByText('v1.0')).toBeInTheDocument();
    });

    it('renders status badges', () => {
      renderWithProviders(<FormTemplateList questionnaires={mockQuestionnaires} showArchived />, {
        initialLanguage: 'en',
      });
      // Use getAllByText because status options may also appear in the filter dropdown
      expect(screen.getAllByText('Active').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Draft').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Archived').length).toBeGreaterThan(0);
    });

    it('shows loading skeleton when loading', () => {
      renderWithProviders(<FormTemplateList questionnaires={[]} loading />);
      // Should show skeleton elements
      expect(screen.queryByTestId('form-template-table')).not.toBeInTheDocument();
    });

    it('shows empty state when no questionnaires', () => {
      renderWithProviders(<FormTemplateList questionnaires={[]} />, {
        initialLanguage: 'en',
      });
      expect(screen.getByText('No form templates found')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('filters archived forms by default', () => {
      renderWithProviders(<FormTemplateList questionnaires={mockQuestionnaires} />);
      expect(screen.queryByText('Archived Form')).not.toBeInTheDocument();
    });

    it('shows archived forms when showArchived is true', () => {
      renderWithProviders(<FormTemplateList questionnaires={mockQuestionnaires} showArchived />);
      expect(screen.getByText('Archived Form')).toBeInTheDocument();
    });

    it('filters by search query', async () => {
      renderWithProviders(<FormTemplateList questionnaires={mockQuestionnaires} />);

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Medical' } });

      // Wait for debounce
      await waitFor(
        () => {
          expect(screen.queryByText('Patient Consent Form')).not.toBeInTheDocument();
          expect(screen.getByText('Medical History Form')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('renders status filter component', async () => {
      // Note: Testing Mantine Select dropdown interactions is complex
      // This test verifies the status filter component renders correctly
      renderWithProviders(<FormTemplateList questionnaires={mockQuestionnaires} />, {
        initialLanguage: 'en',
      });

      // Verify status filter exists
      const statusFilter = screen.getByTestId('status-filter');
      expect(statusFilter).toBeInTheDocument();
    });

    it('shows results count', () => {
      renderWithProviders(<FormTemplateList questionnaires={mockQuestionnaires} />, {
        initialLanguage: 'en',
      });
      // 2 forms (active + draft, excluding archived)
      expect(screen.getByText('2 form(s) found')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('calls onEdit when edit button is clicked', () => {
      const onEdit = jest.fn();
      renderWithProviders(<FormTemplateList questionnaires={mockQuestionnaires} onEdit={onEdit} />);

      fireEvent.click(screen.getByTestId('edit-btn-q-1'));
      expect(onEdit).toHaveBeenCalledWith('q-1');
    });

    it('calls onClone when clone button is clicked', () => {
      const onClone = jest.fn();
      renderWithProviders(<FormTemplateList questionnaires={mockQuestionnaires} onClone={onClone} />);

      fireEvent.click(screen.getByTestId('clone-btn-q-1'));
      expect(onClone).toHaveBeenCalledWith('q-1');
    });

    it('calls onArchive when archive button is clicked', () => {
      const onArchive = jest.fn();
      renderWithProviders(<FormTemplateList questionnaires={mockQuestionnaires} onArchive={onArchive} />);

      fireEvent.click(screen.getByTestId('archive-btn-q-1'));
      expect(onArchive).toHaveBeenCalledWith('q-1');
    });

    it('calls onViewHistory when history button is clicked', () => {
      const onViewHistory = jest.fn();
      renderWithProviders(
        <FormTemplateList questionnaires={mockQuestionnaires} onViewHistory={onViewHistory} />
      );

      fireEvent.click(screen.getByTestId('history-btn-q-1'));
      expect(onViewHistory).toHaveBeenCalledWith('q-1');
    });

    it('calls onRowClick when row is clicked', () => {
      const onRowClick = jest.fn();
      renderWithProviders(
        <FormTemplateList questionnaires={mockQuestionnaires} onRowClick={onRowClick} />
      );

      fireEvent.click(screen.getByTestId('row-q-1'));
      expect(onRowClick).toHaveBeenCalledWith('q-1');
    });

    it('shows restore button for archived questionnaire', () => {
      const onRestore = jest.fn();
      renderWithProviders(
        <FormTemplateList questionnaires={mockQuestionnaires} showArchived onRestore={onRestore} />
      );

      fireEvent.click(screen.getByTestId('restore-btn-q-3'));
      expect(onRestore).toHaveBeenCalledWith('q-3');
    });
  });

  describe('Multilingual Support', () => {
    it('renders with Georgian translations', () => {
      renderWithProviders(<FormTemplateList questionnaires={mockQuestionnaires} />, {
        initialLanguage: 'ka',
      });
      expect(screen.getByText('სახელი')).toBeInTheDocument();
      expect(screen.getByText('აღწერა')).toBeInTheDocument();
    });

    it('renders with Russian translations', () => {
      renderWithProviders(<FormTemplateList questionnaires={mockQuestionnaires} />, {
        initialLanguage: 'ru',
      });
      expect(screen.getByText('Название')).toBeInTheDocument();
      expect(screen.getByText('Описание')).toBeInTheDocument();
    });
  });
});
