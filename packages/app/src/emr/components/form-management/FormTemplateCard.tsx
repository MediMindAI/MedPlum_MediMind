// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Card, Text, Badge, Group, ActionIcon, Stack, Tooltip } from '@mantine/core';
import { IconEdit, IconCopy, IconArchive, IconHistory, IconArchiveOff } from '@tabler/icons-react';
import type { Questionnaire } from '@medplum/fhirtypes';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Props for FormTemplateCard component
 */
export interface FormTemplateCardProps {
  /** FHIR Questionnaire resource */
  questionnaire: Questionnaire;
  /** Callback when edit action is clicked */
  onEdit?: (id: string) => void;
  /** Callback when clone action is clicked */
  onClone?: (id: string) => void;
  /** Callback when archive action is clicked */
  onArchive?: (id: string) => void;
  /** Callback when restore action is clicked */
  onRestore?: (id: string) => void;
  /** Callback when view history action is clicked */
  onViewHistory?: (id: string) => void;
  /** Callback when card is clicked */
  onClick?: (id: string) => void;
}

/**
 * FormTemplateCard Component
 *
 * Card layout for displaying form template information.
 * Alternative to table view for form management.
 *
 * Features:
 * - Template name and description preview
 * - Version badge
 * - Status badge (draft/active/retired)
 * - Last modified date
 * - Quick action buttons (Edit, Clone, Archive, History)
 */
export function FormTemplateCard({
  questionnaire,
  onEdit,
  onClone,
  onArchive,
  onRestore,
  onViewHistory,
  onClick,
}: FormTemplateCardProps): JSX.Element {
  const { t, lang } = useTranslation();

  const id = questionnaire.id || '';
  const title = questionnaire.title || t('formManagement.untitled');
  const description = questionnaire.description || '';
  const version = questionnaire.version || '1.0';
  const status = questionnaire.status || 'draft';
  const lastModified = questionnaire.meta?.lastUpdated || questionnaire.date;

  // Format date based on language
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(lang === 'ka' ? 'ka-GE' : lang === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Get status badge color
  const getStatusColor = (s: string): string => {
    switch (s) {
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
  const getStatusLabel = (s: string): string => {
    switch (s) {
      case 'active':
        return t('formManagement.status.active');
      case 'draft':
        return t('formManagement.status.draft');
      case 'retired':
        return t('formManagement.status.archived');
      default:
        return s;
    }
  };

  const handleCardClick = (): void => {
    if (onClick && id) {
      onClick(id);
    }
  };

  const isArchived = status === 'retired';

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      onClick={handleCardClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        opacity: isArchived ? 0.7 : 1,
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
      data-testid={`form-card-${id}`}
    >
      <Stack gap="sm">
        {/* Header with title and badges */}
        <Group justify="space-between" align="flex-start">
          <Stack gap={4} style={{ flex: 1 }}>
            <Text fw={600} size="lg" lineClamp={1}>
              {title}
            </Text>
            {description && (
              <Text size="sm" c="dimmed" lineClamp={2}>
                {description}
              </Text>
            )}
          </Stack>
          <Group gap="xs">
            <Badge variant="light" color="cyan" size="sm">
              v{version}
            </Badge>
            <Badge color={getStatusColor(status)} size="sm">
              {getStatusLabel(status)}
            </Badge>
          </Group>
        </Group>

        {/* Footer with date and actions */}
        <Group justify="space-between" align="center" mt="xs">
          <Text size="xs" c="dimmed">
            {t('formManagement.lastModified')}: {formatDate(lastModified)}
          </Text>

          <Group gap="xs" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <Tooltip label={t('formManagement.actions.edit')}>
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={() => onEdit(id)}
                  data-testid={`edit-btn-${id}`}
                >
                  <IconEdit size={18} />
                </ActionIcon>
              </Tooltip>
            )}

            {onClone && (
              <Tooltip label={t('formManagement.actions.clone')}>
                <ActionIcon
                  variant="subtle"
                  color="teal"
                  onClick={() => onClone(id)}
                  data-testid={`clone-btn-${id}`}
                >
                  <IconCopy size={18} />
                </ActionIcon>
              </Tooltip>
            )}

            {onViewHistory && (
              <Tooltip label={t('formManagement.actions.viewHistory')}>
                <ActionIcon
                  variant="subtle"
                  color="violet"
                  onClick={() => onViewHistory(id)}
                  data-testid={`history-btn-${id}`}
                >
                  <IconHistory size={18} />
                </ActionIcon>
              </Tooltip>
            )}

            {isArchived && onRestore ? (
              <Tooltip label={t('formManagement.actions.restore')}>
                <ActionIcon
                  variant="subtle"
                  color="green"
                  onClick={() => onRestore(id)}
                  data-testid={`restore-btn-${id}`}
                >
                  <IconArchiveOff size={18} />
                </ActionIcon>
              </Tooltip>
            ) : (
              onArchive && (
                <Tooltip label={t('formManagement.actions.archive')}>
                  <ActionIcon
                    variant="subtle"
                    color="orange"
                    onClick={() => onArchive(id)}
                    data-testid={`archive-btn-${id}`}
                  >
                    <IconArchive size={18} />
                  </ActionIcon>
                </Tooltip>
              )
            )}
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}
