/**
 * EMRTable - Production-Ready Reusable Table Component
 * Apple-inspired light/minimal design with modern features
 *
 * Features:
 * - Light gray header with dark text
 * - Sticky header on scroll
 * - Row selection with checkboxes
 * - Column sorting with arrow indicators
 * - Pagination with page size selector
 * - Combined action pattern (primary visible, secondary in dropdown)
 * - Beautiful empty and loading states
 * - Mobile responsive
 */

import React, { useState, useCallback, useMemo, CSSProperties } from 'react';
import { Table, Checkbox, Box, Pagination, Select, Group, Text } from '@mantine/core';
import { IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';

import {
  EMRTableProps,
  EMRTableColumn,
  SortDirection,
  ColumnFormat,
} from './EMRTableTypes';
import { EMRTableEmptyState } from './EMRTableEmptyState';
import { EMRTableSkeleton } from './EMRTableSkeleton';
import { EMRTableActions } from './EMRTableActions';

// Import theme CSS
import '../../../styles/theme.css';

/**
 * EMRTable - Main component
 */
export function EMRTable<T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  loadingConfig,
  emptyState,

  // Selection
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  allowSelectAll = true,

  // Sorting
  sortField,
  sortDirection,
  onSort,

  // Pagination
  pagination,

  // Actions
  actions,

  // Row interactions
  onRowClick,
  highlightRow,
  getRowId = (row) => row.id as string | number,

  // Styling
  stickyHeader = false,
  stickyOffset = 0,
  striped = true,
  height,
  maxHeight,
  minWidth,
  className,
  compact = false,
  disableHover = false,

  // Accessibility
  ariaLabel,
  ariaDescribedBy,
}: EMRTableProps<T>): JSX.Element {
  // Track hover state for rows
  const [hoveredRowId, setHoveredRowId] = useState<string | number | null>(null);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  // Filter columns based on responsive settings
  const visibleColumns = useMemo(() => {
    return columns.filter((col) => {
      if (isMobile && col.hideOnMobile) return false;
      if (isTablet && col.hideOnTablet) return false;
      return true;
    });
  }, [columns, isMobile, isTablet]);

  // Calculate if all visible rows are selected
  const allSelected = useMemo(() => {
    if (data.length === 0) return false;
    return data.every((row) => selectedRows.includes(getRowId(row)));
  }, [data, selectedRows, getRowId]);

  // Some rows selected (for indeterminate state)
  const someSelected = useMemo(() => {
    if (data.length === 0) return false;
    const selectedCount = data.filter((row) => selectedRows.includes(getRowId(row))).length;
    return selectedCount > 0 && selectedCount < data.length;
  }, [data, selectedRows, getRowId]);

  // Handle select all
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!onSelectionChange) return;
      if (checked) {
        const allIds = data.map((row) => getRowId(row));
        onSelectionChange(allIds);
      } else {
        onSelectionChange([]);
      }
    },
    [data, getRowId, onSelectionChange]
  );

  // Handle single row select
  const handleRowSelect = useCallback(
    (id: string | number, checked: boolean) => {
      if (!onSelectionChange) return;
      if (checked) {
        onSelectionChange([...selectedRows, id]);
      } else {
        onSelectionChange(selectedRows.filter((rowId) => rowId !== id));
      }
    },
    [selectedRows, onSelectionChange]
  );

  // Handle sort click
  const handleSort = useCallback(
    (field: string) => {
      if (!onSort) return;

      let newDirection: SortDirection;
      if (sortField !== field) {
        newDirection = 'asc';
      } else if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else {
        newDirection = null;
      }

      onSort(field, newDirection);
    },
    [sortField, sortDirection, onSort]
  );

  // Calculate column count for empty state colspan
  const totalColumns =
    visibleColumns.length + (selectable ? 1 : 0) + (actions ? 1 : 0);

  const cellPadding = compact
    ? 'var(--emr-table-cell-padding-compact)'
    : 'var(--emr-table-cell-padding)';

  // Container styles
  const containerStyle: CSSProperties = {
    borderRadius: 'var(--emr-table-border-radius)',
    boxShadow: 'var(--emr-table-shadow)',
    border: '1px solid var(--emr-table-border)',
    overflow: 'hidden',
    background: 'var(--emr-table-row-bg)',
  };

  // Scroll wrapper styles
  const scrollWrapperStyle: CSSProperties = {
    overflowX: 'auto',
    overflowY: height || maxHeight ? 'auto' : undefined,
    height: height,
    maxHeight: maxHeight,
    WebkitOverflowScrolling: 'touch',
  };

  return (
    <Box className={className} style={containerStyle}>
      <Box style={scrollWrapperStyle} className="emr-scrollbar">
        <Table
          style={{ minWidth: minWidth || 'auto' }}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
        >
          {/* Table Header */}
          <Table.Thead
            style={{
              background: 'var(--emr-table-header-bg)',
              position: stickyHeader ? 'sticky' : undefined,
              top: stickyHeader ? stickyOffset : undefined,
              zIndex: stickyHeader ? 10 : undefined,
            }}
          >
            <Table.Tr>
              {/* Select All Checkbox */}
              {selectable && (
                <Table.Th
                  style={{
                    padding: cellPadding,
                    width: 48,
                    textAlign: 'center',
                    borderBottom: '2px solid var(--emr-table-header-border)',
                  }}
                >
                  {allowSelectAll && (
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                      size="sm"
                      color="blue"
                      aria-label="Select all rows"
                      styles={{
                        input: {
                          cursor: 'pointer',
                          borderColor: 'var(--emr-gray-400)',
                          '&:checked': {
                            backgroundColor: 'var(--emr-table-checkbox-color)',
                            borderColor: 'var(--emr-table-checkbox-color)',
                          },
                        },
                      }}
                    />
                  )}
                </Table.Th>
              )}

              {/* Column Headers */}
              {visibleColumns.map((column) => (
                <Table.Th
                  key={column.key}
                  style={{
                    padding: cellPadding,
                    textAlign: column.align || 'left',
                    width: column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                    fontWeight: 'var(--emr-table-header-font-weight)' as unknown as number,
                    color: 'var(--emr-table-header-text)',
                    fontSize: 'var(--emr-font-sm)',
                    letterSpacing: '0.01em',
                    borderBottom: '2px solid var(--emr-table-header-border)',
                    cursor: column.sortable && onSort ? 'pointer' : 'default',
                    userSelect: 'none',
                    transition: 'var(--emr-transition-fast)',
                    position: column.sticky ? 'sticky' : undefined,
                    left: column.sticky === 'left' ? 0 : undefined,
                    right: column.sticky === 'right' ? 0 : undefined,
                    background: column.sticky ? 'var(--emr-table-header-bg)' : undefined,
                    zIndex: column.sticky ? 5 : undefined,
                  }}
                  onClick={() => column.sortable && onSort && handleSort(column.key)}
                  className={column.className}
                >
                  <Group gap={4} justify={column.align === 'right' ? 'flex-end' : column.align === 'center' ? 'center' : 'flex-start'}>
                    <span>{column.title}</span>
                    {column.sortable && onSort && (
                      <SortIcon
                        field={column.key}
                        sortField={sortField}
                        sortDirection={sortDirection}
                      />
                    )}
                  </Group>
                </Table.Th>
              ))}

              {/* Actions Header */}
              {actions && (
                <Table.Th
                  style={{
                    padding: cellPadding,
                    width: 80,
                    textAlign: 'center',
                    fontWeight: 'var(--emr-table-header-font-weight)' as unknown as number,
                    color: 'var(--emr-table-header-text)',
                    fontSize: 'var(--emr-font-sm)',
                    borderBottom: '2px solid var(--emr-table-header-border)',
                  }}
                >
                  {/* Empty header for actions column */}
                </Table.Th>
              )}
            </Table.Tr>
          </Table.Thead>

          {/* Table Body */}
          <Table.Tbody>
            {/* Loading State */}
            {loading && (
              <EMRTableSkeleton
                columns={visibleColumns}
                config={loadingConfig}
                selectable={selectable}
                hasActions={!!actions}
                compact={compact}
              />
            )}

            {/* Empty State */}
            {!loading && data.length === 0 && (
              <EMRTableEmptyState config={emptyState} colSpan={totalColumns} />
            )}

            {/* Data Rows */}
            {!loading &&
              data.map((row, rowIndex) => {
                const rowId = getRowId(row);
                const isSelected = selectedRows.includes(rowId);
                const isHovered = hoveredRowId === rowId;

                // Calculate highlight
                let isHighlighted: boolean | string = false;
                if (highlightRow) {
                  isHighlighted = highlightRow(row, rowIndex);
                }
                const highlightColor =
                  typeof isHighlighted === 'string'
                    ? isHighlighted
                    : isHighlighted
                    ? 'var(--emr-table-row-highlight)'
                    : undefined;

                // Row background
                let rowBg = striped && rowIndex % 2 === 1 ? 'var(--emr-table-row-stripe)' : 'var(--emr-table-row-bg)';
                if (highlightColor) rowBg = highlightColor;
                if (isSelected) rowBg = 'var(--emr-table-row-selected)';
                if (isHovered && !disableHover) rowBg = 'var(--emr-table-row-hover)';

                return (
                  <Table.Tr
                    key={rowId}
                    style={{
                      backgroundColor: rowBg,
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background-color var(--emr-transition-fast)',
                      borderLeft: isSelected ? '3px solid var(--emr-table-selected-border)' : '3px solid transparent',
                    }}
                    onClick={() => onRowClick?.(row)}
                    onMouseEnter={() => !disableHover && setHoveredRowId(rowId)}
                    onMouseLeave={() => !disableHover && setHoveredRowId(null)}
                  >
                    {/* Row Checkbox */}
                    {selectable && (
                      <Table.Td
                        style={{
                          padding: cellPadding,
                          textAlign: 'center',
                          borderBottom: '1px solid var(--emr-table-border)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) =>
                            handleRowSelect(rowId, e.currentTarget.checked)
                          }
                          size="sm"
                          color="blue"
                          aria-label={`Select row ${rowIndex + 1}`}
                          styles={{
                            input: {
                              cursor: 'pointer',
                              borderColor: 'var(--emr-gray-400)',
                              '&:checked': {
                                backgroundColor: 'var(--emr-table-checkbox-color)',
                                borderColor: 'var(--emr-table-checkbox-color)',
                              },
                            },
                          }}
                        />
                      </Table.Td>
                    )}

                    {/* Data Cells */}
                    {visibleColumns.map((column) => (
                      <Table.Td
                        key={column.key}
                        style={{
                          padding: cellPadding,
                          textAlign: column.align || 'left',
                          fontSize: 'var(--emr-font-base)',
                          color: 'var(--emr-text-primary)',
                          borderBottom: '1px solid var(--emr-table-border)',
                          position: column.sticky ? 'sticky' : undefined,
                          left: column.sticky === 'left' ? 0 : undefined,
                          right: column.sticky === 'right' ? 0 : undefined,
                          background: column.sticky ? rowBg : undefined,
                          zIndex: column.sticky ? 1 : undefined,
                        }}
                        className={column.className}
                      >
                        {renderCellContent(row, column, rowIndex)}
                      </Table.Td>
                    ))}

                    {/* Actions Cell */}
                    {actions && (
                      <Table.Td
                        style={{
                          padding: cellPadding,
                          textAlign: 'center',
                          borderBottom: '1px solid var(--emr-table-border)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <EMRTableActions row={row} actions={actions(row)} />
                      </Table.Td>
                    )}
                  </Table.Tr>
                );
              })}
          </Table.Tbody>
        </Table>
      </Box>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <Box
          p="md"
          style={{
            borderTop: '1px solid var(--emr-table-border)',
            background: 'var(--emr-gray-50)',
          }}
        >
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)}-
              {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
            </Text>

            <Group gap="md">
              {pagination.showPageSizeSelector && pagination.onPageSizeChange && (
                <Group gap="xs">
                  <Text size="sm" c="dimmed">
                    Per page:
                  </Text>
                  <Select
                    size="xs"
                    w={70}
                    value={String(pagination.pageSize)}
                    data={(pagination.pageSizeOptions || [10, 20, 50, 100]).map((n) => ({
                      value: String(n),
                      label: String(n),
                    }))}
                    onChange={(val) => val && pagination.onPageSizeChange?.(Number(val))}
                    styles={{
                      input: {
                        fontSize: 'var(--emr-font-sm)',
                      },
                    }}
                  />
                </Group>
              )}

              <Pagination
                total={Math.ceil(pagination.total / pagination.pageSize)}
                value={pagination.page}
                onChange={pagination.onChange}
                size="sm"
                radius="md"
                withEdges
                styles={{
                  control: {
                    fontSize: 'var(--emr-font-sm)',
                    '&[dataActive]': {
                      background: 'var(--emr-secondary)',
                    },
                  },
                }}
              />
            </Group>
          </Group>
        </Box>
      )}
    </Box>
  );
}

/**
 * Sort icon component
 */
function SortIcon({
  field,
  sortField,
  sortDirection,
}: {
  field: string;
  sortField?: string;
  sortDirection?: SortDirection;
}): JSX.Element {
  const isActive = sortField === field;
  const iconColor = isActive
    ? 'var(--emr-table-sort-icon-active)'
    : 'var(--emr-table-sort-icon-inactive)';

  if (!isActive || !sortDirection) {
    return <IconSelector size={14} style={{ color: iconColor, opacity: 0.5 }} />;
  }

  if (sortDirection === 'asc') {
    return <IconChevronUp size={14} style={{ color: iconColor }} />;
  }

  return <IconChevronDown size={14} style={{ color: iconColor }} />;
}

/**
 * Render cell content with formatting
 */
function renderCellContent<T>(
  row: T,
  column: EMRTableColumn<T>,
  rowIndex: number
): React.ReactNode {
  // Custom render function takes priority
  if (column.render) {
    return column.render(row, rowIndex);
  }

  // Get raw value
  const value = (row as Record<string, unknown>)[column.key];

  // Handle null/undefined
  if (value === null || value === undefined) {
    return <span style={{ color: 'var(--emr-text-secondary)' }}>—</span>;
  }

  // Apply formatting
  return formatValue(value, column.format, column.currencyCode);
}

/**
 * Format value based on column format type
 */
function formatValue(
  value: unknown,
  format?: ColumnFormat,
  currencyCode: string = 'GEL'
): React.ReactNode {
  switch (format) {
    case 'currency':
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      return isNaN(num) ? String(value) : `${num.toFixed(2)} ${currencyCode}`;

    case 'number':
      const numVal = typeof value === 'number' ? value : parseFloat(String(value));
      return isNaN(numVal) ? String(value) : numVal.toLocaleString();

    case 'percentage':
      const pctVal = typeof value === 'number' ? value : parseFloat(String(value));
      return isNaN(pctVal) ? String(value) : `${pctVal}%`;

    case 'date':
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      return String(value);

    case 'datetime':
      if (value instanceof Date) {
        return value.toLocaleString();
      }
      return String(value);

    case 'boolean':
      return value ? 'Yes' : 'No';

    default:
      return String(value);
  }
}

export default EMRTable;
