// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import kaTranslations from '../translations/ka.json';
import enTranslations from '../translations/en.json';
import ruTranslations from '../translations/ru.json';
// Additional translation files for Settings tabs
import unitsAdminRoutesKa from '../translations/units-admin-routes-ka.json';
import unitsAdminRoutesEn from '../translations/units-admin-routes-en.json';
import unitsAdminRoutesRu from '../translations/units-admin-routes-ru.json';

export type Language = 'ka' | 'en' | 'ru';

// JSON imports in Vite may come as objects with 'default' property
const getTranslations = (main: any, ...extras: any[]): Record<string, string> => {
  const base = main.default || main;
  const merged = { ...base };
  for (const extra of extras) {
    const extraData = extra.default || extra;
    Object.assign(merged, extraData);
  }
  return merged;
};

const translations: Record<Language, Record<string, string>> = {
  ka: getTranslations(kaTranslations, unitsAdminRoutesKa),
  en: getTranslations(enTranslations, unitsAdminRoutesEn),
  ru: getTranslations(ruTranslations, unitsAdminRoutesRu),
};

const STORAGE_KEY = 'emrLanguage';
const DEFAULT_LANGUAGE: Language = 'ka';

interface TranslationContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

export const TranslationContext = createContext<TranslationContextValue | null>(null);

interface TranslationProviderProps {
  children: ReactNode;
}

/**
 * Provider component that manages language state globally
 * Wrap your app with this to enable language switching across all components
 * @param root0
 * @param root0.children
 */
export function TranslationProvider({ children }: TranslationProviderProps) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ka' || stored === 'en' || stored === 'ru') {
      return stored;
    }
    return DEFAULT_LANGUAGE;
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  }, []);

  const t = useCallback(
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

      // Try current language first
      let value = getValue(translations[lang], key);

      // Fallback to English if not found
      if (!value) {
        value = getValue(translations.en, key);
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
    },
    [lang]
  );

  return <TranslationContext.Provider value={{ lang, setLang, t }}>{children}</TranslationContext.Provider>;
}

/**
 * Hook to access translation context
 * Must be used within a TranslationProvider
 */
export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
}
