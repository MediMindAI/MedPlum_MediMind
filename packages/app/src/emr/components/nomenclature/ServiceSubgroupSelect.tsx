// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { EMRSelect } from '../shared/EMRFormFields';
import type { JSX } from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import serviceSubgroupsData from '../../translations/service-subgroups.json';

interface ServiceSubgroup {
  value: string;
  ka: string;
  en: string;
  ru: string;
}

interface ServiceSubgroupOption {
  value: string;
  label: string;
}

interface ServiceSubgroupSelectProps {
  value?: string;
  onChange?: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  searchable?: boolean;
  error?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Service subgroup dropdown with multilingual support
 * Displays 50 service subgroups from Georgian healthcare system
 *
 * Features:
 * - 50 service subgroup options
 * - Multilingual support (Georgian, English, Russian)
 * - Searchable dropdown
 * - Display format: "{code} - {translated_name}"
 *
 * Usage:
 * ```tsx
 * <ServiceSubgroupSelect
 *   value={subgroupId}
 *   onChange={(value) => setSubgroupId(value)}
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
 * @param root0.clearable
 * @param root0.searchable
 * @param root0.error
 */
export function ServiceSubgroupSelect({
  value,
  onChange,
  label,
  placeholder,
  required = false,
  disabled = false,
  clearable = true,
  searchable = true,
  error,
  size = 'md',
}: ServiceSubgroupSelectProps): JSX.Element {
  const { t, lang } = useTranslation();
  const [options, setOptions] = useState<ServiceSubgroupOption[]>([]);

  useEffect(() => {
    // Map subgroups to Select options based on current language
    const subgroups = serviceSubgroupsData.subgroups as ServiceSubgroup[];
    const mappedOptions = subgroups.map((subgroup) => ({
      value: subgroup.value,
      label: subgroup[lang as 'ka' | 'en' | 'ru'], // Clean name without code prefix
    }));
    setOptions(mappedOptions);
  }, [lang]);

  return (
    <EMRSelect
      label={label || t('nomenclature.field.serviceSubgroup')}
      placeholder={placeholder || t('nomenclature.placeholder.selectSubgroup')}
      value={value}
      onChange={onChange}
      data={options}
      required={required}
      disabled={disabled}
      clearable={clearable}
      searchable={searchable}
      error={error}
      maxDropdownHeight={300}
    />
  );
}
