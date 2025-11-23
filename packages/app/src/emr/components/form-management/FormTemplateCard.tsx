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
      padding={0}
      radius="md"
      withBorder
      onClick={handleCardClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        opacity: isArchived ? 0.7 : 1,
        transition: 'var(--emr-transition-base)',
        border: '1px solid var(--emr-gray-200)',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = 'var(--emr-shadow-lg)';
          e.currentTarget.style.borderColor = 'var(--emr-accent)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = 'var(--emr-gray-200)';
      }}
      data-testid={`form-card-${id}`}
    >
      {/* Top accent bar with gradient */}
      <div
        style={{
          height: 4,
          background: 'var(--emr-gradient-secondary)',
        }}
      />

      <Stack gap="sm" p="lg">
        {/* Header with title and badges */}
        <Group justify="space-between" align="flex-start">
          <Stack gap={4} style={{ flex: 1 }}>
            <Text fw={600} size="lg" lineClamp={1} c="var(--emr-text-primary)">
              {title}
            </Text>
            {description && (
              <Text size="sm" c="dimmed" lineClamp={2}>
                {description}
              </Text>
            )}
          </Stack>
        </Group>

        {/* Badges row */}
        <Group gap="xs">
          <Badge variant="light" color="blue" size="sm" radius="sm" style={{ fontWeight: 500 }}>
            v{version}
          </Badge>
          <Badge color={getStatusColor(status)} size="sm" radius="sm">
            {getStatusLabel(status)}
          </Badge>
        </Group>

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--emr-gray-200)', margin: '4px 0' }} />

        {/* Footer with date and actions */}
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            {t('formManagement.lastModified')}: {formatDate(lastModified)}
          </Text>

          <Group gap="xs" onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <Tooltip label={t('formManagement.actions.edit')} withArrow>
                <ActionIcon
                  variant="light"
                  size="md"
                  onClick={() => onEdit(id)}
                  data-testid={`edit-btn-${id}`}
                  style={{
                    transition: 'var(--emr-transition-fast)',
                    backgroundColor: 'var(--emr-light-accent)',
                    color: 'var(--emr-primary)',
                  }}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
            )}

            {onClone && (
              <Tooltip label={t('formManagement.actions.clone')} withArrow>
                <ActionIcon
                  variant="light"
                  size="md"
                  onClick={() => onClone(id)}
                  data-testid={`clone-btn-${id}`}
                  style={{
                    transition: 'var(--emr-transition-fast)',
                    backgroundColor: 'var(--emr-light-accent)',
                    color: 'var(--emr-secondary)',
                  }}
                >
                  <IconCopy size={16} />
                </ActionIcon>
              </Tooltip>
            )}

            {onViewHistory && (
              <Tooltip label={t('formManagement.actions.viewHistory')} withArrow>
                <ActionIcon
                  variant="light"
                  size="md"
                  onClick={() => onViewHistory(id)}
                  data-testid={`history-btn-${id}`}
                  style={{
                    transition: 'var(--emr-transition-fast)',
                    backgroundColor: 'var(--emr-light-accent)',
                    color: 'var(--emr-accent)',
                  }}
                >
                  <IconHistory size={16} />
                </ActionIcon>
              </Tooltip>
            )}

            {isArchived && onRestore ? (
              <Tooltip label={t('formManagement.actions.restore')} withArrow>
                <ActionIcon
                  variant="light"
                  size="md"
                  onClick={() => onRestore(id)}
                  data-testid={`restore-btn-${id}`}
                  style={{
                    transition: 'var(--emr-transition-fast)',
                    backgroundColor: 'var(--emr-light-accent)',
                    color: 'var(--emr-secondary)',
                  }}
                >
                  <IconArchiveOff size={16} />
                </ActionIcon>
              </Tooltip>
            ) : (
              onArchive && (
                <Tooltip label={t('formManagement.actions.archive')} withArrow>
                  <ActionIcon
                    variant="light"
                    size="md"
                    onClick={() => onArchive(id)}
                    data-testid={`archive-btn-${id}`}
                    style={{
                      transition: 'var(--emr-transition-fast)',
                      backgroundColor: 'var(--emr-gray-100)',
                      color: 'var(--emr-gray-500)',
                    }}
                  >
                    <IconArchive size={16} />
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
