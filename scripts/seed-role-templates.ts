#!/usr/bin/env tsx
/**
 * Seed Role Templates Script
 *
 * Creates all 16 role templates as AccessPolicy resources in Medplum.
 * Skips roles that already exist (by code) to prevent duplicates.
 *
 * Steps to run:
 * 1. Open http://localhost:3000 in your browser
 * 2. Login with your admin account
 * 3. Open DevTools (F12) → Application tab → Local Storage
 * 4. Copy the "accessToken" from "activeLogin"
 *
 * Usage:
 *   export MEDPLUM_TOKEN="your-access-token-here"
 *   npx tsx scripts/seed-role-templates.ts
 *
 * Or pass token as argument:
 *   npx tsx scripts/seed-role-templates.ts "your-access-token-here"
 */

import type { AccessPolicy, AccessPolicyResource } from '@medplum/fhirtypes';

// Base URL for Medplum server
const MEDPLUM_BASE_URL = process.env.MEDPLUM_BASE_URL || 'http://localhost:8103';

// Role Templates - matches roleTemplateService.ts
interface RoleTemplate {
  code: string;
  name: string;
  description: string;
  departmentScoped: boolean;
  defaultPermissions: string[];
}

// Permission to FHIR resource mapping
const PERMISSION_RESOURCE_MAP: Record<string, { resourceType: string; accessLevel: 'read' | 'write' | 'admin' }> = {
  // Patient Management
  'view-patient-list': { resourceType: 'Patient', accessLevel: 'read' },
  'view-patient-demographics': { resourceType: 'Patient', accessLevel: 'read' },
  'edit-patient-demographics': { resourceType: 'Patient', accessLevel: 'write' },
  'create-patient': { resourceType: 'Patient', accessLevel: 'write' },
  'delete-patient': { resourceType: 'Patient', accessLevel: 'admin' },
  'view-patient-history': { resourceType: 'Encounter', accessLevel: 'read' },
  'merge-patients': { resourceType: 'Patient', accessLevel: 'admin' },
  'export-patient-data': { resourceType: 'Patient', accessLevel: 'read' },
  'view-patient-documents': { resourceType: 'DocumentReference', accessLevel: 'read' },
  'upload-patient-documents': { resourceType: 'DocumentReference', accessLevel: 'write' },
  'view-patient-photo': { resourceType: 'Patient', accessLevel: 'read' },
  'upload-patient-photo': { resourceType: 'Patient', accessLevel: 'write' },
  'view-patient-contacts': { resourceType: 'Patient', accessLevel: 'read' },
  'edit-patient-contacts': { resourceType: 'Patient', accessLevel: 'write' },
  'view-patient-insurance': { resourceType: 'Coverage', accessLevel: 'read' },

  // Clinical Documentation
  'view-encounters': { resourceType: 'Encounter', accessLevel: 'read' },
  'create-encounter': { resourceType: 'Encounter', accessLevel: 'write' },
  'edit-encounter': { resourceType: 'Encounter', accessLevel: 'write' },
  'delete-encounter': { resourceType: 'Encounter', accessLevel: 'admin' },
  'view-clinical-notes': { resourceType: 'DocumentReference', accessLevel: 'read' },
  'create-clinical-notes': { resourceType: 'DocumentReference', accessLevel: 'write' },
  'edit-clinical-notes': { resourceType: 'DocumentReference', accessLevel: 'write' },
  'sign-clinical-notes': { resourceType: 'DocumentReference', accessLevel: 'write' },
  'view-diagnoses': { resourceType: 'Condition', accessLevel: 'read' },
  'create-diagnosis': { resourceType: 'Condition', accessLevel: 'write' },
  'edit-diagnosis': { resourceType: 'Condition', accessLevel: 'write' },
  'view-procedures': { resourceType: 'Procedure', accessLevel: 'read' },
  'create-procedure': { resourceType: 'Procedure', accessLevel: 'write' },
  'view-medications': { resourceType: 'MedicationRequest', accessLevel: 'read' },
  'prescribe-medication': { resourceType: 'MedicationRequest', accessLevel: 'write' },
  'view-allergies': { resourceType: 'AllergyIntolerance', accessLevel: 'read' },
  'edit-allergies': { resourceType: 'AllergyIntolerance', accessLevel: 'write' },
  'edit-locked-records': { resourceType: 'Encounter', accessLevel: 'admin' },

  // Laboratory
  'view-lab-orders': { resourceType: 'ServiceRequest', accessLevel: 'read' },
  'create-lab-order': { resourceType: 'ServiceRequest', accessLevel: 'write' },
  'edit-lab-order': { resourceType: 'ServiceRequest', accessLevel: 'write' },
  'cancel-lab-order': { resourceType: 'ServiceRequest', accessLevel: 'write' },
  'view-lab-results': { resourceType: 'DiagnosticReport', accessLevel: 'read' },
  'enter-lab-results': { resourceType: 'DiagnosticReport', accessLevel: 'write' },
  'edit-lab-results': { resourceType: 'DiagnosticReport', accessLevel: 'write' },
  'approve-lab-results': { resourceType: 'DiagnosticReport', accessLevel: 'write' },
  'view-specimens': { resourceType: 'Specimen', accessLevel: 'read' },
  'manage-specimens': { resourceType: 'Specimen', accessLevel: 'write' },
  'view-lab-equipment': { resourceType: 'DeviceDefinition', accessLevel: 'read' },
  'manage-lab-equipment': { resourceType: 'DeviceDefinition', accessLevel: 'write' },

  // Billing & Financial
  'view-invoices': { resourceType: 'Invoice', accessLevel: 'read' },
  'create-invoice': { resourceType: 'Invoice', accessLevel: 'write' },
  'edit-invoice': { resourceType: 'Invoice', accessLevel: 'write' },
  'void-invoice': { resourceType: 'Invoice', accessLevel: 'admin' },
  'view-payments': { resourceType: 'PaymentReconciliation', accessLevel: 'read' },
  'process-payment': { resourceType: 'PaymentReconciliation', accessLevel: 'write' },
  'refund-payment': { resourceType: 'PaymentReconciliation', accessLevel: 'admin' },
  'view-claims': { resourceType: 'Claim', accessLevel: 'read' },
  'submit-claim': { resourceType: 'Claim', accessLevel: 'write' },
  'view-insurance-auth': { resourceType: 'CoverageEligibilityRequest', accessLevel: 'read' },
  'request-insurance-auth': { resourceType: 'CoverageEligibilityRequest', accessLevel: 'write' },
  'view-financial-reports': { resourceType: 'Invoice', accessLevel: 'read' },
  'export-financial-data': { resourceType: 'Invoice', accessLevel: 'read' },
  'view-debt-management': { resourceType: 'Invoice', accessLevel: 'read' },
  'manage-debt': { resourceType: 'Invoice', accessLevel: 'write' },

  // Administration
  'view-users': { resourceType: 'Practitioner', accessLevel: 'read' },
  'create-user': { resourceType: 'Practitioner', accessLevel: 'write' },
  'edit-user': { resourceType: 'Practitioner', accessLevel: 'write' },
  'deactivate-user': { resourceType: 'Practitioner', accessLevel: 'write' },
  'delete-user': { resourceType: 'Practitioner', accessLevel: 'admin' },
  'view-roles': { resourceType: 'AccessPolicy', accessLevel: 'read' },
  'create-role': { resourceType: 'AccessPolicy', accessLevel: 'write' },
  'edit-role': { resourceType: 'AccessPolicy', accessLevel: 'write' },
  'delete-role': { resourceType: 'AccessPolicy', accessLevel: 'admin' },
  'assign-roles': { resourceType: 'PractitionerRole', accessLevel: 'write' },
  'view-departments': { resourceType: 'Organization', accessLevel: 'read' },
  'manage-departments': { resourceType: 'Organization', accessLevel: 'write' },
  'view-audit-logs': { resourceType: 'AuditEvent', accessLevel: 'read' },
  'export-audit-logs': { resourceType: 'AuditEvent', accessLevel: 'read' },
  'view-system-settings': { resourceType: 'Parameters', accessLevel: 'read' },
  'edit-system-settings': { resourceType: 'Parameters', accessLevel: 'write' },
  'view-access-logs': { resourceType: 'AuditEvent', accessLevel: 'read' },
  'emergency-access': { resourceType: 'Patient', accessLevel: 'admin' },

  // Reports
  'view-clinical-reports': { resourceType: 'MeasureReport', accessLevel: 'read' },
  'view-operational-reports': { resourceType: 'MeasureReport', accessLevel: 'read' },
  'view-financial-summary': { resourceType: 'MeasureReport', accessLevel: 'read' },
  'generate-report': { resourceType: 'MeasureReport', accessLevel: 'write' },
  'export-reports': { resourceType: 'MeasureReport', accessLevel: 'read' },
  'schedule-reports': { resourceType: 'Task', accessLevel: 'write' },
  'view-analytics-dashboard': { resourceType: 'MeasureReport', accessLevel: 'read' },
  'view-quality-metrics': { resourceType: 'MeasureReport', accessLevel: 'read' },
  'view-utilization-reports': { resourceType: 'MeasureReport', accessLevel: 'read' },
  'view-compliance-reports': { resourceType: 'MeasureReport', accessLevel: 'read' },

  // Nomenclature
  'view-services': { resourceType: 'ActivityDefinition', accessLevel: 'read' },
  'edit-services': { resourceType: 'ActivityDefinition', accessLevel: 'write' },
  'view-diagnoses-catalog': { resourceType: 'CodeSystem', accessLevel: 'read' },
  'edit-diagnoses-catalog': { resourceType: 'CodeSystem', accessLevel: 'write' },
  'view-medications-catalog': { resourceType: 'Medication', accessLevel: 'read' },
  'edit-medications-catalog': { resourceType: 'Medication', accessLevel: 'write' },
  'view-lab-catalog': { resourceType: 'ObservationDefinition', accessLevel: 'read' },
  'edit-lab-catalog': { resourceType: 'ObservationDefinition', accessLevel: 'write' },

  // Scheduling
  'view-appointments': { resourceType: 'Appointment', accessLevel: 'read' },
  'create-appointment': { resourceType: 'Appointment', accessLevel: 'write' },
  'edit-appointment': { resourceType: 'Appointment', accessLevel: 'write' },
  'cancel-appointment': { resourceType: 'Appointment', accessLevel: 'write' },
  'view-schedules': { resourceType: 'Schedule', accessLevel: 'read' },
  'manage-schedules': { resourceType: 'Schedule', accessLevel: 'write' },
  'view-availability': { resourceType: 'Slot', accessLevel: 'read' },
  'manage-availability': { resourceType: 'Slot', accessLevel: 'write' },
};

// 16 Role Templates (simplified from roleTemplateService.ts)
const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    code: 'owner',
    name: 'Owner',
    description: 'Full system access with all permissions',
    departmentScoped: false,
    defaultPermissions: Object.keys(PERMISSION_RESOURCE_MAP),
  },
  {
    code: 'admin',
    name: 'Administrator',
    description: 'Administrative access without dangerous permissions',
    departmentScoped: false,
    defaultPermissions: Object.keys(PERMISSION_RESOURCE_MAP).filter(
      p => !['delete-patient', 'delete-encounter', 'delete-user', 'delete-role', 'void-invoice', 'refund-payment', 'emergency-access', 'edit-locked-records'].includes(p)
    ),
  },
  {
    code: 'physician',
    name: 'Physician',
    description: 'Medical doctor with full clinical access',
    departmentScoped: true,
    defaultPermissions: [
      'view-patient-list', 'view-patient-demographics', 'edit-patient-demographics', 'create-patient',
      'view-patient-history', 'view-patient-documents', 'upload-patient-documents', 'view-patient-photo',
      'view-patient-contacts', 'edit-patient-contacts', 'view-patient-insurance',
      'view-encounters', 'create-encounter', 'edit-encounter',
      'view-clinical-notes', 'create-clinical-notes', 'edit-clinical-notes', 'sign-clinical-notes',
      'view-diagnoses', 'create-diagnosis', 'edit-diagnosis',
      'view-procedures', 'create-procedure', 'view-medications', 'prescribe-medication',
      'view-allergies', 'edit-allergies',
      'view-lab-orders', 'create-lab-order', 'view-lab-results', 'view-specimens',
      'view-clinical-reports', 'generate-report', 'export-reports', 'view-quality-metrics',
      'view-services', 'view-diagnoses-catalog', 'view-medications-catalog', 'view-lab-catalog',
      'view-appointments', 'create-appointment', 'edit-appointment', 'cancel-appointment',
      'view-schedules', 'view-availability',
    ],
  },
  {
    code: 'nurse',
    name: 'Nurse',
    description: 'Nursing staff with clinical documentation access',
    departmentScoped: true,
    defaultPermissions: [
      'view-patient-list', 'view-patient-demographics', 'view-patient-history',
      'view-patient-documents', 'view-patient-photo', 'view-patient-contacts', 'view-patient-insurance',
      'view-encounters', 'create-encounter',
      'view-clinical-notes', 'create-clinical-notes',
      'view-diagnoses', 'view-procedures', 'view-medications', 'view-allergies', 'edit-allergies',
      'view-lab-orders', 'view-lab-results', 'enter-lab-results', 'view-specimens', 'manage-specimens',
      'view-appointments', 'create-appointment', 'view-schedules', 'view-availability',
    ],
  },
  {
    code: 'registrar',
    name: 'Registrar',
    description: 'Patient registration and scheduling staff',
    departmentScoped: false,
    defaultPermissions: [
      'view-patient-list', 'view-patient-demographics', 'edit-patient-demographics', 'create-patient',
      'view-patient-documents', 'upload-patient-documents', 'view-patient-photo', 'upload-patient-photo',
      'view-patient-contacts', 'edit-patient-contacts', 'view-patient-insurance',
      'create-encounter', 'view-encounters',
      'view-appointments', 'create-appointment', 'edit-appointment', 'cancel-appointment',
      'view-schedules', 'manage-schedules', 'view-availability', 'manage-availability',
    ],
  },
  {
    code: 'laboratory',
    name: 'Laboratory Technician',
    description: 'Laboratory staff with full lab access',
    departmentScoped: true,
    defaultPermissions: [
      'view-patient-list', 'view-patient-demographics', 'view-patient-history',
      'view-encounters', 'view-diagnoses',
      'view-lab-orders', 'edit-lab-order', 'cancel-lab-order',
      'view-lab-results', 'enter-lab-results', 'edit-lab-results', 'approve-lab-results',
      'view-specimens', 'manage-specimens', 'view-lab-equipment', 'manage-lab-equipment',
      'view-clinical-reports', 'view-operational-reports',
      'view-lab-catalog', 'edit-lab-catalog',
    ],
  },
  {
    code: 'cashier',
    name: 'Cashier',
    description: 'Payment processing staff',
    departmentScoped: false,
    defaultPermissions: [
      'view-patient-list', 'view-patient-demographics', 'view-patient-history', 'view-patient-insurance',
      'view-encounters',
      'view-invoices', 'view-payments', 'process-payment',
      'view-claims', 'view-insurance-auth', 'view-debt-management',
      'view-financial-summary',
      'view-services',
    ],
  },
  {
    code: 'hrManager',
    name: 'HR Manager',
    description: 'Human resources and user management',
    departmentScoped: false,
    defaultPermissions: [
      'view-users', 'create-user', 'edit-user', 'deactivate-user',
      'view-roles', 'assign-roles',
      'view-departments', 'view-audit-logs', 'export-audit-logs',
      'view-operational-reports', 'view-utilization-reports',
      'view-schedules', 'manage-schedules', 'view-availability', 'manage-availability',
    ],
  },
  {
    code: 'seniorNurse',
    name: 'Senior Nurse',
    description: 'Senior nursing staff with enhanced permissions',
    departmentScoped: true,
    defaultPermissions: [
      'view-patient-list', 'view-patient-demographics', 'edit-patient-demographics',
      'view-patient-history', 'view-patient-documents', 'upload-patient-documents',
      'view-patient-photo', 'view-patient-contacts', 'edit-patient-contacts', 'view-patient-insurance',
      'view-encounters', 'create-encounter', 'edit-encounter',
      'view-clinical-notes', 'create-clinical-notes', 'edit-clinical-notes',
      'view-diagnoses', 'view-procedures', 'view-medications', 'view-allergies', 'edit-allergies',
      'view-lab-orders', 'view-lab-results', 'enter-lab-results', 'view-specimens', 'manage-specimens',
      'view-users', 'view-departments',
      'view-clinical-reports', 'view-quality-metrics',
      'view-appointments', 'create-appointment', 'edit-appointment', 'cancel-appointment',
      'view-schedules', 'manage-schedules', 'view-availability', 'manage-availability',
    ],
  },
  {
    code: 'pharmacyManager',
    name: 'Pharmacy Manager',
    description: 'Pharmacy staff with medication management',
    departmentScoped: true,
    defaultPermissions: [
      'view-patient-list', 'view-patient-demographics', 'view-patient-history', 'view-patient-insurance',
      'view-encounters', 'view-diagnoses', 'view-medications', 'prescribe-medication', 'view-allergies',
      'view-clinical-reports', 'view-utilization-reports',
      'view-medications-catalog', 'edit-medications-catalog',
    ],
  },
  {
    code: 'viewAdmin',
    name: 'View-Only Administrator',
    description: 'Read-only access to all system data',
    departmentScoped: false,
    defaultPermissions: [
      'view-patient-list', 'view-patient-demographics', 'view-patient-history',
      'view-patient-documents', 'view-patient-photo', 'view-patient-contacts', 'view-patient-insurance',
      'view-encounters', 'view-clinical-notes', 'view-diagnoses', 'view-procedures',
      'view-medications', 'view-allergies',
      'view-lab-orders', 'view-lab-results', 'view-specimens', 'view-lab-equipment',
      'view-invoices', 'view-payments', 'view-claims', 'view-insurance-auth',
      'view-financial-reports', 'view-debt-management',
      'view-users', 'view-roles', 'view-departments', 'view-audit-logs', 'view-system-settings', 'view-access-logs',
      'view-clinical-reports', 'view-operational-reports', 'view-financial-summary',
      'view-analytics-dashboard', 'view-quality-metrics', 'view-utilization-reports', 'view-compliance-reports',
      'view-services', 'view-diagnoses-catalog', 'view-medications-catalog', 'view-lab-catalog',
      'view-appointments', 'view-schedules', 'view-availability',
    ],
  },
  {
    code: 'accounting',
    name: 'Accountant',
    description: 'Full financial access with billing management',
    departmentScoped: false,
    defaultPermissions: [
      'view-patient-list', 'view-patient-demographics', 'view-patient-insurance',
      'view-encounters',
      'view-invoices', 'create-invoice', 'edit-invoice', 'void-invoice',
      'view-payments', 'process-payment', 'refund-payment',
      'view-claims', 'submit-claim', 'view-insurance-auth', 'request-insurance-auth',
      'view-financial-reports', 'export-financial-data', 'view-debt-management', 'manage-debt',
      'view-financial-summary', 'generate-report', 'export-reports', 'view-compliance-reports',
      'view-services', 'edit-services',
    ],
  },
  {
    code: 'manager',
    name: 'Department Manager',
    description: 'Department management with reporting access',
    departmentScoped: true,
    defaultPermissions: [
      'view-patient-list', 'view-patient-demographics', 'view-patient-history', 'view-patient-documents',
      'view-encounters', 'view-clinical-notes', 'view-diagnoses', 'view-procedures', 'view-medications',
      'view-lab-orders', 'view-lab-results',
      'view-invoices', 'view-payments', 'view-financial-reports',
      'view-users', 'edit-user', 'view-roles', 'assign-roles', 'view-departments', 'manage-departments', 'view-audit-logs',
      'view-clinical-reports', 'view-operational-reports', 'view-financial-summary',
      'generate-report', 'export-reports', 'view-analytics-dashboard',
      'view-quality-metrics', 'view-utilization-reports', 'view-compliance-reports',
      'view-services', 'view-diagnoses-catalog', 'view-medications-catalog', 'view-lab-catalog',
      'view-appointments', 'create-appointment', 'edit-appointment', 'cancel-appointment',
      'view-schedules', 'manage-schedules', 'view-availability', 'manage-availability',
    ],
  },
  {
    code: 'operator',
    name: 'Data Operator',
    description: 'Basic data entry and registration',
    departmentScoped: false,
    defaultPermissions: [
      'view-patient-list', 'view-patient-demographics', 'edit-patient-demographics', 'create-patient',
      'view-patient-documents', 'upload-patient-documents',
      'view-encounters', 'create-encounter', 'view-clinical-notes',
      'view-appointments', 'create-appointment', 'view-schedules', 'view-availability',
    ],
  },
  {
    code: 'externalOrg',
    name: 'External Organization',
    description: 'Limited access for external partners',
    departmentScoped: false,
    defaultPermissions: [
      'view-patient-demographics', 'view-patient-history',
      'view-encounters', 'view-clinical-notes', 'view-diagnoses', 'view-medications',
      'view-lab-results',
    ],
  },
  {
    code: 'technician',
    name: 'Medical Technician',
    description: 'Equipment and technical support',
    departmentScoped: true,
    defaultPermissions: [
      'view-patient-list', 'view-patient-demographics',
      'view-encounters', 'view-procedures',
      'view-lab-orders', 'view-lab-results', 'view-specimens',
      'view-lab-equipment', 'manage-lab-equipment',
      'view-lab-catalog',
    ],
  },
];

/**
 * Convert EMR permissions to FHIR AccessPolicy resources
 */
function permissionsToAccessPolicy(permissions: string[]): AccessPolicyResource[] {
  const resourceMap = new Map<string, { read: boolean; write: boolean; admin: boolean }>();

  for (const permission of permissions) {
    const mapping = PERMISSION_RESOURCE_MAP[permission];
    if (!mapping) continue;

    const existing = resourceMap.get(mapping.resourceType) || { read: false, write: false, admin: false };
    existing[mapping.accessLevel] = true;
    resourceMap.set(mapping.resourceType, existing);
  }

  const resources: AccessPolicyResource[] = [];

  for (const [resourceType, access] of resourceMap) {
    if (access.admin) {
      // Full access
      resources.push({ resourceType: resourceType as any });
    } else if (access.write) {
      // Read + Write
      resources.push({ resourceType: resourceType as any });
    } else if (access.read) {
      // Read only
      resources.push({ resourceType: resourceType as any, readonly: true });
    }
  }

  return resources;
}

/**
 * Make FHIR API request
 */
async function fhirRequest(
  token: string,
  method: string,
  path: string,
  body?: unknown
): Promise<unknown> {
  const url = `${MEDPLUM_BASE_URL}/fhir/R4${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/fhir+json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`FHIR request failed: ${response.status} ${text}`);
  }

  return response.json();
}

/**
 * Search for existing roles by code
 */
async function findExistingRole(token: string, code: string): Promise<AccessPolicy | null> {
  const bundle = await fhirRequest(token, 'GET', '/AccessPolicy?_count=100') as { entry?: { resource: AccessPolicy }[] };

  if (!bundle.entry) return null;

  for (const entry of bundle.entry) {
    const role = entry.resource;
    const roleTag = role.meta?.tag?.find(t => t.system === 'http://medimind.ge/role-identifier');
    if (roleTag?.code === code) {
      return role;
    }
  }

  return null;
}

/**
 * Create a role from template
 */
async function createRole(token: string, template: RoleTemplate): Promise<AccessPolicy> {
  const resources = permissionsToAccessPolicy(template.defaultPermissions);

  const accessPolicy: AccessPolicy = {
    resourceType: 'AccessPolicy',
    meta: {
      tag: [
        {
          system: 'http://medimind.ge/role-identifier',
          code: template.code,
          display: template.name,
        },
        {
          system: 'http://medimind.ge/role-status',
          code: 'active',
          display: 'Active',
        },
        {
          system: 'http://medimind.ge/role-description',
          code: 'description',
          display: template.description,
        },
      ],
    },
    resource: resources,
  };

  return await fhirRequest(token, 'POST', '/AccessPolicy', accessPolicy) as AccessPolicy;
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('🚀 Role Templates Seeding Script\n');
  console.log('================================\n');

  // Get token from environment or argument
  const token = process.env.MEDPLUM_TOKEN || process.argv[2];

  if (!token) {
    console.error('❌ Error: No token provided');
    console.error('\nUsage:');
    console.error('  export MEDPLUM_TOKEN="your-access-token"');
    console.error('  npx tsx scripts/seed-role-templates.ts');
    console.error('\nOr:');
    console.error('  npx tsx scripts/seed-role-templates.ts "your-access-token"');
    process.exit(1);
  }

  console.log(`🔑 Using token: ${token.substring(0, 20)}...`);
  console.log(`🌐 Server: ${MEDPLUM_BASE_URL}\n`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const template of ROLE_TEMPLATES) {
    process.stdout.write(`Processing ${template.name} (${template.code})... `);

    try {
      // Check if role already exists
      const existing = await findExistingRole(token, template.code);

      if (existing) {
        console.log('⏭️  SKIPPED (already exists)');
        skipped++;
        continue;
      }

      // Create the role
      const role = await createRole(token, template);
      console.log(`✅ CREATED (ID: ${role.id})`);
      created++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`❌ FAILED: ${(error as Error).message}`);
      failed++;
    }
  }

  console.log('\n================================');
  console.log('📊 Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📋 Total: ${ROLE_TEMPLATES.length}`);
  console.log('================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
