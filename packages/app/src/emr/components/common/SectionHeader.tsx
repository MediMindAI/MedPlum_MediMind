// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { ComponentType, SVGAttributes } from 'react';
import { Box, Group, Title, Text, Stack } from '@mantine/core';

/** Icon props type for Tabler icons */
type IconProps = SVGAttributes<SVGElement> & {
  size?: number | string;
  stroke?: number;
  color?: string;
};

interface SectionHeaderProps {
  icon: ComponentType<IconProps>;
  title: string;
  subtitle?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  /** Visual variant - 'default' has subtle styling, 'prominent' has gradient accent */
  variant?: 'default' | 'prominent';
}

/**
 * Section header with icon, title, and optional subtitle
 *
 * Features:
 * - Icon with glassmorphism background
 * - Bold title with primary color
 * - Optional subtitle with dimmed color
 * - Gradient accent bar for visual hierarchy
 * - Responsive icon sizing
 * - Hover micro-interactions
 *
 * @param icon - Tabler icon component
 * @param icon.icon
 * @param title - Section title text
 * @param icon.title
 * @param subtitle - Optional subtitle text
 * @param icon.subtitle
 * @param spacing - Bottom margin (default: 'md')
 * @param icon.spacing
 * @param variant - Visual variant (default: 'default')
 * @param icon.variant
 */
export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  spacing = 'md',
  variant = 'default',
}: SectionHeaderProps) {
  const isProminent = variant === 'prominent';

  return (
    <Box
      mb={spacing}
      style={{
        position: 'relative',
      }}
    >
      <Group
        gap="md"
        align="center"
        py="sm"
        px="md"
        style={{
          background: isProminent
            ? 'linear-gradient(135deg, var(--emr-gray-50) 0%, var(--emr-gray-100) 100%)'
            : 'transparent',
          borderRadius: isProminent ? 'var(--emr-border-radius-lg)' : '0',
          borderLeft: isProminent ? '4px solid transparent' : 'none',
          borderImage: isProminent ? 'var(--emr-gradient-primary) 1' : 'none',
          transition: 'var(--emr-transition-smooth)',
        }}
      >
        {/* Icon with glassmorphism container */}
        <Box
          style={{
            background: isProminent
              ? 'var(--emr-gradient-primary)'
              : 'linear-gradient(135deg, var(--emr-gray-100) 0%, var(--emr-gray-200) 100%)',
            borderRadius: 'var(--emr-border-radius)',
            padding: isProminent ? '10px' : '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isProminent ? 'var(--emr-shadow-sm)' : 'none',
            transition: 'var(--emr-transition-smooth)',
          }}
        >
          <Icon
            size={isProminent ? 22 : 20}
            color={isProminent ? 'white' : 'var(--emr-primary)'}
            stroke={2}
            style={{
              flexShrink: 0,
            }}
          />
        </Box>

        {/* Title and subtitle */}
        {subtitle ? (
          <Stack gap={2}>
            <Title
              order={3}
              style={{
                color: 'var(--emr-text-primary)',
                fontWeight: 600,
                fontSize: isProminent ? '17px' : '15px',
                letterSpacing: '-0.2px',
                lineHeight: 1.3,
              }}
            >
              {title}
            </Title>
            <Text size="xs" c="dimmed" style={{ lineHeight: 1.4 }}>
              {subtitle}
            </Text>
          </Stack>
        ) : (
          <Title
            order={3}
            style={{
              color: 'var(--emr-text-primary)',
              fontWeight: 600,
              fontSize: isProminent ? '17px' : '15px',
              letterSpacing: '-0.2px',
              lineHeight: 1.3,
            }}
          >
            {title}
          </Title>
        )}
      </Group>
    </Box>
  );
}
