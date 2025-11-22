// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MedplumProvider } from '@medplum/react-hooks';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { MockClient } from '@medplum/mock';
import type { MedplumClient } from '@medplum/core';
import { FormFillerView } from './FormFillerView';

// Helper function to render with providers
const renderWithProviders = (
  component: React.ReactElement,
  medplum: MedplumClient,
  initialRoute: string
) => {
  return render(
    <MantineProvider>
      <Notifications />
      <MemoryRouter initialEntries={[initialRoute]}>
        <MedplumProvider medplum={medplum}>
          <Routes>
            <Route path="/emr/forms/fill/:id" element={component} />
            <Route path="/emr/forms/search" element={<div>Search Page</div>} />
            <Route path="/emr/forms" element={<div>Forms Page</div>} />
          </Routes>
        </MedplumProvider>
      </MemoryRouter>
    </MantineProvider>
  );
};

describe('FormFillerView', () => {
  let medplum: MedplumClient;

  beforeEach(() => {
    medplum = new MockClient() as unknown as MedplumClient;
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  describe('Error Handling', () => {
    it('should render error when questionnaire not found', async () => {
      renderWithProviders(
        <FormFillerView />,
        medplum,
        `/emr/forms/fill/non-existent-id-xyz`
      );

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      // Should show go back button
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });

    it('should display go back button on error', async () => {
      renderWithProviders(
        <FormFillerView />,
        medplum,
        `/emr/forms/fill/non-existent-id`
      );

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      // Go back button should be visible
      const goBackButton = screen.getByRole('button', { name: /go back/i });
      expect(goBackButton).toBeInTheDocument();
    });
  });

  // Integration tests with actual resources would need a different setup
  // The MockClient needs special handling for async resource creation/retrieval
  // These tests verify the basic error handling functionality
});
