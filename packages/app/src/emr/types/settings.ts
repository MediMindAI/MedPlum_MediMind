// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

// ============================================================================
// OPERATOR TYPES (ოპერატორის ტიპები)
// ============================================================================

/**
 * Operator Type Form Values
 * Maps to FHIR CodeSystem concepts
 */
export interface OperatorTypeFormValues {
  /** Unique operator code (e.g., "1000006") */
  code: string;

  /** Display name in Georgian (e.g., "ოპერატორი") */
  displayKa: string;

  /** Operator type category */
  type: OperatorTypeCategory;

  /** Medical specialty or classifier (e.g., "ოპერატორი", "ასისტენტი 1") */
  specialty?: string;

  /** Can register patients */
  canRegister?: boolean;

  /** Can prescribe medications */
  canPrescribe?: boolean;

  /** Can perform surgery */
  canPerformSurgery?: boolean;

  /** Active status */
  active: boolean;
}

/**
 * Operator Type Categories
 */
export type OperatorTypeCategory =
  | 'medical' // სამედიცინო (Medical staff)
  | 'administrative' // ადმინისტრაციული (Administrative staff)
  | 'support'; // დამხმარე (Support staff)

/**
 * Operator Type Search Filters
 */
export interface OperatorTypeSearchFilters {
  /** Filter by code */
  code?: string;

  /** Filter by display name */
  displayName?: string;

  /** Filter by type */
  type?: OperatorTypeCategory;

  /** Filter by active status */
  active?: boolean;
}

// ============================================================================
// DEPARTMENT TYPES (დეპარტამენტების ტიპები)
// ============================================================================

/**
 * Form values for creating/editing departments
 * Maps to FHIR Organization resource with type=dept
 */
export interface DepartmentFormValues {
  id?: string; // Organization resource ID (optional, only set when editing)
  code: string; // Department code (unique identifier)
  nameKa: string; // Georgian name (required)
  parentId?: string; // Parent department Organization resource ID (optional)
  active: boolean; // Department active status (default: true)
}

/**
 * Department row data for table display
 * Flattened structure for efficient table rendering
 */
export interface DepartmentRow {
  id: string; // Organization resource ID
  code: string; // Department code
  nameKa: string; // Georgian name
  parentName?: string; // Parent department name
  active: boolean; // Active status
  lastModified?: string; // ISO 8601 timestamp
}

/**
 * Search and filter parameters for department list
 */
export interface DepartmentSearchFilters {
  name?: string; // Search in name fields (Georgian, English, Russian)
  code?: string; // Department code search
  active?: boolean; // true=active only, false=inactive only, undefined=all
  parentId?: string; // Filter by parent department ID
}

// ============================================================================
// CASH REGISTER TYPES (სალაროები)
// ============================================================================

/**
 * Cash Register Form Values
 * Maps to FHIR Location resource with type=cash-register
 */
export interface CashRegisterFormValues {
  id?: string; // Location resource ID (optional, only set when editing)
  code: string; // Cash register code (unique identifier, e.g., "1", "GE37TB6600000444467944")
  bankCode?: string; // ქარხნული კოდი - Factory/Bank code (optional, for bank accounts)
  nameKa: string; // Georgian name (required, e.g., "სალარო 1", "ბაზის ბანკი")
  type: CashRegisterType; // Type of cash register
  active: boolean; // Cash register active status (default: true)
}

/**
 * Cash Register Types
 * Maps to different types of cash registers/accounts in the EMR system
 */
export type CashRegisterType =
  | 'cash' // სალარო - Cash register
  | 'bank' // ბანკი - Bank account
  | 'founder' // დამფუძნებელი - Founder's account
  | 'salary' // ხელფასი - Salary account
  | 'expense' // ხარჯი - Expense account
  | 'transfer' // გადარიცხვა - Transfer account
  | 'client'; // კლიენტი - Client account

/**
 * Cash Register Row Data
 * Flattened structure for table display
 */
export interface CashRegisterRow {
  id: string; // Location resource ID
  code: string; // Cash register code
  bankCode?: string; // Factory/Bank code
  nameKa: string; // Georgian name
  type: CashRegisterType; // Type
  active: boolean; // Active status
  lastModified?: string; // ISO 8601 timestamp
}

/**
 * Search and filter parameters for cash register list
 */
export interface CashRegisterSearchFilters {
  name?: string; // Search in name fields (Georgian, English, Russian)
  code?: string; // Cash register code search
  type?: CashRegisterType; // Filter by type
  active?: boolean; // true=active only, false=inactive only, undefined=all
}

// ============================================================================
// MEASUREMENT UNITS (ერთეულები)
// ============================================================================

/**
 * Unit Form Values
 * Maps to FHIR CodeSystem concepts
 */
export interface UnitFormValues {
  /** Unique unit code */
  code: string;

  /** Display name in Georgian (required) */
  displayKa: string;

  /** Unit symbol (e.g., "мл", "k/μl", "g/dl") */
  symbol?: string;

  /** Unit category */
  category?: UnitCategory;

  /** Active status */
  active: boolean;
}

/**
 * Unit Categories
 */
export type UnitCategory =
  | 'count' // რაოდენობა (Count/Quantity: ცალი, ამპულა, კომპლექტი)
  | 'volume' // მოცულობა (Volume: мл, l)
  | 'mass' // მასა (Mass: მგ, გრ, kg)
  | 'concentration' // კონცენტრაცია (Concentration: g/dl, mg/dl, mmol/l)
  | 'other'; // სხვა (Other)

/**
 * Unit Search Filters
 */
export interface UnitSearchFilters {
  /** Filter by code */
  code?: string;

  /** Filter by display name */
  displayName?: string;

  /** Filter by category */
  category?: UnitCategory;

  /** Filter by active status */
  active?: boolean;
}

// ============================================================================
// ADMINISTRATION ROUTES (მიღების ტიპები)
// ============================================================================

/**
 * Administration Route Form Values
 * Maps to FHIR CodeSystem concepts
 */
export interface AdminRouteFormValues {
  /** Unique route code */
  code: string;

  /** Display name in Georgian (required) */
  displayKa: string;

  /** Route abbreviation (e.g., "p.o.", "i.v.", "s.c.") */
  abbreviation: string;

  /** Description/notes */
  description?: string;

  /** Active status */
  active: boolean;
}

/**
 * Administration Route Search Filters
 */
export interface AdminRouteSearchFilters {
  /** Filter by code */
  code?: string;

  /** Filter by display name */
  displayName?: string;

  /** Filter by abbreviation */
  abbreviation?: string;

  /** Filter by active status */
  active?: boolean;
}

// ============================================================================
// MEDICAL DATA TYPES (სამედიცინო მონაცემები)
// ============================================================================

/**
 * Medical Data Form Values
 * Used for Physical Data, Post-operative Data, and Ambulatory Data
 * Maps to FHIR ObservationDefinition resource
 */
export interface MedicalDataFormValues {
  id?: string; // ObservationDefinition resource ID (optional, only set when editing)
  code: string; // Unique code (e.g., "systolic", "diastolic", "height", "weight")
  nameKa: string; // Georgian name (required, e.g., "სისტოლური", "კოაგულოგრამა", "სიმაღლე")
  unit?: string; // Measurement unit (e.g., "mmHg", "°C", "bpm", "cm", "kg")
  unitCode?: string; // UCUM unit code (optional)
  sortOrder?: number; // Display sort order
  category: 'physical' | 'postop' | 'ambulatory'; // Category: physical, post-operative, or ambulatory data
  active: boolean; // Active status (default: true)
}

/**
 * Medical Data Row Data
 * Flattened structure for table display
 */
export interface MedicalDataRow {
  id: string; // ObservationDefinition resource ID
  code: string; // Unique code
  nameKa: string; // Georgian name
  unit?: string; // Measurement unit
  sortOrder?: number; // Display sort order
  category: 'physical' | 'postop' | 'ambulatory'; // Category
  active: boolean; // Active status
  lastModified?: string; // ISO 8601 timestamp
}

/**
 * Search and filter parameters for medical data list
 */
export interface MedicalDataSearchFilters {
  name?: string; // Search in name fields (Georgian, English, Russian)
  code?: string; // Code search
  category?: 'physical' | 'postop' | 'ambulatory'; // Filter by category
  active?: boolean; // true=active only, false=inactive only, undefined=all
}
