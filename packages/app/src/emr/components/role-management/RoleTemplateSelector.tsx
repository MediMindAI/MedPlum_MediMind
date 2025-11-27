// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Select, SelectProps } from '@mantine/core';
import { useTranslation } from '../../hooks/useTranslation';
import { getRoleTemplates } from '../../services/roleTemplateService';
import type { RoleTemplate } from '../../types/role-management';

interface RoleTemplateSelectorProps extends Omit<SelectProps, 'data' | 'onChange'> {
  onSelect: (template: RoleTemplate) => void;
  selectedCode?: string;
}

/**
 * Role template selector dropdown component
 * Displays 16 predefined role templates with multilingual support
 *
 * @param props - Component props
 * @param props.onSelect - Callback when template is selected
 * @param props.selectedCode - Currently selected template code
 */
export function RoleTemplateSelector({ onSelect, selectedCode, ...selectProps }: RoleTemplateSelectorProps): JSX.Element {
  const { lang } = useTranslation();
  const templates = getRoleTemplates(lang);

  // Translation keys
  const labelText: Record<string, string> = {
    ka: 'როლის შაბლონი',
    en: 'Role Template',
    ru: 'Шаблон роли',
  };

  const placeholderText: Record<string, string> = {
    ka: 'აირჩიეთ შაბლონი...',
    en: 'Select a template...',
    ru: 'Выберите шаблон...',
  };

  const handleChange = (code: string | null): void => {
    if (code) {
      const template = templates.find((t) => t.code === code);
      if (template) {
        onSelect(template);
      }
    }
  };

  return (
    <Select
      label={labelText[lang] || labelText.en}
      placeholder={placeholderText[lang] || placeholderText.en}
      data={templates.map((t) => ({
        value: t.code,
        label: t.name,
      }))}
      value={selectedCode || null}
      onChange={handleChange}
      searchable
      clearable
      maxDropdownHeight={400}
      {...selectProps}
    />
  );
}
