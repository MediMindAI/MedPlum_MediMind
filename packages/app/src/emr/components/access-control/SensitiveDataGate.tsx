// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Alert, Text, Paper, Stack } from '@mantine/core';
import { IconShieldLock } from '@tabler/icons-react';
import { useSensitiveDataAccess } from '../../hooks/useSensitiveDataAccess';
import { useTranslation } from '../../hooks/useTranslation';
import type { SensitiveCategory } from '../../types/permission-cache';

interface SensitiveDataGateProps {
  categories: SensitiveCategory[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that gates access to sensitive data based on user permissions.
 *
 * Displays either the children (if access granted) or a fallback/restriction message.
 *
 * @param categories - Array of sensitive data categories to check
 * @param children - Content to show if access is granted
 * @param fallback - Optional custom fallback to show if access denied (default: restriction alert)
 *
 * @example
 * ```typescript
 * <SensitiveDataGate categories={['mental-health', 'hiv-status']}>
 *   <PatientMentalHealthRecords />
 * </SensitiveDataGate>
 * ```
 */
export function SensitiveDataGate({
  categories,
  children,
  fallback,
}: SensitiveDataGateProps): React.ReactElement {
  const { canAccess, restrictedCategory } = useSensitiveDataAccess(categories);
  const { t } = useTranslation();

  if (!canAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Paper p="md" withBorder>
        <Alert icon={<IconShieldLock size={16} />} color="orange" title={t('sensitiveData.restricted')}>
          <Stack gap="xs">
            <Text size="sm">{t('sensitiveData.restrictedMessage')}</Text>
            <Text size="xs" c="dimmed">
              {t(`sensitiveData.category.${restrictedCategory}`)}
            </Text>
          </Stack>
        </Alert>
      </Paper>
    );
  }

  return <>{children}</>;
}
