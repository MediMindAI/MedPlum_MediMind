// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { MockClient } from '@medplum/mock';
import type { Questionnaire } from '@medplum/fhirtypes';
import {
  createQuestionnaire,
  updateQuestionnaire,
  getQuestionnaire,
  listQuestionnaires,
  questionnaireToFormTemplate,
  deleteQuestionnaire,
  hardDeleteQuestionnaire,
  cloneQuestionnaire,
  searchByCategory,
} from './formBuilderService';
import type { FormTemplate } from '../types/form-builder';

describe('formBuilderService', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
  });

  describe('createQuestionnaire', () => {
    it('creates a new questionnaire from form data', async () => {
      const formData: FormTemplate = {
        title: 'Patient Consent Form',
        description: 'Standard consent form for medical procedures',
        status: 'draft',
        fields: [
          {
            id: 'field-1',
            linkId: 'patientName',
            type: 'text',
            label: 'Patient Name',
            required: true,
          },
        ],
      };

      const result = await createQuestionnaire(medplum, formData);

      expect(result.resourceType).toBe('Questionnaire');
      expect(result.title).toBe('Patient Consent Form');
      expect(result.description).toBe('Standard consent form for medical procedures');
      expect(result.status).toBe('draft');
      expect(result.item).toHaveLength(1);
      expect(result.item?.[0].linkId).toBe('patientName');
    });

    it('creates questionnaire with multiple fields', async () => {
      const formData: FormTemplate = {
        title: 'Medical History Form',
        status: 'draft',
        fields: [
          {
            id: 'field-1',
            linkId: 'firstName',
            type: 'text',
            label: 'First Name',
            required: true,
          },
          {
            id: 'field-2',
            linkId: 'lastName',
            type: 'text',
            label: 'Last Name',
            required: true,
          },
          {
            id: 'field-3',
            linkId: 'dob',
            type: 'date',
            label: 'Date of Birth',
            required: true,
          },
        ],
      };

      const result = await createQuestionnaire(medplum, formData);

      expect(result.item).toHaveLength(3);
      expect(result.item?.[0].type).toBe('string'); // text → string
      expect(result.item?.[1].type).toBe('string');
      expect(result.item?.[2].type).toBe('date');
    });

    it('creates questionnaire with categories', async () => {
      const formData: FormTemplate = {
        title: 'Consent Form',
        status: 'draft',
        category: ['consent', 'admission'],
        fields: [],
      };

      const result = await createQuestionnaire(medplum, formData);

      expect(result.meta?.tag).toHaveLength(2);
      expect(result.meta?.tag?.[0].code).toBe('consent');
      expect(result.meta?.tag?.[1].code).toBe('admission');
    });

    it('creates questionnaire with patient binding', async () => {
      const formData: FormTemplate = {
        title: 'Patient Info Form',
        status: 'draft',
        fields: [
          {
            id: 'field-1',
            linkId: 'patientName',
            type: 'text',
            label: 'Patient Name',
            patientBinding: {
              enabled: true,
              bindingKey: 'firstName',
              fhirPath: 'Patient.name.given[0]',
            },
          },
        ],
      };

      const result = await createQuestionnaire(medplum, formData);

      const field = result.item?.[0];
      expect(field?.extension).toBeDefined();
      const bindingExt = field?.extension?.find((ext) => ext.url === 'http://medimind.ge/patient-binding');
      expect(bindingExt?.valueString).toBe('firstName');
    });
  });

  describe('updateQuestionnaire', () => {
    it('updates an existing questionnaire', async () => {
      const formData: FormTemplate = {
        title: 'Initial Title',
        status: 'draft',
        fields: [],
      };

      const created = await createQuestionnaire(medplum, formData);

      const updatedData: FormTemplate = {
        title: 'Updated Title',
        status: 'active',
        fields: [
          {
            id: 'field-1',
            linkId: 'newField',
            type: 'text',
            label: 'New Field',
          },
        ],
      };

      const updated = await updateQuestionnaire(medplum, created.id!, updatedData);

      expect(updated.id).toBe(created.id);
      expect(updated.title).toBe('Updated Title');
      expect(updated.status).toBe('active');
      expect(updated.item).toHaveLength(1);
    });

    it('preserves resource ID during update', async () => {
      const formData: FormTemplate = {
        title: 'Original Form',
        status: 'draft',
        fields: [],
      };

      const created = await createQuestionnaire(medplum, formData);
      const originalId = created.id;

      const updated = await updateQuestionnaire(medplum, originalId!, {
        title: 'Updated Form',
        status: 'active',
        fields: [],
      });

      expect(updated.id).toBe(originalId);
    });
  });

  describe('getQuestionnaire', () => {
    it('fetches questionnaire by ID', async () => {
      const formData: FormTemplate = {
        title: 'Test Form',
        status: 'draft',
        fields: [],
      };

      const created = await createQuestionnaire(medplum, formData);
      const fetched = await getQuestionnaire(medplum, created.id!);

      expect(fetched.id).toBe(created.id);
      expect(fetched.title).toBe('Test Form');
    });

    it('throws error for non-existent ID', async () => {
      await expect(getQuestionnaire(medplum, 'non-existent-id')).rejects.toThrow();
    });
  });

  describe('listQuestionnaires', () => {
    beforeEach(async () => {
      // Create test questionnaires
      await createQuestionnaire(medplum, {
        title: 'Consent Form',
        status: 'active',
        category: ['consent'],
        fields: [],
      });

      await createQuestionnaire(medplum, {
        title: 'Admission Form',
        status: 'draft',
        category: ['admission'],
        fields: [],
      });

      await createQuestionnaire(medplum, {
        title: 'Medical History',
        status: 'retired',
        fields: [],
      });
    });

    it('lists all questionnaires without filters', async () => {
      const results = await listQuestionnaires(medplum);
      expect(results.length).toBeGreaterThanOrEqual(3);
    });

    it('filters by status', async () => {
      const activeQuestionnaires = await listQuestionnaires(medplum, { status: 'active' });
      expect(activeQuestionnaires.some((q) => q.title === 'Consent Form')).toBe(true);
    });

    it('filters by title', async () => {
      const results = await listQuestionnaires(medplum, { title: 'Consent' });
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('filters by category', async () => {
      const consentForms = await listQuestionnaires(medplum, { category: 'consent' });
      expect(consentForms.length).toBeGreaterThanOrEqual(1);
    });

    it('applies pagination', async () => {
      const page1 = await listQuestionnaires(medplum, { count: 2, offset: 0 });
      expect(page1.length).toBeLessThanOrEqual(2);
    });

    it('combines multiple filters', async () => {
      const results = await listQuestionnaires(medplum, {
        status: 'active',
        category: 'consent',
      });
      expect(results.some((q) => q.title === 'Consent Form' && q.status === 'active')).toBe(true);
    });
  });

  describe('questionnaireToFormTemplate', () => {
    it('converts questionnaire to form template', async () => {
      const formData: FormTemplate = {
        title: 'Test Form',
        description: 'Test Description',
        status: 'draft',
        version: '1.0',
        fields: [
          {
            id: 'field-1',
            linkId: 'testField',
            type: 'text',
            label: 'Test Field',
            required: true,
          },
        ],
      };

      const questionnaire = await createQuestionnaire(medplum, formData);
      const converted = questionnaireToFormTemplate(questionnaire);

      expect(converted.title).toBe('Test Form');
      expect(converted.description).toBe('Test Description');
      expect(converted.status).toBe('draft');
      expect(converted.version).toBe('1.0');
      expect(converted.fields).toHaveLength(1);
      expect(converted.fields[0].label).toBe('Test Field');
    });

    it('preserves field configurations', async () => {
      const formData: FormTemplate = {
        title: 'Complex Form',
        status: 'draft',
        fields: [
          {
            id: 'field-1',
            linkId: 'email',
            type: 'text',
            label: 'Email Address',
            required: true,
            readOnly: false,
            validation: {
              required: true,
              pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
              patternMessage: 'Invalid email format',
            },
            styling: {
              fontSize: '14px',
              color: '#333333',
              textAlign: 'left',
            },
          },
        ],
      };

      const questionnaire = await createQuestionnaire(medplum, formData);
      const converted = questionnaireToFormTemplate(questionnaire);

      expect(converted.fields[0].validation?.required).toBe(true);
      expect(converted.fields[0].validation?.pattern).toContain('@');
      expect(converted.fields[0].styling?.fontSize).toBe('14px');
    });
  });

  describe('deleteQuestionnaire', () => {
    it('soft deletes questionnaire by setting status to retired', async () => {
      const formData: FormTemplate = {
        title: 'To Delete',
        status: 'active',
        fields: [],
      };

      const created = await createQuestionnaire(medplum, formData);
      const deleted = await deleteQuestionnaire(medplum, created.id!);

      expect(deleted.status).toBe('retired');
      expect(deleted.id).toBe(created.id);
    });

    it('preserves questionnaire data after soft delete', async () => {
      const formData: FormTemplate = {
        title: 'To Delete',
        status: 'active',
        fields: [
          {
            id: 'field-1',
            linkId: 'test',
            type: 'text',
            label: 'Test',
          },
        ],
      };

      const created = await createQuestionnaire(medplum, formData);
      const deleted = await deleteQuestionnaire(medplum, created.id!);

      expect(deleted.item).toHaveLength(1);
      expect(deleted.title).toBe('To Delete');
    });
  });

  describe('hardDeleteQuestionnaire', () => {
    it('permanently deletes questionnaire', async () => {
      const formData: FormTemplate = {
        title: 'To Hard Delete',
        status: 'draft',
        fields: [],
      };

      const created = await createQuestionnaire(medplum, formData);
      await hardDeleteQuestionnaire(medplum, created.id!);

      await expect(getQuestionnaire(medplum, created.id!)).rejects.toThrow();
    });

    it('throws error when deleting non-existent questionnaire', async () => {
      await expect(hardDeleteQuestionnaire(medplum, 'non-existent-id')).rejects.toThrow();
    });
  });

  describe('cloneQuestionnaire', () => {
    it('creates a copy of questionnaire with new title', async () => {
      const originalData: FormTemplate = {
        title: 'Original Form',
        status: 'active',
        version: '1.0',
        fields: [
          {
            id: 'field-1',
            linkId: 'testField',
            type: 'text',
            label: 'Test Field',
          },
        ],
      };

      const original = await createQuestionnaire(medplum, originalData);
      const clone = await cloneQuestionnaire(medplum, original.id!, 'Cloned Form');

      expect(clone.id).not.toBe(original.id);
      expect(clone.title).toBe('Cloned Form');
      expect(clone.status).toBe('draft'); // New clones start as draft
      expect(clone.item).toHaveLength(1);
      expect(clone.item?.[0].linkId).toBe('testField');
    });

    it('preserves all field configurations in clone', async () => {
      const originalData: FormTemplate = {
        title: 'Complex Form',
        status: 'active',
        fields: [
          {
            id: 'field-1',
            linkId: 'email',
            type: 'text',
            label: 'Email',
            required: true,
            validation: {
              required: true,
              pattern: '^[a-z]+@example\\.com$',
            },
            styling: {
              fontSize: '16px',
              color: '#000000',
            },
          },
        ],
      };

      const original = await createQuestionnaire(medplum, originalData);
      const clone = await cloneQuestionnaire(medplum, original.id!, 'Complex Form (Copy)');

      const cloneFormData = questionnaireToFormTemplate(clone);
      expect(cloneFormData.fields[0].validation?.pattern).toBe('^[a-z]+@example\\.com$');
      expect(cloneFormData.fields[0].styling?.fontSize).toBe('16px');
    });

    it('resets version to 1.0 for cloned questionnaire', async () => {
      const originalData: FormTemplate = {
        title: 'Versioned Form',
        status: 'active',
        version: '3.5',
        fields: [],
      };

      const original = await createQuestionnaire(medplum, originalData);
      const clone = await cloneQuestionnaire(medplum, original.id!, 'Versioned Form (Copy)');

      expect(clone.version).toBe('1.0');
    });
  });

  describe('searchByCategory', () => {
    beforeEach(async () => {
      await createQuestionnaire(medplum, {
        title: 'Consent Form 1',
        status: 'active',
        category: ['consent'],
        fields: [],
      });

      await createQuestionnaire(medplum, {
        title: 'Consent Form 2',
        status: 'active',
        category: ['consent'],
        fields: [],
      });

      await createQuestionnaire(medplum, {
        title: 'Admission Form',
        status: 'active',
        category: ['admission'],
        fields: [],
      });
    });

    it('returns questionnaires matching category', async () => {
      const consentForms = await searchByCategory(medplum, 'consent');
      expect(consentForms.length).toBeGreaterThanOrEqual(2);
    });

    it('returns empty array for non-existent category', async () => {
      const results = await searchByCategory(medplum, 'non-existent-category');
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('handles questionnaire with no fields', async () => {
      const formData: FormTemplate = {
        title: 'Empty Form',
        status: 'draft',
        fields: [],
      };

      const result = await createQuestionnaire(medplum, formData);
      // Item can be either empty array or undefined for questionnaires with no fields
      expect(result.item === undefined || (Array.isArray(result.item) && result.item.length === 0)).toBe(true);
    });

    it('handles questionnaire with optional description', async () => {
      const formData: FormTemplate = {
        title: 'Minimal Form',
        status: 'draft',
        fields: [],
      };

      const result = await createQuestionnaire(medplum, formData);
      expect(result.description).toBeUndefined();
    });

    it('handles updating questionnaire without changing fields', async () => {
      const formData: FormTemplate = {
        title: 'Original',
        status: 'draft',
        fields: [
          {
            id: 'field-1',
            linkId: 'test',
            type: 'text',
            label: 'Test',
          },
        ],
      };

      const created = await createQuestionnaire(medplum, formData);
      const updated = await updateQuestionnaire(medplum, created.id!, {
        title: 'Updated Title Only',
        status: 'active',
        fields: formData.fields,
      });

      expect(updated.title).toBe('Updated Title Only');
      expect(updated.item).toHaveLength(1);
    });
  });
});
