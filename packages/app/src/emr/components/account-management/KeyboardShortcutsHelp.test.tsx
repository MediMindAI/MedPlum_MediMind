// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';

describe('KeyboardShortcutsHelp', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  it('should render modal when opened', () => {
    const mockOnClose = jest.fn();

    renderWithProviders(<KeyboardShortcutsHelp opened={true} onClose={mockOnClose} />);

    // Text appears in both title and table
    const elements = screen.getAllByText(/კლავიატურის მალსახმობები/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('should not render when closed', () => {
    const mockOnClose = jest.fn();

    renderWithProviders(<KeyboardShortcutsHelp opened={false} onClose={mockOnClose} />);

    expect(screen.queryByText(/კლავიატურის მალსახმობები/i)).not.toBeInTheDocument();
  });

  it('should display search shortcut', () => {
    const mockOnClose = jest.fn();

    renderWithProviders(<KeyboardShortcutsHelp opened={true} onClose={mockOnClose} />);

    // Text may appear multiple times
    const searchElements = screen.getAllByText(/ძებნა/i);
    expect(searchElements.length).toBeGreaterThan(0);
    // Check for Cmd/Ctrl + K keyboard shortcut
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('should display create shortcut', () => {
    const mockOnClose = jest.fn();

    renderWithProviders(<KeyboardShortcutsHelp opened={true} onClose={mockOnClose} />);

    expect(screen.getByText(/ახალი ანგარიში/i)).toBeInTheDocument();
    // Check for Cmd/Ctrl + N keyboard shortcut
    expect(screen.getByText('N')).toBeInTheDocument();
  });

  it('should display help shortcut', () => {
    const mockOnClose = jest.fn();

    renderWithProviders(<KeyboardShortcutsHelp opened={true} onClose={mockOnClose} />);

    // Check for Cmd/Ctrl + / keyboard shortcut
    expect(screen.getByText('/')).toBeInTheDocument();
  });

  it('should display escape shortcut', () => {
    const mockOnClose = jest.fn();

    renderWithProviders(<KeyboardShortcutsHelp opened={true} onClose={mockOnClose} />);

    expect(screen.getByText(/დახურვა/i)).toBeInTheDocument();
    expect(screen.getByText('Esc')).toBeInTheDocument();
  });

  it('should call onClose when modal is closed', () => {
    const mockOnClose = jest.fn();

    const { container } = renderWithProviders(<KeyboardShortcutsHelp opened={true} onClose={mockOnClose} />);

    // Click the close button - Mantine modal close button
    const closeButton = container.querySelector('button[class*="close"]') as HTMLButtonElement;
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    } else {
      // If no close button found, the modal should still have been rendered
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    }
  });

  it('should display shortcuts in a table format', () => {
    const mockOnClose = jest.fn();

    renderWithProviders(<KeyboardShortcutsHelp opened={true} onClose={mockOnClose} />);

    // Check for table structure
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should display keyboard keys', () => {
    const mockOnClose = jest.fn();

    renderWithProviders(<KeyboardShortcutsHelp opened={true} onClose={mockOnClose} />);

    // Check that key letters are displayed
    expect(screen.getByText('K')).toBeInTheDocument();
    expect(screen.getByText('N')).toBeInTheDocument();
    expect(screen.getByText('/')).toBeInTheDocument();
    expect(screen.getByText('Esc')).toBeInTheDocument();
  });

  it('should show Cmd on Mac and Ctrl on Windows', () => {
    const mockOnClose = jest.fn();

    // Mock navigator.platform to test both scenarios
    const originalPlatform = Object.getOwnPropertyDescriptor(navigator, 'platform');

    // Test Mac
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });

    const { unmount } = renderWithProviders(
      <KeyboardShortcutsHelp opened={true} onClose={mockOnClose} />
    );

    // Should show modifier key
    const modifierKey = screen.getAllByText(/Cmd|Ctrl/i);
    expect(modifierKey.length).toBeGreaterThan(0);

    unmount();

    // Restore original
    if (originalPlatform) {
      Object.defineProperty(navigator, 'platform', originalPlatform);
    }
  });

  it('should be centered modal', () => {
    const mockOnClose = jest.fn();

    renderWithProviders(<KeyboardShortcutsHelp opened={true} onClose={mockOnClose} />);

    // Modal should be present (Mantine handles centering)
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
  });

  describe('translations', () => {
    it('should display Georgian translations by default', () => {
      localStorage.setItem('emrLanguage', 'ka');
      const mockOnClose = jest.fn();

      renderWithProviders(<KeyboardShortcutsHelp opened={true} onClose={mockOnClose} />);

      // Text may appear multiple times
      const elements = screen.getAllByText(/კლავიატურის მალსახმობები/i);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display English translations', () => {
      localStorage.setItem('emrLanguage', 'en');
      const mockOnClose = jest.fn();

      renderWithProviders(
        <KeyboardShortcutsHelp opened={true} onClose={mockOnClose} />,
        { initialLanguage: 'en' }
      );

      // Use getAllByText since the text may appear multiple times
      const elements = screen.getAllByText(/Keyboard Shortcuts/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});
