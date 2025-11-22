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
      return validateAccountForm(values);
    },

    validateInputOnBlur: true,
    validateInputOnChange: false,
  });

  return { form };
}
