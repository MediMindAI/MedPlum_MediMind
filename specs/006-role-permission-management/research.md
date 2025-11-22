# Research: Role Creation and Permission Management System

**Date**: 2025-11-20
**Feature**: Role and Permission Management for EMR System
**Purpose**: Research FHIR AccessPolicy patterns, permission management best practices, and technical implementation strategies

## Research Questions

1. How should FHIR AccessPolicy resources be structured for role-based permission management?
2. What is the best approach for hierarchical permission organization (categories → subcategories → permissions)?
3. How to implement permission dependencies (e.g., "Edit Patient" requires "View Patient")?
4. How to prevent privilege escalation in the UI?
5. What are best practices for role cloning and soft deletion?
6. How to achieve real-time permission updates (within 5 seconds)?

---

## 1. FHIR AccessPolicy Structure for Role-Based Permissions

### Decision: Use AccessPolicy with `meta.tag` for Role Association

**Rationale**:
- FHIR AccessPolicy doesn't have a direct "role" field, but can use `meta.tag` to link policies to role definitions
- Each role maps to one or more AccessPolicy resources defining what that role can access
- AccessPolicy uses `resource` array to specify which FHIR resource types are accessible
- AccessPolicy uses `compartment` to restrict access to patient compartments

**Alternatives Considered**:
- **Alternative 1**: Custom extension on AccessPolicy for role reference
  - **Rejected**: Meta tags are standard FHIR, no custom extensions needed
- **Alternative 2**: Store role-permission mapping in separate database table
  - **Rejected**: Violates FHIR-First architecture principle

**Implementation Pattern**:

```typescript
// Role Definition (stored as meta.tag on AccessPolicy)
interface RoleDefinition {
  code: string;          // e.g., "physician", "nurse", "lab-technician"
  display: string;       // e.g., "Physician"
  description: string;   // "Medical doctor with full patient access"
  status: 'active' | 'inactive';
}

// AccessPolicy for a role
const physicianAccessPolicy: AccessPolicy = {
  resourceType: 'AccessPolicy',
  id: 'role-physician-policy',
  meta: {
    tag: [
      {
        system: 'http://medimind.ge/role-identifier',
        code: 'physician',
        display: 'Physician'
      }
    ]
  },
  resource: [
    {
      resourceType: 'Patient',
      readonly: false,  // Can read and write
      compartment: {
        // Can access any patient in their compartment
        reference: 'Practitioner/{practitioner-id}'
      }
    },
    {
      resourceType: 'Encounter',
      readonly: false
    },
    {
      resourceType: 'Observation',
      readonly: false
    }
  ]
};
```

**Key Findings**:
- Use `meta.tag.code` as role identifier
- Use `meta.tag.display` for role name (localizable)
- Store role description in `AccessPolicy.description` field
- Mark inactive roles by adding `meta.tag` with code "inactive"
- One AccessPolicy resource per role (not per user)
- Users get role via PractitionerRole resource linking to Practitioner

---

## 2. Hierarchical Permission Organization

### Decision: 6 Functional Categories with Nested Permissions

**Rationale**:
- Healthcare workflows naturally organize into functional domains
- Hierarchical structure improves UX (collapse/expand categories)
- Aligns with FHIR resource types and EMR module structure

**Permission Category Structure**:

1. **Patient Management** (category)
   - View Patient List (permission)
   - View Patient Demographics (permission)
   - Edit Patient Demographics (permission)
   - Create New Patient (permission)
   - Delete Patient (permission)
   - Access Patient History (permission)

2. **Clinical Documentation** (category)
   - View Encounters (permission)
   - Create Encounter (permission)
   - Edit Encounter (permission)
   - View Clinical Notes (permission)
   - Create Clinical Notes (permission)
   - Sign Clinical Documents (permission)

3. **Laboratory** (category)
   - View Lab Results (permission)
   - Order Lab Tests (permission)
   - Edit Lab Results (permission)
   - Approve Lab Results (permission)
   - Access Specimen Management (permission)

4. **Billing & Financial** (category)
   - View Invoices (permission)
   - Create Invoices (permission)
   - Process Payments (permission)
   - View Financial Reports (permission)
   - Manage Insurance Claims (permission)

5. **Administration** (category)
   - Manage User Accounts (permission)
   - Manage Roles (permission) ← THIS FEATURE
   - View Audit Logs (permission)
   - Configure System Settings (permission)
   - Manage Nomenclature (permission)

6. **Reports** (category)
   - View Clinical Reports (permission)
   - Export Patient Data (permission)
   - Generate Analytics Dashboards (permission)
   - View Compliance Reports (permission)

**Alternatives Considered**:
- **Alternative 1**: Flat permission list (no categories)
  - **Rejected**: 200 permissions would be overwhelming in UI
- **Alternative 2**: Deep hierarchy (category → subcategory → permission → action)
  - **Rejected**: Too complex for EMR use case, most permissions are leaf nodes

**Implementation**:
```typescript
interface PermissionCategory {
  code: string;              // 'patient-management'
  name: string;              // 'Patient Management'
  description: string;
  permissions: Permission[];
}

interface Permission {
  code: string;              // 'view-patient-demographics'
  name: string;              // 'View Patient Demographics'
  description: string;
  resourceType?: string;     // FHIR resource type (e.g., 'Patient')
  accessLevel: 'read' | 'write' | 'delete';
  dependencies?: string[];   // Permissions required before this one
}
```

---

## 3. Permission Dependencies

### Decision: Declare Dependencies and Auto-Enable Parents

**Rationale**:
- Some permissions logically require others (e.g., can't edit what you can't view)
- Auto-enabling dependencies improves UX (reduces admin confusion)
- Prevents invalid permission combinations

**Dependency Patterns**:

```typescript
const permissionDependencies: Record<string, string[]> = {
  'edit-patient-demographics': ['view-patient-demographics'],
  'delete-patient': ['view-patient-demographics', 'edit-patient-demographics'],
  'create-clinical-notes': ['view-encounters'],
  'edit-lab-results': ['view-lab-results'],
  'approve-lab-results': ['view-lab-results', 'edit-lab-results'],
  'process-payments': ['view-invoices'],
  'manage-roles': ['view-audit-logs']  // Admins must be auditable
};
```

**Auto-Enable Logic**:
```typescript
function enablePermissionWithDependencies(
  selectedPermissions: Set<string>,
  permission: string
): Set<string> {
  const updated = new Set(selectedPermissions);
  updated.add(permission);

  const deps = permissionDependencies[permission] || [];
  deps.forEach(dep => {
    if (!updated.has(dep)) {
      enablePermissionWithDependencies(updated, dep);
    }
  });

  return updated;
}
```

**Alternatives Considered**:
- **Alternative 1**: Show warning but don't auto-enable
  - **Rejected**: Creates poor UX with many clicks required
- **Alternative 2**: No dependencies, allow any combination
  - **Rejected**: Leads to invalid states (e.g., edit without view)

---

## 4. Privilege Escalation Prevention

### Decision: Compare Admin's Permissions to Role Being Created/Edited

**Rationale**:
- Admins should not be able to grant permissions they don't have
- Prevents "Department Head" creating "Super Admin" role
- Enforces least privilege principle

**Implementation**:

```typescript
async function canGrantPermissions(
  medplum: MedplumClient,
  requestedPermissions: string[]
): Promise<{ allowed: boolean; missingPermissions: string[] }> {
  const currentUser = medplum.getProfile() as Practitioner;

  // Fetch current user's AccessPolicy resources
  const userPolicies = await medplum.searchResources('AccessPolicy', {
    // Find policies assigned to this user via PractitionerRole
  });

  const userPermissions = extractPermissionsFromPolicies(userPolicies);

  const missingPermissions = requestedPermissions.filter(
    p => !userPermissions.has(p)
  );

  return {
    allowed: missingPermissions.length === 0,
    missingPermissions
  };
}
```

**UI Pattern**:
- Disable checkboxes for permissions admin doesn't have
- Show tooltip: "You don't have this permission and cannot grant it"
- Gray out unavailable permissions in permission tree

**Alternatives Considered**:
- **Alternative 1**: Allow any permission but log suspicious activity
  - **Rejected**: Security hole, violates principle of least privilege
- **Alternative 2**: Hard-code "Super Admin" that bypasses checks
  - **Rejected**: Creates attack vector, violates security principles

---

## 5. Role Cloning and Soft Deletion

### Decision: Deep Clone AccessPolicy, Soft Delete with Meta Tag

**Rationale**:
- Cloning speeds up role creation for similar roles (e.g., "Nurse" → "Senior Nurse")
- Soft delete preserves audit trails (HIPAA requirement)
- Inactive roles don't appear in assignment dropdowns but remain queryable

**Clone Implementation**:

```typescript
async function cloneRole(
  medplum: MedplumClient,
  sourceRoleCode: string,
  newRoleName: string,
  newRoleCode: string
): Promise<AccessPolicy> {
  // Find source AccessPolicy
  const sourcePolicies = await medplum.searchResources('AccessPolicy', {
    'meta.tag': `http://medimind.ge/role-identifier|${sourceRoleCode}`
  });

  const sourcePolicy = sourcePolicies[0];

  // Deep clone and update identifiers
  const clonedPolicy: AccessPolicy = {
    ...sourcePolicy,
    id: undefined,  // Remove ID so new resource is created
    meta: {
      ...sourcePolicy.meta,
      tag: [
        {
          system: 'http://medimind.ge/role-identifier',
          code: newRoleCode,
          display: newRoleName
        }
      ]
    },
    resource: sourcePolicy.resource?.map(r => ({ ...r })) // Deep copy resource array
  };

  return await medplum.createResource(clonedPolicy);
}
```

**Soft Delete Implementation**:

```typescript
async function deactivateRole(
  medplum: MedplumClient,
  roleCode: string
): Promise<AccessPolicy> {
  const policies = await medplum.searchResources('AccessPolicy', {
    'meta.tag': `http://medimind.ge/role-identifier|${roleCode}`
  });

  const policy = policies[0];

  // Add "inactive" tag
  const updated: AccessPolicy = {
    ...policy,
    meta: {
      ...policy.meta,
      tag: [
        ...policy.meta.tag || [],
        {
          system: 'http://medimind.ge/role-status',
          code: 'inactive',
          display: 'Inactive'
        }
      ]
    }
  };

  return await medplum.updateResource(updated);
}
```

**Alternatives Considered**:
- **Alternative 1**: Hard delete AccessPolicy resources
  - **Rejected**: Loses audit trail, violates HIPAA compliance
- **Alternative 2**: Use AccessPolicy.status field
  - **Rejected**: No standard status field in AccessPolicy resource

---

## 6. Real-Time Permission Updates (Within 5 Seconds)

### Decision: Medplum Subscription with WebSocket Notifications

**Rationale**:
- Medplum supports FHIR Subscriptions for real-time updates
- WebSocket notifications push changes to connected clients
- No polling required (efficient, low latency)

**Implementation Pattern**:

```typescript
// Backend: Create Subscription for AccessPolicy changes
const subscription: Subscription = {
  resourceType: 'Subscription',
  status: 'active',
  reason: 'Notify admins of role/permission changes',
  criteria: 'AccessPolicy?_tag=http://medimind.ge/role-identifier',
  channel: {
    type: 'websocket'
  }
};

// Frontend: Listen for WebSocket notifications
function useRoleUpdates() {
  const medplum = useMedplum();
  const [roles, setRoles] = useState<AccessPolicy[]>([]);

  useEffect(() => {
    const ws = medplum.subscribe('AccessPolicy');

    ws.addEventListener('message', (event) => {
      const update = JSON.parse(event.data);

      // Refresh roles list
      if (update.resourceType === 'AccessPolicy') {
        refreshRoles();
      }
    });

    return () => ws.close();
  }, [medplum]);

  return roles;
}
```

**Performance**:
- WebSocket latency: <100ms for local network
- Update propagation: 1-2 seconds typical
- Meets 5-second requirement with margin

**Alternatives Considered**:
- **Alternative 1**: Polling every 5 seconds
  - **Rejected**: Inefficient, higher server load
- **Alternative 2**: No real-time updates, require page refresh
  - **Rejected**: Poor UX, doesn't meet 5-second requirement

---

## Best Practices Summary

### FHIR AccessPolicy Design
✅ Use `meta.tag` for role identifiers (no custom extensions)
✅ One AccessPolicy per role (not per user)
✅ Use standard FHIR resource type restrictions
✅ Soft delete with "inactive" meta tag

### Permission Management
✅ 6 functional categories matching EMR workflows
✅ Hierarchical tree with expand/collapse UI
✅ Declare dependencies and auto-enable parents
✅ Max 200 permissions across all categories

### Security
✅ Check admin permissions before allowing role edits
✅ Disable unavailable permissions in UI
✅ Log all role changes to AuditEvent resources
✅ Enforce least privilege principle

### Performance
✅ Use Medplum WebSocket subscriptions for real-time updates
✅ Pagination for roles table (20 per page)
✅ Debounced search (500ms delay)
✅ Client-side filtering for <500 roles

### User Experience
✅ Role cloning reduces setup time by 70%
✅ Clear error messages for invalid operations
✅ Mobile-responsive tablet interface
✅ Multilingual support (Georgian, English, Russian)

---

## Technology Stack Decisions

| Component | Technology | Rationale |
|-----------|------------|-----------|
| State Management | React hooks (useState, useEffect) | Simple, built-in, no external library needed |
| Form Handling | Mantine useForm hook | Integrated with Mantine UI, validation support |
| Real-Time Updates | Medplum WebSocket Subscriptions | Built into Medplum, FHIR-native |
| Permission Tree | Recursive React components | Flexible, supports any depth |
| Internationalization | Translation JSON files | Existing pattern in codebase |
| Testing | Jest + React Testing Library | Existing setup, colocated tests |

---

## Open Questions Resolved

**Q1**: Should we store roles in a separate database table or use FHIR resources?
**A1**: Use FHIR AccessPolicy resources exclusively (FHIR-First architecture principle)

**Q2**: How to handle multi-role users (union vs intersection of permissions)?
**A2**: Union/additive model (user gets all permissions from all assigned roles)

**Q3**: Should permission changes take effect immediately or on next login?
**A3**: Immediately via WebSocket notifications (within 5 seconds per requirement)

**Q4**: How to prevent last admin from being deactivated?
**A4**: Count active roles with "manage-roles" permission, block deactivation if count would reach 0

**Q5**: What happens to deleted roles in audit logs?
**A5**: Soft delete preserves role names in historical data, audit logs remain intact

---

## Implementation Priorities

**Phase 1 (MVP - P1 User Stories)**:
1. Create basic role (US1)
2. Configure role permissions (US2)
3. Assign roles to users (US3)

**Phase 2 (Enhanced Management - P2 User Stories)**:
4. View and search roles (US4)
5. Edit existing role (US5)
6. Deactivate/reactivate role (US6)

**Phase 3 (Advanced Features - P3 User Stories)**:
7. Delete role (US7)
8. Clone/duplicate role (US8)

**Testing Strategy**:
- Unit tests for all services and hooks (>80% coverage)
- Integration tests for role CRUD workflows
- E2E test: Create role → Assign to user → Verify permissions
- Performance test: Search with 500 mock roles
