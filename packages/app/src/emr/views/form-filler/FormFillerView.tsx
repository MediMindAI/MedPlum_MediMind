// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Title,
  Text,
  Alert,
  Button,
  Group,
  Skeleton,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCheck,
} from '@tabler/icons-react';
import { useMedplum } from '@medplum/react-hooks';
import type { Questionnaire, Patient, Encounter } from '@medplum/fhirtypes';
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
 * Official medical document/certificate style form filling interface.
 * Paper-like aesthetic with numbered fields and underline inputs.
 *
 * Route: /emr/forms/fill/:id
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
      <Box
        style={{
          minHeight: 'calc(100vh - var(--emr-topnav-height) - var(--emr-mainmenu-height))',
          backgroundColor: 'var(--emr-gray-200)',
          padding: 'var(--emr-spacing-2xl)',
        }}
      >
        <Box style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Skeleton height={600} radius="md" style={{ backgroundColor: 'var(--emr-gray-50)' }} />
        </Box>
      </Box>
    );
  }

  // Render error state
  if (error || !questionnaire) {
    return (
      <Box
        style={{
          minHeight: 'calc(100vh - var(--emr-topnav-height) - var(--emr-mainmenu-height))',
          backgroundColor: 'var(--emr-gray-200)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
        }}
      >
        <Paper
          p="xl"
          radius="md"
          style={{
            maxWidth: '500px',
            textAlign: 'center',
            backgroundColor: 'var(--emr-gray-50)',
            boxShadow: 'var(--emr-shadow-lg)',
          }}
        >
          <ThemeIcon
            size={64}
            radius="xl"
            color="red"
            variant="light"
            style={{ margin: '0 auto 16px' }}
          >
            <IconAlertCircle size={32} />
          </ThemeIcon>
          <Title order={3} mb="sm" style={{ color: 'var(--emr-primary)' }}>
            {t('formUI.messages.error') || 'Error'}
          </Title>
          <Text c="dimmed" mb="lg">
            {error || 'Questionnaire not found'}
          </Text>
          <Button
            variant="outline"
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            {t('common.goBack') || 'Go Back'}
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      style={{
        minHeight: 'calc(100vh - var(--emr-topnav-height) - var(--emr-mainmenu-height))',
        backgroundColor: 'var(--emr-gray-200)',
        padding: 'var(--emr-spacing-2xl) var(--emr-spacing-lg)',
      }}
    >
      {/* Back Button */}
      <Box style={{ maxWidth: '900px', margin: '0 auto 16px' }}>
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={18} />}
          onClick={handleBack}
          style={{
            color: 'var(--emr-gray-600)',
            fontWeight: 500,
          }}
        >
          {t('common.goBack') || 'უკან დაბრუნება'}
        </Button>
      </Box>

      {/* Document Container */}
      <Box
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          backgroundColor: 'var(--emr-gray-50)',
          borderRadius: 'var(--emr-border-radius-sm)',
          boxShadow: 'var(--emr-shadow-lg)',
          overflow: 'hidden',
          border: '1px solid var(--emr-border-color)',
        }}
      >
        {/* Document Header - Official Stamp Area */}
        <Box
          style={{
            padding: '24px 40px',
            borderBottom: '1px solid var(--emr-border-color)',
          }}
        >
          {/* Right-aligned approval text - Only for Form 100 (IV-100/ა) */}
          {(questionnaire.name?.includes('100') || questionnaire.title?.includes('100')) && (
            <Box style={{ textAlign: 'right', marginBottom: '24px' }}>
              <Text size="xs" style={{ color: 'var(--emr-gray-500)', lineHeight: 1.6 }}>
                დამტკიცებულია
                <br />
                საქართველოს შრომის, ჯანმრთელობისა
                <br />
                და სოციალური დაცვის მინისტრის
                <br />
                2008 წ. 15.10 №230/ნ ბრძანებით
              </Text>
            </Box>
          )}

          {/* Centered Form Title */}
          <Box style={{ textAlign: 'center' }}>
            {/* Form number subtitle - Only for Form 100 */}
            {(questionnaire.name?.includes('100') || questionnaire.title?.includes('100')) && (
              <Text size="sm" style={{ color: 'var(--emr-gray-600)', marginBottom: '8px' }}>
                სამედიცინო დოკუმენტაცია ფორმა № IV-100/ა
              </Text>
            )}
            <Title
              order={2}
              style={{
                color: 'var(--emr-primary)',
                fontWeight: 700,
                fontSize: '28px',
                marginBottom: '4px',
              }}
            >
              {questionnaire.title || 'ცნობა'}
            </Title>
            {questionnaire.description && (
              <Title
                order={3}
                style={{
                  color: 'var(--emr-gray-700)',
                  fontWeight: 600,
                  fontSize: '20px',
                }}
              >
                {questionnaire.description}
              </Title>
            )}
          </Box>
        </Box>

        {/* Patient Info Banner (if patient context) */}
        {patient && patientInfo && (
          <Box
            style={{
              padding: '12px 40px',
              backgroundColor: 'var(--emr-light-accent)',
              borderBottom: '1px solid var(--emr-border-color)',
            }}
          >
            <Group gap="lg">
              <Text size="sm" fw={500}>
                პაციენტი: <span style={{ color: 'var(--emr-primary)' }}>{patientInfo.fullName || patientInfo.name}</span>
              </Text>
              {patientInfo.personalId && (
                <Text size="sm" c="dimmed">
                  პ/ნ: {patientInfo.personalId}
                </Text>
              )}
              {patientInfo.dob && (
                <Text size="sm" c="dimmed">
                  დაბ. თარიღი: {patientInfo.dob}
                </Text>
              )}
            </Group>
          </Box>
        )}

        {/* No Patient Warning */}
        {!patient && patientId && (
          <Box style={{ padding: '0 40px', marginTop: '16px' }}>
            <Alert
              icon={<IconAlertCircle size={18} />}
              color="yellow"
              variant="light"
              radius="sm"
            >
              {t('formUI.messages.patientNotFound') || 'Patient not found. Form will not be auto-populated.'}
            </Alert>
          </Box>
        )}

        {/* Form Content */}
        <Box style={{ padding: '32px 40px 40px' }}>
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
            submitButtonText={t('formUI.buttons.submit') || 'გაგზავნა'}
            saveDraftButtonText={t('formUI.buttons.saveDraft') || 'შენახვა'}
          />
        </Box>

        {/* Draft Indicator */}
        {savedResponseId && (
          <Box
            style={{
              padding: '12px 40px',
              backgroundColor: 'var(--emr-light-accent)',
              borderTop: '1px solid var(--emr-border-color)',
            }}
          >
            <Group gap="xs">
              <IconCheck size={16} style={{ color: 'var(--emr-secondary)' }} />
              <Text size="sm" style={{ color: 'var(--emr-secondary)' }}>
                {t('formUI.messages.draftSavedIndicator') || 'მონახაზი შენახულია'}
              </Text>
            </Group>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default FormFillerView;
