/**
 * @jest-environment jsdom
 */

import {
  validateEmail,
  validatePhone,
  validateDate,
  validateBirthDate,
  validateHireDate,
  validateRequired,
  validateStaffId,
  validateAccountForm,
} from './accountValidators';

describe('accountValidators', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('tengizi@medimind.ge').isValid).toBe(true);
      expect(validateEmail('user.name@example.com').isValid).toBe(true);
      expect(validateEmail('user+tag@example.co.uk').isValid).toBe(true);
      expect(validateEmail('123@example.com').isValid).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid@email').isValid).toBe(false);
      expect(validateEmail('@example.com').isValid).toBe(false);
      expect(validateEmail('user@').isValid).toBe(false);
      expect(validateEmail('user name@example.com').isValid).toBe(false);
      expect(validateEmail('user@domain').isValid).toBe(false);
    });

    it('should reject empty email', () => {
      const result = validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should reject email that is too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const result = validateEmail(longEmail);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too long');
    });

    it('should trim whitespace', () => {
      expect(validateEmail('  user@example.com  ').isValid).toBe(true);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhone('+995500050610').isValid).toBe(true);
      expect(validatePhone('+12025551234').isValid).toBe(true);
      expect(validatePhone('+441234567890').isValid).toBe(true);
    });

    it('should allow empty phone (optional field)', () => {
      expect(validatePhone('').isValid).toBe(true);
      expect(validatePhone(undefined as any).isValid).toBe(true);
    });

    it('should reject phone without +', () => {
      const result = validatePhone('995500050610');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must start with +');
    });

    it('should reject phone with non-digits', () => {
      const result = validatePhone('+995-500-05-06-10');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('only digits');
    });

    it('should reject phone that is too long', () => {
      const result = validatePhone('+1234567890123456'); // 16 digits
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too long');
    });

    it('should reject phone that is too short', () => {
      const result = validatePhone('+12345'); // 5 digits
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too short');
    });

    it('should enforce country code when provided', () => {
      expect(validatePhone('+995500050610', '995').isValid).toBe(true);

      const result = validatePhone('+995500050610', '1'); // Expecting USA
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('+1');
    });
  });

  describe('validateDate', () => {
    it('should validate correct dates', () => {
      expect(validateDate('1986-01-26').isValid).toBe(true);
      expect(validateDate('2000-12-31').isValid).toBe(true);
    });

    it('should allow empty date (optional field)', () => {
      expect(validateDate('').isValid).toBe(true);
    });

    it('should reject invalid date format', () => {
      expect(validateDate('26-01-1986').isValid).toBe(false);
      expect(validateDate('1986/01/26').isValid).toBe(false);
      expect(validateDate('not-a-date').isValid).toBe(false);
    });

    it('should reject invalid dates', () => {
      expect(validateDate('2024-02-30').isValid).toBe(false); // February 30
      expect(validateDate('2024-13-01').isValid).toBe(false); // Month 13
    });

    it('should reject future dates by default', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      const result = validateDate(futureDateString, false);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Future dates');
    });

    it('should allow future dates when specified', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      expect(validateDate(futureDateString, true).isValid).toBe(true);
    });

    it('should reject dates too far in the past', () => {
      const result = validateDate('1850-01-01', false, 120);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('120 years');
    });
  });

  describe('validateBirthDate', () => {
    it('should validate correct birth dates', () => {
      expect(validateBirthDate('1986-01-26').isValid).toBe(true);
      expect(validateBirthDate('2000-01-01').isValid).toBe(true);
    });

    it('should reject future birth dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      expect(validateBirthDate(futureDateString).isValid).toBe(false);
    });

    it('should reject birth dates too far in the past', () => {
      expect(validateBirthDate('1850-01-01').isValid).toBe(false);
    });
  });

  describe('validateHireDate', () => {
    it('should validate correct hire dates', () => {
      expect(validateHireDate('2020-01-15').isValid).toBe(true);
      expect(validateHireDate('1990-06-01').isValid).toBe(true);
    });

    it('should allow future hire dates', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 2);
      const futureDateString = futureDate.toISOString().split('T')[0];

      expect(validateHireDate(futureDateString).isValid).toBe(true);
    });

    it('should reject hire dates too far in the past', () => {
      expect(validateHireDate('1950-01-01').isValid).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should validate non-empty values', () => {
      expect(validateRequired('John', 'First name').isValid).toBe(true);
      expect(validateRequired('Smith', 'Last name').isValid).toBe(true);
    });

    it('should reject empty values', () => {
      const result = validateRequired('', 'First name');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('First name');
      expect(result.error).toContain('required');
    });

    it('should reject whitespace-only values', () => {
      const result = validateRequired('   ', 'Last name');
      expect(result.isValid).toBe(false);
    });

    it('should enforce minimum length', () => {
      const result = validateRequired('A', 'Name', 2);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 2');
    });

    it('should enforce maximum length', () => {
      const result = validateRequired('A'.repeat(300), 'Name', 1, 255);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('255 characters');
    });
  });

  describe('validateStaffId', () => {
    it('should validate correct staff IDs', () => {
      expect(validateStaffId('STAFF-001').isValid).toBe(true);
      expect(validateStaffId('STAFF_2025_123').isValid).toBe(true);
      expect(validateStaffId('EMP123').isValid).toBe(true);
    });

    it('should allow empty staff ID (optional field)', () => {
      expect(validateStaffId('').isValid).toBe(true);
    });

    it('should reject staff IDs with invalid characters', () => {
      expect(validateStaffId('STAFF@001').isValid).toBe(false);
      expect(validateStaffId('STAFF 001').isValid).toBe(false);
      expect(validateStaffId('STAFF#001').isValid).toBe(false);
    });

    it('should reject staff IDs that are too short', () => {
      const result = validateStaffId('AB');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 3');
    });

    it('should reject staff IDs that are too long', () => {
      const result = validateStaffId('A'.repeat(51));
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('50 characters');
    });
  });

  describe('validateAccountForm', () => {
    it('should validate complete valid form', () => {
      const values = {
        firstName: 'თენგიზი',
        lastName: 'ხოზვრია',
        email: 'tengizi@medimind.ge',
        phoneNumber: '+995500050610',
        birthDate: '1986-01-26',
        hireDate: '2020-01-15',
        staffId: 'STAFF-001',
      };

      const errors = validateAccountForm(values);
      expect(Object.keys(errors).length).toBe(0);
    });

    it('should return errors for missing required fields', () => {
      const values = {
        firstName: '',
        lastName: '',
        email: '',
      };

      const errors = validateAccountForm(values);

      expect(errors.firstName).toBeDefined();
      expect(errors.lastName).toBeDefined();
      expect(errors.email).toBeDefined();
    });

    it('should validate optional fields when provided', () => {
      const values = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: 'invalid-phone',
        birthDate: 'invalid-date',
        staffId: 'A',
      };

      const errors = validateAccountForm(values);

      expect(errors.phoneNumber).toBeDefined();
      expect(errors.birthDate).toBeDefined();
      expect(errors.staffId).toBeDefined();
    });

    it('should not validate optional fields when not provided', () => {
      const values = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };

      const errors = validateAccountForm(values);
      expect(Object.keys(errors).length).toBe(0);
    });

    it('should trim and validate field values', () => {
      const values = {
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: '  john@example.com  ',
      };

      const errors = validateAccountForm(values);
      expect(Object.keys(errors).length).toBe(0);
    });
  });
});
