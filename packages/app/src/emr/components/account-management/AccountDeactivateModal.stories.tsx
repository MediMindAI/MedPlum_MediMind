/**
 * Storybook Stories for AccountDeactivateModal Component (T076)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import { Practitioner } from '@medplum/fhirtypes';
import { AccountDeactivateModal } from './AccountDeactivateModal';

const medplum = new MockClient();

// Mock practitioners
const activePractitioner: Practitioner = {
  resourceType: 'Practitioner',
  id: 'practitioner-active',
  active: true,
  name: [
    {
      use: 'official',
      family: 'ხოზვრია',
      given: ['თენგიზი']
    }
  ],
  telecom: [
    {
      system: 'email',
      value: 'tengiz.khozvria@medimind.ge',
      use: 'work'
    },
    {
      system: 'phone',
      value: '+995500050610',
      use: 'work'
    }
  ],
  gender: 'male'
};

const inactivePractitioner: Practitioner = {
  resourceType: 'Practitioner',
  id: 'practitioner-inactive',
  active: false,
  name: [
    {
      use: 'official',
      family: 'გელაშვილი',
      given: ['ნინო']
    }
  ],
  telecom: [
    {
      system: 'email',
      value: 'nino.gelashvili@medimind.ge',
      use: 'work'
    }
  ],
  gender: 'female'
};

const meta: Meta<typeof AccountDeactivateModal> = {
  title: 'EMR/Account Management/AccountDeactivateModal',
  component: AccountDeactivateModal,
  decorators: [
    (Story) => (
      <MantineProvider>
        <MemoryRouter>
          <MedplumProvider medplum={medplum}>
            <Story />
          </MedplumProvider>
        </MemoryRouter>
      </MantineProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Modal dialog for confirming account deactivation or reactivation with loading states and error handling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    opened: {
      control: 'boolean',
      description: 'Whether the modal is opened',
    },
    onClose: {
      action: 'closed',
      description: 'Callback when modal is closed',
    },
    onSuccess: {
      action: 'success',
      description: 'Callback after successful operation',
    },
    practitioner: {
      description: 'Practitioner to deactivate/reactivate',
    },
    reason: {
      control: 'text',
      description: 'Optional reason for the action',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AccountDeactivateModal>;

/**
 * Default state - Deactivating an active practitioner
 */
export const DeactivateActive: Story = {
  args: {
    opened: true,
    practitioner: activePractitioner,
    onClose: () => console.log('Modal closed'),
    onSuccess: () => console.log('Deactivation successful'),
  },
};

/**
 * Reactivating an inactive practitioner
 */
export const ReactivateInactive: Story = {
  args: {
    opened: true,
    practitioner: inactivePractitioner,
    onClose: () => console.log('Modal closed'),
    onSuccess: () => console.log('Reactivation successful'),
  },
};

/**
 * With a custom reason for deactivation
 */
export const WithReason: Story = {
  args: {
    opened: true,
    practitioner: activePractitioner,
    reason: 'Employee terminated',
    onClose: () => console.log('Modal closed'),
    onSuccess: () => console.log('Deactivation successful'),
  },
};

/**
 * Modal closed state
 */
export const Closed: Story = {
  args: {
    opened: false,
    practitioner: activePractitioner,
    onClose: () => console.log('Modal closed'),
    onSuccess: () => console.log('Operation successful'),
  },
};

/**
 * Practitioner without email
 */
export const WithoutEmail: Story = {
  args: {
    opened: true,
    practitioner: {
      ...activePractitioner,
      telecom: undefined,
    },
    onClose: () => console.log('Modal closed'),
    onSuccess: () => console.log('Operation successful'),
  },
};

/**
 * Georgian language (default)
 */
export const Georgian: Story = {
  args: {
    opened: true,
    practitioner: activePractitioner,
    onClose: () => console.log('Modal closed'),
    onSuccess: () => console.log('Operation successful'),
  },
  beforeEach: () => {
    localStorage.setItem('emrLanguage', 'ka');
  },
};

/**
 * English language
 */
export const English: Story = {
  args: {
    opened: true,
    practitioner: activePractitioner,
    onClose: () => console.log('Modal closed'),
    onSuccess: () => console.log('Operation successful'),
  },
  beforeEach: () => {
    localStorage.setItem('emrLanguage', 'en');
  },
};

/**
 * Russian language
 */
export const Russian: Story = {
  args: {
    opened: true,
    practitioner: activePractitioner,
    onClose: () => console.log('Modal closed'),
    onSuccess: () => console.log('Operation successful'),
  },
  beforeEach: () => {
    localStorage.setItem('emrLanguage', 'ru');
  },
};
