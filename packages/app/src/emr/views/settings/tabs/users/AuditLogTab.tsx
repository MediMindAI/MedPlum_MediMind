// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { AuditLogView } from '../../../account-management/AuditLogView';

/**
 * AuditLogTab - Wrapper for AuditLogView
 *
 * Simple wrapper component that renders the existing AuditLogView
 * within the Settings Hub nested tab structure.
 */
export function AuditLogTab(): JSX.Element {
  return <AuditLogView />;
}
