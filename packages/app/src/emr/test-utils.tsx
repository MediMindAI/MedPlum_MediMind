// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { ReactElement } from 'react';
import React from 'react';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { MemoryRouterProps } from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';
import { MedplumProvider } from '@medplum/react-hooks';
import { MantineProvider } from '@mantine/core';
import { MockClient } from '@medplum/mock';
import { TranslationProvider } from './contexts/TranslationContext';

/**
 * Custom render function that wraps component with all necessary providers
 *
 * @param ui - Component to render
 * @param options - Render options with additional provider configurations
 * @param options.medplum
 * @param options.initialLanguage
 * @param options.routerProps
 * @returns Render result from @testing-library/react
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    medplum = new MockClient(),
    initialLanguage = 'ka',
    routerProps = {},
    ...renderOptions
  }: {
    medplum?: MockClient;
    initialLanguage?: 'ka' | 'en' | 'ru';
    routerProps?: MemoryRouterProps;
  } & Omit<RenderOptions, 'wrapper'> = {}
) {
  // Set language in localStorage for TranslationContext
  if (typeof window !== 'undefined') {
    localStorage.setItem('emrLanguage', initialLanguage);
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MantineProvider>
        <TranslationProvider>
          <MemoryRouter {...routerProps}>
            <MedplumProvider medplum={medplum}>{children}</MedplumProvider>
          </MemoryRouter>
        </TranslationProvider>
      </MantineProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Create a wrapper component with all providers for hook testing
 *
 * @param options - Provider configurations
 * @param options.medplum
 * @param options.initialLanguage
 * @param options.routerProps
 * @returns Wrapper component
 */
export function createTestWrapper({
  medplum = new MockClient(),
  initialLanguage = 'ka',
  routerProps = {},
}: {
  medplum?: MockClient;
  initialLanguage?: 'ka' | 'en' | 'ru';
  routerProps?: MemoryRouterProps;
} = {}) {
  // Set language in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('emrLanguage', initialLanguage);
  }

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <MantineProvider>
        <TranslationProvider>
          <MemoryRouter {...routerProps}>
            <MedplumProvider medplum={medplum}>{children}</MedplumProvider>
          </MemoryRouter>
        </TranslationProvider>
      </MantineProvider>
    );
  };
}

/**
 * Setup function for tests that need MockClient
 *
 * @returns Object with medplum client and cleanup function
 */
export function setupMockClient() {
  const medplum = new MockClient();

  // Clear localStorage before each test
  if (typeof window !== 'undefined') {
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  }

  const cleanup = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  };

  return { medplum, cleanup };
}

/**
 * Wait for async operations to complete
 * Useful for waiting for data fetching, state updates, etc.
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

// Re-export everything from @testing-library/react for convenience
export * from '@testing-library/react';
