/**
 * EMRTable - Reusable Table Component Types
 * A production-ready, Apple-inspired table component for the MediMind EMR system
 */

import { ReactNode, ComponentType, SVGAttributes } from 'react';

// Tabler icon props type
export type IconProps = SVGAttributes<SVGElement> & {
  size?: number | string;
  stroke?: number | string;
};

/**
 * Sort direction for columns
 */
export type SortDirection = 'asc' | 'desc' | null;

/**
 * Column alignment options
 */
export type ColumnAlign = 'left' | 'center' | 'right';

/**
 * Built-in format types for common data patterns
 */
export type ColumnFormat = 'text' | 'number' | 'currency' | 'date' | 'datetime' | 'boolean' | 'percentage';

/**
 * Column definition for EMRTable
 * @template T - The type of row data
 */
export interface EMRTableColumn<T> {
  /** Unique key for the column (should match a property of T or be a custom key) */
  key: string;

  /** Display title for the column header */
  title: string;

  /** Column width (CSS value: 'auto', '100px', '20%', etc.) */
  width?: string | number;

  /** Minimum width for the column */
  minWidth?: string | number;

  /** Maximum width for the column */
  maxWidth?: string | number;

  /** Text alignment within the column */
  align?: ColumnAlign;

  /** Whether the column is sortable */
  sortable?: boolean;

  /** Built-in format for the cell value */
  format?: ColumnFormat;

  /** Currency code for 'currency' format (default: 'GEL') */
  currencyCode?: string;

  /** Custom render function for cell content */
  render?: (row: T, rowIndex: number) => ReactNode;

  /** Hide column on mobile breakpoint */
  hideOnMobile?: boolean;

  /** Hide column on tablet breakpoint */
  hideOnTablet?: boolean;

  /** Additional CSS class for the column */
  className?: string;

  /** Whether the column is sticky (for horizontal scrolling) */
  sticky?: 'left' | 'right';
}

/**
 * Action configuration for the combined action pattern
 */
export interface EMRTableAction<T> {
  /** Icon component from @tabler/icons-react */
  icon: ComponentType<IconProps>;

  /** Action label (for tooltip and dropdown) */
  label: string;

  /** Click handler */
  onClick: (row: T) => void;

  /** Action color (for styling) */
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray';

  /** Whether the action is disabled */
  disabled?: boolean | ((row: T) => boolean);

  /** Whether to show the action */
  visible?: boolean | ((row: T) => boolean);

  /** Loading state for async actions */
  loading?: boolean;
}

/**
 * Actions configuration using combined pattern
 * Primary action is always visible, secondary actions in dropdown menu
 */
export interface EMRTableActions<T> {
  /** Primary action (always visible as icon button) */
  primary?: EMRTableAction<T>;

  /** Secondary actions (shown in dropdown menu) */
  secondary?: EMRTableAction<T>[];
}

/**
 * Pagination configuration
 */
export interface EMRTablePagination {
  /** Current page (1-indexed) */
  page: number;

  /** Items per page */
  pageSize: number;

  /** Total number of items */
  total: number;

  /** Callback when page changes */
  onChange: (page: number) => void;

  /** Available page size options */
  pageSizeOptions?: number[];

  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;

  /** Show page size selector */
  showPageSizeSelector?: boolean;
}

/**
 * Empty state configuration
 */
export interface EMRTableEmptyState {
  /** Icon component to display */
  icon?: ComponentType<IconProps>;

  /** Main title text */
  title: string;

  /** Description text */
  description?: string;

  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Loading skeleton configuration
 */
export interface EMRTableLoadingConfig {
  /** Number of skeleton rows to show */
  rows?: number;

  /** Enable shimmer animation */
  animate?: boolean;
}

/**
 * Row highlight condition
 */
export type RowHighlightCondition<T> = (row: T, rowIndex: number) => boolean | string;

/**
 * Main EMRTable component props
 * @template T - The type of row data
 */
export interface EMRTableProps<T extends { id?: string | number }> {
  /** Column definitions */
  columns: EMRTableColumn<T>[];

  /** Row data array */
  data: T[];

  /** Loading state */
  loading?: boolean;

  /** Loading configuration */
  loadingConfig?: EMRTableLoadingConfig;

  /** Empty state configuration */
  emptyState?: EMRTableEmptyState;

  // ==================== SELECTION ====================

  /** Enable row selection with checkboxes */
  selectable?: boolean;

  /** Currently selected row IDs */
  selectedRows?: (string | number)[];

  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: (string | number)[]) => void;

  /** Allow selecting all rows */
  allowSelectAll?: boolean;

  // ==================== SORTING ====================

  /** Current sort field */
  sortField?: string;

  /** Current sort direction */
  sortDirection?: SortDirection;

  /** Callback when sort changes */
  onSort?: (field: string, direction: SortDirection) => void;

  // ==================== PAGINATION ====================

  /** Pagination configuration */
  pagination?: EMRTablePagination;

  // ==================== ACTIONS ====================

  /** Actions function returning primary and secondary actions for each row */
  actions?: (row: T) => EMRTableActions<T>;

  // ==================== ROW INTERACTIONS ====================

  /** Callback when a row is clicked */
  onRowClick?: (row: T) => void;

  /** Highlight condition - returns true for highlighted rows or a color string */
  highlightRow?: RowHighlightCondition<T>;

  /** Get unique ID from row (default: row.id) */
  getRowId?: (row: T) => string | number;

  // ==================== STYLING ====================

  /** Enable sticky header */
  stickyHeader?: boolean;

  /** Sticky header offset from top (for fixed headers above) */
  stickyOffset?: number;

  /** Enable zebra striping */
  striped?: boolean;

  /** Table height (for scrollable tables) */
  height?: string | number;

  /** Maximum height before scrolling */
  maxHeight?: string | number;

  /** Minimum width (for horizontal scrolling) */
  minWidth?: string | number;

  /** Additional CSS class for the table container */
  className?: string;

  /** Enable compact mode (smaller padding) */
  compact?: boolean;

  /** Disable hover effect on rows */
  disableHover?: boolean;

  // ==================== ACCESSIBILITY ====================

  /** ARIA label for the table */
  ariaLabel?: string;

  /** ARIA described by ID */
  ariaDescribedBy?: string;
}

/**
 * Internal row props for rendering
 */
export interface EMRTableRowProps<T> {
  row: T;
  rowIndex: number;
  columns: EMRTableColumn<T>[];
  isSelected: boolean;
  isHighlighted: boolean | string;
  highlightColor?: string;
  selectable: boolean;
  onSelect: (id: string | number, checked: boolean) => void;
  onRowClick?: (row: T) => void;
  actions?: EMRTableActions<T>;
  getRowId: (row: T) => string | number;
  compact?: boolean;
}
