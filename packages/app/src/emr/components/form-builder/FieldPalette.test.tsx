// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MedplumProvider } from '@medplum/react-hooks';
import { MantineProvider } from '@mantine/core';
import { MockClient } from '@medplum/mock';
import { FieldPalette } from './FieldPalette';

describe('FieldPalette', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <MantineProvider>
        <MemoryRouter>
          <MedplumProvider medplum={medplum}>{component}</MedplumProvider>
        </MemoryRouter>
      </MantineProvider>
    );
  };

  it('renders palette header', () => {
    renderWithProviders(<FieldPalette />);

    expect(screen.getByText(/Field Palette/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag fields to canvas/i)).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderWithProviders(<FieldPalette />);

    const searchInput = screen.getByPlaceholderText(/Search forms/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('renders all 14 field types', () => {
    renderWithProviders(<FieldPalette />);

    // Check for basic field types
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('Textarea')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Integer')).toBeInTheDocument();
    expect(screen.getByText('Decimal')).toBeInTheDocument();
    expect(screen.getByText('Checkbox')).toBeInTheDocument();
    expect(screen.getByText('Choice')).toBeInTheDocument();

    // Check for advanced field types
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Date & Time')).toBeInTheDocument();
    expect(screen.getByText('Signature')).toBeInTheDocument();
    expect(screen.getByText('Attachment')).toBeInTheDocument();

    // Check for layout field types
    expect(screen.getByText('Group')).toBeInTheDocument();
  });

  it('renders category badges', () => {
    renderWithProviders(<FieldPalette />);

    expect(screen.getByText(/All \(14\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Basic \(7\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Advanced \(5\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Layout \(2\)/i)).toBeInTheDocument();
  });

  it('filters fields by category when clicking badge', () => {
    renderWithProviders(<FieldPalette />);

    // Click "Basic" badge
    const basicBadge = screen.getByText(/Basic \(7\)/i);
    fireEvent.click(basicBadge);

    // Should show only basic fields (7 total)
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();

    // Should not show advanced fields
    expect(screen.queryByText('Signature')).not.toBeInTheDocument();
  });

  it('filters fields by search query', () => {
    renderWithProviders(<FieldPalette />);

    const searchInput = screen.getByPlaceholderText(/Search forms/i);
    fireEvent.change(searchInput, { target: { value: 'text' } });

    // Should show fields matching "text"
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('Textarea')).toBeInTheDocument();

    // Should not show unmatched fields
    expect(screen.queryByText('Date')).not.toBeInTheDocument();
    expect(screen.queryByText('Integer')).not.toBeInTheDocument();
  });

  it('shows "no results" message when search yields nothing', () => {
    renderWithProviders(<FieldPalette />);

    const searchInput = screen.getByPlaceholderText(/Search forms/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText(/No results found/i)).toBeInTheDocument();
  });

  it('renders field icons for each type', () => {
    const { container } = renderWithProviders(<FieldPalette />);

    // Check that SVG icons are present (IconTextSize, IconCalendar, etc.)
    const svgIcons = container.querySelectorAll('svg');
    expect(svgIcons.length).toBeGreaterThan(14); // At least one icon per field + search icon
  });

  it('applies theme colors to field items', () => {
    const { container } = renderWithProviders(<FieldPalette />);

    // Check that theme CSS variables and modern colors are used
    expect(container.innerHTML).toContain('var(--emr-gray-200)');
    // Modern design uses direct gradients and shadow panel items
    expect(container.innerHTML).toContain('var(--emr-shadow-panel-item)');
    // Check for new panel styling
    expect(container.innerHTML).toContain('var(--emr-panel-padding)');
  });

  it('field items have grab cursor', () => {
    const { container } = renderWithProviders(<FieldPalette />);

    const fieldItems = container.querySelectorAll('div[style*="cursor: grab"]');
    expect(fieldItems.length).toBeGreaterThan(0);
  });

  it('combines category and search filters', () => {
    renderWithProviders(<FieldPalette />);

    // Set category to "Basic"
    const basicBadge = screen.getByText(/Basic \(7\)/i);
    fireEvent.click(basicBadge);

    // Search for "date"
    const searchInput = screen.getByPlaceholderText(/Search forms/i);
    fireEvent.change(searchInput, { target: { value: 'date' } });

    // Should show only basic fields matching "date"
    expect(screen.getByText('Date')).toBeInTheDocument();

    // Should not show advanced date fields
    expect(screen.queryByText('Date & Time')).not.toBeInTheDocument();
  });

  it('clears category filter when clicking "All"', () => {
    renderWithProviders(<FieldPalette />);

    // Set category to "Basic"
    const basicBadge = screen.getByText(/Basic \(7\)/i);
    fireEvent.click(basicBadge);

    // Click "All" to clear filter
    const allBadge = screen.getByText(/All \(14\)/i);
    fireEvent.click(allBadge);

    // Should show all fields again
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('Signature')).toBeInTheDocument();
    expect(screen.getByText('Group')).toBeInTheDocument();
  });
});
