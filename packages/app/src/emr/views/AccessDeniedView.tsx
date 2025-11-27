// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Title, Text, Button, Stack, Center } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { useTranslation } from '../hooks/useTranslation';

/**
 * AccessDeniedView - Friendly access denied page displayed when user lacks permission.
 *
 * Features:
 * - Multilingual support (Georgian, English, Russian)
 * - Lock icon for visual clarity
 * - "Go Back" button for easy navigation
 * - Styled with EMR theme colors
 *
 * Usage:
 * ```typescript
 * // In route configuration
 * <Route path="/emr/restricted" element={
 *   hasPermission ? <RestrictedPage /> : <AccessDeniedView />
 * } />
 * ```
 *
 * @returns AccessDeniedView component
 */
export function AccessDeniedView(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Center style={{ minHeight: 'calc(100vh - 200px)', padding: '20px' }}>
      <Paper
        shadow="sm"
        p="xl"
        radius="md"
        style={{
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          border: '1px solid var(--emr-primary)',
        }}
      >
        <Stack gap="lg" align="center">
          {/* Lock Icon */}
          <IconLock
            size={64}
            color="var(--emr-primary)"
            style={{ opacity: 0.8 }}
          />

          {/* Title */}
          <Title order={2} style={{ color: 'var(--emr-primary)' }}>
            {t('accessDenied.title')}
          </Title>

          {/* Message */}
          <Text size="md" c="dimmed">
            {t('accessDenied.message')}
          </Text>

          {/* Go Back Button */}
          <Button
            size="md"
            onClick={() => navigate(-1)}
            style={{
              background: 'var(--emr-gradient-primary)',
              marginTop: '16px',
            }}
          >
            {t('accessDenied.goBack')}
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}
