// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { RoleSelector } from './RoleSelector';

/**
 * RoleSelector component allows users to select multiple hospital staff roles
 * from a predefined list. Supports Georgian, English, and Russian languages.
 */
const meta: Meta<typeof RoleSelector> = {
  title: 'EMR/Account Management/RoleSelector',
  component: RoleSelector,
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
type Story = StoryObj<typeof RoleSelector>;

/**
 * Default RoleSelector with no selection
 */
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <RoleSelector value={value} onChange={setValue} />;
  },
};

/**
 * RoleSelector with single role selected
 */
export const SingleRoleSelected: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['physician']);
    return <RoleSelector value={value} onChange={setValue} />;
  },
};

/**
 * RoleSelector with multiple roles selected
 */
export const MultipleRolesSelected: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['physician', 'department-head', 'administrator']);
    return <RoleSelector value={value} onChange={setValue} />;
  },
};

/**
 * RoleSelector in Georgian (ka)
 */
export const Georgian: Story = {
  render: () => {
    localStorage.setItem('emrLanguage', 'ka');
    const [value, setValue] = useState<string[]>(['physician', 'nurse']);
    return <RoleSelector value={value} onChange={setValue} />;
  },
};

/**
 * RoleSelector in English (en)
 */
export const English: Story = {
  render: () => {
    localStorage.setItem('emrLanguage', 'en');
    const [value, setValue] = useState<string[]>(['physician', 'nurse']);
    return <RoleSelector value={value} onChange={setValue} />;
  },
};

/**
 * RoleSelector in Russian (ru)
 */
export const Russian: Story = {
  render: () => {
    localStorage.setItem('emrLanguage', 'ru');
    const [value, setValue] = useState<string[]>(['physician', 'nurse']);
    return <RoleSelector value={value} onChange={setValue} />;
  },
};

/**
 * RoleSelector with custom label
 */
export const CustomLabel: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <RoleSelector value={value} onChange={setValue} label="პერსონალის როლები" />;
  },
};

/**
 * Required RoleSelector
 */
export const Required: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <RoleSelector value={value} onChange={setValue} required />;
  },
};

/**
 * Disabled RoleSelector
 */
export const Disabled: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['physician', 'nurse']);
    return <RoleSelector value={value} onChange={setValue} disabled />;
  },
};

/**
 * RoleSelector with error
 */
export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return <RoleSelector value={value} onChange={setValue} error="მინიმუმ ერთი როლი სავალდებულოა" />;
  },
};

/**
 * RoleSelector with description
 */
export const WithDescription: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <RoleSelector
        value={value}
        onChange={setValue}
        description="აირჩიეთ ყველა შესაბამისი როლი ამ პერსონალისთვის"
      />
    );
  },
};

/**
 * Searchable RoleSelector demonstration
 */
export const SearchableDemo: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <div>
        <RoleSelector value={value} onChange={setValue} />
        <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
          Type to search for roles (e.g., "ექიმი", "physician", "врач")
        </p>
      </div>
    );
  },
};

/**
 * All roles selected
 */
export const AllRolesSelected: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([
      'physician',
      'nurse',
      'technician',
      'administrator',
      'department-head',
      'pharmacist',
      'lab-technician',
      'radiologist',
      'receptionist',
      'billing-specialist',
      'therapist',
      'anesthesiologist',
    ]);
    return <RoleSelector value={value} onChange={setValue} />;
  },
};

/**
 * Mobile responsive view (small screen)
 */
export const MobileView: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['physician', 'nurse']);
    return (
      <div style={{ width: '320px' }}>
        <RoleSelector value={value} onChange={setValue} />
      </div>
    );
  },
};

/**
 * Interactive example showing selection changes
 */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <div>
        <RoleSelector value={value} onChange={setValue} />
        <div style={{ marginTop: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
          <strong>Selected roles ({value.length}):</strong>
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
      </div>
    );
  },
};
