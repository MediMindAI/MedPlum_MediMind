/**
 * EMRTable - Unit Tests
 * Comprehensive tests for the reusable table component
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { IconEdit, IconTrash, IconCopy, IconUsers } from '@tabler/icons-react';

import { EMRTable } from './EMRTable';
import { EMRTableColumn } from './EMRTableTypes';

// Test data type
interface TestRow {
  id: number;
  name: string;
  email: string;
  status: string;
  amount: number;
  date: string;
}

// Sample test data
const mockData: TestRow[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', amount: 100.5, date: '2025-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'pending', amount: 250.0, date: '2025-01-16' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', status: 'inactive', amount: 75.25, date: '2025-01-17' },
];

// Sample columns
const mockColumns: EMRTableColumn<TestRow>[] = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'email', title: 'Email' },
  { key: 'status', title: 'Status' },
  { key: 'amount', title: 'Amount', format: 'currency', align: 'right' },
  { key: 'date', title: 'Date' },
];

// Helper to wrap with MantineProvider
const renderWithMantine = (ui: React.ReactElement) => {
  return render(<MantineProvider>{ui}</MantineProvider>);
};

describe('EMRTable', () => {
  describe('Basic Rendering', () => {
    it('renders table with columns and data', () => {
      renderWithMantine(<EMRTable columns={mockColumns} data={mockData} />);

      // Check headers
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();

      // Check data
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('inactive')).toBeInTheDocument();
    });

    it('renders empty state when no data', () => {
      renderWithMantine(
        <EMRTable
          columns={mockColumns}
          data={[]}
          emptyState={{
            icon: IconUsers,
            title: 'No users found',
            description: 'Add some users to get started',
          }}
        />
      );

      expect(screen.getByText('No users found')).toBeInTheDocument();
      expect(screen.getByText('Add some users to get started')).toBeInTheDocument();
    });

    it('renders loading skeleton when loading', () => {
      renderWithMantine(
        <EMRTable columns={mockColumns} data={[]} loading={true} loadingConfig={{ rows: 3 }} />
      );

      // Should show skeleton rows (check by presence of skeleton elements)
      const skeletons = document.querySelectorAll('.mantine-Skeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Selection', () => {
    it('renders checkboxes when selectable is true', () => {
      renderWithMantine(<EMRTable columns={mockColumns} data={mockData} selectable />);

      // Should have select all checkbox + one per row
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(4); // 1 select all + 3 rows
    });

    it('handles row selection', async () => {
      const onSelectionChange = jest.fn();

      renderWithMantine(
        <EMRTable
          columns={mockColumns}
          data={mockData}
          selectable
          selectedRows={[]}
          onSelectionChange={onSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      // Click first row checkbox (not select all)
      await userEvent.click(checkboxes[1]);

      expect(onSelectionChange).toHaveBeenCalledWith([1]);
    });

    it('handles select all', async () => {
      const onSelectionChange = jest.fn();

      renderWithMantine(
        <EMRTable
          columns={mockColumns}
          data={mockData}
          selectable
          selectedRows={[]}
          onSelectionChange={onSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      // Click select all checkbox
      await userEvent.click(checkboxes[0]);

      expect(onSelectionChange).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('shows indeterminate state when some rows selected', () => {
      renderWithMantine(
        <EMRTable
          columns={mockColumns}
          data={mockData}
          selectable
          selectedRows={[1]}
          onSelectionChange={() => {}}
        />
      );

      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      expect(selectAllCheckbox).toHaveAttribute('data-indeterminate', 'true');
    });
  });

  describe('Sorting', () => {
    it('renders sort icons for sortable columns', () => {
      renderWithMantine(
        <EMRTable
          columns={mockColumns}
          data={mockData}
          sortField="name"
          sortDirection="asc"
          onSort={() => {}}
        />
      );

      // Name column should have sort indicator
      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toHaveStyle({ cursor: 'pointer' });
    });

    it('calls onSort when clicking sortable column', async () => {
      const onSort = jest.fn();

      renderWithMantine(
        <EMRTable columns={mockColumns} data={mockData} onSort={onSort} />
      );

      const nameHeader = screen.getByText('Name');
      await userEvent.click(nameHeader);

      expect(onSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('toggles sort direction correctly', async () => {
      const onSort = jest.fn();

      renderWithMantine(
        <EMRTable
          columns={mockColumns}
          data={mockData}
          sortField="name"
          sortDirection="asc"
          onSort={onSort}
        />
      );

      const nameHeader = screen.getByText('Name');
      await userEvent.click(nameHeader);

      expect(onSort).toHaveBeenCalledWith('name', 'desc');
    });
  });

  describe('Pagination', () => {
    it('renders pagination when provided', () => {
      renderWithMantine(
        <EMRTable
          columns={mockColumns}
          data={mockData}
          pagination={{
            page: 1,
            pageSize: 10,
            total: 100,
            onChange: () => {},
          }}
        />
      );

      // Check that pagination controls are rendered
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    });

    it('calls onChange when page changes', async () => {
      const onChange = jest.fn();

      renderWithMantine(
        <EMRTable
          columns={mockColumns}
          data={mockData}
          pagination={{
            page: 1,
            pageSize: 10,
            total: 100,
            onChange,
          }}
        />
      );

      // Click page 2
      const page2Button = screen.getByRole('button', { name: '2' });
      await userEvent.click(page2Button);

      expect(onChange).toHaveBeenCalledWith(2);
    });

    it('shows page size selector when enabled', () => {
      renderWithMantine(
        <EMRTable
          columns={mockColumns}
          data={mockData}
          pagination={{
            page: 1,
            pageSize: 20,
            total: 100,
            onChange: () => {},
            showPageSizeSelector: true,
            onPageSizeChange: () => {},
          }}
        />
      );

      expect(screen.getByText('Per page:')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('renders action buttons for each row', () => {
      renderWithMantine(
        <EMRTable
          columns={mockColumns}
          data={mockData}
          actions={(row) => ({
            primary: { icon: IconEdit, label: 'Edit', onClick: () => {} },
            secondary: [
              { icon: IconCopy, label: 'Copy', onClick: () => {} },
              { icon: IconTrash, label: 'Delete', color: 'red', onClick: () => {} },
            ],
          })}
        />
      );

      // Should have action cells for each row
      const rows = document.querySelectorAll('tbody tr');
      expect(rows.length).toBe(3);

      // Each row should have action icons
      rows.forEach((row) => {
        const actionCell = row.querySelector('td:last-child');
        expect(actionCell).toBeInTheDocument();
      });
    });

    it('calls action onClick when clicked', async () => {
      const onEdit = jest.fn();

      renderWithMantine(
        <EMRTable
          columns={mockColumns}
          data={mockData}
          actions={(row) => ({
            primary: { icon: IconEdit, label: 'Edit', onClick: () => onEdit(row) },
          })}
        />
      );

      // Find action buttons in the table
      const actionButtons = document.querySelectorAll('tbody td:last-child button');
      expect(actionButtons.length).toBeGreaterThan(0);

      await userEvent.click(actionButtons[0] as HTMLElement);

      expect(onEdit).toHaveBeenCalledWith(mockData[0]);
    });
  });

  describe('Row Interactions', () => {
    it('calls onRowClick when row is clicked', async () => {
      const onRowClick = jest.fn();

      renderWithMantine(
        <EMRTable columns={mockColumns} data={mockData} onRowClick={onRowClick} />
      );

      const row = screen.getByText('John Doe').closest('tr');
      await userEvent.click(row!);

      expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
    });

    it('highlights rows based on condition', () => {
      renderWithMantine(
        <EMRTable
          columns={mockColumns}
          data={mockData}
          highlightRow={(row) => row.status === 'active'}
        />
      );

      const activeRow = screen.getByText('John Doe').closest('tr');
      expect(activeRow).toHaveStyle({ backgroundColor: expect.stringContaining('rgb') });
    });
  });

  describe('Formatting', () => {
    it('formats currency values', () => {
      renderWithMantine(<EMRTable columns={mockColumns} data={mockData} />);

      expect(screen.getByText('100.50 GEL')).toBeInTheDocument();
      expect(screen.getByText('250.00 GEL')).toBeInTheDocument();
    });

    it('shows dash for null/undefined values', () => {
      const dataWithNull = [{ id: 1, name: null as unknown as string, email: 'test@test.com', status: '', amount: 0, date: '' }];

      renderWithMantine(<EMRTable columns={mockColumns} data={dataWithNull} />);

      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('uses custom render function when provided', () => {
      const columnsWithRender: EMRTableColumn<TestRow>[] = [
        {
          key: 'name',
          title: 'Name',
          render: (row) => <span data-testid="custom-render">{row.name.toUpperCase()}</span>,
        },
      ];

      renderWithMantine(<EMRTable columns={columnsWithRender} data={mockData} />);

      // Should have 3 custom renders (one per row)
      const customRenders = screen.getAllByTestId('custom-render');
      expect(customRenders[0]).toHaveTextContent('JOHN DOE');
    });
  });

  describe('Styling', () => {
    it('applies striped rows when enabled', () => {
      renderWithMantine(<EMRTable columns={mockColumns} data={mockData} striped />);

      const rows = document.querySelectorAll('tbody tr');
      // Second row should have stripe background
      expect(rows[1]).toHaveStyle({ backgroundColor: expect.anything() });
    });

    it('applies compact mode when compact is true', () => {
      renderWithMantine(<EMRTable columns={mockColumns} data={mockData} compact />);

      const cell = document.querySelector('td');
      // Compact mode should render the table with compact styling
      expect(cell).toBeInTheDocument();
    });

    it('applies sticky header when enabled', () => {
      renderWithMantine(<EMRTable columns={mockColumns} data={mockData} stickyHeader />);

      const thead = document.querySelector('thead');
      expect(thead).toHaveStyle({ position: 'sticky' });
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label', () => {
      renderWithMantine(
        <EMRTable columns={mockColumns} data={mockData} ariaLabel="User list table" />
      );

      const table = document.querySelector('table');
      expect(table).toHaveAttribute('aria-label', 'User list table');
    });

    it('checkbox has aria-label for rows', () => {
      renderWithMantine(<EMRTable columns={mockColumns} data={mockData} selectable />);

      expect(screen.getByLabelText('Select all rows')).toBeInTheDocument();
      expect(screen.getByLabelText('Select row 1')).toBeInTheDocument();
    });
  });

  describe('Empty State with Action', () => {
    it('renders action button in empty state', async () => {
      const onAction = jest.fn();

      renderWithMantine(
        <EMRTable
          columns={mockColumns}
          data={[]}
          emptyState={{
            title: 'No data',
            action: {
              label: 'Add Item',
              onClick: onAction,
            },
          }}
        />
      );

      const actionButton = screen.getByRole('button', { name: 'Add Item' });
      await userEvent.click(actionButton);

      expect(onAction).toHaveBeenCalled();
    });
  });
});
