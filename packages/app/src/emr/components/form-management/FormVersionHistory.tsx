// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Table, Badge, Text, Group, Stack, Skeleton, ActionIcon, Tooltip, Box } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import type { VersionHistoryEntry } from '../../services/formBuilderService';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Props for FormVersionHistory component
 */
export interface FormVersionHistoryProps {
  /** Whether the modal is open */
  opened: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Title of the questionnaire */
  title?: string;
  /** Array of version history entries */
  history: VersionHistoryEntry[];
  /** Whether history is loading */
  loading?: boolean;
  /** Callback when view version is clicked */
  onViewVersion?: (versionId: string) => void;
}

/**
 * FormVersionHistory Component
 *
 * Modal displaying the version history of a form template.
 *
 * Features:
 * - List of all versions with metadata
 * - Version number, date, status, modified by
 * - Option to view specific version
 * - Loading skeleton
 */
export function FormVersionHistory({
  opened,
  onClose,
  title,
  history,
  loading = false,
  onViewVersion,
}: FormVersionHistoryProps): JSX.Element {
  const { t, lang } = useTranslation();

  // Format date based on language
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(lang === 'ka' ? 'ka-GE' : lang === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'green';
      case 'draft':
        return 'blue';
      case 'retired':
        return 'gray';
      default:
        return 'gray';
    }
  };

  // Get status label
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active':
        return t('formManagement.status.active');
      case 'draft':
        return t('formManagement.status.draft');
      case 'retired':
        return t('formManagement.status.archived');
      default:
        return status;
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <Text fw={600}>{t('formManagement.versionHistory.title')}</Text>
          {title && (
            <Text size="sm" c="dimmed">
              - {title}
            </Text>
          )}
        </Group>
      }
      size="lg"
      data-testid="version-history-modal"
    >
      <Stack gap="md">
        {loading ? (
          <Stack gap="sm">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height={50} />
            ))}
          </Stack>
        ) : history.length === 0 ? (
          <Text ta="center" c="dimmed" py="xl">
            {t('formManagement.versionHistory.noVersions')}
          </Text>
        ) : (
          <Box style={{ overflowX: 'auto' }}>
            <Table striped highlightOnHover withTableBorder data-testid="version-history-table">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('formManagement.versionHistory.version')}</Table.Th>
                  <Table.Th>{t('formManagement.versionHistory.date')}</Table.Th>
                  <Table.Th>{t('formManagement.versionHistory.status')}</Table.Th>
                  <Table.Th>{t('formManagement.versionHistory.modifiedBy')}</Table.Th>
                  {onViewVersion && <Table.Th style={{ width: 60 }}></Table.Th>}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {history.map((entry, index) => (
                  <Table.Tr key={entry.versionId || index} data-testid={`version-row-${entry.versionId}`}>
                    <Table.Td>
                      <Group gap="xs">
                        <Badge variant="light" color="cyan" size="sm">
                          v{entry.version}
                        </Badge>
                        {index === 0 && (
                          <Badge color="green" size="xs">
                            {t('formManagement.versionHistory.current')}
                          </Badge>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatDate(entry.date)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(entry.status)} size="sm">
                        {getStatusLabel(entry.status)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {entry.modifiedBy || '-'}
                      </Text>
                    </Table.Td>
                    {onViewVersion && (
                      <Table.Td>
                        <Tooltip label={t('formManagement.versionHistory.view')}>
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => onViewVersion(entry.versionId)}
                            data-testid={`view-version-${entry.versionId}`}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        )}

        <Text size="xs" c="dimmed" ta="center">
          {t('formManagement.versionHistory.totalVersions', { count: history.length })}
        </Text>
      </Stack>
    </Modal>
  );
}
