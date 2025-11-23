// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { FormTemplate, FieldConfig } from '../../types/form-builder';

/**
 * Form IV-200-5/a - Patient Examination Form (პაციენტის გასინჯვის ფურცელი)
 * Georgian official medical document form
 *
 * Layout matches original EMR exactly with:
 * - Pre-filled consultation type = "ამბულატორიული"
 * - Resizable text areas
 * - Compact inline checkbox rows
 */

export const FORM_200_5A_ID = 'form-200-5a-patient-examination';
export const FORM_200_5A_VERSION = '1.0.0';

// =====================================================================
// FIELD DEFINITIONS - Matching Original EMR Exactly
// =====================================================================

export const form200_5aFields: FieldConfig[] = [
  // ===================================================================
  // HEADER SECTION (No section header, just fields)
  // ===================================================================
  {
    id: 'field-form-number',
    linkId: 'form-number',
    type: 'display',
    label: 'ფორმა №IV-200-5/ა',
    order: 1,
  },
  // Note: Title "პაციენტის გასინჯვის ფურცელი" is shown in FormFillerView header, not duplicated here
  {
    id: 'field-consultation-type',
    linkId: 'consultation-type',
    type: 'text',
    label: 'კონსულტაციის სახე',
    defaultValue: 'ამბულატორიული',  // PRE-FILLED DEFAULT
    required: false,
    styling: { width: '50%' },
    order: 3,
  },
  {
    id: 'field-medical-card',
    linkId: 'medical-card-number',
    type: 'text',
    label: 'ბარათის სამედიცინო №',
    required: false,
    patientBinding: { enabled: true, bindingKey: 'registrationNumber' },
    styling: { width: '50%' },
    order: 4,
  },
  {
    id: 'field-patient-name',
    linkId: 'patient-name',
    type: 'text',
    label: 'პაციენტი',
    required: false,
    patientBinding: { enabled: true, bindingKey: 'fullName' },
    styling: { width: '50%' },
    order: 5,
  },
  {
    id: 'field-patient-age',
    linkId: 'patient-age',
    type: 'text',
    label: 'ასაკი',
    required: false,
    patientBinding: { enabled: true, bindingKey: 'age' },
    styling: { width: '25%' },
    order: 6,
  },
  // Two large resizable textareas (unnamed in original, for notes)
  {
    id: 'field-notes-1',
    linkId: 'notes-1',
    type: 'textarea',
    label: '',  // No label in original
    required: false,
    styling: { width: '100%', height: '80px', resizable: true },
    order: 7,
  },
  {
    id: 'field-notes-2',
    linkId: 'notes-2',
    type: 'textarea',
    label: '',  // No label in original
    required: false,
    styling: { width: '100%', height: '80px', resizable: true },
    order: 8,
  },

  // ===================================================================
  // SECTION: ობიექტური მონაცემები (Objective Data)
  // ===================================================================
  {
    id: 'section-objective',
    linkId: 'objective-section',
    type: 'display',
    label: 'ობიექტური მონაცემები',
    order: 9,
  },

  // ROW: ზოგადი მდგომარეობა: □მსუბუქი □საშუალო □მძიმე □უმძიმესი
  {
    id: 'field-general-condition',
    linkId: 'general-condition',
    type: 'checkbox-group',
    label: 'ზოგადი მდგომარეობა:',
    options: [
      { value: 'mild', label: 'მსუბუქი' },
      { value: 'moderate', label: 'საშუალო' },
      { value: 'severe', label: 'მძიმე' },
      { value: 'critical', label: 'უმძიმესი' },
    ],
    order: 10,
  },

  // ROW: კანი და ლორწოვანი გარსები: □ფერმკრთალი □სველი □ნამიანი □იქტერიული □სუბიქტერიული □დიფუზური ციანობი □აკრო ციანობი _____
  {
    id: 'field-skin-mucous',
    linkId: 'skin-mucous',
    type: 'checkbox-group',
    label: 'კანი და ლორწოვანი გარსები:',
    options: [
      { value: 'pale', label: 'ფერმკრთალი' },
      { value: 'wet', label: 'სველი' },
      { value: 'moist', label: 'ნამიანი' },
      { value: 'icteric', label: 'იქტერიული' },
      { value: 'subicteric', label: 'სუბიქტერიული' },
      { value: 'diffuse-cyanosis', label: 'დიფუზური ციანობი' },
      { value: 'acrocyanosis', label: 'აკრო ციანობი' },
    ],
    hasTextField: true,  // Indicates there's a text field at the end
    order: 11,
  },

  // ROW: გულის ტონები: □სუფთა □მოყრუებული _____
  {
    id: 'field-heart-sounds',
    linkId: 'heart-sounds',
    type: 'checkbox-group',
    label: 'გულის ტონები:',
    options: [
      { value: 'clear', label: 'სუფთა' },
      { value: 'muffled', label: 'მოყრუებული' },
    ],
    hasTextField: true,
    order: 12,
  },

  // ROW: შეილი: □სისტოლური □დიასტოლური □სისტოლურ-დიასტოლური _____
  {
    id: 'field-murmur',
    linkId: 'murmur',
    type: 'checkbox-group',
    label: 'შეილი:',
    options: [
      { value: 'systolic', label: 'სისტოლური' },
      { value: 'diastolic', label: 'დიასტოლური' },
      { value: 'systolic-diastolic', label: 'სისტოლურ-დიასტოლური' },
    ],
    hasTextField: true,
    order: 13,
  },

  // ROW: დამატებითი ხმიანობები: □მოისმინება □არ მოისმინება _____
  {
    id: 'field-additional-sounds',
    linkId: 'additional-sounds',
    type: 'checkbox-group',
    label: 'დამატებითი ხმიანობები:',
    options: [
      { value: 'present', label: 'მოისმინება' },
      { value: 'absent', label: 'არ მოისმინება' },
    ],
    hasTextField: true,
    order: 14,
  },

  // ROW: ფილტვები სუნთქვა: □ვეზიკულური □მკვრივი □ბრონქული _____
  {
    id: 'field-lung-breathing',
    linkId: 'lung-breathing',
    type: 'checkbox-group',
    label: 'ფილტვები სუნთქვა:',
    options: [
      { value: 'vesicular', label: 'ვეზიკულური' },
      { value: 'harsh', label: 'მკვრივი' },
      { value: 'bronchial', label: 'ბრონქული' },
    ],
    hasTextField: true,
    order: 15,
  },

  // ROW: ხიხინი: □კრეპიტაცია □სველი □მშრალი □პლევრის ხახუნი _____
  {
    id: 'field-rales',
    linkId: 'rales',
    type: 'checkbox-group',
    label: 'ხიხინი:',
    options: [
      { value: 'crepitation', label: 'კრეპიტაცია' },
      { value: 'moist', label: 'სველი' },
      { value: 'dry', label: 'მშრალი' },
      { value: 'pleural-friction', label: 'პლევრის ხახუნი' },
    ],
    hasTextField: true,
    order: 16,
  },

  // ROW: პასტერნაკის სინდრომი: □დადებითი □უარყოფითი □მარჯვნივ □მარცხნივ □ორივე მხარეს _____
  {
    id: 'field-pasternak',
    linkId: 'pasternak-syndrome',
    type: 'checkbox-group',
    label: 'პასტერნაკის სინდრომი:',
    options: [
      { value: 'positive', label: 'დადებითი' },
      { value: 'negative', label: 'უარყოფითი' },
      { value: 'right', label: 'მარჯვნივ' },
      { value: 'left', label: 'მარცხნივ' },
      { value: 'bilateral', label: 'ორივე მხარეს' },
    ],
    hasTextField: true,
    order: 17,
  },

  // ROW: პულსაცია პერიფერიულ სისხლძარღვებზე: □სუსტი □არ ისინჯება □ისინჯება _____
  {
    id: 'field-peripheral-pulse',
    linkId: 'peripheral-pulse',
    type: 'checkbox-group',
    label: 'პულსაცია პერიფერიულ სისხლძარღვებზე:',
    options: [
      { value: 'weak', label: 'სუსტი' },
      { value: 'absent', label: 'არ ისინჯება' },
      { value: 'present', label: 'ისინჯება' },
    ],
    hasTextField: true,
    order: 18,
  },

  // ROW: მუცელი: □რბილი □მტკივნეული _____
  {
    id: 'field-abdomen',
    linkId: 'abdomen',
    type: 'checkbox-group',
    label: 'მუცელი:',
    options: [
      { value: 'soft', label: 'რბილი' },
      { value: 'painful', label: 'მტკივნეული' },
    ],
    hasTextField: true,
    order: 19,
  },

  // ROW: ღვიძლი: □ისინჯება □არ ისინჯება _____
  {
    id: 'field-liver',
    linkId: 'liver',
    type: 'checkbox-group',
    label: 'ღვიძლი:',
    options: [
      { value: 'palpable', label: 'ისინჯება' },
      { value: 'not-palpable', label: 'არ ისინჯება' },
    ],
    hasTextField: true,
    order: 20,
  },

  // ROW: ელენთა: □ისინჯება □არ ისინჯებოდა _____
  {
    id: 'field-spleen',
    linkId: 'spleen',
    type: 'checkbox-group',
    label: 'ელენთა:',
    options: [
      { value: 'palpable', label: 'ისინჯება' },
      { value: 'not-palpable', label: 'არ ისინჯებოდა' },
    ],
    hasTextField: true,
    order: 21,
  },

  // ROW: ძვალ-სახსროვანი სისტმა: □ნორმა □პათოლოგია _____
  {
    id: 'field-musculoskeletal',
    linkId: 'musculoskeletal',
    type: 'checkbox-group',
    label: 'ძვალ-სახსროვანი სისტმა:',
    options: [
      { value: 'normal', label: 'ნორმა' },
      { value: 'pathology', label: 'პათოლოგია' },
    ],
    hasTextField: true,
    order: 22,
  },

  // ===================================================================
  // BOTTOM SECTION: Diagnosis and Prescription
  // ===================================================================

  // Large resizable textarea for diagnosis
  {
    id: 'field-diagnosis',
    linkId: 'diagnosis',
    type: 'textarea',
    label: 'დიაგნოზი',
    required: false,
    styling: { width: '100%', height: '100px', resizable: true },
    order: 23,
  },

  // Physical data underline field
  {
    id: 'field-physical-data',
    linkId: 'physical-data',
    type: 'text',
    label: 'ფიზიკალური მონაცემები',
    required: false,
    styling: { width: '100%' },
    order: 24,
  },

  // Prescription underline field
  {
    id: 'field-prescription',
    linkId: 'prescription',
    type: 'text',
    label: 'დანიშნულება',
    required: false,
    styling: { width: '100%' },
    order: 25,
  },
];

/**
 * Complete Form 200-5/a template
 * Note: No description displayed in form - matches original EMR
 */
export const form200_5aTemplate: FormTemplate = {
  id: FORM_200_5A_ID,
  title: 'პაციენტის გასინჯვის ფურცელი',
  description: '', // Empty - not shown in form
  status: 'active',
  version: FORM_200_5A_VERSION,
  fields: form200_5aFields,
  category: ['medical-examination', 'georgian-healthcare'],
  resourceType: 'Questionnaire',
};

/**
 * Form 200-5/a metadata
 */
export const form200_5aMetadata = {
  id: FORM_200_5A_ID,
  name: 'Form 200-5/a (IV-200-5/a)',
  nameKa: 'ფორმა № IV-200-5/ა',
  title: 'Patient Examination Form',
  titleKa: 'პაციენტის გასინჯვის ფურცელი',
  fieldCount: 25,
  isSystemTemplate: true,
  printable: true,
  paperSize: 'A4',
};

export default form200_5aTemplate;
