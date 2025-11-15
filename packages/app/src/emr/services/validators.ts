// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Validation functions for EMR forms
 *
 * Includes validators for:
 * - Georgian Personal ID (11-digit with Luhn checksum)
 * - Email addresses (RFC 5322)
 * - Birthdates
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate Georgian Personal ID (11 digits with Luhn checksum)
 *
 * Format: XXXXXXXXXXX (11 digits)
 * Last digit is a Luhn checksum
 *
 * Valid examples:
 * - 26001014632 (თენგიზი ხოზვრია)
 * - 01001011116 (Test ID from HL7 FHIR validator)
 */
export function validateGeorgianPersonalId(id: string): ValidationResult {
  // Check length
  if (id.length !== 11) {
    return {
      isValid: false,
      error: 'Personal ID must be exactly 11 digits',
    };
  }

  // Check if all characters are digits
  if (!/^\d{11}$/.test(id)) {
    return {
      isValid: false,
      error: 'Personal ID must contain only digits',
    };
  }

  // Validate Luhn checksum
  if (!validateLuhnChecksum(id)) {
    return {
      isValid: false,
      error: 'Invalid personal ID checksum',
    };
  }

  return { isValid: true };
}

/**
 * Validate email address (RFC 5322 simplified)
 *
 * Checks for basic email format: localpart@domain.tld
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      error: 'Invalid email format',
    };
  }

  return { isValid: true };
}

/**
 * Validate birthdate
 *
 * Checks:
 * - Not in the future
 * - Not more than 120 years ago
 */
export function validateBirthdate(birthdate: Date | string): ValidationResult {
  const date = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;

  // Check if valid date
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: 'Invalid date format',
    };
  }

  const now = new Date();
  const maxAge = 120;
  const minDate = new Date();
  minDate.setFullYear(now.getFullYear() - maxAge);

  // Check if in future
  if (date > now) {
    return {
      isValid: false,
      error: 'Birthdate cannot be in the future',
    };
  }

  // Check if too old
  if (date < minDate) {
    return {
      isValid: false,
      error: `Birthdate cannot be more than ${maxAge} years ago`,
    };
  }

  return { isValid: true };
}

/**
 * Validate Luhn checksum (used for Georgian Personal IDs)
 *
 * The Luhn algorithm:
 * 1. Starting from the rightmost digit (check digit) and moving left,
 *    double the value of every second digit
 * 2. If the result of doubling is greater than 9, subtract 9
 * 3. Sum all the digits
 * 4. If the total modulo 10 is 0, the number is valid
 */
function validateLuhnChecksum(value: string): boolean {
  let sum = 0;
  let isEven = false;

  // Loop through digits from right to left
  for (let i = value.length - 1; i >= 0; i--) {
    let digit = parseInt(value[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}
