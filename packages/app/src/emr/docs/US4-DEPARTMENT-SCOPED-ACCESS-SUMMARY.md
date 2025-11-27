# User Story 4: Department-Scoped Access - Implementation Summary

## Overview
Implemented department-scoped access control to restrict user permissions to resources within their assigned department. This enables healthcare organizations to enforce departmental boundaries on patient data, encounters, observations, and other sensitive resources.

## Implementation Date
2025-11-27

## Components Created

### 1. DepartmentSelector Component
**File**: `/packages/app/src/emr/components/account-management/DepartmentSelector.tsx`

- Searchable dropdown for department selection
- Fetches Organization resources with `type='dept'`
- Shows department name with ID fallback
- Supports disabled, required, error states
- Fully tested with 9 passing tests

**Usage**:
```typescript
<DepartmentSelector
  value={departmentId}
  onChange={setDepartmentId}
  label="Department"
  required
/>
```

### 2. Department Scoping Function
**File**: `/packages/app/src/emr/services/permissionService.ts`

Added `addDepartmentScoping()` function:
- Adds FHIR compartment criteria to AccessPolicy resources
- Scopes: Patient, Encounter, Observation, DocumentReference, ServiceRequest
- Uses format: `{ResourceType}?_compartment=Organization/{departmentId}`
- Fully tested with 8 passing tests

**Example**:
```typescript
const resources = [
  { resourceType: 'Patient', readonly: false },
  { resourceType: 'Encounter', readonly: false },
];

const scoped = addDepartmentScoping(resources, 'dept-cardiology');
// Result:
// [
//   { resourceType: 'Patient', readonly: false, criteria: 'Patient?_compartment=Organization/dept-cardiology' },
//   { resourceType: 'Encounter', readonly: false, criteria: 'Encounter?_compartment=Organization/dept-cardiology' },
// ]
```

### 3. Department-Scoped Role Creation
**File**: `/packages/app/src/emr/services/roleService.ts`

Added `createDepartmentScopedRole()` function:
- Creates AccessPolicy with department compartment restrictions
- Adds `http://medimind.ge/department-scope` tag with department ID
- Creates audit event with department context
- Fully tested with 9 passing tests

**Example**:
```typescript
const role = await createDepartmentScopedRole(
  medplum,
  {
    code: 'dept-physician',
    name: 'Department Physician',
    status: 'active',
    permissions: ['view-patient-demographics', 'view-encounters'],
  },
  'dept-cardiology'
);
```

### 4. useDepartmentContext Hook
**File**: `/packages/app/src/emr/hooks/useDepartmentContext.ts`

- Fetches current user's department from PractitionerRole
- Returns department ID or null if no department assigned
- Handles errors gracefully
- Fully tested with 7 passing tests

**Usage**:
```typescript
function MyComponent() {
  const departmentId = useDepartmentContext();

  if (departmentId) {
    // User has department assignment
    console.log('Department:', departmentId);
  }
}
```

## Translations Added

Added to `ka.json`, `en.json`, `ru.json`:
- `department.label`: "განყოფილება" / "Department" / "Отделение"
- `department.selectPlaceholder`: "აირჩიეთ განყოფილება..." / "Select department..." / "Выберите отделение..."
- `department.all`: "ყველა განყოფილება" / "All Departments" / "Все отделения"

## Testing Summary

**Total Tests**: 33 passing
- DepartmentSelector: 9 tests
- useDepartmentContext: 7 tests
- addDepartmentScoping: 8 tests
- createDepartmentScopedRole: 9 tests

**Test Coverage**:
- Component rendering and interaction
- Department fetching and error handling
- FHIR resource scoping logic
- AccessPolicy tag structure
- Audit event creation
- Permission dependency resolution

## FHIR Data Model

### AccessPolicy Structure (Department-Scoped)
```typescript
{
  resourceType: 'AccessPolicy',
  meta: {
    tag: [
      {
        system: 'http://medimind.ge/role-identifier',
        code: 'dept-physician',
        display: 'Department Physician'
      },
      {
        system: 'http://medimind.ge/role-status',
        code: 'active',
        display: 'Active'
      },
      {
        system: 'http://medimind.ge/department-scope',
        code: 'dept-cardiology',
        display: 'Department Scoped'
      }
    ]
  },
  resource: [
    {
      resourceType: 'Patient',
      readonly: false,
      criteria: 'Patient?_compartment=Organization/dept-cardiology'
    },
    {
      resourceType: 'Encounter',
      readonly: false,
      criteria: 'Encounter?_compartment=Organization/dept-cardiology'
    }
  ]
}
```

### PractitionerRole with Department
```typescript
{
  resourceType: 'PractitionerRole',
  active: true,
  practitioner: { reference: 'Practitioner/123' },
  organization: { reference: 'Organization/dept-cardiology' }
}
```

## Implementation Notes

### Scoped Resource Types
The following FHIR resource types are scoped to departments:
1. **Patient** - Patient demographics and core data
2. **Encounter** - Patient visits and encounters
3. **Observation** - Lab results, vitals, clinical observations
4. **DocumentReference** - Clinical documents and attachments
5. **ServiceRequest** - Lab orders, imaging requests

### Non-Scoped Resources
Administrative resources are NOT scoped to departments:
- Practitioner (users can see all staff)
- Organization (users can see all departments)
- AccessPolicy (role management is organization-wide)
- AuditEvent (audit logs are organization-wide)

### Department Resolution
The `useDepartmentContext` hook:
1. Gets current user's Practitioner profile
2. Searches for active PractitionerRole resources
3. Extracts department from `PractitionerRole.organization.reference`
4. Returns first department ID found (users can have multiple roles)

## Future Enhancements

### Potential Improvements
1. **Multi-Department Support**: Allow users to switch between multiple assigned departments
2. **Department Hierarchy**: Support parent-child department relationships with inherited access
3. **Cross-Department Access**: Enable temporary cross-department access with approval workflow
4. **Department Metrics**: Track department-scoped permission usage in analytics
5. **Bulk Department Assignment**: Admin UI for assigning departments to multiple users

### Integration Points
- **AccountManagementView**: Add DepartmentSelector to account creation/editing
- **RoleManagementView**: Add department scoping option when creating roles
- **Dashboard**: Show department context indicator in top navigation
- **Reports**: Filter reports by department

## Security Considerations

### Access Control
- Department scoping uses FHIR compartment mechanism (standard FHIR security feature)
- Medplum server enforces compartment boundaries at query level
- Cannot bypass department restrictions through direct API calls
- Audit events track all department-scoped operations

### Best Practices
1. **Least Privilege**: Assign minimal necessary departments to each user
2. **Regular Audits**: Review department assignments quarterly
3. **Separation of Duties**: Administrative roles should not be department-scoped
4. **Emergency Access**: Maintain organization-wide "emergency access" role for critical situations

## Migration Guide

### Adding Department Scoping to Existing Roles

1. **Identify Roles to Scope**:
   ```typescript
   // Example: Department physician role
   const role = {
     code: 'dept-physician',
     name: 'Department Physician',
     permissions: ['view-patient-demographics', 'view-encounters']
   };
   ```

2. **Create Department-Scoped Version**:
   ```typescript
   import { createDepartmentScopedRole } from '@/emr/services/roleService';

   const scopedRole = await createDepartmentScopedRole(
     medplum,
     role,
     'dept-cardiology'
   );
   ```

3. **Assign Department to Users**:
   ```typescript
   // Update PractitionerRole to include department
   const practitionerRole: PractitionerRole = {
     resourceType: 'PractitionerRole',
     active: true,
     practitioner: { reference: `Practitioner/${userId}` },
     organization: { reference: 'Organization/dept-cardiology' },
     meta: {
       tag: [{ system: 'http://medimind.ge/role-assignment', code: 'dept-physician' }]
     }
   };
   ```

## Related Documentation
- **Permission System**: `/specs/008-permission-system-redesign/spec.md`
- **Role Management**: `CLAUDE.md` (Role and Permission Management System section)
- **FHIR Compartments**: https://hl7.org/fhir/R4/compartmentdefinition.html
- **Medplum Access Policies**: https://www.medplum.com/docs/access/access-policies

## Status
✅ **COMPLETE** - All tasks implemented and tested (33/33 tests passing)
