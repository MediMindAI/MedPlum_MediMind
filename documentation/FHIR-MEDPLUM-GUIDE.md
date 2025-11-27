# FHIR & Medplum Complete Guide
> From zero to hero in healthcare data systems

---

## Why This Architecture? The Strategic Case for FHIR + Medplum

### The Problem with Traditional EMR Systems

**Legacy EMRs are data prisons.**

Traditional EMR systems store healthcare data in proprietary formats, creating:
- **Vendor lock-in** - Switching costs are astronomical (often $10M+ for hospitals)
- **Data silos** - Patient data trapped in one system, invisible to others
- **Integration nightmares** - Custom interfaces for every connection (HL7v2 point-to-point chaos)
- **Innovation blockers** - Adding features requires vendor approval and massive costs
- **Compliance complexity** - Each system handles HIPAA differently

> **Real example**: A patient visits 3 hospitals. Each has their data in incompatible formats. No doctor sees the complete picture. Lab tests get repeated. Medications conflict. Lives are lost.

---

### Why FHIR Changes Everything

**FHIR (Fast Healthcare Interoperability Resources)** is not just another healthcare standard. It's the **HTTP of healthcare** - a universal language that every system can speak.

**Key breakthroughs:**

| Traditional Approach | FHIR Approach |
|---------------------|---------------|
| Proprietary data formats | Standard JSON resources |
| Point-to-point interfaces | REST APIs (like any modern web app) |
| Expensive integration consultants | Developers can learn in days |
| Closed ecosystems | Open, interoperable by design |
| Batch file transfers (HL7v2) | Real-time API calls |

**Why FHIR wins:**
1. **Web-native** - REST + JSON means any developer can build healthcare apps
2. **Resource-based** - Data is modular (Patient, Encounter, Observation), not monolithic
3. **Government-mandated** - US (21st Century Cures Act), EU (EHDS) require FHIR compliance
4. **Future-proof** - Once data is in FHIR, it can move anywhere

> **The bottom line**: FHIR lets you own your healthcare data architecture instead of renting it from a vendor.

---

### Why Medplum? Build vs. Buy Calculation

Building a FHIR server from scratch requires:
- 6-12 months of development
- Deep FHIR specification expertise
- OAuth 2.0 / SMART-on-FHIR authentication
- Database design for 150+ resource types
- Search parameter implementation (complex!)
- Subscription system for real-time events
- Audit logging for HIPAA compliance

**Medplum gives you all of this, day one.**

**What Medplum provides:**

| Component | DIY Effort | Medplum |
|-----------|------------|---------|
| FHIR R4 Server | 6 months | ✅ Ready |
| Authentication (OAuth 2.0) | 2 months | ✅ Ready |
| Access Control (AccessPolicy) | 2 months | ✅ Ready |
| React UI Components | 3 months | ✅ Ready |
| Bots (serverless automation) | 1 month | ✅ Ready |
| TypeScript SDK | 1 month | ✅ Ready |
| HIPAA-compliant infrastructure | Ongoing | ✅ Ready |

**Why we chose Medplum:**
1. **Open source** - No vendor lock-in, MIT license
2. **Full FHIR compliance** - Passes HL7 conformance tests
3. **Developer-first** - TypeScript, React, modern tooling
4. **Self-hostable** - Run on your infrastructure (we do)
5. **Production-ready** - Used by real healthcare companies

---

### MediMind Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    MediMind EMR Architecture                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐                  │
│  │   EMR Frontend   │     │   Mobile Apps    │                  │
│  │  (React + Vite)  │     │    (Future)      │                  │
│  │                  │     │                  │                  │
│  │ • Registration   │     │ • Patient Portal │                  │
│  │ • Patient History│     │ • Staff Apps     │                  │
│  │ • Nomenclature   │     │                  │                  │
│  │ • Billing        │     │                  │                  │
│  │ • Forms Builder  │     │                  │                  │
│  └────────┬─────────┘     └────────┬─────────┘                  │
│           │                        │                             │
│           ▼                        ▼                             │
│  ┌─────────────────────────────────────────────────────┐        │
│  │              Medplum Core (@medplum/core)           │        │
│  │                                                     │        │
│  │  • MedplumClient - API gateway                      │        │
│  │  • FHIR Resource types - Type safety               │        │
│  │  • React Hooks - Data fetching                     │        │
│  └────────────────────────┬────────────────────────────┘        │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────┐        │
│  │              Medplum Server (Self-Hosted)           │        │
│  │                                                     │        │
│  │  • FHIR R4 REST API                                │        │
│  │  • OAuth 2.0 / SMART-on-FHIR Authentication        │        │
│  │  • AccessPolicy-based Authorization                │        │
│  │  • Subscription Engine (real-time events)          │        │
│  │  • Bot Runtime (serverless automation)             │        │
│  └────────────────────────┬────────────────────────────┘        │
│                           │                                      │
│           ┌───────────────┼───────────────┐                     │
│           ▼               ▼               ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ PostgreSQL  │  │    Redis    │  │ External    │             │
│  │             │  │             │  │ Systems     │             │
│  │ FHIR data   │  │ Jobs queue  │  │             │             │
│  │ as JSONB    │  │ Caching     │  │ • LIS Labs  │             │
│  │             │  │ Sessions    │  │ • Insurance │             │
│  └─────────────┘  └─────────────┘  │ • MOH APIs  │             │
│                                    └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

### Why Each Technology Choice Matters

| Choice | Why It Matters |
|--------|----------------|
| **FHIR R4** | Government mandates (US, EU). Future-proof. Any system can consume our data. |
| **Medplum** | 12+ months of FHIR server development saved. Open source = no lock-in. |
| **PostgreSQL + JSONB** | Store complex FHIR resources without schema migrations. Fast JSON queries. |
| **TypeScript** | Catch errors at compile time. FHIR types from `@medplum/fhirtypes`. |
| **React 19** | Modern UI framework. Medplum provides ready-made FHIR components. |
| **Mantine UI** | Accessible, responsive components. Georgian/RTL ready. |
| **Self-hosted** | Data sovereignty. Georgia data stays in Georgia. GDPR-like compliance. |

---

### The Future We're Building Toward

**Phase 1 (Current)**: Core EMR
- Patient registration, encounters, billing
- Staff management, roles, permissions
- Medical services nomenclature

**Phase 2**: Clinical Excellence
- Lab integration (LIS) via FHIR
- Prescriptions (MedicationRequest)
- Clinical decision support

**Phase 3**: Ecosystem
- Patient portal (same FHIR data, different view)
- Mobile apps for staff
- Insurance API integration
- Ministry of Health reporting

**Phase 4**: Intelligence
- Analytics dashboards (FHIR data → insights)
- AI-assisted clinical workflows
- Population health management

> **The key insight**: Because all data is FHIR from day one, each phase builds on the same foundation. No migrations. No data transformations. Just new views on the same data.

---

### For Developers: What This Means for You

1. **You're learning transferable skills** - FHIR knowledge applies to any healthcare job globally
2. **The architecture is modern** - REST APIs, TypeScript, React - not 1990s healthcare tech
3. **Data is understandable** - JSON resources, not cryptic HL7v2 pipes
4. **Testing is straightforward** - Mock FHIR server, standard React testing patterns
5. **Documentation exists** - HL7.org, Medplum docs, this guide

**Start here:**
- Understand Resources (Part 1)
- Learn MedplumClient (Part 3)
- Explore the EMR codebase (`packages/app/src/emr/`)

---

## Part 1: FHIR Fundamentals

### What is FHIR?

**FHIR** = Fast Healthcare Interoperability Resources (pronounced "fire")

**Analogy: Universal Language for Healthcare**
> Imagine every hospital speaks a different language. FHIR is like English becoming the universal language - everyone agrees on the same words (resources) and grammar (structure).

**Key Points:**
- Created by HL7 (healthcare standards organization)
- Version R4 is the current stable version (your project uses this)
- REST-based API (like any modern web API)
- JSON or XML format (you use JSON)

---

### Resources: The Building Blocks

**Analogy: LEGO Bricks**
> FHIR resources are like standardized LEGO bricks. A `Patient` brick always has the same shape (structure), so any system can use it.

**What is a Resource?**
- A resource is a **single unit of healthcare data**
- Each resource has a **type** (Patient, Encounter, Observation)
- Each resource has a **unique ID**
- Resources are stored as **JSON objects**

**Example Patient Resource:**
```json
{
  "resourceType": "Patient",
  "id": "123",
  "name": [{
    "given": ["John"],
    "family": "Smith"
  }],
  "gender": "male",
  "birthDate": "1990-05-15"
}
```

**Core Resource Categories:**

| Category | Resources | Real-World Analogy |
|----------|-----------|-------------------|
| **Individuals** | Patient, Practitioner, RelatedPerson | People in the hospital |
| **Encounters** | Encounter, EpisodeOfCare | Hospital visits |
| **Clinical** | Observation, Condition, Procedure | Medical findings & treatments |
| **Medications** | Medication, MedicationRequest | Prescriptions & drugs |
| **Billing** | Claim, Coverage, Invoice | Insurance & payments |
| **Workflow** | Task, Appointment, Schedule | Scheduling & tasks |
| **Documents** | DocumentReference, Questionnaire | Files & forms |

---

### References: How Resources Connect

**Analogy: Hyperlinks**
> Just like web pages link to each other with URLs, FHIR resources link to each other with references.

**Example:**
```json
// An Encounter (hospital visit) references a Patient
{
  "resourceType": "Encounter",
  "id": "visit-456",
  "subject": {
    "reference": "Patient/123"
  }
}
```

**Reference Format:** `{ResourceType}/{id}`
- `Patient/123` → Patient with ID 123
- `Practitioner/dr-smith` → Practitioner with ID dr-smith
- `Organization/hospital-1` → Organization with ID hospital-1

---

### Identifiers: External IDs

**Analogy: Passport Numbers vs Database IDs**
> Your passport number identifies you in the real world. Your database ID identifies you in the system. FHIR supports both.

**Two Types of IDs:**

| Type | Purpose | Example |
|------|---------|---------|
| `id` | Internal database ID | `"id": "abc123"` |
| `identifier` | External/business ID | Personal ID, SSN, MRN |

**Example with Georgian Personal ID:**
```json
{
  "resourceType": "Patient",
  "id": "internal-uuid-here",
  "identifier": [{
    "system": "http://medimind.ge/identifiers/personal-id",
    "value": "26001014632"
  }]
}
```

**Why Both?**
- `id` = system-generated, guaranteed unique
- `identifier` = real-world ID that humans use (can search by this)

---

### Extensions: Custom Fields

**Analogy: Adding Custom Fields to a Form**
> FHIR provides standard fields, but sometimes you need extras. Extensions let you add custom data without breaking the standard.

**Example: Adding Citizenship (not standard in Patient):**
```json
{
  "resourceType": "Patient",
  "id": "123",
  "extension": [{
    "url": "http://medimind.ge/extensions/citizenship",
    "valueCode": "GE"
  }]
}
```

**Extension Structure:**
- `url` - Unique identifier for this extension type
- `value[x]` - The actual value (valueString, valueCode, valueBoolean, etc.)

---

## Part 2: FHIR Operations (CRUD + Search)

### REST API Basics

**Analogy: Library Card Catalog**
> FHIR server is like a library. You can add books (create), find books (read/search), update books, or remove books (delete).

**Base URL Pattern:** `{server}/fhir/R4/{ResourceType}`

| Operation | HTTP Method | URL | Description |
|-----------|-------------|-----|-------------|
| **Create** | POST | `/Patient` | Add new patient |
| **Read** | GET | `/Patient/123` | Get patient by ID |
| **Update** | PUT | `/Patient/123` | Update entire patient |
| **Delete** | DELETE | `/Patient/123` | Remove patient |
| **Search** | GET | `/Patient?name=John` | Find patients |

---

### Search Parameters

**Analogy: Google Search Filters**
> Like filtering Google results by date or type, FHIR search parameters let you find exactly what you need.

**Common Search Patterns:**

```bash
# Find patient by name
GET /Patient?name=John

# Find patient by identifier (personal ID)
GET /Patient?identifier=26001014632

# Find encounters for a patient
GET /Encounter?subject=Patient/123

# Find encounters in date range
GET /Encounter?date=ge2024-01-01&date=le2024-12-31

# Combine multiple filters (AND logic)
GET /Patient?name=John&gender=male&birthdate=1990-05-15
```

**Special Search Prefixes:**
| Prefix | Meaning | Example |
|--------|---------|---------|
| `eq` | equals (default) | `date=eq2024-01-01` |
| `ne` | not equals | `status=ne:cancelled` |
| `gt` | greater than | `date=gt2024-01-01` |
| `lt` | less than | `date=lt2024-12-31` |
| `ge` | greater or equal | `date=ge2024-01-01` |
| `le` | less or equal | `date=le2024-12-31` |

**Pagination:**
```bash
GET /Patient?_count=20&_offset=40  # Page 3 of 20 items
```

**Sorting:**
```bash
GET /Encounter?_sort=-date  # Newest first (- = descending)
GET /Patient?_sort=name     # Alphabetical
```

---

### FHIR Operations (Special Endpoints)

**Analogy: Special Services at the Bank**
> Beyond basic deposits/withdrawals, banks have special services (wire transfers, currency exchange). FHIR has special operations for complex tasks.

**Format:** `{ResourceType}/{id}/$operation-name`

**Examples:**
```bash
# Validate a resource
POST /Patient/$validate

# Get everything about a patient
GET /Patient/123/$everything

# Match/deduplicate patients
POST /Patient/$match
```

---

## Part 3: Medplum Architecture

### What is Medplum?

**Analogy: Shopify for Healthcare Apps**
> Shopify gives you everything to run an online store. Medplum gives you everything to build healthcare apps - server, database, auth, UI components.

**Medplum Provides:**
- FHIR Server (stores all data)
- REST API (access data)
- Authentication (OAuth 2.0, SMART-on-FHIR)
- React Components (UI building blocks)
- Bots (automation/serverless functions)
- Access Control (who can see what)

---

### Monorepo Structure

**Your Project Structure:**
```
packages/
├── core/           # FHIR client library (works in browser & Node)
├── server/         # Backend Express server with FHIR API
├── app/            # Your EMR application (React + Vite)
├── react/          # Reusable React components
├── react-hooks/    # React hooks for FHIR operations
├── fhirtypes/      # TypeScript types for all FHIR resources
├── definitions/    # FHIR schemas and definitions
└── mock/           # Mock data for testing
```

---

### MedplumClient: Your API Gateway

**Analogy: TV Remote Control**
> MedplumClient is your remote control for the FHIR server. All operations go through it.

**Basic Usage:**
```typescript
import { MedplumClient } from '@medplum/core';

// Initialize client
const medplum = new MedplumClient({
  baseUrl: 'https://api.medplum.com/'
});

// Login
await medplum.signIn('email', 'password');

// CREATE - Add new patient
const patient = await medplum.createResource({
  resourceType: 'Patient',
  name: [{ given: ['John'], family: 'Smith' }]
});

// READ - Get patient by ID
const patient = await medplum.readResource('Patient', '123');

// UPDATE - Modify patient
await medplum.updateResource({
  ...patient,
  birthDate: '1990-05-15'
});

// DELETE - Remove patient
await medplum.deleteResource('Patient', '123');

// SEARCH - Find patients
const results = await medplum.searchResources('Patient', {
  name: 'John',
  gender: 'male'
});
```

---

### React Hooks: Easy Data Fetching

**Analogy: Smart Assistants**
> Hooks are like smart assistants that handle the boring work (loading states, errors, caching) while you focus on the UI.

**Key Hooks:**

```typescript
import { useMedplum, useMedplumContext } from '@medplum/react-hooks';

function MyComponent() {
  // Get the client
  const medplum = useMedplum();

  // Read a resource (with loading/error states)
  const patient = useResource<Patient>({ reference: 'Patient/123' });

  // Search resources
  const patients = useSearch<Patient>('Patient', { name: 'John' });

  // Check if logged in
  const { profile } = useMedplumContext();
}
```

---

## Part 4: Key FHIR Resources (Your Project)

### Patient - The Star of the Show

**Analogy: Customer Profile**
> Patient is like a detailed customer profile with all their personal info.

**Key Fields:**
```typescript
interface Patient {
  resourceType: 'Patient';
  id: string;

  // Names (can have multiple)
  name: [{
    given: string[];    // First/middle names
    family: string;     // Last name
  }];

  // Identifiers (personal ID, medical record number)
  identifier: [{
    system: string;     // Which ID system
    value: string;      // The actual ID
  }];

  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;    // YYYY-MM-DD

  // Contact info
  telecom: [{
    system: 'phone' | 'email';
    value: string;
  }];

  // Address
  address: [{
    line: string[];
    city: string;
    country: string;
  }];

  // Custom extensions
  extension: [{
    url: string;
    valueString?: string;
    valueCode?: string;
    valueBoolean?: boolean;
  }];
}
```

---

### Practitioner - Healthcare Providers

**Analogy: Employee Record**
> Practitioner is the staff member - doctors, nurses, admins.

```typescript
interface Practitioner {
  resourceType: 'Practitioner';
  id: string;
  name: [{ given: string[]; family: string }];
  identifier: [{ system: string; value: string }];
  telecom: [{ system: 'email' | 'phone'; value: string }];
  gender: string;
  active: boolean;  // Is this account active?
}
```

---

### PractitionerRole - Job Assignments

**Analogy: Job Position**
> A Practitioner can have multiple roles (doctor in cardiology AND department head).

```typescript
interface PractitionerRole {
  resourceType: 'PractitionerRole';
  practitioner: { reference: string };  // 'Practitioner/123'
  code: [{
    coding: [{
      code: string;  // 'physician' | 'nurse' | 'admin'
    }]
  }];
  specialty: [{
    coding: [{
      code: string;  // '207RC0000X' = Cardiology (NUCC code)
    }]
  }];
  active: boolean;
}
```

---

### Encounter - Hospital Visits

**Analogy: Check-in Record**
> Every time a patient visits, an Encounter is created. It tracks the who, when, where, why.

```typescript
interface Encounter {
  resourceType: 'Encounter';
  id: string;

  status: 'planned' | 'arrived' | 'in-progress' | 'finished' | 'cancelled';

  // Who visited
  subject: { reference: string };  // 'Patient/123'

  // When
  period: {
    start: string;  // Check-in time
    end: string;    // Check-out time
  };

  // Type of visit
  type: [{
    coding: [{
      code: string;  // 'ambulatory' | 'inpatient' | 'emergency'
    }]
  }];

  // Who saw them
  participant: [{
    individual: { reference: string };  // 'Practitioner/456'
  }];
}
```

---

### Observation - Clinical Measurements

**Analogy: Lab Results / Vital Signs**
> Any measurement or finding: blood pressure, lab test, diagnosis finding.

```typescript
interface Observation {
  resourceType: 'Observation';

  status: 'final' | 'preliminary' | 'cancelled';

  // What was measured
  code: {
    coding: [{
      system: string;   // 'http://loinc.org'
      code: string;     // '8867-4' = Heart rate LOINC code
      display: string;  // 'Heart rate'
    }]
  };

  // Who it's about
  subject: { reference: string };  // 'Patient/123'

  // The value
  valueQuantity: {
    value: number;   // 72
    unit: string;    // 'beats/minute'
  };

  // When measured
  effectiveDateTime: string;  // '2024-01-15T10:30:00Z'
}
```

---

### Coverage - Insurance Info

**Analogy: Insurance Card**
> Coverage links a patient to their insurance company and plan.

```typescript
interface Coverage {
  resourceType: 'Coverage';

  // Who is covered
  beneficiary: { reference: string };  // 'Patient/123'

  // Insurance company
  payor: [{ reference: string }];  // 'Organization/insurance-co'

  // Policy number
  subscriberId: string;  // 'POL-12345'

  // Coverage period
  period: {
    start: string;  // '2024-01-01'
    end: string;    // '2024-12-31'
  };

  // Primary/secondary insurance
  order: number;  // 1 = primary, 2 = secondary
}
```

---

### AccessPolicy - Permissions

**Analogy: Key Card Access**
> AccessPolicy defines what resources a user can see/edit. Like a key card that only opens certain doors.

```typescript
interface AccessPolicy {
  resourceType: 'AccessPolicy';
  name: string;  // 'Nurse Access'

  // What resources can they access?
  resource: [
    {
      resourceType: string;  // 'Patient'
      readonly?: boolean;    // Can create/update?
      hidden?: boolean;      // Cannot see at all?
    }
  ];
}
```

**Permission Levels:**
| Level | Description |
|-------|-------------|
| `readonly: false` (default) | Full access (create, update, delete) |
| `readonly: true` | Can view, cannot edit |
| `hidden: true` | Cannot see at all |

---

### Questionnaire - Forms

**Analogy: Google Forms**
> Questionnaire defines a form structure. QuestionnaireResponse stores the filled-out answers.

```typescript
interface Questionnaire {
  resourceType: 'Questionnaire';
  title: string;           // 'Patient Intake Form'
  status: 'active' | 'draft' | 'retired';

  item: [{
    linkId: string;        // 'name'
    text: string;          // 'What is your name?'
    type: string;          // 'string' | 'choice' | 'boolean' | 'date'
    required?: boolean;
    answerOption?: [{
      valueString: string;
    }];
  }];
}
```

---

### ActivityDefinition - Service Catalog

**Analogy: Menu Items**
> ActivityDefinition is like a menu item - defines a service that can be ordered (medical procedures, lab tests).

```typescript
interface ActivityDefinition {
  resourceType: 'ActivityDefinition';

  title: string;  // 'Blood Test - Complete Blood Count'
  status: 'active' | 'draft' | 'retired';

  // Service code
  identifier: [{
    system: string;  // 'http://medimind.ge/nomenclature/service-code'
    value: string;   // 'LAB-001'
  }];

  // Category
  topic: [{
    text: string;    // 'Laboratory Studies'
  }];

  // Price (custom extension)
  extension: [{
    url: string;     // 'http://medimind.ge/extensions/base-price'
    valueMoney: {
      value: number;    // 50.00
      currency: string; // 'GEL'
    };
  }];
}
```

---

## Part 5: Automation System

### Subscriptions - Event Triggers

**Analogy: Email Notifications**
> "Notify me when X happens" - Subscriptions watch for changes and trigger actions.

```typescript
interface Subscription {
  resourceType: 'Subscription';
  status: 'active' | 'off';

  // What to watch
  criteria: string;  // 'Patient?active=true' = All active patients

  // What to do when it triggers
  channel: {
    type: 'rest-hook' | 'websocket' | 'email';
    endpoint: string;  // 'https://my-server.com/webhook'
  };
}
```

**Subscription Types:**
| Type | Description | Use Case |
|------|-------------|----------|
| `rest-hook` | HTTP POST to URL | Notify external system |
| `websocket` | Real-time push | Live dashboard updates |
| `email` | Send email | Alert notifications |

---

### Bots - Serverless Functions

**Analogy: Automated Assistants**
> Bots are code that runs automatically when triggered. Like macros in Excel.

**How Bots Work:**
```
Event (Patient created)
       ↓
Subscription matches
       ↓
Bot triggered
       ↓
Your code runs
       ↓
Result stored
```

**Example Bot Code:**
```typescript
import { BotEvent, MedplumClient } from '@medplum/core';

export async function handler(
  medplum: MedplumClient,
  event: BotEvent
): Promise<any> {
  // Get the patient that triggered this
  const patient = event.input;

  // Do something
  console.log(`New patient: ${patient.name[0].family}`);

  // Create an audit record
  await medplum.createResource({
    resourceType: 'AuditEvent',
    type: { code: 'patient-created' },
    entity: [{ what: { reference: `Patient/${patient.id}` } }]
  });

  return { success: true };
}
```

**Bot Runtimes:**
| Runtime | Where it Runs | Best For |
|---------|---------------|----------|
| `vmcontext` | In Medplum server | Simple tasks, fast |
| `awslambda` | AWS Lambda | Heavy processing |
| `fission` | Kubernetes | Self-hosted |

---

### Agents - External Connectors

**Analogy: Embassy**
> Agents are like embassies in foreign countries - they represent your server in external systems.

**What Agents Do:**
- Connect to external devices (lab equipment, printers)
- Bridge incompatible systems
- Run on remote machines
- Communicate via WebSocket

**Agent vs Bot:**
| Feature | Bot | Agent |
|---------|-----|-------|
| Where | Inside Medplum | External machine |
| Trigger | Subscriptions | Messages from server |
| Use case | Data processing | Device integration |
| Connection | N/A | WebSocket |

**Agent Operations:**
```bash
# Check if agent is online
GET /Agent/123/$status

# Send data through agent to device
POST /Agent/123/$push
{ "body": "data", "destination": "Device/456" }

# Get agent logs
GET /Agent/123/$fetch-logs
```

---

## Part 6: Security & Auth

### Authentication Flow

**Analogy: Hotel Check-in**
> You show ID (credentials), get a room key (token), use key to access your room (API).

**OAuth 2.0 Flow:**
```
1. User enters credentials
       ↓
2. Server validates, returns tokens
       ↓
3. Access token used for API calls
       ↓
4. Refresh token gets new access token when expired
```

**Code Example:**
```typescript
// Login
await medplum.signIn('user@example.com', 'password');

// Token is automatically attached to requests
const patients = await medplum.searchResources('Patient');

// Check if authenticated
if (medplum.getProfile()) {
  console.log('Logged in!');
}
```

---

### Access Policies - Fine-Grained Control

**Analogy: Security Clearance Levels**
> Different roles see different things. A nurse can see patient vitals, but not billing.

**Example Policy:**
```json
{
  "resourceType": "AccessPolicy",
  "name": "Nurse Policy",
  "resource": [
    { "resourceType": "Patient" },
    { "resourceType": "Observation" },
    { "resourceType": "Encounter" },
    { "resourceType": "Claim", "hidden": true },
    { "resourceType": "Invoice", "hidden": true }
  ]
}
```

---

### AuditEvent - Compliance Logging

**Analogy: Security Camera Footage**
> Every action is recorded. Who did what, when, to which resource.

```typescript
interface AuditEvent {
  resourceType: 'AuditEvent';

  // What happened
  type: {
    code: string;  // '110110' = DICOM code for Patient record access
  };

  // When
  recorded: string;  // '2024-01-15T10:30:00Z'

  // Who
  agent: [{
    who: { reference: string };  // 'Practitioner/123'
  }];

  // What was affected
  entity: [{
    what: { reference: string };  // 'Patient/456'
  }];

  // Success or failure
  outcome: string;  // '0' = success
}
```

---

## Part 7: Your MediMind Project

### EMR Structure

```
packages/app/src/emr/
├── views/                 # Page components
│   ├── registration/      # Patient registration
│   ├── patient-history/   # Visit history
│   ├── nomenclature/      # Medical services
│   ├── account-management/# Staff accounts
│   └── role-management/   # Roles & permissions
├── components/            # Reusable UI pieces
├── services/              # API calls (FHIR operations)
├── hooks/                 # React hooks
├── types/                 # TypeScript interfaces
└── translations/          # i18n (ka/en/ru)
```

---

### Common Patterns in Your Codebase

**1. Service Pattern (FHIR Operations):**
```typescript
// services/patientService.ts
export async function createPatient(
  medplum: MedplumClient,
  values: PatientFormValues
): Promise<Patient> {
  return medplum.createResource({
    resourceType: 'Patient',
    name: [{ given: [values.firstName], family: values.lastName }],
    // ... map form values to FHIR
  });
}
```

**2. Hook Pattern (Data Fetching):**
```typescript
// hooks/usePatients.ts
export function usePatients(filters: PatientFilters) {
  const medplum = useMedplum();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    medplum.searchResources('Patient', filters)
      .then(setPatients)
      .finally(() => setLoading(false));
  }, [filters]);

  return { patients, loading };
}
```

**3. Translation Pattern:**
```typescript
// Using translations
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t, lang } = useTranslation();
  return <h1>{t('registration.title')}</h1>;
}
```

---

### Key Files to Know

| File | Purpose |
|------|---------|
| `packages/app/src/emr/EMRPage.tsx` | Main EMR layout |
| `packages/app/src/emr/styles/theme.css` | Global CSS variables |
| `packages/app/src/emr/translations/*.json` | i18n strings |
| `packages/app/src/emr/services/*Service.ts` | FHIR API calls |
| `packages/app/src/emr/hooks/use*.ts` | React hooks |
| `packages/app/src/emr/types/*.ts` | TypeScript interfaces |

---

## Quick Reference Cheat Sheet

### FHIR Resource URLs
```
CREATE:  POST   /fhir/R4/{ResourceType}
READ:    GET    /fhir/R4/{ResourceType}/{id}
UPDATE:  PUT    /fhir/R4/{ResourceType}/{id}
DELETE:  DELETE /fhir/R4/{ResourceType}/{id}
SEARCH:  GET    /fhir/R4/{ResourceType}?{params}
```

### MedplumClient Methods
```typescript
medplum.createResource(resource)     // Create new resource
medplum.readResource(type, id)       // Get by ID
medplum.updateResource(resource)     // Update existing
medplum.deleteResource(type, id)     // Delete resource
medplum.searchResources(type, params) // Search, returns array
medplum.search(type, params)         // Search, returns Bundle
```

### Common Search Parameters
```
?name=John              # Patient name
?identifier=123         # External ID
?_id=abc                # Internal ID
?_count=20              # Limit results
?_offset=40             # Pagination
?_sort=-date            # Sort descending
?date=ge2024-01-01      # Date >= Jan 1
?subject=Patient/123    # Reference filter
```

### Resource Type Quick Guide
| Need | Use Resource |
|------|-------------|
| Store person's info | `Patient` |
| Store staff info | `Practitioner` |
| Staff's job/role | `PractitionerRole` |
| Hospital visit | `Encounter` |
| Lab result/measurement | `Observation` |
| Diagnosis | `Condition` |
| Prescription | `MedicationRequest` |
| Insurance | `Coverage` |
| Service catalog | `ActivityDefinition` |
| Form template | `Questionnaire` |
| Form answers | `QuestionnaireResponse` |
| Permissions | `AccessPolicy` |
| Audit trail | `AuditEvent` |

---

## Learning Resources

1. **Official FHIR Docs**: https://hl7.org/fhir/R4/
2. **Medplum Docs**: https://www.medplum.com/docs
3. **FHIR Resource List**: https://hl7.org/fhir/R4/resourcelist.html
4. **Medplum React Components**: https://storybook.medplum.com

---

*Created for MediMind EMR Project - 2024*
