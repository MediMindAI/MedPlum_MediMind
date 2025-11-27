// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useTranslation } from '../../../hooks/useTranslation';
import { EMRTextInput, EMRSelect } from '../../shared/EMRFormFields';
import type { CashRegisterFormValues } from '../../../types/settings';

interface CashRegisterFormProps {
  form: UseFormReturnType<CashRegisterFormValues>;
}

/**
 * Cash Register Form Component
 *
 * Reusable form fields for creating/editing cash registers.
 * Used in both inline add form and edit modal.
 */
export function CashRegisterForm({ form }: CashRegisterFormProps) {
  const { t } = useTranslation();

  // Cash register type options
  const typeOptions = [
    { value: 'cash', label: t('settings.cashRegisters.types.cash') || 'სალარო' },
    { value: 'bank', label: t('settings.cashRegisters.types.bank') || 'ბანკი' },
    { value: 'founder', label: t('settings.cashRegisters.types.founder') || 'დამფუძნებელი' },
    { value: 'salary', label: t('settings.cashRegisters.types.salary') || 'ხელფასი' },
    { value: 'expense', label: t('settings.cashRegisters.types.expense') || 'ხარჯი' },
    { value: 'transfer', label: t('settings.cashRegisters.types.transfer') || 'გადარიცხვა' },
    { value: 'client', label: t('settings.cashRegisters.types.client') || 'კლიენტი' },
  ];

  return (
    <>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <EMRTextInput
            label={t('settings.cashRegisters.field.code') || 'კოდი'}
            placeholder={t('settings.cashRegisters.field.codePlaceholder') || '1'}
            required
            {...form.getInputProps('code')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <EMRTextInput
            label={t('settings.cashRegisters.field.bankCode') || 'ქარხნული კოდი'}
            placeholder={t('settings.cashRegisters.field.bankCodePlaceholder') || 'GE37TB6600000444467944'}
            {...form.getInputProps('bankCode')}
          />
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <EMRTextInput
            label={t('settings.cashRegisters.field.nameKa') || 'სახელი'}
            placeholder={t('settings.cashRegisters.field.nameKaPlaceholder') || 'სალარო 1'}
            required
            {...form.getInputProps('nameKa')}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <EMRSelect
            label={t('settings.cashRegisters.field.type') || 'ტიპი'}
            placeholder={t('settings.cashRegisters.field.typePlaceholder') || 'აირჩიეთ ტიპი'}
            data={typeOptions}
            required
            {...form.getInputProps('type')}
          />
        </Grid.Col>
      </Grid>

    </>
  );
}
