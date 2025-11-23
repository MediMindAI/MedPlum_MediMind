// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { FormTemplate, FieldConfig } from '../../types/form-builder';

/**
 * Form 200-/b Mamakaci - Male Examination Form (გასინჯვის ფურცელი - მამაკაცი)
 *
 * MODERN PRODUCTION-READY VERSION
 *
 * Design Philosophy:
 * - Clean, intuitive layout with logical grouping
 * - Card-based sections for visual hierarchy
 * - Responsive grid layouts
 * - Accessible and mobile-friendly
 * - Best UX/UI practices
 */

export const FORM_200B_MAMAKACI_ID = 'form-200b-mamakaci-male-examination';
export const FORM_200B_MAMAKACI_VERSION = '2.0.0';

// =====================================================================
// FIELD DEFINITIONS - Modern Production-Ready Layout
// =====================================================================

export const form200bMamakacFields: FieldConfig[] = [
  // ===================================================================
  // SECTION 1: PATIENT INFORMATION (Read-only, Auto-populated)
  // ===================================================================
  {
    id: 'section-patient-info',
    linkId: 'section-patient-info',
    type: 'display',
    label: 'პაციენტის ინფორმაცია',
    styling: {
      sectionType: 'card',
      icon: 'user',
      color: 'blue',
    },
    order: 1,
  },
  {
    id: 'field-patient-name',
    linkId: 'patient-name',
    type: 'text',
    label: 'სახელი და გვარი',
    text: 'Full Name',
    placeholder: 'შეიყვანეთ პაციენტის სახელი და გვარი...',
    required: false,
    readOnly: false, // Auto-populated but editable
    patientBinding: { enabled: true, bindingKey: 'fullName' },
    styling: { gridColumn: '1 / 2' },
    order: 2,
  },
  {
    id: 'field-card-number',
    linkId: 'card-number',
    type: 'text',
    label: 'ბარათის ნომერი',
    text: 'Card Number',
    placeholder: 'შეიყვანეთ ბარათის ნომერი...',
    required: false,
    readOnly: false, // Auto-populated but editable
    patientBinding: { enabled: true, bindingKey: 'registrationNumber' },
    styling: { gridColumn: '2 / 3' },
    order: 3,
  },

  // ===================================================================
  // SECTION 2: CHIEF COMPLAINTS (Prominent, full-width)
  // ===================================================================
  {
    id: 'section-complaints',
    linkId: 'section-complaints',
    type: 'display',
    label: 'ჩივილები',
    styling: {
      sectionType: 'card',
      icon: 'message-circle',
      color: 'orange',
    },
    order: 4,
  },
  {
    id: 'field-complaints',
    linkId: 'complaints',
    type: 'textarea',
    label: 'აღწერეთ პაციენტის ჩივილები',
    text: 'Describe patient complaints',
    placeholder: 'ჩაწერეთ პაციენტის ძირითადი ჩივილები...',
    required: false,
    styling: { width: '100%', minHeight: '100px' },
    order: 5,
  },

  // ===================================================================
  // SECTION 3: MEDICAL HISTORY (Anamnesis)
  // ===================================================================
  {
    id: 'section-medical-history',
    linkId: 'section-medical-history',
    type: 'display',
    label: 'სამედიცინო ისტორია',
    styling: {
      sectionType: 'card',
      icon: 'clipboard-list',
      color: 'teal',
    },
    order: 6,
  },
  {
    id: 'field-disease-history',
    linkId: 'disease-history',
    type: 'textarea',
    label: 'დაავადების ანამნეზი',
    text: 'Disease History',
    placeholder: 'აღწერეთ დაავადების განვითარება და მიმდინარეობა...',
    required: false,
    styling: { width: '100%', minHeight: '80px' },
    order: 7,
  },
  {
    id: 'field-hereditary-diseases',
    linkId: 'hereditary-diseases',
    type: 'choice',
    label: 'მემკვიდრეობითი დაავადებები',
    text: 'Hereditary Diseases',
    required: false,
    hasTextField: true,
    options: [
      { value: '905', label: 'არ აღინიშნება', labelEn: 'None reported' },
      { value: '906', label: 'აღინიშნება', labelEn: 'Present' },
    ],
    styling: { width: '100%' },
    order: 8,
  },
  {
    id: 'field-past-diseases',
    linkId: 'past-diseases',
    type: 'textarea',
    label: 'გადატანილი დაავადებები',
    text: 'Past Diseases',
    placeholder: 'ჩამოთვალეთ ადრე გადატანილი დაავადებები...',
    required: false,
    styling: { gridColumn: '1 / 2', minHeight: '80px' },
    order: 9,
  },
  {
    id: 'field-surgical-interventions',
    linkId: 'surgical-interventions',
    type: 'textarea',
    label: 'ქირურგიული ჩარევები',
    text: 'Surgical Interventions',
    placeholder: 'ჩამოთვალეთ ჩატარებული ოპერაციები...',
    required: false,
    styling: { gridColumn: '2 / 3', minHeight: '80px' },
    order: 10,
  },
  {
    id: 'field-allergies',
    linkId: 'allergies',
    type: 'choice',
    label: 'ალერგიული რეაქციები',
    text: 'Allergies',
    required: false,
    hasTextField: true,
    options: [
      { value: '908', label: 'არ აღინიშნება', labelEn: 'None' },
      { value: '907', label: 'აღინიშნება', labelEn: 'Present' },
    ],
    styling: { width: '100%' },
    order: 11,
  },

  // ===================================================================
  // SECTION 4: SEXUAL HEALTH ASSESSMENT
  // ===================================================================
  {
    id: 'section-sexual-health',
    linkId: 'section-sexual-health',
    type: 'display',
    label: 'სქესობრივი ჯანმრთელობა',
    styling: {
      sectionType: 'accordion',
      icon: 'heart',
      color: 'pink',
      collapsed: true, // Start collapsed for privacy
    },
    order: 12,
  },
  {
    id: 'field-sexual-function',
    linkId: 'sexual-function',
    type: 'text',
    label: 'სქესობრივი ფუნქცია',
    text: 'Sexual Function',
    placeholder: 'აღწერეთ სქესობრივი ფუნქციის მდგომარეობა...',
    required: false,
    styling: { width: '100%' },
    order: 13,
  },
  {
    id: 'field-sexual-life-active',
    linkId: 'sexual-life-active',
    type: 'boolean',
    label: 'სქესობრივი ცხოვრება',
    text: 'Sexually Active',
    required: false,
    order: 14,
  },
  {
    id: 'field-sexual-life-start-year',
    linkId: 'sexual-life-start-year',
    type: 'integer',
    label: 'დაწყების წელი',
    text: 'Start Year',
    placeholder: 'მაგ: 2010',
    required: false,
    styling: { gridColumn: '1 / 2' },
    order: 15,
  },
  {
    id: 'field-sexual-life-frequency',
    linkId: 'sexual-life-frequency',
    type: 'integer',
    label: 'კვირაში (ჯერ)',
    text: 'Times per week',
    placeholder: 'მაგ: 2',
    required: false,
    styling: { gridColumn: '2 / 3' },
    order: 16,
  },
  {
    id: 'field-sexual-life-regular',
    linkId: 'sexual-life-regular',
    type: 'choice',
    label: 'რეგულარობა',
    text: 'Regularity',
    required: false,
    options: [
      { value: 'regular', label: 'რეგულარული', labelEn: 'Regular' },
      { value: 'irregular', label: 'არარეგულარული', labelEn: 'Irregular' },
      { value: 'abstinent', label: 'არ ეწევა', labelEn: 'Abstinent' },
    ],
    styling: { gridColumn: '3 / 4' },
    order: 17,
  },
  {
    id: 'field-marital-status',
    linkId: 'marital-status',
    type: 'choice',
    label: 'ოჯახური მდგომარეობა',
    text: 'Marital Status',
    required: false,
    options: [
      { value: '909', label: 'ქორწინებაში', labelEn: 'Married' },
      { value: '910', label: 'დაუქორწინებელი', labelEn: 'Not married' },
    ],
    styling: { gridColumn: '1 / 2' },
    order: 18,
  },
  {
    id: 'field-libido',
    linkId: 'libido',
    type: 'choice',
    label: 'ლიბიდო',
    text: 'Libido',
    required: false,
    options: [
      { value: '912', label: 'ნორმალური', labelEn: 'Normal' },
      { value: '911', label: 'დაქვეითებული', labelEn: 'Decreased' },
      { value: '913', label: 'მომატებული', labelEn: 'Increased' },
    ],
    styling: { gridColumn: '2 / 3' },
    order: 19,
  },
  {
    id: 'field-orgasm',
    linkId: 'orgasm',
    type: 'text',
    label: 'ორგაზმი',
    text: 'Orgasm',
    placeholder: 'აღწერეთ...',
    required: false,
    styling: { gridColumn: '3 / 4' },
    order: 20,
  },
  {
    id: 'field-reproductive-function',
    linkId: 'reproductive-function',
    type: 'textarea',
    label: 'რეპროდუქციული ფუნქცია',
    text: 'Reproductive Function',
    placeholder: 'აღწერეთ რეპროდუქციული ფუნქციის მდგომარეობა...',
    required: false,
    styling: { width: '100%', minHeight: '60px' },
    order: 21,
  },

  // ===================================================================
  // SECTION 5: PHYSICAL EXAMINATION
  // ===================================================================
  {
    id: 'section-physical-exam',
    linkId: 'section-physical-exam',
    type: 'display',
    label: 'ფიზიკური გასინჯვა',
    styling: {
      sectionType: 'card',
      icon: 'stethoscope',
      color: 'cyan',
    },
    order: 22,
  },

  // Vital Signs Subsection
  {
    id: 'subsection-vital-signs',
    linkId: 'subsection-vital-signs',
    type: 'display',
    label: 'სასიცოცხლო მაჩვენებლები',
    styling: {
      sectionType: 'subsection',
      icon: 'activity',
    },
    order: 23,
  },
  {
    id: 'field-height',
    linkId: 'height',
    type: 'decimal',
    label: 'სიმაღლე (სმ)',
    text: 'Height (cm)',
    placeholder: 'მაგ: 175',
    required: false,
    styling: { gridColumn: '1 / 2' },
    order: 24,
  },
  {
    id: 'field-weight',
    linkId: 'weight',
    type: 'decimal',
    label: 'წონა (კგ)',
    text: 'Weight (kg)',
    placeholder: 'მაგ: 75',
    required: false,
    styling: { gridColumn: '2 / 3' },
    order: 25,
  },
  {
    id: 'field-bmi',
    linkId: 'bmi',
    type: 'decimal',
    label: 'სხეულის მასის ინდექსი',
    text: 'BMI',
    placeholder: 'ავტომატურად',
    required: false,
    readOnly: true,
    calculated: true, // BMI = weight / (height/100)^2
    styling: { gridColumn: '3 / 4' },
    order: 26,
  },
  {
    id: 'field-blood-pressure',
    linkId: 'blood-pressure',
    type: 'text',
    label: 'არტერიული წნევა (მმ.ვწყ.სვ)',
    text: 'Blood Pressure (mmHg)',
    placeholder: 'მაგ: 120/80',
    required: false,
    styling: { gridColumn: '4 / 5' },
    order: 27,
  },
  {
    id: 'field-pulse',
    linkId: 'pulse',
    type: 'integer',
    label: 'პულსი (წთ)',
    text: 'Pulse (bpm)',
    placeholder: 'მაგ: 72',
    required: false,
    styling: { gridColumn: '5 / 6' },
    order: 28,
  },

  // Organ Systems Subsection
  {
    id: 'subsection-organ-systems',
    linkId: 'subsection-organ-systems',
    type: 'display',
    label: 'ორგანოთა სისტემები',
    styling: {
      sectionType: 'accordion',
      icon: 'layers',
      collapsed: false,
    },
    order: 29,
  },
  {
    id: 'field-respiratory',
    linkId: 'respiratory',
    type: 'text',
    label: 'სასუნთქი სისტემა',
    text: 'Respiratory System',
    placeholder: 'აღწერეთ მდგომარეობა...',
    required: false,
    styling: { width: '100%' },
    order: 30,
  },
  {
    id: 'field-cardiovascular',
    linkId: 'cardiovascular',
    type: 'text',
    label: 'გულ-სისხლძარღვთა სისტემა',
    text: 'Cardiovascular System',
    placeholder: 'აღწერეთ მდგომარეობა...',
    required: false,
    styling: { width: '100%' },
    order: 31,
  },
  {
    id: 'field-digestive',
    linkId: 'digestive',
    type: 'text',
    label: 'საჭმლის მომნელებელი სისტემა',
    text: 'Digestive System',
    placeholder: 'აღწერეთ მდგომარეობა...',
    required: false,
    styling: { width: '100%' },
    order: 32,
  },
  {
    id: 'field-urogenital',
    linkId: 'urogenital',
    type: 'text',
    label: 'შარდ-სასქესო სისტემა',
    text: 'Urogenital System',
    placeholder: 'აღწერეთ მდგომარეობა...',
    required: false,
    styling: { width: '100%' },
    order: 33,
  },
  {
    id: 'field-nervous',
    linkId: 'nervous',
    type: 'text',
    label: 'ნერვული სისტემა',
    text: 'Nervous System',
    placeholder: 'აღწერეთ მდგომარეობა...',
    required: false,
    styling: { width: '100%' },
    order: 34,
  },
  {
    id: 'field-endocrine',
    linkId: 'endocrine',
    type: 'text',
    label: 'ენდოკრინული სისტემა',
    text: 'Endocrine System',
    placeholder: 'აღწერეთ მდგომარეობა...',
    required: false,
    styling: { width: '100%' },
    order: 35,
  },
  {
    id: 'field-ent',
    linkId: 'ent',
    type: 'text',
    label: 'ყელ-ყურ-ცხვირი',
    text: 'ENT (Ear-Nose-Throat)',
    placeholder: 'აღწერეთ მდგომარეობა...',
    required: false,
    styling: { width: '100%' },
    order: 36,
  },

  // ===================================================================
  // SECTION 6: SIGNATURE
  // ===================================================================
  {
    id: 'section-signature',
    linkId: 'section-signature',
    type: 'display',
    label: 'ხელმოწერა',
    styling: {
      sectionType: 'card',
      icon: 'edit-3',
      color: 'gray',
    },
    order: 37,
  },
  {
    id: 'field-doctor',
    linkId: 'doctor',
    type: 'text',
    label: 'მკურნალი ექიმი',
    text: 'Treating Physician',
    required: false,
    readOnly: true,
    patientBinding: { enabled: true, bindingKey: 'treatingPhysician' },
    styling: { gridColumn: '1 / 2' },
    order: 38,
  },
  {
    id: 'field-exam-date',
    linkId: 'exam-date',
    type: 'date',
    label: 'გასინჯვის თარიღი',
    text: 'Examination Date',
    required: false,
    styling: { gridColumn: '2 / 3' },
    order: 39,
  },
];

/**
 * Complete Form 200-/b Mamakaci template
 * Male Examination Form (გასინჯვის ფურცელი - მამაკაცი)
 *
 * Modern, production-ready version with:
 * - Card-based sections
 * - Responsive grid layouts
 * - Logical field grouping
 * - Best UX practices
 */
export const form200bMamakacTemplate: FormTemplate = {
  id: FORM_200B_MAMAKACI_ID,
  title: 'გასინჯვის ფურცელი (მამაკაცი)',
  description: 'Male Examination Form - Modern Production-Ready Version',
  status: 'active',
  version: FORM_200B_MAMAKACI_VERSION,
  fields: form200bMamakacFields,
  category: ['medical-examination', 'male-health', 'georgian-healthcare'],
  resourceType: 'Questionnaire',
};

/**
 * Form 200-/b Mamakaci metadata
 */
export const form200bMamakacMetadata = {
  id: FORM_200B_MAMAKACI_ID,
  name: 'Form 200-/b Mamakaci',
  nameKa: 'ფორმა 200-/ბ მამაკაცი',
  title: 'Male Examination Form',
  titleKa: 'გასინჯვის ფურცელი (მამაკაცი)',
  fieldCount: 39,
  isSystemTemplate: true,
  printable: true,
  paperSize: 'A4',
  sections: [
    { id: 'patient-info', name: 'Patient Information', fieldCount: 2 },
    { id: 'complaints', name: 'Chief Complaints', fieldCount: 1 },
    { id: 'medical-history', name: 'Medical History', fieldCount: 5 },
    { id: 'sexual-health', name: 'Sexual Health', fieldCount: 9 },
    { id: 'physical-exam', name: 'Physical Examination', fieldCount: 12 },
    { id: 'signature', name: 'Signature', fieldCount: 2 },
  ],
  dropdowns: {
    hereditaryDiseases: ['905', '906'],
    allergies: ['907', '908'],
    maritalStatus: ['909', '910'],
    libido: ['911', '912', '913'],
    regularity: ['regular', 'irregular', 'abstinent'],
  },
};

export default form200bMamakacTemplate;
