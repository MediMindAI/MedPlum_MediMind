// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';
import { Timeline, Text, Badge, Stack, Loader, Center, Alert, Box } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconSearch, IconRun, IconAlertCircle, IconHistory } from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import { getAccountAuditHistory } from '../../services/auditService';
import type { AuditLogEntryExtended } from '../../types/account-management';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Props for AccountAuditTimeline component
 */
export interface AccountAuditTimelineProps {
  /** Practitioner ID to fetch audit history for */
  practitionerId: string;
}

/**
 * Get icon for action type
 * @param action - Action code
 * @returns Icon component
 */
function getActionIcon(action: string): JSX.Element {
  const size = 14;
  switch (action) {
    case 'C':
      return <IconPlus size={size} />;
    case 'U':
      return <IconEdit size={size} />;
    case 'D':
      return <IconTrash size={size} />;
    case 'R':
      return <IconSearch size={size} />;
    case 'E':
      return <IconRun size={size} />;
    default:
      return <IconHistory size={size} />;
  }
}

/**
 * Get timeline bullet color based on outcome
 * @param outcome - Outcome code
 * @returns Color string
 */
function getOutcomeColor(outcome: string): string {
  switch (outcome) {
    case '0':
      return 'green';
    case '4':
      return 'yellow';
    case '8':
      return 'orange';
    case '12':
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Format timestamp to readable date/time
 * @param timestamp - ISO timestamp
 * @returns Formatted string
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
}

/**
 * AccountAuditTimeline displays audit history for a specific account
 *
 * Features:
 * - Mantine Timeline component
 * - Action icons for each event type
 * - Color-coded outcomes
 * - Timestamp and actor display
 * - Loading and error states
 *
 * Used in account edit modal's audit history tab
 *
 * @param props - Component props
 * @returns AccountAuditTimeline component
 */
export function AccountAuditTimeline({ practitionerId }: AccountAuditTimelineProps): JSX.Element {
  const medplum = useMedplum();
  useTranslation();
  const [events, setEvents] = useState<AuditLogEntryExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const history = await getAccountAuditHistory(medplum, practitionerId);
        setEvents(history);
      } catch (err) {
        setError('Failed to load audit history');
        console.error('Error fetching audit history:', err);
      } finally {
        setLoading(false);
      }
    };

    if (practitionerId) {
      fetchHistory();
    }
  }, [medplum, practitionerId]);

  if (loading) {
    return (
      <Center py="xl" data-testid="timeline-loading">
        <Loader size="md" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
        {error}
      </Alert>
    );
  }

  if (events.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="xs">
          <IconHistory size={32} style={{ color: 'var(--mantine-color-gray-5)' }} />
          <Text c="dimmed">No audit history found for this account</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box py="md">
      <Timeline active={events.length - 1} bulletSize={24} lineWidth={2}>
        {events.map((event) => (
          <Timeline.Item
            key={event.id}
            bullet={getActionIcon(event.action)}
            color={getOutcomeColor(event.outcome)}
            title={
              <Stack gap={2}>
                <Text size="sm" fw={600}>
                  {event.actionDisplay}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatTimestamp(event.timestamp)}
                </Text>
              </Stack>
            }
            data-testid="timeline-item"
          >
            <Stack gap="xs" mt="xs">
              {event.outcomeDescription && (
                <Text size="sm" c="dimmed">
                  {event.outcomeDescription}
                </Text>
              )}

              <Box>
                <Badge
                  color={getOutcomeColor(event.outcome)}
                  variant="light"
                  size="xs"
                  style={{ marginRight: '8px' }}
                >
                  {event.outcomeDisplay}
                </Badge>

                <Text size="xs" component="span" c="dimmed">
                  by {event.agent}
                </Text>
              </Box>

              {event.details && Object.keys(event.details).length > 0 && (
                <Box
                  style={{
                    background: 'var(--mantine-color-gray-0)',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {Object.entries(event.details).map(([key, value]) => (
                    <Text key={key} size="xs" c="dimmed">
                      {key}: {value}
                    </Text>
                  ))}
                </Box>
              )}
            </Stack>
          </Timeline.Item>
        ))}
      </Timeline>
    </Box>
  );
}
