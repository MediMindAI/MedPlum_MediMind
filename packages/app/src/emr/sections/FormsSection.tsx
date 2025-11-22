// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Outlet } from 'react-router-dom';

/**
 * Forms section wrapper
 * Renders child routes via <Outlet />
 */
export function FormsSection(): JSX.Element {
  return <Outlet />;
}
