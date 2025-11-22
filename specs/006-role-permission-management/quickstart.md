# Quick Start: Role and Permission Management Development

**Date**: 2025-11-20
**Feature**: Role Creation and Permission Management
**Developer Guide**: Getting started with implementing the role management system

## Prerequisites

Before starting development:

✅ Medplum monorepo cloned locally
✅ PostgreSQL and Redis running (`docker-compose up`)
✅ Node.js 18+ installed
✅ Dependencies installed (`npm install` at root)
✅ Branch checked out: `006-role-permission-management`

## Development Environment Setup

### 1. Install Dependencies

```bash
# From repository root
npm install

# Build packages in correct order
npm run build:fast
```

### 2. Start Development Server

```bash
cd packages/app
npm run dev
```

Access the EMR at: `http://localhost:3000/emr/account-management`

### 3. Verify Medplum Server

```bash
# Check server health
curl http://localhost:8103/healthcheck

# Expected response: {"ok": true}
```

---

## Project Structure

```
packages/app/src/emr/
├── views/role-management/
│   └── RoleManagementView.tsx          # Main role management page
├── components/role-management/
│   ├── RoleTable.tsx                   # Role list table
│   ├── RoleForm.tsx                    # Create/edit role form
│   ├── PermissionTree.tsx              # Hierarchical permission selector
│   ├── RoleCreateModal.tsx             # Modal for creating roles
│   └── RoleEditModal.tsx               # Modal for editing roles
├── services/
│   ├── roleService.ts                  # CRUD operations for roles
│   ├── permissionService.ts            # Permission tree utilities
│   └── roleValidators.ts               # Validation rules
├── hooks/
│   ├── useRoles.ts                     # Fetch roles with search/filter
│   ├── useRoleForm.ts                  # Form state management
│   └── usePermissions.ts               # Fetch permission tree
├── types/
│   └── role-management.ts              # TypeScript interfaces
└── translations/
    ├── permissions.json                # Permission names (ka/en/ru)
    └── permission-categories.json      # Category names
```

---

## Development Workflow

### Phase 1: Core Infrastructure (MVP - P1)

**Goal**: Create basic role with permissions and assign to users

#### Step 1.1: Define TypeScript Types

**File**: `packages/app/src/emr/types/role-management.ts`

```typescript
import { AccessPolicy } from '@medplum/fhirtypes';

export interface RoleFormValues {
  code: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  permissions: string[];
}

export interface RoleRow {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  permissionCount: number;
  userCount: number;
  createdDate: string;
  lastModified: string;
}

export interface Permission {
  code: string;
  name: string;
  description: string;
  category: string;
  accessLevel: 'read' | 'write' | 'delete' | 'admin';
  dependencies?: string[];
}

export interface PermissionCategory {
  code: string;
  name: string;
  description: string;
  displayOrder: number;
  permissions: Permission[];
}
```

#### Step 1.2: Create Role Service

**File**: `packages/app/src/emr/services/roleService.ts`

```typescript
import { MedplumClient } from '@medplum/core';
import { AccessPolicy, Bundle } from '@medplum/fhirtypes';
import type { RoleFormValues } from '../types/role-management';

/**
 * Create a new role (AccessPolicy resource)
 */
export async function createRole(
  medplum: MedplumClient,
  values: RoleFormValues
): Promise<AccessPolicy> {
  const policy: AccessPolicy = {
    resourceType: 'AccessPolicy',
    meta: {
      tag: [
        {
          system: 'http://medimind.ge/role-identifier',
          code: values.code,
          display: values.name,
        },
        {
          system: 'http://medimind.ge/role-status',
          code: values.status,
          display: values.status === 'active' ? 'Active' : 'Inactive',
        },
      ],
    },
    description: values.description,
    resource: permissionsToResourceRules(values.permissions),
  };

  return await medplum.createResource(policy);
}

/**
 * Search for roles with optional filters
 */
export async function searchRoles(
  medplum: MedplumClient,
  filters?: {
    name?: string;
    status?: 'active' | 'inactive';
    count?: number;
  }
): Promise<AccessPolicy[]> {
  const searchParams: Record<string, string> = {
    _tag: 'http://medimind.ge/role-identifier',
    _count: (filters?.count || 20).toString(),
    _sort: '-_lastUpdated',
  };

  if (filters?.name) {
    searchParams._text = filters.name;
  }

  if (filters?.status) {
    searchParams._tag = `http://medimind.ge/role-status|${filters.status}`;
  }

  return await medplum.searchResources('AccessPolicy', searchParams);
}

/**
 * Convert permission codes to FHIR AccessPolicyResource rules
 */
function permissionsToResourceRules(permissions: string[]): any[] {
  // Implementation from data-model.md
  // Map permissions to FHIR resource types
  return [];
}
```

**Test File**: `packages/app/src/emr/services/roleService.test.ts`

```typescript
import { MockClient } from '@medplum/mock';
import { createRole, searchRoles } from './roleService';

describe('roleService', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
  });

  it('creates a role with permissions', async () => {
    const values = {
      code: 'physician',
      name: 'Physician',
      description: 'Medical doctor',
      status: 'active' as const,
      permissions: ['view-patient-demographics', 'edit-patient-demographics'],
    };

    const role = await createRole(medplum, values);

    expect(role.resourceType).toBe('AccessPolicy');
    expect(role.meta?.tag).toContainEqual({
      system: 'http://medimind.ge/role-identifier',
      code: 'physician',
      display: 'Physician',
    });
  });

  it('searches roles with filters', async () => {
    const roles = await searchRoles(medplum, {
      status: 'active',
      count: 20,
    });

    expect(Array.isArray(roles)).toBe(true);
  });
});
```

#### Step 1.3: Create Permission Tree Component

**File**: `packages/app/src/emr/components/role-management/PermissionTree.tsx`

```typescript
import { Checkbox, Stack, Text, Collapse, Group, Box } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';
import type { PermissionCategory, Permission } from '../../types/role-management';

interface PermissionTreeProps {
  categories: PermissionCategory[];
  selectedPermissions: string[];
  onPermissionsChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export function PermissionTree({
  categories,
  selectedPermissions,
  onPermissionsChange,
  disabled,
}: PermissionTreeProps): JSX.Element {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map(c => c.code))
  );

  const handleToggleCategory = (categoryCode: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryCode)) {
      newExpanded.delete(categoryCode);
    } else {
      newExpanded.add(categoryCode);
    }
    setExpandedCategories(newExpanded);
  };

  const handlePermissionChange = (permissionCode: string, checked: boolean) => {
    const updated = new Set(selectedPermissions);

    if (checked) {
      // Add permission and its dependencies
      updated.add(permissionCode);
      const permission = findPermission(permissionCode, categories);
      permission?.dependencies?.forEach(dep => updated.add(dep));
    } else {
      // Remove permission
      updated.delete(permissionCode);
    }

    onPermissionsChange(Array.from(updated));
  };

  return (
    <Stack gap="md">
      {categories.map(category => (
        <Box key={category.code}>
          <Group
            gap="xs"
            style={{ cursor: 'pointer' }}
            onClick={() => handleToggleCategory(category.code)}
          >
            {expandedCategories.has(category.code) ? (
              <IconChevronDown size={18} />
            ) : (
              <IconChevronRight size={18} />
            )}
            <Text fw={600} size="sm">
              {category.name}
            </Text>
            <Text size="xs" c="dimmed">
              ({category.permissions.length} permissions)
            </Text>
          </Group>

          <Collapse in={expandedCategories.has(category.code)}>
            <Stack gap="xs" mt="sm" ml="xl">
              {category.permissions.map(permission => (
                <Checkbox
                  key={permission.code}
                  label={
                    <div>
                      <Text size="sm">{permission.name}</Text>
                      <Text size="xs" c="dimmed">
                        {permission.description}
                      </Text>
                    </div>
                  }
                  checked={selectedPermissions.includes(permission.code)}
                  onChange={(e) => handlePermissionChange(permission.code, e.currentTarget.checked)}
                  disabled={disabled}
                />
              ))}
            </Stack>
          </Collapse>
        </Box>
      ))}
    </Stack>
  );
}

function findPermission(code: string, categories: PermissionCategory[]): Permission | undefined {
  for (const cat of categories) {
    const perm = cat.permissions.find(p => p.code === code);
    if (perm) return perm;
  }
  return undefined;
}
```

#### Step 1.4: Run Tests

```bash
cd packages/app
npm test -- roleService.test.ts
```

---

## Common Development Tasks

### Task 1: Add New Permission

**File**: `packages/app/src/emr/translations/permissions.json`

```json
{
  "view-invoices": {
    "ka": "ინვოისების ნახვა",
    "en": "View Invoices",
    "ru": "Просмотр счетов"
  },
  "create-invoices": {
    "ka": "ინვოისების შექმნა",
    "en": "Create Invoices",
    "ru": "Создание счетов"
  }
}
```

**File**: `packages/app/src/emr/services/permissionService.ts` (add to tree)

```typescript
{
  code: 'view-invoices',
  name: 'View Invoices',
  description: 'Access billing page and view patient invoices',
  category: 'billing-financial',
  resourceType: 'Invoice',
  accessLevel: 'read'
},
{
  code: 'create-invoices',
  name: 'Create Invoices',
  description: 'Generate new invoices for patients',
  category: 'billing-financial',
  resourceType: 'Invoice',
  accessLevel: 'write',
  dependencies: ['view-invoices']
}
```

### Task 2: Test Role Creation Flow

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MedplumProvider } from '@medplum/react-hooks';
import { MockClient } from '@medplum/mock';
import { RoleCreateModal } from './RoleCreateModal';

test('creates role with selected permissions', async () => {
  const medplum = new MockClient();
  const onSuccess = jest.fn();

  render(
    <MedplumProvider medplum={medplum}>
      <RoleCreateModal opened={true} onClose={() => {}} onSuccess={onSuccess} />
    </MedplumProvider>
  );

  // Fill form
  fireEvent.change(screen.getByLabelText(/role name/i), {
    target: { value: 'Test Role' }
  });

  // Select permissions
  fireEvent.click(screen.getByLabelText(/view patient demographics/i));

  // Submit
  fireEvent.click(screen.getByRole('button', { name: /create/i }));

  await waitFor(() => {
    expect(onSuccess).toHaveBeenCalled();
  });
});
```

### Task 3: Debug Role Search

```typescript
// Enable verbose logging
localStorage.setItem('medplum:debug', 'true');

// Inspect FHIR requests in browser console
const roles = await medplum.searchResources('AccessPolicy', {
  _tag: 'http://medimind.ge/role-identifier'
});
console.log('Roles found:', roles);
```

---

## Debugging Tips

### Issue: Roles not appearing in table

**Check**:
1. Verify AccessPolicy has correct meta.tag:
   ```javascript
   console.log(role.meta?.tag);
   ```
2. Ensure tag system matches: `http://medimind.ge/role-identifier`
3. Check search parameters in Network tab

### Issue: Permission dependencies not auto-enabling

**Check**:
1. Verify dependencies array in permission definition
2. Add console log in `handlePermissionChange`:
   ```typescript
   console.log('Adding dependencies:', permission.dependencies);
   ```

### Issue: User permissions not updating after role edit

**Check**:
1. Verify WebSocket subscription is active
2. Check console for WebSocket connection errors
3. Try hard refresh (Cmd+Shift+R or Ctrl+Shift+F5)

---

## Next Steps

After completing Phase 1 (MVP):

1. **Phase 2**: Implement search/filter (US4) and edit modal (US5)
2. **Phase 3**: Add deactivation (US6), deletion (US7), cloning (US8)
3. **Testing**: Achieve >80% code coverage
4. **Documentation**: Update CLAUDE.md with role management instructions
5. **Deployment**: Create PR for review

---

## Useful Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- RoleTable.test.tsx

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run typecheck

# Build project
npm run build
```

---

## Resources

- **FHIR R4 Spec**: https://hl7.org/fhir/R4/
- **Medplum Docs**: https://www.medplum.com/docs
- **AccessPolicy**: https://www.medplum.com/docs/auth/access-control
- **Mantine UI**: https://mantine.dev/
- **React Testing Library**: https://testing-library.com/docs/react-testing-library/intro

---

## Support

- **Questions**: Check `CLAUDE.md` in repository root
- **Issues**: GitHub Issues for bug reports
- **Discussion**: Team Slack channel (if available)
