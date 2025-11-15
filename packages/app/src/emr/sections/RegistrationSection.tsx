// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Outlet } from 'react-router-dom';

/**
 * Registration section wrapper
 * Renders child routes via <Outlet />
 */
export function RegistrationSection(): JSX.Element {
  return <Outlet />;
}
