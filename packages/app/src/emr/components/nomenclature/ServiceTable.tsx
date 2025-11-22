// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Table, ActionIcon, Text, Skeleton, Checkbox, Box, Tooltip, Stack } from '@mantine/core';
import { IconEdit, IconTrash, IconFolder } from '@tabler/icons-react';
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
  /** Registered services handler */
  onOpenRegisteredServices?: (service: ServiceTableRow) => void;
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
 * @param root0
 * @param root0.services
 * @param root0.loading
 * @param root0.onEdit
 * @param root0.onDelete
 * @param root0.onOpenRegisteredServices
 * @param root0.onSort
 * @param root0.sortField
 * @param root0.sortOrder
 */
export function ServiceTable({
  services,
  loading = false,
  onEdit,
  onDelete,
  onOpenRegisteredServices,
  onSort,
  sortField,
  sortOrder = 'asc',
}: ServiceTableProps): JSX.Element {
  const { t } = useTranslation();

  /**
   * Format currency value to 2 decimal places with GEL suffix
   * @param value
   */
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null) {
      return '-';
    }
    return `${value.toFixed(2)} ₾`;
  };

  /**
   * Format number or display dash if undefined
   * @param value
   */
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) {
      return '-';
    }
    return value.toString();
  };

  /**
   * Render sort indicator for sortable columns
   * @param field
   */
  const renderSortIndicator = (field: string): string => {
    if (sortField !== field) {
      return '';
    }
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  /**
   * Handle column header click for sorting
   * @param field
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
          <Table.Thead
            style={{
              background: 'var(--emr-gradient-submenu)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <Table.Tr>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('nomenclature.medical1.table.code')}
              </Table.Th>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('nomenclature.medical1.table.name')}
              </Table.Th>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('nomenclature.medical1.table.group')}
              </Table.Th>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('nomenclature.medical1.table.type')}
              </Table.Th>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  textAlign: 'right',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('nomenclature.medical1.table.price')}
              </Table.Th>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  textAlign: 'right',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('nomenclature.medical1.table.total')}
              </Table.Th>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  textAlign: 'center',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('nomenclature.medical1.table.calhed')}
              </Table.Th>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  textAlign: 'center',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('nomenclature.medical1.table.prt')}
              </Table.Th>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  textAlign: 'center',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('nomenclature.medical1.table.itmGetPrc')}
              </Table.Th>
              <Table.Th
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '16px 20px',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                {t('nomenclature.medical1.table.actions')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {[...Array(5)].map((_, i) => (
              <Table.Tr key={i}>
                {[...Array(10)].map((_, j) => (
                  <Table.Td key={j} style={{ padding: '16px 20px' }}>
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
      <Box
        style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'linear-gradient(to bottom, #f8f9fa, white)',
          borderRadius: '8px',
        }}
      >
        <Stack align="center" gap="md">
          <IconFolder
            size={64}
            style={{
              color: 'var(--emr-secondary, #2b6cb0)',
              opacity: 0.3,
            }}
          />
          <Text size="lg" fw={600} c="dimmed">
            {t('nomenclature.medical1.empty.noServices')}
          </Text>
          <Text size="sm" c="dimmed" maw={400}>
            სცადეთ ფილტრების გასუფთავება ან დაამატეთ ახალი სერვისი
          </Text>
        </Stack>
      </Box>
    );
  }

  /**
   * Main table
   */
  return (
    <Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <Table
        style={{
          minWidth: '1200px',
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}
      >
        <Table.Thead
          style={{
            background: 'var(--emr-gradient-submenu)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Table.Tr>
            <Table.Th
              onClick={() => handleSort('code')}
              style={{
                cursor: onSort ? 'pointer' : 'default',
                userSelect: 'none',
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
                transition: 'background 0.2s ease',
              }}
            >
              {t('nomenclature.medical1.table.code')}
              {renderSortIndicator('code')}
            </Table.Th>
            <Table.Th
              onClick={() => handleSort('name')}
              style={{
                cursor: onSort ? 'pointer' : 'default',
                userSelect: 'none',
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
                transition: 'background 0.2s ease',
              }}
            >
              {t('nomenclature.medical1.table.name')}
              {renderSortIndicator('name')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {t('nomenclature.medical1.table.group')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {t('nomenclature.medical1.table.type')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                textAlign: 'right',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {t('nomenclature.medical1.table.price')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                textAlign: 'right',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {t('nomenclature.medical1.table.total')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                textAlign: 'center',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {t('nomenclature.medical1.table.calhed')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                textAlign: 'center',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {t('nomenclature.medical1.table.prt')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                textAlign: 'center',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {t('nomenclature.medical1.table.itmGetPrc')}
            </Table.Th>
            <Table.Th
              style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                padding: '16px 20px',
                textAlign: 'center',
                borderBottom: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {t('nomenclature.medical1.table.actions')}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {services.map((service, index) => (
            <Table.Tr
              key={service.id}
              style={{
                background: 'white',
                transition: 'all 0.2s ease',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                e.currentTarget.style.transform = 'scale(1.001)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Table.Td
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: 'var(--emr-text-primary, #1a202c)',
                }}
              >
                {service.code}
              </Table.Td>
              <Table.Td
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--emr-text-primary, #1a202c)',
                  maxWidth: '400px',
                }}
              >
                {service.name}
              </Table.Td>
              <Table.Td
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '13px',
                  color: 'var(--emr-text-secondary, #4a5568)',
                }}
              >
                {service.group}
              </Table.Td>
              <Table.Td
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '13px',
                  color: 'var(--emr-text-secondary, #4a5568)',
                }}
              >
                {service.type}
              </Table.Td>
              <Table.Td
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'right',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: 'var(--emr-text-primary, #1a202c)',
                }}
              >
                {formatCurrency(service.price)}
              </Table.Td>
              <Table.Td
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'right',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: 'var(--emr-text-primary, #1a202c)',
                }}
              >
                {formatCurrency(service.totalAmount)}
              </Table.Td>
              <Table.Td
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: 'var(--emr-text-secondary, #4a5568)',
                }}
              >
                {formatNumber(service.calHed)}
              </Table.Td>
              <Table.Td
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'center',
                }}
              >
                <Checkbox
                  checked={service.printable ?? false}
                  readOnly
                  styles={{
                    input: { cursor: 'default' },
                  }}
                />
              </Table.Td>
              <Table.Td
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: 'var(--emr-text-secondary, #4a5568)',
                }}
              >
                {formatNumber(service.itemGetPrice)}
              </Table.Td>
              <Table.Td
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e5e7eb',
                  textAlign: 'center',
                }}
              >
                {onOpenRegisteredServices && (
                  <Tooltip label="რეგისტრირებული სერვისები" position="top">
                    <ActionIcon
                      onClick={() => onOpenRegisteredServices(service)}
                      mr="xs"
                      aria-label="Open registered services modal"
                      style={{
                        background: 'var(--emr-gradient-submenu, linear-gradient(90deg, #138496, #17a2b8, #20c4dd))',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease',
                        minWidth: '32px',
                        minHeight: '32px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }}
                    >
                      <IconFolder size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
                {onEdit && (
                  <Tooltip label="რედაქტირება" position="top">
                    <ActionIcon
                      onClick={() => onEdit(service)}
                      mr={onDelete ? 'xs' : undefined}
                      aria-label="Edit service"
                      style={{
                        background: 'var(--emr-gradient-primary, linear-gradient(135deg, #1a365d, #2b6cb0, #3182ce))',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease',
                        minWidth: '32px',
                        minHeight: '32px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip label="წაშლა" position="top">
                    <ActionIcon
                      onClick={() => onDelete(service)}
                      aria-label="Delete service"
                      style={{
                        background: 'linear-gradient(135deg, #dc2626, #ef4444, #f87171)',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease',
                        minWidth: '32px',
                        minHeight: '32px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
