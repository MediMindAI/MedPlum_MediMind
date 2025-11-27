# Research: Permission System Redesign

**Feature**: 008-permission-system-redesign
**Date**: 2025-11-27
**Status**: Complete

---

## Overview

This research consolidates findings on Medplum AccessPolicy patterns, permission caching strategies, and FHIR-based RBAC implementation for healthcare applications.

---

## 1. AccessPolicy Resource Structure

### Decision: Use Medplum AccessPolicy as Foundation

**Rationale**: Medplum's native AccessPolicy resource provides FHIR-compliant, server-enforced permission rules that satisfy HIPAA audit requirements.

**Alternatives Considered**:
- Custom permission table: Rejected - requires separate enforcement, not FHIR-native
- JWT claims: Rejected - not persistent, doesn't integrate with FHIR audit trail

### AccessPolicy Structure

```typescript
interface AccessPolicy {
  resourceType: 'AccessPolicy';
  name: string;
  description?: string;

  // Core permission rules
  resource?: AccessPolicyResource[];

  // Compartment-based access (deprecated - use criteria)
  compartment?: Reference;
}

interface AccessPolicyResource {
  resourceType: string | '*';

  // Option 1: Binary flag (current system)
  readonly?: boolean;  // true = read-only, false = full access

  // Option 2: Granular interactions (recommended)
  interaction?: Array<'create' | 'read' | 'update' | 'delete' | 'search'>;

  // Scoping via FHIR search
  criteria?: string;  // e.g., "Patient?organization=%department"

  // Field restrictions
  hiddenFields?: string[];
  readonlyFields?: string[];
}
```

### Current vs. Recommended Approach

| Aspect | Current System | Recommended Enhancement |
|--------|----------------|------------------------|
| CRUD Control | `readonly: true/false` | `interaction: ['read', 'update']` |
| Scoping | None | `criteria: "Patient?organization=%department"` |
| Field Control | None | `hiddenFields`, `readonlyFields` |

---

## 2. Permission Granularity Mapping

### Decision: ~80-120 Permissions Across 8 Categories

**Rationale**: Balances legacy 534 permissions with usability. Maps to FHIR resource types while preserving action-specific control.

**Alternatives Considered**:
- 200+ permissions (legacy-like): Rejected - overwhelming for administrators
- 30 permissions (current): Rejected - insufficient for clinical workflows

### Permission Category Structure

```typescript
// Expanded from current 6 to 8 categories
const PERMISSION_CATEGORIES = [
  'patient-management',       // 12-15 permissions
  'clinical-documentation',   // 15-18 permissions
  'laboratory',               // 10-12 permissions
  'billing-financial',        // 12-15 permissions
  'administration',           // 15-18 permissions
  'reports',                  // 8-10 permissions
  'nomenclature',             // 6-8 permissions
  'scheduling'                // 6-8 permissions
];
```

### FHIR Resource Mapping

| Permission | FHIR Resource | Interactions | Scope |
|------------|---------------|--------------|-------|
| view-patient-list | Patient | read, search | department |
| create-patient | Patient | create | - |
| edit-patient-demographics | Patient | update | department |
| delete-patient | Patient | delete | - |
| view-encounters | Encounter | read, search | department |
| create-encounter | Encounter | create | - |
| edit-encounter | Encounter | update | time-limited |
| view-lab-orders | ServiceRequest | read, search | department |
| create-lab-order | ServiceRequest | create | - |
| approve-lab-result | Observation | update | action-specific |

---

## 3. Department Scoping Implementation

### Decision: Use Criteria-Based Scoping with Parameter Substitution

**Rationale**: Medplum's `criteria` field with `%department` parameter substitution provides flexible, server-enforced scoping without custom code.

**Alternatives Considered**:
- Compartment (deprecated in Medplum)
- Custom middleware: Rejected - not FHIR-native, separate enforcement

### Implementation Pattern

```typescript
// AccessPolicy with department scoping
const departmentScopedPolicy: AccessPolicyResource[] = [
  {
    resourceType: 'Patient',
    criteria: 'Patient?organization=%department',
    interaction: ['read', 'search']
  },
  {
    resourceType: 'Encounter',
    criteria: 'Encounter?serviceProvider=%department',
    interaction: ['create', 'read', 'update']
  }
];

// Parameter set at login via ProjectMembershipAccess
const membership = {
  profile: { reference: 'Practitioner/dr-smith' },
  access: [{
    policy: { reference: 'AccessPolicy/physician-template' },
    parameter: [{
      name: 'department',
      valueReference: { reference: 'Organization/cardiology' }
    }]
  }]
};
```

### Time-Limited Department Access (30-90 Days)

For patient transfers, implement via:
1. Add patient to new department Organization
2. Keep reference to old department for transition period
3. Background job removes old department reference after N days

---

## 4. Permission Caching Strategy

### Decision: Three-Layer Cache with 5-10 Second TTL

**Rationale**: Balances performance (<50ms latency) with rapid propagation (60 second requirement) while maintaining fail-closed security.

**Alternatives Considered**:
- No caching: Rejected - too slow for 1000+ users
- Session-length cache: Rejected - stale permissions unacceptable
- WebSocket push: Rejected - complexity outweighs benefit for 5-10s TTL

### Cache Architecture

```
Layer 1: In-Memory (React State) - 5-10s TTL
    ↓
Layer 2: SessionStorage - 10-15s TTL
    ↓
Layer 3: Server (AccessPolicy API)
```

### Implementation Pattern

```typescript
class PermissionCache {
  private cache = new Map<string, { value: boolean; expiresAt: number }>();
  private readonly ttlMs = 10_000;  // 10 seconds

  get(code: string): boolean | null {
    const entry = this.cache.get(code);
    if (!entry || entry.expiresAt < Date.now()) {
      return null;  // Expired or missing → will trigger fetch
    }
    return entry.value;
  }

  set(code: string, value: boolean): void {
    this.cache.set(code, {
      value,
      expiresAt: Date.now() + this.ttlMs
    });
  }

  invalidate(): void {
    this.cache.clear();
  }
}
```

### Fail-Closed Behavior

```typescript
function checkPermission(code: string): boolean {
  const cached = cache.get(code);

  // FAIL-CLOSED: Deny if cache miss or expired
  if (cached === null) {
    triggerBackgroundRefresh(code);
    return false;  // Deny until refresh completes
  }

  return cached;
}
```

### Cache Invalidation Triggers

1. Role assignment changes (PractitionerRole update)
2. Role definition changes (AccessPolicy update)
3. User logout/login
4. Cross-tab storage event
5. 10-minute maximum TTL safety net

---

## 5. Role Template Mapping

### Decision: 16 Predefined Role Templates

**Rationale**: Maps directly to legacy personnel types while allowing customization.

### Role Templates

| Template Code | Base Permissions | Department Scoped |
|---------------|------------------|-------------------|
| owner | All permissions | No |
| admin | All except delete-patient, delete-encounter | No |
| physician | Clinical read/write, no admin | Yes |
| nurse | Clinical read, limited write | Yes |
| registrar | Patient registration only | No |
| laboratory | Lab orders/results | Yes |
| cashier | Billing/payments | No |
| hrManager | User management | No |
| seniorNurse | Clinical + nursing admin | Yes |
| pharmacyManager | Pharmacy operations | No |
| viewAdmin | Read-only all | No |
| accounting | Financial reports | No |
| manager | Department management | Yes |
| operator | Data entry | Yes |
| externalOrg | Limited external access | Yes |
| technician | Equipment/diagnostic | Yes |

---

## 6. Audit Logging Strategy

### Decision: DICOM-Coded AuditEvent for All Access

**Rationale**: HIPAA requires complete audit trail; DICOM codes provide standardized categorization.

### Audit Event Types

| Action | DICOM Code | Logged When |
|--------|------------|-------------|
| Permission grant | DCM 110136 | Role assignment |
| Permission revoke | DCM 110137 | Role removal/deactivation |
| Access attempt | DCM 110110 | Every permission check |
| Access denied | DCM 110111 | Failed permission check |
| Emergency access | DCM 110113 | Break-glass scenario |
| Policy change | DCM 110114 | AccessPolicy modification |

### Retention

- Minimum: 6 years (HIPAA requirement)
- Configurable per deployment
- Indexed by user, resource, timestamp

---

## 7. Performance Considerations

### Target Metrics

| Metric | Target | Strategy |
|--------|--------|----------|
| Permission check latency | <50ms | In-memory cache, batch fetching |
| Concurrent users | 1000+ | Request deduplication, connection pooling |
| Cache hit rate | >90% | 5-10s TTL, preload common permissions |
| Error rate | <0.1% | Fail-closed, circuit breaker |

### Optimization Patterns

1. **Batch Permission Loading**: Load all user permissions on login, not per-check
2. **Request Deduplication**: Prevent duplicate API calls for same permission
3. **Precomputed Role Permissions**: Materialize role→permissions mapping on role save

---

## 8. Limitations and Mitigations

| Limitation | Mitigation |
|------------|------------|
| Criteria evaluation is expensive | Keep criteria simple, avoid complex FHIRPath |
| Parameters set at login | Require re-login on department change |
| No automatic AccessPolicy auditing | Create AuditEvent on every policy change |
| Cache might be stale | Short TTL (5-10s), immediate invalidation on role change |

---

## References

- Medplum AccessPolicy: https://www.medplum.com/docs/access/access-policies
- FHIR Security: https://hl7.org/fhir/security.html
- HIPAA Security Rule: https://www.hhs.gov/hipaa/for-professionals/security
- Healthcare RBAC: https://pmc.ncbi.nlm.nih.gov/articles/PMC5836325/
- SMART on FHIR: https://docs.smarthealthit.org/authorization/best-practices/
