# Quickstart: EMR User Management Improvements

**Feature**: 001-emr-user-management-improvements
**Date**: 2025-11-23

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose running
- Medplum server running locally (see main README)

## Setup

### 1. Install Dependencies

```bash
# From repository root
npm install

# Install new dependency for Excel export
cd packages/app
npm install xlsx
```

### 2. Start Development Server

```bash
# From repository root
docker-compose up -d  # Start PostgreSQL + Redis
npm run build:fast    # Build core packages
cd packages/app
npm run dev          # Start development server
```

### 3. Access the Application

- Open http://localhost:3000
- Navigate to `/emr/account-management`

## Development Workflow

### Running Tests

```bash
# Run all account management tests
cd packages/app
npm test -- account-management

# Run specific component test
npm test -- InvitationStatusBadge.test.tsx
npm test -- PermissionMatrix.test.tsx
npm test -- AuditLogTable.test.tsx

# Run with coverage
npm test -- --coverage account-management

# Watch mode for active development
npm test -- --watch account-management
```

### Type Checking

```bash
# From packages/app
npm run typecheck
```

### Linting

```bash
# From repository root
npm run lint
npm run lint:fix  # Auto-fix issues
```

## File Locations

### New Components to Create

```
packages/app/src/emr/components/account-management/
├── InvitationStatusBadge.tsx       # Invitation status display
├── InvitationStatusBadge.test.tsx
├── ActivationLinkModal.tsx         # Manual link generation
├── ActivationLinkModal.test.tsx
├── PermissionMatrix.tsx            # Visual permission editor
├── PermissionMatrix.test.tsx
├── PermissionPreview.tsx           # Multi-role permission view
├── PermissionPreview.test.tsx
├── RoleConflictAlert.tsx           # Conflict detection alert
├── RoleConflictAlert.test.tsx
├── AuditLogTable.tsx               # Audit log display
├── AuditLogTable.test.tsx
├── AuditLogFilters.tsx             # Audit filtering controls
├── AuditLogFilters.test.tsx
├── AccountAuditTimeline.tsx        # Per-account audit history
├── AccountAuditTimeline.test.tsx
├── BulkActionBar.tsx               # Bulk operations toolbar
├── BulkActionBar.test.tsx
├── AdvancedFiltersPanel.tsx        # Advanced search filters
├── AdvancedFiltersPanel.test.tsx
├── FilterPresetSelect.tsx          # Saved filter presets
├── FilterPresetSelect.test.tsx
├── EmptyState.tsx                  # Empty state illustrations
├── EmptyState.test.tsx
├── TableSkeleton.tsx               # Loading skeletons
├── TableSkeleton.test.tsx
└── KeyboardShortcutsHelp.tsx       # Shortcut help modal
└── KeyboardShortcutsHelp.test.tsx
```

### New Services to Create

```
packages/app/src/emr/services/
├── invitationService.ts            # Invite status and resend
├── invitationService.test.ts
├── auditService.ts                 # AuditEvent operations
├── auditService.test.ts
├── permissionService.ts            # AccessPolicy operations
├── permissionService.test.ts
├── exportService.ts                # Excel/CSV export
└── exportService.test.ts
```

### Files to Modify

```
packages/app/src/emr/
├── views/account-management/AccountManagementView.tsx  # Add audit tab, enhance
├── components/account-management/AccountTable.tsx      # Add pagination, bulk
├── components/account-management/AccountForm.tsx       # Add welcome message
├── services/accountService.ts                          # Add pagination, bulk
├── hooks/useAccountManagement.ts                       # Enhance with pagination
└── types/account-management.ts                         # Add new types
```

## Testing Patterns

### Component Test Example

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MedplumProvider } from '@medplum/react-hooks';
import { MantineProvider } from '@mantine/core';
import { MockClient } from '@medplum/mock';
import { InvitationStatusBadge } from './InvitationStatusBadge';

describe('InvitationStatusBadge', () => {
  let medplum: MockClient;

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <MantineProvider>
        <MemoryRouter>
          <MedplumProvider medplum={medplum}>
            {component}
          </MedplumProvider>
        </MemoryRouter>
      </MantineProvider>
    );
  };

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  it('should display pending status', () => {
    renderWithProviders(<InvitationStatusBadge status="pending" />);
    expect(screen.getByText(/pending|მოლოდინში/i)).toBeInTheDocument();
  });

  it('should display expired status with warning color', () => {
    renderWithProviders(<InvitationStatusBadge status="expired" />);
    const badge = screen.getByText(/expired|ვადაგასული/i);
    expect(badge).toHaveClass('mantine-Badge-root');
    // Check for warning/orange color
  });
});
```

### Service Test Example

```typescript
import { MockClient } from '@medplum/mock';
import { searchAuditEvents, createAuditEvent } from './auditService';

describe('auditService', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
  });

  it('should search audit events with filters', async () => {
    const result = await searchAuditEvents(medplum, {
      dateFrom: new Date('2025-11-01'),
      dateTo: new Date('2025-11-23'),
      action: 'U',
    }, { page: 1, pageSize: 20 });

    expect(result.events).toBeDefined();
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it('should create audit event for account update', async () => {
    const event = await createAuditEvent(medplum, 'U', {
      reference: 'Practitioner/123',
    }, 0);

    expect(event.resourceType).toBe('AuditEvent');
    expect(event.action).toBe('U');
    expect(event.outcome).toBe('0');
  });
});
```

## Common Commands

```bash
# Clean build
npm run clean && npm run build

# Run only this feature's tests
npm test -- account-management --coverage

# Generate new component with test
# (manually create files following patterns above)

# Check for type errors
npm run typecheck

# Format code
npm run prettier:fix

# Start Storybook for component development
npm run storybook
```

## Translation Keys

Add to `packages/app/src/emr/translations/`:

### ka.json (Georgian)

```json
{
  "accountManagement.invitation.pending": "მოლოდინში",
  "accountManagement.invitation.accepted": "აქტივირებული",
  "accountManagement.invitation.expired": "ვადაგასული",
  "accountManagement.invitation.bounced": "მიუწვდომელი",
  "accountManagement.invitation.resend": "ხელახლა გაგზავნა",
  "accountManagement.invitation.generateLink": "ბმულის გენერაცია",
  "accountManagement.audit.title": "აუდიტი",
  "accountManagement.audit.timestamp": "თარიღი",
  "accountManagement.audit.actor": "მომხმარებელი",
  "accountManagement.audit.action": "მოქმედება",
  "accountManagement.audit.entity": "რესურსი",
  "accountManagement.audit.outcome": "შედეგი",
  "accountManagement.permissions.title": "უფლებები",
  "accountManagement.permissions.matrix": "უფლებების მატრიცა",
  "accountManagement.bulk.selectAll": "ყველას მონიშვნა",
  "accountManagement.bulk.deactivate": "დეაქტივაცია",
  "accountManagement.bulk.assignRole": "როლის მინიჭება",
  "accountManagement.export.excel": "Excel-ში ექსპორტი",
  "accountManagement.export.csv": "CSV-ში ექსპორტი"
}
```

## Environment Variables

No new environment variables required. Uses existing Medplum configuration.

## Troubleshooting

### Tests failing with "MedplumClient not found"

Ensure component is wrapped with `MedplumProvider`:
```tsx
<MedplumProvider medplum={mockMedplum}>
  <YourComponent />
</MedplumProvider>
```

### Mantine styles not loading in tests

Wrap with `MantineProvider`:
```tsx
<MantineProvider>
  <YourComponent />
</MantineProvider>
```

### TypeScript errors for FHIR types

Import from `@medplum/fhirtypes`:
```typescript
import type { Practitioner, AuditEvent, AccessPolicy } from '@medplum/fhirtypes';
```

### xlsx import errors

If ES module issues occur:
```typescript
// Use dynamic import
const XLSX = await import('xlsx');
```
