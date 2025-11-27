// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mantine/core';
import type { JSX } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DashboardMenu } from './components/dashboard/DashboardMenu';
import { DashboardSubMenu } from './components/dashboard/DashboardSubMenu';
import type { DashboardCategory } from './components/dashboard/DashboardSubMenu';
import { TranslationProvider } from './contexts/TranslationContext';

/**
 * Dashboard Page layout - Separate UI mode for administrative functions
 *
 * Layout:
 * ┌─────────────────────────────────────────┐
 * │ Medplum AppShell Header (native)       │ 50px - Customized in App.tsx
 * ├─────────────────────────────────────────┤
 * │ Row 1: DashboardMenu (← Back + cats)   │ 42px - White with subtle shadow
 * ├─────────────────────────────────────────┤
 * │ Row 2: DashboardSubMenu (sub-tabs)     │ 36px - Blue gradient
 * ├─────────────────────────────────────────┤
 * │ Row 3: Content Area                    │ flex: 1
 * └─────────────────────────────────────────┘
 *
 * Key difference from EMRPage:
 * - Shows DashboardMenu instead of EMRMainMenu
 * - Always shows DashboardSubMenu (category-aware)
 * - Back button to return to general EMR mode
 */
export function DashboardPage(): JSX.Element {
  const location = useLocation();

  // Determine which category we're in for the sub-menu
  const getCategory = (): DashboardCategory => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    // /emr/dashboard/[category]/[sub]
    const categorySegment = pathSegments[2] || 'users';

    if (categorySegment === 'organization') return 'organization';
    if (categorySegment === 'medical') return 'medical';
    if (categorySegment === 'system') return 'system';
    return 'users';
  };

  const category = getCategory();

  return (
    <TranslationProvider>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 50px)', // Account for Medplum AppShell header (50px)
          overflow: 'hidden',
        }}
      >
        {/* Row 1: Dashboard Navigation Menu */}
        <Box
          style={{
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '0 16px',
            background: 'white',
            borderBottom: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          }}
          data-testid="dashboard-menu"
        >
          <DashboardMenu />
        </Box>

        {/* Row 2: DashboardSubMenu (always shown, category-aware) */}
        <DashboardSubMenu category={category} />

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
