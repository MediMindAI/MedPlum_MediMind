# Data Model: EMR UI Layout

**Branch**: `003-emr-ui-layout` | **Date**: 2025-11-12
**Status**: Complete

This document defines the data structures, types, and state management for the EMR UI Layout feature.

## Core Type Definitions

### 1. Language & Translation Types

```typescript
/**
 * Supported languages for the EMR interface
 * ka = Georgian (default)
 * en = English
 * ru = Russian
 */
export type SupportedLanguage = 'ka' | 'en' | 'ru';

/**
 * Translation key structure
 * Keys are dot-notation paths (e.g., 'menu.registration')
 */
export type TranslationKey =
  // Main menu items
  | 'menu.registration'
  | 'menu.patientHistory'
  | 'menu.nomenclature'
  | 'menu.administration'
  | 'menu.forward'
  | 'menu.reports'

  // Registration sub-menu items
  | 'submenu.registration.registration'
  | 'submenu.registration.receiver'
  | 'submenu.registration.contracts'
  | 'submenu.registration.inpatient'
  | 'submenu.registration.debts'
  | 'submenu.registration.advances'
  | 'submenu.registration.archive'
  | 'submenu.registration.referrals'
  | 'submenu.registration.currency'

  // Patient History sub-menu items
  | 'submenu.patientHistory.history'
  | 'submenu.patientHistory.myPatients'
  | 'submenu.patientHistory.surrogacy'
  | 'submenu.patientHistory.invoices'
  | 'submenu.patientHistory.form100'
  | 'submenu.patientHistory.prescriptions'
  | 'submenu.patientHistory.execution'
  | 'submenu.patientHistory.laboratory'
  | 'submenu.patientHistory.duty'
  | 'submenu.patientHistory.appointments'
  | 'submenu.patientHistory.hospital'
  | 'submenu.patientHistory.nutrition'
  | 'submenu.patientHistory.moh'

  // UI labels
  | 'ui.toggleSidebar'
  | 'ui.selectLanguage'
  | 'ui.underDevelopment'
  | 'ui.comingSoon'

  // Notifications
  | 'notification.languageChanged'
  | 'notification.languageChangeFailed'
  | 'notification.navigationFailed';

/**
 * Translation data structure
 * Record of language code -> translation key -> translated string
 */
export interface Translations {
  ka: Record<TranslationKey, string>;
  en: Record<TranslationKey, string>;
  ru: Record<TranslationKey, string>;
}
```

### 2. Menu Structure Types

```typescript
/**
 * Main menu item
 * Represents top-level navigation items (Registration, Patient History, etc.)
 */
export interface MainMenuItem {
  /** Unique identifier */
  id: string;

  /** Translation key for the label */
  labelKey: TranslationKey;

  /** Route path (e.g., '/emr/registration') */
  route: string;

  /** Display order (1-6 for the 6 main items) */
  order: number;

  /** Whether this menu item has sub-items */
  hasSubMenu: boolean;

  /** Icon component (optional, from @tabler/icons-react) */
  icon?: React.ComponentType<{ size?: number }>;
}

/**
 * Sub-menu item
 * Represents secondary navigation under a main menu item
 */
export interface SubMenuItem {
  /** Unique identifier */
  id: string;

  /** Parent main menu item ID */
  parentId: string;

  /** Translation key for the label */
  labelKey: TranslationKey;

  /** Route path (e.g., '/emr/registration/receiver') */
  route: string;

  /** Display order within parent menu */
  order: number;

  /** Whether this item is implemented (false = placeholder) */
  isImplemented: boolean;
}

/**
 * Complete menu structure
 * Contains all main items and sub-items
 */
export interface MenuStructure {
  mainItems: MainMenuItem[];
  subItems: Record<string, SubMenuItem[]>;  // Keyed by parentId
}
```

### 3. Navigation State Types

```typescript
/**
 * Current active navigation state
 */
export interface NavigationState {
  /** Currently selected main menu item ID */
  activeMainMenu: string;

  /** Currently selected sub-menu item ID (if any) */
  activeSubMenu?: string;

  /** Current route path */
  currentRoute: string;
}

/**
 * EMR Layout state
 * Manages overall layout preferences and state
 */
export interface EMRLayoutState {
  /** Whether the sub-menu sidebar is open */
  sidebarOpen: boolean;

  /** Currently selected language */
  language: SupportedLanguage;

  /** Navigation state */
  navigation: NavigationState;
}
```

## Data Structure Examples

### Translation Data Example

```typescript
export const translations: Translations = {
  ka: {
    // Main menu
    'menu.registration': 'რეგისტრაცია',
    'menu.patientHistory': 'პაციენტის ისტორია',
    'menu.nomenclature': 'ნომენკლატურა',
    'menu.administration': 'ადმინისტრირება',
    'menu.forward': 'გადამისამართება',
    'menu.reports': 'ანგარიშები',

    // Registration sub-menu
    'submenu.registration.registration': 'რეგისტრაცია',
    'submenu.registration.receiver': 'მიმღები',
    'submenu.registration.contracts': 'კონტრაქტები',
    'submenu.registration.inpatient': 'სტაციონარი',
    'submenu.registration.debts': 'დავალიანებები',
    'submenu.registration.advances': 'ავანსები',
    'submenu.registration.archive': 'არქივი',
    'submenu.registration.referrals': 'მიმართვები',
    'submenu.registration.currency': 'ვალუტა',

    // Patient History sub-menu
    'submenu.patientHistory.history': 'ისტორია',
    'submenu.patientHistory.myPatients': 'ჩემი პაციენტები',
    'submenu.patientHistory.surrogacy': 'სუროგაცია',
    'submenu.patientHistory.invoices': 'ინვოისები',
    'submenu.patientHistory.form100': '100 ფორმა',
    'submenu.patientHistory.prescriptions': 'რეცეპტები',
    'submenu.patientHistory.execution': 'შესრულება',
    'submenu.patientHistory.laboratory': 'ლაბორატორია',
    'submenu.patientHistory.duty': 'დიურნი',
    'submenu.patientHistory.appointments': 'ჩანიშვნები',
    'submenu.patientHistory.hospital': 'საავადმყოფო',
    'submenu.patientHistory.nutrition': 'კვება',
    'submenu.patientHistory.moh': 'ჯანდაცვის სამინისტრო',

    // UI labels
    'ui.toggleSidebar': 'გვერდითი პანელის ჩვენება/დამალვა',
    'ui.selectLanguage': 'ენის არჩევა',
    'ui.underDevelopment': 'განვითარების პროცესშია',
    'ui.comingSoon': 'მალე მოვა',

    // Notifications
    'notification.languageChanged': 'ენა წარმატებით შეიცვალა',
    'notification.languageChangeFailed': 'ენის შეცვლა ვერ მოხერხდა',
    'notification.navigationFailed': 'ნავიგაცია ვერ მოხერხდა',
  },

  en: {
    // Main menu
    'menu.registration': 'Registration',
    'menu.patientHistory': 'Patient History',
    'menu.nomenclature': 'Nomenclature',
    'menu.administration': 'Administration',
    'menu.forward': 'Forward',
    'menu.reports': 'Reports',

    // Registration sub-menu
    'submenu.registration.registration': 'Registration',
    'submenu.registration.receiver': 'Receiver',
    'submenu.registration.contracts': 'Contracts',
    'submenu.registration.inpatient': 'Inpatient',
    'submenu.registration.debts': 'Debts',
    'submenu.registration.advances': 'Advances',
    'submenu.registration.archive': 'Archive',
    'submenu.registration.referrals': 'Referrals',
    'submenu.registration.currency': 'Currency',

    // Patient History sub-menu
    'submenu.patientHistory.history': 'History',
    'submenu.patientHistory.myPatients': 'My Patients',
    'submenu.patientHistory.surrogacy': 'Surrogacy',
    'submenu.patientHistory.invoices': 'Invoices',
    'submenu.patientHistory.form100': 'Form 100',
    'submenu.patientHistory.prescriptions': 'Prescriptions',
    'submenu.patientHistory.execution': 'Execution',
    'submenu.patientHistory.laboratory': 'Laboratory',
    'submenu.patientHistory.duty': 'Duty',
    'submenu.patientHistory.appointments': 'Appointments',
    'submenu.patientHistory.hospital': 'Hospital',
    'submenu.patientHistory.nutrition': 'Nutrition',
    'submenu.patientHistory.moh': 'Ministry of Health',

    // UI labels
    'ui.toggleSidebar': 'Toggle Sidebar',
    'ui.selectLanguage': 'Select Language',
    'ui.underDevelopment': 'Under Development',
    'ui.comingSoon': 'Coming Soon',

    // Notifications
    'notification.languageChanged': 'Language changed successfully',
    'notification.languageChangeFailed': 'Failed to change language',
    'notification.navigationFailed': 'Navigation failed',
  },

  ru: {
    // Main menu
    'menu.registration': 'Регистрация',
    'menu.patientHistory': 'История пациента',
    'menu.nomenclature': 'Номенклатура',
    'menu.administration': 'Администрирование',
    'menu.forward': 'Переадресация',
    'menu.reports': 'Отчеты',

    // Registration sub-menu
    'submenu.registration.registration': 'Регистрация',
    'submenu.registration.receiver': 'Приемная',
    'submenu.registration.contracts': 'Контракты',
    'submenu.registration.inpatient': 'Стационар',
    'submenu.registration.debts': 'Долги',
    'submenu.registration.advances': 'Авансы',
    'submenu.registration.archive': 'Архив',
    'submenu.registration.referrals': 'Направления',
    'submenu.registration.currency': 'Валюта',

    // Patient History sub-menu
    'submenu.patientHistory.history': 'История',
    'submenu.patientHistory.myPatients': 'Мои пациенты',
    'submenu.patientHistory.surrogacy': 'Суррогатное материнство',
    'submenu.patientHistory.invoices': 'Счета',
    'submenu.patientHistory.form100': 'Форма 100',
    'submenu.patientHistory.prescriptions': 'Рецепты',
    'submenu.patientHistory.execution': 'Выполнение',
    'submenu.patientHistory.laboratory': 'Лаборатория',
    'submenu.patientHistory.duty': 'Дежурство',
    'submenu.patientHistory.appointments': 'Назначения',
    'submenu.patientHistory.hospital': 'Больница',
    'submenu.patientHistory.nutrition': 'Питание',
    'submenu.patientHistory.moh': 'Министерство здравоохранения',

    // UI labels
    'ui.toggleSidebar': 'Показать/скрыть боковую панель',
    'ui.selectLanguage': 'Выбрать язык',
    'ui.underDevelopment': 'В разработке',
    'ui.comingSoon': 'Скоро появится',

    // Notifications
    'notification.languageChanged': 'Язык успешно изменен',
    'notification.languageChangeFailed': 'Не удалось изменить язык',
    'notification.navigationFailed': 'Навигация не удалась',
  },
};
```

### Menu Structure Example

```typescript
export const menuStructure: MenuStructure = {
  mainItems: [
    {
      id: 'registration',
      labelKey: 'menu.registration',
      route: '/emr/registration',
      order: 1,
      hasSubMenu: true,
    },
    {
      id: 'patientHistory',
      labelKey: 'menu.patientHistory',
      route: '/emr/patient-history',
      order: 2,
      hasSubMenu: true,
    },
    {
      id: 'nomenclature',
      labelKey: 'menu.nomenclature',
      route: '/emr/nomenclature',
      order: 3,
      hasSubMenu: false,
    },
    {
      id: 'administration',
      labelKey: 'menu.administration',
      route: '/emr/administration',
      order: 4,
      hasSubMenu: false,
    },
    {
      id: 'forward',
      labelKey: 'menu.forward',
      route: '/emr/forward',
      order: 5,
      hasSubMenu: false,
    },
    {
      id: 'reports',
      labelKey: 'menu.reports',
      route: '/emr/reports',
      order: 6,
      hasSubMenu: false,
    },
  ],

  subItems: {
    registration: [
      {
        id: 'reg-registration',
        parentId: 'registration',
        labelKey: 'submenu.registration.registration',
        route: '/emr/registration/registration',
        order: 1,
        isImplemented: false,
      },
      {
        id: 'reg-receiver',
        parentId: 'registration',
        labelKey: 'submenu.registration.receiver',
        route: '/emr/registration/receiver',
        order: 2,
        isImplemented: false,
      },
      {
        id: 'reg-contracts',
        parentId: 'registration',
        labelKey: 'submenu.registration.contracts',
        route: '/emr/registration/contracts',
        order: 3,
        isImplemented: false,
      },
      {
        id: 'reg-inpatient',
        parentId: 'registration',
        labelKey: 'submenu.registration.inpatient',
        route: '/emr/registration/inpatient',
        order: 4,
        isImplemented: false,
      },
      {
        id: 'reg-debts',
        parentId: 'registration',
        labelKey: 'submenu.registration.debts',
        route: '/emr/registration/debts',
        order: 5,
        isImplemented: false,
      },
      {
        id: 'reg-advances',
        parentId: 'registration',
        labelKey: 'submenu.registration.advances',
        route: '/emr/registration/advances',
        order: 6,
        isImplemented: false,
      },
      {
        id: 'reg-archive',
        parentId: 'registration',
        labelKey: 'submenu.registration.archive',
        route: '/emr/registration/archive',
        order: 7,
        isImplemented: false,
      },
      {
        id: 'reg-referrals',
        parentId: 'registration',
        labelKey: 'submenu.registration.referrals',
        route: '/emr/registration/referrals',
        order: 8,
        isImplemented: false,
      },
      {
        id: 'reg-currency',
        parentId: 'registration',
        labelKey: 'submenu.registration.currency',
        route: '/emr/registration/currency',
        order: 9,
        isImplemented: false,
      },
    ],

    patientHistory: [
      {
        id: 'ph-history',
        parentId: 'patientHistory',
        labelKey: 'submenu.patientHistory.history',
        route: '/emr/patient-history/history',
        order: 1,
        isImplemented: false,
      },
      {
        id: 'ph-myPatients',
        parentId: 'patientHistory',
        labelKey: 'submenu.patientHistory.myPatients',
        route: '/emr/patient-history/my-patients',
        order: 2,
        isImplemented: false,
      },
      {
        id: 'ph-surrogacy',
        parentId: 'patientHistory',
        labelKey: 'submenu.patientHistory.surrogacy',
        route: '/emr/patient-history/surrogacy',
        order: 3,
        isImplemented: false,
      },
      {
        id: 'ph-invoices',
        parentId: 'patientHistory',
        labelKey: 'submenu.patientHistory.invoices',
        route: '/emr/patient-history/invoices',
        order: 4,
        isImplemented: false,
      },
      {
        id: 'ph-form100',
        parentId: 'patientHistory',
        labelKey: 'submenu.patientHistory.form100',
        route: '/emr/patient-history/form-100',
        order: 5,
        isImplemented: false,
      },
      {
        id: 'ph-prescriptions',
        parentId: 'patientHistory',
        labelKey: 'submenu.patientHistory.prescriptions',
        route: '/emr/patient-history/prescriptions',
        order: 6,
        isImplemented: false,
      },
      {
        id: 'ph-execution',
        parentId: 'patientHistory',
        labelKey: 'submenu.patientHistory.execution',
        route: '/emr/patient-history/execution',
        order: 7,
        isImplemented: false,
      },
      {
        id: 'ph-laboratory',
        parentId: 'patientHistory',
        labelKey: 'submenu.patientHistory.laboratory',
        route: '/emr/patient-history/laboratory',
        order: 8,
        isImplemented: false,
      },
      {
        id: 'ph-duty',
        parentId: 'patientHistory',
        labelKey: 'submenu.patientHistory.duty',
        route: '/emr/patient-history/duty',
        order: 9,
        isImplemented: false,
      },
      {
        id: 'ph-appointments',
        parentId: 'patientHistory',
        labelKey: 'submenu.patientHistory.appointments',
        route: '/emr/patient-history/appointments',
        order: 10,
        isImplemented: false,
      },
      {
        id: 'ph-hospital',
        parentId: 'patientHistory',
        labelKey: 'submenu.patientHistory.hospital',
        route: '/emr/patient-history/hospital',
        order: 11,
        isImplemented: false,
      },
      {
        id: 'ph-nutrition',
        parentId: 'patientHistory',
        labelKey: 'submenu.patientHistory.nutrition',
        route: '/emr/patient-history/nutrition',
        order: 12,
        isImplemented: false,
      },
      {
        id: 'ph-moh',
        parentId: 'patientHistory',
        labelKey: 'submenu.patientHistory.moh',
        route: '/emr/patient-history/moh',
        order: 13,
        isImplemented: false,
      },
    ],
  },
};
```

## State Management

### localStorage Schema

```typescript
/**
 * localStorage keys used by EMR feature
 */
export const EMR_STORAGE_KEYS = {
  /** Language preference: 'ka' | 'en' | 'ru' */
  LANGUAGE: 'emrLanguage',

  /** Sidebar open state: 'true' | 'false' */
  SIDEBAR_OPEN: 'emrSidebarOpen',

  /** Last active route (for restoration): string */
  LAST_ROUTE: 'emrLastRoute',
} as const;

/**
 * Type-safe localStorage access
 */
export interface EMRStorageValues {
  [EMR_STORAGE_KEYS.LANGUAGE]: SupportedLanguage;
  [EMR_STORAGE_KEYS.SIDEBAR_OPEN]: string;  // 'true' | 'false'
  [EMR_STORAGE_KEYS.LAST_ROUTE]: string;
}
```

### Default State Values

```typescript
/**
 * Default state when no localStorage values exist
 */
export const DEFAULT_EMR_STATE: EMRLayoutState = {
  sidebarOpen: true,  // Sidebar open by default
  language: 'ka',  // Georgian is default language
  navigation: {
    activeMainMenu: 'registration',  // Start with Registration
    activeSubMenu: 'reg-registration',
    currentRoute: '/emr/registration/registration',
  },
};
```

## Validation Rules

### Translation Completeness

```typescript
/**
 * Validates that all translation keys exist for all languages
 * Should be called during build/CI to catch missing translations
 */
export function validateTranslations(translations: Translations): string[] {
  const errors: string[] = [];
  const kaKeys = Object.keys(translations.ka) as TranslationKey[];

  for (const lang of ['en', 'ru'] as const) {
    for (const key of kaKeys) {
      if (!translations[lang][key]) {
        errors.push(`Missing translation: ${lang}.${key}`);
      }
    }
  }

  return errors;
}
```

### Menu Structure Validation

```typescript
/**
 * Validates menu structure integrity
 */
export function validateMenuStructure(menu: MenuStructure): string[] {
  const errors: string[] = [];

  // Check main items are ordered correctly
  const orderedMainItems = [...menu.mainItems].sort((a, b) => a.order - b.order);
  if (JSON.stringify(orderedMainItems) !== JSON.stringify(menu.mainItems)) {
    errors.push('Main menu items are not in order');
  }

  // Check sub-items have valid parent references
  for (const [parentId, subItems] of Object.entries(menu.subItems)) {
    const parentExists = menu.mainItems.some((item) => item.id === parentId);
    if (!parentExists) {
      errors.push(`Sub-items reference invalid parent: ${parentId}`);
    }

    // Check sub-items are ordered correctly
    const orderedSubItems = [...subItems].sort((a, b) => a.order - b.order);
    if (JSON.stringify(orderedSubItems) !== JSON.stringify(subItems)) {
      errors.push(`Sub-items for ${parentId} are not in order`);
    }
  }

  return errors;
}
```

## Type Guards

```typescript
/**
 * Type guard for SupportedLanguage
 */
export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return lang === 'ka' || lang === 'en' || lang === 'ru';
}

/**
 * Type guard for TranslationKey
 */
export function isTranslationKey(key: string): key is TranslationKey {
  return key in translations.ka;
}
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interaction                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─ Click main menu item
                              ├─ Click sub-menu item
                              └─ Change language
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Component (EMRMainMenu)                    │
│  - Renders menu items using translations                    │
│  - Handles click events                                      │
│  - Updates navigation state                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Custom Hook (useTranslation)                    │
│  - Provides t() function                                     │
│  - Provides current language                                 │
│  - Provides setLanguage() function                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─ Reads from ─────┐
                              │                   │
                              ▼                   ▼
┌──────────────────────────────────┐   ┌─────────────────────┐
│      Translation Data            │   │   localStorage       │
│  (translations.ka/en/ru)         │   │  - emrLanguage      │
│  - Static TypeScript data        │   │  - emrSidebarOpen   │
│  - Type-safe keys                │   │  - emrLastRoute     │
└──────────────────────────────────┘   └─────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Router                              │
│  - Navigates to new route                                    │
│  - Updates URL                                               │
│  - Renders appropriate view component                        │
└─────────────────────────────────────────────────────────────┘
```

## File Organization

```
packages/app/src/emr/
├── types/
│   ├── menu.ts                 # MainMenuItem, SubMenuItem, MenuStructure
│   ├── translation.ts          # SupportedLanguage, TranslationKey, Translations
│   ├── navigation.ts           # NavigationState, EMRLayoutState
│   └── index.ts                # Re-export all types
│
├── translations/
│   ├── translations.ts         # Translation data (translations constant)
│   ├── menu-structure.ts       # Menu structure data (menuStructure constant)
│   ├── validation.ts           # Validation functions
│   └── index.ts                # Re-export all translation data
│
└── hooks/
    ├── useTranslation.ts       # Translation hook
    ├── useEMRNavigation.ts     # Navigation state hook
    └── index.ts                # Re-export all hooks
```

## Testing Data

```typescript
/**
 * Mock data for testing
 */
export const mockMenuStructure: MenuStructure = {
  mainItems: [
    {
      id: 'test-main-1',
      labelKey: 'menu.registration',
      route: '/emr/registration',
      order: 1,
      hasSubMenu: true,
    },
  ],
  subItems: {
    'test-main-1': [
      {
        id: 'test-sub-1',
        parentId: 'test-main-1',
        labelKey: 'submenu.registration.registration',
        route: '/emr/registration/registration',
        order: 1,
        isImplemented: false,
      },
    ],
  },
};

export const mockTranslations: Translations = {
  ka: {
    'menu.registration': 'რეგისტრაცია',
    'submenu.registration.registration': 'რეგისტრაცია',
    // ... (minimal set for testing)
  },
  en: {
    'menu.registration': 'Registration',
    'submenu.registration.registration': 'Registration',
    // ...
  },
  ru: {
    'menu.registration': 'Регистрация',
    'submenu.registration.registration': 'Регистрация',
    // ...
  },
};
```

---

## Summary

This data model provides:
- ✅ Strong TypeScript types for all entities
- ✅ Type-safe translation keys
- ✅ Validation functions for integrity checks
- ✅ Clear localStorage schema
- ✅ Testable mock data
- ✅ Comprehensive documentation

All types follow Medplum's TypeScript strict mode conventions and are designed for compile-time type safety.
