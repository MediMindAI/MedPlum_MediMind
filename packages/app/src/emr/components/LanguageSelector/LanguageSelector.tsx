// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Group, UnstyledButton, Text } from '@mantine/core';
import { useTranslation } from '../../hooks/useTranslation';
import type { Language } from '../../hooks/useTranslation';

/**
 * Language selector component with 3 options: Georgian (ka), English (en), Russian (ru)
 * Displays as horizontal buttons with active state highlight
 */
export function LanguageSelector(): JSX.Element {
  const { lang, setLang } = useTranslation();

  const languages: Array<{ code: Language; label: string }> = [
    { code: 'ka', label: 'ქარ' },
    { code: 'en', label: 'ENG' },
    { code: 'ru', label: 'РУС' },
  ];

  return (
    <Group gap="xs">
      {languages.map((language) => {
        const isActive = lang === language.code;
        return (
          <UnstyledButton
            key={language.code}
            onClick={() => setLang(language.code)}
            style={{
              padding: '4px 12px',
              borderRadius: '4px',
              backgroundColor: isActive ? 'var(--emr-accent)' : 'transparent',
              color: isActive ? 'white' : 'inherit',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.2s ease',
            }}
          >
            <Text size="sm">{language.label}</Text>
          </UnstyledButton>
        );
      })}
    </Group>
  );
}