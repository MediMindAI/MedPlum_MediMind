// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, UnstyledButton, Text } from '@mantine/core';
import { useTranslation } from '../../hooks/useTranslation';
import type { Language } from '../../hooks/useTranslation';

interface LanguageSelectorProps {
  compact?: boolean;
}

/**
 * LanguageSelector - Premium language switcher with refined pill design
 *
 * Features:
 * - 3 languages: Georgian (ka), English (en), Russian (ru)
 * - Elegant pill container with subtle border
 * - Smooth active state transitions
 */
export function LanguageSelector({ compact = false }: LanguageSelectorProps): JSX.Element {
  const { lang, setLang } = useTranslation();

  const languages: { code: Language; label: string }[] = [
    { code: 'ka', label: 'ქარ' },
    { code: 'en', label: 'ENG' },
    { code: 'ru', label: 'РУС' },
  ];

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '3px',
        borderRadius: '8px',
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {languages.map((language) => {
        const isActive = lang === language.code;
        return (
          <UnstyledButton
            key={language.code}
            onClick={() => setLang(language.code)}
            style={{
              padding: compact ? '3px 8px' : '4px 10px',
              borderRadius: '6px',
              backgroundColor: isActive ? 'rgba(99, 179, 237, 0.9)' : 'transparent',
              color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',
              fontWeight: isActive ? 600 : 500,
              fontSize: '11px',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              boxShadow: isActive ? '0 1px 4px rgba(0, 0, 0, 0.15)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
              }
            }}
          >
            <Text
              size="xs"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Georgian', 'Noto Sans', sans-serif",
              }}
            >
              {language.label}
            </Text>
          </UnstyledButton>
        );
      })}
    </Box>
  );
}