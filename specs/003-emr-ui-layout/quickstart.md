# EMR UI Layout - Developer Quickstart Guide

**Branch**: `003-emr-ui-layout` | **Last Updated**: 2025-11-12

This guide helps developers quickly understand, use, and extend the EMR UI Layout feature.

## Table of Contents

1. [Quick Overview](#quick-overview)
2. [Getting Started](#getting-started)
3. [Adding a New Menu Item](#adding-a-new-menu-item)
4. [Adding a New Language](#adding-a-new-language)
5. [Testing Menu Components](#testing-menu-components)
6. [Common Patterns](#common-patterns)
7. [Troubleshooting](#troubleshooting)

---

## Quick Overview

The EMR UI Layout provides:
- **6 main menu items** (horizontal navigation)
- **22 sub-menu items** (vertical sidebar: 9 for Registration, 13 for Patient History)
- **3 languages** (Georgian, English, Russian)
- **Persistent state** (language preference, sidebar open/closed)
- **Type-safe translations** (TypeScript enums for all keys)

**Key Files**:
```
packages/app/src/emr/
├── types/              # TypeScript interfaces
├── translations/       # Translation data
├── components/         # React components
├── hooks/              # Custom hooks
└── EMRPage.tsx         # Main entry point
```

---

## Getting Started

### 1. Navigate to the EMR Page

```typescript
// From any Medplum page
import { useMedplumNavigate } from '@medplum/react-hooks';

function MyComponent() {
  const navigate = useMedplumNavigate();

  // Navigate to EMR (will redirect to default route)
  navigate('/emr');

  // Navigate to specific sub-section
  navigate('/emr/registration/receiver');
  navigate('/emr/patient-history/history');
}
```

### 2. Use the Translation Hook

```typescript
import { useTranslation } from '../hooks/useTranslation';

function MyEMRComponent() {
  const { t, lang, setLang } = useTranslation();

  return (
    <div>
      <h1>{t('menu.registration')}</h1>
      <button onClick={() => setLang('en')}>
        Switch to English
      </button>
      <p>Current language: {lang}</p>
    </div>
  );
}
```

### 3. Access Navigation State

```typescript
import { useEMRNavigation } from '../hooks/useEMRNavigation';

function MyEMRComponent() {
  const { state, toggleSidebar, setActiveMenu } = useEMRNavigation();

  return (
    <div>
      <p>Sidebar open: {state.sidebarOpen ? 'Yes' : 'No'}</p>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      <p>Active menu: {state.navigation.activeMainMenu}</p>
    </div>
  );
}
```

---

## Adding a New Menu Item

### Step 1: Define Translation Keys

**File**: `packages/app/src/emr/types/translation.ts`

```typescript
export type TranslationKey =
  | 'menu.registration'
  | 'menu.patientHistory'
  // ... existing keys
  | 'menu.newSection'  // ← Add new main menu key
  | 'submenu.newSection.view1'  // ← Add sub-menu keys
  | 'submenu.newSection.view2';
```

### Step 2: Add Translations

**File**: `packages/app/src/emr/translations/translations.ts`

```typescript
export const translations: Translations = {
  ka: {
    // ... existing translations
    'menu.newSection': 'ახალი განყოფილება',
    'submenu.newSection.view1': 'ხედი 1',
    'submenu.newSection.view2': 'ხედი 2',
  },
  en: {
    // ... existing translations
    'menu.newSection': 'New Section',
    'submenu.newSection.view1': 'View 1',
    'submenu.newSection.view2': 'View 2',
  },
  ru: {
    // ... existing translations
    'menu.newSection': 'Новый раздел',
    'submenu.newSection.view1': 'Вид 1',
    'submenu.newSection.view2': 'Вид 2',
  },
};
```

### Step 3: Add to Menu Structure

**File**: `packages/app/src/emr/translations/menu-structure.ts`

```typescript
export const menuStructure: MenuStructure = {
  mainItems: [
    // ... existing items
    {
      id: 'newSection',
      labelKey: 'menu.newSection',
      route: '/emr/new-section',
      order: 7,  // Next order number
      hasSubMenu: true,
    },
  ],

  subItems: {
    // ... existing subItems
    newSection: [
      {
        id: 'ns-view1',
        parentId: 'newSection',
        labelKey: 'submenu.newSection.view1',
        route: '/emr/new-section/view1',
        order: 1,
        isImplemented: false,  // Set to true when implemented
      },
      {
        id: 'ns-view2',
        parentId: 'newSection',
        labelKey: 'submenu.newSection.view2',
        route: '/emr/new-section/view2',
        order: 2,
        isImplemented: false,
      },
    ],
  },
};
```

### Step 4: Add Routes

**File**: `packages/app/src/AppRoutes.tsx`

```typescript
<Route path="/emr" element={<EMRPage />}>
  {/* ... existing routes */}

  {/* New section routes */}
  <Route path="new-section" element={<NewSectionLayout />}>
    <Route path="view1" element={<View1Component />} />
    <Route path="view2" element={<View2Component />} />
  </Route>
</Route>
```

### Step 5: Create View Components (Optional)

**File**: `packages/app/src/emr/views/NewSectionLayout.tsx`

```typescript
import { Outlet } from 'react-router';

export function NewSectionLayout(): JSX.Element {
  return (
    <div>
      <h1>New Section</h1>
      <Outlet />  {/* Nested routes render here */}
    </div>
  );
}
```

**File**: `packages/app/src/emr/views/View1Component.tsx`

```typescript
import { useTranslation } from '../hooks/useTranslation';

export function View1Component(): JSX.Element {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t('submenu.newSection.view1')}</h2>
      <p>View 1 content goes here</p>
    </div>
  );
}
```

### Step 6: Write Tests

**File**: `packages/app/src/emr/views/View1Component.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { View1Component } from './View1Component';

describe('View1Component', () => {
  test('renders view title', () => {
    render(
      <MemoryRouter>
        <View1Component />
      </MemoryRouter>
    );

    expect(screen.getByText(/View 1/i)).toBeInTheDocument();
  });
});
```

---

## Adding a New Language

### Step 1: Update Supported Language Type

**File**: `packages/app/src/emr/types/translation.ts`

```typescript
export type SupportedLanguage = 'ka' | 'en' | 'ru' | 'es';  // ← Add 'es'
```

### Step 2: Add Translations

**File**: `packages/app/src/emr/translations/translations.ts`

```typescript
export const translations: Translations = {
  // ... existing ka, en, ru

  es: {  // ← New language
    // Main menu
    'menu.registration': 'Registro',
    'menu.patientHistory': 'Historial del Paciente',
    // ... translate ALL keys
  },
};
```

### Step 3: Update LanguageSelector Component

**File**: `packages/app/src/emr/components/LanguageSelector/LanguageSelector.tsx`

```typescript
const languages: { code: SupportedLanguage; label: string }[] = [
  { code: 'ka', label: 'ქართული' },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'es', label: 'Español' },  // ← Add new option
];
```

### Step 4: Validate Translations

Run validation to ensure all keys are translated:

```bash
# In packages/app
npm test -- validation.test.ts
```

The test will fail if any translation keys are missing for the new language.

---

## Testing Menu Components

### Unit Test Example

**File**: `packages/app/src/emr/hooks/useTranslation.test.ts`

```typescript
import { renderHook, act } from '@testing-library/react';
import { useTranslation } from './useTranslation';

describe('useTranslation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('defaults to Georgian', () => {
    const { result } = renderHook(() => useTranslation());
    expect(result.current.lang).toBe('ka');
  });

  test('changes language', () => {
    const { result } = renderHook(() => useTranslation());

    act(() => {
      result.current.setLang('en');
    });

    expect(result.current.lang).toBe('en');
    expect(localStorage['emrLanguage']).toBe('en');
  });

  test('translates key', () => {
    const { result } = renderHook(() => useTranslation());

    const georgian = result.current.t('menu.registration');
    expect(georgian).toBe('რეგისტრაცია');

    act(() => {
      result.current.setLang('en');
    });

    const english = result.current.t('menu.registration');
    expect(english).toBe('Registration');
  });
});
```

### Component Test Example

**File**: `packages/app/src/emr/components/EMRMainMenu/EMRMainMenu.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react';
import { EMRMainMenu } from './EMRMainMenu';

describe('EMRMainMenu', () => {
  const medplum = new MockClient();
  const navigate = jest.fn();

  function setup() {
    render(
      <MedplumProvider medplum={medplum} navigate={navigate}>
        <MemoryRouter>
          <EMRMainMenu />
        </MemoryRouter>
      </MedplumProvider>
    );
  }

  test('renders all main menu items', () => {
    setup();

    expect(screen.getByText('რეგისტრაცია')).toBeInTheDocument();
    expect(screen.getByText('პაციენტის ისტორია')).toBeInTheDocument();
    expect(screen.getByText('ნომენკლატურა')).toBeInTheDocument();
  });

  test('navigates on click', () => {
    setup();

    fireEvent.click(screen.getByText('რეგისტრაცია'));

    expect(navigate).toHaveBeenCalledWith('/emr/registration');
  });
});
```

### Integration Test Example

**File**: `packages/app/src/emr/EMRPage.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react';
import { EMRPage } from './EMRPage';

describe('EMRPage Integration', () => {
  test('full navigation flow', async () => {
    const medplum = new MockClient();

    render(
      <MedplumProvider medplum={medplum}>
        <MemoryRouter initialEntries={['/emr']}>
          <EMRPage />
        </MemoryRouter>
      </MedplumProvider>
    );

    // Click main menu item
    fireEvent.click(screen.getByText('პაციენტის ისტორია'));

    // Sub-menu should appear
    await waitFor(() => {
      expect(screen.getByText('ისტორია')).toBeInTheDocument();
    });

    // Click sub-menu item
    fireEvent.click(screen.getByText('ისტორია'));

    // Content area should update
    await waitFor(() => {
      expect(screen.getByText(/Under Development/i)).toBeInTheDocument();
    });
  });
});
```

---

## Common Patterns

### Pattern 1: Conditional Rendering Based on Implementation Status

```typescript
import { menuStructure } from '../translations/menu-structure';

function SubMenuList({ parentId }: { parentId: string }) {
  const subItems = menuStructure.subItems[parentId] || [];

  return (
    <ul>
      {subItems.map((item) => (
        <li key={item.id}>
          <a href={item.route}>
            {t(item.labelKey)}
            {!item.isImplemented && <Badge>Coming Soon</Badge>}
          </a>
        </li>
      ))}
    </ul>
  );
}
```

### Pattern 2: Language-Aware URL Navigation

```typescript
// Navigation maintains current language
function navigate ToView(route: string) {
  const { lang } = useTranslation();
  const navigate = useMedplumNavigate();

  navigate(route).catch((err) => {
    console.error('Navigation failed:', err);
    showNotification({
      color: 'red',
      message: t('notification.navigationFailed'),
    });
  });
}
```

### Pattern 3: Persistent Sidebar State

```typescript
import { useEMRNavigation } from '../hooks/useEMRNavigation';

function EMRSidebar() {
  const { state, toggleSidebar } = useEMRNavigation();

  return (
    <aside style={{ width: state.sidebarOpen ? '250px' : '0' }}>
      <button onClick={toggleSidebar}>
        {state.sidebarOpen ? 'Collapse' : 'Expand'}
      </button>
      {state.sidebarOpen && <SubMenuList />}
    </aside>
  );
}
```

### Pattern 4: Fallback for Missing Translations

```typescript
// In useTranslation hook
const t = (key: TranslationKey): string => {
  const translation = translations[lang]?.[key];

  if (!translation) {
    console.warn(`Missing translation: ${lang}.${key}`);
    return translations.ka[key] || key;  // Fallback to Georgian or key
  }

  return translation;
};
```

---

## Troubleshooting

### Issue: Georgian characters not rendering

**Symptom**: Georgian text appears as boxes or question marks

**Solution**:
1. Verify UTF-8 encoding in HTML:
   ```html
   <meta charset="UTF-8" />
   ```

2. Check Vite/Webpack config handles UTF-8:
   ```typescript
   // vite.config.ts
   export default defineConfig({
     // ... other config
     build: {
       charset: 'utf8',
     },
   });
   ```

3. Verify font supports Georgian Unicode range (U+10A0 to U+10FF)

---

### Issue: Language doesn't persist after refresh

**Symptom**: Language resets to Georgian on page reload

**Solution**:
1. Check localStorage is accessible:
   ```typescript
   console.log(localStorage['emrLanguage']);
   ```

2. Verify `useTranslation` hook initializes from localStorage:
   ```typescript
   const [lang, setLang] = useState<SupportedLanguage>(
     (localStorage['emrLanguage'] as SupportedLanguage) || 'ka'
   );
   ```

3. Check browser's localStorage quota (shouldn't be exceeded)

---

### Issue: Sidebar state conflicts with Medplum sidebar

**Symptom**: Both sidebars open/close together

**Solution**:
- EMR sidebar uses separate localStorage key: `emrSidebarOpen`
- Medplum sidebar uses: `navbarOpen`
- Ensure no code references the wrong key

---

### Issue: Route not found (404)

**Symptom**: Clicking menu item shows 404 or doesn't navigate

**Solution**:
1. Verify route is added to `AppRoutes.tsx`:
   ```typescript
   <Route path="/emr/new-section" element={<NewSectionLayout />} />
   ```

2. Check route path matches menu structure:
   ```typescript
   // menu-structure.ts
   route: '/emr/new-section'  // Must match AppRoutes path
   ```

3. Verify parent route has `<Outlet />` for nested routes

---

### Issue: Translation key not found

**Symptom**: Console warning: "Missing translation: en.menu.newItem"

**Solution**:
1. Add key to `TranslationKey` type
2. Add translations for ALL languages (ka, en, ru)
3. Run validation tests to catch missing keys

---

### Issue: Tests fail with "localStorage is not defined"

**Symptom**: Jest tests crash when accessing localStorage

**Solution**:
Add localStorage mock to test setup:

**File**: `packages/app/src/test.setup.ts`

```typescript
// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;
```

---

## Best Practices

1. **Always use translation keys** - Never hardcode UI text
2. **Test in all languages** - Verify layout doesn't break with longer text (Russian tends to be longer)
3. **Mark unimplemented views** - Set `isImplemented: false` for placeholder views
4. **Follow naming conventions**:
   - Routes: kebab-case (`/emr/my-patients`)
   - Translation keys: dot.notation (`submenu.patientHistory.myPatients`)
   - Component files: PascalCase (`MyComponent.tsx`)
5. **Colocate tests** - Keep `Component.test.tsx` next to `Component.tsx`
6. **Use type guards** - Validate language codes and translation keys
7. **Document menu structure changes** - Update menu-structure.md in documentation/

---

## Additional Resources

- **Feature Spec**: [spec.md](./spec.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Medplum Docs**: https://www.medplum.com/docs
- **React Router Docs**: https://reactrouter.com/

---

## Getting Help

- Check existing tests for examples
- Review Medplum's `packages/app/src/admin/` for similar patterns
- Consult [CLAUDE.md](../../../.claude/CLAUDE.md) for Medplum development guidelines
- Ask in project chat/Slack for clarification

---

**Last Updated**: 2025-11-12 | **Maintainer**: Medplum MediMind Team
