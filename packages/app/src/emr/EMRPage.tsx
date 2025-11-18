// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mantine/core';
import type { JSX } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { EMRMainMenu } from './components/EMRMainMenu/EMRMainMenu';
import { HorizontalSubMenu } from './components/HorizontalSubMenu/HorizontalSubMenu';
import { TranslationProvider } from './contexts/TranslationContext';

/**
 * Main EMR Page layout with 3-row structure
 *
 * Layout:
 * ┌─────────────────────────────────────┐
 * │ Row 1: MainMenu + LanguageSelector  │
 * ├─────────────────────────────────────┤
 * │ Row 2: HorizontalSubMenu (light blue)│ ← Conditional
 * ├─────────────────────────────────────┤
 * │ Row 3: Content Area (flex: 1)      │
 * └─────────────────────────────────────┘
 */
export function EMRPage(): JSX.Element {
  const location = useLocation();

  // Determine which section we're in for the sub-menu
  const getSubMenuSection = (): 'registration' | 'patient-history' | 'nomenclature' | null => {
    if (location.pathname.startsWith('/emr/registration')) {
      return 'registration';
    }
    if (location.pathname.startsWith('/emr/patient-history')) {
      return 'patient-history';
    }
    if (location.pathname.startsWith('/emr/nomenclature')) {
      return 'nomenclature';
    }
    return null;
  };

  const subMenuSection = getSubMenuSection();

  return (
    <TranslationProvider>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 92px)', // Account for Medplum AppShell header (80px) + padding (12px)
          overflow: 'hidden',
        }}
      >
        {/* Row 1: Main Navigation Menu */}
        <Box
          style={{
            height: '52px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            background: 'white',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <EMRMainMenu />
        </Box>

        {/* Row 2: HorizontalSubMenu (conditional - only for registration, patient-history, and nomenclature) */}
        {subMenuSection && <HorizontalSubMenu section={subMenuSection} />}

        {/* Row 3: Content Area */}
        <Box
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#f8f9fa',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </TranslationProvider>
  );
}