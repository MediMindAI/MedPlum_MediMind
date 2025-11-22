// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Paper, Text, Stack, ThemeIcon } from '@mantine/core';
import { IconHammer } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';

interface PlaceholderViewProps {
  titleKey: string;
  messageKey?: string;
  testId?: string;
}

/**
 * Placeholder view for pages under development
 * @param root0
 * @param root0.titleKey
 * @param root0.messageKey
 * @param root0.testId
 */
export function PlaceholderView({ titleKey, messageKey, testId }: PlaceholderViewProps): JSX.Element {
  const { t } = useTranslation();

  return (
    <Paper
      p="xl"
      ta="center"
      mih={400}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      data-testid={testId}
    >
      <Stack align="center" gap="lg">
        <ThemeIcon size={80} radius="xl" color="gray" variant="light">
          <IconHammer size={48} />
        </ThemeIcon>
        <Text size="xl" fw={600}>
          {t(titleKey)}
        </Text>
        {messageKey && (
          <Text c="dimmed">
            {t(messageKey)}
          </Text>
        )}
        <Text c="dimmed" size="sm">
          {t('ui.underDevelopment')}
        </Text>
      </Stack>
    </Paper>
  );
}