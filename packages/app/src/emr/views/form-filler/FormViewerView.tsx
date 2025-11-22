// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Stack,
  Paper,
  Title,
  Text,
  Alert,
  Button,
  Group,
  Breadcrumbs,
  Anchor,
  Skeleton,
  Badge,
  Card,
  Divider,
  ScrollArea,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconUser,
  IconCalendar,
  IconPrinter,
  IconClipboard,
} from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import type {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer,
  Patient,
} from '@medplum/fhirtypes';
import { useTranslation } from '../../hooks/useTranslation';
import { fetchQuestionnaireResponse } from '../../services/formRendererService';
import { printPage } from '../../services/pdfGenerationService';
import { PDFGenerator } from '../../components/form-pdf';
import type { QuestionnaireResponseStatus } from '../../types/form-renderer';

/**
 * Status badge colors mapping
 */
const STATUS_COLORS: Record<QuestionnaireResponseStatus, string> = {
  'completed': 'green',
  'in-progress': 'blue',
  'amended': 'orange',
  'entered-in-error': 'red',
  'stopped': 'gray',
};

/**
 * FormViewerView Component
 *
 * Read-only view for displaying a completed QuestionnaireResponse.
 * Features:
 * - Patient info header
 * - Form metadata (created date, status)
 * - Read-only form display
 * - Print button
 * - PDF export button (placeholder)
 * - Back button
 *
 * Route: /emr/forms/view/:id
 */
export function FormViewerView(): JSX.Element {
  const { id: responseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const medplum = useMedplum();
  const { t } = useTranslation();

  // State
  const [response, setResponse] = useState<QuestionnaireResponse | null>(null);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load form response data
  useEffect(() => {
    async function loadData() {
      if (!responseId) {
        setError('No response ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchQuestionnaireResponse(medplum, responseId);

        setResponse(data.response);
        setQuestionnaire(data.questionnaire || null);
        setPatient(data.patient || null);
      } catch (err) {
        console.error('Failed to load form response:', err);
        setError(
          err instanceof Error
            ? err.message
            : t('formViewer.loadError') || 'Failed to load form response.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [medplum, responseId, t]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Handle print
  const handlePrint = useCallback(() => {
    printPage();
  }, []);

  // Get patient display name
  const getPatientName = useCallback((): string => {
    if (!patient?.name?.[0]) {
      return t('formViewer.unknownPatient') || 'Unknown Patient';
    }
    const name = patient.name[0];
    return [
      ...(name.given || []),
      name.family || '',
    ].filter(Boolean).join(' ');
  }, [patient, t]);

  // Get patient ID
  const getPatientId = useCallback((): string | null => {
    if (!patient?.identifier) {
      return null;
    }
    const personalId = patient.identifier.find(
      (id) => id.system?.includes('personal-id')
    );
    return personalId?.value || null;
  }, [patient]);

  // Format date
  const formatDate = useCallback((dateString?: string): string => {
    if (!dateString) {
      return '-';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Get status label
  const getStatusLabel = useCallback((status?: QuestionnaireResponseStatus): string => {
    if (!status) {
      return '-';
    }
    return t(`formSearch.status.${status}`) || status;
  }, [t]);

  // Render loading state
  if (isLoading) {
    return (
      <Container size="md" py="xl" data-testid="form-viewer-loading">
        <Stack gap="md">
          <Skeleton height={40} />
          <Skeleton height={100} />
          <Skeleton height={60} />
          <Skeleton height={60} />
          <Skeleton height={60} />
          <Skeleton height={200} />
        </Stack>
      </Container>
    );
  }

  // Render error state
  if (error || !response) {
    return (
      <Container size="md" py="xl" data-testid="form-viewer-error">
        <Stack gap="md">
          <Alert
            icon={<IconAlertCircle size={24} />}
            title={t('formViewer.error') || 'Error'}
            color="red"
          >
            {error || 'Form response not found'}
          </Alert>
          <Button
            variant="outline"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            {t('common.goBack') || 'Go Back'}
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Box
      style={{
        minHeight: '100%',
        backgroundColor: 'var(--emr-gray-50)',
      }}
      data-testid="form-viewer-view"
    >
      <Container size="md" py="xl">
        <Stack gap="lg">
          {/* Breadcrumbs */}
          <Breadcrumbs>
            <Anchor
              href="/emr/forms"
              onClick={(e) => {
                e.preventDefault();
                navigate('/emr/forms');
              }}
            >
              {t('menu.forms') || 'Forms'}
            </Anchor>
            <Anchor
              href="/emr/forms/search"
              onClick={(e) => {
                e.preventDefault();
                navigate('/emr/forms/search');
              }}
            >
              {t('submenu.forms.search') || 'Search'}
            </Anchor>
            <Text>{questionnaire?.title || t('formViewer.viewForm') || 'View Form'}</Text>
          </Breadcrumbs>

          {/* Header with actions */}
          <Group justify="space-between" align="center">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={handleBack}
            >
              {t('common.goBack') || 'Back'}
            </Button>
            <Group gap="xs">
              <Button
                variant="outline"
                leftSection={<IconPrinter size={16} />}
                onClick={handlePrint}
                data-testid="print-button"
              >
                {t('formViewer.print') || 'Print'}
              </Button>
              <PDFGenerator
                questionnaire={questionnaire}
                response={response}
                patient={patient}
                showPreviewButton={true}
              />
            </Group>
          </Group>

          {/* Form Title */}
          <Title order={2} style={{ color: 'var(--emr-text-primary)' }}>
            <Group gap="sm">
              <IconClipboard size={28} />
              {questionnaire?.title || t('formViewer.formResponse') || 'Form Response'}
            </Group>
          </Title>

          {/* Patient Info Card */}
          {patient && (
            <Card shadow="sm" padding="md" radius="md" withBorder data-testid="patient-info-card">
              <Group justify="space-between" wrap="wrap">
                <Group gap="xs">
                  <IconUser size={20} color="var(--emr-turquoise)" />
                  <Text fw={500}>{getPatientName()}</Text>
                  {getPatientId() && (
                    <Badge variant="light" color="gray">
                      {getPatientId()}
                    </Badge>
                  )}
                </Group>
                <Group gap="xs">
                  {patient.birthDate && (
                    <Group gap={4}>
                      <IconCalendar size={16} />
                      <Text size="sm" c="dimmed">
                        {formatDate(patient.birthDate)}
                      </Text>
                    </Group>
                  )}
                  {patient.gender && (
                    <Badge variant="light" color={patient.gender === 'male' ? 'blue' : 'pink'}>
                      {patient.gender}
                    </Badge>
                  )}
                </Group>
              </Group>
            </Card>
          )}

          {/* Form Metadata */}
          <Paper shadow="sm" p="md" radius="md" withBorder data-testid="form-metadata">
            <Group justify="space-between" wrap="wrap">
              <Group gap="lg">
                <div>
                  <Text size="xs" c="dimmed">
                    {t('formViewer.submittedDate') || 'Submitted'}
                  </Text>
                  <Text fw={500}>{formatDate(response.authored)}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    {t('formViewer.status') || 'Status'}
                  </Text>
                  <Badge
                    color={STATUS_COLORS[response.status as QuestionnaireResponseStatus] || 'gray'}
                    variant="light"
                    size="lg"
                  >
                    {getStatusLabel(response.status as QuestionnaireResponseStatus)}
                  </Badge>
                </div>
                {response.id && (
                  <div>
                    <Text size="xs" c="dimmed">
                      {t('formViewer.responseId') || 'Response ID'}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {response.id}
                    </Text>
                  </div>
                )}
              </Group>
            </Group>
          </Paper>

          {/* Form Content */}
          <Paper shadow="sm" p="lg" radius="md" withBorder data-testid="form-content">
            <ScrollArea>
              <Stack gap="lg">
                {response.item && response.item.length > 0 ? (
                  response.item.map((item, index) => (
                    <FormResponseItemDisplay
                      key={item.linkId || index}
                      item={item}
                      questionnaireItem={findQuestionnaireItem(questionnaire, item.linkId)}
                      level={0}
                    />
                  ))
                ) : (
                  <Text c="dimmed" ta="center">
                    {t('formViewer.noResponses') || 'No responses recorded'}
                  </Text>
                )}
              </Stack>
            </ScrollArea>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

/**
 * Helper component to display a single response item
 */
interface FormResponseItemDisplayProps {
  item: QuestionnaireResponseItem;
  questionnaireItem?: QuestionnaireItem;
  level: number;
}

function FormResponseItemDisplay({
  item,
  questionnaireItem,
  level,
}: FormResponseItemDisplayProps): JSX.Element | null {
  const label = questionnaireItem?.text || item.text || item.linkId;
  const isGroup = questionnaireItem?.type === 'group' || (!item.answer && item.item && item.item.length > 0);

  // Render group
  if (isGroup) {
    return (
      <Box pl={level * 16}>
        <Text fw={600} size="lg" mb="sm">
          {label}
        </Text>
        <Divider mb="sm" />
        <Stack gap="md" pl="md">
          {item.item?.map((nestedItem, index) => (
            <FormResponseItemDisplay
              key={nestedItem.linkId || index}
              item={nestedItem}
              questionnaireItem={findNestedQuestionnaireItem(questionnaireItem, nestedItem.linkId)}
              level={level + 1}
            />
          ))}
        </Stack>
      </Box>
    );
  }

  // Render answer
  const answerValue = extractAnswerDisplay(item.answer);

  return (
    <Box pl={level * 16}>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Text fw={500} style={{ flex: '0 0 40%' }}>
          {label}
        </Text>
        <Text style={{ flex: '1 1 60%', textAlign: 'right' }}>
          {answerValue || <Text c="dimmed">-</Text>}
        </Text>
      </Group>
      <Divider mt="xs" variant="dotted" />
    </Box>
  );
}

/**
 * Find a questionnaire item by linkId
 */
function findQuestionnaireItem(
  questionnaire: Questionnaire | null,
  linkId: string
): QuestionnaireItem | undefined {
  if (!questionnaire?.item) {
    return undefined;
  }

  for (const item of questionnaire.item) {
    if (item.linkId === linkId) {
      return item;
    }
    if (item.item) {
      const nested = findNestedQuestionnaireItem(item, linkId);
      if (nested) {
        return nested;
      }
    }
  }
  return undefined;
}

/**
 * Find a nested questionnaire item by linkId
 */
function findNestedQuestionnaireItem(
  parentItem: QuestionnaireItem | undefined,
  linkId: string
): QuestionnaireItem | undefined {
  if (!parentItem?.item) {
    return undefined;
  }

  for (const item of parentItem.item) {
    if (item.linkId === linkId) {
      return item;
    }
    if (item.item) {
      const nested = findNestedQuestionnaireItem(item, linkId);
      if (nested) {
        return nested;
      }
    }
  }
  return undefined;
}

/**
 * Extract display value from an answer array
 */
function extractAnswerDisplay(answers?: QuestionnaireResponseItemAnswer[]): string {
  if (!answers || answers.length === 0) {
    return '';
  }

  return answers
    .map((answer) => {
      if (answer.valueBoolean !== undefined) {
        return answer.valueBoolean ? 'Yes' : 'No';
      }
      if (answer.valueInteger !== undefined) {
        return String(answer.valueInteger);
      }
      if (answer.valueDecimal !== undefined) {
        return String(answer.valueDecimal);
      }
      if (answer.valueDate !== undefined) {
        return answer.valueDate;
      }
      if (answer.valueDateTime !== undefined) {
        const date = new Date(answer.valueDateTime);
        return date.toLocaleString();
      }
      if (answer.valueTime !== undefined) {
        return answer.valueTime;
      }
      if (answer.valueString !== undefined) {
        return answer.valueString;
      }
      if (answer.valueCoding !== undefined) {
        return answer.valueCoding.display || answer.valueCoding.code || '';
      }
      if (answer.valueAttachment !== undefined) {
        return answer.valueAttachment.title || '[Attachment]';
      }
      if (answer.valueReference !== undefined) {
        return answer.valueReference.display || answer.valueReference.reference || '';
      }
      return '';
    })
    .filter(Boolean)
    .join(', ');
}

export default FormViewerView;
