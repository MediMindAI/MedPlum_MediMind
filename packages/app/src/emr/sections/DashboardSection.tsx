// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Outlet } from 'react-router-dom';

/**
 * Section component for dashboard routes
 * Renders child routes via <Outlet />
 *
 * Routes (defined in AppRoutes.tsx):
 * - /emr/dashboard → Main dashboard hub (DashboardView)
 * - /emr/dashboard/users/* → User management tabs
 * - /emr/dashboard/organization/* → Organization tabs
 * - /emr/dashboard/medical/* → Medical data tabs
 * - /emr/dashboard/system/* → System tabs
 */
export function DashboardSection(): JSX.Element {
  return <Outlet />;
}
