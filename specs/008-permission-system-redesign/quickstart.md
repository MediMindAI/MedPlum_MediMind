# Quickstart: Permission System Redesign

**Feature**: 008-permission-system-redesign
**Date**: 2025-11-27

---

## Overview

This guide covers implementing the production-ready permission system for MediMind EMR with ~80-120 permissions, department scoping, and HIPAA-compliant audit logging.

---

## 1. Prerequisites

### Required Packages

```bash
# Already installed in monorepo
@medplum/core
@medplum/fhirtypes
@medplum/react-hooks
@mantine/core
@mantine/hooks
```

### Environment

- TypeScript 5.x with strict mode
- React 19
- Medplum Server running (for AccessPolicy storage)

---

## 2. Core Architecture

### File Structure

```
packages/app/src/emr/
├── services/
│   ├── permissionService.ts      # Extended - add 80-120 permissions
│   ├── permissionCacheService.ts # NEW - caching layer
│   └── roleService.ts            # Extended - department scoping
├── hooks/
│   ├── usePermissionCheck.ts     # Extended - cached checks
│   ├── usePermissions.ts         # Extended - matrix view
│   └── usePermissionCache.ts     # NEW - cache management
├── contexts/
│   └── PermissionContext.tsx     # NEW - permission provider
├── types/
│   ├── role-management.ts        # Extended - new permission types
│   └── permission-cache.ts       # NEW - cache types
└── components/
    ├── permission-matrix/
    │   └── PermissionMatrix.tsx  # Extended - 8 categories
    └── access-control/
        ├── PermissionGate.tsx    # NEW - conditional rendering
        └── RequirePermission.tsx # NEW - route protection
```

---

## 3. Permission Definitions

### Expand Permission Categories

```typescript
// packages/app/src/emr/services/permissionService.ts

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    code: 'patient-management',
    name: { ka: 'პაციენტის მართვა', en: 'Patient Management', ru: 'Управление пациентами' },
    displayOrder: 1,
    permissions: [
      {
        code: 'view-patient-list',
        name: { ka: 'პაციენტების სია', en: 'View Patient List', ru: 'Список пациентов' },
        resourceType: 'Patient',
        accessLevel: 'read',
        dependencies: [],
      },
      {
        code: 'view-patient-demographics',
        name: { ka: 'პაციენტის მონაცემები', en: 'View Demographics', ru: 'Демография' },
        resourceType: 'Patient',
        accessLevel: 'read',
        dependencies: ['view-patient-list'],
      },
      // ... 13 more patient permissions
    ],
  },
  // ... 7 more categories
];
```

### Permission to AccessPolicy Mapping

```typescript
// packages/app/src/emr/services/permissionService.ts

/**
 * Convert permission codes to AccessPolicyResource array
 * Uses interaction[] instead of readonly for granular control
 */
export function permissionsToAccessPolicyResources(
  permissions: string[]
): AccessPolicyResource[] {
  const resourceMap = new Map<string, Set<FHIRInteraction>>();

  for (const permCode of permissions) {
    const perm = findPermission(permCode);
    if (!perm?.resourceType) continue;

    const interactions = resourceMap.get(perm.resourceType) || new Set();

    // Map accessLevel to FHIR interactions
    switch (perm.accessLevel) {
      case 'read':
        interactions.add('read');
        interactions.add('search');
        break;
      case 'write':
        interactions.add('read');
        interactions.add('create');
        interactions.add('update');
        interactions.add('search');
        break;
      case 'delete':
        interactions.add('delete');
        break;
      case 'admin':
        interactions.add('read');
        interactions.add('create');
        interactions.add('update');
        interactions.add('delete');
        interactions.add('search');
        break;
    }

    resourceMap.set(perm.resourceType, interactions);
  }

  return Array.from(resourceMap.entries()).map(([resourceType, interactions]) => ({
    resourceType,
    interaction: Array.from(interactions),
  }));
}
```

---

## 4. Permission Caching

### Cache Service

```typescript
// packages/app/src/emr/services/permissionCacheService.ts

const CACHE_TTL_MS = 10_000; // 10 seconds

interface CacheEntry {
  value: boolean;
  expiresAt: number;
}

class PermissionCache {
  private cache = new Map<string, CacheEntry>();

  get(code: string): boolean | null {
    const entry = this.cache.get(code);
    if (!entry || entry.expiresAt < Date.now()) {
      this.cache.delete(code);
      return null; // Expired or missing → triggers fetch
    }
    return entry.value;
  }

  set(code: string, value: boolean): void {
    this.cache.set(code, {
      value,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
  }

  invalidate(): void {
    this.cache.clear();
  }

  invalidateFor(codes: string[]): void {
    codes.forEach(code => this.cache.delete(code));
  }
}

export const permissionCache = new PermissionCache();
```

### Cache Hook

```typescript
// packages/app/src/emr/hooks/usePermissionCache.ts

export function usePermissionCheck(permissionCode: string): boolean {
  const medplum = useMedplum();
  const profile = useMedplumProfile();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;

    // Check cache first
    const cached = permissionCache.get(permissionCode);
    if (cached !== null) {
      setHasPermission(cached);
      return;
    }

    // Fetch from server
    checkPermissionFromServer(medplum, profile.id, permissionCode)
      .then((result) => {
        permissionCache.set(permissionCode, result);
        setHasPermission(result);
      })
      .catch(() => {
        // FAIL-CLOSED: Deny on error
        setHasPermission(false);
      });
  }, [medplum, profile?.id, permissionCode]);

  // FAIL-CLOSED: Return false until confirmed
  return hasPermission;
}
```

---

## 5. Permission Gate Component

### Conditional Rendering

```typescript
// packages/app/src/emr/components/access-control/PermissionGate.tsx

interface PermissionGateProps {
  permission: string | string[];
  mode?: 'any' | 'all';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({
  permission,
  mode = 'all',
  fallback = null,
  children,
}: PermissionGateProps): React.ReactElement | null {
  const permissions = Array.isArray(permission) ? permission : [permission];
  const results = permissions.map(p => usePermissionCheck(p));

  const hasAccess = mode === 'any'
    ? results.some(r => r)
    : results.every(r => r);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Usage
<PermissionGate permission="edit-patient-demographics">
  <Button onClick={handleEdit}>Edit</Button>
</PermissionGate>

<PermissionGate
  permission={['view-financial-reports', 'export-financial-data']}
  mode="any"
  fallback={<Text>No access</Text>}
>
  <FinancialDashboard />
</PermissionGate>
```

### Route Protection

```typescript
// packages/app/src/emr/components/access-control/RequirePermission.tsx

interface RequirePermissionProps {
  permission: string | string[];
  mode?: 'any' | 'all';
  redirectTo?: string;
  children: React.ReactNode;
}

export function RequirePermission({
  permission,
  mode = 'all',
  redirectTo = '/emr/access-denied',
  children,
}: RequirePermissionProps): React.ReactElement {
  const navigate = useNavigate();
  const permissions = Array.isArray(permission) ? permission : [permission];
  const results = permissions.map(p => usePermissionCheck(p));

  const hasAccess = mode === 'any'
    ? results.some(r => r)
    : results.every(r => r);

  useEffect(() => {
    if (!hasAccess) {
      navigate(redirectTo);
    }
  }, [hasAccess, navigate, redirectTo]);

  return hasAccess ? <>{children}</> : <LoadingOverlay visible />;
}

// Usage in routes
<Route
  path="/emr/administration/*"
  element={
    <RequirePermission permission="view-system-settings">
      <AdministrationSection />
    </RequirePermission>
  }
/>
```

---

## 6. Department Scoping

### Department-Scoped AccessPolicy

```typescript
// packages/app/src/emr/services/roleService.ts

export async function createDepartmentScopedRole(
  medplum: MedplumClient,
  roleInput: RoleInput,
  departmentId: string
): Promise<AccessPolicy> {
  const resources = permissionsToAccessPolicyResources(roleInput.permissions || []);

  // Add department scoping via criteria
  const scopedResources = resources.map(resource => {
    if (['Patient', 'Encounter', 'Observation'].includes(resource.resourceType)) {
      return {
        ...resource,
        criteria: `${resource.resourceType}?organization=%department`,
      };
    }
    return resource;
  });

  return medplum.createResource<AccessPolicy>({
    resourceType: 'AccessPolicy',
    name: roleInput.name,
    meta: {
      tag: [
        { system: 'http://medimind.ge/role-identifier', code: roleInput.code, display: roleInput.name },
        { system: 'http://medimind.ge/role-status', code: 'active' },
        { system: 'http://medimind.ge/department-scoped', code: 'true' },
      ],
    },
    resource: scopedResources,
  });
}
```

### Assign User to Department

```typescript
// packages/app/src/emr/services/accountService.ts

export async function assignRoleWithDepartment(
  medplum: MedplumClient,
  practitionerId: string,
  roleId: string,
  departmentId: string
): Promise<PractitionerRole> {
  return medplum.createResource<PractitionerRole>({
    resourceType: 'PractitionerRole',
    practitioner: { reference: `Practitioner/${practitionerId}` },
    organization: { reference: `Organization/${departmentId}` },
    active: true,
    extension: [{
      url: 'http://medimind.ge/extensions/access-policy',
      valueReference: { reference: `AccessPolicy/${roleId}` },
    }],
    meta: {
      tag: [{
        system: 'http://medimind.ge/role-assignment',
        code: roleId,
      }],
    },
  });
}
```

---

## 7. Audit Logging

### Create Permission Audit Event

```typescript
// packages/app/src/emr/services/auditService.ts

export async function logPermissionEvent(
  medplum: MedplumClient,
  event: {
    action: 'grant' | 'revoke' | 'check' | 'deny' | 'emergency';
    userId: string;
    targetResource?: string;
    permissionCode?: string;
    outcome: 'success' | 'denied' | 'failure';
    details?: string;
  }
): Promise<AuditEvent> {
  const codeMap = {
    grant: 'DCM 110136',
    revoke: 'DCM 110137',
    check: 'DCM 110110',
    deny: 'DCM 110111',
    emergency: 'DCM 110113',
  };

  return medplum.createResource<AuditEvent>({
    resourceType: 'AuditEvent',
    type: {
      system: 'http://dicom.nema.org/resources/ontology/DCM',
      code: codeMap[event.action],
      display: event.action,
    },
    recorded: new Date().toISOString(),
    outcome: event.outcome === 'success' ? '0' : event.outcome === 'denied' ? '4' : '8',
    outcomeDesc: event.details,
    agent: [{
      who: { reference: `Practitioner/${event.userId}` },
      requestor: true,
    }],
    entity: event.targetResource ? [{
      what: { reference: event.targetResource },
      detail: event.permissionCode ? [{
        type: 'permission',
        valueString: event.permissionCode,
      }] : undefined,
    }] : undefined,
    source: {
      observer: { reference: 'Device/medimind-emr' },
    },
  });
}
```

---

## 8. Testing

### Permission Check Test

```typescript
// packages/app/src/emr/hooks/usePermissionCheck.test.tsx

import { renderHook, waitFor } from '@testing-library/react';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';
import { usePermissionCheck } from './usePermissionCheck';

describe('usePermissionCheck', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
    permissionCache.invalidate();
  });

  it('returns false by default (fail-closed)', () => {
    const { result } = renderHook(
      () => usePermissionCheck('view-patient-list'),
      { wrapper: ({ children }) => (
        <MedplumProvider medplum={medplum}>{children}</MedplumProvider>
      )}
    );

    expect(result.current).toBe(false);
  });

  it('returns true when permission granted', async () => {
    // Setup: create AccessPolicy with permission
    await medplum.createResource({
      resourceType: 'AccessPolicy',
      name: 'Test Role',
      meta: {
        tag: [{ system: 'http://medimind.ge/role-identifier', code: 'test' }],
      },
      resource: [{ resourceType: 'Patient', interaction: ['read', 'search'] }],
    });

    const { result } = renderHook(
      () => usePermissionCheck('view-patient-list'),
      { wrapper: /* ... */ }
    );

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('uses cache on subsequent calls', async () => {
    // First call populates cache
    // Second call uses cache
    // Verify API not called twice
  });

  it('fails closed on API error', async () => {
    medplum.setError(new Error('Network error'));

    const { result } = renderHook(
      () => usePermissionCheck('view-patient-list'),
      { wrapper: /* ... */ }
    );

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});
```

---

## 9. Migration Checklist

1. [ ] Add new permission codes to `permissionService.ts`
2. [ ] Create 16 role templates matching legacy personnel types
3. [ ] Add `PermissionGate` component for UI access control
4. [ ] Add `RequirePermission` wrapper for route protection
5. [ ] Implement permission cache with 10s TTL
6. [ ] Add department scoping via `criteria` parameter
7. [ ] Create audit logging for permission events
8. [ ] Update existing permission matrix UI for 8 categories
9. [ ] Add translations for new permissions (ka/en/ru)
10. [ ] Write tests for fail-closed behavior

---

## 10. Common Patterns

### Check Multiple Permissions

```typescript
const canEdit = usePermissionCheck('edit-patient-demographics');
const canDelete = usePermissionCheck('delete-patient');
const canExport = usePermissionCheck('export-patient-data');

// In component
{canEdit && <EditButton />}
{canDelete && <DeleteButton />}
```

### Department-Aware Components

```typescript
function PatientList() {
  const { departmentId } = useDepartmentContext();
  const canView = usePermissionCheck('view-patient-list');

  // Search with department filter
  const patients = useMedplum().search('Patient', {
    organization: departmentId,
  });
}
```

### Emergency Access

```typescript
async function requestEmergencyAccess(resourceId: string, reason: string) {
  const result = await medplum.request('POST', '/api/v1/emergency-access', {
    resourceId,
    reason,
  });

  if (result.granted) {
    // Log to audit
    await logPermissionEvent(medplum, {
      action: 'emergency',
      userId: currentUserId,
      targetResource: resourceId,
      outcome: 'success',
      details: reason,
    });
  }

  return result;
}
```

---

## References

- [Medplum AccessPolicy Docs](https://www.medplum.com/docs/access/access-policies)
- [FHIR Security Module](https://hl7.org/fhir/security.html)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/permission-api.yaml)
- [Research Findings](./research.md)
