// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { render, screen, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MedplumProvider } from '@medplum/react-hooks';
import { MemoryRouter } from 'react-router-dom';
import { MockClient } from '@medplum/mock';
import type { AuditEvent } from '@medplum/fhirtypes';
import { AccountAuditTimeline } from './AccountAuditTimeline';

describe('AccountAuditTimeline (T027)', () => {
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

  const mockAuditEvents: AuditEvent[] = [
    {
      resourceType: 'AuditEvent',
      id: 'audit-1',
      type: {
        system: 'http://dicom.nema.org/resources/ontology/DCM',
        code: '110137',
        display: 'User Security Attributes Changed',
      },
      action: 'C',
      recorded: '2025-11-20T10:30:00Z',
      outcome: '0',
      outcomeDesc: 'Account created successfully',
      agent: [
        {
          who: {
            reference: 'Practitioner/admin-1',
            display: 'Admin User',
          },
          requestor: true,
        },
      ],
      source: {
        observer: {
          display: 'EMR Web Application',
        },
      },
      entity: [
        {
          what: {
            reference: 'Practitioner/practitioner-1',
            display: 'Test User',
          },
        },
      ],
    },
    {
      resourceType: 'AuditEvent',
      id: 'audit-2',
      type: {
        system: 'http://dicom.nema.org/resources/ontology/DCM',
        code: '110137',
        display: 'User Security Attributes Changed',
      },
      action: 'U',
      recorded: '2025-11-19T14:15:00Z',
      outcome: '0',
      outcomeDesc: 'Role assignment updated',
      agent: [
        {
          who: {
            reference: 'Practitioner/admin-1',
            display: 'Admin User',
          },
          requestor: true,
        },
      ],
      source: {
        observer: {
          display: 'EMR Web Application',
        },
      },
      entity: [
        {
          what: {
            reference: 'Practitioner/practitioner-1',
            display: 'Test User',
          },
        },
      ],
    },
    {
      resourceType: 'AuditEvent',
      id: 'audit-3',
      type: {
        system: 'http://dicom.nema.org/resources/ontology/DCM',
        code: '110137',
        display: 'User Security Attributes Changed',
      },
      action: 'D',
      recorded: '2025-11-18T09:00:00Z',
      outcome: '4',
      outcomeDesc: 'Account deactivation failed - active sessions',
      agent: [
        {
          who: {
            reference: 'Practitioner/admin-1',
            display: 'Admin User',
          },
          requestor: true,
        },
      ],
      source: {
        observer: {
          display: 'EMR Web Application',
        },
      },
      entity: [
        {
          what: {
            reference: 'Practitioner/practitioner-1',
            display: 'Test User',
          },
        },
      ],
    },
  ];

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.setItem('emrLanguage', 'en');
  });

  it('should render timeline with audit events', async () => {
    medplum.searchResources = jest.fn().mockResolvedValue(mockAuditEvents);

    renderWithProviders(<AccountAuditTimeline practitionerId="practitioner-1" />);

    await waitFor(() => {
      expect(screen.getByText(/Account created successfully/i)).toBeInTheDocument();
    });
  });

  it('should display action icons', async () => {
    medplum.searchResources = jest.fn().mockResolvedValue(mockAuditEvents);

    renderWithProviders(<AccountAuditTimeline practitionerId="practitioner-1" />);

    await waitFor(() => {
      // Timeline items should be rendered
      expect(screen.getByText(/Account created/i)).toBeInTheDocument();
    });
  });

  it('should display timestamps', async () => {
    medplum.searchResources = jest.fn().mockResolvedValue(mockAuditEvents);

    renderWithProviders(<AccountAuditTimeline practitionerId="practitioner-1" />);

    await waitFor(() => {
      // Nov 20, 2025 format in timeline
      expect(screen.getAllByText(/Nov/).length).toBeGreaterThan(0);
    });
  });

  it('should display outcome status', async () => {
    medplum.searchResources = jest.fn().mockResolvedValue(mockAuditEvents);

    renderWithProviders(<AccountAuditTimeline practitionerId="practitioner-1" />);

    await waitFor(() => {
      expect(screen.getAllByText(/Success/i).length).toBeGreaterThan(0);
    });
  });

  it('should show loading state', () => {
    medplum.searchResources = jest
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve([]), 1000)));

    renderWithProviders(<AccountAuditTimeline practitionerId="practitioner-1" />);

    expect(screen.getByTestId('timeline-loading')).toBeInTheDocument();
  });

  it('should show empty state when no events', async () => {
    medplum.searchResources = jest.fn().mockResolvedValue([]);

    renderWithProviders(<AccountAuditTimeline practitionerId="practitioner-1" />);

    await waitFor(() => {
      expect(screen.getByText(/No audit history/i)).toBeInTheDocument();
    });
  });

  it('should handle errors gracefully', async () => {
    medplum.searchResources = jest.fn().mockRejectedValue(new Error('API Error'));

    renderWithProviders(<AccountAuditTimeline practitionerId="practitioner-1" />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load/i)).toBeInTheDocument();
    });
  });

  it('should display actor name for each event', async () => {
    medplum.searchResources = jest.fn().mockResolvedValue(mockAuditEvents);

    renderWithProviders(<AccountAuditTimeline practitionerId="practitioner-1" />);

    await waitFor(() => {
      expect(screen.getAllByText(/Admin User/i).length).toBeGreaterThan(0);
    });
  });

  it('should use Mantine Timeline component', async () => {
    medplum.searchResources = jest.fn().mockResolvedValue(mockAuditEvents);

    const { container } = renderWithProviders(<AccountAuditTimeline practitionerId="practitioner-1" />);

    await waitFor(() => {
      const timeline = container.querySelector('.mantine-Timeline-root');
      expect(timeline).toBeInTheDocument();
    });
  });

  it('should sort events by date (newest first)', async () => {
    medplum.searchResources = jest.fn().mockResolvedValue(mockAuditEvents);

    renderWithProviders(<AccountAuditTimeline practitionerId="practitioner-1" />);

    await waitFor(() => {
      const items = screen.getAllByTestId('timeline-item');
      // First item should be the most recent (Account created)
      expect(items[0]).toHaveTextContent(/Account created/i);
    });
  });

  it('should fetch audit history for specific practitioner', async () => {
    medplum.searchResources = jest.fn().mockResolvedValue([]);

    renderWithProviders(<AccountAuditTimeline practitionerId="practitioner-123" />);

    await waitFor(() => {
      expect(medplum.searchResources).toHaveBeenCalledWith(
        'AuditEvent',
        expect.objectContaining({
          entity: 'Practitioner/practitioner-123',
        })
      );
    });
  });
});
