// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import { SensitiveDataGate } from './SensitiveDataGate';
import { useSensitiveDataAccess } from '../../hooks/useSensitiveDataAccess';
import type { SensitiveCategory } from '../../types/permission-cache';

// Mock the hooks
jest.mock('../../hooks/useSensitiveDataAccess');
jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'sensitiveData.restricted': 'Restricted Data',
        'sensitiveData.restrictedMessage': 'You do not have permission to view this sensitive information.',
        'sensitiveData.category.mental-health': 'Mental Health Records',
        'sensitiveData.category.hiv-status': 'HIV Status Information',
        'sensitiveData.category.substance-abuse': 'Substance Abuse Records',
        'sensitiveData.category.genetic-testing': 'Genetic Testing Results',
        'sensitiveData.category.reproductive-health': 'Reproductive Health Records',
        'sensitiveData.category.vip-patient': 'VIP Patient Information',
      };
      return translations[key] || key;
    },
    lang: 'en',
    setLang: jest.fn(),
  }),
}));

const mockUseSensitiveDataAccess = useSensitiveDataAccess as jest.MockedFunction<typeof useSensitiveDataAccess>;

describe('SensitiveDataGate', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'en');
  });

  function renderWithProviders(
    categories: SensitiveCategory[],
    children: React.ReactNode,
    fallback?: React.ReactNode
  ) {
    return render(
      <MantineProvider>
        <MedplumProvider medplum={medplum}>
          <SensitiveDataGate categories={categories} fallback={fallback}>
            {children}
          </SensitiveDataGate>
        </MedplumProvider>
      </MantineProvider>
    );
  }

  it('should render children when access is granted', () => {
    mockUseSensitiveDataAccess.mockReturnValue({
      canAccess: true,
    });

    renderWithProviders(['mental-health'], <div>Sensitive Patient Data</div>);

    expect(screen.getByText('Sensitive Patient Data')).toBeInTheDocument();
    expect(screen.queryByText('Restricted Data')).not.toBeInTheDocument();
  });

  it('should show restriction alert when access is denied', () => {
    mockUseSensitiveDataAccess.mockReturnValue({
      canAccess: false,
      restrictedCategory: 'mental-health',
      reason: 'Access to mental-health data requires special permission',
    });

    renderWithProviders(['mental-health'], <div>Sensitive Patient Data</div>);

    expect(screen.queryByText('Sensitive Patient Data')).not.toBeInTheDocument();
    expect(screen.getByText('Restricted Data')).toBeInTheDocument();
    expect(
      screen.getByText('You do not have permission to view this sensitive information.')
    ).toBeInTheDocument();
    expect(screen.getByText('Mental Health Records')).toBeInTheDocument();
  });

  it('should show HIV status restriction message', () => {
    mockUseSensitiveDataAccess.mockReturnValue({
      canAccess: false,
      restrictedCategory: 'hiv-status',
      reason: 'Access to hiv-status data requires special permission',
    });

    renderWithProviders(['hiv-status'], <div>HIV Test Results</div>);

    expect(screen.queryByText('HIV Test Results')).not.toBeInTheDocument();
    expect(screen.getByText('HIV Status Information')).toBeInTheDocument();
  });

  it('should show substance abuse restriction message', () => {
    mockUseSensitiveDataAccess.mockReturnValue({
      canAccess: false,
      restrictedCategory: 'substance-abuse',
    });

    renderWithProviders(['substance-abuse'], <div>Substance Abuse Records</div>);

    expect(screen.getByText('Substance Abuse Records')).toBeInTheDocument();
  });

  it('should show genetic testing restriction message', () => {
    mockUseSensitiveDataAccess.mockReturnValue({
      canAccess: false,
      restrictedCategory: 'genetic-testing',
    });

    renderWithProviders(['genetic-testing'], <div>Genetic Test Results</div>);

    expect(screen.getByText('Genetic Testing Results')).toBeInTheDocument();
  });

  it('should show reproductive health restriction message', () => {
    mockUseSensitiveDataAccess.mockReturnValue({
      canAccess: false,
      restrictedCategory: 'reproductive-health',
    });

    renderWithProviders(['reproductive-health'], <div>Reproductive Health Data</div>);

    expect(screen.getByText('Reproductive Health Records')).toBeInTheDocument();
  });

  it('should show VIP patient restriction message', () => {
    mockUseSensitiveDataAccess.mockReturnValue({
      canAccess: false,
      restrictedCategory: 'vip-patient',
    });

    renderWithProviders(['vip-patient'], <div>VIP Patient Details</div>);

    expect(screen.getByText('VIP Patient Information')).toBeInTheDocument();
  });

  it('should render custom fallback when provided and access denied', () => {
    mockUseSensitiveDataAccess.mockReturnValue({
      canAccess: false,
      restrictedCategory: 'mental-health',
    });

    renderWithProviders(
      ['mental-health'],
      <div>Sensitive Data</div>,
      <div>Custom Access Denied Message</div>
    );

    expect(screen.queryByText('Sensitive Data')).not.toBeInTheDocument();
    expect(screen.queryByText('Restricted Data')).not.toBeInTheDocument();
    expect(screen.getByText('Custom Access Denied Message')).toBeInTheDocument();
  });

  it('should handle multiple categories correctly', () => {
    mockUseSensitiveDataAccess.mockReturnValue({
      canAccess: true,
    });

    renderWithProviders(['mental-health', 'hiv-status', 'vip-patient'], <div>Multi-Category Data</div>);

    expect(screen.getByText('Multi-Category Data')).toBeInTheDocument();
  });

  it('should display shield lock icon in restriction alert', () => {
    mockUseSensitiveDataAccess.mockReturnValue({
      canAccess: false,
      restrictedCategory: 'mental-health',
    });

    const { container } = renderWithProviders(['mental-health'], <div>Sensitive Data</div>);

    // Check that the Alert component is rendered (Mantine Alert wraps icon)
    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
  });

  it('should render children when empty categories array and access granted', () => {
    mockUseSensitiveDataAccess.mockReturnValue({
      canAccess: true,
    });

    renderWithProviders([], <div>Public Data</div>);

    expect(screen.getByText('Public Data')).toBeInTheDocument();
  });
});
