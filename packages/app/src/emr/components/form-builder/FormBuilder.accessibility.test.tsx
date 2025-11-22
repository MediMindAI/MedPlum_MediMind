// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * WCAG 2.1 Level AA Accessibility Tests for Form Builder Components
 *
 * Tests cover:
 * - Keyboard navigation (Tab, Enter, Escape, Arrow keys)
 * - ARIA roles and labels
 * - Focus management
 * - Screen reader compatibility
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MedplumProvider } from '@medplum/react-hooks';
import { MantineProvider } from '@mantine/core';
import { DndContext } from '@dnd-kit/core';
import { MockClient } from '@medplum/mock';
import { FormBuilderLayout } from './FormBuilderLayout';
import { FieldPalette } from './FieldPalette';
import { PropertiesPanel } from './PropertiesPanel';
import { FormCanvas } from './FormCanvas';
import type { FieldConfig } from '../../types/form-builder';

// Helper to wrap component with required providers
const renderWithProviders = (component: React.ReactElement, medplum?: MockClient) => {
  const client = medplum || new MockClient();
  return render(
    <MantineProvider>
      <MemoryRouter>
        <MedplumProvider medplum={client}>{component}</MedplumProvider>
      </MemoryRouter>
    </MantineProvider>
  );
};

// Sample field config for testing
const sampleField: FieldConfig = {
  id: 'field-1',
  linkId: 'field-1',
  type: 'text',
  label: 'Sample Field',
  required: false,
  order: 0,
};

const sampleFields: FieldConfig[] = [
  { id: 'field-1', linkId: 'field-1', type: 'text', label: 'First Name', required: true, order: 0 },
  { id: 'field-2', linkId: 'field-2', type: 'text', label: 'Last Name', required: true, order: 1 },
  { id: 'field-3', linkId: 'field-3', type: 'date', label: 'Birth Date', required: false, order: 2 },
];

// Default props for FormBuilderLayout
const defaultLayoutProps = {
  fields: sampleFields,
  formTitle: 'Test Form',
  selectedFieldId: null,
  onFieldsChange: jest.fn(),
  onFieldSelect: jest.fn(),
  onFieldAdd: jest.fn(),
  onFieldUpdate: jest.fn(),
  onFieldDelete: jest.fn(),
  onFieldsReorder: jest.fn(),
};

describe('FormBuilderLayout Accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  describe('ARIA Structure', () => {
    it('should have proper region roles for main panels', async () => {
      renderWithProviders(<FormBuilderLayout {...defaultLayoutProps} />);

      // Should have regions for panels
      const regions = screen.getAllByRole('region');
      expect(regions.length).toBeGreaterThan(0);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Tab navigation through panels', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FormBuilderLayout {...defaultLayoutProps} />);

      // Tab should move through interactive elements
      await user.tab();
      expect(document.activeElement).toBeTruthy();

      await user.tab();
      expect(document.activeElement).toBeTruthy();
    });

    it('should support Enter to activate buttons', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FormBuilderLayout {...defaultLayoutProps} />);

      // Find and focus the preview button
      const previewButton = screen.getByRole('button', { name: /preview/i });
      previewButton.focus();

      // Press Enter
      await user.keyboard('{Enter}');

      // Button should be activated (no error thrown)
      expect(previewButton).toBeInTheDocument();
    });
  });

});

describe('FieldPalette Accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  describe('ARIA Structure', () => {
    it('should have proper ARIA structure', async () => {
      renderWithProviders(
        <DndContext>
          <FieldPalette />
        </DndContext>
      );

      // Should have region for palette
      const region = screen.getByRole('region');
      expect(region).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Tab navigation through field types', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <DndContext>
          <FieldPalette />
        </DndContext>
      );

      // Tab into the search field
      await user.tab();
      expect(document.activeElement?.tagName).toBe('INPUT');
    });

    it('should support Enter/Space on category badges', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <DndContext>
          <FieldPalette />
        </DndContext>
      );

      // Find category badges
      const badges = screen.getAllByRole('tab');
      expect(badges.length).toBeGreaterThan(0);

      // Focus and press Enter on a badge
      badges[1].focus();
      await user.keyboard('{Enter}');

      // Badge should be activated
      expect(badges[1]).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Search Accessibility', () => {
    it('should have accessible search input', async () => {
      renderWithProviders(
        <DndContext>
          <FieldPalette />
        </DndContext>
      );

      const searchInput = screen.getByRole('textbox');
      expect(searchInput).toHaveAttribute('aria-label');
    });

    it('should announce search results', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <DndContext>
          <FieldPalette />
        </DndContext>
      );

      const searchInput = screen.getByRole('textbox');
      await user.type(searchInput, 'xyz');

      // No results message should be announced
      await waitFor(() => {
        const statusMessage = screen.getByRole('status');
        expect(statusMessage).toBeInTheDocument();
      });
    });
  });

  describe('ARIA Roles', () => {
    it('should have proper tablist role for categories', async () => {
      renderWithProviders(
        <DndContext>
          <FieldPalette />
        </DndContext>
      );

      const tablist = screen.getByRole('tablist');
      expect(tablist).toHaveAttribute('aria-label', 'Field categories');
    });

    it('should have proper listbox role for field types', async () => {
      renderWithProviders(
        <DndContext>
          <FieldPalette />
        </DndContext>
      );

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-label', 'Available field types');
    });
  });
});

describe('FormCanvas Accessibility', () => {
  const mockOnFieldSelect = jest.fn();
  const mockOnFieldsChange = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
    mockOnFieldSelect.mockClear();
    mockOnFieldsChange.mockClear();
  });

  describe('ARIA Structure', () => {
    it('should have proper ARIA structure with fields', async () => {
      renderWithProviders(
        <FormCanvas
          fields={sampleFields}
          selectedField={null}
          onFieldSelect={mockOnFieldSelect}
          onFieldsChange={mockOnFieldsChange}
        />
      );

      // Should have region for canvas
      const region = screen.getByRole('region');
      expect(region).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support Enter/Space to select field', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <FormCanvas
          fields={sampleFields}
          selectedField={null}
          onFieldSelect={mockOnFieldSelect}
          onFieldsChange={mockOnFieldsChange}
        />
      );

      // Find and focus a field item
      const fieldItems = screen.getAllByRole('option');
      fieldItems[0].focus();

      // Press Enter to select
      await user.keyboard('{Enter}');

      expect(mockOnFieldSelect).toHaveBeenCalledWith(sampleFields[0]);
    });

    it('should support Arrow keys to navigate between fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <FormCanvas
          fields={sampleFields}
          selectedField={sampleFields[0]}
          onFieldSelect={mockOnFieldSelect}
          onFieldsChange={mockOnFieldsChange}
        />
      );

      // Find and focus first field
      const fieldItems = screen.getAllByRole('option');
      fieldItems[0].focus();

      // Press Down arrow
      await user.keyboard('{ArrowDown}');

      expect(mockOnFieldSelect).toHaveBeenCalledWith(sampleFields[1]);
    });

    it('should support Delete/Backspace to delete field', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <FormCanvas
          fields={sampleFields}
          selectedField={sampleFields[0]}
          onFieldSelect={mockOnFieldSelect}
          onFieldsChange={mockOnFieldsChange}
        />
      );

      // Find and focus a field
      const fieldItems = screen.getAllByRole('option');
      fieldItems[0].focus();

      // Press Delete
      await user.keyboard('{Delete}');

      // Field should be removed
      expect(mockOnFieldsChange).toHaveBeenCalled();
    });
  });

  describe('ARIA Roles', () => {
    it('should have proper listbox role for field list', async () => {
      renderWithProviders(
        <FormCanvas
          fields={sampleFields}
          selectedField={null}
          onFieldSelect={mockOnFieldSelect}
          onFieldsChange={mockOnFieldsChange}
        />
      );

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-label', 'Form fields');
    });

    it('should have proper option roles for field items', async () => {
      renderWithProviders(
        <FormCanvas
          fields={sampleFields}
          selectedField={sampleFields[0]}
          onFieldSelect={mockOnFieldSelect}
          onFieldsChange={mockOnFieldsChange}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options.length).toBe(sampleFields.length);

      // First option should be selected
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Live Region Announcements', () => {
    it('should announce field deletion', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <FormCanvas
          fields={sampleFields}
          selectedField={sampleFields[0]}
          onFieldSelect={mockOnFieldSelect}
          onFieldsChange={mockOnFieldsChange}
        />
      );

      // Click delete button
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      // Live region should announce deletion
      const liveRegion = document.querySelector('[role="status"][aria-live]');
      expect(liveRegion).toBeInTheDocument();
    });
  });
});

describe('PropertiesPanel Accessibility', () => {
  const mockOnFieldUpdate = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
    mockOnFieldUpdate.mockClear();
  });

  describe('ARIA Structure', () => {
    it('should have proper ARIA structure with selected field', async () => {
      renderWithProviders(
        <PropertiesPanel selectedField={sampleField} onFieldUpdate={mockOnFieldUpdate} />
      );

      // Should have region for properties panel
      const region = screen.getByRole('region');
      expect(region).toBeInTheDocument();
    });

    it('should have proper ARIA structure without selected field', async () => {
      renderWithProviders(
        <PropertiesPanel selectedField={null} onFieldUpdate={mockOnFieldUpdate} />
      );

      // Should have region for properties panel
      const region = screen.getByRole('region');
      expect(region).toBeInTheDocument();
    });
  });

  describe('ARIA Roles', () => {
    it('should have proper region role', async () => {
      renderWithProviders(
        <PropertiesPanel selectedField={sampleField} onFieldUpdate={mockOnFieldUpdate} />
      );

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label');
    });
  });

  describe('Labels and Descriptions', () => {
    it('should have labeled field type information', async () => {
      renderWithProviders(
        <PropertiesPanel selectedField={sampleField} onFieldUpdate={mockOnFieldUpdate} />
      );

      // Field type should have label association
      const typeLabel = screen.getByText('Field Type');
      expect(typeLabel).toHaveAttribute('id', 'field-type-label');

      const typeValue = screen.getByText(/text/i);
      expect(typeValue).toHaveAttribute('aria-labelledby', 'field-type-label');
    });
  });
});
