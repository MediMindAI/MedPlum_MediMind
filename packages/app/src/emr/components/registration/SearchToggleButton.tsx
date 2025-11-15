// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { UnstyledButton, Text, Stack } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

interface SearchToggleButtonProps {
  onClick: () => void;
  label: string;
}

/**
 * Professional vertical linear search button positioned on left border
 * Production-ready with smooth animations and modern design
 */
export function SearchToggleButton({ onClick, label }: SearchToggleButtonProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        position: 'absolute',
        left: '0',
        top: '80px',
        height: '200px',
        width: '40px',
        background: 'linear-gradient(180deg, #2b6cb0 0%, #3182ce 50%, #4299e1 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderTopRightRadius: '8px',
        borderBottomRightRadius: '8px',
        boxShadow: '2px 0 12px rgba(43, 108, 176, 0.25)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 10,
        cursor: 'pointer',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.width = '45px';
        e.currentTarget.style.boxShadow = '4px 0 20px rgba(43, 108, 176, 0.4)';
        e.currentTarget.style.background = 'linear-gradient(180deg, #3182ce 0%, #4299e1 50%, #63b3ed 100%)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.width = '40px';
        e.currentTarget.style.boxShadow = '2px 0 12px rgba(43, 108, 176, 0.25)';
        e.currentTarget.style.background = 'linear-gradient(180deg, #2b6cb0 0%, #3182ce 50%, #4299e1 100%)';
      }}
    >
      <Stack gap={8} align="center" style={{ pointerEvents: 'none' }}>
        <IconSearch size={22} stroke={2.5} style={{ marginBottom: '4px' }} />
        <div
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            transform: 'rotate(180deg)',
          }}
        >
          <Text
            size="sm"
            fw={700}
            style={{
              letterSpacing: '1px',
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
              fontSize: '13px',
            }}
          >
            {label}
          </Text>
        </div>
      </Stack>
    </UnstyledButton>
  );
}
