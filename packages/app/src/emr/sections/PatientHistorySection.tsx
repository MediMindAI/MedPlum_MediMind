// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Outlet } from 'react-router-dom';

/**
 * Patient History section wrapper
 * Renders child routes via <Outlet />
 */
export function PatientHistorySection(): JSX.Element {
  return <Outlet />;
}
