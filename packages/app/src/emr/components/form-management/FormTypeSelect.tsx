// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { EMRSelect } from '../shared/EMRFormFields';
import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import formTypesData from '../../translations/form-types.json';

interface FormTypeOption {
  value: string;
  label: string;
}

interface FormTypeSelectProps {
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
 * Form type dropdown with multilingual support
 * Displays medical form types from Georgian healthcare system
 *
 * Features:
 * - 6 form types (Ambulatory, Stationary, Day Hospital, etc.)
 * - Multilingual support (Georgian, English, Russian)
 * - Searchable dropdown
 * - Optional (not required by default)
 *
 * Usage:
 * ```tsx
 * <FormTypeSelect
 *   value={formType}
 *   onChange={(value) => setFormType(value)}
 * />
 * ```
 */
export default function FormTypeSelect({
  value,
  onChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  error,
  size = 'md',
}: FormTypeSelectProps): JSX.Element {
  const { t, lang } = useTranslation();
  const [options, setOptions] = useState<FormTypeOption[]>([]);

  useEffect(() => {
    // Map form types to Select options based on current language
    const mappedOptions = formTypesData.formTypes.map((type) => ({
      value: type.value,
      label: type[lang as 'ka' | 'en' | 'ru'],
    }));
    setOptions(mappedOptions);
  }, [lang]);

  return (
    <EMRSelect
      label={label || t('formUI.labels.formType')}
      placeholder={placeholder || t('formUI.builder.selectFormType')}
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
