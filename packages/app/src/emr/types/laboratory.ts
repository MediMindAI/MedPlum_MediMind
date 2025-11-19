/**
 * Laboratory Nomenclature TypeScript Interfaces
 *
 * Defines types for all 4 laboratory nomenclature sub-systems:
 * 1. Research Components (კვლევის კომპონენტები)
 * 2. Samples (ნიმუშები)
 * 3. Manipulations (მანიპულაციები)
 * 4. Syringes (სინჯარები)
 */

import { ObservationDefinition, SpecimenDefinition, ActivityDefinition, DeviceDefinition } from '@medplum/fhirtypes';

// ============================================================================
// RESEARCH COMPONENTS (კვლევის კომპონენტები)
// ============================================================================

/**
 * Research Component Form Values
 * Maps to FHIR ObservationDefinition resource
 */
export interface ResearchComponentFormValues {
  /** Component code (e.g., "BL.11.2.2") */
  code: string;

  /** GIS integration code (e.g., ";ALTL") */
  gisCode: string;

  /** Parameter name in Georgian with abbreviation (e.g., "ალანინამინოტრანსფერაზა ALT (GPT)") */
  name: string;

  /** Service type */
  type: ServiceType;

  /** Measurement unit (UCUM code) */
  unit: string;

  /** Department/Branch ID (comma-separated for multiple) */
  department?: string;

  /** Resource status */
  status: 'active' | 'retired' | 'draft';
}

/**
 * Service Types for laboratory tests
 */
export type ServiceType =
  | '' // Empty option
  | 'internal' // შიდა (Internal)
  | 'other-clinics' // სხვა კლინიკები (Other Clinics)
  | 'limbach' // ლიმბახი (Limbach)
  | 'consultant' // მრჩეველი (Consultant)
  | 'khomasuridze' // ხომასურიძე (Khomasuridze)
  | 'todua' // თოდუა (Todua)
  | 'hepa'; // ჰეპა (Hepa)

/**
 * Research Component Search Filters
 */
export interface ComponentSearchFilters {
  /** Filter by code */
  code?: string;

  /** Filter by GIS code */
  gisCode?: string;

  /** Search parameter name */
  parameterName?: string;

  /** Search by study name */
  studyName?: string;

  /** Filter by status */
  status?: 'active' | 'deleted';

  /** Filter by service type */
  type?: ServiceType;

  /** Filter by measurement unit */
  unit?: string;
}

/**
 * Measurement Unit Option
 */
export interface MeasurementUnit {
  /** Display value in Georgian */
  value: string;

  /** UCUM code (if applicable) */
  ucumCode?: string;

  /** Unit category */
  category: 'count' | 'time' | 'hematology' | 'ratio' | 'volume' | 'mass' | 'concentration' | 'enzyme' | 'hormone' | 'pressure' | 'length' | 'container' | 'local';
}

// ============================================================================
// SAMPLES (ნიმუშები)
// ============================================================================

/**
 * Sample Form Values
 * Maps to FHIR SpecimenDefinition resource
 */
export interface SampleFormValues {
  /** Sample type name in Georgian */
  name: string;

  /** Resource status */
  status: 'active' | 'retired';

  /** Optional SNOMED CT code for sample type */
  snomedCode?: string;
}

/**
 * Sample Category
 */
export type SampleCategory =
  | 'blood'
  | 'urine'
  | 'fluid'
  | 'stool'
  | 'swab'
  | 'tissue'
  | 'respiratory'
  | 'dermatology'
  | 'ophthalmology'
  | 'other';

// ============================================================================
// MANIPULATIONS (მანიპულაციები)
// ============================================================================

/**
 * Manipulation Form Values
 * Maps to FHIR ActivityDefinition resource
 */
export interface ManipulationFormValues {
  /** Manipulation/procedure name in Georgian */
  name: string;

  /** Resource status */
  status: 'active' | 'retired';

  /** Optional SNOMED CT code for procedure */
  snomedCode?: string;
}

/**
 * Manipulation Category
 */
export type ManipulationCategory =
  | 'blood'
  | 'urine'
  | 'fluid'
  | 'stool'
  | 'respiratory'
  | 'gynecology'
  | 'urology'
  | 'dermatology'
  | 'pathology'
  | 'ophthalmology'
  | 'infectious-disease'
  | 'general';

// ============================================================================
// SYRINGES/CONTAINERS (სინჯარები)
// ============================================================================

/**
 * Syringe/Container Form Values
 * Maps to FHIR DeviceDefinition resource
 */
export interface SyringeFormValues {
  /** Container/tube name */
  name: string;

  /** Color code (hex format, e.g., "#8A2BE2" for purple) */
  color: string;

  /** Volume in milliliters */
  volume?: number;

  /** Resource status */
  status: 'active' | 'retired';
}

/**
 * Standard ISO 6710 Laboratory Tube Colors
 */
export interface TubeColor {
  /** Color name in English */
  name: string;

  /** Hex color code */
  hex: string;

  /** Typical use case */
  use: string;
}

// ============================================================================
// TAB MANAGEMENT
// ============================================================================

/**
 * Laboratory Tab Identifiers
 */
export type LaboratoryTab = 'components' | 'samples' | 'manipulations' | 'syringes';

/**
 * Laboratory Tab State
 */
export interface LaboratoryTabState {
  /** Currently active tab */
  activeTab: LaboratoryTab;

  /** Change active tab */
  setActiveTab: (tab: LaboratoryTab) => void;
}

// ============================================================================
// EXTENDED FHIR TYPES
// ============================================================================

/**
 * ObservationDefinition with custom extensions
 */
export interface ExtendedObservationDefinition extends ObservationDefinition {
  // Add any custom extension types here if needed
}

/**
 * SpecimenDefinition with custom extensions
 */
export interface ExtendedSpecimenDefinition extends SpecimenDefinition {
  // Add any custom extension types here if needed
}

/**
 * ActivityDefinition with custom extensions
 */
export interface ExtendedActivityDefinition extends ActivityDefinition {
  // Add any custom extension types here if needed
}

/**
 * DeviceDefinition with custom extensions
 */
export interface ExtendedDeviceDefinition extends DeviceDefinition {
  // Add any custom extension types here if needed
}

// ============================================================================
// TRANSLATION TYPES
// ============================================================================

/**
 * Measurement Unit Translation
 */
export interface MeasurementUnitTranslation {
  ka: string;
  en: string;
  ru: string;
  ucumCode?: string;
  category: MeasurementUnit['category'];
}

/**
 * Service Type Translation
 */
export interface ServiceTypeTranslation {
  ka: string;
  en: string;
  ru: string;
}

/**
 * Tube Color Translation
 */
export interface TubeColorTranslation {
  name: {
    ka: string;
    en: string;
    ru: string;
  };
  hex: string;
  use: {
    ka: string;
    en: string;
    ru: string;
  };
}
