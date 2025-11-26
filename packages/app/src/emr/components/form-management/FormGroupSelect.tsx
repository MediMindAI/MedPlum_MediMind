// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { EMRSelect } from '../shared/EMRFormFields';
import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import serviceGroupsData from '../../translations/service-groups.json';

interface FormGroupOption {
  value: string;
  label: string;
}

interface FormGroupSelectProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  size?: string;
}

/**
 * Form group dropdown with multilingual support
 * Displays medical form groups from Georgian healthcare system
 *
 * Features:
 * - 7 form groups (Consultation, Operation, Laboratory, etc.)
 * - Multilingual support (Georgian, English, Russian)
 * - Searchable dropdown
 * - Optional (not required by default)
 *
 * Usage:
 * ```tsx
 * <FormGroupSelect
 *   value={formGroup}
 *   onChange={(value) => setFormGroup(value)}
 * />
 * ```
 */
export default function FormGroupSelect({
  value,
  onChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  error,
  size = 'md',
}: FormGroupSelectProps): JSX.Element {
  const { t, lang } = useTranslation();
  const [options, setOptions] = useState<FormGroupOption[]>([]);

  useEffect(() => {
    // Map form groups to Select options based on current language
    const mappedOptions = serviceGroupsData.groups.map((group) => ({
      value: group.value,
      label: group[lang as 'ka' | 'en' | 'ru'],
    }));
    setOptions(mappedOptions);
  }, [lang]);

  return (
    <EMRSelect
      label={label || t('formUI.labels.group')}
      placeholder={placeholder || t('formUI.builder.selectGroup')}
      value={value || null}
      onChange={onChange}
      data={options}
      required={required}
      disabled={disabled}
      searchable
      clearable
      size={size}
      error={error}
      nothingFoundMessage={t('common.noResults') || 'ვერ მოიძებნა'}
    />
  );
}
