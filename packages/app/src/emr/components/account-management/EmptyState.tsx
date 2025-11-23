// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack, Text, ThemeIcon, Button } from '@mantine/core';
import { IconUsers, IconSearch, IconPlus } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';

interface EmptyStateProps {
  /** Variant determining the message displayed */
  variant: 'empty' | 'no-results';
  /** Optional callback for action button */
  onAction?: () => void;
  /** Optional label for action button */
  actionLabel?: string;
}

/**
 * Empty state component for AccountTable
 *
 * Features:
 * - Two variants: 'empty' (no accounts) and 'no-results' (no search results)
 * - Centered message with appropriate icon
 * - Optional call-to-action button
 * - Multilingual support (ka/en/ru)
 * - Theme-consistent styling
 *
 * @param variant - 'empty' for no accounts, 'no-results' for no search results
 * @param onAction - Optional callback when action button is clicked
 * @param actionLabel - Optional label for the action button
 */
export function EmptyState({ variant, onAction, actionLabel }: EmptyStateProps): JSX.Element {
  const { t } = useTranslation();

  const isEmptyVariant = variant === 'empty';
  const Icon = isEmptyVariant ? IconUsers : IconSearch;

  const title = isEmptyVariant
    ? t('accountManagement.empty.title')
    : t('accountManagement.empty.noResults');

  const description = isEmptyVariant
    ? t('accountManagement.empty.description')
    : t('accountManagement.empty.tryDifferent');

  return (
    <Box ta="center" py={80}>
      <Stack align="center" gap="lg">
        {/* Icon */}
        <ThemeIcon
          size={80}
          radius={80}
          variant="light"
          color={isEmptyVariant ? 'blue' : 'gray'}
          style={{
            background: isEmptyVariant
              ? 'linear-gradient(135deg, rgba(26, 54, 93, 0.1) 0%, rgba(43, 108, 176, 0.1) 100%)'
              : 'var(--emr-gray-100)',
          }}
        >
          <Icon size={40} stroke={1.5} />
        </ThemeIcon>

        {/* Title */}
        <Text size="xl" fw={600} c="dimmed">
          {title}
        </Text>

        {/* Description */}
        <Text size="sm" c="dimmed" maw={400}>
          {description}
        </Text>

        {/* Action Button */}
        {onAction && actionLabel && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={onAction}
            variant="filled"
            size="md"
            style={{
              background: 'var(--emr-gradient-primary)',
            }}
          >
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
