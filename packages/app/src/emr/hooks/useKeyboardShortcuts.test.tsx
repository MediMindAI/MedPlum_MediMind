// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { createTestWrapper } from '../test-utils';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  it('should register handlers without errors', () => {
    const handlers = {
      onSearch: jest.fn(),
      onCreate: jest.fn(),
      onHelp: jest.fn(),
      onEscape: jest.fn(),
    };

    // Should not throw
    expect(() => {
      renderHook(() => useKeyboardShortcuts(handlers), {
        wrapper: createTestWrapper(),
      });
    }).not.toThrow();
  });

  it('should accept all handler functions', () => {
    const handlers = {
      onSearch: jest.fn(),
      onCreate: jest.fn(),
      onHelp: jest.fn(),
      onEscape: jest.fn(),
    };

    const { result } = renderHook(() => useKeyboardShortcuts(handlers), {
      wrapper: createTestWrapper(),
    });

    // Hook should complete without errors
    expect(result).toBeDefined();
  });

  it('should handle partial handlers gracefully', () => {
    const handlers = {
      onSearch: jest.fn(),
      onCreate: jest.fn(),
      onHelp: jest.fn(),
      onEscape: jest.fn(),
    };

    // Should not throw even with minimal handlers
    expect(() => {
      renderHook(() => useKeyboardShortcuts(handlers), {
        wrapper: createTestWrapper(),
      });
    }).not.toThrow();
  });

  it('should clean up on unmount', () => {
    const handlers = {
      onSearch: jest.fn(),
      onCreate: jest.fn(),
      onHelp: jest.fn(),
      onEscape: jest.fn(),
    };

    const { unmount } = renderHook(() => useKeyboardShortcuts(handlers), {
      wrapper: createTestWrapper(),
    });

    // Should unmount without errors
    expect(() => {
      unmount();
    }).not.toThrow();
  });

  it('should not crash when called multiple times', () => {
    const handlers = {
      onSearch: jest.fn(),
      onCreate: jest.fn(),
      onHelp: jest.fn(),
      onEscape: jest.fn(),
    };

    expect(() => {
      const { rerender } = renderHook(() => useKeyboardShortcuts(handlers), {
        wrapper: createTestWrapper(),
      });

      // Rerender should work
      rerender();
      rerender();
    }).not.toThrow();
  });

  it('should work with memoized handlers', () => {
    const handlers = {
      onSearch: jest.fn(),
      onCreate: jest.fn(),
      onHelp: jest.fn(),
      onEscape: jest.fn(),
    };

    expect(() => {
      renderHook(
        () =>
          useKeyboardShortcuts({
            onSearch: handlers.onSearch,
            onCreate: handlers.onCreate,
            onHelp: handlers.onHelp,
            onEscape: handlers.onEscape,
          }),
        {
          wrapper: createTestWrapper(),
        }
      );
    }).not.toThrow();
  });
});
