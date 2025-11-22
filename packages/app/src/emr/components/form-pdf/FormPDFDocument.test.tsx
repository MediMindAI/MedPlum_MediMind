// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render } from '@testing-library/react';
import type {
  Questionnaire,
  QuestionnaireResponse,
  Patient,
} from '@medplum/fhirtypes';

// Mock @react-pdf/renderer before importing the component
jest.mock('@react-pdf/renderer', () => ({
  Document: ({ children, ...props }: any) => (
    <div data-testid="pdf-document" {...props}>{children}</div>
  ),
  Page: ({ children, ...props }: any) => (
    <div data-testid="pdf-page" {...props}>{children}</div>
  ),
  View: ({ children, ...props }: any) => (
    <div data-testid="pdf-view" {...props}>{children}</div>
  ),
  Text: ({ children, ...props }: any) => (
    <span data-testid="pdf-text" {...props}>{children}</span>
  ),
  Image: ({ src, ...props }: any) => (
    <img data-testid="pdf-image" src={src} {...props} alt="" />
  ),
  StyleSheet: {
    create: (styles: any) => styles,
  },
  Font: {
    register: jest.fn(),
  },
}));

// Import after mocking
import { FormPDFDocument } from './FormPDFDocument';

describe('FormPDFDocument', () => {
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'q1',
    status: 'active',
    title: 'Patient Intake Form',
    item: [
      {
        linkId: 'name',
        text: 'Full Name',
        type: 'string',
      },
      {
        linkId: 'dob',
        text: 'Date of Birth',
        type: 'date',
      },
      {
        linkId: 'symptoms',
        text: 'Symptoms',
        type: 'group',
        item: [
          {
            linkId: 'symptoms-headache',
            text: 'Headache',
            type: 'boolean',
          },
          {
            linkId: 'symptoms-fever',
            text: 'Fever',
            type: 'boolean',
          },
        ],
      },
    ],
  };

  const mockResponse: QuestionnaireResponse = {
    resourceType: 'QuestionnaireResponse',
    id: 'qr1',
    status: 'completed',
    questionnaire: 'Questionnaire/q1',
    authored: '2025-01-15T10:30:00Z',
    item: [
      {
        linkId: 'name',
        text: 'Full Name',
        answer: [{ valueString: 'John Doe' }],
      },
      {
        linkId: 'dob',
        text: 'Date of Birth',
        answer: [{ valueDate: '1990-05-15' }],
      },
      {
        linkId: 'symptoms',
        text: 'Symptoms',
        item: [
          {
            linkId: 'symptoms-headache',
            text: 'Headache',
            answer: [{ valueBoolean: true }],
          },
          {
            linkId: 'symptoms-fever',
            text: 'Fever',
            answer: [{ valueBoolean: false }],
          },
        ],
      },
    ],
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
    birthDate: '1990-05-15',
    gender: 'male',
    identifier: [
      {
        system: 'http://medimind.ge/identifiers/personal-id',
        value: '12345678901',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render PDF document with form title', () => {
    const { getByTestId, getByText } = render(
      <FormPDFDocument
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
      />
    );

    expect(getByTestId('pdf-document')).toBeInTheDocument();
    expect(getByText('Patient Intake Form')).toBeInTheDocument();
  });

  it('should render patient information section', () => {
    const { container } = render(
      <FormPDFDocument
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
      />
    );

    // Check that the patient info is present in the rendered content
    expect(container.textContent).toContain('Patient Name');
    expect(container.textContent).toContain('John Doe');
    expect(container.textContent).toContain('Personal ID');
    expect(container.textContent).toContain('12345678901');
  });

  it('should render form field answers', () => {
    const { getByText } = render(
      <FormPDFDocument
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
      />
    );

    expect(getByText('Full Name')).toBeInTheDocument();
  });

  it('should render boolean answers as Yes/No', () => {
    const { getByText } = render(
      <FormPDFDocument
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
      />
    );

    // Boolean true should be "Yes"
    expect(getByText('Yes')).toBeInTheDocument();
    // Boolean false should be "No"
    expect(getByText('No')).toBeInTheDocument();
  });

  it('should render group sections', () => {
    const { getByText } = render(
      <FormPDFDocument
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
      />
    );

    expect(getByText('Symptoms')).toBeInTheDocument();
    expect(getByText('Headache')).toBeInTheDocument();
    expect(getByText('Fever')).toBeInTheDocument();
  });

  it('should render with custom organization name', () => {
    const { container } = render(
      <FormPDFDocument
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
        organizationName="Test Hospital"
      />
    );

    // Check organization name is in the content
    expect(container.textContent).toContain('Test Hospital');
  });

  it('should render response status', () => {
    const { getByText } = render(
      <FormPDFDocument
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
      />
    );

    expect(getByText('completed')).toBeInTheDocument();
  });

  it('should handle missing patient gracefully', () => {
    const { queryByText } = render(
      <FormPDFDocument
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={null}
      />
    );

    // Patient section should not be rendered
    expect(queryByText('Patient Name:')).not.toBeInTheDocument();
  });

  it('should handle missing questionnaire gracefully', () => {
    const { getByText } = render(
      <FormPDFDocument
        questionnaire={null}
        response={mockResponse}
        patient={mockPatient}
      />
    );

    // Should show default form title
    expect(getByText('Form Response')).toBeInTheDocument();
  });

  it('should render empty state when no response items', () => {
    const emptyResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      id: 'qr2',
      status: 'completed',
      item: [],
    };

    const { getByText } = render(
      <FormPDFDocument
        questionnaire={mockQuestionnaire}
        response={emptyResponse}
        patient={mockPatient}
      />
    );

    expect(getByText('No responses recorded')).toBeInTheDocument();
  });

  it('should render logo when provided', () => {
    const { getAllByTestId } = render(
      <FormPDFDocument
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
        logoUrl="https://example.com/logo.png"
      />
    );

    const images = getAllByTestId('pdf-image');
    expect(images.length).toBeGreaterThan(0);
  });

  it('should render Georgian text in form title', () => {
    const georgianQuestionnaire: Questionnaire = {
      resourceType: 'Questionnaire',
      status: 'active',
      title: 'სამედიცინო ფორმა',
      item: [],
    };

    const { getByText } = render(
      <FormPDFDocument
        questionnaire={georgianQuestionnaire}
        response={mockResponse}
        patient={mockPatient}
      />
    );

    expect(getByText('სამედიცინო ფორმა')).toBeInTheDocument();
  });

  it('should render Georgian patient name', () => {
    const georgianPatient: Patient = {
      resourceType: 'Patient',
      name: [
        {
          given: ['თენგიზი'],
          family: 'ხოზვრია',
        },
      ],
    };

    const { getByText } = render(
      <FormPDFDocument
        questionnaire={mockQuestionnaire}
        response={mockResponse}
        patient={georgianPatient}
      />
    );

    expect(getByText('თენგიზი ხოზვრია')).toBeInTheDocument();
  });

  it('should handle different answer types', () => {
    const multiTypeResponse: QuestionnaireResponse = {
      resourceType: 'QuestionnaireResponse',
      id: 'qr3',
      status: 'completed',
      item: [
        {
          linkId: 'int-field',
          answer: [{ valueInteger: 42 }],
        },
        {
          linkId: 'decimal-field',
          answer: [{ valueDecimal: 3.14 }],
        },
        {
          linkId: 'coding-field',
          answer: [{ valueCoding: { display: 'Option A', code: 'A' } }],
        },
      ],
    };

    const { getByText } = render(
      <FormPDFDocument
        questionnaire={null}
        response={multiTypeResponse}
        patient={null}
      />
    );

    expect(getByText('42')).toBeInTheDocument();
    expect(getByText('3.14')).toBeInTheDocument();
    expect(getByText('Option A')).toBeInTheDocument();
  });
});
