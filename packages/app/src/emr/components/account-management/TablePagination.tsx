// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Group, Pagination, Select, Text, Paper } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useTranslation } from '../../hooks/useTranslation';
import type { PaginationParams } from '../../types/account-management';

/** Page size options for pagination */
const PAGE_SIZE_OPTIONS = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
];

interface TablePaginationProps {
  /** Current pagination parameters */
  pagination: PaginationParams;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items */
  totalItems: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * Pagination controls for table
 *
 * Features:
 * - Page navigation (First, Prev, 1 2 3..., Next, Last)
 * - Page size selector (10, 20, 50, 100)
 * - "Showing X-Y of Z" display
 * - Mobile-responsive layout
 * - Uses Mantine Pagination component
 */
export const TablePagination = React.memo(function TablePagination({
  pagination,
  totalPages,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps): JSX.Element {
  const { t } = useTranslation();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Calculate showing range
  const from = Math.min((pagination.page - 1) * pagination.pageSize + 1, totalItems);
  const to = Math.min(pagination.page * pagination.pageSize, totalItems);

  const handlePageSizeChange = (value: string | null) => {
    if (value) {
      onPageSizeChange(parseInt(value, 10));
    }
  };

  return (
    <Paper
      p="md"
      withBorder
      style={{
        background: 'var(--emr-gray-50)',
        borderRadius: 'var(--emr-border-radius)',
        borderTop: 'none',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      }}
    >
      <Group justify="space-between" wrap="wrap" gap="md">
        {/* Showing X-Y of Z */}
        <Text size="sm" c="dimmed" fw={500}>
          {t('accountManagement.pagination.showing', {
            from: from.toString(),
            to: to.toString(),
            total: totalItems.toString(),
          }) || `Showing ${from}-${to} of ${totalItems}`}
        </Text>

        {/* Center: Pagination */}
        <Pagination
          total={totalPages}
          value={pagination.page}
          onChange={onPageChange}
          size={isMobile ? 'sm' : 'md'}
          withEdges={!isMobile}
          siblings={isMobile ? 0 : 1}
          boundaries={isMobile ? 0 : 1}
          styles={{
            control: {
              '&[data-active]': {
                background: 'var(--emr-gradient-primary)',
                borderColor: 'transparent',
              },
            },
          }}
        />

        {/* Page Size Selector */}
        <Group gap="xs" wrap="nowrap">
          <Text size="sm" c="dimmed">
            {t('accountManagement.pagination.pageSize') || 'Page size'}:
          </Text>
          <Select
            data={PAGE_SIZE_OPTIONS}
            value={pagination.pageSize.toString()}
            onChange={handlePageSizeChange}
            size="xs"
            w={70}
            styles={{
              input: {
                minHeight: '32px',
              },
            }}
          />
        </Group>
      </Group>

      {/* Page info for mobile */}
      {isMobile && totalPages > 1 && (
        <Text size="xs" c="dimmed" ta="center" mt="xs">
          {t('accountManagement.pagination.page', {
            page: pagination.page.toString(),
            total: totalPages.toString(),
          }) || `Page ${pagination.page} of ${totalPages}`}
        </Text>
      )}
    </Paper>
  );
});
