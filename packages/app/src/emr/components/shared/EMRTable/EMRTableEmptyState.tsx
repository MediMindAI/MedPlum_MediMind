/**
 * EMRTableEmptyState - Beautiful empty state for EMRTable
 * Apple-inspired minimal design with icon, title, and optional action
 */

import React from 'react';
import { Box, Stack, Text, Button, ThemeIcon } from '@mantine/core';
import { IconTable } from '@tabler/icons-react';
import { EMRTableEmptyState as EmptyStateConfig } from './EMRTableTypes';

interface EMRTableEmptyStateProps {
  config?: EmptyStateConfig;
  colSpan: number;
}

export function EMRTableEmptyState({ config, colSpan }: EMRTableEmptyStateProps): JSX.Element {
  const Icon = config?.icon || IconTable;

  return (
    <tr>
      <td colSpan={colSpan}>
        <Box
          py={48}
          px={24}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Stack align="center" gap="md">
            <ThemeIcon
              size={80}
              radius="xl"
              variant="light"
              color="gray"
              style={{
                background: 'var(--emr-gray-100)',
                border: '2px dashed var(--emr-gray-300)',
              }}
            >
              <Icon size={36} stroke={1.5} style={{ color: 'var(--emr-gray-400)' }} />
            </ThemeIcon>

            <Stack align="center" gap={4}>
              <Text
                size="lg"
                fw={600}
                style={{ color: 'var(--emr-text-primary)' }}
              >
                {config?.title || 'No data available'}
              </Text>

              {config?.description && (
                <Text
                  size="sm"
                  style={{
                    color: 'var(--emr-text-secondary)',
                    maxWidth: 300,
                    textAlign: 'center',
                  }}
                >
                  {config.description}
                </Text>
              )}
            </Stack>

            {config?.action && (
              <Button
                variant="light"
                color="blue"
                mt="sm"
                onClick={config.action.onClick}
                style={{
                  transition: 'var(--emr-transition-fast)',
                }}
              >
                {config.action.label}
              </Button>
            )}
          </Stack>
        </Box>
      </td>
    </tr>
  );
}

export default EMRTableEmptyState;
