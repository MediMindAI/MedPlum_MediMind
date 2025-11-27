// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Paper, Text, Group, Box, Button, Radio, Badge } from '@mantine/core';
import { IconLanguage, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useTranslation, type Language } from '../../../../hooks/useTranslation';
import '../../../../styles/theme.css';

/**
 * LanguageSettingsTab - Manage application language settings
 *
 * Features:
 * - Display current language with flag icon
 * - Language selector for Georgian (ka), English (en), Russian (ru)
 * - Live preview of language change
 * - Uses existing useTranslation hook and localStorage 'emrLanguage'
 * - Shows completion percentage for each language (optional)
 */
export function LanguageSettingsTab(): JSX.Element {
  const { t, lang, setLang } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<Language>(lang);
  const [applying, setApplying] = useState(false);

  // Language metadata
  const languages = [
    {
      code: 'ka' as Language,
      name: 'ქართული',
      nameEn: 'Georgian',
      flag: '🇬🇪',
      completion: 100, // Placeholder - could be calculated from translation files
    },
    {
      code: 'en' as Language,
      name: 'English',
      nameEn: 'English',
      flag: '🇬🇧',
      completion: 100,
    },
    {
      code: 'ru' as Language,
      name: 'Русский',
      nameEn: 'Russian',
      flag: '🇷🇺',
      completion: 100,
    },
  ];

  // Get current language data
  const currentLanguage = languages.find((l) => l.code === lang);

  // Handle language change
  const handleApplyLanguage = () => {
    setApplying(true);

    // Show notification
    notifications.show({
      title: t('settings.language.changeSuccess'),
      message: `${languages.find((l) => l.code === selectedLang)?.name}`,
      color: 'green',
      icon: <IconCheck size={18} />,
      autoClose: 2000,
    });

    // Apply language change with small delay for UX
    setTimeout(() => {
      setLang(selectedLang);
      setApplying(false);
      // Page will reload automatically (handled by useTranslation hook)
    }, 500);
  };

  const hasChanges = selectedLang !== lang;

  return (
    <Stack gap="lg">
      {/* Current Language Section */}
      <Paper
        p="lg"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(26, 54, 93, 0.06)',
        }}
      >
        <Group gap="md" align="center" mb="lg">
          <Box
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--emr-gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconLanguage size={20} stroke={2} color="white" />
          </Box>
          <Text fw={600} size="sm" c="var(--emr-text-primary)" style={{ letterSpacing: '-0.2px' }}>
            {t('settings.language.current')}
          </Text>
        </Group>

        <Group gap="md" align="center">
          <Text
            style={{
              fontSize: '48px',
              lineHeight: 1,
            }}
          >
            {currentLanguage?.flag}
          </Text>
          <Box>
            <Text size="lg" fw={700} c="var(--emr-text-primary)">
              {currentLanguage?.name}
            </Text>
            <Text size="sm" c="var(--emr-text-secondary)">
              {currentLanguage?.nameEn}
            </Text>
          </Box>
          <Badge
            size="lg"
            variant="light"
            color="green"
            style={{ marginLeft: 'auto', fontWeight: 600 }}
          >
            <IconCheck size={14} style={{ marginRight: '4px' }} />
            {t('common.active')}
          </Badge>
        </Group>
      </Paper>

      {/* Language Selector Section */}
      <Paper
        p="lg"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 16px rgba(26, 54, 93, 0.06)',
        }}
      >
        <Text fw={600} size="sm" c="var(--emr-text-primary)" mb="md" style={{ letterSpacing: '-0.2px' }}>
          {t('settings.language.select')}
        </Text>

        <Radio.Group
          value={selectedLang}
          onChange={(value) => setSelectedLang(value as Language)}
        >
          <Stack gap="sm">
            {languages.map((language) => (
              <Paper
                key={language.code}
                p="md"
                style={{
                  background: selectedLang === language.code
                    ? 'rgba(99, 179, 237, 0.08)'
                    : 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '12px',
                  border: selectedLang === language.code
                    ? '2px solid var(--emr-accent)'
                    : '1px solid var(--emr-gray-200)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setSelectedLang(language.code)}
              >
                <Group gap="md" wrap="nowrap">
                  <Radio
                    value={language.code}
                    styles={{
                      radio: {
                        cursor: 'pointer',
                      },
                    }}
                  />
                  <Text
                    style={{
                      fontSize: '32px',
                      lineHeight: 1,
                    }}
                  >
                    {language.flag}
                  </Text>
                  <Box style={{ flex: 1 }}>
                    <Text size="md" fw={600} c="var(--emr-text-primary)">
                      {language.name}
                    </Text>
                    <Text size="xs" c="var(--emr-text-secondary)">
                      {language.nameEn}
                    </Text>
                  </Box>
                  {language.completion && (
                    <Badge
                      size="sm"
                      variant="light"
                      color={language.completion === 100 ? 'green' : 'yellow'}
                      style={{ fontWeight: 600 }}
                    >
                      {language.completion}%
                    </Badge>
                  )}
                  {lang === language.code && (
                    <Badge
                      size="sm"
                      variant="filled"
                      color="blue"
                      style={{ fontWeight: 600 }}
                    >
                      {t('common.active')}
                    </Badge>
                  )}
                </Group>
              </Paper>
            ))}
          </Stack>
        </Radio.Group>

        {/* Apply Changes Button */}
        {hasChanges && (
          <Group mt="lg" justify="flex-end">
            <Button
              variant="light"
              color="gray"
              onClick={() => setSelectedLang(lang)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="gradient"
              gradient={{ from: 'var(--emr-primary)', to: 'var(--emr-secondary)', deg: 135 }}
              loading={applying}
              onClick={handleApplyLanguage}
              leftSection={<IconCheck size={18} />}
            >
              {t('common.save')}
            </Button>
          </Group>
        )}
      </Paper>

      {/* Language Info Notice */}
      <Paper
        p="md"
        style={{
          background: 'rgba(99, 179, 237, 0.05)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: '12px',
          border: '1px solid rgba(99, 179, 237, 0.2)',
        }}
      >
        <Text size="xs" c="var(--emr-text-secondary)" ta="center" style={{ fontStyle: 'italic' }}>
          {t('settings.language.reloadNotice')}
        </Text>
      </Paper>
    </Stack>
  );
}
