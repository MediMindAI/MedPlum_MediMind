// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { SelectProps } from '@mantine/core';
import { useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import specialtiesData from '../../translations/medical-specialties.json';
import { EMRSelect } from '../shared/EMRFormFields';

/**
 * Props for SpecialtySelect component
 */
export interface SpecialtySelectProps extends Omit<SelectProps, 'data'> {
  value: string | null;
  onChange: (value: string | null) => void;
}

/**
 * SpecialtySelect - Searchable select component for medical specialties
 *
 * Displays 25 medical specialties from medical-specialties.json with multilingual
 * support (ka/en/ru). Uses NUCC Healthcare Provider Taxonomy codes.
 *
 * @param root0
 * @param root0.value
 * @param root0.onChange
 * @param root0.label
 * @example
 * ```tsx
 * <SpecialtySelect
 *   value="207RC0000X"
 *   onChange={(code) => setSpecialty(code)}
 *   label="სამედიცინო სპეციალობა"
 *   clearable
 * />
 * ```
 */
export function SpecialtySelect({ value, onChange, label, ...props }: SpecialtySelectProps): JSX.Element {
  const { lang } = useTranslation();

  /**
   * Transform specialty data into Mantine Select format
   */
  const specialtyOptions = useMemo(() => {
    return specialtiesData.specialties.map((specialty) => ({
      value: specialty.code,
      label: specialty.name[lang as 'ka' | 'en' | 'ru'],
    }));
  }, [lang]);

  /**
   * Get translated placeholder
   */
  const placeholder = useMemo(() => {
    const translations = {
      ka: 'აირჩიეთ სპეციალობა',
      en: 'Select specialty',
      ru: 'Выберите специальность',
    };
    return translations[lang as 'ka' | 'en' | 'ru'] || translations.ka;
  }, [lang]);

  /**
   * Get translated label if not provided
   */
  const displayLabel = useMemo(() => {
    if (label) {return label;}

    const translations = {
      ka: 'სამედიცინო სპეციალობა',
      en: 'Medical Specialty',
      ru: 'Медицинская специальность',
    };
    return translations[lang as 'ka' | 'en' | 'ru'] || translations.ka;
  }, [label, lang]);

  return (
    <EMRSelect
      label={displayLabel}
      placeholder={placeholder}
      data={specialtyOptions}
      value={value}
      onChange={onChange}
      searchable
      {...props}
    />
  );
}
