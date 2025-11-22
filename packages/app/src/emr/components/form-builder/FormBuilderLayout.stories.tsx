// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { Meta, StoryObj } from '@storybook/react';
import { FormBuilderLayout } from './FormBuilderLayout';

const meta: Meta<typeof FormBuilderLayout> = {
  title: 'EMR/FormBuilder/FormBuilderLayout',
  component: FormBuilderLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# FormBuilderLayout

Three-panel layout for the FHIR form builder:
- **Left (20%)**: FieldPalette - draggable field types
- **Center (55%)**: FormCanvas - drop zone for building form
- **Right (25%)**: PropertiesPanel - field configuration

## Features
- Real-time preview updates when fields change
- Touch-friendly with 44px minimum tap targets
- Mobile-responsive: panels collapse on small screens
- Drag and drop support with keyboard navigation
- Accessible with ARIA labels and roles

## Keyboard Navigation
- **Tab**: Move between panels and fields
- **Enter/Space**: Select field or activate button
- **Delete/Backspace**: Delete selected field
- **Arrow Up/Down**: Navigate between fields in canvas

## Performance
- React.memo optimization for all child components
- useCallback for event handlers
- Virtual scrolling for large forms (50+ fields)
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '100vw' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default form builder layout with empty canvas
 */
export const Default: Story = {};

/**
 * Form builder in loading state
 */
export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Form builder showing loading skeleton while data is being fetched.',
      },
    },
  },
};

/**
 * Form builder with fields already added
 */
export const WithFields: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Form builder with several fields already added to the canvas.',
      },
    },
  },
};

/**
 * Form builder in preview mode
 */
export const PreviewMode: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Form builder showing the preview mode with side-by-side editing and preview.',
      },
    },
  },
};

/**
 * Mobile view of form builder
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Form builder on mobile devices - panels stack vertically.',
      },
    },
  },
};

/**
 * Tablet view of form builder
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Form builder on tablet devices.',
      },
    },
  },
};
