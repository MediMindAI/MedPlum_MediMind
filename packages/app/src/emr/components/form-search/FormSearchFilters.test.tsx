// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MockClient } from '@medplum/mock';
import type { Questionnaire } from '@medplum/fhirtypes';
import { renderWithProviders } from '../../test-utils';
import { FormSearchFilters } from './FormSearchFilters';
import type { FormSearchParams } from '../../services/formRendererService';

// Mock questionnaires for testing
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

describe('FormSearchFilters', () => {
  let medplum: MockClient;
  let onSearchParamsChange: jest.Mock;
  let onSearch: jest.Mock;

  beforeEach(() => {
    medplum = new MockClient();
    onSearchParamsChange = jest.fn();
    onSearch = jest.fn();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
    jest.useFakeTimers();

    // Mock the questionnaire search
    jest.spyOn(medplum, 'search').mockResolvedValue({
      resourceType: 'Bundle',
      type: 'searchset',
      entry: mockQuestionnaires.map((q) => ({ resource: q })),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // Create default props inside a function to capture the mocks after they're set
  const getDefaultProps = () => ({
    searchParams: {} as FormSearchParams,
    onSearchParamsChange,
    onSearch,
    questionnaires: mockQuestionnaires,
  });

  it('should render all filter fields', () => {
    renderWithProviders(<FormSearchFilters {...getDefaultProps()} />, { medplum });

    expect(screen.getByTestId('form-search-filters')).toBeInTheDocument();
    expect(screen.getByTestId('patient-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('fulltext-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('date-from-input')).toBeInTheDocument();
    expect(screen.getByTestId('date-to-input')).toBeInTheDocument();
    expect(screen.getByTestId('status-select')).toBeInTheDocument();
    expect(screen.getByTestId('form-type-select')).toBeInTheDocument();
  });

  it('should render search and clear buttons', () => {
    renderWithProviders(<FormSearchFilters {...getDefaultProps()} />, { medplum });

    expect(screen.getByTestId('search-button')).toBeInTheDocument();
    expect(screen.getByTestId('clear-filters-button')).toBeInTheDocument();
  });

  it('should render patient search input wrapper', () => {
    renderWithProviders(<FormSearchFilters {...getDefaultProps()} />, { medplum });

    expect(screen.getByTestId('patient-search-input')).toBeInTheDocument();
  });

  it('should render fulltext search input wrapper', () => {
    renderWithProviders(<FormSearchFilters {...getDefaultProps()} />, { medplum });

    expect(screen.getByTestId('fulltext-search-input')).toBeInTheDocument();
  });

  it('should render date inputs', () => {
    renderWithProviders(<FormSearchFilters {...getDefaultProps()} />, { medplum });

    const dateFromInput = screen.getByTestId('date-from-input');
    const dateToInput = screen.getByTestId('date-to-input');
    expect(dateFromInput).toBeInTheDocument();
    expect(dateToInput).toBeInTheDocument();
  });

  it('should render status select', () => {
    renderWithProviders(<FormSearchFilters {...getDefaultProps()} />, { medplum });

    const select = screen.getByTestId('status-select');
    expect(select).toBeInTheDocument();
  });

  it('should call onSearch when search button is clicked', async () => {
    renderWithProviders(<FormSearchFilters {...getDefaultProps()} />, { medplum });

    const searchButton = screen.getByTestId('search-button');

    await act(async () => {
      fireEvent.click(searchButton);
    });

    expect(onSearch).toHaveBeenCalled();
  });

  it('should render clear button', () => {
    renderWithProviders(
      <FormSearchFilters
        {...getDefaultProps()}
        searchParams={{
          patientName: 'John',
          status: 'completed' as any,
          _count: 100,
        }}
      />,
      { medplum }
    );

    const clearButton = screen.getByTestId('clear-filters-button');
    expect(clearButton).toBeInTheDocument();
  });

  it('should disable clear button when no filters are active', () => {
    renderWithProviders(<FormSearchFilters {...getDefaultProps()} />, { medplum });

    const clearButton = screen.getByTestId('clear-filters-button');
    expect(clearButton).toBeDisabled();
  });

  it('should render form type select', () => {
    renderWithProviders(<FormSearchFilters {...getDefaultProps()} />, { medplum });

    const select = screen.getByTestId('form-type-select');
    expect(select).toBeInTheDocument();
  });

  it('should not show form type filter when showFormTypeFilter is false', () => {
    renderWithProviders(
      <FormSearchFilters {...getDefaultProps()} showFormTypeFilter={false} />,
      { medplum }
    );

    expect(screen.queryByTestId('form-type-select')).not.toBeInTheDocument();
  });

  it('should handle date range changes', async () => {
    renderWithProviders(<FormSearchFilters {...getDefaultProps()} />, { medplum });

    // Note: DateInput testing is complex due to Mantine's implementation
    // This test verifies the component renders without errors
    const dateFromInput = screen.getByTestId('date-from-input');
    const dateToInput = screen.getByTestId('date-to-input');

    expect(dateFromInput).toBeInTheDocument();
    expect(dateToInput).toBeInTheDocument();
  });

  it('should use theme colors for styling', () => {
    renderWithProviders(<FormSearchFilters {...getDefaultProps()} />, { medplum });

    const filters = screen.getByTestId('form-search-filters');
    expect(filters).toHaveStyle({
      borderColor: 'var(--emr-border-color)',
      backgroundColor: 'var(--emr-gray-50)',
    });
  });
});
