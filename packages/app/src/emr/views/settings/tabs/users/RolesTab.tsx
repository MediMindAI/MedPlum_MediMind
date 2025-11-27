// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { RoleManagementView } from '../../../role-management/RoleManagementView';

/**
 * RolesTab - Wrapper for RoleManagementView
 *
 * Simple wrapper component that renders the existing RoleManagementView
 * within the Settings Hub nested tab structure.
 */
export function RolesTab(): JSX.Element {
  return <RoleManagementView />;
}
