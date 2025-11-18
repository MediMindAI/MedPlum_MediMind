// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Outlet } from 'react-router-dom';

/**
 * Nomenclature section wrapper
 * Renders child routes via <Outlet />
 */
export function NomenclatureSection(): JSX.Element {
  return <Outlet />;
}
