# EMR UI Layout Feature - Medplum Codebase Research Report

## Executive Summary
This report documents research findings on how to implement the EMR UI Layout feature in accordance with existing Medplum patterns and conventions.

---

## 1. TRANSLATION/i18n

### Current Status: NO EXISTING i18n IMPLEMENTATION
- **Finding**: Medplum does NOT have an established internationalization system
- **Evidence**: No references to i18next, react-intl, or any i18n library in packages/app
- **Current Approach**: All UI text is hardcoded in English directly in component code

### Code Examples:
```typescript
// packages/app/src/admin/ProjectPage.tsx - Hardcoded English
const tabs = ['Details', 'Users', 'Patients', 'Clients', 'Bots', 'Secrets', 'Sites'];
```

```typescript
// packages/react/src/AppShell/Navbar.tsx - Menu titles hardcoded
<Text className={classes.menuTitle}>{menu.title}</Text>
```

### Recommendation for EMR Feature:
- **Establish new pattern**: Since no i18n exists, we should hardcode English text for now
- **Future-proof approach**: Use descriptive constant names and group related labels
- **Pattern to follow**: Similar to how Medplum uses hardcoded arrays like `tabs` array
- **Example pattern**:
```typescript
const EMR_LAYOUT_LABELS = {
  sidebarToggle: 'Toggle Sidebar',
  patientList: 'Patients',
  timeline: 'Timeline',
  // ... more labels
} as const;
```

---

## 2. COMPONENT ORGANIZATION

### Directory Structure (packages/app/src):
```
packages/app/src/
├── admin/              # Feature folder for admin/project management
│   ├── ProjectPage.tsx
│   ├── ProjectDetailsPage.tsx
│   ├── PatientsPage.tsx
│   ├── BotsPage.tsx
│   ├── ClientsPage.tsx
│   ├── CreateBotPage.tsx
│   ├── CreateClientPage.tsx
│   ├── DatabaseToolsPage.tsx
│   ├── EditMembershipPage.tsx
│   ├── InvitePage.tsx
│   ├── SecretsPage.tsx
│   ├── SitesPage.tsx
│   ├── UsersPage.tsx
│   ├── db/             # Sub-folder for database-specific components
│   └── [test files]    # Colocated .test.tsx files
├── resource/           # Feature folder for resource-related pages
├── lab/                # Feature folder for lab-specific features
├── components/         # Shared components (non-feature-specific)
├── test-utils/         # Testing utilities
├── App.tsx             # Root component
├── AppRoutes.tsx       # Route definitions
├── HomePage.tsx        # Home/search page
├── HomePage.test.tsx   # Colocated test file
├── HomePage.module.css # Colocated style module
└── ... [other pages]
```

### Naming Conventions:
1. **Page components**: `PageNamePage.tsx` (e.g., `HomePage.tsx`, `ProjectPage.tsx`)
2. **Feature folders**: Plural noun indicating the feature (admin, resource, lab)
3. **Tests**: Colocated with source file as `ComponentName.test.tsx`
4. **Styles**: CSS modules colocated as `ComponentName.module.css`
5. **Utils**: Colocated utility exports (e.g., `HomePage.utils.ts`)

### React Component Library Pattern (packages/react/src):
```
packages/react/src/
├── AppShell/
│   ├── AppShell.tsx
│   ├── AppShell.module.css
│   ├── AppShell.test.tsx
│   ├── AppShell.stories.tsx      # Storybook stories
│   ├── Header.tsx
│   ├── Header.module.css
│   ├── Header.test.tsx
│   ├── Navbar.tsx
│   ├── Navbar.module.css
│   ├── Navbar.test.tsx
│   └── ...
├── BookmarkDialog/
├── [100+ component folders with same pattern]
└── index.ts                      # Main export file
```

### Recommendation for EMR Feature:
Create a feature folder: `packages/app/src/emr/`

```
packages/app/src/emr/
├── EMRPage.tsx                   # Main EMR layout page
├── EMRPage.test.tsx              # Tests
├── EMRPage.module.css            # Styles
├── EMRLayout.tsx                 # Layout sub-component
├── EMRLayout.module.css
├── EMRLayout.test.tsx
├── EMRSidebar.tsx                # Sidebar sub-component
├── EMRSidebar.module.css
├── EMRSidebar.test.tsx
├── useEMRLayout.ts               # Custom hook for layout state
└── EMR.utils.ts                  # Utility functions
```

---

## 3. SIDEBAR CONTROL

### Current Implementation (AppShell):
**File**: `packages/react/src/AppShell/AppShell.tsx`

```typescript
export interface AppShellProps {
  readonly logo: ReactNode;
  readonly pathname?: string;
  readonly searchParams?: URLSearchParams;
  readonly headerSearchDisabled?: boolean;
  readonly version?: string;
  readonly menus?: NavbarMenu[];
  readonly children: ReactNode;
  readonly displayAddBookmark?: boolean;
  readonly resourceTypeSearchDisabled?: boolean;
  readonly notifications?: ReactNode;
}

export function AppShell(props: AppShellProps): JSX.Element {
  const [navbarOpen, setNavbarOpen] = useState(localStorage['navbarOpen'] === 'true');
  const medplum = useMedplum();
  const profile = useMedplumProfile();

  useEffect(() => {
    function eventListener(): void {
      showNotification({ id: 'offline', color: 'red', message: 'No connection to server', autoClose: false });
    }
    medplum.addEventListener('offline', eventListener);
    return () => medplum.removeEventListener('offline', eventListener);
  }, [medplum]);

  function setNavbarOpenWrapper(open: boolean): void {
    localStorage['navbarOpen'] = open.toString();  // PERSISTS STATE TO localStorage
    setNavbarOpen(open);
  }

  function closeNavbar(): void {
    setNavbarOpenWrapper(false);
  }

  function toggleNavbar(): void {
    setNavbarOpenWrapper(!navbarOpen);
  }

  if (medplum.isLoading()) {
    return <Loading />;
  }

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: {
          desktop: !profile || !navbarOpen,
          mobile: !profile || !navbarOpen,
        },
      }}
      padding={0}
    >
      {profile && (
        <Header
          pathname={props.pathname}
          searchParams={props.searchParams}
          headerSearchDisabled={props.headerSearchDisabled}
          logo={props.logo}
          version={props.version}
          navbarToggle={toggleNavbar}
          notifications={props.notifications}
        />
      )}
      {profile && navbarOpen ? (
        <Navbar
          pathname={props.pathname}
          searchParams={props.searchParams}
          menus={props.menus}
          closeNavbar={closeNavbar}
          displayAddBookmark={props.displayAddBookmark}
          resourceTypeSearchDisabled={props.resourceTypeSearchDisabled}
        />
      ) : undefined}
      <MantineAppShell.Main className={classes.main}>
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>{props.children}</Suspense>
        </ErrorBoundary>
      </MantineAppShell.Main>
    </MantineAppShell>
  );
}
```

### Key Patterns:
1. **State Management**: Simple `useState` hook (no Redux/Zustand)
2. **Persistence**: Uses `localStorage['navbarOpen']` key-value storage
3. **Default State**: Reads from localStorage on initial load
4. **Update Function**: Wrapper function `setNavbarOpenWrapper` handles both state and localStorage
5. **Mantine Integration**: Uses `@mantine/core` AppShell component
6. **Responsive**: Collapses on mobile via `breakpoint: 'sm'`

### Navbar Component (packages/react/src/AppShell/Navbar.tsx):
```typescript
export interface NavbarLink {
  readonly icon?: JSX.Element;
  readonly label?: string;
  readonly href: string;
}

export interface NavbarMenu {
  readonly title?: string;
  readonly links?: NavbarLink[];
}

export interface NavbarProps {
  readonly pathname?: string;
  readonly searchParams?: URLSearchParams;
  readonly menus?: NavbarMenu[];
  readonly closeNavbar: () => void;
  readonly displayAddBookmark?: boolean;
  readonly resourceTypeSearchDisabled?: boolean;
}

export function Navbar(props: NavbarProps): JSX.Element {
  // Menu structure mapped from props
  {props.menus?.map((menu) => (
    <Fragment key={`menu-${menu.title}`}>
      <Text className={classes.menuTitle}>{menu.title}</Text>
      {menu.links?.map((link) => (
        <NavbarLink
          key={link.href}
          to={link.href}
          active={link.href === activeLink?.href}
          onClick={(e) => onLinkClick(e, link.href)}
        >
          <NavLinkIcon icon={link.icon} />
          <span>{link.label}</span>
        </NavbarLink>
      ))}
    </Fragment>
  ))}
}
```

### Recommendation for EMR Feature:
Pattern to follow for EMR Sidebar:
```typescript
// packages/app/src/emr/useEMRLayout.ts
export interface EMRLayoutState {
  sidebarOpen: boolean;
  activeTab: string;
  collapsedPanels: Record<string, boolean>;
}

export function useEMRLayout(): {
  state: EMRLayoutState;
  toggleSidebar: () => void;
  setActiveTab: (tab: string) => void;
  togglePanel: (panelId: string) => void;
} {
  const [state, setState] = useState<EMRLayoutState>(() => {
    const saved = localStorage['emrLayout'];
    return saved ? JSON.parse(saved) : {
      sidebarOpen: true,
      activeTab: 'timeline',
      collapsedPanels: {},
    };
  });

  const updateState = (newState: EMRLayoutState): void => {
    localStorage['emrLayout'] = JSON.stringify(newState);
    setState(newState);
  };

  return {
    state,
    toggleSidebar: () => updateState({ ...state, sidebarOpen: !state.sidebarOpen }),
    setActiveTab: (tab) => updateState({ ...state, activeTab: tab }),
    togglePanel: (panelId) => updateState({
      ...state,
      collapsedPanels: { ...state.collapsedPanels, [panelId]: !state.collapsedPanels[panelId] }
    }),
  };
}
```

---

## 4. ROUTING PATTERNS

### Routing Library
- **Library**: React Router v7.9.5
- **Setup**: Defined in `packages/app/src/index.tsx`

### Root Router Setup (packages/app/src/index.tsx):
```typescript
import { RouterProvider, createBrowserRouter } from 'react-router';

const router = createBrowserRouter([{ path: '*', element: <App /> }]);

const navigate = (path: string): Promise<void> => router.navigate(path);

root.render(
  <StrictMode>
    <MedplumProvider medplum={medplum} navigate={navigate}>
      <MantineProvider theme={theme}>
        <Notifications position="bottom-right" />
        <RouterProvider router={router} />
      </MantineProvider>
    </MedplumProvider>
  </StrictMode>
);
```

### Routes Definition (packages/app/src/AppRoutes.tsx):
```typescript
import { Route, Routes } from 'react-router';

export function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route errorElement={<ErrorPage />}>
        {/* Auth routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/oauth" element={<OAuthPage />} />
        <Route path="/resetpassword" element={<ResetPasswordPage />} />

        {/* Admin routes with nested structure */}
        <Route path="/admin" element={<ProjectPage />}>
          <Route path="patients" element={<PatientsPage />} />
          <Route path="bots/new" element={<CreateBotPage />} />
          <Route path="bots" element={<BotsPage />} />
          <Route path="clients/new" element={<CreateClientPage />} />
          <Route path="clients" element={<ClientsPage />} />
          {/* ... more nested routes */}
        </Route>

        {/* Feature-specific routes */}
        <Route path="/lab/assays" element={<AssaysPage />} />
        <Route path="/lab/panels" element={<PanelsPage />} />

        {/* Dynamic resource routes with nested sub-routes */}
        <Route path="/:resourceType/new" element={<CreateResourcePage />}>
          <Route index element={<FormCreatePage />} />
          <Route path="form" element={<FormCreatePage />} />
          <Route path="json" element={<JsonCreatePage />} />
          <Route path="profiles" element={<FormCreatePage />} />
        </Route>

        {/* Dynamic resource detail routes */}
        <Route path="/:resourceType/:id" element={<ResourcePage />}>
          <Route index element={<TimelinePage />} />
          <Route path="details" element={<DetailsPage />} />
          <Route path="edit" element={<EditPage />} />
          <Route path="history">
            <Route index element={<HistoryPage />} />
            <Route path=":versionId/:tab" element={<ResourceVersionPage />} />
            <Route path=":versionId" element={<ResourceVersionPage />} />
          </Route>
          {/* ... many more sub-routes */}
        </Route>

        {/* Fallback routes */}
        <Route path="/:resourceType" element={<HomePage />} />
        <Route path="/" element={<HomePage />} />
      </Route>
    </Routes>
  );
}
```

### Navigation Patterns:
```typescript
// Using React Router's useNavigate
import { useNavigate, useLocation, useSearchParams } from 'react-router';

export function HomePage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Navigate to new route
  navigate(`/${populatedSearch.resourceType}${formatSearchQuery(populatedSearch)}`)?.catch(console.error);
}

// Using MedplumProvider's navigate hook (same API)
import { useMedplumNavigate } from '@medplum/react-hooks';

export function Navbar(props: NavbarProps): JSX.Element {
  const navigate = useMedplumNavigate();
  
  function onLinkClick(e: SyntheticEvent, to: string): void {
    e.stopPropagation();
    e.preventDefault();
    navigate(to);  // Same API
    if (window.innerWidth < 768) {
      props.closeNavbar();
    }
  }
}
```

### Tab-Based Navigation (admin pattern):
```typescript
// packages/app/src/admin/ProjectPage.tsx
const tabs = ['Details', 'Users', 'Patients', 'Clients', 'Bots', 'Secrets', 'Sites'];

export function ProjectPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.pathname.replace('/admin/', '') || tabs[0];

  function onTabChange(newTabName: string | null): void {
    navigate(`/admin/${newTabName}`)?.catch(console.error);
  }

  return (
    <Tabs value={currentTab.toLowerCase()} onChange={onTabChange}>
      <Tabs.List>
        {tabs.map((t) => (
          <Tabs.Tab key={t} value={t.toLowerCase()}>
            {t}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
}
```

### Recommendation for EMR Feature:
```typescript
// packages/app/src/AppRoutes.tsx - Add EMR route
<Route path="/emr/:patientId" element={<EMRPage />}>
  <Route index element={<EMRTimelineView />} />
  <Route path="summary" element={<EMRSummaryView />} />
  <Route path="allergies" element={<EMRAllergiesView />} />
  <Route path="medications" element={<EMRMedicationsView />} />
  <Route path="documents" element={<EMRDocumentsView />} />
</Route>

// Or simpler flat route structure:
<Route path="/emr/:patientId" element={<EMRPage />} />
<Route path="/emr/:patientId/summary" element={<EMRPage view="summary" />} />
```

---

## 5. LOGGING/CONSOLE PATTERNS

### Current Approach: Minimal Logging
- **Finding**: No centralized logging library or utility used
- **Pattern**: Direct console.error in catch blocks or error callbacks

### Code Examples:
```typescript
// packages/app/src/HomePage.tsx
navigate(`/${populatedSearch.resourceType}${formatSearchQuery(populatedSearch)}`)?.catch(console.error);

// packages/app/src/admin/ProjectPage.tsx
onTabChange(newTabName: string | null): void {
  navigate(`/admin/${newTabName}`)?.catch(console.error);
}

// packages/app/src/resource/TimelinePage.tsx
setPriority(communication, 'stat').then(reloadTimeline).catch(console.error);

// packages/app/src/OAuthPage.tsx
fetchProjectInfo().catch(console.error);
```

### Debug Patterns Found:
```typescript
// packages/resource/ProfileTabs.tsx
// The SD is useful for the time being to populate the Snapshot and JSON debugging tabs;
.catch(console.error);
```

### Recommendation for EMR Feature:
```typescript
// Simple pattern - no special logging utility needed
export function EMRPage(): JSX.Element {
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    loadPatientData()
      .catch((err) => {
        console.error('Failed to load patient data:', err);
        setError(err);
      });
  }, []);

  // Or for notifications:
  const { showNotification } = useNotifications();
  
  handleAction().catch((err) => {
    showNotification({
      color: 'red',
      message: normalizeErrorString(err),
      autoClose: false
    });
  });
}
```

### Testing with console:
```typescript
// packages/app/src/resource/BotEditor.test.tsx
code: 'console.log("foo");',
(transfer?.[0] as MessagePort).postMessage({ result: 'console.log("foo");' });
```

---

## 6. ENVIRONMENT CONFIGURATION

### Environment Setup (packages/app/src/config.ts):
```typescript
export function getConfig(): {
  baseUrl: string;
  clientId: string;
} {
  return {
    baseUrl: import.meta.env.MEDPLUM_BASE_URL || 'http://localhost:8103',
    clientId: import.meta.env.MEDPLUM_CLIENT_ID || '[default-client-id]',
  };
}
```

### Vite Configuration (packages/app/vite.config.ts):
```typescript
export default defineConfig({
  envPrefix: ['MEDPLUM_', 'GOOGLE_', 'RECAPTCHA_'],
  plugins: [react()],
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  publicDir: 'static',
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@medplum/core': path.resolve(__dirname, '../core/src'),
      '@medplum/react': path.resolve(__dirname, '../react/src'),
      '@medplum/react-hooks': path.resolve(__dirname, '../react-hooks/src'),
    },
  },
});
```

### .env Files:
- `.env.defaults` - Default values (checked into git)
- `.env` - Local overrides (not checked in)
- Vite auto-loads .env files with specified prefixes

---

## 7. STATE MANAGEMENT

### Pattern: React Hooks (useState)
- **Approach**: No external state management (Redux, Zustand, Jotai)
- **Scope**: Local component state with useState
- **Persistence**: localStorage for user preferences

### Examples:
```typescript
// packages/react/src/AppShell/AppShell.tsx - Sidebar state
const [navbarOpen, setNavbarOpen] = useState(localStorage['navbarOpen'] === 'true');

// packages/app/src/HomePage.tsx - Search state
const [search, setSearch] = useState<SearchRequest>();

// packages/app/src/FormPage.tsx - Form state
const [loading, setLoading] = useState(true);
const [questionnaire, setQuestionnaire] = useState<Questionnaire | undefined>();
const [subjectList, setSubjectList] = useState<string[] | undefined>();
const [subject, setSubject] = useState<Resource | undefined>();
const [error, setError] = useState<OperationOutcome>();
const [result, setResult] = useState<QuestionnaireResponse[] | undefined>();
```

### Context/Provider Pattern:
```typescript
// packages/react-hooks/src/MedplumProvider/MedplumProvider.tsx
export function MedplumProvider(props: MedplumProviderProps): JSX.Element {
  // Provides MedplumClient, navigate function, profile to entire app
}

// Usage in App.tsx
<MedplumProvider medplum={medplum} navigate={navigate}>
  {/* App content */}
</MedplumProvider>

// Access via hooks
const medplum = useMedplum();
const navigate = useMedplumNavigate();
const profile = useMedplumProfile();
```

### Recommendation for EMR Layout State:
```typescript
// Custom hook for layout state (avoids prop drilling)
export function useEMRLayout(): {
  state: EMRLayoutState;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
} {
  const [state, setState] = useState<EMRLayoutState>(() => ({
    sidebarOpen: localStorage['emrSidebarOpen'] !== 'false',
    activePanel: localStorage['emrActivePanel'] || 'timeline',
  }));

  return {
    state,
    toggleSidebar: () => {
      const newOpen = !state.sidebarOpen;
      localStorage['emrSidebarOpen'] = String(newOpen);
      setState({ ...state, sidebarOpen: newOpen });
    },
    setSidebarCollapsed: (collapsed) => {
      localStorage['emrSidebarOpen'] = String(!collapsed);
      setState({ ...state, sidebarOpen: !collapsed });
    },
  };
}
```

---

## 8. TESTING PATTERNS

### Test Files:
- Colocated with source: `ComponentName.test.tsx` next to `ComponentName.tsx`
- Testing library: Jest + React Testing Library
- Setup file: `packages/app/src/test.setup.ts`

### Test Examples:
```typescript
// packages/app/src/HomePage.test.tsx
import { allOk } from '@medplum/core';
import type { Patient } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { Loading, MedplumProvider } from '@medplum/react';
import { randomUUID } from 'crypto';
import { Suspense } from 'react';
import { MemoryRouter } from 'react-router';
import { AppRoutes } from './AppRoutes';
import { act, fireEvent, render, screen, waitFor } from './test-utils/render';

async function setup(url = '/Patient', medplum = new MockClient()): Promise<void> {
  await act(async () => {
    render(
      <MedplumProvider medplum={medplum}>
        <MemoryRouter initialEntries={[url]} initialIndex={0}>
          <Suspense fallback={<Loading />}>
            <AppRoutes />
          </Suspense>
        </MemoryRouter>
      </MedplumProvider>
    );
  });
}

describe('HomePage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('renders', async () => {
    await setup();
    expect(screen.getByText('Patients')).toBeInTheDocument();
  });
});
```

### Component Testing Pattern:
```typescript
// packages/react/src/AppShell/AppShell.test.tsx
const medplum = new MockClient();
const navigateMock = jest.fn();

async function setup(): Promise<void> {
  await act(async () => {
    render(
      <MemoryRouter>
        <MedplumProvider medplum={medplum} navigate={navigateMock}>
          <AppShell
            logo={<Logo size={24} />}
            version="test.version"
            menus={[
              {
                title: 'Menu 1',
                links: [
                  { label: 'Link 1', href: '/link1' },
                  { label: 'Link 2', href: '/link2' },
                ],
              },
            ]}
          />
        </MedplumProvider>
      </MemoryRouter>
    );
  });
}

test('toggles navbar visibility', async () => {
  await setup();
  const button = screen.getByTitle('Toggle Sidebar');
  await act(async () => {
    fireEvent.click(button);
  });
  // Assert state changed
});
```

### Recommendation for EMR Tests:
```typescript
// packages/app/src/emr/EMRPage.test.tsx
describe('EMRPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('renders with sidebar open by default', async () => {
    const medplum = new MockClient();
    await act(async () => {
      render(
        <MedplumProvider medplum={medplum}>
          <MemoryRouter initialEntries={['/emr/patient-123']}>
            <EMRPage />
          </MemoryRouter>
        </MedplumProvider>
      );
    });
    expect(screen.getByTestId('emr-sidebar')).toBeVisible();
  });

  test('persists sidebar state to localStorage', async () => {
    // Setup and toggle sidebar
    const button = screen.getByTitle('Toggle Sidebar');
    fireEvent.click(button);
    
    // Verify localStorage was updated
    expect(localStorage['emrSidebarOpen']).toBe('false');
  });
});
```

---

## SUMMARY & RECOMMENDATIONS

### For EMR UI Layout Feature:

1. **No i18n needed**: Hardcode English labels using constants
2. **Component structure**: Create `packages/app/src/emr/` folder with:
   - `EMRPage.tsx` - Main page component
   - `EMRLayout.tsx` - Layout wrapper component
   - `EMRSidebar.tsx` - Sidebar component
   - `useEMRLayout.ts` - Custom hook for state management
   - Colocated `.test.tsx` and `.module.css` files

3. **Sidebar control**: 
   - Use simple `useState` + `localStorage` pattern
   - No external state management library needed
   - Key: `emrSidebarOpen` or `emrLayout` in localStorage

4. **Routing**: Add route to `AppRoutes.tsx`:
   ```typescript
   <Route path="/emr/:patientId" element={<EMRPage />} />
   ```

5. **Logging**: Use simple `.catch(console.error)` pattern
   - For user feedback: use `showNotification()` from `@mantine/notifications`

6. **Dependencies**: Already available:
   - `@mantine/core` - UI components (AppShell, Sidebar, etc.)
   - `react-router` v7.9.5 - Routing
   - `@medplum/react-hooks` - Custom hooks
   - `@tabler/icons-react` - Icons

7. **Testing pattern**: Follow existing colocated test convention
   - Use `MockClient` from `@medplum/mock`
   - Use `MemoryRouter` for route testing
   - Use `act()` wrapper for state updates

