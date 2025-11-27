// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Button, ButtonProps, Tooltip } from '@mantine/core';
import { usePermissionCheck } from '../../hooks/usePermissionCheck';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Props for PermissionButton component
 */
export interface PermissionButtonProps extends Omit<ButtonProps, 'disabled'> {
  /** Permission code required to enable this button (e.g., 'create-patient') */
  permission: string;
  /** Hide button completely if permission denied (default: false = show disabled) */
  hiddenIfDenied?: boolean;
  /** Custom tooltip text when disabled due to permission denial */
  deniedTooltip?: string;
  /** Click handler - only fires if permission is granted */
  onClick?: () => void;
  /** Button content */
  children: React.ReactNode;
}

/**
 * Button component that respects permission checks.
 *
 * Features:
 * - Automatically disables button when permission is denied
 * - Can hide button completely with hiddenIfDenied prop
 * - Shows loading state during permission check
 * - Displays tooltip on hover when permission denied
 * - Only fires onClick when permission is granted
 * - Implements fail-closed security (disabled by default)
 *
 * @example
 * ```typescript
 * // Show disabled button when permission denied
 * <PermissionButton
 *   permission="create-patient"
 *   onClick={handleCreate}
 *   deniedTooltip="Admin access required"
 * >
 *   Create Patient
 * </PermissionButton>
 *
 * // Hide button completely when permission denied
 * <PermissionButton
 *   permission="delete-patient"
 *   onClick={handleDelete}
 *   hiddenIfDenied={true}
 *   color="red"
 * >
 *   Delete Patient
 * </PermissionButton>
 * ```
 */
export function PermissionButton({
  permission,
  hiddenIfDenied = false,
  deniedTooltip,
  onClick,
  children,
  ...buttonProps
}: PermissionButtonProps): React.ReactElement | null {
  const { hasPermission, loading } = usePermissionCheck(permission);
  const { t } = useTranslation();

  // Hide button if permission denied and hiddenIfDenied is true
  if (!hasPermission && !loading && hiddenIfDenied) {
    return null;
  }

  /**
   * Handle button click - only fire onClick if permission is granted
   */
  const handleClick = () => {
    if (hasPermission && onClick) {
      onClick();
    }
  };

  const button = (
    <Button {...buttonProps} disabled={!hasPermission || loading} onClick={handleClick} loading={loading}>
      {children}
    </Button>
  );

  // Wrap with tooltip if permission denied and tooltip text provided
  if (!hasPermission && !loading && deniedTooltip) {
    return (
      <Tooltip label={deniedTooltip || t('permission.accessDenied')}>
        <span>{button}</span>
      </Tooltip>
    );
  }

  return button;
}
