// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { MultiSelectProps } from '@mantine/core';
import { MultiSelect } from '@mantine/core';
import { useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import rolesData from '../../translations/account-roles.json';

/**
 * Props for RoleSelector component
 */
export interface RoleSelectorProps extends Omit<MultiSelectProps, 'data'> {
  value: string[];
  onChange: (value: string[]) => void;
}

/**
 * RoleSelector - Multi-select component for hospital staff roles
 *
 * Displays roles from account-roles.json with multilingual support (ka/en/ru).
 * Allows selection of multiple roles for practitioners with complex responsibilities.
 *
 * @param root0
 * @param root0.value
 * @param root0.onChange
 * @param root0.label
 * @example
 * ```tsx
 * <RoleSelector
 *   value={['physician', 'department-head']}
 *   onChange={(roles) => setSelectedRoles(roles)}
 *   label="როლები"
 * />
 * ```
 */
export function RoleSelector({ value, onChange, label, ...props }: RoleSelectorProps): JSX.Element {
  const { t, lang } = useTranslation();

  /**
   * Transform role data into Mantine Select format
   */
  const roleOptions = useMemo(() => {
    return rolesData.roles.map((role) => ({
      value: role.code,
      label: role.name[lang as 'ka' | 'en' | 'ru'],
    }));
  }, [lang]);

  /**
   * Get translated placeholder
   */
  const placeholder = useMemo(() => {
    const translations = {
      ka: 'აირჩიეთ როლები',
      en: 'Select roles',
      ru: 'Выберите роли',
    };
    return translations[lang as 'ka' | 'en' | 'ru'] || translations.ka;
  }, [lang]);

  /**
   * Get translated label if not provided
   */
  const displayLabel = useMemo(() => {
    if (label) {return label;}

    const translations = {
      ka: 'როლები',
      en: 'Roles',
      ru: 'Роли',
    };
    return translations[lang as 'ka' | 'en' | 'ru'] || translations.ka;
  }, [label, lang]);

  return (
    <MultiSelect
      label={displayLabel}
      placeholder={placeholder}
      data={roleOptions}
      value={value}
      onChange={onChange}
      searchable
      size="md"
      styles={{
        input: {
          minHeight: '44px', // Touch-friendly tap target
        },
      }}
      {...props}
    />
  );
}
