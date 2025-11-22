// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react';
import { FormRenderer } from './FormRenderer';
import type { Questionnaire, Patient, Encounter } from '@medplum/fhirtypes';

const meta: Meta<typeof FormRenderer> = {
  title: 'EMR/FormRenderer/FormRenderer',
  component: FormRenderer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# FormRenderer

Renders a FHIR Questionnaire with automatic patient data population.

## Features
- Renders all FHIR Questionnaire item types (15 field types)
- Auto-populates fields from Patient and Encounter resources
- Supports calculated fields (age, fullName)
- Real-time validation with ARIA announcements
- Draft saving support
- Mobile-responsive design
- Virtual scrolling for large forms (50+ fields)

## Accessibility
- ARIA live regions for validation error announcements
- Form labels properly associated with inputs
- Keyboard navigation support
- Screen reader compatible
- WCAG 2.1 Level AA compliant

## Performance
- React.memo for form fields
- Virtual scrolling for large forms
- Optimized re-rendering with custom comparison
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    questionnaire: {
      description: 'FHIR Questionnaire resource to render',
    },
    patient: {
      description: 'Optional Patient resource for auto-population',
    },
    encounter: {
      description: 'Optional Encounter resource for auto-population',
    },
    mode: {
      control: 'select',
      options: ['fill', 'view'],
      description: 'Form mode - fill for editing, view for read-only',
    },
    enablePatientBinding: {
      control: 'boolean',
      description: 'Enable patient data binding/auto-population',
    },
    showBindingIndicators: {
      control: 'boolean',
      description: 'Show indicators for auto-populated fields',
    },
    isLoading: {
      control: 'boolean',
      description: 'Show loading skeleton',
    },
    isSubmitting: {
      control: 'boolean',
      description: 'Show submit button loading state',
    },
    hideButtons: {
      control: 'boolean',
      description: 'Hide action buttons',
    },
    enableVirtualScrolling: {
      control: 'boolean',
      description: 'Force enable virtual scrolling',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample questionnaire with various field types
const simpleQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'simple-form',
  title: 'Patient Registration Form',
  description: 'Basic patient registration information',
  status: 'active',
  item: [
    {
      linkId: 'firstName',
      text: 'First Name',
      type: 'string',
      required: true,
    },
    {
      linkId: 'lastName',
      text: 'Last Name',
      type: 'string',
      required: true,
    },
    {
      linkId: 'dob',
      text: 'Date of Birth',
      type: 'date',
      required: true,
    },
    {
      linkId: 'gender',
      text: 'Gender',
      type: 'choice',
      required: true,
      answerOption: [
        { valueCoding: { code: 'male', display: 'Male' } },
        { valueCoding: { code: 'female', display: 'Female' } },
        { valueCoding: { code: 'other', display: 'Other' } },
      ],
    },
    {
      linkId: 'email',
      text: 'Email Address',
      type: 'string',
    },
    {
      linkId: 'phone',
      text: 'Phone Number',
      type: 'string',
    },
  ],
};

// Complex questionnaire with conditional logic
const complexQuestionnaire: Questionnaire = {
  resourceType: 'Questionnaire',
  id: 'complex-form',
  title: 'Medical History Questionnaire',
  description: 'Complete medical history with conditional questions',
  status: 'active',
  item: [
    {
      linkId: 'patientName',
      text: 'Patient Name',
      type: 'string',
      required: true,
    },
    {
      linkId: 'visitDate',
      text: 'Visit Date',
      type: 'date',
      required: true,
    },
    {
      linkId: 'chiefComplaint',
      text: 'Chief Complaint',
      type: 'text',
      required: true,
    },
    {
      linkId: 'allergies',
      text: 'Do you have any allergies?',
      type: 'boolean',
    },
    {
      linkId: 'allergyDetails',
      text: 'Please list your allergies',
      type: 'text',
      enableWhen: [
        {
          question: 'allergies',
          operator: '=',
          answerBoolean: true,
        },
      ],
    },
    {
      linkId: 'medications',
      text: 'Current Medications',
      type: 'text',
    },
    {
      linkId: 'painLevel',
      text: 'Pain Level (0-10)',
      type: 'integer',
    },
    {
      linkId: 'temperature',
      text: 'Temperature (Celsius)',
      type: 'decimal',
    },
    {
      linkId: 'appointmentTime',
      text: 'Preferred Appointment Time',
      type: 'time',
    },
    {
      linkId: 'notes',
      text: 'Additional Notes',
      type: 'display',
    },
  ],
};

// Sample patient for auto-population
const samplePatient: Patient = {
  resourceType: 'Patient',
  id: 'patient-1',
  name: [
    {
      given: ['John'],
      family: 'Smith',
    },
  ],
  birthDate: '1985-05-15',
  gender: 'male',
  telecom: [
    { system: 'email', value: 'john.smith@example.com' },
    { system: 'phone', value: '+1-555-0123' },
  ],
};

/**
 * Simple form with basic fields
 */
export const Simple: Story = {
  args: {
    questionnaire: simpleQuestionnaire,
    mode: 'fill',
  },
};

/**
 * Complex form with conditional logic
 */
export const Complex: Story = {
  args: {
    questionnaire: complexQuestionnaire,
    mode: 'fill',
  },
};

/**
 * Form with patient data auto-populated
 */
export const WithPatientBinding: Story = {
  args: {
    questionnaire: simpleQuestionnaire,
    patient: samplePatient,
    enablePatientBinding: true,
    showBindingIndicators: true,
  },
};

/**
 * Form in view (read-only) mode
 */
export const ViewMode: Story = {
  args: {
    questionnaire: simpleQuestionnaire,
    mode: 'view',
    initialValues: {
      firstName: 'John',
      lastName: 'Smith',
      dob: '1985-05-15',
      gender: 'male',
      email: 'john.smith@example.com',
    },
  },
};

/**
 * Form with validation errors
 */
export const WithValidationErrors: Story = {
  args: {
    questionnaire: simpleQuestionnaire,
    mode: 'fill',
    initialValues: {
      firstName: '', // Required field left empty
      lastName: '', // Required field left empty
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Form showing validation errors with ARIA live region announcements.',
      },
    },
  },
};

/**
 * Form in loading state
 */
export const Loading: Story = {
  args: {
    questionnaire: simpleQuestionnaire,
    isLoading: true,
  },
};

/**
 * Form with submit button in loading state
 */
export const Submitting: Story = {
  args: {
    questionnaire: simpleQuestionnaire,
    isSubmitting: true,
    initialValues: {
      firstName: 'John',
      lastName: 'Smith',
      dob: '1985-05-15',
      gender: 'male',
    },
  },
};

/**
 * Form without action buttons
 */
export const NoButtons: Story = {
  args: {
    questionnaire: simpleQuestionnaire,
    hideButtons: true,
  },
};

/**
 * Mobile view of form
 */
export const Mobile: Story = {
  args: {
    questionnaire: complexQuestionnaire,
    mode: 'fill',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Generate a large form for virtual scrolling demo
const generateLargeQuestionnaire = (): Questionnaire => {
  const items = [];
  for (let i = 1; i <= 100; i++) {
    items.push({
      linkId: `field-${i}`,
      text: `Field ${i}`,
      type: i % 5 === 0 ? 'text' : i % 3 === 0 ? 'integer' : 'string',
      required: i % 10 === 0,
    });
  }
  return {
    resourceType: 'Questionnaire',
    id: 'large-form',
    title: 'Large Form (100 fields)',
    description: 'This form demonstrates virtual scrolling for performance',
    status: 'active',
    item: items as any,
  };
};

/**
 * Large form with virtual scrolling
 */
export const VirtualScrolling: Story = {
  args: {
    questionnaire: generateLargeQuestionnaire(),
    enableVirtualScrolling: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Large form with 100 fields using virtual scrolling for performance. Only visible fields are rendered in the DOM.',
      },
    },
  },
};
