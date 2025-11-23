# Frontend Design Specification: Role Management System Redesign

## Overview

This document provides comprehensive design specifications for redesigning the Role Management dashboard and Role Creation modal in the MediMind EMR system. The goal is to transform a basic functional interface into a modern, intuitive, and delightful user experience.

**Design Goals:**
1. Create an impressive, engaging empty state that guides users
2. Provide role templates for quick onboarding
3. Build a visually compelling permission selection experience
4. Implement world-class UX with micro-interactions
5. Ensure full mobile responsiveness and accessibility

---

## Theme Integration

All components MUST use EMR theme CSS custom properties. Reference: `packages/app/src/emr/styles/theme.css`

### Primary Colors
```css
/* Primary Blues */
var(--emr-primary)           /* #1a365d - Deep navy */
var(--emr-secondary)         /* #2b6cb0 - Vibrant blue */
var(--emr-accent)            /* #63b3ed - Light blue */
var(--emr-light-accent)      /* #bee3f8 - Very light blue */

/* Gradients */
var(--emr-gradient-primary)  /* Deep to vibrant blue */
var(--emr-gradient-secondary) /* Lighter blue gradient */
var(--emr-gradient-submenu)  /* Horizontal blue gradient */

/* Status Colors */
var(--emr-stat-success)      /* #10b981 - Green */
var(--emr-stat-warning)      /* #f59e0b - Orange */
var(--emr-stat-danger)       /* #ef4444 - Red */
var(--emr-stat-neutral)      /* #6b7280 - Gray */
```

### Spacing System
```css
var(--emr-spacing-xs)   /* 4px */
var(--emr-spacing-sm)   /* 8px */
var(--emr-spacing-md)   /* 12px */
var(--emr-spacing-lg)   /* 16px */
var(--emr-spacing-xl)   /* 20px */
var(--emr-spacing-2xl)  /* 24px */
```

---

## Part 1: Role Dashboard Redesign

### 1.1 Component Architecture

```
packages/app/src/emr/
├── views/role-management/
│   └── RoleManagementView.tsx          # Main dashboard (REDESIGN)
├── components/role-management/
│   ├── RoleDashboardStats.tsx          # NEW: 4 stat cards for roles
│   ├── RoleEmptyState.tsx              # NEW: Beautiful empty state
│   ├── RoleTemplateCards.tsx           # NEW: Quick-start templates
│   ├── RoleTable.tsx                   # ENHANCE: Better styling
│   ├── RoleTableRow.tsx                # NEW: Individual row component
│   ├── RoleFilters.tsx                 # ENHANCE: Better layout
│   ├── RoleStatusBadge.tsx             # Keep existing
│   ├── RoleCreateModal.tsx             # MAJOR REDESIGN
│   ├── RoleForm.tsx                    # MAJOR REDESIGN
│   ├── PermissionTree.tsx              # MAJOR REDESIGN
│   ├── PermissionCategoryCard.tsx      # NEW: Visual category cards
│   ├── PermissionPreviewPanel.tsx      # NEW: Live preview
│   ├── RolePreviewCard.tsx             # NEW: Live role preview
│   └── RoleTemplateSelector.tsx        # NEW: Template picker
└── types/
    └── role-management.ts              # EXTEND: New interfaces
```

### 1.2 RoleDashboardStats Component

**Purpose:** Display 4 KPI cards showing role statistics (mirrors AccountManagement pattern)

```typescript
// packages/app/src/emr/components/role-management/RoleDashboardStats.tsx

interface RoleDashboardStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    usersWithRoles: number;
  };
  loading?: boolean;
}
```

**Visual Design:**

```
+------------------+------------------+------------------+------------------+
|  [Shield Icon]   |  [Check Icon]    |  [Ban Icon]      |  [Users Icon]    |
|       12         |       10         |        2         |       156        |
|   TOTAL ROLES    |   ACTIVE ROLES   |  INACTIVE ROLES  |  USERS ASSIGNED  |
|                  |     83% [up]     |     17% [down]   |                  |
+------------------+------------------+------------------+------------------+
```

**Styling:**
- Card background: `var(--emr-text-inverse)` (white)
- Border: `1px solid var(--emr-gray-200)`
- Border-radius: `var(--emr-border-radius-lg)` (8px)
- Top accent bar: 3px with gradient per card type
- Icon container: Gradient background matching card type
- Hover: `transform: translateY(-2px)`, `box-shadow: var(--emr-shadow-md)`
- Animation: Staggered fade-in (0.05s delay per card)

**Gradient assignments:**
- Total: `var(--emr-stat-gradient-total)`
- Active: `var(--emr-stat-gradient-active)`
- Inactive: `var(--emr-stat-gradient-inactive)`
- Users: `var(--emr-stat-gradient-pending)`

---

### 1.3 RoleEmptyState Component

**Purpose:** Display an engaging empty state with illustration, guidance, and quick actions

```typescript
// packages/app/src/emr/components/role-management/RoleEmptyState.tsx

interface RoleEmptyStateProps {
  onCreateRole: () => void;
  onSelectTemplate: (templateId: string) => void;
}
```

**Visual Design:**

```
+------------------------------------------------------------------------+
|                                                                        |
|                     [Animated Shield + Users SVG]                      |
|                          (120x120px, animated)                         |
|                                                                        |
|                    "No Roles Configured Yet"                           |
|                    (24px, fw-700, gray-800)                            |
|                                                                        |
|        "Roles define what users can see and do in the system.          |
|         Create custom roles or start with a template below."           |
|                    (14px, gray-500, max-w 480px)                        |
|                                                                        |
|    +-------------------+                +-------------------+          |
|    |  [+ icon]         |                |  [template icon]  |          |
|    |  Create Custom    |                |  Use Template     |          |
|    |  Role             |                |                   |          |
|    +-------------------+                +-------------------+          |
|         (Primary)                          (Secondary)                  |
|                                                                        |
|    +-----------------------------------------------------------------+ |
|    |                    QUICK START TEMPLATES                        | |
|    |  +------------+  +------------+  +------------+  +------------+ | |
|    |  | Admin      |  | Physician  |  | Nurse      |  | Reception  | | |
|    |  | [icon]     |  | [icon]     |  | [icon]     |  | [icon]     | | |
|    |  | Full       |  | Clinical   |  | Patient    |  | Billing    | | |
|    |  | access     |  | access     |  | care       |  | only       | | |
|    |  +------------+  +------------+  +------------+  +------------+ | |
|    +-----------------------------------------------------------------+ |
|                                                                        |
+------------------------------------------------------------------------+
```

**Animation:**
- Shield icon: Subtle floating animation (transform: translateY)
- Cards: Fade-in with stagger on mount
- Buttons: Scale on hover (1.02)

**CSS Implementation:**
```css
.role-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--emr-spacing-2xl) var(--emr-spacing-lg);
  min-height: 500px;
  text-align: center;
}

.role-empty-illustration {
  width: 120px;
  height: 120px;
  margin-bottom: var(--emr-spacing-2xl);
  animation: floatAnimation 3s ease-in-out infinite;
}

@keyframes floatAnimation {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.role-empty-title {
  font-size: var(--emr-font-3xl);
  font-weight: var(--emr-font-bold);
  color: var(--emr-gray-800);
  margin-bottom: var(--emr-spacing-md);
}

.role-empty-description {
  font-size: var(--emr-font-md);
  color: var(--emr-gray-500);
  max-width: 480px;
  line-height: var(--emr-line-height-relaxed);
  margin-bottom: var(--emr-spacing-2xl);
}
```

---

### 1.4 RoleTemplateCards Component

**Purpose:** Display pre-configured role templates for quick creation

```typescript
// packages/app/src/emr/components/role-management/RoleTemplateCards.tsx

interface RoleTemplate {
  id: string;
  name: string;
  nameKa: string;
  nameRu: string;
  description: string;
  icon: TablerIcon;
  color: string;
  permissionCount: number;
  permissions: string[];
  recommended?: boolean;
}

interface RoleTemplateCardsProps {
  onSelect: (template: RoleTemplate) => void;
  showTitle?: boolean;
}

// Pre-defined templates
const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'admin',
    name: 'Administrator',
    nameKa: 'ადმინისტრატორი',
    nameRu: 'Администратор',
    description: 'Full system access with all permissions',
    icon: IconShieldCheck,
    color: '#1a365d',
    permissionCount: 30,
    permissions: ['*'], // All permissions
    recommended: false,
  },
  {
    id: 'physician',
    name: 'Physician',
    nameKa: 'ექიმი',
    nameRu: 'Врач',
    description: 'Clinical access for patient care',
    icon: IconStethoscope,
    color: '#2b6cb0',
    permissionCount: 18,
    permissions: [
      'view-patient-demographics',
      'edit-patient-demographics',
      'view-encounters',
      'create-encounters',
      'edit-encounters',
      // ... more clinical permissions
    ],
    recommended: true,
  },
  {
    id: 'nurse',
    name: 'Nurse',
    nameKa: 'ექთანი',
    nameRu: 'Медсестра',
    description: 'Patient care and documentation',
    icon: IconHeartbeat,
    color: '#10b981',
    permissionCount: 14,
    permissions: [
      'view-patient-demographics',
      'view-encounters',
      'create-clinical-notes',
      // ...
    ],
  },
  {
    id: 'receptionist',
    name: 'Receptionist',
    nameKa: 'რეგისტრატორი',
    nameRu: 'Регистратор',
    description: 'Patient registration and scheduling',
    icon: IconCalendar,
    color: '#f59e0b',
    permissionCount: 8,
    permissions: [
      'view-patient-demographics',
      'create-patient',
      'view-appointments',
      'create-appointments',
      // ...
    ],
  },
  {
    id: 'lab-tech',
    name: 'Lab Technician',
    nameKa: 'ლაბორანტი',
    nameRu: 'Лаборант',
    description: 'Laboratory orders and results',
    icon: IconFlask,
    color: '#8b5cf6',
    permissionCount: 10,
    permissions: [
      'view-lab-orders',
      'create-lab-results',
      // ...
    ],
  },
];
```

**Visual Design (Single Card):**

```
+---------------------------+
|  [Recommended Badge]      |  <- Only for recommended
|                           |
|      [Icon in Circle]     |  <- 48x48, colored bg
|                           |
|       "Physician"         |  <- 16px, fw-600
|                           |
|   "Clinical access for    |  <- 12px, gray-500
|    patient care"          |
|                           |
|   18 permissions          |  <- Badge, small
|                           |
|   [Use Template Button]   |  <- Subtle, full width
+---------------------------+
```

**Card CSS:**
```css
.role-template-card {
  background: var(--emr-text-inverse);
  border: 1px solid var(--emr-gray-200);
  border-radius: var(--emr-border-radius-lg);
  padding: var(--emr-spacing-xl);
  text-align: center;
  transition: all var(--emr-transition-smooth);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.role-template-card:hover {
  border-color: var(--emr-accent);
  box-shadow: var(--emr-shadow-md);
  transform: translateY(-2px);
}

.role-template-card.recommended {
  border-color: var(--emr-secondary);
  border-width: 2px;
}

.role-template-card.recommended::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--emr-gradient-primary);
}

.role-template-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--emr-spacing-md);
}
```

---

### 1.5 Enhanced RoleFilters Component

**Current State:** Basic search input and dropdown
**Redesigned State:** Visually polished with better layout

```typescript
// packages/app/src/emr/components/role-management/RoleFilters.tsx

interface RoleFiltersProps {
  searchQuery: string;
  statusFilter: 'all' | 'active' | 'inactive';
  onSearchChange: (query: string) => void;
  onStatusChange: (status: 'all' | 'active' | 'inactive') => void;
  resultCount: number;
  totalCount: number;
}
```

**Visual Design:**

```
+------------------------------------------------------------------------+
|  +--------------------------------------------+   +------------------+ |
|  | [Search Icon]  Search roles...             |   | All Roles    [v] | |
|  +--------------------------------------------+   +------------------+ |
|                                                                        |
|  Showing 10 of 12 roles                                                |
+------------------------------------------------------------------------+
```

**Enhanced Styling:**
```css
.role-filters-container {
  background: var(--emr-text-inverse);
  border: 1px solid var(--emr-gray-200);
  border-radius: var(--emr-border-radius-lg);
  padding: var(--emr-spacing-lg);
  box-shadow: var(--emr-shadow-sm);
}

.role-filters-row {
  display: flex;
  gap: var(--emr-spacing-md);
  flex-wrap: wrap;
}

.role-search-input {
  flex: 1;
  min-width: 250px;
}

.role-status-select {
  width: 180px;
}

.role-result-count {
  color: var(--emr-gray-500);
  font-size: var(--emr-font-sm);
  margin-top: var(--emr-spacing-sm);
}
```

---

### 1.6 Enhanced RoleTable Component

**Enhancements:**
1. Better visual hierarchy with cleaner styling
2. Hover states with row highlighting
3. Action icons with tooltips
4. Empty state integration
5. Loading skeleton

**Visual Design:**

```
+------------------------------------------------------------------------+
| Name          | Description      | Users | Perms | Status | Actions    |
+------------------------------------------------------------------------+
| Physician     | Clinical access  |   45  |  18   | Active | [icons]    |
| eka           | for patient...   |       |       | [pill] |            |
+------------------------------------------------------------------------+
| Nurse         | Patient care     |   32  |  14   | Active | [icons]    |
| nurse         | and documen...   |       |       | [pill] |            |
+------------------------------------------------------------------------+
```

**Table Styling:**
```css
.role-table {
  border-radius: var(--emr-border-radius-lg);
  overflow: hidden;
  border: 1px solid var(--emr-gray-200);
}

.role-table thead {
  background: var(--emr-table-header-bg);
}

.role-table th {
  font-weight: var(--emr-font-semibold);
  color: var(--emr-table-header-text);
  padding: var(--emr-table-cell-padding);
  font-size: var(--emr-font-sm);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-bottom: 2px solid var(--emr-table-border);
}

.role-table-row {
  transition: background-color var(--emr-transition-fast);
}

.role-table-row:hover {
  background-color: var(--emr-table-row-hover);
}

.role-table td {
  padding: var(--emr-table-cell-padding);
  vertical-align: middle;
}

.role-name-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.role-name {
  font-weight: var(--emr-font-medium);
  color: var(--emr-text-primary);
}

.role-code {
  font-size: var(--emr-font-xs);
  color: var(--emr-gray-500);
  font-family: monospace;
}
```

---

## Part 2: Role Creation Modal Redesign

### 2.1 Multi-Step Wizard Architecture

**Decision:** Use a stepped wizard approach for better UX on complex forms

```typescript
// packages/app/src/emr/components/role-management/RoleCreateModal.tsx

type WizardStep = 'basics' | 'template' | 'permissions' | 'review';

interface RoleCreateModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialTemplate?: RoleTemplate;
}

interface WizardState {
  currentStep: WizardStep;
  formValues: RoleFormValues;
  selectedTemplate: RoleTemplate | null;
  canProceed: boolean;
}
```

**Visual Design (Full Modal):**

```
+------------------------------------------------------------------------+
|                         Create New Role                            [X] |
+------------------------------------------------------------------------+
|                                                                        |
|  +------------------+  +------------------+  +------------------+       |
|  | 1. Basics        |  | 2. Permissions   |  | 3. Review        |       |
|  | [check/active]   |->| [active/pending] |->| [pending]        |       |
|  +------------------+  +------------------+  +------------------+       |
|                                                                        |
+------------------------------------------------------------------------+
|                                                                        |
|                         [STEP CONTENT AREA]                            |
|                                                                        |
|                         (See step designs below)                       |
|                                                                        |
+------------------------------------------------------------------------+
|                                                                        |
|   [Cancel]                                    [Back]   [Next/Create]   |
|                                                                        |
+------------------------------------------------------------------------+
```

### 2.2 Step 1: Basics & Template Selection

**Visual Design:**

```
+------------------------------------------------------------------------+
|                                                                        |
|   Start with a Template (Optional)                                     |
|   +----------------------------------------------------------------+   |
|   |  +----------+  +----------+  +----------+  +----------+        |   |
|   |  | Admin    |  | Physician|  | Nurse    |  | Custom   |        |   |
|   |  | [icon]   |  | [icon]   |  | [icon]   |  | [+]      |        |   |
|   |  +----------+  +----------+  +----------+  +----------+        |   |
|   +----------------------------------------------------------------+   |
|                                                                        |
|   ----------------------------------------------------------------     |
|                                                                        |
|   Role Details                                                         |
|                                                                        |
|   +--------------------------------------------+                       |
|   | Role Name *                                |                       |
|   | [e.g., Physician, Nurse, Lab Technician]  |                       |
|   +--------------------------------------------+                       |
|                                                                        |
|   +--------------------------------------------+                       |
|   | Role Code *                                |                       |
|   | [e.g., physician, nurse, lab-tech]        |                       |
|   +--------------------------------------------+                       |
|   | Auto-generated from name. Lowercase with hyphens only.            |
|                                                                        |
|   +--------------------------------------------+                       |
|   | Description                                |                       |
|   | [Brief description of role's purpose]     |                       |
|   |                                           |                       |
|   +--------------------------------------------+                       |
|                                                                        |
|   Status:  (o) Active   ( ) Inactive                                   |
|                                                                        |
+------------------------------------------------------------------------+
```

### 2.3 Step 2: Permission Selection (MAJOR REDESIGN)

**Current State:** Flat collapsible list with checkboxes
**Redesigned State:** Visual category cards with grid layout

```typescript
// packages/app/src/emr/components/role-management/PermissionCategoryCard.tsx

interface PermissionCategoryCardProps {
  category: PermissionCategory;
  selectedPermissions: string[];
  onPermissionToggle: (code: string, checked: boolean) => void;
  onCategoryToggle: (category: PermissionCategory, checked: boolean) => void;
  expanded: boolean;
  onExpandToggle: () => void;
}
```

**Visual Design (Collapsed Category):**

```
+------------------------------------------------------------------------+
|  [Patient Icon]   Patient Management                     [6/6] [v]     |
|  [Blue accent]    View, create, and manage patient records             |
+------------------------------------------------------------------------+
```

**Visual Design (Expanded Category):**

```
+------------------------------------------------------------------------+
|  [Patient Icon]   Patient Management                     [4/6] [^]     |
|  [Blue accent]    View, create, and manage patient records             |
+------------------------------------------------------------------------+
|                                                                        |
|  +-------------------------------+  +-------------------------------+  |
|  | [x] View Patient Demographics |  | [x] Edit Patient Demographics |  |
|  |     Read patient info         |  |     Modify patient records    |  |
|  +-------------------------------+  +-------------------------------+  |
|                                                                        |
|  +-------------------------------+  +-------------------------------+  |
|  | [x] Create Patients           |  | [ ] Delete Patients           |  |
|  |     Register new patients     |  |     Remove patient records    |  |
|  +-------------------------------+  +-------------------------------+  |
|                                                                        |
|  +-------------------------------+  +-------------------------------+  |
|  | [x] Search Patients           |  | [ ] Export Patient Data       |  |
|  |     Find patient records      |  |     Download patient info     |  |
|  +-------------------------------+  +-------------------------------+  |
|                                                                        |
+------------------------------------------------------------------------+
```

**Permission Categories with Icons:**

| Category | Icon | Color | Permissions |
|----------|------|-------|-------------|
| Patient Management | IconUsers | #2b6cb0 | 6 |
| Clinical Documentation | IconFileText | #10b981 | 6 |
| Laboratory | IconFlask | #8b5cf6 | 4 |
| Billing & Financial | IconCoin | #f59e0b | 5 |
| Administration | IconSettings | #1a365d | 9 |
| Reports | IconChartBar | #06b6d4 | 4 |

**Category Card CSS:**
```css
.permission-category-card {
  background: var(--emr-text-inverse);
  border: 1px solid var(--emr-gray-200);
  border-radius: var(--emr-border-radius-lg);
  overflow: hidden;
  transition: all var(--emr-transition-smooth);
  margin-bottom: var(--emr-spacing-md);
}

.permission-category-card:hover {
  border-color: var(--emr-gray-300);
}

.permission-category-header {
  display: flex;
  align-items: center;
  padding: var(--emr-spacing-lg);
  cursor: pointer;
  gap: var(--emr-spacing-md);
  background: var(--emr-gray-50);
}

.permission-category-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--emr-border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.permission-category-info {
  flex: 1;
}

.permission-category-name {
  font-weight: var(--emr-font-semibold);
  color: var(--emr-text-primary);
  margin-bottom: 2px;
}

.permission-category-description {
  font-size: var(--emr-font-sm);
  color: var(--emr-gray-500);
}

.permission-category-badge {
  background: var(--emr-light-accent);
  color: var(--emr-secondary);
  font-size: var(--emr-font-sm);
  font-weight: var(--emr-font-medium);
  padding: 4px 12px;
  border-radius: 20px;
}

.permission-category-badge.all-selected {
  background: var(--emr-stat-success);
  color: white;
}

.permission-category-content {
  padding: var(--emr-spacing-lg);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--emr-spacing-md);
}

/* Individual permission item */
.permission-item {
  display: flex;
  align-items: flex-start;
  gap: var(--emr-spacing-sm);
  padding: var(--emr-spacing-md);
  border: 1px solid var(--emr-gray-200);
  border-radius: var(--emr-border-radius);
  transition: all var(--emr-transition-fast);
  cursor: pointer;
}

.permission-item:hover {
  background: var(--emr-hover-bg);
  border-color: var(--emr-gray-300);
}

.permission-item.selected {
  background: var(--emr-selected-bg);
  border-color: var(--emr-secondary);
}

.permission-item-name {
  font-weight: var(--emr-font-medium);
  color: var(--emr-text-primary);
  margin-bottom: 2px;
}

.permission-item-description {
  font-size: var(--emr-font-xs);
  color: var(--emr-gray-500);
}
```

### 2.4 Live Permission Preview Panel

**Purpose:** Show real-time preview of what the role can/cannot do

```typescript
// packages/app/src/emr/components/role-management/PermissionPreviewPanel.tsx

interface PermissionPreviewPanelProps {
  selectedPermissions: string[];
  roleName: string;
}
```

**Visual Design:**

```
+----------------------------------+
|  Preview: Physician Role         |
+----------------------------------+
|                                  |
|  CAN DO:                         |
|  [check] View patients           |
|  [check] Edit patients           |
|  [check] Create encounters       |
|  [check] View lab results        |
|                                  |
|  CANNOT DO:                      |
|  [x] Delete patients             |
|  [x] Manage billing              |
|  [x] Configure system            |
|                                  |
|  ------------------------------- |
|                                  |
|  18 of 34 permissions enabled    |
|  [===========-------] 53%        |
|                                  |
+----------------------------------+
```

**CSS:**
```css
.permission-preview-panel {
  background: var(--emr-gray-50);
  border: 1px solid var(--emr-gray-200);
  border-radius: var(--emr-border-radius-lg);
  padding: var(--emr-spacing-lg);
  position: sticky;
  top: var(--emr-spacing-lg);
}

.permission-preview-title {
  font-weight: var(--emr-font-semibold);
  color: var(--emr-text-primary);
  margin-bottom: var(--emr-spacing-lg);
  padding-bottom: var(--emr-spacing-sm);
  border-bottom: 1px solid var(--emr-gray-200);
}

.permission-preview-section {
  margin-bottom: var(--emr-spacing-lg);
}

.permission-preview-section-title {
  font-size: var(--emr-font-xs);
  font-weight: var(--emr-font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--emr-gray-500);
  margin-bottom: var(--emr-spacing-sm);
}

.permission-preview-item {
  display: flex;
  align-items: center;
  gap: var(--emr-spacing-xs);
  font-size: var(--emr-font-sm);
  margin-bottom: 4px;
}

.permission-preview-item.can-do {
  color: var(--emr-stat-success);
}

.permission-preview-item.cannot-do {
  color: var(--emr-gray-400);
}

.permission-progress-bar {
  height: 8px;
  background: var(--emr-gray-200);
  border-radius: 4px;
  overflow: hidden;
}

.permission-progress-fill {
  height: 100%;
  background: var(--emr-gradient-primary);
  transition: width var(--emr-transition-base);
}
```

### 2.5 Step 3: Review & Confirm

**Visual Design:**

```
+------------------------------------------------------------------------+
|                                                                        |
|   +----------------------------------------------------------------+   |
|   |                    ROLE PREVIEW CARD                           |   |
|   |                                                                |   |
|   |   +--------+   Physician                                       |   |
|   |   | [icon] |   physician                                       |   |
|   |   +--------+   "Clinical access for patient care"              |   |
|   |                                                                |   |
|   |   Status: [Active Badge]                                       |   |
|   |   Permissions: 18                                              |   |
|   |                                                                |   |
|   +----------------------------------------------------------------+   |
|                                                                        |
|   Permission Summary                                                   |
|   +----------------------------------------------------------------+   |
|   | Patient Management         4/6   [========------]              |   |
|   | Clinical Documentation     6/6   [==============] FULL         |   |
|   | Laboratory                 4/4   [==============] FULL         |   |
|   | Billing & Financial        0/5   [              ]              |   |
|   | Administration             2/9   [====-----------]             |   |
|   | Reports                    2/4   [========------]              |   |
|   +----------------------------------------------------------------+   |
|                                                                        |
|   [Edit Basics]                               [Edit Permissions]       |
|                                                                        |
+------------------------------------------------------------------------+
```

---

## Part 3: Responsive Design

### 3.1 Breakpoints

```css
/* Mobile First */
@media (max-width: 576px)  { /* Extra small devices */ }
@media (min-width: 577px)  { /* Small devices */ }
@media (min-width: 768px)  { /* Tablets */ }
@media (min-width: 992px)  { /* Desktops */ }
@media (min-width: 1200px) { /* Large desktops */ }
```

### 3.2 Mobile Adaptations

**Dashboard Stats:**
- 2x2 grid on mobile (2 columns)
- 1x4 on tablet and above

**Role Table:**
- Horizontal scroll on mobile
- Sticky first column (Name)
- Action icons in dropdown menu on mobile

**Role Creation Modal:**
- Full screen on mobile (`fullScreen={isMobile}`)
- Stacked form fields (single column)
- Permission categories: Single column grid
- Preview panel: Moves to bottom as collapsible section

**Template Cards:**
- 2 columns on mobile
- 4 columns on desktop

### 3.3 Touch-Friendly Design

```css
/* Minimum tap targets */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Larger checkboxes on mobile */
@media (max-width: 768px) {
  .mantine-Checkbox-input {
    width: 24px;
    height: 24px;
  }
}

/* Larger buttons on mobile */
@media (max-width: 768px) {
  .mantine-Button-root {
    min-height: 44px;
    font-size: 16px; /* Prevents iOS zoom */
  }
}
```

---

## Part 4: Accessibility Requirements (WCAG AA)

### 4.1 Color Contrast
- All text: Minimum 4.5:1 contrast ratio
- Large text (18px+): Minimum 3:1 contrast ratio
- Interactive elements: Clear focus indicators

### 4.2 Keyboard Navigation
- All interactive elements focusable
- Logical tab order
- Visible focus indicators (2px solid outline)
- Escape closes modals
- Enter activates buttons

### 4.3 Screen Reader Support
- All images have alt text
- Form inputs have associated labels
- Icon buttons have aria-labels
- Live regions for dynamic updates
- Proper heading hierarchy

### 4.4 ARIA Implementation
```tsx
// Example permission checkbox
<Checkbox
  checked={selected}
  onChange={handleChange}
  aria-describedby={`permission-${code}-description`}
  aria-labelledby={`permission-${code}-name`}
/>
<span id={`permission-${code}-name`}>{name}</span>
<span id={`permission-${code}-description`}>{description}</span>

// Example collapsible section
<Box
  role="region"
  aria-expanded={expanded}
  aria-labelledby={`category-${code}-header`}
>
  <button
    id={`category-${code}-header`}
    aria-controls={`category-${code}-content`}
    onClick={toggleExpand}
  >
    {categoryName}
  </button>
  <div id={`category-${code}-content`}>
    {/* content */}
  </div>
</Box>
```

---

## Part 5: State Management

### 5.1 Loading States

**Table Loading:**
```tsx
// TableSkeleton component (6 rows)
<Table>
  <Table.Tbody>
    {Array(6).fill(0).map((_, i) => (
      <Table.Tr key={i}>
        <Table.Td><Skeleton height={20} width="60%" /></Table.Td>
        <Table.Td><Skeleton height={20} width="80%" /></Table.Td>
        {/* ... more columns */}
      </Table.Tr>
    ))}
  </Table.Tbody>
</Table>
```

**Modal Loading:**
```tsx
<LoadingOverlay visible={loading} />
```

### 5.2 Empty States

**No Roles:**
```tsx
<RoleEmptyState
  onCreateRole={() => setCreateModalOpened(true)}
  onSelectTemplate={(template) => {
    setSelectedTemplate(template);
    setCreateModalOpened(true);
  }}
/>
```

**No Search Results:**
```tsx
<EmptyState
  variant="no-results"
  title="No roles found"
  description="Try adjusting your search or filters"
/>
```

### 5.3 Error States

```tsx
<Alert
  icon={<IconAlertCircle size={16} />}
  title="Error loading roles"
  color="red"
  variant="light"
>
  {errorMessage}
  <Button variant="subtle" size="xs" onClick={retry}>
    Retry
  </Button>
</Alert>
```

---

## Part 6: Animation & Micro-interactions

### 6.1 Entrance Animations

```css
/* Staggered card entrance */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-enter {
  animation: fadeInUp 0.3s ease-out forwards;
}

.card-enter:nth-child(1) { animation-delay: 0.05s; }
.card-enter:nth-child(2) { animation-delay: 0.1s; }
.card-enter:nth-child(3) { animation-delay: 0.15s; }
.card-enter:nth-child(4) { animation-delay: 0.2s; }
```

### 6.2 Hover Effects

```css
/* Card hover lift */
.interactive-card {
  transition: all var(--emr-transition-smooth);
}

.interactive-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--emr-shadow-md);
}

/* Button scale */
.button-scale:hover {
  transform: scale(1.02);
}

.button-scale:active {
  transform: scale(0.98);
}
```

### 6.3 Progress Indicators

```tsx
// Wizard step indicator
<Stepper active={currentStepIndex} onStepClick={setCurrentStep}>
  <Stepper.Step label="Basics" description="Name & template" />
  <Stepper.Step label="Permissions" description="Access rights" />
  <Stepper.Step label="Review" description="Confirm & create" />
</Stepper>
```

---

## Part 7: Implementation Checklist

### Phase 1: Dashboard Redesign
- [ ] Create `RoleDashboardStats` component
- [ ] Create `RoleEmptyState` component with illustration
- [ ] Create `RoleTemplateCards` component
- [ ] Enhance `RoleFilters` styling
- [ ] Enhance `RoleTable` styling
- [ ] Add loading skeletons
- [ ] Add empty state handling
- [ ] Update `RoleManagementView` layout

### Phase 2: Modal Redesign
- [ ] Convert to multi-step wizard
- [ ] Create `RoleTemplateSelector` component
- [ ] Create `PermissionCategoryCard` component
- [ ] Create `PermissionPreviewPanel` component
- [ ] Create `RolePreviewCard` component
- [ ] Implement step navigation
- [ ] Add form validation per step
- [ ] Add review summary view

### Phase 3: Polish
- [ ] Add entrance animations
- [ ] Add hover micro-interactions
- [ ] Implement keyboard shortcuts
- [ ] Test mobile responsiveness
- [ ] Test accessibility (screen reader)
- [ ] Add translation keys (ka/en/ru)
- [ ] Write unit tests

---

## Part 8: Translation Keys (New)

Add to `translations/en.json`:

```json
{
  "roleManagement.emptyState.title": "No Roles Configured Yet",
  "roleManagement.emptyState.description": "Roles define what users can see and do in the system. Create custom roles or start with a template below.",
  "roleManagement.emptyState.createCustom": "Create Custom Role",
  "roleManagement.emptyState.useTemplate": "Use Template",
  "roleManagement.quickStartTemplates": "Quick Start Templates",
  "roleManagement.template.admin": "Administrator",
  "roleManagement.template.adminDesc": "Full system access with all permissions",
  "roleManagement.template.physician": "Physician",
  "roleManagement.template.physicianDesc": "Clinical access for patient care",
  "roleManagement.template.nurse": "Nurse",
  "roleManagement.template.nurseDesc": "Patient care and documentation",
  "roleManagement.template.receptionist": "Receptionist",
  "roleManagement.template.receptionistDesc": "Patient registration and scheduling",
  "roleManagement.template.labTech": "Lab Technician",
  "roleManagement.template.labTechDesc": "Laboratory orders and results",
  "roleManagement.wizard.basics": "Basics",
  "roleManagement.wizard.basicsDesc": "Name & template",
  "roleManagement.wizard.permissions": "Permissions",
  "roleManagement.wizard.permissionsDesc": "Access rights",
  "roleManagement.wizard.review": "Review",
  "roleManagement.wizard.reviewDesc": "Confirm & create",
  "roleManagement.wizard.next": "Next",
  "roleManagement.wizard.back": "Back",
  "roleManagement.wizard.create": "Create Role",
  "roleManagement.preview.canDo": "CAN DO",
  "roleManagement.preview.cannotDo": "CANNOT DO",
  "roleManagement.preview.permissionsEnabled": "{count} of {total} permissions enabled",
  "roleManagement.category.patientManagement": "Patient Management",
  "roleManagement.category.patientManagementDesc": "View, create, and manage patient records",
  "roleManagement.category.clinicalDocumentation": "Clinical Documentation",
  "roleManagement.category.clinicalDocumentationDesc": "Create and edit clinical notes and records",
  "roleManagement.category.laboratory": "Laboratory",
  "roleManagement.category.laboratoryDesc": "Manage lab orders and results",
  "roleManagement.category.billing": "Billing & Financial",
  "roleManagement.category.billingDesc": "Access billing and financial information",
  "roleManagement.category.administration": "Administration",
  "roleManagement.category.administrationDesc": "System configuration and user management",
  "roleManagement.category.reports": "Reports",
  "roleManagement.category.reportsDesc": "Generate and view reports",
  "roleManagement.stats.totalRoles": "Total Roles",
  "roleManagement.stats.activeRoles": "Active Roles",
  "roleManagement.stats.inactiveRoles": "Inactive Roles",
  "roleManagement.stats.usersAssigned": "Users Assigned",
  "roleManagement.showingResults": "Showing {count} of {total} roles"
}
```

---

## Part 9: Code Examples

### 9.1 RoleEmptyState Component

```tsx
// packages/app/src/emr/components/role-management/RoleEmptyState.tsx

import { Box, Stack, Text, Button, Group, SimpleGrid } from '@mantine/core';
import { IconPlus, IconTemplate, IconShieldCheck, IconStethoscope, IconHeartbeat, IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '../../hooks/useTranslation';
import { ROLE_TEMPLATES } from '../../data/roleTemplates';

interface RoleEmptyStateProps {
  onCreateRole: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export function RoleEmptyState({ onCreateRole, onSelectTemplate }: RoleEmptyStateProps): JSX.Element {
  const { t, lang } = useTranslation();

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--emr-spacing-2xl) var(--emr-spacing-lg)',
        minHeight: '500px',
        textAlign: 'center',
      }}
    >
      {/* Animated Illustration */}
      <Box
        style={{
          width: 120,
          height: 120,
          marginBottom: 'var(--emr-spacing-2xl)',
          borderRadius: 'var(--emr-border-radius-xl)',
          background: 'var(--emr-gradient-accent-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'floatAnimation 3s ease-in-out infinite',
          border: '2px dashed var(--emr-gray-300)',
        }}
      >
        <IconShieldCheck size={56} color="var(--emr-secondary)" stroke={1.5} />
      </Box>

      {/* Title */}
      <Text
        style={{
          fontSize: 'var(--emr-font-3xl)',
          fontWeight: 'var(--emr-font-bold)',
          color: 'var(--emr-gray-800)',
          marginBottom: 'var(--emr-spacing-md)',
        }}
      >
        {t('roleManagement.emptyState.title')}
      </Text>

      {/* Description */}
      <Text
        style={{
          fontSize: 'var(--emr-font-md)',
          color: 'var(--emr-gray-500)',
          maxWidth: 480,
          lineHeight: 'var(--emr-line-height-relaxed)',
          marginBottom: 'var(--emr-spacing-2xl)',
        }}
      >
        {t('roleManagement.emptyState.description')}
      </Text>

      {/* Action Buttons */}
      <Group gap="md" mb="xl">
        <Button
          leftSection={<IconPlus size={18} />}
          size="lg"
          onClick={onCreateRole}
          style={{
            background: 'var(--emr-gradient-primary)',
            minHeight: 44,
          }}
        >
          {t('roleManagement.emptyState.createCustom')}
        </Button>
        <Button
          leftSection={<IconTemplate size={18} />}
          size="lg"
          variant="outline"
          onClick={() => onSelectTemplate('physician')}
          style={{
            borderColor: 'var(--emr-secondary)',
            color: 'var(--emr-secondary)',
            minHeight: 44,
          }}
        >
          {t('roleManagement.emptyState.useTemplate')}
        </Button>
      </Group>

      {/* Template Cards */}
      <Box
        style={{
          background: 'var(--emr-gray-50)',
          borderRadius: 'var(--emr-border-radius-xl)',
          padding: 'var(--emr-spacing-xl)',
          width: '100%',
          maxWidth: 800,
        }}
      >
        <Text
          style={{
            fontSize: 'var(--emr-font-xs)',
            fontWeight: 'var(--emr-font-semibold)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--emr-gray-500)',
            marginBottom: 'var(--emr-spacing-lg)',
          }}
        >
          {t('roleManagement.quickStartTemplates')}
        </Text>

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          {ROLE_TEMPLATES.slice(0, 4).map((template, index) => (
            <Box
              key={template.id}
              onClick={() => onSelectTemplate(template.id)}
              style={{
                background: 'var(--emr-text-inverse)',
                border: template.recommended
                  ? '2px solid var(--emr-secondary)'
                  : '1px solid var(--emr-gray-200)',
                borderRadius: 'var(--emr-border-radius-lg)',
                padding: 'var(--emr-spacing-lg)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all var(--emr-transition-smooth)',
                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--emr-shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Box
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: template.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--emr-spacing-sm)',
                }}
              >
                <template.icon size={24} color="white" />
              </Box>
              <Text fw={600} size="sm">
                {template[`name${lang.charAt(0).toUpperCase() + lang.slice(1)}` as keyof typeof template] || template.name}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={2}>
                {template.description}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes floatAnimation {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
}
```

### 9.2 PermissionCategoryCard Component

```tsx
// packages/app/src/emr/components/role-management/PermissionCategoryCard.tsx

import { Box, Group, Text, Collapse, ActionIcon, SimpleGrid, Badge } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import type { PermissionCategory } from '../../types/role-management';
import { EMRCheckbox } from '../shared/EMRFormFields';

interface PermissionCategoryCardProps {
  category: PermissionCategory;
  selectedPermissions: string[];
  onPermissionToggle: (code: string, checked: boolean) => void;
  onCategoryToggle: (checked: boolean) => void;
  expanded: boolean;
  onExpandToggle: () => void;
}

export function PermissionCategoryCard({
  category,
  selectedPermissions,
  onPermissionToggle,
  onCategoryToggle,
  expanded,
  onExpandToggle,
}: PermissionCategoryCardProps): JSX.Element {
  const selectedCount = category.permissions.filter(
    (p) => selectedPermissions.includes(p.code)
  ).length;
  const totalCount = category.permissions.length;
  const isAllSelected = selectedCount === totalCount;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  // Icon mapping for categories
  const CategoryIcon = getCategoryIcon(category.code);
  const categoryColor = getCategoryColor(category.code);

  return (
    <Box
      style={{
        background: 'var(--emr-text-inverse)',
        border: '1px solid var(--emr-gray-200)',
        borderRadius: 'var(--emr-border-radius-lg)',
        overflow: 'hidden',
        transition: 'all var(--emr-transition-smooth)',
      }}
    >
      {/* Header */}
      <Group
        onClick={onExpandToggle}
        style={{
          padding: 'var(--emr-spacing-lg)',
          cursor: 'pointer',
          background: 'var(--emr-gray-50)',
          borderBottom: expanded ? '1px solid var(--emr-gray-200)' : 'none',
        }}
        wrap="nowrap"
      >
        {/* Category Icon */}
        <Box
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--emr-border-radius)',
            background: categoryColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CategoryIcon size={20} color="white" />
        </Box>

        {/* Category Info */}
        <Box style={{ flex: 1 }}>
          <Text fw={600} size="sm" mb={2}>
            {category.name}
          </Text>
          <Text size="xs" c="dimmed">
            {category.description}
          </Text>
        </Box>

        {/* Selection Indicator */}
        <EMRCheckbox
          checked={isAllSelected}
          indeterminate={isPartiallySelected}
          onChange={(e) => {
            e.stopPropagation();
            onCategoryToggle(e.currentTarget.checked);
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select all ${category.name} permissions`}
        />

        {/* Count Badge */}
        <Badge
          variant="light"
          color={isAllSelected ? 'green' : 'blue'}
          style={{
            minWidth: 50,
            textAlign: 'center',
          }}
        >
          {selectedCount}/{totalCount}
        </Badge>

        {/* Expand Icon */}
        <ActionIcon variant="subtle" color="gray">
          {expanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
        </ActionIcon>
      </Group>

      {/* Permissions Grid */}
      <Collapse in={expanded}>
        <SimpleGrid
          cols={{ base: 1, sm: 2 }}
          spacing="md"
          style={{
            padding: 'var(--emr-spacing-lg)',
          }}
        >
          {category.permissions.map((permission) => {
            const isSelected = selectedPermissions.includes(permission.code);
            return (
              <Box
                key={permission.code}
                onClick={() => onPermissionToggle(permission.code, !isSelected)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--emr-spacing-sm)',
                  padding: 'var(--emr-spacing-md)',
                  border: `1px solid ${isSelected ? 'var(--emr-secondary)' : 'var(--emr-gray-200)'}`,
                  borderRadius: 'var(--emr-border-radius)',
                  background: isSelected ? 'var(--emr-selected-bg)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all var(--emr-transition-fast)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'var(--emr-hover-bg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <EMRCheckbox
                  checked={isSelected}
                  onChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={permission.name}
                />
                <Box>
                  <Text size="sm" fw={500}>
                    {permission.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {permission.description}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </SimpleGrid>
      </Collapse>
    </Box>
  );
}

// Helper functions
function getCategoryIcon(code: string) {
  const icons: Record<string, any> = {
    'patient-management': IconUsers,
    'clinical-documentation': IconFileText,
    'laboratory': IconFlask,
    'billing-financial': IconCoin,
    'administration': IconSettings,
    'reports': IconChartBar,
  };
  return icons[code] || IconShieldCheck;
}

function getCategoryColor(code: string): string {
  const colors: Record<string, string> = {
    'patient-management': '#2b6cb0',
    'clinical-documentation': '#10b981',
    'laboratory': '#8b5cf6',
    'billing-financial': '#f59e0b',
    'administration': '#1a365d',
    'reports': '#06b6d4',
  };
  return colors[code] || 'var(--emr-secondary)';
}
```

---

## Summary

This design specification provides a comprehensive blueprint for transforming the Role Management system from a basic functional interface into a modern, engaging, and user-friendly experience. Key improvements include:

1. **Empty State Excellence:** Engaging illustration with quick-start templates
2. **Dashboard Statistics:** Clear KPI cards showing role metrics
3. **Visual Permission Selection:** Category cards with icons and progress indicators
4. **Multi-Step Wizard:** Guided role creation experience
5. **Live Preview:** Real-time visualization of role capabilities
6. **Mobile-First Design:** Full responsiveness across all devices
7. **Accessibility:** WCAG AA compliant with proper ARIA support
8. **Micro-interactions:** Subtle animations for delight

All designs use existing EMR theme variables to ensure visual consistency with the rest of the application.
