// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { Practitioner, PractitionerRole } from '@medplum/fhirtypes';
import {
  getPractitionerName,
  getTelecomValue,
  getIdentifierValue,
  getStaffId,
  practitionerToFormValues,
  formValuesToPractitioner,
  practitionerToAccountRow,
  createPractitionerReference,
  createRoleCodeableConcept,
  createSpecialtyCodeableConcept,
} from './accountHelpers';

describe('accountHelpers', () => {
  describe('getPractitionerName', () => {
    it('should extract official name', () => {
      const practitioner: Practitioner = {
        resourceType: 'Practitioner',
        name: [
          {
            use: 'official',
            family: 'ხოზვრია',
            given: ['თენგიზი'],
          },
        ],
      };

      expect(getPractitionerName(practitioner)).toBe('ხოზვრია თენგიზი');
    });

    it('should handle missing name', () => {
      const practitioner: Practitioner = {
        resourceType: 'Practitioner',
      };

      expect(getPractitionerName(practitioner)).toBe('');
    });

    it('should handle name with patronymic', () => {
      const practitioner: Practitioner = {
        resourceType: 'Practitioner',
        name: [
          {
            use: 'official',
            family: 'Ivanov',
            given: ['Ivan', 'Petrovich'],
          },
        ],
      };

      expect(getPractitionerName(practitioner)).toBe('Ivanov Ivan Petrovich');
    });
  });

  describe('getTelecomValue', () => {
    const practitioner: Practitioner = {
      resourceType: 'Practitioner',
      telecom: [
        {
          system: 'email',
          value: 'tengizi@medimind.ge',
          use: 'work',
        },
        {
          system: 'phone',
          value: '+995500050610',
          use: 'work',
        },
      ],
    };

    it('should extract email', () => {
      expect(getTelecomValue(practitioner, 'email', 'work')).toBe('tengizi@medimind.ge');
    });

    it('should extract phone', () => {
      expect(getTelecomValue(practitioner, 'phone', 'work')).toBe('+995500050610');
    });

    it('should return undefined for missing telecom', () => {
      expect(getTelecomValue(practitioner, 'fax')).toBeUndefined();
    });
  });

  describe('getIdentifierValue', () => {
    const practitioner: Practitioner = {
      resourceType: 'Practitioner',
      identifier: [
        {
          system: 'http://medimind.ge/identifiers/staff-id',
          value: 'STAFF-2025-001',
        },
      ],
    };

    it('should extract staff ID', () => {
      expect(getIdentifierValue(practitioner, 'http://medimind.ge/identifiers/staff-id')).toBe('STAFF-2025-001');
    });

    it('should return undefined for missing identifier', () => {
      expect(getIdentifierValue(practitioner, 'http://example.com/unknown')).toBeUndefined();
    });
  });

  describe('getStaffId', () => {
    it('should extract staff ID using helper', () => {
      const practitioner: Practitioner = {
        resourceType: 'Practitioner',
        identifier: [
          {
            system: 'http://medimind.ge/identifiers/staff-id',
            value: 'STAFF-123',
          },
        ],
      };

      expect(getStaffId(practitioner)).toBe('STAFF-123');
    });
  });

  describe('practitionerToFormValues', () => {
    it('should convert practitioner to form values', () => {
      const practitioner: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-1',
        active: true,
        name: [
          {
            use: 'official',
            family: 'ხოზვრია',
            given: ['თენგიზი'],
          },
        ],
        gender: 'male',
        birthDate: '1986-01-26',
        telecom: [
          {
            system: 'email',
            value: 'tengizi@medimind.ge',
            use: 'work',
          },
          {
            system: 'phone',
            value: '+995500050610',
            use: 'work',
          },
        ],
        identifier: [
          {
            system: 'http://medimind.ge/identifiers/staff-id',
            value: 'STAFF-001',
          },
        ],
      };

      const formValues = practitionerToFormValues(practitioner);

      expect(formValues.firstName).toBe('თენგიზი');
      expect(formValues.lastName).toBe('ხოზვრია');
      expect(formValues.gender).toBe('male');
      expect(formValues.birthDate).toBe('1986-01-26');
      expect(formValues.email).toBe('tengizi@medimind.ge');
      expect(formValues.phoneNumber).toBe('+995500050610');
      expect(formValues.staffId).toBe('STAFF-001');
      expect(formValues.active).toBe(true);
    });
  });

  describe('formValuesToPractitioner', () => {
    it('should convert form values to practitioner', () => {
      const formValues = {
        firstName: 'თენგიზი',
        lastName: 'ხოზვრია',
        gender: 'male' as const,
        birthDate: '1986-01-26',
        email: 'tengizi@medimind.ge',
        phoneNumber: '+995500050610',
        staffId: 'STAFF-001',
        active: true,
      };

      const practitioner = formValuesToPractitioner(formValues);

      expect(practitioner.resourceType).toBe('Practitioner');
      expect(practitioner.name?.[0].family).toBe('ხოზვრია');
      expect(practitioner.name?.[0].given?.[0]).toBe('თენგიზი');
      expect(practitioner.gender).toBe('male');
      expect(practitioner.birthDate).toBe('1986-01-26');
      expect(practitioner.active).toBe(true);

      const email = practitioner.telecom?.find((t) => t.system === 'email');
      expect(email?.value).toBe('tengizi@medimind.ge');

      const phone = practitioner.telecom?.find((t) => t.system === 'phone');
      expect(phone?.value).toBe('+995500050610');

      const staffId = practitioner.identifier?.find(
        (i) => i.system === 'http://medimind.ge/identifiers/staff-id'
      );
      expect(staffId?.value).toBe('STAFF-001');
    });
  });

  describe('practitionerToAccountRow', () => {
    it('should convert practitioner to account row', () => {
      const practitioner: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-1',
        active: true,
        name: [
          {
            use: 'official',
            family: 'ხოზვრია',
            given: ['თენგიზი'],
          },
        ],
        telecom: [
          {
            system: 'email',
            value: 'tengizi@medimind.ge',
            use: 'work',
          },
        ],
        identifier: [
          {
            system: 'http://medimind.ge/identifiers/staff-id',
            value: 'STAFF-001',
          },
        ],
        meta: {
          lastUpdated: '2025-11-19T10:00:00Z',
        },
      };

      const roles: PractitionerRole[] = [
        {
          resourceType: 'PractitionerRole',
          code: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: 'physician',
                  display: 'Physician',
                },
              ],
            },
          ],
          organization: {
            reference: 'Organization/dept-1',
            display: 'Cardiology',
          },
        },
      ];

      const accountRow = practitionerToAccountRow(practitioner, roles);

      expect(accountRow.id).toBe('practitioner-1');
      expect(accountRow.staffId).toBe('STAFF-001');
      expect(accountRow.name).toBe('ხოზვრია თენგიზი');
      expect(accountRow.email).toBe('tengizi@medimind.ge');
      expect(accountRow.roles).toEqual(['Physician']);
      expect(accountRow.departments).toEqual(['Cardiology']);
      expect(accountRow.active).toBe(true);
      expect(accountRow.lastModified).toBe('2025-11-19T10:00:00Z');
    });
  });

  describe('createPractitionerReference', () => {
    it('should create practitioner reference', () => {
      const practitioner: Practitioner = {
        resourceType: 'Practitioner',
        id: 'practitioner-1',
        name: [
          {
            use: 'official',
            family: 'ხოზვრია',
            given: ['თენგიზი'],
          },
        ],
      };

      const reference = createPractitionerReference(practitioner);

      expect(reference.reference).toBe('Practitioner/practitioner-1');
      expect(reference.display).toBe('ხოზვრია თენგიზი');
    });
  });

  describe('createRoleCodeableConcept', () => {
    it('should create role codeable concept', () => {
      const concept = createRoleCodeableConcept('physician', 'Physician');

      expect(concept.coding?.[0].system).toBe('http://snomed.info/sct');
      expect(concept.coding?.[0].code).toBe('physician');
      expect(concept.coding?.[0].display).toBe('Physician');
      expect(concept.text).toBe('Physician');
    });
  });

  describe('createSpecialtyCodeableConcept', () => {
    it('should create specialty codeable concept', () => {
      const concept = createSpecialtyCodeableConcept('207RC0000X', 'Cardiovascular Disease');

      expect(concept.coding?.[0].system).toBe('http://nucc.org/provider-taxonomy');
      expect(concept.coding?.[0].code).toBe('207RC0000X');
      expect(concept.coding?.[0].display).toBe('Cardiovascular Disease');
      expect(concept.text).toBe('Cardiovascular Disease');
    });
  });
});
