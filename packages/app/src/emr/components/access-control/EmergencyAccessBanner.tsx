// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { Alert } from '@mantine/core';
import { useTranslation } from '../../hooks/useTranslation';
import type { EmergencyAccessResult } from '../../types/permission-cache';

/**
 * Props for EmergencyAccessBanner component
 */
export interface EmergencyAccessBannerProps {
  /** Active emergency access result */
  activeAccess: EmergencyAccessResult | null;
}

/**
 * Banner showing active emergency access with expiration countdown
 *
 * Displays at top of page in yellow/orange color scheme when emergency access is active.
 *
 * @example
 * ```typescript
 * const { activeAccess } = useEmergencyAccess();
 *
 * <EmergencyAccessBanner activeAccess={activeAccess} />
 * ```
 */
export function EmergencyAccessBanner({ activeAccess }: EmergencyAccessBannerProps): JSX.Element | null {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!activeAccess?.expiresAt) {
      return;
    }

    const updateTimeRemaining = (): void => {
      const now = new Date();
      const expiresAt = new Date(activeAccess.expiresAt!);
      const diffMs = expiresAt.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeRemaining('');
        return;
      }

      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);

      if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [activeAccess?.expiresAt]);

  if (!activeAccess || !timeRemaining) {
    return null;
  }

  return (
    <Alert
      color="yellow"
      title={t('emergencyAccess.activeBanner')}
      style={{
        marginBottom: 'var(--mantine-spacing-md)',
      }}
    >
      {t('emergencyAccess.expiresIn', { time: timeRemaining })}
    </Alert>
  );
}
