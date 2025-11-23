// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Outlet } from 'react-router-dom';

/**
 * Section component for account management routes
 * Renders child routes via <Outlet />
 *
 * Routes (defined in AppRoutes.tsx):
 * - /emr/account-management → Main dashboard (AccountManagementView)
 * - /emr/account-management/edit/:id → Full-page edit (AccountEditView)
 */
export function AccountManagementSection(): JSX.Element {
  return <Outlet />;
}
