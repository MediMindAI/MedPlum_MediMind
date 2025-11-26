// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useForm } from '@mantine/form';
import type { AccountFormValues } from '../types/account-management';
import { validateAccountForm } from '../services/accountValidators';

/**
 * Hook for managing account form state with validation
 *
 * @param initialValues - Optional initial values for editing existing accounts
 * @returns Mantine form instance with validation
 *
 * @example
 * const { form } = useAccountForm();
 * <form onSubmit={form.onSubmit(handleSubmit)}>
 *   <TextInput {...form.getInputProps('firstName')} />
 * </form>
 */
/**
 * Transform form values by converting Date objects to ISO strings
 * This ensures validators receive consistent string types
 *
 * Note: Even though TypeScript types define birthDate/hireDate as strings,
 * Mantine DateInput components can return Date objects at runtime.
 * This function handles the runtime conversion safely.
 */
function transformFormValues(values: AccountFormValues): AccountFormValues {
  const transformDate = (value: unknown): string | undefined => {
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    return value as string | undefined;
  };

  return {
    ...values,
    birthDate: transformDate(values.birthDate),
    hireDate: transformDate(values.hireDate),
  };
}

export function useAccountForm(initialValues?: AccountFormValues): { form: ReturnType<typeof useForm<AccountFormValues>> } {
  const form = useForm<AccountFormValues>({
    initialValues: initialValues || {
      firstName: '',
      lastName: '',
      fatherName: '',
      gender: 'unknown',
      birthDate: '',
      email: '',
      phoneNumber: '',
      workPhone: '',
      staffId: '',
      hireDate: '',
      role: '',
      specialty: '',
      roles: [], // Initialize with empty roles array
      rbacRoles: [], // Initialize with empty RBAC roles array
      active: true,
      notes: '',
    },

    validate: (values) => {
      // Transform Date objects to ISO strings before validation
      const transformedValues = transformFormValues(values);
      return validateAccountForm(transformedValues);
    },

    validateInputOnBlur: true,
    validateInputOnChange: false,
  });

  return { form };
}
