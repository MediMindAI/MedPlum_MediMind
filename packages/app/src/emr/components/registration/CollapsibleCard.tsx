// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Badge, Box, Card, Collapse, Group, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { ReactNode, useState } from 'react';

interface CollapsibleCardProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: string | ReactNode; // Emoji string or React icon component
  badge?: string | number; // Count or status badge
  shadow?: string;
  padding?: string;
  radius?: string;
  withBorder?: boolean;
}

/**
 * Collapsible Card component for wrapping entire sections
 * Maintains Mantine Card styling while adding collapse functionality
 */
export function CollapsibleCard({
  title,
  children,
  defaultOpen = true,
  icon,
  badge,
  shadow = 'md',
  padding = 'xl',
  radius = 'lg',
  withBorder = true,
}: CollapsibleCardProps) {
  const [opened, setOpened] = useState(defaultOpen);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card shadow={shadow} padding={0} radius={radius} withBorder={withBorder}>
      {/* Collapsible Header */}
      <UnstyledButton
        onClick={() => setOpened(!opened)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '100%',
          padding: '16px 20px',
          backgroundColor: opened
            ? 'rgba(99, 179, 237, 0.08)' // Active background
            : isHovered
              ? 'rgba(99, 179, 237, 0.05)' // Hover background
              : '#f8f9fa', // Default background
          borderTopLeftRadius: 'var(--emr-border-radius-lg, 8px)',
          borderTopRightRadius: 'var(--emr-border-radius-lg, 8px)',
          borderBottom: opened ? '1px solid #e9ecef' : 'none',
          transition: 'background-color 0.15s ease',
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap">
            {icon && (
              <Box
                style={{
                  fontSize: typeof icon === 'string' ? '24px' : undefined,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {icon}
              </Box>
            )}
            <Text fw={600} size="md" c="var(--emr-secondary, #2b6cb0)">
              {title}
            </Text>
            {badge !== undefined && (
              <Badge
                size="lg"
                color="blue"
                variant="light"
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                {badge}
              </Badge>
            )}
          </Group>
          <Box
            style={{
              transition: 'transform 0.2s ease',
              transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <IconChevronDown size={20} />
          </Box>
        </Group>
      </UnstyledButton>

      {/* Collapsible Content */}
      <Collapse in={opened}>
        <Box p={padding}>{children}</Box>
      </Collapse>
    </Card>
  );
}
