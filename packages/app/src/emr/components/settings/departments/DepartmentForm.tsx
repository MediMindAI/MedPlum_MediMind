// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Switch } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from '../../../hooks/useTranslation';
import { EMRTextInput, EMRSelect } from '../../shared/EMRFormFields';
import type { DepartmentFormValues, DepartmentRow } from '../../../types/settings';

interface DepartmentFormProps {
  initialValues?: DepartmentFormValues;
  onSubmit: (values: DepartmentFormValues) => void | Promise<void>;
  departments?: DepartmentRow[]; // For parent department select
  loading?: boolean;
}

/**
 * Form component for creating/editing departments
 *
 * Features:
 * - Code, Georgian name (required), English name, Russian name (optional)
 * - Parent department select (optional)
 * - Active status switch
 * - Validation for required fields
 */
export function DepartmentForm({ initialValues, onSubmit, departments = [], loading }: DepartmentFormProps) {
  const { t } = useTranslation();

  const form = useForm<DepartmentFormValues>({
    initialValues: initialValues || {
      code: '',
      nameKa: '',
      parentId: undefined,
      active: true,
    },
    validate: {
      code: (value) => (!value ? t('settings.departments.validation.codeRequired') || 'Code is required' : null),
      nameKa: (value) =>
        !value ? t('settings.departments.validation.nameKaRequired') || 'Georgian name is required' : null,
    },
  });

  const handleSubmit = (values: DepartmentFormValues) => {
    onSubmit(values);
  };

  // Parent department options (exclude current department when editing)
  const parentOptions = departments
    .filter((dept) => dept.active && dept.id !== initialValues?.id)
    .map((dept) => ({
      value: dept.id,
      label: dept.nameKa,
    }));

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <EMRTextInput
            label={t('settings.departments.field.code') || 'Department Code'}
            placeholder={t('settings.departments.field.codePlaceholder') || 'Enter code (e.g., DEPT-001)'}
            required
            {...form.getInputProps('code')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <EMRTextInput
            label={t('settings.departments.field.nameKa') || 'Name'}
            placeholder={t('settings.departments.field.nameKaPlaceholder') || 'დეპარტამენტის სახელი'}
            required
            {...form.getInputProps('nameKa')}
          />
        </Grid.Col>
      </Grid>

      <Grid mt="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <EMRSelect
            label={t('settings.departments.field.parent') || 'Parent Department'}
            placeholder={t('settings.departments.field.parentPlaceholder') || 'Select parent (optional)'}
            data={parentOptions}
            clearable
            {...form.getInputProps('parentId')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }} style={{ display: 'flex', alignItems: 'flex-end' }}>
          <Switch
            label={t('settings.departments.field.active') || 'Active'}
            {...form.getInputProps('active', { type: 'checkbox' })}
            mb="xs"
          />
        </Grid.Col>
      </Grid>
    </form>
  );
}
