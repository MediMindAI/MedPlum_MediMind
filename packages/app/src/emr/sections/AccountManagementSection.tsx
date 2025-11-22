// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Routes, Route, Navigate } from 'react-router-dom';
import { AccountManagementView } from '../views/account-management/AccountManagementView';
import { AccountEditView } from '../views/account-management/AccountEditView';

/**
 * Section component for account management routes
 *
 * Routes:
 * - /emr/account-management → Main dashboard (AccountManagementView)
 * - /emr/account-management/edit/:id → Full-page edit (AccountEditView)
 */
export function AccountManagementSection(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<AccountManagementView />} />
      <Route path="/edit/:id" element={<AccountEditView />} />
      <Route path="*" element={<Navigate to="/emr/account-management" replace />} />
    </Routes>
  );
}
