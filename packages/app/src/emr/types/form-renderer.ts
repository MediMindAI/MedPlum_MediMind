// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { QuestionnaireResponse, QuestionnaireResponseItem, Reference, Attachment } from '@medplum/fhirtypes';
import type { FieldConfig } from './form-builder';

/**
 * Form response data that maps to FHIR QuestionnaireResponse resource
 */
export interface FormResponse {
  id?: string;
  questionnaireId: string;
  status: QuestionnaireResponseStatus;
  authored?: string;
  author?: Reference;
  subject?: Reference; // Patient reference
  encounter?: Reference; // Encounter reference
  answers: FieldAnswer[];
  completionTime?: number; // Time to complete in seconds
  signatures?: SignatureData[];
  resourceType?: 'QuestionnaireResponse';
}

/**
 * QuestionnaireResponse status values
 */
export type QuestionnaireResponseStatus =
  | 'in-progress'  // Form is being filled out
  | 'completed'    // Form has been completed
  | 'amended'      // Form has been amended after completion
  | 'entered-in-error' // Form was entered in error
  | 'stopped';     // Form filling was stopped

/**
 * Individual field answer that maps to QuestionnaireResponseItem
 */
export interface FieldAnswer {
  linkId: string;
  text?: string;
  answer?: Answer[];
}

/**
 * Answer value types
 */
export interface Answer {
  valueBoolean?: boolean;
  valueDecimal?: number;
  valueInteger?: number;
  valueDate?: string;
  valueDateTime?: string;
  valueTime?: string;
  valueString?: string;
  valueCoding?: {
    system?: string;
    code?: string;
    display?: string;
  };
  valueAttachment?: Attachment;
  valueReference?: Reference;
  item?: FieldAnswer[]; // Nested answers for groups
}

/**
 * Digital signature data
 */
export interface SignatureData {
  id?: string;
  fieldId: string;
  fieldLabel: string;
  signatureType: SignatureType;
  signatureData: string; // Base64 encoded PNG or typed text
  timestamp: string;
  signedBy: Reference; // Practitioner or Patient reference
  intent: SignatureIntent;
  hash?: string; // SHA-256 hash of signature data
  binaryResourceId?: string; // Reference to FHIR Binary resource
}

/**
 * Signature capture types
 */
export type SignatureType =
  | 'drawn'   // Hand-drawn signature (touch/mouse)
  | 'typed'   // Typed name
  | 'uploaded'; // Uploaded image

/**
 * Signature intent (why was it signed)
 */
export type SignatureIntent =
  | 'consent'     // Patient consent signature
  | 'witness'     // Witness signature
  | 'practitioner' // Healthcare practitioner signature
  | 'verification'; // Verification signature

/**
 * Draft data for auto-save functionality
 */
export interface DraftData {
  id: string;
  questionnaireId: string;
  patientId?: string;
  encounterId?: string;
  answers: Record<string, any>; // Field linkId -> value mapping
  lastSaved: string;
  expiresAt: string;
  metadata?: DraftMetadata;
}

/**
 * Draft metadata
 */
export interface DraftMetadata {
  completionPercentage?: number;
  lastFieldEdited?: string;
  device?: string;
  userAgent?: string;
  syncStatus?: 'pending' | 'synced' | 'error';
  syncError?: string;
}

/**
 * Form validation state
 */
export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string[]>; // Field linkId -> error messages
  touched: Record<string, boolean>; // Field linkId -> touched status
  isDirty: boolean;
}

/**
 * Form renderer configuration
 */
export interface FormRendererConfig {
  mode: 'fill' | 'view' | 'print';
  enableAutoSave?: boolean;
  autoSaveInterval?: number; // Milliseconds
  enableConditionalLogic?: boolean;
  enablePatientBinding?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showProgressBar?: boolean;
  allowNavigation?: boolean; // Allow navigating away with unsaved changes
}

/**
 * Form submission result
 */
export interface FormSubmissionResult {
  success: boolean;
  responseId?: string;
  errors?: FormSubmissionError[];
  warnings?: string[];
}

/**
 * Form submission error
 */
export interface FormSubmissionError {
  fieldId: string;
  fieldLabel: string;
  message: string;
  code: string;
}

/**
 * Auto-save state
 */
export interface AutoSaveState {
  isEnabled: boolean;
  isSaving: boolean;
  lastSaved?: Date;
  hasUnsavedChanges: boolean;
  error?: string;
}

/**
 * Signature capture modal state
 */
export interface SignatureCaptureState {
  isOpen: boolean;
  fieldId: string;
  fieldLabel: string;
  signatureType: SignatureType;
  signatureData?: string;
  isValid: boolean;
  intentConfirmed: boolean; // E-SIGN Act compliance
}

/**
 * Form navigation state
 */
export interface FormNavigationState {
  currentPage: number;
  totalPages: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  visitedPages: Set<number>;
}
