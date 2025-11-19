# R6: Right-Side Menu Integration

## Decision

The TopNavBar implements a simple dropdown menu on the right side (currently showing user profile and logout) using Mantine's Menu component. To add "Account Management", the menu can be extended with additional items including permission checks for admin-only visibility. The TopNavBar uses the translation system for multilingual support and can integrate with the existing `useEMRPermissions` hook to conditionally display admin-only items.

## TopNavBar Location

**File**: `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/components/TopNavBar/TopNavBar.tsx`

**Current Structure**:
- Top gray navigation bar (40px height, `#e9ecef` background)
- Left side: Language selector
- Right side: User dropdown menu with profile name and logout option
- Uses Mantine UI components (Box, Menu, Text, UnstyledButton)
- Uses Tabler icons (IconUser, IconChevronDown)

**Current Implementation** (lines 42-71):
```tsx
{/* Right side - User menu */}
<Menu shadow="md" width={200}>
  <Menu.Target>
    <UnstyledButton
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      <IconUser size={18} />
      <Text size="sm">{userName}</Text>
      <IconChevronDown size={14} />
    </UnstyledButton>
  </Menu.Target>

  <Menu.Dropdown>
    <Menu.Item disabled>
      <Text size="sm" fw={600}>
        {userName}
      </Text>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item onClick={() => medplum.signOut()}>
      {t('topnav.logout')}
    </Menu.Item>
  </Menu.Dropdown>
</Menu>
```

## Menu Structure

**How Menu Items Are Defined**:

The TopNavBar currently has two levels of menu structure:

1. **Main Menu Items** (EMRMainMenu.tsx):
   - Defined as a static array of objects with `key`, `translationKey`, and `path`
   - Menu navigation triggered by pathname matching
   - Example:
   ```tsx
   const menuItems: MenuItem[] = [
     { key: 'registration', translationKey: 'menu.registration', path: '/emr/registration' },
     { key: 'patientHistory', translationKey: 'menu.patientHistory', path: '/emr/patient-history' },
     // ... more items
   ];
   ```

2. **User Dropdown Menu** (TopNavBar.tsx):
   - Currently hardcoded menu items in Mantine Menu.Dropdown
   - Uses `Menu.Item` components
   - Can be extended with additional items

**Adding Account Management**:

The right-side dropdown can be extended with new menu items:

```tsx
<Menu.Dropdown>
  <Menu.Item disabled>
    <Text size="sm" fw={600}>
      {userName}
    </Text>
  </Menu.Item>
  <Menu.Divider />

  {/* New: Account Management (admin-only) */}
  {isAdmin() && (
    <>
      <Menu.Item onClick={() => navigate('/emr/account')}>
        {t('topnav.accountManagement')}
      </Menu.Item>
      <Menu.Item onClick={() => navigate('/emr/settings')}>
        {t('topnav.settings')}
      </Menu.Item>
      <Menu.Divider />
    </>
  )}

  <Menu.Item onClick={() => medplum.signOut()}>
    {t('topnav.logout')}
  </Menu.Item>
</Menu.Dropdown>
```

## Admin Permission Check

**How to Conditionally Show Menu Item (Admin-Only)**:

The `useEMRPermissions` hook provides permission checking:

**File**: `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/hooks/useEMRPermissions.ts`

**Available Permissions**:
```typescript
export const EMRPermission = {
  VIEW_PATIENTS: 'view_patients',
  EDIT_PATIENTS: 'edit_patients',
  DELETE_PATIENTS: 'delete_patients',
  VIEW_VISITS: 'view_visits',
  EDIT_VISITS: 'edit_visits',
  DELETE_VISITS: 'delete_visits',
  VIEW_NOMENCLATURE: 'view_nomenclature',
  EDIT_NOMENCLATURE: 'edit_nomenclature',
  DELETE_NOMENCLATURE: 'delete_nomenclature',
  ADMIN: 'admin',
};
```

**Usage in TopNavBar**:
```typescript
import { useEMRPermissions } from '../../hooks/useEMRPermissions';

export function TopNavBar() {
  const medplum = useMedplum();
  const { t } = useTranslation();
  const { isAdmin } = useEMRPermissions();  // NEW
  const profile = medplum.getProfile();
  const userName = profile?.name?.[0]?.text || 'User';

  // In Menu.Dropdown:
  {isAdmin() && (
    <Menu.Item onClick={() => navigate('/account-management')}>
      {t('topnav.accountManagement')}
    </Menu.Item>
  )}
}
```

**Permission Logic** (from useEMRPermissions.ts):
- `isAdmin()`: Returns true if user is a Practitioner or Patient resource type
- `canDelete()`: Returns true only if isAdmin()
- `canEdit()`: Returns true for all authenticated users
- `canView()`: Returns true if user is authenticated (profile exists)
- `hasPermission(permission)`: Generic permission checker that maps permissions to functions

## Routing Integration

**How Menu Items Link to Routes**:

The system uses React Router v6 with the following pattern:

1. **Menu items use `onClick` handlers**:
   ```typescript
   const navigate = useNavigate();
   <Menu.Item onClick={() => navigate('/emr/account')}>
   ```

2. **Routes are defined in AppRoutes.tsx**:
   - Main EMR routes at `/emr`
   - Protected with `ProtectedRoute` component requiring permissions
   - Example registration route (lines 126-133):
   ```typescript
   <Route
     path="registration"
     element={
       <ProtectedRoute requiredPermission={EMRPermission.VIEW_PATIENTS}>
         <UnifiedRegistrationView />
       </ProtectedRoute>
     }
   />
   ```

3. **Route Pattern for Account Management**:
   ```typescript
   // In AppRoutes.tsx under /emr route:
   <Route
     path="account"
     element={
       <ProtectedRoute requireAdmin={true}>
         <AccountManagementView />
       </ProtectedRoute>
     }
   />
   ```

## Translation Keys

**Existing Translation Keys** (from en.json, ka.json, ru.json):

Currently defined TopNav translations:
```json
"topnav.main": "Main",
"topnav.hr": "HR",
"topnav.requisites": "Requisites",
"topnav.department": "Department",
"topnav.delivery": "Delivery",
"topnav.profile": "Profile",
"topnav.settings": "Settings",
"topnav.logout": "Logout"
```

**Translation Keys to Add**:

1. **Account Management Menu Item**:
   - `"topnav.accountManagement"`

2. **Sub-items** (if implementing full account management):
   - `"topnav.profile"`
   - `"topnav.accountSettings"`
   - `"topnav.securitySettings"`
   - `"topnav.changePassword"`
   - `"topnav.twoFactorAuth"`

**Where to Add Translations**:
- File: `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/translations/ka.json` (Georgian)
- File: `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/translations/en.json` (English)
- File: `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/translations/ru.json` (Russian)

**Example Addition** (English):
```json
"topnav.accountManagement": "Account Management",
"topnav.accountSettings": "Account Settings",
"topnav.securitySettings": "Security Settings",
"topnav.changePassword": "Change Password",
"topnav.twoFactorAuth": "Two-Factor Authentication"
```

**Example Addition** (Georgian):
```json
"topnav.accountManagement": "ანგარიშის მართვა",
"topnav.accountSettings": "ანგარიშის პარამეტრები",
"topnav.securitySettings": "უსაფრთხოების პარამეტრები",
"topnav.changePassword": "პაროლის შეცვლა",
"topnav.twoFactorAuth": "ორფაქტორული ავთენტიფიკაცია"
```

**Example Addition** (Russian):
```json
"topnav.accountManagement": "Управление аккаунтом",
"topnav.accountSettings": "Параметры аккаунта",
"topnav.securitySettings": "Параметры безопасности",
"topnav.changePassword": "Изменить пароль",
"topnav.twoFactorAuth": "Двухфакторная аутентификация"
```

## Implementation Steps

1. **Import Permission Hook in TopNavBar**:
   ```typescript
   import { useEMRPermissions } from '../../hooks/useEMRPermissions';
   ```

2. **Extract Admin Check in Component**:
   ```typescript
   const { isAdmin } = useEMRPermissions();
   ```

3. **Add Navigation Import**:
   ```typescript
   import { useNavigate } from 'react-router-dom';
   const navigate = useNavigate();
   ```

4. **Extend Menu.Dropdown with Conditional Items**:
   ```typescript
   {isAdmin() && (
     <>
       <Menu.Item onClick={() => navigate('/emr/account')}>
         {t('topnav.accountManagement')}
       </Menu.Item>
       <Menu.Divider />
     </>
   )}
   ```

5. **Add Translation Keys to All Three Language Files**:
   - Add to `ka.json` (Georgian)
   - Add to `en.json` (English)
   - Add to `ru.json` (Russian)

6. **Create AccountManagement Route in AppRoutes.tsx**:
   ```typescript
   <Route
     path="account"
     element={
       <ProtectedRoute requireAdmin={true}>
         <AccountManagementView />
       </ProtectedRoute>
     }
   />
   ```

7. **Create AccountManagementView Component** (or Link to Settings):
   - Create at: `/packages/app/src/emr/views/AccountManagementView.tsx`
   - Or link to existing settings page if available

8. **Test Permission Checking**:
   - Verify menu item shows only for admin users
   - Verify menu item hides for non-admin users
   - Test with different user roles

9. **Test Translations**:
   - Switch language and verify correct translations appear
   - Test all three languages (Georgian, English, Russian)

10. **Add Unit Tests**:
    - Test TopNavBar with admin user (menu item visible)
    - Test TopNavBar with non-admin user (menu item hidden)
    - Test menu item click navigates to account management

## Rationale

The TopNavBar already has a Mantine Menu dropdown implementation in place and the EMR system has established patterns for:
- Permission checking via the `useEMRPermissions` hook
- Translation management with three-language support
- Route protection via the `ProtectedRoute` component

Adding "Account Management" as an admin-only menu item follows these existing patterns seamlessly. The approach is minimal and maintains consistency with the current architecture. The conditional rendering based on `isAdmin()` ensures that non-admin users don't see this option, while the translation keys ensure multilingual support from day one.

Using React Router's `navigate` function in the Menu.Item `onClick` handler integrates naturally with the existing routing structure. The `ProtectedRoute` wrapper at the route level provides an additional security layer beyond UI-level hiding, ensuring that even if a user somehow accesses the URL directly, they'll be redirected to `/emr` if they lack admin permissions.

## References

**Files Examined**:
1. `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/components/TopNavBar/TopNavBar.tsx` - TopNavBar component
2. `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/components/TopNavBar/TopNavBar.module.css` - TopNavBar styles
3. `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/components/EMRMainMenu/EMRMainMenu.tsx` - Main menu pattern
4. `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/hooks/useEMRPermissions.ts` - Permission checking hook
5. `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/components/ProtectedRoute/ProtectedRoute.tsx` - Route protection component
6. `/Users/toko/Desktop/medplum_medimind/packages/app/src/AppRoutes.tsx` - Main application routing
7. `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/translations/en.json` - English translations
8. `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/translations/ka.json` - Georgian translations
9. `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/translations/ru.json` - Russian translations
10. `/Users/toko/Desktop/medplum_medimind/packages/app/src/emr/hooks/useTranslation.ts` - Translation hook (referenced but not read)
