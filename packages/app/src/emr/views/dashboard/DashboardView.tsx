// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Box } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import '../../styles/theme.css';

/**
 * Dashboard View - Content wrapper for dashboard pages
 *
 * The navigation (category tabs and sub-tabs) is handled by DashboardPage layout.
 * This view just renders the content from child routes.
 */
export function DashboardView(): JSX.Element {
  return (
    <Container size="100%" px={{ base: 16, sm: 24, md: 32, lg: 40 }} py={{ base: 20, md: 28 }} style={{ maxWidth: '1600px' }}>
      <Box>
        <Outlet />
      </Box>
    </Container>
  );
}
