// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Modal, Stack, Grid, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useMedplum } from '@medplum/react-hooks';
import { notifications } from '@mantine/notifications';
import type { CodeSystemConcept } from '@medplum/fhirtypes';
import { useTranslation } from '../../../hooks/useTranslation';
import { updateUnit, conceptToFormValues } from '../../../services/unitService';
import { EMRTextInput, EMRSelect, EMRSwitch } from '../../shared/EMRFormFields';
import type { UnitFormValues } from '../../../types/settings';

interface UnitEditModalProps {
  opened: boolean;
  onClose: () => void;
  unit: CodeSystemConcept;
  onSuccess: () => void;
}

/**
 * Modal for editing an existing measurement unit
 */
export function UnitEditModal({ opened, onClose, unit, onSuccess }: UnitEditModalProps) {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UnitFormValues>({
    initialValues: conceptToFormValues(unit),
    validate: {
      code: (value) => (!value ? t('settings.units.validation.codeRequired') || 'Code is required' : null),
      displayKa: (value) =>
        !value ? t('settings.units.validation.displayKaRequired') || 'Georgian name is required' : null,
    },
  });

  const handleSubmit = async (values: UnitFormValues) => {
    try {
      setSubmitting(true);

      await updateUnit(medplum, unit.code!, values);

      notifications.show({
        title: t('settings.units.success.updateTitle') || 'Success',
        message: t('settings.units.success.updateMessage') || 'Unit updated successfully',
        color: 'green',
      });

      onSuccess();
      onClose();
    } catch (error) {
      notifications.show({
        title: t('settings.units.error.updateTitle') || 'Error',
        message: t('settings.units.error.updateMessage') || 'Failed to update unit',
        color: 'red',
      });
      console.error('Error updating unit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: 'count', label: t('settings.units.category.count') || 'Count' },
    { value: 'volume', label: t('settings.units.category.volume') || 'Volume' },
    { value: 'mass', label: t('settings.units.category.mass') || 'Mass' },
    { value: 'concentration', label: t('settings.units.category.concentration') || 'Concentration' },
    { value: 'other', label: t('settings.units.category.other') || 'Other' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('settings.units.edit.title') || 'Edit Unit'}
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <EMRTextInput
                label={t('settings.units.field.code') || 'Code'}
                placeholder={t('settings.units.field.codePlaceholder') || 'UNIT-001'}
                required
                {...form.getInputProps('code')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <EMRTextInput
                label={t('settings.units.field.symbol') || 'Symbol'}
                placeholder={t('settings.units.field.symbolPlaceholder') || 'мл, k/μl'}
                {...form.getInputProps('symbol')}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={12}>
              <EMRTextInput
                label={t('settings.units.field.displayKa') || 'Name'}
                placeholder={t('settings.units.field.displayKaPlaceholder') || 'ერთეული'}
                required
                {...form.getInputProps('displayKa')}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <EMRSelect
                label={t('settings.units.field.category') || 'Category'}
                placeholder={t('settings.units.field.categoryPlaceholder') || 'Select category'}
                data={categoryOptions}
                clearable
                {...form.getInputProps('category')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <EMRSwitch
                label={t('settings.units.field.active') || 'Active'}
                {...form.getInputProps('active', { type: 'checkbox' })}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Button variant="outline" onClick={onClose} fullWidth>
                {t('settings.units.actions.cancel') || 'Cancel'}
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
                {t('settings.units.actions.save') || 'Save'}
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
      </form>
    </Modal>
  );
}
