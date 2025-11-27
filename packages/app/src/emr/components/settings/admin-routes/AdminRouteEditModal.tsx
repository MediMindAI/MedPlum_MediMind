// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Stack, Grid, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import type { CodeSystemConcept } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';
import { updateAdminRoute, conceptToFormValues } from '../../../services/adminRouteService';
import { EMRTextInput, EMRTextarea, EMRSwitch } from '../../shared/EMRFormFields';
import type { AdminRouteFormValues } from '../../../types/settings';

interface AdminRouteEditModalProps {
  opened: boolean;
  onClose: () => void;
  route: CodeSystemConcept;
  onSuccess: () => void;
}

/**
 * Modal for editing an existing administration route
 */
export function AdminRouteEditModal({ opened, onClose, route, onSuccess }: AdminRouteEditModalProps) {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<AdminRouteFormValues>({
    initialValues: conceptToFormValues(route),
    validate: {
      code: (value) => (!value ? t('settings.adminRoutes.validation.codeRequired') || 'Code is required' : null),
      displayKa: (value) =>
        !value ? t('settings.adminRoutes.validation.displayKaRequired') || 'Georgian name is required' : null,
      abbreviation: (value) =>
        !value ? t('settings.adminRoutes.validation.abbreviationRequired') || 'Abbreviation is required' : null,
    },
  });

  const handleSubmit = async (values: AdminRouteFormValues) => {
    try {
      setSubmitting(true);

      await updateAdminRoute(medplum, route.code!, values);

      notifications.show({
        title: t('settings.adminRoutes.success.updateTitle') || 'Success',
        message: t('settings.adminRoutes.success.updateMessage') || 'Route updated successfully',
        color: 'green',
      });

      onSuccess();
      onClose();
    } catch (error) {
      notifications.show({
        title: t('settings.adminRoutes.error.updateTitle') || 'Error',
        message: t('settings.adminRoutes.error.updateMessage') || 'Failed to update route',
        color: 'red',
      });
      console.error('Error updating admin route:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('settings.adminRoutes.edit.title') || 'Edit Administration Route'}
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <EMRTextInput
                label={t('settings.adminRoutes.field.code') || 'Code'}
                placeholder={t('settings.adminRoutes.field.codePlaceholder') || 'ROUTE-001'}
                required
                {...form.getInputProps('code')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <EMRTextInput
                label={t('settings.adminRoutes.field.abbreviation') || 'Abbreviation'}
                placeholder={t('settings.adminRoutes.field.abbreviationPlaceholder') || 'p.o., i.v.'}
                required
                {...form.getInputProps('abbreviation')}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={12}>
              <EMRTextInput
                label={t('settings.adminRoutes.field.displayKa') || 'Name'}
                placeholder={t('settings.adminRoutes.field.displayKaPlaceholder') || 'მიღების ტიპი'}
                required
                {...form.getInputProps('displayKa')}
              />
            </Grid.Col>
          </Grid>

          <EMRTextarea
            label={t('settings.adminRoutes.field.description') || 'Description'}
            placeholder={t('settings.adminRoutes.field.descriptionPlaceholder') || 'Additional notes...'}
            minRows={3}
            {...form.getInputProps('description')}
          />

          <EMRSwitch
            label={t('settings.adminRoutes.field.active') || 'Active'}
            {...form.getInputProps('active', { type: 'checkbox' })}
          />

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Button variant="outline" onClick={onClose} fullWidth>
                {t('settings.adminRoutes.actions.cancel') || 'Cancel'}
              </Button>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Button
                type="submit"
                loading={submitting}
                fullWidth
                style={{
                  background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 50%, #3182ce 100%)',
                }}
              >
                {t('settings.adminRoutes.actions.save') || 'Save'}
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </form>
    </Modal>
  );
}
