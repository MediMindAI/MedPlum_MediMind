# localStorage Contract

This document defines the localStorage keys and value formats used by the EMR UI Layout feature.

## Keys

### `emrLanguage`

**Type**: `string`
**Valid Values**: `'ka'`, `'en'`, `'ru'`
**Default**: `'ka'` (Georgian)
**Purpose**: Stores the user's selected language preference

**Example**:
```javascript
localStorage['emrLanguage'] = 'en';
```

**Behavior**:
- Read on app initialization to set default language
- Updated whenever user changes language via LanguageSelector
- Persists across browser sessions
- Used by `useTranslation` hook

---

### `emrSidebarOpen`

**Type**: `string`
**Valid Values**: `'true'`, `'false'`
**Default**: `'true'` (sidebar open by default)
**Purpose**: Stores whether the EMR sub-menu sidebar is open or collapsed

**Example**:
```javascript
localStorage['emrSidebarOpen'] = 'false';
```

**Behavior**:
- Read on EMRPage mount to set initial sidebar state
- Updated whenever user toggles sidebar via toggle button
- Persists across browser sessions and page refreshes
- Used by `useEMRNavigation` hook

**Note**: Value is stored as string (not boolean) to match Medplum's existing pattern for `localStorage['navbarOpen']`.

---

### `emrLastRoute`

**Type**: `string`
**Valid Values**: Any valid EMR route path (e.g., `/emr/registration/receiver`)
**Default**: `'/emr/registration/registration'`
**Purpose**: Stores the last visited EMR route for restoration on next visit

**Example**:
```javascript
localStorage['emrLastRoute'] = '/emr/patient-history/history';
```

**Behavior**:
- Updated whenever user navigates to a new EMR route
- Read on EMRPage mount to restore last view (optional feature)
- Persists across browser sessions
- Falls back to default route if stored route is invalid

---

## Storage Size Considerations

**Total Storage Used**: ~50-100 bytes

- `emrLanguage`: 2 bytes (e.g., 'en')
- `emrSidebarOpen`: 5 bytes (e.g., 'false')
- `emrLastRoute`: 30-40 bytes (e.g., '/emr/registration/contracts')

**Risk Assessment**: Minimal risk of localStorage quota issues (browsers typically allow 5-10MB).

---

## Migration Strategy

If localStorage schema changes in future versions:

1. **Adding New Keys**: No migration needed; new keys simply get created
2. **Removing Keys**: Clean up old keys in migration function
3. **Changing Value Format**: Implement version check and migration

**Example Migration Function**:
```typescript
function migrateEMRStorage(): void {
  // Example: Migrate from old boolean to string format
  const oldValue = localStorage['emrSidebarOpen'];
  if (oldValue === 'true' || oldValue === 'false') {
    // Already in correct format, no migration needed
    return;
  }
  // Convert old format (if any)
  localStorage['emrSidebarOpen'] = 'true';  // Default
}
```

---

## Privacy & Compliance

**PHI Concerns**: ❌ No PHI stored in localStorage
- Language preference: Not PHI
- Sidebar state: Not PHI
- Last route: May contain patient ID in URL, but route itself is not PHI

**HIPAA Compliance**: ✅ No additional compliance requirements for these keys

**Best Practices**:
- Do NOT store patient names, DOB, or identifiable information
- Do NOT store authentication tokens (Medplum handles this separately)
- Clear localStorage on logout (handled by Medplum's logout flow)

---

## Testing

**Unit Test Example**:
```typescript
describe('EMR localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('language preference persists', () => {
    const { setLang } = useTranslation();
    setLang('ru');
    expect(localStorage['emrLanguage']).toBe('ru');
  });

  test('sidebar state persists', () => {
    const { toggleSidebar } = useEMRNavigation();
    toggleSidebar();
    expect(localStorage['emrSidebarOpen']).toBe('false');
  });
});
```

---

## Contract Validation

To validate localStorage usage in code:

```typescript
export const EMR_STORAGE_KEYS = {
  LANGUAGE: 'emrLanguage',
  SIDEBAR_OPEN: 'emrSidebarOpen',
  LAST_ROUTE: 'emrLastRoute',
} as const;

// Type-safe access
function getLanguage(): SupportedLanguage {
  const stored = localStorage[EMR_STORAGE_KEYS.LANGUAGE];
  return isSupportedLanguage(stored) ? stored : 'ka';
}
```

This ensures all localStorage access uses documented keys and prevents typos.
