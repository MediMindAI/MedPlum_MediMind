// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Alert, Group, Text, Button } from '@mantine/core';
import { IconLock, IconClock, IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import type { RecordLockStatus } from '../../types/permission-cache';

interface RecordLockBannerProps {
  status: RecordLockStatus;
  onOverride?: () => void;
}

export function RecordLockBanner({ status, onOverride }: RecordLockBannerProps): React.ReactElement | null {
  const { t } = useTranslation();

  if (!status.isLocked && status.timeRemainingMs > 0) {
    // Still in edit window - show time remaining
    const hoursRemaining = Math.floor(status.timeRemainingMs / (60 * 60 * 1000));
    const minutesRemaining = Math.floor((status.timeRemainingMs % (60 * 60 * 1000)) / (60 * 1000));

    return (
      <Alert icon={<IconClock size={16} />} color="blue" mb="md">
        <Group justify="space-between">
          <Text size="sm">
            {t('recordLock.timeRemaining', { hours: hoursRemaining, minutes: minutesRemaining })}
          </Text>
        </Group>
      </Alert>
    );
  }

  if (status.isLocked && !status.canOverride) {
    // Locked and cannot override
    return (
      <Alert icon={<IconLock size={16} />} color="red" mb="md">
        <Text size="sm">{t('recordLock.locked')}</Text>
      </Alert>
    );
  }

  if (status.isLocked && status.canOverride) {
    // Locked but can override
    return (
      <Alert icon={<IconAlertTriangle size={16} />} color="orange" mb="md">
        <Group justify="space-between">
          <Text size="sm">{t('recordLock.lockedWithOverride')}</Text>
          {onOverride && (
            <Button size="xs" variant="outline" onClick={onOverride}>
              {t('recordLock.override')}
            </Button>
          )}
        </Group>
      </Alert>
    );
  }

  return null;
}
