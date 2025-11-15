// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react';
import { MantineProvider } from '@mantine/core';
import { SubmitDropdownButton } from './SubmitDropdownButton';
import { fn } from '@storybook/test';

const meta: Meta<typeof SubmitDropdownButton> = {
  title: 'EMR/Registration/SubmitDropdownButton',
  component: SubmitDropdownButton,
  decorators: [
    (Story) => (
      <MantineProvider>
        <Story />
      </MantineProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Loading state for the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state for the button',
    },
  },
  args: {
    onSave: fn(),
    onSaveAndContinue: fn(),
    onSaveAndNew: fn(),
    onSaveAndView: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state - Normal button with all actions enabled
 */
export const Default: Story = {
  args: {
    loading: false,
    disabled: false,
  },
};

/**
 * Loading state - Shows spinner on primary button
 */
export const Loading: Story = {
  args: {
    loading: true,
    disabled: false,
  },
};

/**
 * Disabled state - All buttons disabled
 */
export const Disabled: Story = {
  args: {
    loading: false,
    disabled: true,
  },
};

/**
 * Georgian language - Shows button labels in Georgian
 */
export const Georgian: Story = {
  args: {
    loading: false,
    disabled: false,
  },
  decorators: [
    (Story) => {
      localStorage.setItem('emrLanguage', 'ka');
      return (
        <MantineProvider>
          <Story />
        </MantineProvider>
      );
    },
  ],
};

/**
 * English language - Shows button labels in English
 */
export const English: Story = {
  args: {
    loading: false,
    disabled: false,
  },
  decorators: [
    (Story) => {
      localStorage.setItem('emrLanguage', 'en');
      return (
        <MantineProvider>
          <Story />
        </MantineProvider>
      );
    },
  ],
};

/**
 * Russian language - Shows button labels in Russian
 */
export const Russian: Story = {
  args: {
    loading: false,
    disabled: false,
  },
  decorators: [
    (Story) => {
      localStorage.setItem('emrLanguage', 'ru');
      return (
        <MantineProvider>
          <Story />
        </MantineProvider>
      );
    },
  ],
};
