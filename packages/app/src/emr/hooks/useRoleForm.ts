// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { useForm } from '@mantine/form';
import { useMedplum } from '@medplum/react-hooks';
import type { RoleFormValues } from '../types/role-management';
import {
  validateRoleName,
  validateRoleCode,
  validatePermissions,
  validateRoleDescription,
  checkDuplicateRoleName,
  checkDuplicateRoleCode,
} from '../services/roleValidators';

interface UseRoleFormOptions {
  initialValues?: Partial<RoleFormValues>;
  roleId?: string; // Role ID for edit mode (to exclude from duplicate check)
  onSubmit: (values: RoleFormValues) => void | Promise<void>;
}

/**
 * Hook for role form state management with Mantine
 * @param options - Form options
 * @returns Mantine form instance and submit handler
 */
export function useRoleForm(options: UseRoleFormOptions): {
  form: ReturnType<typeof useForm<RoleFormValues>>;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
} {
  const medplum = useMedplum();

  const form = useForm<RoleFormValues>({
    initialValues: {
      code: options.initialValues?.code || '',
      name: options.initialValues?.name || '',
      description: options.initialValues?.description || '',
      status: options.initialValues?.status || 'active',
      permissions: options.initialValues?.permissions || [],
    },

    validate: {
      name: (value) => {
        const result = validateRoleName(value);
        return result.valid ? null : result.error;
      },
      code: (value) => {
        const result = validateRoleCode(value);
        return result.valid ? null : result.error;
      },
      description: (value) => {
        const result = validateRoleDescription(value);
        return result.valid ? null : result.error;
      },
      permissions: (value) => {
        const result = validatePermissions(value);
        return result.valid ? null : result.error;
      },
    },

    validateInputOnBlur: true,
  });

  const handleSubmit = form.onSubmit(async (values) => {
    // Async validation for name uniqueness
    const nameResult = await validateRoleName(values.name);
    if (!nameResult.valid) {
      form.setFieldError('name', nameResult.error);
      return;
    }

    const nameDuplicate = await checkDuplicateRoleName(medplum, values.name, options.roleId);
    if (nameDuplicate) {
      form.setFieldError('name', 'A role with this name already exists');
      return;
    }

    // Async validation for code uniqueness
    const codeResult = validateRoleCode(values.code);
    if (!codeResult.valid) {
      form.setFieldError('code', codeResult.error);
      return;
    }

    const codeDuplicate = await checkDuplicateRoleCode(medplum, values.code, options.roleId);
    if (codeDuplicate) {
      form.setFieldError('code', 'A role with this code already exists');
      return;
    }

    await options.onSubmit(values);
  });

  return {
    form,
    handleSubmit,
  };
}
