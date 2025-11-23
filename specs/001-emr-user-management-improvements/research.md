# Research: EMR User Management Improvements

**Feature**: 001-emr-user-management-improvements
**Date**: 2025-11-23
**Status**: Complete

## Research Summary

All technical decisions have been resolved based on the existing codebase patterns and Medplum/FHIR best practices.

---

## 1. Invitation Status Tracking

### Decision
Use Medplum's existing Invite resource with custom status tracking via meta tags.

### Rationale
- Medplum Invite API creates invitations with tokens and expiry
- Status can be derived from: createdAt (pending/expired), user activation (accepted), email bounce webhooks (bounced)
- No custom FHIR extensions needed

### Alternatives Considered
1. **Custom extension on Practitioner** - Rejected: Adds complexity, Invite already exists
2. **Separate InvitationStatus resource** - Rejected: Not a standard FHIR resource
3. **ProjectMembership status field** - Rejected: Limited status granularity

### Implementation Pattern
```typescript
type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'bounced' | 'cancelled';

function getInvitationStatus(invite: Invite, user?: User): InvitationStatus {
  if (!invite) return 'pending';
  if (user?.activated) return 'accepted';
  if (isExpired(invite.meta?.lastUpdated, 7)) return 'expired';
  if (invite.meta?.tag?.some(t => t.code === 'bounced')) return 'bounced';
  return 'pending';
}
```

---

## 2. Audit Log Implementation

### Decision
Use standard FHIR AuditEvent resources with DICOM audit trail codes.

### Rationale
- AuditEvent is the FHIR standard for audit logging
- DICOM codes (DCM 110100-110137) are healthcare standard
- Medplum already creates some AuditEvents automatically
- Extends existing pattern rather than creating new one

### Alternatives Considered
1. **Custom logging table** - Rejected: Not FHIR-compliant, harder to query
2. **External audit service (Splunk, ELK)** - Rejected: Adds infrastructure complexity
3. **Bot-triggered logging** - Rejected: Redundant with AuditEvent

### HIPAA-Required Fields Mapping
| HIPAA Field | AuditEvent Path |
|-------------|-----------------|
| Timestamp | recorded |
| Actor | agent[].who.display |
| Action | action (C/R/U/D/E) |
| Resource Type | entity[].type.code |
| Entity ID | entity[].what.reference |
| Outcome | outcome (0=success, 4=minor, 8=serious, 12=major) |
| IP Address | source.observer.display or extension |

---

## 3. Permission Matrix & AccessPolicy

### Decision
Build visual UI that reads/writes AccessPolicy resources directly using Medplum's permission system.

### Rationale
- AccessPolicy is Medplum's native RBAC mechanism
- Resource-level permissions already supported (resourceType, readonly, criteria)
- No custom permission system needed

### Alternatives Considered
1. **Custom permission table** - Rejected: Duplicates Medplum functionality
2. **Role-based hardcoded permissions** - Rejected: Not flexible for admin customization
3. **SMART on FHIR scopes only** - Rejected: Too coarse-grained for EMR needs

### Permission Matrix Structure
```typescript
interface PermissionCell {
  resourceType: string; // Patient, Observation, etc.
  operation: 'create' | 'read' | 'update' | 'delete' | 'search';
  allowed: boolean;
  inherited?: boolean; // From parent role
}

// Auto-dependency resolution
const DEPENDENCIES: Record<string, string[]> = {
  'create': ['read'],
  'update': ['read'],
  'delete': ['read'],
  'search': ['read'],
};
```

---

## 4. Server-Side Pagination

### Decision
Use FHIR search parameters `_count`, `_offset`, and `_total` with Medplum client.

### Rationale
- FHIR standard pagination approach
- Medplum server supports these parameters
- Consistent with existing Patient/Encounter search patterns

### Alternatives Considered
1. **Client-side filtering** - Rejected: Doesn't scale beyond 100 accounts
2. **GraphQL pagination** - Rejected: Adds complexity, FHIR REST sufficient
3. **Virtual scrolling only** - Rejected: Still loads all data

### Implementation Pattern
```typescript
interface PaginationParams {
  page: number;
  pageSize: number; // 10, 20, 50, 100
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

const searchParams = {
  _count: pageSize.toString(),
  _offset: ((page - 1) * pageSize).toString(),
  _total: 'accurate',
  _sort: sortDirection === 'desc' ? `-${sortField}` : sortField,
};
```

---

## 5. Bulk Operations

### Decision
Process operations sequentially with progress tracking and rollback on failure.

### Rationale
- Medplum doesn't support FHIR batch/transaction for all operations
- Sequential processing allows per-item error handling
- Progress feedback improves UX for long operations

### Alternatives Considered
1. **FHIR Bundle transaction** - Rejected: Not all operations supported in batch
2. **Parallel processing** - Rejected: Rate limiting concerns, harder error handling
3. **Background job queue** - Rejected: Overkill for <100 items, adds complexity

### Implementation Pattern
```typescript
interface BulkOperationResult {
  total: number;
  successful: number;
  failed: number;
  errors: { id: string; error: string }[];
}

async function bulkDeactivate(
  medplum: MedplumClient,
  practitionerIds: string[],
  onProgress: (current: number, total: number) => void
): Promise<BulkOperationResult>
```

---

## 6. Export Functionality

### Decision
Client-side export using xlsx library for Excel and native CSV generation.

### Rationale
- Filtered data already in browser memory
- xlsx library (SheetJS) is mature and well-supported
- No server changes required

### Alternatives Considered
1. **Server-side export** - Rejected: Adds API complexity, client-side sufficient
2. **PDF export** - Rejected: Out of scope, can add later
3. **FHIR Bulk Data Export ($export)** - Rejected: Overkill for filtered table data

### Implementation Pattern
```typescript
import * as XLSX from 'xlsx';

function exportToExcel(data: AccountRow[], filename: string, metadata: ExportMetadata) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Accounts');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
```

---

## 7. UX Enhancements

### Decision
Use Mantine's built-in components (Skeleton, Empty, Notification) with custom animations.

### Rationale
- Mantine already provides skeleton and empty state patterns
- Consistent with existing EMR UI
- Minimal custom code needed

### Keyboard Shortcuts Implementation
```typescript
import { useHotkeys } from '@mantine/hooks';

useHotkeys([
  ['mod+K', () => searchInputRef.current?.focus()],
  ['mod+N', () => setCreateModalOpened(true)],
  ['mod+/', () => setShortcutsHelpOpened(true)],
  ['Escape', () => clearSelection()],
]);
```

---

## 8. Filter Preset Storage

### Decision
Store filter presets in localStorage with JSON serialization.

### Rationale
- Simple, no server changes needed
- Presets are user-specific, not shared
- localStorage persists across sessions

### Alternatives Considered
1. **Server-side storage (UserConfiguration)** - Rejected: Adds API complexity
2. **URL query parameters** - Rejected: Long URLs, not persistent
3. **IndexedDB** - Rejected: Overkill for small JSON objects

### Implementation Pattern
```typescript
interface FilterPreset {
  id: string;
  name: string;
  filters: AccountSearchFilters;
  createdAt: string;
}

const STORAGE_KEY = 'emr-account-filter-presets';

function savePreset(preset: FilterPreset) {
  const presets = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  presets.push(preset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}
```

---

## Dependencies Summary

| Dependency | Version | Purpose | Already in Project |
|------------|---------|---------|-------------------|
| @medplum/core | ^3.x | FHIR client | Yes |
| @medplum/react-hooks | ^3.x | React hooks | Yes |
| @medplum/fhirtypes | ^3.x | Type definitions | Yes |
| @mantine/core | ^7.x | UI components | Yes |
| @mantine/hooks | ^7.x | useHotkeys, useDisclosure | Yes |
| xlsx | ^0.18.x | Excel export | **NEW** |

### New Dependency: xlsx

**Decision**: Add xlsx (SheetJS) for Excel export functionality.

**Rationale**:
- Industry standard library for Excel file generation
- MIT licensed, well-maintained
- Small bundle impact (~300KB minified)
- Already commonly used in EMR systems

**Alternatives Rejected**:
- exceljs: Larger bundle size
- Native CSV only: Users specifically requested Excel format

---

## Resolved Clarifications

All technical context items have been resolved. No NEEDS CLARIFICATION markers remain.

| Item | Resolution |
|------|------------|
| Invitation status tracking | Use Invite resource with derived status |
| Audit log storage | Standard FHIR AuditEvent resources |
| Permission management | Direct AccessPolicy manipulation |
| Pagination approach | FHIR search params (_count, _offset) |
| Bulk operation strategy | Sequential with progress tracking |
| Export library | xlsx (SheetJS) for Excel |
| Filter preset storage | localStorage |
