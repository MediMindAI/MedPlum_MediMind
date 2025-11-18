// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Paper, Box, Group, ThemeIcon, Text, Badge } from '@mantine/core';
import { ReactNode } from 'react';
import { SECTION_COLORS, SHADOWS, BORDER_RADIUS } from './theme.constants';

export interface SectionCardProps {
  /** Section number (1-4) - determines color scheme */
  number: 1 | 2 | 3 | 4;
  /** Section title text */
  title: string;
  /** Optional badge text to display next to title */
  badgeText?: string;
  /** Optional badge icon */
  badgeIcon?: ReactNode;
  /** Optional right-aligned content (e.g., checkbox, button) */
  rightContent?: ReactNode;
  /** Children content */
  children: ReactNode;
  /** Whether to show the numbered badge (default: true) */
  showNumber?: boolean;
  /** Custom padding for content area */
  padding?: string | number;
}

/**
 * SectionCard - Reusable section wrapper with premium styling
 *
 * Features:
 * - Numbered badge with gradient background matching section theme
 * - Colored gradient left border accent
 * - Consistent spacing and layout
 * - Optional feature badge
 * - Right-aligned content support
 *
 * @example
 * ```tsx
 * <SectionCard number={1} title="რეგისტრაცია" badgeText="Basic Info">
 *   <Grid>
 *     <Grid.Col span={6}>
 *       <TextInput label="First Name" />
 *     </Grid.Col>
 *   </Grid>
 * </SectionCard>
 * ```
 */
export function SectionCard({
  number,
  title,
  badgeText,
  badgeIcon,
  rightContent,
  children,
  showNumber = true,
  padding = 'lg',
}: SectionCardProps) {
  const colorScheme = SECTION_COLORS[number];

  return (
    <Paper
      shadow="sm"
      radius={BORDER_RADIUS.lg}
      p={padding}
      style={{
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: SHADOWS.md,
      }}
    >
      {/* Left gradient border accent */}
      <Box
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: colorScheme.gradient,
          borderRadius: `${BORDER_RADIUS.lg} 0 0 ${BORDER_RADIUS.lg}`,
        }}
      />

      {/* Section Header */}
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          {showNumber && (
            <ThemeIcon
              size={36}
              radius="xl"
              style={{
                background: colorScheme.gradient,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              <Text c="white" fw={700} size="sm">
                {number}
              </Text>
            </ThemeIcon>
          )}
          <Text
            fw={700}
            size="lg"
            style={{
              color: colorScheme.color,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </Text>
          {badgeText && (
            <Badge
              variant="light"
              color="blue"
              size="sm"
              leftSection={badgeIcon}
              style={{
                textTransform: 'none',
              }}
            >
              {badgeText}
            </Badge>
          )}
        </Group>

        {rightContent && <Box>{rightContent}</Box>}
      </Group>

      {/* Section Content */}
      <Box>{children}</Box>
    </Paper>
  );
}
