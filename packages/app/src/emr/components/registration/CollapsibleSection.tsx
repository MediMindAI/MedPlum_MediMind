// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Collapse, Group, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import type { ReactNode} from 'react';
import { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode; // Professional outline icon component
}

/**
 * Professional collapsible section with clean design
 * - Outline icons in theme colors
 * - Subtle backgrounds
 * - No colorful accents
 * @param root0
 * @param root0.title
 * @param root0.children
 * @param root0.defaultOpen
 * @param root0.icon
 */
export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  icon,
}: CollapsibleSectionProps) {
  const [opened, setOpened] = useState(defaultOpen);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box>
      <UnstyledButton
        onClick={() => setOpened(!opened)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '100%',
          padding: '14px 18px',
          backgroundColor: isHovered ? '#f8f9fa' : 'white',
          borderRadius: '8px',
          marginBottom: opened ? '12px' : 0,
          border: '1px solid var(--emr-gray-200)',
          transition: 'all 0.2s ease',
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap">
            {icon && (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--emr-primary)',
                }}
              >
                {icon}
              </Box>
            )}
            <Text
              fw={600}
              size="md"
              style={{
                whiteSpace: 'nowrap',
                color: 'var(--emr-primary)',
                letterSpacing: '-0.2px',
              }}
            >
              {title}
            </Text>
          </Group>
          <Box
            style={{
              transition: 'transform 0.2s ease',
              transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--emr-gray-600)',
            }}
          >
            <IconChevronDown size={20} stroke={2.5} />
          </Box>
        </Group>
      </UnstyledButton>
      <Collapse in={opened}>
        <Box p="md">{children}</Box>
      </Collapse>
    </Box>
  );
}
