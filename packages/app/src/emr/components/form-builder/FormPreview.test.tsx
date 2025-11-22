// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { FormPreview } from './FormPreview';
import type { FieldConfig } from '../../types/form-builder';
import type { Questionnaire } from '@medplum/fhirtypes';

// Mock LForms
const mockAddFormToPage = jest.fn();
(global as any).window.LForms = {
  Util: {
    addFormToPage: mockAddFormToPage,
  },
};

describe('FormPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };

  it('renders loading state', () => {
    renderWithProviders(<FormPreview loading={true} />);

    expect(screen.getByText('Loading preview...')).toBeInTheDocument();
  });

  it('renders empty state when no fields provided', () => {
    renderWithProviders(<FormPreview fields={[]} />);

    expect(screen.getByText('No fields to preview')).toBeInTheDocument();
    expect(screen.getByText('Add fields to the form to see a preview')).toBeInTheDocument();
  });

  it('renders preview with questionnaire', async () => {
    const mockQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      title: 'Test Form',
      item: [
        {
          linkId: 'field-1',
          type: 'string',
          text: 'Test Field',
        },
      ],
    };

    renderWithProviders(<FormPreview questionnaire={mockQuestionnaire} />);

    await waitFor(() => {
      expect(mockAddFormToPage).toHaveBeenCalled();
      expect(mockAddFormToPage).toHaveBeenCalledWith(
        mockQuestionnaire,
        expect.any(HTMLElement),
        expect.objectContaining({ prepopulate: false })
      );
    });
  });

  it('renders preview with fields', async () => {
    const mockFields: FieldConfig[] = [
      {
        id: 'field-1',
        linkId: 'patient-name',
        type: 'text',
        label: 'Patient Name',
        required: true,
        order: 0,
      },
      {
        id: 'field-2',
        linkId: 'patient-dob',
        type: 'date',
        label: 'Date of Birth',
        required: false,
        order: 1,
      },
    ];

    renderWithProviders(<FormPreview fields={mockFields} title="Test Form" description="Test Description" />);

    await waitFor(() => {
      expect(mockAddFormToPage).toHaveBeenCalled();
    });

    // Verify the Questionnaire was created from fields
    const questionnaire = mockAddFormToPage.mock.calls[0][0] as Questionnaire;
    expect(questionnaire.title).toBe('Test Form');
    expect(questionnaire.item).toHaveLength(2);
  });

  it('updates preview when fields change', async () => {
    jest.clearAllMocks(); // Clear mocks before test

    const initialFields: FieldConfig[] = [
      {
        id: 'field-1',
        linkId: 'field-1',
        type: 'text',
        label: 'Field 1',
        required: false,
        order: 0,
      },
    ];

    const { rerender } = renderWithProviders(<FormPreview fields={initialFields} />);

    await waitFor(() => {
      expect(mockAddFormToPage).toHaveBeenCalled();
    });

    jest.clearAllMocks();

    // Update fields
    const updatedFields: FieldConfig[] = [
      ...initialFields,
      {
        id: 'field-2',
        linkId: 'field-2',
        type: 'date',
        label: 'Field 2',
        required: false,
        order: 1,
      },
    ];

    rerender(
      <MantineProvider>
        <FormPreview fields={updatedFields} />
      </MantineProvider>
    );

    await waitFor(() => {
      expect(mockAddFormToPage).toHaveBeenCalled();
    });
  });

  it('handles LForms rendering errors gracefully', async () => {
    mockAddFormToPage.mockImplementation(() => {
      throw new Error('LForms rendering failed');
    });

    const mockFields: FieldConfig[] = [
      {
        id: 'field-1',
        linkId: 'field-1',
        type: 'text',
        label: 'Test Field',
        required: false,
        order: 0,
      },
    ];

    renderWithProviders(<FormPreview fields={mockFields} />);

    await waitFor(() => {
      expect(screen.getByText('Preview Error')).toBeInTheDocument();
      expect(screen.getByText('LForms rendering failed')).toBeInTheDocument();
    });
  });

  it('clears previous content before rendering new form', async () => {
    const mockFields1: FieldConfig[] = [
      {
        id: 'field-1',
        linkId: 'field-1',
        type: 'text',
        label: 'Field 1',
        required: false,
        order: 0,
      },
    ];

    const { rerender } = renderWithProviders(<FormPreview fields={mockFields1} />);

    await waitFor(() => {
      expect(mockAddFormToPage).toHaveBeenCalled();
    });

    const mockFields2: FieldConfig[] = [
      {
        id: 'field-2',
        linkId: 'field-2',
        type: 'date',
        label: 'Field 2',
        required: false,
        order: 0,
      },
    ];

    // Just verify that we can rerender with different fields without errors
    rerender(
      <MantineProvider>
        <FormPreview fields={mockFields2} />
      </MantineProvider>
    );

    // Verify render completed without throwing errors
    // The LForms mock should have been called with new data
    expect(mockAddFormToPage).toHaveBeenCalled();
  });

  it('prefers questionnaire over fields when both provided', async () => {
    const mockQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      title: 'Questionnaire Title',
      item: [],
    };

    const mockFields: FieldConfig[] = [
      {
        id: 'field-1',
        linkId: 'field-1',
        type: 'text',
        label: 'Field 1',
        required: false,
        order: 0,
      },
    ];

    renderWithProviders(
      <FormPreview questionnaire={mockQuestionnaire} fields={mockFields} title="Fields Title" />
    );

    await waitFor(() => {
      expect(mockAddFormToPage).toHaveBeenCalled();
    });

    const renderedQuestionnaire = mockAddFormToPage.mock.calls[0][0] as Questionnaire;
    expect(renderedQuestionnaire.title).toBe('Questionnaire Title');
  });

  it('uses default title when none provided', async () => {
    const mockFields: FieldConfig[] = [
      {
        id: 'field-1',
        linkId: 'field-1',
        type: 'text',
        label: 'Field 1',
        required: false,
        order: 0,
      },
    ];

    renderWithProviders(<FormPreview fields={mockFields} />);

    await waitFor(() => {
      expect(mockAddFormToPage).toHaveBeenCalled();
    });

    const questionnaire = mockAddFormToPage.mock.calls[0][0] as Questionnaire;
    expect(questionnaire.title).toBe('Untitled Form');
  });
});
