// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { SpecialtySelect } from './SpecialtySelect';

/**
 * SpecialtySelect component allows users to select a medical specialty from 25 options
 * using NUCC Healthcare Provider Taxonomy codes. Supports Georgian, English, and Russian.
 */
const meta: Meta<typeof SpecialtySelect> = {
  title: 'EMR/Account Management/SpecialtySelect',
  component: SpecialtySelect,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MantineProvider>
        <div style={{ maxWidth: '400px', padding: '20px' }}>
          <Story />
        </div>
      </MantineProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SpecialtySelect>;

/**
 * Default SpecialtySelect with no selection
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return <SpecialtySelect value={value} onChange={setValue} />;
  },
};

/**
 * SpecialtySelect with Cardiology selected
 */
export const CardiologySelected: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('207RC0000X');
    return <SpecialtySelect value={value} onChange={setValue} />;
  },
};

/**
 * SpecialtySelect with Surgery selected
 */
export const SurgerySelected: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('207RS0010X');
    return <SpecialtySelect value={value} onChange={setValue} />;
  },
};

/**
 * SpecialtySelect in Georgian (ka)
 */
export const Georgian: Story = {
  render: () => {
    localStorage.setItem('emrLanguage', 'ka');
    const [value, setValue] = useState<string | null>('207RC0000X');
    return <SpecialtySelect value={value} onChange={setValue} />;
  },
};

/**
 * SpecialtySelect in English (en)
 */
export const English: Story = {
  render: () => {
    localStorage.setItem('emrLanguage', 'en');
    const [value, setValue] = useState<string | null>('207RC0000X');
    return <SpecialtySelect value={value} onChange={setValue} />;
  },
};

/**
 * SpecialtySelect in Russian (ru)
 */
export const Russian: Story = {
  render: () => {
    localStorage.setItem('emrLanguage', 'ru');
    const [value, setValue] = useState<string | null>('207RC0000X');
    return <SpecialtySelect value={value} onChange={setValue} />;
  },
};

/**
 * SpecialtySelect with custom label
 */
export const CustomLabel: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return <SpecialtySelect value={value} onChange={setValue} label="ექიმის სპეციალიზაცია" />;
  },
};

/**
 * Clearable SpecialtySelect (can remove selection)
 */
export const Clearable: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('207RC0000X');
    return <SpecialtySelect value={value} onChange={setValue} clearable />;
  },
};

/**
 * Required SpecialtySelect
 */
export const Required: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return <SpecialtySelect value={value} onChange={setValue} required />;
  },
};

/**
 * Disabled SpecialtySelect
 */
export const Disabled: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('207RC0000X');
    return <SpecialtySelect value={value} onChange={setValue} disabled />;
  },
};

/**
 * SpecialtySelect with error
 */
export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return <SpecialtySelect value={value} onChange={setValue} error="სპეციალობა სავალდებულოა" />;
  },
};

/**
 * SpecialtySelect with description
 */
export const WithDescription: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <SpecialtySelect
        value={value}
        onChange={setValue}
        description="აირჩიეთ სამედიცინო სპეციალობა NUCC კლასიფიკაციით"
      />
    );
  },
};

/**
 * Searchable SpecialtySelect demonstration
 */
export const SearchableDemo: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <div>
        <SpecialtySelect value={value} onChange={setValue} />
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Type to search (e.g., "კარდ", "cardio", "кардио")
        </p>
      </div>
    );
  },
};

/**
 * Mobile responsive view (small screen)
 */
export const MobileView: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('207RC0000X');
    return (
      <div style={{ width: '320px' }}>
        <SpecialtySelect value={value} onChange={setValue} />
      </div>
    );
  },
};

/**
 * Interactive example showing all specialties
 */
export const AllSpecialties: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <div>
        <SpecialtySelect value={value} onChange={setValue} clearable />
        <div style={{ marginTop: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
          <strong>Selected specialty:</strong>
          <pre>{value || 'None'}</pre>
          <p style={{ fontSize: '12px', marginTop: '10px' }}>
            Available specialties: Cardiology, Surgery, Internal Medicine, Emergency Medicine, Family Medicine,
            Anesthesiology, Orthopedic Surgery, Neurosurgery, Dermatology, OB/GYN, Ophthalmology, ENT, Pediatrics,
            Radiology, Endocrinology, Gastroenterology, Hematology, Infectious Disease, Nephrology, Oncology,
            Pulmonology, Rheumatology, Psychiatry, Urology, Clinical Psychology
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Comparison of common specialties
 */
export const CommonSpecialties: Story = {
  render: () => {
    const [cardiology, setCardiology] = useState<string | null>('207RC0000X');
    const [surgery, setSurgery] = useState<string | null>('207RS0010X');
    const [emergency, setEmergency] = useState<string | null>('207P00000X');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <SpecialtySelect value={cardiology} onChange={setCardiology} label="Cardiologist" />
        <SpecialtySelect value={surgery} onChange={setSurgery} label="Surgeon" />
        <SpecialtySelect value={emergency} onChange={setEmergency} label="Emergency Doctor" />
      </div>
    );
  },
};

/**
 * Interactive example with NUCC code display
 */
export const WithNUCCCode: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>('207RC0000X');
    return (
      <div>
        <SpecialtySelect value={value} onChange={setValue} clearable />
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '4px',
            fontFamily: 'monospace',
          }}
        >
          <strong>NUCC Code:</strong> {value || 'Not selected'}
          <br />
          <small style={{ color: '#666' }}>Healthcare Provider Taxonomy Code System</small>
        </div>
      </div>
    );
  },
};

/**
 * Form integration example
 */
export const FormIntegration: Story = {
  render: () => {
    const [specialty, setSpecialty] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitted(true);
    };

    return (
      <form onSubmit={handleSubmit}>
        <SpecialtySelect
          value={specialty}
          onChange={setSpecialty}
          required
          error={submitted && !specialty ? 'სპეციალობა სავალდებულოა' : undefined}
        />
        <button
          type="submit"
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            background: 'var(--emr-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          დადასტურება
        </button>
        {submitted && specialty && (
          <div style={{ marginTop: '16px', color: 'green' }}>
            Specialty selected: {specialty}
          </div>
        )}
      </form>
    );
  },
};
