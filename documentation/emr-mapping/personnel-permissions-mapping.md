# EMR Personnel & Permissions System Mapping

**Source**: SoftMedic EMR at http://178.134.21.82:8008/
**Mapped Date**: 2025-11-27
**Location**: Settings > პერსონალი (Personnel)

---

## 1. Personnel Types (ჯგუფები / Groups)

The system has **16 personnel types** with configurable permissions and default landing pages:

| # | Georgian Name | English Translation | Default Landing Page |
|---|--------------|---------------------|---------------------|
| 1 | მფლობელი | Owner | - |
| 2 | გარე ორგანიზაცია | External Organization | - |
| 3 | ადმინ | Admin | - |
| 4 | ექიმი | Doctor | 2/22 (Patient History > History) |
| 5 | მენეჯერი | Manager | - |
| 6 | ოპერატორი | Operator | - |
| 7 | რეგისტრატორი | Registrar | - |
| 8 | ლაბორატორია / დიაგნოსტიკა | Laboratory / Diagnostics | 2/25 (Patient History > Laboratory) |
| 9 | ექთანი | Nurse | 2/23 (Patient History > Permissions) |
| 10 | კადრების მენეჯერი HR | HR Personnel Manager | - |
| 11 | უფროსი ექთანი | Senior Nurse | - |
| 12 | აფთიაქსი გამგე | Pharmacy Manager | - |
| 13 | მოლარე | Cashier | - |
| 14 | ადმინი ნახვის უფლებებით | Admin with View Rights | - |
| 15 | ბუღალტერია | Accounting | - |

### Default Landing Page Codes
- `2/22` = Patient History Tab > History Sub-tab
- `2/23` = Patient History Tab > Permissions Sub-tab
- `2/25` = Patient History Tab > Laboratory Sub-tab

---

## 2. Permission Categories (Top-Level)

The permission system has **4 main categories** at the root level:

| ID | Georgian | English | Description |
|----|----------|---------|-------------|
| 75 | მთავარი | Main | Main application permissions |
| 76 | HR | HR | Human Resources permissions |
| 77 | რეპორტები | Reports | Reporting permissions |
| 78 | ჩაწერები | Records | Recording/Scheduling permissions |

---

## 3. Complete Permission Hierarchy

### 3.1 მთავარი (Main) - ID: 75

```
75 - მთავარი (Main)
├── 6 - პაციენტის ისტორიის ტაბი (Patient History Tab)
│   ├── 7 - ისტორია (History)
│   │   ├── 11 - ისტორიის ქვეტაბში ისტორიის სტრიქონის წაშლა
│   │   ├── 12 - ისტორიის ქვეტაბში პროცედურების დამატება
│   │   ├── 14 - ისტორიის ქვეტაბში პროცედურების სტრიქონის წაშლა
│   │   ├── 206 - ფანქარში შესვლა (Pencil Entry)
│   │   │   ├── 215 - შენახვის ღილაკი (Save Button)
│   │   │   ├── 216 - საგარანტიოს დამატება (Add Warranty)
│   │   │   ├── 217 - საგარანტიოს რედაქტირება (Edit Warranty)
│   │   │   ├── 218 - საგარანტიოს წაშლა (Delete Warranty)
│   │   │   ├── 219 - ატაჩმენტის გაკეთება (Create Attachment)
│   │   │   ├── 220 - ატაჩმენტის წაშლა (Delete Attachment)
│   │   │   ├── 221 - ერთი პაციენტის მეორით ჩანაცვლება (Replace Patient)
│   │   │   └── 378 - ქეისის ნომრის დამახსოვრება (Save Case Number)
│   │   ├── 207 - პროცედურაზე ორჯერდაწკაპუნებაზე შესვლა (Procedure Double-Click)
│   │   │   ├── 236-260 - Various salary and procedure edit permissions
│   │   │   ├── 496 - დასახელების შეცვლა (პასუხებს ტოვებს უცვლელს)
│   │   │   ├── 503 - კვლევის აღდგენა (Research Recovery)
│   │   │   ├── 504 - კვლევის გაუქმება (Cancel Research)
│   │   │   ├── 511 - მაქსიმალური დღეების რაოდენობის შეცვლა
│   │   │   └── 514 - ხელფასის თოლიის გამორთვა
│   │   ├── 208 - კალკულაციაში შესვლა (Calculation Entry)
│   │   │   ├── 293-296 - Transfer and ZIP download permissions
│   │   │   └── 299-301 - Insurance calculation permissions
│   │   ├── 209 - ანალიზებში შესვლა (Analysis Entry)
│   │   │   ├── 261 - ანალიზის დაბეჭდვა (Print Analysis)
│   │   │   └── 262 - პასუხის მაილზე გაგზავნა (Send Response Email)
│   │   ├── 210 - ხელფასებში შესვლა (Salary Entry)
│   │   │   ├── 263 - ხელფასის დამახსოვრება (Save Salary)
│   │   │   └── 264-265 - Amount salary permissions
│   │   ├── 211 - გადახდაში შესვლა (Payment Entry)
│   │   │   ├── 222-235 - Various payment permissions
│   │   │   ├── 242-245 - Blue page and search permissions
│   │   │   ├── 499 - ძველი თარიღით გადახდა (Old Date Payment)
│   │   │   ├── 599 - სხვისი გადახდის წაშლა (Delete Others' Payment)
│   │   │   └── 600 - სხვისი გადახდის რედაქტირება (Edit Others' Payment)
│   │   ├── 212 - გაწერაში შესვლა (Discharge Entry)
│   │   │   ├── 266 - ისტორიის დაბლოკვა (Lock History)
│   │   │   ├── 267 - ისტორიის ბლოკის მოხსნა (Unlock History)
│   │   │   ├── 268 - პაციენტის გაწერა (Discharge Patient)
│   │   │   └── 269 - პაციენტის გაწერის გაუქმება (Cancel Discharge)
│   │   ├── 213 - გადაწერაში შესვლა (Transfer Entry)
│   │   │   ├── 270-273 - Patient transfer permissions
│   │   ├── 214 - ინვოისში შესვლა (Invoice Entry)
│   │   │   ├── 274 - ინვოისის შექმნა (Create Invoice)
│   │   │   └── 275 - უფორმო ინვოისის შექმნა (Create Informal Invoice)
│   │   ├── 279 - სტაციონარულ ისტორიაზე კვლევების ნახვა (View Stationary Research)
│   │   │   ├── 276-278, 394, 497 - Research add/edit/delete permissions
│   │   ├── 379 - ხელფასებზე ძველი ხელფასების შენახვა, წაშლა დამატება
│   │   └── 509 - ძველი ისტორიის (რეგისტრაციის) წაშლა
│   ├── 9 - ჩემი პაციენტები (My Patients)
│   │   ├── 280-282, 380 - Operation schedule permissions
│   │   ├── 390-393 - Department head and quality control flags
│   │   ├── 395-401 - Various delete/edit permissions for protected records
│   │   ├── 491 - სტაციონარული შეკვეთის წაშლა
│   │   ├── 512 - სხვა ექიმის შექმნილი რეგისტრაციის წაშლა
│   │   ├── 560-567 - Form and ICSI protocol permissions
│   │   └── 607 - ქვევიზიტის წაშლა
│   ├── 91 - სუროგაცია (Surrogacy)
│   │   └── 283-286 - Surrogate/donor management permissions
│   ├── 92 - ინვოისები (Invoices)
│   │   ├── 287-289 - Invoice creation permissions
│   │   └── 495 - ინვოისის წაშლა
│   ├── 93 - 100 რეპორტი (Form 100 Report)
│   │   └── 290 - ფორმა100ის ნომრის რედაქტირება
│   ├── 94 - გაწერები (Discharges)
│   │   ├── 291 - გაწერებში თოლიის მონიშვნა
│   │   └── 292 - გაწერებში ექსელის გადმოტვირთვა
│   ├── 95 - შესრულება (Execution)
│   │   ├── 297-298 - Diagnosis add/delete
│   │   ├── 492 - ინფოში, სხვისი ჩაგდებული შეკვეთის წაშლა
│   │   └── 515 - ხელფასებში თოლიის გამორთვა
│   ├── 96 - ლაბორატორია (Laboratory)
│   │   ├── 302-304 - Lab research permissions
│   │   ├── 498 - დასახელების შეცვლა (პასუხებს ტოვებს უცვლელს)
│   │   └── 595 - სტაციონარული შეკვეთის წაშლა
│   ├── 97 - მორიგეობა (Duty)
│   │   ├── 305-307 - Duty add/delete/reschedule
│   │   ├── 505 - მორიგეობის ბლოკირება
│   │   └── 506 - მორიგეობის ბლოკის მოხსნა
│   ├── 98 - დანიშნულება (Assignment)
│   │   ├── 568 - ანალიზის ნიმუშის აღების თოლიის მონიშვნა
│   │   └── 569 - ანალიზის ნიმუშის აღების თოლიის მოხსნა
│   ├── 99 - სტაციონარი (Stationary)
│   │   ├── 308-309 - Medication/research add/delete
│   │   ├── 381 - საკუთარი ჩაგდებულის წაშლის უფლება
│   │   ├── 500 - ძველი თარიღით ჩაგდება
│   │   └── 501 - ძველი თარიღით წაშლა
│   ├── 100 - კვება (Nutrition)
│   │   ├── 310 - კვების ჩაგდება
│   │   └── 311 - კვების წაშლა
│   ├── 101 - MOH
│   └── 570 - ნიმუშების ისტორია (Sample History)
│       ├── 571 - რეგისტრაციის წაშლა
│       ├── 578 - პროცედურის წაშლა
│       └── 579 - პროცედურის დამატება
├── 36 - ადმინისტრირების ტაბი (Administration Tab)
│   ├── 116-127 - Warehouse/inventory management
│   │   └── Various sub-permissions for receiving, transfers, orders
├── 50 - ანგარიშები ტაბი (Accounts Tab)
│   ├── 51-52 - Supplier debt/amount
│   ├── 56-57 - Insurance debt/amount
│   ├── 61 - კომპანიები (Companies)
│   ├── 128-134 - Insurance, donors, amounts, payments, creditors, types
├── 72 - ნომენკლატურის ტაბი (Nomenclature Tab)
│   ├── 102 - სამედიცინო I (Medical I)
│   │   ├── 312-366 - Research add/edit/delete, calculation, salary, tag permissions
│   │   └── 510, 513 - Price add/delete
│   ├── 103 - სამედიცინო II (Medical II)
│   ├── 106 - სასაქონლო (Commodity)
│   │   └── 362-372 - Product add/edit/delete, numerus, tag permissions
│   ├── 107 - ლაბორატორიული (Laboratory)
│   ├── 108 - ფასები (Prices)
│   ├── 109 - ფასების სია (Price List)
│   ├── 110 - ICD10, NCSP, ICPC-2R
│   ├── 111 - LAB aliases
│   ├── 112 - ჯგუფები (Groups)
│   ├── 113 - ფიზიკალური (Physical)
│   ├── 114 - ფორმები (Forms)
│   │   └── 403-408 - Form header/item add/edit/delete
│   └── 115 - სეთინგი (Settings)
├── 74 - რეგისტრაციის ტაბი (Registration Tab)
│   ├── 1 - რეგისტრაციის ქვეტაბი (Registration Sub-tab)
│   │   ├── 2-4 - Patient add/edit/delete
│   │   ├── 178-181 - MOH.gov patient fetch
│   │   ├── 204-205 - New visit form/creation
│   │   ├── 507-508 - Old patient edit/delete
│   │   └── 601 - წარსული თარიღით რეგისტრაცია
│   ├── 81 - მიმღები (Reception)
│   │   └── 182-187 - Reception permissions
│   ├── 84 - კონტრაქტები (Contracts)
│   │   └── 188-191, 246 - Contract CRUD
│   ├── 86 - სტაციონარი (Stationary)
│   │   └── 192-196 - Stationary search/export
│   ├── 87 - ვალები (Debts)
│   │   └── 197, 247 - Debt search/export
│   ├── 88 - ავანსები (Advances)
│   │   └── 198 - Advance search
│   ├── 89 - არქივი (Archive)
│   │   └── 199-201 - Archive search/open/save
│   ├── 90 - მიმართვები (Referrals)
│   │   └── 202-203 - Referral search/print
│   ├── 572 - ნიმუშის რეგისტრაცია (Sample Registration)
│   │   └── 573 - რეგისტრაციის წაშლა
│   └── 574 - ვალუტა (Currency)
└── 83 - ფორვარდის ტაბი (Forward Tab)
    ├── 135-137 - Sales/sales group permissions
    │   └── 527-536 - Sales edit/delete (old/new)
    ├── 138-140 - Write-off permissions
    │   └── 538-547 - Write-off edit/delete (old/new)
    └── 141-143 - Return permissions
        └── 548-557 - Return edit/delete (old/new)
```

---

## 4. Permission Logic

### 4.1 Hierarchy Structure
- Permissions use **parent-child relationships** via `მიბმის ID` (Parent ID)
- Parent ID = 0 means root-level permission
- Child permissions inherit access from parent (if parent unchecked, children inaccessible)

### 4.2 Permission Values
- **კი** (Yes) = Permission granted
- **არა** (No) = Permission denied

### 4.3 Special Permission Patterns

| Pattern | Description |
|---------|-------------|
| "ძველი" prefix | Old/historical record permissions (stricter) |
| "სხვისი" prefix | Other users' records (admin-only) |
| "წაშლა" suffix | Delete permission |
| "რედაქტირება" suffix | Edit permission |
| "დამატება" suffix | Add permission |
| "თოლიის მონიშვნა/მოხსნა" | Flag mark/unmark |
| "ბლოკირება/ბლოკის მოხსნა" | Lock/unlock |

---

## 5. Permission Matrix by Role

### 5.1 High-Privilege Roles
| Role | მთავარი | HR | რეპორტები | ჩაწერები | Special Access |
|------|---------|----|-----------|-----------|--------------------|
| მფლობელი (Owner) | არა | არა | არა | არა | System owner - external |
| გარე ორგანიზაცია | არა | არა | არა | არა | External org - limited |
| ადმინი | არა | არა | არა | არა | Full admin access |

### 5.2 Clinical Roles
| Role | მთავარი | HR | რეპორტები | ჩაწერები | Primary Functions |
|------|---------|----|-----------|-----------|--------------------|
| ექიმი (Doctor) | არა | არა | არა | კი | Patient care, history |
| ექთანი (Nurse) | კი | არა | არა | კი | Patient support |
| უფროსი ექთანი | კი | არა | არა | კი | Senior nursing |
| ლაბორატორია | კი | არა | არა | კი | Lab work |

### 5.3 Administrative Roles
| Role | მთავარი | HR | რეპორტები | ჩაწერები | Primary Functions |
|------|---------|----|-----------|-----------|--------------------|
| მენეჯერი | კი | არა | არა | კი | Management |
| ოპერატორი | კი | არა | არა | კი | Operations |
| რეგისტრატორი | კი | არა | არა | კი | Registration |
| კადრების მენეჯერი HR | კი | არა | არა | კი | HR management |

### 5.4 Financial/Support Roles
| Role | მთავარი | HR | რეპორტები | ჩაწერები | Primary Functions |
|------|---------|----|-----------|-----------|--------------------|
| აფთიაქსი გამგე | კი | არა | არა | კი | Pharmacy |
| მოლარე (Cashier) | კი | არა | არა | კი | Payments |
| ბუღალტერია | კი | არა | არა | კი | Accounting |
| ადმინი ნახვის უფლებებით | კი | არა | არა | კი | View-only admin |

---

## 6. Restricted Permissions (Admin-Only)

The following permissions are restricted to specific admin roles only:

| ID | Permission | Description |
|----|------------|-------------|
| 599 | სხვისი გადახდის წაშლა | Delete others' payments |
| 600 | სხვისი გადახდის რედაქტირება | Edit others' payments |
| 393 | ხარისხის კონტროლის თოლიის მოხსნა | Remove quality control flag |
| 562 | ისტორია მზად არის თოლიის მონიშვნა | Mark history ready flag |
| 563 | ისტორია მზად არის თოლიის მოხსნა | Remove history ready flag |
| 566 | ICSI პროტოკოლის დაბლოკვა | Lock ICSI protocol |
| 567 | ICSI პროტოკოლის გახსნა | Unlock ICSI protocol |
| 595 | სტაციონარული შეკვეთის წაშლა | Delete stationary order |
| 601 | წარსული თარიღით რეგისტრაცია | Past date registration |

---

## 7. Navigation Structure

### 7.1 Main Tabs (Row 1)
1. ზოგადი (General)
2. პერსონალი (Personnel) - **Current section**
3. ინსტრუმენტები I (Instruments I)
4. ინსტრუმენტები II (Instruments II)

### 7.2 Personnel Sub-tabs (Row 2)
1. ექაუნთები (Accounts)
2. გარე ექაუნთები (External Accounts)
3. ტეგები (Tags)
4. **უფლებები (Permissions)** - Permission assignment by group
5. **ჯგუფები (Groups)** - Group/role management
6. **უფლებების სია (Permission List)** - Full permission export
7. სასაწყობე აქტები (Warehouse Acts)
8. ფილიალები (Branches)

---

## 8. API Endpoints (Observed)

| Action | Method | Endpoint |
|--------|--------|----------|
| Load permissions page | GET | `clinic.php#2s23` |
| Load groups page | GET | `clinic.php#2s24` |
| Load permission list | GET | `clinic.php#2s25` |
| Export all permissions | GET | Downloads `.xlsx` file |
| Save permissions | POST | (via შენახვა button) |

---

## 9. Implementation Notes for MediMind

### 9.1 FHIR Resource Mapping

| EMR Concept | FHIR Resource |
|-------------|---------------|
| ჯგუფი (Group/Role) | PractitionerRole.code |
| უფლება (Permission) | AccessPolicy.resource[].resourceType |
| Permission hierarchy | AccessPolicy with nested rules |
| Default landing page | Extension on PractitionerRole |

### 9.2 Required Components

1. **RoleManagementView** - List/create/edit roles (ჯგუფები)
2. **PermissionTree** - Hierarchical checkbox tree
3. **RolePermissionMatrix** - Visual permission assignment
4. **DefaultPageSelector** - Set default landing page per role

### 9.3 Database Schema Considerations

```typescript
interface PermissionNode {
  id: number;
  name: string;           // Georgian name
  parentId: number;       // 0 = root
  children?: PermissionNode[];
}

interface RolePermissions {
  roleCode: string;
  roleName: string;
  defaultPage?: string;   // e.g., "2/22"
  permissions: number[];  // Array of permission IDs
}
```

---

## 10. Account Management (ექაუნთები)

### 10.1 Account Form Fields

#### Personal Information
| Field | Georgian | Required | Type |
|-------|----------|----------|------|
| სახელი | Name | Yes* | Text |
| გვარი | Surname | Yes* | Text |
| პირადი ნომერი | Personal ID | No | Text (11 digits) |
| დაბადების თარიღი | Birth Date | No | Date picker |
| სქესი | Gender | Yes* | Dropdown |
| მისამართი | Address | No | Text |
| ტელეფონი | Phone | No | Text |
| იმეილი | Email | No | Email |

#### Gender Options
- მამრობითი (Male)
- მდედრობითი (Female)

#### Branch/Department Assignment
| Field | Georgian | Required | Type |
|-------|----------|----------|------|
| ფილიალი | Branch | Yes* | Dropdown |
| განყოფილება | Department | Yes* | Dropdown |

#### Program User Creation
Checkbox: **პროგრამის მომხმარებლის შექმნა** (Create Program User)

When checked, enables:
| Field | Georgian | Type |
|-------|----------|------|
| მომხმარებელი | Username | Text |
| პაროლი | Password | Password |
| გაიმეორეთ პაროლი | Repeat Password | Password |
| ჯგუფი | Group/Role | Dropdown (14 options) |

#### Access Control
| Field | Georgian | Description |
|-------|----------|-------------|
| ლოკალური წვდომა | Local Access | Checkbox + IP filtering |
| გარე წვდომა | External Access | Checkbox + IP filtering |

### 10.2 Medical Specialty Categories (22 options)

| Georgian | English |
|----------|---------|
| საოპერაციო ექთნები | Surgery Nurses |
| რენტგენის ოპერატორები | X-ray Operators |
| ჩირქოვანი ქირურგია | Purulent Surgery |
| მიკროქირურგები | Microsurgeons |
| MD, PHD რადიოლოგი | MD, PhD Radiologist |
| ექოსკოპისტები | Sonographers |
| CT ოპერატორები | CT Operators |
| რადიოლოგია REN | Radiology REN |
| რადიოლოგია CT | Radiology CT |
| სხვა | Other |
| ანესთეზიის ექთნები | Anesthesia Nurses |
| კარდიოქირურგიის ექიმები | Cardiac Surgery Doctors |
| საოპერაციო ექთანი/დამხმარე | Surgery Nurse/Assistant |
| რეანიმაციის ექთნები | ICU Nurses |
| ანესთეზიოლოგია | Anesthesiology |
| ანგიოლოგები | Angiologists |
| არითმოლოგები | Arrhythmologists |
| უროლოგები | Urologists |
| ნეიროქირურგები | Neurosurgeons |
| ინტერვენცია | Intervention |
| ტრავმატოლოგები | Traumatologists |
| ზოგადი ქირურგები | General Surgeons |

### 10.3 Account Table Columns

| Column | Georgian | Description |
|--------|----------|-------------|
| ☐ | Selection | Checkbox for bulk actions |
| + | Expand | Expand row details |
| სახელი | Name | First name |
| გვარი | Surname | Last name |
| დაბადების თარიღი | Birth Date | Date format |
| მისამართი | Address | Full address |
| ტელეფონი | Phone | Phone number |
| იმეილი | Email | Email address |
| მომხმარებელი | Username | Login username |
| ჯგუფი | Group | Assigned role |
| Actions | - | Edit/delete buttons |

### 10.4 Actions Available
- **დამატება** (Add) - Create new account
- **ქმედება** (Action) - Bulk action on selected rows

---

## 11. Export Data Reference

The complete permission export is available at:
`.playwright-mcp/20251127173133A---27-11-2025.xlsx`

This file contains:
- All 300+ permissions with IDs and names
- Parent-child relationships
- Permission status for all 14 personnel types

---

## 12. Screenshots Reference

| Screenshot | Description | Path |
|------------|-------------|------|
| Groups Page | Personnel types table | `.playwright-mcp/page-2025-11-27T13-32-18-490Z.png` |
| Accounts Page | Account form and table | `.playwright-mcp/page-2025-11-27T13-34-53-331Z.png` |
