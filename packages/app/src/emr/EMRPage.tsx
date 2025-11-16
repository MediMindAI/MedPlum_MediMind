// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mantine/core';
import { Outlet, useLocation } from 'react-router-dom';
import { EMRMainMenu } from './components/EMRMainMenu/EMRMainMenu';
import { HorizontalSubMenu } from './components/HorizontalSubMenu/HorizontalSubMenu';
import { LanguageSelector } from './components/LanguageSelector/LanguageSelector';
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
  const getSubMenuSection = (): 'registration' | 'patient-history' | null => {
    if (location.pathname.startsWith('/emr/registration')) {
      return 'registration';
    }
    if (location.pathname.startsWith('/emr/patient-history')) {
      return 'patient-history';
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
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Row 1: MainMenu with LanguageSelector */}
        <Box
          style={{
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1rem',
            borderBottom: '1px solid #dee2e6',
          }}
        >
          <EMRMainMenu />
          <LanguageSelector />
        </Box>

        {/* Row 2: HorizontalSubMenu (conditional - only for registration and patient-history) */}
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