// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Stack, Group, Text, Box, Badge, Divider, Code, Accordion } from '@mantine/core';
import {
  IconUser,
  IconFileText,
  IconClock,
  IconNetwork,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconPlus,
  IconPencil,
  IconTrash,
  IconEye,
  IconPlayerPlay,
} from '@tabler/icons-react';
import type { AuditLogEntryExtended } from '../../types/account-management';
import { useTranslation } from '../../hooks/useTranslation';

interface AuditDetailDrawerProps {
  opened: boolean;
  onClose: () => void;
  event: AuditLogEntryExtended | null;
}

/**
 * Get action icon based on action type
 */
function getActionIcon(action: string): JSX.Element {
  const iconProps = { size: 24, stroke: 2, color: 'white' };
  switch (action) {
    case 'C':
      return <IconPlus {...iconProps} />;
    case 'U':
      return <IconPencil {...iconProps} />;
    case 'D':
      return <IconTrash {...iconProps} />;
    case 'R':
      return <IconEye {...iconProps} />;
    case 'E':
      return <IconPlayerPlay {...iconProps} />;
    default:
      return <IconFileText {...iconProps} />;
  }
}

/**
 * Get action color based on action type
 */
function getActionColor(action: string): string {
  switch (action) {
    case 'C':
      return '#10b981'; // green
    case 'U':
      return '#3b82f6'; // blue
    case 'D':
      return '#ef4444'; // red
    case 'R':
      return '#8b5cf6'; // purple
    case 'E':
      return '#f59e0b'; // amber
    default:
      return '#6b7280'; // gray
  }
}

/**
 * Get outcome icon and color
 */
function getOutcomeInfo(outcome: string): { icon: JSX.Element; color: string; bg: string } {
  const iconProps = { size: 20, stroke: 2 };
  switch (outcome) {
    case '0':
      return { icon: <IconCheck {...iconProps} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    case '4':
      return { icon: <IconAlertTriangle {...iconProps} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
    case '8':
    case '12':
      return { icon: <IconX {...iconProps} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
    default:
      return { icon: <IconCheck {...iconProps} />, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' };
  }
}

/**
 * Format timestamp to localized string
 */
function formatTimestamp(timestamp: string, lang: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString(lang === 'ka' ? 'ka-GE' : lang === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Detail row component
 */
function DetailRow({ icon, label, value, valueColor }: { icon: JSX.Element; label: string; value: string; valueColor?: string }): JSX.Element {
  return (
    <Group gap="lg" align="flex-start">
      <Box
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'var(--emr-gray-100)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Stack gap={4} style={{ flex: 1 }}>
        <Text size="sm" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: '0.05em' }}>
          {label}
        </Text>
        <Text size="md" fw={500} style={{ color: valueColor || 'var(--emr-text-primary)', wordBreak: 'break-word' }}>
          {value || '-'}
        </Text>
      </Stack>
    </Group>
  );
}

/**
 * Premium drawer for displaying audit event details
 * Opens when clicking on an audit log row
 */
export function AuditDetailDrawer({ opened, onClose, event }: AuditDetailDrawerProps): JSX.Element {
  const { t, lang } = useTranslation();

  if (!event) {
    return <></>;
  }

  const actionColor = getActionColor(event.action);
  const outcomeInfo = getOutcomeInfo(event.outcome);

  const labels = {
    title: { ka: 'აუდიტის დეტალები', en: 'Audit Details', ru: 'Детали аудита' },
    timestamp: { ka: 'დრო', en: 'Timestamp', ru: 'Время' },
    action: { ka: 'მოქმედება', en: 'Action', ru: 'Действие' },
    actor: { ka: 'მომხმარებელი', en: 'Actor', ru: 'Пользователь' },
    entity: { ka: 'ობიექტი', en: 'Entity', ru: 'Объект' },
    entityType: { ka: 'ობიექტის ტიპი', en: 'Entity Type', ru: 'Тип объекта' },
    outcome: { ka: 'შედეგი', en: 'Outcome', ru: 'Результат' },
    ipAddress: { ka: 'IP მისამართი', en: 'IP Address', ru: 'IP адрес' },
    details: { ka: 'დეტალები', en: 'Details', ru: 'Детали' },
    rawData: { ka: 'ნედლი მონაცემები', en: 'Raw Data', ru: 'Сырые данные' },
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="70%"
      title=""
      padding={0}
      centered
      radius="lg"
      styles={{
        header: { display: 'none' },
        body: { padding: 0 },
        content: {
          borderRadius: '20px',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          minWidth: '700px',
          maxWidth: '900px',
        },
      }}
    >
      <Box style={{ display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
        {/* Header */}
        <Box
          style={{
            background: 'linear-gradient(135deg, var(--emr-primary) 0%, var(--emr-secondary) 100%)',
            padding: '28px 32px',
            position: 'relative',
          }}
        >
          <Group justify="space-between" align="flex-start">
            <Group gap="md">
              <Box
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getActionIcon(event.action)}
              </Box>
              <Stack gap={6}>
                <Text fw={700} size="xl" c="white">
                  {labels.title[lang] || labels.title.en}
                </Text>
                <Badge
                  size="xl"
                  variant="filled"
                  style={{
                    background: actionColor,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    fontSize: '14px',
                    padding: '8px 16px',
                  }}
                >
                  {event.actionDisplay}
                </Badge>
              </Stack>
            </Group>

            <Box
              onClick={onClose}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
            >
              <IconX size={24} color="white" />
            </Box>
          </Group>
        </Box>

        {/* Content */}
        <Box style={{ flex: 1, overflow: 'auto', padding: '32px 40px' }}>
          <Stack gap="xl">
            {/* Timestamp */}
            <DetailRow
              icon={<IconClock size={22} style={{ color: 'var(--emr-secondary)' }} />}
              label={labels.timestamp[lang] || labels.timestamp.en}
              value={formatTimestamp(event.timestamp, lang)}
            />

            <Divider />

            {/* Actor */}
            <DetailRow
              icon={<IconUser size={22} style={{ color: 'var(--emr-secondary)' }} />}
              label={labels.actor[lang] || labels.actor.en}
              value={event.agent}
            />

            <Divider />

            {/* Entity */}
            <Stack gap="md">
              <DetailRow
                icon={<IconFileText size={22} style={{ color: 'var(--emr-secondary)' }} />}
                label={labels.entity[lang] || labels.entity.en}
                value={event.entityDisplay || event.entityId || '-'}
              />
              <Box pl={60}>
                <Group gap="sm">
                  <Badge variant="light" color="gray" size="md">
                    {event.entityType || 'Unknown'}
                  </Badge>
                  {event.entityId && (
                    <Code style={{ fontSize: 12 }}>{event.entityId}</Code>
                  )}
                </Group>
              </Box>
            </Stack>

            <Divider />

            {/* Outcome */}
            <Group gap="lg" align="flex-start">
              <Box
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: outcomeInfo.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: outcomeInfo.color,
                }}
              >
                {outcomeInfo.icon}
              </Box>
              <Stack gap={4} style={{ flex: 1 }}>
                <Text size="sm" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: '0.05em' }}>
                  {labels.outcome[lang] || labels.outcome.en}
                </Text>
                <Text size="md" fw={600} style={{ color: outcomeInfo.color }}>
                  {event.outcomeDisplay}
                </Text>
                {event.outcomeDescription && (
                  <Text size="sm" c="dimmed">
                    {event.outcomeDescription}
                  </Text>
                )}
              </Stack>
            </Group>

            {/* IP Address */}
            {event.ipAddress && (
              <>
                <Divider />
                <DetailRow
                  icon={<IconNetwork size={22} style={{ color: 'var(--emr-secondary)' }} />}
                  label={labels.ipAddress[lang] || labels.ipAddress.en}
                  value={event.ipAddress}
                />
              </>
            )}

            {/* Details */}
            {event.details && Object.keys(event.details).length > 0 && (
              <>
                <Divider />
                <Accordion variant="contained" radius="md">
                  <Accordion.Item value="details">
                    <Accordion.Control
                      icon={<IconFileText size={20} style={{ color: 'var(--emr-secondary)' }} />}
                    >
                      <Text size="md" fw={600}>
                        {labels.details[lang] || labels.details.en}
                      </Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="sm">
                        {Object.entries(event.details).map(([key, value]) => (
                          <Group key={key} justify="space-between" align="flex-start">
                            <Text size="sm" c="dimmed" fw={600} tt="uppercase">
                              {key}
                            </Text>
                            <Text size="sm" style={{ maxWidth: '60%', textAlign: 'right', wordBreak: 'break-word' }}>
                              {value}
                            </Text>
                          </Group>
                        ))}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </>
            )}

            {/* Raw Data (for debugging) */}
            <Accordion variant="contained" radius="md" styles={{ item: { background: 'var(--emr-gray-50)' } }}>
              <Accordion.Item value="raw">
                <Accordion.Control>
                  <Text size="sm" c="dimmed">
                    {labels.rawData[lang] || labels.rawData.en}
                  </Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Code block style={{ fontSize: 12, maxHeight: 250, overflow: 'auto' }}>
                    {JSON.stringify(event, null, 2)}
                  </Code>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Stack>
        </Box>
      </Box>
    </Modal>
  );
}
