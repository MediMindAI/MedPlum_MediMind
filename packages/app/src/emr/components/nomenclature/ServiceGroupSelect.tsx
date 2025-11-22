// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Select } from '@mantine/core';
import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import serviceGroupsData from '../../translations/service-groups.json';

interface ServiceGroupOption {
  value: string;
  label: string;
}

interface ServiceGroupSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

/**
 * Service group dropdown with multilingual support
 * Displays service groups from Georgian healthcare system
 *
 * Features:
 * - 7 service groups (Consultation, Operation, Laboratory, etc.)
 * - Multilingual support (Georgian, English, Russian)
 * - Searchable dropdown
 * - Display format: "{code} - {translated_name}"
 *
 * Usage:
 * ```tsx
 * <ServiceGroupSelect
 *   value={serviceGroup}
 *   onChange={(value) => setServiceGroup(value)}
 *   required
 * />
 * ```
 * @param root0
 * @param root0.value
 * @param root0.onChange
 * @param root0.label
 * @param root0.placeholder
 * @param root0.required
 * @param root0.disabled
 * @param root0.error
 */
export default function ServiceGroupSelect({
  value,
  onChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  error,
}: ServiceGroupSelectProps): JSX.Element {
  const { t, lang } = useTranslation();
  const [options, setOptions] = useState<ServiceGroupOption[]>([]);

  useEffect(() => {
    // Map service groups to Select options based on current language
    const mappedOptions = serviceGroupsData.groups.map((group) => ({
      value: group.value,
      label: group[lang as 'ka' | 'en' | 'ru'], // Clean name without code prefix
    }));
    setOptions(mappedOptions);
  }, [lang]);

  return (
    <Select
      label={label || t('nomenclature.field.serviceGroup')}
      placeholder={placeholder || t('nomenclature.serviceGroup.placeholder')}
      value={value}
      onChange={onChange}
      data={options}
      required={required}
      withAsterisk={required}
      disabled={disabled}
      searchable
      clearable
      error={error}
      nothingFoundMessage={t('nomenclature.serviceGroup.noResults') || 'ვერ მოიძებნა'}
      size="md"
      styles={{ input: { minHeight: '44px' } }}
    />
  );
}
