// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconArrowLeft, IconUser, IconCalendar, IconCheck } from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import type { Questionnaire, Patient, Encounter, QuestionnaireResponse } from '@medplum/fhirtypes';
import { FormRenderer } from '../../components/form-renderer/FormRenderer';
import {
  fetchFormData,
  submitForm,
  saveDraft,
} from '../../services/formRendererService';
import { extractPatientData } from '../../services/patientDataBindingService';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * FormFillerView Component
 *
 * Renders a form for filling out a FHIR Questionnaire.
 * Supports patient data auto-population when patientId is provided.
 *
 * Route: /emr/forms/fill/:id
 * Query params:
 *   - patientId: Optional patient ID for auto-population
 *   - encounterId: Optional encounter ID for auto-population
 *
 * @example
 * ```
 * /emr/forms/fill/questionnaire-123
 * /emr/forms/fill/questionnaire-123?patientId=patient-456
 * /emr/forms/fill/questionnaire-123?patientId=patient-456&encounterId=encounter-789
 * ```
 */
export function FormFillerView(): JSX.Element {
  const { id: questionnaireId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const medplum = useMedplum();
  const { t } = useTranslation();

  // State
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [patient, setPatient] = useState<Patient | undefined>();
  const [encounter, setEncounter] = useState<Encounter | undefined>();
  const [populatedValues, setPopulatedValues] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedResponseId, setSavedResponseId] = useState<string | undefined>();

  // Get patient and encounter IDs from query params
  const patientId = searchParams.get('patientId') || undefined;
  const encounterId = searchParams.get('encounterId') || undefined;

  // Load form data
  useEffect(() => {
    async function loadFormData() {
      if (!questionnaireId) {
        setError('No questionnaire ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchFormData(medplum, questionnaireId, patientId, encounterId);

        setQuestionnaire(data.questionnaire);
        setPatient(data.patient);
        setEncounter(data.encounter);
        setPopulatedValues(data.populatedValues);
      } catch (err) {
        console.error('Failed to load form data:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load form. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadFormData();
  }, [medplum, questionnaireId, patientId, encounterId]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (values: Record<string, any>) => {
      if (!questionnaire) {
        return;
      }

      try {
        setIsSubmitting(true);

        const response = await submitForm(medplum, questionnaire, values, {
          subject: patient ? { reference: `Patient/${patient.id}` } : undefined,
          encounter: encounter ? { reference: `Encounter/${encounter.id}` } : undefined,
        });

        notifications.show({
          title: t('formUI.messages.success') || 'Success',
          message: t('formUI.messages.formSubmitted') || 'Form submitted successfully',
          color: 'green',
          icon: <IconCheck size={16} />,
        });

        // Navigate to success page or form list
        navigate('/emr/forms/search', {
          state: { submittedResponseId: response.id },
        });
      } catch (err) {
        console.error('Failed to submit form:', err);
        notifications.show({
          title: t('formUI.messages.error') || 'Error',
          message: err instanceof Error ? err.message : 'Failed to submit form',
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [medplum, questionnaire, patient, encounter, navigate, t]
  );

  // Handle save draft
  const handleSaveDraft = useCallback(
    async (values: Record<string, any>) => {
      if (!questionnaire) {
        return;
      }

      try {
        setIsSavingDraft(true);

        const response = await saveDraft(medplum, questionnaire, values, {
          responseId: savedResponseId,
          subject: patient ? { reference: `Patient/${patient.id}` } : undefined,
          encounter: encounter ? { reference: `Encounter/${encounter.id}` } : undefined,
        });

        setSavedResponseId(response.id);

        notifications.show({
          title: t('formUI.messages.success') || 'Success',
          message: t('formUI.messages.draftSaved') || 'Draft saved successfully',
          color: 'blue',
        });
      } catch (err) {
        console.error('Failed to save draft:', err);
        notifications.show({
          title: t('formUI.messages.error') || 'Error',
          message: err instanceof Error ? err.message : 'Failed to save draft',
          color: 'red',
          icon: <IconAlertCircle size={16} />,
        });
      } finally {
        setIsSavingDraft(false);
      }
    },
    [medplum, questionnaire, patient, encounter, savedResponseId, t]
  );

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Extract patient info for display
  const patientInfo = patient ? extractPatientData(patient) : null;

  // Render loading state
  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Stack gap="md">
          <Skeleton height={40} />
          <Skeleton height={100} />
          <Skeleton height={60} />
          <Skeleton height={60} />
          <Skeleton height={60} />
        </Stack>
      </Container>
    );
  }

  // Render error state
  if (error || !questionnaire) {
    return (
      <Container size="md" py="xl">
        <Stack gap="md">
          <Alert
            icon={<IconAlertCircle size={24} />}
            title={t('formUI.messages.error') || 'Error'}
            color="red"
          >
            {error || 'Questionnaire not found'}
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
    <Container size="md" py="xl">
      <Stack gap="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Anchor href="/emr/forms" onClick={(e) => { e.preventDefault(); navigate('/emr/forms'); }}>
            {t('menu.forms') || 'Forms'}
          </Anchor>
          <Anchor href="/emr/forms/search" onClick={(e) => { e.preventDefault(); navigate('/emr/forms/search'); }}>
            {t('submenu.forms.search') || 'Search'}
          </Anchor>
          <Text>{questionnaire.title || 'Fill Form'}</Text>
        </Breadcrumbs>

        {/* Back button */}
        <Group>
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            {t('common.goBack') || 'Back'}
          </Button>
        </Group>

        {/* Patient context card */}
        {patient && patientInfo && (
          <Card shadow="sm" padding="md" radius="md" withBorder>
            <Group justify="space-between" wrap="wrap">
              <Group gap="xs">
                <IconUser size={20} color="var(--emr-turquoise)" />
                <Text fw={500}>{patientInfo.fullName || patientInfo.name}</Text>
                {patientInfo.personalId && (
                  <Badge variant="light" color="gray">
                    {patientInfo.personalId}
                  </Badge>
                )}
              </Group>
              <Group gap="xs">
                {patientInfo.dob && (
                  <Group gap={4}>
                    <IconCalendar size={16} />
                    <Text size="sm" c="dimmed">
                      {patientInfo.dob}
                      {patientInfo.age && ` (${patientInfo.age} years)`}
                    </Text>
                  </Group>
                )}
                {patientInfo.gender && (
                  <Badge variant="light" color={patientInfo.gender === 'male' ? 'blue' : 'pink'}>
                    {patientInfo.gender}
                  </Badge>
                )}
              </Group>
            </Group>
          </Card>
        )}

        {/* Encounter context info */}
        {encounter && (
          <Alert color="gray" variant="light">
            <Group gap="xs">
              <Text size="sm" fw={500}>
                {t('formUI.encounter') || 'Encounter'}:
              </Text>
              <Text size="sm">
                {encounter.period?.start
                  ? new Date(encounter.period.start).toLocaleDateString()
                  : 'N/A'}
              </Text>
              <Badge size="sm" variant="light" color={
                encounter.status === 'in-progress' ? 'green' :
                encounter.status === 'finished' ? 'gray' : 'blue'
              }>
                {encounter.status}
              </Badge>
            </Group>
          </Alert>
        )}

        {/* No patient warning */}
        {!patient && patientId && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="yellow"
            variant="light"
          >
            {t('formUI.messages.patientNotFound') || 'Patient not found. Form will not be auto-populated.'}
          </Alert>
        )}

        {/* Form */}
        <Paper shadow="sm" p="md" radius="md" withBorder>
          <FormRenderer
            questionnaire={questionnaire}
            patient={patient}
            encounter={encounter}
            initialValues={populatedValues}
            enablePatientBinding={!!patient}
            showBindingIndicators={!!patient}
            onSubmit={handleSubmit}
            onSaveDraft={handleSaveDraft}
            isSubmitting={isSubmitting || isSavingDraft}
            submitButtonText={t('formUI.buttons.submit') || 'Submit'}
            saveDraftButtonText={t('formUI.buttons.saveDraft') || 'Save Draft'}
          />
        </Paper>

        {/* Draft indicator */}
        {savedResponseId && (
          <Alert color="blue" variant="light">
            <Group gap="xs">
              <IconCheck size={16} />
              <Text size="sm">
                {t('formUI.messages.draftSavedIndicator') || 'Draft saved'}
              </Text>
              <Text size="xs" c="dimmed">
                ID: {savedResponseId}
              </Text>
            </Group>
          </Alert>
        )}
      </Stack>
    </Container>
  );
}

export default FormFillerView;
