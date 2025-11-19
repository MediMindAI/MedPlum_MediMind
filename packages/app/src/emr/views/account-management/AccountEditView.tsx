/**
 * AccountEditView - Full-Page Edit
 *
 * Route-based editing at /emr/account-management/edit/:id
 * Alternative to modal editing (for direct URL access)
 */

import { Container, Title, Paper, Button, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMedplum } from '@medplum/react-hooks';
import { Practitioner } from '@medplum/fhirtypes';
import { AccountForm } from '../../components/account-management/AccountForm';
import { useTranslation } from '../../hooks/useTranslation';
import { updatePractitioner, getPractitionerById } from '../../services/accountService';
import { practitionerToFormValues } from '../../services/accountHelpers';
import type { AccountFormValues } from '../../types/account-management';

/**
 * Full-page account editing view
 *
 * Accessed via route: /emr/account-management/edit/:id
 * Fallback for direct URL access (modal editing is preferred)
 */
export function AccountEditView(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const medplum = useMedplum();
  const { t } = useTranslation();

  const [practitioner, setPractitioner] = useState<Practitioner | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch practitioner on mount
  useEffect(() => {
    if (!id) {
      navigate('/emr/account-management');
      return;
    }

    const fetchPractitioner = async () => {
      setLoading(true);
      try {
        const data = await getPractitionerById(medplum, id);
        setPractitioner(data);
      } catch (error) {
        notifications.show({
          title: t('accountManagement.edit.error'),
          message: t('accountManagement.edit.loadError'),
          color: 'red',
        });
        navigate('/emr/account-management');
      } finally {
        setLoading(false);
      }
    };

    fetchPractitioner();
  }, [id, medplum, navigate, t]);

  const handleSubmit = async (values: AccountFormValues) => {
    if (!practitioner) return;

    setSubmitting(true);
    try {
      await updatePractitioner(medplum, practitioner, values);

      notifications.show({
        title: t('accountManagement.edit.success'),
        message: t('accountManagement.edit.successMessage'),
        color: 'green',
      });

      navigate('/emr/account-management');
    } catch (error) {
      notifications.show({
        title: t('accountManagement.edit.error'),
        message: (error as Error).message || t('accountManagement.edit.errorMessage'),
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/emr/account-management');
  };

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Title order={1} mb="md">
          {t('accountManagement.edit.title')}
        </Title>
        <Paper p="xl">
          <div>{t('accountManagement.edit.loading')}</div>
        </Paper>
      </Container>
    );
  }

  if (!practitioner) {
    return null;
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Title order={1}>{t('accountManagement.edit.title')}</Title>

        <Paper p="xl" shadow="sm" withBorder>
          <AccountForm
            onSubmit={handleSubmit}
            initialValues={practitionerToFormValues(practitioner)}
            loading={submitting}
          />

          <Button onClick={handleCancel} variant="subtle" mt="md" fullWidth>
            {t('accountManagement.edit.cancel')}
          </Button>
        </Paper>
      </Stack>
    </Container>
  );
}
