// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { MockClient } from '@medplum/mock';
import type { Questionnaire, QuestionnaireItem } from '@medplum/fhirtypes';
import { toQuestionnaire, fromQuestionnaire, extractExtensions } from './fhirHelpers';
import type { FormTemplate, FieldConfig } from '../types/form-builder';

describe('FHIR Questionnaire Helpers', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
  });

  describe('toQuestionnaire', () => {
    it('should convert basic form template to FHIR Questionnaire', () => {
      const formData: FormTemplate = {
        title: 'Patient Consent Form',
        description: 'Standard consent form for medical procedures',
        status: 'draft',
        version: '1.0',
        fields: [
          {
            id: 'field1',
            linkId: 'patient-name',
            type: 'text',
            label: 'Patient Name',
            required: true,
          },
        ],
      };

      const questionnaire = toQuestionnaire(formData);

      expect(questionnaire.resourceType).toBe('Questionnaire');
      expect(questionnaire.title).toBe('Patient Consent Form');
      expect(questionnaire.description).toBe('Standard consent form for medical procedures');
      expect(questionnaire.status).toBe('draft');
      expect(questionnaire.version).toBe('1.0');
      expect(questionnaire.item).toHaveLength(1);
      expect(questionnaire.item?.[0].linkId).toBe('patient-name');
      expect(questionnaire.item?.[0].text).toBe('Patient Name');
      expect(questionnaire.item?.[0].type).toBe('string');
      expect(questionnaire.item?.[0].required).toBe(true);
    });

    it('should convert form with categories to Questionnaire with meta tags', () => {
      const formData: FormTemplate = {
        title: 'Consent Form',
        status: 'active',
        fields: [],
        category: ['consent', 'medical'],
      };

      const questionnaire = toQuestionnaire(formData);

      expect(questionnaire.meta?.tag).toHaveLength(2);
      expect(questionnaire.meta?.tag?.[0]).toEqual({
        system: 'http://medimind.ge/form-category',
        code: 'consent',
        display: 'consent',
      });
      expect(questionnaire.meta?.tag?.[1]).toEqual({
        system: 'http://medimind.ge/form-category',
        code: 'medical',
        display: 'medical',
      });
    });

    it('should convert form with created by extension', () => {
      const formData: FormTemplate = {
        title: 'Test Form',
        status: 'draft',
        fields: [],
        createdBy: 'Practitioner/123',
      };

      const questionnaire = toQuestionnaire(formData);

      expect(questionnaire.extension).toHaveLength(1);
      expect(questionnaire.extension?.[0]).toEqual({
        url: 'http://medimind.ge/created-by',
        valueString: 'Practitioner/123',
      });
    });

    it('should convert text field type correctly', () => {
      const formData: FormTemplate = {
        title: 'Test Form',
        status: 'draft',
        fields: [
          { id: 'f1', linkId: 'f1', type: 'text', label: 'Short Text' },
          { id: 'f2', linkId: 'f2', type: 'textarea', label: 'Long Text' },
        ],
      };

      const questionnaire = toQuestionnaire(formData);

      expect(questionnaire.item?.[0].type).toBe('string');
      expect(questionnaire.item?.[1].type).toBe('text');
    });

    it('should convert date/time field types correctly', () => {
      const formData: FormTemplate = {
        title: 'Test Form',
        status: 'draft',
        fields: [
          { id: 'f1', linkId: 'f1', type: 'date', label: 'Date' },
          { id: 'f2', linkId: 'f2', type: 'datetime', label: 'DateTime' },
          { id: 'f3', linkId: 'f3', type: 'time', label: 'Time' },
        ],
      };

      const questionnaire = toQuestionnaire(formData);

      expect(questionnaire.item?.[0].type).toBe('date');
      expect(questionnaire.item?.[1].type).toBe('dateTime');
      expect(questionnaire.item?.[2].type).toBe('time');
    });

    it('should convert numeric field types correctly', () => {
      const formData: FormTemplate = {
        title: 'Test Form',
        status: 'draft',
        fields: [
          { id: 'f1', linkId: 'f1', type: 'integer', label: 'Age' },
          { id: 'f2', linkId: 'f2', type: 'decimal', label: 'Weight' },
        ],
      };

      const questionnaire = toQuestionnaire(formData);

      expect(questionnaire.item?.[0].type).toBe('integer');
      expect(questionnaire.item?.[1].type).toBe('decimal');
    });

    it('should convert choice field with options', () => {
      const formData: FormTemplate = {
        title: 'Test Form',
        status: 'draft',
        fields: [
          {
            id: 'f1',
            linkId: 'gender',
            type: 'choice',
            label: 'Gender',
            options: [
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ],
          },
        ],
      };

      const questionnaire = toQuestionnaire(formData);

      expect(questionnaire.item?.[0].type).toBe('choice');
      expect(questionnaire.item?.[0].answerOption).toHaveLength(2);
      expect(questionnaire.item?.[0].answerOption?.[0].valueCoding).toEqual({
        code: 'male',
        display: 'Male',
      });
    });

    it('should convert field with patient binding extension', () => {
      const formData: FormTemplate = {
        title: 'Test Form',
        status: 'draft',
        fields: [
          {
            id: 'f1',
            linkId: 'patient-name',
            type: 'text',
            label: 'Patient Name',
            patientBinding: {
              enabled: true,
              bindingKey: 'name',
              fhirPath: 'Patient.name',
            },
          },
        ],
      };

      const questionnaire = toQuestionnaire(formData);

      expect(questionnaire.item?.[0].extension).toHaveLength(2);
      expect(questionnaire.item?.[0].extension?.[0]).toEqual({
        url: 'http://medimind.ge/patient-binding',
        valueString: 'name',
      });
      expect(questionnaire.item?.[0].extension?.[1]).toEqual({
        url: 'http://medimind.ge/fhir-path',
        valueString: 'Patient.name',
      });
    });

    it('should convert field with conditional logic', () => {
      const formData: FormTemplate = {
        title: 'Test Form',
        status: 'draft',
        fields: [
          {
            id: 'f1',
            linkId: 'guardian-name',
            type: 'text',
            label: 'Guardian Name',
            conditional: {
              enabled: true,
              conditions: [
                {
                  questionId: 'is-minor',
                  operator: '=',
                  answer: true,
                },
              ],
              operator: 'any',
            },
          },
        ],
      };

      const questionnaire = toQuestionnaire(formData);

      expect(questionnaire.item?.[0].enableWhen).toHaveLength(1);
      expect(questionnaire.item?.[0].enableWhen?.[0]).toEqual({
        question: 'is-minor',
        operator: '=',
        answerBoolean: true,
      });
      expect(questionnaire.item?.[0].enableBehavior).toBe('any');
    });

    it('should convert field with styling extension', () => {
      const formData: FormTemplate = {
        title: 'Test Form',
        status: 'draft',
        fields: [
          {
            id: 'f1',
            linkId: 'title',
            type: 'text',
            label: 'Title',
            styling: {
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1a365d',
            },
          },
        ],
      };

      const questionnaire = toQuestionnaire(formData);

      const stylingExt = questionnaire.item?.[0].extension?.find(
        (ext) => ext.url === 'http://medimind.ge/field-styling'
      );
      expect(stylingExt).toBeDefined();
      expect(JSON.parse(stylingExt!.valueString || '{}')).toEqual({
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#1a365d',
      });
    });

    it('should convert field with validation config extension', () => {
      const formData: FormTemplate = {
        title: 'Test Form',
        status: 'draft',
        fields: [
          {
            id: 'f1',
            linkId: 'age',
            type: 'integer',
            label: 'Age',
            validation: {
              required: true,
              min: 0,
              max: 120,
            },
          },
        ],
      };

      const questionnaire = toQuestionnaire(formData);

      const validationExt = questionnaire.item?.[0].extension?.find(
        (ext) => ext.url === 'http://medimind.ge/validation-config'
      );
      expect(validationExt).toBeDefined();
      expect(JSON.parse(validationExt!.valueString || '{}')).toEqual({
        required: true,
        min: 0,
        max: 120,
      });
    });
  });

  describe('fromQuestionnaire', () => {
    it('should convert basic FHIR Questionnaire to form template', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        id: 'q1',
        status: 'active',
        title: 'Consent Form',
        description: 'Patient consent',
        version: '2.0',
        date: '2025-11-21',
        item: [
          {
            linkId: 'patient-name',
            text: 'Patient Name',
            type: 'string',
            required: true,
          },
        ],
      };

      const formData = fromQuestionnaire(questionnaire);

      expect(formData.id).toBe('q1');
      expect(formData.title).toBe('Consent Form');
      expect(formData.description).toBe('Patient consent');
      expect(formData.status).toBe('active');
      expect(formData.version).toBe('2.0');
      expect(formData.createdDate).toBe('2025-11-21');
      expect(formData.fields).toHaveLength(1);
      expect(formData.fields[0].linkId).toBe('patient-name');
      expect(formData.fields[0].label).toBe('Patient Name');
      expect(formData.fields[0].type).toBe('text');
      expect(formData.fields[0].required).toBe(true);
    });

    it('should extract categories from meta tags', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'Test Form',
        meta: {
          tag: [
            { system: 'http://medimind.ge/form-category', code: 'consent' },
            { system: 'http://medimind.ge/form-category', code: 'medical' },
          ],
        },
      };

      const formData = fromQuestionnaire(questionnaire);

      expect(formData.category).toEqual(['consent', 'medical']);
    });

    it('should extract created by from extension', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'Test Form',
        extension: [
          {
            url: 'http://medimind.ge/created-by',
            valueString: 'Practitioner/456',
          },
        ],
      };

      const formData = fromQuestionnaire(questionnaire);

      expect(formData.createdBy).toBe('Practitioner/456');
    });

    it('should convert choice field with options', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'Test Form',
        item: [
          {
            linkId: 'gender',
            text: 'Gender',
            type: 'choice',
            answerOption: [
              { valueCoding: { code: 'male', display: 'Male' } },
              { valueCoding: { code: 'female', display: 'Female' } },
            ],
          },
        ],
      };

      const formData = fromQuestionnaire(questionnaire);

      expect(formData.fields[0].options).toHaveLength(2);
      expect(formData.fields[0].options?.[0]).toEqual({
        value: 'male',
        label: 'Male',
        coding: { code: 'male', display: 'Male' },
      });
    });

    it('should extract patient binding extension', () => {
      const questionnaire: Questionnaire = {
        resourceType: 'Questionnaire',
        status: 'active',
        title: 'Test Form',
        item: [
          {
            linkId: 'patient-name',
            text: 'Patient Name',
            type: 'string',
            extension: [
              {
                url: 'http://medimind.ge/patient-binding',
                valueString: 'name',
              },
              {
                url: 'http://medimind.ge/fhir-path',
                valueString: 'Patient.name',
              },
            ],
          },
        ],
      };

      const formData = fromQuestionnaire(questionnaire);

      expect(formData.fields[0].patientBinding).toEqual({
        enabled: true,
        bindingKey: 'name',
        fhirPath: 'Patient.name',
      });
    });
  });

  describe('extractExtensions', () => {
    it('should extract patient binding extension', () => {
      const item: QuestionnaireItem = {
        linkId: 'dob',
        text: 'Date of Birth',
        type: 'date',
        extension: [
          {
            url: 'http://medimind.ge/patient-binding',
            valueString: 'dob',
          },
        ],
      };

      const field: FieldConfig = {
        id: 'dob',
        linkId: 'dob',
        type: 'date',
        label: 'Date of Birth',
      };

      extractExtensions(item, field);

      expect(field.patientBinding).toEqual({
        enabled: true,
        bindingKey: 'dob',
      });
    });

    it('should extract styling extension', () => {
      const item: QuestionnaireItem = {
        linkId: 'title',
        text: 'Title',
        type: 'string',
        extension: [
          {
            url: 'http://medimind.ge/field-styling',
            valueString: '{"fontSize":"18px","color":"#000"}',
          },
        ],
      };

      const field: FieldConfig = {
        id: 'title',
        linkId: 'title',
        type: 'text',
        label: 'Title',
      };

      extractExtensions(item, field);

      expect(field.styling).toEqual({
        fontSize: '18px',
        color: '#000',
      });
    });

    it('should handle invalid JSON in extensions gracefully', () => {
      const item: QuestionnaireItem = {
        linkId: 'field',
        text: 'Field',
        type: 'string',
        extension: [
          {
            url: 'http://medimind.ge/field-styling',
            valueString: 'invalid json',
          },
        ],
      };

      const field: FieldConfig = {
        id: 'field',
        linkId: 'field',
        type: 'text',
        label: 'Field',
      };

      extractExtensions(item, field);

      expect(field.styling).toBeUndefined();
    });

    it('should handle missing extensions', () => {
      const item: QuestionnaireItem = {
        linkId: 'field',
        text: 'Field',
        type: 'string',
      };

      const field: FieldConfig = {
        id: 'field',
        linkId: 'field',
        type: 'text',
        label: 'Field',
      };

      extractExtensions(item, field);

      expect(field.patientBinding).toBeUndefined();
      expect(field.styling).toBeUndefined();
      expect(field.validation).toBeUndefined();
    });
  });
});
