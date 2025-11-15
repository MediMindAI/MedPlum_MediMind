// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useCallback } from 'react';
import kaTranslations from '../translations/ka.json';
import enTranslations from '../translations/en.json';
import ruTranslations from '../translations/ru.json';

export type Language = 'ka' | 'en' | 'ru';

// JSON imports in Vite may come as objects with 'default' property
const translations: Record<Language, Record<string, string>> = {
  ka: (kaTranslations as any).default || kaTranslations,
  en: (enTranslations as any).default || enTranslations,
  ru: (ruTranslations as any).default || ruTranslations,
};

const STORAGE_KEY = 'emrLanguage';
const DEFAULT_LANGUAGE: Language = 'ka';

/**
 * Hook for managing EMR translations and language switching
 *
 * Features:
 * - Get translated strings by key with dot notation (e.g., 'menu.registration')
 * - Switch between Georgian (ka), English (en), and Russian (ru)
 * - Persist language preference to localStorage
 * - Fallback to English if translation key not found
 *
 * Usage:
 * ```typescript
 * const { t, lang, setLang } = useTranslation();
 *
 * return (
 *   <div>
 *     <h1>{t('menu.registration')}</h1>
 *     <button onClick={() => setLang('en')}>English</button>
 *   </div>
 * );
 * ```
 */
export function useTranslation() {
  // Initialize language from localStorage or default
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ka' || stored === 'en' || stored === 'ru') {
      return stored;
    }
    return DEFAULT_LANGUAGE;
  });

  /**
   * Update language and persist to localStorage
   */
  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  }, []);

  /**
   * Get translation by key
   * Falls back to English if key not found, then to key itself
   */
  const t = useCallback((key: string, params?: Record<string, any>): string => {
    // Try current language first
    let value = translations[lang]?.[key];

    // Fallback to English if not found
    if (!value) {
      value = translations.en?.[key];
    }

    // Return key itself if still not found
    if (!value) {
      return key;
    }

    // Replace parameters like {count}, {name}, etc.
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  }, [lang]);

  return {
    t,
    lang,
    setLang,
  };
}