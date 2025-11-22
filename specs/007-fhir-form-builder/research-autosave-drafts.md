# Auto-Save, Draft Recovery, and Offline-First Form Systems Research

**Document Version**: 1.0
**Research Date**: 2025-11-21
**Target Application**: FHIR Form Builder for MediMind EMR
**Compiled By**: Claude Code Research Agent

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Auto-Save Patterns](#auto-save-patterns)
3. [Draft Storage Strategies](#draft-storage-strategies)
4. [Offline-First Architectures](#offline-first-architectures)
5. [Draft Recovery UX](#draft-recovery-ux)
6. [Performance & Scalability](#performance--scalability)
7. [Security & Privacy](#security--privacy)
8. [Code Examples](#code-examples)
9. [Implementation Recommendations](#implementation-recommendations)
10. [References](#references)

---

## Executive Summary

This research document provides comprehensive guidance on implementing auto-save, draft recovery, and offline-first capabilities for FHIR-compliant healthcare forms in the MediMind EMR system. Key findings include:

**Critical Insights:**
- **Throttle over Debounce**: For auto-save, throttle (regular intervals) is safer than debounce (wait until typing stops) to prevent data loss
- **Recommended Auto-Save Interval**: 2-5 seconds throttle with 30-second backup interval
- **Storage Strategy**: localStorage for simple drafts (<5MB), IndexedDB for complex forms with rich media
- **Conflict Resolution**: Operational Transformation (OT) for real-time collaboration, Last-Write-Wins (LWW) for simpler use cases
- **Draft Expiration**: 30-day TTL with automatic cleanup on app startup
- **HIPAA Compliance**: AES-256 encryption for draft storage, secure transmission, audit trails

**Architecture Decision Matrix:**

| Feature | Simple Forms | Complex Forms | Multi-User Forms |
|---------|-------------|---------------|------------------|
| Auto-Save | Throttle (3s) | Throttle (5s) + Interval (30s) | OT/CRDT |
| Storage | localStorage | IndexedDB | Server + IndexedDB |
| Recovery UX | Toast notification | Modal with preview | Conflict resolution modal |
| Offline Support | Service Worker cache | PouchDB sync | CouchDB replication |

---

## Auto-Save Patterns

### 1.1 Timing Strategies

#### **Debounce vs. Throttle**

**Debounce** (Wait until user stops typing):
```
User types: "H" "e" "l" "l" "o"
Time:       0s  0.1s 0.2s 0.3s 0.4s | 2.4s (save triggered)
                                     ↑ 2 seconds of inactivity
```

**Throttle** (Save at regular intervals):
```
User types: "H" "e" "l" "l" "o" "w" "o" "r" "l" "d"
Time:       0s  0.5s 1s  1.5s 2s  2.5s 3s  3.5s 4s  4.5s
Saves:          ✓(0s)         ✓(3s)              ✓(6s)
```

**Industry Consensus**: **Throttle is superior for auto-save** because:
- Prevents data loss if user navigates away quickly
- Regular periodic saves ensure recovery points even during continuous editing
- Debounce risks losing entire paragraphs if user types fast and leaves immediately

**Timing Recommendations:**

| Use Case | Strategy | Interval | Rationale |
|----------|----------|----------|-----------|
| Text inputs | Throttle | 2-3 seconds | Balance between API calls and data safety |
| Rich text editors | Throttle + Backup | 5s (throttle) + 30s (interval) | Dual safety: frequent saves + guaranteed periodic backup |
| Simple forms | Debounce | 2 seconds | Fewer fields, less risk |
| FHIR Questionnaires | Throttle | 3-5 seconds | Medical data requires highest safety |

#### **Hybrid Approach (Recommended for MediMind)**

```typescript
// Combine throttle (frequent) + interval (guaranteed backup)
const AUTO_SAVE_THROTTLE = 5000;  // 5 seconds throttle
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds guaranteed backup

// Throttle: saves on user input (max once per 5s)
const throttledSave = throttle(saveDraft, AUTO_SAVE_THROTTLE);

// Interval: guaranteed save every 30s even if no changes
const intervalSave = setInterval(saveDraft, AUTO_SAVE_INTERVAL);
```

**Benefits:**
- Fast response to user changes (5s throttle)
- Guaranteed recovery point every 30 seconds
- Prevents data loss from browser crashes or unexpected navigation

---

### 1.2 Optimistic UI Updates

**Definition**: Update UI immediately before server confirmation, assuming success.

**Implementation Pattern:**

```typescript
// 1. Update UI immediately (optimistic)
setFormData(newData);
setSaveStatus('saving');
setLastSaved(new Date());

try {
  // 2. Send to server in background
  await saveToServer(newData);

  // 3. Confirm success
  setSaveStatus('saved');

} catch (error) {
  // 4. Rollback on failure
  setFormData(previousData);
  setSaveStatus('error');
  showErrorNotification('Failed to save. Changes reverted.');
}
```

**Visual States:**

```
┌─────────────────────────────────────┐
│ Idle State (no changes)             │
│ ○ No indicator shown                │
└─────────────────────────────────────┘
           ↓ User types
┌─────────────────────────────────────┐
│ Saving... (optimistic update)       │
│ ◐ Spinner + "Saving changes..."     │
│   Form: 50% opacity                 │
└─────────────────────────────────────┘
           ↓ Server confirms
┌─────────────────────────────────────┐
│ Saved (success)                     │
│ ✓ "Saved at 2:34 PM"                │
│   Form: 100% opacity                │
│   Auto-hide after 3 seconds         │
└─────────────────────────────────────┘
           ↓ Server error
┌─────────────────────────────────────┐
│ Error (failure)                     │
│ ⚠ "Failed to save. Retry?"          │
│   [Retry] [Dismiss]                 │
│   Form: reverted to last saved      │
└─────────────────────────────────────┘
```

**Best Practices:**
- Use 50% opacity during save to indicate "pending" state
- Show spinner only for first 500ms (avoid flashing for fast saves)
- Auto-hide success message after 3 seconds
- Keep error messages visible until user action

---

### 1.3 Conflict Resolution

**Scenario**: Multiple users editing the same form simultaneously.

#### **Strategy 1: Last-Write-Wins (LWW) - Simple**

```typescript
interface DraftMetadata {
  version: number;           // Increments with each save
  lastModified: string;      // ISO timestamp
  lastModifiedBy: string;    // User ID
}

// On save
const currentDraft = await fetchDraft(formId);
if (currentDraft.version > localDraft.version) {
  // Conflict detected!
  showConflictModal({
    current: currentDraft,
    local: localDraft,
    options: ['overwrite', 'merge', 'cancel']
  });
} else {
  // Safe to save
  await saveDraft({
    ...localDraft,
    version: currentDraft.version + 1
  });
}
```

**Pros:** Simple, easy to implement
**Cons:** Data loss risk if users choose "overwrite"

#### **Strategy 2: Operational Transformation (OT) - Advanced**

Used by Google Docs, enables real-time collaboration.

```typescript
// Example: Two users editing "abc"
// User A: Insert "x" at position 0 → "xabc"
// User B: Delete "c" at position 2 → "ab"

// Without OT: "xab" (User A) vs "ab" (User B) - conflict!
// With OT: Transform User B's operation given User A's insert
//   Original delete position: 2
//   After transformation: 3 (adjust for inserted "x")
//   Result: "xab" (both users converge to same state)

const transformDelete = (deleteOp, insertOp) => {
  if (insertOp.position <= deleteOp.position) {
    return { ...deleteOp, position: deleteOp.position + 1 };
  }
  return deleteOp;
};
```

**Pros:** No data loss, real-time collaboration
**Cons:** Complex implementation, requires WebSocket infrastructure

#### **Strategy 3: Session-Based Prevention (Recommended for MediMind)**

```typescript
// Prevent conflicts by locking form to single session
interface FormSession {
  sessionId: string;         // Generated on form load
  userId: string;
  expiresAt: string;         // 30 minutes
}

// On form load
const session = await acquireFormLock(formId, userId);
if (!session.acquired) {
  showWarning(
    `${session.currentUser} is currently editing this form. ` +
    `You can view in read-only mode or wait until they finish.`
  );
  setReadOnlyMode(true);
}

// On save (within same session)
await saveDraft(formId, data, session.sessionId);
// Skip conflict check if sessionId matches
```

**Pros:** Prevents conflicts, simple to implement
**Cons:** Limits concurrent editing (acceptable for medical forms)

---

### 1.4 Undo/Redo with Auto-Save

**Challenge**: Undo/redo requires state history, but auto-save sends data to server.

**Solution**: Separate local history from server drafts.

```typescript
interface HistoryManager {
  past: FormData[];          // Undo stack
  present: FormData;         // Current state
  future: FormData[];        // Redo stack
}

const useUndoRedo = () => {
  const [history, setHistory] = useState<HistoryManager>({
    past: [],
    present: initialFormData,
    future: []
  });

  const addToHistory = (newData: FormData) => {
    setHistory({
      past: [...history.past, history.present],
      present: newData,
      future: [] // Clear redo stack on new change
    });

    // Auto-save happens independently
    throttledAutoSave(newData);
  };

  const undo = () => {
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    setHistory({
      past: history.past.slice(0, -1),
      present: previous,
      future: [history.present, ...history.future]
    });

    // Save the undo state
    throttledAutoSave(previous);
  };

  const redo = () => {
    if (history.future.length === 0) return;

    const next = history.future[0];
    setHistory({
      past: [...history.past, history.present],
      present: next,
      future: history.future.slice(1)
    });

    // Save the redo state
    throttledAutoSave(next);
  };

  return { undo, redo, canUndo: history.past.length > 0, canRedo: history.future.length > 0 };
};
```

**Command Pattern Alternative** (for complex forms):

```typescript
interface Command {
  execute: () => void;
  undo: () => void;
}

class UpdateFieldCommand implements Command {
  constructor(
    private fieldPath: string,
    private oldValue: any,
    private newValue: any,
    private formState: FormData
  ) {}

  execute() {
    set(this.formState, this.fieldPath, this.newValue);
    throttledAutoSave(this.formState);
  }

  undo() {
    set(this.formState, this.fieldPath, this.oldValue);
    throttledAutoSave(this.formState);
  }
}

// Usage
const command = new UpdateFieldCommand('patient.name', 'John', 'Jane', formState);
commandManager.execute(command); // Can undo later
```

---

### 1.5 Visual Indicators for Save Status

**Design System Guidelines** (from Primer, GitLab Pajamas, Nielsen Norman Group):

#### **Status States:**

```tsx
// Save status indicator component
const SaveStatusIndicator: React.FC<{ status: SaveStatus }> = ({ status }) => {
  const configs = {
    idle: {
      icon: null,
      text: '',
      color: 'transparent'
    },
    saving: {
      icon: <Spinner size="sm" />,
      text: 'Saving changes...',
      color: 'blue',
      opacity: 0.5 // Dim form during save
    },
    saved: {
      icon: <CheckCircle />,
      text: `Saved at ${formatTime(lastSaved)}`,
      color: 'green',
      autoHide: 3000 // Hide after 3 seconds
    },
    error: {
      icon: <AlertTriangle />,
      text: 'Failed to save. Retry?',
      color: 'red',
      actions: [
        { label: 'Retry', onClick: retrySave },
        { label: 'Dismiss', onClick: dismissError }
      ]
    }
  };

  return (
    <div className={`save-indicator ${configs[status].color}`}>
      {configs[status].icon}
      <span>{configs[status].text}</span>
      {configs[status].actions?.map(action => (
        <Button key={action.label} onClick={action.onClick}>
          {action.label}
        </Button>
      ))}
    </div>
  );
};
```

#### **Color Conventions:**

| Color | Meaning | Use Case |
|-------|---------|----------|
| Blue | Informational, In Progress | "Saving..." |
| Green | Success | "Saved at 2:34 PM" |
| Yellow | Warning | "Draft saved locally (offline)" |
| Orange | Serious Warning | "Conflict detected" |
| Red | Error, Danger | "Failed to save" |

#### **Placement Options:**

**Option 1: Floating Bottom-Right** (Recommended)
```
┌──────────────────────────────────────┐
│                                      │
│   [Form Content]                     │
│                                      │
│                                      │
│                      ┌──────────────┐│
│                      │ ✓ Saved 2:34 ││
│                      └──────────────┘│
└──────────────────────────────────────┘
```

**Option 2: Inline with Save Button**
```
┌──────────────────────────────────────┐
│                                      │
│   [Form Content]                     │
│                                      │
│   ◐ Saving...    [Save] [Cancel]    │
└──────────────────────────────────────┘
```

**Option 3: Fixed Top Bar** (For long forms)
```
┌──────────────────────────────────────┐
│ ✓ Saved at 2:34 PM                   │
├──────────────────────────────────────┤
│                                      │
│   [Scrollable Form Content]          │
│                                      │
└──────────────────────────────────────┘
```

**Accessibility:**
- Use `aria-live="polite"` for save status updates
- Provide screen reader text: "Form auto-saved at 2:34 PM"
- Don't rely solely on color (use icons + text)

---

## Draft Storage Strategies

### 2.1 localStorage vs. IndexedDB Comparison

| Feature | localStorage | IndexedDB |
|---------|--------------|-----------|
| **Storage Capacity** | 5-10 MB | Hundreds of MB to GB |
| **Data Types** | Strings only (JSON) | Binary, Blob, File, structured objects |
| **API** | Synchronous (blocks UI) | Asynchronous (non-blocking) |
| **Querying** | Key-value only | Complex queries with indexes |
| **Service Workers** | Not accessible | Accessible (offline support) |
| **Performance (writes)** | 10x faster | Slower but doesn't block DOM |
| **Use Case** | Simple drafts (<5MB) | Complex forms, rich media |

**Decision Matrix for MediMind:**

```typescript
// Simple text-based forms → localStorage
interface SimpleDraft {
  formId: string;
  data: Record<string, string | number | boolean>;
  metadata: {
    version: number;
    lastModified: string;
    expiresAt: string;
  };
}

// Complex forms with attachments → IndexedDB
interface ComplexDraft {
  formId: string;
  data: Record<string, any>;
  attachments: File[];      // Binary data (images, PDFs)
  richText: Blob;           // Rich text editor content
  metadata: DraftMetadata;
}
```

---

### 2.2 localStorage Implementation with Expiration

**Pattern: TTL (Time To Live) with 30-day expiration**

```typescript
interface StoredDraft<T> {
  value: T;
  expiresAt: number; // Unix timestamp (ms)
}

class LocalStorageDraftManager<T> {
  private readonly TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  // Save draft with expiration
  saveDraft(key: string, value: T): void {
    const draft: StoredDraft<T> = {
      value,
      expiresAt: Date.now() + this.TTL_MS
    };

    try {
      localStorage.setItem(key, JSON.stringify(draft));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        this.handleQuotaExceeded();
      }
      throw error;
    }
  }

  // Get draft (returns null if expired)
  getDraft(key: string): T | null {
    const item = localStorage.getItem(key);
    if (!item) return null;

    try {
      const draft: StoredDraft<T> = JSON.parse(item);

      // Check expiration
      if (Date.now() >= draft.expiresAt) {
        localStorage.removeItem(key); // Auto-cleanup
        return null;
      }

      return draft.value;
    } catch {
      return null;
    }
  }

  // Cleanup expired drafts (run on app startup)
  cleanupExpired(): number {
    let cleaned = 0;
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      if (key.startsWith('draft_')) {
        const draft = this.getDraft(key);
        if (draft === null) cleaned++;
      }
    }

    return cleaned;
  }

  // Handle quota exceeded
  private handleQuotaExceeded(): void {
    // Strategy 1: Remove oldest drafts
    const drafts = this.getAllDrafts();
    const sorted = drafts.sort((a, b) => a.expiresAt - b.expiresAt);

    // Remove oldest 20%
    const toRemove = Math.ceil(sorted.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(sorted[i].key);
    }
  }

  // Get all drafts with metadata
  private getAllDrafts(): Array<{ key: string; expiresAt: number }> {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith('draft_'))
      .map(key => {
        const draft = JSON.parse(localStorage.getItem(key)!);
        return { key, expiresAt: draft.expiresAt };
      });
  }
}

// Usage
const draftManager = new LocalStorageDraftManager<QuestionnaireResponse>();

// Save draft
draftManager.saveDraft('draft_questionnaire_123', formData);

// Get draft
const draft = draftManager.getDraft('draft_questionnaire_123');

// Cleanup on app startup
useEffect(() => {
  const cleaned = draftManager.cleanupExpired();
  console.log(`Cleaned ${cleaned} expired drafts`);
}, []);
```

**Key Features:**
- Automatic expiration after 30 days
- Auto-cleanup when retrieving expired drafts
- Quota exceeded handling (remove oldest 20%)
- Type-safe with TypeScript generics

---

### 2.3 IndexedDB Implementation for Complex Forms

**Use Cases:**
- Forms with file attachments (images, PDFs, scans)
- Rich text editor content with embedded media
- Large forms with 100+ fields
- Offline-first scenarios requiring sync

**Schema Design:**

```typescript
// IndexedDB schema for FHIR QuestionnaireResponse drafts
interface DraftSchema {
  id: string;                      // Primary key: 'draft_{questionnaireId}_{patientId}'
  questionnaireId: string;         // Index: search by questionnaire
  patientId: string;               // Index: search by patient
  status: 'draft' | 'in-progress' | 'completed';
  data: QuestionnaireResponse;     // Full FHIR resource
  attachments: Array<{
    id: string;
    file: File;                    // Binary data
    linkId: string;                // Question linkId
  }>;
  metadata: {
    version: number;
    createdAt: string;
    lastModified: string;
    expiresAt: string;
    lastModifiedBy: string;
    deviceInfo: string;
  };
}
```

**Implementation:**

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface DraftDB extends DBSchema {
  drafts: {
    key: string;
    value: DraftSchema;
    indexes: {
      'by-questionnaire': string;
      'by-patient': string;
      'by-expires': string;
    };
  };
}

class IndexedDBDraftManager {
  private db: IDBPDatabase<DraftDB> | null = null;

  // Initialize database
  async init(): Promise<void> {
    this.db = await openDB<DraftDB>('medimind-drafts', 1, {
      upgrade(db) {
        const store = db.createObjectStore('drafts', { keyPath: 'id' });
        store.createIndex('by-questionnaire', 'questionnaireId');
        store.createIndex('by-patient', 'patientId');
        store.createIndex('by-expires', 'metadata.expiresAt');
      },
    });
  }

  // Save draft
  async saveDraft(draft: DraftSchema): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('drafts', draft);
  }

  // Get draft by ID
  async getDraft(id: string): Promise<DraftSchema | undefined> {
    if (!this.db) await this.init();
    const draft = await this.db!.get('drafts', id);

    // Check expiration
    if (draft && new Date(draft.metadata.expiresAt) < new Date()) {
      await this.deleteDraft(id);
      return undefined;
    }

    return draft;
  }

  // Get all drafts for a patient
  async getDraftsByPatient(patientId: string): Promise<DraftSchema[]> {
    if (!this.db) await this.init();
    return this.db!.getAllFromIndex('drafts', 'by-patient', patientId);
  }

  // Delete draft
  async deleteDraft(id: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.delete('drafts', id);
  }

  // Cleanup expired drafts
  async cleanupExpired(): Promise<number> {
    if (!this.db) await this.init();
    const now = new Date().toISOString();
    const expired = await this.db!.getAllFromIndex('drafts', 'by-expires', IDBKeyRange.upperBound(now));

    for (const draft of expired) {
      await this.deleteDraft(draft.id);
    }

    return expired.length;
  }

  // Estimate storage usage
  async estimateStorage(): Promise<{ usage: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { usage: 0, quota: 0 };
  }
}

// Usage
const draftManager = new IndexedDBDraftManager();

// Save draft with attachment
await draftManager.saveDraft({
  id: 'draft_q123_p456',
  questionnaireId: 'Questionnaire/123',
  patientId: 'Patient/456',
  status: 'draft',
  data: questionnaireResponse,
  attachments: [{
    id: 'att_001',
    file: imageFile, // Binary File object
    linkId: '2.3'
  }],
  metadata: {
    version: 1,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastModifiedBy: 'Practitioner/789',
    deviceInfo: navigator.userAgent
  }
});
```

**Benefits:**
- Non-blocking asynchronous operations
- Complex querying (by patient, by questionnaire, by expiration)
- Binary file storage (no base64 encoding overhead)
- Accessible from Service Workers (offline support)

---

### 2.4 Server-Side Draft Storage

**When to Use Server Storage:**
- Multi-device access (start on desktop, continue on mobile)
- Collaboration (shared drafts between team members)
- Regulatory requirements (audit trails, data retention)
- Large forms exceeding client-side storage limits

**FHIR Implementation:**

```typescript
// Store drafts as QuestionnaireResponse with status='in-progress'
interface FHIRDraft extends QuestionnaireResponse {
  status: 'in-progress'; // FHIR status for drafts
  meta: {
    tag: [
      {
        system: 'http://medimind.ge/tags',
        code: 'draft',
        display: 'Draft Response'
      }
    ];
    versionId: string;       // Optimistic locking
    lastUpdated: string;     // Auto-updated by server
  };
  extension?: [
    {
      url: 'http://medimind.ge/extensions/draft-metadata',
      extension: [
        { url: 'expiresAt', valueDateTime: string },
        { url: 'deviceInfo', valueString: string },
        { url: 'lastSyncedAt', valueDateTime: string }
      ]
    }
  ];
}

// Draft service
class FHIRDraftService {
  constructor(private medplum: MedplumClient) {}

  // Create or update draft
  async saveDraft(draft: FHIRDraft): Promise<FHIRDraft> {
    try {
      if (draft.id) {
        // Update existing draft (with version check)
        return await this.medplum.updateResource({
          ...draft,
          meta: {
            ...draft.meta,
            versionId: draft.meta.versionId // Optimistic locking
          }
        });
      } else {
        // Create new draft
        return await this.medplum.createResource({
          ...draft,
          status: 'in-progress',
          meta: {
            tag: [{
              system: 'http://medimind.ge/tags',
              code: 'draft',
              display: 'Draft Response'
            }]
          }
        });
      }
    } catch (error) {
      if (error.response?.status === 409) {
        // Version conflict - another user updated
        throw new ConflictError('Draft was modified by another user');
      }
      throw error;
    }
  }

  // Get patient's drafts
  async getPatientDrafts(patientId: string): Promise<FHIRDraft[]> {
    return this.medplum.searchResources('QuestionnaireResponse', {
      subject: `Patient/${patientId}`,
      status: 'in-progress',
      _tag: 'http://medimind.ge/tags|draft',
      _sort: '-_lastUpdated'
    });
  }

  // Delete draft (soft delete by changing status)
  async deleteDraft(draftId: string): Promise<void> {
    const draft = await this.medplum.readResource('QuestionnaireResponse', draftId);
    await this.medplum.updateResource({
      ...draft,
      status: 'stopped', // FHIR status for abandoned drafts
      meta: {
        ...draft.meta,
        tag: [
          ...(draft.meta?.tag || []),
          {
            system: 'http://medimind.ge/tags',
            code: 'abandoned',
            display: 'Abandoned Draft'
          }
        ]
      }
    });
  }

  // Cleanup expired drafts (run as scheduled job)
  async cleanupExpiredDrafts(): Promise<number> {
    const expiredDrafts = await this.medplum.searchResources('QuestionnaireResponse', {
      status: 'in-progress',
      _tag: 'http://medimind.ge/tags|draft',
      _lastUpdated: `lt${getDateDaysAgo(30)}` // Older than 30 days
    });

    for (const draft of expiredDrafts) {
      await this.deleteDraft(draft.id!);
    }

    return expiredDrafts.length;
  }
}

// Utility
function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}
```

**Advantages:**
- Multi-device access
- Automatic backups
- Version history
- Audit trails (FHIR meta.lastUpdated)
- Conflict detection via versionId

**Disadvantages:**
- Requires internet connection
- Higher latency than local storage
- Server storage costs

---

### 2.5 Hybrid Approach (Recommended for MediMind)

**Strategy**: Use both client-side and server-side storage for best of both worlds.

```typescript
class HybridDraftManager {
  constructor(
    private localManager: IndexedDBDraftManager,
    private serverManager: FHIRDraftService
  ) {}

  // Save draft (local + server)
  async saveDraft(draft: DraftSchema): Promise<void> {
    // 1. Save locally immediately (fast, offline-capable)
    await this.localManager.saveDraft(draft);

    // 2. Sync to server in background (with retry)
    try {
      const fhirDraft = this.convertToFHIR(draft);
      const saved = await this.serverManager.saveDraft(fhirDraft);

      // Update local with server version
      draft.metadata.version = parseInt(saved.meta.versionId!);
      draft.metadata.lastSyncedAt = new Date().toISOString();
      await this.localManager.saveDraft(draft);

    } catch (error) {
      // Queue for retry later (offline or server error)
      await this.queueForSync(draft.id);
    }
  }

  // Get draft (prioritize local, fallback to server)
  async getDraft(id: string): Promise<DraftSchema | null> {
    // 1. Check local storage first (fast)
    let draft = await this.localManager.getDraft(id);

    if (!draft || this.needsSync(draft)) {
      // 2. Fetch from server if not found or stale
      try {
        const serverDraft = await this.serverManager.getDraft(id);
        if (serverDraft) {
          draft = this.convertFromFHIR(serverDraft);
          await this.localManager.saveDraft(draft);
        }
      } catch (error) {
        // Server unavailable, use local
        console.warn('Server unavailable, using local draft');
      }
    }

    return draft || null;
  }

  // Background sync (run periodically)
  async syncAllDrafts(): Promise<void> {
    const pendingDrafts = await this.localManager.getPendingSyncDrafts();

    for (const draft of pendingDrafts) {
      try {
        await this.saveDraft(draft);
      } catch (error) {
        console.error(`Failed to sync draft ${draft.id}:`, error);
      }
    }
  }

  private needsSync(draft: DraftSchema): boolean {
    if (!draft.metadata.lastSyncedAt) return true;

    const lastSync = new Date(draft.metadata.lastSyncedAt);
    const now = new Date();
    const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

    return hoursSinceSync > 24; // Sync if more than 24 hours old
  }
}
```

**Benefits:**
- Instant saves (local storage)
- Cross-device access (server storage)
- Offline capability (local cache)
- Automatic sync when online

---

## Offline-First Architectures

### 3.1 Service Workers for Offline Forms

**Overview**: Service Workers intercept network requests and provide caching, enabling forms to work offline.

**Architecture:**

```
┌─────────────────────────────────────────────────────┐
│                    Browser                          │
│                                                     │
│  ┌──────────────┐      ┌──────────────────────┐  │
│  │   React App  │◄────►│   Service Worker     │  │
│  │   (UI Layer) │      │   (Network Proxy)    │  │
│  └──────────────┘      └──────────────────────┘  │
│         │                        │                 │
│         ▼                        ▼                 │
│  ┌──────────────┐      ┌──────────────────────┐  │
│  │  IndexedDB   │      │   Cache Storage      │  │
│  │  (Form Data) │      │   (Assets/API)       │  │
│  └──────────────┘      └──────────────────────┘  │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Medplum Server │
                  │  (FHIR API)     │
                  └─────────────────┘
```

**Implementation:**

```typescript
// service-worker.ts
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'medimind-forms-v1';
const API_CACHE = 'medimind-api-v1';

// Install: Cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/static/js/main.js',
        '/static/css/main.css',
        '/questionnaire-form',
        // Add more critical assets
      ]);
    })
  );
});

// Fetch: Network-first, fallback to cache
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;

  // API requests: Network-first with cache fallback
  if (request.url.includes('/api/') || request.url.includes('/fhir/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then(cached => {
            if (cached) {
              return cached;
            }
            // Return offline response
            return new Response(
              JSON.stringify({ error: 'Offline', offline: true }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Static assets: Cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request);
    })
  );
});

// Background Sync: Sync drafts when online
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-drafts') {
    event.waitUntil(syncDraftsToServer());
  }
});

async function syncDraftsToServer(): Promise<void> {
  const db = await openIndexedDB();
  const drafts = await db.getAllPendingSyncDrafts();

  for (const draft of drafts) {
    try {
      const response = await fetch('/fhir/QuestionnaireResponse', {
        method: draft.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft.data)
      });

      if (response.ok) {
        await db.markDraftAsSynced(draft.id);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

**Register Service Worker:**

```typescript
// src/index.tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('SW registered:', registration);

        // Request notification permission for sync alerts
        if ('Notification' in window) {
          Notification.requestPermission();
        }
      })
      .catch(error => {
        console.error('SW registration failed:', error);
      });
  });
}
```

---

### 3.2 Background Sync API

**Purpose**: Queue data to sync when browser goes from offline to online.

**Implementation:**

```typescript
// Request background sync
async function requestBackgroundSync(tag: string): Promise<void> {
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
  }
}

// Save draft with background sync
async function saveDraftWithSync(draft: DraftSchema): Promise<void> {
  // 1. Save locally
  await indexedDBManager.saveDraft(draft);

  // 2. Try immediate sync
  try {
    await serverManager.saveDraft(convertToFHIR(draft));
  } catch (error) {
    // 3. Queue for background sync
    await requestBackgroundSync('sync-drafts');

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Draft saved offline', {
        body: 'Your changes will sync when you\'re back online',
        icon: '/logo192.png'
      });
    }
  }
}
```

**User Experience:**

```
┌─────────────────────────────────────┐
│ Offline Mode                        │
│ ⚠ You're offline. Changes are saved │
│   locally and will sync when online.│
│                                     │
│ [Form continues to work...]         │
└─────────────────────────────────────┘

... user goes back online ...

┌─────────────────────────────────────┐
│ ✓ Back online                       │
│   Syncing 3 drafts...               │
│   ▓▓▓▓▓▓▓▓▓▓▓░░░░ 75%              │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ✓ All changes synced                │
│   3 drafts uploaded successfully    │
│   Auto-dismiss in 3 seconds         │
└─────────────────────────────────────┘
```

---

### 3.3 PouchDB + CouchDB Sync Pattern

**Overview**: PouchDB (client) syncs with CouchDB (server) for robust offline-first replication.

**Installation:**

```bash
npm install pouchdb pouchdb-find
npm install @types/pouchdb --save-dev
```

**Implementation:**

```typescript
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

interface DraftDocument {
  _id: string;                    // Format: 'draft_{questionnaireId}_{patientId}'
  _rev?: string;                  // PouchDB revision (for conflict resolution)
  type: 'draft';
  questionnaireId: string;
  patientId: string;
  data: QuestionnaireResponse;
  metadata: {
    createdAt: string;
    lastModified: string;
    expiresAt: string;
  };
}

class PouchDBDraftManager {
  private localDB: PouchDB.Database<DraftDocument>;
  private remoteDB: PouchDB.Database<DraftDocument>;
  private syncHandler: PouchDB.Replication.Sync<DraftDocument> | null = null;

  constructor(remoteURL: string) {
    // Local database
    this.localDB = new PouchDB<DraftDocument>('medimind-drafts');

    // Remote database
    this.remoteDB = new PouchDB<DraftDocument>(remoteURL, {
      fetch: (url, opts) => {
        // Add authentication
        return fetch(url, {
          ...opts,
          headers: {
            ...opts?.headers,
            Authorization: `Bearer ${getAccessToken()}`
          }
        });
      }
    });

    // Create indexes
    this.createIndexes();

    // Start continuous sync
    this.startSync();
  }

  private async createIndexes(): Promise<void> {
    await this.localDB.createIndex({
      index: { fields: ['type', 'patientId', 'metadata.lastModified'] }
    });
    await this.localDB.createIndex({
      index: { fields: ['type', 'questionnaireId'] }
    });
  }

  // Start bidirectional continuous sync
  private startSync(): void {
    this.syncHandler = this.localDB.sync(this.remoteDB, {
      live: true,
      retry: true,
      batch_size: 100
    })
      .on('change', info => {
        console.log('Sync change:', info);
        // Trigger UI update
        window.dispatchEvent(new CustomEvent('drafts-synced', { detail: info }));
      })
      .on('error', error => {
        console.error('Sync error:', error);
        // Show error notification
        showNotification('Sync failed. Changes saved locally.', 'error');
      });
  }

  // Save draft (auto-syncs)
  async saveDraft(draft: DraftDocument): Promise<PouchDB.Core.Response> {
    try {
      return await this.localDB.put(draft);
    } catch (error) {
      if (error.status === 409) {
        // Conflict - handle merge
        return await this.handleConflict(draft);
      }
      throw error;
    }
  }

  // Get draft
  async getDraft(id: string): Promise<DraftDocument | null> {
    try {
      return await this.localDB.get(id);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }

  // Get all patient drafts
  async getPatientDrafts(patientId: string): Promise<DraftDocument[]> {
    const result = await this.localDB.find({
      selector: {
        type: 'draft',
        patientId: patientId
      },
      sort: [{ 'metadata.lastModified': 'desc' }]
    });
    return result.docs;
  }

  // Handle conflict (manual resolution)
  private async handleConflict(newDraft: DraftDocument): Promise<PouchDB.Core.Response> {
    const existing = await this.localDB.get(newDraft._id, { conflicts: true });

    // Strategy: Keep newer version
    if (new Date(newDraft.metadata.lastModified) > new Date(existing.metadata.lastModified)) {
      return await this.localDB.put({
        ...newDraft,
        _rev: existing._rev // Use existing revision
      });
    } else {
      // Existing is newer, don't overwrite
      throw new Error('Draft was modified more recently on another device');
    }
  }

  // Cleanup expired drafts
  async cleanupExpired(): Promise<number> {
    const now = new Date().toISOString();
    const result = await this.localDB.find({
      selector: {
        type: 'draft',
        'metadata.expiresAt': { $lt: now }
      }
    });

    let deleted = 0;
    for (const doc of result.docs) {
      await this.localDB.remove(doc);
      deleted++;
    }

    return deleted;
  }

  // Stop sync (cleanup)
  destroy(): void {
    if (this.syncHandler) {
      this.syncHandler.cancel();
    }
  }
}

// Usage
const draftManager = new PouchDBDraftManager('https://couch.medimind.ge/drafts');

// Save draft (auto-syncs to server)
await draftManager.saveDraft({
  _id: 'draft_q123_p456',
  type: 'draft',
  questionnaireId: 'Questionnaire/123',
  patientId: 'Patient/456',
  data: questionnaireResponse,
  metadata: {
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
});

// Listen for sync events
window.addEventListener('drafts-synced', (event: CustomEvent) => {
  showNotification('Drafts synced successfully', 'success');
});
```

**Advantages:**
- Automatic bidirectional sync
- Built-in conflict resolution
- Works offline, syncs when online
- Continuous replication (live updates)

**Disadvantages:**
- Requires CouchDB server setup
- Additional infrastructure complexity
- Learning curve for PouchDB API

---

### 3.4 Offline Detection & User Feedback

**Detect Online/Offline Status:**

```typescript
import { useState, useEffect } from 'react';

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verify with server ping (navigator.onLine can be unreliable)
    const verifyConnection = async () => {
      try {
        await fetch('/api/ping', { method: 'HEAD' });
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };

    const interval = setInterval(verifyConnection, 30000); // Check every 30s

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return isOnline;
}
```

**Offline Banner Component:**

```tsx
const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [pendingSyncs, setPendingSyncs] = useState(0);

  useEffect(() => {
    const checkPending = async () => {
      const count = await draftManager.getPendingSyncCount();
      setPendingSyncs(count);
    };
    checkPending();
  }, [isOnline]);

  if (isOnline && pendingSyncs === 0) return null;

  return (
    <div className={`offline-banner ${isOnline ? 'syncing' : 'offline'}`}>
      {isOnline ? (
        <>
          <Spinner size="sm" />
          <span>Syncing {pendingSyncs} draft{pendingSyncs > 1 ? 's' : ''}...</span>
        </>
      ) : (
        <>
          <AlertTriangle />
          <span>You're offline. Changes are saved locally.</span>
        </>
      )}
    </div>
  );
};
```

---

## Draft Recovery UX

### 4.1 Recovery Notification Patterns

**Scenario**: User returns to form with unsaved draft.

#### **Pattern 1: Non-Blocking Toast (Recommended)**

```tsx
const DraftRecoveryToast: React.FC<{ draftId: string }> = ({ draftId }) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);

  const handleRecover = async () => {
    const draft = await draftManager.getDraft(draftId);
    if (draft) {
      restoreFormData(draft.data);
      showNotification(t('draft.recovered'), 'success');
    }
    setVisible(false);
  };

  const handleDiscard = async () => {
    await draftManager.deleteDraft(draftId);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Toast className="draft-recovery-toast" duration={null}>
      <div className="toast-content">
        <InfoCircle />
        <div>
          <strong>{t('draft.found')}</strong>
          <p>{t('draft.foundMessage')}</p>
        </div>
      </div>
      <div className="toast-actions">
        <Button variant="primary" size="sm" onClick={handleRecover}>
          {t('draft.recover')}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDiscard}>
          {t('draft.startFresh')}
        </Button>
      </div>
    </Toast>
  );
};
```

**Visual:**

```
┌─────────────────────────────────────────────┐
│ ℹ Draft Found                               │
│   You have unsaved changes from 2 hours ago.│
│   Would you like to continue?              │
│                                             │
│   [Recover Draft]  [Start Fresh]           │
└─────────────────────────────────────────────┘
```

#### **Pattern 2: Modal (For Important Data)**

```tsx
const DraftRecoveryModal: React.FC<{ draft: DraftSchema }> = ({ draft }) => {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);

  return (
    <Modal
      opened
      onClose={() => {}}
      title={t('draft.recoveryTitle')}
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack>
        <Text>
          {t('draft.recoveryMessage', {
            time: formatRelativeTime(draft.metadata.lastModified)
          })}
        </Text>

        {/* Draft preview (optional) */}
        <Collapse in={showPreview}>
          <Paper p="md" withBorder>
            <Text size="sm" c="dimmed" mb="xs">Preview:</Text>
            <DraftPreview data={draft.data} />
          </Paper>
        </Collapse>

        <Button
          variant="subtle"
          size="xs"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'Hide' : 'Show'} Preview
        </Button>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={handleStartFresh}>
            {t('draft.startFresh')}
          </Button>
          <Button onClick={handleRecover}>
            {t('draft.recover')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
```

**Visual:**

```
┌─────────────────────────────────────────────┐
│ Recover Your Draft?                    [×]  │
├─────────────────────────────────────────────┤
│                                             │
│ You have unsaved changes from 2 hours ago.  │
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ Preview:                                ││
│ │ Patient: John Doe                       ││
│ │ Questionnaire: Medical History          ││
│ │ Progress: 65% complete (13/20 questions)││
│ │ Last modified: Today at 2:34 PM         ││
│ └─────────────────────────────────────────┘│
│ [Show Preview ▼]                            │
│                                             │
│               [Start Fresh]  [Recover] ◄──  │
└─────────────────────────────────────────────┘
```

---

### 4.2 Draft Comparison View

**Use Case**: Show what changed since last save for user review.

```tsx
const DraftComparisonView: React.FC<{
  original: QuestionnaireResponse;
  draft: QuestionnaireResponse;
}> = ({ original, draft }) => {
  const changes = useMemo(() => {
    return detectChanges(original, draft);
  }, [original, draft]);

  return (
    <Stack>
      <Text fw={600}>Changes in your draft:</Text>

      {changes.map((change, index) => (
        <Paper key={index} p="sm" withBorder>
          <Group justify="space-between">
            <div>
              <Text size="sm" fw={500}>{change.question}</Text>
              <Group gap="xs">
                <Badge color="red" variant="light">Old:</Badge>
                <Text size="sm" c="dimmed">{change.oldValue || '(empty)'}</Text>
              </Group>
              <Group gap="xs">
                <Badge color="green" variant="light">New:</Badge>
                <Text size="sm">{change.newValue}</Text>
              </Group>
            </div>
            <Button
              size="xs"
              variant="subtle"
              onClick={() => revertChange(change.linkId)}
            >
              Revert
            </Button>
          </Group>
        </Paper>
      ))}

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={handleDiscardAll}>
          Discard All Changes
        </Button>
        <Button onClick={handleAcceptAll}>
          Accept All Changes
        </Button>
      </Group>
    </Stack>
  );
};

// Detect changes
function detectChanges(
  original: QuestionnaireResponse,
  draft: QuestionnaireResponse
): Array<{ linkId: string; question: string; oldValue: string; newValue: string }> {
  const changes: Array<any> = [];

  for (const draftItem of draft.item || []) {
    const originalItem = original.item?.find(i => i.linkId === draftItem.linkId);

    if (!originalItem || !isEqual(originalItem.answer, draftItem.answer)) {
      changes.push({
        linkId: draftItem.linkId,
        question: getQuestionText(draftItem.linkId),
        oldValue: originalItem?.answer?.[0]?.valueString || '',
        newValue: draftItem.answer?.[0]?.valueString || ''
      });
    }
  }

  return changes;
}
```

---

### 4.3 Multiple Drafts Handling

**Scenario**: User has multiple drafts for the same form (different devices).

```tsx
const MultipleDraftsModal: React.FC<{
  drafts: DraftSchema[];
  onSelect: (draft: DraftSchema) => void;
}> = ({ drafts, onSelect }) => {
  const [selected, setSelected] = useState<string | null>(null);

  const sortedDrafts = useMemo(() => {
    return [...drafts].sort((a, b) =>
      new Date(b.metadata.lastModified).getTime() -
      new Date(a.metadata.lastModified).getTime()
    );
  }, [drafts]);

  return (
    <Modal opened onClose={() => {}} title="Multiple Drafts Found">
      <Stack>
        <Text>
          You have {drafts.length} drafts for this form. Select one to continue:
        </Text>

        <RadioGroup value={selected} onChange={setSelected}>
          {sortedDrafts.map(draft => (
            <Paper key={draft.id} p="md" withBorder mb="xs">
              <Radio
                value={draft.id}
                label={
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text fw={500}>
                        {formatRelativeTime(draft.metadata.lastModified)}
                      </Text>
                      {draft.metadata.deviceInfo && (
                        <Badge size="xs">
                          {getDeviceName(draft.metadata.deviceInfo)}
                        </Badge>
                      )}
                    </Group>
                    <Text size="sm" c="dimmed">
                      Progress: {calculateProgress(draft.data)}% complete
                    </Text>
                  </Stack>
                }
              />
            </Paper>
          ))}
        </RadioGroup>

        <Group justify="space-between" mt="md">
          <Button
            variant="subtle"
            color="red"
            onClick={() => handleDeleteAllDrafts(drafts)}
          >
            Delete All Drafts
          </Button>
          <Group>
            <Button variant="default" onClick={handleStartFresh}>
              Start Fresh
            </Button>
            <Button
              disabled={!selected}
              onClick={() => {
                const draft = drafts.find(d => d.id === selected);
                if (draft) onSelect(draft);
              }}
            >
              Continue
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};
```

---

### 4.4 Draft Abandonment Patterns

**Best Practices:**
1. **Don't ask on every page navigation** - annoying UX
2. **Ask only on browser close** - use `beforeunload` event
3. **Auto-save silently** - no confirmation needed

```typescript
// Warn on browser close if unsaved changes
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);

// Don't warn on internal navigation (use React Router prompt)
import { useBlocker } from 'react-router-dom';

const blocker = useBlocker(
  ({ currentLocation, nextLocation }) =>
    hasUnsavedChanges &&
    currentLocation.pathname !== nextLocation.pathname
);

if (blocker.state === 'blocked') {
  return (
    <Modal opened onClose={() => blocker.reset()}>
      <Text>You have unsaved changes. Continue anyway?</Text>
      <Group>
        <Button onClick={() => blocker.reset()}>Stay</Button>
        <Button onClick={() => blocker.proceed()}>Leave</Button>
      </Group>
    </Modal>
  );
}
```

---

## Performance & Scalability

### 5.1 Efficient Change Detection

**Challenge**: Detect which fields changed without comparing entire form state.

#### **Strategy 1: Shallow Field Tracking**

```typescript
class FormChangeTracker {
  private initialValues: Record<string, any>;
  private dirtyFields: Set<string> = new Set();

  constructor(initialValues: Record<string, any>) {
    this.initialValues = { ...initialValues };
  }

  // Mark field as dirty
  markDirty(fieldPath: string): void {
    this.dirtyFields.add(fieldPath);
  }

  // Get only changed fields
  getChangedFields(currentValues: Record<string, any>): Record<string, any> {
    const changes: Record<string, any> = {};

    for (const fieldPath of this.dirtyFields) {
      const currentValue = get(currentValues, fieldPath);
      const initialValue = get(this.initialValues, fieldPath);

      if (!isEqual(currentValue, initialValue)) {
        changes[fieldPath] = currentValue;
      }
    }

    return changes;
  }

  // Reset tracking
  reset(newValues: Record<string, any>): void {
    this.initialValues = { ...newValues };
    this.dirtyFields.clear();
  }
}

// Usage with Mantine form
const form = useForm({
  initialValues: { name: '', age: 0 },
  onValuesChange: (values, previous) => {
    // Track only changed fields
    Object.keys(values).forEach(key => {
      if (values[key] !== previous[key]) {
        changeTracker.markDirty(key);
      }
    });

    // Auto-save only changed fields
    throttledSave(changeTracker.getChangedFields(values));
  }
});
```

**Benefits:**
- Reduces data transfer (send only changed fields)
- Faster serialization
- Lower memory usage

---

### 5.2 Diff/Patch Algorithms

**Use Case**: Minimize data sent to server by sending diffs instead of full state.

#### **JSON Patch (RFC 6902)**

```typescript
import { compare, applyPatch } from 'fast-json-patch';

// Generate patch
const initialState = { name: 'John', age: 30, address: { city: 'NYC' } };
const currentState = { name: 'John', age: 31, address: { city: 'LA' } };

const patch = compare(initialState, currentState);
console.log(patch);
// [
//   { op: 'replace', path: '/age', value: 31 },
//   { op: 'replace', path: '/address/city', value: 'LA' }
// ]

// Send patch to server (much smaller than full state)
await savePatch(formId, patch);

// Server applies patch
const updated = applyPatch(initialState, patch).newDocument;
```

**Benefits:**
- 80-90% reduction in data transfer for large forms
- Efficient for forms with 100+ fields where user edits 5-10 fields
- Server can apply patches atomically

**Library**: `fast-json-patch` (npm)

#### **Operational Transform (for real-time collaboration)**

```typescript
// Simpler than full OT, but effective for form fields
interface Operation {
  type: 'insert' | 'delete' | 'replace';
  path: string;
  value?: any;
  position?: number;
}

function transformOperation(op1: Operation, op2: Operation): Operation {
  // If operations don't conflict, return as-is
  if (op1.path !== op2.path) return op2;

  // Both operations on same field - prioritize by timestamp
  // (simplified - real OT is more complex)
  if (op1.type === 'replace' && op2.type === 'replace') {
    // Last-write-wins with warning
    console.warn('Conflict detected, applying last-write-wins');
    return op2;
  }

  return op2;
}
```

---

### 5.3 Debounce/Throttle Timing Recommendations

**Research-Backed Recommendations:**

| Context | Strategy | Interval | Rationale |
|---------|----------|----------|-----------|
| Text input (search) | Debounce | 300-500ms | Wait for user to finish typing |
| Text input (auto-save) | Throttle | 2-3s | Save regularly, prevent data loss |
| Rich text editor | Throttle + Interval | 5s + 30s | Dual safety layer |
| Form validation | Debounce | 500ms | Reduce validation calls |
| API calls | Throttle | 1s | Rate limit protection |

**Implementation:**

```typescript
import { useMemo } from 'react';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';

// Throttle: guaranteed call every N ms
const throttledSave = useMemo(
  () => throttle(saveDraft, 3000, { leading: false, trailing: true }),
  []
);

// Debounce: call only after N ms of inactivity
const debouncedValidate = useMemo(
  () => debounce(validateForm, 500),
  []
);

// Cleanup on unmount
useEffect(() => {
  return () => {
    throttledSave.cancel();
    debouncedValidate.cancel();
  };
}, []);
```

---

### 5.4 Storage Quota Management

**Monitor Storage Usage:**

```typescript
async function checkStorageQuota(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
  available: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;

    return {
      usage,
      quota,
      percentUsed: (usage / quota) * 100,
      available: quota - usage
    };
  }

  return { usage: 0, quota: 0, percentUsed: 0, available: 0 };
}

// Usage
const quota = await checkStorageQuota();
if (quota.percentUsed > 80) {
  showWarning('Storage almost full. Consider deleting old drafts.');
}
```

**Auto-Cleanup Strategy:**

```typescript
class StorageQuotaManager {
  private readonly MAX_USAGE_PERCENT = 80;

  async cleanup(): Promise<void> {
    const quota = await checkStorageQuota();

    if (quota.percentUsed < this.MAX_USAGE_PERCENT) return;

    // Strategy 1: Remove expired drafts
    await draftManager.cleanupExpired();

    // Check again
    const afterExpired = await checkStorageQuota();
    if (afterExpired.percentUsed < this.MAX_USAGE_PERCENT) return;

    // Strategy 2: Remove oldest drafts (keep 90% newest)
    const allDrafts = await draftManager.getAllDrafts();
    const sorted = allDrafts.sort((a, b) =>
      new Date(a.metadata.lastModified).getTime() -
      new Date(b.metadata.lastModified).getTime()
    );

    const toRemove = Math.ceil(sorted.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      await draftManager.deleteDraft(sorted[i].id);
    }
  }

  // Run cleanup on app startup
  async init(): Promise<void> {
    await this.cleanup();

    // Schedule periodic cleanup (daily)
    setInterval(() => this.cleanup(), 24 * 60 * 60 * 1000);
  }
}
```

---

### 5.5 Memory Leak Prevention

**Common Causes in Long-Running Forms:**

1. **Event Listeners Not Cleaned Up**
2. **Timers (setInterval/setTimeout) Not Cleared**
3. **Subscriptions Not Unsubscribed**
4. **Large State Accumulation**

**Prevention Patterns:**

```typescript
// ✅ Correct: Cleanup in useEffect
const FormWithAutoSave: React.FC = () => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Auto-save every 30 seconds
    const intervalId = setInterval(() => {
      saveDraft(formData);
    }, 30000);

    // ✅ Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [formData]);

  useEffect(() => {
    // Throttled save on change
    const throttledSave = throttle(saveDraft, 5000);

    // ✅ Cancel throttle on unmount
    return () => throttledSave.cancel();
  }, []);

  return <Form />;
};

// ✅ Correct: AbortController for fetch
const FormWithAPI: React.FC = () => {
  useEffect(() => {
    const controller = new AbortController();

    const loadDraft = async () => {
      try {
        const response = await fetch('/api/draft', {
          signal: controller.signal
        });
        const draft = await response.json();
        setFormData(draft);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Request aborted');
        }
      }
    };

    loadDraft();

    // ✅ Abort fetch on unmount
    return () => controller.abort();
  }, []);

  return <Form />;
};

// ✅ Correct: Remove event listeners
const FormWithKeyboard: React.FC = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveDraft();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // ✅ Remove listener on unmount
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <Form />;
};

// ❌ Wrong: No cleanup
const BadForm: React.FC = () => {
  useEffect(() => {
    setInterval(() => saveDraft(), 30000); // ⚠️ Never cleared!
    window.addEventListener('keydown', handleKeyDown); // ⚠️ Never removed!
  }, []);

  return <Form />;
};
```

**Memory Profiling:**

```typescript
// Use React DevTools Profiler to detect leaks
import { Profiler } from 'react';

<Profiler
  id="QuestionnaireForm"
  onRender={(id, phase, actualDuration) => {
    console.log(`${id} (${phase}) took ${actualDuration}ms`);
  }}
>
  <QuestionnaireForm />
</Profiler>
```

---

## Security & Privacy

### 6.1 Encrypting Draft Data

**Why Encrypt?**
- Drafts may contain PHI/ePHI (HIPAA regulated)
- localStorage/IndexedDB are readable by any script on the domain
- XSS vulnerabilities could expose sensitive data

**Encryption Strategy:**

```typescript
import CryptoJS from 'crypto-js';

class EncryptedDraftManager {
  private readonly ENCRYPTION_KEY: string;

  constructor(userId: string) {
    // Derive encryption key from user's session (never hardcode!)
    this.ENCRYPTION_KEY = this.deriveKey(userId);
  }

  // Derive key from user session (example - use proper KDF in production)
  private deriveKey(userId: string): string {
    // In production, use PBKDF2 or similar
    const sessionToken = sessionStorage.getItem('sessionToken');
    return CryptoJS.SHA256(sessionToken + userId).toString();
  }

  // Encrypt draft before storing
  encrypt(data: any): string {
    const json = JSON.stringify(data);
    return CryptoJS.AES.encrypt(json, this.ENCRYPTION_KEY).toString();
  }

  // Decrypt draft after retrieving
  decrypt(encrypted: string): any {
    const decrypted = CryptoJS.AES.decrypt(encrypted, this.ENCRYPTION_KEY);
    const json = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(json);
  }

  // Save encrypted draft
  async saveDraft(draftId: string, data: any): Promise<void> {
    const encrypted = this.encrypt(data);
    localStorage.setItem(`draft_${draftId}`, encrypted);
  }

  // Get decrypted draft
  async getDraft(draftId: string): Promise<any | null> {
    const encrypted = localStorage.getItem(`draft_${draftId}`);
    if (!encrypted) return null;

    try {
      return this.decrypt(encrypted);
    } catch (error) {
      console.error('Failed to decrypt draft:', error);
      return null;
    }
  }
}

// Usage
const encryptedManager = new EncryptedDraftManager(currentUserId);
await encryptedManager.saveDraft('q123_p456', formData);
```

**Best Practices:**
- Use AES-256 encryption (HIPAA compliant)
- Derive encryption key from user session (expires when session ends)
- Never hardcode encryption keys
- Use Web Crypto API for production (faster, more secure)

**Web Crypto API Example:**

```typescript
class WebCryptoDraftManager {
  private key: CryptoKey | null = null;

  async init(password: string): Promise<void> {
    // Derive key from password
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    this.key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode('medimind-drafts'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(data: any): Promise<string> {
    if (!this.key) throw new Error('Key not initialized');

    const enc = new TextEncoder();
    const json = JSON.stringify(data);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.key,
      enc.encode(json)
    );

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  }

  async decrypt(encrypted: string): Promise<any> {
    if (!this.key) throw new Error('Key not initialized');

    // Decode base64
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));

    // Extract IV and data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.key,
      data
    );

    const dec = new TextDecoder();
    const json = dec.decode(decrypted);
    return JSON.parse(json);
  }
}
```

---

### 6.2 Secure Draft Transmission

**HTTPS is mandatory** - never transmit drafts over HTTP.

**Additional Security:**

```typescript
// Add CSRF token to all draft API calls
const saveDraftSecure = async (draft: DraftSchema): Promise<void> => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  const response = await fetch('/api/drafts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken || '',
      'Authorization': `Bearer ${getAccessToken()}`
    },
    body: JSON.stringify(draft)
  });

  if (!response.ok) {
    throw new Error('Failed to save draft');
  }
};

// Validate server certificate (for native apps)
// In React Native or Electron, pin SSL certificate
const pinCertificate = (hostname: string, fingerprint: string): void => {
  // This is a conceptual example - actual implementation depends on platform
  if (window.electron) {
    window.electron.pinCertificate(hostname, fingerprint);
  }
};
```

---

### 6.3 Draft Access Control

**Role-Based Access:**

```typescript
interface DraftAccessPolicy {
  canView: (draft: DraftSchema, user: User) => boolean;
  canEdit: (draft: DraftSchema, user: User) => boolean;
  canDelete: (draft: DraftSchema, user: User) => boolean;
}

const draftAccessPolicy: DraftAccessPolicy = {
  // Only author and admins can view
  canView: (draft, user) => {
    return (
      draft.metadata.lastModifiedBy === user.id ||
      user.roles.includes('admin') ||
      user.roles.includes('supervisor')
    );
  },

  // Only author can edit
  canEdit: (draft, user) => {
    return draft.metadata.lastModifiedBy === user.id;
  },

  // Author and admins can delete
  canDelete: (draft, user) => {
    return (
      draft.metadata.lastModifiedBy === user.id ||
      user.roles.includes('admin')
    );
  }
};

// Enforce access control
class SecureDraftManager {
  async getDraft(draftId: string, user: User): Promise<DraftSchema | null> {
    const draft = await this.fetchDraft(draftId);

    if (!draft || !draftAccessPolicy.canView(draft, user)) {
      throw new UnauthorizedError('Access denied');
    }

    return draft;
  }

  async updateDraft(draftId: string, data: any, user: User): Promise<void> {
    const draft = await this.fetchDraft(draftId);

    if (!draft || !draftAccessPolicy.canEdit(draft, user)) {
      throw new UnauthorizedError('Cannot edit this draft');
    }

    await this.saveDraft({ ...draft, data });
  }
}
```

---

### 6.4 Data Retention & HIPAA Compliance

**HIPAA Requirements:**
- **Minimum Retention**: 6 years from creation or last use
- **Maximum Retention**: Not specified, but minimize unnecessary storage
- **Audit Trails**: Required for all access/modifications

**Implementation:**

```typescript
interface DraftAuditLog {
  id: string;
  draftId: string;
  action: 'created' | 'viewed' | 'updated' | 'deleted';
  userId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

class HIPAACompliantDraftManager {
  private readonly RETENTION_PERIOD_DAYS = 365 * 6; // 6 years

  // Log all draft actions
  private async logAction(
    draftId: string,
    action: DraftAuditLog['action'],
    userId: string
  ): Promise<void> {
    const auditLog: DraftAuditLog = {
      id: crypto.randomUUID(),
      draftId,
      action,
      userId,
      timestamp: new Date().toISOString(),
      ipAddress: await this.getIPAddress(),
      userAgent: navigator.userAgent
    };

    // Store in IndexedDB and sync to server
    await this.saveAuditLog(auditLog);
  }

  // Save draft with audit log
  async saveDraft(draft: DraftSchema, userId: string): Promise<void> {
    await draftManager.saveDraft(draft);
    await this.logAction(draft.id, 'updated', userId);
  }

  // Get draft with audit log
  async getDraft(draftId: string, userId: string): Promise<DraftSchema | null> {
    const draft = await draftManager.getDraft(draftId);
    if (draft) {
      await this.logAction(draftId, 'viewed', userId);
    }
    return draft;
  }

  // Delete draft (soft delete with audit)
  async deleteDraft(draftId: string, userId: string): Promise<void> {
    const draft = await draftManager.getDraft(draftId);
    if (draft) {
      // Mark as deleted (keep for retention period)
      await draftManager.saveDraft({
        ...draft,
        metadata: {
          ...draft.metadata,
          deletedAt: new Date().toISOString(),
          deletedBy: userId
        }
      });
      await this.logAction(draftId, 'deleted', userId);
    }
  }

  // Cleanup after retention period
  async cleanupRetentionExpired(): Promise<void> {
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() - this.RETENTION_PERIOD_DAYS);

    const expiredDrafts = await draftManager.getDraftsBefore(retentionDate);

    for (const draft of expiredDrafts) {
      if (draft.metadata.deletedAt) {
        // Hard delete after retention period
        await draftManager.hardDelete(draft.id);
        console.log(`Deleted draft ${draft.id} (retention period expired)`);
      }
    }
  }
}
```

---

### 6.5 HIPAA Security Checklist

**Technical Safeguards (§ 164.312):**

- [x] **Access Control**: Role-based access to drafts
- [x] **Encryption**: AES-256 for data at rest
- [x] **Audit Trails**: Log all draft actions (view, edit, delete)
- [x] **Automatic Logoff**: Session expires after 30 minutes
- [x] **Data Integrity**: Version control to detect tampering

**Physical Safeguards (§ 164.310):**
- [x] **Device Encryption**: Enforce full-disk encryption (BitLocker/FileVault)
- [x] **Workstation Security**: Auto-lock after 5 minutes idle

**Administrative Safeguards (§ 164.308):**
- [x] **BAA Required**: Business Associate Agreement with Medplum
- [x] **Training**: Staff trained on PHI handling
- [x] **Risk Assessment**: Annual security audits

**Breach Notification (§ 164.410):**
- [x] **Incident Response**: Notify affected patients within 60 days
- [x] **Breach Log**: Track all security incidents

---

## Code Examples

### 7.1 Complete Auto-Save Hook

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import throttle from 'lodash/throttle';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  throttleMs?: number;
  intervalMs?: number;
  enabled?: boolean;
}

interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  error: Error | null;
}

export function useAutoSave<T>({
  data,
  onSave,
  throttleMs = 3000,
  intervalMs = 30000,
  enabled = true
}: UseAutoSaveOptions<T>) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    status: 'idle',
    lastSaved: null,
    error: null
  });

  const isSavingRef = useRef(false);

  // Save function
  const save = useCallback(async () => {
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setSaveStatus(prev => ({ ...prev, status: 'saving', error: null }));

    try {
      await onSave(data);
      setSaveStatus({
        status: 'saved',
        lastSaved: new Date(),
        error: null
      });

      // Auto-hide success after 3 seconds
      setTimeout(() => {
        setSaveStatus(prev =>
          prev.status === 'saved' ? { ...prev, status: 'idle' } : prev
        );
      }, 3000);
    } catch (error) {
      setSaveStatus({
        status: 'error',
        lastSaved: null,
        error: error as Error
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave]);

  // Throttled save (on user input)
  const throttledSave = useRef(throttle(save, throttleMs, {
    leading: false,
    trailing: true
  })).current;

  // Effect: throttled save on data change
  useEffect(() => {
    if (!enabled) return;
    throttledSave();
  }, [data, enabled, throttledSave]);

  // Effect: interval save (guaranteed backup)
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(save, intervalMs);
    return () => clearInterval(intervalId);
  }, [enabled, intervalMs, save]);

  // Cleanup
  useEffect(() => {
    return () => {
      throttledSave.cancel();
    };
  }, [throttledSave]);

  return {
    saveStatus,
    save // Manual save
  };
}

// Usage
const MyForm: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const { saveStatus, save } = useAutoSave({
    data: formData,
    onSave: async (data) => {
      await saveDraftToServer(data);
    },
    throttleMs: 3000,
    intervalMs: 30000
  });

  return (
    <div>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <SaveStatusIndicator status={saveStatus.status} />

      <button onClick={save}>Save Now</button>
    </div>
  );
};
```

---

### 7.2 Draft Recovery Component

```typescript
import { useEffect, useState } from 'react';
import { Modal, Button, Text, Group, Stack } from '@mantine/core';

interface DraftRecoveryProps<T> {
  draftId: string;
  onRecover: (draft: T) => void;
  onDiscard: () => void;
  getDraft: (id: string) => Promise<T | null>;
}

export function DraftRecovery<T>({
  draftId,
  onRecover,
  onDiscard,
  getDraft
}: DraftRecoveryProps<T>) {
  const [draft, setDraft] = useState<T | null>(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const checkForDraft = async () => {
      const existingDraft = await getDraft(draftId);
      if (existingDraft) {
        setDraft(existingDraft);
        setOpened(true);
      }
    };

    checkForDraft();
  }, [draftId, getDraft]);

  const handleRecover = () => {
    if (draft) {
      onRecover(draft);
    }
    setOpened(false);
  };

  const handleDiscard = () => {
    onDiscard();
    setOpened(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {}} // Prevent closing without action
      title="Draft Found"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack>
        <Text>
          You have unsaved changes from your previous session.
          Would you like to continue where you left off?
        </Text>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={handleDiscard}>
            Start Fresh
          </Button>
          <Button onClick={handleRecover}>
            Recover Draft
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// Usage
const QuestionnaireForm: React.FC = () => {
  const [formData, setFormData] = useState<QuestionnaireResponse>({});

  return (
    <>
      <DraftRecovery
        draftId="q123_p456"
        onRecover={(draft) => setFormData(draft)}
        onDiscard={() => draftManager.deleteDraft("q123_p456")}
        getDraft={draftManager.getDraft}
      />

      <Form data={formData} onChange={setFormData} />
    </>
  );
};
```

---

### 7.3 Offline Indicator Component

```typescript
import { Badge, Notification } from '@mantine/core';
import { IconWifi, IconWifiOff, IconCloudUp } from '@tabler/icons-react';
import { useOnlineStatus } from './useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [pendingSyncs, setPendingSyncs] = useState(0);

  useEffect(() => {
    const checkPending = async () => {
      const count = await draftManager.getPendingSyncCount();
      setPendingSyncs(count);
    };

    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isOnline && pendingSyncs === 0) return null;

  return (
    <Notification
      icon={isOnline ? <IconCloudUp /> : <IconWifiOff />}
      color={isOnline ? 'blue' : 'yellow'}
      title={isOnline ? 'Syncing...' : 'Offline Mode'}
      onClose={() => {}}
      style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
    >
      {isOnline ? (
        <>Syncing {pendingSyncs} draft{pendingSyncs > 1 ? 's' : ''}...</>
      ) : (
        <>You're offline. Changes are saved locally.</>
      )}
    </Notification>
  );
};
```

---

## Implementation Recommendations

### 8.1 Phase 1: Basic Auto-Save (Week 1)

**Goals:**
- Throttled auto-save every 3 seconds
- localStorage draft storage with 30-day expiration
- Save status indicator (saving/saved/error)

**Implementation:**

```typescript
// 1. Install dependencies
npm install lodash

// 2. Create useAutoSave hook (see 7.1)

// 3. Integrate with existing forms
const QuestionnaireForm = () => {
  const [formData, setFormData] = useState({});

  const { saveStatus } = useAutoSave({
    data: formData,
    onSave: async (data) => {
      await draftManager.saveDraft('draft_' + questionnaireId, data);
    }
  });

  return (
    <>
      <SaveStatusIndicator status={saveStatus.status} />
      <Form data={formData} onChange={setFormData} />
    </>
  );
};
```

**Success Criteria:**
- [ ] Auto-saves every 3 seconds after user stops typing
- [ ] Shows "Saving..." → "Saved at X:XX PM" indicator
- [ ] Drafts expire after 30 days
- [ ] No memory leaks (verified with React DevTools Profiler)

---

### 8.2 Phase 2: Draft Recovery (Week 2)

**Goals:**
- Check for existing drafts on form load
- Show recovery modal/toast
- Allow user to recover or discard

**Implementation:**

```typescript
// 1. Create DraftRecovery component (see 7.2)

// 2. Add to form initialization
useEffect(() => {
  const checkDraft = async () => {
    const draft = await draftManager.getDraft(draftId);
    if (draft) {
      showDraftRecoveryModal(draft);
    }
  };
  checkDraft();
}, []);
```

**Success Criteria:**
- [ ] Shows recovery notification if draft exists
- [ ] Recovers full form state (all fields)
- [ ] Allows discarding draft
- [ ] No duplicate drafts created

---

### 8.3 Phase 3: Offline Support (Week 3-4)

**Goals:**
- Service Worker for offline caching
- IndexedDB for complex drafts
- Background sync when online

**Implementation:**

```bash
# 1. Install dependencies
npm install workbox-webpack-plugin idb

# 2. Create service-worker.ts (see 3.1)

# 3. Register service worker (see 3.1)

# 4. Migrate to IndexedDB (see 2.3)
```

**Success Criteria:**
- [ ] Forms work offline (no network errors)
- [ ] Drafts sync when back online
- [ ] Shows offline indicator
- [ ] No data loss during offline periods

---

### 8.4 Phase 4: Advanced Features (Week 5-6)

**Goals:**
- Encryption for PHI
- Conflict resolution for multi-device
- Undo/redo with auto-save

**Success Criteria:**
- [ ] Drafts encrypted in localStorage/IndexedDB
- [ ] Handles conflicts (multiple devices)
- [ ] Undo/redo works with auto-save
- [ ] HIPAA audit logs for draft actions

---

## References

### Research Sources

1. **Auto-Save Patterns**:
   - "Debounce vs Throttle in JavaScript" - DEV Community (2024)
   - "Auto-Saving Forms Done Right" - Code Miner 42 (2023)
   - "Throttle vs Debounce on Real Examples" - TomekDev (2024)

2. **Offline-First**:
   - "Service Workers, Background Sync, and PouchDB" - Offline Camp/Medium (2023)
   - "State Management for Offline-First Web Applications" - Pixel Free Studio (2024)
   - "Create Offline Web Apps Using Service Workers & PouchDB" - SitePoint

3. **Draft Recovery UX**:
   - "Unsaved Changes Modal UX Pattern" - FOLIO UX Documentation
   - "Communicating Unsaved Changes" - Cloudscape Design System (AWS)
   - "Modal UX Design Patterns" - LogRocket Blog (2024)

4. **Storage**:
   - "LocalStorage vs IndexedDB" - RxDB Documentation (2024)
   - "Understanding Storage Quota" - Chrome Developers/Workbox
   - "Storage Quotas and Eviction Criteria" - MDN Web Docs

5. **Conflict Resolution**:
   - "Building Real-time Collaborative Editors" - Medium (2024)
   - "Operational Transformation" - Wikipedia
   - "CRDTs and OT: The Art of Conflict-Free Data Synchronization" - Hashnode (2024)

6. **Security**:
   - "HIPAA Encryption Requirements" - HIPAA Journal (2025)
   - "Understanding HIPAA Encryption Requirements" - Thoropass (2024)
   - "HIPAA Compliance Guide" - HHS.gov

7. **FHIR**:
   - "Modeling Questionnaires and Responses" - Medplum Documentation
   - "FHIR Questionnaire Essentials" - Medblocks Blog (2024)
   - "Structured Data Capture IG" - HL7 FHIR Confluence

---

### Libraries & Tools

**Auto-Save & Throttling:**
- `lodash/throttle` - Throttle/debounce utilities
- `use-debounce` - React hook for debouncing

**Storage:**
- `idb` - IndexedDB wrapper with Promises
- `pouchdb` - Offline-first database with sync
- `localforage` - localStorage/IndexedDB abstraction

**Encryption:**
- `crypto-js` - AES encryption (simple)
- Web Crypto API - Native browser encryption (recommended)

**Diff/Patch:**
- `fast-json-patch` - RFC 6902 JSON Patch
- `immer` - Immutable state with patches

**Offline:**
- `workbox` - Service Worker toolkit by Google
- `@serwist/next` - Next.js offline support

**Testing:**
- `fake-indexeddb` - IndexedDB mock for tests
- `msw` - Mock Service Worker for API mocking

---

### Next Steps

1. **Review with team** - Discuss architecture choices
2. **Choose storage strategy** - localStorage vs IndexedDB vs Hybrid
3. **Security review** - Ensure HIPAA compliance
4. **Create implementation plan** - Break into sprints
5. **Prototype** - Build proof-of-concept for one form
6. **Test** - Verify performance and data safety
7. **Roll out** - Deploy to production forms gradually

---

**Document End**
