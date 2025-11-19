// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useCallback, useContext } from 'react';
import { TranslationContext } from '../contexts/TranslationContext';
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
 * - Automatically updates all components when language changes (no page refresh needed)
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
 *
 * Note: Best used within a TranslationProvider (wrapped in EMRPage) for automatic updates
 */
export function useTranslation() {
  // Always call context hook first (follows rules of hooks)
  const contextValue = useContext(TranslationContext);

  // Always call local state hooks (follows rules of hooks - must be unconditional)
  const [localLang, setLocalLangState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ka' || stored === 'en' || stored === 'ru') {
      return stored;
    }
    return DEFAULT_LANGUAGE;
  });

  const setLocalLang = useCallback((newLang: Language) => {
    setLocalLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
    // Force page reload to update all components when not using context
    window.location.reload();
  }, []);

  const localT = useCallback(
    (key: string, params?: Record<string, any>): string => {
      // Support both flat keys ('menu.registration') and nested keys ('registeredServices.financial.title')
      const getValue = (obj: any, path: string): string | undefined => {
        // First try flat key (backward compatibility)
        if (obj && typeof obj === 'object' && path in obj && typeof obj[path] === 'string') {
          return obj[path];
        }

        // Then try nested key navigation
        const keys = path.split('.');
        let current = obj;
        for (const k of keys) {
          if (current && typeof current === 'object' && k in current) {
            current = current[k];
          } else {
            return undefined;
          }
        }
        return typeof current === 'string' ? current : undefined;
      };

      let value = getValue(translations[localLang], key);
      if (!value) {
        value = getValue(translations.en, key);
      }
      if (!value) {
        return key;
      }
      if (params) {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
          return params[paramKey]?.toString() || match;
        });
      }
      return value;
    },
    [localLang]
  );

  // If context is available (inside TranslationProvider), use it
  // Otherwise fall back to local state (backwards compatibility)
  if (contextValue) {
    return contextValue;
  }

  return { t: localT, lang: localLang, setLang: setLocalLang };
}