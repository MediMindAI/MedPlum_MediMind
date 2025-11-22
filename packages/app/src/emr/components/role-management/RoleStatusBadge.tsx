// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Badge } from '@mantine/core';

interface RoleStatusBadgeProps {
  status: 'active' | 'inactive';
}

/**
 * Simple badge component for role status
 * @param props - Component props
 * @param props.status - Role status (active or inactive)
 * @returns Role status badge component
 */
export function RoleStatusBadge({ status }: RoleStatusBadgeProps): JSX.Element {
  return (
    <Badge
      color={status === 'active' ? 'green' : 'gray'}
      variant="light"
      size="sm"
    >
      {status === 'active' ? 'Active' : 'Inactive'}
    </Badge>
  );
}
