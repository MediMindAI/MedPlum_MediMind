// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Collapse, Group, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
}

/**
 * Premium Collapsible Section
 * Aesthetic: "Clinical Elegance"
 * Features:
 * - Animated left accent bar on hover/expand
 * - Smooth spring-like chevron rotation
 * - Icon container transforms on expand
 * - Refined shadow and border transitions
 */
export function CollapsibleSection({ title, children, defaultOpen = true, icon }: CollapsibleSectionProps) {
  const [opened, setOpened] = useState(defaultOpen);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      className="registration-section"
      style={{
        marginBottom: 'var(--reg-section-gap, 16px)',
      }}
    >
      {/* Section Header Button */}
      <UnstyledButton
        onClick={() => setOpened(!opened)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`section-header-premium ${opened ? 'expanded' : ''}`}
        style={{
          width: '100%',
          padding: '12px 16px',
          background: opened
            ? 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)'
            : isHovered
              ? 'linear-gradient(180deg, #ffffff 0%, #f3f7fc 100%)'
              : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          border: `1px solid ${isHovered || opened ? 'rgba(43, 108, 176, 0.15)' : 'rgba(26, 54, 93, 0.08)'}`,
          borderRadius: opened ? '10px 10px 0 0' : '10px',
          borderBottom: opened ? '1px solid transparent' : undefined,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 280ms cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isHovered ? '0 2px 8px rgba(26, 54, 93, 0.04), 0 1px 2px rgba(26, 54, 93, 0.02)' : 'none',
        }}
      >
        {/* Left Accent Bar */}
        <Box
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            background: 'linear-gradient(180deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
            opacity: isHovered || opened ? 1 : 0,
            transition: 'opacity 280ms cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: opened ? '10px 0 0 0' : '10px 0 0 10px',
          }}
        />

        <Group justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap">
            {/* Icon Container with Transform */}
            {icon && (
              <Box
                className="section-icon-container"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: opened
                    ? 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)'
                    : 'linear-gradient(135deg, rgba(43, 108, 176, 0.08) 0%, rgba(99, 179, 237, 0.06) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: opened ? 'white' : 'var(--emr-secondary)',
                  transition: 'all 280ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: isHovered && !opened ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: opened ? '0 4px 12px rgba(43, 108, 176, 0.25)' : 'none',
                }}
              >
                {icon}
              </Box>
            )}

            {/* Section Title */}
            <Text
              className="section-title-premium"
              fw={600}
              style={{
                fontSize: 'var(--emr-font-md)',
                whiteSpace: 'nowrap',
                color: isHovered ? 'var(--emr-secondary)' : 'var(--emr-primary)',
                letterSpacing: '-0.02em',
                transition: 'color 180ms ease',
              }}
            >
              {title}
            </Text>
          </Group>

          {/* Chevron with Spring Animation */}
          <Box
            className={`section-chevron ${opened ? 'rotated' : ''}`}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: opened ? 'rgba(43, 108, 176, 0.1)' : isHovered ? 'rgba(43, 108, 176, 0.08)' : 'rgba(107, 114, 128, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: opened || isHovered ? 'var(--emr-secondary)' : 'var(--emr-gray-500)',
              transition: 'all 280ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <IconChevronDown size={16} stroke={2.5} />
          </Box>
        </Group>
      </UnstyledButton>

      {/* Content Area */}
      <Collapse in={opened} transitionDuration={300} transitionTimingFunction="cubic-bezier(0.4, 0, 0.2, 1)">
        <Box
          className="section-content-premium"
          style={{
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
            border: '1px solid rgba(26, 54, 93, 0.08)',
            borderTop: 'none',
            borderRadius: '0 0 10px 10px',
            padding: '16px 20px',
            position: 'relative',
          }}
        >
          {/* Left Border Continuation */}
          <Box
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              background: 'linear-gradient(180deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
              borderRadius: '0 0 0 10px',
            }}
          />
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}
