// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useHotkeys } from '@mantine/hooks';

interface KeyboardShortcutHandlers {
  /** Handler for search shortcut (Cmd/Ctrl + K) */
  onSearch: () => void;
  /** Handler for create shortcut (Cmd/Ctrl + N) */
  onCreate: () => void;
  /** Handler for help shortcut (Cmd/Ctrl + /) */
  onHelp: () => void;
  /** Handler for escape shortcut */
  onEscape: () => void;
}

/**
 * Hook for managing keyboard shortcuts in account management
 *
 * Registers the following shortcuts:
 * - mod+K: Focus search input
 * - mod+N: Open create form
 * - mod+/: Open shortcuts help
 * - Escape: Clear selection/close modals
 *
 * Uses @mantine/hooks useHotkeys for cross-platform support
 * 'mod' is automatically Cmd on Mac and Ctrl on Windows/Linux
 *
 * @param handlers - Object containing handler functions for each shortcut
 */
export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers): void {
  useHotkeys([
    // Search - Cmd/Ctrl + K
    [
      'mod+k',
      (event) => {
        event.preventDefault();
        handlers.onSearch?.();
      },
    ],
    // Create new account - Cmd/Ctrl + N
    [
      'mod+n',
      (event) => {
        event.preventDefault();
        handlers.onCreate?.();
      },
    ],
    // Show shortcuts help - Cmd/Ctrl + /
    [
      'mod+/',
      (event) => {
        event.preventDefault();
        handlers.onHelp?.();
      },
    ],
    // Escape - Close modal/clear selection
    [
      'escape',
      () => {
        handlers.onEscape?.();
      },
    ],
  ]);
}
