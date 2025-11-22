// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { Patient, Encounter } from '@medplum/fhirtypes';
import {
  extractPatientData,
  extractEncounterData,
  extractCombinedData,
  calculateAge,
  formatName,
  formatFullName,
  evaluateFHIRPath,
  getValueByBindingKey,
  validateRequiredBindings,
} from './patientDataBindingService';

describe('patientDataBindingService', () => {
  // Test patient with full data
  const mockPatient: Patient = {
    resourceType: 'Patient',
    id: 'patient-123',
    name: [
      {
        family: 'ხოზვრია',
        given: ['თენგიზი'],
        extension: [
          {
            url: 'patronymic',
            valueString: 'გიორგის ძე',
          },
        ],
      },
    ],
    birthDate: '1990-05-15',
    gender: 'male',
    identifier: [
      {
        system: 'http://medimind.ge/identifiers/personal-id',
        value: '26001014632',
      },
    ],
    telecom: [
      {
        system: 'phone',
        value: '+995555123456',
      },
      {
        system: 'email',
        value: 'tengizi@example.com',
      },
    ],
    address: [
      {
        text: 'თბილისი, რუსთაველის გამზირი 123',
      },
    ],
    extension: [
      {
        url: 'workplace',
        valueString: 'MediMind Hospital',
      },
    ],
  };

  // Test encounter
  const mockEncounter: Encounter = {
    resourceType: 'Encounter',
    id: 'encounter-456',
    status: 'in-progress',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'AMB',
    },
    period: {
      start: '2025-11-22T10:30:00Z',
      end: '2025-11-22T11:00:00Z',
    },
    identifier: [
      {
        system: 'http://medimind.ge/identifiers/registration-number',
        value: '10357-2025',
      },
    ],
    participant: [
      {
        type: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                code: 'ATND',
                display: 'Attender',
              },
            ],
          },
        ],
        individual: {
          reference: 'Practitioner/pract-789',
          display: 'Dr. John Smith',
        },
      },
    ],
  };

  describe('extractPatientData', () => {
    it('should extract all patient data fields', () => {
      const result = extractPatientData(mockPatient);

      expect(result.firstName).toBe('თენგიზი');
      expect(result.lastName).toBe('ხოზვრია');
      expect(result.patronymic).toBe('გიორგის ძე');
      expect(result.name).toBe('თენგიზი ხოზვრია');
      expect(result.fullName).toBe('თენგიზი გიორგის ძე ხოზვრია');
      expect(result.dob).toBe('1990-05-15');
      expect(result.age).toBeDefined();
      expect(result.personalId).toBe('26001014632');
      expect(result.gender).toBe('male');
      expect(result.phone).toBe('+995555123456');
      expect(result.email).toBe('tengizi@example.com');
      expect(result.address).toBe('თბილისი, რუსთაველის გამზირი 123');
      expect(result.workplace).toBe('MediMind Hospital');
    });

    it('should return empty object for undefined patient', () => {
      const result = extractPatientData(undefined);
      expect(result).toEqual({});
    });

    it('should handle patient with minimal data', () => {
      const minimalPatient: Patient = {
        resourceType: 'Patient',
        id: 'minimal-patient',
      };

      const result = extractPatientData(minimalPatient);
      expect(result.firstName).toBe('');
      expect(result.lastName).toBe('');
      expect(result.name).toBe('');
      expect(result.fullName).toBe('');
      expect(result.dob).toBeUndefined();
      expect(result.age).toBeUndefined();
    });

    it('should handle patient with address parts instead of text', () => {
      const patientWithAddressParts: Patient = {
        resourceType: 'Patient',
        address: [
          {
            line: ['123 Main St', 'Apt 4'],
            city: 'Tbilisi',
            state: 'Tbilisi',
            postalCode: '0100',
            country: 'Georgia',
          },
        ],
      };

      const result = extractPatientData(patientWithAddressParts);
      expect(result.address).toBe('123 Main St, Apt 4, Tbilisi, Tbilisi, 0100, Georgia');
    });
  });

  describe('extractEncounterData', () => {
    it('should extract all encounter data fields', () => {
      const result = extractEncounterData(mockEncounter);

      expect(result.admissionDate).toBe('2025-11-22T10:30:00Z');
      expect(result.dischargeDate).toBe('2025-11-22T11:00:00Z');
      expect(result.registrationNumber).toBe('10357-2025');
      expect(result.treatingPhysician).toBe('Dr. John Smith');
    });

    it('should return empty object for undefined encounter', () => {
      const result = extractEncounterData(undefined);
      expect(result).toEqual({});
    });

    it('should handle encounter with minimal data', () => {
      const minimalEncounter: Encounter = {
        resourceType: 'Encounter',
        status: 'planned',
        class: {
          code: 'AMB',
        },
      };

      const result = extractEncounterData(minimalEncounter);
      expect(result.admissionDate).toBeUndefined();
      expect(result.dischargeDate).toBeUndefined();
      expect(result.registrationNumber).toBeUndefined();
      expect(result.treatingPhysician).toBeUndefined();
    });
  });

  describe('extractCombinedData', () => {
    it('should combine patient and encounter data', () => {
      const result = extractCombinedData({
        patient: mockPatient,
        encounter: mockEncounter,
      });

      // Patient data
      expect(result.firstName).toBe('თენგიზი');
      expect(result.personalId).toBe('26001014632');

      // Encounter data
      expect(result.admissionDate).toBe('2025-11-22T10:30:00Z');
      expect(result.registrationNumber).toBe('10357-2025');
    });

    it('should handle missing patient or encounter', () => {
      const onlyPatient = extractCombinedData({ patient: mockPatient });
      expect(onlyPatient.firstName).toBe('თენგიზი');
      expect(onlyPatient.admissionDate).toBeUndefined();

      const onlyEncounter = extractCombinedData({ encounter: mockEncounter });
      expect(onlyEncounter.firstName).toBeUndefined();
      expect(onlyEncounter.admissionDate).toBe('2025-11-22T10:30:00Z');
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      // Mock current date for consistent testing
      const now = new Date();
      const birthYear = now.getFullYear() - 35;
      const birthDate = `${birthYear}-01-01`;

      const age = calculateAge(birthDate);
      expect(age).toBe(35);
    });

    it('should handle birthday not yet occurred this year', () => {
      const now = new Date();
      // Use a date that's definitely in the future this year (Dec 31)
      // If we're already in December, use next year's date
      let birthYear: number;
      let birthMonth: number;
      let birthDay: number;

      if (now.getMonth() === 11 && now.getDate() === 31) {
        // Edge case: today is Dec 31, birthday already passed
        birthYear = now.getFullYear() - 34;
        birthMonth = 12;
        birthDay = 31;
      } else {
        // Birthday is Dec 31 of (currentYear - 35) which hasn't occurred yet
        birthYear = now.getFullYear() - 35;
        birthMonth = 12;
        birthDay = 31;
      }

      const birthDate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
      const age = calculateAge(birthDate);

      // If Dec 31 has already passed, age is 35, otherwise 34
      const dec31ThisYear = new Date(now.getFullYear(), 11, 31);
      const expectedAge = now >= dec31ThisYear ? 35 : 34;
      expect(age).toBe(expectedAge);
    });

    it('should return undefined for undefined birthDate', () => {
      expect(calculateAge(undefined)).toBeUndefined();
    });

    it('should return undefined for invalid date', () => {
      expect(calculateAge('invalid-date')).toBeUndefined();
    });

    it('should return undefined for future birth dates (negative age)', () => {
      const futureDate = '2099-01-01';
      expect(calculateAge(futureDate)).toBeUndefined();
    });
  });

  describe('formatName', () => {
    it('should format first and last name', () => {
      expect(formatName('John', 'Doe')).toBe('John Doe');
    });

    it('should handle missing first name', () => {
      expect(formatName('', 'Doe')).toBe('Doe');
    });

    it('should handle missing last name', () => {
      expect(formatName('John', '')).toBe('John');
    });

    it('should handle both missing', () => {
      expect(formatName('', '')).toBe('');
    });
  });

  describe('formatFullName', () => {
    it('should format full name with patronymic', () => {
      expect(formatFullName('თენგიზი', 'გიორგის ძე', 'ხოზვრია')).toBe('თენგიზი გიორგის ძე ხოზვრია');
    });

    it('should handle missing patronymic', () => {
      expect(formatFullName('თენგიზი', undefined, 'ხოზვრია')).toBe('თენგიზი ხოზვრია');
    });

    it('should handle empty strings', () => {
      expect(formatFullName('', '', '')).toBe('');
    });
  });

  describe('evaluateFHIRPath', () => {
    it('should evaluate Patient.name.given[0]', () => {
      const result = evaluateFHIRPath('Patient.name.given[0]', { patient: mockPatient });
      expect(result).toBe('თენგიზი');
    });

    it('should evaluate Patient.name.family', () => {
      const result = evaluateFHIRPath('Patient.name.family', { patient: mockPatient });
      expect(result).toBe('ხოზვრია');
    });

    it('should evaluate Patient.birthDate', () => {
      const result = evaluateFHIRPath('Patient.birthDate', { patient: mockPatient });
      expect(result).toBe('1990-05-15');
    });

    it('should evaluate Patient.gender', () => {
      const result = evaluateFHIRPath('Patient.gender', { patient: mockPatient });
      expect(result).toBe('male');
    });

    it('should evaluate Patient.identifier with system filter', () => {
      const result = evaluateFHIRPath(
        "Patient.identifier.where(system='http://medimind.ge/identifiers/personal-id').value",
        { patient: mockPatient }
      );
      expect(result).toBe('26001014632');
    });

    it('should evaluate Patient.telecom for phone', () => {
      const result = evaluateFHIRPath("Patient.telecom.where(system='phone').value", { patient: mockPatient });
      expect(result).toBe('+995555123456');
    });

    it('should evaluate Patient.telecom for email', () => {
      const result = evaluateFHIRPath("Patient.telecom.where(system='email').value", { patient: mockPatient });
      expect(result).toBe('tengizi@example.com');
    });

    it('should evaluate Patient.address.text', () => {
      const result = evaluateFHIRPath('Patient.address.text', { patient: mockPatient });
      expect(result).toBe('თბილისი, რუსთაველის გამზირი 123');
    });

    it('should evaluate Encounter.period.start', () => {
      const result = evaluateFHIRPath('Encounter.period.start', { encounter: mockEncounter });
      expect(result).toBe('2025-11-22T10:30:00Z');
    });

    it('should evaluate Encounter.period.end', () => {
      const result = evaluateFHIRPath('Encounter.period.end', { encounter: mockEncounter });
      expect(result).toBe('2025-11-22T11:00:00Z');
    });

    it('should return undefined for empty path', () => {
      const result = evaluateFHIRPath('', { patient: mockPatient });
      expect(result).toBeUndefined();
    });

    it('should return undefined for missing patient', () => {
      const result = evaluateFHIRPath('Patient.name.given[0]', {});
      expect(result).toBeUndefined();
    });

    it('should return undefined for missing encounter', () => {
      const result = evaluateFHIRPath('Encounter.period.start', {});
      expect(result).toBeUndefined();
    });
  });

  describe('getValueByBindingKey', () => {
    const data = { patient: mockPatient, encounter: mockEncounter };

    it('should get firstName', () => {
      expect(getValueByBindingKey('firstName', data)).toBe('თენგიზი');
    });

    it('should get lastName', () => {
      expect(getValueByBindingKey('lastName', data)).toBe('ხოზვრია');
    });

    it('should get patronymic', () => {
      expect(getValueByBindingKey('patronymic', data)).toBe('გიორგის ძე');
    });

    it('should get fullName', () => {
      expect(getValueByBindingKey('fullName', data)).toBe('თენგიზი გიორგის ძე ხოზვრია');
    });

    it('should get name', () => {
      expect(getValueByBindingKey('name', data)).toBe('თენგიზი ხოზვრია');
    });

    it('should get dob', () => {
      expect(getValueByBindingKey('dob', data)).toBe('1990-05-15');
    });

    it('should get age', () => {
      expect(getValueByBindingKey('age', data)).toBeDefined();
      expect(typeof getValueByBindingKey('age', data)).toBe('number');
    });

    it('should get personalId', () => {
      expect(getValueByBindingKey('personalId', data)).toBe('26001014632');
    });

    it('should get gender', () => {
      expect(getValueByBindingKey('gender', data)).toBe('male');
    });

    it('should get phone', () => {
      expect(getValueByBindingKey('phone', data)).toBe('+995555123456');
    });

    it('should get email', () => {
      expect(getValueByBindingKey('email', data)).toBe('tengizi@example.com');
    });

    it('should get address', () => {
      expect(getValueByBindingKey('address', data)).toBe('თბილისი, რუსთაველის გამზირი 123');
    });

    it('should get workplace', () => {
      expect(getValueByBindingKey('workplace', data)).toBe('MediMind Hospital');
    });

    it('should get admissionDate', () => {
      expect(getValueByBindingKey('admissionDate', data)).toBe('2025-11-22T10:30:00Z');
    });

    it('should get dischargeDate', () => {
      expect(getValueByBindingKey('dischargeDate', data)).toBe('2025-11-22T11:00:00Z');
    });

    it('should get treatingPhysician', () => {
      expect(getValueByBindingKey('treatingPhysician', data)).toBe('Dr. John Smith');
    });

    it('should get registrationNumber', () => {
      expect(getValueByBindingKey('registrationNumber', data)).toBe('10357-2025');
    });
  });

  describe('validateRequiredBindings', () => {
    it('should validate required bindings - all present', () => {
      const result = validateRequiredBindings(['firstName', 'lastName', 'personalId'], {
        patient: mockPatient,
      });

      expect(result.isValid).toBe(true);
      expect(result.missingFields).toEqual([]);
    });

    it('should validate required bindings - some missing', () => {
      const patientWithoutId: Patient = {
        resourceType: 'Patient',
        name: [{ given: ['John'], family: 'Doe' }],
      };

      const result = validateRequiredBindings(['firstName', 'lastName', 'personalId'], {
        patient: patientWithoutId,
      });

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toContain('personalId');
    });

    it('should validate required bindings - all missing', () => {
      const result = validateRequiredBindings(['firstName', 'lastName', 'personalId'], {
        patient: undefined,
      });

      expect(result.isValid).toBe(false);
      expect(result.missingFields).toHaveLength(3);
    });

    it('should handle empty required keys array', () => {
      const result = validateRequiredBindings([], { patient: mockPatient });
      expect(result.isValid).toBe(true);
      expect(result.missingFields).toEqual([]);
    });
  });
});
