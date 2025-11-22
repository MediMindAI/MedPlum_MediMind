// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import type {
  Questionnaire,
  QuestionnaireResponse,
  Patient,
} from '@medplum/fhirtypes';

// Mock @react-pdf/renderer
const mockToBlob = jest.fn();
jest.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: any) => <div>{children}</div>,
  Page: ({ children }: any) => <div>{children}</div>,
  View: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <span>{children}</span>,
  Image: () => <img alt="" />,
  StyleSheet: {
    create: (styles: any) => styles,
  },
  Font: {
    register: jest.fn(),
  },
  pdf: jest.fn(() => ({
    toBlob: mockToBlob,
  })),
}));

// Import after mocking
import { PDFGenerator } from './PDFGenerator';

describe('PDFGenerator', () => {
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'q1',
    status: 'active',
    title: 'Patient Intake Form',
    item: [],
  };

  const mockResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    id: 'qr1',
    status: 'completed',
    questionnaire: 'Questionnaire/q1',
    authored: '2025-01-15T10:30:00Z',
    item: [],
  };

  const mockPatient: Patient = {
    resourceType: 'Patient',
    id: 'p1',
    name: [
      {
        given: ['John'],
        family: 'Doe',
      },
    ],
  };

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <MantineProvider>
        {component}
      </MantineProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');

    // Mock successful blob generation
    mockToBlob.mockResolvedValue(new Blob(['test'], { type: 'application/pdf' }));

    // Mock URL methods
    global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render download button', () => {
    renderWithProviders(
      <PDFGenerator
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
      />
    );

    expect(screen.getByTestId('pdf-download-button')).toBeInTheDocument();
    expect(screen.getByText(/Export PDF/i)).toBeInTheDocument();
  });

  it('should not render preview button by default', () => {
    renderWithProviders(
      <PDFGenerator
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
      />
    );

    expect(screen.queryByTestId('pdf-preview-button')).not.toBeInTheDocument();
  });

  it('should render preview button when showPreviewButton is true', () => {
    renderWithProviders(
      <PDFGenerator
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
        showPreviewButton={true}
      />
    );

    expect(screen.getByTestId('pdf-preview-button')).toBeInTheDocument();
    expect(screen.getByText(/Preview/i)).toBeInTheDocument();
  });

  it('should show loading state when generating PDF', async () => {
    // Make toBlob return a promise that doesn't resolve immediately
    mockToBlob.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(new Blob(['test'])), 100))
    );

    renderWithProviders(
      <PDFGenerator
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
      />
    );

    const downloadButton = screen.getByTestId('pdf-download-button');
    fireEvent.click(downloadButton);

    // Should show generating text
    await waitFor(() => {
      expect(screen.getByText(/Generating/i)).toBeInTheDocument();
    });
  });

  it('should trigger download when button is clicked', async () => {
    // Use a more targeted approach - mock only for 'a' elements
    const mockClick = jest.fn();
    const originalCreateElement = document.createElement.bind(document);

    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: mockClick,
          setAttribute: jest.fn(),
          style: {},
        } as unknown as HTMLElement;
      }
      return originalCreateElement(tagName);
    });

    const originalAppendChild = document.body.appendChild.bind(document.body);
    const originalRemoveChild = document.body.removeChild.bind(document.body);

    jest.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      if ((node as any).download !== undefined) {
        return node;
      }
      return originalAppendChild(node);
    });

    jest.spyOn(document.body, 'removeChild').mockImplementation((node: Node) => {
      if ((node as any).download !== undefined) {
        return node;
      }
      return originalRemoveChild(node);
    });

    renderWithProviders(
      <PDFGenerator
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
      />
    );

    const downloadButton = screen.getByTestId('pdf-download-button');
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled();
    });
  });

  it('should show error alert when PDF generation fails', async () => {
    mockToBlob.mockRejectedValue(new Error('Generation failed'));

    renderWithProviders(
      <PDFGenerator
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
      />
    );

    const downloadButton = screen.getByTestId('pdf-download-button');
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(screen.getByTestId('pdf-error-alert')).toBeInTheDocument();
    });
  });

  it('should disable buttons when disabled prop is true', () => {
    renderWithProviders(
      <PDFGenerator
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
        disabled={true}
        showPreviewButton={true}
      />
    );

    expect(screen.getByTestId('pdf-download-button')).toBeDisabled();
    expect(screen.getByTestId('pdf-preview-button')).toBeDisabled();
  });

  it('should open preview in new tab', async () => {
    const mockOpen = jest.fn(() => ({} as Window));
    jest.spyOn(window, 'open').mockImplementation(mockOpen);

    renderWithProviders(
      <PDFGenerator
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
        showPreviewButton={true}
      />
    );

    const previewButton = screen.getByTestId('pdf-preview-button');
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledWith('blob:test-url', '_blank');
    });
  });

  it('should show error when popup is blocked', async () => {
    jest.spyOn(window, 'open').mockReturnValue(null);

    renderWithProviders(
      <PDFGenerator
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
        showPreviewButton={true}
      />
    );

    const previewButton = screen.getByTestId('pdf-preview-button');
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByTestId('pdf-error-alert')).toBeInTheDocument();
    });
  });

  it('should use different button variants', () => {
    const { rerender } = renderWithProviders(
      <PDFGenerator
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        variant="filled"
      />
    );

    const button = screen.getByTestId('pdf-download-button');
    // Mantine applies variant classes - just verify button renders
    expect(button).toBeInTheDocument();

    rerender(
      <MantineProvider>
        <PDFGenerator
          questionnaire={mockQuestionnaire}
          response={mockResponse}
          variant="light"
        />
      </MantineProvider>
    );

    expect(screen.getByTestId('pdf-download-button')).toBeInTheDocument();
  });

  it('should use different button sizes', () => {
    renderWithProviders(
      <PDFGenerator
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        size="lg"
      />
    );

    const button = screen.getByTestId('pdf-download-button');
    expect(button).toBeInTheDocument();
  });

  it('should handle null questionnaire', async () => {
    renderWithProviders(
      <PDFGenerator
        questionnaire={null}
        response={mockResponse}
        patient={mockPatient}
      />
    );

    const downloadButton = screen.getByTestId('pdf-download-button');
    fireEvent.click(downloadButton);

    // Should not crash and should generate PDF
    await waitFor(() => {
      expect(mockToBlob).toHaveBeenCalled();
    });
  });

  it('should handle null patient', async () => {
    renderWithProviders(
      <PDFGenerator
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={null}
      />
    );

    const downloadButton = screen.getByTestId('pdf-download-button');
    fireEvent.click(downloadButton);

    // Should not crash and should generate PDF
    await waitFor(() => {
      expect(mockToBlob).toHaveBeenCalled();
    });
  });

  it('should pass organization name to PDF document', () => {
    renderWithProviders(
      <PDFGenerator
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        organizationName="Test Hospital"
      />
    );

    // Component should render without errors
    expect(screen.getByTestId('pdf-download-button')).toBeInTheDocument();
  });
});
