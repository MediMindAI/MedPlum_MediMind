// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Skeleton, Table, Text, Group } from '@mantine/core';
import { useTranslation } from '../../hooks/useTranslation';

interface TableSkeletonProps {
  /** Number of skeleton rows to display (default: 5) */
  rows?: number;
}

/**
 * Loading skeleton component matching AccountTable structure
 *
 * Features:
 * - 5 rows by default (configurable via rows prop)
 * - 9 columns matching AccountTable structure
 * - Animated Mantine Skeleton components
 * - Same column widths as real table
 * - Accessible with role="status"
 *
 * @param rows - Number of skeleton rows to display
 */
export function TableSkeleton({ rows = 5 }: TableSkeletonProps): JSX.Element {
  const { t } = useTranslation();

  // Column widths matching AccountTable
  const columnWidths = [
    100, // Staff ID
    150, // Name
    180, // Email
    120, // Phone
    120, // Role
    120, // Department
    80, // Status
    100, // Last Modified
    80, // Actions
  ];

  return (
    <Box role="status" aria-label="Loading accounts">
      {/* Header skeleton */}
      <Box data-testid="skeleton-header" mb="sm">
        <Skeleton height={50} radius="sm" />
      </Box>

      {/* Table skeleton */}
      <Table>
        <Table.Tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <Table.Tr key={rowIndex} data-testid="skeleton-row">
              {columnWidths.map((width, colIndex) => (
                <Table.Td key={colIndex} data-testid="skeleton-cell">
                  <Skeleton height={16} width={width} radius="sm" />
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Loading text */}
      <Group justify="center" mt="md">
        <Text ta="center" c="dimmed" size="sm">
          {t('accountManagement.table.loading')}
        </Text>
      </Group>
    </Box>
  );
}
