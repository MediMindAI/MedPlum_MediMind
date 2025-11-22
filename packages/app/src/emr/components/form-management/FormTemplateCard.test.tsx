// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderWithProviders, screen, fireEvent } from '../../test-utils';
import { FormTemplateCard } from './FormTemplateCard';
import type { Questionnaire } from '@medplum/fhirtypes';

const mockQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'test-q-1',
  title: 'Patient Consent Form',
  description: 'Standard consent form for patients',
  status: 'active',
  version: '2.1',
  meta: {
    lastUpdated: '2025-11-20T10:30:00Z',
  },
};

const mockDraftQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'test-q-2',
  title: 'Draft Form',
  status: 'draft',
  version: '1.0',
};

const mockArchivedQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'test-q-3',
  title: 'Archived Form',
  status: 'retired',
  version: '3.0',
};

describe('FormTemplateCard', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  it('renders questionnaire title', () => {
    renderWithProviders(<FormTemplateCard questionnaire={mockQuestionnaire} />);
    expect(screen.getByText('Patient Consent Form')).toBeInTheDocument();
  });

  it('renders questionnaire description', () => {
    renderWithProviders(<FormTemplateCard questionnaire={mockQuestionnaire} />);
    expect(screen.getByText('Standard consent form for patients')).toBeInTheDocument();
  });

  it('renders version badge', () => {
    renderWithProviders(<FormTemplateCard questionnaire={mockQuestionnaire} />);
    expect(screen.getByText('v2.1')).toBeInTheDocument();
  });

  it('renders active status badge', () => {
    renderWithProviders(<FormTemplateCard questionnaire={mockQuestionnaire} />, {
      initialLanguage: 'en',
    });
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders draft status badge', () => {
    renderWithProviders(<FormTemplateCard questionnaire={mockDraftQuestionnaire} />, {
      initialLanguage: 'en',
    });
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders archived status badge', () => {
    renderWithProviders(<FormTemplateCard questionnaire={mockArchivedQuestionnaire} />, {
      initialLanguage: 'en',
    });
    expect(screen.getByText('Archived')).toBeInTheDocument();
  });

  it('renders last modified date', () => {
    renderWithProviders(<FormTemplateCard questionnaire={mockQuestionnaire} />, {
      initialLanguage: 'en',
    });
    // Date format may vary based on locale
    expect(screen.getByText(/Nov.*2025/)).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    renderWithProviders(<FormTemplateCard questionnaire={mockQuestionnaire} onEdit={onEdit} />);

    fireEvent.click(screen.getByTestId('edit-btn-test-q-1'));
    expect(onEdit).toHaveBeenCalledWith('test-q-1');
  });

  it('calls onClone when clone button is clicked', () => {
    const onClone = jest.fn();
    renderWithProviders(<FormTemplateCard questionnaire={mockQuestionnaire} onClone={onClone} />);

    fireEvent.click(screen.getByTestId('clone-btn-test-q-1'));
    expect(onClone).toHaveBeenCalledWith('test-q-1');
  });

  it('calls onArchive when archive button is clicked', () => {
    const onArchive = jest.fn();
    renderWithProviders(<FormTemplateCard questionnaire={mockQuestionnaire} onArchive={onArchive} />);

    fireEvent.click(screen.getByTestId('archive-btn-test-q-1'));
    expect(onArchive).toHaveBeenCalledWith('test-q-1');
  });

  it('calls onViewHistory when history button is clicked', () => {
    const onViewHistory = jest.fn();
    renderWithProviders(<FormTemplateCard questionnaire={mockQuestionnaire} onViewHistory={onViewHistory} />);

    fireEvent.click(screen.getByTestId('history-btn-test-q-1'));
    expect(onViewHistory).toHaveBeenCalledWith('test-q-1');
  });

  it('calls onClick when card is clicked', () => {
    const onClick = jest.fn();
    renderWithProviders(<FormTemplateCard questionnaire={mockQuestionnaire} onClick={onClick} />);

    fireEvent.click(screen.getByTestId('form-card-test-q-1'));
    expect(onClick).toHaveBeenCalledWith('test-q-1');
  });

  it('shows restore button for archived questionnaire', () => {
    const onRestore = jest.fn();
    renderWithProviders(
      <FormTemplateCard questionnaire={mockArchivedQuestionnaire} onRestore={onRestore} />
    );

    expect(screen.getByTestId('restore-btn-test-q-3')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('restore-btn-test-q-3'));
    expect(onRestore).toHaveBeenCalledWith('test-q-3');
  });

  it('does not show archive button for archived questionnaire when onRestore is provided', () => {
    const onArchive = jest.fn();
    const onRestore = jest.fn();
    renderWithProviders(
      <FormTemplateCard
        questionnaire={mockArchivedQuestionnaire}
        onArchive={onArchive}
        onRestore={onRestore}
      />
    );

    // When both onArchive and onRestore are provided, archived forms should show restore, not archive
    expect(screen.queryByTestId('archive-btn-test-q-3')).not.toBeInTheDocument();
    expect(screen.getByTestId('restore-btn-test-q-3')).toBeInTheDocument();
  });

  it('applies reduced opacity to archived card', () => {
    renderWithProviders(<FormTemplateCard questionnaire={mockArchivedQuestionnaire} />);
    const card = screen.getByTestId('form-card-test-q-3');
    expect(card).toHaveStyle('opacity: 0.7');
  });

  it('renders with Georgian translations', () => {
    renderWithProviders(<FormTemplateCard questionnaire={mockQuestionnaire} />, {
      initialLanguage: 'ka',
    });
    expect(screen.getByText('აქტიური')).toBeInTheDocument();
  });

  it('renders with Russian translations', () => {
    renderWithProviders(<FormTemplateCard questionnaire={mockQuestionnaire} />, {
      initialLanguage: 'ru',
    });
    expect(screen.getByText('Активный')).toBeInTheDocument();
  });
});
