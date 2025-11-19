// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Select } from '@mantine/core';
import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import serviceTypesData from '../../translations/service-types.json';

interface ServiceTypeOption {
  value: string;
  label: string;
}

interface ServiceTypeSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

/**
 * Service type dropdown with multilingual support
 * Displays service types from Georgian healthcare system
 *
 * Features:
 * - 7 service types (Internal, Other Clinics, Limbach, etc.)
 * - Multilingual support (Georgian, English, Russian)
 * - Searchable dropdown
 * - Display format: "{code} - {translated_name}"
 *
 * Usage:
 * ```tsx
 * <ServiceTypeSelect
 *   value={serviceType}
 *   onChange={(value) => setServiceType(value)}
 *   required
 * />
 * ```
 */
export default function ServiceTypeSelect({
  value,
  onChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  error,
}: ServiceTypeSelectProps): JSX.Element {
  const { t, lang } = useTranslation();
  const [options, setOptions] = useState<ServiceTypeOption[]>([]);

  useEffect(() => {
    // Map service types to Select options based on current language
    const mappedOptions = serviceTypesData.types.map((type) => ({
      value: type.value,
      label: type[lang as 'ka' | 'en' | 'ru'], // Clean name without code prefix
    }));
    setOptions(mappedOptions);
  }, [lang]);

  return (
    <Select
      label={label || t('nomenclature.field.serviceType')}
      placeholder={placeholder || t('nomenclature.serviceType.placeholder')}
      value={value}
      onChange={onChange}
      data={options}
      required={required}
      withAsterisk={required}
      disabled={disabled}
      searchable
      clearable
      error={error}
      nothingFoundMessage={t('nomenclature.serviceType.noResults') || 'ვერ მოიძებნა'}
      size="md"
      styles={{ input: { minHeight: '44px' } }}
    />
  );
}
