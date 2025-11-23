// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import type { FormTemplate, FieldConfig } from '../../types/form-builder';

/**
 * Form 100 (IV-100/a) - Health Status Certificate
 * Georgian official medical document form
 *
 * Legal Reference: Approved by Georgian Ministry of Labor, Health and Social Affairs
 * Order #230/n dated 15.10.2008
 */

export const FORM_100_ID = 'form-100-health-certificate';
export const FORM_100_VERSION = '1.0.0';

/**
 * Form 100 field definitions
 */
export const form100Fields: FieldConfig[] = [
  // Field 1: Institution Information
  {
    id: 'field-1',
    linkId: 'institution-info',
    type: 'textarea',
    label: 'ცნობის გამცემი დაწესებულების დასახელება ან/და ექიმი სპეციალისტის გვარი, სახელი, სახელმწიფო სერტიფიკატით მინიჭებული სპეციალობა. სახელმწიფო სერთიფიკატის ნომერი ან/და საკონტაქტო ინფორმაცია',
    text: '1. Institution name and/or doctor specialist surname, name, specialty assigned by state certificate. State certificate number and/or contact information',
    required: true,
    patientBinding: {
      enabled: true,
      bindingKey: 'treatingPhysician',
    },
    styling: {
      width: '100%',
    },
    order: 1,
  },

  // Field 2: Destination Institution (textarea with pre-filled text)
  {
    id: 'field-2',
    linkId: 'destination-institution',
    type: 'textarea',
    label: '2. დაწესებულების დასახელება, მისამართი სადაც იგზავნება ცნობა',
    text: '2. Institution name, address where certificate is sent',
    required: false,
    styling: {
      width: '100%',
      height: '60px',
    },
    extensions: [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-initialExpression',
        valueString: 'დანიშნულებისამებრ წარსადგენად',
      },
    ],
    order: 2,
  },

  // Field 3: Patient Name
  {
    id: 'field-3',
    linkId: 'patient-name',
    type: 'text',
    label: '3. პაციენტის სახელი და გვარი',
    text: '3. Patient first name and surname',
    required: true,
    patientBinding: {
      enabled: true,
      bindingKey: 'fullName',
      isCalculated: true,
      calculationType: 'fullName',
    },
    validation: {
      required: true,
      minLength: 2,
      maxLength: 200,
    },
    styling: {
      width: '100%',
    },
    order: 3,
  },

  // Field 4: Date of Birth
  {
    id: 'field-4',
    linkId: 'birth-date',
    type: 'date',
    label: '4. დაბადების თარიღი (რიცხვი/თვე/წელი)',
    text: '4. Date of birth (day/month/year)',
    required: true,
    patientBinding: {
      enabled: true,
      bindingKey: 'dob',
    },
    styling: {
      width: '100%',
    },
    order: 4,
  },

  // Field 5: Personal ID
  {
    id: 'field-5',
    linkId: 'personal-id',
    type: 'text',
    label: '5. პირადი ნომერი',
    text: '5. Personal ID number (filled for persons 16 years and older)',
    required: false, // Conditional - required for 16+
    patientBinding: {
      enabled: true,
      bindingKey: 'personalId',
    },
    validation: {
      pattern: '^[0-9]{11}$',
      patternMessage: 'Personal ID must be exactly 11 digits',
    },
    styling: {
      width: '100%',
    },
    extensions: [
      {
        url: 'http://medimind.ge/fhir/extensions/field-note',
        valueString: '(ივსება 16 წელს მიღწეული პირის შემთხვევაში)',
      },
    ],
    order: 5,
  },

  // Field 6: Address
  {
    id: 'field-6',
    linkId: 'address',
    type: 'text',
    label: '6. მისამართი',
    text: '6. Address',
    required: true,
    patientBinding: {
      enabled: true,
      bindingKey: 'address',
    },
    styling: {
      width: '100%',
    },
    order: 6,
  },

  // Field 7: Workplace/School
  {
    id: 'field-7',
    linkId: 'workplace-school',
    type: 'textarea',
    label: '7. სამუშაო ადგილი და თანამდებობა (მოსწავლის/სტუდენტის შემთხვევაში - იმ სასწავლო დაწესებულების/სკოლის დასახელება და კლასი/კურსი. სადაც იგი სწავლობს)',
    text: '7. Workplace and position (for student - name of educational institution/school and class/course where they study)',
    required: false,
    patientBinding: {
      enabled: true,
      bindingKey: 'workplace',
    },
    styling: {
      width: '100%',
      height: '80px',
    },
    order: 7,
  },

  // Field 8: Dates Header
  {
    id: 'field-8',
    linkId: 'dates-header',
    type: 'display',
    label: '8. თარიღები:',
    text: '8. Dates',
    order: 8,
  },
  {
    id: 'field-8a',
    linkId: 'date-doctor-visit',
    type: 'date',
    label: 'ა) ექიმთან მიმართვის',
    text: 'a) Visit to doctor',
    required: true,
    patientBinding: {
      enabled: true,
      bindingKey: 'admissionDate',
    },
    styling: {
      width: '25%',
    },
    order: 9,
  },
  {
    id: 'field-8b',
    linkId: 'date-hospital-referral',
    type: 'date',
    label: 'ბ) სტაციონარში გაგზავნის',
    text: 'b) Sent to hospital',
    required: false,
    styling: {
      width: '25%',
    },
    order: 10,
  },
  {
    id: 'field-8c',
    linkId: 'date-hospital-admission',
    type: 'date',
    label: 'გ) სტაციონარში მოთავსების',
    text: 'c) Placed in hospital',
    required: false,
    styling: {
      width: '25%',
    },
    order: 11,
  },
  {
    id: 'field-8d',
    linkId: 'date-discharge',
    type: 'date',
    label: 'დ) განერის',
    text: 'd) Discharge',
    required: false,
    patientBinding: {
      enabled: true,
      bindingKey: 'dischargeDate',
    },
    styling: {
      width: '25%',
    },
    order: 12,
  },

  // Field 9: Diagnosis/Conclusion
  {
    id: 'field-9',
    linkId: 'diagnosis',
    type: 'textarea',
    label: '9. დასკვნა ჯანმრთელობის მდგომარეობის შესახებ ან სრული დიაგნოზი (ძირითადი დაავადება, თანმხლები დაავადებები, გართულებები)',
    text: '9. Conclusion about health status or full diagnosis (main disease, accompanying diseases, complications)',
    required: true,
    styling: {
      width: '100%',
      height: '100px',
    },
    order: 13,
  },

  // Field 10: Past Diseases
  {
    id: 'field-10',
    linkId: 'past-diseases',
    type: 'textarea',
    label: '10. გადატანილი დაავადებები',
    text: '10. Past diseases',
    required: false,
    styling: {
      width: '100%',
      height: '80px',
    },
    order: 14,
  },

  // Field 11: Brief Anamnesis
  {
    id: 'field-11',
    linkId: 'brief-anamnesis',
    type: 'textarea',
    label: '11. მოკლე ანამნეზი',
    text: '11. Brief anamnesis',
    required: false,
    styling: {
      width: '100%',
      height: '80px',
    },
    order: 15,
  },

  // Field 12: Diagnostic Examinations
  {
    id: 'field-12',
    linkId: 'diagnostic-examinations',
    type: 'text',
    label: '12. ჩატარებული დიაგნოსტიკური გამოკვლევები და კონსულტაციები',
    text: '12. Conducted diagnostic examinations and consultations',
    required: false,
    styling: {
      width: '100%',
    },
    order: 16,
  },

  // Field 13: Course of Illness
  {
    id: 'field-13',
    linkId: 'illness-course',
    type: 'textarea',
    label: '13. ავადმყოფობის მიმდინარეობა',
    text: '13. Course of illness',
    required: false,
    styling: {
      width: '100%',
      height: '80px',
    },
    order: 17,
  },

  // Field 14: Treatment Provided
  {
    id: 'field-14',
    linkId: 'treatment-provided',
    type: 'textarea',
    label: '14. ჩატარებული მკურნალობა',
    text: '14. Treatment provided',
    required: false,
    styling: {
      width: '100%',
      height: '80px',
    },
    order: 18,
  },

  // Field 15: Condition at Admission
  {
    id: 'field-15',
    linkId: 'condition-admission',
    type: 'textarea',
    label: '15. მდგომარეობა სტაციონარში მოთავსებისას',
    text: '15. Condition at hospital admission',
    required: false,
    styling: {
      width: '100%',
      height: '80px',
    },
    order: 19,
  },

  // Field 16: Condition at Discharge
  {
    id: 'field-16',
    linkId: 'condition-discharge',
    type: 'textarea',
    label: '16. მდგომარეობა სტაციონარიდან განერისას',
    text: '16. Condition at hospital discharge',
    required: false,
    styling: {
      width: '100%',
      height: '80px',
    },
    order: 20,
  },

  // Field 17: Recommendations
  {
    id: 'field-17',
    linkId: 'recommendations',
    type: 'text',
    label: '17. სამკურნალო და შრომითი რეკომენდაციები',
    text: '17. Treatment and work recommendations',
    required: false,
    styling: {
      width: '100%',
    },
    order: 21,
  },

  // Field 18: Attending Physician
  {
    id: 'field-18',
    linkId: 'attending-physician',
    type: 'text',
    label: '18. მკურნალი ექიმი (ექიმი სპეციალისტი)',
    text: '18. Attending physician (specialist doctor)',
    required: true,
    patientBinding: {
      enabled: true,
      bindingKey: 'treatingPhysician',
    },
    styling: {
      width: '100%',
    },
    order: 22,
  },

  // Field 19: Signature
  {
    id: 'field-19',
    linkId: 'signature',
    type: 'text',
    label: '19. დაწესებულების ხელმძღვანელის/ხელმძღვანელის მოადგილის/მკურნალი ექიმის (ექიმი-სპეციალისტის) ხელმოწერა',
    text: '19. Signature of institution head/deputy head/attending physician (specialist doctor)',
    required: true,
    styling: {
      width: '100%',
    },
    order: 23,
  },

  // Field 20: Issue Date
  {
    id: 'field-20',
    linkId: 'issue-date',
    type: 'date',
    label: '20. ცნობის გაცემის თარიღი',
    text: '20. Certificate issue date',
    required: true,
    styling: {
      width: '100%',
    },
    order: 24,
  },
];

/**
 * Complete Form 100 template
 */
export const form100Template: FormTemplate = {
  id: FORM_100_ID,
  title: 'ცნობა ჯანმრთელობის მდგომარეობის შესახებ (ფორმა № IV-100/ა)',
  description: `სამედიცინო დოკუმენტაცია ფორმა № IV-100/ა - ცნობა ჯანმრთელობის მდგომარეობის შესახებ.
დამტკიცებულია საქართველოს შრომის, ჯანმრთელობისა და სოციალური დაცვის მინისტრის 2008 წ. 15.10 №230/ნ ბრძანებით.

Medical Documentation Form No. IV-100/a - Health Status Certificate.
Approved by Georgian Ministry of Labor, Health and Social Affairs Order #230/n dated 15.10.2008.`,
  status: 'active',
  version: FORM_100_VERSION,
  fields: form100Fields,
  category: ['medical-certificate', 'official-form', 'georgian-healthcare'],
  resourceType: 'Questionnaire',
};

/**
 * Form 100 metadata for display and categorization
 */
export const form100Metadata = {
  id: FORM_100_ID,
  name: 'Form 100 (IV-100/a)',
  nameKa: 'ფორმა № IV-100/ა',
  nameEn: 'Form No. IV-100/a',
  nameRu: 'Форма № IV-100/а',
  title: 'Health Status Certificate',
  titleKa: 'ცნობა ჯანმრთელობის მდგომარეობის შესახებ',
  titleEn: 'Health Status Certificate',
  titleRu: 'Справка о состоянии здоровья',
  legalReference: '2008 წ. 15.10 №230/ნ ბრძანება',
  ministry: 'საქართველოს შრომის, ჯანმრთელობისა და სოციალური დაცვის სამინისტრო',
  fieldCount: 24,
  isSystemTemplate: true,
  printable: true,
  paperSize: 'A4',
};

export default form100Template;
