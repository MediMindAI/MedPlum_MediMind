// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Table, ActionIcon, Text, Skeleton, Checkbox, Box } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { JSX } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import type { ServiceTableRow } from '../../types/nomenclature';

interface ServiceTableProps {
  /** Array of services to display */
  services: ServiceTableRow[];
  /** Loading state */
  loading?: boolean;
  /** Edit handler */
  onEdit?: (service: ServiceTableRow) => void;
  /** Delete handler */
  onDelete?: (service: ServiceTableRow) => void;
  /** Sort handler */
  onSort?: (field: string) => void;
  /** Current sort field */
  sortField?: string;
  /** Current sort order */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Service table component for displaying medical services
 * Features: sortable columns, edit/delete actions, loading states, empty states
 */
export function ServiceTable({
  services,
  loading = false,
  onEdit,
  onDelete,
  onSort,
  sortField,
  sortOrder = 'asc',
}: ServiceTableProps): JSX.Element {
  const { t } = useTranslation();

  /**
   * Format currency value to 2 decimal places with GEL suffix
   */
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null) {
      return '-';
    }
    return `${value.toFixed(2)} ₾`;
  };

  /**
   * Format number or display dash if undefined
   */
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) {
      return '-';
    }
    return value.toString();
  };

  /**
   * Render sort indicator for sortable columns
   */
  const renderSortIndicator = (field: string): string => {
    if (sortField !== field) {
      return '';
    }
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  /**
   * Handle column header click for sorting
   */
  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };

  /**
   * Loading skeleton
   */
  if (loading) {
    return (
      <Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Table style={{ minWidth: '1200px' }}>
          <Table.Thead style={{ background: 'var(--emr-gradient-submenu)' }}>
            <Table.Tr>
              <Table.Th>{t('nomenclature.medical1.table.code')}</Table.Th>
              <Table.Th>{t('nomenclature.medical1.table.name')}</Table.Th>
              <Table.Th>{t('nomenclature.medical1.table.group')}</Table.Th>
              <Table.Th>{t('nomenclature.medical1.table.type')}</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>{t('nomenclature.medical1.table.price')}</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>{t('nomenclature.medical1.table.total')}</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>{t('nomenclature.medical1.table.calhed')}</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>{t('nomenclature.medical1.table.prt')}</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>{t('nomenclature.medical1.table.itmGetPrc')}</Table.Th>
              <Table.Th>{t('nomenclature.medical1.table.actions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {[...Array(5)].map((_, i) => (
              <Table.Tr key={i}>
                {[...Array(10)].map((_, j) => (
                  <Table.Td key={j}>
                    <Skeleton height={20} />
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    );
  }

  /**
   * Empty state
   */
  if (services.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="xl">
        {t('nomenclature.medical1.empty.noServices')}
      </Text>
    );
  }

  /**
   * Main table
   */
  return (
    <Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <Table highlightOnHover style={{ minWidth: '1200px' }}>
        <Table.Thead style={{ background: 'var(--emr-gradient-submenu)' }}>
          <Table.Tr>
            <Table.Th
              onClick={() => handleSort('code')}
              style={{ cursor: onSort ? 'pointer' : 'default', userSelect: 'none' }}
            >
              {t('nomenclature.medical1.table.code')}
              {renderSortIndicator('code')}
            </Table.Th>
            <Table.Th
              onClick={() => handleSort('name')}
              style={{ cursor: onSort ? 'pointer' : 'default', userSelect: 'none' }}
            >
              {t('nomenclature.medical1.table.name')}
              {renderSortIndicator('name')}
            </Table.Th>
            <Table.Th>{t('nomenclature.medical1.table.group')}</Table.Th>
            <Table.Th>{t('nomenclature.medical1.table.type')}</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>{t('nomenclature.medical1.table.price')}</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>{t('nomenclature.medical1.table.total')}</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>{t('nomenclature.medical1.table.calhed')}</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>{t('nomenclature.medical1.table.prt')}</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>{t('nomenclature.medical1.table.itmGetPrc')}</Table.Th>
            <Table.Th>{t('nomenclature.medical1.table.actions')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {services.map((service) => (
            <Table.Tr key={service.id}>
              <Table.Td>{service.code}</Table.Td>
              <Table.Td>{service.name}</Table.Td>
              <Table.Td>{service.group}</Table.Td>
              <Table.Td>{service.type}</Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(service.price)}</Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(service.totalAmount)}</Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>{formatNumber(service.calHed)}</Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>
                <Checkbox
                  checked={service.printable ?? false}
                  readOnly
                  styles={{
                    input: { cursor: 'default' },
                  }}
                />
              </Table.Td>
              <Table.Td style={{ textAlign: 'center' }}>{formatNumber(service.itemGetPrice)}</Table.Td>
              <Table.Td>
                {onEdit && (
                  <ActionIcon onClick={() => onEdit(service)} variant="subtle" color="blue" aria-label="Edit service">
                    <IconEdit size={16} />
                  </ActionIcon>
                )}
                {onDelete && (
                  <ActionIcon
                    onClick={() => onDelete(service)}
                    variant="subtle"
                    color="red"
                    ml="xs"
                    aria-label="Delete service"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
