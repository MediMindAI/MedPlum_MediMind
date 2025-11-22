// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { renderHook, act } from '@testing-library/react';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react-hooks';
import { MantineProvider } from '@mantine/core';
import { useFormBuilder } from './useFormBuilder';
import type { FieldConfig } from '../types/form-builder';

describe('useFormBuilder (T029-T030)', () => {
  let medplum: MockClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MantineProvider>
      <MedplumProvider medplum={medplum}>{children}</MedplumProvider>
    </MantineProvider>
  );

  beforeEach(() => {
    medplum = new MockClient();
    localStorage.clear();
    localStorage.setItem('emrLanguage', 'ka');
  });

  describe('Initialization', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      expect(result.current.state).toEqual({
        fields: [],
        selectedFieldId: null,
        title: '',
        description: '',
        status: 'draft',
      });
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });

    it('should initialize with provided initial state', () => {
      const initialState = {
        title: 'Consent Form',
        description: 'Patient consent form',
        status: 'active' as const,
      };

      const { result } = renderHook(() => useFormBuilder(initialState), { wrapper });

      expect(result.current.state.title).toBe('Consent Form');
      expect(result.current.state.description).toBe('Patient consent form');
      expect(result.current.state.status).toBe('active');
      expect(result.current.state.fields).toEqual([]);
    });
  });

  describe('Field Management', () => {
    it('should add a field and select it', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      const field: FieldConfig = {
        id: 'field-1',
        linkId: 'patient-name',
        type: 'text',
        label: 'Patient Name',
        required: true,
      };

      act(() => {
        result.current.actions.addField(field);
      });

      expect(result.current.state.fields).toHaveLength(1);
      expect(result.current.state.fields[0]).toEqual(field);
      expect(result.current.state.selectedFieldId).toBe('field-1');
      expect(result.current.canUndo).toBe(true);
    });

    it('should add multiple fields', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      const field1: FieldConfig = {
        id: 'field-1',
        linkId: 'first-name',
        type: 'text',
        label: 'First Name',
      };

      const field2: FieldConfig = {
        id: 'field-2',
        linkId: 'last-name',
        type: 'text',
        label: 'Last Name',
      };

      act(() => {
        result.current.actions.addField(field1);
        result.current.actions.addField(field2);
      });

      expect(result.current.state.fields).toHaveLength(2);
      expect(result.current.state.fields[0].id).toBe('field-1');
      expect(result.current.state.fields[1].id).toBe('field-2');
      expect(result.current.state.selectedFieldId).toBe('field-2');
    });

    it('should update a field', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      const field: FieldConfig = {
        id: 'field-1',
        linkId: 'patient-name',
        type: 'text',
        label: 'Patient Name',
      };

      act(() => {
        result.current.actions.addField(field);
      });

      const updatedField: FieldConfig = {
        ...field,
        label: 'Full Name',
        required: true,
      };

      act(() => {
        result.current.actions.updateField(updatedField);
      });

      expect(result.current.state.fields[0].label).toBe('Full Name');
      expect(result.current.state.fields[0].required).toBe(true);
      expect(result.current.canUndo).toBe(true);
    });

    it('should delete a field', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      const field1: FieldConfig = {
        id: 'field-1',
        linkId: 'first-name',
        type: 'text',
        label: 'First Name',
      };

      const field2: FieldConfig = {
        id: 'field-2',
        linkId: 'last-name',
        type: 'text',
        label: 'Last Name',
      };

      act(() => {
        result.current.actions.addField(field1);
        result.current.actions.addField(field2);
      });

      act(() => {
        result.current.actions.deleteField('field-1');
      });

      expect(result.current.state.fields).toHaveLength(1);
      expect(result.current.state.fields[0].id).toBe('field-2');
    });

    it('should clear selection when deleting selected field', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      const field: FieldConfig = {
        id: 'field-1',
        linkId: 'patient-name',
        type: 'text',
        label: 'Patient Name',
      };

      act(() => {
        result.current.actions.addField(field);
      });

      expect(result.current.state.selectedFieldId).toBe('field-1');

      act(() => {
        result.current.actions.deleteField('field-1');
      });

      expect(result.current.state.fields).toHaveLength(0);
      expect(result.current.state.selectedFieldId).toBeNull();
    });

    it('should reorder fields', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      const field1: FieldConfig = {
        id: 'field-1',
        linkId: 'first-name',
        type: 'text',
        label: 'First Name',
      };

      const field2: FieldConfig = {
        id: 'field-2',
        linkId: 'last-name',
        type: 'text',
        label: 'Last Name',
      };

      const field3: FieldConfig = {
        id: 'field-3',
        linkId: 'email',
        type: 'text',
        label: 'Email',
      };

      act(() => {
        result.current.actions.addField(field1);
        result.current.actions.addField(field2);
        result.current.actions.addField(field3);
      });

      // Move field at index 0 to index 2
      act(() => {
        result.current.actions.reorderFields(0, 2);
      });

      expect(result.current.state.fields[0].id).toBe('field-2');
      expect(result.current.state.fields[1].id).toBe('field-3');
      expect(result.current.state.fields[2].id).toBe('field-1');
    });

    it('should select a field', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      const field1: FieldConfig = {
        id: 'field-1',
        linkId: 'first-name',
        type: 'text',
        label: 'First Name',
      };

      const field2: FieldConfig = {
        id: 'field-2',
        linkId: 'last-name',
        type: 'text',
        label: 'Last Name',
      };

      act(() => {
        result.current.actions.addField(field1);
        result.current.actions.addField(field2);
      });

      act(() => {
        result.current.actions.selectField('field-1');
      });

      expect(result.current.state.selectedFieldId).toBe('field-1');
    });

    it('should deselect field when null is passed', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      const field: FieldConfig = {
        id: 'field-1',
        linkId: 'patient-name',
        type: 'text',
        label: 'Patient Name',
      };

      act(() => {
        result.current.actions.addField(field);
      });

      expect(result.current.state.selectedFieldId).toBe('field-1');

      act(() => {
        result.current.actions.selectField(null);
      });

      expect(result.current.state.selectedFieldId).toBeNull();
    });
  });

  describe('Form Metadata', () => {
    it('should set form title', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      act(() => {
        result.current.actions.setTitle('Consent Form');
      });

      expect(result.current.state.title).toBe('Consent Form');
      expect(result.current.canUndo).toBe(true);
    });

    it('should set form description', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      act(() => {
        result.current.actions.setDescription('Patient consent form for medical procedures');
      });

      expect(result.current.state.description).toBe('Patient consent form for medical procedures');
      expect(result.current.canUndo).toBe(true);
    });

    it('should set form status', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      act(() => {
        result.current.actions.setStatus('active');
      });

      expect(result.current.state.status).toBe('active');
      expect(result.current.canUndo).toBe(true);
    });
  });

  describe('Undo/Redo Functionality', () => {
    it('should undo field addition', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      const field: FieldConfig = {
        id: 'field-1',
        linkId: 'patient-name',
        type: 'text',
        label: 'Patient Name',
      };

      act(() => {
        result.current.actions.addField(field);
      });

      expect(result.current.state.fields).toHaveLength(1);
      expect(result.current.canUndo).toBe(true);

      act(() => {
        result.current.undo();
      });

      expect(result.current.state.fields).toHaveLength(0);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);
    });

    it('should redo field addition', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      const field: FieldConfig = {
        id: 'field-1',
        linkId: 'patient-name',
        type: 'text',
        label: 'Patient Name',
      };

      act(() => {
        result.current.actions.addField(field);
        result.current.undo();
      });

      expect(result.current.state.fields).toHaveLength(0);
      expect(result.current.canRedo).toBe(true);

      act(() => {
        result.current.redo();
      });

      expect(result.current.state.fields).toHaveLength(1);
      expect(result.current.state.fields[0]).toEqual(field);
      expect(result.current.canRedo).toBe(false);
    });

    it('should handle multiple undo operations', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      act(() => {
        result.current.actions.setTitle('Form 1');
        result.current.actions.setDescription('Description 1');
        result.current.actions.setStatus('active');
      });

      expect(result.current.state.title).toBe('Form 1');
      expect(result.current.state.description).toBe('Description 1');
      expect(result.current.state.status).toBe('active');

      act(() => {
        result.current.undo();
      });

      expect(result.current.state.status).toBe('draft');

      act(() => {
        result.current.undo();
      });

      expect(result.current.state.description).toBe('');

      act(() => {
        result.current.undo();
      });

      expect(result.current.state.title).toBe('');
    });

    it('should clear redo history on new action', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      const field: FieldConfig = {
        id: 'field-1',
        linkId: 'patient-name',
        type: 'text',
        label: 'Patient Name',
      };

      act(() => {
        result.current.actions.addField(field);
        result.current.undo();
      });

      expect(result.current.canRedo).toBe(true);

      act(() => {
        result.current.actions.setTitle('New Form');
      });

      expect(result.current.canRedo).toBe(false);
    });

    it('should not record history for field selection', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      const field: FieldConfig = {
        id: 'field-1',
        linkId: 'patient-name',
        type: 'text',
        label: 'Patient Name',
      };

      act(() => {
        result.current.actions.addField(field);
      });

      const undoCountAfterAdd = result.current.canUndo;

      act(() => {
        result.current.actions.selectField('field-1');
        result.current.actions.selectField(null);
        result.current.actions.selectField('field-1');
      });

      // Selection changes should not add to undo history
      expect(result.current.canUndo).toBe(undoCountAfterAdd);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      act(() => {
        result.current.actions.setTitle('Test Form');
        result.current.actions.setDescription('Test Description');
        result.current.actions.addField({
          id: 'field-1',
          linkId: 'test',
          type: 'text',
          label: 'Test Field',
        });
      });

      expect(result.current.state.fields).toHaveLength(1);
      expect(result.current.canUndo).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.state.fields).toHaveLength(0);
      expect(result.current.state.title).toBe('');
      expect(result.current.state.description).toBe('');
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });

    it('should reset to provided state', () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      act(() => {
        result.current.reset({
          title: 'New Form',
          description: 'New Description',
          status: 'active',
        });
      });

      expect(result.current.state.title).toBe('New Form');
      expect(result.current.state.description).toBe('New Description');
      expect(result.current.state.status).toBe('active');
      expect(result.current.canUndo).toBe(false);
    });
  });

  describe('Save Functionality', () => {
    it('should save form and return FormTemplate', async () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      act(() => {
        result.current.actions.setTitle('Consent Form');
        result.current.actions.setDescription('Patient consent form');
        result.current.actions.addField({
          id: 'field-1',
          linkId: 'patient-signature',
          type: 'signature',
          label: 'Patient Signature',
          required: true,
        });
      });

      let savedForm;
      await act(async () => {
        savedForm = await result.current.save(medplum);
      });

      expect(savedForm).toMatchObject({
        title: 'Consent Form',
        description: 'Patient consent form',
        status: 'draft',
        fields: expect.arrayContaining([
          expect.objectContaining({
            id: 'field-1',
            linkId: 'patient-signature',
            type: 'signature',
            label: 'Patient Signature',
            required: true,
          }),
        ]),
      });
    });

    it('should save form with default title if empty', async () => {
      const { result } = renderHook(() => useFormBuilder(), { wrapper });

      let savedForm;
      await act(async () => {
        savedForm = await result.current.save(medplum);
      });

      expect(savedForm).toMatchObject({
        title: 'Untitled Form',
        status: 'draft',
        fields: [],
      });
    });
  });
});
