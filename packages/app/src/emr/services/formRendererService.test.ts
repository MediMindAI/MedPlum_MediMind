// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { MockClient } from '@medplum/mock';
import type { MedplumClient } from '@medplum/core';
import type { Questionnaire, QuestionnaireResponse, Patient, Encounter } from '@medplum/fhirtypes';
import {
  populateFormWithPatientData,
  populateQuestionnaire,
  createQuestionnaireResponse,
  extractResponseValues,
  validateFormValues,
  saveQuestionnaireResponse,
  fetchFormData,
  submitForm,
  saveDraft,
} from './formRendererService';
import type { FormTemplate } from '../types/form-builder';

describe('formRendererService', () => {
  let medplum: MedplumClient;

  // Test questionnaire with patient binding fields
  const mockQuestionnaire: Questionnaire = {
    resourceType: 'Questionnaire',
    id: 'questionnaire-123',
    status: 'active',
    title: 'Patient Intake Form',
    item: [
      {
        linkId: 'patient-name',
        text: 'Patient Name',
        type: 'string',
        required: true,
        extension: [
          {
            url: 'http://medimind.ge/patient-binding',
            valueString: 'fullName',
          },
        ],
      },
      {
        linkId: 'patient-dob',
        text: 'Date of Birth',
        type: 'date',
        required: true,
        extension: [
          {
            url: 'http://medimind.ge/patient-binding',
            valueString: 'dob',
          },
        ],
      },
      {
        linkId: 'patient-age',
        text: 'Age',
        type: 'integer',
        extension: [
          {
            url: 'http://medimind.ge/patient-binding',
            valueString: 'age',
          },
        ],
      },
      {
        linkId: 'chief-complaint',
        text: 'Chief Complaint',
        type: 'text',
        required: true,
      },
      {
        linkId: 'consent',
        text: 'I consent to treatment',
        type: 'boolean',
        required: true,
      },
    ],
  };

  // Test patient
  const mockPatient: Patient = {
    resourceType: 'Patient',
    id: 'patient-456',
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
    ],
  };

  // Test encounter
  const mockEncounter: Encounter = {
    resourceType: 'Encounter',
    id: 'encounter-789',
    status: 'in-progress',
    class: {
      code: 'AMB',
    },
    period: {
      start: '2025-11-22T10:30:00Z',
    },
    identifier: [
      {
        system: 'http://medimind.ge/identifiers/registration-number',
        value: '10357-2025',
      },
    ],
  };

  beforeEach(() => {
    medplum = new MockClient() as unknown as MedplumClient;
  });

  describe('populateFormWithPatientData', () => {
    it('should populate form fields with patient data', () => {
      const formTemplate: FormTemplate = {
        title: 'Test Form',
        status: 'active',
        fields: [
          {
            id: 'field-1',
            linkId: 'patient-name',
            type: 'text',
            label: 'Patient Name',
            patientBinding: {
              enabled: true,
              bindingKey: 'fullName',
            },
          },
          {
            id: 'field-2',
            linkId: 'patient-dob',
            type: 'date',
            label: 'Date of Birth',
            patientBinding: {
              enabled: true,
              bindingKey: 'dob',
            },
          },
          {
            id: 'field-3',
            linkId: 'patient-age',
            type: 'integer',
            label: 'Age',
            patientBinding: {
              enabled: true,
              bindingKey: 'age',
            },
          },
        ],
      };

      const result = populateFormWithPatientData(formTemplate, { patient: mockPatient });

      expect(result['patient-name']).toBe('თენგიზი გიორგის ძე ხოზვრია');
      expect(result['patient-dob']).toBe('1990-05-15');
      expect(result['patient-age']).toBeDefined();
      expect(typeof result['patient-age']).toBe('number');
    });

    it('should not populate fields without binding', () => {
      const formTemplate: FormTemplate = {
        title: 'Test Form',
        status: 'active',
        fields: [
          {
            id: 'field-1',
            linkId: 'chief-complaint',
            type: 'textarea',
            label: 'Chief Complaint',
          },
        ],
      };

      const result = populateFormWithPatientData(formTemplate, { patient: mockPatient });

      expect(result['chief-complaint']).toBeUndefined();
    });

    it('should not populate disabled bindings', () => {
      const formTemplate: FormTemplate = {
        title: 'Test Form',
        status: 'active',
        fields: [
          {
            id: 'field-1',
            linkId: 'patient-name',
            type: 'text',
            label: 'Patient Name',
            patientBinding: {
              enabled: false,
              bindingKey: 'fullName',
            },
          },
        ],
      };

      const result = populateFormWithPatientData(formTemplate, { patient: mockPatient });

      expect(result['patient-name']).toBeUndefined();
    });

    it('should handle missing patient data gracefully', () => {
      const formTemplate: FormTemplate = {
        title: 'Test Form',
        status: 'active',
        fields: [
          {
            id: 'field-1',
            linkId: 'patient-name',
            type: 'text',
            label: 'Patient Name',
            patientBinding: {
              enabled: true,
              bindingKey: 'fullName',
            },
          },
        ],
      };

      const result = populateFormWithPatientData(formTemplate, {});

      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe('populateQuestionnaire', () => {
    it('should populate questionnaire from patient/encounter data', () => {
      const result = populateQuestionnaire(mockQuestionnaire, {
        patient: mockPatient,
        encounter: mockEncounter,
      });

      expect(result['patient-name']).toBe('თენგიზი გიორგის ძე ხოზვრია');
      expect(result['patient-dob']).toBe('1990-05-15');
      expect(result['patient-age']).toBeDefined();
    });
  });

  describe('createQuestionnaireResponse', () => {
    it('should create a basic QuestionnaireResponse', () => {
      const values = {
        'patient-name': 'თენგიზი ხოზვრია',
        'patient-dob': '1990-05-15',
        'chief-complaint': 'Headache',
        consent: true,
      };

      const response = createQuestionnaireResponse(mockQuestionnaire, values, {
        status: 'completed',
        subject: { reference: 'Patient/456' },
      });

      expect(response.resourceType).toBe('QuestionnaireResponse');
      expect(response.questionnaire).toBe('Questionnaire/questionnaire-123');
      expect(response.status).toBe('completed');
      expect(response.subject?.reference).toBe('Patient/456');
      expect(response.authored).toBeDefined();
      expect(response.item).toHaveLength(5);
    });

    it('should create answers with correct value types', () => {
      const values = {
        'patient-name': 'Test Name',
        'patient-dob': '1990-05-15',
        'patient-age': 35,
        'chief-complaint': 'Test complaint',
        consent: true,
      };

      const response = createQuestionnaireResponse(mockQuestionnaire, values);

      // Check string answer
      const nameItem = response.item?.find((i) => i.linkId === 'patient-name');
      expect(nameItem?.answer?.[0]?.valueString).toBe('Test Name');

      // Check date answer
      const dobItem = response.item?.find((i) => i.linkId === 'patient-dob');
      expect(dobItem?.answer?.[0]?.valueDate).toBe('1990-05-15');

      // Check integer answer
      const ageItem = response.item?.find((i) => i.linkId === 'patient-age');
      expect(ageItem?.answer?.[0]?.valueInteger).toBe(35);

      // Check boolean answer
      const consentItem = response.item?.find((i) => i.linkId === 'consent');
      expect(consentItem?.answer?.[0]?.valueBoolean).toBe(true);
    });

    it('should handle empty values', () => {
      const values = {
        'patient-name': 'Test Name',
        // Other fields not provided
      };

      const response = createQuestionnaireResponse(mockQuestionnaire, values);

      // Name should have answer
      const nameItem = response.item?.find((i) => i.linkId === 'patient-name');
      expect(nameItem?.answer).toHaveLength(1);

      // Empty fields should not have answers
      const dobItem = response.item?.find((i) => i.linkId === 'patient-dob');
      expect(dobItem?.answer).toBeUndefined();
    });

    it('should default to in-progress status', () => {
      const response = createQuestionnaireResponse(mockQuestionnaire, {});
      expect(response.status).toBe('in-progress');
    });
  });

  describe('extractResponseValues', () => {
    it('should extract values from QuestionnaireResponse', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'patient-name',
            answer: [{ valueString: 'Test Name' }],
          },
          {
            linkId: 'patient-dob',
            answer: [{ valueDate: '1990-05-15' }],
          },
          {
            linkId: 'patient-age',
            answer: [{ valueInteger: 35 }],
          },
          {
            linkId: 'consent',
            answer: [{ valueBoolean: true }],
          },
        ],
      };

      const values = extractResponseValues(response);

      expect(values['patient-name']).toBe('Test Name');
      expect(values['patient-dob']).toBe('1990-05-15');
      expect(values['patient-age']).toBe(35);
      expect(values['consent']).toBe(true);
    });

    it('should handle nested items', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        item: [
          {
            linkId: 'group-1',
            item: [
              {
                linkId: 'nested-field',
                answer: [{ valueString: 'Nested Value' }],
              },
            ],
          },
        ],
      };

      const values = extractResponseValues(response);

      expect(values['nested-field']).toBe('Nested Value');
    });

    it('should handle empty response', () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
      };

      const values = extractResponseValues(response);

      expect(Object.keys(values)).toHaveLength(0);
    });
  });

  describe('validateFormValues', () => {
    it('should pass validation when all required fields are filled', () => {
      const values = {
        'patient-name': 'Test Name',
        'patient-dob': '1990-05-15',
        'chief-complaint': 'Headache',
        consent: true,
      };

      const result = validateFormValues(mockQuestionnaire, values);

      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should fail validation when required fields are missing', () => {
      const values = {
        'patient-name': 'Test Name',
        // Missing: patient-dob, chief-complaint, consent
      };

      const result = validateFormValues(mockQuestionnaire, values);

      expect(result.isValid).toBe(false);
      expect(result.errors['patient-dob']).toContain('This field is required');
      expect(result.errors['chief-complaint']).toContain('This field is required');
      expect(result.errors['consent']).toContain('This field is required');
    });

    it('should fail validation for empty string values on required fields', () => {
      const values = {
        'patient-name': '',
        'patient-dob': '1990-05-15',
        'chief-complaint': 'Headache',
        consent: true,
      };

      const result = validateFormValues(mockQuestionnaire, values);

      expect(result.isValid).toBe(false);
      expect(result.errors['patient-name']).toContain('This field is required');
    });

    it('should handle questionnaire without items', () => {
      const emptyQuestionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
      };

      const result = validateFormValues(emptyQuestionnaire, {});

      expect(result.isValid).toBe(true);
    });
  });

  describe('saveQuestionnaireResponse', () => {
    it('should create new response when no ID', async () => {
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'completed',
        questionnaire: 'Questionnaire/123',
        item: [],
      };

      const savedResponse = await saveQuestionnaireResponse(medplum, response);

      expect(savedResponse.id).toBeDefined();
      expect(savedResponse.resourceType).toBe('QuestionnaireResponse');
    });

    it('should update existing response when ID present', async () => {
      // First create
      const response: QuestionnaireResponse = {
        resourceType: 'QuestionnaireResponse',
        status: 'in-progress',
        questionnaire: 'Questionnaire/123',
        item: [],
      };

      const created = await saveQuestionnaireResponse(medplum, response);
      expect(created.id).toBeDefined();

      // Then update
      const toUpdate: QuestionnaireResponse = {
        ...created,
        status: 'completed',
      };

      const updated = await saveQuestionnaireResponse(medplum, toUpdate);
      expect(updated.id).toBe(created.id);
      expect(updated.status).toBe('completed');
    });
  });

  describe('fetchFormData', () => {
    beforeEach(async () => {
      // Create test resources
      await medplum.createResource(mockQuestionnaire);
      await medplum.createResource(mockPatient);
      await medplum.createResource(mockEncounter);
    });

    it('should fetch questionnaire only', async () => {
      const result = await fetchFormData(medplum, 'questionnaire-123');

      expect(result.questionnaire.id).toBe('questionnaire-123');
      expect(result.patient).toBeUndefined();
      expect(result.encounter).toBeUndefined();
    });

    it('should fetch and populate with patient data', async () => {
      const result = await fetchFormData(medplum, 'questionnaire-123', 'patient-456');

      expect(result.questionnaire.id).toBe('questionnaire-123');
      expect(result.patient?.id).toBe('patient-456');
      expect(result.populatedValues['patient-name']).toBe('თენგიზი გიორგის ძე ხოზვრია');
    });

    it('should handle missing patient gracefully', async () => {
      const result = await fetchFormData(medplum, 'questionnaire-123', 'non-existent-patient');

      expect(result.questionnaire.id).toBe('questionnaire-123');
      expect(result.patient).toBeUndefined();
      // Should still return empty populated values without throwing
      expect(result.populatedValues).toBeDefined();
    });
  });

  describe('submitForm', () => {
    beforeEach(async () => {
      await medplum.createResource(mockQuestionnaire);
    });

    it('should submit form with completed status', async () => {
      const values = {
        'patient-name': 'Test Name',
        'patient-dob': '1990-05-15',
        'chief-complaint': 'Headache',
        consent: true,
      };

      const result = await submitForm(medplum, mockQuestionnaire, values, {
        subject: { reference: 'Patient/456' },
      });

      expect(result.id).toBeDefined();
      expect(result.status).toBe('completed');
      expect(result.subject?.reference).toBe('Patient/456');
    });
  });

  describe('saveDraft', () => {
    beforeEach(async () => {
      await medplum.createResource(mockQuestionnaire);
    });

    it('should save draft with in-progress status', async () => {
      const values = {
        'patient-name': 'Test Name',
        // Partial form data
      };

      const result = await saveDraft(medplum, mockQuestionnaire, values, {
        subject: { reference: 'Patient/456' },
      });

      expect(result.id).toBeDefined();
      expect(result.status).toBe('in-progress');
    });

    it('should update existing draft when responseId provided', async () => {
      // First save
      const firstSave = await saveDraft(medplum, mockQuestionnaire, { 'patient-name': 'First' });
      expect(firstSave.id).toBeDefined();

      // Update with same ID
      const updated = await saveDraft(medplum, mockQuestionnaire, { 'patient-name': 'Updated' }, {
        responseId: firstSave.id,
      });

      expect(updated.id).toBe(firstSave.id);
    });
  });
});
