// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Select } from '@mantine/core';
import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import serviceCategoriesData from '../../translations/service-categories.json';

interface ServiceCategoryOption {
  value: string;
  label: string;
}

interface ServiceCategorySelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

/**
 * Service category dropdown with multilingual support
 * Displays service categories from Georgian healthcare system
 *
 * Features:
 * - 3 service categories (Ambulatory, Stationary, Both)
 * - Multilingual support (Georgian, English, Russian)
 * - Searchable dropdown
 * - Display format: "{code} - {translated_name}"
 *
 * Usage:
 * ```tsx
 * <ServiceCategorySelect
 *   value={serviceCategory}
 *   onChange={(value) => setServiceCategory(value)}
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
export default function ServiceCategorySelect({
  value,
  onChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  error,
}: ServiceCategorySelectProps): JSX.Element {
  const { t, lang } = useTranslation();
  const [options, setOptions] = useState<ServiceCategoryOption[]>([]);

  useEffect(() => {
    // Map service categories to Select options based on current language
    const mappedOptions = serviceCategoriesData.categories.map((category) => ({
      value: category.value,
      label: category[lang as 'ka' | 'en' | 'ru'], // Clean name without code prefix
    }));
    setOptions(mappedOptions);
  }, [lang]);

  return (
    <Select
      label={label || t('nomenclature.field.serviceCategory')}
      placeholder={placeholder || t('nomenclature.serviceCategory.placeholder')}
      value={value}
      onChange={onChange}
      data={options}
      required={required}
      withAsterisk={required}
      disabled={disabled}
      searchable
      clearable
      error={error}
      nothingFoundMessage={t('nomenclature.serviceCategory.noResults') || 'ვერ მოიძებნა'}
      size="md"
      styles={{ input: { minHeight: '44px' } }}
    />
  );
}
