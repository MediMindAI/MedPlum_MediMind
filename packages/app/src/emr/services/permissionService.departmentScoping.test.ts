// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { addDepartmentScoping } from './permissionService';
import type { AccessPolicyResource } from '@medplum/fhirtypes';

describe('addDepartmentScoping', () => {
  it('adds department scoping to scoped resource types', () => {
    const resources: AccessPolicyResource[] = [
      { resourceType: 'Patient', readonly: false },
      { resourceType: 'Encounter', readonly: false },
      { resourceType: 'Observation', readonly: false },
    ];

    const result = addDepartmentScoping(resources, 'dept-001');

    expect(result).toEqual([
      {
        resourceType: 'Patient',
        readonly: false,
        criteria: 'Patient?_compartment=Organization/dept-001',
      },
      {
        resourceType: 'Encounter',
        readonly: false,
        criteria: 'Encounter?_compartment=Organization/dept-001',
      },
      {
        resourceType: 'Observation',
        readonly: false,
        criteria: 'Observation?_compartment=Organization/dept-001',
      },
    ]);
  });

  it('does not modify non-scoped resource types', () => {
    const resources: AccessPolicyResource[] = [
      { resourceType: 'Practitioner', readonly: false },
      { resourceType: 'Organization', readonly: false },
      { resourceType: 'AccessPolicy', readonly: false },
    ];

    const result = addDepartmentScoping(resources, 'dept-001');

    expect(result).toEqual([
      { resourceType: 'Practitioner', readonly: false },
      { resourceType: 'Organization', readonly: false },
      { resourceType: 'AccessPolicy', readonly: false },
    ]);
  });

  it('applies scoping to DocumentReference and ServiceRequest', () => {
    const resources: AccessPolicyResource[] = [
      { resourceType: 'DocumentReference', readonly: false },
      { resourceType: 'ServiceRequest', readonly: false },
    ];

    const result = addDepartmentScoping(resources, 'dept-002');

    expect(result).toEqual([
      {
        resourceType: 'DocumentReference',
        readonly: false,
        criteria: 'DocumentReference?_compartment=Organization/dept-002',
      },
      {
        resourceType: 'ServiceRequest',
        readonly: false,
        criteria: 'ServiceRequest?_compartment=Organization/dept-002',
      },
    ]);
  });

  it('preserves readonly flag when adding scoping', () => {
    const resources: AccessPolicyResource[] = [
      { resourceType: 'Patient', readonly: true },
      { resourceType: 'Encounter', readonly: true },
    ];

    const result = addDepartmentScoping(resources, 'dept-001');

    expect(result).toEqual([
      {
        resourceType: 'Patient',
        readonly: true,
        criteria: 'Patient?_compartment=Organization/dept-001',
      },
      {
        resourceType: 'Encounter',
        readonly: true,
        criteria: 'Encounter?_compartment=Organization/dept-001',
      },
    ]);
  });

  it('handles mixed scoped and non-scoped resources', () => {
    const resources: AccessPolicyResource[] = [
      { resourceType: 'Patient', readonly: false },
      { resourceType: 'Practitioner', readonly: false },
      { resourceType: 'Encounter', readonly: false },
      { resourceType: 'Organization', readonly: false },
    ];

    const result = addDepartmentScoping(resources, 'dept-cardiology');

    expect(result).toEqual([
      {
        resourceType: 'Patient',
        readonly: false,
        criteria: 'Patient?_compartment=Organization/dept-cardiology',
      },
      { resourceType: 'Practitioner', readonly: false },
      {
        resourceType: 'Encounter',
        readonly: false,
        criteria: 'Encounter?_compartment=Organization/dept-cardiology',
      },
      { resourceType: 'Organization', readonly: false },
    ]);
  });

  it('does not mutate original resources array', () => {
    const resources: AccessPolicyResource[] = [
      { resourceType: 'Patient', readonly: false },
      { resourceType: 'Encounter', readonly: false },
    ];

    const originalResources = JSON.parse(JSON.stringify(resources));
    addDepartmentScoping(resources, 'dept-001');

    expect(resources).toEqual(originalResources);
  });

  it('handles empty resources array', () => {
    const resources: AccessPolicyResource[] = [];
    const result = addDepartmentScoping(resources, 'dept-001');
    expect(result).toEqual([]);
  });

  it('generates correct compartment URL format', () => {
    const resources: AccessPolicyResource[] = [{ resourceType: 'Patient', readonly: false }];

    const result = addDepartmentScoping(resources, 'dept-radiology-imaging');

    expect(result[0].criteria).toBe('Patient?_compartment=Organization/dept-radiology-imaging');
  });
});
