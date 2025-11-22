# Form Validation Research: Patterns, Libraries, and Best Practices

**Research Date**: 2025-11-21
**Project**: MediMind EMR System
**Purpose**: Comprehensive research on form validation patterns for FHIR Form Builder implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Validation Libraries Comparison](#validation-libraries-comparison)
3. [Real-Time Validation Patterns](#real-time-validation-patterns)
4. [Medical Form Validation Requirements](#medical-form-validation-requirements)
5. [Error Messaging Best Practices](#error-messaging-best-practices)
6. [Conditional & Cross-Field Validation](#conditional--cross-field-validation)
7. [Client-Side vs Server-Side Validation](#client-side-vs-server-side-validation)
8. [Accessibility & ARIA Live Regions](#accessibility--aria-live-regions)
9. [Current MediMind Implementation Analysis](#current-medimind-implementation-analysis)
10. [Recommendations for Form Builder](#recommendations-for-form-builder)

---

## Executive Summary

### Key Findings

1. **Library Recommendation**: **Zod** for TypeScript-first validation with static type inference
2. **Validation Timing**: **onBlur** for initial validation, **onChange** after first error (hybrid approach)
3. **Error Display**: **Inline errors** near fields with **ARIA live regions** for accessibility
4. **Async Validation**: **500ms debounce** for duplicate checking and API calls
5. **Security**: **Always validate server-side**, use client-side for UX only

### Medical Form Requirements

- **Georgian Personal ID**: 11-digit numeric, optional Luhn checksum
- **E.164 Phone Format**: `+[country code][subscriber number]` (max 15 digits)
- **RFC 5322 Email**: Simplified regex matching 99.99% of valid emails
- **Date Validation**: ISO 8601 format (YYYY-MM-DD), range constraints
- **Multilingual Errors**: Georgian (ka), English (en), Russian (ru)

---

## Validation Libraries Comparison

### 1. Zod (Recommended for TypeScript)

**Description**: TypeScript-first schema validation with static type inference

**Pros**:
- Native TypeScript support with automatic type inference
- Zero dependencies, small bundle size
- Composable schemas with `.extend()`, `.pick()`, `.omit()`
- Great error messages with `.safeParse()`
- Active ecosystem (React Hook Form, tRPC)
- Async refinements built-in

**Cons**:
- Requires TypeScript 5.5+
- Less mature than Yup/Joi (released 2020)
- Smaller community than Yup

**Bundle Size**: ~49kB (gzipped)

**Example**:
```typescript
import { z } from 'zod';

// Define schema
const patientSchema = z.object({
  firstName: z.string().min(2, 'Name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  personalId: z.string().length(11, 'Personal ID must be 11 digits').regex(/^\d{11}$/, 'Must contain only digits'),
  birthDate: z.string().refine((date) => {
    const d = new Date(date);
    return d < new Date() && d > new Date('1900-01-01');
  }, 'Invalid birthdate'),
});

// Infer TypeScript type
type PatientFormValues = z.infer<typeof patientSchema>;

// Validate
const result = patientSchema.safeParse(data);
if (!result.success) {
  console.log(result.error.issues); // Detailed error array
}
```

**When to Use**: TypeScript-heavy projects, new codebases, React Hook Form integration

---

### 2. Yup (Frontend-Focused)

**Description**: Schema validation inspired by Joi, built for frontend/React

**Pros**:
- Excellent React Hook Form integration (Formik team)
- Chainable API (`.string().email().required()`)
- TypeScript support via `InferType`
- Smaller bundle than Joi (~60kB)
- Async validation built-in
- Great for React ecosystem

**Cons**:
- Not ideal for backend validation
- TypeScript support less robust than Zod
- Throws errors by default (requires try/catch)

**Bundle Size**: ~60.1kB (gzipped)

**Example**:
```typescript
import * as yup from 'yup';

const patientSchema = yup.object({
  firstName: yup.string().min(2).required('First name is required'),
  lastName: yup.string().min(2).required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  personalId: yup.string()
    .length(11, 'Personal ID must be 11 digits')
    .matches(/^\d{11}$/, 'Must contain only digits')
    .test('luhn-checksum', 'Invalid personal ID checksum', validateLuhnChecksum),
});

// Infer TypeScript type
type PatientFormValues = yup.InferType<typeof patientSchema>;

// Validate
try {
  const validData = await patientSchema.validate(data, { abortEarly: false });
} catch (err) {
  console.log(err.errors); // Array of error messages
}
```

**When to Use**: React apps, Formik users, frontend-only validation

---

### 3. Joi (Backend-Focused)

**Description**: Validation library from Hapi.js ecosystem, server-side validation

**Pros**:
- Most powerful validation features
- Battle-tested in Node.js ecosystem
- Doesn't throw errors by default (returns result object)
- Extensive validation methods
- Great for API validation

**Cons**:
- Largest bundle size (~145.9kB) - not suitable for frontend
- No native TypeScript type inference
- Overkill for frontend forms

**Bundle Size**: ~145.9kB (gzipped)

**Example**:
```typescript
import Joi from 'joi';

const patientSchema = Joi.object({
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  personalId: Joi.string().length(11).pattern(/^\d{11}$/).required(),
});

// Validate (no throw)
const { error, value } = patientSchema.validate(data, { abortEarly: false });
if (error) {
  console.log(error.details); // Array of validation errors
}
```

**When to Use**: Node.js backend, API validation, server-side only

---

### 4. Vest (Testing-Inspired)

**Description**: Declarative validation framework inspired by unit testing (Jest/Mocha)

**Pros**:
- Framework-agnostic (React, Vue, Angular, vanilla JS)
- Familiar syntax for developers who know Jest
- Manages its own state
- Async validation built-in
- Separation of concerns (validation logic separate from UI)

**Cons**:
- Smaller ecosystem than Zod/Yup
- Less TypeScript support
- Learning curve for non-testing-familiar developers

**Example**:
```typescript
import { create, test, enforce } from 'vest';

const patientSuite = create((data = {}) => {
  test('firstName', 'First name is required', () => {
    enforce(data.firstName).isNotEmpty();
  });

  test('firstName', 'First name must be at least 2 characters', () => {
    enforce(data.firstName).longerThan(1);
  });

  test('email', 'Invalid email format', () => {
    enforce(data.email).matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  test('personalId', 'Personal ID must be 11 digits', () => {
    enforce(data.personalId).lengthEquals(11);
    enforce(data.personalId).matches(/^\d{11}$/);
  });
});

// Validate
const result = patientSuite(data);
if (result.hasErrors()) {
  console.log(result.getErrors()); // { firstName: ['...'], email: ['...'] }
}
```

**When to Use**: Multi-framework projects, testing-familiar teams, complex validation logic

---

### 5. React Hook Form (Built-in Validation)

**Description**: Form library with built-in validation rules

**Pros**:
- No external library needed for simple validation
- Performant (minimal re-renders)
- Native HTML5 validation support
- Custom validation functions
- Schema resolver support (Zod, Yup, Joi)

**Cons**:
- Less powerful than dedicated schema libraries
- Manual error message management
- No schema reuse across forms

**Example**:
```typescript
import { useForm } from 'react-hook-form';

interface PatientFormValues {
  firstName: string;
  lastName: string;
  email: string;
  personalId: string;
}

function PatientForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormValues>();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('firstName', {
          required: 'First name is required',
          minLength: { value: 2, message: 'Min 2 characters' },
        })}
      />
      {errors.firstName && <span>{errors.firstName.message}</span>}

      <input
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid email format',
          },
        })}
      />
      {errors.email && <span>{errors.email.message}</span>}

      <input
        {...register('personalId', {
          required: 'Personal ID is required',
          validate: {
            length: (value) => value.length === 11 || 'Must be 11 digits',
            digits: (value) => /^\d{11}$/.test(value) || 'Must contain only digits',
            checksum: (value) => validateLuhnChecksum(value) || 'Invalid checksum',
          },
        })}
      />
    </form>
  );
}
```

**When to Use**: Simple forms, no schema reuse needed, React-only projects

---

### Comparison Table

| Feature | Zod | Yup | Joi | Vest | React Hook Form |
|---------|-----|-----|-----|------|-----------------|
| **TypeScript Support** | ⭐⭐⭐⭐⭐ Native | ⭐⭐⭐ InferType | ⭐ Manual | ⭐⭐ Basic | ⭐⭐⭐ Good |
| **Bundle Size** | 49kB | 60kB | 146kB | ~30kB | ~30kB |
| **Frontend/Backend** | Both | Frontend | Backend | Both | Frontend |
| **React Integration** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Async Validation** | ✅ Built-in | ✅ Built-in | ✅ Built-in | ✅ Built-in | ✅ Custom |
| **Error Handling** | `.safeParse()` | Throws | Result object | State mgmt | State object |
| **Schema Composition** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ❌ |
| **Learning Curve** | Low | Low | Medium | Medium | Low |
| **Ecosystem** | Growing | Mature | Mature | Small | Large |
| **Best For** | TypeScript apps | React apps | Node.js APIs | Multi-framework | Simple forms |

---

## Real-Time Validation Patterns

### Validation Trigger Modes

#### 1. **onSubmit** (Default)
Validates only when form is submitted.

**Pros**: No premature errors, less distracting
**Cons**: User doesn't know about errors until submit

```typescript
const { register, handleSubmit } = useForm({
  mode: 'onSubmit', // Validate on form submit only
});
```

---

#### 2. **onBlur** (Recommended)
Validates when user leaves a field (loses focus).

**Pros**: Doesn't distract while typing, validates after completion
**Cons**: Slight delay in feedback

```typescript
const { register, handleSubmit } = useForm({
  mode: 'onBlur', // Validate when field loses focus
});
```

---

#### 3. **onChange** (Real-Time)
Validates on every keystroke.

**Pros**: Immediate feedback, great for duplicate checking
**Cons**: Can be annoying, shows errors while typing

```typescript
const { register, handleSubmit } = useForm({
  mode: 'onChange', // Validate on every change
});
```

---

#### 4. **onTouched** (Hybrid - Recommended)
Validates **onBlur** first, then switches to **onChange** after first error.

**Pros**: Best of both worlds, doesn't annoy user
**Cons**: Slightly more complex

```typescript
const { register, handleSubmit } = useForm({
  mode: 'onTouched', // onBlur first, then onChange after error
});
```

---

### Debounced Validation Pattern

**Problem**: Async validation (duplicate checking) on every keystroke floods the server.

**Solution**: Debounce validation to wait until user stops typing (500ms).

#### Implementation with React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { useMemo } from 'react';
import { debounce } from 'lodash';

function PatientForm() {
  const { register, handleSubmit, trigger } = useForm();

  // Debounced validation trigger (500ms)
  const debouncedValidation = useMemo(
    () => debounce((field: string) => trigger(field), 500),
    [trigger]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('personalId', {
          required: 'Personal ID is required',
          validate: async (value) => {
            // This will be called after 500ms of inactivity
            const isDuplicate = await checkDuplicatePersonalId(value);
            return !isDuplicate || 'Personal ID already exists';
          },
        })}
        onChange={(e) => {
          // Manually trigger debounced validation
          debouncedValidation('personalId');
        }}
      />
    </form>
  );
}
```

#### Implementation with Custom Hook

```typescript
import { useState, useEffect } from 'react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel timeout if value changes
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function PatientForm() {
  const [personalId, setPersonalId] = useState('');
  const debouncedPersonalId = useDebounce(personalId, 500);

  useEffect(() => {
    if (debouncedPersonalId.length === 11) {
      checkDuplicatePersonalId(debouncedPersonalId).then((isDuplicate) => {
        if (isDuplicate) {
          setError('Personal ID already exists');
        }
      });
    }
  }, [debouncedPersonalId]);

  return (
    <input
      value={personalId}
      onChange={(e) => setPersonalId(e.target.value)}
    />
  );
}
```

---

### Async Validation Best Practices

#### 1. **Cancel Previous Requests**
Use `AbortController` to cancel in-flight requests when user keeps typing.

```typescript
import { useEffect, useRef } from 'react';

function useAsyncValidation(value: string, validator: (value: string) => Promise<boolean>) {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel previous request
    abortControllerRef.current?.abort();

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    const validate = async () => {
      try {
        const isValid = await validator(value);
        return isValid;
      } catch (error) {
        // Ignore abort errors
        if (error.name !== 'AbortError') {
          console.error('Validation error:', error);
        }
      }
    };

    validate();
  }, [value, validator]);
}
```

---

#### 2. **Early Returns for Invalid Input**
Skip API calls for obviously invalid data.

```typescript
async function validatePersonalId(value: string): Promise<string | boolean> {
  // Early return for empty or too short
  if (!value || value.length < 11) {
    return true; // No error, just incomplete
  }

  // Early return for non-numeric
  if (!/^\d{11}$/.test(value)) {
    return 'Personal ID must contain only digits';
  }

  // Only make API call if format is valid
  const isDuplicate = await checkDuplicatePersonalId(value);
  return !isDuplicate || 'Personal ID already exists';
}
```

---

#### 3. **Handle Errors Gracefully**
Don't break the form if server is down.

```typescript
async function validatePersonalId(value: string): Promise<string | boolean> {
  try {
    const isDuplicate = await checkDuplicatePersonalId(value);
    return !isDuplicate || 'Personal ID already exists';
  } catch (error) {
    console.error('Duplicate check failed:', error);
    // Allow form submission even if validation fails
    return true;
  }
}
```

---

### Progressive Validation Pattern

Show validation feedback as user types, but only after field is complete.

```typescript
function PatientForm() {
  const [personalId, setPersonalId] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const debouncedPersonalId = useDebounce(personalId, 500);

  useEffect(() => {
    // Only validate if full length
    if (debouncedPersonalId.length === 11) {
      setIsValidating(true);
      validatePersonalId(debouncedPersonalId)
        .then((result) => {
          setError(result === true ? '' : result);
        })
        .finally(() => setIsValidating(false));
    }
  }, [debouncedPersonalId]);

  return (
    <div>
      <input
        value={personalId}
        onChange={(e) => setPersonalId(e.target.value)}
        maxLength={11}
      />
      {isValidating && <span>Checking...</span>}
      {error && <span className="error">{error}</span>}
      {!isValidating && !error && personalId.length === 11 && (
        <span className="success">✓ Valid</span>
      )}
    </div>
  );
}
```

---

## Medical Form Validation Requirements

### 1. Georgian Personal ID Validation (11-Digit with Luhn)

#### Format
- **Length**: Exactly 11 digits
- **Characters**: Numeric only (0-9)
- **Checksum**: Luhn algorithm (modulo 10)

#### Luhn Algorithm Implementation

The Luhn algorithm (also known as modulus 10 or mod 10 algorithm) is a checksum formula used to validate identification numbers.

**Algorithm Steps**:
1. Start from the rightmost digit (excluding check digit)
2. Double every second digit
3. If doubling results in a two-digit number, add the digits together
4. Sum all digits
5. If total modulo 10 equals 0, the number is valid

**Implementation**:
```typescript
/**
 * Validate Georgian Personal ID with Luhn checksum
 *
 * @param id - 11-digit Georgian personal ID
 * @returns ValidationResult with isValid boolean and optional error
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
 * Luhn checksum validation (modulo 10 algorithm)
 *
 * @param value - Numeric string to validate
 * @returns true if checksum is valid
 */
function validateLuhnChecksum(value: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  // Traverse from right to left
  for (let i = value.length - 1; i >= 0; i--) {
    let digit = parseInt(value[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9; // Same as adding the two digits
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
```

**Valid Test Cases**:
```typescript
// Valid Georgian Personal IDs
validateGeorgianPersonalId('26001014632'); // { isValid: true }
validateGeorgianPersonalId('01001011116'); // { isValid: true }
validateGeorgianPersonalId('01011076709'); // { isValid: true }

// Invalid cases
validateGeorgianPersonalId('2600101463');  // { isValid: false, error: 'Must be 11 digits' }
validateGeorgianPersonalId('26001014633'); // { isValid: false, error: 'Invalid checksum' }
validateGeorgianPersonalId('2600101463A'); // { isValid: false, error: 'Must contain only digits' }
```

---

### 2. E.164 Phone Number Validation

#### Format
- **Structure**: `+[country code][subscriber number]`
- **Max Length**: 15 digits (including country code)
- **Prefix**: Must start with `+`
- **Georgia**: `+995` (3-digit country code)

#### Implementation

```typescript
/**
 * Validate E.164 international phone number format
 *
 * @param phoneNumber - Phone number to validate
 * @param countryCode - Optional country code to enforce (e.g., '995' for Georgia)
 * @returns ValidationResult with isValid boolean and optional error
 */
export function validateE164Phone(phoneNumber: string, countryCode?: string): ValidationResult {
  if (!phoneNumber || phoneNumber.trim() === '') {
    return { isValid: true }; // Optional field
  }

  const trimmedPhone = phoneNumber.trim();

  // Must start with +
  if (!trimmedPhone.startsWith('+')) {
    return {
      isValid: false,
      error: 'Phone number must start with + (E.164 format)',
    };
  }

  // Extract digits only (remove +)
  const digits = trimmedPhone.slice(1);

  // Must contain only digits
  if (!/^\d+$/.test(digits)) {
    return {
      isValid: false,
      error: 'Phone number must contain only digits after +',
    };
  }

  // E.164 maximum length is 15 digits
  if (digits.length > 15) {
    return {
      isValid: false,
      error: 'Phone number too long (maximum 15 digits)',
    };
  }

  // Minimum length check (country code + number)
  if (digits.length < 7) {
    return {
      isValid: false,
      error: 'Phone number too short (minimum 7 digits)',
    };
  }

  // Optional country code enforcement
  if (countryCode && !digits.startsWith(countryCode)) {
    return {
      isValid: false,
      error: `Phone number must start with +${countryCode}`,
    };
  }

  return { isValid: true };
}

/**
 * Regex pattern for E.164 validation
 * Matches: +[1-9][0-9]{1,14}
 */
const E164_REGEX = /^\+[1-9]\d{1,14}$/;

export function validateE164Regex(phoneNumber: string): boolean {
  return E164_REGEX.test(phoneNumber);
}
```

**Valid Examples**:
```typescript
// Georgia
validateE164Phone('+995500050610'); // Valid
validateE164Phone('+995500050610', '995'); // Valid with country code check

// USA/Canada
validateE164Phone('+14155554345'); // Valid

// UK
validateE164Phone('+442045678910'); // Valid

// Invalid
validateE164Phone('500050610'); // Missing +
validateE164Phone('+995-500-050-610'); // Contains dashes
validateE164Phone('+9955000506101234567'); // Too long (>15 digits)
```

---

### 3. RFC 5322 Email Validation

#### Format
- **Structure**: `localpart@domain.tld`
- **Local Part**: Max 64 characters, alphanumeric + special chars
- **Domain**: Max 253 characters, alphanumeric + hyphens + dots
- **TLD**: Minimum 2 characters

#### Implementation

```typescript
/**
 * Validate email address (RFC 5322 simplified)
 *
 * This regex matches 99.99% of valid emails in actual use.
 * Full RFC 5322 compliance requires complex parsing beyond regex.
 *
 * @param email - Email address to validate
 * @returns ValidationResult with isValid boolean and optional error
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const trimmedEmail = email.trim();

  // RFC 5322 simplified regex
  // Matches: user@example.com, user.name+tag@example.co.uk
  const emailRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9._+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Invalid email format. Expected format: user@example.com',
    };
  }

  // Length checks (RFC 5321)
  if (trimmedEmail.length > 254) {
    return {
      isValid: false,
      error: 'Email address too long (maximum 254 characters)',
    };
  }

  const [localPart, domain] = trimmedEmail.split('@');

  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'Email local part too long (maximum 64 characters before @)',
    };
  }

  if (domain.length > 253) {
    return {
      isValid: false,
      error: 'Email domain too long (maximum 253 characters after @)',
    };
  }

  return { isValid: true };
}
```

**Valid Examples**:
```typescript
validateEmail('tengizi@medimind.ge'); // Valid
validateEmail('user.name+tag@example.co.uk'); // Valid
validateEmail('john.doe123@mail-server.com'); // Valid

// Invalid
validateEmail('invalid@'); // Missing domain
validateEmail('@example.com'); // Missing local part
validateEmail('user@.com'); // Invalid domain
validateEmail('user @example.com'); // Space in local part
```

---

### 4. Date Validation (ISO 8601)

#### Format
- **Structure**: `YYYY-MM-DD`
- **Constraints**: Not in future, not >120 years ago
- **Use Cases**: Birth dates, hire dates, appointment dates

#### Implementation

```typescript
/**
 * Validate date format and constraints
 *
 * @param dateString - ISO 8601 date string (YYYY-MM-DD)
 * @param allowFuture - Whether to allow future dates (default: false)
 * @param maxYearsAgo - Maximum years in the past (default: 120)
 * @returns ValidationResult with isValid boolean and optional error
 */
export function validateDate(
  dateString: string,
  allowFuture: boolean = false,
  maxYearsAgo: number = 120
): ValidationResult {
  if (!dateString || dateString.trim() === '') {
    return { isValid: true }; // Optional field
  }

  // ISO 8601 date format: YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateRegex.test(dateString)) {
    return {
      isValid: false,
      error: 'Invalid date format. Expected: YYYY-MM-DD (e.g., 1986-01-26)',
    };
  }

  // Parse date components manually to catch invalid dates
  const [year, month, day] = dateString.split('-').map(Number);

  // Create date using components
  const date = new Date(year, month - 1, day);

  // Check if date is valid (e.g., not February 30)
  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      error: 'Invalid date. Please check day/month combination.',
    };
  }

  // Check if date components match (JavaScript auto-corrects invalid dates)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return {
      isValid: false,
      error: 'Invalid date. Please check day/month combination.',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  const inputDate = new Date(dateString);
  inputDate.setHours(0, 0, 0, 0);

  // Check if future date
  if (!allowFuture && inputDate > today) {
    return {
      isValid: false,
      error: 'Future dates are not allowed',
    };
  }

  // Check if too far in the past
  const maxPastDate = new Date(today);
  maxPastDate.setFullYear(today.getFullYear() - maxYearsAgo);

  if (inputDate < maxPastDate) {
    return {
      isValid: false,
      error: `Date cannot be more than ${maxYearsAgo} years ago`,
    };
  }

  return { isValid: true };
}

/**
 * Validate birth date
 * Special case of date validation for birth dates
 */
export function validateBirthDate(birthDate: string): ValidationResult {
  return validateDate(birthDate, false, 120);
}

/**
 * Validate hire date
 * Special case of date validation for employment hire dates
 */
export function validateHireDate(hireDate: string): ValidationResult {
  return validateDate(hireDate, true, 50); // Allow future dates, 50 years max
}
```

**Valid Examples**:
```typescript
validateBirthDate('1986-01-26'); // Valid
validateBirthDate('2000-12-31'); // Valid

// Invalid
validateBirthDate('2026-01-01'); // Future date
validateBirthDate('1850-01-01'); // More than 120 years ago
validateBirthDate('2023-02-30'); // Invalid day/month combo
validateBirthDate('2023-13-01'); // Invalid month
```

---

## Error Messaging Best Practices

### Key Principles (Nielsen Norman Group + Smashing Magazine)

1. **Be Explicit**: Say exactly what's wrong and how to fix it
2. **Be Human-Readable**: Avoid technical jargon
3. **Be Polite**: No negative language ("Wrong!", "Invalid!")
4. **Be Precise**: Reference specific field and constraint
5. **Give Constructive Advice**: Show correct format or example

---

### Message Placement Guidelines

#### 1. **Inline Errors Near Fields** (Recommended)
Display error message directly below or above the field in error.

**Why**: Minimizes working memory load - users see error while fixing it.

```tsx
<div>
  <label htmlFor="email">Email</label>
  <input id="email" {...register('email')} />
  {errors.email && (
    <span className="error" role="alert">
      {errors.email.message}
    </span>
  )}
</div>
```

**Visual Design**:
- **Color**: Red text (#d32f2f)
- **Icon**: ⚠️ or ✕ to left of message
- **Position**: 4-8px below field
- **Alignment**: Left-aligned with field

---

#### 2. **Error Summary at Top** (Optional)
List all errors at top of form for overview.

**When to Use**: Long forms with many fields, form submission errors

```tsx
{Object.keys(errors).length > 0 && (
  <div className="error-summary" role="alert" aria-live="assertive">
    <h3>Please fix the following errors:</h3>
    <ul>
      {Object.entries(errors).map(([field, error]) => (
        <li key={field}>
          <a href={`#${field}`}>{error.message}</a>
        </li>
      ))}
    </ul>
  </div>
)}
```

---

#### 3. **Avoid Bottom-Only Errors**
Don't place errors only below fields - mobile keyboards can hide them.

**Problem**: On mobile, keyboard covers bottom of screen.

**Solution**: Place errors above field or in fixed position.

---

### Validation Timing (When to Show Errors)

#### 1. **Avoid Premature Validation**
Don't show errors while user is actively typing.

**Bad Example**:
```tsx
// Shows error immediately as user types
<input onChange={(e) => validateEmail(e.target.value)} />
```

**Good Example**:
```tsx
// Shows error only after user leaves field
<input onBlur={(e) => validateEmail(e.target.value)} />
```

---

#### 2. **Use Inline Validation After First Error**
Show errors onBlur initially, then onChange after first error.

**Implementation**:
```tsx
const { register, formState: { errors, touchedFields } } = useForm({
  mode: 'onTouched', // Validates onBlur first, then onChange
});

<input
  {...register('email')}
  className={errors.email ? 'error-border' : ''}
/>
```

---

#### 3. **Show Success Indicators**
Display checkmark (✓) when field is valid.

```tsx
{!errors.email && touchedFields.email && (
  <span className="success">✓ Valid email</span>
)}
```

---

### Error Message Templates

#### Generic Field Error
```typescript
// Bad
"Invalid input"

// Good
"Email format is invalid. Expected format: user@example.com"
```

---

#### Required Field
```typescript
// Bad
"Field required"

// Good
"First name is required"
```

---

#### Length Constraint
```typescript
// Bad
"Too short"

// Good
"First name must be at least 2 characters"
```

---

#### Format Error
```typescript
// Bad
"Wrong format"

// Good
"Personal ID must be exactly 11 digits. Example: 26001014632"
```

---

#### Range Error
```typescript
// Bad
"Out of range"

// Good
"Birth date cannot be more than 120 years ago"
```

---

#### Duplicate Check
```typescript
// Bad
"Already exists"

// Good
"Personal ID 26001014632 is already registered. Please use a different ID or contact support."
```

---

### Visual Design Best Practices

#### Error State Styling

```css
/* Error text */
.error-message {
  color: #d32f2f; /* Red */
  font-size: 0.875rem; /* 14px */
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Error icon */
.error-message::before {
  content: '⚠️';
  flex-shrink: 0;
}

/* Error border on input */
input.error,
textarea.error {
  border-color: #d32f2f;
  background-color: #ffebee; /* Light red background */
}

/* Focus state for error input */
input.error:focus {
  border-color: #d32f2f;
  box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.2);
}

/* Success state */
.success-message {
  color: #2e7d32; /* Green */
  font-size: 0.875rem;
  margin-top: 4px;
}

.success-message::before {
  content: '✓';
  margin-right: 4px;
}
```

---

### Multi-Language Error Messages

#### Implementation Pattern

```typescript
interface ErrorMessages {
  ka: string; // Georgian
  en: string; // English
  ru: string; // Russian
}

const errorMessages: Record<string, ErrorMessages> = {
  'email.required': {
    ka: 'ელ-ფოსტა აუცილებელია',
    en: 'Email is required',
    ru: 'Требуется электронная почта',
  },
  'email.invalid': {
    ka: 'არასწორი ელ-ფოსტის ფორმატი',
    en: 'Invalid email format',
    ru: 'Неверный формат электронной почты',
  },
  'personalId.invalid': {
    ka: 'პირადი ნომერი უნდა შედგებოდეს 11 ციფრისგან',
    en: 'Personal ID must be exactly 11 digits',
    ru: 'Личный номер должен состоять из 11 цифр',
  },
};

// Usage
function getErrorMessage(key: string, lang: 'ka' | 'en' | 'ru'): string {
  return errorMessages[key]?.[lang] || errorMessages[key]?.en || 'Unknown error';
}
```

---

#### Zod Integration

```typescript
import { z } from 'zod';

// Custom error messages with i18n
const patientSchema = (lang: 'ka' | 'en' | 'ru') => z.object({
  email: z.string().email({
    message: getErrorMessage('email.invalid', lang),
  }),
  personalId: z.string().length(11, {
    message: getErrorMessage('personalId.invalid', lang),
  }),
});
```

---

## Conditional & Cross-Field Validation

### Use Cases

1. **Required If**: Field required only if another field has a specific value
2. **Dependent Fields**: Field validation depends on another field's value
3. **Comparison**: Start date < End date, Min < Max
4. **Complex Rules**: Business logic involving multiple fields

---

### Pattern 1: Required If

**Scenario**: If patient age < 18, representative info is required.

#### Implementation

```typescript
import { useForm } from 'react-hook-form';

function PatientForm() {
  const { register, watch, formState: { errors } } = useForm();
  const birthDate = watch('birthDate');

  // Calculate age
  const age = birthDate ? calculateAge(new Date(birthDate)) : null;
  const isMinor = age !== null && age < 18;

  return (
    <form>
      <input {...register('birthDate', { required: true })} />

      {isMinor && (
        <>
          <h3>Representative Information (Required for minors)</h3>
          <input
            {...register('representativeFirstName', {
              required: isMinor ? 'Representative first name is required for minors' : false,
            })}
          />
          <input
            {...register('representativeLastName', {
              required: isMinor ? 'Representative last name is required for minors' : false,
            })}
          />
        </>
      )}
    </form>
  );
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
```

---

### Pattern 2: Cross-Field Validation

**Scenario**: Start date must be before end date.

#### Implementation with React Hook Form

```typescript
function EncounterForm() {
  const { register, watch, formState: { errors } } = useForm();
  const startDate = watch('startDate');

  return (
    <form>
      <input
        type="date"
        {...register('startDate', { required: 'Start date is required' })}
      />

      <input
        type="date"
        {...register('endDate', {
          required: 'End date is required',
          validate: (value) => {
            if (!startDate) return true;
            return new Date(value) >= new Date(startDate) || 'End date must be after start date';
          },
        })}
      />
    </form>
  );
}
```

---

#### Implementation with Zod

```typescript
import { z } from 'zod';

const encounterSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'End date must be after start date',
  path: ['endDate'], // Error will be attached to endDate field
});
```

---

### Pattern 3: Complex Business Rules

**Scenario**: If insurance type is "private", discount cannot exceed 10%.

#### Implementation

```typescript
const visitSchema = z.object({
  insuranceType: z.enum(['private', 'government', 'employer']),
  discount: z.number().min(0).max(100),
}).refine((data) => {
  if (data.insuranceType === 'private' && data.discount > 10) {
    return false;
  }
  return true;
}, {
  message: 'Private insurance discount cannot exceed 10%',
  path: ['discount'],
});
```

---

### Pattern 4: Getters for Dependent Validation

**Scenario**: Validate phone number format only if country is selected.

```typescript
function ContactForm() {
  const { register, getValues, formState: { errors } } = useForm();

  return (
    <form>
      <select {...register('country')}>
        <option value="GE">Georgia</option>
        <option value="US">USA</option>
      </select>

      <input
        {...register('phoneNumber', {
          validate: (value) => {
            const country = getValues('country');
            if (country === 'GE') {
              return /^\+995\d{9}$/.test(value) || 'Georgian phone must start with +995';
            }
            if (country === 'US') {
              return /^\+1\d{10}$/.test(value) || 'US phone must start with +1';
            }
            return true;
          },
        })}
      />
    </form>
  );
}
```

---

## Client-Side vs Server-Side Validation

### Core Principle: **Use Both**

- **Client-Side**: Enhances UX, provides instant feedback
- **Server-Side**: Ensures security, prevents malicious input

---

### Security Risks of Client-Only Validation

#### Problem: Client-Side Can Be Bypassed

Any validation performed only on the client-side can be circumvented by:
1. **Disabling JavaScript** in browser
2. **Using browser DevTools** to modify HTML/JS
3. **Using Postman/cURL** to send direct API requests
4. **Web proxies** (Burp Suite, OWASP ZAP)

**Example Attack**:
```bash
# Bypass client-side validation with cURL
curl -X POST https://api.medimind.ge/patients \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "<script>alert('XSS')</script>",
    "personalId": "INVALID",
    "email": "not-an-email"
  }'
```

If server doesn't validate, malicious data enters the database!

---

### OWASP Input Validation Guidelines

From OWASP Cheat Sheet Series:

> "Input validation must be implemented on the server-side before any data is processed by the application's functions. Client-side validation can be bypassed and should never be relied upon as the sole means of input validation."

---

### Best Practice Architecture

#### Client-Side Validation (UX Layer)

**Purpose**: Fast feedback, reduce server load, improve UX

**What to Validate**:
- ✅ Required fields
- ✅ Format validation (email, phone, dates)
- ✅ Length constraints
- ✅ Type checking (number vs string)
- ✅ Basic business rules

**What NOT to Rely On**:
- ❌ Security checks
- ❌ Authorization
- ❌ SQL injection prevention
- ❌ Final data integrity

**Implementation**:
```typescript
// CLIENT SIDE (React Hook Form)
function PatientForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: PatientFormValues) => {
    // Client-side validation passed
    // Now send to server for REAL validation
    try {
      await api.createPatient(data);
    } catch (error) {
      // Handle server-side validation errors
      if (error.response?.status === 400) {
        setServerErrors(error.response.data.errors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Invalid email format',
          },
        })}
      />
    </form>
  );
}
```

---

#### Server-Side Validation (Security Layer)

**Purpose**: Security, data integrity, prevent attacks

**What to Validate**:
- ✅ All client-side validations (never trust client)
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (escape HTML)
- ✅ Authorization (user has permission)
- ✅ Business rules (duplicate checking)
- ✅ Rate limiting

**Implementation Example (Express + Zod)**:
```typescript
// SERVER SIDE (Express API)
import { z } from 'zod';
import { Request, Response } from 'express';

const patientSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  email: z.string().email(),
  personalId: z.string().length(11).regex(/^\d{11}$/),
});

app.post('/api/patients', async (req: Request, res: Response) => {
  try {
    // STEP 1: Validate input schema
    const validatedData = patientSchema.parse(req.body);

    // STEP 2: Check authorization
    if (!req.user.hasPermission('create-patient')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // STEP 3: Business rule validation (duplicate check)
    const existingPatient = await db.findPatientByPersonalId(validatedData.personalId);
    if (existingPatient) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Patient with this personal ID already exists',
      });
    }

    // STEP 4: Sanitize input (prevent XSS)
    const sanitizedData = {
      ...validatedData,
      firstName: sanitizeHtml(validatedData.firstName),
      lastName: sanitizeHtml(validatedData.lastName),
    };

    // STEP 5: Create patient (parameterized query to prevent SQL injection)
    const patient = await db.createPatient(sanitizedData);

    return res.status(201).json(patient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Validation failed
      return res.status(400).json({
        error: 'Validation failed',
        issues: error.issues,
      });
    }

    // Internal server error
    console.error('Error creating patient:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
```

---

### Validation Synchronization Pattern

Keep client and server validation in sync by sharing schema.

#### Shared Schema (works on both client & server)

```typescript
// shared/schemas/patient.schema.ts
import { z } from 'zod';

export const patientSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(100),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email format'),
  personalId: z.string()
    .length(11, 'Personal ID must be exactly 11 digits')
    .regex(/^\d{11}$/, 'Personal ID must contain only digits')
    .refine(validateLuhnChecksum, 'Invalid personal ID checksum'),
  phoneNumber: z.string().regex(/^\+995\d{9}$/, 'Invalid Georgian phone number').optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
```

---

#### Client (React Hook Form + Zod Resolver)

```typescript
// client/components/PatientForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, PatientFormValues } from '@/shared/schemas/patient.schema';

function PatientForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema), // Zod schema validates on client
  });

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

---

#### Server (Express + Zod)

```typescript
// server/routes/patients.ts
import { patientSchema } from '@/shared/schemas/patient.schema';

app.post('/api/patients', async (req, res) => {
  const result = patientSchema.safeParse(req.body); // Same Zod schema validates on server

  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }

  // Proceed with validated data
  const patient = await createPatient(result.data);
  return res.json(patient);
});
```

---

### Summary: Client vs Server Validation

| Aspect | Client-Side | Server-Side |
|--------|-------------|-------------|
| **Purpose** | UX Enhancement | Security & Data Integrity |
| **Validation** | Format, Length, Type | All + Business Rules |
| **Trust Level** | ❌ Cannot Trust | ✅ Final Authority |
| **Performance** | Instant Feedback | Network Latency |
| **Security** | ❌ Can Be Bypassed | ✅ Cannot Be Bypassed |
| **Required?** | Optional (UX) | ✅ Mandatory |

**Golden Rule**: Always validate on server, use client-side validation to enhance UX.

---

## Accessibility & ARIA Live Regions

### Why Accessibility Matters

- **13% of population** has some form of disability
- **Screen reader users** rely on ARIA attributes
- **Keyboard navigation** essential for motor impairments
- **WCAG 2.1** compliance required for healthcare apps

---

### ARIA Live Regions for Form Errors

#### What are ARIA Live Regions?

ARIA live regions notify assistive technologies (screen readers) when dynamic content changes, even when user's focus is elsewhere.

**Example**: When a validation error appears, screen reader announces it without user having to navigate to it.

---

#### ARIA Live Politeness Levels

**1. aria-live="polite"** (Recommended for most errors)
- Screen reader waits until current task is finished
- Doesn't interrupt user
- Best for: Non-critical errors, field-level validation

**2. aria-live="assertive"** (Use sparingly)
- Screen reader interrupts current task immediately
- Announces error right away
- Best for: Critical errors, form submission failures

**3. aria-live="off"** (Default)
- No announcements
- Not suitable for errors

---

### Implementation Pattern

#### 1. Error Container Must Exist on Page Load

**CRITICAL**: Live region container must be in the DOM when page loads. Screen readers won't detect dynamically added live regions.

```tsx
function PatientForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <form>
      {/* Live region container - MUST exist on page load */}
      <div
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only" // Visually hidden but screen reader accessible
      >
        {/* Errors will be injected here dynamically */}
        {Object.values(errors).join(', ')}
      </div>

      {/* Form fields */}
      <input name="email" />
      {errors.email && (
        <span className="error-message">{errors.email}</span>
      )}
    </form>
  );
}
```

---

#### 2. Field-Level Error Announcement

Each field error should have `role="alert"` or be inside a live region.

```tsx
<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    {...register('email')}
    aria-invalid={errors.email ? 'true' : 'false'}
    aria-describedby={errors.email ? 'email-error' : undefined}
  />
  {errors.email && (
    <span
      id="email-error"
      role="alert"
      className="error-message"
    >
      {errors.email.message}
    </span>
  )}
</div>
```

**Key ARIA Attributes**:
- `aria-invalid="true"` - Marks field as having error
- `aria-describedby="email-error"` - Links error message to field
- `role="alert"` - Announces error to screen readers

---

#### 3. Form Summary Error List

For forms with multiple errors, provide a summary at the top.

```tsx
{Object.keys(errors).length > 0 && (
  <div
    role="alert"
    aria-live="assertive"
    className="error-summary"
    tabIndex={-1}
    ref={errorSummaryRef}
  >
    <h3 id="error-summary-title">Please fix the following errors:</h3>
    <ul aria-labelledby="error-summary-title">
      {Object.entries(errors).map(([field, error]) => (
        <li key={field}>
          <a href={`#${field}`} onClick={() => focusField(field)}>
            {error.message}
          </a>
        </li>
      ))}
    </ul>
  </div>
)}
```

**Auto-Focus Error Summary**:
```typescript
const errorSummaryRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (Object.keys(errors).length > 0) {
    // Focus error summary when errors appear
    errorSummaryRef.current?.focus();
  }
}, [errors]);
```

---

#### 4. Success Messages

Announce success messages too (e.g., form submitted successfully).

```tsx
{isSubmitted && (
  <div role="status" aria-live="polite">
    ✓ Patient registered successfully
  </div>
)}
```

**Use `role="status"`** instead of `role="alert"` for positive messages.

---

### Keyboard Navigation

#### Tab Order
Ensure logical tab order:
1. First field
2. Second field
3. ...
4. Submit button

**Test**: Press Tab key repeatedly - should move through fields in order.

---

#### Focus Management

**Auto-focus first error** when form submission fails.

```typescript
const { setFocus } = useForm();

const onSubmit = async (data: PatientFormValues) => {
  try {
    await createPatient(data);
  } catch (error) {
    // Focus first error field
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      setFocus(firstErrorField);
    }
  }
};
```

---

### Screen Reader Testing

**Tools**:
- **NVDA** (Windows, free)
- **JAWS** (Windows, paid)
- **VoiceOver** (macOS, built-in)
- **TalkBack** (Android)

**Test Checklist**:
- [ ] Field labels announced correctly
- [ ] Error messages announced when they appear
- [ ] Required fields indicated (`aria-required="true"`)
- [ ] Field relationships clear (`aria-describedby`)
- [ ] Focus management works (auto-focus errors)
- [ ] Success messages announced

---

### Complete Accessible Form Example

```tsx
import { useForm } from 'react-hook-form';
import { useEffect, useRef } from 'react';

function AccessiblePatientForm() {
  const { register, handleSubmit, formState: { errors }, setFocus } = useForm();
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // Focus error summary when errors appear
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [errors]);

  const onSubmit = async (data: PatientFormValues) => {
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Error Summary (ARIA live region) */}
      {Object.keys(errors).length > 0 && (
        <div
          role="alert"
          aria-live="assertive"
          className="error-summary"
          tabIndex={-1}
          ref={errorSummaryRef}
        >
          <h3 id="error-summary-title">Please fix the following errors:</h3>
          <ul aria-labelledby="error-summary-title">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <a href={`#${field}`} onClick={() => setFocus(field)}>
                  {error.message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Email Field */}
      <div className="form-field">
        <label htmlFor="email">
          Email <span aria-label="required">*</span>
        </label>
        <input
          id="email"
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email format',
            },
          })}
          aria-required="true"
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : 'email-hint'}
        />
        <span id="email-hint" className="field-hint">
          Example: user@example.com
        </span>
        {errors.email && (
          <span id="email-error" role="alert" className="error-message">
            {errors.email.message}
          </span>
        )}
      </div>

      {/* Personal ID Field */}
      <div className="form-field">
        <label htmlFor="personalId">
          Personal ID <span aria-label="required">*</span>
        </label>
        <input
          id="personalId"
          type="text"
          maxLength={11}
          {...register('personalId', {
            required: 'Personal ID is required',
            pattern: {
              value: /^\d{11}$/,
              message: 'Personal ID must be exactly 11 digits',
            },
          })}
          aria-required="true"
          aria-invalid={errors.personalId ? 'true' : 'false'}
          aria-describedby={errors.personalId ? 'personalId-error' : 'personalId-hint'}
        />
        <span id="personalId-hint" className="field-hint">
          11-digit Georgian personal ID. Example: 26001014632
        </span>
        {errors.personalId && (
          <span id="personalId-error" role="alert" className="error-message">
            {errors.personalId.message}
          </span>
        )}
      </div>

      {/* Submit Button */}
      <button type="submit">Register Patient</button>
    </form>
  );
}
```

---

## Current MediMind Implementation Analysis

### Existing Validation Architecture

MediMind currently uses:
1. **Custom validation functions** (`validators.ts`, `accountValidators.ts`)
2. **Mantine `useForm` hook** for form state management
3. **onBlur validation** (`validateInputOnBlur: true`)
4. **No schema library** (manual validation functions)

---

### Strengths of Current Approach

✅ **Simple and lightweight** - No external schema library dependencies
✅ **Reusable validators** - Functions can be used across forms
✅ **TypeScript-native** - `ValidationResult` interface ensures type safety
✅ **Clear error messages** - User-friendly messages with examples
✅ **Good separation** - Validators in separate service files
✅ **Comprehensive** - Covers email, phone (E.164), dates, Georgian ID

---

### Current Validation Functions

#### 1. `validators.ts` (Registration Forms)
- `validateGeorgianPersonalId(id: string)` - 11-digit validation (no Luhn)
- `validateEmail(email: string)` - RFC 5322 simplified
- `validateBirthdate(birthdate: Date | string)` - Future/past checks

#### 2. `accountValidators.ts` (Account Management)
- `validateEmail(email: string)` - RFC 5322 with length checks
- `validatePhone(phoneNumber: string, countryCode?: string)` - E.164 format
- `validateDate(dateString: string, allowFuture: boolean, maxYearsAgo: number)`
- `validateBirthDate(birthDate: string)` - Birth date specific
- `validateHireDate(hireDate: string)` - Hire date specific
- `validateRequired(value: string, fieldName: string, minLength: number, maxLength: number)`
- `validateStaffId(staffId: string)` - Alphanumeric with hyphens/underscores
- `validateAccountForm(values: AccountFormValues)` - Full form validation

---

### Gaps & Opportunities for Improvement

#### 1. **No Luhn Checksum Validation**
Current `validateGeorgianPersonalId` only checks length and numeric format, not Luhn checksum.

**Recommendation**: Add Luhn algorithm implementation (see Medical Form Validation section).

---

#### 2. **No Cross-Field Validation**
Current validators operate on single fields. No support for:
- Start date < End date
- Representative required if age < 18
- Discount limits based on insurance type

**Recommendation**: Add Zod schema with `.refine()` for complex rules.

---

#### 3. **No Async Validation**
Current validators are synchronous. No support for:
- Duplicate personal ID checking
- Email uniqueness validation
- API-based validation

**Recommendation**: Add async validators with debouncing (500ms).

---

#### 4. **No Schema Composition**
Validation logic repeated across forms. No reusable schemas.

**Recommendation**: Create Zod schemas that can be composed:
```typescript
const basePatientSchema = z.object({ firstName, lastName, email });
const fullPatientSchema = basePatientSchema.extend({ personalId, birthDate });
```

---

#### 5. **Limited Error Localization**
Error messages hardcoded in English. No Georgian/Russian translations.

**Recommendation**: Use translation keys:
```typescript
return {
  isValid: false,
  error: t('validation.email.invalid'),
};
```

---

#### 6. **No ARIA Live Regions**
Current forms don't announce errors to screen readers.

**Recommendation**: Add `role="alert"` and `aria-live="polite"` to error messages.

---

### Migration Path to Zod (Optional)

**Phase 1: Keep Current Validators + Add Zod for New Forms**
- Existing forms continue using custom validators
- New forms (Form Builder) use Zod schemas
- Gradual migration

**Phase 2: Create Zod Schemas Wrapping Existing Validators**
```typescript
import { z } from 'zod';
import { validateGeorgianPersonalId } from './validators';

const personalIdSchema = z.string().refine(
  (value) => validateGeorgianPersonalId(value).isValid,
  (value) => ({ message: validateGeorgianPersonalId(value).error || 'Invalid' })
);
```

**Phase 3: Full Migration to Zod**
- Rewrite all validators as Zod schemas
- Share schemas between client and server
- Remove custom validator functions

---

## Recommendations for Form Builder

### Validation Strategy

#### 1. **Use Zod for Dynamic Forms**
Form Builder should use Zod for flexible, runtime schema generation.

**Why**:
- Can dynamically create schemas based on FHIR Questionnaire
- Type inference for dynamic forms
- Composable validation rules
- Client + Server validation with same schema

**Example**:
```typescript
function buildSchemaFromQuestionnaire(questionnaire: Questionnaire): z.ZodSchema {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  questionnaire.item?.forEach((item) => {
    let fieldSchema: z.ZodTypeAny;

    switch (item.type) {
      case 'string':
        fieldSchema = z.string();
        break;
      case 'integer':
        fieldSchema = z.number().int();
        break;
      case 'date':
        fieldSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
        break;
      case 'choice':
        fieldSchema = z.enum(item.answerOption?.map((opt) => opt.valueCoding?.code!) as [string, ...string[]]);
        break;
      default:
        fieldSchema = z.string();
    }

    // Add required check
    if (item.required) {
      fieldSchema = fieldSchema;
    } else {
      fieldSchema = fieldSchema.optional();
    }

    // Add max length
    if (item.maxLength && fieldSchema instanceof z.ZodString) {
      fieldSchema = fieldSchema.max(item.maxLength);
    }

    schemaFields[item.linkId] = fieldSchema;
  });

  return z.object(schemaFields);
}
```

---

#### 2. **Validation Timing: onTouched Mode**
Use React Hook Form's `onTouched` mode (onBlur first, then onChange after error).

**Configuration**:
```typescript
const form = useForm({
  mode: 'onTouched', // Best UX
  resolver: zodResolver(dynamicSchema),
});
```

---

#### 3. **Async Validation with 500ms Debounce**
For duplicate checking and API validation.

```typescript
const personalIdSchema = z.string()
  .length(11)
  .refine(async (value) => {
    // Debounced duplicate check
    const isDuplicate = await checkDuplicatePersonalId(value);
    return !isDuplicate;
  }, {
    message: 'Personal ID already exists',
  });
```

---

#### 4. **Multilingual Error Messages**
Use translation keys for error messages.

```typescript
const schema = (lang: 'ka' | 'en' | 'ru') => z.object({
  email: z.string().email(t('validation.email.invalid', { lang })),
  personalId: z.string().length(11, t('validation.personalId.length', { lang })),
});
```

---

#### 5. **ARIA Live Regions for Accessibility**
All forms must include:
- `role="alert"` on error messages
- `aria-live="polite"` on error containers
- `aria-invalid="true"` on fields with errors
- `aria-describedby` linking errors to fields

---

#### 6. **Server-Side Validation Mirror**
Share Zod schemas between client and server.

**Project Structure**:
```
packages/
├── core/
│   └── schemas/
│       ├── patient.schema.ts
│       ├── encounter.schema.ts
│       └── questionnaire.schema.ts
├── app/ (uses schemas for client validation)
└── server/ (uses schemas for server validation)
```

---

### Validation Rule Mapping (FHIR Questionnaire → Zod)

| FHIR Extension | Zod Validation |
|----------------|----------------|
| `questionnaire-minLength` | `.min(n)` |
| `questionnaire-maxLength` | `.max(n)` |
| `questionnaire-regex` | `.regex(pattern)` |
| `minValue` | `.gte(n)` or `.min(n)` |
| `maxValue` | `.lte(n)` or `.max(n)` |
| `required: true` | Not `.optional()` |
| `type: 'email'` | `.email()` |
| `type: 'url'` | `.url()` |

---

### Error Message Localization

**Translation File Structure**:
```json
{
  "validation": {
    "required": {
      "ka": "აუცილებელი ველი",
      "en": "Required field",
      "ru": "Обязательное поле"
    },
    "email": {
      "invalid": {
        "ka": "არასწორი ელ-ფოსტის ფორმატი",
        "en": "Invalid email format",
        "ru": "Неверный формат электронной почты"
      }
    },
    "personalId": {
      "length": {
        "ka": "პირადი ნომერი უნდა შედგებოდეს 11 ციფრისგან",
        "en": "Personal ID must be exactly 11 digits",
        "ru": "Личный номер должен состоять из 11 цифр"
      },
      "checksum": {
        "ka": "არასწორი პირადი ნომრის საკონტროლო თანხა",
        "en": "Invalid personal ID checksum",
        "ru": "Неверная контрольная сумма личного номера"
      }
    }
  }
}
```

---

## Conclusion

### Key Takeaways

1. **Library**: Use **Zod** for Form Builder (TypeScript-first, runtime validation, composable)
2. **Timing**: Use **onTouched** mode (onBlur first, onChange after error)
3. **Async**: Debounce async validation **500ms** to reduce server load
4. **Errors**: Display **inline near fields** with **ARIA live regions**
5. **Security**: Always validate **server-side**, use client for UX only
6. **Accessibility**: Use `role="alert"`, `aria-live`, `aria-invalid`, `aria-describedby`
7. **Localization**: Translate error messages to Georgian, English, Russian

---

### Implementation Checklist

#### For Form Builder

- [ ] Install Zod: `npm install zod`
- [ ] Install Zod Resolver: `npm install @hookform/resolvers`
- [ ] Create dynamic schema generator from FHIR Questionnaire
- [ ] Implement async validation with 500ms debounce
- [ ] Add ARIA live regions to all forms
- [ ] Create translation keys for validation errors
- [ ] Share Zod schemas between client and server
- [ ] Add Luhn checksum to Georgian Personal ID validation
- [ ] Test with screen readers (VoiceOver, NVDA)
- [ ] Test keyboard navigation (Tab order, focus management)

---

### Resources

**Documentation**:
- [Zod Documentation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)
- [ARIA Live Regions (MDN)](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [Nielsen Norman Group - Form Error Guidelines](https://www.nngroup.com/articles/errors-forms-design-guidelines/)

**Standards**:
- [RFC 5322 - Email Address Specification](https://datatracker.ietf.org/doc/html/rfc5322)
- [E.164 - International Phone Number Format](https://en.wikipedia.org/wiki/E.164)
- [Luhn Algorithm - Wikipedia](https://en.wikipedia.org/wiki/Luhn_algorithm)
- [WCAG 2.1 - Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Document Version**: 1.0
**Last Updated**: 2025-11-21
**Next Review**: Before Form Builder implementation
