// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, NumberInput, Switch } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from '../../../hooks/useTranslation';
import { EMRTextInput } from '../../shared/EMRFormFields';
import type { MedicalDataFormValues } from '../../../types/settings';

interface MedicalDataFormProps {
  initialValues?: MedicalDataFormValues;
  onSubmit: (values: MedicalDataFormValues) => void | Promise<void>;
  category: 'physical' | 'postop';
  loading?: boolean;
}

/**
 * Form component for creating/editing medical data items
 *
 * Features:
 * - Code, Georgian name (required), English/Russian names (optional)
 * - Unit, sort order (optional)
 * - Active status switch
 * - Validation for required fields
 */
export function MedicalDataForm({ initialValues, onSubmit, category, loading }: MedicalDataFormProps) {
  const { t } = useTranslation();

  const form = useForm<MedicalDataFormValues>({
    initialValues: initialValues || {
      code: '',
      nameKa: '',
      unit: '',
      sortOrder: undefined,
      category,
      active: true,
    },
    validate: {
      code: (value) => (!value ? t('settings.medicalData.validation.codeRequired') || 'Code is required' : null),
      nameKa: (value) =>
        !value ? t('settings.medicalData.validation.nameKaRequired') || 'Georgian name is required' : null,
    },
  });

  const handleSubmit = (values: MedicalDataFormValues) => {
    onSubmit(values);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <EMRTextInput
            label={t('settings.medicalData.field.code') || 'Code'}
            placeholder={t('settings.medicalData.field.codePlaceholder') || 'e.g., systolic'}
            required
            {...form.getInputProps('code')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <EMRTextInput
            label={t('settings.medicalData.field.nameKa') || 'Name'}
            placeholder={t('settings.medicalData.field.nameKaPlaceholder') || 'დასახელება'}
            required
            {...form.getInputProps('nameKa')}
          />
        </Grid.Col>
      </Grid>

      <Grid mt="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <EMRTextInput
            label={t('settings.medicalData.field.unit') || 'Unit'}
            placeholder={t('settings.medicalData.field.unitPlaceholder') || 'e.g., mmHg, °C, bpm'}
            {...form.getInputProps('unit')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <NumberInput
            label={t('settings.medicalData.field.sortOrder') || 'Sort Order'}
            placeholder={t('settings.medicalData.field.sortOrderPlaceholder') || '1, 2, 3...'}
            min={0}
            {...form.getInputProps('sortOrder')}
          />
        </Grid.Col>
      </Grid>

      <Grid mt="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Switch
            label={t('settings.medicalData.field.active') || 'Active'}
            {...form.getInputProps('active', { type: 'checkbox' })}
          />
        </Grid.Col>
      </Grid>
    </form>
  );
}
