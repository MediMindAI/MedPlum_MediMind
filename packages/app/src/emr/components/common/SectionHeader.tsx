// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Group, Title, Text, Stack } from '@mantine/core';
import type { TablerIconsProps } from '@tabler/icons-react';

interface SectionHeaderProps {
  icon: React.ComponentType<TablerIconsProps>;
  title: string;
  subtitle?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Section header with icon, title, and optional subtitle
 *
 * Features:
 * - Icon with primary color
 * - Bold title with primary color
 * - Optional subtitle with dimmed color
 * - Bottom border for separation
 * - Responsive icon sizing
 *
 * @param icon - Tabler icon component
 * @param icon.icon
 * @param title - Section title text
 * @param icon.title
 * @param subtitle - Optional subtitle text
 * @param icon.subtitle
 * @param spacing - Bottom margin (default: 'xl')
 * @param icon.spacing
 */
export function SectionHeader({ icon: Icon, title, subtitle, spacing = 'xl' }: SectionHeaderProps): JSX.Element {
  return (
    <Box
      mb={spacing}
      pb="md"
      style={{
        borderBottom: '2px solid var(--emr-gray-200)',
      }}
    >
      <Group gap="sm" align="center">
        <Icon
          size={28}
          color="var(--emr-primary)"
          stroke={2}
          style={{
            flexShrink: 0,
          }}
        />
        {subtitle ? (
          <Stack gap={2}>
            <Title
              order={2}
              style={{
                color: 'var(--emr-primary)',
                fontWeight: 700,
                fontSize: '22px',
                letterSpacing: '-0.3px',
                lineHeight: 1.2,
              }}
            >
              {title}
            </Title>
            <Text size="sm" c="dimmed">
              {subtitle}
            </Text>
          </Stack>
        ) : (
          <Title
            order={2}
            style={{
              color: 'var(--emr-primary)',
              fontWeight: 700,
              fontSize: '22px',
              letterSpacing: '-0.3px',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Title>
        )}
      </Group>
    </Box>
  );
}
