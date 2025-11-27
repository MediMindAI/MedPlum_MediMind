// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Outlet } from 'react-router-dom';

/**
 * Section component for settings routes
 * Renders child routes via <Outlet />
 *
 * Routes (defined in AppRoutes.tsx):
 * - /emr/settings → Main settings hub (SettingsView)
 * - /emr/settings/users/* → User management tabs
 * - /emr/settings/organization/* → Organization tabs
 * - /emr/settings/medical/* → Medical data tabs
 * - /emr/settings/system/* → System tabs
 */
export function SettingsSection(): JSX.Element {
  return <Outlet />;
}
