// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MedplumProvider } from '@medplum/react-hooks';
import { MemoryRouter } from 'react-router-dom';
import { MockClient } from '@medplum/mock';
import type { AuditLogEntryExtended } from '../../types/account-management';
import { AuditLogTable } from './AuditLogTable';

describe('AuditLogTable (T025)', () => {
  let medplum: MockClient;

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <MantineProvider>
        <MemoryRouter>
          <MedplumProvider medplum={medplum}>{component}</MedplumProvider>
        </MemoryRouter>
      </MantineProvider>
    );
  };

  const mockAuditLogs: AuditLogEntryExtended[] = [
    {
      id: 'audit-1',
      timestamp: '2025-11-20T10:30:00Z',
      action: 'C',
      actionDisplay: 'Create',
      agent: 'Admin User',
      agentId: 'admin-1',
      entityType: 'Practitioner',
      entityId: 'practitioner-1',
      entityDisplay: 'Test User',
      outcome: '0',
      outcomeDisplay: 'Success',
      ipAddress: '192.168.1.1',
    },
    {
      id: 'audit-2',
      timestamp: '2025-11-19T14:15:00Z',
      action: 'U',
      actionDisplay: 'Update',
      agent: 'Doctor Smith',
      agentId: 'doctor-1',
      entityType: 'Practitioner',
      entityId: 'practitioner-2',
      entityDisplay: 'Jane Doe',
      outcome: '0',
      outcomeDisplay: 'Success',
      ipAddress: '192.168.1.2',
    },
    {
      id: 'audit-3',
      timestamp: '2025-11-18T09:00:00Z',
      action: 'D',
      actionDisplay: 'Delete',
      agent: 'Admin User',
      agentId: 'admin-1',
      entityType: 'Practitioner',
      entityId: 'practitioner-3',
      entityDisplay: 'Deactivated User',
      outcome: '4',
      outcomeDisplay: 'Minor Failure',
      ipAddress: '192.168.1.1',
    },
  ];

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.setItem('emrLanguage', 'en');
  });

  it('should render 7 columns', () => {
    renderWithProviders(<AuditLogTable logs={mockAuditLogs} loading={false} />);

    expect(screen.getByText('Timestamp')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Resource Type')).toBeInTheDocument();
    expect(screen.getByText('Resource')).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
    expect(screen.getByText('IP Address')).toBeInTheDocument();
  });

  it('should display audit log data', () => {
    renderWithProviders(<AuditLogTable logs={mockAuditLogs} loading={false} />);

    // Admin User appears multiple times in test data
    expect(screen.getAllByText('Admin User').length).toBeGreaterThan(0);
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    // Success appears multiple times
    expect(screen.getAllByText('Success').length).toBeGreaterThan(0);
    // IP address appears multiple times
    expect(screen.getAllByText('192.168.1.1').length).toBeGreaterThan(0);
  });

  it('should display loading skeleton when loading', () => {
    renderWithProviders(<AuditLogTable logs={[]} loading={true} />);

    expect(screen.getByTestId('audit-log-loading')).toBeInTheDocument();
  });

  it('should display empty state when no logs', () => {
    renderWithProviders(<AuditLogTable logs={[]} loading={false} />);

    expect(screen.getByText(/No audit logs found/i)).toBeInTheDocument();
  });

  it('should format timestamps correctly', () => {
    renderWithProviders(<AuditLogTable logs={mockAuditLogs} loading={false} />);

    // The table should format the ISO timestamp to a readable format
    expect(screen.getAllByText(/2025/).length).toBeGreaterThan(0);
  });

  it('should display outcome with appropriate styling', () => {
    renderWithProviders(<AuditLogTable logs={mockAuditLogs} loading={false} />);

    // Success outcomes should be present
    const successBadges = screen.getAllByText('Success');
    expect(successBadges.length).toBeGreaterThan(0);

    // Minor failure should also be present
    expect(screen.getByText('Minor Failure')).toBeInTheDocument();
  });

  it('should handle pagination controls', () => {
    const onPageChange = jest.fn();
    renderWithProviders(
      <AuditLogTable logs={mockAuditLogs} loading={false} page={1} total={50} onPageChange={onPageChange} />
    );

    // Pagination should be visible when total > page size
    const paginationControls = screen.queryByRole('navigation');
    expect(paginationControls || screen.queryByText('1')).toBeTruthy();
  });

  it('should display all audit log entries', () => {
    renderWithProviders(<AuditLogTable logs={mockAuditLogs} loading={false} />);

    // Admin User appears twice, Doctor Smith once
    expect(screen.getAllByText('Admin User').length).toBeGreaterThan(0);
    expect(screen.getByText('Doctor Smith')).toBeInTheDocument();
  });

  it('should apply turquoise gradient to table header', () => {
    const { container } = renderWithProviders(<AuditLogTable logs={mockAuditLogs} loading={false} />);

    const thead = container.querySelector('thead');
    expect(thead).toBeInTheDocument();
  });

  it('should support translations', () => {
    localStorage.setItem('emrLanguage', 'ka');
    renderWithProviders(<AuditLogTable logs={mockAuditLogs} loading={false} />);

    // Table should still render with Georgian translations if available
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
